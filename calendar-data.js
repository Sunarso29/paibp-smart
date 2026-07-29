(() => {
  const sources = {
    national: {
      label: "Sekretariat Negara — SKB 3 Menteri Libur Nasional dan Cuti Bersama 2026",
      url: "https://setneg.go.id/baca/index/inilah_skb_3_menteri_libur_nasional_dan_cuti_bersama_2026",
    },
    academic: {
      label: "Dinas Pendidikan Provinsi Jawa Tengah — Kaldik Tahun Ajaran 2026/2027",
      url: "https://pdk.jatengprov.go.id/index.php/2026/06/06/pedoman-penyusunan-kalender-pendidikan-provinsi-jawa-tengah-tahun-ajaran-2026-2027/",
    },
  };

  const datedEvents = [
    ["2026-01-01", "Tahun Baru Masehi", "holiday", "Hari libur nasional."],
    ["2026-01-16", "Isra Mikraj Nabi Muhammad Sholallohu 'Alaihi Wasallam", "holiday", "Hari libur nasional."],
    ["2026-02-16", "Cuti Bersama Tahun Baru Imlek", "collective-leave", "Cuti bersama nasional."],
    ["2026-02-17", "Tahun Baru Imlek", "holiday", "Hari libur nasional."],
    ["2026-03-18", "Cuti Bersama Hari Suci Nyepi", "collective-leave", "Cuti bersama nasional."],
    ["2026-03-19", "Hari Suci Nyepi", "holiday", "Hari libur nasional."],
    ["2026-03-20", "Cuti Bersama Idul Fitri", "collective-leave", "Cuti bersama nasional."],
    ["2026-03-21", "Idul Fitri 1447 H", "holiday", "Hari libur nasional; tanggal Hijriah tetap mengikuti keputusan pemerintah."],
    ["2026-03-22", "Idul Fitri 1447 H", "holiday", "Hari libur nasional; tanggal Hijriah tetap mengikuti keputusan pemerintah."],
    ["2026-03-23", "Cuti Bersama Idul Fitri", "collective-leave", "Cuti bersama nasional."],
    ["2026-03-24", "Cuti Bersama Idul Fitri", "collective-leave", "Cuti bersama nasional."],
    ["2026-04-03", "Wafat Yesus Kristus", "holiday", "Hari libur nasional."],
    ["2026-04-05", "Kebangkitan Yesus Kristus", "holiday", "Hari libur nasional."],
    ["2026-05-01", "Hari Buruh Internasional", "holiday", "Hari libur nasional."],
    ["2026-05-14", "Kenaikan Yesus Kristus", "holiday", "Hari libur nasional."],
    ["2026-05-15", "Cuti Bersama Kenaikan Yesus Kristus", "collective-leave", "Cuti bersama nasional."],
    ["2026-05-27", "Idul Adha 1447 H", "holiday", "Hari libur nasional; tanggal Hijriah tetap mengikuti keputusan pemerintah."],
    ["2026-05-28", "Cuti Bersama Idul Adha", "collective-leave", "Cuti bersama nasional."],
    ["2026-05-31", "Hari Raya Waisak", "holiday", "Hari libur nasional."],
    ["2026-06-01", "Hari Lahir Pancasila", "holiday", "Hari libur nasional."],
    ["2026-06-16", "Tahun Baru Islam 1448 H", "holiday", "Hari libur nasional; tanggal Hijriah tetap mengikuti keputusan pemerintah."],
    ["2026-08-17", "Hari Kemerdekaan Republik Indonesia", "holiday", "Hari libur nasional."],
    ["2026-08-25", "Maulid Nabi Muhammad Sholallohu 'Alaihi Wasallam", "holiday", "Hari libur nasional menurut SKB 3 Menteri 2026."],
    ["2026-12-24", "Cuti Bersama Hari Raya Natal", "collective-leave", "Cuti bersama nasional."],
    ["2026-12-25", "Hari Raya Natal", "holiday", "Hari libur nasional."],
  ].map(([date, label, category, note]) => ({ date, label, category, note, source: "national" }));

  const recurringCommemorations = [
    [1, 10, "Hari Gerakan Satu Juta Pohon", "Peringatan lingkungan; bukan hari libur nasional."],
    [2, 21, "Hari Peduli Sampah Nasional", "Peringatan kepedulian terhadap pengelolaan sampah; bukan hari libur nasional."],
    [4, 21, "Hari Kartini", "Peringatan keteladanan R.A. Kartini; bukan hari libur nasional."],
    [4, 22, "Hari Bumi", "Peringatan kepedulian terhadap bumi; bukan hari libur nasional."],
    [5, 2, "Hari Pendidikan Nasional", "Peringatan pendidikan nasional; bukan hari libur nasional kecuali ditetapkan lain."],
    [5, 20, "Hari Kebangkitan Nasional", "Peringatan kebangkitan nasional; bukan hari libur nasional."],
    [6, 5, "Hari Lingkungan Hidup Sedunia", "Peringatan kepedulian terhadap lingkungan; bukan hari libur nasional."],
    [7, 23, "Hari Anak Nasional", "Peringatan pemenuhan hak dan perlindungan anak; bukan hari libur nasional."],
    [9, 17, "Hari Palang Merah Indonesia", "PMI didirikan pada 17 September 1945; bukan hari libur nasional."],
    [10, 1, "Hari Kesaktian Pancasila", "Peringatan nasional; bukan hari libur nasional."],
    [10, 28, "Hari Sumpah Pemuda", "Peringatan nasional; bukan hari libur nasional."],
    [11, 10, "Hari Pahlawan", "Peringatan nasional; bukan hari libur nasional."],
    [11, 12, "Hari Ayah Nasional", "Peringatan sosial di Indonesia; bukan hari libur nasional."],
    [11, 25, "Hari Guru Nasional", "Peringatan peran guru; bukan hari libur nasional."],
    [12, 22, "Hari Ibu", "Peringatan nasional; bukan hari libur nasional."],
  ].map(([month, day, label, note]) => ({ month, day, label, note, category: "commemoration" }));

  const academicEvents = [
    ["2026-07-13", "2026-07-13", "Hari pertama Tahun Ajaran 2026/2027", "academic-start", "Awal kegiatan sekolah Tahun Ajaran 2026/2027."],
    ["2026-07-13", "2026-07-17", "MPLS", "academic-activity", "Masa Pengenalan Lingkungan Sekolah."],
    ["2026-08-17", "2026-08-17", "Upacara Hari Kemerdekaan", "academic-activity", "Agenda Kaldik Provinsi Jawa Tengah."],
    ["2026-10-01", "2026-10-01", "Upacara Hari Kesaktian Pancasila", "academic-activity", "Agenda Kaldik Provinsi Jawa Tengah."],
    ["2026-10-28", "2026-10-28", "Peringatan Sumpah Pemuda", "academic-activity", "Agenda Kaldik Provinsi Jawa Tengah."],
    ["2026-11-10", "2026-11-10", "Peringatan Hari Pahlawan", "academic-activity", "Agenda Kaldik Provinsi Jawa Tengah."],
    ["2026-12-18", "2026-12-18", "Pembagian laporan Semester Gasal", "academic-report", "Untuk satuan pendidikan lima hari sekolah."],
    ["2026-12-19", "2026-12-19", "Pembagian laporan Semester Gasal", "academic-report", "Untuk satuan pendidikan enam hari sekolah."],
    ["2026-12-21", "2027-01-01", "Libur Semester Gasal", "academic-break", "Rentang lima hari sekolah; enam hari sekolah sampai 2 Januari 2027."],
    ["2027-01-05", "2027-01-05", "Isra Mikraj Nabi Muhammad Sholallohu 'Alaihi Wasallam", "academic-activity", "Tanggal pada Kaldik Provinsi Jawa Tengah Tahun Ajaran 2026/2027."],
    ["2027-02-10", "2027-02-10", "Perkiraan awal libur Ramadhan", "academic-break", "Tanggal perkiraan dari Kaldik; sesuaikan keputusan resmi pemerintah dan sekolah."],
    ["2027-03-09", "2027-03-13", "Libur sekitar Idul Fitri", "academic-break", "Rentang pada Kaldik Provinsi Jawa Tengah."],
    ["2027-06-18", "2027-06-18", "Pembagian laporan Semester Genap", "academic-report", "Untuk satuan pendidikan lima hari sekolah."],
    ["2027-06-19", "2027-06-19", "Pembagian laporan Semester Genap", "academic-report", "Untuk satuan pendidikan enam hari sekolah."],
    ["2027-06-21", "2027-07-10", "Libur akhir Tahun Ajaran", "academic-break", "Libur akhir Tahun Ajaran 2026/2027."],
    ["2027-07-12", "2027-07-12", "Awal Tahun Ajaran 2027/2028", "academic-start", "Perkiraan awal Tahun Ajaran berikutnya menurut Kaldik."],
  ].map(([start, end, label, category, note]) => ({ start, end, label, category, note, source: "academic" }));

  window.PAIBP_CALENDAR = Object.freeze({
    sources,
    datedEvents,
    recurringCommemorations,
    academicEvents,
  });
})();
