(() => {
  "use strict";

  const VERSION = "67";
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
    session: "paibp-smart-student-session-v67",
    teacher: "paibp-smart-teacher-identity-v1",
    teacherScope: "paibp-smart-teacher-scope-v67",
    authority: "paibp-smart-authority-v56",
    editor: "paibp-smart-editor-unlocked",
    policyCache: "paibp-smart-policy-cache-v67",
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
    const legacyPattern = /paibp-smart-(?:cat-context|cat-state|cat-expired|class-context|student-session-v(?:5[0-9]|6[0-6])|focus-session)/i;
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

  // V67: satu transport saja. Google Apps Script ContentService resmi mendukung JSONP.
  // Tidak lagi memakai iframe bridge agar tidak tergantung third-party iframe/cookie browser.
  function jsonp(action, params = {}, timeout = 10000) {
    return new Promise((resolve,reject) => {
      if (!READY) { reject(new Error("Alamat server belum valid.")); return; }
      const callback = `paibpV67_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
      const script = document.createElement("script");
      const url = new URL(ENDPOINT);
      let finished = false;
      const finish = (error,value) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        try { delete window[callback]; } catch {}
        script.remove();
        error ? reject(error) : resolve(value);
      };
      window[callback] = (value) => { serverReachable = true; finish(null,value); };
      Object.entries({action, callback, _v:Date.now(), ...params}).forEach(([key,value]) => url.searchParams.set(key,String(value ?? "")));
      script.src = url.href;
      script.async = true;
      script.referrerPolicy = "no-referrer";
      script.onerror = () => finish(new Error("Server Apps Script gagal dimuat."));
      const timer = setTimeout(() => finish(new Error("Server Apps Script melewati batas waktu.")), timeout);
      document.head.append(script);
    });
  }

  function legacyAction(action) {
    return ({
      classStatusV66:"classStatusV63",
      classListV66:"classListV63",
      classControlV66:"classControlV63"
    })[action] || action;
  }

  async function serverCall(action, params = {}) {
    let result = await jsonp(action, params, 10000);
    if (result?.ok === false && /tidak dikenal|unknown|aksi GET/i.test(String(result.error || ""))) {
      const fallback = legacyAction(action);
      if (fallback !== action) result = await jsonp(fallback, params, 10000);
    }
    return result;
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
            <label><span>NISN <b>*</b></span><input name="nisn" inputmode="numeric" minlength="10" maxlength="10" pattern="[0-9]{10}" placeholder="10 digit NISN" required></label>
            <label><span>Nama murid <b>*</b></span><input name="name" maxlength="80" placeholder="Nama lengkap" required></label>
            <label><span>Kelas <b>*</b></span><select name="className" required>${CLASS_OPTIONS.map((item)=>`<option value="${item}" ${item===link.classLabel?"selected":""}>${item}</option>`).join("")}</select></label>
            <label><span>Nomor absen <b>*</b></span><input name="attendance" inputmode="numeric" maxlength="3" pattern="[0-9]{1,3}" placeholder="Nomor absen" required></label>
            <label class="v65-wide"><span>Sekolah <b>*</b></span><input name="school" maxlength="120" value="SMP Negeri 1 Susukan" placeholder="Nama sekolah" required></label>
          </div>
          <p class="v65-note">Kamera dan lokasi wajib aktif selama akses Ruang Murid.</p>
          <button class="v65-primary" type="submit">Lanjutkan</button><p class="v65-error" data-v65-login-error></p>
        </form>
      </section>`;
    document.body.append(modal);
    $("[data-v65-close]",modal).onclick=()=>{modal.hidden=true;};
    $("#v65-login-form",modal).addEventListener("submit",handleLogin);
    if(link.classLabel){const select=$("select[name='className']",modal);select.value=link.classLabel;select.disabled=true;}
    return modal;
  }

  function showLogin() {
    const modal=ensureLogin();
    const form=$("form",modal), old=parse(getStore(localStorage,KEYS.identity),{})||{};
    if(old.nisn)form.elements.nisn.value=old.nisn;
    if(old.name||old.studentName)form.elements.name.value=old.name||old.studentName;
    if(old.attendance||old.studentNumber)form.elements.attendance.value=old.attendance||old.studentNumber;
    if(old.school||old.studentSchool)form.elements.school.value=old.school||old.studentSchool;
    if(!form.elements.className.disabled&&CLASS_OPTIONS.includes(old.className))form.elements.className.value=old.className;
    modal.hidden=false;
  }

  function validateIdentity(form) {
    const d=Object.fromEntries(new FormData(form).entries()), nisn=clean(d.nisn).replace(/\D/g,""), cls=normalizeClass(d.className||linkContext().classLabel);
    if(!/^\d{10}$/.test(nisn))throw new Error("NISN wajib tepat 10 digit.");
    if(clean(d.name).length<3)throw new Error("Nama murid wajib diisi.");
    if(!cls.code)throw new Error("Kelas wajib dipilih.");
    if(!/^\d{1,3}$/.test(clean(d.attendance)))throw new Error("Nomor absen wajib berupa angka.");
    if(clean(d.school).length<4)throw new Error("Sekolah wajib diisi.");
    return {nisn,name:clean(d.name),className:cls.label,classCode:cls.code,grade:cls.grade,attendance:clean(d.attendance),school:clean(d.school)};
  }

  async function requestLocation() {
    if(!navigator.geolocation)throw new Error("Perangkat tidak mendukung akses lokasi.");
    return new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(
      (position)=>resolve({latitude:position.coords.latitude,longitude:position.coords.longitude,accuracy:position.coords.accuracy}),
      ()=>reject(new Error("Izin lokasi wajib diaktifkan untuk masuk Ruang Murid.")),
      {enableHighAccuracy:false,timeout:8000,maximumAge:300000}
    ));
  }

  function stopCamera() { cameraStream?.getTracks?.().forEach((track)=>track.stop()); cameraStream=null; $("#v65-camera-preview")?.remove(); }
  async function requestCamera() {
    if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia)throw new Error("Kamera tidak tersedia pada browser ini.");
    stopCamera();
    cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:480,max:640},height:{ideal:360,max:480},frameRate:{ideal:10,max:15}},audio:false});
    cameraStream.getVideoTracks()[0]?.addEventListener("ended",()=>pauseForPermission("Kamera berhenti. Aktifkan kembali untuk melanjutkan."),{once:true});
    return cameraStream;
  }

  function ensurePermissionGate() {
    let gate=$("#v65-permission-gate"); if(gate)return gate;
    gate=document.createElement("div");gate.id="v65-permission-gate";gate.className="v65-overlay";gate.hidden=true;
    gate.innerHTML=`<section class="v65-dialog v65-permission-dialog" role="dialog" aria-modal="true"><div class="v65-icon">📷</div><span class="v65-kicker">VERIFIKASI AKSES MURID</span><h2>Aktifkan Kamera dan Lokasi</h2><p>Kedua izin wajib aktif untuk membuka Ruang Murid.</p><div class="v65-permission-status"><span data-camera>○ Kamera</span><span data-location>○ Lokasi</span></div><button type="button" class="v65-primary" data-allow>Izinkan dan Masuk</button><p class="v65-error" data-error></p></section>`;
    document.body.append(gate);$("[data-allow]",gate).onclick=startPermissions;return gate;
  }

  async function handleLogin(event) {
    event.preventDefault();const form=event.currentTarget,error=$("[data-v65-login-error]",form);error.textContent="";
    try {
      const identity=validateIdentity(form), link=linkContext();
      if(link.classCode&&identity.classCode!==link.classCode)throw new Error(`Tautan ini khusus Kelas ${link.classLabel}.`);
      let status;
      try { status=await getClassStatus(identity.classCode); }
      catch { status={ok:true,active:false,expired:false,policy:null,serverEpoch:Date.now(),offline:true}; }
      session={identity,classCode:identity.classCode,classLabel:identity.className,grade:identity.grade,catActive:Boolean(status.active),createdAt:new Date().toISOString()};
      policy=status.policy||null;
      setStore(localStorage,KEYS.identity,JSON.stringify({...identity,studentName:identity.name,studentSchool:identity.school,studentNumber:identity.attendance}));
      setStore(sessionStorage,KEYS.session,JSON.stringify(session));
      modalHide();
      const gate=ensurePermissionGate();gate.hidden=false;
    } catch(e){error.textContent=e.message||"Login belum berhasil.";}
  }
  function modalHide(){const m=$("#v65-student-login");if(m)m.hidden=true;}

  async function startPermissions() {
    const gate=ensurePermissionGate(),button=$("[data-allow]",gate),error=$("[data-error]",gate);button.disabled=true;error.textContent="Meminta izin kamera dan lokasi…";
    try {
      const [stream,locationData]=await Promise.all([requestCamera(),requestLocation()]);geo=locationData;
      $("[data-camera]",gate).textContent="✓ Kamera aktif";$("[data-location]",gate).textContent="✓ Lokasi aktif";
      showCameraPreview();
      send("studentLoginV65",{...session.identity,...geo,device:deviceLabel(),pageUrl:location.href});
      send("cameraStatusV65",{...session.identity,...geo,status:"active",pageUrl:location.href});
      gate.hidden=true;openStudentPanel();
      let status;
      try {status=await getClassStatus(session.classCode);} catch {status={active:false};}
      if(status.active){policy=status.policy;session.catActive=true;setStore(sessionStorage,KEYS.session,JSON.stringify(session));enterCat();}
      else startNormalSession();
    } catch(e){error.textContent=e.message||"Kamera dan lokasi wajib diizinkan.";} finally {button.disabled=false;}
  }

  function showCameraPreview(){let p=$("#v65-camera-preview");if(!p){p=document.createElement("aside");p.id="v65-camera-preview";p.innerHTML='<video autoplay muted playsinline></video><span>● Kamera aktif</span>';document.body.append(p);}$("video",p).srcObject=cameraStream;}
  function startNormalSession(){document.documentElement.classList.add("v65-student-session");lockIdentityFields();}

  function openStudentPanel(){allowStudentOpen=true;const b=$("[data-open-panel='student']");if(b)b.click();else $("#panel-student,[data-panel='student']")?.removeAttribute("hidden");allowStudentOpen=false;setTimeout(()=>{restrictGrade();lockIdentityFields();},50);}

  function enterCat(){document.documentElement.classList.add("v65-cat-active");document.documentElement.classList.remove("v65-cat-expired","v65-cat-paused");ensureCatBar();armHistory();restrictGrade();lockIdentityFields();startTimer();startPolicyPolling();startProctor();}
  function ensureCatBar(){let bar=$("#v65-cat-bar");if(bar)return bar;bar=document.createElement("header");bar.id="v65-cat-bar";bar.innerHTML='<div><span>MODE CAT • <b data-class></b></span><strong>Kamera dan pengawasan aktif</strong><small data-warning>Jawaban disimpan otomatis.</small></div><div class="v65-clock"><small>Sisa waktu</small><b data-time>--:--</b></div>';document.body.append(bar);$("[data-class]",bar).textContent=session.classLabel;return bar;}
  function armHistory(){if(historyArmed)return;historyArmed=true;try{history.replaceState({catV65:true},"",location.href);history.pushState({catV65:true},"",location.href);}catch{}}
  function fmt(ms){const sec=Math.max(0,Math.ceil(ms/1000)),h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;return h?`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`:`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;}
  function startTimer(){clearInterval(timerId);reminderShown=false;const tick=()=>{const deadline=Number(policy?.deadlineEpoch||policy?.expiresAt||0),remain=deadline-now(),node=$("[data-time]");if(node)node.textContent=fmt(remain);if(deadline&&remain<=300000&&remain>0&&!reminderShown){reminderShown=true;remindFiveMinutes();}if(deadline&&remain<=0)expireCat();};tick();timerId=setInterval(tick,1000);}

  function collectDraft(){const fields={};$$('input,textarea,select').forEach((el,index)=>{if(el.type==="password"||el.type==="file")return;const key=el.name||el.id||el.dataset.lkpdField||`field-${index}`;fields[key]=el.type==="checkbox"||el.type==="radio"?Boolean(el.checked):el.value;});const draft={timestamp:new Date().toISOString(),identity:session?.identity||{},classCode:session?.classCode||"",fields,pageUrl:location.href};setStore(localStorage,KEYS.draft,JSON.stringify(draft));return draft;}
  function saveAndSend(reason){const draft=collectDraft();send("submission",{id:`autosave-${Date.now()}`,sessionId:`v65-${session?.identity?.nisn||"student"}`,studentName:session?.identity?.name||"",school:session?.identity?.school||"",studentClass:session?.classLabel||"",studentNumber:session?.identity?.attendance||"",teacherName:policy?.teacherName||"",teacherSchool:policy?.teacherSchool||"",teacherScope:policy?.actorScope||"",chapterId:"autosave",chapterTitle:reason,exerciseScore:"",status:reason,payload:draft,device:deviceLabel(),pageUrl:location.href,appVersion:VERSION});}
  function remindFiveMinutes(){saveAndSend("peringatan-5-menit");const w=$("[data-warning]");if(w)w.textContent="⚠ 5 menit lagi. Data sedang disimpan dan dikirim ke guru.";toast("Sisa waktu 5 menit. Data sudah disimpan dan sedang dikirim ke guru.","warning");if("vibrate"in navigator)navigator.vibrate?.([250,120,250]);}
  function expireCat(){if(!session?.catActive)return;clearInterval(timerId);clearInterval(proctorId);saveAndSend("waktu-habis");stopCamera();document.documentElement.classList.add("v65-cat-expired");document.documentElement.classList.remove("v65-cat-active","v65-cat-paused");ensureExpired().hidden=false;}
  function ensureExpired(){let x=$("#v65-expired");if(x)return x;x=document.createElement("div");x.id="v65-expired";x.className="v65-overlay";x.innerHTML='<section class="v65-dialog"><div class="v65-icon">⏱️</div><span class="v65-kicker">WAKTU SELESAI</span><h2>Ruang Murid Dikunci</h2><p>Data terakhir telah disimpan dan dikirim. Menunggu guru atau editor membuka kembali kelas.</p><div class="v65-waiting">Menunggu kendali guru…</div></section>';document.body.append(x);return x;}

  function startPolicyPolling(){clearInterval(policyPollId);const poll=async()=>{try{const s=await getClassStatus(session.classCode);if(s.active){const old=policy?.sessionId||"";policy=s.policy;if(!session.catActive){session.catActive=true;enterCat();}else if(document.documentElement.classList.contains("v65-cat-expired")&&old&&policy?.sessionId&&old!==policy.sessionId){resumeAfterReset();}}else if(session.catActive){releaseClass();}}catch{}};policyPollId=setInterval(poll,8000);}
  function resumeAfterReset(){document.documentElement.classList.remove("v65-cat-expired");$("#v65-expired")?.remove();session.catActive=true;setStore(sessionStorage,KEYS.session,JSON.stringify(session));ensurePermissionGate().hidden=false;$("[data-error]",ensurePermissionGate()).textContent="Kelas diaktifkan kembali. Aktifkan kamera dan lokasi untuk melanjutkan.";}
  function releaseClass(){clearInterval(timerId);clearInterval(policyPollId);clearInterval(proctorId);session.catActive=false;stopCamera();removeStore(sessionStorage,KEYS.session);document.documentElement.classList.remove("v65-cat-active","v65-cat-expired","v65-cat-paused","v65-student-session");$("#v65-cat-bar")?.remove();$("#v65-expired")?.remove();toast("Kelas telah dimatikan oleh guru.","success");}

  function startProctor(){clearInterval(proctorId);proctorId=setInterval(()=>{if(!session?.catActive)return;const track=cameraStream?.getVideoTracks?.()[0];if(!track||track.readyState!=="live"||track.enabled===false)pauseForPermission("Kamera tidak aktif. Aktifkan kembali untuk melanjutkan.");},6000);}
  function pauseForPermission(message){if(!session||privileged())return;document.documentElement.classList.add("v65-cat-paused");const gate=ensurePermissionGate();gate.hidden=false;$("[data-error]",gate).textContent=message;}

  function lockIdentityFields(){if(!session?.identity)return;const id=session.identity,maps=[["input[name='studentName'],input[data-lkpd-field='studentName']",id.name],["input[name='attendance'],input[data-lkpd-field='attendance']",id.attendance],["input[name='className'],input[data-lkpd-field='className']",id.className]];maps.forEach(([sel,val])=>$$(sel).forEach((el)=>{el.value=val;el.readOnly=true;}));}
  function restrictGrade(){if(!session?.grade)return;$$('[data-grade-filter]').forEach((b)=>{const ok=b.dataset.gradeFilter===session.grade;b.hidden=!ok;b.disabled=!ok;if(ok)b.click();});}

  function buildClassLink(classCode){const url=new URL("index.html",document.baseURI);url.searchParams.set("cat","1");url.searchParams.set("kelas",classCode);return url.href;}
  function ensureTeacherControl() {
    if(!privileged())return null;let panel=$("#v65-cat-control");if(panel)return panel;const id=teacherIdentity();
    panel=document.createElement("section");panel.id="v65-cat-control";panel.innerHTML=`<header><div><span>${isEditor()?"KENDALI EDITOR":"KENDALI GURU"}</span><h2>Kelola Kelas, Tautan, Kamera dan Timer</h2><p>Aktifkan kelas yang dipilih. Timer server mengunci Ruang Murid saat waktu berakhir.</p></div><b data-status>Memuat server…</b></header><div class="v65-control-grid"><label><span>Kelas</span><select data-class>${CLASS_OPTIONS.map((x)=>`<option>${x}</option>`).join("")}</select></label><label><span>Durasi</span><div><input data-duration type="number" min="5" max="240" value="45"><em>menit</em></div></label><div class="v65-actions"><button data-link>Buat / Salin Tautan</button><button data-start>Aktifkan CAT</button><button data-reset>Ulang Timer</button><button data-stop>Matikan Kelas</button>${isEditor()?'<button data-stop-all>Matikan Semua CAT</button>':""}</div></div><p data-time-info>Mulai: — • Berakhir: —</p><div data-classes></div>`;
    ($("main")||document.body).prepend(panel);["#v56-class-control","#v60-cat-control","#v61-cat-control","#v63-cat-control"].forEach((s)=>$(s)?.remove());
    const cls=$("[data-class]",panel),dur=$("[data-duration]",panel);
    async function command(cmd){const c=normalizeClass(cls.value);if(!c.code)throw new Error("Pilih kelas.");const result=await serverCall("classControlV66",{readKey:READ_KEY,command:cmd,classCode:c.code,durationMinutes:Number(dur.value||45),actorScope:teacherScope(),actorRole:isEditor()?"editor":"teacher",teacherName:clean(id.name||id.teacherName||(isEditor()?"Editor":"Guru")),teacherSchool:clean(id.workUnit||id.school||id.teacherSchool||"SMP Negeri 1 Susukan")});if(!result?.ok)throw new Error(result?.error||"Perintah gagal.");await refreshTeacherClasses();return result;}
    $("[data-link]",panel).onclick=async()=>{const c=normalizeClass(cls.value);const link=buildClassLink(c.code);try{await navigator.clipboard.writeText(link);toast("Tautan kelas disalin.","success");}catch{window.prompt("Salin tautan kelas:",link);}};
    $("[data-start]",panel).onclick=async()=>{try{await command("activate");toast("CAT diaktifkan.","success");}catch(e){toast(e.message,"error");}};
    $("[data-reset]",panel).onclick=async()=>{try{await command("reset");toast("Timer diulang.","success");}catch(e){toast(e.message,"error");}};
    $("[data-stop]",panel).onclick=async()=>{try{await command("stop");toast("Kelas dimatikan.","success");}catch(e){toast(e.message,"error");}};
    $("[data-stop-all]",panel)?.addEventListener("click",async()=>{try{const r=await serverCall("classControlV66",{readKey:READ_KEY,command:"stopAll",classCode:"VIIA",actorScope:"editor-global",actorRole:"editor",teacherName:"Editor",teacherSchool:"SMP Negeri 1 Susukan"});if(!r?.ok)throw new Error(r?.error||"Gagal");await refreshTeacherClasses();toast("Semua CAT dimatikan.","success");}catch(e){toast(e.message,"error");}});
    return panel;
  }

  async function refreshTeacherClasses(){const panel=ensureTeacherControl();if(!panel)return;try{const result=await serverCall("classListV66",{readKey:READ_KEY,actorScope:teacherScope(),actorRole:isEditor()?"editor":"teacher"});if(!result?.ok)throw new Error(result?.error||"Server gagal");serverReachable=true;const status=$("[data-status]",panel);status.textContent="Server tersambung";status.dataset.state="online";currentTeacherClasses=result.classes||[];const list=$("[data-classes]",panel);list.innerHTML=currentTeacherClasses.length?currentTeacherClasses.map((x)=>`<article><strong>${esc(x.classLabel||x.classCode)}</strong><small>${x.active?"AKTIF":"NONAKTIF"}</small></article>`).join(""):"<p>Tidak ada CAT aktif.</p>";const selected=normalizeClass($("[data-class]",panel).value);const p=currentTeacherClasses.find((x)=>x.classCode===selected.code);$("[data-time-info]",panel).textContent=p?.active?`Mulai: ${new Date(Number(p.startedAtEpoch||p.startedAt||Date.now())).toLocaleTimeString("id-ID")} • Berakhir: ${new Date(Number(p.deadlineEpoch||p.expiresAt||Date.now())).toLocaleTimeString("id-ID")}`:"Mulai: — • Berakhir: —";}catch(e){const status=$("[data-status]",panel);status.textContent="Server belum tersambung";status.dataset.state="error";const list=$("[data-classes]",panel);if(list)list.innerHTML=`<p>${esc(e.message||"Server gagal dijangkau.")}</p>`;}}

  function interceptStudent(event){const b=event.target.closest('[data-open-panel="student"]');if(!b||allowStudentOpen||privileged())return;event.preventDefault();event.stopImmediatePropagation();const saved=parse(getStore(localStorage,KEYS.identity),null);if(saved?.nisn&&saved?.className){session={identity:saved,classCode:saved.classCode||normalizeClass(saved.className).code,classLabel:saved.className,grade:saved.grade||normalizeClass(saved.className).grade,catActive:false,createdAt:new Date().toISOString()};setStore(sessionStorage,KEYS.session,JSON.stringify(session));ensurePermissionGate().hidden=false;}else showLogin();}
  function interceptCat(event){if(!session?.catActive||privileged())return;const t=event.target.closest("a[href],[data-close-workspace],[data-open-panel]:not([data-open-panel='student']),.workspace-close,.topbar a,.links a");if(!t||t.closest("#v65-cat-bar,#v65-permission-gate,#v65-expired"))return;event.preventDefault();event.stopImmediatePropagation();toast("CAT masih aktif. Tetap di Ruang Murid.","warning");}
  function historyEvents(){window.addEventListener("popstate",()=>{if(session?.catActive&&!privileged()){try{history.pushState({catV65:true},"",location.href);}catch{}toast("Tombol kembali dikunci selama CAT.","warning");}});document.addEventListener("visibilitychange",()=>{if(!session?.catActive||privileged())return;if(document.visibilityState==="hidden"){saveAndSend("halaman-ditinggalkan");send("proctorEventV65",{...session.identity,eventName:"page-hidden",...geo,pageUrl:location.href});}else if(!cameraStream?.active)pauseForPermission("Aktifkan kamera kembali untuk melanjutkan CAT.");});}

  function init(){cleanLegacyState();ensureLogin();ensurePermissionGate();document.addEventListener("click",interceptStudent,true);document.addEventListener("click",interceptCat,true);historyEvents();if(privileged()){ensureTeacherControl();refreshTeacherClasses();teacherPollId=setInterval(refreshTeacherClasses,15000);}window.PAIBP_CAT_V65=Object.freeze({version:VERSION,showLogin,normalizeClass,refreshTeacherClasses});window.PAIBP_CAT_V66=window.PAIBP_CAT_V65;window.PAIBP_CAT_V67=window.PAIBP_CAT_V65;}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
