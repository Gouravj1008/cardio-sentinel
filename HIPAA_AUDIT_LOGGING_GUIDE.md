# HIPAA Audit Logging Implementation Guide

## Overview

Cardio Sentinel now includes a **production-ready HIPAA-compliant audit logging system** that automatically tracks all access to Protected Health Information (PHI) and generates compliance reports.

## ✅ Features Implemented

### 1. **Immutable Audit Trail**
- Every audit log entry is immutable and cannot be modified after creation
- SHA-256 hash verification for each log to detect tampering
- Chain of custody verification via hash linking
- 7-year retention period (HIPAA minimum requirement)

### 2. **Field-Level PHI Tracking**
- Tracks specific field changes for UPDATE operations
- Identifies sensitive fields (blood pressure, cholesterol, diagnosis, etc.)
- Encrypts sensitive field values in audit logs
- Distinguishes between PHI and non-PHI data access

### 3. **Comprehensive Access Logging**
Records the following for every access:
- **User**: ID, email, role
- **Time**: Exact timestamp (immutable)
- **Action**: READ, CREATE, UPDATE, DELETE, DOWNLOAD, EXPORT, PRINT, etc.
- **Resource**: Type (patient, health_record, wearable_data, prediction, report, etc.)
- **Patient**: Which patient's data was accessed
- **Location**: IP address, hostname, geographic location
- **Direction**: Request/response metadata and timing
- **Outcome**: Success/failure status

### 4. **Compliance Anomaly Detection**
Automatically flags for review:
- ✓ High-risk actions (DELETE, EXPORT, DOWNLOAD, PRINT)
- ✓ Bulk data access patterns
- ✓ Access outside office hours
- ✓ Unusual access patterns
- ✓ Failed access attempts
- ✓ Potential data breaches

### 5. **Role-Based Access Control**
Different audit report access based on role:
- **Admin**: Full access to all audit logs
- **Compliance Officer**: Compliance reports, breach detection
- **Security Officer**: Security incidents, anomalies
- **Doctor**: Can view patient's access trail (patients can see who accessed their data)
- **Patient**: Can request report of all access to their data

### 6. **Encryption & Security**
- Sensitive field values encrypted with AES-256-CBC
- Encryption keys managed via environment variables
- IP address tracking for suspicious access detection
- User agent logging for security analysis

## 🚀 Quick Start

### 1. View Audit Logs (Admin)

```bash
# Get all audit logs with filtering
curl -X GET "http://localhost:5000/api/audit/logs?limit=100" \
  -H "Authorization: Bearer <admin-token>"

# Filter by user
curl -X GET "http://localhost:5000/api/audit/logs?userId=<user_id>&limit=50" \
  -H "Authorization: Bearer <admin-token>"

# Filter by date range
curl -X GET "http://localhost:5000/api/audit/logs?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer <admin-token>"

# Filter by action
curl -X GET "http://localhost:5000/api/audit/logs?action=DELETE&limit=50" \
  -H "Authorization: Bearer <admin-token>"
```

### 2. Generate Compliance Report

```bash
# Generate HIPAA compliance report for date range
curl -X GET "http://localhost:5000/api/audit/compliance-report?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer <compliance-officer-token>"

# Include breach detection
curl -X GET "http://localhost:5000/api/audit/compliance-report?startDate=2024-01-01&endDate=2024-12-31&includeBreaches=true" \
  -H "Authorization: Bearer <compliance-officer-token>"
```

### 3. View Patient's Data Access Trail

```bash
# Patient views who accessed their data (last 90 days)
curl -X GET "http://localhost:5000/api/audit/patient/<patient_id>/trail" \
  -H "Authorization: Bearer <patient-token>"

# Doctor views patient's access trail
curl -X GET "http://localhost:5000/api/audit/patient/<patient_id>/trail?startDate=2024-01-01" \
  -H "Authorization: Bearer <doctor-token>"
```

### 4. Get Data Access Summary

```bash
# Get who accessed your data and how many times
curl -X GET "http://localhost:5000/api/audit/data-access-summary?patientId=<patient_id>" \
  -H "Authorization: Bearer <patient-token>"
```

### 5. Check Security Incidents

```bash
# Get all security incidents (admin/security officer)
curl -X GET "http://localhost:5000/api/audit/security-incidents?limit=50" \
  -H "Authorization: Bearer <security-officer-token>"

# Get incidents from specific date range
curl -X GET "http://localhost:5000/api/audit/security-incidents?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer <security-officer-token>"
```

