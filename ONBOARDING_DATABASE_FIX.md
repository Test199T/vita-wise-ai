# การแก้ไขปัญหาการบันทึกข้อมูลการสมัครลงฐานข้อมูล

## ปัญหาที่พบ
ข้อมูลการสมัคร Step By Step ในหน้า Onboarding ไม่เข้าฐานข้อมูล เนื่องจากระบบเดิมบันทึกข้อมูลลง Local Storage แทนที่จะบันทึกลงฐานข้อมูล

## การแก้ไขที่ทำ

### 1. แก้ไขหน้า Onboarding.tsx
- เพิ่ม import `apiService` จาก `@/services/api`
- เปลี่ยน Logic การบันทึกข้อมูลจากการบันทึกลง Local Storage มาเป็นการบันทึกลงฐานข้อมูลผ่าน API Service
- ใช้ `apiService.saveOnboardingData()` เพื่อบันทึกข้อมูลลงฐานข้อมูล
- เพิ่มการจัดการ error และแสดงข้อความแจ้งเตือนที่เหมาะสม
- **เพิ่มฟิลด์ lifestyle ที่ครบถ้วน**:
  - `waterIntakeGlasses` - การดื่มน้ำต่อวัน (แก้ว)
  - `caffeineCupsPerDay` - การดื่มกาแฟ/คาเฟอีนต่อวัน (แก้ว)
  - `screenTimeHours` - เวลาจ้องหน้าจอต่อวัน
  - `stressLevel` - ระดับความเครียด
  - `relaxationFrequency` - ความถี่ในการผ่อนคลาย
  - `lateMealFrequency` - ความถี่ในการกินมื้อดึก
  - `otherLifestyleNotes` - หมายเหตุอื่นๆ

### 2. แก้ไข OnboardingContext.tsx
- ปรับปรุง `completeOnboarding` function ให้บันทึกข้อมูลลงฐานข้อมูลเป็นหลัก
- ใช้ Local Storage เป็น backup เมื่อไม่สามารถบันทึกลงฐานข้อมูลได้
- เพิ่มการจัดการ error ที่ดีขึ้น
- **อัพเดท defaultOnboardingData** ให้มีข้อมูล lifestyle ที่ครบถ้วน

### 3. แก้ไข API Service (src/services/api.ts) ⭐ **สำคัญ**
- **แก้ไข `convertOnboardingToProfile` function** ให้ส่งข้อมูล 5 ตัวที่ขาดหายไป:
  - `health_data` - ข้อมูลสุขภาพ (ความดันโลหิต, น้ำตาลในเลือด, BMI, รอบเอว)
  - `health_goals` - เป้าหมายสุขภาพ (ประเภท, ชื่อ, คำอธิบาย, ระยะเวลา)
  - `nutrition_goals` - เป้าหมายโภชนาการ (แคลอรี่, โปรตีน, คาร์บ, ไขมัน, ไฟเบอร์, โซเดียม, น้ำ)
  - `daily_behavior` - พฤติกรรมประจำวัน (การออกกำลังกาย, การนอน, มื้ออาหาร, สูบบุหรี่, แอลกอฮอล์, คาเฟอีน, หน้าจอ, ความเครียด)
  - `medical_history` - ประวัติสุขภาพ (โรคประจำตัว, การผ่าตัด, อาการแพ้)

### 4. Logic ที่ใช้
ใช้ Logic การอัพเดทข้อมูลสุขภาพจากหน้า Profile:
- ใช้ `apiService.saveOnboardingData()` เพื่อบันทึกข้อมูล
- แปลงข้อมูล onboarding เป็นรูปแบบที่ backend ต้องการ
- จัดการ JWT Token และการยืนยันตัวตน
- บันทึกข้อมูลลงฐานข้อมูลแทน Local Storage
- **ส่งข้อมูลครบทั้ง 5 หมวดหมู่ที่ backend ต้องการ**

## การทำงานใหม่

### ขั้นตอนการบันทึกข้อมูล
1. ผู้ใช้กรอกข้อมูลการสมัครในหน้า Onboarding
2. เมื่อเสร็จสิ้น ระบบจะตรวจสอบ JWT Token
3. แปลงข้อมูล onboarding เป็นรูปแบบที่ backend ต้องการ
4. **ส่งข้อมูลครบทั้ง 5 หมวดหมู่** ไปยัง backend ผ่าน `apiService.saveOnboardingData()`
5. บันทึกข้อมูลลงฐานข้อมูล
6. อัพเดท Local Storage เป็น backup

### ข้อมูลที่บันทึก (ครบถ้วน) ✅

