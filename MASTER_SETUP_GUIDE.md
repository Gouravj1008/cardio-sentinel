╔════════════════════════════════════════════════════════════════════════════╗
║          CARDIO-SENTINEL MASTER SETUP & DEPLOYMENT GUIDE                 ║
║                         Complete End-to-End Walkthrough                   ║
╚════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════
TABLE OF CONTENTS
═══════════════════════════════════════════════════════════════════════════════

1. QUICK START (5 minutes)
2. DETAILED SETUP (30 minutes)
3. ADMIN ACCOUNT CREATION (15 minutes)
4. FRONTEND TESTING (30 minutes)
5. PRODUCTION DEPLOYMENT (4+ hours)
6. TROUBLESHOOTING
7. SUPPORT & DOCUMENTATION


═══════════════════════════════════════════════════════════════════════════════
SECTION 1: QUICK START (5 minutes)
═══════════════════════════════════════════════════════════════════════════════

Assuming backend and frontend are already running:

STEP 1: Verify Backend is Running
──────────────────────────────────
Open Terminal and run:
  curl http://localhost:5000/api/health

Expected Response:
  { "status": "healthy", "timestamp": "..." }

If not running, start it:
  cd backend
  node server.js


STEP 2: Verify Frontend is Running
───────────────────────────────────
Open Browser: http://localhost:5174

You should see the Cardio-Sentinel login page.

If not running, start it in another terminal:
  cd frontend
  npm run dev


STEP 3: Test Login
──────────────────
Use credentials:
  Email:    doctor.test@cardio.com
  Password: doctor123

Expected: Login successful, redirected to doctor dashboard


You now have a working system! Continue to the sections below for:
  - Creating admin accounts
  - Full frontend testing
  - Production deployment


═══════════════════════════════════════════════════════════════════════════════
SECTION 2: DETAILED SETUP (30 minutes)
═══════════════════════════════════════════════════════════════════════════════

If you're setting up from scratch, follow this detailed guide.


2.1 CLONE REPOSITORY & INSTALL DEPENDENCIES
─────────────────────────────────────────────────────────────────────────────

Step 1: Clone Repository
  git clone https://github.com/your-org/cardio-sentinel.git
  cd cardio-sentinel

Step 2: Install Backend Dependencies
  cd backend
  npm install

Step 3: Install Frontend Dependencies  
  cd ../frontend
  npm install

Step 4: Return to Root
  cd ..


2.2 CONFIGURE BACKEND ENVIRONMENT
─────────────────────────────────────────────────────────────────────────────

Step 1: Create Backend .env File
  cd backend
  cp .env.example .env

Step 2: Edit .env with Your Configuration
  nano .env

Required variables:
  PORT=5000
  NODE_ENV=development
  MONGODB_URI=mongodb+srv://[user]:[password]@cluster.mongodb.net/cardio_sentinel
  JWT_SECRET=your-random-secret-string-at-least-32-chars
  JWT_EXPIRE=30d

Step 3: Save and Return to Root
  cd ..


2.3 CONFIGURE FRONTEND ENVIRONMENT
─────────────────────────────────────────────────────────────────────────────

Step 1: Create Frontend .env File
  cd frontend
  cp .env.example .env

Step 2: Edit .env with Your Configuration
  nano .env

Required variable:
  VITE_API_BASE_URL=http://localhost:5000

Step 3: Save and Return to Root
  cd ..


2.4 START BACKEND & FRONTEND SERVERS
─────────────────────────────────────────────────────────────────────────────

Option A: Run in Separate Terminal Windows
  Terminal 1:
    cd backend
    node server.js

  Terminal 2:
    cd frontend
    npm run dev

Option B: Run Both in One Terminal (using npm-run-all)
  npm install -g npm-run-all
  npm install npm-run-all --save-dev
  npm run dev:all


2.5 VERIFY EVERYTHING IS WORKING
─────────────────────────────────────────────────────────────────────────────

Step 1: Check Backend Health
  curl http://localhost:5000/api/health
  Should return: {"status": "healthy", ...}

Step 2: Check Frontend Loads
  Open: http://localhost:5174
  Should see login page

Step 3: Test Login
  Email: doctor.test@cardio.com
  Password: doctor123
  Should successfully login


═══════════════════════════════════════════════════════════════════════════════
SECTION 3: ADMIN ACCOUNT CREATION (15 minutes)
═══════════════════════════════════════════════════════════════════════════════

