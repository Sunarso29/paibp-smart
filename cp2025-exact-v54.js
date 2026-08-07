(() => {
  "use strict";

  const VERSION = "54";
  const MANIFEST_URL = "cp2025-manifest-v47.json";
  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];
  const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const normalize = (value) => clean(value)
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("id").replace(/[^a-z0-9]+/g, " ").trim();

  let records = [];
  let currentRecord = null;
  let observer = null;
  let timer = 0;

  async function loadManifest() {
    if (records.length) return records;
    const response = await fetch(`${MANIFEST_URL}?v=${VERSION}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Manifest CP 2025 gagal dimuat (${response.status}).`);
    const manifest = await response.json();
    records = Array.isArray(manifest.records) ? manifest.records : [];
    return records;
  }

  function currentTitle(root) {
    const activeControl = $(
      "[data-cp-record][aria-pressed='true'],[data-cp-id][aria-pressed='true']," +
      ".v48-cp-record[aria-pressed='true'],.teacher-doc-menu button[aria-pressed='true']"
    );
    const candidates = [
      activeControl,
      $(".v48-source-title", root),
      $(".v48-cp-title", root),
      $(".document-title", root),
      $("[data-document-title]", root),
      $("h1", root),
      $("h2", root),
      $("h3", root),
      $("strong", root)
    ].filter(Boolean);
    return candidates.map((node) => clean(node.textContent)).find((text) =>
      text.length > 4 && !/cp lama 2025|perangkat guru|pratinjau dokumen/i.test(text)
    ) || "";
  }

  function bestRecord(title) {
    const key = normalize(title);
    if (!key) return null;
    let exact = records.find((record) =>
      normalize(record.title) === key ||
      normalize(record.originalName) === key
    );
    if (exact) return exact;

    const words = key.split(" ").filter((word) => word.length > 2);
    return records
      .map((record) => {
        const text = `${normalize(record.title)} ${normalize(record.originalName)}`;
        const score = words.reduce((sum, word) => sum + (text.includes(word) ? 1 : 0), 0);
        return { record, score };
      })
      .filter((item) => item.score >= Math.max(2, Math.ceil(words.length * .45)))
      .sort((a, b) => b.score - a.score)[0]?.record || null;
  }

  function officeViewer(record) {
    const source = new URL(record.file, document.baseURI).href;
    const format = String(record.format || "").toLowerCase();
    if (format === "pdf") return source;
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(source)}`;
  }

  function ensureToolbar(root, record) {
    let toolbar = $(".v54-exact-toolbar", root);
    if (!toolbar) {
      toolbar = document.createElement("div");
      toolbar.className = "v54-exact-toolbar";
      root.prepend(toolbar);
    }
    const source = new URL(record.file, document.baseURI).href;
    toolbar.innerHTML = `
      <button type="button" data-v54-exact data-mode="exact">Pratinjau Asli</button>
      <button type="button" data-v54-fast data-mode="fast">Tampilan Cepat</button>
      <a href="${source}" download="${record.originalName || record.title}">Unduh Dokumen Referensi</a>
      <span>${record.originalName || record.title}</span>`;
    $("[data-v54-exact]", toolbar)?.addEventListener("click", () => showExact(root, record));
    $("[data-v54-fast]", toolbar)?.addEventListener("click", () => showFast(root));
    return toolbar;
  }

  function showExact(root, record) {
    let viewer = $(".v54-exact-viewer", root);
    if (!viewer) {
      viewer = document.createElement("section");
      viewer.className = "v54-exact-viewer";
      root.append(viewer);
    }
    if (!navigator.onLine) {
      viewer.innerHTML = `
        <div class="v54-viewer-message">
          <div>
            <strong>Pratinjau asli memerlukan koneksi internet.</strong>
            <p>Tampilan cepat lokal tetap tersedia dan dokumen asli dapat diunduh.</p>
          </div>
        </div>`;
    } else {
      viewer.innerHTML = `
        <iframe
          title="Pratinjau asli ${clean(record.title)}"
          src="${officeViewer(record)}"
          loading="eager"
          referrerpolicy="no-referrer"
          allow="clipboard-read; clipboard-write"
        ></iframe>`;
    }
    root.classList.add("v54-exact-active");
  }

  function showFast(root) {
    root.classList.remove("v54-exact-active");
    $(".v54-exact-viewer", root)?.remove();
  }

  async function enhance() {
    clearTimeout(timer);
    const root = $("#teacher-document");
    if (!root) return;

    try {
      await loadManifest();
      const title = currentTitle(root);
      const record = bestRecord(title);
      if (!record) return;
      if (currentRecord?.id === record.id && $(".v54-exact-toolbar", root)) return;
      currentRecord = record;
      ensureToolbar(root, record);

      // Untuk fidelitas tinggi, pratinjau asli menjadi pilihan utama saat daring.
      if (navigator.onLine && !root.dataset.v54ExactVisited) {
        root.dataset.v54ExactVisited = "yes";
        showExact(root, record);
      }
    } catch (error) {
      console.warn("CP 2025 V54:", error);
    }
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(enhance, 180);
  }

  function init() {
    const root = $("#teacher-document");
    if (root) {
      observer = new MutationObserver(schedule);
      observer.observe(root, { childList: true, subtree: true, characterData: true });
      schedule();
    }
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-teacher-doc],.teacher-doc-menu button,.v48-cp-record")) {
        setTimeout(schedule, 220);
      }
    }, true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();