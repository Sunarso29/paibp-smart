const menuButton = document.querySelector(".menu-btn");
const navigation = document.querySelector(".links");
const mobileBreakpoint = window.matchMedia("(max-width: 860px)");

function setMenu(open) {
  if (!menuButton || !navigation) return;
  navigation.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
  menuButton.textContent = open ? "×" : "☰";
}

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => setMenu(!navigation.classList.contains("open")));
  navigation.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a") && mobileBreakpoint.matches) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigation.classList.contains("open")) {
      setMenu(false);
      menuButton.focus();
    }
  });
  const handleBreakpoint = (event) => {
    if (!event.matches) setMenu(false);
  };
  if (typeof mobileBreakpoint.addEventListener === "function") {
    mobileBreakpoint.addEventListener("change", handleBreakpoint);
  } else {
    mobileBreakpoint.addListener(handleBreakpoint);
  }
}

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const workspace = document.querySelector("#portal");
const appData = window.PAIBP_DATA;

if (workspace && appData) {
  const { chapters, cp, academicCalendar } = appData;
  const islamicData = window.PAIBP_ISLAMIC || { dua: [], fastingRules: [], historicDates: [], dailyInsights: [] };
  const schoolData = window.PAIBP_SCHOOL || { school: null, teachers: [], staff: [], news: [] };
  const STORAGE_KEY = "paibp-smart-progress-v3";
  const PRAYER_CACHE_KEY = "paibp-smart-prayer-cache-v1";
  const EFFECTIVE_KEY = "paibp-smart-effective-v1";
  const STUDENT_WORK_KEY = "paibp-smart-student-work-v1";
  const STUDENT_IDENTITY_KEY = "paibp-smart-student-identity-v1";
  const SUBMISSION_RECAP_KEY = "paibp-smart-submission-recap-v1";
  const QURAN_CACHE_NAME = "paibp-smart-quran-v1";
  const QURAN_AUDIO_CACHE_NAME = "paibp-smart-quran-audio-v1";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const motivations = [
    "Belajar sedikit demi sedikit tetapi konsisten akan membentuk pemahaman yang kuat.",
    "Ilmu menjadi bermakna ketika terlihat dalam sikap jujur, santun, dan bermanfaat.",
    "Kesalahan bukan akhir belajar; ia menunjukkan bagian yang perlu diperbaiki.",
    "Mulailah dari satu kebaikan sederhana, lalu jaga agar terus menjadi kebiasaan.",
    "Murid yang berani bertanya sedang membuka jalan menuju pemahaman yang lebih dalam.",
    "Gunakan teknologi untuk mendekatkan diri pada ilmu dan menghadirkan manfaat.",
    "Jaga niat, tekuni proses, dan syukuri setiap kemajuan yang berhasil dicapai.",
    "Perbedaan adalah ruang untuk belajar saling memahami dan menghormati.",
    "Kedisiplinan hari ini adalah fondasi keberhasilan pada masa depan.",
    "Ilmu yang baik mendorong kita menjaga sesama, lingkungan, dan amanah kehidupan.",
    "Baca dengan teliti, pikirkan dengan jernih, lalu bertindaklah dengan bijaksana.",
    "Kejujuran mungkin terasa berat sesaat, tetapi menghadirkan ketenangan yang panjang.",
    "Tidak perlu menunggu sempurna untuk mulai; mulailah agar terus menjadi lebih baik.",
    "Prestasi terbaik adalah kemajuan yang disertai akhlak mulia.",
  ];

  const questionBank = [
    ["Sumber utama ajaran Islam yang menjadi wahyu Allah Subhanahu Wata'ala adalah…", ["Al Qur'an", "Pendapat pribadi", "Pesan berantai", "Kebiasaan kelompok"], 0, "Al Qur'an merupakan wahyu dan sumber utama ajaran Islam."],
    ["Ketika menerima berita yang belum jelas, tindakan paling tepat adalah…", ["Langsung membagikan", "Melakukan tabayun", "Menambah judul sensasional", "Menyalahkan pengirim"], 1, "Tabayun memeriksa sumber, bukti, konteks, dan dampak sebelum menyimpulkan."],
    ["Contoh amanah di sekolah adalah…", ["Menyalin tugas teman", "Menjalankan tugas piket", "Menyembunyikan barang temuan", "Memalsukan data"], 1, "Amanah terlihat dalam pelaksanaan tanggung jawab dengan jujur."],
    ["Sikap khalifah terhadap alam ditunjukkan dengan…", ["Menghabiskan sumber daya", "Merawat dan menggunakan secara bertanggung jawab", "Membuang sampah ke sungai", "Mengabaikan pencemaran"], 1, "Kekhalifahan merupakan amanah untuk menjaga kemaslahatan dan keberlanjutan."],
    ["Tawakal yang benar dilakukan…", ["Tanpa usaha", "Setelah ikhtiar yang layak", "Dengan menyalahkan keadaan", "Setelah meninggalkan kewajiban"], 1, "Tawakal menyerahkan hasil kepada Allah Subhanahu Wata'ala setelah berikhtiar."],
    ["Menghormati perbedaan tanpa mencampuradukkan akidah merupakan bentuk…", ["Toleransi", "Gibah", "Riba", "Taklid buta"], 0, "Toleransi menjaga penghormatan, keadilan, serta batas keyakinan."],
    ["Kejujuran akademik ketika menggunakan AI ditunjukkan dengan…", ["Menyalin tanpa membaca", "Memeriksa hasil dan mengakui bantuan", "Menghapus semua sumber", "Mengaku seluruhnya karya sendiri"], 1, "Teknologi boleh membantu, tetapi isi perlu diperiksa dan proses diakui."],
    ["Sujud yang berkaitan dengan kelupaan tertentu dalam sholat adalah…", ["Sujud syukur", "Sujud tilawah", "Sujud sahwi", "Sujud biasa"], 2, "Sujud sahwi dilakukan karena sebab kelupaan tertentu dalam sholat."],
    ["Rukhsah adalah…", ["Keringanan syariat karena sebab yang diakui", "Alasan meninggalkan semua ibadah", "Kebiasaan yang dibuat sendiri", "Larangan mempelajari fikih"], 0, "Rukhsah merupakan kemudahan yang memiliki sebab dan ketentuan."],
    ["Sikap yang sesuai iman kepada Hari Akhir adalah…", ["Berbuat tanpa tanggung jawab", "Jujur meskipun tidak diawasi", "Mengejar keuntungan dengan segala cara", "Mempercayai ramalan tanggal kiamat"], 1, "Iman kepada Hari Akhir membangun kesadaran pertanggungjawaban."],
    ["Al-Khabir mendorong murid untuk…", ["Bekerja ceroboh", "Teliti dan bertanggung jawab", "Merasa paling tahu", "Mengabaikan fakta"], 1, "Kesadaran kepada Allah Subhanahu Wata'ala Yang Maha Teliti mendorong kecermatan."],
    ["Salah satu etos ilmiah yang dapat diteladani dari ilmuwan Muslim adalah…", ["Menolak koreksi", "Mencatat data dan sumber", "Mengubah hasil", "Mengandalkan dugaan"], 1, "Pengetahuan yang dapat dipercaya memerlukan data, metode, dan keterbukaan terhadap koreksi."],
    ["Dalam transaksi, penjual wajib…", ["Menyembunyikan cacat barang", "Menjelaskan kondisi barang dengan jujur", "Mengubah harga setelah sepakat", "Memaksa pembeli"], 1, "Kejelasan dan kerelaan para pihak menjadi prinsip penting muamalah."],
    ["Perbedaan fikih dapat terjadi karena…", ["Semua ulama tidak belajar", "Perbedaan dalil, metode, bahasa, atau konteks", "Agama tidak memiliki pedoman", "Tidak ada adab keilmuan"], 1, "Perbedaan ilmiah dapat lahir dari metode dan konteks yang dapat dipertanggungjawabkan."],
    ["Sikap yang tepat setelah menyebarkan informasi salah ialah…", ["Diam saja", "Mengoreksi, meminta maaf, dan mencegah penyebaran", "Menghapus tanpa penjelasan", "Menyalahkan pembaca"], 1, "Pemulihan memerlukan koreksi kepada pihak yang menerima informasi salah."],
  ];

  const panelMeta = {
    welcome: ["Pilih ruang yang dibutuhkan", "Empat ruang utama di atas sudah aktif dan memiliki isi sesuai fungsinya."],
    student: ["Ruang Murid", "Buka materi, ringkasan, LKPD, tulis jawaban, simpan, cetak, dan kirim tugas dari 30 bab kelas VII–IX."],
    teacher: ["Ruang Guru", "Kelola perangkat, modul ajar lengkap, impor tugas murid, rekap, nilai, unduh, dan cetak."],
    islamic: ["Fitur Islami", "Baca Al Qur'an, Hisnul Muslim, dzikir, kalender ibadah, jadwal sholat, dan nasihat bersumber."],
    games: ["Fitur Games", "Kerjakan sepuluh soal acak, raih XP, dan pantau prestasi lokal."],
  };

  const panels = [...document.querySelectorAll("[data-panel]")];
  const openButtons = [...document.querySelectorAll("[data-open-panel]")];
  const workspaceTitle = document.querySelector("#workspace-title");
  const workspaceDescription = document.querySelector("#workspace-description");
  let state = loadState();
  let filters = { grade: "all", semester: "all" };
  let currentChapter = null;
  let currentLessonView = "material";
  let teacherGrade = "VIII";
  let teacherDoc = "cp";
  let teacherModuleChapterId = "VIII-1";
  let serviceWorkerRegistration = null;
  let prayerLoadedFor = "";
  let currentQuranPayload = null;
  let islamicCalendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let quizQuestions = [];
  let quizIndex = -1;
  let quizScore = 0;
  let quizLocked = false;

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function safeJsonParse(value, fallback) {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return {
        completed: Array.isArray(saved?.completed) ? saved.completed.filter((id) => chapters.some((chapter) => chapter.id === id)) : [],
        gameBest: Number.isInteger(saved?.gameBest) ? Math.min(10, Math.max(0, saved.gameBest)) : 0,
      };
    } catch {
      return { completed: [], gameBest: 0 };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function calculateXp() {
    return state.completed.length * 50 + state.gameBest * 20;
  }

  function getLevel(xp) {
    if (xp >= 1300) return "Teladan";
    if (xp >= 800) return "Cendekia";
    if (xp >= 400) return "Penjelajah";
    if (xp >= 100) return "Pembelajar";
    return "Pemula";
  }

  function scrollToWorkspace() {
    workspace.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
  }

  function openPanel(name) {
    const target = document.querySelector(`[data-panel="${name}"]`);
    if (!target || !panelMeta[name]) return;
    panels.forEach((panel) => {
      panel.hidden = panel !== target;
    });
    openButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.openPanel === name));
    workspaceTitle.textContent = panelMeta[name][0];
    workspaceDescription.textContent = panelMeta[name][1];
    if (name === "student") renderChapterCards();
    if (name === "teacher") renderTeacherDocument();
    if (name === "islamic") {
      updateIslamicDate();
      loadPrayerTimes();
    }
    if (name === "games") updateProgress();
    scrollToWorkspace();
  }

  openButtons.forEach((button) => button.addEventListener("click", () => openPanel(button.dataset.openPanel)));
  document.querySelector("[data-close-workspace]")?.addEventListener("click", () => {
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.panel !== "welcome";
    });
    openButtons.forEach((button) => button.classList.remove("is-active"));
    workspaceTitle.textContent = panelMeta.welcome[0];
    workspaceDescription.textContent = panelMeta.welcome[1];
    workspace.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
  });

  function setPressed(buttons, dataName, value) {
    buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset[dataName] === value)));
  }

  const gradeButtons = [...document.querySelectorAll("[data-grade-filter]")];
  const semesterButtons = [...document.querySelectorAll("[data-semester-filter]")];
  gradeButtons.forEach((button) => button.addEventListener("click", () => {
    filters.grade = button.dataset.gradeFilter;
    setPressed(gradeButtons, "gradeFilter", filters.grade);
    renderChapterCards();
  }));
  semesterButtons.forEach((button) => button.addEventListener("click", () => {
    filters.semester = button.dataset.semesterFilter;
    setPressed(semesterButtons, "semesterFilter", filters.semester);
    renderChapterCards();
  }));

  function renderChapterCards() {
    const list = document.querySelector("#chapter-list");
    if (!list) return;
    const visible = chapters.filter((chapter) => {
      const gradeMatch = filters.grade === "all" || chapter.grade === filters.grade;
      const semesterMatch = filters.semester === "all" || chapter.semester === filters.semester;
      return gradeMatch && semesterMatch;
    });
    list.replaceChildren();
    visible.forEach((chapter) => {
      const completed = state.completed.includes(chapter.id);
      const card = document.createElement("article");
      card.className = `chapter-package${completed ? " completed" : ""}`;
      card.innerHTML = `
        <div class="chapter-package-top">
          <span class="chapter-number">${chapter.number}</span>
          <div>
            <span class="chapter-element">${chapter.element}</span>
            <h4>${chapter.title}</h4>
            <p>Kelas ${chapter.grade} • Semester ${chapter.semester} • ${chapter.allocation} JP</p>
          </div>
          <span class="completion-mark">${completed ? "✓ Selesai" : "Belum selesai"}</span>
        </div>
        <p class="chapter-preview">${chapter.overview}</p>
        <div class="chapter-package-actions">
          <button type="button" data-chapter="${chapter.id}" data-view="material">📖 Materi Bab</button>
          <button type="button" data-chapter="${chapter.id}" data-view="summary">📝 Ringkasan</button>
          <button type="button" data-chapter="${chapter.id}" data-view="worksheet">📋 LKPD</button>
        </div>`;
      list.append(card);
    });
    list.querySelectorAll("[data-chapter]").forEach((button) => {
      button.addEventListener("click", () => openLesson(button.dataset.chapter, button.dataset.view));
    });
    document.querySelector("#material-summary").textContent = `${visible.length} paket ditampilkan • setiap paket berisi ringkasan materi, latihan, LKPD, dan formulir jawaban.`;
    document.querySelector("#material-completed").textContent = `${state.completed.length}/30`;
  }

  function openLesson(chapterId, view = "material") {
    currentChapter = chapters.find((chapter) => chapter.id === chapterId);
    if (!currentChapter) return;
    currentLessonView = view;
    document.querySelector("#student-library").hidden = true;
    document.querySelector("#lesson-viewer").hidden = false;
    document.querySelector("#lesson-meta").textContent = `Kelas ${currentChapter.grade} • Semester ${currentChapter.semester} • ${currentChapter.element} • ${currentChapter.allocation} JP`;
    document.querySelector("#lesson-title").textContent = currentChapter.title;
    document.querySelector("#lesson-overview").textContent = currentChapter.overview;
    renderLesson();
    document.querySelector("#lesson-viewer").scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
  }

  function moduleSourceNote(chapter) {
    if (chapter.grade === "VII") {
      return "Ringkasan materi, latihan, dan LKPD ini diolah dari Perangkat Ajar PAIBP Kelas VII Revisi CP Terbaru yang dilampirkan pengelola.";
    }
    if (chapter.number <= 2) {
      return `Diolah dari Modul ${chapter.number} Kelas ${chapter.grade} yang menjadi acuan komposisi lengkap CP 2026.`;
    }
    return `Diolah dari Modul ${chapter.number} Kelas ${chapter.grade}; perangkat gurunya telah dilengkapi mengikuti komposisi Modul 1–2 tanpa mengubah topik asli bab.`;
  }

  function lessonMaterialHtml(chapter) {
    return `
      <section class="document-cover">
        <p>PAIBP SMART SMP • MATERI HASIL PENGOLAHAN MODUL</p>
        <h2>${chapter.title}</h2>
        <div class="identity-grid">
          <span><small>Kelas</small><strong>${chapter.grade}</strong></span>
          <span><small>Semester</small><strong>${chapter.semester}</strong></span>
          <span><small>Elemen</small><strong>${chapter.element}</strong></span>
          <span><small>Alokasi</small><strong>${chapter.allocation} JP</strong></span>
        </div>
        <p class="document-note">${escapeHtml(moduleSourceNote(chapter))}</p>
      </section>
      <section class="document-section">
        <h3>A. Tujuan Pembelajaran</h3>
        <ol>${chapter.objectives.map((item) => `<li>${item}.</li>`).join("")}</ol>
      </section>
      ${chapter.references?.length ? `
        <section class="document-section">
          <h3>Dalil dan Sumber Pokok Modul</h3>
          <ul>${chapter.references.map((item) => `<li>${escapeHtml(item)}.</li>`).join("")}</ul>
          <p class="document-note">Baca teks dan penjelasan lengkap melalui Al Qur'an, kitab hadits, buku teks resmi, dan bimbingan guru; jangan mengambil kesimpulan hanya dari potongan terjemahan.</p>
        </section>` : ""}
      <section class="document-section">
        <h3>B. Pengantar Kontekstual</h3>
        <p>${chapter.overview}</p>
        <div class="thinking-prompt"><strong>Pertanyaan pemantik:</strong> Bagaimana tema bab ini memengaruhi keputusan, kebiasaan, dan tanggung jawab murid dalam kehidupan nyata?</div>
      </section>
      <section class="document-section">
        <h3>C. Materi Inti</h3>
        <div class="concept-stack">
          ${chapter.concepts.map(([title, body], index) => `
            <article>
              <span>${index + 1}</span>
              <div><h4>${title}</h4><p>${body}</p></div>
            </article>`).join("")}
        </div>
      </section>
      <section class="document-section">
        <h3>D. Penerapan dalam Kehidupan</h3>
        <p>Pemahaman dinilai bermakna ketika dapat diterapkan secara sadar. Contoh tindakan yang dapat dilatih:</p>
        <ul class="application-list">${chapter.applications.map((item) => `<li>${item}.</li>`).join("")}</ul>
      </section>
      <section class="document-section">
        <h3>E. Cek Pemahaman</h3>
        <ol>${chapter.questions.map((item) => `<li>${item}</li>`).join("")}</ol>
      </section>
      <section class="document-section">
        <h3>F. Tugas Produk</h3>
        <div class="project-box"><strong>Proyek bab:</strong> ${chapter.project}</div>
        <p><strong>Kriteria umum:</strong> isi benar, bukti atau alasan jelas, karya rapi, sumber dicantumkan, dan proses dilakukan dengan jujur.</p>
      </section>`;
  }

  function lessonSummaryHtml(chapter) {
    return `
      <section class="document-cover compact-cover">
        <p>RINGKASAN BAB • KELAS ${chapter.grade}</p>
        <h2>${chapter.title}</h2>
      </section>
      <section class="document-section summary-sheet">
        <h3>Inti Pemahaman</h3>
        <p class="summary-lead">${chapter.overview}</p>
        <div class="summary-points">
          ${chapter.concepts.map(([title, body], index) => `
            <article><span>${index + 1}</span><div><strong>${title}</strong><p>${body}</p></div></article>`).join("")}
        </div>
      </section>
      <section class="document-section">
        <h3>Kata Kunci Tindakan</h3>
        <div class="keyword-cloud">${chapter.applications.map((item) => `<span>${item}</span>`).join("")}</div>
      </section>
      <section class="document-section">
        <h3>Kalimat Refleksi</h3>
        <p>Setelah mempelajari bab ini, pemahaman yang paling penting bagi saya adalah …, dan tindakan yang akan saya biasakan ialah ….</p>
      </section>`;
  }

  function lessonWorksheetHtml(chapter) {
    return `
      <section class="document-cover worksheet-cover">
        <p>LEMBAR KERJA MURID • PAIBP SMART SMP</p>
        <h2>LKPD: ${chapter.title}</h2>
        <table class="identity-table">
          <tr><th>Nama</th><td>....................................................................</td><th>Kelas</th><td>....................</td></tr>
          <tr><th>Kelompok</th><td>....................................................................</td><th>Tanggal</th><td>....................</td></tr>
        </table>
      </section>
      <section class="document-section">
        <h3>A. Tujuan LKPD</h3>
        <ul>${chapter.objectives.map((item) => `<li>${item}.</li>`).join("")}</ul>
      </section>
      <section class="document-section">
        <h3>B. Petunjuk</h3>
        <ol>
          <li>Baca materi bab secara utuh sebelum mengerjakan.</li>
          <li>Diskusikan dengan santun dan tuliskan alasan, bukan hanya jawaban akhir.</li>
          <li>Gunakan sumber yang dapat dipercaya dan cantumkan jika mengambil informasi tambahan.</li>
          <li>Setiap anggota menyampaikan kontribusinya secara jujur.</li>
        </ol>
      </section>
      <section class="document-section worksheet-activity">
        <h3>C. Aktivitas 1 — Peta Konsep</h3>
        <p>Hubungkan empat konsep berikut dan jelaskan hubungan antarkonsep dengan kalimat sendiri.</p>
        <div class="concept-map">
          ${chapter.concepts.map(([title]) => `<span>${title}</span>`).join("")}
        </div>
        <div class="answer-space tall"></div>
      </section>
      <section class="document-section worksheet-activity">
        <h3>D. Aktivitas 2 — Analisis</h3>
        <ol>${chapter.questions.map((item) => `<li>${item}<div class="answer-space"></div></li>`).join("")}</ol>
      </section>
      <section class="document-section worksheet-activity">
        <h3>E. Aktivitas 3 — Produk Bermakna</h3>
        <div class="project-box">${chapter.project}</div>
        <table class="planning-table">
          <tr><th>Tujuan produk</th><td></td></tr>
          <tr><th>Pembagian tugas</th><td></td></tr>
          <tr><th>Sumber/bukti</th><td></td></tr>
          <tr><th>Jadwal kerja</th><td></td></tr>
          <tr><th>Indikator keberhasilan</th><td></td></tr>
        </table>
      </section>
      <section class="document-section">
        <h3>F. Refleksi</h3>
        <ol>
          <li>Hal baru yang saya pahami: <div class="answer-space"></div></li>
          <li>Bagian yang masih perlu saya pelajari: <div class="answer-space"></div></li>
          <li>Tindakan nyata yang akan saya lakukan: <div class="answer-space"></div></li>
        </ol>
      </section>
      <section class="document-section">
        <h3>G. Rubrik Ringkas</h3>
        <table class="data-table">
          <thead><tr><th>Aspek</th><th>Mahir (4)</th><th>Cakap (3)</th><th>Berkembang (2)</th><th>Perlu Bimbingan (1)</th></tr></thead>
          <tbody>
            <tr><td>Ketepatan isi</td><td>Benar, lengkap, mendalam</td><td>Benar dan cukup lengkap</td><td>Sebagian benar</td><td>Belum menunjukkan pemahaman</td></tr>
            <tr><td>Alasan/bukti</td><td>Kuat dan relevan</td><td>Relevan</td><td>Masih umum</td><td>Belum ada</td></tr>
            <tr><td>Kolaborasi</td><td>Aktif dan saling menguatkan</td><td>Menjalankan peran</td><td>Peran belum konsisten</td><td>Belum berkontribusi</td></tr>
            <tr><td>Integritas</td><td>Sumber dan proses transparan</td><td>Sumber dicantumkan</td><td>Sumber belum lengkap</td><td>Menyalin tanpa pengakuan</td></tr>
          </tbody>
        </table>
      </section>`;
  }

  function loadStudentIdentity() {
    return safeJsonParse(localStorage.getItem(STUDENT_IDENTITY_KEY), null) || {
      name: "",
      attendance: "",
      className: "",
    };
  }

  function loadStudentWorks() {
    return safeJsonParse(localStorage.getItem(STUDENT_WORK_KEY), null) || {};
  }

  function lessonSubmissionHtml(chapter) {
    const identity = loadStudentIdentity();
    const work = loadStudentWorks()[chapter.id] || {};
    const answers = Array.isArray(work.answers) ? work.answers : [];
    const reflections = Array.isArray(work.reflections) ? work.reflections : [];
    return `
      <form id="student-work-form" class="student-work-form">
        <section class="document-cover worksheet-cover">
          <p>JAWABAN DAN PENGIRIMAN TUGAS • PAIBP SMART SMP</p>
          <h2>${escapeHtml(chapter.title)}</h2>
          <div class="student-identity-form">
            <label>Nama lengkap
              <input name="studentName" autocomplete="name" maxlength="80" value="${escapeHtml(identity.name)}" required>
            </label>
            <label>Nomor absen
              <input name="attendance" inputmode="numeric" maxlength="4" value="${escapeHtml(identity.attendance)}" required>
            </label>
            <label>Kelas
              <input name="className" maxlength="20" placeholder="Contoh: VIII A" value="${escapeHtml(identity.className)}" required>
            </label>
          </div>
          <p class="privacy-note">Identitas dan jawaban disimpan hanya pada perangkat ini. Saat “Kirim kepada guru” dipilih, situs membuat satu berkas tugas untuk dibagikan langsung kepada guru.</p>
        </section>
        <section class="document-section">
          <h3>A. Jawaban Latihan Pemahaman</h3>
          <ol class="interactive-answer-list">
            ${chapter.questions.map((question, index) => `
              <li>
                <label for="answer-${index}">${escapeHtml(question)}</label>
                <textarea id="answer-${index}" name="answer-${index}" rows="5" maxlength="4000" required>${escapeHtml(answers[index] || "")}</textarea>
              </li>`).join("")}
          </ol>
        </section>
        <section class="document-section">
          <h3>B. Rencana Produk/LKPD</h3>
          <div class="project-box"><strong>Tugas:</strong> ${escapeHtml(chapter.project)}</div>
          <label class="block-field">Tuliskan rencana, pembagian kerja, sumber, langkah, dan hasil yang diharapkan.
            <textarea name="projectPlan" rows="8" maxlength="6000" required>${escapeHtml(work.projectPlan || "")}</textarea>
          </label>
        </section>
        <section class="document-section">
          <h3>C. Refleksi Murid</h3>
          ${[
            "Hal baru yang saya pahami",
            "Bagian yang masih perlu saya pelajari",
            "Tindakan nyata yang akan saya lakukan",
          ].map((prompt, index) => `
            <label class="block-field">${prompt}
              <textarea name="reflection-${index}" rows="4" maxlength="2500" required>${escapeHtml(reflections[index] || "")}</textarea>
            </label>`).join("")}
        </section>
        <section class="document-section submission-actions no-print">
          <button class="btn" type="button" data-save-work>Simpan di perangkat</button>
          <button class="btn" type="button" data-print-work>Cetak / Simpan PDF</button>
          <button class="cta" type="submit">Kirim kepada guru</button>
        </section>
      </form>`;
  }

  function collectStudentWork() {
    const form = document.querySelector("#student-work-form");
    if (!form || !currentChapter) return null;
    const fieldValue = (name) => String(form.querySelector(`[name="${name}"]`)?.value || "").trim();
    const identity = {
      name: fieldValue("studentName"),
      attendance: fieldValue("attendance"),
      className: fieldValue("className"),
    };
    const answers = currentChapter.questions.map((_, index) => fieldValue(`answer-${index}`));
    const reflections = [0, 1, 2].map((index) => fieldValue(`reflection-${index}`));
    return {
      identity,
      answers,
      projectPlan: fieldValue("projectPlan"),
      reflections,
      savedAt: new Date().toISOString(),
    };
  }

  function setStudentStatus(message, isError = false) {
    const status = document.querySelector("#student-save-status");
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("error", isError);
  }

  function saveCurrentStudentWork({ silent = false } = {}) {
    const work = collectStudentWork();
    if (!work || !currentChapter) {
      if (!silent) setStudentStatus("Buka tab “Jawaban & Kirim” untuk mengisi pekerjaan.", true);
      return null;
    }
    localStorage.setItem(STUDENT_IDENTITY_KEY, JSON.stringify(work.identity));
    const allWorks = loadStudentWorks();
    allWorks[currentChapter.id] = {
      answers: work.answers,
      projectPlan: work.projectPlan,
      reflections: work.reflections,
      savedAt: work.savedAt,
    };
    localStorage.setItem(STUDENT_WORK_KEY, JSON.stringify(allWorks));
    if (!silent) setStudentStatus(`Jawaban ${currentChapter.id} tersimpan di perangkat pada ${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}.`);
    return work;
  }

  function buildSubmission(work) {
    const randomPart = typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return {
      schema: "paibp-smart-submission",
      version: 1,
      submissionId: randomPart,
      createdAt: new Date().toISOString(),
      school: { name: "SMP Negeri 1 Susukan", npsn: "20304047" },
      subject: "Pendidikan Agama Islam dan Budi Pekerti",
      chapter: {
        id: currentChapter.id,
        grade: currentChapter.grade,
        semester: currentChapter.semester,
        number: currentChapter.number,
        title: currentChapter.title,
      },
      student: work.identity,
      work: {
        questions: currentChapter.questions.map((question, index) => ({
          question,
          answer: work.answers[index],
        })),
        project: { prompt: currentChapter.project, answer: work.projectPlan },
        reflections: [
          ["Hal baru yang saya pahami", work.reflections[0]],
          ["Bagian yang masih perlu saya pelajari", work.reflections[1]],
          ["Tindakan nyata yang akan saya lakukan", work.reflections[2]],
        ].map(([prompt, answer]) => ({ prompt, answer })),
      },
    };
  }

  async function exportAndShareStudentWork() {
    if (!currentChapter) return;
    if (currentLessonView !== "submission") {
      currentLessonView = "submission";
      renderLesson();
      setStudentStatus("Lengkapi identitas dan seluruh jawaban, lalu pilih “Kirim kepada guru” sekali lagi.", true);
      document.querySelector("[name='studentName']")?.focus();
      return;
    }
    const form = document.querySelector("#student-work-form");
    if (!form?.reportValidity()) {
      setStudentStatus("Lengkapi identitas dan seluruh jawaban sebelum mengirim.", true);
      return;
    }
    const work = saveCurrentStudentWork({ silent: true });
    const submission = buildSubmission(work);
    const filename = `Tugas-PAIBP-${currentChapter.id}-${work.identity.className}-${work.identity.attendance}-${work.identity.name}`
      .replace(/[^\p{L}\p{N}._-]+/gu, "-")
      .replace(/-+/g, "-")
      .slice(0, 140) + ".paibp";
    const file = new File([JSON.stringify(submission, null, 2)], filename, {
      type: "application/json",
    });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: `Tugas PAIBP ${currentChapter.id}`,
          text: `Tugas ${work.identity.name}, ${work.identity.className}, bab ${currentChapter.title}.`,
          files: [file],
        });
        setStudentStatus("Menu berbagi telah dibuka. Pilih guru/kanal yang benar sebelum mengirim.");
        return;
      } catch (error) {
        if (error?.name === "AbortError") {
          setStudentStatus("Pengiriman dibatalkan; jawaban tetap tersimpan.");
          return;
        }
      }
    }
    downloadBlob(file, filename);
    setStudentStatus("Berkas tugas telah diunduh. Kirimkan berkas .paibp itu kepada guru melalui kanal yang disepakati.");
  }

  function attachStudentWorkForm() {
    const form = document.querySelector("#student-work-form");
    if (!form) return;
    let saveTimer = null;
    form.addEventListener("input", () => {
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => saveCurrentStudentWork({ silent: true }), 600);
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      exportAndShareStudentWork();
    });
    form.querySelector("[data-save-work]")?.addEventListener("click", () => saveCurrentStudentWork());
    form.querySelector("[data-print-work]")?.addEventListener("click", () => {
      saveCurrentStudentWork({ silent: true });
      printStudentWork();
    });
  }

  function renderLesson() {
    if (!currentChapter) return;
    const buttons = [...document.querySelectorAll("[data-lesson-view]")];
    setPressed(buttons, "lessonView", currentLessonView);
    const content = document.querySelector("#lesson-content");
    if (currentLessonView === "summary") content.innerHTML = lessonSummaryHtml(currentChapter);
    else if (currentLessonView === "worksheet") content.innerHTML = lessonWorksheetHtml(currentChapter);
    else if (currentLessonView === "submission") content.innerHTML = lessonSubmissionHtml(currentChapter);
    else content.innerHTML = lessonMaterialHtml(currentChapter);
    if (currentLessonView === "submission") attachStudentWorkForm();
    setStudentStatus(currentLessonView === "submission" ? "Jawaban tersimpan otomatis saat diketik." : "");
    updateLessonCompleteButton();
  }

  document.querySelectorAll("[data-lesson-view]").forEach((button) => button.addEventListener("click", () => {
    currentLessonView = button.dataset.lessonView;
    renderLesson();
  }));
  document.querySelector("#back-to-library")?.addEventListener("click", () => {
    document.querySelector("#lesson-viewer").hidden = true;
    document.querySelector("#student-library").hidden = false;
    renderChapterCards();
  });
  document.querySelector("#toggle-lesson-complete")?.addEventListener("click", () => {
    if (!currentChapter) return;
    if (state.completed.includes(currentChapter.id)) {
      state.completed = state.completed.filter((id) => id !== currentChapter.id);
    } else {
      state.completed = [...state.completed, currentChapter.id];
    }
    saveState();
    updateProgress();
    updateLessonCompleteButton();
  });
  document.querySelector("#save-student-work")?.addEventListener("click", () => {
    if (currentLessonView !== "submission") {
      currentLessonView = "submission";
      renderLesson();
      setStudentStatus("Isi jawaban pada formulir; situs akan menyimpannya otomatis.");
      return;
    }
    saveCurrentStudentWork();
  });
  document.querySelector("#send-student-work")?.addEventListener("click", exportAndShareStudentWork);

  function updateLessonCompleteButton() {
    const button = document.querySelector("#toggle-lesson-complete");
    if (!button || !currentChapter) return;
    const completed = state.completed.includes(currentChapter.id);
    button.textContent = completed ? "✓ Bab sudah selesai" : "Tandai selesai";
    button.classList.toggle("is-complete", completed);
  }

  function printDocument(title, html) {
    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup) {
      window.alert("Izinkan pop-up untuk mencetak atau menyimpan dokumen sebagai PDF.");
      return;
    }
    popup.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${title}</title>
      <style>
        body{font-family:Cambria,Georgia,serif;color:#142d35;line-height:1.55;margin:28px}
        h1,h2,h3,h4{line-height:1.25}h2{font-size:26px}.document-cover{border:2px solid #087f68;padding:28px;margin-bottom:24px}
        .identity-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.identity-grid span{border:1px solid #ccd8d4;padding:8px}
        .identity-grid small,.identity-grid strong{display:block}.document-section{margin:24px 0;break-inside:avoid}
        table{width:100%;border-collapse:collapse;margin:12px 0}th,td{border:1px solid #9eaaa6;padding:8px;text-align:left;vertical-align:top}
        th{background:#e7f5f0}.concept-stack article,.summary-points article{display:flex;gap:12px;border:1px solid #ccd8d4;padding:12px;margin:8px 0}
        .concept-stack article>span,.summary-points article>span{font-weight:bold}.project-box,.thinking-prompt{background:#fff5d7;border-left:4px solid #e4af31;padding:12px}
        .answer-space{min-height:60px;border-bottom:1px dotted #777;margin:8px 0}.answer-space.tall{min-height:150px}
        .concept-map{display:grid;grid-template-columns:1fr 1fr;gap:10px}.concept-map span{border:1px solid #087f68;padding:12px;text-align:center}
        .keyword-cloud span{display:inline-block;border:1px solid #087f68;padding:6px 9px;margin:4px}
        .teacher-source{border-left:4px solid #087f68;padding:12px;background:#eaf8f3}
        input{border:0;border-bottom:1px solid #333;width:60px}
        @media print{body{margin:12mm}.no-print{display:none!important}a{color:#000;text-decoration:none}}
      </style></head><body>${html}</body></html>`);
    popup.document.close();
    popup.focus();
    popup.print();
  }

  function printableHtmlFrom(source) {
    if (!source) return "";
    const clone = source.cloneNode(true);
    const originalFields = [...source.querySelectorAll("input, textarea, select")];
    const clonedFields = [...clone.querySelectorAll("input, textarea, select")];
    clonedFields.forEach((field, index) => {
      const original = originalFields[index];
      if (!original) return;
      if (field instanceof HTMLTextAreaElement) {
        const answer = document.createElement("div");
        answer.className = "printed-answer";
        answer.textContent = original.value || "Belum diisi";
        field.replaceWith(answer);
      } else if (field instanceof HTMLInputElement) {
        const answer = document.createElement("strong");
        answer.textContent = original.value || "Belum diisi";
        field.replaceWith(answer);
      } else if (field instanceof HTMLSelectElement) {
        const answer = document.createElement("strong");
        answer.textContent = original.selectedOptions[0]?.textContent || "";
        field.replaceWith(answer);
      }
    });
    return clone.innerHTML;
  }

  function currentPrintableLessonHtml() {
    return printableHtmlFrom(document.querySelector("#lesson-content"));
  }

  function printStudentWork() {
    if (!currentChapter) return;
    printDocument(`Tugas ${currentChapter.id} — ${currentChapter.title}`, currentPrintableLessonHtml());
  }

  document.querySelector("#print-lesson")?.addEventListener("click", () => {
    if (!currentChapter) return;
    printDocument(`${currentChapter.title} — ${currentLessonView}`, currentPrintableLessonHtml());
  });

  const teacherGradeButtons = [...document.querySelectorAll("[data-teacher-grade]")];
  const teacherDocButtons = [...document.querySelectorAll("[data-teacher-doc]")];
  teacherGradeButtons.forEach((button) => button.addEventListener("click", () => {
    teacherGrade = button.dataset.teacherGrade;
    setPressed(teacherGradeButtons, "teacherGrade", teacherGrade);
    renderTeacherDocument();
  }));
  teacherDocButtons.forEach((button) => button.addEventListener("click", () => {
    teacherDoc = button.dataset.teacherDoc;
    setPressed(teacherDocButtons, "teacherDoc", teacherDoc);
    renderTeacherDocument();
  }));

  function teacherIdentity(title) {
    return `
      <section class="document-cover compact-cover">
        <p>PAIBP • FASE D • TAHUN AJARAN 2026/2027</p>
        <h2>${title}</h2>
        <table class="identity-table">
          <tr><th>Satuan Pendidikan</th><td>SMP Negeri 1 Susukan</td><th>Kelas</th><td>${teacherGrade}</td></tr>
          <tr><th>Mata Pelajaran</th><td>PAIBP</td><th>Penyusun</th><td>Sunarso, S.Pd.I., Gr.</td></tr>
        </table>
      </section>`;
  }

  function cpDocument() {
    return `${teacherIdentity("Capaian Pembelajaran PAIBP Terbaru")}
      <section class="document-section">
        <div class="teacher-source">
          <strong>Dasar terbaru:</strong> ${cp.regulation}, ${cp.amendment}. Pembaruan tahun 2026 secara khusus berlaku pada mata pelajaran Agama dan Budi Pekerti.
          <br><a href="${cp.sourceUrl}" target="_blank" rel="noopener">Buka sumber resmi BKPDM ↗</a>
        </div>
        <p class="document-note">${cp.note}</p>
      </section>
      <section class="document-section">
        <h3>Rumusan Operasional Fase D</h3>
        <p>${cp.phase}</p>
      </section>
      <section class="document-section">
        <h3>Elemen dan Arah Capaian</h3>
        <div class="cp-grid">${cp.elements.map(([title, body]) => `<article><h4>${title}</h4><p>${body}</p></article>`).join("")}</div>
      </section>
      <section class="document-section">
        <h3>Implikasi Perencanaan</h3>
        <ul>
          <li>Tujuan pembelajaran diturunkan menjadi kompetensi yang dapat diamati melalui pengetahuan, keterampilan, sikap, dan pengamalan.</li>
          <li>Materi kelas VII–IX disusun berurutan, kontekstual, serta menghubungkan lima elemen.</li>
          <li>Asesmen menggunakan bukti beragam: tes, unjuk kerja, produk, proyek, observasi, refleksi, dan portofolio.</li>
          <li>Pembelajaran menumbuhkan delapan dimensi profil lulusan serta budaya belajar berkesadaran, bermakna, dan menggembirakan.</li>
        </ul>
      </section>`;
  }

  function kktpDocument(gradeChapters) {
    return `${teacherIdentity(`Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) Kelas ${teacherGrade}`)}
      <section class="document-section">
        <h3>A. Prinsip</h3>
        <p>KKTP menggunakan deskripsi bukti belajar, bukan sekedar angka tunggal. Target umum ketercapaian berada pada kategori <strong>Cakap</strong>; guru dapat menyesuaikan bukti, dukungan, dan kompleksitas sesuai kondisi murid.</p>
        <table class="data-table">
          <thead><tr><th>Kategori</th><th>Deskripsi Umum</th><th>Tindak Lanjut</th></tr></thead>
          <tbody>
            <tr><td>Perlu Bimbingan</td><td>Belum menunjukkan konsep dasar dan memerlukan contoh serta pendampingan intensif.</td><td>Pembelajaran ulang terarah.</td></tr>
            <tr><td>Berkembang</td><td>Memahami sebagian konsep, tetapi alasan, ketepatan, atau penerapan belum konsisten.</td><td>Latihan bertahap dan umpan balik.</td></tr>
            <tr><td>Cakap</td><td>Memahami konsep dengan benar, memberikan alasan, dan menerapkan pada situasi yang dikenal.</td><td>Melanjutkan tujuan berikutnya.</td></tr>
            <tr><td>Mahir</td><td>Menganalisis secara mendalam, menghubungkan konteks baru, dan menghasilkan solusi/karya mandiri.</td><td>Pengayaan dan peran tutor sebaya.</td></tr>
          </tbody>
        </table>
      </section>
      <section class="document-section">
        <h3>B. KKTP per Bab</h3>
        <table class="data-table">
          <thead><tr><th>Bab</th><th>Tujuan Utama</th><th>Bukti Belajar</th><th>Kriteria Cakap</th></tr></thead>
          <tbody>${gradeChapters.map((chapter) => `
            <tr>
              <td>${chapter.number}. ${chapter.title}</td>
              <td>${chapter.objectives.join("; ")}</td>
              <td>Jawaban cek pemahaman, LKPD, dan ${chapter.project.toLowerCase()}</td>
              <td>Konsep benar; alasan relevan; penerapan sesuai; karya jujur dan dapat dipertanggungjawabkan.</td>
            </tr>`).join("")}</tbody>
        </table>
      </section>`;
  }

  function atpDocument(gradeChapters) {
    let cumulative = 0;
    return `${teacherIdentity(`Alur Tujuan Pembelajaran (ATP) Kelas ${teacherGrade}`)}
      <section class="document-section">
        <p>ATP ini mengurutkan tujuan dari pemahaman konsep, analisis, penerapan, hingga produk/refleksi. Urutan dapat disesuaikan dengan kesiapan murid dan kalender satuan pendidikan.</p>
        <table class="data-table">
          <thead><tr><th>No.</th><th>Semester</th><th>Elemen/Bab</th><th>Tujuan Pembelajaran</th><th>Alokasi</th></tr></thead>
          <tbody>${gradeChapters.map((chapter) => {
            cumulative += chapter.allocation;
            return `<tr><td>${chapter.number}</td><td>${chapter.semester}</td><td><strong>${chapter.element}</strong><br>${chapter.title}</td><td><ol>${chapter.objectives.map((item) => `<li>${item}</li>`).join("")}</ol></td><td>${chapter.allocation} JP<br><small>Kumulatif ${cumulative} JP</small></td></tr>`;
          }).join("")}</tbody>
        </table>
      </section>`;
  }

  function protaDocument(gradeChapters) {
    const semesterRows = ["Gasal", "Genap"].map((semester) => {
      const items = gradeChapters.filter((chapter) => chapter.semester === semester);
      const total = items.reduce((sum, chapter) => sum + chapter.allocation, 0);
      return `<tr><td>Semester ${semester}</td><td>${items.map((chapter) => `${chapter.number}. ${chapter.title}`).join("<br>")}</td><td>${total} JP</td><td>Materi, LKPD, asesmen formatif, proyek/produk, refleksi</td></tr>`;
    }).join("");
    const total = gradeChapters.reduce((sum, chapter) => sum + chapter.allocation, 0);
    return `${teacherIdentity(`Program Tahunan (Prota) PAIBP Kelas ${teacherGrade}`)}
      <section class="document-section">
        <table class="data-table">
          <thead><tr><th>Periode</th><th>Ruang Lingkup</th><th>Alokasi Materi</th><th>Keterangan</th></tr></thead>
          <tbody>${semesterRows}<tr class="total-row"><td colspan="2"><strong>Total materi inti</strong></td><td><strong>${total} JP</strong></td><td>Sisa waktu digunakan untuk diagnostik, sumatif, remedial, pengayaan, dan kegiatan sekolah.</td></tr></tbody>
        </table>
        <div class="teacher-source"><strong>Catatan:</strong> finalisasi jumlah JP wajib diselaraskan dengan jadwal pelajaran dan jumlah minggu efektif SMP Negeri 1 Susukan.</div>
      </section>`;
  }

  function promesDocument(gradeChapters) {
    const monthMap = { Gasal: ["Juli", "Agustus", "September", "Oktober", "November"], Genap: ["Januari", "Februari", "Maret", "April", "Mei"] };
    const rows = gradeChapters.map((chapter, index) => {
      const indexInSemester = (chapter.number - 1) % 5;
      return `<tr><td>${chapter.semester}</td><td>${monthMap[chapter.semester][indexInSemester]} ${chapter.semester === "Gasal" ? "2026" : "2027"}</td><td>${chapter.number}. ${chapter.title}</td><td>${chapter.allocation} JP</td><td>Materi utuh, LKPD, asesmen, refleksi</td></tr>`;
    }).join("");
    return `${teacherIdentity(`Program Semester (Promes) PAIBP Kelas ${teacherGrade}`)}
      <section class="document-section">
        <table class="data-table">
          <thead><tr><th>Semester</th><th>Bulan</th><th>Bab</th><th>Alokasi</th><th>Aktivitas Utama</th></tr></thead>
          <tbody>${rows}
            <tr><td>Gasal</td><td>Desember 2026</td><td colspan="2">Asesmen akhir, remedial, pengayaan, pelaporan</td><td>Menyesuaikan kalender resmi</td></tr>
            <tr><td>Genap</td><td>Juni 2027</td><td colspan="2">Asesmen akhir Tahun Ajaran, remedial, pengayaan, pelaporan</td><td>Menyesuaikan kalender resmi</td></tr>
          </tbody>
        </table>
      </section>`;
  }

  function calendarDocument() {
    return `${teacherIdentity("Kalender Pendidikan — Dokumen Kerja Sekolah")}
      <section class="document-section">
        <div class="warning"><strong>Status dokumen:</strong> kerangka kerja, bukan pengganti Keputusan Kalender Pendidikan resmi Dindikpora. Tanggal asesmen, libur, jeda semester, dan pembagian laporan harus diperbarui setelah dokumen daerah diterima sekolah.</div>
        <table class="data-table">
          <thead><tr><th>Tanggal/Rentang</th><th>Agenda</th><th>Status/Keterangan</th></tr></thead>
          <tbody>${academicCalendar.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
      </section>
      <section class="document-section">
        <h3>Checklist Finalisasi</h3>
        <ul>
          <li>Cocokkan awal dan akhir semester dengan keputusan Dindikpora Banjarnegara.</li>
          <li>Masukkan libur nasional, cuti bersama, libur khusus keagamaan, dan hari besar daerah yang resmi.</li>
          <li>Masukkan asesmen, pembagian laporan, kegiatan sekolah, serta agenda kokurikuler.</li>
          <li>Sinkronkan dengan analisis hari efektif dan jadwal PAIBP setiap rombongan belajar.</li>
        </ul>
      </section>`;
  }

  function workdaysInMonth(year, monthIndex) {
    const date = new Date(year, monthIndex, 1);
    let total = 0;
    while (date.getMonth() === monthIndex) {
      const day = date.getDay();
      if (day !== 0 && day !== 6) total += 1;
      date.setDate(date.getDate() + 1);
    }
    return total;
  }

  function loadEffectiveAdjustments() {
    try {
      return JSON.parse(localStorage.getItem(`${EFFECTIVE_KEY}-${teacherGrade}`)) || {};
    } catch {
      return {};
    }
  }

  function effectiveDocument() {
    const months = [
      [2026, 6, "Juli 2026", "Gasal"], [2026, 7, "Agustus 2026", "Gasal"], [2026, 8, "September 2026", "Gasal"],
      [2026, 9, "Oktober 2026", "Gasal"], [2026, 10, "November 2026", "Gasal"], [2026, 11, "Desember 2026", "Gasal"],
      [2027, 0, "Januari 2027", "Genap"], [2027, 1, "Februari 2027", "Genap"], [2027, 2, "Maret 2027", "Genap"],
      [2027, 3, "April 2027", "Genap"], [2027, 4, "Mei 2027", "Genap"], [2027, 5, "Juni 2027", "Genap"],
    ];
    const adjustments = loadEffectiveAdjustments();
    return `${teacherIdentity(`Analisis Hari Efektif Kelas ${teacherGrade}`)}
      <section class="document-section">
        <div class="warning"><strong>Cara menggunakan:</strong> hari Senin–Jumat dihitung otomatis. Isikan jumlah hari libur/kegiatan nonpembelajaran setelah kalender resmi diterima. Hasil tersimpan pada perangkat ini.</div>
        <table class="data-table effective-table">
          <thead><tr><th>Semester</th><th>Bulan</th><th>Hari Senin–Jumat</th><th>Libur/Kegiatan Non-Efektif</th><th>Hari Efektif</th></tr></thead>
          <tbody>${months.map(([year, monthIndex, label, semester]) => {
            const weekdays = workdaysInMonth(year, monthIndex);
            const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
            const adjustment = Math.min(weekdays, Math.max(0, Number(adjustments[key]) || 0));
            return `<tr><td>${semester}</td><td>${label}</td><td data-weekdays="${weekdays}">${weekdays}</td><td><input type="number" min="0" max="${weekdays}" value="${adjustment}" data-effective-key="${key}" aria-label="Hari non-efektif ${label}"></td><td class="effective-result">${weekdays - adjustment}</td></tr>`;
          }).join("")}</tbody>
          <tfoot><tr class="total-row"><td colspan="2"><strong>Total</strong></td><td id="effective-weekday-total"></td><td id="effective-adjustment-total"></td><td id="effective-result-total"></td></tr></tfoot>
        </table>
        <p class="document-note">Untuk analisis JP mata pelajaran per rombongan belajar, cocokkan hari jadwal PAIBP dengan tanggal libur/kegiatan. Perhitungan tabel ini merupakan dasar hari kerja efektif umum.</p>
      </section>`;
  }

  function moduleDocument(gradeChapters) {
    if (!gradeChapters.some((chapter) => chapter.id === teacherModuleChapterId)) {
      teacherModuleChapterId = gradeChapters[0]?.id || "";
    }
    const chapter = gradeChapters.find((item) => item.id === teacherModuleChapterId);
    if (!chapter) return "<p>Modul belum tersedia.</p>";
    const moduleStatus = chapter.grade === "VII"
      ? "Isi kelas VII dipertahankan sebagai perangkat yang telah lengkap, lalu dikonversi ke format web."
      : chapter.number <= 2
        ? "Modul 1–2 menjadi acuan komposisi lengkap CP 2026."
        : "Modul 3–10 telah dilengkapi mengikuti komposisi Modul 1–2: kesiapan murid, karakteristik materi, pembelajaran mendalam, diferensiasi, langkah per pertemuan, asesmen, rubrik, remedial, pengayaan, refleksi, dan lampiran.";
    const meetings = chapter.objectives.map((objective, index) => ({
      number: index + 1,
      objective,
      focus: chapter.concepts[index % chapter.concepts.length][0],
      activity: chapter.questions[index % chapter.questions.length],
    }));
    return `
      <section class="module-picker no-print">
        <label>Pilih bab
          <select id="module-chapter-select">
            ${gradeChapters.map((item) => `<option value="${item.id}"${item.id === chapter.id ? " selected" : ""}>Bab ${item.number} — ${escapeHtml(item.title)}</option>`).join("")}
          </select>
        </label>
        <span class="live-badge">${chapter.id}</span>
      </section>
      ${teacherIdentity(`Modul Ajar Lengkap Bab ${chapter.number}`)}
      <div class="teacher-source"><strong>Status pengolahan:</strong> ${escapeHtml(moduleStatus)}</div>
      <section class="document-section">
        <h3>A. Identitas Modul</h3>
        <table class="identity-table">
          <tr><th>Topik</th><td colspan="3">${escapeHtml(chapter.title)}</td></tr>
          <tr><th>Elemen</th><td>${escapeHtml(chapter.element)}</td><th>Semester</th><td>${escapeHtml(chapter.semester)}</td></tr>
          <tr><th>Alokasi</th><td>${chapter.allocation} JP</td><th>Fase/Kelas</th><td>D / ${chapter.grade}</td></tr>
          <tr><th>Model Utama</th><td colspan="3">Problem Based Learning dan Project Based Learning dengan pembelajaran mendalam</td></tr>
        </table>
      </section>
      <section class="document-section">
        <h3>B. Identifikasi Kesiapan Murid</h3>
        <div class="cp-grid">
          <article><h4>Pengetahuan Awal</h4><p>Murid telah memiliki pengalaman dasar yang berkaitan dengan ${escapeHtml(chapter.element.toLowerCase())}. Guru melakukan diagnostik untuk mengenali konsep yang sudah dipahami dan miskonsepsi yang perlu diperbaiki.</p></article>
          <article><h4>Minat dan Konteks</h4><p>Pembelajaran menghubungkan ${escapeHtml(chapter.title.toLowerCase())} dengan pengalaman keluarga, sekolah, masyarakat, dan ruang digital yang dekat dengan kehidupan murid.</p></article>
          <article><h4>Kebutuhan Belajar</h4><p>Konten tersedia melalui bacaan, peta konsep, diskusi, demonstrasi, studi kasus, dan produk kreatif. Dukungan bertahap disiapkan untuk murid yang memerlukan bimbingan.</p></article>
          <article><h4>Diagnostik Awal</h4><p>Gunakan pertanyaan: “Apa yang telah kamu ketahui?”, “Bagian apa yang paling ingin dipahami?”, dan satu studi kasus sederhana dari tema bab.</p></article>
        </div>
      </section>
      <section class="document-section">
        <h3>C. Karakteristik Materi</h3>
        <p>${escapeHtml(chapter.overview)}</p>
        <table class="data-table">
          <thead><tr><th>Jenis Pengetahuan</th><th>Arah Pengembangan</th></tr></thead>
          <tbody>
            <tr><td>Faktual</td><td>Istilah, dalil, tokoh, ketentuan, dan contoh penting pada tema.</td></tr>
            <tr><td>Konseptual</td><td>${chapter.concepts.map(([title]) => escapeHtml(title)).join("; ")}.</td></tr>
            <tr><td>Prosedural</td><td>Menganalisis kasus, menggunakan sumber yang dapat dipercaya, menyusun solusi atau produk, dan mempresentasikan hasil.</td></tr>
            <tr><td>Metakognitif</td><td>Merefleksikan pemahaman, sikap, dampak tindakan, dan rencana perbaikan pribadi.</td></tr>
          </tbody>
        </table>
      </section>
      <section class="document-section">
        <h3>D. Dimensi Profil Lulusan</h3>
        <div class="keyword-cloud">
          <span>Keimanan dan ketakwaan</span><span>Kewargaan</span><span>Penalaran kritis</span><span>Kreativitas</span>
          <span>Kolaborasi</span><span>Kemandirian</span><span>Kesehatan</span><span>Komunikasi</span>
        </div>
      </section>
      <section class="document-section">
        <h3>E. Capaian dan Tujuan Pembelajaran</h3>
        <div class="teacher-source"><strong>Dasar:</strong> ${escapeHtml(cp.regulation)}. Modul ini merupakan pengembangan operasional tingkat satuan pendidikan dan perlu digunakan bersama rumusan resmi.</div>
        ${chapter.references?.length ? `<p><strong>Dalil/sumber pokok:</strong> ${chapter.references.map(escapeHtml).join("; ")}.</p>` : ""}
        <ol>${chapter.objectives.map((item) => `<li>${escapeHtml(item)}.</li>`).join("")}</ol>
      </section>
      <section class="document-section">
        <h3>F. Kerangka Pembelajaran Mendalam</h3>
        <div class="cp-grid">
          <article><h4>Berkesadaran</h4><p>Murid memahami tujuan, menghubungkan niat belajar dengan tanggung jawab, dan memantau proses belajarnya.</p></article>
          <article><h4>Bermakna</h4><p>Konsep dihubungkan dengan persoalan nyata dan keputusan yang perlu diambil secara bertanggung jawab.</p></article>
          <article><h4>Menggembirakan</h4><p>Aktivitas memberi ruang memilih, berdiskusi, mencoba, berkarya, dan menerima umpan balik yang membangun.</p></article>
          <article><h4>Diferensiasi</h4><p>Guru menyesuaikan dukungan, cara belajar, tingkat kompleksitas kasus, dan pilihan bentuk produk tanpa menurunkan tujuan esensial.</p></article>
        </div>
      </section>
      <section class="document-section">
        <h3>G. Langkah Pembelajaran per Pertemuan</h3>
        ${meetings.map((meeting) => `
          <article class="meeting-plan">
            <h4>Pertemuan ${meeting.number} — ${escapeHtml(meeting.focus)}</h4>
            <p><strong>Tujuan:</strong> ${escapeHtml(meeting.objective)}.</p>
            <ol>
              <li><strong>Pendahuluan:</strong> salam, doa, pemeriksaan kesiapan, apersepsi kontekstual, serta penyampaian tujuan dan kriteria keberhasilan.</li>
              <li><strong>Memahami:</strong> murid mengamati sumber, membaca materi, menandai istilah penting, dan mengajukan pertanyaan.</li>
              <li><strong>Mengaplikasi:</strong> murid membahas kasus “${escapeHtml(meeting.activity)}” melalui diskusi, simulasi, atau penyelidikan kelompok.</li>
              <li><strong>Merefleksi:</strong> murid menuliskan pemahaman baru, bagian yang belum dipahami, dan tindakan yang akan dilakukan.</li>
              <li><strong>Penutup:</strong> guru memberikan umpan balik, merangkum pembelajaran, dan menyampaikan tindak lanjut.</li>
            </ol>
          </article>`).join("")}
      </section>
      <section class="document-section">
        <h3>H. Asesmen Pembelajaran</h3>
        <table class="data-table">
          <thead><tr><th>Tahap</th><th>Teknik</th><th>Bukti</th><th>Tindak Lanjut</th></tr></thead>
          <tbody>
            <tr><td>Diagnostik</td><td>Pertanyaan awal, peta konsep, studi kasus</td><td>Jawaban dan miskonsepsi awal</td><td>Pengelompokan dukungan</td></tr>
            <tr><td>Formatif</td><td>Observasi, tanya jawab, latihan, LKPD</td><td>Alasan, proses, kolaborasi, revisi</td><td>Umpan balik dan pembelajaran ulang</td></tr>
            <tr><td>Sumatif</td><td>Tes, produk/proyek, presentasi</td><td>Ketepatan konsep, penerapan, integritas</td><td>Nilai, remedial, atau pengayaan</td></tr>
          </tbody>
        </table>
        <h4>Soal analisis</h4>
        <ol>${chapter.questions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
        <h4>Produk</h4>
        <div class="project-box">${escapeHtml(chapter.project)}</div>
      </section>
      <section class="document-section">
        <h3>I. Rubrik Produk/LKPD</h3>
        <table class="data-table">
          <thead><tr><th>Aspek</th><th>Mahir (4)</th><th>Cakap (3)</th><th>Berkembang (2)</th><th>Perlu Bimbingan (1)</th></tr></thead>
          <tbody>
            <tr><td>Ketepatan isi</td><td>Benar, utuh, dan mendalam</td><td>Benar dan cukup lengkap</td><td>Sebagian benar</td><td>Konsep dasar belum tepat</td></tr>
            <tr><td>Alasan dan bukti</td><td>Relevan, kuat, bersumber</td><td>Relevan dan cukup jelas</td><td>Masih umum</td><td>Belum ada bukti</td></tr>
            <tr><td>Penerapan</td><td>Solusi realistis dan terukur</td><td>Solusi sesuai konteks</td><td>Solusi belum rinci</td><td>Belum dapat menerapkan</td></tr>
            <tr><td>Komunikasi dan integritas</td><td>Sangat jelas; sumber/proses transparan</td><td>Jelas; sumber dicantumkan</td><td>Perlu perbaikan penyajian</td><td>Menyalin atau tidak dapat menjelaskan</td></tr>
          </tbody>
        </table>
      </section>
      <section class="document-section">
        <h3>J. Remedial, Pengayaan, dan Refleksi</h3>
        <ul>
          <li><strong>Remedial:</strong> penjelasan ulang dengan contoh yang lebih konkret, latihan bertahap, tutor sebaya, lalu asesmen ulang pada tujuan yang belum tercapai.</li>
          <li><strong>Pengayaan:</strong> perluasan kasus, kajian sumber tambahan, produk publikasi, atau peran sebagai pendamping kelompok.</li>
          <li><strong>Refleksi murid:</strong> hal yang dipahami, kesulitan, strategi yang membantu, dan rencana tindakan.</li>
          <li><strong>Refleksi guru:</strong> ketercapaian tujuan, keterlibatan murid, kualitas bukti belajar, efektivitas diferensiasi, dan perbaikan pertemuan berikutnya.</li>
        </ul>
      </section>
      <section class="document-section">
        <h3>K. Lampiran dan Sumber</h3>
        <ul>
          <li>Ringkasan materi dan LKPD interaktif tersedia pada Ruang Murid bab ${chapter.id}.</li>
          <li>Gunakan Al Qur'an, kitab hadits, buku teks resmi, serta sumber pemerintah/ilmiah yang relevan dengan tema.</li>
          <li>Cantumkan edisi, penulis/lembaga, judul, tahun, dan tautan/tanggal akses untuk sumber digital.</li>
        </ul>
      </section>`;
  }

  function readSubmissionRecap() {
    const value = safeJsonParse(localStorage.getItem(SUBMISSION_RECAP_KEY), []);
    return Array.isArray(value) ? value : [];
  }

  function writeSubmissionRecap(items) {
    localStorage.setItem(SUBMISSION_RECAP_KEY, JSON.stringify(items));
  }

  function validateSubmission(payload) {
    if (payload?.schema !== "paibp-smart-submission" || payload?.version !== 1) return false;
    if (!payload.submissionId || !payload.createdAt || !payload.chapter?.id) return false;
    if (!payload.student?.name || !payload.student?.attendance || !payload.student?.className) return false;
    if (!Array.isArray(payload.work?.questions) || !Array.isArray(payload.work?.reflections)) return false;
    if (String(payload.student.name).length > 80 || String(payload.student.className).length > 20) return false;
    if (payload.work.questions.length > 20 || payload.work.reflections.length > 10) return false;
    if (payload.work.questions.some((item) => String(item?.answer || "").length > 4000)) return false;
    if (String(payload.work.project?.answer || "").length > 6000) return false;
    return true;
  }

  function submissionStudentKey(payload) {
    return [
      payload.chapter.id,
      String(payload.student.name).trim().toLocaleLowerCase("id"),
      String(payload.student.attendance).trim(),
      String(payload.student.className).trim().toLocaleUpperCase("id"),
    ].join("|");
  }

  function completionPercent(submission) {
    const values = [
      ...submission.work.questions.map((item) => item.answer),
      submission.work.project?.answer,
      ...submission.work.reflections.map((item) => item.answer),
    ];
    if (!values.length) return 0;
    return Math.round((values.filter((value) => String(value || "").trim()).length / values.length) * 100);
  }

  function submissionsDocument() {
    const recap = readSubmissionRecap();
    const rows = recap.map((item, index) => `
      <tr data-recap-id="${escapeHtml(item.submissionId)}">
        <td>${index + 1}</td>
        <td><strong>${escapeHtml(item.student.name)}</strong><br><small>Absen ${escapeHtml(item.student.attendance)}</small></td>
        <td>${escapeHtml(item.student.className)}</td>
        <td>${escapeHtml(item.chapter.id)}<br><small>${escapeHtml(item.chapter.title)}</small></td>
        <td>${new Date(item.createdAt).toLocaleString("id-ID")}</td>
        <td>${completionPercent(item)}%</td>
        <td><input class="recap-score" type="number" min="0" max="100" value="${escapeHtml(item.teacher?.score ?? "")}" aria-label="Nilai ${escapeHtml(item.student.name)}"></td>
        <td><textarea class="recap-note" rows="2" maxlength="500" aria-label="Catatan ${escapeHtml(item.student.name)}">${escapeHtml(item.teacher?.note || "")}</textarea></td>
        <td class="no-print"><button class="text-button" type="button" data-view-submission="${escapeHtml(item.submissionId)}">Lihat</button><button class="text-button danger-button" type="button" data-delete-submission="${escapeHtml(item.submissionId)}">Hapus</button></td>
      </tr>`).join("");
    return `${teacherIdentity("Rekap Pekerjaan Murid")}
      <section class="document-section no-print">
        <div class="warning"><strong>Privasi:</strong> berkas tugas hanya dibaca di browser guru dan rekap disimpan pada perangkat ini. Jangan unggah berkas identitas murid ke repositori publik.</div>
        <div class="submission-import">
          <label class="file-drop">Impor berkas tugas murid (.paibp)
            <input id="submission-files" type="file" accept=".paibp,.json,application/json" multiple>
          </label>
          <button class="btn" id="export-recap-csv" type="button">Unduh CSV</button>
          <button class="btn" id="backup-recap-json" type="button">Cadangkan rekap</button>
          <button class="text-button danger-button" id="clear-recap" type="button">Hapus semua rekap</button>
        </div>
        <p class="save-status" id="recap-status" aria-live="polite">${recap.length} pekerjaan tersimpan pada perangkat ini.</p>
      </section>
      <section class="document-section">
        <div class="table-scroll">
          <table class="data-table recap-table">
            <thead><tr><th>No.</th><th>Nama/Absen</th><th>Kelas</th><th>Bab</th><th>Dibuat</th><th>Isi</th><th>Nilai</th><th>Catatan Guru</th><th class="no-print">Aksi</th></tr></thead>
            <tbody>${rows || "<tr><td colspan='9'>Belum ada tugas. Minta murid mengirimkan berkas .paibp, lalu impor di sini.</td></tr>"}</tbody>
          </table>
        </div>
      </section>
      <section class="document-section" id="submission-detail"></section>`;
  }

  function csvCell(value) {
    const text = String(value ?? "");
    const protectedText = /^[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${protectedText.replaceAll('"', '""')}"`;
  }

  function exportRecapCsv() {
    const recap = readSubmissionRecap();
    const lines = [
      ["Nama", "Nomor Absen", "Kelas", "Bab", "Judul", "Tanggal", "Kelengkapan", "Nilai", "Catatan"],
      ...recap.map((item) => [
        item.student.name,
        item.student.attendance,
        item.student.className,
        item.chapter.id,
        item.chapter.title,
        item.createdAt,
        `${completionPercent(item)}%`,
        item.teacher?.score ?? "",
        item.teacher?.note ?? "",
      ]),
    ].map((row) => row.map(csvCell).join(","));
    downloadBlob(new Blob(["\ufeff", lines.join("\r\n")], { type: "text/csv;charset=utf-8" }), `Rekap-PAIBP-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  function renderSubmissionDetail(id) {
    const item = readSubmissionRecap().find((submission) => submission.submissionId === id);
    const container = document.querySelector("#submission-detail");
    if (!item || !container) return;
    container.innerHTML = `
      <h3>Detail Tugas — ${escapeHtml(item.student.name)}</h3>
      <p><strong>${escapeHtml(item.chapter.id)}:</strong> ${escapeHtml(item.chapter.title)} • ${escapeHtml(item.student.className)} • Absen ${escapeHtml(item.student.attendance)}</p>
      <h4>Jawaban latihan</h4>
      <ol>${item.work.questions.map((entry) => `<li><strong>${escapeHtml(entry.question)}</strong><div class="submitted-answer">${escapeHtml(entry.answer)}</div></li>`).join("")}</ol>
      <h4>Produk/LKPD</h4>
      <p>${escapeHtml(item.work.project?.prompt || "")}</p>
      <div class="submitted-answer">${escapeHtml(item.work.project?.answer || "")}</div>
      <h4>Refleksi</h4>
      ${item.work.reflections.map((entry) => `<p><strong>${escapeHtml(entry.prompt)}</strong></p><div class="submitted-answer">${escapeHtml(entry.answer)}</div>`).join("")}`;
    container.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
  }

  function attachSubmissionRecap() {
    document.querySelector("#submission-files")?.addEventListener("change", async (event) => {
      const files = [...event.target.files];
      const current = readSubmissionRecap();
      let accepted = 0;
      let rejected = 0;
      for (const file of files) {
        try {
          if (file.size > 5_000_000) throw new Error("Berkas terlalu besar");
          const parsed = JSON.parse(await file.text());
          const payloads = Array.isArray(parsed) ? parsed : [parsed];
          if (!payloads.length || payloads.some((payload) => !validateSubmission(payload))) throw new Error("Format tidak sesuai");
          payloads.forEach((payload) => {
            const logicalKey = submissionStudentKey(payload);
            const index = current.findIndex((item) => (
              item.submissionId === payload.submissionId
              || submissionStudentKey(item) === logicalKey
            ));
            if (index >= 0) current[index] = { ...payload, teacher: current[index].teacher || payload.teacher || {} };
            else current.push(payload);
            accepted += 1;
          });
        } catch {
          rejected += 1;
        }
      }
      current.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      writeSubmissionRecap(current);
      renderTeacherDocument();
      const status = document.querySelector("#recap-status");
      if (status) status.textContent = `${accepted} berkas diterima${rejected ? `, ${rejected} ditolak karena format tidak sesuai` : ""}.`;
    });
    document.querySelector("#export-recap-csv")?.addEventListener("click", exportRecapCsv);
    document.querySelector("#backup-recap-json")?.addEventListener("click", () => {
      downloadBlob(
        new Blob([JSON.stringify(readSubmissionRecap(), null, 2)], { type: "application/json" }),
        `Cadangan-Rekap-PAIBP-${new Date().toISOString().slice(0, 10)}.json`,
      );
    });
    document.querySelector("#clear-recap")?.addEventListener("click", () => {
      if (!window.confirm("Hapus seluruh rekap pekerjaan murid dari perangkat ini? Buat cadangan terlebih dahulu bila diperlukan.")) return;
      writeSubmissionRecap([]);
      renderTeacherDocument();
    });
    document.querySelectorAll("[data-view-submission]").forEach((button) => button.addEventListener("click", () => renderSubmissionDetail(button.dataset.viewSubmission)));
    document.querySelectorAll("[data-delete-submission]").forEach((button) => button.addEventListener("click", () => {
      if (!window.confirm("Hapus pekerjaan ini dari rekap lokal?")) return;
      writeSubmissionRecap(readSubmissionRecap().filter((item) => item.submissionId !== button.dataset.deleteSubmission));
      renderTeacherDocument();
    }));
    document.querySelectorAll("[data-recap-id]").forEach((row) => {
      const saveTeacherField = () => {
        const recap = readSubmissionRecap();
        const item = recap.find((entry) => entry.submissionId === row.dataset.recapId);
        if (!item) return;
        const scoreValue = row.querySelector(".recap-score").value;
        item.teacher = {
          score: scoreValue === "" ? "" : Math.min(100, Math.max(0, Number(scoreValue))),
          note: row.querySelector(".recap-note").value.trim(),
          updatedAt: new Date().toISOString(),
        };
        writeSubmissionRecap(recap);
      };
      row.querySelector(".recap-score")?.addEventListener("change", saveTeacherField);
      row.querySelector(".recap-note")?.addEventListener("change", saveTeacherField);
    });
  }

  function renderTeacherDocument() {
    const gradeChapters = chapters.filter((chapter) => chapter.grade === teacherGrade);
    let html = "";
    if (teacherDoc === "kktp") html = kktpDocument(gradeChapters);
    else if (teacherDoc === "atp") html = atpDocument(gradeChapters);
    else if (teacherDoc === "prota") html = protaDocument(gradeChapters);
    else if (teacherDoc === "promes") html = promesDocument(gradeChapters);
    else if (teacherDoc === "calendar") html = calendarDocument();
    else if (teacherDoc === "effective") html = effectiveDocument();
    else if (teacherDoc === "module") html = moduleDocument(gradeChapters);
    else if (teacherDoc === "submissions") html = submissionsDocument();
    else html = cpDocument();
    const container = document.querySelector("#teacher-document");
    if (!container) return;
    container.innerHTML = html;
    if (teacherDoc === "effective") attachEffectiveCalculator();
    if (teacherDoc === "module") {
      document.querySelector("#module-chapter-select")?.addEventListener("change", (event) => {
        teacherModuleChapterId = event.target.value;
        renderTeacherDocument();
      });
    }
    if (teacherDoc === "submissions") attachSubmissionRecap();
  }

  function attachEffectiveCalculator() {
    const inputs = [...document.querySelectorAll("[data-effective-key]")];
    const update = () => {
      const saved = {};
      let weekdaysTotal = 0;
      let adjustmentTotal = 0;
      let effectiveTotal = 0;
      inputs.forEach((input) => {
        const row = input.closest("tr");
        const weekdays = Number(row.querySelector("[data-weekdays]").dataset.weekdays);
        const adjustment = Math.min(weekdays, Math.max(0, Number(input.value) || 0));
        input.value = adjustment;
        input.setAttribute("value", String(adjustment));
        row.querySelector(".effective-result").textContent = weekdays - adjustment;
        saved[input.dataset.effectiveKey] = adjustment;
        weekdaysTotal += weekdays;
        adjustmentTotal += adjustment;
        effectiveTotal += weekdays - adjustment;
      });
      document.querySelector("#effective-weekday-total").textContent = weekdaysTotal;
      document.querySelector("#effective-adjustment-total").textContent = adjustmentTotal;
      document.querySelector("#effective-result-total").textContent = effectiveTotal;
      localStorage.setItem(`${EFFECTIVE_KEY}-${teacherGrade}`, JSON.stringify(saved));
    };
    inputs.forEach((input) => input.addEventListener("input", update));
    update();
  }

  const teacherDocTitles = {
    cp: "CP Terbaru", kktp: "KKTP", atp: "ATP", prota: "Prota", promes: "Promes",
    calendar: "Kalender Pendidikan", effective: "Analisis Hari Efektif",
    module: "Modul Ajar Lengkap", submissions: "Rekap Pekerjaan Murid",
  };
  document.querySelector("#print-teacher-document")?.addEventListener("click", () => {
    printDocument(
      `${teacherDocTitles[teacherDoc]} Kelas ${teacherGrade}`,
      printableHtmlFrom(document.querySelector("#teacher-document")),
    );
  });
  document.querySelector("#download-teacher-document")?.addEventListener("click", () => {
    const title = `${teacherDocTitles[teacherDoc]}-PAIBP-Kelas-${teacherGrade}-2026-2027`;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
      <style>
        body{font-family:Cambria,Georgia,serif;color:#142d35;line-height:1.5}
        h1,h2,h3,h4{line-height:1.25}h2{color:#087f68}
        .document-cover{border:2px solid #087f68;padding:24px;margin-bottom:22px}
        .document-section{margin:22px 0}table{width:100%;border-collapse:collapse}
        th,td{border:1px solid #9eaaa6;padding:8px;text-align:left;vertical-align:top}th{background:#e7f5f0}
        .teacher-source,.warning{border-left:4px solid #087f68;padding:12px;background:#eaf8f3}
        .cp-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.cp-grid article{border:1px solid #cddbd6;padding:12px}
      </style></head><body>${printableHtmlFrom(document.querySelector("#teacher-document"))}</body></html>`;
    const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  });

  function updateIslamicDate() {
    const now = new Date();
    const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "Asia/Jakarta" }).format(now);
    const arabicDays = {
      Sunday: "Ahad", Monday: "Isnain", Tuesday: "Tsalasa", Wednesday: "Arba'a",
      Thursday: "Khamis", Friday: "Jumu'ah", Saturday: "Sabtu",
    };
    document.querySelector("#arabic-day").textContent = arabicDays[weekday] || weekday;
    document.querySelector("#gregorian-date").textContent = new Intl.DateTimeFormat("id-ID", {
      day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta",
    }).format(now);
    try {
      document.querySelector("#hijri-date").textContent = new Intl.DateTimeFormat("id-ID-u-ca-islamic", {
        day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta",
      }).format(now);
    } catch {
      document.querySelector("#hijri-date").textContent = "Kalender Hijriah tidak didukung browser";
    }
    document.querySelector("#daily-motivation").textContent = motivations[Math.floor(now.getTime() / 86400000) % motivations.length];
  }

  function dateKeyJakarta() {
    const parts = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Jakarta",
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.day}-${values.month}-${values.year}`;
  }

  function readPrayerCache() {
    try {
      return JSON.parse(localStorage.getItem(PRAYER_CACHE_KEY));
    } catch {
      return null;
    }
  }

  function displayPrayerTimes(timings) {
    document.querySelectorAll("[data-prayer]").forEach((element) => {
      element.textContent = String(timings[element.dataset.prayer] || "--:--").match(/\d{1,2}:\d{2}/)?.[0] || "--:--";
    });
  }

  async function loadPrayerTimes(force = false) {
    const dateKey = dateKeyJakarta();
    const status = document.querySelector("#prayer-status");
    const cached = readPrayerCache();
    if (!force && prayerLoadedFor === dateKey) return;
    if (cached?.date === dateKey && cached.timings) {
      displayPrayerTimes(cached.timings);
      status.textContent = "Jadwal tersimpan untuk hari ini • koordinat tetap Kecamatan Susukan.";
      prayerLoadedFor = dateKey;
    }
    if (!navigator.onLine) {
      status.textContent = cached?.date === dateKey ? "Mode luring: menampilkan jadwal yang terakhir disimpan." : "Tidak ada jadwal tersimpan. Sambungkan internet untuk memperbarui.";
      return;
    }
    status.textContent = "Memperbarui jadwal sholat Kecamatan Susukan…";
    try {
      const endpoint = `https://api.aladhan.com/v1/timings/${dateKey}?latitude=-7.499&longitude=109.3848&method=20&timezonestring=Asia%2FJakarta`;
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) throw new Error("Respons jadwal tidak berhasil");
      const payload = await response.json();
      if (!payload?.data?.timings) throw new Error("Data jadwal tidak tersedia");
      displayPrayerTimes(payload.data.timings);
      localStorage.setItem(PRAYER_CACHE_KEY, JSON.stringify({ date: dateKey, timings: payload.data.timings }));
      prayerLoadedFor = dateKey;
      status.textContent = "Diperbarui berdasarkan koordinat tetap Kecamatan Susukan. Cocokkan dengan pengumuman masjid setempat.";
    } catch {
      status.textContent = cached?.date === dateKey ? "Pembaruan gagal; menampilkan jadwal tersimpan." : "Jadwal belum dapat dimuat. Coba lagi saat internet stabil.";
    }
  }

  document.querySelector("#refresh-prayer")?.addEventListener("click", () => {
    prayerLoadedFor = "";
    loadPrayerTimes(true);
  });

  function openIslamicView(name) {
    document.querySelectorAll("[data-islamic-page]").forEach((page) => {
      page.hidden = page.dataset.islamicPage !== name;
    });
    const buttons = [...document.querySelectorAll("[data-islamic-view]")];
    setPressed(buttons, "islamicView", name);
    if (name === "calendar") renderHijriCalendar();
    if (name === "insights") renderDailyInsight();
  }

  document.querySelectorAll("[data-islamic-view]").forEach((button) => {
    button.addEventListener("click", () => openIslamicView(button.dataset.islamicView));
  });

  function speakArabic(text, statusElement) {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      statusElement.textContent = "Audio perangkat tidak tersedia pada browser ini.";
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar-SA";
    utterance.rate = 0.8;
    utterance.onstart = () => {
      statusElement.textContent = "Audio perangkat sedang diputar.";
    };
    utterance.onend = () => {
      statusElement.textContent = "Pemutaran selesai.";
    };
    utterance.onerror = () => {
      statusElement.textContent = "Suara bahasa Arab tidak tersedia. Pasang suara Arab pada perangkat untuk memakai audio luring.";
    };
    window.speechSynthesis.speak(utterance);
  }

  function renderDuaList(containerId, category) {
    const container = document.querySelector(containerId);
    if (!container) return;
    const items = islamicData.dua.filter((item) => item.categories.includes(category));
    container.innerHTML = items.map((item, index) => `
      <article class="dua-card">
        <div class="dua-card-head"><span>${index + 1}</span><div><h5>${escapeHtml(item.title)}</h5><small>${escapeHtml(item.repetition)}</small></div></div>
        <p class="arabic-text" lang="ar" dir="rtl">${escapeHtml(item.arabic)}</p>
        <p>${escapeHtml(item.meaning)}</p>
        <p class="dua-source">${escapeHtml(item.source)}</p>
        <div class="dua-actions no-print">
          <button class="btn btn-compact" type="button" data-speak-dua="${escapeHtml(item.id)}">🔊 Putar audio perangkat</button>
          <span class="audio-note" data-dua-status="${escapeHtml(item.id)}">Suara lokal dapat dipakai luring bila bahasa Arab terpasang.</span>
        </div>
      </article>`).join("");
    container.querySelectorAll("[data-speak-dua]").forEach((button) => button.addEventListener("click", () => {
      const item = items.find((entry) => entry.id === button.dataset.speakDua);
      const status = container.querySelector(`[data-dua-status="${button.dataset.speakDua}"]`);
      if (item && status) speakArabic(item.arabic, status);
    }));
  }

  async function getCachedQuranResponse(request) {
    if (!("caches" in window)) return null;
    const cache = await caches.open(QURAN_CACHE_NAME);
    return cache.match(request);
  }

  async function fetchQuranSurah(surahNumber) {
    const request = new Request(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,id.indonesian,ar.alafasy`,
      { mode: "cors" },
    );
    const cached = await getCachedQuranResponse(request);
    if (!navigator.onLine && cached) return cached.json();
    try {
      const response = await fetch(request);
      if (!response.ok) throw new Error("Surat tidak dapat dimuat");
      if ("caches" in window) {
        const cache = await caches.open(QURAN_CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response.json();
    } catch (error) {
      if (cached) return cached.json();
      throw error;
    }
  }

  function renderQuran(payload) {
    const reader = document.querySelector("#quran-reader");
    const status = document.querySelector("#quran-status");
    const editions = Array.isArray(payload?.data) ? payload.data : [];
    const arabic = editions.find((item) => item.edition?.identifier === "quran-uthmani");
    const translation = editions.find((item) => item.edition?.identifier === "id.indonesian");
    const audio = editions.find((item) => item.edition?.identifier === "ar.alafasy");
    if (!arabic?.ayahs?.length) throw new Error("Teks surat tidak tersedia");
    currentQuranPayload = { arabic, translation, audio };
    reader.innerHTML = `
      <header class="quran-surah-head">
        <span>Surat ${arabic.number} • ${escapeHtml(arabic.revelationType || "")}</span>
        <h5>${escapeHtml(arabic.englishName || "")}</h5>
        <strong lang="ar" dir="rtl">${escapeHtml(arabic.name || "")}</strong>
        <p>${arabic.numberOfAyahs} ayat</p>
      </header>
      <div class="ayah-list">
        ${arabic.ayahs.map((ayah, index) => {
          const translated = translation?.ayahs?.[index]?.text || "Terjemahan belum tersedia.";
          const audioUrl = audio?.ayahs?.[index]?.audio || "";
          return `
            <article class="ayah-card">
              <div class="ayah-number">${arabic.number}:${ayah.numberInSurah}</div>
              <p class="arabic-text" lang="ar" dir="rtl">${escapeHtml(ayah.text)}</p>
              <p>${escapeHtml(translated)}</p>
              ${audioUrl ? `<audio controls preload="none" src="${escapeHtml(audioUrl)}">Browser tidak mendukung audio.</audio>` : ""}
            </article>`;
        }).join("")}
      </div>`;
    status.textContent = navigator.onLine
      ? `Surat ${arabic.englishName} berhasil dimuat dan teksnya disimpan untuk akses luring.`
      : `Mode luring: menampilkan Surat ${arabic.englishName} dari penyimpanan perangkat.`;
  }

  async function loadQuranSurah(surahNumber) {
    const status = document.querySelector("#quran-status");
    const reader = document.querySelector("#quran-reader");
    status.textContent = `Memuat Surat nomor ${surahNumber}…`;
    reader.innerHTML = "";
    try {
      const payload = await fetchQuranSurah(surahNumber);
      renderQuran(payload);
    } catch {
      currentQuranPayload = null;
      status.textContent = "Surat belum dapat dimuat. Sambungkan internet untuk membuka pertama kali, lalu surat dapat dibaca kembali saat luring.";
    }
  }

  document.querySelector("#quran-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.querySelector("#quran-surah-number");
    const value = Math.min(114, Math.max(1, Number(input.value) || 1));
    input.value = value;
    loadQuranSurah(value);
  });

  document.querySelector("#cache-quran-audio")?.addEventListener("click", async () => {
    const status = document.querySelector("#quran-status");
    const urls = currentQuranPayload?.audio?.ayahs?.map((ayah) => ayah.audio).filter(Boolean) || [];
    if (!urls.length) {
      status.textContent = "Buka satu surat terlebih dahulu sebelum menyimpan audionya.";
      return;
    }
    if (!("caches" in window)) {
      status.textContent = "Penyimpanan audio luring tidak didukung browser ini.";
      return;
    }
    const cache = await caches.open(QURAN_AUDIO_CACHE_NAME);
    let saved = 0;
    for (const url of urls) {
      try {
        const existing = await cache.match(url);
        if (!existing) {
          const response = await fetch(url, { mode: "no-cors" });
          await cache.put(url, response);
        }
        saved += 1;
        status.textContent = `Menyimpan audio luring ${saved} dari ${urls.length} ayat…`;
      } catch {
        status.textContent = `Sebagian audio gagal disimpan (${saved} dari ${urls.length}). Coba lagi dengan koneksi stabil.`;
        return;
      }
    }
    status.textContent = `${saved} audio ayat berhasil disimpan. Surat ini kini dapat diputar kembali saat luring pada perangkat yang sama.`;
  });

  function hijriParts(date) {
    const options = { day: "numeric", month: "numeric", year: "numeric", timeZone: "Asia/Jakarta" };
    const calendars = ["en-u-ca-islamic-umalqura", "en-u-ca-islamic"];
    for (const locale of calendars) {
      try {
        const parts = new Intl.DateTimeFormat(locale, options).formatToParts(date);
        const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
        const result = { day: Number(values.day), month: Number(values.month), year: Number(values.year) };
        if (result.day && result.month && result.year) return result;
      } catch {
        // Try the next calendar implementation.
      }
    }
    return null;
  }

  function calendarMarkers(date, hijri) {
    if (!hijri) return [];
    const markers = [];
    const weekday = date.getDay();
    const forbidden = (
      (hijri.month === 10 && hijri.day === 1)
      || (hijri.month === 12 && hijri.day >= 10 && hijri.day <= 13)
    );
    if (forbidden) {
      markers.push(["Dilarang puasa", "fast-forbidden"]);
    } else if (hijri.month === 9) {
      markers.push(["Ramadhan", "fast-required"]);
    } else {
      if (weekday === 1 || weekday === 4) markers.push([weekday === 1 ? "Senin" : "Kamis", "fast-sunnah"]);
      if (hijri.day >= 13 && hijri.day <= 15 && !(hijri.month === 12 && hijri.day === 13)) markers.push(["Ayyamul Bidh", "fast-sunnah"]);
      if (hijri.month === 1 && hijri.day === 9) markers.push(["Tasu'a", "fast-sunnah"]);
      if (hijri.month === 1 && hijri.day === 10) markers.push(["Asyura", "fast-sunnah"]);
      if (hijri.month === 10 && hijri.day >= 2) markers.push(["Pilih 6 Syawal", "fast-sunnah"]);
      if (hijri.month === 12 && hijri.day >= 1 && hijri.day <= 9) markers.push([hijri.day === 9 ? "Arafah" : "Awal Dzulhijjah", "fast-sunnah"]);
    }
    islamicData.historicDates
      .filter((item) => item.month === hijri.month && item.day === hijri.day)
      .forEach((item) => markers.push([item.label, "history-mark"]));
    return markers;
  }

  function renderHijriCalendar() {
    const year = islamicCalendarMonth.getFullYear();
    const month = islamicCalendarMonth.getMonth();
    const title = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(islamicCalendarMonth);
    document.querySelector("#calendar-title").textContent = title;
    const firstDay = new Date(year, month, 1).getDay();
    const mondayOffset = (firstDay + 6) % 7;
    const totalDays = new Date(year, month + 1, 0).getDate();
    const cells = Array.from({ length: mondayOffset }, () => '<div class="calendar-cell is-empty" aria-hidden="true"></div>');
    for (let day = 1; day <= totalDays; day += 1) {
      const date = new Date(year, month, day, 12);
      const hijri = hijriParts(date);
      const markers = calendarMarkers(date, hijri);
      const history = islamicData.historicDates.find((item) => item.month === hijri?.month && item.day === hijri?.day);
      cells.push(`
        <article class="calendar-cell${markers.length ? " has-marker" : ""}">
          <div><strong>${day}</strong><span>${hijri ? `${hijri.day}/${hijri.month}` : "—"}</span></div>
          ${markers.map(([label, className]) => `<small class="${className}" title="${escapeHtml(history?.note || label)}">${escapeHtml(label)}</small>`).join("")}
        </article>`);
    }
    document.querySelector("#hijri-calendar").innerHTML = `
      <div class="calendar-weekdays">${["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Ahd"].map((day) => `<span>${day}</span>`).join("")}</div>
      <div class="calendar-grid">${cells.join("")}</div>`;
    document.querySelector("#fasting-guide").innerHTML = `
      <h4>Panduan ringkas puasa</h4>
      <div class="fasting-rule-grid">${islamicData.fastingRules.map(([name, note]) => `<article><strong>${escapeHtml(name)}</strong><p>${escapeHtml(note)}</p></article>`).join("")}</div>
      <h4>Catatan tanggal sejarah</h4>
      <ul>${islamicData.historicDates.map((item) => `<li><strong>${item.day}/${item.month} H — ${escapeHtml(item.label)}:</strong> ${escapeHtml(item.note)}</li>`).join("")}</ul>`;
  }

  document.querySelector("#calendar-prev")?.addEventListener("click", () => {
    islamicCalendarMonth = new Date(islamicCalendarMonth.getFullYear(), islamicCalendarMonth.getMonth() - 1, 1);
    renderHijriCalendar();
  });
  document.querySelector("#calendar-next")?.addEventListener("click", () => {
    islamicCalendarMonth = new Date(islamicCalendarMonth.getFullYear(), islamicCalendarMonth.getMonth() + 1, 1);
    renderHijriCalendar();
  });

  function renderDailyInsight() {
    const container = document.querySelector("#daily-insight");
    if (!container || !islamicData.dailyInsights.length) return;
    const index = Math.floor(Date.now() / 86400000) % islamicData.dailyInsights.length;
    const item = islamicData.dailyInsights[index];
    container.innerHTML = `
      <span class="badge">${escapeHtml(item.type)}</span>
      <blockquote>${escapeHtml(item.text)}</blockquote>
      ${item.url
        ? `<a class="insight-source" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">${escapeHtml(item.source)} ↗</a>`
        : `<strong>${escapeHtml(item.source)}</strong>`}
      <p>${escapeHtml(item.detail)}</p>`;
  }

  function shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[target]] = [copy[target], copy[index]];
    }
    return copy;
  }

  function startQuiz() {
    quizQuestions = shuffle(questionBank).slice(0, 10);
    quizIndex = 0;
    quizScore = 0;
    quizLocked = false;
    document.querySelector("#quiz-start").hidden = true;
    document.querySelector("#quiz-next").hidden = true;
    document.querySelector("#quiz-score").textContent = "0";
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const [question, options] = quizQuestions[quizIndex];
    quizLocked = false;
    const optionContainer = document.querySelector("#quiz-options");
    optionContainer.replaceChildren();
    document.querySelector("#quiz-feedback").textContent = "";
    document.querySelector("#quiz-feedback").className = "quiz-feedback";
    document.querySelector("#quiz-question").textContent = question;
    document.querySelector("#quiz-number").textContent = `Soal ${quizIndex + 1} dari ${quizQuestions.length}`;
    document.querySelector("#quiz-best").textContent = `Skor terbaik: ${state.gameBest}`;
    document.querySelector("#quiz-progress-bar").style.width = `${((quizIndex + 1) / quizQuestions.length) * 100}%`;
    options.forEach((option, optionIndex) => {
      const button = document.createElement("button");
      button.className = "quiz-option";
      button.type = "button";
      button.innerHTML = `<span class="quiz-letter">${String.fromCharCode(65 + optionIndex)}</span><span></span>`;
      button.lastElementChild.textContent = option;
      button.addEventListener("click", () => answerQuiz(optionIndex, button));
      optionContainer.append(button);
    });
  }

  function answerQuiz(selectedIndex, selectedButton) {
    if (quizLocked) return;
    quizLocked = true;
    const [, , answer, explanation] = quizQuestions[quizIndex];
    const buttons = [...document.querySelectorAll("#quiz-options .quiz-option")];
    buttons.forEach((button, index) => {
      button.disabled = true;
      if (index === answer) button.classList.add("correct");
    });
    selectedButton.classList.add("selected");
    const feedback = document.querySelector("#quiz-feedback");
    if (selectedIndex === answer) {
      quizScore += 1;
      document.querySelector("#quiz-score").textContent = quizScore;
      feedback.textContent = `Benar. ${explanation}`;
      feedback.classList.add("success");
    } else {
      selectedButton.classList.add("wrong");
      feedback.textContent = `Belum tepat. ${explanation}`;
      feedback.classList.add("error");
    }
    const next = document.querySelector("#quiz-next");
    next.hidden = false;
    next.textContent = quizIndex === quizQuestions.length - 1 ? "Lihat Hasil" : "Soal Berikutnya";
  }

  function nextQuiz() {
    if (!quizLocked) return;
    quizIndex += 1;
    document.querySelector("#quiz-next").hidden = true;
    if (quizIndex >= quizQuestions.length) finishQuiz();
    else renderQuizQuestion();
  }

  function finishQuiz() {
    if (quizScore > state.gameBest) {
      state.gameBest = quizScore;
      saveState();
    }
    document.querySelector("#quiz-question").textContent = `Games selesai: ${quizScore} dari ${quizQuestions.length} jawaban benar.`;
    document.querySelector("#quiz-options").replaceChildren();
    const feedback = document.querySelector("#quiz-feedback");
    feedback.textContent = quizScore >= 8 ? "Hebat! Pemahamanmu sangat baik." : "Terus berlatih. Buka kembali materi yang belum dikuasai.";
    feedback.className = `quiz-feedback ${quizScore >= 8 ? "success" : "error"}`;
    document.querySelector("#quiz-number").textContent = "Hasil akhir";
    document.querySelector("#quiz-best").textContent = `Skor terbaik: ${state.gameBest}`;
    document.querySelector("#quiz-progress-bar").style.width = "100%";
    const start = document.querySelector("#quiz-start");
    start.textContent = "Main Lagi";
    start.hidden = false;
    updateProgress();
  }

  document.querySelector("#quiz-start")?.addEventListener("click", startQuiz);
  document.querySelector("#quiz-next")?.addEventListener("click", nextQuiz);
  document.querySelector("#reset-progress")?.addEventListener("click", () => {
    if (!window.confirm("Hapus seluruh progres bab dan skor games pada perangkat ini?")) return;
    state = { completed: [], gameBest: 0 };
    saveState();
    renderChapterCards();
    updateProgress();
  });

  function updateProgress() {
    const completed = state.completed.length;
    const percent = Math.round((completed / chapters.length) * 100);
    const xp = calculateXp();
    document.querySelector("#material-completed").textContent = `${completed}/30`;
    document.querySelector("#progress-completed").textContent = `${completed}/30`;
    document.querySelector("#progress-xp").textContent = `${xp} XP`;
    document.querySelector("#progress-level").textContent = getLevel(xp);
    document.querySelector("#progress-game").textContent = `${state.gameBest}/10`;
    document.querySelector("#progress-percent").textContent = `${percent}%`;
    const bar = document.querySelector("#overall-progress-bar");
    bar.value = percent;
    bar.textContent = `${percent}%`;
    document.querySelector("#quiz-best").textContent = `Skor terbaik: ${state.gameBest}`;
    const badges = [
      ["🌱", "Langkah Pertama", "Selesaikan 1 bab", completed >= 1],
      ["📚", "Tekun Belajar", "Selesaikan 5 bab", completed >= 5],
      ["🎯", "Penakluk Games", "Raih skor minimal 8", state.gameBest >= 8],
      ["🏆", "Cendekia PAIBP", "Selesaikan 30 bab", completed >= 30],
    ];
    const grid = document.querySelector("#badge-grid");
    grid.replaceChildren();
    badges.forEach(([icon, name, description, unlocked]) => {
      const item = document.createElement("article");
      item.className = `achievement-badge${unlocked ? " unlocked" : ""}`;
      item.innerHTML = `<span>${icon}</span><strong>${name}</strong><small>${description}${unlocked ? " • Terbuka" : ""}</small>`;
      grid.append(item);
    });
  }

  function staffCardHtml(person, label) {
    return `
      <article class="staff-card">
        <img src="${escapeHtml(person.image)}" alt="Foto ${escapeHtml(person.name)}" width="520" height="720" loading="lazy" decoding="async">
        <div><strong>${escapeHtml(person.name)}</strong><span>${escapeHtml(label)}</span></div>
      </article>`;
  }

  function renderSchoolProfile() {
    if (!schoolData.school) return;
    const { school, teachers, staff } = schoolData;
    const profile = document.querySelector("#school-profile");
    if (profile) {
      profile.innerHTML = `
        <div class="school-profile-copy">
          <div class="school-facts">
            <article><span>NPSN</span><strong>${escapeHtml(school.npsn)}</strong></article>
            <article><span>Status</span><strong>${escapeHtml(school.status)}</strong></article>
            <article><span>Akreditasi</span><strong>${escapeHtml(school.accreditation)}</strong></article>
            <article><span>Berdiri</span><strong>${escapeHtml(school.established)}</strong></article>
          </div>
          ${school.overview.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
          <p><strong>Alamat:</strong> ${escapeHtml(school.address)}</p>
          <div class="school-sources">${school.sources.map((source) => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.label)} ↗</a>`).join("")}</div>
        </div>
        <img class="school-profile-image" src="gerbang.jpg" alt="Gerbang SMP Negeri 1 Susukan" width="720" height="318" loading="lazy">`;
    }
    const staffGrid = document.querySelector("#staff-grid");
    if (staffGrid) staffGrid.innerHTML = staff.map((person) => staffCardHtml(person, person.role)).join("");
    const newsGallery = document.querySelector("#news-gallery");
    if (newsGallery && Array.isArray(schoolData.news) && schoolData.news.length) {
      newsGallery.className = "news-grid";
      newsGallery.innerHTML = schoolData.news.map((item) => `
        <article class="news-card">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy">
          <div>
            <time datetime="${escapeHtml(item.date)}">${new Date(`${item.date}T12:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</time>
            <h4>${escapeHtml(item.title)}</h4>
            <p>${escapeHtml(item.summary)}</p>
          </div>
        </article>`).join("");
    }
    const subjectSelect = document.querySelector("#teacher-subject-filter");
    const teacherGrid = document.querySelector("#teacher-grid");
    if (subjectSelect && teacherGrid) {
      const subjects = [...new Set(teachers.map((person) => person.subject))].sort((a, b) => a.localeCompare(b, "id"));
      subjectSelect.insertAdjacentHTML("beforeend", subjects.map((subject) => `<option value="${escapeHtml(subject)}">${escapeHtml(subject)}</option>`).join(""));
      const renderTeachers = () => {
        const selected = subjectSelect.value || "all";
        const visible = selected === "all" ? teachers : teachers.filter((person) => person.subject === selected);
        teacherGrid.innerHTML = visible.map((person) => staffCardHtml(person, person.subject)).join("");
      };
      subjectSelect.addEventListener("change", renderTeachers);
      renderTeachers();
    }
  }

  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator) || location.protocol === "file:") return null;
    try {
      serviceWorkerRegistration = await navigator.serviceWorker.register("service-worker.js");
      await navigator.serviceWorker.ready;
      return serviceWorkerRegistration;
    } catch {
      return null;
    }
  }

  renderChapterCards();
  renderTeacherDocument();
  updateProgress();
  updateIslamicDate();
  renderDuaList("#hisnul-list", "hisnul");
  renderDuaList("#morning-list", "pagi");
  renderDuaList("#evening-list", "petang");
  renderHijriCalendar();
  renderDailyInsight();
  renderSchoolProfile();
  registerServiceWorker();
}
