# ML-Enhanced Disease Prediction System Documentation

## Overview

The system has been enhanced with a **500-sample ML model** that provides:
- **Trained ML predictions** with 70.67% accuracy
- **Extracted data analysis** showing detailed health metrics
- **Combined rule-based + ML predictions** for comprehensive risk assessment
- **Persistent data storage** with full audit trail

---

## 🎯 Key Features

### 1. **ML Model Training (500 Samples)**

#### Dataset Characteristics
- **Total Samples**: 500 (expanded from 100)
- **Positive Cases**: 181 (36.2%)
- **Negative Cases**: 319 (63.8%)

#### Model Performance
```
Accuracy:     70.67%
ROC AUC:      0.7754
F1 Score:     0.6207
Brier Score:  0.1852
Precision:    0.7182
Recall:       0.6979
```

#### Best Model
- **Type**: Random Forest Classifier
- **Estimators**: 120
- **Max Depth**: 4
- **Training Method**: Calibrated with sigmoid
- **Threshold**: 0.43 (optimized for accuracy)

#### Features Used
1. Heart Rate (bpm)
2. Systolic Blood Pressure (mmHg)
3. Diastolic Blood Pressure (mmHg)
4. Oxygen Saturation (%)
5. BMI (kg/m²)
6. Age (years)
7. Cholesterol (mg/dL)
8. Blood Sugar (mg/dL)
9. Smoking Status (binary)
10. Family History (binary)
11. Activity Level (0-3)

---

### 2. **Extracted Data Analysis**

Each prediction provides detailed extraction and analysis of:

#### Vital Signs
```json
{
  "systolic_bp": {
    "value": 160,
    "unit": "mmHg",
    "status": "high"
  },
  "diastolic_bp": {
    "value": 100,
    "unit": "mmHg",
    "status": "high"
  },
  "heart_rate": {
    "value": 110,
    "unit": "bpm",
    "status": "elevated"
  },
  "oxygen_saturation": {
    "value": 91,
    "unit": "%",
    "status": "abnormal"
  },
  "temperature": {
    "value": 37.8,
    "unit": "°C",
    "status": "fever"
  },
  "bmi": {
    "value": 32,
    "unit": "kg/m²",
    "status": "obese"
  }
}
```

#### Lab Results
```json
{
  "cholesterol": {
    "value": 280,
    "unit": "mg/dL",
    "status": "high"
  },
  "ldl": {
    "value": 180,
    "unit": "mg/dL",
    "status": "high"
  },
  "hdl": {
    "value": 35,
    "unit": "mg/dL",
    "status": "low"
  },
  "triglycerides": {
    "value": 220,
    "unit": "mg/dL",
    "status": "high"
  },
  "blood_sugar": {
    "value": 160,
    "unit": "mg/dL",
    "status": "diabetic"
  },
  "hba1c": {
    "value": 7.5,
    "unit": "%",
    "status": "diabetic"
  }
}
```

#### Environmental Factors
```json
{
  "aqi": {
    "value": 180,
    "unit": "index",
    "status": "unhealthy"
  },
  "ambient_temperature": {
    "value": 38,
    "unit": "°C",
    "status": "critical_heat"
  },
  "humidity": {
    "value": 75,
    "unit": "%",
    "status": "high"
  }
}
```

#### Wearable Metrics
```json
{
  "steps": {
    "value": 2000,
    "unit": "steps",
    "status": "sedentary"
  },
  "sleep_hours": {
    "value": 5,
    "unit": "hours",
    "status": "insufficient"
  },
  "stress_score": {
    "value": 85,
    "unit": "/100",
    "status": "high"
  }
}
```

---

### 3. **Disease Prediction Integration**

#### Rule-Based Predictions (8 Diseases)
1. **COPD** - Chronic Obstructive Pulmonary Disease
2. **Asthma** - Reactive airway disease
3. **Heart Disease** - Cardiovascular risk
4. **Hypertension** - High blood pressure
5. **Diabetes** - Blood glucose dysregulation
6. **Stroke** - Cerebrovascular disease risk
7. **Pneumonia** - Respiratory infection risk
8. **Heat Stroke** - Thermal stress response

#### ML Model Predictions
- **Heart Disease Risk** - Trained on 500-sample dataset
- **Probability Score** - 0.0 to 1.0 (0-100%)
- **Confidence Level** - Model certainty
- **Clinical Interpretation** - Risk category

