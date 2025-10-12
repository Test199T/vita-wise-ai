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
  const fetchWaterLogs = async (date?: string) => {
    try {
      setIsLoading(true);
      const targetDate = date || new Date().toISOString().split('T')[0];
      const apiLogs = await apiService.getWaterLogs(targetDate);
      
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
      console.log('✅ Water logs loaded from API for date:', targetDate, convertedLogs);
    } catch (error) {
      console.error('❌ Error loading water logs from API:', error);
      
      // Fallback to localStorage if API fails
      const raw = localStorage.getItem('water_logs');
      if (raw) {
        try { 
          const allLogs = JSON.parse(raw);
          // กรองข้อมูลเฉพาะวันปัจจุบัน
          const today = new Date().toISOString().split('T')[0];
          const todayLogs = allLogs.filter((log: WaterLogItem) => log.date === today);
          setLogs(todayLogs); 
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
    amount_ml: "",
    drink_type: "water",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // สร้าง consumed_at จาก date และเวลาปัจจุบัน
      const now = new Date();
      const consumedAt = new Date(`${formData.date}T${now.toTimeString().split(' ')[0]}`).toISOString();
      
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
      setFormData({ date: new Date().toISOString().split('T')[0], amount_ml: "", drink_type: "water", notes: "" });

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
    // สำหรับวันนี้ ใช้ข้อมูลจาก logs state ที่มีเฉพาะวันปัจจุบันแล้ว
    if (period === 'today') {
      const totalAmount = logs.reduce((sum, log) => sum + log.amount_ml, 0);
      const totalLogs = logs.length;
      const averageAmount = totalLogs > 0 ? Math.round(totalAmount / totalLogs) : 0;
      
      // เป้าหมาย 2000ml ต่อวัน
      const targetAmount = 2000;
      const progressPercentage = Math.min((totalAmount / targetAmount) * 100, 100);
      
      return {
        totalAmount,
        totalLogs,
        averageAmount,
        targetAmount,
        progressPercentage: Math.round(progressPercentage)
      };
    }
    
    // สำหรับ week และ month ยังคงใช้ logic เดิม (กรองจาก logs ทั้งหมด)
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    
    const filteredLogs = logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= startDate;
    });
    
    const totalAmount = filteredLogs.reduce((sum, log) => sum + log.amount_ml, 0);
    const totalLogs = filteredLogs.length;
    const averageAmount = totalLogs > 0 ? Math.round(totalAmount / totalLogs) : 0;
    
    // คำนวณเป้าหมาย (แนะนำ 8 แก้ว = 2000ml ต่อวัน)
    const days = period === 'week' ? 7 : 30;
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
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Droplets className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-primary">บันทึกน้ำดื่ม</h1>
            </div>
            <p className="text-muted-foreground ml-12">ติดตามการดื่มน้ำของคุณเพื่อสุขภาพที่ดี</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => fetchWaterLogs()} 
              disabled={isLoading}
              variant="outline"
              className="gap-2 rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
            >
              <svg className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isLoading ? 'กำลังโหลด...' : 'รีเฟรช'}
            </Button>
            <Button 
              onClick={() => setShowForm(!showForm)} 
              className="gap-2 rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              เพิ่มน้ำดื่ม
            </Button>
          </div>
        </div>

        {/* สรุปการดื่มน้ำ - Layout แนวนอน */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ข้อมูลหลัก */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Droplets className="h-5 w-5 text-primary" />
                สรุปการดื่มน้ำ
              </CardTitle>
              <CardDescription>
                ข้อมูลการดื่มน้ำและความคืบหน้าเป้าหมาย
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* แถวแรก - ปริมาณและเป้าหมาย */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <Droplets className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-foreground">
                        {calculateWaterStats('today').totalAmount.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">มล. วันนี้</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <Target className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-foreground">
                        {calculateWaterStats('today').progressPercentage}%
                      </div>
                      <div className="text-xs text-muted-foreground">2,000 มล./วัน</div>
                    </div>
                  </div>
                </div>
                
                {/* แถวที่สอง - จำนวนครั้งและเฉลี่ย */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <Activity className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-foreground">
                        {calculateWaterStats('today').totalLogs}
                      </div>
                      <div className="text-xs text-muted-foreground">ครั้ง</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-foreground">
                        {calculateWaterStats('today').averageAmount}
                      </div>
                      <div className="text-xs text-muted-foreground">มล. เฉลี่ย</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Bar */}
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    ความคืบหน้าการดื่มน้ำวันนี้
                  </h3>
                  <Badge variant="outline" className="text-sm bg-primary/10 text-primary border-primary/20">
                    {calculateWaterStats('today').totalAmount.toLocaleString()} / 2,000 มล.
                  </Badge>
                </div>
                <Progress 
                  value={calculateWaterStats('today').progressPercentage} 
                  className="h-3"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>2,000 มล. ต่อวัน</span>
                  <span>{calculateWaterStats('today').progressPercentage}% สำเร็จ</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


        {showForm && (
          <Card className="border-l-4 border-l-primary/20 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Droplets className="h-5 w-5" />
                {editingId ? 'แก้ไขข้อมูลน้ำดื่ม' : 'บันทึกน้ำดื่มใหม่'}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {editingId ? 'ปรับปรุงข้อมูลการดื่มน้ำของคุณ' : 'กรอกข้อมูลการดื่มน้ำเพื่อติดตามความคืบหน้า'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="date" className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4 text-primary" />
                      วันที่ดื่ม
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
                    <Label htmlFor="amount_ml" className="flex items-center gap-2 text-sm font-medium">
                      <Droplets className="h-4 w-4 text-primary" />
                      ปริมาณ (มล.)
                    </Label>
                    <Input 
                      id="amount_ml" 
                      type="number" 
                      placeholder="250" 
                      value={formData.amount_ml} 
                      onChange={(e) => setFormData({ ...formData, amount_ml: e.target.value })} 
                      className="h-11 border-primary/20 focus:border-primary/40"
                      required 
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="drink_type" className="flex items-center gap-2 text-sm font-medium">
                      <Activity className="h-4 w-4 text-primary" />
                      ประเภทเครื่องดื่ม
                    </Label>
                    <select 
                      id="drink_type" 
                      value={formData.drink_type} 
                      onChange={(e) => setFormData({ ...formData, drink_type: e.target.value })}
                      className="flex h-11 w-full rounded-md border border-primary/20 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                <div className="space-y-3">
                  <Label htmlFor="notes" className="flex items-center gap-2 text-sm font-medium">
                    <Activity className="h-4 w-4 text-primary" />
                    หมายเหตุ
                  </Label>
                  <Textarea 
                    id="notes" 
                    placeholder="รายละเอียดเพิ่มเติม เช่น หลังออกกำลังกาย, ระหว่างทำงาน, หรือความรู้สึก..." 
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
                        <Droplets className="h-4 w-4" />
                        {editingId ? 'อัปเดตข้อมูล' : 'บันทึกน้ำดื่ม'}
                      </div>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setFormData({ date: new Date().toISOString().split('T')[0], amount_ml: "", drink_type: "water", notes: "" });
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-primary/10 rounded-md">
                <Droplets className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">ประวัติการดื่มน้ำ</h2>
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
            <Card className="border-dashed border-2 border-muted-foreground/20">
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <Droplets className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-foreground">ยังไม่มีข้อมูลการดื่มน้ำ</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      เริ่มต้นบันทึกการดื่มน้ำของคุณเพื่อติดตามความคืบหน้าและสร้างแรงบันดาลใจในการดูแลสุขภาพ
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowForm(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    เพิ่มน้ำดื่มแรก
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {logs.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/30">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-muted/30 rounded-xl">
                          <Droplets className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-foreground">
                              {item.amount_ml.toLocaleString()} มล.
                            </h3>
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                              {getDrinkTypeLabel(item.drink_type || 'water')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(item.date).toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {editingId === item.id ? 'เวลาปัจจุบัน' : item.time}
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
                          className="h-8 px-3 border-primary/20 hover:border-primary/40"
                        >
                          แก้ไข
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              disabled={isSubmitting}
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
