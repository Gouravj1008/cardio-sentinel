const { evaluateAndCreateAlert } = require('../services/alertService');

const HealthRecord = require('../models/HealthRecord');
const axios = require('axios');
const { updateBaseline } = require('../services/baselineService');
const { logAudit } = require('../utils/auditLogger');
const mlService = require('../services/mlService');

/**
 * @desc    Create health record
 * @route   POST /api/health/records
 * @access  Private (Doctor/Patient)
 */
exports.createHealthRecord = async (req, res, next) => {
  try {
    // Assign patient
    req.body.patient = req.body.patient || req.user.id;

    // Assign doctor if creator is doctor
    if (req.user.role === 'doctor') {
      req.body.doctor = req.user.id;
    }

    // 1. Create health record
    const healthRecord = await HealthRecord.create(req.body);

    // 2. Trigger local AI analysis
    const analysisResult = mlService.analyzeHealthRecord({
      vitals: healthRecord.vitals,
      labResults: healthRecord.labResults
    });

    healthRecord.aiAnalysis = analysisResult;
    healthRecord.riskScore = analysisResult.riskScore;
    await healthRecord.save();

    // 3. Write audit log
    await logAudit({
      user: req.user.id,
      action: 'CREATE_HEALTH_RECORD',
      resourceType: 'HealthRecord',
      resourceId: healthRecord._id,
      req,
      metadata: {
        patientId: healthRecord.patient
      }
    });

    // 4. Update patient baseline (non-blocking)
    updateBaseline(healthRecord.patient).catch(err =>
      console.error('Baseline update failed:', err.message)
    );

    // 5. Trigger alert system if risk is high
    if (analysisResult.riskScore >= 60) {
      await evaluateAndCreateAlert({
        patientId: healthRecord.patient,
        doctorId: healthRecord.doctor,
        aiAnalysis: analysisResult,
        recordId: healthRecord._id
      });
    }

    res.status(201).json({
      success: true,
      data: healthRecord
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all health records for a patient
 * @route   GET /api/health/records
 * @access  Private
 */
exports.getHealthRecords = async (req, res, next) => {
  try {
    const patientId =
      req.user.role === 'patient' ? req.user.id : req.query.patientId;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    const records = await HealthRecord.find({ patient: patientId })
      .sort({ recordDate: -1 })
      .populate('doctor', 'name email phone')
      .populate('patient', 'name email');

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get longitudinal analysis
 * @route   GET /api/health/analysis/longitudinal/:patientId
 * @access  Private (Doctor/Patient)
 */
exports.getLongitudinalAnalysis = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { startDate, endDate } = req.query;

    const query = { patient: patientId };

    if (startDate && endDate) {
      query.recordDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const records = await HealthRecord.find(query)
      .sort({ recordDate: 1 })
      .select('recordDate vitals labResults');

    // Call ML service for longitudinal analysis
    const aiResponse = await axios.post(
      `${process.env.ML_SERVICE_URL}/api/longitudinal-analysis`,
      {
        patientId,
        records
      },
      { timeout: 8000 }
    );

    res.status(200).json({
      success: true,
      data: {
        records,
        analysis: aiResponse.data
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single health record
 * @route   GET /api/health/records/:id
 * @access  Private
 */
exports.getHealthRecord = async (req, res, next) => {
  try {
    const record = await HealthRecord.findById(req.params.id)
      .populate('doctor', 'name email phone')
      .populate('patient', 'name email');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update health record
 * @route   PUT /api/health/records/:id
 * @access  Private (Doctor)
 */
exports.updateHealthRecord = async (req, res, next) => {
  try {
    const record = await HealthRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    const updatedRecord = await HealthRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    // Recalculate baseline after update
    updateBaseline(updatedRecord.patient).catch(() => { });

    res.status(200).json({
      success: true,
      data: updatedRecord
    });
  } catch (error) {
    next(error);
  }
};
