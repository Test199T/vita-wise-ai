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
      console.log('🚫 ProtectedRoute: ผู้ใช้ไม่ได้เข้าสู่ระบบ - เปลี่ยนไปยังหน้า login');
      
      // ใช้ navigate แทน tokenUtils.logout() เพื่อป้องกันการเด้งออกจากระบบโดยไม่จำเป็น
      navigate('/login');
      return;
    }

    // ตรวจสอบ token ทุก 60 วินาที (เพิ่มจาก 30 วินาที) เพื่อลดการตรวจสอบที่เข้มงวด
    const interval = setInterval(() => {
      if (!tokenUtils.isLoggedIn()) {
        console.log('🚫 ProtectedRoute: Token หมดอายุหรือไม่ถูกต้อง - ออกจากระบบ');
        tokenUtils.logout();
      }
    }, 60000); // เปลี่ยนเป็น 60 วินาที

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
