(() => {
  "use strict";
  const data=window.PAIBP_SCHOOL||{school:{},teachers:[],staff:[]};
  const esc=(v)=>String(v??"").replace(/[&<>"']/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  document.querySelectorAll("[data-about-tab]").forEach((button)=>button.addEventListener("click",()=>{
    const id=button.dataset.aboutTab;
    document.querySelectorAll("[data-about-tab]").forEach((item)=>item.setAttribute("aria-pressed",String(item===button)));
    document.querySelectorAll("[data-about-panel]").forEach((panel)=>panel.hidden=panel.dataset.aboutPanel!==id);
    history.replaceState(null,"",`#${id}`);
  }));
  const overview=document.querySelector("#about-overview-v29");
  if(overview) overview.innerHTML=(data.school?.overview||[]).map((p)=>`<p>${esc(p)}</p>`).join("");
  const vision=document.querySelector("#about-vision-v29"); if(vision&&data.school?.tickerFallback) vision.textContent=data.school.tickerFallback;
  function render(items,grid,count,query=""){
    const q=query.trim().toLowerCase(); const shown=items.filter((item)=>`${item.name||""} ${item.subject||item.role||""}`.toLowerCase().includes(q));
    if(count) count.textContent=`${shown.length} profil ditampilkan`;
    if(grid) grid.innerHTML=shown.map((item)=>`<article class="directory-card"><div class="directory-photo"><img src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy"></div><div><small>${esc(item.subject||item.role||"Keluarga Spensus")}</small><h3>${esc(item.name)}</h3><span>SMP Negeri 1 Susukan</span></div></article>`).join("");
  }
  const tg=document.querySelector("#about-teacher-grid-v29"),tc=document.querySelector("#about-teacher-count-v29"),ts=document.querySelector("#about-teacher-search-v29");
  const sg=document.querySelector("#about-staff-grid-v29"),sc=document.querySelector("#about-staff-count-v29"),ss=document.querySelector("#about-staff-search-v29");
  render(data.teachers||[],tg,tc); render(data.staff||[],sg,sc);
  ts?.addEventListener("input",()=>render(data.teachers||[],tg,tc,ts.value)); ss?.addEventListener("input",()=>render(data.staff||[],sg,sc,ss.value));
})();