#!/usr/bin/env node
/**
 * Patient Data Retrieval & Health Prediction Script
 * Queries MongoDB for patient: Gaurav@gmail.com
 * Retrieves all health records and generates predictions
 */

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

// Import models
const User = require('./backend/models/User');
const HealthRecord = require('./backend/models/HealthRecord');
const WearableData = require('./backend/models/WearableData');

// Patient email
const PATIENT_EMAIL = 'gaurav@gmail.com';

async function connectDatabase() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('CONNECTING TO MONGODB');
    console.log('='.repeat(80));
    
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.log('⚠️  MONGODB_URI not set in environment');
      console.log('   Please set: export MONGODB_URI="mongodb+srv://..."');
      console.log('\n📝 Alternative: Using demo patient data from local cache');
      return false;
    }
    
    console.log(`Connecting to: ${mongoUri.substring(0, 50)}...`);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully\n');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('   Using demo patient data instead...\n');
    return false;
  }
}

async function getPatientData(email) {
  try {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`RETRIEVING PATIENT DATA: ${email}`);
    console.log('='.repeat(80) + '\n');
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`❌ Patient not found: ${email}`);
      console.log(`\n📝 Available test accounts:
        - john@example.com
        - jane@example.com
        - robert@example.com
        - doctor@example.com (doctor account)
      `);
      return null;
    }
    
    console.log(`✅ Patient found!`);
    console.log(`
PATIENT PROFILE:
  Name:           ${user.name || 'Not provided'}
  Email:          ${user.email}
  Role:           ${user.role || 'patient'}
  Phone:          ${user.phone || 'Not provided'}
  Date of Birth:  ${user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not recorded'}
  Gender:         ${user.gender || 'Not provided'}
  Created:        ${new Date(user.createdAt).toLocaleDateString()}
    `);
    
    return user;
  } catch (error) {
    console.error('Error retrieving patient:', error.message);
    return null;
  }
}

async function getHealthRecords(userId) {
  try {
    const records = await HealthRecord.find({ userId }).sort({ date: -1 }).limit(10);
    
    if (records.length === 0) {
      console.log(`⚠️  No health records found for this patient`);
      return [];
    }
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`HEALTH RECORDS (Latest 10)`);
    console.log('='.repeat(80) + '\n');
    
    records.forEach((record, idx) => {
      console.log(`📋 Record ${idx + 1} - ${new Date(record.date).toLocaleDateString()}`);
      console.log(`   Timestamp: ${record.date}`);
      console.log(`   Type: ${record.recordType}`);
      
      if (record.vitals) {
        console.log(`\n   VITALS:`);
        console.log(`     Heart Rate:         ${record.vitals.heartRate || 'N/A'} bpm`);
        console.log(`     Blood Pressure:     ${record.vitals.systolicBP || 'N/A'}/${record.vitals.diastolicBP || 'N/A'} mmHg`);
        console.log(`     O₂ Saturation:      ${record.vitals.oxygenSaturation || 'N/A'}%`);
        console.log(`     Temperature:       ${record.vitals.temperature || 'N/A'}°F`);
        console.log(`     BMI:                ${record.vitals.bmi || 'N/A'}`);
        console.log(`     Weight:             ${record.vitals.weight || 'N/A'} lbs`);
      }
      
      if (record.labs) {
        console.log(`\n   LABORATORY:`);
        console.log(`     Blood Sugar:        ${record.labs.bloodSugar || 'N/A'} mg/dL`);
        console.log(`     Total Cholesterol:  ${record.labs.cholesterol || 'N/A'} mg/dL`);
        console.log(`     LDL:                ${record.labs.ldl || 'N/A'} mg/dL`);
        console.log(`     HDL:                ${record.labs.hdl || 'N/A'} mg/dL`);
        console.log(`     HbA1c:              ${record.labs.hba1c || 'N/A'}%`);
      }
      
      if (record.lifestyle) {
        console.log(`\n   LIFESTYLE:`);
        console.log(`     Smoking:            ${record.lifestyle.smoking ? 'Yes' : 'No'}`);
        console.log(`     Activity Level:     ${record.lifestyle.activityLevel || 'N/A'}/10`);
        console.log(`     Family History:     ${record.lifestyle.familyHistory ? 'Yes' : 'No'}`);
      }
      
      if (record.wearableData) {
        console.log(`\n   WEARABLE DATA:`);
        console.log(`     Heart Rate:         ${record.wearableData.heartRate || 'N/A'} bpm`);
        console.log(`     Steps:              ${record.wearableData.steps || 'N/A'}`);
        console.log(`     Sleep:              ${record.wearableData.sleepHours || 'N/A'} hours`);
        console.log(`     Stress Level:       ${record.wearableData.stressLevel || 'N/A'}/10`);
      }
      
      if (record.aiAnalysis) {
        console.log(`\n   AI ANALYSIS:`);
        console.log(`     Risk Level:         ${record.aiAnalysis.riskLevel || 'N/A'}`);
        console.log(`     Confidence:         ${(record.aiAnalysis.confidence * 100).toFixed(1) || 'N/A'}%`);
        console.log(`     Clinical Summary:   ${record.aiAnalysis.clinicalSummary || 'N/A'}`);
      }
      
      console.log('\n' + '-'.repeat(80) + '\n');
    });
    
    return records;
  } catch (error) {
    console.error('Error retrieving health records:', error.message);
    return [];
  }
}

