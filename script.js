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
  const STORAGE_KEY = "paibp-smart-progress-v3";
  const PRAYER_CACHE_KEY = "paibp-smart-prayer-cache-v1";
  const EFFECTIVE_KEY = "paibp-smart-effective-v1";
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
    ["Menghormati perbedaan tanpa mencampuradukkan akidah merupakan bentuk…", ["Toleransi", "Ghibah", "Riba", "Taklid buta"], 0, "Toleransi menjaga penghormatan, keadilan, serta batas keyakinan."],
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
    student: ["Ruang Murid", "Buka materi utuh, ringkasan, LKPD, dan progres dari 30 bab kelas VII–IX."],
    teacher: ["Ruang Guru", "Kelola CP, KKTP, ATP, Prota, Promes, kalender pendidikan, dan analisis hari efektif."],
    islamic: ["Fitur Islami", "Lihat hari Arab, tanggal Masehi dan Hijriah, jadwal sholat Susukan, serta motivasi harian."],
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
  let serviceWorkerRegistration = null;
  let prayerLoadedFor = "";
  let quizQuestions = [];
  let quizIndex = -1;
  let quizScore = 0;
  let quizLocked = false;

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
          <button type="button" data-chapter="${chapter.id}" data-view="material">📖 Materi Utuh</button>
          <button type="button" data-chapter="${chapter.id}" data-view="summary">📝 Ringkasan</button>
          <button type="button" data-chapter="${chapter.id}" data-view="worksheet">📋 LKPD</button>
        </div>`;
      list.append(card);
    });
    list.querySelectorAll("[data-chapter]").forEach((button) => {
      button.addEventListener("click", () => openLesson(button.dataset.chapter, button.dataset.view));
    });
    document.querySelector("#material-summary").textContent = `${visible.length} paket ditampilkan • setiap paket berisi materi utuh, ringkasan, dan LKPD.`;
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

  function lessonMaterialHtml(chapter) {
    return `
      <section class="document-cover">
        <p>PAIBP SMART SMP • PAKET MATERI UTUH</p>
        <h2>${chapter.title}</h2>
        <div class="identity-grid">
          <span><small>Kelas</small><strong>${chapter.grade}</strong></span>
          <span><small>Semester</small><strong>${chapter.semester}</strong></span>
          <span><small>Elemen</small><strong>${chapter.element}</strong></span>
          <span><small>Alokasi</small><strong>${chapter.allocation} JP</strong></span>
        </div>
      </section>
      <section class="document-section">
        <h3>A. Tujuan Pembelajaran</h3>
        <ol>${chapter.objectives.map((item) => `<li>${item}.</li>`).join("")}</ol>
      </section>
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

  function renderLesson() {
    if (!currentChapter) return;
    const buttons = [...document.querySelectorAll("[data-lesson-view]")];
    setPressed(buttons, "lessonView", currentLessonView);
    const content = document.querySelector("#lesson-content");
    if (currentLessonView === "summary") content.innerHTML = lessonSummaryHtml(currentChapter);
    else if (currentLessonView === "worksheet") content.innerHTML = lessonWorksheetHtml(currentChapter);
    else content.innerHTML = lessonMaterialHtml(currentChapter);
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

  document.querySelector("#print-lesson")?.addEventListener("click", () => {
    if (!currentChapter) return;
    printDocument(`${currentChapter.title} — ${currentLessonView}`, document.querySelector("#lesson-content").innerHTML);
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

  function renderTeacherDocument() {
    const gradeChapters = chapters.filter((chapter) => chapter.grade === teacherGrade);
    let html = "";
    if (teacherDoc === "kktp") html = kktpDocument(gradeChapters);
    else if (teacherDoc === "atp") html = atpDocument(gradeChapters);
    else if (teacherDoc === "prota") html = protaDocument(gradeChapters);
    else if (teacherDoc === "promes") html = promesDocument(gradeChapters);
    else if (teacherDoc === "calendar") html = calendarDocument();
    else if (teacherDoc === "effective") html = effectiveDocument();
    else html = cpDocument();
    const container = document.querySelector("#teacher-document");
    if (!container) return;
    container.innerHTML = html;
    if (teacherDoc === "effective") attachEffectiveCalculator();
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
  };
  document.querySelector("#print-teacher-document")?.addEventListener("click", () => {
    printDocument(`${teacherDocTitles[teacherDoc]} Kelas ${teacherGrade}`, document.querySelector("#teacher-document").innerHTML);
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
      </style></head><body>${document.querySelector("#teacher-document").innerHTML}</body></html>`;
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
      const endpoint = `https://api.aladhan.com/v1/timings/${dateKey}?latitude=-7.494626&longitude=109.401083&method=20&timezonestring=Asia%2FJakarta`;
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
  registerServiceWorker();
}
