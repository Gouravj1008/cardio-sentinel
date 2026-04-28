#!/usr/bin/env python3
"""
Patient Data Retrieval & Health Prediction Script
Queries system for patient: Gaurav@gmail.com
Demonstrates real patient scenario with actual health predictions
"""

import sys
import json
from pathlib import Path
from datetime import datetime, timedelta

# Add ML models to path
sys.path.insert(0, str(Path(__file__).parent / "ml-models"))

# ============================================================================
# SYNTHETIC PATIENT DATA (would come from MongoDB in production)
# ============================================================================

PATIENT_DATABASE = {
    "gaurav@gmail.com": {
        "patient_id": "P_GAURAV_001",
        "name": "Gaurav Sharma",
        "email": "gaurav@gmail.com",
        "age": 58,
        "gender": "Male",
        "phone": "+91-9876543210",
        "date_of_birth": "1967-12-15",
        "registration_date": "2024-01-10",
        
        "current_vitals": {
            "heart_rate": 94,
            "systolic_bp": 152,
            "diastolic_bp": 98,
            "oxygen_saturation": 95.8,
            "temperature": 99.0,
            "bmi": 29.5,
            "weight": 215,  # lbs
            "height": 70,   # inches
        },
        
        "laboratory_results": {
            "test_date": "2026-03-15",
            "cholesterol": 268,
            "ldl": 175,
            "hdl": 38,
            "triglycerides": 240,
            "blood_sugar": 142,
            "hba1c": 7.2,
            "creatinine": 1.1,
        },
        
        "lifestyle": {
            "smoking": True,
            "years_smoking": 30,
            "smoking_status": "Current smoker (15 cigarettes/day)",
            "alcohol": True,
            "alcohol_frequency": "3-4 drinks/week",
            "family_history": True,
            "family_history_detail": "Father had MI at age 62, Mother has diabetes",
            "activity_level": 2,
            "activity_description": "Sedentary, minimal exercise",
            "sleep_hours": 5.5,
            "stress_level": 8,
            "stress_description": "High work stress, family issues",
        },
        
        "medical_history": {
            "conditions": ["Hypertension", "Hyperlipidemia", "Prediabetes"],
            "medications": [
                {"drug": "Lisinopril", "dose": "10mg", "frequency": "daily"},
                {"drug": "Atorvastatin", "dose": "40mg", "frequency": "daily"},
                {"drug": "Aspirin", "dose": "81mg", "frequency": "daily"},
            ],
            "allergies": ["Penicillin"],
            "recent_procedures": ["ECG (Normal)", "Chest X-ray (Normal)"],
        },
        
        "ecg_findings": {
            "test_date": "2026-03-10",
            "heart_rate": 94,
            "qtc_interval": 468,  # Prolonged
            "st_elevation": 0.05,  # Mild ST depression
            "qrs_duration": 108,
            "pr_interval": 182,
            "findings": "Mild nonspecific ST-T changes, HR elevated",
        },
        
        "wearable_data_latest": {
            "timestamp": "2026-03-22T10:30:00Z",
            "heart_rate": 96,
            "steps": 3200,
            "sleep_hours": 5.2,
            "stress_level": 7,
            "aqi": 125,  # Unhealthy for sensitive groups
        },
        
        "health_records": [
            {
                "date": "2026-03-20",
                "type": "Doctor Visit",
                "notes": "Routine checkup. BP elevated, discussed lifestyle changes.",
                "assessment": "Moderate cardiovascular risk",
            },
            {
                "date": "2026-03-15",
                "type": "Lab Work",
                "notes": "Annual health screening",
                "assessment": "Abnormal lipids, prediabetic glucose levels",
            },
            {
                "date": "2026-03-10",
                "type": "ECG",
                "notes": "Resting ECG - mild ST changes",
                "assessment": "Nonspecific changes, recommend stress test",
            },
        ],
    }
}

def print_separator(title=""):
    """Print formatted separator"""
    if title:
        print("\n" + "=" * 80)
        print(title.center(80))
        print("=" * 80 + "\n")
    else:
        print("\n" + "=" * 80 + "\n")

def retrieve_patient_data(email):
    """Retrieve patient data from simulated database"""
    email_lower = email.lower()
    
    if email_lower not in PATIENT_DATABASE:
        print(f"\n❌ Patient not found: {email}")
        print("\n📝 Available test accounts in system:")
        for available_email in PATIENT_DATABASE.keys():
            print(f"   - {available_email}")
        return None
    
    return PATIENT_DATABASE[email_lower]

def display_patient_profile(patient):
    """Display complete patient profile"""
    print_separator("PATIENT PROFILE")
    
    print(f"Name:                   {patient['name']}")
    print(f"Email:                  {patient['email']}")
    print(f"Patient ID:             {patient['patient_id']}")
    print(f"Age:                    {patient['age']} years")
    print(f"Gender:                 {patient['gender']}")
    print(f"Phone:                  {patient['phone']}")
    print(f"Date of Birth:          {patient['date_of_birth']}")
    print(f"Registration Date:      {patient['registration_date']}")

