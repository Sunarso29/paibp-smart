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
  const hadithData = window.PAIBP_HADITH || { records: [] };
  const schoolData = window.PAIBP_SCHOOL || { school: null, teachers: [], staff: [], news: [] };
  const teacherSources = window.PAIBP_TEACHER_SOURCES || {};
  const calendarData = window.PAIBP_CALENDAR || { sources: {}, datedEvents: [], recurringCommemorations: [], academicEvents: [] };
  const arabicData = window.PAIBP_ARABIC || { levels: [] };
  const islamicLearningData = window.PAIBP_ISLAMIC_LEARNING || { khutbah: { themes: [] }, tajwid: { modules: [] } };
  const khutbahVerseData = window.PAIBP_KHUTBAH_VERSES || {};
  const khutbahSourceData = window.PAIBP_KHUTBAH_SOURCES || { portals: [], curated: [] };
  const gameData = window.PAIBP_GAME_BANK || null;
  const videoData = window.PAIBP_VIDEOS || {};
  const appConfig = window.PAIBP_CONFIG || { realtimeEndpoint: "", realtimeReadKey: "" };
  const STORAGE_KEY = "paibp-smart-progress-v3";
  const PRAYER_CACHE_KEY = "paibp-smart-prayer-cache-v1";
  const EFFECTIVE_KEY = "paibp-smart-effective-v1";
  const STUDENT_WORK_KEY = "paibp-smart-student-work-v1";
  const STUDENT_IDENTITY_KEY = "paibp-smart-student-identity-v1";
  const SUBMISSION_RECAP_KEY = "paibp-smart-submission-recap-v1";
  const CUSTOM_CALENDAR_KEY = "paibp-smart-custom-calendar-v1";
  const GALLERY_STORAGE_KEY = "paibp-smart-gallery-v1";
  const TEACHER_IDENTITY_KEY = "paibp-smart-teacher-identity-v1";
  const EDITOR_SESSION_KEY = "paibp-smart-editor-unlocked";
  const ADMIN_PASSWORD_HASH = "5a26e9c9bf1880cd3532883aad715e962d0b8c6cf06c4bfb61b44bcf0def3284";
  const VISITOR_ROLE_KEY = "paibp-smart-visitor-role-v1";
  const VISITOR_LEDGER_KEY = "paibp-smart-visitor-ledger-v1";
  const FEEDBACK_STORAGE_KEY = "paibp-smart-feedback-v1";
  const HOMEPAGE_COPY_KEY = "paibp-smart-homepage-copy-v1";
  const ACCESS_SESSION_KEY = "paibp-smart-access-session-v1";
  const ACCESS_CONTEXT_KEY = "paibp-smart-access-context-v1";
  const ARABIC_PROGRESS_KEY = "paibp-smart-arabic-progress-v1";
  const ARABIC_SESSION_KEY = "paibp-smart-arabic-session-v2";
  const TAJWID_PROGRESS_KEY = "paibp-smart-tajwid-progress-v1";
  const GAME_SESSION_KEY = "paibp-smart-game-session-v2";
  const GAME_PROGRESS_KEY = "paibp-smart-game-progress-v2";
  const QURAN_CACHE_NAME = "paibp-smart-quran-v1";
  const QURAN_AUDIO_CACHE_NAME = "paibp-smart-quran-audio-v1";
  const ARABIC_AUTO_ADVANCE_DELAY = 5000;
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

  const fallbackGameModeBanks = {
    quiz: questionBank,
    match: [
      ["Pasangkan istilah tabayun dengan maknanya.", ["Memeriksa kebenaran informasi", "Membicarakan aib", "Menunda amanah", "Mencampur transaksi"], 0, "Tabayun berarti mencari kejelasan sebelum menyimpulkan atau menyebarkan."],
      ["Pasangkan istilah rukhsah dengan maknanya.", ["Larangan mutlak", "Keringanan syariat dengan sebab yang diakui", "Pendapat tanpa dasar", "Perdebatan"], 1, "Rukhsah adalah keringanan yang memiliki sebab dan ketentuan."],
      ["Pasangkan Al-Amin dengan keteladanan yang tepat.", ["Kecerdasan berhitung", "Kejujuran dan dapat dipercaya", "Keahlian berdagang saja", "Keberanian fisik"], 1, "Al-Amin menunjukkan pribadi yang jujur dan dapat dipercaya."],
      ["Pasangkan khalifah fil ardh dengan tindakan tepat.", ["Menjaga bumi", "Menguasai tanpa batas", "Menghabiskan sumber daya", "Menghindari tanggung jawab"], 0, "Manusia memikul amanah untuk menjaga kemaslahatan bumi."],
      ["Pasangkan muhasabah dengan kegiatannya.", ["Menilai dan memperbaiki diri", "Menilai aib orang lain", "Menyebarkan prasangka", "Menolak nasihat"], 0, "Muhasabah mengarahkan seseorang menilai amal dan memperbaiki diri."],
      ["Pasangkan amanah dengan contoh sekolah.", ["Memalsukan izin", "Menjalankan piket dengan jujur", "Menyalin jawaban", "Menyembunyikan temuan"], 1, "Menjalankan tanggung jawab merupakan wujud amanah."],
    ],
    sequence: [
      ["Urutan tabayun yang paling tepat ialah …", ["Bagikan–periksa–hapus", "Terima–periksa sumber–bandingkan bukti–simpulkan", "Simpulkan–marah–tanya", "Abaikan–tambahkan opini–bagikan"], 1, "Tabayun dimulai dengan menahan diri, memeriksa sumber dan bukti, lalu menyimpulkan."],
      ["Urutan belajar yang sehat ialah …", ["Salin–kirim–lupakan", "Amati–pahami–latih–refleksi", "Ujian–belajar–bertanya", "Hafal–menolak koreksi–selesai"], 1, "Alur belajar menghubungkan pengamatan, pemahaman, latihan, dan refleksi."],
      ["Urutan menyelesaikan tugas kelompok ialah …", ["Bagi peran–cari sumber–kerjakan–periksa", "Kirim–bagi peran–diskusi", "Salin–ganti nama–kirim", "Tunggu–menyalahkan–menghapus"], 0, "Perencanaan, pembagian peran, proses, dan pemeriksaan menjaga mutu kerja kelompok."],
      ["Urutan bertobat setelah menyakiti orang lain ialah …", ["Menyadari–berhenti–menyesal–memperbaiki hak", "Menyangkal–mengulang–menghindar", "Menyalahkan–meminta pujian", "Melupakan–membenarkan diri"], 0, "Perbaikan mencakup berhenti, menyesal, bertekad, dan memulihkan hak."],
      ["Urutan mengambil keputusan ialah …", ["Kenali masalah–kaji dalil/data–pertimbangkan dampak–putuskan", "Putuskan–cari alasan–abaikan dampak", "Ikuti ramai–bagikan", "Marah–menuduh–selesai"], 0, "Keputusan bertanggung jawab bertumpu pada masalah, sumber, dan dampaknya."],
    ],
    truefalse: [
      ["“Tawakal berarti meninggalkan ikhtiar.” Pernyataan ini …", ["Benar", "Perlu diluruskan"], 1, "Tawakal dilakukan setelah ikhtiar yang layak."],
      ["“Gibah dapat terjadi juga di ruang digital.” Pernyataan ini …", ["Benar", "Perlu diluruskan"], 0, "Tulisan, gambar, dan unggahan dapat menjadi sarana gibah."],
      ["“Riba dan laba jual beli selalu sama.” Pernyataan ini …", ["Benar", "Perlu diluruskan"], 1, "Jual beli yang sah berbeda dari riba dan memiliki ketentuan akad."],
      ["“Menjaga lingkungan termasuk tanggung jawab keagamaan.” Pernyataan ini …", ["Benar", "Perlu diluruskan"], 0, "Menjaga bumi merupakan bagian dari amanah manusia."],
      ["“Perbedaan pendapat membolehkan saling merendahkan.” Pernyataan ini …", ["Benar", "Perlu diluruskan"], 1, "Perbedaan tetap harus dijalani dengan ilmu dan adab."],
      ["“Sumber video perlu diperiksa sebelum dijadikan rujukan.” Pernyataan ini …", ["Benar", "Perlu diluruskan"], 0, "Kredibilitas pembicara, kanal, konteks, dan sumber perlu diperiksa."],
    ],
    dalil: [
      ["Al Qur'an Surat Al-Hujurat ayat 6 paling berkaitan dengan …", ["Tabayun", "Pembagian waris", "Akikah", "Sholat gerhana"], 0, "Ayat tersebut mengajarkan pemeriksaan berita."],
      ["Al Qur'an Surat Al-'Ankabut ayat 45 menguatkan tema …", ["Sholat mencegah perbuatan keji dan mungkar", "Jual beli", "Sejarah Andalusia", "Akikah"], 0, "Ayat ini menjelaskan pengaruh sholat dalam kehidupan."],
      ["Al Qur'an Surat An-Nisa' ayat 58 menguatkan nilai …", ["Amanah dan keadilan", "Perjalanan", "Seni", "Perdagangan saja"], 0, "Ayat tersebut memerintahkan menunaikan amanah dan berlaku adil."],
      ["Al Qur'an Surat Al-A'raf ayat 31 menguatkan sikap …", ["Tidak berlebih-lebihan", "Menunda pekerjaan", "Mengabaikan kebersihan", "Menyembunyikan ilmu"], 0, "Ayat tersebut melarang sikap berlebih-lebihan."],
      ["Al Qur'an Surat Al-Mujadilah ayat 11 berkaitan dengan …", ["Keutamaan ilmu dan orang beriman", "Larangan belajar", "Riba", "Akikah"], 0, "Ayat ini menguatkan kemuliaan iman dan ilmu."],
      ["Al Qur'an Surat Al-Baqarah ayat 275 membedakan …", ["Jual beli dan riba", "Sholat dan dzikir", "Zakat dan sedekah", "Sujud dan rukuk"], 0, "Ayat tersebut menegaskan kehalalan jual beli dan keharaman riba."],
    ],
    scenario: [
      ["Teman mengirim kabar buruk tentang guru tanpa sumber. Tindakan terbaik ialah …", ["Sebarkan ke grup lain", "Tahan, periksa sumber, dan klarifikasi dengan santun", "Tambahkan komentar", "Simpan untuk mengejek"], 1, "Tabayun melindungi kehormatan dan mencegah kerugian."],
      ["Kamu menemukan dompet di kelas. Tindakan terbaik ialah …", ["Ambil uangnya", "Serahkan kepada petugas/guru dan bantu mencari pemilik", "Biarkan", "Unggah identitas lengkap"], 1, "Amanah dijaga dengan melindungi barang dan privasi pemilik."],
      ["Kelompok berbeda pendapat tentang isi tugas. Tindakan terbaik ialah …", ["Memutus pertemanan", "Bandingkan sumber dan sepakati alasan terkuat", "Memilih yang paling keras", "Menyalin kelompok lain"], 1, "Perbedaan diselesaikan dengan data, alasan, dan adab."],
      ["Video yang ditonton menyampaikan klaim agama tanpa sumber. Tindakan terbaik ialah …", ["Langsung percaya", "Catat klaim dan periksa rujukan tepercaya", "Bagikan karena menarik", "Serang pembuatnya"], 1, "Literasi digital menuntut pemeriksaan isi dan sumber."],
      ["Sampah berserakan setelah kegiatan kelas. Tindakan terbaik ialah …", ["Menunggu orang lain", "Ajak membersihkan dan evaluasi pengelolaan sampah", "Menyalahkan kelas lain", "Menutup pintu"], 1, "Amanah menjaga bumi diwujudkan melalui tindakan dan perbaikan sistem."],
      ["Murid memakai bantuan AI untuk tugas. Sikap terbaik ialah …", ["Menyalin seluruhnya", "Memeriksa, menyunting, mencantumkan bantuan, dan memahami isi", "Menghapus sumber", "Mengaku tanpa membaca"], 1, "Teknologi dipakai secara jujur dan bertanggung jawab."],
    ],
  };
  const gameModeBanks = gameData?.bank || fallbackGameModeBanks;

  const panelMeta = {
    welcome: ["Pilih ruang yang dibutuhkan", "Lima ruang utama di atas sudah aktif dan memiliki isi sesuai fungsinya."],
    student: ["Ruang Murid", "Buka materi, ringkasan, LKPD, tulis jawaban, simpan, cetak, dan kirim tugas dari 30 bab kelas VII–IX."],
    teacher: ["Ruang Guru", "Kelola perangkat, modul ajar lengkap, impor tugas murid, rekap, nilai, unduh, dan cetak."],
    islamic: ["Fitur Islami", "Baca Al Qur'an, Hisnul Muslim, dzikir, khutbah Jum'at, tajwid, kalender, dan belajar Bahasa Arab bertahap dengan dukungan luring."],
    games: ["Fitur Games", "Pilih 100 game edukatif PAIBP, tuntaskan 20 soal acak per game, raih XP, dan pantau prestasi lokal."],
    editor: ["Ruang Editor", "Kelola konten beranda, statistik pengunjung, dokumentasi Spensus, komentar, rating, dan balasan."],
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
  let currentPrayerTimings = null;
  let prayerCountdownTimer = null;
  let currentQuranPayload = null;
  let offlineQuranPromise = null;
  let activeOfflineSurah = null;
  let activeOfflineReference = null;
  let activeOfflineHadith = null;
  let studentLocationWatcher = null;
  let studentLocationDetectionStarted = false;
  let lastLocationEventAt = 0;
  let islamicCalendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let quizQuestions = [];
  let quizIndex = -1;
  let quizScore = 0;
  let quizLocked = false;
  let pendingProtectedAction = "teacher";
  let currentVisitorRole = "umum";
  try {
    currentVisitorRole = sessionStorage.getItem(VISITOR_ROLE_KEY) || "umum";
  } catch {
    currentVisitorRole = "umum";
  }
  let galleryAdminOpen = false;
  let galleryPreviewData = "";
  let activeResource = { type: "page", id: "home", title: "Beranda", startedAt: Date.now() };
  let sessionStartedAt = Date.now();
  let currentGameMode = gameData?.arenas?.[0]?.id || "quiz";
  let activeGameSession = safeJsonParse(localStorage.getItem(GAME_SESSION_KEY), null);
  let arabicLevelId = "ringkasan";
  let activeArabicSession = null;
  let selectedArabicQari = localStorage.getItem("paibp-smart-selected-qari-v20") || "sudais";
  let arabicAutoAdvanceTimer = 0;
  let khutbahCatalogOffset = 0;
  let activeKhutbahRecord = null;
  let tajwidModuleId = islamicLearningData.tajwid.modules?.[0]?.id || "";
  let tajwidLessonId = islamicLearningData.tajwid.modules?.[0]?.lessons?.[0]?.id || "";
  let activeTajwidAudio = null;
  let dailyInsightIndex = null;
  let recentTeacherVisits = [];
  let expandedInsightBankPromise = null;

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

  function filenameSlug(value) {
    return String(value || "dokumen")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("id")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 90) || "dokumen";
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return {
        completed: Array.isArray(saved?.completed) ? saved.completed.filter((id) => chapters.some((chapter) => chapter.id === id)) : [],
        gameBest: Number.isInteger(saved?.gameBest) ? Math.min(20, Math.max(0, saved.gameBest)) : 0,
      };
    } catch {
      return { completed: [], gameBest: 0 };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function calculateXp() {
    return state.completed.length * 50 + state.gameBest * 10;
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

  function loadTeacherIdentity() {
    try {
      const identity = safeJsonParse(localStorage.getItem(TEACHER_IDENTITY_KEY), {});
      return {
        name: String(identity?.name || "").trim(),
        workUnit: String(identity?.workUnit || "").trim(),
        nip: String(identity?.nip || "").trim(),
      };
    } catch {
      return { name: "", workUnit: "", nip: "" };
    }
  }

  function isTeacherIdentified() {
    const identity = loadTeacherIdentity();
    return Boolean(identity.name && identity.workUnit);
  }

  function isEditorUnlocked() {
    try {
      return sessionStorage.getItem(EDITOR_SESSION_KEY) === "yes";
    } catch {
      return false;
    }
  }

  function setTeacherAuthVisible(visible, purpose = pendingProtectedAction) {
    const modal = document.querySelector("#teacher-auth");
    if (!modal) return;
    modal.hidden = !visible;
    document.body.classList.toggle("has-modal", visible);
    if (visible) {
      const title = document.querySelector("#teacher-auth-title");
      const description = document.querySelector("#teacher-auth-description");
      const icon = document.querySelector("#teacher-auth .auth-icon");
      const adminPurpose = purpose === "gallery" || purpose === "editor";
      const teacherForm = document.querySelector("#teacher-access-form");
      const editorForm = document.querySelector("#editor-auth-form");
      if (teacherForm) teacherForm.hidden = adminPurpose;
      if (editorForm) editorForm.hidden = !adminPurpose;
      if (icon) icon.textContent = adminPurpose ? "🔐" : "👤";
      if (title) title.textContent = adminPurpose ? "Akses Ruang Editor" : "Identitas Akses Guru";
      if (description) {
        description.textContent = adminPurpose
          ? "Masukkan kata sandi admin untuk mengelola konten, statistik, dan tanggapan."
          : "Isi nama dan unit kerja agar kunjungan guru dapat tercatat. NIP bersifat opsional.";
      }
      const error = document.querySelector("#teacher-auth-error");
      const editorError = document.querySelector("#editor-auth-error");
      if (error) error.textContent = "";
      if (editorError) editorError.textContent = "";
      if (adminPurpose) {
        const input = document.querySelector("#editor-password");
        if (input) input.value = "";
        window.setTimeout(() => input?.focus(), 0);
      } else {
        const identity = loadTeacherIdentity();
        const name = document.querySelector("#teacher-name");
        const workUnit = document.querySelector("#teacher-work-unit");
        const nip = document.querySelector("#teacher-nip");
        if (name) name.value = identity.name;
        if (workUnit) workUnit.value = identity.workUnit;
        if (nip) nip.value = identity.nip;
        window.setTimeout(() => name?.focus(), 0);
      }
    }
  }

  async function sha256(value) {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)].map((part) => part.toString(16).padStart(2, "0")).join("");
  }

  async function verifyAdminPassword(value) {
    try {
      return await sha256(value) === ADMIN_PASSWORD_HASH;
    } catch {
      return false;
    }
  }

  function getAccessSessionId() {
    try {
      const existing = sessionStorage.getItem(ACCESS_SESSION_KEY);
      if (existing) return existing;
      const created = typeof crypto?.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      sessionStorage.setItem(ACCESS_SESSION_KEY, created);
      return created;
    } catch {
      return `session-${Date.now()}`;
    }
  }

  function realtimeIsConfigured() {
    return /^https:\/\/script\.google\.com\/macros\/s\//.test(String(appConfig.realtimeEndpoint || ""));
  }

  function loadAccessContext() {
    try {
      return safeJsonParse(localStorage.getItem(ACCESS_CONTEXT_KEY), {}) || {};
    } catch {
      return {};
    }
  }

  function saveAccessContext(context) {
    localStorage.setItem(ACCESS_CONTEXT_KEY, JSON.stringify(context));
  }

  function readVisitorLedger() {
    try {
      const ledger = safeJsonParse(localStorage.getItem(VISITOR_LEDGER_KEY), { sessions: {} });
      return ledger && typeof ledger.sessions === "object" ? ledger : { sessions: {} };
    } catch {
      return { sessions: {} };
    }
  }

  function writeVisitorLedger(ledger) {
    try {
      localStorage.setItem(VISITOR_LEDGER_KEY, JSON.stringify(ledger));
    } catch {
      // Statistik lokal adalah jalur cadangan; portal tetap dapat digunakan tanpa penyimpanan.
    }
  }

  function getLocalVisitorStats() {
    const sessions = Object.values(readVisitorLedger().sessions || {}).filter((entry) => !entry.admin);
    const feedback = readFeedbackItems();
    const ratings = feedback.map((item) => Number(item.rating)).filter((value) => value >= 1 && value <= 5);
    return {
      total: sessions.length,
      teachers: sessions.filter((entry) => entry.roles?.includes("guru")).length,
      students: sessions.filter((entry) => entry.roles?.includes("murid")).length,
      rating: ratings.length ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length : 0,
      ratingCount: ratings.length,
      feedbackCount: feedback.length,
    };
  }

  function renderVisitorStats(stats = getLocalVisitorStats()) {
    const setText = (selector, value) => {
      const element = document.querySelector(selector);
      if (element) element.textContent = value;
    };
    setText("#visitor-total", Number(stats.total || 0).toLocaleString("id-ID"));
    setText("#visitor-teachers", Number(stats.teachers || 0).toLocaleString("id-ID"));
    setText("#visitor-students", Number(stats.students || 0).toLocaleString("id-ID"));
    setText("#visitor-rating", Number(stats.rating || 0) ? `${Number(stats.rating).toFixed(1)}/5` : "—");
    setText("#visitor-rating-count", Number(stats.ratingCount || 0)
      ? `${Number(stats.ratingCount).toLocaleString("id-ID")} penilaian`
      : "Belum ada penilaian");
    setText("#editor-total-visits", Number(stats.total || 0).toLocaleString("id-ID"));
    setText("#editor-teacher-visits", Number(stats.teachers || 0).toLocaleString("id-ID"));
    setText("#editor-student-visits", Number(stats.students || 0).toLocaleString("id-ID"));
    setText("#editor-feedback-count", Number(stats.feedbackCount ?? stats.ratingCount ?? 0).toLocaleString("id-ID"));
  }

  function localRecentTeacherVisits() {
    return Object.values(readVisitorLedger().sessions || {})
      .filter((entry) => !entry.admin && entry.roles?.includes("guru") && entry.teacher?.name)
      .map((entry) => ({
        name: entry.teacher.name,
        workUnit: entry.teacher.workUnit || "Unit kerja tidak dicantumkan",
        lastAccess: entry.lastAccess || entry.firstAccess || new Date().toISOString(),
      }))
      .sort((a, b) => String(b.lastAccess).localeCompare(String(a.lastAccess)))
      .slice(0, 12);
  }

  function relativeVisitTime(value) {
    const timestamp = new Date(value).getTime();
    if (!Number.isFinite(timestamp)) return "baru berkunjung";
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (elapsedSeconds < 60) return "baru saja";
    const minutes = Math.floor(elapsedSeconds / 60);
    if (minutes < 60) return `${minutes} menit yang lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam yang lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari yang lalu`;
  }

  function renderRecentTeacherVisits(items = null) {
    const track = document.querySelector("#teacher-visit-track");
    if (!track) return;
    if (Array.isArray(items)) recentTeacherVisits = items;
    if (!recentTeacherVisits.length) recentTeacherVisits = localRecentTeacherVisits();
    const cleanItems = recentTeacherVisits
      .filter((item) => item?.name)
      .map((item) => ({
        name: String(item.name).trim(),
        workUnit: String(item.workUnit || "Unit kerja tidak dicantumkan").trim(),
        lastAccess: item.lastAccess || item.timestamp || new Date().toISOString(),
      }))
      .slice(0, 12);
    if (!cleanItems.length) {
      track.classList.add("is-static");
      track.innerHTML = "<span>Belum ada kunjungan guru yang tercatat.</span>";
      return;
    }
    const message = (item) => `<span><strong>${escapeHtml(item.name)}</strong> • ${escapeHtml(item.workUnit)} • berkunjung ${escapeHtml(relativeVisitTime(item.lastAccess))}</span>`;
    const rendered = cleanItems.map(message).join("");
    track.classList.toggle("is-static", cleanItems.length === 1);
    track.innerHTML = cleanItems.length === 1 ? rendered : `${rendered}${rendered}`;
  }

  function registerVisitorRole(role) {
    const sessionId = getAccessSessionId();
    const ledger = readVisitorLedger();
    const entry = ledger.sessions[sessionId] || {
      roles: [],
      firstAccess: new Date().toISOString(),
      lastAccess: "",
      admin: false,
    };
    if (role === "editor") {
      entry.admin = true;
      currentVisitorRole = "editor";
      if (realtimeIsConfigured()) {
        fetch(appConfig.realtimeEndpoint, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            type: "access",
            timestamp: new Date().toISOString(),
            sessionId,
            sessionStartedAt: new Date(sessionStartedAt).toISOString(),
            visitorRole: "editor",
            action: "admin_session",
            page: location.pathname || "/",
          }),
        }).catch(() => {});
      }
    } else {
      if (!entry.roles.includes(role)) entry.roles.push(role);
      if (role === "guru") entry.teacher = loadTeacherIdentity();
      currentVisitorRole = role;
    }
    entry.lastAccess = new Date().toISOString();
    ledger.sessions[sessionId] = entry;
    writeVisitorLedger(ledger);
    try {
      sessionStorage.setItem(VISITOR_ROLE_KEY, currentVisitorRole);
    } catch {
      // Abaikan pembatasan penyimpanan sesi.
    }
    renderVisitorStats();
    renderRecentTeacherVisits();
  }

  async function refreshPublicStats() {
    renderVisitorStats();
    renderRecentTeacherVisits();
    const status = document.querySelector("#visitor-stats-status");
    if (!realtimeIsConfigured()) {
      if (status) status.textContent = "Statistik perangkat ini ditampilkan; aktifkan sinkronisasi untuk angka lintas perangkat.";
      return;
    }
    try {
      const url = new URL(appConfig.realtimeEndpoint);
      url.searchParams.set("action", "public-stats");
      const response = await fetch(url.toString(), { cache: "no-store" });
      const payload = await response.json();
      if (!payload.ok || !payload.stats) throw new Error("Data statistik belum tersedia.");
      renderVisitorStats(payload.stats);
      renderRecentTeacherVisits(payload.recentTeachers || payload.stats.recentTeachers || []);
      if (status) status.textContent = `Diperbarui ${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}.`;
    } catch {
      if (status) status.textContent = "Statistik daring belum dapat dimuat; angka perangkat ini tetap ditampilkan.";
    }
  }

  async function postRealtimeEvent(type, extra = {}) {
    const visitorRole = String(extra.visitorRole || currentVisitorRole || "umum");
    if (visitorRole === "editor") return false;
    if (!realtimeIsConfigured()) return false;
    const studentIdentity = loadStudentIdentity();
    const teacherIdentity = loadTeacherIdentity();
    const teacherVisit = visitorRole === "guru";
    const identity = teacherVisit
      ? { name: teacherIdentity.name, attendance: "", className: "", workUnit: teacherIdentity.workUnit, nip: teacherIdentity.nip }
      : { ...studentIdentity, workUnit: "", nip: "" };
    const accessContext = loadAccessContext();
    const payload = {
      type,
      timestamp: new Date().toISOString(),
      sessionId: getAccessSessionId(),
      sessionStartedAt: new Date(sessionStartedAt).toISOString(),
      name: identity.name || "",
      attendance: identity.attendance || "",
      className: identity.className || "",
      visitorRole,
      workUnit: identity.workUnit || "",
      nip: identity.nip || "",
      page: location.pathname || "/",
      locationLabel: accessContext.locationLabel || "",
      latitude: accessContext.permissionGranted ? accessContext.latitude || "" : "",
      longitude: accessContext.permissionGranted ? accessContext.longitude || "" : "",
      accuracy: accessContext.permissionGranted ? accessContext.accuracy || "" : "",
      ...extra,
    };
    try {
      await fetch(appConfig.realtimeEndpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      return true;
    } catch {
      return false;
    }
  }

  function resourceDurationSeconds() {
    return Math.max(0, Math.round((Date.now() - activeResource.startedAt) / 1000));
  }

  function switchTrackedResource(type, id, title) {
    const previous = activeResource;
    if (previous && previous.id !== id) {
      postRealtimeEvent("access", {
        action: "resource_close",
        resourceType: previous.type,
        resourceId: previous.id,
        resourceTitle: previous.title,
        durationSeconds: resourceDurationSeconds(),
      });
    }
    activeResource = { type, id, title, startedAt: Date.now() };
    postRealtimeEvent("access", {
      action: "resource_open",
      resourceType: type,
      resourceId: id,
      resourceTitle: title,
      durationSeconds: 0,
    });
  }

  function studentLocationStatus(message) {
    const status = document.querySelector("#student-location-status");
    if (status) status.textContent = message;
  }

  async function resolveApproximatePlaceName(latitude, longitude) {
    const fallback = `Sekitar ${latitude}, ${longitude}`;
    try {
      const url = new URL("https://nominatim.openstreetmap.org/reverse");
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("lat", latitude);
      url.searchParams.set("lon", longitude);
      url.searchParams.set("zoom", "14");
      url.searchParams.set("accept-language", "id");
      const response = await fetch(url.toString(), {
        cache: "force-cache",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) return fallback;
      const payload = await response.json();
      const address = payload?.address || {};
      const parts = [
        address.village || address.town || address.city_district || address.city,
        address.subdistrict || address.municipality || address.county,
        address.state,
      ].filter(Boolean);
      return [...new Set(parts)].slice(0, 3).join(", ") || fallback;
    } catch {
      return fallback;
    }
  }

  async function recordStudentPosition(position, action = "location_update") {
    if (!position?.coords || currentVisitorRole !== "murid") return;
    const latitude = Number(position.coords.latitude).toFixed(3);
    const longitude = Number(position.coords.longitude).toFixed(3);
    const context = loadAccessContext();
    const changed = context.latitude !== latitude || context.longitude !== longitude;
    context.permissionGranted = true;
    context.latitude = latitude;
    context.longitude = longitude;
    context.accuracy = Math.round(position.coords.accuracy || 0);
    if (changed || !context.locationLabel) {
      studentLocationStatus("Koordinat ditemukan. Menentukan perkiraan nama tempat…");
      context.locationLabel = await resolveApproximatePlaceName(latitude, longitude);
    }
    context.updatedAt = new Date().toISOString();
    saveAccessContext(context);
    studentLocationStatus(`Lokasi otomatis aktif • ${context.locationLabel} • akurasi ± ${context.accuracy || "—"} m.`);
    const now = Date.now();
    if (changed || now - lastLocationEventAt >= 300000) {
      lastLocationEventAt = now;
      postRealtimeEvent("access", {
        action,
        resourceType: "lokasi-akses",
        resourceId: "student-location",
        resourceTitle: context.locationLabel,
        durationSeconds: 0,
      });
    }
  }

  function startAutomaticStudentLocation() {
    const saved = loadAccessContext();
    if (saved.permissionGranted && saved.locationLabel) {
      studentLocationStatus(`Lokasi terakhir • ${saved.locationLabel}. Memperbarui posisi…`);
    } else {
      studentLocationStatus("Mendeteksi lokasi akses secara otomatis…");
    }
    if (studentLocationDetectionStarted) return;
    studentLocationDetectionStarted = true;
    if (!navigator.geolocation) {
      studentLocationStatus("Perangkat tidak menyediakan layanan lokasi; aktivitas belajar tetap direkam tanpa koordinat.");
      return;
    }
    const options = { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 };
    const onError = (error) => {
      studentLocationDetectionStarted = false;
      const denied = Number(error?.code) === 1;
      studentLocationStatus(denied
        ? "Lokasi tidak dibagikan karena izin ponsel ditolak. Fitur belajar tetap dapat digunakan."
        : "Lokasi belum dapat diperbarui. Situs akan mencoba lagi ketika Ruang Murid dibuka.");
    };
    navigator.geolocation.getCurrentPosition(async (position) => {
      await recordStudentPosition(position, "location_auto_detected");
      if (typeof navigator.geolocation.watchPosition === "function" && studentLocationWatcher === null) {
        studentLocationWatcher = navigator.geolocation.watchPosition(
          (nextPosition) => recordStudentPosition(nextPosition, "location_realtime_update"),
          () => {},
          { ...options, timeout: 30000 },
        );
      }
    }, onError, options);
  }

  function attachAutomaticLocationStatus() {
    const saved = loadAccessContext();
    if (saved.permissionGranted && saved.locationLabel) {
      studentLocationStatus(`Lokasi terakhir • ${saved.locationLabel}.`);
    }
  }

  function openPanel(name, { skipAuth = false } = {}) {
    if (name !== "games" && isGameSessionBlocking()) {
      const feedback = document.querySelector("#quiz-feedback");
      if (feedback) {
        feedback.textContent = "Arena sedang dikunci. Selesaikan seluruh 20 soal sebelum berpindah ruang.";
        feedback.className = "quiz-feedback error";
      }
      return;
    }
    if (name === "teacher" && !skipAuth && !isTeacherIdentified()) {
      pendingProtectedAction = "teacher";
      setTeacherAuthVisible(true, "teacher");
      return;
    }
    if (name === "editor" && !skipAuth && !isEditorUnlocked()) {
      pendingProtectedAction = "editor";
      setTeacherAuthVisible(true, "editor");
      return;
    }
    const target = document.querySelector(`[data-panel="${name}"]`);
    if (!target || !panelMeta[name]) return;
    panels.forEach((panel) => {
      panel.hidden = panel !== target;
    });
    openButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.openPanel === name));
    workspaceTitle.textContent = panelMeta[name][0];
    workspaceDescription.textContent = panelMeta[name][1];
    document.querySelectorAll("[data-home-only]").forEach((section) => {
      section.hidden = name !== "welcome";
    });
    if (name === "student") {
      registerVisitorRole("murid");
      renderChapterCards();
      startAutomaticStudentLocation();
      postRealtimeEvent("access", { action: "open_student_room", visitorRole: "murid" });
    }
    if (name === "teacher") {
      registerVisitorRole("guru");
      postRealtimeEvent("access", {
        action: "open_teacher_room",
        visitorRole: "guru",
        resourceType: "ruang",
        resourceId: "teacher",
        resourceTitle: "Ruang Guru",
      });
      renderTeacherDocument();
    }
    if (name === "islamic") {
      updateIslamicDate();
      loadPrayerTimes();
    }
    if (name === "games") updateProgress();
    if (name === "editor") {
      registerVisitorRole("editor");
      renderEditorPanel();
    }
    switchTrackedResource("ruang", name, panelMeta[name][0]);
    scrollToWorkspace();
  }

  openButtons.forEach((button) => button.addEventListener("click", () => openPanel(button.dataset.openPanel)));
  document.querySelector("#teacher-access-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const error = document.querySelector("#teacher-auth-error");
    const identity = {
      name: document.querySelector("#teacher-name")?.value.trim() || "",
      workUnit: document.querySelector("#teacher-work-unit")?.value.trim() || "",
      nip: document.querySelector("#teacher-nip")?.value.trim() || "",
    };
    if (!identity.name || !identity.workUnit) {
      if (error) error.textContent = "Nama guru dan unit kerja wajib diisi.";
      return;
    }
    localStorage.setItem(TEACHER_IDENTITY_KEY, JSON.stringify(identity));
    registerVisitorRole("guru");
    setTeacherAuthVisible(false);
    openPanel("teacher", { skipAuth: true });
  });
  document.querySelector("#editor-auth-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = document.querySelector("#editor-password");
    const error = document.querySelector("#editor-auth-error");
    if (!await verifyAdminPassword(input?.value || "")) {
      if (error) error.textContent = "Kata sandi editor tidak sesuai.";
      input?.select();
      return;
    }
    try {
      sessionStorage.setItem(EDITOR_SESSION_KEY, "yes");
    } catch {
      // Editor tetap terbuka untuk interaksi saat ini.
    }
    registerVisitorRole("editor");
    setTeacherAuthVisible(false);
    if (pendingProtectedAction === "gallery") setGalleryAdminVisible(true);
    else openPanel("editor", { skipAuth: true });
  });
  document.querySelectorAll("[data-cancel-teacher-auth]").forEach((button) => button.addEventListener("click", () => setTeacherAuthVisible(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !document.querySelector("#teacher-auth")?.hidden) setTeacherAuthVisible(false);
  });
  document.querySelector("#lock-teacher-room")?.addEventListener("click", () => {
    try {
      localStorage.removeItem(TEACHER_IDENTITY_KEY);
      sessionStorage.setItem(VISITOR_ROLE_KEY, "umum");
    } catch {
      // Ignore restricted storage.
    }
    currentVisitorRole = "umum";
    openPanel("welcome");
  });
  document.querySelector("#lock-editor-room")?.addEventListener("click", () => {
    try {
      sessionStorage.removeItem(EDITOR_SESSION_KEY);
      sessionStorage.setItem(VISITOR_ROLE_KEY, "umum");
    } catch {
      // Abaikan pembatasan penyimpanan sesi.
    }
    currentVisitorRole = "umum";
    openPanel("welcome");
  });
  document.querySelector("[data-close-workspace]")?.addEventListener("click", () => {
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.panel !== "welcome";
    });
    openButtons.forEach((button) => button.classList.remove("is-active"));
    workspaceTitle.textContent = panelMeta.welcome[0];
    workspaceDescription.textContent = panelMeta.welcome[1];
    document.querySelectorAll("[data-home-only]").forEach((section) => {
      section.hidden = false;
    });
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
    postRealtimeEvent("access", {
      action: "open_chapter",
      chapterId: currentChapter.id,
      chapterTitle: currentChapter.title,
    });
    switchTrackedResource("bab", currentChapter.id, currentChapter.title);
    document.querySelector("#lesson-viewer").scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
  }

  function moduleSourceNote(chapter) {
    if (chapter.grade === "VII") {
      return chapter.number === 1
        ? "Disarikan secara mandiri dari struktur Buku PAIBP Kelas VII halaman 2–27 dan Modul Ajar Bab 1 yang dilampirkan. Materi disajikan ulang sebagai visual, ikhtisar, latihan, dan LKPD; bukan salinan halaman buku."
        : "Diolah dari Buku PAIBP Kelas VII dan perangkat Bab yang dilampirkan dengan pola lengkap: tujuan, pemantik, pengertian, dalil, pendalaman, ikhtisar, latihan, proyek, dan refleksi.";
    }
    return `Diolah dari Modul Ajar Bab ${chapter.number} Kelas ${chapter.grade} dalam berkas perangkat CP terbaru yang dilampirkan, kemudian disajikan ulang sebagai ringkasan visual dan latihan interaktif.`;
  }

  const chapterDalil = {
    "VII-2": ["Al Qur'an Surat Al-A'raf ayat 180", "Al Qur'an Surat Al-Hasyr ayat 22–24", "Hadits Riwayat tentang sembilan puluh sembilan nama Allah Subhanahu Wata'ala"],
    "VII-3": ["Al Qur'an Surat Al-'Ankabut ayat 45", "Al Qur'an Surat Al-Ahzab ayat 41–42", "Al Qur'an Surat Al-Baqarah ayat 152"],
    "VII-4": ["Al Qur'an Surat Al-Hajj ayat 77", "Al Qur'an Surat Al-Isra' ayat 107–109", "Hadits Riwayat tentang sujud syukur, sahwi, dan tilawah"],
    "VII-5": ["Al Qur'an Surat Ali 'Imran ayat 137", "Al Qur'an Surat Al-Hasyr ayat 18", "Sumber sejarah Daulah Umayyah pada buku dan modul resmi"],
    "VII-7": ["Al Qur'an Surat Al-Hasyr ayat 18", "Al Qur'an Surat Qaf ayat 18", "Hadits Riwayat tentang muhasabah dan tanggung jawab amal"],
    "VII-9": ["Al Qur'an Surat Al-Baqarah ayat 185", "Al Qur'an Surat An-Nisa' ayat 101", "Hadits Riwayat tentang mengambil keringanan syariat"],
    "VII-10": ["Al Qur'an Surat Ali 'Imran ayat 137", "Al Qur'an Surat At-Taubah ayat 122", "Sumber sejarah Andalusia pada buku dan modul resmi"],
    "VIII-2": ["Al Qur'an Surat Al-Baqarah ayat 4", "Al Qur'an Surat Al-Ma'idah ayat 48", "Hadits Riwayat tentang berpegang pada petunjuk Allah Subhanahu Wata'ala"],
    "VIII-3": ["Al Qur'an Surat An-Nisa' ayat 58", "Al Qur'an Surat At-Taubah ayat 119", "Hadits Riwayat tentang kejujuran yang menuntun kepada kebaikan"],
    "VIII-4": ["Al Qur'an Surat Fussilat ayat 37", "Al Qur'an Surat Al-Ma'idah ayat 32", "Hadits Riwayat tentang sholat gerhana, istisqa, dan jenazah"],
    "VIII-5": ["Al Qur'an Surat Al-'Alaq ayat 1–5", "Al Qur'an Surat Az-Zumar ayat 9", "Sumber sejarah budaya literasi Daulah Abbasiyah"],
    "VIII-7": ["Al Qur'an Surat An-Nisa' ayat 136", "Al Qur'an Surat Al-Baqarah ayat 285", "Hadits Riwayat tentang kesatuan risalah para nabi"],
    "VIII-8": ["Al Qur'an Surat Al-Kafirun ayat 6", "Al Qur'an Surat Al-Hujurat ayat 13", "Al Qur'an Surat Al-Mumtahanah ayat 8"],
    "VIII-9": ["Al Qur'an Surat Al-Baqarah ayat 275", "Al Qur'an Surat Al-Baqarah ayat 282", "Al Qur'an Surat An-Nisa' ayat 29"],
    "VIII-10": ["Al Qur'an Surat Al-'Alaq ayat 1–5", "Al Qur'an Surat Al-Mujadilah ayat 11", "Sumber sejarah ilmuwan Muslim pada modul resmi"],
    "IX-2": ["Al Qur'an Surat Al-Baqarah ayat 4", "Al Qur'an Surat Az-Zalzalah ayat 1–8", "Al Qur'an Surat Al-Baqarah ayat 155–156"],
    "IX-4": ["Al Qur'an Surat Al-Kautsar ayat 2", "Al Qur'an Surat Al-Hajj ayat 36–37", "Hadits Riwayat tentang akikah dan kurban"],
    "IX-5": ["Al Qur'an Surat Ali 'Imran ayat 26", "Al Qur'an Surat Yusuf ayat 111", "Sumber sejarah Daulah Usmani pada modul resmi"],
    "IX-8": ["Al Qur'an Surat Al-A'raf ayat 31", "Al Qur'an Surat An-Nahl ayat 125", "Hadits Riwayat tentang keindahan dan akhlak yang baik"],
    "IX-9": ["Al Qur'an Surat An-Nisa' ayat 59", "Al Qur'an Surat An-Nahl ayat 43", "Sumber biografi dan metode keilmuan imam mazhab"],
    "IX-10": ["Al Qur'an Surat Yusuf ayat 111", "Al Qur'an Surat Al-Hasyr ayat 18", "Sumber sejarah Daulah Safawi dan Mughal pada modul resmi"],
  };

  function referencesForChapter(chapter) {
    return chapter.references?.length ? chapter.references : (chapterDalil[chapter.id] || []);
  }

  function parseQuranReference(label) {
    const match = String(label || "").match(/Al Qur'an Surat (.+?) ayat (\d+)(?:[–-](\d+))?/i);
    if (!match) return null;
    return {
      label: match[0],
      surahName: match[1].trim(),
      start: Number(match[2]),
      end: Number(match[3] || match[2]),
    };
  }

  function normalizeDalilLookup(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("id")
      .replace(/[^a-z0-9]/g, "");
  }

  function findHadithRecord(labelOrId) {
    const requested = normalizeDalilLookup(labelOrId);
    if (!requested) return null;
    return hadithData.records.find((record) => {
      if (normalizeDalilLookup(record.id) === requested) return true;
      const sourceKey = normalizeDalilLookup(record.source);
      if (sourceKey && requested.includes(sourceKey)) return true;
      return (record.keywords || []).some((keyword) => requested.includes(normalizeDalilLookup(keyword)));
    }) || null;
  }

  function dalilReferenceHtml(item, index, { compact = false } = {}) {
    const parsed = parseQuranReference(item);
    const hadith = !parsed ? findHadithRecord(item) : null;
    if (hadith) {
      const button = `
        <button class="dalil-open-button hadith-open-button" type="button" data-open-hadith="${escapeHtml(hadith.id)}">
          <span>${compact ? "📜" : index + 1}</span>
          <span><strong>${escapeHtml(hadith.source)}</strong><small>${escapeHtml(hadith.title)} • buka teks, makna, dan bacaan luring</small></span>
        </button>`;
      return compact ? `<li class="summary-dalil-item">${button}</li>` : `<article class="is-clickable-dalil">${button}</article>`;
    }
    if (!parsed) {
      return compact
        ? `<li>${escapeHtml(item)}</li>`
        : `<article><span>${index + 1}</span><p>${escapeHtml(item)}</p></article>`;
    }
    const button = `
      <button class="dalil-open-button" type="button" data-open-dalil="${escapeHtml(parsed.label)}">
        <span>${compact ? "📖" : index + 1}</span>
        <span><strong>${escapeHtml(parsed.label)}</strong><small>Klik untuk membuka ayat, terjemahan, dan bacaan luring</small></span>
      </button>`;
    return compact ? `<li class="summary-dalil-item">${button}</li>` : `<article class="is-clickable-dalil">${button}</article>`;
  }

  function chapterKeywords(chapter) {
    return chapter.concepts.map(([title]) => title).slice(0, 6);
  }

  function quickQuizForChapter(chapter) {
    const concepts = chapter.concepts;
    const applications = chapter.applications;
    const items = [
      {
        question: `Pernyataan yang paling tepat menjelaskan “${concepts[0][0]}” adalah …`,
        options: [concepts[0][1], concepts[1][1], "Cukup dihafalkan tanpa dipahami atau diterapkan.", "Tidak memiliki hubungan dengan kehidupan sehari-hari."],
        answer: 0,
        explanation: concepts[0][1],
      },
      {
        question: `Konsep apakah yang sesuai dengan uraian berikut: “${concepts[1][1]}”`,
        options: [concepts[1][0], concepts[2][0], concepts[0][0], concepts[3][0]],
        answer: 0,
        explanation: `Uraian tersebut merupakan penjelasan tentang ${concepts[1][0]}.`,
      },
      {
        question: "Tindakan yang paling sesuai dengan isi bab ini adalah …",
        options: [applications[0], "Menunggu orang lain berbuat baik terlebih dahulu.", "Mengabaikan bukti dan nasihat yang dapat dipercaya.", "Menerapkan konsep hanya ketika dinilai guru."],
        answer: 0,
        explanation: `${applications[0]} merupakan bentuk penerapan yang dapat dilatih secara nyata.`,
      },
      {
        question: "Bagaimana cara menunjukkan bahwa materi sudah dipahami secara utuh?",
        options: ["Menjelaskan konsep, menunjukkan dasar, dan menerapkannya secara bertanggung jawab.", "Menghafal judul tanpa memahami makna.", "Menyalin jawaban teman agar cepat selesai.", "Menghindari pertanyaan dan refleksi."],
        answer: 0,
        explanation: "Pemahaman utuh menghubungkan pengetahuan, dalil, alasan, sikap, dan tindakan.",
      },
      {
        question: "Kesimpulan utama bab ini yang paling tepat adalah …",
        options: [chapter.overview, "Materi agama hanya diperlukan saat ujian.", "Semua persoalan dapat diselesaikan tanpa belajar dari sumber.", "Pengetahuan tidak perlu memengaruhi perilaku."],
        answer: 0,
        explanation: chapter.overview,
      },
    ];
    const quranAndTajwidChapter = /qur|hadis|tajwid/i.test(`${chapter.element} ${chapter.title}`);
    if (quranAndTajwidChapter) {
      items.push(
        {
          question: "Mad thabi'i dibaca sepanjang …",
          options: ["Dua harakat", "Empat atau lima harakat pada semua keadaan", "Enam harakat pada semua keadaan", "Tidak dipanjangkan"],
          answer: 0,
          explanation: "Mad thabi'i pada keadaan biasa dibaca dua harakat, misalnya ketika fathah diikuti alif, kasrah diikuti ya sukun, atau dammah diikuti waw sukun.",
        },
        {
          question: "Hukum bacaan nun sukun atau tanwin ketika bertemu huruf ba adalah …",
          options: ["Iqlab", "Idgham bighunnah", "Izhar halqi", "Ikhfa syafawi"],
          answer: 0,
          explanation: "Nun sukun atau tanwin yang bertemu ba dibaca iqlab: bunyi nun berubah mendekati mim disertai dengung.",
        },
        {
          question: "Apabila mim sukun bertemu huruf mim, hukum bacaannya adalah …",
          options: ["Idgham mimi", "Ikhfa haqiqi", "Iqlab", "Izhar halqi"],
          answer: 0,
          explanation: "Mim sukun yang bertemu mim dibaca idgham mimi dengan memasukkan bunyi mim dan mendengungkannya.",
        },
        {
          question: "Huruf qalqalah dirangkum dalam kelompok …",
          options: ["ق ط ب ج د", "ء ه ع ح غ خ", "ي ر م ل و ن", "ص ذ ث ك ج ش"],
          answer: 0,
          explanation: "Huruf qalqalah ialah qaf, tha, ba, jim, dan dal. Pantulan muncul ketika salah satu huruf tersebut dalam keadaan sukun.",
        },
        chapter.id === "VIII-1"
          ? {
            question: "Lafaz Allah dibaca tipis (tarqiq) apabila huruf sebelumnya berharakat …",
            options: ["Kasrah", "Fathah", "Dammah", "Sukun tanpa melihat huruf sebelumnya"],
            answer: 0,
            explanation: "Lam pada lafaz Allah dibaca tipis apabila didahului kasrah; apabila didahului fathah atau dammah, lam dibaca tebal.",
          }
          : {
            question: "Perbedaan pokok alif lam syamsiyah dan alif lam qamariyah adalah …",
            options: ["Lam syamsiyah tidak dibaca jelas, sedangkan lam qamariyah dibaca jelas", "Keduanya selalu dibaca sama", "Lam qamariyah tidak dibaca jelas", "Keduanya hanya muncul pada akhir ayat"],
            answer: 0,
            explanation: "Pada alif lam syamsiyah, bunyi lam melebur ke huruf sesudahnya; pada alif lam qamariyah, bunyi lam dibaca jelas.",
          },
      );
    }
    const sessionSeed = `${getAccessSessionId()}|${chapter.id}`;
    const seededShuffle = (values, suffix) => {
      let seed = `${sessionSeed}|${suffix}`.split("").reduce((hash, character) => (
        Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0
      ), 2166136261);
      const copy = [...values];
      for (let index = copy.length - 1; index > 0; index -= 1) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        const target = seed % (index + 1);
        [copy[index], copy[target]] = [copy[target], copy[index]];
      }
      return copy;
    };
    return seededShuffle(items, "questions").map((item, index) => {
      const correct = item.options[item.answer];
      const options = seededShuffle(item.options, `options-${index}-${item.question}`);
      return { ...item, options, answer: options.indexOf(correct) };
    });
  }

  function quickQuizHtml(chapter) {
    const questions = quickQuizForChapter(chapter);
    return `
      <div class="chapter-quiz" data-quick-quiz>
        ${questions.map((item, questionIndex) => `
          <article class="chapter-quiz-question" data-quiz-question="${questionIndex}" data-correct="${item.answer}" data-explanation="${escapeHtml(item.explanation)}">
            <h4>${questionIndex + 1}. ${escapeHtml(item.question)}</h4>
            <div class="chapter-quiz-options">
              ${item.options.map((option, optionIndex) => `<button type="button" data-quiz-option="${optionIndex}"><span>${String.fromCharCode(65 + optionIndex)}</span>${escapeHtml(option)}</button>`).join("")}
            </div>
            <p class="chapter-quiz-feedback" aria-live="polite"></p>
            <button class="text-button inline-answer-link no-print" type="button" data-scroll-submission>Jawab uraian dan kirim kepada guru ↓</button>
          </article>`).join("")}
        <div class="chapter-quiz-score"><strong data-quiz-score>0 dari ${questions.length} benar</strong><span>Jawaban dapat diulang dengan membuka kembali tab Materi Bab.</span></div>
      </div>`;
  }

  function lessonMaterialHtml(chapter) {
    const references = referencesForChapter(chapter);
    return `
      <section class="document-cover">
        <p>PAIBP SMART SMP • PAKET BELAJAR UTUH</p>
        <h2>${escapeHtml(chapter.title)}</h2>
        <div class="identity-grid">
          <span><small>Kelas</small><strong>${chapter.grade}</strong></span>
          <span><small>Semester</small><strong>${chapter.semester}</strong></span>
          <span><small>Elemen</small><strong>${chapter.element}</strong></span>
          <span><small>Alokasi</small><strong>${chapter.allocation} JP</strong></span>
        </div>
        <p class="document-note">${escapeHtml(moduleSourceNote(chapter))}</p>
      </section>
      <section class="document-section">
        <h3>1. Tujuan Pembelajaran</h3>
        <ol>${chapter.objectives.map((item) => `<li>${escapeHtml(item)}.</li>`).join("")}</ol>
      </section>
      <section class="document-section">
        <h3>2. Infografis Alur Belajar</h3>
        <div class="visual-learning-path" aria-label="Alur belajar bab">
          <span><b>1</b>Amati</span><span><b>2</b>Pahami</span><span><b>3</b>Telusuri dalil</span>
          <span><b>4</b>Terapkan</span><span><b>5</b>Berlatih</span><span><b>6</b>Refleksi</span>
        </div>
      </section>
      <section class="document-section">
        <h3>3. Mari Bertafakur — Ringkasan Pendahuluan</h3>
        <p class="summary-lead">${escapeHtml(chapter.overview)}</p>
        <div class="thinking-prompt"><strong>Pertanyaan pemantik:</strong> Di manakah tema ini dapat kamu temukan di rumah, sekolah, masyarakat, atau ruang digital? Keputusan apa yang seharusnya berubah setelah memahaminya?</div>
      </section>
      <section class="document-section">
        <h3>4. Titik Fokus</h3>
        <div class="keyword-cloud">${chapterKeywords(chapter).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
      </section>
      <section class="document-section">
        <h3>5. Pengertian dan Konsep Utama</h3>
        <div class="concept-stack">
          ${chapter.concepts.map(([title, body], index) => `
            <article>
              <span>${index + 1}</span>
              <div><h4>${escapeHtml(title)}</h4><p>${escapeHtml(body)}</p></div>
            </article>`).join("")}
        </div>
      </section>
      <section class="document-section">
        <h3>6. Dalil dan Sumber Penguatan</h3>
        <div class="dalil-grid">${references.map((item, index) => dalilReferenceHtml(item, index)).join("")}</div>
        <p class="document-note">Dalil Al Qur'an Surat dan Hadits Riwayat dapat diklik untuk membuka teks, makna, sumber, serta bacaan Arab dari paket luring. Audio luring memakai paket suara Arab perangkat. Daftar ini menjadi pintu kajian, bukan pengganti tafsir, syarah, atau bimbingan guru.</p>
      </section>
      <section class="document-section">
        <h3>7. Pendalaman dan Penerapan</h3>
        <p>Belajar PAIBP tidak berhenti pada hafalan. Latih pemahaman melalui tindakan berikut:</p>
        <ol class="application-list academic-list" type="a">${chapter.applications.map((item) => `<li>${escapeHtml(item)}.</li>`).join("")}</ol>
      </section>
      <section class="document-section">
        <h3>8. Ikhtisar</h3>
        <div class="ikhtisar-grid">
          ${chapter.concepts.map(([title, body]) => `<article><strong>${escapeHtml(title)}</strong><p>${escapeHtml(body)}</p></article>`).join("")}
        </div>
      </section>
      <section class="document-section">
        <h3>9. Rajin Berlatih — Cek Langsung</h3>
        <p>Pilih jawaban pada ${quickQuizForChapter(chapter).length} soal berikut. Bab Al Qur'an dan Hadits dilengkapi latihan pemahaman tajwid yang relevan. Hasil serta penjelasan tampil langsung tanpa menunggu guru.</p>
        ${quickQuizHtml(chapter)}
      </section>
      <section class="document-section">
        <h3>10. Siap Berkreasi</h3>
        <div class="project-box"><strong>Proyek bab:</strong> ${escapeHtml(chapter.project)}</div>
        <p><strong>Kriteria:</strong> isi benar, alasan atau bukti jelas, karya rapi, sumber dicantumkan, dan proses dilakukan dengan jujur.</p>
      </section>
      <section class="document-section reflection-card">
        <h3>11. Inspirasiku dan Refleksi</h3>
        <p>Satu pengetahuan baru yang saya peroleh adalah ….</p>
        <p>Satu sikap yang akan saya biasakan setelah bab ini adalah ….</p>
        <button class="cta no-print" type="button" data-scroll-submission>Tulis Jawaban dan Kirim kepada Guru</button>
      </section>
      ${lessonSubmissionHtml(chapter, { compact: true })}`;
  }

  function lessonSummaryHtml(chapter) {
    const references = referencesForChapter(chapter);
    return `
      <section class="document-cover compact-cover">
        <p>RINGKASAN BAB • KELAS ${chapter.grade}</p>
        <h2>${escapeHtml(chapter.title)}</h2>
        <p>${escapeHtml(moduleSourceNote(chapter))}</p>
      </section>
      <section class="document-section summary-sheet">
        <h3>Ringkasan Pendahuluan</h3>
        <p class="summary-lead">${escapeHtml(chapter.overview)}</p>
        <h3>Pengertian dan Inti Pemahaman</h3>
        <div class="summary-points">
          ${chapter.concepts.map(([title, body], index) => `
            <article><span>${index + 1}</span><div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(body)}</p></div></article>`).join("")}
        </div>
      </section>
      <section class="document-section">
        <h3>Dalil Pokok</h3>
        <ul class="summary-dalil-list">${references.map((item, index) => dalilReferenceHtml(item, index, { compact: true })).join("")}</ul>
      </section>
      <section class="document-section">
        <h3>Kata Kunci dan Tindakan</h3>
        <div class="keyword-cloud">${chapter.applications.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
      </section>
      <section class="document-section">
        <h3>Refleksi</h3>
        <p>Setelah mempelajari bab ini, pemahaman yang paling penting bagi saya adalah …, dan tindakan yang akan saya biasakan ialah ….</p>
        <button class="cta no-print" type="button" data-scroll-submission>Kerjakan Latihan dan Kirim</button>
      </section>
      ${lessonSubmissionHtml(chapter, { compact: true })}`;
  }

  function lessonWorksheetHtml(chapter) {
    const identity = loadStudentIdentity();
    const work = loadStudentWorks()[chapter.id] || {};
    const answers = Array.isArray(work.answers) ? work.answers : [];
    const reflections = Array.isArray(work.reflections) ? work.reflections : [];
    const lkpdMeta = work.lkpdMeta || {};
    return `
      <section class="document-cover worksheet-cover">
        <p>LEMBAR KERJA MURID • PAIBP SMART SMP</p>
        <h2>LKPD: ${escapeHtml(chapter.title)}</h2>
        <table class="identity-table editable-lkpd-table">
          <tr>
            <th>Nama</th><td><input data-lkpd-field="studentName" value="${escapeHtml(identity.name)}" placeholder="Ketik nama lengkap"></td>
            <th>Kelas</th><td><input data-lkpd-field="className" value="${escapeHtml(identity.className)}" placeholder="Contoh: VII A"></td>
          </tr>
          <tr>
            <th>Nomor absen</th><td><input data-lkpd-field="attendance" inputmode="numeric" value="${escapeHtml(identity.attendance)}" placeholder="Ketik nomor absen"></td>
            <th>Kelompok</th><td><input data-lkpd-meta="group" value="${escapeHtml(lkpdMeta.group || "")}" placeholder="Ketik nama/nomor kelompok"></td>
          </tr>
          <tr>
            <th>Tanggal</th><td colspan="3"><input data-lkpd-meta="date" type="date" value="${escapeHtml(lkpdMeta.date || new Date().toISOString().slice(0, 10))}"></td>
          </tr>
        </table>
        <p class="editable-hint">Klik kolom mana pun lalu langsung ketik. Isian tersimpan otomatis dan menyatu dengan paket jawaban yang dikirim kepada guru.</p>
      </section>
      <section class="document-section">
        <h3>A. Tujuan LKPD</h3>
        <ul>${chapter.objectives.map((item) => `<li>${escapeHtml(item)}.</li>`).join("")}</ul>
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
          ${chapter.concepts.map(([title]) => `<span>${escapeHtml(title)}</span>`).join("")}
        </div>
        <label class="direct-lkpd-field">Jelaskan hubungan antarkonsep
          <textarea rows="7" data-lkpd-field="projectPlan" placeholder="Klik di sini lalu tuliskan hubungan antarkonsep…">${escapeHtml(work.projectPlan || "")}</textarea>
        </label>
      </section>
      <section class="document-section worksheet-activity">
        <h3>D. Aktivitas 2 — Analisis</h3>
        <ol class="direct-lkpd-answers">${chapter.questions.map((item, index) => `
          <li>
            <label>${escapeHtml(item)}
              <textarea rows="5" data-lkpd-field="answer-${index}" placeholder="Klik lalu ketik jawaban lengkap…">${escapeHtml(answers[index] || "")}</textarea>
            </label>
          </li>`).join("")}</ol>
      </section>
      <section class="document-section worksheet-activity">
        <h3>E. Aktivitas 3 — Produk Bermakna</h3>
        <div class="project-box">${escapeHtml(chapter.project)}</div>
        <table class="planning-table editable-lkpd-table">
          <tr><th>Tujuan produk</th><td><textarea rows="2" data-lkpd-meta="goal" placeholder="Tuliskan tujuan produk">${escapeHtml(lkpdMeta.goal || "")}</textarea></td></tr>
          <tr><th>Pembagian tugas</th><td><textarea rows="2" data-lkpd-meta="roles" placeholder="Tuliskan pembagian tugas">${escapeHtml(lkpdMeta.roles || "")}</textarea></td></tr>
          <tr><th>Sumber/bukti</th><td><textarea rows="2" data-lkpd-meta="sources" placeholder="Tuliskan sumber atau bukti">${escapeHtml(lkpdMeta.sources || "")}</textarea></td></tr>
          <tr><th>Jadwal kerja</th><td><textarea rows="2" data-lkpd-meta="schedule" placeholder="Tuliskan jadwal kerja">${escapeHtml(lkpdMeta.schedule || "")}</textarea></td></tr>
          <tr><th>Indikator keberhasilan</th><td><textarea rows="2" data-lkpd-meta="success" placeholder="Tuliskan indikator keberhasilan">${escapeHtml(lkpdMeta.success || "")}</textarea></td></tr>
        </table>
      </section>
      <section class="document-section">
        <h3>F. Refleksi</h3>
        <ol class="direct-lkpd-answers">
          ${[
            "Hal baru yang saya pahami",
            "Bagian yang masih perlu saya pelajari",
            "Tindakan nyata yang akan saya lakukan",
          ].map((prompt, index) => `<li><label>${prompt}<textarea rows="4" data-lkpd-field="reflection-${index}" placeholder="Klik lalu ketik refleksi…">${escapeHtml(reflections[index] || "")}</textarea></label></li>`).join("")}
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
        <button class="cta no-print" type="button" data-scroll-submission>Periksa Paket Jawaban dan Kirim kepada Guru</button>
      </section>
      ${lessonSubmissionHtml(chapter, { compact: true })}`;
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

  function chapterVideosHtml(chapter, summaries = []) {
    const videos = Array.isArray(videoData[chapter.id]) ? videoData[chapter.id] : [];
    if (!videos.length) return "";
    return `
      <section class="document-section chapter-video-section">
        <div class="video-section-heading">
          <div>
            <h3>D. Video Penguatan dan Ringkasan Murid</h3>
            <p>Dua video dipilih agar selaras dengan tema bab. Tonton secara kritis, lalu tulis ringkasan minimal 500 karakter untuk setiap video.</p>
          </div>
          <span class="online-badge">Video memerlukan internet</span>
        </div>
        <div class="chapter-video-grid">
          ${videos.map((video, index) => `
            <article class="chapter-video-card">
              <div class="video-frame">
                <iframe
                  src="https://www.youtube-nocookie.com/embed/${escapeHtml(video.id)}"
                  title="${escapeHtml(video.title)}"
                  loading="lazy"
                  referrerpolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen></iframe>
              </div>
              <div class="video-card-copy">
                <span>Video ${index + 1} • ${escapeHtml(video.channel)}</span>
                <h4>${escapeHtml(video.title)}</h4>
                <a href="${escapeHtml(video.url)}" target="_blank" rel="noopener">Buka di YouTube ↗</a>
              </div>
              <label class="block-field">Ringkasan video ${index + 1}
                <textarea name="video-summary-${index}" rows="9" data-video-summary="${index}" data-min-length="500" aria-describedby="video-count-${index}" required>${escapeHtml(summaries[index] || "")}</textarea>
              </label>
              <div class="video-summary-footer">
                <span id="video-count-${index}" data-video-count="${index}">0 karakter • minimal 500</span>
                <button class="btn btn-compact no-print" type="submit">Kirim ringkasan kepada guru</button>
              </div>
            </article>`).join("")}
        </div>
        <p class="document-note">Judul, tautan, dan ringkasan tetap tersedia saat luring. Video YouTube tidak disalin ke penyimpanan situs; pemutaran luring hanya dapat menggunakan fitur resmi YouTube atau berkas video berizin yang diberikan pemiliknya.</p>
      </section>`;
  }

  function lessonSubmissionHtml(chapter, { compact = false } = {}) {
    const identity = loadStudentIdentity();
    const work = loadStudentWorks()[chapter.id] || {};
    const answers = Array.isArray(work.answers) ? work.answers : [];
    const reflections = Array.isArray(work.reflections) ? work.reflections : [];
    const videoSummaries = Array.isArray(work.videoSummaries) ? work.videoSummaries : [];
    return `
      <form id="student-work-form" class="student-work-form inline-student-work">
        <section class="${compact ? "document-section integrated-submission-head" : "document-cover worksheet-cover"}" id="integrated-submission">
          <p>JAWABAN DAN PENGIRIMAN TUGAS • PAIBP SMART SMP</p>
          <h2>${compact ? "Jawab dan Kirim kepada Guru" : escapeHtml(chapter.title)}</h2>
          ${compact ? `<p>Latihan, LKPD, refleksi, dan ringkasan video disimpan sebagai satu paket pekerjaan bab ${escapeHtml(chapter.id)}.</p>` : ""}
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
          <p class="privacy-note">${realtimeIsConfigured()
            ? "Identitas dan jawaban tersimpan di perangkat. Saat “Kirim kepada guru” dipilih, salinan pekerjaan dikirim ke penyimpanan sekolah dan satu berkas tugas tetap disiapkan sebagai cadangan."
            : "Identitas dan jawaban disimpan hanya pada perangkat ini. Saat “Kirim kepada guru” dipilih, situs membuat satu berkas tugas untuk dibagikan langsung kepada guru."}</p>
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
        ${chapterVideosHtml(chapter, videoSummaries)}
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
    const videos = Array.isArray(videoData[currentChapter.id]) ? videoData[currentChapter.id] : [];
    const videoSummaries = videos.map((_, index) => fieldValue(`video-summary-${index}`));
    const previous = loadStudentWorks()[currentChapter.id] || {};
    const lkpdMeta = { ...(previous.lkpdMeta || {}) };
    document.querySelectorAll("[data-lkpd-meta]").forEach((field) => {
      lkpdMeta[field.dataset.lkpdMeta] = String(field.value || "").trim();
    });
    const identityKey = `${identity.name}|${identity.attendance}|${identity.className}`.trim().toLocaleLowerCase("id");
    return {
      identity,
      answers,
      projectPlan: fieldValue("projectPlan"),
      reflections,
      videoSummaries,
      lkpdMeta,
      quickQuiz: previous.quickQuiz || { answered: [], score: 0, complete: false },
      identityKey,
      submissionId: previous.identityKey === identityKey && previous.submissionId ? previous.submissionId : (
        typeof window.crypto?.randomUUID === "function"
          ? window.crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`
      ),
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
      if (!silent) setStudentStatus("Buka Materi, Ringkasan, atau LKPD lalu isi formulir di bagian bawah.", true);
      return null;
    }
    localStorage.setItem(STUDENT_IDENTITY_KEY, JSON.stringify(work.identity));
    const allWorks = loadStudentWorks();
    allWorks[currentChapter.id] = {
      answers: work.answers,
      projectPlan: work.projectPlan,
      reflections: work.reflections,
      videoSummaries: work.videoSummaries,
      lkpdMeta: work.lkpdMeta,
      quickQuiz: work.quickQuiz,
      viewedSections: allWorks[currentChapter.id]?.viewedSections || [],
      submissionId: work.submissionId,
      identityKey: work.identityKey,
      savedAt: work.savedAt,
    };
    localStorage.setItem(STUDENT_WORK_KEY, JSON.stringify(allWorks));
    if (!silent) setStudentStatus(`Jawaban ${currentChapter.id} tersimpan di perangkat pada ${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}.`);
    return work;
  }

  function buildSubmission(work) {
    const videos = Array.isArray(videoData[currentChapter.id]) ? videoData[currentChapter.id] : [];
    return {
      schema: "paibp-smart-submission",
      version: 1,
      submissionId: work.submissionId,
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
        lkpdPlanning: work.lkpdMeta,
        quickQuiz: work.quickQuiz,
        reflections: [
          ["Hal baru yang saya pahami", work.reflections[0]],
          ["Bagian yang masih perlu saya pelajari", work.reflections[1]],
          ["Tindakan nyata yang akan saya lakukan", work.reflections[2]],
        ].map(([prompt, answer]) => ({ prompt, answer })),
        videoSummaries: videos.map((video, index) => ({
          videoId: video.id,
          title: video.title,
          channel: video.channel,
          url: video.url,
          summary: work.videoSummaries[index] || "",
        })),
      },
    };
  }

  async function exportAndShareStudentWork() {
    if (!currentChapter) return;
    const form = document.querySelector("#student-work-form");
    form?.querySelectorAll("[data-video-summary]").forEach((textarea) => {
      const valid = textarea.value.trim().length >= 500;
      textarea.setCustomValidity?.(valid ? "" : "Ringkasan video harus berisi minimal 500 karakter.");
    });
    if (!form?.reportValidity()) {
      setStudentStatus("Lengkapi identitas, seluruh jawaban, dan ringkasan video minimal 500 karakter sebelum mengirim.", true);
      return;
    }
    const work = saveCurrentStudentWork({ silent: true });
    const submission = buildSubmission(work);
    await postRealtimeEvent("submission", {
      action: "send_assignment",
      chapterId: currentChapter.id,
      chapterTitle: currentChapter.title,
      resourceType: "tugas",
      resourceId: submission.submissionId,
      resourceTitle: `Paket jawaban ${currentChapter.id}`,
      durationSeconds: 0,
      submissionData: submission,
    });
    const filename = `Tugas-PAIBP-${currentChapter.id}-${work.identity.className}-${work.identity.attendance}-${work.identity.name}`
      .replace(/[^\p{L}\p{N}._-]+/gu, "-")
      .replace(/-+/g, "-")
      .slice(0, 140) + ".docx";
    const blocks = [
      { text: "Identitas Murid", style: "Heading1" },
      `Nama: ${work.identity.name}`,
      `Nomor absen: ${work.identity.attendance}`,
      `Kelas: ${work.identity.className}`,
      `Dibuat: ${new Date(submission.createdAt).toLocaleString("id-ID")}`,
      { text: `${currentChapter.id} — ${currentChapter.title}`, style: "Heading1" },
      { text: "Jawaban Latihan", style: "Heading2" },
      ...submission.work.questions.flatMap((entry, index) => [
        { text: `${index + 1}. ${entry.question}`, style: "Heading3" },
        entry.answer || "Belum dijawab.",
      ]),
      { text: "LKPD dan Produk Bermakna", style: "Heading2" },
      submission.work.project?.prompt || "",
      submission.work.project?.answer || "Belum dijawab.",
      { text: "Refleksi", style: "Heading2" },
      ...submission.work.reflections.flatMap((entry) => [
        { text: entry.prompt, style: "Heading3" },
        entry.answer || "Belum dijawab.",
      ]),
      ...(submission.work.videoSummaries || []).flatMap((entry) => [
        { text: `Ringkasan video: ${entry.title}`, style: "Heading2" },
        `Kanal: ${entry.channel}`,
        entry.summary || "Belum dijawab.",
      ]),
    ];
    const blob = window.PAIBP_DOCX.createDocument({
      title: `Tugas PAIBP — ${currentChapter.title}`,
      blocks,
      customData: submission,
    });
    const file = new File([blob], filename, { type: blob.type });
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
    setStudentStatus("Berkas Word (.docx) telah diunduh. Kirimkan berkas itu kepada guru melalui kanal yang disepakati.");
  }

  function attachStudentWorkForm() {
    const form = document.querySelector("#student-work-form");
    if (!form) return;
    let saveTimer = null;
    form.addEventListener("input", () => {
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => saveCurrentStudentWork({ silent: true }), 600);
      updateLessonCompleteButton();
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
    form.querySelectorAll("[data-video-summary]").forEach((textarea) => {
      const index = textarea.dataset.videoSummary;
      const counter = form.querySelector(`[data-video-count="${index}"]`);
      const updateCounter = () => {
        const count = textarea.value.trim().length;
        if (counter) counter.textContent = `${count.toLocaleString("id-ID")} karakter • minimal 500`;
        textarea.setCustomValidity?.(count >= 500 ? "" : "Ringkasan video harus berisi minimal 500 karakter.");
      };
      textarea.addEventListener("input", updateCounter);
      updateCounter();
    });
  }

  function attachLkpdEditors() {
    const form = document.querySelector("#student-work-form");
    if (!form) return;
    document.querySelectorAll("[data-lkpd-field]").forEach((field) => {
      const target = form.querySelector(`[name="${field.dataset.lkpdField}"]`);
      if (!target) return;
      field.addEventListener("input", () => {
        target.value = field.value;
        target.dispatchEvent(new Event("input", { bubbles: true }));
        updateLessonCompleteButton();
      });
      target.addEventListener("input", () => {
        if (field.value !== target.value) field.value = target.value;
      });
    });
    let metaSaveTimer = null;
    document.querySelectorAll("[data-lkpd-meta]").forEach((field) => {
      field.addEventListener("input", () => {
        window.clearTimeout(metaSaveTimer);
        metaSaveTimer = window.setTimeout(() => {
          saveCurrentStudentWork({ silent: true });
          updateLessonCompleteButton();
        }, 350);
      });
    });
  }

  function attachQuickQuiz() {
    const quiz = document.querySelector("[data-quick-quiz]");
    if (!quiz || !currentChapter) return;
    const totalQuestions = quiz.querySelectorAll("[data-quiz-question]").length;
    const savedQuiz = loadStudentWorks()[currentChapter.id]?.quickQuiz || {};
    const answered = new Map(
      Array.isArray(savedQuiz.answered)
        ? savedQuiz.answered.map((item) => [String(item.questionIndex), {
          selected: Number(item.selected),
          correct: Boolean(item.correct),
        }])
        : [],
    );
    const refreshScore = () => {
      const correctCount = [...answered.values()].filter((item) => item.correct).length;
      quiz.querySelector("[data-quiz-score]").textContent = `${correctCount} dari ${totalQuestions} benar • ${answered.size} soal sudah dijawab`;
    };
    const persistQuiz = () => {
      saveCurrentStudentWork({ silent: true });
      const allWorks = loadStudentWorks();
      const work = allWorks[currentChapter.id] || {};
      const correctCount = [...answered.values()].filter((item) => item.correct).length;
      work.quickQuiz = {
        answered: [...answered.entries()].map(([questionIndex, value]) => ({
          questionIndex: Number(questionIndex),
          selected: value.selected,
          correct: value.correct,
        })),
        score: correctCount,
        complete: answered.size === totalQuestions,
        totalQuestions,
        savedAt: new Date().toISOString(),
      };
      allWorks[currentChapter.id] = work;
      localStorage.setItem(STUDENT_WORK_KEY, JSON.stringify(allWorks));
      updateLessonCompleteButton();
    };
    quiz.querySelectorAll("[data-quiz-question]").forEach((question) => {
      const applyAnswer = (selected) => {
        const correct = Number(question.dataset.correct);
        question.querySelectorAll("[data-quiz-option]").forEach((option) => {
          const optionIndex = Number(option.dataset.quizOption);
          option.classList.toggle("is-correct", optionIndex === correct);
          option.classList.toggle("is-wrong", optionIndex === selected && selected !== correct);
          option.setAttribute("aria-pressed", String(optionIndex === selected));
        });
        const feedback = question.querySelector(".chapter-quiz-feedback");
        feedback.className = `chapter-quiz-feedback ${selected === correct ? "correct" : "wrong"}`;
        feedback.textContent = `${selected === correct ? "Benar." : "Belum tepat."} ${question.dataset.explanation}`;
      };
      const restored = answered.get(String(question.dataset.quizQuestion));
      if (restored) applyAnswer(restored.selected);
      question.querySelectorAll("[data-quiz-option]").forEach((button) => {
        button.addEventListener("click", () => {
          const questionIndex = question.dataset.quizQuestion;
          const selected = Number(button.dataset.quizOption);
          const correct = Number(question.dataset.correct);
          answered.set(questionIndex, { selected, correct: selected === correct });
          applyAnswer(selected);
          refreshScore();
          persistQuiz();
        });
      });
    });
    refreshScore();
  }

  function attachLessonNavigation() {
    document.querySelectorAll("[data-scroll-submission]").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelector("#integrated-submission")?.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
        document.querySelector("[name='studentName']")?.focus({ preventScroll: true });
      });
    });
  }

  function attachDalilReaders() {
    // Pembaca memakai event delegation agar kartu yang dirender ulang tetap aktif.
  }

  function renderLesson() {
    if (!currentChapter) return;
    const buttons = [...document.querySelectorAll("[data-lesson-view]")];
    setPressed(buttons, "lessonView", currentLessonView);
    const content = document.querySelector("#lesson-content");
    if (currentLessonView === "summary") content.innerHTML = lessonSummaryHtml(currentChapter);
    else if (currentLessonView === "worksheet") content.innerHTML = lessonWorksheetHtml(currentChapter);
    else content.innerHTML = lessonMaterialHtml(currentChapter);
    attachStudentWorkForm();
    attachLkpdEditors();
    attachDalilReaders();
    const allWorks = loadStudentWorks();
    const chapterWork = allWorks[currentChapter.id] || {};
    chapterWork.viewedSections = [...new Set([...(chapterWork.viewedSections || []), currentLessonView])];
    allWorks[currentChapter.id] = chapterWork;
    localStorage.setItem(STUDENT_WORK_KEY, JSON.stringify(allWorks));
    if (currentLessonView === "material") attachQuickQuiz();
    attachLessonNavigation();
    setStudentStatus("Jawaban pada bab ini tersimpan otomatis saat diketik.");
    postRealtimeEvent("access", {
      action: "open_lesson_section",
      chapterId: currentChapter.id,
      chapterTitle: currentChapter.title,
      resourceType: "bagian-bab",
      resourceId: `${currentChapter.id}-${currentLessonView}`,
      resourceTitle: `${currentChapter.title} — ${currentLessonView}`,
      durationSeconds: 0,
    });
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
    const validation = chapterCompletionValidation();
    if (!validation.ready || state.completed.includes(currentChapter.id)) return;
    state.completed = [...state.completed, currentChapter.id];
    saveState();
    updateProgress();
    updateLessonCompleteButton();
  });
  document.querySelector("#save-student-work")?.addEventListener("click", () => {
    saveCurrentStudentWork();
  });
  document.querySelector("#send-student-work")?.addEventListener("click", exportAndShareStudentWork);

  function chapterCompletionValidation() {
    if (!currentChapter) return { ready: false, checks: [] };
    const saved = loadStudentWorks()[currentChapter.id] || {};
    const live = document.querySelector("#student-work-form") ? collectStudentWork() : null;
    const identity = live?.identity || loadStudentIdentity();
    const answers = live?.answers || saved.answers || [];
    const reflections = live?.reflections || saved.reflections || [];
    const videos = live?.videoSummaries || saved.videoSummaries || [];
    const viewedSections = saved.viewedSections || [];
    const quickQuiz = saved.quickQuiz || {};
    const requiredQuickQuizQuestions = quickQuizForChapter(currentChapter).length;
    const checks = [
      {
        label: "Materi, Ringkasan, dan LKPD sudah dibuka",
        passed: ["material", "summary", "worksheet"].every((name) => viewedSections.includes(name)),
      },
      {
        label: "Nama, nomor absen, dan kelas lengkap",
        passed: Boolean(identity?.name?.trim() && identity?.attendance?.trim() && identity?.className?.trim()),
      },
      {
        label: "Seluruh latihan uraian sudah dijawab",
        passed: answers.length === currentChapter.questions.length && answers.every((answer) => String(answer || "").trim().length >= 10),
      },
      {
        label: "Rencana produk/LKPD sudah diisi",
        passed: String(live?.projectPlan ?? saved.projectPlan ?? "").trim().length >= 20,
      },
      {
        label: "Tiga refleksi sudah diisi",
        passed: reflections.length === 3 && reflections.every((answer) => String(answer || "").trim().length >= 10),
      },
      {
        label: `${requiredQuickQuizQuestions} soal cek langsung sudah dijawab`,
        passed: Boolean(
          quickQuiz.complete
          && Array.isArray(quickQuiz.answered)
          && quickQuiz.answered.length === requiredQuickQuizQuestions
        ),
      },
      {
        label: "Dua ringkasan video masing-masing minimal 500 karakter",
        passed: videos.length === 2 && videos.every((summary) => String(summary || "").trim().length >= 500),
      },
    ];
    return { ready: checks.every((item) => item.passed), checks };
  }

  function updateLessonCompleteButton() {
    const button = document.querySelector("#toggle-lesson-complete");
    if (!button || !currentChapter) return;
    const validation = chapterCompletionValidation();
    let completed = state.completed.includes(currentChapter.id);
    if (completed && !validation.ready) {
      state.completed = state.completed.filter((id) => id !== currentChapter.id);
      completed = false;
      saveState();
      updateProgress();
    }
    const passedCount = validation.checks.filter((item) => item.passed).length;
    button.disabled = completed || !validation.ready;
    button.textContent = completed
      ? "✓ Bab sudah selesai"
      : validation.ready
        ? "Tandai bab selesai"
        : `🔒 Lengkapi tugas (${passedCount}/${validation.checks.length})`;
    button.classList.toggle("is-complete", completed);
    button.classList.toggle("is-ready", validation.ready && !completed);
    const summary = document.querySelector("#chapter-completion-summary");
    if (summary) {
      summary.textContent = completed
        ? "Seluruh komponen telah tervalidasi. Status bab dikunci sebagai selesai."
        : validation.ready
          ? "Seluruh komponen lengkap. Tombol penyelesaian bab sudah dapat digunakan."
          : `${passedCount} dari ${validation.checks.length} syarat terpenuhi. Lengkapi bagian yang belum bertanda centang.`;
    }
    const checks = document.querySelector("#chapter-completion-checks");
    if (checks) {
      checks.innerHTML = validation.checks.map((item) => `
        <span class="${item.passed ? "passed" : "pending"}">${item.passed ? "✓" : "○"} ${escapeHtml(item.label)}</span>`).join("");
    }
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
  document.querySelector("#download-lesson")?.addEventListener("click", () => {
    if (!currentChapter) return;
    const title = `Materi-PAIBP-${currentChapter.id}-${currentLessonView}`;
    const source = document.querySelector("#lesson-content");
    const blob = window.PAIBP_DOCX.createDocument({
      title,
      blocks: window.PAIBP_DOCX.blocksFromElement(source),
    });
    downloadBlob(blob, `${title}.docx`);
    setStudentStatus("Materi berhasil disiapkan sebagai dokumen. Periksa folder unduhan perangkat.");
  });

  const teacherGradeButtons = [...document.querySelectorAll("[data-teacher-grade]")];
  const teacherDocButtons = [...document.querySelectorAll("[data-teacher-doc]")];
  teacherGradeButtons.forEach((button) => button.addEventListener("click", () => {
    teacherGrade = button.dataset.teacherGrade;
    if (teacherDoc === "module") teacherModuleChapterId = `${teacherGrade}-1`;
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

  function readCustomAcademicEvents() {
    const stored = safeJsonParse(localStorage.getItem(CUSTOM_CALENDAR_KEY), []);
    return Array.isArray(stored) ? stored.filter((item) => item?.id && item?.start && item?.label) : [];
  }

  function writeCustomAcademicEvents(events) {
    localStorage.setItem(CUSTOM_CALENDAR_KEY, JSON.stringify(events));
  }

  const academicCategoryLabels = {
    pts: "PTS/STS",
    sas: "SAS/Sumatif Akhir Semester",
    report: "Pembagian laporan",
    holiday: "Libur sekolah",
    activity: "Kegiatan sekolah",
  };

  function calendarDocument() {
    const customEvents = readCustomAcademicEvents();
    return `${teacherIdentity("Kalender Pendidikan — Dokumen Kerja Sekolah")}
      <section class="document-section">
        <div class="teacher-source"><strong>Dasar:</strong> Peraturan Kepala Dinas Pendidikan Provinsi Jawa Tengah Nomor 400.3/23862/2026 tentang Pedoman Penyusunan Kalender Pendidikan Tahun Ajaran 2026/2027. Agenda satuan pendidikan seperti PTS/STS dan SAS tetap dimasukkan sesuai keputusan sekolah.</div>
        <table class="data-table">
          <thead><tr><th>Tanggal/Rentang</th><th>Agenda</th><th>Status/Keterangan</th></tr></thead>
          <tbody>${academicCalendar.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
      </section>
      <section class="document-section no-print">
        <h3>Tambahkan Agenda Sekolah</h3>
        <p>Agenda yang disimpan di sini akan langsung diberi warna pada tanggal Kalender Hijriah/Fitur Islami di perangkat ini.</p>
        <form class="academic-event-form" id="academic-event-form">
          <label>Nama agenda
            <input name="label" maxlength="100" placeholder="Contoh: PTS Semester Gasal" required>
          </label>
          <label>Jenis
            <select name="category" required>
              ${Object.entries(academicCategoryLabels).map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}
            </select>
          </label>
          <label>Tanggal mulai
            <input name="start" type="date" required>
          </label>
          <label>Tanggal selesai
            <input name="end" type="date">
          </label>
          <label class="academic-note-field">Keterangan
            <input name="note" maxlength="180" placeholder="Keterangan singkat untuk guru dan murid">
          </label>
          <button class="btn" type="submit">Simpan Agenda</button>
        </form>
        <p class="save-status" id="academic-event-status" aria-live="polite"></p>
        <div class="custom-event-list">
          ${customEvents.length ? customEvents.map((item) => `
            <article>
              <span class="academic-mark category-${escapeHtml(item.category)}">${escapeHtml(academicCategoryLabels[item.category] || "Agenda")}</span>
              <div><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.start)}${item.end && item.end !== item.start ? ` s.d. ${escapeHtml(item.end)}` : ""}</small></div>
              <button class="text-button danger-button" type="button" data-delete-academic-event="${escapeHtml(item.id)}">Hapus</button>
            </article>`).join("") : "<p>Belum ada agenda sekolah tambahan.</p>"}
        </div>
      </section>
      <section class="document-section">
        <h3>Checklist Finalisasi</h3>
        <ul>
          <li>Cocokkan agenda sekolah dengan Kaldik Provinsi Jawa Tengah dan keputusan Dindikpora Banjarnegara.</li>
          <li>Masukkan libur nasional, cuti bersama, libur khusus keagamaan, dan hari besar daerah yang resmi.</li>
          <li>Masukkan asesmen, pembagian laporan, kegiatan sekolah, serta agenda kokurikuler.</li>
          <li>Sinkronkan dengan analisis hari efektif dan jadwal PAIBP setiap rombongan belajar.</li>
        </ul>
      </section>`;
  }

  function attachAcademicCalendarManager() {
    document.querySelector("#academic-event-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const data = new FormData(form);
      const start = String(data.get("start") || "");
      const end = String(data.get("end") || start) || start;
      const status = document.querySelector("#academic-event-status");
      if (end < start) {
        if (status) {
          status.textContent = "Tanggal selesai tidak boleh sebelum tanggal mulai.";
          status.classList.add("error");
        }
        return;
      }
      const id = typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : `event-${Date.now()}`;
      const events = readCustomAcademicEvents();
      events.push({
        id,
        label: String(data.get("label") || "").trim(),
        category: String(data.get("category") || "activity"),
        start,
        end,
        note: String(data.get("note") || "").trim(),
      });
      writeCustomAcademicEvents(events);
      renderTeacherDocument();
      renderHijriCalendar();
      const refreshedStatus = document.querySelector("#academic-event-status");
      if (refreshedStatus) refreshedStatus.textContent = "Agenda tersimpan dan sudah ditandai pada kalender.";
    });
    document.querySelectorAll("[data-delete-academic-event]").forEach((button) => button.addEventListener("click", () => {
      if (!window.confirm("Hapus agenda ini dari kalender perangkat?")) return;
      writeCustomAcademicEvents(readCustomAcademicEvents().filter((item) => item.id !== button.dataset.deleteAcademicEvent));
      renderTeacherDocument();
      renderHijriCalendar();
    }));
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
    if (payload.work.videoSummaries && !Array.isArray(payload.work.videoSummaries)) return false;
    if ((payload.work.videoSummaries || []).length > 4) return false;
    if ((payload.work.videoSummaries || []).some((item) => String(item?.summary || "").length > 500000)) return false;
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
      ...(submission.work.videoSummaries || []).map((item) => item.summary),
    ];
    if (!values.length) return 0;
    return Math.round((values.filter((value) => String(value || "").trim()).length / values.length) * 100);
  }

  function accessDocument() {
    const configured = realtimeIsConfigured();
    return `${teacherIdentity("Rekap Akses Murid")}
      <section class="document-section">
        <div class="realtime-status ${configured ? "is-ready" : "is-offline"}">
          <span class="status-dot ${configured ? "ready" : "warning"}" aria-hidden="true"></span>
          <div>
            <strong>${configured ? "Sinkronisasi daring siap digunakan" : "Mode daring belum diaktifkan"}</strong>
            <p>${configured
              ? "Pilih Muat Ulang untuk mengambil kunjungan terbaru dari penyimpanan daring."
              : "Website tetap berfungsi secara lokal. Ikuti PANDUAN_REKAP_REALTIME.md untuk mengaktifkan rekap lintas perangkat."}</p>
          </div>
        </div>
        <div class="submission-import no-print">
          <button class="btn" id="refresh-access-recap" type="button" ${configured ? "" : "disabled"}>Muat Ulang Rekap</button>
          <button class="btn" id="export-access-csv" type="button" disabled>Unduh Rekap Word</button>
        </div>
        <div class="access-filters no-print">
          <label>Kelas <select id="access-class-filter"><option value="">Semua kelas</option></select></label>
          <label>Aktivitas
            <select id="access-action-filter">
              <option value="">Semua aktivitas</option>
              <option value="submission">Pengiriman tugas</option>
              <option value="bab">Bab/materi</option>
              <option value="bagian-bab">Bagian bab</option>
              <option value="ruang">Ruang portal</option>
            </select>
          </label>
          <label>Tanggal <input id="access-date-filter" type="date"></label>
        </div>
        <p class="save-status" id="access-recap-status" aria-live="polite">${configured ? "Belum memuat data." : "Alamat sinkronisasi belum diisi di app-config.js."}</p>
      </section>
      <section class="document-section">
        <div class="access-summary" id="access-summary"></div>
        <div class="table-scroll">
          <table class="data-table access-table">
            <thead><tr><th>Waktu</th><th>Nama/Absen</th><th>Kelas</th><th>Aktivitas yang Diakses</th><th>Durasi</th><th>Tempat</th><th>Koordinat dengan Izin</th></tr></thead>
            <tbody id="access-recap-body"><tr><td colspan="7">${configured ? "Pilih Muat Ulang Rekap." : "Aktifkan integrasi daring terlebih dahulu."}</td></tr></tbody>
          </table>
        </div>
      </section>
      <section class="document-section">
        <div class="warning"><strong>Perlindungan data:</strong> nama tempat dipilih murid. Koordinat dibulatkan dan hanya dikirim setelah izin lokasi diberikan oleh murid pada perangkatnya. Isi jawaban tidak dimasukkan ke log aktivitas.</div>
      </section>`;
  }

  function normalizeAccessRows(payload) {
    const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.events) ? payload.events : [];
    return rows
      .filter((item) => item && ["access", "submission"].includes(String(item.type)))
      .map((item) => ({
        timestamp: String(item.timestamp || ""),
        name: String(item.name || ""),
        attendance: String(item.attendance || ""),
        className: String(item.className || ""),
        type: String(item.type || "access"),
        action: String(item.action || ""),
        chapterId: String(item.chapterId || ""),
        chapterTitle: String(item.chapterTitle || ""),
        resourceType: String(item.resourceType || ""),
        resourceId: String(item.resourceId || ""),
        resourceTitle: String(item.resourceTitle || ""),
        durationSeconds: Math.max(0, Number(item.durationSeconds) || 0),
        locationLabel: String(item.locationLabel || ""),
        latitude: String(item.latitude || ""),
        longitude: String(item.longitude || ""),
        accuracy: String(item.accuracy || ""),
      }))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  function accessRowsCsv(rows) {
    const lines = [
      ["Waktu", "Nama", "Nomor Absen", "Kelas", "Jenis", "Aktivitas", "Jenis Akses", "ID Akses", "Judul Akses", "Durasi Detik", "Tempat", "Lintang", "Bujur", "Akurasi Meter"],
      ...rows.map((item) => [
        item.timestamp, item.name, item.attendance, item.className,
        item.type, item.action, item.resourceType, item.resourceId,
        item.resourceTitle || item.chapterTitle, item.durationSeconds,
        item.locationLabel, item.latitude, item.longitude, item.accuracy,
      ]),
    ].map((row) => row.map(csvCell).join(","));
    return `\ufeff${lines.join("\r\n")}`;
  }

  async function loadRealtimeAccess() {
    const status = document.querySelector("#access-recap-status");
    const body = document.querySelector("#access-recap-body");
    const summary = document.querySelector("#access-summary");
    const exportButton = document.querySelector("#export-access-csv");
    if (!status || !body || !summary || !realtimeIsConfigured()) return;
    status.textContent = "Mengambil data terbaru…";
    try {
      const url = new URL(appConfig.realtimeEndpoint);
      url.searchParams.set("action", "recap");
      if (appConfig.realtimeReadKey) url.searchParams.set("key", appConfig.realtimeReadKey);
      const response = await fetch(url.toString(), { cache: "no-store" });
      if (!response.ok) throw new Error("Respons tidak berhasil");
      const payload = await response.json();
      const rows = normalizeAccessRows(payload);
      const classes = rows.reduce((result, item) => {
        const label = item.className || "Belum mengisi kelas";
        result[label] = (result[label] || 0) + 1;
        return result;
      }, {});
      const classFilter = document.querySelector("#access-class-filter");
      const actionFilter = document.querySelector("#access-action-filter");
      const dateFilter = document.querySelector("#access-date-filter");
      if (classFilter) {
        classFilter.innerHTML = `<option value="">Semua kelas</option>${Object.keys(classes).sort((a, b) => a.localeCompare(b, "id", { numeric: true })).map((name) => `<option>${escapeHtml(name)}</option>`).join("")}`;
      }
      const formatDuration = (seconds) => {
        if (!seconds) return "—";
        const minutes = Math.floor(seconds / 60);
        const rest = seconds % 60;
        return minutes ? `${minutes} m ${rest} d` : `${rest} detik`;
      };
      const renderRows = () => {
        const visible = rows.filter((item) => {
          if (classFilter?.value && (item.className || "Belum mengisi kelas") !== classFilter.value) return false;
          if (actionFilter?.value === "submission" && item.type !== "submission") return false;
          if (actionFilter?.value && actionFilter.value !== "submission" && item.resourceType !== actionFilter.value) return false;
          if (dateFilter?.value && !item.timestamp.startsWith(dateFilter.value)) return false;
          return true;
        });
        const uniqueStudents = new Set(visible.filter((item) => item.name).map((item) => `${item.name}|${item.className}|${item.attendance}`));
        const totalDuration = visible.reduce((total, item) => total + item.durationSeconds, 0);
        summary.innerHTML = `
          <article><span>Aktivitas tampil</span><strong>${visible.length}</strong></article>
          <article><span>Murid terpantau</span><strong>${uniqueStudents.size}</strong></article>
          <article><span>Pengiriman tugas</span><strong>${visible.filter((item) => item.type === "submission").length}</strong></article>
          <article><span>Durasi tercatat</span><strong>${formatDuration(totalDuration)}</strong></article>`;
        body.innerHTML = visible.length ? visible.map((item) => `
        <tr>
          <td>${item.timestamp ? new Date(item.timestamp).toLocaleString("id-ID") : "—"}</td>
          <td><strong>${escapeHtml(item.name || "Belum mengisi nama")}</strong>${item.attendance ? `<br><small>Absen ${escapeHtml(item.attendance)}</small>` : ""}</td>
          <td>${escapeHtml(item.className || "—")}</td>
          <td><span class="activity-badge ${item.type === "submission" ? "is-submission" : ""}">${item.type === "submission" ? "Mengirim tugas" : escapeHtml(item.resourceType || item.action || "Membuka situs")}</span><br><small>${escapeHtml(item.resourceTitle || item.chapterTitle || item.resourceId || item.chapterId || "—")}</small></td>
          <td>${formatDuration(item.durationSeconds)}</td>
          <td>${escapeHtml(item.locationLabel || "Tidak dibagikan")}</td>
          <td>${item.latitude && item.longitude ? `${escapeHtml(item.latitude)}, ${escapeHtml(item.longitude)}${item.accuracy ? `<br><small>± ${escapeHtml(item.accuracy)} m</small>` : ""}` : "Tidak dibagikan"}</td>
        </tr>`).join("") : "<tr><td colspan='7'>Belum ada aktivitas murid yang sesuai filter.</td></tr>";
        if (exportButton) {
          exportButton.disabled = !visible.length;
          exportButton.onclick = () => {
            const blocks = visible.flatMap((item, index) => [
              { text: `${index + 1}. ${item.name || "Pengunjung"} — ${item.className || "Tanpa kelas"}`, style: "Heading2" },
              `Waktu: ${item.timestamp ? new Date(item.timestamp).toLocaleString("id-ID") : "—"}`,
              `Aktivitas: ${item.resourceTitle || item.chapterTitle || item.action || "Membuka situs"}`,
              `Durasi: ${formatDuration(item.durationSeconds)}`,
              `Tempat: ${item.locationLabel || "Tidak dibagikan"}`,
            ]);
            downloadBlob(
              window.PAIBP_DOCX.createDocument({ title: "Rekap Akses PAIBP SMART", blocks }),
              `Rekap-Akses-PAIBP-${new Date().toISOString().slice(0, 10)}.docx`,
            );
          };
        }
      };
      [classFilter, actionFilter, dateFilter].forEach((input) => input?.addEventListener("change", renderRows));
      renderRows();
      status.textContent = `${rows.length} aktivitas dimuat pada ${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}.`;
    } catch {
      status.textContent = "Rekap daring belum dapat dimuat. Periksa URL Web App, kunci baca, dan izin deployment.";
      status.classList.add("error");
    }
  }

  function attachAccessRecap() {
    document.querySelector("#refresh-access-recap")?.addEventListener("click", loadRealtimeAccess);
  }

  function submissionsDocument() {
    const recap = readSubmissionRecap().sort((a, b) => (
      String(a.student.className).localeCompare(String(b.student.className), "id", { numeric: true })
      || String(b.createdAt).localeCompare(String(a.createdAt))
    ));
    const grouped = recap.reduce((result, item) => {
      const className = String(item.student.className || "Kelas belum diisi").trim().toLocaleUpperCase("id");
      if (!result[className]) result[className] = [];
      result[className].push(item);
      return result;
    }, {});
    const classNames = Object.keys(grouped).sort((a, b) => a.localeCompare(b, "id", { numeric: true }));
    const groupTables = classNames.map((className) => {
      const items = grouped[className];
      const rows = items.map((item, index) => `
        <tr data-recap-id="${escapeHtml(item.submissionId)}">
          <td>${index + 1}</td>
          <td><strong>${escapeHtml(item.student.name)}</strong><br><small>Absen ${escapeHtml(item.student.attendance)}</small></td>
          <td>${escapeHtml(item.chapter.id)}<br><small>${escapeHtml(item.chapter.title)}</small></td>
          <td>${new Date(item.createdAt).toLocaleString("id-ID")}</td>
          <td>${completionPercent(item)}%</td>
          <td><input class="recap-score" type="number" min="0" max="100" value="${escapeHtml(item.teacher?.score ?? "")}" aria-label="Nilai ${escapeHtml(item.student.name)}"></td>
          <td><textarea class="recap-note" rows="2" maxlength="500" aria-label="Catatan ${escapeHtml(item.student.name)}">${escapeHtml(item.teacher?.note || "")}</textarea></td>
          <td class="no-print"><button class="text-button" type="button" data-view-submission="${escapeHtml(item.submissionId)}">Lihat</button><button class="text-button danger-button" type="button" data-delete-submission="${escapeHtml(item.submissionId)}">Hapus</button></td>
        </tr>`).join("");
      return `<section class="recap-class-group">
        <div class="recap-class-heading"><h3>Kelas ${escapeHtml(className)}</h3><span>${items.length} pekerjaan</span></div>
        <div class="table-scroll">
          <table class="data-table recap-table">
            <thead><tr><th>No.</th><th>Nama/Absen</th><th>Bab</th><th>Dibuat</th><th>Isi</th><th>Nilai</th><th>Catatan Guru</th><th class="no-print">Aksi</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </section>`;
    }).join("");
    return `${teacherIdentity("Rekap Pekerjaan Murid")}
      <section class="document-section no-print">
        <div class="warning"><strong>Privasi:</strong> berkas tugas hanya dibaca di browser guru dan rekap disimpan pada perangkat ini. Jangan unggah berkas identitas murid ke repositori publik.</div>
        <div class="submission-import">
          <label class="file-drop">Impor berkas tugas murid (.docx)
            <input id="submission-files" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" multiple>
          </label>
          <button class="btn" id="sync-submissions-online" type="button" ${realtimeIsConfigured() ? "" : "disabled"}>Muat Tugas Daring</button>
          <button class="btn" id="export-recap-csv" type="button">Unduh Rekap Word</button>
          <button class="btn" id="backup-recap-json" type="button">Cadangkan Jawaban Word</button>
          <button class="text-button danger-button" id="clear-recap" type="button">Hapus semua rekap</button>
        </div>
        <p class="save-status" id="recap-status" aria-live="polite">${recap.length} pekerjaan tersimpan pada perangkat ini.</p>
        ${classNames.length ? `<div class="class-summary">${classNames.map((className) => `<span>Kelas ${escapeHtml(className)} <strong>${grouped[className].length}</strong></span>`).join("")}</div>` : ""}
      </section>
      <section class="document-section">
        ${groupTables || "<div class='empty-recap'><strong>Belum ada tugas.</strong><p>Minta murid mengirimkan berkas Word (.docx), lalu impor di sini.</p></div>"}
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
    const blocks = recap.flatMap((item, index) => [
      { text: `${index + 1}. ${item.student.name} — ${item.student.className}`, style: "Heading2" },
      `Nomor absen: ${item.student.attendance}`,
      `Bab: ${item.chapter.id} — ${item.chapter.title}`,
      `Tanggal: ${item.createdAt ? new Date(item.createdAt).toLocaleString("id-ID") : "—"}`,
      `Kelengkapan: ${completionPercent(item)}%`,
      `Nilai: ${item.teacher?.score ?? "Belum dinilai"}`,
      `Catatan guru: ${item.teacher?.note || "Belum ada catatan"}`,
    ]);
    downloadBlob(
      window.PAIBP_DOCX.createDocument({ title: "Rekap Pekerjaan Murid — PAIBP SMART", blocks }),
      `Rekap-PAIBP-${new Date().toISOString().slice(0, 10)}.docx`,
    );
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
      ${item.work.reflections.map((entry) => `<p><strong>${escapeHtml(entry.prompt)}</strong></p><div class="submitted-answer">${escapeHtml(entry.answer)}</div>`).join("")}
      ${(item.work.videoSummaries || []).length ? `
        <h4>Ringkasan video</h4>
        ${(item.work.videoSummaries || []).map((entry) => `
          <article class="submitted-video-summary">
            <p><strong>${escapeHtml(entry.title)}</strong> • ${escapeHtml(entry.channel)}</p>
            <div class="submitted-answer">${escapeHtml(entry.summary)}</div>
          </article>`).join("")}` : ""}`;
    container.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
  }

  async function loadRealtimeSubmissions() {
    const status = document.querySelector("#recap-status");
    if (!status || !realtimeIsConfigured()) return;
    status.textContent = "Mengambil pekerjaan terbaru dari penyimpanan sekolah…";
    try {
      const url = new URL(appConfig.realtimeEndpoint);
      url.searchParams.set("action", "submissions");
      if (appConfig.realtimeReadKey) url.searchParams.set("key", appConfig.realtimeReadKey);
      const response = await fetch(url.toString(), { cache: "no-store" });
      if (!response.ok) throw new Error("Respons tidak berhasil");
      const payload = await response.json();
      const online = Array.isArray(payload) ? payload : Array.isArray(payload?.submissions) ? payload.submissions : [];
      const valid = online.filter(validateSubmission);
      const current = readSubmissionRecap();
      let added = 0;
      let updated = 0;
      valid.forEach((submission) => {
        const logicalKey = submissionStudentKey(submission);
        const index = current.findIndex((item) => (
          item.submissionId === submission.submissionId
          || submissionStudentKey(item) === logicalKey
        ));
        if (index >= 0) {
          current[index] = {
            ...submission,
            teacher: current[index].teacher || submission.teacher || {},
          };
          updated += 1;
        } else {
          current.push(submission);
          added += 1;
        }
      });
      current.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      writeSubmissionRecap(current);
      renderTeacherDocument();
      const refreshedStatus = document.querySelector("#recap-status");
      if (refreshedStatus) refreshedStatus.textContent = `${added} pekerjaan baru dan ${updated} pembaruan dimuat dari penyimpanan sekolah.`;
    } catch {
      status.textContent = "Tugas daring belum dapat dimuat. Periksa URL Web App, kunci baca, dan izin deployment.";
      status.classList.add("error");
    }
  }

  function attachSubmissionRecap() {
    document.querySelector("#sync-submissions-online")?.addEventListener("click", loadRealtimeSubmissions);
    document.querySelector("#submission-files")?.addEventListener("change", async (event) => {
      const files = [...event.target.files];
      const current = readSubmissionRecap();
      let accepted = 0;
      let rejected = 0;
      for (const file of files) {
        try {
          if (file.size > 10_000_000) throw new Error("Berkas terlalu besar");
          const parsed = await window.PAIBP_DOCX.readCustomData(file);
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
      const recap = readSubmissionRecap();
      const blocks = recap.flatMap((item, index) => [
        { text: `${index + 1}. ${item.student.name} — ${item.student.className}`, style: "Heading2" },
        `${item.chapter.id} — ${item.chapter.title}`,
        `Kelengkapan ${completionPercent(item)}% • Nilai ${item.teacher?.score ?? "belum dinilai"}`,
      ]);
      downloadBlob(
        window.PAIBP_DOCX.createDocument({
          title: "Cadangan Jawaban dan Rekap PAIBP SMART",
          blocks,
          customData: recap,
        }),
        `Cadangan-Rekap-PAIBP-${new Date().toISOString().slice(0, 10)}.docx`,
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

  function sourceBlockText(block) {
    if (block?.type === "table") return (block.rows || []).flat().join(" ");
    return String(block?.text || "");
  }

  function isSourceArtifact(block) {
    const text = sourceBlockText(block).replace(/\s+/g, " ").trim();
    return /^(?:top of form|bottom of form)$/i.test(text);
  }

  function isSignatureBlock(block, index, total) {
    const text = sourceBlockText(block).replace(/\s+/g, " ").trim();
    if (!text) return false;
    const markers = [
      /mengetahui/i,
      /kepala sekolah/i,
      /guru (?:mata pelajaran|paibp|pendidikan agama)/i,
      /\bNIP\.?\s*\d/i,
      /susukan.{0,30}20\d{2}/i,
    ];
    const matches = markers.filter((pattern) => pattern.test(text)).length;
    if (block.type === "table") return matches >= 2;
    if (index < Math.max(0, total - 35)) return false;
    return matches >= 1;
  }

  function isSourceHeading(text, blockType) {
    if (!/^heading/.test(String(blockType || ""))) return false;
    const value = String(text || "").trim();
    const words = value.split(/\s+/).filter(Boolean);
    if (!value || value.length > 125 || words.length > 16 || /[.!?;:]\s*$/.test(value)) return false;
    const cue = /^(?:BAB\b|MODUL\b|PERTEMUAN\b|KEGIATAN\b|ASESMEN\b|CAPAIAN\b|TUJUAN\b|ALUR\b|PROGRAM\b|KRITERIA\b|IDENTITAS\b|INFORMASI\b|KOMPONEN\b|LAMPIRAN\b|DESAIN\b|TOPIK\b|PRAKTIK\b|LINGKUNGAN\b|PEMANFAATAN\b|REFLEKSI\b|MODEL PEMBELAJARAN\b|PENDEKATAN PEMBELAJARAN\b|METODE PEMBELAJARAN\b|STRATEGI PEMBELAJARAN\b|DIFERENSIASI\b|[A-Z]\.\s|[IVX]+\.\s|\d+(?:\.\d+)*[.)]\s)/i;
    if (cue.test(value)) return true;
    const letters = [...value].filter((character) => /\p{L}/u.test(character));
    if (letters.length && letters.filter((character) => character === character.toUpperCase()).length / letters.length > 0.72) return true;
    const meaningful = words.filter((word) => !/^(?:dan|atau|yang|dalam|dengan|pada|ke|dari|untuk)$/i.test(word));
    return words.length >= 2 && meaningful.length > 0
      && meaningful.every((word) => /^[A-ZÀ-ÖØ-Þ0-9"'(]/.test(word));
  }

  function completedSourceTableRows(sourceRows = []) {
    const rows = sourceRows.map((row) => (Array.isArray(row) ? [...row] : []));
    const headerIndex = rows.findIndex((row) => row.some((cell) => /alokasi waktu/i.test(String(cell || ""))));
    if (headerIndex < 0) return rows;
    const allocationColumn = rows[headerIndex].findIndex((cell) => /alokasi waktu/i.test(String(cell || "")));
    if (allocationColumn < 0) return rows;

    const isObjective = (value) => /^(?:murid|peserta didik)\s+(?:mampu|dapat)\b/i.test(String(value || "").trim());
    const isChapter = (value) => /^bab\s+\d+\b/i.test(String(value || "").trim());
    const firstColumnValue = (row) => String(row?.[0] || "").replace(/\s+/g, " ").trim();
    const allocationValue = (row) => String(row?.[allocationColumn] || "").trim();

    // Tujuan pembelajaran yang masih kosong diberi estimasi baku tiga JP.
    // Nilai hanya diterapkan pada salinan transkripsi, bukan pada berkas sumber.
    rows.slice(headerIndex + 1).forEach((row) => {
      const text = firstColumnValue(row);
      const rowText = row.map((cell) => String(cell || "")).join(" ");
      if (!allocationValue(row) && (isObjective(text) || isObjective(rowText))) {
        row[allocationColumn] = "3 JP";
      }
    });

    // Baris judul bab pada tabel program semester diisi dengan jumlah JP
    // tujuan yang berada di bawahnya sampai judul bab berikutnya.
    for (let index = headerIndex + 1; index < rows.length; index += 1) {
      if (!isChapter(firstColumnValue(rows[index])) || allocationValue(rows[index])) continue;
      let total = 0;
      for (let nextIndex = index + 1; nextIndex < rows.length; nextIndex += 1) {
        if (isChapter(firstColumnValue(rows[nextIndex]))) break;
        const hours = Number(allocationValue(rows[nextIndex]).match(/(\d+(?:[.,]\d+)?)\s*JP/i)?.[1]?.replace(",", ".") || 0);
        total += hours;
      }
      if (total > 0) rows[index][allocationColumn] = `${total} JP (total bab)`;
    }
    return rows;
  }

  function preparedSourceBlocks(blocks = []) {
    return blocks.map((block) => {
      if (block.type !== "table") return { ...block };
      return { ...block, rows: completedSourceTableRows(block.rows) };
    });
  }

  function sourceBlocksHtml(blocks = []) {
    let html = "";
    let listItems = [];
    const flushList = () => {
      if (!listItems.length) return;
      html += `<ul class="source-list source-bullet-list">${listItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
      listItems = [];
    };
    const listForIntro = (intro, items) => {
      const safeItems = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
      if (/bertujuan|meliputi|mencakup|sebagai berikut|antara lain/i.test(intro)) {
        return `<ul class="source-list source-bullet-list">${safeItems}</ul>`;
      }
      if (/langkah|tahap|urutan|pertemuan|prosedur/i.test(intro)) {
        return `<ol class="source-list source-number-list">${safeItems}</ol>`;
      }
      return `<ol class="source-list source-academic-list" type="a">${safeItems}</ol>`;
    };
    const visibleBlocks = blocks.filter((block, index) => (
      !isSignatureBlock(block, index, blocks.length) && !isSourceArtifact(block)
    ));
    for (let index = 0; index < visibleBlocks.length; index += 1) {
      const block = visibleBlocks[index];
      if (block.type === "list") {
        listItems.push(block.text);
        continue;
      }
      flushList();
      if (block.type === "table") {
        const rows = Array.isArray(block.rows) ? block.rows : [];
        if (!rows.length) continue;
        const columnCount = Math.max(...rows.map((row) => row.length));
        html += `<div class="source-table-scroll"><table class="data-table source-table"><tbody>${rows.map((row, rowIndex) => {
          const cells = [...row, ...Array(Math.max(0, columnCount - row.length)).fill("")];
          const cellTag = rowIndex === 0 ? "th" : "td";
          return `<tr>${cells.map((cell) => `<${cellTag}>${escapeHtml(cell)}</${cellTag}>`).join("")}</tr>`;
        }).join("")}</tbody></table></div>`;
        continue;
      }
      let tag = {
        heading2: "h2",
        heading3: "h3",
        heading4: "h4",
      }[block.type] || "p";
      const text = String(block.text || "").trim();
      // Sebagian berkas Word memakai bold/heading untuk paragraf dan butir biasa.
      // Hanya teks yang benar-benar berbentuk judul atau subjudul dipertahankan.
      if (tag !== "p" && !isSourceHeading(text, block.type)) tag = "p";
      html += `<${tag}>${escapeHtml(block.text)}</${tag}>`;
      if (tag === "p" && /[:：]\s*$/.test(text)) {
        const academicItems = [];
        let nextIndex = index + 1;
        while (nextIndex < visibleBlocks.length && academicItems.length < 24) {
          const nextBlock = visibleBlocks[nextIndex];
          if (nextBlock.type === "table") break;
          const nextText = String(nextBlock.text || "").trim();
          if (!nextText || isSourceHeading(nextText, nextBlock.type) || nextText.length > 420) break;
          academicItems.push(nextText);
          nextIndex += 1;
        }
        if (academicItems.length >= 2) {
          html += listForIntro(text, academicItems);
          index = nextIndex - 1;
        }
      }
    }
    flushList();
    return html;
  }

  function selectedTeacherSource() {
    const gradeSource = teacherSources[teacherGrade];
    if (!gradeSource) return null;
    if (teacherDoc === "module") {
      const chapterNumber = Number(String(teacherModuleChapterId).split("-")[1]) || 1;
      return gradeSource.modules?.[String(chapterNumber)] || null;
    }
    return gradeSource[teacherDoc] || null;
  }

  function objectiveHourRows(chapter) {
    const objectives = chapter.objectives?.length ? chapter.objectives : ["Mencapai tujuan pembelajaran bab."];
    const base = Math.floor(chapter.allocation / objectives.length);
    const remainder = chapter.allocation % objectives.length;
    return objectives.map((objective, index) => ({
      objective,
      hours: base + (index < remainder ? 1 : 0),
    }));
  }

  function teacherPlanningRows(gradeChapters) {
    const protaSource = teacherSources[teacherGrade]?.prota;
    const extracted = [];
    const seen = new Set();
    (protaSource?.blocks || []).filter((block) => block.type === "table").forEach((block) => {
      const rows = Array.isArray(block.rows) ? block.rows : [];
      const headerIndex = rows.findIndex((row) => row.some((cell) => /alur (?:dan )?tujuan pembelajaran/i.test(String(cell))));
      if (headerIndex < 0) return;
      const headers = rows[headerIndex].map((cell) => String(cell || "").trim());
      const chapterColumn = headers.findIndex((cell) => /^bab$/i.test(cell));
      const objectiveColumn = headers.findIndex((cell) => /alur (?:dan )?tujuan pembelajaran/i.test(cell));
      const materialColumn = headers.findIndex((cell) => /^materi$/i.test(cell));
      const allocationColumn = headers.findIndex((cell) => /alokasi waktu/i.test(cell));
      let currentChapter = null;
      rows.slice(headerIndex + 1).forEach((row) => {
        const chapterText = chapterColumn >= 0 ? String(row[chapterColumn] || "").trim() : "";
        const chapterMatch = chapterText.match(/\bBab\s+(\d+)(?::\s*(.*))?/i);
        if (chapterMatch) currentChapter = Number(chapterMatch[1]);
        const objective = objectiveColumn >= 0 ? String(row[objectiveColumn] || "").replace(/\s+/g, " ").trim() : "";
        if (!currentChapter || !/^murid mampu/i.test(objective)) return;
        const chapter = gradeChapters.find((item) => item.number === currentChapter);
        if (!chapter) return;
        const key = `${currentChapter}|${objective.toLocaleLowerCase("id")}`;
        if (seen.has(key)) return;
        seen.add(key);
        const allocationText = allocationColumn >= 0 ? String(row[allocationColumn] || "").trim() : "";
        const parsedHours = Number(allocationText.match(/(\d+)\s*JP/i)?.[1] || 3);
        extracted.push({
          chapter,
          objective,
          material: materialColumn >= 0
            ? String(row[materialColumn] || "").replace(/\s+/g, " ").trim() || chapter.title
            : chapter.title,
          hours: parsedHours > 0 ? parsedHours : 3,
        });
      });
    });
    if (extracted.length >= 30) return extracted;
    return gradeChapters.flatMap((chapter) => objectiveHourRows(chapter).map(({ objective, hours }) => ({
      chapter,
      objective,
      material: chapter.title,
      hours,
    })));
  }

  function operationalTeacherSupplementHtml(gradeChapters) {
    const planningRows = teacherPlanningRows(gradeChapters);
    const totalHours = planningRows.reduce((sum, row) => sum + row.hours, 0);
    const purposeItems = [
      "Meningkatkan keimanan, ketakwaan kepada Allah Subhanahu Wata'ala, serta membiasakan akhlak mulia dalam kehidupan sehari-hari;",
      "Memahami prinsip-prinsip ajaran Islam berdasarkan Al Qur'an, Hadits Riwayat, akidah Ahl al-Sunnah wa al-Jama'ah, fikih, akhlak, dan sejarah peradaban Islam secara utuh, benar, dan bertanggung jawab;",
      "Menghayati nilai-nilai ajaran Islam sehingga mampu mengambil keputusan berdasarkan pertimbangan syariat, kemaslahatan, dan hikmah dalam menghadapi berbagai persoalan kehidupan;",
      "Menerapkan kemampuan bernalar kritis, kreatif, komunikatif, kolaboratif, dan reflektif dalam memahami, menganalisis, serta menyelesaikan permasalahan berdasarkan nilai-nilai Islam;",
      "Membangun sikap moderat (wasatiyyah), toleran, menghargai keberagaman, serta menjunjung tinggi persatuan dalam kehidupan bermasyarakat, berbangsa, dan bernegara;",
      "Mengembangkan kepedulian terhadap lingkungan sebagai amanah Allah Subhanahu Wata'ala dengan menjalankan fungsi manusia sebagai khalifah di muka bumi;",
      "Menumbuhkan semangat menuntut ilmu, berinovasi, berkarya, serta mengambil ibrah dari perkembangan sejarah peradaban Islam sebagai inspirasi dalam membangun peradaban masa depan;",
      "Membentuk pribadi muslim yang mampu mengintegrasikan iman, ilmu, amal saleh, dan akhlak mulia secara konsisten dalam kehidupan nyata.",
    ];
    if (teacherDoc === "cp") {
      return `<section class="source-operational" id="source-document-start" tabindex="-1">
        <h3>A. Tujuan Mata Pelajaran</h3>
        <p>Mata Pelajaran Pendidikan Agama Islam dan Budi Pekerti bertujuan membimbing murid agar mampu:</p>
        <ul class="source-list source-bullet-list">${purposeItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        <h3>B. Keterkaitan dengan Fase D</h3>
        <p>Tujuan mata pelajaran dijabarkan secara hierarkis melalui Capaian Pembelajaran, tujuan pembelajaran, alur tujuan pembelajaran, asesmen, dan tindak lanjut kelas VII, VIII, serta IX.</p>
      </section>`;
    }
    if (teacherDoc === "atp") {
      let cumulative = 0;
      return `<section class="source-operational" id="source-document-start" tabindex="-1">
        <h3>ATP Operasional Lengkap Kelas ${teacherGrade}</h3>
        <p>Alur disusun dari pemahaman konsep menuju analisis, penerapan, karya, dan refleksi:</p>
        <div class="source-table-scroll"><table class="data-table"><thead><tr><th>No.</th><th>Semester</th><th>Elemen dan Bab</th><th>Tujuan Pembelajaran</th><th>Materi</th><th>Alokasi Waktu</th><th>Estimasi Pertemuan</th></tr></thead><tbody>
          ${planningRows.map((row, index) => {
            cumulative += row.hours;
            return `<tr><td>${index + 1}</td><td>Semester ${row.chapter.semester}</td><td>${escapeHtml(row.chapter.element)}<br>${row.chapter.number}. ${escapeHtml(row.chapter.title)}</td><td>${escapeHtml(row.objective)}</td><td>${escapeHtml(row.material)}</td><td>${row.hours} JP<br><small>Kumulatif ${cumulative} JP</small></td><td>${Math.ceil(row.hours / 3)} pertemuan</td></tr>`;
          }).join("")}
          <tr class="total-row"><td colspan="5">Jumlah Kelas ${teacherGrade}</td><td>${totalHours} JP</td><td>${Math.ceil(totalHours / 3)} pertemuan</td></tr>
        </tbody></table></div>
      </section>`;
    }
    if (teacherDoc === "prota") {
      return `<section class="source-operational" id="source-document-start" tabindex="-1">
        <h3>Program Tahunan Lengkap Kelas ${teacherGrade}</h3>
        <div class="source-table-scroll"><table class="data-table"><thead><tr><th>No.</th><th>Semester</th><th>Bab</th><th>Alur Tujuan Pembelajaran</th><th>Materi</th><th>Alokasi Waktu</th><th>Durasi</th><th>Keterangan</th></tr></thead><tbody>
          ${planningRows.map((row, index) => `<tr><td>${index + 1}</td><td>Semester ${row.chapter.semester}</td><td>${row.chapter.number}. ${escapeHtml(row.chapter.title)}</td><td>${escapeHtml(row.objective)}</td><td>${escapeHtml(row.material)}</td><td>${row.hours} JP</td><td>${Math.ceil(row.hours / 3)} pertemuan</td><td>Materi, latihan, LKPD, asesmen formatif, refleksi, dan tindak lanjut.</td></tr>`).join("")}
          <tr class="total-row"><td colspan="5">Jumlah Alokasi Materi Inti</td><td>${totalHours} JP</td><td>${Math.ceil(totalHours / 3)} pertemuan</td><td>Diselaraskan dengan minggu efektif dan agenda satuan pendidikan.</td></tr>
        </tbody></table></div>
      </section>`;
    }
    if (teacherDoc === "promes") {
      const months = { Gasal: ["Juli", "Agustus", "September", "Oktober", "November"], Genap: ["Januari", "Februari", "Maret", "April", "Mei"] };
      const chapterOccurrences = {};
      return `<section class="source-operational" id="source-document-start" tabindex="-1">
        <h3>Program Semester Lengkap Kelas ${teacherGrade}</h3>
        <div class="source-table-scroll"><table class="data-table"><thead><tr><th>No.</th><th>Semester</th><th>Bulan Target</th><th>Bab</th><th>Tujuan Pembelajaran</th><th>Alokasi Waktu</th><th>Durasi</th><th>Minggu Target</th><th>Keterangan</th></tr></thead><tbody>
          ${planningRows.map((row, index) => {
            const monthIndex = (row.chapter.number - 1) % 5;
            const year = row.chapter.semester === "Gasal" ? "2026" : "2027";
            const occurrence = (chapterOccurrences[row.chapter.number] || 0) + 1;
            chapterOccurrences[row.chapter.number] = occurrence;
            return `<tr><td>${index + 1}</td><td>Semester ${row.chapter.semester}</td><td>${months[row.chapter.semester][monthIndex]} ${year}</td><td>${row.chapter.number}. ${escapeHtml(row.chapter.title)}</td><td>${escapeHtml(row.objective)}</td><td>${row.hours} JP</td><td>${Math.ceil(row.hours / 3)} pertemuan</td><td>Minggu efektif ke-${occurrence}</td><td>Materi, latihan, LKPD, asesmen, refleksi, remedial, dan pengayaan.</td></tr>`;
          }).join("")}
          <tr class="total-row"><td colspan="5">Jumlah Program Semester Gasal dan Genap</td><td>${totalHours} JP</td><td>${Math.ceil(totalHours / 3)} pertemuan</td><td colspan="2">Tanggal rinci mengikuti Kalender Pendidikan dan jadwal sekolah.</td></tr>
        </tbody></table></div>
      </section>`;
    }
    if (teacherDoc === "kktp") {
      const rows = planningRows.map((row, index) => `<tr><td>${index + 1}</td><td>${row.chapter.number}. ${escapeHtml(row.chapter.title)}<br><small>${escapeHtml(row.chapter.element)}</small></td><td>${escapeHtml(row.objective)}</td><td>Konsep benar, alasan relevan, penerapan tepat, dan hasil dapat dipertanggungjawabkan.</td><td>${escapeHtml(row.material)}; latihan; LKPD; observasi; produk/proyek; dan refleksi.</td><td>Perlu Bimbingan; Berkembang; Cakap; Mahir</td><td>${row.hours} JP</td></tr>`);
      return `<section class="source-operational" id="source-document-start" tabindex="-1">
        <h3>KKTP Operasional Lengkap Kelas ${teacherGrade}</h3>
        <p>Setiap tujuan memiliki indikator, bukti belajar, interval deskriptif, dan alokasi waktu agar kolom kelas IX maupun kelas lain tetap utuh:</p>
        <div class="source-table-scroll"><table class="data-table"><thead><tr><th>No.</th><th>Bab/Elemen</th><th>Tujuan Pembelajaran</th><th>Kriteria Cakap</th><th>Bukti/Asesmen</th><th>Interval Deskriptif</th><th>Alokasi Waktu</th></tr></thead><tbody>${rows.join("")}
          <tr class="total-row"><td colspan="6">Jumlah Alokasi Kelas ${teacherGrade}</td><td>${totalHours} JP</td></tr>
        </tbody></table></div>
      </section>`;
    }
    return "";
  }

  function teacherSourceDocument(gradeChapters) {
    const source = selectedTeacherSource();
    if (!source) return "";
    const operationalSupplement = operationalTeacherSupplementHtml(gradeChapters);
    const preparedBlocks = preparedSourceBlocks(source.blocks);
    const modulePicker = teacherDoc === "module" ? `
      <section class="module-picker no-print">
        <label>Pilih modul/bab
          <select id="module-chapter-select">
            ${gradeChapters.map((item) => `<option value="${item.id}"${item.id === teacherModuleChapterId ? " selected" : ""}>Bab ${item.number} — ${escapeHtml(item.title)}</option>`).join("")}
          </select>
        </label>
        <span class="live-badge">10 modul sumber lengkap</span>
      </section>` : "";
    return `${modulePicker}
      <section class="document-cover source-cover">
        <p>PERANGKAT AJAR SUMBER • KELAS ${teacherGrade}</p>
        <h2>${escapeHtml(source.label)}</h2>
        <p>Isi sumber dilengkapi susunan operasional, alokasi JP, penomoran ilmiah, dan tabel utuh agar siap dibaca, dicetak, serta dikembangkan.</p>
        <div class="source-file-actions no-print">
          <button class="cta btn-compact" type="button" data-download-source>Unduh Dokumen Lengkap .docx</button>
          <button class="btn btn-compact" type="button" data-open-source>Baca Isi Dokumen</button>
          <span>Sumber pengolahan: ${escapeHtml(source.sourceName)}</span>
        </div>
        <p class="save-status no-print" id="source-download-status" aria-live="polite"></p>
      </section>
      <div class="teacher-source-notice">
        <strong>Dokumen lengkap dan siap digunakan.</strong>
        Isi web diadopsi dari berkas sumber kelas ${teacherGrade}. Kolom Alokasi Waktu yang kosong dilengkapi pada salinan tampilan dan unduhan berdasarkan tujuan pembelajaran; berkas sumber asli tetap utuh dan tidak diubah.
      </div>
      ${operationalSupplement}
      ${operationalSupplement
        ? `<details class="source-original-details"><summary>Lihat transkripsi berkas lampiran asli</summary><section class="source-document"><h3>Isi Berkas Sumber</h3><p class="source-completion-note">Catatan: isi, urutan, dan tabel mengikuti lampiran. Sel Alokasi Waktu yang kosong dilengkapi hanya pada salinan ini; berkas asli tidak diubah.</p>${sourceBlocksHtml(preparedBlocks)}</section></details>`
        : `<section class="source-document" id="source-document-start" tabindex="-1"><h3>Isi Berkas Sumber</h3><p class="source-completion-note">Catatan: isi, urutan, dan tabel mengikuti lampiran. Sel Alokasi Waktu yang kosong dilengkapi hanya pada salinan ini; berkas asli tidak diubah.</p>${sourceBlocksHtml(preparedBlocks)}</section>`}`;
  }

  function teacherSourceDocxBlocks(source) {
    let listNumber = 0;
    const preparedBlocks = preparedSourceBlocks(source.blocks);
    return preparedBlocks
      .filter((block, index) => !isSignatureBlock(block, index, preparedBlocks.length) && !isSourceArtifact(block))
      .flatMap((block) => {
        if (block.type === "table") {
          listNumber = 0;
          return [{
            type: "table",
            headerRows: 1,
            rows: (block.rows || []).map((row, rowIndex) => ({
              header: rowIndex === 0,
              cells: row.map((cell) => ({ text: String(cell || ""), header: rowIndex === 0 })),
            })),
          }];
        }
        const text = String(block.text || "").trim();
        if (!text) return [];
        if (block.type === "list") {
          listNumber += 1;
          return [{ text: `${listNumber}. ${text}` }];
        }
        listNumber = 0;
        const style = isSourceHeading(text, block.type)
          ? (block.type === "heading2" ? "Heading1" : block.type === "heading3" ? "Heading2" : "Heading3")
          : "";
        return [{ text, style }];
      });
  }

  async function downloadSelectedTeacherSource() {
    const source = selectedTeacherSource();
    const status = document.querySelector("#source-download-status");
    if (!source) return;
    if (status) status.textContent = "Menyiapkan dokumen Word lengkap…";
    try {
      const documentElement = document.querySelector("#source-document-start");
      if (!documentElement) throw new Error("Isi dokumen belum tersedia");
      const blob = window.PAIBP_DOCX.createDocument({
        title: `${source.label} Kelas ${teacherGrade}`,
        blocks: window.PAIBP_DOCX.blocksFromElement(documentElement),
      });
      const sourceFilename = source.downloadPath.split("/").pop() || `${teacherGrade}-${teacherDoc}.docx`;
      const filename = sourceFilename.replace(/\.docx$/i, "-lengkap-v19.docx");
      downloadBlob(blob, filename);
      if (status) status.textContent = "Dokumen Word lengkap berhasil disiapkan langsung dari isi portal. Tidak ada tautan halaman 404.";
    } catch (error) {
      if (status) status.textContent = "Dokumen belum dapat dibuat. Muat ulang halaman versi v19 lalu coba kembali.";
    }
  }

  function openSelectedTeacherSource() {
    const sourceDocument = document.querySelector("#source-document-start");
    const status = document.querySelector("#source-download-status");
    if (!sourceDocument) return;
    sourceDocument.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
    sourceDocument.focus({ preventScroll: true });
    if (status) status.textContent = "Isi berkas lengkap dibuka di bawah tanpa berpindah ke halaman 404.";
  }

  function renderTeacherDocument() {
    const gradeChapters = chapters.filter((chapter) => chapter.grade === teacherGrade);
    let html = "";
    if (selectedTeacherSource()) html = teacherSourceDocument(gradeChapters);
    else if (teacherDoc === "calendar") html = calendarDocument();
    else if (teacherDoc === "access") html = accessDocument();
    else if (teacherDoc === "submissions") html = submissionsDocument();
    else html = cpDocument();
    const container = document.querySelector("#teacher-document");
    if (!container) return;
    container.innerHTML = html;
    if (teacherDoc === "module") {
      document.querySelector("#module-chapter-select")?.addEventListener("change", (event) => {
        teacherModuleChapterId = event.target.value;
        renderTeacherDocument();
      });
    }
    document.querySelector("[data-download-source]")?.addEventListener("click", downloadSelectedTeacherSource);
    document.querySelector("[data-open-source]")?.addEventListener("click", openSelectedTeacherSource);
    if (teacherDoc === "calendar") attachAcademicCalendarManager();
    if (teacherDoc === "access") attachAccessRecap();
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
    module: "Modul Ajar Lengkap", access: "Rekap Akses Murid", submissions: "Rekap Pekerjaan Murid",
  };
  document.querySelector("#print-teacher-document")?.addEventListener("click", () => {
    printDocument(
      `${teacherDocTitles[teacherDoc]} Kelas ${teacherGrade}`,
      printableHtmlFrom(document.querySelector("#teacher-document")),
    );
  });
  document.querySelector("#download-teacher-document")?.addEventListener("click", () => {
    const title = `${teacherDocTitles[teacherDoc]}-PAIBP-Kelas-${teacherGrade}-2026-2027`;
    const blob = window.PAIBP_DOCX.createDocument({
      title,
      blocks: window.PAIBP_DOCX.blocksFromElement(document.querySelector("#teacher-document")),
    });
    downloadBlob(blob, `${title}.docx`);
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
    currentPrayerTimings = timings;
    document.querySelectorAll("[data-prayer]").forEach((element) => {
      element.textContent = String(timings[element.dataset.prayer] || "--:--").match(/\d{1,2}:\d{2}/)?.[0] || "--:--";
    });
    updatePrayerCountdown();
    window.clearInterval(prayerCountdownTimer);
    prayerCountdownTimer = window.setInterval(updatePrayerCountdown, 30000);
  }

  function jakartaClockMinutes() {
    const parts = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: "Asia/Jakarta",
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return (Number(values.hour) * 60) + Number(values.minute);
  }

  function prayerMinutes(timings, key) {
    const value = String(timings?.[key] || "").match(/(\d{1,2}):(\d{2})/);
    return value ? (Number(value[1]) * 60) + Number(value[2]) : null;
  }

  function updatePrayerCountdown() {
    if (!currentPrayerTimings) return;
    const prayers = [
      { key: "Fajr", label: "Subuh" },
      { key: "Dhuhr", label: "Dzuhur" },
      { key: "Asr", label: "Ashar" },
      { key: "Maghrib", label: "Maghrib" },
      { key: "Isha", label: "Isya" },
    ].map((item) => ({ ...item, minutes: prayerMinutes(currentPrayerTimings, item.key) }))
      .filter((item) => Number.isFinite(item.minutes));
    if (prayers.length !== 5) return;
    const now = jakartaClockMinutes();
    let nextIndex = prayers.findIndex((item) => item.minutes > now);
    let activeIndex = nextIndex - 1;
    let minutesRemaining;
    if (nextIndex === -1) {
      nextIndex = 0;
      activeIndex = prayers.length - 1;
      minutesRemaining = (1440 - now) + prayers[0].minutes;
    } else {
      minutesRemaining = prayers[nextIndex].minutes - now;
    }
    document.querySelectorAll(".prayer-grid > div").forEach((card) => {
      const key = card.querySelector("[data-prayer]")?.dataset.prayer;
      card.classList.toggle("is-current-prayer", activeIndex >= 0 && key === prayers[activeIndex]?.key);
      card.classList.toggle("is-next-prayer", key === prayers[nextIndex]?.key);
    });
    const activeLabel = document.querySelector("#active-prayer-label");
    const countdown = document.querySelector("#next-prayer-countdown");
    if (activeLabel) {
      activeLabel.textContent = activeIndex >= 0
        ? `Waktu ${prayers[activeIndex].label}`
        : "Menjelang Subuh";
    }
    if (countdown) {
      const hours = Math.floor(minutesRemaining / 60);
      const minutes = minutesRemaining % 60;
      const duration = hours > 0 ? `${hours} jam ${minutes} menit` : `${minutes} menit`;
      countdown.textContent = `${duration} lagi menuju ${prayers[nextIndex].label} (${String(currentPrayerTimings[prayers[nextIndex].key]).match(/\d{1,2}:\d{2}/)?.[0]} WIB).`;
    }
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
    if (name === "arabic") renderArabicAcademy();
    if (name === "khutbah") renderKhutbahCatalog();
    if (name === "tajwid") renderTajwidAcademy();
    if (name === "insights") renderDailyInsight();
    switchTrackedResource("fitur-islami", name, `Fitur Islami — ${name}`);
  }

  document.querySelectorAll("[data-islamic-view]").forEach((button) => {
    button.addEventListener("click", () => openIslamicView(button.dataset.islamicView));
  });

  let arabicVoicePromise = null;

  function resolveArabicVoice() {
    if (!("speechSynthesis" in window)) return Promise.resolve(null);
    const chooseVoice = () => {
      const voices = window.speechSynthesis.getVoices().filter((voice) => (
        /^ar(?:[-_]|$)/i.test(voice.lang) || /arab/i.test(`${voice.name} ${voice.lang}`)
      ));
      const score = (voice) => (
        (/^ar-SA$/i.test(voice.lang) ? 40 : 0)
        + (/^ar-(?:EG|AE|QA|KW)$/i.test(voice.lang) ? 25 : 0)
        + (voice.localService ? 20 : 0)
        + (/natural|premium|enhanced|neural/i.test(voice.name) ? 15 : 0)
      );
      return voices.sort((a, b) => score(b) - score(a))[0]
        || null;
    };
    const immediate = chooseVoice();
    if (immediate) return Promise.resolve(immediate);
    if (arabicVoicePromise) return arabicVoicePromise;
    arabicVoicePromise = new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        window.speechSynthesis.removeEventListener?.("voiceschanged", finish);
        resolve(chooseVoice());
      };
      window.speechSynthesis.addEventListener?.("voiceschanged", finish, { once: true });
      window.setTimeout(finish, 1800);
      window.speechSynthesis.getVoices();
    }).finally(() => {
      arabicVoicePromise = null;
    });
    return arabicVoicePromise;
  }

  function cleanArabicForSpeech(value) {
    return String(value || "")
      .replace(/[_ـ.…·•—–-]+/g, " ")
      .replace(/[^\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  async function speakArabic(text, statusElement) {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      if (statusElement) statusElement.textContent = "Audio perangkat tidak tersedia pada browser ini.";
      return;
    }
    const cleanText = cleanArabicForSpeech(text);
    if (!cleanText) {
      if (statusElement) statusElement.textContent = "Tidak ada teks Arab yang perlu dibacakan.";
      return;
    }
    if (statusElement) statusElement.textContent = "Menyiapkan suara Arab perangkat…";
    const voice = await resolveArabicVoice();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "ar-SA";
    if (voice) utterance.voice = voice;
    utterance.rate = 0.68;
    utterance.pitch = 0.92;
    utterance.volume = 1;
    utterance.onstart = () => {
      if (!statusElement) return;
      statusElement.textContent = voice
        ? `Pelafalan diputar dengan suara ${voice.name}.`
        : "Pelafalan diputar dengan suara bawaan perangkat.";
    };
    utterance.onend = () => {
      if (statusElement) statusElement.textContent = "Pemutaran selesai.";
    };
    utterance.onerror = () => {
      if (statusElement) statusElement.textContent = "Suara bahasa Arab tidak tersedia. Pasang suara Arab pada perangkat untuk memakai audio luring.";
    };
    window.speechSynthesis.speak(utterance);
    window.setTimeout(() => {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    }, 120);
  }

  function readArabicProgress() {
    const stored = safeJsonParse(localStorage.getItem(ARABIC_PROGRESS_KEY), {}) || {};
    return {
      xp: Number(stored.xp || 0),
      topics: stored.topics && typeof stored.topics === "object" ? stored.topics : {},
      completed: Array.isArray(stored.completed) ? stored.completed : [],
    };
  }

  function writeArabicProgress(progress) {
    localStorage.setItem(ARABIC_PROGRESS_KEY, JSON.stringify(progress));
  }

  function saveArabicSession() {
    if (!activeArabicSession) {
      localStorage.removeItem(ARABIC_SESSION_KEY);
      return;
    }
    const { questions, ...serializable } = activeArabicSession;
    localStorage.setItem(ARABIC_SESSION_KEY, JSON.stringify(serializable));
  }

  function clearArabicAutoAdvance() {
    if (!arabicAutoAdvanceTimer) return;
    window.clearTimeout(arabicAutoAdvanceTimer);
    arabicAutoAdvanceTimer = 0;
  }

  function currentArabicQuestion() {
    return activeArabicSession?.questions?.[activeArabicSession.index] || null;
  }

  function finishArabicTopic() {
    const player = document.querySelector("#arabic-lesson-player");
    if (!player || !activeArabicSession) return;
    clearArabicAutoAdvance();
    const { levelId, topicId, score, questions } = activeArabicSession;
    const level = arabicData.levels.find((item) => item.id === levelId);
    const topic = level?.topics.find((item) => item.id === topicId);
    const progress = readArabicProgress();
    const previous = progress.topics[topicId] || {};
    progress.topics[topicId] = {
      answered: questions.length,
      bestScore: Math.max(Number(previous.bestScore || 0), score),
      completed: true,
      attempts: Number(previous.attempts || 0) + 1,
      lastCompletedAt: new Date().toISOString(),
    };
    if (!progress.completed.includes(topicId)) {
      progress.completed.push(topicId);
      progress.xp += score * 2;
    }
    writeArabicProgress(progress);
    localStorage.removeItem(ARABIC_SESSION_KEY);
    player.innerHTML = `
      <section class="arabic-result-card">
        <span class="badge">100 soal selesai</span>
        <h5>${escapeHtml(topic?.title || "Latihan Bahasa Arab")}</h5>
        <strong>${score}/100</strong>
        <p>${score >= 85
          ? "Sangat baik. Pemahaman pada tab ini sudah kuat."
          : score >= 70
            ? "Baik. Ulangi soal yang masih keliru agar kaidah semakin mantap."
            : "Terus berlatih. Baca penjelasan setiap jawaban lalu ulangi tab ini."}</p>
        <div class="arabic-result-actions">
          <button class="cta btn-compact" type="button" data-arabic-retry>Ulangi 100 soal</button>
          <button class="btn btn-compact" type="button" data-arabic-back>Kembali ke 100 tab</button>
        </div>
      </section>`;
    player.querySelector("[data-arabic-retry]")?.addEventListener("click", () => {
      startArabicTopic(level, topic, true);
    });
    player.querySelector("[data-arabic-back]")?.addEventListener("click", () => {
      activeArabicSession = null;
      renderArabicAcademy();
      player.innerHTML = "<p>Pilih salah satu dari 100 tab untuk memulai latihan.</p>";
      document.querySelector("#arabic-learning-path")?.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
    });
    const xp = document.querySelector("#arabic-xp");
    if (xp) xp.textContent = `${progress.xp} XP`;
    renderArabicAcademy();
  }

  function advanceArabicQuestion() {
    if (!activeArabicSession || !activeArabicSession.locked) return;
    clearArabicAutoAdvance();
    activeArabicSession.index += 1;
    activeArabicSession.locked = false;
    saveArabicSession();
    if (activeArabicSession.index >= activeArabicSession.questions.length) {
      finishArabicTopic();
      return;
    }
    renderArabicQuestion();
  }

  function answerArabicQuestion(selectedIndex) {
    const player = document.querySelector("#arabic-lesson-player");
    const question = currentArabicQuestion();
    if (!player || !question || !activeArabicSession || activeArabicSession.locked) return;
    activeArabicSession.locked = true;
    const correct = selectedIndex === question.answer;
    if (correct) activeArabicSession.score += 1;
    activeArabicSession.answers.push({
      questionId: question.id,
      selectedIndex,
      correct,
    });
    const progress = readArabicProgress();
    const previousTopicProgress = progress.topics[activeArabicSession.topicId] || {};
    progress.topics[activeArabicSession.topicId] = {
      ...previousTopicProgress,
      answered: Math.max(Number(previousTopicProgress.answered || 0), activeArabicSession.index + 1),
      completed: Boolean(previousTopicProgress.completed),
      lastAccessedAt: new Date().toISOString(),
    };
    writeArabicProgress(progress);
    player.querySelectorAll("[data-arabic-answer]").forEach((button, index) => {
      button.disabled = true;
      button.classList.toggle("correct", index === question.answer);
      button.classList.toggle("wrong", index === selectedIndex && !correct);
    });
    const feedback = player.querySelector("[data-arabic-feedback]");
    if (feedback) {
      feedback.innerHTML = `<strong>${correct ? "Benar." : "Belum tepat."}</strong> ${escapeHtml(question.explanation)}`;
      feedback.className = `quiz-feedback ${correct ? "success" : "error"}`;
    }
    const nextButton = player.querySelector("[data-arabic-next-now]");
    if (nextButton) nextButton.hidden = false;
    const waitNotice = player.querySelector("[data-arabic-answer-wait]");
    if (waitNotice) waitNotice.hidden = false;
    saveArabicSession();
    arabicAutoAdvanceTimer = window.setTimeout(advanceArabicQuestion, ARABIC_AUTO_ADVANCE_DELAY);
  }

  function arabicTopicPrintableHtml(level, topic) {
    const sample = typeof arabicData.createQuestionSet === "function"
      ? arabicData.createQuestionSet(level.id, topic.id, `print-${topic.id}`).slice(0, 25)
      : [];
    return `<section class="arabic-print-document"><header><p>PAIBP SMART • AKADEMI BAHASA ARAB</p><h2>${escapeHtml(topic.title)}</h2><p>${escapeHtml(level.label)} • ${escapeHtml(topic.section)} • Tahun Ajaran 2026/2027</p></header><h3>Tujuan Praktis</h3><p>Memahami kosakata, struktur, pelafalan, membaca, menulis, dan penggunaan bahasa Arab sesuai tingkat materi.</p><h3>Latihan Pilihan</h3>${sample.map((question,index)=>`<article class="arabic-print-question"><strong>${index+1}.</strong><p class="arabic-phrase" lang="ar" dir="rtl">${escapeHtml(question.arabicPrompt||"")}</p><p>${escapeHtml(question.prompt)}</p><ol type="A">${question.options.map(option=>`<li>${escapeHtml(option)}</li>`).join("")}</ol></article>`).join("")}<h3>Catatan Belajar</h3><p>................................................................................................................................................</p><p>................................................................................................................................................</p></section>`;
  }

  function downloadArabicTopic(level, topic) {
    const holder = document.createElement("div");
    holder.innerHTML = arabicTopicPrintableHtml(level, topic);
    const blob = window.PAIBP_DOCX.createDocument({title: `${level.label} — ${topic.title}`,blocks: window.PAIBP_DOCX.blocksFromElement(holder)});
    downloadBlob(blob, `${filenameSlug(level.label)}-${filenameSlug(topic.title)}.docx`);
  }

  function renderArabicQuestion() {
    const player = document.querySelector("#arabic-lesson-player");
    const question = currentArabicQuestion();
    if (!player || !question || !activeArabicSession) return;
    const level = arabicData.levels.find((item) => item.id === activeArabicSession.levelId);
    const topic = level?.topics.find((item) => item.id === activeArabicSession.topicId);
    const progressValue = Math.round(((activeArabicSession.index + 1) / activeArabicSession.questions.length) * 100);
    player.innerHTML = `
      <div class="arabic-quiz-toolbar">
        <button class="btn btn-compact" type="button" data-arabic-exit>← Simpan dan kembali</button>
        <div class="arabic-document-actions"><button class="btn btn-compact" type="button" data-arabic-download-topic>Unduh DOCX</button><button class="btn btn-compact" type="button" data-arabic-print-topic>Simpan PDF</button></div>
        <span>${escapeHtml(level?.label || "")} • Tab ${topic?.number || ""}/100</span>
      </div>
      <div class="arabic-lesson-head">
        <span>${escapeHtml(topic?.section || "")}</span>
        <h5>${escapeHtml(topic?.title || "")}</h5>
      </div>
      <div class="arabic-quiz-status">
        <strong>Soal ${activeArabicSession.index + 1} dari 100</strong>
        <span>Benar ${activeArabicSession.score}</span>
      </div>
      <div class="arabic-quiz-progress" aria-label="Kemajuan ${progressValue}%"><span style="width:${progressValue}%"></span></div>
      <p class="arabic-phrase arabic-question-phrase" lang="ar" dir="rtl">${escapeHtml(question.arabicPrompt || "")}</p>
      <div class="arabic-audio-row">
        <button class="btn btn-compact" type="button" data-play-arabic>🔊 Putar teks Arab</button>
        <p class="save-status" data-arabic-audio-status aria-live="polite"></p>
      </div>
      <div class="arabic-practice arabic-question-card">
        <p class="arabic-question-prompt">${escapeHtml(question.prompt)}</p>
        <div class="arabic-options">
          ${question.options.map((option, index) => `<button type="button" data-arabic-answer="${index}"><span>${String.fromCharCode(65 + index)}</span>${escapeHtml(option)}</button>`).join("")}
        </div>
        <p class="quiz-feedback" data-arabic-feedback aria-live="polite"></p>
        <div class="arabic-answer-wait" data-arabic-answer-wait hidden>
          <span>Jawaban ditampilkan selama 5 detik agar sempat dibaca.</span>
          <small>Soal berikutnya berpindah otomatis.</small>
        </div>
        <button class="btn btn-compact arabic-next-now" type="button" data-arabic-next-now hidden>Lanjut sekarang →</button>
      </div>`;
    const status = player.querySelector("[data-arabic-audio-status]");
    player.querySelector("[data-play-arabic]")?.addEventListener("click", () => speakArabic(question.arabicPrompt, status));
    player.querySelector("[data-arabic-download-topic]")?.addEventListener("click", () => downloadArabicTopic(level, topic));
    player.querySelector("[data-arabic-print-topic]")?.addEventListener("click", () => printDocument(`${level?.label || "Bahasa Arab"} — ${topic?.title || "Materi"}`, arabicTopicPrintableHtml(level, topic)));
    player.querySelectorAll("[data-arabic-answer]").forEach((button) => button.addEventListener("click", () => {
      answerArabicQuestion(Number(button.dataset.arabicAnswer));
    }));
    player.querySelector("[data-arabic-next-now]")?.addEventListener("click", advanceArabicQuestion);
    player.querySelector("[data-arabic-exit]")?.addEventListener("click", () => {
      clearArabicAutoAdvance();
      if (activeArabicSession.locked) {
        activeArabicSession.index += 1;
        activeArabicSession.locked = false;
      }
      saveArabicSession();
      renderArabicAcademy();
      player.innerHTML = `<p>Progres tab <strong>${escapeHtml(topic?.title || "")}</strong> tersimpan pada soal ${Math.min(activeArabicSession.index + 1, 100)}. Klik tab yang sama untuk melanjutkan.</p>`;
    });
  }

  function startArabicTopic(level, topic, restart = false) {
    if (!level || !topic || typeof arabicData.createQuestionSet !== "function") return;
    clearArabicAutoAdvance();
    const stored = safeJsonParse(localStorage.getItem(ARABIC_SESSION_KEY), null);
    const canResume = !restart
      && stored
      && stored.levelId === level.id
      && stored.topicId === topic.id
      && Number(stored.index || 0) < 100;
    const seed = canResume ? stored.seed : `${Date.now()}-${Math.random()}`;
    const resumeIndex = canResume
      ? Math.max(0, Number(stored.index || 0) + (stored.locked ? 1 : 0))
      : 0;
    activeArabicSession = {
      levelId: level.id,
      topicId: topic.id,
      seed,
      questions: arabicData.createQuestionSet(level.id, topic.id, seed),
      index: resumeIndex,
      score: canResume ? Math.max(0, Number(stored.score || 0)) : 0,
      answers: canResume && Array.isArray(stored.answers) ? stored.answers : [],
      locked: false,
      startedAt: canResume ? stored.startedAt : new Date().toISOString(),
    };
    saveArabicSession();
    if (activeArabicSession.index >= 100) {
      finishArabicTopic();
      return;
    }
    renderArabicQuestion();
    document.querySelector("#arabic-lesson-player")?.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
    switchTrackedResource("bahasa-arab", topic.id, `${level.label}: ${topic.title}`);
  }

  const arabicQariCatalog = window.PAIBP_RECITER_CATALOG || [
    { id: "alafasy", name: "Syekh Misyari Rasyid Alafasy", edition: "ar.alafasy" },
  ];

  async function arabicQariSampleUrl(reciter) {
    if (!reciter || reciter.localOnly) return "";
    if (reciter.edition) return `https://cdn.islamic.network/quran/audio/128/${encodeURIComponent(reciter.edition)}/1.mp3`;
    return resolveMp3QuranAudio(reciter, 1);
  }

  async function cacheArabicQariSample(reciter, status) {
    if (!("caches" in window)) {
      if (status) status.textContent = "Perangkat ini belum mendukung penyimpanan audio luring.";
      return;
    }
    if (status) status.textContent = "Menyiapkan rekaman qari…";
    const url = await arabicQariSampleUrl(reciter);
    if (!url) {
      if (status) status.textContent = "Rekaman qari ini belum tersedia dari penyedia audio terbuka. Gunakan suara Arab perangkat untuk latihan non-Al Qur'an.";
      return;
    }
    try {
      const response = await fetch(url, { mode: "no-cors", cache: "no-store" });
      const cache = await caches.open(QURAN_AUDIO_CACHE_NAME);
      await cache.put(url, response.clone());
      if (status) status.textContent = "Audio tersimpan dan dapat diputar kembali saat luring pada perangkat ini.";
    } catch {
      if (status) status.textContent = "Audio belum berhasil disimpan. Coba kembali ketika koneksi stabil.";
    }
  }

  async function updateArabicQariPlayer(studio, reciter) {
    const audio = studio.querySelector("audio");
    const status = studio.querySelector("[data-arabic-qari-status]");
    if (status) status.textContent = "Menyiapkan contoh Al-Fatihah…";
    const url = await arabicQariSampleUrl(reciter);
    if (!audio) return;
    if (!url) {
      audio.removeAttribute("src");
      audio.load();
      if (status) status.textContent = "Rekaman legal untuk suara ini belum disertakan. Materi bahasa Arab tetap dapat dibaca luring dengan suara Arab perangkat.";
      return;
    }
    audio.src = url;
    audio.load();
    if (status) status.textContent = navigator.onLine ? "Siap diputar. Tekan simpan agar tersedia saat luring." : "Mode luring: audio akan berjalan bila sebelumnya sudah disimpan.";
  }

  function renderArabicQariStudio() {
    const studio = document.querySelector("#arabic-qari-studio");
    if (!studio) return;
    const selected = arabicQariCatalog.find((item) => item.id === selectedArabicQari) || arabicQariCatalog[0];
    studio.innerHTML = `
      <div class="arabic-qari-copy">
        <span class="feature-eyebrow">Studio Pelafalan dan Tilawah</span>
        <h5>Pilih Qari untuk Ayat Contoh</h5>
        <p>Ayat contoh memakai rekaman qari yang tersedia secara sah. Kosakata, percakapan, dan doa non-Al Qur'an dibacakan oleh suara Arab perangkat agar tidak dinisbatkan secara keliru kepada qari tertentu.</p>
      </div>
      <div class="arabic-qari-select-row">
        <label>Qari<select data-arabic-qari-select>${arabicQariCatalog.map((qari) => `<option value="${escapeHtml(qari.id)}" ${qari.id === selected.id ? "selected" : ""}>${escapeHtml(qari.name)}</option>`).join("")}</select></label>
        <button class="btn btn-compact" type="button" data-cache-arabic-qari>↓ Simpan Al-Fatihah luring</button>
      </div>
      <div class="arabic-qari-player">
        <div><strong>${escapeHtml(selected.name)}</strong><span>Al-Fatihah • contoh tilawah</span></div>
        <audio controls preload="none"></audio>
        <p class="save-status" data-arabic-qari-status aria-live="polite"></p>
      </div>`;
    studio.querySelector("[data-arabic-qari-select]")?.addEventListener("change", (event) => {
      selectedArabicQari = event.target.value;
      localStorage.setItem("paibp-smart-selected-qari-v20", selectedArabicQari);
      renderArabicQariStudio();
    });
    studio.querySelector("[data-cache-arabic-qari]")?.addEventListener("click", () => {
      cacheArabicQariSample(selected, studio.querySelector("[data-arabic-qari-status]"));
    });
    updateArabicQariPlayer(studio, selected);
  }

  function renderArabicSummary(path) {
    const sections = window.PAIBP_ARABIC_SUMMARY || [];
    path.innerHTML = `
      <section class="arabic-summary-sheet">
        <div class="arabic-summary-hero">
          <div><span class="feature-eyebrow">Mulai dari sini</span><h4>Ringkasan Bahasa Arab Praktis</h4><p>Peta belajar ringkas dari pemula sampai mahir: konsep inti, pola, contoh, makna, strategi penggunaan, dan audio Arab luring.</p></div>
          <div class="arabic-summary-actions no-print"><button class="cta btn-compact" type="button" data-download-arabic-summary>Unduh DOCX</button><button class="btn btn-compact" type="button" data-print-arabic-summary>Simpan PDF</button></div>
        </div>
        <div class="arabic-summary-roadmap"><span>Pemula: bunyi dan kosakata</span><span>Menengah: struktur dan i‘rab</span><span>Mahir: teks, terjemah, dan komunikasi</span></div>
        <div class="arabic-summary-grid">
          ${sections.map((item, index) => `<article class="arabic-summary-card" data-stage="${escapeHtml(item.stage)}"><header><span>${escapeHtml(item.icon)}</span><div><small>${escapeHtml(item.stage)} • Materi ${index + 1}</small><h5>${escapeHtml(item.title)}</h5></div></header><p><strong>Target:</strong> ${escapeHtml(item.goal)}</p><div class="arabic-formula"><strong>Pola inti</strong><span>${escapeHtml(item.formula)}</span></div><p class="arabic-summary-example" lang="ar" dir="rtl">${escapeHtml(item.arabic)}</p><p class="arabic-summary-meaning">${escapeHtml(item.meaning)}</p><ul>${(item.tips || []).map((tip) => `<li>${escapeHtml(tip)}</li>`).join("")}</ul><button class="btn btn-compact no-print" type="button" data-speak-arabic-summary="${index}">🔊 Lafalkan contoh</button><p class="save-status" data-summary-audio-status="${index}"></p></article>`).join("")}
        </div>
      </section>`;
    path.querySelectorAll("[data-speak-arabic-summary]").forEach((button) => button.addEventListener("click", () => {
      const item = sections[Number(button.dataset.speakArabicSummary)];
      speakArabic(item?.arabic || "", path.querySelector(`[data-summary-audio-status="${button.dataset.speakArabicSummary}"]`));
    }));
    path.querySelector("[data-download-arabic-summary]")?.addEventListener("click", () => {
      const blob = window.PAIBP_DOCX.createDocument({ title: "Ringkasan Bahasa Arab Praktis", blocks: window.PAIBP_DOCX.blocksFromElement(path.querySelector(".arabic-summary-sheet")) });
      downloadBlob(blob, "ringkasan-bahasa-arab-praktis.docx");
    });
    path.querySelector("[data-print-arabic-summary]")?.addEventListener("click", () => printDocument("Ringkasan Bahasa Arab Praktis", printableHtmlFrom(path.querySelector(".arabic-summary-sheet"))));
  }

  function renderArabicAcademy() {
    renderArabicQariStudio();
    const tabs = document.querySelector("#arabic-level-tabs");
    const path = document.querySelector("#arabic-learning-path");
    const xp = document.querySelector("#arabic-xp");
    if (!tabs || !path || !arabicData.levels.length) return;
    const progress = readArabicProgress();
    if (xp) xp.textContent = `${progress.xp} XP`;
    tabs.innerHTML = `
      <button type="button" data-arabic-level="ringkasan" aria-pressed="${arabicLevelId === "ringkasan"}"><span>🧭</span><strong>Ringkasan Praktis</strong><small>Pemula sampai mahir</small></button>
      ${arabicData.levels.map((level) => `<button type="button" data-arabic-level="${escapeHtml(level.id)}" aria-pressed="${level.id === arabicLevelId}"><span>${level.icon}</span><strong>${escapeHtml(level.label)}</strong><small>100 tab • 10.000 soal</small></button>`).join("")}`;
    tabs.querySelectorAll("[data-arabic-level]").forEach((button) => button.addEventListener("click", () => {
      arabicLevelId = button.dataset.arabicLevel;
      clearArabicAutoAdvance();
      renderArabicAcademy();
      const player = document.querySelector("#arabic-lesson-player");
      if (player) player.innerHTML = arabicLevelId === "ringkasan" ? `<p>Pilih materi ringkasan, dengarkan contoh, lalu lanjutkan ke tingkat Dasar, Menengah, atau Mahir.</p>` : `<p>Pilih salah satu dari 100 tab tingkat ${escapeHtml(arabicData.levels.find((item) => item.id === arabicLevelId)?.label || "")}. Setiap tab berisi 100 soal.</p>`;
    }));
    if (arabicLevelId === "ringkasan") {
      renderArabicSummary(path);
      return;
    }
    const level = arabicData.levels.find((item) => item.id === arabicLevelId) || arabicData.levels[0];
    const completedCount = level.topics.filter((topic) => progress.topics[topic.id]?.completed).length;
    path.innerHTML = `
      <div class="arabic-level-intro"><div><strong>${escapeHtml(level.label)} — 100 Tab Latihan</strong><p>${escapeHtml(level.description)}</p></div><div class="arabic-audience-summary" aria-label="Ringkasan tingkat"><span>${escapeHtml(level.audience)}</span><span>${completedCount}/100 selesai</span><span>100 soal per tab</span></div></div>
      <label class="arabic-topic-search">Cari dari 100 tab<input type="search" data-arabic-topic-search placeholder="Contoh: kata benda, fi‘il, jumlah ismiyah"></label>
      <div class="arabic-lesson-nodes">${level.topics.map((topic) => { const topicProgress = progress.topics[topic.id] || {}; const answered = topicProgress.completed ? 100 : Number(topicProgress.answered || 0); return `<button type="button" data-arabic-topic="${escapeHtml(topic.id)}" data-topic-search="${escapeHtml(`${topic.section} ${topic.title}`.toLocaleLowerCase("id"))}" class="${topicProgress.completed ? "is-complete" : ""}"><span>${topicProgress.completed ? "✓" : topic.number}</span><strong>${escapeHtml(topic.title)}</strong><small>${answered}/100 soal${topicProgress.bestScore !== undefined ? ` • terbaik ${topicProgress.bestScore}` : ""}</small></button>`; }).join("")}</div>`;
    path.querySelector("[data-arabic-topic-search]")?.addEventListener("input", (event) => {
      const keyword = event.target.value.trim().toLocaleLowerCase("id");
      path.querySelectorAll("[data-arabic-topic]").forEach((button) => { button.hidden = Boolean(keyword) && !button.dataset.topicSearch.includes(keyword); });
    });
    path.querySelectorAll("[data-arabic-topic]").forEach((button) => button.addEventListener("click", () => {
      const topic = level.topics.find((item) => item.id === button.dataset.arabicTopic);
      startArabicTopic(level, topic);
    }));
  }

  function stableNumber(value) {
    let hash = 2166136261;
    for (const character of String(value)) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function selectedPoolItem(pool, seed, salt = 0) {
    if (!Array.isArray(pool) || !pool.length) return "";
    return pool[stableNumber(`${seed}|${salt}`) % pool.length];
  }

  function formatLargeCount(value) {
    const number = Number(value || 0);
    if (number >= 1e12) return `${(number / 1e12).toLocaleString("id-ID", { maximumFractionDigits: 1 })} triliun+`;
    if (number >= 1e9) return `${(number / 1e9).toLocaleString("id-ID", { maximumFractionDigits: 1 })} miliar+`;
    return number.toLocaleString("id-ID");
  }

  function dailyKhutbahSeed() {
    return Math.floor(Date.now() / 86400000) + (khutbahCatalogOffset * 997);
  }

  function buildKhutbahCatalogRecord(theme, seed, index) {
    const data = islamicLearningData.khutbah;
    const titlePattern = selectedPoolItem(data.titlePatterns, seed, index + 1);
    const cleanTitle = theme.title
      .replace(/^Meneguhkan\s+/i, "")
      .replace(/^Memuliakan\s+/i, "Memuliakan ")
      .replace(/^Menjaga\s+/i, "Menjaga ");
    return {
      id: `${theme.id}-${seed}-${index}`,
      theme,
      title: String(titlePattern || "{title}").replace("{title}", cleanTitle),
      category: theme.category,
      opening: selectedPoolItem(data.openingReflections, seed, index + 31),
      bridge: selectedPoolItem(data.contextBridges, seed, index + 61),
      actionIntro: selectedPoolItem(data.actionIntros, seed, index + 91),
      closing: selectedPoolItem(data.closingReflections, seed, index + 121),
      audience: selectedPoolItem(data.audienceContexts, seed, index + 151),
      prayer: selectedPoolItem(data.secondKhutbahPrayers, seed, index + 181),
      emphasis: selectedPoolItem(data.weeklyEmphases, seed, index + 211),
      reflectionQuestion: selectedPoolItem(data.reflectionQuestions, seed, index + 241),
    };
  }

  function renderKhutbahSources() {
    const portals = document.querySelector("#khutbah-source-portals");
    const curated = document.querySelector("#khutbah-curated-list");
    if (portals) {
      portals.innerHTML = (khutbahSourceData.portals || []).map((source) => `
        <a class="khutbah-source-portal" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">
          <span class="source-publisher">${escapeHtml(source.name)}</span>
          <strong>${escapeHtml(source.label)}</strong>
          <p>${escapeHtml(source.description)}</p>
          <small>${escapeHtml(source.badge)} • buka sumber resmi ↗</small>
        </a>`).join("");
    }
    if (curated) {
      curated.innerHTML = (khutbahSourceData.curated || []).map((item, index) => `
        <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.publisher)} • ${escapeHtml(item.topic)}</small></div>
          <b aria-hidden="true">↗</b>
        </a>`).join("");
    }
  }

  function currentKhutbahCatalog() {
    const themes = islamicLearningData.khutbah.themes || [];
    if (!themes.length) return [];
    const seed = dailyKhutbahSeed();
    const offset = stableNumber(seed) % themes.length;
    return Array.from({ length: Math.min(12, themes.length) }, (_, index) => {
      const theme = themes[(offset + (index * 5)) % themes.length];
      return buildKhutbahCatalogRecord(theme, seed, index);
    });
  }

  async function openKhutbahRecord(record) {
    const reader = document.querySelector("#khutbah-reader");
    if (!reader || !record) return;
    reader.innerHTML = `<div class="khutbah-empty-state"><span>⏳</span><h5>Menyiapkan naskah lengkap</h5><p>Membuka ayat, terjemahan, referensi, dan naskah khutbah berdurasi 20–30 menit…</p></div>`;
    try {
      let surah = null;
      let verse = null;
      try {
        const surahs = await loadOfflineQuran();
        surah = surahs.find((item) => Number(item.id) === Number(record.theme.surah));
        verse = surah?.verses?.[Number(record.theme.ayah) - 1] || null;
      } catch (error) {
        // Paket ayat cadangan tertanam menjamin naskah tetap dapat dibuka.
      }
      const fallback = khutbahVerseData[`${record.theme.surah}:${record.theme.ayah}`];
      if (!verse && fallback) verse = { text: fallback.text, translation: fallback.translation };
      if (!surah && fallback) surah = { transliteration: fallback.surah };
      if (!surah || !verse) throw new Error("Ayat tidak ditemukan pada paket utama maupun paket cadangan.");

      const sourceUrl = `https://quran.kemenag.go.id/quran/per-ayat/surah/${record.theme.surah}?from=${record.theme.ayah}&to=${record.theme.ayah}`;
      const renderer = window.PAIBP_KHUTBAH_V19?.render;
      if (typeof renderer !== "function") throw new Error("Mesin naskah khutbah lengkap belum dimuat.");
      const rendered = renderer(record, surah, verse, khutbahSourceData);
      activeKhutbahRecord = { ...record, surah, verse, sourceUrl, rendered };

      reader.innerHTML = `
        <header class="khutbah-document-head">
          <span class="badge">${escapeHtml(record.category)}</span>
          <h5>${escapeHtml(record.title)}</h5>
          <p>Naskah dua khutbah profesional • estimasi ${rendered.minutes} menit • ±${Number(rendered.wordCount).toLocaleString("id-ID")} kata • siap print</p>
        </header>
        <div class="khutbah-document-body">${rendered.bodyHtml}
          <div class="khutbah-source-box">
            <strong>Referensi dan pemeriksaan naskah</strong>
            <span>Naskah merupakan susunan editorial orisinal. Ayat diperiksa melalui paket Al Qur'an luring dan Qur'an Kementerian Agama. Khatib tetap wajib memeriksa dalil, rukun khutbah, kondisi jamaah, dan kebijakan DKM setempat.</span>
            <a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">Periksa ayat pada Qur'an Kementerian Agama ↗</a>
            ${rendered.sourceLinks}
          </div>
        </div>
        <div class="khutbah-actions no-print">
          <button class="cta btn-compact" type="button" data-download-khutbah-docx>Unduh DOCX siap print</button>
          <button class="btn btn-compact" type="button" data-print-khutbah-pdf>Simpan PDF / Cetak</button>
          <button class="btn btn-compact" type="button" data-speak-khutbah-verse>🔊 Putar ayat</button>
          <p class="save-status" data-khutbah-status aria-live="polite"></p>
        </div>`;

      document.querySelectorAll("[data-khutbah-title]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.khutbahTitle === record.id)));
      const status = reader.querySelector("[data-khutbah-status]");
      reader.querySelector("[data-download-khutbah-docx]")?.addEventListener("click", () => {
        const blob = window.PAIBP_DOCX.createDocument({
          title: record.title,
          blocks: window.PAIBP_DOCX.blocksFromElement(reader.querySelector(".khutbah-document-body")),
        });
        downloadBlob(blob, `${filenameSlug(record.title)}-khutbah-jumat-lengkap.docx`);
        if (status) status.textContent = "Naskah DOCX lengkap berhasil dibuat.";
      });
      reader.querySelector("[data-print-khutbah-pdf]")?.addEventListener("click", () => {
        printDocument(record.title, printableHtmlFrom(reader));
        if (status) status.textContent = "Dialog cetak dibuka. Pilih printer atau Simpan sebagai PDF.";
      });
      reader.querySelector("[data-speak-khutbah-verse]")?.addEventListener("click", () => speakArabic(verse.text, status));
    } catch (error) {
      activeKhutbahRecord = null;
      reader.innerHTML = `<div class="khutbah-empty-state"><span>⚠️</span><h5>Naskah belum dapat dibuka</h5><p>${escapeHtml(error?.message || "Paket naskah gagal dibaca.")} Muat ulang halaman lalu coba kembali.</p></div>`;
    }
  }

  function renderKhutbahCatalog() {
    const list = document.querySelector("#khutbah-title-list");
    if (!list) return;
    const data = islamicLearningData.khutbah;
    const catalog = currentKhutbahCatalog();
    const themeCount = document.querySelector("#khutbah-theme-count");
    const variationCount = document.querySelector("#khutbah-variation-count");
    if (themeCount) themeCount.textContent = String(data.themes?.length || 0);
    if (variationCount) variationCount.textContent = formatLargeCount(data.variationCount);
    list.innerHTML = catalog.map((record, index) => `
      <button class="khutbah-title-item" type="button" role="listitem" data-khutbah-title="${escapeHtml(record.id)}" data-khutbah-search="${escapeHtml(`${record.title} ${record.category}`.toLocaleLowerCase("id"))}" aria-pressed="${record.id === activeKhutbahRecord?.id}">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <strong>${escapeHtml(record.title)}</strong>
        <small>${escapeHtml(record.category)} • Al Qur'an Surat ${record.theme.surah}:${record.theme.ayah}</small>
      </button>`).join("");
    list.querySelectorAll("[data-khutbah-title]").forEach((button) => button.addEventListener("click", () => {
      const record = catalog.find((item) => item.id === button.dataset.khutbahTitle);
      openKhutbahRecord(record);
    }));
    const search = document.querySelector("#khutbah-search");
    if (search) {
      search.value = "";
      search.oninput = () => {
        const keyword = search.value.trim().toLocaleLowerCase("id");
        list.querySelectorAll("[data-khutbah-title]").forEach((button) => {
          button.hidden = Boolean(keyword) && !button.dataset.khutbahSearch.includes(keyword);
        });
      };
    }
    renderKhutbahSources();
    if (!activeKhutbahRecord && catalog[0]) openKhutbahRecord(catalog[0]);
  }

  document.querySelector("#refresh-khutbah-catalog")?.addEventListener("click", () => {
    khutbahCatalogOffset += 1;
    activeKhutbahRecord = null;
    const reader = document.querySelector("#khutbah-reader");
    if (reader) reader.innerHTML = `<div class="khutbah-empty-state"><span>🎙️</span><h5>Pilihan judul diperbarui</h5><p>Silakan pilih salah satu judul baru pada daftar.</p></div>`;
    renderKhutbahCatalog();
  });

  function readTajwidProgress() {
    const stored = safeJsonParse(localStorage.getItem(TAJWID_PROGRESS_KEY), {}) || {};
    return { completed: Array.isArray(stored.completed) ? stored.completed : [] };
  }

  function writeTajwidProgress(progress) {
    localStorage.setItem(TAJWID_PROGRESS_KEY, JSON.stringify(progress));
  }

  function quranAudioUrlByVerseId(verseId, edition = "ar.alafasy") {
    return `https://cdn.islamic.network/quran/audio/128/${edition}/${verseId}.mp3`;
  }

  async function tajwidVerseFromReference(reference, edition = "ar.alafasy") {
    const [surahNumber, ayahNumber] = String(reference || "").split(":").map(Number);
    const surahs = await loadOfflineQuran();
    const surah = surahs.find((item) => Number(item.id) === surahNumber);
    const verse = surah?.verses?.[ayahNumber - 1];
    if (!surah || !verse) throw new Error("Ayat contoh tidak tersedia.");
    return { surah, verse, audioUrl: quranAudioUrlByVerseId(verse.id, edition) };
  }

  async function cacheTajwidAudio(reference, statusElement, announce = true, edition = "ar.alafasy") {
    const payload = await tajwidVerseFromReference(reference, edition);
    if (!("caches" in window)) throw new Error("Penyimpanan audio tidak didukung browser.");
    const cache = await caches.open(QURAN_AUDIO_CACHE_NAME);
    const existing = await cache.match(payload.audioUrl);
    if (existing) {
      if (announce && statusElement) statusElement.textContent = "Audio qari sudah tersimpan dan siap diputar luring.";
      return payload;
    }
    if (!navigator.onLine) throw new Error("Audio belum tersimpan. Sambungkan internet untuk mengunduh pertama kali.");
    const response = await fetch(payload.audioUrl, { mode: "no-cors", cache: "no-store" });
    await cache.put(payload.audioUrl, response);
    if (announce && statusElement) statusElement.textContent = "Audio qari berhasil disimpan untuk pemutaran luring.";
    return payload;
  }

  async function playTajwidAudio(lesson, statusElement, edition = "ar.alafasy") {
    if (activeTajwidAudio) {
      activeTajwidAudio.pause?.();
      activeTajwidAudio = null;
    }
    if (statusElement) statusElement.textContent = "Menyiapkan audio qari…";
    try {
      const payload = await tajwidVerseFromReference(lesson.reference, edition);
      let canPlay = navigator.onLine;
      if ("caches" in window) {
        const cache = await caches.open(QURAN_AUDIO_CACHE_NAME);
        canPlay = canPlay || Boolean(await cache.match(payload.audioUrl));
      }
      if (!canPlay) throw new Error("Rekaman belum tersimpan.");
      const audio = new Audio(payload.audioUrl);
      activeTajwidAudio = audio;
      audio.onplaying = () => {
        const reciter = (islamicLearningData.tajwid.audioReciters || []).find((item) => item.id === edition);
        if (statusElement) statusElement.textContent = `Memutar tilawah ${reciter?.name || "qari internasional"}. Dengarkan ayat lengkap dan fokuskan pada contoh yang ditandai.`;
      };
      audio.onended = () => {
        activeTajwidAudio = null;
        if (statusElement) statusElement.textContent = "Pemutaran selesai. Audio dapat disimpan agar tersedia saat luring.";
      };
      audio.onerror = () => {
        activeTajwidAudio = null;
        speakArabic(lesson.example, statusElement);
      };
      await audio.play();
    } catch {
      if (statusElement) statusElement.textContent = "Rekaman qari belum tersimpan; memakai suara Arab perangkat sebagai cadangan.";
      speakArabic(lesson.example, statusElement);
    }
  }

  function renderTajwidLesson(module, lesson) {
    const player = document.querySelector("#tajwid-player");
    if (!player || !module || !lesson) return;
    const progress = readTajwidProgress();
    const completed = progress.completed.includes(`${module.id}:${lesson.id}`);
    player.innerHTML = `
      <header class="tajwid-player-head">
        <span>${escapeHtml(lesson.badge)} • Modul ${module.number}</span>
        <h5>${escapeHtml(lesson.title)}</h5>
        <p>${escapeHtml(module.title)} — pelajari kaidah, dengarkan contoh, lalu jawab latihan.</p>
      </header>
      <div class="tajwid-rule-grid">
        <section class="tajwid-rule-card">
          <h6>Kaidah Praktis</h6>
          <p>${escapeHtml(lesson.rule)}</p>
        </section>
        <section class="tajwid-letter-card">
          <h6>Huruf atau Tanda</h6>
          <strong lang="ar" dir="rtl">${escapeHtml(lesson.letters)}</strong>
        </section>
      </div>
      <section class="tajwid-example-card">
        <p class="tajwid-example-arabic" lang="ar" dir="rtl">${escapeHtml(lesson.example)}</p>
        <p>${escapeHtml(lesson.meaning)}</p>
        <small>Contoh dalam Al Qur'an Surat ${escapeHtml(lesson.reference)}</small>
        <div class="tajwid-reciter-control no-print">
          <label>Qari internasional
            <select data-tajwid-reciter>
              ${(islamicLearningData.tajwid.audioReciters || [{ id: "ar.alafasy", name: "Mishary Rashid Alafasy" }]).map((reciter) => `<option value="${escapeHtml(reciter.id)}">${escapeHtml(reciter.name)}</option>`).join("")}
            </select>
          </label>
        </div>
        <div class="tajwid-audio-actions no-print">
          <button class="btn btn-compact" type="button" data-play-tajwid>▶ Putar audio qari</button>
          <button class="btn btn-compact" type="button" data-cache-tajwid>⇩ Simpan audio luring</button>
          <p class="save-status" data-tajwid-audio-status aria-live="polite"></p>
        </div>
      </section>
      <section class="tajwid-quiz-card">
        <h6>Latihan Cek Langsung</h6>
        <p>${escapeHtml(lesson.question)}</p>
        <div class="tajwid-options">
          ${lesson.options.map((option, index) => `<button type="button" data-tajwid-answer="${index}">${String.fromCharCode(65 + index)}. ${escapeHtml(option)}</button>`).join("")}
        </div>
        <p class="tajwid-feedback ${completed ? "success" : ""}" data-tajwid-feedback>${completed ? "Materi ini telah dikuasai. Anda tetap dapat mengulang latihannya." : ""}</p>
        <button class="btn btn-compact" type="button" data-tajwid-retry hidden>Ulangi soal</button>
      </section>`;
    const audioStatus = player.querySelector("[data-tajwid-audio-status]");
    player.querySelector("[data-play-tajwid]")?.addEventListener("click", () => {
      const edition = player.querySelector("[data-tajwid-reciter]")?.value || "ar.alafasy";
      playTajwidAudio(lesson, audioStatus, edition);
    });
    player.querySelector("[data-cache-tajwid]")?.addEventListener("click", async () => {
      if (audioStatus) audioStatus.textContent = "Mengunduh audio qari…";
      try {
        const edition = player.querySelector("[data-tajwid-reciter]")?.value || "ar.alafasy";
        await cacheTajwidAudio(lesson.reference, audioStatus, true, edition);
      } catch (error) {
        if (audioStatus) audioStatus.textContent = error.message || "Audio belum dapat disimpan.";
      }
    });
    const answerButtons = [...player.querySelectorAll("[data-tajwid-answer]")];
    const feedback = player.querySelector("[data-tajwid-feedback]");
    const retry = player.querySelector("[data-tajwid-retry]");
    const resetQuiz = () => {
      answerButtons.forEach((button) => {
        button.disabled = false;
        button.classList.remove("correct", "wrong");
      });
      if (feedback) {
        feedback.textContent = "";
        feedback.className = "tajwid-feedback";
      }
      if (retry) retry.hidden = true;
    };
    answerButtons.forEach((button) => button.addEventListener("click", () => {
      const selected = Number(button.dataset.tajwidAnswer);
      const correct = selected === lesson.answer;
      answerButtons.forEach((item, index) => {
        item.disabled = true;
        item.classList.toggle("correct", index === lesson.answer);
        item.classList.toggle("wrong", index === selected && !correct);
      });
      if (feedback) {
        feedback.textContent = `${correct ? "Benar." : "Belum tepat."} ${lesson.explanation}`;
        feedback.className = `tajwid-feedback ${correct ? "success" : "error"}`;
      }
      if (correct) {
        const latest = readTajwidProgress();
        const key = `${module.id}:${lesson.id}`;
        if (!latest.completed.includes(key)) latest.completed.push(key);
        writeTajwidProgress(latest);
        window.setTimeout(() => renderTajwidAcademy(false), 850);
      } else if (retry) {
        retry.hidden = false;
      }
    }));
    retry?.addEventListener("click", resetQuiz);
  }

  async function cacheTajwidModule(module, statusElement) {
    if (!module?.lessons?.length) return;
    let saved = 0;
    const uniqueReferences = [...new Set(module.lessons.map((lesson) => lesson.reference))];
    for (const reference of uniqueReferences) {
      try {
        await cacheTajwidAudio(reference, null, false);
        saved += 1;
        if (statusElement) statusElement.textContent = `Menyimpan ${saved} dari ${uniqueReferences.length} audio modul…`;
      } catch (error) {
        if (statusElement) statusElement.textContent = `${saved} audio tersimpan. ${error.message || "Sebagian audio gagal disimpan."}`;
        return;
      }
    }
    if (statusElement) statusElement.textContent = `${saved} audio contoh berhasil disimpan untuk modul ${module.title}.`;
  }

  function renderTajwidAcademy(preservePlayer = true) {
    const tabs = document.querySelector("#tajwid-module-tabs");
    const path = document.querySelector("#tajwid-lesson-path");
    const progressLabel = document.querySelector("#tajwid-progress-count");
    const modules = islamicLearningData.tajwid.modules || [];
    if (!tabs || !path || !modules.length) return;
    const progress = readTajwidProgress();
    const totalLessons = Number(islamicLearningData.tajwid.totalLessons || modules.reduce((sum, item) => sum + item.lessons.length, 0));
    if (progressLabel) progressLabel.textContent = `${progress.completed.length}/${totalLessons}`;
    const module = modules.find((item) => item.id === tajwidModuleId) || modules[0];
    tajwidModuleId = module.id;
    if (!module.lessons.some((item) => item.id === tajwidLessonId)) tajwidLessonId = module.lessons[0]?.id || "";
    tabs.innerHTML = modules.map((item) => `
      <button type="button" data-tajwid-module="${escapeHtml(item.id)}" aria-pressed="${item.id === module.id}" style="--tajwid-color:${escapeHtml(item.color)}">
        <span>${escapeHtml(item.icon)}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <small>${item.lessons.length} materi</small>
      </button>`).join("");
    path.innerHTML = `
      <div class="tajwid-path-head">
        <strong>${escapeHtml(module.title)}</strong>
        <small>${escapeHtml(module.subtitle)}</small>
      </div>
      ${module.lessons.map((lesson, index) => {
        const complete = progress.completed.includes(`${module.id}:${lesson.id}`);
        return `
        <button class="tajwid-lesson-node ${complete ? "is-complete" : ""}" type="button" data-tajwid-lesson="${escapeHtml(lesson.id)}" aria-pressed="${lesson.id === tajwidLessonId}">
          <span>${complete ? "✓" : index + 1}</span>
          <strong>${escapeHtml(lesson.title)}</strong>
          <small>${escapeHtml(lesson.badge)}</small>
        </button>`;
      }).join("")}
      <button class="tajwid-lesson-node" type="button" data-cache-tajwid-module>
        <span>⇩</span><strong>Simpan audio modul</strong><small>untuk akses luring</small>
      </button>
      <p class="save-status" data-tajwid-module-status aria-live="polite"></p>`;
    tabs.querySelectorAll("[data-tajwid-module]").forEach((button) => button.addEventListener("click", () => {
      tajwidModuleId = button.dataset.tajwidModule;
      const selected = modules.find((item) => item.id === tajwidModuleId);
      tajwidLessonId = selected?.lessons?.[0]?.id || "";
      renderTajwidAcademy(false);
    }));
    path.querySelectorAll("[data-tajwid-lesson]").forEach((button) => button.addEventListener("click", () => {
      tajwidLessonId = button.dataset.tajwidLesson;
      renderTajwidAcademy(false);
    }));
    const moduleStatus = path.querySelector("[data-tajwid-module-status]");
    path.querySelector("[data-cache-tajwid-module]")?.addEventListener("click", () => cacheTajwidModule(module, moduleStatus));
    const lesson = module.lessons.find((item) => item.id === tajwidLessonId) || module.lessons[0];
    if (!preservePlayer || document.querySelector("#tajwid-player .khutbah-empty-state")) renderTajwidLesson(module, lesson);
    else renderTajwidLesson(module, lesson);
  }

  function renderDuaList(selector, category) {
    const container = document.querySelector(selector);
    if (!container) return;
    const allItems = islamicData.dua.filter((item) => item.categories.includes(category)).map((item) => ({ ...item, arabic: category === "petang" && item.eveningArabic ? item.eveningArabic : item.arabic }));
    const isHisnul = category === "hisnul";
    const searchInput = isHisnul ? document.querySelector("#hisnul-search") : null;
    const groupSelect = isHisnul ? document.querySelector("#hisnul-group-filter") : null;
    const countLabel = isHisnul ? document.querySelector("#hisnul-count") : null;
    const variationLabel = isHisnul ? document.querySelector("#hisnul-variation-count") : null;
    const toolbar = document.querySelector(`[data-adhkar-toolbar="${category}"]`);
    let visibleItems = allItems;

    if (isHisnul && groupSelect && !groupSelect.dataset.ready) {
      const groups = [...new Set(allItems.map((item) => item.group || "Doa harian"))].sort((a, b) => a.localeCompare(b, "id"));
      groupSelect.innerHTML = `<option value="all">Semua kategori</option>${groups.map((group) => `<option value="${escapeHtml(group)}">${escapeHtml(group)}</option>`).join("")}`;
      groupSelect.dataset.ready = "true";
    }
    if (isHisnul && variationLabel) variationLabel.textContent = formatLargeCount(window.PAIBP_DUA_VARIATION_COUNT || 1e12);

    const populateArabicVoices = () => {
      if (!toolbar || !("speechSynthesis" in window)) return;
      const select = toolbar.querySelector("[data-adhkar-voice]");
      if (!select) return;
      const previous = select.value;
      const voices = window.speechSynthesis.getVoices().filter((voice) => /^ar(?:-|$)/i.test(voice.lang));
      select.innerHTML = `<option value="">Otomatis memilih suara Arab terbaik</option>${voices.map((voice) => `<option value="${escapeHtml(voice.name)}">${escapeHtml(voice.name)}${voice.localService ? " • luring" : ""}</option>`).join("")}`;
      if ([...select.options].some((option) => option.value === previous)) select.value = previous;
    };
    populateArabicVoices();
    window.speechSynthesis?.addEventListener?.("voiceschanged", populateArabicVoices, { once: true });

    const draw = () => {
      const keyword = String(searchInput?.value || "").trim().toLocaleLowerCase("id");
      const selectedGroup = String(groupSelect?.value || "all");
      visibleItems = allItems.filter((item) => {
        const matchesGroup = selectedGroup === "all" || (item.group || "Doa harian") === selectedGroup;
        const haystack = `${item.title} ${item.meaning} ${item.source} ${item.group || ""}`.toLocaleLowerCase("id");
        return matchesGroup && (!keyword || haystack.includes(keyword));
      });
      if (countLabel) countLabel.textContent = `${visibleItems.length}/${allItems.length}`;
      container.innerHTML = visibleItems.length ? visibleItems.map((item, index) => `
        <article class="dua-card">
          <div class="dua-card-head"><span>${index + 1}</span><div><h5>${escapeHtml(item.title)}</h5><small>${escapeHtml(item.group || "Dzikir bersumber")}</small></div><strong class="dua-repetition">${escapeHtml(item.repetition)}</strong></div>
          <p class="arabic-text" lang="ar" dir="rtl">${escapeHtml(item.arabic)}</p>
          <p>${escapeHtml(item.meaning)}</p><p class="dua-source">${escapeHtml(item.source)}</p>
          <div class="dua-actions no-print"><button class="btn btn-compact" type="button" data-speak-dua="${escapeHtml(item.id)}">🔊 Putar audio Arab luring</button>${item.url ? `<a class="btn btn-compact" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">Periksa sumber ↗</a>` : ""}<span class="audio-note" data-dua-status="${escapeHtml(item.id)}">Bacaan memakai suara Arab perangkat, bukan tiruan suara qari.</span></div>
        </article>`).join("") : `<div class="khutbah-empty-state"><span>🔎</span><h5>Doa tidak ditemukan</h5><p>Ubah kata pencarian atau pilih kategori lain.</p></div>`;
      container.querySelectorAll("[data-speak-dua]").forEach((button) => button.addEventListener("click", () => {
        const item = allItems.find((entry) => entry.id === button.dataset.speakDua);
        const status = container.querySelector(`[data-dua-status="${button.dataset.speakDua}"]`);
        if (item && status) speakArabic(item.arabic, status);
      }));
    };

    if (toolbar && !toolbar.dataset.bound) {
      toolbar.querySelector("[data-play-adhkar-all]")?.addEventListener("click", async () => {
        if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return;
        const status = toolbar.querySelector("[data-adhkar-status]");
        const preferredName = toolbar.querySelector("[data-adhkar-voice]")?.value || "";
        const voice = window.speechSynthesis.getVoices().find((item) => item.name === preferredName) || await resolveArabicVoice();
        window.speechSynthesis.cancel();
        let index = 0;
        const next = () => {
          if (index >= visibleItems.length) { if (status) status.textContent = "Seluruh bacaan selesai."; return; }
          const item = visibleItems[index++];
          const utterance = new SpeechSynthesisUtterance(cleanArabicForSpeech(item.arabic));
          utterance.lang = "ar-SA"; if (voice) utterance.voice = voice; utterance.rate = .64; utterance.pitch = .94;
          utterance.onstart = () => { if (status) status.textContent = `Bacaan ${index} dari ${visibleItems.length}: ${item.title}`; };
          utterance.onend = () => window.setTimeout(next, 500);
          utterance.onerror = () => { if (status) status.textContent = "Pemutaran terhenti. Pastikan suara Arab luring telah terpasang."; };
          window.speechSynthesis.speak(utterance);
        };
        next();
      });
      toolbar.querySelector("[data-stop-adhkar]")?.addEventListener("click", () => { window.speechSynthesis?.cancel(); const status = toolbar.querySelector("[data-adhkar-status]"); if (status) status.textContent = "Pemutaran dihentikan."; });
      toolbar.dataset.bound = "true";
    }
    if (isHisnul && !container.dataset.filtersBound) {
      searchInput?.addEventListener("input", draw); groupSelect?.addEventListener("change", draw);
      document.querySelector("#download-hisnul-docx")?.addEventListener("click", () => { const selected = [...container.querySelectorAll(".dua-card")]; const blob = window.PAIBP_DOCX.createDocument({ title: "Hisnul Muslim dan Doa Harian Bersumber", blocks: selected.flatMap((card) => window.PAIBP_DOCX.blocksFromElement(card)) }); downloadBlob(blob, "hisnul-muslim-doa-harian-bersumber.docx"); });
      document.querySelector("#print-hisnul-pdf")?.addEventListener("click", () => printDocument("Hisnul Muslim dan Doa Harian Bersumber", printableHtmlFrom(container)));
      container.dataset.filtersBound = "true";
    }
    draw();
  }

  function normalizeSurahName(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("id")
      .replace(/[^a-z0-9]/g, "");
  }

  async function loadOfflineQuran() {
    if (offlineQuranPromise) return offlineQuranPromise;
    offlineQuranPromise = fetch("./assets/data/quran-id.json", { cache: "force-cache" })
      .then((response) => {
        if (!response.ok) throw new Error("Paket Al Qur'an luring tidak dapat dibaca.");
        return response.json();
      })
      .then((items) => {
        if (!Array.isArray(items) || items.length !== 114) throw new Error("Paket Al Qur'an luring tidak lengkap.");
        return items;
      })
      .catch((error) => {
        offlineQuranPromise = null;
        throw error;
      });
    return offlineQuranPromise;
  }

  function findOfflineSurah(items, requestedName) {
    const aliases = {
      almujadilah: "almujadila",
      alhasyr: "alhashr",
      attaubah: "attawbah",
      alkautsar: "alkawthar",
      alanbiya: "alanbya",
    };
    const requested = normalizeSurahName(requestedName);
    const target = aliases[requested] || requested;
    return items.find((item) => normalizeSurahName(item.transliteration) === target);
  }

  function offlineVerseHtml(surah, verse, verseNumber, highlighted = false) {
    return `
      <article class="offline-ayah-card ${highlighted ? "is-highlighted" : ""}" data-offline-ayah="${verseNumber}">
        <div class="offline-ayah-meta">
          <span>${surah.id}:${verseNumber}</span>
          <button class="btn btn-compact" type="button" data-speak-offline-ayah="${verseNumber}">🔊 Putar bacaan luring</button>
        </div>
        <p class="arabic-text" lang="ar" dir="rtl">${escapeHtml(verse.text)}</p>
        <p class="offline-ayah-translation">${escapeHtml(verse.translation || "Terjemahan belum tersedia.")}</p>
        <p class="audio-note" data-offline-audio-status="${verseNumber}">Audio memakai suara Arab perangkat dan dapat diputar tanpa internet bila paket suara Arab telah terpasang.</p>
      </article>`;
  }

  function attachOfflineVerseAudio(container, surah) {
    container.querySelectorAll("[data-speak-offline-ayah]").forEach((button) => {
      button.addEventListener("click", () => {
        const verseNumber = Number(button.dataset.speakOfflineAyah);
        const verse = surah.verses[verseNumber - 1];
        const status = container.querySelector(`[data-offline-audio-status="${verseNumber}"]`);
        if (verse && status) speakArabic(verse.text, status);
      });
    });
  }

  function renderOfflineDalil({ fullSurah = false } = {}) {
    const content = document.querySelector("#dalil-reader-content");
    const title = document.querySelector("#dalil-reader-title");
    const status = document.querySelector("#dalil-reader-status");
    const fullButton = document.querySelector("#dalil-read-full-surah");
    if (!content || !activeOfflineSurah || !activeOfflineReference) return;
    const surah = activeOfflineSurah;
    const reference = activeOfflineReference;
    const verseEntries = fullSurah
      ? surah.verses.map((verse, index) => ({ verse, verseNumber: index + 1 }))
      : surah.verses
        .map((verse, index) => ({ verse, verseNumber: index + 1 }))
        .filter(({ verseNumber }) => verseNumber >= reference.start && verseNumber <= reference.end);
    title.textContent = fullSurah
      ? `Al Qur'an Surat ${surah.transliteration} — ${surah.total_verses} ayat`
      : reference.label;
    status.textContent = fullSurah
      ? "Seluruh surat dimuat dari paket luring di dalam situs."
      : "Ayat dan terjemahan dimuat langsung dari paket luring di dalam situs.";
    content.innerHTML = `
      <section class="offline-surah-heading">
        <span>Surat ${surah.id} • ${escapeHtml(surah.type === "meccan" ? "Makkiyah" : "Madaniyah")}</span>
        <strong lang="ar" dir="rtl">${escapeHtml(surah.name)}</strong>
        <p>${escapeHtml(surah.transliteration)} • ${escapeHtml(surah.translation)}</p>
      </section>
      <div class="offline-ayah-list">
        ${verseEntries.map(({ verse, verseNumber }) => offlineVerseHtml(
          surah,
          verse,
          verseNumber,
          verseNumber >= reference.start && verseNumber <= reference.end,
        )).join("")}
      </div>
      <p class="quran-data-attribution">Teks Utsmani dan terjemahan Bahasa Indonesia tersedia luring. Sumber data:
        <a href="https://www.npmjs.com/package/quran-json" target="_blank" rel="noopener">quran-json 3.1.2</a>;
        terjemahan Kementerian Agama Republik Indonesia melalui The Noble Qur'an Encyclopedia; lisensi CC BY-SA 4.0.</p>`;
    attachOfflineVerseAudio(content, surah);
    if (fullButton) {
      fullButton.hidden = fullSurah;
      fullButton.disabled = fullSurah;
    }
    if (fullSurah) {
      window.setTimeout(() => content.querySelector(`[data-offline-ayah="${reference.start}"]`)?.scrollIntoView({
        behavior: reduceMotion.matches ? "auto" : "smooth",
        block: "center",
      }), 50);
    }
  }

  async function openOfflineDalil(label) {
    const reference = parseQuranReference(label);
    const modal = document.querySelector("#dalil-reader-modal");
    const content = document.querySelector("#dalil-reader-content");
    const status = document.querySelector("#dalil-reader-status");
    const title = document.querySelector("#dalil-reader-title");
    if (!reference || !modal || !content || !status || !title) return;
    activeOfflineHadith = null;
    activeOfflineReference = reference;
    activeOfflineSurah = null;
    modal.hidden = false;
    document.body.classList.add("has-modal");
    title.textContent = reference.label;
    status.textContent = "Menyiapkan ayat dari paket luring…";
    content.innerHTML = '<div class="dalil-loading"><span>📖</span><p>Membuka Al Qur\'an Surat dan ayat…</p></div>';
    try {
      const items = await loadOfflineQuran();
      const surah = findOfflineSurah(items, reference.surahName);
      if (!surah) throw new Error("Nama surat tidak ditemukan dalam paket luring.");
      const start = Math.max(1, reference.start);
      const end = Math.min(Number(surah.total_verses || surah.verses.length), reference.end);
      if (start > end) throw new Error("Nomor ayat tidak tersedia pada surat ini.");
      activeOfflineReference = { ...reference, start, end };
      activeOfflineSurah = surah;
      renderOfflineDalil();
    } catch (error) {
      status.textContent = "Pembaca dalil belum dapat dibuka.";
      content.innerHTML = `<div class="warning"><strong>Terjadi kendala:</strong> ${escapeHtml(error.message || "Paket luring tidak dapat dibaca.")}</div>`;
    }
  }

  function renderOfflineHadith(record) {
    const content = document.querySelector("#dalil-reader-content");
    const title = document.querySelector("#dalil-reader-title");
    const status = document.querySelector("#dalil-reader-status");
    const fullButton = document.querySelector("#dalil-read-full-surah");
    if (!content || !title || !status || !record) return;
    title.textContent = record.source;
    status.textContent = "Teks Arab, makna Bahasa Indonesia, dan keterangan dimuat dari paket luring di dalam situs.";
    content.innerHTML = `
      <article class="offline-hadith-card">
        <span class="badge">Hadits Riwayat</span>
        <h3>${escapeHtml(record.title)}</h3>
        <p class="arabic-text" lang="ar" dir="rtl">${escapeHtml(record.arabic)}</p>
        <h4>Makna ringkas</h4>
        <p class="offline-ayah-translation">${escapeHtml(record.meaning)}</p>
        <h4>Keterangan belajar</h4>
        <p>${escapeHtml(record.note)}</p>
        <div class="offline-hadith-actions no-print">
          <button class="btn btn-compact" type="button" data-speak-offline-hadith>🔊 Putar bacaan luring</button>
          <a class="btn btn-compact" href="${escapeHtml(record.url)}" target="_blank" rel="noopener">Periksa sumber ↗</a>
        </div>
        <p class="audio-note" data-offline-hadith-status>Audio memakai suara Arab perangkat. Setelah paket suara Arab dipasang pada ponsel, fitur ini dapat dipakai tanpa internet.</p>
      </article>`;
    const audioStatus = content.querySelector("[data-offline-hadith-status]");
    content.querySelector("[data-speak-offline-hadith]")?.addEventListener("click", () => {
      speakArabic(record.arabic, audioStatus);
    });
    if (fullButton) {
      fullButton.hidden = true;
      fullButton.disabled = true;
    }
  }

  function openOfflineHadith(labelOrId) {
    const record = findHadithRecord(labelOrId);
    const modal = document.querySelector("#dalil-reader-modal");
    const content = document.querySelector("#dalil-reader-content");
    const status = document.querySelector("#dalil-reader-status");
    const title = document.querySelector("#dalil-reader-title");
    if (!record || !modal || !content || !status || !title) return;
    activeOfflineReference = null;
    activeOfflineSurah = null;
    activeOfflineHadith = record;
    modal.hidden = false;
    document.body.classList.add("has-modal");
    renderOfflineHadith(record);
  }

  function closeOfflineDalil() {
    const modal = document.querySelector("#dalil-reader-modal");
    if (!modal) return;
    modal.hidden = true;
    if (document.querySelector("#teacher-auth")?.hidden !== false) document.body.classList.remove("has-modal");
  }

  document.querySelectorAll("[data-close-dalil-reader]").forEach((button) => {
    button.addEventListener("click", closeOfflineDalil);
  });
  document.querySelector("#dalil-read-full-surah")?.addEventListener("click", () => {
    if (activeOfflineSurah && activeOfflineReference && !activeOfflineHadith) renderOfflineDalil({ fullSurah: true });
  });
  document.addEventListener("click", (event) => {
    const quranButton = event.target.closest?.("[data-open-dalil]");
    if (quranButton) {
      event.preventDefault();
      openOfflineDalil(quranButton.dataset.openDalil);
      return;
    }
    const hadithButton = event.target.closest?.("[data-open-hadith]");
    if (hadithButton) {
      event.preventDefault();
      openOfflineHadith(hadithButton.dataset.openHadith);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.querySelector("#dalil-reader-modal")?.hidden === false) closeOfflineDalil();
  });

  async function getCachedQuranResponse(request) {
    if (!("caches" in window)) return null;
    const cache = await caches.open(QURAN_CACHE_NAME);
    return cache.match(request);
  }

  async function offlineQuranSurahPayload(surahNumber) {
    const items = await loadOfflineQuran();
    const surah = items.find((item) => Number(item.id) === Number(surahNumber));
    if (!surah) throw new Error("Surat tidak tersedia dalam paket luring.");
    return {
      offlineBundle: true,
      data: [
        {
          number: surah.id,
          name: surah.name,
          englishName: surah.transliteration,
          revelationType: surah.type === "meccan" ? "Makkiyah" : "Madaniyah",
          numberOfAyahs: surah.total_verses,
          edition: { identifier: "quran-uthmani" },
          ayahs: surah.verses.map((verse, index) => ({ text: verse.text, numberInSurah: index + 1 })),
        },
        {
          number: surah.id,
          edition: { identifier: "id.indonesian" },
          ayahs: surah.verses.map((verse, index) => ({ text: verse.translation, numberInSurah: index + 1 })),
        },
      ],
    };
  }

  const quranReciterCatalog = window.PAIBP_RECITER_CATALOG || [{ id: "alafasy", name: "Syekh Misyari Rasyid Alafasy", edition: "ar.alafasy" }];
  let selectedQuranReciterId = localStorage.getItem("paibp-smart-quran-reciter-v20") || quranReciterCatalog[0].id;
  let mp3QuranCatalogPromise = null;

  function normalizeReciterName(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f\u064b-\u065f]/g, "").toLocaleLowerCase("en").replace(/[^a-z0-9\u0600-\u06ff]/g, "");
  }
  function selectedQuranReciter() { return quranReciterCatalog.find((item) => item.id === selectedQuranReciterId) || quranReciterCatalog[0]; }
  async function loadMp3QuranCatalog() {
    const stored = safeJsonParse(localStorage.getItem("paibp-smart-mp3quran-catalog-v20"), null);
    if (!navigator.onLine && stored?.reciters) return stored;
    if (mp3QuranCatalogPromise) return mp3QuranCatalogPromise;
    mp3QuranCatalogPromise = fetch("https://www.mp3quran.net/api/v3/reciters?language=ar", { mode: "cors" }).then((response) => { if (!response.ok) throw new Error("Katalog qari tidak tersedia"); return response.json(); }).then((data) => { localStorage.setItem("paibp-smart-mp3quran-catalog-v20", JSON.stringify(data)); return data; }).catch(() => stored || { reciters: [] }).finally(() => { mp3QuranCatalogPromise = null; });
    return mp3QuranCatalogPromise;
  }
  async function resolveMp3QuranAudio(reciter, surahNumber) {
    if (!reciter || reciter.localOnly) return "";
    const data = await loadMp3QuranCatalog();
    const aliases = [reciter.name, ...(reciter.aliases || [])].map(normalizeReciterName).filter(Boolean);
    const found = (data.reciters || []).find((entry) => { const name = normalizeReciterName(entry.name); return aliases.some((alias) => name.includes(alias) || alias.includes(name)); });
    if (!found) return "";
    const moshaf = (found.moshaf || []).find((item) => String(item.surah_list || "").split(",").map(Number).includes(Number(surahNumber))) || found.moshaf?.[0];
    if (!moshaf?.server) return "";
    return `${moshaf.server}${String(surahNumber).padStart(3, "0")}.mp3`;
  }
  function renderQuranReciterOptions() {
    const select = document.querySelector("#quran-reciter-select");
    if (!select) return;
    select.innerHTML = quranReciterCatalog.map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === selectedQuranReciterId ? "selected" : ""}>${escapeHtml(item.name)}${item.localOnly ? " • audio lokal belum disertakan" : ""}</option>`).join("");
  }

  function tajwidColorize(value) {
    let text = String(value || "");
    const tokens = [];
    const protect = (regex, cls, label) => { text = text.replace(regex, (match) => { const key = `\uE000${tokens.length}\uE001`; tokens.push(`<span class="tajwid-token ${cls}" title="${label}">${escapeHtml(match)}</span>`); return key; }); };
    protect(/[نم]ّ/g, "tajwid-ghunnah", "Ghunnah");
    protect(/[قطبجد]ْ/g, "tajwid-qalqalah", "Qalqalah");
    protect(/[نًٌٍْ]\s*ب/g, "tajwid-iqlab", "Iqlab");
    protect(/[نًٌٍْ]\s*[ينمو]/g, "tajwid-idgham", "Idgham bighunnah");
    protect(/[نًٌٍْ]\s*[لر]/g, "tajwid-idgham", "Idgham bila ghunnah");
    protect(/[نًٌٍْ]\s*[تثجدذزسشصضطظفقك]/g, "tajwid-ikhfa", "Ikhfa haqiqi");
    protect(/[نًٌٍْ]\s*[ءهعحغخ]/g, "tajwid-izhar", "Izhar halqi");
    protect(/مْ\s*ب/g, "tajwid-ikhfa", "Ikhfa syafawi");
    protect(/مْ\s*م/g, "tajwid-idgham", "Idgham mimi");
    protect(/ال[تثدذرزسشصضطظلن]/g, "tajwid-lam", "Alif lam syamsiyah");
    protect(/ال[ابغحجكوخفعقيمه]/g, "tajwid-lam", "Alif lam qamariyah");
    protect(/ر[َُّ]/g, "tajwid-ra", "Ra tafkhim");
    protect(/رِ/g, "tajwid-ra-thin", "Ra tarqiq");
    protect(/[َ]ا|[ُ]و|[ِ]ي|[َ]ى/g, "tajwid-mad", "Mad");
    protect(/[ۘۙۚۛۜۗۖ]/g, "tajwid-waqf", "Tanda waqaf");
    let output = escapeHtml(text);
    tokens.forEach((html, index) => { output = output.replace(`\uE000${index}\uE001`, html); });
    return output;
  }
  function quranVerseAnnotations(surah, ayah) {
    const key = `${surah}:${ayah}`; const badges = [];
    if (window.PAIBP_SAJDAH_VERSES?.[key]) badges.push(`<span class="ayah-special-badge sajdah-badge">۩ Ayat sajdah</span>`);
    const gharib = window.PAIBP_GHARIB_VERSES?.[key];
    if (gharib) badges.push(`<span class="ayah-special-badge gharib-badge" title="${escapeHtml(gharib.note)}">${escapeHtml(gharib.label)} • ${escapeHtml(gharib.note)}</span>`);
    return badges.join("");
  }

  async function fetchQuranSurah(surahNumber) {
    const reciter = selectedQuranReciter();
    const editions = ["quran-uthmani", "id.indonesian"];
    if (reciter.edition) editions.push(reciter.edition);
    const request = new Request(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/${editions.join(",")}`, { mode: "cors" });
    const cached = await getCachedQuranResponse(request);
    if (!navigator.onLine) return cached ? cached.json() : offlineQuranSurahPayload(surahNumber);
    try { const response = await fetch(request); if (!response.ok) throw new Error("Surat tidak dapat dimuat"); if ("caches" in window) { const cache = await caches.open(QURAN_CACHE_NAME); await cache.put(request, response.clone()); } return response.json(); }
    catch { if (cached) return cached.json(); return offlineQuranSurahPayload(surahNumber); }
  }

  async function renderQuran(payload) {
    const reader = document.querySelector("#quran-reader"); const status = document.querySelector("#quran-status");
    const editions = Array.isArray(payload?.data) ? payload.data : []; const arabic = editions.find((item) => item.edition?.identifier === "quran-uthmani"); const translation = editions.find((item) => item.edition?.identifier === "id.indonesian");
    const reciter = selectedQuranReciter(); const audio = reciter.edition ? editions.find((item) => item.edition?.identifier === reciter.edition) : null;
    if (!arabic?.ayahs?.length) throw new Error("Teks surat tidak tersedia");
    const surahAudioUrl = audio?.ayahs?.length ? "" : await resolveMp3QuranAudio(reciter, arabic.number);
    currentQuranPayload = { arabic, translation, audio, surahAudioUrl, reciter };
    reader.innerHTML = `<header class="quran-surah-head"><span>Surat ${arabic.number} • ${escapeHtml(arabic.revelationType || "")}</span><h5>${escapeHtml(arabic.englishName || "")}</h5><strong lang="ar" dir="rtl">${escapeHtml(arabic.name || "")}</strong><p>${arabic.numberOfAyahs} ayat</p><div class="quran-surah-audio">${surahAudioUrl ? `<audio controls preload="none" src="${escapeHtml(surahAudioUrl)}"></audio><small>Tilawah surat lengkap: ${escapeHtml(reciter.name)}</small>` : audio?.ayahs?.length ? `<small>Audio per ayat: ${escapeHtml(reciter.name)}</small>` : `<small>Rekaman ${escapeHtml(reciter.name)} belum tersedia dari penyedia audio terbuka. Teks dan tajwid tetap dapat digunakan luring.</small>`}</div></header><div class="ayah-list">${arabic.ayahs.map((ayah,index)=>{ const translated=translation?.ayahs?.[index]?.text||"Terjemahan belum tersedia."; const audioUrl=audio?.ayahs?.[index]?.audio||""; return `<article class="ayah-card"><div class="ayah-card-top"><div class="ayah-number">${arabic.number}:${ayah.numberInSurah}</div><div class="ayah-special-badges">${quranVerseAnnotations(arabic.number, ayah.numberInSurah)}</div></div><p class="arabic-text quran-tajwid-text" lang="ar" dir="rtl">${tajwidColorize(ayah.text)}</p><p>${escapeHtml(translated)}</p>${audioUrl?`<audio controls preload="none" src="${escapeHtml(audioUrl)}">Browser tidak mendukung audio.</audio>`:""}</article>`;}).join("")}</div>`;
    status.textContent = payload.offlineBundle ? `Surat ${arabic.englishName} dimuat dari paket Al Qur'an luring. Pilihan qari dapat diputar luring setelah audionya disimpan.` : navigator.onLine ? `Surat ${arabic.englishName} berhasil dimuat. Warna tajwid adalah panduan visual; talaqqi kepada guru tetap utama.` : `Mode luring: Surat ${arabic.englishName} dibuka dari penyimpanan perangkat.`;
  }

  async function loadQuranSurah(surahNumber) { const status=document.querySelector("#quran-status"), reader=document.querySelector("#quran-reader"); status.textContent=`Memuat Surat nomor ${surahNumber}…`; reader.innerHTML=""; try { const payload=await fetchQuranSurah(surahNumber); await renderQuran(payload); } catch { currentQuranPayload=null; status.textContent="Surat belum dapat dimuat. Teks luring tetap tersedia bila paket data sudah terpasang."; } }
  renderQuranReciterOptions();
  document.querySelector("#quran-reciter-select")?.addEventListener("change", (event) => { selectedQuranReciterId=event.target.value; localStorage.setItem("paibp-smart-quran-reciter-v20",selectedQuranReciterId); const number=Number(document.querySelector("#quran-surah-number")?.value||1); loadQuranSurah(number); });
  document.querySelector("#quran-form")?.addEventListener("submit", (event) => { event.preventDefault(); const input=document.querySelector("#quran-surah-number"); const value=Math.min(114,Math.max(1,Number(input.value)||1)); input.value=value; loadQuranSurah(value); });
  document.querySelector("#cache-quran-audio")?.addEventListener("click", async () => {
    const status=document.querySelector("#quran-status"); const urls=[...(currentQuranPayload?.audio?.ayahs?.map((ayah)=>ayah.audio).filter(Boolean)||[]), ...(currentQuranPayload?.surahAudioUrl?[currentQuranPayload.surahAudioUrl]:[])];
    if (!urls.length) { status.textContent="Audio qari ini belum tersedia. Pilih qari lain atau gunakan teks luring."; return; }
    if (!("caches" in window)) { status.textContent="Penyimpanan audio luring tidak didukung browser ini."; return; }
    const cache=await caches.open(QURAN_AUDIO_CACHE_NAME); let saved=0;
    for (const url of urls) { try { const existing=await cache.match(url); if(!existing){ const response=await fetch(url,{mode:"no-cors"}); await cache.put(url,response); } saved++; status.textContent=`Menyimpan audio ${saved} dari ${urls.length}…`; } catch { status.textContent=`Sebagian audio gagal disimpan (${saved}/${urls.length}). Coba lagi dengan koneksi stabil.`; return; } }
    status.textContent=`Audio ${currentQuranPayload?.reciter?.name||"qari"} berhasil disimpan untuk surat ini dan siap diputar luring pada perangkat yang sama.`;
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

  function localDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function dateIsInRange(key, start, end = start) {
    return key >= start && key <= (end || start);
  }

  function calendarMarkers(date, hijri) {
    const markers = [];
    const key = localDateKey(date);
    const weekday = date.getDay();
    const push = (label, className, note, category = className, source = "") => markers.push({
      label, className, note, category, source,
    });

    if (hijri) {
      const forbidden = (
        (hijri.month === 10 && hijri.day === 1)
        || (hijri.month === 12 && hijri.day >= 10 && hijri.day <= 13)
      );
      if (forbidden) {
        push("Dilarang berpuasa", "fast-forbidden", "Idul Fitri, Idul Adha, dan hari tasyrik termasuk hari yang dilarang berpuasa menurut ketentuan fikih.");
      } else if (hijri.month === 9) {
        push("Puasa Ramadhan", "fast-required", "Puasa wajib bagi Muslim yang memenuhi syarat. Ketetapan awal dan akhir Ramadhan mengikuti keputusan pemerintah.");
      } else {
        if (weekday === 1 || weekday === 4) {
          push(
            weekday === 1 ? "Puasa Senin" : "Puasa Kamis",
            "fast-sunnah",
            `Puasa sunnah hari ${weekday === 1 ? "Senin" : "Kamis"}, selama tidak bertepatan dengan hari yang dilarang berpuasa.`,
          );
        }
        if (hijri.day >= 13 && hijri.day <= 15 && !(hijri.month === 12 && hijri.day === 13)) {
          push("Ayyamul Bidh", "fast-sunnah", "Puasa sunnah tanggal 13, 14, dan 15 bulan Hijriah.");
        }
        if (hijri.month === 1 && hijri.day === 9) push("Puasa Tasu'a", "fast-sunnah", "Puasa sunnah pada 9 Muharram.");
        if (hijri.month === 1 && hijri.day === 10) push("Puasa Asyura", "fast-sunnah", "Puasa sunnah pada 10 Muharram; dianjurkan melengkapinya dengan Tasu'a.");
        if (hijri.month === 10 && hijri.day >= 2) {
          push("Rentang 6 Syawal", "fast-sunnah", "Tanggal ini termasuk rentang untuk memilih enam hari puasa sunnah Syawal setelah Idul Fitri.");
        }
        if (hijri.month === 12 && hijri.day >= 1 && hijri.day <= 9) {
          push(
            hijri.day === 9 ? "Puasa Arafah" : "Awal Dzulhijjah",
            "fast-sunnah",
            hijri.day === 9
              ? "Puasa sunnah Arafah bagi yang tidak sedang berhaji."
              : "Sembilan hari pertama Dzulhijjah merupakan waktu utama untuk memperbanyak amal sholeh; puasa dapat dikerjakan sesuai kemampuan.",
          );
        }
      }
      islamicData.historicDates
        .filter((item) => item.month === hijri.month && item.day === hijri.day)
        .forEach((item) => push(item.label, "history-mark", item.note, "history"));
    }

    calendarData.datedEvents
      .filter((item) => item.date === key)
      .forEach((item) => push(
        item.label,
        item.category === "holiday" ? "holiday-mark" : "collective-leave-mark",
        item.note,
        item.category,
        item.source,
      ));
    calendarData.recurringCommemorations
      .filter((item) => item.month === date.getMonth() + 1 && item.day === date.getDate())
      .forEach((item) => push(item.label, "commemoration-mark", item.note, item.category));
    calendarData.academicEvents
      .filter((item) => dateIsInRange(key, item.start, item.end))
      .forEach((item) => push(item.label, `academic-mark ${item.category}`, item.note, item.category, item.source));
    readCustomAcademicEvents()
      .filter((item) => dateIsInRange(key, item.start, item.end))
      .forEach((item) => push(
        item.label,
        `academic-mark academic-${item.category}`,
        item.note || `${academicCategoryLabels[item.category] || "Agenda sekolah"} yang ditambahkan guru.`,
        `academic-${item.category}`,
      ));
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
    const monthEvents = [];
    for (let day = 1; day <= totalDays; day += 1) {
      const date = new Date(year, month, day, 12);
      const hijri = hijriParts(date);
      const markers = calendarMarkers(date, hijri);
      const visibleMarkers = markers.slice(0, 3);
      if (markers.length) monthEvents.push({ date, hijri, markers });
      const cellClasses = [...new Set(markers.flatMap((item) => item.className.split(" ")).filter(Boolean))]
        .map((className) => `has-${className}`)
        .join(" ");
      cells.push(`
        <article class="calendar-cell${markers.length ? " has-marker" : ""}${cellClasses ? ` ${cellClasses}` : ""}">
          <div><strong>${day}</strong><span>${hijri ? `${hijri.day}/${hijri.month}` : "—"}</span></div>
          ${visibleMarkers.map((item) => `<small class="${escapeHtml(item.className)}" title="${escapeHtml(item.note)}">${escapeHtml(item.label)}</small>`).join("")}
          ${markers.length > visibleMarkers.length ? `<small class="more-markers">+${markers.length - visibleMarkers.length} keterangan</small>` : ""}
        </article>`);
    }
    document.querySelector("#hijri-calendar").innerHTML = `
      <div class="calendar-weekdays">${["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Ahd"].map((day) => `<span>${day}</span>`).join("")}</div>
      <div class="calendar-grid">${cells.join("")}</div>`;
    document.querySelector("#fasting-guide").innerHTML = `
      <div class="calendar-month-heading">
        <div><span class="badge">Keterangan Bulanan</span><h4>${escapeHtml(title)}</h4></div>
        <p>Hanya kejadian yang jatuh pada bulan yang sedang dibuka.</p>
      </div>
      <div class="calendar-event-list">
        ${monthEvents.length ? monthEvents.map(({ date, hijri, markers }) => `
          <article>
            <time datetime="${localDateKey(date)}">${new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date)}${hijri ? ` • ${hijri.day}/${hijri.month}/${hijri.year} H` : ""}</time>
            <div class="event-marker-list">
              ${markers.map((item) => `
                <div>
                  <span class="${escapeHtml(item.className)}">${escapeHtml(item.label)}</span>
                  <p>${escapeHtml(item.note)}</p>
                  ${item.source && calendarData.sources[item.source]
                    ? `<a href="${escapeHtml(calendarData.sources[item.source].url)}" target="_blank" rel="noopener">${escapeHtml(calendarData.sources[item.source].label)} ↗</a>`
                    : ""}
                </div>`).join("")}
            </div>
          </article>`).join("") : "<p>Tidak ada penanda khusus pada bulan ini.</p>"}
      </div>
      <div class="warning"><strong>Catatan:</strong> puasa qadha, nazar, kafarat, dan Puasa Nabi Dawud 'Alaihissalam tidak ditandai pada tanggal umum karena jadwalnya bergantung pada kewajiban atau pola ibadah masing-masing orang.</div>`;
  }

  document.querySelector("#calendar-prev")?.addEventListener("click", () => {
    islamicCalendarMonth = new Date(islamicCalendarMonth.getFullYear(), islamicCalendarMonth.getMonth() - 1, 1);
    renderHijriCalendar();
  });
  document.querySelector("#calendar-next")?.addEventListener("click", () => {
    islamicCalendarMonth = new Date(islamicCalendarMonth.getFullYear(), islamicCalendarMonth.getMonth() + 1, 1);
    renderHijriCalendar();
  });

  const combineInsightVariants = (starts, ends) => starts.flatMap((start) => ends.map((end) => `${start} ${end}`));
  const insightVariantDimensions = {
    audience: combineInsightVariants(
      ["murid", "guru", "keluarga", "komunitas sekolah", "pengunjung umum"],
      ["yang sedang belajar", "yang memerlukan penguatan", "yang ingin berefleksi", "yang sedang mengambil keputusan"],
    ),
    context: combineInsightVariants(
      ["di rumah", "di kelas", "di lingkungan sekolah", "di ruang digital", "di masyarakat"],
      ["pada pagi hari", "setelah belajar", "sebelum bertindak", "saat menghadapi perbedaan"],
    ),
    action: combineInsightVariants(
      ["catat", "diskusikan", "praktikkan", "jelaskan kembali", "hubungkan"],
      ["satu pelajaran", "dua bukti", "satu kebiasaan", "satu keputusan nyata"],
    ),
    reflection: combineInsightVariants(
      ["tanyakan kepada diri", "renungkan bersama teman", "tulis dalam jurnal", "bahas dengan guru", "sampaikan kepada keluarga"],
      ["apa yang perlu diperbaiki", "siapa yang menerima manfaat", "dalil apa yang menguatkan", "kebiasaan apa yang harus dijaga"],
    ),
    evidence: combineInsightVariants(
      ["gunakan", "bandingkan", "periksa", "cantumkan", "jelaskan"],
      ["sumber primer", "nomor hadits", "surat dan ayat", "bab kitab yang dirujuk"],
    ),
    format: combineInsightVariants(
      ["buat", "susun", "sajikan", "rekam", "gambarkan"],
      ["catatan singkat", "peta konsep", "contoh tindakan", "ringkasan lisan"],
    ),
    duration: combineInsightVariants(
      ["luangkan", "fokus selama", "ulang dalam", "jadwalkan", "evaluasi setelah"],
      ["lima menit", "sepuluh menit", "satu sesi belajar", "satu hari"],
    ),
    habit: combineInsightVariants(
      ["mulai dari", "jaga konsistensi", "ajak satu teman untuk", "beri teladan dalam", "ukur kemajuan pada"],
      ["satu tindakan kecil", "satu pekan", "satu kesempatan nyata", "kebiasaan harian"],
    ),
  };
  let dailyInsightVariantCounter = 0;

  function insightLearningVariation(itemIndex, sourceCount = islamicData.dailyInsights.length) {
    const keys = Object.keys(insightVariantDimensions);
    const base = (Math.floor(Date.now() / 86400000) * 131) + (itemIndex * 97) + (dailyInsightVariantCounter * 53);
    const values = Object.fromEntries(keys.map((key, index) => {
      const options = insightVariantDimensions[key];
      return [key, options[Math.abs(base + (index * 67)) % options.length]];
    }));
    const combinations = sourceCount
      * keys.reduce((product, key) => product * insightVariantDimensions[key].length, 1);
    return { ...values, combinations };
  }

  async function expandedInsightBank() {
    if (expandedInsightBankPromise) return expandedInsightBankPromise;
    expandedInsightBankPromise = loadOfflineQuran()
      .then((surahs) => {
        const quranItems = surahs.flatMap((surah) => surah.verses.map((verse, index) => ({
          type: "Al Qur'an",
          text: verse.translation,
          arabic: verse.text,
          source: `Al Qur'an Surat ${surah.transliteration} ayat ${index + 1}`,
          detail: "Baca ayat bersama rangkaian ayat sebelum dan sesudahnya; gunakan tafsir tepercaya serta bimbingan guru untuk memahami konteksnya.",
          url: "",
        })));
        const hadithItems = (hadithData.records || []).map((record) => ({
          type: "Hadits Riwayat",
          text: record.meaning,
          arabic: record.arabic,
          source: record.source,
          detail: record.note,
          url: record.url,
        }));
        const unique = new Map();
        [...islamicData.dailyInsights, ...quranItems, ...hadithItems].forEach((item) => {
          const key = `${item.source}|${item.text}`;
          if (!unique.has(key)) unique.set(key, item);
        });
        return [...unique.values()];
      })
      .catch(() => [...islamicData.dailyInsights, ...(hadithData.records || []).map((record) => ({
        type: "Hadits Riwayat",
        text: record.meaning,
        arabic: record.arabic,
        source: record.source,
        detail: record.note,
        url: record.url,
      }))]);
    return expandedInsightBankPromise;
  }

  async function renderDailyInsight(nextIndex = null) {
    const container = document.querySelector("#daily-insight");
    if (!container || !islamicData.dailyInsights.length) return;
    container.innerHTML = "<p>Menyiapkan bank nasihat bersumber…</p>";
    const insightBank = await expandedInsightBank();
    if (!insightBank.length) return;
    if (Number.isInteger(nextIndex)) dailyInsightIndex = nextIndex;
    if (!Number.isInteger(dailyInsightIndex)) {
      dailyInsightIndex = Math.floor(Date.now() / 86400000) % insightBank.length;
    }
    const normalizedIndex = ((dailyInsightIndex % insightBank.length) + insightBank.length) % insightBank.length;
    dailyInsightIndex = normalizedIndex;
    const item = insightBank[normalizedIndex];
    const variation = insightLearningVariation(normalizedIndex, insightBank.length);
    const variationLabel = variation.combinations >= 1_000_000_000_000
      ? "lebih dari 1 triliun"
      : variation.combinations >= 1_000_000_000
        ? "lebih dari 1 miliar"
        : variation.combinations.toLocaleString("id-ID");
    container.innerHTML = `
      <div class="insight-card-head"><span class="badge">${escapeHtml(item.type)}</span><small>Sumber ${normalizedIndex + 1} dari ${insightBank.length.toLocaleString("id-ID")} • ${variationLabel} susunan refleksi</small></div>
      ${item.arabic ? `<p class="insight-arabic" lang="ar" dir="rtl">${escapeHtml(item.arabic)}</p>` : ""}
      <blockquote>${escapeHtml(item.text)}</blockquote>
      ${item.url
        ? `<a class="insight-source" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">${escapeHtml(item.source)} ↗</a>`
        : `<strong>${escapeHtml(item.source)}</strong>`}
      <p>${escapeHtml(item.detail)}</p>
      <div class="insight-learning-variation">
        <strong>Renungan dan tindakan hari ini</strong>
        <ol>
          <li><span>Pahami:</span> ${escapeHtml(variation.action)} ${escapeHtml(variation.evidence)}.</li>
          <li><span>Renungkan:</span> ${escapeHtml(variation.reflection)}.</li>
          <li><span>Praktikkan:</span> ${escapeHtml(variation.habit)}, lalu ${escapeHtml(variation.format)}.</li>
        </ol>
        <small>Disusun untuk ${escapeHtml(variation.audience)} ${escapeHtml(variation.context)} • waktu ${escapeHtml(variation.duration)}.</small>
      </div>
      <small class="insight-combination-count">Bank memakai ${insightBank.length.toLocaleString("id-ID")} teks dasar yang dapat diperiksa dan ${variationLabel} kombinasi kegiatan. Jumlah besar berasal dari ayat, Hadits Riwayat, serta variasi refleksi—bukan kutipan palsu.</small>
      <span class="insight-click-hint">Klik kartu atau tombol di bawah untuk mengacak nasihat berikutnya.</span>`;
  }

  async function showNextDailyInsight() {
    const insightBank = await expandedInsightBank();
    dailyInsightVariantCounter += 1;
    const jump = Math.max(1, Math.floor(Math.random() * Math.max(1, insightBank.length - 1)));
    const next = Number.isInteger(dailyInsightIndex) ? dailyInsightIndex + jump : jump;
    renderDailyInsight(next);
  }

  document.querySelector("#daily-insight")?.addEventListener("click", (event) => {
    if (event.target.closest("a")) return;
    showNextDailyInsight();
  });
  document.querySelector("#daily-insight")?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    showNextDailyInsight();
  });
  document.querySelector("#next-daily-insight")?.addEventListener("click", showNextDailyInsight);

  function shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[target]] = [copy[target], copy[index]];
    }
    return copy;
  }

  function isGameSessionBlocking() {
    return Boolean(activeGameSession?.active);
  }

  function saveGameSession() {
    if (activeGameSession?.active) {
      localStorage.setItem(GAME_SESSION_KEY, JSON.stringify(activeGameSession));
    } else {
      localStorage.removeItem(GAME_SESSION_KEY);
    }
  }

  function gameModeTitle(mode = currentGameMode) {
    return document.querySelector(`[data-game-mode="${mode}"] strong`)?.textContent || "Games PAIBP";
  }

  function renderGameCatalog() {
    const container = document.querySelector("#game-mode-grid");
    if (!container) return;
    const arenas = Array.isArray(gameData?.arenas) && gameData.arenas.length
      ? gameData.arenas
      : Object.keys(gameModeBanks).map((id, index) => ({
        id,
        world: "utama",
        worldTitle: "Arena Utama",
        title: id,
        icon: ["⚡", "🧩", "📖", "🌱"][index % 4],
        description: "20 soal PAIBP SMP",
      }));
    container.innerHTML = arenas.map((arena) => `
      <button type="button" data-game-mode="${escapeHtml(arena.id)}" data-game-world="${escapeHtml(arena.world || "")}" data-game-search-text="${escapeHtml(`${arena.title} ${arena.description} ${arena.worldTitle}`.toLocaleLowerCase("id"))}">
        <span>${escapeHtml(arena.icon || "🎮")}</span>
        <strong>${escapeHtml(arena.title)}</strong>
        <small>${escapeHtml(arena.description)}</small>
      </button>`).join("");
    const worldFilter = document.querySelector("#game-world-filter");
    if (worldFilter) {
      const worlds = [...new Map(arenas.map((arena) => [arena.world, arena.worldTitle])).entries()];
      worldFilter.innerHTML = `<option value="">Semua kelompok</option>${worlds.map(([id, label]) => `<option value="${escapeHtml(id)}">${escapeHtml(label)}</option>`).join("")}`;
    }
    const filterCatalog = () => {
      const query = document.querySelector("#game-search")?.value.trim().toLocaleLowerCase("id") || "";
      const world = worldFilter?.value || "";
      let visible = 0;
      container.querySelectorAll("[data-game-mode]").forEach((button) => {
        const match = (!world || button.dataset.gameWorld === world)
          && (!query || button.dataset.gameSearchText.includes(query));
        button.hidden = !match;
        if (match) visible += 1;
      });
      const count = document.querySelector("#game-catalog-count");
      if (count) count.textContent = `${visible} dari ${arenas.length} game ditampilkan`;
    };
    document.querySelector("#game-search")?.addEventListener("input", filterCatalog);
    worldFilter?.addEventListener("change", filterCatalog);
  }

  function readGameProgress() {
    return safeJsonParse(localStorage.getItem(GAME_PROGRESS_KEY), { modes: {} }) || { modes: {} };
  }

  function renderGameModeProgress() {
    const progress = readGameProgress();
    document.querySelectorAll("[data-game-mode]").forEach((button) => {
      const modeProgress = progress.modes?.[button.dataset.gameMode] || {};
      let record = button.querySelector(".game-mode-record");
      if (!record) {
        record = document.createElement("em");
        record.className = "game-mode-record";
        button.append(record);
      }
      record.textContent = Number(modeProgress.completed || 0) > 0
        ? `✓ Tuntas ${modeProgress.completed}× • terbaik ${modeProgress.best}/20`
        : "Belum dituntaskan";
      record.classList.toggle("is-complete", Number(modeProgress.completed || 0) > 0);
    });
  }

  function markGameModeProgress() {
    const progress = readGameProgress();
    const previous = progress.modes?.[currentGameMode] || {};
    progress.modes = progress.modes || {};
    progress.modes[currentGameMode] = {
      completed: Number(previous.completed || 0) + 1,
      best: Math.max(Number(previous.best || 0), quizScore),
      lastCompletedAt: new Date().toISOString(),
    };
    localStorage.setItem(GAME_PROGRESS_KEY, JSON.stringify(progress));
    renderGameModeProgress();
  }

  function applyGameSessionLock() {
    const running = isGameSessionBlocking();
    const finished = running && activeGameSession.status === "finished";
    document.body.classList.toggle("game-session-active", running);
    document.querySelector("#quiz-card")?.classList.toggle("is-running", running);
    const lock = document.querySelector("#game-session-lock");
    if (lock) lock.hidden = !running;
    const title = document.querySelector("#game-session-title");
    if (title) title.textContent = finished
      ? `${gameModeTitle()} selesai — pintu keluar sudah terbuka`
      : `${gameModeTitle()} sedang berlangsung`;
    document.querySelectorAll("[data-game-mode]").forEach((button) => {
      button.disabled = running;
      button.classList.toggle("is-locked", running && button.dataset.gameMode !== currentGameMode);
    });
    const exitButton = document.querySelector("#game-finish-exit");
    if (exitButton) {
      exitButton.hidden = !finished;
      exitButton.disabled = !finished;
    }
    const reset = document.querySelector("#reset-progress");
    if (reset) reset.hidden = running;
  }

  function startQuiz() {
    if (isGameSessionBlocking()) return;
    const generated = typeof gameData?.generateSession === "function"
      ? gameData.generateSession(currentGameMode, 20)
      : null;
    const bank = gameModeBanks[currentGameMode] || questionBank;
    quizQuestions = Array.isArray(generated) ? generated : shuffle(bank).slice(0, 20);
    if (quizQuestions.length < 20) {
      document.querySelector("#quiz-feedback").textContent = "Arena belum memiliki 20 soal lengkap.";
      document.querySelector("#quiz-feedback").className = "quiz-feedback error";
      return;
    }
    quizIndex = 0;
    quizScore = 0;
    quizLocked = false;
    activeGameSession = {
      active: true,
      status: "running",
      mode: currentGameMode,
      title: gameModeTitle(),
      questions: quizQuestions,
      index: 0,
      score: 0,
      answers: [],
      startedAt: new Date().toISOString(),
    };
    saveGameSession();
    applyGameSessionLock();
    document.querySelector("#quiz-start").hidden = true;
    document.querySelector("#quiz-next").hidden = true;
    document.querySelector("#quiz-score").textContent = "0";
    document.querySelector("#quiz-question").textContent = `Menyiapkan ${gameModeTitle()}…`;
    renderQuizQuestion();
    switchTrackedResource("game", currentGameMode, gameModeTitle());
  }

  function applyQuizAnswerVisual(selectedIndex) {
    const [, , answer, explanation] = quizQuestions[quizIndex];
    const buttons = [...document.querySelectorAll("#quiz-options .quiz-option")];
    buttons.forEach((button, index) => {
      button.disabled = true;
      if (index === answer) button.classList.add("correct");
      if (index === selectedIndex) button.classList.add("selected");
      if (index === selectedIndex && selectedIndex !== answer) button.classList.add("wrong");
    });
    const feedback = document.querySelector("#quiz-feedback");
    const correct = selectedIndex === answer;
    feedback.textContent = `${correct ? "Benar." : "Belum tepat."} ${explanation}`;
    feedback.className = `quiz-feedback ${correct ? "success" : "error"}`;
    const next = document.querySelector("#quiz-next");
    next.hidden = false;
    next.textContent = quizIndex === quizQuestions.length - 1 ? "Selesaikan Arena" : "Soal Berikutnya";
  }

  function renderQuizQuestion() {
    const current = quizQuestions[quizIndex];
    if (!current) {
      finishQuiz();
      return;
    }
    const [question, options] = current;
    const savedAnswer = activeGameSession?.answers?.[quizIndex];
    quizLocked = Boolean(savedAnswer);
    const optionContainer = document.querySelector("#quiz-options");
    optionContainer.replaceChildren();
    document.querySelector("#quiz-feedback").textContent = "";
    document.querySelector("#quiz-feedback").className = "quiz-feedback";
    document.querySelector("#quiz-question").textContent = question;
    document.querySelector("#quiz-number").textContent = `Soal ${quizIndex + 1} dari 20 • ${gameModeTitle()}`;
    document.querySelector("#quiz-best").textContent = `Skor terbaik: ${state.gameBest}/20`;
    document.querySelector("#quiz-progress-bar").style.width = `${((quizIndex + 1) / 20) * 100}%`;
    document.querySelector("#quiz-score").textContent = quizScore;
    options.forEach((option, optionIndex) => {
      const button = document.createElement("button");
      button.className = "quiz-option";
      button.type = "button";
      button.innerHTML = `<span class="quiz-letter">${String.fromCharCode(65 + optionIndex)}</span><span></span>`;
      button.lastElementChild.textContent = option;
      button.addEventListener("click", () => answerQuiz(optionIndex, button));
      optionContainer.append(button);
    });
    if (savedAnswer) applyQuizAnswerVisual(Number(savedAnswer.selected));
  }

  function answerQuiz(selectedIndex) {
    if (quizLocked || activeGameSession?.status !== "running") return;
    quizLocked = true;
    const [, , answer] = quizQuestions[quizIndex];
    const correct = selectedIndex === answer;
    if (correct) quizScore += 1;
    activeGameSession.answers[quizIndex] = { selected: selectedIndex, correct };
    activeGameSession.score = quizScore;
    activeGameSession.index = quizIndex;
    saveGameSession();
    document.querySelector("#quiz-score").textContent = quizScore;
    applyQuizAnswerVisual(selectedIndex);
  }

  function nextQuiz() {
    if (!quizLocked || activeGameSession?.status !== "running") return;
    quizIndex += 1;
    activeGameSession.index = quizIndex;
    saveGameSession();
    document.querySelector("#quiz-next").hidden = true;
    if (quizIndex >= 20) finishQuiz();
    else renderQuizQuestion();
  }

  function renderFinishedGame() {
    document.querySelector("#quiz-question").textContent = `Arena selesai: ${quizScore} dari 20 jawaban benar.`;
    document.querySelector("#quiz-options").replaceChildren();
    const feedback = document.querySelector("#quiz-feedback");
    feedback.textContent = quizScore >= 16
      ? "Hebat! Arena telah dituntaskan dengan pemahaman yang sangat baik."
      : "Arena telah dituntaskan. Pelajari kembali penjelasan yang belum dikuasai sebelum mencoba ulang.";
    feedback.className = `quiz-feedback ${quizScore >= 16 ? "success" : "error"}`;
    document.querySelector("#quiz-number").textContent = "20 dari 20 soal selesai";
    document.querySelector("#quiz-best").textContent = `Skor terbaik: ${state.gameBest}/20`;
    document.querySelector("#quiz-progress-bar").style.width = "100%";
    document.querySelector("#quiz-start").hidden = true;
    document.querySelector("#quiz-next").hidden = true;
    applyGameSessionLock();
  }

  function finishQuiz() {
    if (activeGameSession?.status === "finished") {
      renderFinishedGame();
      return;
    }
    if (quizQuestions.length !== 20 || activeGameSession?.answers?.filter(Boolean).length !== 20) return;
    if (quizScore > state.gameBest) {
      state.gameBest = quizScore;
      saveState();
    }
    markGameModeProgress();
    activeGameSession.status = "finished";
    activeGameSession.completedAt = new Date().toISOString();
    activeGameSession.score = quizScore;
    saveGameSession();
    renderFinishedGame();
    updateProgress();
  }

  function exitFinishedGame() {
    if (activeGameSession?.status !== "finished") return;
    activeGameSession = null;
    saveGameSession();
    quizQuestions = [];
    quizIndex = -1;
    quizScore = 0;
    quizLocked = false;
    applyGameSessionLock();
    document.querySelector("#quiz-score").textContent = "0";
    document.querySelector("#quiz-question").textContent = "Pilih salah satu dari 100 game, lalu tekan “Mulai 20 Soal”.";
    document.querySelector("#quiz-options").replaceChildren();
    document.querySelector("#quiz-feedback").textContent = "";
    document.querySelector("#quiz-number").textContent = "Siap bermain • 20 soal per arena";
    document.querySelector("#quiz-progress-bar").style.width = "0%";
    const start = document.querySelector("#quiz-start");
    start.textContent = "Mulai 20 Soal";
    start.hidden = false;
  }

  function restoreGameSession() {
    if (!activeGameSession?.active) return;
    const bankExists = Boolean(
      gameModeBanks[activeGameSession.mode]
      || gameData?.arenas?.some((arena) => arena.id === activeGameSession.mode),
    );
    const validQuestions = Array.isArray(activeGameSession.questions) && activeGameSession.questions.length === 20;
    if (!bankExists || !validQuestions) {
      activeGameSession = null;
      saveGameSession();
      return;
    }
    currentGameMode = activeGameSession.mode;
    quizQuestions = activeGameSession.questions;
    quizIndex = Math.min(20, Math.max(0, Number(activeGameSession.index || 0)));
    quizScore = Math.min(20, Math.max(0, Number(activeGameSession.score || 0)));
    document.querySelectorAll("[data-game-mode]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.gameMode === currentGameMode);
    });
    openPanel("games");
    applyGameSessionLock();
    document.querySelector("#quiz-start").hidden = true;
    if (activeGameSession.status === "finished") renderFinishedGame();
    else renderQuizQuestion();
  }

  renderGameCatalog();
  document.querySelector("#quiz-start")?.addEventListener("click", startQuiz);
  document.querySelector("#quiz-next")?.addEventListener("click", nextQuiz);
  document.querySelector("#game-finish-exit")?.addEventListener("click", exitFinishedGame);
  document.querySelectorAll("[data-game-mode]").forEach((button) => button.addEventListener("click", () => {
    if (isGameSessionBlocking()) return;
    currentGameMode = button.dataset.gameMode;
    document.querySelectorAll("[data-game-mode]").forEach((item) => item.classList.toggle("is-active", item === button));
    const title = button.querySelector("strong")?.textContent || "Games";
    const description = button.querySelector("small")?.textContent || "";
    document.querySelector("#quiz-question").textContent = `${title}: ${description}. Arena berisi 20 soal dan harus diselesaikan sampai akhir.`;
    document.querySelector("#quiz-options").replaceChildren();
    document.querySelector("#quiz-feedback").textContent = "";
    document.querySelector("#quiz-start").textContent = "Mulai 20 Soal";
    document.querySelector("#quiz-start").hidden = false;
    document.querySelector("#quiz-next").hidden = true;
    document.querySelector("#quiz-number").textContent = "Mode dipilih • 20 soal";
    switchTrackedResource("game", currentGameMode, title);
  }));
  document.querySelector(`[data-game-mode="${currentGameMode}"]`)?.classList.add("is-active");
  renderGameModeProgress();
  document.querySelector("#reset-progress")?.addEventListener("click", () => {
    if (isGameSessionBlocking()) return;
    if (!window.confirm("Hapus seluruh progres bab dan skor games pada perangkat ini?")) return;
    state = { completed: [], gameBest: 0 };
    localStorage.removeItem(GAME_PROGRESS_KEY);
    saveState();
    renderChapterCards();
    renderGameModeProgress();
    updateProgress();
  });
  window.addEventListener("beforeunload", (event) => {
    if (activeGameSession?.status !== "running") return;
    event.preventDefault();
    event.returnValue = "";
  });
  restoreGameSession();

  function updateProgress() {
    const completed = state.completed.length;
    const percent = Math.round((completed / chapters.length) * 100);
    const xp = calculateXp();
    document.querySelector("#material-completed").textContent = `${completed}/30`;
    document.querySelector("#progress-completed").textContent = `${completed}/30`;
    document.querySelector("#progress-xp").textContent = `${xp} XP`;
    document.querySelector("#progress-level").textContent = getLevel(xp);
    document.querySelector("#progress-game").textContent = `${state.gameBest}/20`;
    document.querySelector("#progress-percent").textContent = `${percent}%`;
    const bar = document.querySelector("#overall-progress-bar");
    bar.value = percent;
    bar.textContent = `${percent}%`;
    document.querySelector("#quiz-best").textContent = `Skor terbaik: ${state.gameBest}/20`;
    const badges = [
      ["🌱", "Langkah Pertama", "Selesaikan 1 bab", completed >= 1],
      ["📚", "Tekun Belajar", "Selesaikan 5 bab", completed >= 5],
      ["🎯", "Penakluk Games", "Raih skor minimal 16", state.gameBest >= 16],
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
    const imageSource = window.PAIBP_STAFF_IMAGES?.[person.image] || person.image;
    const initials = person.name
      .replace(/,\s*.*$/, "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
    return `
      <article class="staff-card">
        <div class="staff-photo">
          <span class="staff-initials" aria-hidden="true">${escapeHtml(initials)}</span>
          <img src="${escapeHtml(imageSource)}" alt="${escapeHtml(person.name)}" width="520" height="520" loading="lazy" decoding="async">
        </div>
        <div><strong>${escapeHtml(person.name)}</strong><span>${escapeHtml(label)}</span></div>
      </article>`;
  }

  function activateStaffImageFallback(container) {
    if (!container) return;
    container.querySelectorAll(".staff-photo img").forEach((image) => {
      const showFallback = () => image.closest(".staff-photo")?.classList.add("has-error");
      image.addEventListener("error", showFallback, { once: true });
      if (image.complete && image.naturalWidth === 0) showFallback();
    });
  }

  function readGalleryItems() {
    const saved = safeJsonParse(localStorage.getItem(GALLERY_STORAGE_KEY), null);
    if (Array.isArray(saved)) return saved;
    return Array.isArray(schoolData.news) ? schoolData.news : [];
  }

  function writeGalleryItems(items) {
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(items.slice(0, 30)));
  }

  function formatGalleryDate(value) {
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  }

  function renderGallery() {
    const newsGallery = document.querySelector("#news-gallery");
    if (!newsGallery) return;
    const items = readGalleryItems()
      .filter((item) => item?.title && item?.date && item?.summary)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
    if (!items.length) {
      newsGallery.className = "news-placeholder";
      newsGallery.innerHTML = `
        <span aria-hidden="true">📸</span>
        <div><strong>Belum ada dokumentasi yang diterbitkan</strong><p>Pengelola dapat menambahkan foto, judul, tanggal, dan ringkasan kegiatan melalui akses admin.</p></div>`;
      return;
    }
    newsGallery.className = "news-grid";
    newsGallery.innerHTML = items.map((item) => `
      <article class="news-card">
        ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async">` : `<div class="news-image-fallback" aria-hidden="true">📸</div>`}
        <div>
          <time datetime="${escapeHtml(item.date)}">${escapeHtml(formatGalleryDate(item.date))}</time>
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.summary)}</p>
          ${galleryAdminOpen ? `<div class="news-admin-actions no-print">
            <button class="btn btn-compact" type="button" data-edit-gallery="${escapeHtml(item.id)}">Edit</button>
            <button class="text-button danger-button" type="button" data-delete-gallery="${escapeHtml(item.id)}">Hapus</button>
          </div>` : ""}
        </div>
      </article>`).join("");
    attachGalleryItemActions();
  }

  function resetGalleryForm() {
    const form = document.querySelector("#gallery-form");
    form?.reset();
    const id = document.querySelector("#gallery-item-id");
    if (id) id.value = "";
    galleryPreviewData = "";
    const preview = document.querySelector("#gallery-photo-preview");
    if (preview) preview.innerHTML = `<span aria-hidden="true">🖼️</span><small>Pratinjau foto</small>`;
    const status = document.querySelector("#gallery-admin-status");
    if (status) status.textContent = "";
  }

  function setGalleryAdminVisible(visible) {
    if (visible && !isEditorUnlocked()) {
      pendingProtectedAction = "gallery";
      setTeacherAuthVisible(true, "gallery");
      return;
    }
    galleryAdminOpen = visible;
    const admin = document.querySelector("#gallery-admin");
    if (admin) admin.hidden = !visible;
    renderGallery();
    if (visible) {
      admin?.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
      document.querySelector("#gallery-title")?.focus();
    } else {
      resetGalleryForm();
    }
  }

  function optimizeGalleryImage(file) {
    return new Promise((resolve, reject) => {
      if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type)) {
        reject(new Error("Pilih foto JPG, PNG, atau WebP."));
        return;
      }
      if (file.size > 12 * 1024 * 1024) {
        reject(new Error("Ukuran foto maksimal 12 MB."));
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Foto tidak dapat dibaca."));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error("Format foto tidak dapat diproses."));
        image.onload = () => {
          const maxWidth = 1440;
          const maxHeight = 1080;
          const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
          const width = Math.max(1, Math.round(image.width * scale));
          const height = Math.max(1, Math.round(image.height * scale));
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d").drawImage(image, 0, 0, width, height);
          resolve(canvas.toDataURL("image/webp", 0.8));
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function syncGalleryMutation(action, item) {
    if (!realtimeIsConfigured()) return false;
    try {
      await fetch(appConfig.realtimeEndpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          type: "gallery",
          key: appConfig.realtimeReadKey,
          action,
          item,
        }),
      });
      return true;
    } catch {
      return false;
    }
  }

  async function loadOnlineGallery() {
    if (!realtimeIsConfigured() || !appConfig.realtimeReadKey) return;
    try {
      const url = new URL(appConfig.realtimeEndpoint);
      url.searchParams.set("action", "gallery");
      url.searchParams.set("key", appConfig.realtimeReadKey);
      url.searchParams.set("_", String(Date.now()));
      const response = await fetch(url);
      const result = await response.json();
      if (result.ok && Array.isArray(result.gallery)) {
        writeGalleryItems(result.gallery);
        renderGallery();
      }
    } catch {
      // Galeri lokal tetap dapat dipakai saat koneksi atau endpoint belum tersedia.
    }
  }

  function attachGalleryItemActions() {
    document.querySelectorAll("[data-edit-gallery]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = readGalleryItems().find((entry) => entry.id === button.dataset.editGallery);
        if (!item) return;
        document.querySelector("#gallery-item-id").value = item.id;
        document.querySelector("#gallery-title").value = item.title;
        document.querySelector("#gallery-date").value = item.date;
        document.querySelector("#gallery-summary").value = item.summary;
        galleryPreviewData = item.image || "";
        const preview = document.querySelector("#gallery-photo-preview");
        preview.innerHTML = item.image
          ? `<img src="${escapeHtml(item.image)}" alt="Pratinjau ${escapeHtml(item.title)}">`
          : `<span aria-hidden="true">🖼️</span><small>Tambahkan foto</small>`;
        document.querySelector("#gallery-form")?.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
      });
    });
    document.querySelectorAll("[data-delete-gallery]").forEach((button) => {
      button.addEventListener("click", async () => {
        if (!window.confirm("Hapus dokumentasi kegiatan ini?")) return;
        const id = button.dataset.deleteGallery;
        writeGalleryItems(readGalleryItems().filter((item) => item.id !== id));
        renderGallery();
        const synced = await syncGalleryMutation("delete", { id });
        const status = document.querySelector("#gallery-admin-status");
        if (status) status.textContent = synced ? "Dokumentasi dihapus dan permintaan sinkronisasi dikirim." : "Dokumentasi dihapus dari perangkat ini.";
      });
    });
  }

  function attachGalleryAdmin() {
    document.querySelector("#open-gallery-admin")?.addEventListener("click", () => {
      openPanel("editor");
    });
    document.querySelector("#editor-open-gallery")?.addEventListener("click", () => {
      pendingProtectedAction = "gallery";
      setGalleryAdminVisible(true);
    });
    document.querySelector("#close-gallery-admin")?.addEventListener("click", () => setGalleryAdminVisible(false));
    document.querySelector("#cancel-gallery-edit")?.addEventListener("click", resetGalleryForm);
    document.querySelector("#gallery-photo")?.addEventListener("change", async (event) => {
      const status = document.querySelector("#gallery-admin-status");
      try {
        galleryPreviewData = await optimizeGalleryImage(event.target.files?.[0]);
        document.querySelector("#gallery-photo-preview").innerHTML = `<img src="${escapeHtml(galleryPreviewData)}" alt="Pratinjau foto kegiatan">`;
        if (status) status.textContent = "Foto siap digunakan.";
      } catch (error) {
        galleryPreviewData = "";
        if (status) status.textContent = error.message;
      }
    });
    document.querySelector("#gallery-form")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const idInput = document.querySelector("#gallery-item-id");
      const currentItems = readGalleryItems();
      const existing = currentItems.find((item) => item.id === idInput.value);
      if (!galleryPreviewData && !existing?.image) {
        document.querySelector("#gallery-admin-status").textContent = "Tambahkan satu foto kegiatan sebelum menerbitkan.";
        return;
      }
      const item = {
        id: existing?.id || (typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : `gallery-${Date.now()}`),
        title: document.querySelector("#gallery-title").value.trim(),
        date: document.querySelector("#gallery-date").value,
        summary: document.querySelector("#gallery-summary").value.trim(),
        image: galleryPreviewData || existing?.image || "",
        updatedAt: new Date().toISOString(),
      };
      const nextItems = existing
        ? currentItems.map((entry) => entry.id === item.id ? item : entry)
        : [item, ...currentItems];
      try {
        writeGalleryItems(nextItems);
      } catch {
        document.querySelector("#gallery-admin-status").textContent = "Penyimpanan perangkat penuh. Cadangkan galeri lalu hapus foto lama atau gunakan foto berukuran lebih kecil.";
        return;
      }
      renderGallery();
      resetGalleryForm();
      const synced = await syncGalleryMutation("save", item);
      document.querySelector("#gallery-admin-status").textContent = synced
        ? "Dokumentasi disimpan dan permintaan sinkronisasi daring dikirim."
        : "Dokumentasi disimpan pada perangkat ini. Aktifkan rekap daring agar tampil pada semua perangkat.";
    });
    document.querySelector("#export-gallery")?.addEventListener("click", () => {
      const blocks = readGalleryItems().flatMap((item, index) => [
        { text: `${index + 1}. ${item.title}`, style: "Heading2" },
        `Tanggal: ${item.date ? new Date(`${item.date}T00:00:00`).toLocaleDateString("id-ID") : "—"}`,
        item.summary,
      ]);
      downloadBlob(
        window.PAIBP_DOCX.createDocument({ title: "Laporan Galeri Spensus Terkini", blocks }),
        `Laporan-Spensus-Terkini-${new Date().toISOString().slice(0, 10)}.docx`,
      );
    });
    document.querySelector("#import-gallery")?.addEventListener("change", async (event) => {
      try {
        const parsed = JSON.parse(await event.target.files?.[0]?.text());
        if (!Array.isArray(parsed) || parsed.some((item) => !item?.id || !item?.title || !item?.date)) throw new Error();
        writeGalleryItems(parsed);
        renderGallery();
        document.querySelector("#gallery-admin-status").textContent = `${parsed.length} dokumentasi berhasil dipulihkan.`;
      } catch {
        document.querySelector("#gallery-admin-status").textContent = "Berkas cadangan galeri tidak sesuai.";
      }
      event.target.value = "";
    });
  }

  function readFeedbackItems() {
    try {
      const items = safeJsonParse(localStorage.getItem(FEEDBACK_STORAGE_KEY), []);
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  }

  function writeFeedbackItems(items) {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(items.slice(0, 300)));
    renderPublicFeedback();
    renderEditorFeedback();
    renderVisitorStats();
  }

  function feedbackStars(rating) {
    const value = Math.min(5, Math.max(1, Number(rating) || 1));
    return `${"★".repeat(value)}${"☆".repeat(5 - value)}`;
  }

  function renderPublicFeedback() {
    const container = document.querySelector("#public-feedback-list");
    if (!container) return;
    const visible = readFeedbackItems()
      .filter((item) => item.status !== "hidden" && item.status !== "deleted")
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .slice(0, 12);
    container.innerHTML = visible.length ? visible.map((item) => `
      <article class="feedback-item">
        <div class="feedback-item-head">
          <strong>${escapeHtml(item.name || "Pengguna PAIBP SMART")}</strong>
          <span class="feedback-stars" aria-label="${Number(item.rating)} dari 5 bintang">${feedbackStars(item.rating)}</span>
        </div>
        <small>${escapeHtml(item.role || "umum")} • ${item.createdAt ? new Date(item.createdAt).toLocaleDateString("id-ID") : ""}</small>
        <p>${escapeHtml(item.comment)}</p>
        ${item.reply ? `<div class="feedback-reply"><strong>Balasan editor</strong><p>${escapeHtml(item.reply)}</p></div>` : ""}
      </article>`).join("") : "<p>Belum ada tanggapan. Jadilah pengguna pertama yang memberi masukan.</p>";
  }

  async function syncFeedback(action, item) {
    if (!realtimeIsConfigured()) return false;
    try {
      await fetch(appConfig.realtimeEndpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          type: "feedback",
          action,
          item,
          key: appConfig.realtimeReadKey || "",
        }),
      });
      return true;
    } catch {
      return false;
    }
  }

  async function loadPublicFeedback() {
    if (!realtimeIsConfigured()) return;
    try {
      const url = new URL(appConfig.realtimeEndpoint);
      url.searchParams.set("action", "public-feedback");
      const response = await fetch(url.toString(), { cache: "no-store" });
      const payload = await response.json();
      if (payload.ok && Array.isArray(payload.feedback)) {
        localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(payload.feedback));
        renderPublicFeedback();
        renderVisitorStats();
      }
    } catch {
      // Tanggapan lokal tetap tampil ketika sinkronisasi belum tersedia.
    }
  }

  function attachFeedbackForm() {
    document.querySelector("#feedback-form")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const status = document.querySelector("#feedback-status");
      const item = {
        id: typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : `feedback-${Date.now()}`,
        name: document.querySelector("#feedback-name")?.value.trim() || "",
        role: document.querySelector("#feedback-role")?.value || "umum",
        rating: Math.min(5, Math.max(1, Number(document.querySelector("#feedback-rating")?.value) || 5)),
        comment: document.querySelector("#feedback-comment")?.value.trim() || "",
        reply: "",
        status: "published",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!item.comment) return;
      writeFeedbackItems([item, ...readFeedbackItems().filter((entry) => entry.id !== item.id)]);
      event.currentTarget.reset?.();
      const commentField = document.querySelector("#feedback-comment");
      if (commentField) commentField.value = "";
      const synced = await syncFeedback("add", item);
      if (status) status.textContent = synced
        ? "Terima kasih. Tanggapan tersimpan dan dikirim ke pengelola."
        : "Terima kasih. Tanggapan tersimpan pada perangkat ini; sinkronisasi daring belum aktif.";
      refreshPublicStats();
    });
  }

  function renderEditorFeedback() {
    const container = document.querySelector("#editor-feedback-list");
    if (!container) return;
    const items = readFeedbackItems().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    container.innerHTML = items.length ? items.map((item) => `
      <article class="editor-feedback-item" data-feedback-id="${escapeHtml(item.id)}">
        <div class="feedback-item-head">
          <strong>${escapeHtml(item.name || "Pengguna PAIBP SMART")} • ${escapeHtml(item.role)}</strong>
          <span class="feedback-stars">${feedbackStars(item.rating)}</span>
        </div>
        <p>${escapeHtml(item.comment)}</p>
        <small>Status: ${escapeHtml(item.status || "published")} • ${item.createdAt ? new Date(item.createdAt).toLocaleString("id-ID") : ""}</small>
        <form class="editor-reply-form" data-feedback-reply="${escapeHtml(item.id)}">
          <input value="${escapeHtml(item.reply || "")}" maxlength="800" placeholder="Tulis balasan editor">
          <button class="btn btn-compact" type="submit">Simpan balasan</button>
        </form>
        <div class="editor-feedback-actions">
          <button class="btn btn-compact" type="button" data-feedback-action="published" data-feedback-id="${escapeHtml(item.id)}">Tampilkan</button>
          <button class="btn btn-compact" type="button" data-feedback-action="hidden" data-feedback-id="${escapeHtml(item.id)}">Sembunyikan</button>
          <button class="text-button danger-button" type="button" data-feedback-action="deleted" data-feedback-id="${escapeHtml(item.id)}">Hapus</button>
        </div>
      </article>`).join("") : "<p>Belum ada tanggapan yang masuk.</p>";
    container.querySelectorAll("[data-feedback-action]").forEach((button) => {
      button.addEventListener("click", async () => {
        const id = button.dataset.feedbackId;
        const next = readFeedbackItems().map((item) => item.id === id
          ? { ...item, status: button.dataset.feedbackAction, updatedAt: new Date().toISOString() }
          : item);
        const changed = next.find((item) => item.id === id);
        writeFeedbackItems(next);
        if (changed) await syncFeedback("moderate", changed);
      });
    });
    container.querySelectorAll("[data-feedback-reply]").forEach((form) => {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const id = form.dataset.feedbackReply;
        const reply = form.querySelector("input")?.value.trim() || "";
        const next = readFeedbackItems().map((item) => item.id === id
          ? { ...item, reply, updatedAt: new Date().toISOString() }
          : item);
        const changed = next.find((item) => item.id === id);
        writeFeedbackItems(next);
        if (changed) await syncFeedback("moderate", changed);
      });
    });
  }

  function readHomepageCopy() {
    const defaults = {
      title: "Belajar utuh. Mengajar terarah.",
      copy: "PAIBP SMART SMP menyatukan materi lengkap, ringkasan, LKPD, progres murid, perangkat pembelajaran guru, layanan Islami, dan game edukatif kelas VII–IX.",
    };
    try {
      return { ...defaults, ...(safeJsonParse(localStorage.getItem(HOMEPAGE_COPY_KEY), {}) || {}) };
    } catch {
      return defaults;
    }
  }

  function applyHomepageCopy() {
    const copy = readHomepageCopy();
    const title = document.querySelector(".hero h1");
    const paragraph = document.querySelector(".hero .hero-copy");
    if (title) title.textContent = copy.title;
    if (paragraph) paragraph.textContent = copy.copy;
    const editorTitle = document.querySelector("#editor-hero-title");
    const editorCopy = document.querySelector("#editor-hero-copy");
    if (editorTitle) editorTitle.value = copy.title;
    if (editorCopy) editorCopy.value = copy.copy;
  }

  async function syncHomepageCopy(copy) {
    if (!realtimeIsConfigured()) return false;
    try {
      await fetch(appConfig.realtimeEndpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          type: "content",
          action: "save",
          key: appConfig.realtimeReadKey || "",
          item: { id: "homepage", ...copy, updatedAt: new Date().toISOString() },
        }),
      });
      return true;
    } catch {
      return false;
    }
  }

  async function loadPublicContent() {
    if (!realtimeIsConfigured()) return;
    try {
      const url = new URL(appConfig.realtimeEndpoint);
      url.searchParams.set("action", "public-content");
      const response = await fetch(url.toString(), { cache: "no-store" });
      const payload = await response.json();
      const homepage = payload.content?.find((item) => item.id === "homepage");
      if (!payload.ok || !homepage?.title || !homepage?.copy) return;
      localStorage.setItem(HOMEPAGE_COPY_KEY, JSON.stringify({ title: homepage.title, copy: homepage.copy }));
      applyHomepageCopy();
    } catch {
      // Konten lokal/bawaan tetap dipakai ketika sinkronisasi belum tersedia.
    }
  }

  function attachHomepageEditor() {
    document.querySelector("#homepage-editor-form")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const copy = {
        title: document.querySelector("#editor-hero-title")?.value.trim() || "",
        copy: document.querySelector("#editor-hero-copy")?.value.trim() || "",
      };
      localStorage.setItem(HOMEPAGE_COPY_KEY, JSON.stringify(copy));
      applyHomepageCopy();
      const synced = await syncHomepageCopy(copy);
      const status = document.querySelector("#homepage-editor-status");
      if (status) status.textContent = synced
        ? "Perubahan diterapkan dan permintaan sinkronisasi dikirim."
        : "Perubahan diterapkan pada perangkat ini. Aktifkan sinkronisasi agar berlaku lintas perangkat.";
    });
    document.querySelector("#reset-homepage-copy")?.addEventListener("click", () => {
      localStorage.removeItem(HOMEPAGE_COPY_KEY);
      applyHomepageCopy();
      const status = document.querySelector("#homepage-editor-status");
      if (status) status.textContent = "Teks bawaan telah dipulihkan pada perangkat ini.";
    });
  }

  async function loadEditorRemoteData() {
    const body = document.querySelector("#editor-teacher-access");
    if (!body) return;
    if (!realtimeIsConfigured() || !appConfig.realtimeReadKey) {
      const localTeachers = Object.values(readVisitorLedger().sessions || {})
        .filter((entry) => !entry.admin && entry.roles?.includes("guru") && entry.teacher?.name)
        .sort((a, b) => String(b.lastAccess).localeCompare(String(a.lastAccess)));
      body.innerHTML = localTeachers.length ? localTeachers.map((entry) => `
        <tr>
          <td>${entry.lastAccess ? new Date(entry.lastAccess).toLocaleString("id-ID") : "—"}</td>
          <td>${escapeHtml(entry.teacher.name)}</td>
          <td>${escapeHtml(entry.teacher.workUnit || "—")}</td>
          <td>${escapeHtml(entry.teacher.nip || "—")}</td>
          <td>Riwayat perangkat ini</td>
        </tr>`).join("") : "<tr><td colspan='5'>Belum ada guru pada perangkat ini. Aktifkan Google Apps Script untuk pemantauan lintas perangkat.</td></tr>";
      return;
    }
    try {
      const url = new URL(appConfig.realtimeEndpoint);
      url.searchParams.set("action", "editor-data");
      url.searchParams.set("key", appConfig.realtimeReadKey);
      const response = await fetch(url.toString(), { cache: "no-store" });
      const payload = await response.json();
      if (!payload.ok) throw new Error("Data editor belum tersedia.");
      if (Array.isArray(payload.feedback)) {
        localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(payload.feedback));
        renderPublicFeedback();
        renderEditorFeedback();
      }
      const teachers = (payload.events || []).filter((item) => item.visitorRole === "guru").slice(0, 150);
      body.innerHTML = teachers.length ? teachers.map((item) => `
        <tr>
          <td>${item.timestamp ? new Date(item.timestamp).toLocaleString("id-ID") : "—"}</td>
          <td>${escapeHtml(item.name || "—")}</td>
          <td>${escapeHtml(item.workUnit || "—")}</td>
          <td>${escapeHtml(item.nip || "—")}</td>
          <td>${escapeHtml(item.resourceTitle || item.action || "Membuka situs")}</td>
        </tr>`).join("") : "<tr><td colspan='5'>Belum ada kunjungan guru yang tercatat.</td></tr>";
      if (payload.stats) renderVisitorStats(payload.stats);
    } catch {
      body.innerHTML = "<tr><td colspan='5'>Data daring belum dapat dimuat. Periksa endpoint dan kunci baca.</td></tr>";
    }
  }

  function renderEditorPanel() {
    applyHomepageCopy();
    renderEditorFeedback();
    refreshPublicStats();
    loadEditorRemoteData();
  }

  function attachEditorControls() {
    attachHomepageEditor();
    document.querySelector("#editor-refresh-data")?.addEventListener("click", () => {
      refreshPublicStats();
      loadEditorRemoteData();
    });
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
    if (staffGrid) {
      staffGrid.innerHTML = staff.map((person) => staffCardHtml(person, person.role)).join("");
      activateStaffImageFallback(staffGrid);
    }
    renderGallery();
    const teacherGrid = document.querySelector("#teacher-grid");
    if (teacherGrid) {
      teacherGrid.innerHTML = teachers.map((person) => staffCardHtml(person, person.subject)).join("");
      activateStaffImageFallback(teacherGrid);
    }
  }

  function sendSessionClose() {
    if (!realtimeIsConfigured() || !navigator.sendBeacon || currentVisitorRole === "editor") return;
    const studentIdentity = loadStudentIdentity();
    const teacherIdentity = loadTeacherIdentity();
    const teacherVisit = currentVisitorRole === "guru";
    const identity = teacherVisit
      ? { name: teacherIdentity.name, attendance: "", className: "", workUnit: teacherIdentity.workUnit, nip: teacherIdentity.nip }
      : { ...studentIdentity, workUnit: "", nip: "" };
    const accessContext = loadAccessContext();
    const payload = {
      type: "access",
      timestamp: new Date().toISOString(),
      sessionId: getAccessSessionId(),
      sessionStartedAt: new Date(sessionStartedAt).toISOString(),
      name: identity.name || "",
      attendance: identity.attendance || "",
      className: identity.className || "",
      visitorRole: currentVisitorRole,
      workUnit: identity.workUnit || "",
      nip: identity.nip || "",
      action: "session_close",
      page: location.pathname || "/",
      resourceType: activeResource.type,
      resourceId: activeResource.id,
      resourceTitle: activeResource.title,
      durationSeconds: resourceDurationSeconds(),
      locationLabel: accessContext.locationLabel || "",
      latitude: accessContext.permissionGranted ? accessContext.latitude || "" : "",
      longitude: accessContext.permissionGranted ? accessContext.longitude || "" : "",
      accuracy: accessContext.permissionGranted ? accessContext.accuracy || "" : "",
    };
    navigator.sendBeacon(appConfig.realtimeEndpoint, new Blob([JSON.stringify(payload)], { type: "text/plain;charset=utf-8" }));
  }

  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator) || location.protocol === "file:") return null;
    try {
      serviceWorkerRegistration = await navigator.serviceWorker.register("service-worker.js?v=19");
      await serviceWorkerRegistration.update();
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
  renderKhutbahCatalog();
  renderTajwidAcademy();
  renderDailyInsight();
  renderSchoolProfile();
  const galleryAdmin = document.querySelector("#gallery-admin");
  const editorPanel = document.querySelector("#panel-editor");
  if (galleryAdmin && editorPanel) editorPanel.append(galleryAdmin);
  applyHomepageCopy();
  renderPublicFeedback();
  renderVisitorStats();
  renderRecentTeacherVisits();
  attachFeedbackForm();
  attachEditorControls();
  attachGalleryAdmin();
  attachAutomaticLocationStatus();
  loadOnlineGallery();
  loadPublicFeedback();
  loadPublicContent();
  refreshPublicStats();
  postRealtimeEvent("access", { action: "site_open", visitorRole: currentVisitorRole });
  window.setInterval(() => {
    if (document.visibilityState !== "visible") return;
    postRealtimeEvent("access", {
      action: "heartbeat",
      resourceType: activeResource.type,
      resourceId: activeResource.id,
      resourceTitle: activeResource.title,
      durationSeconds: resourceDurationSeconds(),
    });
    activeResource.startedAt = Date.now();
  }, 60000);
  window.setInterval(() => {
    renderRecentTeacherVisits();
    refreshPublicStats();
  }, 60000);
  window.addEventListener("pagehide", sendSessionClose);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      postRealtimeEvent("access", {
        action: "visibility_pause",
        resourceType: activeResource.type,
        resourceId: activeResource.id,
        resourceTitle: activeResource.title,
        durationSeconds: resourceDurationSeconds(),
      });
    }
    activeResource.startedAt = Date.now();
  });
  registerServiceWorker();
}
