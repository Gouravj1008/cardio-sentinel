# CardioSentinel AI - Requirements Document

## 1. Project Overview

**Project Name:** CardioSentinel AI  
**Version:** 1.0.0  
**Purpose:** AI-powered cardiovascular health monitoring and risk assessment platform for real-time patient monitoring and early detection of cardiac anomalies.

## 2. Stakeholders

- **Primary Users:** Doctors, Healthcare Providers
- **Secondary Users:** Patients, Hospital Administrators
- **Development Team:** Full-stack developers, ML engineers, DevOps
- **Compliance:** Healthcare regulatory bodies (HIPAA, GDPR)

## 3. Functional Requirements

### 3.1 User Management

**FR-1.1** The system shall support three user roles: Patient, Doctor, and Admin  
**FR-1.2** Users shall authenticate using email and password with JWT tokens  
**FR-1.3** User profiles shall include personal information, contact details, and medical metadata  
**FR-1.4** Password shall be hashed using bcrypt with minimum 6 characters  
**FR-1.5** System shall support user activation/deactivation

### 3.2 Health Data Management

**FR-2.1** System shall capture and store vital signs:
- Blood pressure (systolic/diastolic)
- Heart rate
- Temperature
- Weight and height
- BMI (auto-calculated)
- Oxygen saturation

**FR-2.2** System shall store lab results including:
- Blood sugar levels
- Cholesterol profile (total, LDL, HDL, triglycerides)
- Hemoglobin levels

**FR-2.3** Health records shall support:
- Symptoms tracking
- Diagnosis documentation
- Medication management with dosage and frequency
- File attachments (reports, images)
- Doctor notes

**FR-2.4** System shall automatically calculate BMI from weight and height

### 3.3 AI-Powered Risk Assessment

**FR-3.1** ML service shall analyze health data and calculate cardiovascular risk scores (0-100)  
**FR-3.2** Risk calculation shall consider:
- Heart rate thresholds (>100 bpm = high risk)
- Blood pressure (>140/90 = hypertension)
- Oxygen saturation (<94% = low oxygen)
- BMI (>30 = obesity risk)

**FR-3.3** AI analysis shall provide:
- Trend detection
- Risk factors identification
- Personalized recommendations
- Confidence scores

**FR-3.4** System shall support baseline establishment for patient-specific normal ranges

### 3.4 Alert System

**FR-4.1** System shall generate alerts with three severity levels: Critical, Warning, Info  
**FR-4.2** Alert categories shall include: Vitals, Medication, Appointment, Risk Detection  
**FR-4.3** Alerts shall be linked to patients and assigned doctors  
**FR-4.4** System shall track alert read/unread status  
**FR-4.5** Critical alerts shall require immediate action flags

### 3.5 Dashboard & Visualization

**FR-5.1** Doctor dashboard shall display:
- Patient list with risk scores
- Active alerts and notifications
- Recent health records
- Trend visualizations

**FR-5.2** Patient view shall show:
- Individual health metrics
- Historical trends
- AI-generated insights
- Medication schedules

### 3.6 Wearable Device Integration

**FR-6.1** System shall support integration with wearable devices for continuous monitoring  
**FR-6.2** Wearable data shall be stored with timestamps and device metadata  
**FR-6.3** System shall process real-time data streams from wearables

## 4. Non-Functional Requirements

### 4.1 Performance

**NFR-1.1** API response time shall be <500ms for 95% of requests  
**NFR-1.2** System shall support concurrent access by 1000+ users  
**NFR-1.3** ML risk calculation shall complete within 2 seconds  
**NFR-1.4** Dashboard shall load within 3 seconds

### 4.2 Security

**NFR-2.1** All API endpoints shall use HTTPS encryption  
**NFR-2.2** Authentication tokens shall expire after 24 hours  
**NFR-2.3** Rate limiting: 100 requests per 10 minutes per IP  
**NFR-2.4** Passwords shall be hashed with bcrypt (salt rounds: 10)  
**NFR-2.5** Security headers shall be enforced using Helmet.js  
**NFR-2.6** CORS shall be configured for authorized domains only

### 4.3 Reliability

**NFR-3.1** System uptime shall be 99.5% or higher  
**NFR-3.2** Database backups shall occur daily  
**NFR-3.3** System shall handle unhandled promise rejections gracefully  
**NFR-3.4** Error logging shall capture all critical failures

### 4.4 Scalability

**NFR-4.1** Architecture shall support horizontal scaling  
**NFR-4.2** Database shall use MongoDB for flexible schema evolution  
**NFR-4.3** ML service shall be independently scalable  
**NFR-4.4** Microservices architecture for backend and ML components

### 4.5 Compliance

**NFR-5.1** System shall comply with HIPAA regulations for patient data  
**NFR-5.2** Audit logging shall track all data access and modifications  
**NFR-5.3** Data retention policies shall be configurable  
**NFR-5.4** Patient consent shall be required for data sharing

