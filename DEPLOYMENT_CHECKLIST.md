# Chatbot Deployment Checklist

## Pre-Deployment Verification

Before deploying the Cardio Sentinel Chatbot system to production, verify each item below.

---

## ✅ Step 1: File Verification

### Backend Files Created
- [ ] `backend/models/ChatMessage.js` (400+ lines)
  - [ ] Contains intent, entities, messageType, aiContext fields
  - [ ] Has indexes on conversation+date, sender+date, intent
  - [ ] Mongoose schema properly exported

- [ ] `backend/models/Conversation.js` (450+ lines)
  - [ ] Contains participants array with role tracking
  - [ ] Has patientHealthContext snapshot
  - [ ] Has aiContext for system messages
  - [ ] Mongoose schema properly exported

- [ ] `backend/services/chatbotService.js` (900+ lines)
  - [ ] Contains `recognizeIntent()` method
  - [ ] Contains `extractEntities()` method
  - [ ] Contains `getPatientRealtimeData()` method
  - [ ] Contains `assessPatientRisk()` method
  - [ ] Contains all 8 intent handler methods
  - [ ] Contains `generateDoctorResponse()` method
  - [ ] Module.exports ChatbotService class

- [ ] `backend/controllers/chatController.js` (600+ lines)
  - [ ] Contains 12+ endpoint handler methods
  - [ ] All methods have try-catch error handling
  - [ ] sendMessage() includes auto-reply for patient_bot
  - [ ] generateAIResponse() role-based response
  - [ ] Module.exports all handler methods

- [ ] `backend/routes/chatRoutes.js` (50+ lines)
  - [ ] All routes protected with auth middleware
  - [ ] Doctor-only routes have authorization check
  - [ ] Routes properly mounted in server.js

### Documentation Files Created
- [ ] `CHATBOT_DOCUMENTATION.md` (1000+ lines)
  - [ ] Contains architecture diagrams
  - [ ] Contains usage examples
  - [ ] Contains API reference
  - [ ] Contains deployment guide

- [ ] `CHATBOT_QUICKSTART.md` (This file was just created)
  - [ ] Contains quick setup steps
  - [ ] Contains test commands with curl
  - [ ] Contains expected responses

- [ ] `CHATBOT_TEST_SCENARIOS.md` (Just created)
  - [ ] Contains 9 end-to-end scenarios
  - [ ] Contains expected AI responses
  - [ ] Contains test automation script

---

## ✅ Step 2: Server Configuration

### server.js Integration
```bash
# Verify in backend/server.js around line 198+
grep -n "require('./routes/chatRoutes')" backend/server.js
```
- [ ] Chat routes imported: `var chatRoutes = require('./routes/chatRoutes');`
- [ ] Chat routes mounted: `app.use('/api/chat', chatRoutes);`
- [ ] Socket.IO handlers added (50+ lines)
  - [ ] subscribe:conversation handler
  - [ ] message:new emit
  - [ ] typing:start/stop handlers
  - [ ] alert:patient emit for doctors

### Dependencies Installed
```bash
cd backend
npm list mongoose express socket.io
```
- [ ] mongoose: ^7.0.0+
- [ ] express: ^4.18.0+
- [ ] socket.io: ^4.5.0+
- [ ] axios: ^1.3.0+

No new packages needed - all use existing dependencies!

---

## ✅ Step 3: Database Verification

### MongoDB Collections
```bash
# Connect to MongoDB and run:
db.createCollection('chatmessages')
db.createCollection('conversations')

# Create indexes
db.chatmessages.createIndex({ "conversationId": 1, "createdAt": -1 })
db.chatmessages.createIndex({ "senderId": 1, "createdAt": -1 })
db.chatmessages.createIndex({ "intent": 1 })
db.chatmessages.createIndex({ "isAIGenerated": 1 })

db.conversations.createIndex({ "doctorId": 1, "patientId": 1 })
db.conversations.createIndex({ "participants.userId": 1 })
db.conversations.createIndex({ "status": 1, "createdAt": -1 })
db.conversations.createIndex({ "priority": 1, "createdAt": -1 })
```

- [ ] `chatmessages` collection created
  - [ ] Primary index: conversation+date ✅
  - [ ] Secondary indexes created
  
- [ ] `conversations` collection created
  - [ ] Primary index: doctor+patient ✅
  - [ ] Secondary indexes created

