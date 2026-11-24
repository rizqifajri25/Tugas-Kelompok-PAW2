const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');
const verifyToken = require('../middlewares/verifyToken');
const hanyaRole = require('../middlewares/hanyaRole');

// Publik
router.get('/', busController.getAll);

// Fitur 2: Live Location Bus (Endpoint Pelacakan Lokasi)
router.get('/:id/lokasi', busController.getLokasi);
router.put('/:id/lokasi', verifyToken, hanyaRole('admin'), busController.updateLokasi);

router.get('/:id', busController.getById);

// Admin Saja (SUB-CPMK-10 Protected Endpoint)
router.post('/', verifyToken, hanyaRole('admin'), busController.create);
router.put('/:id', verifyToken, hanyaRole('admin'), busController.update);
router.delete('/:id', verifyToken, hanyaRole('admin'), busController.remove);

module.exports = router;
