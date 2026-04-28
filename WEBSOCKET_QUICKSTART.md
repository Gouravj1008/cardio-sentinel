# WebSocket Watch Integration - Quick Start Guide

## 5-Minute Quick Start

### 1. Prerequisites
Ensure your `backend/package.json` has `socket.io` installed:
```bash
cd backend
npm install socket.io --save
```

### 2. Start Backend Server
```bash
# Terminal 1
cd backend
npm start
# Server runs on http://localhost:5000
# Socket.IO available on ws://localhost:5000
```

### 3. Send Test Watch Data
```bash
# Terminal 2 - Run the watch simulator
cd backend
node scripts/watchSimulator.js patient-123 watch-001 5000
```

**Output:**
```
═══════════════════════════════════════════════════════════
  Cardio Sentinel - Watch/Wearable Device Simulator
═══════════════════════════════════════════════════════════
API Server: http://localhost:5000
Patient ID: patient-123
Device ID: watch-001
Update Interval: 5000ms
▶ Simulator starting...

[12:34:56] ✓ Data sent (1)
[12:35:01] ✓ Data sent (2)
```

### 4. Test Frontend Connection
In your frontend component, use the hook:

```javascript
import { useWearableWebSocket } from '../hooks/useWearableWebSocket';

function Dashboard() {
  const { data, telemetry, isConnected } = useWearableWebSocket('patient-123');

  return (
    <div>
      {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      {data && <p>Heart Rate: {data.data.heartRate} bpm</p>}
      {telemetry && <p>Risk: {telemetry.riskIndex}%</p>}
    </div>
  );
}
```

### 5. Verify in Browser Console
```javascript
// Browser DevTools Console
console.log('Socket connected:', socket.connected);
```

---

## Implementation Checklist

### Backend Setup ✓
- [x] WebSocket room subscriptions in `server.js`
- [x] Enhanced wearable controller with room-based emissions
- [x] Wearable data aggregation service
- [x] Watch simulator for testing

### Frontend Setup
- [ ] Install socket.io-client: `npm install socket.io-client`
- [ ] Add `useWearableWebSocket` hook to your project
- [ ] Create real-time vitals display component
- [ ] Connect dashboard to WebSocket events

### Environment Configuration
Add to `.env` files:

**backend/.env**
```
PORT=5000
SOCKET_IO_CORS_ORIGIN=http://localhost:3000,http://localhost:3001
WEARABLE_UPDATE_INTERVAL=5000
```

**frontend/.env**
```
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_API_URL=http://localhost:5000/api
VERBOSE=true
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      WATCH DEVICE                            │
│              (Physical or Simulated)                          │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP POST
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND NODEJS                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  POST /api/wearable/ingest                           │  │
│  │  ├─ Save to MongoDB (WearableData)                   │  │
│  │  ├─ Calculate risk metrics                           │  │
│  │  └─ Emit via Socket.IO to rooms                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                    │
│                    Socket.IO                                 │
│              ├─ to(`patient-${id}`)                         │
│              ├─ to(`device-${id}`)                          │
│              └─ emit('wearable_update', ...)                │
└────────────────┬────────────────────────────────────┬───────┘
                 │ WebSocket                           │
                 ↓                                      ↓
    ┌─────────────────────┐        ┌──────────────────────────┐
    │  BROWSER (Patient)  │        │  BROWSER (Doctor)        │
    │  ┌───────────────┐  │        │  ┌────────────────────┐  │
    │  │ useWearable   │  │        │  │  Doctor Dashboard  │  │
    │  │ WebSocket     │  │        │  │  - All patients    │  │
    │  │ Hook          │  │        │  │  - Monitor vitals  │  │
    │  └───────────────┘  │        │  └────────────────────┘  │
    │  ┌───────────────┐  │        │  ┌────────────────────┐  │
    │  │ Real-time     │  │        │  │ Alerts & Trends    │  │
    │  │ Charts        │  │        │  │                    │  │
    │  └───────────────┘  │        │  └────────────────────┘  │
    └─────────────────────┘        └──────────────────────────┘
```

---

## Troubleshooting

### WebSocket Not Connecting?
```javascript
// Browser console
window.socketDebug = true;

// Check logs for:
// [Socket] Connected - ID: xxxxx
// [Socket] Subscribed to patient: patient-123
```

