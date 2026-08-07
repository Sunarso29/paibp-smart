window.PAIBP_CONFIG = Object.freeze({
  syncEndpoint: "https://paibp-smart-api.sunarso29.workers.dev",
  syncReadKey: "b082937b2165453ba7d9f81ecac063b00310b339ec0643da",
  aiEndpoint: "https://script.google.com/macros/s/AKfycbyRxOw6oWDZUuQxwuqOMRO92KOwqOGF_9J6rPzSfxr9Dqy9kAQGJ9qZA6Tm_deUOgtjKg/exec",
  aiPublicToken: "7382e2e6784d413fa2c0b8175766058cfa8da581f1ca4143",
  realtimeEnabled: true,
  aiEnabled: true,
  realtimeManagedBy: "v74-islamic-on-demand-core",
  realtimeEndpoint: "",
  realtimeReadKey: ""
});

(() => {
  "use strict";
  const VERSION="74";
  const page=(location.pathname.split("/").pop()||"index.html").toLowerCase();
  const params=new URLSearchParams(location.search);
  const catLink=params.get("cat")==="1"||params.get("ps_cat")==="1";
  const loaded=new Map();
  window.__PAIBP_VERSION__=VERSION;

  const pathOf=v=>{try{return new URL(v,document.baseURI).pathname}catch{return String(v||"").split("?")[0]}};
  const exists=(sel,path,prop)=>[...document.querySelectorAll(sel)].some(n=>pathOf(n[prop])===pathOf(path));
  function style(path){if(exists('link[rel="stylesheet"]',path,"href"))return;const n=document.createElement("link");n.rel="stylesheet";n.href=new URL(`${path}?v=${VERSION}`,document.baseURI).href;document.head.append(n)}
  function script(path){if(loaded.has(path))return loaded.get(path);if(exists('script[src]',path,"src"))return Promise.resolve();const p=new Promise((resolve,reject)=>{const n=document.createElement("script");n.src=new URL(`${path}?v=${VERSION}`,document.baseURI).href;n.async=false;n.onload=resolve;n.onerror=()=>reject(new Error(`Gagal memuat ${path}`));document.head.append(n)});loaded.set(path,p);return p}
  async function series(paths){for(const p of paths)await script(p)}

  style("stable-v72.css");
  style("mobile-fix-v70.css");

  function purgeLegacyClassState(){
    if(catLink)return;
    const keys=[
      "paibp-smart-cat-session-v56","paibp-smart-class-context-v56","paibp-smart-student-session-v59","paibp-smart-student-session-v60","paibp-smart-student-session-v61","paibp-smart-student-session-v63","paibp-smart-student-session-v65","paibp-smart-student-session-v69",
      "paibp-smart-policy-cache-v59","paibp-smart-policy-cache-v60","paibp-smart-policy-cache-v61","paibp-smart-policy-cache-v63","paibp-smart-focus-session-v48","paibp-smart-focus-session-v50"
    ];
    for(const store of [localStorage,sessionStorage])for(const k of keys)try{store.removeItem(k)}catch{}
    const selectors=["#v56-class-badge","#v56-class-context","#v59-class-context","#v60-class-context","#v61-class-context","#v63-class-context","[data-class-context]","[class*='class-context']","[class*='connected-class']","[class*='kelas-terhubung']"];
    selectors.forEach(sel=>document.querySelectorAll(sel).forEach(n=>n.remove()));
    document.querySelectorAll("article,section,aside,div").forEach(n=>{
      if(n.children.length>12)return;
      const t=String(n.textContent||"").replace(/\s+/g," ").trim();
      if(/^Kelas\s+terhubung\s*:/i.test(t)&&t.length<260){const host=n.closest("article,section,aside")||n;host.remove()}
    });
  }

  function menuShell(){
    const btn=document.querySelector(".menu-btn"),nav=document.querySelector(".links");
    if(btn&&nav&&!btn.dataset.v74){
      btn.dataset.v74="1";
      btn.addEventListener("click",e=>{
        e.stopImmediatePropagation();
        const open=!nav.classList.contains("open");
        nav.classList.toggle("open",open);
        btn.setAttribute("aria-expanded",String(open));
        btn.textContent=open?"×":"☰";
      });
    }
  }

  function openPanel(name){
    const target=document.querySelector(`#panel-${CSS.escape(name)},[data-panel="${CSS.escape(name)}"]`);if(!target)return false;
    document.querySelectorAll(".workspace-panel").forEach(p=>p.hidden=p!==target);target.hidden=false;
    if(["student","islamic","games"].includes(name))document.body.dataset.portalRole="murid";
    const portal=document.querySelector("#portal");if(portal)requestAnimationFrame(()=>portal.scrollIntoView({block:"start",behavior:"auto"}));
    return true;
  }

  function shell(){
    menuShell();purgeLegacyClassState();
    document.querySelectorAll("[data-year]").forEach(n=>n.textContent=new Date().getFullYear());
    document.addEventListener("click",e=>{
      const close=e.target.closest("[data-close-workspace]");if(close){e.preventDefault();openPanel("welcome");return}
      const b=e.target.closest("[data-open-panel]");if(!b)return;
      const name=b.dataset.openPanel;
      if(["student","islamic","games"].includes(name))return;
      e.preventDefault();openPanel(name);
    });
  }

  let workspaceCorePromise=null;
  async function loadWorkspaceCore(){
    if(window.__PAIBP_WORKSPACE_CORE_READY__)return true;
    if(workspaceCorePromise)return workspaceCorePromise;
    workspaceCorePromise=(async()=>{
      /* Urutan mengikuti paket stabil sebelum V73, tetapi hanya dimuat saat fitur benar-benar dibuka. */
      await series([
        "content-data.js",
        "calendar-data.js",
        "islamic-data.js",
        "islamic-learning-data.js",
        "islamic-upgrade-v19.js",
        "islamic-upgrade-v20.js",
        "islamic-upgrade-v21.js",
        "islamic-upgrade-v22.js",
        "khutbah-source-data.js",
        "khutbah-verse-data.js",
        "hadith-data.js",
        "arabic-data.js",
        "assessment-data.js",
        "game-data.js",
        "video-data.js",
        "docx-export.js",
        "script.js"
      ]);
      /* Pertahankan pengaman Al Qur'an V73: teks ayat tidak dibangkitkan sendiri; sumber resmi Kemenag tetap ditonjolkan. */
      await script("islamic-lite-v73.js");
      window.__PAIBP_WORKSPACE_CORE_READY__=true;
      return true;
    })().catch(e=>{
      workspaceCorePromise=null;
      console.error("PAIBP V74 workspace core",e);
      const status=document.querySelector("#quran-status,#prayer-status,.save-status");
      if(status)status.textContent="Sebagian fitur belum berhasil dimuat. Periksa koneksi lalu buka kembali fitur ini.";
      return false;
    });
    return workspaceCorePromise;
  }

  let catPromise=null;
  async function loadCat(){
    if(catPromise)return catPromise;
    style("cat-session-v65.css");
    catPromise=(async()=>{await script("net-v71.js");await script("cat-session-v67.js");return true})().catch(e=>{catPromise=null;console.warn("PAIBP CAT",e);return false});
    return catPromise;
  }

  function workspaceGate(){
    let replay=false;
    document.addEventListener("click",async e=>{
      const b=e.target.closest('[data-open-panel]');
      const name=b?.dataset.openPanel;
      if(!b||replay||!["student","islamic","games"].includes(name))return;
      if(window.__PAIBP_WORKSPACE_CORE_READY__){
        e.preventDefault();
        openPanel(name);
        return;
      }
      e.preventDefault();e.stopImmediatePropagation();
      b.setAttribute("aria-busy","true");
      const jobs=[loadWorkspaceCore()];
      if(name==="student"||catLink)jobs.push(loadCat());
      const result=await Promise.all(jobs);
      b.removeAttribute("aria-busy");
      if(result.some(v=>v===false))return;
      replay=true;
      openPanel(name);
      if(name==="islamic"){
        const home=document.querySelector('[data-islamic-view="home"]');
        home?.click();
      }
      replay=false;
    },true);
  }

  function init(){
    shell();
    if(page==="about-spensus.html")return;
    if(/^(akses-guru|kendali-editor)\.html$/.test(page)){script("teacher-cat-v72.js").catch(()=>{});return}
    if(page==="index.html"){
      workspaceGate();
      if(catLink)Promise.all([loadCat(),loadWorkspaceCore()]).catch(()=>{});
    }
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
  setTimeout(purgeLegacyClassState,350);
  setTimeout(purgeLegacyClassState,1200);
})();
