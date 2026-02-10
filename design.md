# CardioSentinel AI - System Design Document

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   React Frontend (Vite)                              │   │
│  │   - Dashboard, Login, Patient Views                  │   │
│  │   - React Router for SPA navigation                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Express.js Backend (Node.js)                       │   │
│  │   - REST API Endpoints                               │   │
│  │   - JWT Authentication                               │   │
│  │   - Rate Limiting & Security (Helmet, CORS)          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                │                           │
                ▼                           ▼
┌──────────────────────────┐   ┌──────────────────────────────┐
│   Database Layer         │   │   ML Service Layer           │
│  ┌────────────────────┐  │   │  ┌────────────────────────┐ │
│  │   MongoDB          │  │   │  │   FastAPI (Python)     │ │
│  │   - Users          │  │   │  │   - Risk Assessment    │ │
│  │   - Health Records │  │   │  │   - Trend Analysis     │ │
│  │   - Alerts         │  │   │  │   - Baseline Models    │ │
│  │   - Wearable Data  │  │   │  │   - Deviation Detection│ │
│  └────────────────────┘  │   │  └────────────────────────┘ │
└──────────────────────────┘   └──────────────────────────────┘
```

### 1.2 Microservices Architecture

**Service 1: Backend API (Node.js/Express)**
- Port: 5000
- Responsibilities: User management, health records, alerts, authentication
- Database: MongoDB

**Service 2: ML Service (Python/FastAPI)**
- Port: 8000
- Responsibilities: Risk calculation, trend analysis, baseline modeling
- Communication: REST API calls from backend

**Service 3: Database (MongoDB)**
- Port: 27017
- Responsibilities: Data persistence, indexing, replication

### 1.3 Deployment Architecture

```
Docker Compose Orchestration
├── mongo (MongoDB 6 container)
├── ml-service (Python FastAPI container)
└── backend (Node.js Express container)
```

## 2. Component Design

### 2.1 Backend Components

#### 2.1.1 Server Layer (`server.js`)
- Express application initialization
- Middleware configuration (CORS, Helmet, Rate Limiting)
- Route registration
- Error handling
- Database connection management
- Health check endpoint

#### 2.1.2 Controllers
- **authController.js**: User registration, login, token management
- **healthController.js**: Health record CRUD operations
- **alertController.js**: Alert creation, retrieval, status updates
- **dashboardController.js**: Aggregated statistics and analytics
- **doctorController.js**: Doctor-specific patient management

#### 2.1.3 Models (Mongoose Schemas)
- **User.js**: User authentication and profile data
- **HealthRecord.js**: Patient vitals, lab results, AI analysis
- **Alert.js**: Notification and alert management
- **WearableData.js**: Device data streams
- **Baseline.js**: Patient-specific normal ranges

#### 2.1.4 Middleware
- **auth.js**: JWT token verification, role-based access control
- **errorHandler.js**: Centralized error handling and logging

#### 2.1.5 Services
- **alertService.js**: Alert generation logic and notification dispatch
- **baselineService.js**: Baseline calculation and deviation detection

#### 2.1.6 Routes
- **authRoutes**: `/api/auth/*`
- **healthRoutes**: `/api/health/*`
- **alertRoutes**: `/api/alerts/*`
- **dashboardRoutes**: `/api/dashboard/*`
- **doctorRoutes**: `/api/doctor/*`

#### 2.1.7 Utilities
- **auditLogger.js**: Compliance logging for data access

### 2.2 ML Service Components

#### 2.2.1 Main Application (`main.py`)
- FastAPI application setup
- Route definitions
- CORS configuration
- Health check endpoint

#### 2.2.2 Models
- **risk_model.py**: Cardiovascular risk scoring algorithm
- **trend_model.py**: Time-series analysis for health trends
- **baseline_model.py**: Patient baseline establishment
- **deviation_model.py**: Anomaly detection

#### 2.2.3 Services
- **analyzer.py**: Orchestrates ML model execution and result aggregation

#### 2.2.4 Routes (`app/routes.py`)
- `/predict/risk`: Risk score calculation
- `/analyze/trends`: Trend detection
- `/baseline/calculate`: Baseline establishment
- `/detect/deviations`: Anomaly detection

### 2.3 Frontend Components

#### 2.3.1 Application Structure
- **App.jsx**: Main application component with routing
- **main.jsx**: Application entry point

#### 2.3.2 Pages
- **Login.jsx**: Authentication interface
- **Dashboard.jsx**: Doctor dashboard with patient overview
- **Patient.jsx**: Individual patient detail view

#### 2.3.3 API Layer
- **api.js**: Axios-based API client with interceptors

## 3. Data Flow

### 3.1 User Authentication Flow

```
1. User submits credentials → Frontend
2. POST /api/auth/login → Backend
3. Validate credentials → User Model
4. Generate JWT token → authController
5. Return token + user data → Frontend
6. Store token in localStorage → Client
7. Include token in Authorization header → Subsequent requests
```

### 3.2 Health Data Processing Flow

```
1. Doctor enters patient vitals → Frontend
2. POST /api/health/records → Backend
3. Validate and save to MongoDB → HealthRecord Model
4. Calculate BMI (pre-save hook) → Model
5. Trigger ML analysis → Backend Service
6. POST /ml/predict/risk → ML Service
7. Calculate risk score → risk_model.py
8. Return risk analysis → Backend
9. Update health record with AI analysis → MongoDB
10. Generate alerts if needed → alertService
11. Return complete record → Frontend
```

### 3.3 Alert Generation Flow

```
1. Health record created/updated → Backend
2. Check risk thresholds → alertService
3. Determine alert severity → Business logic
4. Create alert document → Alert Model
5. Save to MongoDB → Database
6. Notify assigned doctor → Notification service
7. Display on dashboard → Frontend polling/WebSocket
```

### 3.4 Dashboard Data Flow

```
1. Doctor accesses dashboard → Frontend
2. GET /api/dashboard/stats → Backend
3. Aggregate patient data → dashboardController
4. Query health records, alerts → MongoDB
5. Calculate statistics → Backend
6. Return aggregated data → Frontend
7. Render visualizations → Dashboard component
```

## 4. Database Design

### 4.1 Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: Enum['patient', 'doctor', 'admin'],
  phone: String,
  dateOfBirth: Date,
  gender: Enum['male', 'female', 'other'],
  bloodGroup: String,
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  profileImage: String,
  isActive: Boolean,
  createdAt: Date
}
```

#### HealthRecords Collection
```javascript
{
  _id: ObjectId,
  patient: ObjectId (ref: User, indexed),
  doctor: ObjectId (ref: User),
  recordDate: Date (indexed),
  vitals: {
    bloodPressure: { systolic: Number, diastolic: Number },
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number,
    bmi: Number (calculated),
    oxygenSaturation: Number
  },
  labResults: {
    bloodSugar: Number,
    cholesterol: {
      total: Number,
      ldl: Number,
      hdl: Number,
      triglycerides: Number
    },
    hemoglobin: Number
  },
  symptoms: [String],
  diagnosis: String,
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date
  }],
  notes: String,
  attachments: [{
    filename: String,
    fileUrl: String,
    fileType: String,
    uploadDate: Date
  }],
  riskScore: Number (0-100),
  aiAnalysis: {
    trendDetected: String,
    riskFactors: [String],
    recommendations: [String],
    confidence: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Alerts Collection
```javascript
{
  _id: ObjectId,
  patient: ObjectId (ref: User, indexed),
  doctor: ObjectId (ref: User, indexed),
  type: Enum['critical', 'warning', 'info'],
  category: Enum['vitals', 'medication', 'appointment', 'risk-detection'],
  title: String,
  message: String,
  isRead: Boolean (indexed),
  createdAt: Date (indexed),
  metadata: {
    healthRecordId: ObjectId,
    riskScore: Number,
    actionRequired: Boolean
  }
}
```

#### WearableData Collection
```javascript
{
  _id: ObjectId,
  patient: ObjectId (ref: User, indexed),
  deviceId: String,
  deviceType: String,
  timestamp: Date (indexed),
  data: {
    heartRate: Number,
    steps: Number,
    calories: Number,
    sleepHours: Number,
    // Device-specific fields
  },
  syncedAt: Date
}
```

#### Baselines Collection
```javascript
{
  _id: ObjectId,
  patient: ObjectId (ref: User, unique indexed),
  vitals: {
    heartRate: { mean: Number, stdDev: Number },
    systolic: { mean: Number, stdDev: Number },
    diastolic: { mean: Number, stdDev: Number },
    // Other baseline metrics
  },
  calculatedFrom: Date,
  calculatedTo: Date,
  sampleSize: Number,
  lastUpdated: Date
}
```

### 4.2 Indexes

**Users:**
- `email` (unique)
- `role`

**HealthRecords:**
- `patient` (ascending)
- `recordDate` (descending)
- `patient + recordDate` (compound)

**Alerts:**
- `patient` (ascending)
- `doctor` (ascending)
- `isRead` (ascending)
- `createdAt` (descending)
- `doctor + isRead + createdAt` (compound)

**WearableData:**
- `patient + timestamp` (compound)

## 5. API Design

### 5.1 Authentication Endpoints

**POST /api/auth/register**
```json
Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "role": "patient",
  "phone": "+1234567890"
}

Response (201):
{
  "success": true,
  "token": "jwt_token_here",
  "user": { /* user object */ }
}
```

**POST /api/auth/login**
```json
Request:
{
  "email": "john@example.com",
  "password": "securepass123"
}

