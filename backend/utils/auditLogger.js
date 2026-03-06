// backend/utils/auditLogger.js

/**
 * Log audit trails for user actions
 * @param {Object} auditData - Audit information
 */
exports.logAudit = async (auditData) => {
  try {
    const {
      user,
      action,
      resourceType,
      resourceId,
      req,
      metadata = {}
    } = auditData;

    // Extract request information
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    // Construct audit log entry
    const auditEntry = {
      timestamp: new Date(),
      userId: user,
      action,
      resourceType,
      resourceId,
      ipAddress,
      userAgent,
      metadata
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUDIT LOG]', JSON.stringify(auditEntry, null, 2));
    }

    // TODO: Save to database audit collection if needed
    // Example: await AuditLog.create(auditEntry);

    return auditEntry;
  } catch (error) {
    console.error('Audit logging error:', error.message);
    // Don't throw - auditing shouldn't block main operations
  }
};
