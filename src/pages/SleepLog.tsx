import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Moon, Calendar, Clock, RefreshCw, Pencil, Trash2 } from "lucide-react";
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

      const response = await fetch('http://localhost:3000/sleep-log', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);
        console.log('API Response type:', typeof data);
        console.log('API Response keys:', Object.keys(data));
        
        // ตรวจสอบโครงสร้างข้อมูลจาก API
        let sleepLogs = [];
        
        // ตรวจสอบทุกความเป็นไปได้
        if (Array.isArray(data)) {
          sleepLogs = data;
          console.log('Data is array:', sleepLogs);
        } else if (data && data.data) {
          console.log('Found data.data:', data.data);
          console.log('data.data type:', typeof data.data);
          console.log('data.data keys:', Object.keys(data.data));
          
          if (Array.isArray(data.data)) {
            sleepLogs = data.data;
            console.log('Data.data is array:', sleepLogs);
          } else if (data.data && Array.isArray(data.data.sleep_logs)) {
            sleepLogs = data.data.sleep_logs;
            console.log('Data.data.sleep_logs is array:', sleepLogs);
          } else if (data.data && Array.isArray(data.data.records)) {
            sleepLogs = data.data.records;
            console.log('Data.data.records is array:', sleepLogs);
          } else if (data.data && Array.isArray(data.data.items)) {
            sleepLogs = data.data.items;
            console.log('Data.data.items is array:', sleepLogs);
          } else {
            // ลองหาคีย์ที่มี array ใน data.data
            for (const key of Object.keys(data.data)) {
              if (Array.isArray(data.data[key])) {
                console.log(`Found array in data.data.${key}:`, data.data[key]);
                sleepLogs = data.data[key];
                break;
              }
            }
          }
        } else if (data && Array.isArray(data.sleepLogs)) {
          sleepLogs = data.sleepLogs;
          console.log('Data.sleepLogs is array:', sleepLogs);
        } else if (data && data.results && Array.isArray(data.results)) {
          sleepLogs = data.results;
          console.log('Data.results is array:', sleepLogs);
        } else if (data && data.sleep_logs && Array.isArray(data.sleep_logs)) {
          sleepLogs = data.sleep_logs;
          console.log('Data.sleep_logs is array:', sleepLogs);
        } else {
          console.log('No array found in response, data structure:', data);
          // ลองดูว่ามีข้อมูลในรูปแบบอื่นหรือไม่
          if (data && typeof data === 'object') {
            console.log('Available keys in data:', Object.keys(data));
            // ลองหาคีย์ที่มี array
            for (const key of Object.keys(data)) {
              if (Array.isArray(data[key])) {
                console.log(`Found array in key '${key}':`, data[key]);
                sleepLogs = data[key];
                break;
              }
            }
          }
        }
        
        console.log('Final sleepLogs array:', sleepLogs);
        console.log('SleepLogs length:', sleepLogs.length);
        
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
          console.log('Processing log:', log);
          return {
            id: log.id || log._id || crypto.randomUUID(),
            date: log.sleep_date || log.date || new Date().toISOString().split('T')[0],
            sleep_time: log.bedtime || log.sleep_time || log.bed_time || "",
            wake_time: log.wake_time || log.wakeup_time || "",
            sleep_quality: log.sleep_quality || "fair",
            notes: log.notes || ""
          };
        });
        
        console.log('Formatted logs:', formattedLogs);
        
        // เรียงลำดับตามวันที่ล่าสุด
        const sortedLogs = formattedLogs.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setLogs(sortedLogs);
        console.log('Final sorted logs:', sortedLogs);
        
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
          
          // เพิ่มข้อมูลทดสอบเพื่อให้แน่ใจว่าระบบทำงานได้
          console.log('No data found, adding test data for debugging...');
          const testData = [{
            id: 'test-1',
            date: new Date().toISOString().split('T')[0],
            sleep_time: '22:30',
            wake_time: '06:30',
            sleep_quality: 'good',
            notes: 'ข้อมูลทดสอบ'
          }];
          setLogs(testData);
          console.log('Test data added:', testData);
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

    // thresholds (simple): <4h bad, 4-6h medium, 6-9h good, >9h medium
    if (minutes < 240) return { quality: "แย่", colorClass: "bg-red-500 text-white", apiValue: "very_poor" };
    if (minutes < 360) return { quality: "ปานกลาง", colorClass: "bg-yellow-500 text-black", apiValue: "poor" };
    if (minutes <= 540) return { quality: "ดี", colorClass: "bg-green-600 text-white", apiValue: "good" };
    if (minutes <= 600) return { quality: "ดี", colorClass: "bg-green-600 text-white", apiValue: "excellent" };
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

    const response = await fetch('http://localhost:3000/sleep-log', {
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

    const response = await fetch(`http://localhost:3000/sleep-log/${id}`, {
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

    const response = await fetch(`http://localhost:3000/sleep-log/${id}`, {
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

      const response = await fetch('http://localhost:3000/sleep-log', {
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
        console.log('API Response:', result);
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
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-primary to-secondary rounded-xl shadow-lg">
                <Moon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                บันทึกการนอน
              </h2>
            </div>
            <p className="text-muted-foreground ml-16">
              ติดตามคุณภาพการนอนของคุณ
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={fetchSleepLogs} 
              disabled={isLoading}
              variant="outline"
              className="gap-2 rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'กำลังโหลด...' : 'รีเฟรช'}
            </Button>
            <Button 
              onClick={() => setShowForm(!showForm)} 
              className="gap-2 rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Moon className="h-4 w-4" />
              เพิ่มบันทึก
            </Button>
          </div>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                บันทึกการนอนใหม่
              </CardTitle>
              <CardDescription>
                กรอกข้อมูลการนอนของคุณ
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date">วันที่</Label>
                    <Input 
                      id="date" 
                      type="date" 
                      value={formData.date} 
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sleep_time">เข้านอน</Label>
                    <Input 
                      id="sleep_time" 
                      type="time" 
                      value={formData.sleep_time} 
                      onChange={(e) => setFormData({ ...formData, sleep_time: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wake_time">ตื่นนอน</Label>
                    <Input 
                      id="wake_time" 
                      type="time" 
                      value={formData.wake_time} 
                      onChange={(e) => setFormData({ ...formData, wake_time: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>คุณภาพโดยอัตโนมัติ</Label>
                    {(() => {
                      const { quality } = computeSleepQuality(formData.sleep_time, formData.wake_time);
                      return (
                        <Input 
                          value={quality || ""} 
                          readOnly 
                          placeholder="ระบบจะคำนวณอัตโนมัติ" 
                          className="bg-muted"
                        />
                      );
                    })()}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">หมายเหตุ</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="รายละเอียดเพิ่มเติม..." 
                    value={formData.notes} 
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowForm(false)} 
                    disabled={isSubmitting}
                  >
                    ยกเลิก
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Statistics Section */}
        {Array.isArray(logs) && logs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Moon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">จำนวนวัน</p>
                    <p className="text-3xl font-bold text-primary">{logs.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-emerald-100">
                    <Clock className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">คุณภาพการนอน</p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {(() => {
                        const goodCount = logs.filter(log => 
                          log.sleep_quality === 'good' || 
                          log.sleep_quality === 'excellent' ||
                          log.sleep_quality === 'ดี'
                        ).length;
                        return `${Math.round((goodCount / logs.length) * 100)}%`;
                      })()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-blue-100">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">บันทึกล่าสุด</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {(() => {
                        const latest = logs.sort((a, b) => 
                          new Date(b.date).getTime() - new Date(a.date).getTime()
                        )[0];
                        return latest ? new Date(latest.date).toLocaleDateString('th-TH') : 'ไม่มี';
                      })()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">ประวัติการนอน</h2>
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
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  <Moon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">ยังไม่มีข้อมูลการนอน</p>
                  <p className="text-sm">เริ่มต้นบันทึกการนอนของคุณ</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {Array.isArray(logs) && logs.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-primary/10">
                          <Moon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold text-foreground">
                            {item.sleep_time || '--:--'} — {item.wake_time || '--:--'}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {item.date ? new Date(item.date).toLocaleDateString('th-TH') : 'ไม่ระบุวันที่'}
                          </div>
                          {item.notes && (
                            <div className="text-sm text-muted-foreground mt-2 p-2 bg-muted rounded-md">
                              {item.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {(() => {
                          const mapColor = (q: string) => {
                            if (q === "แย่" || q === "very_poor" || q === "poor") return "bg-red-100 text-red-700";
                            if (q === "ปานกลาง" || q === "fair") return "bg-yellow-100 text-yellow-700";
                            if (q === "ดี" || q === "good" || q === "excellent") return "bg-emerald-100 text-emerald-700";
                            return "bg-muted text-muted-foreground";
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
                            <Badge className={`${mapColor(item.sleep_quality || '')} px-3 py-1 font-medium`}>
                              {getDisplayQuality(item.sleep_quality || '')}
                            </Badge>
                          );
                        })()}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => startEdit(item)}
                          className="gap-2 rounded-full border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-all duration-200 shadow-sm"
                        >
                          <Pencil className="h-4 w-4" /> แก้ไข
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="gap-2 rounded-full border-2 border-red-300 hover:border-red-400 hover:bg-red-50 text-red-600 hover:text-red-700 transition-all duration-200 shadow-sm"
                            >
                              <Trash2 className="h-4 w-4" /> ลบ
                            </Button>
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
