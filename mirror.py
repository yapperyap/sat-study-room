#!/usr/bin/env python3
"""Build an independent static mirror from the public SAT Study Room release."""
import base64, gzip, hashlib, html, json, os, re, shutil, sys, time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlsplit, unquote
from urllib.request import Request, urlopen
from html.parser import HTMLParser

ORIGIN = 'https://sat-study-room.chalkydaisy5.chatgpt.site/'
OUT = Path('_site')

def fetch(path):
    url = urljoin(ORIGIN, path)
    if urlsplit(url).netloc != urlsplit(ORIGIN).netloc:
        raise ValueError('Only same-origin assets may be mirrored')
    for attempt in range(3):
        try:
            with urlopen(Request(url, headers={'User-Agent': 'SAT-Study-Room-Pages-Mirror/1.0', 'Cache-Control': 'no-cache'}), timeout=90) as response:
                if urlsplit(response.url).netloc != urlsplit(ORIGIN).netloc:
                    raise ValueError('Unexpected source redirect')
                return response.read()
        except Exception:
            if attempt == 2: raise
            time.sleep(2 ** attempt)

class Assets(HTMLParser):
    def __init__(self): super().__init__(); self.paths = set()
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ('script', 'img', 'source') and a.get('src'): self.paths.add(a['src'])
        if tag == 'link' and a.get('rel') in ('stylesheet', 'icon', 'preload', 'manifest') and a.get('href'): self.paths.add(a['href'])

def build(read=fetch):
    # The public portable release contains a validated, complete bank in one request.
    # Recreate normal JSON files so Pages runs the standard, lazily loaded app.
    bundle = read('sat-study-room-local.html')
    m = re.search(rb'<script\s+id="localData"\s+type="application/json">([A-Za-z0-9+/=\s]+)</script>', bundle)
    if not m: raise ValueError('Portable release has no embedded bank; refusing to replace the last good deployment')
    bank = json.loads(gzip.decompress(base64.b64decode(m[1], validate=False)))
    index = bank['index']; questions = bank['questions']
    if not index.get('questions'): raise ValueError('Empty source question bank')
    for entry in index['questions']:
        qid = entry['id']
        if not re.fullmatch(r'[A-Za-z0-9_-]+', qid) or qid not in questions:
            raise ValueError('Incomplete or unsafe question bank')
    page = read('index.html').decode('utf-8')
    if re.search(r'<meta[^>]+http-equiv=["\']refresh', page, re.I): raise ValueError('Source is a redirect')
    if 'id="questionLayout"' not in page: raise ValueError('Source application markup missing')
    # Fetch referenced local assets rather than using a stale fixed file list.
    files = {'index.html': page.encode(), 'sat-study-room-local.html': bundle}
    pending = ['legal.html', 'source-manifest.json']
    parser = Assets(); parser.feed(page); pending.extend(parser.paths)
    while pending:
        raw = pending.pop()
        u = urlsplit(urljoin(ORIGIN, raw))
        if u.netloc != urlsplit(ORIGIN).netloc or u.scheme not in ('http', 'https'): continue
        path = unquote(u.path).lstrip('/')
        if not path or '..' in Path(path).parts or path in files: continue
        data = read(path); files[path] = data
        if path.endswith('.html'):
            parser = Assets(); parser.feed(data.decode()); pending.extend(parser.paths)
        if path.endswith('.css'):
            for ref in re.findall(r'url\(["\']?([^\)"\']+)', data.decode()):
                pending.append(urljoin(path, ref))
    # Ensure the live index and embedded release agree during a source deployment.
    live_index = json.loads(read('index.json'))
    if live_index != index: raise ValueError('Source publication is in progress; bank versions differ; retry next run')
    shutil.rmtree(OUT, ignore_errors=True); OUT.mkdir()
    for path, data in files.items():
        dest = OUT / path; dest.parent.mkdir(parents=True, exist_ok=True); dest.write_bytes(data)
    (OUT / 'index.json').write_text(json.dumps(index, separators=(',', ':')))
    (OUT / 'questions').mkdir()
    for qid, question in questions.items():
        if not re.fullmatch(r'[A-Za-z0-9_-]+', qid): raise ValueError('Unsafe question ID')
        (OUT / 'questions' / (qid + '.json')).write_text(json.dumps(question, separators=(',', ':')))
    digest = hashlib.sha256()
    for path in sorted(OUT.rglob('*')):
        if path.is_file(): digest.update(path.relative_to(OUT).as_posix().encode()); digest.update(path.read_bytes())
    state = {'source': ORIGIN, 'sha256': digest.hexdigest(), 'questions': len(index['questions']), 'mirrored_at': datetime.now(timezone.utc).isoformat()}
    (OUT / 'mirror-state.json').write_text(json.dumps(state))
    (OUT / '.nojekyll').touch()
    print(json.dumps(state))

if __name__ == '__main__': build()
