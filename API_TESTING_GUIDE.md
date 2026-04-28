╔════════════════════════════════════════════════════════════════════╗
║                  API ENDPOINT TESTING GUIDE                        ║
║                   Cardio-Sentinel Backend                          ║
╚════════════════════════════════════════════════════════════════════╝

BASE URL: http://localhost:5000

═════════════════════════════════════════════════════════════════════

TEST 1️⃣: HEALTH CHECK
─────────────────────────────────────────────────────────────────────
Endpoint:  GET /health
Auth:      NOT REQUIRED
Purpose:   Server status check

Command:
  curl -X GET http://localhost:5000/health

Expected Response (200 OK):
{
  "success": true,
  "message": "Cardio Sentinel API is running",
  "timestamp": "2026-03-22T14:25:34.514Z"
}

═════════════════════════════════════════════════════════════════════

TEST 2️⃣: USER REGISTRATION (PATIENT)
─────────────────────────────────────────────────────────────────────
Endpoint:  POST /api/auth/register
Auth:      NOT REQUIRED
Purpose:   Create new patient account

Command:
  curl -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Jane Smith",
      "email": "jane.smith@cardio.com",
      "password": "secure123",
      "phone": "+919876543212",
      "role": "patient"
    }'

Expected Response (201 Created):
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "69bffbb5905dc4249cb8d215",
    "name": "Jane Smith",
    "email": "jane.smith@cardio.com",
    "role": "patient"
  }
}

═════════════════════════════════════════════════════════════════════

TEST 3️⃣: USER LOGIN
─────────────────────────────────────────────────────────────────────
Endpoint:  POST /api/auth/login
Auth:      NOT REQUIRED
Purpose:   Authenticate user and get JWT token

Test Credentials:
  Email:    doctor.test@cardio.com
  Password: doctor123

Command:
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "doctor.test@cardio.com",
      "password": "doctor123"
    }'

Expected Response (200 OK):
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "69bffa98905dc4249cb8d209",
    "name": "Dr. Rajesh Kumar",
    "email": "doctor.test@cardio.com",
    "role": "doctor",
    "isApproved": false
  },
  "destination": "/login?doctorPending=1"
}

═════════════════════════════════════════════════════════════════════

TEST 4️⃣: GET CURRENT USER PROFILE
─────────────────────────────────────────────────────────────────────
Endpoint:  GET /api/auth/me
Auth:      REQUIRED (JWT Token)
Purpose:   Retrieve current logged-in user profile

Command:
  curl -X GET http://localhost:5000/api/auth/me \
    -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

Expected Response (200 OK):
{
  "success": true,
  "data": {
    "id": "69bffa98905dc4249cb8d209",
    "name": "Dr. Rajesh Kumar",
    "email": "doctor.test@cardio.com",
    "phone": "+919876543210",
    "role": "doctor",
    "isApproved": false,
    "profileCompleted": false
  }
}

═════════════════════════════════════════════════════════════════════

TEST 5️⃣: HIPAA AUDIT LOGS (Access Control Demo)
─────────────────────────────────────────────────────────────────────
Endpoint:  GET /api/audit/logs
Auth:      REQUIRED (JWT Token)
Required:  admin OR compliance_officer role
Purpose:   Access HIPAA-compliant audit trail

Command (with doctor token - should FAIL):
  curl -X GET http://localhost:5000/api/audit/logs \
    -H "Authorization: Bearer DOCTOR_JWT_TOKEN"

Expected Response (403 Forbidden):
{
  "success": false,
  "message": "User role doctor is not authorized to access this route"
}

═════════════════════════════════════════════════════════════════════

TEST 6️⃣: FHIR PATIENT RESOURCE
─────────────────────────────────────────────────────────────────────
Endpoint:  GET /api/fhir/patient/:patientId
Auth:      REQUIRED (JWT Token)
Purpose:   Get patient data in HL7 FHIR R4 format

Command:
  curl -X GET http://localhost:5000/api/fhir/patient/69bffa98905dc4249cb8d209 \
    -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

Expected Response (200 OK):
{
  "success": true,
  "data": {
    "resourceType": "Patient",
    "id": "69bffa98905dc4249cb8d209",
    "name": "Dr. Rajesh Kumar",
    "email": "doctor.test@cardio.com",
    "identifier": {
      "value": "CRD-69bffa989"
    }
  }
}

═════════════════════════════════════════════════════════════════════

TEST 7️⃣: DISEASE PREDICTION
─────────────────────────────────────────────────────────────────────
Endpoint:  POST /api/disease-prediction/predict
Auth:      REQUIRED (JWT Token)
Purpose:   ML-based heart disease risk prediction

Command:
  curl -X POST http://localhost:5000/api/disease-prediction/predict \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
    -d '{
      "age": 55,
      "sex": 1,
      "cp": 2,
      "trestbps": 140,
      "chol": 280,
      "fbs": 1,
      "restecg": 1,
      "thalach": 120,
      "exang": 1,
      "oldpeak": 2.5,
      "slope": 2,
      "ca": 2,
      "thal": 3
    }'

Expected Response (200 OK):
{
  "success": true,
  "prediction": 1,
  "riskLevel": "High",
  "details": {
    "probability": 0.87,
    "explanation": "High risk based on age, blood pressure, and cholesterol"
  }
}

═════════════════════════════════════════════════════════════════════

TEST 8️⃣: FHIR PATIENT BUNDLE (Complete Export)
─────────────────────────────────────────────────────────────────────
Endpoint:  GET /api/fhir/bundle/:patientId
Auth:      REQUIRED (JWT Token)
Purpose:   Export all patient data as FHIR Bundle

Command:
  curl -X GET http://localhost:5000/api/fhir/bundle/69bffa98905dc4249cb8d209 \
    -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

Expected Response (200 OK):
{
  "success": true,
  "data": {
    "resourceType": "Bundle",
    "type": "document",
    "entry": [
      { "resource": { "resourceType": "Patient", ... } },
      { "resource": { "resourceType": "Observation", ... } }
    ]
  }
}

═════════════════════════════════════════════════════════════════════

QUICK TESTING WORKFLOW
─────────────────────────────────────────────────────────────────────

1. Get Health Check (no auth):
   curl http://localhost:5000/health

2. Login as Doctor:
   TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"doctor.test@cardio.com","password":"doctor123"}' \
     | jq -r '.token')

3. Get User Profile:
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:5000/api/auth/me

4. Try to access Audit Logs (should fail for doctor):
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:5000/api/audit/logs

5. Get FHIR Patient:
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:5000/api/fhir/patient/YOUR_USER_ID

═════════════════════════════════════════════════════════════════════

COMMON RESPONSE CODES
─────────────────────────────────────────────────────────────────────

200 OK                  - Request successful
201 Created             - Resource created successfully
400 Bad Request         - Invalid request format
401 Unauthorized        - Missing or invalid JWT token
403 Forbidden           - User role not authorized for this action
404 Not Found           - Resource not found
500 Internal Error      - Server error

═════════════════════════════════════════════════════════════════════
