# Panduan Publikasi GitHub — PAIBP SMART SMP v34 Light

## Solusi peringatan “unggah kurang dari 100 file”

Paket v34 Light telah diringankan menjadi **97 file** dengan ukuran sekitar **29 MB**. Ekstrak ZIP terlebih dahulu, lalu pilih seluruh 97 file dan folder di dalamnya. Jangan mengunggah file ZIP sebagai isi website.

## Langkah unggah

1. Buka repository tujuan, misalnya `paibp-pintar` atau `paibp-smart`.
2. Sebagai cadangan, pilih **Code → Download ZIP** untuk menyimpan versi lama.
3. Hapus file lama yang sudah tidak digunakan apabila Anda ingin mengganti repository secara penuh.
4. Ekstrak `paibp-smart-upload-github-v34-light.zip` di komputer.
5. Buka hasil ekstraksi. Pastikan `index.html` berada langsung di dalam folder tersebut.
6. Pada GitHub pilih **Add file → Upload files**.
7. Pilih seluruh isi hasil ekstraksi—97 file termasuk folder `assets`—kemudian seret ke kotak unggahan.
8. Isi pesan commit: `Upgrade PAIBP SMART SMP v34 Light dan Literasi Digital`.
9. Pilih **Commit changes**.
10. Buka **Settings → Pages** dan gunakan branch `main`, folder `/(root)`.
11. Tunggu Actions/Pages selesai, lalu buka situs dengan `Ctrl + F5`.

## Pemeriksaan wajib

- `index.html`, `literasi-digital.html`, `multimapel-content.js`, `service-worker.js`, `sitemap.xml`, dan `robots.txt` harus berada di root repository.
- Jangan menempatkan semua file di dalam satu folder tambahan.
- Jangan mengunggah rekap nilai, identitas murid, NIP lengkap, atau dokumen rahasia ke repository publik.
- Portal Guru dan Kendali Editor tetap diberi `noindex` dan tidak tercantum dalam sitemap.

## Alternatif Git command line

Untuk pembaruan berikutnya, Git command line lebih stabil daripada unggah browser:

```bash
git clone https://github.com/Sunarso29/paibp-pintar.git
cd paibp-pintar
# salin seluruh isi paket v34 ke folder ini
git add -A
git commit -m "Upgrade PAIBP SMART SMP v34 Light"
git push origin main
```
