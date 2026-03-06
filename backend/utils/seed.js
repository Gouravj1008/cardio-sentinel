const mongoose = require("mongoose");
const dotenv = require("dotenv");

const User = require("../models/User");
const HealthRecord = require("../models/HealthRecord");

dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

const seed = async () => {
  try {
    await User.deleteMany({});
    await HealthRecord.deleteMany({});

    // 👨‍⚕️ Doctor
    const doctor = await User.create({
      name: "Dr Test",
      email: "doctor@test.com",
      password: "Doctor@123",
      role: "doctor",
      phone: "9999999999",
    });

    // 🧑 Patients
    const patient1 = await User.create({
      name: "Rahul Sharma",
      email: "rahul@test.com",
      password: "Test@123",
      role: "patient",
      phone: "8888888888",
    });

    const patient2 = await User.create({
      name: "Amit Verma",
      email: "amit@test.com",
      password: "Test@123",
      role: "patient",
      phone: "7777777777",
    });

    // ❤️ Health Records
    await HealthRecord.create({
      patient: patient1._id,
      doctor: doctor._id,
      vitals: { heartRate: 95 },
      riskScore: 72,
      aiAnalysis: { trendDetected: "Increasing risk" },
    });

    await HealthRecord.create({
      patient: patient2._id,
      doctor: doctor._id,
      vitals: { heartRate: 70 },
      riskScore: 30,
      aiAnalysis: { trendDetected: "Stable" },
    });

    console.log("✅ Seed data created successfully");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
