(() => {
  "use strict";
  const VERSION = "47";
  const CONFIG = window.PAIBP_CONFIG || {};
  const ENDPOINT = String(CONFIG.syncEndpoint || CONFIG.realtimeEndpoint || "").trim();
  const READ_KEY = String(CONFIG.syncReadKey || CONFIG.realtimeReadKey || "").trim();
  const CONFIGURED = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(ENDPOINT);
  const POLICY_KEY = "paibp-smart-chapter-policy-v47";
  const LEGACY_POLICY_KEY = "paibp-smart-chapter-policy-v44";
  const PROGRESS_KEY = "paibp-smart-progress-v3";
  const TEACHER_KEY = "paibp-smart-teacher-identity-v1";
  const EDITOR_KEY = "paibp-smart-editor-unlocked";
  const FOCUS_KEY = "paibp-smart-focus-session-v47";

  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];
  const parse = (value, fallback) => { try { return JSON.parse(value); } catch { return fallback; } };
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;",
  })[character]);

  let chapters = [];
  let policy = { mode: "sequential", forceLocked: [], updatedAt: "", updatedBy: "" };
  let studentActive = false;
  let focusActive = false;
  let listObserver = null;
  let scheduled = false;
  let remotePromise = null;

  function isEditor() {
    const file = (location.pathname.split("/").pop() || "").toLowerCase();
    return file === "kendali-editor.html"
      || sessionStorage.getItem(EDITOR_KEY) === "true"
      || localStorage.getItem(EDITOR_KEY) === "true"
      || document.body?.dataset.teacherOwner === "yes";
  }

  function teacherIdentity() {
    const source = parse(localStorage.getItem(TEACHER_KEY), {}) || {};
    return `${source.name || "Editor"}${source.workUnit ? ` — ${source.workUnit}` : ""}`;
  }

  function chapterOneIds() {
    return chapters.filter((item) => Number(item.number) === 1).map((item) => item.id);
  }

  function normalizePolicy(raw) {
    raw = raw && typeof raw === "object" ? raw : {};
    const first = new Set(chapterOneIds());
    let locked = Array.isArray(raw.forceLocked) ? raw.forceLocked : [];
    if (!raw.checkboxMeaning && Array.isArray(raw.unlocked)) locked = [...locked, ...raw.unlocked];
    return {
      mode: raw.mode === "open" ? "open" : "sequential",
      forceLocked: [...new Set(locked)].filter((id) => !first.has(id)),
      checkboxMeaning: "locked-v47",
      updatedAt: raw.updatedAt || "",
      updatedBy: raw.updatedBy || "",
    };
  }

  function loadLocalPolicy() {
    const current = parse(localStorage.getItem(POLICY_KEY), null);
    const legacy = parse(localStorage.getItem(LEGACY_POLICY_KEY), null);
    policy = normalizePolicy(current || legacy || {});
    try { localStorage.setItem(POLICY_KEY, JSON.stringify(policy)); } catch {}
    return policy;
  }

  function saveLocalPolicy(next) {
    policy = normalizePolicy(next);
    try { localStorage.setItem(POLICY_KEY, JSON.stringify(policy)); } catch {}
  }

  function completedIds() {
    const source = parse(localStorage.getItem(PROGRESS_KEY), {}) || {};
    return Array.isArray(source.completed) ? source.completed : [];
  }

  function previousChapter(chapter) {
    const ordered = chapters.filter((item) => item.grade === chapter.grade)
      .sort((a, b) => Number(a.number) - Number(b.number));
    const index = ordered.findIndex((item) => item.id === chapter.id);
    return index > 0 ? ordered[index - 1] : null;
  }

  function lockReason(chapter, completed = completedIds()) {
    if (isEditor() || Number(chapter.number) === 1) return "";
    if (policy.forceLocked.includes(chapter.id)) return "Bab ini dikunci langsung oleh editor.";
    if (policy.mode === "open") return "";
    const previous = previousChapter(chapter);
    if (!previous || completed.includes(previous.id)) return "";
    return `Selesaikan Kelas ${previous.grade} Bab ${previous.number} terlebih dahulu: materi, ringkasan, latihan, LKPD, evaluasi, dan refleksi.`;
  }

  function toast(message, tone = "warning") {
    let node = $("#v47-learning-toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "v47-learning-toast";
      node.className = "v47-learning-toast";
      document.body.append(node);
    }
    node.dataset.tone = tone;
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), 3400);
  }

  function cardFor(button) {
    return button.closest("article,.chapter-card,.material-card,.chapter-item")
      || button.parentElement?.parentElement || button.parentElement;
  }

  function decorate(card, chapter, reason) {
    if (!card) return;
    card.classList.toggle("v47-chapter-locked", Boolean(reason));
    $(".v44-chapter-lock-notice", card)?.remove();
    $(".v45-chapter-lock-notice", card)?.remove();
    let notice = $(".v47-chapter-lock-notice", card);
    if (!reason) { notice?.remove(); return; }
    if (!notice) {
      notice = document.createElement("div");
      notice.className = "v47-chapter-lock-notice";
      card.append(notice);
    }
    notice.innerHTML = `<span aria-hidden="true">🔒</span><div><strong>Bab ${escapeHtml(chapter.number)} terkunci</strong><small>${escapeHtml(reason)}</small></div>`;
  }

  function applyLocks() {
    scheduled = false;
    if (!studentActive || isEditor()) return;
    const list = $("#chapter-list");
    if (!list) return;
    const completed = completedIds();
    const grouped = new Map();
    $$('[data-chapter]', list).forEach((button) => {
      if (!grouped.has(button.dataset.chapter)) grouped.set(button.dataset.chapter, []);
      grouped.get(button.dataset.chapter).push(button);
    });
    grouped.forEach((buttons, id) => {
      const chapter = chapters.find((item) => item.id === id);
      if (!chapter) return;
      const reason = lockReason(chapter, completed);
      buttons.forEach((button) => {
        button.disabled = Boolean(reason);
        button.setAttribute("aria-disabled", String(Boolean(reason)));
        button.classList.toggle("v47-button-locked", Boolean(reason));
        if (reason) button.title = reason; else button.removeAttribute("title");
      });
      decorate(cardFor(buttons[0]), chapter, reason);
    });
  }

  function scheduleLocks() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(applyLocks);
  }

  function connectChapterList() {
    listObserver?.disconnect();
    const list = $("#chapter-list");
    if (!list || !studentActive) return;
    listObserver = new MutationObserver(scheduleLocks);
    listObserver.observe(list, { childList: true, subtree: true });
    scheduleLocks();
  }

  function ensureFocusGate() {
    let gate = $("#v47-focus-gate");
    if (gate) return gate;
    gate = document.createElement("div");
    gate.id = "v47-focus-gate";
    gate.className = "v47-focus-gate";
    gate.hidden = true;
    gate.innerHTML = `<section role="dialog" aria-modal="true"><span class="v47-focus-kicker">MODE BELAJAR TERARAH</span><h2>Belajar runtut dalam satu ruang</h2><p data-v47-focus-message>Bab dibuka berurutan. Tautan luar dibatasi selama sesi belajar dan progres tetap tersimpan.</p><div><span>✓ Bab berurutan</span><span>✓ Progres tersimpan</span><span>✓ Keluar halaman tercatat</span></div><button type="button" data-v47-enter-focus>Mulai Belajar Full Screen</button><small>Browser tetap menyediakan tombol keselamatan untuk keluar dari layar penuh.</small></section>`;
    document.body.append(gate);
    $("[data-v47-enter-focus]", gate).addEventListener("click", enterFocus);
    return gate;
  }

  async function enterFocus() {
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen({ navigationUI: "hide" });
      }
    } catch {}
    focusActive = true;
    sessionStorage.setItem(FOCUS_KEY, "active");
    ensureFocusGate().hidden = true;
    document.documentElement.classList.add("v47-student-focus");
  }

  function pauseFocus(message) {
    if (!studentActive) return;
    focusActive = false;
    document.documentElement.classList.remove("v47-student-focus");
    const gate = ensureFocusGate();
    $("[data-v47-focus-message]", gate).textContent = message;
    gate.hidden = false;
  }

  function activateStudent() {
    studentActive = true;
    connectChapterList();
    loadRemotePolicy().finally(scheduleLocks);
    if (!document.fullscreenElement) pauseFocus("Tekan tombol untuk memulai pembelajaran terarah. Bab berikutnya tetap terkunci sampai tugas sebelumnya selesai.");
  }

  function deactivateStudent() {
    studentActive = false;
    focusActive = false;
    listObserver?.disconnect();
    listObserver = null;
    sessionStorage.removeItem(FOCUS_KEY);
    document.documentElement.classList.remove("v47-student-focus");
    const gate = $("#v47-focus-gate");
    if (gate) gate.hidden = true;
  }

  function jsonpSnapshot() {
    if (!CONFIGURED) return Promise.resolve(null);
    return new Promise((resolve) => {
      const callback = `paibpV47_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement("script");
      let settled = false;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        try { delete window[callback]; } catch {}
        script.remove();
        resolve(value || null);
      };
      window[callback] = finish;
      const timer = setTimeout(() => finish(null), 6500);
      const url = new URL(ENDPOINT);
      url.searchParams.set("action", "publicSnapshot");
      url.searchParams.set("callback", callback);
      url.searchParams.set("v", VERSION);
      script.src = url.href;
      script.onerror = () => finish(null);
      document.head.append(script);
    });
  }

  function loadRemotePolicy() {
    if (remotePromise) return remotePromise;
    remotePromise = jsonpSnapshot().then((snapshot) => {
      const remote = snapshot?.content?.chapterAccessPolicy;
      if (remote) {
        saveLocalPolicy(remote);
        scheduleLocks();
        if (isEditor()) renderEditorPanel();
      }
      return remote;
    }).finally(() => { remotePromise = null; });
    return remotePromise;
  }

  function sendPolicy(next) {
    if (!CONFIGURED || !READ_KEY) {
      toast("Tersimpan pada perangkat editor. Sinkronisasi daring belum aktif.", "warning");
      return;
    }
    fetch(ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "contentUpsert",
        readKey: READ_KEY,
        origin: location.origin,
        data: { key: "chapterAccessPolicy", value: next, authorName: teacherIdentity(), updatedAt: next.updatedAt },
      }),
    }).then(() => toast("Kebijakan bab diterapkan ke murid.", "success"))
      .catch(() => toast("Kebijakan tersimpan lokal, tetapi sinkronisasi gagal.", "error"));
  }

  function renderEditorPanel() {
    if (!isEditor() || !chapters.length) return;
    $("#v44-editor-chapter-control")?.remove();
    $("#v45-editor-chapter-control")?.remove();
    let panel = $("#v47-editor-chapter-control");
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "v47-editor-chapter-control";
      panel.className = "v47-editor-chapter-control";
      const main = $("main") || document.body;
      main.prepend(panel);
    }
    const groups = ["VII", "VIII", "IX"].map((grade) => ({
      grade,
      items: chapters.filter((item) => item.grade === grade).sort((a, b) => Number(a.number) - Number(b.number)),
    }));
    panel.innerHTML = `<header><div><span>KENDALI EDITOR • AKSES MURID</span><h2>Atur pembelajaran berurutan tanpa membebani portal</h2><p><strong>Urut &amp; Terkunci</strong>: Bab 1 terbuka, bab berikutnya terbuka setelah tugas sebelumnya selesai. Centang hanya untuk mengunci paksa.</p></div><div><button type="button" data-v47-mode="sequential" aria-pressed="${policy.mode === "sequential"}">Urut &amp; Terkunci</button><button type="button" data-v47-mode="open" aria-pressed="${policy.mode === "open"}">Buka Semua</button></div></header><div class="v47-editor-grid">${groups.map(({ grade, items }) => `<section><h3>Kelas ${grade}</h3>${items.map((chapter) => `<label class="${Number(chapter.number) === 1 ? "is-first" : policy.forceLocked.includes(chapter.id) ? "is-locked" : ""}"><input type="checkbox" data-v47-lock="${escapeHtml(chapter.id)}" ${policy.forceLocked.includes(chapter.id) ? "checked" : ""} ${Number(chapter.number) === 1 ? "disabled" : ""}><span><strong>Bab ${chapter.number}</strong><small>${escapeHtml(chapter.title)}${Number(chapter.number) === 1 ? " • terbuka pertama" : ""}</small></span></label>`).join("")}</section>`).join("")}</div><footer><span><strong>Dicentang = dikunci paksa.</strong> Tidak dicentang = mengikuti urutan normal.</span><button type="button" data-v47-save>Simpan dan Terapkan ke Murid</button></footer>`;
    $$('[data-v47-mode]', panel).forEach((button) => button.addEventListener("click", () => {
      $$('[data-v47-mode]', panel).forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    }));
    $$('[data-v47-lock]', panel).forEach((input) => input.addEventListener("change", () => input.closest("label")?.classList.toggle("is-locked", input.checked)));
    $("[data-v47-save]", panel).addEventListener("click", () => {
      const mode = $('[data-v47-mode][aria-pressed="true"]', panel)?.dataset.v47Mode === "open" ? "open" : "sequential";
      const next = normalizePolicy({
        mode,
        forceLocked: $$('[data-v47-lock]:checked', panel).map((input) => input.dataset.v47Lock),
        updatedAt: new Date().toISOString(),
        updatedBy: teacherIdentity(),
      });
      saveLocalPolicy(next);
      renderEditorPanel();
      sendPolicy(next);
    });
  }

  function handleClick(event) {
    const lockedButton = event.target.closest('[data-chapter]');
    if (lockedButton && studentActive && !isEditor()) {
      const chapter = chapters.find((item) => item.id === lockedButton.dataset.chapter);
      const reason = chapter ? lockReason(chapter) : "";
      if (reason) {
        event.preventDefault();
        event.stopImmediatePropagation();
        toast(reason);
        return;
      }
    }

    if (studentActive && focusActive) {
      const link = event.target.closest('a[href]');
      if (link) {
        try {
          const url = new URL(link.href, location.href);
          if (url.origin !== location.origin || /\bgame(?:s)?\b/i.test(url.pathname)) {
            event.preventDefault();
            event.stopImmediatePropagation();
            toast("Tautan luar dan game dibatasi selama Mode Belajar.");
            return;
          }
        } catch {}
      }
    }

    if (event.target.closest('[data-open-panel="student"]')) setTimeout(activateStudent, 80);
    if (event.target.closest('[data-close-workspace]')) deactivateStudent();
    if (event.target.closest('[data-grade-filter],[data-semester-filter],#back-to-library,#toggle-lesson-complete')) setTimeout(connectChapterList, 80);
    if (isEditor() && event.target.closest('[data-open-editor],.owner-control-button,[href*="kendali-editor"]')) setTimeout(renderEditorPanel, 80);
  }

  function initialize(attempt = 0) {
    chapters = Array.isArray(window.PAIBP_DATA?.chapters) ? window.PAIBP_DATA.chapters : [];
    if (!chapters.length && attempt < 30) {
      setTimeout(() => initialize(attempt + 1), 100);
      return;
    }
    loadLocalPolicy();
    document.documentElement.dataset.learningGuardV47 = "ready";
    document.addEventListener("click", handleClick, true);
    window.addEventListener("storage", (event) => {
      if (event.key === POLICY_KEY || event.key === LEGACY_POLICY_KEY) { loadLocalPolicy(); scheduleLocks(); if (isEditor()) renderEditorPanel(); }
      if (event.key === PROGRESS_KEY) scheduleLocks();
    });
    document.addEventListener("fullscreenchange", () => {
      if (!studentActive) return;
      if (document.fullscreenElement) { focusActive = true; ensureFocusGate().hidden = true; }
      else if (sessionStorage.getItem(FOCUS_KEY) === "active") pauseFocus("Layar penuh ditutup. Tekan tombol untuk melanjutkan pembelajaran.");
    });
    document.addEventListener("visibilitychange", () => {
      if (studentActive && document.visibilityState === "visible" && sessionStorage.getItem(FOCUS_KEY) === "active" && !document.fullscreenElement) {
        pauseFocus("Murid meninggalkan halaman. Tekan tombol untuk melanjutkan pembelajaran.");
      }
    });
    if (isEditor()) { renderEditorPanel(); loadRemotePolicy(); }
    if (document.body?.dataset.portalRole === "murid" || $("#panel-student:not([hidden])")) activateStudent();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => initialize(), { once: true });
  else initialize();
})();
