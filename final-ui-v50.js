(() => {
  "use strict";
  const VERSION = "50";
  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];
  const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[c]);
  const SIGNATURE = /\b(?:mengetahui|kepala sekolah|guru mata pelajaran|tanda tangan|nip\.?|nama terang|demak|banjarnegara|susukan)\b/i;
  const SIGNATURE_STRONG = /(?:mengetahui[\s\S]{0,180}kepala sekolah|kepala sekolah[\s\S]{0,180}guru mata pelajaran|nip\.?\s*\d{8,})/i;
  const TASK_KEY = "paibp-smart-focus-session-v50";
  let mutationTimer = 0;

  function nearDocumentEnd(node, root) {
    const elements = [...(root?.children || [])];
    let top = node;
    while (top?.parentElement && top.parentElement !== root) top = top.parentElement;
    const index = elements.indexOf(top);
    return index < 0 || index >= Math.max(0, elements.length - Math.ceil(elements.length * .28));
  }

  function removeSignatures(root = document) {
    const documents = $$("#teacher-document,.v48-source-document,.document-preview,.print-document", root);
    for (const doc of documents) {
      const tables = $$("table", doc);
      for (const table of tables) {
        const text = clean(table.textContent);
        if ((SIGNATURE_STRONG.test(text) || (SIGNATURE.test(text) && /kepala sekolah|guru mata pelajaran|nip\.?/i.test(text))) && nearDocumentEnd(table.closest(".v48-source-document") || table, table.closest(".v48-source-document") || doc)) {
          (table.closest(".v48-table-scroll") || table).classList.add("v50-signature-block");
        }
      }
      const blocks = $$("p,div,section,footer", doc);
      for (const block of blocks) {
        if (block.closest("table")) continue;
        const text = clean(block.textContent);
        if (text.length > 420 || !SIGNATURE.test(text)) continue;
        if (nearDocumentEnd(block, block.closest(".v48-source-document") || doc) && /mengetahui|kepala sekolah|guru mata pelajaran|nip\.?/i.test(text)) {
          block.classList.add("v50-signature-block");
        }
      }
      for (const footer of $$(".v48-doc-footer", doc)) {
        const text = clean(footer.textContent);
        if (SIGNATURE.test(text)) footer.classList.add("v50-signature-block");
      }
    }
  }

  function normalizeTables(root = document) {
    for (const table of $$("#teacher-document table,.v48-source-table,.v48-excel-table", root)) {
      const rows = $$("tr", table);
      for (const row of rows) {
        const hasMedia = Boolean($("img,svg,input,textarea,select,button", row));
        const text = clean(row.textContent);
        if (!hasMedia && !text) row.classList.add("v50-empty-row");
      }
      while (table.rows?.length && table.rows[0].classList.contains("v50-empty-row")) table.rows[0].remove();
      while (table.rows?.length && table.rows[table.rows.length - 1].classList.contains("v50-empty-row")) table.rows[table.rows.length - 1].remove();
      if (!clean(table.textContent) && !$("img,svg,input,textarea,select", table)) {
        (table.closest(".v48-table-scroll") || table).classList.add("v50-empty-row");
      }
      for (const cell of $$("td,th", table)) {
        cell.style.removeProperty("color");
        cell.querySelectorAll("[style]").forEach((node) => node.style.removeProperty("color"));
      }
    }
  }

  function fixAi(root = document) {
    const toolbars = $$(".v48-ai-tools", root);
    toolbars.slice(1).forEach((node) => node.remove());
    const toolbar = toolbars[0];
    if (toolbar) {
      const seen = new Set();
      $$("button", toolbar).forEach((button) => {
        const key = clean(button.textContent).toLowerCase();
        if (seen.has(key)) button.remove(); else seen.add(key);
      });
    }
    for (const messages of $$("[data-ai-messages],#spensus-ai-messages,.ai-drawer-messages-v27", root)) {
      if (clean(messages.textContent) || $("article,.v48-ai-message", messages)) continue;
      const empty = document.createElement("div");
      empty.className = "v50-ai-empty";
      empty.innerHTML = "<strong>Spensus AI siap digunakan</strong><p>Ketik pertanyaan pada kolom di bawah. Saat layanan daring belum aktif, materi portal dan fitur luring tetap dapat digunakan.</p>";
      messages.append(empty);
    }
  }

  function svg(kind, label) {
    const palette = {water:"#42a5f5",earth:"#ba8b5b",prayer:"#0a7d68",fast:"#f2b632",zakat:"#8e6ccf",hajj:"#e28c41",qurban:"#b35d57",group:"#087f68"};
    const color = palette[kind] || "#0a7d68";
    const extra = kind === "water"
      ? '<path d="M15 8c-3 4-5 6-5 9a5 5 0 0 0 10 0c0-3-2-5-5-9Z" fill="#dff4ff" stroke="#268bd2" stroke-width="1.5"/>'
      : kind === "earth"
      ? '<path d="M5 22h20M8 18c4-6 10-6 14 0" fill="none" stroke="#9b6b3d" stroke-width="2"/>'
      : kind === "fast"
      ? '<circle cx="15" cy="15" r="7" fill="#fff4be"/><path d="M18 8a7 7 0 1 0 0 14 6 6 0 1 1 0-14Z" fill="#f2b632"/>'
      : kind === "zakat"
      ? '<rect x="8" y="12" width="14" height="11" rx="2" fill="#efe8ff" stroke="#7756b8"/><path d="M12 12v-2h6v2M15 14v7" stroke="#7756b8" stroke-width="1.5"/>'
      : kind === "hajj"
      ? '<rect x="8" y="10" width="14" height="14" fill="#202020"/><path d="M8 13h14" stroke="#d6b04f" stroke-width="2"/>'
      : kind === "qurban"
      ? '<path d="M8 18c0-5 4-8 9-8 4 0 7 2 8 5l-3 1-1 6h-2l-1-4h-6l-1 4H9Z" fill="#f6e5df" stroke="#9a4f49"/>'
      : kind === "group"
      ? '<circle cx="11" cy="10" r="3" fill="#dff5ee"/><circle cx="20" cy="10" r="3" fill="#dff5ee"/><path d="M6 23c0-5 2-8 5-8s5 3 5 8M15 23c0-5 2-8 5-8s5 3 5 8" fill="none" stroke="#087f68" stroke-width="2"/>'
      : '<circle cx="15" cy="9" r="3" fill="#def5ed"/><path d="M15 12v8m-5 5 5-5 5 5m-9-9h8" fill="none" stroke="#0a7d68" stroke-width="2" stroke-linecap="round"/>';
    return `<svg viewBox="0 0 30 30" role="img" aria-label="${escapeHtml(label)}"><rect x="1" y="1" width="28" height="28" rx="7" fill="${color}18"/>${extra}</svg>`;
  }

  const SIMULATIONS = [
    {id:"wudhu",title:"Wudhu",kind:"water",summary:"Urutan wudhu dari niat sampai doa.",steps:[
      ["Niat dan basmalah","Berniat wudhu karena Alloh Subhanahu Wata'ala lalu membaca basmalah."],["Membasuh telapak tangan","Basuh kedua telapak tangan tiga kali."],["Berkumur dan membersihkan hidung","Berkumur, memasukkan air ke hidung, lalu mengeluarkannya."],["Membasuh wajah","Basuh seluruh wajah tiga kali secara merata."],["Membasuh tangan sampai siku","Dahulukan tangan kanan, lalu kiri."],["Mengusap kepala dan telinga","Usap kepala satu kali dan bersihkan telinga."],["Membasuh kaki sampai mata kaki","Dahulukan kaki kanan dan sela-sela jari."],["Tertib dan doa","Lakukan berurutan lalu membaca doa setelah wudhu."]]},
    {id:"tayamum",title:"Tayamum",kind:"earth",summary:"Pengganti wudhu saat air tidak tersedia atau tidak dapat digunakan.",steps:[
      ["Pastikan sebab tayamum","Tidak ada air atau penggunaan air membahayakan."],["Niat","Berniat tayamum untuk menghilangkan hadats."],["Tepukkan tangan","Tepukkan kedua telapak tangan pada debu yang suci."],["Usap wajah","Usap seluruh wajah satu kali."],["Usap kedua tangan","Usap tangan kanan dan kiri secara tertib."]]},
    {id:"sholat-munfarid",title:"Sholat Munfarid",kind:"prayer",summary:"Gerakan dan urutan sholat sendiri.",steps:[
      ["Niat dan takbiratul ihram","Berdiri menghadap kiblat, niat, lalu takbir."],["Qiyam dan bacaan","Baca Al Fatihah dan surat pilihan."],["Ruku","Ruku dengan tuma'ninah."],["I'tidal","Bangkit dari ruku dan berdiri tegak."],["Sujud","Sujud dua kali diselingi duduk."],["Tasyahud","Duduk tasyahud sesuai rakaat."],["Salam","Akhiri sholat dengan salam ke kanan dan kiri."]]},
    {id:"sholat-berjamaah",title:"Sholat Berjamaah",kind:"group",summary:"Posisi imam, makmum, dan aturan mengikuti imam.",steps:[
      ["Luruskan shaf","Makmum merapatkan dan meluruskan barisan."],["Imam di depan","Imam berdiri di depan, makmum mengikuti di belakang."],["Takbir bersama","Makmum bertakbir setelah imam."],["Ikuti gerakan imam","Makmum tidak mendahului imam."],["Sempurnakan rakaat","Makmum masbuk menyempurnakan rakaat setelah imam salam."],["Salam","Ikuti salam imam dengan tertib."]]},
    {id:"puasa",title:"Puasa",kind:"fast",summary:"Alur ibadah puasa dari niat sampai berbuka.",steps:[
      ["Niat","Berniat puasa sesuai jenisnya."],["Sahur","Makan sahur secukupnya dan tidak berlebihan."],["Menahan diri","Menahan makan, minum, dan hal yang membatalkan."],["Menjaga akhlak","Menjaga ucapan, perilaku, dan memperbanyak ibadah."],["Berbuka","Segera berbuka ketika waktunya tiba."],["Evaluasi diri","Syukuri ibadah dan perbaiki kekurangan."]]},
    {id:"zakat",title:"Zakat",kind:"zakat",summary:"Proses menghitung, menunaikan, dan menyalurkan zakat.",steps:[
      ["Kenali jenis zakat","Bedakan zakat fitrah dan zakat mal."],["Hitung kewajiban","Periksa nishab, haul, atau ukuran zakat fitrah."],["Niat","Berniat menunaikan zakat karena Alloh Subhanahu Wata'ala."],["Serahkan zakat","Salurkan melalui amil atau langsung kepada mustahik yang berhak."],["Catat penyaluran","Pastikan jumlah dan penerima tercatat dengan benar."]]},
    {id:"haji",title:"Haji",kind:"hajj",summary:"Urutan pokok manasik haji secara ringkas.",steps:[
      ["Ihram dan niat","Memakai ihram dan berniat dari miqat."],["Wukuf di Arafah","Berdiam dan berdoa pada waktunya."],["Mabit","Bermalam di Muzdalifah dan Mina sesuai ketentuan."],["Melontar jumrah","Melontar jumrah dengan tertib."],["Tahallul","Mencukur atau memotong rambut."],["Tawaf","Mengelilingi Ka'bah tujuh putaran."],["Sa'i","Berjalan antara Shafa dan Marwah tujuh kali."]]},
    {id:"kurban",title:"Kurban",kind:"qurban",summary:"Persiapan, penyembelihan, dan pembagian daging kurban.",steps:[
      ["Niat dan waktu","Berniat kurban dan melaksanakannya pada waktu yang ditentukan."],["Pilih hewan sehat","Pastikan cukup umur dan tidak cacat."],["Penyembelihan syar'i","Hadapkan ke kiblat, baca basmalah, dan sembelih dengan alat tajam."],["Pengolahan higienis","Tangani daging secara bersih dan aman."],["Pembagian","Bagikan kepada yang berhak secara adil dan tertib."]]},
  ];

  function buildSimulationBoard() {
    const panel = $("#panel-islamic,[data-panel='islamic']");
    if (!panel || $("#v50-simulation-board", panel)) return;
    const board = document.createElement("section");
    board.id = "v50-simulation-board";
    board.className = "v50-simulation-board";
    board.innerHTML = `<header><div><span class="panel-kicker">SIMULASI IBADAH VISUAL</span><h3>Belajar urutan ibadah melalui visual langkah demi langkah</h3></div><p>Ringan, responsif, dan dapat dipelajari kembali saat luring.</p></header><div class="v50-simulation-grid">${SIMULATIONS.map((item) => `<article class="v50-sim-card"><button type="button" data-v50-sim="${item.id}" aria-expanded="false"><span class="v50-sim-icon">${svg(item.kind,item.title)}</span><span><strong>${item.title}</strong><small>${item.summary}</small></span><b>›</b></button></article>`).join("")}<section class="v50-sim-detail" data-v50-sim-detail hidden></section></div>`;
    const heading = [...panel.querySelectorAll("h2,h3,h4,strong")].find((node) => /simulasi|praktik ibadah/i.test(clean(node.textContent)));
    const anchor = heading?.closest("section,article,div");
    if (anchor && anchor.parentNode === panel) anchor.insertAdjacentElement("afterend", board); else panel.append(board);
    const detail = $("[data-v50-sim-detail]", board);
    $$("[data-v50-sim]", board).forEach((button) => button.addEventListener("click", () => {
      const item = SIMULATIONS.find((entry) => entry.id === button.dataset.v50Sim);
      if (!item) return;
      $$("[data-v50-sim]", board).forEach((entry) => entry.setAttribute("aria-expanded", String(entry === button)));
      detail.hidden = false;
      detail.innerHTML = `<div class="v50-sim-detail-head"><h4>${escapeHtml(item.title)} — urutan praktik</h4><button type="button" data-v50-close-sim>Tutup</button></div><div class="v50-sim-steps">${item.steps.map(([title,description]) => `<article class="v50-sim-step">${svg(item.kind,title)}<strong>${escapeHtml(title)}</strong><p>${escapeHtml(description)}</p></article>`).join("")}</div>`;
      $("[data-v50-close-sim]", detail)?.addEventListener("click", () => { detail.hidden = true; $$("[data-v50-sim]", board).forEach((entry) => entry.setAttribute("aria-expanded","false")); });
      detail.scrollIntoView({behavior:"smooth",block:"nearest"});
    }));
  }

  function focusGate() {
    let gate = $("#v50-focus-resume");
    if (gate) return gate;
    gate = document.createElement("div");
    gate.id = "v50-focus-resume";
    gate.hidden = true;
    gate.innerHTML = `<section role="dialog" aria-modal="true"><strong>Mode tugas masih berlangsung</strong><p>Selesaikan tugas atau kembali ke layar penuh. Sistem browser tetap memiliki kendali keselamatan perangkat.</p><button type="button" data-v50-resume>Masuk Kembali</button></section>`;
    document.body.append(gate);
    $("[data-v50-resume]", gate).addEventListener("click", () => startFocus());
    return gate;
  }

  async function lockPortrait() {
    try { await screen.orientation?.lock?.("portrait-primary"); } catch {}
  }

  async function startFocus() {
    sessionStorage.setItem(TASK_KEY, "active");
    document.documentElement.classList.add("v50-task-focus");
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen({navigationUI:"hide"});
    } catch {}
    await lockPortrait();
    focusGate().hidden = true;
  }

  function completeFocus() {
    sessionStorage.setItem(TASK_KEY, "complete");
    document.documentElement.classList.remove("v50-task-focus");
    focusGate().hidden = true;
    try { screen.orientation?.unlock?.(); } catch {}
  }

  function wireFocus() {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("button,a");
      if (!button) return;
      const text = clean(button.textContent);
      if (/mulai belajar full screen|layar penuh|full screen/i.test(text) && !/keluar/i.test(text)) setTimeout(startFocus, 0);
      if (/selesai|kirim tugas|akhiri tugas/i.test(text) && /tugas|evaluasi|lkpd|selesai/i.test(clean(button.closest("form,section,article,div")?.textContent))) {
        setTimeout(() => {
          const progress = clean($("#material-completed")?.textContent);
          if (/30\/30|selesai/i.test(progress) || button.matches("[data-complete],[data-submit-task],button[type='submit']")) completeFocus();
        }, 350);
      }
    }, true);
    document.addEventListener("fullscreenchange", async () => {
      const active = sessionStorage.getItem(TASK_KEY) === "active";
      if (document.fullscreenElement) { if (active) await lockPortrait(); return; }
      if (active) focusGate().hidden = false;
    });
    if (sessionStorage.getItem(TASK_KEY) === "active") document.documentElement.classList.add("v50-task-focus");
    window.PAIBP_TASK_GUARD_V50 = Object.freeze({start:startFocus,complete:completeFocus,release:completeFocus});
  }

  function runFixes(root = document) {
    removeSignatures(root);
    normalizeTables(root);
    fixAi(root);
    buildSimulationBoard();
  }

  function schedule(root = document) {
    clearTimeout(mutationTimer);
    mutationTimer = setTimeout(() => runFixes(root), 60);
  }

  function init() {
    document.documentElement.dataset.paibpFinal = VERSION;
    runFixes();
    wireFocus();
    const observer = new MutationObserver((mutations) => {
      const root = mutations.find((item) => item.addedNodes.length)?.target || document;
      schedule(root.closest?.("#teacher-document,.workspace-panel,.ai-drawer-panel-v27") || document);
    });
    observer.observe(document.body, {childList:true,subtree:true});
    window.addEventListener("pageshow", () => runFixes());
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true}); else init();
})();
