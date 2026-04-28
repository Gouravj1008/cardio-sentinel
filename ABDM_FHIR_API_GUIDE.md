# ABDM/FHIR API Implementation Guide

## Overview

Cardio Sentinel now offers **production-ready FHIR R4 and ABDM integration** for:
- ✅ Standardized health data exchange (FHIR HL7 format)
- ✅ Integration with India's national health ecosystem (ABDM/NDHM)
- ✅ Consent-based data sharing
- ✅ Interoperability with other healthcare providers
- ✅ Patient-first health data control

## 🎯 What is ABDM?

**ABDM** (Ayushman Bharat Digital Mission) is India's national health data exchange system that enables:
- Secure sharing of health records between patients and healthcare providers
- Government-backed health ID linking
- Unified patient care across providers
- Compliance with India's digital health standards

## 📋 Prerequisites

### 1. ABDM Integration Keys
Set these environment variables in `.env`:

```bash
# ABDM Gateway Configuration
ABDM_GATEWAY_URL=https://dev.ndhm.gov.in  # Dev environment
ABDM_CLIENT_ID=your-client-id-from-abdm
ABDM_CLIENT_SECRET=your-client-secret-from-abdm
ABDM_FACILITY_ID=your-facility-id
FACILITY_NAME=Cardio Sentinel Clinic

# Optional: Production Gateway
# ABDM_GATEWAY_URL=https://gateway.ndhm.gov.in
```

### 2. Patient Health ID (ABHA)
Patients must create an ABHA number:
- Visit: https://abha.abdm.gov.in/
- Create account with Aadhaar or other ID
- Get 14-digit health ID (format: XXXX-XXXX-XXXX-XX)

## 🚀 Quick Start

### 1. Link Patient Health Record to ABDM

```bash
# Patient links their health record to ABHA number
curl -X POST "http://localhost:5000/api/fhir/abdm/link" \
  -H "Authorization: Bearer <patient-token>" \
  -H "Content-Type: application/json" \
  -d {
    "abhaNumber": "1234-5678-9012-34"
  }

# Response:
{
  "success": true,
  "data": {
    "abhaNumber": "1234-5678-9012-34",
    "linkedAt": "2024-03-22T10:30:00Z",
    "phrId": "phr-id-from-abdm"
  }
}
```

### 2. Get Patient Data as FHIR Resources

```bash
# Get patient as FHIR Patient resource
curl -X GET "http://localhost:5000/api/fhir/patient/<patient-id>" \
  -H "Authorization: Bearer <patient-token>"

# Get vitals as FHIR Observations
curl -X GET "http://localhost:5000/api/fhir/observations/<patient-id>" \
  -H "Authorization: Bearer <patient-token>"

# Get complete FHIR Bundle (all resources)
curl -X GET "http://localhost:5000/api/fhir/bundle/<patient-id>" \
  -H "Authorization: Bearer <patient-token>"
```

### 3. Create Consent Request for Data Access

```bash
# Patient initiates consent request for doctor access
curl -X POST "http://localhost:5000/api/fhir/abdm/consent/request" \
  -H "Authorization: Bearer <patient-token>" \
  -H "Content-Type: application/json" \
  -d {
    "abhaNumber": "1234-5678-9012-34",
    "requesterType": "HIP",
    "purpose": "Doctor consultation and cardiology assessment",
    "dataCategories": ["Vital Signs", "Lab Results", "Prescriptions"]
  }

# Response:
{
  "success": true,
  "data": {
    "consentRequestId": "CS-1234567890-abcd",
    "status": "INITIATED",
    "consentManagerUrl": "https://abdm.gov.in/consent/approve/...",
    "expiresAt": "2024-04-21T10:30:00Z"
  }
}
```

### 4. Check Consent Status

```bash
# Check if consent has been approved
curl -X GET "http://localhost:5000/api/fhir/abdm/consent/CS-1234567890-abcd/status" \
  -H "Authorization: Bearer <doctor-token>"

# Response (approved):
{
  "success": true,
  "data": {
    "consentRequestId": "CS-1234567890-abcd",
    "status": "APPROVED",
    "approvedAt": "2024-03-22T11:00:00Z",
    "consentId": "consent-id-for-sharing"
  }
}
```

