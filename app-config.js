window.PAIBP_CONFIG = Object.freeze({
  syncEndpoint: "https://script.google.com/macros/s/AKfycbyRxOw6oWDZUuQxwuqOMRO92KOwqOGF_9J6rPzSfxr9Dqy9kAQGJ9qZA6Tm_deUOgtjKg/exec",
  syncReadKey: "b082937b2165453ba7d9f81ecac063b00310b339ec0643da",
  aiEndpoint: "https://script.google.com/macros/s/AKfycbyRxOw6oWDZUuQxwuqOMRO92KOwqOGF_9J6rPzSfxr9Dqy9kAQGJ9qZA6Tm_deUOgtjKg/exec",
  aiPublicToken: "7382e2e6784d413fa2c0b8175766058cfa8da581f1ca4143",
  realtimeEnabled: true,
  aiEnabled: true,
  realtimeManagedBy: "v46",
  realtimeEndpoint: "",
  realtimeReadKey: "",
});

(() => {
  "use strict";
  const version = "46";
  const styles = ["realtime-v43.css", "spensus-ai-v44.css", "learning-guard-v44.css", "learning-guard-v46-fix.css"];
  const scripts = ["realtime-v43.js", "learning-guard-v46-fix.js"];
  const pathOf = (value) => { try { return new URL(value, document.baseURI).pathname; } catch { return String(value || "").split("?")[0]; } };
  const exists = (selector, path, prop) => [...document.querySelectorAll(selector)].some((item) => pathOf(item[prop]) === pathOf(path));
  styles.forEach((path) => {
    if (exists('link[rel="stylesheet"]', path, "href")) return;
    const node = document.createElement("link"); node.rel = "stylesheet"; node.href = new URL(`${path}?v=${version}`, document.baseURI).href; document.head.append(node);
  });
  scripts.forEach((path) => {
    if (exists('script[src]', path, "src")) return;
    const node = document.createElement("script"); node.src = new URL(`${path}?v=${version}`, document.baseURI).href; node.defer = true; document.head.append(node);
  });
})();
