# ตัวอย่างการใช้งาน API Health Goals

## ข้อมูล API

**Endpoint:** `POST http://localhost:8080/{{base_url}}/health-goals`  
**Authorization:** `Bearer {{auth_token}}`  
**Content-Type:** `application/json`

## Request Body ตัวอย่าง

```json
{
  "goal_type": "weight_loss",
  "title": "ลดน้ำหนัก 5 กิโลกรัม",
  "description": "ลดน้ำหนักเพื่อสุขภาพที่ดีขึ้น",
  "target_value": 5,
  "current_value": 0,
  "unit": "kg",
  "start_date": "2024-01-01",
  "target_date": "2024-06-01",
  "priority": "medium"
}
```

## การใช้งานในโค้ด

### 1. Import API Service

```typescript
import { apiService, HealthGoals } from "@/services/api";
```

### 2. เรียกใช้ API

```typescript
const createHealthGoal = async () => {
  try {
    const healthGoalData: HealthGoals = {
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

    const result = await apiService.createHealthGoal(healthGoalData);
    console.log('Health Goal created:', result);
    
  } catch (error) {
    console.error('Error creating health goal:', error);
  }
};
```

### 3. การจัดการ Error

```typescript
try {
  const result = await apiService.createHealthGoal(healthGoalData);
  // จัดการผลลัพธ์ที่สำเร็จ
} catch (error) {
  if (error instanceof Error) {
    switch (error.message) {
      case 'No valid authentication token found':
        // จัดการกรณีไม่มี token
        break;
      case 'Bad Request: ข้อมูลไม่ถูกต้อง':
        // จัดการกรณีข้อมูลไม่ถูกต้อง
        break;
      case 'Unauthorized: กรุณาเข้าสู่ระบบใหม่':
        // จัดการกรณี token หมดอายุ
        break;
      default:
        // จัดการ error อื่นๆ
        break;
    }
  }
}
```

## ข้อมูลที่ส่งไปยัง API

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `goal_type` | string | ✅ | ประเภทเป้าหมาย (weight_loss, weight_gain, muscle_gain, etc.) |
| `title` | string | ✅ | ชื่อเป้าหมาย |
| `description` | string | ❌ | รายละเอียดเป้าหมาย |
| `target_value` | number | ✅ | ค่าเป้าหมาย |
| `current_value` | number | ❌ | ค่าปัจจุบัน (default: 0) |
| `unit` | string | ❌ | หน่วยของค่า (kg, km, etc.) |
| `start_date` | string | ✅ | วันที่เริ่ม (YYYY-MM-DD) |
| `target_date` | string | ✅ | วันที่สิ้นสุด (YYYY-MM-DD) |
| `priority` | string | ❌ | ความสำคัญ (low, medium, high, urgent) |

## การทดสอบ API

### ใช้ cURL

```bash
curl -X POST http://localhost:8080/{{base_url}}/health-goals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {{auth_token}}" \
  -d '{
    "goal_type": "weight_loss",
    "title": "ลดน้ำหนัก 5 กิโลกรัม",
    "description": "ลดน้ำหนักเพื่อสุขภาพที่ดีขึ้น",
    "target_value": 5,
    "current_value": 0,
    "unit": "kg",
    "start_date": "2024-01-01",
    "target_date": "2024-06-01",
    "priority": "medium"
  }'
```

### ใช้ Postman

1. **Method:** POST
2. **URL:** `http://localhost:8080/{{base_url}}/health-goals`
3. **Headers:**
   - `Content-Type: application/json`
   - `Authorization: Bearer {{auth_token}}`
4. **Body (raw JSON):** ใช้ข้อมูลตัวอย่างด้านบน

## Response Format

### Success Response (200)

```json
{
  "data": {
    "goal_type": "weight_loss",
    "title": "ลดน้ำหนัก 5 กิโลกรัม",
    "description": "ลดน้ำหนักเพื่อสุขภาพที่ดีขึ้น",
    "target_value": 5,
    "current_value": 0,
    "unit": "kg",
    "start_date": "2024-01-01",
    "target_date": "2024-06-01",
    "priority": "medium",
    "status": "active",
    "id": "generated_id"
  },
  "message": "Health goal created successfully"
}
```

### Error Response (400, 401, 500)

```json
{
  "message": "Error message",
  "errors": {
    "field_name": ["Error description"]
  },
  "status": 400
}
```

## หมายเหตุ

- API จะใช้ port 3000 ตามที่กำหนดใน `API_BASE_URL`
- Token จะถูกส่งอัตโนมัติผ่าน `Authorization` header
- มี timeout 10 วินาทีสำหรับการเรียก API
- ข้อมูลจะถูก validate ที่ backend ก่อนบันทึก
