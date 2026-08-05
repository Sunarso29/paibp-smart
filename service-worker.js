const CORE_CACHE="paibp-smart-v56-core",DATA_CACHE="paibp-smart-v56-data",MEDIA_CACHE="paibp-smart-v56-media";
const CORE=[
  "./","./index.html","./app-config.js?v=56","./final-ui-v56.css?v=56","./media-pack-v56.js?v=56",
  "./final-ui-v56.js?v=56","./realtime-v56.js?v=56","./spensus-ai-v56.js?v=56",
  "./cp2025-exact-v56.js?v=56","./reset-cache-v56.html"
];
self.addEventListener("install",event=>event.waitUntil(caches.open(CORE_CACHE).then(cache=>Promise.allSettled(CORE.map(item=>cache.add(item)))).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith("paibp-smart")&&![CORE_CACHE,DATA_CACHE,MEDIA_CACHE].includes(key)).map(key=>caches.delete(key)));await self.clients.claim();})()));
self.addEventListener("message",event=>{if(event.data?.type==="CLEAR_ALL_CACHES")event.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(key=>caches.delete(key)))));});
async function networkFirst(request,name){const cache=await caches.open(name);try{const response=await fetch(request,{cache:"no-store"});if(response.ok)cache.put(request,response.clone());return response;}catch{return(await cache.match(request,{ignoreSearch:true}))||Response.error();}}
async function cacheFirst(request,name){const cache=await caches.open(name),hit=await cache.match(request,{ignoreSearch:true});if(hit)return hit;const response=await fetch(request);if(response.ok)cache.put(request,response.clone());return response;}
self.addEventListener("fetch",event=>{const request=event.request;if(request.method!=="GET")return;const url=new URL(request.url);if(url.origin!==self.location.origin){event.respondWith(fetch(request).catch(()=>caches.match(request)));return;}if(request.mode==="navigate"){event.respondWith(networkFirst(request,CORE_CACHE).catch(()=>caches.match(new URL("./index.html",self.registration.scope).href)));return;}if(/cp2025-|assets\/cp-2025\//i.test(url.pathname)){event.respondWith(networkFirst(request,DATA_CACHE));return;}if(/media-pack-v56\.js|\.(?:png|jpg|jpeg|webp|svg|woff2?)$/i.test(url.pathname)){event.respondWith(cacheFirst(request,MEDIA_CACHE));return;}if(/\.(?:js|css|json|webmanifest)$/i.test(url.pathname)){event.respondWith(networkFirst(request,CORE_CACHE));return;}event.respondWith(networkFirst(request,CORE_CACHE));});
