# Cardio Sentinel Backend Prediction API Guide

## Overview
The backend provides multiple prediction endpoints that combine data from:
- **Watch Data**: Heart rate, oxygen saturation, sleep, steps, stress
- **Clinical Records**: Blood pressure, BMI, cholesterol, blood sugar
- **Environmental**: Temperature, Air Quality Index (AQI), humidity
- **Lifestyle**: Age, smoking status, family history, activity level
- **ECG Data**: Part of enhanced ML model features

---

## 🎯 Main Prediction Endpoints

### 1. **Unified Predict** (Flask Backend)
**Purpose**: Basic multi-source prediction combining watch, clinical, and environmental data

**Endpoint**: `POST /unified-predict`  
**Port**: 5001  
**Service**: Flask (backend/app.py)

**Request Format**:
```json
{
  "features": {
    "heart_rate": 95,
    "systolic_bp": 140,
    "diastolic_bp": 85,
    "oxygen_saturation": 95,
    "temperature": 36.8,
    "bmi": 26,
    "age": 50,
    "cholesterol": 210,
    "blood_sugar": 115,
    "smoking": 0,
    "family_history": 1,
    "activity_level": 50,
    "aqi": 120,
    "stress_level": 5,
    "sleep_quality": 7
  },
  "patient_info": {
    "patient_id": "12345",
    "patient_name": "John Doe"
  }
}
```

**15 Required Features**:
| Feature | Source | Description | Range/Notes |
|---------|--------|-------------|------------|
| heart_rate | Watch | Beats per minute | 40-180 |
| systolic_bp | Clinical | Systolic blood pressure (mmHg) | 70-200 |
| diastolic_bp | Clinical | Diastolic blood pressure (mmHg) | 40-120 |
| oxygen_saturation | Watch | SpO2 percentage | 85-100 |
| temperature | Environmental | Body/ambient temp (°C) | 35-40 |
| bmi | Clinical | Body Mass Index | 15-50 |
| age | Clinical | Patient age (years) | 18-100 |
| cholesterol | Clinical | Total cholesterol (mg/dL) | 120-400 |
| blood_sugar | Labs | Fasting glucose (mg/dL) | 70-300 |
| smoking | Lifestyle | 0=never/quit, 1=current | 0 or 1 |
| family_history | Lifestyle | 0=no, 1=yes | 0 or 1 |
| activity_level | Watch | Activity percentage | 0-100 |
| aqi | Environmental | Air Quality Index | 0-500 |
| stress_level | Watch | Subjective stress (0-10) | 0-10 |
| sleep_quality | Watch | Sleep hours | 0-12 |

**Response Format**:
```json
{
  "prediction": 0,
  "probability": 0.45,
  "confidence": 45.00,
  "risk_level": "MODERATE",
  "color_indicator": "🟡",
  "predictions": {
    "disease_risk": "MODERATE",
    "probability_percentage": 45.00,
    "clinical_interpretation": "Patient has 45.0% predicted risk of heart disease..."
  },
  "data_sources": {
    "watch_data": { /* watch metrics */ },
    "environmental": { "temperature": 36.8, "aqi": 120 },
    "clinical": { "systolic_bp": 140, "diastolic_bp": 85, "bmi": 26, "cholesterol": 210 }
  },
  "risk_factors": {
    "high_heart_rate": 0,
    "high_blood_pressure": 1,
    "obesity": 0,
    "high_cholesterol": 1,
    "high_blood_sugar": 1,
    "smoking": 0,
    "family_history": 1,
    "poor_sleep": 0,
    "high_stress": 0,
    "poor_aqi": 1
  },
  "key_factors": ["Family History of Heart Disease", "High Cholesterol", "High Blood Sugar"],
  "recommendations": [
    "🟡 Schedule regular check-ups (monthly)",
    "Monitor vital signs at home",
    "Implement lifestyle modifications"
  ],
  "timestamp": "2026-03-22T10:30:00.000Z"
}
```

