# คู่มือการใช้งาน API อัปเดตข้อมูลการออกกำลังกาย

## 🚀 API Endpoint

### URL
```
PUT http://localhost:8080/exercise-log/{id}
```

### Parameters
- `{id}`: ID ของ exercise log ที่ต้องการอัปเดต

### Headers
```
Content-Type: application/json
Authorization: Bearer {token}  // ถ้ามี token
```

## 📝 Request Body

### ตัวอย่างข้อมูล
```json
{
  "exercise_name": "Cycling",
  "exercise_type": "cardio",
  "duration_minutes": 45,
  "sets": null,
  "reps": null,
  "weight_kg": null,
  "distance_km": 15.0,
  "calories_burned": 400,
  "intensity": "high",
  "notes": "Evening cycling",
  "exercise_date": "2024-01-20",
  "exercise_time": "18:30:00"
}
```

### ฟิลด์ที่จำเป็น
- `exercise_name`: ชื่อการออกกำลังกาย
- `exercise_type`: ประเภทการออกกำลังกาย
- `duration_minutes`: ระยะเวลา (นาที)
- `calories_burned`: แคลอรีที่เผาผลาญ
- `intensity`: ระดับความหนัก
- `exercise_date`: วันที่ออกกำลังกาย
- `exercise_time`: เวลาออกกำลังกาย

### ฟิลด์ที่เลือกได้
- `sets`: จำนวนเซ็ต (สำหรับยกน้ำหนัก)
- `reps`: จำนวนครั้งต่อเซ็ต
- `weight_kg`: น้ำหนัก (กก.)
- `distance_km`: ระยะทาง (กม.)
- `notes`: หมายเหตุ

## ✅ Response

### Success (200 OK)
```json
{
  "data": {
    "id": 123,
    "exercise_name": "Cycling",
    "exercise_type": "cardio",
    "duration_minutes": 45,
    "sets": null,
    "reps": null,
    "weight_kg": null,
    "distance_km": 15.0,
    "calories_burned": 400,
    "intensity": "high",
    "notes": "Evening cycling",
    "exercise_date": "2024-01-20",
    "exercise_time": "18:30:00"
  },
  "message": "Exercise log updated successfully"
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "message": "Invalid data provided",
  "errors": {
    "duration_minutes": ["Duration must be greater than 0"],
    "calories_burned": ["Calories must be greater than 0"]
  }
}
```

#### 401 Unauthorized
```json
{
  "message": "Authentication required",
  "status": 401
}
```

#### 403 Forbidden
```json
{
  "message": "You don't have permission to update this exercise log",
  "status": 403
}
```

#### 404 Not Found
```json
{
  "message": "Exercise log not found",
  "status": 404
}
```

#### 500 Internal Server Error
```json
{
  "message": "Internal server error",
  "status": 500
}
```

## 🔧 การใช้งานใน Frontend

### 1. ฟังก์ชัน updateExerciseLog ใน api.ts
```typescript
async updateExerciseLog(exerciseLogId: string | number, updateData: Partial<ExerciseLog>): Promise<ExerciseLog>
```

### 2. การเรียกใช้ใน ExerciseLog.tsx
```typescript
const handleUpdate = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // ตรวจสอบ backend_id
  if (!sessionToUpdate.backend_id) {
    throw new Error('ไม่สามารถแก้ไขข้อมูลได้ เนื่องจากไม่พบ ID จาก Backend');
  }

  // เรียก API
  const updatedExercise = await apiService.updateExerciseLog(
    sessionToUpdate.backend_id, 
    updateData
  );
  
  // อัปเดต state
  // ...
};
```

## 🧪 การทดสอบ

### 1. ใช้ Postman หรือ cURL
```bash
curl -X PUT \
  http://localhost:8080/exercise-log/123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "exercise_name": "Cycling",
    "exercise_type": "cardio",
    "duration_minutes": 45,
    "calories_burned": 400,
    "intensity": "high",
    "exercise_date": "2024-01-20",
    "exercise_time": "18:30:00"
  }'
```

### 2. ทดสอบใน Frontend
1. เปิดหน้า ExerciseLog
2. คลิกปุ่ม "แก้ไข" ที่รายการการออกกำลังกาย
3. แก้ไขข้อมูลในฟอร์ม
4. คลิกปุ่ม "อัปเดต"
5. ตรวจสอบ Console และ Network tab

## 📋 การตรวจสอบ

### Console Logs
```
✏️ ข้อมูลที่จะอัปเดต: {...}
🆔 Backend ID ที่จะอัปเดต: 123
✏️ Updating exercise log entry... 123
🌐 API URL: http://localhost:8080/exercise-log/123
📝 Update data: {...}
🔑 Token found: eyJhbGciOiJIUzI1NiIs...
📡 Update exercise log API response: {...}
✅ Exercise log updated successfully from backend
📄 Updated data: {...}
✅ อัปเดตข้อมูลสำเร็จ: {...}
```

### Network Tab
- Method: PUT
- URL: http://localhost:8080/exercise-log/123
- Status: 200 OK
- Request Body: JSON data
- Response: Updated exercise log

## 🚨 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

#### 1. ไม่พบ backend_id
- **สาเหตุ**: ข้อมูลยังไม่ได้โหลดจาก Backend
- **วิธีแก้**: รีเฟรชหน้าหรือกดปุ่ม "รีเฟรช"

#### 2. 401 Unauthorized
- **สาเหตุ**: Token หมดอายุหรือไม่ถูกต้อง
- **วิธีแก้**: เข้าสู่ระบบใหม่

#### 3. 404 Not Found
- **สาเหตุ**: ID ไม่ถูกต้องหรือข้อมูลถูกลบไปแล้ว
- **วิธีแก้**: ตรวจสอบ ID และรีเฟรชข้อมูล

#### 4. 400 Bad Request
- **สาเหตุ**: ข้อมูลที่ส่งไปไม่ถูกต้อง
- **วิธีแก้**: ตรวจสอบข้อมูลในฟอร์ม

## 📞 การขอความช่วยเหลือ

หากพบปัญหา กรุณาแจ้ง:
1. Error message ที่เห็น
2. Console logs ทั้งหมด
3. Network request/response
4. Backend logs (ถ้ามี)
