const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { errorHttp } = require('../middlewares/errorHandler');

const SALT_ROUNDS = 10;
const PASSWORD_MIN = 6;
const PASSWORD_MAKS_BYTE = 72;

// Register Pengguna Baru
exports.register = async (req, res) => {
  const { namaLengkap, username, email, nomorTelepon, password, role } = req.body;

  if (!namaLengkap || !username || !email || !nomorTelepon || !password) {
    throw errorHttp(400, 'namaLengkap, username, email, nomorTelepon, dan password wajib diisi');
  }

  if (typeof password !== 'string' || password.length < PASSWORD_MIN) {
    throw errorHttp(400, `Password minimal ${PASSWORD_MIN} karakter`);
  }
  if (Buffer.byteLength(password) > PASSWORD_MAKS_BYTE) {
    throw errorHttp(400, `Password maksimal ${PASSWORD_MAKS_BYTE} byte`);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Buat user baru
  const user = await User.create({
    namaLengkap: namaLengkap.trim(),
    username: username.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    nomorTelepon: nomorTelepon.trim(),
    password: hashedPassword,
    role: role && ['user', 'admin'].includes(role) ? role : 'user',
  });

  res.status(201).json({
    success: true,
    message: 'Registrasi berhasil',
    data: {
      id: user._id,
      namaLengkap: user.namaLengkap,
      username: user.username,
      email: user.email,
      nomorTelepon: user.nomorTelepon,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
};

// Login Pengguna
exports.login = async (req, res) => {
  const { identifier, username, password } = req.body;
  const loginKey = (identifier || username || '').trim().toLowerCase();

  if (!loginKey || !password || typeof password !== 'string') {
    throw errorHttp(400, 'Username/email dan password wajib diisi');
  }

  // Cari berdasarkan username atau email
  const user = await User.findOne({
    $or: [{ username: loginKey }, { email: loginKey }],
  }).select('+password');

  const cocok = user ? await bcrypt.compare(password, user.password) : false;
  if (!cocok) {
    throw errorHttp(401, 'Username/email atau password salah');
  }

  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  res.json({
    success: true,
    message: 'Login berhasil',
    data: {
      token,
      user: {
        id: user._id,
        namaLengkap: user.namaLengkap,
        username: user.username,
        email: user.email,
        nomorTelepon: user.nomorTelepon,
        role: user.role,
      },
    },
  });
};

// Profil Pengguna Saat Ini (Protected)
exports.me = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw errorHttp(404, 'Pengguna tidak ditemukan');

  res.json({
    success: true,
    data: {
      id: user._id,
      namaLengkap: user.namaLengkap,
      username: user.username,
      email: user.email,
      nomorTelepon: user.nomorTelepon,
      role: user.role,
      createdAt: user.createdAt,
      tokenExpiresAt: new Date(req.user.exp * 1000),
    },
  });
};