- [ ] Test connection:
```bash
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected')).catch(e => console.error('❌', e))"
```

---

## ✅ Step 4: Environment Variables

### .env Configuration
```bash
# backend/.env or .env.local
NODE_ENV=development

# Server
PORT=5000
SERVER_URL=http://localhost:5000

# Database
MONGODB_URI=mongodb://localhost:27017/cardio-sentinel
# OR for cloud:
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/cardio-sentinel

# JWT
JWT_SECRET=your-secret-key-min-32-characters
JWT_EXPIRE=7d

# ML Model Path
ML_MODEL_PATH=./models/cardio_sentinel_model.joblib
# OR if external:
ML_MODEL_URL=https://your-ml-service.com/predict

# Logging
LOG_LEVEL=info
ENABLE_AUDIT_LOG=true

# Alert Thresholds
CRITICAL_RISK_THRESHOLD=0.80
HIGH_RISK_THRESHOLD=0.60
MODERATE_RISK_THRESHOLD=0.40
```

- [ ] .env file created in backend/
- [ ] MONGODB_URI set and tested
- [ ] JWT_SECRET configured (32+ characters)
- [ ] ML_MODEL_PATH points to trained model
- [ ] PORT configured (default 5000)
- [ ] LOG_LEVEL set to 'info'

### Verify Variables Loaded
```bash
cd backend
node -e "require('dotenv').config(); console.log('NODE_ENV:', process.env.NODE_ENV); console.log('PORT:', process.env.PORT)"
```

---

## ✅ Step 5: Model Integration

### Trained ML Model
- [ ] Cardio Sentinel model file exists
  - [ ] Path: `models/cardio_sentinel_model.joblib`
  - [ ] OR accessible via API endpoint
  - [ ] Size: ~50MB
  - [ ] Type: RandomForestClassifier (scikit-learn)

### Model Features (11 core)
```javascript
const features = [
  'heart_rate',         // bpm
  'systolic_bp',        // mmHg
  'diastolic_bp',       // mmHg
  'oxygen_saturation',  // %
  'age',                // years
  'bmi',                // kg/m²
  'cholesterol',        // mg/dL
  'blood_sugar',        // mg/dL
  'smoking_status',     // binary
  'family_history',     // binary
  'activity_level'      // 0-10 scale
];
```

- [ ] All 11 features available from real-time data
- [ ] Test model loads without errors:
```bash
python -c "import joblib; model = joblib.load('models/cardio_sentinel_model.joblib'); print('✅ Model loaded'); print('Features:', model.n_features_in_)"
```

### Test Prediction
```javascript
// In chatbotService.js test
const testFeatures = [75, 120, 80, 96, 50, 25.5, 200, 100, 0, 1, 5];
const prediction = await diseasePredictionService.predict(testFeatures);
console.log('✅ Prediction received:', prediction);
// Expected: { riskLevel: 'LOW'|'MODERATE'|'HIGH'|'CRITICAL', probability: 0-1 }
```

- [ ] Model makes predictions without errors
- [ ] Predictions return risk level + probability
- [ ] Confidence score available
- [ ] Fallback service works if model unavailable

---

## ✅ Step 6: Real-Time Data Sources

### Data Collection Verification
```javascript
// Test in chatbotService.getPatientRealtimeData()
const testPatientId = '507f1f77bcf86cd799439012';
const data = await chatbotService.getPatientRealtimeData(testPatientId);
```

- [ ] **WearableData** collection
  - [ ] Records exist for test patient
  - [ ] Contains: HR, O2, BP, temp, stress, sleep, steps
  - [ ] Data < 2 hours old (fresh)
  - [ ] At least 10 records in last 24h

- [ ] **HealthRecord** collection
  - [ ] Latest record exists for patient
  - [ ] Contains: vitals, labs, medications
  - [ ] Date field populated
  - [ ] Accessible within 100ms

- [ ] **Report** collection
  - [ ] Recent medical reports exist
  - [ ] Contains: type, findings, date
  - [ ] ECG/Lab/Imaging reports available
  - [ ] Query returns results in <200ms

- [ ] **User** collection (Profile)
  - [ ] Patient profile exists
  - [ ] Contains: age, gender, medical history
  - [ ] Demographics populated

### Test Data Freshness
```bash
# Should return data < 5 minutes old
curl http://localhost:5000/api/chat/patients/PATIENT_ID/context \
  -H "Authorization: Bearer TOKEN"
```

