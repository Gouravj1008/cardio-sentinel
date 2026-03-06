const express = require('express');
const { getPatientTimeline } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get(
  '/patient/:patientId',
  protect,
  authorize('doctor'),
  getPatientTimeline
);

module.exports = router;
