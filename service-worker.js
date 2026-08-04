const CORE_CACHE = "paibp-smart-v53-core";
const DATA_CACHE = "paibp-smart-v53-data";
const AUDIO_CACHE = "paibp-smart-v53-audio";
const CORE_ASSETS = [
  "./", "./index.html", "./app-config.js",
  "./final-ui-v50.css", "./final-ui-v51.css", "./final-ui-v52.css", "./final-ui-v53.css", "./final-ui-v53.js",
  "./cp2025-v48.css", "./cp2025-loader-v48.js",
  "./spensus-ai-v48.css", "./spensus-ai.js",
  "./learning-guard-v48.css", "./learning-guard-v48.js",
  "./realtime-v43.css", "./realtime-v43.js", "./realtime-v48.css", "./realtime-v48-status.js",
  "./gerbang.jpg", "./logo-spensus.png", "./manifest.webmanifest",
  "./assets/simulasi/wudhu-01-v53.webp",
  "./assets/simulasi/wudhu-02-v53.webp",
  "./assets/simulasi/wudhu-03-v53.webp",
  "./assets/simulasi/wudhu-04-v53.webp",
  "./assets/simulasi/wudhu-05-v53.webp",
  "./assets/simulasi/wudhu-06-v53.webp",
  "./assets/simulasi/wudhu-07-v53.webp",
  "./assets/simulasi/wudhu-08-v53.webp",
  "./assets/simulasi/wudhu-09-v53.webp",
  "./assets/simulasi/sholat-01-v53.webp",
  "./assets/simulasi/sholat-02-v53.webp",
  "./assets/simulasi/sholat-03-v53.webp",
  "./assets/simulasi/sholat-04-v53.webp",
  "./assets/simulasi/sholat-05-v53.webp",
  "./assets/simulasi/sholat-06-v53.webp",
  "./assets/simulasi/sholat-07-v53.webp",
  "./assets/simulasi/sholat-08-v53.webp",
  "./assets/simulasi/wudhu-poster-v53.webp"
];
self.addEventListener("install", event => event.waitUntil((async()=>{const c=await caches.open(CORE_CACHE);await Promise.allSettled(CORE_ASSETS.map(p=>c.add(new Request(p,{cache:"reload"}))));await self.skipWaiting()})()));
self.addEventListener("activate", event => event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith("paibp-smart")&&![CORE_CACHE,DATA_CACHE,AUDIO_CACHE].includes(k)).map(k=>caches.delete(k)));await self.clients.claim()})()));
self.addEventListener("message", event=>{if(event.data?.type==="CLEAR_ALL_CACHES")event.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))))});
function parseRange(value,total){const m=/^bytes=(\d*)-(\d*)$/i.exec(String(value||""));if(!m||!total)return null;let s,e;if(m[1]===""){const x=Number(m[2]);if(!x)return null;s=Math.max(0,total-x);e=total-1}else{s=Number(m[1]);e=m[2]===""?total-1:Number(m[2])}if(!Number.isFinite(s)||!Number.isFinite(e)||s<0||s>=total||e<s)return null;return{start:s,end:Math.min(e,total-1)}}
async function audioRange(request){let response=await caches.match(request.url);if(!response){response=await fetch(new Request(request.url,{headers:{Accept:request.headers.get("Accept")||"*/*"}}));if(response.ok)(await caches.open(AUDIO_CACHE)).put(request.url,response.clone())}const bytes=await response.arrayBuffer(),part=parseRange(request.headers.get("Range"),bytes.byteLength);if(!part)return new Response(null,{status:416});const headers=new Headers(response.headers);headers.set("Accept-Ranges","bytes");headers.set("Content-Range",`bytes ${part.start}-${part.end}/${bytes.byteLength}`);headers.set("Content-Length",String(part.end-part.start+1));return new Response(bytes.slice(part.start,part.end+1),{status:206,headers})}
async function networkFirst(request,cacheName,fallback){const cache=await caches.open(cacheName);try{const response=await fetch(request,{cache:"no-store"});if(response.ok)cache.put(request,response.clone());return response}catch{return await cache.match(request,{ignoreSearch:true})||fallback?.()||Response.error()}}
async function stale(request,cacheName){const cache=await caches.open(cacheName),cached=await cache.match(request,{ignoreSearch:true});const net=fetch(request,{cache:"no-store"}).then(r=>{if(r.ok)cache.put(request,r.clone());return r}).catch(()=>null);return cached||(await net)||Response.error()}
async function cacheFirst(request,cacheName){const cache=await caches.open(cacheName),cached=await cache.match(request,{ignoreSearch:true});if(cached)return cached;const response=await fetch(request);if(response.ok)cache.put(request,response.clone());return response}
self.addEventListener("fetch",event=>{const request=event.request;if(request.method!=="GET")return;const url=new URL(request.url);if(request.headers.has("Range")&&/\.(?:mp3|ogg|m4a|wav)$/i.test(url.pathname)){event.respondWith(audioRange(request));return}if(url.origin!==self.location.origin){event.respondWith(fetch(request).catch(()=>caches.match(request)));return}if(request.mode==="navigate"){event.respondWith(networkFirst(request,CORE_CACHE,()=>caches.match(new URL("./index.html",self.registration.scope).href)));return}if(/cp2025-(?:manifest|data|source)-.+-v48\.(?:js|docx|xlsx)$/i.test(url.pathname)){event.respondWith(stale(request,DATA_CACHE));return}if(/\.(?:js|css|json|webmanifest)$/i.test(url.pathname)){event.respondWith(networkFirst(request,CORE_CACHE));return}if(/\.(?:png|jpg|jpeg|webp|svg|woff2?)$/i.test(url.pathname)){event.respondWith(cacheFirst(request,CORE_CACHE));return}event.respondWith(networkFirst(request,CORE_CACHE))});
