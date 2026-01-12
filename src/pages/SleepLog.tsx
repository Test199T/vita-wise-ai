import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Moon, Calendar, Clock, RefreshCw, Pencil, Trash2, Plus, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { envConfig } from "@/config/env";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ฟังก์ชันสำหรับดึงข้อมูลจาก API
  const fetchSleepLogs = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่พบ JWT Token กรุณาเข้าสู่ระบบก่อน',
          variant: 'destructive'
        });
        return;
      }

      const response = await fetch(`${envConfig.apiBaseUrl}${envConfig.sleepLogEndpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();

        // ตรวจสอบโครงสร้างข้อมูลจาก API
        let sleepLogs: any[] = [];

        // ตรวจสอบทุกความเป็นไปได้
        if (Array.isArray(data)) {
          sleepLogs = data;
        } else if (data && data.data) {

          if (Array.isArray(data.data)) {
            sleepLogs = data.data;
          } else if (data.data && Array.isArray(data.data.sleep_logs)) {
            sleepLogs = data.data.sleep_logs;
          } else if (data.data && Array.isArray(data.data.records)) {
            sleepLogs = data.data.records;
          } else if (data.data && Array.isArray(data.data.items)) {
            sleepLogs = data.data.items;
          } else {
            // ลองหาคีย์ที่มี array ใน data.data
            for (const key of Object.keys(data.data)) {
              if (Array.isArray(data.data[key])) {
                sleepLogs = data.data[key];
                break;
              }
            }
          }
        } else if (data && Array.isArray(data.sleepLogs)) {
          sleepLogs = data.sleepLogs;
        } else if (data && data.results && Array.isArray(data.results)) {
          sleepLogs = data.results;
        } else if (data && data.sleep_logs && Array.isArray(data.sleep_logs)) {
          sleepLogs = data.sleep_logs;
        } else {
          // ลองดูว่ามีข้อมูลในรูปแบบอื่นหรือไม่
          if (data && typeof data === 'object') {
            // ลองหาคีย์ที่มี array
            for (const key of Object.keys(data)) {
              if (Array.isArray(data[key])) {
                sleepLogs = data[key];
                break;
              }
            }
          }
        }


        // ตรวจสอบว่า sleepLogs เป็น array และมีข้อมูล
        if (!Array.isArray(sleepLogs)) {
          console.error('sleepLogs is not an array:', sleepLogs);
          setLogs([]);
          toast({
            title: 'เกิดข้อผิดพลาด',
            description: 'รูปแบบข้อมูลจาก API ไม่ถูกต้อง',
            variant: 'destructive'
          });
          return;
        }

        // แปลงข้อมูลให้ตรงกับ interface
        const formattedLogs = sleepLogs.map((log: any) => {
          return {
            id: log.id || log._id || crypto.randomUUID(),
            date: log.sleep_date || log.date || new Date().toISOString().split('T')[0],
            sleep_time: log.bedtime || log.sleep_time || log.bed_time || "",
            wake_time: log.wake_time || log.wakeup_time || "",
            sleep_quality: log.sleep_quality || "fair",
            notes: log.notes || ""
          };
        });


        // เรียงลำดับตามวันที่ล่าสุด
        const sortedLogs = formattedLogs.sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setLogs(sortedLogs);

        // แสดงข้อความสำเร็จ
        if (sortedLogs.length > 0) {
          toast({
            title: 'ดึงข้อมูลสำเร็จ',
            description: `พบข้อมูลการนอน ${sortedLogs.length} รายการ`,
          });
        } else {
          toast({
            title: 'ดึงข้อมูลสำเร็จ',
            description: 'ไม่พบข้อมูลการนอนในฐานข้อมูล',
          });
        }
      } else {
        console.error('Failed to fetch sleep logs:', response.status);
        // Fallback to localStorage if API fails
        const raw = localStorage.getItem('sleep_logs');
        if (raw) {
          try {
            const parsedData = JSON.parse(raw);
            setLogs(Array.isArray(parsedData) ? parsedData : []);
          } catch {
            setLogs([]);
          }
        } else {
          setLogs([]);
        }
      }
    } catch (error) {
      console.error('Error fetching sleep logs:', error);
      // Fallback to localStorage if API fails
      const raw = localStorage.getItem('sleep_logs');
      if (raw) {
        try {
          const parsedData = JSON.parse(raw);
          setLogs(Array.isArray(parsedData) ? parsedData : []);
        } catch {
          setLogs([]);
        }
      } else {
        setLogs([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSleepLogs();
  }, []);

  const saveLogs = (items: SleepLogItem[]) => {
    const safeItems = Array.isArray(items) ? items : [];
    setLogs(safeItems);
    localStorage.setItem('sleep_logs', JSON.stringify(safeItems));
  };

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    sleep_time: "",
    wake_time: "",
    sleep_quality: "",
    notes: ""
  });

  const computeSleepQuality = (sleepTime: string, wakeTime: string): { quality: string; colorClass: string; apiValue: string } => {
    if (!sleepTime || !wakeTime) return { quality: "", colorClass: "", apiValue: "fair" };
    const [sH, sM] = sleepTime.split(":").map(Number);
    const [wH, wM] = wakeTime.split(":").map(Number);
    const start = sH * 60 + sM;
    const end = wH * 60 + wM;
    const minutes = end >= start ? end - start : (24 * 60 - start) + end; // handle overnight

    // ปรับปรุงเกณฑ์การประเมินคุณภาพการนอนให้เหมาะสม
    // < 4 ชม = แย่มาก, 4-6 ชม = แย่, 6-8 ชม = ดี, 8-10 ชม = ดีมาก, > 10 ชม = ปานกลาง (เยอะเกินไป)
    if (minutes < 240) return { quality: "แย่มาก", colorClass: "bg-red-600 text-white", apiValue: "very_poor" };
    if (minutes < 360) return { quality: "แย่", colorClass: "bg-red-500 text-white", apiValue: "poor" };
    if (minutes <= 480) return { quality: "ดี", colorClass: "bg-green-600 text-white", apiValue: "good" };
    if (minutes <= 600) return { quality: "ดีมาก", colorClass: "bg-green-700 text-white", apiValue: "excellent" };
    return { quality: "ปานกลาง", colorClass: "bg-yellow-500 text-black", apiValue: "fair" };
  };

  // ฟังก์ชันสำหรับคำนวณระยะเวลาการนอน
  const calculateSleepDuration = (sleepTime: string, wakeTime: string): number => {
    if (!sleepTime || !wakeTime) return 0;
    const [sH, sM] = sleepTime.split(":").map(Number);
    const [wH, wM] = wakeTime.split(":").map(Number);
    const start = sH * 60 + sM;
    const end = wH * 60 + wM;
    const minutes = end >= start ? end - start : (24 * 60 - start) + end;
    return Math.round((minutes / 60) * 10) / 10; // รอบเป็นทศนิยม 1 ตำแหน่ง
  };

  // ฟังก์ชันสำหรับบันทึกข้อมูลใหม่
  const createSleepLog = async (data: any) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('ไม่พบ JWT Token');
    }

    const response = await fetch(`${envConfig.apiBaseUrl}${envConfig.sleepLogEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  };

  // ฟังก์ชันสำหรับอัปเดตข้อมูล
  const updateSleepLog = async (id: string, data: any) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('ไม่พบ JWT Token');
    }

    const response = await fetch(`${envConfig.apiBaseUrl}${envConfig.sleepLogEndpoint}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { quality, apiValue } = computeSleepQuality(formData.sleep_time, formData.wake_time);

      // แปลงข้อมูลให้ตรงกับ API format
      const apiData = {
        sleep_date: formData.date,
        bedtime: formData.sleep_time,
        wake_time: formData.wake_time,
        sleep_duration_hours: calculateSleepDuration(formData.sleep_time, formData.wake_time),
        sleep_quality: apiValue,
        notes: formData.notes || "",
        // ข้อมูลเพิ่มเติมที่จำเป็น
        sleep_efficiency_percentage: 85,
        time_to_fall_asleep_minutes: 15,
        awakenings_count: 0,
        deep_sleep_minutes: 120,
        light_sleep_minutes: 300,
        rem_sleep_minutes: 90,
        awake_minutes: 30,
        heart_rate_avg: 65,
        heart_rate_min: 55,
        heart_rate_max: 75,
        oxygen_saturation_avg: 98,
        room_temperature_celsius: 22,
        noise_level_db: 35,
        light_level_lux: 5,
        caffeine_intake_mg: 0,
        alcohol_intake_ml: 0,
        exercise_before_bed_hours: 0,
        screen_time_before_bed_minutes: 30,
        sleep_aids_used: [],
        medications_taken: [],
        stress_level: 3,
        mood_before_sleep: 7,
        mood_after_wake: 8,
        energy_level: 8,
        dreams_remembered: false,
        nightmares: false
      };

      if (editingId) {
        await updateSleepLog(editingId, apiData);
        toast({ title: 'อัปเดตบันทึกแล้ว' });
      } else {
        await createSleepLog(apiData);
        toast({ title: "บันทึกสำเร็จ", description: "บันทึกการนอนเรียบร้อยแล้ว" });
      }

      // รีเฟรชข้อมูลจาก API
      await fetchSleepLogs();

      setEditingId(null);
      setShowForm(false);
      setFormData({ date: new Date().toISOString().split('T')[0], sleep_time: "", wake_time: "", sleep_quality: "", notes: "" });
    } catch (error) {
      console.error('Error saving sleep log:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error instanceof Error ? error.message : 'ไม่สามารถบันทึกข้อมูลได้',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const startEdit = (l: SleepLogItem) => {
    setEditingId(l.id);
    setFormData({
      date: l.date || new Date().toISOString().split('T')[0],
      sleep_time: l.sleep_time || "",
      wake_time: l.wake_time || "",
      sleep_quality: l.sleep_quality || "",
      notes: l.notes || ''
    });
    setShowForm(true);
  };

  // ฟังก์ชันสำหรับลบข้อมูล
  const deleteSleepLog = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('ไม่พบ JWT Token');
    }

    const response = await fetch(`${envConfig.apiBaseUrl}${envConfig.sleepLogEndpoint}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  };

  const deleteLog = async (l: SleepLogItem) => {
    try {
      await deleteSleepLog(l.id);
      toast({ title: 'ลบรายการแล้ว' });
      // รีเฟรชข้อมูลจาก API
      await fetchSleepLogs();
    } catch (error) {
      console.error('Error deleting sleep log:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error instanceof Error ? error.message : 'ไม่สามารถลบข้อมูลได้',
        variant: 'destructive'
      });
    }
  };

  // ฟังก์ชันสำหรับเทส API
  const testSleepLogAPI = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่พบ JWT Token กรุณาเข้าสู่ระบบก่อน',
          variant: 'destructive'
        });
        return;
      }

      const testData = {
        sleep_date: "2024-01-15",
        bedtime: "22:30",
        wake_time: "06:30",
        sleep_duration_hours: 8,
        sleep_quality: "good",
        sleep_efficiency_percentage: 85,
        time_to_fall_asleep_minutes: 15,
        awakenings_count: 1,
        deep_sleep_minutes: 120,
        light_sleep_minutes: 300,
        rem_sleep_minutes: 90,
        awake_minutes: 30,
        heart_rate_avg: 65,
        heart_rate_min: 55,
        heart_rate_max: 75,
        oxygen_saturation_avg: 98,
        room_temperature_celsius: 22,
        noise_level_db: 35,
        light_level_lux: 5,
        caffeine_intake_mg: 0,
        alcohol_intake_ml: 0,
        exercise_before_bed_hours: 3,
        screen_time_before_bed_minutes: 30,
        sleep_aids_used: [],
        medications_taken: [],
        stress_level: 3,
        mood_before_sleep: 7,
        mood_after_wake: 8,
        energy_level: 8,
        notes: "นอนหลับได้ดี ตื่นขึ้นมาสดชื่น",
        dreams_remembered: true,
        nightmares: false
      };

      const response = await fetch(`${envConfig.apiBaseUrl}${envConfig.sleepLogEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testData)
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'เทส API สำเร็จ',
          description: `บันทึกข้อมูลการนอนหลับเรียบร้อยแล้ว ID: ${result.id || 'N/A'}`,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: 'เทส API ล้มเหลว',
          description: `Status: ${response.status} - ${errorData.message || response.statusText}`,
          variant: 'destructive'
        });
        console.error('API Error:', errorData);
      }
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: `ไม่สามารถเชื่อมต่อ API ได้: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
      console.error('Network Error:', error);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl shadow-sm">
                <Moon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-primary">บันทึกการนอน</h1>
                <p className="text-xs md:text-sm text-muted-foreground">ติดตามคุณภาพการนอนของคุณเพื่อสุขภาพที่ดี</p>
              </div>
            </div>
          </div>
          <div className="flex w-full md:w-auto gap-3">
            <Button
              onClick={fetchSleepLogs}
              disabled={isLoading}
              variant="outline"
              className="flex-1 md:flex-none gap-2 rounded-full border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isLoading ? 'รอสักครู่...' : 'รีเฟรช'}</span>
              <span className="sm:hidden">รีเฟรช</span>
            </Button>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="flex-1 md:flex-none gap-2 rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-white shadow-lg shadow-primary/20 transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              เพิ่มการนอน
            </Button>
          </div>
        </div>

        {showForm && (
          <Card className="border-l-4 border-l-primary/20 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Moon className="h-5 w-5" />
                {editingId ? 'แก้ไขข้อมูลการนอน' : 'บันทึกการนอนใหม่'}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {editingId ? 'ปรับปรุงข้อมูลการนอนของคุณ' : 'กรอกข้อมูลการนอนเพื่อติดตามความคืบหน้า'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="date" className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4 text-primary" />
                      วันที่นอน
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="h-11 border-primary/20 focus:border-primary/40"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="sleep_time" className="flex items-center gap-2 text-sm font-medium">
                      <Moon className="h-4 w-4 text-primary" />
                      เวลาเข้านอน
                    </Label>
                    <Input
                      id="sleep_time"
                      type="time"
                      value={formData.sleep_time}
                      onChange={(e) => setFormData({ ...formData, sleep_time: e.target.value })}
                      className="h-11 border-primary/20 focus:border-primary/40"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="wake_time" className="flex items-center gap-2 text-sm font-medium">
                      <Clock className="h-4 w-4 text-primary" />
                      เวลาตื่นนอน
                    </Label>
                    <Input
                      id="wake_time"
                      type="time"
                      value={formData.wake_time}
                      onChange={(e) => setFormData({ ...formData, wake_time: e.target.value })}
                      className="h-11 border-primary/20 focus:border-primary/40"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Activity className="h-4 w-4 text-primary" />
                      คุณภาพการนอน
                    </Label>
                    {(() => {
                      const { quality } = computeSleepQuality(formData.sleep_time, formData.wake_time);
                      return (
                        <Input
                          value={quality || ""}
                          readOnly
                          placeholder="ระบบจะคำนวณอัตโนมัติ"
                          className="h-11 bg-muted border-primary/20"
                        />
                      );
                    })()}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="notes" className="flex items-center gap-2 text-sm font-medium">
                    <Activity className="h-4 w-4 text-primary" />
                    หมายเหตุ
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="รายละเอียดเพิ่มเติม เช่น ความรู้สึก, สภาพแวดล้อม, หรือปัจจัยที่ส่งผลต่อการนอน..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="min-h-[80px] border-primary/20 focus:border-primary/40 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-4 border-t border-border/50">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        {editingId ? 'กำลังอัปเดต...' : 'กำลังบันทึก...'}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        {editingId ? 'อัปเดตข้อมูล' : 'บันทึกการนอน'}
                      </div>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setFormData({ date: new Date().toISOString().split('T')[0], sleep_time: "", wake_time: "", sleep_quality: "", notes: "" });
                    }}
                    disabled={isSubmitting}
                    className="h-11 px-6 border-primary/20 hover:border-primary/40"
                  >
                    ยกเลิก
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* สรุปการนอน - Layout แนวตั้ง */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="h-5 w-5" />
                  สรุปการนอน
                </CardTitle>
                <CardDescription>
                  ข้อมูลการนอนและคุณภาพการพักผ่อน
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {Array.isArray(logs) && logs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* คอลัมน์ซ้าย - สถิติหลัก */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted/50 rounded-lg">
                        <Moon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">จำนวนวันบันทึก</div>
                        <div className="text-xs text-muted-foreground">การนอนทั้งหมด</div>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-foreground">
                      {logs.length}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted/50 rounded-lg">
                        <Clock className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">คุณภาพการนอน</div>
                        <div className="text-xs text-muted-foreground">เปอร์เซ็นต์การนอนดี</div>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-foreground">
                      {(() => {
                        const goodCount = logs.filter(log =>
                          log.sleep_quality === 'good' ||
                          log.sleep_quality === 'excellent' ||
                          log.sleep_quality === 'ดี'
                        ).length;
                        return `${Math.round((goodCount / logs.length) * 100)}%`;
                      })()}
                    </div>
                  </div>
                </div>

                {/* คอลัมน์ขวา - สถิติเพิ่มเติม */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted/50 rounded-lg">
                        <Activity className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">ระยะเวลานอนเฉลี่ย</div>
                        <div className="text-xs text-muted-foreground">ชั่วโมงต่อคืน</div>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-foreground">
                      {(() => {
                        const totalHours = logs.reduce((sum, log) => {
                          const duration = calculateSleepDuration(log.sleep_time, log.wake_time);
                          return sum + duration;
                        }, 0);
                        return Math.round(totalHours / logs.length * 10) / 10;
                      })()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted/50 rounded-lg">
                        <Calendar className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">บันทึกล่าสุด</div>
                        <div className="text-xs text-muted-foreground">วันที่</div>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-foreground">
                      {(() => {
                        const latest = logs.sort((a, b) =>
                          new Date(b.date).getTime() - new Date(a.date).getTime()
                        )[0];
                        return latest ? new Date(latest.date).getDate() : '--';
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-4 bg-muted/10 rounded-xl border-2 border-dashed border-muted">
                <div className="p-4 bg-primary/5 rounded-full ring-8 ring-primary/5">
                  <Moon className="h-10 w-10 text-primary/40" />
                </div>
                <div className="space-y-2 max-w-sm">
                  <h3 className="text-lg font-semibold text-foreground">ยังไม่มีข้อมูลการนอน</h3>
                  <p className="text-sm text-muted-foreground">
                    เริ่มต้นบันทึกการนอนของคุณเพื่อติดตามคุณภาพการพักผ่อนและดูสถิติที่น่าสนใจ
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForm(true)}
                  className="text-primary hover:text-primary-hover hover:bg-primary/5 mt-2"
                >
                  เริ่มบันทึกเลย <Plus className="ml-1 h-3 w-3" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-primary/10 rounded-md">
                <Moon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">ประวัติการนอน</h2>
              {logs.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-primary/20">
                  {logs.length} รายการ
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              เรียงตามวันที่ล่าสุด
            </div>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>กำลังโหลดข้อมูล...</span>
                </div>
              </CardContent>
            </Card>
          ) : !Array.isArray(logs) || logs.length === 0 ? (
            <Card className="border-dashed border-2 border-muted-foreground/20">
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <Moon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-foreground">ยังไม่มีข้อมูลการนอน</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      เริ่มต้นบันทึกการนอนของคุณเพื่อติดตามความคืบหน้าและสร้างแรงบันดาลใจในการดูแลสุขภาพ
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowForm(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    เพิ่มการนอนแรก
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5">
              {Array.isArray(logs) && logs.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/30">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-muted/30 rounded-xl">
                          <Moon className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-foreground">
                              {item.sleep_time || '--:--'} — {item.wake_time || '--:--'}
                            </h3>
                            {(() => {
                              const mapColor = (q: string) => {
                                if (q === "แย่" || q === "very_poor" || q === "poor") return "bg-red-500 text-white";
                                if (q === "ปานกลาง" || q === "fair") return "bg-yellow-500 text-black";
                                if (q === "ดี" || q === "good" || q === "excellent") return "bg-green-600 text-white";
                                return "bg-gray-500 text-white";
                              };

                              // แปลง API value กลับเป็นภาษาไทยสำหรับแสดงผล
                              const getDisplayQuality = (apiValue: string) => {
                                switch (apiValue) {
                                  case "excellent": return "ดีมาก";
                                  case "good": return "ดี";
                                  case "fair": return "ปานกลาง";
                                  case "poor": return "แย่";
                                  case "very_poor": return "แย่มาก";
                                  default: return apiValue || "ไม่ระบุ";
                                }
                              };

                              return (
                                <Badge className={`${mapColor(item.sleep_quality || '')} px-3 py-1`}>
                                  {getDisplayQuality(item.sleep_quality || '')}
                                </Badge>
                              );
                            })()}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {item.date ? new Date(item.date).toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : 'ไม่ระบุวันที่'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {calculateSleepDuration(item.sleep_time, item.wake_time)} ชม.
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(item)}
                          className="h-8 px-3 border-primary/20 hover:border-primary/40"
                        >
                          แก้ไข
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 px-3"
                            >
                              ลบ
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                              <AlertDialogDescription>
                                ต้องการลบรายการนี้หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้
                              </AlertDialogDescription>
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
                      <div className="mt-4 p-3 bg-muted/20 border rounded-lg">
                        <div className="flex items-start gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-foreground leading-relaxed">{item.notes}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
