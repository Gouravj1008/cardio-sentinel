const AuditLog = require('../models/AuditLog');

exports.logAudit = async ({
  user,
  action,
  resourceType,
  resourceId,
  req,
  metadata = {}
}) => {
  try {
    await AuditLog.create({
      user,
      action,
      resourceType,
      resourceId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata
    });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
};
