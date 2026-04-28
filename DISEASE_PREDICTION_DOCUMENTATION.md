# 🏥 Disease Prediction System - Complete Guide

## Overview

The Cardio Sentinel Disease Prediction System uses AI-powered algorithms to predict future disease risks based on:

- **Health Vitals**: Blood pressure, heart rate, oxygen saturation, temperature, BMI
- **Lab Results**: Cholesterol, LDL, HDL, blood sugar, HbA1c
- **Environmental Factors**: AQI (Air Quality Index), ambient temperature, humidity, altitude
- **Wearable Data**: Steps, sleep hours, stress levels
- **Lifestyle Factors**: Age, smoking status, diabetes status, family history, activity level

---

## 🎯 Predicted Diseases

The system predicts risk for **8 major disease categories**:

### 1. **COPD** (Chronic Obstructive Pulmonary Disease)
- **Key Triggers**: High AQI, low O₂ saturation, smoking history
- **Risk Factors**:
  - High environmental air pollution
  - Chronic low oxygen levels
  - Active smoking
- **Interventions**:
  - Avoid air pollution exposure
  - Use prescribed inhalers
  - Pulmonary function tests

### 2. **Asthma**
- **Key Triggers**: Poor air quality, high stress, family history
- **Risk Factors**:
  - Elevated AQI readings
  - High stress/HRV changes
  - Allergen exposure
- **Interventions**:
  - Carry rescue inhaler
  - Avoid triggers
  - Stress management

### 3. **Heart Disease**
- **Key Triggers**: High BP, high cholesterol, sedentary lifestyle
- **Risk Factors**:
  - Systolic BP ≥ 140 mmHg
  - LDL cholesterol ≥ 160 mg/dL
  - Low daily activity (< 3000 steps)
  - Smoking
  - Diabetes
  - Family history
- **Interventions**:
  - Start cardio exercise program
  - Low sodium diet
  - Consider statin therapy
  - Regular ECG monitoring

### 4. **Hypertension**
- **Key Triggers**: Elevated BP, stress, poor sleep
- **Risk Factors**:
  - Systolic ≥ 130 mmHg
  - Diastolic ≥ 80 mmHg
  - High stress levels
  - Sleep < 6 hours
- **Interventions**:
  - DASH diet
  - Stress management
  - Regular BP monitoring

### 5. **Diabetes/Pre-Diabetes**
- **Key Triggers**: High blood sugar, high HbA1c, overweight
- **Risk Factors**:
  - Fasting glucose ≥ 126 mg/dL
  - HbA1c ≥ 6.5%
  - BMI > 25
  - Family history
  - Sedentary lifestyle
- **Interventions**:
  - Continuous glucose monitoring
  - Lifestyle modification
  - Consult endocrinologist

### 6. **Stroke**
- **Key Triggers**: High BP, high cholesterol, diabetes
- **Risk Factors**:
  - Systolic BP ≥ 160 mmHg
  - Total cholesterol ≥ 240 mg/dL
  - LDL ≥ 160 mg/dL
  - Diabetes
  - Smoking
- **Interventions**:
  - Blood pressure control
  - Cholesterol management
  - Antiplatelet therapy

### 7. **Pneumonia**
- **Key Triggers**: High AQI, fever, low O₂, elevated HR
- **Risk Factors**:
  - AQI > 200
  - Temperature ≥ 38°C
  - Heart rate > 110 bpm
  - SpO₂ < 90%
- **Interventions**:
  - Seek immediate medical care
  - Chest X-ray
  - Blood cultures

### 8. **Heat Stroke**
- **Key Triggers**: High ambient temperature, high stress, high HR
- **Risk Factors**:
  - Ambient temp > 40°C
  - Heart rate > 120 bpm
  - High stress levels
  - Humidity > 80%
- **Interventions**:
  - Seek cool environment immediately
  - Hydration
  - Emergency care if severe

---

## 📊 Risk Scoring Algorithm

Each disease has a **risk score** (0-100) calculated based on:

1. **Threshold Assessment**: Each factor is compared to clinical thresholds
   - 30+ points: Critical (1.5x threshold)
   - 20 points: High (1.25x threshold)
   - 10 points: Moderate (at threshold)

2. **Weighted Factors**: Different factors have different weights
   - Example: For heart disease, smoking = 20 points, sedentary = 10 points

3. **Final Risk**: Sum of all factor scores, capped at 100

### Risk Level Interpretation

- **Score 80+**: Critical - Requires immediate medical attention
- **Score 60-79**: High - Schedule doctor appointment soon
- **Score 40-59**: Moderate - Monitor closely, lifestyle changes recommended
- **Score < 40**: Low - Continue healthy habits, routine monitoring

