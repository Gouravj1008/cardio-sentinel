# Wearable API Reference - Complete Examples

## Quick API Overview

```
┌─────────────────────────────────────────────────────────┐
│                WEARABLE API ENDPOINTS                   │
├─────────────────────────────────────────────────────────┤
│ POST   /api/wearable/ingest                             │
│ GET    /api/wearable/latest/:patientId                  │
│ GET    /api/wearable/history/:patientId                 │
│ PUT    /api/wearable/:wearableId                        │
└─────────────────────────────────────────────────────────┘
```

All require `Authorization: Bearer <token>`

---

## 1. POST /api/wearable/ingest

**Purpose**: Device/SDK sends wearable data to backend

### Request

```http
POST /api/wearable/ingest HTTP/1.1
Host: cardio-sentinel.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "patientId": "507f1f77bcf86cd799439011",
  "deviceId": "smartwatch-apple-watch-series-8",
  "deviceType": "smartwatch",
  "data": {
    "heartRate": 72,
    "oxygenLevel": 98,
    "steps": 8234,
    "sleepDuration": 7.5,
    "stressScore": 35,
    "skinTemp": 36.4,
    "bloodPressure": {
      "systolic": 120,
      "diastolic": 80
    },
    "caloriesBurned": 450,
    "activeMinutes": 45,
    "temperature": 37.1,
    "bloodSugar": 95
  }
}
```

### Response (Success)

```json
{
  "success": true,
  "message": "Wearable data ingested successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "patient": "507f1f77bcf86cd799439011",
    "deviceId": "smartwatch-apple-watch-series-8",
    "deviceType": "smartwatch",
    "timestamp": "2025-03-18T14:32:00.000Z",
    "data": {
      "heartRate": 72,
      "oxygenLevel": 98,
      "steps": 8234,
      "sleepDuration": 7.5,
      "stressScore": 35,
      "skinTemp": 36.4,
      "bloodPressure": {
        "systolic": 120,
        "diastolic": 80
      },
      "caloriesBurned": 450,
      "activeMinutes": 45,
      "temperature": 37.1,
      "bloodSugar": 95
    },
    "synced": true,
    "createdAt": "2025-03-18T14:32:00.473Z",
    "updatedAt": "2025-03-18T14:32:00.473Z"
  }
}
```

### Response (Error)

```json
{
  "success": false,
  "message": "Missing patientId or data"
}
```

### Side Effects

- Saves to MongoDB `WearableData` collection
- **Emits Socket.IO event**:
  ```javascript
  io.emit('wearable_update', {
    patientId: "507f1f77bcf86cd799439011",
    wearableId: "507f1f77bcf86cd799439012",
    timestamp: "2025-03-18T14:32:00.000Z",
    data: { heartRate: 72, oxygenLevel: 98, ... },
    deviceType: "smartwatch"
  });
  ```

---

## 2. GET /api/wearable/latest/:patientId

**Purpose**: Fetch most recent wearable data for display

### Request

```http
GET /api/wearable/latest/507f1f77bcf86cd799439011 HTTP/1.1
Host: cardio-sentinel.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response (Success)

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "timestamp": "2025-03-18T14:32:00.000Z",
    "deviceType": "smartwatch",
    "heartRate": 72,
    "oxygenSaturation": 98,
    "steps": 8234,
    "sleepDuration": 7.5,
    "bloodPressure": {
      "systolic": 120,
      "diastolic": 80
    },
    "bloodSugar": 95,
    "caloriesBurned": 450,
    "stressScore": 35,
    "skinTemp": 36.4
  }
}
```

### Response (No Data)

```json
{
  "success": false,
  "message": "No recent wearable data found"
}
```

### Query Parameters (Optional)

None for this endpoint.

### Usage in LiveHealthInput.jsx

```javascript
async function fetchWearableData(patientId) {
  try {
    const res = await api.get(`/wearable/latest/${patientId}`);
    const d = res.data.data;
    
    // Update form with latest wearable data
    setForm(f => ({
      ...f,
      hr: d.heartRate ?? f.hr,
      spo2: d.oxygenSaturation ?? f.spo2,
      steps: d.steps ?? f.steps,
      sleep: d.sleepDuration ?? f.sleep,
      stress: d.stressScore ?? f.stress,
    }));
  } catch (error) {
    console.error('Failed to fetch wearable data');
  }
}

// Call every 2 seconds
setInterval(() => fetchWearableData(patientId), 2000);
```

---

## 3. GET /api/wearable/history/:patientId

**Purpose**: Fetch time-series wearable data for charts/analysis

### Request

