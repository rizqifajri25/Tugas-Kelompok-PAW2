require('dotenv').config();
const bcrypt = require('bcrypt');
const connectDB = require('./config/db');
const User = require('./models/userModel');
const Bus = require('./models/busModel');
const Rute = require('./models/ruteModel');
const Jadwal = require('./models/jadwalModel');
const Pemesanan = require('./models/pemesananModel');

async function seedData() {
  console.log('Memulai proses seeding data Rosalia Indah (dengan Live Location & Pulang-Pergi)...');
  await connectDB();

  // Bersihkan data lama
  await Promise.all([
    User.deleteMany({}),
    Bus.deleteMany({}),
    Rute.deleteMany({}),
    Jadwal.deleteMany({}),
    Pemesanan.deleteMany({}),
  ]);
  console.log('Data lama pada seluruh koleksi berhasil dibersihkan.');

  // 1. Seed Pengguna (Admin & Pelanggan)
  const passwordHashAdmin = await bcrypt.hash('admin123', 10);
  const passwordHashUser = await bcrypt.hash('password123', 10);

  const [admin, user1, user2, user3, user4] = await User.insertMany([
    {
      namaLengkap: 'Administrator Rosalia Indah',
      username: 'admin',
      email: 'admin@rosalia-indah.co.id',
      nomorTelepon: '081234567890',
      password: passwordHashAdmin,
      role: 'admin',
    },
    {
      namaLengkap: 'Rizqi Fajri Sya\'ban',
      username: 'rizqifajri',
      email: 'rizqifajri@example.com',
      nomorTelepon: '082188991122',
      password: passwordHashUser,
      role: 'user',
    },
    {
      namaLengkap: 'Mikhael Vito Wicaksono',
      username: 'mikhaelvito',
      email: 'vito@example.com',
      nomorTelepon: '081399887766',
      password: passwordHashUser,
      role: 'user',
    },
    {
      namaLengkap: 'Nazwa Munthaha Hendriyani Nasution',
      username: 'nazwamunthaha',
      email: 'nazwa@example.com',
      nomorTelepon: '081244556677',
      password: passwordHashUser,
      role: 'user',
    },
    {
      namaLengkap: 'Natalia Siddharta',
      username: 'nataliasiddharta',
      email: 'natalia@example.com',
      nomorTelepon: '081377889900',
      password: passwordHashUser,
      role: 'user',
    },
  ]);
  console.log('✓ 5 User (1 Admin, 4 Pelanggan Anggota Kelompok) berhasil dibuat.');

  // 2. Seed Armada Bus Rosalia Indah (dengan Koordinat GPS Live Location)
  const buses = await Bus.insertMany([
    {
      nomorPolisi: 'AD 7001 EA',
      nomorLambung: 'DD-101',
      namaBus: 'Rosalia Indah First Class DD-101',
      kelasBus: 'First Class Double Decker',
      kapasitasKursi: 28,
      fasilitas: ['AC', 'Reclining Sleeper Seat', 'AVOD Personal TV', 'Toilet', 'Free WiFi', 'Makan Prasmanan', 'Bantal & Selimut'],
      status: 'aktif',
      lokasiTerkini: {
        latitude: -6.3688,
        longitude: 107.2889,
        namaLokasi: 'Tol Jakarta - Cikampek KM 57 (Arah Timur)',
        kecepatanKmJam: 82,
        arahDerajat: 105,
        terakhirDiperbarui: new Date(),
      },
    },
    {
      nomorPolisi: 'AD 7002 EA',
      nomorLambung: 'SHD-205',
      namaBus: 'Rosalia Indah Super Top SHD-205',
      kelasBus: 'Super Top SHD',
      kapasitasKursi: 30,
      fasilitas: ['AC', 'Reclining Seat 2-1', 'Leg Rest', 'Toilet', 'WiFi', 'Makan & Snack', 'Air Mineral'],
      status: 'aktif',
      lokasiTerkini: {
        latitude: -3.2554,
        longitude: 104.8872,
        namaLokasi: 'Tol Kayu Agung - Palembang KM 335',
        kecepatanKmJam: 78,
        arahDerajat: 340,
        terakhirDiperbarui: new Date(),
      },
    },
    {
      nomorPolisi: 'AD 7003 EA',
      nomorLambung: 'EXEC-312',
      namaBus: 'Rosalia Indah Executive Plus 312',
      kelasBus: 'Executive Plus',
      kapasitasKursi: 34,
      fasilitas: ['AC', 'Reclining Seat 2-2', 'Leg Rest', 'Toilet', 'Snack', 'Bantal Selimut'],
      status: 'aktif',
      lokasiTerkini: {
        latitude: -6.4912,
        longitude: 107.7289,
        namaLokasi: 'Rest Area Tol Cipali KM 102 Subang',
        kecepatanKmJam: 0,
        arahDerajat: 90,
        terakhirDiperbarui: new Date(),
      },
    },
    {
      nomorPolisi: 'AD 7004 EA',
      nomorLambung: 'VIP-408',
      namaBus: 'Rosalia Indah VIP Class 408',
      kelasBus: 'VIP',
      kapasitasKursi: 40,
      fasilitas: ['AC', 'Reclining Seat 2-2', 'Toilet', 'Air Mineral'],
      status: 'aktif',
      lokasiTerkini: {
        latitude: -7.3524,
        longitude: 112.7278,
        namaLokasi: 'Pintu Masuk Terminal Purabaya Surabaya',
        kecepatanKmJam: 25,
        arahDerajat: 180,
        terakhirDiperbarui: new Date(),
      },
    },
  ]);
  console.log(`✓ ${buses.length} Armada Bus Rosalia Indah dengan GPS Live Location berhasil dibuat.`);

  // 3. Seed Rute / Trayek Perjalanan
  const rutes = await Rute.insertMany([
    {
      kodeRute: 'PLM-JKT',
      kotaAsal: 'Palembang',
      kotaTujuan: 'Jakarta',
      agenKeberangkatan: 'Agen Rosalia Indah Km.9 Palembang',
      agenTujuan: 'Terminal Kampung Rambutan Jakarta',
      jarakKm: 580,
      estimasiWaktu: '11 Jam',
      tarifDasar: 350000,
    },
    {
      kodeRute: 'JKT-SLO',
      kotaAsal: 'Jakarta',
      kotaTujuan: 'Solo',
      agenKeberangkatan: 'Terminal Terpadu Pulo Gebang Jakarta',
      agenTujuan: 'Kantor Pusat Rosalia Indah Palur Solo',
      jarakKm: 540,
      estimasiWaktu: '8 Jam',
      tarifDasar: 280000,
    },
    {
      kodeRute: 'SLO-JKT',
      kotaAsal: 'Solo',
      kotaTujuan: 'Jakarta',
      agenKeberangkatan: 'Kantor Pusat Rosalia Indah Palur Solo',
      agenTujuan: 'Terminal Terpadu Pulo Gebang Jakarta',
      jarakKm: 540,
      estimasiWaktu: '8 Jam',
      tarifDasar: 280000,
    },
    {
      kodeRute: 'BDG-SBY',
      kotaAsal: 'Bandung',
      kotaTujuan: 'Surabaya',
      agenKeberangkatan: 'Agen Cicaheum Bandung',
      agenTujuan: 'Terminal Purabaya (Bungurasih) Surabaya',
      jarakKm: 720,
      estimasiWaktu: '12 Jam',
      tarifDasar: 380000,
    },
  ]);
  console.log(`✓ ${rutes.length} Rute perjalanan berhasil dibuat.`);

  // 4. Seed Jadwal Keberangkatan (Besok dan Lusa)
  const besok = new Date();
  besok.setDate(besok.getDate() + 1);
  const tanggalBesok = besok.toISOString().slice(0, 10);

  const lusa = new Date();
  lusa.setDate(lusa.getDate() + 3);
  const tanggalPulang = lusa.toISOString().slice(0, 10);

  const jadwals = await Jadwal.insertMany([
    {
      busId: buses[0]._id, // DD-101 (Jakarta - Solo)
      ruteId: rutes[1]._id,
      tanggalKeberangkatan: tanggalBesok,
      waktuKeberangkatan: '08:00',
      waktuTiba: '16:00',
      hargaTiket: 390000,
      kursiTersedia: 26,
      kursiTerpesona: [1, 2],
      status: 'tersedia',
    },
    {
      busId: buses[2]._id, // EXEC-312 (Solo - Jakarta, untuk jadwal kepulangan)
      ruteId: rutes[2]._id,
      tanggalKeberangkatan: tanggalPulang,
      waktuKeberangkatan: '19:00',
      waktuTiba: '04:00',
      hargaTiket: 290000,
      kursiTersedia: 32,
      kursiTerpesona: [1, 2],
      status: 'tersedia',
    },
    {
      busId: buses[1]._id, // SHD-205 (PLM-JKT)
      ruteId: rutes[0]._id,
      tanggalKeberangkatan: tanggalBesok,
      waktuKeberangkatan: '13:30',
      waktuTiba: '01:00',
      hargaTiket: 350000,
      kursiTersedia: 30,
      kursiTerpesona: [],
      status: 'tersedia',
    },
    {
      busId: buses[3]._id, // VIP (BDG-SBY)
      ruteId: rutes[3]._id,
      tanggalKeberangkatan: tanggalPulang,
      waktuKeberangkatan: '07:30',
      waktuTiba: '19:30',
      hargaTiket: 380000,
      kursiTersedia: 40,
      kursiTerpesona: [],
      status: 'tersedia',
    },
  ]);
  console.log(`✓ ${jadwals.length} Jadwal keberangkatan (termasuk jadwal pulang) berhasil dibuat.`);

  // 5. Seed Pemesanan Pulang-Pergi dengan Share Live Tracking Token
  const demoTrackingToken = 'trk_demo_rosalia2026';
  const pemesanan1 = await Pemesanan.create({
    kodeBooking: 'RI-20261125-RT01',
    shareTrackingToken: demoTrackingToken,
    userId: user1._id,
    tipePerjalanan: 'pulang_pergi',
    perjalanan: [
      {
        tipe: 'pergi',
        jadwalId: jadwals[0]._id, // JKT-SLO
        penumpang: [
          { namaPenumpang: 'Rizqi Fajri Sya\'ban', nomorIdentitas: '1671012510000001', nomorKursi: 1 },
          { namaPenumpang: 'Fito Maulana', nomorIdentitas: '1671012510000002', nomorKursi: 2 },
        ],
        subtotal: 780000,
      },
      {
        tipe: 'pulang',
        jadwalId: jadwals[1]._id, // SLO-JKT
        penumpang: [
          { namaPenumpang: 'Rizqi Fajri Sya\'ban', nomorIdentitas: '1671012510000001', nomorKursi: 1 },
          { namaPenumpang: 'Fito Maulana', nomorIdentitas: '1671012510000002', nomorKursi: 2 },
        ],
        subtotal: 580000,
      },
    ],
    jadwalId: jadwals[0]._id,
    penumpang: [
      { namaPenumpang: 'Rizqi Fajri Sya\'ban', nomorIdentitas: '1671012510000001', nomorKursi: 1 },
      { namaPenumpang: 'Fito Maulana', nomorIdentitas: '1671012510000002', nomorKursi: 2 },
    ],
    totalHarga: 1360000,
    metodePembayaran: 'QRIS',
    statusPembayaran: 'lunas',
    catatan: 'Pemesanan pulang-pergi Jakarta-Solo untuk dinas & liburan',
  });

  console.log(`✓ 1 Pemesanan Pulang-Pergi dibuat dengan kode: ${pemesanan1.kodeBooking}`);
  console.log(`✓ Token Share Live Tracking Publik: ${demoTrackingToken}`);
  console.log(`✓ Buka di browser untuk melihat peta: http://localhost:4000/tracking.html?token=${demoTrackingToken}`);

  console.log('--- SEEDING SELESAI DENGAN SUKSES ---');
  process.exit(0);
}

seedData().catch((err) => {
  console.error('Terjadi kesalahan saat seeding:', err);
  process.exit(1);
});
