# PAIBP SMART SMP

Portal pembelajaran Pendidikan Agama Islam dan Budi Pekerti untuk kelas VII, VIII, dan IX SMP.

## Fitur Utama

- Ruang Murid: 30 paket belajar dengan pendahuluan, pengertian, dalil, infografis, ikhtisar, latihan, LKPD yang langsung dapat diketik, dua video per bab, unduhan materi, serta validasi tujuh syarat sebelum bab dapat ditandai selesai.
- Ruang Guru: akses melalui nama, unit kerja, dan NIP opsional; CP, KKTP, ATP, Prota, Promes, analisis alokasi waktu, 30 modul lengkap, Kalender Pendidikan, kendali aktivitas, dan rekap tugas terpisah per kelas.
- Ruang Editor: akses admin standar `261078` untuk menyunting teks beranda, galeri kegiatan, statistik, komentar, rating, balasan, dan moderasi.
- Fitur Islami: Al Qur'an daring/luring, audio surat yang dapat disimpan luring, Hisnul Muslim, dzikir pagi-petang, jadwal sholat dengan penanda waktu aktif dan hitung mundur, kalender bertanda per tanggal, nasihat bersumber dengan ruang variasi pembelajaran lebih dari satu triliun susunan, dan Akademi Bahasa Arab empat tingkat.
- Fitur Games: 100 game dalam 10 kelompok dan 15 mekanik, termasuk Sambung Ayat, 20 soal acak per sesi, penguncian sesi sampai tuntas, skor, XP, level, dan lencana.
- Dalil materi: rujukan Al Qur'an Surat dan ayat dapat diklik untuk membuka teks Arab, terjemahan Bahasa Indonesia, surat lengkap, serta pelafalan luring dari suara Arab perangkat.
- Spensus: selayang pandang sekolah, 38 tenaga pendidik termasuk kepala sekolah, 13 tenaga kependidikan, galeri dua baris pada telepon, serta editor admin dokumentasi kegiatan.

## Halaman

- `index.html` — beranda serta lima ruang utama
- `app-config.js` — konfigurasi opsional sinkronisasi rekap
- `content-data.js` — data lengkap 30 bab Ruang Murid
- `teacher-source-data.js` — tampilan terstruktur 48 perangkat sumber Ruang Guru
- `calendar-data.js` — libur, peringatan, dan Kaldik bertanggal
- `islamic-data.js` — doa, dzikir, kalender puasa/sejarah, dan nasihat bersumber
- `arabic-data.js` — 80 pelajaran Bahasa Arab Dasar, Menengah, Mahir, dan Percakapan
- `game-data.js` — 100 game, 15 bank mekanik, serta generator sesi acak
- `docx-export.js` — pembuat dan pembaca berkas Word `.docx` untuk materi, tugas, dan rekap
- `assets/data/quran-id.json` — 114 surat dan 6.236 ayat untuk pembaca dalil luring
- `assets/data/QURAN-DATA-LICENSE.txt` — atribusi dan lisensi CC BY-SA 4.0 data Al Qur'an
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

Alur tugas inti tetap dapat digunakan tanpa server: murid membuat berkas Word `.docx`, membagikannya kepada guru melalui kanal kelas, lalu guru mengimpor banyak berkas ke Rekap Pekerjaan Murid. Setelah Google Apps Script diaktifkan, tugas, aktivitas, statistik, tanggapan, dan konten editor dapat dimuat lintas perangkat. Berkas tugas dan rekap yang memuat identitas murid tidak boleh dimasukkan ke repository publik.

Alamat publik: https://sunarso29.github.io/paibp-smart/

Pengembang: Sunarso, S.Pd.I., Gr., SMP Negeri 1 Susukan, Banjarnegara, Jawa Tengah.