```http
GET /api/wearable/history/507f1f77bcf86cd799439011?hours=24&limit=100 HTTP/1.1
Host: cardio-sentinel.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `hours` | number | 24 | Time window in hours |
| `limit` | number | 100 | Max records to return |

### Response (Success)

```json
{
  "success": true,
  "count": 48,
  "hours": 24,
  "data": [
    {
      "timestamp": "2025-03-18T14:32:00.000Z",
      "heartRate": 72,
      "steps": 8234,
      "oxygenSaturation": 98,
      "sleepDuration": 7.5,
      "bloodPressure": {
        "systolic": 120,
        "diastolic": 80
      },
      "caloriesBurned": 450
    },
    {
      "timestamp": "2025-03-18T14:02:00.000Z",
      "heartRate": 70,
      "steps": 8100,
      "oxygenSaturation": 99,
      "sleepDuration": 7.5,
      "bloodPressure": {
        "systolic": 118,
        "diastolic": 79
      },
      "caloriesBurned": 440
    },
    // ... 46 more records
  ]
}
```

### Example Queries

```bash
# Last 24 hours, max 100 records
GET /api/wearable/history/507f1f77bcf86cd799439011?hours=24&limit=100

# Last 7 days, max 500 records
GET /api/wearable/history/507f1f77bcf86cd799439011?hours=168&limit=500

# Last 1 hour, max 30 records (6 per 10 min)
GET /api/wearable/history/507f1f77bcf86cd799439011?hours=1&limit=30
```

### Usage for Time-Series Charts

```javascript
async function fetchWearableHistory(patientId) {
  const res = await api.get(`/wearable/history/${patientId}?hours=24&limit=100`);
  
  // Extract for chart
  const labels = res.data.data.map(d => new Date(d.timestamp).toLocaleTimeString());
  const hrData = res.data.data.map(d => d.heartRate);
  
  // Render chart
  displayHeartRateTrendChart(labels, hrData);
}
```

---

## 4. PUT /api/wearable/:wearableId

**Purpose**: Update/correct wearable record (manual adjustment by doctor)

### Request

```http
PUT /api/wearable/507f1f77bcf86cd799439012 HTTP/1.1
Host: cardio-sentinel.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "data": {
    "heartRate": 75,
    "oxygenLevel": 97,
    "stressScore": 38
  }
}
```

### Response (Success)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "patient": "507f1f77bcf86cd799439011",
    "timestamp": "2025-03-18T14:32:00.000Z",
    "data": {
      "heartRate": 75,
      "oxygenLevel": 97,
      "stressScore": 38,
      "steps": 8234,
      "sleepDuration": 7.5,
      "skinTemp": 36.4,
      "bloodPressure": {
        "systolic": 120,
        "diastolic": 80
      },
      "caloriesBurned": 450
    },
    "synced": true,
    "updatedAt": "2025-03-18T14:35:22.111Z"
  }
}
```

---

## Real-World Examples

### Example 1: Apple Watch Integration (Swift)

```swift
import Foundation

struct WearablePayload: Codable {
  let patientId: String
  let deviceId: String
  let deviceType: String
  let data: WearableData
}

struct WearableData: Codable {
  let heartRate: Int?
  let oxygenLevel: Int?
  let steps: Int?
  let sleepDuration: Double?
}

func sendToCardioSentinel(token: String, payload: WearablePayload) {
  var request = URLRequest(url: URL(string: "https://api.cardio-sentinel.com/api/wearable/ingest")!)
  request.httpMethod = "POST"
  request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
  request.setValue("application/json", forHTTPHeaderField: "Content-Type")
  
  let encoder = JSONEncoder()
  request.httpBody = try? encoder.encode(payload)
  
  URLSession.shared.dataTask(with: request) { data, response, error in
    if let data = data {
      if let result = try? JSONDecoder().decode(IngestionResponse.self, from: data) {
        print("✓ Wearable data sent: \(result.message)")
      }
    }
  }.resume()
}
```

### Example 2: Polling Every 30 Seconds (JavaScript)

```javascript
const TOKEN = localStorage.getItem('authToken');
const PATIENT_ID = localStorage.getItem('userId');

async function pollWearableData() {
  try {
    const response = await fetch(
      `/api/wearable/latest/${PATIENT_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        }
      }
    );
    
    if (response.ok) {
      const { data } = await response.json();
      
      console.log(`HR: ${data.heartRate} bpm`);
      console.log(`SpO2: ${data.oxygenSaturation}%`);
      console.log(`Steps: ${data.steps}`);
      
      // Update UI
      document.getElementById('hr-display').textContent = data.heartRate;
      document.getElementById('spo2-display').textContent = data.oxygenSaturation;
    }
  } catch (error) {
    console.error('Fetch failed:', error);
  }
}

