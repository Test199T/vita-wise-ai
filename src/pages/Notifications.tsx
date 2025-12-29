import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  CalendarClock,
} from "lucide-react";
import { NotificationBellIcon } from "@/components/ui/notification-bell-icon";

type NotificationType = "info" | "warning" | "success" | "reminder";

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description?: string;
  created_at: string; // ISO
  read?: boolean;
}

const STORAGE_KEY = "app_notifications";

function loadNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Seed with sample notifications
  const seed: NotificationItem[] = [
    {
      id: crypto.randomUUID(),
      type: "reminder",
      title: "ถึงเวลาดื่มน้ำ",
      description: "ดื่มน้ำ 300 มล. เพื่อให้ถึงเป้าหมายประจำวัน",
      created_at: new Date().toISOString(),
      read: false,
    },
    {
      id: crypto.randomUUID(),
      type: "info",
      title: "อัปเดต AI Insights",
      description: "มีคำแนะนำใหม่เกี่ยวกับการนอนของคุณ",
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      read: false,
    },
    {
      id: crypto.randomUUID(),
      type: "warning",
      title: "โซเดียมวันนี้ใกล้ถึงลิมิต",
      description: "แนะนำหลีกเลี่ยงอาหารแปรรูปในมื้อถัดไป",
      created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      read: false,
    },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

function saveNotifications(items: NotificationItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function getTypeMeta(type: NotificationType) {
  switch (type) {
    case "success":
      return { label: "สำเร็จ", color: "bg-green-100 text-green-800", Icon: CheckCircle2 };
    case "warning":
      return { label: "แจ้งเตือน", color: "bg-yellow-100 text-yellow-800", Icon: AlertTriangle };
    case "reminder":
      return { label: "เตือนความจำ", color: "bg-blue-100 text-blue-800", Icon: NotificationBellIcon };
    default:
      return { label: "ข้อมูล", color: "bg-gray-100 text-gray-800", Icon: Info };
  }
}

export default function Notifications() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    setNotifications(loadNotifications());
  }, []);

  const hasItems = notifications.length > 0;

  const removeOne = (id: string) => {
    const next = notifications.filter((n) => n.id !== id);
    setNotifications(next);
    saveNotifications(next);
    toast({ title: "ลบแจ้งเตือนแล้ว" });
  };

  const clearAll = () => {
    setNotifications([]);
    saveNotifications([]);
    toast({ title: "ลบแจ้งเตือนทั้งหมดแล้ว" });
  };

  const sorted = useMemo(
    () => [...notifications].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [notifications]
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <NotificationBellIcon className="h-5 w-5" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">ศูนย์แจ้งเตือน</h1>
              <p className="text-muted-foreground">ดูและจัดการการแจ้งเตือนของคุณ</p>
            </div>
          </div>
          <div className="flex gap-2">
            {hasItems && (
              <Button variant="outline" onClick={clearAll} className="gap-2">
                <Trash2 className="h-4 w-4" />
                ลบทั้งหมด
              </Button>
            )}
          </div>
        </div>

        <Card className="health-stat-card">
          <CardHeader>
            <CardTitle className="text-lg">รายการแจ้งเตือน</CardTitle>
            <CardDescription>
              {hasItems ? `${sorted.length} รายการ` : "ยังไม่มีแจ้งเตือน"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {hasItems ? (
              <div className="divide-y divide-muted/50">
                {sorted.map((n) => {
                  const meta = getTypeMeta(n.type);
                  const TypeIcon = meta.Icon;
                  return (
                    <div key={n.id} className="py-3 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <TypeIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium leading-tight">{n.title}</h4>
                            <Badge className={meta.color}>{meta.label}</Badge>
                          </div>
                          {n.description && (
                            <p className="text-sm text-muted-foreground mt-1">{n.description}</p>
                          )}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <CalendarClock className="h-3.5 w-3.5" />
                            {new Date(n.created_at).toLocaleString("th-TH")}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => removeOne(n.id)} className="gap-1 text-destructive">
                          <Trash2 className="h-4 w-4" />
                          ลบ
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-muted-foreground p-8">
                <NotificationBellIcon className="h-10 w-10 mx-auto mb-2 opacity-60" size={40} />
                <div>ยังไม่มีแจ้งเตือน</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}


