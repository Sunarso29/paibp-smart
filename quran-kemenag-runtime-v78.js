(() => {
  "use strict";

  const BUILD = "79-feature-restore";
  const ROOT = "quran-kemenag";
  const CACHE = "paibp-quran-kemenag-v79";
  const RECITER_API = "https://www.mp3quran.net/api/v3/reciters?language=eng";
  const RECITER_STORE = "paibp-smart-quran-reciter-v79";
  const RECITER_MIGRATION = "paibp-smart-quran-reciter-default-v79";
  let manifest = null;
  let activeSurah = 1;
  let activeAyah = 1;
  let initialized = false;
  let reciters = [];
  let currentSurahData = null;

  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  })[c]);
  const normalize = (value) => String(value || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

  const PRIORITY_RECITERS = [
    "Yasser Al Dosari", "Abdul Rahman Al Sudais", "Maher Al Muaiqly", "Mishary Rashid Alafasy",
    "Saad Al Ghamdi", "Abdullah Awad Al Juhany", "Bandar Baleela", "Ali Al Hudhaifi",
    "Abdul Mohsen Al Qasim", "Salah Al Budair", "Saud Al Shuraim", "Muhammad Siddiq Al Minshawi",
    "Abdul Basit Abdus Samad", "Mahmoud Khalil Al Hussary", "Mahmoud Ali Al Banna", "Mohamed Al Tablawi",
    "Abu Bakr Al Shatri", "Nasser Al Qatami", "Khalid Al Jaleel", "Idris Abkar",
    "Hazza Al Balushi", "Hani Ar Rifai", "Ahmed Al Ajmi", "Abdullah Basfar",
    "Muhammad Ayyub", "Ibrahim Al Akhdar", "Adel Al Kalbani", "Abdulaziz Al Ahmad",
    "Fares Abbad", "Salah Bukhatir", "Sahl Yasin", "Muhammad Jibreel",
    "Mustafa Ismail", "Mahmoud Shahat Anwar", "Shahat Muhammad Anwar", "Ahmed Nufais",
    "Raad Al Kurdi", "Muhammad Al Luhaidan", "Khalifa Al Tunaiji", "Abdul Rashid Sufi",
    "Abdul Wali Al Arkani", "Nabil Rifa'i", "Ahmed Khader Al Tarabulsi", "Ali Jaber",
    "Yasser Al Qurashi", "Majed Al Zamil", "Haitham Al Dokhin", "Mansour Al Salimi",
    "Okasha Kameny", "Younes Souilass"
  ].map(normalize);

  function injectStyle() {
    if ($("#qk79-style")) return;
    const style = document.createElement("style");
    style.id = "qk79-style";
    style.textContent = `
      .qk79-shell{display:grid;gap:16px;--qk-green:#08745e;--qk-dark:#063f36;--qk-gold:#ffc84a;--qk-cyan:#22c7c8;--qk-purple:#7c4dde}
      .qk79-head{position:relative;overflow:hidden;padding:26px;border-radius:26px;color:#fff;background:linear-gradient(135deg,#053d36 0%,#08745e 44%,#165e85 100%);box-shadow:0 20px 55px rgba(0,55,47,.18)}
      .qk79-head:after{content:"۞";position:absolute;right:20px;top:-28px;font-size:9rem;opacity:.08;transform:rotate(-15deg)}
      .qk79-head span{display:inline-block;font-size:.7rem;font-weight:900;letter-spacing:.13em;color:#dfff9b}.qk79-head h4{margin:8px 0;color:#fff;font-size:clamp(1.7rem,3vw,2.7rem)}
      .qk79-head p{margin:0;max-width:850px;color:#e2f2ed;line-height:1.65}.qk79-badges{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.qk79-badges b{padding:6px 9px;border-radius:999px;background:rgba(255,255,255,.13);font-size:.7rem;color:#fff}
      .qk79-panel{display:grid;gap:12px;padding:15px;border:1px solid rgba(7,92,75,.14);border-radius:21px;background:#fff;box-shadow:0 10px 30px rgba(4,61,51,.07)}
      .qk79-controls{display:grid;grid-template-columns:minmax(230px,1.2fr) minmax(220px,1fr) 120px;gap:10px;align-items:end}.qk79-controls label{display:grid;gap:6px;font-size:.73rem;font-weight:900;color:#073f36}.qk79-controls select,.qk79-controls input{min-height:46px;border:1px solid rgba(7,92,75,.2);border-radius:13px;padding:0 11px;background:#fff;color:#173f38;font:inherit}
      .qk79-toolbar{display:flex;flex-wrap:wrap;gap:8px}.qk79-toolbar button{min-height:43px;border:0;border-radius:13px;padding:0 13px;font-weight:900;cursor:pointer;color:#fff;box-shadow:0 8px 18px rgba(0,0,0,.08)}.qk79-toolbar button:nth-child(1){background:#08745e}.qk79-toolbar button:nth-child(2){background:#1679ba}.qk79-toolbar button:nth-child(3){background:#7c4dde}.qk79-toolbar button:nth-child(4){background:#d97816}.qk79-toolbar button:nth-child(5){background:#be3e59}.qk79-toolbar button:nth-child(6){background:#15968a}.qk79-toolbar button:disabled{opacity:.45;cursor:not-allowed}
      .qk79-player{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:12px 14px;border-radius:17px;background:linear-gradient(135deg,#eefbf6,#edf5ff);border:1px solid rgba(7,92,75,.12)}.qk79-player audio{width:100%;min-height:44px}.qk79-player-meta{text-align:right}.qk79-player-meta strong{display:block;color:#073f36}.qk79-player-meta small{color:#617871}
      .qk79-status{min-height:22px;margin:0;color:#607770;font-size:.79rem}.qk79-surah-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-end;padding:12px 4px 2px}.qk79-surah-head h5{margin:0;font-size:1.45rem;color:#073f36}.qk79-surah-head p{margin:3px 0 0;color:#607770}.qk79-surah-head strong{font-family:serif;font-size:1.8rem;direction:rtl}
      .qk79-ayahs{display:grid;gap:12px}.qk79-ayah{scroll-margin-top:90px;padding:18px;border:1px solid rgba(7,92,75,.13);border-radius:18px;background:linear-gradient(145deg,#fff,#f5fbf8);box-shadow:0 10px 28px rgba(3,60,50,.06);transition:.18s ease;cursor:pointer}.qk79-ayah:hover,.qk79-ayah.is-active{border-color:#18a68b;box-shadow:0 13px 32px rgba(3,96,80,.12);transform:translateY(-1px)}
      .qk79-meta{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px;color:#607770;font-size:.74rem;font-weight:800}.qk79-num{display:grid;place-items:center;min-width:36px;height:36px;border-radius:12px;background:linear-gradient(135deg,#08745e,#15a28a);color:#fff}.qk79-ayah-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.qk79-ayah-actions button{border:0;border-radius:10px;padding:7px 10px;background:#edf8f4;color:#075d4a;font-weight:850;cursor:pointer}
      .qk79-arabic{margin:4px 0 14px;text-align:right;direction:rtl;font-family:"Noto Naskh Arabic","Amiri","Scheherazade New",serif;font-size:clamp(1.7rem,3.5vw,2.45rem);line-height:2.05;color:#102e29}.qk79-translation{margin:0;color:#3f5d56;line-height:1.72;font-size:.94rem}
      .qk79-footnote{padding:12px 14px;border-radius:14px;background:#fff8df;color:#6b5b2b;font-size:.76rem;line-height:1.55}.qk79-qori-count{color:#08745e;font-weight:900}
      @media(max-width:800px){.qk79-controls{grid-template-columns:1fr 1fr}.qk79-controls label:first-child,.qk79-controls label:nth-child(2){grid-column:1/-1}.qk79-player{grid-template-columns:1fr}.qk79-player-meta{text-align:left}.qk79-toolbar button{flex:1 1 calc(50% - 8px)}.qk79-surah-head{align-items:flex-start;flex-direction:column}.qk79-arabic{font-size:1.9rem;line-height:2}}
    `;
    document.head.append(style);
  }

  async function fetchLocal(path) {
    const url = new URL(path, document.baseURI).href;
    try {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(url);
      if (cached) return cached.clone();
      const response = await fetch(url, { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      cache.put(url, response.clone()).catch(() => {});
      return response;
    } catch (error) {
      const response = await fetch(url, { cache: "no-cache" });
      if (!response.ok) throw error;
      return response;
    }
  }

  async function getManifest() {
    if (manifest) return manifest;
    const response = await fetchLocal(`${ROOT}/manifest.json?v=78`);
    manifest = await response.json();
    return manifest;
  }

  async function getSurah(number) {
    const response = await fetchLocal(`${ROOT}/surah/${number}.json?v=78`);
    const json = await response.json();
    return json[String(number)] || json[number] || json;
  }

  function quranPage() { return document.querySelector('[data-islamic-page="quran"]'); }

  function renderShell(page) {
    page.innerHTML = `
      <div class="qk79-shell">
        <header class="qk79-head">
          <span>AL QUR'AN • DATABASE INTERNAL • AUDIO INTERNASIONAL</span>
          <h4>Mushaf Al Qur'an PAIBP SMART SMP</h4>
          <p>Teks Al Qur'an tetap dibaca dari database internal. Audio diputar di dalam aplikasi dengan pilihan 50 qori internasional; default Ustadz Yasser Dossary.</p>
          <div class="qk79-badges"><b>Rasm Usmani</b><b>Terjemah Indonesia</b><b>50 qori</b><b>Play & download audio</b><b>Download teks/JPG</b><b>Share</b></div>
        </header>
        <section class="qk79-panel">
          <div class="qk79-controls">
            <label>Surat<select id="qk79-surah"></select></label>
            <label>Qori <span class="qk79-qori-count" id="qk79-qori-count">menyiapkan…</span><select id="qk79-reciter"><option>Memuat daftar qori…</option></select></label>
            <label>Ayat<input id="qk79-ayah" type="number" min="1" value="1" inputmode="numeric"></label>
          </div>
          <div class="qk79-toolbar">
            <button type="button" id="qk79-play">▶ Play</button>
            <button type="button" id="qk79-audio-download">⬇ Download Audio</button>
            <button type="button" id="qk79-text-download">⬇ Download Teks</button>
            <button type="button" id="qk79-jpg-download">🖼 Download JPG</button>
            <button type="button" id="qk79-share">↗ Share</button>
            <button type="button" id="qk79-open">Tampilkan Ayat</button>
          </div>
          <div class="qk79-player"><audio id="qk79-audio" controls preload="metadata"></audio><div class="qk79-player-meta"><strong id="qk79-now">Belum diputar</strong><small id="qk79-source">Audio: MP3Quran</small></div></div>
          <p class="qk79-status" id="qk79-status" aria-live="polite">Menyiapkan database Al Qur'an…</p>
        </section>
        <section id="qk79-reader"></section>
        <div class="qk79-footnote">Teks Al Qur'an dan terjemah dibaca dari database lokal PAIBP SMART SMP. Katalog/audio qori menggunakan layanan MP3Quran. Bila qori tertentu tidak memiliki surat yang dipilih, pilih qori lain.</div>
      </div>`;
  }

  async function fillManifest() {
    const select = $("#qk79-surah");
    if (!select) return;
    const list = await getManifest();
    select.innerHTML = list.map((s) => `<option value="${Number(s.number)}">${Number(s.number)}. ${esc(s.name_latin)} — ${esc(s.name)}</option>`).join("");
    select.value = String(activeSurah);
  }

  function parseSurahList(moshaf) {
    return new Set(String(moshaf?.surah_list || "").split(",").map((n) => Number(n)).filter(Boolean));
  }

  function priorityIndex(name) {
    const n = normalize(name);
    const exact = PRIORITY_RECITERS.findIndex((p) => n.includes(p) || p.includes(n));
    return exact < 0 ? 999 : exact;
  }

  function bestMoshafFor(reciter, surah = activeSurah) {
    const candidates = (reciter?.moshaf || []).filter((m) => m?.server && parseSurahList(m).has(Number(surah)));
    candidates.sort((a,b) => (Number(b.surah_total)||0) - (Number(a.surah_total)||0));
    return candidates[0] || null;
  }

  function select50Reciters(list) {
    const usable = list.filter((r) => (r.moshaf || []).some((m) => m?.server && Number(m.surah_total || parseSurahList(m).size) >= 20));
    usable.sort((a,b) => {
      const pa = priorityIndex(a.name), pb = priorityIndex(b.name);
      if (pa !== pb) return pa - pb;
      const ca = Math.max(0,...(a.moshaf||[]).map(m=>Number(m.surah_total)||0));
      const cb = Math.max(0,...(b.moshaf||[]).map(m=>Number(m.surah_total)||0));
      if (ca !== cb) return cb - ca;
      return String(a.name).localeCompare(String(b.name));
    });
    const chosen = [];
    const seen = new Set();
    for (const item of usable) {
      const key = normalize(item.name);
      if (!key || seen.has(key)) continue;
      chosen.push(item); seen.add(key);
      if (chosen.length === 50) break;
    }
    return chosen;
  }

  function isYasser(reciter) {
    const n = normalize(reciter?.name);
    return n.includes("yasser") && (n.includes("dosari") || n.includes("dossary") || n.includes("dosary") || n.includes("dawsari"));
  }

  async function loadReciters() {
    const select = $("#qk79-reciter");
    if (!select) return;
    try {
      const response = await fetch(RECITER_API, { cache: "no-cache", mode: "cors" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      reciters = select50Reciters(Array.isArray(json.reciters) ? json.reciters : []);
      if (!reciters.length) throw new Error("Daftar qori kosong");
      select.innerHTML = reciters.map((r) => `<option value="${r.id}">${esc(isYasser(r) ? `Ustadz Yasser Dossary • Default` : r.name)}</option>`).join("");
      $("#qk79-qori-count").textContent = `${reciters.length} qori terpilih`;
      const yasser = reciters.find(isYasser);
      const migrated = localStorage.getItem(RECITER_MIGRATION) === "1";
      const saved = migrated ? localStorage.getItem(RECITER_STORE) : "";
      const savedExists = reciters.some((r) => String(r.id) === String(saved));
      const target = savedExists ? saved : (yasser ? String(yasser.id) : String(reciters[0].id));
      select.value = target;
      localStorage.setItem(RECITER_STORE, target);
      localStorage.setItem(RECITER_MIGRATION, "1");
      updateAudioSource();
    } catch (error) {
      console.error("Quran qori V79", error);
      select.innerHTML = `<option value="">Daftar qori belum dapat dimuat</option>`;
      $("#qk79-qori-count").textContent = "perlu internet";
      setStatus("Database teks siap. Daftar qori memerlukan koneksi internet.", true);
    }
  }

  function selectedReciter() {
    const id = $("#qk79-reciter")?.value;
    return reciters.find((r) => String(r.id) === String(id)) || null;
  }

  function audioUrl(reciter = selectedReciter(), surah = activeSurah) {
    const moshaf = bestMoshafFor(reciter, surah);
    if (!moshaf) return "";
    const base = String(moshaf.server).endsWith("/") ? String(moshaf.server) : `${moshaf.server}/`;
    return `${base}${String(Number(surah)).padStart(3,"0")}.mp3`;
  }

  function setStatus(text, error = false) {
    const node = $("#qk79-status");
    if (!node) return;
    node.textContent = text;
    node.style.color = error ? "#9c2f2f" : "#607770";
  }

  function updateAudioSource() {
    const audio = $("#qk79-audio");
    const play = $("#qk79-play");
    const download = $("#qk79-audio-download");
    const reciter = selectedReciter();
    const url = audioUrl(reciter, activeSurah);
    if (audio) {
      audio.pause();
      audio.src = url || "";
      audio.load();
    }
    if (play) play.disabled = !url;
    if (download) download.disabled = !url;
    const now = $("#qk79-now");
    if (now) now.textContent = reciter ? `${isYasser(reciter) ? "Ustadz Yasser Dossary" : reciter.name} • Surat ${activeSurah}` : "Belum dipilih";
    if (!url && reciter) setStatus(`${reciter.name} belum menyediakan surat ${activeSurah}. Pilih qori lain.`, true);
  }

  async function renderSurah(number, jumpAyah = 1) {
    const reader = $("#qk79-reader");
    if (!reader) return;
    const n = Math.max(1, Math.min(114, Number(number) || 1));
    activeSurah = n;
    setStatus(`Memuat surat ${n} dari database lokal…`);
    reader.innerHTML = "";
    try {
      const surah = await getSurah(n);
      currentSurahData = surah;
      if (!surah || !surah.text) throw new Error("Struktur data surat tidak ditemukan");
      const texts = surah.text || {};
      const translations = surah.translations?.id?.text || {};
      const count = Number(surah.number_of_ayah || Object.keys(texts).length);
      activeAyah = Math.max(1, Math.min(count, Number(jumpAyah) || 1));
      reader.innerHTML = `
        <header class="qk79-surah-head"><div><h5>${esc(surah.name_latin || `Surat ${n}`)}</h5><p>${count} ayat${surah.translations?.id?.name ? ` • ${esc(surah.translations.id.name)}` : ""}</p></div><strong>${esc(surah.name || "")}</strong></header>
        <div class="qk79-ayahs">${Array.from({length:count},(_,i)=>i+1).map((ayah)=>`
          <article class="qk79-ayah${ayah===activeAyah?" is-active":""}" id="qk79-a-${ayah}" data-ayah="${ayah}">
            <div class="qk79-meta"><span class="qk79-num">${ayah}</span><span>${esc(surah.name_latin || "Surat")} : ${ayah}</span></div>
            <div class="qk79-arabic" lang="ar">${esc(texts[String(ayah)] || texts[ayah] || "")}</div>
            <p class="qk79-translation">${esc(translations[String(ayah)] || translations[ayah] || "")}</p>
            <div class="qk79-ayah-actions"><button type="button" data-qk79-select>Pilih ayat</button><button type="button" data-qk79-share-ayah>↗ Bagikan ayat</button></div>
          </article>`).join("")}</div>`;
      const surahSelect = $("#qk79-surah"); if (surahSelect) surahSelect.value = String(n);
      const ayahInput = $("#qk79-ayah"); if (ayahInput) { ayahInput.max=String(count); ayahInput.value=String(activeAyah); }
      reader.querySelectorAll(".qk79-ayah").forEach((card) => {
        const choose = () => selectAyah(Number(card.dataset.ayah), false);
        card.addEventListener("click", (event) => { if (!event.target.closest("button")) choose(); });
        $("[data-qk79-select]",card)?.addEventListener("click", choose);
        $("[data-qk79-share-ayah]",card)?.addEventListener("click", () => { selectAyah(Number(card.dataset.ayah), false); shareCurrentAyah(); });
      });
      setStatus(`${surah.name_latin || `Surat ${n}`} siap • ${count} ayat • teks internal.`);
      updateAudioSource();
      if (activeAyah > 1) requestAnimationFrame(() => $(`#qk79-a-${activeAyah}`)?.scrollIntoView({block:"start",behavior:"smooth"}));
    } catch (error) {
      console.error("Quran Kemenag V79", error);
      reader.innerHTML = `<div class="qk79-footnote">Database surat belum tersedia pada perangkat/server. Muat ulang halaman.</div>`;
      setStatus("Database lokal Al Qur'an gagal dimuat.", true);
    }
  }

  function selectAyah(ayah, scroll = true) {
    if (!currentSurahData) return;
    const count = Number(currentSurahData.number_of_ayah || Object.keys(currentSurahData.text || {}).length);
    activeAyah = Math.max(1, Math.min(count, Number(ayah) || 1));
    document.querySelectorAll(".qk79-ayah").forEach((card) => card.classList.toggle("is-active", Number(card.dataset.ayah) === activeAyah));
    const input = $("#qk79-ayah"); if (input) input.value = String(activeAyah);
    if (scroll) $(`#qk79-a-${activeAyah}`)?.scrollIntoView({block:"center",behavior:"smooth"});
    setStatus(`Ayat aktif: ${currentSurahData.name_latin || `Surat ${activeSurah}`} ayat ${activeAyah}.`);
  }

  function currentAyahPayload() {
    if (!currentSurahData) return null;
    return {
      surah: currentSurahData.name_latin || `Surat ${activeSurah}`,
      arabic: currentSurahData.text?.[String(activeAyah)] || "",
      translation: currentSurahData.translations?.id?.text?.[String(activeAyah)] || "",
      reference: `${currentSurahData.name_latin || `Surat ${activeSurah}`} : ${activeAyah}`
    };
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=filename; document.body.append(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
  }

  async function downloadAudio() {
    const url = audioUrl();
    const reciter = selectedReciter();
    if (!url || !reciter) return setStatus("Audio surat ini belum tersedia.", true);
    const filename = `${String(activeSurah).padStart(3,"0")}-${(currentSurahData?.name_latin||"surat").replace(/[^a-z0-9]+/gi,"-")}-${reciter.name.replace(/[^a-z0-9]+/gi,"-")}.mp3`;
    setStatus("Menyiapkan file audio…");
    try {
      const response = await fetch(url, { mode:"cors" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      downloadBlob(blob, filename);
      setStatus("Download audio dimulai.");
    } catch (error) {
      const a=document.createElement("a"); a.href=url; a.target="_blank"; a.rel="noopener"; a.download=filename; document.body.append(a); a.click(); a.remove();
      setStatus("Audio dibuka dari server qori; gunakan tombol unduh browser bila file tidak otomatis tersimpan.");
    }
  }

  function downloadText() {
    if (!currentSurahData) return;
    const texts=currentSurahData.text||{}, trans=currentSurahData.translations?.id?.text||{};
    const count=Number(currentSurahData.number_of_ayah||Object.keys(texts).length);
    const lines=[`Al Qur'an Surat ${currentSurahData.name_latin} (${activeSurah})`,`PAIBP SMART SMP • Database internal`,""];
    for(let i=1;i<=count;i++) lines.push(`${i}. ${texts[String(i)]||""}`,`${trans[String(i)]||""}`,"");
    downloadBlob(new Blob([lines.join("\n")],{type:"text/plain;charset=utf-8"}),`Al-Quran-${String(activeSurah).padStart(3,"0")}-${currentSurahData.name_latin}.txt`);
    setStatus("Teks surat berhasil disiapkan untuk diunduh.");
  }

  function wrapCanvasText(ctx, text, maxWidth) {
    const words=String(text||"").split(/\s+/); const lines=[]; let line="";
    for(const word of words){const test=line?`${line} ${word}`:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;}else line=test;}
    if(line)lines.push(line); return lines;
  }

  async function downloadJpg() {
    const payload=currentAyahPayload(); if(!payload)return;
    try { await document.fonts?.ready; } catch {}
    const canvas=document.createElement("canvas"); canvas.width=1080; canvas.height=1350; const ctx=canvas.getContext("2d");
    ctx.fillStyle="#eef9f5";ctx.fillRect(0,0,1080,1350);ctx.fillStyle="#08745e";ctx.fillRect(0,0,1080,180);
    ctx.fillStyle="#ffffff";ctx.font="700 42px system-ui,sans-serif";ctx.fillText("PAIBP SMART SMP • AL QUR'AN",60,82);ctx.font="600 30px system-ui,sans-serif";ctx.fillText(payload.reference,60,132);
    ctx.fillStyle="#102e29";ctx.textAlign="right";ctx.direction="rtl";ctx.font="54px 'Noto Naskh Arabic','Amiri',serif";
    const arabicLines=wrapCanvasText(ctx,payload.arabic,930);let y=300;for(const line of arabicLines){ctx.fillText(line,1020,y);y+=100;}
    ctx.direction="ltr";ctx.textAlign="left";ctx.fillStyle="#3f5d56";ctx.font="32px system-ui,sans-serif";y=Math.max(y+45,650);const trLines=wrapCanvasText(ctx,payload.translation,930);for(const line of trLines){ctx.fillText(line,60,y);y+=48;}
    ctx.fillStyle="#08745e";ctx.font="700 25px system-ui,sans-serif";ctx.fillText("Teks: database internal PAIBP SMART SMP",60,1270);ctx.font="22px system-ui,sans-serif";ctx.fillStyle="#607770";ctx.fillText("Bagikan dengan tetap menjaga kehormatan ayat Al Qur'an.",60,1310);
    canvas.toBlob((blob)=>{if(blob){downloadBlob(blob,`Al-Quran-${activeSurah}-${activeAyah}.jpg`);setStatus("JPG ayat aktif berhasil disiapkan.");}},"image/jpeg",0.94);
  }

  async function shareCurrentAyah() {
    const payload=currentAyahPayload(); if(!payload)return;
    const text=`${payload.arabic}\n\n${payload.translation}\n\nAl Qur'an Surat ${payload.reference} — PAIBP SMART SMP`;
    try {
      if(navigator.share) await navigator.share({title:`Al Qur'an Surat ${payload.reference}`,text,url:location.href});
      else {await navigator.clipboard.writeText(`${text}\n${location.href}`);setStatus("Ayat dan tautan berhasil disalin untuk dibagikan.");}
    } catch(error){if(error?.name!=="AbortError")setStatus("Menu share belum diizinkan browser ini.",true);}
  }

  function bind() {
    $("#qk79-open")?.addEventListener("click",()=>selectAyah($("#qk79-ayah")?.value||1,true));
    $("#qk79-surah")?.addEventListener("change",(e)=>renderSurah(e.target.value,1));
    $("#qk79-ayah")?.addEventListener("keydown",(e)=>{if(e.key==="Enter")selectAyah(e.target.value,true);});
    $("#qk79-reciter")?.addEventListener("change",(e)=>{localStorage.setItem(RECITER_STORE,e.target.value);updateAudioSource();});
    $("#qk79-play")?.addEventListener("click",()=>{const audio=$("#qk79-audio");if(!audio?.src)return;if(audio.paused)audio.play().catch(()=>setStatus("Tekan Play sekali lagi untuk mengizinkan audio.",true));else audio.pause();});
    $("#qk79-audio-download")?.addEventListener("click",downloadAudio);
    $("#qk79-text-download")?.addEventListener("click",downloadText);
    $("#qk79-jpg-download")?.addEventListener("click",downloadJpg);
    $("#qk79-share")?.addEventListener("click",shareCurrentAyah);
    const audio=$("#qk79-audio");
    audio?.addEventListener("play",()=>{$("#qk79-play").textContent="Ⅱ Pause";setStatus(`Memutar ${selectedReciter()?.name||"qori"} • ${currentSurahData?.name_latin||`Surat ${activeSurah}`}.`);});
    audio?.addEventListener("pause",()=>{$("#qk79-play").textContent="▶ Play";});
    audio?.addEventListener("error",()=>{if(audio.src)setStatus("Audio gagal dimuat. Coba qori lain atau periksa koneksi.",true);});
  }

  async function mount() {
    const page=quranPage(); if(!page)return false;
    injectStyle(); renderShell(page);
    try {
      await fillManifest(); bind();
      await Promise.all([renderSurah(activeSurah,activeAyah),loadReciters()]);
      initialized=true;document.documentElement.dataset.quranReader="kemenag-local-v79-feature-restore";return true;
    } catch(error){console.error("Quran V79 init",error);setStatus("Paket Al Qur'an belum siap.",true);return false;}
  }

  document.addEventListener("click",(event)=>{const button=event.target.closest('[data-islamic-view="quran"]');if(!button)return;setTimeout(()=>{if(!initialized||!$("#qk79-reader"))mount();},0);},true);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{if(document.querySelector('[data-islamic-view="quran"][aria-pressed="true"]'))mount();},{once:true});
  else if(document.querySelector('[data-islamic-view="quran"][aria-pressed="true"]'))mount();

  window.PAIBP_QURAN_KEMENAG_V78=Object.freeze({mount,renderSurah,build:BUILD});
})();
