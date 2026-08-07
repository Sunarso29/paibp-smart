(() => {
  "use strict";

  const VERSION = "66";
  const CONFIG = window.PAIBP_CONFIG || {};
  const ENDPOINT = String(CONFIG.syncEndpoint || CONFIG.realtimeEndpoint || "").trim();
  const READ_KEY = String(CONFIG.syncReadKey || CONFIG.realtimeReadKey || "").trim();
  const READY = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(ENDPOINT);
  const FILE = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const PARAMS = new URLSearchParams(location.search);

  const GRADES = ["VII", "VIII", "IX"];
  const SECTIONS = ["A","B","C","D","E","F","G","H"];
  const CLASS_OPTIONS = GRADES.flatMap((grade) => SECTIONS.map((section) => `${grade} ${section}`));
  const KEYS = Object.freeze({
    identity: "paibp-smart-student-identity-v1",
    session: "paibp-smart-student-session-v66",
    teacher: "paibp-smart-teacher-identity-v1",
    teacherScope: "paibp-smart-teacher-scope-v66",
    authority: "paibp-smart-authority-v56",
    editor: "paibp-smart-editor-unlocked",
    policyCache: "paibp-smart-policy-cache-v66",
    draft: "paibp-smart-draft-v65"
  });

  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];
  const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
  const parse = (value, fallback) => { try { return JSON.parse(value); } catch { return fallback; } };
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[char]);
  const now = () => Date.now() + serverOffset;

  let session = parse(sessionStorage.getItem(KEYS.session), null);
  let policy = null;
  let cameraStream = null;
  let geo = null;
  let serverOffset = 0;
  let timerId = 0;
  let policyPollId = 0;
  let teacherPollId = 0;
  let proctorId = 0;
  let reminderShown = false;
  let allowStudentOpen = false;
  let historyArmed = false;
  let serverReachable = false;
  let currentTeacherClasses = [];

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
    section = section.replace(/[^A-Z]/g, "").slice(0,1);
    if (!grade || !SECTIONS.includes(section)) return {code:"",label:"",grade:"",section:""};
    return {code:`${grade}${section}`,label:`${grade} ${section}`,grade,section};
  }

  function linkContext() {
    const rawClass = PARAMS.get("kelas") || PARAMS.get("cat_class") || PARAMS.get("ps_class") || PARAMS.get("grade") || PARAMS.get("ps_grade") || "";
    const parsed = normalizeClass(rawClass);
    return {
      requested: PARAMS.get("cat") === "1" || PARAMS.get("ps_cat") === "1" || Boolean(parsed.code),
      classCode: parsed.code,
      classLabel: parsed.label,
      grade: parsed.grade
    };
  }

  function cleanLegacyState() {
    const legacyPattern = /paibp-smart-(?:cat-context|cat-state|cat-expired|class-context|student-session-v(?:5[0-9]|6[0-4])|focus-session)/i;
    [localStorage, sessionStorage].forEach((store) => {
      try {
        for (let i = store.length - 1; i >= 0; i -= 1) {
          const key = store.key(i) || "";
          if (legacyPattern.test(key)) store.removeItem(key);
        }
      } catch {}
    });
    document.documentElement.classList.remove("v59-cat-active","v59-cat-paused","v59-cat-expired","v60-cat-active","v60-cat-paused","v60-cat-expired","v61-cat-active","v61-cat-paused","v61-cat-expired","v63-cat-active","v63-cat-paused","v63-cat-expired");
    ["#v59-cat-bar","#v59-camera-gate","#v59-expired-screen","#v60-cat-bar","#v60-camera-gate","#v60-expired-screen","#v61-cat-bar","#v61-camera-gate","#v61-expired-screen","#v63-cat-bar","#v63-camera-gate","#v63-expired-screen","#v56-class-control","#v60-cat-control","#v61-cat-control","#v63-cat-control"].forEach((selector) => $(selector)?.remove());
    if (!linkContext().requested) {
      $$('article,aside,section,[class*="connected"],[class*="class-context"],[data-class-context]').forEach((node) => {
        if (node.children.length > 14) return;
        const text = clean(node.textContent);
        if (/^Kelas\s+terhubung\s*:/i.test(text)) node.closest("article,section,aside,div")?.remove();
      });
    }
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
    for (const ch of String(value || "")) { hash ^= ch.charCodeAt(0); hash = Math.imul(hash,16777619); }
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
    let node = $("#v65-toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "v65-toast";
      node.setAttribute("role","status");
      node.setAttribute("aria-live","polite");
      document.body.append(node);
    }
    node.dataset.tone = tone;
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), 3200);
  }

  let bridgeFrame = null;
  let bridgeReady = null;
  const bridgePending = new Map();

  function bridgeMessage(event) {
    if (!bridgeFrame || event.source !== bridgeFrame.contentWindow) return;
    const msg = event.data || {};
    if (msg.type === "PAIBP_V66_READY") {
      bridgeFrame.dataset.ready = "yes";
      bridgeFrame.dispatchEvent(new Event("paibp-ready"));
      return;
    }
    if (msg.type !== "PAIBP_V66_RES" || !msg.id) return;
    const pending = bridgePending.get(msg.id);
    if (!pending) return;
    bridgePending.delete(msg.id);
    clearTimeout(pending.timer);
    msg.error ? pending.reject(new Error(msg.error)) : pending.resolve(msg.result);
  }
  window.addEventListener("message", bridgeMessage);

  function ensureBridge() {
    if (!READY) return Promise.reject(new Error("Alamat server belum valid."));
    if (bridgeReady) return bridgeReady;
    bridgeReady = new Promise((resolve,reject) => {
      bridgeFrame = document.createElement("iframe");
      bridgeFrame.id = "paibp-server-bridge-v66";
      bridgeFrame.title = "PAIBP Server Bridge";
      bridgeFrame.setAttribute("aria-hidden","true");
      bridgeFrame.tabIndex = -1;
      bridgeFrame.style.cssText = "position:fixed!important;width:1px!important;height:1px!important;left:-100px!important;top:-100px!important;opacity:0!important;pointer-events:none!important;border:0!important";
      const url = new URL(ENDPOINT);
      url.searchParams.set("bridge","1");
      url.searchParams.set("v",VERSION);
      url.searchParams.set("_t",String(Date.now()));
      bridgeFrame.src = url.href;
      const timer = setTimeout(() => reject(new Error("Bridge server belum siap.")), 9000);
      const ready = () => { clearTimeout(timer); serverReachable = true; resolve(true); };
      bridgeFrame.addEventListener("paibp-ready", ready, {once:true});
      bridgeFrame.onerror = () => { clearTimeout(timer); reject(new Error("Bridge server gagal dimuat.")); };
      document.body.append(bridgeFrame);
    }).catch((error) => { bridgeReady = null; throw error; });
    return bridgeReady;
  }

  async function bridgeCall(action, params = {}, timeout = 8000) {
    await ensureBridge();
    return new Promise((resolve,reject) => {
      const id = `v66-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
      const timer = setTimeout(() => { bridgePending.delete(id); reject(new Error("Bridge server melewati batas waktu.")); }, timeout);
      bridgePending.set(id,{resolve,reject,timer});
      bridgeFrame.contentWindow.postMessage({type:"PAIBP_V66_REQ",id,action,params},"*");
    });
  }

  function jsonpOnce(action, params = {}, timeout = 6500) {
    return new Promise((resolve,reject) => {
      if (!READY) { reject(new Error("Alamat server belum valid.")); return; }
      const prefix = `paibpV66_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement("script");
      const url = new URL(ENDPOINT);
      let ended = false;
      const finish = (error,value) => {
        if (ended) return;
        ended = true;
        clearTimeout(wait);
        try { delete window[prefix]; } catch {}
        script.remove();
        error ? reject(error) : resolve(value);
      };
      window[prefix] = (value) => { serverReachable = true; finish(null,value); };
      Object.entries({action,prefix,_v:Date.now(),...params}).forEach(([k,v]) => url.searchParams.set(k,String(v ?? "")));
      script.src = url.href;
      script.async = true;
      script.onerror = () => finish(new Error("JSONP server gagal dimuat."));
      const wait = setTimeout(() => finish(new Error("JSONP server melewati batas waktu.")), timeout);
      document.head.append(script);
    });
  }

  async function serverCall(action, params = {}) {
    try { return await bridgeCall(action, params, 7000); }
    catch (bridgeError) {
      return jsonpOnce(action, params, 7000);
    }
  }

  function send(action,data) {
    if (!READY) return Promise.resolve(false);
    const body = JSON.stringify({app:"paibp-smart",version:VERSION,action,data,origin:location.origin});
    if (navigator.sendBeacon) {
      try {
        const sent = navigator.sendBeacon(ENDPOINT,new Blob([body],{type:"text/plain;charset=UTF-8"}));
        if (sent) return Promise.resolve(true);
      } catch {}
    }
    return fetch(ENDPOINT,{method:"POST",mode:"no-cors",cache:"no-store",keepalive:body.length<60000,headers:{"Content-Type":"text/plain;charset=UTF-8"},body}).then(()=>true).catch(()=>false);
  }

  function deviceLabel() {
    const memory = navigator.deviceMemory ? `${navigator.deviceMemory}GB RAM` : "RAM tidak diketahui";
    return `${navigator.userAgent} | ${memory} | CPU ${navigator.hardwareConcurrency || "?"}`;
  }

  async function getClassStatus(classCode) {
    const result = await serverCall("classStatusV66",{classCode});
    if (!result?.ok) throw new Error(result?.error || "Status kelas gagal dibaca.");
    serverOffset = Number(result.serverEpoch || Date.now()) - Date.now();
    setStore(sessionStorage, KEYS.policyCache, JSON.stringify(result));
    return result;
  }

  function ensureLogin() {
    let modal = $("#v65-student-login");
    if (modal) return modal;
    const link = linkContext();
    modal = document.createElement("div");
    modal.id = "v65-student-login";
    modal.className = "v65-overlay";
    modal.hidden = true;
    modal.innerHTML = `
      <section class="v65-dialog" role="dialog" aria-modal="true" aria-labelledby="v65-login-title">
        <button type="button" class="v65-close" data-v65-close aria-label="Tutup">×</button>
        <div class="v65-icon">🎓</div><span class="v65-kicker">LOGIN WAJIB RUANG MURID</span>
        <h2 id="v65-login-title">Identitas Murid</h2><p>Isi sekali. Pada akses berikutnya identitas akan digunakan otomatis.</p>
        <form id="v65-login-form" novalidate>
          <div class="v65-form-grid">
            <label><span>NISN <b>*</b></span><input name="nisn" inputmode="numeric" minlength="10" maxlength="10" pattern="[0-9]{10}" required></label>
            <label><span>Nama murid <b>*</b></span><input name="name" maxlength="80" required></label>
            <label><span>Kelas <b>*</b></span><select name="className" required>${CLASS_OPTIONS.map((item)=>`<option value="${item}" ${item===link.classLabel?"selected":""}>${item}</option>`).join("")}</select></label>
            <label><span>Nomor absen <b>*</b></span><input name="attendance" inputmode="numeric" maxlength="3" pattern="[0-9]{1,3}" required></label>
            <label class="v65-wide"><span>Sekolah <b>*</b></span><input name="school" maxlength="120" value="SMP Negeri 1 Susukan" required></label>
          </div>
          <div class="v65-permission-note">Kamera depan dan lokasi wajib aktif untuk membuka Ruang Murid.</div>
          <button class="v65-primary" type="submit">Masuk Ruang Murid</button>
          <p class="v65-error" data-v65-login-error aria-live="polite"></p>
        </form>
      </section>`;
    document.body.append(modal);
    $("[data-v65-close]",modal).onclick = () => { modal.hidden = true; };
    $("#v65-login-form",modal).addEventListener("submit",handleLogin);
    if (link.classLabel) {
      const select = $("select[name='className']",modal);
      select.value = link.classLabel;
      select.disabled = true;
    }
    return modal;
  }

  function fillLoginFromSaved() {
    const modal = ensureLogin();
    const form = $("form",modal);
    const saved = parse(getStore(localStorage,KEYS.identity),{}) || {};
    if (saved.nisn) form.elements.nisn.value = saved.nisn;
    if (saved.name || saved.studentName) form.elements.name.value = saved.name || saved.studentName;
    if (saved.attendance || saved.studentNumber) form.elements.attendance.value = saved.attendance || saved.studentNumber;
    if (saved.school || saved.studentSchool) form.elements.school.value = saved.school || saved.studentSchool;
    const link = linkContext();
    const cls = link.classLabel || saved.className || saved.class;
    if (!form.elements.className.disabled && CLASS_OPTIONS.includes(cls)) form.elements.className.value = cls;
  }

  function validSavedIdentity() {
    const id = parse(getStore(localStorage,KEYS.identity),null);
    if (!id) return null;
    const classData = normalizeClass(id.className || id.class || id.classCode);
    if (!/^\d{10}$/.test(String(id.nisn || ""))) return null;
    if (clean(id.name || id.studentName).length < 3 || !classData.code || !/^\d{1,3}$/.test(String(id.attendance || id.studentNumber || ""))) return null;
    return {
      nisn:String(id.nisn), name:clean(id.name || id.studentName), attendance:String(id.attendance || id.studentNumber),
      className:classData.label,classCode:classData.code,grade:classData.grade,school:clean(id.school || id.studentSchool || "SMP Negeri 1 Susukan")
    };
  }

  function validateForm(form) {
    const raw = Object.fromEntries(new FormData(form).entries());
    const link = linkContext();
    const classData = normalizeClass(raw.className || link.classLabel);
    const id = {
      nisn:clean(raw.nisn).replace(/\D/g,""),name:clean(raw.name),attendance:clean(raw.attendance),
      className:classData.label,classCode:classData.code,grade:classData.grade,school:clean(raw.school)
    };
    if (!/^\d{10}$/.test(id.nisn)) throw new Error("NISN harus tepat 10 digit.");
    if (id.name.length < 3) throw new Error("Nama murid wajib diisi lengkap.");
    if (!id.classCode) throw new Error("Kelas wajib dipilih.");
    if (link.classCode && id.classCode !== link.classCode) throw new Error(`Tautan ini khusus Kelas ${link.classLabel}.`);
    if (!/^\d{1,3}$/.test(id.attendance)) throw new Error("Nomor absen wajib berupa angka.");
    if (id.school.length < 4) throw new Error("Sekolah wajib diisi.");
    return id;
  }

  function ensurePermissionGate() {
    let gate = $("#v65-permission-gate");
    if (gate) return gate;
    gate = document.createElement("div");
    gate.id = "v65-permission-gate";
    gate.className = "v65-overlay";
    gate.hidden = true;
    gate.innerHTML = `
      <section class="v65-dialog v65-permission-dialog" role="dialog" aria-modal="true">
        <div class="v65-icon">📷</div><span class="v65-kicker">MENYAMBUNGKAN PERANGKAT</span>
        <h2>Kamera & Lokasi</h2><p data-v65-permission-text>Mengaktifkan kamera depan dan lokasi…</p>
        <div class="v65-permission-status"><span data-v65-camera-state>○ Kamera</span><span data-v65-location-state>○ Lokasi</span><span data-v65-server-state>○ Server</span></div>
        <video data-v65-gate-video autoplay muted playsinline></video>
        <button class="v65-primary" type="button" data-v65-retry hidden>Coba Lagi</button>
        <p class="v65-error" data-v65-permission-error></p>
      </section>`;
    document.body.append(gate);
    $("[data-v65-retry]",gate).onclick = () => connectCurrentIdentity(true);
    return gate;
  }

  async function requestLocation() {
    if (!navigator.geolocation) throw new Error("Perangkat tidak mendukung akses lokasi.");
    return new Promise((resolve,reject) => {
      navigator.geolocation.getCurrentPosition((position) => {
        geo = {
          latitude:Math.round(Number(position.coords.latitude || 0)*1000)/1000,
          longitude:Math.round(Number(position.coords.longitude || 0)*1000)/1000,
          accuracy:Math.round(Number(position.coords.accuracy || 0))
        };
        resolve(geo);
      },(error) => reject(new Error(error.code === 1 ? "Izin lokasi ditolak. Lokasi wajib diaktifkan." : "Lokasi belum dapat dibaca. Aktifkan GPS lalu coba lagi.")),{
        enableHighAccuracy:false,timeout:7000,maximumAge:300000
      });
    });
  }

  async function requestCamera() {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) throw new Error("Browser tidak mendukung akses kamera aman.");
    const live = cameraStream?.getVideoTracks?.().some((track)=>track.readyState === "live" && track.enabled);
    if (live) return cameraStream;
    stopCamera();
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video:{facingMode:"user",width:{ideal:320,max:480},height:{ideal:240,max:360},frameRate:{ideal:8,max:12}},audio:false
    });
    const track = cameraStream.getVideoTracks()[0];
    if (!track || track.readyState !== "live") throw new Error("Kamera belum aktif.");
    track.addEventListener("ended",()=>lockForPermission("Kamera berhenti. Aktifkan kembali untuk melanjutkan."),{once:true});
    return cameraStream;
  }

  function stopCamera() {
    cameraStream?.getTracks?.().forEach((track)=>track.stop());
    cameraStream = null;
    $("#v65-camera-preview")?.remove();
  }

  function showCameraPreview() {
    if (!cameraStream) return;
    let preview = $("#v65-camera-preview");
    if (!preview) {
      preview = document.createElement("aside");
      preview.id = "v65-camera-preview";
      preview.innerHTML = '<video autoplay muted playsinline></video><span>● Kamera CAT</span>';
      document.body.append(preview);
    }
    $("video",preview).srcObject = cameraStream;
  }

  async function ensurePermissions(gate) {
    const cameraState = $("[data-v65-camera-state]",gate);
    const locationState = $("[data-v65-location-state]",gate);
    cameraState.textContent = "… Kamera";
    locationState.textContent = "… Lokasi";
    const cameraPromise = requestCamera().then((stream)=>{cameraState.textContent="✓ Kamera aktif";$("[data-v65-gate-video]",gate).srcObject=stream;return stream;});
    const locationPromise = requestLocation().then((value)=>{locationState.textContent="✓ Lokasi aktif";return value;});
    return Promise.all([cameraPromise,locationPromise]);
  }

  async function handleLogin(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const errorNode = $("[data-v65-login-error]",form);
    errorNode.textContent = "";
    try {
      const identity = validateForm(form);
      setStore(localStorage,KEYS.identity,JSON.stringify({...identity,studentName:identity.name,studentSchool:identity.school,studentNumber:identity.attendance}));
      ensureLogin().hidden = true;
      await connectIdentity(identity,true);
    } catch (error) {
      errorNode.textContent = error.message || "Belum dapat masuk.";
    }
  }

  async function connectCurrentIdentity(force = false) {
    const identity = validSavedIdentity();
    if (!identity) { fillLoginFromSaved(); ensureLogin().hidden = false; return; }
    return connectIdentity(identity,force);
  }

  async function connectIdentity(identity,force = false) {
    const link = linkContext();
    if (link.classCode && identity.classCode !== link.classCode) {
      fillLoginFromSaved();
      const modal = ensureLogin();
      const select = $("select[name='className']",modal);
      select.value = link.classLabel;
      select.disabled = true;
      modal.hidden = false;
      $("[data-v65-login-error]",modal).textContent = `Tautan kelas ${link.classLabel}; konfirmasi identitas murid.`;
      return;
    }

    const gate = ensurePermissionGate();
    gate.hidden = false;
    $("[data-v65-retry]",gate).hidden = true;
    $("[data-v65-permission-error]",gate).textContent = "";
    $("[data-v65-permission-text]",gate).textContent = "Mengaktifkan kamera, lokasi, dan menyambungkan kelas…";
    $("[data-v65-server-state]",gate).textContent = "… Server";

    try {
      // Izin perangkat diminta segera; pemeriksaan server berjalan paralel agar tidak terasa berulang.
      const permissionPromise = ensurePermissions(gate);
      const statusPromise = getClassStatus(identity.classCode);
      const [[stream,locationData],status] = await Promise.all([permissionPromise,statusPromise]);
      $("[data-v65-server-state]",gate).textContent = "✓ Server tersambung";
      policy = status.policy || null;
      session = {
        identity,classCode:identity.classCode,classLabel:identity.className,grade:identity.grade,
        catActive:Boolean(status.active),sessionId:String(policy?.sessionId || `v65-${Date.now()}-${Math.random().toString(36).slice(2,8)}`),
        createdAt:new Date().toISOString(),location:locationData
      };
      setStore(sessionStorage,KEYS.session,JSON.stringify(session));
      send("studentLoginV65",{...identity,...locationData,sessionId:session.sessionId,catActive:session.catActive,device:deviceLabel(),pageUrl:window.location.href,origin:window.location.origin});
      send("cameraStatusV65",{...identity,...locationData,sessionId:session.sessionId,status:"granted",device:deviceLabel(),pageUrl:window.location.href});
      gate.hidden = true;
      openStudentPanel();
      showCameraPreview();
      if (status.expired) expireCat("Waktu kelas telah berakhir.");
      else if (status.active) enterCat(status.policy);
      else enterNormal();
    } catch (error) {
      $("[data-v65-permission-error]",gate).textContent = `${error.message || "Perangkat belum tersambung."} Kamera dan lokasi wajib aktif.`;
      $("[data-v65-retry]",gate).hidden = false;
      $("[data-v65-server-state]",gate).textContent = serverReachable ? "✓ Server tersambung" : "○ Server";
      if (!cameraStream) $("[data-v65-camera-state]",gate).textContent = "○ Kamera";
      if (!geo) $("[data-v65-location-state]",gate).textContent = "○ Lokasi";
    }
  }

  function openStudentPanel() {
    allowStudentOpen = true;
    const button = $("[data-open-panel='student']");
    if (button) button.click();
    else $("#panel-student,[data-panel='student']")?.removeAttribute("hidden");
    allowStudentOpen = false;
    requestAnimationFrame(()=>{
      restrictGrade();repairIdentityFields();
      $("#panel-student,[data-panel='student']")?.scrollIntoView({behavior:"auto",block:"start"});
    });
  }

  function enterNormal() {
    document.documentElement.classList.add("v65-student-session");
    document.documentElement.classList.remove("v65-cat-active","v65-cat-expired","v65-cat-paused");
    startProctor(false);
  }

  function ensureCatBar() {
    let bar = $("#v65-cat-bar");
    if (bar) return bar;
    bar = document.createElement("header");
    bar.id = "v65-cat-bar";
    bar.innerHTML = `<div><span>MODE CAT • <b data-v65-cat-class></b></span><strong data-v65-cat-teacher>Pengawasan kelas aktif</strong><small>Kamera & lokasi aktif • keluar dikendalikan guru/editor</small></div><div class="v65-cat-clock"><small>Sisa waktu</small><b data-v65-countdown>--:--</b></div>`;
    document.body.append(bar);
    return bar;
  }

  function formatTime(ms) {
    const seconds = Math.max(0,Math.ceil(ms/1000));
    const hours = Math.floor(seconds/3600), minutes=Math.floor((seconds%3600)/60), rest=seconds%60;
    return hours ? `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:${String(rest).padStart(2,"0")}` : `${String(minutes).padStart(2,"0")}:${String(rest).padStart(2,"0")}`;
  }

  function enterCat(nextPolicy) {
    policy = nextPolicy || policy || {};
    session.catActive = true;
    session.sessionId = String(policy.sessionId || session.sessionId);
    setStore(sessionStorage,KEYS.session,JSON.stringify(session));
    reminderShown = false;
    document.documentElement.classList.add("v65-cat-active");
    document.documentElement.classList.remove("v65-cat-expired","v65-cat-paused","v65-student-session");
    const bar = ensureCatBar();
    $("[data-v65-cat-class]",bar).textContent = session.classLabel;
    $("[data-v65-cat-teacher]",bar).textContent = policy.teacherName ? `Dikendalikan ${policy.teacherName}` : "Pengawasan kelas aktif";
    armHistory();
    restrictGrade();
    repairIdentityFields();
    startTimer();
    startPolicyPolling();
    startProctor(true);
    proctorEvent("cat-start-v65",`Mulai CAT ${session.classLabel}`);
  }

  function startTimer() {
    clearInterval(timerId);
    const tick = () => {
      if (!session?.catActive || !policy) return;
      const deadline = Number(policy.deadlineEpoch || 0);
      const remaining = deadline - now();
      const node = $("[data-v65-countdown]");
      if (node) node.textContent = formatTime(remaining);
      if (!reminderShown && remaining > 0 && remaining <= 5*60*1000) {
        reminderShown = true;
        showFiveMinuteReminder();
        autoSaveWork("reminder-5-menit");
      }
      if (deadline > 0 && remaining <= 0) expireCat("Waktu mengerjakan telah habis.");
    };
    tick();
    timerId = setInterval(tick,1000);
  }

  function showFiveMinuteReminder() {
    let reminder = $("#v65-five-minute");
    if (!reminder) {
      reminder = document.createElement("div");
      reminder.id = "v65-five-minute";
      reminder.innerHTML = '<strong>⏰ Sisa waktu 5 menit</strong><span>Simpan jawaban dan pastikan data siap dikirim ke guru.</span><button type="button">Simpan Sekarang</button>';
      $("button",reminder).onclick = () => autoSaveWork("manual-5-menit");
      document.body.append(reminder);
    }
    reminder.classList.add("show");
    setTimeout(()=>reminder.classList.remove("show"),12000);
    toast("Sisa waktu 5 menit. Data sedang disimpan.","warning");
    proctorEvent("cat-five-minute-warning-v65","Peringatan 5 menit");
  }

  function collectStudentWork() {
    const panel = $("#panel-student,[data-panel='student']");
    if (!panel) return {};
    const payload = {};
    $$("input,textarea,select",panel).forEach((field,index)=>{
      if (field.type === "password" || field.type === "file") return;
      const key = field.name || field.id || field.dataset.lkpdField || `field-${index+1}`;
      if (field.type === "checkbox" || field.type === "radio") payload[key] = field.checked;
      else payload[key] = String(field.value ?? "").slice(0,3000);
    });
    return payload;
  }

  function autoSaveWork(reason) {
    if (!session?.identity) return;
    const payload = collectStudentWork();
    const draft = {savedAt:new Date().toISOString(),reason,payload,classCode:session.classCode,identity:session.identity};
    setStore(localStorage,KEYS.draft,JSON.stringify(draft));
    send("submission",{
      id:`auto-v65-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,sessionId:session.sessionId,
      studentName:session.identity.name,school:session.identity.school,studentClass:session.identity.className,studentNumber:session.identity.attendance,
      teacherName:policy?.teacherName || "",teacherSchool:policy?.teacherSchool || "",teacherScope:policy?.actorScope || "",
      chapterId:session.classCode,chapterTitle:`Snapshot CAT ${session.classLabel}`,exerciseScore:"",status:`autosave:${reason}`,
      payload,device:deviceLabel(),pageUrl:location.href,appVersion:VERSION
    });
  }

  function ensureExpired() {
    let screen = $("#v65-expired-screen");
    if (screen) return screen;
    screen = document.createElement("div");
    screen.id = "v65-expired-screen";
    screen.className = "v65-overlay";
    screen.innerHTML = `<section class="v65-dialog"><div class="v65-icon">⏱️</div><span class="v65-kicker">SESI DIKUNCI</span><h2>Waktu CAT Selesai</h2><p data-v65-expired-message></p><div class="v65-waiting"><i></i><span>Menunggu guru atau editor membuka kelas kembali…</span></div></section>`;
    document.body.append(screen);
    return screen;
  }

  function expireCat(message) {
    if (!session?.catActive) return;
    clearInterval(timerId);
    autoSaveWork("waktu-habis");
    stopCamera();
    document.documentElement.classList.add("v65-cat-expired");
    document.documentElement.classList.remove("v65-cat-active","v65-cat-paused");
    $("#v65-cat-bar")?.remove();
    const screen = ensureExpired();
    $("[data-v65-expired-message]",screen).textContent = `${message} Data terakhir telah disimpan dan dikirim. Ruang Murid hanya dapat dibuka kembali oleh guru atau editor.`;
    screen.hidden = false;
    proctorEvent("cat-expired-v65",message);
    startPolicyPolling();
  }

  function releaseByTeacher() {
    if (!session) return;
    clearInterval(timerId);clearInterval(policyPollId);clearInterval(proctorId);
    autoSaveWork("kelas-diakhiri-guru");
    stopCamera();
    removeStore(sessionStorage,KEYS.session);
    document.documentElement.classList.remove("v65-cat-active","v65-cat-expired","v65-cat-paused","v65-student-session");
    $("#v65-cat-bar")?.remove();$("#v65-expired-screen")?.remove();$("#v65-five-minute")?.remove();
    toast("Kelas telah diakhiri oleh guru.","success");
    setTimeout(()=>location.replace(new URL("index.html?v=65",document.baseURI).href),700);
  }

  async function resumeAfterReset(nextPolicy) {
    policy = nextPolicy;
    $("#v65-expired-screen")?.setAttribute("hidden","");
    document.documentElement.classList.remove("v65-cat-expired");
    const gate = ensurePermissionGate();
    gate.hidden = false;
    $("[data-v65-permission-text]",gate).textContent = "Guru membuka sesi baru. Mengaktifkan kembali kamera dan lokasi…";
    try {
      await ensurePermissions(gate);
      gate.hidden = true;
      showCameraPreview();
      enterCat(policy);
    } catch (error) {
      $("[data-v65-permission-error]",gate).textContent = error.message || "Aktifkan kamera dan lokasi untuk melanjutkan.";
      $("[data-v65-retry]",gate).hidden = false;
    }
  }

  function startPolicyPolling() {
    clearInterval(policyPollId);
    const poll = async () => {
      if (!session?.classCode || document.visibilityState === "hidden") return;
      try {
        const status = await getClassStatus(session.classCode);
        if (status.active) {
          const incoming = status.policy || {};
          const changed = policy?.sessionId && incoming.sessionId && policy.sessionId !== incoming.sessionId;
          policy = incoming;
          if (document.documentElement.classList.contains("v65-cat-expired") && changed) await resumeAfterReset(incoming);
          else if (session.catActive && !document.documentElement.classList.contains("v65-cat-expired")) startTimer();
        } else if (status.expired) {
          policy = status.policy || policy;
          expireCat("Waktu kelas telah berakhir.");
        } else if (session.catActive || document.documentElement.classList.contains("v65-cat-expired")) {
          releaseByTeacher();
        }
      } catch {}
    };
    policyPollId = setInterval(poll,8000);
  }

  function startProctor(isCat) {
    clearInterval(proctorId);
    proctorId = setInterval(async()=>{
      if (!session || document.visibilityState === "hidden") return;
      const cameraLive = cameraStream?.getVideoTracks?.().some((track)=>track.readyState === "live" && track.enabled);
      if (!cameraLive) { lockForPermission("Kamera tidak aktif. Aktifkan kembali untuk melanjutkan."); return; }
      if (navigator.permissions?.query) {
        try {
          const permission = await navigator.permissions.query({name:"geolocation"});
          if (permission.state === "denied") lockForPermission("Akses lokasi dimatikan. Aktifkan kembali lokasi untuk melanjutkan.");
        } catch {}
      }
    },isCat ? 5000 : 12000);
  }

  function lockForPermission(message) {
    if (!session || privileged()) return;
    document.documentElement.classList.add("v65-cat-paused");
    const gate = ensurePermissionGate();
    gate.hidden = false;
    $("[data-v65-permission-text]",gate).textContent = message;
    $("[data-v65-permission-error]",gate).textContent = "Kamera dan lokasi wajib aktif.";
    $("[data-v65-retry]",gate).hidden = false;
    proctorEvent("proctor-permission-interrupted-v65",message);
  }

  function proctorEvent(eventName,detail="") {
    if (!session?.identity) return;
    send("proctorEventV65",{...session.identity,...(geo||{}),sessionId:session.sessionId,classCode:session.classCode,eventName,detail,device:deviceLabel(),pageUrl:location.href});
  }

  function armHistory() {
    if (historyArmed) return;
    historyArmed = true;
    try { history.replaceState({v65:true},"",location.href);history.pushState({v65:true},"",location.href); } catch {}
  }

  function repairIdentityFields() {
    if (!session?.identity) return;
    const id = session.identity;
    const mappings = [
      ["input[name='studentName'],input[data-lkpd-field='studentName']",id.name],
      ["input[name='attendance'],input[data-lkpd-field='attendance']",id.attendance],
      ["input[name='className'],input[data-lkpd-field='className']",id.className]
    ];
    mappings.forEach(([selector,value])=> $$(selector).forEach((input)=>{input.value=value;input.readOnly=true;input.dataset.v65Locked="yes";}));
  }

  function restrictGrade() {
    if (!session?.grade) return;
    $$('[data-grade-filter]').forEach((button)=>{
      const allowed = String(button.dataset.gradeFilter || "").toUpperCase() === session.grade;
      button.hidden = !allowed;button.disabled = !allowed;
      if (allowed && button.getAttribute("aria-pressed") !== "true") button.click();
    });
  }

  function removeLegacyTeacherPanels() {
    ["#v56-class-control","#v59-cat-control","#v60-cat-control","#v61-cat-control","#v63-cat-control"].forEach((s)=>$(s)?.remove());
    $$('section,article,div').forEach((node)=>{
      if (node.id === "v65-cat-control" || node.closest?.("#v65-cat-control")) return;
      const text = clean(node.textContent);
      if (text.length > 1200) return;
      if (/Kelola kelas dan buat tautan murid/i.test(text) && /Buat tautan kelas/i.test(text)) node.remove();
    });
  }

  function buildPermanentClassLink(classCode) {
    const url = new URL("index.html",document.baseURI);
    url.searchParams.set("cat","1");
    url.searchParams.set("kelas",classCode);
    return url.href;
  }

  function formatClock(epoch) {
    if (!Number(epoch)) return "—";
    return new Intl.DateTimeFormat("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(new Date(Number(epoch)));
  }

  function ensureTeacherControl() {
    if (!privileged()) return null;
    removeLegacyTeacherPanels();
    let panel = $("#v65-cat-control");
    if (panel) return panel;
    panel = document.createElement("section");
    panel.id = "v65-cat-control";
    const id = teacherIdentity();
    panel.innerHTML = `
      <header><div><span>${isEditor()?"KENDALI EDITOR":"KENDALI GURU"}</span><h2>CAT Kelas • Kamera • Lokasi • Timer Server</h2><p>Satu panel untuk membuat tautan, mengaktifkan, mengulang timer, dan mematikan kelas.</p></div><b data-v65-control-status>Menyambungkan server…</b></header>
      <div class="v65-control-grid">
        <label><span>Kelas</span><select data-v65-class>${CLASS_OPTIONS.map((item)=>`<option value="${item}">${item}</option>`).join("")}</select></label>
        <label><span>Durasi</span><div class="v65-duration"><input data-v65-duration type="number" min="5" max="240" value="45"><em>menit</em></div></label>
        <div class="v65-timebox"><span>Mulai</span><strong data-v65-start>—</strong></div>
        <div class="v65-timebox"><span>Berakhir</span><strong data-v65-end>—</strong></div>
      </div>
      <div class="v65-control-actions">
        <button type="button" data-v65-link>Buat / Salin Tautan</button>
        <button type="button" data-v65-activate>Aktifkan CAT</button>
        <button type="button" data-v65-reset>Ulang Timer</button>
        <button type="button" data-v65-stop>Matikan Kelas</button>
        ${isEditor()?'<button type="button" data-v65-stopall>Matikan Semua CAT</button>':""}
      </div>
      <div class="v65-class-list" data-v65-class-list><p>Memuat kelas…</p></div>`;
    ($("main") || document.body).prepend(panel);

    const classSelect = $("[data-v65-class]",panel);
    const duration = $("[data-v65-duration]",panel);
    const status = $("[data-v65-control-status]",panel);
    const updateSelected = () => {
      const code = normalizeClass(classSelect.value).code;
      const item = currentTeacherClasses.find((entry)=>entry.classCode === code);
      $("[data-v65-start]",panel).textContent = formatClock(item?.startedEpoch);
      $("[data-v65-end]",panel).textContent = formatClock(item?.deadlineEpoch);
    };
    classSelect.onchange = updateSelected;

    async function command(commandName) {
      const cls = normalizeClass(classSelect.value);
      status.textContent = "Mengirim perintah…";status.dataset.state="pending";
      const result = await serverCall("classControlV66",{
        readKey:READ_KEY,command:commandName,classCode:cls.code,durationMinutes:Math.max(5,Math.min(240,Number(duration.value||45))),
        actorScope:teacherScope(),actorRole:isEditor()?"editor":"teacher",
        teacherName:clean(id.name || id.teacherName || (isEditor()?"Editor PAIBP SMART":"Guru")),teacherSchool:clean(id.workUnit || id.school || id.teacherSchool || "SMP Negeri 1 Susukan")
      });
      if (!result?.ok) throw new Error(result?.error || "Perintah gagal.");
      await refreshTeacherClasses();
      return result;
    }

    $("[data-v65-link]",panel).onclick = async()=>{
      const link = buildPermanentClassLink(normalizeClass(classSelect.value).code);
      try { await navigator.clipboard.writeText(link);toast(`Tautan ${classSelect.value} disalin.`,"success"); }
      catch { window.prompt("Salin tautan kelas:",link); }
    };
    $("[data-v65-activate]",panel).onclick = async()=>{try{await command("activate");toast(`CAT ${classSelect.value} aktif.`,"success");}catch(e){toast(e.message,"error");}};
    $("[data-v65-reset]",panel).onclick = async()=>{try{await command("reset");toast(`Timer ${classSelect.value} dimulai ulang.`,"success");}catch(e){toast(e.message,"error");}};
    $("[data-v65-stop]",panel).onclick = async()=>{try{await command("stop");toast(`${classSelect.value} dimatikan.`,"success");}catch(e){toast(e.message,"error");}};
    $("[data-v65-stopall]",panel)?.addEventListener("click",async()=>{try{await command("stopall");toast("Semua CAT dimatikan.","success");}catch(e){toast(e.message,"error");}});
    panel._updateSelected = updateSelected;
    return panel;
  }

  async function refreshTeacherClasses() {
    const panel = ensureTeacherControl();
    if (!panel || !READY || document.visibilityState === "hidden") return;
    const status = $("[data-v65-control-status]",panel);
    try {
      const result = await serverCall("classListV66",{readKey:READ_KEY,actorScope:teacherScope(),actorRole:isEditor()?"editor":"teacher"});
      if (!result?.ok) throw new Error(result?.error || "Status kelas gagal dimuat.");
      serverReachable = true;
      currentTeacherClasses = Array.isArray(result.classes) ? result.classes : [];
      const active = currentTeacherClasses.filter((item)=>item.active);
      status.textContent = active.length ? `${active.length} kelas aktif` : "Server tersambung • CAT nonaktif";
      status.dataset.state = "online";
      const list = $("[data-v65-class-list]",panel);
      list.innerHTML = active.length ? active.map((item)=>`<article><div><strong>${esc(item.classLabel)}</strong><small>${esc(item.teacherName || "Guru")} • ${formatClock(item.startedEpoch)}–${formatClock(item.deadlineEpoch)}</small></div><b>AKTIF</b></article>`).join("") : '<p>Belum ada CAT aktif.</p>';
      panel._updateSelected?.();
    } catch (error) {
      status.textContent = "Server belum tersambung";status.dataset.state="error";
      $("[data-v65-class-list]",panel).innerHTML = `<p>${esc(error.message || "Server belum dapat dijangkau.")}</p>`;
    }
  }

  function interceptStudent(event) {
    const button = event.target.closest('[data-open-panel="student"]');
    if (!button || allowStudentOpen || privileged()) return;
    event.preventDefault();event.stopImmediatePropagation();
    const id = validSavedIdentity();
    if (id) connectIdentity(id,true);
    else { fillLoginFromSaved();ensureLogin().hidden=false; }
  }

  function interceptNavigation(event) {
    if (!session?.catActive || privileged()) return;
    const target = event.target.closest("a[href],[data-close-workspace],[data-open-panel]:not([data-open-panel='student']),.workspace-close,.topbar a,.links a");
    if (!target || target.closest("#v65-cat-bar,#v65-permission-gate,#v65-expired-screen,#v65-five-minute")) return;
    event.preventDefault();event.stopImmediatePropagation();
    proctorEvent("cat-navigation-blocked-v65",clean(target.textContent).slice(0,120));
    toast("CAT masih aktif. Keluar hanya setelah guru mengakhiri kelas.","warning");
  }

  function initEvents() {
    document.addEventListener("click",interceptStudent,true);
    document.addEventListener("click",interceptNavigation,true);
    window.addEventListener("popstate",()=>{
      if (!session?.catActive || privileged()) return;
      try { history.pushState({v65:true},"",location.href); } catch {}
      proctorEvent("cat-history-blocked-v65","Tombol kembali");
      toast("Tombol kembali dibatasi selama CAT.","warning");
    });
    document.addEventListener("visibilitychange",()=>{
      if (!session || privileged()) return;
      if (document.visibilityState === "hidden") proctorEvent("page-hidden-v65","Murid meninggalkan halaman");
      else {
        const cameraLive = cameraStream?.getVideoTracks?.().some((track)=>track.readyState === "live" && track.enabled);
        if (!cameraLive) lockForPermission("Kamera tidak aktif setelah kembali ke halaman.");
      }
    });
    window.addEventListener("pagehide",()=>{
      if (session?.identity) proctorEvent("pagehide-v65","Halaman ditutup atau berpindah");
    });
  }

  function tuneLowSpecDevice() {
    const low = (navigator.deviceMemory && navigator.deviceMemory <= 4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    if (low) document.documentElement.classList.add("v65-lite-device");
    $$('img:not([loading])').forEach((img)=>{img.loading="lazy";img.decoding="async";});
  }

  function init() {
    cleanLegacyState();
    tuneLowSpecDevice();
    ensureLogin();ensurePermissionGate();
    initEvents();
    if (privileged()) {
      ensureTeacherControl();
      refreshTeacherClasses();
      teacherPollId = setInterval(refreshTeacherClasses,15000);
      setTimeout(removeLegacyTeacherPanels,1200);
      setTimeout(removeLegacyTeacherPanels,4200);
    } else if (linkContext().requested) {
      const id = validSavedIdentity();
      if (id && id.classCode === linkContext().classCode) setTimeout(()=>connectIdentity(id,true),80);
      else { fillLoginFromSaved();ensureLogin().hidden=false; }
    }

    const api = Object.freeze({version:VERSION,normalizeClass,showLogin:()=>{fillLoginFromSaved();ensureLogin().hidden=false;},refreshTeacherClasses,isTeacher,isEditor,startFromLegacy(){},enterStudentRoom(){if(!privileged())interceptStudent({target:$('[data-open-panel="student"]'),preventDefault(){},stopImmediatePropagation(){}});}});
    window.PAIBP_CAT_V65 = api;
    window.PAIBP_CAT_V59 = api;
  }

  // Kompatibilitas harus tersedia sebelum mesin V56 lama dimuat.
  window.PAIBP_CAT_V59 = {version:VERSION,startFromLegacy(){},enterStudentRoom(){if(!privileged()){const id=validSavedIdentity();id?connectIdentity(id,true):(fillLoginFromSaved(),ensureLogin().hidden=false);}}};

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