#### ข้อมูลส่วนตัว
- ชื่อจริง, นามสกุล, เพศ, วันเกิด

#### เป้าหมายสุขภาพ
- เป้าหมายสุขภาพ, ระยะเวลา, แรงจูงใจ

#### ข้อมูลร่างกาย
- ส่วนสูง, น้ำหนัก, รอบเอว, ความดันโลหิต, น้ำตาลในเลือด

#### พฤติกรรมประจำวัน
- ความถี่การออกกำลังกาย, ชั่วโมงการนอน, จำนวนมื้ออาหาร
- การสูบบุหรี่, การดื่มแอลกอฮอล์, ระดับกิจกรรม
- **ข้อมูล lifestyle เพิ่มเติม**:
  - การดื่มน้ำต่อวัน
  - การดื่มกาแฟ/คาเฟอีน
  - เวลาจ้องหน้าจอ
  - ระดับความเครียด
  - ความถี่ในการผ่อนคลาย
  - ความถี่ในการกินมื้อดึก
  - หมายเหตุอื่นๆ

#### ประวัติสุขภาพ
- โรคประจำตัว, การผ่าตัด, อาการแพ้

### ข้อมูล 5 หมวดหมู่ที่ส่งไปยัง Backend ⭐

#### 1. `health_data`
```json
{
  "blood_pressure_systolic": 120,
  "blood_pressure_diastolic": 80,
  "blood_sugar_mg_dl": 95,
  "bmi": 22.5,
  "waist_circumference": 80
}
```

#### 2. `health_goals`
```json
{
  "goal_type": "weight_loss",
  "title": "ลดน้ำหนัก",
  "description": "อยากมีสุขภาพที่ดีขึ้น",
  "target_value": 6,
  "unit": "months",
  "start_date": "2024-01-01",
  "target_date": "2024-07-01",
  "status": "active",
  "priority": "medium"
}
```

#### 3. `nutrition_goals`
```json
{
  "daily_calories": 2000,
  "protein_g": 60,
  "carbs_g": 250,
  "fat_g": 65,
  "fiber_g": 25,
  "sodium_mg": 2300,
  "water_liters": 1.5
}
```

#### 4. `daily_behavior`
```json
{
  "exercise_frequency": "3-5",
  "sleep_hours": 7,
  "meals_per_day": 3,
  "smoking": false,
  "alcohol_frequency": "rarely",
  "caffeine_cups_per_day": 1,
  "screen_time_hours": "2-4",
  "stress_level": "medium",
  "water_intake_glasses": 6
}
```

#### 5. `medical_history`
```json
{
  "conditions": ["hypertension"],
  "surgeries": "ไม่เคยผ่าตัด",
  "allergies": "แพ้ยาเพนิซิลลิน",
  "medications": [],
  "family_history": ""
}
```

### การจัดการ Error
- หากไม่สามารถบันทึกลงฐานข้อมูลได้ ระบบจะแสดงข้อความแจ้งเตือน
- ข้อมูลจะถูกบันทึกใน Local Storage เป็น backup
- ผู้ใช้ยังสามารถเสร็จสิ้น onboarding ได้

## ไฟล์ที่แก้ไข
- `src/pages/Onboarding.tsx` - หน้า Onboarding หลัก
- `src/contexts/OnboardingContext.tsx` - Context สำหรับจัดการข้อมูล onboarding
- `src/services/api.ts` - **API Service (แก้ไขข้อมูล 5 หมวดหมู่)**

## การทดสอบ
1. สมัครสมาชิกใหม่
2. กรอกข้อมูลในหน้า Onboarding (รวมข้อมูล lifestyle เพิ่มเติม)
3. ตรวจสอบว่าข้อมูลถูกบันทึกลงฐานข้อมูล **ครบทั้ง 5 หมวดหมู่**
4. ตรวจสอบ Local Storage ว่ามีข้อมูล backup

## หมายเหตุ
- ระบบจะยังคงใช้ Local Storage เป็น backup เพื่อความปลอดภัย
- หาก backend ไม่พร้อม ข้อมูลจะถูกบันทึกในเครื่องและรอการส่งในภายหลัง
- การแก้ไขนี้ใช้ Logic เดียวกับหน้า Profile ที่ทำงานได้แล้ว
- **ข้อมูล lifestyle เพิ่มเติมจะช่วยให้ระบบวิเคราะห์สุขภาพได้แม่นยำมากขึ้น**
- **ข้อมูล 5 หมวดหมู่จะถูกส่งไปยัง backend อย่างครบถ้วน** ✅
