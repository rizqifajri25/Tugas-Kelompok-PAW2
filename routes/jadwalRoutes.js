const express = require('express');
const router = express.Router();
const jadwalController = require('../controllers/jadwalController');
const verifyToken = require('../middlewares/verifyToken');
const hanyaRole = require('../middlewares/hanyaRole');

// Publik
router.get('/', jadwalController.getAll);
router.get('/:id', jadwalController.getById);

// Admin Saja (SUB-CPMK-10 Protected Endpoint)
router.post('/', verifyToken, hanyaRole('admin'), jadwalController.create);
router.put('/:id', verifyToken, hanyaRole('admin'), jadwalController.update);
router.delete('/:id', verifyToken, hanyaRole('admin'), jadwalController.remove);

module.exports = router;
