(() => {
  "use strict";
  const KEY_COPY = "paibp-smart-homepage-copy-v1";
  const KEY_RECENT = "paibp-smart-recent-teachers-v38";
  const KEY_SCOPE = "paibp-smart-teacher-scope-v38";
  const KEY_TEACHER = "paibp-smart-teacher-identity-v1";
  const OFFICIAL_DIRECTORY = "https://referensi.data.kemdikbud.go.id/";

  const normalize = (value) => String(value || "")
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const parse = (value, fallback) => { try { return JSON.parse(value); } catch { return fallback; } };
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  })[char]);
  const isOwner = (identity) => normalize(identity?.name).includes("sunarso")
    && normalize(identity?.workUnit).includes("smp negeri 1 susukan");

  function upgradeHero() {
    const h1 = document.querySelector(".hero-main-v25 h1");
    const copy = document.querySelector(".hero-main-v25 .hero-copy");
    if (!h1 || !copy) return;

    const titleText = "Jendela Pendidikan Digital. Belajar Lebih Hidup dan Bermakna.";
    const titleHtml = 'Jendela Pendidikan Digital.<br><span>Belajar Lebih Hidup dan Bermakna.</span>';
    const bodyCopy = "PAIBP SMART SMP menghadirkan informasi sekolah dan ekosistem pembelajaran kelas VII–IX yang menyatukan materi, LKPD, asesmen, literasi, layanan Islami, game edukatif, serta ruang guru untuk menjawab tantangan kelas melalui teknologi yang aman, menyenangkan, menggembirakan, dan terarah.";

    const oldTitles = [
      "belajar cerdas tumbuh berakhlak",
      "belajar utuh mengajar terarah",
      "belajar cerdas tumbuh berakhlak",
      ""
    ];
    const saved = parse(localStorage.getItem(KEY_COPY) || "{}", {});
    if (!saved.title || oldTitles.includes(normalize(saved.title))) {
      try { localStorage.setItem(KEY_COPY, JSON.stringify({ title: titleText, copy: bodyCopy, version: 38 })); } catch {}
      h1.innerHTML = titleHtml;
      copy.textContent = bodyCopy;
    } else {
      // Editor tetap berwenang penuh bila sudah menyimpan narasi khusus.
      h1.textContent = saved.title;
      copy.textContent = saved.copy || bodyCopy;
    }

    if (!document.querySelector(".v38-hero-badges")) {
      const badges = document.createElement("div");
      badges.className = "v38-hero-badges";
      badges.innerHTML = "<span>Jendela Informasi Sekolah</span><span>Pembelajaran Interaktif</span><span>Teknologi Ramah Murid</span>";
      copy.insertAdjacentElement("afterend", badges);
    }
  }

  const worshipModules = {
    wudhu: {
      label: "Berwudhu",
      icon: "💧",
      title: "Berwudhu dengan tertib dan penuh kesadaran",
      intro: "Simulasi ini membantu memahami urutan wudhu, bagian yang wajib diperhatikan, adab, serta kesalahan yang perlu dihindari. Praktik langsung tetap perlu dibimbing guru atau orang yang memahami tata cara wudhu.",
      note: "Gunakan air secukupnya, pastikan air mengenai anggota wudhu, dan jangan menganggap animasi sebagai pengganti praktik nyata.",
      steps: [
        ["Niat dan basmalah","Berniat untuk bersuci karena Alloh Subhanahu Wata'ala, kemudian membaca basmalah."],
        ["Mencuci kedua telapak tangan","Cuci kedua telapak tangan dan sela-sela jari dengan bersih."],
        ["Berkumur dan membersihkan hidung","Berkumur, memasukkan air ke hidung dengan wajar, lalu mengeluarkannya."],
        ["Membasuh wajah","Basuh seluruh wajah dari batas tumbuh rambut sampai dagu dan dari telinga ke telinga."],
        ["Membasuh kedua tangan","Basuh tangan kanan lalu kiri hingga siku, termasuk sela-sela jari."],
        ["Mengusap kepala dan telinga","Usap kepala dengan air, kemudian bersihkan kedua telinga."],
        ["Membasuh kedua kaki","Basuh kaki kanan lalu kiri sampai mata kaki dan perhatikan sela-sela jari."],
        ["Tertib dan doa setelah wudhu","Lakukan berurutan, kemudian membaca doa setelah wudhu yang bersumber."]
      ]
    },
    sholat: {
      label: "Sholat",
      icon: "🕌",
      title: "Simulasi sholat sesuai tuntunan Nabi Muhammad Sholallohu 'Alaihi Wasallam",
      intro: "Materi menyajikan persiapan, gerakan, bacaan pokok, ketenangan, dan ketertiban sholat. Rincian yang memiliki perbedaan fikih dijelaskan secara proporsional dan tidak dijadikan alasan untuk saling menyalahkan.",
      note: "Gerakan perlu dilakukan dengan tuma'ninah. Bacaan Arab, makhraj, dan praktik sebaiknya diperiksa bersama guru.",
      steps: [
        ["Persiapan","Pastikan suci dari hadats dan najis, menutup aurat, masuk waktu, dan menghadap kiblat."],
        ["Berdiri dan takbiratul ihram","Berdiri sesuai kemampuan, berniat dalam hati, lalu mengucapkan takbiratul ihram."],
        ["Bacaan ketika berdiri","Baca doa istiftah bila dikerjakan, ta'awudz, Al Fatihah, dan surat atau ayat Al Qur'an."],
        ["Rukuk","Bertakbir, rukuk dengan punggung tenang, dan membaca dzikir rukuk."],
        ["I'tidal","Bangkit dari rukuk hingga berdiri tegak dan membaca bacaan i'tidal."],
        ["Sujud","Turun untuk sujud dengan tuma'ninah dan membaca dzikir sujud."],
        ["Duduk di antara dua sujud","Duduk dengan tenang, membaca doa, kemudian sujud kedua."],
        ["Tasyahud dan salam","Lakukan tasyahud sesuai rakaat, membaca sholawat, doa perlindungan, lalu salam."]
      ]
    },
    puasa: {
      label: "Puasa",
      icon: "🌙",
      title: "Puasa: niat, penjagaan diri, dan pembentukan takwa",
      intro: "Simulasi membedakan syarat, rukun, hal yang membatalkan, adab, rukhsah, qadha, dan pembiasaan akhlak selama berpuasa.",
      note: "Masalah kesehatan, kehamilan, perjalanan, atau kondisi khusus perlu dikonsultasikan kepada pihak yang kompeten.",
      steps: [
        ["Memahami jenis puasa","Kenali puasa wajib, puasa sunnah, waktu yang dianjurkan, dan waktu yang dilarang."],
        ["Niat","Niat dilakukan sesuai jenis puasa dan ketentuan waktunya."],
        ["Sahur","Sahur membantu kesiapan fisik dan termasuk amalan yang dianjurkan."],
        ["Menahan diri","Menahan makan, minum, hubungan suami istri, serta pembatal lain sejak fajar hingga matahari terbenam."],
        ["Menjaga lisan dan perilaku","Hindari dusta, gibah, pertengkaran, dan perbuatan yang mengurangi nilai puasa."],
        ["Memperbanyak kebaikan","Isi waktu dengan Al Qur'an, dzikir, doa, sedekah, belajar, dan membantu sesama."],
        ["Berbuka","Segerakan berbuka setelah matahari terbenam dengan bacaan dan makanan yang baik."],
        ["Qadha dan tindak lanjut","Pahami kewajiban qadha atau ketentuan lain sesuai sebab dan rujukan fikih yang tepercaya."]
      ]
    },
    zakat: {
      label: "Zakat",
      icon: "🤲",
      title: "Zakat: membersihkan harta dan menguatkan kepedulian",
      intro: "Materi membahas perbedaan zakat fitrah dan zakat mal, syarat, waktu, perhitungan dasar, penerima, serta penyaluran melalui lembaga yang amanah.",
      note: "Nilai nisab, harga komoditas, dan ketentuan teknis dapat berubah. Periksa lembaga zakat resmi dan rujukan terbaru.",
      steps: [
        ["Menentukan jenis zakat","Bedakan zakat fitrah, emas/perak, perdagangan, pertanian, peternakan, penghasilan, dan jenis lain."],
        ["Memeriksa syarat","Pastikan kepemilikan, nisab, haul, dan syarat lain sesuai jenis zakat."],
        ["Menghitung harta","Catat nilai harta yang menjadi objek zakat secara jujur dan terpisah dari kebutuhan pokok."],
        ["Menentukan kadar","Gunakan kadar yang sesuai dengan jenis zakat dan dasar perhitungannya."],
        ["Menetapkan niat","Niatkan zakat sebagai ibadah karena Alloh Subhanahu Wata'ala."],
        ["Memilih penerima","Salurkan kepada golongan yang berhak atau melalui lembaga yang dapat dipertanggungjawabkan."],
        ["Menyimpan bukti","Simpan catatan perhitungan dan penyaluran untuk transparansi pribadi atau lembaga."],
        ["Melanjutkan kepedulian","Zakat tidak menggantikan sedekah, infak, dan tanggung jawab sosial lainnya."]
      ]
    },
    haji: {
      label: "Haji & Umroh",
      icon: "🕋",
      title: "Manasik haji dan umroh secara runtut",
      intro: "Simulasi membantu mengenali ihram, miqat, talbiyah, thawaf, sa'i, wukuf, mabit, melontar jumrah, tahallul, dan tertib perjalanan ibadah.",
      note: "Manasik memiliki rincian sesuai jenis haji dan kondisi jamaah. Ikuti bimbingan resmi penyelenggara serta pembimbing ibadah.",
      steps: [
        ["Persiapan dan ilmu","Pelajari syarat, rukun, wajib, larangan ihram, kesehatan, dokumen, dan tata perjalanan."],
        ["Miqat dan ihram","Bersiap di miqat, berniat ihram sesuai ibadah, lalu menjaga larangan ihram."],
        ["Talbiyah","Perbanyak talbiyah dengan memahami makna ketundukan kepada Alloh Subhanahu Wata'ala."],
        ["Thawaf","Mengelilingi Ka'bah tujuh putaran sesuai arah dan ketentuan, dimulai dari Hajar Aswad."],
        ["Sa'i","Berjalan tujuh kali antara Shafa dan Marwah dengan dzikir dan doa."],
        ["Wukuf dan rangkaian haji","Untuk haji, laksanakan wukuf di Arafah, mabit, dan rangkaian berikutnya sesuai jadwal."],
        ["Melontar dan tahallul","Laksanakan melontar jumrah sesuai ketentuan, kemudian bercukur atau memotong rambut."],
        ["Tertib dan menjaga akhlak","Jaga kesabaran, keselamatan, kebersihan, hak jamaah lain, dan ikuti arahan petugas."]
      ]
    }
  };

  const worshipSources = [
    ["Muslim.or.id","Artikel fikih dan ibadah bersumber","https://muslim.or.id/"],
    ["Konsultasi Syariah","Tanya jawab fikih — Ustadz Ammi Nur Baits dan kontributor","https://konsultasisyariah.com/"],
    ["Yufid TV","Video kajian dan tutorial ibadah","https://yufid.tv/"],
    ["Radio Rodja","Kajian Islam dan pembahasan ibadah","https://www.radiorodja.com/"],
    ["Rumaysho","Artikel fikih praktis dan manasik","https://rumaysho.com/"],
    ["Pengusaha Muslim","Muamalah, zakat, dan etika usaha","https://pengusahamuslim.com/"],
    ["Muslim Afiyah","Kesehatan Muslim dan panduan ibadah terkait kondisi medis","https://muslimafiyah.com/"],
    ["Yufid Kids","Materi Islam ramah anak","https://yufid.tv/"],
    ["Ustadz Yulian Purnama","Artikel melalui Muslim.or.id","https://muslim.or.id/author/yulian"]
  ];

  function addWorshipSimulation() {
    const menu = document.querySelector(".islamic-menu");
    const content = document.querySelector(".islamic-content");
    if (!menu || !content || menu.querySelector('[data-islamic-view="worship"]')) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "v38-worship-button";
    button.dataset.islamicView = "worship";
    button.setAttribute("aria-pressed", "false");
    button.textContent = "🧭 Simulasi Ibadah";
    const insights = menu.querySelector('[data-islamic-view="insights"]');
    menu.insertBefore(button, insights || null);

    const section = document.createElement("section");
    section.dataset.islamicPage = "worship";
    section.hidden = true;
    section.innerHTML = `
      <div class="v38-worship-shell">
        <header class="v38-worship-hero">
          <span class="feature-eyebrow">PANDUAN VISUAL DAN PRAKTIK</span>
          <h4>Simulasi Ibadah Terstruktur</h4>
          <p>Belajar berwudhu, sholat, puasa, zakat, haji, dan umroh melalui urutan visual, penjelasan mendalam, sumber pemeriksaan, serta pengingat praktik.</p>
        </header>
        <div class="v38-worship-tabs" role="tablist"></div>
        <div id="v38-worship-content"></div>
      </div>`;
    content.append(section);

    const tabs = section.querySelector(".v38-worship-tabs");
    Object.entries(worshipModules).forEach(([id, module], index) => {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.dataset.worshipModule = id;
      tab.setAttribute("aria-pressed", String(index === 0));
      tab.innerHTML = `${module.icon} ${module.label}`;
      tabs.append(tab);
    });

    function render(id) {
      const module = worshipModules[id] || worshipModules.wudhu;
      tabs.querySelectorAll("button").forEach((tab) => tab.setAttribute("aria-pressed", String(tab.dataset.worshipModule === id)));
      section.querySelector("#v38-worship-content").innerHTML = `
        <div class="v38-worship-summary">
          <article class="v38-worship-intro"><span class="feature-eyebrow">${module.icon} ${escapeHtml(module.label)}</span><h4>${escapeHtml(module.title)}</h4><p>${escapeHtml(module.intro)}</p></article>
          <aside class="v38-worship-note"><strong>Catatan praktik</strong><p>${escapeHtml(module.note)}</p></aside>
        </div>
        <div class="v38-step-grid">${module.steps.map((step, index) => `<article class="v38-step"><span class="v38-step-num">${index + 1}</span><div><h5>${escapeHtml(step[0])}</h5><p>${escapeHtml(step[1])}</p></div></article>`).join("")}</div>
        <section><h4>Rujukan pemeriksaan dan video</h4><div class="v38-source-grid">${worshipSources.map((source) => `<a class="v38-source-card" href="${source[2]}" target="_blank" rel="noopener noreferrer">${escapeHtml(source[0])}<small>${escapeHtml(source[1])} ↗</small></a>`).join("")}</div></section>
        <div class="v38-worship-actions"><button type="button" data-v38-print-worship>🖨️ Cetak / Simpan PDF</button><button class="secondary" type="button" data-v38-copy-worship>🔗 Salin tautan simulasi</button></div>
        <p class="document-note">Ringkasan ini bersifat edukatif. Perbedaan rincian fikih diperlakukan dengan adab keilmuan; konfirmasikan praktik kepada guru atau pembimbing yang kompeten.</p>`;
    }
    render("wudhu");

    tabs.addEventListener("click", (event) => {
      const tab = event.target.closest("[data-worship-module]");
      if (tab) render(tab.dataset.worshipModule);
    });
    section.addEventListener("click", async (event) => {
      if (event.target.closest("[data-v38-print-worship]")) window.print();
      if (event.target.closest("[data-v38-copy-worship]")) {
        const url = `${location.origin}${location.pathname}#simulasi-ibadah`;
        try { await navigator.clipboard.writeText(url); event.target.textContent = "✓ Tautan disalin"; }
        catch { prompt("Salin tautan berikut:", url); }
      }
    });

    button.addEventListener("click", () => {
      menu.querySelectorAll("[data-islamic-view]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      content.querySelectorAll("[data-islamic-page]").forEach((page) => { page.hidden = page !== section; });
      section.scrollIntoView({behavior:"smooth",block:"start"});
    });

    if (location.hash === "#simulasi-ibadah") {
      setTimeout(() => button.click(), 250);
    }
  }

  function getRecentProfiles() {
    return parse(localStorage.getItem(KEY_RECENT) || "[]", []).filter((item) => item?.name && item?.workUnit).slice(0, 12);
  }
  function saveRecentProfile(identity) {
    if (!identity?.name || !identity?.workUnit) return;
    const items = getRecentProfiles().filter((item) => normalize(item.name) !== normalize(identity.name) || normalize(item.workUnit) !== normalize(identity.workUnit));
    items.unshift({ name: identity.name, workUnit: identity.workUnit, nip: identity.nip || "", npsn: identity.npsn || "", lastUsed: new Date().toISOString() });
    localStorage.setItem(KEY_RECENT, JSON.stringify(items.slice(0, 12)));
  }

  function enhanceTeacherLogin() {
    const form = document.querySelector("#teacher-access-form");
    const nameInput = document.querySelector("#teacher-name");
    const schoolInput = document.querySelector("#teacher-work-unit");
    const nipInput = document.querySelector("#teacher-nip");
    if (!form || !nameInput || !schoolInput || form.dataset.v38Enhanced) return;
    form.dataset.v38Enhanced = "true";

    const nameList = document.querySelector("#teacher-name-directory");
    const schoolList = document.querySelector("#teacher-school-directory");
    const recentWrap = document.createElement("div");
    recentWrap.className = "v38-recent-wrap";
    recentWrap.innerHTML = '<span class="v38-recent-label">Akses guru terbaru pada perangkat ini</span><div class="v38-recent-chips"></div>';
    nameInput.insertAdjacentElement("afterend", recentWrap);

    const national = document.createElement("div");
    national.className = "v38-national-school-tools";
    national.innerHTML = `<label for="teacher-npsn-v38">NPSN sekolah <small>(opsional, lebih aman daripada pencarian NIP)</small><input id="teacher-npsn-v38" inputmode="numeric" maxlength="8" placeholder="8 digit NPSN"></label><a href="${OFFICIAL_DIRECTORY}" target="_blank" rel="noopener noreferrer">Periksa direktori nasional ↗</a>`;
    const directoryStatus = document.querySelector("#teacher-directory-status");
    (directoryStatus || schoolInput).insertAdjacentElement("afterend", national);
    const npsnInput = national.querySelector("#teacher-npsn-v38");

    function renderRecent() {
      const recent = getRecentProfiles();
      const chips = recentWrap.querySelector(".v38-recent-chips");
      chips.innerHTML = recent.length ? recent.slice(0, 6).map((item, index) => `<button type="button" data-recent-index="${index}">${escapeHtml(item.name)} • ${escapeHtml(item.workUnit)}</button>`).join("") : "<small>Belum ada riwayat guru pada perangkat ini.</small>";
      recent.forEach((item) => {
        if (nameList && !Array.from(nameList.options).some((o) => normalize(o.value) === normalize(item.name))) nameList.append(new Option(item.name));
        if (schoolList && !Array.from(schoolList.options).some((o) => normalize(o.value) === normalize(item.workUnit))) schoolList.append(new Option(item.workUnit));
      });
    }
    renderRecent();

    recentWrap.addEventListener("click", (event) => {
      const button = event.target.closest("[data-recent-index]");
      if (!button) return;
      const item = getRecentProfiles()[Number(button.dataset.recentIndex)];
      if (!item) return;
      nameInput.value = item.name;
      schoolInput.value = item.workUnit;
      if (nipInput) nipInput.value = item.nip || "";
      npsnInput.value = item.npsn || "";
    });

    nameInput.addEventListener("change", () => {
      const match = getRecentProfiles().find((item) => normalize(item.name) === normalize(nameInput.value));
      if (!match) return;
      schoolInput.value = match.workUnit;
      if (nipInput && !nipInput.value) nipInput.value = match.nip || "";
      if (!npsnInput.value) npsnInput.value = match.npsn || "";
    });

    form.addEventListener("submit", () => {
      setTimeout(() => {
        const identity = parse(localStorage.getItem(KEY_TEACHER) || "{}", {});
        identity.npsn = npsnInput.value.trim();
        if (identity.name && identity.workUnit) {
          localStorage.setItem(KEY_TEACHER, JSON.stringify(identity));
          saveRecentProfile(identity);
          renderRecent();
          addTeacherScopeCard();
          addSystemStatus();
        }
      }, 220);
    });

    if (nipInput) {
      const note = document.createElement("small");
      note.className = "v38-local-warning";
      note.textContent = "NIP tetap opsional dan tidak digunakan sebagai direktori publik. Verifikasi nasional sebaiknya memakai NPSN sekolah serta autentikasi akun guru pada backend.";
      nipInput.insertAdjacentElement("afterend", note);
    }
  }

  function hashIdentity(value) {
    let hash = 2166136261;
    for (const char of String(value)) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }
  function currentTeacher() { return parse(localStorage.getItem(KEY_TEACHER) || "{}", {}); }

  function addTeacherScopeCard() {
    const panel = document.querySelector("#panel-teacher");
    const identity = currentTeacher();
    if (!panel || !identity.name || panel.querySelector(".v38-teacher-scope")) return;
    const card = document.createElement("section");
    card.className = "v38-teacher-scope no-print";
    card.innerHTML = `
      <h3>Kelola kelas dan buat tautan murid</h3>
      <p>Tautan menyimpan konteks guru dan kelas. Data lintas perangkat baru benar-benar terpisah setelah backend real-time diaktifkan dan dikonfigurasi untuk membaca teacherScope.</p>
      <div class="v38-scope-grid">
        <input id="v38-class-name" placeholder="Contoh: VIII A">
        <input id="v38-subject-name" value="PAIBP" placeholder="Mata pelajaran">
        <button type="button" id="v38-generate-link">Buat tautan kelas</button>
      </div>
      <div class="v38-scope-output" hidden><input readonly id="v38-scope-link"><button type="button" id="v38-copy-scope">Salin</button></div>`;
    const heading = panel.querySelector(".panel-heading");
    heading?.insertAdjacentElement("afterend", card);

    card.querySelector("#v38-generate-link").addEventListener("click", () => {
      const className = card.querySelector("#v38-class-name").value.trim();
      const subject = card.querySelector("#v38-subject-name").value.trim() || "PAIBP";
      if (!className) { card.querySelector("#v38-class-name").focus(); return; }
      const teacherScope = `t-${hashIdentity(`${normalize(identity.name)}|${normalize(identity.workUnit)}|${identity.nip || ""}`)}`;
      const params = new URLSearchParams({
        teacherScope,
        teacherName: identity.name,
        teacherSchool: identity.workUnit,
        className,
        subject
      });
      const link = `${location.origin}${location.pathname.includes("akses-guru") ? location.pathname.replace("akses-guru.html","index.html") : "/paibp-smart/index.html"}?${params}`;
      const output = card.querySelector(".v38-scope-output");
      output.hidden = false;
      card.querySelector("#v38-scope-link").value = link;
      localStorage.setItem(KEY_SCOPE, JSON.stringify({teacherScope, teacherName:identity.name, teacherSchool:identity.workUnit, className, subject}));
    });
    card.querySelector("#v38-copy-scope").addEventListener("click", async () => {
      const input = card.querySelector("#v38-scope-link");
      try { await navigator.clipboard.writeText(input.value); card.querySelector("#v38-copy-scope").textContent = "✓ Disalin"; }
      catch { input.select(); document.execCommand("copy"); }
    });
  }

  function captureSharedTeacherScope() {
    const params = new URLSearchParams(location.search);
    if (params.has("teacherScope")) {
      const scope = {
        teacherScope: params.get("teacherScope") || "",
        teacherName: params.get("teacherName") || "",
        teacherSchool: params.get("teacherSchool") || "",
        className: params.get("className") || "",
        subject: params.get("subject") || "PAIBP"
      };
      localStorage.setItem(KEY_SCOPE, JSON.stringify(scope));
      history.replaceState({}, "", `${location.pathname}${location.hash || ""}`);
    }
    const scope = parse(localStorage.getItem(KEY_SCOPE) || "{}", {});
    if (!scope.teacherScope || document.querySelector(".v38-class-banner")) return;
    const banner = document.createElement("div");
    banner.className = "v38-class-banner";
    banner.innerHTML = `<span>✓</span><div><strong>Kelas terhubung: ${escapeHtml(scope.className || "Kelas digital")}</strong><small>${escapeHtml(scope.subject || "PAIBP")} • Dibimbing ${escapeHtml(scope.teacherName || "guru")} — ${escapeHtml(scope.teacherSchool || "")}</small></div>`;
    const ticker = document.querySelector(".smart-ticker");
    (ticker || document.querySelector("header"))?.insertAdjacentElement("afterend", banner);
  }

  function wrapRealtimeFetch() {
    if (window.__PAIBP_V38_FETCH_WRAPPED__) return;
    window.__PAIBP_V38_FETCH_WRAPPED__ = true;
    const original = window.fetch.bind(window);
    window.fetch = async (input, init = {}) => {
      try {
        const endpoint = String(window.PAIBP_CONFIG?.realtimeEndpoint || "");
        const url = typeof input === "string" ? input : input?.url || "";
        if (endpoint && url.startsWith(endpoint)) {
          const scope = parse(localStorage.getItem(KEY_SCOPE) || "{}", {});
          const identity = currentTeacher();
          const owner = isOwner(identity);
          if (init?.body && typeof init.body === "string" && scope.teacherScope) {
            const payload = parse(init.body, null);
            if (payload && typeof payload === "object") {
              Object.assign(payload, {
                teacherScope: scope.teacherScope,
                teacherName: scope.teacherName || "",
                teacherSchool: scope.teacherSchool || "",
                className: scope.className || "",
                subject: scope.subject || "PAIBP"
              });
              init = {...init, body: JSON.stringify(payload)};
            }
          } else if (!owner && scope.teacherScope && (!init.method || String(init.method).toUpperCase() === "GET")) {
            const next = new URL(url);
            if (["recap","submissions"].includes(next.searchParams.get("action"))) next.searchParams.set("teacherScope", scope.teacherScope);
            input = next.toString();
          }
        }
      } catch {}
      return original(input, init);
    };
  }

  function realtimeConfigured() {
    return /^https:\/\/script\.google\.com\/macros\/s\//.test(String(window.PAIBP_CONFIG?.realtimeEndpoint || ""));
  }
  function addSystemStatus() {
    const panel = document.querySelector("#panel-teacher");
    const editor = document.querySelector("#panel-editor");
    const configured = realtimeConfigured();
    [panel, editor].filter(Boolean).forEach((target) => {
      if (target.querySelector(".v38-system-status")) return;
      const box = document.createElement("section");
      box.className = `v38-system-status no-print ${configured ? "online" : ""}`;
      box.innerHTML = `<span class="v38-status-icon">${configured ? "●" : "!"}</span><div><strong>${configured ? "Sinkronisasi real-time aktif" : "Mode lokal — belum real-time lintas perangkat"}</strong><p>${configured ? "Statistik, tugas, dan galeri dapat disinkronkan melalui backend yang terhubung." : "Statistik hanya berasal dari perangkat ini. Postingan kegiatan dapat hilang bila penyimpanan browser dibersihkan atau dibuka dari perangkat lain."}</p></div><a href="PANDUAN_REKAP_REALTIME.md" target="_blank">Buka panduan</a>`;
      const heading = target.querySelector(".panel-heading");
      heading?.insertAdjacentElement("afterend", box);
    });
    const stats = document.querySelector(".stats-card-v24");
    if (stats && !stats.querySelector(".v38-stat-mode")) {
      const badge = document.createElement("span");
      badge.className = `v38-stat-mode ${configured ? "online" : ""}`;
      badge.textContent = configured ? "Real time lintas perangkat" : "Statistik perangkat ini";
      stats.querySelector(".rail-card-heading")?.append(badge);
    }
  }

  function deduplicateTeacherVisits() {
    const track = document.querySelector("#teacher-visit-track");
    if (!track) return;
    const children = Array.from(track.children);
    if (children.length < 2) return;
    const seen = new Set();
    children.forEach((child) => {
      const key = normalize(child.textContent)
        .replace(/\bberkunjung\b.*$/,"")
        .replace(/\b\d+\s*(menit|jam|hari)\b.*$/,"")
        .trim();
      if (key && seen.has(key)) child.remove();
      else if (key) seen.add(key);
    });
  }

  function initialize() {
    upgradeHero();
    addWorshipSimulation();
    enhanceTeacherLogin();
    captureSharedTeacherScope();
    wrapRealtimeFetch();
    addSystemStatus();
    addTeacherScopeCard();
    deduplicateTeacherVisits();

    const visits = document.querySelector("#teacher-visit-track");
    if (visits) new MutationObserver(() => setTimeout(deduplicateTeacherVisits, 20)).observe(visits,{childList:true,subtree:true});
    const teacherPanel = document.querySelector("#panel-teacher");
    if (teacherPanel) new MutationObserver(() => { addTeacherScopeCard(); addSystemStatus(); }).observe(teacherPanel,{childList:true,subtree:true});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, {once:true});
  else initialize();
})();