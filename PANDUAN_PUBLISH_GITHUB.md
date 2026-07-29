# Panduan Publikasi PAIBP SMART SMP

## A. Persiapan

1. Masuk ke akun GitHub yang memiliki repository `paibp-smart`.
2. Buka repository tersebut.
3. Sebagai cadangan, klik **Code** lalu **Download ZIP**.
4. Ekstrak paket website versi final di komputer.
5. Jika situs lama sudah memakai rekap lintas perangkat, buka `app-config.js` lama dan salin nilai `realtimeEndpoint` serta `realtimeReadKey`. Tempelkan kedua nilai tersebut ke `app-config.js` paket v15 sebelum mengunggah.

## B. Mengunggah Versi Final

1. Pada halaman repository, klik **Add file**.
2. Pilih **Upload files**.
3. Buka folder `paibp-smart-main` hasil ekstraksi.
4. Pilih seluruh file di dalam folder tersebut.
5. Tarik seluruh file ke halaman unggah GitHub.
6. Jangan mengunggah file ZIP.
7. Pastikan `index.html` terlihat langsung di halaman utama repository, bukan berada di dalam folder tambahan.
8. Pastikan `app-config.js`, `content-data.js`, `teacher-source-data.js`, `calendar-data.js`, `staff-images.js`, `school-data.js`, `islamic-data.js`, `hadith-data.js`, `game-data.js`, `docx-export.js`, `script.js`, `styles.css`, `manifest.webmanifest`, `service-worker.js`, serta seluruh folder `assets` ikut terunggah. Bila sinkronisasi lama sudah aktif, pastikan `app-config.js` yang diunggah tetap memuat URL dan kunci lama—jangan gunakan nilai kosong. Folder `assets/perangkat` berisi 48 dokumen sumber Ruang Guru. `staff-images.js` berada di root repository dan menjadi cadangan tertanam agar seluruh foto guru dan tenaga kependidikan tetap tampil.
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

Periksa halaman menggunakan komputer dan telepon. Klik lima tab utama: **Ruang Murid**, **Ruang Guru**, **Fitur Islami**, **Fitur Games**, dan **Ruang Editor**.

Pada Ruang Murid, buka salah satu bab dan periksa **Materi Bab**, **Ringkasan**, **LKPD**, serta **Jawaban & Kirim**. Pada Ruang Guru, isi nama, unit kerja, dan NIP bila ada; lalu buka CP, KKTP, ATP, Prota, Promes, Kalender Pendidikan, Analisis Hari Efektif, Modul Ajar Lengkap, Rekap Akses Murid, dan Rekap Pekerjaan Murid. Kata sandi standar `261078` hanya dipakai untuk Ruang Editor.

Uji alur tugas menggunakan data percobaan:

1. Isi nama, nomor absen, kelas, dan jawaban pada **Jawaban & Kirim**.
2. Pilih **Kirim kepada guru**, lalu simpan berkas Word `.docx`.
3. Buka **Ruang Guru → Rekap Pekerjaan Murid**.
4. Impor berkas percobaan, isi nilai/catatan, unduh rekap Word, dan coba simpan PDF.
5. Setelah uji selesai, hapus rekap percobaan.

## E. Jika Perubahan Belum Terlihat

1. Tunggu hingga 10 menit.
2. Pastikan proses pada tab **Actions** sudah berhasil.
3. Tekan `Ctrl + F5` pada Windows untuk memuat ulang tanpa cache.
4. Jika masih terlihat versi lama, buka website pada jendela samaran/incognito lalu muat ulang.
5. Pastikan nama file menggunakan huruf kecil, terutama `index.html`.
6. Pastikan `index.html`, `app-config.js`, `content-data.js`, `teacher-source-data.js`, `calendar-data.js`, `staff-images.js`, `school-data.js`, `islamic-data.js`, `hadith-data.js`, `game-data.js`, `docx-export.js`, `script.js`, `styles.css`, `manifest.webmanifest`, dan `service-worker.js` berada pada root repository.
7. Buka `https://sunarso29.github.io/paibp-smart/BUILD-INFO.txt` dan pastikan tertulis `Versi paket: 15.0`.
8. Pada beranda, periksa baris merek dan pastikan tertulis **Paket v15**.
9. Jika `BUILD-INFO.txt` sudah 15.0 tetapi tampilan masih lama, buka pengaturan browser → data situs → hapus data untuk `sunarso29.github.io`, lalu buka kembali situs.
10. Periksa kembali pengaturan **Settings → Pages**.

