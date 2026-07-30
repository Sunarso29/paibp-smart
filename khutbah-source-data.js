(() => {
  "use strict";

  const portals = [
    {
      id: "nu",
      name: "NU Online",
      label: "Pusat Khutbah NU",
      description: "Kumpulan naskah khutbah dengan teks Arab, materi aktual, tombol cetak, dan pada sejumlah artikel tersedia unduhan PDF.",
      url: "https://islam.nu.or.id/khutbah",
      badge: "Naskah & PDF",
    },
    {
      id: "muhammadiyah",
      name: "Muhammadiyah",
      label: "Khutbah Muhammadiyah",
      description: "Naskah khutbah resmi Muhammadiyah dengan pembahasan akidah, ibadah, akhlak, keluarga, sosial, dan isu kontemporer.",
      url: "https://muhammadiyah.or.id/khutbah-jumat/",
      badge: "Naskah resmi",
    },
    {
      id: "kemenag",
      name: "Kementerian Agama RI",
      label: "Khutbah Kementerian Agama",
      description: "Artikel dan naskah khutbah dari kanal resmi Kementerian Agama Republik Indonesia.",
      url: "https://kemenag.go.id/islam",
      badge: "Sumber pemerintah",
    },
    {
      id: "yufid",
      name: "Yufid TV",
      label: "Khutbah Jumat Yufid",
      description: "Video dan audio khutbah Jumat untuk pengayaan penyampaian, intonasi, serta bahan telaah khatib.",
      url: "https://yufid.tv/category/khutbah-jumat",
      badge: "Video & audio",
    },
    {
      id: "rodja",
      name: "Radio Rodja",
      label: "Khutbah Jumat Radio Rodja",
      description: "Arsip rekaman, teks ringkas, pemutar, dan unduhan MP3 khutbah Jumat Masjid Al-Barkah.",
      url: "https://www.radiorodja.com/download/khutbah-jumat/",
      badge: "Audio & MP3",
    },
  ];

  const curated = [
    {
      title: "Pola Makan Sehat untuk Menjaga Kesehatan dan Meningkatkan Ibadah",
      publisher: "NU Online",
      url: "https://islam.nu.or.id/khutbah/khutbah-jumat-pola-makan-sehat-untuk-menjaga-kesehatan-dan-meningkatkan-ibadah-0LIWN",
      topic: "Kesehatan dan ibadah",
    },
    {
      title: "Jangan Gadaikan Kejujuran demi Kepentingan Dunia",
      publisher: "NU Online",
      url: "https://islam.nu.or.id/khutbah/khutbah-jumat-jangan-gadaikan-kejujuran-demi-kepentingan-dunia-MvVwe",
      topic: "Kejujuran",
    },
    {
      title: "Keutamaan Puasa Tasua dan Asyura",
      publisher: "Muhammadiyah",
      url: "https://muhammadiyah.or.id/2026/06/khutbah-jumat-keutamaan-puasa-tasua-dan-asyura/",
      topic: "Ibadah sunnah",
    },
    {
      title: "Menempatkan Amanah Jabatan pada Ahlinya",
      publisher: "Muhammadiyah",
      url: "https://muhammadiyah.or.id/2026/06/khutbah-jumat-menempatkan-amanah-jabatan-pada-ahlinya/",
      topic: "Amanah dan kepemimpinan",
    },
    {
      title: "Belajar dari Perang Badar: Disiplin, Musyawarah, dan Tawakal",
      publisher: "Kementerian Agama RI",
      url: "https://kemenag.go.id/islam/khutbah-jumat-belajar-dari-perang-badar-disiplin-musyawarah-dan-tawakal-saat-ramadan-qegxA",
      topic: "Sejarah dan karakter",
    },
    {
      title: "Ramadan dan Jalan Kejujuran, dari Muraqabah menuju Amanah",
      publisher: "Kementerian Agama RI",
      url: "https://kemenag.go.id/islam/khutbah-jumat-ramadan-dan-jalan-kejujuran-dari-muraqabah-menuju-amanah-8N1Mw",
      topic: "Kejujuran dan amanah",
    },
    {
      title: "Sederhananya Hidup Rasul",
      publisher: "Yufid TV",
      url: "https://yufid.tv/51823-sederhananya-hidup-rasul-ustadz-fakhruddin-abdurrahman-lc-m-pd-khutbah-jumat.html",
      topic: "Keteladanan Nabi",
    },
    {
      title: "Khutbah Jumat: Ujian Keimanan dan Musibah Agama",
      publisher: "Radio Rodja",
      url: "https://www.radiorodja.com/55928-khutbah-jumat-ujian-keimanan-dan-musibah-agama/",
      topic: "Iman dan ujian",
    },
  ];

  window.PAIBP_KHUTBAH_SOURCES = Object.freeze({ portals, curated });
})();
