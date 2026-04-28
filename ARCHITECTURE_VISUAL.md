# Wearable Integration - Complete Visual Architecture

## System Architecture Diagram

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                     CARDIO SENTINEL WEARABLE INTEGRATION                     ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│ DEVICE LAYER                                                                │
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐      │
│  │ Apple Watch │  │ Garmin      │  │ Android     │  │ Fitbit       │      │
│  │ + HealthKit │  │ Connect SDK │  │ Health      │  │ Cloud API    │      │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘      │
│         │                │                │               │                 │
│         └────────────────┴────────────────┴───────────────┘                 │
│                           │                                                  │
│                    [JSON PAYLOAD]                                           │
│                           │                                                  │
└───────────────────────────┼──────────────────────────────────────────────────┘
                            │
        ┌───────────────────┘
        │
        ↓ HTTP POST (w/ Bearer Token)
        │
┌──────────────────────────────────────────────────────────────────────────────┐
│ BACKEND LAYER                                                                │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ POST /api/wearable/ingest                                            │   │
│  │                                                                      │   │
│  │  {                                                                  │   │
│  │    "patientId": "507f...",                                         │   │
│  │    "deviceId": "apple-watch-001",                                 │   │
│  │    "deviceType": "smartwatch",                                    │   │
│  │    "data": {heartRate: 72, oxygenLevel: 98, ...}                 │   │
│  │  }                                                                 │   │
│  └─────────────────────────┬────────────────────────────────────────┘   │
│                             │                                             │
│         ┌───────────────────┼───────────────────┐                        │
│         ↓                   ↓                   ↓                         │
│  ┌─────────────────┐ ┌─────────────────┐ ┌──────────────────┐           │
│  │ Validate data   │ │ Save to MongoDB │ │ Emit Socket.IO   │           │
│  │ Check auth      │ │ WearableData    │ │ 'wearable_       │           │
│  │ Extract patient │ │ collection      │ │  update' event   │           │
│  └─────────────────┘ └─────────────────┘ └──────────────────┘           │
│                             │                   │                         │
│                             │ +-----------------+                         │
│                             │ │                 │                         │
│                             ↓ ↓                 ↓                         │
│                  ┌────────────────────────────────────────┐              │
│                  │ Socket.IO Room Broadcasting            │              │
│                  │ io.emit('wearable_update', {...})      │              │
│                  └────────────────────────────────────────┘              │
│                             │                                             │
└─────────────────────────────┼─────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ↓                     ↓                     ↓
┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────┐
│ Patient App     │  │ Doctor Dashboard│  │ Database             │
│ LiveHealthInput │  │ (via socket)    │  │ MongoDB              │
│                 │  │                 │  │ WearableData         │
│ Socket.IO       │  │ Instant alert   │  │ HealthRecord         │
│ listener        │  │ Unread count++  │  │ Alert                │
│                 │  │ No refresh      │  │                      │
└────────┬────────┘  └────────┬────────┘  └──────────────────────┘
         │                    │
         │ UPDATE DISPLAY     │ UPDATE ALERT PANEL
         │                    │
         ↓                    ↓
    ┌─────────────────────────────────────┐
    │ USER SEES:                          │
    │ ✓ Live HR: 72 bpm (updating)        │
    │ ✓ Live SpO2: 98% (from device)      │
    │ ✓ Risk score recalculates           │
    │ ✓ Doctor sees alert instantly       │
    │ ✓ No page refresh needed            │
    └─────────────────────────────────────┘
```

---

## Data Flow Timeline

```
Device sends data:
|
+--- Device has HR=72, SpO2=98
|
+-→ HTTP POST /api/wearable/ingest (100-200ms)
|   │
|   └─→ Server receives
|       - Validates auth token
|       - Checks patient ID
|       - Sanitizes data
|
+-→ Save to MongoDB (50-100ms)
|   │
|   └─→ WearableData document created
|
+-→ Emit Socket.IO 'wearable_update' (5-20ms)
|   │
|   ├─→ Patient's browser receives
|   │   │
|   │   └─→ setLiveHr(72)
|   │   └─→ setLiveSpo2(98)
|   │   └─→ Form updates real-time
|   │   └─→ Risk score recalculates
|   │
|   └─→ Doctor's browser receives
|       │
|       └─→ New alert panel appears
|       └─→ Unread count increments
|       └─→ Badge flashes
|

