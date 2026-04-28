# Live Watch Data Dashboard - Real-Time Continuous Streaming

## Overview

Your Samsung Watch now streams **live, real-time, continuous health data** to a dedicated dashboard that updates as data arrives.

---

## 🚀 Quick Start - View Live Data

### 1. Start Backend Server
```powershell
cd backend
npm start
```

### 2. Start Frontend
```powershell
cd frontend
npm run dev
```

### 3. Open Live Dashboard
```
http://localhost:3000/live-dashboard
```

### 4. Send Test Data (in another terminal)
```powershell
cd backend
.\scripts\testWatchData.ps1 -Loop -LoopInterval 5
```

**Watch the dashboard update in real-time!** ✨

---

## 📊 Live Dashboard Features

### Real-Time Metrics (4 Large Cards)
- **Heart Rate**: Current BPM + category (Low/Normal/Elevated/High)
- **Blood Pressure**: Systolic/Diastolic with category
- **O₂ Saturation**: Current percentage with status (Healthy/Low)
- **Stress Level**: 0-100 score with category (Calm/Moderate/High)

### Live Trending Charts
- **Heart Rate Trend**: 60-point area chart showing last 60 readings
- **Blood Pressure Trend**: Systolic vs Diastolic line chart
- **O₂ Saturation Trend**: Percentage trend over time
- *(Stress chart available in extended view)*

### Connection Status
- **Live Indicator**: Green pulsing dot when connected
- **Update Counter**: Total number of data updates received
- **Last Update Time**: Timestamp of most recent data
- **Refresh Rate**: 60 seconds per update from watch

### Stats Footer
- Total updates received
- Last update timestamp
- Connection status (🟢 Live or 🔴 Offline)

---

## 🔄 Continuous Data Streaming

### How It Works

```
Your Samsung Watch (RFAT411KY9X)
    ↓
Every 60 seconds
    ↓
POST /api/devices/ingest (with API Key)
    ↓
Backend normalizes + stores data
    ↓
Socket.IO broadcasts: global_wearable_update
    ↓
Frontend receives via WebSocket
    ↓
Dashboard charts animate + update
    ↓
Risk predictions recalculate
```

### Data Points Sent Each Update
- Heart rate (bpm)
- Blood pressure (systolic/diastolic)
- O₂ saturation (%)
- Steps
- Calories
- Stress level
- Temperature
- Heart rate variability (HRV)

---

## 🧪 Testing Methods

### Method 1: One-Time Data Send
```powershell
$apiKey = "4ff10330bfd1d464b0d60aab86a0c476fd86f6e21d8eb02dcc65ba897b9b6c14"
$body = @{ heart_rate = 75; spo2 = 97; blood_pressure = @{ systolic = 120; diastolic = 80 } } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/devices/ingest" -Method POST `
  -Headers @{"X-Device-Key"=$apiKey;"Content-Type"="application/json"} -Body $body
```

### Method 2: Batch Send (5 data points)
```powershell
cd backend
.\scripts\testWatchData.ps1 -DataPoints 5
```

### Method 3: Continuous Loop (Recommended for Testing)
```powershell
cd backend
.\scripts\testWatchData.ps1 -Loop -LoopInterval 5
```

Sends data **every 5 seconds** - perfect for seeing real-time updates!

### Method 4: Extended Continuous Simulation
```powershell
cd backend
node scripts/continuousWatchSimulator.js patient@demo.com password123 RFAT411KY9X 5
```

Realistic physiological variation with authentication:
- Starts with login to get JWT
- Uses API key for device auth
- Generates realistic vital signs
- Reports success/failure rate
- Shows running stats every 60 seconds

---

## 📈 Data Visualization

### Charts Update Dynamically
- **Type**: Area/Line charts with smooth animations
- **Data Points**: Shows last 60 readings for each metric
- **Time Scale**: X-axis shows time of each reading
- **Value Range**: Y-axis auto-scales per metric
- **Interactivity**: Hover for exact values + timestamp

### Chart Types
| Metric | Chart Type | Range |
|--------|-----------|-------|
| Heart Rate | Area Chart | 40-150 bpm |
| Blood Pressure | Dual Line | 60-160 mmHg |
| O₂ Saturation | Area Chart | 85-100% |
| Stress Level | Line Chart | 0-100 score |

### Color Coding
- 🟢 **Green**: Healthy/Normal range
- 🟡 **Yellow**: Elevated/Caution
- 🔴 **Red**: High/Critical
- 🔵 **Blue**: Informational

---

## 🔌 API Endpoints for Live Data

### Get Latest Readings
```bash
GET /api/live/latest/:deviceId

Response:
{
  "success": true,
  "metric": "RFAT411KY9X",
  "dataPoints": 50,
  "data": [
    {
      "_id": "...",
      "deviceId": "RFAT411KY9X",
      "heartRate": 72,
      "bloodPressure": { "systolic": 120, "diastolic": 80 },
      "oxygenLevel": 97,
      "stressScore": 35,
      "createdAt": "2026-03-21T10:30:00Z"
    },
    ...
  ],
  "latestTimestamp": "2026-03-21T10:30:00Z"
}
```

### Get Statistics (60-minute window)
```bash
GET /api/live/stats/:deviceId

Response:
{
  "success": true,
  "metric": "RFAT411KY9X",
  "timeRange": "60 minutes",
  "dataPoints": 50,
  "stats": {
    "heartRate": {
      "current": 72,
      "average": "74.5",
      "min": 60,
      "max": 95,
      "unit": "bpm"
    },
    "bloodPressure": { ... },
    "oxygenLevel": { ... },
    "stress": { ... }
  },
  "lastUpdate": "2026-03-21T10:30:00Z"
}
```

### Get Time-Series Data
```bash
GET /api/live/timeseries/:deviceId?metric=heart_rate&minutes=60