### 4.6 Usability

**NFR-6.1** UI shall be responsive and mobile-friendly  
**NFR-6.2** Interface shall support accessibility standards (WCAG 2.1)  
**NFR-6.3** System shall provide clear error messages  
**NFR-6.4** Dashboard shall use intuitive visualizations

### 4.7 Maintainability

**NFR-7.1** Code shall follow industry-standard conventions  
**NFR-7.2** API shall be documented with OpenAPI/Swagger  
**NFR-7.3** System shall use environment variables for configuration  
**NFR-7.4** Logging shall be structured and searchable

## 5. Technical Requirements

### 5.1 Backend Stack

- **Runtime:** Node.js with Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken)
- **Security:** Helmet, CORS, bcryptjs, express-rate-limit
- **API Communication:** Axios

### 5.2 ML Service Stack

- **Framework:** FastAPI (Python)
- **Server:** Uvicorn
- **Data Processing:** NumPy, Pandas
- **ML Libraries:** scikit-learn
- **Model Persistence:** joblib
- **Validation:** Pydantic

### 5.3 Frontend Stack

- **Framework:** React with Vite
- **Routing:** React Router DOM
- **Build Tool:** Vite
- **Language:** JavaScript/JSX

### 5.4 Infrastructure

- **Containerization:** Docker with Docker Compose
- **Database:** MongoDB 6
- **Services:** Backend API, ML Service, MongoDB

### 5.5 Development Tools

- **Backend Dev Server:** Nodemon
- **Code Quality:** ESLint
- **Version Control:** Git

## 6. API Endpoints

### 6.1 Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### 6.2 Health Records
- `GET /api/health/records` - List health records
- `POST /api/health/records` - Create health record
- `GET /api/health/records/:id` - Get specific record
- `PUT /api/health/records/:id` - Update record

### 6.3 Alerts
- `GET /api/alerts` - List alerts
- `POST /api/alerts` - Create alert
- `PUT /api/alerts/:id/read` - Mark alert as read

### 6.4 Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/patients` - List patients with risk scores

### 6.5 Doctor
- `GET /api/doctor/patients` - Get assigned patients
- `GET /api/doctor/alerts` - Get doctor-specific alerts

## 7. Data Models

### 7.1 User
- Personal information (name, email, phone, DOB, gender)
- Authentication (password hash)
- Role (patient/doctor/admin)
- Medical metadata (blood group)
- Address
- Profile image
- Status (active/inactive)

### 7.2 Health Record
- Patient and doctor references
- Vitals (BP, HR, temp, weight, height, BMI, SpO2)
- Lab results (blood sugar, cholesterol, hemoglobin)
- Symptoms, diagnosis, medications
- Attachments
- Risk score
- AI analysis (trends, risk factors, recommendations)

### 7.3 Alert
- Patient and doctor references
- Type (critical/warning/info)
- Category (vitals/medication/appointment/risk-detection)
- Title and message
- Read status
- Metadata (health record link, risk score, action required)

### 7.4 Wearable Data
- Device information
- Timestamp
- Sensor readings
- Patient reference

### 7.5 Baseline
- Patient-specific normal ranges
- Historical averages
- Deviation thresholds

## 8. Constraints

**C-1** System must operate within healthcare data privacy regulations  
**C-2** ML models must be interpretable for medical professionals  
**C-3** Development budget and timeline constraints  
**C-4** Integration with existing hospital systems may be required  
**C-5** Internet connectivity required for real-time monitoring

## 9. Assumptions

**A-1** Users have basic computer literacy  
**A-2** Healthcare providers have necessary hardware (computers, tablets)  
**A-3** Wearable devices provide standardized data formats  
**A-4** Network infrastructure supports real-time data transmission  
**A-5** MongoDB and Docker are available in deployment environment

## 10. Dependencies

**D-1** Third-party wearable device APIs  
**D-2** Cloud infrastructure providers  
**D-3** SSL certificate authorities  
**D-4** Email service providers for notifications  
**D-5** External authentication services (optional OAuth)

## 11. Success Criteria

**SC-1** System successfully monitors 100+ patients simultaneously  
**SC-2** AI risk assessment accuracy >85%  
**SC-3** Critical alerts delivered within 30 seconds  
**SC-4** User satisfaction score >4/5  
**SC-5** Zero critical security vulnerabilities  
**SC-6** System passes healthcare compliance audits

## 12. Future Enhancements

- Mobile applications (iOS/Android)
- Telemedicine video consultation
- Integration with electronic health records (EHR)
- Advanced ML models (deep learning for ECG analysis)
- Multi-language support
- Predictive analytics for long-term outcomes
- Family member access portals
- Integration with pharmacy systems
- Voice-activated interfaces
- Blockchain for data integrity
