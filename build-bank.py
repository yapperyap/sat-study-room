import json, pathlib,collections,datetime,re
root=pathlib.Path(__file__).parent/'dist'; (root/'questions').mkdir(exist_ok=True)
records=[json.loads(l) for l in open('/tmp/sat-all.jsonl') if l.strip()]
index=[]; gaps=[]; seen=set()
for q in records:
 c=q.get('content')
 if not c: continue
 qid=q['questionId']; assert qid not in seen; seen.add(qid)
 assert re.fullmatch('[a-zA-Z0-9_-]+',qid)
 subject='Reading and Writing' if q['primary_class_cd'] in ['INI','CAS','EOI','SEC'] else 'Math'
 index.append(dict(id=qid,subject=subject,domain=q['primary_class_cd_desc'],skill=('Cross-Text Connections' if q['skill_cd']=='CTC' or q['skill_desc'].lower()=='cross-text connections' else q['skill_desc']),difficulty=q['difficulty'],externalId=q.get('external_id') or q.get('ibn')))
 if 'answer' in c:
  a=c['answer']; choices=a.get('choices') or {}; options=[v.get('body','') if isinstance(v,dict) else v for k,v in sorted(choices.items())]
  correct=a.get('correct_choice') or []
  if isinstance(correct,str):correct=[correct.upper()]
  passage=c.get('body','') if c.get('prompt') else ''
  stem=c.get('prompt') or c.get('body') or ''
  rationale=a.get('rationale') or c.get('rationale','')
 else:
  options=[o.get('content','') for o in c.get('answerOptions',[])];correct=c.get('correct_answer') or []
  if isinstance(correct,str):correct=[correct]
  passage=c.get('stimulus') or '';stem=c.get('stem') or '';rationale=c.get('rationale') or ''
  if not correct and c.get('keys') and options:correct=[chr(65+i) for i,o in enumerate(c['answerOptions']) if o.get('id') in c['keys']]
 if not correct and options:
  m=re.search(r'Choice\s+([A-D])\s+is\s+(?:the\s+)?(?:correct|best)',re.sub('<[^>]+>',' ',rationale),re.I)
  if m:correct=[m.group(1).upper()]
 if not correct:gaps.append(qid)
 data=dict(id=qid,passage=passage,stem=stem,options=options,correct=[str(v).upper() for v in correct],rationale=rationale)
 (root/'questions'/f'{qid}.json').write_text(json.dumps(data,ensure_ascii=False))
index.sort(key=lambda q:(q['subject']!='Reading and Writing',q['domain'],q['skill'],q['id']))
(root/'index.json').write_text(json.dumps(dict(retrieved='October 28, 2026',source='https://satsuiteeducatorquestionbank.collegeboard.org/',expected=3770,missing=3770-len(index),questions=index),ensure_ascii=False))
(root/'source-manifest.json').write_text(json.dumps(dict(source='https://satsuiteeducatorquestionbank.collegeboard.org/',api='https://qbank-api.collegeboard.org/msreportingquestionbank-prod/questionbank/digital',retrieved='2026-10-28',questions=len(index),counts=dict(collections.Counter(q['subject'] for q in index)),missing_content=3770-len(index),no_structured_answer=gaps),indent=2))
print(json.dumps({'questions':len(index),'no_structured_answer':len(gaps),'counts':dict(collections.Counter(q['subject'] for q in index))}))
