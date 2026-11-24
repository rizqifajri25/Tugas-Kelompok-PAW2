const mongoose = require('mongoose');

const penumpangItemSchema = new mongoose.Schema(
  {
    namaPenumpang: {
      type: String,
      required: [true, 'namaPenumpang wajib diisi'],
      trim: true,
    },
    nomorIdentitas: {
      type: String,
      required: [true, 'nomorIdentitas (NIK/KTP) wajib diisi'],
      trim: true,
    },
    nomorKursi: {
      type: Number,
      required: [true, 'nomorKursi wajib diisi'],
      min: 1,
    },
  },
  { _id: false }
);

// Sub-skema untuk setiap segmen perjalanan (Pergi, Pulang, atau Transit/Multi-Kota)
const segmenPerjalananSchema = new mongoose.Schema(
  {
    tipe: {
      type: String,
      enum: ['pergi', 'pulang', 'transit'],
      default: 'pergi',
    },
    jadwalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Jadwal',
      required: [true, 'jadwalId untuk segmen perjalanan wajib diisi'],
    },
    penumpang: {
      type: [penumpangItemSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'Minimal terdapat 1 data penumpang pada segmen perjalanan',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

const pemesananSchema = new mongoose.Schema(
  {
    kodeBooking: {
      type: String,
      required: [true, 'kodeBooking wajib diisi'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    // Fitur 3: Token Publik untuk Share Live Location Bus (seperti Grab/Gojek tracking)
    shareTrackingToken: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId wajib diisi'],
    },
    // Fitur 1: Tipe Perjalanan (Sekali Jalan, Pulang-Pergi, atau Multi-Kota)
    tipePerjalanan: {
      type: String,
      enum: ['sekali_jalan', 'pulang_pergi', 'multi_kota'],
      default: 'sekali_jalan',
    },
    // Array segmen perjalanan (mendukung lebih dari 1 rute/jadwal dalam 1 transaksi)
    perjalanan: {
      type: [segmenPerjalananSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'Minimal terdapat 1 segmen perjalanan',
      },
    },
    // Kompatibilitas mundur (virtual / legacy reference jika jadwal tunggal)
    jadwalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Jadwal',
    },
    penumpang: {
      type: [penumpangItemSchema],
    },
    totalHarga: {
      type: Number,
      required: [true, 'totalHarga wajib diisi'],
      min: 0,
    },
    metodePembayaran: {
      type: String,
      enum: ['Transfer Bank', 'QRIS', 'Virtual Account', 'Agen'],
      default: 'QRIS',
    },
    statusPembayaran: {
      type: String,
      enum: ['menunggu_pembayaran', 'lunas', 'dibatalkan'],
      default: 'menunggu_pembayaran',
    },
    catatan: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Pemesanan', pemesananSchema);
