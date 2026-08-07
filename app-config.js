window.PAIBP_CONFIG = Object.freeze({
  syncEndpoint: "https://script.google.com/macros/s/AKfycbyRxOw6oWDZUuQxwuqOMRO92KOwqOGF_9J6rPzSfxr9Dqy9kAQGJ9qZA6Tm_deUOgtjKg/exec",
  syncReadKey: "b082937b2165453ba7d9f81ecac063b00310b339ec0643da",
  aiEndpoint: "https://script.google.com/macros/s/AKfycbyRxOw6oWDZUuQxwuqOMRO92KOwqOGF_9J6rPzSfxr9Dqy9kAQGJ9qZA6Tm_deUOgtjKg/exec",
  aiPublicToken: "7382e2e6784d413fa2c0b8175766058cfa8da581f1ca4143",
  realtimeEnabled: true,
  aiEnabled: true,
  realtimeManagedBy: "v66-bridge-final",
  realtimeEndpoint: "",
  realtimeReadKey: ""
});

(() => {
  "use strict";
  const VERSION = "66";
  window.__PAIBP_VERSION__ = VERSION;
  const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const loaded = new Map();
  const pathOf = (value) => { try { return new URL(value, document.baseURI).pathname; } catch { return String(value || "").split("?")[0]; } };
  const exists = (selector,path,prop) => [...document.querySelectorAll(selector)].some(node => pathOf(node[prop]) === pathOf(path));
  function style(path){ if(exists('link[rel="stylesheet"]',path,"href")) return; const n=document.createElement("link"); n.rel="stylesheet"; n.href=new URL(`${path}?v=${VERSION}`,document.baseURI).href; document.head.append(n); }
  function script(path){ if(loaded.has(path)) return loaded.get(path); if(exists('script[src]',path,"src")) return Promise.resolve(); const p=new Promise((resolve,reject)=>{ const n=document.createElement("script"); n.src=new URL(`${path}?v=${VERSION}`,document.baseURI).href; n.async=false; n.onload=resolve; n.onerror=reject; document.head.append(n); }); loaded.set(path,p); return p; }
  function idle(task,timeout=2500){ if("requestIdleCallback" in window) requestIdleCallback(task,{timeout}); else setTimeout(task,Math.min(timeout,800)); }

  style("performance-v65.css");
  if(page === "about-spensus.html") return;

  if(/^(index|akses-guru|kendali-editor)\.html$/.test(page)){
    style("cat-session-v65.css");
    script("cat-session-v66.js").catch(()=>{});
  }

  idle(async()=>{
    style("final-ui-v56.css");
    style("final-ui-v57.css");
    try{ await script("final-ui-v56.js"); }catch{}
    script("final-ui-v57.js").catch(()=>{});
  },2800);

  let mediaRequested=false;
  document.addEventListener("click",event=>{
    if(mediaRequested) return;
    if(event.target.closest('[data-chapter],[data-material-id],[data-practice],[data-open-practice],#v56-practice-board')){
      mediaRequested=true;
      script("media-pack-v56.js").catch(()=>{});
    }
  },{passive:true});

  if(/^(akses-guru|kendali-editor)\.html$/.test(page)) idle(()=>{
    style("cp2025-v48.css");
    script("cp2025-loader-v48.js").then(()=>script("cp2025-exact-v56.js")).catch(()=>{});
  },4200);

  document.addEventListener("click",event=>{
    if(event.target.closest("[data-ai-open],.workspace-ai-nav-v27")){
      style("spensus-ai-v48.css");
      script("spensus-ai-v56.js").catch(()=>{});
    }
  },{passive:true});

  if(localStorage.getItem("paibp-smart-v66-cache-reset")!=="done") setTimeout(async()=>{
    try{
      const keys=await caches.keys();
      await Promise.all(keys.map(key=>caches.delete(key)));
      localStorage.setItem("paibp-smart-v66-cache-reset","done");
      const regs=await navigator.serviceWorker?.getRegistrations?.();
      regs?.forEach(reg=>reg.update().catch(()=>{}));
    }catch{}
  },250);
})();
