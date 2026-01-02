// เพิ่มใน App.tsx หรือ component ใดๆ เพื่อ debug token

import { useEffect } from 'react';
import { tokenUtils } from '@/lib/utils';

// เพิ่ม component นี้เพื่อแสดง token info
export const TokenDebugger = () => {
  useEffect(() => {
    // Debug token information
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('🔑 Current Token:', token);
    console.log('👤 Current User:', user ? JSON.parse(user) : null);
    
    if (token) {
      // Decode JWT token (ส่วน payload)
      try {
        const base64Payload = token.split('.')[1];
        const payload = JSON.parse(atob(base64Payload));
        console.log('📋 Token Payload:', payload);
        console.log('📧 Email from token:', payload.email);
        console.log('🆔 User ID from token:', payload.id || payload.sub);
        console.log('⏰ Token expires:', new Date(payload.exp * 1000));
      } catch (error) {
        console.error('❌ Error decoding token:', error);
      }
    }

    // เช็คว่า token ยังใช้ได้หรือไม่
    const currentToken = tokenUtils.getToken();
    const isValid = tokenUtils.isValidToken(currentToken);
    console.log('✅ Token valid:', isValid);
    
  }, []);

  return null;
};