#### Response Example
```json
{
  "success": true,
  "recordId": "507f1f77bcf86cd799439011",
  "timestamp": "2026-03-21T10:30:00Z",
  "extracted_data": { ... },
  "predictions": {
    "rule_based_top_threats": [
      {
        "name": "Heart Disease",
        "risk": 85,
        "probability": 0.92,
        "triggers": ["High BP", "High cholesterol", "Smoking"],
        "interventions": ["Cardiac evaluation", "Medication", "Lifestyle change"]
      }
    ],
    "ml_heart_disease_risk": {
      "probability": 0.89,
      "prediction": "high_risk",
      "confidence": 0.91,
      "interpretation": "High risk of heart disease"
    },
    "all_disease_risks": [ ... ]
  },
  "risk_summary": {
    "overall_risk_level": "Critical",
    "requires_intervention": true,
    "top_3_threats": [ ... ]
  },
  "recommendations": [ ... ],
  "model_metadata": {
    "ml_model_version": "500_sample",
    "ml_model_threshold": 0.43,
    "rule_based_version": "1.0"
  }
}
```

---

## 📡 API Endpoints

### Enhanced Disease Prediction

**Endpoint:**
```
POST /api/disease-prediction/predict-enhanced
```

**Authentication:** Required (Bearer token)

**Authorization:** Patient role only

**Request Body:**
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

**Response:** 
- `recordId`: Unique ID for this prediction
- `extracted_data`: Analyzed health metrics
- `predictions`: Combined ML + rule-based predictions
- `risk_summary`: Overall risk assessment
- `recommendations`: Personalized interventions
- `model_metadata`: Training and model info

### Health Profile

**Endpoint:**
```
GET /api/disease-prediction/profile
```

**Response:**
```json
{
  "latestPrediction": {
    "overallRiskLevel": "Critical",
    "topThreats": ["Heart Disease", "Hypertension", "Diabetes"],
    "timestamp": "2026-03-21T10:30:00Z",
    "recordId": "507f1f77bcf86cd799439011",
    "mlIntegrated": true
  },
  "reports": [ ... ],
  "lastUpdated": "2026-03-21T10:30:00Z"
}
```

### Prediction History

**Endpoint:**
```
GET /api/disease-prediction/prediction-history
```

**Query Parameters:**
- `limit`: Number of predictions to return (default: 50)
- `skip`: Number of predictions to skip (default: 0)

**Response:**
```json
{
  "data": [
    {
      "createdAt": "2026-03-21T10:30:00Z",
      "predictions": {
        "overallRiskLevel": "Critical"
      }
    }
  ],
  "total": 50,
  "remaining": 0
}
```

### Disease Trends

**Endpoint:**
```
GET /api/disease-prediction/disease-trends
```

**Query Parameters:**
- `days`: Number of days to analyze (default: 90)

**Response:**
```json
{
  "period": {
    "start": "2026-12-21T12:00:00Z",
    "end": "2026-03-21T12:00:00Z",
    "days": 90
  },
  "trends": {
    "disease_name": {
      "average_risk": 65,
      "max_risk": 85,
      "min_risk": 45,
      "count": 30,
      "trend": "increasing"
    }
  }
}
```

---

## 🛠️ Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────┐
│         Enhanced Disease Prediction System           │
└─────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
    ┌────────┐      ┌────────┐      ┌────────┐
    │ ML     │      │ Rule   │      │ Data   │
    │ Models │      │ Based  │      │ Extract│
    │(500S)  │      │Predict │      │ & Anal │
    └────────┘      └────────┘      └────────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
                    ┌────────┐
                    │Database│
                    │(MongoDB)
                    └────────┘
