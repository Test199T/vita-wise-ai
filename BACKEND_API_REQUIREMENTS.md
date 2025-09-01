# Backend API Requirements - NestJS

## 🚨 ปัญหาปัจจุบัน
```
[Nest] 48588 - ERROR [HttpExceptionFilter] Exception occurred: Cannot GET /user/profile
NotFoundException: Cannot GET /user/profile
```

**สาเหตุ:** Frontend พยายามเรียก `/user/profile` แต่ Backend ไม่มี endpoint นี้

---

## 🛠️ API Endpoints ที่ต้องสร้าง

### 1. User Profile Endpoints

#### Primary Endpoint (แนะนำ):
```typescript
// GET /user/profile
@Controller('user')
export class UserController {
  @Get('profile')
  @UseGuards(JwtAuthGuard) // ต้องมี Authentication
  async getProfile(@Request() req) {
    const userId = req.user.id;
    const user = await this.userService.findById(userId);
    
    return {
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        date_of_birth: user.date_of_birth,
        gender: user.gender,
        height_cm: user.height_cm,
        weight_kg: user.weight_kg,
        activity_level: user.activity_level,
        health_data: user.health_data,
        health_goals: user.health_goals,
        nutrition_goals: user.nutrition_goals,
        daily_behavior: user.daily_behavior,
        medical_history: user.medical_history,
        created_at: user.created_at,
        updated_at: user.updated_at,
        is_active: user.is_active
      }
    };
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() updateData) {
    const userId = req.user.id;
    const updatedUser = await this.userService.update(userId, updateData);
    
    return {
      data: updatedUser
    };
  }
}
```

#### Alternative Endpoints (กรณีต้องการ):
```typescript
// GET /me (หรือ /api/me)
@Get('me')
@UseGuards(JwtAuthGuard)
async getCurrentUser(@Request() req) {
  // Same logic as getProfile
}

// GET /profile 
@Get('profile')
@UseGuards(JwtAuthGuard)
async getProfile(@Request() req) {
  // Same logic
}
```

### 2. Health Check Endpoints

```typescript
@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }
}
```

---

## 🔐 Authentication Guard

```typescript
// jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw new UnauthorizedException('Invalid or missing token');
    }
    return user;
  }
}
```

---

## 📊 Database Entity (ตาม Schema)

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ 
    type: 'enum', 
    enum: ['male', 'female', 'other'],
    nullable: true 
  })
  gender: string;

  @Column({ type: 'decimal', nullable: true })
  height_cm: number;

  @Column({ type: 'decimal', nullable: true })
  weight_kg: number;

  @Column({ 
    type: 'enum',
    enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'],
    nullable: true
  })
  activity_level: string;

  @Column({ type: 'jsonb', nullable: true })
  health_data: object;

  @Column({ type: 'jsonb', nullable: true })
  health_goals: object;

  @Column({ type: 'jsonb', nullable: true })
  nutrition_goals: object;

  @Column({ type: 'jsonb', nullable: true })
  daily_behavior: object;

  @Column({ type: 'jsonb', nullable: true })
  medical_history: object;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ default: true })
  is_active: boolean;
}
```

---

## 🌐 CORS Configuration

```typescript
// main.ts
app.enableCors({
  origin: ['http://localhost:8080', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
```

---

## 🧪 Testing Endpoints

### Test Profile API:
```bash
# 1. Login เพื่อได้ Token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Response: {"access_token": "eyJ..."}

# 2. Test Get Profile
curl -X GET http://localhost:3000/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 3. Test Update Profile  
curl -X PUT http://localhost:3000/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Updated Name"}'
```

---

## 📋 Checklist

### Required for Basic Functionality:
- [ ] `GET /user/profile` - ดึงข้อมูล User
- [ ] `PUT /user/profile` - อัปเดตข้อมูล User  
- [ ] `GET /health` - Health check
- [ ] JWT Authentication Guard
- [ ] CORS Configuration

### Optional (แนะนำ):
- [ ] `GET /me` - Alternative profile endpoint
- [ ] Input validation with class-validator
- [ ] Error handling middleware
- [ ] Rate limiting
- [ ] Logging

---

## 🎯 หลังจากสร้าง Endpoints

1. **Frontend จะทำงานได้ทันที** - ไม่ต้องแก้ไข Frontend
2. **Debug Page จะแสดง** "Connected" แทน "Failed"
3. **Profile Page จะใช้ข้อมูลจริง** แทน Mock Data
4. **Badge "Mock Data" จะหายไป**

---

## 🔍 Debug Information

Frontend จะพยายามเรียก endpoints ตามลำดับ:
1. `/user/profile` ⭐ (แนะนำ)
2. `/users/profile`
3. `/profile`
4. `/me`
5. `/user/me`

**สร้างอย่างน้อย 1 endpoint** จากรายการข้างต้น แล้วระบบจะทำงานได้!
