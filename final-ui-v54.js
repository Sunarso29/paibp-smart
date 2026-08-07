(() => {
  "use strict";

  const VERSION = "54";
  const CONFIG = window.PAIBP_CONFIG || {};
  const CAT_KEY = "paibp-smart-cat-session-v54";
  const PROGRESS_KEY = "paibp-smart-progress-v3";
  const TEACHER_KEY = "paibp-smart-teacher-identity-v1";
  const AUTH_KEY = "paibp-smart-authority-v54";
  const OWNER_GATEWAY = "paibp-smart-owner-gateway-v30";
  const EDITOR_UNLOCKED = "paibp-smart-editor-unlocked";
  const LEGACY_LOCK_KEYS = [
    "paibp-smart-cat-session-v52",
    "paibp-smart-cat-session-v53",
    "paibp-smart-focus-session-v48",
    "paibp-smart-focus-session-v50"
  ];

  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];
  const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const parse = (value, fallback) => { try { return JSON.parse(value); } catch { return fallback; } };
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  })[character]);
  const pageName = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  let cat = parse(sessionStorage.getItem(CAT_KEY), null) || {
    active: false,
    targetChapter: "",
    startedAt: 0,
    releasedAt: 0
  };
  let completionTimer = 0;
  let mutationTimer = 0;
  let historyArmed = false;
  let previousPanelId = "";

  function identity() {
    return parse(localStorage.getItem(TEACHER_KEY), {}) || {};
  }

  function ownerMatches() {
    const data = identity();
    const name = String(data.name || data.teacherName || "").toLocaleLowerCase("id");
    const school = String(data.workUnit || data.school || data.teacherSchool || "").toLocaleLowerCase("id");
    return name.includes("sunarso") && school.includes("smp negeri 1 susukan");
  }

  function role() {
    const gateway = String(document.body?.dataset.privateGateway || "").toLowerCase();
    const bodyRole = String(document.body?.dataset.portalRole || "").toLowerCase();
    const stored = sessionStorage.getItem(AUTH_KEY) || localStorage.getItem(AUTH_KEY) || "";
    const editorToken =
      sessionStorage.getItem(OWNER_GATEWAY) === "yes" ||
      sessionStorage.getItem(EDITOR_UNLOCKED) === "true" ||
      localStorage.getItem(EDITOR_UNLOCKED) === "true";

    if (
      pageName === "kendali-editor.html" ||
      gateway === "editor" ||
      stored === "editor" ||
      (editorToken && ownerMatches())
    ) {
      try {
        sessionStorage.setItem(AUTH_KEY, "editor");
        localStorage.setItem(AUTH_KEY, "editor");
      } catch {}
      return "editor";
    }

    const data = identity();
    const teacherKnown =
      Boolean(data.name || data.teacherName) &&
      Boolean(data.workUnit || data.school || data.teacherSchool) &&
      (
        data.teacherRecognized === true ||
        data.recognized === true ||
        gateway === "guru" ||
        bodyRole === "guru" ||
        pageName === "akses-guru.html" ||
        stored === "teacher"
      );

    if (teacherKnown) {
      try { sessionStorage.setItem(AUTH_KEY, "teacher"); } catch {}
      return "teacher";
    }
    return "student";
  }

  function privileged() {
    return role() !== "student";
  }

  function saveCat() {
    try { sessionStorage.setItem(CAT_KEY, JSON.stringify(cat)); } catch {}
  }

  function removeLegacyLocks() {
    LEGACY_LOCK_KEYS.forEach((key) => {
      try { sessionStorage.removeItem(key); } catch {}
    });
    document.documentElement.classList.remove(
      "v48-student-focus",
      "v50-task-focus",
      "v52-cat-mode",
      "v53-cat-mode",
      "v53-supervisor-preview"
    );
    [
      "#v48-focus-gate",
      "#v50-focus-resume",
      "#v52-cat-bar",
      "#v53-cat-bar",
      "#v53-supervisor-bar"
    ].forEach((selector) => $(selector)?.remove());
  }

  function toast(message, tone = "info") {
    let node = $("#v54-toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "v54-toast";
      node.setAttribute("role", "status");
      node.setAttribute("aria-live", "polite");
      document.body.append(node);
    }
    node.dataset.tone = tone;
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), 3000);
  }

  function studentPanel() {
    return $("#panel-student,[data-panel='student']");
  }

  function activeWorkspacePanel() {
    return $(".workspace-panel:not([hidden])");
  }

  function showOnlyStudentPanel() {
    const panel = studentPanel();
    if (!panel) return;
    panel.hidden = false;
    panel.removeAttribute("hidden");
    $$(".workspace-panel").forEach((node) => {
      if (node !== panel) node.hidden = true;
    });
  }

  function restorePreviousPanel() {
    const student = studentPanel();
    if (student) student.hidden = true;
    let target = previousPanelId ? document.getElementById(previousPanelId) : null;
    if (!target || target === student) target = $("#panel-welcome,[data-panel='welcome']");
    if (target) target.hidden = false;
  }

  function ensureCatBar() {
    let bar = $("#v54-cat-bar");
    if (!bar) {
      bar = document.createElement("header");
      bar.id = "v54-cat-bar";
      bar.innerHTML = `
        <div>
          <span>MODE CAT PAIBP SMART</span>
          <strong>Selesaikan materi, latihan, LKPD, evaluasi, dan refleksi</strong>
        </div>
        <div>
          <b>Scroll aktif</b>
          <small>Navigasi keluar terbuka otomatis setelah bab selesai</small>
        </div>`;
      document.body.append(bar);
    }
    return bar;
  }

  function ensureSupervisorTools() {
    const currentRole = role();
    if (currentRole === "student") {
      $("#v54-supervisor-tools")?.remove();
      return;
    }
    let tools = $("#v54-supervisor-tools");
    if (!tools) {
      tools = document.createElement("aside");
      tools.id = "v54-supervisor-tools";
      document.body.append(tools);
    }
    const editor = currentRole === "editor";
    tools.dataset.role = currentRole;
    tools.innerHTML = `
      <span>${editor ? "EDITOR" : "GURU"} • PRATINJAU RUANG MURID</span>
      <button type="button" data-v54-preview-exit>
        ${editor ? "Kembali ke Kendali Editor" : "Keluar dari Pratinjau"}
      </button>`;
    $("[data-v54-preview-exit]", tools)?.addEventListener("click", () => {
      document.documentElement.classList.remove("v54-supervisor-preview");
      tools.remove();
      restorePreviousPanel();
      if (editor && pageName !== "kendali-editor.html") location.href = "kendali-editor.html";
    });
  }

  function enterSupervisorPreview() {
    removeLegacyLocks();
    cat.active = false;
    cat.releasedAt = Date.now();
    saveCat();
    clearInterval(completionTimer);
    document.documentElement.classList.remove("v54-cat-mode");
    document.documentElement.classList.add("v54-supervisor-preview");
    previousPanelId = activeWorkspacePanel()?.id || "panel-welcome";
    showOnlyStudentPanel();
    ensureSupervisorTools();
  }

  async function requestSecureScreen() {
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
    try { history.pushState({ paibpCatV54: true }, "", location.href); } catch {}
  }

  function enterCatMode() {
    if (privileged()) {
      enterSupervisorPreview();
      return;
    }
    removeLegacyLocks();
    previousPanelId = activeWorkspacePanel()?.id || "panel-welcome";
    cat.active = true;
    cat.startedAt = Date.now();
    cat.releasedAt = 0;
    saveCat();
    document.documentElement.classList.add("v54-cat-mode");
    document.body?.setAttribute("data-portal-role", "murid");
    showOnlyStudentPanel();
    ensureCatBar();
    armHistory();
    clearInterval(completionTimer);
    completionTimer = setInterval(checkCompletion, 900);
  }

  function releaseCatMode(message = "Tugas selesai. Navigasi keluar sudah dibuka.") {
    cat.active = false;
    cat.releasedAt = Date.now();
    saveCat();
    clearInterval(completionTimer);
    document.documentElement.classList.remove("v54-cat-mode");
    $("#v54-cat-bar")?.remove();
    try { screen.orientation?.unlock?.(); } catch {}
    if (document.fullscreenElement) document.exitFullscreen?.().catch?.(() => {});
    toast(message, "success");
  }

  function activeChapterId() {
    const active = $(
      "[data-chapter].active,[data-chapter-id].active,[data-material-id].active," +
      "[aria-current='true'][data-chapter],[aria-pressed='true'][data-chapter]"
    );
    return active?.dataset.chapter ||
      active?.dataset.chapterId ||
      active?.dataset.materialId ||
      cat.targetChapter ||
      "";
  }

  function completedIds() {
    const progress = parse(localStorage.getItem(PROGRESS_KEY), {}) || {};
    const lists = [
      progress.completed,
      progress.completedIds,
      progress.chaptersCompleted
    ].filter(Array.isArray);
    return [...new Set(lists.flat().map(String))];
  }

  function checkCompletion() {
    if (!cat.active || privileged()) return;
    const target = cat.targetChapter || activeChapterId();
    if (target && completedIds().includes(String(target))) releaseCatMode();
  }

  function rememberChapter(node) {
    const id = node?.dataset.chapter ||
      node?.dataset.chapterId ||
      node?.dataset.materialId ||
      "";
    if (!id) return;
    cat.targetChapter = id;
    saveCat();
  }

  function allowedStudentAction(target) {
    if (!target) return false;
    if (target.matches("input,textarea,select,option,label")) return true;
    if (!target.closest("#panel-student,[data-panel='student']")) return false;
    const text = clean(target.textContent);
    return !/beranda|fitur islami|game|portal guru|about|kontak|keluar|tutup|menu utama/i.test(text);
  }

  function blockStudentExit(event) {
    if (!cat.active || privileged()) return;
    const target = event.target.closest("a,button,[data-open-panel],[data-close-workspace]");
    if (!target) return;

    const chapter = target.closest("[data-chapter],[data-chapter-id],[data-material-id]");
    if (chapter) rememberChapter(chapter);

    if (target.matches('[data-open-panel="student"]') || allowedStudentAction(target)) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    showOnlyStudentPanel();
    toast("Mode CAT aktif. Selesaikan bab sebelum membuka menu lain.", "warning");
  }

  function handleClick(event) {
    const studentEntry = event.target.closest('[data-open-panel="student"]');
    if (studentEntry) {
      if (privileged()) {
        setTimeout(enterSupervisorPreview, 0);
      } else {
        enterCatMode();
        requestSecureScreen();
      }
      return;
    }
    if (cat.active) blockStudentExit(event);
  }

  function handleBackButton() {
    if (!cat.active || privileged()) return;
    try { history.pushState({ paibpCatV54: true }, "", location.href); } catch {}
    showOnlyStudentPanel();
    toast("Tombol kembali dibatasi selama Mode CAT.", "warning");
  }

  function releasePrivilegedLocks() {
    if (!privileged()) return;
    removeLegacyLocks();
    cat.active = false;
    cat.releasedAt = Date.now();
    saveCat();
    clearInterval(completionTimer);
    document.documentElement.classList.remove("v54-cat-mode");
    $("#v54-cat-bar")?.remove();
    document.body?.classList.add("v54-privileged");
  }

  function luminance(rgb) {
    const match = String(rgb || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!match) return null;
    const values = match.slice(1, 4).map((number) => {
      const value = Number(number) / 255;
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
  }

  function nearestOpaqueBackground(node) {
    let current = node;
    for (let depth = 0; current && depth < 6; depth += 1, current = current.parentElement) {
      const style = getComputedStyle(current);
      const color = style.backgroundColor;
      if (color && !/rgba?\(\s*0,\s*0,\s*0,\s*0\s*\)/.test(color) && color !== "transparent") return color;
    }
    return "rgb(255,255,255)";
  }

  function auditContrast(root = document) {
    const selectors = [
      "button", "a", "[role='tab']", ".access-tile", ".feature-card",
      ".news-card", ".islamic-menu-item", ".teacher-doc-menu button",
      ".v48-source-document td", ".v48-source-document th",
      ".khutbah-list button", ".article-list button"
    ].join(",");

    $$(selectors, root).forEach((node) => {
      if (!node.isConnected || node.closest("#v54-practice-board")) return;
      const style = getComputedStyle(node);
      const textLum = luminance(style.color);
      const bgLum = luminance(nearestOpaqueBackground(node));
      if (textLum == null || bgLum == null) return;
      node.classList.toggle("v54-auto-dark", bgLum > 0.72 && textLum > 0.64);
      node.classList.toggle("v54-auto-light", bgLum < 0.24 && textLum < 0.32);
    });
  }

  function colorizeHome() {
    const tones = ["forest","sunset","ocean","violet","coral","teal","indigo","gold"];
    $$(".hero-access-panel .access-tile,.feature-grid article,.home-feature-card").forEach((tile, index) => {
      tile.dataset.v54Tone = tones[index % tones.length];
      tile.querySelectorAll("strong,small,b,span,p,h3,h4").forEach((node) => {
        node.hidden = false;
        node.style.removeProperty("color");
        node.style.removeProperty("-webkit-text-fill-color");
        node.style.removeProperty("opacity");
        node.style.removeProperty("visibility");
      });
    });
  }

  const ISLAM_LABELS = /beranda|al qur|hisnul|dzikir pagi|dzikir petang|kalender hijriah|bahasa arab|khutbah/i;

  function findIslamicNavigation(panel) {
    const controls = $$("a,button,[role='tab']", panel).filter((node) =>
      ISLAM_LABELS.test(clean(node.textContent))
    );
    if (controls.length < 5) return null;
    const candidates = [];
    controls.forEach((control) => {
      let node = control.parentElement;
      for (let depth = 0; node && node !== panel && depth < 6; depth += 1, node = node.parentElement) {
        const count = $$("a,button,[role='tab']", node).filter((item) =>
          ISLAM_LABELS.test(clean(item.textContent))
        ).length;
        if (count >= 5) candidates.push({ node, count, depth });
      }
    });
    candidates.sort((a, b) => b.count - a.count || a.depth - b.depth);
    return candidates[0]?.node || null;
  }

  function repairIslamicMenu() {
    const panel = $("#panel-islamic,[data-panel='islamic']");
    if (!panel) return;
    const nav = findIslamicNavigation(panel);
    if (!nav) return;
    nav.classList.add("v54-islamic-nav");
    const tones = ["forest","blue","purple","orange","rose","teal","indigo","gold"];
    $$("a,button,[role='tab']", nav)
      .filter((node) => ISLAM_LABELS.test(clean(node.textContent)))
      .forEach((node, index) => {
        node.dataset.v54Tone = tones[index % tones.length];
        node.querySelectorAll("span,strong,small,b").forEach((part) => {
          part.hidden = false;
          part.style.removeProperty("color");
          part.style.removeProperty("-webkit-text-fill-color");
          part.style.removeProperty("opacity");
        });
      });

    const heading = $(".panel-heading", panel);
    const contentShell = nav.parentElement;
    if (contentShell && contentShell !== panel) contentShell.classList.add("v54-islamic-shell");
    if (heading && nav.parentElement === panel && heading.nextElementSibling !== nav) {
      heading.insertAdjacentElement("afterend", nav);
    }
  }

  function repairAiMobile() {
    const panel = $(".ai-drawer-panel-v27") || $(".spensus-ai-v48");
    if (!panel) return;
    panel.classList.add("v54-ai-mobile");
    const toolbars = $$(".v48-ai-tools", panel);
    toolbars.slice(1).forEach((node) => node.remove());
    const messages = $("[data-ai-messages],#spensus-ai-messages,.ai-drawer-messages-v27", panel);
    if (messages) messages.setAttribute("tabindex", "0");
  }

  const MODULES = [
    {
      id: "wudhu", title: "Wudhu", summary: "Sembilan tahap wudhu dari niat sampai doa setelah wudhu.",
      color: "blue", steps: [
        ["Niat dan basmalah","Berniat wudhu karena Alloh Subhanahu Wata'ala, lalu membaca basmalah.","بِسْمِ اللّٰهِ","Bismillāh"],
        ["Membasuh telapak tangan","Membasuh kedua telapak tangan sampai pergelangan sebanyak tiga kali."],
        ["Berkumur","Mengambil air dengan tangan kanan, berkumur, lalu mengeluarkannya."],
        ["Membersihkan hidung","Memasukkan air ke hidung secukupnya, kemudian mengeluarkannya."],
        ["Membasuh wajah","Membasuh seluruh wajah secara merata sebanyak tiga kali."],
        ["Membasuh tangan sampai siku","Mendahulukan tangan kanan, lalu kiri, masing-masing tiga kali."],
        ["Membasuh kepala","Mengusap sebagian atau seluruh kepala satu kali."],
        ["Mengusap telinga","Membersihkan bagian dalam dan luar kedua telinga."],
        ["Membasuh kaki dan berdoa","Membasuh kaki kanan lalu kiri sampai mata kaki, kemudian membaca doa setelah wudhu.","أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ","Asyhadu allā ilāha illallāh"]
      ]
    },
    {
      id: "sholat", title: "Sholat", summary: "Gerakan sholat dari takbiratul ihram sampai salam disertai bacaan pokok.",
      color: "purple", steps: [
        ["Takbiratul ihram","Berdiri menghadap kiblat, berniat, kemudian mengangkat kedua tangan.","اللّٰهُ أَكْبَرُ","Allāhu akbar"],
        ["Berdiri dan membaca","Bersedekap, membaca doa iftitah, Al Fatihah, dan Al Qur'an Surat pilihan.","الْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِينَ","Alhamdu lillāhi rabbil 'ālamīn"],
        ["Ruku","Membungkuk dengan punggung rata dan tuma'ninah.","سُبْحَانَ رَبِّيَ الْعَظِيمِ وَبِحَمْدِهِ","Subhāna rabbiyal 'azhīmi wa bihamdih"],
        ["I'tidal","Bangkit dari ruku dan berdiri tegak dengan tuma'ninah.","سَمِعَ اللّٰهُ لِمَنْ حَمِدَهُ","Sami'allāhu liman hamidah"],
        ["Sujud","Meletakkan dahi, hidung, telapak tangan, lutut, dan ujung kaki.","سُبْحَانَ رَبِّيَ الْأَعْلَى وَبِحَمْدِهِ","Subhāna rabbiyal a'lā wa bihamdih"],
        ["Duduk di antara dua sujud","Duduk dengan tuma'ninah sambil membaca doa.","رَبِّ اغْفِرْلِي وَارْحَمْنِي وَاجْبُرْنِي","Rabbighfirlī warhamnī wajburnī"],
        ["Tasyahud","Duduk tasyahud dan membaca tahiyat serta sholawat.","اَلتَّحِيَّاتُ لِلّٰهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ","At-tahiyyātu lillāhi wash-shalawātu wath-thayyibāt"],
        ["Salam","Menoleh ke kanan lalu ke kiri untuk mengakhiri sholat.","السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ","Assalāmu'alaikum warahmatullāh"]
      ]
    },
    {
      id: "jamaah", title: "Sholat Berjamaah", summary: "Posisi imam, shaf makmum, gerakan bersama, dan ketertiban berjamaah.",
      color: "orange", steps: [
        ["Imam dan makmum","Imam berdiri paling depan; makmum membentuk barisan di belakangnya."],
        ["Meluruskan dan merapatkan shaf","Makmum meluruskan barisan serta merapatkan jarak tanpa mengganggu."],
        ["Mengikuti gerakan imam","Makmum bergerak setelah imam dan tidak mendahului imam."],
        ["Menyempurnakan rakaat","Makmum masbuk menyempurnakan rakaat setelah imam mengucapkan salam."]
      ]
    },
    {
      id: "tayamum", title: "Tayamum", summary: "Pengganti wudhu ketika air tidak tersedia atau penggunaannya membahayakan.",
      color: "teal", steps: [
        ["Memastikan sebab tayamum","Tidak menemukan air atau penggunaan air membahayakan kesehatan."],
        ["Niat","Berniat tayamum karena Alloh Subhanahu Wata'ala."],
        ["Menyentuhkan tangan ke debu suci","Menyentuhkan kedua telapak tangan pada permukaan berdebu yang suci."],
        ["Mengusap wajah","Mengusap seluruh wajah secara merata."],
        ["Mengusap kedua tangan","Mengusap tangan kanan dan kiri secara tertib."]
      ]
    },
    {
      id: "puasa", title: "Puasa", summary: "Alur puasa dari niat, sahur, menjaga diri, sampai berbuka.",
      color: "indigo", steps: [
        ["Niat","Berniat puasa sesuai jenis dan waktunya."],
        ["Sahur","Makan dan minum secukupnya sebelum waktu Subuh."],
        ["Menahan diri","Menahan makan, minum, dan segala hal yang membatalkan puasa."],
        ["Menjaga akhlak dan ibadah","Menjaga ucapan, sikap, serta memperbanyak amal baik."],
        ["Berbuka","Segera berbuka ketika waktu Maghrib tiba.","اللّٰهُمَّ لَكَ صُمْتُ وَبِكَ آمَنْتُ","Allāhumma laka shumtu wa bika āmantu"]
      ]
    },
    {
      id: "zakat", title: "Zakat", summary: "Mengenali jenis, menghitung kewajiban, berniat, dan menyalurkan zakat.",
      color: "gold", steps: [
        ["Mengenali jenis zakat","Membedakan zakat fitrah dan zakat mal serta syaratnya."],
        ["Menghitung kewajiban","Memeriksa ukuran, nishab, haul, dan jumlah yang harus dikeluarkan."],
        ["Niat","Berniat menunaikan zakat karena Alloh Subhanahu Wata'ala."],
        ["Menyalurkan kepada yang berhak","Menyerahkan melalui amil atau langsung kepada mustahik sesuai ketentuan."]
      ]
    },
    {
      id: "haji", title: "Haji", summary: "Urutan pokok manasik dari ihram sampai tahallul.",
      color: "blue", steps: [
        ["Ihram dan niat","Memakai pakaian ihram dan berniat dari miqat."],
        ["Wukuf di Arafah","Berdiam, berdzikir, dan berdoa di Arafah pada waktunya."],
        ["Mabit di Muzdalifah","Bermalam di Muzdalifah dan mempersiapkan batu untuk jumrah."],
        ["Melontar jumrah","Melontar jumrah di Mina dengan tertib."],
        ["Tawaf","Mengelilingi Ka'bah tujuh putaran."],
        ["Sa'i","Berjalan antara Shafa dan Marwah tujuh kali."],
        ["Tahallul","Mencukur atau memotong rambut sebagai tanda keluar dari ihram."]
      ]
    },
    {
      id: "kurban", title: "Kurban", summary: "Persiapan hewan, penyembelihan sesuai syariat, dan pembagian daging.",
      color: "coral", steps: [
        ["Niat dan waktu","Berniat kurban dan melaksanakannya pada waktu yang ditentukan."],
        ["Memilih hewan sehat","Memastikan hewan cukup umur, sehat, dan tidak cacat."],
        ["Persiapan yang baik","Menghadapkan hewan ke kiblat dan memperlakukannya dengan baik."],
        ["Penyembelihan sesuai syariat","Membaca basmalah dan menyembelih dengan alat tajam tanpa menyiksa hewan."],
        ["Pembagian daging","Membagikan daging secara bersih, adil, dan tertib kepada yang berhak."]
      ]
    }
  ];

  function visualPath(moduleId, index) {
    if (moduleId === "wudhu") return `assets/simulasi-v54/wudhu-${String(index + 1).padStart(2, "0")}.webp`;
    return `assets/simulasi-v54/${moduleId}-${String(index + 1).padStart(2, "0")}.svg`;
  }

  function buildPracticeBoard() {
    const panel = $("#panel-islamic,[data-panel='islamic']");
    if (!panel) return;
    ["#v50-simulation-board","#v51-worship-board","#v52-practice-board","#v53-practice-board"]
      .forEach((selector) => $(selector)?.remove());
    if ($("#v54-practice-board", panel)) return;

    const board = document.createElement("section");
    board.id = "v54-practice-board";
    board.innerHTML = `
      <header class="v54-practice-head">
        <div>
          <span>PANDUAN VISUAL DAN PRAKTIK</span>
          <h3>Simulasi Ibadah Langkah demi Langkah</h3>
          <p>Setiap tahap memakai visual yang berbeda, tata cara yang jelas, serta bacaan pokok yang dapat dibaca pada layar HP.</p>
        </div>
        <b>ONLINE + LURING</b>
      </header>
      <nav class="v54-practice-tabs" aria-label="Pilih simulasi ibadah">
        ${MODULES.map((module, index) => `
          <button type="button" data-v54-module="${module.id}" data-tone="${module.color}" aria-selected="${index === 0}">
            ${module.title}
          </button>`).join("")}
      </nav>
      <div data-v54-practice-content></div>`;
    panel.append(board);

    const content = $("[data-v54-practice-content]", board);

    function render(module) {
      content.innerHTML = `
        <section class="v54-module-intro" data-tone="${module.color}">
          <div>
            <span>${module.title.slice(0, 1)}</span>
            <div><h4>${escapeHtml(module.title)}</h4><p>${escapeHtml(module.summary)}</p></div>
          </div>
          <b>${module.steps.length} tahap</b>
        </section>
        <div class="v54-step-grid">
          ${module.steps.map((step, index) => `
            <article class="v54-practice-step" data-tone="${module.color}">
              <figure class="v54-step-visual">
                <img src="${visualPath(module.id, index)}" alt="${escapeHtml(step[0])}" loading="lazy">
                <span>${index + 1}</span>
              </figure>
              <div class="v54-step-copy">
                <small>TAHAP ${index + 1}</small>
                <h5>${escapeHtml(step[0])}</h5>
                <p>${escapeHtml(step[1])}</p>
                ${step[2] || step[3] ? `
                  <aside>
                    <strong lang="ar" dir="rtl">${escapeHtml(step[2] || "")}</strong>
                    <em>${escapeHtml(step[3] || "")}</em>
                  </aside>` : ""}
              </div>
            </article>`).join("")}
        </div>
        <p class="v54-media-credit">
          Visual wudhu menggunakan contoh karakter yang diberikan editor. Visual lainnya dibuat lokal khusus PAIBP SMART agar ringan dan dapat digunakan saat luring.
        </p>`;
      content.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    render(MODULES[0]);
    $$("[data-v54-module]", board).forEach((button) => {
      button.addEventListener("click", () => {
        const module = MODULES.find((item) => item.id === button.dataset.v54Module);
        if (!module) return;
        $$("[data-v54-module]", board).forEach((item) =>
          item.setAttribute("aria-selected", String(item === button))
        );
        render(module);
      });
    });
  }

  function repairTeacherAccess() {
    if (!privileged()) return;
    $$("#v52-editor-cat,#v53-editor-cat,#v54-editor-cat").forEach((node) => node.remove());
    $$(".teacher-doc-menu button,.teacher-nav button,.teacher-menu button").forEach((button) => {
      button.disabled = false;
      button.removeAttribute("aria-disabled");
      button.classList.remove("v48-button-locked","v52-button-locked","v53-button-locked");
    });
  }

  function repairDocuments() {
    const root = $("#teacher-document");
    if (!root) return;
    root.querySelectorAll("td,th,p,span,div").forEach((node) => {
      node.style.removeProperty("color");
      node.style.removeProperty("-webkit-text-fill-color");
    });
    root.querySelectorAll("tr").forEach((row) => {
      const text = clean(row.textContent);
      const hasMedia = Boolean($("img,svg,input,textarea,select", row));
      row.classList.toggle("v54-empty-row", !text && !hasMedia);
    });
  }

  function runRepairs(root = document) {
    releasePrivilegedLocks();
    colorizeHome();
    repairIslamicMenu();
    repairAiMobile();
    buildPracticeBoard();
    repairTeacherAccess();
    repairDocuments();
    auditContrast(root);
  }

  function scheduleRepairs(root = document) {
    clearTimeout(mutationTimer);
    mutationTimer = setTimeout(() => runRepairs(root), 90);
  }

  function init() {
    document.documentElement.dataset.paibpFinal = VERSION;
    removeLegacyLocks();
    releasePrivilegedLocks();
    runRepairs();

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handleBackButton);
    window.addEventListener("pageshow", () => {
      releasePrivilegedLocks();
      runRepairs();
    });
    window.addEventListener("focus", () => {
      if (cat.active && !privileged()) showOnlyStudentPanel();
    });

    const observer = new MutationObserver((mutations) => {
      const target = mutations.find((item) => item.addedNodes.length)?.target || document;
      scheduleRepairs(target.closest?.(
        "#panel-islamic,#teacher-document,.workspace-panel,.ai-drawer-panel-v27"
      ) || document);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    if (cat.active && !privileged()) {
      document.documentElement.classList.add("v54-cat-mode");
      showOnlyStudentPanel();
      ensureCatBar();
      armHistory();
      completionTimer = setInterval(checkCompletion, 900);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  window.PAIBP_V54 = Object.freeze({
    version: VERSION,
    role,
    enterCatMode,
    releaseCatMode,
    enterSupervisorPreview,
    rebuildSimulation: buildPracticeBoard,
    repair: runRepairs
  });
})();