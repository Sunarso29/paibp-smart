(() => {
  "use strict";

  const BUILD = "78";
  const ROOT = "quran-kemenag";
  const CACHE = "paibp-quran-kemenag-v78";
  let manifest = null;
  let activeSurah = 1;
  let initialized = false;

  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  })[c]);

  function injectStyle() {
    if ($("#qk78-style")) return;
    const style = document.createElement("style");
    style.id = "qk78-style";
    style.textContent = `
      .qk78-shell{display:grid;gap:16px}
      .qk78-head{padding:24px;border-radius:24px;color:#fff;background:linear-gradient(135deg,#043f36,#08745e 58%,#12445d);box-shadow:0 20px 55px rgba(0,55,47,.16)}
      .qk78-head span{display:inline-block;font-size:.7rem;font-weight:900;letter-spacing:.12em;color:#dfff9b}
      .qk78-head h4{margin:8px 0 8px;color:#fff;font-size:clamp(1.65rem,3vw,2.6rem)}
      .qk78-head p{margin:0;max-width:850px;color:#dceee8;line-height:1.65}
      .qk78-source{margin-top:12px;display:flex;flex-wrap:wrap;gap:8px}
      .qk78-source b,.qk78-source small{display:inline-flex;align-items:center;padding:6px 9px;border-radius:999px;background:rgba(255,255,255,.12);color:#fff;font-size:.7rem}
      .qk78-controls{display:grid;grid-template-columns:minmax(220px,1fr) 150px auto auto;gap:10px;align-items:end;padding:14px;border:1px solid rgba(7,92,75,.15);border-radius:18px;background:#fff}
      .qk78-controls label{display:grid;gap:6px;font-size:.73rem;font-weight:850;color:#073f36}
      .qk78-controls select,.qk78-controls input{min-height:44px;border:1px solid rgba(7,92,75,.2);border-radius:12px;padding:0 11px;background:#fff;color:#173f38}
      .qk78-controls button{min-height:44px;border:0;border-radius:12px;padding:0 14px;font-weight:900;cursor:pointer;background:#08745e;color:#fff}
      .qk78-controls button.secondary{background:#edf8f4;color:#075d4a;border:1px solid rgba(7,92,75,.15)}
      .qk78-status{min-height:22px;color:#607770;font-size:.78rem}
      .qk78-surah-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-end;padding:16px 4px 4px}
      .qk78-surah-head h5{margin:0;font-size:1.4rem;color:#073f36}.qk78-surah-head p{margin:3px 0 0;color:#607770}.qk78-surah-head strong{font-family:serif;font-size:1.7rem;direction:rtl}
      .qk78-ayahs{display:grid;gap:12px}
      .qk78-ayah{scroll-margin-top:90px;padding:18px;border:1px solid rgba(7,92,75,.13);border-radius:18px;background:linear-gradient(145deg,#fff,#f5fbf8);box-shadow:0 10px 28px rgba(3,60,50,.06)}
      .qk78-meta{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px;color:#607770;font-size:.74rem;font-weight:800}
      .qk78-num{display:grid;place-items:center;min-width:34px;height:34px;border-radius:12px;background:#08745e;color:#fff}
      .qk78-arabic{margin:4px 0 14px;text-align:right;direction:rtl;font-family:"Noto Naskh Arabic","Amiri","Scheherazade New",serif;font-size:clamp(1.65rem,3.4vw,2.35rem);line-height:2.05;color:#102e29}
      .qk78-translation{margin:0;color:#3f5d56;line-height:1.72;font-size:.93rem}
      .qk78-footnote{padding:12px 14px;border-radius:14px;background:#fff8df;color:#6b5b2b;font-size:.76rem;line-height:1.55}
      @media(max-width:760px){.qk78-controls{grid-template-columns:1fr 1fr}.qk78-controls label:first-child{grid-column:1/-1}.qk78-controls button{width:100%}.qk78-surah-head{align-items:flex-start;flex-direction:column}.qk78-arabic{font-size:1.85rem;line-height:2}}
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
    const response = await fetchLocal(`${ROOT}/manifest.json?v=${BUILD}`);
    manifest = await response.json();
    return manifest;
  }

  async function getSurah(number) {
    const response = await fetchLocal(`${ROOT}/surah/${number}.json?v=${BUILD}`);
    const json = await response.json();
    return json[String(number)] || json[number] || json;
  }

  function quranPage() {
    return document.querySelector('[data-islamic-page="quran"]');
  }

  function renderShell(page) {
    page.innerHTML = `
      <div class="qk78-shell">
        <header class="qk78-head">
          <span>AL QUR'AN • DATABASE INTERNAL</span>
          <h4>Mushaf Al Qur'an di PAIBP SMART SMP</h4>
          <p>Pembaca ini berjalan di dalam aplikasi. Teks tidak membuka website lain. Basis data disimpan sebagai file lokal per surat agar ringan dan dapat dicache pada perangkat.</p>
          <div class="qk78-source"><b>Rasm Usmani • acuan Mushaf Standar Indonesia</b><small>Snapshot data bersumber dari Qur’an Kemenag</small></div>
        </header>
        <div class="qk78-controls">
          <label>Surat<select id="qk78-surah"></select></label>
          <label>Ayat<input id="qk78-ayah" type="number" min="1" value="1" inputmode="numeric"></label>
          <button type="button" id="qk78-open">Tampilkan</button>
          <button type="button" class="secondary" id="qk78-top">Ke atas</button>
        </div>
        <div class="qk78-status" id="qk78-status" aria-live="polite">Menyiapkan database Al Qur'an…</div>
        <section id="qk78-reader"></section>
        <div class="qk78-footnote">Catatan sumber: LPMQ menyediakan API Qur’an Kemenag resmi untuk Mushaf Standar Indonesia. API resmi memerlukan pendaftaran/token. Database lokal ini memakai snapshot open-source yang menyatakan sumber utamanya berasal dari Qur’an Kemenag; saat token API LPMQ tersedia, dataset dapat disinkronkan langsung tanpa mengubah tampilan pembaca.</div>
      </div>`;
  }

  async function fillManifest() {
    const select = $("#qk78-surah");
    if (!select) return;
    const list = await getManifest();
    select.innerHTML = list.map((s) => `<option value="${Number(s.number)}">${Number(s.number)}. ${esc(s.name_latin)} — ${esc(s.name)}</option>`).join("");
    select.value = String(activeSurah);
  }

  function setStatus(text, error = false) {
    const node = $("#qk78-status");
    if (!node) return;
    node.textContent = text;
    node.style.color = error ? "#9c2f2f" : "#607770";
  }

  async function renderSurah(number, jumpAyah = 1) {
    const reader = $("#qk78-reader");
    if (!reader) return;
    const n = Math.max(1, Math.min(114, Number(number) || 1));
    activeSurah = n;
    setStatus(`Memuat surat ${n} dari database lokal…`);
    reader.innerHTML = "";
    try {
      const surah = await getSurah(n);
      if (!surah || !surah.text) throw new Error("Struktur data surat tidak ditemukan");
      const texts = surah.text || {};
      const translations = surah.translations?.id?.text || {};
      const count = Number(surah.number_of_ayah || Object.keys(texts).length);
      reader.innerHTML = `
        <header class="qk78-surah-head">
          <div><h5>${esc(surah.name_latin || `Surat ${n}`)}</h5><p>${count} ayat${surah.translations?.id?.name ? ` • ${esc(surah.translations.id.name)}` : ""}</p></div>
          <strong>${esc(surah.name || "")}</strong>
        </header>
        <div class="qk78-ayahs">
          ${Array.from({ length: count }, (_, i) => i + 1).map((ayah) => `
            <article class="qk78-ayah" id="qk78-a-${ayah}" data-ayah="${ayah}">
              <div class="qk78-meta"><span class="qk78-num">${ayah}</span><span>${esc(surah.name_latin || "Surat")} : ${ayah}</span></div>
              <div class="qk78-arabic" lang="ar">${esc(texts[String(ayah)] || texts[ayah] || "")}</div>
              <p class="qk78-translation">${esc(translations[String(ayah)] || translations[ayah] || "")}</p>
            </article>`).join("")}
        </div>`;
      const select = $("#qk78-surah");
      if (select) select.value = String(n);
      const ayahInput = $("#qk78-ayah");
      if (ayahInput) { ayahInput.max = String(count); ayahInput.value = String(Math.max(1, Math.min(count, Number(jumpAyah) || 1))); }
      setStatus(`${surah.name_latin || `Surat ${n}`} siap • ${count} ayat • database lokal.`);
      const targetAyah = Math.max(1, Math.min(count, Number(jumpAyah) || 1));
      if (targetAyah > 1) requestAnimationFrame(() => $(`#qk78-a-${targetAyah}`)?.scrollIntoView({ block: "start", behavior: "smooth" }));
    } catch (error) {
      console.error("Quran Kemenag V78", error);
      reader.innerHTML = `<div class="qk78-footnote">Database surat belum tersedia pada perangkat/server. Muat ulang setelah paket data V78 selesai diterbitkan.</div>`;
      setStatus("Database lokal Al Qur'an gagal dimuat.", true);
    }
  }

  function bind() {
    $("#qk78-open")?.addEventListener("click", () => renderSurah($("#qk78-surah")?.value || 1, $("#qk78-ayah")?.value || 1));
    $("#qk78-surah")?.addEventListener("change", (event) => renderSurah(event.target.value, 1));
    $("#qk78-ayah")?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") renderSurah($("#qk78-surah")?.value || 1, event.target.value || 1);
    });
    $("#qk78-top")?.addEventListener("click", () => quranPage()?.scrollIntoView({ block: "start", behavior: "smooth" }));
  }

  async function mount() {
    const page = quranPage();
    if (!page) return false;
    injectStyle();
    renderShell(page);
    try {
      await fillManifest();
      bind();
      await renderSurah(activeSurah, 1);
      initialized = true;
      document.documentElement.dataset.quranReader = "kemenag-local-v78";
      return true;
    } catch (error) {
      console.error("Quran Kemenag V78 init", error);
      setStatus("Paket database Al Qur'an belum siap.", true);
      return false;
    }
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest('[data-islamic-view="quran"]');
    if (!button) return;
    setTimeout(() => {
      if (!initialized || !$("#qk78-reader")) mount();
    }, 0);
  }, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      if (document.querySelector('[data-islamic-view="quran"][aria-pressed="true"]')) mount();
    }, { once: true });
  } else if (document.querySelector('[data-islamic-view="quran"][aria-pressed="true"]')) {
    mount();
  }

  window.PAIBP_QURAN_KEMENAG_V78 = Object.freeze({ mount, renderSurah, build: BUILD });
})();
