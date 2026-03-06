const express = require('express');
const { getDoctorAlerts, markAlertRead } = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('doctor'), getDoctorAlerts);
router.put('/:id/read', protect, markAlertRead);

module.exports = router;
