import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Droplets, Calendar, Clock, Plus, RefreshCw, TrendingUp, Target, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { apiService, WaterLogItem as APIWaterLogItem } from "@/services/api";

interface WaterLogItem {
  id: string;
  date: string;
  time: string;
  amount_ml: number;
  drink_type?: string;
  notes?: string;
}

export default function WaterLog() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [logs, setLogs] = useState<WaterLogItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ฟังก์ชันดึงข้อมูลจาก API
  const fetchWaterLogs = async () => {
    try {
      setIsLoading(true);
      const apiLogs = await apiService.getWaterLogs();
      
      // แปลงข้อมูลจาก API format เป็น local format
      const convertedLogs: WaterLogItem[] = apiLogs.map((apiLog: APIWaterLogItem) => ({
        id: String(apiLog.id || crypto.randomUUID()),
        date: new Date(apiLog.consumed_at).toISOString().split('T')[0],
        time: new Date(apiLog.consumed_at).toTimeString().split(' ')[0].substring(0, 5),
        amount_ml: apiLog.amount_ml,
        drink_type: apiLog.drink_type || 'water',
        notes: apiLog.notes || ''
      }));
      
      setLogs(convertedLogs);
      console.log('✅ Water logs loaded from API:', convertedLogs);
    } catch (error) {
      console.error('❌ Error loading water logs from API:', error);
      
      // Fallback to localStorage if API fails
      const raw = localStorage.getItem('water_logs');
      if (raw) {
        try { 
          setLogs(JSON.parse(raw)); 
          toast({ 
            title: "⚠️ ใช้ข้อมูลจากเครื่อง", 
            description: "ไม่สามารถเชื่อมต่อ API ได้ ใช้ข้อมูลที่บันทึกไว้ในเครื่อง" 
          });
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
    fetchWaterLogs();
  }, []);

  const saveLogs = (items: WaterLogItem[]) => {
    setLogs(items);
    localStorage.setItem('water_logs', JSON.stringify(items));
  };

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: "",
    amount_ml: "",
    drink_type: "water",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // สร้าง consumed_at จาก date และ time
      const consumedAt = new Date(`${formData.date}T${formData.time}:00`).toISOString();
      
      if (editingId) {
        // อัปเดตข้อมูล
        const updateData: Partial<APIWaterLogItem> = {
          amount_ml: Number(formData.amount_ml || 0),
          drink_type: formData.drink_type,
          notes: formData.notes,
          consumed_at: consumedAt
        };

        await apiService.updateWaterLog(editingId, updateData);
        toast({ title: '✅ อัปเดตบันทึกแล้ว', description: "ข้อมูลถูกบันทึกลงฐานข้อมูลแล้ว" });
      } else {
        // สร้างข้อมูลใหม่
        const newLogData: APIWaterLogItem = {
          amount_ml: Number(formData.amount_ml || 0),
          drink_type: formData.drink_type,
          notes: formData.notes,
          consumed_at: consumedAt
        };

        await apiService.createWaterLog(newLogData);
        toast({ title: "✅ บันทึกสำเร็จ", description: "บันทึกน้ำดื่มลงฐานข้อมูลเรียบร้อยแล้ว" });
      }

      // รีเฟรชข้อมูลจาก API
      await fetchWaterLogs();
      
      // รีเซ็ตฟอร์ม
      setEditingId(null);
      setShowForm(false);
      setFormData({ date: new Date().toISOString().split('T')[0], time: "", amount_ml: "", drink_type: "water", notes: "" });

    } catch (error) {
      console.error('❌ Error saving water log:', error);
      
      toast({ 
        title: "❌ บันทึกไม่สำเร็จ", 
        description: error instanceof Error ? error.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const startEdit = (l: WaterLogItem) => {
    setEditingId(l.id);
    setFormData({ 
      date: l.date, 
      time: l.time, 
      amount_ml: String(l.amount_ml||''), 
      drink_type: l.drink_type || "water",
      notes: l.notes || '' 
    });
    setShowForm(true);
  };

  // ฟังก์ชันแปลงชื่อประเภทเครื่องดื่มเป็นภาษาไทย
  const getDrinkTypeLabel = (drinkType: string) => {
    const labels: Record<string, string> = {
      'water': 'น้ำเปล่า',
      'tea': 'ชา',
      'coffee': 'กาแฟ',
      'juice': 'น้ำผลไม้',
      'soda': 'น้ำอัดลม',
      'sports_drink': 'เครื่องดื่มเกลือแร่',
      'other': 'อื่นๆ'
    };
    return labels[drinkType] || drinkType;
  };

  const deleteLog = async (l: WaterLogItem) => {
    try {
      setIsSubmitting(true);
      
      // ลบข้อมูลจาก API
      await apiService.deleteWaterLog(l.id);
      
      // รีเฟรชข้อมูลจาก API
      await fetchWaterLogs();
      
      toast({ 
        title: '✅ ลบรายการแล้ว', 
        description: "ข้อมูลถูกลบออกจากฐานข้อมูลแล้ว" 
      });
    } catch (error) {
      console.error('❌ Error deleting water log:', error);
      
      toast({ 
        title: "❌ ลบไม่สำเร็จ", 
        description: error instanceof Error ? error.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ฟังก์ชันคำนวณสถิติการดื่มน้ำ
  const calculateWaterStats = (period: 'today' | 'week' | 'month') => {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
    }
    
    const filteredLogs = logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= startDate;
    });
    
    const totalAmount = filteredLogs.reduce((sum, log) => sum + log.amount_ml, 0);
    const totalLogs = filteredLogs.length;
    const averageAmount = totalLogs > 0 ? Math.round(totalAmount / totalLogs) : 0;
    
    // คำนวณเป้าหมาย (แนะนำ 8 แก้ว = 2000ml ต่อวัน)
    const days = period === 'today' ? 1 : period === 'week' ? 7 : 30;
    const targetAmount = days * 2000;
    const progressPercentage = Math.min((totalAmount / targetAmount) * 100, 100);
    
    return {
      totalAmount,
      totalLogs,
      averageAmount,
      targetAmount,
      progressPercentage: Math.round(progressPercentage)
    };
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Droplets className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">บันทึกน้ำดื่ม</h1>
              <p className="text-muted-foreground">ติดตามคุณภาพการดื่มน้ำของคุณ</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={fetchWaterLogs} 
              disabled={isLoading}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'กำลังโหลด...' : 'รีเฟรช'}
            </Button>
            <Button 
              onClick={() => setShowForm(!showForm)} 
              className="gap-2 rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Droplets className="h-4 w-4" />
              เพิ่มบันทึก
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ปริมาณรวมวันนี้</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {calculateWaterStats('today').totalAmount.toLocaleString()} มล.
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Droplets className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">เป้าหมายวันนี้</p>
                  <p className="text-2xl font-bold text-green-600">
                    {calculateWaterStats('today').progressPercentage}%
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">จำนวนครั้ง</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {calculateWaterStats('today').totalLogs} ครั้ง
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">ความคืบหน้าการดื่มน้ำวันนี้</h3>
                <Badge variant="outline" className="text-sm">
                  {calculateWaterStats('today').totalAmount.toLocaleString()} / 2,000 มล.
                </Badge>
              </div>
              <Progress 
                value={calculateWaterStats('today').progressPercentage} 
                className="h-3"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>เป้าหมาย: 2,000 มล. ต่อวัน</span>
                <span>{calculateWaterStats('today').progressPercentage}% สำเร็จ</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {showForm && (
          <Card className="border-2 border-primary/20">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-primary" />
                {editingId ? "แก้ไขบันทึกน้ำดื่ม" : "บันทึกน้ำดื่มใหม่"}
              </CardTitle>
              <CardDescription>
                {editingId ? "แก้ไขข้อมูลการดื่มน้ำ" : "เพิ่มข้อมูลการดื่มน้ำในวันนี้"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">วันที่</Label>
                    <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">เวลา</Label>
                    <Input id="time" type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount_ml">ปริมาณ (มล.)</Label>
                    <Input id="amount_ml" type="number" placeholder="250" value={formData.amount_ml} onChange={(e) => setFormData({ ...formData, amount_ml: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="drink_type">ประเภทเครื่องดื่ม</Label>
                    <select 
                      id="drink_type" 
                      value={formData.drink_type} 
                      onChange={(e) => setFormData({ ...formData, drink_type: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="water">น้ำเปล่า</option>
                      <option value="tea">ชา</option>
                      <option value="coffee">กาแฟ</option>
                      <option value="juice">น้ำผลไม้</option>
                      <option value="soda">น้ำอัดลม</option>
                      <option value="sports_drink">เครื่องดื่มเกลือแร่</option>
                      <option value="other">อื่นๆ</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">หมายเหตุ</Label>
                  <Textarea id="notes" placeholder="หลังออกกำลังกาย ระหว่างทำงาน..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "กำลังบันทึก..." : editingId ? "อัปเดต" : "บันทึก"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setFormData({ date: new Date().toISOString().split('T')[0], time: "", amount_ml: "", drink_type: "water", notes: "" });
                    }}
                    disabled={isSubmitting}
                  >
                    ยกเลิก
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Water Log History */}
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">ประวัติการดื่มน้ำ</h2>
            <Badge variant="secondary" className="text-xs">
              {logs.length} รายการ
            </Badge>
          </div>
          
          {isLoading && logs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span>กำลังโหลดข้อมูล...</span>
                </div>
              </CardContent>
            </Card>
          ) : logs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center text-muted-foreground">
                <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
                  <Droplets className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">ยังไม่มีข้อมูลการดื่มน้ำ</h3>
                <p className="text-sm mb-4">เริ่มต้นการติดตามการดื่มน้ำเพื่อสุขภาพที่ดี</p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="gap-2 rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Droplets className="h-4 w-4" />
                  เพิ่มบันทึกแรก
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {logs.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                          <Droplets className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-blue-600">{item.amount_ml.toLocaleString()} มล.</h3>
                            <Badge variant="outline" className="text-xs">
                              {getDrinkTypeLabel(item.drink_type || 'water')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(item.date).toLocaleDateString('th-TH')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {item.time}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => startEdit(item)}
                          disabled={isSubmitting}
                          className="gap-2"
                        >
                          <TrendingUp className="h-4 w-4" /> แก้ไข
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={isSubmitting}
                              className="gap-2 rounded-full border-2 border-red-300 hover:border-red-400 hover:bg-red-50 text-red-600 hover:text-red-700 transition-all duration-200 shadow-sm"
                            >
                              {isSubmitting ? "กำลังลบ..." : "ลบ"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                              <AlertDialogDescription>
                                ต้องการลบรายการนี้หรือไม่? ข้อมูลจะถูกลบออกจากฐานข้อมูลอย่างถาวร
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={isSubmitting}>ยกเลิก</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteLog(item)}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? "กำลังลบ..." : "ลบ"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    {item.notes && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground border-l-4 border-l-blue-200">
                        <strong>หมายเหตุ:</strong> {item.notes}
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