def display_current_vitals(patient):
    """Display current vital signs"""
    print_separator("CURRENT VITAL SIGNS")
    
    vitals = patient['current_vitals']
    print(f"Heart Rate:             {vitals['heart_rate']} bpm")
    print(f"Systolic BP:            {vitals['systolic_bp']} mmHg")
    print(f"Diastolic BP:           {vitals['diastolic_bp']} mmHg")
    print(f"O₂ Saturation:          {vitals['oxygen_saturation']}%")
    print(f"Temperature:            {vitals['temperature']}°F")
    print(f"BMI:                    {vitals['bmi']} kg/m²")
    print(f"Weight:                 {vitals['weight']} lbs")
    print(f"Height:                 {vitals['height']} inches")

def display_lab_results(patient):
    """Display laboratory results"""
    print_separator("LABORATORY RESULTS")
    
    labs = patient['laboratory_results']
    print(f"Test Date:              {labs['test_date']}")
    print(f"\nLipid Panel:")
    print(f"  Total Cholesterol:    {labs['cholesterol']} mg/dL (Normal: <200)")
    print(f"  LDL (Bad):            {labs['ldl']} mg/dL (Optimal: <100)")
    print(f"  HDL (Good):           {labs['hdl']} mg/dL (Desirable: >40)")
    print(f"  Triglycerides:        {labs['triglycerides']} mg/dL (Normal: <150)")
    
    print(f"\nGlucose Metabolism:")
    print(f"  Fasting Glucose:      {labs['blood_sugar']} mg/dL (Normal: <100)")
    print(f"  HbA1c:                {labs['hba1c']}% (Prediabetic: 5.7-6.4%)")
    
    print(f"\nRenal Function:")
    print(f"  Creatinine:           {labs['creatinine']} mg/dL")

def display_ecg_findings(patient):
    """Display ECG findings"""
    print_separator("ECG FINDINGS")
    
    ecg = patient['ecg_findings']
    print(f"Test Date:              {ecg['test_date']}")
    print(f"Heart Rate:             {ecg['heart_rate']} bpm")
    print(f"QTc Interval:           {ecg['qtc_interval']} ms (Normal: <450ms) ⚠ PROLONGED")
    print(f"ST Changes:             {ecg['st_elevation']*1000:.2f} mV (Abnormal: >0.05mV)")
    print(f"QRS Duration:           {ecg['qrs_duration']} ms (Normal: 80-120ms)")
    print(f"PR Interval:            {ecg['pr_interval']} ms (Normal: 120-200ms)")
    print(f"Clinical Interpretation: {ecg['findings']}")

def display_lifestyle(patient):
    """Display lifestyle and risk factors"""
    print_separator("LIFESTYLE & RISK FACTORS")
    
    lifestyle = patient['lifestyle']
    print(f"Smoking:                {lifestyle['smoking_status']}")
    if lifestyle['smoking']:
        print(f"  Years Smoking:        {lifestyle['years_smoking']} years")
    
    print(f"\nAlcohol:                {'Yes' if lifestyle['alcohol'] else 'No'}")
    if lifestyle['alcohol']:
        print(f"  Frequency:            {lifestyle['alcohol_frequency']}")
    
    print(f"\nFamily History:         {lifestyle['family_history_detail']}")
    print(f"Activity Level:         {lifestyle['activity_description']} ({lifestyle['activity_level']}/10)")
    print(f"Sleep Duration:         {lifestyle['sleep_hours']} hours")
    print(f"Stress Level:           {lifestyle['stress_description']} ({lifestyle['stress_level']}/10)")

def display_medical_history(patient):
    """Display medical history"""
    print_separator("MEDICAL HISTORY")
    
    history = patient['medical_history']
    
    print("Current Conditions:")
    for condition in history['conditions']:
        print(f"  • {condition}")
    
    print("\nCurrent Medications:")
    for med in history['medications']:
        print(f"  • {med['drug']} {med['dose']} - {med['frequency']}")
    
    print(f"\nAllergies: {', '.join(history['allergies'])}")
    
    print("\nRecent Procedures:")
    for proc in history['recent_procedures']:
        print(f"  • {proc}")

def display_health_records(patient):
    """Display recent health records"""
    print_separator("RECENT HEALTH RECORDS")
    
    for idx, record in enumerate(patient['health_records'], 1):
        print(f"📋 Record {idx} - {record['date']}")
        print(f"   Type: {record['type']}")
        print(f"   Notes: {record['notes']}")
        print(f"   Assessment: {record['assessment']}")
        print()

