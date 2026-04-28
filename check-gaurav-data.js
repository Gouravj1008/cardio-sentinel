const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://gouravv1008_db_user:chsMznBxbU0Xg6zw@cluster0.zyvknvp.mongodb.net/cardio-sentinel?retryWrites=true&w=majority';

async function checkPatientData() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║       CHECKING LIVE DATA FOR gaurav@gmail.com             ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    // Get patient
    const patient = await db.collection('users').findOne({ email: 'gaurav@gmail.com' });
    
    if (!patient) {
      console.log('❌ Patient gaurav@gmail.com not found in database');
      await mongoose.disconnect();
      return;
    }
    
    console.log('✅ Patient Found:');
    console.log('   Email:', patient.email);
    console.log('   Name:', patient.name);
    console.log('   Role:', patient.role);
    console.log('   Patient ID:', patient._id);
    console.log('   Approved:', patient.isApproved);
    console.log();
    
    // Check wearable data
    const wearableCount = await db.collection('wearabledatas').countDocuments({ patient: patient._id });
    const latestWearable = await db.collection('wearabledatas')
      .findOne({ patient: patient._id }, { sort: { timestamp: -1 } });
    
    console.log('📊 Wearable Data Status:');
    console.log('   Total Records:', wearableCount);
    
    if (latestWearable) {
      const timeSinceUpdate = Date.now() - new Date(latestWearable.timestamp).getTime();
      const secondsAgo = Math.floor(timeSinceUpdate / 1000);
      const minutesAgo = Math.floor(secondsAgo / 60);
      
      console.log('   ⏱️  Last Update:', latestWearable.timestamp);
      console.log('   📱 Device Type:', latestWearable.deviceType || 'Unknown');
      console.log('   🔌 Device ID:', latestWearable.deviceId || 'Unknown');
      console.log('   ⏰ Time Since Last Update:', minutesAgo > 0 ? `${minutesAgo} minutes ago` : `${secondsAgo} seconds ago`);
      console.log('   💾 Latest Data:');
      console.log('      ❤️  Heart Rate:', latestWearable.data?.heartRate || 'N/A');
      console.log('      🫁 Oxygen:', latestWearable.data?.oxygenLevel + '%' || 'N/A');
      console.log('      🩸 BP:', latestWearable.data?.bloodPressure ? 
        `${latestWearable.data.bloodPressure.systolic}/${latestWearable.data.bloodPressure.diastolic}` : 'N/A');
      console.log();
      
      if (minutesAgo > 5) {
        console.log('⚠️  WARNING: No new data for', minutesAgo, 'minutes!');
        console.log('   Timer/Simulator may be stopped');
      }
    } else {
      console.log('   ❌ NO WEARABLE DATA FOUND');
      console.log('   🏥 Need to start watching simulator or check device connection');
    }
    
    console.log();
    console.log('═══════════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkPatientData();
