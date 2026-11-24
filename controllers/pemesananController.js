const Pemesanan = require('../models/pemesananModel');
const Jadwal = require('../models/jadwalModel');
const { errorHttp } = require('../middlewares/errorHandler');

// Helper untuk membuat token pelacakan publik acak (Fitur 3)
function generateTrackingToken() {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `trk_${ts}_${rand}`;
}

// GET /api/pemesanan (Protected: Pelanggan melihat pesanannya, Admin dapat melihat semua)
exports.getAll = async (req, res) => {
  const { statusPembayaran, tipePerjalanan, page = 1, limit = 10 } = req.query;
  const filter = {};

  // Jika bukan admin, hanya bisa melihat pesanan milik sendiri
  if (req.user.role !== 'admin') {
    filter.userId = req.user.id;
  }
  if (statusPembayaran) filter.statusPembayaran = statusPembayaran;
  if (tipePerjalanan) filter.tipePerjalanan = tipePerjalanan;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

  const [total, pemesanans] = await Promise.all([
    Pemesanan.countDocuments(filter),
    Pemesanan.find(filter)
      .populate('userId', 'namaLengkap username email nomorTelepon')
      .populate({
        path: 'perjalanan.jadwalId',
        populate: [
          { path: 'busId', select: 'namaBus nomorLambung kelasBus nomorPolisi lokasiTerkini' },
          { path: 'ruteId', select: 'kodeRute kotaAsal kotaTujuan agenKeberangkatan agenTujuan' },
        ],
      })
      .populate({
        path: 'jadwalId',
        populate: [
          { path: 'busId', select: 'namaBus nomorLambung kelasBus nomorPolisi lokasiTerkini' },
          { path: 'ruteId', select: 'kodeRute kotaAsal kotaTujuan agenKeberangkatan agenTujuan' },
        ],
      })
      .sort('-createdAt')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
  ]);

  res.json({
    success: true,
    count: pemesanans.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    data: pemesanans,
  });
};

// GET /api/pemesanan/:id (Protected: Detail pemesanan berdasarkan ID atau kodeBooking)
exports.getById = async (req, res) => {
  const { id } = req.params;
  const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { kodeBooking: id.toUpperCase() };

  const pemesanan = await Pemesanan.findOne(query)
    .populate('userId', 'namaLengkap username email nomorTelepon')
    .populate({
      path: 'perjalanan.jadwalId',
      populate: [
        { path: 'busId', select: 'namaBus nomorLambung kelasBus nomorPolisi lokasiTerkini fasilitas' },
        { path: 'ruteId', select: 'kodeRute kotaAsal kotaTujuan agenKeberangkatan agenTujuan estimasiWaktu' },
      ],
    })
    .populate({
      path: 'jadwalId',
      populate: [
        { path: 'busId', select: 'namaBus nomorLambung kelasBus nomorPolisi lokasiTerkini fasilitas' },
        { path: 'ruteId', select: 'kodeRute kotaAsal kotaTujuan agenKeberangkatan agenTujuan estimasiWaktu' },
      ],
    });

  if (!pemesanan) throw errorHttp(404, 'Data pemesanan tidak ditemukan');

  // Pelanggan hanya boleh melihat pesanannya sendiri
  if (req.user.role !== 'admin' && pemesanan.userId._id.toString() !== req.user.id) {
    throw errorHttp(403, 'Akses ditolak: Anda tidak memiliki akses ke pesanan ini');
  }

  res.json({
    success: true,
    data: pemesanan,
  });
};

