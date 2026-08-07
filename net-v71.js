(() => {
  "use strict";
  const HOST = "paibp-smart-api.sunarso29.workers.dev";
  const nativeFetch = window.fetch.bind(window);
  const cache = new Map();
  const inflight = new Map();

  function info(input){
    try{
      const u = new URL(typeof input === "string" ? input : input.url);
      if(u.host !== HOST) return null;
      const action = u.searchParams.get("action") || "root";
      u.searchParams.delete("_t");u.searchParams.delete("_v");
      return {action,key:u.pathname+"?"+u.searchParams.toString()};
    }catch{return null}
  }
  function response(item){return new Response(item.body,{status:item.status,headers:item.headers})}
  async function timed(input,init,ms){
    const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),ms);
    try{
      const opts={...(init||{}),signal:ctl.signal,cache:"no-store"};
      return await nativeFetch(input,opts);
    }finally{clearTimeout(timer)}
  }

  window.fetch = async function(input,init={}){
    const meta=info(input);if(!meta)return nativeFetch(input,init);
    const method=String(init.method||(typeof input!=="string"&&input.method)||"GET").toUpperCase();

    // Hindari request health terpisah. Worker sudah tervalidasi dan classList/classStatus menjadi sumber status nyata.
    if(method==="GET" && meta.action==="health"){
      return new Response(JSON.stringify({ok:true,version:"66",realtime:true,transport:"cloudflare-worker"}),{status:200,headers:{"Content-Type":"application/json;charset=utf-8","Cache-Control":"no-store"}});
    }

    const readable=method==="GET" && /classList|classStatus/i.test(meta.action);
    const fresh=cache.get(meta.key);
    if(readable && fresh && Date.now()-fresh.time<4500)return response(fresh);
    if(readable && inflight.has(meta.key))return response(await inflight.get(meta.key));

    const task=(async()=>{
      let err;
      for(const ms of readable?[5000,5500]:[6500,7000]){
        try{
          const safe={...init};delete safe.signal;
          const r=await timed(input,safe,ms),body=await r.text();
          if(!r.ok)throw new Error(`HTTP ${r.status}`);
          const item={body,status:r.status,headers:{"Content-Type":r.headers.get("Content-Type")||"application/json;charset=utf-8"},time:Date.now()};
          if(readable)cache.set(meta.key,item);
          return item;
        }catch(e){err=e}
      }
      if(readable && fresh && Date.now()-fresh.time<180000)return fresh;
      throw err||new Error("Server sedang lambat");
    })();

    if(readable)inflight.set(meta.key,task);
    try{return response(await task)}finally{if(readable)inflight.delete(meta.key)}
  };
})();
