// backend/models/HealthRecord.js
const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  recordDate: {
    type: Date,
    default: Date.now
  },
  vitals: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number,
    bmi: Number,
    oxygenSaturation: Number
  },
  labResults: {
    bloodSugar: Number,
    cholesterol: {
      total: Number,
      ldl: Number,
      hdl: Number,
      triglycerides: Number
    },
    hemoglobin: Number
  },
  symptoms: [String],
  diagnosis: String,
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date
  }],
  notes: String,
  attachments: [{
    filename: String,
    fileUrl: String,
    fileType: String,
    uploadDate: Date
  }],
  riskScore: {
    type: Number,
    min: 0,
    max: 100
  },
  aiAnalysis: {
    riskLevel: String,
    trendDetected: String,
    riskFactors: [String],
    recommendations: [String],
    confidence: Number
  }
}, {
  timestamps: true
});

// Calculate BMI
healthRecordSchema.pre('save', function(next) {
  if (this.vitals.weight && this.vitals.height) {
    const heightInMeters = this.vitals.height / 100;
    this.vitals.bmi = (this.vitals.weight / (heightInMeters * heightInMeters)).toFixed(2);
  }
  next();
});

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
