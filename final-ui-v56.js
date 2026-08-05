(() => {
  "use strict";

  const VERSION = "56";
  const CONFIG = window.PAIBP_CONFIG || {};
  const ENDPOINT = String(CONFIG.syncEndpoint || CONFIG.realtimeEndpoint || "").trim();
  const READ_KEY = String(CONFIG.syncReadKey || CONFIG.realtimeReadKey || "").trim();
  const ENDPOINT_READY = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(ENDPOINT);
  const MEDIA = window.PAIBP_V56_MEDIA || {};

  const KEYS = {
    cat: "paibp-smart-cat-session-v56",
    authority: "paibp-smart-authority-v56",
    classContext: "paibp-smart-class-context-v56",
    teacher: "paibp-smart-teacher-identity-v1",
    student: "paibp-smart-student-identity-v1",
    progress: "paibp-smart-progress-v3"
  };

  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];
  const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const parse = (value, fallback) => { try { return JSON.parse(value); } catch { return fallback; } };
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  })[character]);
  const pathname = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const url = new URL(location.href);

  let cat = parse(sessionStorage.getItem(KEYS.cat), null) || {
    active:false, scope:"", grade:"", startedAt:0, resetEpoch:0,
    durationMinutes:45, releasedAt:0, reason:""
  };
  let classContext = readClassContext();
  let snapshot = null;
  let timerInterval = 0;
  let policyInterval = 0;
  let completionInterval = 0;
  let historyArmed = false;
  let practiceBuilt = false;

  function normalizeGrade(value) {
    const text = clean(value).toUpperCase().replace(/KELAS|FASE|GRADE|TINGKAT/g, "").trim();
    if (/\b(?:VII|7)\b/.test(text)) return "VII";
    if (/\b(?:VIII|8)\b/.test(text)) return "VIII";
    if (/\b(?:IX|9)\b/.test(text)) return "IX";
    if (text === "*") return "*";
    return "";
  }

  function fnv(value) {
    let hash = 2166136261;
    for (const character of String(value || "")) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function teacherIdentity() {
    return parse(localStorage.getItem(KEYS.teacher), {}) || {};
  }

  function studentIdentity() {
    return parse(localStorage.getItem(KEYS.student), {}) || {};
  }

  function teacherScope(identity = teacherIdentity()) {
    const name = clean(identity.name || identity.teacherName);
    const school = clean(identity.workUnit || identity.school || identity.teacherSchool);
    return name || school ? `guru-${fnv(`${name.toLowerCase()}|${school.toLowerCase()}`)}` : "guru-tanpa-identitas";
  }

  function authority() {
    const gateway = String(document.body?.dataset.privateGateway || "").toLowerCase();
    const bodyRole = String(document.body?.dataset.portalRole || "").toLowerCase();
    const stored = sessionStorage.getItem(KEYS.authority) || "";
    const editorToken = sessionStorage.getItem("paibp-smart-owner-gateway-v30") === "yes"
      || sessionStorage.getItem("paibp-smart-editor-unlocked") === "true"
      || localStorage.getItem("paibp-smart-editor-unlocked") === "true";

    if (pathname === "kendali-editor.html" || gateway === "editor" || stored === "editor" || editorToken) {
      sessionStorage.setItem(KEYS.authority, "editor");
      return "editor";
    }
    if (pathname === "akses-guru.html" || gateway === "guru" || bodyRole === "guru" || stored === "teacher") {
      sessionStorage.setItem(KEYS.authority, "teacher");
      return "teacher";
    }
    const identity = teacherIdentity();
    if (identity.teacherRecognized === true || identity.recognized === true) {
      sessionStorage.setItem(KEYS.authority, "teacher");
      return "teacher";
    }
    return "student";
  }

  const privileged = () => authority() !== "student";
  const editor = () => authority() === "editor";

  function readClassContext() {
    const saved = parse(sessionStorage.getItem(KEYS.classContext), null)
      || parse(localStorage.getItem(KEYS.classContext), null)
      || {};
    const queryGrade = normalizeGrade(url.searchParams.get("ps_grade") || url.searchParams.get("kelas"));
    const result = {
      scope: clean(url.searchParams.get("ps_scope") || saved.scope || ""),
      grade: queryGrade || normalizeGrade(saved.grade),
      teacherName: clean(url.searchParams.get("ps_teacher") || saved.teacherName || ""),
      teacherSchool: clean(url.searchParams.get("ps_school") || saved.teacherSchool || ""),
      catRequested: url.searchParams.get("ps_cat") === "1" || saved.catRequested === true,
      durationMinutes: Math.max(5, Math.min(240, Number(url.searchParams.get("ps_duration") || saved.durationMinutes || 45)))
    };
    if (result.grade) {
      try {
        sessionStorage.setItem(KEYS.classContext, JSON.stringify(result));
        localStorage.setItem(KEYS.classContext, JSON.stringify(result));
      } catch {}
    }
    return result;
  }

  function toast(message, tone = "info") {
    let node = $("#v56-toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "v56-toast";
      node.setAttribute("role", "status");
      node.setAttribute("aria-live", "polite");
      document.body.append(node);
    }
    node.dataset.tone = tone;
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), 3200);
  }

  function currentStudentPanel() {
    return $("#panel-student,[data-panel='student']");
  }

  function showStudentPanel() {
    const panel = currentStudentPanel();
    if (!panel) return;
    panel.hidden = false;
    panel.removeAttribute("hidden");
    $$(".workspace-panel").forEach((node) => { if (node !== panel) node.hidden = true; });
  }

  function removeLegacyLocks() {
    [
      "paibp-smart-cat-session-v52", "paibp-smart-cat-session-v53", "paibp-smart-cat-session-v54",
      "paibp-smart-cat-session-v55", "paibp-smart-focus-session-v48", "paibp-smart-focus-session-v50"
    ].forEach((key) => { try { sessionStorage.removeItem(key); } catch {} });
    document.documentElement.classList.remove(
      "v48-student-focus", "v50-task-focus", "v52-cat-mode", "v53-cat-mode", "v54-cat-mode", "v55-cat-mode"
    );
    [
      "#v48-focus-gate", "#v50-focus-resume", "#v52-cat-bar", "#v53-cat-bar", "#v54-cat-bar",
      "#v55-cat-bar", "#v52-editor-cat", "#v54-authority-panel", "#v55-supervisor-tools"
    ].forEach((selector) => $(selector)?.remove());
  }

  function saveCat() {
    try { sessionStorage.setItem(KEYS.cat, JSON.stringify(cat)); } catch {}
  }

  function classPolicyKey(scope, grade) {
    return `catPolicy:${scope || "*"}:${grade || "*"}`;
  }

  function selectPolicy(data, context = classContext) {
    const content = data?.content || {};
    const exact = content[classPolicyKey(context.scope, context.grade)];
    const globalGrade = content[classPolicyKey("*", context.grade)];
    const globalAll = content[classPolicyKey("*", "*")];
    return exact && typeof exact === "object" ? exact
      : globalGrade && typeof globalGrade === "object" ? globalGrade
      : globalAll && typeof globalAll === "object" ? globalAll
      : null;
  }

  function postJson(action, data) {
    if (!ENDPOINT_READY) return Promise.reject(new Error("Backend belum tersambung."));
    return fetch(ENDPOINT, {
      method:"POST", mode:"no-cors", cache:"no-store",
      headers:{"Content-Type":"text/plain;charset=UTF-8"},
      body:JSON.stringify({ action, readKey:READ_KEY, origin:location.origin, data })
    });
  }

  async function savePolicy(scope, grade, policy) {
    const data = { scope, grade, policy, updatedAt:new Date().toISOString() };
    if (window.PAIBP_REALTIME_V56?.setClassPolicy) return window.PAIBP_REALTIME_V56.setClassPolicy(data);
    return postJson("classControl", data);
  }

  function copyText(value) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value);
    window.prompt("Salin tautan berikut:", value);
    return Promise.resolve();
  }

  function buildClassLink(grade, durationMinutes, scope) {
    const identity = teacherIdentity();
    const target = new URL("index.html", document.baseURI);
    target.searchParams.set("ps_grade", grade);
    target.searchParams.set("ps_scope", scope);
    target.searchParams.set("ps_teacher", clean(identity.name || identity.teacherName || (editor() ? "Editor PAIBP SMART" : "Guru")));
    target.searchParams.set("ps_school", clean(identity.workUnit || identity.school || identity.teacherSchool || "SMP Negeri 1 Susukan"));
    target.searchParams.set("ps_cat", "1");
    target.searchParams.set("ps_duration", String(durationMinutes));
    return target.href;
  }

  function authorityScope() {
    return editor() ? "*" : teacherScope();
  }

  function ensureAuthorityPanel() {
    if (!privileged()) return;
    let panel = $("#v56-class-control");
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "v56-class-control";
      const main = $("#main") || $("main") || document.body;
      main.prepend(panel);
    }
    const roleLabel = editor() ? "KENDALI EDITOR" : "KENDALI GURU";
    panel.innerHTML = `
      <header>
        <div><span>${roleLabel}</span><h2>Mode CAT, Kelas, dan Timer Murid</h2>
        <p>Link kelas mengunci murid tepat pada kelas yang dipilih. Guru mengendalikan kelasnya; editor dapat mengendalikan seluruh kelas.</p></div>
        <b data-v56-control-status>Siap dikonfigurasi</b>
      </header>
      <div class="v56-control-grid">
        <label><span>Kelas tujuan</span><select data-v56-grade>
          ${editor() ? '<option value="*">Semua kelas</option>' : ''}
          <option value="VII">Kelas VII</option><option value="VIII">Kelas VIII</option><option value="IX">Kelas IX</option>
        </select></label>
        <label><span>Waktu mengerjakan</span><div class="v56-duration"><input data-v56-duration type="number" min="5" max="240" step="5" value="45"><em>menit</em></div></label>
        <div class="v56-control-actions">
          <button type="button" data-v56-share>Bagikan Link Kelas</button>
          <button type="button" data-v56-enable>Aktifkan CAT + Timer</button>
          <button type="button" data-v56-reset>Setel Ulang Timer</button>
          <button type="button" data-v56-stop>Hentikan CAT</button>
          ${editor() ? '<button type="button" data-v56-stop-all>Hentikan Semua CAT</button>' : ''}
        </div>
      </div>`;

    const gradeSelect = $("[data-v56-grade]", panel);
    const durationInput = $("[data-v56-duration]", panel);
    const status = $("[data-v56-control-status]", panel);
    const scope = authorityScope();

    const grades = () => gradeSelect.value === "*" ? ["VII","VIII","IX"] : [gradeSelect.value];
    const duration = () => Math.max(5, Math.min(240, Number(durationInput.value || 45)));
    const updateStatus = (message, tone = "ready") => { status.textContent = message; status.dataset.tone = tone; };

    $("[data-v56-share]", panel).onclick = async () => {
      if (gradeSelect.value === "*") { toast("Pilih satu kelas untuk membuat link kelas.", "warning"); return; }
      const linkScope = editor() ? "*" : scope;
      await copyText(buildClassLink(gradeSelect.value, duration(), linkScope));
      updateStatus(`Link Kelas ${gradeSelect.value} tersalin`, "success");
      toast(`Link Kelas ${gradeSelect.value} berhasil disalin.`, "success");
    };

    $("[data-v56-enable]", panel).onclick = async () => {
      const now = Date.now();
      updateStatus("Mengaktifkan…", "pending");
      for (const grade of grades()) {
        await savePolicy(scope, grade, {
          enabled:true, durationMinutes:duration(), resetEpoch:now, releaseEpoch:0,
          teacherName:clean(teacherIdentity().name || teacherIdentity().teacherName),
          teacherSchool:clean(teacherIdentity().workUnit || teacherIdentity().school),
          scope, grade
        });
      }
      updateStatus(`CAT aktif • ${duration()} menit`, "success");
      toast("Mode CAT dan timer berhasil diaktifkan.", "success");
      setTimeout(() => window.PAIBP_REALTIME_V56?.refresh?.(), 900);
    };

    $("[data-v56-reset]", panel).onclick = async () => {
      const now = Date.now();
      updateStatus("Menyetel ulang timer…", "pending");
      for (const grade of grades()) {
        await savePolicy(scope, grade, {
          enabled:true, durationMinutes:duration(), resetEpoch:now, releaseEpoch:0,
          scope, grade, resetBy:authority()
        });
      }
      updateStatus(`Timer dimulai ulang • ${duration()} menit`, "success");
      toast("Timer murid telah dimulai ulang.", "success");
      setTimeout(() => window.PAIBP_REALTIME_V56?.refresh?.(), 900);
    };

    $("[data-v56-stop]", panel).onclick = async () => {
      const now = Date.now();
      updateStatus("Menghentikan…", "pending");
      for (const grade of grades()) {
        await savePolicy(scope, grade, { enabled:false, durationMinutes:duration(), resetEpoch:0, releaseEpoch:now, scope, grade });
      }
      updateStatus("CAT dihentikan", "stopped");
      toast("Mode CAT kelas terpilih dihentikan.", "success");
      setTimeout(() => window.PAIBP_REALTIME_V56?.refresh?.(), 900);
    };

    $("[data-v56-stop-all]", panel)?.addEventListener("click", async () => {
      const now = Date.now();
      updateStatus("Menghentikan seluruh kelas…", "pending");
      await savePolicy("*", "*", { enabled:false, releaseEpoch:now, resetEpoch:0, scope:"*", grade:"*" });
      for (const grade of ["VII","VIII","IX"]) {
        await savePolicy("*", grade, { enabled:false, releaseEpoch:now, resetEpoch:0, scope:"*", grade });
      }
      updateStatus("Seluruh CAT dihentikan", "stopped");
      toast("Editor menghentikan seluruh sesi CAT.", "success");
      setTimeout(() => window.PAIBP_REALTIME_V56?.refresh?.(), 900);
    });
  }

  function gradeOfNode(node) {
    if (!node) return "";
    return normalizeGrade(node.dataset.grade || node.dataset.studentGrade || node.dataset.teacherGrade || node.dataset.class || clean(node.textContent));
  }

  function applyGradeLock() {
    if (!classContext.grade) return;
    const panel = currentStudentPanel();
    if (!panel) return;
    panel.dataset.v56LockedGrade = classContext.grade;

    const controls = $$("button,a,[role='tab']", panel).filter((node) => {
      const grade = gradeOfNode(node);
      return grade === "VII" || grade === "VIII" || grade === "IX";
    });
    controls.forEach((node) => {
      const grade = gradeOfNode(node);
      node.hidden = grade !== classContext.grade;
      node.setAttribute("aria-disabled", String(grade !== classContext.grade));
      if (grade === classContext.grade && node.getAttribute("aria-pressed") !== "true" && !node.dataset.v56AutoClicked) {
        node.dataset.v56AutoClicked = "yes";
        setTimeout(() => node.click(), 30);
      }
    });

    $$("[data-grade],[data-student-grade],[data-class-grade]", panel).forEach((node) => {
      const grade = gradeOfNode(node);
      if (grade && grade !== classContext.grade && !node.matches("button,a,[role='tab']")) node.hidden = true;
    });

    let badge = $("#v56-class-badge", panel);
    if (!badge) {
      badge = document.createElement("div");
      badge.id = "v56-class-badge";
      const heading = $(".panel-heading", panel);
      heading?.insertAdjacentElement("afterend", badge) || panel.prepend(badge);
    }
    badge.innerHTML = `<strong>Kelas ${classContext.grade}</strong><span>${esc(classContext.teacherName || "Kelas PAIBP SMART")}</span><small>Materi dan tugas terkunci pada kelas ini.</small>`;
  }

  function ensureCatBar() {
    let bar = $("#v56-cat-bar");
    if (!bar) {
      bar = document.createElement("header");
      bar.id = "v56-cat-bar";
      bar.innerHTML = `
        <div><span>MODE CAT • KELAS <b data-v56-cat-grade></b></span><strong data-v56-cat-title>Selesaikan seluruh tugas pada kelas ini</strong></div>
        <div class="v56-cat-time"><small>Sisa waktu</small><b data-v56-countdown>--:--</b></div>`;
      document.body.append(bar);
    }
    $("[data-v56-cat-grade]", bar).textContent = cat.grade || classContext.grade || "—";
    return bar;
  }

  function formatTime(milliseconds) {
    const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const rest = seconds % 60;
    return hours ? `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:${String(rest).padStart(2,"0")}`
      : `${String(minutes).padStart(2,"0")}:${String(rest).padStart(2,"0")}`;
  }

  function remainingMs() {
    const origin = Math.max(Number(cat.startedAt || 0), Number(cat.resetEpoch || 0));
    return Math.max(0, Number(cat.durationMinutes || 45) * 60000 - (Date.now() - origin));
  }

  function updateTimer() {
    if (!cat.active) return;
    const bar = ensureCatBar();
    const value = remainingMs();
    $("[data-v56-countdown]", bar).textContent = formatTime(value);
    if (value <= 0) releaseCat("timeout");
  }

  function startCat(policy = {}) {
    if (privileged()) return;
    const grade = classContext.grade || normalizeGrade(policy.grade);
    if (!grade) return;
    const resetEpoch = Number(policy.resetEpoch || Date.now());
    cat = {
      active:true,
      scope:classContext.scope || policy.scope || "*",
      grade,
      startedAt:resetEpoch || Date.now(),
      resetEpoch,
      durationMinutes:Math.max(5, Math.min(240, Number(policy.durationMinutes || classContext.durationMinutes || 45))),
      releasedAt:0,
      reason:""
    };
    saveCat();
    document.documentElement.classList.add("v56-cat-mode");
    showStudentPanel();
    applyGradeLock();
    ensureCatBar();
    if (!historyArmed) {
      historyArmed = true;
      try { history.pushState({paibpCatV56:true}, "", location.href); } catch {}
    }
    clearInterval(timerInterval);
    clearInterval(completionInterval);
    timerInterval = setInterval(updateTimer, 1000);
    completionInterval = setInterval(checkCompletion, 2500);
    updateTimer();
    window.PAIBP_REALTIME_V56?.record?.("cat-start", { chapter:grade, section:`${cat.durationMinutes} menit` });
  }

  function releaseCat(reason = "released") {
    if (!cat.active) return;
    cat.active = false;
    cat.reason = reason;
    cat.releasedAt = Date.now();
    saveCat();
    clearInterval(timerInterval);
    clearInterval(completionInterval);
    document.documentElement.classList.remove("v56-cat-mode");
    $("#v56-cat-bar")?.remove();
    window.PAIBP_REALTIME_V56?.record?.(`cat-${reason}`, { chapter:cat.grade });
    if (reason === "timeout") toast("Waktu mengerjakan habis. Sesi CAT ditutup.", "warning");
    else if (reason === "completed") toast("Tugas selesai. Navigasi keluar telah dibuka.", "success");
    else toast("Mode CAT dihentikan oleh guru atau editor.", "success");
  }

  function progressCompleted() {
    const progress = parse(localStorage.getItem(KEYS.progress), {}) || {};
    return [...new Set([progress.completed, progress.completedIds, progress.chaptersCompleted].filter(Array.isArray).flat().map(String))];
  }

  function activeChapter() {
    const node = $("[data-chapter].active,[data-chapter-id].active,[data-material-id].active,[aria-current='true'][data-chapter]");
    return node?.dataset.chapter || node?.dataset.chapterId || node?.dataset.materialId || "";
  }

  function checkCompletion() {
    if (!cat.active || privileged()) return;
    const active = activeChapter();
    if (active && progressCompleted().includes(String(active))) releaseCat("completed");
  }

  function applyPolicy(policy) {
    if (privileged() || !classContext.grade) return;
    if (!policy) {
      if (classContext.catRequested && !cat.active) startCat({
        enabled:true, durationMinutes:classContext.durationMinutes, resetEpoch:Date.now(), scope:classContext.scope, grade:classContext.grade
      });
      return;
    }
    const releaseEpoch = Number(policy.releaseEpoch || 0);
    if (!policy.enabled || (releaseEpoch && releaseEpoch >= Number(cat.startedAt || 0))) {
      if (cat.active) releaseCat("released");
      return;
    }
    if (!cat.active) {
      startCat(policy);
      return;
    }
    const incomingReset = Number(policy.resetEpoch || 0);
    const incomingDuration = Math.max(5, Math.min(240, Number(policy.durationMinutes || cat.durationMinutes)));
    if (incomingReset > Number(cat.resetEpoch || 0) || incomingDuration !== Number(cat.durationMinutes)) {
      cat.resetEpoch = incomingReset || Date.now();
      cat.startedAt = cat.resetEpoch;
      cat.durationMinutes = incomingDuration;
      saveCat();
      updateTimer();
      toast("Timer telah disetel ulang oleh guru.", "success");
    }
  }

  function handleSnapshot(data) {
    snapshot = data;
    applyPolicy(selectPolicy(data));
  }

  function blockCatNavigation(event) {
    if (!cat.active || privileged()) return;
    const target = event.target.closest("a,button,[data-open-panel],[data-close-workspace]");
    if (!target) return;
    const inside = target.closest("#panel-student,[data-panel='student']");
    const label = clean(target.textContent);
    const allowedInside = inside && !/beranda|fitur islami|game|portal guru|about|kontak|keluar|tutup|menu utama/i.test(label);
    const grade = gradeOfNode(target);
    if (grade && grade !== cat.grade) {
      event.preventDefault();
      event.stopImmediatePropagation();
      toast(`Sesi ini dikunci untuk Kelas ${cat.grade}.`, "warning");
      return;
    }
    if (allowedInside || target.matches("input,textarea,select,option,label")) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    showStudentPanel();
    toast("Mode CAT aktif. Selesaikan tugas atau tunggu waktu berakhir.", "warning");
  }

  function ensureSupervisorTools() {
    if (!privileged()) return;
    let tools = $("#v56-supervisor-tools");
    if (!tools) {
      tools = document.createElement("aside");
      tools.id = "v56-supervisor-tools";
      document.body.append(tools);
    }
    tools.innerHTML = `<span>${editor() ? "EDITOR" : "GURU"} • PRATINJAU BEBAS</span><button type="button">Keluar dari Ruang Murid</button>`;
    $("button", tools).onclick = () => {
      currentStudentPanel()?.setAttribute("hidden", "");
      const teacherPanel = $("#panel-teacher,[data-panel='teacher']") || $("#panel-welcome,[data-panel='welcome']");
      if (teacherPanel) teacherPanel.hidden = false;
      tools.remove();
    };
  }

  function enterStudentRoom() {
    if (privileged()) {
      cat.active = false;
      saveCat();
      document.documentElement.classList.remove("v56-cat-mode");
      $("#v56-cat-bar")?.remove();
      setTimeout(ensureSupervisorTools, 60);
      return;
    }
    applyGradeLock();
    const policy = selectPolicy(snapshot);
    if (policy?.enabled || classContext.catRequested) startCat(policy || {});
  }

  function colorizePortal() {
    const tones = ["emerald","blue","purple","orange","rose","teal","indigo","gold"];
    $$(".hero-access-panel .access-tile").forEach((node, index) => {
      node.dataset.v56Tone = tones[index % tones.length];
      node.querySelectorAll("strong,small,b,span,p").forEach((part) => {
        part.hidden = false;
        part.style.removeProperty("color");
        part.style.removeProperty("opacity");
        part.style.removeProperty("visibility");
      });
    });
    $$(".feature-grid article,.home-feature-card,.feature-card-v25,.portal-card,.service-card").forEach((node, index) => {
      node.classList.add("v56-color-card");
      node.dataset.v56Tone = tones[(index + 2) % tones.length];
    });
    $$(".hero-metrics-v25,.portal-metrics").forEach((node) => node.classList.add("v56-retired-metrics"));
  }

  const ISLAM_PATTERN = /beranda|al qur|hisnul|dzikir pagi|dzikir petang|kalender hijriah|bahasa arab|khutbah|tajwid|simulasi|nasihat/i;

  function repairIslamicNav() {
    const panel = $("#panel-islamic,[data-panel='islamic']");
    if (!panel) return;
    const controls = $$("a,button,[role='tab']", panel).filter((node) => ISLAM_PATTERN.test(clean(node.textContent)));
    if (controls.length < 5) return;
    let best = null;
    for (const control of controls) {
      let node = control.parentElement;
      for (let depth = 0; node && node !== panel && depth < 6; depth++, node = node.parentElement) {
        const count = $$("a,button,[role='tab']", node).filter((item) => ISLAM_PATTERN.test(clean(item.textContent))).length;
        if (count >= 5 && (!best || count > best.count || (count === best.count && depth < best.depth))) best = { node, count, depth };
      }
    }
    if (!best?.node) return;
    const nav = best.node;
    nav.classList.add("v56-islamic-nav");
    nav.parentElement?.classList.add("v56-islamic-layout");
    const heading = $(".panel-heading", panel);
    if (heading && nav.parentElement !== panel) panel.insertBefore(nav, heading.nextSibling);
    else if (heading && heading.nextElementSibling !== nav) heading.insertAdjacentElement("afterend", nav);
    const tones = ["emerald","blue","purple","orange","rose","teal","indigo","gold","sky","lime"];
    $$("a,button,[role='tab']", nav).forEach((node, index) => node.dataset.v56Tone = tones[index % tones.length]);
  }

  function media(name) {
    return MEDIA[name] || "";
  }

  const MODULES = [
    {
      id:"wudhu", title:"Wudhu", icon:"💧", summary:"Sembilan tahap wudhu dari niat sampai doa setelah wudhu.", poster:"wudhu-poster.webp",
      steps:[
        ["wudhu-01.webp","Niat dan basmalah","Berniat dalam hati untuk bersuci karena Allah Subhanahu Wata'ala, lalu membaca basmalah.","بِسْمِ اللّٰهِ","Bismillāh"],
        ["wudhu-02.webp","Membasuh telapak tangan","Membasuh kedua telapak tangan sampai pergelangan sebanyak tiga kali."],
        ["wudhu-03.webp","Berkumur","Mengambil air dengan tangan kanan, berkumur, lalu mengeluarkannya."],
        ["wudhu-04.webp","Membersihkan hidung","Memasukkan air ke hidung secukupnya lalu mengeluarkannya."],
        ["wudhu-05.webp","Membasuh wajah","Membasuh seluruh wajah secara merata sebanyak tiga kali."],
        ["wudhu-06.webp","Membasuh tangan sampai siku","Mendahulukan tangan kanan lalu kiri, masing-masing tiga kali."],
        ["wudhu-07.webp","Mengusap kepala","Mengusap kepala satu kali secara tertib."],
        ["wudhu-08.webp","Mengusap telinga","Membersihkan bagian dalam dan luar kedua telinga."],
        ["wudhu-09.webp","Membasuh kaki dan berdoa","Membasuh kaki kanan lalu kiri sampai mata kaki, kemudian membaca doa setelah wudhu.","أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيْكَ لَهُ","Asyhadu allā ilāha illallāhu wahdahu lā syarīka lah"]
      ]
    },
    {
      id:"sholat", title:"Sholat", icon:"🕌", summary:"Gerakan sholat dari takbiratul ihram sampai salam dengan bacaan pokok.",
      steps:[
        ["sholat-01.webp","Takbiratul ihram","Berdiri menghadap kiblat, berniat, lalu mengangkat kedua tangan.","اللّٰهُ أَكْبَرُ","Allāhu akbar"],
        ["sholat-02.webp","Berdiri dan membaca","Bersedekap, membaca doa iftitah, Al Fatihah, dan Al Qur'an Surat pilihan.","الْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِينَ","Alhamdu lillāhi rabbil 'ālamīn"],
        ["sholat-03.webp","Ruku","Membungkuk dengan punggung rata dan tuma'ninah.","سُبْحَانَ رَبِّيَ الْعَظِيمِ وَبِحَمْدِهِ","Subhāna rabbiyal 'azhīmi wa bihamdih"],
        ["sholat-04.webp","I'tidal","Bangkit dari ruku dan berdiri tegak dengan tuma'ninah.","سَمِعَ اللّٰهُ لِمَنْ حَمِدَهُ","Sami'allāhu liman hamidah"],
        ["sholat-05.webp","Sujud","Meletakkan tujuh anggota sujud dan tuma'ninah.","سُبْحَانَ رَبِّيَ الْأَعْلَى وَبِحَمْدِهِ","Subhāna rabbiyal a'lā wa bihamdih"],
        ["sholat-06.webp","Duduk di antara dua sujud","Duduk dengan tuma'ninah sambil membaca doa.","رَبِّ اغْفِرْلِي وَارْحَمْنِي وَاجْبُرْنِي وَارْفَعْنِي","Rabbighfirlī warhamnī wajburnī warfa'nī"],
        ["sholat-07.webp","Tasyahud","Duduk tasyahud membaca tahiyat dan sholawat.","اَلتَّحِيَّاتُ لِلّٰهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ","At-tahiyyātu lillāhi wash-shalawātu wath-thayyibāt"],
        ["sholat-08.webp","Salam","Menoleh ke kanan lalu kiri untuk mengakhiri sholat.","السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ","Assalāmu'alaikum warahmatullāh"]
      ]
    },
    {
      id:"jamaah", title:"Sholat Berjamaah", icon:"👥", summary:"Posisi imam, shaf, gerakan bersama, serta ketentuan makmum masbuk.",
      steps:[
        ["jamaah-01.svg","Imam dan makmum siap","Imam berdiri di depan. Makmum membentuk shaf di belakang dan meluruskan barisan.","سَوُّوا صُفُوفَكُمْ","Sawwū shufūfakum — luruskan shaf kalian"],
        ["jamaah-02.svg","Takbir dan mengikuti imam","Makmum bertakbir setelah imam dan tidak mendahului gerakan imam.","اللّٰهُ أَكْبَرُ","Allāhu akbar"],
        ["jamaah-03.svg","Ruku dan sujud bersama","Makmum berpindah gerakan setelah imam dengan tertib dan tuma'ninah."],
        ["jamaah-04.svg","Salam dan makmum masbuk","Makmum mengikuti salam imam. Makmum masbuk menyempurnakan rakaat yang tertinggal.","السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ","Assalāmu'alaikum warahmatullāh"]
      ]
    },
    {
      id:"tayamum", title:"Tayamum", icon:"🪨", summary:"Tayamum sebagai pengganti wudhu ketika air tidak tersedia atau membahayakan.",
      steps:[
        ["tayamum-01.svg","Pastikan sebab tayamum","Tidak menemukan air atau penggunaan air membahayakan kesehatan."],
        ["tayamum-02.svg","Niat dan basmalah","Berniat tayamum karena Allah Subhanahu Wata'ala lalu membaca basmalah.","بِسْمِ اللّٰهِ","Bismillāh"],
        ["tayamum-03.svg","Sentuhkan telapak tangan","Menyentuhkan kedua telapak tangan pada debu atau permukaan suci."],
        ["tayamum-04.svg","Usap wajah","Mengusap seluruh wajah satu kali secara merata."],
        ["tayamum-05.svg","Usap kedua tangan","Mengusap tangan kanan lalu kiri secara tertib."]
      ]
    },
    {
      id:"puasa", title:"Puasa", icon:"🌙", summary:"Alur puasa dari niat, sahur, menjaga diri, sampai berbuka.",
      steps:[
        ["puasa-01.svg","Niat","Berniat puasa sesuai jenis dan waktunya sebelum memulai ibadah."],
        ["puasa-02.svg","Sahur","Makan dan minum secukupnya sebelum waktu Subuh."],
        ["puasa-03.svg","Menahan diri","Menahan makan, minum, dan seluruh hal yang membatalkan puasa."],
        ["puasa-04.svg","Menjaga akhlak","Menjaga ucapan, sikap, dan memperbanyak amal baik."],
        ["puasa-05.svg","Berbuka","Segera berbuka ketika Maghrib tiba.","ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ","Dzahabazh-zhama'u wabtallatil-'urūqu"]
      ]
    },
    {
      id:"zakat", title:"Zakat", icon:"🤲", summary:"Mengenali jenis, menghitung kewajiban, berniat, dan menyalurkan zakat.",
      steps:[
        ["zakat-01.svg","Kenali jenis zakat","Membedakan zakat fitrah dan zakat mal serta syarat masing-masing."],
        ["zakat-02.svg","Hitung kewajiban","Memeriksa ukuran, nishab, haul, dan jumlah yang wajib dikeluarkan."],
        ["zakat-03.svg","Niat","Berniat menunaikan zakat karena Allah Subhanahu Wata'ala."],
        ["zakat-04.svg","Salurkan kepada mustahik","Menyerahkan melalui amil atau langsung kepada golongan yang berhak."]
      ]
    },
    {
      id:"haji", title:"Haji", icon:"🕋", summary:"Urutan pokok manasik haji dari ihram sampai tahallul.",
      steps:[
        ["haji-01.svg","Ihram dan niat","Memakai pakaian ihram dan berniat dari miqat.","لَبَّيْكَ اللّٰهُمَّ لَبَّيْكَ","Labbaikallāhumma labbaik"],
        ["haji-02.svg","Wukuf di Arafah","Berdiam, berdzikir, berdoa, dan memohon ampun di Arafah."],
        ["haji-03.svg","Mabit di Muzdalifah","Bermalam dan mempersiapkan batu untuk melontar jumrah."],
        ["haji-04.svg","Melontar jumrah","Melontar jumrah di Mina dengan tertib."],
        ["haji-05.svg","Tawaf","Mengelilingi Ka'bah tujuh putaran berlawanan arah jarum jam."],
        ["haji-06.svg","Sa'i","Berjalan antara Shafa dan Marwah sebanyak tujuh kali."],
        ["haji-07.svg","Tahallul","Mencukur atau memotong rambut sebagai tanda keluar dari ihram."]
      ]
    },
    {
      id:"kurban", title:"Kurban", icon:"🐐", summary:"Pemilihan hewan, penyembelihan sesuai syariat, dan pembagian daging.",
      steps:[
        ["kurban-01.svg","Niat dan waktu","Berniat kurban dan melaksanakannya pada waktu yang ditentukan."],
        ["kurban-02.svg","Pilih hewan sehat","Memastikan hewan cukup umur, sehat, dan tidak cacat."],
        ["kurban-03.svg","Persiapan penyembelihan","Menghadapkan hewan ke kiblat dan memperlakukannya dengan baik."],
        ["kurban-04.svg","Penyembelihan","Membaca basmalah dan takbir, lalu menyembelih dengan alat tajam.","بِسْمِ اللّٰهِ، اللّٰهُ أَكْبَرُ","Bismillāh, Allāhu akbar"],
        ["kurban-05.svg","Pembagian daging","Mengolah dan membagikan daging secara bersih, adil, dan tertib."]
      ]
    }
  ];

  function buildPractice() {
    if (practiceBuilt) return;
    const panel = $("#panel-islamic,[data-panel='islamic']");
    if (!panel) return;
    practiceBuilt = true;
    ["#v50-simulation-board","#v51-worship-board","#v52-practice-board","#v53-practice-board","#v54-practice-board","#v55-practice-board"].forEach((selector) => $(selector)?.remove());

    const board = document.createElement("section");
    board.id = "v56-practice-board";
    board.innerHTML = `
      <header class="v56-practice-head"><div><span>PANDUAN VISUAL DAN PRAKTIK</span>
      <h3>Simulasi Ibadah Langkah demi Langkah</h3><p>Setiap tahap memakai visual berbeda, tata cara runtut, serta bacaan yang terbaca jelas.</p></div><b>ONLINE + LURING</b></header>
      <nav class="v56-practice-tabs">${MODULES.map((module, index) => `<button type="button" data-v56-module="${module.id}" aria-selected="${index === 0}">${module.icon} ${module.title}</button>`).join("")}</nav>
      <div data-v56-practice-content></div>`;
    panel.append(board);

    const content = $("[data-v56-practice-content]", board);
    const render = (module) => {
      content.innerHTML = `
        <section class="v56-module-intro"><div><span>${module.icon}</span><div><h4>${esc(module.title)}</h4><p>${esc(module.summary)}</p></div></div><b>${module.steps.length} tahap</b></section>
        ${module.poster && media(module.poster) ? `<figure class="v56-poster"><img src="${media(module.poster)}" alt="Urutan lengkap ${esc(module.title)}"><figcaption>Urutan lengkap ${esc(module.title)}</figcaption></figure>` : ""}
        <div class="v56-step-grid">${module.steps.map((step, index) => `
          <article class="v56-step">
            <figure><img src="${media(step[0])}" alt="${esc(step[1])}"><span>${index + 1}</span></figure>
            <div class="v56-step-copy"><small>TAHAP ${index + 1}</small><h5>${esc(step[1])}</h5><p>${esc(step[2])}</p>
            ${step[3] || step[4] ? `<aside><strong lang="ar" dir="rtl">${esc(step[3] || "")}</strong><em>${esc(step[4] || "")}</em></aside>` : ""}</div>
          </article>`).join("")}</div>
        <p class="v56-source-note">Seluruh visual tertanam langsung di dalam aplikasi, sehingga tidak hilang saat folder media terlewat dan tetap tersedia dalam moda luring.</p>`;
    };
    render(MODULES[0]);
    $$("[data-v56-module]", board).forEach((button) => button.addEventListener("click", () => {
      const module = MODULES.find((item) => item.id === button.dataset.v56Module);
      if (!module) return;
      $$("[data-v56-module]", board).forEach((item) => item.setAttribute("aria-selected", String(item === button)));
      render(module);
    }));
  }

  function repairAiMobile() {
    const panel = $(".ai-drawer-panel-v27,.spensus-ai-v48");
    if (!panel) return;
    panel.classList.add("v56-ai-mobile");
    const tools = $$(".v48-ai-tools", panel);
    tools.slice(1).forEach((node) => node.remove());
  }

  function repairContrast() {
    const darkPattern = /khutbah|quran|islami|hero|feature|banner|card/i;
    $$("section,article,aside").forEach((node) => {
      if (!darkPattern.test(`${node.className} ${node.id}`)) return;
      const background = getComputedStyle(node).backgroundColor.match(/\d+/g)?.slice(0,3).map(Number) || [];
      if (background.length !== 3) return;
      const luminance = (background[0] * 299 + background[1] * 587 + background[2] * 114) / 1000;
      node.classList.add(luminance < 125 ? "v56-contrast-light" : "v56-contrast-dark");
    });
  }

  function init() {
    document.documentElement.dataset.paibpFinal = VERSION;
    removeLegacyLocks();
    colorizePortal();
    repairIslamicNav();
    repairContrast();
    if (privileged()) {
      cat.active = false;
      saveCat();
      ensureAuthorityPanel();
    } else {
      applyGradeLock();
    }

    document.addEventListener("paibp-realtime-v56", (event) => handleSnapshot(event.detail));

    document.addEventListener("click", (event) => {
      const studentEntry = event.target.closest('[data-open-panel="student"]');
      if (studentEntry) setTimeout(enterStudentRoom, 50);
      if (event.target.closest('[data-open-panel="islamic"],[data-islamic-view]')) {
        setTimeout(() => { repairIslamicNav(); buildPractice(); repairContrast(); }, 80);
      }
      if (event.target.closest('[data-ai-open],.workspace-ai-nav-v27')) setTimeout(repairAiMobile, 80);
      blockCatNavigation(event);
    }, true);

    window.addEventListener("popstate", () => {
      if (!cat.active || privileged()) return;
      try { history.pushState({paibpCatV56:true}, "", location.href); } catch {}
      showStudentPanel();
      toast("Tombol kembali dibatasi selama Mode CAT.", "warning");
    });

    window.addEventListener("storage", (event) => {
      if (event.key === KEYS.progress) checkCompletion();
    });

    if (cat.active && !privileged()) {
      document.documentElement.classList.add("v56-cat-mode");
      showStudentPanel();
      applyGradeLock();
      ensureCatBar();
      timerInterval = setInterval(updateTimer, 1000);
      completionInterval = setInterval(checkCompletion, 2500);
      updateTimer();
    }

    clearInterval(policyInterval);
    policyInterval = setInterval(() => {
      if (classContext.grade && !privileged()) window.PAIBP_REALTIME_V56?.refresh?.();
    }, 15000);

    setTimeout(() => {
      colorizePortal();
      repairIslamicNav();
      repairContrast();
      if (privileged()) ensureAuthorityPanel();
    }, 800);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
  else init();

  window.PAIBP_V56 = Object.freeze({
    version:VERSION, authority, role:authority, classContext:() => ({...classContext}),
    startCat, releaseCat, enterStudentRoom, buildPractice, handleSnapshot
  });
})();
