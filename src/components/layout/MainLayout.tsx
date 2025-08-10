import { useState } from "react";
import { Header } from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
  hideSidebar?: boolean;
}

export function MainLayout({ children }: MainLayoutProps) {

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