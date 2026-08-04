window.PAIBP_CONFIG = Object.freeze({
  syncEndpoint: "https://script.google.com/macros/s/AKfycbyRxOw6oWDZUuQxwuqOMRO92KOwqOGF_9J6rPzSfxr9Dqy9kAQGJ9qZA6Tm_deUOgtjKg/exec",
  syncReadKey: "b082937b2165453ba7d9f81ecac063b00310b339ec0643da",
  aiEndpoint: "https://script.google.com/macros/s/AKfycbyRxOw6oWDZUuQxwuqOMRO92KOwqOGF_9J6rPzSfxr9Dqy9kAQGJ9qZA6Tm_deUOgtjKg/exec",
  aiPublicToken: "7382e2e6784d413fa2c0b8175766058cfa8da581f1ca4143",
  realtimeEnabled: true,
  aiEnabled: true,
  realtimeManagedBy: "v47",
  realtimeEndpoint: "",
  realtimeReadKey: "",
});

(() => {
  "use strict";
  const VERSION = "47";
  const pathOf = (value) => {
    try { return new URL(value, document.baseURI).pathname; }
    catch { return String(value || "").split("?")[0]; }
  };
  const exists = (selector, path, property) => [...document.querySelectorAll(selector)]
    .some((node) => pathOf(node[property]) === pathOf(path));

  function addStyle(path) {
    if (exists('link[rel="stylesheet"]', path, "href")) return;
    const node = document.createElement("link");
    node.rel = "stylesheet";
    node.href = new URL(`${path}?v=${VERSION}`, document.baseURI).href;
    document.head.append(node);
  }

  function addScript(path) {
    if (exists('script[src]', path, "src")) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const node = document.createElement("script");
      node.src = new URL(`${path}?v=${VERSION}`, document.baseURI).href;
      node.defer = true;
      node.onload = resolve;
      node.onerror = reject;
      document.head.append(node);
    });
  }

  addStyle("learning-guard-v47.css");

  // Pengendali bab sangat kecil dan dipasang segera; tidak memakai loop atau observer seluruh halaman.
  addScript("learning-guard-v47.js").catch(() => {});

  // Rekap daring dimuat setelah tampilan utama sudah siap, kecuali pada halaman guru/editor.
  const privatePage = /(?:akses-guru|kendali-editor)\.html$/i.test(location.pathname);
  const loadRealtime = () => {
    addStyle("realtime-v43.css");
    addScript("realtime-v43.js").catch(() => {});
  };
  if (privatePage) loadRealtime();
  else if ("requestIdleCallback" in window) requestIdleCallback(loadRealtime, { timeout: 2500 });
  else setTimeout(loadRealtime, 1400);

  // Pembersihan cache lama dilakukan di belakang layar dan hanya sekali.
  if (localStorage.getItem("paibp-smart-cache-clean-v47") !== "done") {
    setTimeout(async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.filter((key) => /paibp-smart-(?:core|cp2025).*v(?:4[0-6]|3\d)/i.test(key)).map((key) => caches.delete(key)));
        localStorage.setItem("paibp-smart-cache-clean-v47", "done");
        navigator.serviceWorker?.getRegistration?.().then((registration) => registration?.update?.()).catch(() => {});
      } catch {}
    }, 1800);
  }
})();
