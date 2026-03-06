const Alert = require('../models/Alert');

/**
 * Evaluate risk & create alerts for doctors
 */
exports.evaluateAndCreateAlert = async ({
  patientId,
  doctorId,
  aiAnalysis,
  recordId
}) => {
  if (!aiAnalysis || !aiAnalysis.riskScore) return;

  let severity = 'info';
  let title = 'Health Update';
  let message = 'Routine health update recorded';
  let actionRequired = false;

  const risk = aiAnalysis.riskScore;

  if (risk >= 80) {
    severity = 'critical';
    title = 'Critical cardiovascular risk detected';
    message =
      'AI detected significant deviation and high cardiovascular risk. Immediate review recommended.';
    actionRequired = true;
  } else if (risk >= 60) {
    severity = 'warning';
    title = 'Worsening cardiovascular trend';
    message =
      'Progressive cardiovascular risk detected. Close monitoring advised.';
    actionRequired = true;
  } else if (risk >= 40) {
    severity = 'info';
    title = 'Mild health deviation detected';
    message =
      'Minor deviation from baseline observed. No immediate action required.';
  }

  await Alert.create({
    patient: patientId,
    doctor: doctorId,
    type: severity,
    category: 'risk-detection',
    title,
    message,
    metadata: {
      healthRecordId: recordId,
      riskScore: risk,
      actionRequired
    }
  });
};
