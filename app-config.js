window.PAIBP_CONFIG = Object.freeze({
  /*
   * PAIBP SMART SMP V45 — REKAP, SPENSUS AI, DAN KENDALI BAB
   *
   * API key OpenAI TIDAK BOLEH ditempel di file ini.
   */
  syncEndpoint: "https://script.google.com/macros/s/AKfycbyRxOw6oWDZUuQxwuqOMRO92KOwqOGF_9J6rPzSfxr9Dqy9kAQGJ9qZA6Tm_deUOgtjKg/exec",
  syncReadKey: "b082937b2165453ba7d9f81ecac063b00310b339ec0643da",
  aiEndpoint: "https://script.google.com/macros/s/AKfycbyRxOw6oWDZUuQxwuqOMRO92KOwqOGF_9J6rPzSfxr9Dqy9kAQGJ9qZA6Tm_deUOgtjKg/exec",
  aiPublicToken: "7382e2e6784d413fa2c0b8175766058cfa8da581f1ca4143",
  realtimeEnabled: true,
  aiEnabled: true,
  realtimeManagedBy: "v45",

  // Kompatibilitas lama — biarkan kosong agar tidak mengirim data ganda.
  realtimeEndpoint: "",
  realtimeReadKey: "",
});

(() => {
  "use strict";
  const version = "45";
  const assets = {
    styles: [
      "realtime-v43.css",
      "spensus-ai-v44.css",
      "learning-guard-v44.css",
      "learning-guard-v45-fix.css",
    ],
    scripts: [
      "realtime-v43.js",
      "learning-guard-v44.js",
      "learning-guard-v45-fix.js",
    ],
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