You must create admin accounts to access the admin dashboard and HIPAA 
compliance features.


METHOD 1: VIA FRONTEND (Recommended for First-Time)
─────────────────────────────────────────────────────────────────────────────

Step 1: Open Frontend
  http://localhost:5174

Step 2: Click "Sign Up" (or navigate to registration page)

Step 3: Fill in Form
  Name:                    System Administrator
  Email:                   admin@cardio.com
  Password:                admin@SecurePass123!
  Confirm Password:        admin@SecurePass123!
  Phone:                   +919876543200
  Role:                    Admin (select from dropdown)

Step 4: Click "Register"

Step 5: Approve in Database
  You need to change isApproved from false to true in MongoDB

  Option A: Using MongoDB Atlas Web Console
    1. Go to https://cloud.mongodb.com
    2. Select your cluster
    3. Click "Collections" > "cardio_sentinel" > "users"
    4. Find the admin@cardio.com document
    5. Edit and set: isApproved = true, profileCompleted = true
    6. Save

  Option B: Using mongosh
    mongosh "mongodb+srv://user:pass@cluster.mongodb.net/cardio_sentinel"
    db.users.updateOne(
      { email: "admin@cardio.com" },
      { $set: { isApproved: true, profileCompleted: true } }
    )

Step 6: Login as Admin
  http://localhost:5174/login
  Email:    admin@cardio.com
  Password: admin@SecurePass123!
  Expected: Admin dashboard loads


METHOD 2: VIA API (For Automation)
─────────────────────────────────────────────────────────────────────────────

Step 1: Register via API
  curl -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{
      "name": "System Administrator",
      "email": "admin@cardio.com",
      "password": "admin@SecurePass123!",
      "phone": "+919876543200",
      "role": "admin"
    }'

Step 2: Approve in Database (same as Method 1, Step 5)

Step 3: Login
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "admin@cardio.com",
      "password": "admin@SecurePass123!"
    }'

  Response will include JWT token.


CREATE COMPLIANCE OFFICER ACCOUNT (Optional but Recommended)
──────────────────────────────────────────────────────────────────────────

Follow same steps as admin, but:
  Email:    compliance@cardio.com
  Password: compliance@SecurePass123!
  Role:     Compliance Officer


═══════════════════════════════════════════════════════════════════════════════
SECTION 4: FRONTEND TESTING (30 minutes)
═══════════════════════════════════════════════════════════════════════════════

Now that you have admin and doctor accounts, test all frontend features.


4.1 TEST ADMIN DASHBOARD
──────────────────────────────────────────────────────────────────────────

Step 1: Login as Admin
  http://localhost:5174/login
  Email:    admin@cardio.com
  Password: admin@SecurePass123!

Step 2: Navigate Admin Dashboard
  You should be redirected to /admin

Step 3: Test HIPAA Audit Logs
  Click "Audit Logs" in navigation
  You should see entries for:
    ✓ Admin registration
    ✓ Login events
    ✓ API calls
    ✓ Data modifications
  
  Try filtering by:
    □ Date range
    □ Event type
    □ User
    □ Search by action

Step 4: Test Compliance Reports
  Click "Compliance Reports"
  You should see:
    ✓ HIPAA compliance metrics
    ✓ Access violations count
    ✓ Unauthorized attempts
    ✓ Compliance score
  
  Try exporting:
    □ PDF report
    □ CSV export
    □ Email report

Step 5: Test Doctor Management
  Click "Doctor Management"
  You should see pending doctors including:
    ✓ doctor.test@cardio.com (pending approval)
  
  Try:
    □ Click "Approve" to approve the doctor
    □ Optionally "Reject" with reason
    □ View doctor details

Step 6: Test User Statistics
  Click "Statistics"
  You should see:
    ✓ Total users count
    ✓ Active sessions
    ✓ Login metrics
    ✓ System statistics


4.2 TEST DOCTOR DASHBOARD
──────────────────────────────────────────────────────────────────────────

Step 1: Logout from Admin
  Click logout in admin dashboard

Step 2: Login as Doctor
  http://localhost:5174/login
  Email:    doctor.test@cardio.com
  Password: doctor123

  NOTE: If you get "Doctor not approved" message:
    - Go back to admin account
    - Approve the doctor in Doctor Management
    - Return here and try again

Step 3: Navigate Doctor Dashboard
  You should see /doctor page with:
    ✓ Patient list
    ✓ Patient search
    ✓ Add new patient button