### 5. Share Patient Data via ABDM

```bash
# Share health data when consent is approved
curl -X POST "http://localhost:5000/api/fhir/abdm/share" \
  -H "Authorization: Bearer <patient-token>" \
  -H "Content-Type: application/json" \
  -d {
    "consentId": "consent-id-from-approval"
  }

# Response:
{
  "success": true,
  "data": {
    "dataExchangeId": "exchange-12345",
    "timestamp": "2024-03-22T11:05:00Z",
    "status": "SHARED"
  }
}
```

### 6. Fetch Records from ABDM

```bash
# Get health records from other providers (if shared with ABDM)
curl -X GET "http://localhost:5000/api/fhir/abdm/records" \
  -H "Authorization: Bearer <patient-token>"

# Response:
{
  "success": true,
  "data": {
    "totalRecords": 5,
    "records": [
      {
        "provider": "Apollo Hospital",
        "date": "2024-03-15",
        "type": "Lab Report",
        "dataUrl": "..."
      }
    ]
  }
}
```

### 7. Revoke Consent

```bash
# Patient can revoke access at any time
curl -X POST "http://localhost:5000/api/fhir/abdm/consent/consent-id/revoke" \
  -H "Authorization: Bearer <patient-token>"

# Response:
{
  "success": true,
  "data": {
    "consentId": "consent-id",
    "revokedAt": "2024-03-22T12:00:00Z",
    "status": "REVOKED"
  }
}
```

## 📊 FHIR Resources Exported

### Patient Resource
```json
{
  "resourceType": "Patient",
  "id": "patient-123",
  "identifier": [
    {
      "system": "https://cardiosentinel.health/patient-id",
      "value": "patient-123"
    },
    {
      "system": "https://indiastack.org/aadhaar",
      "value": "****-****-****-5678"
    }
  ],
  "name": [
    {
      "use": "official",
      "text": "John Doe"
    }
  ],
  "gender": "male",
  "birthDate": "1985-06-15"
}
```

### Observation Resources (Vitals)
```json
{
  "resourceType": "Observation",
  "id": "patient-123-heart-rate",
  "status": "final",
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "8867-4",
        "display": "Heart Rate"
      }
    ]
  },
  "subject": { "reference": "Patient/patient-123" },
  "valueQuantity": {
    "value": 72,
    "unit": "bpm"
  }
}
```

### Condition Resources
```json
{
  "resourceType": "Condition",
  "code": {
    "coding": [
      {
        "system": "http://snomed.info/sct",
        "code": "38341003",
        "display": "Coronary Heart Disease"
      }
    ]
  },
  "subject": { "reference": "Patient/patient-123" },
  "clinicalStatus": { "coding": [{ "code": "active" }] }
}
```

### Risk Assessment Resource
```json
{
  "resourceType": "RiskAssessment",
  "subject": { "reference": "Patient/patient-123" },
  "prediction": [
    {
      "outcome": {
        "coding": [
          {
            "system": "http://snomed.info/sct",
            "code": "38341003",
            "display": "Heart Disease"
          }
        ]
      },
      "probabilityDecimal": 0.68,
      "rationale": "High risk based on ML ensemble prediction"
    }
  ],
  "riskLevel": { "coding": [{ "code": "high" }] }
}
```

## 🔐 Security & Privacy

### Consent Management
- **Patient-First**: Only patients can approve data sharing
- **Time-Limited**: Consents expire automatically
- **Granular Control**: Choose which data categories to share
- **Revocable**: Revoke access at any time
- **Audited**: All access is logged

### Data Protection
- ✅ FHIR data encrypted in transit (HTTPS/TLS)
- ✅ Field-level encryption for sensitive data
- ✅ HIPAA-compliant audit logging
- ✅ Signature verification for data integrity
- ✅ Access control via consent tokens

## 🏥 Integration Steps

### Step 1: Register Facility with ABDM
Contact ABDM to register your healthcare facility and get:
- Client ID
- Client Secret
- Facility ID

