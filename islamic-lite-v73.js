(() => {
  "use strict";
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  function show(view){
    const panel=$("#panel-islamic");if(!panel)return;
    $$('[data-islamic-view]',panel).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.islamicView===view)));
    $$('[data-islamic-page]',panel).forEach(p=>p.hidden=p.dataset.islamicPage!==view);
    if(view==='quran')renderOfficialQuran();
  }
  function dates(){
    const now=new Date();
    const day=$("#arabic-day"), greg=$("#gregorian-date"), hijri=$("#hijri-date");
    const arabicDays=['Ahad','Itsnain','Tsulatsa','Arbi’a','Khamis','Jumu’ah','Sabt'];
    if(day)day.textContent=arabicDays[now.getDay()];
    if(greg)greg.textContent=new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'long',year:'numeric'}).format(now);
    if(hijri){
      try{
        const parts=new Intl.DateTimeFormat('id-ID-u-ca-islamic',{day:'numeric',month:'long',year:'numeric'}).formatToParts(now),g=t=>parts.find(x=>x.type===t)?.value||'';
        hijri.textContent=`${g('day')} ${g('month')} ${g('year')} H`.replace(/\s+/g,' ').trim();
      }catch{hijri.textContent='—'}
    }
  }
  function renderOfficialQuran(){
    const form=$("#quran-form"), legend=$("#quran-tajwid-legend"), status=$("#quran-status"), reader=$("#quran-reader");
    if(form)form.hidden=true;if(legend)legend.hidden=true;
    if(status)status.textContent='Mushaf Standar Indonesia • sumber resmi LPMQ Kementerian Agama RI.';
    if(reader){
      reader.innerHTML=`<section style="padding:20px;border:1px solid #d7e7e1;border-radius:20px;background:#fff"><span style="font-size:.72rem;font-weight:900;color:#08745d;letter-spacing:.08em">MUSHAF STANDAR INDONESIA</span><h4 style="margin:8px 0 10px">Al Qur'an — Rasm Usmani LPMQ Kementerian Agama RI</h4><p style="margin:0 0 14px;line-height:1.7;color:#536f67">PAIBP SMART tidak lagi menyalin atau membangkitkan teks ayat sendiri. Untuk menjaga ketepatan rasm, harakat, tanda baca, dan waqaf, pembacaan Al Qur'an diarahkan ke layanan resmi Qur'an Kemenag.</p><a href="https://quran.kemenag.go.id/" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:10px 16px;border-radius:13px;background:#08745d;color:#fff;text-decoration:none;font-weight:900">Buka Qur'an Kemenag Resmi</a></section>`;
    }
    const note=reader?.nextElementSibling;if(note?.classList?.contains('document-note'))note.textContent='Sumber mushaf: Lajnah Pentashihan Mushaf Al-Qur’an (LPMQ), Kementerian Agama RI — Mushaf Standar Indonesia Rasm Usmani.';
  }
  function init(){
    const panel=$("#panel-islamic");if(!panel)return;dates();
    panel.addEventListener('click',e=>{const b=e.target.closest('[data-islamic-view]');if(!b)return;e.preventDefault();show(b.dataset.islamicView)});
    show('home');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