TOTAL LATENCY: ~200-400ms from device to doctor sees it
```

---

## Request/Response Lifecycle

```
┌──────────────────────────────────────────────────────────────────┐
│ STEP 1: Device Sends Data (iOS/Android/Fitbit/etc)              │
└──────────────────────────────────────────────────────────────────┘
                               ↓
Request:
  POST /api/wearable/ingest
  Authorization: Bearer eyJ...
  Content-Type: application/json
  
  {
    "patientId": "507f1f77bcf86cd799439011",
    "deviceId": "apple-watch-001",
    "deviceType": "smartwatch",
    "data": {
      "heartRate": 72,
      "oxygenLevel": 98,
      "steps": 8234
    }
  }

                               ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 2: Backend Processes (wearableController.ingestWearableData)│
└──────────────────────────────────────────────────────────────────┘
                               ↓
  1. Auth check: ✓ Token valid
  2. Validate: ✓ PatientId + data present
  3. Create doc: WearableData { patient, deviceId, data, timestamp }
  4. Save to DB: ✓ MongoDB WearableData collection
  5. Emit event: io.emit('wearable_update', {patientId, data})

                               ↓
Response (201 Created):
  {
    "success": true,
    "message": "Wearable data ingested successfully",
    "data": {
      "_id": "507f1f77bcf86cd799439012",
      "patient": "507f1f77bcf86cd799439011",
      "timestamp": "2025-03-18T14:32:00.000Z",
      "data": {...}
    }
  }

                               ↓
┌──────────────────────────────────────────────────────────────────┐
│ STEP 3: Frontend Updates (Patient + Doctor)                     │
└──────────────────────────────────────────────────────────────────┘
                               ↓
  Socket.IO event: 'wearable_update'
  
  Patient Frontend:
  ├─ socket.on('wearable_update', (update) => {
  │    setLiveHr(update.data.heartRate)
  │    setLiveSpo2(update.data.oxygenLevel)
  │    // Form updates instantly
  │  })
  │
  Doctor Frontend:
  └─ socket.on('new_alert', (alert) => {
       // Alert panel shows new alert
       // Unread count increments
     })

                               ↓
Display Updated:
  ✓ Patient sees: "Live HR: 72 bpm" (animating)
  ✓ Doctor sees: "New alert from John Doe"
  ✓ Zero refresh needed
```

---

## Interaction Diagram (Sequence)

```
Device          App              Backend         Browser          Doctor
  │              │                  │               │              │
  │─ send data ──────────────────────→│               │              │
  │              │                    │               │              │
  │              │           ┌────────→ validate     │              │
  │              │           │ ┌──────→ save to DB   │              │
  │              │           │ │ ┌────→ emit upload  │              │
  │              │           │ │ │                   │              │
  │ ←──── 201 OK ───────────────┘                    │              │
  │              │                    │               │              │
  │              │                    ├──SocketIO────→│              │
  │              │                    │  wearable_    │              │
  │              │                    │  update       │              │
  │              │                    │               │              │
  │              │                    │               │    ┌────────→
  │              │                    │               │    │ alert
  │              │                    │               │    │ created
  │              │                    │               │ ←──┘
  │              │                    │               │              │
  │              │ ←── live display ──┼───────────────┤    ┌────────→│
  │              │    updates         │               │    │ alert   │
  │              │ (every 2s poll)    │               │    │ appears │
  │              │                    │               │    │         │
  │              │ [User clicks       │               │    │ ←───────┘
  │              │  "Analyze Risk"]   │               │    │
  │              │                    │               │    │
  │              │ ─ POST /health/───→│               │    │
  │              │   records          │               │    │
  │              │                    │ analyze data  │    │
  │              │                    │ score ≥ 40    │    │
  │              │                    │ create alert  │    │
  │              │                    ├──alert event──┼───→│
  │              │                    │               │    │
  │              │                    │               │ ←──┘
  │              │                    │               │ (updates panel)
  │              │                    │               │    │
  │ ←─ save completed ──────────────────────────────→│    │
  │              │                    │               │    │
```

---

## State Management on Frontend

```
LiveHealthInput.jsx Component State:

