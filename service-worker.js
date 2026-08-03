const CACHE_NAME = "paibp-smart-core-v40-quran-cp";
const CORE_ASSETS = [
  "./","./index.html","./fitur.html","./mapel-lain.html","./literasi-digital.html","./artikel-islam.html","./about-spensus.html","./contact.html","./privacy.html","./support.html","./terms.html","./akses-guru.html","./kendali-editor.html","./404.html",
  "./styles.css","./v28-ui.css","./v29-ui.css","./v30-ui.css","./v32-ui.css","./v33-multimapel.css","./v34-lite.css","./literasi-digital.css","./v37-final.css","./v38-upgrade.css","./v39-upgrade.css","./v40-upgrade.css",
  "./manifest.webmanifest","./assets/icons/icon-192.png","./assets/icons/icon-512.png","./logo-spensus.png","./logo-spensus-hd.png","./gerbang.jpg","./sunarso.jpeg",
  "./app-config.js","./content-data.js","./teacher-source-data.js","./calendar-data.js","./staff-images.js","./school-data.js","./banjarnegara-school-directory.js","./islamic-data.js","./islamic-learning-data.js","./islamic-upgrade-v19.js","./islamic-upgrade-v20.js","./islamic-upgrade-v21.js","./islamic-upgrade-v22.js","./khutbah-source-data.js","./khutbah-verse-data.js","./hadith-data.js","./arabic-data.js","./assessment-data.js","./game-data.js","./video-data.js","./docx-export.js","./vendor/jszip.min.js","./vendor/pptxgen.min.js","./office-export.js","./assessment-ui.js","./script.js","./spensus-ai.js","./multimapel-loader.js","./v26-ui.js","./v28-ui.js","./v29-ui.js","./v30-ui.js","./public-pages.js","./v29-public.js","./v34-lite.js","./v38-upgrade.js","./v39-upgrade.js","./v40-upgrade.js","./assets/cp-2025/manifest.json","./literasi-digital.js","./artikel-data.js","./artikel-islam.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    await Promise.allSettled(CORE_ASSETS.map(async(path)=>{
      const url=new URL(path,self.registration.scope).href;
      const response=await fetch(url,{cache:"reload"});
      if(response.ok) await cache.put(url,response);
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", (event) => {
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter((k)=>k.startsWith("paibp-smart-core-")&&k!==CACHE_NAME).map((k)=>caches.delete(k)));
    await self.clients.claim();
  })());
});
function parseRange(value,total){const m=/^bytes=(\d*)-(\d*)$/i.exec(String(value||"").trim());if(!m||!total)return null;let start,end;if(m[1]===""){const suffix=Number(m[2]);if(!suffix)return null;start=Math.max(0,total-suffix);end=total-1}else{start=Number(m[1]);end=m[2]===""?total-1:Number(m[2])}if(!Number.isFinite(start)||!Number.isFinite(end)||start<0||start>=total||end<start)return null;return{start,end:Math.min(end,total-1)}}
async function rangeResponse(request){let response=await caches.match(request.url);if(!response||response.status===206){response=await fetch(new Request(request.url,{headers:{Accept:request.headers.get("Accept")||"*/*"},cache:"no-store"}));if(response.ok&&response.status===200){const cache=await caches.open(CACHE_NAME);await cache.put(request.url,response.clone())}}const bytes=await response.arrayBuffer();const range=parseRange(request.headers.get("Range"),bytes.byteLength);if(!range)return new Response(null,{status:416,headers:{"Content-Range":`bytes */${bytes.byteLength}`}});const headers=new Headers(response.headers);headers.set("Accept-Ranges","bytes");headers.set("Content-Range",`bytes ${range.start}-${range.end}/${bytes.byteLength}`);headers.set("Content-Length",String(range.end-range.start+1));return new Response(bytes.slice(range.start,range.end+1),{status:206,headers})}
self.addEventListener("fetch",(event)=>{const req=event.request;if(req.method!=="GET")return;const url=new URL(req.url);if(req.headers.has("Range")&&/\.(?:mp3|ogg|m4a|wav)$/i.test(url.pathname)){event.respondWith(rangeResponse(req));return}if(url.origin===self.location.origin&&url.pathname.includes("/assets/cp-2025/")){event.respondWith(caches.match(req,{ignoreSearch:true}).then((cached)=>cached||fetch(req).then((response)=>{if(response.ok)caches.open("paibp-smart-cp2025-v40").then((cache)=>cache.put(req,response.clone()));return response})));return}if(url.origin!==self.location.origin){event.respondWith(caches.match(req).then((cached)=>cached||fetch(req).then((response)=>{if(response.ok||response.type==="opaque")caches.open(CACHE_NAME).then((cache)=>cache.put(req,response.clone()));return response})));return}if(req.mode==="navigate"){event.respondWith(fetch(req).then((response)=>{if(response.ok)caches.open(CACHE_NAME).then((cache)=>cache.put(req,response.clone()));return response}).catch(async()=>await caches.match(req)||caches.match(new URL("./index.html",self.registration.scope).href)));return}if(/\.(?:js|css|json|webmanifest)$/i.test(url.pathname)){event.respondWith(fetch(req,{cache:"no-store"}).then((response)=>{if(response.ok)caches.open(CACHE_NAME).then((cache)=>cache.put(req,response.clone()));return response}).catch(()=>caches.match(req,{ignoreSearch:true})));return}event.respondWith(caches.match(req,{ignoreSearch:true}).then((cached)=>cached||fetch(req).then((response)=>{if(response.ok)caches.open(CACHE_NAME).then((cache)=>cache.put(req,response.clone()));return response})));});
