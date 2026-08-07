(() => {
  "use strict";
  const VERSION = "70";
  const CONFIG = window.PAIBP_CONFIG || {};
  const WORKER_HOST = "paibp-smart-api.sunarso29.workers.dev";
  const WORKER = `https://${WORKER_HOST}/`;
  const nativeFetch = window.fetch.bind(window);
  const cache = new Map();
  const inflight = new Map();
  const state = { online:false, lastSuccess:0, lastError:"", stale:false };
  window.__PAIBP_V70_NET = state;

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const clean = v => String(v ?? "").replace(/\s+/g," ").trim();
  const esc = v => String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const isWorker = input => {
    try { return new URL(typeof input === "string" ? input : input.url).host === WORKER_HOST; }
    catch { return false; }
  };
  const requestMeta = input => {
    const u = new URL(typeof input === "string" ? input : input.url);
    const action = u.searchParams.get("action") || "root";
    u.searchParams.delete("_t");u.searchParams.delete("_v");
    return { action, key:`${u.pathname}?${u.searchParams.toString()}` };
  };
  const cacheTTL = action => action === "health" ? 60000 : /classList|classStatus/i.test(action) ? 3000 : 0;
  const staleTTL = action => /health|classList|classStatus/i.test(action) ? 300000 : 0;
  const isWrite = (method, action) => method !== "GET" || /classControl|submission|camera|proctor|login|contentUpsert/i.test(action);

  async function oneFetch(input, init, timeout) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), timeout);
    const opts = {...(init || {}), signal:ctl.signal, cache:"no-store"};
    try { return await nativeFetch(input, opts); }
    finally { clearTimeout(timer); }
  }

  async function fetchWorker(input, init={}) {
    const meta = requestMeta(input);
    const method = String(init.method || (typeof input !== "string" && input.method) || "GET").toUpperCase();
    const write = isWrite(method, meta.action);
    const cached = cache.get(meta.key);
    const ttl = cacheTTL(meta.action);
    if (!write && cached && Date.now() - cached.time < ttl) return new Response(cached.body,{status:cached.status,headers:cached.headers});
    if (!write && inflight.has(meta.key)) {
      const item = await inflight.get(meta.key);
      return new Response(item.body,{status:item.status,headers:item.headers});
    }

    const task = (async()=>{
      let lastError;
      for (let attempt=0; attempt<2; attempt++) {
        try {
          const safeInit = {...init};delete safeInit.signal;
          const res = await oneFetch(input, safeInit, attempt===0 ? 22000 : 30000);
          const body = await res.text();
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const item = {body,status:res.status,headers:{"Content-Type":res.headers.get("Content-Type")||"application/json;charset=utf-8"},time:Date.now()};
          if (!write) cache.set(meta.key,item);
          state.online=true;state.lastSuccess=Date.now();state.lastError="";state.stale=false;
          return item;
        } catch (e) { lastError=e;if(attempt===0)await sleep(650); }
      }
      const old = cache.get(meta.key);
      if (!write && old && Date.now()-old.time < staleTTL(meta.action)) {
        state.stale=true;state.lastError=String(lastError?.message||lastError||"");
        return {...old,headers:{...old.headers,"X-PAIBP-Stale":"1"}};
      }
      state.online=false;state.lastError=String(lastError?.message||lastError||"Server gagal dijangkau");
      throw new Error("Sinkronisasi server sedang tertunda.");
    })();

    if (!write) inflight.set(meta.key,task);
    try { const item=await task;return new Response(item.body,{status:item.status,headers:item.headers}); }
    finally { if(!write)inflight.delete(meta.key); }
  }

  window.fetch = function(input, init={}) {
    if (!isWorker(input)) return nativeFetch(input, init);
    return fetchWorker(input, init);
  };

  // Health dipanaskan lebih awal agar panel tidak menunggu dua request berurutan.
  nativeFetch(`${WORKER}?action=health&_v=${Date.now()}`,{cache:"no-store",headers:{Accept:"application/json"}})
    .then(async r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);const body=await r.text();cache.set("/?action=health",{body,status:200,headers:{"Content-Type":"application/json;charset=utf-8"},time:Date.now()});state.online=true;state.lastSuccess=Date.now()}).catch(()=>{});

  function removeLegacyKeys(){
    const q=new URLSearchParams(location.search);if(q.get("cat")==="1"||q.get("ps_cat")==="1")return;
    const pat=/paibp-smart-(?:cat|class-context|student-session|policy-cache|focus-session)/i;
    for(const store of [localStorage,sessionStorage])try{for(let i=store.length-1;i>=0;i--){const k=store.key(i)||"";if(k!=="paibp-smart-student-identity-v1"&&pat.test(k))store.removeItem(k)}}catch{}
  }

  function removeGhostCard(){
    const params=new URLSearchParams(location.search);if(params.get("cat")==="1"||params.get("ps_cat")==="1")return;
    const known=["#v56-class-badge","#v56-class-context","#v59-class-context","#v60-class-context","#v61-class-context","#v63-class-context","[data-class-context]","[class*='class-context']","[class*='connected-class']","[class*='kelas-terhubung']"];
    known.forEach(sel=>document.querySelectorAll(sel).forEach(n=>{const host=n.closest("article,section,aside,.container>div")||n;if(clean(host.textContent).length<260)host.remove();else n.remove()}));
    const hero=document.querySelector(".hero-v25,.hero"),heroTop=hero?.getBoundingClientRect?.().top??Infinity;
    document.querySelectorAll("main>div,main>section,body>main+div,header~div").forEach(n=>{
      if(n===hero||n.closest("#v65-cat-control"))return;const r=n.getBoundingClientRect?.();if(!r)return;const text=clean(n.textContent);
      const check=/^[✓✔☑\s]*$/.test(text)||(!!n.querySelector("[class*='check'],[class*='connected']")&&text.length<20);
      if(check&&r.width>280&&r.height>55&&r.height<220&&r.top>=0&&r.bottom<=heroTop+12)n.remove();
    });
  }

  function fixHijri(){
    const node=document.getElementById("hijri-date");if(!node)return;
    try{const parts=new Intl.DateTimeFormat("id-ID-u-ca-islamic",{day:"numeric",month:"long",year:"numeric"}).formatToParts(new Date());const pick=t=>parts.find(p=>p.type===t)?.value||"";const value=`${pick("day")} ${pick("month")} ${pick("year")} H`.replace(/\s+/g," ").trim();if(value.length>5)node.textContent=value}catch{}
  }

  function fnv(value){let h=2166136261;for(const ch of String(value||"")){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(36)}
  function teacherInfo(){try{return JSON.parse(localStorage.getItem("paibp-smart-teacher-identity-v1")||"{}")||{}}catch{return{}}}
  function editorPage(){return /kendali-editor\.html$/i.test(location.pathname)||String(document.body?.dataset.privateGateway||"").toLowerCase()==="editor"||["true","yes"].includes(String(sessionStorage.getItem("paibp-smart-editor-unlocked")||localStorage.getItem("paibp-smart-editor-unlocked")||"").toLowerCase())}
  function robustScope(){if(editorPage())return"editor-global";const old=localStorage.getItem("paibp-smart-teacher-scope-v69");if(old)return old;const id=teacherInfo(),scope=`guru-${fnv(`${clean(id.name||id.teacherName).toLowerCase()}|${clean(id.workUnit||id.school||id.teacherSchool).toLowerCase()}`)}`;localStorage.setItem("paibp-smart-teacher-scope-v69",scope);return scope}
  let lastTeacherClasses=[];

  async function robustTeacherRefresh(){
    const panel=document.getElementById("v65-cat-control");if(!panel)return;
    const status=panel.querySelector("[data-status]"),list=panel.querySelector("[data-classes]");if(!status||!list)return;
    const u=new URL(WORKER);u.searchParams.set("action","classListV66");u.searchParams.set("readKey",String(CONFIG.syncReadKey||""));u.searchParams.set("actorScope",robustScope());u.searchParams.set("actorRole",editorPage()?"editor":"teacher");u.searchParams.set("_v",Date.now());
    try{
      const r=await fetch(u,{cache:"no-store",headers:{Accept:"application/json"}}),data=await r.json();if(!data?.ok)throw new Error(data?.error||"Daftar kelas gagal");
      lastTeacherClasses=(data.classes||[]).filter(x=>x.active);
      status.textContent=`Server tersambung • Backend ${data.version||"66"}`;status.dataset.state="online";
      list.innerHTML=lastTeacherClasses.length?lastTeacherClasses.map(x=>`<article><div><strong>${esc(x.classLabel||x.classCode)}</strong><small>${esc(x.teacherName||"")} • berakhir ${new Date(Number(x.deadlineEpoch||x.expiresAt||Date.now())).toLocaleTimeString("id-ID")}</small></div><button type="button" data-stop-class="${esc(x.classCode)}" data-label="${esc(x.classLabel||x.classCode)}">Matikan sekarang</button></article>`).join(""):"<p>Tidak ada kelas aktif.</p>";
    }catch(e){
      if(lastTeacherClasses.length||state.lastSuccess){status.textContent="Sinkronisasi tertunda • koneksi terakhir tetap tersedia";status.dataset.state="online";if(lastTeacherClasses.length)list.innerHTML=lastTeacherClasses.map(x=>`<article><div><strong>${esc(x.classLabel||x.classCode)}</strong><small>Data aktif terakhir</small></div><button type="button" data-stop-class="${esc(x.classCode)}" data-label="${esc(x.classLabel||x.classCode)}">Matikan sekarang</button></article>`).join("")}
    }
  }

  function stabilizeTeacherStatus(){const panel=document.getElementById("v65-cat-control");if(!panel)return;const status=panel.querySelector("[data-status]");if(!status)return;if((state.stale||state.online)&&state.lastSuccess&&/belum tersambung|gagal|tidak menjawab/i.test(status.textContent)){status.textContent="Sinkronisasi tertunda • koneksi terakhir tetap tersedia";status.dataset.state="online"}}

  function init(){
    removeLegacyKeys();removeGhostCard();fixHijri();
    const observer=new MutationObserver(()=>{removeGhostCard();fixHijri();stabilizeTeacherStatus()});observer.observe(document.body,{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),12000);
    [250,700,1500,3000,6000].forEach(ms=>setTimeout(()=>{removeGhostCard();fixHijri();stabilizeTeacherStatus();robustTeacherRefresh()},ms));
    setInterval(robustTeacherRefresh,30000);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
