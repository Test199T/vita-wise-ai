# Profile Picture Feature

## ภาพรวม (Overview)

ฟีเจอร์รูปโปรไฟล์ที่เพิ่มเข้ามาใหม่นี้ช่วยให้ผู้ใช้สามารถ:
- อัปโหลดรูปภาพโปรไฟล์
- บันทึกรูปภาพใน Local Storage
- แสดงรูปภาพในส่วนต่างๆ ของแอปพลิเคชัน
- ลบรูปภาพโปรไฟล์

## ฟีเจอร์ที่เพิ่มเข้ามา (New Features)

### 1. อัปโหลดรูปภาพ (Image Upload)
- รองรับไฟล์รูปภาพ (JPG, PNG, GIF, etc.)
- จำกัดขนาดไฟล์ไม่เกิน 5MB
- แสดงสถานะการอัปโหลด (Loading)
- ตรวจสอบประเภทไฟล์

### 2. การจัดเก็บข้อมูล (Data Storage)
- บันทึกรูปภาพใน Local Storage
- ใช้ Data URL format สำหรับการจัดเก็บ
- โหลดรูปภาพอัตโนมัติเมื่อเปิดแอป

### 3. การแสดงผล (Display)
- แสดงในหน้า Profile
- แสดงใน Header ของแอป
- Fallback เป็นตัวอักษรแรกของชื่อผู้ใช้

## การใช้งาน (Usage)

### ในหน้า Profile
1. คลิกปุ่ม "แก้ไขโปรไฟล์"
2. คลิกปุ่ม "เปลี่ยนรูปภาพ"
3. เลือกไฟล์รูปภาพ
4. รูปภาพจะถูกอัปโหลดและแสดงทันที

### การลบรูปภาพ
1. คลิกปุ่ม "ลบรูปภาพ" ในหน้า Profile
2. รูปภาพจะถูกลบออกจาก Local Storage

## โครงสร้างโค้ด (Code Structure)

### Custom Hook: `useProfilePicture`
```typescript
const {
  profilePicture,        // รูปภาพปัจจุบัน
  loading,              // สถานะการโหลด
  uploadProfilePicture, // ฟังก์ชันอัปโหลด
  removeProfilePicture, // ฟังก์ชันลบ
} = useProfilePicture();
```

### ไฟล์ที่เกี่ยวข้อง (Related Files)
- `src/hooks/useProfilePicture.ts` - Custom hook สำหรับจัดการรูปภาพ
- `src/pages/Profile.tsx` - หน้า Profile ที่มีฟีเจอร์อัปโหลด
- `src/components/layout/Header.tsx` - Header ที่แสดงรูปภาพ
- `src/components/ProfilePictureTest.tsx` - ไฟล์ทดสอบ

## การตรวจสอบความถูกต้อง (Validation)

### ประเภทไฟล์
- ต้องเป็นไฟล์รูปภาพเท่านั้น
- รองรับ: image/jpeg, image/png, image/gif, image/webp

### ขนาดไฟล์
- จำกัดไม่เกิน 5MB
- แสดงข้อความแจ้งเตือนหากเกินขนาด

## การจัดการข้อผิดพลาด (Error Handling)

### กรณีที่อาจเกิดขึ้น
1. ไฟล์ไม่ใช่รูปภาพ
2. ขนาดไฟล์เกิน 5MB
3. ไม่สามารถอ่านไฟล์ได้
4. Local Storage ไม่พร้อมใช้งาน

### การแจ้งเตือน
- ใช้ Toast notifications
- แสดงข้อความภาษาไทย
- แยกประเภทข้อผิดพลาด (success/error)

## การทดสอบ (Testing)

### ไฟล์ทดสอบ
- `ProfilePictureTest.tsx` - คอมโพเนนต์สำหรับทดสอบฟีเจอร์

### สิ่งที่ทดสอบได้
1. อัปโหลดรูปภาพ
2. ลบรูปภาพ
3. แสดงสถานะการโหลด
4. การบันทึกใน Local Storage

## การปรับแต่งเพิ่มเติม (Customization)

### การเปลี่ยนขนาดรูปภาพ
สามารถปรับแต่งขนาดรูปภาพใน Avatar component:
```tsx
<Avatar className="h-20 w-20"> // เปลี่ยนขนาดที่นี่
```

### การเปลี่ยนข้อความ
แก้ไขข้อความในไฟล์ Profile.tsx:
```tsx
"เปลี่ยนรูปภาพ" // ปุ่มอัปโหลด
"ลบรูปภาพ"     // ปุ่มลบ
```

## ข้อควรระวัง (Notes)

1. **Local Storage Limit**: Local Storage มีขนาดจำกัด (ประมาณ 5-10MB)
2. **Performance**: รูปภาพขนาดใหญ่จะใช้พื้นที่ Local Storage มาก
3. **Browser Support**: ต้องใช้เบราว์เซอร์ที่รองรับ Local Storage
4. **Data Persistence**: ข้อมูลจะหายไปเมื่อล้าง Local Storage

## การพัฒนาต่อ (Future Development)

### ฟีเจอร์ที่อาจเพิ่ม
1. การปรับขนาดรูปภาพอัตโนมัติ
2. การอัปโหลดไปยัง Server
3. การแสดงรูปภาพในส่วนอื่นๆ ของแอป
4. การสำรองข้อมูลรูปภาพ
5. การจัดการรูปภาพหลายรูป
