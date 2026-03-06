// backend/routes/doctorRoutes.js
const express = require('express');
const {
  getDoctorPatients,
  getPatientTimeline,
  getPatientSummary,
  createPatient
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('doctor'));

router.get('/patients', getDoctorPatients);
router.post('/patients', createPatient);
router.get('/patients/:patientId/timeline', getPatientTimeline);
router.get('/patients/:patientId/summary', getPatientSummary);

module.exports = router;

