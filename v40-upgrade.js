(() => {
  "use strict";

  const BUILD = "47";
  const QURAN_CACHE = "paibp-smart-quran-v40";
  const AUDIO_CACHE = "paibp-smart-quran-audio-v40";
  const TAFSIR_PREFIX = "paibp-smart-tafsir-v40-";
  const CP_MODE_KEY = "paibp-smart-curriculum-mode-v40";
  const CP_FAST_MANIFEST_URL = "cp2025-manifest-v47.json";
  const CP_FAST_CHUNK_PREFIX = "cp2025-chunk-";
  const CP_MANIFEST_URL = "assets/cp-2025/manifest.json";
  const CP_PREVIEW_PACK_URL = "cp2025-preview-pack.b64";
  const CP_SOURCE_PACK_URL = "cp2025-source-pack.b64";
  const CP_CACHE_NAME = "paibp-smart-cp2025-v46";
  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[character]);
  const safeParse = (value, fallback) => { try { return JSON.parse(value); } catch { return fallback; } };
  const slug = (value) => String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const absolute = (path) => { try { return new URL(path, document.baseURI).href; } catch { return path; } };
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const SURAH_NAMES = [
    "Al Fatihah","Al Baqarah","Ali Imran","An Nisa'","Al Ma'idah","Al An'am","Al A'raf","Al Anfal","At Taubah","Yunus","Hud","Yusuf","Ar Ra'd","Ibrahim","Al Hijr","An Nahl","Al Isra'","Al Kahfi","Maryam","Taha","Al Anbiya'","Al Hajj","Al Mu'minun","An Nur","Al Furqan","Asy Syu'ara'","An Naml","Al Qasas","Al 'Ankabut","Ar Rum","Luqman","As Sajdah","Al Ahzab","Saba'","Fatir","Yasin","As Saffat","Sad","Az Zumar","Gafir","Fussilat","Asy Syura","Az Zukhruf","Ad Dukhan","Al Jasiyah","Al Ahqaf","Muhammad","Al Fath","Al Hujurat","Qaf","Az Zariyat","At Tur","An Najm","Al Qamar","Ar Rahman","Al Waqi'ah","Al Hadid","Al Mujadilah","Al Hasyr","Al Mumtahanah","As Saff","Al Jumu'ah","Al Munafiqun","At Tagabun","At Talaq","At Tahrim","Al Mulk","Al Qalam","Al Haqqah","Al Ma'arij","Nuh","Al Jinn","Al Muzzammil","Al Muddassir","Al Qiyamah","Al Insan","Al Mursalat","An Naba'","An Nazi'at","'Abasa","At Takwir","Al Infitar","Al Mutaffifin","Al Insyiqaq","Al Buruj","At Tariq","Al A'la","Al Gasyiyah","Al Fajr","Al Balad","Asy Syams","Al Lail","Ad Duha","Asy Syarh","At Tin","Al 'Alaq","Al Qadr","Al Bayyinah","Az Zalzalah","Al 'Adiyat","Al Qari'ah","At Takasur","Al 'Asr","Al Humazah","Al Fil","Quraisy","Al Ma'un","Al Kausar","Al Kafirun","An Nasr","Al Lahab","Al Ikhlas","Al Falaq","An Nas"
  ];

  const WAQF = {
    "ۘ": { sign: "م", title: "Waqaf Lazim", note: "Berhenti lebih kuat untuk menjaga kesempurnaan makna." },
    "ۙ": { sign: "لا", title: "Jangan Berhenti", note: "Jangan berhenti di sini apabila bacaan masih tersambung." },
    "ۚ": { sign: "ج", title: "Waqaf Jaiz", note: "Boleh berhenti dan boleh melanjutkan." },
    "ۛ": { sign: "ۛ ۛ", title: "Mu'anaqah", note: "Berhenti pada salah satu dari dua tanda yang berpasangan, bukan pada keduanya." },
    "ۜ": { sign: "س", title: "Saktah", note: "Berhenti sangat singkat tanpa mengambil napas." },
    "ۗ": { sign: "قلى", title: "Berhenti Lebih Utama", note: "Berhenti dinilai lebih utama daripada melanjutkan." },
    "ۖ": { sign: "صلى", title: "Melanjutkan Lebih Utama", note: "Menyambung bacaan dinilai lebih utama daripada berhenti." },
  };

  const RECITER_EQURAN_KEYS = {
    juhany: ["01", "abdullah-al-juhany"], qasim: ["02", "abdul-muhsin-al-qasim"],
    sudais: ["03", "abdurrahman-as-sudais"], dosary: ["06", "yasser-al-dosari", "yasser-al-dossari"],
    alafasy: ["05", "misyari-rasyid-al-afasy"],
  };

  let activeVerseAudio = null;
  let activeVerseIndex = -1;
  let equranSurahPromise = null;
  let currentEquranSurah = 0;
  let cpManifestPromise = null;
  let cpBundlePromise = null;
  const cpChunkPromises = new Map();
  let cpSourceZipPromise = null;
  let cpMode = localStorage.getItem(CP_MODE_KEY) || "2026";
  let cpGrade = "VII";
  let cpDoc = "cp";
  let cpSelectedRecord = "";

  function currentSurahNumber() {
    return Math.min(114, Math.max(1, Number($("#quran-surah-number")?.value) || 1));
  }

  function currentAyahNumber(card, fallback = 1) {
    const text = $(".ayah-number", card)?.textContent || "";
    return Number(text.split(":").pop()) || fallback;
  }

  function locationIndonesia(value) {
    const text = String(value || "").toLowerCase();
    if (/medin|madani/.test(text)) return "Madinah";
    if (/mecc|makk|makki|mek/.test(text)) return "Mekkah";
    return value || "—";
  }

  function updateSurahIdentity() {
    const reader = $("#quran-reader");
    const head = $(".quran-surah-head", reader);
    if (!head) return;
    const number = currentSurahNumber();
    const name = SURAH_NAMES[number - 1] || `Surat ${number}`;
    const meta = $(".quran-surah-head > span", head) || $("span", head);
    const rawMeta = meta?.textContent || "";
    const place = locationIndonesia(rawMeta);
    if (meta) meta.textContent = `Surat ${number} • ${place}`;
    const latin = $("h5", head);
    if (latin) latin.textContent = name;
    head.dataset.surahName = name;
    const qari = $("#quran-reciter-select option:checked")?.textContent?.replace(/\s*•.*$/, "") || "Qari pilihan";
    const audioNote = $(".quran-surah-audio small", head);
    if (audioNote) {
      const mismatch = /contoh ini terpisah|bukan audio surat/i.test(audioNote.textContent || "");
      audioNote.textContent = mismatch
        ? `Contoh tilawah luring ${qari}; rekaman ini terpisah dan bukan audio surat yang sedang dibuka.`
        : `Tilawah: ${qari}`;
    }
  }

  function wrapWaqfTextNodes(root) {
    if (!root || root.dataset.v40WaqfWrapped) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!Object.keys(WAQF).some((sign) => node.nodeValue.includes(sign))) return NodeFilter.FILTER_REJECT;
        if (node.parentElement?.closest(".v40-waqf-sign")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const fragment = document.createDocumentFragment();
      let buffer = "";
      for (const character of node.nodeValue) {
        if (!WAQF[character]) { buffer += character; continue; }
        if (buffer) { fragment.append(document.createTextNode(buffer)); buffer = ""; }
        const span = document.createElement("span");
        span.className = "v40-waqf-sign";
        span.dataset.waqf = character;
        span.lang = "ar";
        span.textContent = character;
        span.title = `${WAQF[character].sign} — ${WAQF[character].title}: ${WAQF[character].note}`;
        fragment.append(span);
      }
      if (buffer) fragment.append(document.createTextNode(buffer));
      node.replaceWith(fragment);
    });
    root.dataset.v40WaqfWrapped = "true";
  }

  function addWaqfNotes(card) {
    const arabic = $(".arabic-text", card);
    if (!arabic) return;
    wrapWaqfTextNodes(arabic);
    $$(".tajwid-token.tajwid-waqf", arabic).forEach((span) => {
      const key = Object.keys(WAQF).find((sign) => span.textContent.includes(sign));
      if (!key) return;
      span.classList.add("v40-waqf-sign");
      span.dataset.waqf = key;
      span.title = `${WAQF[key].sign} — ${WAQF[key].title}: ${WAQF[key].note}`;
    });
    const signs = [...new Set([...arabic.textContent].filter((character) => WAQF[character]))];
    $(".v40-waqf-notes", card)?.remove();
    if (!signs.length) return;
    const notes = document.createElement("div");
    notes.className = "v40-waqf-notes";
    notes.innerHTML = `<strong>Tanda waqaf pada ayat ini</strong><div>${signs.map((key) => `<span><b lang="ar">${escapeHtml(WAQF[key].sign)}</b><i>${escapeHtml(WAQF[key].title)}</i><small>${escapeHtml(WAQF[key].note)}</small></span>`).join("")}</div>`;
    arabic.insertAdjacentElement("afterend", notes);
  }

  function verseData(card, index) {
    const surah = currentSurahNumber();
    const ayah = currentAyahNumber(card, index + 1);
    const arabic = $(".arabic-text", card)?.textContent?.trim() || "";
    const translation = $$(':scope > p', card).find((p) => !p.classList.contains("arabic-text") && !p.closest(".v40-waqf-notes"))?.textContent?.trim() || "";
    const name = SURAH_NAMES[surah - 1] || `Surat ${surah}`;
    return { surah, ayah, arabic, translation, name, reference: `${surah}:${ayah}` };
  }

  function richVerseHtml(data) {
    return `<div style="font-family:Arial,Calibri,sans-serif;line-height:1.6"><p dir="rtl" lang="ar" style="font-family:'Traditional Arabic','Noto Naskh Arabic','Amiri',Arial,sans-serif;font-size:24pt;line-height:1.9;text-align:right;margin:0 0 12pt">${escapeHtml(data.arabic)}</p><p style="font-size:11pt;margin:0 0 8pt">${escapeHtml(data.translation)}</p><p style="font-size:9pt;color:#527066;margin:0"><strong>Al Qur'an Surat ${escapeHtml(data.name)} ayat ${data.ayah}</strong> • PAIBP SMART SMP</p></div>`;
  }

  async function copyRichVerse(data, status) {
    const plain = `${data.arabic}\n\n${data.translation}\n\nAl Qur'an Surat ${data.name} ayat ${data.ayah} — PAIBP SMART SMP`;
    try {
      if (window.ClipboardItem && navigator.clipboard?.write) {
        const item = new ClipboardItem({
          "text/html": new Blob([richVerseHtml(data)], { type: "text/html" }),
          "text/plain": new Blob([plain], { type: "text/plain" }),
        });
        await navigator.clipboard.write([item]);
      } else await navigator.clipboard.writeText(plain);
      status.textContent = "Ayat disalin dalam format Arab dan Word yang rapi.";
    } catch {
      const area = document.createElement("textarea");
      area.value = plain; document.body.append(area); area.select(); document.execCommand("copy"); area.remove();
      status.textContent = "Ayat berhasil disalin.";
    }
  }

  function verseDeepLink(data) {
    return `${location.origin}${location.pathname}#alquran-${data.surah}-${data.ayah}`;
  }

  async function copyVerseLink(data, status) {
    try { await navigator.clipboard.writeText(verseDeepLink(data)); status.textContent = "Tautan langsung ayat berhasil disalin."; }
    catch { status.textContent = "Tautan belum dapat disalin oleh browser."; }
  }

  function ensureModal(id, className) {
    let modal = $(`#${id}`);
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = id;
    modal.className = className;
    modal.hidden = true;
    document.body.append(modal);
    return modal;
  }

  function closeModal(modal) {
    modal.hidden = true;
    document.body.classList.remove("v40-modal-open");
  }

  function showModal(modal) {
    modal.hidden = false;
    document.body.classList.add("v40-modal-open");
    $("button", modal)?.focus({ preventScroll: true });
  }

  function normalizeTafsirPayload(payload, ayah) {
    const root = payload?.data || payload || {};
    const lists = [root.tafsir, root.ayat, root.ayahs, root.verses, root.data, Array.isArray(root) ? root : null].filter(Array.isArray);
    const list = lists[0] || [];
    const item = list.find((entry, index) => Number(entry?.ayat || entry?.nomorAyat || entry?.nomor || entry?.number || index + 1) === Number(ayah)) || list[ayah - 1] || root;
    const tafsir = item?.tafsir || root?.tafsir || {};
    return {
      ringkas: String(item?.wajiz || item?.ringkas || tafsir?.wajiz || tafsir?.ringkas || root?.wajiz || "").trim(),
      tahlili: String(item?.tahlili || item?.teks || item?.text || item?.isi || tafsir?.tahlili || tafsir?.teks || root?.tahlili || "").trim(),
    };
  }

  async function fetchTafsir(data) {
    const cacheKey = `${TAFSIR_PREFIX}${data.surah}`;
    const cached = safeParse(localStorage.getItem(cacheKey), null);
    let equran = cached;
    if (!equran && navigator.onLine) {
      const response = await fetch(`https://equran.id/api/v2/tafsir/${data.surah}`, { cache: "force-cache" });
      if (response.ok) {
        equran = await response.json();
        try { localStorage.setItem(cacheKey, JSON.stringify(equran)); } catch {}
      }
    }
    let result = normalizeTafsirPayload(equran, data.ayah);
    if ((!result.ringkas || !result.tahlili) && navigator.onLine) {
      try {
        const response = await fetch(`https://quranweb.id/api/tafsir/ayat?surah=${data.surah}&ayat=${data.ayah}`, { cache: "force-cache" });
        if (response.ok) {
          const payload = await response.json();
          const normalized = normalizeTafsirPayload(payload, data.ayah);
          result = { ringkas: result.ringkas || normalized.ringkas, tahlili: result.tahlili || normalized.tahlili };
        }
      } catch {}
    }
    return result;
  }

  async function openTafsir(data) {
    const modal = ensureModal("v40-tafsir-modal", "v40-modal");
    modal.innerHTML = `
      <button class="v40-modal-backdrop" data-v40-close-modal aria-label="Tutup"></button>
      <section class="v40-modal-dialog v40-tafsir-dialog" role="dialog" aria-modal="true" aria-labelledby="v40-tafsir-title">
        <header><div><span>TAFSIR KEMENTERIAN AGAMA</span><h3 id="v40-tafsir-title">${escapeHtml(data.name)} Ayat ${data.ayah}</h3></div><button type="button" data-v40-close-modal aria-label="Tutup">×</button></header>
        <div class="v40-tafsir-verse"><p lang="ar" dir="rtl">${escapeHtml(data.arabic)}</p><small>${escapeHtml(data.translation)}</small></div>
        <div class="v40-loading"><i></i><strong>Memuat tafsir bersumber…</strong></div>
      </section>`;
    $$('[data-v40-close-modal]', modal).forEach((button) => button.addEventListener("click", () => closeModal(modal)));
    showModal(modal);
    try {
      const tafsir = await fetchTafsir(data);
      const body = $(".v40-loading", modal);
      const ringkas = tafsir.ringkas || "Tafsir Ringkas belum tersimpan pada perangkat ini. Sambungkan internet atau periksa langsung melalui Qur'an Kementerian Agama.";
      const tahlili = tafsir.tahlili || "Tafsir Tahlili belum tersimpan pada perangkat ini. Sambungkan internet atau periksa langsung melalui Qur'an Kementerian Agama.";
      body.outerHTML = `
        <div class="v40-tafsir-tabs" role="tablist"><button type="button" data-v40-tafsir-tab="ringkas" aria-pressed="true">Tafsir Ringkas</button><button type="button" data-v40-tafsir-tab="tahlili" aria-pressed="false">Tafsir Tahlili</button></div>
        <div class="v40-tafsir-content"><article data-v40-tafsir-page="ringkas"><h4>Tafsir Ringkas Kemenag</h4><p>${escapeHtml(ringkas)}</p></article><article data-v40-tafsir-page="tahlili" hidden><h4>Tafsir Tahlili Kemenag</h4><p>${escapeHtml(tahlili)}</p></article></div>
        <footer><a href="https://quran.kemenag.go.id/quran/per-ayat/surah/${data.surah}?from=${data.ayah}&to=${data.ayah}" target="_blank" rel="noopener noreferrer">Periksa pada Qur'an Kemenag ↗</a><button type="button" data-v40-copy-tafsir>Salin tafsir aktif</button></footer>`;
      const tabs = $$("[data-v40-tafsir-tab]", modal);
      tabs.forEach((button) => button.addEventListener("click", () => {
        tabs.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        $$('[data-v40-tafsir-page]', modal).forEach((page) => { page.hidden = page.dataset.v40TafsirPage !== button.dataset.v40TafsirTab; });
      }));
      $("[data-v40-copy-tafsir]", modal)?.addEventListener("click", async (event) => {
        const active = $('[data-v40-tafsir-page]:not([hidden]) p', modal)?.textContent || "";
        await navigator.clipboard.writeText(`${active}\n\nTafsir Kemenag — Al Qur'an Surat ${data.name} ayat ${data.ayah}`);
        event.currentTarget.textContent = "✓ Tersalin";
      });
    } catch {
      $(".v40-loading", modal).innerHTML = `<strong>Tafsir belum dapat dimuat.</strong><p>Gunakan koneksi internet untuk pemuatan pertama. Setelah berhasil, tafsir surat tersimpan pada perangkat.</p><a href="https://quran.kemenag.go.id/quran/per-ayat/surah/${data.surah}?from=${data.ayah}&to=${data.ayah}" target="_blank" rel="noopener noreferrer">Buka Qur'an Kemenag ↗</a>`;
    }
  }

  function canvasRoundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.roundRect?.(x, y, width, height, radius);
    if (!ctx.roundRect) { ctx.rect(x, y, width, height); }
    ctx.fill();
  }

  function wrapCanvasText(ctx, text, maxWidth) {
    const words = String(text || "").split(/\s+/);
    const lines=[]; let line="";
    words.forEach((word) => {
      const next=line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > maxWidth && line) { lines.push(line); line=word; }
      else line=next;
    });
    if (line) lines.push(line);
    return lines;
  }

  async function createVerseImage(data) {
    const canvas = document.createElement("canvas");
    canvas.width = 1200; canvas.height = 1200;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 1200, 1200);
    gradient.addColorStop(0, "#073f36"); gradient.addColorStop(.58, "#08745d"); gradient.addColorStop(1, "#123e59");
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1200, 1200);
    ctx.globalAlpha=.09; ctx.strokeStyle="#ffffff"; ctx.lineWidth=1;
    for(let i=-1200;i<2400;i+=56){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i-1200,1200);ctx.stroke();}
    ctx.globalAlpha=1;
    ctx.fillStyle="rgba(255,255,255,.96)"; canvasRoundRect(ctx, 70, 72, 1060, 1050, 48);
    ctx.fillStyle="#08745d"; ctx.font="800 27px Arial"; ctx.textAlign="left"; ctx.fillText("PAIBP SMART SMP • AL QUR'AN", 120, 145);
    ctx.fillStyle="#173b35"; ctx.font="700 38px Arial"; ctx.fillText(`${data.name} • Ayat ${data.ayah}`, 120, 207);
    ctx.direction="rtl"; ctx.textAlign="right"; ctx.fillStyle="#082f2c"; ctx.font="54px 'Traditional Arabic','Noto Naskh Arabic','Amiri',serif";
    const arabicLines=wrapCanvasText(ctx,data.arabic,920);
    let y=315; arabicLines.slice(0,7).forEach((line)=>{ctx.fillText(line,1080,y);y+=88;});
    ctx.direction="ltr"; ctx.textAlign="left"; ctx.fillStyle="#49655f"; ctx.font="30px Arial";
    const translationLines=wrapCanvasText(ctx,data.translation,920);
    y=Math.max(y+34,760); translationLines.slice(0,6).forEach((line)=>{ctx.fillText(line,120,y);y+=48;});
    ctx.fillStyle="#08745d"; ctx.fillRect(120,1050,960,4);
    ctx.fillStyle="#56736c"; ctx.font="24px Arial"; ctx.fillText("sunarso29.github.io/paibp-smart",120,1095);
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png", .96));
  }

  async function shareVerseImage(data, status) {
    status.textContent = "Menyiapkan gambar ayat…";
    const blob = await createVerseImage(data);
    if (!blob) { status.textContent = "Gambar belum dapat dibuat."; return; }
    const file = new File([blob], `${slug(data.name)}-ayat-${data.ayah}.png`, { type: "image/png" });
    try {
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ title: `${data.name} ayat ${data.ayah}`, text: "Dibagikan dari PAIBP SMART SMP", files: [file] });
      else {
        const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href=url; link.download=file.name; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
        status.textContent = "Gambar ayat berhasil dibuat dan siap dibagikan.";
      }
    } catch (error) { if (error?.name !== "AbortError") status.textContent = "Bagikan gambar belum didukung browser ini."; }
  }

  function openShare(data, status) {
    const modal = ensureModal("v40-share-modal", "v40-modal");
    const encodedLink = encodeURIComponent(verseDeepLink(data));
    const encodedText = encodeURIComponent(`${data.name} ayat ${data.ayah} — PAIBP SMART SMP`);
    modal.innerHTML = `
      <button class="v40-modal-backdrop" data-v40-close-modal aria-label="Tutup"></button>
      <section class="v40-modal-dialog v40-share-dialog" role="dialog" aria-modal="true"><header><div><span>BAGIKAN AYAT</span><h3>${escapeHtml(data.name)} Ayat ${data.ayah}</h3></div><button type="button" data-v40-close-modal>×</button></header>
      <div class="v40-share-grid"><button type="button" data-v40-native-share>↗<strong>Bagikan langsung</strong></button><a href="https://wa.me/?text=${encodedText}%0A${encodedLink}" target="_blank" rel="noopener">WA<strong>WhatsApp</strong></a><a href="https://www.facebook.com/sharer/sharer.php?u=${encodedLink}" target="_blank" rel="noopener">f<strong>Facebook</strong></a><a href="https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedLink}" target="_blank" rel="noopener">X<strong>X / Twitter</strong></a><button type="button" data-v40-share-image>▧<strong>Gambar ayat</strong></button><button type="button" data-v40-copy-link>⧉<strong>Salin tautan</strong></button></div><p data-v40-share-status></p></section>`;
    $$('[data-v40-close-modal]', modal).forEach((button) => button.addEventListener("click", () => closeModal(modal)));
    const modalStatus = $("[data-v40-share-status]", modal);
    $("[data-v40-native-share]", modal)?.addEventListener("click", async () => {
      try { await navigator.share({ title: `${data.name} ayat ${data.ayah}`, text: `${data.arabic}\n${data.translation}`, url: verseDeepLink(data) }); }
      catch (error) { if (error?.name !== "AbortError") modalStatus.textContent = "Bagikan langsung belum didukung browser."; }
    });
    $("[data-v40-share-image]", modal)?.addEventListener("click", () => shareVerseImage(data, modalStatus));
    $("[data-v40-copy-link]", modal)?.addEventListener("click", () => copyVerseLink(data, modalStatus));
    showModal(modal);
  }

  async function fetchEquranSurah(surah) {
    if (currentEquranSurah === surah && equranSurahPromise) return equranSurahPromise;
    currentEquranSurah = surah;
    equranSurahPromise = (async () => {
      const request = new Request(`https://equran.id/api/v2/surat/${surah}`);
      if ("caches" in window) {
        const cache = await caches.open(QURAN_CACHE);
        const cached = await cache.match(request);
        if (!navigator.onLine && cached) return cached.json();
      }
      const response = await fetch(request, { cache: "force-cache" });
      if (!response.ok) throw new Error("Audio ayat tidak tersedia");
      if ("caches" in window) { const cache = await caches.open(QURAN_CACHE); await cache.put(request, response.clone()); }
      return response.json();
    })();
    return equranSurahPromise;
  }

  function findEquranAyah(payload, ayah) {
    const root = payload?.data || payload || {};
    const list = root.ayat || root.ayahs || root.verses || [];
    return list.find((item, index) => Number(item.nomorAyat || item.ayat || item.number || index + 1) === Number(ayah)) || list[ayah - 1];
  }

  function audioFromObject(audio, reciterId) {
    if (!audio) return "";
    if (typeof audio === "string") return audio;
    const candidates = RECITER_EQURAN_KEYS[reciterId] || [];
    for (const key of candidates) {
      const exact = audio[key]; if (typeof exact === "string") return exact;
      const found = Object.entries(audio).find(([name]) => slug(name).includes(slug(key)) || slug(key).includes(slug(name)));
      if (typeof found?.[1] === "string") return found[1];
    }
    return Object.values(audio).find((value) => typeof value === "string") || "";
  }

  async function verseAudioUrl(data, card) {
    const existing = $("audio source", card)?.src || $("audio", card)?.src;
    if (existing) return existing;
    const payload = await fetchEquranSurah(data.surah);
    const ayah = findEquranAyah(payload, data.ayah);
    const reciterId = $("#quran-reciter-select")?.value || "dosary";
    return audioFromObject(ayah?.audio || ayah?.audioFull || ayah?.audio_url, reciterId);
  }

  async function cacheAudioUrl(url) {
    if (!url || !("caches" in window) || !navigator.onLine) return;
    const cache = await caches.open(AUDIO_CACHE);
    if (await cache.match(url)) return;
    const response = await fetch(url, { mode: "no-cors", cache: "no-store" });
    await cache.put(url, response);
  }

  function setActiveVerse(cards, index) {
    cards.forEach((card, cardIndex) => card.classList.toggle("v40-audio-active", cardIndex === index));
    cards[index]?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  }

  async function playVerse(cards, index) {
    const card = cards[index]; if (!card) return;
    const data = verseData(card, index);
    const status = $("[data-v40-status]", card);
    if (activeVerseAudio) activeVerseAudio.pause();
    try {
      status.textContent = "Menyiapkan audio ayat…";
      const url = await verseAudioUrl(data, card);
      if (!url) throw new Error("Qari ini belum menyediakan audio per ayat.");
      cacheAudioUrl(url).catch(()=>{});
      const audio = new Audio(url); activeVerseAudio = audio; activeVerseIndex = index;
      setActiveVerse(cards, index);
      audio.onplaying = () => { status.textContent = `Memutar ${data.name} ayat ${data.ayah}.`; };
      audio.onended = () => {
        status.textContent = "Ayat selesai.";
        if (index < cards.length - 1) playVerse(cards, index + 1);
      };
      audio.onerror = () => { status.textContent = "Audio gagal diputar. Pilih qari lain atau simpan saat daring."; };
      await audio.play();
    } catch (error) { status.textContent = error?.message || "Audio belum dapat diputar."; }
  }

  function installVerseActions(card, index, cards) {
    if ($(".v40-ayah-tools", card)) return;
    const data = verseData(card, index);
    const oldTools = $(".v39-ayah-tools", card);
    if (oldTools) oldTools.classList.add("v40-old-tools");
    const tools = document.createElement("div");
    tools.className = "v40-ayah-tools no-print";
    tools.innerHTML = `<button type="button" data-v40-play>▶ <span>Putar</span></button><button type="button" data-v40-copy>⧉ <span>Salin</span></button><button type="button" data-v40-tafsir>☰ <span>Tafsir</span></button><button type="button" data-v40-share>↗ <span>Bagikan</span></button><button type="button" data-v40-image>▧ <span>Gambar</span></button><button type="button" data-v40-link>🔗 <span>Tautan</span></button><small data-v40-status aria-live="polite"></small>`;
    card.append(tools);
    const status = $("[data-v40-status]", tools);
    $("[data-v40-play]", tools).addEventListener("click", () => playVerse(cards, index));
    $("[data-v40-copy]", tools).addEventListener("click", () => copyRichVerse(data, status));
    $("[data-v40-tafsir]", tools).addEventListener("click", () => openTafsir(data));
    $("[data-v40-share]", tools).addEventListener("click", () => openShare(data, status));
    $("[data-v40-image]", tools).addEventListener("click", () => shareVerseImage(data, status));
    $("[data-v40-link]", tools).addEventListener("click", () => copyVerseLink(data, status));
  }

  function applyDeepLink(cards) {
    const match = location.hash.match(/^#alquran-(\d+)-(\d+)$/);
    if (!match) return;
    const surah = Number(match[1]); const ayah = Number(match[2]);
    if (surah !== currentSurahNumber()) {
      const input = $("#quran-surah-number"); if (input) input.value = String(surah);
      $("#quran-form")?.requestSubmit?.();
      return;
    }
    const card = cards[ayah - 1];
    if (card) { card.classList.add("v40-deep-linked"); setTimeout(() => card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" }), 150); }
  }

  function augmentQuran() {
    const reader = $("#quran-reader");
    const cards = $$(".ayah-card", reader);
    if (!reader || !cards.length) return;
    const signature = `${currentSurahNumber()}-${cards.length}-${$("#quran-reciter-select")?.value || ""}`;
    if (reader.dataset.v40Signature === signature) return;
    reader.dataset.v40Signature = signature;
    reader.classList.add("v40-quran-reader");
    updateSurahIdentity();
    cards.forEach((card, index) => {
      card.id = `alquran-${currentSurahNumber()}-${index + 1}`;
      addWaqfNotes(card);
      installVerseActions(card, index, cards);
    });
    applyDeepLink(cards);
    const note = $(".document-note", $('[data-islamic-page="quran"]'));
    if (note) note.innerHTML = `Teks surat tersedia dari paket luring. Audio qari tersedia daring dan menjadi luring setelah berhasil disimpan pada perangkat. Tanda waqaf mengikuti tujuh tanda yang disederhanakan dalam Mushaf Al-Qur'an Standar Indonesia. <a href="https://lajnah.kemenag.go.id/info-lpmq/berita-dan-artikel/artikel/mushaf-al-qur-an-standar-usmani.html" target="_blank" rel="noopener noreferrer">Pedoman LPMQ ↗</a>`;
  }

  function observeQuran() {
    const reader = $("#quran-reader"); if (!reader || reader.dataset.v40Observed) return;
    reader.dataset.v40Observed = "true";
    new MutationObserver(() => setTimeout(augmentQuran, 80)).observe(reader, { childList: true, subtree: true });
    $("#quran-reciter-select")?.addEventListener("change", () => { reader.dataset.v40Signature = ""; setTimeout(augmentQuran, 350); });
    $("#quran-form")?.addEventListener("submit", () => { reader.dataset.v40Signature = ""; setTimeout(augmentQuran, 350); });
    augmentQuran();
  }

  function waitForJSZip() {
    if (window.JSZip) return Promise.resolve(window.JSZip);
    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (error) => {
        if (settled) return;
        if (window.JSZip) { settled = true; resolve(window.JSZip); return; }
        if (error) { settled = true; reject(error); }
      };
      let existing = document.querySelector('script[src*="vendor/jszip.min.js"]');
      if (!existing) {
        existing = document.createElement("script");
        existing.src = "vendor/jszip.min.js?v=47";
        existing.async = false;
        document.head.append(existing);
      }
      existing.addEventListener("load", () => finish(), { once: true });
      existing.addEventListener("error", () => finish(new Error("Mesin pembaca paket JSZip gagal dimuat.")), { once: true });
      const started = Date.now();
      const poll = window.setInterval(() => {
        if (window.JSZip) { window.clearInterval(poll); finish(); }
        else if (Date.now() - started > 12000) {
          window.clearInterval(poll);
          finish(new Error("Mesin pembaca paket belum siap setelah 12 detik. Muat ulang halaman."));
        }
      }, 100);
    });
  }

  async function cachedText(url, { forceNetwork = false } = {}) {
    const absoluteUrl = absolute(url);
    const request = new Request(absoluteUrl, { cache: forceNetwork ? "reload" : "force-cache" });
    if (!forceNetwork && "caches" in window) {
      const cached = await caches.match(request, { ignoreSearch: true });
      if (cached) return cached.text();
    }
    const response = await fetch(request);
    if (!response.ok) throw new Error(`Paket ${url} tidak ditemukan (${response.status}).`);
    if ("caches" in window) {
      try {
        const cache = await caches.open(CP_CACHE_NAME);
        await cache.put(request, response.clone());
      } catch {}
    }
    return response.text();
  }

  async function loadCpBundle() {
    if (window.PAIBP_CP2025_BUNDLE?.manifest?.records?.length) return window.PAIBP_CP2025_BUNDLE;
    if (cpBundlePromise) return cpBundlePromise;
    cpBundlePromise = (async () => {
      const JSZip = await waitForJSZip();
      let lastError = null;
      for (const forceNetwork of [false, true]) {
        try {
          if (forceNetwork && "caches" in window) {
            const keys = await caches.keys();
            await Promise.all(keys.filter((key) => /cp2025/i.test(key)).map((key) => caches.delete(key)));
          }
          const encoded = (await cachedText(CP_PREVIEW_PACK_URL, { forceNetwork })).replace(/^\uFEFF/, "").trim();
          if (!encoded || encoded.length < 1000) throw new Error("Paket pratinjau CP Lama 2025 kosong atau belum terunggah lengkap.");
          if (!/^UEsDB/.test(encoded)) throw new Error("Paket CP Lama 2025 bukan arsip Base64 yang valid. Pastikan file .b64 diunggah tanpa diubah.");
          const archive = await JSZip.loadAsync(encoded, { base64: true, checkCRC32: true });
          const entry = archive.file("bundle.json");
          if (!entry) throw new Error("bundle.json tidak ditemukan di dalam paket CP Lama 2025.");
          const bundle = JSON.parse(await entry.async("string"));
          if (!bundle?.manifest?.records?.length) throw new Error("Daftar dokumen CP Lama 2025 tidak ditemukan.");
          if (bundle.manifest.records.length < 40) throw new Error(`Paket CP Lama 2025 belum lengkap: hanya ${bundle.manifest.records.length} dari 40 dokumen.`);
          window.PAIBP_CP2025_BUNDLE = bundle;
          return bundle;
        } catch (error) {
          lastError = error;
        }
      }
      throw lastError || new Error("Paket CP Lama 2025 gagal dibaca.");
    })().catch((error) => {
      cpBundlePromise = null;
      throw error;
    });
    return cpBundlePromise;
  }

  async function fetchCpJson(url) {
    const href = absolute(url);
    const request = new Request(href, { cache: "no-store" });
    let cached = null;
    if ("caches" in window) {
      try { cached = await caches.match(href, { ignoreSearch: true }); } catch {}
    }
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), 12000) : 0;
    try {
      const response = await fetch(request, { cache: "no-store", signal: controller?.signal });
      if (!response.ok) throw new Error(`Data ${url} tidak ditemukan (${response.status}).`);
      const clone = response.clone();
      const data = await response.json();
      if ("caches" in window) {
        caches.open(CP_CACHE_NAME).then((cache) => cache.put(href, clone)).catch(() => {});
      }
      return data;
    } catch (error) {
      if (cached) return cached.json();
      throw error;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async function loadCpManifest() {
    if (cpManifestPromise) return cpManifestPromise;
    cpManifestPromise = fetchCpJson(`${CP_FAST_MANIFEST_URL}?v=${BUILD}`)
      .then((manifest) => {
        if (!manifest?.records?.length) throw new Error("Manifest CP Lama 2025 kosong atau belum terunggah.");
        return manifest;
      })
      .catch((error) => {
        cpManifestPromise = null;
        throw new Error(`CP Lama 2025 belum siap: ${error?.message || "manifest tidak ditemukan"}. Unggah seluruh file V47 ke root repository.`);
      });
    return cpManifestPromise;
  }

  async function loadCpChunk(name) {
    if (!name) throw new Error("Kelompok pratinjau CP Lama 2025 tidak dikenali.");
    if (cpChunkPromises.has(name)) return cpChunkPromises.get(name);
    const promise = fetchCpJson(`${CP_FAST_CHUNK_PREFIX}${name}-v47.json?v=${BUILD}`)
      .then((chunk) => {
        if (!chunk?.previews) throw new Error(`Isi kelompok ${name} tidak valid.`);
        return chunk;
      })
      .catch((error) => {
        cpChunkPromises.delete(name);
        throw error;
      });
    cpChunkPromises.set(name, promise);
    return promise;
  }

  async function loadCpPreview(record) {
    const key = `${record.id}.json`;
    if (!record.previewChunk) throw new Error(`Kelompok pratinjau ${record.title} belum tercantum pada manifest.`);
    const chunk = await loadCpChunk(record.previewChunk);
    const payload = chunk.previews?.[key] || chunk.previews?.[record.preview?.split("/").pop()];
    if (!payload) throw new Error(`Pratinjau ${record.title} tidak ditemukan dalam file ${record.previewChunk}.`);
    return { payload, media: chunk.media || {} };
  }

  function cpMediaSource(mediaBase, image) {
    if (!image) return "";
    if (mediaBase && typeof mediaBase === "object") {
      return mediaBase.media?.[`${mediaBase.id}/${image}`] || mediaBase.media?.[image] || "";
    }
    return `${mediaBase}/${image}`;
  }

  function downloadBlobFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1800);
  }

  async function sha256Hex(bytes) {
    if (!window.crypto?.subtle) return "";
    const digest = await window.crypto.subtle.digest("SHA-256", bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("");
  }

  function sourceMime(format) {
    return format === "xlsx"
      ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }

  async function loadCpSourceZip(status) {
    if (cpSourceZipPromise) return cpSourceZipPromise;
    cpSourceZipPromise = (async () => {
      if (status) status.textContent = "Menyiapkan paket sumber asli. Proses pertama hanya dilakukan sekali pada perangkat ini…";
      const JSZip = await waitForJSZip();
      const encoded = (await cachedText(CP_SOURCE_PACK_URL)).trim();
      if (!encoded) throw new Error("Paket sumber CP Lama 2025 kosong.");
      return JSZip.loadAsync(encoded, { base64: true, checkCRC32: true });
    })().catch((error) => {
      cpSourceZipPromise = null;
      throw error;
    });
    return cpSourceZipPromise;
  }

  async function sourceBytes(record, status) {
    try {
      const response = await fetch(record.file, { cache: "force-cache" });
      if (response.ok && !String(response.headers.get("content-type") || "").includes("text/html")) {
        return new Uint8Array(await response.arrayBuffer());
      }
    } catch {}
    const archive = await loadCpSourceZip(status);
    const entry = archive.file(`files/${record.id}.${record.format}`);
    if (!entry) throw new Error(`Berkas asli ${record.originalName} tidak ditemukan dalam paket sumber.`);
    return entry.async("uint8array");
  }

  async function downloadCpSource(record, status, button) {
    const oldText = button?.textContent || "Unduh berkas";
    if (button) { button.disabled = true; button.textContent = "Menyiapkan unduhan…"; }
    try {
      const bytes = await sourceBytes(record, status);
      const hash = await sha256Hex(bytes);
      if (record.sha256 && hash && hash !== record.sha256) throw new Error("Checksum berkas tidak sesuai; unduhan dibatalkan untuk menjaga keutuhan sumber.");
      downloadBlobFile(new Blob([bytes], { type: sourceMime(record.format) }), record.originalName);
      if (status) status.textContent = `✓ ${record.originalName} berhasil disiapkan dari berkas sumber asli.`;
      if (button) button.textContent = "✓ Unduhan siap";
    } catch (error) {
      if (status) status.textContent = error?.message || "Berkas belum dapat diunduh.";
      if (button) button.textContent = "Coba unduh lagi";
    } finally {
      if (button) window.setTimeout(() => { button.disabled = false; button.textContent = oldText; }, 1800);
    }
  }

  function currentTeacherPanel() { return $("#panel-teacher") || $(".teacher-panel-v29"); }
  function teacherPreview() { return $("#teacher-document"); }

  function addCurriculumSelector() {
    const panel = currentTeacherPanel();
    const gradeFilter = $("#teacher-grade-filter", panel);
    const gradeRow = gradeFilter?.closest(".filter-row");
    if (!panel || !gradeFilter || !gradeRow || $(".v40-cp-selector", gradeRow)) return;
    const selector = document.createElement("div");
    selector.className = "v40-cp-selector";
    selector.innerHTML = `<span>Versi Capaian Pembelajaran</span><div><button type="button" data-v40-cp="2025">CP Lama 2025<small>BSKAP 046/H/KR/2025</small></button><button type="button" data-v40-cp="2026">CP Terbaru 2026<small>BKPDM 020 Tahun 2026</small></button></div>`;
    gradeRow.classList.add("v40-cp-filter-row");
    gradeRow.append(selector);
    const update = () => $$('[data-v40-cp]', selector).forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.v40Cp === cpMode)));
    update();
    selector.addEventListener("click", (event) => {
      const button = event.target.closest("[data-v40-cp]"); if (!button) return;
      cpMode = button.dataset.v40Cp; localStorage.setItem(CP_MODE_KEY, cpMode); update();
      panel.dataset.curriculumMode = cpMode;
      if (cpMode === "2025") renderCp2025();
      else restoreCp2026();
    });
    panel.dataset.curriculumMode = cpMode;
  }

  function syncCurriculumSelector() {
    $$('[data-v40-cp]').forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.v40Cp === cpMode)));
    const panel = currentTeacherPanel();
    if (panel) panel.dataset.curriculumMode = cpMode;
  }

  function selectedGradeFromUi() {
    return $('[data-teacher-grade][aria-pressed="true"]')?.dataset.teacherGrade || cpGrade || "VII";
  }
  function selectedDocFromUi() {
    return $('[data-teacher-doc][aria-pressed="true"]')?.dataset.teacherDoc || cpDoc || "cp";
  }

  function categoryForDoc(doc) {
    return ({ cp: "atp", atp: "atp", kktp: "kktp", prota: "prota", promes: "promes", calendar: "calendar", effective: "effective", module: "module" })[doc] || "";
  }

  function recordsFor(manifest, grade, doc) {
    const category = categoryForDoc(doc);
    if (!category) return [];
    return manifest.records.filter((record) => {
      if (record.category !== category) return false;
      if (["calendar", "atp"].includes(category)) return true;
      if (record.grade === grade) return true;
      if (record.grade === "VII-VIII" && ["VII","VIII"].includes(grade)) return true;
      return record.grade === "FASE D";
    });
  }

  function setLegacyPressed() {
    $$('[data-teacher-grade]').forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.teacherGrade === cpGrade)));
    $$('[data-teacher-doc]').forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.teacherDoc === cpDoc)));
  }

  function cpLoading(title = "Menyiapkan dokumen CP Lama 2025") {
    const preview = teacherPreview(); if (!preview) return;
    preview.classList.add("v40-preview-transition");
    preview.innerHTML = `<section class="v40-cp-loading"><div></div><strong>${escapeHtml(title)}</strong><p>Memuat pratinjau lengkap tanpa mengubah berkas sumber.</p></section>`;
  }

  function renderRuns(runs, mediaBase) {
    return (runs || []).map((run) => {
      if (run.image) { const source = cpMediaSource(mediaBase, run.image); return source ? `<img class="v40-doc-image" src="${escapeHtml(source)}" alt="${escapeHtml(run.alt || "Gambar dokumen")}" loading="lazy">` : `<span class="v42-image-note">Gambar dokumen tersimpan pada berkas sumber asli.</span>`; }
      const styles=[];
      if (run.sizePt) styles.push(`font-size:${Math.min(28,Math.max(8,run.sizePt))}pt`);
      if (run.font) styles.push(`font-family:${JSON.stringify(run.font)},Cambria,serif`);
      if (run.color) styles.push(`color:#${run.color}`);
      const tag = run.bold ? "strong" : "span";
      let value = `<${tag}${styles.length ? ` style="${styles.join(";")}"` : ""}>${escapeHtml(run.text || "")}</${tag}>`;
      if (run.italic) value = `<em>${value}</em>`;
      if (run.underline) value = `<u>${value}</u>`;
      return value;
    }).join("");
  }

  function renderDocBlocks(blocks, mediaBase) {
    return (blocks || []).map((block) => {
      if (block.type === "blank") return `<div class="v40-doc-blank"></div>`;
      if (block.type === "paragraph") {
        const style = String(block.style || "").toLowerCase();
        const content = renderRuns(block.runs, mediaBase) || escapeHtml(block.text || "");
        const heading = /heading|judul|title/.test(style);
        return heading ? `<h3 class="v40-doc-heading" style="text-align:${block.alignment || "left"}">${content}</h3>` : `<p style="text-align:${block.alignment || "left"}">${content}</p>`;
      }
      if (block.type === "table") return `<div class="v40-table-scroll"><table class="v40-source-table"><tbody>${(block.rows || []).map((row) => `<tr>${row.map((cell) => {
        if (!cell || cell.covered) return "";
        return `<td${cell.rowspan > 1 ? ` rowspan="${cell.rowspan}"` : ""}${cell.colspan > 1 ? ` colspan="${cell.colspan}"` : ""}>${renderDocBlocks(cell.blocks, mediaBase) || escapeHtml(cell.text || "")}</td>`;
      }).join("")}</tr>`).join("")}</tbody></table></div>`;
      return "";
    }).join("");
  }

  function excelCell(value, formula) {
    const display = value === null || value === undefined ? "" : String(value);
    return `<td${formula ? ` title="Rumus: ${escapeHtml(formula)}"` : ""}>${escapeHtml(display)}</td>`;
  }

  function renderExcelPreview(payload) {
    const sheets = payload.sheets || [];
    return `<div class="v40-sheet-tabs">${sheets.map((sheet,index)=>`<button type="button" data-v40-sheet="${index}" aria-pressed="${index===0}">${escapeHtml(sheet.name)}</button>`).join("")}</div><div class="v40-sheet-pages">${sheets.map((sheet,index)=>`<section data-v40-sheet-page="${index}" ${index ? "hidden" : ""}><div class="v40-sheet-meta"><strong>${escapeHtml(sheet.name)}</strong><span>${escapeHtml(sheet.range)} • ${sheet.rows} baris × ${sheet.cols} kolom</span></div><div class="v40-table-scroll"><table class="v40-excel-table"><tbody>${(sheet.values || []).map((row,ri)=>`<tr>${row.map((value,ci)=>excelCell(value,sheet.formulas?.[ri]?.[ci])).join("")}</tr>`).join("")}</tbody></table></div></section>`).join("")}</div>`;
  }

  async function renderCpRecord(record, records) {
    const preview = teacherPreview(); if (!preview) return;
    cpLoading(`Membuka ${record.title}`);
    try {
      const previewData = await loadCpPreview(record);
      const payload = previewData.payload || previewData;
      const mediaBase = { id: record.id, media: previewData.media || {} };
      const content = record.format === "xlsx"
        ? renderExcelPreview(payload)
        : `${(payload.headers || []).map((item) => `<header class="v40-doc-header">${renderDocBlocks(item.blocks, mediaBase)}</header>`).join("")}<article class="v40-source-document">${renderDocBlocks(payload.blocks, mediaBase)}</article>${(payload.footers || []).map((item) => `<footer class="v40-doc-footer">${renderDocBlocks(item.blocks, mediaBase)}</footer>`).join("")}`;
      preview.innerHTML = `<section class="v40-cp-library-head"><div><span>CP LAMA 2025 • BERKAS SUMBER UTUH</span><h2>${escapeHtml(record.title)}</h2><p>Keputusan Kepala BSKAP Nomor 046/H/KR/2025 • Kelas ${escapeHtml(cpGrade)} • ${escapeHtml(record.originalName)}</p></div><div class="v40-cp-actions"><button type="button" data-v42-download-source>Unduh berkas asli ${record.format.toUpperCase()}</button><button type="button" data-v40-cache-record>Simpan luring</button></div></section>${records.length > 1 ? `<label class="v40-record-select">Pilih dokumen sumber<select data-v40-record-select>${records.map((item) => `<option value="${item.id}" ${item.id === record.id ? "selected" : ""}>${escapeHtml(item.title)}</option>`).join("")}</select></label>` : ""}<div class="v40-source-integrity"><span>✓ SHA-256 tersedia</span><span>✓ Berkas asli tidak diubah</span><span>✓ Tabel dan isi dimuat lengkap</span><small>${escapeHtml(record.sha256)}</small></div>${content}<section class="v40-source-download"><strong>Berkas sumber asli adalah rujukan final</strong><p>Pratinjau lengkap dimuat dari paket ringkas. Berkas DOCX/XLSX asli baru dimuat ketika tombol unduh atau simpan luring dipilih, sehingga portal tetap ringan.</p><button type="button" data-v42-download-source>Unduh ${escapeHtml(record.originalName)}</button><small data-v42-source-status aria-live="polite"></small></section>`;
      preview.classList.remove("v40-preview-transition");
      const status = $("[data-v42-source-status]", preview);
      $$('[data-v42-download-source]', preview).forEach((button) => button.addEventListener("click", () => downloadCpSource(record, status, button)));
      $("[data-v40-record-select]", preview)?.addEventListener("change", (event) => {
        const next = records.find((item) => item.id === event.target.value);
        if (next) { cpSelectedRecord = next.id; renderCpRecord(next, records); }
      });
      $("[data-v40-cache-record]", preview)?.addEventListener("click", async (event) => {
        const button = event.currentTarget; button.disabled = true; button.textContent = "Menyimpan paket…";
        try {
          if (record.previewChunk) await loadCpChunk(record.previewChunk);
          else await loadCpPreview(record);
          await loadCpSourceZip(status);
          button.textContent = "✓ CP 2025 tersimpan luring";
          if (status) status.textContent = "Pratinjau dan seluruh berkas sumber CP Lama 2025 telah tersedia luring pada perangkat ini.";
        } catch (error) {
          button.textContent = "Gagal menyimpan";
          button.disabled = false;
          if (status) status.textContent = error?.message || "Paket belum dapat disimpan.";
        }
      });
      $$('[data-v40-sheet]', preview).forEach((button) => button.addEventListener("click", () => {
        $$('[data-v40-sheet]', preview).forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        $$('[data-v40-sheet-page]', preview).forEach((page) => { page.hidden = page.dataset.v40SheetPage !== button.dataset.v40Sheet; });
      }));
    } catch (error) {
      preview.classList.remove("v40-preview-transition");
      preview.innerHTML = `<section class="warning v44-cp-diagnostic"><strong>Paket CP Lama 2025 gagal dibaca.</strong><p>${escapeHtml(error?.message || "Paket belum lengkap.")}</p><small>Pastikan <b>cp2025-preview-pack.b64</b>, <b>cp2025-source-pack.b64</b>, <b>v40-upgrade.js</b>, dan <b>vendor/jszip.min.js</b> berada sejajar dengan index.html.</small><button type="button" data-v42-retry-cp>Perbaiki cache dan muat ulang</button></section>`;
      $("[data-v42-retry-cp]", preview)?.addEventListener("click", () => {
        cpBundlePromise = null; cpManifestPromise = null; renderCp2025();
      });
    }
  }

  async function renderCp2025() {
    const preview=teacherPreview(); if(!preview)return;
    cpGrade=selectedGradeFromUi(); cpDoc=selectedDocFromUi(); setLegacyPressed(); cpLoading();
    if (["access","submissions"].includes(cpDoc)) { restoreCp2026(); return; }
    try {
      const manifest=await loadCpManifest();
      const records=recordsFor(manifest,cpGrade,cpDoc);
      if(!records.length){preview.innerHTML=`<section class="v40-empty-source"><span>▤</span><h3>Dokumen CP Lama 2025 belum ditemukan</h3><p>Tidak ada berkas kategori ${escapeHtml(cpDoc)} untuk kelas ${escapeHtml(cpGrade)} pada lampiran.</p></section>`;return;}
      const selected=records.find((item)=>item.id===cpSelectedRecord)||records[0]; cpSelectedRecord=selected.id;
      await renderCpRecord(selected,records);
    } catch(error){preview.innerHTML=`<section class="warning"><strong>Paket CP Lama 2025 gagal dimuat.</strong><p>${escapeHtml(error?.message||"")}</p></section>`;}
  }

  function restoreCp2026() {
    const panel=currentTeacherPanel(); if(!panel)return;
    panel.dataset.curriculumMode="2026";
    const gradeButton=$(`[data-teacher-grade="${cpGrade}"]`);
    const docButton=$(`[data-teacher-doc="${cpDoc}"]`);
    setTimeout(()=>{gradeButton?.click();setTimeout(()=>docButton?.click(),40);},20);
  }

  function interceptTeacherControls() {
    const panel=currentTeacherPanel(); if(!panel||panel.dataset.v40Intercepted)return;
    panel.dataset.v40Intercepted="true";
    panel.addEventListener("click",(event)=>{
      const gradeButton=event.target.closest("[data-teacher-grade]");
      const docButton=event.target.closest("[data-teacher-doc]");
      if(cpMode!=="2025"){
        if(gradeButton)cpGrade=gradeButton.dataset.teacherGrade;
        if(docButton)cpDoc=docButton.dataset.teacherDoc;
        return;
      }
      if(gradeButton){event.preventDefault();event.stopImmediatePropagation();cpGrade=gradeButton.dataset.teacherGrade;cpSelectedRecord="";setLegacyPressed();renderCp2025();}
      if(docButton){
        const target=docButton.dataset.teacherDoc;
        if(["access","submissions"].includes(target)){cpDoc=target;cpMode="2026";localStorage.setItem(CP_MODE_KEY,cpMode);syncCurriculumSelector();restoreCp2026();return;}
        event.preventDefault();event.stopImmediatePropagation();cpDoc=target;cpSelectedRecord="";setLegacyPressed();renderCp2025();
      }
    },true);
  }

  function initializeTeacherCp() {
    const panel=currentTeacherPanel(); if(!panel)return;
    const cpMenu=$("[data-teacher-doc=\"cp\"]",panel);
    if(cpMenu&&!cpMenu.dataset.v40Renamed){const icon=$("span",cpMenu)?.outerHTML||"<span>📘</span>";cpMenu.innerHTML=`${icon} Capaian Pembelajaran`;cpMenu.dataset.v40Renamed="true";}
    cpGrade=selectedGradeFromUi(); cpDoc=selectedDocFromUi();
    addCurriculumSelector(); interceptTeacherControls();
    if(cpMode==="2025")setTimeout(renderCp2025,160);
  }

  function initialize() {
    document.documentElement.dataset.portalBuild="46-quran-cp";
    document.body?.classList.add("v40-ready");
    observeQuran(); initializeTeacherCp();
    let observerTimer = 0;
    const observer=new MutationObserver(()=>{
      clearTimeout(observerTimer);
      observerTimer=setTimeout(()=>{observeQuran();initializeTeacherCp();},120);
    });
    observer.observe(document.body,{childList:true,subtree:true});
    window.addEventListener("hashchange",()=>{const cards=$$("#quran-reader .ayah-card");if(cards.length)applyDeepLink(cards);});
    document.addEventListener("keydown",(event)=>{if(event.key==="Escape")$$('.v40-modal:not([hidden])').forEach(closeModal);});
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initialize,{once:true});else initialize();
})();
