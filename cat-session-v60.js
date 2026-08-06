(() => {
  "use strict";

  const VERSION = "60";
  const CONFIG = window.PAIBP_CONFIG || {};
  const ENDPOINT = String(CONFIG.syncEndpoint || CONFIG.realtimeEndpoint || "").trim();
  const READ_KEY = String(CONFIG.syncReadKey || CONFIG.realtimeReadKey || "").trim();
  const READY = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(ENDPOINT);
  const FILE = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const URL_PARAMS = new URLSearchParams(location.search);

  const KEYS = Object.freeze({
    student: "paibp-smart-student-identity-v1",
    teacher: "paibp-smart-teacher-identity-v1",
    editor: "paibp-smart-editor-unlocked",
    authority: "paibp-smart-authority-v56",
    session: "paibp-smart-student-session-v60",
    teacherScope: "paibp-smart-teacher-scope-v60"
  });

  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];
  const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
  const parse = (value, fallback) => { try { return JSON.parse(value); } catch { return fallback; } };
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);

  let studentSession = parse(sessionStorage.getItem(KEYS.session), null);
  let cameraStream = null;
  let currentPolicy = null;
  let serverOffset = 0;
  let timerId = 0;
  let policyPollId = 0;
  let teacherPollId = 0;
  let historyGuarded = false;
  let allowStudentButton = false;
  let fieldRepairQueued = false;

  // Penanda kompatibilitas: menghentikan mesin CAT V56 lama agar tidak berjalan bersamaan.
  window.PAIBP_CAT_V59 = {
    version: VERSION,
    startFromLegacy() {},
    enterStudentRoom() { if (!privileged()) showLogin(); }
  };

  const classOptions = ["VII", "VIII", "IX"].flatMap((grade) =>
    ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"].map((section) => `${grade} ${section}`)
  );

  function storageGet(storage, key) {
    try { return storage.getItem(key); } catch { return null; }
  }

  function storageSet(storage, key, value) {
    try { storage.setItem(key, value); } catch {}
  }

  function storageRemove(storage, key) {
    try { storage.removeItem(key); } catch {}
  }

  function clearLegacyCatState() {
    [
      "paibp-smart-cat-context-v59",
      "paibp-smart-cat-state-v59",
      "paibp-smart-cat-expired-v59",
      "paibp-smart-class-context-v56",
      "paibp-smart-cat-context-v58",
      "paibp-smart-cat-state-v58"
    ].forEach((key) => {
      storageRemove(localStorage, key);
      storageRemove(sessionStorage, key);
    });
    document.documentElement.classList.remove(
      "v59-cat-active", "v59-cat-paused", "v59-cat-expired",
      "v44-student-focus", "v44-student-session", "v44-focus-paused"
    );
    ["#v59-camera-gate", "#v59-expired-screen", "#v59-cat-bar", "#v59-camera-preview", "#v44-focus-gate"].forEach((selector) => $(selector)?.remove());
  }

  function normalizeClass(value) {
    const raw = clean(value).toUpperCase()
      .replace(/KELAS|ROMBEL|GRADE|TINGKAT/g, "")
      .replace(/[._/\\-]+/g, " ")
      .replace(/\s+/g, "")
      .replace(/[^A-Z0-9]/g, "");
    let grade = "";
    let section = "";
    if (raw.startsWith("VIII")) { grade = "VIII"; section = raw.slice(4); }
    else if (raw.startsWith("VII")) { grade = "VII"; section = raw.slice(3); }
    else if (raw.startsWith("IX")) { grade = "IX"; section = raw.slice(2); }
    else if (raw.startsWith("8")) { grade = "VIII"; section = raw.slice(1); }
    else if (raw.startsWith("7")) { grade = "VII"; section = raw.slice(1); }
    else if (raw.startsWith("9")) { grade = "IX"; section = raw.slice(1); }
    section = section.replace(/[^A-Z0-9]/g, "").slice(0, 3);
    if (!grade || !section) return { code: "", label: "", grade: "", section: "" };
    return { code: `${grade}${section}`, label: `${grade} ${section}`, grade, section };
  }

  function teacherIdentity() {
    return parse(storageGet(localStorage, KEYS.teacher), {}) || {};
  }

  function isEditor() {
    const gateway = String(document.body?.dataset.privateGateway || "").toLowerCase();
    const authority = String(storageGet(sessionStorage, KEYS.authority) || "").toLowerCase();
    const session = String(storageGet(sessionStorage, KEYS.editor) || "").toLowerCase();
    const local = String(storageGet(localStorage, KEYS.editor) || "").toLowerCase();
    return FILE === "kendali-editor.html" || gateway === "editor" || authority === "editor"
      || session === "true" || session === "yes" || local === "true" || local === "yes"
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

  function hashText(value) {
    let hash = 2166136261;
    for (const character of String(value || "")) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function teacherScope() {
    if (isEditor()) return "editor-global";
    const cached = storageGet(localStorage, KEYS.teacherScope);
    if (cached) return cached;
    const identity = teacherIdentity();
    const scope = `guru-${hashText(`${clean(identity.name || identity.teacherName).toLowerCase()}|${clean(identity.workUnit || identity.school || identity.teacherSchool).toLowerCase()}`)}`;
    storageSet(localStorage, KEYS.teacherScope, scope);
    return scope;
  }

  function toast(message, tone = "info") {
    let node = $("#v60-toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "v60-toast";
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

  function jsonp(action, params = {}, timeout = 14000) {
    return new Promise((resolve, reject) => {
      if (!READY) { reject(new Error("Google Apps Script belum tersambung.")); return; }
      const callback = `paibpV60_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement("script");
      const url = new URL(ENDPOINT);
      let finished = false;
      const done = (error, value) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        try { delete window[callback]; } catch {}
        script.remove();
        error ? reject(error) : resolve(value);
      };
      window[callback] = (value) => done(null, value);
      Object.entries({ action, callback, _v: Date.now(), ...params }).forEach(([key, value]) => url.searchParams.set(key, String(value ?? "")));
      script.src = url.href;
      script.async = true;
      script.onerror = () => done(new Error("Server tidak dapat dijangkau."));
      const timer = setTimeout(() => done(new Error("Server melewati batas waktu.")), timeout);
      document.head.append(script);
    });
  }

  function send(action, data) {
    if (!READY) return Promise.resolve(false);
    const body = JSON.stringify({ app: "paibp-smart", version: VERSION, action, data, origin: location.origin });
    if (navigator.sendBeacon) {
      try {
        const sent = navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "text/plain;charset=UTF-8" }));
        if (sent) return Promise.resolve(true);
      } catch {}
    }
    return fetch(ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      cache: "no-store",
      keepalive: body.length < 60000,
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body
    }).then(() => true).catch(() => false);
  }

  function requestedLinkContext() {
    const classData = normalizeClass(URL_PARAMS.get("cat_class") || URL_PARAMS.get("ps_class") || URL_PARAMS.get("kelas") || "");
    return {
      classCode: classData.code,
      classLabel: classData.label,
      grade: classData.grade,
      token: clean(URL_PARAMS.get("cat_token") || URL_PARAMS.get("ps_token") || ""),
      requested: URL_PARAMS.get("cat") === "1" || URL_PARAMS.get("ps_cat") === "1"
    };
  }

  function ensureLoginModal() {
    let modal = $("#v60-student-login");
    if (modal) return modal;
    const link = requestedLinkContext();
    modal = document.createElement("div");
    modal.id = "v60-student-login";
    modal.className = "v60-overlay";
    modal.hidden = true;
    modal.innerHTML = `
      <section class="v60-dialog" role="dialog" aria-modal="true" aria-labelledby="v60-login-title">
        <button type="button" class="v60-close" data-v60-close-login aria-label="Tutup">×</button>
        <div class="v60-dialog-icon" aria-hidden="true">🎓</div>
        <span class="v60-kicker">IDENTITAS WAJIB RUANG MURID</span>
        <h2 id="v60-login-title">Login Murid PAIBP SMART</h2>
        <p>Semua kolom bertanda <b class="v60-required">*</b> wajib diisi. Identitas dipakai untuk mengunci kelas, tugas, dan rekap guru.</p>
        <form id="v60-student-login-form" novalidate>
          <div class="v60-form-grid">
            <label><span>NISN <b class="v60-required">*</b></span><input name="nisn" inputmode="numeric" autocomplete="off" minlength="10" maxlength="10" pattern="[0-9]{10}" placeholder="10 digit NISN" required></label>
            <label><span>Nama murid <b class="v60-required">*</b></span><input name="name" autocomplete="name" maxlength="80" placeholder="Nama lengkap" required></label>
            <label><span>Kelas <b class="v60-required">*</b></span><select name="className" required>${classOptions.map((item) => `<option value="${item}" ${item === link.classLabel ? "selected" : ""}>${item}</option>`).join("")}</select></label>
            <label><span>Nomor absen <b class="v60-required">*</b></span><input name="attendance" inputmode="numeric" maxlength="3" pattern="[0-9]{1,3}" placeholder="Nomor absen" required></label>
            <label class="v60-form-wide"><span>Sekolah <b class="v60-required">*</b></span><input name="school" maxlength="120" value="SMP Negeri 1 Susukan" placeholder="Nama sekolah" required></label>
          </div>
          <p class="v60-form-note" data-v60-login-note>${link.requested ? `Tautan kelas: <strong>${esc(link.classLabel || "belum valid")}</strong>` : "Setelah login, kamera depan wajib diaktifkan sebelum Ruang Murid terbuka."}</p>
          <button class="v60-primary" type="submit">Lanjutkan dan Aktifkan Kamera</button>
          <p class="v60-form-error" data-v60-login-error aria-live="polite"></p>
        </form>
      </section>`;
    document.body.append(modal);
    $("[data-v60-close-login]", modal)?.addEventListener("click", () => { modal.hidden = true; });
    $("#v60-student-login-form", modal)?.addEventListener("submit", handleStudentLogin);
    if (link.classLabel) {
      const select = $("select[name='className']", modal);
      select.value = link.classLabel;
      select.disabled = true;
      select.dataset.lockedByLink = "true";
    }
    return modal;
  }

  function showLogin() {
    const modal = ensureLoginModal();
    const previous = parse(storageGet(localStorage, KEYS.student), {}) || {};
    const form = $("form", modal);
    if (form) {
      if (previous.nisn) form.elements.nisn.value = previous.nisn;
      if (previous.name) form.elements.name.value = previous.name;
      if (previous.attendance) form.elements.attendance.value = previous.attendance;
      if (previous.school) form.elements.school.value = previous.school;
      if (!form.elements.className.disabled && previous.className && classOptions.includes(previous.className)) form.elements.className.value = previous.className;
    }
    modal.hidden = false;
    setTimeout(() => form?.elements.nisn?.focus(), 40);
  }

  function ensureCameraGate() {
    let gate = $("#v60-camera-gate");
    if (gate) return gate;
    gate = document.createElement("div");
    gate.id = "v60-camera-gate";
    gate.className = "v60-overlay";
    gate.hidden = true;
    gate.innerHTML = `
      <section class="v60-dialog v60-camera-dialog" role="dialog" aria-modal="true" aria-labelledby="v60-camera-title">
        <div class="v60-dialog-icon" aria-hidden="true">📷</div>
        <span class="v60-kicker">KAMERA WAJIB KHUSUS MURID</span>
        <h2 id="v60-camera-title">Aktifkan Kamera Depan</h2>
        <p>Ruang Murid belum dapat dibuka sebelum izin kamera diberikan. Guru dan editor tidak dikenai kewajiban ini.</p>
        <div class="v60-camera-stage"><video autoplay muted playsinline></video><span data-v60-camera-state>Kamera belum aktif</span></div>
        <button class="v60-primary" type="button" data-v60-camera-start>Izinkan Kamera dan Masuk</button>
        <p class="v60-form-error" data-v60-camera-error aria-live="polite"></p>
        <small>Video tidak direkam oleh halaman ini. Status kamera dan sesi belajar dicatat untuk rekap guru.</small>
      </section>`;
    document.body.append(gate);
    $("[data-v60-camera-start]", gate)?.addEventListener("click", startCameraAndEnter);
    return gate;
  }

  function stopCamera() {
    cameraStream?.getTracks?.().forEach((track) => track.stop());
    cameraStream = null;
    $("#v60-camera-preview")?.remove();
  }

  async function requestCamera() {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      throw new Error("Kamera membutuhkan HTTPS dan browser yang mendukung izin kamera.");
    }
    stopCamera();
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false
    });
    const track = cameraStream.getVideoTracks()[0];
    track?.addEventListener("ended", () => pauseForCamera("Kamera berhenti. Aktifkan kembali untuk melanjutkan."), { once: true });
    return cameraStream;
  }

  function showCameraPreview() {
    let preview = $("#v60-camera-preview");
    if (!preview) {
      preview = document.createElement("aside");
      preview.id = "v60-camera-preview";
      preview.innerHTML = `<video autoplay muted playsinline></video><span>📷 Kamera murid aktif</span>`;
      document.body.append(preview);
    }
    $("video", preview).srcObject = cameraStream;
  }

  function validateLogin(form) {
    const data = Object.fromEntries(new FormData(form).entries());
    const nisn = clean(data.nisn).replace(/\D/g, "");
    const classData = normalizeClass(data.className || requestedLinkContext().classLabel);
    if (!/^\d{10}$/.test(nisn)) throw new Error("NISN wajib terdiri dari tepat 10 digit angka.");
    if (clean(data.name).length < 3) throw new Error("Nama murid wajib diisi lengkap.");
    if (!classData.code) throw new Error("Kelas wajib dipilih.");
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

  async function getClassStatus(classCode, token = "") {
    const result = await jsonp("classStatusV60", { classCode, token });
    if (!result?.ok) throw new Error(result?.error || "Status kelas tidak dapat dibaca.");
    serverOffset = Number(result.serverEpoch || Date.now()) - Date.now();
    return result;
  }

  async function handleStudentLogin(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const errorNode = $("[data-v60-login-error]", form);
    errorNode.textContent = "";
    try {
      const identity = validateLogin(form);
      const link = requestedLinkContext();
      if (link.classCode && identity.classCode !== link.classCode) throw new Error(`Tautan ini khusus Kelas ${link.classLabel}.`);
      const status = await getClassStatus(identity.classCode, link.token);
      if (status.active && !status.authorized) throw new Error("Kelas sedang menjalankan CAT. Masuklah melalui tautan resmi yang dibagikan guru.");
      studentSession = {
        identity,
        classCode: identity.classCode,
        classLabel: identity.className,
        grade: identity.grade,
        token: link.token || "",
        catActive: Boolean(status.active && status.authorized),
        createdAt: new Date().toISOString()
      };
      storageSet(sessionStorage, KEYS.session, JSON.stringify(studentSession));
      storageSet(localStorage, KEYS.student, JSON.stringify({
        ...identity,
        studentName: identity.name,
        studentSchool: identity.school
      }));
      send("studentLoginV60", {
        ...identity,
        sessionId: `login-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        catRequested: Boolean(status.active),
        catAuthorized: Boolean(status.authorized),
        pageUrl: location.href,
        device: navigator.userAgent
      });
      currentPolicy = status.policy || null;
      ensureLoginModal().hidden = true;
      if (status.expired && link.requested && status.authorized) {
        studentSession.catActive = true;
        storageSet(sessionStorage, KEYS.session, JSON.stringify(studentSession));
        expireCat("Waktu kelas telah habis. Tautan ini menunggu dibuka ulang oleh guru.");
        startPolicyPolling();
        return;
      }
      const gate = ensureCameraGate();
      gate.hidden = false;
      $("[data-v60-camera-error]", gate).textContent = "";
    } catch (error) {
      errorNode.textContent = error.message || "Login belum berhasil.";
    }
  }

  async function startCameraAndEnter() {
    const gate = ensureCameraGate();
    const button = $("[data-v60-camera-start]", gate);
    const errorNode = $("[data-v60-camera-error]", gate);
    button.disabled = true;
    errorNode.textContent = "Meminta izin kamera…";
    try {
      const stream = await requestCamera();
      $("video", gate).srcObject = stream;
      $("[data-v60-camera-state]", gate).textContent = "Kamera aktif";
      showCameraPreview();
      send("cameraStatusV60", {
        ...studentSession.identity,
        classCode: studentSession.classCode,
        status: "granted",
        pageUrl: location.href
      });
      gate.hidden = true;
      openStudentPanel();
      if (studentSession.catActive) await enterCatMode(currentPolicy);
      else startNormalStudentSession();
    } catch (error) {
      errorNode.textContent = `${error.message || "Izin kamera ditolak."} Ruang Murid tetap terkunci.`;
      send("cameraStatusV60", {
        ...(studentSession?.identity || {}),
        classCode: studentSession?.classCode || "",
        status: "denied",
        pageUrl: location.href
      });
    } finally {
      button.disabled = false;
    }
  }

  function openStudentPanel() {
    allowStudentButton = true;
    const button = $("[data-open-panel='student']");
    if (button) button.click();
    else {
      const panel = $("#panel-student,[data-panel='student']");
      if (panel) panel.hidden = false;
    }
    allowStudentButton = false;
    setTimeout(() => {
      restrictToLoggedGrade();
      repairIdentityFields();
      $("#panel-student,[data-panel='student']")?.scrollIntoView({ block: "start", behavior: "auto" });
    }, 80);
  }

  function startNormalStudentSession() {
    document.documentElement.classList.add("v60-student-camera-session");
    document.documentElement.classList.remove("v60-cat-active", "v60-cat-expired", "v60-cat-paused");
    observeIdentityFields();
  }

  async function requestFullscreenSoft() {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen({ navigationUI: "hide" });
      }
    } catch {
      // CAT tetap berjalan; beberapa browser seluler menolak fullscreen otomatis.
    }
  }

  function ensureCatBar() {
    let bar = $("#v60-cat-bar");
    if (bar) return bar;
    bar = document.createElement("header");
    bar.id = "v60-cat-bar";
    bar.innerHTML = `
      <div><span>MODE CAT • <b data-v60-cat-class></b></span><strong data-v60-cat-teacher>Pengawasan guru aktif</strong><small>Scroll satu jari aktif • keluar hanya setelah guru mengakhiri kelas</small></div>
      <div class="v60-cat-clock"><small>Sisa waktu</small><b data-v60-countdown>--:--</b></div>`;
    document.body.append(bar);
    return bar;
  }

  function guardHistory() {
    if (historyGuarded) return;
    historyGuarded = true;
    try {
      history.replaceState({ paibpCatV60: true }, "", location.href);
      history.pushState({ paibpCatV60: true }, "", location.href);
    } catch {}
  }

  async function enterCatMode(policy) {
    currentPolicy = policy;
    studentSession.catActive = true;
    storageSet(sessionStorage, KEYS.session, JSON.stringify(studentSession));
    document.documentElement.classList.add("v60-cat-active");
    document.documentElement.classList.remove("v60-cat-expired", "v60-cat-paused");
    ensureCatBar();
    $("[data-v60-cat-class]").textContent = studentSession.classLabel;
    $("[data-v60-cat-teacher]").textContent = policy?.teacherName ? `Dikendalikan ${policy.teacherName}` : "Pengawasan guru aktif";
    guardHistory();
    restrictToLoggedGrade();
    observeIdentityFields();
    startTimer();
    startPolicyPolling();
    requestFullscreenSoft();
    send("activity", {
      role: "murid",
      userName: studentSession.identity.name,
      studentClass: studentSession.classLabel,
      studentNumber: studentSession.identity.attendance,
      school: studentSession.identity.school,
      action: "cat-start-v60",
      section: studentSession.classLabel,
      appVersion: VERSION,
      pageUrl: location.href
    });
  }

  function nowServer() {
    return Date.now() + serverOffset;
  }

  function formatCountdown(milliseconds) {
    const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const rest = seconds % 60;
    return hours > 0
      ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`
      : `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  }

  function startTimer() {
    clearInterval(timerId);
    const tick = () => {
      const deadline = Number(currentPolicy?.deadlineEpoch || currentPolicy?.expiresAt || 0);
      const remaining = deadline - nowServer();
      const node = $("[data-v60-countdown]");
      if (node) node.textContent = formatCountdown(remaining);
      if (deadline > 0 && remaining <= 0) expireCat("Waktu pengerjaan telah habis.");
    };
    tick();
    timerId = setInterval(tick, 1000);
  }

  function startPolicyPolling() {
    clearInterval(policyPollId);
    const poll = async () => {
      try {
        const status = await getClassStatus(studentSession.classCode, studentSession.token);
        if (status.expired && status.authorized) {
          currentPolicy = status.policy;
          expireCat("Waktu kelas telah berakhir.");
        } else if (status.active && status.authorized) {
          const oldSession = currentPolicy?.sessionId || "";
          currentPolicy = status.policy;
          if (oldSession && currentPolicy?.sessionId && oldSession !== currentPolicy.sessionId) {
            expireCat("Sesi kelas telah diganti oleh guru. Gunakan tautan kelas yang baru.");
            return;
          }
          if (document.documentElement.classList.contains("v60-cat-expired")) resumeFromTeacherReset();
        } else if (!status.authorized && status.requiresClassLink) {
          expireCat("Tautan kelas tidak lagi berlaku.");
        } else if (status.ended || status.released || !status.active) {
          releaseByTeacher();
        }
      } catch {
        // Timer lokal tetap berjalan menggunakan sinkronisasi terakhir.
      }
    };
    policyPollId = setInterval(poll, 5000);
  }

  function ensureExpiredScreen(message) {
    let screen = $("#v60-expired-screen");
    if (!screen) {
      screen = document.createElement("div");
      screen.id = "v60-expired-screen";
      screen.className = "v60-overlay";
      screen.innerHTML = `
        <section class="v60-dialog" role="alertdialog" aria-modal="true">
          <div class="v60-dialog-icon" aria-hidden="true">⏱️</div>
          <span class="v60-kicker">AKSES KELAS TERKUNCI</span>
          <h2>Waktu CAT Selesai</h2>
          <p data-v60-expired-message></p>
          <div class="v60-waiting"><i></i><span>Menunggu perintah guru atau editor…</span></div>
        </section>`;
      document.body.append(screen);
    }
    $("[data-v60-expired-message]", screen).textContent = message;
    return screen;
  }

  function expireCat(message) {
    if (!studentSession?.catActive) return;
    clearInterval(timerId);
    document.documentElement.classList.add("v60-cat-expired");
    document.documentElement.classList.remove("v60-cat-paused");
    ensureExpiredScreen(message).hidden = false;
    send("activity", {
      role: "murid",
      userName: studentSession.identity.name,
      studentClass: studentSession.classLabel,
      studentNumber: studentSession.identity.attendance,
      action: "cat-expired-v60",
      section: message,
      appVersion: VERSION,
      pageUrl: location.href
    });
  }

  function resumeFromTeacherReset() {
    $("#v60-expired-screen")?.setAttribute("hidden", "");
    document.documentElement.classList.remove("v60-cat-expired");
    document.documentElement.classList.add("v60-cat-active");
    startTimer();
    toast("Timer telah diaktifkan kembali oleh guru.", "success");
  }

  function releaseByTeacher() {
    if (!studentSession?.catActive) return;
    clearInterval(timerId);
    clearInterval(policyPollId);
    studentSession.catActive = false;
    storageRemove(sessionStorage, KEYS.session);
    stopCamera();
    document.documentElement.classList.remove("v60-cat-active", "v60-cat-expired", "v60-cat-paused", "v60-student-camera-session");
    $("#v60-cat-bar")?.remove();
    $("#v60-expired-screen")?.remove();
    toast("Kelas telah diakhiri oleh guru. Akses dikembalikan ke beranda.", "success");
    send("activity", {
      role: "murid",
      userName: studentSession.identity.name,
      studentClass: studentSession.classLabel,
      action: "cat-released-v60",
      appVersion: VERSION,
      pageUrl: location.href
    });
    setTimeout(() => location.replace(new URL("index.html", document.baseURI).href), 1200);
  }

  function pauseForCamera(message) {
    if (!studentSession || privileged()) return;
    document.documentElement.classList.add("v60-cat-paused");
    const gate = ensureCameraGate();
    gate.hidden = false;
    $("[data-v60-camera-error]", gate).textContent = message;
    $("[data-v60-camera-state]", gate).textContent = "Kamera tidak aktif";
  }

  function repairIdentityFields() {
    if (!studentSession?.identity) return;
    const identity = studentSession.identity;
    const mappings = [
      ["input[name='studentName'],input[data-lkpd-field='studentName']", identity.name],
      ["input[name='attendance'],input[data-lkpd-field='attendance']", identity.attendance],
      ["input[name='className'],input[data-lkpd-field='className']", identity.className]
    ];
    mappings.forEach(([selector, value]) => {
      $$(selector).forEach((input) => {
        input.value = value;
        input.readOnly = true;
        input.setAttribute("aria-readonly", "true");
        input.dataset.v60IdentityLocked = "true";
      });
    });
  }

  function observeIdentityFields() {
    repairIdentityFields();
    if (document.body.dataset.v60IdentityObserver === "yes") return;
    document.body.dataset.v60IdentityObserver = "yes";
    new MutationObserver(() => {
      if (fieldRepairQueued) return;
      fieldRepairQueued = true;
      requestAnimationFrame(() => {
        fieldRepairQueued = false;
        repairIdentityFields();
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  function restrictToLoggedGrade() {
    if (!studentSession?.grade) return;
    const buttons = $$('[data-grade-filter]');
    buttons.forEach((button) => {
      const value = button.dataset.gradeFilter;
      const allowed = value === studentSession.grade;
      button.hidden = !allowed;
      button.disabled = !allowed;
      button.setAttribute("aria-pressed", String(allowed));
      if (allowed) button.click();
    });
  }

  function buildClassLink(policy) {
    const url = new URL("index.html", document.baseURI);
    url.searchParams.set("cat", "1");
    url.searchParams.set("cat_class", policy.classCode);
    url.searchParams.set("cat_token", policy.sessionToken);
    return url.href;
  }

  function ensureTeacherControl() {
    if (!privileged()) return null;
    let panel = $("#v60-cat-control");
    if (panel) return panel;
    panel = document.createElement("section");
    panel.id = "v60-cat-control";
    const identity = teacherIdentity();
    panel.innerHTML = `
      <header>
        <div><span>${isEditor() ? "KENDALI EDITOR GLOBAL" : "KENDALI GURU PER KELAS"}</span><h2>CAT Aktif Per Kelas dan Timer Server</h2><p>Pilih kelas secara pasti. Setiap kelas mempunyai tautan, timer, kamera, dan status sendiri.</p></div>
        <b data-v60-control-status>Memuat status…</b>
      </header>
      <div class="v60-control-grid">
        <label><span>Kelas tujuan</span><select data-v60-class>${classOptions.map((item) => `<option value="${item}">${item}</option>`).join("")}</select></label>
        <label><span>Waktu pengerjaan</span><div><input data-v60-duration type="number" min="5" max="240" value="45"><em>menit</em></div></label>
        <div class="v60-control-actions">
          <button type="button" data-v60-activate>Aktifkan CAT</button>
          <button type="button" data-v60-copy disabled>Salin Tautan</button>
          <button type="button" data-v60-reset>Ulang Timer</button>
          <button type="button" data-v60-stop>Akhiri Kelas</button>
          ${isEditor() ? '<button type="button" data-v60-stop-all>Akhiri Semua CAT</button>' : ""}
        </div>
      </div>
      <p class="v60-control-note">Guru hanya mengendalikan kelas yang diaktifkannya. Editor mengendalikan seluruh kelas. Kelas aktif ditampilkan di bawah secara real-time.</p>
      <div class="v60-active-classes" data-v60-active-classes><p>Memuat daftar kelas aktif…</p></div>`;
    const old = $("#v59-cat-control,#v56-class-control");
    old?.remove();
    ($("main") || document.body).prepend(panel);

    const classSelect = $("[data-v60-class]", panel);
    const duration = $("[data-v60-duration]", panel);
    let currentLink = "";
    panel._selectPolicy = (policy) => {
      if (!policy?.classCode) return;
      const label = normalizeClass(policy.classCode).label;
      if (label) classSelect.value = label;
      if (policy.active && policy.sessionToken) {
        currentLink = buildClassLink(policy);
        $("[data-v60-copy]", panel).disabled = false;
      } else {
        currentLink = "";
        $("[data-v60-copy]", panel).disabled = true;
      }
    };

    const runControl = async (command) => {
      const classData = normalizeClass(classSelect.value);
      if (!classData.code) throw new Error("Pilih kelas tujuan.");
      const result = await jsonp("classControlV60", {
        readKey: READ_KEY,
        command,
        classCode: classData.code,
        durationMinutes: Math.max(5, Math.min(240, Number(duration.value || 45))),
        actorScope: teacherScope(),
        actorRole: isEditor() ? "editor" : "teacher",
        teacherName: clean(identity.name || identity.teacherName || (isEditor() ? "Editor PAIBP SMART" : "Guru")),
        teacherSchool: clean(identity.workUnit || identity.school || identity.teacherSchool || "SMP Negeri 1 Susukan")
      });
      if (!result?.ok) throw new Error(result?.error || "Perintah gagal.");
      if (result.policy?.active && result.policy?.sessionToken) {
        currentLink = buildClassLink(result.policy);
        $("[data-v60-copy]", panel).disabled = false;
      } else {
        currentLink = "";
        $("[data-v60-copy]", panel).disabled = true;
      }
      await refreshTeacherClasses();
      return result;
    };

    $("[data-v60-activate]", panel).addEventListener("click", async () => {
      try { await runControl("activate"); toast(`CAT ${classSelect.value} aktif.`, "success"); }
      catch (error) { toast(error.message, "error"); }
    });
    $("[data-v60-copy]", panel).addEventListener("click", async () => {
      if (!currentLink) { toast("Aktifkan CAT terlebih dahulu.", "warning"); return; }
      try { await navigator.clipboard.writeText(currentLink); toast("Tautan kelas berhasil disalin.", "success"); }
      catch { window.prompt("Salin tautan kelas:", currentLink); }
    });
    $("[data-v60-reset]", panel).addEventListener("click", async () => {
      try { await runControl("reset"); toast(`Timer ${classSelect.value} dimulai ulang.`, "success"); }
      catch (error) { toast(error.message, "error"); }
    });
    $("[data-v60-stop]", panel).addEventListener("click", async () => {
      try { await runControl("stop"); toast(`CAT ${classSelect.value} diakhiri.`, "success"); }
      catch (error) { toast(error.message, "error"); }
    });
    $("[data-v60-stop-all]", panel)?.addEventListener("click", async () => {
      try {
        const result = await jsonp("classControlV60", {
          readKey: READ_KEY,
          command: "stopAll",
          actorScope: teacherScope(),
          actorRole: "editor"
        });
        if (!result?.ok) throw new Error(result?.error || "Perintah gagal.");
        toast("Seluruh CAT telah diakhiri.", "success");
        await refreshTeacherClasses();
      } catch (error) { toast(error.message, "error"); }
    });
    return panel;
  }

  async function refreshTeacherClasses() {
    const panel = ensureTeacherControl();
    if (!panel || !READY) return;
    try {
      const result = await jsonp("classListV60", {
        readKey: READ_KEY,
        actorScope: teacherScope(),
        actorRole: isEditor() ? "editor" : "teacher"
      });
      if (!result?.ok) throw new Error(result?.error || "Status kelas gagal dimuat.");
      const list = $("[data-v60-active-classes]", panel);
      const classes = Array.isArray(result.classes) ? result.classes : [];
      list.innerHTML = classes.length ? classes.map((item) => {
        const remaining = Number(item.deadlineEpoch || 0) - Number(result.serverEpoch || Date.now());
        return `<article data-state="${item.active ? "active" : item.expired ? "expired" : "stopped"}"><div><strong>Kelas ${esc(item.classLabel || item.classCode)}</strong><small>${esc(item.teacherName || "Guru")} • ${item.active ? `sisa ${formatCountdown(remaining)}` : item.expired ? "waktu habis" : "nonaktif"}</small></div><div class="v60-class-card-actions"><b>${item.active ? "AKTIF" : item.expired ? "HABIS" : "SELESAI"}</b>${item.active ? `<button type="button" data-v60-policy-index="${classes.indexOf(item)}">Pilih</button>` : ""}</div></article>`;
      }).join("") : "<p>Belum ada kelas CAT aktif.</p>";
      $$("[data-v60-policy-index]", list).forEach((button) => button.addEventListener("click", () => {
        const item = classes[Number(button.dataset.v60PolicyIndex)];
        panel._selectPolicy?.(item);
        toast(`Kelas ${item?.classLabel || item?.classCode} dipilih.`, "success");
      }));
      const activeCount = classes.filter((item) => item.active).length;
      const status = $("[data-v60-control-status]", panel);
      status.textContent = `${activeCount} kelas aktif`;
      status.dataset.state = activeCount ? "active" : "idle";
    } catch (error) {
      $("[data-v60-control-status]", panel).textContent = "Server belum tersambung";
    }
  }

  function interceptStudentEntry(event) {
    const button = event.target.closest('[data-open-panel="student"]');
    if (!button || allowStudentButton || privileged()) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    showLogin();
  }

  function interceptCatNavigation(event) {
    if (!studentSession?.catActive || privileged()) return;
    const target = event.target.closest("a[href],[data-close-workspace],[data-open-panel]:not([data-open-panel='student']),.workspace-close,.topbar a,.links a");
    if (!target || target.closest("#v60-cat-bar,#v60-camera-gate,#v60-expired-screen")) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    toast("Anda tidak diperkenankan meninggalkan CAT sebelum guru mengakhiri kelas.", "warning");
  }

  function initHistoryEvents() {
    window.addEventListener("popstate", () => {
      if (!studentSession?.catActive || privileged()) return;
      try { history.pushState({ paibpCatV60: true }, "", location.href); } catch {}
      toast("Tombol kembali dinonaktifkan selama CAT berlangsung.", "warning");
    });
    document.addEventListener("visibilitychange", () => {
      if (!studentSession?.catActive || privileged()) return;
      if (document.visibilityState === "hidden") {
        send("activity", {
          role: "murid",
          userName: studentSession.identity.name,
          studentClass: studentSession.classLabel,
          action: "cat-page-hidden-v60",
          appVersion: VERSION,
          pageUrl: location.href
        });
      } else if (!document.fullscreenElement) {
        pauseForCamera("Murid sempat meninggalkan halaman. Aktifkan kamera untuk melanjutkan.");
      }
    });
  }

  function init() {
    clearLegacyCatState();
    ensureLoginModal();
    ensureCameraGate();
    document.addEventListener("click", interceptStudentEntry, true);
    document.addEventListener("click", interceptCatNavigation, true);
    initHistoryEvents();

    if (privileged()) {
      ensureTeacherControl();
      refreshTeacherClasses();
      teacherPollId = setInterval(refreshTeacherClasses, 10000);
    }

    window.addEventListener("pagehide", () => {
      if (studentSession?.identity) send("cameraStatusV60", {
        ...studentSession.identity,
        classCode: studentSession.classCode,
        status: "pagehide",
        pageUrl: location.href
      });
    });

    const api = Object.freeze({
      version: VERSION,
      normalizeClass,
      showLogin,
      refreshTeacherClasses,
      isTeacher,
      isEditor,
      startFromLegacy() {},
      enterStudentRoom() { if (!privileged()) showLogin(); }
    });
    window.PAIBP_CAT_V60 = api;
    window.PAIBP_CAT_V59 = api;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
