const CORE_CACHE="paibp-smart-v59-core";
const DATA_CACHE="paibp-smart-v59-data";
const MEDIA_CACHE="paibp-smart-v59-media";
const CORE=[
  "./","./index.html","./app-config.js?v=59",
  "./final-ui-v56.css?v=59","./final-ui-v57.css?v=59","./cat-proctor-v59.css?v=59",
  "./media-pack-v56.js?v=59","./cat-proctor-v59.js?v=59","./final-ui-v56.js?v=59","./final-ui-v57.js?v=59",
  "./realtime-v56.js?v=59","./spensus-ai-v56.js?v=59","./cp2025-exact-v56.js?v=59","./reset-cache-v59.html"
];

self.addEventListener("install",event=>event.waitUntil(
  caches.open(CORE_CACHE)
    .then(cache=>Promise.allSettled(CORE.map(item=>cache.add(item))))
    .then(()=>self.skipWaiting())
));

self.addEventListener("activate",event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key.startsWith("paibp-smart")&&![CORE_CACHE,DATA_CACHE,MEDIA_CACHE].includes(key)).map(key=>caches.delete(key)));
  await self.clients.claim();
})()));

self.addEventListener("message",event=>{
  if(event.data?.type==="CLEAR_ALL_CACHES"){
    event.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(key=>caches.delete(key)))));
  }
});

async function networkFirst(request,name){
  const cache=await caches.open(name);
  try{
    const response=await fetch(request,{cache:"no-store"});
    if(response.ok)cache.put(request,response.clone());
    return response;
  }catch{
    return(await cache.match(request,{ignoreSearch:true}))||Response.error();
  }
}

self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET")return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin){
    event.respondWith(fetch(request).catch(()=>caches.match(request)));
    return;
  }
  if(request.mode==="navigate"){
    event.respondWith(networkFirst(request,CORE_CACHE).catch(()=>caches.match(new URL("./index.html",self.registration.scope).href)));
    return;
  }
  if(/cp2025-|assets\/cp-2025\//i.test(url.pathname)){
    event.respondWith(networkFirst(request,DATA_CACHE));
    return;
  }
  if(/media-pack-v56\.js|\.(?:png|jpg|jpeg|webp|svg|woff2?)$/i.test(url.pathname)){
    event.respondWith(networkFirst(request,MEDIA_CACHE));
    return;
  }
  event.respondWith(networkFirst(request,CORE_CACHE));
});
