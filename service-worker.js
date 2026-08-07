const CACHE_NAME="paibp-smart-v66";
self.addEventListener("install",e=>e.waitUntil(self.skipWaiting()));
self.addEventListener("activate",e=>e.waitUntil((async()=>{for(const k of await caches.keys())await caches.delete(k);await self.clients.claim()})()));
self.addEventListener("message",e=>{if(e.data?.type==="CLEAR_ALL_CACHES")e.waitUntil(caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k)))))});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;const u=new URL(e.request.url);if(u.origin!==self.location.origin)return;const fresh=e.request.mode==="navigate"||["script","style","document"].includes(e.request.destination)||/app-config|cat-session|uji-server|reset-cache|performance|service-worker/i.test(u.pathname);if(fresh)e.respondWith(fetch(e.request,{cache:"no-store"}).catch(()=>caches.match(e.request,{ignoreSearch:true})));});
