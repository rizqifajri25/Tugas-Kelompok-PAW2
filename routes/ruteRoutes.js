const express = require('express');
const router = express.Router();
const ruteController = require('../controllers/ruteController');
const verifyToken = require('../middlewares/verifyToken');
const hanyaRole = require('../middlewares/hanyaRole');

// Publik
router.get('/', ruteController.getAll);
router.get('/:id', ruteController.getById);

// Admin Saja (SUB-CPMK-10 Protected Endpoint)
router.post('/', verifyToken, hanyaRole('admin'), ruteController.create);
router.put('/:id', verifyToken, hanyaRole('admin'), ruteController.update);
router.delete('/:id', verifyToken, hanyaRole('admin'), ruteController.remove);

module.exports = router;
