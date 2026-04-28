# 🌐 Architecture & Data Flow Diagrams

## System Architecture

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                        EXTERNAL DEVICES                           ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                                    ┃
┃  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            ┃
┃  │ Apple Watch  │  │ Samsung      │  │ Fitbit/      │            ┃
┃  │              │  │ Galaxy Watch │  │ Garmin       │            ┃
┃  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            ┃
┃         │ Bluetooth        │ Bluetooth        │ Bluetooth         ┃
┃         ↓                  ↓                  ↓                   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
          │                   │                   │
          └───────────────────┴───────────────────┘
                              │
                              │ Health APIs:
                              │ - HealthKit (iOS)
                              │ - Health Connect (Android)
                              │ - Proprietary APIs
                              ↓
          ┌─────────────────────────────────────────┐
          │    📱 MOBILE APP (This App)              │
          │  ┌─────────────────────────────────────┐ │
          │  │ Screens:                             │ │
          │  │ 1. Login                             │ │
          │  │ 2. Configure Device                  │ │
          │  │ 3. Live Monitoring                   │ │
          │  │                                      │ │
          │  │ Features:                            │ │
          │  │ ✓ Read from watch/health app         │ │
          │  │ ✓ Send to backend                    │ │
          │  │ ✓ Receive real-time updates          │ │
          │  │ ✓ Built-in simulator (testing)       │ │
          │  │ ✓ Offline data queue                 │ │
          │  │ ✓ Secure token storage               │ │
          │  └─────────────────────────────────────┘ │
          │                                           │
          │  Dependencies:                            │
          │  • Expo / React Native                    │
          │  • Axios (HTTP)                          │
          │  • SecureStore (encryption)              │
          │  • AsyncStorage (cache)                  │
          └─────────────────────────────────────────┘
                              │
                              │ HTTP POST
                              │ /api/wearable/ingest
                              │ {patientId, deviceId,
                              │  heartRate, O2, BP, ...}
                              ↓
        ┌──────────────────────────────────────────────┐
        │         ⚙️ BACKEND API (:5000)                │
        │  ┌───────────────────────────────────────┐   │
        │  │ Routes:                                │   │
        │  │ • /auth/login                          │   │
        │  │ • /wearable/ingest (receives data)    │   │
        │  │ • /wearable/latest (get current)      │   │
        │  │ • /wearable/history (get past)        │   │
        │  │ • /health/summary                      │   │
        │  │ • /alerts                              │   │
        │  │ • /devices                             │   │
        │  └───────────────────────────────────────┘   │
        │                                               │
        │  Processing:                                  │
        │  1. Validate request & user                   │
        │  2. Save to MongoDB                           │
        │  3. Calculate risk metrics                    │
        │  4. Emit via Socket.IO                        │
        │     - to(`patient-${id}`)                     │
        │     - to(`device-${deviceId}`)                │
        │     - emit('global_wearable_update')          │
        │                                               │
        │  Dependencies:                                │
        │  • Express (web framework)                    │
        │  • MongoDB (database)                         │
        │  • Socket.IO (real-time)                      │
        │  • Redis (caching)                            │
        └──────────────────────────────────────────────┘
                │                     │
                │ Save               │ Socket.IO
                ↓                     ↓
    ┌──────────────────┐    ┌──────────────────────────────┐
    │ 📀 MongoDB        │    │ Real-Time Update Rooms       │
    │                  │    │ • patient-123               │
    │ Collections:     │    │ • device-watch-001          │
    │ • Users          │    │ • global                    │
    │ • WearableData   │    │                              │
    │ • Alerts         │    │ Events:                      │
    │ • Devices        │    │ • wearable_update            │
    │ • HealthRecords  │    │ • telemetry_update           │
    │ • DoctorPatient  │    │ • device_telemetry           │
    │ • Reports        │    │ • global_wearable_update     │
    └──────────────────┘    │ • alert_generated            │
                            └──────────────────────────────┘
                                      │
                    ┌─────────────────┴──────────────────┐
                    ↓                                      ↓
        ┌───────────────────────┐        ┌────────────────────────┐
        │  👤 Patient Dashboard  │        │  👨‍⚕️ Doctor Dashboard    │
        │  (React Frontend)      │        │  (React Frontend)      │
        │                        │        │                        │
        │  Displays:             │        │  Displays:             │
        │  • My vitals           │        │  • All my patients     │
        │  • Heart rate          │        │  • Real-time vitals    │
        │  • Oxygen              │        │  • Alerts              │
        │  • BP                  │        │  • Trends              │
        │  • Updates in real-time│        │  • Reports             │
        │  • 7-day history       │        │  • Share with colleagues│
        │                        │        │                        │
        │  Receives via:         │        │  Receives via:         │
        │  • Socket.IO           │        │  • Socket.IO           │
        │  • REST API            │        │  • REST API            │
        └───────────────────────┘        └────────────────────────┘
