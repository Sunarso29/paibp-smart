# Panduan Publikasi PAIBP SMART SMP

## A. Persiapan

1. Masuk ke akun GitHub yang memiliki repository `paibp-smart`.
2. Buka repository tersebut.
3. Sebagai cadangan, klik **Code** lalu **Download ZIP**.
4. Ekstrak paket website versi final di komputer.

## B. Mengunggah Versi Final

1. Pada halaman repository, klik **Add file**.
2. Pilih **Upload files**.
3. Buka folder `paibp-smart-main` hasil ekstraksi.
4. Pilih seluruh file di dalam folder tersebut.
5. Tarik seluruh file ke halaman unggah GitHub.
6. Jangan mengunggah file ZIP.
7. Pastikan `index.html` terlihat langsung di halaman utama repository, bukan berada di dalam folder tambahan.
8. Pastikan `script.js`, `styles.css`, dan `service-worker.js` ikut terunggah. Ketiga file ini diperlukan agar tab, game, progres, dan mode luring berfungsi.
9. Isi keterangan perubahan:

   `Aktifkan fitur interaktif PAIBP SMART SMP`

10. Klik **Commit changes**.

## C. Mengaktifkan GitHub Pages

1. Buka **Settings** pada repository.
2. Pada bagian **Code and automation**, pilih **Pages**.
3. Pada **Build and deployment**, atur:
   - **Source:** Deploy from a branch
   - **Branch:** main
   - **Folder:** /(root)
4. Klik **Save**.
5. Buka tab **Actions**.
6. Tunggu proses publikasi bertanda centang hijau.

## D. Membuka dan Memeriksa Website

- Beranda: https://sunarso29.github.io/paibp-smart/
- Kebijakan Privasi: https://sunarso29.github.io/paibp-smart/privacy.html
- Ketentuan: https://sunarso29.github.io/paibp-smart/terms.html
- Dukungan: https://sunarso29.github.io/paibp-smart/support.html
- Kontak: https://sunarso29.github.io/paibp-smart/contact.html

Periksa halaman menggunakan komputer dan telepon. Klik empat kartu statistik dan enam kartu fitur. Pastikan daftar 30 bab, game kuis, layanan Islami, progres belajar, mode luring, dan informasi privasi dapat dibuka.

## E. Jika Perubahan Belum Terlihat

1. Tunggu hingga 10 menit.
2. Pastikan proses pada tab **Actions** sudah berhasil.
3. Tekan `Ctrl + F5` pada Windows untuk memuat ulang tanpa cache.
4. Jika masih terlihat versi lama, buka website pada jendela samaran/incognito lalu muat ulang.
5. Pastikan nama file menggunakan huruf kecil, terutama `index.html`.
6. Pastikan `index.html`, `script.js`, `styles.css`, dan `service-worker.js` berada pada root repository.
7. Periksa kembali pengaturan **Settings → Pages**.

## F. Catatan Penting

- Jangan menghapus `privacy.html` karena alamatnya digunakan untuk Kebijakan Privasi.
- Jangan mengubah nama repository tanpa memperbarui seluruh alamat website.
- Jangan menyimpan kata sandi, kode verifikasi, atau data pribadi di dalam repository.
- Setiap pembaruan pada branch `main` akan diterbitkan ulang secara otomatis oleh GitHub Pages.
- Jadwal sholat mengambil data dari layanan daring. Karena itu, cocokkan kembali dengan jadwal masjid atau Kementerian Agama setempat.
