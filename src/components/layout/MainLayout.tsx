import { useState } from "react";
import { Header } from "./Header";
import { Navigation } from "./Navigation";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

interface MainLayoutProps {
  children: React.ReactNode;
  hideSidebar?: boolean;
}

export function MainLayout({ children, hideSidebar }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const location = useLocation();
  const isChatPage = location.pathname.endsWith("/chat");

  // Keep sidebar open when navigating (don't auto-close)
  const handleMenuClick = () => {
    if (sidebarOpen) {
      // Start closing animation
      setIsClosing(true);
      setTimeout(() => {
        setSidebarOpen(false);
        setIsClosing(false);
      }, 300); // Match the transition duration
    } else {
      setSidebarOpen(true);
    }
  };

  const handleCloseSidebar = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSidebarOpen(false);
      setIsClosing(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with hamburger menu */}
      <Header onMenuClick={handleMenuClick} showMenu={true} />
      
      {!hideSidebar && (
        <>
          {/* Mobile/Tablet Sidebar - Hidden by default */}
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-64 transform transition-all duration-300 ease-in-out",
              "bg-card border-r border-border shadow-lg",
              sidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0",
              isClosing && "translate-x-0 opacity-0"
            )}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">เมนู</h2>
              <button
                onClick={handleCloseSidebar}
                className="p-2 hover:bg-muted rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Navigation className="h-[calc(100vh-80px)]" />
          </div>
          
          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className={cn(
                "fixed inset-0 bg-black transition-opacity duration-300 ease-in-out",
                isClosing ? "opacity-0" : "opacity-50"
              )}
              onClick={handleCloseSidebar}
            />
          )}
        </>
      )}
      
      {/* Main Content - Full width */}
      <main className="flex-1 min-h-[calc(100vh-73px)]">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}