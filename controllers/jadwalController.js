const Jadwal = require('../models/jadwalModel');
const Bus = require('../models/busModel');
const Rute = require('../models/ruteModel');
const { errorHttp } = require('../middlewares/errorHandler');

// GET /api/jadwal (Publik: Cari jadwal keberangkatan bus)
exports.getAll = async (req, res) => {
  const { tanggal, tanggalKeberangkatan, kotaAsal, kotaTujuan, busId, ruteId, status, sort, page = 1, limit = 10 } = req.query;
  const filter = {};

  const tgl = tanggal || tanggalKeberangkatan;
  if (tgl) filter.tanggalKeberangkatan = tgl;
  if (busId) filter.busId = busId;
  if (ruteId) filter.ruteId = ruteId;
  if (status) filter.status = status;

  // Filter rute berdasarkan kota asal dan tujuan jika ada
  if (kotaAsal || kotaTujuan) {
    const ruteFilter = {};
    if (kotaAsal) ruteFilter.kotaAsal = new RegExp(`^${kotaAsal.trim()}$`, 'i');
    if (kotaTujuan) ruteFilter.kotaTujuan = new RegExp(`^${kotaTujuan.trim()}$`, 'i');

    const matchedRutes = await Rute.find(ruteFilter).select('_id');
    const ruteIds = matchedRutes.map((r) => r._id);
    filter.ruteId = { $in: ruteIds };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const sortParam = sort || 'tanggalKeberangkatan waktuKeberangkatan';

  const [total, jadwals] = await Promise.all([
    Jadwal.countDocuments(filter),
    Jadwal.find(filter)
      .populate('busId', 'namaBus nomorLambung nomorPolisi kelasBus kapasitasKursi fasilitas')
      .populate('ruteId', 'kodeRute kotaAsal kotaTujuan agenKeberangkatan agenTujuan jarakKm estimasiWaktu tarifDasar')
      .sort(sortParam)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
  ]);

  res.json({
    success: true,
    count: jadwals.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    data: jadwals,
  });
};

// GET /api/jadwal/:id (Publik: Detail jadwal keberangkatan)
exports.getById = async (req, res) => {
  const jadwal = await Jadwal.findById(req.params.id)
    .populate('busId')
    .populate('ruteId');

  if (!jadwal) throw errorHttp(404, 'Data jadwal tidak ditemukan');

  res.json({
    success: true,
    data: jadwal,
  });
};

// POST /api/jadwal (Admin: Tambah jadwal keberangkatan)
exports.create = async (req, res) => {
  const { busId, ruteId, tanggalKeberangkatan, waktuKeberangkatan, waktuTiba, hargaTiket, kursiTersedia } = req.body;

  const bus = await Bus.findById(busId);
  if (!bus) throw errorHttp(404, 'Bus yang dipilih tidak ditemukan');

  const rute = await Rute.findById(ruteId);
  if (!rute) throw errorHttp(404, 'Rute yang dipilih tidak ditemukan');

  const kapasitas = kursiTersedia !== undefined ? kursiTersedia : bus.kapasitasKursi;

  const jadwal = await Jadwal.create({
    busId,
    ruteId,
    tanggalKeberangkatan,
    waktuKeberangkatan,
    waktuTiba,
    hargaTiket: hargaTiket !== undefined ? hargaTiket : rute.tarifDasar,
    kursiTersedia: kapasitas,
    kursiTerpesona: [],
    status: req.body.status || 'tersedia',
  });

  const hasil = await Jadwal.findById(jadwal._id).populate('busId').populate('ruteId');

  res.status(201).json({
    success: true,
    message: 'Jadwal keberangkatan berhasil ditambahkan',
    data: hasil,
  });
};

// PUT /api/jadwal/:id (Admin: Perbarui jadwal keberangkatan)
exports.update = async (req, res) => {
  const jadwal = await Jadwal.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('busId')
    .populate('ruteId');

  if (!jadwal) throw errorHttp(404, 'Data jadwal tidak ditemukan');

  res.json({
    success: true,
    message: 'Jadwal keberangkatan berhasil diperbarui',
    data: jadwal,
  });
};

// DELETE /api/jadwal/:id (Admin: Hapus jadwal keberangkatan)
exports.remove = async (req, res) => {
  const jadwal = await Jadwal.findByIdAndDelete(req.params.id);
  if (!jadwal) throw errorHttp(404, 'Data jadwal tidak ditemukan');

  res.json({
    success: true,
    message: 'Jadwal keberangkatan berhasil dihapus',
  });
};