Response (200):
{
  "success": true,
  "token": "jwt_token_here",
  "user": { /* user object */ }
}
```

### 5.2 Health Record Endpoints

**POST /api/health/records**
```json
Request:
{
  "patient": "patient_id",
  "vitals": {
    "bloodPressure": { "systolic": 120, "diastolic": 80 },
    "heartRate": 72,
    "oxygenSaturation": 98
  },
  "symptoms": ["chest pain"],
  "diagnosis": "Hypertension"
}

Response (201):
{
  "success": true,
  "data": { /* health record with AI analysis */ }
}
```

**GET /api/health/records?patient=:id&limit=10**
```json
Response (200):
{
  "success": true,
  "count": 10,
  "data": [ /* array of health records */ ]
}
```

### 5.3 Alert Endpoints

**GET /api/alerts?doctor=:id&isRead=false**
```json
Response (200):
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "alert_id",
      "type": "critical",
      "title": "High Blood Pressure Detected",
      "message": "Patient BP: 160/100",
      "patient": { /* populated patient data */ },
      "createdAt": "2026-02-10T10:30:00Z"
    }
  ]
}
```

**PUT /api/alerts/:id/read**
```json
Response (200):
{
  "success": true,
  "data": { /* updated alert */ }
}
```

### 5.4 ML Service Endpoints

**POST /ml/predict/risk**
```json
Request:
{
  "heartRate": 105,
  "systolic": 145,
  "diastolic": 95,
  "oxygenSaturation": 92,
  "bmi": 32
}

