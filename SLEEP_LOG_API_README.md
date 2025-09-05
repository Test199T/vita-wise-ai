# Sleep Log API Testing Guide

## 📋 ข้อมูล API

**Endpoint:** `POST http://localhost:3000/sleep-log`  
**Authentication:** Bearer Token (JWT)  
**Content-Type:** `application/json`

## 🚀 วิธีการทดสอบ

### 1. ผ่านปุ่มในแอปพลิเคชัน

1. เข้าสู่ระบบแอปพลิเคชัน
2. ไปที่หน้า "บันทึกการนอน" (Sleep Log)
3. คลิกปุ่ม **"เทส API"** ที่มุมขวาบน
4. ระบบจะส่งข้อมูลตัวอย่างไปยัง API อัตโนมัติ

### 2. ผ่าน JavaScript (Node.js)

```bash
# รันไฟล์ทดสอบ
node test-sleep-log-api.js
```

หรือใช้ในโค้ด:

```javascript
const { testSleepLogAPI } = require('./test-sleep-log-api.js');

// ใส่ JWT Token ของคุณ
const jwtToken = 'your_jwt_token_here';

// เรียก API
testSleepLogAPI(jwtToken)
  .then(result => console.log('สำเร็จ:', result))
  .catch(error => console.error('ล้มเหลว:', error));
```

### 3. ผ่าน cURL

```bash
# ให้สิทธิ์การรันไฟล์
chmod +x test-sleep-log-curl.sh

# รันทดสอบ
./test-sleep-log-curl.sh YOUR_JWT_TOKEN
```

หรือใช้ cURL โดยตรง:

```bash
curl -X POST http://localhost:3000/sleep-log \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "sleep_date": "2024-01-15",
    "bedtime": "22:30",
    "wake_time": "06:30",
    "sleep_duration_hours": 8,
    "sleep_quality": "good",
    "sleep_efficiency_percentage": 85,
    "time_to_fall_asleep_minutes": 15,
    "awakenings_count": 1,
    "deep_sleep_minutes": 120,
    "light_sleep_minutes": 300,
    "rem_sleep_minutes": 90,
    "awake_minutes": 30,
    "heart_rate_avg": 65,
    "heart_rate_min": 55,
    "heart_rate_max": 75,
    "oxygen_saturation_avg": 98,
    "room_temperature_celsius": 22,
    "noise_level_db": 35,
    "light_level_lux": 5,
    "caffeine_intake_mg": 0,
    "alcohol_intake_ml": 0,
    "exercise_before_bed_hours": 3,
    "screen_time_before_bed_minutes": 30,
    "sleep_aids_used": [],
    "medications_taken": [],
    "stress_level": 3,
    "mood_before_sleep": 7,
    "mood_after_wake": 8,
    "energy_level": 8,
    "notes": "นอนหลับได้ดี ตื่นขึ้นมาสดชื่น",
    "dreams_remembered": true,
    "nightmares": false
  }'
```

## 📊 ข้อมูลตัวอย่างที่ส่ง

```json
{
  "sleep_date": "2024-01-15",
  "bedtime": "22:30",
  "wake_time": "06:30",
  "sleep_duration_hours": 8,
  "sleep_quality": "good",
  "sleep_efficiency_percentage": 85,
  "time_to_fall_asleep_minutes": 15,
  "awakenings_count": 1,
  "deep_sleep_minutes": 120,
  "light_sleep_minutes": 300,
  "rem_sleep_minutes": 90,
  "awake_minutes": 30,
  "heart_rate_avg": 65,
  "heart_rate_min": 55,
  "heart_rate_max": 75,
  "oxygen_saturation_avg": 98,
  "room_temperature_celsius": 22,
  "noise_level_db": 35,
  "light_level_lux": 5,
  "caffeine_intake_mg": 0,
  "alcohol_intake_ml": 0,
  "exercise_before_bed_hours": 3,
  "screen_time_before_bed_minutes": 30,
  "sleep_aids_used": [],
  "medications_taken": [],
  "stress_level": 3,
  "mood_before_sleep": 7,
  "mood_after_wake": 8,
  "energy_level": 8,
  "notes": "นอนหลับได้ดี ตื่นขึ้นมาสดชื่น",
  "dreams_remembered": true,
  "nightmares": false
}
```

## 🔧 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **401 Unauthorized**
   - ตรวจสอบ JWT Token ว่าถูกต้อง
   - ตรวจสอบว่า Token ยังไม่หมดอายุ

2. **404 Not Found**
   - ตรวจสอบ URL ของ API
   - ตรวจสอบว่า backend server กำลังทำงานอยู่

3. **500 Internal Server Error**
   - ตรวจสอบ logs ของ backend
   - ตรวจสอบการเชื่อมต่อฐานข้อมูล

### การ Debug

1. เปิด Developer Tools ในเบราว์เซอร์
2. ดู Console logs สำหรับข้อมูลเพิ่มเติม
3. ตรวจสอบ Network tab เพื่อดู request/response

## 📝 หมายเหตุ

- ข้อมูลตัวอย่างนี้เป็นข้อมูลจำลองสำหรับการทดสอบ
- ในระบบจริงควรใช้ข้อมูลที่ผู้ใช้กรอกจริง
- ตรวจสอบให้แน่ใจว่า backend server กำลังทำงานที่ port 3000
