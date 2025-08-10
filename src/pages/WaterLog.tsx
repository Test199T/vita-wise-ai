import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Droplets, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [logs] = useState<WaterLogItem[]>([
    { id: "1", date: "2024-01-05", time: "09:30", amount_ml: 350, notes: "หลังอาหารเช้า" },
    { id: "2", date: "2024-01-05", time: "13:00", amount_ml: 500 },
  ]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: "",
    amount_ml: "",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "บันทึกสำเร็จ", description: "บันทึกน้ำดื่มเรียบร้อยแล้ว" });
    setShowForm(false);
    setFormData({ date: new Date().toISOString().split('T')[0], time: "", amount_ml: "", notes: "" });
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
