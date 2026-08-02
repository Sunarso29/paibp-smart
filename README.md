# PAIBP SMART SMP

Portal pembelajaran Pendidikan Agama Islam dan Budi Pekerti untuk kelas VII, VIII, dan IX SMP.

## Versi 32 — Finalisasi Pra-Publikasi

Versi ini memperbaiki keterbacaan penanda waktu sholat aktif, mempercepat pemasangan PWA dengan cache audio sesuai kebutuhan, memperkuat metadata mesin pencari, dan menambahkan audit teknis akhir.

## Fitur Utama

- Ruang Murid: 30 paket belajar dengan pendahuluan, pengertian, dalil, infografis, ikhtisar, latihan, LKPD yang langsung dapat diketik, dua video per bab, unduhan materi, serta validasi tujuh syarat sebelum bab dapat ditandai selesai.
- Ruang Guru: akses melalui nama, unit kerja, dan NIP opsional; CP, KKTP, ATP, Prota, Promes dengan tabel operasional 120 JP, analisis alokasi waktu, 30 modul lengkap, Kalender Pendidikan, kendali aktivitas, dan rekap tugas terpisah per kelas.
- Ruang Editor: akses admin standar `Alifi@78` untuk menyunting teks beranda, galeri kegiatan, statistik, komentar, rating, balasan, dan moderasi.
- Fitur Islami: Al Qur'an daring/luring, audio surat yang dapat disimpan luring, Hisnul Muslim, dzikir pagi-petang, jadwal sholat dengan penanda waktu aktif dan hitung mundur, kalender bertanda per tanggal, nasihat bersumber, Akademi Bahasa Arab, Khutbah Jum'at dinamis dengan DOCX/PDF, serta Tajwid Praktis dengan audio qari yang dapat disimpan luring.
- Fitur Games: 100 game dalam 10 kelompok dan 15 mekanik, termasuk Sambung Ayat, 20 soal acak per sesi, penguncian sesi sampai tuntas, skor, XP, level, dan lencana.
- Dalil materi: rujukan Al Qur'an Surat dan ayat dapat diklik untuk membuka teks Arab, terjemahan Bahasa Indonesia, surat lengkap, serta pelafalan luring dari suara Arab perangkat.
- Spensus: selayang pandang sekolah, 38 tenaga pendidik termasuk kepala sekolah, 13 tenaga kependidikan, galeri dua baris pada telepon, ticker tamu guru, komentar/rating di akhir beranda, serta editor admin dokumentasi kegiatan.

## Halaman

- `index.html` — beranda publik, Ruang Murid, Fitur Islami, game, Spensus AI, berita, statistik, dan tanggapan
- `app-config.js` — konfigurasi opsional sinkronisasi rekap
- `content-data.js` — data lengkap 30 bab Ruang Murid
- `teacher-source-data.js` — tampilan terstruktur 48 perangkat sumber Ruang Guru
- `calendar-data.js` — libur, peringatan, dan Kaldik bertanggal
- `islamic-data.js` — doa, dzikir, kalender puasa/sejarah, dan nasihat bersumber
- `islamic-learning-data.js` — tema dan generator Khutbah Jum'at serta kurikulum Tajwid Praktis
- `arabic-data.js` — kurikulum 400 tab Bahasa Arab Dasar, Menengah, Mahir, dan Percakapan; generator 100 soal per tab atau 40.000 soal keseluruhan
- `game-data.js` — 100 game, 15 bank mekanik, serta generator sesi acak
- `docx-export.js` — pembuat dan pembaca berkas Word `.docx` untuk materi, tugas, rekap, serta perangkat guru dengan tabel Word asli
- `assets/data/quran-id.json` — 114 surat dan 6.236 ayat untuk pembaca dalil luring
- `assets/data/QURAN-DATA-LICENSE.txt` — atribusi dan lisensi CC BY-SA 4.0 data Al Qur'an
- `video-data.js` — kurasi dua video penguatan untuk setiap bab kelas VII–IX
- `school-data.js` — identitas sekolah serta data kepala sekolah, guru, dan tenaga kependidikan
- `banjarnegara-school-directory.js` — direktori resmi 101 SMP negeri dan swasta Kabupaten Banjarnegara untuk login guru
- `script.js` — fungsi tab, materi, LKPD, perangkat guru, kalkulator, jadwal, dan games
- `styles.css`, `v28-ui.css`, `v29-ui.css`, `v30-ui.css`, dan `v32-ui.css` — desain responsif, penyempurnaan visual, aksesibilitas, serta format cetak
- `service-worker.js` — dukungan konten inti saat koneksi terbatas; audio besar dicache saat pertama diputar
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

## Pembaruan v23

- Login guru dilengkapi direktori resmi 101 SMP Kabupaten Banjarnegara dan pengisian otomatis unit kerja untuk nama guru yang tersedia pada direktori lokal.
- Kata sandi Ruang Editor: `Alifi@78`.
- Editor galeri menerima narasi panjang dan maksimal 10 foto per kegiatan.
- Foto dipublikasikan sebagai kolase responsif dengan lightbox; tipografi galeri memakai Cambria regular.
- Sinkronisasi Google Apps Script mendukung banyak foto dan kompatibel dengan galeri versi lama.

## Pembaruan v22

- Ruang Guru meminta identitas guru pada setiap sesi baru: nama, sekolah dari daftar satuan pendidikan, dan NIP opsional.
- Mode ujian murid menyembunyikan dan memblokir Ruang Guru serta Ruang Editor.
- Bank PTS, ASAS, dan UKLN menyediakan ujian virtual dengan timer, palet nomor, status sudah/belum dijawab, penyimpanan progres, tombol kirim, serta konfirmasi akhir.
- Soal dalam satu paket dibangkitkan tanpa pengulangan stimulus-soal; UKLN memakai proporsi kelas VII 20%, kelas VIII 20%, dan kelas IX 60%.
- Kunci jawaban guru ditandai lingkaran dan warna tanpa teks “KUNCI”; penanda tidak ditampilkan dalam mode murid.
- Ekspor DOCX, XLSX, PPTX, dan cetak/PDF mempertahankan kop dan logo sekolah. XLSX/PPTX menggunakan format Office asli.
- Audio Ustadz Abu Yazid Nurdin dan Ustadz Muflih Safitra tersedia dalam MP3 CBR dan OGG; service worker mendukung byte-range untuk Windows/Desktop serta pemutaran luring.
- Cache PWA diperbarui ke v23.
