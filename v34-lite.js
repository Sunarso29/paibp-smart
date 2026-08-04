(() => {
  "use strict";
  const VERSION = "48";
  document.querySelectorAll("[data-year]").forEach((node) => { if (!node.textContent.trim()) node.textContent = new Date().getFullYear(); });
  const pathOf = (value) => { try { return new URL(value, document.baseURI).pathname; } catch { return String(value || "").split("?")[0]; } };
  const exists = (selector, path, prop) => [...document.querySelectorAll(selector)].some((node) => pathOf(node[prop]) === pathOf(path));
  function style(path) { if (exists('link[rel="stylesheet"]', path, "href")) return; const node = document.createElement("link"); node.rel = "stylesheet"; node.href = new URL(`${path}?v=${VERSION}`, document.baseURI).href; document.head.append(node); }
  function script(path, ready) {
    if (ready?.()) return Promise.resolve();
    if (exists('script[src]', path, "src")) return Promise.resolve();
    return new Promise((resolve, reject) => { const node = document.createElement("script"); node.src = new URL(`${path}?v=${VERSION}`, document.baseURI).href; node.async = false; node.onload = resolve; node.onerror = reject; document.body.append(node); });
  }
  let islamicPromise = null;
  function loadIslamic() {
    if (islamicPromise) return islamicPromise;
    style("v38-upgrade.css"); style("v39-upgrade.css"); style("v40-upgrade.css");
    islamicPromise = script("v38-upgrade.js", () => Boolean(document.querySelector(".v38-worship-button")))
      .then(() => script("v39-upgrade.js", () => document.documentElement.dataset.portalBuild === "39-quran-worship"))
      .then(() => script("v40-upgrade.js", () => /^4[6-8]-quran-cp$/.test(document.documentElement.dataset.portalBuild || "")))
      .catch(() => {});
    return islamicPromise;
  }
  window.PAIBP_LOAD_FEATURE_UPGRADES = loadIslamic;
  document.documentElement.dataset.portalBuild = "48-light";
  document.addEventListener("click", (event) => {
    if (event.target.closest('[data-open-panel="islamic"],[data-islamic-view],a[href*="fitur.html"]')) loadIslamic();
  }, true);
  if (/fitur\.html$/i.test(location.pathname)) {
    if ("requestIdleCallback" in window) requestIdleCallback(loadIslamic, { timeout: 1000 }); else setTimeout(loadIslamic, 300);
  }
})();
