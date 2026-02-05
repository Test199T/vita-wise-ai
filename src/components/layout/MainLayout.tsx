import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { tokenUtils } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";

interface MainLayoutProps {
  children: React.ReactNode;
  hideSidebar?: boolean;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isLoggedIn } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    // ตรวจสอบสถานะการล็อกอินทุกครั้งที่ component mount
    if (!isLoggedIn) {
      console.log('🚫 MainLayout: ผู้ใช้ไม่ได้เข้าสู่ระบบ - เปลี่ยนไปยังหน้า login');
      navigate('/login');
      return;
    }

    // ตรวจสอบ token ทุก 60 วินาที (เพิ่มจาก 30 วินาที) เพื่อลดการตรวจสอบที่เข้มงวด
    const interval = setInterval(() => {
      if (!tokenUtils.isLoggedIn()) {
        console.log('🚫 MainLayout: Token หมดอายุหรือไม่ถูกต้อง - ออกจากระบบ');
        tokenUtils.logout();
      }
    }, 60000); // เปลี่ยนเป็น 60 วินาที

    return () => clearInterval(interval);
  }, [isLoggedIn, navigate]);

  // ถ้าไม่ได้ล็อกอิน ให้แสดง loading
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header with top navigation */}
      <Header />

      {/* Main Content - Full width */}
      <main className="flex-1 min-h-[calc(100vh-73px)] pt-24">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
