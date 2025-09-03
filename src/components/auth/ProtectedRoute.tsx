import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenUtils } from '@/lib/utils';
import { useProfile } from '@/hooks/useProfile';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useProfile();

  useEffect(() => {
    // ตรวจสอบสถานะการล็อกอินทุกครั้งที่ component mount
    if (!isLoggedIn) {
      console.log('🚫 ผู้ใช้ไม่ได้เข้าสู่ระบบ - เปลี่ยนไปยังหน้า login');
      
      // ล้างข้อมูลทั้งหมดและเปลี่ยนไปยังหน้า login
      tokenUtils.logout();
      return;
    }

    // ตรวจสอบ token ทุก 30 วินาที
    const interval = setInterval(() => {
      if (!tokenUtils.isLoggedIn()) {
        console.log('🚫 Token หมดอายุหรือไม่ถูกต้อง - ออกจากระบบ');
        tokenUtils.logout();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isLoggedIn, navigate]);

  // ถ้าไม่ได้ล็อกอิน ให้แสดง loading หรือ redirect
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังตรวจสอบสถานะการล็อกอิน...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
