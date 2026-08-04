(() => {
  "use strict";

  const VERSION = "51";
  const CONFIG = window.PAIBP_CONFIG || {};
  const ENDPOINT = String(CONFIG.syncEndpoint || CONFIG.realtimeEndpoint || "").trim();
  const ENDPOINT_READY = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(ENDPOINT);
  const SESSION_KEY = "paibp-smart-session-v51";
  const QUEUE_KEY = "paibp-smart-activity-queue-v51";
  const LOCAL_WARNING = /mode lokal|belum real-time lintas perangkat|statistik hanya berasal dari perangkat ini|postingan kegiatan dapat hilang|google apps script belum dihubungkan|integrasi belum dikonfigurasi/i;

  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];
  const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;",
  })[character]);
  const parse = (value, fallback) => { try { return JSON.parse(value); } catch { return fallback; } };

  let realtimeState = "loading";
  let observerTimer = 0;
  let snapshotTimer = 0;
  let lastSnapshot = null;

  function sessionId() {
    let value = sessionStorage.getItem(SESSION_KEY);
    if (!value) {
      value = `v51-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;
      sessionStorage.setItem(SESSION_KEY, value);
    }
    return value;
  }

  function identity() {
    const student = parse(localStorage.getItem("paibp-smart-student-identity-v1"), {}) || {};
    const teacher = parse(localStorage.getItem("paibp-smart-teacher-identity-v1"), {}) || {};
    const role = document.body?.dataset.portalRole || (/akses-guru|kendali-editor/i.test(location.pathname) ? "guru" : "umum");
    const source = role === "guru" || role === "editor" ? teacher : student;
    return {
      role,
      name: source.name || source.studentName || source.teacherName || "",
      school: source.school || source.workUnit || source.studentSchool || source.teacherSchool || "",
      className: source.className || source.class || source.grade || "",
      number: source.number || source.absen || "",
    };
  }

  function deviceLabel() {
    const ua = navigator.userAgent || "";
    if (/android/i.test(ua)) return "Android";
    if (/iphone|ipad|ipod/i.test(ua)) return "iPhone/iPad";
    if (/windows/i.test(ua)) return "Windows";
    if (/macintosh|mac os/i.test(ua)) return "macOS";
    return "Perangkat lain";
  }

  function activityRecord(action = "session-start") {
    const user = identity();
    const activePanel = $(".workspace-panel:not([hidden])");
    const activeChapter = $("[data-chapter].active,[data-chapter-id].active,[aria-current='true'][data-chapter]");
    return {
      id: `a-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`,
      sessionId: sessionId(),
      role: user.role,
      userName: user.name,
      school: user.school,
      studentClass: user.className,
      studentNumber: user.number,
      action,
      space: activePanel?.dataset.panel || activePanel?.id || "beranda",
      chapter: activeChapter?.dataset.chapter || activeChapter?.dataset.chapterId || "",
      section: location.pathname.split("/").pop() || "index.html",
      durationSeconds: 0,
      status: navigator.onLine ? "daring" : "antri-luring",
      device: deviceLabel(),
      pageUrl: location.href,
      origin: location.origin,
      appVersion: VERSION,
      timestampClient: new Date().toISOString(),
    };
  }

  function queue() {
    const value = parse(localStorage.getItem(QUEUE_KEY), []);
    return Array.isArray(value) ? value : [];
  }

  function saveQueue(items) {
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(items.slice(-120))); } catch {}
  }

  function postActivity(record, beacon = false) {
    if (!ENDPOINT_READY) return Promise.reject(new Error("Endpoint belum siap"));
    const body = JSON.stringify({ app:"paibp-smart", version:VERSION, action:"activity", origin:location.origin, data:record });
    if (beacon && navigator.sendBeacon) {
      try {
        const sent = navigator.sendBeacon(ENDPOINT, new Blob([body], {type:"text/plain;charset=UTF-8"}));
        return sent ? Promise.resolve(true) : Promise.reject(new Error("Beacon gagal"));
      } catch (error) { return Promise.reject(error); }
    }
    return fetch(ENDPOINT, {
      method:"POST",
      mode:"no-cors",
      cache:"no-store",
      keepalive:body.length < 60000,
      headers:{"Content-Type":"text/plain;charset=UTF-8"},
      body,
    }).then(() => true);
  }

  async function sendActivity(action) {
    const record = activityRecord(action);
    if (!navigator.onLine || !ENDPOINT_READY) {
      const items = queue(); items.push(record); saveQueue(items); return;
    }
    try { await postActivity(record); }
    catch { const items = queue(); items.push(record); saveQueue(items); }
  }

  async function flushQueue() {
    if (!navigator.onLine || !ENDPOINT_READY) return;
    const items = queue();
    const remaining = [];
    for (const record of items) {
      try { await postActivity(record); }
      catch { remaining.push(record); }
    }
    saveQueue(remaining);
  }

  function jsonp(action, params = {}, timeout = 12000) {
    return new Promise((resolve, reject) => {
      if (!ENDPOINT_READY) { reject(new Error("Endpoint tidak tersedia")); return; }
      const callback = `paibpV51_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const node = document.createElement("script");
      let settled = false;
      const finish = (error, value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        try { delete window[callback]; } catch {}
        node.remove();
        error ? reject(error) : resolve(value);
      };
      window[callback] = (value) => finish(null, value);
      const url = new URL(ENDPOINT);
      Object.entries({ action, callback, _v:Date.now(), ...params }).forEach(([key, value]) => url.searchParams.set(key, String(value ?? "")));
      node.src = url.href;
      node.async = true;
      node.onerror = () => finish(new Error("Server tidak dapat dijangkau"));
      const timer = setTimeout(() => finish(new Error("Server melewati batas waktu")), timeout);
      document.head.append(node);
    });
  }

  function ensureLiveStats() {
    const hero = $(".hero-main-v25") || $(".hero-main") || $(".hero-copy")?.parentElement;
    if (!hero) return null;
    let stats = $("#v51-live-stats", hero);
    if (!stats) {
      stats = document.createElement("section");
      stats.id = "v51-live-stats";
      stats.className = "v51-live-stats";
      stats.dataset.state = "loading";
      stats.setAttribute("aria-label", "Statistik akses langsung");
      stats.innerHTML = `
        <article><strong data-v51-total>…</strong><span>Total sesi server</span></article>
        <article><strong data-v51-today>…</strong><span>Kunjungan hari ini</span></article>
        <article><strong data-v51-online>…</strong><span>Aktif 5 menit terakhir</span></article>
        <article><strong data-v51-activity>…</strong><span>Aktivitas tersimpan</span></article>`;
      const actions = $(".hero-actions-v25", hero);
      actions?.insertAdjacentElement("afterend", stats) || hero.append(stats);
    }
    return stats;
  }

  function number(value) {
    return Number(value || 0).toLocaleString("id-ID");
  }

  function applyStats(stats = {}) {
    const root = ensureLiveStats();
    if (!root) return;
    root.dataset.state = "online";
    $("[data-v51-total]", root).textContent = number(stats.totalSessions);
    $("[data-v51-today]", root).textContent = number(stats.todaySessions);
    $("[data-v51-online]", root).textContent = number(stats.onlineNow);
    $("[data-v51-activity]", root).textContent = number(stats.totalActivities);
  }

  function statusBadge() {
    const toolbar = $(".teacher-toolbar,.editor-toolbar,.teacher-actions");
    if (!toolbar) return null;
    let badge = $("#v51-realtime-badge", toolbar);
    if (!badge) {
      badge = document.createElement("span");
      badge.id = "v51-realtime-badge";
      badge.className = "v51-realtime-badge";
      toolbar.append(badge);
    }
    return badge;
  }

  function setRealtimeState(state) {
    realtimeState = state;
    document.documentElement.dataset.realtimeV51 = state;
    const badge = statusBadge();
    if (badge) {
      badge.dataset.state = state;
      badge.textContent = state === "online" ? "Rekap lintas perangkat aktif" : "Sinkronisasi otomatis";
    }
    $$('[data-v43-sync-badge]').forEach((node) => {
      node.dataset.tone = state === "online" ? "online" : "pending";
      node.textContent = state === "online" ? "Rekap lintas perangkat aktif" : "Sinkronisasi otomatis";
      node.title = node.textContent;
    });
    suppressLocalWarnings();
  }

  async function refreshSnapshot() {
    clearTimeout(snapshotTimer);
    if (!navigator.onLine || !ENDPOINT_READY) {
      setRealtimeState("retry");
      snapshotTimer = setTimeout(refreshSnapshot, 20000);
      return;
    }
    try {
      const [health, snapshot] = await Promise.all([
        jsonp("health", {}, 10000),
        jsonp("publicSnapshot", {}, 14000),
      ]);
      if (!health?.ok || !snapshot?.ok) throw new Error("Respons server tidak lengkap");
      lastSnapshot = snapshot;
      applyStats(snapshot.stats || {});
      setRealtimeState("online");
      flushQueue();
      snapshotTimer = setTimeout(refreshSnapshot, 30000);
    } catch {
      setRealtimeState("retry");
      snapshotTimer = setTimeout(refreshSnapshot, 15000);
    }
  }

  function suppressLocalWarnings(root = document) {
    const nodes = $$("p,small,strong,h1,h2,h3,h4,section,article,aside,div", root);
    for (const node of nodes) {
      if (node.children.length > 16) continue;
      const text = clean(node.textContent);
      if (!text || !LOCAL_WARNING.test(text)) continue;
      const container = node.closest("section,article,aside,.notice,.status-card,.sync-status") || node;
      container.classList.add("v51-retired-local-warning");
    }
  }

  function repairAccessPanel(root = document) {
    $$(".hero-access-panel .access-tile", root).forEach((tile) => {
      tile.querySelectorAll("strong,small,b,span").forEach((node) => {
        node.style.removeProperty("opacity");
        node.style.removeProperty("visibility");
        node.removeAttribute("hidden");
      });
    });
  }

  function findIslamicNavigation() {
    const candidates = $$("nav,aside,.sidebar,.side-nav,.feature-nav,.islamic-nav,.menu-list");
    return candidates.find((node) => {
      const text = clean(node.textContent).toLocaleLowerCase("id");
      const hits = ["al qur'an","hisnul muslim","dzikir pagi","dzikir petang","kalender hijriah","bahasa arab","khutbah"].filter((term) => text.includes(term)).length;
      return hits >= 4;
    }) || null;
  }

  function horizontalizeIslamicNavigation() {
    const nav = findIslamicNavigation();
    if (!nav) return;
    nav.classList.add("v51-islamic-nav");
    const parent = nav.parentElement;
    if (parent) parent.classList.add("v51-islamic-shell");
  }

  function sceneSvg(action, label) {
    const safe = escapeHtml(label);
    const defs = `<defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#dff6ee"/><stop offset="1" stop-color="#fff8df"/></linearGradient>
      <linearGradient id="shirt" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#77c76d"/><stop offset="1" stop-color="#3d9d62"/></linearGradient>
      <filter id="shadow"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#16483d" flood-opacity=".16"/></filter>
    </defs>`;
    const base = `<rect width="420" height="236" fill="url(#sky)"/><path d="M0 188 Q100 170 210 188 T420 184V236H0Z" fill="#e3ede9"/><circle cx="374" cy="38" r="18" fill="#fff2a8" opacity=".9"/>`;
    const sink = `<g filter="url(#shadow)"><rect x="28" y="96" width="102" height="84" rx="15" fill="#f7fbfa" stroke="#9ec7bb" stroke-width="3"/><rect x="43" y="114" width="72" height="25" rx="10" fill="#d9edf0"/><path d="M74 93V66h38v14H89v18" fill="none" stroke="#708a85" stroke-width="8" stroke-linecap="round"/></g>`;
    const waterHands = `<path d="M88 82c0 30-5 46-22 62" stroke="#45b8ec" stroke-width="8" stroke-linecap="round" opacity=".75"/><path d="M88 88c0 24 6 38 22 52" stroke="#67cdf3" stroke-width="5" stroke-linecap="round" opacity=".65"/>`;
    const mat = `<rect x="84" y="178" width="252" height="38" rx="10" fill="#0a7d68" opacity=".18"/><path d="M94 188h232M118 178v38M302 178v38" stroke="#08735f" stroke-width="2" opacity=".38"/>`;
    const standing = (arms="down", x=250) => {
      const arm = arms === "up"
        ? `<path d="M${x-22} 103q-28-19-24-45M${x+22} 103q28-19 24-45" stroke="#d59b74" stroke-width="13" stroke-linecap="round"/><path d="M${x-46} 58l-4-13M${x+46} 58l4-13" stroke="#d59b74" stroke-width="10" stroke-linecap="round"/>`
        : arms === "fold"
        ? `<path d="M${x-24} 109q25 18 50 0M${x+24} 112q-24 17-48 0" stroke="#d59b74" stroke-width="12" stroke-linecap="round"/>`
        : `<path d="M${x-25} 107l-11 56M${x+25} 107l11 56" stroke="#d59b74" stroke-width="13" stroke-linecap="round"/>`;
      return `<g filter="url(#shadow)"><circle cx="${x}" cy="64" r="24" fill="#dca17a"/><path d="M${x-26} 55q26-34 52 0" fill="#172f2a"/><rect x="${x-34}" y="88" width="68" height="74" rx="23" fill="url(#shirt)"/>${arm}<path d="M${x-18} 160l-9 44M${x+18} 160l9 44" stroke="#253f39" stroke-width="17" stroke-linecap="round"/><path d="M${x-30} 204h22M${x+8} 204h22" stroke="#172f2a" stroke-width="8" stroke-linecap="round"/></g>`;
    };
    const bow = `<g transform="translate(60 7)" filter="url(#shadow)"><circle cx="244" cy="98" r="22" fill="#dca17a"/><path d="M224 90q20-28 40 0" fill="#172f2a"/><path d="M150 116q54-28 96-7" stroke="url(#shirt)" stroke-width="47" stroke-linecap="round"/><path d="M164 115l-24 49M222 113l30 49" stroke="#d59b74" stroke-width="13" stroke-linecap="round"/><path d="M169 140v63M218 137v66" stroke="#263f39" stroke-width="17" stroke-linecap="round"/></g>`;
    const prostrate = `<g transform="translate(44 11)" filter="url(#shadow)"><path d="M132 153q44-61 104-30" stroke="url(#shirt)" stroke-width="47" stroke-linecap="round"/><circle cx="255" cy="164" r="23" fill="#dca17a"/><path d="M237 155q19-25 38 0" fill="#172f2a"/><path d="M152 146l-34 51M219 141l-14 56" stroke="#263f39" stroke-width="17" stroke-linecap="round"/><path d="M241 181l-23 19M270 181l20 19" stroke="#d59b74" stroke-width="12" stroke-linecap="round"/></g>`;
    const sitting = (finger=false, turn=false) => `<g transform="translate(32 8)" filter="url(#shadow)"><circle cx="244" cy="82" r="23" fill="#dca17a"/><path d="M223 73q21-29 42 0" fill="#172f2a"/>${turn?'<path d="M248 84q12 3 18 11" stroke="#7d4f3d" stroke-width="3"/>':''}<rect x="210" y="105" width="68" height="63" rx="24" fill="url(#shirt)"/><path d="M228 164q-36 9-55 38M260 164q25 18 44 37" stroke="#263f39" stroke-width="17" stroke-linecap="round"/><path d="M218 123q-18 28-35 39M270 124q16 23 30 35" stroke="#d59b74" stroke-width="12" stroke-linecap="round"/>${finger?'<path d="M302 157v-24" stroke="#d59b74" stroke-width="6" stroke-linecap="round"/>':''}</g>`;
    const washingPerson = (kind) => {
      if (kind === "hands") return `${sink}${waterHands}<g transform="translate(18 1)">${standing("down",268)}<path d="M241 123q-78 2-116 24M294 123q-83 28-157 26" stroke="#d59b74" stroke-width="12" stroke-linecap="round"/></g>`;
      if (kind === "face") return `${sink}${waterHands}<g transform="translate(18 1)">${standing("down",270)}<path d="M246 121q18-26 25-41M294 121q-16-26-24-41" stroke="#d59b74" stroke-width="12" stroke-linecap="round"/><path d="M250 80q20 24 40 0" stroke="#62c8ef" stroke-width="6" opacity=".7"/></g>`;
      if (kind === "arms") return `${sink}${waterHands}<g transform="translate(18 1)">${standing("down",270)}<path d="M244 118q-73 20-111 28M293 118q-55 15-93 27" stroke="#d59b74" stroke-width="13" stroke-linecap="round"/></g>`;
      if (kind === "head") return `${sink}<g transform="translate(18 1)">${standing("down",270)}<path d="M244 112q10-48 27-52M296 112q-12-47-25-52" stroke="#d59b74" stroke-width="12" stroke-linecap="round"/><path d="M245 62q25 18 50 0" stroke="#62c8ef" stroke-width="6" opacity=".65"/></g>`;
      if (kind === "feet") return `${sink}${waterHands}<g transform="translate(20 1)">${standing("down",280)}<path d="M255 188q-96-11-125-26" stroke="#263f39" stroke-width="17" stroke-linecap="round"/><path d="M140 164q-25-4-32 9" stroke="#dca17a" stroke-width="12" stroke-linecap="round"/></g>`;
      return `${sink}${standing("fold",270)}`;
    };

    let scene = "";
    switch (action) {
      case "wudhu-niat": scene = `${sink}${standing("fold",270)}<path d="M301 37q25-25 52 0" fill="none" stroke="#f5bd38" stroke-width="5"/><text x="327" y="29" text-anchor="middle" font-size="15" font-weight="800" fill="#5f4a00">Bismillah</text>`; break;
      case "wudhu-hands": scene = washingPerson("hands"); break;
      case "wudhu-mouth": scene = `${sink}${waterHands}<g transform="translate(18 1)">${standing("down",270)}<path d="M246 125q14-34 27-43" stroke="#d59b74" stroke-width="12" stroke-linecap="round"/><path d="M288 124q-9-29-17-40" stroke="#d59b74" stroke-width="12" stroke-linecap="round"/><circle cx="272" cy="82" r="8" fill="#74d2f4" opacity=".72"/></g>`; break;
      case "wudhu-face": scene = washingPerson("face"); break;
      case "wudhu-arms": scene = washingPerson("arms"); break;
      case "wudhu-head": scene = washingPerson("head"); break;
      case "wudhu-feet": scene = washingPerson("feet"); break;
      case "wudhu-doa": scene = `${sink}${standing("up",270)}<path d="M236 50q34-30 68 0" fill="none" stroke="#f5bd38" stroke-width="5"/>`; break;
      case "prayer-takbir": scene = `${mat}${standing("up",210)}`; break;
      case "prayer-qiyam": scene = `${mat}${standing("fold",210)}<rect x="300" y="66" width="72" height="94" rx="8" fill="#fff" stroke="#b8d3ca"/><path d="M313 85h47M313 101h47M313 117h38M313 133h43" stroke="#0a7d68" stroke-width="4"/>`; break;
      case "prayer-ruku": scene = `${mat}${bow}`; break;
      case "prayer-itidal": scene = `${mat}${standing("down",210)}`; break;
      case "prayer-sujud": scene = `${mat}${prostrate}`; break;
      case "prayer-sit": scene = `${mat}${sitting(false,false)}`; break;
      case "prayer-tasyahud": scene = `${mat}${sitting(true,false)}`; break;
      case "prayer-salam": scene = `${mat}${sitting(false,true)}<path d="M334 74q26 0 38 17" fill="none" stroke="#f5bd38" stroke-width="5"/>`; break;
      case "jamaah": scene = `${mat}${standing("fold",120)}${standing("fold",226)}${standing("fold",326)}<path d="M72 52h96" stroke="#f5bd38" stroke-width="5"/><text x="120" y="43" text-anchor="middle" font-size="13" font-weight="900" fill="#5f4a00">IMAM</text>`; break;
      case "tayamum": scene = `<rect x="32" y="55" width="132" height="126" rx="16" fill="#d2b28b" stroke="#9a7045" stroke-width="3"/><circle cx="80" cy="96" r="5" fill="#9a7045"/><circle cx="124" cy="126" r="6" fill="#9a7045"/>${standing("down",280)}<path d="M250 122q-67 12-102 20M304 122q-68 16-103 22" stroke="#d59b74" stroke-width="12" stroke-linecap="round"/>`; break;
      case "fasting": scene = `${standing("fold",295)}<rect x="38" y="138" width="150" height="16" rx="8" fill="#8c5a36"/><rect x="62" y="92" width="104" height="46" rx="10" fill="#fff" stroke="#c5ddd5"/><circle cx="90" cy="115" r="14" fill="#f5bd38"/><path d="M116 106h34M116 120h25" stroke="#0a7d68" stroke-width="5"/><circle cx="88" cy="52" r="27" fill="#fff3ad"/><path d="M97 31a24 24 0 1 0 0 42 20 20 0 1 1 0-42Z" fill="#f3b62f"/>`; break;
      case "zakat": scene = `${standing("down",300)}<rect x="64" y="102" width="128" height="82" rx="15" fill="#efe8ff" stroke="#7a59b8" stroke-width="3"/><path d="M94 102V84h67v18M128 114v58" stroke="#7a59b8" stroke-width="5"/><circle cx="112" cy="140" r="14" fill="#f5bd38"/><circle cx="147" cy="140" r="14" fill="#f5bd38"/>`; break;
      case "hajj": scene = `<rect x="72" y="70" width="132" height="132" fill="#171717"/><path d="M72 91h132" stroke="#d6b04f" stroke-width="8"/>${standing("up",300)}<path d="M46 206q95-26 190 0" fill="none" stroke="#0a7d68" stroke-width="5" stroke-dasharray="9 8"/>`; break;
      case "qurban": scene = `${standing("down",315)}<path d="M70 161c0-43 37-72 87-67 42 4 70 26 78 58l-28 8-10 45h-22l-9-33h-50l-9 33H84Z" fill="#f3e7df" stroke="#9b554e" stroke-width="4"/><circle cx="217" cy="127" r="8" fill="#172f2a"/><path d="M226 105l19-16M226 111l23 5" stroke="#9b554e" stroke-width="5" stroke-linecap="round"/>`; break;
      default: scene = `${standing("fold",210)}`;
    }
    return `<span class="v51-scene"><svg viewBox="0 0 420 236" role="img" aria-label="${safe}">${defs}${base}${scene}</svg></span>`;
  }

  const WORSHIP = [
    {
      id:"wudhu", label:"💧 Wudhu", title:"Wudhu Lengkap dan Tertib",
      intro:"Setiap langkah ditampilkan dengan adegan visual anak SMP, urutan pelaksanaan, dan bacaan yang relevan.",
      steps:[
        {title:"Niat dan membaca basmalah", action:"wudhu-niat", note:"Hadapkan hati untuk berwudhu karena Allah Subhanahu Wata'ala. Niat cukup di dalam hati, kemudian membaca basmalah.", arabic:"بِسْمِ اللَّهِ", latin:"Bismillāh", meaning:"Dengan nama Allah."},
        {title:"Membasuh kedua telapak tangan", action:"wudhu-hands", note:"Basuh kedua telapak tangan sampai pergelangan tiga kali. Mulai dari tangan kanan dan sela-sela jari dibersihkan."},
        {title:"Berkumur dan membersihkan hidung", action:"wudhu-mouth", note:"Ambil air dengan tangan kanan, berkumur, masukkan air perlahan ke hidung, lalu keluarkan menggunakan tangan kiri. Lakukan tiga kali."},
        {title:"Membasuh seluruh wajah", action:"wudhu-face", note:"Basuh dari batas tumbuh rambut sampai dagu dan dari telinga kanan sampai telinga kiri secara merata sebanyak tiga kali."},
        {title:"Membasuh tangan sampai siku", action:"wudhu-arms", note:"Basuh tangan kanan sampai siku tiga kali, kemudian tangan kiri. Pastikan siku dan sela-sela jari terkena air."},
        {title:"Mengusap kepala dan telinga", action:"wudhu-head", note:"Usap kepala satu kali dari depan ke belakang lalu kembali. Lanjutkan mengusap bagian dalam dan luar telinga."},
        {title:"Membasuh kaki sampai mata kaki", action:"wudhu-feet", note:"Basuh kaki kanan sampai mata kaki tiga kali lalu kaki kiri. Bersihkan sela-sela jari dan tumit."},
        {title:"Tertib dan doa setelah wudhu", action:"wudhu-doa", note:"Pastikan semua langkah dilakukan berurutan, tidak terputus terlalu lama, lalu membaca doa setelah wudhu.", arabic:"أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ", latin:"Asyhadu allā ilāha illallāhu wahdahu lā syarīka lah, wa asyhadu anna Muhammadan ‘abduhu wa rasūluh.", meaning:"Aku bersaksi bahwa tidak ada Tuhan selain Allah Yang Maha Esa dan aku bersaksi bahwa Nabi Muhammad adalah hamba dan utusan-Nya."},
      ],
    },
    {
      id:"sholat", label:"🕌 Sholat", title:"Sholat Munfarid: Gerakan dan Bacaan",
      intro:"Urutan dari takbiratul ihram sampai salam, lengkap dengan gerakan yang diperagakan dan bacaan pokok.",
      steps:[
        {title:"Berdiri, niat, dan takbiratul ihram", action:"prayer-takbir", note:"Berdiri tegak menghadap kiblat. Niat di dalam hati, angkat kedua tangan sejajar bahu atau telinga, lalu bertakbir.", arabic:"اللَّهُ أَكْبَرُ", latin:"Allāhu akbar", meaning:"Allah Mahabesar."},
        {title:"Qiyam: Al Fatihah dan surat", action:"prayer-qiyam", note:"Letakkan tangan kanan di atas tangan kiri. Baca doa iftitah bila dibiasakan, Al Fatihah, kemudian surat atau ayat Al Qur'an.", arabic:"بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيمِ  الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", latin:"Bismillāhir-raḥmānir-raḥīm. Alḥamdu lillāhi rabbil ‘ālamīn…", meaning:"Bacalah Al Fatihah dengan tartil sampai selesai."},
        {title:"Ruku dengan tuma'ninah", action:"prayer-ruku", note:"Bungkukkan badan, punggung rata, kedua tangan memegang lutut, kepala sejajar punggung, lalu diam sejenak.", arabic:"سُبْحَانَ رَبِّيَ الْعَظِيمِ وَبِحَمْدِهِ", latin:"Subḥāna rabbiyal ‘aẓīmi wa biḥamdih", meaning:"Mahasuci Tuhanku Yang Mahaagung dan dengan memuji-Nya. Dibaca tiga kali."},
        {title:"I'tidal", action:"prayer-itidal", note:"Bangkit dari ruku sampai berdiri tegak dan tuma'ninah.", arabic:"سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ  رَبَّنَا لَكَ الْحَمْدُ", latin:"Sami‘allāhu liman ḥamidah. Rabbanā lakal-ḥamd.", meaning:"Allah mendengar orang yang memuji-Nya. Wahai Tuhan kami, bagi-Mu segala puji."},
        {title:"Sujud pertama", action:"prayer-sujud", note:"Letakkan dahi dan hidung, kedua telapak tangan, kedua lutut, serta ujung jari kaki di tempat sujud. Lakukan dengan tuma'ninah.", arabic:"سُبْحَانَ رَبِّيَ الْأَعْلَى وَبِحَمْدِهِ", latin:"Subḥāna rabbiyal a‘lā wa biḥamdih", meaning:"Mahasuci Tuhanku Yang Mahatinggi dan dengan memuji-Nya. Dibaca tiga kali."},
        {title:"Duduk di antara dua sujud", action:"prayer-sit", note:"Bangkit dan duduk iftirasy dengan tuma'ninah, kemudian membaca doa.", arabic:"رَبِّ اغْفِرْ لِي وَارْحَمْنِي وَاجْبُرْنِي وَارْفَعْنِي وَارْزُقْنِي وَاهْدِنِي وَعَافِنِي وَاعْفُ عَنِّي", latin:"Rabbighfir lī warḥamnī wajburnī warfa‘nī warzuqnī wahdinī wa ‘āfinī wa‘fu ‘annī.", meaning:"Ya Allah, ampunilah, rahmatilah, cukupkanlah, angkatlah derajatku, berilah rezeki, petunjuk, kesehatan, dan maaf kepadaku."},
        {title:"Tasyahud dan sholawat", action:"prayer-tasyahud", note:"Duduk tasyahud, letakkan tangan di paha, dan isyaratkan telunjuk sesuai tuntunan yang dipelajari. Baca tahiyat, syahadat, lalu sholawat.", arabic:"التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ…", latin:"At-taḥiyyātu lillāhi waṣ-ṣalawātu waṭ-ṭayyibāt, as-salāmu ‘alaika ayyuhan-nabiyyu wa raḥmatullāhi wa barakātuh…", meaning:"Lanjutkan bacaan tasyahud dan sholawat Ibrahimiyah sampai selesai."},
        {title:"Salam", action:"prayer-salam", note:"Palingkan wajah ke kanan kemudian ke kiri dengan tertib untuk mengakhiri sholat.", arabic:"السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ", latin:"Assalāmu‘alaikum waraḥmatullāh", meaning:"Semoga keselamatan dan rahmat Allah tercurah kepada kalian."},
      ],
    },
    {
      id:"jamaah", label:"👥 Berjamaah", title:"Sholat Berjamaah",
      intro:"Visual posisi imam dan makmum, cara mengikuti imam, serta langkah makmum masbuk.",
      steps:[
        {title:"Luruskan dan rapatkan shaf", action:"jamaah", note:"Imam mengingatkan makmum untuk meluruskan dan merapatkan barisan. Makmum berdiri sejajar tanpa mengganggu orang di samping."},
        {title:"Imam di depan, makmum mengikuti", action:"jamaah", note:"Imam berada di depan. Makmum tidak mendahului takbir, gerakan, maupun salam imam."},
        {title:"Takbir setelah imam", action:"prayer-takbir", note:"Makmum bertakbir sesudah mendengar atau melihat imam bertakbir.", arabic:"اللَّهُ أَكْبَرُ", latin:"Allāhu akbar", meaning:"Allah Mahabesar."},
        {title:"Ikuti seluruh gerakan", action:"prayer-ruku", note:"Ruku, i'tidal, sujud, dan duduk dilakukan setelah imam berpindah gerakan."},
        {title:"Makmum masbuk", action:"jamaah", note:"Makmum yang datang terlambat segera mengikuti posisi imam. Setelah imam salam, berdiri untuk menyempurnakan rakaat yang tertinggal."},
        {title:"Salam bersama imam", action:"prayer-salam", note:"Makmum mengucapkan salam setelah imam mengucapkannya."},
      ],
    },
    {
      id:"tayamum", label:"👐 Tayamum", title:"Tayamum",
      intro:"Pengganti wudhu ketika air tidak tersedia atau penggunaannya membahayakan.",
      steps:[
        {title:"Pastikan sebab tayamum", action:"tayamum", note:"Cari air terlebih dahulu. Tayamum dilakukan ketika air tidak ada, sulit dijangkau, atau penggunaan air membahayakan kesehatan."},
        {title:"Niat dan basmalah", action:"wudhu-niat", note:"Berniat tayamum di dalam hati karena Allah Subhanahu Wata'ala dan membaca basmalah.", arabic:"بِسْمِ اللَّهِ", latin:"Bismillāh", meaning:"Dengan nama Allah."},
        {title:"Tepukkan telapak tangan", action:"tayamum", note:"Tepukkan kedua telapak tangan satu kali pada tanah atau debu yang suci, lalu tipiskan debu berlebih."},
        {title:"Usap wajah", action:"wudhu-face", note:"Usapkan kedua telapak tangan ke seluruh wajah satu kali secara merata."},
        {title:"Usap kedua tangan", action:"wudhu-arms", note:"Usap tangan kanan dan kiri secara tertib sesuai tuntunan yang dipelajari."},
      ],
    },
    {
      id:"puasa", label:"🌙 Puasa", title:"Puasa dari Niat sampai Berbuka",
      intro:"Alur harian puasa yang mudah dipahami dan dipraktikkan murid.",
      steps:[
        {title:"Niat", action:"fasting", note:"Niat puasa dilakukan sesuai jenis puasa. Niat berada di dalam hati karena Allah Subhanahu Wata'ala."},
        {title:"Sahur", action:"fasting", note:"Makan dan minum secukupnya menjelang fajar. Hindari berlebihan dan pilih makanan yang sehat."},
        {title:"Menahan diri", action:"fasting", note:"Sejak terbit fajar sampai terbenam matahari, tahan makan, minum, dan segala hal yang membatalkan puasa."},
        {title:"Menjaga akhlak", action:"fasting", note:"Jaga ucapan, pandangan, emosi, dan perilaku. Perbanyak membaca Al Qur'an, dzikir, sedekah, dan kebaikan."},
        {title:"Segera berbuka", action:"fasting", note:"Ketika waktu maghrib tiba, segera berbuka secukupnya.", arabic:"ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ", latin:"Żahabaẓ-ẓama’u wabtallatil-‘urūqu wa ṡabatal-ajru in syā’allāh.", meaning:"Telah hilang rasa haus, urat-urat telah basah, dan pahala telah tetap, insya Allah."},
      ],
    },
    {
      id:"zakat", label:"🤲 Zakat", title:"Zakat Fitrah dan Zakat Mal",
      intro:"Langkah mengenali, menghitung, meniatkan, dan menyalurkan zakat kepada yang berhak.",
      steps:[
        {title:"Kenali jenis zakat", action:"zakat", note:"Bedakan zakat fitrah dan zakat mal. Pelajari syarat, waktu, serta harta yang dikenai zakat."},
        {title:"Hitung kewajiban", action:"zakat", note:"Zakat fitrah mengikuti ukuran yang ditetapkan. Zakat mal dihitung setelah memenuhi nishab dan haul sesuai jenis hartanya."},
        {title:"Niat", action:"zakat", note:"Niatkan zakat karena Allah Subhanahu Wata'ala, bukan untuk dipuji atau mendapatkan balasan manusia."},
        {title:"Serahkan kepada amil atau mustahik", action:"zakat", note:"Salurkan melalui amil terpercaya atau kepada mustahik yang benar-benar berhak."},
        {title:"Catat dan pastikan sampai", action:"zakat", note:"Pastikan jumlah, waktu, dan penerima tercatat agar penyaluran tertib dan dapat dipertanggungjawabkan."},
      ],
    },
    {
      id:"haji", label:"🕋 Haji", title:"Urutan Pokok Manasik Haji",
      intro:"Visual ringkas untuk mengenal ihram, wukuf, mabit, jumrah, tahallul, tawaf, dan sa'i.",
      steps:[
        {title:"Ihram dan niat dari miqat", action:"hajj", note:"Bersuci, mengenakan pakaian ihram, kemudian berniat dari miqat yang telah ditentukan."},
        {title:"Wukuf di Arafah", action:"hajj", note:"Berdiam di Arafah pada waktunya sambil berdoa, berdzikir, dan memohon ampun."},
        {title:"Mabit di Muzdalifah dan Mina", action:"hajj", note:"Bermalam sesuai ketentuan manasik dan menjaga ketertiban jamaah."},
        {title:"Melontar jumrah", action:"hajj", note:"Melontar jumrah pada waktu dan urutan yang benar sesuai bimbingan petugas."},
        {title:"Tahallul", action:"hajj", note:"Mencukur atau memotong rambut sebagai tanda keluar dari sebagian atau seluruh larangan ihram."},
        {title:"Tawaf dan sa'i", action:"hajj", note:"Tawaf mengelilingi Ka'bah tujuh putaran, kemudian sa'i antara Shafa dan Marwah tujuh kali."},
      ],
    },
    {
      id:"kurban", label:"🐐 Kurban", title:"Pelaksanaan Ibadah Kurban",
      intro:"Dari niat, pemilihan hewan, penyembelihan syar'i, sampai pembagian daging yang tertib.",
      steps:[
        {title:"Niat dan waktu pelaksanaan", action:"qurban", note:"Niatkan ibadah kurban karena Allah Subhanahu Wata'ala dan laksanakan pada waktu yang telah ditentukan."},
        {title:"Pilih hewan yang memenuhi syarat", action:"qurban", note:"Hewan cukup umur, sehat, tidak cacat, dan diperoleh dengan cara yang halal."},
        {title:"Penyembelihan secara syar'i", action:"qurban", note:"Hadapkan hewan ke kiblat, perlakukan dengan baik, gunakan alat tajam, dan baca basmalah serta takbir.", arabic:"بِسْمِ اللَّهِ، اللَّهُ أَكْبَرُ", latin:"Bismillāh, Allāhu akbar", meaning:"Dengan nama Allah, Allah Mahabesar."},
        {title:"Pengolahan higienis", action:"qurban", note:"Jaga kebersihan tempat, alat, daging, dan petugas agar aman serta tidak mencemari lingkungan."},
        {title:"Pembagian daging", action:"qurban", note:"Bagikan secara tertib kepada yang berhak, tetangga, dan masyarakat dengan menjaga kehormatan penerima."},
      ],
    },
  ];

  function oldSimulationRoot(root) {
    const heading = $$("h1,h2,h3,h4,strong", root).find((node) => /simulasi ibadah terstruktur|panduan visual dan praktik|simulasi ibadah visual/i.test(clean(node.textContent)));
    if (!heading) return null;
    let section = heading.closest("section,article");
    if (!section) section = heading.parentElement;
    return section;
  }

  function simulationHost() {
    const islamic = $("#panel-islamic,[data-panel='islamic']");
    if (islamic) return islamic;
    const main = $("main");
    if (!main) return null;
    const text = clean(main.textContent).toLocaleLowerCase("id");
    return /simulasi ibadah|al qur'an|hisnul muslim|dzikir pagi/.test(text) ? main : null;
  }

  function buildWorshipBoard() {
    const host = simulationHost();
    if (!host) return;
    $("#v50-simulation-board", host)?.remove();
    let board = $("#v51-worship-board", host);
    if (board) return;

    const previous = oldSimulationRoot(host);
    if (previous) previous.classList.add("v51-retired-simulation");

    board = document.createElement("section");
    board.id = "v51-worship-board";
    board.className = "v51-worship-board";
    board.innerHTML = `
      <header class="v51-worship-head">
        <div><span>PANDUAN VISUAL DAN PRAKTIK</span><h2>Simulasi Ibadah Langkah demi Langkah</h2><p>Setiap gerakan disajikan berurutan dengan visual anak SMP, bacaan, arti ringkas, dan penjelasan praktik.</p></div>
        <div class="v51-worship-head-badge"><strong>100%</strong><small>tersedia luring</small></div>
      </header>
      <nav class="v51-worship-tabs" role="tablist" aria-label="Pilihan simulasi ibadah">
        ${WORSHIP.map((item,index) => `<button type="button" role="tab" data-v51-worship="${item.id}" aria-selected="${index === 0}">${item.label}</button>`).join("")}
      </nav>
      <div data-v51-worship-content></div>`;

    if (previous?.parentNode) previous.parentNode.insertBefore(board, previous);
    else host.prepend(board);

    const content = $("[data-v51-worship-content]", board);
    function render(item) {
      content.innerHTML = `
        <section class="v51-worship-intro"><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.intro)}</p></div><b>${item.steps.length} langkah</b></section>
        <div class="v51-worship-steps">
          ${item.steps.map((step) => `<article class="v51-worship-step">
            ${sceneSvg(step.action, step.title)}
            <div class="v51-step-copy"><h4>${escapeHtml(step.title)}</h4><p>${escapeHtml(step.note)}</p>
              <div class="v51-reading" ${step.arabic || step.latin ? "" : "hidden"}>
                ${step.arabic ? `<span class="arabic" lang="ar">${escapeHtml(step.arabic)}</span>` : ""}
                ${step.latin ? `<span class="latin">${escapeHtml(step.latin)}</span>` : ""}
                ${step.meaning ? `<span class="meaning">${escapeHtml(step.meaning)}</span>` : ""}
              </div>
            </div>
          </article>`).join("")}
        </div>`;
    }
    render(WORSHIP[0]);
    $$("[data-v51-worship]", board).forEach((button) => button.addEventListener("click", () => {
      const item = WORSHIP.find((entry) => entry.id === button.dataset.v51Worship);
      if (!item) return;
      $$("[data-v51-worship]", board).forEach((entry) => entry.setAttribute("aria-selected", String(entry === button)));
      render(item);
      board.scrollIntoView({behavior:"smooth", block:"start"});
    }));
  }

  function runRepairs(root = document) {
    repairAccessPanel(root);
    horizontalizeIslamicNavigation();
    suppressLocalWarnings(root);
    buildWorshipBoard();
    ensureLiveStats();
  }

  function scheduleRepairs(root = document) {
    clearTimeout(observerTimer);
    observerTimer = setTimeout(() => runRepairs(root), 70);
  }

  function initRealtime() {
    ensureLiveStats();
    setRealtimeState("loading");
    sendActivity("session-start");
    flushQueue();
    refreshSnapshot();

    window.addEventListener("online", () => { sendActivity("online"); flushQueue(); refreshSnapshot(); });
    window.addEventListener("offline", () => setRealtimeState("retry"));
    window.addEventListener("pagehide", () => {
      const record = activityRecord("pagehide");
      postActivity(record, true).catch(() => { const items = queue(); items.push(record); saveQueue(items); });
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") sendActivity("kembali-aktif");
    });
    setInterval(() => {
      if (document.visibilityState === "visible") sendActivity("heartbeat");
      flushQueue();
    }, 60000);
  }

  function init() {
    document.documentElement.dataset.paibpFinal = VERSION;
    runRepairs();
    initRealtime();

    const observer = new MutationObserver((mutations) => {
      const root = mutations.find((item) => item.addedNodes.length)?.target || document;
      scheduleRepairs(root.closest?.("main,.workspace-panel,.hero-access-panel,.teacher-panel-v29") || document);
    });
    observer.observe(document.body, {childList:true, subtree:true});
    window.addEventListener("pageshow", () => runRepairs());

    window.PAIBP_FINAL_V51 = Object.freeze({
      version:VERSION,
      refreshStats:refreshSnapshot,
      sendActivity,
      rebuildSimulation:buildWorshipBoard,
      lastSnapshot:() => lastSnapshot,
      realtimeState:() => realtimeState,
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
})();
