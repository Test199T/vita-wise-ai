# Water Log API Example

## API Endpoint
```
POST http://localhost:3000/water-logs
```

## Headers
```
Authorization: Bearer {{jwt_token}}
Content-Type: application/json
```

## Request Body Example
```json
{
  "amount_ml": 250,
  "drink_type": "water",
  "notes": "Morning hydration",
  "consumed_at": "2024-01-15T08:30:00Z"
}
```

## วิธีการใช้งาน

### 1. เปิดหน้า Water Log
- ไปที่หน้า "บันทึกน้ำดื่ม" ในแอปพลิเคชัน
- คุณจะเห็นปุ่ม "ทดสอบ POST" และ "ทดสอบ GET" ด้านบน

### 2. ทดสอบ POST API
- คลิกปุ่ม "ทดสอบ POST" 
- ระบบจะส่งข้อมูลตัวอย่างไปยัง `POST /water-logs`
- ข้อมูลที่ส่ง:
  ```json
  {
    "amount_ml": 250,
    "drink_type": "water", 
    "notes": "Morning hydration",
    "consumed_at": "2024-01-15T08:30:00Z"
  }
  ```

### 3. ทดสอบ GET API
- คลิกปุ่ม "ทดสอบ GET"
- ระบบจะเรียก `GET /water-logs` เพื่อดึงข้อมูลทั้งหมด

### 4. ดูผลลัพธ์
- ผลลัพธ์จะแสดงในส่วน "ผลลัพธ์การทดสอบ API" 
- ข้อมูลจะแสดงในรูปแบบ JSON
- ถ้าสำเร็จจะแสดงข้อมูลที่ได้รับจาก API
- ถ้าล้มเหลวจะแสดง error message

## ข้อมูลที่ส่งใน Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount_ml` | number | Yes | ปริมาณน้ำในหน่วยมิลลิลิตร |
| `drink_type` | string | Yes | ประเภทเครื่องดื่ม (water, tea, coffee, etc.) |
| `notes` | string | No | หมายเหตุเพิ่มเติม |
| `consumed_at` | string | Yes | เวลาที่ดื่มในรูปแบบ ISO 8601 |

## ตัวอย่าง Response

### Success Response
```json
{
  "data": {
    "id": "123",
    "user_id": 1,
    "amount_ml": 250,
    "drink_type": "water",
    "notes": "Morning hydration",
    "consumed_at": "2024-01-15T08:30:00Z",
    "created_at": "2024-01-15T08:30:00Z",
    "updated_at": "2024-01-15T08:30:00Z"
  },
  "message": "Water log created successfully"
}
```

### Error Response
```json
{
  "message": "Unauthorized: กรุณาเข้าสู่ระบบใหม่",
  "status": 401
}
```

## การ Debug

### ดู Console Logs
- เปิด Developer Tools (F12)
- ไปที่แท็บ Console
- คุณจะเห็น logs รายละเอียดของการเรียก API

### ดู Network Tab
- ไปที่แท็บ Network ใน Developer Tools
- คลิกปุ่มทดสอบ API
- คุณจะเห็น HTTP request ที่ส่งไปยัง backend

## หมายเหตุ

1. **Authentication**: ต้องมี JWT token ที่ถูกต้องใน localStorage
2. **Backend URL**: ปัจจุบันตั้งค่าเป็น `http://localhost:3000`
3. **CORS**: ต้องแน่ใจว่า backend รองรับ CORS สำหรับ frontend
4. **Error Handling**: ระบบจะแสดง error message ที่เป็นภาษาไทย

## การแก้ไขปัญหา

### ถ้าได้ Error 401 (Unauthorized)
- ตรวจสอบว่ามี JWT token ใน localStorage หรือไม่
- ลองเข้าสู่ระบบใหม่

### ถ้าได้ Error 500 (Internal Server Error)
- ตรวจสอบว่า backend server ทำงานอยู่หรือไม่
- ดู logs ของ backend server

### ถ้าได้ Network Error
- ตรวจสอบว่า backend server ทำงานที่ port 3000 หรือไม่
- ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
