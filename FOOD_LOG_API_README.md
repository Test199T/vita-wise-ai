# Food Log API - คู่มือการใช้งาน

## ภาพรวม
Food Log API เป็น endpoint สำหรับบันทึกข้อมูลการรับประทานอาหารและสารอาหารต่างๆ ลงในระบบ

## Endpoint
```
POST http://localhost:8080/food-log
```

## Request Body Format
```json
{
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
}
```

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `food_name` | string | ✅ | ชื่ออาหาร |
| `meal_type` | string | ✅ | ประเภทมื้ออาหาร (breakfast, lunch, dinner, snack) |
| `serving_size` | number | ✅ | ขนาดการเสิร์ฟ |
| `serving_unit` | string | ✅ | หน่วยของขนาดการเสิร์ฟ (grams, pieces, cups, etc.) |
| `calories_per_serving` | number | ✅ | แคลอรี่ต่อการเสิร์ฟ |
| `protein_g` | number | ✅ | โปรตีน (กรัม) |
| `carbs_g` | number | ✅ | คาร์โบไฮเดรต (กรัม) |
| `fat_g` | number | ✅ | ไขมัน (กรัม) |
| `fiber_g` | number | ✅ | ไฟเบอร์ (กรัม) |
| `sugar_g` | number | ✅ | น้ำตาล (กรัม) |
| `sodium_mg` | number | ✅ | โซเดียม (มิลลิกรัม) |
| `consumed_at` | string | ✅ | เวลาที่รับประทาน (ISO 8601 format) |
| `notes` | string | ❌ | หมายเหตุเพิ่มเติม |

## วิธีการทดสอบ

### 1. ผ่าน Frontend Application
1. เปิดหน้า Food Log ในแอปพลิเคชัน
2. คลิกปุ่ม "ทดสอบ API" (ไอคอน TestTube)
3. ดูผลลัพธ์ใน Console และ Toast notification

### 2. ผ่าน Browser Console
1. เปิดไฟล์ `test-food-log-api.js` ใน browser
2. เปิด Developer Tools (F12)
3. ใช้คำสั่งต่อไปนี้:
   ```javascript
   // ทดสอบข้อมูลหลัก
   testFoodLogAPI()
   
   // ทดสอบข้อมูลที่กำหนดเอง
   testWithCustomData({
     food_name: "ข้าวกล้อง",
     meal_type: "breakfast",
     serving_size: 100,
     serving_unit: "grams",
     calories_per_serving: 130,
     protein_g: 2.7,
     carbs_g: 28.0,
     fat_g: 0.9,
     fiber_g: 1.8,
     sugar_g: 0.3,
     sodium_mg: 5,
     consumed_at: "2025-09-02T07:00:00Z",
     notes: "ข้าวกล้องสำหรับมื้อเช้า"
   })
   
   // ทดสอบข้อมูลทั้งหมด
   testAllData()
   ```

### 3. ผ่าน cURL
```bash
curl -X POST http://localhost:8080/food-log \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### 4. ผ่าน Postman
1. สร้าง POST request ไปยัง `http://localhost:8080/food-log`
2. ตั้งค่า Headers: `Content-Type: application/json`
3. ใส่ Request Body ในรูปแบบ JSON ตามตัวอย่างข้างต้น

## Response Format

### Success Response (200)
```json
{
  "data": {
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
  },
  "message": "Food log created successfully"
}
```

### Error Response (4xx/5xx)
```json
{
  "message": "Error message here",
  "errors": {
    "field_name": ["Error description"]
  },
  "status": 400
}
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - ข้อมูลไม่ถูกต้อง |
| 401 | Unauthorized - ไม่มีสิทธิ์เข้าถึง |
| 500 | Internal Server Error - ข้อผิดพลาดที่เซิร์ฟเวอร์ |

## ตัวอย่างข้อมูลทดสอบเพิ่มเติม

### อาหารเช้า
```json
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
}
```

### อาหารเย็น
```json
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
```

## การแก้ไขปัญหา

### 1. CORS Error
หากเกิด CORS error ให้ตรวจสอบ:
- Backend server เปิดใช้งานอยู่
- CORS configuration ถูกต้อง
- Port number ตรงกัน

### 2. Connection Refused
หากไม่สามารถเชื่อมต่อได้:
- ตรวจสอบว่า backend server ทำงานอยู่
- ตรวจสอบ port number
- ตรวจสอบ firewall settings

### 3. Validation Error
หากเกิด validation error:
- ตรวจสอบข้อมูลที่ส่งไปว่าครบถ้วน
- ตรวจสอบ data types
- ตรวจสอบ required fields

## การพัฒนาต่อ

### เพิ่มฟีเจอร์ใหม่
1. เพิ่ม field ใหม่ใน interface `FoodLogItem`
2. อัปเดต validation ใน backend
3. อัปเดต frontend form
4. ทดสอบการทำงาน

### เพิ่ม Endpoint ใหม่
1. เพิ่มฟังก์ชันใหม่ใน `APIService` class
2. เพิ่ม interface สำหรับ response
3. ทดสอบการทำงาน
4. อัปเดต documentation

## หมายเหตุ
- ข้อมูลทั้งหมดจะถูกบันทึกในฐานข้อมูล
- เวลาจะถูกแปลงเป็น UTC timezone
- การตรวจสอบ validation จะทำทั้งใน frontend และ backend
- ระบบรองรับการบันทึกข้อมูลหลายภาษา
