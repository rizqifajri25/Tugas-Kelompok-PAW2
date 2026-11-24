require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const logger = require('./middlewares/logger');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const authRoutes = require('./routes/authRoutes');
const busRoutes = require('./routes/busRoutes');
const ruteRoutes = require('./routes/ruteRoutes');
const jadwalRoutes = require('./routes/jadwalRoutes');
const pemesananRoutes = require('./routes/pemesananRoutes');
const trackingRoutes = require('./routes/trackingRoutes');

// Verifikasi Environment Variables wajib
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET belum diisi di .env atau Environment Variables');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middleware Global ----------
app.use(logger);

// Konfigurasi CORS
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*';
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express 5 fallback untuk body kosong
app.use((req, res, next) => {
  req.body ??= {};
  next();
});

// Middleware koneksi database (otomatis terhubung saat ada request, aman untuk Serverless / Vercel)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Gagal inisialisasi koneksi DB pada request:', err.message);
    next(err);
  }
});

// Sajikan file statis (HTML/CSS landing page dan tracking.html uji coba deployment Vercel)
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Healthcheck & API Info ----------
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Selamat datang di RESTful API Layanan Tiket Bus Rosalia Indah',
    status: 'online',
    version: '1.2.0',
    fiturBaru: [
      'Pemesanan Pulang-Pergi (Round-Trip) & Multi-Kota dalam satu transaksi',
      'Live Location Bus (GPS Coordinates Tracking)',
      'Public Share Live Location Link (Ala GrabFood tracking tanpa login JWT)',
    ],
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (Protected)',
      },
      bus: {
        list: 'GET /api/bus',
        detail: 'GET /api/bus/:id',
        liveLocation: 'GET /api/bus/:id/lokasi (Publik)',
        updateLocation: 'PUT /api/bus/:id/lokasi (Admin/GPS Driver)',
        create: 'POST /api/bus (Admin)',
        update: 'PUT /api/bus/:id (Admin)',
        delete: 'DELETE /api/bus/:id (Admin)',
      },
      rute: {
        list: 'GET /api/rute',
        detail: 'GET /api/rute/:id',
        create: 'POST /api/rute (Admin)',
        update: 'PUT /api/rute/:id (Admin)',
        delete: 'DELETE /api/rute/:id (Admin)',
      },
      jadwal: {
        list: 'GET /api/jadwal',
        detail: 'GET /api/jadwal/:id',
        create: 'POST /api/jadwal (Admin)',
        update: 'PUT /api/jadwal/:id (Admin)',
        delete: 'DELETE /api/jadwal/:id (Admin)',
      },
      pemesanan: {
        list: 'GET /api/pemesanan (Protected)',
        detail: 'GET /api/pemesanan/:id (Protected)',
        createSingleOrRoundTrip: 'POST /api/pemesanan (Protected - Mendukung sekali jalan & pulang-pergi)',
        updateStatus: 'PUT /api/pemesanan/:id/status (Protected)',
        delete: 'DELETE /api/pemesanan/:id (Admin)',
      },
      tracking: {
        publicTrackingByToken: 'GET /api/tracking/:token (Publik - Tanpa Login)',
        webMapView: 'GET /tracking.html?token=:token',
      },
    },
  });
});

// ---------- Route Per Modul ----------
app.use('/api/auth', authRoutes);
app.use('/api/bus', busRoutes);
app.use('/api/rute', ruteRoutes);
app.use('/api/jadwal', jadwalRoutes);
app.use('/api/pemesanan', pemesananRoutes);
app.use('/api/tracking', trackingRoutes);

// Alias tanpa prefix /api untuk kenyamanan pengujian
app.use('/auth', authRoutes);
app.use('/bus', busRoutes);
app.use('/rute', ruteRoutes);
app.use('/jadwal', jadwalRoutes);
app.use('/pemesanan', pemesananRoutes);
app.use('/tracking', trackingRoutes);

// ---------- Handler 404 dan Error Handler ----------
app.use(notFoundHandler);
app.use(errorHandler);

// Jalankan listener jika tidak berada di lingkungan serverless Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server Rosalia Indah Express berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
