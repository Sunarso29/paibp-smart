window.PAIBP_CONFIG = Object.freeze({
  syncEndpoint: "https://paibp-smart-api.sunarso29.workers.dev",
  syncReadKey: "b082937b2165453ba7d9f81ecac063b00310b339ec0643da",
  aiEndpoint: "https://script.google.com/macros/s/AKfycbyRxOw6oWDZUuQxwuqOMRO92KOwqOGF_9J6rPzSfxr9Dqy9kAQGJ9qZA6Tm_deUOgtjKg/exec",
  aiPublicToken: "7382e2e6784d413fa2c0b8175766058cfa8da581f1ca4143",
  realtimeEnabled: true,
  aiEnabled: true,
  realtimeManagedBy: "v72-stable-minimal",
  realtimeEndpoint: "",
  realtimeReadKey: ""
});

(() => {
  "use strict";
  const VERSION="72";
  window.__PAIBP_VERSION__=VERSION;
  const page=(location.pathname.split("/").pop()||"index.html").toLowerCase();
  const q=new URLSearchParams(location.search);
  const catLink=q.get("cat")==="1"||q.get("ps_cat")==="1";
  const loaded=new Map();
  const pathOf=v=>{try{return new URL(v,document.baseURI).pathname}catch{return String(v||"").split("?")[0]}};
  const exists=(sel,path,prop)=>[...document.querySelectorAll(sel)].some(n=>pathOf(n[prop])===pathOf(path));
  function style(path){if(exists('link[rel="stylesheet"]',path,"href"))return;const n=document.createElement("link");n.rel="stylesheet";n.href=new URL(`${path}?v=${VERSION}`,document.baseURI).href;document.head.append(n)}
  function script(path){if(loaded.has(path))return loaded.get(path);if(exists('script[src]',path,"src"))return Promise.resolve();const p=new Promise((resolve,reject)=>{const n=document.createElement("script");n.src=new URL(`${path}?v=${VERSION}`,document.baseURI).href;n.async=false;n.onload=resolve;n.onerror=reject;document.head.append(n)});loaded.set(path,p);return p}

  style("stable-v72.css");
  style("mobile-fix-v70.css");

  // Cegah mesin CAT lama membangun panel/loop tambahan.
  const stub=Object.freeze({version:VERSION,startFromLegacy(){},enterStudentRoom(){},showLogin(){}});
  window.PAIBP_CAT_V59=stub;window.PAIBP_CAT_V60=stub;window.PAIBP_CAT_V61=stub;window.PAIBP_CAT_V63=stub;

  function purgeGhost(){
    if(catLink)return;
    const pat=/paibp-smart-(?:cat|class-context|student-session|policy-cache|focus-session)/i;
    for(const store of [localStorage,sessionStorage])try{for(let i=store.length-1;i>=0;i--){const k=store.key(i)||"";if(k!=="paibp-smart-student-identity-v1"&&pat.test(k))store.removeItem(k)}}catch{}
    ["#v56-class-badge","#v56-class-context","#v59-class-context","#v60-class-context","#v61-class-context","#v63-class-context","[data-class-context]","[class*='class-context']","[class*='connected-class']","[class*='kelas-terhubung']"].forEach(sel=>document.querySelectorAll(sel).forEach(n=>n.remove()));
  }
  function fixHijri(){const n=document.getElementById("hijri-date");if(!n)return;try{const p=new Intl.DateTimeFormat("id-ID-u-ca-islamic",{day:"numeric",month:"long",year:"numeric"}).formatToParts(new Date()),g=t=>p.find(x=>x.type===t)?.value||"";n.textContent=`${g("day")} ${g("month")} ${g("year")} H`.replace(/\s+/g," ").trim()}catch{}}
  function ready(){purgeGhost();fixHijri()}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ready,{once:true});else ready();
  setTimeout(purgeGhost,900);

  if(page==="about-spensus.html")return;

  // Portal Guru/Editor: hanya panel CAT ringan. Tidak memuat mesin murid/legacy/CP saat awal.
  if(/^(akses-guru|kendali-editor)\.html$/.test(page)){
    script("teacher-cat-v72.js").catch(()=>{});
  }

  // Mesin CAT murid hanya saat benar-benar dibutuhkan.
  let catReady=false,catLoading=null;
  async function loadStudentCat(){
    if(catReady)return true;
    if(catLoading)return catLoading;
    style("cat-session-v65.css");
    catLoading=script("net-v71.js").then(()=>script("cat-session-v67.js")).then(()=>{catReady=true;return true}).catch(()=>false);
    return catLoading;
  }
  if(page==="index.html"&&catLink)loadStudentCat();
  if(page==="index.html"&&!catLink){
    let replay=false;
    document.addEventListener("click",async e=>{
      const b=e.target.closest('[data-open-panel="student"]');
      if(!b||replay||catReady)return;
      e.preventDefault();e.stopImmediatePropagation();
      const ok=await loadStudentCat();if(!ok)return;
      replay=true;b.click();replay=false;
    },true);
  }

  // Script berat pembelajaran hanya setelah murid benar-benar membuka materi/latihan.
  let legacy=false;
  async function loadLearning(){if(legacy)return;legacy=true;style("final-ui-v56.css");style("final-ui-v57.css");try{await script("final-ui-v56.js")}catch{}script("final-ui-v57.js").catch(()=>{});script("media-pack-v56.js").catch(()=>{})}
  document.addEventListener("click",e=>{if(e.target.closest('[data-chapter],[data-material-id],[data-practice],[data-open-practice],[data-v56-module],#v56-practice-board'))loadLearning();if(e.target.closest('[data-open-panel="islamic"],[data-islamic-view]'))fixHijri()},{passive:true});

  // AI tetap on-demand.
  document.addEventListener("click",e=>{if(e.target.closest("[data-ai-open],.workspace-ai-nav-v27")){style("spensus-ai-v48.css");script("spensus-ai-v56.js").catch(()=>{})}},{passive:true});
})();
