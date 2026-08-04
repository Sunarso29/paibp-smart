(() => {
  "use strict";
  const VERSION = "47";
  document.querySelectorAll("[data-year]").forEach((element) => {
    if (!element.textContent.trim()) element.textContent = new Date().getFullYear();
  });

  const assetPath = (value) => {
    try { return new URL(value, document.baseURI).pathname; }
    catch { return String(value || "").split("?")[0]; }
  };
  const hasAsset = (selector, path, property) => [...document.querySelectorAll(selector)]
    .some((element) => assetPath(element[property]) === assetPath(path));

  function addStyle(path) {
    if (hasAsset('link[rel="stylesheet"]', path, "href")) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL(`${path}?v=${VERSION}`, document.baseURI).href;
    document.head.append(link);
  }

  function addScript(path, readyCheck) {
    if (readyCheck?.()) return Promise.resolve();
    const existing = [...document.querySelectorAll('script[src]')]
      .find((node) => assetPath(node.src) === assetPath(path));
    if (existing) return new Promise((resolve) => {
      existing.addEventListener("load", resolve, { once: true });
      setTimeout(resolve, 800);
    });
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = new URL(`${path}?v=${VERSION}`, document.baseURI).href;
      script.async = false;
      script.onload = resolve;
      script.onerror = reject;
      document.body.append(script);
    });
  }

  let upgradesPromise = null;
  function loadFeatureUpgrades() {
    if (upgradesPromise) return upgradesPromise;
    addStyle("v38-upgrade.css");
    addStyle("v39-upgrade.css");
    addStyle("v40-upgrade.css");
    addStyle("spensus-ai-v44.css");
    upgradesPromise = addScript("v38-upgrade.js", () => Boolean(document.querySelector(".v38-worship-button")))
      .then(() => addScript("v39-upgrade.js", () => document.documentElement.dataset.portalBuild === "39-quran-worship"))
      .then(() => addScript("v40-upgrade.js", () => document.documentElement.dataset.portalBuild === "47-quran-cp"))
      .then(() => { document.documentElement.dataset.portalBuild = "47-ready"; })
      .catch(() => { document.documentElement.dataset.portalBuild = "47-partial"; });
    return upgradesPromise;
  }

  window.PAIBP_LOAD_FEATURE_UPGRADES = loadFeatureUpgrades;
  document.documentElement.dataset.portalBuild = "47-light";

  const path = location.pathname.toLowerCase();
  if (/(?:fitur|akses-guru|kendali-editor)\.html$/.test(path)) {
    if ("requestIdleCallback" in window) requestIdleCallback(loadFeatureUpgrades, { timeout: 700 });
    else setTimeout(loadFeatureUpgrades, 120);
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest('[data-open-panel="teacher"],[data-open-panel="islamic"],a[href*="fitur.html"],a[href*="akses-guru.html"],a[href*="kendali-editor.html"]');
    if (trigger) loadFeatureUpgrades();
  }, { capture: true });
})();
