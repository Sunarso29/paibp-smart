(() => {
  "use strict";

  const VERSION = "48";
  const MODE_KEY = "paibp-smart-curriculum-mode-v48";
  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;",
  })[character]);
  const asset = (path) => new URL(`${path}?v=${VERSION}`, document.baseURI).href;

  let mode = localStorage.getItem(MODE_KEY) === "2025" ? "2025" : "2026";
  let grade = "VIII";
  let doc = "cp";
  let selectedRecord = "";
  let manifestPromise = null;
  const scriptPromises = new Map();
  let connectedPanel = null;
  let panelObserver = null;
  let connectionObserver = null;

  function loadScript(path, ready) {
    if (ready?.()) return Promise.resolve();
    if (scriptPromises.has(path)) return scriptPromises.get(path);
    const promise = new Promise((resolve, reject) => {
      const existing = [...document.scripts].find((node) => {
        try { return new URL(node.src).pathname === new URL(path, document.baseURI).pathname; }
        catch { return false; }
      });
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", () => reject(new Error(`Gagal memuat ${path}.`)), { once: true });
        setTimeout(() => ready?.() ? resolve() : reject(new Error(`Data ${path} belum siap.`)), 3000);
        return;
      }
      const node = document.createElement("script");
      node.src = asset(path);
      node.async = true;
      node.onload = resolve;
      node.onerror = () => reject(new Error(`File ${path} tidak ditemukan di repository.`));
      document.head.append(node);
    }).catch((error) => {
      scriptPromises.delete(path);
      throw error;
    });
    scriptPromises.set(path, promise);
    return promise;
  }

  async function getManifest() {
    if (window.PAIBP_CP2025_V48_MANIFEST?.records?.length) return window.PAIBP_CP2025_V48_MANIFEST;
    if (!manifestPromise) {
      manifestPromise = loadScript("cp2025-manifest-v48.js", () => Boolean(window.PAIBP_CP2025_V48_MANIFEST?.records?.length))
        .then(() => {
          const value = window.PAIBP_CP2025_V48_MANIFEST;
          if (!value?.records?.length) throw new Error("Manifest CP Lama 2025 kosong.");
          if (value.records.length !== 40) throw new Error(`Dokumen CP Lama 2025 tidak lengkap: ${value.records.length}/40.`);
          return value;
        })
        .catch((error) => { manifestPromise = null; throw error; });
    }
    return manifestPromise;
  }

  async function getChunk(record) {
    const name = record.previewChunk;
    if (window.PAIBP_CP2025_V48_CHUNKS?.[name]?.previews) return window.PAIBP_CP2025_V48_CHUNKS[name];
    await loadScript(record.chunkScript, () => Boolean(window.PAIBP_CP2025_V48_CHUNKS?.[name]?.previews));
    const chunk = window.PAIBP_CP2025_V48_CHUNKS?.[name];
    if (!chunk?.previews) throw new Error(`Data pratinjau ${name} tidak valid.`);
    return chunk;
  }

  function teacherPanel() { return $("#panel-teacher") || $(".teacher-panel-v29"); }
  function preview() { return $("#teacher-document"); }
  function gradeFilter() { return $("#teacher-grade-filter", teacherPanel()); }

  function activeGrade() {
    return $('[data-teacher-grade][aria-pressed="true"]', teacherPanel())?.dataset.teacherGrade || grade || "VIII";
  }
  function activeDoc() {
    return $('[data-teacher-doc][aria-pressed="true"]', teacherPanel())?.dataset.teacherDoc || doc || "cp";
  }

  function categoryForDoc(value) {
    return ({
      cp:"atp", atp:"atp", kktp:"kktp", prota:"prota", promes:"promes",
      calendar:"calendar", effective:"effective", module:"module",
    })[value] || "";
  }

  function recordsFor(manifest, gradeValue, docValue) {
    const category = categoryForDoc(docValue);
    if (!category) return [];
    return manifest.records.filter((record) => {
      if (record.category !== category) return false;
      if (record.grade === "FASE D") return true;
      if (record.grade === gradeValue) return true;
      if (record.grade === "VII-VIII" && ["VII", "VIII"].includes(gradeValue)) return true;
      return false;
    });
  }

  function setPressed() {
    $$('[data-teacher-grade]', teacherPanel()).forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.teacherGrade === grade)));
    $$('[data-teacher-doc]', teacherPanel()).forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.teacherDoc === doc)));
    $$('[data-v48-cp-mode]').forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.v48CpMode === mode)));
    const panel = teacherPanel();
    if (panel) panel.dataset.curriculumMode = mode;
  }

  function loading(message = "Menyiapkan CP Lama 2025") {
    const target = preview();
    if (!target) return;
    target.innerHTML = `<section class="v48-cp-loading"><span></span><strong>${escapeHtml(message)}</strong><p>Memuat dokumen yang dipilih tanpa membongkar paket besar.</p></section>`;
  }

  function runStyle(run) {
    const styles = [];
    if (run.bold) styles.push("font-weight:800");
    if (run.italic) styles.push("font-style:italic");
    if (run.underline) styles.push("text-decoration:underline");
    if (run.color && /^[0-9A-F]{6}$/i.test(run.color)) styles.push(`color:#${run.color}`);
    if (run.sizePt && Number(run.sizePt) <= 36) styles.push(`font-size:${Math.max(8, Number(run.sizePt))}pt`);
    if (run.font) styles.push(`font-family:${JSON.stringify(String(run.font))},Arial,sans-serif`);
    return styles.join(";");
  }

  function renderRuns(runs, fallback) {
    if (!Array.isArray(runs) || !runs.length) return escapeHtml(fallback || "");
    return runs.map((run) => `<span style="${escapeHtml(runStyle(run))}">${escapeHtml(run.text || "")}</span>`).join("");
  }

  function renderBlocks(blocks) {
    return (blocks || []).map((block) => {
      if (!block || block.type === "blank") return `<div class="v48-doc-blank"></div>`;
      if (block.type === "paragraph") {
        const align = ["left","center","right","justify"].includes(block.alignment) ? block.alignment : "left";
        return `<p class="v48-doc-paragraph" style="text-align:${align}">${renderRuns(block.runs, block.text)}</p>`;
      }
      if (block.type === "table") {
        return `<div class="v48-table-scroll"><table class="v48-source-table"><tbody>${(block.rows || []).map((row) => `<tr>${(row || []).map((cell) => {
          if (!cell || cell.covered) return "";
          const rowspan = Number(cell.rowspan) > 1 ? ` rowspan="${Number(cell.rowspan)}"` : "";
          const colspan = Number(cell.colspan) > 1 ? ` colspan="${Number(cell.colspan)}"` : "";
          return `<td${rowspan}${colspan}>${renderBlocks(cell.blocks) || escapeHtml(cell.text || "")}</td>`;
        }).join("")}</tr>`).join("")}</tbody></table></div>`;
      }
      return "";
    }).join("");
  }

  function renderExcel(payload) {
    const sheets = payload.sheets || [];
    return `<div class="v48-sheet-tabs">${sheets.map((sheet, index) => `<button type="button" data-v48-sheet="${index}" aria-pressed="${index === 0}">${escapeHtml(sheet.name || `Sheet ${index + 1}`)}</button>`).join("")}</div>
      <div>${sheets.map((sheet, index) => `<section data-v48-sheet-page="${index}" ${index ? "hidden" : ""}><div class="v48-sheet-meta"><strong>${escapeHtml(sheet.name)}</strong><span>${escapeHtml(sheet.range || "")} • ${Number(sheet.rows || 0)} baris × ${Number(sheet.cols || 0)} kolom</span></div><div class="v48-table-scroll"><table class="v48-excel-table"><tbody>${(sheet.values || []).map((row, r) => `<tr>${(row || []).map((value, c) => `<td${sheet.formulas?.[r]?.[c] ? ` title="Rumus: ${escapeHtml(sheet.formulas[r][c])}"` : ""}>${escapeHtml(value ?? "")}</td>`).join("")}</tr>`).join("")}</tbody></table></div></section>`).join("")}</div>`;
  }

  function sourceUrl(record) { return new URL(record.sourceFile, document.baseURI).href; }

  async function cacheCurrent(record) {
    const target = preview();
    const status = $("[data-v48-cache-status]", target);
    try {
      if (!("caches" in window)) throw new Error("Browser tidak mendukung penyimpanan luring.");
      const cache = await caches.open("paibp-smart-cp2025-v48");
      await Promise.all([
        cache.add(asset("cp2025-manifest-v48.js")),
        cache.add(asset(record.chunkScript)),
        cache.add(sourceUrl(record)),
      ]);
      if (status) status.textContent = "✓ Dokumen dan pratinjau ini sudah tersedia luring.";
    } catch (error) {
      if (status) status.textContent = error?.message || "Penyimpanan luring gagal.";
    }
  }

  async function renderRecord(record, records) {
    loading(`Membuka ${record.title}`);
    const target = preview();
    try {
      const chunk = await getChunk(record);
      const key = `${record.id}.json`;
      const payload = chunk.previews?.[key] || chunk.previews?.[record.preview?.split("/").pop()];
      if (!payload) throw new Error(`Pratinjau ${record.title} tidak ditemukan.`);
      const body = record.format === "xlsx" ? renderExcel(payload)
        : `${(payload.headers || []).map((item) => `<header class="v48-doc-header">${renderBlocks(item.blocks)}</header>`).join("")}<article class="v48-source-document">${renderBlocks(payload.blocks)}</article>${(payload.footers || []).map((item) => `<footer class="v48-doc-footer">${renderBlocks(item.blocks)}</footer>`).join("")}`;
      target.innerHTML = `<section class="v48-cp-head"><div><span>CP LAMA 2025 • REFERENSI NASIONAL</span><h2>${escapeHtml(record.title)}</h2><p>BSKAP Nomor 046/H/KR/2025 • Kelas ${escapeHtml(grade)} • ${escapeHtml(record.originalName)}</p></div><div><a href="${escapeHtml(sourceUrl(record))}" download="${escapeHtml(record.originalName)}">Unduh ${escapeHtml(record.format.toUpperCase())}</a><button type="button" data-v48-cache>Simpan luring</button></div></section>
        ${records.length > 1 ? `<label class="v48-record-select"><span>Pilih dokumen</span><select data-v48-record>${records.map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === record.id ? "selected" : ""}>${escapeHtml(item.title)}</option>`).join("")}</select></label>` : ""}
        <section class="v48-integrity"><span>✓ Isi dan tabel dimuat utuh</span><span>✓ Berkas asli dapat diunduh langsung</span><span>✓ SHA-256 terverifikasi</span><small>${escapeHtml(record.sha256)}</small></section>
        ${body}
        <section class="v48-source-actions"><strong>Dokumen referensi nasional</strong><p>Pratinjau ditampilkan langsung tanpa JSZip dan tanpa paket Base64. Berkas sumber baru dimuat ketika diunduh atau disimpan luring.</p><a href="${escapeHtml(sourceUrl(record))}" download="${escapeHtml(record.originalName)}">Unduh ${escapeHtml(record.originalName)}</a><small data-v48-cache-status aria-live="polite"></small></section>`;
      selectedRecord = record.id;
      $("[data-v48-record]", target)?.addEventListener("change", (event) => {
        const next = records.find((item) => item.id === event.target.value);
        if (next) renderRecord(next, records);
      });
      $("[data-v48-cache]", target)?.addEventListener("click", () => cacheCurrent(record));
      $$('[data-v48-sheet]', target).forEach((button) => button.addEventListener("click", () => {
        $$('[data-v48-sheet]', target).forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        $$('[data-v48-sheet-page]', target).forEach((page) => { page.hidden = page.dataset.v48SheetPage !== button.dataset.v48Sheet; });
      }));
    } catch (error) {
      target.innerHTML = `<section class="v48-cp-error"><strong>CP Lama 2025 belum dapat dibuka.</strong><p>${escapeHtml(error?.message || "Data gagal dimuat.")}</p><button type="button" data-v48-retry>Coba lagi</button></section>`;
      $("[data-v48-retry]", target)?.addEventListener("click", () => renderCp2025());
    }
  }

  async function renderCp2025() {
    const target = preview();
    if (!target) return;
    grade = activeGrade();
    doc = activeDoc();
    setPressed();
    if (["access", "submissions"].includes(doc)) return;
    loading();
    try {
      const manifest = await getManifest();
      const records = recordsFor(manifest, grade, doc);
      if (!records.length) {
        target.innerHTML = `<section class="v48-empty"><strong>Dokumen belum tersedia untuk pilihan ini.</strong><p>Pilih jenis perangkat lain pada menu kiri.</p></section>`;
        return;
      }
      const record = records.find((item) => item.id === selectedRecord) || records[0];
      await renderRecord(record, records);
    } catch (error) {
      target.innerHTML = `<section class="v48-cp-error"><strong>CP Lama 2025 gagal dimuat.</strong><p>${escapeHtml(error?.message || "Data belum tersedia.")}</p><button type="button" data-v48-retry>Coba lagi</button></section>`;
      $("[data-v48-retry]", target)?.addEventListener("click", () => { manifestPromise = null; renderCp2025(); });
    }
  }

  function restore2026() {
    mode = "2026";
    localStorage.setItem(MODE_KEY, mode);
    setPressed();
    const gradeButton = $(`[data-teacher-grade="${grade}"]`, teacherPanel());
    const docButton = $(`[data-teacher-doc="${doc}"]`, teacherPanel());
    setTimeout(() => {
      gradeButton?.click();
      setTimeout(() => docButton?.click(), 40);
    }, 20);
  }

  function buildSelector(panel) {
    if (!panel) return;
    const filter = gradeFilter();
    const row = filter?.closest(".filter-row") || filter?.parentElement;
    if (!row) return;
    $(".v40-cp-selector", row)?.remove();
    $(".v48-cp-selector", row)?.remove();
    const selector = document.createElement("div");
    selector.className = "v48-cp-selector";
    selector.innerHTML = `<span>Versi Capaian Pembelajaran</span><div><button type="button" data-v48-cp-mode="2025">CP Lama 2025<small>BSKAP 046/H/KR/2025</small></button><button type="button" data-v48-cp-mode="2026">CP Terbaru 2026<small>BKPDM 020 Tahun 2026</small></button></div>`;
    row.classList.add("v48-cp-filter-row");
    row.append(selector);
    selector.addEventListener("click", (event) => {
      const button = event.target.closest("[data-v48-cp-mode]");
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      mode = button.dataset.v48CpMode;
      localStorage.setItem(MODE_KEY, mode);
      setPressed();
      if (mode === "2025") renderCp2025(); else restore2026();
    });
    setPressed();
  }

  function panelClick(event) {
    const gradeButton = event.target.closest("[data-teacher-grade]");
    const docButton = event.target.closest("[data-teacher-doc]");
    if (gradeButton) grade = gradeButton.dataset.teacherGrade || grade;
    if (docButton) doc = docButton.dataset.teacherDoc || doc;
    if (mode !== "2025" || (!gradeButton && !docButton)) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    setPressed();
    selectedRecord = "";
    renderCp2025();
  }

  function connect(panel) {
    if (!panel || connectedPanel === panel) return;
    panelObserver?.disconnect();
    connectedPanel = panel;
    grade = activeGrade();
    doc = activeDoc();
    buildSelector(panel);
    panel.addEventListener("click", panelClick, true);
    panelObserver = new MutationObserver((records) => {
      if (records.some((record) => [...record.addedNodes].some((node) => node instanceof Element && (node.matches?.("#teacher-grade-filter,.filter-row") || node.querySelector?.("#teacher-grade-filter"))))) {
        buildSelector(panel);
      }
    });
    panelObserver.observe(panel, { childList: true, subtree: true });
    if (mode === "2025") renderCp2025();
  }

  function initialize() {
    const panel = teacherPanel();
    if (panel) { connect(panel); return; }
    connectionObserver = new MutationObserver(() => {
      const found = teacherPanel();
      if (found) { connectionObserver.disconnect(); connect(found); }
    });
    connectionObserver.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => connectionObserver?.disconnect(), 20000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
