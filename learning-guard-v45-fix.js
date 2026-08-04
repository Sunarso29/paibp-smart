(() => {
  "use strict";

  const VERSION = "45";
  const CONFIG = window.PAIBP_CONFIG || {};
  const ENDPOINT = String(CONFIG.syncEndpoint || CONFIG.realtimeEndpoint || "").trim();
  const READ_KEY = String(CONFIG.syncReadKey || CONFIG.realtimeReadKey || "").trim();
  const CONFIGURED = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(ENDPOINT);

  const POLICY_KEY = "paibp-smart-chapter-policy-v44";
  const PROGRESS_KEY = "paibp-smart-progress-v3";
  const TEACHER_KEY = "paibp-smart-teacher-identity-v1";
  const EDITOR_SESSION_KEY = "paibp-smart-editor-unlocked";

  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];
  const parse = (value, fallback) => {
    try { return JSON.parse(value); } catch { return fallback; }
  };
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[character]);

  let chapters = [];
  let applying = false;
  let lastPanelSignature = "";

  function isEditor() {
    const file = (location.pathname.split("/").pop() || "").toLowerCase();
    return file === "kendali-editor.html"
      || sessionStorage.getItem(EDITOR_SESSION_KEY) === "true"
      || localStorage.getItem(EDITOR_SESSION_KEY) === "true"
      || document.body?.dataset.teacherOwner === "yes";
  }

  function readPolicy() {
    const raw = parse(localStorage.getItem(POLICY_KEY), {}) || {};
    const unlocked = Array.isArray(raw.unlocked) ? raw.unlocked : [];
    const forceLocked = Array.isArray(raw.forceLocked) ? raw.forceLocked : [];

    // Migrasi V44: centang lama sebelumnya dianggap "buka".
    // Sesuai maksud editor, seluruh centang lama dipindah menjadi "kunci".
    const migrated = raw.checkboxMeaning !== "locked";
    const next = {
      mode: raw.mode === "open" ? "open" : "sequential",
      unlocked: [],
      forceLocked: [...new Set([
        ...forceLocked,
        ...(migrated ? unlocked : []),
      ])],
      checkboxMeaning: "locked",
      updatedAt: raw.updatedAt || "",
      updatedBy: raw.updatedBy || "",
    };

    // Bab 1 selalu tersedia pada mode berurutan.
    const chapterOneIds = chapters.filter((chapter) => Number(chapter.number) === 1).map((chapter) => chapter.id);
    next.forceLocked = next.forceLocked.filter((id) => !chapterOneIds.includes(id));

    const serialized = JSON.stringify(next);
    if (serialized !== JSON.stringify(raw)) {
      try { localStorage.setItem(POLICY_KEY, serialized); } catch {}
    }
    return next;
  }

  function writePolicy(policy) {
    try { localStorage.setItem(POLICY_KEY, JSON.stringify(policy)); } catch {}
  }

  function completedIds() {
    const state = parse(localStorage.getItem(PROGRESS_KEY), {}) || {};
    return Array.isArray(state.completed) ? state.completed : [];
  }

  function previousChapter(chapter) {
    const sameGrade = chapters
      .filter((item) => item.grade === chapter.grade)
      .sort((a, b) => Number(a.number) - Number(b.number));
    const index = sameGrade.findIndex((item) => item.id === chapter.id);
    return index > 0 ? sameGrade[index - 1] : null;
  }

  function lockReason(chapter, policy, completed) {
    if (isEditor()) return "";
    if (Number(chapter.number) === 1) return "";
    if (policy.forceLocked.includes(chapter.id)) {
      return "Bab ini dikunci langsung oleh editor.";
    }
    if (policy.mode === "open") return "";
    const previous = previousChapter(chapter);
    if (!previous || completed.includes(previous.id)) return "";
    return `Selesaikan Kelas ${previous.grade} Bab ${previous.number} terlebih dahulu: materi, ringkasan, latihan, LKPD, evaluasi, dan refleksi.`;
  }

  function cardForButton(button) {
    return button.closest("article,.chapter-card,.material-card,.chapter-item")
      || button.parentElement?.parentElement
      || button.parentElement;
  }

  function decorateCard(card, chapter, reason) {
    if (!card) return;
    card.classList.toggle("v45-chapter-locked", Boolean(reason));
    card.dataset.chapterLock = reason ? "locked" : "open";

    let notice = $(".v45-chapter-lock-notice", card);
    $(".v44-chapter-lock-notice", card)?.remove();

    if (!reason) {
      notice?.remove();
      return;
    }

    if (!notice) {
      notice = document.createElement("div");
      notice.className = "v45-chapter-lock-notice";
      card.append(notice);
    }

    notice.innerHTML = `
      <span aria-hidden="true">🔒</span>
      <div>
        <strong>Bab ${escapeHtml(chapter.number)} terkunci</strong>
        <small>${escapeHtml(reason)}</small>
      </div>`;
  }

  function applyLocks() {
    if (applying || isEditor() || !chapters.length) return;
    const list = $("#chapter-list");
    if (!list) return;

    applying = true;
    const policy = readPolicy();
    const completed = completedIds();
    const groups = new Map();

    $$("[data-chapter]", list).forEach((button) => {
      const id = button.dataset.chapter;
      if (!groups.has(id)) groups.set(id, []);
      groups.get(id).push(button);
    });

    groups.forEach((buttons, id) => {
      const chapter = chapters.find((item) => item.id === id);
      if (!chapter) return;

      const reason = lockReason(chapter, policy, completed);
      buttons.forEach((button) => {
        button.disabled = Boolean(reason);
        button.setAttribute("aria-disabled", String(Boolean(reason)));
        button.classList.toggle("v45-button-locked", Boolean(reason));
        if (reason) button.title = reason;
        else button.removeAttribute("title");
      });

      decorateCard(cardForButton(buttons[0]), chapter, reason);
    });

    applying = false;
  }

  function editorIdentity() {
    const identity = parse(localStorage.getItem(TEACHER_KEY), {}) || {};
    return `${identity.name || "Editor"}${identity.workUnit ? ` — ${identity.workUnit}` : ""}`;
  }

  function showToast(message, tone = "success") {
    let toast = $("#v45-policy-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "v45-policy-toast";
      toast.className = "v45-policy-toast";
      document.body.append(toast);
    }
    toast.dataset.tone = tone;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 4200);
  }

  function sendRemote(policy) {
    if (!CONFIGURED || !READ_KEY) {
      showToast("Kebijakan tersimpan pada perangkat ini. Sambungkan Google Apps Script agar berlaku lintas perangkat.", "warning");
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

    fetch(ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    })
      .then(() => showToast("Kebijakan kunci bab sudah diterapkan ke murid.", "success"))
      .catch(() => showToast("Tersimpan lokal, tetapi pengiriman daring gagal.", "error"));
  }

  function rewriteEditorPanel() {
    const panel = $("#v44-editor-chapter-control");
    if (!panel || !isEditor() || !chapters.length) return;

    const policy = readPolicy();
    const signature = JSON.stringify({
      mode: policy.mode,
      locked: policy.forceLocked,
      count: chapters.length,
      html: panel.querySelectorAll("[data-v44-unlock]").length,
    });
    if (signature === lastPanelSignature && panel.dataset.v45Ready === "yes") return;
    lastPanelSignature = signature;
    panel.dataset.v45Ready = "yes";
    panel.classList.add("v45-editor-chapter-control");

    const heading = $("header div:first-child", panel);
    if (heading) {
      heading.innerHTML = `
        <span>KENDALI EDITOR • AKSES MURID</span>
        <h2>Kunci bab dan atur pembelajaran berurutan</h2>
        <p>Pilih <strong>Urut &amp; Terkunci</strong>. Bab 1 terbuka terlebih dahulu; bab berikutnya terbuka otomatis setelah seluruh tugas bab sebelumnya selesai. Centang hanya untuk mengunci paksa.</p>`;
    }

    $$("[data-v44-unlock]", panel).forEach((input) => {
      const id = input.dataset.v44Unlock;
      const chapter = chapters.find((item) => item.id === id);
      if (!chapter) return;

      input.checked = policy.forceLocked.includes(id);
      input.dataset.v45Lock = id;
      input.setAttribute("aria-label", `Kunci Kelas ${chapter.grade} Bab ${chapter.number}`);

      const label = input.closest("label");
      label?.classList.toggle("v45-force-locked", input.checked);

      if (Number(chapter.number) === 1) {
        input.checked = false;
        input.disabled = true;
        label?.classList.add("v45-chapter-one");
        const small = $("small", label);
        if (small && !small.dataset.v45Original) {
          small.dataset.v45Original = small.textContent;
          small.textContent = `${small.textContent} • selalu terbuka terlebih dahulu`;
        }
      } else {
        input.disabled = false;
      }
    });

    $$("[data-v44-unlock]", panel).forEach((input) => {
      if (input.dataset.v45Listener === "yes") return;
      input.dataset.v45Listener = "yes";
      input.addEventListener("change", () => {
        input.closest("label")?.classList.toggle("v45-force-locked", input.checked);
      });
    });

    const footerText = $("footer > span", panel);
    if (footerText) {
      footerText.innerHTML = `<strong>Dicentang = DIKUNCI oleh editor.</strong> Tidak dicentang = mengikuti urutan normal. Bab 1 selalu dibuka terlebih dahulu.`;
    }

    const saveButton = $("[data-v44-save-policy]", panel);
    if (saveButton) saveButton.textContent = "Simpan Kunci dan Terapkan ke Murid";
  }

  function saveFromPanel(event) {
    const button = event.target.closest("[data-v44-save-policy]");
    if (!button) return;

    const panel = button.closest("#v44-editor-chapter-control");
    if (!panel) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const selectedMode = $('[data-v44-policy-mode][aria-pressed="true"]', panel)?.dataset.v44PolicyMode || "sequential";
    const locked = $$("[data-v44-unlock]:checked", panel)
      .map((input) => input.dataset.v44Unlock)
      .filter((id) => {
        const chapter = chapters.find((item) => item.id === id);
        return chapter && Number(chapter.number) !== 1;
      });

    const next = {
      mode: selectedMode === "open" ? "open" : "sequential",
      unlocked: [],
      forceLocked: [...new Set(locked)],
      checkboxMeaning: "locked",
      updatedAt: new Date().toISOString(),
      updatedBy: editorIdentity(),
    };

    writePolicy(next);
    lastPanelSignature = "";
    rewriteEditorPanel();
    sendRemote(next);
  }

  function interceptLockedChapter(event) {
    if (isEditor()) return;
    const button = event.target.closest("[data-chapter]");
    if (!button) return;

    const chapter = chapters.find((item) => item.id === button.dataset.chapter);
    if (!chapter) return;

    const reason = lockReason(chapter, readPolicy(), completedIds());
    if (!reason) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    showToast(reason, "warning");
  }

  function initialize() {
    chapters = Array.isArray(window.PAIBP_DATA?.chapters) ? window.PAIBP_DATA.chapters : [];
    if (!chapters.length) {
      setTimeout(initialize, 250);
      return;
    }

    if (document.documentElement.dataset.learningGuardV45 === "ready") return;
    document.documentElement.dataset.learningGuardV45 = "ready";

    readPolicy();
    rewriteEditorPanel();
    applyLocks();

    document.addEventListener("click", saveFromPanel, true);
    document.addEventListener("click", interceptLockedChapter, true);

    new MutationObserver(() => {
      rewriteEditorPanel();
      applyLocks();
    }).observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["hidden", "aria-pressed", "data-portal-role"],
    });

    window.addEventListener("storage", (event) => {
      if (event.key === POLICY_KEY || event.key === PROGRESS_KEY) {
        lastPanelSignature = "";
        rewriteEditorPanel();
        applyLocks();
      }
    });

    // Dijalankan sesudah mekanisme V44 agar arti centang V45 selalu menjadi hasil akhir.
    setInterval(() => {
      rewriteEditorPanel();
      applyLocks();
    }, 700);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();