// Poll every 30 seconds
setInterval(pollWearableData, 30000);
```

### Example 3: Socket.IO Real-Time Listener

```javascript
import { io } from 'socket.io-client';

const socket = io('https://api.cardio-sentinel.com', {
  extraHeaders: {
    'Authorization': `Bearer ${TOKEN}`
  }
});

socket.on('wearable_update', (update) => {
  console.log('📡 New wearable data from:', update.deviceType);
  console.log('HR:', update.data.heartRate);
  console.log('SpO2:', update.data.oxygenLevel);
  
  // Real-time update (no polling needed)
  updateLiveDisplay(update.data);
});
```

### Example 4: Doctor Viewing Patient History

```javascript
async function viewPatientWearableTrends(patientId) {
  const response = await fetch(
    `/api/wearable/history/${patientId}?hours=168&limit=500`,
    {
      headers: {
        'Authorization': `Bearer ${doctorToken}`
      }
    }
  );
  
  const { data, count } = await response.json();
  
  // Analyze trends
  const avgHR = data.reduce((sum, d) => sum + d.heartRate, 0) / count;
  const maxHR = Math.max(...data.map(d => d.heartRate));
  const minHR = Math.min(...data.map(d => d.heartRate));
  
  console.log(`Average HR (7 days): ${avgHR} bpm`);
  console.log(`Max HR: ${maxHR} bpm`);
  console.log(`Min HR: ${minHR} bpm`);
  
  // Display trend chart
  displayTrendAnalysis(data);
}
```

---

## HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 201 | Created (ingest success) | `POST /ingest` → 201 |
| 200 | OK (fetch success) | `GET /latest/:id` → 200 |
| 400 | Bad request | Missing required fields |
| 403 | Forbidden | Patient not authorized to access this data |
| 404 | Not found | Patient ID doesn't exist / No wearable data |
| 500 | Server error | Database connection failed |

---

## Error Handling

### Patient Cannot Access Another Patient's Data

```bash
curl -X GET http://localhost:5000/api/wearable/latest/OTHER_PATIENT_ID \
  -H "Authorization: Bearer MY_TOKEN"

# Response:
# {
#   "success": false,
#   "message": "Not authorized to access this patient's wearable data"
# }
```

### Device Sends Invalid Data

```bash
curl -X POST http://localhost:5000/api/wearable/ingest \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "deviceId": "watch-001"
    # Missing: patientId, deviceType, data
  }'

# Response:
# {
#   "success": false,
#   "message": "Missing patientId or data"
# }
```

### No Recent Data (>24 hours old)

```bash
curl -X GET http://localhost:5000/api/wearable/latest/PATIENT_ID \
  -H "Authorization: Bearer TOKEN"

# Response:
# {
#   "success": false,
#   "message": "No recent wearable data found"
# }
```

---

## Performance Tips

| Operation | Latency | Tip |
|-----------|---------|-----|
| Ingest | 50-100ms | Batch multiple values, send every 30-60s |
| Fetch latest | 10-50ms | Poll every 2-5 seconds for live display |
| History query | 50-200ms | Cache results for 1+ minutes |
| Socket.IO | 5-20ms | **Best option for real-time (no polling)** |

---

## Rate Limiting

- **Default**: 100 requests per 10 minutes per auth token
- **Per endpoint**: No per-endpoint limits
- **Recommendation**: Send data every 30-60 seconds (720-1440/day)

---

## Data Retention

- Wearable data stored **indefinitely**
- Latest query filters to **24-hour window** (configurable)
- History query respects time range parameter

---

## Complete cURL Test Script

```bash
#!/bin/bash

TOKEN=$1
PATIENT_ID=$2

if [ -z "$TOKEN" ] || [ -z "$PATIENT_ID" ]; then
  echo "Usage: $0 <token> <patient-id>"
  exit 1
fi

echo "1️⃣  INGEST DATA"
curl -X POST http://localhost:5000/api/wearable/ingest \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "'$PATIENT_ID'",
    "deviceId": "test-watch",
    "deviceType": "smartwatch",
    "data": {
      "heartRate": 72,
      "oxygenLevel": 98,
      "steps": 8234
    }
  }' | jq .

echo -e "\n2️⃣ FETCH LATEST"
curl -X GET http://localhost:5000/api/wearable/latest/$PATIENT_ID \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n3️⃣ FETCH HISTORY (24h)"
curl -X GET "http://localhost:5000/api/wearable/history/$PATIENT_ID?hours=24&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n✓ Tests complete"
```

---

**Ready to integrate?** Start with Option D (curl), then move to your device SDK. 🚀
