'use strict';
const CACHE='sat-study-room-offline-v1';
const APP=['./','index.html','style.css','app.js','appearance.js','calculator.js','interface.js','practice-options.js','offline.js','legal.html','legal.js','index.json','source-manifest.json'];
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
let caching;
async function cacheSite(port){
const cache=await caches.open(CACHE);
const response=await fetch(new URL('index.json',self.registration.scope),{cache:'reload'});
if(!response.ok)throw Error('Question bank could not be downloaded.');
const bank=await response.json();
const paths=[...APP,...bank.questions.map(q=>'questions/'+encodeURIComponent(q.id)+'.json')];
let next=0,done=0;
port.postMessage({type:'progress',done,total:paths.length});
await Promise.all(Array.from({length:8},async()=>{
while(next<paths.length){
const url=new URL(paths[next++],self.registration.scope);
const result=await fetch(url,{cache:'reload'});if(!result.ok)throw Error('A site file could not be downloaded.');
await cache.put(url,result);done++;if(done%25===0||done===paths.length)port.postMessage({type:'progress',done,total:paths.length});
}
}));
}
self.addEventListener('message',event=>{
if(event.data?.type!=='CACHE_SITE'||!event.ports[0])return;
const port=event.ports[0];
if(caching){port.postMessage({type:'error',message:'Caching is already running in another tab.'});return;}
caching=cacheSite(port).then(()=>port.postMessage({type:'complete'})).catch(error=>port.postMessage({type:'error',message:error.message})).finally(()=>{caching=null;port.close();});
event.waitUntil(caching);
});
self.addEventListener('fetch',event=>{
const url=new URL(event.request.url);
if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
event.respondWith(fetch(event.request).catch(async()=>{
const cache=await caches.open(CACHE);
const cached=await cache.match(event.request,{ignoreSearch:true});
if(cached)return cached;
if(event.request.mode==='navigate')return (await cache.match(new URL('index.html',self.registration.scope)))||Response.error();
return Response.error();
}));
});