Response (200):
{
  "riskScore": 75,
  "riskFactors": [
    "High resting heart rate",
    "Hypertension detected",
    "Low oxygen saturation",
    "Obesity risk"
  ]
}
```

## 6. Security Design

### 6.1 Authentication & Authorization

**JWT Token Structure:**
```json
{
  "userId": "user_id",
  "role": "doctor",
  "iat": 1707562800,
  "exp": 1707649200
}
```

**Authorization Middleware:**
- Verify JWT token in Authorization header
- Extract user information
- Check role-based permissions
- Attach user to request object

### 6.2 Security Measures

**Rate Limiting:**
- 100 requests per 10 minutes per IP
- Prevents brute force attacks

**Password Security:**
- Bcrypt hashing with 10 salt rounds
- Minimum 6 characters
- Password field excluded from queries by default

**HTTP Security Headers (Helmet):**
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

**CORS Configuration:**
- Whitelist specific origins
- Credentials support
- Preflight request handling

**Input Validation:**
- Mongoose schema validation
- Email format validation
- Enum constraints
- Required field enforcement

### 6.3 Data Protection

**Encryption:**
- HTTPS for all communications
- Password hashing (bcrypt)
- Token encryption (JWT)

**Access Control:**
- Role-based access (RBAC)
- Patient data isolation
- Doctor-patient assignment verification

**Audit Logging:**
- Track all data access
- Log authentication attempts
- Record data modifications
- Timestamp all operations

## 7. ML Model Design

### 7.1 Risk Assessment Model

**Algorithm:** Rule-based scoring with WHO-aligned thresholds

**Input Features:**
- Heart rate (bpm)
- Systolic blood pressure (mmHg)
- Diastolic blood pressure (mmHg)
- Oxygen saturation (%)
- BMI (kg/m²)

**Risk Scoring Logic:**
```python
risk_score = 0
if heart_rate > 100: risk_score += 15
if systolic > 140 or diastolic > 90: risk_score += 25
if oxygen_saturation < 94: risk_score += 20
if bmi > 30: risk_score += 15
risk_score = min(risk_score, 100)
```

**Output:**
- Risk score (0-100)
- Identified risk factors
- Severity classification

### 7.2 Trend Analysis Model

**Purpose:** Detect patterns in time-series health data

**Approach:**
- Moving averages
- Slope calculation
- Anomaly detection
- Seasonal decomposition

**Output:**
- Trend direction (improving/declining/stable)
- Rate of change
- Predicted future values

### 7.3 Baseline Model

**Purpose:** Establish patient-specific normal ranges

**Methodology:**
- Collect 30+ days of data
- Calculate mean and standard deviation
- Define normal range (mean ± 2σ)
- Update periodically

**Output:**
- Personalized thresholds
- Deviation alerts
- Confidence intervals

### 7.4 Deviation Detection Model

**Purpose:** Identify abnormal readings

**Algorithm:**
- Compare current value to baseline
- Calculate z-score
- Flag if |z-score| > 2

**Output:**
- Deviation magnitude
- Statistical significance
- Alert recommendation

## 8. Error Handling

### 8.1 Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400,
  "stack": "stack trace (dev only)"
}
```

