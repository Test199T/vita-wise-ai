import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Token management utilities
export const tokenUtils = {
  // ตรวจสอบว่า token มีอยู่และมีรูปแบบถูกต้อง
  isValidToken: (token: string | null): boolean => {
    if (!token || typeof token !== 'string') return false;
    if (token.trim() === '') return false;
    
    // JWT token ต้องมี 3 ส่วนคั่นด้วย . (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // แต่ละส่วนต้องไม่เป็นค่าว่าง
    if (parts.some(part => part.trim() === '')) return false;
    
    return true;
  },

  // รับ token จาก localStorage
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // ตรวจสอบและรับ token ที่ถูกต้อง
  getValidToken: (): string | null => {
    const token = localStorage.getItem('token');
    if (tokenUtils.isValidToken(token)) {
      return token;
    }
    return null;
  },

  // บันทึก token
  setToken: (token: string): boolean => {
    try {
      if (!tokenUtils.isValidToken(token)) {
        console.error('Attempting to store invalid token:', token);
        return false;
      }
      
      localStorage.setItem('token', token);
      
      // ตรวจสอบว่า token ถูกบันทึกหรือไม่
      const storedToken = localStorage.getItem('token');
      if (storedToken !== token) {
        console.error('Token storage verification failed');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error storing token:', error);
      return false;
    }
  },

  // ลบ token
  removeToken: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // ตรวจสอบสถานะการล็อกอิน
  isLoggedIn: (): boolean => {
    const token = tokenUtils.getToken();
    if (!tokenUtils.isValidToken(token)) {
      return false;
    }

    // ตรวจสอบว่า token ไม่ได้หมดอายุ (ถ้ามีข้อมูล expiration)
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (tokenData.exp && tokenData.exp < currentTime) {
        // Token หมดอายุแล้ว
        tokenUtils.removeToken();
        return false;
      }
    } catch (error) {
      // ถ้าไม่สามารถ decode token ได้ ให้ถือว่า invalid
      tokenUtils.removeToken();
      return false;
    }
    
    return true;
  },

  // ฟังก์ชัน logout ที่สมบูรณ์
  logout: (): void => {
    console.log('🔄 เริ่มกระบวนการออกจากระบบ...');
    
    // ล้างข้อมูลทั้งหมดใน localStorage
    const keysToRemove = [
      'token',
      'accessToken',
      'user',
      'onboardingData',
      'profileData',
      'chat_sessions',
      'food_logs',
      'exercise_logs',
      'sleep_logs',
      'water_logs',
      'health_goals',
      'notifications'
    ];
    
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`🗑️ ลบ ${key} จาก localStorage`);
      }
    });
    
    // ล้างข้อมูลทั้งหมดใน sessionStorage
    const sessionKeysToRemove = [
      'token',
      'accessToken',
      'user',
      'onboardingData',
      'profileData',
      'chat_sessions',
      'food_logs',
      'exercise_logs',
      'sleep_logs',
      'water_logs',
      'health_goals',
      'notifications'
    ];
    
    sessionKeysToRemove.forEach(key => {
      if (sessionStorage.getItem(key)) {
        sessionStorage.removeItem(key);
        console.log(`🗑️ ลบ ${key} จาก sessionStorage`);
      }
    });
    
    // ล้างข้อมูลใน memory (ถ้ามี)
    if (typeof window !== 'undefined') {
      // ล้าง event listeners ที่อาจเกี่ยวข้องกับ user data
      window.removeEventListener('storage', () => {});
      window.removeEventListener('beforeunload', () => {});
    }
    
    console.log('✅ ออกจากระบบเรียบร้อยแล้ว');
    
    // เปลี่ยน URL ไปยังหน้า login และป้องกันการย้อนกลับ
    if (typeof window !== 'undefined') {
      // ใช้ replaceState เพื่อไม่ให้สามารถย้อนกลับได้
      window.history.replaceState(null, '', '/login');
      
      // ล้างประวัติการนำทางทั้งหมด
      window.history.pushState(null, '', '/login');
      
      // เปลี่ยนไปยังหน้า login
      window.location.href = '/login';
    }
  },

  // ตรวจสอบและป้องกันการเข้าถึงหน้าที่ต้องล็อกอิน
  requireAuth: (): boolean => {
    if (!tokenUtils.isLoggedIn()) {
      console.log('🚫 ผู้ใช้ไม่ได้เข้าสู่ระบบ - เปลี่ยนไปยังหน้า login');
      tokenUtils.logout();
      return false;
    }
    return true;
  }
};