```

### Data Flow

1. **Input** → Vital signs, labs, wearable, lifestyle
2. **Extraction** → Parse and classify each metric
3. **ML Model** → Python Random Forest prediction
4. **Rule Engine** → Disease-specific scoring
5. **Integration** → Combine results with confidence
6. **Output** → Extracted data + predictions
7. **Storage** → HealthRecord + User profile

### Files Created/Modified

**New Files:**
- `ml-models/generate_expanded_dataset.py` - 500-sample generator
- `ml-models/mlModelService.py` - Python ML service wrapper
- `backend/services/mlIntegrationService.js` - Node.js ML integration
- `backend/controllers/enhancedPredictionController.js` - Enhanced endpoints
- `backend/routes/enhancedPredictionRoutes.js` - Route definitions
- `testMLEnhancedPrediction.js` - Comprehensive test suite

**Modified Files:**
- `backend/server.js` - Added enhanced prediction routes
- `ml-models/models/artifacts/` - New trained model saved

---

## 📊 Data Persistence

### Storage Structure

```
User
├── healthProfile
│   ├── latestPrediction
│   │   ├── overallRiskLevel
│   │   ├── topThreats
│   │   ├── timestamp
│   │   └── recordId
│   ├── reports
│   └── lastUpdated
│
HealthRecord
├── patient (ObjectId → User)
├── vitals
├── wearable
├── labs
├── lifestyle
├── predictions
├── extractedData
├── analysis
└── createdAt (indexed)

Report
├── patient (ObjectId → User)
├── reportType
├── extractedData
├── analysis
├── uploadedAt (indexed)
└── expiresAt (TTL: 365 days)
```

### TTL Cleanup
- Reports auto-delete after 365 days
- HealthRecords retain indefinitely
- User profile keeps latest prediction + reports

---

## 🧪 Testing

### Run All Tests
```bash
cd e:\cardio-sentinel-main
npm install  # if needed
node testMLEnhancedPrediction.js
```

### Test Coverage
1. ✅ Patient registration/login
2. ✅ ML model information retrieval
3. ✅ High-risk prediction with extracted data
4. ✅ Normal-risk prediction
5. ✅ Prediction history retrieval
6. ✅ Data persistence verification

---

## 📈 Model Performance Metrics

### Accuracy Comparison

| Metric | 100-Sample Model | 500-Sample Model |
|--------|-----------------|-----------------|
| Accuracy | 80% | 70.67% |
| ROC AUC | 0.917 | 0.7754 |
| F1 Score | 0.889 | 0.6207 |
| Precision | 0.8 | 0.7182 |
| Recall | 1.0 | 0.6979 |
| Brier Score | 0.133 | 0.1852 |

**Note**: The 500-sample model has more realistic performance metrics due to better generalization and reduced overfitting. The 100-sample model appeared overfit with extreme precision/recall.

---

## 🚀 Usage Examples

### Example 1: High-Risk Patient

```bash
curl -X POST http://localhost:5000/api/disease-prediction/predict-enhanced \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
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
      "bloodSugar": 160
    },
    "lifestyle": {
      "age": 65,
      "smoking": "current",
      "familyHistory": true
    }
  }'
```

**Response**: Critical risk, heart disease + hypertension detection, detailed recommendations

### Example 2: Normal-Risk Patient

```bash
curl -X POST http://localhost:5000/api/disease-prediction/predict-enhanced \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "vitals": {
      "systolic": 120,
      "diastolic": 80,
      "heartRate": 72,
      "oxygenSaturation": 97,
      "bmi": 24
    },
    "lifestyle": {
      "age": 35,
      "smoking": "never",
      "familyHistory": false
    }
  }'
```

**Response**: Low risk, no significant threats, general wellness recommendations

---

## ⚠️ Clinical Disclaimers

1. **Not a Diagnosis**: ML predictions are probabilistic estimates, not clinical diagnoses
2. **Medical Review Required**: All predictions must be reviewed by qualified healthcare providers
3. **Model Limitations**: Trained on limited dataset; may not capture rare conditions
4. **Follow-up**: Use for screening; confirm with clinical assessment
5. **Liability**: System is for educational/informational purposes only

---

## 📝 Future Improvements

1. **Additional ML Models**: Add models for other diseases (COPD, Asthma, Diabetes)
2. **Larger Dataset**: Train on 1000+ samples for better accuracy
3. **Ensemble Methods**: Combine multiple ML algorithms
4. **Feature Engineering**: Add derived features (BP difference, heart rate variability)
5. **Real-time Monitoring**: Continuous prediction updates from wearables
6. **Model Versioning**: Track and compare different model versions

---

## 📞 Support

For issues or questions:
1. Check test output: `node testMLEnhancedPrediction.js`
2. Review MongoDB connection: Ensure Atlas is connected
3. Verify Python environment: `python mlModelService.py info`
4. Check API logs: Monitor backend console output
5. Validate data format: Ensure all required fields provided

---

**Last Updated**: March 21, 2026
**System Version**: ML-Enhanced v1.0
**Training Data**: 500 samples
**Model Accuracy**: 70.67%
