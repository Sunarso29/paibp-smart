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
      window.setTimeout(resolve, 650);
      return;
    }
    const script = document.createElement("script");
    script.src = new URL(path, document.baseURI).href;
    script.async = false;
    script.onload = resolve;
    script.onerror = reject;
    document.body.append(script);
  });

  addStyle("v38-upgrade.css?v=39");
  addStyle("v39-upgrade.css?v=41");
  addStyle("v40-upgrade.css?v=41");

  ensureScript("v38-upgrade.js?v=41", () => Boolean(document.querySelector(".v38-worship-button")))
    .then(() => ensureScript("v39-upgrade.js?v=41", () => document.documentElement.dataset.portalBuild === "39-quran-worship"))
    .then(() => ensureScript("v40-upgrade.js?v=41", () => document.documentElement.dataset.portalBuild === "40-quran-cp"))
    .catch(() => {
      document.documentElement.dataset.portalBuild = "40-partial";
    });

  document.documentElement.dataset.portalBuild = "41-loader";
})();
