#!/bin/bash

# ตัวอย่าง cURL script สำหรับการทดสอบ Sleep Log API
# POST http://localhost:3000/sleep-log

# ตั้งค่าตัวแปร
API_URL="http://localhost:3000/sleep-log"
JWT_TOKEN="YOUR_JWT_TOKEN_HERE"

# ข้อมูลตัวอย่างสำหรับการทดสอบ
SLEEP_DATA='{
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

# ฟังก์ชันสำหรับแสดงการใช้งาน
show_usage() {
    echo "🔧 การใช้งาน:"
    echo "  ./test-sleep-log-curl.sh [JWT_TOKEN]"
    echo ""
    echo "📝 ตัวอย่าง:"
    echo "  ./test-sleep-log-curl.sh eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    echo ""
    echo "🔑 หรือแก้ไขตัวแปร JWT_TOKEN ในไฟล์นี้"
}

# ตรวจสอบ JWT Token
if [ "$1" != "" ]; then
    JWT_TOKEN="$1"
fi

if [ "$JWT_TOKEN" = "YOUR_JWT_TOKEN_HERE" ]; then
    echo "⚠️  กรุณาใส่ JWT Token ที่ถูกต้อง"
    echo ""
    show_usage
    exit 1
fi

echo "🚀 เริ่มทดสอบ Sleep Log API..."
echo "📡 API URL: $API_URL"
echo "🔑 JWT Token: ${JWT_TOKEN:0:20}..."
echo ""

# เรียก API
echo "📊 ส่งข้อมูลการนอนหลับ..."
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d "$SLEEP_DATA")

# แยก response body และ status code
http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

echo "📡 HTTP Status Code: $http_code"
echo ""

# ตรวจสอบผลลัพธ์
if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
    echo "✅ API Call สำเร็จ!"
    echo "📋 Response:"
    echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
else
    echo "❌ API Call ล้มเหลว!"
    echo "🔍 Error Response:"
    echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
fi

echo ""
echo "🎯 การทดสอบเสร็จสิ้น!"
