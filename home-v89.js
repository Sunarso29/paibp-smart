(() => {
  "use strict";
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  if(page!=="index.html") return;
  const ticker=document.querySelector('#smart-ticker-text');
  if(!ticker) return;
  let timer=0,index=0;
  function messages(){
    const school=window.PAIBP_SCHOOL?.school;
    const fallback=String(school?.tickerFallback||"").trim();
    const split=fallback.split(/\s+Misi\s*:\s*/i);
    const vision=(split[0]||"Visi: mewujudkan pendidikan berkualitas, berkarakter, berprestasi, berakhlak mulia, dan adaptif terhadap teknologi.").replace(/^Visi\s*:\s*/i,"").trim();
    const mission=(split[1]||"Menguatkan iman dan karakter; meningkatkan literasi, numerasi, kreativitas, serta prestasi; membangun pembelajaran aman, ramah, kolaboratif, peduli lingkungan, dan berwawasan global.").trim();
    const latest=document.querySelector('#news-gallery .news-card h4')?.textContent?.trim();
    const latestSummary=document.querySelector('#news-gallery .news-card p')?.textContent?.trim();
    const list=[`VISI SPENSUS • ${vision}`,`MISI SPENSUS • ${mission}`];
    if(latest) list.push(`SPENSUS TERKINI • ${latest}${latestSummary?` — ${latestSummary}`:""}`);
    return list;
  }
  function paint(){const list=messages();ticker.textContent=list[index%list.length];index=(index+1)%list.length;}
  function start(){clearInterval(timer);paint();timer=setInterval(paint,8500);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
})();
