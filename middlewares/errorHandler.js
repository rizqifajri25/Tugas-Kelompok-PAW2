function errorHttp(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Rute ${req.method} ${req.originalUrl} tidak ditemukan`,
  });
}

function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Format JSON tidak valid' });
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'data';
    return res.status(409).json({
      success: false,
      message: `${field} '${err.keyValue ? err.keyValue[field] : ''}' sudah terdaftar, gunakan nilai lain`,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const pesan = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    return res.status(400).json({ success: false, message: pesan });
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Format ${err.path} tidak valid`,
    });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Token tidak valid' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token kedaluwarsa' });
  }

  const status = err.status || 500;

  if (status === 500) {
    console.error(err.stack || err);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan internal pada server',
    });
  }

  res.status(status).json({ success: false, message: err.message });
}

module.exports = { errorHttp, notFoundHandler, errorHandler };