---

## 🔌 API Endpoints

### 1. **Predict Future Diseases** (Saved to Profile)
```
POST /api/disease-prediction/predict-disease
```

**Request Body:**
```json
{
  "vitals": {
    "bloodPressure": { "systolic": 140, "diastolic": 90 },
    "heartRate": 85,
    "temperature": 36.8,
    "oxygenSaturation": 95,
    "bmi": 26
  },
  "wearable": {
    "aqi": 150,
    "ambientTemp": 35,
    "humidity": 70,
    "altitude": 100,
    "steps": 5000,
    "sleepHours": 6.5,
    "stressScore": 45
  },
  "labs": {
    "cholesterol": { "total": 200, "ldl": 130, "hdl": 45 },
    "bloodSugar": 110,
    "hba1c": 6.2
  },
  "lifestyle": {
    "age": 50,
    "smoking": "current",
    "diabetesStatus": "no",
    "familyHistory": true,
    "activityLevel": "light"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recordId": "672a9c8f1234567890abcdef",
    "timestamp": "2026-03-21T10:30:00Z",
    "overallRisk": "High",
    "probability": 0.75,
    "topThreats": [
      {
        "name": "heartDisease",
        "risk": 78,
        "probability": 0.78,
        "triggers": ["Elevated blood pressure", "High LDL cholesterol"],
        "interventions": ["Start cardio exercise", "Low sodium diet"]
      }
    ],
    "recommendations": ["Exercise 30 min daily", "Reduce sodium intake"],
    "requiresImmedateAttention": true
  }
}
```

---

### 2. **Quick Prediction** (Real-time, Not Saved)
```
POST /api/disease-prediction/quick-predict
```

Same request body as above, but doesn't save to database.

---

### 3. **Get Health Profile**
```
GET /api/disease-prediction/profile
```

**Response:**
```json
{
  "success": true,
  "data": {
    "patient": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "healthProfile": {
      "latestPrediction": {
        "overallRiskLevel": "High",
        "topThreats": ["heartDisease", "hypertension"],
        "timestamp": "2026-03-21T10:30:00Z"
      },
      "reports": [
        {
          "reportId": "xxx",
          "type": "ecg",
          "timestamp": "2026-03-21T09:00:00Z"
        }
      ]
    },
    "recentPredictions": [...]
  }
}
```

---

### 4. **Get Prediction History**
```
GET /api/disease-prediction/prediction-history
```

Returns last 50 predictions with risk levels and trends.

---

### 5. **Get Disease Trends** (90 days)
```
GET /api/disease-prediction/disease-trends?days=90
```

**Response:**
```json
{
  "success": true,
  "data": {
    "timeframe": "90 days",
    "trendCount": 45,
    "trends": [
      {
        "date": "2026-01-21",
        "riskLevel": "Low",
        "riskScore": 35,
        "topThreat": "hypertension"
      }
    ],
    "summary": {
      "avgRiskScore": "52.3",
      "highRiskDays": 8,
      "mostCommonThreat": "heartDisease"
    }
  }
}
```

---

## 💻 Frontend Integration

### Disease Prediction Page
Located at: `/patient/disease-prediction`

**Features:**
- Input all health metrics
- Real-time validation and severity indicators
- Disease risk visualization
- Recommendation engine
- Historical trend charts
- Automatic profile saving

### Example Usage in Code:
```javascript
import DiseasePrediction from '../pages/DiseasePrediction';

// In routing
<Route path="/patient/disease-prediction" element={<DiseasePrediction />} />
```

---

## 💾 Data Persistence

All predictions are **automatically saved** to user profile:

1. **Database Tables Used**:
   - `HealthRecord` - Stores vitals, labs, wearable data
   - `Report` - Stores uploaded reports
   - `User.healthProfile` - Stores latest prediction state

2. **Automatic Updates**:
   - Latest prediction always stored in `User.healthProfile.latestPrediction`
   - All predictions indexed by patient + date for trending
   - Reports linked to health records

3. **Data Retention**:
   - Predictions kept for 1 year
   - Retrieve full history via API
   - No data lost on logout

---

## 🔐 AQI & Temperature Integration

### Air Quality Index (AQI)
```
AQI 0-50:       Good (Green)
AQI 51-100:     Moderate (Yellow)
AQI 101-150:    Unhealthy for sensitive groups (Orange)
AQI 151-200:    Unhealthy (Red)
AQI 201-300:    Very Unhealthy (Purple)
AQI 301+:       Hazardous (Maroon)
```

