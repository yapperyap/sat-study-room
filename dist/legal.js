'use strict';
let preference='system';try{preference=JSON.parse(localStorage.getItem('sat-room-v1'))?.theme||'system'}catch{}
const media=matchMedia('(prefers-color-scheme: dark)');function apply(){const dark=preference==='dark'||preference==='system'&&media.matches;document.body.classList.toggle('dark',dark);document.documentElement.style.colorScheme=dark?'dark':'light'}apply();media.addEventListener('change',apply);
