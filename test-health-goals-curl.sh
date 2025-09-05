#!/bin/bash

# Script สำหรับทดสอบ Health Goals API ด้วย cURL
# ใช้สำหรับทดสอบ API โดยตรงจาก command line

# ตั้งค่า API URL
API_BASE_URL="http://localhost:3000"
ENDPOINT="/health-goals"
FULL_URL="${API_BASE_URL}${ENDPOINT}"

# ตั้งค่า AUTH_TOKEN (แก้ไขตามที่ต้องการ)
AUTH_TOKEN="your_auth_token_here"

# สีสำหรับ output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 เริ่มการทดสอบ Health Goals API${NC}"
echo "====================================="
echo ""

# ฟังก์ชันสำหรับแสดงผลลัพธ์
show_result() {
    local status=$1
    local message=$2
    
    if [ $status -eq 0 ]; then
        echo -e "${GREEN}✅ $message${NC}"
    else
        echo -e "${RED}❌ $message${NC}"
    fi
}

# ทดสอบ 1: API โดยไม่มี Token
echo -e "${YELLOW}🔒 ทดสอบ API โดยไม่มี Token...${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "$FULL_URL" \
    -H "Content-Type: application/json" \
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
    }')

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

echo "HTTP Status: $http_code"
echo "Response: $response_body"
show_result $([ "$http_code" = "401" ] && echo 0 || echo 1) "ควรได้ 401 Unauthorized เมื่อไม่มี token"
echo ""

# ทดสอบ 2: API ด้วยข้อมูลที่ไม่ครบ
echo -e "${YELLOW}🚫 ทดสอบ API ด้วยข้อมูลที่ไม่ครบ...${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "$FULL_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d '{
        "description": "ข้อมูลไม่ครบ"
    }')

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

echo "HTTP Status: $http_code"
echo "Response: $response_body"
show_result $([ "$http_code" = "400" ] && echo 0 || echo 1) "ควรได้ 400 Bad Request เมื่อข้อมูลไม่ครบ"
echo ""

# ทดสอบ 3: API ด้วยข้อมูลที่ถูกต้อง (ถ้ามี token)
if [ "$AUTH_TOKEN" != "your_auth_token_here" ]; then
    echo -e "${YELLOW}🎯 ทดสอบ API ด้วยข้อมูลที่ถูกต้อง...${NC}"
    response=$(curl -s -w "\n%{http_code}" -X POST "$FULL_URL" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
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
        }')

    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)

    echo "HTTP Status: $http_code"
    echo "Response: $response_body"
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        show_result 0 "สร้าง Health Goal สำเร็จ"
    else
        show_result 1 "ควรได้ 200/201 เมื่อสร้างสำเร็จ"
    fi
else
    echo -e "${YELLOW}⚠️  ไม่มี AUTH_TOKEN กรุณาแก้ไขในไฟล์ script${NC}"
    echo "💡 แก้ไข AUTH_TOKEN ในไฟล์นี้เป็น token จริงของคุณ"
fi

echo ""
echo "====================================="
echo -e "${BLUE}🏁 การทดสอบเสร็จสิ้น${NC}"

# คำแนะนำการใช้งาน
echo ""
echo -e "${YELLOW}📖 คำแนะนำการใช้งาน:${NC}"
echo "1. แก้ไข AUTH_TOKEN ในไฟล์นี้เป็น token จริงของคุณ"
echo "2. รัน script: ./test-health-goals-curl.sh"
echo "3. หรือรันด้วย bash: bash test-health-goals-curl.sh"
echo ""
echo -e "${YELLOW}🔧 การแก้ไข AUTH_TOKEN:${NC}"
echo "   AUTH_TOKEN=\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\""
echo ""
echo -e "${YELLOW}📡 API Endpoint:${NC}"
echo "   $FULL_URL"
echo ""
echo -e "${YELLOW}📋 Request Body ตัวอย่าง:${NC}"
cat << 'EOF'
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
EOF
