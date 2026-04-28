# Real-Time Dashboard & Live Model Status System

## Overview

A complete real-time data synchronization and monitoring system for Cardio Sentinel, featuring:
- **Live Model Status Monitoring** - Check if ML models are loaded and available
- **Real-Time Doctor Dashboard** - All doctors see patient vitals simultaneously
- **Real-Time Patient Dashboard** - Patients monitor their own health metrics in real-time
- **WebSocket Integration** - Live sync notifications and data refresh triggers
- **Time-Synchronized Updates** - Server timestamp included in every update (10-60 second intervals)

---

## Architecture

### Components Added

1. **modelStatusService.js** - Model status tracking and reporting
2. **Enhanced liveDataRoutes.js** - New endpoints for all-doctor and all-patient data
3. **Enhanced diseasePredictionRoutes.js** - New live-model-status endpoint
4. **Enhanced diseasePredictionController.js** - Handler for model status reporting
5. **Enhanced server.js** - WebSocket events and periodic broadcasts

### Data Flow

```
Wearable Device
    ↓
WearableData Collection (MongoDB)
    ↓
Real-Time Routes (/api/live/*)
    ├→ REST API endpoints (HTTP pull)
    └→ WebSocket emissions (Socket.IO push)
    ↓
Frontend Dashboard (Updated every 10 sec)
```

---

## API Endpoints

### 1. Live Model Status Endpoint

**GET** `/api/disease-prediction/live-model-status`

Returns comprehensive model availability and readiness information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2026-03-22T14:30:00.000Z",
    "liveModel": {
      "present": true,
      "loaded": false,
      "status": "READY",
      "metadata": {
        "path": "ml-models/models/artifacts/future_disease_live_model.joblib",
        "sizeBytes": 2048576,
        "sizeLabel": "1.95 MB",
        "createdAt": "2026-03-22T10:00:00.000Z",
        "lastModified": "2026-03-22T10:00:00.000Z"
      },
      "metrics": {
        "trainingAccuracy": 0.87,
        "testingAccuracy": 0.85,
        "precision": 0.89,
        "recall": 0.82,
        "f1Score": 0.855,
        "rocAuc": 0.91,
        "positiveClassRatio": 0.32,
        "featureCount": 18,
        "lastTrainedAt": "2026-03-22T10:00:00.000Z"
      },
      "lastCheckTime": "2026-03-22T14:30:00.000Z",
      "loadAttempts": 5,
      "errorMessage": null
    },
    "legacyModel": {
      "present": true,
      "path": "backend/cardio_sentinel_ai.joblib",
      "sizeBytes": 1024000,
      "sizeLabel": "1.00 MB",
      "lastModified": "2026-01-15T08:00:00.000Z"
    },
    "readiness": {
      "mlEnhancedPredictions": true,
      "fallbackAvailable": true,
      "ruleBasedPredictions": "always_available"
    },
    "apiCapabilities": {
      "mlEnhancedPredictions": true,
      "probabilityBlending": "60% rule-based + 40% ML",
      "fallbackEnabled": true
    }
  }
}
```

---

### 2. Real-Time Doctor Dashboard Endpoint

**GET** `/api/live/all-doctors-realtime`

Fetches all doctors and their assigned patients with current vitals.

**Headers:**
```
Authorization: Bearer <doctor-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Real-time doctor dashboard data",
  "serverTimestamp": "2026-03-22T14:30:00.000Z",
  "dataRefreshRate": "10 seconds",
  "totalDoctors": 5,
  "totalPatientsMonitored": 23,
  "doctors": [
    {
      "doctorId": "doc123",
      "doctorName": "Dr. John Smith",
      "patientCount": 5,
      "patients": [
        {
          "patientId": "pat001",
          "patientName": "Alice Johnson",
          "latestVitals": {
            "age": 45,
            "bloodPressure": { "systolic": 118, "diastolic": 76 },
            "heartRate": 72,
            "bmi": 24.5
          },
          "riskLevel": "LOW",
          "riskScore": 0.25,
          "lastReadingTime": "2026-03-22T14:28:00.000Z",
          "wearableData": {
            "heartRate": 72,
            "oxygenLevel": 98,
            "bloodPressure": { "systolic": 118, "diastolic": 76 },
            "stressScore": 35
          }
        }
      ],
      "lastSyncTime": "2026-03-22T14:30:00.000Z"
    }
  ]
}
```

---

### 3. Real-Time Patient Dashboard Endpoint

**GET** `/api/live/all-patients-realtime`

Fetches current patient's health data with 24-hour trends.

**Headers:**
```
Authorization: Bearer <patient-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Real-time patient health data",
  "serverTimestamp": "2026-03-22T14:30:00.000Z",
  "dataRefreshRate": "10 seconds",
  "patient": {
    "id": "pat001",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "healthProfile": {}
  },
  "currentVitals": {
    "heartRate": 72,
    "heartRateTrend": "stable",
    "bloodPressure": { "systolic": 118, "diastolic": 76 },
    "oxygenLevel": 98,
    "oxygenTrend": "stable",
    "stressScore": 35,
    "stressTrend": "decreasing",
    "sleepScore": 8.2,
    "stepsCount": 4230
  },
  "healthAnalysis": {
    "riskLevel": "LOW",
    "riskScore": 0.25,
    "topThreats": [
      {
        "name": "Hypertension",
        "probability": 0.15,
        "risk": 0.18
      }
    ],
    "recommendations": [
      "Maintain regular exercise routine",
      "Monitor salt intake"
    ]
  },
  "last24hSummary": {
    "readingsCount": 1440,
    "heartRateRange": {
      "min": 58,
      "max": 95,
      "avg": 72.3
    }
  },
  "lastUpdateTime": "2026-03-22T14:28:30.000Z"
}
```

---

## WebSocket Events

### Client → Server Events

#### 1. Subscribe to Model Status

```javascript
socket.emit('subscribe:model-status');
```

Listen for model status updates:
```javascript
socket.on('model:status-update', (data) => {
  console.log('Model status:', data.liveModel.status);
});
```

#### 2. Subscribe to Dashboard

```javascript
// For doctors
socket.emit('subscribe:dashboard', 'doctor');

