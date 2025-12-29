import { Activity, ChevronDown, MessageCircle, User, Settings, LogOut } from "lucide-react";
import { NotificationBellIcon } from "@/components/ui/notification-bell-icon";
import { Button } from "@/components/ui/button";
import { Link, NavLink } from "react-router-dom";
import { useProfilePicture } from "@/hooks/useProfilePicture";
import { useProfile } from "@/hooks/useProfile";
import { tokenUtils } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
                    <Button key={item.title} asChild variant="ghost" className="px-3">
                      <NavLink to={item.href} className={({ isActive }) => isActive ? "text-primary" : "text-foreground"}>
                        {item.title}
                      </NavLink>
                    </Button>
                  );
                }
                return (
                  <DropdownMenu key={item.title}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="px-3 gap-1">
                        {item.title}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {item.children.map((c) => (
                        <DropdownMenuItem key={c.title} asChild>
                          <Link to={c.href}>{c.title}</Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              })}
              {/* Chat with AI – placed next to the nav, right after "AI และการวิเคราะห์" */}
              <Button asChild className="group relative overflow-visible rounded-full px-3 sm:px-4 py-1.5 sm:py-2 ml-1 bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all">
                <Link to="/chat" className="flex items-center gap-2">
                  <span className="pointer-events-none absolute -inset-1 rounded-full bg-sky-400/40 blur-md opacity-60 group-hover:opacity-80" />
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden lg:inline font-medium">คุยกับ AI</span>
                </Link>
              </Button>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" className="relative hover:bg-muted/50" asChild>
              <Link to="/notifications">
                <NotificationBellIcon className="h-5 w-5" size={20} />
                <span className="absolute -top-1 -right-1 bg-warning text-warning-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-muted/50 px-2 py-1 rounded-lg">
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