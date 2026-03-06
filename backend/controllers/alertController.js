const Alert = require('../models/Alert');

/**
 * @desc    Get alerts for doctor
 * @route   GET /api/alerts
 * @access  Private (Doctor)
 */
exports.getDoctorAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find({ doctor: req.user.id })
      .sort({ createdAt: -1 })
      .populate('patient', 'name age gender');

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark alert as read
 * @route   PUT /api/alerts/:id/read
 * @access  Private
 */
exports.markAlertRead = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};
