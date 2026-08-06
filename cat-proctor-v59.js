(() => {
  "use strict";

  const VERSION = "59";
  const CONFIG = window.PAIBP_CONFIG || {};
  const ENDPOINT = String(CONFIG.syncEndpoint || CONFIG.realtimeEndpoint || "").trim();
  const READ_KEY = String(CONFIG.syncReadKey || CONFIG.realtimeReadKey || "").trim();
  const READY = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(ENDPOINT);
  const URL_STATE = new URL(location.href);
  const FILE = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  const KEYS = {
    context: "paibp-smart-cat-context-v59",
    state: "paibp-smart-cat-state-v59",
    expired: "paibp-smart-cat-expired-v59",
    teacher: "paibp-smart-teacher-identity-v1",
    student: "paibp-smart-student-identity-v1",
    authority: "paibp-smart-authority-v56",
    editor: "paibp-smart-editor-unlocked"
  };

  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];
  const parse = (value, fallback) => { try { return JSON.parse(value); } catch { return fallback; } };
  const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  })[character]);

  let context = readContext();
  let policy = null;
  let serverOffset = 0;
  let cameraStream = null;
  let timerHandle = 0;
  let policyHandle = 0;
  let cameraHandle = 0;
  let classObserver = null;
  let gateAction = null;
  let startButton = null;
  let allowStudentOpen = false;
  let historyArmed = false;
  let state = {
    active:false,
    expired:false,
    released:false,
    started:false,
    deadline:0,
    sessionId:"",
    violations:0,
    classCode:context.classCode || "",
    scope:context.scope || ""
  };

  function storageGet(storage, key) {
    try { return storage.getItem(key); } catch { return null; }
  }

  function storageSet(storage, key, value) {
    try { storage.setItem(key, value); } catch {}
  }

  function storageRemove(storage, key) {
    try { storage.removeItem(key); } catch {}
  }

  function normalizeClass(value) {
    let raw = clean(value).toUpperCase()
      .replace(/KELAS|ROMBEL|GRADE|TINGKAT/g, "")
      .replace(/[._/\\-]+/g, " ")
      .replace(/\s+/g, "")
      .replace(/[^A-Z0-9]/g, "");
    if (!raw || raw === "*") return { grade:"", section:"", code:"", label:"" };

    let grade = "";
    let rest = "";
    if (raw.startsWith("VIII")) { grade = "VIII"; rest = raw.slice(4); }
    else if (raw.startsWith("VII")) { grade = "VII"; rest = raw.slice(3); }
    else if (raw.startsWith("IX")) { grade = "IX"; rest = raw.slice(2); }
    else if (raw.startsWith("8")) { grade = "VIII"; rest = raw.slice(1); }
    else if (raw.startsWith("7")) { grade = "VII"; rest = raw.slice(1); }
    else if (raw.startsWith("9")) { grade = "IX"; rest = raw.slice(1); }
    else return { grade:"", section:"", code:"", label:"" };

    const section = rest.replace(/[^A-Z0-9]/g, "").slice(0, 4);
    return {
      grade,
      section,
      code:`${grade}${section}`,
      label:`${grade}${section ? ` ${section}` : ""}`
    };
  }

  function readContext() {
    const saved = parse(storageGet(sessionStorage, KEYS.context), null)
      || parse(storageGet(localStorage, KEYS.context), null)
      || {};
    const requested = normalizeClass(
      URL_STATE.searchParams.get("ps_class")
      || URL_STATE.searchParams.get("kelas")
      || URL_STATE.searchParams.get("class")
      || saved.classCode
      || URL_STATE.searchParams.get("ps_grade")
      || saved.grade
      || ""
    );
    const next = {
      classCode:requested.code,
      classLabel:requested.label,
      grade:requested.grade,
      section:requested.section,
      scope:clean(URL_STATE.searchParams.get("ps_scope") || saved.scope || "*"),
      teacherName:clean(URL_STATE.searchParams.get("ps_teacher") || saved.teacherName || ""),
      teacherSchool:clean(URL_STATE.searchParams.get("ps_school") || saved.teacherSchool || ""),
      catRequested:URL_STATE.searchParams.get("ps_cat") === "1" || saved.catRequested === true,
      durationMinutes:Math.max(5, Math.min(240, Number(URL_STATE.searchParams.get("ps_duration") || saved.durationMinutes || 45)))
    };
    if (next.classCode || next.catRequested) {
      storageSet(sessionStorage, KEYS.context, JSON.stringify(next));
      storageSet(localStorage, KEYS.context, JSON.stringify(next));
    }
    return next;
  }

  function teacherIdentity() {
    return parse(storageGet(localStorage, KEYS.teacher), {}) || {};
  }

  function isEditor() {
    const gateway = String(document.body?.dataset.privateGateway || "").toLowerCase();
    const authority = String(storageGet(sessionStorage, KEYS.authority) || "").toLowerCase();
    const sessionEditor = String(storageGet(sessionStorage, KEYS.editor) || "").toLowerCase();
    const localEditor = String(storageGet(localStorage, KEYS.editor) || "").toLowerCase();
    return FILE === "kendali-editor.html" || gateway === "editor" || authority === "editor"
      || sessionEditor === "yes" || sessionEditor === "true"
      || localEditor === "yes" || localEditor === "true"
      || document.body?.dataset.teacherOwner === "yes";
  }

  function isTeacher() {
    const gateway = String(document.body?.dataset.privateGateway || "").toLowerCase();
    const authority = String(storageGet(sessionStorage, KEYS.authority) || "").toLowerCase();
    const role = String(document.body?.dataset.portalRole || "").toLowerCase();
    const identity = teacherIdentity();
    return FILE === "akses-guru.html" || gateway === "guru" || authority === "teacher"
      || role === "guru" || identity.teacherRecognized === true || identity.recognized === true;
  }

  const privileged = () => isEditor() || isTeacher();

  function fnv(value) {
    let hash = 2166136261;
    for (const character of String(value || "")) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function teacherScope() {
    if (isEditor()) return "*";
    const identity = teacherIdentity();
    const name = clean(identity.name || identity.teacherName);
    const school = clean(identity.workUnit || identity.school || identity.teacherSchool);
    return name || school ? `guru-${fnv(`${name.toLowerCase()}|${school.toLowerCase()}`)}` : "guru-tanpa-identitas";
  }

  function toast(message, tone = "info") {
    let node = $("#v59-toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "v59-toast";
      node.setAttribute("role", "status");
      node.setAttribute("aria-live", "polite");
      document.body.append(node);
    }
    node.dataset.tone = tone;
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), 3400);
  }

  function copyText(value) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value);
    window.prompt("Salin tautan kelas berikut:", value);
    return Promise.resolve();
  }

  function buildClassLink(classValue, duration, scope) {
    const parsedClass = normalizeClass(classValue);
    if (!parsedClass.code) throw new Error("Kelas tujuan belum valid.");
    const identity = teacherIdentity();
    const target = new URL("index.html", document.baseURI);
    target.searchParams.set("ps_class", parsedClass.code);
    target.searchParams.set("ps_grade", parsedClass.grade);
    target.searchParams.set("ps_scope", scope || teacherScope());
    target.searchParams.set("ps_teacher", clean(identity.name || identity.teacherName || (isEditor() ? "Editor PAIBP SMART" : "Guru")));
    target.searchParams.set("ps_school", clean(identity.workUnit || identity.school || identity.teacherSchool || "SMP Negeri 1 Susukan"));
    target.searchParams.set("ps_cat", "1");
    target.searchParams.set("ps_duration", String(duration));
    return target.href;
  }

  function sendJson(action, data, { requireKey = false } = {}) {
    if (!READY) return Promise.reject(new Error("Google Apps Script belum tersambung."));
    const payload = JSON.stringify({
      app:"paibp-smart",
      version:VERSION,
      action,
      readKey:requireKey ? READ_KEY : "",
      origin:location.origin,
      data
    });
    return fetch(ENDPOINT, {
      method:"POST",
      mode:"no-cors",
      cache:"no-store",
      headers:{"Content-Type":"text/plain;charset=UTF-8"},
      body:payload
    });
  }

  function jsonp(action, params = {}, timeout = 12000) {
    return new Promise((resolve, reject) => {
      if (!READY) { reject(new Error("Server belum tersambung.")); return; }
      const callback = `paibpV59_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement("script");
      const request = new URL(ENDPOINT);
      let finished = false;
      const finish = (error, value) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        try { delete window[callback]; } catch {}
        script.remove();
        error ? reject(error) : resolve(value);
      };
      window[callback] = (value) => finish(null, value);
      Object.entries({action, callback, _v:Date.now(), ...params}).forEach(([key, value]) => request.searchParams.set(key, String(value ?? "")));
      script.src = request.href;
      script.async = true;
      script.onerror = () => finish(new Error("Server tidak dapat dijangkau."));
      const timer = setTimeout(() => finish(new Error("Server melewati batas waktu.")), timeout);
      document.head.append(script);
    });
  }

  function record(action, extra = {}) {
    try {
      if (window.PAIBP_REALTIME_V56?.record) {
        window.PAIBP_REALTIME_V56.record(action, {
          chapter:context.classCode,
          section:extra.section || context.classLabel,
          ...extra
        });
        return;
      }
    } catch {}
    const identity = parse(storageGet(localStorage, KEYS.student), {}) || {};
    sendJson("activity", {
      id:`cat59-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`,
      sessionId:state.sessionId || "",
      timestamp:new Date().toISOString(),
      role:privileged() ? (isEditor() ? "editor" : "guru") : "murid",
      userName:identity.name || identity.studentName || "",
      studentClass:context.classLabel || context.classCode,
      studentNumber:identity.attendance || identity.number || "",
      teacherName:context.teacherName || "",
      teacherSchool:context.teacherSchool || "",
      action,
      space:"Ruang Murid",
      chapter:context.classCode,
      section:extra.section || "Mode CAT V59",
      device:navigator.userAgent || "",
      online:navigator.onLine,
      pageUrl:location.href,
      origin:location.origin,
      appVersion:VERSION,
      ...extra
    }).catch(() => {});
  }

  function classPolicyKey(scope, classCode) {
    return `catPolicy:${scope || "*"}:${classCode || "*"}`;
  }

  async function setPolicy(classCode, durationMinutes, command, enabled) {
    const scope = teacherScope();
    const identity = teacherIdentity();
    const now = Date.now();
    const next = {
      enabled:Boolean(enabled),
      classCode,
      grade:classCode,
      durationMinutes,
      cameraRequired:true,
      command,
      clientCommandEpoch:now,
      resetEpoch:/activate|reset/.test(command) ? now : 0,
      releaseEpoch:enabled ? 0 : now,
      teacherName:clean(identity.name || identity.teacherName || (isEditor() ? "Editor" : "Guru")),
      teacherSchool:clean(identity.workUnit || identity.school || identity.teacherSchool || ""),
      updatedBy:isEditor() ? "editor" : "guru",
      scope
    };
    await sendJson("classControl", {
      scope,
      grade:classCode,
      classCode,
      command,
      updatedAt:new Date().toISOString(),
      policy:next
    }, {requireKey:true});
    return next;
  }

  function ensureControlPanel() {
    if (!privileged()) return;
    $("#v56-class-control")?.remove();
    let panel = $("#v59-cat-control");
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "v59-cat-control";
      const main = $("main") || document.body;
      main.prepend(panel);
    }
    if (panel.dataset.ready === "yes") return;
    panel.dataset.ready = "yes";

    const options = ["VII","VIII","IX"].flatMap((grade) => "ABCDEFGH".split("").map((letter) => `${grade} ${letter}`));
    panel.innerHTML = `
      <header>
        <div><span>${isEditor() ? "KENDALI EDITOR" : "KENDALI GURU"} • CAT PRESISI</span><h2>CAT Kelas, Kamera, dan Timer Server</h2><p>Kelas ditulis lengkap, misalnya <strong>VIII D</strong>. Tautan mengunci identitas kelas, kamera murid, materi kelas, serta batas waktu dari server.</p></div>
        <b data-v59-status>Siap dikonfigurasi</b>
      </header>
      <div class="v59-control-grid">
        <label><span>Kelas tujuan lengkap</span><input data-v59-class list="v59-class-list" maxlength="12" placeholder="Contoh: VIII D" autocomplete="off"><datalist id="v59-class-list">${options.map((item) => `<option value="${item}"></option>`).join("")}</datalist></label>
        <label><span>Waktu mengerjakan</span><div class="v59-duration"><input data-v59-duration type="number" min="5" max="240" step="5" value="45"><em>menit</em></div></label>
        <div class="v59-actions">
          <button type="button" data-v59-activate>Aktifkan CAT</button>
          <button type="button" data-v59-share>Salin Tautan</button>
          <button type="button" data-v59-reset>Ulang Timer</button>
          <button type="button" data-v59-stop>Akhiri Kelas</button>
          ${isEditor() ? '<button type="button" data-v59-stop-all>Akhiri Semua</button>' : ''}
        </div>
      </div>
      <p class="v59-control-note">Guru hanya mengendalikan tautan kelas yang dibuat dari akun/identitasnya. Editor dapat menghentikan seluruh kelas. Kamera hanya meminta izin pada perangkat murid dan tidak merekam atau mengunggah video.</p>`;

    const classInput = $("[data-v59-class]", panel);
    const durationInput = $("[data-v59-duration]", panel);
    const status = $("[data-v59-status]", panel);
    const setStatus = (message, tone = "") => { status.textContent = message; status.dataset.tone = tone; };
    const duration = () => Math.max(5, Math.min(240, Number(durationInput.value || 45)));
    const targetClass = () => normalizeClass(classInput.value);
    const requireClass = () => {
      const value = targetClass();
      if (!value.code || !value.section) {
        classInput.focus();
        toast("Isi kelas lengkap, misalnya VIII D.", "warning");
        return null;
      }
      classInput.value = value.label;
      return value;
    };

    $("[data-v59-activate]", panel).onclick = async () => {
      const target = requireClass(); if (!target) return;
      setStatus("Mengaktifkan CAT…", "pending");
      try {
        await setPolicy(target.code, duration(), "activate", true);
        setStatus(`CAT ${target.label} aktif • ${duration()} menit`, "success");
        toast(`CAT Kelas ${target.label} berhasil diaktifkan.`, "success");
      } catch (error) {
        setStatus("Gagal tersambung", "stopped");
        toast(error.message || "Aktivasi CAT gagal.", "error");
      }
    };

    $("[data-v59-share]", panel).onclick = async () => {
      const target = requireClass(); if (!target) return;
      try {
        const link = buildClassLink(target.code, duration(), teacherScope());
        await copyText(link);
        setStatus(`Tautan ${target.label} tersalin`, "success");
        toast(`Tautan khusus Kelas ${target.label} tersalin.`, "success");
      } catch (error) { toast(error.message || "Tautan gagal dibuat.", "error"); }
    };

    $("[data-v59-reset]", panel).onclick = async () => {
      const target = requireClass(); if (!target) return;
      setStatus("Mengulang timer…", "pending");
      try {
        await setPolicy(target.code, duration(), "reset", true);
        setStatus(`Timer ${target.label} dimulai ulang`, "success");
        toast(`Timer Kelas ${target.label} dimulai ulang dari server.`, "success");
      } catch (error) { setStatus("Gagal tersambung", "stopped"); toast(error.message || "Timer gagal diulang.", "error"); }
    };

    $("[data-v59-stop]", panel).onclick = async () => {
      const target = requireClass(); if (!target) return;
      setStatus("Mengakhiri kelas…", "pending");
      try {
        await setPolicy(target.code, duration(), "release", false);
        setStatus(`Akses ${target.label} diakhiri`, "stopped");
        toast(`CAT Kelas ${target.label} telah diakhiri.`, "success");
      } catch (error) { setStatus("Gagal tersambung", "stopped"); toast(error.message || "Kelas gagal diakhiri.", "error"); }
    };

    $("[data-v59-stop-all]", panel)?.addEventListener("click", async () => {
      setStatus("Mengakhiri seluruh CAT…", "pending");
      try {
        const now = Date.now();
        await sendJson("classControl", {
          scope:"*", grade:"*", classCode:"*", command:"release-all", updatedAt:new Date().toISOString(),
          policy:{enabled:false,scope:"*",grade:"*",classCode:"*",command:"release-all",releaseEpoch:now,updatedBy:"editor"}
        }, {requireKey:true});
        setStatus("Seluruh CAT diakhiri", "stopped");
        toast("Editor mengakhiri seluruh sesi CAT.", "success");
      } catch (error) { setStatus("Gagal tersambung", "stopped"); toast(error.message || "Perintah gagal.", "error"); }
    });
  }

  function ensureGate() {
    let gate = $("#v59-camera-gate");
    if (gate) return gate;
    gate = document.createElement("div");
    gate.id = "v59-camera-gate";
    gate.className = "v59-lock-screen";
    gate.hidden = true;
    gate.innerHTML = `
      <section class="v59-lock-card" role="dialog" aria-modal="true" aria-labelledby="v59-gate-title">
        <div class="v59-lock-icon" aria-hidden="true">📷</div>
        <span class="v59-lock-kicker">MODE CAT PAIBP SMART</span>
        <h2 id="v59-gate-title">Aktifkan Kamera untuk Memulai</h2>
        <p data-v59-gate-message>Kamera depan wajib aktif selama CAT. Tanpa izin kamera, Ruang Murid tetap terkunci.</p>
        <div class="v59-camera-stage"><video data-v59-gate-video autoplay muted playsinline></video><span data-v59-camera-label>Kamera belum aktif</span></div>
        <div class="v59-lock-actions"><button type="button" data-v59-gate-action>Aktifkan Kamera & Mulai CAT</button></div>
        <p class="v59-lock-status" data-v59-gate-status></p>
        <small class="v59-privacy">Video hanya tampil pada perangkat murid. Aplikasi mencatat status kamera dan pelanggaran perpindahan halaman, bukan menyimpan rekaman video.</small>
      </section>`;
    document.body.append(gate);
    startButton = $("[data-v59-gate-action]", gate);
    startButton.onclick = () => gateAction?.();
    return gate;
  }

  function showGate({title, message, button, status = "", action, disabled = false, icon = "📷"}) {
    const gate = ensureGate();
    $(".v59-lock-icon", gate).textContent = icon;
    $("#v59-gate-title", gate).textContent = title;
    $("[data-v59-gate-message]", gate).textContent = message;
    $("[data-v59-gate-status]", gate).textContent = status;
    startButton.textContent = button;
    startButton.disabled = disabled;
    gateAction = action;
    gate.hidden = false;
    document.documentElement.classList.add("v59-cat-paused");
    const video = $("[data-v59-gate-video]", gate);
    if (cameraStream && video.srcObject !== cameraStream) video.srcObject = cameraStream;
    $("[data-v59-camera-label]", gate).textContent = cameraStream ? "Kamera aktif" : "Kamera belum aktif";
  }

  function hideGate() {
    ensureGate().hidden = true;
    document.documentElement.classList.remove("v59-cat-paused");
  }

  async function enterFullscreen() {
    const supported = typeof document.documentElement.requestFullscreen === "function";
    if (supported && !document.fullscreenElement) {
      try { await document.documentElement.requestFullscreen({navigationUI:"hide"}); }
      catch { return false; }
    }
    try { await screen.orientation?.lock?.("portrait-primary"); } catch {}
    return supported ? Boolean(document.fullscreenElement) : true;
  }

  async function enableCamera() {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("Perangkat atau browser ini tidak mendukung akses kamera.");
    stopCamera();
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video:{facingMode:"user",width:{ideal:640},height:{ideal:480}},
      audio:false
    });
    const track = cameraStream.getVideoTracks()[0];
    if (!track || track.readyState !== "live") throw new Error("Kamera belum aktif.");
    track.addEventListener("ended", () => pauseForCamera("Kamera dimatikan atau izinnya dicabut."), {once:true});
    const gateVideo = $("[data-v59-gate-video]", ensureGate());
    gateVideo.srcObject = cameraStream;
    $("[data-v59-camera-label]", ensureGate()).textContent = "Kamera aktif";
    record("cat-camera-granted", {section:"Kamera depan aktif"});
    return cameraStream;
  }

  function stopCamera() {
    if (cameraStream) cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
    clearInterval(cameraHandle);
    cameraHandle = 0;
    $("#v59-camera-preview")?.remove();
    const video = $("[data-v59-gate-video]", ensureGate());
    if (video) video.srcObject = null;
  }

  function ensureCameraPreview() {
    if (!cameraStream) return;
    let preview = $("#v59-camera-preview");
    if (!preview) {
      preview = document.createElement("aside");
      preview.id = "v59-camera-preview";
      preview.innerHTML = '<video autoplay muted playsinline></video><span>● Kamera CAT aktif</span>';
      document.body.append(preview);
    }
    $("video", preview).srcObject = cameraStream;
    clearInterval(cameraHandle);
    cameraHandle = setInterval(() => {
      if (!state.active) return;
      const live = cameraStream?.getVideoTracks?.().some((track) => track.readyState === "live" && track.enabled);
      if (!live) pauseForCamera("Kamera tidak lagi aktif.");
    }, 2500);
  }

  function openStudentPanel() {
    const entry = $("[data-open-panel='student']");
    if (entry) {
      allowStudentOpen = true;
      try { entry.click(); } catch {}
      allowStudentOpen = false;
    }
    const panel = $("#panel-student,[data-panel='student']");
    if (!panel) return;
    panel.hidden = false;
    panel.removeAttribute("hidden");
    $$(".workspace-panel").forEach((node) => { if (node !== panel) node.hidden = true; });
    $$('[data-home-only]').forEach((node) => { node.hidden = true; });
  }

  function lockExactClass() {
    if (!context.classCode) return;
    const label = context.classLabel || normalizeClass(context.classCode).label;
    const identity = parse(storageGet(localStorage, KEYS.student), {}) || {};
    identity.className = label;
    identity.class = label;
    identity.grade = context.grade;
    storageSet(localStorage, KEYS.student, JSON.stringify(identity));

    const panel = $("#panel-student,[data-panel='student']");
    if (!panel) return;
    const apply = () => {
      $$('input[name="className"],[data-lkpd-field="className"],input[data-student-class]', panel).forEach((input) => {
        input.value = label;
        input.readOnly = true;
        input.dataset.v59ClassLocked = "yes";
        input.setAttribute("aria-label", `Kelas terkunci ${label}`);
      });
      const gradeButtons = $$("[data-grade-filter]", panel);
      gradeButtons.forEach((button) => {
        const value = String(button.dataset.gradeFilter || "").toUpperCase();
        button.hidden = value !== context.grade;
        if (value === context.grade && button.getAttribute("aria-pressed") !== "true") setTimeout(() => button.click(), 0);
      });
    };
    apply();
    if (!classObserver) {
      classObserver = new MutationObserver(() => requestAnimationFrame(apply));
      classObserver.observe(panel, {childList:true,subtree:true});
    }
  }

  function ensureCatBar() {
    let bar = $("#v59-cat-bar");
    if (!bar) {
      bar = document.createElement("header");
      bar.id = "v59-cat-bar";
      bar.innerHTML = `<div><span>MODE CAT • KELAS <b data-v59-bar-class></b></span><strong>Selesaikan materi, latihan, dan tugas pada kelas ini</strong><small>Scroll tetap aktif • keluar dikendalikan guru/editor</small></div><div class="v59-cat-clock"><small>Sisa waktu</small><b data-v59-countdown>--:--</b></div>`;
      document.body.append(bar);
    }
    $("[data-v59-bar-class]", bar).textContent = context.classLabel || context.classCode || "—";
    return bar;
  }

  function formatTime(milliseconds) {
    const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const rest = seconds % 60;
    return hours
      ? `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:${String(rest).padStart(2,"0")}`
      : `${String(minutes).padStart(2,"0")}:${String(rest).padStart(2,"0")}`;
  }

  function serverNow() {
    return Date.now() + serverOffset;
  }

  function policyDeadline(value = policy) {
    if (!value) return 0;
    const explicit = Number(value.expiresAt || value.deadlineEpoch || 0);
    if (explicit > 0) return explicit;
    const start = Number(value.serverStartEpoch || value.resetEpoch || value.clientCommandEpoch || 0);
    const duration = Math.max(5, Math.min(240, Number(value.durationMinutes || context.durationMinutes || 45)));
    return start ? start + duration * 60000 : 0;
  }

  function saveState() {
    storageSet(sessionStorage, KEYS.state, JSON.stringify({
      active:state.active,
      expired:state.expired,
      deadline:state.deadline,
      sessionId:state.sessionId,
      classCode:context.classCode,
      scope:context.scope,
      violations:state.violations
    }));
  }

  function updateTimer() {
    if (!state.active || state.expired) return;
    const remaining = state.deadline - serverNow();
    $("[data-v59-countdown]", ensureCatBar()).textContent = formatTime(remaining);
    if (remaining <= 0) expireSession("Waktu mengerjakan telah habis.");
  }

  function armHistory() {
    if (historyArmed) return;
    historyArmed = true;
    try {
      history.replaceState({paibpCatV59:true}, "", location.href);
      history.pushState({paibpCatV59:true}, "", location.href);
    } catch {}
  }

  async function startSession() {
    if (!policy?.enabled) {
      showWaitingGate("Guru belum mengaktifkan CAT untuk kelas ini.");
      return;
    }
    const deadline = policyDeadline(policy);
    if (!deadline || deadline <= serverNow() || policy.expired === true) {
      expireSession("Waktu CAT untuk kelas ini telah habis.");
      return;
    }

    const gateStatus = $("[data-v59-gate-status]", ensureGate());
    startButton.disabled = true;
    gateStatus.textContent = "Meminta izin kamera dan menyiapkan layar CAT…";
    try {
      const fullscreenReady = await enterFullscreen();
      if (!fullscreenReady) throw new Error("Layar penuh wajib diaktifkan untuk memulai CAT.");
      await enableCamera();
    } catch (error) {
      record("cat-camera-denied", {section:error.message || "Izin kamera ditolak"});
      startButton.disabled = false;
      gateStatus.textContent = `${error.message || "Kamera tidak dapat diaktifkan."} Tekan tombol untuk mencoba kembali.`;
      return;
    }

    state.active = true;
    state.expired = false;
    state.released = false;
    state.started = true;
    state.deadline = deadline;
    state.sessionId = String(policy.sessionId || policy.resetEpoch || policy.serverStartEpoch || deadline);
    context.durationMinutes = Number(policy.durationMinutes || context.durationMinutes);
    saveState();
    storageRemove(localStorage, KEYS.expired);

    openStudentPanel();
    lockExactClass();
    document.documentElement.classList.add("v59-cat-active");
    document.documentElement.classList.remove("v59-cat-expired", "v59-cat-paused");
    ensureCatBar();
    ensureCameraPreview();
    hideGate();
    armHistory();
    clearInterval(timerHandle);
    timerHandle = setInterval(updateTimer, 500);
    updateTimer();
    record("cat-start-v59", {section:`${context.classLabel} • ${context.durationMinutes} menit`,cameraActive:true});
  }

  function pauseForCamera(message) {
    if (!state.active || state.expired || privileged()) return;
    document.documentElement.classList.add("v59-cat-paused");
    record("cat-camera-interrupted", {section:message,cameraActive:false});
    showGate({
      title:"CAT Dijeda",
      message:`${message} Aktifkan kembali kamera dan layar penuh untuk melanjutkan.`,
      button:"Aktifkan Kamera & Lanjutkan",
      status:"Ruang Murid tetap terkunci selama kamera tidak aktif.",
      action:async () => {
        startButton.disabled = true;
        try {
          const fullscreenReady = await enterFullscreen();
          if (!fullscreenReady) throw new Error("Aktifkan kembali layar penuh untuk melanjutkan.");
          await enableCamera();
          ensureCameraPreview();
          hideGate();
          startButton.disabled = false;
          record("cat-resume-v59", {section:"Kamera dan layar penuh dipulihkan"});
        } catch (error) {
          startButton.disabled = false;
          $("[data-v59-gate-status]", ensureGate()).textContent = error.message || "Kamera belum aktif.";
        }
      }
    });
  }

  function ensureExpiredScreen() {
    let screen = $("#v59-expired-screen");
    if (screen) return screen;
    screen = document.createElement("div");
    screen.id = "v59-expired-screen";
    screen.hidden = true;
    screen.innerHTML = `<section><b>⏱</b><h2>Waktu CAT Habis</h2><p data-v59-expired-message>Seluruh akses PAIBP SMART untuk sesi ini dikunci. Hanya guru kelas atau editor yang dapat membuka, mengulang timer, atau mengakhiri sesi.</p><small data-v59-expired-class></small></section>`;
    document.body.append(screen);
    return screen;
  }

  function expireSession(message) {
    if (state.expired && $("#v59-expired-screen") && !$("#v59-expired-screen").hidden) return;
    state.active = false;
    state.expired = true;
    state.released = false;
    state.deadline = state.deadline || policyDeadline(policy);
    state.sessionId = String(policy?.sessionId || state.sessionId || state.deadline || "expired");
    saveState();
    storageSet(localStorage, KEYS.expired, JSON.stringify({
      classCode:context.classCode,
      scope:context.scope,
      sessionId:state.sessionId,
      expiredAt:Date.now()
    }));
    clearInterval(timerHandle);
    stopCamera();
    $("#v59-cat-bar")?.remove();
    hideGate();
    document.documentElement.classList.remove("v59-cat-active", "v59-cat-paused");
    document.documentElement.classList.add("v59-cat-expired");
    const screen = ensureExpiredScreen();
    $("[data-v59-expired-message]", screen).textContent = message || "Waktu CAT telah habis. Akses dikunci oleh sistem.";
    $("[data-v59-expired-class]", screen).textContent = `Kelas ${context.classLabel || context.classCode} • menunggu kendali guru/editor`;
    screen.hidden = false;
    armHistory();
    record("cat-timeout-v59", {section:"Akses portal dikunci",cameraActive:false});
  }

  function releaseByTeacher() {
    const wasLocked = state.active || state.expired || document.documentElement.classList.contains("v59-cat-active");
    state.active = false;
    state.expired = false;
    state.released = true;
    clearInterval(timerHandle);
    stopCamera();
    $("#v59-cat-bar")?.remove();
    $("#v59-expired-screen")?.setAttribute("hidden", "");
    document.documentElement.classList.remove("v59-cat-active", "v59-cat-expired", "v59-cat-paused");
    storageRemove(localStorage, KEYS.expired);
    saveState();
    if (wasLocked) {
      showGate({
        title:"Sesi CAT Diakhiri Guru",
        message:"Guru atau editor telah membuka akses keluar. Anda dapat kembali ke beranda.",
        button:"Kembali ke Beranda",
        icon:"✓",
        action:() => { location.href = new URL("index.html", document.baseURI).href; }
      });
      record("cat-released-v59", {section:"Dibuka oleh guru/editor"});
    }
  }

  function showWaitingGate(message = "Menunggu guru mengaktifkan CAT.") {
    showGate({
      title:"Menunggu CAT Kelas",
      message,
      button:"Periksa Aktivasi Guru",
      status:`Tautan terkunci untuk Kelas ${context.classLabel || context.classCode || "—"}.`,
      icon:"⌛",
      action:async () => {
        startButton.disabled = true;
        await refreshPolicy();
        startButton.disabled = false;
      }
    });
  }

  function policySessionId(value) {
    return String(value?.sessionId || value?.serverStartEpoch || value?.resetEpoch || value?.clientCommandEpoch || "");
  }

  function usePolicyResponse(response) {
    if (!response) return;
    if (response.serverTime) {
      const parsedTime = Date.parse(response.serverTime);
      if (Number.isFinite(parsedTime)) serverOffset = parsedTime - Date.now();
    }
    const incoming = response.policy && typeof response.policy === "object" ? response.policy : null;
    if (!incoming) {
      if (context.catRequested && !state.active && !state.expired) showWaitingGate("Guru belum mengaktifkan CAT untuk kelas ini.");
      return;
    }
    const previousSession = policySessionId(policy);
    policy = incoming;
    const incomingSession = policySessionId(policy);
    const deadline = policyDeadline(policy);

    if (!policy.enabled) {
      releaseByTeacher();
      return;
    }

    if (policy.expired === true || (deadline > 0 && deadline <= serverNow())) {
      expireSession("Waktu CAT untuk kelas ini telah habis. Akses menunggu kendali guru atau editor.");
      return;
    }

    const storedExpired = parse(storageGet(localStorage, KEYS.expired), null);
    const sameExpiredSession = storedExpired
      && storedExpired.classCode === context.classCode
      && storedExpired.scope === context.scope
      && String(storedExpired.sessionId || "") === incomingSession;

    const expiredSessionId = String(storedExpired?.sessionId || previousSession || "");
    if (state.expired && incomingSession && expiredSessionId && incomingSession !== expiredSessionId) {
      state.expired = false;
      storageRemove(localStorage, KEYS.expired);
      $("#v59-expired-screen")?.setAttribute("hidden", "");
      document.documentElement.classList.remove("v59-cat-expired");
      showGate({
        title:"Timer Diulang Guru",
        message:"Sesi baru telah dibuka. Aktifkan kembali kamera untuk melanjutkan.",
        button:"Aktifkan Kamera & Mulai",
        action:startSession
      });
      return;
    }

    if (sameExpiredSession) {
      expireSession("Waktu CAT untuk sesi ini telah habis. Hanya guru atau editor yang dapat membuka sesi baru.");
      return;
    }

    if (state.active) {
      state.deadline = deadline;
      state.sessionId = incomingSession;
      context.durationMinutes = Number(policy.durationMinutes || context.durationMinutes);
      saveState();
      updateTimer();
      return;
    }

    if (context.catRequested && !privileged()) {
      showGate({
        title:`CAT Kelas ${context.classLabel || context.classCode}`,
        message:"Kamera depan wajib aktif. Setelah izin diberikan, layar masuk ke Mode CAT dan hanya dapat dibuka oleh guru/editor atau setelah tugas dinyatakan selesai sesuai kebijakan.",
        button:"Aktifkan Kamera & Mulai CAT",
        status:`Waktu tersedia ${Math.max(0, Math.ceil((deadline - serverNow()) / 60000))} menit.`,
        action:startSession
      });
    }
  }

  async function refreshPolicy() {
    if (!context.classCode || !READY) return null;
    try {
      const response = await jsonp("classPolicy", {scope:context.scope || "*", grade:context.classCode}, 10000);
      usePolicyResponse(response);
      return response;
    } catch (error) {
      if (context.catRequested && !state.active && !state.expired) {
        showWaitingGate("Server sedang dihubungkan kembali. Tekan tombol untuk memeriksa ulang.");
        $("[data-v59-gate-status]", ensureGate()).textContent = "Data CAT belum dapat diperbarui dari server.";
      }
      return null;
    }
  }

  function blockNavigation(event) {
    if ((!state.active && !state.expired) || privileged()) return;
    const target = event.target.closest("a,button,[data-open-panel],[data-close-workspace]");
    if (!target) return;
    if (target.closest("#v59-camera-gate,#v59-expired-screen,#v59-cat-bar")) return;
    const insideStudent = target.closest("#panel-student,[data-panel='student']");
    const label = clean(target.textContent);
    const forbidden = /beranda|fitur islami|game|portal guru|about|kontak|keluar|tutup|menu utama|spensus ai/i.test(label);
    if (insideStudent && !forbidden) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (state.expired) expireSession("Waktu CAT telah habis. Navigasi tetap dikunci.");
    else {
      openStudentPanel();
      toast("Anda tidak diperkenankan meninggalkan halaman sebelum tugas selesai atau guru mengakhiri CAT.", "warning");
      record("cat-navigation-blocked", {section:label || target.getAttribute("href") || "Navigasi keluar"});
    }
  }

  function beforeUnload(event) {
    if ((!state.active && !state.expired) || privileged()) return;
    event.preventDefault();
    event.returnValue = "";
  }

  function enterStudentRoom() {
    if (privileged()) {
      state.active = false;
      state.expired = false;
      document.documentElement.classList.remove("v59-cat-active", "v59-cat-expired", "v59-cat-paused");
      return;
    }
    if (!context.catRequested) return;
    refreshPolicy();
  }

  function initStudentCat() {
    if (privileged() || !context.catRequested) return;
    if (!context.classCode || !context.section) {
      showGate({
        title:"Tautan Kelas Tidak Valid",
        message:"Tautan CAT harus memuat kelas lengkap, misalnya VIII D. Mintalah tautan baru kepada guru.",
        button:"Periksa Kembali",
        disabled:true,
        icon:"!"
      });
      return;
    }

    lockExactClass();
    ensureExpiredScreen();
    const storedExpired = parse(storageGet(localStorage, KEYS.expired), null);
    if (storedExpired && storedExpired.classCode === context.classCode && storedExpired.scope === context.scope) {
      state.sessionId = String(storedExpired.sessionId || "expired");
      state.expired = true;
      expireSession("Waktu CAT untuk sesi ini telah habis. Hanya guru atau editor yang dapat membuka sesi baru.");
    }
    refreshPolicy();
    clearInterval(policyHandle);
    policyHandle = setInterval(refreshPolicy, 4000);
  }

  function init() {
    document.documentElement.dataset.paibpCat = VERSION;
    ensureGate();
    ensureExpiredScreen();
    if (privileged()) ensureControlPanel();
    initStudentCat();

    document.addEventListener("click", (event) => {
      const studentEntry = event.target.closest('[data-open-panel="student"]');
      if (studentEntry && !privileged() && context.catRequested && !allowStudentOpen) {
        event.preventDefault();
        event.stopImmediatePropagation();
        refreshPolicy();
        return;
      }
      blockNavigation(event);
    }, true);

    document.addEventListener("input", (event) => {
      if (!context.catRequested || privileged()) return;
      const field = event.target.closest('input[name="className"],[data-lkpd-field="className"],input[data-student-class]');
      if (!field) return;
      const label = context.classLabel || context.classCode;
      if (field.value !== label) field.value = label;
    }, true);

    window.addEventListener("popstate", () => {
      if ((!state.active && !state.expired) || privileged()) return;
      try { history.pushState({paibpCatV59:true}, "", location.href); } catch {}
      if (state.expired) expireSession("Waktu CAT telah habis. Halaman tetap terkunci.");
      else {
        openStudentPanel();
        toast("Tombol kembali dibatasi selama Mode CAT.", "warning");
        record("cat-history-blocked", {section:"Tombol kembali/history"});
      }
    });

    window.addEventListener("beforeunload", beforeUnload);

    document.addEventListener("visibilitychange", () => {
      if (!state.active || state.expired || privileged()) return;
      if (document.visibilityState === "hidden") {
        state.violations += 1;
        saveState();
        record("cat-page-hidden", {section:`Pelanggaran ${state.violations}`});
      } else if (!document.fullscreenElement) {
        pauseForCamera("Murid berpindah halaman atau keluar dari layar penuh.");
      }
    });

    document.addEventListener("fullscreenchange", () => {
      if (!state.active || state.expired || privileged()) return;
      if (!document.fullscreenElement) pauseForCamera("Layar penuh ditutup.");
    });

    window.addEventListener("online", refreshPolicy);
    document.addEventListener("paibp-realtime-v56", () => {
      if (context.catRequested && !privileged()) refreshPolicy();
    });
  }

  window.PAIBP_CAT_V59 = Object.freeze({
    version:VERSION,
    normalizeClass,
    context:() => ({...context}),
    privileged,
    enterStudentRoom,
    refreshPolicy,
    startFromLegacy:() => { if (!privileged()) refreshPolicy(); },
    releaseLegacy:() => {}
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
})();
