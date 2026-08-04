(() => {
  "use strict";

  const CONFIG = window.PAIBP_CONFIG || {};
  const ENDPOINT = String(CONFIG.syncEndpoint || CONFIG.realtimeEndpoint || "").trim();
  const READ_KEY = String(CONFIG.syncReadKey || CONFIG.realtimeReadKey || "").trim();
  const CONFIGURED = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(ENDPOINT);
  const POLICY_KEY = "paibp-smart-chapter-policy-v44";
  const TEACHER_KEY = "paibp-smart-teacher-identity-v1";
  const EDITOR_KEY = "paibp-smart-editor-unlocked";
  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];
  const parse = (value, fallback) => { try { return JSON.parse(value); } catch { return fallback; } };

  let panelObserver = null;
  let rewriting = false;
  let panel = null;

  function isEditor() {
    const file = (location.pathname.split("/").pop() || "").toLowerCase();
    return file === "kendali-editor.html"
      || sessionStorage.getItem(EDITOR_KEY) === "true"
      || localStorage.getItem(EDITOR_KEY) === "true"
      || document.body?.dataset.teacherOwner === "yes";
  }

  function chapters() {
    return Array.isArray(window.PAIBP_DATA?.chapters) ? window.PAIBP_DATA.chapters : [];
  }

  function chapterOneIds() {
    return chapters().filter((item) => Number(item.number) === 1).map((item) => item.id);
  }

  function readPolicy() {
    const raw = parse(localStorage.getItem(POLICY_KEY), {}) || {};
    const alreadyFixed = raw.checkboxMeaning === "locked-v46";
    const locked = [...new Set([
      ...(Array.isArray(raw.forceLocked) ? raw.forceLocked : []),
      ...(!alreadyFixed && Array.isArray(raw.unlocked) ? raw.unlocked : []),
    ])].filter((id) => !chapterOneIds().includes(id));
    const next = {
      mode: raw.mode === "open" ? "open" : "sequential",
      unlocked: [],
      forceLocked: locked,
      checkboxMeaning: "locked-v46",
      updatedAt: raw.updatedAt || "",
      updatedBy: raw.updatedBy || "",
    };
    if (JSON.stringify(raw) !== JSON.stringify(next)) {
      localStorage.setItem(POLICY_KEY, JSON.stringify(next));
    }
    return next;
  }

  function identity() {
    const value = parse(localStorage.getItem(TEACHER_KEY), {}) || {};
    return `${value.name || "Editor"}${value.workUnit ? ` — ${value.workUnit}` : ""}`;
  }

  function toast(message, tone = "success") {
    let node = $("#v46-editor-toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "v46-editor-toast";
      node.className = "v46-editor-toast";
      document.body.append(node);
    }
    node.dataset.tone = tone;
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), 3500);
  }

  function postPolicy(value) {
    if (!CONFIGURED || !READ_KEY) {
      toast("Tersimpan lokal. Sambungkan Google Apps Script agar berlaku lintas perangkat.", "warning");
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
        data: {
          key: "chapterAccessPolicy",
          value,
          authorName: identity(),
          updatedAt: value.updatedAt,
        },
      }),
    }).then(() => toast("Kunci bab berhasil diterapkan ke murid."))
      .catch(() => toast("Kebijakan tersimpan, tetapi sinkronisasi gagal.", "error"));
  }

  function rewrite() {
    if (!panel || rewriting) return;
    rewriting = true;
    panelObserver?.disconnect();
    const policy = readPolicy();
    const data = chapters();

    const copy = $("header div:first-child", panel);
    if (copy) copy.innerHTML = `<span>KENDALI EDITOR • AKSES MURID</span><h2>Kunci bab dan pembelajaran berurutan</h2><p>Pilih <strong>Urut &amp; Terkunci</strong>. Bab 1 selalu terbuka. Centang berarti bab dikunci paksa; tanpa centang, bab terbuka otomatis setelah bab sebelumnya selesai.</p>`;

    $$('[data-v44-unlock]', panel).forEach((input) => {
      const chapter = data.find((item) => item.id === input.dataset.v44Unlock);
      if (!chapter) return;
      const label = input.closest("label");
      const first = Number(chapter.number) === 1;
      input.checked = !first && policy.forceLocked.includes(chapter.id);
      input.disabled = first;
      input.setAttribute("aria-label", first ? `Bab 1 selalu terbuka` : `Kunci Bab ${chapter.number}`);
      label?.classList.toggle("v46-force-locked", input.checked);
      label?.classList.toggle("v46-first-chapter", first);
    });

    const footer = $("footer > span", panel);
    if (footer) footer.innerHTML = `<strong>Dicentang = DIKUNCI.</strong> Tidak dicentang = mengikuti urutan normal. Bab 1 selalu terbuka pertama.`;
    const save = $('[data-v44-save-policy]', panel);
    if (save) save.textContent = "Simpan Kunci dan Terapkan ke Murid";

    rewriting = false;
    panelObserver?.observe(panel, { childList: true, subtree: true });
  }

  function save(event) {
    const button = event.target.closest("[data-v44-save-policy]");
    if (!button || !panel?.contains(button)) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const mode = $('[data-v44-policy-mode][aria-pressed="true"]', panel)?.dataset.v44PolicyMode === "open" ? "open" : "sequential";
    const firstIds = new Set(chapterOneIds());
    const forceLocked = $$('[data-v44-unlock]:checked', panel)
      .map((input) => input.dataset.v44Unlock)
      .filter((id) => !firstIds.has(id));
    const value = {
      mode,
      unlocked: [],
      forceLocked: [...new Set(forceLocked)],
      checkboxMeaning: "locked-v46",
      updatedAt: new Date().toISOString(),
      updatedBy: identity(),
    };
    localStorage.setItem(POLICY_KEY, JSON.stringify(value));
    rewrite();
    postPolicy(value);
  }

  function connectPanel(candidate) {
    if (!candidate || panel === candidate) return;
    panelObserver?.disconnect();
    panel = candidate;
    panelObserver = new MutationObserver(() => {
      if (rewriting) return;
      requestAnimationFrame(rewrite);
    });
    rewrite();
  }

  function initialize() {
    if (!isEditor()) return;
    document.addEventListener("click", save, true);
    const existing = $("#v44-editor-chapter-control");
    if (existing) connectPanel(existing);
    const main = $("main") || document.body;
    const finder = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          const found = node.matches?.("#v44-editor-chapter-control") ? node : $("#v44-editor-chapter-control", node);
          if (found) { connectPanel(found); return; }
        }
      }
    });
    finder.observe(main, { childList: true, subtree: true });
    setTimeout(() => finder.disconnect(), 15000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();