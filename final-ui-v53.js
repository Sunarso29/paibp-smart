(() => {
  "use strict";

  const VERSION = "53";
  const CAT_KEY = "paibp-smart-cat-session-v53";
  const LEGACY_CAT_KEY = "paibp-smart-cat-session-v52";
  const PROGRESS_KEY = "paibp-smart-progress-v3";
  const TEACHER_KEY = "paibp-smart-teacher-identity-v1";
  const AUTH_KEY = "paibp-smart-authority-v53";
  const OWNER_GATEWAY = "paibp-smart-owner-gateway-v30";
  const EDITOR_UNLOCKED = "paibp-smart-editor-unlocked";
  const LEGACY_FOCUS_KEYS = ["paibp-smart-focus-session-v48", "paibp-smart-focus-session-v50"];

  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];
  const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const parse = (value, fallback) => { try { return JSON.parse(value); } catch { return fallback; } };
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;",
  })[character]);

  const pathname = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  let cat = parse(sessionStorage.getItem(CAT_KEY), null)
    || parse(sessionStorage.getItem(LEGACY_CAT_KEY), null)
    || { active:false, targetChapter:"", startedAt:0, releasedAt:0 };
  let historyArmed = false;
  let completionTimer = 0;
  let mutationTimer = 0;

  function teacherIdentity() {
    return parse(localStorage.getItem(TEACHER_KEY), {}) || {};
  }

  function ownerIdentityMatches() {
    const identity = teacherIdentity();
    const name = String(identity.name || identity.teacherName || "").toLocaleLowerCase("id");
    const unit = String(identity.workUnit || identity.school || identity.teacherSchool || "").toLocaleLowerCase("id");
    return name.includes("sunarso") && unit.includes("smp negeri 1 susukan");
  }

  function authority() {
    const bodyGateway = String(document.body?.dataset.privateGateway || "").toLowerCase();
    const bodyRole = String(document.body?.dataset.portalRole || "").toLowerCase();
    const stored = sessionStorage.getItem(AUTH_KEY) || localStorage.getItem(AUTH_KEY) || "";
    const editorToken = sessionStorage.getItem(OWNER_GATEWAY) === "yes"
      || sessionStorage.getItem(EDITOR_UNLOCKED) === "true"
      || localStorage.getItem(EDITOR_UNLOCKED) === "true";

    if (pathname === "kendali-editor.html" || bodyGateway === "editor" || stored === "editor" || (editorToken && ownerIdentityMatches())) {
      try { sessionStorage.setItem(AUTH_KEY,"editor"); localStorage.setItem(AUTH_KEY,"editor"); } catch {}
      return "editor";
    }

    const identity = teacherIdentity();
    const recognizedTeacher = Boolean(identity.name || identity.teacherName)
      && Boolean(identity.workUnit || identity.school || identity.teacherSchool)
      && (identity.teacherRecognized === true || identity.recognized === true || pathname === "akses-guru.html" || bodyRole === "guru" || bodyGateway === "guru");
    if (pathname === "akses-guru.html" || bodyGateway === "guru" || bodyRole === "guru" || stored === "teacher" || recognizedTeacher) {
      try { sessionStorage.setItem(AUTH_KEY,"teacher"); } catch {}
      return "teacher";
    }
    return "student";
  }

  function isPrivileged() { return authority() !== "student"; }
  function isEditor() { return authority() === "editor"; }

  function saveCat() {
    try {
      sessionStorage.setItem(CAT_KEY, JSON.stringify(cat));
      sessionStorage.removeItem(LEGACY_CAT_KEY);
    } catch {}
  }

  function neutralizeLegacyLocks() {
    LEGACY_FOCUS_KEYS.forEach((key) => { try { sessionStorage.removeItem(key); } catch {} });
    document.documentElement.classList.remove("v48-student-focus", "v50-task-focus", "v52-cat-mode");
    ["#v48-focus-gate", "#v50-focus-resume", "#v52-cat-bar"].forEach((selector) => $(selector)?.remove());
  }

  function toast(message) {
    let node = $("#v53-toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "v53-toast";
      node.setAttribute("role", "status");
      node.setAttribute("aria-live", "polite");
      document.body.append(node);
    }
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), 2800);
  }

  function studentPanel() { return $("#panel-student,[data-panel='student']"); }

  function ensureStudentPanelVisible() {
    const panel = studentPanel();
    if (!panel) return;
    panel.hidden = false;
    panel.removeAttribute("hidden");
    $$(".workspace-panel").forEach((node) => { if (node !== panel) node.hidden = true; });
  }

  function ensureCatBar() {
    let bar = $("#v53-cat-bar");
    if (!bar) {
      bar = document.createElement("header");
      bar.id = "v53-cat-bar";
      bar.innerHTML = `<div><span>MODE CAT PAIBP SMART</span><strong>Selesaikan materi, latihan, dan tugas</strong></div><div><b>↕ Scroll tetap aktif</b><small>Navigasi keluar dibuka setelah bab selesai</small></div>`;
      document.body.append(bar);
    }
    return bar;
  }

  function ensureSupervisorBar() {
    $("#v53-cat-bar")?.remove();
    const role = authority();
    if (role === "student") { $("#v53-supervisor-bar")?.remove(); return; }
    let bar = $("#v53-supervisor-bar");
    if (!bar) {
      bar = document.createElement("header");
      bar.id = "v53-supervisor-bar";
      document.body.append(bar);
    }
    const editor = role === "editor";
    bar.dataset.role = role;
    bar.innerHTML = `<div><span>${editor ? "OTORITAS EDITOR" : "PRATINJAU GURU"}</span><strong>Ruang Murid tidak dikunci pada akun ini</strong></div><button type="button" data-v53-supervisor-exit>${editor ? "Keluar ke Kendali Editor" : "Keluar dari Pratinjau"}</button>`;
    $("[data-v53-supervisor-exit]",bar)?.addEventListener("click", () => {
      const panel = studentPanel();
      if (panel) panel.hidden = true;
      const welcome = $("#panel-welcome,[data-panel='welcome']");
      if (welcome) welcome.hidden = false;
      document.documentElement.classList.remove("v53-supervisor-preview");
      bar.remove();
      if (editor && pathname !== "kendali-editor.html") location.href = "kendali-editor.html";
    });
  }

  function enterSupervisorPreview() {
    neutralizeLegacyLocks();
    cat.active = false;
    cat.releasedAt = Date.now();
    saveCat();
    document.documentElement.classList.remove("v53-cat-mode");
    document.documentElement.classList.add("v53-supervisor-preview");
    ensureStudentPanelVisible();
    ensureSupervisorBar();
  }

  async function secureScreen() {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen({ navigationUI:"hide" });
      }
    } catch {}
    try { await screen.orientation?.lock?.("portrait-primary"); } catch {}
  }

  function armHistory() {
    if (historyArmed) return;
    historyArmed = true;
    try { history.pushState({paibpCatV53:true},"",location.href); } catch {}
  }

  function enterCatMode() {
    if (isPrivileged()) { enterSupervisorPreview(); return; }
    neutralizeLegacyLocks();
    cat.active = true;
    cat.startedAt = Date.now();
    cat.releasedAt = 0;
    saveCat();
    document.documentElement.classList.add("v53-cat-mode");
    document.body?.setAttribute("data-portal-role","murid");
    ensureStudentPanelVisible();
    ensureCatBar();
    armHistory();
    clearInterval(completionTimer);
    completionTimer = setInterval(checkCompletion,900);
  }

  function releaseCatMode(message = "Tugas selesai. Akses keluar sudah dibuka.") {
    cat.active = false;
    cat.releasedAt = Date.now();
    saveCat();
    document.documentElement.classList.remove("v53-cat-mode");
    $("#v53-cat-bar")?.remove();
    clearInterval(completionTimer);
    try { screen.orientation?.unlock?.(); } catch {}
    if (document.fullscreenElement) document.exitFullscreen?.().catch?.(() => {});
    toast(message);
  }

  function activeChapterId() {
    const active = $("[data-chapter].active,[data-chapter-id].active,[data-material-id].active,[aria-current='true'][data-chapter]");
    return active?.dataset.chapter || active?.dataset.chapterId || active?.dataset.materialId || cat.targetChapter || "";
  }

  function completedIds() {
    const progress = parse(localStorage.getItem(PROGRESS_KEY), {}) || {};
    const lists = [progress.completed,progress.completedIds,progress.chaptersCompleted].filter(Array.isArray);
    return [...new Set(lists.flat().map(String))];
  }

  function checkCompletion() {
    if (!cat.active || isPrivileged()) return;
    const target = cat.targetChapter || activeChapterId();
    if (target && completedIds().includes(String(target))) releaseCatMode();
  }

  function rememberChapter(node) {
    const id = node?.dataset.chapter || node?.dataset.chapterId || node?.dataset.materialId || "";
    if (!id) return;
    cat.targetChapter = id;
    saveCat();
  }

  function isAllowedStudentControl(target) {
    if (!target) return false;
    if (target.matches("input,textarea,select,label,option")) return true;
    if (target.closest("#panel-student,[data-panel='student']")) {
      const label = clean(target.textContent);
      return !/beranda|fitur islami|game|portal guru|tentang|kontak|keluar|tutup/i.test(label);
    }
    return false;
  }

  function blockLeaving(event) {
    if (!cat.active || isPrivileged()) return;
    const target = event.target.closest("a,button,[data-open-panel],[data-close-workspace]");
    if (!target) return;
    const chapter = target.closest("[data-chapter],[data-chapter-id],[data-material-id]");
    if (chapter) rememberChapter(chapter);
    if (target.matches('[data-open-panel="student"]') || isAllowedStudentControl(target)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    ensureStudentPanelVisible();
    toast("Mode CAT aktif. Selesaikan bab sebelum keluar.");
  }

  function onClick(event) {
    const studentEntry = event.target.closest('[data-open-panel="student"]');
    if (studentEntry) {
      if (isPrivileged()) {
        setTimeout(enterSupervisorPreview,0);
      } else {
        enterCatMode();
        secureScreen();
      }
      return;
    }
    if (cat.active) blockLeaving(event);
  }

  function onPopState() {
    if (!cat.active || isPrivileged()) return;
    try { history.pushState({paibpCatV53:true},"",location.href); } catch {}
    ensureStudentPanelVisible();
    toast("Tombol kembali dibatasi selama Mode CAT.");
  }

  function colorizeHomeTiles() {
    const tones=["forest","sunset","ocean","violet","lime","coral","indigo","gold"];
    $$(".hero-access-panel .access-tile,.feature-grid article,.home-feature-card").forEach((tile,index)=>{
      tile.dataset.v53Tone=tones[index%tones.length];
      tile.querySelectorAll("strong,small,b,span,p,h3,h4").forEach((node)=>{
        node.hidden=false; node.style.removeProperty("color"); node.style.removeProperty("opacity"); node.style.removeProperty("visibility");
      });
    });
  }

  const ISLAM_LABELS=/beranda|al qur|hisnul|dzikir pagi|dzikir petang|kalender hijriah|bahasa arab|khutbah/i;
  function findIslamicNav(panel) {
    const controls=$$("a,button,[role='tab']",panel).filter((node)=>ISLAM_LABELS.test(clean(node.textContent)));
    if (controls.length<5) return null;
    const candidates=[];
    controls.forEach((control)=>{
      let node=control.parentElement;
      for(let depth=0;node&&node!==panel&&depth<5;depth++,node=node.parentElement){
        const count=$$("a,button,[role='tab']",node).filter((item)=>ISLAM_LABELS.test(clean(item.textContent))).length;
        if(count>=5)candidates.push({node,count,depth});
      }
    });
    candidates.sort((a,b)=>b.count-a.count||a.depth-b.depth);
    return candidates[0]?.node||null;
  }

  function repairIslamicMenu() {
    const panel=$("#panel-islamic,[data-panel='islamic']");
    if(!panel)return;
    const nav=findIslamicNav(panel);
    if(!nav)return;
    nav.classList.add("v53-islamic-nav");
    const tones=["forest","blue","purple","orange","rose","teal","indigo","gold"];
    $$("a,button,[role='tab']",nav).filter((node)=>ISLAM_LABELS.test(clean(node.textContent))).forEach((node,index)=>{
      node.dataset.v53Tone=tones[index%tones.length];
      node.querySelectorAll("span,strong,small,b").forEach((part)=>{part.hidden=false;part.style.removeProperty("color");part.style.removeProperty("opacity")});
    });
    const heading=$(".panel-heading",panel);
    if(heading&&nav.parentElement===panel&&heading.nextElementSibling!==nav)heading.insertAdjacentElement("afterend",nav);
  }

  function repairAiMobile() {
    const panel=$(".ai-drawer-panel-v27")||$(".spensus-ai-v48");
    if(!panel)return;
    panel.classList.add("v53-ai-mobile");
    const tools=$$(".v48-ai-tools",panel); tools.slice(1).forEach((node)=>node.remove());
  }

  const MODULES=[
    {id:"wudhu",title:"Wudhu",icon:"💧",summary:"Sembilan tahap wudhu sesuai urutan visual.",poster:"assets/simulasi/wudhu-poster-v53.webp",steps:[
      ["Niat dan basmalah","Berniat wudhu karena Alloh Subhanahu Wata'ala lalu membaca basmalah.","بِسْمِ اللّٰهِ","Bismillāh"],
      ["Membasuh telapak tangan","Membasuh kedua telapak tangan sampai pergelangan sebanyak tiga kali."],
      ["Berkumur","Mengambil air dengan tangan kanan, berkumur, kemudian mengeluarkannya."],
      ["Membersihkan hidung","Memasukkan air ke hidung secukupnya lalu mengeluarkannya."],
      ["Membasuh wajah","Membasuh seluruh wajah secara merata sebanyak tiga kali."],
      ["Membasuh tangan sampai siku","Mendahulukan tangan kanan kemudian kiri, masing-masing tiga kali."],
      ["Membasuh kepala","Mengusap sebagian atau seluruh kepala satu kali."],
      ["Membersihkan telinga","Mengusap bagian dalam dan luar kedua telinga."],
      ["Membasuh kaki dan berdoa","Membasuh kaki kanan lalu kiri sampai mata kaki, kemudian membaca doa setelah wudhu.","أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ","Asyhadu allā ilāha illallāh"]
    ]},
    {id:"sholat",title:"Sholat",icon:"🕌",summary:"Delapan gerakan utama dari takbiratul ihram sampai salam.",steps:[
      ["Takbiratul ihram","Berdiri menghadap kiblat, berniat, lalu mengangkat kedua tangan.","اللّٰهُ أَكْبَرُ","Allāhu akbar"],
      ["Berdiri dan membaca","Bersedekap, membaca doa iftitah, Al Fatihah, dan Al Qur'an Surat pilihan.","الْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِينَ","Alhamdu lillāhi rabbil ‘ālamīn"],
      ["Ruku","Membungkuk dengan punggung rata dan tuma'ninah.","سُبْحَانَ رَبِّيَ الْعَظِيمِ وَبِحَمْدِهِ","Subhāna rabbiyal ‘azhīmi wa bihamdih"],
      ["I'tidal","Bangkit dari ruku dan berdiri tegak dengan tuma'ninah.","سَمِعَ اللّٰهُ لِمَنْ حَمِدَهُ","Sami‘allāhu liman hamidah"],
      ["Sujud","Meletakkan dahi, hidung, telapak tangan, lutut, dan ujung kaki.","سُبْحَانَ رَبِّيَ الْأَعْلَى وَبِحَمْدِهِ","Subhāna rabbiyal a‘lā wa bihamdih"],
      ["Duduk di antara dua sujud","Duduk dengan tuma'ninah sambil membaca doa.","رَبِّ اغْفِرْلِي وَارْحَمْنِي وَاجْبُرْنِي","Rabbighfirlī warhamnī wajburnī"],
      ["Tasyahud","Duduk tasyahud, membaca tahiyat, dan sholawat.","اَلتَّحِيَّاتُ لِلّٰهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ","At-tahiyyātu lillāhi wash-shalawātu wath-thayyibāt"],
      ["Salam","Menoleh ke kanan dan ke kiri untuk mengakhiri sholat.","السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ","Assalāmu‘alaikum warahmatullāh"]
    ]},
    {id:"jamaah",title:"Sholat Berjamaah",icon:"👥",summary:"Posisi imam, makmum, shaf, dan aturan mengikuti imam.",steps:[
      ["Imam di depan","Imam berdiri paling depan menghadap kiblat."],["Luruskan shaf","Makmum merapatkan dan meluruskan barisan."],["Ikuti imam","Makmum bergerak setelah imam dan tidak mendahuluinya."],["Makmum masbuk","Menyempurnakan rakaat setelah imam salam."]
    ]},
    {id:"tayamum",title:"Tayamum",icon:"🪨",summary:"Pengganti wudhu ketika air tidak tersedia atau membahayakan.",steps:[
      ["Pastikan sebab","Tidak ada air atau penggunaan air membahayakan."],["Niat","Berniat tayamum karena Alloh Subhanahu Wata'ala."],["Sentuhkan tangan","Menyentuhkan telapak tangan pada debu yang suci."],["Usap wajah","Mengusap seluruh wajah satu kali."],["Usap tangan","Mengusap kedua tangan secara tertib."]
    ]},
    {id:"puasa",title:"Puasa",icon:"🌙",summary:"Alur puasa dari niat sampai berbuka.",steps:[
      ["Niat","Berniat puasa sesuai jenis dan waktunya."],["Sahur","Makan sahur secukupnya."],["Menahan diri","Menahan makan, minum, dan pembatal puasa."],["Menjaga akhlak","Menjaga ucapan serta memperbanyak amal baik."],["Berbuka","Berbuka ketika waktu Maghrib tiba."]
    ]},
    {id:"zakat",title:"Zakat",icon:"🤲",summary:"Menghitung dan menyalurkan zakat dengan benar.",steps:[
      ["Kenali jenis","Bedakan zakat fitrah dan zakat mal."],["Hitung kewajiban","Periksa ukuran, nishab, dan haul."],["Niat","Berniat menunaikan zakat."],["Salurkan","Serahkan kepada amil atau mustahik yang berhak."]
    ]},
    {id:"haji",title:"Haji",icon:"🕋",summary:"Urutan pokok manasik haji.",steps:[
      ["Ihram dan niat","Memakai ihram dan berniat dari miqat."],["Wukuf","Berdiam di Arafah pada waktunya."],["Mabit","Bermalam di Muzdalifah dan Mina."],["Melontar jumrah","Melontar jumrah dengan tertib."],["Tawaf dan sa'i","Tawaf tujuh putaran dan sa'i tujuh kali."],["Tahallul","Mencukur atau memotong rambut."]
    ]},
    {id:"kurban",title:"Kurban",icon:"🐐",summary:"Persiapan, penyembelihan, dan pembagian daging.",steps:[
      ["Niat dan waktu","Melaksanakan kurban pada waktu yang ditentukan."],["Pilih hewan","Hewan cukup umur, sehat, dan tidak cacat."],["Penyembelihan syar'i","Membaca basmalah dan menggunakan alat tajam."],["Pembagian","Membagikan daging secara bersih dan tertib."]
    ]}
  ];

  function imageFor(module,index){
    if(module.id==="wudhu")return `assets/simulasi/wudhu-${String(index+1).padStart(2,"0")}-v53.webp`;
    if(module.id==="sholat")return `assets/simulasi/sholat-${String(index+1).padStart(2,"0")}-v53.webp`;
    return "";
  }

  function buildPracticeBoard(){
    const panel=$("#panel-islamic,[data-panel='islamic']"); if(!panel)return;
    ["#v50-simulation-board","#v51-worship-board","#v52-practice-board","#v53-practice-board"].forEach((selector)=>$(selector)?.remove());
    const board=document.createElement("section"); board.id="v53-practice-board";
    board.innerHTML=`<header class="v53-practice-head"><div><span>PANDUAN VISUAL DAN PRAKTIK</span><h3>Simulasi Ibadah Terstruktur</h3><p>Urutan visual, gerakan, dan bacaan disusun jelas untuk layar komputer maupun HP.</p></div><b>ONLINE + LURING</b></header><nav class="v53-practice-tabs">${MODULES.map((module,index)=>`<button type="button" data-v53-module="${module.id}" aria-selected="${index===0}">${module.icon} ${module.title}</button>`).join("")}</nav><div data-v53-content></div>`;
    panel.append(board);
    const content=$("[data-v53-content]",board);
    const render=(module)=>{
      const poster=module.poster?`<figure class="v53-sequence-poster"><img src="${module.poster}" alt="Urutan lengkap ${escapeHtml(module.title)}" loading="lazy"><figcaption>Urutan lengkap ${escapeHtml(module.title)}</figcaption></figure>`:"";
      content.innerHTML=`<section class="v53-module-intro"><div><span>${module.icon}</span><div><h4>${escapeHtml(module.title)}</h4><p>${escapeHtml(module.summary)}</p></div></div><b>${module.steps.length} tahap</b></section>${poster}<div class="v53-step-grid">${module.steps.map((step,index)=>{const image=imageFor(module,index);return `<article class="v53-step-card" data-tone="${index%6}">${image?`<figure><img src="${image}" alt="${escapeHtml(step[0])}" loading="lazy"><span>${index+1}</span></figure>`:`<div class="v53-symbol"><b>${module.icon}</b><span>${index+1}</span></div>`}<div><small>TAHAP ${index+1}</small><h5>${escapeHtml(step[0])}</h5><p>${escapeHtml(step[1])}</p>${step[2]||step[3]?`<aside><strong lang="ar">${escapeHtml(step[2]||"")}</strong><em>${escapeHtml(step[3]||"")}</em></aside>`:""}</div></article>`}).join("")}</div>`;
    };
    render(MODULES[0]);
    $$("[data-v53-module]",board).forEach((button)=>button.addEventListener("click",()=>{
      const module=MODULES.find((item)=>item.id===button.dataset.v53Module); if(!module)return;
      $$("[data-v53-module]",board).forEach((node)=>node.setAttribute("aria-selected",String(node===button)));
      render(module); content.scrollIntoView({behavior:"smooth",block:"start"});
    }));
  }

  function suppressLegacyWarnings(){
    const pattern=/mode lokal|belum real-time lintas perangkat|statistik hanya berasal dari perangkat ini|postingan kegiatan dapat hilang/i;
    $$("p,small,strong,section,article,aside,div").forEach((node)=>{
      if(node.children.length>18||!pattern.test(clean(node.textContent)))return;
      (node.closest("section,article,aside,.notice,.status-card")||node).classList.add("v53-hide-legacy-warning");
    });
  }

  function runRepairs(){
    repairAiMobile(); colorizeHomeTiles(); repairIslamicMenu(); suppressLegacyWarnings();
    if(!$("#v53-practice-board"))buildPracticeBoard();
    if(isPrivileged()){
      if(cat.active){cat.active=false;saveCat()}
      document.documentElement.classList.remove("v53-cat-mode");
    }else if(cat.active){
      document.documentElement.classList.add("v53-cat-mode"); ensureStudentPanelVisible(); ensureCatBar(); armHistory();
    }
  }

  function initialize(){
    document.documentElement.dataset.paibpFinal=VERSION;
    neutralizeLegacyLocks();
    if(isPrivileged()){cat.active=false;saveCat()}
    document.addEventListener("click",onClick,true);
    window.addEventListener("popstate",onPopState);
    window.addEventListener("beforeunload",(event)=>{if(cat.active&&!isPrivileged()){event.preventDefault();event.returnValue=""}});
    window.addEventListener("storage",(event)=>{if(event.key===PROGRESS_KEY)checkCompletion()});
    document.addEventListener("fullscreenchange",()=>{if(cat.active&&!isPrivileged())ensureStudentPanelVisible()});
    runRepairs();
    const observer=new MutationObserver(()=>{clearTimeout(mutationTimer);mutationTimer=setTimeout(runRepairs,90)});
    observer.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initialize,{once:true});else initialize();
  window.PAIBP_CAT_V53=Object.freeze({enter:enterCatMode,release:releaseCatMode,authority,state:()=>({...cat})});
})();
