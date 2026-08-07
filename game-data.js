(() => {
  const concepts = [
    {
      term: "Al Qur'an",
      meaning: "Wahyu Alloh Subhanahu Wata'ala yang menjadi sumber utama ajaran Islam.",
      application: "Membaca ayat, memahami makna, dan membiasakan petunjuknya dalam kehidupan.",
      misconception: "Al Qur'an cukup dibaca tanpa perlu dipahami dan diamalkan.",
      dalil: "Al Qur'an Surat Al-Baqarah ayat 2",
      sequence: "Baca ayat–pahami terjemah–pelajari penjelasan–terapkan petunjuk",
      scenario: "Murid membaca ayat tentang kejujuran tetapi tergoda menyalin tugas temannya.",
      action: "Menolak menyalin, mengerjakan sendiri, dan menjadikan ayat sebagai pedoman tindakan.",
    },
    {
      term: "Hadits",
      meaning: "Keterangan yang dinisbatkan kepada Nabi Muhammad Sholallohu 'Alaihi Wasallam berupa ucapan, perbuatan, ketetapan, atau sifat.",
      application: "Memeriksa sumber Hadits Riwayat dan memahami penjelasannya sebelum menyampaikan.",
      misconception: "Setiap kalimat yang tersebar dengan label hadits pasti sahih.",
      dalil: "Al Qur'an Surat An-Nisa' ayat 59",
      sequence: "Temukan riwayat–periksa sumber–pahami konteks–ambil pelajaran",
      scenario: "Pesan berantai memuat sebuah kalimat yang disebut hadits tanpa sumber.",
      action: "Menahan penyebaran, mencari sumber Hadits Riwayat, dan bertanya kepada guru.",
    },
    {
      term: "Tabayun",
      meaning: "Memeriksa kebenaran berita sebelum mempercayai, menyimpulkan, atau menyebarkannya.",
      application: "Memeriksa sumber, bukti, konteks, dan pihak terkait secara santun.",
      misconception: "Berita dari teman dekat tidak perlu diperiksa lagi.",
      dalil: "Al Qur'an Surat Al-Hujurat ayat 6",
      sequence: "Tahan penyebaran–periksa sumber–bandingkan bukti–simpulkan",
      scenario: "Kabar buruk tentang teman beredar di grup kelas tanpa bukti.",
      action: "Tidak ikut menyebarkan, memeriksa kebenaran, dan menjaga kehormatan pihak terkait.",
    },
    {
      term: "Amanah",
      meaning: "Menjaga dan menunaikan tanggung jawab atau titipan secara benar.",
      application: "Melaksanakan piket, menjaga barang titipan, dan menyelesaikan tugas dengan jujur.",
      misconception: "Amanah hanya berlaku untuk barang, bukan tugas dan informasi.",
      dalil: "Al Qur'an Surat An-Nisa' ayat 58",
      sequence: "Pahami tanggung jawab–rencanakan–laksanakan–laporkan dengan jujur",
      scenario: "Seorang murid menemukan dompet di ruang kelas.",
      action: "Menjaga dompet dan menyerahkannya kepada guru atau petugas agar kembali kepada pemilik.",
    },
    {
      term: "Jujur",
      meaning: "Selaras antara kenyataan, perkataan, dan perbuatan.",
      application: "Mengakui proses kerja, mencantumkan sumber, dan tidak memalsukan hasil.",
      misconception: "Berbohong boleh dilakukan selama tidak diketahui orang lain.",
      dalil: "Al Qur'an Surat At-Taubah ayat 119",
      sequence: "Ketahui fakta–sampaikan apa adanya–akui kekurangan–perbaiki",
      scenario: "Murid belum mengerjakan tugas ketika guru menanyakan hasilnya.",
      action: "Mengakui keadaan dengan jujur, meminta waktu secara santun, lalu menyelesaikan tanggung jawab.",
    },
    {
      term: "Tawakal",
      meaning: "Menyerahkan hasil kepada Alloh Subhanahu Wata'ala setelah melakukan ikhtiar yang benar.",
      application: "Belajar teratur, berdoa, mengikuti ujian dengan jujur, lalu menerima hasil sambil mengevaluasi.",
      misconception: "Tawakal berarti menunggu hasil tanpa melakukan usaha.",
      dalil: "Al Qur'an Surat Ali 'Imran ayat 159",
      sequence: "Tentukan tujuan–lakukan ikhtiar–berdoa–serahkan hasil",
      scenario: "Murid ingin memperoleh hasil baik dalam penilaian akhir.",
      action: "Membuat jadwal belajar, berlatih, berdoa, dan mengikuti penilaian dengan jujur.",
    },
    {
      term: "Syukur",
      meaning: "Mengakui nikmat Alloh Subhanahu Wata'ala dengan hati, lisan, dan penggunaan nikmat untuk kebaikan.",
      application: "Mengucapkan hamdalah, menjaga nikmat, dan membagikan manfaat kepada sesama.",
      misconception: "Syukur cukup diucapkan tanpa perlu menjaga atau menggunakan nikmat dengan baik.",
      dalil: "Al Qur'an Surat Ibrahim ayat 7",
      sequence: "Sadari nikmat–puji Alloh Subhanahu Wata'ala–gunakan dengan baik–berbagi manfaat",
      scenario: "Murid memperoleh perangkat belajar baru.",
      action: "Merawat perangkat, memakainya untuk belajar, dan membantu teman sesuai kemampuan.",
    },
    {
      term: "Sabar",
      meaning: "Teguh dalam ketaatan, menahan diri dari keburukan, dan tabah menghadapi ujian.",
      application: "Tetap tertib belajar, mengendalikan emosi, serta mencari solusi yang baik.",
      misconception: "Sabar berarti diam dan membiarkan semua kesalahan terjadi.",
      dalil: "Al Qur'an Surat Al-Baqarah ayat 153",
      sequence: "Tenangkan diri–kenali masalah–pilih tindakan benar–bertahan memperbaiki",
      scenario: "Teman mengejek hasil karya seorang murid di depan kelas.",
      action: "Mengendalikan diri, menanggapi dengan santun, dan meminta bantuan guru bila diperlukan.",
    },
    {
      term: "Toleransi",
      meaning: "Menghormati perbedaan dan berlaku adil tanpa mencampuradukkan keyakinan.",
      application: "Memberi ruang orang lain menjalankan keyakinannya dan bekerja sama dalam kebaikan bersama.",
      misconception: "Toleransi mengharuskan seseorang membenarkan semua keyakinan.",
      dalil: "Al Qur'an Surat Al-Kafirun ayat 6",
      sequence: "Kenali perbedaan–jaga batas keyakinan–hormati hak–bekerja sama dalam kebaikan",
      scenario: "Kelas memiliki anggota dengan latar belakang agama yang berbeda.",
      action: "Menghormati ibadah masing-masing dan bekerja sama secara adil dalam kegiatan sosial.",
    },
    {
      term: "Khalifah di bumi",
      meaning: "Amanah manusia untuk mengelola bumi secara bertanggung jawab dan menghadirkan kemaslahatan.",
      application: "Mengurangi sampah, menjaga air, merawat tanaman, dan mencegah kerusakan.",
      misconception: "Manusia bebas menghabiskan sumber daya karena menjadi penguasa bumi.",
      dalil: "Al Qur'an Surat Al-Baqarah ayat 30",
      sequence: "Kenali amanah–ukur dampak–pilih cara berkelanjutan–evaluasi",
      scenario: "Setelah kegiatan sekolah, banyak sampah plastik tertinggal.",
      action: "Mengajak memilah dan membersihkan sampah serta memperbaiki sistem kegiatan berikutnya.",
    },
    {
      term: "Sholat",
      meaning: "Ibadah dengan ucapan dan gerakan tertentu yang dimulai dengan takbir dan diakhiri dengan salam.",
      application: "Menjaga waktu, syarat, rukun, kekhusyukan, dan pengaruh sholat pada akhlak.",
      misconception: "Sholat tidak memiliki hubungan dengan perilaku sehari-hari.",
      dalil: "Al Qur'an Surat Al-'Ankabut ayat 45",
      sequence: "Pastikan waktu–bersuci–tutup aurat dan menghadap kiblat–laksanakan rukun dengan tertib",
      scenario: "Waktu sholat hampir berakhir ketika murid masih bermain.",
      action: "Menghentikan permainan, bersuci, dan menunaikan sholat tepat waktu.",
    },
    {
      term: "Dzikir",
      meaning: "Mengingat Alloh Subhanahu Wata'ala melalui bacaan yang disyariatkan serta kesadaran hati.",
      application: "Membaca dzikir pagi dan petang dengan tertib sambil memahami maknanya.",
      misconception: "Dzikir hanya dilakukan ketika sedang memiliki masalah.",
      dalil: "Al Qur'an Surat Ar-Ra'd ayat 28",
      sequence: "Pelajari bacaan–pahami makna–baca sesuai tuntunan–jaga konsistensi",
      scenario: "Murid ingin membangun rutinitas dzikir pagi.",
      action: "Memilih bacaan bersumber, memahami arti, dan menjadwalkannya secara konsisten.",
    },
    {
      term: "Puasa",
      meaning: "Menahan diri dari hal yang membatalkan sejak terbit fajar sampai terbenam matahari disertai niat.",
      application: "Menjaga makan, minum, lisan, emosi, dan amal kebaikan selama berpuasa.",
      misconception: "Puasa hanya menahan lapar dan haus.",
      dalil: "Al Qur'an Surat Al-Baqarah ayat 183",
      sequence: "Niat–mulai sejak fajar–jaga diri dan amal–berbuka saat Maghrib",
      scenario: "Murid berpuasa tetapi mudah mengejek teman.",
      action: "Menahan lisan, meminta maaf, dan menjadikan puasa sebagai latihan takwa.",
    },
    {
      term: "Zakat",
      meaning: "Harta tertentu yang wajib dikeluarkan dengan syarat dan kepada golongan penerima tertentu.",
      application: "Menghitung kewajiban secara benar dan menyalurkannya melalui pihak terpercaya.",
      misconception: "Zakat sama dengan semua bentuk pemberian sukarela.",
      dalil: "Al Qur'an Surat At-Taubah ayat 60",
      sequence: "Kenali jenis harta–periksa syarat–hitung kadar–salurkan kepada yang berhak",
      scenario: "Keluarga hendak menunaikan zakat tetapi belum memahami perhitungannya.",
      action: "Mempelajari ketentuan dan berkonsultasi dengan amil atau guru yang kompeten.",
    },
    {
      term: "Rukhsah",
      meaning: "Keringanan syariat karena sebab yang diakui dengan ketentuan tertentu.",
      application: "Menggunakan kemudahan ibadah sesuai keadaan tanpa meremehkan kewajiban.",
      misconception: "Rukhsah dapat dibuat sendiri hanya karena merasa malas.",
      dalil: "Al Qur'an Surat Al-Baqarah ayat 185",
      sequence: "Kenali keadaan–pelajari ketentuan–pastikan sebab–laksanakan keringanan secara tepat",
      scenario: "Seorang musafir belum memahami cara menjamak sholat.",
      action: "Mempelajari syarat dan tata cara dari sumber tepercaya sebelum melaksanakannya.",
    },
    {
      term: "Muamalah",
      meaning: "Aturan hubungan dan transaksi antarmanusia agar berlangsung adil, jelas, dan saling ridha.",
      application: "Menjelaskan kondisi barang, harga, akad, dan hak para pihak secara jujur.",
      misconception: "Transaksi dianggap benar selama menghasilkan keuntungan.",
      dalil: "Al Qur'an Surat An-Nisa' ayat 29",
      sequence: "Jelaskan objek–sepakati harga dan akad–pastikan kerelaan–tunaikan hak",
      scenario: "Penjual mengetahui barang yang dijual memiliki cacat tersembunyi.",
      action: "Menjelaskan cacat dengan jujur agar pembeli dapat memutuskan secara sadar.",
    },
    {
      term: "Menuntut ilmu",
      meaning: "Proses mencari pengetahuan yang benar dengan niat, adab, ketekunan, dan pengamalan.",
      application: "Mendengarkan guru, mencatat sumber, bertanya santun, berlatih, dan merefleksi.",
      misconception: "Ilmu cukup dikumpulkan untuk mendapat nilai tanpa perlu membentuk akhlak.",
      dalil: "Al Qur'an Surat Al-Mujadilah ayat 11",
      sequence: "Luruskan niat–pelajari sumber–berlatih–amalkan dan bagikan manfaat",
      scenario: "Murid belum memahami penjelasan walaupun sudah membaca materi.",
      action: "Mencatat bagian sulit, bertanya dengan santun, dan berlatih kembali.",
    },
    {
      term: "Muhasabah",
      meaning: "Menilai diri dan amal secara jujur untuk melakukan perbaikan.",
      application: "Mencatat kemajuan, mengakui kekurangan, dan menyusun langkah perbaikan.",
      misconception: "Muhasabah berarti sibuk mencari kesalahan orang lain.",
      dalil: "Al Qur'an Surat Al-Hasyr ayat 18",
      sequence: "Tinjau tindakan–akui kekurangan–tentukan perbaikan–laksanakan",
      scenario: "Nilai latihan murid menurun selama dua pekan.",
      action: "Menilai pola belajar, mencari penyebab, meminta masukan, dan memperbaiki jadwal.",
    },
    {
      term: "Tobat",
      meaning: "Kembali kepada Alloh Subhanahu Wata'ala dengan meninggalkan dosa, menyesal, dan bertekad memperbaiki.",
      application: "Menghentikan kesalahan, memohon ampun, tidak mengulangi, dan memulihkan hak orang lain.",
      misconception: "Tobat cukup diucapkan meskipun kesalahan sengaja terus dilakukan.",
      dalil: "Al Qur'an Surat At-Tahrim ayat 8",
      sequence: "Berhenti–menyesal–memohon ampun–bertekad dan memulihkan hak",
      scenario: "Murid menyebarkan foto temannya tanpa izin dan membuatnya malu.",
      action: "Menghapus unggahan, meminta maaf, memulihkan dampak, dan tidak mengulanginya.",
    },
    {
      term: "Adab digital",
      meaning: "Sikap bertanggung jawab, jujur, santun, aman, dan menghormati hak saat memakai teknologi.",
      application: "Menjaga privasi, mencantumkan sumber, memeriksa informasi, dan menghindari perundungan.",
      misconception: "Perbuatan di internet tidak perlu dipertanggungjawabkan karena tidak terjadi secara langsung.",
      dalil: "Al Qur'an Surat Qaf ayat 18",
      sequence: "Pikirkan tujuan–periksa isi–ukur dampak–unggah secara bertanggung jawab",
      scenario: "Murid hendak mengunggah foto kelompok yang menampilkan data pribadi teman.",
      action: "Meminta izin, menyamarkan data pribadi, dan memastikan unggahan tidak merugikan.",
    },
  ];

  const rotateOptions = (correct, distractors, index) => {
    const options = [correct, ...distractors.slice(0, 3)];
    const shift = index % options.length;
    const rotated = options.slice(shift).concat(options.slice(0, shift));
    return [rotated, rotated.indexOf(correct)];
  };

  const bank = {
    quiz: concepts.map((item, index) => {
      const others = concepts.filter((_, otherIndex) => otherIndex !== index).slice(index % 7, (index % 7) + 3).map((entry) => entry.term);
      const [options, answer] = rotateOptions(item.term, others, index);
      return [`Istilah yang tepat untuk pengertian “${item.meaning}” ialah …`, options, answer, `${item.term}: ${item.meaning}`];
    }),
    match: concepts.map((item, index) => {
      const others = concepts.filter((_, otherIndex) => otherIndex !== index).slice((index + 4) % 9, ((index + 4) % 9) + 3).map((entry) => entry.meaning);
      const [options, answer] = rotateOptions(item.meaning, others, index + 1);
      return [`Pasangkan istilah “${item.term}” dengan makna yang tepat.`, options, answer, `${item.term} berarti ${item.meaning}`];
    }),
    sequence: concepts.map((item, index) => {
      const incorrect = [
        "Simpulkan–bertindak–baru mencari sumber–abaikan evaluasi",
        "Tunda–ikuti kebiasaan–salin hasil–selesai",
        "Bertindak tergesa-gesa–menyalahkan–menutup diri–mengulang",
      ];
      const [options, answer] = rotateOptions(item.sequence, incorrect, index + 2);
      return [`Urutan penerapan ${item.term} yang paling bertanggung jawab ialah …`, options, answer, `Urutan yang tepat: ${item.sequence}.`];
    }),
    truefalse: concepts.map((item, index) => {
      const trueStatement = `${item.term} dapat diterapkan dengan cara ${item.application.charAt(0).toLowerCase()}${item.application.slice(1)}`;
      const statement = index % 2 === 0 ? item.misconception : trueStatement;
      const answer = index % 2 === 0 ? 1 : 0;
      return [`“${statement}” Pernyataan ini …`, ["Benar", "Perlu diluruskan"], answer, answer === 0 ? `Benar. ${item.application}` : `Perlu diluruskan. ${item.application}`];
    }),
    dalil: concepts.map((item, index) => {
      const others = concepts.filter((_, otherIndex) => otherIndex !== index).slice((index + 7) % 11, ((index + 7) % 11) + 3).map((entry) => entry.dalil);
      const [options, answer] = rotateOptions(item.dalil, others, index + 3);
      return [`Dalil yang paling relevan untuk menguatkan tema ${item.term} ialah …`, options, answer, `${item.dalil} menjadi salah satu rujukan pokok tema ${item.term}.`];
    }),
    scenario: concepts.map((item, index) => {
      const incorrect = [
        "Mengabaikan keadaan dan menunggu orang lain menyelesaikannya.",
        "Menyebarkan masalah agar mendapat perhatian lebih banyak.",
        "Bertindak tergesa-gesa tanpa memeriksa akibatnya.",
      ];
      const [options, answer] = rotateOptions(item.action, incorrect, index);
      return [`${item.scenario} Tindakan terbaik ialah …`, options, answer, item.action];
    }),
  };

  const factQuestion = ([question, correct, distractors, explanation], index) => {
    const [options, answer] = rotateOptions(correct, distractors, index);
    return [question, options, answer, explanation];
  };

  const prophetFacts = [
    ["Nabi pertama dan manusia pertama adalah …", "Nabi Adam 'Alaihissalam", ["Nabi Nuh 'Alaihissalam", "Nabi Ibrahim 'Alaihissalam", "Nabi Musa 'Alaihissalam"], "Nabi Adam 'Alaihissalam merupakan nabi dan manusia pertama."],
    ["Nabi yang berdakwah sangat lama dan membuat bahtera atas perintah Alloh Subhanahu Wata'ala adalah …", "Nabi Nuh 'Alaihissalam", ["Nabi Hud 'Alaihissalam", "Nabi Shalih 'Alaihissalam", "Nabi Yunus 'Alaihissalam"], "Nabi Nuh 'Alaihissalam membuat bahtera sebagai bagian dari perintah Alloh Subhanahu Wata'ala."],
    ["Nabi yang dikenal sebagai khalilullah dan menjadi teladan tauhid adalah …", "Nabi Ibrahim 'Alaihissalam", ["Nabi Ismail 'Alaihissalam", "Nabi Ishaq 'Alaihissalam", "Nabi Ya'qub 'Alaihissalam"], "Nabi Ibrahim 'Alaihissalam dikenal sebagai khalilullah dan teladan keteguhan tauhid."],
    ["Nabi yang membantu Nabi Ibrahim 'Alaihissalam meninggikan fondasi Ka'bah adalah …", "Nabi Ismail 'Alaihissalam", ["Nabi Ishaq 'Alaihissalam", "Nabi Yusuf 'Alaihissalam", "Nabi Harun 'Alaihissalam"], "Nabi Ismail 'Alaihissalam membantu Nabi Ibrahim 'Alaihissalam membangun Ka'bah."],
    ["Nabi yang menghadapi ujian sumur, perbudakan, dan penjara sebelum menjadi pejabat di Mesir adalah …", "Nabi Yusuf 'Alaihissalam", ["Nabi Ayyub 'Alaihissalam", "Nabi Yunus 'Alaihissalam", "Nabi Zakariya 'Alaihissalam"], "Kisah Nabi Yusuf 'Alaihissalam mengajarkan kesabaran, kehormatan diri, dan pemaafan."],
    ["Nabi yang menerima Kitab Taurat adalah …", "Nabi Musa 'Alaihissalam", ["Nabi Dawud 'Alaihissalam", "Nabi Isa 'Alaihissalam", "Nabi Muhammad Sholallohu 'Alaihi Wasallam"], "Kitab Taurat diturunkan kepada Nabi Musa 'Alaihissalam."],
    ["Nabi yang mendampingi Nabi Musa 'Alaihissalam menghadapi Fir'aun adalah …", "Nabi Harun 'Alaihissalam", ["Nabi Ilyas 'Alaihissalam", "Nabi Ilyasa 'Alaihissalam", "Nabi Luth 'Alaihissalam"], "Nabi Harun 'Alaihissalam menjadi pendamping dakwah Nabi Musa 'Alaihissalam."],
    ["Nabi yang menerima Kitab Zabur adalah …", "Nabi Dawud 'Alaihissalam", ["Nabi Sulaiman 'Alaihissalam", "Nabi Isa 'Alaihissalam", "Nabi Idris 'Alaihissalam"], "Kitab Zabur diturunkan kepada Nabi Dawud 'Alaihissalam."],
    ["Nabi yang diberi kerajaan besar dan kemampuan memahami bahasa makhluk adalah …", "Nabi Sulaiman 'Alaihissalam", ["Nabi Dawud 'Alaihissalam", "Nabi Ayyub 'Alaihissalam", "Nabi Yahya 'Alaihissalam"], "Nabi Sulaiman 'Alaihissalam diberi kerajaan dan berbagai karunia yang digunakan dalam ketaatan."],
    ["Nabi yang berdoa dari dalam perut ikan adalah …", "Nabi Yunus 'Alaihissalam", ["Nabi Zakariya 'Alaihissalam", "Nabi Shalih 'Alaihissalam", "Nabi Hud 'Alaihissalam"], "Nabi Yunus 'Alaihissalam berdoa dan bertasbih ketika berada dalam perut ikan."],
    ["Nabi yang menjadi teladan kesabaran ketika mengalami sakit dan kehilangan adalah …", "Nabi Ayyub 'Alaihissalam", ["Nabi Yusuf 'Alaihissalam", "Nabi Yunus 'Alaihissalam", "Nabi Idris 'Alaihissalam"], "Nabi Ayyub 'Alaihissalam tetap sabar dan kembali kepada Alloh Subhanahu Wata'ala."],
    ["Nabi yang berdoa memohon keturunan pada usia lanjut dan dikaruniai Nabi Yahya 'Alaihissalam adalah …", "Nabi Zakariya 'Alaihissalam", ["Nabi Ya'qub 'Alaihissalam", "Nabi Ishaq 'Alaihissalam", "Nabi Luth 'Alaihissalam"], "Nabi Zakariya 'Alaihissalam berdoa dengan penuh harap dan dikaruniai Nabi Yahya 'Alaihissalam."],
    ["Nabi yang menerima Kitab Injil adalah …", "Nabi Isa 'Alaihissalam", ["Nabi Musa 'Alaihissalam", "Nabi Dawud 'Alaihissalam", "Nabi Muhammad Sholallohu 'Alaihi Wasallam"], "Kitab Injil diturunkan kepada Nabi Isa 'Alaihissalam."],
    ["Nabi dan rasul terakhir yang menerima Al Qur'an adalah …", "Nabi Muhammad Sholallohu 'Alaihi Wasallam", ["Nabi Isa 'Alaihissalam", "Nabi Musa 'Alaihissalam", "Nabi Ibrahim 'Alaihissalam"], "Nabi Muhammad Sholallohu 'Alaihi Wasallam adalah penutup para nabi dan rasul."],
    ["Sahabat yang menjadi khalifah pertama setelah wafatnya Nabi Muhammad Sholallohu 'Alaihi Wasallam adalah …", "Abu Bakar Ash-Shiddiq", ["Umar bin Khattab", "Utsman bin Affan", "Ali bin Abi Thalib"], "Abu Bakar Ash-Shiddiq menjadi khalifah pertama dalam Khulafaur Rasyidin."],
    ["Khalifah kedua yang dikenal tegas dalam keadilan adalah …", "Umar bin Khattab", ["Abu Bakar Ash-Shiddiq", "Utsman bin Affan", "Ali bin Abi Thalib"], "Umar bin Khattab menjadi khalifah kedua dan dikenal menjaga keadilan."],
    ["Khalifah yang memimpin standardisasi mushaf Al Qur'an adalah …", "Utsman bin Affan", ["Abu Bakar Ash-Shiddiq", "Umar bin Khattab", "Ali bin Abi Thalib"], "Pada masa Utsman bin Affan, mushaf distandardisasi dan disebarkan ke berbagai wilayah."],
    ["Sepupu sekaligus menantu Nabi Muhammad Sholallohu 'Alaihi Wasallam yang menjadi khalifah keempat adalah …", "Ali bin Abi Thalib", ["Abu Bakar Ash-Shiddiq", "Umar bin Khattab", "Utsman bin Affan"], "Ali bin Abi Thalib menjadi khalifah keempat dalam Khulafaur Rasyidin."],
    ["Ulama penyusun kitab Shahih Al-Bukhari adalah …", "Imam Al-Bukhari", ["Imam Muslim", "Imam Abu Dawud", "Imam At-Tirmidzi"], "Imam Al-Bukhari menyusun salah satu kitab Hadits Riwayat paling dikenal, Shahih Al-Bukhari."],
    ["Ulama penyusun kitab Shahih Muslim adalah …", "Imam Muslim", ["Imam Al-Bukhari", "Imam An-Nasa'i", "Imam Ibnu Majah"], "Imam Muslim menyusun kitab Shahih Muslim dengan metode periwayatan yang ketat."],
  ];

  const historyFacts = [
    ["Perpindahan Nabi Muhammad Sholallohu 'Alaihi Wasallam dari Makkah ke Madinah disebut …", "Hijrah", ["Isra", "Mi'raj", "Fathu Makkah"], "Hijrah menjadi tonggak pembentukan masyarakat Muslim di Madinah."],
    ["Masjid yang dibangun dalam perjalanan hijrah dan dikenal sebagai masjid pertama ialah …", "Masjid Quba", ["Masjidil Haram", "Masjid Al-Aqsha", "Masjid Qiblatain"], "Masjid Quba dibangun ketika Nabi Muhammad Sholallohu 'Alaihi Wasallam tiba di wilayah Quba."],
    ["Kesepakatan yang mengatur kehidupan bersama masyarakat Madinah dikenal sebagai …", "Piagam Madinah", ["Perjanjian Hudaibiyah", "Baiat Aqabah", "Deklarasi Arafah"], "Piagam Madinah memuat pengaturan hidup bersama kelompok-kelompok di Madinah."],
    ["Perang besar pertama kaum Muslim setelah hijrah adalah …", "Perang Badar", ["Perang Uhud", "Perang Khandaq", "Perang Hunain"], "Perang Badar merupakan peristiwa penting pada masa awal Madinah."],
    ["Peristiwa yang mengajarkan pentingnya menaati arahan pemimpin pasukan pemanah adalah …", "Perang Uhud", ["Perang Badar", "Fathu Makkah", "Perang Tabuk"], "Perang Uhud mengajarkan disiplin, kesabaran, dan akibat mengabaikan arahan."],
    ["Strategi menggali parit diterapkan dalam …", "Perang Khandaq", ["Perang Badar", "Perang Uhud", "Perang Hunain"], "Parit digunakan sebagai strategi pertahanan Madinah dalam Perang Khandaq."],
    ["Perjanjian yang membuka jalan dakwah damai sebelum Fathu Makkah adalah …", "Perjanjian Hudaibiyah", ["Piagam Madinah", "Baiat Ridwan", "Perjanjian Aqabah Pertama"], "Perjanjian Hudaibiyah menunjukkan kebijaksanaan, kesabaran, dan pandangan jauh."],
    ["Pembebasan Kota Makkah dikenal dengan istilah …", "Fathu Makkah", ["Hijrah", "Isra", "Haji Wada"], "Fathu Makkah memperlihatkan pemaafan dan penghormatan terhadap manusia."],
    ["Empat khalifah awal setelah Nabi Muhammad Sholallohu 'Alaihi Wasallam disebut …", "Khulafaur Rasyidin", ["Bani Umayyah", "Bani Abbasiyah", "Dinasti Ayyubiyah"], "Khulafaur Rasyidin terdiri atas Abu Bakar, Umar, Utsman, dan Ali."],
    ["Pusat pemerintahan Daulah Umayyah berada di …", "Damaskus", ["Baghdad", "Kairo", "Cordoba"], "Damaskus menjadi pusat pemerintahan Daulah Umayyah."],
    ["Pusat pemerintahan Daulah Abbasiyah yang berkembang sebagai kota ilmu adalah …", "Baghdad", ["Madinah", "Damaskus", "Isfahan"], "Baghdad berkembang sebagai pusat pemerintahan dan ilmu pada masa Abbasiyah."],
    ["Lembaga ilmu yang dikenal berkembang pada masa Abbasiyah adalah …", "Baitul Hikmah", ["Darun Nadwah", "Suffah", "Nizam Al-Mulk"], "Baitul Hikmah dikenal sebagai pusat kegiatan ilmu dan penerjemahan."],
    ["Wilayah Muslim di Semenanjung Iberia dikenal sebagai …", "Andalusia", ["Anatolia", "Maghrib", "Khurasan"], "Andalusia menjadi salah satu pusat peradaban dan ilmu Islam."],
    ["Kota yang dikenal sebagai pusat penting peradaban Islam di Andalusia adalah …", "Cordoba", ["Makkah", "Baghdad", "Bukhara"], "Cordoba berkembang dalam pendidikan, arsitektur, dan ilmu pengetahuan."],
    ["Kota Konstantinopel ditaklukkan pada masa Daulah Usmani oleh …", "Sultan Muhammad Al-Fatih", ["Sultan Salahuddin Al-Ayyubi", "Harun Ar-Rasyid", "Umar bin Abdul Aziz"], "Sultan Muhammad Al-Fatih memimpin penaklukan Konstantinopel."],
    ["Daulah Safawi berkembang terutama di wilayah …", "Persia", ["Andalusia", "Mesir", "Hijaz"], "Daulah Safawi berkembang di wilayah Persia."],
    ["Daulah Mughal berkembang terutama di wilayah …", "India", ["Afrika Utara", "Syam", "Anatolia"], "Daulah Mughal berkembang di anak benua India."],
    ["Kerajaan Islam yang sering disebut sebagai salah satu kerajaan Islam awal di Nusantara adalah …", "Samudra Pasai", ["Majapahit", "Sriwijaya", "Kutai"], "Samudra Pasai dikenal sebagai salah satu pusat Islam awal di Nusantara."],
    ["Kesultanan yang menjadi pusat penyebaran Islam di Jawa pada abad ke-15 dan ke-16 ialah …", "Kesultanan Demak", ["Kesultanan Samudra Pasai", "Kesultanan Ternate", "Kesultanan Banjar"], "Kesultanan Demak berperan dalam perkembangan Islam di Jawa."],
    ["Tokoh-tokoh dakwah yang dikenal berperan dalam penyebaran Islam di Jawa disebut …", "Wali Songo", ["Khulafaur Rasyidin", "Ahlus Suffah", "Muhajirin"], "Wali Songo dikenal menggunakan pendekatan dakwah yang dekat dengan masyarakat."],
  ];

  const fiqhFacts = [
    ["Bersuci dari hadats kecil pada keadaan normal dilakukan dengan …", "Wudhu", ["Tayamum", "Mandi wajib", "Istinja saja"], "Wudhu menjadi cara bersuci dari hadats kecil ketika air tersedia dan dapat digunakan."],
    ["Tayamum dapat dilakukan ketika …", "Air tidak tersedia atau tidak dapat digunakan karena alasan yang dibenarkan", ["Sedang terburu-buru bermain", "Tidak ingin terkena air", "Lupa membawa handuk"], "Tayamum merupakan keringanan dengan sebab dan tata cara yang ditentukan."],
    ["Sholat wajib dalam sehari semalam berjumlah …", "Lima waktu", ["Tiga waktu", "Empat waktu", "Enam waktu"], "Sholat wajib sehari semalam terdiri atas Subuh, Dzuhur, Ashar, Maghrib, dan Isya."],
    ["Jumlah rakaat sholat Subuh adalah …", "Dua rakaat", ["Tiga rakaat", "Empat rakaat", "Lima rakaat"], "Sholat Subuh terdiri atas dua rakaat."],
    ["Jumlah rakaat sholat Maghrib adalah …", "Tiga rakaat", ["Dua rakaat", "Empat rakaat", "Lima rakaat"], "Sholat Maghrib terdiri atas tiga rakaat."],
    ["Sujud yang dilakukan karena kelupaan tertentu dalam sholat disebut …", "Sujud sahwi", ["Sujud syukur", "Sujud tilawah", "Sujud biasa"], "Sujud sahwi berkaitan dengan sebab kelupaan tertentu dalam sholat."],
    ["Sujud ketika membaca atau mendengar ayat sajdah disebut …", "Sujud tilawah", ["Sujud sahwi", "Sujud syukur", "Sujud rukun"], "Sujud tilawah berkaitan dengan ayat sajdah."],
    ["Sujud sebagai ungkapan syukur atas nikmat atau keselamatan disebut …", "Sujud syukur", ["Sujud tilawah", "Sujud sahwi", "Sujud qiraah"], "Sujud syukur merupakan salah satu bentuk ungkapan syukur."],
    ["Menggabungkan dua sholat wajib dalam satu waktu disebut …", "Jamak", ["Qashar", "Qadha", "I'adah"], "Jamak menggabungkan dua sholat tertentu dengan sebab dan ketentuan."],
    ["Meringkas sholat empat rakaat menjadi dua rakaat bagi musafir yang memenuhi syarat disebut …", "Qashar", ["Jamak", "Qadha", "I'adah"], "Qashar merupakan keringanan bagi musafir dengan ketentuan."],
    ["Puasa wajib pada bulan Ramadhan dimulai sejak …", "Terbit fajar", ["Matahari terbit", "Waktu Dzuhur", "Setelah sahur selesai tanpa melihat waktu"], "Puasa dimulai sejak terbit fajar dan berakhir saat matahari terbenam."],
    ["Puasa sunnah pada tanggal 9 Dzulhijjah bagi orang yang tidak berhaji disebut …", "Puasa Arafah", ["Puasa Asyura", "Puasa Syawal", "Puasa Ayyamul Bidh"], "Puasa Arafah dilakukan pada 9 Dzulhijjah bagi yang tidak sedang berhaji."],
    ["Puasa sunnah pada tanggal 10 Muharram disebut …", "Puasa Asyura", ["Puasa Arafah", "Puasa Syawal", "Puasa Senin"], "Puasa Asyura dilakukan pada 10 Muharram dan dianjurkan disertai hari lain sesuai tuntunan."],
    ["Zakat fitrah ditunaikan berkaitan dengan …", "Akhir Ramadhan menjelang Idul Fitri", ["Awal Muharram", "Idul Adha saja", "Setiap awal bulan"], "Zakat fitrah berkaitan dengan akhir Ramadhan dan memiliki batas waktu penunaian."],
    ["Pihak yang bertugas mengelola zakat disebut …", "Amil", ["Muzakki", "Mustahik", "Muallaf"], "Amil bertugas dalam pengelolaan zakat sesuai ketentuan."],
    ["Orang yang menunaikan zakat disebut …", "Muzakki", ["Amil", "Mustahik", "Gharim"], "Muzakki adalah orang yang menunaikan zakat."],
    ["Penyembelihan hewan sebagai ibadah pada Idul Adha dan hari tasyrik disebut …", "Kurban", ["Akikah", "Dam", "Walimah"], "Kurban dilaksanakan pada waktu dan dengan hewan yang memenuhi ketentuan."],
    ["Penyembelihan hewan yang berkaitan dengan kelahiran anak disebut …", "Akikah", ["Kurban", "Dam", "Kafarat"], "Akikah berkaitan dengan kelahiran anak dan memiliki ketentuan tersendiri."],
    ["Transaksi harus didasarkan pada kejelasan dan …", "Kerelaan para pihak", ["Paksaan penjual", "Penyembunyian cacat", "Ketidakjelasan harga"], "Muamalah yang baik menjaga kejelasan dan kerelaan para pihak."],
    ["Tambahan yang diharamkan dalam transaksi tertentu disebut …", "Riba", ["Laba", "Sedekah", "Hibah"], "Riba berbeda dari laba jual beli yang sah dan memiliki ketentuan pembahasan fikih."],
  ];

  bank.prophets = prophetFacts.map(factQuestion);
  bank.history = historyFacts.map(factQuestion);
  bank.fiqh = fiqhFacts.map(factQuestion);

  const arabicSource = window.PAIBP_ARABIC;
  const arabicLevel = arabicSource?.levels?.[0];
  const arabicTopic = arabicLevel?.topics?.[0];
  bank.arabic = arabicLevel && arabicTopic && typeof arabicSource.createQuestionSet === "function"
    ? arabicSource.createQuestionSet(arabicLevel.id, arabicTopic.id, 261078)
      .slice(0, 20)
      .map((question) => [
        `${question.prompt}\n${question.arabicPrompt}`,
        question.options,
        question.answer,
        question.explanation,
      ])
    : [];
  bank.verseMeaning = concepts.map((item, index) => {
    const distractors = concepts
      .filter((_, otherIndex) => otherIndex !== index)
      .slice((index + 5) % 9, ((index + 5) % 9) + 3)
      .map((entry) => entry.term);
    const [options, answer] = rotateOptions(item.term, distractors, index + 1);
    return [`Tema utama yang dikuatkan oleh ${item.dalil} ialah …`, options, answer, `${item.dalil} digunakan untuk menguatkan tema ${item.term}.`];
  });
  bank.digital = concepts.map((item, index) => {
    const distractors = [
      "Menyebarkan informasi secepat mungkin agar menjadi yang pertama.",
      "Menggunakan identitas orang lain agar tidak diketahui.",
      "Mengabaikan sumber dan dampak karena berada di ruang digital.",
    ];
    const correct = `${item.action} Setelah itu, catat sumber dan dampaknya secara jujur.`;
    const [options, answer] = rotateOptions(correct, distractors, index + 2);
    return [`Detektif informasi menghadapi situasi berikut: ${item.scenario} Keputusan digital paling aman dan berakhlak ialah …`, options, answer, correct];
  });
  bank.worshipPuzzle = concepts.map((item, index) => {
    const distractors = [
      "Mulai tanpa niat–abaikan syarat–lakukan tergesa-gesa–selesai",
      "Ikuti tebakan–tinggalkan sumber–salin tindakan–abaikan evaluasi",
      "Pilih yang termudah–abaikan sebab–menyalahkan orang lain–ulang",
    ];
    const [options, answer] = rotateOptions(item.sequence, distractors, index + 3);
    return [`Puzzle penerapan “${item.term}”: pilih susunan langkah yang dapat dipertanggungjawabkan.`, options, answer, `Susunan yang tepat: ${item.sequence}.`];
  });
  bank.boss = concepts.map((item, index) => {
    const distractors = [
      `Menghafal istilah ${item.term} tetapi tidak mengubah tindakan.`,
      "Menunggu penilaian orang lain sebelum berbuat benar.",
      "Memilih tindakan yang paling cepat meskipun merugikan pihak lain.",
    ];
    const correct = `${item.application} Langkah ini menunjukkan pemahaman, alasan, dan tindakan yang selaras.`;
    const [options, answer] = rotateOptions(correct, distractors, index);
    return [`Boss Battle ${index + 1}: bukti penguasaan tema ${item.term} yang paling utuh ialah …`, options, answer, correct];
  });

  const versePairs = [
    ["Al-Fatihah 1–2", "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ", "ٱلۡحَمۡدُ لِلَّهِ رَبِّ ٱلۡعَٰلَمِينَ"],
    ["Al-Fatihah 4–5", "مَٰلِكِ يَوۡمِ ٱلدِّينِ", "إِيَّاكَ نَعۡبُدُ وَإِيَّاكَ نَسۡتَعِينُ"],
    ["Al-Fatihah 6–7", "ٱهۡدِنَا ٱلصِّرَٰطَ ٱلۡمُسۡتَقِيمَ", "صِرَٰطَ ٱلَّذِينَ أَنۡعَمۡتَ عَلَيۡهِمۡ غَيۡرِ ٱلۡمَغۡضُوبِ عَلَيۡهِمۡ وَلَا ٱلضَّآلِّينَ"],
    ["Ad-Duha 1–2", "وَٱلضُّحَىٰ", "وَٱلَّيۡلِ إِذَا سَجَىٰ"],
    ["Ad-Duha 3–4", "مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ", "وَلَلۡأٓخِرَةُ خَيۡرٞ لَّكَ مِنَ ٱلۡأُولَىٰ"],
    ["Asy-Syarh 1–2", "أَلَمۡ نَشۡرَحۡ لَكَ صَدۡرَكَ", "وَوَضَعۡنَا عَنكَ وِزۡرَكَ"],
    ["Asy-Syarh 5–6", "فَإِنَّ مَعَ ٱلۡعُسۡرِ يُسۡرًا", "إِنَّ مَعَ ٱلۡعُسۡرِ يُسۡرٗا"],
    ["At-Tin 1–2", "وَٱلتِّينِ وَٱلزَّيۡتُونِ", "وَطُورِ سِينِينَ"],
    ["Al-Qadr 1–2", "إِنَّآ أَنزَلۡنَٰهُ فِي لَيۡلَةِ ٱلۡقَدۡرِ", "وَمَآ أَدۡرَىٰكَ مَا لَيۡلَةُ ٱلۡقَدۡرِ"],
    ["Az-Zalzalah 1–2", "إِذَا زُلۡزِلَتِ ٱلۡأَرۡضُ زِلۡزَالَهَا", "وَأَخۡرَجَتِ ٱلۡأَرۡضُ أَثۡقَالَهَا"],
    ["Al-'Adiyat 1–2", "وَٱلۡعَٰدِيَٰتِ ضَبۡحٗا", "فَٱلۡمُورِيَٰتِ قَدۡحٗا"],
    ["Al-Qari'ah 1–2", "ٱلۡقَارِعَةُ", "مَا ٱلۡقَارِعَةُ"],
    ["At-Takasur 1–2", "أَلۡهَىٰكُمُ ٱلتَّكَاثُرُ", "حَتَّىٰ زُرۡتُمُ ٱلۡمَقَابِرَ"],
    ["Al-'Asr 1–2", "وَٱلۡعَصۡرِ", "إِنَّ ٱلۡإِنسَٰنَ لَفِي خُسۡرٍ"],
    ["Al-Fil 1–2", "أَلَمۡ تَرَ كَيۡفَ فَعَلَ رَبُّكَ بِأَصۡحَٰبِ ٱلۡفِيلِ", "أَلَمۡ يَجۡعَلۡ كَيۡدَهُمۡ فِي تَضۡلِيلٖ"],
    ["Quraisy 1–2", "لِإِيلَٰفِ قُرَيۡشٍ", "إِۦلَٰفِهِمۡ رِحۡلَةَ ٱلشِّتَآءِ وَٱلصَّيۡفِ"],
    ["Al-Ma'un 1–2", "أَرَءَيۡتَ ٱلَّذِي يُكَذِّبُ بِٱلدِّينِ", "فَذَٰلِكَ ٱلَّذِي يَدُعُّ ٱلۡيَتِيمَ"],
    ["Al-Kafirun 1–2", "قُلۡ يَـٰٓأَيُّهَا ٱلۡكَٰفِرُونَ", "لَآ أَعۡبُدُ مَا تَعۡبُدُونَ"],
    ["Al-Ikhlas 1–2", "قُلۡ هُوَ ٱللَّهُ أَحَدٌ", "ٱللَّهُ ٱلصَّمَدُ"],
    ["Al-Falaq 1–2", "قُلۡ أَعُوذُ بِرَبِّ ٱلۡفَلَقِ", "مِن شَرِّ مَا خَلَقَ"],
  ];
  bank.continueVerse = versePairs.map(([reference, current, next], index) => {
    const distractors = [5, 9, 13].map((step) => versePairs[(index + step) % versePairs.length][2]);
    const [options, answer] = rotateOptions(next, distractors, index);
    return [
      `Sambung ayat berikut dengan lanjutan yang tepat.\n${current}`,
      options,
      answer,
      `Lanjutan ${reference} adalah ${next}`,
    ];
  });

  const worlds = [
    { id: "quran", title: "Jelajah Al Qur'an", icon: "📖", modes: ["continueVerse", "verseMeaning", "dalil", "continueVerse", "verseMeaning"] },
    { id: "iman", title: "Benteng Iman", icon: "🛡️", modes: ["quiz", "truefalse", "dalil", "match", "boss"] },
    { id: "ibadah", title: "Lab Ibadah", icon: "🕌", modes: ["fiqh", "worshipPuzzle", "sequence", "truefalse", "scenario"] },
    { id: "akhlak", title: "Misi Akhlak", icon: "🌱", modes: ["scenario", "match", "truefalse", "digital", "boss"] },
    { id: "sejarah", title: "Lorong Sejarah", icon: "🏛️", modes: ["history", "prophets", "quiz", "sequence", "boss"] },
    { id: "tokoh", title: "Teladan Tokoh", icon: "🧭", modes: ["prophets", "history", "match", "truefalse", "boss"] },
    { id: "fikih", title: "Fikih Kehidupan", icon: "⚖️", modes: ["fiqh", "scenario", "sequence", "dalil", "worshipPuzzle"] },
    { id: "arab", title: "Bahasa Arab", icon: "🔤", modes: ["arabic", "match", "quiz", "sequence", "boss"] },
    { id: "digital", title: "Muslim Digital", icon: "💻", modes: ["digital", "truefalse", "scenario", "quiz", "boss"] },
    { id: "juara", title: "Liga PAIBP", icon: "🏆", modes: ["boss", "quiz", "dalil", "fiqh", "continueVerse"] },
  ];
  const challengeNames = [
    "Gerbang Pemula", "Misi Penjelajah", "Tantangan Cendekia", "Arena Teladan", "Lintasan Cepat",
    "Ruang Detektif", "Puzzle Berantai", "Ujian Fokus", "Kombo Juara", "Final Cahaya",
  ];
  const arenas = worlds.flatMap((world, worldIndex) => challengeNames.map((challenge, challengeIndex) => ({
    id: `arena-${String((worldIndex * 10) + challengeIndex + 1).padStart(3, "0")}`,
    world: world.id,
    worldTitle: world.title,
    title: `${world.title}: ${challenge}`,
    icon: world.icon,
    description: challengeIndex % 3 === 0
      ? "20 soal acak dengan urutan pilihan berbeda pada setiap sesi"
      : challengeIndex % 3 === 1
        ? "20 tantangan relevan PAIBP SMP yang wajib dituntaskan"
        : "20 misi adaptif dari bank konsep, dalil, dan penerapan",
    baseMode: world.modes[challengeIndex % world.modes.length],
  })));

  function secureRandomInt(max) {
    if (max <= 1) return 0;
    if (globalThis.crypto?.getRandomValues) {
      const buffer = new Uint32Array(1);
      globalThis.crypto.getRandomValues(buffer);
      return buffer[0] % max;
    }
    return Math.floor(Math.random() * max);
  }

  function randomShuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const target = secureRandomInt(index + 1);
      [copy[index], copy[target]] = [copy[target], copy[index]];
    }
    return copy;
  }

  function generateSession(arenaId, count = 20) {
    const arena = arenas.find((item) => item.id === arenaId) || arenas[0];
    const source = bank[arena.baseMode] || bank.quiz;
    const prefixes = [
      "", "Cermati baik-baik. ", "Tantangan berikutnya: ", "Gunakan pemahaman PAIBP SMP. ",
      "Pilih berdasarkan dalil dan konsep. ", "Hindari jawaban tergesa-gesa. ",
    ];
    return randomShuffle(source).slice(0, count).map((entry) => {
      const [question, options, correctIndex, explanation] = entry;
      const correct = options[correctIndex];
      const randomizedOptions = randomShuffle(options);
      return [
        `${prefixes[secureRandomInt(prefixes.length)]}${question}`,
        randomizedOptions,
        randomizedOptions.indexOf(correct),
        explanation,
      ];
    });
  }

  window.PAIBP_GAME_BANK = {
    bank,
    arenas,
    worlds,
    generateSession,
    total: Object.values(bank).reduce((total, items) => total + items.length, 0),
    perMode: 20,
    modeCount: arenas.length,
    combinationLabel: "> 1 triliun kemungkinan sesi",
  };
})();
