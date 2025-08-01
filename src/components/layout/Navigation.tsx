import { NavLink } from "react-router-dom";
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
  Settings,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "หน้าหลัก", path: "/dashboard" },
  { icon: PlusCircle, label: "บันทึกสุขภาพ", path: "/health-form" },
  { icon: Target, label: "เป้าหมายสุขภาพ", path: "/health-goals" },
  { icon: Dumbbell, label: "บันทึกออกกำลังกาย", path: "/exercise-log" },
  { icon: Utensils, label: "บันทึกอาหาร", path: "/food-log" },
  { icon: Brain, label: "AI Insights", path: "/ai-insights" },
  { icon: MessageCircle, label: "คุยกับ AI", path: "/chat" },
  { icon: BarChart3, label: "สถิติ", path: "/stats" },
  { icon: Settings, label: "การตั้งค่า", path: "/settings" },
  { icon: User, label: "โปรไฟล์", path: "/profile" },
];

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  return (
    <nav className={cn("bg-card border-r border-border h-full", className)}>
      <div className="p-4">
        <div className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gradient-primary text-primary-foreground shadow-health"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}