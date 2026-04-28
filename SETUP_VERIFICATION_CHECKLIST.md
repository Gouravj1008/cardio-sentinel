# ✅ Setup Verification Checklist

Use this checklist after following the setup guides to verify everything works.

---

## 🔍 Pre-Setup Verification

### System Requirements
- [ ] Node.js installed (version 16+)
- [ ] npm installed
- [ ] MongoDB accessible
- [ ] 500MB free disk space
- [ ] Network connection (required)

**Check:**
```bash
node --version  # Should show v16 or higher
npm --version   # Should show 8 or higher
```

---

## 📱 Mobile App Setup Verification

### Installation
- [ ] Expo CLI installed: `expo --version`
- [ ] Project created: `expo init CardioSentinel`
- [ ] Dependencies installed: `npm install`
- [ ] Mobile app file copied: `mobile-bridge-app.jsx` → `App.js`

**Check:**
```bash
expo --version  # Should show version, not error
ls -la App.js   # File should exist
npm ls          # Should list axios, expo-secure-store, etc.
```

### Configuration
- [ ] Backend URL set in `App.js`
- [ ] API_URL matches your backend: `http://localhost:5000/api`
- [ ] (Optional) Environment file created: `cp mobile-app-env-template .env`

**Check:**
```bash
grep -n "API_URL" App.js  # Should show your URL
```

### Run Mobile App
- [ ] Expo development server starts: `expo start`
- [ ] QR code displays in terminal
- [ ] No errors in terminal output

**Check:**
```bash
expo start  # Should display QR code without errors
```

### Mobile App Runs
- [ ] Scanning QR code with Expo Go opens app
- [ ] App loads without crashes
- [ ] Login screen displays correctly
- [ ] All text readable, no layout issues

---

## 🖥️ Backend Verification

### Installation
- [ ] Backend directory exists
- [ ] Dependencies installed: `cd backend && npm install`
- [ ] MongoDB connection working
- [ ] Environment variables configured

**Check:**
```bash
cd backend
npm ls | grep -E "express|socket.io|mongoose"
# Should list these packages
```

### Configuration
- [ ] `.env` file exists in backend folder
- [ ] MongoDB URI configured
- [ ] PORT variable set (default 5000)
- [ ] All required env vars present

**Check:**
```bash
cat backend/.env | grep MONGODB_URI
cat backend/.env | grep PORT
# Both should show values
```

### Backend Starts
- [ ] No startup errors: `npm start`
- [ ] Logs show "Server running on :5000"
- [ ] "MongoDB connected" message appears
- [ ] Socket.IO initialized successfully

**Check:**
```bash
npm start 2>&1 | grep -E "running|connected|listening"
# Should show positive messages
```

### Health Check
- [ ] Health endpoint responds: `curl http://localhost:5000/health`
- [ ] Returns: `{"success":true,"message":"Cardio Sentinel API is running"}`
- [ ] HTTP status 200

**Check:**
```bash
curl http://localhost:5000/health
# JSON response indicates success
```

---

## 🔐 Authentication Verification

### Demo Account
- [ ] Demo account exists in database
- [ ] Email: `patient@example.com`
- [ ] Password: `password123` (hashed)

**Check:**
```bash
# Terminal with MongoDB
mongosh
use cardio_sentinel
db.users.findOne({email: "patient@example.com"})
# Should return user object
```

### Login Functionality
- [ ] Mobile app login screen displays
- [ ] Enter demo credentials
- [ ] Click "Login" button

**Expected:**
- [ ] No error message
- [ ] App moves to configuration screen
- [ ] User ID displayed or stored

---

## 📊 Data Ingestion Verification

### Test Data Ingestion (Option A: Using simulator)

```bash
# Terminal 3
cd backend
node scripts/watchSimulator.js patient-123 watch-001 5000
```

**Expected:**
```
═══════════════════════════════════════════════════════════════
  Cardio Sentinel - Watch/Wearable Device Simulator
═══════════════════════════════════════════════════════════════
API Server: http://localhost:5000
Patient ID: patient-123
Device ID: watch-001
Update Interval: 5000ms
▶ Simulator starting...

[12:34:56] ✓ Data sent (1)
[12:35:01] ✓ Data sent (2)
```

- [ ] Simulator starts without errors
- [ ] Data being sent (check count increasing)
- [ ] No error messages

### Test Data Ingestion (Option B: Using mobile app)

1. Open mobile app
2. Login with demo account
3. Configure device (Apple Watch) + Patient ID
4. Click "Start Monitoring"

**Expected:**
- [ ] "● Live" status shows
- [ ] Heart rate updates every 5 seconds
- [ ] "Total Sent" counter increases
- [ ] No error messages in "Errors" field

### Verify Data in Backend Logs

```bash
# Terminal with backend running
# Should see logs like:
[Wearable] Data ingested - Patient: patient-123, Device: watch-001, Risk: 15
[Wearable] Data ingested - Patient: patient-123, Device: watch-001, Risk: 18
```

- [ ] Logs show "Data ingested" messages
- [ ] Patient ID matches your test patient
- [ ] Risk values calculated (0-100)

### Verify Data in Database

```bash
mongosh
use cardio_sentinel
db.weardatas.findOne({patient: ObjectId("...")}, {sort: {timestamp: -1}})
# Should return latest record
```

- [ ] Records exist in database
- [ ] Timestamp is recent (within last minute)
- [ ] All data fields present (heartRate, oxygenLevel, etc.)

---

## 🌐 Real-Time Updates Verification (Optional)

### Check Socket.IO Connection

