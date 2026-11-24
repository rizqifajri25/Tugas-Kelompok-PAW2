# LAPORAN PROYEK UAS - PENGEMBANGAN APLIKASI WEB II
## Backend RESTful API, Autentikasi Stateless JWT, dan Live Fleet Tracking: Sistem Pemesanan Tiket Bus Rosalia Indah

**Program Studi**: Sistem Informasi  
**Kelas**: SI5C  
**Fakultas**: Ilmu Komputer dan Rekayasa  
**Institusi**: Universitas Multi Data Palembang  
**Tahun Akademik**: 2026/2027  
**Aplikasi Studi**: [PT. Rosalia Indah Transport](https://www.rosalia-indah.co.id/)  

---

## DAFTAR ISI
1. [Identitas Anggota Kelompok](#1-identitas-anggota-kelompok)
2. [Analisis Aplikasi Nyata (Rosalia Indah)](#2-analisis-aplikasi-nyata-rosalia-indah)
3. [Ide Proyek Akhir & Fitur Unggulan](#3-ide-proyek-akhir--fitur-unggulan)
4. [Proposal Arsitektur Sistem Decoupled](#4-proposal-arsitektur-sistem-decoupled)
5. [Konsep Desain Prototype (Figma: Desktop vs Mobile)](#5-konsep-desain-prototype-figma-desktop-vs-mobile)
6. [Deployment Halaman Statis & Serverless Vercel](#6-deployment-halaman-statis--serverless-vercel)
7. [Laporan Poin Evaluasi UAS (Poin 1 s.d. 8)](#7-laporan-poin-evaluasi-uas-poin-1-sd-8)
8. [Spesifikasi Teknis Endpoint API (SUB-CPMK-9 & SUB-CPMK-10)](#8-spesifikasi-teknis-endpoint-api)
9. [Panduan Menjalankan, Peta Interaktif Leaflet.js, dan Pengujian Postman](#9-panduan-menjalankan-peta-interaktif-leafletjs-dan-pengujian-postman)

---

## 1. Identitas Anggota Kelompok

| No | Nama Mahasiswa | NIM / NPM | Peran / Pembagian Tugas |
|:---|:---|:---|:---|
| 1 | **Rizqi Fajri Sya'ban** | 2428240109 | Setup arsitektur backend Express.js, skema MongoDB (Mongoose), Autentikasi stateless JWT, otorisasi RBAC, controller CRUD, implementasi fitur tiket pulang-pergi & live location tracking, seeder data, dan konfigurasi Vercel Serverless. |
| 2 | **Mikhael Vito Wicaksono** | *(NIM)* | Inisiator ide fitur unggulan (Pemesanan Pulang-Pergi, Live Location Bus, Share Link Publik), pengujian integrasi MongoDB Atlas, pengujian endpoint via Postman, dan penyusunan proposal arsitektur. |
| 3 | **Nazwa Munthaha Hendriyani Nasution** | *(NIM)* | Validasi skema input data (request validation), perancangan model rute & armada bus, pengujian penanganan galat (*error handling*), dan penyusunan antarmuka halaman statis. |
| 4 | **Natalia Siddharta** | *(NIM)* | Pengujian skenario autentikasi & autorisasi token JWT, pengujian transaksi pemesanan tiket, integrasi peta live tracking Leaflet.js, dan penyusunan dokumentasi laporan proyek UAS. |

---

## 2. Analisis Aplikasi Nyata (Rosalia Indah)

- **Aplikasi yang Dipilih**: Web Resmi PT. Rosalia Indah Transport ([https://www.rosalia-indah.co.id/](https://www.rosalia-indah.co.id/))
- **Klasifikasi Arsitektur**: **Decoupled (Terpisah / Client-Server)**
- **Alasan dan Bukti Nyata**:
  1. **Multi-Platform Client (Web, Mobile, dan Loket Agen)**:
     Rosalia Indah melayani pemesanan tiket melalui website publik, aplikasi Android/iOS (*Rosalia Indah Mobile*), serta aplikasi loket agen. Ketiganya mengonsumsi backend API terpusat yang sama untuk memvalidasi ketersediaan kursi, jadwal, dan tarif secara *real-time*.
  2. **Interaksi Data Stateless & Asinkron (AJAX / Fetch API)**:
     Saat calon penumpang memilih trayek dan tanggal, antarmuka tidak memuat ulang seluruh halaman (*full page reload*). Web mengirim panggilan API asinkron di latar belakang dan menerima respons JSON murni untuk merender denah kursi dan daftar bus secara dinamis.
  3. **Independensi Pemeliharaan & Deployment**:
     Lapisan antarmuka pengguna (*frontend*) dapat diperbarui (seperti pergantian banner promo, penyesuaian tata letak CSS) tanpa mengganggu logika bisnis pemesanan tiket pada backend server.

---

## 3. Ide Proyek Akhir & Fitur Unggulan

### A. Latar Belakang Masalah
Pemesanan tiket bus AKAP sering kali terkendala proses antrean fisik di loket, ketidakpastian fasilitas armada, sulitnya memesan tiket pulang-pergi dalam satu invoice pembayaran, serta minimnya transparansi posisi bus saat sedang dalam perjalanan (*live tracking*).

### B. Solusi yang Ditawarkan
Membangun sistem pemesanan tiket bus berbasis web *decoupled* modern yang menyediakan:
- Kemudahan reservasi tiket **Sekali Jalan, Pulang-Pergi (Round-Trip), maupun Multi-Kota** dalam **satu transaksi dan satu kode booking**.
- **Live Location Bus**: Pemantauan koordinat GPS posisi bus dan kecepatan perjalanan secara *real-time*.
- **Share Live Location via Public Web Link**: Membagikan tautan pemantauan perjalanan kepada keluarga/kerabat tanpa mengharuskan penerima login (*ala fitur Share Trip pada Grab / Gojek*).
- Autentikasi stateless berbasis JSON Web Token (JWT) yang aman dengan pembagian hak akses pengguna (*User*) dan Administrator (*Admin*).

### C. Target Pengguna
1. **Calon Penumpang & Pelanggan Umum**: Memesan tiket bus, memilih kursi, memantau posisi bus saat bepergian, dan membagikan status perjalanan ke keluarga.
2. **Keluarga / Kerabat Penumpang**: Memantau posisi armada bus yang dinaiki keluarganya secara langsung melalui tautan web publik tanpa perlu mendaftar akun.
3. **Administrator & Pengemudi (Driver)**: Mengelola armada bus, menambah rute, membuat jadwal, memperbarui koordinat GPS lokasi bus, dan memverifikasi status pembayaran tiket.

### D. Fitur Utama & Inovasi Unggulan
1. **Autentikasi & Otorisasi RBAC (JWT)**: Registrasi, Login, dan proteksi rute berbasis peran (`admin` dan `user`).
2. **Manajemen Armada Bus (CRUD) & Live Location**: Pendataan armada (Double Decker, Super Top SHD, Exec Plus, VIP) beserta pembaruan koordinat GPS (`latitude`, `longitude`, `kecepatanKmJam`, `namaLokasi`).
3. **Manajemen Rute & Agen (CRUD)**: Pendataan trayek antarkota, agen asal, agen tujuan, jarak tempuh, estimasi waktu perjalanan, dan tarif dasar.
4. **Penjadwalan Keberangkatan Dinamis (CRUD)**: Pengaturan jadwal bus dengan relasi referensi ke armada dan rute perjalanan.
5. **Pemesanan Pulang-Pergi / Multi-Segmen (Booking)**: Reservasi multi-jadwal dalam 1 kali transaksi, pemilihan kursi anti-bentrok, dan kalkulasi total harga otomatis.
6. **Share Live Location Bus Publik**: Pembuatan tautan token publik (`/api/tracking/:token` & `/tracking.html?token=:token`) yang menyajikan visualisasi peta interaktif Leaflet.js dengan perlindungan privasi penumpang.

---

## 4. Proposal Arsitektur Sistem Decoupled

```
+-------------------------------------------------------------+
|               CLIENT LAYER (FRONTEND DECOUPLED)             |
|  - Web Desktop Browser (HTML5, Modern CSS, Fetch Client)    |
|  - Mobile Web Browser / PWA (Touch & Responsive Friendly)   |
|  - Public Tracking Web Page (/tracking.html - Leaflet.js)   |
+-------------------------------------------------------------+
                               |
                               | HTTP / HTTPS Request
                               | Header: Authorization: Bearer <JWT>
                               | Body: JSON Payload
                               v
+-------------------------------------------------------------+
|              BACKEND LAYER (VERCEL SERVERLESS NODE.JS)      |
|                                                             |
|  [ Express.js Framework ]                                   |
|   ├── Middleware Global (CORS, Logger, Body Parser)         |
|   ├── Security: JWT Verifier & Role Validator (RBAC)        |
|   └── RESTful API Routes:                                   |
|        ├── /api/auth      (Register, Login, Me)             |
|        ├── /api/bus       (CRUD Armada & Live GPS Location) |
|        ├── /api/rute      (CRUD Trayek & Agen)              |
|        ├── /api/jadwal    (CRUD Jadwal & Filter Kota)       |
|        ├── /api/pemesanan (Booking Sekali Jalan & PP)       |
|        └── /api/tracking  (Share Link Publik Tanpa Login)   |
+-------------------------------------------------------------+
                               |
                               | Mongoose ODM Connection Pool
                               | (Cached Serverless Connection)
                               v
+-------------------------------------------------------------+
|            DATABASE LAYER (MONGODB ATLAS CLOUD NOSQL)       |
|                                                             |
|   ├── Koleksi: users       (Kredensial & Role)              |
|   ├── Koleksi: buses       (Armada & Koordinat Lokasi GPS)  |
|   ├── Koleksi: rutes       (Trayek & Tarif)                 |
|   ├── Koleksi: jadwals     (Jadwal & Ketersediaan Kursi)    |
|   └── Koleksi: pemesanans  (Transaksi Multi-Segmen & Token) |
+-------------------------------------------------------------+
```

---

## 5. Konsep Desain Prototype (Figma: Desktop vs Mobile)

### A. Tampilan Desktop
- **Bilah Navigasi (Header)**: Format horizontal lebar dengan menu Beranda, Jadwal, Armada, Cek Tiket, dan Lacak Bus.
- **Form Pencarian Pulang-Pergi**: Radio button pemilihan tipe perjalanan (*Sekali Jalan* vs *Pulang-Pergi*). Pada mode Pulang-Pergi, kolom tanggal kepulangan otomatis aktif sejajar di samping tanggal keberangkatan.
- **Denah Pemilihan Kursi**: Visualisasi 2 baris kiri dan 2 baris kanan dengan lorong di tengah, dilengkapi kartu ringkasan biaya mengambang (*floating sticky card*) di sebelah kanan.

### B. Tampilan Mobile
- **Navigasi Bawah (*Bottom Bar*)**: Akses cepat dengan jempol (*thumb zone*) mencakup Beranda, Tiket Saya, Live Peta, dan Akun.
- **Form Pencarian Bertingkat**: Kolom kota asal dan tujuan bertingkat vertikal dengan tombol *swap* satu sentuhan.
- **Denah Kursi Responsif**: Tata letak vertikal dengan tombol kursi besar (minimal 44px) yang nyaman ditekan pada layar sentuh ponsel.
- **Halaman Share Tracking Mobile**: Tampilan peta layar penuh (*full-screen map*) dengan kartu geser (*bottom sheet*) berisi kecepatan bus dan perkiraan waktu tiba.

---

## 6. Deployment Halaman Statis & Serverless Vercel

1. **Konfigurasi Serverless (`vercel.json`)**:
   Mengarahkan seluruh lalu lintas request ke `app.js` sebagai serverless function Vercel.
2. **Koneksi Database Tangguh (`config/db.js`)**:
   Menerapkan *connection reuse* menggunakan `mongoose.connection.readyState` agar fungsi serverless tidak membuka ribuan koneksi baru ke MongoDB Atlas.
3. **Penyajian Halaman Statis**:
   - `public/index.html`: Portal status API dan pengujian endpoint.
   - `public/tracking.html`: Halaman peta interaktif Leaflet.js yang langsung memvisualisasikan posisi bus secara langsung dari token share perjalanan.

---

## 7. Laporan Poin Evaluasi UAS (Poin 1 s.d. 8)

### 1. Database
- **Jenis**: MongoDB Atlas (Cloud) / MongoDB Local (`mongodb://localhost:27017/rosalia_indah`)
- **Koleksi yang dibuat**:
  1. `users`: Menyimpan akun pengguna (namaLengkap, username, email, nomorTelepon, password hash, role).
  2. `buses`: Menyimpan data armada bus dan koordinat GPS pelacakan (`nomorPolisi`, `nomorLambung`, `namaBus`, `kelasBus`, `kapasitasKursi`, `fasilitas`, `status`, dan `lokasiTerkini: { latitude, longitude, namaLokasi, kecepatanKmJam, arahDerajat, terakhirDiperbarui }`).
  3. `rutes`: Menyimpan data trayek antarkota (`kodeRute`, `kotaAsal`, `kotaTujuan`, `agenKeberangkatan`, `agenTujuan`, `jarakKm`, `estimasiWaktu`, `tarifDasar`).
  4. `jadwals`: Menyimpan jadwal keberangkatan bus (`busId`, `ruteId`, `tanggalKeberangkatan`, `waktuKeberangkatan`, `waktuTiba`, `hargaTiket`, `kursiTersedia`, `kursiTerpesona`).
  5. `pemesanans`: Menyimpan transaksi tiket (`kodeBooking`, `shareTrackingToken`, `userId`, `tipePerjalanan`, `perjalanan: [{ tipe, jadwalId, penumpang, subtotal }]`, `totalHarga`, `metodePembayaran`, `statusPembayaran`).

### 2. RESTful API CRUD (SUB-CPMK-9)
Endpoint yang sudah selesai diimplementasikan:
- `GET /api/bus` & `GET /api/bus/:id` (Publik: Daftar dan detail armada bus)
- `GET /api/bus/:id/lokasi` (Publik: Mendapatkan koordinat lokasi GPS dan kecepatan bus)
- `PUT /api/bus/:id/lokasi` (Admin/Driver: Memperbarui koordinat GPS lokasi bus)
- `POST /api/bus`, `PUT /api/bus/:id`, `DELETE /api/bus/:id` (Admin: CRUD armada bus)
- `GET /api/rute` & `GET /api/rute/:id` (Publik: Daftar dan detail rute antarkota)
- `POST /api/rute`, `PUT /api/rute/:id`, `DELETE /api/rute/:id` (Admin: CRUD rute)
- `GET /api/jadwal` & `GET /api/jadwal/:id` (Publik: Pencarian jadwal dengan filter kota asal, tujuan, dan populate)
- `POST /api/jadwal`, `PUT /api/jadwal/:id`, `DELETE /api/jadwal/:id` (Admin: CRUD jadwal)
- `GET /api/pemesanan` & `GET /api/pemesanan/:id` (Terproteksi: Pelanggan melihat riwayat tiket miliknya, Admin melihat semua pesanan)
- `POST /api/pemesanan` (Terproteksi: Reservasi tiket sekali jalan, pulang-pergi, maupun multi-kota dengan pencegahan bentrok kursi)
- `PUT /api/pemesanan/:id/status` (Terproteksi: Update status lunas atau pembatalan dengan pemulihan kursi otomatis)
- `DELETE /api/pemesanan/:id` (Admin: Menghapus data transaksi pemesanan)
- `GET /api/tracking/:token` (Publik: Mengakses data pelacakan perjalanan bus tanpa login JWT)

### 3. Autentikasi JWT (SUB-CPMK-10)
- **Register**: Sudah (`POST /api/auth/register`)
- **Login**: Sudah (`POST /api/auth/login`)
- **Middleware Verifikasi Token**: Sudah (`middlewares/verifyToken.js` memvalidasi header `Authorization: Bearer <token>` menggunakan algoritma HS256).
- **Middleware Otorisasi Peran (RBAC)**: Sudah (`middlewares/hanyaRole.js` membatasi izin akses role `admin` vs `user`).
- **Endpoint yang Sudah Diproteksi**:
  - `GET /api/auth/me` (Seluruh pengguna yang memiliki token aktif)
  - `POST, PUT, DELETE /api/bus` dan `PUT /api/bus/:id/lokasi` (Hanya role `admin`)
  - `POST, PUT, DELETE /api/rute` (Hanya role `admin`)
  - `POST, PUT, DELETE /api/jadwal` (Hanya role `admin`)
  - `GET, POST /api/pemesanan` (Seluruh pengguna terautentikasi)
  - `PUT /api/pemesanan/:id/status` (User pemilik pesanan / Admin)
  - `DELETE /api/pemesanan/:id` (Hanya role `admin`)

### 4. Deploy Vercel
- **Status**: Siap di-deploy (Konfigurasi `vercel.json` dan handler serverless aktif).
- **Link**: https://rosalia-indah-api.vercel.app *(sesuaikan dengan domain proyek Vercel kelompok)*

### 5. Pengujian Postman
- **Endpoint yang Sudah Diuji**:
  - Seluruh endpoint modul Auth (Register, Login Admin, Login Pelanggan, Profil `/me`).
  - Seluruh operasi CRUD modul Bus, Rute, dan Jadwal.
  - Pengujian RBAC (request user biasa ke endpoint admin ditolak dengan `403 Forbidden`).
  - Pengujian Live Location Bus (`GET/PUT /api/bus/:id/lokasi`).
  - Pengujian Pemesanan Pulang-Pergi (`POST /api/pemesanan` multi-jadwal) beserta pembuatan token tracking.
  - Pengujian Share Tracking Link Publik (`GET /api/tracking/:token` tanpa login JWT).
- **File Postman Collection**: Tersedia di file `Rosalia_Indah_API.postman_collection.json`.

### 6. Pembagian Tugas Anggota
- **Backend (Sekarang)**:
  - *Rizqi Fajri Sya'ban*: Setup backend Express.js, skema database Mongoose (User, Bus, Rute, Jadwal, Pemesanan), autentikasi JWT stateless & RBAC, seluruh controller CRUD, logic pemesanan tiket pulang-pergi, seeder data, dan konfigurasi serverless Vercel.
  - *Mikhael Vito Wicaksono*: Inisiasi fitur unggulan (Pemesanan Pulang-Pergi, Live Location Bus, Share Link Publik), pengujian integrasi MongoDB Atlas, pengujian endpoint via Postman, dan penyusunan proposal arsitektur sistem.
  - *Nazwa Munthaha Hendriyani Nasution*: Validasi skema data input, pengujian penanganan galat (*error handling* dan HTTP status codes), serta perancangan model armada bus dan rute antarkota.
  - *Natalia Siddharta*: Pengujian skenario autentikasi & masa berlaku token JWT, pengujian keamanan endpoint terproteksi, dan penyusunan laporan dokumentasi proyek UAS.
- **Frontend (Rencana)**:
  - *Rizqi Fajri Sya'ban*: Integrasi Fetch API dari antarmuka web klien ke endpoint backend jadwal dan transaksi pemesanan.
  - *Mikhael Vito Wicaksono*: Perancangan prototype interaktif di Figma (layout desktop dan mobile responsif) serta desain denah kursi bus interaktif.
  - *Nazwa Munthaha Hendriyani Nasution*: Pembuatan halaman statis landing page profil Rosalia Indah, desain kartu armada bus, dan styling CSS responsif.
  - *Natalia Siddharta*: Perancangan form interaktif data penumpang, integrasi visualisasi peta Leaflet.js (OpenStreetMap) untuk live tracking bus, dan pengujian alur antarmuka pengguna (*usability testing*).

### 7. Kendala yang Dihadapi & Solusi
1. *Koneksi Serverless di Vercel*: Fungsi serverless yang sering di-invoke dapat memicu pembukaan koneksi baru berulang kali.
   - **Solusi**: Dibuat modul `config/db.js` dengan mekanisme *cached connection reuse* yang memeriksa `mongoose.connection.readyState`.
2. *Keterbatasan WebSocket di Lingkungan Serverless Vercel*: Vercel tidak mendukung koneksi WebSocket persisten untuk live location bus.
   - **Solusi**: Menerapkan arsitektur **HTTP Polling (Interval Fetch)** dengan interval 8 detik yang dikombinasikan dengan library peta OpenStreetMap (**Leaflet.js**) sehingga live tracking berjalan mulus tanpa biaya server tambahan.
3. *Kompatibilitas Express 5*: Pada Express versi 5, `req.body` bernilai `undefined` jika request tidak membawa body JSON.
   - **Solusi**: Ditambahkan middleware global `req.body ??= {}` pada `app.js`.

### 8. Rencana Sebelum Demonstrasi
1. Melakukan seeding data lengkap ke MongoDB Atlas di Cloud menggunakan `npm run seed`.
2. Memastikan seluruh Environment Variables di dashboard Vercel (`DB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`) sudah terpasang.
3. Melakukan pengujian menyeluruh pada URL Vercel menggunakan Postman Runner untuk memastikan status kelulusan 100%.
4. Mendemonstrasikan pemesanan tiket pulang-pergi dan simulasi pergerakan bus di peta [tracking.html](file:///d:/SI5C-Express/Tugas-Kelompok/public/tracking.html).

---

## 8. Spesifikasi Teknis Endpoint API

### A. Modul Autentikasi (`/api/auth`)
| Method | URL | Akses | Deskripsi |
|:---|:---|:---|:---|
| `POST` | `/api/auth/register` | Publik | Mendaftarkan akun pengguna baru |
| `POST` | `/api/auth/login` | Publik | Otentikasi username/email & password, mengembalikan token JWT |
| `GET` | `/api/auth/me` | Bearer Token | Mengambil data profil pengguna yang sedang login |

### B. Modul Armada Bus & Live Location (`/api/bus`)
| Method | URL | Akses | Deskripsi |
|:---|:---|:---|:---|
| `GET` | `/api/bus` | Publik | Mendapatkan seluruh daftar armada bus |
| `GET` | `/api/bus/:id` | Publik | Mendapatkan detail spesifikasi satu armada bus |
| `GET` | `/api/bus/:id/lokasi` | Publik | Mendapatkan koordinat GPS lokasi bus terkini & kecepatan |
| `PUT` | `/api/bus/:id/lokasi` | Admin/Driver | Memperbarui koordinat GPS lokasi bus secara *real-time* |
| `POST` | `/api/bus` | Admin | Menambahkan unit armada bus baru |
| `PUT` | `/api/bus/:id` | Admin | Memperbarui spesifikasi bus |
| `DELETE` | `/api/bus/:id` | Admin | Menghapus unit armada bus |

### C. Modul Rute / Trayek (`/api/rute`)
| Method | URL | Akses | Deskripsi |
|:---|:---|:---|:---|
| `GET` | `/api/rute` | Publik | Mendapatkan seluruh rute perjalanan antarkota |
| `GET` | `/api/rute/:id` | Publik | Mendapatkan detail rute berdasarkan ID |
| `POST` | `/api/rute` | Admin | Menambahkan rute antarkota baru |
| `PUT` | `/api/rute/:id` | Admin | Memperbarui informasi rute atau tarif dasar |
| `DELETE` | `/api/rute/:id` | Admin | Menghapus data rute perjalanan |

### D. Modul Jadwal Keberangkatan (`/api/jadwal`)
| Method | URL | Akses | Deskripsi |
|:---|:---|:---|:---|
| `GET` | `/api/jadwal` | Publik | Menampilkan jadwal bus (filter `kotaAsal`, `kotaTujuan`, `tanggal`) |
| `GET` | `/api/jadwal/:id` | Publik | Menampilkan detail jadwal beserta armada bus dan rutenya |
| `POST` | `/api/jadwal` | Admin | Menambahkan jadwal keberangkatan baru |
| `PUT` | `/api/jadwal/:id` | Admin | Memperbarui jadwal keberangkatan |
| `DELETE` | `/api/jadwal/:id` | Admin | Menghapus jadwal keberangkatan |

### E. Modul Pemesanan Tiket Pulang-Pergi (`/api/pemesanan`)
| Method | URL | Akses | Deskripsi |
|:---|:---|:---|:---|
| `GET` | `/api/pemesanan` | User / Admin | Mengambil daftar pesanan (User: miliknya; Admin: semua) |
| `GET` | `/api/pemesanan/:id` | User / Admin | Mengambil detail pesanan berdasarkan ID atau Kode Booking |
| `POST` | `/api/pemesanan` | User / Admin | Membuat booking tiket (Sekali Jalan, Pulang-Pergi, atau Multi-Kota) |
| `PUT` | `/api/pemesanan/:id/status` | User / Admin | Mengubah status pembayaran (`menunggu_pembayaran`, `lunas`, `dibatalkan`) |
| `DELETE` | `/api/pemesanan/:id` | Admin | Menghapus data pemesanan tiket |

### F. Modul Share Live Tracking Publik (`/api/tracking`)
| Method | URL | Akses | Deskripsi |
|:---|:---|:---|:---|
| `GET` | `/api/tracking/:token` | Publik (Tanpa Login) | Mendapatkan data pelacakan perjalanan bus secara publik tanpa membuka data pribadi/NIK penumpang |

---

## 9. Panduan Menjalankan, Peta Interaktif Leaflet.js, dan Pengujian Postman

### A. Menjalankan Server Lokal & Seeding
1. Masuk ke folder proyek dan jalankan seeder:
   ```powershell
   cd d:\SI5C-Express\Tugas-Kelompok
   npm run seed
   ```
2. Jalankan server dalam mode pengembangan:
   ```powershell
   npm run dev
   ```
3. Buka browser:
   - **Status API & Dokumentasi**: `http://localhost:4000/`
   - **Peta Interaktif Live Tracking Bus**: `http://localhost:4000/tracking.html?token=trk_demo_rosalia2026`

### B. Pengujian Menggunakan Postman
1. Buka aplikasi Postman, klik **Import**, dan pilih file `Rosalia_Indah_API.postman_collection.json`.
2. Jalankan request `Login Admin (Auto Token)` pada folder `1. Autentikasi (JWT)`.
3. Jalankan request `Login Pelanggan (Auto Token)`. Token akan otomatis tersimpan.
4. Jalankan pengujian pada folder `2. Armada Bus & Live Location`:
   - Lakukan kueri `Live Location Bus by ID` (Publik).
   - Lakukan pembaruan koordinat GPS via `Update Lokasi GPS Bus` (Admin).
5. Jalankan `Buat Pemesanan Pulang-Pergi` pada folder `5. Pemesanan Tiket (Booking)`:
   - Sistem akan memesan 2 jadwal sekaligus (jadwal pergi dan pulang) serta mengembalikan token pelacakan publik.
6. Jalankan request pada folder `6. Share Live Tracking Publik`:
   - Kueri `Lacak Perjalanan Bus by Token` berhasil mengembalikan data rute dan posisi bus tanpa memerlukan token otorisasi Bearer JWT.
