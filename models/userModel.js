const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    namaLengkap: {
      type: String,
      required: [true, 'namaLengkap wajib diisi'],
      trim: true,
    },
    username: {
      type: String,
      required: [true, 'username wajib diisi'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'username minimal 3 karakter'],
    },
    email: {
      type: String,
      required: [true, 'email wajib diisi'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'format email tidak valid'],
    },
    nomorTelepon: {
      type: String,
      required: [true, 'nomorTelepon wajib diisi'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'password wajib diisi'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: "role hanya boleh 'user' atau 'admin'",
      },
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
