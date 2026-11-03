from pathlib import Path
import json,re
root=Path(__file__).parent/'dist'
index=json.loads((root/'index.json').read_text())
assert len(index['questions'])>0, 'Empty question bank'
ids=set()
for q in index['questions']:
    qid=q['id']
    assert re.fullmatch(r'[A-Za-z0-9_-]+',qid), 'Unsafe question ID'
    assert qid not in ids, 'Duplicate question ID'
    ids.add(qid)
    data=json.loads((root/'questions'/(qid+'.json')).read_text())
    assert data['id']==qid, 'Question ID mismatch'
    assert data.get('stem'), 'Missing question content'
for path in root.glob('*'):
    if path.suffix in ('.html','.js','.css','.json'):
        assert 'chatgpt.site' not in path.read_text(), f'Hosted URL in {path.name}'
assert 'id="questionLayout"' in (root/'index.html').read_text()
print(f'Validated {len(ids)} questions and static application files')