┌────────────────────────────────────────────┐
│ Form State                                 │
├────────────────────────────────────────────┤
│ {                                          │
│   // Personal                              │
│   age: 42,                                 │
│   sex: "male",                             │
│   smoking: "never",                        │
│   ...                                      │
│   // Wearable (LIVE UPDATED)               │
│   hr: 72,            ← updates from API    │
│   spo2: 98,          ← updates from API    │
│   steps: 8234,       ← updates from API    │
│   stress: 30,        ← updates from API    │
│   skinTemp: 36.4,    ← updates from API    │
│   ...                                      │
│ }                                          │
└────────────────────────────────────────────┘
         │
         │ setForm() ← fetchWearableData()
         │            (every 2 seconds)
         │
         ├─ Get /api/wearable/latest/:patientId
         │  └─ If success: update form fields
         │  └─ If fail: keep existing values
         │
         ├─ Socket.IO listener
         │  ├─ on 'wearable_update'
         │  └─ setForm() immediately
         │
         └─ Fallback simulation
            └─ Gentle drift (±3 bpm, ±0.5% SpO2)
```

---

## API Call Pattern (Polling vs Socket.IO)

```
POLLING APPROACH (Current Implementation):
──────────────────────────────────────────
t=0s:   setInterval(fetchWearableData, 2000)
        ├─ GET /api/wearable/latest/patientId
        └─ Update form

t=2s:   GET /api/wearable/latest/patientId
        └─ Update form

t=4s:   GET /api/wearable/latest/patientId
        └─ Update form

...

Pros:
  ✓ Simple to implement
  ✓ Works with rate limiting
  ✓ No real-time dependency
  
Cons:
  ✗ 2-second latency
  ✗ Wasteful if no data changed
  ✗ More server requests (720/day per patient)


SOCKET.IO APPROACH (Also Implemented):
──────────────────────────────────────
t=0s:   socket.on('wearable_update', (data) => updateForm(data))

t=0.2s: Device sends data
        ├─ Server: POST /api/wearable/ingest
        ├─ Server: emit 'wearable_update'
        └─ Client: socket receives immediately
            └─ Update form (0ms latency)

t=0.5s: Device sends data
        ├─ Server: POST /api/wearable/ingest
        ├─ Server: emit 'wearable_update'
        └─ Client: socket receives immediately
            └─ Update form (0ms latency)

Pros:
  ✓ Zero-latency updates
  ✓ Only updates when data changes
  ✓ Less server load
  
Cons:
  ✗ Requires Socket.IO connection
  ✗ Need to handle reconnection


HYBRID (BEST):
──────────────
socket.on('wearable_update') // Real-time if connected
+ 
setInterval(pollAPI, 2000)   // Fallback if socket fails
                               // Ensures data freshness
```

---

## Error Handling Flow

```
Device sends data
  ↓
┌─────────────────────────┐
│ POST /api/wearable/... │
└──────────┬──────────────┘
           ↓
    ┌──────────────────┐
    │ 401 Unauthorized │ → Refresh token or re-login
    │ 403 Forbidden    │ → Patient not matched to user
    │ 400 Bad Request  │ → Missing required fields
    │ 404 Not Found    │ → Patient ID doesn't exist
    │ 201 Created      │ → ✓ Success
    └──────────────────┘
           ↓
    ┌──────────────────┐
    │ 500 Server Error │ → Database/network issue
    │                  │   Retry with exponential backoff
    └──────────────────┘
           ↓
    Device retry logic:
    ├─ Immediate: 1 retry
    ├─ 5s delay: 1 retry
    ├─ 30s delay: 1 retry
    └─ Then give up, alert user
```

---

## MongoDB Schema Relationship

```
User (Patient)
  │
  └─ _id: ObjectId
     email: String
     password: Hash
     role: "patient"
     assignedDoctor: ObjectId → User


WearableData
  │
  ├─ _id: ObjectId
  ├─ patient: ObjectId → User (Patient)
  ├─ deviceId: String
  ├─ deviceType: String (enum)
  ├─ timestamp: Date
  ├─ data: {
  │   heartRate: Number
  │   oxygenLevel: Number
  │   steps: Number
  │   sleepDuration: Number
  │   ... (all vital fields)
  │ }
  ├─ synced: Boolean
  ├─ createdAt: Date
  └─ updatedAt: Date

