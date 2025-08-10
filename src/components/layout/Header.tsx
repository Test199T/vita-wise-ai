import { Bell, Activity, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, NavLink } from "react-router-dom";
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

// Simple in-memory user profile mock (replace with real auth state as needed)
const mockUser = {
  name: 'สมใจ ใสใจ',
  avatarUrl: '',
};

export function Header() {
  return (
    <header className="bg-card border-b border-border shadow-soft">
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
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" className="relative hover:bg-muted/50" asChild>
              <Link to="/notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-warning text-warning-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </Link>
            </Button>
            <Link to="/profile" className="flex items-center gap-2 hover:bg-muted/50 px-2 py-1 rounded-lg">
              {mockUser.avatarUrl ? (
                <img src={mockUser.avatarUrl} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  {mockUser.name.slice(0,1)}
                </div>
              )}
              <span className="hidden sm:block text-sm font-medium max-w-[140px] truncate">{mockUser.name}</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}