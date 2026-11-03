'use strict';
(()=>{
const button=document.getElementById('cacheSiteBtn'),status=document.getElementById('cacheSiteStatus');
if(location.protocol==='file:'||window.localBankReady){button.disabled=true;status.textContent='This downloaded local version already works offline.';return;}
if(!('serviceWorker' in navigator)||!window.isSecureContext){button.disabled=true;status.textContent='Offline caching requires a supported browser and HTTPS. You can download the local version below.';return;}
let registration;
const ready=navigator.serviceWorker.register('sw.js').then(async r=>{registration=r;return navigator.serviceWorker.ready;});
ready.catch(()=>{status.textContent='Offline access could not be initialized. Try again or download the local version below.';});
button.onclick=async()=>{
button.disabled=true;status.textContent='Preparing offline access…';
try{
await ready;
const worker=registration.active;if(!worker)throw Error('The offline worker is not ready. Try again.');
const channel=new MessageChannel();
await new Promise((resolve,reject)=>{
const timeout=setTimeout(()=>{channel.port1.close();reject(Error('Caching timed out. Please try again.'));},600000);
channel.port1.onmessage=({data})=>{
if(data.type==='progress')status.textContent=`Caching site: ${data.done} of ${data.total} files…`;
if(data.type==='complete'){clearTimeout(timeout);channel.port1.close();resolve();}
if(data.type==='error'){clearTimeout(timeout);channel.port1.close();reject(Error(data.message));}
};worker.postMessage({type:'CACHE_SITE'},[channel.port2]);
});
status.textContent='Site cached. You can now reopen this address offline. Desmos may require an internet connection. Your browser may remove cached files if storage is cleared or space is needed.';button.textContent='Cache Site Again';
}catch(error){status.textContent='Could not finish caching. '+error.message+' Check your connection and available storage, then try again.';}
finally{button.disabled=false;}
};
})();