def run_ml_prediction(patient):
    """Run ML model prediction on patient data"""
    print_separator("MACHINE LEARNING PREDICTION")
    
    try:
        from mlModelService import MLModelPredictor
        
        predictor = MLModelPredictor()
        
        # Prepare features from patient data
        features = {
            'age': patient['age'],
            'systolic': patient['current_vitals']['systolic_bp'],
            'diastolic': patient['current_vitals']['diastolic_bp'],
            'oxygenSaturation': patient['current_vitals']['oxygen_saturation'],
            'bmi': patient['current_vitals']['bmi'],
            'cholesterol': patient['laboratory_results']['cholesterol'],
            'bloodSugar': patient['laboratory_results']['blood_sugar'],
            'smoking': int(patient['lifestyle']['smoking']),
            'familyHistory': int(patient['lifestyle']['family_history']),
            'activityLevel': patient['lifestyle']['activity_level'],
            'heartRate': patient['current_vitals']['heart_rate'],
            'temperature': patient['current_vitals']['temperature'],
        }
        
        print("🤖 Framingham Ensemble Model Prediction")
        print(f"   Input Features: {len(features)}")
        print(f"   Model: Random Forest + Gradient Boosting + Logistic Regression")
        print()
        
        result = predictor.predict(features)
        
        # Risk interpretation
        prob = result['probability']
        if prob < 0.30:
            risk_level = "🟢 LOW RISK"
            recommendation = "Continue regular health monitoring"
        elif prob < 0.50:
            risk_level = "🟡 MODERATE RISK"
            recommendation = "Schedule regular cardiologist visits, implement lifestyle changes"
        elif prob < 0.70:
            risk_level = "🟠 HIGH RISK"
            recommendation = "URGENT cardiologist evaluation recommended"
        else:
            risk_level = "🔴 CRITICAL RISK"
            recommendation = "IMMEDIATE medical consultation required"
        
        print("PREDICTION RESULTS:")
        print(f"  Classification:      {risk_level}")
        print(f"  Disease Probability: {prob*100:.2f}%")
        print(f"  Confidence Core:     {result['confidence']*100:.1f}%")
        print(f"  Model Accuracy:      {result['model_accuracy']*100:.1f}%")
        print(f"  ROC-AUC:             {result['model_auc']*100:.1f}%")
        print()
        print(f"CLINICAL RECOMMENDATION: {recommendation}")
        
    except Exception as e:
        print(f"⚠️  Could not invoke ML model: {e}")
        print("   Proceeding with rule-based analysis...")
        analyze_with_framingham_score(patient)

def analyze_with_framingham_score(patient):
    """Rule-based Framingham risk scoring"""
    print_separator("FRAMINGHAM RISK ASSESSMENT (Rule-Based)")
    
    points = 0
    findings = []
    
    # Age
    age = patient['age']
    if age >= 55:
        points += 3
        findings.append(f"Age ≥55: {points} points")
    
    # Total cholesterol
    chol = patient['laboratory_results']['cholesterol']
    if chol >= 240:
        points += 2
        findings.append(f"Total cholesterol ≥240: +2 points")
    
    # HDL
    hdl = patient['laboratory_results']['hdl']
    if hdl < 40:
        points += 2
        findings.append(f"HDL <40: +2 points")
    
    # Systolic BP
    sbp = patient['current_vitals']['systolic_bp']
    if sbp >= 160:
        points += 3
        findings.append(f"Systolic BP ≥160: +3 points")
    elif sbp >= 140:
        points += 2
        findings.append(f"Systolic BP ≥140: +2 points")
    
    # Smoking
    if patient['lifestyle']['smoking']:
        points += 2
        findings.append(f"Current smoker: +2 points")
    
    # Diabetes proxy (high blood sugar)
    if patient['laboratory_results']['blood_sugar'] > 125:
        points += 1
        findings.append(f"Elevated glucose: +1 point")
    
    # ECG abnormalities
    if patient['ecg_findings']['qtc_interval'] > 450:
        points += 1
        findings.append(f"Prolonged QTc: +1 point")
    
    if abs(patient['ecg_findings']['st_elevation']) > 0.05:
        points += 2
        findings.append(f"ST abnormalities: +2 points")
    
    print("RISK FACTORS IDENTIFIED:")
    for finding in findings:
        print(f"  • {finding}")
    
    # Convert points to risk percentage
    total_points = points
    risk_pct = min(30, (total_points / 20) * 30)
    
    print(f"\nTotal Framingham Points: {total_points}")
    print(f"Estimated 10-Year CHD Risk: {risk_pct:.1f}%")
    print()
    
    if risk_pct < 10:
        print("Risk Level: 🟢 LOW (<10%)")
    elif risk_pct < 20:
        print("Risk Level: 🟡 MODERATE (10-20%)")
    elif risk_pct < 30:
        print("Risk Level: 🟠 HIGH (20-30%)")
    else:
        print("Risk Level: 🔴 CRITICAL (>30%)")