// FITUR 1: POST /api/pemesanan (Mendukung Sekali Jalan, Pulang-Pergi, dan Multi-Kota)
exports.create = async (req, res) => {
  const { tipePerjalanan = 'sekali_jalan', perjalanan, jadwalId, penumpang, metodePembayaran, catatan } = req.body;

  // Normalisasi data: Mendukung input format baru (perjalanan: [...]) maupun input tunggal (jadwalId + penumpang)
  let listPerjalanan = [];

  if (Array.isArray(perjalanan) && perjalanan.length > 0) {
    listPerjalanan = perjalanan;
  } else if (jadwalId && Array.isArray(penumpang) && penumpang.length > 0) {
    listPerjalanan = [
      {
        tipe: 'pergi',
        jadwalId,
        penumpang,
      },
    ];
  } else {
    throw errorHttp(400, 'Format pemesanan tidak valid. Sertakan rincian perjalanan dan data penumpang.');
  }

  // Validasi tipe perjalanan
  const tipeValid = ['sekali_jalan', 'pulang_pergi', 'multi_kota'];
  const tipeFinal = tipeValid.includes(tipePerjalanan) ? tipePerjalanan : (listPerjalanan.length > 1 ? 'pulang_pergi' : 'sekali_jalan');

  // Validasi dan reservasi setiap segmen perjalanan
  const segmenTersimpan = [];
  const jadwalDiperbarui = [];
  let totalHargaAkumulasi = 0;

  for (let i = 0; i < listPerjalanan.length; i++) {
    const item = listPerjalanan[i];
    const segmenTipe = item.tipe || (i === 0 ? 'pergi' : (i === 1 ? 'pulang' : 'transit'));

    if (!item.jadwalId || !Array.isArray(item.penumpang) || item.penumpang.length === 0) {
      throw errorHttp(400, `Segmen ${i + 1} (${segmenTipe}): jadwalId dan daftar penumpang minimal 1 wajib diisi`);
    }

    const jadwal = await Jadwal.findById(item.jadwalId).populate('busId');
    if (!jadwal) throw errorHttp(404, `Jadwal pada segmen ${i + 1} (${segmenTipe}) tidak ditemukan`);
    if (jadwal.status !== 'tersedia') {
      throw errorHttp(400, `Jadwal pada segmen ${i + 1} tidak tersedia untuk pemesanan (Status: ${jadwal.status})`);
    }

    const bus = jadwal.busId;
    const nomorKursiDiminta = item.penumpang.map((p) => p.nomorKursi);

    // Cek duplikasi nomor kursi dalam satu segmen
    const setKursi = new Set(nomorKursiDiminta);
    if (setKursi.size !== nomorKursiDiminta.length) {
      throw errorHttp(400, `Terdapat nomor kursi ganda pada segmen ${i + 1} (${segmenTipe})`);
    }

    // Cek batas kapasitas kursi bus
    for (const nomor of nomorKursiDiminta) {
      if (nomor < 1 || nomor > bus.kapasitasKursi) {
        throw errorHttp(400, `Nomor kursi ${nomor} di luar kapasitas bus (1 - ${bus.kapasitasKursi}) pada segmen ${segmenTipe}`);
      }
    }

    // Cek ketersediaan kursi
    const kursiSudahTerpesan = jadwal.kursiTerpesona || [];
    const kursiBentrok = nomorKursiDiminta.filter((n) => kursiSudahTerpesan.includes(n));
    if (kursiBentrok.length > 0) {
      throw errorHttp(400, `Kursi nomor [${kursiBentrok.join(', ')}] pada rute ${segmenTipe} sudah dipesan orang lain`);
    }

    if (jadwal.kursiTersedia < item.penumpang.length) {
      throw errorHttp(400, `Sisa kursi pada rute ${segmenTipe} hanya ${jadwal.kursiTersedia}, tidak cukup untuk ${item.penumpang.length} penumpang`);
    }

    const subtotal = jadwal.hargaTiket * item.penumpang.length;
    totalHargaAkumulasi += subtotal;

    // Tambahkan ke daftar segmen yang siap disimpan
    segmenTersimpan.push({
      tipe: segmenTipe,
      jadwalId: jadwal._id,
      penumpang: item.penumpang,
      subtotal,
    });

    // Catat kursi baru untuk jadwal
    jadwal.kursiTerpesona.push(...nomorKursiDiminta);
    jadwal.kursiTersedia = Math.max(0, jadwal.kursiTersedia - item.penumpang.length);
    jadwalDiperbarui.push(jadwal);
  }

  // Simpan seluruh pembaruan kursi pada jadwal terkait
  for (const jadwal of jadwalDiperbarui) {
    await jadwal.save();
  }

  // Generate kode booking unik (contoh: RI-20261124-ABC12)
  const tanggalStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  const kodeBooking = `RI-${tanggalStr}-${randomStr}`;

  // FITUR 3: Generate token publik untuk live location tracking
  const shareTrackingToken = generateTrackingToken();

  // Buat dokumen pemesanan
  const pemesananBaru = await Pemesanan.create({
    kodeBooking,
    shareTrackingToken,
    userId: req.user.id,
    tipePerjalanan: tipeFinal,
    perjalanan: segmenTersimpan,
    // Tetap simpan jadwalId & penumpang segmen pertama untuk kompatibilitas mundur
    jadwalId: segmenTersimpan[0].jadwalId,
    penumpang: segmenTersimpan[0].penumpang,
    totalHarga: totalHargaAkumulasi,
    metodePembayaran: metodePembayaran || 'QRIS',
    statusPembayaran: 'menunggu_pembayaran',
    catatan: catatan || '',
  });

  const hasil = await Pemesanan.findById(pemesananBaru._id)
    .populate('userId', 'namaLengkap username email nomorTelepon')
    .populate({
      path: 'perjalanan.jadwalId',
      populate: [
        { path: 'busId', select: 'namaBus nomorLambung kelasBus nomorPolisi lokasiTerkini' },
        { path: 'ruteId', select: 'kodeRute kotaAsal kotaTujuan agenKeberangkatan agenTujuan' },
      ],
    });

  res.status(201).json({
    success: true,
    message: `Pemesanan tiket ${tipeFinal.replace('_', ' ')} berhasil dibuat`,
    data: {
      ...hasil.toObject(),
      shareTrackingUrl: `/tracking.html?token=${shareTrackingToken}`,
      publicTrackingApi: `/api/tracking/${shareTrackingToken}`,
    },
  });
};

