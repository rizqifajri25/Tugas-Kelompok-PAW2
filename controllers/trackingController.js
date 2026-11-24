const Pemesanan = require('../models/pemesananModel');
const { errorHttp } = require('../middlewares/errorHandler');

// FITUR 3: Share Live Location Bus ke Orang Lain via Web Link (Akses Publik Tanpa Login JWT)
// GET /api/tracking/:token
exports.getTrackingByToken = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    throw errorHttp(400, 'Tracking token wajib disertakan');
  }

  const pemesanan = await Pemesanan.findOne({ shareTrackingToken: token })
    .populate({
      path: 'perjalanan.jadwalId',
      populate: [
        {
          path: 'busId',
          select: 'namaBus nomorLambung nomorPolisi kelasBus status lokasiTerkini fasilitas',
        },
        {
          path: 'ruteId',
          select: 'kodeRute kotaAsal kotaTujuan agenKeberangkatan agenTujuan jarakKm estimasiWaktu',
        },
      ],
    })
    .populate({
      path: 'jadwalId',
      populate: [
        {
          path: 'busId',
          select: 'namaBus nomorLambung nomorPolisi kelasBus status lokasiTerkini fasilitas',
        },
        {
          path: 'ruteId',
          select: 'kodeRute kotaAsal kotaTujuan agenKeberangkatan agenTujuan jarakKm estimasiWaktu',
        },
      ],
    });

  if (!pemesanan) {
    throw errorHttp(404, 'Tautan pelacakan perjalanan tidak valid atau tiket tidak ditemukan');
  }

  // Bangun daftar perjalanan yang sudah disanitasi
  const segmenPerjalanan = (pemesanan.perjalanan && pemesanan.perjalanan.length > 0)
    ? pemesanan.perjalanan
    : [
        {
          tipe: 'pergi',
          jadwalId: pemesanan.jadwalId,
          penumpang: pemesanan.penumpang,
          subtotal: pemesanan.totalHarga,
        },
      ];

  const perjalananSanitasi = segmenPerjalanan.map((segmen) => {
    const jadwal = segmen.jadwalId;
    const bus = jadwal ? jadwal.busId : null;
    const rute = jadwal ? jadwal.ruteId : null;

    return {
      tipe: segmen.tipe,
      rute: rute
        ? {
            kodeRute: rute.kodeRute,
            kotaAsal: rute.kotaAsal,
            kotaTujuan: rute.kotaTujuan,
            agenKeberangkatan: rute.agenKeberangkatan,
            agenTujuan: rute.agenTujuan,
            estimasiWaktu: rute.estimasiWaktu,
          }
        : null,
      bus: bus
        ? {
            namaBus: bus.namaBus,
            nomorLambung: bus.nomorLambung,
            nomorPolisi: bus.nomorPolisi,
            kelasBus: bus.kelasBus,
            statusOperasional: bus.status,
            lokasiTerkini: bus.lokasiTerkini,
          }
        : null,
      jadwal: jadwal
        ? {
            tanggalKeberangkatan: jadwal.tanggalKeberangkatan,
            waktuKeberangkatan: jadwal.waktuKeberangkatan,
            waktuTiba: jadwal.waktuTiba,
            statusJadwal: jadwal.status,
          }
        : null,
      // Privasi Penumpang: Tampilkan jumlah penumpang dan nomor kursi saja, sembunyikan NIK/KTP
      kursiDipesan: (segmen.penumpang || []).map((p) => p.nomorKursi),
      jumlahPenumpang: (segmen.penumpang || []).length,
    };
  });

  res.json({
    success: true,
    message: 'Data pelacakan perjalanan langsung berhasil dimuat',
    data: {
      kodeBooking: pemesanan.kodeBooking,
      tipePerjalanan: pemesanan.tipePerjalanan,
      statusPembayaran: pemesanan.statusPembayaran,
      waktuPemesanan: pemesanan.createdAt,
      perjalanan: perjalananSanitasi,
      petaUrl: `/tracking.html?token=${token}`,
    },
  });
};
