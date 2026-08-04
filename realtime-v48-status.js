(() => {
  "use strict";
  const CONFIG = window.PAIBP_CONFIG || {};
  const ENDPOINT = String(CONFIG.syncEndpoint || CONFIG.realtimeEndpoint || "").trim();
  const READ_KEY = String(CONFIG.syncReadKey || CONFIG.realtimeReadKey || "").trim();
  const CONFIGURED = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(ENDPOINT) && Boolean(READ_KEY);
  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];

  function jsonp(action, extra = {}, timeout = 9000) {
    return new Promise((resolve, reject) => {
      if (!CONFIGURED) { reject(new Error("Konfigurasi endpoint belum lengkap.")); return; }
      const callback = `paibpV48_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const node = document.createElement("script");
      let done = false;
      const finish = (error, value) => {
        if (done) return; done = true; clearTimeout(timer);
        try { delete window[callback]; } catch {}
        node.remove(); error ? reject(error) : resolve(value);
      };
      window[callback] = (value) => finish(null, value);
      const url = new URL(ENDPOINT);
      Object.entries({ action, callback, ...extra }).forEach(([key, value]) => url.searchParams.set(key, String(value ?? "")));
      node.src = url.href; node.async = true;
      node.onerror = () => finish(new Error("Google Apps Script tidak dapat dijangkau."));
      const timer = setTimeout(() => finish(new Error("Uji sambungan melewati batas waktu.")), timeout);
      document.head.append(node);
    });
  }

  function connectedCopy(root = document) {
    $$('[data-v43-sync-badge]', root).forEach((node) => {
      node.dataset.tone = "online";
      node.textContent = "Rekap lintas perangkat aktif";
      node.title = "Google Apps Script tersambung";
    });
    const editor = $("#v43-editor-sync", root);
    if (editor) {
      const strong = $("strong", editor); if (strong) strong.textContent = "Rekap lintas perangkat aktif";
      const paragraph = $("p", editor); if (paragraph) paragraph.textContent = "Spensus Terkini, tanggapan, statistik, pekerjaan, dan kebijakan bab tersinkron melalui Google Apps Script.";
    }
    $$('section,article,div', root).forEach((node) => {
      if (node.children.length > 18) return;
      const text = String(node.textContent || "").replace(/\s+/g, " ").trim();
      if (!/Mode lokal|belum real-time lintas perangkat|Google Apps Script belum dihubungkan|Integrasi belum dikonfigurasi/i.test(text)) return;
      if (node.dataset.v48RealtimeFixed === "yes") return;
      node.dataset.v48RealtimeFixed = "yes";
      const heading = $("h1,h2,h3,h4,strong", node);
      const paragraph = $("p", node);
      if (heading) heading.textContent = "Rekap lintas perangkat aktif";
      if (paragraph) paragraph.textContent = "Data portal tersinkron melalui Google Apps Script pada seluruh perangkat yang menggunakan tautan ini.";
      node.classList.add("v48-realtime-connected");
    });
  }

  function failureCopy(message) {
    $$('[data-v43-sync-badge]').forEach((node) => {
      node.dataset.tone = "error";
      node.textContent = "Sambungan perlu diperiksa";
      node.title = message;
    });
  }

  async function initialize() {
    if (!CONFIGURED) { failureCopy("app-config.js belum lengkap."); return; }
    try {
      const health = await jsonp("health");
      if (!health?.ok) throw new Error(health?.error || "Server tidak merespons dengan benar.");
      document.documentElement.dataset.realtimeV48 = "online";
      connectedCopy();
      const observer = new MutationObserver(() => connectedCopy());
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => observer.disconnect(), 15000);
    } catch (error) {
      document.documentElement.dataset.realtimeV48 = "error";
      failureCopy(error?.message || "Sambungan gagal.");
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