```

---

## Data Flow Sequence

```
Timeline: Watch Data Journey
═══════════════════════════════════════════════════════════════════

T=0ms    Apple Watch (or simulator)
         ├─ Reads heart rate: 75 bpm
         ├─ Reads oxygen: 96.5%
         ├─ Reads BP: 118/78
         └─ Stores locally

T=5s     Mobile App
         ├─ Fetches data from Health API
         ├─ Builds payload:
         │  {
         │    "patientId": "patient-123",
         │    "deviceId": "watch-001",
         │    "data": { heartRate: 75, ... }
         │  }
         └─ Sends HTTP POST to backend

         Network [====]

T=5.1s   Backend (:5000)
         ├─ Receives POST /api/wearable/ingest
         ├─ Validates:
         │  ✓ User authenticated (via JWT)
         │  ✓ Patient exists
         │  ✓ Data format valid
         └─ Processes:
            ├─ Saves to MongoDB
            ├─ calculateRiskIndex(data) → 15
            ├─ calculateAnomalyRate(data) → 5%
            └─ Emits Socket.IO:
               ├─ to(`patient-123`).emit('wearable_update', {...})
               ├─ to(`watch-001`).emit('device_telemetry', {...})
               └─ emit('global_wearable_update', {...})

         Socket.IO [====]

T=5.15s  WebSocket Listeners (Everywhere)
         ├─ Patient's Dashboard receives
         │  └─ showLiveVitals({ heartRate: 75, ... })
         ├─ Doctor's Dashboard receives
         │  └─ updatePatientCard({ risk: 15, ... })
         └─ Mobile App receives (optional)
            └─ showAlerts (if any)

T=5.25s  UI Updates (Visible to User)
         ├─ Heart Rate: 75 ← UPDATED
         ├─ Oxygen: 96.5% ← UPDATED
         ├─ BP: 118/78 ← UPDATED
         ├─ Risk Index: 15 ← UPDATED
         ├─ Chart updates ← ANIMATED
         └─ Timestamp: 5:23:45 PM ← UPDATED

T=10s    Next reading cycle begins...
         └─ Loop back to T=0ms

═══════════════════════════════════════════════════════════════════
Total latency: ~250ms (Internet dependent)
Update frequency: 5-60 seconds (configurable)
Data loss: 0% (with offline queue)
```

---

## Component Relationships

```
                          ┌─────────────────┐
                          │  User Devices   │
                          │  (Watch, Phone) │
                          └────────┬────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │ Bluetooth/Health APIs      │
                    ↓                             ↓
         ┌──────────────────┐       ┌──────────────────┐
         │  iOS HealthKit   │       │ Android Health   │
         │                  │       │ Connect          │
         └────────┬─────────┘       └────────┬─────────┘
                  │ Via This App              │
                  └──────────┬────────────────┘
                             ↓
                   ┌─────────────────────┐
                   │  Mobile App (You)   │
                   │                     │
                   │  • Login            │ ← Users start here
                   │  • Configure        │
                   │  • Monitor          │
                   │  • Send to backend  │
                   └────────┬────────────┘
                            │ HTTP POST
                            ↓
            ┌───────────────────────────────┐
            │  Backend (Your Server)        │
            │                               │
            │  Functions:                   │
            │  • Receive data               │
            │  • Validate/save              │
            │  • Calculate metrics          │
            │  • Broadcast to dashboards    │
            └──────┬────────────────────────┘
                   │ Socket.IO Rooms:
        ┌──────────┼──────────┐
        ↓          ↓          ↓
    Patient    Doctor    Admin
    Dashboard  Dashboard Dashboard
