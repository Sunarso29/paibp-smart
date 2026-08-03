(() => {
  "use strict";

  const BUILD = "39";
  const DEFAULT_RECITER = "dosary";
  const DEFAULT_RECITER_KEY = "paibp-smart-quran-reciter-v21";
  const DEFAULT_MIGRATION_KEY = "paibp-smart-quran-default-v39";
  const BOOKMARK_KEY = "paibp-smart-quran-bookmarks-v39";
  const QURAN_FONT_KEY = "paibp-smart-quran-font-v39";
  const QURAN_FOCUS_KEY = "paibp-smart-quran-focus-v39";
  const WORSHIP_STATE_KEY = "paibp-smart-worship-state-v39";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[character]);
  const safeParse = (value, fallback) => {
    try { return JSON.parse(value); } catch { return fallback; }
  };
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const SURAH_NAMES = [
    "Al-Fatihah","Al-Baqarah","Ali 'Imran","An-Nisa'","Al-Ma'idah","Al-An'am","Al-A'raf","Al-Anfal","At-Taubah","Yunus","Hud","Yusuf","Ar-Ra'd","Ibrahim","Al-Hijr","An-Nahl","Al-Isra'","Al-Kahf","Maryam","Taha","Al-Anbiya'","Al-Hajj","Al-Mu'minun","An-Nur","Al-Furqan","Asy-Syu'ara'","An-Naml","Al-Qasas","Al-'Ankabut","Ar-Rum","Luqman","As-Sajdah","Al-Ahzab","Saba'","Fatir","Yasin","As-Saffat","Sad","Az-Zumar","Gafir","Fussilat","Asy-Syura","Az-Zukhruf","Ad-Dukhan","Al-Jasiyah","Al-Ahqaf","Muhammad","Al-Fath","Al-Hujurat","Qaf","Az-Zariyat","At-Tur","An-Najm","Al-Qamar","Ar-Rahman","Al-Waqi'ah","Al-Hadid","Al-Mujadilah","Al-Hasyr","Al-Mumtahanah","As-Saff","Al-Jumu'ah","Al-Munafiqun","At-Tagabun","At-Talaq","At-Tahrim","Al-Mulk","Al-Qalam","Al-Haqqah","Al-Ma'arij","Nuh","Al-Jinn","Al-Muzzammil","Al-Muddassir","Al-Qiyamah","Al-Insan","Al-Mursalat","An-Naba'","An-Nazi'at","'Abasa","At-Takwir","Al-Infitar","Al-Mutaffifin","Al-Insyiqaq","Al-Buruj","At-Tariq","Al-A'la","Al-Gasyiyah","Al-Fajr","Al-Balad","Asy-Syams","Al-Lail","Ad-Duha","Asy-Syarh","At-Tin","Al-'Alaq","Al-Qadr","Al-Bayyinah","Az-Zalzalah","Al-'Adiyat","Al-Qari'ah","At-Takasur","Al-'Asr","Al-Humazah","Al-Fil","Quraisy","Al-Ma'un","Al-Kausar","Al-Kafirun","An-Nasr","Al-Lahab","Al-Ikhlas","Al-Falaq","An-Nas"
  ];

  const WAQF_SIGNS = [
    ["م", "Waqaf lazim", "Berhenti lebih kuat untuk menjaga kesempurnaan makna."],
    ["لا", "Jangan berhenti", "Jangan berhenti pada tanda ini bila bacaan masih tersambung."],
    ["ج", "Waqaf jaiz", "Boleh berhenti dan boleh melanjutkan."],
    ["قلى", "Berhenti lebih utama", "Berhenti dinilai lebih utama daripada melanjutkan."],
    ["صلى", "Melanjutkan lebih utama", "Menyambung bacaan dinilai lebih utama."],
    ["س", "Saktah", "Berhenti sangat singkat tanpa mengambil napas."],
    ["ۛ ۛ", "Mu'anaqah", "Berhenti pada salah satu dari dua tanda, bukan pada keduanya."],
  ];

  const WORSHIP_SCENES = {
    wudhu: {
      eyebrow: "BERSUCI • VISUAL LURING",
      title: "Air mengalir, urutan terbaca, bagian penting tidak terlewat",
      caption: "Visual dibangun langsung oleh kode sehingga tetap tampil tanpa internet, tanpa video, dan tanpa buffering.",
      glyph: "💧",
      detail: "Telapak tangan, sela jari, cincin, wajah, siku, kepala, telinga, dan mata kaki ditunjukkan dalam urutan praktik.",
    },
    sholat: {
      eyebrow: "SHOLAT • VISUAL LURING",
      title: "Gerakan runtut dengan penekanan tuma'ninah",
      caption: "Mode praktik membantu mengikuti urutan berdiri, rukuk, i'tidal, sujud, duduk, tasyahud, dan salam.",
      glyph: "🕌",
      detail: "Setiap tahap menekankan ketenangan, posisi tubuh, bacaan pokok, dan kesalahan umum yang perlu dihindari.",
    },
    puasa: {
      eyebrow: "PUASA • VISUAL LURING",
      title: "Dari niat sampai berbuka dalam garis waktu yang jelas",
      caption: "Alur harian menampilkan sahur, fajar, penjagaan diri, amal, dan waktu berbuka.",
      glyph: "🌙",
      detail: "Bukan sekedar menahan lapar, tetapi menjaga lisan, perilaku, ibadah, kesehatan, dan kepedulian.",
    },
    zakat: {
      eyebrow: "ZAKAT • VISUAL LURING",
      title: "Harta dihitung, hak penerima dijaga, penyaluran dicatat",
      caption: "Kartu visual memisahkan jenis zakat, syarat, perhitungan, penerima, dan bukti penyaluran.",
      glyph: "🤲",
      detail: "Nilai nisab dan ketentuan teknis harus diperiksa kembali melalui lembaga resmi pada waktu pelaksanaan.",
    },
    haji: {
      eyebrow: "HAJI & UMROH • VISUAL LURING",
      title: "Manasik terlihat sebagai perjalanan, bukan daftar teks",
      caption: "Peta visual menuntun miqat, ihram, talbiyah, thawaf, sa'i, wukuf, mabit, jumrah, dan tahallul.",
      glyph: "🕋",
      detail: "Urutan menyesuaikan jenis ibadah dan tetap perlu mengikuti pembimbing serta petugas resmi.",
    },
  };

  const WUDHU_STEPS = [
    ["Niat dan basmalah", "Berniat bersuci karena Allah Subhanahu Wata'ala di dalam hati, kemudian membaca basmalah."],
    ["Mencuci telapak tangan kanan", "Alirkan air pada telapak tangan kanan, gosok punggung tangan, telapak, sela-sela jari, ujung jari, dan bagian bawah kuku."],
    ["Mencuci telapak tangan kiri", "Lakukan dengan teliti seperti tangan kanan. Pastikan tidak ada bagian yang tetap kering."],
    ["Periksa cincin dan penghalang air", "Bila memakai cincin yang longgar, putar atau gerakkan agar air mengenai kulit di bawahnya. Bersihkan bahan yang menghalangi air seperti cat tebal atau lem."],
    ["Berkumur", "Ambil air dengan tangan kanan, masukkan ke mulut, gerakkan secara wajar, lalu keluarkan. Jangan berlebihan ketika sedang berpuasa."],
    ["Membersihkan hidung", "Masukkan air ke hidung secara wajar dengan tangan kanan, kemudian keluarkan sambil membantu dengan tangan kiri."],
    ["Membasuh seluruh wajah", "Basuh dari batas tumbuh rambut sampai dagu serta dari telinga kanan sampai telinga kiri. Perhatikan lipatan wajah dan area sekitar hidung."],
    ["Membasuh tangan kanan hingga siku", "Mulai dari ujung jari, sela jari, telapak, punggung tangan, lengan, dan sertakan siku. Ratakan air tanpa menyisakan bagian kering."],
    ["Membasuh tangan kiri hingga siku", "Lakukan seperti tangan kanan dan pastikan air mencapai seluruh permukaan sampai siku."],
    ["Mengusap kepala", "Dengan air baru, usap kepala secara merata sesuai tuntunan yang dipelajari; gerakkan tangan dengan tenang dan tidak sekedar menyentuh rambut."],
    ["Mengusap kedua telinga", "Usap bagian dalam telinga dengan telunjuk dan bagian luar dengan ibu jari secara lembut."],
    ["Membasuh kaki kanan sampai mata kaki", "Basuh telapak, punggung kaki, tumit, mata kaki, serta sela-sela jari. Gunakan jari tangan untuk memastikan sela jari terkena air."],
    ["Membasuh kaki kiri sampai mata kaki", "Lakukan seperti kaki kanan. Periksa tumit karena bagian ini sering tidak terkena air secara sempurna."],
    ["Tertib, hemat air, dan doa", "Jaga urutan anggota wudhu, gunakan air secukupnya, kemudian baca doa setelah wudhu yang bersumber."],
  ];

  let quranState = {
    audio: null,
    cards: [],
    sources: [],
    index: 0,
    mode: "none",
    isPlaying: false,
    raf: 0,
    wholeAudio: null,
    speed: 1,
    autoAdvance: true,
    localSampleMismatch: false,
  };

  function ensureStylesMarker() {
    document.documentElement.dataset.portalBuild = "39-quran-worship";
    document.body?.classList.add("v39-ready");
  }

  function improveHomeMetrics() {
    const metrics = $$(".hero-metrics-v25 article");
    if (!metrics.length) return;
    const icons = ["▦", "◎", "✦", "↗"];
    const captions = ["Paket belajar terstruktur", "Ruang mapel SMP", "Arena interaktif", "Siap diakses kapan saja"];
    metrics.forEach((card, index) => {
      if (card.dataset.v39Metric) return;
      card.dataset.v39Metric = "true";
      const strong = $("strong", card);
      const label = $("span", card);
      const icon = document.createElement("i");
      icon.className = "v39-metric-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = icons[index] || "✦";
      const small = document.createElement("small");
      small.textContent = captions[index] || "Layanan digital";
      card.prepend(icon);
      card.append(small);
      if (strong) strong.setAttribute("aria-label", `${strong.textContent} ${label?.textContent || ""}`);
    });
  }

  function createQuranHero() {
    const page = $('[data-islamic-page="quran"]');
    const heading = $(".subheading-row", page);
    if (!page || !heading || $(".v39-quran-hero", page)) return;
    const hero = document.createElement("section");
    hero.className = "v39-quran-hero no-print";
    hero.innerHTML = `
      <div class="v39-quran-orbit" aria-hidden="true"><span>۞</span><i></i><b></b></div>
      <div class="v39-quran-hero-copy">
        <span class="v39-kicker">MUSHAF DIGITAL • LURING & DARING</span>
        <h4>Al Qur'an yang hidup, terbaca, dan mengikuti ayat yang sedang dilantunkan</h4>
        <p>Teks surat tersedia dari paket luring. Pemutar menyorot ayat aktif, bergerak otomatis, menyimpan penanda baca, dan menyiapkan audio qari untuk penggunaan luring pada perangkat yang sama.</p>
        <div class="v39-quran-badges"><span>Rasm Usmani</span><span>Terjemah Indonesia</span><span>7 tanda waqaf MSI</span><span>Ayat sajdah & gharib</span></div>
      </div>
      <aside class="v39-quran-standard-card">
        <span>RUJUKAN UTAMA</span>
        <strong>Qur'an Kementerian Agama</strong>
        <p>Penulisan, tanda baca, tanda waqaf, terjemah, dan informasi mushaf diperiksa dengan pedoman LPMQ Kementerian Agama.</p>
        <a href="https://quran.kemenag.go.id/" target="_blank" rel="noopener noreferrer">Buka Qur'an Kemenag ↗</a>
      </aside>`;
    heading.replaceWith(hero);
  }

  function enhanceQuranControls() {
    const form = $("#quran-form");
    const numberInput = $("#quran-surah-number");
    if (!form || !numberInput || form.dataset.v39Enhanced) return;
    form.dataset.v39Enhanced = "true";
    form.classList.add("v39-quran-controls");

    const selectLabel = document.createElement("label");
    selectLabel.className = "v39-surah-select-label";
    selectLabel.innerHTML = `<span>Pilih surat</span><select id="v39-surah-select" aria-label="Pilih surat Al Qur'an">${SURAH_NAMES.map((name, index) => `<option value="${index + 1}">${index + 1}. ${escapeHtml(name)}</option>`).join("")}</select>`;
    numberInput.closest("label")?.insertAdjacentElement("afterend", selectLabel);
    const surahSelect = $("#v39-surah-select");
    surahSelect.value = String(numberInput.value || 1);
    surahSelect.addEventListener("change", () => {
      numberInput.value = surahSelect.value;
      form.requestSubmit?.();
    });
    numberInput.addEventListener("input", () => {
      const value = clamp(Number(numberInput.value) || 1, 1, 114);
      surahSelect.value = String(value);
    });

    const statusBar = document.createElement("div");
    statusBar.className = "v39-quran-network";
    statusBar.innerHTML = `<span class="v39-network-dot"></span><strong data-v39-network-label></strong><small>Teks tetap tersedia luring; audio surat tersimpan setelah diunduh sekali.</small>`;
    form.insertAdjacentElement("afterend", statusBar);
    const updateNetwork = () => {
      statusBar.classList.toggle("offline", !navigator.onLine);
      $("[data-v39-network-label]", statusBar).textContent = navigator.onLine ? "Daring — audio dapat dipersiapkan" : "Luring — memakai paket dan cache perangkat";
    };
    updateNetwork();
    window.addEventListener("online", updateNetwork);
    window.addEventListener("offline", updateNetwork);

    const reciterSelect = $("#quran-reciter-select");
    if (reciterSelect) {
      reciterSelect.addEventListener("change", () => {
        localStorage.setItem(DEFAULT_MIGRATION_KEY, "manual");
      }, { capture: true });
    }
  }

  function migrateDefaultReciter() {
    const select = $("#quran-reciter-select");
    if (!select) return;
    const migration = localStorage.getItem(DEFAULT_MIGRATION_KEY);
    if (!migration) {
      localStorage.setItem(DEFAULT_RECITER_KEY, DEFAULT_RECITER);
      localStorage.setItem(DEFAULT_MIGRATION_KEY, BUILD);
      if ([...select.options].some((option) => option.value === DEFAULT_RECITER)) {
        select.value = DEFAULT_RECITER;
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
    } else if (!select.value && [...select.options].some((option) => option.value === DEFAULT_RECITER)) {
      select.value = DEFAULT_RECITER;
    }
  }

  function addWaqfStandardPanel() {
    const page = $('[data-islamic-page="quran"]');
    const legend = $("#quran-tajwid-legend", page);
    if (!page || !legend || $(".v39-waqf-standard", page)) return;
    const panel = document.createElement("details");
    panel.className = "v39-waqf-standard no-print";
    panel.innerHTML = `
      <summary><span>وقف</span><div><strong>Tanda waqaf Mushaf Standar Indonesia</strong><small>Buka penjelasan tujuh tanda yang disederhanakan LPMQ</small></div><b>⌄</b></summary>
      <div class="v39-waqf-grid">${WAQF_SIGNS.map(([sign, title, note]) => `<article><span lang="ar" dir="rtl">${escapeHtml(sign)}</span><div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(note)}</p></div></article>`).join("")}</div>
      <p class="v39-standard-note">Tampilan warna merupakan bantuan belajar, bukan pengganti talaqqi, guru Al Qur'an, atau pemeriksaan langsung terhadap Mushaf Al-Qur'an Standar Indonesia.</p>`;
    legend.insertAdjacentElement("afterend", panel);
  }

  function currentSurahNumber() {
    return clamp(Number($("#quran-surah-number")?.value) || 1, 1, 114);
  }

  function cardLabel(card, index) {
    const explicit = $(".ayah-number", card)?.textContent?.trim();
    return explicit || `${currentSurahNumber()}:${index + 1}`;
  }

  function getBookmarks() {
    const value = safeParse(localStorage.getItem(BOOKMARK_KEY) || "[]", []);
    return Array.isArray(value) ? value : [];
  }

  function saveBookmarks(items) {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(items.slice(0, 300)));
  }

  function isBookmarked(reference) {
    return getBookmarks().some((item) => item.reference === reference);
  }

  function toggleBookmark(card, index, button) {
    const reference = cardLabel(card, index);
    const items = getBookmarks();
    const existing = items.findIndex((item) => item.reference === reference);
    if (existing >= 0) items.splice(existing, 1);
    else items.unshift({
      reference,
      surah: currentSurahNumber(),
      ayah: index + 1,
      text: $(".arabic-text", card)?.textContent?.trim() || "",
      translation: [...card.querySelectorAll("p")].find((paragraph) => !paragraph.classList.contains("arabic-text"))?.textContent?.trim() || "",
      savedAt: new Date().toISOString(),
    });
    saveBookmarks(items);
    const active = existing < 0;
    button.classList.toggle("active", active);
    button.textContent = active ? "★ Tersimpan" : "☆ Simpan";
  }

  async function copyAyah(card, index, status) {
    const reference = cardLabel(card, index);
    const arabic = $(".arabic-text", card)?.textContent?.trim() || "";
    const translation = [...card.querySelectorAll("p")].find((paragraph) => !paragraph.classList.contains("arabic-text"))?.textContent?.trim() || "";
    const text = `${arabic}\n\n${translation}\n\nAl Qur'an Surat ${reference} — PAIBP SMART SMP`;
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = "Ayat dan terjemah berhasil disalin.";
    } catch {
      status.textContent = "Browser tidak mengizinkan penyalinan otomatis.";
    }
  }

  async function shareAyah(card, index, status) {
    const reference = cardLabel(card, index);
    const arabic = $(".arabic-text", card)?.textContent?.trim() || "";
    const shareData = {
      title: `Al Qur'an Surat ${reference}`,
      text: `${arabic}\n\nDibaca melalui PAIBP SMART SMP`,
      url: `${location.origin}${location.pathname}#alquran-${reference.replace(":", "-")}`,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        status.textContent = "Tautan dan ayat berhasil disalin untuk dibagikan.";
      }
    } catch (error) {
      if (error?.name !== "AbortError") status.textContent = "Bagikan belum dapat digunakan pada browser ini.";
    }
  }

  function createAyahTools(card, index) {
    if ($(".v39-ayah-tools", card)) return;
    card.dataset.v39Ayah = String(index + 1);
    card.id = `alquran-${currentSurahNumber()}-${index + 1}`;
    const reference = cardLabel(card, index);
    const tools = document.createElement("div");
    tools.className = "v39-ayah-tools no-print";
    tools.innerHTML = `
      <button type="button" data-v39-play-ayah>▶ Putar ayat</button>
      <button type="button" data-v39-bookmark class="${isBookmarked(reference) ? "active" : ""}">${isBookmarked(reference) ? "★ Tersimpan" : "☆ Simpan"}</button>
      <button type="button" data-v39-copy>⧉ Salin</button>
      <button type="button" data-v39-share>↗ Bagikan</button>
      <span data-v39-ayah-status aria-live="polite"></span>`;
    card.append(tools);
    const status = $("[data-v39-ayah-status]", tools);
    $("[data-v39-play-ayah]", tools)?.addEventListener("click", () => playFromAyah(index));
    $("[data-v39-bookmark]", tools)?.addEventListener("click", (event) => toggleBookmark(card, index, event.currentTarget));
    $("[data-v39-copy]", tools)?.addEventListener("click", () => copyAyah(card, index, status));
    $("[data-v39-share]", tools)?.addEventListener("click", () => shareAyah(card, index, status));
  }

  function buildPlayer() {
    const reader = $("#quran-reader");
    if (!reader || $(".v39-quran-player", reader)) return null;
    const player = document.createElement("section");
    player.className = "v39-quran-player no-print";
    player.innerHTML = `
      <div class="v39-player-main">
        <button type="button" data-v39-prev aria-label="Ayat sebelumnya">‹</button>
        <button type="button" class="v39-play-main" data-v39-toggle aria-label="Putar atau jeda">▶</button>
        <button type="button" data-v39-next aria-label="Ayat berikutnya">›</button>
        <div class="v39-now-playing"><span>AYAT AKTIF</span><strong data-v39-current>Belum diputar</strong><small data-v39-reciter>Qari pilihan</small></div>
      </div>
      <div class="v39-player-progress">
        <input data-v39-seek type="range" min="0" max="1000" value="0" aria-label="Posisi audio">
        <div><span data-v39-time>00:00</span><span data-v39-duration>00:00</span></div>
      </div>
      <div class="v39-player-options">
        <label>Kecepatan<select data-v39-speed><option value="0.75">0,75×</option><option value="1" selected>1×</option><option value="1.15">1,15×</option><option value="1.25">1,25×</option></select></label>
        <label class="v39-switch"><input type="checkbox" data-v39-auto checked><span></span> Lanjut otomatis</label>
        <button type="button" data-v39-font-minus aria-label="Perkecil teks Arab">A−</button>
        <button type="button" data-v39-font-plus aria-label="Perbesar teks Arab">A+</button>
        <button type="button" data-v39-focus>Mode fokus</button>
      </div>
      <p class="v39-player-status" data-v39-player-status aria-live="polite">Pilih tombol putar pada ayat atau tekan tombol utama.</p>`;
    const header = $(".quran-surah-head", reader);
    header?.insertAdjacentElement("afterend", player);

    $("[data-v39-toggle]", player)?.addEventListener("click", toggleQuranPlayback);
    $("[data-v39-prev]", player)?.addEventListener("click", () => playFromAyah(Math.max(0, quranState.index - 1)));
    $("[data-v39-next]", player)?.addEventListener("click", () => playFromAyah(Math.min(quranState.cards.length - 1, quranState.index + 1)));
    $("[data-v39-speed]", player)?.addEventListener("change", (event) => {
      quranState.speed = Number(event.target.value) || 1;
      if (quranState.audio) quranState.audio.playbackRate = quranState.speed;
      if (quranState.wholeAudio) quranState.wholeAudio.playbackRate = quranState.speed;
    });
    $("[data-v39-auto]", player)?.addEventListener("change", (event) => { quranState.autoAdvance = event.target.checked; });
    $("[data-v39-seek]", player)?.addEventListener("input", (event) => {
      const activeAudio = quranState.mode === "whole" ? quranState.wholeAudio : quranState.audio;
      if (!activeAudio?.duration) return;
      activeAudio.currentTime = (Number(event.target.value) / 1000) * activeAudio.duration;
      if (quranState.mode === "whole") updateWholeSurahAyahFromTime();
    });
    $("[data-v39-font-minus]", player)?.addEventListener("click", () => adjustQuranFont(-2));
    $("[data-v39-font-plus]", player)?.addEventListener("click", () => adjustQuranFont(2));
    $("[data-v39-focus]", player)?.addEventListener("click", toggleQuranFocus);
    return player;
  }

  function playerElement() {
    return $(".v39-quran-player", $("#quran-reader"));
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const rest = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  }

  function setPlayerStatus(message, tone = "") {
    const status = $("[data-v39-player-status]", playerElement());
    if (!status) return;
    status.textContent = message;
    status.dataset.tone = tone;
  }

  function currentReciterLabel() {
    return $("#quran-reciter-select option:checked")?.textContent?.replace(/\s*•.*$/, "")?.trim() || "Qari pilihan";
  }

  function setActiveAyah(index, { scroll = true } = {}) {
    quranState.index = clamp(index, 0, Math.max(0, quranState.cards.length - 1));
    quranState.cards.forEach((card, cardIndex) => {
      const active = cardIndex === quranState.index;
      card.classList.toggle("is-v39-playing", active);
      card.setAttribute("aria-current", active ? "true" : "false");
    });
    const card = quranState.cards[quranState.index];
    const player = playerElement();
    if (player && card) {
      $("[data-v39-current]", player).textContent = `Al Qur'an Surat ${cardLabel(card, quranState.index)}`;
      $("[data-v39-reciter]", player).textContent = currentReciterLabel();
    }
    if (scroll && card) card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  }

  function setPlaybackButton(isPlaying) {
    const button = $("[data-v39-toggle]", playerElement());
    if (!button) return;
    button.textContent = isPlaying ? "Ⅱ" : "▶";
    button.setAttribute("aria-label", isPlaying ? "Jeda" : "Putar");
  }

  function stopFrameLoop() {
    if (quranState.raf) cancelAnimationFrame(quranState.raf);
    quranState.raf = 0;
  }

  function syncPlayerProgress(audio) {
    const player = playerElement();
    if (!player || !audio) return;
    const duration = Number(audio.duration) || 0;
    const current = Number(audio.currentTime) || 0;
    const seek = $("[data-v39-seek]", player);
    if (seek && duration) seek.value = String(Math.round((current / duration) * 1000));
    $("[data-v39-time]", player).textContent = formatTime(current);
    $("[data-v39-duration]", player).textContent = formatTime(duration);
  }

  function frameLoop() {
    const audio = quranState.mode === "whole" ? quranState.wholeAudio : quranState.audio;
    if (!audio) return;
    syncPlayerProgress(audio);
    if (quranState.mode === "whole") updateWholeSurahAyahFromTime();
    if (!audio.paused && !audio.ended) quranState.raf = requestAnimationFrame(frameLoop);
  }

  function weightedAyahBoundaries() {
    const weights = quranState.cards.map((card) => Math.max(12, ($(".arabic-text", card)?.textContent || "").replace(/\s/g, "").length));
    const total = weights.reduce((sum, weight) => sum + weight, 0) || 1;
    let accumulator = 0;
    return weights.map((weight) => {
      const start = accumulator / total;
      accumulator += weight;
      return [start, accumulator / total];
    });
  }

  function updateWholeSurahAyahFromTime() {
    const audio = quranState.wholeAudio;
    if (!audio?.duration || quranState.localSampleMismatch) return;
    const ratio = clamp(audio.currentTime / audio.duration, 0, 0.999999);
    const boundaries = weightedAyahBoundaries();
    const index = Math.max(0, boundaries.findIndex(([, end]) => ratio < end));
    if (index !== quranState.index) setActiveAyah(index, { scroll: true });
  }

  function resetAudioState() {
    stopFrameLoop();
    if (quranState.audio) {
      quranState.audio.pause();
      quranState.audio.src = "";
    }
    if (quranState.wholeAudio && quranState.wholeAudio !== quranState.audio) quranState.wholeAudio.pause();
    quranState.audio = null;
    quranState.wholeAudio = null;
    quranState.isPlaying = false;
    setPlaybackButton(false);
  }

  function sourceForCard(index) {
    return quranState.sources[index] || "";
  }

  async function playPerAyah(index) {
    const source = sourceForCard(index);
    if (!source) {
      setPlayerStatus("Audio per ayat tidak tersedia untuk qari ini. Gunakan pemutar surat atau pilih qari yang menyediakan audio per ayat.", "warning");
      return;
    }
    if (quranState.wholeAudio) quranState.wholeAudio.pause();
    if (!quranState.audio) quranState.audio = new Audio();
    const audio = quranState.audio;
    audio.pause();
    audio.src = source;
    audio.preload = "auto";
    audio.playbackRate = quranState.speed;
    quranState.mode = "ayah";
    setActiveAyah(index);
    audio.onplay = () => {
      quranState.isPlaying = true;
      setPlaybackButton(true);
      setPlayerStatus(`Memutar ${cardLabel(quranState.cards[index], index)} — ${currentReciterLabel()}.`, "success");
      stopFrameLoop();
      quranState.raf = requestAnimationFrame(frameLoop);
    };
    audio.onpause = () => {
      quranState.isPlaying = false;
      setPlaybackButton(false);
      stopFrameLoop();
      syncPlayerProgress(audio);
    };
    audio.onended = () => {
      quranState.isPlaying = false;
      setPlaybackButton(false);
      stopFrameLoop();
      if (quranState.autoAdvance && index < quranState.cards.length - 1) playPerAyah(index + 1);
      else setPlayerStatus("Tilawah ayat selesai.", "success");
    };
    audio.onerror = () => setPlayerStatus("Audio ayat gagal diputar. Simpan audio ketika daring atau pilih qari lain.", "error");
    try { await audio.play(); }
    catch { setPlayerStatus("Browser menahan pemutaran. Tekan tombol putar sekali lagi.", "warning"); }
  }

  async function playWholeSurah({ fromStart = false } = {}) {
    const audio = quranState.wholeAudio;
    if (!audio) {
      setPlayerStatus("Audio surat belum tersedia untuk qari ini.", "warning");
      return;
    }
    if (quranState.audio) quranState.audio.pause();
    quranState.mode = "whole";
    audio.playbackRate = quranState.speed;
    if (fromStart) audio.currentTime = 0;
    audio.onplay = () => {
      quranState.isPlaying = true;
      setPlaybackButton(true);
      setPlayerStatus(quranState.localSampleMismatch
        ? "Memutar contoh tilawah lokal. Rekaman ini bukan audio penuh surat yang sedang dibuka."
        : `Memutar surat penuh — ${currentReciterLabel()}. Ayat aktif bergerak otomatis mengikuti kemajuan audio.`, quranState.localSampleMismatch ? "warning" : "success");
      stopFrameLoop();
      quranState.raf = requestAnimationFrame(frameLoop);
    };
    audio.onpause = () => {
      quranState.isPlaying = false;
      setPlaybackButton(false);
      stopFrameLoop();
      syncPlayerProgress(audio);
    };
    audio.onended = () => {
      quranState.isPlaying = false;
      setPlaybackButton(false);
      stopFrameLoop();
      setPlayerStatus("Tilawah surat selesai.", "success");
      if (!quranState.localSampleMismatch) setActiveAyah(quranState.cards.length - 1, { scroll: false });
    };
    audio.onerror = () => setPlayerStatus("Audio surat gagal diputar. Periksa koneksi atau simpan audio terlebih dahulu.", "error");
    try { await audio.play(); }
    catch { setPlayerStatus("Browser menahan pemutaran. Tekan tombol putar sekali lagi.", "warning"); }
  }

  function playFromAyah(index) {
    const target = clamp(index, 0, Math.max(0, quranState.cards.length - 1));
    if (sourceForCard(target)) {
      playPerAyah(target);
      return;
    }
    if (quranState.wholeAudio && !quranState.localSampleMismatch) {
      const boundaries = weightedAyahBoundaries();
      const startRatio = boundaries[target]?.[0] || 0;
      if (quranState.wholeAudio.duration) quranState.wholeAudio.currentTime = startRatio * quranState.wholeAudio.duration;
      setActiveAyah(target);
      playWholeSurah();
      return;
    }
    if (quranState.wholeAudio) {
      setActiveAyah(target);
      playWholeSurah();
      return;
    }
    setPlayerStatus("Audio belum tersedia. Pilih qari lain atau sambungkan internet lalu buka surat kembali.", "warning");
  }

  function toggleQuranPlayback() {
    const activeAudio = quranState.mode === "whole" ? quranState.wholeAudio : quranState.audio;
    if (activeAudio && !activeAudio.paused) {
      activeAudio.pause();
      return;
    }
    if (activeAudio?.src) {
      activeAudio.play().catch(() => setPlayerStatus("Tekan tombol putar sekali lagi.", "warning"));
      return;
    }
    playFromAyah(quranState.index || 0);
  }

  function applyQuranFontSize() {
    const reader = $("#quran-reader");
    if (!reader) return;
    const size = clamp(Number(localStorage.getItem(QURAN_FONT_KEY)) || 42, 28, 72);
    reader.style.setProperty("--v39-quran-font", `${size}px`);
  }

  function adjustQuranFont(delta) {
    const next = clamp((Number(localStorage.getItem(QURAN_FONT_KEY)) || 42) + delta, 28, 72);
    localStorage.setItem(QURAN_FONT_KEY, String(next));
    applyQuranFontSize();
  }

  function toggleQuranFocus() {
    const reader = $("#quran-reader");
    if (!reader) return;
    const active = !reader.classList.contains("v39-focus-mode");
    reader.classList.toggle("v39-focus-mode", active);
    localStorage.setItem(QURAN_FOCUS_KEY, active ? "1" : "0");
    const button = $("[data-v39-focus]", playerElement());
    if (button) button.textContent = active ? "Keluar fokus" : "Mode fokus";
  }

  function addQuranSourceFooter() {
    const reader = $("#quran-reader");
    if (!reader || $(".v39-quran-source", reader)) return;
    const footer = document.createElement("section");
    footer.className = "v39-quran-source";
    footer.innerHTML = `
      <div><span>STANDAR & PEMERIKSAAN</span><strong>Mushaf Al-Qur'an Standar Indonesia</strong><p>Rasm, harakat, tanda baca, tanda waqaf, hitungan ayat, ayat sajdah, dan bacaan gharib harus mengikuti naskah yang telah ditashih. Tampilan digital ini menyediakan bantuan belajar dan tautan pemeriksaan resmi.</p></div>
      <div class="v39-source-links"><a href="https://quran.kemenag.go.id/" target="_blank" rel="noopener noreferrer">Qur'an Kemenag</a><a href="https://lajnah.kemenag.go.id/" target="_blank" rel="noopener noreferrer">LPMQ Kemenag</a></div>`;
    reader.append(footer);
  }

  function detectAudioSources(cards, header) {
    const perAyah = cards.map((card) => $("audio source", card)?.src || $("audio", card)?.src || "");
    const headerAudio = $(".quran-surah-audio audio", header);
    const headerSmall = $(".quran-surah-audio small", header)?.textContent || "";
    return {
      perAyah,
      headerAudio,
      localMismatch: /contoh ini terpisah|bukan audio surat/i.test(headerSmall),
    };
  }

  function enhanceRenderedQuran() {
    const reader = $("#quran-reader");
    const header = $(".quran-surah-head", reader);
    const cards = $$(".ayah-card", reader);
    if (!reader || !header || !cards.length || reader.dataset.v39Rendered === `${currentSurahNumber()}-${cards.length}-${currentReciterLabel()}`) return;
    reader.dataset.v39Rendered = `${currentSurahNumber()}-${cards.length}-${currentReciterLabel()}`;
    resetAudioState();
    reader.classList.add("v39-quran-reader");
    header.classList.add("v39-surah-head");
    cards.forEach((card, index) => createAyahTools(card, index));
    quranState.cards = cards;
    const detected = detectAudioSources(cards, header);
    quranState.sources = detected.perAyah;
    quranState.wholeAudio = detected.headerAudio;
    quranState.localSampleMismatch = detected.localMismatch;
    quranState.index = 0;
    quranState.mode = detected.perAyah.some(Boolean) ? "ayah" : detected.headerAudio ? "whole" : "none";
    if (quranState.wholeAudio) {
      quranState.wholeAudio.controls = false;
      quranState.wholeAudio.classList.add("v39-native-hidden");
      quranState.wholeAudio.preload = "metadata";
    }
    cards.forEach((card) => {
      $$("audio", card).forEach((audio) => {
        audio.controls = false;
        audio.classList.add("v39-native-hidden");
      });
    });
    const player = buildPlayer();
    if (player) {
      $("[data-v39-reciter]", player).textContent = currentReciterLabel();
      $("[data-v39-current]", player).textContent = `Al Qur'an Surat ${cardLabel(cards[0], 0)}`;
      const focusActive = localStorage.getItem(QURAN_FOCUS_KEY) === "1";
      reader.classList.toggle("v39-focus-mode", focusActive);
      $("[data-v39-focus]", player).textContent = focusActive ? "Keluar fokus" : "Mode fokus";
    }
    applyQuranFontSize();
    setActiveAyah(0, { scroll: false });
    addQuranSourceFooter();
    const statusText = quranState.mode === "ayah"
      ? "Audio per ayat siap. Setelah satu ayat selesai, ayat berikutnya berpindah otomatis."
      : quranState.mode === "whole" && !quranState.localSampleMismatch
        ? "Audio surat siap. Penyorotan ayat bergerak otomatis berdasarkan kemajuan tilawah."
        : quranState.mode === "whole"
          ? "Contoh tilawah lokal siap, tetapi rekamannya bukan surat penuh yang sedang dibuka."
          : "Teks luring siap. Audio qari ini belum tersedia untuk surat tersebut.";
    setPlayerStatus(statusText, quranState.mode === "none" ? "warning" : quranState.localSampleMismatch ? "warning" : "success");
  }

  function observeQuranReader() {
    const reader = $("#quran-reader");
    if (!reader || reader.dataset.v39Observed) return;
    reader.dataset.v39Observed = "true";
    const observer = new MutationObserver(() => setTimeout(enhanceRenderedQuran, 60));
    observer.observe(reader, { childList: true, subtree: true });
    enhanceRenderedQuran();
  }

  function worshipSceneMarkup(moduleId) {
    const scene = WORSHIP_SCENES[moduleId] || WORSHIP_SCENES.wudhu;
    return `
      <section class="v39-worship-scene" data-v39-scene="${escapeHtml(moduleId)}">
        <div class="v39-scene-stage" aria-hidden="true">
          <div class="v39-scene-ring ring-one"></div><div class="v39-scene-ring ring-two"></div>
          <div class="v39-scene-core"><span>${scene.glyph}</span><i></i></div>
          <div class="v39-scene-particle p1"></div><div class="v39-scene-particle p2"></div><div class="v39-scene-particle p3"></div>
          <div class="v39-scene-floor"></div>
        </div>
        <div class="v39-scene-copy"><span>${escapeHtml(scene.eyebrow)}</span><h4>${escapeHtml(scene.title)}</h4><p>${escapeHtml(scene.caption)}</p><small>${escapeHtml(scene.detail)}</small><div class="v39-offline-pill">✓ Visual tersimpan di aplikasi • tanpa buffering</div></div>
      </section>`;
  }

  function practiceStepsFor(moduleId, content) {
    if (moduleId === "wudhu") return WUDHU_STEPS;
    return $$(".v38-step", content).map((step) => [$("h5", step)?.textContent?.trim() || "Tahap", $("p", step)?.textContent?.trim() || ""]);
  }

  function renderDetailedWudhu(content) {
    const grid = $(".v38-step-grid", content);
    if (!grid || grid.dataset.v39Detailed) return;
    grid.dataset.v39Detailed = "true";
    grid.classList.add("v39-detailed-grid");
    grid.innerHTML = WUDHU_STEPS.map(([title, note], index) => `
      <article class="v38-step v39-wudhu-step" data-v39-step-index="${index}">
        <span class="v38-step-num">${String(index + 1).padStart(2, "0")}</span>
        <div><span class="v39-step-kicker">TAHAP ${index + 1}</span><h5>${escapeHtml(title)}</h5><p>${escapeHtml(note)}</p></div>
        <i aria-hidden="true">${index < 4 ? "✋" : index < 7 ? "💦" : index < 10 ? "〰" : index < 13 ? "🦶" : "✓"}</i>
      </article>`).join("");
  }

  function addWorshipPracticeMode(content, moduleId) {
    if ($(".v39-practice-console", content)) return;
    const steps = practiceStepsFor(moduleId, content);
    if (!steps.length) return;
    const stored = safeParse(localStorage.getItem(WORSHIP_STATE_KEY) || "{}", {});
    let index = clamp(Number(stored[moduleId]) || 0, 0, steps.length - 1);
    const consoleElement = document.createElement("section");
    consoleElement.className = "v39-practice-console no-print";
    consoleElement.innerHTML = `
      <div class="v39-practice-head"><div><span>MODE PRAKTIK TERPANDU</span><h4>Ikuti satu tahap, periksa, lalu lanjutkan</h4></div><strong data-v39-practice-count></strong></div>
      <div class="v39-practice-progress"><span data-v39-practice-bar></span></div>
      <article class="v39-practice-card"><span data-v39-practice-number></span><div><h5 data-v39-practice-title></h5><p data-v39-practice-note></p></div></article>
      <div class="v39-practice-actions"><button type="button" data-v39-practice-prev>← Sebelumnya</button><button type="button" data-v39-practice-done>✓ Tandai dipahami</button><button type="button" data-v39-practice-next>Berikutnya →</button></div>`;
    const scene = $(".v39-worship-scene", content);
    scene?.insertAdjacentElement("afterend", consoleElement);

    const render = () => {
      const [title, note] = steps[index];
      $("[data-v39-practice-count]", consoleElement).textContent = `${index + 1}/${steps.length}`;
      $("[data-v39-practice-number]", consoleElement).textContent = String(index + 1).padStart(2, "0");
      $("[data-v39-practice-title]", consoleElement).textContent = title;
      $("[data-v39-practice-note]", consoleElement).textContent = note;
      $("[data-v39-practice-bar]", consoleElement).style.width = `${((index + 1) / steps.length) * 100}%`;
      $("[data-v39-practice-prev]", consoleElement).disabled = index === 0;
      $("[data-v39-practice-next]", consoleElement).disabled = index === steps.length - 1;
      const all = safeParse(localStorage.getItem(WORSHIP_STATE_KEY) || "{}", {});
      all[moduleId] = index;
      localStorage.setItem(WORSHIP_STATE_KEY, JSON.stringify(all));
      $$("[data-v39-step-index]", content).forEach((card, cardIndex) => card.classList.toggle("is-practice-active", cardIndex === index));
    };
    $("[data-v39-practice-prev]", consoleElement).addEventListener("click", () => { index = Math.max(0, index - 1); render(); });
    $("[data-v39-practice-next]", consoleElement).addEventListener("click", () => { index = Math.min(steps.length - 1, index + 1); render(); });
    $("[data-v39-practice-done]", consoleElement).addEventListener("click", (event) => {
      event.currentTarget.textContent = "✓ Tahap dipahami";
      setTimeout(() => { event.currentTarget.textContent = "✓ Tandai dipahami"; }, 1200);
      if (index < steps.length - 1) { index += 1; render(); }
    });
    render();
  }

  function enhanceWorshipContent() {
    const content = $("#v38-worship-content");
    const tabs = $(".v38-worship-tabs");
    if (!content || !tabs || !content.children.length) return;
    const activeTab = $('[data-worship-module][aria-pressed="true"]', tabs) || $("[data-worship-module]", tabs);
    const moduleId = activeTab?.dataset.worshipModule || "wudhu";
    const signature = `${moduleId}-${content.textContent.length}`;
    if (content.dataset.v39Signature === signature && $(".v39-worship-scene", content)) return;
    content.dataset.v39Signature = signature;
    $(".v39-worship-scene", content)?.remove();
    $(".v39-practice-console", content)?.remove();
    const summary = $(".v38-worship-summary", content);
    summary?.insertAdjacentHTML("beforebegin", worshipSceneMarkup(moduleId));
    if (moduleId === "wudhu") renderDetailedWudhu(content);
    addWorshipPracticeMode(content, moduleId);
    $$(".v38-source-card", content).forEach((link) => {
      link.setAttribute("aria-label", `${link.textContent.trim()} — membuka sumber pemeriksaan daring`);
    });
  }

  function observeWorship() {
    const menu = $(".islamic-menu");
    if (!menu) return;
    const connect = () => {
      const content = $("#v38-worship-content");
      if (!content || content.dataset.v39Observed) return false;
      content.dataset.v39Observed = "true";
      new MutationObserver(() => setTimeout(enhanceWorshipContent, 30)).observe(content, { childList: true, subtree: true });
      $(".v38-worship-tabs")?.addEventListener("click", () => setTimeout(enhanceWorshipContent, 40));
      enhanceWorshipContent();
      return true;
    };
    if (connect()) return;
    const observer = new MutationObserver(() => { if (connect()) observer.disconnect(); });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function improveIslamicMenu() {
    const menu = $(".islamic-menu");
    if (!menu || menu.dataset.v39Menu) return;
    menu.dataset.v39Menu = "true";
    $$("button", menu).forEach((button, index) => {
      const number = document.createElement("small");
      number.className = "v39-menu-index";
      number.textContent = String(index + 1).padStart(2, "0");
      button.append(number);
    });
  }

  function watchReciterAndSurah() {
    $("#quran-reciter-select")?.addEventListener("change", () => {
      resetAudioState();
      setTimeout(enhanceRenderedQuran, 300);
    });
    $("#quran-form")?.addEventListener("submit", () => {
      resetAudioState();
      const select = $("#v39-surah-select");
      if (select) select.value = String(currentSurahNumber());
      setTimeout(enhanceRenderedQuran, 350);
    });
  }

  function initialize() {
    ensureStylesMarker();
    improveHomeMetrics();
    improveIslamicMenu();
    createQuranHero();
    migrateDefaultReciter();
    enhanceQuranControls();
    addWaqfStandardPanel();
    observeQuranReader();
    observeWorship();
    watchReciterAndSurah();

    const pageObserver = new MutationObserver(() => {
      improveHomeMetrics();
      improveIslamicMenu();
      createQuranHero();
      enhanceQuranControls();
      addWaqfStandardPanel();
      observeQuranReader();
    });
    pageObserver.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
