# Mengaktifkan Rekap Akses Murid Lintas Perangkat

GitHub Pages hanya menyajikan file statis. Karena itu, rekap akses dari telepon murid ke Ruang Guru memerlukan penyimpanan daring. Paket ini sudah menyiapkan integrasi Google Apps Script dan tetap berjalan dalam mode lokal sebelum integrasi diaktifkan.

## Data yang dicatat

Integrasi mencatat waktu, nama/nomor absen/kelas yang pernah diisi murid, jenis aktivitas, dan bab yang dibuka atau dikirim pada sheet **Aktivitas**. Ketika murid memilih **Kirim kepada guru**, salinan jawaban lengkap disimpan secara terpisah pada sheet **Pekerjaan** agar dapat dimuat oleh guru. Isi jawaban tidak dimasukkan ke log akses.

## 1. Buat Web App

1. Buka [Google Apps Script](https://script.google.com/) memakai akun sekolah/guru.
2. Pilih **New project**.
3. Hapus contoh kode, lalu salin seluruh isi `google-apps-script/Code.gs`.
4. Simpan proyek dengan nama **PAIBP SMART Rekap**.
5. Pilih fungsi `setup`, lalu klik **Run**.
6. Berikan izin yang diminta. Fungsi ini membuat satu Google Sheet rekap.
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
3. Di perangkat guru, buka Ruang Guru dengan kata sandi.
4. Pilih **Rekap Akses Murid → Muat Ulang Rekap** dan pastikan kunjungan serta aktivitas pengiriman muncul.
5. Pilih **Rekap Pekerjaan Murid → Muat Tugas Daring** dan pastikan isi pekerjaan masuk ke kelompok kelas yang sesuai.

## Catatan keamanan

Kata sandi Ruang Guru pada GitHub Pages adalah penghalang praktis agar murid tidak membuka menu secara tidak sengaja, bukan sistem akun berkeamanan tinggi. Jangan menyimpan data sensitif, dokumen rahasia, atau nilai final yang belum boleh dipublikasikan di dalam file repository. Untuk keamanan tingkat akun, versi berikutnya memerlukan backend dengan login guru terautentikasi.