```

---

## Authentication Flow

```
User Opens App
    ↓
[Login Screen]
    Email: patient@example.com
    Password: ••••••
    ↓
Mobile App sends:
    POST /api/auth/login
    {
      "email": "patient@example.com",
      "password": "password123"
    }
    ↓
Backend validates:
    ✓ Email exists?
    ✓ Password correct?
    ↓
Backend returns:
    {
      "token": "eyJhbGc...",
      "user": {
        "_id": "patient-123",
        "email": "patient@example.com",
        "role": "patient"
      }
    }
    ↓
Mobile App:
    • Stores token in SecureStore
    • Saves user ID
    • Moves to Config Screen
    ↓
[Configuration Screen]
    Select Device: Apple Watch
    Patient ID: patient-123 (prefilled)
    Update Freq: 5 seconds
    ↓
[Live Monitoring Screen] ← Data starts flowing!
```

---

## Data Model (What Gets Stored)

```
┌─────────────────────────────────────────────────────────────┐
│                  MongoDB Database                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📋 Users Collection                                         │
│  ├─ _id: ObjectId                                           │
│  ├─ email: "patient@example.com"                           │
│  ├─ password: (hashed)                                      │
│  ├─ firstName: "John"                                       │
│  ├─ role: "patient" | "doctor" | "admin"                   │
│  ├─ age: 45                                                 │
│  └─ createdAt: Date                                         │
│                                                             │
│  📱 Devices Collection                                       │
│  ├─ _id: ObjectId                                           │
│  ├─ patient: ObjectId → User                                │
│  ├─ deviceId: "watch-001"                                   │
│  ├─ deviceType: "smartwatch"                               │
│  ├─ deviceName: "Apple Watch Series 7"                     │
│  ├─ lastSync: Date                                          │
│  └─ status: "active" | "inactive"                          │
│                                                             │
│  📊 WearableData Collection (Time-Series)                   │
│  ├─ _id: ObjectId                                           │
│  ├─ patient: ObjectId → User                                │
│  ├─ deviceId: "watch-001"                                   │
│  ├─ timestamp: Date (indexed for fast queries)              │
│  ├─ data:                                                   │
│  │  ├─ heartRate: 75 (bpm)                                 │
│  │  ├─ oxygenLevel: 96.5 (%)                               │
│  │  ├─ bloodPressure: { systolic: 118, diastolic: 78 }    │
│  │  ├─ stressScore: 35 (0-100)                             │
│  │  ├─ steps: 1245 (count)                                 │
│  │  ├─ caloriesBurned: 234.5 (kcal)                        │
│  │  ├─ skinTemp: 36.4 (°C)                                 │
│  │  └─ sleepDuration: 7.5 (hours)                          │
│  └─ synced: boolean                                         │
│                                                             │
│  🚨 Alerts Collection                                        │
│  ├─ _id: ObjectId                                           │
│  ├─ patient: ObjectId → User                                │
│  ├─ type: "high_heart_rate"                                │
│  ├─ severity: "low" | "medium" | "high" | "critical"      │
│  ├─ value: 135 (actual reading)                            │
│  ├─ threshold: 120 (alert boundary)                        │
│  ├─ timestamp: Date                                         │
│  ├─ acknowledged: boolean                                   │
│  └─ acknowledgedBy: ObjectId → Doctor                       │
│                                                             │
│  📈 HealthRecords Collection                                │
│  ├─ _id: ObjectId                                           │
│  ├─ patient: ObjectId → User                                │
│  ├─ date: Date                                              │
│  ├─ summary:                                                │
│  │  ├─ avgHeartRate: 72                                    │
│  │  ├─ maxHeartRate: 95                                    │
│  │  ├─ totalSteps: 12450                                   │
│  │  ├─ sleepQuality: "good"                                │
│  │  └─ riskLevel: 15 (%)                                   │
│  └─ data: [reference to WearableData]                      │
│                                                             │
│  👨‍⚕️ DoctorPatient Collection                              │
│  ├─ _id: ObjectId                                           │
│  ├─ doctor: ObjectId → User (role: doctor)                 │
│  ├─ patient: ObjectId → User (role: patient)               │
│  ├─ status: "active" | "inactive"                          │
│  └─ createdAt: Date                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Socket.IO Room Structure