// For patients
socket.emit('subscribe:dashboard', 'patient');
```

Listen for dashboard refresh notifications:
```javascript
socket.on('dashboard:data-refresh', (data) => {
  console.log('Fresh data available:', data.endpoint);
  // Fetch new data from REST API
});
```

#### 3. Request Data Sync

```javascript
socket.emit('request:sync', { dataType: 'wearable' });

socket.on('sync:initiated', (data) => {
  console.log('Sync started for:', data.dataType);
});
```

### Server → Client Events

#### 1. Model Status Update (every 30 seconds)

```json
{
  "type": "model:status-update",
  "data": {
    "timestamp": "2026-03-22T14:30:00.000Z",
    "liveModel": {
      "present": true,
      "loaded": false,
      "status": "READY"
    },
    "readiness": {
      "mlEnhancedPredictions": true,
      "fallbackAvailable": true,
      "ruleBasedPredictions": "always_available"
    }
  }
}
```

#### 2. Dashboard Data Refresh (every 10 seconds)

```json
{
  "type": "dashboard:data-refresh",
  "data": {
    "timestamp": "2026-03-22T14:30:00.000Z",
    "message": "Real-time dashboard data available",
    "endpoint": "/api/live/all-doctors-realtime",
    "refreshRate": "10 seconds"
  }
}
```

#### 3. Server Sync Pulse (every 60 seconds)

```json
{
  "type": "server:sync-pulse",
  "data": {
    "timestamp": "2026-03-22T14:30:00.000Z",
    "message": "Server sync pulse - all data synchronized",
    "status": "synced"
  }
}
```

---

## Frontend Integration Example

### React ComponentWithSocket.IO

```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const RealTimeDashboard = () => {
  const [modelStatus, setModelStatus] = useState(null);
  const [doctorData, setDoctorData] = useState(null);
  const [lastSync, setLastSync] = useState(new Date());
  
  useEffect(() => {
    const socket = io();
    
    // Subscribe to model status
    socket.emit('subscribe:model-status');
    socket.emit('subscribe:dashboard', 'doctor');
    
    // Listen for model updates
    socket.on('model:status-update', (data) => {
      setModelStatus(data.liveModel);
      // Show badge: "ML Enhanced" if data.liveModel.present
    });
    
    // Listen for dashboard refresh notifications
    socket.on('dashboard:data-refresh', async (data) => {
      const response = await fetch(data.endpoint);
      const freshData = await response.json();
      setDoctorData(freshData.data);
      setLastSync(new Date());
    });
    
    // Server sync pulse
    socket.on('server:sync-pulse', (data) => {
      console.log('All data synced at:', data.timestamp);
    });
    
    return () => socket.disconnect();
  }, []);
  
  return (
    <div>
      <header>
        <h1>Cardio Sentinel - Real-Time Dashboard</h1>
        <div className="status-bar">
          <span>Last Updated: {lastSync.toLocaleTimeString()}</span>
          {modelStatus?.present && (
            <span className="ml-badge">✓ ML Enhanced</span>
          )}
        </div>
      </header>
      
      {doctorData && (
        <div className="doctors-grid">
          {doctorData.doctors.map(doctor => (
            <DoctorCard key={doctor.doctorId} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## Real-Time Timer Implementation

### Backend Timer Synchronization

The server broadcasts timestamps with every message:

```javascript
// Every 10 seconds - Dashboard data refresh
{
  "timestamp": "2026-03-22T14:30:00.000Z"
}

// Every 30 seconds - Model status
{
  "timestamp": "2026-03-22T14:30:30.000Z"
}

// Every 60 seconds - Sync pulse
{
  "timestamp": "2026-03-22T14:31:00.000Z"
}
```

### Frontend Timer Display

```javascript
const RealtimeTimer = ({ baseTimestamp }) => {
  const [elapsed, setElapsed] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = now - new Date(baseTimestamp);
      setElapsed(Math.floor(diff / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [baseTimestamp]);
  
  return (
    <div className="timer">
      <span>⏱️ {elapsed}s ago</span>
    </div>
  );
};
```

---

## Live Model Status Check

### When Model IS Present

```bash
# Generate training metrics file
python ml-models/train_live_future_disease_model.py

# Creates files:
# - ml-models/models/artifacts/future_disease_live_model.joblib
# - ml-models/models/artifacts/future_disease_live_model_metadata.json
```

**API Response:**
```json
{
  "liveModel": {
    "present": true,
    "status": "READY",
    "metrics": { ... training metrics ... }
  },
  "apiCapabilities": {
    "mlEnhancedPredictions": true,
    "probabilityBlending": "60% rule-based + 40% ML"
  }
}
```

### When Model NOT Present

**API Response:**
```json
{
  "liveModel": {
    "present": false,
    "status": "NOT_FOUND",
    "metrics": null
  },
  "apiCapabilities": {
    "mlEnhancedPredictions": false,
    "probabilityBlending": "100% rule-based"
  }
}
```

> **Note:** System automatically falls back to rule-based predictions. No errors or downtime.

---

## Deployment Checklist

- [ ] **Start MongoDB** - Ensure database is running
- [ ] **Start Backend** - `npm start` from backend directory
- [ ] **WebSocket Broadcast** - Check server logs for "WebSocket running"
- [ ] **Test Health Endpoint** - `GET /api/disease-prediction/live-model-status`
- [ ] **Test Doctor Dashboard** - `GET /api/live/all-doctors-realtime`
- [ ] **Test Patient Dashboard** - `GET /api/live/all-patients-realtime`
- [ ] **WebSocket Connection** - Open browser console, connect socket.io
- [ ] **Real-Time Updates** - Listen to model:status-update events
- [ ] **Frontend Integration** - Deploy dashboard with Socket.IO client

---

## Performance Tuning

### Broadcast Intervals (Configurable in server.js)

| Event | Interval | Use Case |
|-------|----------|----------|
| Model Status | 30 seconds | ML model availability checks |
| Dashboard Refresh | 10 seconds | Patient vital signs updates |
| Sync Pulse | 60 seconds | General synchronization |

### Optimization Tips

1. **Reduce emission frequency** for high-traffic deployments:
   ```javascript
   // Change from 10000ms to 15000ms (15 seconds)
   setInterval(() => { ... }, 15000);
   ```

2. **Use Socket.IO rooms** to prevent broadcast storms:
   ```javascript
   io.to('dashboard-doctor').emit(...); // Only doctors
   io.to('model-status').emit(...);     // Only subscribed clients
   ```

3. **Cache model status** to avoid repeated file system checks:
   ```javascript
   const cachedStatus = modelStatusService.getFullModelStatus();
   ```

---

## Troubleshooting

### Model Status Returns "NOT_FOUND"

**Solution:** Train the live model first

```bash
cd ml-models
python build_live_watch_report_dataset.py
python train_live_future_disease_model.py
```

### WebSocket Events Not Arriving

**Check:**
1. Client is subscribed: `socket.emit('subscribe:model-status')`
2. Server console shows: `[Socket XXX] subscribed to model status updates`
3. Browser DevTools → Network → WebSocket shows connected

### Dashboard Data is Stale

**Solution:** Implement polling fallback

```javascript
// Every 10 seconds, fetch fresh data
setInterval(async () => {
  const response = await fetch('/api/live/all-doctors-realtime', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  updateDashboard(data);
}, 10000);
```

---

## Security Considerations

1. **Authentication Required** - All endpoints protected with `protect` middleware
2. **Role-Based Access** - Doctors see all patients, patients see only themselves
3. **JWT Tokens** - WebSocket connections don't auto-inherit; pass token via query
4. **MongoDB Queries Filtered** - Patient data filtered by `assignedDoctors`

---

## Next Steps

1. **Health Dashboard UI** - Build React components for real-time display
2. **Alert System** - Trigger alerts when vitals exceed thresholds
3. **Audit Logging** - Track who viewed what data when
4. **Mobile App** - Native WebSocket support for iOS/Android
5. **Advanced Analytics** - Store time-series metrics for historical analysis

---

**Generated:** 2026-03-22
**Version:** 1.0
**Status:** Production Ready ✓
