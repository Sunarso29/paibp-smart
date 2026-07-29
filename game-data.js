(() => {
  const concepts = [
    {
      term: "Al Qur'an",
      meaning: "Wahyu Allah Subhanahu Wata'ala yang menjadi sumber utama ajaran Islam.",
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
      meaning: "Menyerahkan hasil kepada Allah Subhanahu Wata'ala setelah melakukan ikhtiar yang benar.",
      application: "Belajar teratur, berdoa, mengikuti ujian dengan jujur, lalu menerima hasil sambil mengevaluasi.",
      misconception: "Tawakal berarti menunggu hasil tanpa melakukan usaha.",
      dalil: "Al Qur'an Surat Ali 'Imran ayat 159",
      sequence: "Tentukan tujuan–lakukan ikhtiar–berdoa–serahkan hasil",
      scenario: "Murid ingin memperoleh hasil baik dalam penilaian akhir.",
      action: "Membuat jadwal belajar, berlatih, berdoa, dan mengikuti penilaian dengan jujur.",
    },
    {
      term: "Syukur",
      meaning: "Mengakui nikmat Allah Subhanahu Wata'ala dengan hati, lisan, dan penggunaan nikmat untuk kebaikan.",
      application: "Mengucapkan hamdalah, menjaga nikmat, dan membagikan manfaat kepada sesama.",
      misconception: "Syukur cukup diucapkan tanpa perlu menjaga atau menggunakan nikmat dengan baik.",
      dalil: "Al Qur'an Surat Ibrahim ayat 7",
      sequence: "Sadari nikmat–puji Allah Subhanahu Wata'ala–gunakan dengan baik–berbagi manfaat",
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
      meaning: "Mengingat Allah Subhanahu Wata'ala melalui bacaan yang disyariatkan serta kesadaran hati.",
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
      meaning: "Kembali kepada Allah Subhanahu Wata'ala dengan meninggalkan dosa, menyesal, dan bertekad memperbaiki.",
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

  window.PAIBP_GAME_BANK = {
    bank,
    total: Object.values(bank).reduce((total, items) => total + items.length, 0),
    perMode: 20,
  };
})();
