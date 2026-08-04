window.PAIBP_CONFIG = Object.freeze({
  syncEndpoint: "https://script.google.com/macros/s/AKfycbyRxOw6oWDZUuQxwuqOMRO92KOwqOGF_9J6rPzSfxr9Dqy9kAQGJ9qZA6Tm_deUOgtjKg/exec",
  syncReadKey: "b082937b2165453ba7d9f81ecac063b00310b339ec0643da",
  aiEndpoint: "https://script.google.com/macros/s/AKfycbyRxOw6oWDZUuQxwuqOMRO92KOwqOGF_9J6rPzSfxr9Dqy9kAQGJ9qZA6Tm_deUOgtjKg/exec",
  aiPublicToken: "7382e2e6784d413fa2c0b8175766058cfa8da581f1ca4143",
  realtimeEnabled: true,
  aiEnabled: true,
  realtimeManagedBy: "v55-stable",
  realtimeEndpoint: "",
  realtimeReadKey: ""
});

(() => {
  "use strict";
  const VERSION = "55";
  const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const loaded = new Map();
  const pathOf = (value) => { try { return new URL(value, document.baseURI).pathname; } catch { return String(value || "").split("?")[0]; } };
  const exists = (selector, path, prop) => [...document.querySelectorAll(selector)].some((node) => pathOf(node[prop]) === pathOf(path));

  function style(path) {
    if (exists('link[rel="stylesheet"]', path, "href")) return;
    const node = document.createElement("link");
    node.rel = "stylesheet";
    node.href = new URL(`${path}?v=${VERSION}`, document.baseURI).href;
    document.head.append(node);
  }

  function script(path) {
    if (loaded.has(path)) return loaded.get(path);
    if (exists('script[src]', path, "src")) return Promise.resolve();
    const promise = new Promise((resolve, reject) => {
      const node = document.createElement("script");
      node.src = new URL(`${path}?v=${VERSION}`, document.baseURI).href;
      node.defer = true;
      node.onload = resolve;
      node.onerror = reject;
      document.head.append(node);
    });
    loaded.set(path, promise);
    return promise;
  }

  style("final-ui-v55.css");

  const boot = () => {
    script("realtime-v55.js").catch(() => {});
    script("final-ui-v55.js").catch(() => {});
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once:true });
  else boot();

  const teacherPage = /^(akses-guru|kendali-editor)\.html$/.test(page);
  const loadTeacher = () => {
    style("cp2025-v48.css");
    script("cp2025-loader-v48.js").then(() => script("cp2025-exact-v55.js")).catch(() => {});
  };
  if (teacherPage) setTimeout(loadTeacher, 250);

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-ai-open],.workspace-ai-nav-v27")) {
      style("spensus-ai-v48.css");
      script("spensus-ai-v55.js").catch(() => {});
    }
  }, { passive:true });

  if (localStorage.getItem("paibp-smart-v55-cache-reset") !== "done") {
    setTimeout(async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.filter((key) => /paibp-smart/i.test(key) && !/v55/.test(key)).map((key) => caches.delete(key)));
        localStorage.setItem("paibp-smart-v55-cache-reset", "done");
        const registration = await navigator.serviceWorker?.getRegistration?.();
        registration?.update?.().catch(() => {});
      } catch {}
    }, 900);
  }
})();
