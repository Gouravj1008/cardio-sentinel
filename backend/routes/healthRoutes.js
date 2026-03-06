// backend/routes/healthRoutes.js
const express = require('express');
const {
  createHealthRecord,
  getHealthRecords,
  getHealthRecord,
  updateHealthRecord,
  getLongitudinalAnalysis
} = require('../controllers/healthController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/records')
  .get(protect, getHealthRecords)
  .post(protect, authorize('doctor', 'patient'), createHealthRecord);

router.route('/records/:id')
  .get(protect, getHealthRecord)
  .put(protect, authorize('doctor'), updateHealthRecord);

router.get('/analysis/longitudinal/:patientId', 
  protect, 
  authorize('doctor', 'patient'), 
  getLongitudinalAnalysis
);

module.exports = router;