### 8.2 Error Categories

**400 Bad Request:** Invalid input data  
**401 Unauthorized:** Missing or invalid token  
**403 Forbidden:** Insufficient permissions  
**404 Not Found:** Resource doesn't exist  
**409 Conflict:** Duplicate resource  
**500 Internal Server Error:** Server-side errors

### 8.3 Error Handling Strategy

- Centralized error handler middleware
- Async error wrapper for controllers
- Mongoose validation errors
- JWT verification errors
- Unhandled promise rejection handling
- Graceful server shutdown on critical errors

## 9. Performance Optimization

### 9.1 Database Optimization

- Strategic indexing on frequently queried fields
- Compound indexes for common query patterns
- Pagination for large result sets
- Lean queries for read-only operations
- Connection pooling

### 9.2 API Optimization

- Response compression
- Caching strategies (Redis for future)
- Lazy loading for related data
- Field selection in queries
- Batch operations

### 9.3 Frontend Optimization

- Code splitting
- Lazy loading routes
- Memoization of expensive computations
- Debouncing API calls
- Optimistic UI updates

## 10. Monitoring & Logging

### 10.1 Application Logging

- Request/response logging
- Error logging with stack traces
- Authentication attempts
- Database operations
- ML model predictions

### 10.2 Health Checks

**Backend:** `GET /health`
```json
{
  "success": true,
  "message": "Cardio Sentinel API is running",
  "timestamp": "2026-02-10T12:00:00Z"
}
```

**ML Service:** `GET /`
```json
{
  "status": "ML service running"
}
```

### 10.3 Metrics to Monitor

- API response times
- Error rates
- Database query performance
- ML model latency
- Active user sessions
- Alert generation rate
- System resource usage

## 11. Deployment Strategy

### 11.1 Docker Compose Configuration

```yaml
services:
  mongo:
    image: mongo:6
    ports: ["27017:27017"]
    volumes: ["mongo-data:/data/db"]
    
  ml-service:
    build: ./ml-models
    ports: ["8000:8000"]
    depends_on: ["mongo"]
    
  backend:
    build: ./backend
    ports: ["5000:5000"]
    depends_on: ["mongo", "ml-service"]
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/cardiosentinel
```

### 11.2 Environment Configuration

**Backend (.env):**
```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://localhost:27017/cardiosentinel
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=24h
ML_SERVICE_URL=http://ml-service:8000
```

### 11.3 Scaling Strategy

**Horizontal Scaling:**
- Multiple backend instances behind load balancer
- ML service replicas for high throughput
- MongoDB replica set for high availability

**Vertical Scaling:**
- Increase container resources
- Optimize database queries
- Cache frequently accessed data

## 12. Testing Strategy

### 12.1 Unit Testing

- Model methods (password hashing, BMI calculation)
- Utility functions
- ML algorithms
- Input validation

### 12.2 Integration Testing

- API endpoint testing
- Database operations
- Authentication flow
- ML service integration

### 12.3 End-to-End Testing

- User registration and login
- Health record creation and retrieval
- Alert generation workflow
- Dashboard data aggregation

## 13. Future Enhancements

### 13.1 Technical Improvements

- WebSocket for real-time alerts
- Redis caching layer
- GraphQL API option
- Microservices decomposition
- Event-driven architecture
- Message queue (RabbitMQ/Kafka)

### 13.2 ML Enhancements

- Deep learning models (LSTM for time-series)
- ECG signal processing
- Image analysis (X-rays, scans)
- Ensemble models
- Federated learning
- Explainable AI (SHAP values)

### 13.3 Feature Additions

- Mobile apps (React Native)
- Telemedicine integration
- Prescription management
- Appointment scheduling
- Family member portals
- Multi-language support
- Voice interfaces
- Blockchain audit trail
