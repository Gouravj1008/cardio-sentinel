const Baseline = require('../models/Baseline');
const HealthRecord = require('../models/HealthRecord');

exports.updateBaseline = async (patientId) => {
  const records = await HealthRecord.find({ patient: patientId })
    .sort({ recordDate: 1 })
    .limit(20);

  if (records.length < 3) return;

  const vitals = {
    heartRate: records.map(r => r.vitals.heartRate).filter(Boolean),
    systolic: records.map(r => r.vitals.bloodPressure?.systolic).filter(Boolean),
    diastolic: records.map(r => r.vitals.bloodPressure?.diastolic).filter(Boolean),
    oxygenSaturation: records.map(r => r.vitals.oxygenSaturation).filter(Boolean)
  };

  const calc = arr => ({
    mean: arr.reduce((a,b)=>a+b,0)/arr.length,
    std: Math.sqrt(arr.map(x=>Math.pow(x - arr.reduce((a,b)=>a+b,0)/arr.length,2)).reduce((a,b)=>a+b,0)/arr.length)
  });

  const baseline = {};
  for (const key in vitals) {
    if (vitals[key].length >= 3) baseline[key] = calc(vitals[key]);
  }

  await Baseline.findOneAndUpdate(
    { patient: patientId },
    { vitals: baseline, sampleCount: records.length, lastUpdated: new Date() },
    { upsert: true }
  );
};
