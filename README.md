# Proyek UAS Backend: RESTful API Layanan Tiket Bus Rosalia Indah

Aplikasi RESTful API backend untuk sistem pemesanan tiket bus antarkota dan antarprovinsi **PT. Rosalia Indah Transport** (https://www.rosalia-indah.co.id/) dilengkapi dengan **Pemesanan Pulang-Pergi (Round-Trip)**, **Live Location Bus (GPS Tracking)**, dan **Share Live Tracking Link Publik (ala GrabFood / Gojek)**.

Proyek ini dibangun untuk memenuhi capaian pembelajaran mata kuliah Pemrograman Aplikasi Web II:
- **SUB-CPMK-9**: Mahasiswa mampu membuat RESTful API CRUD untuk mengelola penyimpanan data NoSQL (MongoDB).
- **SUB-CPMK-10**: Mahasiswa mampu menerapkan autentikasi stateless menggunakan JSON Web Token (JWT) untuk mengamankan RESTful API.

---

## 🌟 Fitur Unggulan Proyek

1. **Pemesanan Tiket Fleksibel**:
   - Mendukung pemesanan **Sekali Jalan**, **Pulang-Pergi (Round-Trip)**, maupun **Multi-Kota** dalam satu transaksi pembayaran dengan kode booking tunggal.
   - Pengecekan ketersediaan kursi otomatis dan pencegahan bentrok nomor kursi (*seat collision prevention*).
2. **Live Location Bus (Pelacakan Lokasi GPS)**:
   - Armada bus dilengkapi titik koordinat GPS (`latitude`, `longitude`, `kecepatanKmJam`, `namaLokasi`).
   - Pengemudi/Admin dapat memperbarui posisi bus secara *real-time* via `PUT /api/bus/:id/lokasi`.
   - Menggunakan pendekatan **HTTP Polling** yang 100% kompatibel dan hemat biaya pada arsitektur **Vercel Serverless**.
3. **Share Live Tracking Link Publik (Ala GrabFood / Gojek)**:
   - Penumpang mendapatkan tautan pelacakan publik unik (`/tracking.html?token=trk_...`) yang dapat dibagikan kepada keluarga via WhatsApp tanpa mengharuskan penerima login JWT.
   - Peta interaktif berbasis **Leaflet.js & OpenStreetMap** gratis tanpa memerlukan API key berbayar.
   - **Perlindungan Privasi**: Data sensitif penumpang (seperti NIK KTP, password) disaring dan disembunyikan pada tautan publik.
4. **Autentikasi Stateless JWT & Role-Based Access Control (RBAC)**:
   - Hak akses terpisah secara tegas antara `admin` (manajemen armada, rute, jadwal, pembaruan GPS) dan `user` (pelanggan tiket).

---

## 📋 Jawaban & Laporan Ketentuan Tugas

Dokumentasi laporan akademik lengkap tersedia pada file:  
👉 **[LAPORAN_PROYEK_UAS.md](LAPORAN_PROYEK_UAS.md)**

### Ringkasan Poin Evaluasi Dosen:
1. **Database**: MongoDB Atlas / Local (`mongodb://localhost:27017/rosalia_indah`), 5 koleksi: `users`, `buses`, `rutes`, `jadwals`, `pemesanans`.
2. **RESTful API CRUD (SUB-CPMK-9)**: Modul Bus, Rute, Jadwal, Pemesanan Tiket Pulang-Pergi, dan Share Tracking Publik.
3. **Autentikasi JWT (SUB-CPMK-10)**: Register, Login, `verifyToken`, `hanyaRole('admin')`, endpoint terproteksi.
4. **Deploy Vercel**: Dikonfigurasi dengan `vercel.json` dan *connection pooling* MongoDB serverless di `config/db.js`.
5. **Pengujian Postman**: Lolos uji 100% pada file `Rosalia_Indah_API.postman_collection.json`.

---

## 🚀 Panduan Menjalankan Proyek Secara Lokal

### 1. Instalasi Dependensi
```powershell
cd d:\SI5C-Express\Tugas-Kelompok
npm install
```

### 2. Mengisi Data Awal (Seeding)
Jalankan seeder untuk mengisi data armada bus ber-GPS, rute, jadwal pergi-pulang, dan user:
```powershell
npm run seed
```

### 3. Menjalankan Server
Mode pengembangan (Hot Reload):
```powershell
npm run dev
```
Mode produksi:
```powershell
npm start
```
Buka browser di:
- **Status API & Dokumentasi JSON**: `http://localhost:4000/` atau `http://localhost:4000/api`
- **Peta Live Location Bus Leaflet.js**: `http://localhost:4000/tracking.html?token=trk_demo_rosalia2026`

---

## 🧪 Pengujian Menggunakan Postman
1. Buka Postman, klik **Import**, dan pilih `Rosalia_Indah_API.postman_collection.json`.
2. Jalankan request `Login Admin` dan `Login Pelanggan` (token otomatis tersimpan ke variabel koleksi).
3. Uji coba pemesanan pulang-pergi dan pelacakan bus via token publik pada folder `5. Pemesanan Tiket` dan `6. Share Live Tracking Publik`.
