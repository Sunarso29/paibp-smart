(() => {
  "use strict";

  const VERSION = "63";
  const CONFIG = window.PAIBP_CONFIG || {};
  const ENDPOINT = String(CONFIG.syncEndpoint || CONFIG.realtimeEndpoint || "").trim();
  const READ_KEY = String(CONFIG.syncReadKey || CONFIG.realtimeReadKey || "").trim();
  const READY = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(ENDPOINT);
  const FILE = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const PARAMS = new URLSearchParams(location.search);
  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];
  const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
  const parse = (value, fallback) => { try { return JSON.parse(value); } catch { return fallback; } };
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[c]);

  const KEYS = Object.freeze({
    student: "paibp-smart-student-identity-v1",
    teacher: "paibp-smart-teacher-identity-v1",
    authority: "paibp-smart-authority-v56",
    editor: "paibp-smart-editor-unlocked",
    session: "paibp-smart-student-session-v63",
    teacherScope: "paibp-smart-teacher-scope-v63"
  });

  const GRADES = ["VII", "VIII", "IX"];
  const SECTIONS = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const classOptions = GRADES.flatMap((grade) => SECTIONS.map((section) => `${grade} ${section}`));

  let session = parse(sessionStorage.getItem(KEYS.session), null);
  let cameraStream = null;
  let policy = null;
  let serverOffset = 0;
  let timerId = 0;
  let policyPollId = 0;
  let teacherPollId = 0;
  let allowStudentOpen = false;
  let historyArmed = false;
  let fieldObserver = null;
  let serverReachable = false;

  function getStore(storage, key) { try { return storage.getItem(key); } catch { return null; } }
  function setStore(storage, key, value) { try { storage.setItem(key, value); } catch {} }
  function removeStore(storage, key) { try { storage.removeItem(key); } catch {} }

  function normalizeClass(value) {
    const raw = clean(value).toUpperCase().replace(/KELAS|ROMBEL|GRADE|TINGKAT/g, "")
      .replace(/[._/\\-]+/g, " ").replace(/\s+/g, "").replace(/[^A-Z0-9]/g, "");
    let grade = "", section = "";
    if (raw.startsWith("VIII")) { grade = "VIII"; section = raw.slice(4); }
    else if (raw.startsWith("VII")) { grade = "VII"; section = raw.slice(3); }
    else if (raw.startsWith("IX")) { grade = "IX"; section = raw.slice(2); }
    else if (raw.startsWith("8")) { grade = "VIII"; section = raw.slice(1); }
    else if (raw.startsWith("7")) { grade = "VII"; section = raw.slice(1); }
    else if (raw.startsWith("9")) { grade = "IX"; section = raw.slice(1); }
    section = section.replace(/[^A-Z]/g, "").slice(0, 1);
    if (!grade || !SECTIONS.includes(section)) return {code:"", label:"", grade:"", section:""};
    return {code:`${grade}${section}`, label:`${grade} ${section}`, grade, section};
  }

  function linkContext() {
    const rawClass = PARAMS.get("cat_class") || PARAMS.get("ps_class") || PARAMS.get("kelas") || PARAMS.get("class") || PARAMS.get("grade") || PARAMS.get("ps_grade") || "";
    const parsedClass = normalizeClass(rawClass);
    const requested = PARAMS.get("cat") === "1" || PARAMS.get("ps_cat") === "1" || Boolean(parsedClass.code);
    return {
      requested,
      classCode: parsedClass.code,
      classLabel: parsedClass.label,
      grade: parsedClass.grade,
      legacyToken: clean(PARAMS.get("cat_token") || PARAMS.get("ps_token") || "")
    };
  }

  function removeStaleConnectionBadges() {
    const candidates = $$('[class*="class-context"],[class*="connected"],[class*="connection"],[class*="cat-context"],[data-class-context],article,section');
    candidates.forEach((node) => {
      const text = clean(node.textContent);
      if (/^Kelas\s+terhubung\s*:/i.test(text) || /Kelas\s+terhubung\s*:\s*(VII|VIII|IX)/i.test(text)) node.remove();
    });
  }

  function clearOldCat({clearCurrent = false} = {}) {
    const oldKeys = [
      "paibp-smart-cat-context-v59", "paibp-smart-cat-state-v59", "paibp-smart-cat-expired-v59",
      "paibp-smart-student-session-v60", "paibp-smart-student-session-v61", "paibp-smart-student-session-v62",
      "paibp-smart-class-context-v56", "paibp-smart-cat-session-v56", "paibp-smart-cat-context-v58",
      "paibp-smart-cat-state-v58", "paibp-smart-cat-session-v55", "paibp-smart-cat-session-v54"
    ];
    if (clearCurrent) oldKeys.push(KEYS.session);
    oldKeys.forEach((key) => { removeStore(localStorage, key); removeStore(sessionStorage, key); });
    document.documentElement.classList.remove(
      "v59-cat-active", "v59-cat-paused", "v59-cat-expired",
      "v60-cat-active", "v60-cat-paused", "v60-cat-expired", "v60-student-camera-session",
      "v61-cat-active", "v61-cat-paused", "v61-cat-expired", "v61-student-session",
      "v62-cat-active", "v62-cat-paused", "v62-cat-expired", "v63-cat-active", "v63-cat-paused", "v63-cat-expired"
    );
    [
      "#v59-camera-gate", "#v59-expired-screen", "#v59-cat-bar", "#v59-camera-preview",
      "#v60-student-login", "#v60-camera-gate", "#v60-expired-screen", "#v60-cat-bar", "#v60-camera-preview",
      "#v61-student-login", "#v61-camera-gate", "#v61-expired-screen", "#v61-cat-bar", "#v61-camera-preview",
      "#v59-cat-control", "#v60-cat-control", "#v61-cat-control", "#v56-class-control"
    ].forEach((selector) => $(selector)?.remove());
    removeStaleConnectionBadges();
  }

  function teacherIdentity() { return parse(getStore(localStorage, KEYS.teacher), {}) || {}; }
  function isEditor() {
    const gateway = String(document.body?.dataset.privateGateway || "").toLowerCase();
    const authority = String(getStore(sessionStorage, KEYS.authority) || "").toLowerCase();
    const s = String(getStore(sessionStorage, KEYS.editor) || "").toLowerCase();
    const l = String(getStore(localStorage, KEYS.editor) || "").toLowerCase();
    return FILE === "kendali-editor.html" || gateway === "editor" || authority === "editor" || s === "yes" || s === "true" || l === "yes" || l === "true" || document.body?.dataset.teacherOwner === "yes";
  }
  function isTeacher() {
    const gateway = String(document.body?.dataset.privateGateway || "").toLowerCase();
    const authority = String(getStore(sessionStorage, KEYS.authority) || "").toLowerCase();
    const role = String(document.body?.dataset.portalRole || "").toLowerCase();
    const id = teacherIdentity();
    return FILE === "akses-guru.html" || gateway === "guru" || authority === "teacher" || role === "guru" || id.teacherRecognized === true || id.recognized === true;
  }
  const privileged = () => isEditor() || isTeacher();

  function hashText(value) {
    let hash = 2166136261;
    for (const ch of String(value || "")) { hash ^= ch.charCodeAt(0); hash = Math.imul(hash, 16777619); }
    return (hash >>> 0).toString(36);
  }
  function teacherScope() {
    if (isEditor()) return "editor-global";
    const cached = getStore(localStorage, KEYS.teacherScope);
    if (cached) return cached;
    const id = teacherIdentity();
    const scope = `guru-${hashText(`${clean(id.name || id.teacherName).toLowerCase()}|${clean(id.workUnit || id.school || id.teacherSchool).toLowerCase()}`)}`;
    setStore(localStorage, KEYS.teacherScope, scope);
    return scope;
  }

  function toast(message, tone = "info") {
    let node = $("#v63-toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "v63-toast";
      node.setAttribute("role", "status");
      node.setAttribute("aria-live", "polite");
      document.body.append(node);
    }
    node.dataset.tone = tone;
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), 3300);
  }

  function jsonp(action, params = {}, timeout = 9000) {
    return new Promise((resolve, reject) => {
      if (!READY) { reject(new Error("Alamat Google Apps Script belum valid.")); return; }
      const callback = `paibpV63_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement("script");
      const url = new URL(ENDPOINT);
      let complete = false;
      const finish = (error, value) => {
        if (complete) return;
        complete = true;
        clearTimeout(wait);
        try { delete window[callback]; } catch {}
        script.remove();
        error ? reject(error) : resolve(value);
      };
      window[callback] = (value) => { serverReachable = true; finish(null, value); };
      Object.entries({action, callback, _v:Date.now(), ...params}).forEach(([key, value]) => url.searchParams.set(key, String(value ?? "")));
      script.src = url.href;
      script.async = true;
      script.onerror = () => finish(new Error("Server tidak dapat dijangkau. Deployment harus dapat diakses oleh Siapa saja."));
      const wait = setTimeout(() => finish(new Error("Server melewati batas waktu. Periksa deployment Google Apps Script.")), timeout);
      document.head.append(script);
    });
  }

  function send(action, data) {
    if (!READY) return Promise.resolve(false);
    const body = JSON.stringify({app:"paibp-smart", version:VERSION, action, data, origin:location.origin});
    if (navigator.sendBeacon) {
      try {
        const ok = navigator.sendBeacon(ENDPOINT, new Blob([body], {type:"text/plain;charset=UTF-8"}));
        if (ok) return Promise.resolve(true);
      } catch {}
    }
    return fetch(ENDPOINT, {
      method:"POST", mode:"no-cors", cache:"no-store", keepalive:body.length < 60000,
      headers:{"Content-Type":"text/plain;charset=UTF-8"}, body
    }).then(() => true).catch(() => false);
  }

  async function getClassStatus(classCode) {
    const result = await jsonp("classStatusV63", {classCode});
    if (!result?.ok) throw new Error(result?.error || "Status kelas tidak dapat dibaca.");
    serverOffset = Number(result.serverEpoch || Date.now()) - Date.now();
    return result;
  }

  function ensureLogin() {
    let modal = $("#v63-student-login");
    if (modal) return modal;
    const link = linkContext();
    modal = document.createElement("div");
    modal.id = "v63-student-login";
    modal.className = "v63-overlay";
    modal.hidden = true;
    modal.innerHTML = `
      <section class="v63-dialog" role="dialog" aria-modal="true" aria-labelledby="v63-login-title">
        <button type="button" class="v63-close" data-v63-close aria-label="Tutup">×</button>
        <div class="v63-icon">🎓</div>
        <span class="v63-kicker">LOGIN WAJIB RUANG MURID</span>
        <h2 id="v63-login-title">Identitas Murid</h2>
        <p>Semua kolom bertanda <b class="v63-required">*</b> wajib diisi.</p>
        <form id="v63-login-form" novalidate>
          <div class="v63-form-grid">
            <label><span>NISN <b class="v63-required">*</b></span><input name="nisn" inputmode="numeric" minlength="10" maxlength="10" pattern="[0-9]{10}" placeholder="10 digit NISN" required></label>
            <label><span>Nama murid <b class="v63-required">*</b></span><input name="name" maxlength="80" placeholder="Nama lengkap" required></label>
            <label><span>Kelas <b class="v63-required">*</b></span><select name="className" required>${classOptions.map((item) => `<option value="${item}" ${item === link.classLabel ? "selected" : ""}>${item}</option>`).join("")}</select></label>
            <label><span>Nomor absen <b class="v63-required">*</b></span><input name="attendance" inputmode="numeric" maxlength="3" pattern="[0-9]{1,3}" placeholder="Nomor absen" required></label>
            <label class="v63-wide"><span>Sekolah <b class="v63-required">*</b></span><input name="school" maxlength="120" value="SMP Negeri 1 Susukan" placeholder="Nama sekolah" required></label>
          </div>
          <p class="v63-note" data-v63-login-note>${link.requested ? `Tautan kelas <strong>${esc(link.classLabel || "tidak valid")}</strong>. Status CAT diperiksa langsung dari server.` : "Setelah login, kamera depan wajib diaktifkan."}</p>
          <button class="v63-primary" type="submit">Lanjutkan</button>
          <p class="v63-error" data-v63-login-error aria-live="polite"></p>
        </form>
      </section>`;
    document.body.append(modal);
    $("[data-v63-close]", modal).onclick = () => { modal.hidden = true; };
    $("#v63-login-form", modal).addEventListener("submit", handleLogin);
    if (link.classLabel) {
      const select = $("select[name='className']", modal);
      select.value = link.classLabel;
      select.disabled = true;
      select.dataset.lockedByLink = "yes";
    }
    return modal;
  }

  function showLogin() {
    const modal = ensureLogin();
    const old = parse(getStore(localStorage, KEYS.student), {}) || {};
    const form = $("form", modal);
    if (old.nisn) form.elements.nisn.value = old.nisn;
    if (old.name || old.studentName) form.elements.name.value = old.name || old.studentName;
    if (old.attendance || old.studentNumber) form.elements.attendance.value = old.attendance || old.studentNumber;
    if (old.school || old.studentSchool) form.elements.school.value = old.school || old.studentSchool;
    if (!form.elements.className.disabled && classOptions.includes(old.className)) form.elements.className.value = old.className;
    modal.hidden = false;
    setTimeout(() => form.elements.nisn.focus(), 30);
  }

  function validateLogin(form) {
    const data = Object.fromEntries(new FormData(form).entries());
    const nisn = clean(data.nisn).replace(/\D/g, "");
    const classData = normalizeClass(data.className || linkContext().classLabel);
    if (!/^\d{10}$/.test(nisn)) throw new Error("NISN harus tepat 10 digit angka.");
    if (clean(data.name).length < 3) throw new Error("Nama murid wajib diisi lengkap.");
    if (!classData.code) throw new Error("Kelas hanya tersedia VII A–H, VIII A–H, atau IX A–H.");
    if (!/^\d{1,3}$/.test(clean(data.attendance))) throw new Error("Nomor absen wajib berupa angka.");
    if (clean(data.school).length < 4) throw new Error("Nama sekolah wajib diisi.");
    return {
      nisn,
      name: clean(data.name),
      attendance: clean(data.attendance),
      className: classData.label,
      classCode: classData.code,
      grade: classData.grade,
      school: clean(data.school)
    };
  }

  async function handleLogin(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const errorNode = $("[data-v63-login-error]", form);
    errorNode.textContent = "";
    try {
      const identity = validateLogin(form);
      const link = linkContext();
      if (link.classCode && identity.classCode !== link.classCode) throw new Error(`Tautan ini khusus Kelas ${link.classLabel}.`);
      let status = {ok:true, active:false, expired:false, policy:null, offline:false};
      try {
        status = await getClassStatus(identity.classCode);
      } catch (serverError) {
        status.offline = true;
        errorNode.textContent = "Server belum terhubung. Ruang Murid dibuka normal setelah kamera aktif; CAT tidak diaktifkan.";
      }
      session = {
        identity,
        classCode: identity.classCode,
        classLabel: identity.className,
        grade: identity.grade,
        catActive: Boolean(status.active),
        serverOffline: Boolean(status.offline),
        createdAt: new Date().toISOString()
      };
      policy = status.policy || null;
      setStore(sessionStorage, KEYS.session, JSON.stringify(session));
      setStore(localStorage, KEYS.student, JSON.stringify({...identity, studentName:identity.name, studentSchool:identity.school}));
      send("studentLoginV63", {...identity, catActive:session.catActive, serverOffline:session.serverOffline, pageUrl:location.href, device:navigator.userAgent});
      ensureLogin().hidden = true;
      if (status.expired) {
        session.catActive = true;
        setStore(sessionStorage, KEYS.session, JSON.stringify(session));
        expireCat("Waktu CAT kelas ini telah habis. Menunggu guru membuka kembali.");
        startPolicyPolling();
        return;
      }
      showCameraGate(status.offline ? "Server belum tersambung; kamera tetap wajib untuk masuk Ruang Murid normal." : "Kamera depan wajib aktif sebelum Ruang Murid dibuka.");
    } catch (error) {
      errorNode.textContent = error.message || "Login belum berhasil.";
    }
  }

  function ensureCameraGate() {
    let gate = $("#v63-camera-gate");
    if (gate) return gate;
    gate = document.createElement("div");
    gate.id = "v63-camera-gate";
    gate.className = "v63-overlay";
    gate.hidden = true;
    gate.innerHTML = `
      <section class="v63-dialog v63-camera-dialog" role="dialog" aria-modal="true">
        <div class="v63-icon">📷</div>
        <span class="v63-kicker">KAMERA WAJIB MURID</span>
        <h2>Aktifkan Kamera Depan</h2>
        <p data-v63-camera-message>Kamera wajib aktif untuk masuk.</p>
        <div class="v63-camera-stage"><video autoplay muted playsinline></video><span data-v63-camera-state>Kamera belum aktif</span></div>
        <button class="v63-primary" type="button" data-v63-camera-start>Izinkan Kamera dan Masuk</button>
        <p class="v63-error" data-v63-camera-error aria-live="polite"></p>
        <small>Video hanya tampil pada perangkat murid dan tidak disimpan.</small>
      </section>`;
    document.body.append(gate);
    $("[data-v63-camera-start]", gate).onclick = startCameraAndEnter;
    return gate;
  }

  function showCameraGate(message) {
    const gate = ensureCameraGate();
    $("[data-v63-camera-message]", gate).textContent = message;
    gate.hidden = false;
  }

  function stopCamera() {
    cameraStream?.getTracks?.().forEach((track) => track.stop());
    cameraStream = null;
    $("#v63-camera-preview")?.remove();
  }

  async function requestCamera() {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) throw new Error("Kamera memerlukan HTTPS dan browser yang mendukung izin kamera.");
    stopCamera();
    cameraStream = await navigator.mediaDevices.getUserMedia({video:{facingMode:"user", width:{ideal:640}, height:{ideal:480}}, audio:false});
    const track = cameraStream.getVideoTracks()[0];
    if (!track || track.readyState !== "live") throw new Error("Kamera belum aktif.");
    track.addEventListener("ended", () => pauseForCamera("Kamera berhenti. Aktifkan kembali untuk melanjutkan."), {once:true});
    return cameraStream;
  }

  function showCameraPreview() {
    let preview = $("#v63-camera-preview");
    if (!preview) {
      preview = document.createElement("aside");
      preview.id = "v63-camera-preview";
      preview.innerHTML = '<video autoplay muted playsinline></video><span>● Kamera aktif</span>';
      document.body.append(preview);
    }
    $("video", preview).srcObject = cameraStream;
  }

  async function startCameraAndEnter() {
    const gate = ensureCameraGate();
    const button = $("[data-v63-camera-start]", gate);
    const errorNode = $("[data-v63-camera-error]", gate);
    button.disabled = true;
    errorNode.textContent = "Meminta izin kamera…";
    try {
      const stream = await requestCamera();
      $("video", gate).srcObject = stream;
      $("[data-v63-camera-state]", gate).textContent = "Kamera aktif";
      showCameraPreview();
      send("cameraStatusV63", {...session.identity, classCode:session.classCode, status:"granted", pageUrl:location.href});
      gate.hidden = true;
      openStudentPanel();
      if (session.catActive) enterCatMode(policy);
      else startNormalSession();
    } catch (error) {
      errorNode.textContent = `${error.message || "Izin kamera ditolak."} Ruang Murid tetap terkunci.`;
      send("cameraStatusV63", {...(session?.identity || {}), classCode:session?.classCode || "", status:"denied", pageUrl:location.href});
    } finally {
      button.disabled = false;
    }
  }

  function openStudentPanel() {
    allowStudentOpen = true;
    const button = $("[data-open-panel='student']");
    if (button) button.click();
    else $("#panel-student,[data-panel='student']")?.removeAttribute("hidden");
    allowStudentOpen = false;
    setTimeout(() => {
      restrictGrade();
      observeIdentity();
      $("#panel-student,[data-panel='student']")?.scrollIntoView({block:"start", behavior:"auto"});
    }, 50);
  }

  function startNormalSession() {
    document.documentElement.classList.add("v63-student-session");
    document.documentElement.classList.remove("v63-cat-active", "v63-cat-expired", "v63-cat-paused");
    removeStaleConnectionBadges();
  }

  function ensureCatBar() {
    let bar = $("#v63-cat-bar");
    if (bar) return bar;
    bar = document.createElement("header");
    bar.id = "v63-cat-bar";
    bar.innerHTML = `<div><span>MODE CAT • <b data-v63-cat-class></b></span><strong data-v63-cat-teacher>Pengawasan guru aktif</strong><small>Scroll satu jari aktif • keluar setelah guru mengakhiri kelas</small></div><div class="v63-cat-clock"><small>Sisa waktu</small><b data-v63-countdown>--:--</b></div>`;
    document.body.append(bar);
    return bar;
  }

  function armHistory() {
    if (historyArmed) return;
    historyArmed = true;
    try {
      history.replaceState({paibpCatV63:true}, "", location.href);
      history.pushState({paibpCatV63:true}, "", location.href);
    } catch {}
  }

  function enterCatMode(value) {
    policy = value || policy;
    session.catActive = true;
    setStore(sessionStorage, KEYS.session, JSON.stringify(session));
    document.documentElement.classList.add("v63-cat-active");
    document.documentElement.classList.remove("v63-cat-expired", "v63-cat-paused");
    ensureCatBar();
    $("[data-v63-cat-class]").textContent = session.classLabel;
    $("[data-v63-cat-teacher]").textContent = policy?.teacherName ? `Dikendalikan ${policy.teacherName}` : "Pengawasan guru aktif";
    armHistory();
    restrictGrade();
    observeIdentity();
    startTimer();
    startPolicyPolling();
    send("activity", {role:"murid", userName:session.identity.name, studentClass:session.classLabel, studentNumber:session.identity.attendance, school:session.identity.school, action:"cat-start-v63", section:session.classLabel, appVersion:VERSION, pageUrl:location.href});
  }

  function serverNow() { return Date.now() + serverOffset; }
  function formatTime(milliseconds) {
    const total = Math.max(0, Math.ceil(milliseconds / 1000));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    return hours ? `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}` : `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
  }

  function startTimer() {
    clearInterval(timerId);
    const tick = () => {
      const deadline = Number(policy?.deadlineEpoch || policy?.expiresAt || 0);
      const remaining = deadline - serverNow();
      const node = $("[data-v63-countdown]");
      if (node) node.textContent = formatTime(remaining);
      if (deadline > 0 && remaining <= 0) expireCat("Waktu pengerjaan telah habis.");
    };
    tick();
    timerId = setInterval(tick, 1000);
  }

  function startPolicyPolling() {
    clearInterval(policyPollId);
    const poll = async () => {
      if (!session?.classCode) return;
      try {
        const status = await getClassStatus(session.classCode);
        if (status.expired) {
          policy = status.policy;
          expireCat("Waktu CAT telah berakhir.");
        } else if (status.active) {
          const oldSession = policy?.sessionId || "";
          policy = status.policy;
          if (oldSession && policy?.sessionId && oldSession !== policy.sessionId) {
            $("#v63-expired-screen")?.remove();
            document.documentElement.classList.remove("v63-cat-expired");
            startTimer();
            toast("Sesi CAT baru telah dibuka guru.", "success");
          }
        } else {
          releaseByTeacher();
        }
      } catch {
        // Timer lokal tetap berjalan memakai sinkronisasi terakhir.
      }
    };
    policyPollId = setInterval(poll, 6000);
  }

  function ensureExpiredScreen(message) {
    let screen = $("#v63-expired-screen");
    if (!screen) {
      screen = document.createElement("div");
      screen.id = "v63-expired-screen";
      screen.className = "v63-overlay";
      screen.innerHTML = `<section class="v63-dialog" role="alertdialog" aria-modal="true"><div class="v63-icon">⏱️</div><span class="v63-kicker">AKSES KELAS TERKUNCI</span><h2>Waktu CAT Selesai</h2><p data-v63-expired-message></p><div class="v63-waiting"><i></i><span>Menunggu guru atau editor…</span></div></section>`;
      document.body.append(screen);
    }
    $("[data-v63-expired-message]", screen).textContent = message;
    return screen;
  }

  function expireCat(message) {
    if (!session?.catActive) return;
    clearInterval(timerId);
    document.documentElement.classList.add("v63-cat-expired");
    document.documentElement.classList.remove("v63-cat-paused");
    ensureExpiredScreen(message).hidden = false;
  }

  function releaseByTeacher() {
    if (!session?.catActive) return;
    clearInterval(timerId);
    clearInterval(policyPollId);
    session.catActive = false;
    setStore(sessionStorage, KEYS.session, JSON.stringify(session));
    stopCamera();
    document.documentElement.classList.remove("v63-cat-active", "v63-cat-expired", "v63-cat-paused", "v63-student-session");
    $("#v63-cat-bar")?.remove();
    $("#v63-expired-screen")?.remove();
    removeStaleConnectionBadges();
    toast("CAT telah dimatikan guru. Tidak ada kelas terhubung.", "success");
    setTimeout(() => location.replace(new URL(`index.html?v=${VERSION}`, document.baseURI).href), 700);
  }

  function pauseForCamera(message) {
    if (!session || privileged()) return;
    document.documentElement.classList.add("v63-cat-paused");
    showCameraGate(message);
    $("[data-v63-camera-state]").textContent = "Kamera tidak aktif";
  }

  function repairIdentity() {
    if (!session?.identity) return;
    const id = session.identity;
    const mappings = [
      ["input[name='studentName'],input[data-lkpd-field='studentName']", id.name],
      ["input[name='attendance'],input[data-lkpd-field='attendance']", id.attendance],
      ["input[name='className'],input[data-lkpd-field='className'],input[data-student-class]", id.className],
      ["input[name='nisn'],input[data-lkpd-field='nisn']", id.nisn],
      ["input[name='school'],input[data-lkpd-field='school']", id.school]
    ];
    mappings.forEach(([selector, value]) => $$(selector).forEach((input) => {
      input.value = value;
      input.readOnly = true;
      input.dataset.v63Locked = "yes";
    }));
  }

  function observeIdentity() {
    repairIdentity();
    if (fieldObserver) return;
    const panel = $("#panel-student,[data-panel='student']") || document.body;
    let queued = false;
    fieldObserver = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; repairIdentity(); });
    });
    fieldObserver.observe(panel, {childList:true, subtree:true});
  }

  function restrictGrade() {
    if (!session?.grade) return;
    $$('[data-grade-filter]').forEach((button) => {
      const allowed = String(button.dataset.gradeFilter || "").toUpperCase() === session.grade;
      button.hidden = !allowed;
      button.disabled = !allowed;
      if (allowed && button.getAttribute("aria-pressed") !== "true") setTimeout(() => button.click(), 0);
    });
  }

  function buildClassLink(item) {
    const url = new URL("index.html", document.baseURI);
    url.searchParams.set("cat", "1");
    url.searchParams.set("kelas", item.classCode);
    return url.href;
  }

  function ensureTeacherControl() {
    if (!privileged()) return null;
    let panel = $("#v63-cat-control");
    if (panel) return panel;
    panel = document.createElement("section");
    panel.id = "v63-cat-control";
    panel.innerHTML = `<header><div><span>${isEditor() ? "KENDALI EDITOR" : "KENDALI GURU"}</span><h2>CAT Kelas Aktif</h2><p>Hanya kelas A–H yang tersedia. Tautan kelas bersifat tetap dan selalu memakai versi aplikasi terbaru.</p></div><b data-v63-control-status>Memeriksa server…</b></header>
      <div class="v63-control-grid"><label><span>Kelas</span><select data-v63-class>${classOptions.map((item) => `<option value="${item}">${item}</option>`).join("")}</select></label>
      <label><span>Durasi</span><div><input data-v63-duration type="number" min="5" max="240" value="45"><em>menit</em></div></label>
      <div class="v63-control-actions"><button data-v63-activate>Aktifkan CAT</button><button data-v63-copy disabled>Salin Tautan</button><button data-v63-reset>Ulang Timer</button><button data-v63-stop>Matikan Kelas</button>${isEditor() ? '<button data-v63-stop-all>Matikan Semua CAT</button>' : ""}</div></div>
      <div class="v63-active-classes" data-v63-active-classes><p>Memuat kelas aktif…</p></div>`;
    $("#v59-cat-control,#v60-cat-control,#v61-cat-control,#v56-class-control")?.remove();
    ($("main") || document.body).prepend(panel);
    const select = $("[data-v63-class]", panel);
    const duration = $("[data-v63-duration]", panel);
    let currentLink = "";

    const run = async (command) => {
      const cls = normalizeClass(select.value);
      if (!cls.code) throw new Error("Pilih kelas A–H.");
      const id = teacherIdentity();
      const result = await jsonp("classControlV63", {
        readKey:READ_KEY,
        command,
        classCode:cls.code,
        durationMinutes:Math.max(5, Math.min(240, Number(duration.value || 45))),
        actorScope:teacherScope(),
        actorRole:isEditor() ? "editor" : "teacher",
        teacherName:clean(id.name || id.teacherName || (isEditor() ? "Editor PAIBP SMART" : "Guru")),
        teacherSchool:clean(id.workUnit || id.school || id.teacherSchool || "SMP Negeri 1 Susukan")
      });
      if (!result?.ok) throw new Error(result?.error || "Perintah gagal.");
      currentLink = result.policy?.active ? buildClassLink(result.policy) : "";
      $("[data-v63-copy]", panel).disabled = !currentLink;
      await refreshTeacherClasses();
      return result;
    };

    $("[data-v63-activate]", panel).onclick = async () => { try { await run("activate"); toast(`CAT ${select.value} aktif.`, "success"); } catch (error) { toast(error.message, "error"); } };
    $("[data-v63-reset]", panel).onclick = async () => { try { await run("reset"); toast(`Timer ${select.value} diulang.`, "success"); } catch (error) { toast(error.message, "error"); } };
    $("[data-v63-stop]", panel).onclick = async () => { try { await run("stop"); currentLink = ""; $("[data-v63-copy]", panel).disabled = true; toast(`CAT ${select.value} dimatikan.`, "success"); } catch (error) { toast(error.message, "error"); } };
    $("[data-v63-copy]", panel).onclick = async () => {
      if (!currentLink) return;
      try { await navigator.clipboard.writeText(currentLink); toast("Tautan tetap kelas berhasil disalin.", "success"); }
      catch { window.prompt("Salin tautan kelas:", currentLink); }
    };
    $("[data-v63-stop-all]", panel)?.addEventListener("click", async () => { try { await run("stopAll"); currentLink = ""; toast("Semua CAT dimatikan.", "success"); } catch (error) { toast(error.message, "error"); } });
    panel._select = (item) => {
      const label = normalizeClass(item.classCode).label;
      if (label) select.value = label;
      duration.value = item.durationMinutes || 45;
      currentLink = item.active ? buildClassLink(item) : "";
      $("[data-v63-copy]", panel).disabled = !currentLink;
    };
    return panel;
  }

  async function refreshTeacherClasses() {
    const panel = ensureTeacherControl();
    if (!panel || !READY) return;
    const status = $("[data-v63-control-status]", panel);
    try {
      const result = await jsonp("classListV63", {readKey:READ_KEY, actorScope:teacherScope(), actorRole:isEditor() ? "editor" : "teacher"});
      if (!result?.ok) throw new Error(result?.error || "Gagal memuat kelas.");
      serverReachable = true;
      const all = Array.isArray(result.classes) ? result.classes : [];
      const classes = all.filter((item) => item.active || item.expired);
      const list = $("[data-v63-active-classes]", panel);
      list.innerHTML = classes.length ? classes.map((item, index) => {
        const remaining = Number(item.deadlineEpoch || 0) - Number(result.serverEpoch || Date.now());
        return `<article data-state="${item.active ? "active" : "expired"}"><div><strong>Kelas ${esc(item.classLabel || item.classCode)}</strong><small>${esc(item.teacherName || "Guru")} • ${item.active ? `sisa ${formatTime(remaining)}` : "waktu habis"}</small></div><div><b>${item.active ? "AKTIF" : "HABIS"}</b><button data-v63-pick="${index}">Pilih</button></div></article>`;
      }).join("") : "<p>Tidak ada kelas CAT aktif.</p>";
      $$('[data-v63-pick]', list).forEach((button) => button.onclick = () => panel._select(classes[Number(button.dataset.v63Pick)]));
      status.textContent = classes.filter((item) => item.active).length ? `${classes.filter((item) => item.active).length} kelas aktif` : "Server tersambung • semua CAT nonaktif";
      status.dataset.state = classes.some((item) => item.active) ? "active" : "idle";
    } catch (error) {
      serverReachable = false;
      status.textContent = "Server belum tersambung";
      status.dataset.state = "error";
      $("[data-v63-active-classes]", panel).innerHTML = `<p>${esc(error.message || "Deployment belum dapat dijangkau.")}</p>`;
    }
  }

  function interceptStudent(event) {
    const button = event.target.closest('[data-open-panel="student"]');
    if (!button || allowStudentOpen || privileged()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    showLogin();
  }

  function interceptNavigation(event) {
    if (!session?.catActive || privileged()) return;
    const target = event.target.closest("a[href],[data-close-workspace],[data-open-panel]:not([data-open-panel='student']),.workspace-close,.topbar a,.links a");
    if (!target || target.closest("#v63-cat-bar,#v63-camera-gate,#v63-expired-screen")) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    toast("Tidak dapat keluar sebelum guru mengakhiri CAT.", "warning");
  }

  function initEvents() {
    document.addEventListener("click", interceptStudent, true);
    document.addEventListener("click", interceptNavigation, true);
    window.addEventListener("popstate", () => {
      if (!session?.catActive || privileged()) return;
      try { history.pushState({paibpCatV63:true}, "", location.href); } catch {}
      toast("Tombol kembali dikunci selama CAT.", "warning");
    });
    document.addEventListener("visibilitychange", () => {
      if (!session?.catActive || privileged()) return;
      if (document.visibilityState === "hidden") {
        send("activity", {role:"murid", userName:session.identity.name, studentClass:session.classLabel, action:"cat-page-hidden-v63", appVersion:VERSION, pageUrl:location.href});
      } else {
        const live = cameraStream?.getVideoTracks?.().some((track) => track.readyState === "live" && track.enabled);
        if (!live) pauseForCamera("Kamera tidak aktif. Aktifkan kembali untuk melanjutkan.");
      }
    });
    window.addEventListener("beforeunload", (event) => {
      if (!session?.catActive || privileged()) return;
      event.preventDefault();
      event.returnValue = "";
    });
  }

  function init() {
    const link = linkContext();
    clearOldCat({clearCurrent:!link.requested});
    if (!link.requested) session = null;
    ensureLogin();
    ensureCameraGate();
    initEvents();
    if (privileged()) {
      ensureTeacherControl();
      refreshTeacherClasses();
      teacherPollId = setInterval(refreshTeacherClasses, 10000);
    } else if (link.requested) {
      setTimeout(showLogin, 80);
    } else {
      setTimeout(removeStaleConnectionBadges, 120);
    }
    const api = Object.freeze({version:VERSION, normalizeClass, showLogin, refreshTeacherClasses, isTeacher, isEditor, startFromLegacy(){}, enterStudentRoom(){ if (!privileged()) showLogin(); }});
    window.PAIBP_CAT_V63 = api;
    window.PAIBP_CAT_V62 = api;
    window.PAIBP_CAT_V61 = api;
    window.PAIBP_CAT_V60 = api;
    window.PAIBP_CAT_V59 = api;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
})();
