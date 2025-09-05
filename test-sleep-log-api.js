// ตัวอย่างโค้ดสำหรับการเรียก API Sleep Log
// POST http://localhost:8080/api/sleep-log

// ข้อมูลตัวอย่างสำหรับการทดสอบ
const testSleepData = {
  sleep_date: "2024-01-15",
  bedtime: "22:30",
  wake_time: "06:30",
  sleep_duration_hours: 8,
  sleep_quality: "good",
  sleep_efficiency_percentage: 85,
  time_to_fall_asleep_minutes: 15,
  awakenings_count: 1,
  deep_sleep_minutes: 120,
  light_sleep_minutes: 300,
  rem_sleep_minutes: 90,
  awake_minutes: 30,
  heart_rate_avg: 65,
  heart_rate_min: 55,
  heart_rate_max: 75,
  oxygen_saturation_avg: 98,
  room_temperature_celsius: 22,
  noise_level_db: 35,
  light_level_lux: 5,
  caffeine_intake_mg: 0,
  alcohol_intake_ml: 0,
  exercise_before_bed_hours: 3,
  screen_time_before_bed_minutes: 30,
  sleep_aids_used: [],
  medications_taken: [],
  stress_level: 3,
  mood_before_sleep: 7,
  mood_after_wake: 8,
  energy_level: 8,
  notes: "นอนหลับได้ดี ตื่นขึ้นมาสดชื่น",
  dreams_remembered: true,
  nightmares: false
};

// ฟังก์ชันสำหรับเรียก API
async function testSleepLogAPI(jwtToken) {
  try {
    console.log('🚀 เริ่มทดสอบ Sleep Log API...');
    console.log('📊 ข้อมูลที่จะส่ง:', testSleepData);
    
    const response = await fetch('http://localhost:3000/sleep-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify(testSleepData)
    });

    console.log('📡 Response Status:', response.status);
    console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const result = await response.json();
      console.log('✅ API Call สำเร็จ!');
      console.log('📋 Response Data:', result);
      return result;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ API Call ล้มเหลว!');
      console.error('🔍 Error Details:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`);
    }
  } catch (error) {
    console.error('💥 Network Error:', error);
    throw error;
  }
}

// ฟังก์ชันสำหรับทดสอบด้วย curl command
function generateCurlCommand(jwtToken) {
  const curlCommand = `curl -X POST http://localhost:3000/sleep-log \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${jwtToken}" \\
  -d '${JSON.stringify(testSleepData, null, 2)}'`;
  
  console.log('🔧 cURL Command:');
  console.log(curlCommand);
  return curlCommand;
}

// ตัวอย่างการใช้งาน
async function runTest() {
  // ใส่ JWT Token ของคุณที่นี่
  const jwtToken = 'YOUR_JWT_TOKEN_HERE';
  
  if (jwtToken === 'YOUR_JWT_TOKEN_HERE') {
    console.log('⚠️  กรุณาใส่ JWT Token ที่ถูกต้องในตัวแปร jwtToken');
    console.log('🔧 หรือใช้ฟังก์ชัน generateCurlCommand() เพื่อสร้าง cURL command');
    generateCurlCommand('YOUR_JWT_TOKEN_HERE');
    return;
  }
  
  try {
    const result = await testSleepLogAPI(jwtToken);
    console.log('🎉 การทดสอบเสร็จสิ้น!');
  } catch (error) {
    console.log('💔 การทดสอบล้มเหลว:', error.message);
  }
}

// Export functions สำหรับการใช้งาน
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testSleepLogAPI,
    generateCurlCommand,
    testSleepData
  };
}

// เรียกใช้ฟังก์ชันทดสอบ (ถ้าต้องการ)
// runTest();
