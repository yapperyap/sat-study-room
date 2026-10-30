# SAT Study Room

Browser-based SAT practice interface with topic filters, answer review, elimination, themes, a calculator popup, and progress saved on the device.

## Run locally

Requires Python 3. From the repository root:

```sh
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. Serve over HTTP rather than opening index.html directly because the application fetches JSON files.

## Question data

This source release excludes College Board questions, passages, answer explanations, images, the generated bank index, and the self-contained HTML download that embeds that content. The supplied index is empty. Add data only when you have the necessary permissions.

The application expects `dist/index.json` with a `questions` array containing entries with `id`, `subject`, `domain`, `skill`, `difficulty`, and optionally `externalId`. Each entry loads `dist/questions/<id>.json` containing `id`, `passage`, `stem`, `options`, `correct`, and `rationale`. Passage, stem, options, and rationale use HTML strings; correct answers use an array of strings.

`build-bank.py` converts a locally supplied `/tmp/sat-all.jsonl` into these files. `build-local.py` builds the portable HTML after data is supplied. Review the scripts before running; the acquisition script is provided as source and does not grant content rights.

## License and credits

Original application code: MIT, see LICENSE. The MIT license does not grant rights to third-party content, services, trademarks, or dependencies. SAT and Bluebook names refer to College Board products; this independent project is not affiliated with or endorsed by College Board.

Credits: https://github.com/yapperyap
