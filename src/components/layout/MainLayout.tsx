import { useState, useEffect } from "react";
import { Header } from "./Header";
import { tokenUtils } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";

interface MainLayoutProps {
  children: React.ReactNode;
  hideSidebar?: boolean;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isLoggedIn } = useProfile();

  useEffect(() => {
    // ตรวจสอบสถานะการล็อกอินทุกครั้งที่ component mount
    if (!isLoggedIn) {
      console.log('🚫 MainLayout: ผู้ใช้ไม่ได้เข้าสู่ระบบ - เปลี่ยนไปยังหน้า login');
      tokenUtils.logout();
      return;
    }

    // ตรวจสอบ token ทุก 30 วินาที
    const interval = setInterval(() => {
      if (!tokenUtils.isLoggedIn()) {
        console.log('🚫 MainLayout: Token หมดอายุหรือไม่ถูกต้อง - ออกจากระบบ');
        tokenUtils.logout();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isLoggedIn]);

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
      <main className="flex-1 min-h-[calc(100vh-73px)]">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}