(() => {
  "use strict";
  const BUILD = "88";
  const DOC_MAP = Object.freeze({cp:"CP",atp:"ATP",kktp:"KKTP",prota:"PROTA",promes:"PROMES"});
  const DATA = window.PAIBP_TEACHER_DOCS_V84C || {};
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

  function compact(value){ return String(value ?? "").replace(/\u00a0/g," ").replace(/\s+/g," ").trim(); }
  function legacyPreviewText(value){
    const text=compact(value);
    return /HUT\s+SMPN?\s*1\s+Kebonagung/i.test(text)
      || /HUT\s+Kabupaten\s+Demak/i.test(text)
      || /Tim\s+MGMP\s+PAI\s+SMP\s+Provinsi\s+Jateng/i.test(text)
      || /Tim\s+MGMP\s+PAI\s+SMP\s+Provinsi\s+Jawa\s+Tengah/i.test(text);
  }
  function formArtifact(value){ return /^(?:Top|Bottom)\s+of\s+Form$/i.test(compact(value)); }
  function signatureText(value){
    const text=compact(value);
    const know=/\bMengetahui\b/i.test(text);
    const head=/\bKepala\s+(?:SMP|Sekolah)\b/i.test(text);
    const teacher=/\bGuru\s+(?:PAIBP|Mata\s+Pelajaran)/i.test(text);
    const nip=/\bNIP\.?\s*\d/i.test(text);
    const dated=/\b(?:Susukan|Demak)\s+(?:Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+20\d{2}\b/i.test(text);
    return (know&&(head||teacher||nip)) || (head&&teacher) || (dated&&teacher&&nip);
  }
  function normalizePreviewText(value){
    let text=String(value ?? "");
    const lines=text.split(/\n/).map((line)=>{
      const clean=line.trim();
      if(/^Penyusun\s*:/i.test(clean)) return "Penyusun : Sunarso, S.Pd.I, Gr";
      if(/^Nama\s+Penyusun\s*:/i.test(clean)) return "Nama Penyusun : Sunarso, S.Pd.I, Gr";
      if(/^Satuan\s+Pendidikan\s*:/i.test(clean) && /Kebonagung/i.test(clean)) return "Satuan Pendidikan : SMP Negeri 1 Susukan";
      if(/^Nama\s+Sekolah\s*:/i.test(clean) && /Kebonagung/i.test(clean)) return "Nama Sekolah : SMP Negeri 1 Susukan";
      return line;
    });
    text=lines.join("\n");
    return text;
  }
  function suppressParagraph(value){ return formArtifact(value) || legacyPreviewText(value) || signatureText(value); }

  function paragraphParts(block) {
    return { text:block?.[1] ?? "", kind:block?.[2] || "p", align:block?.[3] || "" };
  }

  function renderParagraph(block) {
    const {text, kind, align} = paragraphParts(block);
    if(suppressParagraph(text)) return "";
    const safeText=normalizePreviewText(text);
    const style = align ? `text-align:${esc(align)};` : "";
    const cls = `v84-source-paragraph v84-${esc(kind)}`;
    return `<p class="${cls}" style="${style}">${esc(safeText).replace(/\n/g,"<br>")}</p>`;
  }

  function renderCell(cell, rowIndex) {
    const colIndex = Number(cell?.[0] || 0);
    const text = normalizePreviewText(cell?.[1] ?? "");
    const span = Math.max(1, Number(cell?.[2] || 1));
    const spanAttr = span > 1 ? ` colspan="${span}"` : "";
    const headish = rowIndex < 3 ? " v84-head-cell" : "";
    return {
      colIndex,
      span,
      html:`<td class="v84-cell v84-col-${colIndex + 1}${headish}"${spanAttr}>${esc(text).replace(/\n/g,"<br>") || "&nbsp;"}</td>`
    };
  }

  function blankCell(colIndex, rowIndex) {
    const headish = rowIndex < 3 ? " v84-head-cell" : "";
    return `<td class="v84-cell v84-col-${colIndex + 1}${headish}">&nbsp;</td>`;
  }

  function rowText(row){
    return (Array.isArray(row)?row:[]).map((cell)=>String(cell?.[1] ?? "")).join(" ");
  }

  function renderTable(block, tableIndex) {
    const cols = Math.max(1, Number(block?.[1] || 1));
    const sourceRows = Array.isArray(block?.[2]) ? block[2] : [];
    const tableText=sourceRows.map(rowText).join(" ");
    if(signatureText(tableText)) return "";
    const filteredRows=sourceRows.filter((row)=>{
      const text=rowText(row);
      return !legacyPreviewText(text) && !signatureText(text) && !formArtifact(text);
    });
    if(!filteredRows.length) return "";
    const wide = cols >= 12 ? " v84-table-ultrawide" : cols >= 6 ? " v84-table-wide" : "";
    const rows = filteredRows.map((row, rowIndex) => {
      const sparse = Array.isArray(row) ? row.slice().sort((a,b)=>Number(a?.[0]||0)-Number(b?.[0]||0)) : [];
      let cursor = 0;
      let cells = "";
      sparse.forEach((sourceCell) => {
        const cell = renderCell(sourceCell, rowIndex);
        while (cursor < cell.colIndex && cursor < cols) {
          cells += blankCell(cursor, rowIndex);
          cursor += 1;
        }
        if (cursor >= cols) return;
        cells += cell.html;
        cursor = cell.colIndex + cell.span;
      });
      while (cursor < cols) {
        cells += blankCell(cursor, rowIndex);
        cursor += 1;
      }
      return `<tr class="v84-row v84-row-${rowIndex + 1}">${cells}</tr>`;
    }).join("");
    return `<div class="v84-table-scroll${wide}" data-cols="${cols}" data-table-index="${tableIndex}">
      <table class="v84-source-table"><tbody>${rows}</tbody></table>
    </div>`;
  }

  function renderBlocks(record) {
    let tableIndex = 0;
    const blocks = Array.isArray(record?.b) ? record.b : [];
    return blocks.map((block) => {
      if (block?.[0] === "t") return renderTable(block, tableIndex++);
      if (block?.[0] === "p") return renderParagraph(block);
      return "";
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
    if (!force && target.dataset.v84Signature === signature && target.querySelector("[data-v84-source]")) return true;

    rendering = true;
    try {
      target.dataset.v84Signature = signature;
      target.dataset.v84DocKind = sourceKey.toLowerCase();
      target.dataset.v84Grade = grade;
      target.innerHTML = `<section class="v84-source-document v84-doc-${sourceKey.toLowerCase()}" data-v84-source="${signature}">
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
      if (event.target.closest("[data-teacher-doc],[data-teacher-grade],[data-v48-cp-mode]")) schedule(true, 120);
    }, true);

    const target = $("#teacher-document");
    if (target) {
      new MutationObserver(() => {
        if (rendering) return;
        const docKey = activeDoc();
        if (!DOC_MAP[docKey]) return;
        if (docKey === "cp" && cp2025Active()) return;
        const signature = `${BUILD}:${activeGrade()}:${DOC_MAP[docKey]}`;
        if (target.dataset.v84Signature !== signature || !target.querySelector("[data-v84-source]")) schedule(false, 60);
      }).observe(target, {childList:true, subtree:false});
    }

    [250,700,1500,2600].forEach((ms) => setTimeout(() => schedule(false, 0), ms));
    window.PAIBP_TEACHER_DOCS_RUNTIME_V84 = Object.freeze({build:BUILD,render:()=>render(true),activeDoc,activeGrade});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, {once:true});
  else boot();
})();
