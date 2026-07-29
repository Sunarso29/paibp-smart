# Mengaktifkan Rekap Akses Murid Lintas Perangkat

GitHub Pages hanya menyajikan file statis. Karena itu, rekap akses dari telepon murid ke Ruang Guru memerlukan penyimpanan daring. Paket ini sudah menyiapkan integrasi Google Apps Script dan tetap berjalan dalam mode lokal sebelum integrasi diaktifkan.

## Data yang dicatat

Integrasi mencatat waktu, peran pengguna, identitas murid atau identitas guru, ruang/bab/bagian yang dibuka, serta potongan durasi aktif pada sheet **Aktivitas**. Identitas guru berisi nama, unit kerja, dan NIP bila diisi. Ketika Ruang Murid dibuka, situs otomatis menjalankan deteksi lokasi; sistem operasi atau browser tetap dapat meminta persetujuan satu kali. Koordinat dibulatkan hingga tiga angka desimal dan nama wilayah perkiraan ditentukan otomatis. Ketika murid memilih **Kirim kepada guru**, satu paket jawaban berisi latihan, LKPD, refleksi, dan ringkasan video disimpan secara terpisah pada sheet **Pekerjaan** agar dapat dimuat oleh guru. Isi jawaban tidak dimasukkan ke log aktivitas.

Editor admin **Spensus Terkini** memakai integrasi yang sama. Data judul, tanggal, dan ringkasan disimpan pada sheet **Spensus Terkini**, sedangkan foto kegiatan disimpan dalam folder Google Drive **PAIBP SMART — Spensus Terkini**. Tanpa integrasi, editor tetap berfungsi tetapi perubahan galeri hanya tersimpan pada perangkat admin tersebut.

Komentar/rating disimpan pada sheet **Tanggapan**, sedangkan teks beranda hasil suntingan disimpan pada sheet **Konten Editor**. Statistik publik hanya menghitung sesi non-admin dan tidak membuka identitas pengguna.

## 1. Buat Web App

1. Buka [Google Apps Script](https://script.google.com/) memakai akun sekolah/guru.
2. Pilih **New project**.
3. Hapus contoh kode, lalu salin seluruh isi `google-apps-script/Code.gs`.
4. Simpan proyek dengan nama **PAIBP SMART Rekap**.
5. Pilih fungsi `setup`, lalu klik **Run**.
6. Berikan izin yang diminta. Fungsi ini membuat satu Google Sheet rekap, satu folder Google Drive untuk foto kegiatan, dan satu folder privat untuk paket tugas yang melebihi batas sel Google Sheets.
7. Buka **Execution log**. Salin nilai `spreadsheetUrl` untuk membuka rekap mentah dan `readKey` untuk konfigurasi website.

## 2. Deploy

1. Klik **Deploy → New deployment**.
2. Pilih jenis **Web app**.
3. Atur **Execute as: Me**.
4. Atur **Who has access: Anyone** agar telepon murid dapat mencatat aktivitas tanpa login Google.
5. Klik **Deploy**, lalu salin URL Web App yang berakhir `/exec`.

Jangan membagikan `readKey` melalui grup murid. Kunci ini dipakai Ruang Guru untuk membaca rekap. Karena website GitHub Pages bersifat statis, pengguna yang memahami kode sumber tetap dapat menemukan kunci konfigurasi; gunakan integrasi ini untuk rekap operasional sederhana, bukan data yang sangat rahasia.

## 3. Hubungkan website

Buka `app-config.js`, lalu isi:

```js
window.PAIBP_CONFIG = Object.freeze({
  realtimeEndpoint: "TEMPELKAN_URL_WEB_APP_YANG_BERAKHIR_EXEC",
  realtimeReadKey: "TEMPELKAN_READ_KEY_DARI_SETUP",
});
```

Unggah kembali `app-config.js` ke root repository GitHub, tunggu GitHub Pages selesai, lalu lakukan muat ulang paksa.

## 4. Uji

1. Buka website dari telepon.
2. Masuk Ruang Murid, buka satu bab, isi identitas, lalu kirim satu tugas.
3. Saat Ruang Murid dibuka, setujui permintaan lokasi bawaan ponsel apabila nama wilayah dan koordinat perkiraan akan direkam. Tidak ada pilihan tempat atau tombol lokasi manual.
4. Di perangkat guru, buka Ruang Guru, lalu isi nama, unit kerja, dan NIP bila ada.
5. Pilih **Rekap Akses Murid → Muat Ulang Rekap** dan pastikan waktu, aktivitas, durasi, tempat, serta pengiriman muncul.
6. Pilih **Rekap Pekerjaan Murid → Muat Tugas Daring** dan pastikan isi pekerjaan masuk ke kelompok kelas yang sesuai.
7. Kembali ke Beranda, buka **Ruang Editor** dengan kata sandi standar `261078`, tambahkan satu foto uji, kirim satu komentar/rating, dan ubah teks beranda untuk memastikan sinkronisasi lintas perangkat.

## Memperbarui deployment

Setiap kali `google-apps-script/Code.gs` diperbarui, buka **Deploy → Manage deployments → Edit**, pilih **New version**, lalu klik **Deploy**. URL `/exec` tetap sama. Jalankan `setup()` sekali lagi agar kolom aktivitas baru dan folder tugas tersedia.

## Catatan keamanan

Ruang Guru sengaja tidak memakai kata sandi; identitas akses dipakai untuk pemantauan operasional, bukan autentikasi resmi. Kata sandi Ruang Editor pada GitHub Pages merupakan penghalang praktis, bukan sistem akun berkeamanan tinggi. Izin lokasi harus sukarela dan pengguna perlu mengetahui tujuan pencatatannya. Jangan menyimpan data sensitif, dokumen rahasia, atau nilai final yang belum boleh dipublikasikan di dalam repository. Keamanan tingkat akun memerlukan backend dengan login guru terautentikasi.
