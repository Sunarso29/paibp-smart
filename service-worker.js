const CORE_CACHE="paibp-smart-v62-core";
const CORE=["./","./index.html","./about-spensus.html","./app-config.js?v=62","./headmasters-v62.css?v=62","./headmasters-v62.js?v=62","./reset-cache-v62.html"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CORE_CACHE).then(cache=>Promise.allSettled(CORE.map(item=>cache.add(item)))).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith("paibp-smart")&&key!==CORE_CACHE).map(key=>caches.delete(key)));await self.clients.claim()})()));
self.addEventListener("message",event=>{if(event.data?.type==="CLEAR_ALL_CACHES")event.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(key=>caches.delete(key)))))});
async function networkFirst(request){const cache=await caches.open(CORE_CACHE);try{const response=await fetch(request,{cache:"no-store"});if(response.ok)cache.put(request,response.clone());return response}catch{return(await cache.match(request,{ignoreSearch:true}))||Response.error()}}
self.addEventListener("fetch",event=>{if(event.request.method!=="GET")return;const url=new URL(event.request.url);if(url.origin!==self.location.origin){event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)));return}event.respondWith(networkFirst(event.request))});
