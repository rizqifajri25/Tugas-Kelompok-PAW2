// Membuat akun admin, atau menaikkan akun yang sudah ada menjadi admin.
// Penggunaan: node buatAdmin.js <username> <password> [namaLengkap] [email] [nomorTelepon]
require('dotenv').config();
const bcrypt = require('bcrypt');
const connectDB = require('./config/db');
const User = require('./models/userModel');

async function main() {
  const [username, password, namaLengkap, email, nomorTelepon] = process.argv.slice(2);
  if (!username || !password || password.length < 6) {
    console.error('Penggunaan: node buatAdmin.js <username> <password minimal 6 karakter> [namaLengkap] [email] [nomorTelepon]');
    process.exit(1);
  }

  await connectDB();

  const hashed = await bcrypt.hash(password, 10);
  const uName = username.trim().toLowerCase();
  let user = await User.findOne({ username: uName });

  if (user) {
    user.password = hashed;
    user.role = 'admin';
    if (namaLengkap) user.namaLengkap = namaLengkap;
    if (email) user.email = email.toLowerCase();
    if (nomorTelepon) user.nomorTelepon = nomorTelepon;
    await user.save();
    console.log(`Akun '${user.username}' berhasil diperbarui dan diangkat menjadi role: admin`);
  } else {
    user = await User.create({
      username: uName,
      password: hashed,
      namaLengkap: namaLengkap || `Admin ${uName}`,
      email: email ? email.toLowerCase() : `${uName}@rosalia-indah.co.id`,
      nomorTelepon: nomorTelepon || '081234567890',
      role: 'admin',
    });
    console.log(`Admin baru berhasil dibuat: ${user.username} (role: ${user.role})`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Gagal membuat admin:', err.message);
  process.exit(1);
});
