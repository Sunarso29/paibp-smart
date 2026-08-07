(() => {
  "use strict";
  const BUILD = "82";
  const ROOT_SELECTOR = "#teacher-document";
  const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();

  const signaturePattern = /(?:^|\b)(?:Demak\s*,\s*Juli\s*2026|Mengetahui\s*,?|Kepala\s+SMP\s+Negeri|Guru\s+Mata\s+Pelajaran\s+PAI(?:\s+dan\s+Budi\s+Pekerti)?|NIP\.?\s*\d{8,})(?:$|\b)/i;

  function standardize(value) {
    let text = String(value ?? "");
    const rules = [
      [/Penyusun\s*:\s*Sunarso\s*,?\s*S\.?Pd\.?I\.?\s*,?\s*Gr\.?/gi, "Penyusun : Sunarso, S.Pd.I, Gr"],
      [/\b(?:Allah|Alloh)\s+(?:Swt|SWT)\.?/gi, "Alloh Subhanahu Wata'ala"],
      [/\bAllah\s+Subhanahu\s+Wata[’']?ala\b/gi, "Alloh Subhanahu Wata'ala"],
      [/\b(?:s[a]lat|sh[a]lat)\b/gi, "sholat"],
      [/\bz[i]kir\b/gi, "dzikir"],
      [/\bhusn[u]zan\b/gi, "husnudzon"],
      [/\bhad[i]s\b/gi, "hadits"],
      [/\bMuhammad\s+s[a]w\.?/gi, "Muhammad Sholallohu 'Alaihi Wasalam"],
      [/CP\s+LAMA\s+2025\s*•\s*SUMBER\s+ASLI/gi, "CP LAMA 2025 • REFERENSI NASIONAL"],
      [/Dokumen\s+sumber\s+asli/gi, "Dokumen referensi nasional"],
      [/Buka\s+Berkas\s+Asli/gi, "Buka Berkas Referensi"],
      [/Unduh\s+Dokumen\s+Asli/gi, "Unduh Dokumen Referensi"],
      [/berkas\s+asli/gi, "berkas referensi"],
      [/sumber\s+asli/gi, "referensi nasional"]
    ];
    for (const [pattern, replacement] of rules) text = text.replace(pattern, replacement);
    return text;
  }

  function removeSignatureAreas(root) {
    root.querySelectorAll(".v48-source-document p,.v48-source-document table,.v48-source-document .v48-table-scroll,.v48-doc-header,.v48-doc-footer").forEach((node) => {
      const text = clean(node.textContent);
      if (!text) return;
      if (signaturePattern.test(text)) {
        const wrap = node.matches("table") ? node.closest(".v48-table-scroll") : null;
        (wrap || node).remove();
      }
    });
  }

  function standardizeTextNodes(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const next = standardize(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    }
  }

  function removeEmptyTables(root) {
    root.querySelectorAll("tr").forEach((row) => {
      const meaningful = clean(row.textContent) || row.querySelector("img,input,select,textarea,button,svg");
      if (!meaningful) row.remove();
    });
    root.querySelectorAll("table").forEach((table) => {
      const meaningful = clean(table.textContent) || table.querySelector("img,input,select,textarea,button,svg");
      if (!meaningful || !table.querySelector("tr")) {
        const wrap = table.closest(".v48-table-scroll");
        (wrap || table).remove();
      }
    });
    root.querySelectorAll(".v48-table-scroll").forEach((wrap) => {
      if (!wrap.querySelector("table") || (!clean(wrap.textContent) && !wrap.querySelector("img,input,select,textarea,button,svg"))) wrap.remove();
    });
  }

  function removeResidualSignatureText(root) {
    root.querySelectorAll("p,div,span,td,th").forEach((node) => {
      if (node.children.length) return;
      const text = clean(node.textContent);
      if (signaturePattern.test(text)) node.remove();
    });
  }

  function sanitize(root) {
    if (!root || root.dataset.v82Sanitizing === "1") return;
    root.dataset.v82Sanitizing = "1";
    try {
      removeSignatureAreas(root);
      standardizeTextNodes(root);
      removeResidualSignatureText(root);
      removeEmptyTables(root);
      root.querySelectorAll("td,th").forEach((cell) => {
        if (!clean(cell.textContent) && !cell.querySelector("img,input,select,textarea,button,svg")) cell.setAttribute("aria-hidden", "true");
        else cell.removeAttribute("aria-hidden");
      });
      root.dataset.cp2025Clean = BUILD;
    } finally {
      root.dataset.v82Sanitizing = "0";
    }
  }

  let timer = 0;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(() => sanitize(document.querySelector(ROOT_SELECTOR)), 40);
  }

  function boot() {
    schedule();
    const bodyObserver = new MutationObserver(schedule);
    bodyObserver.observe(document.body, {childList:true, subtree:true});
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-teacher-doc],[data-v48-record],[data-v48-sheet],[data-v56-fast],[data-v56-online]")) schedule();
    }, true);
    window.PAIBP_CP2025_CLEANUP_V82 = Object.freeze({build:BUILD, sanitize:() => sanitize(document.querySelector(ROOT_SELECTOR)), standardize});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, {once:true});
  else boot();
})();
