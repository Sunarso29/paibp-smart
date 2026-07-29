(() => {
  const levels = [
    {
      id: "dasar",
      label: "Dasar",
      icon: "🌱",
      description: "Kosakata inti dan kalimat pendek untuk kehidupan sekolah.",
      lessons: [
        ["Salam dan sapaan", "السَّلَامُ عَلَيْكُمْ", "as-salāmu ‘alaikum", "Semoga keselamatan tercurah kepadamu.", "Jawaban salam yang tepat ialah …", ["وَعَلَيْكُمُ السَّلَامُ", "مَعَ السَّلَامَةِ", "شُكْرًا"], 0],
        ["Perkenalan diri", "اِسْمِي أَحْمَدُ", "ismī Aḥmadu", "Nama saya Ahmad.", "Kata اِسْمِي berarti …", ["kelasku", "namaku", "bukuku"], 1],
        ["Benda di kelas", "هٰذَا كِتَابٌ", "hādzā kitābun", "Ini sebuah buku.", "Kata كِتَابٌ berarti …", ["buku", "pena", "meja"], 0],
        ["Angka 1–10", "وَاحِدٌ، اِثْنَانِ، ثَلَاثَةٌ", "wāḥidun, itsnāni, tsalātsatun", "Satu, dua, tiga.", "Angka ثَلَاثَةٌ ialah …", ["dua", "tiga", "empat"], 1],
        ["Keluarga", "هٰذِهِ أُمِّي", "hādzihī ummī", "Ini ibu saya.", "Kata أُمِّي berarti …", ["ayahku", "ibuku", "saudaraku"], 1],
        ["Hari dan waktu", "اَلْيَوْمُ يَوْمُ الْجُمُعَةِ", "al-yaumu yaumul-jumu‘ati", "Hari ini hari Jumat.", "Kata اَلْيَوْمُ berarti …", ["hari ini", "kemarin", "besok"], 0],
      ],
    },
    {
      id: "menengah",
      label: "Menengah",
      icon: "🧭",
      description: "Pola kalimat, pertanyaan, dan aktivitas sehari-hari.",
      lessons: [
        ["Kalimat nominal", "اَلْمَدْرَسَةُ نَظِيفَةٌ", "al-madrasatu naẓīfatun", "Sekolah itu bersih.", "Sifat yang digunakan pada kalimat ialah …", ["bersih", "besar", "jauh"], 0],
        ["Kalimat kerja", "يَقْرَأُ الطَّالِبُ الْكِتَابَ", "yaqra’ut-thālibul-kitāba", "Murid membaca buku.", "Kata kerja يَقْرَأُ berarti …", ["menulis", "membaca", "mendengar"], 1],
        ["Kata tanya", "أَيْنَ الْمَسْجِدُ؟", "ainal-masjidu?", "Di mana masjid?", "Kata tanya أَيْنَ digunakan untuk menanyakan …", ["tempat", "waktu", "jumlah"], 0],
        ["Kegiatan harian", "أَذْهَبُ إِلَى الْمَدْرَسَةِ صَبَاحًا", "adz-habu ilal-madrasati shabāḥan", "Saya pergi ke sekolah pada pagi hari.", "Kegiatan pada kalimat berlangsung …", ["pagi", "siang", "malam"], 0],
        ["Arah dan tempat", "اَلْمَكْتَبَةُ بِجَانِبِ الْفَصْلِ", "al-maktabatu bijānil-fil", "Perpustakaan berada di samping kelas.", "بِجَانِبِ berarti …", ["di depan", "di samping", "di belakang"], 1],
        ["Adab belajar", "أَسْتَأْذِنُ قَبْلَ الْكَلَامِ", "asta’dzinu qablal-kalāmi", "Saya meminta izin sebelum berbicara.", "Sikap pada kalimat menunjukkan …", ["ketergesa-gesaan", "adab", "kelalaian"], 1],
      ],
    },
    {
      id: "mahir",
      label: "Mahir",
      icon: "🏆",
      description: "Membaca, menyimpulkan, dan menyampaikan gagasan sederhana.",
      lessons: [
        ["Membaca paragraf", "أُحِبُّ الْعِلْمَ لِأَنَّهُ نُورٌ", "uḥibbul-‘ilma li-annahu nūrun", "Saya mencintai ilmu karena ilmu adalah cahaya.", "Alasan mencintai ilmu pada kalimat ialah …", ["ilmu adalah cahaya", "ilmu itu sulit", "ilmu itu mahal"], 0],
        ["Menyatakan pendapat", "فِي رَأْيِي، الصِّدْقُ أَسَاسُ الثِّقَةِ", "fī ra’yī, ash-shidqu asāsuts-tsiqati", "Menurut saya, kejujuran adalah dasar kepercayaan.", "Ungkapan فِي رَأْيِي digunakan untuk …", ["meminta izin", "menyatakan pendapat", "mengucapkan salam"], 1],
        ["Sebab dan akibat", "نَجَحَ لِأَنَّهُ اجْتَهَدَ", "najaḥa li-annahu ijtahada", "Ia berhasil karena bersungguh-sungguh.", "Penyebab keberhasilan ialah …", ["bersungguh-sungguh", "terlambat", "beristirahat"], 0],
        ["Membandingkan", "الْعِلْمُ أَنْفَعُ مِنَ الْمَالِ", "al-‘ilmu anfa‘u minal-māli", "Ilmu lebih bermanfaat daripada harta.", "Pola أَنْفَعُ مِنْ menunjukkan …", ["perbandingan", "larangan", "pertanyaan"], 0],
        ["Ringkasan teks", "يَحْفَظُ الْمُسْلِمُ الْبِيئَةَ وَلَا يُفْسِدُهَا", "yaḥfaẓul-muslimul-bī’ata wa lā yufsiduhā", "Seorang Muslim menjaga lingkungan dan tidak merusaknya.", "Inti kalimat ialah …", ["menjaga lingkungan", "meninggalkan sekolah", "membeli barang"], 0],
        ["Presentasi singkat", "سَأَتَحَدَّثُ عَنْ أَهَمِّيَّةِ الْأَمَانَةِ", "sa-ataḥaddatsu ‘an ahammiyyatil-amānati", "Saya akan berbicara tentang pentingnya amanah.", "Topik presentasi ialah …", ["keberanian", "amanah", "perjalanan"], 1],
      ],
    },
    {
      id: "percakapan",
      label: "Percakapan",
      icon: "💬",
      description: "Dialog praktis di sekolah, masjid, rumah, dan ruang publik.",
      lessons: [
        ["Di kelas", "هَلْ فَهِمْتَ الدَّرْسَ؟ نَعَمْ، فَهِمْتُ", "hal fahimtad-darsa? na‘am, fahimtu", "Apakah kamu memahami pelajaran? Ya, saya paham.", "Jawaban yang menunjukkan paham ialah …", ["لَا أَعْرِفُ", "نَعَمْ، فَهِمْتُ", "إِلَى اللِّقَاءِ"], 1],
        ["Di perpustakaan", "أُرِيدُ أَنْ أَسْتَعِيرَ هٰذَا الْكِتَابَ", "urīdu an asta‘īra hādzal-kitāba", "Saya ingin meminjam buku ini.", "Tujuan penutur ialah …", ["meminjam buku", "membeli makanan", "mencari masjid"], 0],
        ["Di masjid", "مَتَى تُقَامُ الصَّلَاةُ؟", "matā tuqāmush-shalātu?", "Kapan sholat didirikan?", "Kata tanya مَتَى menanyakan …", ["orang", "waktu", "tempat"], 1],
        ["Meminta arah", "كَيْفَ أَذْهَبُ إِلَى الْمُصَلَّى؟", "kaifa adz-habu ilal-mushallā?", "Bagaimana saya pergi ke mushala?", "Percakapan ini dipakai ketika …", ["meminta arah", "memesan makanan", "berpamitan"], 0],
        ["Menawarkan bantuan", "هَلْ تَحْتَاجُ إِلَى مُسَاعَدَةٍ؟", "hal taḥtāju ilā musā‘adatin?", "Apakah kamu memerlukan bantuan?", "Nilai yang dilatih ialah …", ["kepedulian", "kesombongan", "ketidakjujuran"], 0],
        ["Berdiskusi santun", "أَحْتَرِمُ رَأْيَكَ، وَلَكِنْ لِي رَأْيٌ آخَرُ", "aḥtarimu ra’yaka, walākin lī ra’yun ākharu", "Saya menghormati pendapatmu, tetapi saya memiliki pendapat lain.", "Ungkapan ini menunjukkan …", ["ejekan", "perbedaan yang santun", "penolakan kasar"], 1],
      ],
    },
  ].map((level) => ({
    ...level,
    lessons: level.lessons.map(([title, arabic, transliteration, meaning, question, options, answer], index) => ({
      id: `${level.id}-${index + 1}`,
      title,
      arabic,
      transliteration,
      meaning,
      question,
      options,
      answer,
    })),
  }));

  window.PAIBP_ARABIC = { levels };
})();
