import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
// Replace Lucide types with generic icon via Iconify web component

interface HealthCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: string; // iconify icon name, e.g. "lucide:moon"
  trend?: "up" | "down" | "stable";
  color?: "primary" | "secondary" | "accent" | "warning";
  className?: string;
}

export function HealthCard({
  title,
  value,
  description,
  icon,
  trend = "stable",
  color = "primary",
  className,
}: HealthCardProps) {
  const colorClasses = {
    primary: "text-primary bg-primary-light",
    secondary: "text-secondary bg-secondary-light",
    accent: "text-accent bg-accent/10",
    warning: "text-warning bg-warning/10",
  };

  const trendClasses = {
    up: "text-accent",
    down: "text-destructive",
    stable: "text-muted-foreground",
  };

  return (
    <Card className={cn("health-stat-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-full", colorClasses[color])}>
          {icon ? (
            // eslint-disable-next-line react/no-unknown-property
            <iconify-icon icon={icon} width="16" height="16"></iconify-icon>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <CardDescription className={cn("text-xs mt-1", trendClasses[trend])}>
            {description}
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );
}