- [ ] Vitals timestamp < 2 hours
- [ ] Wearable data timestamp < 24 hours
- [ ] Labs timestamp < 30 days
- [ ] All timestamps included in response

---

## ✅ Step 7: Intent Recognition Testing

### Pattern Matching Tests
```bash
# Test each intent type
curl -X POST http://localhost:5000/api/chat/messages \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"CONV_ID","content":"chest pain"}'
# Expected: intent: "symptom_inquiry"
```

Test Cases:
- [ ] **symptom_inquiry**: "chest pain", "shortness of breath", "dizzy" (0.90+ confidence)
- [ ] **vital_check**: "What is my heart rate?", "Check my O2" (0.85+ confidence)
- [ ] **medication_question**: "Should I take aspirin?", "Side effects?" (0.85+ confidence)
- [ ] **risk_assessment**: "Am I at risk?", "Predict disease" (0.80+ confidence)
- [ ] **lifestyle_advice**: "How to improve health?", "Exercise tips?" (0.80+ confidence)
- [ ] **report_explanation**: "What does my ECG mean?" (0.85+ confidence)
- [ ] **emergency_alert**: "SEVERE chest pain!", "Can't breathe!" (0.95+ confidence)
- [ ] **appointment**: "Schedule appointment", "Book doctor visit" (0.85+ confidence)

- [ ] All intents recognized with 80%+ confidence
- [ ] Confidence scores returned
- [ ] Fallback to general response if confidence < 50%

---

## ✅ Step 8: Real-Time Communication

### Socket.IO Testing
```javascript
// Client-side test
const io = require('socket.io-client');
const socket = io('http://localhost:5000', {
  auth: { token: 'YOUR_TOKEN' }
});

socket.on('connect', () => {
  console.log('✅ Connected');
  socket.emit('subscribe:conversation', 'CONVERSATION_ID');
});

socket.on('message:received', (msg) => {
  console.log('✅ New message:', msg);
});

socket.on('typing:started', (data) => {
  console.log('✅ User typing:', data.userId);
});
```

- [ ] WebSocket connection established
- [ ] Subscribe to conversation
- [ ] Receive message:received event
- [ ] Receive typing indicators
- [ ] Doctor alert notifications working

### Message Delivery Test
```bash
# 1. Send message via HTTP
curl -X POST http://localhost:5000/api/chat/messages ...

# 2. Should receive via WebSocket within 1 second
# socket.on('message:received', ...) fires

# 3. Check message count incremented
curl http://localhost:5000/api/chat/conversations/CONV_ID
# messageCount should increase
```

- [ ] HTTP message send returns immediately
- [ ] WebSocket event fires within 1 second
- [ ] Message appears in getMessages()
- [ ] Socket rooms working (conversation-specific)

---

## ✅ Step 9: API Endpoint Validation

### Test All 12+ Endpoints

#### Conversation Management
```bash
# 1. Start Conversation
curl -X POST http://localhost:5000/api/chat/conversations/start \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"conversationType":"patient_bot"}'
# Expected: 200 OK, conversationId returned
- [ ] Returns 200 OK
- [ ] Returns conversationId
- [ ] Creates conversation object
- [ ] Sets correct type (patient_bot, one_on_one, etc.)

# 2. Get Conversations (List)
curl "http://localhost:5000/api/chat/conversations?limit=10&offset=0" \
  -H "Authorization: Bearer TOKEN"
# Expected: 200 OK, array of conversations
- [ ] Returns conversations array
- [ ] Includes pagination info (total, limit, offset)
- [ ] Filters by status if provided
- [ ] Sorts by latest update

# 3. Get Specific Conversation
curl http://localhost:5000/api/chat/conversations/CONV_ID \
  -H "Authorization: Bearer TOKEN"
# Expected: 200 OK, full conversation object
- [ ] Returns conversation details
- [ ] Checks access control (user is participant)
- [ ] Marks as read
- [ ] Populates all references
```

#### Message Operations
```bash
# 4. Send Message
curl -X POST http://localhost:5000/api/chat/messages \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"CONV_ID","content":"test message"}'
# Expected: 201 Created
- [ ] Returns 201 Created
- [ ] Message stored in database
- [ ] Intent recognized
- [ ] Entities extracted
- [ ] Auto-reply generated (patient_bot only)

# 5. Get Messages (Paginated)
curl "http://localhost:5000/api/chat/conversations/CONV_ID/messages?limit=50" \
  -H "Authorization: Bearer TOKEN"
# Expected: 200 OK, message array
- [ ] Returns messages array
- [ ] Pagination working (limit, offset)
- [ ] Messages sorted by date (oldest first)
- [ ] Auto-marked as read
- [ ] Total count returned
```