### 6. Verify Audit Log Integrity

```bash
# Verify logs haven't been tampered with
curl -X POST "http://localhost:5000/api/audit/verify-integrity" \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "logIds": ["<log_id_1>", "<log_id_2>"]
  }'
```

## 📊 Compliance Reports

The compliance report includes:

```json
{
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-12-31T23:59:59Z"
  },
  "totalEvents": 15234,
  "breakdown": {
    "byAction": {
      "READ": 12500,
      "CREATE": 1200,
      "UPDATE": 800,
      "DELETE": 123,
      "EXPORT": 45,
      "PRINT": 23
    },
    "byResourceType": {
      "health_record": 8900,
      "wearable_data": 4200,
      "prediction": 1500,
      "patient": 300,
      "report": 334
    },
    "byOutcome": {
      "SUCCESS": 15200,
      "FAILURE": 34
    },
    "byUser": {
      "dr.smith@hospital.com": 2340,
      "nurse.jones@hospital.com": 1850,
      "admin@hospital.com": 450
    }
  },
  "potentialBreaches": [
    {
      "_id": "...",
      "userId": "...",
      "userEmail": "suspicious@hospital.com",
      "action": "EXPORT",
      "timestamp": "2024-06-15T22:30:00Z",
      "complianceFlags": {
        "outsideOfficeHours": true,
        "bulkAccess": true
      }
    }
  ],
  "unusualActivity": [...],
  "integrityStatus": "verified"
}
```

## 🔒 Security Implementation

### Immutability Verification

Each audit log includes:
1. **hash**: SHA-256 hash of critical fields
2. **previousHash**: Link to previous log for chain verification
3. **timestamp**: Immutable creation time

```javascript
// Verify integrity
const result = await HIPAACompliantAuditLogger.verifyAuditIntegrity(logId);
// Returns: { valid: true, reason: "Integrity verified" }
```

### Encryption

Sensitive fields are automatically encrypted:
- Blood pressure readings
- Cholesterol levels  
- Diagnoses
- Prescriptions
- Genetic data
- Mental health records
- SSN, addresses, etc.

### Field-Level Tracking

For UPDATE operations, the system tracks:
- Which fields changed
- Old value (encrypted if sensitive)
- New value (encrypted if sensitive)
- Timestamp of change
- User who made change

## 🎯 Audit Logging in API Calls

Audit logging is **automatic** for these routes:

| Route Pattern | Action | Resource Type |
|---|---|---|
| `/api/health/*` | READ | health_record |
| `/api/patient/*` | READ | patient |
| `/api/wearable/ingest` | CREATE | wearable_data |
| `/api/disease-prediction/predict` | READ | prediction |
| `/api/reports/upload` | CREATE | report |
| `/api/prescriptions` | SHARE | prescription |
| `/api/doctor/*` | READ | patient |
| `/api/admin/users` | READ | user |

**Note**: To log custom routes, update `AUDITED_ROUTES` in `backend/middleware/auditLoggingMiddleware.js`

## 📝 Manual Audit Logging

For custom operations, manually log audit events:

```javascript
const HIPAACompliantAuditLogger = require('../utils/hipaaAuditLogger');

// Log a custom action
await HIPAACompliantAuditLogger.logAudit({
  user: req.user.id,
  action: 'REVIEW',  // Custom action
  resourceType: 'patient',
  resourceId: patientId,
  req: req,
  patientId: patientId,
  purpose: 'TREATMENT',
  changedData: {
    oldData: { /* ... */ },
    newData: { /* ... */ }
  }
});

// Log a security event
await HIPAACompliantAuditLogger.logSecurityEvent({
  user: req.user.id,
  resourceType: 'patient',
  resourceId: patientId,
  req: req,
  patientId: patientId,
  // Will be marked as 'SECURITY_EVENT' action
});
```

## 🔍 Compliance Features

### 1. Tamper Detection
```javascript
// Verify logs haven't been modified
const result = await AuditLog.verifyIntegrity(logId);
if (!result.valid) {
  console.error('BREACH DETECTED:', result.reason);
  // Trigger security alert
}
```

### 2. Breach Detection
Automatically flags:
- Access outside office hours
- Bulk data downloads
- DELETE operations
- Multiple failed access attempts
- Access from unusual locations

