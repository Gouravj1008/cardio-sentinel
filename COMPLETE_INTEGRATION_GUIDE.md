# Complete Integration Guide: Watch → Mobile → Backend → Dashboard

## 🎯 Overview

This guide shows how all components work together with **zero complex integration**.

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        YOUR WATCH/BAND                              │
│              (Apple Watch, Samsung Galaxy, Fitbit, etc.)            │
└─────────────────────────┬───────────────────────────────────────────┘
                          │ Bluetooth / Health API
                          ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      MOBILE APP (This App)                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  1. Login with credentials                                   │  │
│  │  2. Configure device (Apple Watch, Samsung, etc.)           │  │
│  │  3. Automatically reads data from watch                      │  │
│  │  4. Sends to backend every 5-60 seconds                      │  │
│  │                                                               │  │
│  │  Built-in: Simulator (no real watch needed for testing)      │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────────────┘
                          │ HTTP POST to /api/wearable/ingest
                          │ {patientId, deviceId, heartRate, ...}
                          ↓
┌─────────────────────────────────────────────────────────────────────┐
│                   BACKEND API (:5000)                               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  1. Receives data from mobile app                             │  │
│  │  2. Validates & saves to MongoDB                              │  │
│  │  3. Calculates risk metrics                                   │  │
│  │  4. Broadcasts via Socket.IO to connected clients            │  │
│  │                                                               │  │
│  │  Room-based subscriptions:                                    │  │
│  │    - patient-123 (patient's own dashboard)                    │  │
│  │    - device-watch-001 (device-specific monitoring)            │  │
│  │    - global (doctor dashboards, alerts)                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────┬──────────────────────────────────┬──────────────────────────┘
          │ Socket.IO (Real-time)             │ HTTP REST
          ↓                                    ↓
    ┌─────────────┐                   ┌──────────────┐
    │ Patient's   │                   │ Doctor's     │
    │ Dashboard   │                   │ Dashboard    │
    │ (Real-time) │                   │ (Real-time)  │
    └─────────────┘                   └──────────────┘
```

---

## 🚀 Step-by-Step Integration

### Step 1: Setup Backend (5 minutes)

```bash
# Terminal 1
cd backend
npm install
npm start

# Should see:
# ✓ MongoDB connected
# ✓ Redis connected
# ✓ Server running on :5000
```

### Step 2: Run Mobile App (2 minutes)

```bash
# Terminal 2
npm install -g expo-cli
expo init CardioSentinel
cd CardioSentinel
npm install
# Copy mobile-bridge-app.jsx to App.js
expo start

# Scan QR code with phone
```

### Step 3: Login & Configure

**In mobile app:**
1. Login (demo: patient@example.com / password123)
2. Select device (Apple Watch, Samsung, etc.)
3. Set update frequency (5s default)
4. Tap "Start Monitoring"

### Step 4: See Real-Time Data

**Mobile app shows:**
- Heart rate, oxygen, BP, stress score
- Updates every 5-60 seconds
- Error count if any

**Backend logs show:**
```
[Wearable] Data ingested - Patient: patient-123, Device: watch-001, Risk: 15
[Wearable] Data ingested - Patient: patient-123, Device: watch-001, Risk: 18
```

### Step 5: View in Dashboard (Optional)

Open `http://localhost:3000` to see real-time updates via WebSocket.

---

## 💻 Integration Methods

### Method 1: Mobile App → Backend (What We Set Up)

**Simplest. No additional setup.**

```
Mobile App (this app)
  ↓ HTTP POST
Backend (:5000/api/wearable/ingest)
  ↓
Database (MongoDB)
  ↓
Real-time Dashboard
```

### Method 2: Direct Watch → Backend

**Skips mobile app, goes directly from watch to backend.**

Requires watch to have internet (rare). Not recommended.

### Method 3: Watch → Health Platform → Mobile → Backend

**Most complete.**

```
Apple Watch
  ↓ HealthKit
iOS Health App
  ↓ (via mobile app)
Backend
```

```
Samsung Galaxy Watch
  ↓ Health Connect
Android Health App
  ↓ (via mobile app)
Backend
```

---

## 📱 Watch Data Collection Methods

### Option A: Automatic (HealthKit/Health Connect)

```javascript
// In mobile app, add permission handling:
if (Platform.OS === 'ios') {
  // Request HealthKit permission
  const { heartRate } = await HealthKit.getMostRecentHeartRate();
} else {
  // Request Health Connect in Android 13+
  const { heartRate } = await HealthConnect.getData('heartRate');
}
```

### Option B: Built-in Simulator

**App generates realistic data automatically** - no watch needed!

```javascript
// Already in mobile-bridge-app.jsx
const watchData = {
  heartRate: Math.round(70 + (Math.random() - 0.5) * 20),
  oxygenLevel: 97,
  // ... more fields
};
```

### Option C: Manual Entry

User enters vitals manually:

```javascript
// Add manual input form to app
const [manualHeartRate, setManualHeartRate] = useState('');
// Then send as watchData
```

### Option D: Third-Party API

```javascript
// Fitbit example
const fitbitData = await axios.get(
  'https://api.fitbit.com/1/user/-/activities/date/today.json',
  { headers: { Authorization: `Bearer ${fitbitToken}` } }
);
```

---

## 🔄 Data Flow Example

### 1. Watch generates data
```json
{
  "heartRate": 75,
  "oxygenLevel": 96.5,
  "bloodPressure": {"systolic": 118, "diastolic": 78},
  "stressScore": 35,
  "steps": 245,
  "skinTemp": 36.4
}
```

### 2. Mobile app sends to backend
```javascript
// HTTP POST /api/wearable/ingest
{
  "patientId": "patient-123",
  "deviceId": "watch-001",
  "deviceType": "smartwatch",
  "data": { /* above */ }
}
```

### 3. Backend processes
```javascript
// Saves to DB
const wearable = new WearableData({
  patient: patientId,
  deviceId,
  data,
  timestamp: new Date()
});
await wearable.save();

// Calculates risk
const riskIndex = calculateRiskIndex(data); // Returns 0-100

// Broadcasts via Socket.IO
io.to(`patient-${patientId}`).emit('wearable_update', {
  timestamp: new Date().toISOString(),
  data,
  riskIndex
});
```

### 4. Dashboard receives
```javascript
socket.on('wearable_update', (data) => {
  // Update UI with new vitals
  setHeartRate(data.data.heartRate);
  setRiskLevel(data.riskIndex);
});
```

---

## 🔐 Security Flow

### Authentication
```
1. Mobile: Login with email/password
   ↓
2. Backend: Validate, return JWT token
   ↓
3. Mobile: Store token in SecureStore
   ↓
4. Mobile: Send token in Authorization header for future requests
```

### Data Protection
```
Token → Stored securely in device
Control → Only patient + assigned doctors can access
Channel → HTTPS (in production)
```

---

## ⚙️ Configuration Checklist

### Backend `.env`
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cardio
SOCKET_IO_CORS_ORIGIN=http://localhost:19000,http://localhost:3000
```

### Mobile `.env`
```
REACT_APP_API_URL=http://192.168.1.100:5000/api
# (Use your backend's IP address)
```

### Watch Configuration (In Mobile App)
```
Patient ID: patient-123
Device Type: Apple Watch / Samsung / Fitbit
Device ID: watch-001
Update Frequency: 5s
```

---

## 🧪 Testing Without Physical Watch

### The mobile app has a **built-in simulator**

Just run the app and it automatically:
1. Generates realistic vital signs
2. Sends them to backend
3. Receives real-time updates

**No physical watch needed for testing!**

### Test Flow
```
Mobile App starts
  ↓
No real watch? No problem!
  ↓
Simulator generates data
  ↓
Sends to backend
  ↓
See updates in app
```

---

## 📊 What Gets Stored

### MongoDB Collections

**WearableData** (all vital readings)
```javascript
{
  _id: ObjectId,
  patient: ObjectId,        // Link to patient
  deviceId: 'watch-001',
  timestamp: Date,
  data: {
    heartRate: 75,
    oxygenLevel: 96.5,
    bloodPressure: {...},
    stressScore: 35,
    steps: 1234,
    skinTemp: 36.4
  },
  synced: true
}
```

**User** (patient info)
```javascript
{
  _id: ObjectId,
  email: 'patient@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'patient',
  age: 45,
  sex: 'M'
}
```

**Device** (watch info)
```javascript
{
  _id: ObjectId,
  patient: ObjectId,
  deviceId: 'watch-001',
  deviceType: 'smartwatch',
  deviceName: 'Apple Watch Series 7',
  lastSync: Date,
  status: 'active'
}
```

---

## 🚨 Alerts & Anomalies

### Automatic Alert Generation

```javascript
// Backend detects anomalies
if (heartRate > 120) {
  const alert = new Alert({
    patient: patientId,
    type: 'high_heart_rate',
    severity: 'medium',
    value: heartRate,
    threshold: 120
  });
  await alert.save();
  
  // Broadcast to doctors
  io.emit('alert_generated', alert);
}
```

### App Shows Alerts
```
Mobile app status bar shows:
  ○ Normal
  ⚠ Warning
  ⛔️ Critical
```

---

## 📈 Real-Time Metrics

Backend calculates automatically:

| Metric | Range | Meaning |
|--------|-------|---------|
| Risk Index | 0-100 | Overall health risk |
| Anomaly Rate | 0-100% | How abnormal current data is |
| Heart Rate Variability | - | Statistical spread |
| Trend | ↑ ↓ → | Direction of vitals |

---

## 🔗 API Endpoints (All Automatic)

Used by mobile app (you don't need to call manually):

```
POST /api/auth/login                    ← Login
POST /api/wearable/ingest               ← Send watch data
GET  /api/wearable/latest/:patientId    ← Get current vitals
GET  /api/wearable/history/:patientId   ← Get past data
GET  /api/health/summary/:patientId     ← Daily summary
GET  /api/alerts                         ← Get alerts
```

---

## 🎯 Common Tasks

### Task: Change Watch Device
Solution: Go to config screen in app, select new device

### Task: View Last 7 Days Data
Solution: Tap "History" in dashboard (auto-fetches)

### Task: Share Data with Doctor
Solution: App has "Share" button (if feature enabled)

### Task: Export As PDF
Solution: Backend can generate report automatically

### Task: Set Alert Thresholds
Solution: Dashboard settings → Alert Configuration

---

## 🐛 Debugging

### Check Mobile App Events
```javascript
// In browser console (Expo web)
const socket = io('http://localhost:5000');
socket.on('wearable_update', console.log);
socket.on('telemetry_update', console.log);
```

### Check Backend Logs
```bash
cd backend
npm start  # Watch logs
# Should show received data
```

### Check Database
```bash
mongosh
use cardio_sentinel
db.weardatas.find().limit(5)  # See latest records
```

### Check Network Traffic
```bash
# Copy mobile app's network logs
# In mobile browser console
```

---

## 🚀 Advanced Setup

### Multiple Watches
```javascript
// Mobile app supports multiple watches
// Just register multiple devices:
1. Login
2. Go to Settings → Add Device
3. Select new watch
4. Configure
5. Done - alternates between watches
```

### Doctor's View
```javascript
// Doctor sees all assigned patients
// Real-time updates via WebSocket
// Can see alerts and trends
```

### Offline Mode
```javascript
// Mobile app queues data when offline
// Auto-syncs when connection returns
// No data loss
```

---

## 📞 Support & Docs

- **Quick Start without errors**: `MOBILE_QUICK_SETUP.md`
- **Detailed Mobile Setup**: `MOBILE_APP_SETUP.md`
- **Backend WebSocket Setup**: `WEBSOCKET_QUICKSTART.md`
- **Full Architecture**: `WEBSOCKET_WATCH_INTEGRATION.md`
- **API Reference**: `API_REFERENCE.md`

---

## ✅ Success Criteria

You know it's working when:

- ✅ Mobile app shows "● Live" status
- ✅ Heart rate updates every few seconds
- ✅ Backend logs show "Data ingested"
- ✅ Total sent count increases
- ✅ No error messages
- ✅ Dashboard shows real-time updates (optional)

---

## 🎓 What You Just Built

1. **Mobile Bridge** - Connects watch to internet
2. **Real-Time Sync** - Data flows instantly
3. **Data Processing** - Risk calculations happen
4. **Live Dashboard** - See updates in real-time
5. **Doctor Integration** - Multiple users, alerts

**All with 0 complex integration.** ✓

---

**Status**: Fully Integrated  
**Complexity**: ⭐ (Super Simple)  
**Time Start to Live**: 10 minutes  
**No Advanced Setup Needed**: ✓
