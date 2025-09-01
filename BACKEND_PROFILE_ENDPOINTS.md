# 🚀 Backend Profile Endpoints - NestJS Implementation

สร้าง Controller และ Service สำหรับ Profile Management

## 1. สร้าง Profile Controller

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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // GET /user/profile - ดึงข้อมูล profile
  @Get('user/profile')
  @UseGuards(JwtAuthGuard)
  async getUserProfile(@Request() req) {
    try {
      const userId = req.user.id; // จาก JWT token
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

  // PUT /user/profile - อัพเดทข้อมูล profile
  @Put('user/profile')
  @UseGuards(JwtAuthGuard)
  async updateUserProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    try {
      const userId = req.user.id; // จาก JWT token
      const updatedProfile = await this.profileService.updateUserProfile(
        userId, 
        updateProfileDto
      );
      
      return {
        data: updatedProfile,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      throw new HttpException(
        'Failed to update profile',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
```

## 2. สร้าง Profile Service

```typescript
// src/profile/profile.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getUserProfile(userId: string) {
    const { data, error } = await this.supabaseService.client
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
      throw new NotFoundException('User profile not found');
    }

    return data;
  }

  async updateUserProfile(userId: string, updateData: UpdateProfileDto) {
    const { data, error } = await this.supabaseService.client
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
      throw new NotFoundException('Failed to update user profile');
    }

    return data;
  }
}
```

## 3. สร้าง DTO

```typescript
// src/profile/dto/update-profile.dto.ts
import { IsOptional, IsString, IsNumber, IsEnum, IsDateString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: 'male' | 'female' | 'other';

  @IsOptional()
  @IsNumber()
  height_cm?: number;

  @IsOptional()
  @IsNumber()
  weight_kg?: number;

  @IsOptional()
  @IsEnum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'])
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
}
```

## 4. อัพเดท Module

```typescript
// src/profile/profile.module.ts
import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
```

## 5. เพิ่มใน App Module

```typescript
// src/app.module.ts
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    // ... other modules
    ProfileModule,
  ],
  // ...
})
export class AppModule {}
```

## 🧪 ทดสอบ Endpoints

```bash
# GET Profile
curl -X GET "http://localhost:3000/user/profile" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# UPDATE Profile  
curl -X PUT "http://localhost:3000/user/profile" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "height_cm": 175,
    "weight_kg": 70
  }'
```

สร้างตามขั้นตอนนี้แล้ว Frontend จะเชื่อมต่อได้ทันที!
