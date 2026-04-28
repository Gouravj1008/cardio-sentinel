╔════════════════════════════════════════════════════════════════════════════╗
║                    ADMIN ACCOUNT SETUP GUIDE                              ║
║                   Cardio-Sentinel Deployment                              ║
╚════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════
QUICK START - ADMIN ACCOUNTS
═══════════════════════════════════════════════════════════════════════════════

The system comes with pre-configured admin accounts that can be created manually
via the API or database scripts. Here are the credentials:


ACCOUNT 1: System Administrator
────────────────────────────────────────────────────────────────────────────
  Email:              admin@cardio.com
  Password:           admin@SecurePass123!
  Role:               admin
  Purpose:            Full system access, user management, HIPAA audit logs
  Dashboard Access:   /admin


ACCOUNT 2: HIPAA Compliance Officer
────────────────────────────────────────────────────────────────────────────
  Email:              compliance@cardio.com
  Password:           compliance@SecurePass123!
  Role:               compliance_officer
  Purpose:            HIPAA compliance reporting, audit log analysis
  Dashboard Access:   /compliance-reports


ACCOUNT 3: Test Doctor (Already Created)
────────────────────────────────────────────────────────────────────────────
  Email:              doctor.test@cardio.com
  Password:           doctor123
  Role:               doctor
  Approval Status:    Not yet approved by admin
  Purpose:            Testing doctor workflows

  To approve this doctor in MongoDB, run:
  ```
  db.users.updateOne(
    { email: "doctor.test@cardio.com" },
    { $set: { isApproved: true } }
  )
  ```


═══════════════════════════════════════════════════════════════════════════════
METHOD 1: CREATE ADMIN ACCOUNT VIA REGISTRATION API
═══════════════════════════════════════════════════════════════════════════════

Step 1: Register Admin
───────────────────────────────────────────────────────────────────────────
POST http://localhost:5000/api/auth/register

Body:
{
  "name": "System Administrator",
  "email": "admin@cardio.com",
  "password": "admin@SecurePass123!",
  "phone": "+919876543200",
  "role": "admin"
}

Step 2: Approve Admin in Database
──────────────────────────────────────────────────────────────────────────
Connect to MongoDB and run:

db.users.updateOne(
  { email: "admin@cardio.com" },
  { 
    $set: { 
      isApproved: true,
      profileCompleted: true
    }
  }
)

Step 3: Login
───────────────────────────────────────────────────────────────────────────
POST http://localhost:5000/api/auth/login

Body:
{
  "email": "admin@cardio.com",
  "password": "admin@SecurePass123!"
}

Response includes JWT token for access to admin endpoints.


═══════════════════════════════════════════════════════════════════════════════
METHOD 2: DIRECT MONGODB INSERTION
═══════════════════════════════════════════════════════════════════════════════

Connect to mongosh and run:

db.users.insertOne({
  name: "System Administrator",
  email: "admin@cardio.com",
  password: "$2a$10$...",  // bcryptjs hashed password
  phone: "+919876543200",
  role: "admin",
  isApproved: true,
  profileCompleted: true,
  createdAt: new Date(),
  updatedAt: new Date()
})


═══════════════════════════════════════════════════════════════════════════════
ADMIN PERMISSIONS & ACCESS CONTROL
═══════════════════════════════════════════════════════════════════════════════

