import { useState } from "react";
import { Header } from "./Header";
import { Navigation } from "./Navigation";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
  hideSidebar?: boolean;
}

export function MainLayout({ children, hideSidebar }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} showMenu />
      {!hideSidebar && (
        <>
          {/* Fixed Sidebar for Desktop */}
          <div className="hidden md:block">
            <div className="fixed left-0 top-0 h-screen w-64 z-30 bg-card border-r border-border">
              <Navigation />
            </div>
          </div>
          {/* Mobile Sidebar */}
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:hidden",
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <Navigation className="h-full" />
          </div>
          {/* Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </>
      )}
      {/* Main Content */}
      <main className={cn("flex-1 min-h-[calc(100vh-73px)]", !hideSidebar && "md:ml-64")}>
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}