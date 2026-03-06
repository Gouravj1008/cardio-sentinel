from models.baseline_model import build_patient_baseline
from models.deviation_model import check_deviation

def analyze_with_baseline(records, current_record):
    baseline = build_patient_baseline(records)

    deviations = {}

    v = current_record.get("vitals", {})
    for key in ["heartRate", "systolic", "diastolic", "oxygenSaturation"]:
        if key in v and baseline.get(key):
            deviations[key] = check_deviation(
                v[key], baseline[key]
            )

    return {
        "baselineStatus": deviations,
        "clinicalNote": "Deviation detected from patient-specific baseline"
    }