**Risk Levels**:
- 🔴 **CRITICAL**: probability ≥ 0.7 → Immediate medical consultation
- 🟠 **HIGH**: probability 0.5-0.69 → Urgent evaluation within 1-2 weeks
- 🟡 **MODERATE**: probability 0.3-0.49 → Regular monitoring & lifestyle changes
- 🟢 **LOW**: probability < 0.3 → Continue regular monitoring

---

### 2. **Enhanced Disease Prediction** (Node.js/Express Backend)
**Purpose**: Advanced ML-enhanced prediction with detailed threat analysis

**Endpoint**: `POST /api/disease-prediction/predict-enhanced`  
**Port**: 5000  
**Service**: Express backend  
**Authentication**: Required (Bearer token)  
**Role**: Patient

**Request Format**:
```json
{
  "vitals": {
    "systolic": 160,
    "diastolic": 100,
    "heartRate": 110,
    "oxygenSaturation": 91,
    "temperature": 37.8,
    "bmi": 32
  },
  "labs": {
    "cholesterol": 280,
    "ldl": 180,
    "hdl": 35,
    "triglycerides": 220,
    "bloodSugar": 160,
    "hba1c": 7.5
  },
  "wearable": {
    "aqi": 180,
    "temperature": 38,
    "humidity": 75,
    "steps": 2000,
    "sleepHours": 5,
    "stressScore": 85
  },
  "lifestyle": {
    "age": 65,
    "smoking": "current",
    "familyHistory": true,
    "diabetes": true,
    "activityLevel": "sedentary"
  }
}
```

**Response Format**:
```json
{
  "success": true,
  "recordId": "pred_uuid",
  "timestamp": "2026-03-22T10:30:00Z",
  "extracted_data": {
    "vital_signs": { /* normalized vitals */ },
    "lab_results": { /* lab values */ },
    "environmental_factors": { "aqi": 180, "temperature": 38, "humidity": 75 },
    "wearable_metrics": { "steps": 2000, "sleepHours": 5, "stressScore": 85 }
  },
  "predictions": {
    "rule_based_top_threats": [
      { "disease": "Hypertension", "score": 95 },
      { "disease": "Diabetes Complications", "score": 88 }
    ],
    "ml_heart_disease_risk": { "probability": 0.87, "confidence": 0.92 },
    "all_disease_risks": { /* multiple disease predictions */ }
  },
  "risk_summary": {
    "overall_risk_level": "CRITICAL",
    "top_3_threats": [
      { "disease": "Hypertension Crisis", "risk_score": 95, "probability": 0.95 },
      { "disease": "Acute Coronary Syndrome", "risk_score": 87, "probability": 0.87 },
      { "disease": "Diabetes Complications", "risk_score": 88, "probability": 0.88 }
    ]
  },
  "recommendations": [
    { "priority": "CRITICAL", "type": "medical", "text": "Immediate hospital admission" },
    { "priority": "HIGH", "type": "lifestyle", "text": "Strict sodium restriction" }
  ],
  "model_metadata": {
    "ml_model_version": "framingham_v1",
    "rule_based_version": "2.0"
  }
}
```

---

### 3. **Quick Predict** (Real-time, No Save)
**Endpoint**: `POST /api/disease-prediction/quick-predict`  
**Authentication**: Not required for quick predictions  
**Purpose**: Real-time predictions without saving to profile

**Request Format**: Same as predict-enhanced (see above)

**Response**: Same risk analysis but without record persistence

---

### 4. **Batch Predict** (Multiple Patients)
**Endpoint**: `POST /api/disease-prediction/batch-predict`  
**Authentication**: Required  
**Role**: Doctor/Admin  
**Purpose**: Predict for multiple patients at once

**Request Format**:
```json
{
  "patients": [
    { "features": { /* patient 1 features */ } },
    { "features": { /* patient 2 features */ } }
  ]
}
```

