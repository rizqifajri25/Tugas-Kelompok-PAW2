const mongoose = require('mongoose');

const lokasiSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      default: -6.2088, // Default koordinat area Jakarta/Jawa
    },
    longitude: {
      type: Number,
      default: 106.8456,
    },
    namaLokasi: {
      type: String,
      default: 'Pool Utama Rosalia Indah',
      trim: true,
    },
    kecepatanKmJam: {
      type: Number,
      default: 0,
      min: 0,
    },
    arahDerajat: {
      type: Number,
      default: 0, // 0 - 360 derajat
      min: 0,
      max: 360,
    },
    terakhirDiperbarui: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const busSchema = new mongoose.Schema(
  {
    nomorPolisi: {
      type: String,
      required: [true, 'nomorPolisi wajib diisi'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    nomorLambung: {
      type: String,
      required: [true, 'nomorLambung wajib diisi'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    namaBus: {
      type: String,
      required: [true, 'namaBus wajib diisi'],
      trim: true,
    },
    kelasBus: {
      type: String,
      required: [true, 'kelasBus wajib diisi'],
      enum: {
        values: [
          'First Class Double Decker',
          'Super Top SHD',
          'Executive Plus',
          'VIP',
        ],
        message: 'kelasBus tidak valid',
      },
    },
    kapasitasKursi: {
      type: Number,
      required: [true, 'kapasitasKursi wajib diisi'],
      min: [10, 'kapasitas kursi minimal 10'],
      max: [60, 'kapasitas kursi maksimal 60'],
    },
    fasilitas: {
      type: [String],
      default: ['AC', 'Reclining Seat', 'Toilet'],
    },
    status: {
      type: String,
      enum: ['aktif', 'perawatan', 'tidak_aktif'],
      default: 'aktif',
    },
    // Fitur 2: Live Location Bus (Pelacakan Lokasi)
    lokasiTerkini: {
      type: lokasiSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Bus', busSchema);