#### AI Features
```bash
# 6. Generate AI Response (without storing)
curl -X POST http://localhost:5000/api/chat/ai/response \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"CONV_ID","content":"chest pain","userRole":"patient"}'
# Expected: 200 OK, response object
- [ ] Returns intent classification
- [ ] Returns entity extraction
- [ ] Returns AI response text
- [ ] Returns messageType
- [ ] Returns confidence score
- [ ] Does NOT store message

# 7. Get Patient Data Context
curl http://localhost:5000/api/chat/patients/PATIENT_ID/context \
  -H "Authorization: Bearer TOKEN"
# Expected: 200 OK, patient dashboard data
- [ ] Returns current vitals
- [ ] Returns 24h wearable stats
- [ ] Returns lab values
- [ ] Returns risk assessment
- [ ] Returns data freshness timestamps
- [ ] Completes in < 1 second

# 8. Provide Health Recommendation
curl -X POST http://localhost:5000/api/chat/recommendations \
  -H "Authorization: Bearer DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"patientId":"PATIENT_ID","category":"lifestyle"}'
# Expected: 200 OK, recommendation text
- [ ] Doctor-only endpoint (RBAC works)
- [ ] Returns category-specific advice
- [ ] Returns patient context
- [ ] Personalized to patient health status
```

#### Conversation Management (Advanced)
```bash
# 9. Update Conversation
curl -X PUT http://localhost:5000/api/chat/conversations/CONV_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"closed","summary":"Patient improved"}'
# Expected: 200 OK
- [ ] Updates metadata
- [ ] Logs audit event
- [ ] Returns updated conversation

# 10. Close/Archive Conversation
curl -X POST http://localhost:5000/api/chat/conversations/CONV_ID/close \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Patient discharged"}'
# Expected: 200 OK
- [ ] Sets status to 'closed'
- [ ] Stores reason
- [ ] Generates summary
- [ ] Logs audit event

# 11. Search Conversations
curl "http://localhost:5000/api/chat/conversations/search?q=chest+pain&type=patient_bot" \
  -H "Authorization: Bearer TOKEN"
# Expected: 200 OK, matching conversations
- [ ] Full-text search works
- [ ] Filters by type
- [ ] Returns count + results

# 12. Get Statistics
curl http://localhost:5000/api/chat/conversations/stats \
  -H "Authorization: Bearer TOKEN"
# Expected: 200 OK, aggregated stats
- [ ] Returns counts by status
- [ ] Returns counts by priority
- [ ] Returns counts by type
```

---

## ✅ Step 10: Role-Based Access Control

### Test Authorization Checks

```bash
# Patient trying to access other patient's conversation
curl http://localhost:5000/api/chat/conversations/OTHER_PATIENT_CONV \
  -H "Authorization: Bearer PATIENT1_TOKEN"
# Expected: 403 Forbidden
- [ ] Returns 403 Forbidden
- [ ] Does not expose conversation data

# Patient trying to access doctor-only endpoint
curl -X POST http://localhost:5000/api/chat/recommendations \
  -H "Authorization: Bearer PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"patientId":"X","category":"lifestyle"}'
# Expected: 403 Forbidden
- [ ] Returns 403 Forbidden
- [ ] Doctor can access same endpoint

# Doctor can only see assigned patients
curl "http://localhost:5000/api/chat/conversations/search?patientId=UNASSIGNED_PATIENT" \
  -H "Authorization: Bearer DOCTOR_TOKEN"
# Expected: 403 Forbidden or no results
- [ ] Doctor cannot see unassigned patient data

- [ ] Patient access control working
- [ ] Doctor access control working
- [ ] Role validation on all endpoints
- [ ] No data leakage between users
```

---

## ✅ Step 11: Error Handling

### Test Error Responses

