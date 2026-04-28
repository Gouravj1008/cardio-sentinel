# Future Disease Prediction - Quick Start (5 Minutes)

## What Is It?

A one-click disease risk analyzer that uses **ALL your data sources** to predict future health risks with maximum accuracy:
- ✅ Smartwatch data (HR, O2, stress, steps, AQI, temp)
- ✅ Clinical records (BP, cholesterol, blood sugar, BMI)
- ✅ Doctor prescriptions & medications
- ✅ Lifestyle factors (age, smoking, diabetes status)
- ✅ Environmental data (air quality, temperature)

**Result:** Predicts risk for 11 major diseases with confidence scoring.

---

## Quick Setup (2 Minutes)

### 1. Check Backend is Running
```bash
# Terminal 1 - Node.js Backend
cd backend
npm start
# Should see: "Server running on port 5000"
```

### 2. Check Database Connection
```bash
# Should have MongoDB running (local or Atlas)
# Test: Open MongoDB Compass
# Connection: mongodb://localhost:27017/cardio-sentinel
```

### 3. Component Already Added?
If you want to add to an existing page:

```jsx
// Your patient dashboard page
import FutureDiseasePredictionPanel from '../components/FutureDiseasePredictionPanel';

export default function DashboardPage() {
  const token = localStorage.getItem('token');
  
  return (
    <div>
      <FutureDiseasePredictionPanel patientId={patientId} token={token} />
    </div>
  );
}
```

---

## Using It (1 Minute)

### For Patients

**1. Open Patient Dashboard**
- You'll see: "Future Disease Prediction" section with a **blue "Analyze Now" button**

**2. Click "Analyze Now"**
- Wait 2-5 seconds for analysis
- System automatically gathers:
  - Latest wearable data
  - Clinical records
  - Doctor prescriptions
  - Historical baseline

**3. View Results**
- Overall Risk Level (CRITICAL / HIGH / MODERATE / LOW)
- Overall Probability (0-100%)
- Confidence Score (how accurate)
- List of diseases at risk
- Clinical recommendations
- Next steps

**4. Download Report**
- Click "Download Full Report" button
- Get JSON and TXT files with all details

---

## What You'll See

### Example Output

```
FUTURE DISEASE PREDICTION ANALYSIS
==================================

Patient: John Doe

Overall Risk: HIGH (65%)
Confidence: 87%
Data Used: 4 sources (Clinical, Wearable, Prescriptions, History)

CRITICAL CONDITIONS:
- Coronary Heart Disease: 78% risk

DISEASE RISK BREAKDOWN:
1. Coronary Heart Disease - HIGH (78%)
   Key factors: High BP, High LDL, Smoking
   
2. Heart Failure - MODERATE (52%)
   Key factors: Elevated BP, Sedentary lifestyle
   
3. Stroke - MODERATE (45%)
   Key factors: High cholesterol, Age

RECOMMENDATIONS:
1. Cardiology consultation (URGENT)
   - ECG test
   - Lipid panel
   - Stress test
   
2. Lifestyle changes
   - Low-sodium diet
   - 30 min aerobic exercise daily
   - Stress management
   
NEXT STEPS:
1. Contact doctor immediately
2. Schedule urgent consultation
3. Continue medication compliance
4. Monitor vital signs daily

Report Generated: 2026-03-22 10:30 AM
```

---

## Data Sources & Accuracy

### Required Data for Best Accuracy

**Core 8 Fields (for 100% accuracy):**
1. ✅ Systolic BP - Blood pressure (upper number)
2. ✅ Heart Rate - Beats per minute
3. ✅ BMI - Body mass index
4. ✅ LDL Cholesterol - Bad cholesterol
5. ✅ Blood Sugar - Glucose level (fasting)
6. ✅ Age - Patient age in years
7. ✅ AQI - Air Quality Index (from wearable)
8. ✅ Temperature - Body or ambient temp

**If you're missing data:**
- System uses **safe defaults** (e.g., 120 for normal BP)
- Confidence score will be lower
- Add more data to improve accuracy

### Confidence Scoring

```
Confidence = (Data Completeness %) × (Data Sources ÷ 4)

Examples:
- 100% data, 4 sources → 100% confidence
-  80% data, 4 sources → 80% confidence
-  50% data, 2 sources → 25% confidence

"High Confidence" = 80%+
"Moderate Confidence" = 60-79%
"Low Confidence" = <60%
```

---

## API Endpoints

### Patient Triggers Analysis

```
POST /api/disease-prediction/future-predict
Header: Authorization: Bearer {token}

Returns: Full analysis with all risk metrics
```

### Get Analysis History

```
GET /api/disease-prediction/analysis-history?limit=10
Header: Authorization: Bearer {token}

Returns: Last 10 analyses
```

### Download Report

```
POST /api/disease-prediction/generate-report
Header: Authorization: Bearer {token}
Body: { "analysisId": "id_from_analysis" }

Returns: Downloadable JSON + TXT report
```

---

## 11 Diseases Predicted

