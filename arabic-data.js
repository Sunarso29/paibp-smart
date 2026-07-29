(() => {
  "use strict";

  const vocabulary = [
    ["كِتَابٌ", "kitābun", "buku", "noun", "school"],
    ["قَلَمٌ", "qalamun", "pena", "noun", "school"],
    ["دَفْتَرٌ", "daftarun", "buku tulis", "noun", "school"],
    ["مَدْرَسَةٌ", "madrasatun", "sekolah", "noun", "school"],
    ["فَصْلٌ", "fashlun", "kelas", "noun", "school"],
    ["مُعَلِّمٌ", "mu‘allimun", "guru laki-laki", "noun", "school"],
    ["مُعَلِّمَةٌ", "mu‘allimatun", "guru perempuan", "noun", "school"],
    ["طَالِبٌ", "thālibun", "murid laki-laki", "noun", "school"],
    ["طَالِبَةٌ", "thālibatun", "murid perempuan", "noun", "school"],
    ["مَكْتَبَةٌ", "maktabatun", "perpustakaan", "noun", "school"],
    ["سَبُّورَةٌ", "sabbūratun", "papan tulis", "noun", "school"],
    ["كُرْسِيٌّ", "kursiyyun", "kursi", "noun", "school"],
    ["مَكْتَبٌ", "maktabun", "meja", "noun", "school"],
    ["حَقِيبَةٌ", "ḥaqībatun", "tas", "noun", "school"],
    ["حَاسُوبٌ", "ḥāsūbun", "komputer", "noun", "digital"],
    ["هَاتِفٌ", "hātifun", "telepon", "noun", "digital"],
    ["شَاشَةٌ", "syāsyatun", "layar", "noun", "digital"],
    ["مِلَفٌّ", "milaffun", "berkas", "noun", "digital"],
    ["رِسَالَةٌ", "risālatun", "pesan", "noun", "digital"],
    ["بَيَانَاتٌ", "bayānātun", "data", "noun", "digital"],
    ["أَبٌ", "abun", "ayah", "noun", "family"],
    ["أُمٌّ", "ummun", "ibu", "noun", "family"],
    ["أَخٌ", "akhun", "saudara laki-laki", "noun", "family"],
    ["أُخْتٌ", "ukhtun", "saudara perempuan", "noun", "family"],
    ["أُسْرَةٌ", "usratun", "keluarga", "noun", "family"],
    ["بَيْتٌ", "baitun", "rumah", "noun", "home"],
    ["غُرْفَةٌ", "ghurfatun", "kamar", "noun", "home"],
    ["مَطْبَخٌ", "mathbakhun", "dapur", "noun", "home"],
    ["بَابٌ", "bābun", "pintu", "noun", "home"],
    ["نَافِذَةٌ", "nāfidzatun", "jendela", "noun", "home"],
    ["مَسْجِدٌ", "masjidun", "masjid", "noun", "worship"],
    ["صَلَاةٌ", "shalātun", "sholat", "noun", "worship"],
    ["وُضُوءٌ", "wudhū’un", "wudhu", "noun", "worship"],
    ["قُرْآنٌ", "qur’ānun", "Al Qur'an", "noun", "worship"],
    ["دُعَاءٌ", "du‘ā’un", "doa", "noun", "worship"],
    ["صَدَقَةٌ", "shadaqatun", "sedekah", "noun", "worship"],
    ["شَمْسٌ", "syamsun", "matahari", "noun", "nature"],
    ["قَمَرٌ", "qamarun", "bulan", "noun", "nature"],
    ["سَمَاءٌ", "samā’un", "langit", "noun", "nature"],
    ["أَرْضٌ", "ardhun", "bumi", "noun", "nature"],
    ["مَاءٌ", "mā’un", "air", "noun", "nature"],
    ["شَجَرَةٌ", "syajaratun", "pohon", "noun", "nature"],
    ["بَحْرٌ", "baḥrun", "laut", "noun", "nature"],
    ["جَبَلٌ", "jabalun", "gunung", "noun", "nature"],
    ["طَبِيبٌ", "thabībun", "dokter", "noun", "work"],
    ["مُهَنْدِسٌ", "muhandisun", "insinyur", "noun", "work"],
    ["مَزْرَعَةٌ", "mazra‘atun", "lahan pertanian", "noun", "work"],
    ["مَصْنَعٌ", "mashna‘un", "pabrik", "noun", "work"],
    ["مَشْرُوعٌ", "masyrū‘un", "proyek", "noun", "work"],
    ["سَيَّارَةٌ", "sayyāratun", "mobil", "noun", "travel"],
    ["حَافِلَةٌ", "ḥāfilatun", "bus", "noun", "travel"],
    ["قِطَارٌ", "qithārun", "kereta", "noun", "travel"],
    ["طَرِيقٌ", "tharīqun", "jalan", "noun", "travel"],
    ["تَذْكِرَةٌ", "tadzkiratun", "tiket", "noun", "travel"],
    ["كَبِيرٌ", "kabīrun", "besar", "adjective", "general"],
    ["صَغِيرٌ", "shaghīrun", "kecil", "adjective", "general"],
    ["جَمِيلٌ", "jamīlun", "indah", "adjective", "general"],
    ["نَظِيفٌ", "naẓīfun", "bersih", "adjective", "general"],
    ["جَدِيدٌ", "jadīdun", "baru", "adjective", "general"],
    ["قَدِيمٌ", "qadīmun", "lama", "adjective", "general"],
    ["طَوِيلٌ", "thawīlun", "panjang", "adjective", "general"],
    ["قَصِيرٌ", "qashīrun", "pendek", "adjective", "general"],
    ["سَرِيعٌ", "sarī‘un", "cepat", "adjective", "general"],
    ["بَطِيءٌ", "bathī’un", "lambat", "adjective", "general"],
    ["قَرِيبٌ", "qarībun", "dekat", "adjective", "general"],
    ["بَعِيدٌ", "ba‘īdun", "jauh", "adjective", "general"],
    ["سَهْلٌ", "sahlun", "mudah", "adjective", "school"],
    ["صَعْبٌ", "sha‘bun", "sulit", "adjective", "school"],
    ["مَفْتُوحٌ", "maftūḥun", "terbuka", "adjective", "general"],
    ["مُغْلَقٌ", "mughlaqun", "tertutup", "adjective", "general"],
    ["نَشِيطٌ", "nasyīthun", "rajin", "adjective", "school"],
    ["أَمِينٌ", "amīnun", "amanah", "adjective", "character"],
    ["صَادِقٌ", "shādiqun", "jujur", "adjective", "character"],
    ["نَافِعٌ", "nāfi‘un", "bermanfaat", "adjective", "character"],
    ["مُهِمٌّ", "muhimmun", "penting", "adjective", "general"],
    ["سَعِيدٌ", "sa‘īdun", "bahagia", "adjective", "general"],
    ["حَارٌّ", "ḥārrun", "panas", "adjective", "nature"],
    ["بَارِدٌ", "bāridun", "dingin", "adjective", "nature"],
    ["يَقْرَأُ", "yaqra’u", "membaca", "verb", "school"],
    ["يَكْتُبُ", "yaktubu", "menulis", "verb", "school"],
    ["يَدْرُسُ", "yadrusu", "belajar", "verb", "school"],
    ["يَفْهَمُ", "yafhamu", "memahami", "verb", "school"],
    ["يَحْفَظُ", "yaḥfaẓu", "menghafal", "verb", "school"],
    ["يُرَاجِعُ", "yurāji‘u", "meninjau kembali", "verb", "school"],
    ["يُنَاقِشُ", "yunāqisyu", "mendiskusikan", "verb", "school"],
    ["يُحَلِّلُ", "yuḥallilu", "menganalisis", "verb", "school"],
    ["يَذْهَبُ", "yadzhabu", "pergi", "verb", "travel"],
    ["يَعُودُ", "ya‘ūdu", "kembali", "verb", "travel"],
    ["يَسَافِرُ", "yusāfiru", "bepergian", "verb", "travel"],
    ["يَجْلِسُ", "yajlisu", "duduk", "verb", "general"],
    ["يَقِفُ", "yaqifu", "berdiri", "verb", "general"],
    ["يَفْتَحُ", "yaftaḥu", "membuka", "verb", "general"],
    ["يُغْلِقُ", "yughliqu", "menutup", "verb", "general"],
    ["يَأْكُلُ", "ya’kulu", "makan", "verb", "home"],
    ["يَشْرَبُ", "yasyrabu", "minum", "verb", "home"],
    ["يَسْمَعُ", "yasma‘u", "mendengar", "verb", "general"],
    ["يَتَكَلَّمُ", "yatakallamu", "berbicara", "verb", "general"],
    ["يَعْمَلُ", "ya‘malu", "bekerja", "verb", "work"],
    ["يُسَاعِدُ", "yusā‘idu", "membantu", "verb", "character"],
    ["يَحْتَرِمُ", "yaḥtarimu", "menghormati", "verb", "character"],
    ["يُخَطِّطُ", "yukhaththithu", "merencanakan", "verb", "work"],
    ["يَخْتَارُ", "yakhtāru", "memilih", "verb", "general"],
    ["يَبْحَثُ", "yabḥatsu", "meneliti", "verb", "digital"],
    ["يَصْنَعُ", "yashna‘u", "membuat", "verb", "work"],
    ["يَزْرَعُ", "yazra‘u", "menanam", "verb", "nature"],
    ["يُصَلِّي", "yushallī", "melaksanakan sholat", "verb", "worship"],
    ["يَتَوَضَّأُ", "yatawadhdha’u", "berwudhu", "verb", "worship"],
    ["يَدْعُو", "yad‘ū", "berdoa", "verb", "worship"],
    ["أَنَا", "anā", "saya", "pronoun", "general"],
    ["نَحْنُ", "naḥnu", "kami atau kita", "pronoun", "general"],
    ["أَنْتَ", "anta", "kamu laki-laki", "pronoun", "general"],
    ["أَنْتِ", "anti", "kamu perempuan", "pronoun", "general"],
    ["هُوَ", "huwa", "dia laki-laki", "pronoun", "general"],
    ["هِيَ", "hiya", "dia perempuan", "pronoun", "general"],
    ["هُمْ", "hum", "mereka laki-laki", "pronoun", "general"],
    ["هُنَّ", "hunna", "mereka perempuan", "pronoun", "general"],
    ["هٰذَا", "hādzā", "ini untuk laki-laki", "demonstrative", "general"],
    ["هٰذِهِ", "hādzihī", "ini untuk perempuan", "demonstrative", "general"],
    ["ذٰلِكَ", "dzālika", "itu untuk laki-laki", "demonstrative", "general"],
    ["تِلْكَ", "tilka", "itu untuk perempuan", "demonstrative", "general"],
    ["فِي", "fī", "di dalam", "particle", "place"],
    ["عَلَى", "‘alā", "di atas", "particle", "place"],
    ["إِلَى", "ilā", "menuju atau ke", "particle", "place"],
    ["مِنْ", "min", "dari", "particle", "place"],
    ["مَعَ", "ma‘a", "bersama", "particle", "general"],
    ["أَمَامَ", "amāma", "di depan", "particle", "place"],
    ["خَلْفَ", "khalfa", "di belakang", "particle", "place"],
    ["بَيْنَ", "baina", "di antara", "particle", "place"],
    ["تَحْتَ", "taḥta", "di bawah", "particle", "place"],
    ["فَوْقَ", "fauqa", "di atas", "particle", "place"],
    ["مَنْ", "man", "siapa", "question", "general"],
    ["مَا", "mā", "apa", "question", "general"],
    ["أَيْنَ", "aina", "di mana", "question", "place"],
    ["مَتَى", "matā", "kapan", "question", "time"],
    ["كَيْفَ", "kaifa", "bagaimana", "question", "general"],
    ["لِمَاذَا", "limādzā", "mengapa", "question", "general"],
    ["كَمْ", "kam", "berapa", "question", "number"],
    ["نَعَمْ", "na‘am", "ya", "expression", "conversation"],
    ["لَا", "lā", "tidak", "expression", "conversation"],
    ["شُكْرًا", "syukran", "terima kasih", "expression", "conversation"],
    ["عَفْوًا", "‘afwan", "sama-sama atau maaf", "expression", "conversation"],
    ["مِنْ فَضْلِكَ", "min fadhlika", "tolong", "expression", "conversation"],
    ["أَهْلًا وَسَهْلًا", "ahlan wa sahlan", "selamat datang", "expression", "conversation"],
    ["مَعَ السَّلَامَةِ", "ma‘as-salāmah", "selamat jalan", "expression", "conversation"],
    ["إِلَى اللِّقَاءِ", "ilal-liqā’", "sampai jumpa", "expression", "conversation"],
    ["أَنَا بِخَيْرٍ", "anā bikhairin", "saya baik", "expression", "conversation"],
    ["لَا أَفْهَمُ", "lā afhamu", "saya belum paham", "expression", "conversation"],
    ["هَلْ تُسَاعِدُنِي؟", "hal tusā‘idunī?", "apakah kamu dapat membantu saya?", "expression", "conversation"],
    ["مَا رَأْيُكَ؟", "mā ra’yuka?", "apa pendapatmu?", "expression", "conversation"],
    ["أُوَافِقُكَ", "uwāfiquka", "saya setuju denganmu", "expression", "conversation"],
    ["لَا أُوَافِقُ", "lā uwāfiqu", "saya tidak setuju", "expression", "conversation"],
    ["أُرِيدُ هٰذَا", "urīdu hādzā", "saya menginginkan ini", "expression", "conversation"],
    ["أَسْتَطِيعُ ذٰلِكَ", "astathī‘u dzālika", "saya mampu melakukannya", "expression", "conversation"],
    ["تَفَضَّلْ", "tafadhdhal", "silakan", "expression", "conversation"],
    ["اِنْتَظِرْ قَلِيلًا", "intaẓir qalīlan", "tunggulah sebentar", "expression", "conversation"],
    ["أَعِدِ الْكَلَامَ", "a‘idil-kalāma", "ulangi ucapan itu", "expression", "conversation"],
    ["كَمِ السِّعْرُ؟", "kamis-si‘ru?", "berapa harganya?", "expression", "conversation"],
  ].map(([arabic, transliteration, meaning, type, domain], index) => ({
    id: `v-${index + 1}`,
    arabic,
    transliteration,
    meaning,
    type,
    domain,
  }));

  const grammarConcepts = {
    noun: ["Isim atau kata benda", "Kata yang menunjukkan orang, benda, tempat, hewan, atau gagasan tanpa terikat waktu.", "هٰذَا كِتَابٌ", "Ini sebuah buku."],
    adjective: ["Na‘at atau kata sifat", "Kata yang menerangkan sifat isim dan mengikuti jenis, jumlah, serta ketentuannya.", "الْفَصْلُ نَظِيفٌ", "Kelas itu bersih."],
    verb: ["Fi‘il atau kata kerja", "Kata yang menunjukkan perbuatan dan berkaitan dengan waktu.", "يَقْرَأُ الطَّالِبُ", "Murid laki-laki itu membaca."],
    pronoun: ["Dhamir atau kata ganti", "Kata yang menggantikan nama orang atau pihak yang dibicarakan.", "هُوَ طَالِبٌ", "Dia adalah murid laki-laki."],
    demonstrative: ["Isim isyarah", "Kata tunjuk yang disesuaikan dengan jenis dan jarak benda.", "هٰذِهِ مَدْرَسَةٌ", "Ini sebuah sekolah."],
    question: ["Isim istifham", "Kata yang dipakai untuk menanyakan orang, benda, tempat, waktu, cara, sebab, atau jumlah.", "أَيْنَ الْمَكْتَبَةُ؟", "Di mana perpustakaan?"],
    particle: ["Huruf dan partikel", "Unsur yang menghubungkan atau memberi fungsi tertentu pada kata lain.", "الْكِتَابُ عَلَى الْمَكْتَبِ", "Buku berada di atas meja."],
    nominal: ["Jumlah ismiyah", "Kalimat yang pada bentuk dasarnya dimulai dengan isim serta tersusun dari mubtada dan khabar.", "الْمَدْرَسَةُ نَظِيفَةٌ", "Sekolah itu bersih."],
    verbal: ["Jumlah fi‘liyah", "Kalimat yang dimulai dengan fi‘il dan dapat diikuti fa‘il serta maf‘ul bih.", "يَكْتُبُ الطَّالِبُ الدَّرْسَ", "Murid laki-laki menulis pelajaran."],
    idafa: ["Idhafah", "Susunan dua isim yang menyatakan kepemilikan atau keterkaitan; isim kedua berstatus majrur.", "كِتَابُ الطَّالِبِ", "Buku milik murid."],
    gender: ["Mudzakkar dan muannats", "Pembagian kata berdasarkan jenis laki-laki dan perempuan yang memengaruhi kesesuaian unsur kalimat.", "طَالِبٌ مُجْتَهِدٌ وَطَالِبَةٌ مُجْتَهِدَةٌ", "Murid laki-laki rajin dan murid perempuan rajin."],
    number: ["Mufrad, mutsanna, dan jamak", "Bentuk kata untuk menunjukkan satu, dua, atau lebih dari dua.", "كِتَابٌ، كِتَابَانِ، كُتُبٌ", "Satu buku, dua buku, dan banyak buku."],
    definite: ["Ma‘rifah dan nakirah", "Ma‘rifah menunjukkan sesuatu yang tertentu, sedangkan nakirah menunjukkan sesuatu yang belum tertentu.", "كِتَابٌ وَالْكِتَابُ", "Sebuah buku dan buku tersebut."],
    tense: ["Waktu fi‘il", "Fi‘il dapat menunjukkan perbuatan lampau, sedang/akan, atau perintah.", "كَتَبَ، يَكْتُبُ، اُكْتُبْ", "Telah menulis, sedang menulis, dan tulislah."],
    negation: ["Kalimat negatif", "Peniadaan dilakukan dengan partikel yang dipilih sesuai jenis kalimat dan waktu.", "لَا يَكْذِبُ الطَّالِبُ", "Murid tidak berdusta."],
    comparison: ["Isim tafdhil", "Bentuk yang digunakan untuk membandingkan dua hal pada suatu sifat.", "الْعِلْمُ أَنْفَعُ مِنَ الْمَالِ", "Ilmu lebih bermanfaat daripada harta."],
    condition: ["Uslub syarth", "Susunan yang menghubungkan syarat dengan akibat atau jawab syarat.", "إِنْ تَجْتَهِدْ تَنْجَحْ", "Jika bersungguh-sungguh, kamu berhasil."],
    irab: ["I‘rab", "Perubahan akhir kata karena perbedaan kedudukan gramatikal di dalam kalimat.", "حَضَرَ الطَّالِبُ وَرَأَيْتُ الطَّالِبَ", "Murid hadir dan saya melihat murid."],
    morphology: ["Sharaf", "Ilmu tentang perubahan bentuk kata untuk menghasilkan makna dan fungsi yang berbeda.", "كَتَبَ، كَاتِبٌ، مَكْتُوبٌ", "Menulis, penulis, dan sesuatu yang ditulis."],
    conversation: ["Hiwar atau percakapan", "Pertukaran ujaran yang memperhatikan tujuan, konteks, kesantunan, dan ketepatan ungkapan.", "كَيْفَ حَالُكَ؟ أَنَا بِخَيْرٍ", "Apa kabar? Saya baik."],
  };

  const topicSections = {
    dasar: [
      ["A. Fondasi Kata", ["Kata Benda (Isim)", "Kata Sifat (Na‘at)", "Kata Kerja (Fi‘il)", "Kata Ganti (Dhamir)", "Kata Tunjuk (Isim Isyarah)", "Kata Tanya (Istifham)", "Huruf Jar", "Kata Sambung", "Keterangan Tempat", "Keterangan Waktu"]],
      ["B. Jenis dan Jumlah Isim", ["Isim Mudzakkar", "Isim Muannats", "Isim Mufrad", "Isim Mutsanna", "Jamak Mudzakkar Salim", "Jamak Muannats Salim", "Jamak Taksir", "Isim Ma‘rifah", "Isim Nakirah", "Alif Lam Ta‘rif"]],
      ["C. Kata Sifat Dasar", ["Sifat untuk Mudzakkar", "Sifat untuk Muannats", "Kesesuaian Isim dan Sifat", "Warna Dasar", "Ukuran Benda", "Keadaan Benda", "Sifat Karakter", "Sifat Cuaca", "Lawan Kata Sifat", "Frasa Isim dan Sifat"]],
      ["D. Kata Kerja Dasar", ["Fi‘il Madhi Dasar", "Fi‘il Mudhari Dasar", "Fi‘il Amr Dasar", "Kata Kerja Orang Pertama", "Kata Kerja Orang Kedua Laki-laki", "Kata Kerja Orang Kedua Perempuan", "Kata Kerja Orang Ketiga Laki-laki", "Kata Kerja Orang Ketiga Perempuan", "Peniadaan Kata Kerja", "Kata Kerja Masa Depan"]],
      ["E. Dhamir dan Isim Isyarah", ["Dhamir Ana", "Dhamir Nahnu", "Dhamir Anta", "Dhamir Anti", "Dhamir Huwa", "Dhamir Hiya", "Dhamir Hum dan Hunna", "Hadza dan Dzalika", "Hadzihi dan Tilka", "Kesesuaian Kata Tunjuk"]],
      ["F. Kosakata Sekolah", ["Benda di Kelas", "Ruang Sekolah", "Peralatan Belajar", "Mata Pelajaran", "Jadwal Pelajaran", "Perintah di Kelas", "Adab kepada Guru", "Adab Belajar", "Perpustakaan", "Teknologi Pembelajaran"]],
      ["G. Kosakata Rumah dan Keluarga", ["Anggota Keluarga", "Ruangan di Rumah", "Perabot Rumah", "Kegiatan Pagi", "Kegiatan Siang", "Kegiatan Sore", "Kegiatan Malam", "Makanan dan Minuman", "Pakaian", "Kebersihan Rumah"]],
      ["H. Angka dan Waktu", ["Angka 1–10", "Angka 11–20", "Puluhan", "Bilangan Bertingkat", "Hari dalam Pekan", "Nama Bulan", "Membaca Jam", "Menanyakan Waktu", "Urutan Kegiatan", "Jadwal Harian"]],
      ["I. Jumlah Ismiyah Dasar", ["Mubtada dan Khabar", "Khabar Kata Sifat", "Khabar Kata Benda", "Khabar Keterangan Tempat", "Kalimat Positif", "Kalimat Negatif", "Kalimat Tanya", "Kalimat dengan Hadza", "Kalimat dengan Hadzihi", "Menyusun Jumlah Ismiyah"]],
      ["J. Jumlah Fi‘liyah Dasar", ["Fi‘il dan Fa‘il", "Fi‘il Fa‘il Maf‘ul Bih", "Membaca dan Menulis", "Pergi dan Kembali", "Makan dan Minum", "Belajar dan Menghafal", "Membantu dan Menghormati", "Sholat dan Berdoa", "Menjaga Lingkungan", "Uji Kompetensi Dasar"]],
    ],
    menengah: [
      ["A. Penguatan Kelas Kata", ["Kata Benda Menengah (Isim Turunan)", "Kata Sifat Menengah (Na‘at Bertingkat)", "Kata Kerja Menengah (Fi‘il Lazim dan Muta‘addi)", "Dhamir Muttashil", "Dhamir Munfashil", "Isim Maushul", "Isim Istifham Lanjutan", "Zharaf Zaman", "Zharaf Makan", "Huruf ‘Athaf"]],
      ["B. Isim dan I‘rab", ["Isim Marfu‘", "Isim Manshub", "Isim Majrur", "Tanda Rafa‘", "Tanda Nashab", "Tanda Jar", "Mutsanna dalam Kalimat", "Jamak Salim dalam Kalimat", "Jamak Taksir dalam Kalimat", "Latihan I‘rab Isim"]],
      ["C. Idhafah dan Na‘at", ["Idhafah Kepemilikan", "Idhafah Tempat", "Idhafah Waktu", "Mudhaf", "Mudhaf Ilaih", "Na‘at Mudzakkar", "Na‘at Muannats", "Na‘at Mufrad dan Jamak", "Membedakan Idhafah dan Na‘at", "Analisis Frasa"]],
      ["D. Fi‘il dan Tashrif", ["Fi‘il Madhi", "Fi‘il Mudhari", "Fi‘il Amr", "Tashrif Dhamir Ana–Huwa", "Tashrif Dhamir Anta–Anti", "Tashrif Dhamir Hum–Hunna", "Fi‘il Shahih", "Fi‘il Mu‘tal Dasar", "Kata Kerja Berimbuhan", "Latihan Tashrif"]],
      ["E. Struktur Jumlah Fi‘liyah", ["Fa‘il Zhahir", "Fa‘il Dhamir", "Maf‘ul Bih", "Kesesuaian Fi‘il dan Fa‘il", "Urutan Fi‘il Fa‘il Maf‘ul", "Kalimat Aktif", "Kalimat Pasif Dasar", "Peniadaan Fi‘il Madhi", "Peniadaan Fi‘il Mudhari", "Analisis Jumlah Fi‘liyah"]],
      ["F. Struktur Jumlah Ismiyah", ["Mubtada Ma‘rifah", "Khabar Mufrad", "Khabar Jumlah", "Khabar Syibhul Jumlah", "Inna dan Saudaranya", "Kana dan Saudaranya", "Peniadaan Jumlah Ismiyah", "Pertanyaan Jumlah Ismiyah", "Perluasan Mubtada", "Analisis Jumlah Ismiyah"]],
      ["G. Pola Komunikasi", ["Meminta Informasi", "Memberi Informasi", "Meminta Izin", "Memberi Saran", "Menyatakan Kemampuan", "Menyatakan Keinginan", "Menyatakan Keharusan", "Menyatakan Larangan", "Menyetujui Pendapat", "Berbeda Pendapat dengan Santun"]],
      ["H. Tema Kehidupan SMP", ["Organisasi Murid", "Kegiatan Kelas", "Kerja Kelompok", "Literasi Digital", "Kesehatan Remaja", "Menjaga Lingkungan", "Adab Bermedia", "Pergaulan yang Baik", "Kegiatan Keagamaan", "Proyek Sekolah"]],
      ["I. Membaca dan Memahami", ["Menemukan Arti Kata", "Menentukan Gagasan Utama", "Menemukan Informasi Tersurat", "Menarik Kesimpulan", "Menentukan Urutan", "Menentukan Sebab", "Menentukan Akibat", "Membandingkan Informasi", "Merangkum Paragraf", "Memeriksa Pemahaman"]],
      ["J. Menulis dan Menyajikan", ["Menulis Frasa", "Menulis Jumlah Ismiyah", "Menulis Jumlah Fi‘liyah", "Menulis Deskripsi Diri", "Menulis Kegiatan Harian", "Menulis Pesan Singkat", "Menulis Pengumuman", "Menulis Ringkasan", "Presentasi Sederhana", "Uji Kompetensi Menengah"]],
    ],
    mahir: [
      ["A. Kelas Kata Mahir", ["Kata Benda Mahir (Isim Musytaq)", "Kata Sifat Mahir (Sifat Musyabbahah)", "Kata Kerja Mahir (Fi‘il Mujarrad dan Mazid)", "Isim Fa‘il", "Isim Maf‘ul", "Mashdar", "Isim Zaman", "Isim Makan", "Isim Alat", "Analisis Kelas Kata"]],
      ["B. Sharaf", ["Wazan Fa‘ala", "Wazan Fa‘‘ala", "Wazan Fā‘ala", "Wazan Af‘ala", "Wazan Tafa‘‘ala", "Wazan Tafā‘ala", "Wazan Infa‘ala", "Wazan Ifta‘ala", "Wazan Istaf‘ala", "Analisis Perubahan Makna"]],
      ["C. I‘rab Lanjutan", ["Rafa‘ dengan Dhammah", "Rafa‘ dengan Alif dan Wawu", "Nashab dengan Fathah", "Nashab dengan Ya", "Jar dengan Kasrah", "Jar dengan Ya", "Jazm dengan Sukun", "Af‘alul Khamsah", "Asmaul Khamsah", "Analisis I‘rab Lengkap"]],
      ["D. Struktur Kompleks", ["Kana dan Saudaranya", "Inna dan Saudaranya", "Lā Nafiyah lil-Jins", "Na‘at Sababi", "Hal", "Tamyiz", "Badal", "Taukid", "Istitsna", "Nida"]],
      ["E. Uslub", ["Uslub Istifham", "Uslub Nafi", "Uslub Nahyi", "Uslub Amr", "Uslub Syarth", "Uslub Ta‘ajjub", "Uslub Tafdhil", "Uslub Qashr", "Uslub Taukid", "Uslub Hikmah"]],
      ["F. Kalimat Majemuk", ["Sebab dengan Li’anna", "Akibat dengan Fa", "Urutan dengan Tsumma", "Pilihan dengan Au", "Pertentangan dengan Lakin", "Syarat dengan In", "Tujuan dengan Li", "Keterangan dengan Alladzi", "Kalimat Relatif", "Analisis Hubungan Antarklausa"]],
      ["G. Membaca Akademik", ["Mengenali Topik", "Menentukan Tesis", "Menemukan Argumen", "Menilai Bukti", "Membedakan Fakta dan Pendapat", "Menemukan Istilah Kunci", "Membaca Tabel", "Membaca Infografis", "Meringkas Teks", "Mengevaluasi Sumber"]],
      ["H. Menulis Akademik", ["Kalimat Topik", "Kalimat Penjelas", "Paragraf Deskriptif", "Paragraf Naratif", "Paragraf Eksposisi", "Paragraf Argumentatif", "Ringkasan Akademik", "Laporan Kegiatan", "Proposal Proyek", "Artikel Singkat"]],
      ["I. Bahasa Arab Dunia Kerja", ["Profil Diri Profesional", "Surat Elektronik", "Wawancara Magang", "Keselamatan Kerja", "Instruksi Kerja", "Pelayanan Pelanggan", "Laporan Praktik", "Presentasi Produk", "Pemecahan Masalah", "Etika Profesi"]],
      ["J. Analisis dan Produksi", ["Analisis Teks Keagamaan", "Analisis Teks Lingkungan", "Analisis Teks Sejarah", "Analisis Teks Teknologi", "Terjemah Terbimbing", "Terjemah Kontekstual", "Pidato Singkat", "Debat Santun", "Presentasi Akademik", "Uji Kompetensi Mahir"]],
    ],
    percakapan: [
      ["A. Fondasi Percakapan", ["Kata Benda dalam Percakapan", "Kata Sifat dalam Percakapan", "Kata Kerja dalam Percakapan", "Salam dan Jawaban Salam", "Menanyakan Nama", "Menanyakan Kabar", "Memperkenalkan Diri", "Memperkenalkan Teman", "Ucapan Terima Kasih", "Ucapan Perpisahan"]],
      ["B. Percakapan di Kelas", ["Meminta Izin Masuk", "Meminta Izin Keluar", "Meminta Pengulangan", "Meminta Penjelasan", "Menjawab Pertanyaan Guru", "Bertanya kepada Guru", "Meminjam Alat Tulis", "Diskusi Kelompok", "Presentasi Kelas", "Mengakhiri Pelajaran"]],
      ["C. Percakapan di Sekolah", ["Di Perpustakaan", "Di Laboratorium", "Di Kantin", "Di Ruang Guru", "Di Lapangan", "Di Organisasi Murid", "Menanyakan Jadwal", "Menanyakan Ruangan", "Mengundang Teman", "Menyampaikan Pengumuman"]],
      ["D. Percakapan di Rumah", ["Berbicara dengan Ayah", "Berbicara dengan Ibu", "Berbicara dengan Saudara", "Meminta Bantuan", "Menawarkan Bantuan", "Menyambut Tamu", "Meminta Maaf", "Meminta Izin Pergi", "Membagi Tugas Rumah", "Merencanakan Kegiatan Keluarga"]],
      ["E. Percakapan Ibadah", ["Menanyakan Waktu Sholat", "Pergi ke Masjid", "Berwudhu", "Membaca Al Qur'an", "Menghafal Al Qur'an", "Berdoa", "Bersedekah", "Puasa", "Mengikuti Kajian", "Menjaga Adab di Masjid"]],
      ["F. Percakapan Umum", ["Menanyakan Arah", "Di Halte", "Di Stasiun", "Di Pasar", "Di Toko Buku", "Di Rumah Sakit", "Di Tempat Wisata", "Memesan Makanan", "Membayar Barang", "Menanyakan Harga"]],
      ["G. Percakapan Sosial", ["Menjenguk Teman", "Mengucapkan Selamat", "Menghibur Teman", "Memberi Nasihat", "Menerima Nasihat", "Menyetujui Pendapat", "Tidak Setuju dengan Santun", "Menyelesaikan Kesalahpahaman", "Bekerja Sama", "Menghargai Perbedaan"]],
      ["H. Percakapan Digital", ["Mengirim Pesan", "Menanyakan Berkas", "Rapat Daring", "Etika Grup Kelas", "Meminta Tautan", "Mengirim Tugas", "Menjaga Privasi", "Memeriksa Sumber", "Melaporkan Kendala", "Menutup Percakapan Daring"]],
      ["I. Percakapan Dunia Kerja", ["Memperkenalkan Keahlian", "Wawancara Magang", "Menerima Instruksi", "Memastikan Instruksi", "Melaporkan Hasil", "Melayani Pelanggan", "Menangani Keluhan", "Menawarkan Produk", "Rapat Proyek", "Evaluasi Pekerjaan"]],
      ["J. Percakapan Mahir", ["Menyatakan Pendapat", "Memberi Alasan", "Menyajikan Bukti", "Membandingkan Pilihan", "Menarik Kesimpulan", "Bernegosiasi", "Memimpin Diskusi", "Debat Santun", "Presentasi Solusi", "Uji Kompetensi Percakapan"]],
    ],
  };

  const levelMetadata = {
    dasar: {
      label: "Dasar",
      icon: "🌱",
      description: "Fondasi isim, kata sifat, fi‘il, dan kalimat dasar untuk SD–SMP.",
      audience: "SD–SMP",
    },
    menengah: {
      label: "Menengah",
      icon: "🧭",
      description: "Nahwu, tashrif, membaca, dan menulis kontekstual untuk SMP.",
      audience: "SMP",
    },
    mahir: {
      label: "Mahir",
      icon: "🏆",
      description: "Sharaf, i‘rab, teks akademik, dan bahasa dunia kerja untuk SMP–SMK.",
      audience: "SMP–SMK",
    },
    percakapan: {
      label: "Percakapan",
      icon: "💬",
      description: "Seratus situasi hiwar dari lingkungan sekolah sampai dunia kerja.",
      audience: "SD–SMK",
    },
  };

  const typeLabels = {
    noun: "isim/kata benda",
    adjective: "na‘at/kata sifat",
    verb: "fi‘il/kata kerja",
    pronoun: "dhamir/kata ganti",
    demonstrative: "isim isyarah/kata tunjuk",
    particle: "huruf/partikel",
    question: "isim istifham/kata tanya",
    expression: "ungkapan",
  };

  const domainLabels = {
    school: "sekolah",
    digital: "teknologi",
    family: "keluarga",
    home: "rumah",
    worship: "ibadah",
    nature: "lingkungan",
    work: "dunia kerja",
    travel: "perjalanan",
    character: "akhlak",
    place: "tempat",
    time: "waktu",
    number: "bilangan",
    conversation: "percakapan",
    general: "umum",
  };

  function inferConcept(title) {
    if (/kata benda|isim\b|mudhaf|idhafah/i.test(title)) return /idhafah|mudhaf/i.test(title) ? "idafa" : "noun";
    if (/kata sifat|na‘at|sifat/i.test(title)) return "adjective";
    if (/kata kerja|fi‘il|tashrif|wazan/i.test(title)) return /tashrif|wazan|mujarrad|mazid/i.test(title) ? "morphology" : "verb";
    if (/dhamir|kata ganti/i.test(title)) return "pronoun";
    if (/isyarah|kata tunjuk/i.test(title)) return "demonstrative";
    if (/tanya|istifham/i.test(title)) return "question";
    if (/huruf|jar|‘athaf|sambung|keterangan|zharaf/i.test(title)) return "particle";
    if (/jumlah ismiyah|mubtada|khabar|inna|kana|isimiyah/i.test(title)) return "nominal";
    if (/jumlah fi‘liyah|fa‘il|maf‘ul|fi‘liyah|aktif|pasif/i.test(title)) return "verbal";
    if (/mudzakkar|muannats|jenis/i.test(title)) return "gender";
    if (/mufrad|mutsanna|jamak|angka|bilangan/i.test(title)) return "number";
    if (/ma‘rifah|nakirah|alif lam/i.test(title)) return "definite";
    if (/madhi|mudhari|amr|masa depan|waktu fi/i.test(title)) return "tense";
    if (/negatif|peniadaan|nafi|nahyi/i.test(title)) return "negation";
    if (/banding|tafḍ|tafdhil/i.test(title)) return "comparison";
    if (/syarat|syarth/i.test(title)) return "condition";
    if (/i‘rab|rafa|nashab|majrur|jar dengan|jazm|khamsah/i.test(title)) return "irab";
    if (/sharaf|mashdar|musytaq|isim fa|isim maf|isim alat/i.test(title)) return "morphology";
    if (/percakapan|meminta|menanyakan|ucapan|berbicara|menjawab|diskusi|wawancara|melayani|pesan|rapat|menyatakan|memberi|menerima|mengundang|menawarkan|melaporkan|debat|presentasi/i.test(title)) return "conversation";
    return "noun";
  }

  function inferDomain(title, section) {
    const text = `${title} ${section}`.toLocaleLowerCase("id");
    if (/sekolah|kelas|guru|belajar|pelajaran|perpustakaan|laboratorium|akademik/.test(text)) return "school";
    if (/rumah|keluarga|ayah|ibu|saudara/.test(text)) return "home";
    if (/ibadah|sholat|masjid|wudhu|qur'an|doa|puasa|kajian|sedekah/.test(text)) return "worship";
    if (/lingkungan|alam|bumi/.test(text)) return "nature";
    if (/digital|teknologi|berkas|daring|privasi|sumber/.test(text)) return "digital";
    if (/kerja|magang|profesi|pelanggan|produk|proyek/.test(text)) return "work";
    if (/arah|halte|stasiun|wisata|perjalanan/.test(text)) return "travel";
    if (/waktu|hari|bulan|jam|jadwal/.test(text)) return "time";
    return "general";
  }

  function buildTopics(levelId) {
    let number = 0;
    return topicSections[levelId].flatMap(([section, titles]) => titles.map((title) => {
      number += 1;
      const concept = inferConcept(title);
      return {
        id: `${levelId}-${String(number).padStart(3, "0")}`,
        number,
        title,
        section,
        concept,
        domain: inferDomain(title, section),
        audience: levelMetadata[levelId].audience,
        questionsCount: 100,
        description: `${section}. Latihan ${title.toLocaleLowerCase("id")} melalui kosakata, bentuk kata, makna, struktur, dan penerapan.`,
      };
    }));
  }

  const levels = Object.keys(topicSections).map((levelId) => {
    const topics = buildTopics(levelId);
    return {
      id: levelId,
      ...levelMetadata[levelId],
      topics,
      lessons: topics,
    };
  });

  function hashString(value) {
    let hash = 2166136261;
    for (const character of String(value)) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function seededRandom(seed) {
    let state = seed >>> 0;
    return () => {
      state += 0x6d2b79f5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffled(items, random) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const target = Math.floor(random() * (index + 1));
      [result[index], result[target]] = [result[target], result[index]];
    }
    return result;
  }

  function uniqueOptions(correct, candidates, random) {
    const values = [correct, ...shuffled(candidates.filter((item) => item !== correct), random)];
    const unique = [...new Set(values)].slice(0, 4);
    while (unique.length < 4) unique.push(`Pilihan ${unique.length + 1}`);
    const options = shuffled(unique, random);
    return { options, answer: options.indexOf(correct) };
  }

  function entriesForTopic(topic) {
    const conceptType = {
      noun: "noun",
      adjective: "adjective",
      verb: "verb",
      pronoun: "pronoun",
      demonstrative: "demonstrative",
      question: "question",
      particle: "particle",
      conversation: "expression",
    }[topic.concept];
    const exact = vocabulary.filter((entry) => (
      (!conceptType || entry.type === conceptType)
      && (topic.domain === "general" || entry.domain === topic.domain || entry.domain === "general")
    ));
    const sameType = conceptType ? vocabulary.filter((entry) => entry.type === conceptType) : [];
    const sameDomain = vocabulary.filter((entry) => entry.domain === topic.domain);
    return [...new Map([...exact, ...sameType, ...sameDomain, ...vocabulary].map((entry) => [entry.id, entry])).values()];
  }

  function sentenceFor(entry) {
    if (entry.type === "noun") return `${/ةٌ$/.test(entry.arabic) ? "هٰذِهِ" : "هٰذَا"} ${entry.arabic}`;
    if (entry.type === "adjective") return `الْكِتَابُ ${entry.arabic}`;
    if (entry.type === "verb") return `${entry.arabic} الطَّالِبُ`;
    if (entry.type === "pronoun") return `${entry.arabic} طَالِبٌ`;
    if (entry.type === "demonstrative") return `${entry.arabic} كِتَابٌ`;
    if (entry.type === "particle") return `الْكِتَابُ ${entry.arabic} الْمَكْتَبِ`;
    if (entry.type === "question") return `${entry.arabic} الْكِتَابُ؟`;
    return entry.arabic;
  }

  function questionFromEntry(topic, entry, mode, index, random) {
    const concept = grammarConcepts[topic.concept] || grammarConcepts.noun;
    const otherEntries = vocabulary.filter((item) => item.id !== entry.id);
    const concepts = Object.values(grammarConcepts);
    let prompt = "";
    let correct = "";
    let candidates = [];
    let arabicPrompt = entry.arabic;
    let explanation = "";

    if (mode === 0) {
      prompt = `Apa arti kata ${entry.arabic}?`;
      correct = entry.meaning;
      candidates = otherEntries.filter((item) => item.type === entry.type).map((item) => item.meaning);
      explanation = `${entry.arabic} berarti “${entry.meaning}”.`;
    } else if (mode === 1) {
      prompt = `Manakah bentuk Arab yang tepat untuk “${entry.meaning}”?`;
      correct = entry.arabic;
      candidates = otherEntries.filter((item) => item.type === entry.type).map((item) => item.arabic);
      explanation = `Bentuk Arab “${entry.meaning}” adalah ${entry.arabic}.`;
    } else if (mode === 2) {
      prompt = `Manakah transliterasi yang tepat untuk ${entry.arabic}?`;
      correct = entry.transliteration;
      candidates = otherEntries.filter((item) => item.type === entry.type).map((item) => item.transliteration);
      explanation = `${entry.arabic} dibaca ${entry.transliteration}.`;
    } else if (mode === 3) {
      prompt = `Kata ${entry.arabic} termasuk kelas kata apa?`;
      correct = typeLabels[entry.type];
      candidates = Object.values(typeLabels);
      explanation = `${entry.arabic} termasuk ${typeLabels[entry.type]}.`;
    } else if (mode === 4) {
      prompt = `Pilih pasangan kata dan makna yang benar pada topik “${topic.title}”.`;
      correct = `${entry.arabic} — ${entry.meaning}`;
      candidates = shuffled(otherEntries, random).slice(0, 8).map((item) => `${entry.arabic} — ${item.meaning}`);
      explanation = `Pasangan yang benar ialah ${entry.arabic} — ${entry.meaning}.`;
    } else if (mode === 5) {
      prompt = `Pernyataan yang tepat tentang ${concept[0]} adalah …`;
      correct = concept[1];
      candidates = concepts.filter((item) => item !== concept).map((item) => item[1]);
      arabicPrompt = concept[2];
      explanation = `${concept[0]}: ${concept[1]}`;
    } else if (mode === 6) {
      prompt = `Manakah contoh yang paling sesuai dengan topik “${topic.title}”?`;
      correct = concept[2];
      candidates = concepts.filter((item) => item !== concept).map((item) => item[2]);
      arabicPrompt = concept[2];
      explanation = `${concept[2]} berarti “${concept[3]}”.`;
    } else if (mode === 7) {
      prompt = `Kosakata ${entry.arabic} paling dekat dengan tema …`;
      correct = domainLabels[entry.domain] || "umum";
      candidates = Object.values(domainLabels);
      explanation = `${entry.arabic} digunakan dalam tema ${correct}.`;
    } else if (mode === 8) {
      const sentence = sentenceFor(entry);
      prompt = `Pilih kata yang tepat untuk melengkapi pola: ${sentence.replace(entry.arabic, "____")}`;
      correct = entry.arabic;
      candidates = otherEntries.filter((item) => item.type === entry.type).map((item) => item.arabic);
      arabicPrompt = sentence.replace(entry.arabic, "____");
      explanation = `Kalimat lengkapnya: ${sentence}.`;
    } else {
      prompt = `Analisis yang benar untuk contoh ${concept[2]} adalah …`;
      correct = `${concept[0]} — ${concept[3]}`;
      candidates = concepts.filter((item) => item !== concept).map((item) => `${item[0]} — ${item[3]}`);
      arabicPrompt = concept[2];
      explanation = `${concept[2]} merupakan contoh ${concept[0]} dan bermakna “${concept[3]}”.`;
    }

    const choice = uniqueOptions(correct, candidates, random);
    return {
      id: `${topic.id}-q-${String(index + 1).padStart(3, "0")}`,
      number: index + 1,
      prompt,
      arabicPrompt,
      options: choice.options,
      answer: choice.answer,
      explanation,
      topicId: topic.id,
    };
  }

  function createQuestionSet(levelId, topicId, sessionSeed = Date.now()) {
    const level = levels.find((item) => item.id === levelId) || levels[0];
    const topic = level.topics.find((item) => item.id === topicId) || level.topics[0];
    const random = seededRandom(hashString(`${level.id}|${topic.id}|${sessionSeed}`));
    const entries = shuffled(entriesForTopic(topic), random);
    const questions = Array.from({ length: 100 }, (_, index) => {
      const entry = entries[(index + topic.number) % entries.length];
      return questionFromEntry(topic, entry, index % 10, index, random);
    });
    return shuffled(questions, random).map((question, index) => ({ ...question, number: index + 1 }));
  }

  const allTopics = levels.flatMap((level) => level.topics.map((topic) => ({
    ...topic,
    levelId: level.id,
    levelLabel: level.label,
    levelIcon: level.icon,
  })));

  window.PAIBP_ARABIC = {
    levels,
    allTopics,
    allLessons: allTopics,
    total: allTopics.length,
    totalTabs: allTopics.length,
    questionsPerTab: 100,
    totalQuestions: allTopics.length * 100,
    createQuestionSet,
  };
})();
