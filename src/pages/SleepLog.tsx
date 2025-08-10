import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Moon, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [logs] = useState<SleepLogItem[]>([
    {
      id: "1",
      date: "2024-01-05",
      sleep_time: "22:45",
      wake_time: "06:30",
      sleep_quality: "ดี",
      notes: "ตื่นมาสดชื่น"
    }
  ]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    sleep_time: "",
    wake_time: "",
    sleep_quality: "",
    notes: ""
  });

  const qualities = ["แย่", "ปานกลาง", "ดี", "ดีมาก"]; 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "บันทึกสำเร็จ", description: "บันทึกการนอนเรียบร้อยแล้ว" });
    setShowForm(false);
    setFormData({ date: new Date().toISOString().split('T')[0], sleep_time: "", wake_time: "", sleep_quality: "", notes: "" });
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
                    <Label htmlFor="sleep_quality">คุณภาพการนอน</Label>
                    <Select value={formData.sleep_quality} onValueChange={(value) => setFormData({ ...formData, sleep_quality: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกคุณภาพ" />
                      </SelectTrigger>
                      <SelectContent>
                        {qualities.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                      </SelectContent>
                    </Select>
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
                  <Badge>{item.sleep_quality}</Badge>
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
