// backend/models/Alert.js
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['critical', 'warning', 'info'],
    default: 'info'
  },
  category: {
    type: String,
    enum: ['vitals', 'medication', 'appointment', 'risk-detection']
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    healthRecordId: mongoose.Schema.Types.ObjectId,
    riskScore: Number,
    actionRequired: Boolean
  }
});

module.exports = mongoose.model('Alert', alertSchema);