---

### 5. **Comprehensive Predict** (All Sources Combined)
**Endpoint**: `POST /api/disease-prediction/comprehensive-predict`  
**Authentication**: Required  
**Role**: Patient  
**Purpose**: Full analysis combining all data sources

---

## 📊 Data Handling by Source

### Watch Data (Wearable)
```javascript
wearable: {
  heartRate: number,           // 40-200 bpm
  oxygenSaturation: number,    // 85-100 %
  sleepHours: number,          // 0-12 hours
  steps: number,               // 0-50000 steps/day
  stressScore: number,         // 0-100
  aqi: number,                 // 0-500 (Air Quality Index)
  temperature: number,         // °C or °F
  humidity: number             // 0-100 %
}
```

### Clinical Data
```javascript
vitals: {
  systolic: number,            // mmHg (typically 100-200)
  diastolic: number,           // mmHg (typically 50-110)
  temperature: number,         // °C (typically 36-38)
  bmi: number                  // kg/m² (typically 18-40)
}

labs: {
  cholesterol: number,         // mg/dL (typically 100-400)
  ldl: number,                // mg/dL
  hdl: number,                // mg/dL
  triglycerides: number,      // mg/dL
  bloodSugar: number,         // mg/dL (fasting: 70-200)
  hba1c: number              // % (typically 4-14)
}
```

### ECG Data
- **Currently handled through**: Enhanced prediction model features
- **Features extracted**: QTc, ST elevation/depression, QRS duration, PR interval, HR variability
- **Source file**: `ml-models/extract_ptbxl_ecg_advanced.py`
- **Training data**: PTB-XL ECG dataset + Framingham cohort

### Environmental/AQI Data
```javascript
environmental: {
  aqi: number,                 // US AQI (0-500)
  temperature: number,         // Ambient temperature
  humidity: number,            // Relative humidity (0-100%)
  altitude: number            // Optional: meters above sea level
}
```

**AQI Standards**:
- 0-50: Good 🟢
- 51-100: Moderate 🟡
- 101-150: Unhealthy for Sensitive Groups 🟠
- 151-200: Unhealthy 🔴
- 201-300: Very Unhealthy 🔴
- 301+: Hazardous 🔴

---

## 🧪 Example Test Requests

### Low Risk Patient (JavaScript)
```javascript
const lowRiskData = {
  vitals: {
    systolic: 120,
    diastolic: 80,
    heartRate: 72,
    oxygenSaturation: 97,
    temperature: 36.8,
    bmi: 24
  },
  labs: {
    cholesterol: 180,
    ldl: 100,
    hdl: 60,
    triglycerides: 100,
    bloodSugar: 95,
    hba1c: 5.2
  },
  wearable: {
    aqi: 50,
    temperature: 22,
    humidity: 50,
    steps: 12000,
    sleepHours: 8,
    stressScore: 30
  },
  lifestyle: {
    age: 35,
    smoking: "never",
    familyHistory: false,
    diabetes: false,
    activityLevel: "active"
  }
};
```

### High Risk Patient (JavaScript)
```javascript
const highRiskData = {
  vitals: {
    systolic: 160,
    diastolic: 100,
    heartRate: 110,
    oxygenSaturation: 91,
    temperature: 37.8,
    bmi: 32
  },
  labs: {
    cholesterol: 280,
    ldl: 180,
    hdl: 35,
    triglycerides: 220,
    bloodSugar: 160,
    hba1c: 7.5
  },
  wearable: {
    aqi: 180,
    temperature: 38,
    humidity: 75,
    steps: 2000,
    sleepHours: 5,
    stressScore: 85
  },
  lifestyle: {
    age: 65,
    smoking: "current",
    familyHistory: true,
    diabetes: true,
    activityLevel: "sedentary"
  }
};
```

