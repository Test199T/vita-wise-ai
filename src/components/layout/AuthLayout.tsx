import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Activity } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header with logo only */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border shadow-soft">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <Activity className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">
                สุขภาพดี AI
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content - Full width without sidebar */}
      <main className="flex-1 min-h-[calc(100vh-73px)]">
        {children}
      </main>
    </div>
  );
}
