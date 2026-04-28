╔════════════════════════════════════════════════════════════════════════════╗
║        QUICK ADMIN CREATION - MongoDB Direct Insertion Guide              ║
║                           (No Rate Limiting)                              ║
╚════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════
STEP 1: OPEN MONGODB ATLAS
═══════════════════════════════════════════════════════════════════════════════

1. Go to: https://cloud.mongodb.com
2. Sign in with your credentials
3. Select your cluster (the one connected to Cardio-Sentinel)
4. Click "Collections" button


═══════════════════════════════════════════════════════════════════════════════
STEP 2: NAVIGATE TO USERS COLLECTION
═══════════════════════════════════════════════════════════════════════════════

1. Look for: "cardio_sentinel" database
2. Look for: "users" collection within that database
3. Click on "users" to view documents


═══════════════════════════════════════════════════════════════════════════════
STEP 3: INSERT NEW ADMIN DOCUMENT
═══════════════════════════════════════════════════════════════════════════════

1. Click the green "+ INSERT DOCUMENT" button
2. Delete the default template (select all and delete)
3. Copy and paste THIS EXACT JSON:

{
  "name": "System Administrator",
  "email": "admin@cardio.com",
  "password": "$2a$10$zQME2U3FBrLpS1/nPPX0zuZmxHGGVVcKxJWMJvCU5yqmhWkfgTmFa",
  "phone": "+919876543200",
  "role": "admin",
  "isApproved": true,
  "profileCompleted": true,
  "createdAt": {
    "$date": "2026-03-22T00:00:00.000Z"
  },
  "updatedAt": {
    "$date": "2026-03-22T00:00:00.000Z"
  }
}

4. Click "Insert" button
5. Success! You should see: "Document inserted"


═══════════════════════════════════════════════════════════════════════════════
STEP 4: LOGIN WITH ADMIN CREDENTIALS
═══════════════════════════════════════════════════════════════════════════════

Now go to: http://localhost:5174/login

Login with:
  Email:    admin@cardio.com
  Password: admin@SecurePass123!

Expected: Admin dashboard loads immediately ✓


═══════════════════════════════════════════════════════════════════════════════
VERIFY IT WORKED
═══════════════════════════════════════════════════════════════════════════════

After logging in as admin, you should see:

✓ Admin Dashboard (/admin)
✓ "HIPAA Audit Logs" section
✓ "Doctor Management" section
✓ "Compliance Reports" section
✓ "User Statistics" section

If you see all these → Admin account successfully created! 🎉


═══════════════════════════════════════════════════════════════════════════════
TROUBLESHOOTING
═══════════════════════════════════════════════════════════════════════════════

Problem: "Document already exists" error
Solution: Check if admin@cardio.com already exists in the collection
  - Find and delete the old document
  - Then insert the new one

Problem: Login still fails after insertion
Solution 1: Refresh browser (Ctrl+Shift+R to clear cache)
Solution 2: Close browser and reopen
Solution 3: Clear localStorage in browser dev tools (F12)

Problem: Admin dashboard shows "Insufficient permissions"
Solution: Check the document you inserted
  - Verify: "role": "admin" (exactly as shown)
  - Verify: "isApproved": true
  - Verify: "profileCompleted": true


═══════════════════════════════════════════════════════════════════════════════
PASSWORD REFERENCE
═══════════════════════════════════════════════════════════════════════════════

The password hash provided is for: admin@SecurePass123!
(The hash is bcrypt encrypted and cannot be reversed)

If you want to verify or change the password later, you can:
1. Use the UI registration and approve in DB
2. Or update the hash value in MongoDB


═══════════════════════════════════════════════════════════════════════════════
NEXT STEPS AFTER ADMIN LOGIN
═══════════════════════════════════════════════════════════════════════════════

1. ✓ Admin account created
2. ✓ Logged in to admin dashboard
3. Next: Approve the doctor account
   - Click "Doctor Management"
   - Find "doctor.test@cardio.com"
   - Click "Approve"

4. Next: Test doctor login
   - Logout from admin
   - Login as: doctor.test@cardio.com / doctor123
   - Verify doctor dashboard loads


═══════════════════════════════════════════════════════════════════════════════
