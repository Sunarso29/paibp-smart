(() => {
  "use strict";
  document.querySelectorAll('[data-year]').forEach((el)=>{if(!el.textContent.trim())el.textContent=new Date().getFullYear();});
  // Ensure the lightweight multimapel bundle is the only source used by the browser.
  document.documentElement.dataset.portalBuild='34-light';
})();
