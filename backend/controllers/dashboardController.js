const HealthRecord = require('../models/HealthRecord');
const Alert = require('../models/Alert');

/**
 * @desc    Get patient timeline for doctor dashboard
 * @route   GET /api/dashboard/patient/:patientId
 * @access  Private (Doctor)
 */
exports.getPatientTimeline = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const records = await HealthRecord.find({ patient: patientId })
      .sort({ recordDate: 1 })
      .select('recordDate vitals aiAnalysis riskScore');

    const alerts = await Alert.find({ patient: patientId })
      .sort({ createdAt: -1 })
      .select('type title isRead createdAt');

    res.status(200).json({
      success: true,
      data: {
        vitalsTimeline: records.map(r => ({
          date: r.recordDate,
          heartRate: r.vitals?.heartRate,
          systolic: r.vitals?.bloodPressure?.systolic,
          diastolic: r.vitals?.bloodPressure?.diastolic,
          oxygenSaturation: r.vitals?.oxygenSaturation
        })),
        riskTimeline: records.map(r => ({
          date: r.recordDate,
          riskScore: r.aiAnalysis?.riskScore || null
        })),
        alerts
      }
    });
  } catch (error) {
    next(error);
  }
};
