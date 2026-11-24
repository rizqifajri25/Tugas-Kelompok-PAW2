const Rute = require('../models/ruteModel');
const { errorHttp } = require('../middlewares/errorHandler');

// GET /api/rute (Publik: Daftar rute perjalanan bus Rosalia Indah)
exports.getAll = async (req, res) => {
  const { kotaAsal, kotaTujuan, search, sort, page = 1, limit = 10 } = req.query;
  const filter = {};

  if (kotaAsal) filter.kotaAsal = new RegExp(`^${kotaAsal.trim()}$`, 'i');
  if (kotaTujuan) filter.kotaTujuan = new RegExp(`^${kotaTujuan.trim()}$`, 'i');
  if (search) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { kodeRute: regex },
      { kotaAsal: regex },
      { kotaTujuan: regex },
      { agenKeberangkatan: regex },
      { agenTujuan: regex },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const sortParam = sort || 'kodeRute';

  const [total, rutes] = await Promise.all([
    Rute.countDocuments(filter),
    Rute.find(filter)
      .sort(sortParam)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
  ]);

  res.json({
    success: true,
    count: rutes.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    data: rutes,
  });
};

// GET /api/rute/:id (Publik: Detail rute)
exports.getById = async (req, res) => {
  const rute = await Rute.findById(req.params.id);
  if (!rute) throw errorHttp(404, 'Data rute tidak ditemukan');

  res.json({
    success: true,
    data: rute,
  });
};

// POST /api/rute (Admin: Tambah rute baru)
exports.create = async (req, res) => {
  const rute = await Rute.create(req.body);
  res.status(201).json({
    success: true,
    message: 'Data rute perjalanan berhasil ditambahkan',
    data: rute,
  });
};

// PUT /api/rute/:id (Admin: Perbarui rute)
exports.update = async (req, res) => {
  const rute = await Rute.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!rute) throw errorHttp(404, 'Data rute tidak ditemukan');

  res.json({
    success: true,
    message: 'Data rute perjalanan berhasil diperbarui',
    data: rute,
  });
};

// DELETE /api/rute/:id (Admin: Hapus rute)
exports.remove = async (req, res) => {
  const rute = await Rute.findByIdAndDelete(req.params.id);
  if (!rute) throw errorHttp(404, 'Data rute tidak ditemukan');

  res.json({
    success: true,
    message: 'Data rute perjalanan berhasil dihapus',
  });
};