// PUT /api/pemesanan/:id/status (Protected: Update status pembayaran atau pembatalan)
exports.updateStatus = async (req, res) => {
  const { statusPembayaran } = req.body;
  if (!statusPembayaran) throw errorHttp(400, 'statusPembayaran wajib diisi');

  const pemesanan = await Pemesanan.findById(req.params.id);
  if (!pemesanan) throw errorHttp(404, 'Data pemesanan tidak ditemukan');

  // Pengguna biasa hanya boleh membatalkan pesanannya sendiri saat statusnya masih menunggu_pembayaran
  if (req.user.role !== 'admin') {
    if (pemesanan.userId.toString() !== req.user.id) {
      throw errorHttp(403, 'Akses ditolak: Anda tidak memiliki akses ke pesanan ini');
    }
    if (statusPembayaran !== 'dibatalkan') {
      throw errorHttp(403, 'Pengguna hanya diizinkan mengubah status menjadi "dibatalkan"');
    }
    if (pemesanan.statusPembayaran !== 'menunggu_pembayaran') {
      throw errorHttp(400, 'Pesanan yang sudah lunas atau sudah dibatalkan tidak dapat dibatalkan lagi oleh pengguna');
    }
  }

  const statusLama = pemesanan.statusPembayaran;
  pemesanan.statusPembayaran = statusPembayaran;
  await pemesanan.save();

  // Jika dibatalkan, pulihkan kursi pada SELURUH jadwal perjalanan terkait
  if (statusPembayaran === 'dibatalkan' && statusLama !== 'dibatalkan') {
    const listSegmen = (pemesanan.perjalanan && pemesanan.perjalanan.length > 0)
      ? pemesanan.perjalanan
      : [{ jadwalId: pemesanan.jadwalId, penumpang: pemesanan.penumpang }];

    for (const segmen of listSegmen) {
      if (!segmen.jadwalId) continue;
      const jadwal = await Jadwal.findById(segmen.jadwalId);
      if (jadwal) {
        const kursiBatal = (segmen.penumpang || []).map((p) => p.nomorKursi);
        jadwal.kursiTerpesona = jadwal.kursiTerpesona.filter((k) => !kursiBatal.includes(k));
        jadwal.kursiTersedia = Math.min(jadwal.kursiTersedia + kursiBatal.length, 100);
        await jadwal.save();
      }
    }
  }

  res.json({
    success: true,
    message: `Status pemesanan berhasil diubah menjadi ${statusPembayaran}`,
    data: pemesanan,
  });
};

// DELETE /api/pemesanan/:id (Admin: Hapus transaksi pemesanan)
exports.remove = async (req, res) => {
  const pemesanan = await Pemesanan.findById(req.params.id);
  if (!pemesanan) throw errorHttp(404, 'Data pemesanan tidak ditemukan');

  // Jika dihapus dan belum batal, pulihkan kursi pada semua jadwal
  if (pemesanan.statusPembayaran !== 'dibatalkan') {
    const listSegmen = (pemesanan.perjalanan && pemesanan.perjalanan.length > 0)
      ? pemesanan.perjalanan
      : [{ jadwalId: pemesanan.jadwalId, penumpang: pemesanan.penumpang }];

    for (const segmen of listSegmen) {
      if (!segmen.jadwalId) continue;
      const jadwal = await Jadwal.findById(segmen.jadwalId);
      if (jadwal) {
        const kursiBatal = (segmen.penumpang || []).map((p) => p.nomorKursi);
        jadwal.kursiTerpesona = jadwal.kursiTerpesona.filter((k) => !kursiBatal.includes(k));
        jadwal.kursiTersedia += kursiBatal.length;
        await jadwal.save();
      }
    }
  }

  await pemesanan.deleteOne();

  res.json({
    success: true,
    message: 'Data pemesanan berhasil dihapus',
  });
};
