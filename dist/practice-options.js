'use strict';
(()=>{
 const dialog=$('#filtersDialog'),prompt=$('#unsavedFiltersDialog');let snapshot='';
 const serialize=()=>JSON.stringify([...dialog.querySelectorAll('input')].map(e=>[e.dataset.topic||e.name||e.id,e.checked]));
 const dirty=()=>dialog.open&&snapshot!==serialize();
 const originalOpen=$('#filtersBtn').onclick;$('#filtersBtn').onclick=()=>{originalOpen();snapshot=serialize()};
 const close=dialog.close.bind(dialog);dialog.close=()=>{if(dirty()){if(!prompt.open)prompt.showModal();$('#saveFilterExit').focus()}else close()};
 dialog.addEventListener('cancel',e=>{e.preventDefault();dialog.close()});
 $('#cancelFilterExit').onclick=()=>prompt.close();
 $('#saveFilterExit').onclick=()=>{prompt.close();$('#applyFilters').click()};
 document.addEventListener('filterssaved',()=>snapshot=serialize());
 window.addEventListener('beforeunload',e=>{if(dirty()){e.preventDefault();e.returnValue=''}});
})();