**Impact on Diseases**:
- COPD risk increases exponentially with AQI > 150
- Asthma risk elevated when AQI > 100
- Pneumonia risk increases when AQI > 200

### Temperature Sensitivity
- **< 35°C**: Hypothermia risk
- **35-36.8°C**: Normal
- **36.8-37.5°C**: Slight elevation
- **37.5-38.5°C**: Fever (infection possible)
- **> 38.5°C**: High fever (medical attention needed)
- **> 40°C**: Combined with high HR + humidity = Heat stroke risk

---

## 📈 Clinical Validation

The prediction model is based on:
- **WHO Guidelines** - Blood pressure stages, cholesterol targets
- **ACC-AHA 2019** - Cardiovascular risk assessment
- **Framingham Heart Study** - Longitudinal disease risk factors
- **CDC Standards** - Disease thresholds and cutoffs

---

## 🚨 Critical Alert Thresholds

The system triggers **immediate alerts** when:

| Condition | Action |
|-----------|--------|
| Systolic > 180 or Diastolic > 120 | Hypertensive Crisis Alert |
| SpO₂ < 85% | CRITICAL Hypoxemia |
| Heart Rate > 150 with BP > 160 | Potential Heart Attack |
| Temperature > 40°C | Heat Stroke Risk |
| AQI > 300 | Stay Indoors |

---

## 📋 Example Scenarios

### Scenario 1: High-Risk Patient
**Input:**
- Age: 62, Smoking: Current, Diabetic: Yes
- BP: 168/105, HR: 108, SpO₂: 93
- Cholesterol: 285, LDL: 195, Steps: 2200
- AQI: 185, Ambient Temp: 38°C

**Output:**
```
Overall Risk: CRITICAL
Heart Disease Risk: 92%
Stroke Risk: 85%
Hypertension: Severe
Top Threats: Heart Disease, Stroke
Recommendations:
  1. Seek cardiology evaluation immediately
  2. Adjust blood pressure medications
  3. Avoid high AQI areas
  4. Start supervised exercise program
```

### Scenario 2: Low-Risk Patient
**Input:**
- Age: 35, Smoking: Never, No Diabetes
- BP: 115/75, HR: 65, SpO₂: 98
- Cholesterol: 160, LDL: 90, Steps: 10000
- Sleep: 8 hrs, Stress: 25, AQI: 45

**Output:**
```
Overall Risk: LOW
All Disease Risks: < 20%
Status: Healthy
Recommendations:
  1. Maintain current lifestyle
  2. Continue regular exercise
  3. Annual health check-up
```

---

## 🛠️ Backend Implementation Details

### Main Service File
```
backend/services/diseasePredictionService.js
- predictDisease() → Calculates all disease risks
- getOverallRisk() → Gets top 3 threats
- assessRiskFactor() → Scores individual risk factors
```

### Controller
```
backend/controllers/diseasePredictionController.js
- predictFutureDisease() → API endpoint with DB save
- quickPredict() → Real-time without save
- getHealthProfile() → Retrieve saved data
- getDiseaseTrends() → Historical analysis
```

### Models
```
backend/models/Report.js → Persistent report storage
backend/models/HealthRecord.js → Health data with analysis
backend/models/User.js → Updated with healthProfile field
```

---

## 🔄 Usage Workflow

1. **User Opens Disease Prediction Page**
   - Frontend: `/patient/disease-prediction`
   - Can enter data manually or load from profile

2. **User Clicks "Predict"**
   - Sends POST to `/api/disease-prediction/predict-disease`
   - Backend calculates risks for all 8 diseases
   - Results **saved automatically** to profile

3. **Results Display**
   - Color-coded risk levels
   - Top threats with interventions
   - Historical trend comparison

4. **Data Persistence**
   - All results stored in HealthRecord
   - User profile updated with latest prediction
   - History accessible anytime
   - **No data lost on logout**

---

## ✅ Feature Checklist

- ✅ Predicts 8 major disease categories
- ✅ Uses AQI, temperature, and environment data
- ✅ Persistent storage - data saved to profile
- ✅ Reports uploaded and linked to predictions
- ✅ Historical trending analysis
- ✅ Automatic recommendations
- ✅ Frontend disease prediction UI
- ✅ Real-time risk assessment
- ✅ Clinical validation based on WHO/ACC standards
- ✅ Mobile responsive design

---

## 📚 References

- WHO Hypertension Guidelines: https://www.who.int/publications/i/item/9789240016491
- ACC/AHA Cardiovascular Assessment: https://www.acc.org/
- EPA Air Quality Index: https://www.aqi.org/
- Framingham Heart Study: https://www.framinghamheartstudy.org/

