(() => {
  "use strict";

  document.querySelectorAll("[data-year]").forEach((element) => {
    if (!element.textContent.trim()) element.textContent = new Date().getFullYear();
  });

  const assetPath = (value) => {
    try { return new URL(value, document.baseURI).pathname; }
    catch { return String(value || "").split("?")[0]; }
  };
  const findAsset = (selector, path, property) => [...document.querySelectorAll(selector)]
    .find((element) => assetPath(element[property]) === assetPath(path));
  const addStyle = (path) => {
    if (findAsset('link[rel="stylesheet"]', path, "href")) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL(path, document.baseURI).href;
    document.head.append(link);
  };
  const ensureScript = (path, readyCheck) => new Promise((resolve, reject) => {
    const existing = findAsset("script[src]", path, "src");
    if (existing) {
      if (readyCheck?.()) { resolve(); return; }
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      window.setTimeout(resolve, 1200);
      return;
    }
    const script = document.createElement("script");
    script.src = new URL(path, document.baseURI).href;
    script.async = false;
    script.onload = resolve;
    script.onerror = reject;
    document.body.append(script);
  });

  addStyle("v38-upgrade.css?v=46");
  addStyle("v39-upgrade.css?v=46");
  addStyle("v40-upgrade.css?v=46");
  addStyle("spensus-ai-v44.css?v=46");
  addStyle("learning-guard-v44.css?v=46");

  ensureScript("v38-upgrade.js?v=46", () => Boolean(document.querySelector(".v38-worship-button")))
    .then(() => ensureScript("v39-upgrade.js?v=46", () => document.documentElement.dataset.portalBuild === "39-quran-worship"))
    .then(() => ensureScript("v40-upgrade.js?v=46", () => document.documentElement.dataset.portalBuild === "46-quran-cp"))
    .then(() => ensureScript("learning-guard-v44.js?v=46", () => Boolean(document.querySelector("#v44-focus-gate"))))
    .catch(() => { document.documentElement.dataset.portalBuild = "46-partial"; });

  document.documentElement.dataset.portalBuild = "46-loader";
})();
