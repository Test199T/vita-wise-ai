# 🚀 สร้าง PUT /users/profile ใน Backend (Quick Fix)

จาก error logs เห็นว่าต้องสร้าง endpoint สำหรับ UPDATE profile

## 🎯 แก้ไขเร็วที่สุด

### 1️⃣ หาไฟล์ Controller ที่มี GET /users/profile 

```bash
# ค้นหาไฟล์ที่มี users/profile
grep -r "users/profile" src/
# หรือ
find src/ -name "*.ts" -exec grep -l "users/profile" {} \;
```

### 2️⃣ เพิ่ม PUT method ในไฟล์เดิม

เปิดไฟล์ controller ที่มี `@Get('users/profile')` แล้วเพิ่ม:

```typescript
// เพิ่มใน controller ที่มี GET users/profile อยู่แล้ว
@Put('users/profile')
@UseGuards(JwtAuthGuard) // ใช้ guard เดียวกับ GET
async updateUserProfile(
  @Request() req,
  @Body() updateData: any
) {
  try {
    const userId = req.user.id; // หรือ req.user.userId ตาม JWT structure
    console.log('🔄 Updating profile for user:', userId);
    console.log('📝 Update data:', updateData);
    
    // อัพเดทในฐานข้อมูล (ปรับตาม ORM ที่ใช้)
    const updatedProfile = await this.yourService.updateUserProfile(userId, updateData);
    
    return {
      data: updatedProfile,
      message: 'Profile updated successfully'
    };
  } catch (error) {
    console.error('❌ Profile update error:', error);
    throw new HttpException(
      'Failed to update profile',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
```

### 3️⃣ เพิ่ม Service Method

ในไฟล์ service ที่เกี่ยวข้อง เพิ่ม:

```typescript
async updateUserProfile(userId: string, updateData: any) {
  console.log('💾 Updating database for user:', userId);
  
  // ถ้าใช้ Supabase
  const { data, error } = await this.supabase
    .from('users')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) {
    console.error('Database error:', error);
    throw new Error('Failed to update profile');
  }

  return data;
}

// หรือถ้าใช้ TypeORM
async updateUserProfile(userId: string, updateData: any) {
  return await this.userRepository.update(userId, {
    ...updateData,
    updated_at: new Date()
  });
}

// หรือถ้าใช้ Prisma
async updateUserProfile(userId: string, updateData: any) {
  return await this.prisma.user.update({
    where: { id: userId },
    data: {
      ...updateData,
      updated_at: new Date()
    }
  });
}
```

### 4️⃣ แก้ปัญหา Email Validation

เพิ่ม validation เพื่อไม่ให้อัพเดท email:

```typescript
@Put('users/profile')
@UseGuards(JwtAuthGuard)
async updateUserProfile(
  @Request() req,
  @Body() updateData: any
) {
  // ลบ email ออกจาก updateData เพื่อป้องกัน validation error
  const { email, ...profileData } = updateData;
  
  console.log('🚫 Removed email from update data');
  console.log('📝 Allowed update data:', profileData);
  
  // ... rest of the method
}
```

## 🎯 ตัวอย่างไฟล์สมบูรณ์

```typescript
// ในไฟล์ controller ที่มี users/profile อยู่แล้ว
@Controller()
export class YourController {
  
  // GET method ที่มีอยู่แล้ว
  @Get('users/profile')
  @UseGuards(JwtAuthGuard)
  async getUserProfile(@Request() req) {
    // existing code...
  }

  // เพิ่ม PUT method ใหม่
  @Put('users/profile')
  @UseGuards(JwtAuthGuard)
  async updateUserProfile(
    @Request() req,
    @Body() updateData: any
  ) {
    try {
      const userId = req.user.id;
      
      // ลบ email ออกเพื่อป้องกัน validation error
      const { email, ...profileData } = updateData;
      
      console.log('🔄 Updating profile for user:', userId);
      console.log('📝 Update data:', profileData);
      
      const updatedProfile = await this.yourService.updateUserProfile(userId, profileData);
      
      return {
        data: updatedProfile,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      console.error('❌ Profile update error:', error);
      throw new HttpException(
        'Failed to update profile',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
```

## 🚀 ขั้นตอนสำคัญ

1. **หาไฟล์ controller** ที่มี `GET users/profile`
2. **เพิ่ม PUT method** ในไฟล์เดิม
3. **เพิ่ม service method** สำหรับอัพเดท
4. **ลบ email** จาก updateData
5. **Restart backend**: `npm run start:dev`

## ✅ ทดสอบ

หลังจากเพิ่มแล้ว:
- Frontend จะสามารถกดปรับแก้ไขได้
- Backend จะไม่ error อีก
- ข้อมูลจะอัพเดทในฐานข้อมูล

ไปหาไฟล์ controller ที่มี `users/profile` แล้วเพิ่ม PUT method ครับ!
