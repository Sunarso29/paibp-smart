(() => {
  "use strict";
  const VERSION = "57";
  const MEDIA = window.PAIBP_V56_MEDIA || {};
  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];

  function selectedModule(board) {
    return $("[data-v56-module][aria-selected='true']", board)?.dataset.v56Module || "wudhu";
  }

  function mediaKey(moduleId, index) {
    const extension = moduleId === "wudhu" || moduleId === "sholat" ? "webp" : "svg";
    return `${moduleId}-${String(index + 1).padStart(2, "0")}.${extension}`;
  }

  function validDataUri(value) {
    return /^data:image\/(?:webp|svg\+xml|png|jpeg);base64,/i.test(String(value || ""));
  }

  function repairPracticeMedia() {
    const board = $("#v56-practice-board");
    if (!board) return;
    const moduleId = selectedModule(board);

    const poster = $(".v56-poster img", board);
    if (poster && moduleId === "wudhu" && validDataUri(MEDIA["wudhu-poster.webp"])) {
      poster.src = MEDIA["wudhu-poster.webp"];
      poster.hidden = false;
      poster.closest("figure")?.classList.remove("v57-media-error");
    }

    $$(".v56-step-grid .v56-step", board).forEach((card, index) => {
      const image = $("figure img", card);
      const figure = $("figure", card);
      if (!image || !figure) return;
      const source = MEDIA[mediaKey(moduleId, index)];
      if (validDataUri(source)) {
        if (image.src !== source) image.src = source;
        image.hidden = false;
        image.style.removeProperty("display");
        image.style.removeProperty("opacity");
        figure.classList.remove("v57-media-error");
        image.onerror = () => figure.classList.add("v57-media-error");
        image.onload = () => figure.classList.remove("v57-media-error");
      } else {
        figure.classList.add("v57-media-error");
      }
    });
  }

  function repairContrast() {
    const board = $("#v56-practice-board");
    if (!board) return;
    board.dataset.v57Fixed = "true";
    $$(".v56-step-copy", board).forEach((copy) => {
      copy.querySelectorAll("small,h5,p").forEach((node) => {
        node.style.setProperty("color", "#ffffff", "important");
        node.style.setProperty("-webkit-text-fill-color", "#ffffff", "important");
      });
    });
  }

  function repair() {
    repairContrast();
    repairPracticeMedia();
  }

  function scheduleRepair() {
    requestAnimationFrame(() => {
      repair();
      setTimeout(repair, 80);
      setTimeout(repair, 350);
    });
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-open-panel='islamic'],[data-islamic-view],[data-v56-module]")) {
      scheduleRepair();
    }
  }, true);

  function init() {
    document.documentElement.dataset.paibpContrastFix = VERSION;
    scheduleRepair();
    const panel = $("#panel-islamic,[data-panel='islamic']");
    if (panel) {
      const observer = new MutationObserver((mutations) => {
        if (mutations.some((item) => item.addedNodes.length || item.type === "attributes")) scheduleRepair();
      });
      observer.observe(panel, { childList:true, subtree:true, attributes:true, attributeFilter:["aria-selected","src"] });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
  else init();

  window.PAIBP_V57 = Object.freeze({ version:VERSION, repair });
})();
(() => {
  "use strict";

  const VERSION = "58";
  const POLICY_KEY = "paibp-smart-chapter-policy-v44";
  const PROGRESS_KEY = "paibp-smart-progress-v3";
  const TEACHER_KEY = "paibp-smart-teacher-identity-v1";
  const EDITOR_KEY = "paibp-smart-editor-unlocked";
  const CONFIG = window.PAIBP_CONFIG || {};
  const ENDPOINT = String(CONFIG.syncEndpoint || CONFIG.realtimeEndpoint || "").trim();
  const READ_KEY = String(CONFIG.syncReadKey || CONFIG.realtimeReadKey || "").trim();
  const CONFIGURED = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(ENDPOINT);

  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];
  const parse = (value, fallback) => { try { return JSON.parse(value); } catch { return fallback; } };
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  })[character]);

  let chapters = [];
  let policy = readPolicy();
  let applying = false;
  let listObserver = null;

  function currentRole() {
    try { return String(window.PAIBP_V56?.role?.() || "").toLowerCase(); } catch {}
    const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    const gateway = String(document.body?.dataset.privateGateway || "").toLowerCase();
    if (file === "kendali-editor.html" || gateway === "editor") return "editor";
    if (file === "akses-guru.html" || gateway === "guru") return "teacher";
    return String(document.body?.dataset.portalRole || "student").toLowerCase();
  }

  function isEditor() {
    const file = (location.pathname.split("/").pop() || "").toLowerCase();
    const session = String(sessionStorage.getItem(EDITOR_KEY) || "").toLowerCase();
    const local = String(localStorage.getItem(EDITOR_KEY) || "").toLowerCase();
    return currentRole() === "editor" || file === "kendali-editor.html"
      || session === "true" || session === "yes" || local === "true" || local === "yes"
      || document.body?.dataset.teacherOwner === "yes";
  }

  function chapterOneIds() {
    return chapters.filter((item) => Number(item.number) === 1).map((item) => item.id);
  }

  function normalizePolicy(raw) {
    raw = raw && typeof raw === "object" ? raw : {};
    const modern = raw.checkboxMeaning === "locked-v46" || raw.checkboxMeaning === "locked-v58";
    const first = new Set(chapterOneIds());
    const forceLocked = [...new Set([
      ...(Array.isArray(raw.forceLocked) ? raw.forceLocked : []),
      ...(!modern && Array.isArray(raw.unlocked) ? raw.unlocked : [])
    ])].filter((id) => !first.has(id));
    return {
      mode: raw.mode === "open" ? "open" : "sequential",
      unlocked: modern && Array.isArray(raw.unlocked) ? [...new Set(raw.unlocked)] : [],
      forceLocked,
      checkboxMeaning: "locked-v58",
      updatedAt: raw.updatedAt || "",
      updatedBy: raw.updatedBy || ""
    };
  }

  function readPolicy() {
    return normalizePolicy(parse(localStorage.getItem(POLICY_KEY), {}) || {});
  }

  function persistPolicy(next, { remote = false } = {}) {
    policy = normalizePolicy(next);
    try { localStorage.setItem(POLICY_KEY, JSON.stringify(policy)); } catch {}
    applyChapterLocks();
    renderEditorControl();
    if (remote) postPolicy();
  }

  function completedIds() {
    const state = parse(localStorage.getItem(PROGRESS_KEY), {}) || {};
    return Array.isArray(state.completed) ? state.completed.map(String) : [];
  }

  function previousChapter(chapter) {
    const items = chapters.filter((item) => item.grade === chapter.grade)
      .sort((a, b) => Number(a.number) - Number(b.number));
    const index = items.findIndex((item) => item.id === chapter.id);
    return index > 0 ? items[index - 1] : null;
  }

  function lockReason(chapter, completed) {
    if (isEditor()) return "";
    if (Number(chapter.number) === 1 || policy.mode === "open" || policy.unlocked.includes(chapter.id)) return "";
    if (policy.forceLocked.includes(chapter.id)) return "Bab ini dikunci oleh editor.";
    const previous = previousChapter(chapter);
    if (!previous || completed.includes(String(previous.id))) return "";
    return `Selesaikan Kelas ${previous.grade} Bab ${previous.number} terlebih dahulu.`;
  }

  function cardFor(button) {
    return button.closest(".chapter-package,article,.chapter-card,.material-card,.chapter-item") || button.parentElement;
  }

  function decorateCard(card, chapter, reason) {
    if (!card) return;
    card.classList.toggle("v58-chapter-locked", Boolean(reason));
    card.dataset.chapterLock = reason ? "locked" : "open";
    let notice = $(".v58-chapter-lock-notice", card);
    if (!reason) { notice?.remove(); return; }
    if (!notice) {
      notice = document.createElement("div");
      notice.className = "v58-chapter-lock-notice";
      card.append(notice);
    }
    notice.innerHTML = `<span aria-hidden="true">🔒</span><div><strong>Bab ${esc(chapter.number)} belum dapat dibuka</strong><small>${esc(reason)}</small></div>`;
  }

  function applyChapterLocks() {
    if (applying || !chapters.length) return;
    const list = $("#chapter-list");
    if (!list) return;
    applying = true;
    const completed = completedIds();
    const groups = new Map();
    $$("[data-chapter]", list).forEach((button) => {
      const id = String(button.dataset.chapter || "");
      if (!groups.has(id)) groups.set(id, []);
      groups.get(id).push(button);
    });
    groups.forEach((buttons, id) => {
      const chapter = chapters.find((item) => String(item.id) === id);
      if (!chapter) return;
      const reason = lockReason(chapter, completed);
      buttons.forEach((button) => {
        button.disabled = Boolean(reason);
        button.setAttribute("aria-disabled", String(Boolean(reason)));
        button.classList.toggle("v58-button-locked", Boolean(reason));
        if (reason) button.title = reason; else button.removeAttribute("title");
      });
      decorateCard(cardFor(buttons[0]), chapter, reason);
    });
    applying = false;
  }

  function editorIdentity() {
    const identity = parse(localStorage.getItem(TEACHER_KEY), {}) || {};
    return `${identity.name || identity.teacherName || "Editor"}${identity.workUnit || identity.school ? ` — ${identity.workUnit || identity.school}` : ""}`;
  }

  function toast(message, tone = "success") {
    let node = $("#v58-toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "v58-toast";
      node.setAttribute("role", "status");
      node.setAttribute("aria-live", "polite");
      document.body.append(node);
    }
    node.dataset.tone = tone;
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), 3600);
  }

  function postPolicy() {
    if (!CONFIGURED || !READ_KEY) {
      toast("Kuncian tersimpan pada perangkat editor. Server belum tersambung.", "warning");
      return;
    }
    fetch(ENDPOINT, {
      method:"POST",
      mode:"no-cors",
      headers:{"Content-Type":"text/plain;charset=UTF-8"},
      body:JSON.stringify({
        action:"contentUpsert",
        readKey:READ_KEY,
        origin:location.origin,
        data:{ key:"chapterAccessPolicy", value:policy, authorName:editorIdentity(), updatedAt:new Date().toISOString() }
      })
    }).then(() => toast("Kuncian bab diterapkan ke seluruh perangkat.", "success"))
      .catch(() => toast("Kuncian tersimpan lokal, tetapi pengiriman ke server gagal.", "error"));
  }

  function renderEditorControl() {
    if (!isEditor() || !chapters.length) return;
    let panel = $("#v58-editor-chapter-control");
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "v58-editor-chapter-control";
      const cat = $("#v56-class-control");
      if (cat) cat.insertAdjacentElement("afterend", panel);
      else ($("main") || document.body).prepend(panel);
    }
    const signature = JSON.stringify({mode:policy.mode,forceLocked:policy.forceLocked,count:chapters.length});
    if (panel.dataset.signature === signature) return;
    panel.dataset.signature = signature;
    const grouped = ["VII","VIII","IX"].map((grade) => ({
      grade,
      items:chapters.filter((item) => item.grade === grade).sort((a,b) => Number(a.number)-Number(b.number))
    }));
    panel.innerHTML = `
      <header>
        <div><span>KENDALI EDITOR • AKSES BAB MURID</span><h2>Kuncian Bab dan Pembelajaran Berurutan</h2><p>Bab 1 selalu terbuka. Centang berarti bab dikunci paksa. Tanpa centang, bab berikutnya terbuka setelah bab sebelumnya selesai.</p></div>
        <div class="v58-policy-modes"><button type="button" data-v58-mode="sequential" aria-pressed="${policy.mode === "sequential"}">Urut & Terkunci</button><button type="button" data-v58-mode="open" aria-pressed="${policy.mode === "open"}">Buka Semua</button></div>
      </header>
      <div class="v58-lock-grade-grid">${grouped.map(({grade,items}) => `<section><h3>Kelas ${grade}</h3>${items.map((chapter) => {
        const first = Number(chapter.number) === 1;
        const checked = !first && policy.forceLocked.includes(chapter.id);
        return `<label class="${checked ? "v58-force-locked" : ""} ${first ? "v58-first-chapter" : ""}"><input type="checkbox" data-v58-lock="${esc(chapter.id)}" ${checked ? "checked" : ""} ${first ? "disabled" : ""}><span><strong>${first ? "🔓" : checked ? "🔒" : "▫"} Bab ${chapter.number}</strong><small>${esc(chapter.title)}</small></span></label>`;
      }).join("")}</section>`).join("")}</div>
      <footer><span><strong>Dicentang = dikunci.</strong> Bab 1 selalu terbuka. Mode Buka Semua menonaktifkan seluruh kuncian.</span><button type="button" data-v58-save>Simpan Kuncian dan Terapkan ke Murid</button></footer>`;

    $$("[data-v58-mode]", panel).forEach((button) => button.addEventListener("click", () => {
      policy.mode = button.dataset.v58Mode === "open" ? "open" : "sequential";
      $$("[data-v58-mode]", panel).forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    }));
    $("[data-v58-save]", panel)?.addEventListener("click", () => {
      const forceLocked = $$("[data-v58-lock]:checked", panel).map((input) => input.dataset.v58Lock);
      persistPolicy({ ...policy, forceLocked, updatedAt:new Date().toISOString(), updatedBy:editorIdentity(), checkboxMeaning:"locked-v58" }, {remote:true});
    });
  }

  function useRemoteSnapshot(snapshot) {
    const remote = snapshot?.content?.chapterAccessPolicy;
    if (!remote || typeof remote !== "object") return;
    const incoming = normalizePolicy(remote);
    if (JSON.stringify(incoming) !== JSON.stringify(policy)) persistPolicy(incoming);
  }

  async function refreshRemotePolicy() {
    try {
      if (window.PAIBP_REALTIME_V56?.lastSnapshot) useRemoteSnapshot(window.PAIBP_REALTIME_V56.lastSnapshot);
      const data = await window.PAIBP_REALTIME_V56?.jsonp?.("publicSnapshot", {}, 14000);
      if (data) useRemoteSnapshot(data);
    } catch {}
  }

  function clearBrokenContrast(root = document) {
    const nodes = [];
    if (root instanceof Element && root.matches(".v56-contrast-light,.v56-contrast-dark")) nodes.push(root);
    nodes.push(...$$(".v56-contrast-light,.v56-contrast-dark", root));
    nodes.forEach((node) => node.classList.remove("v56-contrast-light", "v56-contrast-dark"));
  }

  function repairLogos(root = document) {
    const images = [];
    if (root instanceof HTMLImageElement) images.push(root);
    images.push(...$$("img", root));
    images.forEach((image) => {
      const identity = `${image.alt || ""} ${image.getAttribute("src") || ""}`;
      if (/logo\s*smp\s*negeri\s*1\s*susukan|logo-spensus/i.test(identity)) image.classList.add("v58-logo-contrast");
    });
  }

  function repairVisuals(root = document) {
    clearBrokenContrast(root);
    repairLogos(root);
    document.documentElement.dataset.paibpFinal = VERSION;
  }

  function scheduleRepair() {
    requestAnimationFrame(() => {
      repairVisuals();
      applyChapterLocks();
      setTimeout(() => { repairVisuals(); applyChapterLocks(); renderEditorControl(); }, 120);
      setTimeout(() => { repairVisuals(); applyChapterLocks(); }, 420);
    });
  }

  function bindListObserver() {
    const list = $("#chapter-list");
    if (!list || list.dataset.v58Observed === "yes") return;
    list.dataset.v58Observed = "yes";
    listObserver?.disconnect();
    listObserver = new MutationObserver(() => requestAnimationFrame(applyChapterLocks));
    listObserver.observe(list, {childList:true,subtree:true});
  }

  function init() {
    chapters = Array.isArray(window.PAIBP_DATA?.chapters) ? window.PAIBP_DATA.chapters : [];
    if (!chapters.length) { setTimeout(init, 180); return; }
    if (document.documentElement.dataset.paibpV58Ready === "yes") return;
    document.documentElement.dataset.paibpV58Ready = "yes";
    policy = readPolicy();
    repairVisuals();
    bindListObserver();
    applyChapterLocks();
    renderEditorControl();
    refreshRemotePolicy();

    document.addEventListener("paibp-realtime-v56", (event) => useRemoteSnapshot(event.detail));
    document.addEventListener("click", (event) => {
      const locked = event.target.closest("[data-chapter].v58-button-locked");
      if (locked) {
        event.preventDefault();
        event.stopImmediatePropagation();
        toast(locked.title || "Bab ini masih terkunci.", "warning");
        return;
      }
      if (event.target.closest('[data-open-panel="islamic"],[data-islamic-view],[data-open-panel="student"],[data-grade-filter],[data-semester-filter]')) scheduleRepair();
    }, true);

    window.addEventListener("storage", (event) => {
      if (event.key === PROGRESS_KEY) applyChapterLocks();
      if (event.key === POLICY_KEY) { policy = readPolicy(); applyChapterLocks(); renderEditorControl(); }
    });

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          repairVisuals(node);
        }
      }
      bindListObserver();
    });
    observer.observe(document.body, {childList:true,subtree:true});

    setInterval(() => { clearBrokenContrast(); bindListObserver(); applyChapterLocks(); renderEditorControl(); }, 2200);
    setInterval(refreshRemotePolicy, 180000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();

  window.PAIBP_V58 = Object.freeze({version:VERSION,repair:scheduleRepair,applyChapterLocks,refreshRemotePolicy});
})();