Step 4: Test Patient Management
  □ View patient list
  □ Click on a patient to view details
  □ View patient health records
  □ View vital signs (real-time if configured)
  □ Add notes to patient

Step 5: Test Health Records
  Click on a patient
  You should see:
    ✓ Name, ID, contact info
    ✓ Medical history
    ✓ Current medications
    ✓ Vital signs
    ✓ Test results

Step 6: Test FHIR Export
  In patient details, look for "Export" option
  Click "Export as FHIR"
  Expected: Download FHIR-formatted JSON file


4.3 TEST PATIENT DASHBOARD
────────────────────────────────────────────────────────────────────────────

Step 1: Logout from Doctor
  Click logout

Step 2: Login as Patient
  Use patient credentials from earlier:
    Email:    testpat[TIMESTAMP]@cardio.com
    Password: testpat123

  If no patient account exists, create one:
    Click "Sign Up"
    Fill in details with role "Patient"

Step 3: Navigate Patient Dashboard
  You should see /patient page with:
    ✓ Personal health records
    ✓ Vital signs display
    ✓ Health history
    ✓ Predictions (if ML service running)

Step 4: Test Health Records
  □ View all personal health records
  □ View vital signs (heart rate, BP, temperature, etc.)
  □ View medications
  □ View appointments
  □ View test results

Step 5: Test Disease Prediction
  Look for "Health Predictions" or "Risk Assessment" section
  Expected:
    ✓ Prediction results display
    ✓ Risk score shown
    ✓ Recommendations provided
    ✓ Historical predictions

Step 6: Test FHIR Export
  Click "Export Health Data"
  Expected:
    ✓ FHIR JSON file downloaded
    ✓ File contains patient health data
    ✓ Format is valid FHIR R4


4.4 FEATURE CHECKLIST
──────────────────────────────────────────────────────────────────────────

Admin Features
  □ Login successful
  □ View audit logs
  □ Filter audit logs (date, user, action)
  □ Search in audit logs
  □ Generate compliance report
  □ Export compliance data
  □ Approve/reject doctors
  □ View system statistics
  □ Access control enforcement (cannot access doctor routes)

Doctor Features
  □ Login successful
  □ View patient list
  □ Search patients
  □ Add new patient
  □ View patient health records
  □ Add patient notes
  □ View vital signs
  □ Request FHIR export
  □ Real-time telemetry (if WebSocket working)

Patient Features
  □ Login successful
  □ View personal health records
  □ View vital signs
  □ View medications and allergies
  □ View test results
  □ View appointments
  □ Request disease prediction
  □ Export FHIR data
  □ View health analytics

Common Features
  □ Logout works
  □ Navigation works
  □ Error messages display properly
  □ Forms validate input
  □ Loading indicators show
  □ Mobile responsive (test on phone/tablet)
  □ Responsive to window resize


═══════════════════════════════════════════════════════════════════════════════
SECTION 5: PRODUCTION DEPLOYMENT (4+ hours)
═══════════════════════════════════════════════════════════════════════════════

When ready to deploy to production, follow these steps.

See PRODUCTION_DEPLOYMENT_GUIDE.md for comprehensive instructions.

Quick Summary:

STEP 1: Update Environment Variables
  Create .env.production files with:
    - Production MongoDB URI
    - Production JWT secret
    - HTTPS URLs
    - Domain configuration

STEP 2: Build Frontend
  cd frontend
  npm run build
  This creates optimized files in dist/

STEP 3: Deploy to Server
  Option A: Self-hosted
    - Copy backend to /opt/cardio-sentinel
    - Use PM2 to manage Node.js process
    - Use Nginx as reverse proxy

  Option B: Netlify/Vercel (Frontend)
    - Push to GitHub
    - Connect to Netlify
    - Automatic deployment

