import numpy as np

def compute_baseline(values):
    if len(values) < 3:
        return None
    return {
        "mean": float(np.mean(values)),
        "std": float(np.std(values))
    }

def build_patient_baseline(records):
    hr, sys, dia, spo2 = [], [], [], []

    for r in records:
        v = r.vitals
        if v.heartRate: hr.append(v.heartRate)
        if v.systolic: sys.append(v.systolic)
        if v.diastolic: dia.append(v.diastolic)
        if v.oxygenSaturation: spo2.append(v.oxygenSaturation)

    return {
        "heartRate": compute_baseline(hr),
        "systolic": compute_baseline(sys),
        "diastolic": compute_baseline(dia),
        "oxygenSaturation": compute_baseline(spo2)
    }
