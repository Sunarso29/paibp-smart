(() => {
  "use strict";

  const VERSION = "54";
  const CONFIG = window.PAIBP_CONFIG || {};
  const ENDPOINT = String(CONFIG.aiEndpoint || CONFIG.syncEndpoint || "").trim();
  const READ_KEY = String(CONFIG.syncReadKey || "").trim();
  const READY = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(ENDPOINT);
  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];
  const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();

  let timer = 0;
  let lastStatus = null;

  function jsonp(action, params = {}, timeout = 14000) {
    return new Promise((resolve, reject) => {
      if (!READY) {
        reject(new Error("Endpoint AI belum lengkap."));
        return;
      }
      const callback = `spensusV54_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement("script");
      const url = new URL(ENDPOINT);
      let done = false;
      const finish = (error, value) => {
        if (done) return;
        done = true;
        clearTimeout(timeoutId);
        try { delete window[callback]; } catch {}
        script.remove();
        error ? reject(error) : resolve(value);
      };
      window[callback] = (value) => finish(null, value);
      Object.entries({ action, callback, _v: Date.now(), ...params }).forEach(([key, value]) => {
        if (value !== "" && value != null) url.searchParams.set(key, String(value));
      });
      script.src = url.href;
      script.async = true;
      script.onerror = () => finish(new Error("Server Spensus AI tidak dapat dijangkau."));
      const timeoutId = setTimeout(() => finish(new Error("Pemeriksaan AI melewati batas waktu.")), timeout);
      document.head.append(script);
    });
  }

  function panel() {
    return $(".ai-drawer-panel-v27") || $(".spensus-ai-v48");
  }

  function ensureCard(root) {
    let card = $(".v54-ai-status-card", root);
    if (!card) {
      card = document.createElement("div");
      card.className = "v54-ai-status-card";
      const head = $(".ai-drawer-head-v27", root);
      head?.insertAdjacentElement("afterend", card) || root.prepend(card);
    }
    return card;
  }

  function replaceOfflineText(root, message) {
    const pattern = /spensus ai penuh belum aktif|mode luring hanya dapat mencari materi portal|api ai belum diaktifkan/i;
    $$("p,div,section", root).forEach((node) => {
      if (node.children.length > 12) return;
      if (!pattern.test(clean(node.textContent))) return;
      const paragraph = $("p", node) || node;
      paragraph.textContent = message;
    });
  }

  function apply(status) {
    lastStatus = status;
    const root = panel();
    if (!root) return;
    root.classList.add("v54-ai-mobile");

    const card = ensureCard(root);
    const state = $("[data-v48-ai-state]", root);
    const badge = $("[data-v48-mode]", root);

    if (status.aiConfigured) {
      const model = status.geminiModel || status.aiModel || status.model || "gemini-3.5-flash-lite";
      card.dataset.state = "online";
      card.innerHTML = `<strong>Spensus AI daring aktif</strong><span>${model} • pertanyaan umum, naskah, analisis, coding, dan konteks portal</span>`;
      if (state) state.textContent = `${model} • daring`;
      if (badge) {
        badge.textContent = "AI aktif";
        badge.dataset.tone = "online";
      }
      replaceOfflineText(
        root,
        "Spensus AI daring aktif. Ketik pertanyaan pada kolom bawah untuk memperoleh jawaban dari Gemini."
      );
      document.documentElement.dataset.aiV54 = "online";
    } else {
      card.dataset.state = status.error ? "error" : "offline";
      card.innerHTML = status.error
        ? `<strong>Server AI sedang diperiksa</strong><span>${status.error}</span>`
        : `<strong>Gemini belum aktif pada server</strong><span>Jalankan fungsi aktifkanSpensusAI pada Google Apps Script V54, lalu deploy Versi baru.</span>`;
      if (state) state.textContent = status.error ? "Sambungan AI perlu diperiksa" : "Gemini belum aktif";
      if (badge) {
        badge.textContent = status.error ? "Periksa" : "Belum aktif";
        badge.dataset.tone = "offline";
      }
      document.documentElement.dataset.aiV54 = status.error ? "error" : "offline";
    }

    const messages = $("[data-ai-messages],#spensus-ai-messages,.ai-drawer-messages-v27", root);
    if (messages) messages.scrollTop = messages.scrollHeight;
  }

  async function check() {
    clearTimeout(timer);
    try {
      const info = READ_KEY
        ? await jsonp("setupInfo", { readKey: READ_KEY })
        : await jsonp("health");
      apply({
        aiConfigured: Boolean(info?.aiConfigured),
        geminiModel: info?.geminiModel || info?.aiModel || info?.model || "",
        error: info?.ok === false ? (info.error || "Server mengembalikan kesalahan.") : ""
      });
    } catch (error) {
      apply({
        aiConfigured: false,
        geminiModel: "",
        error: error?.message || "Sambungan gagal."
      });
    } finally {
      timer = setTimeout(check, 30000);
    }
  }

  function observe() {
    const observer = new MutationObserver(() => {
      const root = panel();
      if (!root) return;
      root.classList.add("v54-ai-mobile");
      if (lastStatus) apply(lastStatus);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    observe();
    check();
    document.addEventListener("paibp-ai-status", (event) => {
      const detail = event.detail || {};
      apply({
        aiConfigured: Boolean(detail.aiConfigured),
        geminiModel: detail.model || detail.geminiModel || "",
        error: detail.error || ""
      });
    });
    window.addEventListener("online", check);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  window.PAIBP_AI_V54 = Object.freeze({
    version: VERSION,
    check,
    get status() { return lastStatus; }
  });
})();