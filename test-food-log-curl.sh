#!/bin/bash

# ไฟล์ทดสอบการเรียก API Food Log ด้วย cURL
# ใช้สำหรับทดสอบการเรียก API จาก command line

API_BASE_URL="http://localhost:8080"
ENDPOINT="/food-log"
FULL_URL="${API_BASE_URL}${ENDPOINT}"

echo "🧪 เริ่มทดสอบ Food Log API ด้วย cURL..."
echo "📍 Endpoint: ${FULL_URL}"
echo ""

# ข้อมูลทดสอบหลัก
echo "📤 ทดสอบข้อมูลหลัก..."
curl -X POST "${FULL_URL}" \
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
  }' \
  -w "\n\n⏱️  Response Time: %{time_total}s\n📊 Status: %{http_code}\n"

echo ""
echo "----------------------------------------"
echo ""

# ข้อมูลทดสอบอาหารเช้า
echo "📤 ทดสอบข้อมูลอาหารเช้า..."
curl -X POST "${FULL_URL}" \
  -H "Content-Type: application/json" \
  -d '{
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
  }' \
  -w "\n\n⏱️  Response Time: %{time_total}s\n📊 Status: %{http_code}\n"

echo ""
echo "----------------------------------------"
echo ""

# ข้อมูลทดสอบอาหารเย็น
echo "📤 ทดสอบข้อมูลอาหารเย็น..."
curl -X POST "${FULL_URL}" \
  -H "Content-Type: application/json" \
  -d '{
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
  }' \
  -w "\n\n⏱️  Response Time: %{time_total}s\n📊 Status: %{http_code}\n"

echo ""
echo "----------------------------------------"
echo ""

# ทดสอบข้อมูลที่ไม่สมบูรณ์ (ควรได้ error)
echo "📤 ทดสอบข้อมูลที่ไม่สมบูรณ์ (คาดว่าจะได้ error)..."
curl -X POST "${FULL_URL}" \
  -H "Content-Type: application/json" \
  -d '{
    "food_name": "Incomplete Food",
    "meal_type": "snack"
  }' \
  -w "\n\n⏱️  Response Time: %{time_total}s\n📊 Status: %{http_code}\n"

echo ""
echo "----------------------------------------"
echo ""

# ทดสอบข้อมูลที่มี meal_type ไม่ถูกต้อง
echo "📤 ทดสอบข้อมูลที่มี meal_type ไม่ถูกต้อง..."
curl -X POST "${FULL_URL}" \
  -H "Content-Type: application/json" \
  -d '{
    "food_name": "Test Food",
    "meal_type": "invalid_meal_type",
    "serving_size": 100,
    "serving_unit": "grams",
    "calories_per_serving": 100,
    "protein_g": 10.0,
    "carbs_g": 20.0,
    "fat_g": 5.0,
    "fiber_g": 2.0,
    "sugar_g": 1.0,
    "sodium_mg": 50,
    "consumed_at": "2025-09-02T12:00:00Z",
    "notes": "Test data with invalid meal type"
  }' \
  -w "\n\n⏱️  Response Time: %{time_total}s\n📊 Status: %{http_code}\n"

echo ""
echo "🎉 การทดสอบทั้งหมดเสร็จสิ้น!"
echo ""
echo "📋 สรุปการทดสอบ:"
echo "  ✅ ข้อมูลหลัก - Grilled Chicken Breast"
echo "  ✅ ข้อมูลอาหารเช้า - ข้าวกล้อง"
echo "  ✅ ข้อมูลอาหารเย็น - Salmon Fillet"
echo "  ❌ ข้อมูลไม่สมบูรณ์ - คาดว่าจะได้ error"
echo "  ❌ ข้อมูล meal_type ไม่ถูกต้อง - คาดว่าจะได้ error"
echo ""
echo "💡 หมายเหตุ:"
echo "  - หากได้ Status 200 = สำเร็จ"
echo "  - หากได้ Status 4xx = Client Error (ข้อมูลไม่ถูกต้อง)"
echo "  - หากได้ Status 5xx = Server Error (ข้อผิดพลาดที่เซิร์ฟเวอร์)"
echo "  - หากไม่สามารถเชื่อมต่อได้ ให้ตรวจสอบว่า backend server ทำงานอยู่"
