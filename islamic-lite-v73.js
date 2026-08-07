(() => {
  "use strict";
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  let quranRuntimePromise=null;

  function colorIslamicMenu(){
    const panel=$("#panel-islamic");
    const menu=$(".islamic-menu",panel||document);
    if(!menu)return;
    if(!$("#islamic-color-v79")){
      const style=document.createElement("style");
      style.id="islamic-color-v79";
      style.textContent=`
        #panel-islamic .islamic-menu button{background:var(--islamic-v79,#08745e)!important;color:#fff!important;border:1px solid rgba(255,255,255,.26)!important;border-radius:13px!important;box-shadow:0 7px 16px rgba(4,46,39,.13)!important;font-weight:900!important;transition:transform .16s ease,box-shadow .16s ease,filter .16s ease}
        #panel-islamic .islamic-menu button:hover{transform:translateY(-1px);filter:saturate(1.1);box-shadow:0 10px 20px rgba(4,46,39,.18)!important}
        #panel-islamic .islamic-menu button[aria-pressed="true"]{outline:3px solid #fff!important;outline-offset:-4px;box-shadow:0 0 0 2px #1fb7b0,0 10px 22px rgba(3,53,45,.2)!important}
        #panel-islamic .islamic-menu button small{color:rgba(255,255,255,.82)!important}
      `;
      document.head.append(style);
    }
    const colors=["#07846d","#1976b9","#7d45c4","#d77817","#cc3e4f","#15977e","#456dc2","#bf850f","#0d9fca","#129a82","#2f7ec4","#9a54bf","#df7920"];
    $$("button",menu).forEach((button,index)=>button.style.setProperty("--islamic-v79",colors[index%colors.length]));
  }

  function show(view){
    const panel=$("#panel-islamic");if(!panel)return;
    $$('[data-islamic-view]',panel).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.islamicView===view)));
    $$('[data-islamic-page]',panel).forEach(p=>p.hidden=p.dataset.islamicPage!==view);
    colorIslamicMenu();
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

  function ensureQuranRuntime(){
    if(window.PAIBP_QURAN_KEMENAG_V78?.mount)return Promise.resolve(window.PAIBP_QURAN_KEMENAG_V78);
    if(quranRuntimePromise)return quranRuntimePromise;
    quranRuntimePromise=new Promise((resolve,reject)=>{
      const existing=[...document.querySelectorAll('script[src]')].find(s=>{
        try{return new URL(s.src,document.baseURI).pathname.endsWith('/quran-kemenag-runtime-v78.js');}catch{return false;}
      });
      const done=()=>window.PAIBP_QURAN_KEMENAG_V78?resolve(window.PAIBP_QURAN_KEMENAG_V78):reject(new Error('Runtime Al Qur’an internal tidak aktif'));
      if(existing){
        if(window.PAIBP_QURAN_KEMENAG_V78){done();return;}
        existing.addEventListener('load',done,{once:true});
        existing.addEventListener('error',reject,{once:true});
        setTimeout(()=>window.PAIBP_QURAN_KEMENAG_V78&&done(),120);
        return;
      }
      const script=document.createElement('script');
      script.src=new URL('quran-kemenag-runtime-v78.js?v=79',document.baseURI).href;
      script.async=false;
      script.onload=done;
      script.onerror=()=>reject(new Error('Gagal memuat pembaca Al Qur’an internal'));
      document.head.append(script);
    }).catch(error=>{quranRuntimePromise=null;throw error;});
    return quranRuntimePromise;
  }

  function renderOfficialQuran(){
    const page=$('[data-islamic-page="quran"]');
    const form=$("#quran-form"), legend=$("#quran-tajwid-legend"), status=$("#quran-status"), reader=$("#quran-reader");
    if(form)form.hidden=true;if(legend)legend.hidden=true;
    if(status)status.textContent='Mushaf Standar Indonesia • database Al Qur’an internal PAIBP SMART SMP.';
    if(page&&!$('#qk79-reader',page)){
      const host=reader||page;
      if(host)host.innerHTML='<section style="padding:20px;border:1px solid #d7e7e1;border-radius:20px;background:linear-gradient(135deg,#f0fbf7,#eef5ff)"><span style="font-size:.72rem;font-weight:900;color:#08745d;letter-spacing:.08em">AL QUR\'AN • DATABASE INTERNAL</span><h4 style="margin:8px 0 10px">Menyiapkan Mushaf dan pemutar qori…</h4><p style="margin:0;line-height:1.7;color:#536f67">Memuat teks internal, 50 qori, Play, download audio/teks/JPG, dan Share.</p></section>';
    }
    ensureQuranRuntime().then(runtime=>runtime.mount()).catch(error=>{
      console.error('PAIBP Quran internal',error);
      const target=$("#quran-reader")||page;
      if(target)target.innerHTML='<section style="padding:20px;border:1px solid #f1c9c9;border-radius:20px;background:#fff7f7"><strong>Database Al Qur’an internal belum dapat dimuat.</strong><p style="margin:7px 0 0;color:#765">Muat ulang halaman untuk mencoba kembali. Tidak ada pengalihan ke situs luar.</p></section>';
    });
  }

  function init(){
    const panel=$("#panel-islamic");if(!panel)return;dates();colorIslamicMenu();
    panel.addEventListener('click',e=>{const b=e.target.closest('[data-islamic-view]');if(!b)return;e.preventDefault();show(b.dataset.islamicView)});
    new MutationObserver(colorIslamicMenu).observe(panel,{childList:true,subtree:true});
    show('home');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
