// ตัวอย่างการทดสอบ API Health Goals
// ไฟล์นี้ใช้สำหรับทดสอบ API โดยตรง

const API_BASE_URL = 'http://localhost:3000';
const ENDPOINT = '/health-goals';

// ข้อมูลตัวอย่างสำหรับสร้าง health goal
const sampleHealthGoalData = {
  goal_type: "weight_loss",
  title: "ลดน้ำหนัก 5 กิโลกรัม",
  description: "ลดน้ำหนักเพื่อสุขภาพที่ดีขึ้น",
  target_value: 5,
  current_value: 0,
  unit: "kg",
  start_date: "2024-01-01",
  target_date: "2024-06-01",
  priority: "medium"
};

// ฟังก์ชันสำหรับทดสอบ API
async function testCreateHealthGoal(authToken) {
  try {
    console.log('🎯 เริ่มทดสอบ API Create Health Goal...');
    console.log('📡 URL:', `${API_BASE_URL}${ENDPOINT}`);
    console.log('📤 Request Data:', JSON.stringify(sampleHealthGoalData, null, 2));

    const response = await fetch(`${API_BASE_URL}${ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(sampleHealthGoalData)
    });

    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Response:', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.error('❌ Parsed Error:', errorJson);
      } catch (parseError) {
        console.error('❌ Could not parse error response as JSON');
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Success Response:', JSON.stringify(result, null, 2));
    
    return result;
    
  } catch (error) {
    console.error('❌ Error during API call:', error);
    throw error;
  }
}

// ฟังก์ชันสำหรับทดสอบ API โดยไม่ใช้ token (เพื่อดู error)
async function testCreateHealthGoalWithoutToken() {
  try {
    console.log('🔒 ทดสอบ API โดยไม่มี Token...');
    
    const response = await fetch(`${API_BASE_URL}${ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // ไม่มี Authorization header
      },
      body: JSON.stringify(sampleHealthGoalData)
    });

    console.log('📥 Response Status (No Token):', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('📥 Error Response (No Token):', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error (No Token):', error);
  }
}

// ฟังก์ชันสำหรับทดสอบ API ด้วยข้อมูลที่ไม่ถูกต้อง
async function testCreateHealthGoalWithInvalidData(authToken) {
  try {
    console.log('🚫 ทดสอบ API ด้วยข้อมูลที่ไม่ถูกต้อง...');
    
    const invalidData = {
      // ไม่มี required fields
      description: "ข้อมูลไม่ครบ"
    };
    
    const response = await fetch(`${API_BASE_URL}${ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(invalidData)
    });

    console.log('📥 Response Status (Invalid Data):', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('📥 Error Response (Invalid Data):', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error (Invalid Data):', error);
  }
}

// ฟังก์ชันหลักสำหรับรันการทดสอบ
async function runTests() {
  console.log('🚀 เริ่มการทดสอบ Health Goals API');
  console.log('=====================================');
  
  // ทดสอบโดยไม่มี token
  await testCreateHealthGoalWithoutToken();
  console.log('');
  
  // ทดสอบด้วยข้อมูลที่ไม่ถูกต้อง (ถ้ามี token)
  const authToken = process.env.AUTH_TOKEN || 'your_auth_token_here';
  if (authToken && authToken !== 'your_auth_token_here') {
    await testCreateHealthGoalWithInvalidData(authToken);
    console.log('');
    
    // ทดสอบด้วยข้อมูลที่ถูกต้อง
    await testCreateHealthGoal(authToken);
  } else {
    console.log('⚠️  ไม่มี AUTH_TOKEN กรุณาตั้งค่า environment variable หรือแก้ไขในโค้ด');
    console.log('💡 ตัวอย่าง: AUTH_TOKEN=your_jwt_token_here node test-health-goals-api.js');
  }
  
  console.log('=====================================');
  console.log('🏁 การทดสอบเสร็จสิ้น');
}

// รันการทดสอบถ้าไฟล์ถูกเรียกโดยตรง
if (require.main === module) {
  runTests().catch(console.error);
}

// Export functions สำหรับการใช้งานในไฟล์อื่น
module.exports = {
  testCreateHealthGoal,
  testCreateHealthGoalWithoutToken,
  testCreateHealthGoalWithInvalidData,
  runTests,
  sampleHealthGoalData
};