```bash
# 1. Missing required field
curl -X POST http://localhost:5000/api/chat/messages \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"test"}'
# Expected: 400 Bad Request
- [ ] Returns 400 Bad Request
- [ ] Error message clear
- [ ] Details which field is missing

# 2. Invalid conversation ID
curl http://localhost:5000/api/chat/conversations/invalid_id \
  -H "Authorization: Bearer TOKEN"
# Expected: 404 Not Found
- [ ] Returns 404 Not Found
- [ ] Error message: "Conversation not found"

# 3. ML model unavailable
# Stop ML service or break connection
curl -X POST http://localhost:5000/api/chat/messages \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"CONV_ID","content":"am I at risk?"}'
# Expected: 200 OK with fallback response
- [ ] Returns 200 OK (not 500)
- [ ] Uses fallback rule-based assessment
- [ ] Message includes note: "Rule-based assessment (model unavailable)"

# 4. Database connection lost
curl http://localhost:5000/api/chat/conversations \
  -H "Authorization: Bearer TOKEN"
# Expected: 500 Internal Server Error
- [ ] Returns 500 with error message
- [ ] Logs error to console
- [ ] Does not expose internal details

- [ ] All error codes correct
- [ ] Error messages helpful
- [ ] Graceful fallbacks working
- [ ] No sensitive data in errors
```

---

## ✅ Step 12: Performance & Load Testing

### Response Time Benchmarks
```bash
# Test message send performance
time curl -X POST http://localhost:5000/api/chat/messages \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '...'
```

- [ ] Message send: < 500ms total
- [ ] Intent recognition: < 50ms
- [ ] Entity extraction: < 100ms
- [ ] Data aggregation: < 300ms
- [ ] ML prediction: < 200ms
- [ ] Response generation: < 100ms
- [ ] Database write: < 100ms

### Load Test (Simple)
```bash
# Using Apache Bench (install: apt-get install apache2-utils)
ab -n 100 -c 10 \
  -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/chat/conversations

# Should handle 10 concurrent requests
```

- [ ] Handles 10 concurrent requests
- [ ] No dropped requests
- [ ] Response times consistent
- [ ] CPU usage < 80%
- [ ] Memory usage stable

---

## ✅ Step 13: Security Verification

### JWT Token Validation
```bash
# Request without token
curl http://localhost:5000/api/chat/conversations
# Expected: 401 Unauthorized
- [ ] Returns 401 Unauthorized
- [ ] Message: "No token provided" or "Token required"

# Request with invalid token
curl http://localhost:5000/api/chat/conversations \
  -H "Authorization: Bearer invalid_token_xyz"
# Expected: 401 Unauthorized
- [ ] Returns 401 Unauthorized
- [ ] Message: "Invalid token" or similar

# Request with expired token
# Use old JWT token
# Expected: 401 Unauthorized
- [ ] Returns 401 Unauthorized
- [ ] Message: "Token expired"

- [ ] JWT validation working
- [ ] No access without token
- [ ] No access with bad token
- [ ] Token expiration enforced
```

### Audit Logging
```bash
# Check audit logs
tail -n 50 logs/audit.log
# Should show all CRUD operations
```

- [ ] Audit logs created for:
  - [ ] Conversation creation
  - [ ] Message sends
  - [ ] Data access (patient context)
  - [ ] Conversation closures
- [ ] Logs include: timestamp, userId, action, resource, status
- [ ] Logs stored securely (cannot be modified by user)

### Input Validation
```bash
# Test SQL injection attempt
curl -X POST http://localhost:5000/api/chat/messages \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"x\"); DROP TABLE chatmessages;//","content":"x"}'
# Expected: 400 Bad Request (invalid format) or 404 (no conversation)
- [ ] SQL injection blocked
- [ ] Invalid formats rejected
- [ ] No direct database access possible
```

---

## ✅ Step 14: Documentation Review

### Code Documentation
- [ ] **ChatMessage.js**: JSDoc comments on all methods
- [ ] **Conversation.js**: JSDoc comments on all fields
- [ ] **chatbotService.js**: JSDoc comments on all 15+ methods
- [ ] **chatController.js**: JSDoc comments on all 12+ handlers
- [ ] **chatRoutes.js**: Comments explaining each route

### External Documentation
- [ ] **CHATBOT_DOCUMENTATION.md**: Complete 1000+ line guide
  - [ ] Architecture diagram included
  - [ ] Usage examples (3 scenarios)
  - [ ] API reference with response examples
  - [ ] WebSocket event documentation
  - [ ] ML model integration details
  - [ ] Deployment checklist
  - [ ] Future roadmap

