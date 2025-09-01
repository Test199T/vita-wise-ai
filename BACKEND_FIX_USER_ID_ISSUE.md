// แก้ไขปัญหา user id ไม่ต่อเนื่อง ใน ProfileController และ ProfileService

/*
=== ปัญหา ===
- User id ไม่ต่อเนื่องเมื่อมีการลบ user (เช่น ลบ id 20, สมัครใหม่ได้ id 21)
- Backend ยังใช้ user id จาก JWT token ซึ่งอาจไม่ตรงกับ id ปัจจุบัน
- ทำให้หาข้อมูล user ไม่เจอ: "JSON object requested, multiple (or no) rows returned"

=== วิธีแก้ไข ===
1. แก้ ProfileController ให้ใช้ email จาก JWT token แทน user id
2. แก้ ProfileService ให้หา user จาก email แทน id
3. เพิ่ม method ใหม่ที่ใช้ email เป็น key

=== ไฟล์ที่ต้องแก้ ===
1. /src/profile/profile.controller.ts
2. /src/profile/profile.service.ts
*/

// ===============================================
// 1. แก้ไข ProfileController.ts
// ===============================================

// เปลี่ยนจาก:
/*
@Get('users/profile')
@UseGuards(AuthGuard)
async getUserProfile(@Request() req: any): Promise<ApiResponse<any>> {
  try {
    const userId = req.user.id as string; // ❌ ใช้ id ตายตัว
    const profile = await this.profileService.getUserProfile(userId);
    ...
  }
}
*/

// เป็น:
/*
@Get('users/profile')
@UseGuards(AuthGuard)
async getUserProfile(@Request() req: any): Promise<ApiResponse<any>> {
  try {
    const email = req.user.email as string; // ✅ ใช้ email แทน
    console.log('👤 Getting profile for email:', email);
    const profile = await this.profileService.getUserProfileByEmail(email);
    
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
*/

// เปลี่ยน POST และ PUT methods ด้วย:
/*
@Post('users/profile')
@UseGuards(AuthGuard)
async createUserProfile(
  @Request() req: any,
  @Body() profileData: ProfileUpdateDto,
): Promise<ApiResponse<any>> {
  try {
    const email = req.user.email as string; // ✅ ใช้ email
    console.log('🆕 Creating profile for email:', email);
    
    const newProfile = await this.profileService.createUserProfileByEmail(
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

@Put('users/profile')
@UseGuards(AuthGuard)
async updateUserProfile(
  @Request() req: any,
  @Body() updateData: ProfileUpdateDto,
): Promise<ApiResponse<any>> {
  try {
    const email = req.user.email as string; // ✅ ใช้ email
    console.log('🔄 Updating profile for email:', email);
    
    const updatedProfile = await this.profileService.updateUserProfileByEmail(
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
*/

// ===============================================
// 2. แก้ไข ProfileService.ts
// ===============================================

// เพิ่ม methods ใหม่ที่ใช้ email:

/*
// ใช้ email หา user แทน userId
async getUserProfileByEmail(email: string): Promise<any> {
  try {
    console.log('🔍 Finding user by email:', email);
    
    // หา user จาก email ใน database โดยใช้ Supabase client โดยตรง
    const { data: users, error } = await this.supabaseService.client
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new NotFoundException(`User with email ${email} not found`);
    }

    if (!users) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    console.log('✅ Found user:', { id: users.id, email: users.email });
    return users;
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
*/

// ===============================================
// 3. ขั้นตอนการแก้ไข
// ===============================================

/*
1. แก้ไข /src/profile/profile.controller.ts:
   - เปลี่ยน const userId = req.user.id เป็น const email = req.user.email
   - เปลี่ยนการเรียก service methods ให้ใช้ ...ByEmail versions

2. แก้ไข /src/profile/profile.service.ts:
   - เพิ่ม getUserProfileByEmail()
   - เพิ่ม createUserProfileByEmail()
   - เพิ่ม updateUserProfileByEmail()

3. เทสต์ระบบ:
   - ลบ localStorage ใน browser
   - ล็อกอินใหม่
   - ทำ onboarding ใหม่
   - ตรวจสอบว่าข้อมูลเข้าฐานข้อมูล

ข้อดี:
✅ แก้ปัญหา user id ไม่ต่อเนื่อง
✅ ใช้ email เป็น unique key (email ไม่เปลี่ยน)
✅ ปลอดภัยกว่า (ใช้ข้อมูลจาก JWT token)
✅ สามารถหา user ได้แม้ id เปลี่ยน
*/
