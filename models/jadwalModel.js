const mongoose = require('mongoose');

const jadwalSchema = new mongoose.Schema(
  {
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: [true, 'busId wajib diisi'],
    },
    ruteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rute',
      required: [true, 'ruteId wajib diisi'],
    },
    tanggalKeberangkatan: {
      type: String, // Format YYYY-MM-DD
      required: [true, 'tanggalKeberangkatan wajib diisi (format YYYY-MM-DD)'],
    },
    waktuKeberangkatan: {
      type: String, // Format HH:mm
      required: [true, 'waktuKeberangkatan wajib diisi (format HH:mm)'],
    },
    waktuTiba: {
      type: String, // Format HH:mm
      required: [true, 'waktuTiba wajib diisi (format HH:mm)'],
    },
    hargaTiket: {
      type: Number,
      required: [true, 'hargaTiket wajib diisi'],
      min: [0, 'hargaTiket tidak boleh negatif'],
    },
    kursiTersedia: {
      type: Number,
      required: [true, 'kursiTersedia wajib diisi'],
      min: [0, 'kursiTersedia tidak boleh negatif'],
    },
    kursiTerpesona: {
      type: [Number],
      default: [],
    },
    status: {
      type: String,
      enum: ['tersedia', 'berangkat', 'selesai', 'dibatalkan'],
      default: 'tersedia',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Jadwal', jadwalSchema);