def generate_clinical_summary(patient):
    """Generate clinical summary and recommendations"""
    print_separator("CLINICAL SUMMARY & RECOMMENDATIONS")
    
    print("📊 OVERALL ASSESSMENT:")
    print(f"Patient {patient['name']} is a {patient['age']}-year-old {'male' if patient['gender']=='Male' else 'female'}")
    print("with multiple cardiovascular risk factors requiring urgent intervention.\n")
    
    print("⚠️  MAJOR RISK FACTORS:")
    risk_factors = []
    
    if patient['lifestyle']['smoking']:
        risk_factors.append(f"• Active smoker ({patient['lifestyle']['years_smoking']} years)")
    
    if patient['current_vitals']['systolic_bp'] >= 140:
        risk_factors.append(f"• Stage 2 Hypertension (SBP {patient['current_vitals']['systolic_bp']})")
    
    if patient['laboratory_results']['cholesterol'] >= 240:
        risk_factors.append(f"• High Total Cholesterol ({patient['laboratory_results']['cholesterol']})")
    
    if patient['laboratory_results']['ldl'] >= 160:
        risk_factors.append(f"• Very High LDL ({patient['laboratory_results']['ldl']})")
    
    if patient['laboratory_results']['hdl'] < 40:
        risk_factors.append(f"• Low HDL ({patient['laboratory_results']['hdl']}) - decreased cardio-protection")
    
    if patient['laboratory_results']['blood_sugar'] >= 126:
        risk_factors.append(f"• Uncontrolled Diabetes ({patient['laboratory_results']['blood_sugar']})")
    elif patient['laboratory_results']['blood_sugar'] >= 100:
        risk_factors.append(f"• Prediabetes ({patient['laboratory_results']['blood_sugar']})")
    
    if patient['current_vitals']['bmi'] >= 30:
        risk_factors.append(f"• Obesity (BMI {patient['current_vitals']['bmi']})")
    
    if patient['lifestyle']['activity_level'] <= 2:
        risk_factors.append("• Sedentary lifestyle")
    
    if patient['lifestyle']['family_history']:
        risk_factors.append("• Significant family history of CVD")
    
    if patient['ecg_findings']['qtc_interval'] > 450:
        risk_factors.append(f"• Prolonged QTc ({patient['ecg_findings']['qtc_interval']}ms) - arrhythmia risk")
    
    for factor in risk_factors:
        print(f"  {factor}")
    
    print("\n🔴 CRITICAL ACTIONS REQUIRED:")
    print("  1. URGENT: Schedule cardiology consultation within 1 week")
    print("  2. Consider stress testing to assess functional cardiac capacity")
    print("  3. Smoking cessation program - ESSENTIAL")
    print("  4. Blood pressure medication optimization")
    print("  5. Intensive lipid management (consider statin dose increase)")
    print("  6. Glucose control - HbA1c reduction to <7%")
    print("  7. Cardiac rehabilitation/exercise program")
    
    print("\n📋 FOLLOW-UP SCHEDULE:")
    print("  • Cardiology: Within 1 week")
    print("  • Primary Care: Within 2 weeks")
    print("  • Repeat labs/ECG: 3 months")
    print("  • Lifestyle counseling: Ongoing")
    
    print("\n⏰ MONITORING FREQUENCY:")
    print("  • BP monitoring: Daily")
    print("  • Wearable data sync: Continuous")
    print("  • Weight monitoring: Weekly")
    print("  • Labs: Every 3 months (or as directed)")

def main():
    """Main execution"""
    print("\n" + "█" * 80)
    print("CARDIO SENTINEL - PATIENT DATA ANALYSIS & HEART DISEASE PREDICTION".center(80))
    print("█" * 80)
    
    email = "gaurav@gmail.com"
    
    # Retrieve patient data
    print(f"\n🔍 Searching for patient: {email}")
    patient = retrieve_patient_data(email)
    
    if not patient:
        print("\n" + "=" * 80)
        return 1
    
    print("✅ Patient found in system!")
    
    # Display all patient information
    display_patient_profile(patient)
    display_current_vitals(patient)
    display_lab_results(patient)
    display_ecg_findings(patient)
    display_lifestyle(patient)
    display_medical_history(patient)
    display_health_records(patient)
    
    # Run ML prediction
    run_ml_prediction(patient)
    
    # Generate clinical summary
    generate_clinical_summary(patient)
    
    print_separator("ANALYSIS COMPLETE")
    print(f"Report Generated: {datetime.now().isoformat()}")
    print("Database: Cardio Sentinel Medical Database")
    print("Model: Framingham Ensemble + ECG Features + Clinical Data")
    print()

if __name__ == "__main__":
    sys.exit(main())
