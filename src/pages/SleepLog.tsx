import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Moon, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface SleepLogItem {
  id: string;
  date: string;
  sleep_time: string;
  wake_time: string;
  sleep_quality: string;
  notes?: string;
}

export default function SleepLog() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [logs, setLogs] = useState<SleepLogItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('sleep_logs');
    if (raw) {
      try { setLogs(JSON.parse(raw)); } catch { setLogs([]); }
    } else {
      setLogs([]);
      localStorage.setItem('sleep_logs', JSON.stringify([]));
    }
  }, []);

  const saveLogs = (items: SleepLogItem[]) => {
    setLogs(items);
    localStorage.setItem('sleep_logs', JSON.stringify(items));
  };

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    sleep_time: "",
    wake_time: "",
    sleep_quality: "",
    notes: ""
  });

  const computeSleepQuality = (sleepTime: string, wakeTime: string): { quality: string; colorClass: string } => {
    if (!sleepTime || !wakeTime) return { quality: "", colorClass: "" };
    const [sH, sM] = sleepTime.split(":").map(Number);
    const [wH, wM] = wakeTime.split(":").map(Number);
    const start = sH * 60 + sM;
    const end = wH * 60 + wM;
    const minutes = end >= start ? end - start : (24 * 60 - start) + end; // handle overnight

    // thresholds (simple): <4h bad, 4-6h medium, 6-9h good, >9h medium
    if (minutes < 240) return { quality: "แย่", colorClass: "bg-red-500 text-white" };
    if (minutes < 360) return { quality: "ปานกลาง", colorClass: "bg-yellow-500 text-black" };
    if (minutes <= 540) return { quality: "ดี", colorClass: "bg-green-600 text-white" };
    if (minutes <= 600) return { quality: "ดี", colorClass: "bg-green-600 text-white" };
    return { quality: "ปานกลาง", colorClass: "bg-yellow-500 text-black" };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { quality } = computeSleepQuality(formData.sleep_time, formData.wake_time);
    if (editingId) {
      const next = logs.map(l => l.id === editingId ? {
        ...l,
        date: formData.date,
        sleep_time: formData.sleep_time,
        wake_time: formData.wake_time,
        sleep_quality: quality,
        notes: formData.notes,
      } : l);
      saveLogs(next);
      toast({ title: 'อัปเดตบันทึกแล้ว' });
    } else {
      const newLog: SleepLogItem = {
        id: crypto.randomUUID(),
        date: formData.date,
        sleep_time: formData.sleep_time,
        wake_time: formData.wake_time,
        sleep_quality: quality,
        notes: formData.notes,
      };
      saveLogs([newLog, ...logs]);
      toast({ title: "บันทึกสำเร็จ", description: "บันทึกการนอนเรียบร้อยแล้ว" });
    }
    setEditingId(null);
    setShowForm(false);
    setFormData({ date: new Date().toISOString().split('T')[0], sleep_time: "", wake_time: "", sleep_quality: "", notes: "" });
  };
  const startEdit = (l: SleepLogItem) => {
    setEditingId(l.id);
    setFormData({ date: l.date, sleep_time: l.sleep_time, wake_time: l.wake_time, sleep_quality: l.sleep_quality, notes: l.notes || '' });
    setShowForm(true);
  };

  const deleteLog = (l: SleepLogItem) => {
    saveLogs(logs.filter(x => x.id !== l.id));
    toast({ title: 'ลบรายการแล้ว' });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-primary">บันทึกการนอน</h1>
              <p className="text-muted-foreground">จดบันทึกเวลานอนและคุณภาพการนอน</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">เพิ่มบันทึก</Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>บันทึกการนอนใหม่</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">วันที่</Label>
                    <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sleep_time">เข้านอน</Label>
                    <Input id="sleep_time" type="time" value={formData.sleep_time} onChange={(e) => setFormData({ ...formData, sleep_time: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wake_time">ตื่นนอน</Label>
                    <Input id="wake_time" type="time" value={formData.wake_time} onChange={(e) => setFormData({ ...formData, wake_time: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>คุณภาพโดยอัตโนมัติ</Label>
                    {(() => {
                      const { quality } = computeSleepQuality(formData.sleep_time, formData.wake_time);
                      return <Input value={quality || ""} readOnly placeholder="ระบบจะคำนวณอัตโนมัติ" />;
                    })()}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">หมายเหตุ</Label>
                  <Textarea id="notes" placeholder="รายละเอียดเพิ่มเติม..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">บันทึก</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>ยกเลิก</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          <h2 className="text-xl font-semibold">ประวัติการนอน</h2>
          {logs.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg"><Moon className="h-5 w-5 text-primary" /></div>
                    <div>
                      <h3 className="font-semibold">{item.sleep_time} — {item.wake_time}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="h-4 w-4" />{new Date(item.date).toLocaleDateString('th-TH')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const mapColor = (q: string) => {
                        if (q === "แย่") return "bg-red-500 text-white";
                        if (q === "ปานกลาง") return "bg-yellow-500 text-black";
                        return "bg-green-600 text-white";
                      };
                      return <Badge className={mapColor(item.sleep_quality)}>{item.sleep_quality}</Badge>;
                    })()}
                    <Button variant="outline" size="sm" onClick={() => startEdit(item)}>แก้ไข</Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">ลบ</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                          <AlertDialogDescription>ต้องการลบรายการนี้หรือไม่?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteLog(item)}>ลบ</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                {item.notes && (
                  <div className="mt-3 p-2 bg-muted rounded-md text-sm text-muted-foreground">{item.notes}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
