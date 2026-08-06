(() => {
  "use strict";

  const VERSION = "61";
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
    session: "paibp-smart-student-session-v61",
    teacherScope: "paibp-smart-teacher-scope-v61"
  });

  const classOptions = ["VII", "VIII", "IX"].flatMap((grade) =>
    ["A","B","C","D","E","F","G","H","I","J"].map((section) => `${grade} ${section}`)
  );

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

  function getStore(storage, key) { try { return storage.getItem(key); } catch { return null; } }
  function setStore(storage, key, value) { try { storage.setItem(key, value); } catch {} }
  function removeStore(storage, key) { try { storage.removeItem(key); } catch {} }

  function clearOldCat() {
    [
      "paibp-smart-cat-context-v59", "paibp-smart-cat-state-v59", "paibp-smart-cat-expired-v59",
      "paibp-smart-student-session-v60", "paibp-smart-class-context-v56", "paibp-smart-cat-session-v56"
    ].forEach((key) => { removeStore(localStorage, key); removeStore(sessionStorage, key); });
    document.documentElement.classList.remove(
      "v59-cat-active", "v59-cat-paused", "v59-cat-expired",
      "v60-cat-active", "v60-cat-paused", "v60-cat-expired", "v60-student-camera-session"
    );
    ["#v59-camera-gate","#v59-expired-screen","#v59-cat-bar","#v59-camera-preview",
      "#v60-student-login","#v60-camera-gate","#v60-expired-screen","#v60-cat-bar","#v60-camera-preview",
      "#v59-cat-control","#v60-cat-control","#v56-class-control"].forEach((selector) => $(selector)?.remove());
  }

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
    section = section.replace(/[^A-Z0-9]/g, "").slice(0, 3);
    if (!grade || !section) return {code:"", label:"", grade:"", section:""};
    return {code:`${grade}${section}`, label:`${grade} ${section}`, grade, section};
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

  function linkContext() {
    const parsed = normalizeClass(PARAMS.get("cat_class") || PARAMS.get("ps_class") || PARAMS.get("kelas") || "");
    return {
      requested: PARAMS.get("cat") === "1" || PARAMS.get("ps_cat") === "1",
      classCode: parsed.code,
      classLabel: parsed.label,
      grade: parsed.grade,
      token: clean(PARAMS.get("cat_token") || PARAMS.get("ps_token") || "")
    };
  }

  function toast(message, tone = "info") {
    let node = $("#v61-toast");
    if (!node) { node = document.createElement("div"); node.id = "v61-toast"; node.setAttribute("role", "status"); document.body.append(node); }
    node.dataset.tone = tone; node.textContent = message; node.classList.add("show");
    clearTimeout(toast.timer); toast.timer = setTimeout(() => node.classList.remove("show"), 3500);
  }

  function jsonp(action, params = {}, timeout = 12000) {
    return new Promise((resolve, reject) => {
      if (!READY) { reject(new Error("Google Apps Script belum tersambung.")); return; }
      const callback = `paibpV61_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement("script");
      const url = new URL(ENDPOINT);
      let done = false;
      const finish = (error, value) => {
        if (done) return; done = true; clearTimeout(wait); try { delete window[callback]; } catch {} script.remove();
        error ? reject(error) : resolve(value);
      };
      window[callback] = (value) => finish(null, value);
      Object.entries({action, callback, _v:Date.now(), ...params}).forEach(([k,v]) => url.searchParams.set(k, String(v ?? "")));
      script.src = url.href; script.async = true; script.onerror = () => finish(new Error("Server tidak dapat dijangkau."));
      const wait = setTimeout(() => finish(new Error("Server melewati batas waktu.")), timeout);
      document.head.append(script);
    });
  }

  function send(action, data) {
    if (!READY) return Promise.resolve(false);
    const body = JSON.stringify({app:"paibp-smart", version:VERSION, action, data, origin:location.origin});
    return fetch(ENDPOINT, {method:"POST", mode:"no-cors", cache:"no-store", keepalive:body.length < 60000,
      headers:{"Content-Type":"text/plain;charset=UTF-8"}, body}).then(() => true).catch(() => false);
  }

  function ensureLogin() {
    let modal = $("#v61-student-login");
    if (modal) return modal;
    const link = linkContext();
    modal = document.createElement("div");
    modal.id = "v61-student-login";
    modal.className = "v61-overlay";
    modal.hidden = true;
    modal.innerHTML = `
      <section class="v61-dialog" role="dialog" aria-modal="true" aria-labelledby="v61-login-title">
        <button type="button" class="v61-close" data-v61-close aria-label="Tutup">×</button>
        <div class="v61-icon">🎓</div><span class="v61-kicker">LOGIN WAJIB RUANG MURID</span>
        <h2 id="v61-login-title">Identitas Murid</h2>
        <p>Kolom bertanda <b class="v61-required">*</b> wajib diisi. Tanpa identitas lengkap, Ruang Murid tidak dapat dibuka.</p>
        <form id="v61-login-form" novalidate>
          <div class="v61-form-grid">
            <label><span>NISN <b class="v61-required">*</b></span><input name="nisn" inputmode="numeric" minlength="10" maxlength="10" pattern="[0-9]{10}" placeholder="10 digit NISN" required></label>
            <label><span>Nama murid <b class="v61-required">*</b></span><input name="name" maxlength="80" placeholder="Nama lengkap" required></label>
            <label><span>Kelas <b class="v61-required">*</b></span><select name="className" required>${classOptions.map((item) => `<option value="${item}" ${item === link.classLabel ? "selected" : ""}>${item}</option>`).join("")}</select></label>
            <label><span>Nomor absen <b class="v61-required">*</b></span><input name="attendance" inputmode="numeric" maxlength="3" pattern="[0-9]{1,3}" placeholder="Nomor absen" required></label>
            <label class="v61-wide"><span>Sekolah <b class="v61-required">*</b></span><input name="school" maxlength="120" value="SMP Negeri 1 Susukan" placeholder="Nama sekolah" required></label>
          </div>
          <p class="v61-note">${link.requested ? `Tautan resmi Kelas <strong>${esc(link.classLabel || "tidak valid")}</strong>.` : "Setelah login, kamera depan wajib diaktifkan."}</p>
          <button class="v61-primary" type="submit">Lanjutkan</button>
          <p class="v61-error" data-v61-login-error aria-live="polite"></p>
        </form>
      </section>`;
    document.body.append(modal);
    $("[data-v61-close]", modal).onclick = () => { if (!link.requested) modal.hidden = true; };
    $("#v61-login-form", modal).addEventListener("submit", handleLogin);
    if (link.classLabel) { const select = $("select[name='className']", modal); select.value = link.classLabel; select.disabled = true; }
    return modal;
  }

  function showLogin() {
    const modal = ensureLogin();
    const previous = parse(getStore(localStorage, KEYS.student), {}) || {};
    const form = $("form", modal);
    if (previous.nisn) form.elements.nisn.value = previous.nisn;
    if (previous.name || previous.studentName) form.elements.name.value = previous.name || previous.studentName;
    if (previous.attendance) form.elements.attendance.value = previous.attendance;
    if (previous.school || previous.studentSchool) form.elements.school.value = previous.school || previous.studentSchool;
    if (!form.elements.className.disabled && classOptions.includes(previous.className)) form.elements.className.value = previous.className;
    modal.hidden = false;
  }

  function validateLogin(form) {
    const data = Object.fromEntries(new FormData(form).entries());
    const nisn = clean(data.nisn).replace(/\D/g, "");
    const cls = normalizeClass(data.className || linkContext().classLabel);
    if (!/^\d{10}$/.test(nisn)) throw new Error("NISN harus tepat 10 digit angka.");
    if (clean(data.name).length < 3) throw new Error("Nama murid wajib diisi lengkap.");
    if (!cls.code) throw new Error("Kelas wajib dipilih.");
    if (!/^\d{1,3}$/.test(clean(data.attendance))) throw new Error("Nomor absen wajib berupa angka.");
    if (clean(data.school).length < 4) throw new Error("Nama sekolah wajib diisi.");
    return {nisn, name:clean(data.name), attendance:clean(data.attendance), className:cls.label, classCode:cls.code, grade:cls.grade, school:clean(data.school)};
  }

  async function getClassStatus(classCode, token = "") {
    const result = await jsonp("classStatusV61", {classCode, token});
    if (!result?.ok) throw new Error(result?.error || "Status kelas tidak dapat dibaca.");
    serverOffset = Number(result.serverEpoch || Date.now()) - Date.now();
    return result;
  }

  async function handleLogin(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const errorNode = $("[data-v61-login-error]", form);
    errorNode.textContent = "Memeriksa kelas…";
    try {
      const identity = validateLogin(form);
      const link = linkContext();
      if (link.classCode && identity.classCode !== link.classCode) throw new Error(`Tautan ini khusus Kelas ${link.classLabel}.`);
      const status = await getClassStatus(identity.classCode, link.token);
      if (link.requested && !link.classCode) throw new Error("Tautan CAT tidak memuat kelas yang valid.");
      if (link.requested && !status.active && !status.expired) throw new Error("CAT kelas ini belum diaktifkan guru.");
      if (status.active && !status.authorized) throw new Error("Kelas sedang menjalankan CAT. Gunakan tautan resmi dari guru.");
      session = {identity, classCode:identity.classCode, classLabel:identity.className, grade:identity.grade,
        token:link.token || "", catActive:Boolean(status.active && status.authorized), createdAt:new Date().toISOString()};
      policy = status.policy || null;
      setStore(sessionStorage, KEYS.session, JSON.stringify(session));
      setStore(localStorage, KEYS.student, JSON.stringify({...identity, studentName:identity.name, studentSchool:identity.school}));
      send("studentLoginV61", {...identity, catRequested:link.requested, catAuthorized:status.authorized, pageUrl:location.href, device:navigator.userAgent});
      ensureLogin().hidden = true;
      if (status.expired && status.authorized) { session.catActive = true; setStore(sessionStorage, KEYS.session, JSON.stringify(session)); expireCat("Waktu CAT telah habis."); startPolicyPolling(); return; }
      showCameraGate();
    } catch (error) { errorNode.textContent = error.message || "Login gagal."; }
  }

  function ensureCameraGate() {
    let gate = $("#v61-camera-gate");
    if (gate) return gate;
    gate = document.createElement("div"); gate.id = "v61-camera-gate"; gate.className = "v61-overlay"; gate.hidden = true;
    gate.innerHTML = `<section class="v61-dialog v61-camera-dialog" role="dialog" aria-modal="true">
      <div class="v61-icon">📷</div><span class="v61-kicker">KAMERA WAJIB MURID</span><h2>Aktifkan Kamera Depan</h2>
      <p>Kamera wajib aktif sebelum Ruang Murid terbuka. Guru dan editor tetap bebas melakukan pratinjau.</p>
      <div class="v61-camera-stage"><video autoplay muted playsinline></video><span data-v61-camera-state>Kamera belum aktif</span></div>
      <button class="v61-primary" type="button" data-v61-camera-start>Izinkan Kamera dan Masuk</button>
      <p class="v61-error" data-v61-camera-error aria-live="polite"></p>
      <small>Video hanya tampil pada perangkat murid dan tidak disimpan oleh halaman.</small>
    </section>`;
    document.body.append(gate);
    $("[data-v61-camera-start]", gate).onclick = startCameraAndEnter;
    return gate;
  }
  function showCameraGate(message = "") { const gate = ensureCameraGate(); gate.hidden = false; $("[data-v61-camera-error]", gate).textContent = message; }

  function stopCamera() {
    cameraStream?.getTracks?.().forEach((track) => track.stop()); cameraStream = null; $("#v61-camera-preview")?.remove();
    const video = $("#v61-camera-gate video"); if (video) video.srcObject = null;
  }

  async function requestCamera() {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) throw new Error("Kamera membutuhkan HTTPS dan browser yang mendukung izin kamera.");
    stopCamera();
    cameraStream = await navigator.mediaDevices.getUserMedia({video:{facingMode:"user", width:{ideal:640}, height:{ideal:480}}, audio:false});
    const track = cameraStream.getVideoTracks()[0];
    if (!track || track.readyState !== "live") throw new Error("Kamera belum aktif.");
    track.addEventListener("ended", () => pauseForCamera("Kamera berhenti. Aktifkan kembali untuk melanjutkan."), {once:true});
    return cameraStream;
  }

  function showPreview() {
    let preview = $("#v61-camera-preview");
    if (!preview) { preview = document.createElement("aside"); preview.id = "v61-camera-preview"; preview.innerHTML = `<video autoplay muted playsinline></video><span>● Kamera aktif</span>`; document.body.append(preview); }
    $("video", preview).srcObject = cameraStream;
  }

  async function startCameraAndEnter() {
    const gate = ensureCameraGate(); const button = $("[data-v61-camera-start]", gate); const error = $("[data-v61-camera-error]", gate);
    button.disabled = true; error.textContent = "Meminta izin kamera…";
    try {
      const stream = await requestCamera(); $("video", gate).srcObject = stream; $("[data-v61-camera-state]", gate).textContent = "Kamera aktif";
      showPreview(); send("cameraStatusV61", {...session.identity, classCode:session.classCode, status:"granted", pageUrl:location.href});
      gate.hidden = true; openStudentPanel();
      if (session.catActive) enterCatMode(policy); else startNormalSession();
    } catch (e) {
      error.textContent = `${e.message || "Izin kamera ditolak."} Ruang Murid tetap terkunci.`;
      send("cameraStatusV61", {...(session?.identity || {}), classCode:session?.classCode || "", status:"denied", pageUrl:location.href});
    } finally { button.disabled = false; }
  }

  function openStudentPanel() {
    allowStudentOpen = true; const entry = $("[data-open-panel='student']");
    if (entry) entry.click(); else { const panel = $("#panel-student,[data-panel='student']"); if (panel) panel.hidden = false; }
    allowStudentOpen = false;
    setTimeout(() => { restrictGrade(); repairIdentity(); $("#panel-student,[data-panel='student']")?.scrollIntoView({block:"start", behavior:"auto"}); }, 50);
  }

  function startNormalSession() {
    document.documentElement.classList.add("v61-student-session");
    document.documentElement.classList.remove("v61-cat-active","v61-cat-expired","v61-cat-paused");
    observeIdentity();
  }

  function ensureCatBar() {
    let bar = $("#v61-cat-bar"); if (bar) return bar;
    bar = document.createElement("header"); bar.id = "v61-cat-bar";
    bar.innerHTML = `<div><span>MODE CAT • KELAS <b data-v61-cat-class></b></span><strong data-v61-cat-teacher>Pengawasan guru aktif</strong><small>Scroll satu jari tetap aktif</small></div><div class="v61-clock"><small>Sisa waktu</small><b data-v61-countdown>--:--</b></div>`;
    document.body.append(bar); return bar;
  }

  function enterCatMode(nextPolicy) {
    policy = nextPolicy || policy; session.catActive = true; setStore(sessionStorage, KEYS.session, JSON.stringify(session));
    document.documentElement.classList.add("v61-cat-active"); document.documentElement.classList.remove("v61-cat-expired","v61-cat-paused");
    const bar = ensureCatBar(); $("[data-v61-cat-class]", bar).textContent = session.classLabel;
    $("[data-v61-cat-teacher]", bar).textContent = policy?.teacherName ? `Dikendalikan ${policy.teacherName}` : "Pengawasan guru aktif";
    armHistory(); restrictGrade(); observeIdentity(); startTimer(); startPolicyPolling();
    send("activity", {role:"murid", userName:session.identity.name, nisn:session.identity.nisn, studentClass:session.classLabel,
      studentNumber:session.identity.attendance, school:session.identity.school, action:"cat-start-v61", section:session.classLabel, appVersion:VERSION, pageUrl:location.href});
  }

  function serverNow() { return Date.now() + serverOffset; }
  function formatTime(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000)); const h = Math.floor(total/3600), m = Math.floor((total%3600)/60), s = total%60;
    return h ? `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}` : `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  }
  function startTimer() {
    clearInterval(timerId);
    const tick = () => { const deadline = Number(policy?.deadlineEpoch || policy?.expiresAt || 0); const remaining = deadline - serverNow();
      const node = $("[data-v61-countdown]"); if (node) node.textContent = formatTime(remaining); if (deadline > 0 && remaining <= 0) expireCat("Waktu pengerjaan telah habis."); };
    tick(); timerId = setInterval(tick, 1000);
  }

  function startPolicyPolling() {
    clearInterval(policyPollId);
    policyPollId = setInterval(async () => {
      try {
        const status = await getClassStatus(session.classCode, session.token);
        if (status.expired && status.authorized) { policy = status.policy; expireCat("Waktu CAT telah habis."); }
        else if (status.active && status.authorized) {
          const oldId = policy?.sessionId || ""; policy = status.policy;
          if (oldId && policy?.sessionId && oldId !== policy.sessionId) { session.token = policy.sessionToken || session.token; setStore(sessionStorage, KEYS.session, JSON.stringify(session)); resumeAfterReset(); }
          else if (document.documentElement.classList.contains("v61-cat-expired")) resumeAfterReset();
        } else if (!status.active) releaseByTeacher();
      } catch {}
    }, 4000);
  }

  function ensureExpired() {
    let screen = $("#v61-expired-screen"); if (screen) return screen;
    screen = document.createElement("div"); screen.id = "v61-expired-screen"; screen.className = "v61-overlay";
    screen.innerHTML = `<section class="v61-dialog" role="alertdialog" aria-modal="true"><div class="v61-icon">⏱</div><span class="v61-kicker">AKSES DIKUNCI</span><h2>Waktu CAT Selesai</h2><p data-v61-expired-message></p><div class="v61-waiting"><i></i><span>Menunggu guru atau editor…</span></div></section>`;
    document.body.append(screen); return screen;
  }
  function expireCat(message) {
    if (!session?.catActive) return; clearInterval(timerId); document.documentElement.classList.add("v61-cat-expired"); document.documentElement.classList.remove("v61-cat-paused");
    const screen = ensureExpired(); $("[data-v61-expired-message]", screen).textContent = message; screen.hidden = false; armHistory();
  }
  function resumeAfterReset() {
    $("#v61-expired-screen")?.setAttribute("hidden", ""); document.documentElement.classList.remove("v61-cat-expired"); document.documentElement.classList.add("v61-cat-active"); startTimer(); toast("Timer dibuka kembali oleh guru.", "success");
  }
  function releaseByTeacher() {
    if (!session?.catActive) return; clearInterval(timerId); clearInterval(policyPollId); session.catActive = false; removeStore(sessionStorage, KEYS.session); stopCamera();
    document.documentElement.classList.remove("v61-cat-active","v61-cat-expired","v61-cat-paused","v61-student-session"); $("#v61-cat-bar")?.remove(); $("#v61-expired-screen")?.remove();
    toast("CAT telah diakhiri guru.", "success"); setTimeout(() => location.replace(new URL("index.html", document.baseURI).href), 800);
  }

  function pauseForCamera(message) {
    if (!session || privileged()) return; document.documentElement.classList.add("v61-cat-paused"); showCameraGate(message); $("[data-v61-camera-state]").textContent = "Kamera tidak aktif";
  }

  function repairIdentity() {
    if (!session?.identity) return;
    const id = session.identity;
    const map = [
      ["input[name='studentName'],input[data-lkpd-field='studentName']", id.name],
      ["input[name='attendance'],input[data-lkpd-field='attendance']", id.attendance],
      ["input[name='className'],input[data-lkpd-field='className'],input[data-student-class]", id.className],
      ["input[name='nisn'],input[data-lkpd-field='nisn']", id.nisn],
      ["input[name='school'],input[data-lkpd-field='school']", id.school]
    ];
    map.forEach(([selector, value]) => $$(selector).forEach((input) => { input.value = value; input.readOnly = true; input.dataset.v61Locked = "yes"; }));
  }
  function observeIdentity() {
    repairIdentity(); if (fieldObserver) return; const panel = $("#panel-student,[data-panel='student']") || document.body;
    let queued = false; fieldObserver = new MutationObserver(() => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; repairIdentity(); }); });
    fieldObserver.observe(panel, {childList:true, subtree:true});
  }
  function restrictGrade() {
    if (!session?.grade) return;
    $$('[data-grade-filter]').forEach((button) => { const allowed = String(button.dataset.gradeFilter || "").toUpperCase() === session.grade; button.hidden = !allowed; button.disabled = !allowed; if (allowed && button.getAttribute("aria-pressed") !== "true") setTimeout(() => button.click(), 0); });
  }

  function armHistory() {
    if (historyArmed) return; historyArmed = true; try { history.replaceState({paibpCatV61:true}, "", location.href); history.pushState({paibpCatV61:true}, "", location.href); } catch {}
  }

  function buildClassLink(item) {
    const url = new URL("index.html", document.baseURI); url.searchParams.set("cat", "1"); url.searchParams.set("cat_class", item.classCode); url.searchParams.set("cat_token", item.sessionToken); return url.href;
  }

  function ensureTeacherControl() {
    if (!privileged()) return null;
    let panel = $("#v61-cat-control"); if (panel) return panel;
    panel = document.createElement("section"); panel.id = "v61-cat-control";
    panel.innerHTML = `<header><div><span>${isEditor() ? "KENDALI EDITOR" : "KENDALI GURU"}</span><h2>CAT Kelas Aktif</h2><p>Aktifkan hanya kelas yang dipilih. Murid lain tetap masuk Ruang Murid normal.</p></div><b data-v61-control-status>Memuat…</b></header>
      <div class="v61-control-grid"><label><span>Kelas</span><select data-v61-class>${classOptions.map((item) => `<option value="${item}">${item}</option>`).join("")}</select></label>
      <label><span>Durasi</span><div><input data-v61-duration type="number" min="5" max="240" value="45"><em>menit</em></div></label>
      <div class="v61-control-actions"><button data-v61-activate>Aktifkan CAT</button><button data-v61-copy disabled>Salin Tautan</button><button data-v61-reset>Ulang Timer</button><button data-v61-stop>Matikan Kelas</button>${isEditor() ? '<button data-v61-stop-all>Matikan Semua CAT</button>' : ""}</div></div>
      <div class="v61-active-classes" data-v61-active-classes><p>Memuat kelas aktif…</p></div>`;
    $("#v59-cat-control,#v60-cat-control,#v56-class-control")?.remove(); ($("main") || document.body).prepend(panel);
    const select = $("[data-v61-class]", panel), duration = $("[data-v61-duration]", panel); let currentLink = "";
    const run = async (command) => {
      const cls = normalizeClass(select.value); const id = teacherIdentity();
      const result = await jsonp("classControlV61", {readKey:READ_KEY, command, classCode:cls.code, durationMinutes:Math.max(5,Math.min(240,Number(duration.value||45))),
        actorScope:teacherScope(), actorRole:isEditor()?"editor":"teacher", teacherName:clean(id.name||id.teacherName||(isEditor()?"Editor PAIBP SMART":"Guru")), teacherSchool:clean(id.workUnit||id.school||id.teacherSchool||"SMP Negeri 1 Susukan")});
      if (!result?.ok) throw new Error(result?.error || "Perintah gagal.");
      currentLink = result.policy?.active ? buildClassLink(result.policy) : ""; $("[data-v61-copy]", panel).disabled = !currentLink; await refreshTeacherClasses(); return result;
    };
    $("[data-v61-activate]", panel).onclick = async () => { try { await run("activate"); toast(`CAT ${select.value} aktif.`, "success"); } catch(e) { toast(e.message,"error"); } };
    $("[data-v61-reset]", panel).onclick = async () => { try { await run("reset"); toast(`Timer ${select.value} diulang.`, "success"); } catch(e) { toast(e.message,"error"); } };
    $("[data-v61-stop]", panel).onclick = async () => { try { await run("stop"); toast(`CAT ${select.value} dimatikan.`, "success"); } catch(e) { toast(e.message,"error"); } };
    $("[data-v61-copy]", panel).onclick = async () => { if (!currentLink) return; try { await navigator.clipboard.writeText(currentLink); toast("Tautan kelas disalin.", "success"); } catch { window.prompt("Salin tautan kelas:", currentLink); } };
    $("[data-v61-stop-all]", panel)?.addEventListener("click", async () => { try { await run("stopAll"); toast("Semua CAT dimatikan.", "success"); } catch(e) { toast(e.message,"error"); } });
    panel._select = (item) => { const label = normalizeClass(item.classCode).label; if (label) select.value = label; duration.value = item.durationMinutes || 45; currentLink = item.active ? buildClassLink(item) : ""; $("[data-v61-copy]", panel).disabled = !currentLink; };
    return panel;
  }

  async function refreshTeacherClasses() {
    const panel = ensureTeacherControl(); if (!panel || !READY) return;
    try {
      const result = await jsonp("classListV61", {readKey:READ_KEY, actorScope:teacherScope(), actorRole:isEditor()?"editor":"teacher"});
      if (!result?.ok) throw new Error(result?.error || "Gagal memuat kelas.");
      const classes = Array.isArray(result.classes) ? result.classes : []; const list = $("[data-v61-active-classes]", panel);
      list.innerHTML = classes.length ? classes.map((item,index) => { const remaining = Number(item.deadlineEpoch||0)-Number(result.serverEpoch||Date.now());
        return `<article data-state="${item.active?"active":item.expired?"expired":"stopped"}"><div><strong>Kelas ${esc(item.classLabel||item.classCode)}</strong><small>${esc(item.teacherName||"Guru")} • ${item.active?`sisa ${formatTime(remaining)}`:item.expired?"waktu habis":"nonaktif"}</small></div><div><b>${item.active?"AKTIF":item.expired?"HABIS":"NONAKTIF"}</b><button data-v61-pick="${index}">Pilih</button></div></article>`;
      }).join("") : "<p>Belum ada kelas CAT aktif.</p>";
      $$('[data-v61-pick]', list).forEach((button) => button.onclick = () => panel._select(classes[Number(button.dataset.v61Pick)]));
      const count = classes.filter((item) => item.active).length; const status = $("[data-v61-control-status]", panel); status.textContent = `${count} kelas aktif`; status.dataset.state = count ? "active" : "idle";
    } catch { $("[data-v61-control-status]", panel).textContent = "Server belum tersambung"; }
  }

  function interceptStudent(event) {
    const button = event.target.closest('[data-open-panel="student"]'); if (!button || allowStudentOpen || privileged()) return;
    event.preventDefault(); event.stopImmediatePropagation(); showLogin();
  }
  function interceptNavigation(event) {
    if (!session?.catActive || privileged()) return;
    const target = event.target.closest("a[href],[data-close-workspace],[data-open-panel]:not([data-open-panel='student']),.workspace-close,.topbar a,.links a");
    if (!target || target.closest("#v61-cat-bar,#v61-camera-gate,#v61-expired-screen")) return;
    event.preventDefault(); event.stopImmediatePropagation(); toast("Tidak dapat keluar sebelum guru mengakhiri CAT.", "warning");
  }

  function initEvents() {
    document.addEventListener("click", interceptStudent, true); document.addEventListener("click", interceptNavigation, true);
    window.addEventListener("popstate", () => { if (!session?.catActive || privileged()) return; try { history.pushState({paibpCatV61:true},"",location.href); } catch {} toast("Tombol kembali dikunci selama CAT.","warning"); });
    document.addEventListener("visibilitychange", () => {
      if (!session?.catActive || privileged()) return;
      if (document.visibilityState === "hidden") send("activity", {role:"murid", userName:session.identity.name, nisn:session.identity.nisn, studentClass:session.classLabel, action:"cat-page-hidden-v61", appVersion:VERSION, pageUrl:location.href});
      else {
        const live = cameraStream?.getVideoTracks?.().some((track) => track.readyState === "live" && track.enabled);
        if (!live) pauseForCamera("Kamera tidak aktif. Aktifkan kembali untuk melanjutkan.");
      }
    });
    window.addEventListener("beforeunload", (event) => { if (!session?.catActive || privileged()) return; event.preventDefault(); event.returnValue = ""; });
  }

  function init() {
    clearOldCat(); ensureLogin(); ensureCameraGate(); initEvents();
    if (privileged()) { ensureTeacherControl(); refreshTeacherClasses(); teacherPollId = setInterval(refreshTeacherClasses, 8000); }
    else if (linkContext().requested) setTimeout(showLogin, 150);
    const api = Object.freeze({version:VERSION, normalizeClass, showLogin, refreshTeacherClasses, isTeacher, isEditor, startFromLegacy(){}, enterStudentRoom(){ if (!privileged()) showLogin(); }});
    window.PAIBP_CAT_V61 = api; window.PAIBP_CAT_V60 = api; window.PAIBP_CAT_V59 = api;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true}); else init();
})();
