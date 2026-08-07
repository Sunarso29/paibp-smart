(() => {
  "use strict";
  const BUILD = "84";
  const DOC_MAP = Object.freeze({cp:"CP",atp:"ATP",kktp:"KKTP",prota:"PROTA",promes:"PROMES"});
  const DATA = window.PAIBP_TEACHER_DOCS_V84 || {};
  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  let rendering = false;
  let timer = 0;

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  })[ch]);

  function activeDoc() {
    return $('[data-teacher-doc][aria-pressed="true"]')?.dataset.teacherDoc || "cp";
  }

  function activeGrade() {
    return $('[data-teacher-grade][aria-pressed="true"]')?.dataset.teacherGrade || "VIII";
  }

  function cp2025Active() {
    return Boolean($('[data-v48-cp-mode="2025"][aria-pressed="true"]'));
  }

  function renderParagraph(block) {
    const kind = block.kind || "p";
    const align = block.align ? ` text-align:${esc(block.align)};` : "";
    const cls = `v84-source-paragraph v84-${esc(kind)}`;
    return `<p class="${cls}" style="${align}">${esc(block.text)}</p>`;
  }

  function renderCell(cell, rowIndex, colIndex) {
    const span = Number(cell.colspan || 1);
    const spanAttr = span > 1 ? ` colspan="${span}"` : "";
    const text = esc(cell.text).replace(/\n/g, "<br>");
    const headish = rowIndex < 3 ? " v84-head-cell" : "";
    return `<td class="v84-cell v84-col-${colIndex + 1}${headish}"${spanAttr}>${text || "&nbsp;"}</td>`;
  }

  function renderTable(block, tableIndex) {
    const cols = Number(block.cols || 1);
    const wide = cols >= 12 ? " v84-table-ultrawide" : cols >= 6 ? " v84-table-wide" : "";
    const rows = (block.rows || []).map((row, rowIndex) => {
      let logicalCol = 0;
      const cells = row.map((cell) => {
        const html = renderCell(cell, rowIndex, logicalCol);
        logicalCol += Number(cell.colspan || 1);
        return html;
      }).join("");
      return `<tr class="v84-row v84-row-${rowIndex + 1}">${cells}</tr>`;
    }).join("");
    return `<div class="v84-table-scroll${wide}" data-cols="${cols}" data-table-index="${tableIndex}">
      <table class="v84-source-table"><tbody>${rows}</tbody></table>
    </div>`;
  }

  function renderBlocks(record) {
    let tableIndex = 0;
    return (record.blocks || []).map((block) => {
      if (block.t === "table") return renderTable(block, tableIndex++);
      return renderParagraph(block);
    }).join("");
  }

  function render(force = false) {
    if (rendering) return false;
    const target = $("#teacher-document");
    if (!target) return false;
    const docKey = activeDoc();
    const sourceKey = DOC_MAP[docKey];
    if (!sourceKey) return false;
    if (docKey === "cp" && cp2025Active()) return false;

    const grade = activeGrade();
    const record = DATA?.[grade]?.[sourceKey];
    if (!record) return false;
    const signature = `${BUILD}:${grade}:${sourceKey}`;
    if (!force && target.dataset.v84Signature === signature) return true;

    rendering = true;
    try {
      target.dataset.v84Signature = signature;
      target.dataset.v84DocKind = sourceKey.toLowerCase();
      target.dataset.v84Grade = grade;
      target.innerHTML = `<section class="v84-source-document v84-doc-${sourceKey.toLowerCase()}" data-v84-source="${signature}"${docKey === "cp" ? ' data-cp2026-source="83"' : ""}>
        <div class="v84-source-body">${renderBlocks(record)}</div>
      </section>`;
      document.documentElement.dataset.teacherDocV84 = sourceKey.toLowerCase();
      return true;
    } finally {
      rendering = false;
    }
  }

  function schedule(force = false, delay = 80) {
    clearTimeout(timer);
    timer = setTimeout(() => render(force), delay);
  }

  function boot() {
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-teacher-doc],[data-teacher-grade],[data-v48-cp-mode]")) {
        schedule(true, 120);
      }
    }, true);

    const target = $("#teacher-document");
    if (target) {
      new MutationObserver(() => {
        if (rendering) return;
        const docKey = activeDoc();
        if (!DOC_MAP[docKey]) return;
        if (docKey === "cp" && cp2025Active()) return;
        const signature = `${BUILD}:${activeGrade()}:${DOC_MAP[docKey]}`;
        if (target.dataset.v84Signature !== signature || !target.querySelector("[data-v84-source]")) {
          schedule(false, 60);
        }
      }).observe(target, {childList:true, subtree:false});
    }

    [250,700,1500,2600].forEach((ms) => setTimeout(() => schedule(false, 0), ms));
    window.PAIBP_TEACHER_DOCS_RUNTIME_V84 = Object.freeze({
      build: BUILD,
      render: () => render(true),
      activeDoc,
      activeGrade
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, {once:true});
  else boot();
})();