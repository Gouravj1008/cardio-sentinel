╔════════════════════════════════════════════════════════════════════════════╗
║              FRONTEND TESTING & DEPLOYMENT GUIDE                         ║
║                   Cardio-Sentinel React Application                       ║
╚════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════
CURRENT FRONTEND STATUS
═══════════════════════════════════════════════════════════════════════════════

✅ Frontend is running on http://localhost:5174
✅ Vite development server is active
✅ Environment configured for backend: http://localhost:5000
✅ React components ready for testing

Server Details:
  Port:     5174
  Protocol: http
  Framework: React + Vite
  Build Tool: Vite
  Styling: TailwindCSS


═══════════════════════════════════════════════════════════════════════════════
TEST CREDENTIALS
═══════════════════════════════════════════════════════════════════════════════

ADMINISTRATOR ACCOUNT
─────────────────────────────────────────────────────────────────────────────
Email:      admin@cardio.com
Password:   admin@SecurePass123!
Access:     /admin dashboard - HIPAA audit logs, compliance reports
Status:     ⏳ Requires API registration or MongoDB insertion

COMPLIANCE OFFICER ACCOUNT
─────────────────────────────────────────────────────────────────────────────
Email:      compliance@cardio.com
Password:   compliance@SecurePass123!
Access:     Compliance reports - audit log analysis
Status:     ⏳ Requires API registration or MongoDB insertion

DOCTOR ACCOUNT (ALREADY EXISTS)
─────────────────────────────────────────────────────────────────────────────
Email:      doctor.test@cardio.com
Password:   doctor123
Access:     Doctor dashboard - patient management
Status:     ✅ Ready to use (may need admin approval)

TEST PATIENT ACCOUNT
─────────────────────────────────────────────────────────────────────────────
Email:      Any from previous test runs (testpat[timestamp]@cardio.com)
Password:   testpat123
Access:     Patient dashboard - health records
Status:     ✅ Created during testing


═══════════════════════════════════════════════════════════════════════════════
STEP 1: REGISTER ADMIN ACCOUNT (IF NOT CREATED)
═══════════════════════════════════════════════════════════════════════════════

Option A: Via API
──────────────────
Method:  POST
URL:     http://localhost:5000/api/auth/register
Headers: Content-Type: application/json

Body:
{
  "name": "System Administrator",
  "email": "admin@cardio.com",
  "password": "admin@SecurePass123!",
  "phone": "+919876543200",
  "role": "admin"
}

Expected Response:
{
  "message": "Admin registered successfully",
  "user": {
    "_id": "...",
    "email": "admin@cardio.com",
    "role": "admin",
    "isApproved": false
  }
}

Note: After registration, you must approve in database (see below)


Option B: Via Frontend
───────────────────────
1. Go to http://localhost:5174
2. Click "Sign Up"
3. Fill form:
   - Name: System Administrator
   - Email: admin@cardio.com
   - Password: admin@SecurePass123!
   - Phone: +919876543200
   - Role: Admin
4. Submit

Then approve in database.


═══════════════════════════════════════════════════════════════════════════════
STEP 2: APPROVE ADMIN IN DATABASE
═══════════════════════════════════════════════════════════════════════════════

Using MongoDB Atlas Web Console:
──────────────────────────────────
1. Go to: https://cloud.mongodb.com
2. Select your cluster
3. Click "Collections"
4. Select database > users collection
5. Find account with email: admin@cardio.com
6. Edit document and set:
   - isApproved: true
   - profileCompleted: true

Using mongosh (MongoDB Shell):
──────────────────────────────
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/cardio_sentinel"

db.users.updateOne(
  { email: "admin@cardio.com" },
  { 
    $set: { 
      isApproved: true,
      profileCompleted: true
    }
  }
)

Verify:
db.users.findOne({ email: "admin@cardio.com" })


═══════════════════════════════════════════════════════════════════════════════
STEP 3: TEST ADMIN LOGIN
═══════════════════════════════════════════════════════════════════════════════

