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
8. Pastikan `app-config.js`, `content-data.js`, `teacher-source-data.js`, `calendar-data.js`, `staff-images.js`, `school-data.js`, `islamic-data.js`, `script.js`, `styles.css`, `manifest.webmanifest`, `service-worker.js`, serta seluruh folder `assets` ikut terunggah. Folder `assets/perangkat` berisi 48 dokumen sumber Ruang Guru. `staff-images.js` berada di root repository dan menjadi cadangan tertanam agar seluruh foto guru dan tenaga kependidikan tetap tampil.
9. Isi keterangan perubahan:

   `Perbarui portal Ruang Murid dan Ruang Guru PAIBP SMART SMP`

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

Periksa halaman menggunakan komputer dan telepon. Klik empat tab utama: **Ruang Murid**, **Ruang Guru**, **Fitur Islami**, dan **Fitur Games**.

Pada Ruang Murid, buka salah satu bab dan periksa **Materi Bab**, **Ringkasan**, **LKPD**, serta **Jawaban & Kirim**. Pada Ruang Guru, masukkan kata sandi standar `261078`, lalu buka CP, KKTP, ATP, Prota, Promes, Kalender Pendidikan, Analisis Hari Efektif, Modul Ajar Lengkap, Rekap Akses Murid, dan Rekap Pekerjaan Murid.

Uji alur tugas menggunakan data percobaan:

1. Isi nama, nomor absen, kelas, dan jawaban pada **Jawaban & Kirim**.
2. Pilih **Kirim kepada guru**, lalu simpan berkas `.paibp`.
3. Buka **Ruang Guru → Rekap Pekerjaan Murid**.
4. Impor berkas percobaan, isi nilai/catatan, unduh CSV, dan coba cetak.
5. Setelah uji selesai, hapus rekap percobaan.

## E. Jika Perubahan Belum Terlihat

1. Tunggu hingga 10 menit.
2. Pastikan proses pada tab **Actions** sudah berhasil.
3. Tekan `Ctrl + F5` pada Windows untuk memuat ulang tanpa cache.
4. Jika masih terlihat versi lama, buka website pada jendela samaran/incognito lalu muat ulang.
5. Pastikan nama file menggunakan huruf kecil, terutama `index.html`.
6. Pastikan `index.html`, `app-config.js`, `content-data.js`, `teacher-source-data.js`, `calendar-data.js`, `staff-images.js`, `school-data.js`, `islamic-data.js`, `script.js`, `styles.css`, `manifest.webmanifest`, dan `service-worker.js` berada pada root repository.
7. Buka `https://sunarso29.github.io/paibp-smart/BUILD-INFO.txt` dan pastikan tertulis `Versi paket: 7.0`.
8. Periksa kembali pengaturan **Settings → Pages**.

## Mengaktifkan rekap akses lintas perangkat

GitHub Pages tidak memiliki basis data. Website menampilkan status mode lokal sampai integrasi Google Apps Script diaktifkan. Ikuti `PANDUAN_REKAP_REALTIME.md`, kemudian isi URL Web App dan kunci baca pada `app-config.js` sebelum mengunggah versi final.

## F. Catatan Penting

- Jangan menghapus `privacy.html` karena alamatnya digunakan untuk Kebijakan Privasi.
- Jangan mengubah nama repository tanpa memperbarui seluruh alamat website.
- Jangan menyimpan kata sandi, kode verifikasi, atau data pribadi di dalam repository.
- Jangan mengunggah berkas `.paibp`, cadangan rekap JSON, atau CSV nilai ke repository. Ketiganya dapat memuat identitas dan pekerjaan murid.
- Setiap pembaruan pada branch `main` akan diterbitkan ulang secara otomatis oleh GitHub Pages.
- Jadwal sholat mengambil data dari layanan daring. Karena itu, cocokkan kembali dengan jadwal masjid atau Kementerian Agama setempat.
- Kalender Pendidikan dan analisis hari efektif harus diselaraskan dengan keputusan resmi Dindikpora Banjarnegara yang diterima sekolah.

## G. Mengelola Spensus Terkini

1. Dari Beranda, pilih **Kelola Galeri**.
2. Masukkan kata sandi admin standar `261078`.
3. Isi judul, tanggal, ringkasan, dan pilih foto kegiatan.
4. Pilih **Simpan dan Terbitkan**. Foto otomatis diperkecil agar ringan dibuka dari telepon.
5. Gunakan tombol **Edit** atau **Hapus** pada kartu dokumentasi bila diperlukan.
6. Gunakan **Cadangkan Galeri** secara berkala.
7. Agar dokumentasi tampil pada semua perangkat, aktifkan Google Apps Script sesuai `PANDUAN_REKAP_REALTIME.md`. Tanpa integrasi, perubahan hanya tersimpan pada browser admin.
8. Jangan menampilkan foto atau data pribadi murid tanpa dasar izin dan kebijakan sekolah yang sesuai.
