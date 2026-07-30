(() => {
  "use strict";

  const bank = window.PAIBP_ASSESSMENT_BANK;
  if (!bank) return;

  const ACTIVE_KEY = "paibp-active-assessment-v3";
  const RESULT_KEY = "paibp-assessment-results-v3";
  const CONFIG_KEY = "paibp-assessment-config-v3";

  const defaultConfig = {
    school: "SMP Negeri 1 Susukan",
    schoolAddress: "Alamat: ........................................................................................................................",
    subject: "Pendidikan Agama Islam dan Budi Pekerti",
    dayDate: "........................................................................................................................",
    time: "........................................................................................................................",
    duration: "120 menit",
    room: "........................................................................................................................",
    year: "2026/2027",
    code: "PAIBP2026",
    examId: "VIII-PTS-GASAL",
    seed: "paket-a",
    logoData: "",
  };

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[character]));

  const safeJson = (text, fallback) => {
    try {
      return JSON.parse(text);
    } catch {
      return fallback;
    }
  };

  const loadConfig = () => ({ ...defaultConfig, ...safeJson(localStorage.getItem(CONFIG_KEY), {}) });
  const saveConfig = (config) => localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  const loadResults = () => safeJson(localStorage.getItem(RESULT_KEY), []);
  const saveResults = (items) => localStorage.setItem(RESULT_KEY, JSON.stringify(items));
  const slug = (value) => String(value || "dokumen").toLocaleLowerCase("id").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  function stableHash(value) {
    let hash = 2166136261;
    for (const character of String(value)) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function hashAccessCode(code, examId, seed) {
    return stableHash(`paibp-smart-v19|${String(code).trim()}|${examId}|${seed}`);
  }

  function encodeBase64Url(value) {
    const bytes = new TextEncoder().encode(JSON.stringify(value));
    let binary = "";
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  }

  function decodeBase64Url(value) {
    try {
      const normalized = String(value || "").replaceAll("-", "+").replaceAll("_", "/");
      const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
      const binary = atob(padded);
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return null;
    }
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function htmlToText(html) {
    const holder = document.createElement("div");
    holder.innerHTML = String(html || "");
    return String(holder.innerText || holder.textContent || "").replace(/\s+/g, " ").trim();
  }

  function examCoverage(spec) {
    if (spec.kind === "UKLN") return "Materi kelas VII 20% • kelas VIII 20% • kelas IX 60%";
    const chapterNumbers = (spec.chapters || []).map((id) => `Bab ${id.split("-")[1]}`);
    return chapterNumbers.join(", ");
  }

  function examIdentityRows(exam, config) {
    return [
      ["Mata Pelajaran", config.subject, "Kelas", exam.spec.grade],
      ["Hari/Tanggal", config.dayDate, "Waktu", config.time],
      ["Alokasi Waktu", config.duration, "Ruang", config.room],
      ["Cakupan Materi", examCoverage(exam.spec), "Semester", exam.spec.semester],
    ];
  }

  function examPaper(exam, config, { withKey = false, interactive = false } = {}) {
    return `<section class="exam-paper ${interactive ? "interactive-exam" : ""}">
      <header class="exam-letterhead">
        <div class="exam-logo-space">${config.logoData ? `<img src="${escapeHtml(config.logoData)}" alt="Logo sekolah">` : `<img src="logo-spensus.png" alt="Logo sekolah">`}</div>
        <div class="exam-letterhead-copy">
          <strong>${escapeHtml(config.school)}</strong>
          <p>${escapeHtml(config.schoolAddress)}</p>
          <h2>${escapeHtml(exam.spec.title)}</h2>
          <p>TAHUN AJARAN ${escapeHtml(config.year)}</p>
        </div>
      </header>
      <table class="exam-identity-table">
        ${examIdentityRows(exam, config).map((row) => `<tr><th>${escapeHtml(row[0])}</th><td>${escapeHtml(row[1])}</td><th>${escapeHtml(row[2])}</th><td>${escapeHtml(row[3])}</td></tr>`).join("")}
      </table>
      ${interactive ? `<div class="exam-student-identity">
        <label>Nama lengkap<input name="exam-name" maxlength="100" autocomplete="name" required></label>
        <label>Nomor absen<input name="exam-attendance" inputmode="numeric" maxlength="4" required></label>
        <label>Kelas<input name="exam-class" maxlength="20" placeholder="Contoh: VIII A" required></label>
      </div>` : ""}
      <section class="exam-instructions">
        <h3>Petunjuk Umum</h3>
        <ol>
          <li>Berdoalah sebelum mengerjakan.</li>
          <li>Bacalah stimulus, data, tabel, dan potongan ayat secara teliti.</li>
          <li>Pilih satu jawaban A, B, C, atau D yang paling tepat.</li>
          <li>Kerjakan uraian dengan bahasa jelas, argumentatif, dan jujur.</li>
          <li>Periksa kembali jawaban sebelum dikirim atau dikumpulkan.</li>
        </ol>
      </section>
      <h3>A. Pilihan Ganda</h3>
      <div class="exam-question-list">
        ${exam.questions.map((question) => `<article class="exam-question" data-exam-question="${question.number}">
          <strong>${question.number}.</strong>
          <div>
            ${question.stimulus ? `<div class="exam-stimulus">${question.stimulus}</div>` : ""}
            <p>${escapeHtml(question.stem)}</p>
            <div class="exam-options">
              ${question.options.map((option, optionIndex) => interactive
                ? `<label><input type="radio" name="mcq-${question.number}" value="${optionIndex}" required><span>${bank.letters[optionIndex]}. ${escapeHtml(option)}</span></label>`
                : `<div><b>${bank.letters[optionIndex]}.</b> ${escapeHtml(option)}${withKey && optionIndex === question.answer ? " <mark>✓ Kunci</mark>" : ""}</div>`).join("")}
            </div>
          </div>
        </article>`).join("")}
      </div>
      <h3>B. Uraian</h3>
      <div class="exam-essay-list">
        ${exam.essays.map((question) => `<article class="exam-question">
          <strong>${question.number}.</strong>
          <div><p>${escapeHtml(question.prompt)}</p>${interactive
            ? `<textarea name="essay-${question.number}" rows="5" required></textarea>`
            : `<div class="essay-lines">................................................................................................................................................................<br>................................................................................................................................................................<br>................................................................................................................................................................<br>................................................................................................................................................................</div>`}</div>
        </article>`).join("")}
      </div>
      ${withKey ? `<section class="answer-key">
        <h3>Kunci Pilihan Ganda</h3>
        <p>${exam.questions.map((question) => `${question.number}.${bank.letters[question.answer]}`).join(" • ")}</p>
        <h3>Pedoman Penskoran Uraian</h3>
        <p>Skor 4: tepat, lengkap, argumentatif, menggunakan bukti materi, dan memberi contoh nyata. Skor 3: tepat tetapi kurang lengkap. Skor 2: sebagian tepat. Skor 1: jawaban sangat terbatas. Skor 0: tidak menjawab atau tidak relevan.</p>
      </section>` : ""}
    </section>`;
  }

  function printHtml(title, html) {
    const popup = window.open("", "_blank", "noopener,noreferrer");
    if (!popup) return false;
    popup.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><link rel="stylesheet" href="styles.css?v=21"><style>
      @page{size:A4;margin:15mm 15mm 17mm}html,body{background:#fff!important}body{padding:0!important;margin:0!important;font-family:Cambria,serif;color:#111}.exam-paper{max-width:none;margin:0}.no-print{display:none!important}.exam-arabic{font-family:"Traditional Arabic","Noto Naskh Arabic","Amiri",serif;font-size:19pt;line-height:1.9;display:block;text-align:right;direction:rtl}.exam-question{break-inside:avoid;page-break-inside:avoid}.exam-letterhead{break-after:avoid}.exam-identity-table{break-after:avoid}.answer-key{break-before:page}
    </style></head><body>${html}<script>onload=()=>setTimeout(()=>print(),350)<\/script></body></html>`);
    popup.document.close();
    return true;
  }

  function examDocxBlocks(exam, config, withKey = false) {
    const blocks = [
      { text: config.school, style: "Heading1" },
      { text: config.schoolAddress },
      { text: exam.spec.title, style: "Heading1" },
      { text: `Tahun Ajaran ${config.year}` },
      {
        type: "table",
        rows: examIdentityRows(exam, config).map((row) => ({
          cells: [
            { text: row[0], header: true },
            { text: row[1] },
            { text: row[2], header: true },
            { text: row[3] },
          ],
        })),
      },
      { text: "Petunjuk Umum", style: "Heading2" },
      {
        type: "list",
        ordered: true,
        items: [
          "Berdoalah sebelum mengerjakan.",
          "Bacalah stimulus, data, tabel, dan potongan ayat secara teliti.",
          "Pilih satu jawaban A, B, C, atau D yang paling tepat.",
          "Kerjakan uraian dengan bahasa jelas, argumentatif, dan jujur.",
          "Periksa kembali jawaban sebelum dikumpulkan.",
        ],
      },
      { text: "A. Pilihan Ganda", style: "Heading1" },
    ];

    exam.questions.forEach((question) => {
      const stimulus = htmlToText(question.stimulus);
      if (stimulus) blocks.push({ text: stimulus });
      blocks.push({ text: `${question.number}. ${question.stem}`, bold: true });
      blocks.push({
        type: "list",
        ordered: false,
        items: question.options.map((option, optionIndex) => `${bank.letters[optionIndex]}. ${option}${withKey && optionIndex === question.answer ? " — KUNCI" : ""}`),
      });
    });

    blocks.push({ text: "B. Uraian", style: "Heading1" });
    exam.essays.forEach((question) => {
      blocks.push({ text: `${question.number}. ${question.prompt}`, bold: true });
      blocks.push({ text: "................................................................................................................................................................" });
      blocks.push({ text: "................................................................................................................................................................" });
      blocks.push({ text: "................................................................................................................................................................" });
    });

    if (withKey) {
      blocks.push({ text: "Kunci Pilihan Ganda", style: "Heading1" });
      blocks.push({ text: exam.questions.map((question) => `${question.number}.${bank.letters[question.answer]}`).join(" • ") });
      blocks.push({ text: "Pedoman Penskoran Uraian", style: "Heading2" });
      blocks.push({ text: "Skor 4: tepat, lengkap, argumentatif, menggunakan bukti materi, dan memberi contoh nyata. Skor 3: tepat tetapi kurang lengkap. Skor 2: sebagian tepat. Skor 1: jawaban sangat terbatas. Skor 0: tidak menjawab atau tidak relevan." });
    }
    return blocks;
  }

  function exportDocx(exam, config, withKey = false) {
    const blob = window.PAIBP_DOCX.createDocument({
      title: `${exam.spec.title} Kelas ${exam.spec.grade}`,
      blocks: examDocxBlocks(exam, config, withKey),
    });
    downloadBlob(blob, `${slug(exam.spec.id)}-${withKey ? "soal-dan-kunci" : "soal"}.docx`);
  }

  function currentConfigFromForm(container) {
    const config = loadConfig();
    container.querySelectorAll("[data-assessment-config]").forEach((input) => {
      config[input.dataset.assessmentConfig] = input.value;
    });
    saveConfig(config);
    return config;
  }

  function publicConfig(config) {
    const copy = { ...config };
    delete copy.code;
    copy.codeHash = hashAccessCode(config.code, config.examId, config.seed);
    copy.version = 18;
    return copy;
  }

  function publishedLink(config) {
    const url = new URL(location.href);
    url.search = "";
    url.hash = "portal";
    url.searchParams.set("ujian", config.examId);
    url.searchParams.set("paket", config.seed);
    url.searchParams.set("cfg", encodeBase64Url(publicConfig(config)));
    return url.href;
  }

  function recapLink() {
    const url = new URL(location.href);
    url.search = "";
    url.hash = "portal";
    url.searchParams.set("rekap", "asesmen");
    return url.href;
  }

  function teacherManagerHtml() {
    const config = loadConfig();
    return `<section class="assessment-manager">
      <div class="assessment-hero">
        <div><span class="badge">🔐 Khusus Guru</span><h2>PTS • ASAS • UKLN HOTS Literasi Numerasi</h2><p>Bank soal kelas VII–IX, kisi cakupan bab, publikasi ujian, rekap hasil, logo sekolah yang dapat diganti, serta ekspor DOCX, PDF, XLS, dan PPT.</p></div>
        <div class="assessment-metric"><strong>${bank.specs.length}</strong><span>paket profesional</span></div>
      </div>
      <div class="assessment-tabs no-print">
        <button data-assessment-tab="setup" aria-pressed="true">Pengaturan & Publikasi</button>
        <button data-assessment-tab="paper" aria-pressed="false">Preview & Cetak</button>
        <button data-assessment-tab="results" aria-pressed="false">Rekap Hasil Murid</button>
      </div>
      <div data-assessment-page="setup">
        <div class="assessment-spec-summary" data-assessment-spec-summary></div>
        <div class="assessment-config-grid">
          <label>Jenis ujian<select data-assessment-config="examId">${bank.specs.map((spec) => `<option value="${spec.id}"${spec.id === config.examId ? " selected" : ""}>Kelas ${spec.grade} • ${spec.title}</option>`).join("")}</select></label>
          <label>Kode akses murid<input data-assessment-config="code" value="${escapeHtml(config.code)}" maxlength="24" autocomplete="new-password"></label>
          <label>Paket/seed soal<input data-assessment-config="seed" value="${escapeHtml(config.seed)}" maxlength="40"></label>
          <label>Nama sekolah<input data-assessment-config="school" value="${escapeHtml(config.school)}" maxlength="120"></label><label class="assessment-logo-editor">Logo sekolah<input type="file" accept="image/png,image/jpeg" data-assessment-logo><span class="assessment-logo-preview">${config.logoData ? `<img src="${escapeHtml(config.logoData)}" alt="Preview logo">` : `<img src="logo-spensus.png" alt="Preview logo">`}</span><button class="btn btn-compact" type="button" data-assessment-logo-reset>Gunakan logo awal</button></label>
          <label>Alamat/keterangan kop<input data-assessment-config="schoolAddress" value="${escapeHtml(config.schoolAddress)}" maxlength="180"></label>
          <label>Mata pelajaran<input data-assessment-config="subject" value="${escapeHtml(config.subject)}" maxlength="120"></label>
          <label>Hari/tanggal<input data-assessment-config="dayDate" value="${escapeHtml(config.dayDate)}" maxlength="120"></label>
          <label>Waktu pelaksanaan<input data-assessment-config="time" value="${escapeHtml(config.time)}" maxlength="120"></label>
          <label>Alokasi waktu<input data-assessment-config="duration" value="${escapeHtml(config.duration)}" maxlength="50"></label>
          <label>Ruang<input data-assessment-config="room" value="${escapeHtml(config.room)}" maxlength="120"></label>
          <label>Tahun Ajaran<input data-assessment-config="year" value="${escapeHtml(config.year)}" maxlength="20"></label>
        </div>
        <div class="assessment-actions">
          <button class="cta" data-assessment-publish>Terbitkan Ujian untuk Murid</button>
          <button class="btn" data-assessment-close>Nonaktifkan Ujian</button>
          <button class="btn" data-assessment-copy-link>Salin Link Ujian</button>
          <button class="btn" data-assessment-open-link>Buka Link Ujian</button>
          <button class="btn" data-assessment-copy-recap>Salin Link Rekap</button>
        </div>
        <div class="assessment-share-box">
          <strong>Link ujian murid</strong><input readonly data-assessment-link value="${escapeHtml(publishedLink(config))}">
          <small>Kode akses tidak ditulis sebagai teks terbuka pada link. Murid tetap harus memasukkan kode dari guru.</small>
          <strong>Link rekap hasil guru</strong><input readonly data-assessment-recap-link value="${escapeHtml(recapLink())}">
        </div>
        <p class="save-status" data-assessment-status aria-live="polite"></p>
      </div>
      <div data-assessment-page="paper" hidden>
        <div class="assessment-actions no-print">
          <button class="cta" data-assessment-docx>Unduh Soal DOCX</button>
          <button class="btn" data-assessment-pdf>Cetak / Simpan PDF</button>
          <button class="btn" data-assessment-key-docx>Unduh DOCX + Kunci</button>
          <button class="btn" data-assessment-key-preview>Tampilkan/Sembunyikan Kunci</button>
          <button class="btn" data-assessment-xls>Unduh Kisi & Kunci XLS</button>
          <button class="btn" data-assessment-ppt>Unduh Soal PPT</button>
          <button class="btn" data-assessment-new-seed>Buat Paket Berbeda</button>
        </div>
        <div data-assessment-preview></div>
      </div>
      <div data-assessment-page="results" hidden>
        <div class="assessment-actions no-print">
          <button class="btn" data-assessment-refresh>Segarkan Rekap</button>
          <button class="btn" data-assessment-xls-results>Unduh Rekap XLS</button>
          <button class="btn" data-assessment-ppt-results>Unduh Ringkasan PPT</button>
          <button class="btn" data-assessment-clear>Hapus Rekap Lokal</button>
        </div>
        <div data-assessment-results></div>
      </div>
    </section>`;
  }

  async function fetchRemoteResults() {
    const config = window.PAIBP_CONFIG || {};
    if (!config.realtimeEndpoint || !config.realtimeReadKey) return [];
    try {
      const url = new URL(config.realtimeEndpoint);
      url.searchParams.set("action", "assessments");
      url.searchParams.set("key", config.realtimeReadKey);
      url.searchParams.set("_", Date.now());
      const response = await fetch(url.href, { cache: "no-store" });
      const data = await response.json();
      return data.ok && Array.isArray(data.assessments) ? data.assessments : [];
    } catch {
      return [];
    }
  }

  async function renderResults(container) {
    if (!container) return;
    container.innerHTML = `<div class="khutbah-empty-state"><span>⏳</span><h5>Memuat rekap hasil</h5><p>Menggabungkan data lokal dan hasil lintas perangkat…</p></div>`;
    const local = loadResults();
    const remote = await fetchRemoteResults();
    const map = new Map();
    [...local, ...remote].forEach((item) => { if (item?.id) map.set(item.id, item); });
    const results = [...map.values()].sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)));
    saveResults(results);
    if (!results.length) {
      container.innerHTML = `<div class="khutbah-empty-state"><span>📊</span><h5>Belum ada hasil ujian</h5><p>Hasil yang dikirim murid akan tampil di sini. Rekap lintas perangkat aktif setelah endpoint Google Apps Script diisi.</p></div>`;
      return;
    }
    const average = Math.round(results.reduce((sum, result) => sum + Number(result.mcqScore || 0), 0) / results.length);
    container.innerHTML = `<div class="assessment-result-summary">
      <article><strong>${results.length}</strong><span>pengumpulan</span></article>
      <article><strong>${average}</strong><span>rata-rata PG</span></article>
      <article><strong>${remote.length}</strong><span>hasil lintas perangkat</span></article>
    </div>
    <div class="source-table-scroll"><table class="data-table"><thead><tr><th>Waktu</th><th>Nama</th><th>Kelas</th><th>Ujian</th><th>Paket</th><th>PG</th><th>Uraian</th><th>Status</th></tr></thead><tbody>
      ${results.map((result) => `<tr>
        <td>${escapeHtml(new Date(result.submittedAt).toLocaleString("id-ID"))}</td>
        <td><strong>${escapeHtml(result.student?.name)}</strong><br><small>Absen ${escapeHtml(result.student?.attendance)}</small></td>
        <td>${escapeHtml(result.student?.className)}</td>
        <td>${escapeHtml(result.examTitle)}</td>
        <td>${escapeHtml(result.seed)}</td>
        <td>${result.mcqCorrect}/${result.mcqTotal}<br><strong>${result.mcqScore}</strong></td>
        <td>${(result.essays || []).filter((essay) => String(essay.answer || "").trim()).length}/${(result.essays || []).length}</td>
        <td>${result.synced || remote.some((item) => item.id === result.id) ? "Tersinkron" : "Tersimpan lokal"}</td>
      </tr>`).join("")}
    </tbody></table></div>`;
  }

  async function syncResult(result) {
    const config = window.PAIBP_CONFIG || {};
    if (!config.realtimeEndpoint) return false;
    try {
      const response = await fetch(config.realtimeEndpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ type: "assessment", assessmentData: result }),
      });
      const data = await response.json();
      return Boolean(data.ok);
    } catch {
      return false;
    }
  }

  function attachTeacherManager() {
    const container = document.querySelector("#teacher-document");
    if (!container) return;
    document.querySelector("#print-teacher-document")?.setAttribute("hidden", "");
    document.querySelector("#download-teacher-document")?.setAttribute("hidden", "");
    container.innerHTML = teacherManagerHtml();
    const status = container.querySelector("[data-assessment-status]");

    const updateSpecSummary = (config) => {
      const spec = bank.specs.find((item) => item.id === config.examId) || bank.specs[0];
      const summary = container.querySelector("[data-assessment-spec-summary]");
      if (summary) summary.innerHTML = `<article><strong>${spec.mcq}</strong><span>pilihan ganda A–D</span></article><article><strong>${spec.essays}</strong><span>uraian</span></article><article><strong>${escapeHtml(examCoverage(spec))}</strong><span>cakupan materi</span></article><article><strong>HOTS</strong><span>literasi • numerasi • ayat • tajwid</span></article>`;
    };

    const updateLink = () => {
      const config = currentConfigFromForm(container);
      const link = container.querySelector("[data-assessment-link]");
      if (link) link.value = publishedLink(config);
      updateSpecSummary(config);
      return config;
    };

    updateSpecSummary(loadConfig());
    container.querySelectorAll("[data-assessment-config]").forEach((input) => input.addEventListener("input", updateLink));
    container.querySelector("[data-assessment-logo]")?.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!/^image\/(png|jpeg)$/.test(file.type) || file.size > 900000) { if (status) status.textContent = "Gunakan PNG/JPG maksimal 900 KB."; return; }
      const reader = new FileReader();
      reader.onload = () => { const config=loadConfig(); config.logoData=String(reader.result||""); saveConfig(config); const preview=container.querySelector(".assessment-logo-preview"); if(preview) preview.innerHTML=`<img src="${escapeHtml(config.logoData)}" alt="Preview logo">`; if(status) status.textContent="Logo sekolah tersimpan dan akan masuk ke preview, PDF, DOCX, dan PPT."; };
      reader.readAsDataURL(file);
    });
    container.querySelector("[data-assessment-logo-reset]")?.addEventListener("click", () => { const config=loadConfig(); config.logoData=""; saveConfig(config); const preview=container.querySelector(".assessment-logo-preview"); if(preview) preview.innerHTML='<img src="logo-spensus.png" alt="Preview logo">'; if(status) status.textContent="Logo awal dipakai kembali."; });
    container.querySelectorAll("[data-assessment-tab]").forEach((button) => button.addEventListener("click", () => {
      container.querySelectorAll("[data-assessment-tab]").forEach((candidate) => candidate.setAttribute("aria-pressed", String(candidate === button)));
      container.querySelectorAll("[data-assessment-page]").forEach((page) => { page.hidden = page.dataset.assessmentPage !== button.dataset.assessmentTab; });
      if (button.dataset.assessmentTab === "paper") {
        const config = updateLink();
        const exam = bank.buildExam(config.examId, config.seed);
        container.querySelector("[data-assessment-preview]").innerHTML = examPaper(exam, config);
      }
      if (button.dataset.assessmentTab === "results") renderResults(container.querySelector("[data-assessment-results]"));
    }));

    container.querySelector("[data-assessment-publish]")?.addEventListener("click", () => {
      const config = updateLink();
      localStorage.setItem(ACTIVE_KEY, JSON.stringify(publicConfig(config)));
      if (status) status.textContent = "Ujian aktif. Bagikan link dan kode akses kepada murid.";
      installStudentExam(true);
    });
    container.querySelector("[data-assessment-close]")?.addEventListener("click", () => {
      localStorage.removeItem(ACTIVE_KEY);
      document.querySelector("#student-assessment-entry")?.remove();
      document.querySelector("#student-exam-container")?.remove();
      if (status) status.textContent = "Ujian dinonaktifkan pada perangkat ini.";
    });
    container.querySelector("[data-assessment-copy-link]")?.addEventListener("click", async () => {
      const config = updateLink();
      try {
        await navigator.clipboard.writeText(publishedLink(config));
        if (status) status.textContent = "Link ujian berhasil disalin.";
      } catch {
        container.querySelector("[data-assessment-link]")?.select();
        if (status) status.textContent = "Link sudah dipilih. Tekan Ctrl+C untuk menyalin.";
      }
    });
    container.querySelector("[data-assessment-open-link]")?.addEventListener("click", () => window.open(publishedLink(updateLink()), "_blank", "noopener"));
    container.querySelector("[data-assessment-copy-recap]")?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(recapLink());
        if (status) status.textContent = "Link rekap hasil berhasil disalin.";
      } catch {
        container.querySelector("[data-assessment-recap-link]")?.select();
        if (status) status.textContent = "Link rekap sudah dipilih. Tekan Ctrl+C untuk menyalin.";
      }
    });
    container.querySelector("[data-assessment-docx]")?.addEventListener("click", () => {
      const config = updateLink();
      exportDocx(bank.buildExam(config.examId, config.seed), config, false);
    });
    container.querySelector("[data-assessment-key-docx]")?.addEventListener("click", () => {
      const config = updateLink();
      exportDocx(bank.buildExam(config.examId, config.seed), config, true);
    });
    container.querySelector("[data-assessment-pdf]")?.addEventListener("click", () => {
      const config = updateLink();
      const exam = bank.buildExam(config.examId, config.seed);
      if (!printHtml(`${exam.spec.title} Kelas ${exam.spec.grade}`, examPaper(exam, config))) {
        if (status) status.textContent = "Izinkan pop-up browser, lalu ulangi tombol PDF.";
      }
    });
    container.querySelector("[data-assessment-xls]")?.addEventListener("click", () => { const config=updateLink(); const exam=bank.buildExam(config.examId,config.seed); window.PAIBP_OFFICE?.exportXls({filename:`${slug(exam.spec.id)}-kisi-kunci.xls`,sheetName:'Kisi Kunci',rows:[["No","Jenis","Stimulus/Soal","A","B","C","D","Kunci","Cakupan"],...exam.questions.map(q=>[q.number,"Pilihan Ganda",htmlToText(q.stimulus)+" "+q.stem,...q.options,bank.letters[q.answer],examCoverage(exam.spec)]),...exam.essays.map(q=>[q.number,"Uraian",q.prompt,"","","","","Rubrik 0–4",examCoverage(exam.spec)])]}); });
    container.querySelector("[data-assessment-ppt]")?.addEventListener("click", async () => { const config=updateLink(); const exam=bank.buildExam(config.examId,config.seed); try{await window.PAIBP_OFFICE?.exportAssessmentPpt(exam,config,{withKey:false});}catch(e){if(status)status.textContent=e.message||"PPT belum dapat dibuat.";} });
    let keyShown = false;
    container.querySelector("[data-assessment-key-preview]")?.addEventListener("click", () => {
      keyShown = !keyShown;
      const config = updateLink();
      const exam = bank.buildExam(config.examId, config.seed);
      container.querySelector("[data-assessment-preview]").innerHTML = examPaper(exam, config, { withKey: keyShown });
    });
    container.querySelector("[data-assessment-new-seed]")?.addEventListener("click", () => {
      const seedInput = container.querySelector('[data-assessment-config="seed"]');
      seedInput.value = `paket-${Date.now().toString(36)}`;
      const config = updateLink();
      const exam = bank.buildExam(config.examId, config.seed);
      container.querySelector("[data-assessment-preview]").innerHTML = examPaper(exam, config);
      if (status) status.textContent = "Paket soal berbeda berhasil dibuat.";
    });
    container.querySelector("[data-assessment-refresh]")?.addEventListener("click", () => renderResults(container.querySelector("[data-assessment-results]")));
    container.querySelector("[data-assessment-xls-results]")?.addEventListener("click", () => { const rows=loadResults(); window.PAIBP_OFFICE?.exportXls({filename:'rekap-hasil-asesmen-paibp.xls',sheetName:'Rekap',rows:[["Waktu","Nama","Absen","Kelas","Ujian","Paket","Benar","Total","Nilai","Status"],...rows.map(r=>[r.submittedAt,r.student?.name,r.student?.attendance,r.student?.className,r.examTitle,r.seed,r.mcqCorrect,r.mcqTotal,r.mcqScore,r.synced?'sinkron':'lokal'])]}); });
    container.querySelector("[data-assessment-ppt-results]")?.addEventListener("click", async () => { const rows=loadResults(); if(!rows.length){if(status)status.textContent='Belum ada hasil untuk dibuat menjadi PPT.';return;} const spec=bank.specs.find(x=>x.id===loadConfig().examId)||bank.specs[0]; const mock={spec,questions:[],essays:[]}; try{await window.PAIBP_OFFICE?.exportAssessmentPpt(mock,{...loadConfig(),school:`${loadConfig().school} — Rekap ${rows.length} murid`},{withKey:false});}catch(e){if(status)status.textContent=e.message||'PPT belum dapat dibuat.';} });
    container.querySelector("[data-assessment-clear]")?.addEventListener("click", () => {
      if (confirm("Hapus seluruh rekap hasil asesmen yang tersimpan lokal?")) {
        saveResults([]);
        renderResults(container.querySelector("[data-assessment-results]"));
      }
    });
  }

  function unlockTeacherManager() {
    attachTeacherManager();
  }

  function installTeacherButton() {
    const menu = document.querySelector(".teacher-doc-menu");
    if (!menu || menu.querySelector("#assessment-manager-button")) return;
    menu.querySelectorAll("[data-teacher-doc]").forEach((existing) => existing.addEventListener("click", () => {
      document.querySelector("#print-teacher-document")?.removeAttribute("hidden");
      document.querySelector("#download-teacher-document")?.removeAttribute("hidden");
      menu.querySelector("#assessment-manager-button")?.setAttribute("aria-pressed", "false");
    }));
    const button = document.createElement("button");
    button.id = "assessment-manager-button";
    button.type = "button";
    button.innerHTML = "<span>🧠</span> Bank PTS • ASAS • UKLN";
    button.addEventListener("click", () => {
      menu.querySelectorAll("button").forEach((candidate) => candidate.setAttribute("aria-pressed", String(candidate === button)));
      unlockTeacherManager();
    });
    menu.insertBefore(button, menu.querySelector('[data-teacher-doc="access"]'));
  }

  function studentExamConfig() {
    const params = new URLSearchParams(location.search);
    const examId = params.get("ujian");
    const encoded = params.get("cfg");
    if (examId && bank.specs.some((spec) => spec.id === examId)) {
      const decoded = decodeBase64Url(encoded) || {};
      return {
        ...defaultConfig,
        ...decoded,
        examId,
        seed: decoded.seed || params.get("paket") || "paket-a",
        codeHash: decoded.codeHash || (params.get("kode") ? hashAccessCode(params.get("kode"), examId, decoded.seed || params.get("paket") || "paket-a") : ""),
      };
    }
    return safeJson(localStorage.getItem(ACTIVE_KEY), null);
  }

  function renderStudentExam(container, config) {
    const exam = bank.buildExam(config.examId, config.seed);
    container.innerHTML = `<section class="student-exam-shell"><div class="student-exam-lock"><span>📝</span><h2>${escapeHtml(exam.spec.title)} Kelas ${escapeHtml(exam.spec.grade)}</h2><p>${escapeHtml(examCoverage(exam.spec))}</p><p>Masukkan kode dari guru untuk membuka soal.</p><form data-student-exam-unlock><input type="password" placeholder="Kode akses" maxlength="24" required><button class="cta" type="submit">Mulai Ujian</button><p class="auth-error" aria-live="polite"></p></form></div></section>`;
    container.querySelector("form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const entered = event.currentTarget.querySelector("input").value.trim();
      const enteredHash = hashAccessCode(entered, config.examId, config.seed);
      if (!config.codeHash || enteredHash !== config.codeHash) {
        event.currentTarget.querySelector(".auth-error").textContent = "Kode akses tidak sesuai.";
        return;
      }
      container.innerHTML = `<form data-student-exam-form>${examPaper(exam, config, { interactive: true })}<div class="assessment-submit-bar"><button class="cta" type="submit">Kirim Jawaban</button><p class="save-status" aria-live="polite"></p></div></form>`;
      const form = container.querySelector("form");
      form.addEventListener("submit", async (submitEvent) => {
        submitEvent.preventDefault();
        const status = form.querySelector(".save-status");
        const data = new FormData(form);
        const name = String(data.get("exam-name") || "").trim();
        const attendance = String(data.get("exam-attendance") || "").trim();
        const className = String(data.get("exam-class") || "").trim();
        if (!name || !attendance || !className) {
          status.textContent = "Lengkapi identitas murid.";
          return;
        }
        const answers = exam.questions.map((question) => Number(data.get(`mcq-${question.number}`)));
        if (answers.some((value) => Number.isNaN(value))) {
          status.textContent = "Masih ada pilihan ganda yang belum dijawab.";
          return;
        }
        const correct = answers.filter((value, index) => value === exam.questions[index].answer).length;
        const result = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          submittedAt: new Date().toISOString(),
          examId: exam.spec.id,
          examTitle: exam.spec.title,
          seed: config.seed,
          student: { name, attendance, className },
          mcqCorrect: correct,
          mcqTotal: exam.questions.length,
          mcqScore: Math.round((correct / exam.questions.length) * 100),
          answers,
          essays: exam.essays.map((question) => ({ number: question.number, prompt: question.prompt, answer: String(data.get(`essay-${question.number}`) || "") })),
          synced: false,
        };
        status.textContent = "Mengirim hasil…";
        result.synced = await syncResult(result);
        const items = loadResults();
        items.push(result);
        saveResults(items);
        container.innerHTML = `<section class="exam-finish-card"><span>✅</span><h2>Jawaban berhasil dikirim</h2><strong>Nilai pilihan ganda: ${result.mcqScore}</strong><p>Benar ${correct} dari ${exam.questions.length}. Jawaban uraian menunggu pemeriksaan guru.</p><button class="btn" data-download-result>Unduh Bukti Hasil</button></section>`;
        container.querySelector("[data-download-result]")?.addEventListener("click", () => {
          downloadBlob(new Blob([JSON.stringify(result, null, 2)], { type: "application/json" }), `hasil-${slug(name)}-${slug(exam.spec.id)}.json`);
        });
      });
    });
  }

  function installStudentExam(force = false) {
    const config = studentExamConfig();
    if (!config) return;
    const library = document.querySelector("#student-library");
    if (!library) return;
    if (force) {
      document.querySelector("#student-assessment-entry")?.remove();
      document.querySelector("#student-exam-container")?.remove();
    }
    if (document.querySelector("#student-assessment-entry")) return;
    const spec = bank.specs.find((item) => item.id === config.examId);
    const entry = document.createElement("section");
    entry.id = "student-assessment-entry";
    entry.className = "student-assessment-entry";
    entry.innerHTML = `<div><span class="badge">Ujian Aktif</span><h3>${escapeHtml(spec?.title || "Asesmen PAIBP")}</h3><p>Kelas ${escapeHtml(spec?.grade || "")} • ${escapeHtml(examCoverage(spec || {}))} • soal HOTS literasi numerasi.</p></div><button class="cta" type="button">Buka Ujian</button>`;
    library.prepend(entry);
    const shell = document.createElement("section");
    shell.id = "student-exam-container";
    shell.hidden = true;
    library.parentElement.insertBefore(shell, library.nextSibling);
    entry.querySelector("button").addEventListener("click", () => {
      library.hidden = true;
      shell.hidden = false;
      renderStudentExam(shell, config);
    });
    if (new URLSearchParams(location.search).get("ujian")) {
      document.querySelector('[data-open-panel="student"]')?.click();
      window.setTimeout(() => entry.querySelector("button")?.click(), 100);
    }
  }

  function openRecapFromLink() {
    if (new URLSearchParams(location.search).get("rekap") !== "asesmen") return;
    document.querySelector('[data-open-panel="teacher"]')?.click();
    document.querySelector("#teacher-access-form")?.addEventListener("submit", () => window.setTimeout(() => document.querySelector("#assessment-manager-button")?.click(), 250), { once: true });
    window.setTimeout(() => {
      const panel = document.querySelector("#panel-teacher");
      if (panel && !panel.hidden) document.querySelector("#assessment-manager-button")?.click();
    }, 350);
  }

  installTeacherButton();
  installStudentExam();
  openRecapFromLink();
  new MutationObserver(() => {
    installTeacherButton();
    installStudentExam();
  }).observe(document.body, { childList: true, subtree: true });
})();
