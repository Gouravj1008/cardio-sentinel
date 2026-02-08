const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  healthRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthRecord'
  },
  alert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert'
  },
  usefulness: {
    type: String,
    enum: ['useful', 'neutral', 'incorrect']
  },
  comments: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