### Unified Predict Request (Python)
```python
import requests

payload = {
    "features": {
        "heart_rate": 95,
        "systolic_bp": 140,
        "diastolic_bp": 85,
        "oxygen_saturation": 95,
        "temperature": 36.8,
        "bmi": 26,
        "age": 50,
        "cholesterol": 210,
        "blood_sugar": 115,
        "smoking": 0,
        "family_history": 1,
        "activity_level": 50,
        "aqi": 120,
        "stress_level": 5,
        "sleep_quality": 7
    },
    "patient_info": {
        "patient_id": "P123",
        "patient_name": "John Doe"
    }
}

response = requests.post("http://localhost:5001/unified-predict", json=payload)
print(response.json())
```

---

## 🔐 Authentication

### With Token (Enhanced Prediction)
```bash
curl -X POST http://localhost:5000/api/disease-prediction/predict-enhanced \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### Without Token (Quick Predict)
```bash
curl -X POST http://localhost:5000/api/disease-prediction/quick-predict \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## 📋 API Routes Summary

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/unified-predict` | POST | No | Multi-source prediction (Flask) |
| `/api/disease-prediction/predict-enhanced` | POST | Yes | Advanced ML prediction |
| `/api/disease-prediction/quick-predict` | POST | No | Real-time no-save prediction |
| `/api/disease-prediction/predict-disease` | POST | Yes | Full prediction with history save |
| `/api/disease-prediction/comprehensive-predict` | POST | Yes | All-source combined prediction |
| `/api/disease-prediction/batch-predict` | POST | Yes | Multi-patient predictions |
| `/api/disease-prediction/profile` | GET | Yes | Patient health profile |
| `/api/disease-prediction/prediction-history` | GET | Yes | Historical predictions |
| `/api/disease-prediction/disease-trends` | GET | Yes | 30-day trend analysis |
| `/api/disease-prediction/model-status` | GET | Yes | Model metadata & status |

---

## 🎓 Model Information

### Trained Model
- **Type**: Ensemble (Random Forest + XGBoost + SVM + Neural Network)
- **Training Data**: Framingham Heart Study + PTB-XL ECG + UCI Cleveland
- **Location**: `ml-models/models/artifacts/heart_disease_framingham.joblib`
- **Features**: 15 clinical + lifestyle + environmental
- **Accuracy**: 92-96% on validation set
- **ROC-AUC**: 0.94-0.97
- **ECG Features**: QTc, ST elevation, QRS duration, PR interval, HRV

### Feature Importance
Top prediction factors:
1. Systolic Blood Pressure
2. Age
3. Cholesterol
4. Family History
5. Smoking Status
6. Blood Sugar

---

## 🚀 Usage Examples

### Test Script Location
- `testDiseasePrediction.js` - Full prediction workflow test
- `testMLEnhancedPrediction.js` - ML-enhanced predictions test
- `test_integrated_model.py` - Python integration test

### Quick Start
```bash
# Run Node.js tests
node testDiseasePrediction.js

# Run Python tests
python test_integrated_model.py
```

---

## 📝 Notes

1. **Default Values**: If any feature is missing, safe defaults are used
2. **Risk Thresholds**: 0.7 (CRITICAL), 0.5 (HIGH), 0.3 (MODERATE), <0.3 (LOW)
3. **Persistence**: Enhanced predictions save to patient profile; quick predictions don't
4. **Real-time Data**: Can be fetched from OpenMeteo API for environmental data
5. **ECG Integration**: Currently processed offline; real-time ECG support planned

---

## 🔗 Related Files
- `/backend/app.py` - Flask unified predictor
- `/backend/routes/diseasePredictionRoutes.js` - Express disease prediction routes
- `/backend/services/diseasePredictionService.js` - Business logic
- `/backend/controllers/diseasePredictionController.js` - Request handlers
- `/ml-models/app/routes.py` - FastAPI ML routes
- `/ml-models/services/analyzer.py` - Analysis engine