```
Server
│
├─ Room: patient-123
│  └─ Active connections:
│     ├─ Mobile App UI
│     ├─ Patient's Web Dashboard
│     └─ Assigned Doctor's Dashboard
│     
│  Events emitted:
│     → wearable_update (new vitals)
│     → telemetry_update (risk scores)
│     → alert_generated (abnormal value)
│     → device_status_changed
│
├─ Room: device-watch-001
│  └─ Active connections:
│     ├─ Device manager
│     └─ Admin console
│
│  Events emitted:
│     → device_telemetry (device-specific data)
│     → device_status (battery, sync status)
│
├─ Room: global
│  └─ Active connections:
│     ├─ Admin dashboard
│     ├─ All doctor dashboards
│     └─ Analytics engines
│
│  Events emitted:
│     → global_wearable_update (patient X sent data)
│     → critical_alert (any patient)
│     → system_status
│
└─ Automatic cleanup:
   • User disconnects → leaves all rooms
   • Room empty → auto-deleted (after timeout)
   • Memory efficient & scalable
```

---

## Error Handling Flow

```
Request from Mobile App
    ↓
Backend Receives
    ↓
    ├─ User authenticated?
    │  ├─ NO → 401 Unauthorized
    │  └─ YES → Continue
    │
    ├─ Data valid?
    │  ├─ NO → 400 Bad Request (explain missing fields)
    │  └─ YES → Continue
    │
    ├─ Patient exists?
    │  ├─ NO → 404 Not Found
    │  └─ YES → Continue
    │
    ├─ Device registered?
    │  ├─ NO → Auto-register or 404
    │  └─ YES → Continue
    │
    ├─ Save to database
    │  ├─ FAIL → 500 Internal Server Error
    │  └─ SUCCESS → Continue
    │
    ├─ Calculate metrics
    │  └─ (errors logged, request still succeeds)
    │
    ├─ Emit via Socket.IO
    │  └─ (errors logged, request still succeeds)
    │
    └─ Return 201 Created
       {
         "success": true,
         "data": {...}
       }

Mobile App Receives
    ↓
    ├─ Status 201?
    │  ├─ NO → Show error message & log
    │  └─ YES → Display success
    │
    ├─ Retry logic?
    │  ├─ Timeout or network error → queue for later
    │  ├─ Auth error → show login screen
    │  └─ Other error → show notification
    │
    └─ Continue monitoring
```

---

## Scaling Architecture

```
Single Machine (Development)
┌──────────────────────────────────────┐
│ Node.js Server + MongoDB + Redis     │
│ Handles: ~10 concurrent patients     │
└──────────────────────────────────────┘


Multi-Machine (Production)
┌─────────────────────────────────────────────────────────────┐
│                   Load Balancer                             │
│                 (nginx / AWS ELB)                           │
└─────────────────────────────────────────────────────────────┘
    │                    │                    │
    ↓                    ↓                    ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Node.js #1   │  │ Node.js #2   │  │ Node.js #3   │
│ Port 5000    │  │ Port 5001    │  │ Port 5002    │
└──────────────┘  └──────────────┘  └──────────────┘
    │              │              │
    └──────────────┼──────────────┘
                   ↓
        ┌──────────────────────┐
        │  Shared Redis        │
        │  (Session store)     │
        └──────────────────────┘
                   ↓
        ┌──────────────────────┐
        │  MongoDB Replica Set │
        │  (HA Database)       │
        └──────────────────────┘

Handles: 1000+ concurrent patients
Latency: <100ms
Uptime: 99.99%
```

---

**Status**: All diagrams included ✅  
**Complexity**: Explained in visual form  
**Ready for**: Understanding the full system
