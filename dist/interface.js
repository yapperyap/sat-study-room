'use strict';
(()=>{
const slider=document.querySelector('#interfaceScale'),value=document.querySelector('#interfaceScaleValue');
function apply(){const n=Number(state.interfaceScale);state.interfaceScale=Number.isFinite(n)?Math.max(75,Math.min(150,n)):100;const scale=state.interfaceScale/100;document.documentElement.style.setProperty('--interface-scale',scale);slider.value=state.interfaceScale;value.textContent=state.interfaceScale+'%';}
slider.oninput=()=>{state.interfaceScale=Number(slider.value);apply();persist()};document.querySelector('#resetInterfaceScale').onclick=()=>{state.interfaceScale=100;apply();persist()};apply();
})();
