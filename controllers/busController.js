const Bus = require('../models/busModel');
const { errorHttp } = require('../middlewares/errorHandler');

// GET /api/bus (Publik / User: Mendapatkan semua data bus dengan pagination, filter, search)
exports.getAll = async (req, res) => {
  const { kelasBus, status, search, sort, page = 1, limit = 10 } = req.query;
  const filter = {};

  if (kelasBus) filter.kelasBus = kelasBus;
  if (status) filter.status = status;
  if (search) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [{ namaBus: regex }, { nomorLambung: regex }, { nomorPolisi: regex }];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const sortParam = sort || '-createdAt';

  const [total, buses] = await Promise.all([
    Bus.countDocuments(filter),
    Bus.find(filter)
      .sort(sortParam)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
  ]);

  res.json({
    success: true,
    count: buses.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    data: buses,
  });
};

// GET /api/bus/:id (Publik: Detail bus)
exports.getById = async (req, res) => {
  const bus = await Bus.findById(req.params.id);
  if (!bus) throw errorHttp(404, 'Data bus tidak ditemukan');

  res.json({
    success: true,
    data: bus,
  });
};

// POST /api/bus (Admin: Tambah bus baru)
exports.create = async (req, res) => {
  const bus = await Bus.create(req.body);
  res.status(201).json({
    success: true,
    message: 'Data armada bus berhasil ditambahkan',
    data: bus,
  });
};

// PUT /api/bus/:id (Admin: Perbarui data bus)
exports.update = async (req, res) => {
  const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!bus) throw errorHttp(404, 'Data bus tidak ditemukan');

  res.json({
    success: true,
    message: 'Data armada bus berhasil diperbarui',
    data: bus,
  });
};

// DELETE /api/bus/:id (Admin: Hapus data bus)
exports.remove = async (req, res) => {
  const bus = await Bus.findByIdAndDelete(req.params.id);
  if (!bus) throw errorHttp(404, 'Data bus tidak ditemukan');

  res.json({
    success: true,
    message: 'Data armada bus berhasil dihapus',
  });
};

// FITUR 2: Live Location Bus (Pelacakan Lokasi)
// GET /api/bus/:id/lokasi (Publik: Mendapatkan lokasi terkini armada bus)
exports.getLokasi = async (req, res) => {
  const bus = await Bus.findById(req.params.id).select('namaBus nomorLambung nomorPolisi kelasBus status lokasiTerkini');
  if (!bus) throw errorHttp(404, 'Data bus tidak ditemukan');

  res.json({
    success: true,
    data: {
      busId: bus._id,
      namaBus: bus.namaBus,
      nomorLambung: bus.nomorLambung,
      nomorPolisi: bus.nomorPolisi,
      kelasBus: bus.kelasBus,
      status: bus.status,
      lokasiTerkini: bus.lokasiTerkini,
    },
  });
};

// PUT /api/bus/:id/lokasi (Admin / Driver: Memperbarui koordinat GPS lokasi bus)
exports.updateLokasi = async (req, res) => {
  const { latitude, longitude, namaLokasi, kecepatanKmJam, arahDerajat } = req.body;

  if (latitude === undefined || longitude === undefined) {
    throw errorHttp(400, 'latitude dan longitude wajib diisi');
  }

  const latNum = parseFloat(latitude);
  const lngNum = parseFloat(longitude);

  if (Number.isNaN(latNum) || latNum < -90 || latNum > 90) {
    throw errorHttp(400, 'latitude harus berupa angka antara -90 hingga 90');
  }
  if (Number.isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
    throw errorHttp(400, 'longitude harus berupa angka antara -180 hingga 180');
  }

  const bus = await Bus.findById(req.params.id);
  if (!bus) throw errorHttp(404, 'Data bus tidak ditemukan');

  bus.lokasiTerkini = {
    latitude: latNum,
    longitude: lngNum,
    namaLokasi: namaLokasi ? String(namaLokasi).trim() : bus.lokasiTerkini.namaLokasi,
    kecepatanKmJam: kecepatanKmJam !== undefined ? Math.max(0, Number(kecepatanKmJam)) : bus.lokasiTerkini.kecepatanKmJam,
    arahDerajat: arahDerajat !== undefined ? Number(arahDerajat) : bus.lokasiTerkini.arahDerajat,
    terakhirDiperbarui: new Date(),
  };

  await bus.save();

  res.json({
    success: true,
    message: 'Lokasi terkini armada bus berhasil diperbarui',
    data: {
      busId: bus._id,
      namaBus: bus.namaBus,
      nomorLambung: bus.nomorLambung,
      lokasiTerkini: bus.lokasiTerkini,
    },
  });
};
