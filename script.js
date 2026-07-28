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
  menuButton.addEventListener("click", () => {
    setMenu(!navigation.classList.contains("open"));
  });

  navigation.addEventListener("click", (event) => {
    if (
      event.target instanceof Element &&
      event.target.closest("a") &&
      mobileBreakpoint.matches
    ) {
      setMenu(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigation.classList.contains("open")) {
      setMenu(false);
      menuButton.focus();
    }
  });

  const handleBreakpointChange = (event) => {
    if (!event.matches) setMenu(false);
  };

  if (typeof mobileBreakpoint.addEventListener === "function") {
    mobileBreakpoint.addEventListener("change", handleBreakpointChange);
  } else {
    mobileBreakpoint.addListener(handleBreakpointChange);
  }
}

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const workspace = document.querySelector("#pusat-interaktif");

if (workspace) {
  const STORAGE_KEY = "paibp-smart-progress-v2";
  const PRAYER_CACHE_KEY = "paibp-smart-prayer-cache-v1";
  const chapters = [
    { id: "VII-1", grade: "VII", semester: "Gasal", number: 1, title: "Al Qur'an dan Sunnah sebagai Pedoman Hidup" },
    { id: "VII-2", grade: "VII", semester: "Gasal", number: 2, title: "Meneladan Nama dan Sifat Allah Subhanahu Wata'ala untuk Kebaikan Hidup" },
    { id: "VII-3", grade: "VII", semester: "Gasal", number: 3, title: "Menghadirkan Sholat dan Dzikir dalam Kehidupan" },
    { id: "VII-4", grade: "VII", semester: "Gasal", number: 4, title: "Mengagungkan Allah Subhanahu Wata'ala dengan Tunduk pada Perintah-Nya" },
    { id: "VII-5", grade: "VII", semester: "Gasal", number: 5, title: "Damaskus: Pusat Peradaban Timur Islam" },
    { id: "VII-6", grade: "VII", semester: "Genap", number: 6, title: "Alam Semesta sebagai Tanda Kekuasaan Allah Subhanahu Wata'ala" },
    { id: "VII-7", grade: "VII", semester: "Genap", number: 7, title: "Mawas Diri dan Introspeksi dalam Menjalani Kehidupan" },
    { id: "VII-8", grade: "VII", semester: "Genap", number: 8, title: "Menghindari Ghibah dan Melaksanakan Tabayun" },
    { id: "VII-9", grade: "VII", semester: "Genap", number: 9, title: "Rukhsah: Kemudahan dari Allah Subhanahu Wata'ala dalam Beribadah" },
    { id: "VII-10", grade: "VII", semester: "Genap", number: 10, title: "Andalusia: Kota Peradaban Islam di Barat" },
    { id: "VIII-1", grade: "VIII", semester: "Gasal", number: 1, title: "Inspirasi Al Qur'an: Melestarikan Alam dan Menjaga Kehidupan" },
    { id: "VIII-2", grade: "VIII", semester: "Gasal", number: 2, title: "Iman kepada Kitab-Kitab Allah Subhanahu Wata'ala" },
    { id: "VIII-3", grade: "VIII", semester: "Gasal", number: 3, title: "Amanah dan Jujur dalam Kehidupan" },
    { id: "VIII-4", grade: "VIII", semester: "Gasal", number: 4, title: "Sholat Gerhana, Istiska, dan Jenazah" },
    { id: "VIII-5", grade: "VIII", semester: "Gasal", number: 5, title: "Semangat Literasi pada Masa Daulah Abbasiyah" },
    { id: "VIII-6", grade: "VIII", semester: "Genap", number: 6, title: "Indahnya Beragama Secara Moderat" },
    { id: "VIII-7", grade: "VIII", semester: "Genap", number: 7, title: "Iman kepada Nabi dan Rasul Allah Subhanahu Wata'ala" },
    { id: "VIII-8", grade: "VIII", semester: "Genap", number: 8, title: "Toleransi dan Harmoni Antarumat Beragama" },
    { id: "VIII-9", grade: "VIII", semester: "Genap", number: 9, title: "Muamalah: Jual Beli, Utang Piutang, dan Menjauhi Riba" },
    { id: "VIII-10", grade: "VIII", semester: "Genap", number: 10, title: "Ilmuwan Muslim pada Masa Daulah Abbasiyah" },
    { id: "IX-1", grade: "IX", semester: "Gasal", number: 1, title: "Al Qur'an Menginspirasi: Semangat Mencari Ilmu" },
    { id: "IX-2", grade: "IX", semester: "Gasal", number: 2, title: "Iman kepada Hari Akhir dan Mawas Diri" },
    { id: "IX-3", grade: "IX", semester: "Gasal", number: 3, title: "Etika Pergaulan dan Komunikasi Islami" },
    { id: "IX-4", grade: "IX", semester: "Gasal", number: 4, title: "Akikah dan Kurban sebagai Wujud Syukur dan Kepedulian" },
    { id: "IX-5", grade: "IX", semester: "Gasal", number: 5, title: "Mengapresiasi Peradaban Daulah Usmani" },
    { id: "IX-6", grade: "IX", semester: "Genap", number: 6, title: "Menjadi Khalifah yang Menjaga Bumi" },
    { id: "IX-7", grade: "IX", semester: "Genap", number: 7, title: "Iman kepada Qada dan Qadar" },
    { id: "IX-8", grade: "IX", semester: "Genap", number: 8, title: "Seni Islami dan Kehidupan Harmonis" },
    { id: "IX-9", grade: "IX", semester: "Genap", number: 9, title: "Imam Mazhab dan Keteguhan Beribadah" },
    { id: "IX-10", grade: "IX", semester: "Genap", number: 10, title: "Mengapresiasi Peradaban Daulah Safawi dan Mughal" },
  ];

  const chapterSummaries = {
    "VII-1": "Mengenali kedudukan Al Qur'an dan Sunnah sebagai sumber utama ajaran Islam serta membiasakan diri menjadikannya pedoman dalam mengambil keputusan.",
    "VII-2": "Memahami nama dan sifat Allah Subhanahu Wata'ala, kemudian meneladan nilai kebaikan, kasih sayang, ketelitian, dan tanggung jawab dalam kehidupan.",
    "VII-3": "Memahami makna sholat dan dzikir serta membangun kebiasaan ibadah yang disiplin, khusyuk, dan tercermin dalam perilaku sehari-hari.",
    "VII-4": "Mempelajari sujud syukur, sahwi, dan tilawah sebagai bentuk ketundukan, kesadaran diri, serta pengagungan kepada Allah Subhanahu Wata'ala.",
    "VII-5": "Menelusuri perkembangan Daulah Umayyah di Damaskus dan mengambil ibrah dari kemajuan pemerintahan, ilmu, budaya, dan peradabannya.",
    "VII-6": "Mengamati keteraturan alam sebagai tanda kekuasaan Allah Subhanahu Wata'ala serta menumbuhkan rasa syukur dan tanggung jawab menjaga lingkungan.",
    "VII-7": "Melatih muhasabah, pengendalian diri, dan perbaikan berkelanjutan agar keputusan dan perilaku semakin matang serta bertanggung jawab.",
    "VII-8": "Memahami bahaya ghibah, pentingnya tabayun, dan etika bermedia agar tidak mudah menyebarkan kabar yang merugikan orang lain.",
    "VII-9": "Mengenali rukhsah sebagai kemudahan dalam syariat ketika menghadapi kondisi tertentu, tanpa meremehkan kewajiban ibadah.",
    "VII-10": "Mengenal perkembangan Islam di Andalusia dan meneladani semangat ilmu, toleransi, seni, serta kemajuan peradabannya.",
    "VIII-1": "Menganalisis pesan Al Qur'an tentang keseimbangan alam dan menerapkannya melalui tindakan nyata mengurangi sampah, hemat sumber daya, dan menjaga kehidupan.",
    "VIII-2": "Memahami makna iman kepada kitab-kitab Allah Subhanahu Wata'ala, perbedaan kitab dan suhuf, serta sikap mencintai Al Qur'an dan menghormati perbedaan.",
    "VIII-3": "Menumbuhkan amanah dan kejujuran dalam belajar, pergaulan, penggunaan teknologi, serta pelaksanaan tanggung jawab di rumah dan sekolah.",
    "VIII-4": "Mengenali ketentuan dan tata cara sholat gerhana, sholat istiska, dan sholat jenazah serta nilai kepedulian yang terkandung di dalamnya.",
    "VIII-5": "Menggali semangat literasi dan produktivitas pada masa Daulah Abbasiyah untuk menguatkan budaya membaca, meneliti, menulis, dan berkarya.",
    "VIII-6": "Memahami moderasi beragama sebagai cara menjalankan ajaran dengan adil, seimbang, teguh, dan tidak berlebihan.",
    "VIII-7": "Meyakini nabi dan rasul Allah Subhanahu Wata'ala serta meneladani sifat siddiq, amanah, tabligh, dan fathanah dalam kehidupan digital.",
    "VIII-8": "Membangun sikap toleran, menghormati perbedaan, bekerja sama dalam kebaikan, dan mencegah konflik tanpa mencampuradukkan akidah.",
    "VIII-9": "Memahami prinsip jual beli, utang piutang, kejujuran transaksi, serta alasan Islam melarang riba dan praktik yang merugikan.",
    "VIII-10": "Mengenal kontribusi ilmuwan Muslim pada masa Abbasiyah dalam kedokteran, matematika, astronomi, filsafat, dan bidang ilmu lainnya.",
    "IX-1": "Menghayati perintah mencari ilmu, membangun adab belajar, dan menumbuhkan semangat literasi sebagai jalan meraih keberhasilan yang bermanfaat.",
    "IX-2": "Memahami tahapan kehidupan akhirat dan menjadikan iman kepada Hari Akhir sebagai dasar untuk mawas diri, bertanggung jawab, dan beramal baik.",
    "IX-3": "Menerapkan etika pergaulan dan komunikasi Islami secara langsung maupun digital melalui tutur kata santun, penghormatan, dan penjagaan batas pergaulan.",
    "IX-4": "Memahami ketentuan akikah dan kurban serta menghayati nilai syukur, ketaatan, kepedulian sosial, dan semangat berbagi.",
    "IX-5": "Mengenal sejarah, pencapaian, dan tantangan Daulah Usmani serta mengambil pelajaran dari kekuatan ilmu, kepemimpinan, dan persatuan.",
    "IX-6": "Menguatkan peran manusia sebagai khalifah melalui kepedulian terhadap lingkungan, keadilan, keberlanjutan, dan kemaslahatan bersama.",
    "IX-7": "Memahami qada dan qadar secara seimbang agar tumbuh sikap optimis, ikhtiar, doa, tawakal, sabar, dan tanggung jawab.",
    "IX-8": "Mengapresiasi seni Islami yang menjaga nilai kebaikan, keindahan, kesantunan, dan harmoni dalam kehidupan masyarakat.",
    "IX-9": "Mengenal para imam mazhab, menghargai perbedaan pendapat fikih, dan membangun sikap beribadah yang mantap tanpa mudah menyalahkan.",
    "IX-10": "Mengenal perkembangan Daulah Safawi dan Mughal serta meneladani warisan ilmu, seni, arsitektur, pemerintahan, dan kebudayaannya.",
  };

  const quizQuestions = [
    {
      question: "Ketika menerima berita yang belum jelas di media sosial, sikap yang paling tepat adalah…",
      options: ["Langsung membagikannya", "Melakukan tabayun sebelum menyimpulkan", "Menghapus semua aplikasi", "Membalas dengan kemarahan"],
      answer: 1,
      explanation: "Tabayun berarti memeriksa kebenaran informasi sebelum mempercayai atau menyebarkannya.",
    },
    {
      question: "Contoh perilaku amanah di sekolah adalah…",
      options: ["Menyalin tugas teman", "Menyembunyikan barang temuan", "Menjalankan tugas piket dengan bertanggung jawab", "Datang hanya ketika ada penilaian"],
      answer: 2,
      explanation: "Amanah tampak dalam kesediaan menjalankan tanggung jawab dengan jujur dan konsisten.",
    },
    {
      question: "Tindakan yang mencerminkan tanggung jawab sebagai khalifah di bumi adalah…",
      options: ["Membuang sampah ke sungai", "Menggunakan air secara berlebihan", "Merawat lingkungan dan mengurangi sampah", "Membakar sampah setiap hari"],
      answer: 2,
      explanation: "Menjaga lingkungan merupakan bagian dari tanggung jawab manusia memelihara bumi.",
    },
    {
      question: "Beriman kepada kitab-kitab Allah Subhanahu Wata'ala berarti…",
      options: ["Meyakini wahyu Allah Subhanahu Wata'ala yang diturunkan kepada para rasul", "Membaca semua buku tanpa memilih", "Menghafal judul kitab saja", "Membandingkan agama untuk merendahkan orang lain"],
      answer: 0,
      explanation: "Iman kepada kitab mencakup keyakinan bahwa Allah Subhanahu Wata'ala menurunkan wahyu sebagai petunjuk.",
    },
    {
      question: "Sikap yang menunjukkan toleransi adalah…",
      options: ["Memaksa orang lain mengikuti keyakinan kita", "Menghormati perbedaan tanpa mencampuradukkan akidah", "Menghindari semua orang yang berbeda", "Mengejek tradisi orang lain"],
      answer: 1,
      explanation: "Toleransi berarti menghormati perbedaan dan hidup damai dengan tetap menjaga keyakinan masing-masing.",
    },
  ];

  const motivations = [
    "Belajar sedikit demi sedikit tetapi konsisten akan membentuk pemahaman yang kuat.",
    "Ilmu menjadi bermakna ketika terlihat dalam sikap jujur, santun, dan bermanfaat.",
    "Kesalahan bukan akhir belajar; ia menunjukkan bagian yang perlu kita perbaiki.",
    "Mulailah dari satu kebaikan sederhana, lalu jaga agar terus menjadi kebiasaan.",
    "Murid yang berani bertanya sedang membuka jalan menuju pemahaman yang lebih dalam.",
    "Gunakan teknologi untuk mendekatkan diri pada ilmu dan menghadirkan manfaat.",
    "Jaga niat, tekuni proses, dan syukuri setiap kemajuan yang berhasil dicapai.",
    "Perbedaan adalah ruang untuk belajar saling memahami dan saling menghormati.",
    "Kedisiplinan hari ini adalah fondasi keberhasilan pada masa depan.",
    "Ilmu yang baik mendorong kita menjaga sesama, lingkungan, dan amanah kehidupan.",
    "Baca dengan teliti, pikirkan dengan jernih, lalu bertindaklah dengan bijaksana.",
    "Kejujuran mungkin terasa berat sesaat, tetapi menghadirkan ketenangan yang panjang.",
    "Tidak perlu menunggu sempurna untuk mulai; mulailah agar terus menjadi lebih baik.",
    "Prestasi terbaik adalah kemajuan yang disertai akhlak mulia.",
  ];

  const panelMeta = {
    welcome: ["Pilih fitur untuk mulai", "Klik salah satu kartu statistik atau fitur di atas. Isinya akan tampil di bagian ini."],
    materials: ["Materi Kelas VII–IX", "Jelajahi 30 bab, saring menurut kelas dan semester, lalu catat progres belajar."],
    games: ["Game Edukatif", "Uji pemahaman melalui kuis lima soal dan raih skor terbaik."],
    islamic: ["Layanan Islami", "Lihat kalender harian, jadwal sholat wilayah Susukan, dan motivasi yang diperbarui otomatis."],
    progress: ["Progres dan Prestasi", "Pantau ketuntasan bab, XP, level, skor game, dan lencana pada perangkat ini."],
    offline: ["Mode Koneksi Terbatas", "Siapkan konten inti agar dapat dibuka kembali ketika koneksi internet terbatas."],
    privacy: ["Privasi Sejak Awal", "Pahami cara data lokal disimpan serta perlindungan yang diterapkan pada versi ini."],
  };

  const workspaceTitle = document.querySelector("#workspace-title");
  const workspaceDescription = document.querySelector("#workspace-description");
  const panels = [...document.querySelectorAll("[data-panel]")];
  const openButtons = [...document.querySelectorAll("[data-open-panel]")];
  const closeWorkspaceButton = document.querySelector("[data-close-workspace]");
  const gradeButtons = [...document.querySelectorAll("[data-grade-filter]")];
  const semesterButtons = [...document.querySelectorAll("[data-semester-filter]")];
  const chapterList = document.querySelector("#chapter-list");
  const materialSummary = document.querySelector("#material-summary");
  const materialCompleted = document.querySelector("#material-completed");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let filters = { grade: "all", semester: "all" };
  let state = loadState();
  let quizIndex = -1;
  let quizScore = 0;
  let quizLocked = false;
  let prayerLoadedFor = "";
  let serviceWorkerRegistration = null;

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return {
        completed: Array.isArray(saved?.completed) ? saved.completed.filter((id) => chapters.some((chapter) => chapter.id === id)) : [],
        gameBest: Number.isInteger(saved?.gameBest) ? Math.min(5, Math.max(0, saved.gameBest)) : 0,
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
    if (xp >= 1200) return "Teladan";
    if (xp >= 750) return "Cendekia";
    if (xp >= 350) return "Penjelajah";
    if (xp >= 100) return "Pembelajar";
    return "Pemula";
  }

  function setPressed(buttons, dataName, value) {
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset[dataName] === value));
    });
  }

  function openPanel(name, options = {}) {
    const target = document.querySelector(`[data-panel="${name}"]`);
    if (!target || !panelMeta[name]) return;

    if (name === "materials") {
      if (options.grade) filters.grade = options.grade;
      if (options.semester) filters.semester = options.semester;
      setPressed(gradeButtons, "gradeFilter", filters.grade);
      setPressed(semesterButtons, "semesterFilter", filters.semester);
      renderChapters();
    }

    panels.forEach((panel) => {
      panel.hidden = panel !== target;
    });
    openButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.openPanel === name);
    });

    workspaceTitle.textContent = panelMeta[name][0];
    workspaceDescription.textContent = panelMeta[name][1];

    if (name === "progress") updateProgress();
    if (name === "islamic") {
      updateIslamicDate();
      loadPrayerTimes();
    }
    if (name === "offline") updateOfflineStatus();

    workspace.scrollIntoView({
      behavior: reduceMotion.matches ? "auto" : "smooth",
      block: "start",
    });
  }

  openButtons.forEach((button) => {
    button.addEventListener("click", () => {
      openPanel(button.dataset.openPanel, {
        grade: button.dataset.grade,
        semester: button.dataset.semester,
      });
    });
  });

  closeWorkspaceButton?.addEventListener("click", () => {
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.panel !== "welcome";
    });
    openButtons.forEach((button) => button.classList.remove("is-active"));
    workspaceTitle.textContent = panelMeta.welcome[0];
    workspaceDescription.textContent = panelMeta.welcome[1];
    document.querySelector("#fitur")?.scrollIntoView({
      behavior: reduceMotion.matches ? "auto" : "smooth",
      block: "start",
    });
  });

  gradeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filters.grade = button.dataset.gradeFilter;
      setPressed(gradeButtons, "gradeFilter", filters.grade);
      renderChapters();
    });
  });

  semesterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filters.semester = button.dataset.semesterFilter;
      setPressed(semesterButtons, "semesterFilter", filters.semester);
      renderChapters();
    });
  });

  function renderChapters() {
    const visibleChapters = chapters.filter((chapter) => {
      const gradeMatch = filters.grade === "all" || chapter.grade === filters.grade;
      const semesterMatch = filters.semester === "all" || chapter.semester === filters.semester;
      return gradeMatch && semesterMatch;
    });

    chapterList.replaceChildren();

    visibleChapters.forEach((chapter) => {
      const completed = state.completed.includes(chapter.id);
      const article = document.createElement("article");
      article.className = `chapter-item${completed ? " completed" : ""}`;

      const number = document.createElement("span");
      number.className = "chapter-number";
      number.textContent = chapter.number;

      const info = document.createElement("div");
      info.className = "chapter-info";
      const title = document.createElement("strong");
      title.textContent = chapter.title;
      const meta = document.createElement("span");
      meta.textContent = `Kelas ${chapter.grade} • Semester ${chapter.semester}`;
      info.append(title, meta);

      const toggle = document.createElement("button");
      toggle.className = "chapter-toggle";
      toggle.type = "button";
      toggle.textContent = completed ? "✓ Selesai" : "Tandai selesai";
      toggle.setAttribute("aria-pressed", String(completed));
      toggle.addEventListener("click", () => {
        if (state.completed.includes(chapter.id)) {
          state.completed = state.completed.filter((id) => id !== chapter.id);
        } else {
          state.completed = [...state.completed, chapter.id];
        }
        saveState();
        renderChapters();
        updateProgress();
      });

      const details = document.createElement("details");
      details.className = "chapter-details";
      const detailsLabel = document.createElement("summary");
      detailsLabel.textContent = "Buka ringkasan bab";
      const detailsText = document.createElement("p");
      detailsText.textContent = chapterSummaries[chapter.id];
      details.append(detailsLabel, detailsText);

      article.append(number, info, toggle, details);
      chapterList.append(article);
    });

    materialSummary.textContent = `${visibleChapters.length} bab ditampilkan • ${state.completed.length} dari 30 bab telah selesai.`;
    materialCompleted.textContent = `${state.completed.length}/30`;
  }

  const quizStart = document.querySelector("#quiz-start");
  const quizNext = document.querySelector("#quiz-next");
  const quizQuestion = document.querySelector("#quiz-question");
  const quizOptions = document.querySelector("#quiz-options");
  const quizFeedback = document.querySelector("#quiz-feedback");
  const quizNumber = document.querySelector("#quiz-number");
  const quizScoreElement = document.querySelector("#quiz-score");
  const quizBest = document.querySelector("#quiz-best");
  const quizProgressBar = document.querySelector("#quiz-progress-bar");

  function startQuiz() {
    quizIndex = 0;
    quizScore = 0;
    quizLocked = false;
    quizStart.hidden = true;
    quizNext.hidden = true;
    quizScoreElement.textContent = "0";
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const item = quizQuestions[quizIndex];
    quizLocked = false;
    quizOptions.replaceChildren();
    quizFeedback.textContent = "";
    quizFeedback.className = "quiz-feedback";
    quizQuestion.textContent = item.question;
    quizNumber.textContent = `Soal ${quizIndex + 1} dari ${quizQuestions.length}`;
    quizBest.textContent = `Skor terbaik: ${state.gameBest}`;
    quizProgressBar.style.width = `${((quizIndex + 1) / quizQuestions.length) * 100}%`;

    item.options.forEach((option, optionIndex) => {
      const button = document.createElement("button");
      button.className = "quiz-option";
      button.type = "button";
      button.innerHTML = `<span class="quiz-letter">${String.fromCharCode(65 + optionIndex)}</span><span></span>`;
      button.lastElementChild.textContent = option;
      button.addEventListener("click", () => answerQuiz(optionIndex, button));
      quizOptions.append(button);
    });
  }

  function answerQuiz(selectedIndex, selectedButton) {
    if (quizLocked) return;
    quizLocked = true;
    const item = quizQuestions[quizIndex];
    const optionButtons = [...quizOptions.querySelectorAll(".quiz-option")];

    optionButtons.forEach((button, index) => {
      button.disabled = true;
      if (index === item.answer) button.classList.add("correct");
    });

    selectedButton.classList.add("selected");

    if (selectedIndex === item.answer) {
      quizScore += 1;
      quizScoreElement.textContent = quizScore;
      quizFeedback.textContent = `Benar. ${item.explanation}`;
      quizFeedback.classList.add("success");
    } else {
      selectedButton.classList.add("wrong");
      quizFeedback.textContent = `Belum tepat. ${item.explanation}`;
      quizFeedback.classList.add("error");
    }

    quizNext.hidden = false;
    quizNext.textContent = quizIndex === quizQuestions.length - 1 ? "Lihat Hasil" : "Soal Berikutnya";
  }

  function nextQuiz() {
    if (!quizLocked) return;
    quizIndex += 1;
    quizNext.hidden = true;

    if (quizIndex >= quizQuestions.length) {
      finishQuiz();
    } else {
      renderQuizQuestion();
    }
  }

  function finishQuiz() {
    if (quizScore > state.gameBest) {
      state.gameBest = quizScore;
      saveState();
    }

    quizQuestion.textContent = `Kuis selesai: ${quizScore} dari ${quizQuestions.length} jawaban benar.`;
    quizOptions.replaceChildren();
    quizFeedback.textContent = quizScore >= 4 ? "Hebat! Pemahamanmu sangat baik." : "Terus berlatih. Buka materi lalu coba kembali.";
    quizFeedback.className = `quiz-feedback ${quizScore >= 4 ? "success" : "error"}`;
    quizNumber.textContent = "Hasil akhir";
    quizBest.textContent = `Skor terbaik: ${state.gameBest}`;
    quizProgressBar.style.width = "100%";
    quizStart.textContent = "Main Lagi";
    quizStart.hidden = false;
    updateProgress();
  }

  quizStart?.addEventListener("click", startQuiz);
  quizNext?.addEventListener("click", nextQuiz);

  function updateIslamicDate() {
    const now = new Date();
    const weekday = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      timeZone: "Asia/Jakarta",
    }).format(now);
    const arabicDays = {
      Sunday: "Ahad",
      Monday: "Isnain",
      Tuesday: "Tsalasa",
      Wednesday: "Arba'a",
      Thursday: "Khamis",
      Friday: "Jumu'ah",
      Saturday: "Sabtu",
    };

    document.querySelector("#arabic-day").textContent = arabicDays[weekday] || weekday;
    document.querySelector("#gregorian-date").textContent = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(now);

    try {
      document.querySelector("#hijri-date").textContent = new Intl.DateTimeFormat("id-ID-u-ca-islamic", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      }).format(now);
    } catch {
      document.querySelector("#hijri-date").textContent = "Kalender Hijriah tidak didukung browser";
    }

    const dayIndex = Math.floor(now.getTime() / 86400000) % motivations.length;
    document.querySelector("#daily-motivation").textContent = motivations[dayIndex];
  }

  function dateKeyJakarta() {
    const parts = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.day}-${values.month}-${values.year}`;
  }

  function cleanPrayerTime(value) {
    return String(value || "--:--").match(/\d{1,2}:\d{2}/)?.[0] || "--:--";
  }

  function displayPrayerTimes(timings) {
    document.querySelectorAll("[data-prayer]").forEach((element) => {
      element.textContent = cleanPrayerTime(timings[element.dataset.prayer]);
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
      status.textContent = cached?.date === dateKey
        ? "Mode luring: menampilkan jadwal yang terakhir disimpan untuk hari ini."
        : "Tidak ada jadwal tersimpan untuk hari ini. Sambungkan internet untuk memperbarui.";
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
      localStorage.setItem(PRAYER_CACHE_KEY, JSON.stringify({
        date: dateKey,
        timings: payload.data.timings,
      }));
      prayerLoadedFor = dateKey;
      status.textContent = "Diperbarui otomatis berdasarkan koordinat tetap Kecamatan Susukan. Cocokkan dengan pengumuman masjid setempat.";
    } catch {
      status.textContent = cached?.date === dateKey
        ? "Pembaruan gagal; menampilkan jadwal tersimpan. Cocokkan dengan pengumuman masjid setempat."
        : "Jadwal belum dapat dimuat. Coba lagi saat internet stabil.";
    }
  }

  function readPrayerCache() {
    try {
      return JSON.parse(localStorage.getItem(PRAYER_CACHE_KEY));
    } catch {
      return null;
    }
  }

  document.querySelector("#refresh-prayer")?.addEventListener("click", () => {
    prayerLoadedFor = "";
    loadPrayerTimes(true);
  });

  function updateProgress() {
    const completed = state.completed.length;
    const percent = Math.round((completed / chapters.length) * 100);
    const xp = calculateXp();
    const level = getLevel(xp);

    document.querySelector("#progress-completed").textContent = `${completed}/30`;
    document.querySelector("#progress-xp").textContent = `${xp} XP`;
    document.querySelector("#progress-level").textContent = level;
    document.querySelector("#progress-game").textContent = `${state.gameBest}/5`;
    document.querySelector("#progress-percent").textContent = `${percent}%`;
    const progressBar = document.querySelector("#overall-progress-bar");
    progressBar.setAttribute("aria-valuenow", String(percent));
    progressBar.querySelector("span").style.width = `${percent}%`;
    materialCompleted.textContent = `${completed}/30`;

    const badges = [
      { icon: "🌱", name: "Langkah Pertama", description: "Selesaikan 1 bab", unlocked: completed >= 1 },
      { icon: "📚", name: "Tekun Belajar", description: "Selesaikan 5 bab", unlocked: completed >= 5 },
      { icon: "🎯", name: "Penakluk Kuis", description: "Raih skor minimal 4", unlocked: state.gameBest >= 4 },
      { icon: "🏆", name: "Cendekia PAIBP", description: "Selesaikan 30 bab", unlocked: completed >= 30 },
    ];
    const badgeGrid = document.querySelector("#badge-grid");
    badgeGrid.replaceChildren();
    badges.forEach((badge) => {
      const article = document.createElement("article");
      article.className = `achievement-badge${badge.unlocked ? " unlocked" : ""}`;
      const icon = document.createElement("span");
      icon.textContent = badge.icon;
      const name = document.createElement("strong");
      name.textContent = badge.name;
      const description = document.createElement("small");
      description.textContent = badge.unlocked ? `${badge.description} • Terbuka` : badge.description;
      article.append(icon, name, description);
      badgeGrid.append(article);
    });

    quizBest.textContent = `Skor terbaik: ${state.gameBest}`;
  }

  document.querySelector("#reset-progress")?.addEventListener("click", () => {
    const confirmed = window.confirm("Hapus seluruh progres bab dan skor game pada perangkat ini?");
    if (!confirmed) return;

    state = { completed: [], gameBest: 0 };
    saveState();
    renderChapters();
    updateProgress();
  });

  function updateOfflineStatus() {
    const networkStatus = document.querySelector("#network-status");
    const networkDot = document.querySelector("#network-dot");
    const offlineStatus = document.querySelector("#offline-status");
    const offlineDot = document.querySelector("#offline-dot");

    networkStatus.textContent = navigator.onLine ? "Perangkat sedang terhubung ke internet." : "Perangkat sedang luring.";
    networkDot.className = `status-dot ${navigator.onLine ? "ready" : "warning"}`;

    if (!("serviceWorker" in navigator)) {
      offlineStatus.textContent = "Browser ini belum mendukung penyimpanan konten luring.";
      offlineDot.className = "status-dot warning";
    } else if (navigator.serviceWorker.controller || serviceWorkerRegistration?.active) {
      offlineStatus.textContent = "Konten inti siap digunakan ketika koneksi terbatas.";
      offlineDot.className = "status-dot ready";
    } else {
      offlineStatus.textContent = "Konten inti sedang disiapkan untuk penggunaan luring.";
      offlineDot.className = "status-dot warning";
    }
  }

  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator) || location.protocol === "file:") return null;

    try {
      serviceWorkerRegistration = await navigator.serviceWorker.register("service-worker.js");
      await navigator.serviceWorker.ready;
      updateOfflineStatus();
      return serviceWorkerRegistration;
    } catch {
      updateOfflineStatus();
      return null;
    }
  }

  document.querySelector("#prepare-offline")?.addEventListener("click", async () => {
    const status = document.querySelector("#offline-action-status");
    status.textContent = "Menyiapkan konten inti…";
    const registration = await registerServiceWorker();

    if (registration) {
      await registration.update().catch(() => {});
      status.textContent = "Mode luring siap. Buka kembali halaman yang diperlukan sekali saat masih terhubung.";
    } else {
      status.textContent = "Mode luring belum dapat disiapkan pada browser ini.";
    }
    updateOfflineStatus();
  });

  window.addEventListener("online", updateOfflineStatus);
  window.addEventListener("offline", updateOfflineStatus);

  renderChapters();
  updateProgress();
  updateIslamicDate();
  updateOfflineStatus();
  registerServiceWorker();
}
