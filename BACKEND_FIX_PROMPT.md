# 🛠️ Backend Fix Prompt - User ID Issue

## ปัญหา
JWT token มี user ID ที่ไม่ตรงกับข้อมูลในฐานข้อมูล ทำให้หาข้อมูล user ไม่เจอ เกิด error "JSON object requested, multiple (or no) rows returned"

## วิธีแก้ไข

### 1. แก้ไข ProfileController.ts

**ไฟล์:** `/src/profile/profile.controller.ts`

**ค้นหาบรรทัดนี้:**
```typescript
const userId = req.user.id as string;
```

**เปลี่ยนเป็น:**
```typescript
const email = req.user.email as string;
```

**แก้ไขใน methods เหล่านี้:**

**getUserProfile method:**
```typescript
@Get('users/profile')
@UseGuards(AuthGuard)
async getUserProfile(@Request() req: any): Promise<ApiResponse<any>> {
  try {
    const email = req.user.email as string; // ✅ เปลี่ยนจาก userId
    console.log('👤 Getting profile for email:', email);
    const profile = await this.profileService.getUserProfileByEmail(email); // ✅ ใช้ method ใหม่

    return {
      data: profile,
      message: 'Profile retrieved successfully',
    };
  } catch (error: any) {
    console.error('❌ Profile retrieval error:', error);
    throw new HttpException(
      'Failed to retrieve profile',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
```

**createUserProfile method:**
```typescript
@Post('users/profile')
@UseGuards(AuthGuard)
async createUserProfile(
  @Request() req: any,
  @Body() profileData: ProfileUpdateDto,
): Promise<ApiResponse<any>> {
  try {
    const email = req.user.email as string; // ✅ เปลี่ยนจาก userId
    console.log('🆕 Creating profile for email:', email);

    const newProfile = await this.profileService.createUserProfileByEmail( // ✅ ใช้ method ใหม่
      email,
      profileData,
    );

    return {
      data: newProfile,
      message: 'Profile created successfully',
    };
  } catch (error: any) {
    console.error('❌ Profile creation error:', error);
    throw new HttpException(
      'Failed to create profile',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
```

**updateUserProfile method:**
```typescript
@Put('users/profile')
@UseGuards(AuthGuard)
async updateUserProfile(
  @Request() req: any,
  @Body() updateData: ProfileUpdateDto,
): Promise<ApiResponse<any>> {
  try {
    const email = req.user.email as string; // ✅ เปลี่ยนจาก userId
    console.log('🔄 Updating profile for email:', email);

    const updatedProfile = await this.profileService.updateUserProfileByEmail( // ✅ ใช้ method ใหม่
      email,
      updateData,
    );

    return {
      data: updatedProfile,
      message: 'Profile updated successfully',
    };
  } catch (error: any) {
    console.error('❌ Profile update error:', error);
    throw new HttpException(
      'Failed to update profile',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
```

### 2. แก้ไข ProfileService.ts

**ไฟล์:** `/src/profile/profile.service.ts`

**เพิ่ม methods ใหม่เหล่านี้:**

```typescript
// ใช้ email หา user แทน userId
async getUserProfileByEmail(email: string): Promise<any> {
  try {
    console.log('🔍 Finding user by email:', email);
    
    // หา user จาก email ใน database
    const { data: user, error } = await this.supabaseService.client
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new NotFoundException(`User with email ${email} not found`);
    }

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    console.log('✅ Found user:', { id: user.id, email: user.email });
    return user;
  } catch (error: any) {
    console.error('Database error:', error);
    throw new NotFoundException(`User with email ${email} not found`);
  }
}

async createUserProfileByEmail(
  email: string,
  profileData: ProfileUpdateDto,
): Promise<any> {
  try {
    console.log('🆕 Creating/updating user profile by email:', email);
    
    // อัพเดท profile ของ user โดยใช้ email
    const { data: updatedUser, error } = await this.supabaseService.client
      .from('users')
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq('email', email)
      .eq('is_active', true)
      .select()
      .single();

    if (error) {
      console.error('Database update error:', error);
      throw new NotFoundException('Failed to create/update user profile');
    }

    console.log('✅ Profile created/updated successfully:', { 
      id: updatedUser.id, 
      email: updatedUser.email 
    });
    return updatedUser;
  } catch (error: any) {
    console.error('Database create error:', error);
    throw new NotFoundException('Failed to create user profile');
  }
}

async updateUserProfileByEmail(
  email: string,
  updateData: ProfileUpdateDto,
): Promise<any> {
  try {
    console.log('🔄 Updating user profile by email:', { email, updateData });

    // อัพเดท profile
    const { data: updatedUser, error } = await this.supabaseService.client
      .from('users')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('email', email)
      .eq('is_active', true)
      .select()
      .single();

    if (error) {
      console.error('Database update error:', error);
      throw new NotFoundException('Failed to update user profile');
    }

    console.log('✅ Profile updated successfully:', { 
      id: updatedUser.id, 
      email: updatedUser.email 
    });
    return updatedUser;
  } catch (error: any) {
    console.error('Database update error:', error);
    throw new NotFoundException('Failed to update user profile');
  }
}
```

### 3. รีสตาร์ท Backend

หลังแก้ไขเสร็จแล้ว:

```bash
cd /Volumes/P1Back/API-PROEND
# หยุด backend (Ctrl+C)
npm run start:dev
```

### 4. ทดสอบ

**ใน Postman:**
- URL: `GET http://localhost:3000/users/profile`
- Headers: `Authorization: Bearer {{access_token}}`
- ควรได้ response กลับมาเป็นข้อมูล user แทน error

**ใน Frontend:**
- เข้า `http://localhost:8080/profile`
- ควรเห็นข้อมูล profile แสดงปกติ

## ข้อดีของการแก้ไข

✅ **แก้ปัญหา user ID ไม่ต่อเนื่อง** - ใช้ email เป็น key แทน  
✅ **ปลอดภัยกว่า** - email ไม่เปลี่ยนแปลง  
✅ **มั่นคงกว่า** - ไม่กังวลเรื่อง ID ที่ถูกลบ  
✅ **ใช้งานง่าย** - email มาจาก JWT token โดยตรง

## หมายเหตุ

- เก็บ methods เดิมไว้เพื่อ backward compatibility
- เพิ่ม console.log เพื่อ debug
- ใช้ `.single()` เพื่อให้แน่ใจว่าได้ข้อมูลแค่ 1 record
- เช็ค `is_active = true` เพื่อไม่เอา user ที่ถูก deactivate
