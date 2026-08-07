(() => {
  "use strict";

  const VERSION = "69";
  const CONFIG = window.PAIBP_CONFIG || {};
  const ENDPOINT = String(CONFIG.syncEndpoint || CONFIG.realtimeEndpoint || "").trim();
  const READ_KEY = String(CONFIG.syncReadKey || CONFIG.realtimeReadKey || "").trim();
  const FILE = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const PARAMS = new URLSearchParams(location.search);
  const IS_CAT_LINK = PARAMS.get("cat") === "1" || PARAMS.get("ps_cat") === "1";
  const IS_RESET = PARAMS.get("reset") === "1";
  const GRADES = ["VII", "VIII", "IX"];
  const SECTIONS = ["A","B","C","D","E","F","G","H"];
  const CLASS_OPTIONS = GRADES.flatMap(g => SECTIONS.map(s => `${g} ${s}`));
  const KEYS = Object.freeze({
    identity: "paibp-smart-student-identity-v1",
    session: "paibp-smart-student-session-v69",
    teacher: "paibp-smart-teacher-identity-v1",
    teacherScope: "paibp-smart-teacher-scope-v69",
    authority: "paibp-smart-authority-v56",
    editor: "paibp-smart-editor-unlocked",
    draft: "paibp-smart-draft-v69"
  });

  const $ = (s, r=document) => r?.querySelector?.(s) || null;
  const $$ = (s, r=document) => [...(r?.querySelectorAll?.(s) || [])];
  const clean = v => String(v ?? "").replace(/\s+/g," ").trim();
  const parse = (v,f=null) => { try { return JSON.parse(v); } catch { return f; } };
  const esc = v => String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));

  let session = null;
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

  function normalizeClass(value) {
    const raw = clean(value).toUpperCase().replace(/KELAS|ROMBEL|GRADE|TINGKAT/g,"")
      .replace(/[._/\\-]+/g," ").replace(/\s+/g,"").replace(/[^A-Z0-9]/g,"");
    let grade="", section="";
    if(raw.startsWith("VIII")){grade="VIII";section=raw.slice(4)}
    else if(raw.startsWith("VII")){grade="VII";section=raw.slice(3)}
    else if(raw.startsWith("IX")){grade="IX";section=raw.slice(2)}
    else if(raw.startsWith("8")){grade="VIII";section=raw.slice(1)}
    else if(raw.startsWith("7")){grade="VII";section=raw.slice(1)}
    else if(raw.startsWith("9")){grade="IX";section=raw.slice(1)}
    section=section.replace(/[^A-Z]/g,"").slice(0,1);
    if(!grade || !SECTIONS.includes(section)) return {code:"",label:"",grade:"",section:""};
    return {code:`${grade}${section}`,label:`${grade} ${section}`,grade,section};
  }

  function linkClass() {
    return normalizeClass(PARAMS.get("kelas") || PARAMS.get("cat_class") || PARAMS.get("ps_class") || "");
  }

  function teacherIdentity(){ return parse(localStorage.getItem(KEYS.teacher),{}) || {}; }
  function isEditor(){
    const gate=String(document.body?.dataset.privateGateway||"").toLowerCase();
    const auth=String(sessionStorage.getItem(KEYS.authority)||"").toLowerCase();
    const e1=String(sessionStorage.getItem(KEYS.editor)||"").toLowerCase();
    const e2=String(localStorage.getItem(KEYS.editor)||"").toLowerCase();
    return FILE==="kendali-editor.html" || gate==="editor" || auth==="editor" || ["yes","true"].includes(e1) || ["yes","true"].includes(e2) || document.body?.dataset.teacherOwner==="yes";
  }
  function isTeacher(){
    const gate=String(document.body?.dataset.privateGateway||"").toLowerCase();
    const auth=String(sessionStorage.getItem(KEYS.authority)||"").toLowerCase();
    const role=String(document.body?.dataset.portalRole||"").toLowerCase();
    const id=teacherIdentity();
    return FILE==="akses-guru.html" || gate==="guru" || auth==="teacher" || role==="guru" || id.teacherRecognized===true || id.recognized===true;
  }
  const privileged=()=>isEditor()||isTeacher();

  function hashText(value){let h=2166136261;for(const ch of String(value||"")){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(36)}
  function teacherScope(){
    if(isEditor()) return "editor-global";
    const old=localStorage.getItem(KEYS.teacherScope); if(old) return old;
    const id=teacherIdentity();
    const scope=`guru-${hashText(`${clean(id.name||id.teacherName).toLowerCase()}|${clean(id.workUnit||id.school||id.teacherSchool).toLowerCase()}`)}`;
    localStorage.setItem(KEYS.teacherScope,scope);return scope;
  }

  function purgeConnectedBadges(){
    if(IS_CAT_LINK) return;
    ["#v56-class-badge","#v56-class-context","#v59-class-context","#v60-class-context","#v61-class-context","#v63-class-context","[data-class-context]","[class*='class-context']","[class*='connected-class']","[class*='kelas-terhubung']"].forEach(sel=>$$(sel).forEach(n=>n.remove()));
    $$('article,aside,section,div').forEach(n=>{
      if(n.children.length>10) return;
      const t=clean(n.textContent);
      if(/^Kelas\s+terhubung\s*:/i.test(t) && t.length<220) n.remove();
    });
  }

  function purgeLegacyState(force=false){
    const stale=/paibp-smart-(?:cat|class-context|student-session|policy-cache|focus-session)/i;
    if(force || !IS_CAT_LINK){
      [localStorage,sessionStorage].forEach(store=>{
        try{for(let i=store.length-1;i>=0;i--){const k=store.key(i)||"";if(k!==KEYS.identity && stale.test(k))store.removeItem(k)}}catch{}
      });
      session=null;policy=null;
    } else {
      [localStorage,sessionStorage].forEach(store=>{
        try{for(let i=store.length-1;i>=0;i--){const k=store.key(i)||"";if(k!==KEYS.identity && stale.test(k) && k!==KEYS.session)store.removeItem(k)}}catch{}
      });
    }
    ["v59-cat-active","v59-cat-paused","v59-cat-expired","v60-cat-active","v60-cat-paused","v60-cat-expired","v61-cat-active","v61-cat-paused","v61-cat-expired","v63-cat-active","v63-cat-paused","v63-cat-expired","v65-cat-active","v65-cat-paused","v65-cat-expired"].forEach(c=>document.documentElement.classList.remove(c));
    ["#v59-cat-bar","#v59-camera-gate","#v59-expired-screen","#v60-cat-bar","#v60-camera-gate","#v60-expired-screen","#v61-cat-bar","#v61-camera-gate","#v61-expired-screen","#v63-cat-bar","#v63-camera-gate","#v63-expired-screen","#v56-class-control","#v60-cat-control","#v61-cat-control","#v63-cat-control"].forEach(s=>$(s)?.remove());
    purgeConnectedBadges();
  }

  const legacyStub=Object.freeze({version:VERSION,startFromLegacy(){},enterStudentRoom(){},showLogin(){}});
  window.PAIBP_CAT_V59=legacyStub;window.PAIBP_CAT_V60=legacyStub;window.PAIBP_CAT_V61=legacyStub;window.PAIBP_CAT_V63=legacyStub;

  function endpointReady(){try{const u=new URL(ENDPOINT);return u.protocol==="https:";}catch{return false}}
  async function serverGet(action,params={},timeout=10000){
    if(!endpointReady()) throw new Error("Alamat server belum valid.");
    const u=new URL(ENDPOINT);u.searchParams.set("action",action);u.searchParams.set("_t",String(Date.now()));
    Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,String(v??"")));
    const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),timeout);
    try{
      const r=await fetch(u,{method:"GET",mode:"cors",cache:"no-store",headers:{Accept:"application/json"},signal:ctl.signal});
      const text=await r.text();let data;try{data=JSON.parse(text)}catch{throw new Error("Respons server bukan JSON.")}
      if(!r.ok && data?.ok!==true) throw new Error(data?.error||`Server HTTP ${r.status}`);
      return data;
    }catch(e){if(e?.name==="AbortError")throw new Error("Server tidak menjawab dalam 10 detik.");throw e}finally{clearTimeout(t)}
  }
  async function serverPost(action,data){
    if(!endpointReady()) return false;
    try{
      const r=await fetch(ENDPOINT,{method:"POST",mode:"cors",cache:"no-store",headers:{"Content-Type":"text/plain;charset=UTF-8",Accept:"application/json"},body:JSON.stringify({app:"paibp-smart",version:VERSION,action,data,origin:location.origin})});
      return r.ok;
    }catch{return false}
  }

  function toast(message,tone="info"){
    let n=$("#v65-toast");if(!n){n=document.createElement("div");n.id="v65-toast";n.setAttribute("role","status");n.setAttribute("aria-live","polite");document.body.append(n)}
    n.dataset.tone=tone;n.textContent=message;n.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>n.classList.remove("show"),3000);
  }

  async function getClassStatus(code){
    const r=await serverGet("classStatusV66",{classCode:code});
    if(!r?.ok) throw new Error(r?.error||"Status kelas gagal dibaca.");
    serverOffset=Number(r.serverEpoch||Date.now())-Date.now();return r;
  }

  function ensureLogin(){
    let m=$("#v65-student-login");if(m)return m;const lc=linkClass();
    m=document.createElement("div");m.id="v65-student-login";m.className="v65-overlay";m.hidden=true;
    m.innerHTML=`<section class="v65-dialog" role="dialog" aria-modal="true"><button type="button" class="v65-close" data-close>×</button><div class="v65-icon">🎓</div><span class="v65-kicker">LOGIN WAJIB RUANG MURID</span><h2>Identitas Murid</h2><p>Isi sekali. Identitas tersimpan di perangkat untuk akses berikutnya.</p><form id="v69-login" novalidate><div class="v65-form-grid"><label><span>NISN <b>*</b></span><input name="nisn" inputmode="numeric" minlength="10" maxlength="10" pattern="[0-9]{10}" required></label><label><span>Nama murid <b>*</b></span><input name="name" maxlength="80" required></label><label><span>Kelas <b>*</b></span><select name="className" required>${CLASS_OPTIONS.map(x=>`<option value="${x}">${x}</option>`).join("")}</select></label><label><span>Nomor absen <b>*</b></span><input name="attendance" inputmode="numeric" maxlength="3" required></label><label class="v65-wide"><span>Sekolah <b>*</b></span><input name="school" value="SMP Negeri 1 Susukan" required></label></div><p class="v65-note">Kamera dan lokasi wajib aktif untuk membuka Ruang Murid.</p><button class="v65-primary" type="submit">Lanjutkan</button><p class="v65-error" data-error></p></form></section>`;
    document.body.append(m);$("[data-close]",m).onclick=()=>m.hidden=true;$("#v69-login",m).addEventListener("submit",handleLogin);
    if(IS_CAT_LINK&&lc.label){const s=$("select[name='className']",m);s.value=lc.label;s.disabled=true}
    return m;
  }
  function fillLogin(m){const f=$("#v69-login",m),old=parse(localStorage.getItem(KEYS.identity),{})||{},lc=linkClass();if(old.nisn)f.elements.nisn.value=old.nisn;if(old.name)f.elements.name.value=old.name;if(old.attendance)f.elements.attendance.value=old.attendance;if(old.school)f.elements.school.value=old.school;if(IS_CAT_LINK&&lc.label){f.elements.className.disabled=false;f.elements.className.value=lc.label;f.elements.className.disabled=true}else if(old.className)f.elements.className.value=old.className}
  function showLogin(){const m=ensureLogin();fillLogin(m);m.hidden=false}
  function identityFromForm(f){const d=Object.fromEntries(new FormData(f).entries()),nisn=clean(d.nisn).replace(/\D/g,""),cls=normalizeClass(d.className||linkClass().label);if(!/^\d{10}$/.test(nisn))throw new Error("NISN wajib tepat 10 digit.");if(clean(d.name).length<3)throw new Error("Nama murid wajib diisi.");if(!cls.code)throw new Error("Kelas wajib dipilih.");if(!/^\d{1,3}$/.test(clean(d.attendance)))throw new Error("Nomor absen wajib berupa angka.");if(clean(d.school).length<4)throw new Error("Sekolah wajib diisi.");return{nisn,name:clean(d.name),className:cls.label,classCode:cls.code,grade:cls.grade,attendance:clean(d.attendance),school:clean(d.school)}}
  async function handleLogin(e){e.preventDefault();const f=e.currentTarget,err=$("[data-error]",f);err.textContent="";try{const id=identityFromForm(f),lc=linkClass();if(IS_CAT_LINK&&lc.code&&id.classCode!==lc.code)throw new Error(`Tautan ini khusus Kelas ${lc.label}.`);localStorage.setItem(KEYS.identity,JSON.stringify(id));ensureLogin().hidden=true;await beginStudent(id)}catch(x){err.textContent=x.message||"Login belum berhasil."}}

  function ensureWaiting(){let x=$("#v69-waiting");if(x)return x;x=document.createElement("div");x.id="v69-waiting";x.className="v65-overlay";x.innerHTML='<section class="v65-dialog"><div class="v65-icon">⌛</div><span class="v65-kicker">MENUNGGU GURU</span><h2>Kelas belum diaktifkan</h2><p>Link kelas sudah benar. Ruang CAT akan terbuka otomatis setelah guru mengaktifkan kelas.</p><div class="v65-waiting">Memeriksa status kelas…</div></section>';document.body.append(x);return x}
  function hideWaiting(){$("#v69-waiting")?.remove()}

  async function beginStudent(id){
    const lc=linkClass();session={identity:id,classCode:IS_CAT_LINK&&lc.code?lc.code:id.classCode,classLabel:IS_CAT_LINK&&lc.label?lc.label:id.className,grade:IS_CAT_LINK&&lc.grade?lc.grade:id.grade,catActive:false};
    sessionStorage.setItem(KEYS.session,JSON.stringify(session));
    if(IS_CAT_LINK){
      try{const st=await getClassStatus(session.classCode);if(!st.active){ensureWaiting();startWaitingPoll();return}policy=st.policy||null}catch(e){toast(`Server: ${e.message}`,"error");ensureWaiting();startWaitingPoll();return}
    }
    ensurePermissionGate().hidden=false;
  }

  function startWaitingPoll(){clearInterval(policyPollId);const poll=async()=>{if(!session||!IS_CAT_LINK)return;try{const st=await getClassStatus(session.classCode);if(st.active){clearInterval(policyPollId);policy=st.policy||null;hideWaiting();ensurePermissionGate().hidden=false}}catch{}};policyPollId=setInterval(poll,5000)}

  function ensurePermissionGate(){let g=$("#v65-permission-gate");if(g)return g;g=document.createElement("div");g.id="v65-permission-gate";g.className="v65-overlay";g.hidden=true;g.innerHTML='<section class="v65-dialog v65-permission-dialog"><div class="v65-icon">📷</div><span class="v65-kicker">VERIFIKASI AKSES MURID</span><h2>Aktifkan Kamera dan Lokasi</h2><p>Kedua izin wajib aktif untuk membuka Ruang Murid.</p><div class="v65-permission-status"><span data-camera>○ Kamera</span><span data-location>○ Lokasi</span></div><button type="button" class="v65-primary" data-allow>Izinkan dan Masuk</button><p class="v65-error" data-error></p></section>';document.body.append(g);$("[data-allow]",g).onclick=startPermissions;return g}
  async function requestLocation(){if(!navigator.geolocation)throw new Error("Perangkat tidak mendukung lokasi.");return new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(p=>resolve({latitude:p.coords.latitude,longitude:p.coords.longitude,accuracy:p.coords.accuracy}),()=>reject(new Error("Izin lokasi wajib diaktifkan.")),{enableHighAccuracy:false,timeout:8000,maximumAge:300000}))}
  function stopCamera(){cameraStream?.getTracks?.().forEach(t=>t.stop());cameraStream=null;$("#v65-camera-preview")?.remove()}
  async function requestCamera(){if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia)throw new Error("Kamera tidak tersedia pada browser ini.");stopCamera();cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:320,max:480},height:{ideal:240,max:360},frameRate:{ideal:8,max:12}},audio:false});cameraStream.getVideoTracks()[0]?.addEventListener("ended",()=>pauseForPermission("Kamera berhenti. Aktifkan kembali untuk melanjutkan."),{once:true});return cameraStream}
  async function startPermissions(){const g=ensurePermissionGate(),b=$("[data-allow]",g),err=$("[data-error]",g);b.disabled=true;err.textContent="Meminta izin kamera dan lokasi…";try{const [_,loc]=await Promise.all([requestCamera(),requestLocation()]);geo=loc;$("[data-camera]",g).textContent="✓ Kamera aktif";$("[data-location]",g).textContent="✓ Lokasi aktif";showCameraPreview();await serverPost("studentLoginV65",{...session.identity,...geo,device:navigator.userAgent,pageUrl:location.href});await serverPost("cameraStatusV65",{...session.identity,...geo,status:"active",pageUrl:location.href});g.hidden=true;openStudentPanel();if(IS_CAT_LINK){const st=await getClassStatus(session.classCode);if(!st.active){stopCamera();ensureWaiting();startWaitingPoll();return}policy=st.policy||null;enterCat()}else startNormalSession()}catch(e){err.textContent=e.message||"Kamera dan lokasi wajib diizinkan."}finally{b.disabled=false}}
  function showCameraPreview(){let p=$("#v65-camera-preview");if(!p){p=document.createElement("aside");p.id="v65-camera-preview";p.innerHTML='<video autoplay muted playsinline></video><span>● Kamera aktif</span>';document.body.append(p)}$("video",p).srcObject=cameraStream}
  function openStudentPanel(){allowStudentOpen=true;const b=$("[data-open-panel='student']");if(b)b.click();else $("#panel-student,[data-panel='student']")?.removeAttribute("hidden");allowStudentOpen=false;setTimeout(()=>lockIdentityFields(),50)}
  function startNormalSession(){document.documentElement.classList.add("v65-student-session");lockIdentityFields()}
  function lockIdentityFields(){if(!session?.identity)return;const id=session.identity;[["input[name='studentName'],input[data-lkpd-field='studentName']",id.name],["input[name='attendance'],input[data-lkpd-field='attendance']",id.attendance],["input[name='className'],input[data-lkpd-field='className']",id.className]].forEach(([s,v])=>$$(s).forEach(el=>{el.value=v;el.readOnly=true}))}

  function ensureCatBar(){let b=$("#v65-cat-bar");if(b)return b;b=document.createElement("header");b.id="v65-cat-bar";b.innerHTML='<div><span>MODE CAT • <b data-class></b></span><strong>Kamera dan pengawasan aktif</strong><small data-warning>Jawaban disimpan otomatis.</small></div><div class="v65-clock"><small>Sisa waktu</small><b data-time>--:--</b></div>';document.body.append(b);$("[data-class]",b).textContent=session.classLabel;return b}
  function armHistory(){if(historyArmed)return;historyArmed=true;try{history.replaceState({catV69:true},"",location.href);history.pushState({catV69:true},"",location.href)}catch{}}
  function fmt(ms){const s=Math.max(0,Math.ceil(ms/1000)),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),ss=s%60;return h?`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(ss).padStart(2,"0")}`:`${String(m).padStart(2,"0")}:${String(ss).padStart(2,"0")}`}
  function enterCat(){session.catActive=true;sessionStorage.setItem(KEYS.session,JSON.stringify(session));document.documentElement.classList.add("v65-cat-active");document.documentElement.classList.remove("v65-cat-expired","v65-cat-paused");ensureCatBar();armHistory();startTimer();startCatPolling();startProctor()}
  function startTimer(){clearInterval(timerId);reminderShown=false;const tick=()=>{const d=Number(policy?.deadlineEpoch||policy?.expiresAt||0),remain=d-(Date.now()+serverOffset),n=$("[data-time]");if(n)n.textContent=fmt(remain);if(d&&remain<=300000&&remain>0&&!reminderShown){reminderShown=true;remindFiveMinutes()}if(d&&remain<=0)expireCat()};tick();timerId=setInterval(tick,1000)}
  function collectDraft(){const fields={};$$('input,textarea,select').forEach((el,i)=>{if(el.type==="password"||el.type==="file")return;const k=el.name||el.id||el.dataset.lkpdField||`field-${i}`;fields[k]=(el.type==="checkbox"||el.type==="radio")?Boolean(el.checked):el.value});const d={timestamp:new Date().toISOString(),identity:session?.identity||{},classCode:session?.classCode||"",fields,pageUrl:location.href};localStorage.setItem(KEYS.draft,JSON.stringify(d));return d}
  function saveAndSend(reason){const d=collectDraft();serverPost("submission",{id:`autosave-${Date.now()}`,sessionId:`v69-${session?.identity?.nisn||"student"}`,studentName:session?.identity?.name||"",school:session?.identity?.school||"",studentClass:session?.classLabel||"",studentNumber:session?.identity?.attendance||"",teacherName:policy?.teacherName||"",teacherSchool:policy?.teacherSchool||"",teacherScope:policy?.actorScope||"",chapterId:"autosave",chapterTitle:reason,status:reason,payload:d,pageUrl:location.href,appVersion:VERSION})}
  function remindFiveMinutes(){saveAndSend("peringatan-5-menit");const w=$("[data-warning]");if(w)w.textContent="⚠ 5 menit lagi. Data disimpan dan dikirim ke guru.";toast("Sisa waktu 5 menit. Data sedang disimpan dan dikirim.","warning");navigator.vibrate?.([200,100,200])}
  function ensureExpired(){let x=$("#v65-expired");if(x)return x;x=document.createElement("div");x.id="v65-expired";x.className="v65-overlay";x.innerHTML='<section class="v65-dialog"><div class="v65-icon">⏱️</div><span class="v65-kicker">WAKTU SELESAI</span><h2>Ruang Murid Dikunci</h2><p>Data terakhir telah disimpan. Menunggu guru atau editor mengaktifkan kelas kembali.</p><div class="v65-waiting">Menunggu kendali guru…</div></section>';document.body.append(x);return x}
  function expireCat(){if(!session?.catActive)return;clearInterval(timerId);clearInterval(proctorId);saveAndSend("waktu-habis");stopCamera();document.documentElement.classList.add("v65-cat-expired");document.documentElement.classList.remove("v65-cat-active","v65-cat-paused");ensureExpired().hidden=false}
  function releaseCat(reason="Kelas dimatikan oleh guru."){clearInterval(timerId);clearInterval(policyPollId);clearInterval(proctorId);stopCamera();if(session)session.catActive=false;sessionStorage.removeItem(KEYS.session);document.documentElement.classList.remove("v65-cat-active","v65-cat-expired","v65-cat-paused");$("#v65-cat-bar")?.remove();$("#v65-expired")?.remove();toast(reason,"success")}
  function resumeAfterReset(newPolicy){policy=newPolicy;document.documentElement.classList.remove("v65-cat-expired");$("#v65-expired")?.remove();ensurePermissionGate().hidden=false;$("[data-error]",ensurePermissionGate()).textContent="Kelas diaktifkan kembali. Aktifkan kamera dan lokasi untuk melanjutkan."}
  function startCatPolling(){clearInterval(policyPollId);let oldId=policy?.sessionId||"";const poll=async()=>{if(!session||!IS_CAT_LINK)return;try{const st=await getClassStatus(session.classCode);if(st.active){const newId=st.policy?.sessionId||"";if(document.documentElement.classList.contains("v65-cat-expired")&&newId&&newId!==oldId){oldId=newId;resumeAfterReset(st.policy)}else{policy=st.policy||policy}}else if(st.expired){if(!document.documentElement.classList.contains("v65-cat-expired"))expireCat()}else if(session.catActive){releaseCat()}}catch{}};policyPollId=setInterval(poll,6000)}
  function startProctor(){clearInterval(proctorId);proctorId=setInterval(()=>{if(!session?.catActive)return;const t=cameraStream?.getVideoTracks?.()[0];if(!t||t.readyState!=="live"||t.enabled===false)pauseForPermission("Kamera tidak aktif. Aktifkan kembali untuk melanjutkan.")},5000)}
  function pauseForPermission(msg){if(!session?.catActive||privileged())return;document.documentElement.classList.add("v65-cat-paused");const g=ensurePermissionGate();g.hidden=false;$("[data-error]",g).textContent=msg}

  function buildClassLink(code){const u=new URL("index.html",document.baseURI);u.searchParams.set("cat","1");u.searchParams.set("kelas",code);return u.href}
  function ensureTeacherControl(){
    if(!privileged())return null;let p=$("#v65-cat-control");if(p)return p;const id=teacherIdentity();
    p=document.createElement("section");p.id="v65-cat-control";p.innerHTML=`<header><div><span>${isEditor()?"KENDALI EDITOR":"KENDALI GURU"}</span><h2>CAT Kelas Aktif</h2><p>Kelas aktif terlihat langsung dan dapat dihentikan dari panel ini.</p></div><b data-status>Memeriksa server…</b></header><div class="v65-control-grid"><label><span>Kelas</span><select data-class>${CLASS_OPTIONS.map(x=>`<option>${x}</option>`).join("")}</select></label><label><span>Durasi</span><div><input data-duration type="number" min="5" max="240" value="45"><em>menit</em></div></label><div class="v65-actions"><button data-link>Buat / Salin Tautan</button><button data-start>Aktifkan CAT</button><button data-reset>Ulang Timer</button><button data-stop>Matikan Kelas</button>${isEditor()?'<button data-stop-all>Matikan Semua CAT</button>':""}</div></div><p data-time-info>Mulai: — • Berakhir: —</p><section data-active-wrap><h3>Kelas Aktif</h3><div data-classes><p>Memuat…</p></div></section>`;
    ($("main")||document.body).prepend(p);["#v56-class-control","#v60-cat-control","#v61-cat-control","#v63-cat-control"].forEach(s=>$(s)?.remove());
    const cls=$("[data-class]",p),dur=$("[data-duration]",p);
    async function command(cmd,classCode=normalizeClass(cls.value).code){if(!classCode)throw new Error("Pilih kelas.");const r=await serverGet("classControlV66",{readKey:READ_KEY,command:cmd,classCode,durationMinutes:Number(dur.value||45),actorScope:teacherScope(),actorRole:isEditor()?"editor":"teacher",teacherName:clean(id.name||id.teacherName||(isEditor()?"Editor":"Guru")),teacherSchool:clean(id.workUnit||id.school||id.teacherSchool||"SMP Negeri 1 Susukan")});if(!r?.ok)throw new Error(r?.error||"Perintah gagal.");await refreshTeacherClasses();return r}
    $("[data-link]",p).onclick=async()=>{const c=normalizeClass(cls.value);const link=buildClassLink(c.code);try{await navigator.clipboard.writeText(link);toast("Tautan kelas disalin.","success")}catch{window.prompt("Salin tautan kelas:",link)}};
    $("[data-start]",p).onclick=()=>command("activate").then(()=>toast("CAT diaktifkan.","success")).catch(e=>toast(e.message,"error"));
    $("[data-reset]",p).onclick=()=>command("reset").then(()=>toast("Timer diulang.","success")).catch(e=>toast(e.message,"error"));
    $("[data-stop]",p).onclick=()=>command("stop").then(()=>toast("Kelas dimatikan.","success")).catch(e=>toast(e.message,"error"));
    $("[data-stop-all]",p)?.addEventListener("click",async()=>{try{const r=await serverGet("classControlV66",{readKey:READ_KEY,command:"stopAll",classCode:"VIIA",actorScope:"editor-global",actorRole:"editor",teacherName:"Editor",teacherSchool:"SMP Negeri 1 Susukan"});if(!r?.ok)throw new Error(r?.error||"Gagal");await refreshTeacherClasses();toast("Semua CAT dimatikan.","success")}catch(e){toast(e.message,"error")}});
    $("[data-classes]",p).addEventListener("click",e=>{const b=e.target.closest("button[data-stop-class]");if(!b)return;command("stop",b.dataset.stopClass).then(()=>toast(`Kelas ${b.dataset.label||b.dataset.stopClass} dimatikan.`,"success")).catch(x=>toast(x.message,"error"))});
    cls.addEventListener("change",()=>updateSelectedTime());return p;
  }
  let teacherClasses=[];
  function updateSelectedTime(){const p=$("#v65-cat-control");if(!p)return;const code=normalizeClass($("[data-class]",p)?.value).code,x=teacherClasses.find(c=>c.classCode===code&&c.active);$("[data-time-info]",p).textContent=x?`Mulai: ${new Date(Number(x.startedEpoch||Date.now())).toLocaleTimeString("id-ID")} • Berakhir: ${new Date(Number(x.deadlineEpoch||Date.now())).toLocaleTimeString("id-ID")}`:"Mulai: — • Berakhir: —"}
  async function refreshTeacherClasses(){const p=ensureTeacherControl();if(!p)return;const status=$("[data-status]",p),list=$("[data-classes]",p);try{const health=await serverGet("health");if(!health?.ok)throw new Error(health?.error||"Health check gagal");const r=await serverGet("classListV66",{readKey:READ_KEY,actorScope:teacherScope(),actorRole:isEditor()?"editor":"teacher"});if(!r?.ok)throw new Error(r?.error||"Daftar kelas gagal");teacherClasses=(r.classes||[]).filter(x=>x.active);status.textContent=`Server tersambung • Backend ${health.version||"?"}`;status.dataset.state="online";list.innerHTML=teacherClasses.length?teacherClasses.map(x=>`<article><div><strong>${esc(x.classLabel||x.classCode)}</strong><small>${esc(x.teacherName||"")} • berakhir ${new Date(Number(x.deadlineEpoch||Date.now())).toLocaleTimeString("id-ID")}</small></div><button type="button" data-stop-class="${esc(x.classCode)}" data-label="${esc(x.classLabel||x.classCode)}">Matikan sekarang</button></article>`).join(""):"<p>Tidak ada kelas aktif.</p>";updateSelectedTime()}catch(e){status.textContent="Server belum tersambung";status.dataset.state="error";list.innerHTML=`<p>${esc(e.message||"Server gagal dijangkau.")}</p>`}}

  function interceptStudent(e){const b=e.target.closest('[data-open-panel="student"]');if(!b||allowStudentOpen||privileged())return;e.preventDefault();e.stopImmediatePropagation();const saved=parse(localStorage.getItem(KEYS.identity),null),lc=linkClass();if(saved?.nisn && (!IS_CAT_LINK || normalizeClass(saved.className).code===lc.code)){beginStudent(saved)}else showLogin()}
  function interceptCat(e){if(!session?.catActive||privileged())return;const t=e.target.closest("a[href],[data-close-workspace],[data-open-panel]:not([data-open-panel='student']),.workspace-close,.topbar a,.links a");if(!t||t.closest("#v65-cat-bar,#v65-permission-gate,#v65-expired"))return;e.preventDefault();e.stopImmediatePropagation();toast("CAT masih aktif. Tetap di Ruang Murid.","warning")}
  function bindSafety(){window.addEventListener("popstate",()=>{if(session?.catActive&&!privileged()){try{history.pushState({catV69:true},"",location.href)}catch{}toast("Tombol kembali dikunci selama CAT.","warning")}});window.addEventListener("beforeunload",e=>{if(session?.catActive&&!privileged()){e.preventDefault();e.returnValue=""}});document.addEventListener("visibilitychange",()=>{if(!session?.catActive||privileged())return;if(document.visibilityState==="hidden"){saveAndSend("halaman-ditinggalkan");serverPost("proctorEventV65",{...session.identity,eventName:"page-hidden",...geo,pageUrl:location.href})}else{const t=cameraStream?.getVideoTracks?.()[0];if(!t||t.readyState!=="live")pauseForPermission("Aktifkan kamera kembali untuk melanjutkan CAT.")}})}

  async function resetFromQuery(){if(!IS_RESET)return;purgeLegacyState(true);try{for(const k of await caches.keys())await caches.delete(k)}catch{}try{for(const r of await navigator.serviceWorker.getRegistrations())await r.unregister()}catch{}const u=new URL(location.href);u.searchParams.delete("reset");u.searchParams.set("v","69");history.replaceState({},"",u.href);toast("Sesi CAT lama telah dibersihkan.","success")}

  function init(){purgeLegacyState(false);ensureLogin();ensurePermissionGate();document.addEventListener("click",interceptStudent,true);document.addEventListener("click",interceptCat,true);bindSafety();resetFromQuery();if(!IS_CAT_LINK){[0,250,700,1500,3000].forEach(ms=>setTimeout(purgeConnectedBadges,ms))}if(privileged()){ensureTeacherControl();refreshTeacherClasses();teacherPollId=setInterval(refreshTeacherClasses,10000)}window.PAIBP_CAT_V65=window.PAIBP_CAT_V66=window.PAIBP_CAT_V67=window.PAIBP_CAT_V69=Object.freeze({version:VERSION,showLogin,normalizeClass,refreshTeacherClasses})}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();