1. Open http://localhost:5174
2. Click "Login"
3. Enter:
   Email:    admin@cardio.com
   Password: admin@SecurePass123!
4. Click "Sign In"

Expected Result:
  ✅ JWT token received
  ✅ Redirected to /admin dashboard
  ✅ HIPAA audit logs visible
  ✅ Compliance reports accessible


═══════════════════════════════════════════════════════════════════════════════
STEP 4: TEST ADMIN DASHBOARD FEATURES
═══════════════════════════════════════════════════════════════════════════════

HIPAA Audit Logs
──────────────────
1. In admin dashboard, click "Audit Logs"
2. You should see entries for:
   ✅ Admin registration
   ✅ Login events
   ✅ API access logs
   ✅ Data modifications

Features to test:
  □ Filter by date range
  □ Filter by event type
  □ Filter by user
  □ Search functionality
  □ Verify immutability (cannot edit logs)


Compliance Reports
───────────────────
1. Click "Compliance Reports"
2. Should see HIPAA compliance metrics:
   ✅ Access control violations
   ✅ Authentication events
   ✅ Data breach attempts
   ✅ Unauthorized access attempts

Features to test:
  □ Generate PDF report
  □ Email report to compliance officer
  □ Export to CSV
  □ View compliance score


Doctor Management
──────────────────
1. Click "Doctor Management"
2. You should see pending doctors:
   □ doctor.test@cardio.com (pending approval)

Testing:
  □ Click "Approve" to approve doctor.test@cardio.com
  □ Click "Reject" (and provide reason)
  □ View doctor details
  □ Revoke doctor credentials


User Statistics
────────────────
1. Click "Statistics"
2. Should see:
   ✅ Total users (admin, doctors, patients)
   ✅ Active sessions
   ✅ Login attempts
   ✅ API call metrics


═══════════════════════════════════════════════════════════════════════════════
STEP 5: TEST DOCTOR ACCOUNT
═══════════════════════════════════════════════════════════════════════════════

1. Logout from admin account
2. Click "Login"
3. Enter:
   Email:    doctor.test@cardio.com
   Password: doctor123
4. Click "Sign In"

Expected Result (IF APPROVED):
  ✅ Redirected to /doctor dashboard
  ✅ Patient list visible
  ✅ Patient management features available

Expected Result (IF NOT APPROVED):
  ❌ Error: "Doctor account not approved"
  → Ask admin to approve this account


Doctor Dashboard Features:
──────────────────────────
□ View assigned patients
□ View patient health records
□ Add new patient
□ View patient telemetry (real-time data)
□ Generate health reports
□ Request FHIR data export


═══════════════════════════════════════════════════════════════════════════════
STEP 6: TEST PATIENT ACCOUNT
═══════════════════════════════════════════════════════════════════════════════

1. Logout from doctor account
2. Click "Login"
3. Enter patient credentials from test run
4. Click "Sign In"

Expected Result:
  ✅ Redirected to /patient dashboard
  ✅ Personal health records visible
  ✅ Telemetry data displayed

Patient Dashboard Features:
───────────────────────────
□ View personal health records
□ View cardiac health metrics
□ Access disease predictions
□ Request specialist appointments
□ Export health data
□ View activity history


═══════════════════════════════════════════════════════════════════════════════
INTEGRATION TESTS
═══════════════════════════════════════════════════════════════════════════════

TEST 1: JWT Authentication
─────────────────────────────
✅ Login returns JWT token
✅ Token is stored in localStorage
✅ Token is sent in Authorization header for API requests
✅ Expired token triggers re-login


TEST 2: Role-Based Access Control
───────────────────────────────────
✅ Admin can access /admin routes
✅ Doctor cannot access /admin routes
✅ Patient cannot access /doctor routes
✅ Non-authenticated users redirected to login


TEST 3: WebSocket Real-Time Updates
──────────────────────────────────────
As doctor, open patient details:
✅ Real-time vital signs update (heart rate, blood pressure, etc.)
✅ Notifications for critical alerts
✅ Connection status indicator


