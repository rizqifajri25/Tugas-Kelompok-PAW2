const mongoose = require('mongoose');

let cachedConnection = null;

async function connectDB() {
  const mongoUri = process.env.DB_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn('DB_URI (atau MONGODB_URI) belum diatur di file .env / Environment Variables.');
    return null;
  }

  // Jika sudah terhubung, langsung gunakan koneksi yang ada
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Jika sedang menghubungkan, gunakan promise yang sama
  if (cachedConnection) {
    return cachedConnection;
  }

  cachedConnection = mongoose
    .connect(mongoUri)
    .then((conn) => {
      console.log('Terhubung ke MongoDB (Rosalia Indah Database)');
      return conn;
    })
    .catch((err) => {
      cachedConnection = null;
      console.error('Gagal terhubung ke MongoDB:', err.message);
      throw err;
    });

  return cachedConnection;
}

module.exports = connectDB;