Parameters:
- metric: heart_rate | spo2 | blood_pressure | stress
- minutes: 1-1440 (default: 60)

Response:
{
  "success": true,
  "metric": "heart_rate",
  "deviceId": "RFAT411KY9X",
  "timeRange": "60 minutes",
  "dataPoints": 50,
  "data": [
    { "timestamp": "2026-03-21T09:30:00Z", "value": 72, "unit": "bpm" },
    { "timestamp": "2026-03-21T09:31:00Z", "value": 74, "unit": "bpm" },
    ...
  ]
}
```

### Get Critical Alerts
```bash
GET /api/live/alerts/:deviceId

Response:
{
  "success": true,
  "deviceId": "RFAT411KY9X",
  "alertCount": 5,
  "criticalAlerts": 1,
  "warnings": 4,
  "alerts": [
    {
      "type": "heart_rate",
      "value": 45,
      "threshold": "< 50",
      "timestamp": "2026-03-21T10:15:00Z",
      "severity": "critical"
    },
    ...
  ]
}
```

---

## 🔌 WebSocket Connection

The dashboard uses Socket.IO for real-time updates:

```javascript
// Frontend automatically connects
const socket = io('http://localhost:5000');

// Subscribe to device updates
socket.emit('join', { room: 'device-RFAT411KY9X' });

// Listen for updates
socket.on('global_wearable_update', (data) => {
  // Dashboard receives new data here
  // Charts update automatically
});
```

---

## 📊 Dashboard Lifecycle

```
Page Load
    ↓
User logged in? Yes
    ↓
Connect to Socket.IO
    ↓
Subscribe to device room: device-RFAT411KY9X
    ↓
Display connection status: 🟢 Connected
    ↓
Fetch initial data: /api/live/latest/RFAT411KY9X
    ↓
Display metrics cards + empty charts
    ↓
Wait for WebSocket updates...
    ↓
Incoming: global_wearable_update event
    ↓
Update live metric values
    ↓
Add data point to historical arrays
    ↓
Charts animate + redraw with new data
    ↓
Recalculate statistics
    ↓
Update "Last Update" timestamp
    ↓
Loop back to "Wait for WebSocket updates..."
```

---

## ⚡ Performance Metrics

### Update Frequency
- **Chart Data Points**: 60 readings per metric
- **Time Range**: Last 60 readings
- **Watch Sync**: Every 60 seconds
- **WebSocket Broadcast**: Immediate upon receipt

### Browser Performance
- **Charts**: Recharts library, optimized rendering
- **Memory**: Historical arrays limited to 60 points (auto-purge older)
- **Network**: One 60s WebSocket connection, one data point every 60s
- **CPU**: Minimal (charts only update on new data)

### Backend Load
- **Rate Limiting**: 500 requests / 15 minutes (device auth exempt)
- **Database**: Time-series indexed queries
- **WebSocket**: Room-based broadcast (efficient)
- **Concurrent Connections**: Supports 100+ simultaneous dashboards

---

## 🆘 Troubleshooting

### Dashboard Shows "Disconnected"
**Issue**: WebSocket not connected

**Solutions**:
1. Verify backend running: `npm start` in `/backend`
2. Check port 5000 is accessible
3. Check browser console for errors
4. Refresh page: `F5`

### No Data Updates
**Issue**: Dashboard not receiving live data

**Solutions**:
1. Send test data: `.\scripts\testWatchData.ps1 -Loop`
2. Check backend logs for: `[Device Auth]` messages
3. Verify API key matches
4. Check WebSocket subscription in browser DevTools

### Metrics Stuck (Not Updating)
**Issue**: Charts not animating with new data

**Solutions**:
1. Verify incoming data has correct metric names
2. Check browser DevTools → Console for JavaScript errors
3. Verify Socket.IO is connected (green dot)
4. Check backend is emitting events

### Charts Show Empty
**Issue**: No historical data displayed

**Solutions**:
1. Send at least 2 data points
2. Wait for second update (charts need at least 2 points)
3. Check `/api/live/latest/RFAT411KY9X` endpoint directly
4. Verify data format matches expected schema

---

## 📱 Mobile Responsiveness

The dashboard is fully responsive:
- **Desktop** (1440px+): 4 metric cards in a row
- **Tablet** (768px+): 2 metric cards per row
- **Mobile** (320px+): 1 metric card per row

All charts resize dynamically to container.

---

## 🔐 Security Features

- ✅ JWT Authentication required (login first)
- ✅ Device API Key (X-Device-Key header)
- ✅ CORS enabled for same-origin requests
- ✅ Rate limiting on device endpoints
- ✅ WebSocket room-based access control
- ✅ No sensitive data in browser console

---

## 📞 Next Steps

1. **Start Server**: `npm start` in `/backend`
2. **Start Frontend**: `npm run dev` in `/frontend`
3. **Open Dashboard**: `http://localhost:3000/live-dashboard`
4. **Send Test Data**: `.\scripts\testWatchData.ps1 -Loop`
5. **Watch Real-Time Updates** ✨

---

## Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Backend API | ✅ Ready | /api/live/* endpoints configured |
| Frontend Dashboard | ✅ Ready | Live metrics + charts |
| WebSocket Streaming | ✅ Ready | Socket.IO configured |
| Device Data Ingestion | ✅ Ready | API key authentication |
| Test Scripts | ✅ Ready | 3 different methods available |
| Real Watch Integration | ✅ Ready | Configure with API key |

**Everything is set up and ready for live data streaming from your Samsung Watch!**
