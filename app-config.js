window.PAIBP_CONFIG = Object.freeze({
  /*
   * PAIBP SMART SMP V44 — REKAP, SPENSUS AI, DAN KENDALI BAB
   *
   * Setelah google-apps-script/Code.gs di-deploy sebagai Web App:
   * 1. Tempel URL /exec pada syncEndpoint.
   * 2. Tempel readKey hasil setup() pada syncReadKey.
   * 3. Tempel aiPublicToken hasil setup()/configureOpenAI() pada aiPublicToken.
   *
   * API key OpenAI TIDAK BOLEH ditempel di file ini. Simpan hanya melalui
   * fungsi configureOpenAI("sk-...") di Google Apps Script.
   */
 syncEndpoint: "https://script.google.com/macros/s/AKfycbyRxOw6oWDZUuQxwuqOMRO92KOwqOGF_9J6rPzSfxr9Dqy9kAQGJ9qZA6Tm_deUOgtjKg/exec",
syncReadKey: "b082937b2165453ba7d9f81ecac063b00310b339ec0643da",
aiEndpoint: "https://script.google.com/macros/s/AKfycbyRxOw6oWDZUuQxwuqOMRO92KOwqOGF_9J6rPzSfxr9Dqy9kAQGJ9qZA6Tm_deUOgtjKg/exec",
aiPublicToken: "7382e2e6784d413fa2c0b8175766058cfa8da581f1ca4143",
  realtimeEnabled: true,
  aiEnabled: true,
  realtimeManagedBy: "v44",

  // Kompatibilitas lama — biarkan kosong agar tidak mengirim data ganda.
  realtimeEndpoint: "",
  realtimeReadKey: "",
});

(() => {
  "use strict";
  const version = "44";
  const assets = {
    styles: ["realtime-v43.css", "spensus-ai-v44.css", "learning-guard-v44.css"],
    scripts: ["realtime-v43.js", "learning-guard-v44.js"],
  };
  const assetPath = (value) => {
    try { return new URL(value, document.baseURI).pathname; }
    catch { return String(value || "").split("?")[0]; }
  };
  const hasAsset = (selector, path, property) => [...document.querySelectorAll(selector)]
    .some((element) => assetPath(element[property]) === assetPath(path));

  assets.styles.forEach((path) => {
    if (hasAsset('link[rel="stylesheet"]', path, "href")) return;
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = new URL(`${path}?v=${version}`, document.baseURI).href;
    document.head.append(style);
  });

  assets.scripts.forEach((path) => {
    if (hasAsset("script[src]", path, "src")) return;
    const script = document.createElement("script");
    script.src = new URL(`${path}?v=${version}`, document.baseURI).href;
    script.defer = true;
    document.head.append(script);
  });
})();
