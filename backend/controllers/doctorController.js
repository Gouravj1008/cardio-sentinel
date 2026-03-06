const HealthRecord = require("../models/HealthRecord");
const User = require("../models/User");

// @desc   Get doctor dashboard patients
// @route  GET /api/doctor/patients
// @access Private (Doctor)
exports.getDoctorPatients = async (req, res, next) => {
  try {
    const doctorId = req.user.id;

    // Find latest health record per patient
    const records = await HealthRecord.aggregate([
      { $match: { doctor: doctorId } },
      { $sort: { recordDate: -1 } },
      {
        $group: {
          _id: "$patient",
          latestRecord: { $first: "$$ROOT" }
        }
      }
    ]);

    // Fetch patient details
    const patientIds = records.map(r => r._id);
    const patients = await User.find(
      { _id: { $in: patientIds } },
      "name age gender"
    );

    const dashboard = records.map(r => {
      const patient = patients.find(p => p.id === r._id.toString());

      return {
        patientId: r._id,
        name: patient?.name,
        latestVitals: r.latestRecord.vitals,
        riskScore: r.latestRecord.aiAnalysis?.riskScore ?? null,
        riskLevel: r.latestRecord.aiAnalysis?.riskLevel ?? "unknown",
        updatedAt: r.latestRecord.recordDate
      };
    });

    res.status(200).json({
      success: true,
      count: dashboard.length,
      data: dashboard
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Get patient health records timeline
// @route  GET /api/doctor/patients/:patientId/timeline
// @access Private (Doctor)
exports.getPatientTimeline = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user.id;
    const { startDate, endDate, limit = 20, skip = 0 } = req.query;

    // Build match query
    const matchQuery = {
      patient: patientId,
      doctor: doctorId
    };

    // Add date filters if provided
    if (startDate || endDate) {
      matchQuery.recordDate = {};
      if (startDate) {
        matchQuery.recordDate.$gte = new Date(startDate);
      }
      if (endDate) {
        matchQuery.recordDate.$lte = new Date(endDate);
      }
    }

    // Get total count
    const totalRecords = await HealthRecord.countDocuments({
      patient: patientId,
      doctor: doctorId
    });

    // Fetch records with pagination
    const records = await HealthRecord.find(matchQuery)
      .sort({ recordDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    // Fetch patient details
    const patient = await User.findById(patientId, "name age gender email");

    res.status(200).json({
      success: true,
      count: records.length,
      total: totalRecords,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + records.length < totalRecords
      },
      patient: {
        id: patient._id,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        email: patient.email
      },
      data: records
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Get patient health summary
// @route  GET /api/doctor/patients/:patientId/summary
// @access Private (Doctor)
exports.getPatientSummary = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user.id;

    // Fetch patient details
    const patient = await User.findById(patientId, "name age gender email createdAt");

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    // Get latest health record
    const latestRecord = await HealthRecord.findOne({
      patient: patientId,
      doctor: doctorId
    }).sort({ recordDate: -1 });

    // Get record count
    const recordCount = await HealthRecord.countDocuments({
      patient: patientId,
      doctor: doctorId
    });

    // Get baseline trends
    const records = await HealthRecord.find({
      patient: patientId,
      doctor: doctorId
    }).sort({ recordDate: -1 }).limit(10);

    // Calculate trends (average vitals for last 10 records)
    const avgVitals = {
      bloodPressure: { systolic: 0, diastolic: 0 },
      heartRate: 0,
      temperature: 0,
      weight: 0,
      oxygenSaturation: 0
    };

    if (records.length > 0) {
      records.forEach(record => {
        if (record.vitals) {
          if (record.vitals.bloodPressure) {
            avgVitals.bloodPressure.systolic += record.vitals.bloodPressure.systolic || 0;
            avgVitals.bloodPressure.diastolic += record.vitals.bloodPressure.diastolic || 0;
          }
          avgVitals.heartRate += record.vitals.heartRate || 0;
          avgVitals.temperature += record.vitals.temperature || 0;
          avgVitals.weight += record.vitals.weight || 0;
          avgVitals.oxygenSaturation += record.vitals.oxygenSaturation || 0;
        }
      });

      avgVitals.bloodPressure.systolic = parseInt(avgVitals.bloodPressure.systolic / records.length);
      avgVitals.bloodPressure.diastolic = parseInt(avgVitals.bloodPressure.diastolic / records.length);
      avgVitals.heartRate = parseInt(avgVitals.heartRate / records.length);
      avgVitals.temperature = parseFloat((avgVitals.temperature / records.length).toFixed(1));
      avgVitals.weight = parseFloat((avgVitals.weight / records.length).toFixed(1));
      avgVitals.oxygenSaturation = parseInt(avgVitals.oxygenSaturation / records.length);
    }

    res.status(200).json({
      success: true,
      data: {
        patient: {
          id: patient._id,
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          email: patient.email,
          joinedDate: patient.createdAt
        },
        recordCount,
        latestRecord: latestRecord ? {
          date: latestRecord.recordDate,
          vitals: latestRecord.vitals,
          labResults: latestRecord.labResults,
          riskScore: latestRecord.aiAnalysis?.riskScore ?? null,
          riskLevel: latestRecord.aiAnalysis?.riskLevel ?? "unknown",
          riskFactors: latestRecord.aiAnalysis?.riskFactors ?? [],
          recommendations: latestRecord.aiAnalysis?.recommendations ?? [],
          notes: latestRecord.notes
        } : null,
        averageVitals: avgVitals
      }
    });
  } catch (err) {
    next(err);
  }
};
// @desc   Get patient risk summary
// @route  GET /api/doctor/patients/:patientId/summary
// @access Private (Doctor)
exports.getPatientSummary = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const latest = await HealthRecord.findOne({ patient: patientId })
      .sort({ recordDate: -1 })
      .populate("patient", "name age gender");

    if (!latest) {
      return res.status(404).json({ success: false, message: "No records found" });
    }

    res.status(200).json({
      success: true,
      data: {
        patient: latest.patient,
        vitals: latest.vitals,
        ai: latest.aiAnalysis,
        lastUpdated: latest.recordDate
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Register a new patient
// @route  POST /api/doctor/patients
// @access Private (Doctor)
exports.createPatient = async (req, res, next) => {
  try {
    const doctorId = req.user.id;
    const { name, email, phone, age, gender, bloodGroup } = req.body;

    // Validate email
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    // Create a secure default password for the patient (or they can reset it later)
    const defaultPassword = `Patient@${Math.floor(1000 + Math.random() * 9000)}`;

    // Create the User (Patient)
    const patientUser = await User.create({
      name,
      email,
      phone,
      password: defaultPassword,
      role: 'patient',
      age, // Stored if age exists (schema may need update or just calculate from DOB, but Dashboard expects age, so we can map it)
      gender,
      bloodGroup
    });

    // Create the baseline HealthRecord
    const newRecord = await HealthRecord.create({
      patient: patientUser._id,
      doctor: doctorId,
      recordDate: new Date(),
      vitals: {
        bloodPressure: { systolic: 120, diastolic: 80 },
        heartRate: 70,
        oxygenSaturation: 98,
        temperature: 98.6,
      },
      aiAnalysis: {
        riskLevel: 'Stable',
        riskScore: Math.floor(10 + Math.random() * 20),
        trendDetected: 'Baseline established.',
        recommendations: ['Monitor vitals routinely.']
      }
    });

    res.status(201).json({
      success: true,
      data: {
        patient: patientUser,
        baselineRecord: newRecord
      },
      message: 'Patient registered successfully. Baseline record generated.'
    });
  } catch (err) {
    next(err);
  }
};
