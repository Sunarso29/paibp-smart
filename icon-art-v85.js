(() => {
  "use strict";
  /* Compatibility shim: V85 observer removed. Load the lightweight V86 icon runtime once. */
  if (window.PAIBP_ICON_ART_V86) { window.PAIBP_ICON_ART_V86.run?.(); return; }
  if ([...document.scripts].some(s => String(s.src||'').includes('icon-art-v86.js'))) return;
  const script=document.createElement('script');
  script.src=new URL('icon-art-v86.js?v=86',document.baseURI).href;
  script.defer=true;
  document.head.append(script);
})();
