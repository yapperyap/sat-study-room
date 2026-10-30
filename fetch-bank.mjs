#!/usr/bin/env node
/**
 * Fetch every SAT question from the College Board Educator Question Bank.
 *
 * Node port of fetch_sat_questions.py (no Python on this machine). Same flow:
 *   1. POST /get-questions -> metadata list (has external_id / ibn)
 *   2. POST /get-question  -> full content, one call per id (no batch endpoint)
 *
 * Usage
 *   node fetch_sat_questions.mjs                       # RW + Math, all domains
 *   node fetch_sat_questions.mjs --test 1              # Reading & Writing only
 *   node fetch_sat_questions.mjs --list-file list.json # reuse a metadata list
 *   node fetch_sat_questions.mjs --workers 16 --out questions.json
 *
 * Output
 *   questions.jsonl  -> one JSON object per line, written incrementally (resumable)
 *   questions.json   -> merged array, each record with a `content` field
 */

import fs from "node:fs";

const API =
  "https://qbank-api.collegeboard.org/msreportingquestionbank-prod/questionbank/digital";
const LIST_URL = `${API}/get-questions`;
const ITEM_URL = `${API}/get-question`;

const HEADERS = {
  accept: "application/json, text/plain, */*",
  "content-type": "application/json",
  origin: "https://satsuiteeducatorquestionbank.collegeboard.org",
  referer: "https://satsuiteeducatorquestionbank.collegeboard.org/",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
};

// test 1 = Reading & Writing, test 2 = Math
const DOMAINS = { 1: "INI,CAS,EOI,SEC", 2: "H,P,Q,S" };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseArgs(argv) {
  const a = {
    test: [],
    listFile: null,
    out: "questions.json",
    jsonl: "questions.jsonl",
    workers: 8,
    limit: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === "--test") a.test.push(Number(argv[++i]));
    else if (v === "--list-file") a.listFile = argv[++i];
    else if (v === "--out") a.out = argv[++i];
    else if (v === "--jsonl") a.jsonl = argv[++i];
    else if (v === "--workers") a.workers = Number(argv[++i]);
    else if (v === "--limit") a.limit = Number(argv[++i]);
    else {
      console.error(`unknown argument: ${v}`);
      process.exit(2);
    }
  }
  return a;
}

async function post(url, payload, retries = 5, timeoutMs = 30000) {
  const body = JSON.stringify(payload);
  let last;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: HEADERS,
        body,
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      last = e;
      // exponential backoff + jitter; be polite on 429/5xx
      await sleep(2 ** attempt * 600 + Math.random() * 400);
    }
  }
  throw new Error(`failed after ${retries} tries: ${last?.message ?? last}`);
}

async function getList(tests) {
  const out = [];
  for (const t of tests) {
    const data = await post(LIST_URL, { asmtEventId: 99, test: t, domain: DOMAINS[t] });
    console.log(`[list] test=${t}: ${data.length} questions`);
    out.push(...data);
  }
  return out;
}

/**
 * Everything goes in external_id -- including IBN items, whose `ibn` string IS
 * the external_id value. There is no {ibn: ...} payload shape; sending one gets
 * HTTP 500 VALIDATION_ERROR ("Misssing external_id"). The site's own bundle
 * agrees: getLegacyQuestionData(ibn) posts {external_id: ibn} to this endpoint.
 *
 * IBN items come back in a different shape -- {item_id, section, prompt,
 * answer:{choices, correct_choice, rationale}} -- than external_id items, which
 * return {stem, stimulus, answerOptions, correct_answer, rationale}.
 */
function keyFor(item) {
  const ibn = (item.ibn ?? "").trim();
  return { external_id: item.external_id ?? ibn };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  let items;
  if (args.listFile) {
    items = JSON.parse(fs.readFileSync(args.listFile, "utf-8"));
    console.log(`[list] loaded ${items.length} questions from ${args.listFile}`);
  } else {
    items = await getList(args.test.length ? args.test : [1, 2]);
  }
  if (args.limit) items = items.slice(0, args.limit);

  // Resume: only a record that actually carries content counts as done. Failed
  // records are dropped from the jsonl so a rerun retries them, rather than
  // baking the error placeholder into the final output.
  const done = new Set();
  if (fs.existsSync(args.jsonl)) {
    const keep = [];
    let dropped = 0;
    for (const line of fs.readFileSync(args.jsonl, "utf-8").split("\n")) {
      if (!line.trim()) continue;
      let rec;
      try {
        rec = JSON.parse(line);
      } catch {
        continue;
      }
      if (rec.content && !done.has(rec.questionId)) {
        done.add(rec.questionId);
        keep.push(line);
      } else if (!rec.content) {
        dropped++;
      }
    }
    fs.writeFileSync(args.jsonl, keep.length ? keep.join("\n") + "\n" : "");
    console.log(
      `[resume] ${done.size} already fetched` +
        (dropped ? `, ${dropped} failed -> retrying` : "")
    );
  }

  const todo = items.filter((i) => !done.has(i.questionId));
  console.log(`[fetch] ${todo.length} to go, ${args.workers} workers`);

  const fd = fs.openSync(args.jsonl, "a");
  let n = 0;
  let err = 0;
  let cursor = 0;

  async function worker() {
    while (cursor < todo.length) {
      const item = todo[cursor++];
      let rec;
      try {
        rec = { ...item, content: await post(ITEM_URL, keyFor(item)) };
      } catch (e) {
        err++;
        rec = { ...item, content: null, error: String(e.message ?? e) };
      }
      fs.writeSync(fd, JSON.stringify(rec) + "\n");
      n++;
      if (n % 25 === 0 || n === todo.length) {
        console.log(`  ${n}/${todo.length}  errors=${err}`);
      }
      await sleep(150); // gentle pacing per worker
    }
  }

  await Promise.all(Array.from({ length: args.workers }, worker));
  fs.closeSync(fd);

  // collapse jsonl -> single json array
  const all = [];
  for (const line of fs.readFileSync(args.jsonl, "utf-8").split("\n")) {
    if (line.trim()) all.push(JSON.parse(line));
  }
  fs.writeFileSync(args.out, JSON.stringify(all, null, 2));

  console.log(`\nDone. ${all.length} questions -> ${args.out} (${err} errors)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
