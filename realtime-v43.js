(() => {
  "use strict";

  const VERSION = "43";
  const CONFIG = window.PAIBP_CONFIG || {};
  const ENDPOINT = String(CONFIG.syncEndpoint || CONFIG.realtimeV43Endpoint || "").trim();
  const READ_KEY = String(CONFIG.syncReadKey || CONFIG.realtimeV43ReadKey || "").trim();
  const ENABLED = CONFIG.realtimeEnabled !== false;
  const CONFIGURED = ENABLED && /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(ENDPOINT);

  const STORAGE = {
    session: "paibp-smart-realtime-session-v43",
    queue: "paibp-smart-realtime-queue-v43",
    location: "paibp-smart-location-v43",
    accessContext: "paibp-smart-access-context-v1",
    teacher: "paibp-smart-teacher-identity-v1",
    student: "paibp-smart-student-identity-v1",
    progress: "paibp-smart-progress-v3",
    work: "paibp-smart-student-work-v1",
    submissions: "paibp-smart-submission-recap-v1",
    gallery: "paibp-smart-gallery-v1",
    feedback: "paibp-smart-feedback-v1",
    homepage: "paibp-smart-homepage-copy-v1",
    editorUnlocked: "paibp-smart-editor-unlocked",
    lastSubmission: "paibp-smart-last-realtime-submission-v43",
    lastFeedback: "paibp-smart-last-realtime-feedback-v43",
    lastEditorFingerprints: "paibp-smart-editor-fingerprints-v43",
  };

  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const nowIso = () => new Date().toISOString();
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[character]);
  const parse = (value, fallback = null) => {
    try { return JSON.parse(value); } catch { return fallback; }
  };
  const readLocal = (key, fallback = null) => parse(localStorage.getItem(key), fallback);
  const writeLocal = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  };
  const normalize = (value) => String(value || "")
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("id").replace(/[^a-z0-9]+/g, " ").trim();
  const textOf = (element) => String(element?.textContent || "").replace(/\s+/g, " ").trim();
  const deviceLabel = () => {
    const ua = navigator.userAgent || "";
    if (/android/i.test(ua)) return "Android";
    if (/iphone|ipad|ipod/i.test(ua)) return "iPhone/iPad";
    if (/windows/i.test(ua)) return "Windows";
    if (/macintosh|mac os/i.test(ua)) return "macOS";
    if (/linux/i.test(ua)) return "Linux";
    return "Perangkat lain";
  };
  const hashString = (value) => {
    let hash = 2166136261;
    for (const character of String(value || "")) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  };
  const fingerprint = (value) => hashString(typeof value === "string" ? value : JSON.stringify(value ?? null));

  function sessionId() {
    let value = sessionStorage.getItem(STORAGE.session);
    if (!value) {
      value = `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
      try { sessionStorage.setItem(STORAGE.session, value); } catch {}
    }
    return value;
  }

  function teacherIdentity() {
    const source = readLocal(STORAGE.teacher, {}) || {};
    return {
      name: source.name || source.teacherName || "",
      school: source.workUnit || source.school || source.teacherSchool || "",
      nip: source.nip || "",
      recognized: Boolean(source.teacherRecognized),
    };
  }

  function studentIdentity() {
    const source = readLocal(STORAGE.student, {}) || {};
    return {
      name: source.name || source.studentName || "",
      school: source.school || source.studentSchool || "",
      className: source.className || source.class || source.grade || source.studentClass || "",
      number: source.number || source.absen || source.studentNumber || "",
    };
  }

  function deterministicTeacherScope(identity = teacherIdentity()) {
    const basis = `${normalize(identity.name)}|${normalize(identity.school)}`;
    return basis === "|" ? "" : `guru-${hashString(basis)}`;
  }

  function readAccessContext() {
    const value = readLocal(STORAGE.accessContext, {}) || {};
    return {
      teacherName: value.teacherName || value.name || "",
      teacherSchool: value.teacherSchool || value.school || value.workUnit || "",
      teacherScope: value.teacherScope || value.scope || "",
      receivedAt: value.receivedAt || "",
    };
  }

  function captureSharedTeacherContext() {
    const url = new URL(location.href);
    const teacherName = url.searchParams.get("ps_teacher") || "";
    const teacherSchool = url.searchParams.get("ps_school") || "";
    const suppliedScope = url.searchParams.get("ps_scope") || "";
    if (!teacherName && !teacherSchool && !suppliedScope) return;
    const teacherScope = suppliedScope || `guru-${hashString(`${normalize(teacherName)}|${normalize(teacherSchool)}`)}`;
    writeLocal(STORAGE.accessContext, {
      teacherName: teacherName.slice(0, 160),
      teacherSchool: teacherSchool.slice(0, 220),
      teacherScope: teacherScope.slice(0, 100),
      receivedAt: nowIso(),
    });
  }

  function currentRole() {
    const fileName = (location.pathname.split("/").pop() || "").toLowerCase();
    const ownerUnlocked = sessionStorage.getItem(STORAGE.editorUnlocked) === "true"
      || localStorage.getItem(STORAGE.editorUnlocked) === "true";
    if (fileName === "kendali-editor.html" || ownerUnlocked) return "editor";
    if (fileName === "akses-guru.html" || document.body?.dataset.portalRole === "guru") return "guru";
    if (document.body?.dataset.portalRole === "murid" || $("#panel-student:not([hidden])")) return "murid";
    return document.body?.dataset.portalRole || "umum";
  }

  function currentContext(trigger = null) {
    const activePanel = $(".workspace-panel:not([hidden])");
    const activeTeacherDoc = $('[data-teacher-doc][aria-pressed="true"]');
    const activeIslamic = $('[data-islamic-view][aria-pressed="true"]');
    const activeGrade = $('[data-teacher-grade][aria-pressed="true"], [data-grade][aria-pressed="true"]');
    const chapterElement = trigger?.closest?.("[data-chapter-id],[data-chapter],[data-material-id]")
      || $("[data-chapter-id].active,[data-chapter].active,[data-material-id].active");

    return {
      space: trigger?.dataset?.openPanel
        || activePanel?.dataset.panel
        || activePanel?.id
        || location.pathname.split("/").pop()
        || "beranda",
      chapter: trigger?.dataset?.chapterId
        || trigger?.dataset?.chapter
        || chapterElement?.dataset.chapterId
        || chapterElement?.dataset.chapter
        || chapterElement?.dataset.materialId
        || "",
      section: trigger?.dataset?.teacherDoc
        || trigger?.dataset?.islamicView
        || activeTeacherDoc?.dataset.teacherDoc
        || activeIslamic?.dataset.islamicView
        || activeGrade?.dataset.teacherGrade
        || activeGrade?.dataset.grade
        || "",
    };
  }

  function locationState() {
    return readLocal(STORAGE.location, {}) || {};
  }

  function baseRecord(extra = {}) {
    const role = extra.role || currentRole();
    const teacher = teacherIdentity();
    const student = studentIdentity();
    const context = readAccessContext();
    const locationInfo = locationState();
    const identity = role === "guru" || role === "editor" ? teacher : student;

    return {
      id: extra.id || `e-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
      sessionId: sessionId(),
      role,
      userName: extra.userName || identity.name || "",
      school: extra.school || identity.school || "",
      nip: role === "guru" || role === "editor" ? teacher.nip : "",
      studentClass: extra.studentClass || student.className || "",
      studentNumber: extra.studentNumber || student.number || "",
      teacherName: extra.teacherName || context.teacherName || (role === "guru" ? teacher.name : ""),
      teacherSchool: extra.teacherSchool || context.teacherSchool || (role === "guru" ? teacher.school : ""),
      teacherScope: extra.teacherScope || context.teacherScope || (role === "guru" ? deterministicTeacherScope(teacher) : ""),
      action: extra.action || "view",
      space: extra.space || "",
      chapter: extra.chapter || "",
      section: extra.section || "",
      durationSeconds: Number(extra.durationSeconds || 0),
      latitude: locationInfo.latitude ?? "",
      longitude: locationInfo.longitude ?? "",
      locationName: locationInfo.locationName || "",
      device: deviceLabel(),
      userAgent: navigator.userAgent || "",
      online: navigator.onLine,
      referrer: document.referrer || "",
      pageUrl: location.href,
      origin: location.origin,
      appVersion: VERSION,
    };
  }

  function queueItems() {
    const value = readLocal(STORAGE.queue, []);
    return Array.isArray(value) ? value : [];
  }

  function saveQueue(items) {
    writeLocal(STORAGE.queue, items.slice(-180));
  }

  function enqueue(action, data, options = {}) {
    const record = {
      queueId: `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: nowIso(),
      action,
      data,
      needsReadKey: Boolean(options.needsReadKey),
    };
    const items = queueItems();
    items.push(record);
    saveQueue(items);
    if (CONFIGURED && navigator.onLine) flushQueue();
    updateSyncIndicators();
    return record;
  }

  async function postRecord(item) {
    if (!CONFIGURED) throw new Error("Integrasi belum dikonfigurasi.");
    const payload = {
      app: "paibp-smart",
      version: VERSION,
      action: item.action,
      data: item.data,
      origin: location.origin,
    };
    if (item.needsReadKey) payload.readKey = READ_KEY;

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 14000);
    try {
      await fetch(ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        cache: "no-store",
        keepalive: JSON.stringify(payload).length < 60000,
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      return true;
    } finally {
      window.clearTimeout(timer);
    }
  }

  let flushing = false;
  async function flushQueue() {
    if (flushing || !CONFIGURED || !navigator.onLine) return;
    flushing = true;
    try {
      let items = queueItems();
      while (items.length && navigator.onLine) {
        const item = items[0];
        try {
          await postRecord(item);
          items.shift();
          saveQueue(items);
        } catch {
          break;
        }
      }
    } finally {
      flushing = false;
      updateSyncIndicators();
    }
  }

  function beaconRecord(action, data) {
    if (!CONFIGURED || !navigator.sendBeacon) {
      enqueue(action, data);
      return;
    }
    const payload = JSON.stringify({
      app: "paibp-smart",
      version: VERSION,
      action,
      data,
      origin: location.origin,
    });
    try {
      const sent = navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: "text/plain;charset=UTF-8" }));
      if (!sent) enqueue(action, data);
    } catch {
      enqueue(action, data);
    }
  }

  function jsonp(action, params = {}, timeout = 18000) {
    if (!CONFIGURED) return Promise.reject(new Error("Integrasi belum dikonfigurasi."));
    return new Promise((resolve, reject) => {
      const callbackName = `__paibpV43_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      const script = document.createElement("script");
      const url = new URL(ENDPOINT);
      url.searchParams.set("action", action);
      url.searchParams.set("callback", callbackName);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== "" && value != null) url.searchParams.set(key, String(value));
      });
      const cleanup = () => {
        window.clearTimeout(timer);
        script.remove();
        try { delete window[callbackName]; } catch { window[callbackName] = undefined; }
      };
      const timer = window.setTimeout(() => {
        cleanup();
        reject(new Error("Server tidak merespons."));
      }, timeout);
      window[callbackName] = (payload) => {
        cleanup();
        if (payload?.ok === false) reject(new Error(payload.error || "Permintaan gagal."));
        else resolve(payload);
      };
      script.onerror = () => {
        cleanup();
        reject(new Error("Sambungan ke Google Apps Script gagal."));
      };
      script.src = url.href;
      script.async = true;
      document.head.append(script);
    });
  }

  let activeSegment = {
    startedAt: Date.now(),
    ...currentContext(),
  };

  function closeActiveSegment(action = "duration") {
    const durationSeconds = Math.round((Date.now() - activeSegment.startedAt) / 1000);
    if (durationSeconds < 3) return;
    const record = baseRecord({
      action,
      space: activeSegment.space,
      chapter: activeSegment.chapter,
      section: activeSegment.section,
      durationSeconds: clamp(durationSeconds, 0, 3600),
    });
    if (document.visibilityState === "hidden") beaconRecord("activity", record);
    else enqueue("activity", record);
    activeSegment.startedAt = Date.now();
  }

  function switchSegment(trigger, action = "open") {
    closeActiveSegment("duration");
    activeSegment = {
      startedAt: Date.now(),
      ...currentContext(trigger),
    };
    enqueue("activity", baseRecord({ action, ...activeSegment }));
  }

  function recordSessionStart() {
    enqueue("activity", baseRecord({
      action: "session-start",
      ...currentContext(),
    }));
  }

  let locationRequested = false;
  function ensureLocationNotice() {
    const panel = $("#panel-student");
    if (!panel || $(".v43-location-notice", panel)) return;
    const notice = document.createElement("aside");
    notice.className = "v43-location-notice";
    notice.innerHTML = `
      <span aria-hidden="true">⌖</span>
      <div><strong>Privasi lokasi perkiraan</strong>
      <p>Saat Ruang Murid dibuka, browser dapat meminta izin lokasi. Koordinat dibulatkan tiga angka desimal dan dipakai hanya untuk rekap operasional guru. Tidak ada pelacakan terus-menerus.</p></div>`;
    const heading = $(".panel-heading", panel);
    heading?.insertAdjacentElement("afterend", notice);
  }

  function requestStudentLocation() {
    if (locationRequested || !navigator.geolocation || currentRole() !== "murid") return;
    locationRequested = true;
    const previous = locationState();
    const age = Date.now() - new Date(previous.updatedAt || 0).getTime();
    if (previous.permission === "granted" && age < 24 * 60 * 60 * 1000) return;
    if (previous.permission === "denied" && age < 7 * 24 * 60 * 60 * 1000) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const value = {
          permission: "granted",
          latitude: Number(position.coords.latitude.toFixed(3)),
          longitude: Number(position.coords.longitude.toFixed(3)),
          accuracy: Math.round(position.coords.accuracy || 0),
          locationName: "",
          updatedAt: nowIso(),
        };
        writeLocal(STORAGE.location, value);
        enqueue("activity", baseRecord({
          action: "location-consented",
          space: "Ruang Murid",
        }));
      },
      (error) => {
        writeLocal(STORAGE.location, {
          permission: error.code === 1 ? "denied" : "unavailable",
          updatedAt: nowIso(),
        });
        enqueue("activity", baseRecord({
          action: error.code === 1 ? "location-denied" : "location-unavailable",
          space: "Ruang Murid",
        }));
      },
      { enableHighAccuracy: false, timeout: 9000, maximumAge: 24 * 60 * 60 * 1000 },
    );
  }

  function latestValue(value) {
    if (Array.isArray(value)) return value[value.length - 1] || null;
    if (value && Array.isArray(value.items)) return value.items[value.items.length - 1] || value;
    if (value && Array.isArray(value.records)) return value.records[value.records.length - 1] || value;
    return value;
  }

  function limitedObject(value, maxChars = 250000) {
    const json = JSON.stringify(value ?? null);
    if (json.length <= maxChars) return value;
    return {
      truncated: true,
      originalSize: json.length,
      preview: json.slice(0, maxChars),
    };
  }

  function detectCurrentChapter() {
    const selected = $("[data-chapter-id].active,[data-chapter].active,[data-material-id].active")
      || $(".chapter-card[aria-current='true'], .lesson-card[aria-current='true']");
    return {
      id: selected?.dataset.chapterId || selected?.dataset.chapter || selected?.dataset.materialId || "",
      title: textOf($("h3,h4,h5,strong", selected)) || textOf($("#lesson-title,.lesson-title,.chapter-title")),
    };
  }

  function sendLatestSubmission() {
    const identity = studentIdentity();
    const context = readAccessContext();
    const chapter = detectCurrentChapter();
    const submissions = readLocal(STORAGE.submissions, []);
    const work = readLocal(STORAGE.work, {});
    const progress = readLocal(STORAGE.progress, {});
    const latest = latestValue(submissions);
    const payload = limitedObject({ latest, work, progress }, 300000);
    const marker = fingerprint({ identity, context, chapter, latest, work });
    if (localStorage.getItem(STORAGE.lastSubmission) === marker) return;
    localStorage.setItem(STORAGE.lastSubmission, marker);

    enqueue("submission", {
      id: `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      sessionId: sessionId(),
      studentName: identity.name,
      studentClass: identity.className,
      studentNumber: identity.number,
      school: identity.school,
      teacherName: context.teacherName,
      teacherSchool: context.teacherSchool,
      teacherScope: context.teacherScope,
      chapterId: latest?.chapterId || latest?.chapter || chapter.id,
      chapterTitle: latest?.chapterTitle || latest?.title || chapter.title,
      exerciseScore: latest?.score ?? latest?.exerciseScore ?? "",
      payload,
      device: deviceLabel(),
      pageUrl: location.href,
      appVersion: VERSION,
    });
  }

  function sendLatestFeedback() {
    const stored = readLocal(STORAGE.feedback, []);
    const latest = latestValue(stored);
    if (!latest) return;
    const marker = fingerprint(latest);
    if (localStorage.getItem(STORAGE.lastFeedback) === marker) return;
    localStorage.setItem(STORAGE.lastFeedback, marker);
    const identity = currentRole() === "guru" ? teacherIdentity() : studentIdentity();
    enqueue("feedback", {
      id: latest.id || `f-${Date.now().toString(36)}`,
      sessionId: sessionId(),
      name: latest.name || identity.name || "Pengunjung",
      role: latest.role || currentRole(),
      school: latest.school || identity.school || "",
      rating: latest.rating || latest.stars || 0,
      comment: latest.comment || latest.message || latest.text || "",
      pageUrl: location.href,
    });
  }

  async function compressImageDataUrl(dataUrl, maxWidth = 1600, quality = 0.82) {
    if (!/^data:image\//i.test(String(dataUrl || ""))) return dataUrl || "";
    if (String(dataUrl).length < 800000) return dataUrl;
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        const ratio = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * ratio));
        canvas.height = Math.max(1, Math.round(image.height * ratio));
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      image.onerror = () => resolve(dataUrl);
      image.src = dataUrl;
    });
  }

  async function syncGallery(value) {
    if (!isEditorUnlocked() || !READ_KEY) return;
    const items = Array.isArray(value) ? value : value?.items || value?.news || [];
    for (const raw of items.slice(-80)) {
      const image = raw.imageDataUrl || raw.image || raw.photo || raw.dataUrl || "";
      const imageDataUrl = /^data:image\//i.test(image) ? await compressImageDataUrl(image) : "";
      enqueue("newsUpsert", {
        id: raw.id || `news-${hashString(`${raw.title}|${raw.date}|${raw.summary}`)}`,
        title: raw.title || raw.name || "Kegiatan Spensus",
        date: raw.date || raw.eventDate || nowIso().slice(0, 10),
        summary: raw.summary || raw.description || raw.text || "",
        imageDataUrl,
        imageUrl: imageDataUrl ? "" : image,
        authorName: teacherIdentity().name,
        authorSchool: teacherIdentity().school,
        isPublished: raw.isPublished !== false,
        sortOrder: raw.sortOrder || 0,
      }, { needsReadKey: true });
    }
  }

  function syncHomepage(value) {
    if (!isEditorUnlocked() || !READ_KEY) return;
    enqueue("contentUpsert", {
      key: "homepage",
      value,
      authorName: teacherIdentity().name,
      authorSchool: teacherIdentity().school,
    }, { needsReadKey: true });
  }

  function isEditorUnlocked() {
    const fileName = (location.pathname.split("/").pop() || "").toLowerCase();
    return fileName === "kendali-editor.html"
      || sessionStorage.getItem(STORAGE.editorUnlocked) === "true"
      || localStorage.getItem(STORAGE.editorUnlocked) === "true";
  }

  const watchedKeys = [STORAGE.gallery, STORAGE.feedback, STORAGE.homepage];
  let editorFingerprints = readLocal(STORAGE.lastEditorFingerprints, {}) || {};
  function pollStorageSync() {
    watchedKeys.forEach((key) => {
      const raw = localStorage.getItem(key) || "";
      const next = fingerprint(raw);
      if (!editorFingerprints[key]) {
        editorFingerprints[key] = next;
        return;
      }
      if (editorFingerprints[key] === next) return;
      editorFingerprints[key] = next;
      const value = parse(raw, null);
      if (key === STORAGE.gallery) syncGallery(value);
      else if (key === STORAGE.feedback) sendLatestFeedback();
      else if (key === STORAGE.homepage) syncHomepage(value);
    });
    writeLocal(STORAGE.lastEditorFingerprints, editorFingerprints);
  }

  function shareClassLink() {
    const identity = teacherIdentity();
    if (!identity.name || !identity.school) {
      showToast("Isi identitas guru dan unit kerja terlebih dahulu.", "warning");
      return;
    }
    const scope = deterministicTeacherScope(identity);
    const url = new URL("index.html", document.baseURI);
    url.searchParams.set("ps_teacher", identity.name);
    url.searchParams.set("ps_school", identity.school);
    url.searchParams.set("ps_scope", scope);
    const value = url.href;
    navigator.clipboard?.writeText(value).then(
      () => showToast("Link kelas berhasil disalin. Murid yang masuk melalui link ini berada pada rekap guru tersebut.", "success"),
      () => window.prompt("Salin link kelas berikut:", value),
    );
  }

  function ensureTeacherToolbar() {
    const toolbar = $(".teacher-toolbar");
    if (!toolbar || $("#v43-copy-class-link", toolbar)) return;
    const button = document.createElement("button");
    button.type = "button";
    button.id = "v43-copy-class-link";
    button.className = "btn btn-compact v43-class-link-button";
    button.textContent = "Salin Link Kelas";
    button.addEventListener("click", shareClassLink);
    toolbar.prepend(button);

    const status = document.createElement("span");
    status.className = "v43-sync-badge";
    status.dataset.v43SyncBadge = "";
    toolbar.append(status);
    updateSyncIndicators();
  }

  function statusLabel() {
    if (!ENABLED) return ["nonaktif", "Sinkronisasi dinonaktifkan"];
    if (!CONFIGURED) return ["local", "Mode lokal — Google Apps Script belum dihubungkan"];
    if (!navigator.onLine) return ["offline", `Luring — ${queueItems().length} data menunggu`];
    if (queueItems().length) return ["pending", `${queueItems().length} data sedang disinkronkan`];
    return ["online", "Rekap lintas perangkat aktif"];
  }

  function updateSyncIndicators() {
    const [tone, label] = statusLabel();
    $$("[data-v43-sync-badge]").forEach((element) => {
      element.dataset.tone = tone;
      element.textContent = label;
      element.title = label;
    });
  }

  function ensureRealtimePanel(kind) {
    const container = $("#teacher-document");
    if (!container) return null;
    let panel = $(`.v43-realtime-panel[data-kind="${kind}"]`, container);
    if (panel) return panel;

    panel = document.createElement("section");
    panel.className = "v43-realtime-panel";
    panel.dataset.kind = kind;
    panel.innerHTML = `
      <header>
        <div><span>REKAP LINTAS PERANGKAT</span>
        <h3>${kind === "access" ? "Aktivitas Murid Daring" : "Pekerjaan Murid Daring"}</h3>
        <p>${kind === "access"
          ? "Memuat aktivitas murid yang masuk melalui link kelas guru ini."
          : "Memuat paket latihan, LKPD, refleksi, dan ringkasan yang dikirim kepada guru."}</p></div>
        <div class="v43-panel-actions">
          <button type="button" data-v43-reload>${kind === "access" ? "Muat Ulang Rekap" : "Muat Tugas Daring"}</button>
          <button type="button" data-v43-csv>Unduh CSV</button>
        </div>
      </header>
      <div class="v43-realtime-state" data-v43-state></div>
      <div class="v43-table-wrap" data-v43-table></div>`;
    container.append(panel);
    $("[data-v43-reload]", panel).addEventListener("click", () => loadRealtimePanel(panel, kind));
    $("[data-v43-csv]", panel).addEventListener("click", () => downloadPanelCsv(panel, kind));
    loadRealtimePanel(panel, kind);
    return panel;
  }

  async function loadRealtimePanel(panel, kind) {
    const state = $("[data-v43-state]", panel);
    const table = $("[data-v43-table]", panel);
    if (!CONFIGURED) {
      state.innerHTML = `<strong>Integrasi belum aktif.</strong><p>Deploy <code>google-apps-script/Code.gs</code>, lalu isi <code>syncEndpoint</code> dan <code>syncReadKey</code> pada <code>app-config.js</code>.</p>`;
      table.innerHTML = "";
      return;
    }
    if (!READ_KEY) {
      state.innerHTML = `<strong>syncReadKey belum diisi.</strong><p>Salin readKey hasil fungsi <code>setup()</code> ke <code>app-config.js</code>.</p>`;
      return;
    }
    state.innerHTML = `<span class="v43-loader"></span><strong>Memuat data lintas perangkat…</strong>`;
    table.innerHTML = "";
    try {
      const identity = teacherIdentity();
      const scope = deterministicTeacherScope(identity);
      const params = {
        readKey: READ_KEY,
        teacherScope: scope,
        limit: kind === "access" ? 1000 : 500,
      };
      if (kind === "submissions") {
        params.teacherName = identity.name;
        params.teacherSchool = identity.school;
      }
      const response = await jsonp(kind === "access" ? "activities" : "submissions", params);
      const rows = kind === "access"
        ? (response.activities || response.records || [])
        : (response.submissions || response.records || []);
      panel._v43Rows = rows;
      renderRealtimeTable(table, rows, kind);
      state.innerHTML = `<strong>${rows.length} data berhasil dimuat.</strong><p>Diperbarui ${new Date().toLocaleString("id-ID")}.</p>`;
    } catch (error) {
      state.innerHTML = `<strong>Rekap gagal dimuat.</strong><p>${escapeHtml(error.message || String(error))}</p>`;
    }
  }

  function formatDateTime(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value || "—") : date.toLocaleString("id-ID");
  }

  function renderRealtimeTable(container, rows, kind) {
    if (!rows.length) {
      container.innerHTML = `<div class="v43-empty"><strong>Belum ada data.</strong><p>Bagikan Link Kelas kepada murid, lalu minta mereka membuka materi atau mengirim pekerjaan.</p></div>`;
      return;
    }
    if (kind === "access") {
      container.innerHTML = `
        <table><thead><tr><th>Waktu</th><th>Nama</th><th>Kelas</th><th>Aktivitas</th><th>Durasi</th><th>Tempat</th><th>Perangkat</th></tr></thead>
        <tbody>${rows.map((row) => `<tr>
          <td>${escapeHtml(formatDateTime(row.timestamp))}</td>
          <td><strong>${escapeHtml(row.userName || "Pengunjung")}</strong><small>${escapeHtml(row.school || "")}</small></td>
          <td>${escapeHtml(row.studentClass || "—")}</td>
          <td><strong>${escapeHtml(row.action || "view")}</strong><small>${escapeHtml([row.space, row.chapter, row.section].filter(Boolean).join(" • "))}</small></td>
          <td>${escapeHtml(row.durationSeconds ? `${row.durationSeconds} dtk` : "—")}</td>
          <td>${escapeHtml(row.locationName || ([row.latitude, row.longitude].filter(Boolean).join(", ")) || "Tidak dibagikan")}</td>
          <td>${escapeHtml(row.device || "—")}</td>
        </tr>`).join("")}</tbody></table>`;
    } else {
      container.innerHTML = `
        <table><thead><tr><th>Waktu</th><th>Murid</th><th>Kelas</th><th>Bab</th><th>Skor</th><th>Status</th></tr></thead>
        <tbody>${rows.map((row) => `<tr>
          <td>${escapeHtml(formatDateTime(row.timestamp))}</td>
          <td><strong>${escapeHtml(row.studentName || "Murid")}</strong><small>${escapeHtml(row.school || "")}</small></td>
          <td>${escapeHtml([row.studentClass, row.studentNumber ? `No. ${row.studentNumber}` : ""].filter(Boolean).join(" • ") || "—")}</td>
          <td><strong>${escapeHtml(row.chapterTitle || row.chapterId || "—")}</strong><small>${escapeHtml(row.chapterId || "")}</small></td>
          <td>${escapeHtml(row.exerciseScore || "—")}</td>
          <td><span class="v43-status-pill">${escapeHtml(row.status || "terkirim")}</span></td>
        </tr>`).join("")}</tbody></table>`;
    }
  }

  function csvEscape(value) {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  }

  function downloadPanelCsv(panel, kind) {
    const rows = Array.isArray(panel._v43Rows) ? panel._v43Rows : [];
    if (!rows.length) {
      showToast("Belum ada data untuk diunduh.", "warning");
      return;
    }
    const columns = kind === "access"
      ? ["timestamp","userName","school","studentClass","studentNumber","action","space","chapter","section","durationSeconds","locationName","latitude","longitude","device"]
      : ["timestamp","studentName","school","studentClass","studentNumber","chapterId","chapterTitle","exerciseScore","status","payloadSize"];
    const csv = "\uFEFF" + [
      columns.map(csvEscape).join(","),
      ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(",")),
    ].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${kind === "access" ? "rekap-akses-murid" : "rekap-pekerjaan-murid"}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function activeTeacherDocumentKind() {
    const button = $('[data-teacher-doc][aria-pressed="true"]');
    return button?.dataset.teacherDoc || "";
  }

  let teacherRenderTimer = 0;
  function scheduleTeacherRealtimePanel() {
    clearTimeout(teacherRenderTimer);
    teacherRenderTimer = window.setTimeout(() => {
      const kind = activeTeacherDocumentKind();
      if (kind === "access" || kind === "submissions") ensureRealtimePanel(kind);
    }, 100);
  }

  function applyPublicSnapshot(snapshot) {
    if (!snapshot) return;
    applyPublicStats(snapshot.stats || {});
    applyLatestTeachers(snapshot.latestTeachers || []);
    applyRemoteNews(snapshot.news || []);
    applyRemoteContent(snapshot.content || {});
  }

  function applyPublicStats(stats) {
    const hero = $(".hero-metrics-v25");
    if (!hero) return;
    let live = $(".v43-live-stat", hero);
    if (!live) {
      live = document.createElement("article");
      live.className = "v43-live-stat";
      live.innerHTML = `<strong data-v43-today>0</strong><span>Kunjungan hari ini</span><small data-v43-online>0 aktif sekarang</small>`;
      hero.append(live);
    }
    $("[data-v43-today]", live).textContent = Number(stats.todaySessions || 0).toLocaleString("id-ID");
    $("[data-v43-online]", live).textContent = `${Number(stats.onlineNow || 0).toLocaleString("id-ID")} aktif sekarang`;
  }

  function applyLatestTeachers(teachers) {
    if (!document.body || !$(".hero")) return;
    let section = $("#v43-latest-teachers");
    if (!section) {
      section = document.createElement("section");
      section.id = "v43-latest-teachers";
      section.className = "v43-latest-teachers";
      $(".hero")?.insertAdjacentElement("afterend", section);
    }
    const safeTeachers = teachers.slice(0, 12);
    section.innerHTML = `
      <div class="container">
        <header><div><span>TAMU GURU TERKINI</span><h2>Guru yang baru mengakses PAIBP SMART SMP</h2></div>
        <small>NIP tidak pernah ditampilkan pada halaman publik.</small></header>
        <div class="v43-teacher-strip">${safeTeachers.length
          ? safeTeachers.map((teacher) => `<article><span>${escapeHtml((teacher.name || "G").slice(0, 1).toUpperCase())}</span><div><strong>${escapeHtml(teacher.name || "Guru")}</strong><small>${escapeHtml(teacher.school || "Unit kerja tidak dicantumkan")}</small></div></article>`).join("")
          : `<p>Belum ada tamu guru daring yang tercatat.</p>`}</div>
      </div>`;
  }

  function applyRemoteNews(news) {
    const gallery = $("#news-gallery");
    if (!gallery || !news.length) return;
    gallery.dataset.remoteSynced = "true";
    gallery.innerHTML = news.slice(0, 24).map((item) => `
      <article class="news-card v43-remote-news">
        ${item.imageUrl ? `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.title || "Kegiatan Spensus")}" loading="lazy" referrerpolicy="no-referrer">` : ""}
        <div><span>${escapeHtml(item.date || "")}</span><h3>${escapeHtml(item.title || "Kegiatan Spensus")}</h3>
        <p>${escapeHtml(item.summary || "")}</p></div>
      </article>`).join("");
  }

  function applyRemoteContent(content) {
    const homepage = content.homepage;
    if (!homepage || typeof homepage !== "object") return;
    const heading = $(".hero-main-v25 h1");
    const copy = $(".hero-main-v25 .hero-copy");
    if (heading && homepage.title) heading.textContent = homepage.title;
    if (copy && homepage.copy) copy.textContent = homepage.copy;
  }

  async function loadPublicSnapshot() {
    if (!CONFIGURED || !navigator.onLine) return;
    try {
      const snapshot = await jsonp("publicSnapshot", {}, 14000);
      applyPublicSnapshot(snapshot);
    } catch {}
  }

  function ensureEditorStatus() {
    if (!isEditorUnlocked() || $("#v43-editor-sync")) return;
    const main = $("#main") || document.body;
    const panel = document.createElement("section");
    panel.id = "v43-editor-sync";
    panel.className = "v43-editor-sync";
    panel.innerHTML = `
      <div><span>REKAP DARING V43</span><strong data-v43-sync-badge></strong>
      <p>Spensus Terkini, tanggapan, dan teks beranda disinkronkan setelah perubahan disimpan pada editor.</p></div>
      <button type="button" data-v43-test>Uji Sambungan</button>`;
    main.prepend(panel);
    $("[data-v43-test]", panel).addEventListener("click", async () => {
      const button = $("[data-v43-test]", panel);
      button.disabled = true;
      button.textContent = "Menguji…";
      try {
        const health = await jsonp("health");
        showToast(`Tersambung ke ${health.app || "server"} v${health.version || "43"}.`, "success");
      } catch (error) {
        showToast(error.message || "Sambungan gagal.", "error");
      } finally {
        button.disabled = false;
        button.textContent = "Uji Sambungan";
      }
    });
    updateSyncIndicators();
  }

  let toastTimer = 0;
  function showToast(message, tone = "info") {
    let toast = $("#v43-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "v43-toast";
      toast.className = "v43-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.append(toast);
    }
    toast.dataset.tone = tone;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 4200);
  }

  function handleClick(event) {
    const trigger = event.target.closest("button,a,[data-open-panel],[data-teacher-doc],[data-islamic-view],[data-chapter-id],[data-chapter]");
    if (!trigger) return;
    const label = textOf(trigger).slice(0, 180);

    if (trigger.matches("[data-open-panel]")) {
      const panel = trigger.dataset.openPanel;
      switchSegment(trigger, `buka-${panel || "ruang"}`);
      if (panel === "student") {
        ensureLocationNotice();
        setTimeout(requestStudentLocation, 500);
      }
    } else if (trigger.matches("[data-teacher-doc],[data-islamic-view],[data-chapter-id],[data-chapter]")) {
      switchSegment(trigger, "buka-bagian");
    }

    if (/kirim\s+(kepada\s+)?guru/i.test(label) || trigger.matches("[data-submit-student-work],#submit-student-work")) {
      setTimeout(sendLatestSubmission, 800);
    }
    if (/kirim.*(tanggapan|komentar|rating)|beri.*rating/i.test(label) || trigger.matches("[data-submit-feedback],#submit-feedback")) {
      setTimeout(sendLatestFeedback, 500);
    }
    if (trigger.matches("[data-teacher-doc]")) scheduleTeacherRealtimePanel();
  }

  function handleForms() {
    document.addEventListener("submit", (event) => {
      const form = event.target;
      const idClass = `${form.id || ""} ${form.className || ""}`;
      const text = textOf(form);
      if (/student|murid|lesson|worksheet|lkpd|exercise/i.test(idClass + " " + text)) {
        setTimeout(() => {
          if (/kirim.*guru/i.test(text) || form.querySelector("[data-submit-student-work]")) sendLatestSubmission();
        }, 800);
      }
      if (/feedback|rating|comment|tanggapan/i.test(idClass + " " + text)) {
        setTimeout(sendLatestFeedback, 500);
      }
      if (/teacher-access-form/i.test(form.id || "")) {
        setTimeout(() => {
          ensureTeacherToolbar();
          enqueue("activity", baseRecord({ role: "guru", action: "guru-login", space: "Portal Guru" }));
        }, 250);
      }
    }, true);
  }

  function ensureSelfCache() {
    if (!("caches" in window) || !navigator.onLine) return;
    const assets = [
      new URL("realtime-v43.js?v=43", document.baseURI).href,
      new URL("realtime-v43.css?v=43", document.baseURI).href,
    ];
    caches.open("paibp-smart-realtime-v43").then((cache) => cache.addAll(assets)).catch(() => {});
  }

  function initializeObservers() {
    const teacherDocument = $("#teacher-document");
    if (teacherDocument) {
      new MutationObserver(scheduleTeacherRealtimePanel).observe(teacherDocument, { childList: true });
    }
    const teacherMenu = $(".teacher-doc-menu");
    teacherMenu?.addEventListener("click", scheduleTeacherRealtimePanel);
  }

  function initialize() {
    captureSharedTeacherContext();
    ensureLocationNotice();
    ensureTeacherToolbar();
    ensureEditorStatus();
    initializeObservers();
    handleForms();
    document.addEventListener("click", handleClick, true);

    window.addEventListener("online", () => {
      updateSyncIndicators();
      flushQueue();
      loadPublicSnapshot();
    });
    window.addEventListener("offline", updateSyncIndicators);
    window.addEventListener("pagehide", () => closeActiveSegment("pagehide"));
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") closeActiveSegment("hidden");
      else activeSegment.startedAt = Date.now();
    });

    recordSessionStart();
    updateSyncIndicators();
    flushQueue();
    loadPublicSnapshot();
    ensureSelfCache();
    scheduleTeacherRealtimePanel();

    window.setInterval(() => {
      if (document.visibilityState === "visible") closeActiveSegment("heartbeat");
      flushQueue();
      pollStorageSync();
    }, 45000);
    window.setInterval(pollStorageSync, 2500);
    window.setInterval(loadPublicSnapshot, 180000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }

  window.PAIBP_REALTIME_V43 = Object.freeze({
    version: VERSION,
    configured: CONFIGURED,
    flush: flushQueue,
    loadPublicSnapshot,
    shareClassLink,
  });
})();
