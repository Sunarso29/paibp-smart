const CACHE_NAME="paibp-smart-v85-visual-static";
const STATIC=["./logo-spensus.png","./assets/icons/icon-192.png"];

self.addEventListener("install",(event)=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache)=>Promise.allSettled(STATIC.map((url)=>cache.add(url)))));
});

self.addEventListener("activate",(event)=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter((key)=>key!==CACHE_NAME).map((key)=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch",(event)=>{
  if(event.request.method!=="GET") return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;

  const fresh = event.request.mode==="navigate"
    || ["script","style","document"].includes(event.request.destination)
    || /app-config|v38-upgrade|v39-upgrade|islamic-lite|islamic-data|islamic-learning|islamic-upgrade|khutbah|hadith|arabic|script\.js|teacher-cat|cat-session|net-v71|mobile-fix|stable-v72|quran-kemenag|quran-kemenag-runtime|worship-restore|learning-guard|cp2025-cleanup|cp2025-loader|cp2025-exact|cp2026-source|visual-v83|visual-v84|visual-v85|visual-runtime-v85|icon-depth-v85|icon-guard-v84|teacher-docs-v84|teacher-v84|cat-session|service-worker/i.test(url.pathname);

  if(fresh){
    event.respondWith(
      fetch(new Request(event.request,{cache:"no-store"}))
        .catch(()=>caches.match(event.request,{ignoreSearch:true}))
    );
    return;
  }

  if(event.request.destination==="image"){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE_NAME);
      const hit=await cache.match(event.request);
      if(hit) return hit;
      try{
        const response=await fetch(event.request);
        if(response.ok) cache.put(event.request,response.clone());
        return response;
      }catch{
        return Response.error();
      }
    })());
  }
});
