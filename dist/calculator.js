'use strict';
(() => {
  const button=document.querySelector('#calculatorBtn'),panel=document.querySelector('#calculatorWindow'),frame=document.querySelector('#calculatorFrame'),handle=document.querySelector('#calculatorHandle'),size=document.querySelector('#calculatorSize');
  // Load the official embed in the background so Desmos can use its own browser cache.
  const preload=()=>{if(navigator.onLine&&!frame.hasAttribute('src'))frame.src='https://www.desmos.com/testing/collegeboard/graphing'};
  if('requestIdleCallback' in window)requestIdleCallback(preload,{timeout:3000});else setTimeout(preload,1500);
  window.addEventListener('online',preload);
  let math=document.querySelector('#sectionTitle').textContent==='Math';button.hidden=!math;
  function close(restore=true){panel.hidden=true;button.setAttribute('aria-expanded','false');if(restore&&!button.hidden)button.focus()}
  function fit(){const r=panel.getBoundingClientRect();panel.style.left=Math.max(8,Math.min(r.left,innerWidth-r.width-8))+'px';panel.style.top=Math.max(8,Math.min(r.top,innerHeight-r.height-8))+'px';panel.style.right='auto'}
  button.onclick=()=>{if(!panel.hidden){close();return}if(!math)return;if(!frame.hasAttribute('src'))frame.src='https://www.desmos.com/testing/collegeboard/graphing';panel.hidden=false;button.setAttribute('aria-expanded','true');fit();document.querySelector('#calculatorClose').focus()};
  document.querySelector('#calculatorClose').onclick=()=>close();
  size.onclick=()=>{const expanded=panel.classList.toggle('expanded');size.setAttribute('aria-pressed',String(expanded));size.setAttribute('aria-label',expanded?'Restore calculator size':'Expand calculator');panel.style.width='';panel.style.height='';fit()};
  document.addEventListener('questionchange',e=>{math=e.detail.subject==='Math';button.hidden=!math;if(!math)close(false)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){e.preventDefault();close()}});
  let resizing=null;
  function resizeTo(r,corner,dx,dy){const west=corner.includes('w'),north=corner.includes('n');let left=west?Math.max(8,Math.min(r.left+dx,r.right-Math.min(320,innerWidth-16))):r.left;let top=north?Math.max(8,Math.min(r.top+dy,r.bottom-Math.min(330,innerHeight-16))):r.top;const right=west?r.right:Math.max(left+Math.min(320,innerWidth-16),Math.min(innerWidth-8,r.right+dx));const bottom=north?r.bottom:Math.max(top+Math.min(330,innerHeight-16),Math.min(innerHeight-8,r.bottom+dy));panel.classList.remove('expanded');size.setAttribute('aria-pressed','false');size.setAttribute('aria-label','Expand calculator');Object.assign(panel.style,{left:left+'px',top:top+'px',right:'auto',width:(right-left)+'px',height:(bottom-top)+'px'})}
  document.querySelectorAll('.calculator-resize').forEach(resize=>{
    resize.onpointerdown=e=>{if(e.button!==0)return;resizing={x:e.clientX,y:e.clientY,r:panel.getBoundingClientRect(),corner:resize.dataset.corner};resize.setPointerCapture(e.pointerId);panel.classList.add('moving');e.preventDefault()};
    resize.onpointermove=e=>{if(resizing)resizeTo(resizing.r,resizing.corner,e.clientX-resizing.x,e.clientY-resizing.y)};
    resize.onlostpointercapture=resize.onpointerup=()=>{resizing=null;panel.classList.remove('moving')};
    resize.onkeydown=e=>{const delta={ArrowRight:[20,0],ArrowLeft:[-20,0],ArrowDown:[0,20],ArrowUp:[0,-20]}[e.key];if(delta){e.preventDefault();resizeTo(panel.getBoundingClientRect(),resize.dataset.corner,...delta)}};
  });
  let drag=null;
  handle.addEventListener('pointerdown',e=>{if(e.target.closest('button,a')||e.button!==0)return;const r=panel.getBoundingClientRect();drag={x:e.clientX-r.left,y:e.clientY-r.top};handle.setPointerCapture(e.pointerId);panel.classList.add('moving');e.preventDefault()});
  handle.addEventListener('pointermove',e=>{if(!drag)return;panel.style.left=Math.max(8,Math.min(e.clientX-drag.x,innerWidth-panel.offsetWidth-8))+'px';panel.style.top=Math.max(8,Math.min(e.clientY-drag.y,innerHeight-panel.offsetHeight-8))+'px';panel.style.right='auto'});
  function end(){drag=null;panel.classList.remove('moving')}
  handle.addEventListener('pointerup',end);handle.addEventListener('lostpointercapture',end);
  window.addEventListener('resize',()=>{if(!panel.hidden)fit()});
})();
