(() => {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";

  const icons = {
    home:'<path d="M3 11.2 12 4l9 7.2"/><path d="M5.5 10.6V20h13v-9.4"/><path d="M9.5 20v-5.8h5V20"/>',
    quran:'<path d="M4 5.5c0-1.1.9-2 2-2h5.2v16H6a2 2 0 0 0-2 2V5.5Z"/><path d="M20 5.5c0-1.1-.9-2-2-2h-5.2v16H18a2 2 0 0 1 2 2V5.5Z"/><path d="M7 7h2.5M14.5 7H17"/>',
    prayer:'<path d="M8.2 13.2c-1.7.6-3.2 2.1-3.7 4.1-.2.8.4 1.6 1.2 1.6h4.1"/><path d="M15.8 13.2c1.7.6 3.2 2.1 3.7 4.1.2.8-.4 1.6-1.2 1.6h-4.1"/><path d="M8.7 10.2c.8 1.2 1.9 1.9 3.3 1.9s2.5-.7 3.3-1.9"/><path d="M9.1 5.6c.6-1.1 1.6-1.7 2.9-1.7s2.3.6 2.9 1.7"/><path d="M7 8.4 9.4 7l2.6 1.5L14.6 7 17 8.4"/>',
    morning:'<circle cx="9" cy="10" r="3.3"/><path d="M9 3.4v1.4M9 15.2v1.4M2.4 10h1.4M14.2 10h1.4M4.3 5.3l1 1M12.7 13.7l1 1M4.3 14.7l1-1"/><path d="M13.5 16.6h5.2a2.3 2.3 0 0 0 .3-4.6 3.5 3.5 0 0 0-6.6 1.2"/>',
    moon:'<path d="M19 15.1A7.8 7.8 0 0 1 8.9 5a7.8 7.8 0 1 0 10.1 10.1Z"/><path d="m16.8 5.2.4 1 .9.4-.9.4-.4 1-.4-1-.9-.4.9-.4.4-1Z"/>',
    calendar:'<rect x="3.5" y="5.2" width="17" height="15" rx="2.3"/><path d="M7.2 3v4.2M16.8 3v4.2M3.5 9.4h17"/><path d="M7.2 13h2.3M12 13h2.3M16.7 13h.1M7.2 16.6h2.3M12 16.6h2.3"/>',
    language:'<path d="M4 5h9M8.5 5c0 5-2 8.2-5 10.5M6 10.2c1.8 2.4 3.8 4 6.2 5"/><path d="M14.5 19 18 9.5 21.5 19M15.7 15.8h4.6"/>',
    mic:'<rect x="8.2" y="3" width="7.6" height="11" rx="3.8"/><path d="M5.5 10.8a6.5 6.5 0 0 0 13 0M12 17.3V21M8.5 21h7"/>',
    headphones:'<path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="3" y="12.5" width="4" height="7" rx="2"/><rect x="17" y="12.5" width="4" height="7" rx="2"/><path d="M17 18c-1.2 1.2-2.8 1.8-5 1.8"/>',
    bulb:'<path d="M8.4 15.4a6 6 0 1 1 7.2 0c-1 .7-1.6 1.5-1.7 2.6h-3.8c-.1-1.1-.7-1.9-1.7-2.6Z"/><path d="M10 21h4M9.8 18h4.4M12 2V1M4.8 4.8l-.8-.8M19.2 4.8l.8-.8"/>',
    compass:'<circle cx="12" cy="12" r="8.5"/><path d="m15.7 8.3-2 5.4-5.4 2 2-5.4 5.4-2Z"/>',
    book:'<path d="M4 5.5c0-1.1.9-2 2-2h5.2v16H6a2 2 0 0 0-2 2V5.5Z"/><path d="M20 5.5c0-1.1-.9-2-2-2h-5.2v16H18a2 2 0 0 1 2 2V5.5Z"/>',
    check:'<circle cx="12" cy="12" r="8.6"/><path d="m8.2 12.2 2.5 2.6 5.3-5.7"/>',
    route:'<circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M7.8 6h3.7c2.7 0 3.9 1.4 3.9 3.4 0 2.3-1.5 3.6-4 3.6H9.6c-2.1 0-3.3 1.1-3.3 3"/><path d="m14 7.7 1.4 1.7 1.5-1.7"/>',
    year:'<rect x="3.5" y="5.2" width="17" height="15" rx="2.3"/><path d="M7.2 3v4.2M16.8 3v4.2M3.5 9.4h17"/><path d="M7 13h4M7 16.5h7"/>',
    school:'<path d="m3 9 9-5 9 5-9 5-9-5Z"/><path d="M6 12v5.5M18 12v5.5M4 20h16M12 14v6"/>',
    calculator:'<rect x="5" y="3" width="14" height="18" rx="2.2"/><rect x="8" y="6" width="8" height="3" rx=".7"/><path d="M8 13h.1M12 13h.1M16 13h.1M8 17h.1M12 17h.1M16 17h.1"/>',
    books:'<path d="M5 4h5v16H5zM10 6h5v14h-5M15.4 5.2l3.1-.8 3.8 14.9-3.1.8z"/><path d="M6.5 7.5h2M11.5 9h2M18 8l2.1-.5"/>',
    chart:'<path d="M4 20V9M10 20V4M16 20v-7M22 20H2"/><path d="m4 7 5-4 6 6 5-5"/>',
    inbox:'<path d="M4.2 5.2h15.6l1.7 11.2a2 2 0 0 1-2 2.3h-15a2 2 0 0 1-2-2.3L4.2 5.2Z"/><path d="M3 14h5l1.6 2.2h4.8L16 14h5"/>',
    grid:'<rect x="4" y="4" width="6" height="6" rx="1.2"/><rect x="14" y="4" width="6" height="6" rx="1.2"/><rect x="4" y="14" width="6" height="6" rx="1.2"/><rect x="14" y="14" width="6" height="6" rx="1.2"/>',
    pen:'<path d="m5 19 3.8-.8L19 8a2 2 0 0 0-3-3L5.8 15.2 5 19Z"/><path d="m13.8 7.2 3 3M4 21h16"/>'
  };

  function svg(name){
    const body = icons[name] || icons.grid;
    return `<svg class="v85-svg-art" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
  }

  function ensureCss(){
    if ([...document.styleSheets].some(s => String(s.href||'').includes('icon-art-v85.css'))) return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=new URL('icon-art-v85.css?v=85',document.baseURI).href;
    document.head.append(link);
  }

  function polishTeacherMenu(){
    const map={cp:'book',kktp:'check',atp:'route',prota:'year',promes:'calendar',calendar:'school',effective:'calculator',module:'books',access:'chart',submissions:'inbox'};
    document.querySelectorAll('.teacher-doc-menu [data-teacher-doc]').forEach(btn=>{
      const holder=btn.querySelector(':scope > span');
      if(!holder || holder.dataset.v85Art) return;
      holder.innerHTML=svg(map[btn.dataset.teacherDoc]||'grid');
      holder.dataset.v85Art='1';
    });
  }

  function stripLeadingEmoji(text){
    return String(text||'').replace(/^\s*[\p{Extended_Pictographic}\uFE0F\u200D\u20E3\u2600-\u27BF]+\s*/u,'').trimStart();
  }

  function polishIslamicMenu(){
    const map={home:'home',quran:'quran',hisnul:'prayer',morning:'morning',evening:'moon',calendar:'calendar',arabic:'language',khutbah:'mic',tajwid:'headphones',insights:'bulb',worship:'compass'};
    document.querySelectorAll('.islamic-menu [data-islamic-view]').forEach(btn=>{
      if(btn.dataset.v85Art) return;
      const label=stripLeadingEmoji(btn.textContent);
      btn.textContent='';
      btn.insertAdjacentHTML('beforeend',svg(map[btn.dataset.islamicView]||'grid'));
      btn.append(document.createTextNode(` ${label}`));
      btn.dataset.v85Art='1';
    });
  }

  function polishPanelKickers(){
    const map=[[/Ruang Murid/i,'book'],[/Fitur Islami/i,'quran'],[/Game/i,'grid'],[/Guru/i,'school']];
    document.querySelectorAll('.panel-kicker').forEach(el=>{
      if(el.dataset.v85Art) return;
      const label=stripLeadingEmoji(el.textContent);
      const hit=map.find(([rx])=>rx.test(label));
      if(!hit) return;
      el.textContent='';
      el.insertAdjacentHTML('beforeend',svg(hit[1]));
      el.append(document.createTextNode(` ${label}`));
      el.dataset.v85Art='1';
    });
  }

  function polishTextIconContainers(){
    document.querySelectorAll('.directory-feature-icon').forEach(el=>{
      if(el.querySelector('svg') || el.dataset.v85Art) return;
      const link=el.closest('a')?.getAttribute('href')||'';
      const kind=link.includes('artikel')?'pen':link.includes('mapel')?'grid':'grid';
      el.innerHTML=svg(kind); el.dataset.v85Art='1';
    });
    document.querySelectorAll('.welcome-icon').forEach(el=>{
      if(el.dataset.v85Art) return;
      el.innerHTML=svg('books'); el.dataset.v85Art='1';
    });
  }

  function run(){ensureCss();polishTeacherMenu();polishIslamicMenu();polishPanelKickers();polishTextIconContainers();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
  new MutationObserver(()=>run()).observe(document.documentElement,{childList:true,subtree:true});
})();
