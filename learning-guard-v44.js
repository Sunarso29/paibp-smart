(() => {
  "use strict";

  const VERSION = "44";
  const CONFIG = window.PAIBP_CONFIG || {};
  const ENDPOINT = String(CONFIG.syncEndpoint || CONFIG.realtimeEndpoint || "").trim();
  const READ_KEY = String(CONFIG.syncReadKey || CONFIG.realtimeReadKey || "").trim();
  const CONFIGURED = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(ENDPOINT);
  const PROGRESS_KEY = "paibp-smart-progress-v3";
  const POLICY_KEY = "paibp-smart-chapter-policy-v44";
  const FOCUS_KEY = "paibp-smart-focus-session-v44";
  const STRIKE_KEY = "paibp-smart-focus-strikes-v44";
  const EDITOR_SESSION_KEY = "paibp-smart-editor-unlocked";
  let chapters = [];

  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];
  const safeParse = (value, fallback) => { try { return JSON.parse(value); } catch { return fallback; } };
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;",
  })[character]);
  const normalize = (value) => String(value || "").normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("id")
    .replace(/[^a-z0-9]+/g, " ").trim();

  let policy = loadPolicy();
  let focusActive = false;
  let focusStartedAt = 0;
  let wakeLock = null;
  let applyingLocks = false;

  function loadPolicy() {
    const stored = safeParse(localStorage.getItem(POLICY_KEY), null);
    return stored && typeof stored === "object" ? stored : {
      mode: "sequential",
      unlocked: [],
      forceLocked: [],
      updatedAt: "",
      updatedBy: "",
    };
  }

  function savePolicy(next) {
    policy = {
      mode: next.mode === "open" ? "open" : "sequential",
      unlocked: [...new Set(Array.isArray(next.unlocked) ? next.unlocked : [])],
      forceLocked: [...new Set(Array.isArray(next.forceLocked) ? next.forceLocked : [])],
      updatedAt: next.updatedAt || new Date().toISOString(),
      updatedBy: next.updatedBy || "Editor",
    };
    try { localStorage.setItem(POLICY_KEY, JSON.stringify(policy)); } catch {}
    applyChapterLocks();
    renderEditorControl();
  }

  function completedIds() {
    const state = safeParse(localStorage.getItem(PROGRESS_KEY), {}) || {};
    return Array.isArray(state.completed) ? state.completed : [];
  }

  function isEditor() {
    const file = (location.pathname.split("/").pop() || "").toLowerCase();
    return file === "kendali-editor.html"
      || sessionStorage.getItem(EDITOR_SESSION_KEY) === "true"
      || localStorage.getItem(EDITOR_SESSION_KEY) === "true"
      || document.body?.dataset.teacherOwner === "yes";
  }

  function studentPanelOpen() {
    return document.body?.dataset.portalRole === "murid" || Boolean($("#panel-student:not([hidden])"));
  }

  function previousChapter(chapter) {
    const gradeChapters = chapters.filter((item) => item.grade === chapter.grade)
      .sort((a, b) => Number(a.number) - Number(b.number));
    const index = gradeChapters.findIndex((item) => item.id === chapter.id);
    return index > 0 ? gradeChapters[index - 1] : null;
  }

  function lockReason(chapter, completed) {
    if (isEditor()) return "";
    if (policy.mode === "open" || policy.unlocked.includes(chapter.id)) return "";
    if (policy.forceLocked.includes(chapter.id)) return "Bab ini dikunci oleh editor.";
    const previous = previousChapter(chapter);
    if (!previous || completed.includes(previous.id)) return "";
    return `Selesaikan Kelas ${previous.grade} Bab ${previous.number} terlebih dahulu: materi, ringkasan, latihan, LKPD, evaluasi, dan refleksi.`;
  }

  function cardForButton(button) {
    return button.closest("article,.chapter-card,.material-card,.chapter-item") || button.parentElement?.parentElement || button.parentElement;
  }

  function decorateCard(card, chapter, reason) {
    if (!card) return;
    card.classList.toggle("v44-chapter-locked", Boolean(reason));
    card.dataset.chapterLock = reason ? "locked" : "open";
    let notice = $(".v44-chapter-lock-notice", card);
    if (!reason) { notice?.remove(); return; }
    if (!notice) {
      notice = document.createElement("div");
      notice.className = "v44-chapter-lock-notice";
      card.append(notice);
    }
    if (notice.dataset.reason !== reason) {
      notice.dataset.reason = reason;
      notice.innerHTML = `<span aria-hidden="true">🔒</span><div><strong>Bab ${escapeHtml(chapter.number)} belum dapat dibuka</strong><small>${escapeHtml(reason)}</small></div>`;
    }
  }

  function applyChapterLocks() {
    if (applyingLocks) return;
    const list = $("#chapter-list");
    if (!list || !chapters.length) return;
    applyingLocks = true;
    const completed = completedIds();
    const groups = new Map();
    $$('[data-chapter]', list).forEach((button) => {
      const id = button.dataset.chapter;
      if (!groups.has(id)) groups.set(id, []);
      groups.get(id).push(button);
    });
    groups.forEach((buttons, id) => {
      const chapter = chapters.find((item) => item.id === id);
      if (!chapter) return;
      const reason = lockReason(chapter, completed);
      buttons.forEach((button) => {
        button.disabled = Boolean(reason);
        button.setAttribute("aria-disabled", String(Boolean(reason)));
        button.classList.toggle("v44-button-locked", Boolean(reason));
        if (reason) button.title = reason; else button.removeAttribute("title");
      });
      decorateCard(cardForButton(buttons[0]), chapter, reason);
    });
    applyingLocks = false;
  }

  function showToast(message, tone = "warning") {
    let toast = $("#v44-learning-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "v44-learning-toast";
      toast.className = "v44-learning-toast";
      document.body.append(toast);
    }
    toast.dataset.tone = tone;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 3600);
  }

  function requestWakeLock() {
    if (!navigator.wakeLock?.request) return;
    navigator.wakeLock.request("screen").then((lock) => { wakeLock = lock; }).catch(() => {});
  }

  async function enterFullscreen() {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen({ navigationUI: "hide" });
      try { await screen.orientation?.lock?.("portrait-primary"); } catch {}
      requestWakeLock();
      focusActive = true;
      focusStartedAt = Date.now();
      sessionStorage.setItem(FOCUS_KEY, "active");
      document.documentElement.classList.add("v44-student-focus");
      hideFocusGate();
      return true;
    } catch {
      focusActive = false;
      showFocusGate("Browser menolak layar penuh otomatis. Tekan tombol Mulai Belajar untuk mengaktifkannya.");
      return false;
    }
  }

  function focusStrikes() {
    return Number(sessionStorage.getItem(STRIKE_KEY) || 0);
  }

  function addStrike(reason) {
    if (!studentPanelOpen()) return;
    const next = focusStrikes() + 1;
    sessionStorage.setItem(STRIKE_KEY, String(next));
    showFocusGate(`${reason} Aktivitas belajar dijeda. Masuk kembali ke layar penuh untuk melanjutkan. Catatan keluar: ${next}.`);
    postFocusEvent("focus_violation", { reason, strikes: next });
  }

  function postFocusEvent(action, extra = {}) {
    if (!CONFIGURED) return;
    const student = safeParse(localStorage.getItem("paibp-smart-student-identity-v1"), {}) || {};
    const payload = {
      action: "activity",
      data: {
        id: `focus-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        role: "murid",
        userName: student.name || "",
        studentClass: student.className || student.class || "",
        studentNumber: student.attendance || student.number || "",
        action,
        space: "Ruang Murid",
        section: "Mode Fokus",
        durationSeconds: focusStartedAt ? Math.round((Date.now() - focusStartedAt) / 1000) : 0,
        appVersion: VERSION,
        origin: location.origin,
        pageUrl: location.href,
        ...extra,
      },
      origin: location.origin,
    };
    fetch(ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload), keepalive: true }).catch(() => {});
  }

  function ensureFocusGate() {
    let gate = $("#v44-focus-gate");
    if (gate) return gate;
    gate = document.createElement("div");
    gate.id = "v44-focus-gate";
    gate.className = "v44-focus-gate";
    gate.hidden = true;
    gate.innerHTML = `
      <section role="dialog" aria-modal="true" aria-labelledby="v44-focus-title">
        <div class="v44-focus-orb" aria-hidden="true"><span>✦</span></div>
        <span class="v44-focus-kicker">MODE BELAJAR TERARAH</span>
        <h2 id="v44-focus-title">Ruang Murid dibuka dalam layar penuh</h2>
        <p data-v44-focus-message>Materi, latihan, LKPD, evaluasi, dan refleksi diselesaikan secara runtut. Tautan luar dan ruang yang tidak berkaitan dengan tugas dibatasi selama sesi belajar.</p>
        <div class="v44-focus-points"><span>✓ Bab dibuka berurutan</span><span>✓ Keluar layar tercatat</span><span>✓ Progres tersimpan</span></div>
        <button type="button" data-v44-enter-focus>Mulai Belajar Full Screen</button>
        <small>Browser tetap menyediakan tombol keselamatan untuk keluar dari layar penuh. Situs web biasa tidak dapat memblokir tombol Home, Alt+Tab, atau penutupan aplikasi secara mutlak.</small>
      </section>`;
    document.body.append(gate);
    $("[data-v44-enter-focus]", gate).addEventListener("click", enterFullscreen);
    return gate;
  }

  function showFocusGate(message = "") {
    if (!studentPanelOpen()) return;
    const gate = ensureFocusGate();
    if (message) $("[data-v44-focus-message]", gate).textContent = message;
    gate.hidden = false;
    document.documentElement.classList.add("v44-focus-paused");
  }

  function hideFocusGate() {
    const gate = ensureFocusGate();
    gate.hidden = true;
    document.documentElement.classList.remove("v44-focus-paused");
  }

  function beginStudentFocus() {
    if (!studentPanelOpen()) return;
    document.documentElement.classList.add("v44-student-session");
    applyChapterLocks();
    if (document.fullscreenElement) {
      focusActive = true;
      document.documentElement.classList.add("v44-student-focus");
      hideFocusGate();
      requestWakeLock();
    } else showFocusGate();
  }

  function leaveStudentFocus() {
    focusActive = false;
    sessionStorage.removeItem(FOCUS_KEY);
    document.documentElement.classList.remove("v44-student-session", "v44-student-focus", "v44-focus-paused");
    ensureFocusGate().hidden = true;
    wakeLock?.release?.().catch(() => {});
    wakeLock = null;
  }

  function blockExternalNavigation(event) {
    if (!studentPanelOpen() || !focusActive) return;
    const link = event.target.closest("a[href]");
    if (!link) return;
    let url;
    try { url = new URL(link.href, location.href); } catch { return; }
    if (url.origin === location.origin && !/\b(game|games)\b/i.test(url.pathname)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    showToast("Tautan luar dibatasi selama Mode Belajar. Gunakan materi dan layanan di dalam portal.");
    postFocusEvent("blocked_navigation", { section: url.hostname || url.pathname });
  }

  function interceptLockedChapter(event) {
    const button = event.target.closest("[data-chapter]");
    if (!button || !button.disabled) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    showToast(button.title || "Bab ini masih terkunci.");
  }

  function interceptShortcuts(event) {
    if (!studentPanelOpen() || !focusActive) return;
    const key = event.key.toLowerCase();
    const blocked = (event.ctrlKey || event.metaKey) && ["l", "t", "n", "w", "r", "u"].includes(key);
    if (!blocked) return;
    event.preventDefault();
    showToast("Pintasan browser dibatasi selama Mode Belajar.");
  }

  function jsonpPublicSnapshot() {
    if (!CONFIGURED) return Promise.resolve(null);
    return new Promise((resolve) => {
      const callback = `paibpPolicy_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement("script");
      const finish = (payload) => {
        clearTimeout(timer); delete window[callback]; script.remove(); resolve(payload || null);
      };
      const timer = setTimeout(() => finish(null), 14000);
      window[callback] = finish;
      const url = new URL(ENDPOINT);
      url.searchParams.set("action", "publicSnapshot");
      url.searchParams.set("callback", callback);
      url.searchParams.set("v", VERSION);
      script.src = url.href;
      script.onerror = () => finish(null);
      document.head.append(script);
    });
  }

  async function loadRemotePolicy() {
    const snapshot = await jsonpPublicSnapshot();
    const remote = snapshot?.content?.chapterAccessPolicy;
    if (remote && typeof remote === "object") savePolicy(remote);
  }

  function editorIdentity() {
    const identity = safeParse(localStorage.getItem("paibp-smart-teacher-identity-v1"), {}) || {};
    return `${identity.name || "Editor"}${identity.workUnit ? ` — ${identity.workUnit}` : ""}`;
  }

  function sendPolicyRemote() {
    if (!CONFIGURED || !READ_KEY) {
      showToast("Kebijakan tersimpan pada perangkat editor. Aktifkan sinkronisasi agar berlaku lintas perangkat.", "warning");
      return;
    }
    const payload = {
      action: "contentUpsert",
      readKey: READ_KEY,
      origin: location.origin,
      data: {
        key: "chapterAccessPolicy",
        value: policy,
        authorName: editorIdentity(),
        updatedAt: new Date().toISOString(),
      },
    };
    fetch(ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) })
      .then(() => showToast("Kebijakan akses bab dikirim ke seluruh perangkat.", "success"))
      .catch(() => showToast("Kebijakan tersimpan lokal, tetapi sinkronisasi daring gagal.", "error"));
  }

  function renderEditorControl() {
    if (!isEditor() || !chapters.length) return;
    const signature = JSON.stringify({ mode: policy.mode, unlocked: policy.unlocked, forceLocked: policy.forceLocked, count: chapters.length });
    let panel = $("#v44-editor-chapter-control");
    if (panel?.dataset.signature === signature) return;
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "v44-editor-chapter-control";
      panel.className = "v44-editor-chapter-control";
      const main = $("main") || document.body;
      main.prepend(panel);
    }
    panel.dataset.signature = signature;
    const grouped = ["VII", "VIII", "IX"].map((grade) => ({ grade, items: chapters.filter((item) => item.grade === grade).sort((a, b) => a.number - b.number) }));
    panel.innerHTML = `
      <header><div><span>KENDALI EDITOR • AKSES MURID</span><h2>Kunci dan buka bab secara terpusat</h2><p>Mode berurutan membuka bab berikutnya hanya setelah seluruh tugas bab sebelumnya selesai. Editor dapat memberi pengecualian.</p></div><div><button type="button" data-v44-policy-mode="sequential" aria-pressed="${policy.mode === "sequential"}">Urut & Terkunci</button><button type="button" data-v44-policy-mode="open" aria-pressed="${policy.mode === "open"}">Buka Semua</button></div></header>
      <div class="v44-editor-grade-grid">${grouped.map(({ grade, items }) => `<section><h3>Kelas ${grade}</h3>${items.map((chapter) => `<label><input type="checkbox" data-v44-unlock="${escapeHtml(chapter.id)}" ${policy.unlocked.includes(chapter.id) ? "checked" : ""}><span><strong>Bab ${chapter.number}</strong><small>${escapeHtml(chapter.title)}</small></span></label>`).join("")}</section>`).join("")}</div>
      <footer><span>Dicentang = dibuka sebagai pengecualian. Bab 1 selalu tersedia dalam mode berurutan.</span><button type="button" data-v44-save-policy>Simpan dan Terapkan ke Murid</button></footer>`;

    $$('[data-v44-policy-mode]', panel).forEach((button) => button.addEventListener("click", () => {
      policy.mode = button.dataset.v44PolicyMode;
      $$('[data-v44-policy-mode]', panel).forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    }));
    $("[data-v44-save-policy]", panel)?.addEventListener("click", () => {
      const unlocked = $$('[data-v44-unlock]:checked', panel).map((input) => input.dataset.v44Unlock);
      savePolicy({ ...policy, unlocked, updatedAt: new Date().toISOString(), updatedBy: editorIdentity() });
      sendPolicyRemote();
    });
  }

  function initialize() {
    chapters = Array.isArray(window.PAIBP_DATA?.chapters) ? window.PAIBP_DATA.chapters : [];
    if (!chapters.length) {
      window.setTimeout(initialize, 250);
      return;
    }
    if (document.documentElement.dataset.learningGuardV44 === "ready") return;
    document.documentElement.dataset.learningGuardV44 = "ready";
    ensureFocusGate();
    applyChapterLocks();
    renderEditorControl();
    loadRemotePolicy();

    document.addEventListener("click", (event) => {
      interceptLockedChapter(event);
      blockExternalNavigation(event);
      const open = event.target.closest('[data-open-panel="student"]');
      if (open) setTimeout(beginStudentFocus, 80);
      const close = event.target.closest("[data-close-workspace]");
      if (close) leaveStudentFocus();
    }, true);
    document.addEventListener("keydown", interceptShortcuts, true);

    document.addEventListener("fullscreenchange", () => {
      if (!studentPanelOpen()) return;
      if (document.fullscreenElement) {
        focusActive = true;
        document.documentElement.classList.add("v44-student-focus");
        hideFocusGate();
        requestWakeLock();
      } else if (focusActive || sessionStorage.getItem(FOCUS_KEY) === "active") {
        focusActive = false;
        document.documentElement.classList.remove("v44-student-focus");
        addStrike("Layar penuh ditutup.");
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (!studentPanelOpen()) return;
      if (document.visibilityState === "hidden" && focusActive) {
        postFocusEvent("page_hidden", { strikes: focusStrikes() + 1 });
      } else if (document.visibilityState === "visible" && sessionStorage.getItem(FOCUS_KEY) === "active" && !document.fullscreenElement) {
        addStrike("Murid meninggalkan halaman atau berpindah aplikasi.");
      }
    });

    window.addEventListener("storage", (event) => {
      if (event.key === PROGRESS_KEY) applyChapterLocks();
      if (event.key === POLICY_KEY) { policy = loadPolicy(); applyChapterLocks(); renderEditorControl(); }
    });

    const list = $("#chapter-list");
    if (list) new MutationObserver(() => applyChapterLocks()).observe(list, { childList: true, subtree: true });
    new MutationObserver(() => {
      applyChapterLocks();
      renderEditorControl();
      if (studentPanelOpen() && sessionStorage.getItem(FOCUS_KEY) === "active" && !document.fullscreenElement) showFocusGate();
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "data-portal-role"] });

    setInterval(applyChapterLocks, 1500);
    setInterval(loadRemotePolicy, 180000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
