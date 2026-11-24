const mongoose = require('mongoose');

const ruteSchema = new mongoose.Schema(
  {
    kodeRute: {
      type: String,
      required: [true, 'kodeRute wajib diisi'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    kotaAsal: {
      type: String,
      required: [true, 'kotaAsal wajib diisi'],
      trim: true,
    },
    kotaTujuan: {
      type: String,
      required: [true, 'kotaTujuan wajib diisi'],
      trim: true,
    },
    agenKeberangkatan: {
      type: String,
      required: [true, 'agenKeberangkatan wajib diisi'],
      trim: true,
    },
    agenTujuan: {
      type: String,
      required: [true, 'agenTujuan wajib diisi'],
      trim: true,
    },
    jarakKm: {
      type: Number,
      min: [1, 'jarak minimal 1 km'],
    },
    estimasiWaktu: {
      type: String,
      trim: true,
    },
    tarifDasar: {
      type: Number,
      required: [true, 'tarifDasar wajib diisi'],
      min: [0, 'tarif tidak boleh negatif'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Rute', ruteSchema);
