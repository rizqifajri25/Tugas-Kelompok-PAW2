const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');

// Fitur 3: Endpoint Publik untuk Share Live Location Bus (Tanpa Token JWT)
// Dapat diakses siapa saja yang memiliki tautan token unik (seperti GrabFood tracking)
router.get('/:token', trackingController.getTrackingByToken);

module.exports = router;