- [ ] **CHATBOT_QUICKSTART.md**: Quick setup guide
  - [ ] Installation steps
  - [ ] How to run
  - [ ] Testing examples (curl commands)
  - [ ] Troubleshooting section
  - [ ] Production deployment

- [ ] **CHATBOT_TEST_SCENARIOS.md**: 9 detailed test scenarios
  - [ ] Expected AI responses
  - [ ] User flows documented
  - [ ] Test automation script included

---

## ✅ Step 15: Final Integration Test

### End-to-End Flow Test

**Scenario: Patient Reports Symptoms**

1. ✅ Start patientbot conversation
   ```bash
   curl -X POST http://localhost:5000/api/chat/conversations/start \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"conversationType":"patient_bot"}'
   ```
   Expected: 201 Created with conversationId

2. ✅ Patient sends symptom message
   ```bash
   curl -X POST http://localhost:5000/api/chat/messages \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"conversationId":"CONV_ID","content":"I have chest pain"}'
   ```
   Expected: 201 Created, intent=symptom_inquiry

3. ✅ Retrieve messages (should include AI response)
   ```bash
   curl "http://localhost:5000/api/chat/conversations/CONV_ID/messages" \
     -H "Authorization: Bearer TOKEN"
   ```
   Expected: Array with 2 messages (patient + AI)

4. ✅ WebSocket receives message in real-time
   - Socket.io 'message:received' event fires
   - Message appears immediately on client

5. ✅ Doctor can see patient context
   ```bash
   curl http://localhost:5000/api/chat/patients/PATIENT_ID/context \
     -H "Authorization: Bearer DOCTOR_TOKEN"
   ```
   Expected: 200 OK with full patient dashboard

6. ✅ Doctor sends response
   ```bash
   curl -X POST http://localhost:5000/api/chat/messages \
     -H "Authorization: Bearer DOCTOR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"conversationId":"CONV_ID","content":"Please go to ER"}'
   ```
   Expected: 201 Created

7. ✅ Patient receives doctor message instantly via WebSocket
   - No need to refresh
   - Message appears in real-time

### Checklist
- [ ] Step 1: Conversation created ✅
- [ ] Step 2: Patient message sent ✅
- [ ] Step 3: AI response generated ✅
- [ ] Step 4: Real-time delivery working ✅
- [ ] Step 5: Doctor sees patient data ✅
- [ ] Step 6: Doctor responds ✅
- [ ] Step 7: Real-time doctor message ✅

---

## ✅ Step 16: Deployment Readiness

### Production Checklist

- [ ] All backend files created (7 files minimum)
- [ ] Database collections created and indexed (2 collections)
- [ ] Environment variables configured (.env file)
- [ ] JWT secret set (32+ characters)
- [ ] CORS configured for frontend domain
- [ ] Error handling tested (graceful fallbacks)
- [ ] Audit logging working
- [ ] Rate limiting tested (optional but recommended)
- [ ] SSL/TLS configured (for production)
- [ ] Database backups configured
- [ ] Monitoring alerts set up
- [ ] Documentation complete
- [ ] Team trained on system
- [ ] Load test passed (10+ concurrent users)
- [ ] Security audit passed
- [ ] All endpoints tested

### Go/No-Go Decision

**GO** if all ✅ above are checked
**NO-GO** if any sections have unchecked items - fix before deploying

---

## Deployment Commands

### Start Development
```bash
cd backend
npm install  # (skip if already done)
npm start
```

Expected output:
```
[2024-01-15] Starting server...
[2024-01-15] MongoDB connected: cardio-sentinel
[2024-01-15] Server & WebSocket running in development mode on port 5000
```

### Start Production
```bash
# Using PM2
npm install -g pm2
pm2 start backend/server.js --name "cardio-sentinel-api"
pm2 save
pm2 startup
```

### Verify Running
```bash
curl http://localhost:5000/health
curl http://localhost:5000/api/auth/check

# WebSocket
ws://localhost:5000 (should connect)
```

---

## Support & Troubleshooting

For issues:
1. Check CHATBOT_QUICKSTART.md → Troubleshooting section
2. Check CHATBOT_DOCUMENTATION.md → Error Handling section
3. Check server logs: `tail -f backend.log`
4. Check MongoDB: `db.chatmessages.countDocuments()`
5. Test connectivity: `curl http://localhost:5000/health`

---

**All verified?** ✅ **You're ready for production!**

For questions, see: CHATBOT_DOCUMENTATION.md
