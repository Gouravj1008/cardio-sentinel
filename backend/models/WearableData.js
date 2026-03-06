// backend/models/WearableData.js
const mongoose = require('mongoose');

const wearableDataSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceId: String,
  deviceType: {
    type: String,
    enum: ['smartwatch', 'fitness-tracker', 'bp-monitor', 'glucometer']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  data: {
    heartRate: Number,
    steps: Number,
    caloriesBurned: Number,
    sleepDuration: Number,
    activeMinutes: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    bloodSugar: Number,
    oxygenLevel: Number
  },
  synced: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  // Time-series optimization
  timeseries: {
    timeField: 'timestamp',
    metaField: 'patient',
    granularity: 'minutes'
  }
});

module.exports = mongoose.model('WearableData', wearableDataSchema);
