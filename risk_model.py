import numpy as np

def calculate_cardio_risk(vitals: dict) -> dict:
    """
    Rule + score based cardio risk (WHO aligned)
    """

    risk = 0
    factors = []

    hr = vitals.get("heartRate")
    sys = vitals.get("systolic")
    dia = vitals.get("diastolic")
    spo2 = vitals.get("oxygenSaturation")
    bmi = vitals.get("bmi")

    if hr and hr > 100:
        risk += 15
        factors.append("High resting heart rate")

    if sys and dia:
        if sys > 140 or dia > 90:
            risk += 25
            factors.append("Hypertension detected")

    if spo2 and spo2 < 94:
        risk += 20
        factors.append("Low oxygen saturation")

    if bmi:
        if bmi > 30:
            risk += 15
            factors.append("Obesity risk")

    risk = min(risk, 100)

    return {
        "riskScore": risk,
        "riskFactors": factors
    }
