(() => {
  "use strict";
  const paibp = document.querySelector("#student-library");
  const lesson = document.querySelector("#lesson-viewer");
  const multimapel = document.querySelector("#student-multimapel-library");
  const buttons = [...document.querySelectorAll("[data-student-library-tab]")];
  if (!multimapel || !buttons.length) return;

  let loadingPromise = null;
  function script(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[data-lazy-src="${src}"]`)) { resolve(); return; }
      const node = document.createElement("script");
      node.src = `${src}?v=35`;
      node.dataset.lazySrc = src;
      node.onload = resolve;
      node.onerror = () => reject(new Error(`Gagal memuat ${src}`));
      document.body.appendChild(node);
    });
  }
  async function ensureMultimapel() {
    if (window.SPENSUS_MULTIMAPEL_CONTENT && multimapel.children.length) return;
    if (!loadingPromise) {
      multimapel.innerHTML = '<div class="multi-lazy-loading-v35"><span></span><strong>Menyiapkan 171 paket belajar…</strong><small>Basis data dimuat hanya ketika dibutuhkan agar beranda tetap ringan.</small></div>';
      loadingPromise = script("multimapel-data.js")
        .then(() => script("multimapel-content.js"))
        .then(() => script("multimapel-ui.js"))
        .catch((error) => {
          loadingPromise = null;
          multimapel.innerHTML = `<div class="multi-empty-v35"><strong>Paket belum dapat dimuat.</strong><p>${error.message}. Muat ulang halaman lalu coba kembali.</p></div>`;
          throw error;
        });
    }
    return loadingPromise;
  }
  function show(mode) {
    buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.studentLibraryTab === mode)));
    if (paibp) paibp.hidden = mode !== "paibp";
    if (lesson) lesson.hidden = true;
    multimapel.hidden = mode !== "multimapel";
  }
  buttons.forEach((button) => button.addEventListener("click", async () => {
    const mode = button.dataset.studentLibraryTab;
    show(mode);
    if (mode === "multimapel") {
      try { await ensureMultimapel(); } catch (_) {}
    }
  }));
})();
