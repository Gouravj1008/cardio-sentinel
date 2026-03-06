const mongoose = require('mongoose');

const baselineSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  vitals: {
    heartRate: {
      mean: Number,
      std: Number
    },
    systolic: {
      mean: Number,
      std: Number
    },
    diastolic: {
      mean: Number,
      std: Number
    },
    oxygenSaturation: {
      mean: Number,
      std: Number
    }
  },
  sampleCount: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Baseline', baselineSchema);
