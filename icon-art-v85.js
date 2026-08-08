(() => {
  "use strict";
  /* Lightweight compatibility/bootstrap shim: no MutationObserver, no DOM rescans. */
  const hasScript=(name)=>[...document.scripts].some(s=>String(s.src||"").includes(name));
  const hasStyle=(name)=>[...document.querySelectorAll('link[rel="stylesheet"]')].some(l=>String(l.href||"").includes(name));
  const addScript=(name,version)=>{
    if(hasScript(name))return;
    const s=document.createElement("script");
    s.src=new URL(`${name}?v=${version}`,document.baseURI).href;
    s.defer=true;
    document.head.append(s);
  };
  const addStyle=(name,version)=>{
    if(hasStyle(name))return;
    const l=document.createElement("link");
    l.rel="stylesheet";
    l.href=new URL(`${name}?v=${version}`,document.baseURI).href;
    document.head.append(l);
  };

  addScript("icon-art-v86.js","88");
  addStyle("visual-fix-v87.css","88");
  if((location.pathname.split("/").pop()||"index.html").toLowerCase()==="akses-guru.html"){
    addScript("teacher-preview-fix-v87.js","88");
  }

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    const register=()=>navigator.serviceWorker.register("service-worker.js?v=88").then(r=>r.update()).catch(()=>null);
    if(document.readyState==="complete")register();
    else window.addEventListener("load",register,{once:true});
  }
})();
