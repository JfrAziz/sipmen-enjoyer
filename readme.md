### SIPMEN ENJOYER

1. clone project ini
2. buat file `.env` (bisa dengan edit file `.env.example`). 
   1. username password, isi dengan password sipmen
   2. headless mode TRUE maka browser tidak akan ditampilkan tapi berjalan di belakang layar. headless mode FALSE, browser (chromium/chrome) akan ditampilkan
3. edit csv yang ada di folder data, tinggal isi tanpa ubah nama kolom.
   1. untuk distribusi dokumen ke koseka, isi [distribusi.csv](./data/distribusi.csv)
   2. untuk penerimaan dari koseka, isi [penerimaan.csv](./data/penerimaan.csv)
4. sebelum menjalankannya, pastikan terinstall [node](https://nodejs.org/en/download/). kemudian jalankan `npm install`.
5. jalankan scriptnya
   1. `node index.js distribusi` untuk menginput data distribusi ke koseka
   2. `node index.js penerimaan` untuk menginput data penerimaan dari koseka per SLS, dari daftar yang ada di [penerimaan.csv](./data/penerimaan.csv)
   3. `node index.js penerimaan-desa` untuk menginput data penerimaan dari koseka per Desa, dibagi menjadi 20 SLS per file, dari daftar yang ada di [penerimaan.csv](./data/penerimaan.csv)


> yang batching belum yak