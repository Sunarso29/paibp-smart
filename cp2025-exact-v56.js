(() => {
  "use strict";
  const VERSION = "56";
  const MANIFEST = "cp2025-manifest-v47.json";
  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];
  const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const norm = (value) => clean(value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  let records = [];
  let timer = 0;

  async function loadManifest() {
    if (records.length) return records;
    const response = await fetch(`${MANIFEST}?v=${VERSION}`, {cache:"no-store"});
    if (!response.ok) throw new Error(`Manifest gagal dimuat (${response.status}).`);
    const json = await response.json();
    records = Array.isArray(json.records) ? json.records : [];
    return records;
  }

  function visibleTitle(root) {
    const candidates = [
      $("[data-cp-record][aria-pressed='true'],[data-cp-id][aria-pressed='true'],.v48-cp-record[aria-pressed='true']"),
      $(".v48-source-title,.v48-cp-title,.document-title,[data-document-title],h1,h2,h3", root)
    ].filter(Boolean);
    return candidates.map((node) => clean(node.textContent)).find((text) => text.length > 4 && !/cp lama 2025|perangkat guru|pratinjau/i.test(text)) || "";
  }

  function bestRecord(title) {
    const key = norm(title);
    const words = key.split(" ").filter((word) => word.length > 2);
    return records.map((record) => {
      const source = `${norm(record.title)} ${norm(record.originalName)}`;
      const exact = source.includes(key) || key.includes(norm(record.title));
      const score = (exact ? 100 : 0) + words.reduce((sum, word) => sum + (source.includes(word) ? 1 : 0), 0);
      return {record, score};
    }).sort((a, b) => b.score - a.score)[0]?.record || null;
  }

  function sourceUrl(record) {
    return new URL(record.file, document.baseURI).href;
  }

  function viewerUrl(record, provider) {
    const source = sourceUrl(record);
    if (String(record.format).toLowerCase() === "pdf") return source;
    if (provider === "google") return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(source)}`;
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(source)}`;
  }

  function sanitizeQuickPreview(root) {
    $$(".v48-source-table,.v48-excel-table", root).forEach((table) => {
      const rows = $$("tr", table);
      rows.forEach((row) => {
        const cells = $$("td,th", row);
        if (cells.length && cells.every((cell) => !clean(cell.textContent) && !$("img,input,select,textarea", cell))) row.hidden = true;
      });
      $$("td,th", table).forEach((cell) => {
        cell.style.removeProperty("color");
        cell.querySelectorAll("[style]").forEach((node) => node.style.removeProperty("color"));
      });
    });
  }

  function enhance() {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const root = $("#teacher-document");
      if (!root) return;
      try {
        await loadManifest();
        const record = bestRecord(visibleTitle(root));
        if (!record) return;

        $(".v55-exact-toolbar", root)?.remove();
        $(".v55-exact-viewer", root)?.remove();
        root.classList.remove("v55-exact-active");
        sanitizeQuickPreview(root);

        let toolbar = $(".v56-exact-toolbar", root);
        if (!toolbar) {
          toolbar = document.createElement("div");
          toolbar.className = "v56-exact-toolbar";
          root.prepend(toolbar);
        }

        const source = sourceUrl(record);
        toolbar.innerHTML = `
          <button type="button" data-v56-fast>Tampilan Cepat</button>
          <button type="button" data-v56-online>Pratinjau Online</button>
          <a href="${source}" target="_blank" rel="noopener">Buka Berkas Referensi</a>
          <a href="${source}" download>Unduh Dokumen Referensi</a>
          <span>${clean(record.originalName || record.title)}</span>`;

        const showFast = () => {
          root.classList.remove("v56-exact-active");
          $(".v56-exact-viewer", root)?.remove();
          sanitizeQuickPreview(root);
        };

        const showOnline = (provider = "office") => {
          let viewer = $(".v56-exact-viewer", root);
          if (!viewer) {
            viewer = document.createElement("section");
            viewer.className = "v56-exact-viewer";
            root.append(viewer);
          }
          if (!navigator.onLine) {
            viewer.innerHTML = `<div class="v56-viewer-fallback"><div><strong>Pratinjau online memerlukan internet.</strong><p>Gunakan Tampilan Cepat, Buka Berkas Referensi, atau Unduh Dokumen Referensi.</p></div></div>`;
          } else {
            viewer.innerHTML = `<div class="v56-viewer-switch"><button type="button" data-provider="office">Microsoft</button><button type="button" data-provider="google">Google</button></div><iframe title="Pratinjau dokumen sumber" src="${viewerUrl(record, provider)}" loading="eager"></iframe>`;
            $$("[data-provider]", viewer).forEach((button) => button.addEventListener("click", () => {
              const frame = $("iframe", viewer);
              if (frame) frame.src = viewerUrl(record, button.dataset.provider);
            }));
          }
          root.classList.add("v56-exact-active");
        };

        $("[data-v56-fast]", toolbar).onclick = showFast;
        $("[data-v56-online]", toolbar).onclick = () => showOnline("office");
        showFast();
      } catch (error) {
        console.warn("CP 2025 V56", error);
      }
    }, 160);
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-teacher-doc],.teacher-doc-menu button,.v48-cp-record,[data-cp-record],[data-cp-id]")) enhance();
  }, true);

  setTimeout(enhance, 350);
})();
