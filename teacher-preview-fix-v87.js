(() => {
  "use strict";
  const BUILD="87";
  const $=(s,r=document)=>r?.querySelector?.(s)||null;
  const $$=(s,r=document)=>[...(r?.querySelectorAll?.(s)||[])];

  function normalizeIdentityText(el){
    const text=String(el.textContent||"").replace(/\u00a0/g," ").trim();
    if(/^Penyusun\s*:/i.test(text)){
      el.textContent="Penyusun : Sunarso, S.Pd.I, Gr";
      return;
    }
    if(/^Nama\s+Penyusun\s*:/i.test(text)){
      el.textContent="Nama Penyusun : Sunarso, S.Pd.I, Gr";
    }
  }

  function isSignatureText(text){
    const t=String(text||"").replace(/\s+/g," ").trim();
    const hasKnow=/\bMengetahui\b/i.test(t);
    const hasHead=/\bKepala\s+(?:SMP|Sekolah)\b/i.test(t);
    const hasTeacher=/\bGuru\s+(?:PAIBP|Mata\s+Pelajaran)/i.test(t);
    const hasNip=/\bNIP\.?\s*\d/i.test(t);
    const hasDate=/\bSusukan\s+(?:Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+20\d{2}\b/i.test(t);
    return (hasKnow && (hasHead||hasTeacher||hasNip)) || (hasHead&&hasTeacher) || (hasDate&&hasTeacher&&hasNip);
  }

  function sanitizeExactPreview(){
    const target=$("#teacher-document");
    if(!target)return false;
    const source=target.querySelector("[data-v84-source]");
    if(!source)return false;

    const paras=$$(".v84-source-paragraph",source);
    paras.forEach((p,index)=>{
      const text=String(p.textContent||"").replace(/\u00a0/g," ").trim();
      if(/^(?:Top|Bottom)\s+of\s+Form$/i.test(text)){
        p.remove();
        return;
      }
      normalizeIdentityText(p);
      if(index>=Math.floor(paras.length*.68) && /^(?:Mengetahui\b|Kepala\s+(?:SMP|Sekolah)\b|Guru\s+(?:PAIBP|Mata\s+Pelajaran)\b|NIP\.?\s*\d|Susukan\s+(?:Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+20\d{2})/i.test(text)){
        p.remove();
      }
    });

    $$(".v84-table-scroll",source).forEach((wrap)=>{
      const text=String(wrap.textContent||"").replace(/\u00a0/g," ").replace(/\s+/g," ").trim();
      if(!text || isSignatureText(text)){
        wrap.remove();
        return;
      }
      $$("td",wrap).forEach(normalizeIdentityText);
    });

    target.dataset.v87PreviewSanitized="true";
    return true;
  }

  function grade(){
    return $('[data-teacher-grade][aria-pressed="true"]')?.dataset.teacherGrade || "VIII";
  }
  function effectiveKey(){return `paibp-smart-effective-v1-${grade()}`;}
  function readAdjustments(){try{return JSON.parse(localStorage.getItem(effectiveKey()))||{};}catch{return {};}}
  function weekdays(year,month){
    const d=new Date(year,month,1);let n=0;
    while(d.getMonth()===month){const day=d.getDay();if(day!==0&&day!==6)n++;d.setDate(d.getDate()+1);}return n;
  }
  function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[c]);}

  function attachEffectiveInputs(){
    const inputs=$$("#teacher-document [data-effective-key]");
    if(!inputs.length)return;
    const update=()=>{
      const saved={};let work=0,off=0,effective=0;
      inputs.forEach(input=>{
        const row=input.closest("tr");
        const wd=Number(row?.querySelector("[data-weekdays]")?.dataset.weekdays||0);
        const adj=Math.min(wd,Math.max(0,Number(input.value)||0));
        input.value=adj;input.setAttribute("value",String(adj));
        row.querySelector(".effective-result").textContent=String(wd-adj);
        saved[input.dataset.effectiveKey]=adj;work+=wd;off+=adj;effective+=wd-adj;
      });
      $("#effective-weekday-total")&&( $("#effective-weekday-total").textContent=String(work) );
      $("#effective-adjustment-total")&&( $("#effective-adjustment-total").textContent=String(off) );
      $("#effective-result-total")&&( $("#effective-result-total").textContent=String(effective) );
      try{localStorage.setItem(effectiveKey(),JSON.stringify(saved));}catch{}
    };
    inputs.forEach(input=>input.addEventListener("input",update));
    update();
  }

  function renderEffective(){
    const active=$('[data-teacher-doc="effective"][aria-pressed="true"]');
    const target=$("#teacher-document");
    if(!active||!target)return false;
    const months=[
      [2026,6,"Juli 2026","Gasal"],[2026,7,"Agustus 2026","Gasal"],[2026,8,"September 2026","Gasal"],[2026,9,"Oktober 2026","Gasal"],[2026,10,"November 2026","Gasal"],[2026,11,"Desember 2026","Gasal"],
      [2027,0,"Januari 2027","Genap"],[2027,1,"Februari 2027","Genap"],[2027,2,"Maret 2027","Genap"],[2027,3,"April 2027","Genap"],[2027,4,"Mei 2027","Genap"],[2027,5,"Juni 2027","Genap"]
    ];
    const saved=readAdjustments();
    target.removeAttribute("data-v84-signature");
    target.innerHTML=`<section class="v87-effective-document" data-v87-effective="${BUILD}">
      <header class="v87-effective-head"><span>ANALISIS HARI EFEKTIF</span><h2>PAIBP Kelas ${esc(grade())} • Tahun Ajaran 2026/2027</h2><p>Satuan Pendidikan: SMP Negeri 1 Susukan • Penyusun: Sunarso, S.Pd.I, Gr</p></header>
      <section class="document-section"><div class="warning"><strong>Cara menggunakan:</strong> hari Senin–Jumat dihitung otomatis. Isikan jumlah hari libur atau kegiatan nonpembelajaran sesuai Kalender Pendidikan yang berlaku. Hasil tersimpan pada perangkat guru.</div>
      <div class="v87-effective-scroll"><table class="data-table effective-table"><thead><tr><th>Semester</th><th>Bulan</th><th>Hari Senin–Jumat</th><th>Libur/Kegiatan Non-Efektif</th><th>Hari Efektif</th></tr></thead><tbody>${months.map(([year,month,label,semester])=>{const wd=weekdays(year,month);const key=`${year}-${String(month+1).padStart(2,"0")}`;const adj=Math.min(wd,Math.max(0,Number(saved[key])||0));return `<tr><td>${semester}</td><td>${label}</td><td data-weekdays="${wd}">${wd}</td><td><input type="number" min="0" max="${wd}" value="${adj}" data-effective-key="${key}" aria-label="Hari non-efektif ${label}"></td><td class="effective-result">${wd-adj}</td></tr>`;}).join("")}</tbody><tfoot><tr class="total-row"><td colspan="2"><strong>Total</strong></td><td id="effective-weekday-total"></td><td id="effective-adjustment-total"></td><td id="effective-result-total"></td></tr></tfoot></table></div>
      <p class="document-note">Analisis ini khusus hari efektif. CP, ATP, KKTP, Prota, dan Promes tetap menggunakan preview sumber masing-masing dan tidak digabung ke tabel ini.</p></section>
    </section>`;
    attachEffectiveInputs();
    return true;
  }

  function scheduleSanitize(){[60,180,520,1100].forEach(ms=>setTimeout(sanitizeExactPreview,ms));}
  function scheduleEffective(){[80,240,650].forEach(ms=>setTimeout(renderEffective,ms));}

  document.addEventListener("click",(event)=>{
    const doc=event.target.closest("[data-teacher-doc]");
    const gradeBtn=event.target.closest("[data-teacher-grade]");
    if(doc){
      if(doc.dataset.teacherDoc==="effective")scheduleEffective();
      else scheduleSanitize();
    }
    if(gradeBtn){
      scheduleSanitize();
      if($('[data-teacher-doc="effective"][aria-pressed="true"]'))scheduleEffective();
    }
  });

  function boot(){scheduleSanitize();if($('[data-teacher-doc="effective"][aria-pressed="true"]'))scheduleEffective();}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
  window.PAIBP_TEACHER_PREVIEW_FIX_V87=Object.freeze({build:BUILD,sanitize:sanitizeExactPreview,renderEffective});
})();
