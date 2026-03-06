from models.risk_model import calculate_cardio_risk
from models.trend_model import detect_trends

def analyze_record(record):
    vitals = record.get("vitals", {})

    risk_output = calculate_cardio_risk(vitals)

    return {
        "riskScore": risk_output["riskScore"],
        "riskFactors": risk_output["riskFactors"],
        "recommendations": [
            "Consult cardiologist",
            "Daily BP monitoring",
            "Lifestyle modification"
        ],
        "confidence": 0.82
    }

def analyze_longitudinal(records):
    trends = detect_trends(records)

    return {
        "trendDetected": trends,
        "summary": "Progressive cardiovascular risk" if trends else "Stable condition"
    }
