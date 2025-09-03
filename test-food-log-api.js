// ไฟล์ทดสอบการเรียก API Food Log
// ใช้สำหรับทดสอบการเรียก API โดยตรงจาก browser console หรือ Node.js

const API_BASE_URL = 'http://localhost:8080';
const ENDPOINT = '/food-log';

// ข้อมูลทดสอบตามที่ระบุใน requirements
const testFoodLogData = {
  "food_name": "Grilled Chicken Breast",
  "meal_type": "lunch",
  "serving_size": 150,
  "serving_unit": "grams",
  "calories_per_serving": 165,
  "protein_g": 31.0,
  "carbs_g": 0.0,
  "fat_g": 3.6,
  "fiber_g": 0.0,
  "sugar_g": 0.0,
  "sodium_mg": 74,
  "consumed_at": "2025-09-02T12:30:00Z",
  "notes": "Healthy lean protein for lunch"
};

// ฟังก์ชันสำหรับเรียก API POST
async function testFoodLogAPI() {
  try {
    console.log('🧪 เริ่มทดสอบการเรียก API Food Log...');
    console.log('📤 ส่งข้อมูล:', testFoodLogData);
    
    const response = await fetch(`${API_BASE_URL}${ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // เพิ่ม Authorization header หากต้องการ
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
      },
      body: JSON.stringify(testFoodLogData)
    });

    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ API Response Success:', result);
    return result;

  } catch (error) {
    console.error('❌ API Test Failed:', error);
    throw error;
  }
}

// ฟังก์ชันสำหรับทดสอบด้วยข้อมูลที่แตกต่างกัน
async function testWithCustomData(customData) {
  try {
    console.log('🧪 ทดสอบด้วยข้อมูลที่กำหนดเอง:', customData);
    
    const response = await fetch(`${API_BASE_URL}${ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Custom Data API Response:', result);
    return result;

  } catch (error) {
    console.error('❌ Custom Data API Test Failed:', error);
    throw error;
  }
}

// ตัวอย่างข้อมูลทดสอบเพิ่มเติม
const additionalTestData = [
  {
    "food_name": "ข้าวกล้อง",
    "meal_type": "breakfast",
    "serving_size": 100,
    "serving_unit": "grams",
    "calories_per_serving": 130,
    "protein_g": 2.7,
    "carbs_g": 28.0,
    "fat_g": 0.9,
    "fiber_g": 1.8,
    "sugar_g": 0.3,
    "sodium_mg": 5,
    "consumed_at": "2025-09-02T07:00:00Z",
    "notes": "ข้าวกล้องสำหรับมื้อเช้า"
  },
  {
    "food_name": "Salmon Fillet",
    "meal_type": "dinner",
    "serving_size": 200,
    "serving_unit": "grams",
    "calories_per_serving": 412,
    "protein_g": 46.0,
    "carbs_g": 0.0,
    "fat_g": 24.0,
    "fiber_g": 0.0,
    "sugar_g": 0.0,
    "sodium_mg": 120,
    "consumed_at": "2025-09-02T19:00:00Z",
    "notes": "ปลาแซลมอนย่าง ดีต่อสุขภาพ"
  }
];

// ฟังก์ชันสำหรับทดสอบข้อมูลทั้งหมด
async function testAllData() {
  console.log('🧪 เริ่มทดสอบข้อมูลทั้งหมด...');
  
  try {
    // ทดสอบข้อมูลหลัก
    await testFoodLogAPI();
    
    // ทดสอบข้อมูลเพิ่มเติม
    for (let i = 0; i < additionalTestData.length; i++) {
      console.log(`\n--- ทดสอบข้อมูลที่ ${i + 1} ---`);
      await testWithCustomData(additionalTestData[i]);
      // รอสักครู่ระหว่างการทดสอบ
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎉 การทดสอบทั้งหมดเสร็จสิ้น!');
    
  } catch (error) {
    console.error('\n💥 การทดสอบล้มเหลว:', error);
  }
}

// Export functions สำหรับใช้ใน browser console
if (typeof window !== 'undefined') {
  window.testFoodLogAPI = testFoodLogAPI;
  window.testWithCustomData = testWithCustomData;
  window.testAllData = testAllData;
  window.testFoodLogData = testFoodLogData;
  window.additionalTestData = additionalTestData;
  
  console.log('🚀 Food Log API Test Functions loaded!');
  console.log('📋 ใช้คำสั่งต่อไปนี้ในการทดสอบ:');
  console.log('  - testFoodLogAPI() - ทดสอบข้อมูลหลัก');
  console.log('  - testWithCustomData(customData) - ทดสอบข้อมูลที่กำหนดเอง');
  console.log('  - testAllData() - ทดสอบข้อมูลทั้งหมด');
  console.log('  - testFoodLogData - ดูข้อมูลทดสอบหลัก');
  console.log('  - additionalTestData - ดูข้อมูลทดสอบเพิ่มเติม');
}

// Export สำหรับ Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testFoodLogAPI,
    testWithCustomData,
    testAllData,
    testFoodLogData,
    additionalTestData
  };
}
