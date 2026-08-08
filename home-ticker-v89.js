(() => {
  "use strict";
  const target=document.querySelector("#smart-ticker-text");
  if(!target) return;
  const fallback="Visi: mewujudkan pendidikan berkualitas, berkarakter, berprestasi, berakhlak mulia, dan adaptif terhadap teknologi. Misi: menguatkan iman dan karakter; meningkatkan literasi, numerasi, kreativitas, serta prestasi; membangun pembelajaran aman, ramah, kolaboratif, peduli lingkungan, dan berwawasan global.";
  function latest(){const h=document.querySelector("#news-gallery .news-card h4");const p=document.querySelector("#news-gallery .news-card p");return h?`Pembaruan terbaru: ${h.textContent.trim()}${p?.textContent?.trim()?` — ${p.textContent.trim()}`:""}`:"";}
  let turn=0;
  function render(){const school=window.PAIBP_SCHOOL?.school;const vision=school?.tickerFallback||fallback;const news=latest();target.textContent=(news && (turn++%2))?news:vision;}
  function start(){render();window.setInterval(render,12000);}
  if(window.PAIBP_SCHOOL){start();return;}
  const existing=[...document.scripts].find(s=>String(s.src||"").includes("school-data.js"));
  if(existing){existing.addEventListener("load",start,{once:true});setTimeout(start,500);return;}
  const s=document.createElement("script");s.src=new URL("school-data.js?v=89",document.baseURI).href;s.defer=true;s.onload=start;s.onerror=start;document.head.append(s);
})();
