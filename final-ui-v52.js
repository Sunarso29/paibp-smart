(() => {
  "use strict";

  const VERSION = "52";
  const CONFIG = window.PAIBP_CONFIG || {};
  const ENDPOINT = String(CONFIG.syncEndpoint || CONFIG.realtimeEndpoint || "").trim();
  const READ_KEY = String(CONFIG.syncReadKey || CONFIG.realtimeReadKey || "").trim();
  const ENDPOINT_READY = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(ENDPOINT);
  const CAT_KEY = "paibp-smart-cat-session-v52";
  const PROGRESS_KEY = "paibp-smart-progress-v3";
  const LEGACY_FOCUS_KEYS = ["paibp-smart-focus-session-v48", "paibp-smart-focus-session-v50"];
  const SHOLAT_IMAGE = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Salat%20Positions%20and%20Prayers%20-%20White%20Background%20RGB.jpg?width=900";
  const WUDHU_IMAGE = "assets/simulasi/wudhu-reference-v52.png";

  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];
  const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const parse = (value, fallback) => { try { return JSON.parse(value); } catch { return fallback; } };
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;",
  })[character]);

  let cat = parse(sessionStorage.getItem(CAT_KEY), null) || {
    active: false,
    targetChapter: "",
    startedAt: 0,
    releasedAt: 0,
  };
  let mutationTimer = 0;
  let controlTimer = 0;
  let completionTimer = 0;
  let historyArmed = false;

  function isEditor() {
    const file = (location.pathname.split("/").pop() || "").toLowerCase();
    return file === "kendali-editor.html"
      || sessionStorage.getItem("paibp-smart-editor-unlocked") === "true"
      || localStorage.getItem("paibp-smart-editor-unlocked") === "true"
      || document.body?.dataset.teacherOwner === "yes";
  }

  function saveCat() {
    try { sessionStorage.setItem(CAT_KEY, JSON.stringify(cat)); } catch {}
  }

  function neutralizeLegacyFocus() {
    LEGACY_FOCUS_KEYS.forEach((key) => {
      try { sessionStorage.removeItem(key); } catch {}
    });
    document.documentElement.classList.remove("v48-student-focus", "v50-task-focus");
    ["#v48-focus-gate", "#v50-focus-resume"].forEach((selector) => {
      const node = $(selector);
      if (node) node.remove();
    });
  }

  function toast(message) {
    let node = $("#v52-cat-toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "v52-cat-toast";
      node.setAttribute("role", "status");
      node.setAttribute("aria-live", "polite");
      document.body.append(node);
    }
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), 2600);
  }

  function ensureCatBar() {
    let bar = $("#v52-cat-bar");
    if (!bar) {
      bar = document.createElement("header");
      bar.id = "v52-cat-bar";
      bar.innerHTML = `<div><span>MODE CAT PAIBP SMART</span><strong data-v52-cat-title>Ruang Murid terkunci</strong></div><div><b>↕ Scroll aktif</b><small>Keluar otomatis setelah bab selesai</small></div>`;
      document.body.append(bar);
    }
    const title = $("[data-v52-cat-title]", bar);
    if (title) title.textContent = cat.targetChapter ? "Selesaikan materi, latihan, dan tugas" : "Pilih bab untuk memulai tugas";
    return bar;
  }

  function ensureStudentPanelVisible() {
    const panel = $("#panel-student,[data-panel='student']");
    if (!panel) return;
    panel.hidden = false;
    panel.removeAttribute("hidden");
    $$(".workspace-panel").forEach((node) => {
      if (node !== panel) node.hidden = true;
    });
  }

  async function secureScreen() {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen({ navigationUI: "hide" });
      }
    } catch {}
    try { await screen.orientation?.lock?.("portrait-primary"); } catch {}
  }

  function armHistory() {
    if (historyArmed) return;
    historyArmed = true;
    try { history.pushState({ paibpCatV52: true }, "", location.href); } catch {}
  }

  function enterCatMode() {
    if (isEditor()) return;
    neutralizeLegacyFocus();
    cat.active = true;
    cat.startedAt = cat.startedAt || Date.now();
    cat.releasedAt = 0;
    saveCat();
    document.documentElement.classList.add("v52-cat-mode");
    document.body?.setAttribute("data-portal-role", "murid");
    ensureCatBar();
    ensureStudentPanelVisible();
    armHistory();
    clearInterval(completionTimer);
    completionTimer = setInterval(checkCompletion, 900);
  }

  function releaseCatMode(reason = "completed") {
    cat.active = false;
    cat.releasedAt = Date.now();
    saveCat();
    document.documentElement.classList.remove("v52-cat-mode");
    $("#v52-cat-bar")?.remove();
    clearInterval(completionTimer);
    try { screen.orientation?.unlock?.(); } catch {}
    if (document.fullscreenElement) document.exitFullscreen?.().catch?.(() => {});
    if (reason === "editor") toast("Mode CAT dihentikan oleh editor.");
    else toast("Tugas selesai. Akses keluar sudah dibuka.");
  }

  function activeChapterId() {
    const active = $("[data-chapter].active,[data-chapter-id].active,[data-material-id].active,[aria-current='true'][data-chapter]");
    return active?.dataset.chapter || active?.dataset.chapterId || active?.dataset.materialId || cat.targetChapter || "";
  }

  function completedIds() {
    const progress = parse(localStorage.getItem(PROGRESS_KEY), {}) || {};
    const lists = [progress.completed, progress.completedIds, progress.chaptersCompleted].filter(Array.isArray);
    return [...new Set(lists.flat().map(String))];
  }

  function checkCompletion() {
    if (!cat.active) return;
    const target = cat.targetChapter || activeChapterId();
    if (!target) return;
    if (completedIds().includes(String(target))) releaseCatMode("completed");
  }

  function rememberChapter(trigger) {
    const id = trigger?.dataset.chapter || trigger?.dataset.chapterId || trigger?.dataset.materialId || "";
    if (!id) return;
    cat.targetChapter = id;
    saveCat();
    ensureCatBar();
  }

  function blockLeaving(event) {
    if (!cat.active || isEditor()) return false;
    const target = event.target.closest("a,button,[data-open-panel],[data-close-workspace]");
    if (!target) return false;

    const chapter = target.closest("[data-chapter],[data-chapter-id],[data-material-id]");
    if (chapter) rememberChapter(chapter);

    const isStudentAction = Boolean(target.closest("#panel-student,[data-panel='student']"));
    const isAllowedControl = target.matches("input,textarea,select")
      || /materi|ringkasan|latihan|lkpd|evaluasi|refleksi|kirim tugas|selesai|lanjut/i.test(clean(target.textContent));
    const opensStudent = target.matches('[data-open-panel="student"]');

    if (opensStudent || isStudentAction || isAllowedControl) return false;

    event.preventDefault();
    event.stopImmediatePropagation();
    setTimeout(ensureStudentPanelVisible, 0);
    toast("Mode CAT aktif. Selesaikan bab terlebih dahulu.");
    return true;
  }

  function onClick(event) {
    const studentEntry = event.target.closest('[data-open-panel="student"]');
    if (studentEntry && !isEditor()) {
      enterCatMode();
      secureScreen();
      setTimeout(() => {
        neutralizeLegacyFocus();
        ensureStudentPanelVisible();
      }, 140);
      return;
    }

    if (cat.active) {
      const chapter = event.target.closest("[data-chapter],[data-chapter-id],[data-material-id]");
      if (chapter) rememberChapter(chapter);
      blockLeaving(event);
      setTimeout(() => {
        neutralizeLegacyFocus();
        ensureStudentPanelVisible();
      }, 0);
    }
  }

  function onPopState() {
    if (!cat.active || isEditor()) return;
    try { history.pushState({ paibpCatV52: true }, "", location.href); } catch {}
    ensureStudentPanelVisible();
    toast("Tombol kembali dinonaktifkan selama Mode CAT.");
  }

  function jsonp(action, params = {}, timeout = 10000) {
    return new Promise((resolve, reject) => {
      if (!ENDPOINT_READY) { reject(new Error("Endpoint belum siap.")); return; }
      const callback = `paibpV52_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const node = document.createElement("script");
      let done = false;
      const finish = (error, payload) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        try { delete window[callback]; } catch {}
        node.remove();
        error ? reject(error) : resolve(payload);
      };
      window[callback] = (payload) => finish(null, payload);
      const url = new URL(ENDPOINT);
      Object.entries({ action, callback, _v: Date.now(), ...params }).forEach(([key, value]) => url.searchParams.set(key, String(value ?? "")));
      node.src = url.href;
      node.async = true;
      node.onerror = () => finish(new Error("Server tidak dapat dijangkau."));
      const timer = setTimeout(() => finish(new Error("Server melewati batas waktu.")), timeout);
      document.head.append(node);
    });
  }

  function postContent(key, value) {
    if (!ENDPOINT_READY || !READ_KEY) return Promise.reject(new Error("Konfigurasi editor belum lengkap."));
    return fetch(ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      cache: "no-store",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify({
        action: "contentUpsert",
        readKey: READ_KEY,
        origin: location.origin,
        data: { key, value, updatedAt: new Date().toISOString() },
      }),
    });
  }

  async function pollCatControl() {
    clearTimeout(controlTimer);
    try {
      if (ENDPOINT_READY && navigator.onLine) {
        const snapshot = await jsonp("publicSnapshot", {}, 9000);
        const control = snapshot?.content?.catControl;
        const releaseEpoch = Number(control?.releaseEpoch || 0);
        if (cat.active && releaseEpoch && releaseEpoch >= Number(cat.startedAt || 0)) releaseCatMode("editor");
      }
    } catch {}
    controlTimer = setTimeout(pollCatControl, 12000);
  }

  function ensureEditorCatControl() {
    if (!isEditor() || $("#v52-editor-cat")) return;
    const main = $("#main") || $("main") || document.body;
    const panel = document.createElement("section");
    panel.id = "v52-editor-cat";
    panel.innerHTML = `<div><span>KENDALI MUTLAK EDITOR</span><strong>Mode CAT Ruang Murid</strong><p>Murid tetap dapat menggulir materi, tetapi navigasi keluar, menu lain, dan tombol kembali dibatasi sampai bab selesai.</p></div><div><button type="button" data-v52-cat-enable>Aktifkan Mode CAT</button><button type="button" data-v52-cat-release>Hentikan Semua Sesi CAT</button></div>`;
    main.prepend(panel);
    $("[data-v52-cat-enable]", panel)?.addEventListener("click", async () => {
      await postContent("catControl", { enabled: true, releaseEpoch: 0, updatedAt: new Date().toISOString() }).catch(() => {});
      toast("Mode CAT diaktifkan untuk Ruang Murid.");
    });
    $("[data-v52-cat-release]", panel)?.addEventListener("click", async () => {
      const releaseEpoch = Date.now();
      await postContent("catControl", { enabled: false, releaseEpoch, updatedAt: new Date().toISOString() }).catch(() => {});
      toast("Perintah penghentian dikirim ke seluruh sesi murid.");
    });
  }

  function repairAiLayout() {
    const panel = $(".ai-drawer-panel-v27,.spensus-ai-v48");
    if (!panel) return;
    panel.classList.add("v52-ai-mobile");
    const toolbars = $$(".v48-ai-tools", panel);
    toolbars.slice(1).forEach((node) => node.remove());
    const messages = $("[data-ai-messages],#spensus-ai-messages,.ai-drawer-messages-v27", panel);
    if (messages && !clean(messages.textContent)) {
      messages.innerHTML = `<div class="v52-ai-welcome"><strong>Spensus AI siap</strong><p>Ketik pertanyaan pada kolom bawah. Materi portal tetap tersedia ketika layanan Gemini belum tersambung.</p></div>`;
    }
  }

  function colorizeHomeTiles() {
    const tones = ["emerald", "sky", "violet", "amber", "coral", "teal", "indigo", "forest"];
    $$(".hero-access-panel .access-tile").forEach((tile, index) => {
      tile.dataset.v52Tone = tones[index % tones.length];
      tile.querySelectorAll("strong,small,b,span").forEach((node) => {
        node.hidden = false;
        node.style.removeProperty("opacity");
        node.style.removeProperty("visibility");
      });
    });
  }

  const MODULES = [
    {
      id: "wudhu", title: "Wudhu", icon: "💧", summary: "Urutan wudhu yang runtut dari basmalah sampai doa.", image: WUDHU_IMAGE,
      source: "Visual karakter referensi disediakan editor portal.",
      steps: [
        ["🤲", "Niat dan basmalah", "Berniat wudhu karena Allah Subhanahu Wata'ala, kemudian membaca basmalah.", "بِسْمِ اللّٰهِ", "Bismillāh"],
        ["👐", "Membasuh telapak tangan", "Membasuh kedua telapak tangan hingga pergelangan sebanyak tiga kali.", "", ""],
        ["👄", "Berkumur", "Mengambil air dengan tangan kanan, berkumur, kemudian mengeluarkannya.", "", ""],
        ["👃", "Membersihkan hidung", "Memasukkan air ke hidung secukupnya lalu mengeluarkannya.", "", ""],
        ["🙂", "Membasuh wajah", "Membasuh seluruh wajah dari batas rambut sampai dagu dan dari telinga ke telinga.", "", ""],
        ["💪", "Membasuh tangan sampai siku", "Mendahulukan tangan kanan, kemudian tangan kiri, masing-masing tiga kali.", "", ""],
        ["🧑", "Mengusap kepala dan telinga", "Mengusap kepala satu kali, kemudian membersihkan kedua telinga.", "", ""],
        ["🦶", "Membasuh kaki dan berdoa", "Membasuh kaki kanan lalu kiri sampai mata kaki, kemudian membaca doa setelah wudhu.", "أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ", "Asyhadu allā ilāha illallāh"],
      ],
    },
    {
      id: "sholat", title: "Sholat", icon: "🕌", summary: "Gerakan sholat dari takbiratul ihram sampai salam, lengkap dengan bacaan pokok.", image: SHOLAT_IMAGE,
      source: "Ilustrasi posisi sholat: Ayman.alhasan, Wikimedia Commons, CC BY-SA 3.0.",
      steps: [
        ["01", "Takbiratul ihram", "Berdiri menghadap kiblat, berniat, lalu mengangkat kedua tangan.", "اللّٰهُ أَكْبَرُ", "Allāhu akbar", "5%"],
        ["02", "Berdiri dan membaca", "Bersedekap, membaca doa iftitah, Al Fatihah, dan Al Qur'an Surat pilihan.", "الْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِينَ", "Alhamdu lillāhi rabbil 'ālamīn", "18%"],
        ["03", "Ruku", "Membungkuk dengan punggung rata dan tuma'ninah.", "سُبْحَانَ رَبِّيَ الْعَظِيمِ وَبِحَمْدِهِ", "Subhāna rabbiyal 'azhīmi wa bihamdih", "32%"],
        ["04", "I'tidal", "Bangkit dari ruku dan berdiri tegak dengan tuma'ninah.", "سَمِعَ اللّٰهُ لِمَنْ حَمِدَهُ", "Sami'allāhu liman hamidah", "45%"],
        ["05", "Sujud", "Meletakkan dahi, hidung, kedua telapak tangan, lutut, dan ujung kaki.", "سُبْحَانَ رَبِّيَ الْأَعْلَى وَبِحَمْدِهِ", "Subhāna rabbiyal a'lā wa bihamdih", "58%"],
        ["06", "Duduk di antara dua sujud", "Duduk dengan tuma'ninah sambil membaca doa.", "رَبِّ اغْفِرْلِي وَارْحَمْنِي وَاجْبُرْنِي", "Rabbighfirlī warhamnī wajburnī", "70%"],
        ["07", "Tasyahud", "Duduk tasyahud dan membaca tahiyat serta sholawat.", "اَلتَّحِيَّاتُ لِلّٰهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ", "At-tahiyyātu lillāhi wash-shalawātu wath-thayyibāt", "84%"],
        ["08", "Salam", "Menoleh ke kanan dan ke kiri untuk mengakhiri sholat.", "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ", "Assalāmu'alaikum warahmatullāh", "96%"],
      ],
    },
    {
      id: "jamaah", title: "Sholat Berjamaah", icon: "👥", summary: "Posisi imam, makmum, shaf, dan aturan mengikuti imam.",
      steps: [
        ["🧭", "Tentukan imam", "Imam berdiri di depan dan memastikan arah kiblat."],
        ["↔️", "Luruskan shaf", "Makmum merapatkan serta meluruskan barisan."],
        ["🕌", "Ikuti imam", "Makmum tidak mendahului gerakan imam."],
        ["🙇", "Jaga tuma'ninah", "Setiap gerakan dilakukan tertib dan tenang."],
        ["⏳", "Makmum masbuk", "Menyempurnakan rakaat setelah imam salam."],
        ["🤝", "Salam dan tertib", "Mengakhiri sholat bersama dengan tertib."],
      ],
    },
    {
      id: "tayamum", title: "Tayamum", icon: "🪨", summary: "Pengganti wudhu ketika air tidak tersedia atau tidak dapat digunakan.",
      steps: [
        ["✅", "Pastikan sebab", "Tidak menemukan air atau penggunaan air membahayakan."],
        ["🤲", "Niat", "Berniat tayamum karena Allah Subhanahu Wata'ala."],
        ["🪨", "Sentuhkan tangan", "Menyentuhkan telapak tangan pada debu yang suci."],
        ["🙂", "Usap wajah", "Mengusap seluruh wajah satu kali."],
        ["👐", "Usap tangan", "Mengusap tangan kanan dan kiri secara tertib."],
      ],
    },
    {
      id: "puasa", title: "Puasa", icon: "🌙", summary: "Alur puasa dari niat, sahur, menjaga diri, sampai berbuka.",
      steps: [
        ["🤲", "Niat", "Berniat puasa sesuai jenis dan waktunya."],
        ["🍽️", "Sahur", "Makan sahur secukupnya sebelum waktu imsak."],
        ["⏳", "Menahan diri", "Menahan makan, minum, dan segala hal yang membatalkan."],
        ["💬", "Menjaga akhlak", "Menjaga ucapan, sikap, dan memperbanyak amal baik."],
        ["🌇", "Berbuka", "Segera berbuka ketika waktu Maghrib tiba."],
      ],
    },
    {
      id: "zakat", title: "Zakat", icon: "🤲", summary: "Menghitung kewajiban dan menyalurkan zakat kepada mustahik.",
      steps: [
        ["📘", "Kenali jenis", "Bedakan zakat fitrah dan zakat mal."],
        ["🧮", "Hitung kewajiban", "Periksa ukuran, nishab, dan haul sesuai ketentuan."],
        ["🤲", "Niat", "Berniat menunaikan zakat karena Allah Subhanahu Wata'ala."],
        ["📦", "Serahkan", "Menyalurkan melalui amil atau kepada mustahik yang berhak."],
        ["✅", "Pastikan tepat", "Memastikan jumlah dan penerima sesuai ketentuan."],
      ],
    },
    {
      id: "haji", title: "Haji", icon: "🕋", summary: "Urutan pokok manasik dari ihram sampai tahallul.",
      steps: [
        ["🧺", "Ihram dan niat", "Memakai pakaian ihram dan berniat dari miqat."],
        ["🏜️", "Wukuf", "Berdiam di Arafah pada waktu yang ditentukan."],
        ["🌙", "Mabit", "Bermalam di Muzdalifah dan Mina sesuai ketentuan."],
        ["🪨", "Melontar jumrah", "Melontar jumrah dengan tertib."],
        ["🕋", "Tawaf", "Mengelilingi Ka'bah tujuh putaran."],
        ["🚶", "Sa'i", "Berjalan antara Shafa dan Marwah tujuh kali."],
        ["✂️", "Tahallul", "Mencukur atau memotong rambut."],
      ],
    },
    {
      id: "kurban", title: "Kurban", icon: "🐐", summary: "Persiapan hewan, penyembelihan syar'i, dan pembagian daging.",
      steps: [
        ["🤲", "Niat dan waktu", "Berniat kurban dan melaksanakannya pada waktu yang ditentukan."],
        ["🐐", "Pilih hewan", "Memastikan hewan cukup umur, sehat, dan tidak cacat."],
        ["🧭", "Persiapan", "Menghadapkan hewan ke kiblat dan memperlakukannya dengan baik."],
        ["🔪", "Penyembelihan", "Membaca basmalah dan menyembelih dengan alat tajam sesuai syariat."],
        ["📦", "Pembagian", "Membagikan daging secara bersih, adil, dan tertib."],
      ],
    },
  ];

  function stepVisual(module, step, index) {
    if (module.id === "wudhu") {
      return `<figure class="v52-step-image wudhu"><img src="${WUDHU_IMAGE}" alt="Visual murid berwudhu" loading="lazy"><span>${escapeHtml(step[0])}</span></figure>`;
    }
    if (module.id === "sholat") {
      return `<figure class="v52-step-image sholat"><img src="${SHOLAT_IMAGE}" alt="Ilustrasi urutan posisi sholat" loading="lazy" style="object-position:50% ${escapeHtml(step[6] || "50%")}"><span>${escapeHtml(step[0])}</span></figure>`;
    }
    return `<figure class="v52-step-symbol" data-tone="${index % 6}"><span>${escapeHtml(step[0])}</span></figure>`;
  }

  function buildPracticeBoard() {
    const panel = $("#panel-islamic,[data-panel='islamic']");
    if (!panel) return;
    $("#v50-simulation-board")?.remove();
    $("#v51-worship-board")?.remove();
    if ($("#v52-practice-board", panel)) return;

    const board = document.createElement("section");
    board.id = "v52-practice-board";
    board.innerHTML = `<header class="v52-practice-head"><div><span>PANDUAN VISUAL DAN PRAKTIK</span><h3>Simulasi Ibadah Langkah demi Langkah</h3><p>Visual jelas, bacaan terbaca, dan urutan dapat digulir bebas pada layar HP.</p></div><b>ONLINE + LURING</b></header><nav class="v52-practice-tabs" aria-label="Pilih simulasi ibadah">${MODULES.map((module, index) => `<button type="button" data-v52-module="${module.id}" aria-selected="${index === 0}">${module.icon} ${module.title}</button>`).join("")}</nav><div data-v52-practice-content></div>`;
    panel.append(board);

    const content = $("[data-v52-practice-content]", board);
    const render = (module) => {
      content.innerHTML = `<section class="v52-module-intro"><div><span>${module.icon}</span><div><h4>${escapeHtml(module.title)}</h4><p>${escapeHtml(module.summary)}</p></div></div><b>${module.steps.length} tahap</b></section><div class="v52-step-grid">${module.steps.map((step, index) => `<article class="v52-practice-step">${stepVisual(module, step, index)}<div class="v52-step-copy"><span>TAHAP ${index + 1}</span><h5>${escapeHtml(step[1])}</h5><p>${escapeHtml(step[2])}</p>${step[3] || step[4] ? `<aside><strong lang="ar">${escapeHtml(step[3] || "")}</strong><em>${escapeHtml(step[4] || "")}</em></aside>` : ""}</div></article>`).join("")}</div>${module.source ? `<p class="v52-media-credit">${escapeHtml(module.source)}</p>` : ""}`;
    };
    render(MODULES[0]);

    $$("[data-v52-module]", board).forEach((button) => button.addEventListener("click", () => {
      const module = MODULES.find((item) => item.id === button.dataset.v52Module);
      if (!module) return;
      $$("[data-v52-module]", board).forEach((item) => item.setAttribute("aria-selected", String(item === button)));
      render(module);
      content.scrollIntoView({ behavior: "smooth", block: "start" });
    }));
  }

  function suppressLegacyWarnings() {
    const pattern = /mode lokal|belum real-time lintas perangkat|statistik hanya berasal dari perangkat ini|postingan kegiatan dapat hilang/i;
    $$("p,small,strong,section,article,aside,div").forEach((node) => {
      if (node.children.length > 18) return;
      if (!pattern.test(clean(node.textContent))) return;
      (node.closest("section,article,aside,.notice,.status-card") || node).classList.add("v52-hide-legacy-warning");
    });
  }

  function runRepairs() {
    neutralizeLegacyFocus();
    repairAiLayout();
    colorizeHomeTiles();
    buildPracticeBoard();
    suppressLegacyWarnings();
    ensureEditorCatControl();
    if (cat.active && !isEditor()) {
      document.documentElement.classList.add("v52-cat-mode");
      ensureCatBar();
      ensureStudentPanelVisible();
      armHistory();
    }
  }

  function scheduleRepairs() {
    clearTimeout(mutationTimer);
    mutationTimer = setTimeout(runRepairs, 80);
  }

  function initialize() {
    document.documentElement.dataset.paibpFinal = VERSION;
    neutralizeLegacyFocus();
    document.addEventListener("click", onClick, true);
    document.addEventListener("pointerdown", () => {
      if (cat.active && !document.fullscreenElement && !isEditor()) secureScreen();
    }, { capture: true });
    window.addEventListener("popstate", onPopState);
    window.addEventListener("beforeunload", (event) => {
      if (!cat.active || isEditor()) return;
      event.preventDefault();
      event.returnValue = "";
    });
    window.addEventListener("storage", (event) => {
      if (event.key === PROGRESS_KEY) checkCompletion();
    });
    document.addEventListener("fullscreenchange", () => {
      neutralizeLegacyFocus();
      if (cat.active) ensureStudentPanelVisible();
    });

    runRepairs();
    const observer = new MutationObserver(scheduleRepairs);
    observer.observe(document.body, { childList: true, subtree: true });
    setInterval(neutralizeLegacyFocus, 700);
    pollCatControl();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();

  window.PAIBP_CAT_V52 = Object.freeze({
    enter: enterCatMode,
    release: () => releaseCatMode("editor"),
    state: () => ({ ...cat }),
  });
})();