TEST 4: Disease Prediction Integration
─────────────────────────────────────────
As patient:
✅ Disease prediction feature loads
✅ Prediction results display
✅ Historical predictions shown
✅ Accuracy metrics displayed


TEST 5: FHIR Data Export
──────────────────────────
As patient:
✅ Click "Export as FHIR"
✅ FHIR JSON data generated
✅ Download works properly
✅ Data format is valid FHIR R4


═══════════════════════════════════════════════════════════════════════════════
FRONTEND PERMISSIONS MATRIX
═══════════════════════════════════════════════════════════════════════════════

Route                        Admin   Doctor  Patient  Guest
─────────────────────────────────────────────────────────────
/                           ✅      ✅      ✅       ✅
/login                      ✅      ✅      ✅       ✅
/register                   ✅      ✅      ✅       ✅
/admin                      ✅      ❌      ❌       ❌
/admin/audit-logs           ✅      ❌      ❌       ❌
/admin/compliance           ✅      ❌      ❌       ❌
/admin/doctors              ✅      ❌      ❌       ❌
/doctor                     ❌      ✅      ❌       ❌
/doctor/patients            ❌      ✅      ❌       ❌
/doctor/patient/:id         ❌      ✅      ❌       ❌
/patient                    ❌      ❌      ✅       ❌
/patient/health-records     ❌      ❌      ✅       ❌
/patient/predictions        ❌      ❌      ✅       ❌
/patient/export             ❌      ❌      ✅       ❌


═══════════════════════════════════════════════════════════════════════════════
TROUBLESHOOTING FRONTEND
═══════════════════════════════════════════════════════════════════════════════

Issue: Frontend won't load (blank page)
Solution:
  1. Check frontend server running: "npm run dev" in frontend/
  2. Check backend running: port 5000 responding
  3. Check .env has VITE_API_BASE_URL=http://localhost:5000
  4. Clear browser cache and reload

Issue: Login fails with 401
Solution:
  1. Verify credentials are correct
  2. Check backend is running: http://localhost:5000/api/health
  3. Check user exists in database
  4. Check password is correct

Issue: Audit logs not showing
Solution:
  1. Login as admin
  2. Wait 2-3 seconds for page to load
  3. Check browser console for errors
  4. Verify backend /api/audit/logs is working

Issue: WebSocket not connecting
Solution:
  1. Check backend is running
  2. Check port 5000 is accessible
  3. Check frontend has correct VITE_API_BASE_URL
  4. Reload page and try again

Issue: HIPAA audit features not working
Solution:
  1. Verify user role is "admin" or "compliance_officer"
  2. Check audit logs are being created: look in backend console
  3. Verify MongoDB is connected
  4. Check AuditLog collection exists in database


═══════════════════════════════════════════════════════════════════════════════
FRONTEND CONFIGURATION (.env)
═══════════════════════════════════════════════════════════════════════════════

Current Configuration (Development):
────────────────────────────────────
VITE_API_BASE_URL=http://localhost:5000

For Production:
────────────────
VITE_API_BASE_URL=https://api.cardio-sentinel.com
VITE_ANALYTICS_ID=your-google-analytics-id
VITE_SENTRY_DSN=your-sentry-dsn


═══════════════════════════════════════════════════════════════════════════════
QUICK TESTING CHECKLIST
═══════════════════════════════════════════════════════════════════════════════

□ Frontend loads at http://localhost:5174
□ Admin account created and approved
□ Admin login successful
□ Audit logs visible in admin dashboard
□ Doctor account approval works
□ Doctor dashboard loads
□ Patient account login works
□ Patient health records display
□ Real-time updates working
□ FHIR export working
□ Logout works correctly
□ Role-based access control enforced
□ Error messages display properly
□ Mobile responsive design works
□ All navigation links functional


═══════════════════════════════════════════════════════════════════════════════
