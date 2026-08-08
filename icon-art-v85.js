(() => {
  "use strict";
  /* Compatibility shim: V85 observer removed. Load lightweight V86 icon runtime once. */
  if (!window.PAIBP_ICON_ART_V86 && ![...document.scripts].some(s => String(s.src||'').includes('icon-art-v86.js'))) {
    const script=document.createElement('script');
    script.src=new URL('icon-art-v86.js?v=86',document.baseURI).href;
    script.defer=true;
    document.head.append(script);
  } else {
    window.PAIBP_ICON_ART_V86?.run?.();
  }
  /* Service worker registration remains lightweight even though script.js is now lazy. */
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    const register=()=>navigator.serviceWorker.register("service-worker.js?v=86").then(r=>r.update()).catch(()=>null);
    if (document.readyState === "complete") register();
    else window.addEventListener("load",register,{once:true});
  }
})();
