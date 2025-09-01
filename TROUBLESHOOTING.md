// CORS and Backend Connection Troubleshooting Guide

## สาเหตุที่พบบ่อยและการแก้ไข

### 1. CORS Error
```
Access to fetch at 'http://localhost:3000/...' from origin 'http://localhost:8080' 
has been blocked by CORS policy
```

**การแก้ไข:**
```javascript
// Backend (Express.js) - app.js หรือ server.js
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173'], // Frontend URLs
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 2. Backend ไม่ทำงาน
```
Failed to fetch
TypeError: NetworkError when attempting to fetch resource
```

**ตรวจสอบ:**
1. Backend server ทำงานที่ port 3000
2. ตรวจสอบ console backend
3. ใช้ curl ทดสอบ API

```bash
# Test API connection
curl -X GET http://localhost:3000/health
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

### 3. Token Management Issues

**ปัญหา:** Token ไม่ถูกส่งไปยัง Backend
```javascript
// ตรวจสอบ Token ใน Developer Tools
console.log('Token:', localStorage.getItem('token'));
console.log('Token valid:', tokenUtils.isValidToken(localStorage.getItem('token')));
```

**การแก้ไข:**
```javascript
// ใน API Service
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
```

### 4. Database Connection Issues

**ปัญหา:** Backend เชื่อมต่อฐานข้อมูลไม่ได้
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**ตรวจสอบ:**
1. PostgreSQL ทำงานหรือไม่
2. Database credentials ถูกต้อง
3. Database ถูกสร้างแล้ว

```bash
# Check PostgreSQL status
brew services list | grep postgresql
# หรือ
systemctl status postgresql

# Test database connection
psql -h localhost -U your_username -d your_database
```

### 5. API Endpoint ไม่ตรงกัน

**ปัญหา:** 404 Not Found
```
GET http://localhost:3000/user/profile 404 (Not Found)
```

**ตรวจสอบ:**
1. Route ใน Backend
2. HTTP Method ตรงกันหรือไม่
3. URL path ถูกต้อง

### 6. Authentication Middleware

**Backend Route Example:**
```javascript
// routes/user.js
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Protected routes
app.get('/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ data: user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
```

### 7. Frontend Environment Variables

**ตรวจสอบ:** API Base URL
```javascript
// vite.config.ts หรือ .env
VITE_API_BASE_URL=http://localhost:3000

// ใน services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
```

### 8. Debug Commands

```bash
# ตรวจสอบ Network tab ใน Developer Tools
# ดู Request/Response headers
# ตรวจสอบ Status Code

# Backend logs
console.log('Request received:', req.method, req.path);
console.log('Headers:', req.headers);
console.log('Body:', req.body);
console.log('User:', req.user);

# Frontend logs
console.log('Making API call:', url, options);
console.log('Response:', response.status, response.statusText);
```

## การทดสอบ Step by Step

1. **ทดสอบ Backend API**
```bash
curl -X GET http://localhost:3000/health
```

2. **ทดสอบ Login**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

3. **ทดสอบ Protected Route**
```bash
curl -X GET http://localhost:3000/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

4. **ตรวจสอบ Frontend Console**
   - เปิด Developer Tools (F12)
   - ดู Console tab
   - ดู Network tab
   - ตรวจสอบ Application tab > Local Storage

## แก้ไขปัญหาที่พบบ่อย

### ถ้า Login ได้แต่ดึง Profile ไม่ได้:
1. ตรวจสอบ Token ใน localStorage
2. ตรวจสอบ API endpoint `/user/profile`
3. ตรวจสอบ Authentication middleware
4. ดู Network tab ใน Developer Tools

### ถ้าได้ CORS Error:
1. เพิ่ม CORS middleware ใน Backend
2. ตั้งค่า origin ให้ถูกต้อง
3. ตรวจสอบ credentials: true

### ถ้าไม่แน่ใจปัญหาอยู่ตรงไหน:
1. เปิด Network tab
2. ลองทำ action ที่มีปัญหา
3. ดู request ที่ fail
4. ตรวจสอบ Status Code และ Response
