import { useState } from "react";
import { Activity, ChevronDown, MessageCircle, User, Settings, LogOut, Menu, X } from "lucide-react";
import { NotificationBellIcon } from "@/components/ui/notification-bell-icon";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useProfilePicture } from "@/hooks/useProfilePicture";
import { useProfile } from "@/hooks/useProfile";
import { tokenUtils, cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

type NavItem =
  | { title: string; href: string }
  | { title: string; children: { title: string; href: string }[] };

const topNav: NavItem[] = [
  { title: "แดชบอร์ด", href: "/dashboard" },
  {
    title: "สุขภาพและการติดตาม",
    children: [
      { title: "บันทึกอาหาร", href: "/food-log" },
      { title: "บันทึกการออกกำลังกาย", href: "/exercise-log" },
      { title: "เป้าหมายสุขภาพ", href: "/health-goals" },
      { title: "บันทึกการนอน", href: "/sleep-log" },
      { title: "บันทึกน้ำดื่ม", href: "/water-log" },
    ],
  },
  {
    title: "AI และการวิเคราะห์",
    children: [
      { title: "AI Insights", href: "/ai-insights" },
      { title: "คุยกับ AI", href: "/chat" },
    ],
  },
];

export function Header() {
  const { profilePicture } = useProfilePicture();
  const { profile, loading, isLoggedIn } = useProfile();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper for active styling
  const isActive = (path: string) => location.pathname === path;

  // Glassmorphism Active Style
  const activeClass = "bg-primary/15 text-primary backdrop-blur-md border border-primary/20 shadow-sm font-medium relative overflow-hidden";
  const inactiveClass = "text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-transparent";

  const getNavItemClass = (path: string, isMobile = false) => {
    // Basic class structure
    const base = cn(
      "transition-all duration-300 ease-in-out",
      isMobile ? "w-full justify-start gap-3 px-4 py-2.5 h-auto text-sm" : "px-3"
    );

    // Standard Active/Inactive
    if (isActive(path)) {
      return cn(base, activeClass);
    }

    // Default Inactive
    return cn(base, inactiveClass);
  };

  // Check if any child in a dropdown is active
  const isDropdownActive = (children: { href: string }[]) =>
    children.some(c => isActive(c.href));

  // ถ้าผู้ใช้ไม่ได้เข้าสู่ระบบ ให้แสดงเฉพาะโลโก้และปุ่มเข้าสู่ระบบ
  if (!isLoggedIn) {
    return (
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border shadow-soft">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="bg-gradient-primary p-2 rounded-lg">
                  <Activity className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-semibold text-foreground">
                  สุขภาพดี AI
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link to="/login">เข้าสู่ระบบ</Link>
              </Button>
              <Button asChild>
                <Link to="/register">สมัครสมาชิก</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Get user name from profile data or use fallback
  const userName = profile ? `${profile.first_name} ${profile.last_name}` : 'ผู้ใช้';
  const userInitial = userName.charAt(0);

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border shadow-soft">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <Activity className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">
                สุขภาพดี AI
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {topNav.map((item) => {
                if ("href" in item) {
                  return (
                    <Button key={item.title} asChild variant="ghost" className={getNavItemClass(item.href)}>
                      <Link to={item.href}>
                        {item.title}
                      </Link>
                    </Button>
                  );
                }
                // Dropdown handling
                const isParentActive = isDropdownActive(item.children);
                return (
                  <DropdownMenu key={item.title}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className={cn("px-3 gap-1", isParentActive ? "text-primary bg-primary/5" : "")}>
                        {item.title}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {item.children.map((c) => (
                        <DropdownMenuItem key={c.title} asChild className={isActive(c.href) ? "bg-primary/10 text-primary" : ""}>
                          <Link to={c.href}>{c.title}</Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              })}
              {/* Chat with AI – Animated Godly Style */}
              <Button asChild variant="ghost" className="group relative overflow-hidden rounded-full px-4 py-2 ml-1 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] animate-[gradient_3s_linear_infinite] text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_25px_rgba(168,85,247,0.7)] hover:scale-105 transition-all duration-300 border-0">
                <Link to="/chat" className="flex items-center gap-2">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                  <MessageCircle className="h-4 w-4 relative z-10" />
                  <span className="hidden lg:inline font-medium relative z-10">คุยกับ AI</span>
                </Link>
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="เปิดเมนู"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="bg-gradient-primary p-1.5 rounded-lg">
                      <Activity className="h-5 w-5 text-primary-foreground" />
                    </div>
                    สุขภาพดี AI
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col py-4 overflow-y-auto max-h-[calc(100vh-80px)]">
                  {/* Main Navigation */}
                  <div className="px-2 space-y-1">
                    <Button
                      asChild
                      variant="ghost"
                      className={getNavItemClass('/dashboard', true)}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link to="/dashboard">แดชบอร์ด</Link>
                    </Button>
                  </div>

                  <Separator className="my-3" />

                  {/* สุขภาพและการติดตาม */}
                  <div className="px-4 py-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      สุขภาพและการติดตาม
                    </p>
                  </div>
                  <div className="px-2 space-y-1">
                    <Button
                      asChild
                      variant="ghost"
                      className={getNavItemClass('/food-log', true)}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link to="/food-log">บันทึกอาหาร</Link>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      className={getNavItemClass('/exercise-log', true)}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link to="/exercise-log">บันทึกการออกกำลังกาย</Link>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      className={getNavItemClass('/health-goals', true)}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link to="/health-goals">เป้าหมายสุขภาพ</Link>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      className={getNavItemClass('/sleep-log', true)}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link to="/sleep-log">บันทึกการนอน</Link>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      className={getNavItemClass('/water-log', true)}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link to="/water-log">บันทึกน้ำดื่ม</Link>
                    </Button>
                  </div>

                  <Separator className="my-3" />

                  {/* AI และการวิเคราะห์ */}
                  <div className="px-4 py-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      AI และการวิเคราะห์
                    </p>
                  </div>
                  <div className="px-2 space-y-1">
                    <Button
                      asChild
                      variant="ghost"
                      className={getNavItemClass('/ai-insights', true)}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link to="/ai-insights">AI Insights</Link>
                    </Button>
                    {/* Chat with AI – Animated Godly Style */}
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full justify-start gap-2 px-4 py-2.5 h-auto bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] animate-[gradient_3s_linear_infinite] text-white shadow-md border-0 relative overflow-hidden"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link to="/chat">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                        <MessageCircle className="h-4 w-4 relative z-10" />
                        <span className="relative z-10">คุยกับ AI</span>
                      </Link>
                    </Button>
                  </div>

                  <Separator className="my-3" />

                  {/* Profile & Logout */}
                  <div className="px-2 space-y-1">
                    <Button
                      asChild
                      variant="ghost"
                      className={getNavItemClass('/profile', true)}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link to="/profile">
                        <User className="h-4 w-4" />
                        โปรไฟล์
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 px-4 py-2 h-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        tokenUtils.logout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      ออกจากระบบ
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" className="relative text-slate-600 hover:text-slate-900 hover:bg-transparent transition-colors" asChild>
              <Link to="/notifications">
                <NotificationBellIcon className="h-5 w-5" size={20} />
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-transparent px-2 py-1 rounded-lg">
                  {profilePicture ? (
                    <img src={profilePicture} alt="avatar" className="w-7 h-7 rounded-full object-cover border-2 border-border" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                      {userInitial}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium max-w-[140px] truncate">
                    {loading ? 'กำลังโหลด...' : userName}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    โปรไฟล์
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => tokenUtils.logout()}
                  className="flex items-center gap-2 text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  ออกจากระบบ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}