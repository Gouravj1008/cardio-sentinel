╔════════════════════════════════════════════════════════════════════════════╗
║                  ADMIN DASHBOARD & APPROVAL GUIDE                         ║
║                    Doctor & User Account Management                        ║
╚════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════
ADMIN ACCOUNT CREDENTIALS
═══════════════════════════════════════════════════════════════════════════════

PRIMARY ADMIN ACCOUNT
─────────────────────────────────────────────────────────────────────────────
  Email:        admin@cardio.com
  Password:     admin@SecurePass123!
  Role:         Admin (Full system access)
  Dashboard:    http://localhost:5174/admin
  Status:       Ready to use (create if not exists)

COMPLIANCE OFFICER ACCOUNT
─────────────────────────────────────────────────────────────────────────────
  Email:        compliance@cardio.com
  Password:     compliance@SecurePass123!
  Role:         Compliance Officer (Audit access)
  Dashboard:    http://localhost:5174/compliance-reports
  Status:       Ready to use (create if not exists)


═══════════════════════════════════════════════════════════════════════════════
QUICK APPROVAL METHODS
═══════════════════════════════════════════════════════════════════════════════

METHOD 1: CLI Script (Fastest - 1 minute)
──────────────────────────────────────────────────────────────────────────

Step 1: Make sure you're in the backend directory
  cd backend

Step 2: Run the approval script
  node admin-approve-doctor.js doctor.test@cardio.com

Step 3: Verify
  Expected output:
    ✓ Doctor account approved successfully!
    Email:    doctor.test@cardio.com
    Name:     [Doctor name]
    Role:     doctor
    Approved: [timestamp]


List All Pending Doctors:
  node admin-approve-doctor.js --list

Output:
  📋 PENDING DOCTOR APPROVALS:
  
  1. Doctor Name
     Email:      doctor.test@cardio.com
     Phone:      +919876543210
     Registered: 3/22/2026


═══════════════════════════════════════════════════════════════════════════════
METHOD 2: Admin Dashboard (Web UI - 3 minutes)
──────────────────────────────────────────────────────────────────────────

Step 1: Create Admin Account (if not exists)
  Follow ADMIN_SETUP_GUIDE.md to create admin@cardio.com

Step 2: Login as Admin
  1. Open: http://localhost:5174/login
  2. Email:    admin@cardio.com
  3. Password: admin@SecurePass123!
  4. Click "Sign In"

Step 3: Navigate to Doctor Management
  1. You're now in /admin dashboard
  2. Look for "Doctor Management" or "Pending Approvals" section
  3. Find doctor.test@cardio.com in the pending list

Step 4: Approve Doctor
  1. Click the doctor record
  2. Click "Approve" button
  3. Optionally add approval notes
  4. Click "Confirm"

Step 5: Verify Approval
  Doctor is now approved and can login


═══════════════════════════════════════════════════════════════════════════════
METHOD 3: API Endpoint (Programmatic)
──────────────────────────────────────────────────────────────────────────

Step 1: Get Admin JWT Token
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "admin@cardio.com",
      "password": "admin@SecurePass123!"
    }'

  Response:
    {
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "user": { "email": "admin@cardio.com", "role": "admin" }
    }

  SAVE THE TOKEN - you'll need it in Step 2

Step 2: Approve Doctor via API
  curl -X POST http://localhost:5000/api/admin/approve-doctor \
    -H "Authorization: Bearer [YOUR_JWT_TOKEN]" \
    -H "Content-Type: application/json" \
    -d '{
      "doctorEmail": "doctor.test@cardio.com",
      "notes": "Approved by admin"
    }'

  Expected Response:
    {
      "message": "Doctor approved successfully",
      "doctor": {
        "email": "doctor.test@cardio.com",
        "isApproved": true,
        "approvedAt": "2026-03-22T..."
      }
    }


═══════════════════════════════════════════════════════════════════════════════
ADMIN DASHBOARD FEATURES
═══════════════════════════════════════════════════════════════════════════════

After Login as Admin (admin@cardio.com), you can:

Doctor Management
─────────────────────────────────────────────────────────────────────────────
  ✓ View all doctors (approved & pending)
  ✓ View doctor details (name, email, phone, specialty)
  ✓ Approve pending doctors
  ✓ Reject doctors with reason
  ✓ Deactivate approved doctors
  ✓ View approval history


HIPAA Audit Logs
─────────────────────────────────────────────────────────────────────────────
  ✓ View all system activities
  ✓ Filter by user, action, date range
  ✓ Search audit entries
  ✓ Verify log integrity
  ✓ Export audit logs


Compliance Reports
─────────────────────────────────────────────────────────────────────────────
  ✓ HIPAA compliance dashboard
  ✓ Access control violations
  ✓ Unauthorized login attempts
  ✓ Compliance score
  ✓ Generate PDF reports
  ✓ Export to CSV


User Management
─────────────────────────────────────────────────────────────────────────────
  ✓ View all users by role
  ✓ View user details
  ✓ Deactivate users
  ✓ Manage permissions
  ✓ View login history


System Statistics
─────────────────────────────────────────────────────────────────────────────
  ✓ Total users count
  ✓ Active sessions
  ✓ Login attempts
  ✓ API request volume
  ✓ System uptime


═══════════════════════════════════════════════════════════════════════════════
STEP-BY-STEP: COMPLETE APPROVAL WORKFLOW
═══════════════════════════════════════════════════════════════════════════════

Using the Admin Dashboard (Recommended)

PART 1: CREATE ADMIN ACCOUNT (if not exists) - 5 minutes
──────────────────────────────────────────────────────────────────────────