```bash
# Terminal 4
# Test with Expo web (if running)
# Open browser console
# Type:
const socket = io('http://localhost:5000');
socket.on('connect', () => console.log('Connected!'));
socket.on('wearable_update', (data) => console.log('Update:', data));

# Subscribe to patient
socket.emit('subscribe:patient', 'patient-123');
```

**Expected:**
- [ ] "Connected!" message appears in console
- [ ] Incoming data logged when updates arrive
- [ ] No connection errors

### Check Backend Socket.IO Logs

```bash
# Terminal with backend running
# Should see:
Client connected to Neural Telemetry Stream: xxxxx
[Socket xxxxx] subscribed to patient: patient-123
```

- [ ] Connection logs appear
- [ ] Subscription logs show your patient ID

---

## 🔄 Full Integration Test

### Scenario: E2E Data Flow

```
1. Start backend
2. Start mobile app
3. Login with demo account
4. Configure as Apple Watch
5. Click "Start Monitoring"
6. Verify:
   ○ Heart rate shows
   ○ Oxygen shows
   ○ BP shows
   ○ Total sent increasing
   ○ No errors
```

**Checklist:**
- [ ] Step 1 complete - Backend running
- [ ] Step 2 complete - App running & loads
- [ ] Step 3 complete - Logged in successfully
- [ ] Step 4 complete - Device selected & configured
- [ ] Step 5 complete - Monitoring started
- [ ] Step 6a - Heart rate displays & updates
- [ ] Step 6b - Oxygen level displays & updates
- [ ] Step 6c - Blood pressure displays & updates
- [ ] Step 6d - Counter increasing (sent 1, 2, 3...)
- [ ] Step 6e - Error count is 0

---

## 🚀 Advanced Verification

### Database Indexing

```bash
mongosh
use cardio_sentinel
db.weardatas.getIndexes()
# Should show indexes on: patient, timestamp, deviceId
```

- [ ] Indexes exist (for performance)
- [ ] Query times reasonable (< 100ms)

### Redis Connection

```bash
redis-cli ping
# Should return PONG
```

- [ ] Redis accessible
- [ ] Cache working

### API Response Times

```bash
# Terminal
time curl http://localhost:5000/api/wearable/latest/patient-123 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should complete in < 500ms
```

- [ ] Response time < 500ms
- [ ] Returns valid JSON
- [ ] Status code 200

---

## 🐛 Troubleshooting Verification

### If Backend Won't Start
- [ ] Check port 5000 is not in use: `lsof -i :5000`
- [ ] Check MongoDB connection: `mongosh --eval "db.adminCommand('ping')"`
- [ ] Check env variables loaded: `cat backend/.env`

### If Mobile App Won't Connect
- [ ] Check API_URL in App.js
- [ ] Check backend is running: `curl http://localhost:5000/health`
- [ ] Check network (WiFi, not mobile data for localhost)
- [ ] Check firewall allowing 5000

### If No Data Appearing
- [ ] Check simulator/mobile sending: See sender logs
- [ ] Check backend receiving: See backend logs
- [ ] Check database: Query MongoDB directly
- [ ] Check timestamp: Data might be very recent

### If Mobile App Crashes
- [ ] Check console for errors: `expo start` should show them
- [ ] Check network: ensure connectivity
- [ ] Clear cache: `expo start --reset-cache`
- [ ] Check token: Login again

---

## ✅ Final Verification Summary

Print this and check off as you verify:

```
SYSTEM READY WHEN ALL CHECKED:

Backend & Database:
  ☐ Node.js running
  ☐ MongoDB accessible
  ☐ Backend starts on :5000
  ☐ Health check returns 200
  ☐ Demo user exists

Mobile App:
  ☐ Expo CLI installed
  ☐ App.js exists with code
  ☐ Dependencies installed
  ☐ Expo server starts
  ☐ QR code opens in app

Data Flow:
  ☐ Can login with demo account
  ☐ Can configure watch
  ☐ Can see "● Live" status
  ☐ Can see heart rate updates
  ☐ Total sent count increases
  ☐ No error messages

Database:
  ☐ Records in weardatas collection
  ☐ Recent timestamps
  ☐ All fields present

Performance:
  ☐ Updates < 1 second latency
  ☐ No connection errors
  ☐ Mobile responsive (no lag)
  ☐ Backend stable (no crashes)

RESULT: ✅ READY FOR USE
```

---

## 📋 Quick Start Checklist (Fast Path)

If you just want to verify the 5-minute setup works:

```bash
# Terminal 1: Backend
cd backend && npm start
# Wait for "Server running on :5000"
☐

# Terminal 2: Mobile app
npm install -g expo-cli
expo init CardioSentinel && cd CardioSentinel && npm install
cp mobile-bridge-app.jsx App.js
expo start
# Scan QR code
☐

# Mobile App:
☐ Login: patient@example.com / password123
☐ Device: Apple Watch
☐ Click Start Monitoring
☐ See "● Live" status
☐ See heart rate updating

SUCCESS! ✅
```

---

## 📞 Need Help?

If something fails, check:

1. **Mobile app won't start**: `expo start --reset-cache`
2. **Backend crashes**: Check `npm install` completed
3. **Can't login**: Verify demo user exists in MongoDB
4. **No data received**: Check `node scripts/watchSimulator.js` running
5. **Network error**: Verify API_URL matches backend

See detailed guides:
- `MOBILE_QUICK_SETUP.md` - Mobile troubleshooting
- `WEBSOCKET_QUICKSTART.md` - Backend troubleshooting
- `COMPLETE_INTEGRATION_GUIDE.md` - Full system troubleshooting

---

**Version**: 1.0  
**Last Updated**: March 21, 2026  
**Status**: ✅ Complete and tested
