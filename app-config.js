window.PAIBP_CONFIG = Object.freeze({
  syncEndpoint: "https://script.google.com/macros/s/AKfycbyRxOw6oWDZUuQxwuqOMRO92KOwqOGF_9J6rPzSfxr9Dqy9kAQGJ9qZA6Tm_deUOgtjKg/exec",
  syncReadKey: "b082937b2165453ba7d9f81ecac063b00310b339ec0643da",
  aiEndpoint: "https://script.google.com/macros/s/AKfycbyRxOw6oWDZUuQxwuqOMRO92KOwqOGF_9J6rPzSfxr9Dqy9kAQGJ9qZA6Tm_deUOgtjKg/exec",
  aiPublicToken: "7382e2e6784d413fa2c0b8175766058cfa8da581f1ca4143",
  realtimeEnabled: true,
  aiEnabled: true,
  realtimeManagedBy: "v54-final-system",
  realtimeEndpoint: "",
  realtimeReadKey: "",
});

(() => {
  "use strict";
  const VERSION = "54";
  const pathOf = (value) => {
    try { return new URL(value, document.baseURI).pathname; }
    catch { return String(value || "").split("?")[0]; }
  };
  const exists = (selector, path, prop) =>
    [...document.querySelectorAll(selector)].some((node) => pathOf(node[prop]) === pathOf(path));
  const addStyle = (path) => {
    if (exists('link[rel="stylesheet"]', path, "href")) return;
    const node = document.createElement("link");
    node.rel = "stylesheet";
    node.href = new URL(`${path}?v=${VERSION}`, document.baseURI).href;
    document.head.append(node);
  };
  const addScript = (path) => {
    if (exists("script[src]", path, "src")) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const node = document.createElement("script");
      node.src = new URL(`${path}?v=${VERSION}`, document.baseURI).href;
      node.defer = true;
      node.onload = resolve;
      node.onerror = reject;
      document.head.append(node);
    });
  };

  [
    "cp2025-v48.css",
    "spensus-ai-v48.css",
    "realtime-v43.css",
    "realtime-v48.css",
    "final-ui-v54.css"
  ].forEach(addStyle);

  addScript("cp2025-loader-v48.js").catch(() => {});
  addScript("learning-guard-v48.js").catch(() => {});
  addScript("realtime-v43.js").catch(() => {});
  addScript("realtime-v54.js").catch(() => {});
  addScript("cp2025-exact-v54.js").catch(() => {});
  addScript("spensus-ai-v54-patch.js").catch(() => {});
  addScript("final-ui-v54.js").catch(() => {});

  if (localStorage.getItem("paibp-smart-v54-cache-reset") !== "done") {
    setTimeout(async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(
          keys
            .filter((key) => /paibp-smart/i.test(key) && !/v54/.test(key))
            .map((key) => caches.delete(key))
        );
        localStorage.setItem("paibp-smart-v54-cache-reset", "done");
        const registration = await navigator.serviceWorker?.getRegistration?.();
        registration?.update?.().catch(() => {});
      } catch {}
    }, 350);
  }
})();