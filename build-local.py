from pathlib import Path
import json,re,gzip,base64
root=Path(__file__).parent/'dist'
s=(root/'index.html').read_text()
s=s.replace("script-src 'self'", "script-src 'self' 'unsafe-inline'")
s=s.replace('<link rel="stylesheet" href="style.css">','<style>'+(root/'style.css').read_text()+'</style>')
bank=json.loads((root/'index.json').read_text())
questions={p.stem:json.loads(p.read_text()) for p in (root/'questions').glob('*.json')}
data=base64.b64encode(gzip.compress(json.dumps({'index':bank,'questions':questions},separators=(',',':')).encode(),mtime=0)).decode()
s=s.replace('<script src="app.js"></script>','<script id="localData" type="application/json">'+data+'</script><script>document.querySelector(".brand").href=location.pathname;window.localBankReady=(async()=>{const bytes=Uint8Array.from(atob(document.getElementById("localData").textContent),c=>c.charCodeAt(0));const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));window.localBank=JSON.parse(await new Response(stream).text());document.getElementById("localData").remove()})();</script><script src="app.js"></script>')
for name in ['app.js','appearance.js','calculator.js','interface.js','practice-options.js','offline.js']:
 code=(root/name).read_text()
 if name=='app.js':
  code=code.replace('async function init(){try{', 'async function init(){try{await window.localBankReady;')
  code=code.replace("const r=await fetch('index.json');", "const r={ok:true,json:async()=>window.localBank.index};")
  code=code.replace("const r=await fetch('questions/'+q.id+'.json');", "const r={ok:!!window.localBank.questions[q.id],json:async()=>window.localBank.questions[q.id]};")
 s=s.replace('<script src="'+name+'"></script>','<script>'+code.replace('</script','<\\/script')+'</script>')
legal=(root/'legal.html').read_text()
legal=re.search(r'<main[^>]*>(.*?)</main>',legal,re.S).group(1)
legal=re.sub(r'id="([^"]+)"',r'id="offline-\1"',legal)
s=s.replace('</body>','<dialog id="offlineLegal" style="max-width:850px;max-height:85vh;overflow:auto;padding:24px"><form method="dialog"><button>Close legal information</button></form>'+legal+'</dialog><script>document.querySelectorAll(\'a[href^="legal.html"]\').forEach(a=>a.addEventListener("click",e=>{e.preventDefault();const d=document.getElementById("offlineLegal");d.showModal();const id=a.getAttribute("href").split("#")[1];if(id)document.getElementById("offline-"+id)?.scrollIntoView()}));</script></body>')
s=s.replace('href="sat-study-room-local.html"','href="#" id="downloadLocalAgain"')
s=s.replace('href="./"','href="sat-study-room-local.html"')
s=s.replace('</body>','<script>document.getElementById("downloadLocalAgain").onclick=e=>{e.preventDefault();const a=document.createElement("a");a.href=location.href;a.download="sat-study-room-local.html";a.click()};</script></body>')
(root/'sat-study-room-local.html').write_text(s)
print('Built single-file local app:',len(s.encode()),'bytes;',len(questions),'questions')
