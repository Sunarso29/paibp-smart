(() => {
  const byChapter = {
    "VII-1": [
      ["vG1Bk8bPw4s", "Mengapa Al Qur'an Dijadikan Pedoman Hidup?", "Video pembelajaran PAI"],
      ["JiRTzejjiP8", "Kewajiban Mengikuti Al Qur'an dan Sunnah yang Shahih", "Kajian Islam"],
    ],
    "VII-2": [
      ["s62aAcXStmw", "PAI Kelas VII: Asmaul Husna", "Pembelajaran PAI Kemenag"],
      ["yLnEqNEjxWM", "Memaknai Asma Al-Jalilu", "NU Online"],
    ],
    "VII-3": [
      ["hZh7xxeFrKE", "Keutamaan Dzikir", "Yufid.TV"],
      ["RqQj2hf8QHI", "Keutamaan Dzikir Setelah Sholat", "Yufid.TV"],
    ],
    "VII-4": [
      ["Zl8FDKaJT8s", "Bagaimana Cara Sujud Syukur", "Kajian Islam"],
      ["LS3vJR7oC7A", "Cara Sujud Sahwi dan Hukum Seputarnya", "Yufid.TV"],
    ],
    "VII-5": [
      ["NRdbaa73KE8", "Berdirinya Daulah Umayyah", "Pembelajaran SKI Kemenag"],
      ["bhtbvivNAD8", "Sejarah Daulah Umayyah", "Pembelajaran SKI Kemenag"],
    ],
    "VII-6": [
      ["X9UEVsbz1pw", "Gambaran Besarnya Kekuasaan Allah Subhanahu Wata'ala", "Yufid.TV"],
      ["gu0NqImCQvM", "Allah Subhanahu Wata'ala Menjaga Alam Semesta", "Yufid.TV"],
    ],
    "VII-7": [
      ["Mz5Hbt-8MFA", "Pentingnya Muhasabah dalam Perspektif Al Qur'an", "TV Muhammadiyah"],
      ["1pnsp5l9Uvc", "Muhasabah sebagai Tazkiyah", "Kajian Muhammadiyah"],
    ],
    "VII-8": [
      ["ZyLdvyo3Avw", "Tabayun dalam Kehidupan", "Penyejuk Qolbu"],
      ["4aVMcOc9tSQ", "Bahaya Gibah", "Kajian Islam"],
    ],
    "VII-9": [
      ["Uo3nWhLM19w", "Apa Itu Rukhsah?", "Yufid.TV"],
      ["doni0YXwfio", "Hukum Mengambil Rukhsah", "Yufid.TV"],
    ],
    "VII-10": [
      ["na6POoEewBc", "Mengenal Ulama Besar dari Andalusia", "NU Online"],
      ["0ZVNO9-17ds", "Sejarah Ilmu Pengetahuan di Andalusia", "Kajian sejarah Islam"],
    ],
    "VIII-1": [
      ["AHnY1DzkurE", "Konsep Islam dalam Menjaga Lingkungan Hidup", "TV Muhammadiyah"],
      ["jIuvm1t7h3o", "Menjaga Lingkungan melalui Green Qurban", "TV Muhammadiyah"],
    ],
    "VIII-2": [
      ["8Uq4IEl4E94", "Berapa Kitab yang Diturunkan Allah Subhanahu Wata'ala?", "Yufid.TV"],
      ["3tkCq74uv44", "Cara Beriman kepada Kitab Allah Subhanahu Wata'ala", "Yufid.TV"],
    ],
    "VIII-3": [
      ["A0c4Cky8CdU", "Keutamaan Pedagang yang Jujur dan Amanah", "Yufid.TV"],
      ["u9nzFsMgwjo", "Kisah Kejujuran yang Mengharukan", "Yufid.TV"],
    ],
    "VIII-4": [
      ["G_SYWSB1AVQ", "Tata Cara Sholat Gerhana Sesuai Sunnah", "Yufid.TV"],
      ["CuMgQcZAzDs", "Sholat Gerhana, Istisqa, dan Jenazah", "Pembelajaran PAI Kelas VIII"],
    ],
    "VIII-5": [
      ["vJkeSDqEWME", "Dinasti Abbasiyah dan Baitul Hikmah", "Sejarah Islam"],
      ["8i4H5pcY3GI", "Kejayaan Daulah Abbasiyah", "Pembelajaran sejarah Islam"],
    ],
    "VIII-6": [
      ["JUBha95Gl9s", "Moderasi Beragama", "Kementerian Agama RI"],
      ["M1rfdWbIAhY", "Apa, Mengapa, dan Bagaimana Moderasi Beragama", "Kementerian Agama RI"],
    ],
    "VIII-7": [
      ["DSX3NaYmQIw", "Tanda Beriman kepada Rasul Allah Subhanahu Wata'ala", "Yufid.TV"],
      ["KVG1MlTLlow", "Iman kepada Nabi dan Rasul", "Kajian Hadits Jibril"],
    ],
    "VIII-8": [
      ["cumSX5r6wO8", "Dialog Kerukunan Lintas Agama", "Kementerian Agama RI"],
      ["kBLbWsihHKI", "Keberagaman dan Hidup Berdampingan", "Badan Moderasi Beragama"],
    ],
    "VIII-9": [
      ["7baubEUY6Ho", "Perbedaan Riba dan Jual Beli", "Yufid.TV"],
      ["rAayy3tCwhU", "Macam Riba dalam Jual Beli dan Contohnya", "Yufid.TV"],
    ],
    "VIII-10": [
      ["E65JCM-sd6c", "Ilmuwan Muslim pada Masa Daulah Abbasiyah", "Pembelajaran SKI Kemenag"],
      ["-5QBHazo1_s", "Al-Idrisi, Bapak Peta Dunia", "NU Online"],
    ],
    "IX-1": [
      ["EwSSlK1K68E", "Keutamaan Menuntut Ilmu Agama", "Yufid.TV"],
      ["3YT76hj9u6A", "Adab Menuntut Ilmu", "Yufid.TV"],
    ],
    "IX-2": [
      ["xlBdfhecYl4", "Manfaat Beriman kepada Hari Akhir", "Yufid.TV"],
      ["_blMfqh_VAo", "Makna Beriman kepada Hari Akhir", "Yufid.TV"],
    ],
    "IX-3": [
      ["sgANal3sNUY", "Indahnya Etika Pergaulan dan Komunikasi Islam", "Pembelajaran PAI Kemenag"],
      ["ugHBXnKftEM", "Etika Pergaulan dalam Islam", "Pembelajaran PAI Kemenag"],
    ],
    "IX-4": [
      ["jDH6UslyzEA", "Cara Menghitung Hari Ketujuh Akikah", "Yufid.TV"],
      ["wcgcpJP9g44", "Adab dan Tata Cara Kurban", "Yufid.TV"],
    ],
    "IX-5": [
      ["Rr0XY6lmOBk", "Proses Lahirnya Daulah Usmani", "Pembelajaran SKI"],
      ["V6jS60taqjE", "Meneladani Kejayaan Turki Usmani", "Kajian sejarah Islam"],
    ],
    "IX-6": [
      ["yRWHV_SOboA", "Memelihara dan Menjaga Bumi dalam Perspektif Al Qur'an", "TV Muhammadiyah"],
      ["wyZBspJOtbU", "Pencemaran Air dan Darat dalam Perspektif Islam", "Fiqih Lingkungan Muhammadiyah"],
    ],
    "IX-7": [
      ["GKc0XTR5ZMg", "Iman kepada Qada dan Qadar", "Yufid.TV"],
      ["CHYf2deD0Pw", "Buah Iman kepada Qada dan Qadar", "Yufid.TV"],
    ],
    "IX-8": [
      ["PG_0ibjHYqU", "Peradaban dan Seni Islam pada Masa Modern", "Pembelajaran PAI"],
      ["SdupGz6R9FU", "Islam adalah Agama Toleran", "Kajian Islam"],
    ],
    "IX-9": [
      ["P3qcw7Hv0qA", "Mengenal Imam Mazhab dan Keteguhan Beribadah", "Pembelajaran PAI Kelas IX"],
      ["4Vn3_0wgV6w", "Kealiman Imam Syafi'i", "NU Online"],
    ],
    "IX-10": [
      ["6Jjfp8FTIcs", "Sejarah Peradaban Islam: Safawi dan Mughal", "Kajian sejarah Islam"],
      ["PG_0ibjHYqU", "Peradaban Islam pada Masa Modern", "Pembelajaran PAI"],
    ],
  };

  window.PAIBP_VIDEOS = Object.fromEntries(
    Object.entries(byChapter).map(([chapterId, videos]) => [
      chapterId,
      videos.map(([id, title, channel], index) => ({
        id,
        slot: index + 1,
        title,
        channel,
        url: `https://www.youtube.com/watch?v=${id}`,
      })),
    ]),
  );
})();
