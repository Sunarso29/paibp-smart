(()=>{
"use strict";
const API="https://paibp-smart-api.sunarso29.workers.dev";
const KEY="b082937b2165453ba7d9f81ecac063b00310b339ec0643da";
const NEW_ORIGIN="https://paibpsmart.github.io";
const OLD_PREFIX="/paibp-smart";
const KNOWN_DB="paibp-smart-news-editor-v96";
const KNOWN_STORE="posts";
const CACHE_KEY="spensus-news-ig-cache-v102";
const DONE_KEY="paibp-legacy-news-migrated-v130";
const PROBE_KEY="migration:legacy-browser-probe-v130";
let redirected=false;

function status(text){const el=document.getElementById("migration-status");if(el)el.textContent=text}
function targetUrl(){let path=location.pathname||"/";if(path===OLD_PREFIX)path="/";else if(path.indexOf(OLD_PREFIX+"/")===0)path=path.slice(OLD_PREFIX.length)||"/";else path="/";return NEW_ORIGIN+path+(location.search||"").replace(/([?&])recovery=v130(&|$)/,"$1").replace(/[?&]$/,"")+(location.hash||"")}
function go(delay=700){if(redirected)return;redirected=true;setTimeout(()=>location.replace(targetUrl()),delay)}
function clean(v,max=5000){return String(v??"").replace(/[\u0000-\u001f\u007f]/g," ").trim().slice(0,max)}
function splitText(text,size=24000){text=String(text||"");const out=[];for(let i=0;i<text.length;i+=size)out.push(text.slice(i,i+size));return out.length?out:[""]}
function hash(s){let h=2166136261;for(const c of String(s||"")){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
function idFor(x){const id=clean(x?.id||x?.articleId||x?.serverId,120);return id||`news-recovered-${clean(x?.date,10)||"unknown"}-${hash(`${x?.title}|${x?.date}|${x?.summary||x?.content||""}`)}`}
function validDate(v){return /^20\d\d-\d\d-\d\d/.test(String(v||""))}
function newsLike(x,source="generic"){
  if(!x||typeof x!=="object"||Array.isArray(x))return false;
  const title=clean(x.title||x.judul,300),date=clean(x.date||x.tanggal||x.activityDate,40);
  if(title.length<4||!validDate(date))return false;
  const statusName=String(x.status||"").toLowerCase();
  if(statusName==="draft"&&!x.publishedAt&&!x.isPublished)return false;
  if(source==="known-db"||source==="known-cache")return true;
  const id=String(x.id||"");
  const strong=Boolean(x.publishedAt||x.isPublished===true||statusName==="published"||/^news-/i.test(id));
  const body=String(x.summary||x.content||x.isi||"");
  return strong&&body.trim().length>=8;
}
function normalizeNews(x,source){
  const title=clean(x.title||x.judul,300),date=clean(x.date||x.tanggal||x.activityDate,40).slice(0,10);
  return {...x,id:idFor({...x,title,date}),title,date,summary:clean(x.summary||x.ringkasan||x.content||x.isi||"",5000),content:String(x.content||x.isi||x.summary||x.ringkasan||""),category:clean(x.category||x.kategori||"Berita Sekolah",100),author:clean(x.author||x.authorName||x.penulis||"Sunarso, S.Pd.I, Gr",160),_recoverySource:source};
}
function collectNested(value,source,out,depth=0){
  if(depth>3||value==null)return;
  if(Array.isArray(value)){for(const v of value.slice(0,500))collectNested(v,source,out,depth+1);return}
  if(typeof value!=="object")return;
  if(newsLike(value,source)){out.push(normalizeNews(value,source));return}
  for(const key of ["items","news","posts","articles","data","records"]){if(value[key]!=null)collectNested(value[key],source,out,depth+1)}
}
async function post(action,data){
  const r=await fetch(API,{method:"POST",cache:"no-store",headers:{"Content-Type":"text/plain;charset=UTF-8","Accept":"application/json"},body:JSON.stringify({action,readKey:KEY,key:KEY,data:{...data,readKey:KEY},origin:location.origin})});
  const text=await r.text();let j={};try{j=JSON.parse(text)}catch{}
  if(!r.ok||j?.ok===false)throw new Error(j?.error||`HTTP ${r.status}`);return j;
}
async function probe(value){try{await post("contentUpsert",{key:PROBE_KEY,value,authorName:"Legacy Recovery V130",authorSchool:"PAIBP SMART",updatedAt:new Date().toISOString()});return true}catch(e){console.warn("probe",e);return false}}

function readStore(dbName,storeName,limit=500){return new Promise(resolve=>{
  let settled=false;const done=v=>{if(settled)return;settled=true;resolve(Array.isArray(v)?v:[])};const timer=setTimeout(()=>done([]),3500);
  try{
    const req=indexedDB.open(dbName);req.onerror=()=>{clearTimeout(timer);done([])};
    req.onsuccess=()=>{const db=req.result;try{if(!db.objectStoreNames.contains(storeName)){db.close();clearTimeout(timer);done([]);return}const tx=db.transaction(storeName,"readonly"),store=tx.objectStore(storeName),items=[],cur=store.openCursor();cur.onsuccess=()=>{const c=cur.result;if(!c||items.length>=limit){db.close();clearTimeout(timer);done(items);return}items.push(c.value);c.continue()};cur.onerror=()=>{db.close();clearTimeout(timer);done(items)}}catch{try{db.close()}catch{}clearTimeout(timer);done([])}};
  }catch{clearTimeout(timer);done([])}
})}
async function databaseNames(){const set=new Set([KNOWN_DB]);try{if(indexedDB.databases){const rows=await indexedDB.databases();for(const row of rows||[]){if(row?.name)set.add(row.name)}}}catch{}return [...set].filter(Boolean).slice(0,40)}
async function scanIndexedDb(){
  const names=await databaseNames(),found=[],details=[];
  for(const name of names){
    let stores=[];
    try{stores=await new Promise(resolve=>{let settled=false;const done=v=>{if(settled)return;settled=true;resolve(v)};const timer=setTimeout(()=>done([]),1800);const r=indexedDB.open(name);r.onerror=()=>{clearTimeout(timer);done([])};r.onsuccess=()=>{const db=r.result;const s=[...db.objectStoreNames];db.close();clearTimeout(timer);done(s)}})}catch{}
    if(name===KNOWN_DB&&!stores.includes(KNOWN_STORE))stores.push(KNOWN_STORE);
    let count=0;
    for(const store of stores.slice(0,30)){
      const rows=await readStore(name,store,500),tmp=[];
      for(const row of rows)collectNested(row,name===KNOWN_DB&&store===KNOWN_STORE?"known-db":"generic",tmp);
      found.push(...tmp);count+=tmp.length;
    }
    details.push({name,stores:stores.slice(0,30),newsCandidates:count});
  }
  return {names,details,found};
}
function scanLocalStorage(){
  const found=[],keys=[],errors=[];
  try{
    const known=JSON.parse(localStorage.getItem(CACHE_KEY)||"null");collectNested(known,"known-cache",found);
  }catch(e){errors.push(`known-cache:${e?.message||e}`)}
  try{
    for(let i=0;i<Math.min(localStorage.length,250);i++){
      const key=localStorage.key(i);if(!key||key===CACHE_KEY||key===DONE_KEY)continue;keys.push(key);
      let raw="";try{raw=localStorage.getItem(key)||""}catch{continue}
      if(raw.length<2||raw.length>5000000)continue;
      const t=raw.trim();if(!(t.startsWith("{")||t.startsWith("[")))continue;
      try{collectNested(JSON.parse(t),"generic",found)}catch{}
    }
  }catch(e){errors.push(String(e?.message||e))}
  return {found,keys:keys.slice(0,80),errors};
}
function mergePosts(rows){const map=new Map();for(const x of rows){if(!x?.title||!validDate(x.date))continue;const id=idFor(x);const old=map.get(id)||{};map.set(id,{...old,...x,id,media:Array.isArray(x.media)&&x.media.length?x.media:old.media,images:Array.isArray(x.images)&&x.images.length?x.images:old.images})}return [...map.values()].sort((a,b)=>String(a.date).localeCompare(String(b.date))).slice(-100)}
function photoSources(x){
  const out=[];const add=v=>{if(!v)return;const type=String(v?.type||v?.kind||"").toLowerCase();if(type==="video"||type==="audio")return;const s=typeof v==="string"?v:(v.src||v.full||v.thumbnail||v.url||v.secure_url||"");if(!s||out.includes(s))return;if(/^data:image\//i.test(s)||/^https:\/\//i.test(s))out.push(s)};
  (Array.isArray(x?.media)?x.media:[]).forEach(add);(Array.isArray(x?.images)?x.images:[]).forEach(add);add(x?.thumbnail);add(x?.coverDataUrl);add(x?.coverUrl);add(x?.imageUrl);return out.slice(0,10)
}
function attachmentItems(id,x){
  const raw=[];const addMany=v=>{if(Array.isArray(v)){raw.push(...v);return}if(!v||typeof v!=="object")return;for(const k of ["items","attachments","media","videos"]){if(Array.isArray(v[k]))raw.push(...v[k])}};
  try{addMany(JSON.parse(localStorage.getItem(`paibp-news-media:${id}`)||"null"))}catch{}addMany(x?.attachments);addMany(x?.media);
  const seen=new Set(),out=[];for(const v of raw){if(!v||typeof v!=="object")continue;const type=String(v.type||v.kind||"").toLowerCase(),url=String(v.url||v.secure_url||v.secureUrl||v.src||"");if(!(type==="video"||type==="audio")||!/^https:\/\//i.test(url))continue;const publicId=String(v.publicId||v.public_id||""),name=String(v.name||v.title||`${type} ${out.length+1}`),k=`${type}|${publicId||url}|${name}`.toLowerCase();if(seen.has(k))continue;seen.add(k);out.push({...v,id:String(v.id||v.attachmentId||publicId||`${type}-${out.length+1}`),type,url,publicId,name,title:String(v.title||name),order:out.length+1,storage:String(v.storage||"cloudinary-free")})}return out
}
async function compressDataUrl(src){
  const s=String(src||"");if(!s.startsWith("data:image/"))return s;if(s.length<=50000)return s;
  try{const blob=await(await fetch(s)).blob(),bmp=await createImageBitmap(blob);let best="";for(const w0 of [960,800,720,640,560,480,420,360]){const scale=Math.min(1,w0/bmp.width),w=Math.max(1,Math.round(bmp.width*scale)),h=Math.max(1,Math.round(bmp.height*scale));for(const q of [.58,.48,.40,.34,.28]){const c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d",{alpha:false}).drawImage(bmp,0,0,w,h);const out=await new Promise(r=>c.toBlob(r,"image/webp",q));best=await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(String(fr.result||""));fr.onerror=()=>rej(fr.error);fr.readAsDataURL(out)});if(best.length<=50000){bmp.close?.();return best}}}bmp.close?.();return best.length<1200000?best:""}catch{return s.length<1200000?s:""}
}
async function migrateOne(x,index,total){
  const id=idFor(x),title=clean(x.title,300),date=clean(x.date,40).slice(0,10),summary=clean(x.summary||x.content||"",5000),content=String(x.content||x.summary||"");if(!id||!title||!date)return false;
  status(`V130 memulihkan ${index+1}/${total}: ${title.slice(0,58)}…`);
  const sources=photoSources(x),photoKeys=[];
  for(let i=0;i<sources.length;i++){const data=await compressDataUrl(sources[i]);if(!data)continue;const key=`news:${id}:photo:${i+1}`;await post("contentUpsert",{key,value:{kind:"photo",data,name:`Foto ${i+1}`},authorName:x.author||"Sunarso, S.Pd.I, Gr",authorSchool:"SMP Negeri 1 Susukan"});photoKeys.push(key)}
  const bodyKeys=[],parts=splitText(content,24000);for(let i=0;i<parts.length;i++){const key=`news:${id}:body:${i+1}`;await post("contentUpsert",{key,value:{kind:"body",text:parts[i]},authorName:x.author||"Sunarso, S.Pd.I, Gr",authorSchool:"SMP Negeri 1 Susukan"});bodyKeys.push(key)}
  const attachments=attachmentItems(id,x);if(attachments.length){const value={schema:"news-attachments-v118",newsId:id,updatedAt:new Date().toISOString(),storage:"cloudinary-free",items:attachments.map((a,i)=>({...a,order:i+1}))};await post("contentUpsert",{key:`news:${id}:attachments`,value,authorName:x.author||"Sunarso, S.Pd.I, Gr",authorSchool:"SMP Negeri 1 Susukan"});await post("contentUpsert",{key:`news-media:${id}`,value,authorName:x.author||"Sunarso, S.Pd.I, Gr",authorSchool:"SMP Negeri 1 Susukan"})}
  const firstHttp=sources.find(u=>/^https:\/\//i.test(String(u||"")))||"";await post("newsUpsert",{id,title,date,summary,imageUrl:firstHttp,authorName:x.author||"Sunarso, S.Pd.I, Gr",authorSchool:"SMP Negeri 1 Susukan",isPublished:true,sortOrder:Number(x.sortOrder||0)||-Date.now()});
  await post("contentUpsert",{key:`news:${id}`,value:{schema:"chunks-v102",id,title,date,category:x.category||"Berita Sekolah",summary,photoKeys,bodyKeys,coverKey:photoKeys[0]||"",year:Number(x.year||date.slice(0,4))||0,month:Number(x.month||date.slice(5,7))||0,author:x.author||"Sunarso, S.Pd.I, Gr",migratedFrom:`legacy-browser-v130:${x._recoverySource||"unknown"}`,attachmentCount:attachments.length},authorName:x.author||"Sunarso, S.Pd.I, Gr",authorSchool:"SMP Negeri 1 Susukan"});return true
}
async function retireWorkers(){try{if("serviceWorker" in navigator){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(r=>r.unregister().catch(()=>false)))}}catch{}}
async function run(){
  status("V130 memeriksa penyimpanan berita lama…");
  await retireWorkers();
  const indexed=await scanIndexedDb(),local=scanLocalStorage(),posts=mergePosts([...indexed.found,...local.found]);
  const baseProbe={version:"130",at:new Date().toISOString(),origin:location.origin,path:location.pathname,userAgent:navigator.userAgent,dbNames:indexed.names,dbDetails:indexed.details,indexedCandidates:indexed.found.length,localCandidates:local.found.length,mergedCount:posts.length,localKeys:local.keys,storageErrors:local.errors};
  await probe({...baseProbe,phase:"scanned"});
  if(!posts.length){status("V130 selesai memeriksa: 0 berita lama ditemukan di browser ini. Membuka alamat baru…");try{localStorage.setItem(DONE_KEY,JSON.stringify({...baseProbe,ok:0,failed:0}))}catch{}go(2200);return}
  status(`V130 menemukan ${posts.length} berita lama. Memindahkan ke database baru…`);
  let ok=0,failed=0,errors=[];for(let i=0;i<posts.length;i++){try{if(await migrateOne(posts[i],i,posts.length))ok++}catch(e){failed++;errors.push({id:posts[i]?.id,title:posts[i]?.title,error:String(e?.message||e).slice(0,240)})}}
  const finalProbe={...baseProbe,phase:"complete",completedAt:new Date().toISOString(),ok,failed,errors:errors.slice(0,20)};await probe(finalProbe);
  try{localStorage.setItem(DONE_KEY,JSON.stringify(finalProbe))}catch{}
  status(`Pemulihan V130 selesai: ${ok} berita berhasil${failed?`, ${failed} gagal`:""}. Membuka alamat baru…`);go(1600)
}
setTimeout(()=>go(0),90000);run().catch(async e=>{status(`Pemulihan V130 berhenti: ${String(e?.message||e).slice(0,160)}. Membuka alamat baru…`);await probe({version:"130",phase:"fatal",at:new Date().toISOString(),origin:location.origin,error:String(e?.message||e).slice(0,500)});go(2500)});
})();
