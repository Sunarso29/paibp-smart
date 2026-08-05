(() => {
  "use strict";

  const VERSION = "56";
  const CONFIG = window.PAIBP_CONFIG || {};
  const ENDPOINT = String(CONFIG.syncEndpoint || CONFIG.realtimeEndpoint || "").trim();
  const READ_KEY = String(CONFIG.syncReadKey || CONFIG.realtimeReadKey || "").trim();
  const READY = CONFIG.realtimeEnabled !== false && /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(ENDPOINT);
  const SESSION_KEY = "paibp-smart-realtime-session-v56";
  const QUEUE_KEY = "paibp-smart-realtime-queue-v56";
  const CLASS_KEY = "paibp-smart-class-context-v56";

  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];
  const parse = (value, fallback) => { try { return JSON.parse(value); } catch { return fallback; } };
  const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  })[character]);

  let snapshotTimer = 0;
  let lastSnapshot = null;
  let sending = false;

  function sessionId() {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `s56-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }

  function device() {
    const ua = navigator.userAgent || "";
    if (/android/i.test(ua)) return "Android";
    if (/iphone|ipad|ipod/i.test(ua)) return "iPhone/iPad";
    if (/windows/i.test(ua)) return "Windows";
    if (/macintosh|mac os/i.test(ua)) return "macOS";
    if (/linux/i.test(ua)) return "Linux";
    return "Perangkat lain";
  }

  function role() {
    if (window.PAIBP_V56?.role) return window.PAIBP_V56.role();
    const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    const gateway = String(document.body?.dataset.privateGateway || "").toLowerCase();
    if (file === "kendali-editor.html" || gateway === "editor") return "editor";
    if (file === "akses-guru.html" || gateway === "guru") return "teacher";
    if (new URL(location.href).searchParams.get("ps_grade")) return "student";
    return document.body?.dataset.portalRole || "umum";
  }

  function classContext() {
    return window.PAIBP_V56?.classContext?.()
      || parse(sessionStorage.getItem(CLASS_KEY), null)
      || parse(localStorage.getItem(CLASS_KEY), {})
      || {};
  }

  function identity() {
    const key = role() === "student" || role() === "murid"
      ? "paibp-smart-student-identity-v1"
      : "paibp-smart-teacher-identity-v1";
    return parse(localStorage.getItem(key), {}) || {};
  }

  function context() {
    const panel = $(".workspace-panel:not([hidden])");
    const chapter = $("[data-chapter].active,[data-chapter-id].active,[data-material-id].active");
    return {
      space: panel?.dataset.panel || panel?.id || location.pathname.split("/").pop() || "beranda",
      chapter: chapter?.dataset.chapter || chapter?.dataset.chapterId || chapter?.dataset.materialId || ""
    };
  }

  function recordData(action, extra = {}) {
    const person = identity();
    const current = context();
    const classInfo = classContext();
    const currentRole = role();
    const teacher = currentRole === "teacher" || currentRole === "guru" || currentRole === "editor" ? person : {};
    return {
      id:`a56-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
      sessionId:sessionId(),
      role:currentRole,
      userName:person.name || person.teacherName || person.studentName || "",
      school:person.workUnit || person.school || person.teacherSchool || person.studentSchool || classInfo.teacherSchool || "",
      studentClass:person.className || person.class || person.grade || classInfo.grade || "",
      studentNumber:person.number || person.absen || "",
      teacherName:classInfo.teacherName || teacher.name || teacher.teacherName || "",
      teacherSchool:classInfo.teacherSchool || teacher.workUnit || teacher.school || teacher.teacherSchool || "",
      teacherScope:classInfo.scope || "",
      action,
      space:extra.space || current.space,
      chapter:extra.chapter || current.chapter || classInfo.grade || "",
      section:extra.section || "",
      durationSeconds:Number(extra.durationSeconds || 0),
      device:device(),
      userAgent:navigator.userAgent || "",
      online:navigator.onLine,
      referrer:document.referrer || "",
      pageUrl:location.href,
      origin:location.origin,
      appVersion:VERSION
    };
  }

  function queueRead() {
    const queue = parse(localStorage.getItem(QUEUE_KEY), []);
    return Array.isArray(queue) ? queue : [];
  }

  function queueWrite(queue) {
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-160))); } catch {}
  }

  function body(action, data, readKey = "") {
    return JSON.stringify({ app:"paibp-smart", version:VERSION, action, data, readKey, origin:location.origin });
  }

  async function send(action, data, options = {}) {
    if (!READY) throw new Error("Endpoint belum lengkap.");
    const payload = body(action, data, options.readKey || "");
    if (navigator.sendBeacon && !options.mustFetch) {
      const sent = navigator.sendBeacon(ENDPOINT, new Blob([payload], {type:"text/plain;charset=UTF-8"}));
      if (sent) return true;
    }
    await fetch(ENDPOINT, {
      method:"POST", mode:"no-cors", cache:"no-store", keepalive:payload.length < 60000,
      headers:{"Content-Type":"text/plain;charset=UTF-8"}, body:payload
    });
    return true;
  }

  function record(action, extra = {}) {
    const data = recordData(action, extra);
    if (READY && navigator.onLine) {
      send("activity", data).catch(() => {
        const queue = queueRead(); queue.push({action:"activity", data}); queueWrite(queue);
      });
    } else {
      const queue = queueRead(); queue.push({action:"activity", data}); queueWrite(queue);
    }
    return data;
  }

  async function flush() {
    if (sending || !READY || !navigator.onLine) return;
    sending = true;
    try {
      const queue = queueRead();
      while (queue.length) {
        try { await send(queue[0].action, queue[0].data); queue.shift(); queueWrite(queue); }
        catch { break; }
      }
    } finally { sending = false; }
  }

  function jsonp(action, params = {}, timeout = 14000) {
    return new Promise((resolve, reject) => {
      if (!READY) { reject(new Error("Endpoint belum lengkap.")); return; }
      const callback = `paibpV56_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const node = document.createElement("script");
      const request = new URL(ENDPOINT);
      let done = false;
      const finish = (error, value) => {
        if (done) return;
        done = true; clearTimeout(timer);
        try { delete window[callback]; } catch {}
        node.remove(); error ? reject(error) : resolve(value);
      };
      window[callback] = (value) => finish(null, value);
      Object.entries({action, callback, _v:Date.now(), ...params}).forEach(([key, value]) => request.searchParams.set(key, String(value ?? "")));
      node.src = request.href;
      node.async = true;
      node.onerror = () => finish(new Error("Server tidak dapat dijangkau."));
      const timer = setTimeout(() => finish(new Error("Server melewati batas waktu.")), timeout);
      document.head.append(node);
    });
  }

  function ensureStats() {
    const hero = $(".hero-main-v25");
    if (!hero) return null;
    $("#v55-live-stats")?.remove();
    let block = $("#v56-live-stats", hero);
    if (!block) {
      block = document.createElement("div");
      block.id = "v56-live-stats";
      block.innerHTML = '<article><strong data-total>—</strong><span>Total kunjungan</span></article><article><strong data-today>—</strong><span>Kunjungan hari ini</span></article><article><strong data-online>—</strong><span>Aktif sekarang</span></article><article><strong data-work>—</strong><span>Tugas terkirim</span></article>';
      $(".hero-actions-v25", hero)?.insertAdjacentElement("afterend", block) || hero.append(block);
    }
    return block;
  }

  function ensureStatus() {
    const hero = $(".hero-main-v25");
    if (!hero) return null;
    $("#v55-live-status")?.remove();
    let badge = $("#v56-live-status", hero);
    if (!badge) {
      badge = document.createElement("div");
      badge.id = "v56-live-status";
      badge.textContent = "Menghubungkan rekap lintas perangkat…";
      $(".eyebrow-v25", hero)?.insertAdjacentElement("afterend", badge) || hero.prepend(badge);
    }
    return badge;
  }

  function updateWarnings(state, message) {
    const pattern = /mode lokal|belum real-time lintas perangkat|statistik perangkat ini ditampilkan|statistik hanya berasal dari perangkat ini|aktifkan sinkronisasi untuk angka lintas perangkat/i;
    $$("section,article,aside,div").forEach((node) => {
      if (node.children.length > 20 || !pattern.test(clean(node.textContent))) return;
      const heading = $("h1,h2,h3,h4,strong", node);
      const paragraph = $("p", node);
      if (heading) heading.textContent = state === "online" ? "Sinkronisasi real-time lintas perangkat aktif" : "Sinkronisasi sedang menyambung kembali";
      if (paragraph) paragraph.textContent = message;
    });
  }

  function latestSection(visitors) {
    $("#v55-latest-visitors")?.remove();
    let section = $("#v56-latest-visitors");
    if (!section) {
      section = document.createElement("section");
      section.id = "v56-latest-visitors";
      section.className = "container";
      $(".hero-v25")?.insertAdjacentElement("afterend", section);
    }
    if (!section) return;
    section.innerHTML = `<header><div><span>AKSES SERVER OTOMATIS</span><h2>Kunjungan terbaru</h2></div><p>Setiap perangkat direkam otomatis; identitas tampil ketika tersedia.</p></header><div class="v56-visitor-strip">${(visitors || []).slice(0, 12).map((visitor) => `<article><strong>${esc(visitor.label || visitor.name || "Pengunjung")}</strong><small>${esc([visitor.role, visitor.school, visitor.device, visitor.relativeTime].filter(Boolean).join(" • "))}</small></article>`).join("") || '<article><strong>Menunggu akses baru</strong><small>Pengunjung berikutnya akan muncul otomatis.</small></article>'}</div>`;
  }

  function render(data) {
    lastSnapshot = data;
    const stats = data?.stats || {};
    const block = ensureStats();
    if (block) {
      $("[data-total]", block).textContent = Number(stats.totalSessions || 0).toLocaleString("id-ID");
      $("[data-today]", block).textContent = Number(stats.todaySessions || 0).toLocaleString("id-ID");
      $("[data-online]", block).textContent = Number(stats.onlineNow || 0).toLocaleString("id-ID");
      $("[data-work]", block).textContent = Number(stats.totalSubmissions || stats.submissions || 0).toLocaleString("id-ID");
    }
    const status = ensureStatus();
    if (status) {
      status.dataset.state = "online";
      status.textContent = "Sinkronisasi real-time lintas perangkat aktif";
    }
    updateWarnings("online", "Kunjungan, aktivitas, timer kelas, dan pekerjaan diperbarui dari server pada seluruh perangkat.");
    latestSection(data?.latestVisitors || []);
    document.documentElement.dataset.realtimeV56 = "online";
    document.dispatchEvent(new CustomEvent("paibp-realtime-v56", {detail:data}));
  }

  function fail() {
    const status = ensureStatus();
    if (status) {
      status.dataset.state = "error";
      status.textContent = "Sinkronisasi sedang menyambung kembali";
    }
    updateWarnings("error", "Data disimpan sementara dan akan dikirim otomatis saat server tersambung kembali.");
    document.documentElement.dataset.realtimeV56 = "error";
  }

  async function refresh() {
    clearTimeout(snapshotTimer);
    try {
      const data = await jsonp("publicSnapshot", {}, 15000);
      if (!data || data.ok === false) throw new Error(data?.error || "Respons server tidak valid.");
      render(data);
      return data;
    } catch (error) {
      fail(error);
      return null;
    } finally {
      snapshotTimer = setTimeout(refresh, 30000);
    }
  }

  async function setClassPolicy(data) {
    if (!READY || !READ_KEY) throw new Error("Konfigurasi kendali kelas belum lengkap.");
    await send("classControl", data, {readKey:READ_KEY, mustFetch:true});
    return true;
  }

  function init() {
    ensureStatus();
    ensureStats();
    record("session-start");
    flush();
    refresh();

    document.addEventListener("click", (event) => {
      const target = event.target.closest("[data-open-panel],[data-chapter],[data-chapter-id],[data-material-id],[data-teacher-doc],[data-islamic-view]");
      if (!target) return;
      if (target.matches("[data-open-panel]")) record(`buka-${target.dataset.openPanel || "ruang"}`);
      else if (target.matches("[data-chapter],[data-chapter-id],[data-material-id]")) record("buka-bab");
      else record("buka-bagian");
    }, {passive:true, capture:true});

    window.addEventListener("online", () => { flush(); refresh(); });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") { record("kembali-aktif"); refresh(); }
    });
    window.addEventListener("pagehide", () => record("pagehide"));
    setInterval(() => {
      if (document.visibilityState === "visible") record("heartbeat");
      flush();
    }, 60000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();

  window.PAIBP_REALTIME_V56 = Object.freeze({
    version:VERSION, configured:READY, record, refresh, flush, setClassPolicy, jsonp,
    get lastSnapshot() { return lastSnapshot; }
  });
})();