### 3. Compliance Reporting
```javascript
// Generate compliance report for auditors
const report = await HIPAACompliantAuditLogger.generateComplianceReport(
  new Date('2024-01-01'),
  new Date('2024-12-31'),
  { userId: 'specific-user' }
);
```

### 4. Patient Transparency
Patients can request:
```javascript
// See who accessed their data
const summary = await HIPAACompliantAuditLogger.queryAuditLogs({
  patientId: patientId
});

// Breakdown by user and action
const accessSummary = {
  totalAccess: 234,
  accessByUser: {
    'dr.smith@hospital.com': 145,
    'nurse.jones@hospital.com': 89
  },
  accessByAction: {
    READ: 220,
    DOWNLOAD: 14
  }
};
```

## ⚙️ Configuration

### Environment Variables

```bash
# .env file
ENCRYPTION_KEY=your-secure-encryption-key-here
AUDIT_RETENTION_PERIOD=7_years  # HIPAA requirement
ALERT_EMAIL=security@hospital.com
```

### Database Indexes

Indexes are automatically created for:
- `userId` + `timestamp`
- `patientId` + `timestamp`
- `resourceType` + `resourceId` + `timestamp`
- `complianceFlags.potentialBreach`
- `complianceFlags.unusualAccess`

## 📋 Audit Log Schema

```javascript
{
  // User Information
  userId: ObjectId,              // User who performed action
  userEmail: String,             // User email
  userRole: String,              // patient, doctor, admin

  // Action Details
  action: String,                // READ, CREATE, UPDATE, DELETE, EXPORT, etc.
  resourceType: String,          // patient, health_record, prediction, etc.
  resourceId: ObjectId,          // What was accessed
  patientId: ObjectId,           // Whose data was accessed

  // Access Details
  ipAddress: String,             // Source IP
  userAgent: String,             // Browser/app info
  sessionId: String,             // Session identifier
  hostname: String,              // Server hostname
  location: {                    // Geographic location
    country: String,
    region: String,
    city: String
  },

  // Field Changes (for UPDATE)
  changedFields: [
    {
      fieldName: String,
      oldValue: String,          // Encrypted if sensitive
      newValue: String,          // Encrypted if sensitive
      sensitive: Boolean
    }
  ],

  // Response Information
  outcome: String,               // SUCCESS, FAILURE, PARTIAL
  errorMessage: String,          // If failed
  statusCode: Number,

  // Request Metadata
  requestMetadata: {
    method: String,              // GET, POST, etc.
    path: String,                // API endpoint
    responseTime: Number         // Milliseconds
  },

  // Compliance
  phiAccessLevel: String,        // FULL, MASKED, AGGREGATED
  dataSensitivity: String,       // HIGH, MEDIUM, LOW
  complianceFlags: {
    requiresReview: Boolean,
    potentialBreach: Boolean,
    unusualAccess: Boolean,
    bulkAccess: Boolean,
    outsideOfficeHours: Boolean
  },

  // Integrity
  timestamp: Date,               // Immutable
  hash: String,                  // SHA-256 for integrity
  previousHash: String,          // Chain integrity
  retentionPeriod: String        // 7_years

  // Review
  reviewedBy: ObjectId,          // Admin who reviewed
  reviewedAt: Date,
  reviewNotes: String
}
```

## ✅ Checklist for HIPAA Compliance

- [x] All PHI access logged
- [x] Immutable audit trail
- [x] Field-level change tracking
- [x] Tamper detection (hash verification)
- [x] Encryption of sensitive fields
- [x] 6+ year retention (7 years implemented)
- [x] Anomaly detection
- [x] Access control enforcement
- [x] Compliance reporting
- [x] Patient access requests (who accessed my data)
- [x] Role-based audit access
- [x] Security incident tracking
- [x] Off-hours access flagging
- [x] Failed access attempt logging

## 🚨 Next Steps

1. **Configure Encryption Key**: Set `ENCRYPTION_KEY` in `.env`
2. **Setup Alerts**: Configure email alerts for security events
3. **Schedule Reports**: Create automated compliance reports
4. **Audit Review**: Regular review of flagged incidents
5. **Train Staff**: Train team on data access policies
6. **Monitor**: Regular monitoring of audit logs

---

**Status**: ✅ **COMPLETE AND PRODUCTION-READY**

For questions or issues, contact the Security Team.
