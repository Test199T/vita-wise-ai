# 🚀 สร้าง Profile UPDATE Endpoint ใน NestJS

Backend ขาด endpoint สำหรับการอัพเดท profile ให้เพิ่ม endpoint นี้:

## 📍 สร้างไฟล์ Profile Controller

```bash
# สร้างไฟล์ controller ใหม่
touch src/profile/profile.controller.ts
touch src/profile/profile.service.ts
touch src/profile/profile.module.ts
```

## 1️⃣ Profile Controller

```typescript
// src/profile/profile.controller.ts
import { 
  Controller, 
  Get, 
  Put, 
  Body, 
  UseGuards, 
  Request,
  HttpStatus,
  HttpException 
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // ปรับ path ตาม project
import { ProfileService } from './profile.service';

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // GET /users/profile - ดึงข้อมูล profile
  @Get('users/profile')
  @UseGuards(JwtAuthGuard)
  async getUserProfile(@Request() req) {
    try {
      const userId = req.user.id; // หรือ req.user.userId ตาม JWT structure
      const profile = await this.profileService.getUserProfile(userId);
      
      return {
        data: profile,
        message: 'Profile retrieved successfully'
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve profile',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // PUT /users/profile - อัพเดทข้อมูล profile
  @Put('users/profile')
  @UseGuards(JwtAuthGuard)
  async updateUserProfile(
    @Request() req,
    @Body() updateData: any // ใช้ any ชั่วคราว
  ) {
    try {
      const userId = req.user.id; // หรือ req.user.userId
      console.log('Updating profile for user:', userId);
      console.log('Update data:', updateData);
      
      const updatedProfile = await this.profileService.updateUserProfile(
        userId, 
        updateData
      );
      
      return {
        data: updatedProfile,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      console.error('Profile update error:', error);
      throw new HttpException(
        'Failed to update profile',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
```

## 2️⃣ Profile Service

```typescript
// src/profile/profile.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class ProfileService {
  private supabase;

  constructor() {
    // ใช้ Supabase client (ปรับตาม config ของคุณ)
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  }

  async getUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select(`
        *,
        health_data:user_health_data(*),
        health_goals:user_health_goals(*),
        nutrition_goals:user_nutrition_goals(*),
        daily_behavior:user_daily_behavior(*),
        medical_history:user_medical_history(*)
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new NotFoundException('User profile not found');
    }

    return data;
  }

  async updateUserProfile(userId: string, updateData: any) {
    console.log('Updating user profile in database:', { userId, updateData });
    
    const { data, error } = await this.supabase
      .from('users')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select(`
        *,
        health_data:user_health_data(*),
        health_goals:user_health_goals(*),
        nutrition_goals:user_nutrition_goals(*),
        daily_behavior:user_daily_behavior(*),
        medical_history:user_medical_history(*)
      `)
      .single();

    if (error) {
      console.error('Database update error:', error);
      throw new NotFoundException('Failed to update user profile');
    }

    console.log('Profile updated successfully:', data);
    return data;
  }
}
```

## 3️⃣ Profile Module

```typescript
// src/profile/profile.module.ts
import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
```

## 4️⃣ เพิ่มใน App Module

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    // ... existing modules
    ProfileModule,
  ],
  // ...
})
export class AppModule {}
```

## 5️⃣ Restart Backend Server

```bash
npm run start:dev
```

## 6️⃣ ทดสอบ Endpoints

```bash
# ทดสอบ GET
curl -X GET "http://localhost:3000/users/profile" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# ทดสอบ PUT
curl -X PUT "http://localhost:3000/users/profile" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "ชื่อใหม่",
    "last_name": "นามสกุลใหม่",
    "height_cm": 175,
    "weight_kg": 70
  }'
```

## ✅ หลังจากทำเสร็จ

1. Restart backend server
2. ไปที่ Frontend profile page
3. กดปรับแก้ไขข้อมูล
4. จะบันทึกได้แล้ว! 🎉

## 🎯 สำคัญ

- ปรับ `req.user.id` ให้ตรงกับ JWT structure ของคุณ
- ปรับ Supabase config ให้ตรงกับ project
- ปรับ path ของ JwtAuthGuard ให้ถูกต้อง
