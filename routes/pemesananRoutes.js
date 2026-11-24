const express = require('express');
const router = express.Router();
const pemesananController = require('../controllers/pemesananController');
const verifyToken = require('../middlewares/verifyToken');
const hanyaRole = require('../middlewares/hanyaRole');

// Terproteksi (Login Diperlukan)
router.get('/', verifyToken, pemesananController.getAll);
router.get('/:id', verifyToken, pemesananController.getById);
router.post('/', verifyToken, hanyaRole('user', 'admin'), pemesananController.create);
router.put('/:id/status', verifyToken, pemesananController.updateStatus);

// Admin Saja
router.delete('/:id', verifyToken, hanyaRole('admin'), pemesananController.remove);

module.exports = router;