STEP 4: Configure HTTPS/SSL
  - Obtain SSL certificate (Let's Encrypt)
  - Configure Nginx with SSL
  - Enable auto-renewal

STEP 5: Setup Monitoring
  - Configure error tracking (Sentry)
  - Setup performance monitoring
  - Configure alerting

STEP 6: Verify Deployment
  - Test all endpoints
  - Verify HTTPS working
  - Check database connection
  - Monitor error rates


═══════════════════════════════════════════════════════════════════════════════
SECTION 6: TROUBLESHOOTING
═══════════════════════════════════════════════════════════════════════════════

Problem: Backend won't start (port 5000 already in use)
──────────────────────────────────────────────────────────────────────────
Solution 1: Use different port
  PORT=5001 node server.js

Solution 2: Kill process on port 5000
  Windows:
    netstat -ano | findstr :5000
    taskkill /PID [PID_NUMBER] /F
  
  Mac/Linux:
    lsof -i :5000
    kill -9 [PID]

Problem: "Cannot find module" error
───────────────────────────────────────────────────────────────────────────
Solution: Reinstall dependencies
  cd backend (or frontend)
  rm -rf node_modules package-lock.json
  npm install


Problem: Database connection fails
──────────────────────────────────────────────────────────────────────────
Solution 1: Verify MongoDB URI in .env
  MONGODB_URI should be: mongodb+srv://user:pass@cluster.mongodb.net/database

Solution 2: Check MongoDB Atlas whitelist
  1. Go to https://cloud.mongodb.com
  2. Select cluster
  3. Go to Security > Network Access
  4. Add 0.0.0.0/0 to access (for development only)
  5. For production, add specific IP only

Solution 3: Test connection
  mongosh "[paste-your-mongodb-uri]"
  If connected, URI is correct

Problem: Login fails with 401 error
────────────────────────────────────────────────────────────────────────────
Possible Causes:
  1. Wrong email/password
  2. User not in database
  3. Backend not running
  4. Database not connected

Solution:
  1. Verify backend is running: curl http://localhost:5000/api/health
  2. Check credentials in database
  3. Check backend logs for errors
  4. Try creating new test account


Problem: Admin dashboard won't load
──────────────────────────────────────────────────────────────────────────
Solution 1: Verify admin account exists and is approved
  mongosh "mongodb+srv://user:pass@cluster.mongodb.net/cardio_sentinel"
  db.users.findOne({ email: "admin@cardio.com" })
  Check: isApproved: true, role: "admin"

Solution 2: Verify JWT token received
  1. Open browser dev tools (F12)
  2. Go to Application > LocalStorage
  3. Check for "token" key
  4. If missing, re-login

Solution 3: Check backend logs
  Look for errors in backend console
  Common: "Insufficient permissions" means role is not "admin"


Problem: Real-time updates not working (WebSocket)
─────────────────────────────────────────────────────────────────────────
Solution 1: Verify backend is running
  Backend needed for WebSocket support

Solution 2: Check browser console for errors
  F12 > Console tab
  Look for socket.io connection errors

Solution 3: Verify correct API URL before URL in frontend .env
  VITE_API_BASE_URL must be correct server URL


Problem: HIPAA audit logs not showing
───────────────────────────────────────────────────────────────────────────
Solution 1: Verify audit logging is enabled
  Check backend console for audit entries

Solution 2: Check AuditLog collection exists
  mongosh "mongodb+srv://user:pass@cluster.mongodb.net/cardio_sentinel"
  db.auditlogs.find().limit(1)

Solution 3: Wait for data to load
  Audit logs are created asynchronously
  Wait 2-3 seconds before refreshing


═══════════════════════════════════════════════════════════════════════════════
SECTION 7: SUPPORT & DOCUMENTATION
═══════════════════════════════════════════════════════════════════════════════

Documentation Files Available:

Getting Started
  ├─ QUICKSTART_GUIDE.md               - Fast setup
  ├─ README.md                         - Project overview
  └─ DEPLOYMENT_STATUS_FINAL.md        - Current status

Healthcare Integration
  ├─ HIPAA_AUDIT_LOGGING_GUIDE.md      - HIPAA compliance
  ├─ ABDM_FHIR_API_GUIDE.md            - Healthcare standards
  └─ GOVERNMENT_CONTRACT_READY.md      - Compliance certification

Testing & Quality
  ├─ API_TESTING_GUIDE.md              - Test endpoints
  ├─ SYSTEM_TEST_REPORT.md             - Test results
  └─ FRONTEND_TESTING_GUIDE.md         - Frontend testing

Admin & Operations
  ├─ ADMIN_SETUP_GUIDE.md              - Admin account creation
  ├─ PRODUCTION_DEPLOYMENT_GUIDE.md    - Deployment procedures
  └─ DEPLOYMENT_CHECKLIST.md           - Pre-deployment checklist

Architecture & Design
  ├─ ARCHITECTURE_DIAGRAMS.md          - System architecture
  ├─ design.md                         - Design decisions
  └─ API_REFERENCE.md                  - API documentation


Getting Help:

1. Check Documentation
   All answers are in the guides above
   Search for your issue in DEPLOYMENT_STATUS_FINAL.md

2. Check Logs
   Backend: npm server console
   Frontend: Browser dev tools (F12)
   Database: MongoDB Atlas logs

3. Verify Configuration
   .env files have correct values
   Database connection working
   Ports not in use

4. Test Endpoints
   Use curl or Postman
   Test endpoint directly
   Check response status


═══════════════════════════════════════════════════════════════════════════════
QUICK REFERENCE: KEY PORTS & URLS
═══════════════════════════════════════════════════════════════════════════════

Development Environment
─────────────────────────
Backend API:        http://localhost:5000
  Health:           http://localhost:5000/api/health
  API Docs:         http://localhost:5000/api-docs

Frontend:           http://localhost:5174
  Login:            http://localhost:5174/login
  Admin:            http://localhost:5174/admin
  Doctor:           http://localhost:5174/doctor
  Patient:          http://localhost:5174/patient

Database:           MongoDB Atlas (Cloud)
  Dashboard:        https://cloud.mongodb.com

Redis (Optional):   localhost:6379


Production Environment
────────────────────────
API Domain:         https://api.cardio-sentinel.com
Frontend Domain:    https://cardio-sentinel.com
Database:           MongoDB Atlas (Production cluster)


═══════════════════════════════════════════════════════════════════════════════
TEST CREDENTIALS
═══════════════════════════════════════════════════════════════════════════════

Admin Account
  Email:    admin@cardio.com
  Password: admin@SecurePass123!
  Status:   Requires creation (see Section 3)

Compliance Officer
  Email:    compliance@cardio.com
  Password: compliance@SecurePass123!
  Status:   Requires creation (see Section 3)

Doctor Account
  Email:    doctor.test@cardio.com
  Password: doctor123
  Status:   Ready to use

Patient Account
  Email:    testpat[TIMESTAMP]@cardio.com
  Password: testpat123
  Status:   Created during testing


═══════════════════════════════════════════════════════════════════════════════
FINAL CHECKLIST
═══════════════════════════════════════════════════════════════════════════════

Before considering deployment complete, verify:

Setup
  □ Backend running on port 5000
  □ Frontend running on port 5174
  □ MongoDB connection established
  □ Environment variables configured

Accounts
  □ Admin account created and approved
  □ Compliance officer account created
  □ Doctor account approved
  □ Test patient account exists

Testing
  □ Health endpoint working
  □ Login successful with all roles
  □ Audit logs visible to admin
  □ FHIR export working
  □ Role-based access control enforced

Security
  □ Passwords changed from defaults
  □ JWT tokens issued correctly
  □ HTTPS ready (for production)
  □ Database secured

Documentation
  □ All guides reviewed
  □ Setup procedures documented
  □ Troubleshooting procedures available
  □ Support contacts identified


═══════════════════════════════════════════════════════════════════════════════
SUCCESS CRITERIA
═══════════════════════════════════════════════════════════════════════════════

✅ System is ready for use when:

1. Backend runs without errors
   curl http://localhost:5000/api/health returns 200

2. Frontend loads successfully
   http://localhost:5174 displays login page

3. Authentication works
   Can login with doctor.test@cardio.com / doctor123

4. Database connected
   Data persists across restarts

5. Admin features work
   Can create and approve users

6. Healthcare features work
   FHIR export and ABDM integration verified

7. No console errors
   Browser dev tools show no critical errors

8. Tests passing
   16+ tests passing in test suite


═══════════════════════════════════════════════════════════════════════════════
NEXT STEPS
═══════════════════════════════════════════════════════════════════════════════

1. Follow Sections 1-4 above to get system running and tested
2. Create admin accounts (Section 3)
3. Run all frontend tests (Section 4)
4. When ready for production, follow Section 5
5. Keep troubleshooting guide (Section 6) handy
6. Reference documentation (Section 7) as needed


═══════════════════════════════════════════════════════════════════════════════

For questions, refer to the specific documentation guides in your workspace.

ALL DOCUMENTATION FILES AVAILABLE AT:
/root/cardio-sentinel/[filename].md

Estimated total setup time: 2-4 hours
Estimated total testing time: 2-3 hours
Estimated deployment time: 3-4 hours

═══════════════════════════════════════════════════════════════════════════════
