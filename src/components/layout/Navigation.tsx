import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  Home,
  Heart,
  MessageCircle,
  User,
  PlusCircle,
  BarChart3,
  Target,
  Utensils,
  Dumbbell,
  Brain,
  ChevronDown,
  ChevronRight,
  Activity,
  Calendar,
  TrendingUp,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface NavItem {
  icon: any;
  label: string;
  path?: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { icon: Home, label: "หน้าหลัก", path: "/dashboard" },
  {
    icon: Target,
    label: "สุขภาพและการติดตาม",
    children: [
      { icon: Target, label: "เป้าหมายสุขภาพ", path: "/health-goals" },
      { icon: Dumbbell, label: "บันทึกออกกำลังกาย", path: "/exercise-log" },
      { icon: Utensils, label: "บันทึกอาหาร", path: "/food-log" },
    ]
  },
  {
    icon: Brain,
    label: "AI และการวิเคราะห์",
    children: [
      { icon: Brain, label: "AI Insights", path: "/ai-insights" },
      { icon: MessageCircle, label: "คุยกับ AI", path: "/chat" },
      { icon: BarChart3, label: "สถิติ", path: "/stats" },
    ]
  },
  { icon: User, label: "โปรไฟล์", path: "/profile" },
];

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (label: string) => {
    setOpenItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const isOpen = openItems.includes(item.label);
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <Collapsible
          key={item.label}
          open={isOpen}
          onOpenChange={() => toggleItem(item.label)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-between px-4 py-3 rounded-lg transition-all duration-300 ease-in-out",
                "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                "transform hover:scale-[1.02] active:scale-[0.98]",
                level > 0 && "ml-4"
              )}
            >
              <div className="flex items-center space-x-3">
                <item.icon className={cn(
                  "h-5 w-5 transition-transform duration-300",
                  isOpen && "rotate-12"
                )} />
                <span className="font-medium">{item.label}</span>
              </div>
              <div className="transition-all duration-300 ease-in-out">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 transform transition-transform duration-300" />
                ) : (
                  <ChevronRight className="h-4 w-4 transform transition-transform duration-300" />
                )}
              </div>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            "data-[state=open]:animate-collapsible-down",
            "data-[state=closed]:animate-collapsible-up"
          )}>
            <div className="space-y-1 mt-1 ml-2 border-l-2 border-muted/30 pl-2">
              {item.children?.map((child) => renderNavItem(child, level + 1))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <NavLink
        key={item.path}
        to={item.path!}
        className={({ isActive }) =>
          cn(
            "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out",
            "transform hover:scale-[1.02] active:scale-[0.98]",
            isActive
              ? "bg-gradient-primary text-primary-foreground shadow-health"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            level > 0 && "ml-4"
          )
        }
        onClick={(e) => {
          // Prevent the click from bubbling up and closing dropdowns
          e.stopPropagation();
        }}
      >
        <item.icon className="h-5 w-5" />
        <span className="font-medium">{item.label}</span>
      </NavLink>
    );
  };

  return (
    <nav className={cn("bg-card border-r border-border h-full", className)}>
      <div className="p-4">
        <div className="space-y-1">
          {navItems.map((item) => renderNavItem(item))}
        </div>
      </div>
    </nav>
  );
}