HealthRecord
  │
  ├─ _id: ObjectId
  ├─ patient: ObjectId → User (Patient)
  ├─ doctor: ObjectId → User (Doctor)
  ├─ vitals: {bloodPressure, heartRate, ...}
  ├─ labResults: {bloodSugar, cholesterol, ...}
  ├─ wearable: {          ← USES DATA FROM WearableData
  │   steps: Number,
  │   sleepHours: Number,
  │   stressScore: Number,
  │   ... (from wearable ingest)
  │ }
  ├─ riskScore: Number
  ├─ aiAnalysis: {...}
  └─ timestamps


Alert
  │
  ├─ _id: ObjectId
  ├─ patient: ObjectId → User
  ├─ doctor: ObjectId → User
  ├─ healthRecord: ObjectId → HealthRecord
  ├─ riskLevel: String
  ├─ message: String
  ├─ read: Boolean
  └─ createdAt: Date
```

---

## Performance Metrics

```
Latency Breakdown:
┌─────────────────────────────────────────────────────┐
│ Device → Server: 50-100ms  (network)                │
│ Parse JSON: 5-10ms         (server)                 │
│ Validate: 10-20ms          (auth + schema)          │
│ Save to MongoDB: 20-50ms   (disk write)             │
│ Emit Socket.IO: 5-20ms     (broadcast)              │
│─────────────────────────────────────────────────────│
│ TOTAL: 100-300ms (from device to backend)           │
├─────────────────────────────────────────────────────┤
│ Socket.IO → Browser: 5-50ms (network latency)       │
│ React state update: 10-50ms (DOM render)            │
│─────────────────────────────────────────────────────│
│ TOTAL: 105-400ms (device → doctor sees it)          │
└─────────────────────────────────────────────────────┘

Throughput:
├─ Device sends: Every 30-60 seconds
├─ Server handles: 100 requests/10 min (2400/day)
├─ Database writes: 100+ per second capacity
├─ Socket.IO broadcasts: Unlimited (real-time)
└─ Frontend updates: 60 FPS (smooth animation)
```

---

## Security Boundaries

```
┌───────────────────────────────────────────────────────┐
│ SECURITY LAYERS                                      │
├───────────────────────────────────────────────────────┤
│                                                       │
│ Layer 1: Authentication (JWT Token)                  │
│  ├─ All requests require: "Authorization: Bearer"    │
│  ├─ Token issued at login                            │
│  ├─ Expires in 24 hours                              │
│  └─ Verified on every request                        │
│                                                       │
│ Layer 2: Authorization (Role-based)                  │
│  ├─ Patient can only:                                │
│  │  └─ POST /wearable/ingest (own ID)                │
│  │  └─ GET /wearable/latest (own ID)                 │
│  │  └─ GET /wearable/history (own ID)                │
│  │                                                   │
│  └─ Doctor can:                                      │
│     └─ GET /wearable/latest (assigned patients)      │
│     └─ GET /wearable/history (assigned patients)     │
│     └─ PUT /wearable/:id (update own patients)       │
│                                                       │
│ Layer 3: Data Validation                             │
│  ├─ Schema validation (Mongoose)                     │
│  ├─ Type checking (numeric bounds)                   │
│  ├─ Sanitization (JSON parse)                        │
│  └─ Injection prevention (parameterized queries)     │
│                                                       │
│ Layer 4: Network Security                            │
│  ├─ HTTPS/TLS enforced (production)                  │
│  ├─ CORS configured                                  │
│  ├─ Helmet security headers                          │
│  └─ Rate limiting (100/10min)                        │
│                                                       │
│ Layer 5: Data Storage                                │
│  ├─ MongoDB encryption at rest                       │
│  ├─ Backup encryption                                │
│  ├─ Access logs                                      │
│  └─ Retention: 7 years (HIPAA)                       │
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

**This architecture ensures:**
- ✓ Real-time data flow (<300ms latency)
- ✓ Zero page refreshes
- ✓ Secure patient data
- ✓ Doctor alerts instantly
- ✓ Seamless device integration
- ✓ Scalable to thousands of patients