ADMIN ROLE ENDPOINTS:
─────────────────────────────────────────────────────────────────────────
✅ GET /api/audit/logs                     - View all audit logs
✅ GET /api/audit/compliance-report        - HIPAA compliance reports
✅ POST /api/audit/verify-integrity        - Verify audit data integrity
✅ GET /api/audit/security-incidents       - Security event logs
✅ GET /api/doctor/*                       - Manage all doctors
✅ GET /api/patient/*                      - View all patients
✅ GET /api/admin/users                    - User management
✅ POST /api/admin/approve-doctor          - Approve/reject doctors
✅ GET /api/admin/statistics               - System statistics


COMPLIANCE_OFFICER ROLE ENDPOINTS:
─────────────────────────────────────────────────────────────────────────
✅ GET /api/audit/logs                     - View audit logs
✅ GET /api/audit/compliance-report        - HIPAA compliance reports
✅ POST /api/audit/verify-integrity        - Verify audit data
❌ POST /api/admin/*                       - Cannot modify system


DOCTOR ROLE ENDPOINTS:
─────────────────────────────────────────────────────────────────────────
✅ GET /api/auth/me                        - View own profile
✅ GET /api/doctor/patients                - View own patients
✅ GET /api/patient/:id/health-records     - View patient records
❌ GET /api/audit/logs                     - Cannot access audit logs
❌ GET /api/admin/*                        - Cannot access admin endpoints


PATIENT ROLE ENDPOINTS:
─────────────────────────────────────────────────────────────────────────
✅ GET /api/auth/me                        - View own profile
✅ GET /api/patient/health-records         - View own health records
✅ POST /api/disease-prediction/predict    - Use prediction service
✅ GET /api/fhir/patient/:patientId        - Export FHIR data
❌ GET /api/audit/logs                     - Cannot access audit logs
❌ GET /api/doctor/*                       - Cannot view other data


═══════════════════════════════════════════════════════════════════════════════
TESTING ADMIN FEATURES
═══════════════════════════════════════════════════════════════════════════════

1. LOGIN AS ADMIN
──────────────────
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cardio.com",
    "password": "admin@SecurePass123!"
  }'

Save the JWT token from response.

2. ACCESS AUDIT LOGS
────────────────────
curl -X GET http://localhost:5000/api/audit/logs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

3. VIEW COMPLIANCE REPORT
────────────────────────
curl -X GET http://localhost:5000/api/audit/compliance-report \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

4. VERIFY AUDIT INTEGRITY
──────────────────────────
curl -X POST http://localhost:5000/api/audit/verify-integrity \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"


═══════════════════════════════════════════════════════════════════════════════
FRONTEND ADMIN DASHBOARD
═══════════════════════════════════════════════════════════════════════════════

Login to Frontend: http://localhost:5174

1. Enter admin@cardio.com / admin@SecurePass123!
2. You will be redirected to /admin dashboard
3. Access:
   ✅ HIPAA Audit Logs
   ✅ Compliance Reports
   ✅ Doctor Approval Management
   ✅ User Statistics
   ✅ Security Incidents


═══════════════════════════════════════════════════════════════════════════════
SECURITY CONSIDERATIONS
═══════════════════════════════════════════════════════════════════════════════

⚠️  CHANGE DEFAULT PASSWORDS
    Before production deployment, change admin passwords:

    1. Connect to MongoDB
    2. Update password hash using bcryptjs
    3. Never share default credentials

⚠️  MULTI-FACTOR AUTHENTICATION
    For production, implement MFA on admin accounts

⚠️  AUDIT LOG RETENTION
    Ensure audit logs are retained for 6+ years per HIPAA requirements

⚠️  ACCESS LOGGING
    All admin actions are logged in the audit trail


═══════════════════════════════════════════════════════════════════════════════
TROUBLESHOOTING
═══════════════════════════════════════════════════════════════════════════════

Q: I can't login as admin
A: Ensure:
   1. Account is approved (isApproved: true in database)
   2. profileCompleted is set to true
   3. Password is correct
   4. Backend server is running

Q: Admin can't access audit logs
A: Verify:
   1. User role is "admin" or "compliance_officer"
   2. JWT token is valid and not expired
   3. Token is passed in Authorization header

Q: Getting 403 Forbidden on admin endpoints
A: This means:
   1. User role is not authorized for this endpoint
   2. Check user role in database: db.users.findOne({email: "admin@cardio.com"})
   3. Verify correct role is set


═══════════════════════════════════════════════════════════════════════════════
