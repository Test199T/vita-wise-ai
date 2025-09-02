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
  }
};
