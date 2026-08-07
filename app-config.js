window.PAIBP_CONFIG = Object.freeze({
  syncEndpoint: "https://paibp-smart-api.sunarso29.workers.dev",
  syncReadKey: "b082937b2165453ba7d9f81ecac063b00310b339ec0643da",
  aiEndpoint: "https://script.google.com/macros/s/AKfycbyRxOw6oWDZUuQxwuqOMRO92KOwqOGF_9J6rPzSfxr9Dqy9kAQGJ9qZA6Tm_deUOgtjKg/exec",
  aiPublicToken: "7382e2e6784d413fa2c0b8175766058cfa8da581f1ca4143",
  realtimeEnabled: true,
  aiEnabled: true,
  realtimeManagedBy: "v79-quran-feature-restore-plus-v76-root-fix",
  realtimeEndpoint: "",
  realtimeReadKey: ""
});

(() => {
  "use strict";
  const VERSION = "79";
  const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const params = new URLSearchParams(location.search);
  const catLink = params.get("cat") === "1" || params.get("ps_cat") === "1";
  const loaded = new Map();
  window.__PAIBP_VERSION__ = VERSION;

  const pathOf = (value) => {
    try { return new URL(value, document.baseURI).pathname; }
    catch { return String(value || "").split("?")[0]; }
  };
  const exists = (selector, path, prop) => [...document.querySelectorAll(selector)]
    .some((node) => pathOf(node[prop]) === pathOf(path));

  function style(path) {
    if (exists('link[rel="stylesheet"]', path, "href")) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL(`${path}?v=${VERSION}`, document.baseURI).href;
    document.head.append(link);
  }

  function script(path) {
    if (loaded.has(path)) return loaded.get(path);
    if (exists('script[src]', path, "src")) return Promise.resolve(true);
    const promise = new Promise((resolve, reject) => {
      const node = document.createElement("script");
      node.src = new URL(`${path}?v=${VERSION}`, document.baseURI).href;
      node.async = false;
      node.onload = () => resolve(true);
      node.onerror = () => reject(new Error(`Gagal memuat ${path}`));
      document.head.append(node);
    });
    loaded.set(path, promise);
    return promise;
  }

  async function series(paths) {
    for (const path of paths) await script(path);
  }

  style("stable-v72.css");
  style("mobile-fix-v70.css");
  if (page === "index.html") {
    /* Pulihkan lapisan visual penuh warna yang dipakai pada V38/V39. */
    style("v38-upgrade.css");
    style("v39-upgrade.css");
  }

  function purgeLegacyClassState() {
    if (catLink) return;
    const keys = [
      "paibp-smart-cat-session-v56", "paibp-smart-class-context-v56",
      "paibp-smart-student-session-v59", "paibp-smart-student-session-v60",
      "paibp-smart-student-session-v61", "paibp-smart-student-session-v63",
      "paibp-smart-student-session-v65", "paibp-smart-student-session-v69",
      "paibp-smart-policy-cache-v59", "paibp-smart-policy-cache-v60",
      "paibp-smart-policy-cache-v61", "paibp-smart-policy-cache-v63",
      "paibp-smart-focus-session-v48", "paibp-smart-focus-session-v50"
    ];
    for (const store of [localStorage, sessionStorage]) {
      for (const key of keys) {
        try { store.removeItem(key); } catch {}
      }
    }
    const selectors = [
      "#v56-class-badge", "#v56-class-context", "#v59-class-context",
      "#v60-class-context", "#v61-class-context", "#v63-class-context",
      "[data-class-context]", "[class*='class-context']",
      "[class*='connected-class']", "[class*='kelas-terhubung']"
    ];
    selectors.forEach((selector) => document.querySelectorAll(selector).forEach((node) => node.remove()));
  }

  function menuShell() {
    const button = document.querySelector(".menu-btn");
    const nav = document.querySelector(".links");
    if (!button || !nav || button.dataset.v79) return;
    button.dataset.v79 = "1";
    button.addEventListener("click", (event) => {
      event.stopImmediatePropagation();
      const open = !nav.classList.contains("open");
      nav.classList.toggle("open", open);
      button.setAttribute("aria-expanded", String(open));
      button.textContent = open ? "×" : "☰";
    });
  }

  function setPortalMode(mode, role) {
    document.body.dataset.portalMode = mode;
    if (role) document.body.dataset.portalRole = role;
  }

  function panelTarget(name) {
    return document.getElementById(`panel-${name}`) || document.querySelector(`[data-panel="${name}"]`);
  }

  function openPanel(name) {
    const target = panelTarget(name);
    if (!target) return false;
    const role = ["student", "islamic", "games"].includes(name)
      ? "murid"
      : (document.body.dataset.portalRole || "umum");
    setPortalMode("active", role);
    document.querySelectorAll(".workspace-panel").forEach((panel) => { panel.hidden = panel !== target; });
    target.hidden = false;
    document.querySelectorAll(".workspace-role-nav [data-open-panel]").forEach((button) => {
      const active = button.dataset.openPanel === name;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const portal = document.getElementById("portal");
    if (portal) requestAnimationFrame(() => portal.scrollIntoView({ block: "start", behavior: "auto" }));
    return true;
  }

  function closeWorkspace() {
    setPortalMode("home", "umum");
    const welcome = panelTarget("welcome");
    document.querySelectorAll(".workspace-panel").forEach((panel) => { panel.hidden = panel !== welcome; });
    if (welcome) welcome.hidden = false;
    document.querySelectorAll(".workspace-role-nav [data-open-panel]").forEach((button) => {
      button.classList.remove("is-active");
      button.setAttribute("aria-pressed", "false");
    });
    const hero = document.querySelector(".hero,[data-home-only]");
    if (hero) requestAnimationFrame(() => hero.scrollIntoView({ block: "start", behavior: "auto" }));
  }

  let visualPromise = null;
  function ensureVisualRuntime() {
    if (page !== "index.html") return Promise.resolve(true);
    if (visualPromise) return visualPromise;
    visualPromise = (async () => {
      /* V38 membuat tombol Simulasi Ibadah; V39 memberi scene visual dan penyempurnaan warnanya. */
      await script("v38-upgrade.js");
      await script("v39-upgrade.js");
      document.documentElement.dataset.portalUi = "v39-colorful-restored";
      return true;
    })().catch((error) => {
      console.warn("PAIBP V79 visual runtime", error);
      visualPromise = null;
      return false;
    });
    return visualPromise;
  }

  let islamicLitePromise = null;
  function ensureIslamicLite() {
    if (islamicLitePromise) return islamicLitePromise;
    islamicLitePromise = script("islamic-lite-v73.js").catch((error) => {
      console.warn("PAIBP Islamic Lite", error);
      islamicLitePromise = null;
      return false;
    });
    return islamicLitePromise;
  }

  let workspaceCorePromise = null;
  async function loadWorkspaceCore() {
    if (window.__PAIBP_WORKSPACE_CORE_READY__) return true;
    if (workspaceCorePromise) return workspaceCorePromise;
    workspaceCorePromise = (async () => {
      await series([
        "content-data.js",
        "calendar-data.js",
        "islamic-data.js",
        "islamic-learning-data.js",
        "islamic-upgrade-v19.js",
        "islamic-upgrade-v20.js",
        "islamic-upgrade-v21.js",
        "islamic-upgrade-v22.js",
        "khutbah-source-data.js",
        "khutbah-verse-data.js",
        "hadith-data.js",
        "arabic-data.js",
        "assessment-data.js",
        "game-data.js",
        "video-data.js",
        "docx-export.js",
        "script.js"
      ]);
      await ensureVisualRuntime();
      /* Pengaman Quran Kemenag tetap dijalankan terakhir agar pemulihan V39 tidak mengganti sumber Quran yang sudah diamankan. */
      await ensureIslamicLite();
      /* Override pengalihan Quran lama: pembaca V78 membaca database lokal di repository. */
      await script("quran-kemenag-runtime-v78.js");
      window.__PAIBP_WORKSPACE_CORE_READY__ = true;
      return true;
    })().catch((error) => {
      workspaceCorePromise = null;
      console.error("PAIBP V79 workspace core", error);
      return false;
    });
    return workspaceCorePromise;
  }

  let catPromise = null;
  async function loadCat() {
    if (catPromise) return catPromise;
    style("cat-session-v65.css");
    catPromise = (async () => {
      await script("net-v71.js");
      await script("cat-session-v67.js");
      return true;
    })().catch((error) => {
      catPromise = null;
      console.warn("PAIBP CAT", error);
      return false;
    });
    return catPromise;
  }

  function openIslamicImmediately(button) {
    openPanel("islamic");
    button?.setAttribute("aria-busy", "true");
    Promise.all([ensureVisualRuntime(), loadWorkspaceCore()])
      .finally(() => button?.removeAttribute("aria-busy"))
      .then(() => {
        const active = document.querySelector('#panel-islamic [data-islamic-view][aria-pressed="true"]')
          || document.querySelector('#panel-islamic [data-islamic-view="home"]');
        active?.click();
      });
  }

  function shell() {
    menuShell();
    purgeLegacyClassState();
    document.querySelectorAll("[data-year]").forEach((node) => { node.textContent = new Date().getFullYear(); });

    document.addEventListener("click", (event) => {
      const close = event.target.closest("[data-close-workspace]");
      if (close) {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeWorkspace();
        return;
      }

      const button = event.target.closest("[data-open-panel]");
      if (!button) return;
      const name = button.dataset.openPanel;

      if (name === "islamic") {
        event.preventDefault();
        event.stopImmediatePropagation();
        openIslamicImmediately(button);
        return;
      }

      if (name === "student" || name === "games") return;
      event.preventDefault();
      openPanel(name);
    }, true);
  }

  function studentGameGate() {
    let busy = false;
    document.addEventListener("click", async (event) => {
      const button = event.target.closest('[data-open-panel="student"],[data-open-panel="games"]');
      if (!button || busy) return;
      const name = button.dataset.openPanel;
      event.preventDefault();
      event.stopImmediatePropagation();
      openPanel(name);
      if (window.__PAIBP_WORKSPACE_CORE_READY__) return;
      busy = true;
      button.setAttribute("aria-busy", "true");
      const jobs = [loadWorkspaceCore()];
      if (name === "student" || catLink) jobs.push(loadCat());
      await Promise.all(jobs);
      button.removeAttribute("aria-busy");
      busy = false;
    }, true);
  }

  function init() {
    shell();
    if (page === "about-spensus.html") return;

    if (/^(akses-guru|kendali-editor)\.html$/.test(page)) {
      script("teacher-cat-v72.js").catch(() => {});
      return;
    }

    if (page === "index.html") {
      /* Tampilan berwarna dan Simulasi Ibadah dipulihkan tanpa menunggu pengguna membuka panel. */
      ensureVisualRuntime();
      studentGameGate();
      if (catLink) {
        setPortalMode("active", "murid");
        Promise.all([loadCat(), loadWorkspaceCore()]).catch(() => {});
      }
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();

  setTimeout(purgeLegacyClassState, 350);
  setTimeout(purgeLegacyClassState, 1200);
})();
