# VitaWise AI - Profile System Fix

## ปัญหาที่แก้ไข ✅

### 🔍 ปัญหาเดิม:
1. **หน้า Profile ใช้ Mock Data** - ไม่ได้ดึงข้อมูลจริงจาก Database
2. **ไม่มี API Service** - ไม่มีระบบจัดการการเรียก API  
3. **Token Management ไม่สมบูรณ์** - ระบบจัดการ Token ไม่มี Error Handling
4. **ไม่มี Loading/Error States** - ไม่มีการแสดงสถานะ Loading/Error

### 🛠️ การแก้ไขที่ดำเนินการ:

#### 1. API Service (`/src/services/api.ts`)
```typescript
// สร้าง TypeScript interfaces สำหรับข้อมูล
export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  height_cm?: number;
  weight_kg?: number;
  // ... fields อื่นๆ ตาม database schema
}

// API Service class
export const apiService = new APIService();
```

**Features:**
- ✅ Type-safe API calls
- ✅ Automatic token handling
- ✅ Error handling และ retry logic
- ✅ Response validation

#### 2. Custom Hook (`/src/hooks/useProfile.ts`)
```typescript
export const useProfile = () => {
  const { profile, loading, error, refreshProfile, updateProfile } = useProfile();
  // จัดการ state ของ profile data อัตโนมัติ
}
```

**Features:**
- ✅ Automatic data fetching
- ✅ Loading states
- ✅ Error handling
- ✅ Cache management
- ✅ Real-time updates

#### 3. Updated Profile Component (`/src/pages/Profile.tsx`)
**เปลี่ยนจาก:**
```typescript
// Mock data
const [profileData, setProfileData] = useState({
  firstName: "สมใจ",
  lastName: "ใสใจ",
  // ... hard-coded values
});
```

**เป็น:**
```typescript
// Real API data
const { profile, loading, error, updateProfile } = useProfile();
```

**Features ใหม่:**
- ✅ ดึงข้อมูลจริงจาก Database
- ✅ Loading indicators
- ✅ Error handling
- ✅ Refresh button
- ✅ Real-time BMI calculation
- ✅ Authentication checks

#### 4. Debug Tools (`/src/components/debug/DebugConnection.tsx`)
```typescript
// ตรวจสอบสถานะการเชื่อมต่อทั้งหมด
- API Connection ✅/❌
- Database ✅/❌  
- Authentication ✅/❌
- User Profile ✅/❌
```

**เข้าถึงได้ที่:** `/debug`

**Features:**
- ✅ Connection status monitoring
- ✅ Token validation
- ✅ Error diagnostics
- ✅ Clear data functions

#### 5. Enhanced Token Management (`/src/lib/utils.ts`)
```typescript
export const tokenUtils = {
  isValidToken: (token: string | null): boolean => {
    // ตรวจสอบ JWT format (header.payload.signature)
  },
  getValidToken: (): string | null => {
    // ได้ token ที่ valid เท่านั้น
  },
  setToken: (token: string): boolean => {
    // บันทึก token พร้อม validation
  }
}
```

## 🚀 การใช้งานใหม่

### 1. Profile หน้าใหม่
- เข้าสู่ระบบ → ไป `/profile`
- ข้อมูลจะดึงจาก API อัตโนมัติ
- แก้ไขข้อมูล → บันทึกลง Database จริง

### 2. Debug & Troubleshooting
- เข้า `/debug` เพื่อตรวจสอบสถานะ
- ดู Token validity
- ตรวจสอบการเชื่อมต่อ API

### 3. Error Handling
```
🔄 Loading State - แสดง Spinner
❌ Error State - แสดงข้อความ Error + Retry button  
📱 Offline Mode - ใช้ข้อมูลจาก Cache
🔐 Auth Error - Redirect ไป Login
```

## 🛠️ สำหรับ Backend Developer

### Required API Endpoints:
```bash
GET  /health              # Health check
POST /auth/login          # User login
GET  /user/profile        # Get user profile  
PUT  /user/profile        # Update user profile
```

### CORS Configuration:
```javascript
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Authentication Middleware:
```javascript
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};
```

## 🧪 การทดสอบ

### Manual Testing:
```bash
# 1. Test API Connection
curl -X GET http://localhost:3000/health

# 2. Test Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# 3. Test Profile API (ใส่ token ที่ได้จาก login)
curl -X GET http://localhost:3000/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Frontend Testing:
1. เข้า `http://localhost:8080/debug`
2. กด "Refresh" เพื่อทดสอบการเชื่อมต่อ
3. ตรวจสอบสถานะทั้ง 4 ข้อ
4. ดู Debug Information

## 📁 ไฟล์ที่ถูกสร้าง/แก้ไข

### ไฟล์ใหม่:
- `/src/services/api.ts` - API Service
- `/src/hooks/useProfile.ts` - Profile Hook  
- `/src/components/debug/DebugConnection.tsx` - Debug Component
- `/src/pages/Debug.tsx` - Debug Page
- `/TROUBLESHOOTING.md` - คู่มือแก้ปัญหา

### ไฟล์ที่แก้ไข:
- `/src/pages/Profile.tsx` - ใช้ข้อมูลจริงแทน Mock
- `/src/lib/utils.ts` - Enhanced Token Management  
- `/src/App.tsx` - เพิ่ม Debug route
- `/src/components/layout/Navigation.tsx` - เพิ่ม Debug menu

## 🔧 Next Steps

### ถ้า Backend พร้อมแล้ว:
1. ✅ ทดสอบ Login → ได้ Token
2. ✅ ทดสอบ Profile API → ได้ข้อมูล  
3. ✅ ทดสอบ Update Profile → บันทึกสำเร็จ

### ถ้ายังมีปัญหา:
1. 🔍 เข้า `/debug` ดูสถานะ
2. 📋 เช็ค `TROUBLESHOOTING.md`
3. 🌐 ดู Network tab ใน Developer Tools
4. 📝 ดู Console logs

---

## 🎯 สรุป

**ก่อนแก้ไข:**
- ❌ Profile ใช้ Mock Data
- ❌ ไม่มี API Service
- ❌ ไม่มี Error Handling

**หลังแก้ไข:**  
- ✅ Profile ดึงข้อมูลจาก Database จริง
- ✅ มี API Service พร้อม Type Safety
- ✅ มี Loading/Error States
- ✅ มี Debug Tools สำหรับ Troubleshooting
- ✅ มี Fallback mechanisms

**ตอนนี้ระบบพร้อมใช้งานจริงแล้ว!** 🚀
