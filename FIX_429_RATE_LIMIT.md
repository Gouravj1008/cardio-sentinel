# Fix: 429 Rate Limit Error After Login

## Problem Resolved ✓

The "Request failed with status code 429" error was caused by the backend rate limiter blocking requests after multiple unauthenticated attempts.

### Root Cause
1. Watch simulator was sending requests without authentication (401 errors)
2. Each failed request counted toward the global rate limit (100 requests per 10 minutes)
3. After ~100 requests, the rate limiter blocked with 429 (Too Many Requests)

## Solution Implemented

### 1. **New Authenticated Watch Simulator** 
   - File: `backend/scripts/watchSimulatorAuth.js`
   - **First authenticates** with email/password to get JWT token
   - **Then sends authenticated data** using the token
   - No more 401s = no more 429s

### 2. **Improved Rate Limiting**
   - Global limit increased from 100 to **500 requests per 15 minutes**
   - **Separate auth limiter**: 10 failed login attempts per 15 min
   - Successful logins don't count against the limit
   - File changed: `backend/server.js` and `backend/routes/authRoutes.js`

### 3. **Demo Patient Account**
   - Added `patient@demo.com` / `password123` to seed script
   - File: `backend/utils/seed.js`

### 4. **Documentation**
   - Setup guide: `backend/SIMULATOR_SETUP.md`

## Quick Start (No More 429 Errors)

### Step 1: Create Demo Patient (One Time)

If you haven't already seeded the database, create the demo patient:

```bash
cd backend
npm run seed
# Or directly:
node utils/seed.js
```

**Expected output:**
```
✅ Seed data created successfully
```

**Demo credentials created:**
- Email: `patient@demo.com`
- Password: `password123`

### Step 2: Start Backend

```bash
cd backend
node server.js
# Or: npm start
```

### Step 3: Run Authenticated Simulator

In a new terminal:

```bash
cd backend
node scripts/watchSimulatorAuth.js
```

**Now it works!** Output:
```
► Authenticating...
✓ Authentication successful
  Token: eyJhbGc...
  Patient ID: 65a1b2c3...

▶ Simulator starting (sending every 5000ms)...

[13:45:22] ✓ Data sent (1)
[13:45:27] ✓ Data sent (2)
[13:45:32] ✓ Data sent (3)
```

**No 401 errors. No 429 errors.**

## Custom Credentials

Use different patient account:

```bash
node scripts/watchSimulatorAuth.js rahul@test.com Test@123 watch-001 5000
```

Arguments:
```
watchSimulatorAuth.js [email] [password] [deviceId] [intervalMs]
```

## Files Changed

| File | Change |
|------|--------|
| `backend/scripts/watchSimulatorAuth.js` | **NEW** - Authenticated simulator with login flow |
| `backend/server.js` | Updated rate limiter (500/15min instead of 100/10min) |
| `backend/routes/authRoutes.js` | Added auth-specific rate limiters (10 failed logins per 15min) |
| `backend/utils/seed.js` | Added demo patient account |
| `backend/SIMULATOR_SETUP.md` | **NEW** - Complete setup guide |

## Rate Limits After Fix

| Endpoint | Limit |
|----------|-------|
| Global (all endpoints) | 500 requests / 15 min |
| Login (failed attempts) | 10 failed / 15 min |
| Registration | 5 attempts / 60 min |

**Successful logins don't count** - you can retry after a failed attempt without hitting the limit.

## Testing Now

### Frontend + Backend Real-Time Integration

1. **Start backend** (watch simulator running):
   ```bash
   node scripts/watchSimulatorAuth.js patient@demo.com password123 watch-001 3000
   ```

2. **Start frontend** (in new terminal, frontend directory):
   ```bash
   npm run dev
   ```

3. **Open frontend**, click heart → **FUTURE_RISK_AI**

4. **Click "Live Mode"**, enter patient ID

5. **Watch predictions update** in real-time as simulator sends data

## Verification Checklist

- ✅ Backend server running without errors
- ✅ Demo patient created via seed
- ✅ Authenticated simulator shows "✓ Authentication successful"
- ✅ Simulator shows "✓ Data sent" (no 401/429 errors)
- ✅ Frontend receives live wearable data
- ✅ Risk predictions update automatically

## Still Getting 429?

If you're still seeing 429 errors:

1. **Make sure you're using the NEW simulator**:
   - Use `watchSimulatorAuth.js` (not old `watchSimulator.js`)
   
2. **Check you're authenticated**:
   - You should see: `✓ Authentication successful`
   
3. **Wait 15 minutes** if you've hit the limit:
   - Rate window is 15 minutes (not 10)
   
4. **Verify backend was restarted**:
   - Changes to `server.js` require server restart

## What This Means for Your System

- Watch can now connect reliably without auth errors
- Frontend gets live data via WebSocket
- Risk predictions update in real-time
- No more rate limit blocking legitimate requests
- Ready for production testing with actual wearables

## Next Steps

1. ✅ Seed database: `npm run seed`
2. ✅ Start backend: `node server.js`
3. ✅ Run simulator: `node scripts/watchSimulatorAuth.js`
4. ✅ Start frontend: `npm run dev`
5. ✅ Test live predictions in UI

## See Also

- **Setup Details**: [backend/SIMULATOR_SETUP.md](./SIMULATOR_SETUP.md)
- **WebSocket Architecture**: [WEBSOCKET_WATCH_INTEGRATION.md](../WEBSOCKET_WATCH_INTEGRATION.md)
- **Rate Limiter Config**: [backend/server.js](./server.js) (lines ~94-110)
- **Auth Limiter Config**: [backend/routes/authRoutes.js](./routes/authRoutes.js) (lines ~11-27)
