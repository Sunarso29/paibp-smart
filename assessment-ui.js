(() => {
  "use strict";

  const bank = window.PAIBP_ASSESSMENT_BANK;
  if (!bank) return;

  const ACTIVE_KEY = "paibp-active-assessment-v4";
  const RESULT_KEY = "paibp-assessment-results-v4";
  const CONFIG_KEY = "paibp-assessment-config-v4";
  const STUDENT_PROGRESS_PREFIX = "paibp-exam-progress-v4";
  const isStudentExamMode = new URLSearchParams(location.search).has("ujian");

  const defaultConfig = {
    school: "SMP Negeri 1 Susukan",
    schoolAddress: "Alamat: ........................................................................................................................",
    subject: "Pendidikan Agama Islam dan Budi Pekerti",
    dayDate: "........................................................................................................................",
    time: "........................................................................................................................",
    duration: "120 menit",
    durationMinutes: "120",
    room: "........................................................................................................................",
    year: "2026/2027",
    code: "PAIBP2026",
    examId: "VIII-PTS-GASAL",
    seed: "paket-a",
    logoData: "",
  };

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  }[character]));
  const safeJson = (text, fallback) => { try { return JSON.parse(text); } catch { return fallback; } };
  const loadConfig = () => ({ ...defaultConfig, ...safeJson(localStorage.getItem(CONFIG_KEY), {}) });
  const saveConfig = (config) => localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  const loadResults = () => safeJson(localStorage.getItem(RESULT_KEY), []);
  const saveResults = (items) => localStorage.setItem(RESULT_KEY, JSON.stringify(items));
  const slug = (value) => String(value || "dokumen").toLocaleLowerCase("id").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  function stableHash(value) {
    let hash = 2166136261;
    for (const character of String(value)) { hash ^= character.charCodeAt(0); hash = Math.imul(hash, 16777619); }
    return (hash >>> 0).toString(36);
  }
  function hashAccessCode(code, examId, seed) { return stableHash(`paibp-smart-v22|${String(code).trim()}|${examId}|${seed}`); }
  function encodeBase64Url(value) {
    const bytes = new TextEncoder().encode(JSON.stringify(value));
    let binary = ""; bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  }
  function decodeBase64Url(value) {
    try {
      const normalized = String(value || "").replaceAll("-", "+").replaceAll("_", "/");
      const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
      const binary = atob(padded);
      return JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, (character) => character.charCodeAt(0))));
    } catch { return null; }
  }
  function htmlToText(html) {
    const holder = document.createElement("div"); holder.innerHTML = String(html || "");
    return String(holder.innerText || holder.textContent || "").replace(/\s+/g, " ").trim();
  }

  function stimulusTextForDocument(html) {
    const holder = document.createElement("div");
    holder.innerHTML = String(html || "");
    const arabic = String(holder.querySelector(".exam-arabic")?.textContent || "").trim();
    const label = String(holder.querySelector("small")?.textContent || "").trim();
    if (arabic) return [arabic, label].filter(Boolean).join("\n");
    return String(holder.innerText || holder.textContent || "").replace(/\s+/g, " ").trim();
  }
  function examCoverage(spec) {
    if (spec.kind === "UKLN") return "Materi kelas VII 20% • kelas VIII 20% • kelas IX 60%";
    return (spec.chapters || []).map((id) => `Bab ${id.split("-")[1]}`).join(", ");
  }
  function examIdentityRows(exam, config) {
    return [
      ["Mata Pelajaran", config.subject, "Kelas", exam.spec.grade],
      ["Hari/Tanggal", config.dayDate, "Waktu", config.time],
      ["Alokasi Waktu", config.duration, "Ruang", config.room],
      ["Cakupan Materi", examCoverage(exam.spec), "Semester", exam.spec.semester],
    ];
  }
  function publicConfig(config) {
    const copy = { ...config };
    delete copy.code;
    copy.codeHash = hashAccessCode(config.code, config.examId, config.seed);
    copy.version = 22;
    copy.studentMode = true;
    return copy;
  }
  function publishedLink(config) {
    const url = new URL(location.href); url.search = ""; url.hash = "portal";
    url.searchParams.set("ujian", config.examId);
    url.searchParams.set("paket", config.seed);
    url.searchParams.set("mode", "murid");
    url.searchParams.set("cfg", encodeBase64Url(publicConfig(config)));
    return url.href;
  }
  function recapLink() {
    const url = new URL(location.href); url.search = ""; url.hash = "portal"; url.searchParams.set("rekap", "asesmen"); return url.href;
  }
  function parseDurationMinutes(config) {
    const direct = Number(config.durationMinutes);
    if (Number.isFinite(direct) && direct > 0) return Math.min(360, Math.max(5, Math.round(direct)));
    const match = String(config.duration || "").match(/\d+/);
    return match ? Math.min(360, Math.max(5, Number(match[0]))) : 120;
  }

  function questionOptionHtml(question, option, optionIndex, { interactive, withKey }) {
    const letter = bank.letters[optionIndex];
    if (interactive) {
      return `<label class="exam-option"><input type="radio" name="mcq-${question.number}" value="${optionIndex}"><span><b>${letter}.</b> ${escapeHtml(option)}</span></label>`;
    }
    const marked = withKey && optionIndex === question.answer;
    return `<div class="exam-option-print${marked ? " is-answer-key" : ""}"><b>${marked ? "◉" : "○"} ${letter}.</b> ${escapeHtml(option)}</div>`;
  }

  function examPaper(exam, config, { withKey = false, interactive = false } = {}) {
    return `<section class="exam-paper ${interactive ? "interactive-exam" : ""}">
      <header class="exam-letterhead">
        <div class="exam-logo-space">${config.logoData ? `<img src="${escapeHtml(config.logoData)}" alt="Logo sekolah">` : `<img src="logo-spensus.png" alt="Logo sekolah">`}</div>
        <div class="exam-letterhead-copy"><strong>${escapeHtml(config.school)}</strong><p>${escapeHtml(config.schoolAddress)}</p><h2>${escapeHtml(exam.spec.title)}</h2><p>TAHUN AJARAN ${escapeHtml(config.year)}</p></div>
      </header>
      <table class="exam-identity-table">${examIdentityRows(exam, config).map((row) => `<tr><th>${escapeHtml(row[0])}</th><td>${escapeHtml(row[1])}</td><th>${escapeHtml(row[2])}</th><td>${escapeHtml(row[3])}</td></tr>`).join("")}</table>
      ${interactive ? `<div class="exam-student-identity"><label>Nama lengkap<input name="exam-name" maxlength="100" autocomplete="name" required></label><label>Nomor absen<input name="exam-attendance" inputmode="numeric" maxlength="4" required></label><label>Kelas<input name="exam-class" maxlength="20" placeholder="Contoh: VIII A" required></label></div>` : ""}
      <section class="exam-instructions"><h3>Petunjuk Umum</h3><ol><li>Berdoalah sebelum mengerjakan.</li><li>Bacalah stimulus, data, tabel, dan potongan ayat secara teliti.</li><li>Pilih satu jawaban A, B, C, atau D yang paling tepat.</li><li>Kerjakan uraian dengan bahasa jelas, argumentatif, dan jujur.</li><li>Periksa kembali jawaban sebelum memilih Kirim dan Akhiri.</li></ol></section>
      <h3>A. Pilihan Ganda</h3>
      <div class="exam-question-list">${exam.questions.map((question) => `<article class="exam-question" id="exam-q-${question.number}" data-exam-question="${question.number}"><strong class="exam-question-number">${question.number}.</strong><div class="exam-question-content">${question.stimulus ? `<div class="exam-stimulus">${question.stimulus}</div>` : ""}<p class="exam-question-stem">${escapeHtml(question.stem)}</p><div class="exam-options">${question.options.map((option, optionIndex) => questionOptionHtml(question, option, optionIndex, { interactive, withKey })).join("")}</div></div></article>`).join("")}</div>
      <h3>B. Uraian</h3>
      <div class="exam-essay-list">${exam.essays.map((question, index) => `<article class="exam-question" id="exam-u-${index + 1}" data-exam-essay="${index + 1}"><strong class="exam-question-number">${question.number}.</strong><div class="exam-question-content"><p class="exam-question-stem">${escapeHtml(question.prompt)}</p>${interactive ? `<textarea name="essay-${question.number}" rows="5" placeholder="Tuliskan jawaban secara runtut..."></textarea>` : `<div class="essay-lines">................................................................................................................................................................<br>................................................................................................................................................................<br>................................................................................................................................................................<br>................................................................................................................................................................</div>`}</div></article>`).join("")}</div>
      ${withKey ? `<section class="answer-key"><h3>Pedoman Jawaban Guru</h3><p>Jawaban pilihan ganda ditandai dengan simbol <strong>◉</strong> dan latar hijau. Simbol serta warna ini tidak pernah muncul pada akses murid.</p><h3>Pedoman Penskoran Uraian</h3><p>Skor 4: tepat, lengkap, argumentatif, menggunakan bukti materi, dan memberi contoh nyata. Skor 3: tepat tetapi kurang lengkap. Skor 2: sebagian tepat. Skor 1: jawaban sangat terbatas. Skor 0: tidak menjawab atau tidak relevan.</p></section>` : ""}
    </section>`;
  }

  function printHtml(title, html) {
    const existing = document.querySelector("#assessment-print-frame");
    existing?.remove();
    const frame = document.createElement("iframe");
    frame.id = "assessment-print-frame";
    frame.setAttribute("aria-hidden", "true");
    frame.style.position = "fixed"; frame.style.width = "1px"; frame.style.height = "1px"; frame.style.right = "0"; frame.style.bottom = "0"; frame.style.border = "0"; frame.style.opacity = "0";
    document.body.append(frame);
    const base = escapeHtml(document.baseURI);
    frame.addEventListener("load", () => window.setTimeout(() => {
      try { frame.contentWindow?.focus(); frame.contentWindow?.print(); }
      finally { window.setTimeout(() => frame.remove(), 3000); }
    }, 500), { once: true });
    frame.srcdoc = `<!doctype html><html lang="id"><head><meta charset="utf-8"><base href="${base}"><title>${escapeHtml(title)}</title><link rel="stylesheet" href="styles.css?v=22"><style>@page{size:A4;margin:15mm 15mm 17mm}html,body{background:#fff!important}body{padding:0!important;margin:0!important;font-family:Cambria,serif;color:#111}.exam-paper{max-width:none!important;margin:0!important;border:0!important;padding:0!important}.no-print{display:none!important}.exam-question{break-inside:avoid;page-break-inside:avoid}.answer-key{break-before:page}.exam-option-print.is-answer-key{background:#dff6e9!important;border:1px solid #087f68!important}.exam-logo-space{border:0!important}</style></head><body>${html}</body></html>`;
    return true;
  }

  async function examDocxBlocks(exam, config, withKey = false) {
    const logo = await window.PAIBP_OFFICE?.logoData(config);
    const blocks = [];
    if (logo) blocks.push({ type: "image", dataUrl: logo, widthEmu: 1050000, heightEmu: 1050000, name: "Logo Sekolah" });
    blocks.push({ text: config.school, style: "Heading1" }, { text: config.schoolAddress }, { text: exam.spec.title, style: "Heading1" }, { text: `Tahun Ajaran ${config.year}` });
    blocks.push({ type: "table", rows: examIdentityRows(exam, config).map((row) => ({ cells: [{ text: row[0], header: true }, { text: row[1] }, { text: row[2], header: true }, { text: row[3] }] })) });
    blocks.push({ text: "Petunjuk Umum", style: "Heading2" }, { type: "list", ordered: true, items: ["Berdoalah sebelum mengerjakan.", "Bacalah stimulus, data, tabel, dan potongan ayat secara teliti.", "Pilih satu jawaban A, B, C, atau D yang paling tepat.", "Kerjakan uraian dengan bahasa jelas, argumentatif, dan jujur.", "Periksa kembali jawaban sebelum dikumpulkan."] }, { text: "A. Pilihan Ganda", style: "Heading1" });
    const questionRows = exam.questions.map((question) => {
      const stimulus = stimulusTextForDocument(question.stimulus);
      const options = question.options.map((option, optionIndex) => `${withKey && optionIndex === question.answer ? "◉" : "○"} ${bank.letters[optionIndex]}. ${option}`).join("\n");
      return { cells: [{ text: `${question.number}.`, header: true }, { text: `${stimulus ? `${stimulus}\n` : ""}${question.stem}\n${options}`, rtl: false }] };
    });
    blocks.push({ type: "table", columnWidths: [650, 8850], rows: questionRows });
    blocks.push({ text: "B. Uraian", style: "Heading1" });
    const essayRows = exam.essays.map((question) => ({ cells: [{ text: `${question.number}.`, header: true }, { text: `${question.prompt}\n\n................................................................................................................................................\n................................................................................................................................................\n................................................................................................................................................`, rtl: false }] }));
    blocks.push({ type: "table", columnWidths: [650, 8850], rows: essayRows });
    if (withKey) blocks.push({ text: "Pedoman Jawaban Guru", style: "Heading1" }, { text: "Pilihan yang benar ditandai dengan simbol ◉. Dokumen murid menggunakan simbol ○ pada seluruh opsi." }, { text: "Pedoman Penskoran Uraian", style: "Heading2" }, { text: "Skor 4: tepat, lengkap, argumentatif, menggunakan bukti materi, dan memberi contoh nyata. Skor 3: tepat tetapi kurang lengkap. Skor 2: sebagian tepat. Skor 1: jawaban sangat terbatas. Skor 0: tidak menjawab atau tidak relevan." });
    return blocks;
  }

  async function exportDocx(exam, config, withKey = false) {
    const blocks = await examDocxBlocks(exam, config, withKey);
    const blob = window.PAIBP_DOCX.createDocument({ title: "", blocks });
    window.PAIBP_OFFICE?.downloadBlob(blob, `${slug(exam.spec.id)}-${withKey ? "soal-jawaban-guru" : "soal-murid"}.docx`);
  }

  function currentConfigFromForm(container) {
    const config = loadConfig();
    container.querySelectorAll("[data-assessment-config]").forEach((input) => { config[input.dataset.assessmentConfig] = input.value; });
    if (config.durationMinutes) config.duration = `${config.durationMinutes} menit`;
    saveConfig(config); return config;
  }

  function teacherManagerHtml() {
    const config = loadConfig();
    return `<section class="assessment-manager"><div class="assessment-hero"><div><span class="badge">🔐 Khusus Guru</span><h2>PTS • ASAS • UKLN HOTS Literasi Numerasi</h2><p>Bank soal kelas VII–IX, publikasi ujian virtual, hitung mundur, rekap hasil, logo sekolah, serta ekspor DOCX, PDF, Excel, dan PowerPoint standar.</p></div><div class="assessment-metric"><strong>${bank.specs.length}</strong><span>paket profesional</span></div></div>
      <div class="assessment-tabs no-print"><button data-assessment-tab="setup" aria-pressed="true">Pengaturan & Publikasi</button><button data-assessment-tab="paper" aria-pressed="false">Preview & Cetak</button><button data-assessment-tab="results" aria-pressed="false">Rekap Hasil Murid</button></div>
      <div data-assessment-page="setup"><div class="assessment-spec-summary" data-assessment-spec-summary></div><div class="assessment-config-grid">
        <label>Jenis ujian<select data-assessment-config="examId">${bank.specs.map((spec) => `<option value="${spec.id}"${spec.id === config.examId ? " selected" : ""}>Kelas ${spec.grade} • ${spec.title}</option>`).join("")}</select></label>
        <label>Kode akses murid<input data-assessment-config="code" value="${escapeHtml(config.code)}" maxlength="24" autocomplete="new-password"></label>
        <label>Paket/seed soal<input data-assessment-config="seed" value="${escapeHtml(config.seed)}" maxlength="40"></label>
        <label>Durasi ujian (menit)<input type="number" min="5" max="360" data-assessment-config="durationMinutes" value="${escapeHtml(config.durationMinutes || parseDurationMinutes(config))}"></label>
        <label>Nama sekolah<input data-assessment-config="school" value="${escapeHtml(config.school)}" maxlength="120"></label>
        <label class="assessment-logo-editor">Logo sekolah<input type="file" accept="image/png,image/jpeg" data-assessment-logo><span class="assessment-logo-preview">${config.logoData ? `<img src="${escapeHtml(config.logoData)}" alt="Preview logo">` : `<img src="logo-spensus.png" alt="Preview logo">`}</span><button class="btn btn-compact" type="button" data-assessment-logo-reset>Gunakan logo awal</button></label>
        <label>Alamat/keterangan kop<input data-assessment-config="schoolAddress" value="${escapeHtml(config.schoolAddress)}" maxlength="180"></label><label>Mata pelajaran<input data-assessment-config="subject" value="${escapeHtml(config.subject)}" maxlength="120"></label><label>Hari/tanggal<input data-assessment-config="dayDate" value="${escapeHtml(config.dayDate)}" maxlength="120"></label><label>Waktu pelaksanaan<input data-assessment-config="time" value="${escapeHtml(config.time)}" maxlength="120"></label><label>Ruang<input data-assessment-config="room" value="${escapeHtml(config.room)}" maxlength="120"></label><label>Tahun Ajaran<input data-assessment-config="year" value="${escapeHtml(config.year)}" maxlength="20"></label>
      </div><div class="assessment-actions"><button class="cta" data-assessment-publish>Terbitkan Ujian untuk Murid</button><button class="btn" data-assessment-close>Nonaktifkan Ujian</button><button class="btn" data-assessment-copy-link>Salin Link Ujian</button><button class="btn" data-assessment-open-link>Buka Simulasi Murid</button><button class="btn" data-assessment-copy-recap>Salin Link Rekap</button></div><div class="assessment-share-box"><strong>Link ujian murid</strong><input readonly data-assessment-link value="${escapeHtml(publishedLink(config))}"><small>Link murid membuka mode ujian terbatas. Ruang Guru dan Ruang Editor disembunyikan serta diblokir.</small><strong>Link rekap hasil guru</strong><input readonly data-assessment-recap-link value="${escapeHtml(recapLink())}"></div><p class="save-status" data-assessment-status aria-live="polite"></p></div>
      <div data-assessment-page="paper" hidden><div class="assessment-actions no-print"><button class="cta" data-assessment-docx>Unduh Soal DOCX</button><button class="btn" data-assessment-pdf>Cetak / Simpan PDF</button><button class="btn" data-assessment-key-docx>Unduh DOCX Guru</button><button class="btn" data-assessment-key-preview>Tampilkan/Sembunyikan Jawaban</button><button class="btn" data-assessment-xlsx>Unduh Kisi & Jawaban Excel</button><button class="btn" data-assessment-ppt>Unduh Soal PowerPoint</button><button class="btn" data-assessment-new-seed>Buat Paket Berbeda</button></div><div data-assessment-preview></div></div>
      <div data-assessment-page="results" hidden><div class="assessment-actions no-print"><button class="btn" data-assessment-refresh>Segarkan Rekap</button><button class="btn" data-assessment-xlsx-results>Unduh Rekap Excel</button><button class="btn" data-assessment-clear>Hapus Rekap Lokal</button></div><div data-assessment-results></div></div></section>`;
  }

  async function fetchRemoteResults() {
    const config = window.PAIBP_CONFIG || {};
    if (!config.realtimeEndpoint || !config.realtimeReadKey) return [];
    try { const url = new URL(config.realtimeEndpoint); url.searchParams.set("action", "assessments"); url.searchParams.set("key", config.realtimeReadKey); url.searchParams.set("_", Date.now()); const response = await fetch(url.href, { cache: "no-store" }); const data = await response.json(); return data.ok && Array.isArray(data.assessments) ? data.assessments : []; } catch { return []; }
  }
  async function syncResult(result) {
    const config = window.PAIBP_CONFIG || {}; if (!config.realtimeEndpoint) return false;
    try { const response = await fetch(config.realtimeEndpoint, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ type: "assessment", assessmentData: result }) }); const data = await response.json(); return Boolean(data.ok); } catch { return false; }
  }
  async function renderResults(container) {
    if (!container) return;
    container.innerHTML = `<div class="khutbah-empty-state"><span>⏳</span><h5>Memuat rekap hasil</h5><p>Menggabungkan data lokal dan hasil lintas perangkat…</p></div>`;
    const local = loadResults(); const remote = await fetchRemoteResults(); const map = new Map(); [...local, ...remote].forEach((item) => { if (item?.id) map.set(item.id, item); });
    const results = [...map.values()].sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt))); saveResults(results);
    if (!results.length) { container.innerHTML = `<div class="khutbah-empty-state"><span>📊</span><h5>Belum ada hasil ujian</h5><p>Hasil yang dikirim murid akan tampil di sini.</p></div>`; return; }
    const average = Math.round(results.reduce((sum, result) => sum + Number(result.mcqScore || 0), 0) / results.length);
    container.innerHTML = `<div class="assessment-result-summary"><article><strong>${results.length}</strong><span>pengumpulan</span></article><article><strong>${average}</strong><span>rata-rata PG</span></article><article><strong>${remote.length}</strong><span>hasil lintas perangkat</span></article></div><div class="source-table-scroll"><table class="data-table"><thead><tr><th>Waktu</th><th>Nama</th><th>Kelas</th><th>Ujian</th><th>Paket</th><th>PG</th><th>Belum dijawab</th><th>Uraian</th><th>Status</th></tr></thead><tbody>${results.map((result) => `<tr><td>${escapeHtml(new Date(result.submittedAt).toLocaleString("id-ID"))}</td><td><strong>${escapeHtml(result.student?.name)}</strong><br><small>Absen ${escapeHtml(result.student?.attendance)}</small></td><td>${escapeHtml(result.student?.className)}</td><td>${escapeHtml(result.examTitle)}</td><td>${escapeHtml(result.seed)}</td><td>${result.mcqCorrect}/${result.mcqTotal}<br><strong>${result.mcqScore}</strong></td><td>${Number(result.unansweredMcq || 0) + Number(result.unansweredEssays || 0)}</td><td>${(result.essays || []).filter((essay) => String(essay.answer || "").trim()).length}/${(result.essays || []).length}</td><td>${result.timedOut ? "Waktu habis" : (result.synced || remote.some((item) => item.id === result.id) ? "Tersinkron" : "Tersimpan lokal")}</td></tr>`).join("")}</tbody></table></div>`;
  }

  function attachTeacherManager() {
    const container = document.querySelector("#teacher-document"); if (!container) return;
    document.querySelector("#print-teacher-document")?.setAttribute("hidden", ""); document.querySelector("#download-teacher-document")?.setAttribute("hidden", "");
    container.innerHTML = teacherManagerHtml(); const status = container.querySelector("[data-assessment-status]");
    const updateSpecSummary = (config) => { const spec = bank.specs.find((item) => item.id === config.examId) || bank.specs[0]; const summary = container.querySelector("[data-assessment-spec-summary]"); if (summary) summary.innerHTML = `<article><strong>${spec.mcq}</strong><span>pilihan ganda A–D</span></article><article><strong>${spec.essays}</strong><span>uraian</span></article><article><strong>${escapeHtml(examCoverage(spec))}</strong><span>cakupan materi</span></article><article><strong>${parseDurationMinutes(config)} menit</strong><span>hitung mundur ujian</span></article>`; };
    const updateLink = () => { const config = currentConfigFromForm(container); const link = container.querySelector("[data-assessment-link]"); if (link) link.value = publishedLink(config); updateSpecSummary(config); return config; };
    updateSpecSummary(loadConfig()); container.querySelectorAll("[data-assessment-config]").forEach((input) => input.addEventListener("input", updateLink));
    container.querySelector("[data-assessment-logo]")?.addEventListener("change", (event) => { const file = event.target.files?.[0]; if (!file) return; if (!/^image\/(png|jpeg)$/.test(file.type) || file.size > 1200000) { if (status) status.textContent = "Gunakan PNG/JPG maksimal 1,2 MB."; return; } const reader = new FileReader(); reader.onload = () => { const config = loadConfig(); config.logoData = String(reader.result || ""); saveConfig(config); const preview = container.querySelector(".assessment-logo-preview"); if (preview) preview.innerHTML = `<img src="${escapeHtml(config.logoData)}" alt="Preview logo">`; if (status) status.textContent = "Logo tersimpan dan digunakan pada preview, DOCX, PDF, Excel, serta PowerPoint."; }; reader.readAsDataURL(file); });
    container.querySelector("[data-assessment-logo-reset]")?.addEventListener("click", () => { const config = loadConfig(); config.logoData = ""; saveConfig(config); const preview = container.querySelector(".assessment-logo-preview"); if (preview) preview.innerHTML = '<img src="logo-spensus.png" alt="Preview logo">'; if (status) status.textContent = "Logo awal dipakai kembali."; });
    container.querySelectorAll("[data-assessment-tab]").forEach((button) => button.addEventListener("click", () => { container.querySelectorAll("[data-assessment-tab]").forEach((candidate) => candidate.setAttribute("aria-pressed", String(candidate === button))); container.querySelectorAll("[data-assessment-page]").forEach((page) => { page.hidden = page.dataset.assessmentPage !== button.dataset.assessmentTab; }); if (button.dataset.assessmentTab === "paper") { const config = updateLink(); container.querySelector("[data-assessment-preview]").innerHTML = examPaper(bank.buildExam(config.examId, config.seed), config); } if (button.dataset.assessmentTab === "results") renderResults(container.querySelector("[data-assessment-results]")); }));
    container.querySelector("[data-assessment-publish]")?.addEventListener("click", () => { const config = updateLink(); localStorage.setItem(ACTIVE_KEY, JSON.stringify(publicConfig(config))); if (status) status.textContent = "Ujian aktif. Bagikan link dan kode akses kepada murid."; installStudentExam(true); });
    container.querySelector("[data-assessment-close]")?.addEventListener("click", () => { localStorage.removeItem(ACTIVE_KEY); document.querySelector("#student-assessment-entry")?.remove(); document.querySelector("#student-exam-container")?.remove(); if (status) status.textContent = "Ujian dinonaktifkan pada perangkat ini."; });
    container.querySelector("[data-assessment-copy-link]")?.addEventListener("click", async () => { try { await navigator.clipboard.writeText(publishedLink(updateLink())); if (status) status.textContent = "Link ujian berhasil disalin."; } catch { container.querySelector("[data-assessment-link]")?.select(); if (status) status.textContent = "Link sudah dipilih. Tekan Ctrl+C."; } });
    container.querySelector("[data-assessment-open-link]")?.addEventListener("click", () => window.open(publishedLink(updateLink()), "_blank"));
    container.querySelector("[data-assessment-copy-recap]")?.addEventListener("click", async () => { try { await navigator.clipboard.writeText(recapLink()); if (status) status.textContent = "Link rekap berhasil disalin."; } catch { container.querySelector("[data-assessment-recap-link]")?.select(); } });
    container.querySelector("[data-assessment-docx]")?.addEventListener("click", async () => { const config = updateLink(); await exportDocx(bank.buildExam(config.examId, config.seed), config, false); });
    container.querySelector("[data-assessment-key-docx]")?.addEventListener("click", async () => { const config = updateLink(); await exportDocx(bank.buildExam(config.examId, config.seed), config, true); });
    container.querySelector("[data-assessment-pdf]")?.addEventListener("click", () => { const config = updateLink(); const exam = bank.buildExam(config.examId, config.seed); printHtml(`${exam.spec.title} Kelas ${exam.spec.grade}`, examPaper(exam, config)); });
    container.querySelector("[data-assessment-xlsx]")?.addEventListener("click", async () => { const config = updateLink(); const exam = bank.buildExam(config.examId, config.seed); const logo = await window.PAIBP_OFFICE.logoData(config); const rows = [["No", "Jenis", "Stimulus dan Soal", "A", "B", "C", "D", "Jawaban", "Cakupan"], ...exam.questions.map((q) => [q.number, "Pilihan Ganda", `${htmlToText(q.stimulus)} ${q.stem}`.trim(), ...q.options, `◉ ${bank.letters[q.answer]}`, examCoverage(exam.spec)]), ...exam.essays.map((q) => [q.number, "Uraian", q.prompt, "", "", "", "", "Rubrik 0–4", examCoverage(exam.spec)])]; await window.PAIBP_OFFICE.exportXlsx({ filename: `${slug(exam.spec.id)}-kisi-jawaban.xlsx`, sheetName: "Kisi Jawaban", title: config.school, subtitle: `${exam.spec.title} • Kelas ${exam.spec.grade} • Tahun Ajaran ${config.year}`, rows, logo }); });
    container.querySelector("[data-assessment-ppt]")?.addEventListener("click", async () => { const config = updateLink(); try { await window.PAIBP_OFFICE.exportAssessmentPpt(bank.buildExam(config.examId, config.seed), config, { withKey: false }); if (status) status.textContent = "PowerPoint berhasil dibuat."; } catch (error) { if (status) status.textContent = error.message || "PowerPoint belum dapat dibuat."; } });
    let keyShown = false; container.querySelector("[data-assessment-key-preview]")?.addEventListener("click", () => { keyShown = !keyShown; const config = updateLink(); container.querySelector("[data-assessment-preview]").innerHTML = examPaper(bank.buildExam(config.examId, config.seed), config, { withKey: keyShown }); });
    container.querySelector("[data-assessment-new-seed]")?.addEventListener("click", () => { const seedInput = container.querySelector('[data-assessment-config="seed"]'); seedInput.value = `paket-${Date.now().toString(36)}`; const config = updateLink(); container.querySelector("[data-assessment-preview]").innerHTML = examPaper(bank.buildExam(config.examId, config.seed), config); if (status) status.textContent = "Paket soal berbeda berhasil dibuat."; });
    container.querySelector("[data-assessment-refresh]")?.addEventListener("click", () => renderResults(container.querySelector("[data-assessment-results]")));
    container.querySelector("[data-assessment-xlsx-results]")?.addEventListener("click", async () => { const results = loadResults(); const config = loadConfig(); const logo = await window.PAIBP_OFFICE.logoData(config); await window.PAIBP_OFFICE.exportXlsx({ filename: "rekap-hasil-asesmen-paibp.xlsx", sheetName: "Rekap", title: config.school, subtitle: "Rekap Hasil PTS • ASAS • UKLN", logo, rows: [["Waktu", "Nama", "Absen", "Kelas", "Ujian", "Paket", "Benar", "Total", "Nilai", "Belum Dijawab", "Status"], ...results.map((r) => [r.submittedAt, r.student?.name, r.student?.attendance, r.student?.className, r.examTitle, r.seed, r.mcqCorrect, r.mcqTotal, r.mcqScore, Number(r.unansweredMcq || 0) + Number(r.unansweredEssays || 0), r.timedOut ? "Waktu habis" : (r.synced ? "sinkron" : "lokal")])] }); });
    container.querySelector("[data-assessment-clear]")?.addEventListener("click", () => { if (confirm("Hapus seluruh rekap hasil asesmen yang tersimpan lokal?")) { saveResults([]); renderResults(container.querySelector("[data-assessment-results]")); } });
  }

  function installTeacherButton() {
    if (isStudentExamMode) return;
    const menu = document.querySelector(".teacher-doc-menu"); if (!menu || menu.querySelector("#assessment-manager-button")) return;
    menu.querySelectorAll("[data-teacher-doc]").forEach((existing) => existing.addEventListener("click", () => { document.querySelector("#print-teacher-document")?.removeAttribute("hidden"); document.querySelector("#download-teacher-document")?.removeAttribute("hidden"); menu.querySelector("#assessment-manager-button")?.setAttribute("aria-pressed", "false"); }));
    const button = document.createElement("button"); button.id = "assessment-manager-button"; button.type = "button"; button.innerHTML = "<span>🧠</span> Bank PTS • ASAS • UKLN"; button.addEventListener("click", () => { menu.querySelectorAll("button").forEach((candidate) => candidate.setAttribute("aria-pressed", String(candidate === button))); attachTeacherManager(); }); menu.insertBefore(button, menu.querySelector('[data-teacher-doc="access"]'));
  }

  function studentExamConfig() {
    const params = new URLSearchParams(location.search); const examId = params.get("ujian"); const encoded = params.get("cfg");
    if (examId && bank.specs.some((spec) => spec.id === examId)) { const decoded = decodeBase64Url(encoded) || {}; return { ...defaultConfig, ...decoded, examId, seed: decoded.seed || params.get("paket") || "paket-a", codeHash: decoded.codeHash || "", studentMode: true }; }
    return safeJson(localStorage.getItem(ACTIVE_KEY), null);
  }

  function progressKey(config) { return `${STUDENT_PROGRESS_PREFIX}|${config.examId}|${config.seed}`; }
  function answeredState(form, exam) {
    const pgAnswered = exam.questions.map((question) => Boolean(form.querySelector(`input[name="mcq-${question.number}"]:checked`)));
    const essayAnswered = exam.essays.map((question) => Boolean(String(form.querySelector(`[name="essay-${question.number}"]`)?.value || "").trim()));
    return { pgAnswered, essayAnswered, answered: pgAnswered.filter(Boolean).length + essayAnswered.filter(Boolean).length, total: pgAnswered.length + essayAnswered.length };
  }
  function saveStudentProgress(form, exam, config, deadlineAt) {
    const data = new FormData(form); const payload = { deadlineAt, identity: { name: data.get("exam-name") || "", attendance: data.get("exam-attendance") || "", className: data.get("exam-class") || "" }, answers: Object.fromEntries(exam.questions.map((q) => [q.number, data.get(`mcq-${q.number}`)])), essays: Object.fromEntries(exam.essays.map((q) => [q.number, data.get(`essay-${q.number}`) || ""])) };
    sessionStorage.setItem(progressKey(config), JSON.stringify(payload));
  }
  function restoreStudentProgress(form, exam, config) {
    const saved = safeJson(sessionStorage.getItem(progressKey(config)), null); if (!saved) return null;
    const name = form.querySelector('[name="exam-name"]'); const attendance = form.querySelector('[name="exam-attendance"]'); const className = form.querySelector('[name="exam-class"]'); if (name) name.value = saved.identity?.name || ""; if (attendance) attendance.value = saved.identity?.attendance || ""; if (className) className.value = saved.identity?.className || "";
    exam.questions.forEach((q) => { const value = saved.answers?.[q.number]; if (value !== null && value !== undefined && value !== "") form.querySelector(`input[name="mcq-${q.number}"][value="${value}"]`)?.setAttribute("checked", ""); });
    exam.essays.forEach((q) => { const field = form.querySelector(`[name="essay-${q.number}"]`); if (field) field.value = saved.essays?.[q.number] || ""; });
    return saved;
  }

  function examRuntimeHtml(exam, config) {
    const pgButtons = exam.questions.map((q) => `<button type="button" data-jump-question="exam-q-${q.number}" data-palette-pg="${q.number}" title="Nomor ${q.number}">${q.number}</button>`).join("");
    const essayButtons = exam.essays.map((q, index) => `<button type="button" data-jump-question="exam-u-${index + 1}" data-palette-essay="${q.number}" title="Uraian ${index + 1}">U${index + 1}</button>`).join("");
    return `<div class="exam-runtime-bar no-print"><div class="exam-runtime-time"><small>Sisa waktu</small><strong data-exam-countdown>--:--:--</strong></div><div class="exam-runtime-progress"><small>Progres</small><strong data-exam-progress>0/${exam.questions.length + exam.essays.length}</strong></div><button class="btn btn-compact" type="button" data-review-unanswered>Periksa Belum Dijawab</button><button class="cta btn-compact" type="button" data-finish-exam>Kirim dan Akhiri</button></div><aside class="exam-palette no-print"><div><strong>Nomor Pilihan Ganda</strong><span>Hijau: sudah dijawab • putih: belum</span></div><div class="exam-palette-grid">${pgButtons}</div><div><strong>Uraian</strong></div><div class="exam-palette-grid">${essayButtons}</div></aside>`;
  }

  function installExamRuntime(form, exam, config, container) {
    const saved = restoreStudentProgress(form, exam, config);
    const durationMs = parseDurationMinutes(config) * 60000;
    const deadlineAt = Number(saved?.deadlineAt) > Date.now() ? Number(saved.deadlineAt) : Date.now() + durationMs;
    const countdown = form.querySelector("[data-exam-countdown]"); const progress = form.querySelector("[data-exam-progress]");
    const updatePalette = () => {
      const state = answeredState(form, exam); if (progress) progress.textContent = `${state.answered}/${state.total}`;
      state.pgAnswered.forEach((answered, index) => form.querySelector(`[data-palette-pg="${exam.questions[index].number}"]`)?.classList.toggle("is-answered", answered));
      state.essayAnswered.forEach((answered, index) => form.querySelector(`[data-palette-essay="${exam.essays[index].number}"]`)?.classList.toggle("is-answered", answered));
      saveStudentProgress(form, exam, config, deadlineAt);
      return state;
    };
    form.addEventListener("input", updatePalette); form.addEventListener("change", updatePalette); updatePalette();
    form.querySelectorAll("[data-jump-question]").forEach((button) => button.addEventListener("click", () => document.getElementById(button.dataset.jumpQuestion)?.scrollIntoView({ behavior: "smooth", block: "center" })));
    form.querySelector("[data-review-unanswered]")?.addEventListener("click", () => { const state = updatePalette(); const pgIndex = state.pgAnswered.findIndex((value) => !value); if (pgIndex >= 0) { document.getElementById(`exam-q-${exam.questions[pgIndex].number}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); return; } const essayIndex = state.essayAnswered.findIndex((value) => !value); if (essayIndex >= 0) document.getElementById(`exam-u-${essayIndex + 1}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); else alert("Semua soal telah terisi. Silakan periksa kembali sebelum mengakhiri ujian."); });
    let timerId = 0; let finalizing = false;
    const finish = async ({ timedOut = false } = {}) => {
      if (finalizing) return; finalizing = true; window.clearInterval(timerId);
      const data = new FormData(form); const name = String(data.get("exam-name") || "").trim(); const attendance = String(data.get("exam-attendance") || "").trim(); const className = String(data.get("exam-class") || "").trim();
      if (!timedOut && (!name || !attendance || !className)) { finalizing = false; alert("Lengkapi nama, nomor absen, dan kelas sebelum mengakhiri ujian."); form.querySelector('[name="exam-name"]')?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
      const answers = exam.questions.map((question) => { const value = data.get(`mcq-${question.number}`); return value === null ? null : Number(value); });
      const essays = exam.essays.map((question) => ({ number: question.number, prompt: question.prompt, answer: String(data.get(`essay-${question.number}`) || "") }));
      const correct = answers.filter((value, index) => value !== null && value === exam.questions[index].answer).length;
      const result = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, submittedAt: new Date().toISOString(), examId: exam.spec.id, examTitle: exam.spec.title, seed: config.seed, student: { name: name || "Tanpa nama", attendance, className }, mcqCorrect: correct, mcqTotal: exam.questions.length, mcqScore: Math.round((correct / exam.questions.length) * 100), answers, unansweredMcq: answers.filter((value) => value === null).length, essays, unansweredEssays: essays.filter((item) => !item.answer.trim()).length, timedOut, synced: false };
      result.synced = await syncResult(result); const items = loadResults(); items.push(result); saveResults(items); sessionStorage.removeItem(progressKey(config));
      container.innerHTML = `<section class="exam-finish-card"><span>✅</span><h2>${timedOut ? "Waktu ujian telah berakhir" : "Jawaban berhasil dikirim"}</h2><strong>Nilai pilihan ganda: ${result.mcqScore}</strong><p>Benar ${correct} dari ${exam.questions.length}. Belum dijawab: ${result.unansweredMcq + result.unansweredEssays}. Jawaban uraian menunggu pemeriksaan guru.</p><button class="btn" type="button" data-print-result>Cetak Bukti Hasil</button></section>`;
      container.querySelector("[data-print-result]")?.addEventListener("click", () => printHtml("Bukti Hasil Ujian", `<section class="exam-paper"><h2>Bukti Pengiriman Ujian</h2><p><strong>Nama:</strong> ${escapeHtml(result.student.name)}</p><p><strong>Kelas:</strong> ${escapeHtml(result.student.className)} • Absen ${escapeHtml(result.student.attendance)}</p><p><strong>Ujian:</strong> ${escapeHtml(result.examTitle)}</p><p><strong>Waktu kirim:</strong> ${escapeHtml(new Date(result.submittedAt).toLocaleString("id-ID"))}</p><p><strong>Nilai PG:</strong> ${result.mcqScore}</p></section>`));
    };
    const askFinish = () => { const state = updatePalette(); const unanswered = state.total - state.answered; const modal = document.createElement("div"); modal.className = "exam-confirm-modal"; modal.innerHTML = `<div class="exam-confirm-backdrop"></div><section role="dialog" aria-modal="true" aria-labelledby="exam-confirm-title"><span>❓</span><h2 id="exam-confirm-title">Apakah kamu yakin telah selesai?</h2><p>${unanswered ? `Masih ada <strong>${unanswered}</strong> soal yang belum dijawab.` : "Semua soal telah terisi. Pastikan jawaban sudah diperiksa."}</p><div><button class="btn" type="button" data-exam-no>Tidak, kembali</button><button class="cta" type="button" data-exam-yes>Ya, kirim dan akhiri</button></div></section>`; document.body.append(modal); modal.querySelector("[data-exam-no]")?.addEventListener("click", () => modal.remove()); modal.querySelector(".exam-confirm-backdrop")?.addEventListener("click", () => modal.remove()); modal.querySelector("[data-exam-yes]")?.addEventListener("click", () => { modal.remove(); finish(); }); };
    form.querySelector("[data-finish-exam]")?.addEventListener("click", askFinish);
    const tick = () => { const remaining = Math.max(0, deadlineAt - Date.now()); const totalSeconds = Math.ceil(remaining / 1000); const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0"); const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0"); const seconds = String(totalSeconds % 60).padStart(2, "0"); if (countdown) countdown.textContent = `${hours}:${minutes}:${seconds}`; if (remaining <= 0) finish({ timedOut: true }); };
    tick(); timerId = window.setInterval(tick, 1000);
  }

  function renderStudentExam(container, config) {
    const exam = bank.buildExam(config.examId, config.seed);
    container.innerHTML = `<section class="student-exam-shell"><div class="student-exam-lock"><span>📝</span><h2>${escapeHtml(exam.spec.title)} Kelas ${escapeHtml(exam.spec.grade)}</h2><p>${escapeHtml(examCoverage(exam.spec))}</p><p>Masukkan kode dari guru untuk membuka soal.</p><form data-student-exam-unlock><input type="password" placeholder="Kode akses" maxlength="24" required><button class="cta" type="submit">Mulai Ujian</button><p class="auth-error" aria-live="polite"></p></form></div></section>`;
    container.querySelector("form")?.addEventListener("submit", (event) => { event.preventDefault(); const entered = event.currentTarget.querySelector("input").value.trim(); if (!config.codeHash || hashAccessCode(entered, config.examId, config.seed) !== config.codeHash) { event.currentTarget.querySelector(".auth-error").textContent = "Kode akses tidak sesuai."; return; } container.innerHTML = `<form data-student-exam-form>${examRuntimeHtml(exam, config)}${examPaper(exam, config, { interactive: true })}</form>`; installExamRuntime(container.querySelector("form"), exam, config, container); });
  }

  function installStudentExam(force = false) {
    const config = studentExamConfig(); if (!config) return; const library = document.querySelector("#student-library"); if (!library) return;
    if (force) { document.querySelector("#student-assessment-entry")?.remove(); document.querySelector("#student-exam-container")?.remove(); }
    if (document.querySelector("#student-assessment-entry")) return;
    const spec = bank.specs.find((item) => item.id === config.examId); const entry = document.createElement("section"); entry.id = "student-assessment-entry"; entry.className = "student-assessment-entry"; entry.innerHTML = `<div><span class="badge">Ujian Aktif</span><h3>${escapeHtml(spec?.title || "Asesmen PAIBP")}</h3><p>Kelas ${escapeHtml(spec?.grade || "")} • ${escapeHtml(examCoverage(spec || {}))} • ${parseDurationMinutes(config)} menit.</p></div><button class="cta" type="button">Buka Ujian</button>`; library.prepend(entry);
    const shell = document.createElement("section"); shell.id = "student-exam-container"; shell.hidden = true; library.parentElement.insertBefore(shell, library.nextSibling); entry.querySelector("button").addEventListener("click", () => { library.hidden = true; shell.hidden = false; renderStudentExam(shell, config); });
    if (isStudentExamMode) { document.querySelector('[data-open-panel="student"]')?.click(); window.setTimeout(() => entry.querySelector("button")?.click(), 120); }
  }

  function lockStudentMode() {
    if (!isStudentExamMode) return;
    document.documentElement.classList.add("student-exam-mode");
    document.querySelectorAll('[data-open-panel="teacher"],[data-open-panel="editor"],#panel-teacher,#panel-editor,.portal-tab-editor').forEach((element) => { element.hidden = true; element.setAttribute("aria-hidden", "true"); });
    document.addEventListener("click", (event) => { const protectedTarget = event.target.closest?.('[data-open-panel="teacher"],[data-open-panel="editor"],#assessment-manager-button'); if (protectedTarget) { event.preventDefault(); event.stopImmediatePropagation(); } }, true);
  }
  function openRecapFromLink() {
    if (new URLSearchParams(location.search).get("rekap") !== "asesmen") return;
    document.querySelector('[data-open-panel="teacher"]')?.click();
    document.querySelector("#teacher-access-form")?.addEventListener("submit", () => window.setTimeout(() => document.querySelector("#assessment-manager-button")?.click(), 300), { once: true });
  }

  lockStudentMode(); installTeacherButton(); installStudentExam(); openRecapFromLink();
  new MutationObserver(() => { installTeacherButton(); installStudentExam(); lockStudentMode(); }).observe(document.body, { childList: true, subtree: true });
})();