1. Go to frontend: http://localhost:5174
2. Click "Sign Up"
3. Fill in the form:
   Name:                System Administrator
   Email:               admin@cardio.com
   Password:            admin@SecurePass123!
   Confirm Password:    admin@SecurePass123!
   Phone:               +919876543200
   Role:                Admin
4. Click "Register"
5. MongoDB approval (one-time):
   Go to https://cloud.mongodb.com
   Find admin@cardio.com in users collection
   Edit: isApproved = true, profileCompleted = true
   Save


PART 2: LOGIN AS ADMIN - 2 minutes
──────────────────────────────────────────────────────────────────────────

1. Go to http://localhost:5174/login
2. Email:    admin@cardio.com
3. Password: admin@SecurePass123!
4. Click "Sign In"
5. You're now in the Admin Dashboard (/admin)


PART 3: APPROVE DOCTOR - 1 minute
──────────────────────────────────────────────────────────────────────────

1. In admin dashboard, click "Doctor Management"
2. Find "doctor.test@cardio.com" in pending list
3. Click the doctor record
4. Click "Approve" button
5. Add optional notes if desired
6. Click "Confirm Approval"
7. Doctor is now approved ✓


PART 4: VERIFY APPROVAL - 2 minutes
──────────────────────────────────────────────────────────────────────────

1. Logout from admin dashboard
2. Go to http://localhost:5174/login
3. Email:    doctor.test@cardio.com
4. Password: doctor123
5. Click "Sign In"
6. Expected: Logged in successfully to doctor dashboard
7. Navigate to /doctor
8. You should see "Patient Management" page


═══════════════════════════════════════════════════════════════════════════════
TROUBLESHOOTING ADMIN ACCESS
═══════════════════════════════════════════════════════════════════════════════

Problem: Admin account doesn't exist
──────────────────────────────────────────────────────────────────────────
Solution: Create admin account via frontend signup (see PART 1 above)

Problem: Admin login fails (401 error)
──────────────────────────────────────────────────────────────────────────
Solution 1: Verify password: admin@SecurePass123!
Solution 2: Verify isApproved: true in MongoDB
Solution 3: Verify role: "admin" in MongoDB
Solution 4: Check backend is running: curl http://localhost:5000/api/health

Problem: Admin dashboard shows "Insufficient permissions"
──────────────────────────────────────────────────────────────────────────
Solution: Verify user role is "admin" not "doctor" or "patient"
  mongosh "mongodb+srv://user:pass@cluster.mongodb.net/cardio_sentinel"
  db.users.findOne({ email: "admin@cardio.com" })
  Check: "role": "admin"

Problem: Doctor Management page not loading
──────────────────────────────────────────────────────────────────────────
Solution 1: Refresh the page
Solution 2: Check backend logs for errors
Solution 3: Verify users collection has doctors: 
  db.users.find({ role: "doctor" })

Problem: Approval button doesn't respond
──────────────────────────────────────────────────────────────────────────
Solution 1: Check browser console (F12) for JavaScript errors
Solution 2: Verify backend API is responding:
  curl http://localhost:5000/api/admin/approve-doctor
Solution 3: Try the CLI script method instead


═══════════════════════════════════════════════════════════════════════════════
ADMIN FEATURES CHECKLIST
═══════════════════════════════════════════════════════════════════════════════

After approval is complete, test these admin features:

Dashboard Access
  □ Login as admin@cardio.com successful
  □ Redirected to /admin dashboard
  □ Dashboard loads without errors
  □ Navigation menu visible

Doctor Management
  □ See "Doctor Management" section
  □ View pending doctors list
  □ doctor.test@cardio.com shown as pending (before approval)
  □ doctor.test@cardio.com shown as approved (after approval)
  □ Approve button works
  □ Reject button works (with reason)
  □ View doctor details modal

Audit Logs
  □ Click "Audit Logs"
  □ See entries for:
    - Admin registration
    - Admin login
    - Doctor approval action
    - Doctor account updates

Compliance Reports
  □ Click "Compliance Reports"
  □ See HIPAA metrics
  □ Generate PDF export
  □ Export to CSV
  □ Email report functionality

User Statistics
  □ Click "Statistics"
  □ See total users count
  □ See active sessions
  □ See login attempts
  □ See system load


═══════════════════════════════════════════════════════════════════════════════
FINAL VERIFICATION
═══════════════════════════════════════════════════════════════════════════════

✅ SUCCESS CHECKLIST:

After completing approval, verify:

□ Admin account created and approved in MongoDB
□ Admin can login at http://localhost:5174/login
□ Admin dashboard loads at /admin
□ Doctor record shows in Doctor Management
□ Doctor can be approved via admin dashboard
□ Doctor.test@cardio.com is marked as approved
□ Doctor can now login at /login
□ Doctor is redirected to /doctor dashboard
□ Audit log shows approval action
□ Compliance report updated


═══════════════════════════════════════════════════════════════════════════════
NEXT STEPS AFTER APPROVAL
═══════════════════════════════════════════════════════════════════════════════

1. Doctor Account Verified ✓
2. Create Patients (as doctor)
   - Doctor dashboard > "Add Patient" button
   - Fill in patient details
   - Save patient

3. Test Patient Features
   - Create test patient account
   - Login as patient
   - View health records
   - Test FHIR export

4. Test HIPAA Audit Logs (as admin)
   - Admin dashboard > Audit Logs
   - Verify all actions are logged
   - Verify immutability (cannot edit logs)

5. Continue with remaining tests from FRONTEND_TESTING_GUIDE.md


═══════════════════════════════════════════════════════════════════════════════
