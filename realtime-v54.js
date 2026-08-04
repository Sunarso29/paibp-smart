(() => {
  "use strict";

  const VERSION = "54";
  const CONFIG = window.PAIBP_CONFIG || {};
  const ENDPOINT = String(CONFIG.syncEndpoint || CONFIG.realtimeEndpoint || "").trim();
  const READ_KEY = String(CONFIG.syncReadKey || CONFIG.realtimeReadKey || "").trim();
  const CONFIGURED =
    CONFIG.realtimeEnabled !== false &&
    /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(ENDPOINT);

  const SESSION_KEY = "paibp-smart-realtime-session-v54";
  const QUEUE_KEY = "paibp-smart-realtime-queue-v54";
  const TEACHER_KEY = "paibp-smart-teacher-identity-v1";
  const STUDENT_KEY = "paibp-smart-student-identity-v1";
  const ACCESS_CONTEXT = "paibp-smart-access-context-v1";

  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];
  const parse = (value, fallback) => { try { return JSON.parse(value); } catch { return fallback; } };
  const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const nowIso = () => new Date().toISOString();

  let snapshotTimer = 0;
  let heartbeatTimer = 0;
  let queueTimer = 0;
  let lastSnapshot = null;

  function sessionId() {
    let value = sessionStorage.getItem(SESSION_KEY);
    if (!value) {
      value = `s54-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      try { sessionStorage.setItem(SESSION_KEY, value); } catch {}
    }
    return value;
  }

  function device() {
    const ua = navigator.userAgent || "";
    if (/android/i.test(ua)) return "Android";
    if (/iphone|ipad|ipod/i.test(ua)) return "iPhone/iPad";
    if (/windows/i.test(ua)) return "Windows";
    if (/mac/i.test(ua)) return "macOS";
    return "Perangkat lain";
  }

  function role() {
    if (window.PAIBP_V54?.role) return window.PAIBP_V54.role();
    const page = (location.pathname.split("/").pop() || "").toLowerCase();
    if (page === "kendali-editor.html") return "editor";
    if (page === "akses-guru.html" || document.body?.dataset.portalRole === "guru") return "guru";
    if ($("#panel-student:not([hidden])")) return "murid";
    return document.body?.dataset.portalRole || "umum";
  }

  function teacher() {
    return parse(localStorage.getItem(TEACHER_KEY), {}) || {};
  }

  function student() {
    return parse(localStorage.getItem(STUDENT_KEY), {}) || {};
  }

  function context() {
    return parse(localStorage.getItem(ACCESS_CONTEXT), {}) || {};
  }

  function activeContext() {
    const panel = $(".workspace-panel:not([hidden])");
    const chapter = $(
      "[data-chapter].active,[data-chapter-id].active,[data-material-id].active," +
      "[aria-current='true'][data-chapter]"
    );
    const section = $(
      "[data-teacher-doc][aria-pressed='true'],[data-islamic-view][aria-pressed='true']"
    );
    return {
      space: panel?.dataset.panel || panel?.id || location.pathname.split("/").pop() || "beranda",
      chapter: chapter?.dataset.chapter || chapter?.dataset.chapterId || chapter?.dataset.materialId || "",
      section: section?.dataset.teacherDoc || section?.dataset.islamicView || ""
    };
  }

  function eventRecord(action = "view", extra = {}) {
    const currentRole = role();
    const t = teacher();
    const s = student();
    const c = context();
    const active = activeContext();
    const identity = currentRole === "guru" || currentRole === "editor" ? t : s;
    return {
      id: `a54-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      sessionId: sessionId(),
      role: currentRole,
      userName: identity.name || identity.teacherName || identity.studentName || "",
      school: identity.workUnit || identity.school || identity.teacherSchool || identity.studentSchool || "",
      studentClass: s.className || s.class || s.grade || "",
      studentNumber: s.number || s.absen || "",
      teacherName: c.teacherName || t.name || "",
      teacherSchool: c.teacherSchool || t.workUnit || t.school || "",
      teacherScope: c.teacherScope || "",
      action,
      space: extra.space || active.space,
      chapter: extra.chapter || active.chapter,
      section: extra.section || active.section,
      durationSeconds: Number(extra.durationSeconds || 0),
      locationName: "",
      latitude: "",
      longitude: "",
      device: device(),
      userAgent: navigator.userAgent || "",
      online: navigator.onLine,
      referrer: document.referrer || "",
      pageUrl: location.href,
      origin: location.origin,
      appVersion: VERSION
    };
  }

  function readQueue() {
    const value = parse(localStorage.getItem(QUEUE_KEY), []);
    return Array.isArray(value) ? value : [];
  }

  function writeQueue(value) {
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(value.slice(-200))); } catch {}
  }

  function queue(action, data) {
    const items = readQueue();
    items.push({
      action,
      data,
      createdAt: nowIso()
    });
    writeQueue(items);
    flushQueue();
  }

  async function post(action, data) {
    if (!CONFIGURED) throw new Error("Endpoint sinkronisasi belum lengkap.");
    await fetch(ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      cache: "no-store",
      keepalive: true,
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify({
        app: "paibp-smart",
        version: VERSION,
        action,
        data,
        origin: location.origin
      })
    });
  }

  let flushing = false;
  async function flushQueue() {
    if (flushing || !CONFIGURED || !navigator.onLine) return;
    flushing = true;
    try {
      const items = readQueue();
      while (items.length && navigator.onLine) {
        try {
          await post(items[0].action, items[0].data);
          items.shift();
          writeQueue(items);
        } catch {
          break;
        }
      }
    } finally {
      flushing = false;
    }
  }

  function jsonp(action, params = {}, timeout = 12000) {
    return new Promise((resolve, reject) => {
      if (!CONFIGURED) {
        reject(new Error("Endpoint sinkronisasi belum lengkap."));
        return;
      }
      const callback = `paibpV54_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement("script");
      const url = new URL(ENDPOINT);
      let done = false;
      const finish = (error, value) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
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
      script.onerror = () => finish(new Error("Google Apps Script tidak dapat dijangkau."));
      const timer = setTimeout(() => finish(new Error("Server melewati batas waktu.")), timeout);
      document.head.append(script);
    });
  }

  function ensureHeroStats() {
    const hero = $(".hero-main-v25");
    if (!hero) return null;
    let block = $("#v54-live-stats", hero);
    if (!block) {
      block = document.createElement("div");
      block.id = "v54-live-stats";
      block.className = "v54-live-stats";
      block.innerHTML = `
        <article><strong data-v54-total>—</strong><span>Total sesi tercatat</span></article>
        <article><strong data-v54-today>—</strong><span>Kunjungan hari ini</span></article>
        <article><strong data-v54-online>—</strong><span>Aktif sekarang</span></article>
        <article><strong data-v54-work>—</strong><span>Pekerjaan terkirim</span></article>`;
      $(".hero-actions-v25", hero)?.insertAdjacentElement("afterend", block) || hero.append(block);
    }
    return block;
  }

  function ensureStatusBadge() {
    const hero = $(".hero-main-v25");
    if (!hero) return null;
    let badge = $("#v54-live-status", hero);
    if (!badge) {
      badge = document.createElement("div");
      badge.id = "v54-live-status";
      badge.className = "v54-live-status";
      badge.textContent = "Menghubungkan rekap lintas perangkat…";
      $(".eyebrow-v25", hero)?.insertAdjacentElement("afterend", badge) || hero.prepend(badge);
    }
    return badge;
  }

  function findLegacyLocalWarnings() {
    const pattern =
      /mode lokal|belum real-time lintas perangkat|statistik perangkat ini ditampilkan|statistik hanya berasal dari perangkat ini|aktifkan sinkronisasi untuk angka lintas perangkat/i;
    return $$("section,article,aside,div").filter((node) => {
      if (node.children.length > 24 || node.closest("#v54-practice-board")) return false;
      return pattern.test(clean(node.textContent));
    });
  }

  function updateLegacyWarnings(state, message) {
    findLegacyLocalWarnings().forEach((node) => {
      node.classList.add("v54-sync-panel");
      node.dataset.state = state;
      const heading = $("h1,h2,h3,h4,strong", node);
      const paragraph = $("p", node);
      if (heading) heading.textContent = state === "online"
        ? "Rekap real-time lintas perangkat aktif"
        : "Sambungan real-time perlu diperiksa";
      if (paragraph) paragraph.textContent = message;
    });
  }

  function renderSnapshot(snapshot) {
    lastSnapshot = snapshot;
    const stats = snapshot?.stats || {};
    const heroStats = ensureHeroStats();
    if (heroStats) {
      $("[data-v54-total]", heroStats).textContent =
        Number(stats.totalSessions || stats.totalAccess || 0).toLocaleString("id-ID");
      $("[data-v54-today]", heroStats).textContent =
        Number(stats.todaySessions || stats.todayAccess || 0).toLocaleString("id-ID");
      $("[data-v54-online]", heroStats).textContent =
        Number(stats.onlineNow || 0).toLocaleString("id-ID");
      $("[data-v54-work]", heroStats).textContent =
        Number(stats.submissions || stats.totalSubmissions || 0).toLocaleString("id-ID");
    }
    const badge = ensureStatusBadge();
    if (badge) {
      badge.dataset.state = "online";
      badge.textContent = "Rekap real-time lintas perangkat aktif";
    }
    updateLegacyWarnings(
      "online",
      "Kunjungan, aktivitas, pekerjaan murid, dan statistik diperbarui dari Google Apps Script pada seluruh perangkat."
    );
    document.documentElement.dataset.realtimeV54 = "online";
    document.dispatchEvent(new CustomEvent("paibp-realtime-v54", { detail: snapshot }));
  }

  function renderFailure(error) {
    const badge = ensureStatusBadge();
    if (badge) {
      badge.dataset.state = "error";
      badge.textContent = "Sambungan rekap sedang diperiksa";
    }
    updateLegacyWarnings(
      "error",
      `Data perangkat tetap disimpan sementara. Server akan dicoba kembali otomatis: ${error?.message || "sambungan gagal"}.`
    );
    document.documentElement.dataset.realtimeV54 = "error";
  }

  async function refreshSnapshot() {
    clearTimeout(snapshotTimer);
    try {
      const snapshot = await jsonp("publicSnapshot", {}, 14000);
      if (!snapshot || snapshot.ok === false) throw new Error(snapshot?.error || "Respons server tidak valid.");
      renderSnapshot(snapshot);
    } catch (error) {
      renderFailure(error);
    } finally {
      snapshotTimer = setTimeout(refreshSnapshot, 15000);
    }
  }

  function record(action, extra = {}) {
    const data = eventRecord(action, extra);
    queue("activity", data);
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const trigger = event.target.closest(
        "[data-open-panel],[data-chapter],[data-chapter-id],[data-material-id]," +
        "[data-teacher-doc],[data-islamic-view],a,button"
      );
      if (!trigger) return;
      const label = clean(trigger.textContent).slice(0, 100);
      if (trigger.matches("[data-open-panel]")) record(`buka-${trigger.dataset.openPanel || "ruang"}`);
      else if (trigger.matches("[data-chapter],[data-chapter-id],[data-material-id]")) record("buka-bab");
      else if (trigger.matches("[data-teacher-doc],[data-islamic-view]")) record("buka-bagian");
      else if (/kirim tugas|kirim kepada guru|selesai evaluasi/i.test(label)) record("kirim-tugas");
    }, true);

    window.addEventListener("online", () => {
      flushQueue();
      refreshSnapshot();
    });
    window.addEventListener("offline", () => renderFailure(new Error("Perangkat sedang luring.")));
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        record("kembali-aktif");
        refreshSnapshot();
      }
    });
  }

  function init() {
    ensureStatusBadge();
    ensureHeroStats();
    bindEvents();
    record("session-start");
    flushQueue();
    refreshSnapshot();

    clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(() => {
      if (document.visibilityState === "visible") record("heartbeat");
    }, 30000);

    clearInterval(queueTimer);
    queueTimer = setInterval(flushQueue, 12000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  window.PAIBP_REALTIME_V54 = Object.freeze({
    version: VERSION,
    configured: CONFIGURED,
    refresh: refreshSnapshot,
    flush: flushQueue,
    record,
    get lastSnapshot() { return lastSnapshot; }
  });
})();