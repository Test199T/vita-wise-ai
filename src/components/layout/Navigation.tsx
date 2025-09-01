import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Home,
  User,
  Utensils,
  Dumbbell,
  Target,
  MessageCircle,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Activity,
  Calendar,
  TrendingUp,
  Settings,
  Moon,
  Droplets,
  Bug
} from "lucide-react";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: "แดชบอร์ด",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "สุขภาพและการติดตาม",
    icon: Activity,
    children: [
      {
        title: "บันทึกอาหาร",
        href: "/food-log",
        icon: Utensils,
      },
      {
        title: "บันทึกการออกกำลังกาย",
        href: "/exercise-log",
        icon: Dumbbell,
      },
      {
        title: "เป้าหมายสุขภาพ",
        href: "/health-goals",
        icon: Target,
      },
      {
        title: "บันทึกการนอน",
        href: "/sleep-log",
        icon: Moon,
      },
      {
        title: "บันทึกน้ำดื่ม",
        href: "/water-log",
        icon: Droplets,
      },
    ],
  },
  {
    title: "AI และการวิเคราะห์",
    icon: BarChart3,
    children: [
      {
        title: "AI Insights",
        href: "/ai-insights",
        icon: TrendingUp,
      },
      {
        title: "คุยกับ AI",
        href: "/chat",
        icon: MessageCircle,
      },
    ],
  },
  {
    title: "โปรไฟล์",
    href: "/profile",
    icon: User,
  },
  {
    title: "Debug & Troubleshooting",
    href: "/debug",
    icon: Bug,
  },
];

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (title: string) => {
    setOpenItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const renderNavItem = (item: NavItem) => {
    const isOpen = openItems.includes(item.title);
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <Collapsible key={item.title} open={isOpen} onOpenChange={() => toggleItem(item.title)}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-between transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]",
                "hover:bg-muted/50 rounded-lg p-3"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 transition-transform duration-300 ease-in-out" />
                <span className="font-medium">{item.title}</span>
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 transition-all duration-300 ease-in-out",
                isOpen ? "rotate-180" : "rotate-0"
              )} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-2 ml-2 border-l-2 border-muted/30 pl-2">
            {item.children?.map((child) => (
              <NavLink
                key={child.title}
                to={child.href || "#"}
                onClick={(e) => e.stopPropagation()}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]",
                    "hover:bg-muted/50 text-sm",
                    isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
                  )
                }
              >
                <child.icon className="h-4 w-4" />
                {child.title}
              </NavLink>
            ))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <NavLink
        key={item.title}
        to={item.href || "#"}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]",
            "hover:bg-muted/50 font-medium",
            isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
          )
        }
      >
        <item.icon className="h-5 w-5" />
        {item.title}
      </NavLink>
    );
  };

  return (
    <nav className={cn("space-y-2", className)}>
      {navItems.map(renderNavItem)}
    </nav>
  );
}