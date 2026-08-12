(()=>{
"use strict";
const API="https://paibp-smart-api.sunarso29.workers.dev";
const KEY="b082937b2165453ba7d9f81ecac063b00310b339ec0643da";
const NEW_ORIGIN="https://paibpsmart.github.io";
const OLD_PREFIX="/paibp-smart";
const DB_NAME="paibp-smart-news-editor-v96";
const STORE="posts";
const CACHE_KEY="spensus-news-ig-cache-v102";
const DONE_KEY="paibp-legacy-news-migrated-v129";
let redirected=false;

function targetUrl(){
  let path=location.pathname||"/";
  if(path===OLD_PREFIX) path="/";
  else if(path.indexOf(OLD_PREFIX+"/")===0) path=path.slice(OLD_PREFIX.length)||"/";
  else path="/";
  return NEW_ORIGIN+path+(location.search||"")+(location.hash||"");
}
function go(){if(redirected)return;redirected=true;location.replace(targetUrl())}
function status(text){const el=document.getElementById("migration-status");if(el)el.textContent=text}
function clean(v,max=5000){return String(v??"").replace(/[\u0000-\u001f\u007f]/g," ").trim().slice(0,max)}
function splitText(text,size=24000){text=String(text||"");const out=[];for(let i=0;i<text.length;i+=size)out.push(text.slice(i,i+size));return out.length?out:[""]}
function photoSources(x){
  const out=[];
  const add=v=>{
    if(!v)return;
    const type=String(v?.type||v?.kind||"").toLowerCase();
    if(type==="video"||type==="audio")return;
    const s=typeof v==="string"?v:(v.src||v.full||v.thumbnail||v.url||"");
    if(s&&!out.includes(s))out.push(s);
  };
  (Array.isArray(x?.media)?x.media:[]).forEach(add);
  (Array.isArray(x?.images)?x.images:[]).forEach(add);
  add(x?.thumbnail);add(x?.coverDataUrl);add(x?.coverUrl);
  return out.slice(0,10);
}
function attachmentItems(id,x){
  const raw=[];
  const addMany=v=>{
    if(Array.isArray(v)){raw.push(...v);return}
    if(!v||typeof v!=="object")return;
    for(const k of ["items","attachments","media","videos"]){if(Array.isArray(v[k]))raw.push(...v[k])}
  };
  try{addMany(JSON.parse(localStorage.getItem(`paibp-news-media:${id}`)||"null"))}catch{}
  addMany(x?.attachments);
  const seen=new Set(),out=[];
  for(const v of raw){
    if(!v)continue;
    const type=String(v.type||v.kind||"").toLowerCase();
    const url=String(v.url||v.secure_url||v.secureUrl||v.src||"");
    if(!(type==="video"||type==="audio")||!/^https:\/\//i.test(url))continue;
    const publicId=String(v.publicId||v.public_id||"");
    const name=String(v.name||v.title||`${type} ${out.length+1}`);
    const key=`${type}|${publicId||url}|${name}`.toLowerCase();
    if(seen.has(key))continue;seen.add(key);
    out.push({...v,id:String(v.id||v.attachmentId||publicId||`${type}-${out.length+1}`),type,url,publicId,name,title:String(v.title||name),order:out.length+1,storage:String(v.storage||"cloudinary-free")});
  }
  return out;
}
async function post(action,data){
  const r=await fetch(API,{method:"POST",cache:"no-store",headers:{"Content-Type":"text/plain;charset=UTF-8","Accept":"application/json"},body:JSON.stringify({action,readKey:KEY,key:KEY,data:{...data,readKey:KEY},origin:location.origin})});
  const text=await r.text();let j={};try{j=JSON.parse(text)}catch{}
  if(!r.ok||j?.ok===false)throw new Error(j?.error||`HTTP ${r.status}`);
  return j;
}
function localPosts(){
  return new Promise(resolve=>{
    let settled=false;const finish=v=>{if(settled)return;settled=true;resolve(Array.isArray(v)?v:[])};
    const timer=setTimeout(()=>finish([]),1800);
    try{
      const q=indexedDB.open(DB_NAME,1);
      q.onerror=()=>{clearTimeout(timer);finish([])};
      q.onupgradeneeded=()=>{if(!q.result.objectStoreNames.contains(STORE))q.result.createObjectStore(STORE,{keyPath:"id"})};
      q.onsuccess=()=>{
        try{
          const db=q.result;if(!db.objectStoreNames.contains(STORE)){clearTimeout(timer);finish([]);return}
          const tx=db.transaction(STORE,"readonly"),req=tx.objectStore(STORE).getAll();
          req.onsuccess=()=>{clearTimeout(timer);finish(req.result||[])};
          req.onerror=()=>{clearTimeout(timer);finish([])};
        }catch{clearTimeout(timer);finish([])}
      };
    }catch{clearTimeout(timer);finish([])}
  });
}
function cachedPosts(){
  try{const raw=JSON.parse(localStorage.getItem(CACHE_KEY)||"null");return Array.isArray(raw?.items)?raw.items:[]}catch{return[]}
}
function mergePosts(local,cache){
  const map=new Map();
  for(const x of cache||[]){if(x?.id&&x?.title)map.set(String(x.id),x)}
  for(const x of local||[]){if(!x?.id||!x?.title)continue;if(x.status==="draft"&&!x.publishedAt)continue;map.set(String(x.id),{...(map.get(String(x.id))||{}),...x})}
  return [...map.values()].filter(x=>x?.id&&x?.title&&x?.date).sort((a,b)=>String(a.date||"").localeCompare(String(b.date||""))).slice(-50);
}
async function compressDataUrl(src){
  const s=String(src||"");
  if(!s.startsWith("data:image/"))return s;
  if(s.length<=50000)return s;
  try{
    const blob=await (await fetch(s)).blob(),bmp=await createImageBitmap(blob);let best="";
    for(const w0 of [960,800,720,640,560,480,420,360]){
      const scale=Math.min(1,w0/bmp.width),w=Math.max(1,Math.round(bmp.width*scale)),h=Math.max(1,Math.round(bmp.height*scale));
      for(const q of [.58,.48,.40,.34,.28]){
        const c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d",{alpha:false}).drawImage(bmp,0,0,w,h);
        const out=await new Promise(r=>c.toBlob(r,"image/webp",q));
        best=await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(String(fr.result||""));fr.onerror=()=>rej(fr.error);fr.readAsDataURL(out)});
        if(best.length<=50000){bmp.close?.();return best}
      }
    }
    bmp.close?.();return best.length<1200000?best:"";
  }catch{return s.length<1200000?s:""}
}
async function migrateOne(x,index,total){
  const id=clean(x.id,120),title=clean(x.title||"Berita Spensus",240),date=clean(x.date,40),summary=clean(x.summary||x.content||"",5000),content=String(x.content||x.summary||"");
  if(!id||!title||!date)return false;
  status(`Memulihkan berita lama ${index+1}/${total}: ${title.slice(0,55)}…`);
  const sources=photoSources(x),photoKeys=[];
  for(let i=0;i<sources.length;i++){
    const data=await compressDataUrl(sources[i]);if(!data)continue;
    const key=`news:${id}:photo:${i+1}`;
    await post("contentUpsert",{key,value:{kind:"photo",data,name:`Foto ${i+1}`},authorName:x.author||"Sunarso, S.Pd.I, Gr",authorSchool:"SMP Negeri 1 Susukan"});
    photoKeys.push(key);
  }
  const bodyKeys=[],parts=splitText(content,24000);
  for(let i=0;i<parts.length;i++){
    const key=`news:${id}:body:${i+1}`;
    await post("contentUpsert",{key,value:{kind:"body",text:parts[i]},authorName:x.author||"Sunarso, S.Pd.I, Gr",authorSchool:"SMP Negeri 1 Susukan"});
    bodyKeys.push(key);
  }
  const attachments=attachmentItems(id,x);
  if(attachments.length){
    const value={schema:"news-attachments-v118",newsId:id,updatedAt:new Date().toISOString(),storage:"cloudinary-free",items:attachments.map((a,i)=>({...a,order:i+1}))};
    await post("contentUpsert",{key:`news:${id}:attachments`,value,authorName:x.author||"Sunarso, S.Pd.I, Gr",authorSchool:"SMP Negeri 1 Susukan"});
    await post("contentUpsert",{key:`news-media:${id}`,value,authorName:x.author||"Sunarso, S.Pd.I, Gr",authorSchool:"SMP Negeri 1 Susukan"});
  }
  const firstHttp=sources.find(u=>/^https:\/\//i.test(String(u||"")))||"";
  await post("newsUpsert",{id,title,date,summary,imageUrl:firstHttp,authorName:x.author||"Sunarso, S.Pd.I, Gr",authorSchool:"SMP Negeri 1 Susukan",isPublished:true,sortOrder:Number(x.sortOrder||0)||-Date.now()});
  await post("contentUpsert",{key:`news:${id}`,value:{schema:"chunks-v102",id,title,date,category:x.category||"Berita Sekolah",summary,photoKeys,bodyKeys,coverKey:photoKeys[0]||"",year:Number(x.year||date.slice(0,4))||0,month:Number(x.month||date.slice(5,7))||0,author:x.author||"Sunarso, S.Pd.I, Gr",migratedFrom:"legacy-browser-v129",attachmentCount:attachments.length},authorName:x.author||"Sunarso, S.Pd.I, Gr",authorSchool:"SMP Negeri 1 Susukan"});
  return true;
}
async function run(){
  if(localStorage.getItem(DONE_KEY)){go();return}
  const [local,cache]=await Promise.all([localPosts(),Promise.resolve(cachedPosts())]),posts=mergePosts(local,cache);
  if(!posts.length){go();return}
  status(`Ditemukan ${posts.length} berita lama. Memindahkan ke database baru…`);
  let ok=0,failed=0;
  for(let i=0;i<posts.length;i++){
    try{if(await migrateOne(posts[i],i,posts.length))ok++}catch(e){failed++;console.warn("Legacy news migration",posts[i]?.id,e)}
  }
  if(ok>0){try{localStorage.setItem(DONE_KEY,JSON.stringify({at:new Date().toISOString(),ok,failed}))}catch{}}
  status(`Pemulihan selesai: ${ok} berita berhasil${failed?`, ${failed} gagal`:""}. Membuka alamat baru…`);
  setTimeout(go,700);
}
setTimeout(go,60000);
run().catch(()=>go());
})();
