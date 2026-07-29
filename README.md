# PAIBP SMART SMP

Portal pembelajaran Pendidikan Agama Islam dan Budi Pekerti untuk kelas VII, VIII, dan IX SMP.

## Fitur Utama

- Ruang Murid: 30 paket belajar dengan pendahuluan, pengertian, dalil, infografis, ikhtisar, latihan, LKPD interaktif, dua video per bab, unduhan materi, serta satu formulir jawaban terpadu di bawah materi/LKPD.
- Ruang Guru: akses berkunci, CP, KKTP, ATP, Prota, Promes, analisis alokasi waktu, dan 30 modul lengkap yang diadopsi dari 48 berkas sumber kelas VII–IX, Kalender Pendidikan, kendali aktivitas, serta rekap tugas terpisah per kelas.
- Fitur Islami: Al Qur'an daring/luring, audio surat yang dapat disimpan luring, Hisnul Muslim, dzikir pagi-petang, jadwal sholat, kalender bertanda per tanggal, nasihat bersumber, dan Akademi Bahasa Arab empat tingkat.
- Fitur Games: enam mode permainan, skor, XP, level, dan lencana.
- Spensus: selayang pandang sekolah, 38 tenaga pendidik termasuk kepala sekolah, 13 tenaga kependidikan, galeri dua baris pada telepon, serta editor admin dokumentasi kegiatan.

## Halaman

- `index.html` — beranda serta empat ruang utama
- `app-config.js` — konfigurasi opsional sinkronisasi rekap
- `content-data.js` — data lengkap 30 bab Ruang Murid
- `teacher-source-data.js` — tampilan terstruktur 48 perangkat sumber Ruang Guru
- `calendar-data.js` — libur, peringatan, dan Kaldik bertanggal
- `islamic-data.js` — doa, dzikir, kalender puasa/sejarah, dan nasihat bersumber
- `arabic-data.js` — 24 pelajaran Bahasa Arab Dasar, Menengah, Mahir, dan Percakapan
- `video-data.js` — kurasi dua video penguatan untuk setiap bab kelas VII–IX
- `school-data.js` — identitas sekolah serta data kepala sekolah, guru, dan tenaga kependidikan
- `script.js` — fungsi tab, materi, LKPD, perangkat guru, kalkulator, jadwal, dan games
- `styles.css` — desain responsif dan format cetak
- `service-worker.js` — dukungan konten inti saat koneksi terbatas
- `manifest.webmanifest` — pemasangan situs sebagai aplikasi web
- `assets/staff/` — foto web tenaga pendidik dan kependidikan
- `assets/perangkat/` — 48 berkas sumber `.docx` kelas VII–IX
- `google-apps-script/Code.gs` — backend opsional rekap akses lintas perangkat
- `PANDUAN_REKAP_REALTIME.md` — langkah aktivasi backend
- `privacy.html` — Kebijakan Privasi
- `terms.html` — Ketentuan Penggunaan
- `support.html` — pusat dukungan
- `contact.html` — kontak resmi
- `404.html` — halaman kesalahan GitHub Pages

## Publikasi

Situs diterbitkan melalui GitHub Pages dari branch `main` dan folder `/(root)`.

Alur tugas inti tetap dapat digunakan tanpa server: murid membuat berkas `.paibp`, membagikannya kepada guru melalui kanal kelas, lalu guru mengimpor banyak berkas ke Rekap Pekerjaan Murid. Setelah Google Apps Script diaktifkan, tugas dan aktivitas dapat dimuat lintas perangkat. Berkas tugas, cadangan rekap, dan CSV nilai tidak boleh dimasukkan ke repository publik.

Alamat publik: https://sunarso29.github.io/paibp-smart/

Pengembang: Sunarso, S.Pd.I., Gr., SMP Negeri 1 Susukan, Banjarnegara, Jawa Tengah.
