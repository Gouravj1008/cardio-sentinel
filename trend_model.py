import numpy as np

def detect_trends(records):
    """
    Detect worsening or improving cardio patterns
    """
    heart_rates = []
    systolic_bp = []

    for r in records:
        if r.vitals.heartRate:
            heart_rates.append(r.vitals.heartRate)
        if r.vitals.systolic:
            systolic_bp.append(r.vitals.systolic)

    trends = []

    if len(heart_rates) >= 3:
        slope = np.polyfit(range(len(heart_rates)), heart_rates, 1)[0]
        if slope > 1:
            trends.append("Increasing heart rate trend detected")

    if len(systolic_bp) >= 3:
        slope = np.polyfit(range(len(systolic_bp)), systolic_bp, 1)[0]
        if slope > 1:
            trends.append("Worsening blood pressure trend")

    return trends
