import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Droplets, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface WaterLogItem {
  id: string;
  date: string;
  time: string;
  amount_ml: number;
  notes?: string;
}

export default function WaterLog() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [logs, setLogs] = useState<WaterLogItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('water_logs');
    if (raw) {
      try { setLogs(JSON.parse(raw)); } catch { setLogs([]); }
    } else {
      setLogs([]);
      localStorage.setItem('water_logs', JSON.stringify([]));
    }
  }, []);

  const saveLogs = (items: WaterLogItem[]) => {
    setLogs(items);
    localStorage.setItem('water_logs', JSON.stringify(items));
  };

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: "",
    amount_ml: "",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const next = logs.map(l => l.id === editingId ? {
        ...l,
        date: formData.date,
        time: formData.time,
        amount_ml: Number(formData.amount_ml||0),
        notes: formData.notes,
      } : l);
      saveLogs(next);
      toast({ title: 'อัปเดตบันทึกแล้ว' });
    } else {
      const newLog: WaterLogItem = {
        id: crypto.randomUUID(),
        date: formData.date,
        time: formData.time,
        amount_ml: Number(formData.amount_ml||0),
        notes: formData.notes,
      };
      saveLogs([newLog, ...logs]);
      toast({ title: "บันทึกสำเร็จ", description: "บันทึกน้ำดื่มเรียบร้อยแล้ว" });
    }
    setEditingId(null);
    setShowForm(false);
    setFormData({ date: new Date().toISOString().split('T')[0], time: "", amount_ml: "", notes: "" });
  };
  const startEdit = (l: WaterLogItem) => {
    setEditingId(l.id);
    setFormData({ date: l.date, time: l.time, amount_ml: String(l.amount_ml||''), notes: l.notes || '' });
    setShowForm(true);
  };

  const deleteLog = (l: WaterLogItem) => {
    saveLogs(logs.filter(x => x.id !== l.id));
    toast({ title: 'ลบรายการแล้ว' });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Droplets className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-primary">บันทึกน้ำดื่ม</h1>
              <p className="text-muted-foreground">ติดตามปริมาณน้ำที่ดื่มในแต่ละวัน</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">เพิ่มบันทึก</Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>บันทึกน้ำดื่มใหม่</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">วันที่</Label>
                    <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">เวลา</Label>
                    <Input id="time" type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount_ml">ปริมาณ (มล.)</Label>
                    <Input id="amount_ml" type="number" placeholder="250" value={formData.amount_ml} onChange={(e) => setFormData({ ...formData, amount_ml: e.target.value })} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">หมายเหตุ</Label>
                  <Textarea id="notes" placeholder="หลังออกกำลังกาย ระหว่างทำงาน..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
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
          <h2 className="text-xl font-semibold">ประวัติน้ำดื่ม</h2>
          {logs.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg"><Droplets className="h-5 w-5 text-primary" /></div>
                    <div>
                      <h3 className="font-semibold">{item.amount_ml} มล.</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="h-4 w-4" />{new Date(item.date).toLocaleDateString('th-TH')} • <Clock className="h-4 w-4" />{item.time}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