### Step 2: Update Environment Variables
```bash
ABDM_CLIENT_ID=your-id
ABDM_CLIENT_SECRET=your-secret
ABDM_FACILITY_ID=your-facility-id
```

### Step 3: Test Integration
```bash
# Test ABDM connection
curl -X GET "http://localhost:5000/api/fhir/patient/test-patient-id" \
  -H "Authorization: Bearer <test-token>"
```

### Step 4: Train Staff
- Explain ABHA number linking
- Show consent workflow to patients
- Document data sharing procedures

## 📱 Frontend Implementation

### Get Patient's FHIR Data (React Example)
```javascript
// Fetch FHIR Patient resource
const response = await fetch(`/api/fhir/patient/${patientId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const fhirPatient = await response.json();

// Use FHIR data to create care summary
console.log(`Patient: ${fhirPatient.name[0].text}`);
console.log(`DOB: ${fhirPatient.birthDate}`);
console.log(`Gender: ${fhirPatient.gender}`);
```

### Initiate ABDM Data Sharing
```javascript
// Create consent request
const consentResponse = await fetch('/api/fhir/abdm/consent/request', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    abhaNumber: patientAbhaNumber,
    purpose: 'Cardiology consultation',
    dataCategories: ['Vital Signs', 'Lab Results']
  })
});

const { data } = await consentResponse.json();

// Redirect patient to consent manager
window.open(data.consentManagerUrl, '_blank');

// Check status periodically
const checkStatus = async () => {
  const statusResponse = await fetch(
    `/api/fhir/abdm/consent/${data.consentRequestId}/status`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  const status = await statusResponse.json();
  
  if (status.data.status === 'APPROVED') {
    // Share data
    await fetch('/api/fhir/abdm/share', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ consentId: status.data.consentId })
    });
  }
};
```

## 🔄 Data Flow

```
┌─────────────┐
│   Patient   │
└──────┬──────┘
       │ 1. Create ABHA number
       │ (at abdm.gov.in)
       ↓
┌─────────────────────────────────┐
│   Cardio Sentinel (Your App)     │
│ 1. Link patient to ABHA          │
│ 2. Store FHIR Patient resource   │
└──────┬──────────────────────────┘
       │ 3. Request consent
       │ for data sharing
       ↓
┌─────────────────────────────────┐
│   ABDM Consent Manager           │
│ (Patient approves sharing)       │
└──────┬──────────────────────────┘
       │ 4. Consent approved
       │ Send FHIR bundle
       ↓
┌─────────────────────────────────┐
│   ABDM Gateway / HIE             │
│ (Store & route patient data)     │
└──────┬──────────────────────────┘
       │ 5. Can share with other
       │    authorized providers
       ↓
┌─────────────────────────────────┐
│   Other Healthcare Providers     │
│ (Hospitals, Labs, Pharmacies)    │
└─────────────────────────────────┘
```

## ✅ Compliance Checklist

- [x] FHIR R4 standard compliance
- [x] ABDM gateway integration
- [x] Consent-based data sharing
- [x] HIPAA audit logging
- [x] Encryption of sensitive data
- [x] Digital signature verification
- [x] Patient privacy controls
- [x] Facility registration support
- [x] Multiple consent request types
- [x] Data category filtering

## 🚨 Troubleshooting

### "Invalid ABHA Number"
- Ensure ABHA number is 14 digits (XXXX-XXXX-XXXX-XX)
- Validate at: https://abha.abdm.gov.in/

### "ABDM Authentication Failed"
- Check ABDM_CLIENT_ID and ABDM_CLIENT_SECRET
- Verify facility is registered with ABDM
- Check ABDM_GATEWAY_URL environment variable

### "Consent Request Expired"
- Consent requests expire in 30 days
- Create new consent request after expiry

## 📞 Support

For ABDM-related questions:
- Visit: https://abdm.gov.in/
- Contact: support@abdm.gov.in

For Cardio Sentinel FHIR support:
- Check HIPAA_AUDIT_LOGGING_GUIDE.md
- Review FHIR resource schemas above

---

**Status**: ✅ **PRODUCTION READY**

Last Updated: March 22, 2026