## Mengaktifkan rekap akses lintas perangkat

GitHub Pages tidak memiliki basis data. Website menampilkan status mode lokal sampai integrasi Google Apps Script diaktifkan. Ikuti `PANDUAN_REKAP_REALTIME.md`, kemudian isi URL Web App dan kunci baca pada `app-config.js` sebelum mengunggah versi final.

## F. Catatan Penting

- Jangan menghapus `privacy.html` karena alamatnya digunakan untuk Kebijakan Privasi.
- Jangan mengubah nama repository tanpa memperbarui seluruh alamat website.
- Jangan menyimpan kode verifikasi atau data pribadi pengguna di dalam repository.
- Jangan mengunggah berkas tugas atau rekap Word yang memuat identitas dan pekerjaan murid ke repository.
- Setiap pembaruan pada branch `main` akan diterbitkan ulang secara otomatis oleh GitHub Pages.
- Jadwal sholat mengambil data dari layanan daring. Karena itu, cocokkan kembali dengan jadwal masjid atau Kementerian Agama setempat.
- Kalender Pendidikan dan analisis hari efektif harus diselaraskan dengan keputusan resmi Dindikpora Banjarnegara yang diterima sekolah.
- Pada Fitur Games, pastikan katalog memuat 100 game, cari **Sambung Ayat**, mulai salah satu game, dan pastikan tampil `Soal 1 dari 20`, perpindahan ruang terkunci, serta tombol keluar baru tersedia setelah soal ke-20.
- Pada materi bab, klik salah satu rujukan Al Qur'an Surat dan satu Hadits Riwayat untuk memastikan teks Arab, makna, sumber, dan tombol bacaan luring tampil.
- Pada Ruang Guru, pastikan tombol yang tampil adalah **Baca Isi Dokumen**, bukan tautan **Buka berkas** versi lama. Uji KKTP, ATP, Prota, dan Promes kelas IX; tabel utama harus berisi 120 JP dan tidak memiliki kolom kosong.
- Unduh ATP, Prota, Promes, dan KKTP. Buka berkas `.docx` di Microsoft Word atau LibreOffice dan pastikan setiap data masih berada di dalam tabel bergaris, bukan berubah menjadi teks dengan pemisah `|`.
- Pada Fitur Islami, buka Nasihat Harian dan pastikan jumlah sumber lebih dari 6.000, bukan 63.
- Pada Fitur Islami, buka Bahasa Arab dan periksa tingkat Dasar, Menengah, serta Mahir. Masing-masing harus menampilkan tepat 100 tab. Buka tab pertama dan pastikan tampil `Soal 1 dari 100`; setelah jawaban dipilih, penilaian benar/salah harus langsung terlihat lalu soal berpindah otomatis.

## G. Mengelola Spensus Terkini

1. Dari Beranda, pilih **Ruang Editor**.
2. Masukkan kata sandi admin standar `261078`.
3. Isi judul, tanggal, ringkasan, dan pilih foto kegiatan.
4. Pilih **Simpan dan Terbitkan**. Foto otomatis diperkecil agar ringan dibuka dari telepon.
5. Gunakan tombol **Edit** atau **Hapus** pada kartu dokumentasi bila diperlukan.
6. Gunakan **Unduh Laporan Galeri Word** secara berkala.
7. Agar dokumentasi tampil pada semua perangkat, aktifkan Google Apps Script sesuai `PANDUAN_REKAP_REALTIME.md`. Tanpa integrasi, perubahan hanya tersimpan pada browser admin.
8. Jangan menampilkan foto atau data pribadi murid tanpa dasar izin dan kebijakan sekolah yang sesuai.