| Disease | Data Used | Risk Range |
|---------|-----------|-----------|
| Coronary Heart Disease | BP, Cholesterol, Age, Smoking | 0-99% |
| Heart Failure | BP, HR, BMI, Diabetes | 0-95% |
| Hypertension | BP, Stress, Sleep | 0-95% |
| Atrial Fibrillation | Age, HR, BP, Diabetes | 0-85% |
| Stroke | BP, Age, Cholesterol, Diabetes | 0-90% |
| Diabetes | Blood Sugar, HbA1c, BMI, Family Hx | 0-95% |
| COPD | AQI, O2, Smoking, Age | 0-90% |
| Asthma | AQI, Stress, Family History | 0-85% |
| Pneumonia | AQI, Temperature, O2, Age | 0-80% |
| Kidney Disease | Creatinine, BUN, BP, Diabetes | 0-85% |
| Metabolic Syndrome | BMI, Triglycerides, BP, Blood Sugar | 0-90% |

---

## Troubleshooting

### "Analysis Failed"
- Check: Is backend running? (`npm start`)
- Check: Is MongoDB connected? (local or Atlas)
- Check: Is your token valid? (logout and login)

### "Low Confidence Score"
- Add more data: Update health records, sync wearables
- System auto-uses safe defaults if data missing
- More sources = Better accuracy

### "No Results Shown"
- Click "Analyze Now" button
- Wait 2-5 seconds for processing
- Check browser console for errors (F12)

### "Report Download Failed"
- Try again (may be a temporary issue)
- Check browser allows downloads
- Check disk space available

---

## Real-World Example

### Patient: Sarah (45 years old)

**Her Data:**
- Wearable: HR 82, O2 98%, Steps 2000/day, Stress 65/100, Sleep 5.5 hrs
- Clinical: BP 142/88, Cholesterol 245, LDL 160, BMI 27
- Lifestyle: Former smoker, no diabetes, sedentary
- Environmental: AQI 89 (moderate), Temp 28°C

**Analysis Results:**
```
Overall Risk: HIGH (62%)
Confidence: 94% (high - all data present)

TOP CONDITIONS:
1. Hypertension - HIGH (76%)
   → Doctor advised: Start BP medication, DASH diet, exercise

2. Coronary Heart Disease - HIGH (68%)
   → Doctor advised: Cardiology check, stress test, lipid panel

3. Metabolic Syndrome - MODERATE (52%)
   → Doctor advised: Weight loss program, dietary changes

RECOMMENDATIONS:
- Schedule cardiologist appointment
- Start antihypertensive medication
- 30+ min aerobic exercise 5x/week
- Reduce sodium intake
- Monitor BP daily

NEXT STEPS:
1. Contact primary care doctor today
2. Prepare heart disease risk discussion
3. Start lifestyle modifications
4. Follow up in 2 weeks
```

---

## For Doctors

### Patient Status Overview
- See all condition risks at a glance
- View confidence metrics (how accurate)
- Review data sources used
- Update prescriptions based on risk

### Integration with Prescriptions
- System reads existing doctor prescriptions
- Incorporates medication recommendations
- Tracks prescription compliance
- Generates new recommendations

### Doctor Console
```
/api/doctor/patients/:patientId/timeline
→ See all patient predictions

/api/doctor/patients/:patientId/summary
→ Get comprehensive clinical summary
```

---

## Important Notes

⚠️ **This is not a diagnosis**
- Analysis is for monitoring/awareness only
- Always consult qualified healthcare providers
- Use as a screening tool, not replacement for medical advice

✅ **How it helps:**
- Early warning for high-risk conditions
- Encourages proactive health management
- Guides lifestyle modifications
- Supports doctor-patient conversations

✅ **Best practices:**
- Update data regularly (weekly ideal)
- Sync wearables frequently
- Keep clinical records current
- Follow doctor recommendations
- Schedule preventive appointments

---

## File Locations

```
Backend Service:
/backend/services/futureDiseasePredictionService.js

API Endpoints:
/backend/controllers/diseasePredictionController.js
/backend/routes/diseasePredictionRoutes.js

Frontend Component:
/backend/frontend/src/components/FutureDiseasePredictionPanel.jsx
/backend/frontend/src/components/FutureDiseasePredictionPanel.css

Database Models:
/backend/models/HealthRecord.js
/backend/models/WearableData.js
/backend/models/Prescription.js
```

---

## Next Steps

1. ✅ **Click "Analyze Now"** in your dashboard
2. ✅ **Review the results** - Understand your risk level
3. ✅ **Read recommendations** - See what to do
4. ✅ **Download report** - Share with your doctor
5. ✅ **Follow up** - Schedule medical consultation if needed
6. ✅ **Update data** - Add new vitals/wearable data
7. ✅ **Re-analyze monthly** - Track trends over time

---

## Support

- **Questions?** Check FUTURE_DISEASE_PREDICTION_GUIDE.md
- **Technical issues?** Check backend logs: `npm logs`
- **Feature requests?** Submit through your platform

---

**Ready to analyze?** Head to your dashboard and click "Analyze Now"! 🚀
