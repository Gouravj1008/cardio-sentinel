// backend/services/mlService.js

/**
 * Lightweight local Algorithmic Risk Prediction Engine
 * Evaluates real patient HealthRecords to generate a cardiovascular risk score.
 */

exports.analyzeHealthRecord = (recordData) => {
    const { vitals, labResults } = recordData;
    let riskScore = 0;
    let riskFactors = [];
    let recommendations = [];
    let trendDetected = "Stable baseline maintained.";

    // 1. Evaluate Blood Pressure (Systolic)
    if (vitals?.bloodPressure?.systolic) {
        const sys = vitals.bloodPressure.systolic;
        if (sys > 180) {
            riskScore += 40;
            riskFactors.push("Hypertensive Crisis (Systolic > 180)");
            recommendations.push("Immediate medical attention required for severe hypertension.");
            trendDetected = "Critical BP spike detected.";
        } else if (sys > 140) {
            riskScore += 20;
            riskFactors.push("Stage 2 Hypertension");
            recommendations.push("Prescribe/adjust anti-hypertensive medication. Recommend daily monitoring.");
            trendDetected = "Elevated systolic pressure observed.";
        } else if (sys > 130) {
            riskScore += 10;
            riskFactors.push("Stage 1 Hypertension");
            recommendations.push("Recommend lifestyle changes (sodium reduction, exercise).");
        }
    }

    // 2. Evaluate Heart Rate
    if (vitals?.heartRate) {
        const hr = vitals.heartRate;
        if (hr > 120 || hr < 40) {
            riskScore += 25;
            riskFactors.push(hr > 120 ? "Tachycardia (Resting HR > 120)" : "Severe Bradycardia (Resting HR < 40)");
            recommendations.push("Perform primary ECG to check for arrhythmias.");
            trendDetected = "Arrhythmia indicators present.";
        } else if (hr > 100) {
            riskScore += 10;
            riskFactors.push("Elevated Resting Heart Rate");
        }
    }

    // 3. Evaluate Oxygen Saturation
    if (vitals?.oxygenSaturation) {
        const spo2 = vitals.oxygenSaturation;
        if (spo2 < 90) {
            riskScore += 30;
            riskFactors.push("Severe Hypoxemia (SpO2 < 90%)");
            recommendations.push("Administer supplemental oxygen immediately.");
            trendDetected = "Critical drop in oxygen saturation.";
        } else if (spo2 < 95) {
            riskScore += 15;
            riskFactors.push("Mild Hypoxemia");
        }
    }

    // 4. Evaluate BMI (Obesity Factor)
    if (vitals?.bmi) {
        if (vitals.bmi >= 30) {
            riskScore += 10;
            riskFactors.push("Obesity Risk Factor");
            recommendations.push("Dietary consultation and weight management plan.");
        }
    }

    // 5. Evaluate Lab Results (Cholesterol)
    if (labResults?.cholesterol?.ldl) {
        if (labResults.cholesterol.ldl > 160) {
            riskScore += 15;
            riskFactors.push("High LDL Cholesterol");
            recommendations.push("Consider statin therapy initiation or adjustment.");
        }
    }

    // Cap risk score at 100
    riskScore = Math.min(riskScore, 100);

    let riskLevel = "Low";
    if (riskScore >= 60) {
        riskLevel = "High";
    } else if (riskScore >= 30) {
        riskLevel = "Moderate";
    }

    // Set confidence based on amount of data provided
    let dataPoints = 0;
    if (vitals?.bloodPressure) dataPoints++;
    if (vitals?.heartRate) dataPoints++;
    if (vitals?.oxygenSaturation) dataPoints++;
    if (labResults?.cholesterol) dataPoints++;

    const confidence = Math.min(40 + (dataPoints * 15), 98); // Max 98% confidence

    if (riskScore === 0) {
        riskFactors.push("No significant immediate risk factors detected.");
        recommendations.push("Continue routine annual checkups.");
    }

    return {
        riskScore,
        riskLevel,
        trendDetected,
        riskFactors,
        recommendations,
        confidence
    };
};