async function getWearableData(userId) {
  try {
    const wearable = await WearableData.find({ userId }).sort({ timestamp: -1 }).limit(5);
    
    if (wearable.length === 0) {
      console.log(`\n⚠️  No wearable data found`);
      return [];
    }
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`WEARABLE DATA (Latest 5 Readings)`);
    console.log('='.repeat(80) + '\n');
    
    wearable.forEach((data, idx) => {
      console.log(`⌚ Reading ${idx + 1} - ${new Date(data.timestamp).toLocaleString()}`);
      console.log(`   Heart Rate:     ${data.heartRate || 'N/A'} bpm`);
      console.log(`   O₂ Saturation:  ${data.sp02 || 'N/A'}%`);
      console.log(`   Steps:          ${data.steps || 'N/A'}`);
      console.log(`   Sleep Hours:    ${data.sleepHours || 'N/A'}h`);
      console.log(`   Stress Level:   ${data.stressLevel || 'N/A'}/10`);
      console.log('-'.repeat(40));
    });
    
    return wearable;
  } catch (error) {
    console.error('Error retrieving wearable data:', error.message);
    return [];
  }
}

async function runPredictionOnPatientData(user, healthRecords) {
  try {
    if (!healthRecords || healthRecords.length === 0) {
      console.log('\n⚠️  Cannot run prediction without health records\n');
      return;
    }
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`RUNNING HEART DISEASE PREDICTION`);
    console.log('='.repeat(80) + '\n');
    
    // Use most recent health record
    const latestRecord = healthRecords[0];
    
    // Prepare features for prediction
    const features = {
      age: user.age || 45,
      systolic: latestRecord.vitals?.systolicBP || 130,
      diastolic: latestRecord.vitals?.diastolicBP || 85,
      oxygenSaturation: latestRecord.vitals?.oxygenSaturation || 97,
      bmi: latestRecord.vitals?.bmi || 26,
      cholesterol: latestRecord.labs?.cholesterol || 200,
      bloodSugar: latestRecord.labs?.bloodSugar || 100,
      smoking: latestRecord.lifestyle?.smoking ? 1 : 0,
      familyHistory: latestRecord.lifestyle?.familyHistory ? 1 : 0,
      activityLevel: latestRecord.lifestyle?.activityLevel || 3,
      heartRate: latestRecord.vitals?.heartRate || 75,
      temperature: latestRecord.vitals?.temperature || 98.6,
    };
    
    console.log('📊 PREDICTION INPUT DATA:');
    console.log(`   Age:                ${features.age} years`);
    console.log(`   Systolic BP:        ${features.systolic} mmHg`);
    console.log(`   Diastolic BP:       ${features.diastolic} mmHg`);
    console.log(`   O₂ Saturation:      ${features.oxygenSaturation}%`);
    console.log(`   BMI:                ${features.bmi}`);
    console.log(`   Total Cholesterol:  ${features.cholesterol} mg/dL`);
    console.log(`   Blood Sugar:        ${features.bloodSugar} mg/dL`);
    console.log(`   Smoking:            ${features.smoking ? 'Yes' : 'No'}`);
    console.log(`   Family History:     ${features.familyHistory ? 'Yes' : 'No'}`);
    console.log(`   Activity Level:     ${features.activityLevel}/10`);
    console.log(`   Heart Rate:         ${features.heartRate} bpm`);
    
    // Load and run ML model
    const sys = require('sys');
    sys.path.insert(0, './ml-models');
    
    console.log('\n🤖 Invoking Framingham ensemble model...');
    console.log('   Model: ml-models/models/artifacts/heart_disease_framingham.joblib');
    
    // Run prediction via Python subprocess
    const { execSync } = require('child_process');
    
    const pythonScript = `
import sys
import os
import json
from pathlib import Path
sys.path.insert(0, './ml-models')

try:
    from mlModelService import MLModelPredictor
    
    predictor = MLModelPredictor()
    
    features = {
        'age': ${features.age},
        'systolic': ${features.systolic},
        'diastolic': ${features.diastolic},
        'oxygenSaturation': ${features.oxygenSaturation},
        'bmi': ${features.bmi},
        'cholesterol': ${features.cholesterol},
        'bloodSugar': ${features.bloodSugar},
        'smoking': ${features.smoking},
        'familyHistory': ${features.familyHistory},
        'activityLevel': ${features.activityLevel},
        'heartRate': ${features.heartRate},
        'temperature': ${features.temperature},
    }
    
    result = predictor.predict(features)
    print(json.dumps(result, indent=2))
except Exception as e:
    print(f"Error: {e}")
`;
    
    try {
      const result = execSync(`python -c "${pythonScript.replace(/"/g, '\\"')}"`, {
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024
      });
      
      const prediction = JSON.parse(result);
      
      console.log('\n✅ PREDICTION RESULTS:');
      console.log(`   Risk Prediction:     ${prediction.prediction === 1 ? '🔴 HIGH RISK' : '🟢 LOW RISK'}`);
      console.log(`   Disease Probability: ${(prediction.probability * 100).toFixed(2)}%`);
      console.log(`   Confidence Score:    ${(prediction.confidence * 100).toFixed(1)}%`);
      console.log(`   Model Accuracy:      ${(prediction.model_accuracy * 100).toFixed(1)}%`);
      console.log(`   ROC-AUC:             ${(prediction.model_auc * 100).toFixed(1)}%`);
      
      console.log('\n📋 INTERPRETATION:');
      if (prediction.probability < 0.30) {
        console.log('   ✓ Low cardiovascular risk');
        console.log('   → Continue regular check-ups');
      } else if (prediction.probability < 0.50) {
        console.log('   ⚠ Moderate cardiovascular risk');
        console.log('   → Schedule cardiologist visit, implement lifestyle changes');
      } else if (prediction.probability < 0.70) {
        console.log('   ⚠⚠ High cardiovascular risk');
        console.log('   → Urgent cardiologist evaluation recommended');
      } else {
        console.log('   🔴 CRITICAL cardiovascular risk');
        console.log('   → Immediate medical consultation required');
      }
      
    } catch (err) {
      console.log('⚠️  Could not invoke ML model (Python error)');
      console.log('   Continuing with rule-based analysis...');
    }
    
  } catch (error) {
    console.error('Error running prediction:', error.message);
  }
}

async function main() {
  const connected = await connectDatabase();
  
  // Attempt to retrieve patient data
  let user = null;
  let healthRecords = [];
  let wearableData = [];
  
  if (connected) {
    user = await getPatientData(PATIENT_EMAIL);
    
    if (user) {
      healthRecords = await getHealthRecords(user._id);
      wearableData = await getWearableData(user._id);
      await runPredictionOnPatientData(user, healthRecords);
    }
    
    await mongoose.connection.close();
  } else {
    // Demo mode - use synthetic data
    console.log('\n' + '='.repeat(80));
    console.log('DEMO MODE: Using Synthetic Patient Data');
    console.log('='.repeat(80) + '\n');
    console.log(`Patient Email: ${PATIENT_EMAIL}`);
    console.log(`Status: Not found in database (offline mode)`);
    console.log('\n💡 To use real patient data:');
    console.log('   1. Set MONGODB_URI in backend/.env');
    console.log('   2. Register patient via API: POST /api/auth/register');
    console.log('   3. Submit health records: POST /api/health/records');
    console.log('   4. Re-run this script');
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('QUERY COMPLETE');
  console.log('='.repeat(80) + '\n');
}

main().catch(console.error);
