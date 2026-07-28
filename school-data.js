(() => {
  const school = {
    name: "SMP Negeri 1 Susukan",
    shortName: "Spensus",
    npsn: "20304047",
    address: "Jl. Raya Susukan–Banjarnegara, Panerusan Wetan, Kecamatan Susukan, Kabupaten Banjarnegara, Jawa Tengah 53475",
    status: "Sekolah negeri jenjang SMP",
    accreditation: "A",
    established: "30 Juli 1980",
    overview: [
      "SMP Negeri 1 Susukan merupakan satuan pendidikan negeri di Kecamatan Susukan, Kabupaten Banjarnegara, yang melayani pendidikan jenjang SMP.",
      "PAIBP SMART SMP dikembangkan dari lingkungan Spensus untuk memperluas akses belajar murid, mendukung kerja guru, dan membagikan praktik pembelajaran yang dapat dimanfaatkan secara bertanggung jawab.",
      "Profil ini memakai identitas satuan pendidikan pada Data Referensi Kemendikdasmen. Informasi personel mengikuti arsip foto Yearbook AI 2026 yang dilampirkan pengelola dan dapat diperbarui tanpa mengubah struktur situs.",
    ],
    sources: [
      {
        label: "Data Referensi Kemendikdasmen — NPSN 20304047",
        url: "https://referensi.data.kemendikdasmen.go.id/pendidikan/npsn/20304047",
      },
      {
        label: "Instagram resmi SMP Negeri 1 Susukan",
        url: "https://www.instagram.com/smpn1susukan_banjarnegara/",
      },
    ],
  };

  const teachers = [
    ["Dyah Rakhmawati, S.Pd.", "Bahasa Indonesia", "guru-01.webp"],
    ["Sri Mulyani, S.Pd.", "Bahasa Indonesia", "guru-02.webp"],
    ["Sri Narti, S.Pd.", "Bahasa Indonesia", "guru-03.webp"],
    ["Tri Widiarto, S.Pd.", "Bahasa Indonesia", "guru-04.webp"],
    ["Tugiyono, S.Pd.", "Bahasa Indonesia", "guru-05.webp"],
    ["Dewi Indah Rachmawati, S.Pd.", "Bahasa Inggris", "guru-06.webp"],
    ["Dyah Oedjiani, S.Pd.", "Bahasa Inggris", "guru-07.webp"],
    ["Marina Dian Alfiah, S.Pd.", "Bahasa Inggris", "guru-08.webp"],
    ["Urip Ida Restiatun, S.Pd.", "Bahasa Inggris", "guru-09.webp"],
    ["Drs. Wakhyudin", "Bahasa Jawa", "guru-10.webp"],
    ["Indriyati, S.Pd.", "Bahasa Jawa", "guru-11.webp"],
    ["Amanatulloh Amin Sudarsono, S.Sos.", "Bimbingan dan Konseling", "guru-12.webp"],
    ["Dhian Fitriningrum, S.Pd.", "Bimbingan dan Konseling", "guru-13.webp"],
    ["Khamdan Muhaimin, S.Pd. Gr.", "Bimbingan dan Konseling", "guru-14.webp"],
    ["Hari Widiarto, S.T.", "Informatika", "guru-15.webp"],
    ["Diyah Patriyana Utami, S.Pd.", "Ilmu Pengetahuan Alam", "guru-16.webp"],
    ["Eni Mulyati, S.Pd.", "Ilmu Pengetahuan Alam", "guru-17.webp"],
    ["H Setyadi, S.Pd.", "Ilmu Pengetahuan Alam", "guru-18.webp"],
    ["Ma'rifahtul Mungizah, S.Pd.", "Ilmu Pengetahuan Alam", "guru-19.webp"],
    ["Nurjanah, S.Pd.", "Ilmu Pengetahuan Alam", "guru-20.webp"],
    ["Sri Hartin Hastuti, S.Pd.", "Ilmu Pengetahuan Alam", "guru-21.webp"],
    ["Benny Triatmaja, S.Pd.", "Ilmu Pengetahuan Sosial", "guru-22.webp"],
    ["Sujoko, S.Pd.", "Ilmu Pengetahuan Sosial", "guru-23.webp"],
    ["Anjar Dian Pratiwi, S.Pd.", "Matematika", "guru-24.webp"],
    ["Dhebi Darmasari, S.Pd.", "Matematika", "guru-25.webp"],
    ["Novita Candrawati, S.Pd.", "Matematika", "guru-26.webp"],
    ["Tanti Asih Murniasih, S.Pd.", "Matematika", "guru-27.webp"],
    ["Rudiyono, S.Pd.I.", "PAIBP", "guru-28.webp"],
    ["Sunarso, S.Pd.I., Gr.", "PAIBP", "guru-29.webp"],
    ["Umi Karomah, S.Pd. Gr.", "PAIBP", "guru-30.webp"],
    ["Ety Rochani, S.H.", "Pendidikan Pancasila", "guru-31.webp"],
    ["Heni Suprapti, S.Pd.", "Pendidikan Pancasila", "guru-32.webp"],
    ["Budi Prasetiyo, S.Pd., M.Si.", "PJOK", "guru-33.webp"],
    ["Deni Hidayat, S.Pd.", "PJOK", "guru-34.webp"],
    ["Yunantoro, S.Pd.", "PJOK", "guru-35.webp"],
    ["Asriyah Tri Handayani, S.Pd.", "Prakarya", "guru-36.webp"],
    ["Asri Rahayu, S.Pd.", "Seni Budaya", "guru-37.webp"],
    ["H Arif Saifudin, S.Pd.", "Seni Budaya", "guru-38.webp"],
    ["Normalis Indra Wiguna, S.Pd.", "Seni Budaya", "guru-39.webp"],
  ].map(([name, subject, image]) => ({
    name,
    subject,
    image: `assets/staff/guru/${image}`,
  }));

  const staff = [
    ["Basiran", "Tenaga Kependidikan", "tendik-01.webp"],
    ["Dwi Putri Puspitasari", "Tenaga Kependidikan", "tendik-02.webp"],
    ["Fitria Aprili Nurhasanah Putri", "Tenaga Kependidikan", "tendik-03.webp"],
    ["Hari Teguh Wibowo, S.Pd., M.Si.", "Kepala Sekolah", "tendik-04.webp"],
    ["Jatmiko Tri Wiyono", "Tenaga Kependidikan", "tendik-05.webp"],
    ["Likun", "Tenaga Kependidikan", "tendik-06.webp"],
    ["Mangen", "Tenaga Kependidikan", "tendik-07.webp"],
    ["Rudi Haryadi Hamzah", "Tenaga Kependidikan", "tendik-08.webp"],
    ["Ruru Mulyanto, S.Sos.", "Tenaga Kependidikan", "tendik-09.webp"],
    ["Sairan", "Tenaga Kependidikan", "tendik-10.webp"],
    ["Slamet Utomo", "Tenaga Kependidikan", "tendik-11.webp"],
    ["Soekasno", "Tenaga Kependidikan", "tendik-12.webp"],
    ["Sukisno, S.I.Pust.", "Tenaga Kependidikan", "tendik-13.webp"],
    ["Sumarni", "Tenaga Kependidikan", "tendik-14.webp"],
  ].map(([name, role, image]) => ({
    name,
    role,
    image: `assets/staff/tendik/${image}`,
  }));

  // Tambahkan kegiatan baru dengan format:
  // { title: "Judul kegiatan", date: "2026-08-01", image: "assets/news/nama-foto.webp", summary: "Ringkasan singkat." }
  const news = [];

  window.PAIBP_SCHOOL = { school, teachers, staff, news };
})();