**Fix options:**
1. Check CORS: Verify `SOCKET_IO_CORS_ORIGIN` includes frontend URL
2. Auth token: Ensure valid JWT in localStorage
3. Server running: Confirm `http://localhost:5000` is accessible

### Data Not Updating?

**Check backend logs:**
```
[Wearable] Data ingested - Patient: patient-123, Device: watch-001
```

**Check frontend logs:**
```javascript
// Should see these in console:
[Socket] Wearable update received: {...}
[Socket] Telemetry update received: {...}
```

### High Memory Usage?

**Solutions:**
- Reduce update frequency in simulator: `node watchSimulator.js patient-123 watch-001 10000`
- Add data retention policy in MongoDB
- Implement cleanup jobs for old records

---

## Production Deployment

### Docker Setup
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package.json .
RUN npm install --production

COPY . .

EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Variables
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cardio
SOCKET_IO_CORS_ORIGIN=https://frontend.example.com
```

### Docker Compose
```yaml
version: '3.9'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - SOCKET_IO_CORS_ORIGIN=https://frontend.example.com
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:latest
    environment:
      - MONGO_INITDB_DATABASE=cardio_sentinel

  redis:
    image: redis:latest
```

---

## Advanced Features

### 1. Room-Based Subscriptions
```javascript
// Subscribe to patient updates
socket.emit('subscribe:patient', 'patient-123');

// Subscribe to device updates
socket.emit('subscribe:device', 'watch-001');

// Unsubscribe
socket.emit('unsubscribe:patient', 'patient-123');
```

### 2. Real-Time Aggregation
```javascript
const WearableDataAggregator = require('./services/wearableDataAggregator');

// Get 1-hour stats
const stats = await WearableDataAggregator.getRealtimeStats('patient-123', 60);

// Get 7-day trends
const trends = await WearableDataAggregator.getTrends('patient-123', 7);

// Detect anomalies
const anomalies = WearableDataAggregator.detectAnomalies(currentData, stats);
```

### 3. Custom Simulator
Extend `WatchDataSimulator` for specific device behavior:
```javascript
class CustomWatchSimulator extends WatchDataSimulator {
  generateHeartRate() {
    // Custom logic for your device
    return super.generateHeartRate() + customAdjustment;
  }
}
```

---

## Next Steps

1. **Frontend Integration**: Display real-time vitals in dashboard
2. **Alert System**: Generate alerts for critical values
3. **Data Persistence**: Archive data to long-term storage
4. **ML Integration**: Add anomaly detection models
5. **Multi-Device Support**: Handle multiple watches per patient
6. **Doctor Dashboard**: Real-time monitoring of all patients

---

## Files Created/Modified

### New Files
- ✅ `backend/server.js` - Enhanced socket.io config
- ✅ `backend/controllers/wearableController.js` - Updated with room emissions
- ✅ `backend/frontend/src/hooks/useWearableWebSocket.js` - React hook
- ✅ `backend/services/wearableDataAggregator.js` - Analytics service
- ✅ `backend/scripts/watchSimulator.js` - Test simulator
- ✅ `WEBSOCKET_WATCH_INTEGRATION.md` - Full documentation

### Dependencies Required
```json
{
  "socket.io": "^4.7.0",
  "socket.io-client": "^4.7.0",
  "mongoose": "^7.0.0",
  "express": "^4.18.0",
  "axios": "^1.4.0"
}
```

---

## Support & Debugging

### Enable Verbose Logging
```javascript
// client side
localStorage.setItem('socketDebug', 'true');

// backend
process.env.DEBUG = 'socket.io:*';
```

### Monitor Real-Time Events
```bash
# Terminal
npm install -g socket.io-cli

# Test connection
socketio-cli --url http://localhost:5000 --path /socket.io
```

### Database Indexes
```javascript
// Optimize MongoDB queries
db.weardatas.createIndex({ "patient": 1, "timestamp": -1 })
db.weardatas.createIndex({ "deviceId": 1, "timestamp": -1 })
db.weardatas.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 8640000 })
```

---

## Performance Benchmarks

| Metric | Target | Notes |
|--------|--------|-------|
| Data latency | <500ms | From watch to dashboard |
| Update frequency | 5-30s | Configurable per device |
| Max concurrent patients | 1000+ | With proper scaling |
| CPU usage | <20% | Per 100 active patients |
| Memory | <500MB | For 10k stored records |

---

**Status**: Ready for testing ✓
**Last Updated**: 2025-03-21
**Version**: 1.0
