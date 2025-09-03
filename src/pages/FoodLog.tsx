import { useMemo, useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Utensils, 
  Plus, 
  Calendar, 
  Flame, 
  Beef, 
  Pill, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  BarChart3,
  TestTube,
  RefreshCw,
  Edit,
  Trash2,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { apiService, FoodLogItem } from "@/services/api";

interface FoodItem {
  name: string;
  amount: string;
  calories: number;
}

interface FoodLog {
  food_log_id: string;
  log_date: string;
  meal_time: string;
  food_items: FoodItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  total_fiber: number;
  total_vitaminC: number;
  total_vitaminD: number;
  total_calcium: number;
  total_iron: number;
  total_potassium: number;
  total_sodium: number;
  notes: string;
}

// ข้อมูลโภชนาการเป้าหมาย (ใช้ค่าผู้ใช้ หากไม่มีใช้ค่าเริ่มต้นทั่วไป)
const defaultNutritionTargets = {
  protein: { target: 80, unit: "g" },
  carbs: { target: 250, unit: "g" },
  fats: { target: 65, unit: "g" },
  fiber: { target: 25, unit: "g" },
  vitaminC: { target: 90, unit: "mg" },
  vitaminD: { target: 15, unit: "mcg" },
  calcium: { target: 1000, unit: "mg" },
  iron: { target: 18, unit: "mg" },
  potassium: { target: 3500, unit: "mg" },
  sodium: { target: 2300, unit: "mg" },
};

// รายการเมนูแนะนำอย่างง่าย (ตัวอย่าง)
const foodCatalog = [
  { name: "ข้าวผัด", calories: 520 },
  { name: "กะเพราไก่", calories: 450 },
  { name: "ต้มยำกุ้ง", calories: 320 },
  { name: "ส้มตำ", calories: 180 },
  { name: "ไก่ย่าง", calories: 220 },
  { name: "หมูทอด", calories: 380 },
  { name: "ปลาเผา", calories: 250 },
  { name: "ผัดผักรวม", calories: 200 },
  { name: "ไข่ต้ม", calories: 70 },
  { name: "โยเกิร์ต", calories: 90 },
  { name: "กล้วย", calories: 105 },
];

export default function FoodLog() {
  const { toast } = useToast();
  const { onboardingData } = useOnboarding();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const filteredFoods = foodCatalog.filter((f) => f.name.includes(query.trim())).slice(0, 8);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]); // Removed mock data
  const [isLoading, setIsLoading] = useState(false); // Added isLoading state

  const [formData, setFormData] = useState({
    log_date: new Date().toISOString().split('T')[0],
    meal_time: "",
    meal_clock_time: "",
    food_items: "",
    total_calories: "",
    total_protein: "",
    total_carbs: "",
    total_fats: "",
    total_fiber: "",
    total_vitaminC: "",
    total_vitaminD: "",
    total_calcium: "",
    total_iron: "",
    total_potassium: "",
    total_sodium: "",
    notes: ""
  });

  const addSuggestedFood = (name: string) => {
    const prefix = formData.food_items ? formData.food_items + ", " : "";
    setFormData({ ...formData, food_items: `${prefix}${name} 1 ที่` });
    setQuery("");
  };

  const mealTimes = ["เช้า", "สาย", "กลางวัน", "บ่าย", "เย็น", "ดึก", "อื่นๆ"];

  const [isEditOpen, setIsEditOpen] = useState(false);

  // ฟังก์ชันสำหรับดึงข้อมูล Food Logs จาก API
  const fetchFoodLogs = async () => {
    try {
      setIsLoading(true);
      const apiFoodLogs = await apiService.getUserFoodLogs(); // เปลี่ยนเป็น getUserFoodLogs เพื่อดึงเฉพาะข้อมูลของ user ปัจจุบัน
      
             // แปลงข้อมูลจาก API เป็นรูปแบบที่ใช้ใน component
       const convertedFoodLogs: FoodLog[] = apiFoodLogs.map((apiLog, index) => ({
         food_log_id: String(index + 1), // Temporary ID, ideally from API
         log_date: new Date(apiLog.consumed_at).toISOString().split('T')[0],
         meal_time: apiLog.meal_type === "breakfast" ? "เช้า" : 
                    apiLog.meal_type === "lunch" ? "กลางวัน" : 
                    apiLog.meal_type === "dinner" ? "เย็น" : 
                    apiLog.meal_type === "morning_snack" ? "สาย" :
                    apiLog.meal_type === "afternoon_snack" ? "บ่าย" :
                    apiLog.meal_type === "night_snack" ? "ดึก" : "อื่นๆ",
         food_items: [{ 
           name: apiLog.food_name || "อาหารทั่วไป", 
           amount: `${apiLog.serving_size || 1} ${apiLog.serving_unit || 'serving'}`, 
           calories: Number(apiLog.calories_per_serving || 0) 
         }],
         total_calories: Number(apiLog.calories_per_serving || 0),
         total_protein: Number(apiLog.protein_g || 0),
         total_carbs: Number(apiLog.carbs_g || 0),
         total_fats: Number(apiLog.fat_g || 0),
         total_fiber: Number(apiLog.fiber_g || 0),
         total_sugar: Number(apiLog.sugar_g || 0),
         total_sodium: Number(apiLog.sodium_mg || 0),
         total_vitaminC: 0, // No direct mapping from API
         total_vitaminD: 0, // No direct mapping from API
         total_calcium: 0, // No direct mapping from API
         total_iron: 0, // No direct mapping from API
         total_potassium: 0, // No direct mapping from API
         notes: apiLog.notes || ""
       }));
      
      setFoodLogs(convertedFoodLogs);
      console.log('✅ User food logs loaded from API:', convertedFoodLogs);
      
    } catch (error) {
      console.error('❌ Error fetching user food logs:', error);
      toast({ 
        title: "โหลดข้อมูลล้มเหลว", 
        description: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ดึงข้อมูลเมื่อ component โหลด
  useEffect(() => {
    fetchFoodLogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.food_items || !formData.total_calories) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกข้อมูลให้ครบถ้วน",
        variant: "destructive"
      });
      return;
    }

    if (editingId) {
      // แก้ไขบันทึกที่มีอยู่ (ยังคงใช้ local state สำหรับตอนนี้)
      const next = foodLogs.map(l => l.food_log_id === editingId ? {
        ...l,
        log_date: formData.log_date,
        meal_time: formData.meal_time,
        food_items: formData.food_items ? [{ name: formData.food_items, amount: '', calories: Number(formData.total_calories || 0) }] : l.food_items,
        total_calories: Number(formData.total_calories || 0),
        total_protein: Number(formData.total_protein || 0),
        total_carbs: Number(formData.total_carbs || 0),
        total_fats: Number(formData.total_fats || 0),
        total_fiber: Number(formData.total_fiber || 0),
        total_vitaminC: Number(formData.total_vitaminC || 0),
        total_vitaminD: Number(formData.total_vitaminD || 0),
        total_calcium: Number(formData.total_calcium || 0),
        total_iron: Number(formData.total_iron || 0),
        total_potassium: Number(formData.total_potassium || 0),
        total_sodium: Number(formData.total_sodium || 0),
        notes: formData.notes,
      } : l);
      setFoodLogs(next);
      toast({ title: "อัปเดตบันทึกแล้ว" });
    } else {
      // เพิ่มบันทึกใหม่ผ่าน API
      try {
                 // แปลงข้อมูลจาก form เป็นรูปแบบที่ API ต้องการ
         const apiData: FoodLogItem = {
           food_name: formData.food_items || "อาหารทั่วไป",
           meal_type: formData.meal_time === "เช้า" ? "breakfast" : 
                      formData.meal_time === "กลางวัน" ? "lunch" : 
                      formData.meal_time === "เย็น" ? "dinner" : 
                      formData.meal_time === "สาย" ? "morning_snack" :
                      formData.meal_time === "บ่าย" ? "afternoon_snack" :
                      formData.meal_time === "ดึก" ? "night_snack" : "other",
           serving_size: 1, // ใช้ 1 เป็น default
           serving_unit: "serving", // ใช้ "serving" แทน "calories"
           calories_per_serving: Number(formData.total_calories || 0),
          protein_g: Number(formData.total_protein || 0),
          carbs_g: Number(formData.total_carbs || 0),
          fat_g: Number(formData.total_fats || 0),
          fiber_g: Number(formData.total_fiber || 0),
          sugar_g: 0, // ไม่มีข้อมูลในฟอร์ม
          sodium_mg: Number(formData.total_sodium || 0),
          consumed_at: new Date(formData.log_date).toISOString(),
          notes: formData.notes
        };

        console.log('🍽️ Submitting food log to API:', apiData);
        
        const response = await apiService.createFoodLog(apiData);
        
        console.log('✅ API Response:', response);
        
        // เพิ่มบันทึกใหม่เข้า local state หลังจาก API สำเร็จ
        const newLog: FoodLog = {
          food_log_id: crypto.randomUUID(),
          log_date: formData.log_date,
          meal_time: formData.meal_time,
          food_items: formData.food_items ? [{ name: formData.food_items, amount: '', calories: Number(formData.total_calories || 0) }] : [],
          total_calories: Number(formData.total_calories || 0),
          total_protein: Number(formData.total_protein || 0),
          total_carbs: Number(formData.total_carbs || 0),
          total_fats: Number(formData.total_fats || 0),
          total_fiber: Number(formData.total_fiber || 0),
          total_vitaminC: Number(formData.total_vitaminC || 0),
          total_vitaminD: Number(formData.total_vitaminD || 0),
          total_calcium: Number(formData.total_calcium || 0),
          total_iron: Number(formData.total_iron || 0),
          total_potassium: Number(formData.total_potassium || 0),
          total_sodium: Number(formData.total_sodium || 0),
          notes: formData.notes,
        };
        
        // ดึงข้อมูลใหม่จาก API แทนการเพิ่มเข้า local state
        await fetchFoodLogs();
        toast({ 
          title: "บันทึกสำเร็จ", 
          description: "บันทึกข้อมูลอาหารเรียบร้อยแล้ว",
        });
        
      } catch (error) {
        console.error('❌ Error creating food log:', error);
        toast({ 
          title: "บันทึกล้มเหลว", 
          description: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
          variant: "destructive"
        });
        return; // ไม่ต้องทำอะไรต่อถ้า API ล้มเหลว
      }
    }
    
    setEditingId(null);
    setShowForm(false);
    setFormData({
      log_date: new Date().toISOString().split('T')[0],
      meal_time: "",
      meal_clock_time: "",
      food_items: "",
      total_calories: "",
      total_protein: "",
      total_carbs: "",
      total_fats: "",
      total_fiber: "",
      total_vitaminC: "",
      total_vitaminD: "",
      total_calcium: "",
      total_iron: "",
      total_potassium: "",
      total_sodium: "",
      notes: ""
    });
  };

  const getMealIcon = (mealTime: string) => {
    const mealColors = {
      "เช้า": "bg-yellow-500",
      "สาย": "bg-orange-500", 
      "กลางวัน": "bg-red-500",
      "บ่าย": "bg-purple-500",
      "เย็น": "bg-blue-500",
      "ดึก": "bg-gray-500"
    };
    return mealColors[mealTime as keyof typeof mealColors] || "bg-gray-500";
  };

  // ฟังก์ชันสำหรับตรวจสอบสถานะสารอาหาร
  const getNutritionStatus = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 90 && percentage <= 110) return "optimal";
    if (percentage < 90) return "deficient";
    if (percentage > 110) return "excessive";
    return "optimal";
  };

  const getNutritionIcon = (status: string) => {
    switch (status) {
      case "optimal": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "deficient": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "excessive": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getNutritionBadge = (status: string) => {
    switch (status) {
      case "optimal": return <Badge variant="secondary" className="bg-green-100 text-green-800">เหมาะสม</Badge>;
      case "deficient": return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">ขาด</Badge>;
      case "excessive": return <Badge variant="secondary" className="bg-red-100 text-red-800">เกิน</Badge>;
      default: return <Badge variant="secondary">เหมาะสม</Badge>;
    }
  };

  // ฟังก์ชันสำหรับทดสอบการเรียก API Food Log
  const testFoodLogAPI = async () => {
    try {
      const testData: FoodLogItem = {
        food_name: "Grilled Chicken Breast",
        meal_type: "lunch",
        serving_size: 150,
        serving_unit: "grams",
        calories_per_serving: 165,
        protein_g: 31.0,
        carbs_g: 0.0,
        fat_g: 3.6,
        fiber_g: 0.0,
        sugar_g: 0.0,
        sodium_mg: 74,
        consumed_at: "2025-09-02T12:30:00Z",
        notes: "Healthy lean protein for lunch"
      };

      console.log('🧪 Testing Food Log API with data:', testData);
      
      const response = await apiService.createFoodLog(testData);
      
      console.log('✅ API Response:', response);
      toast({ 
        title: "API Test สำเร็จ", 
        description: "การเรียก API Food Log สำเร็จแล้ว",
        variant: "default"
      });
      
    } catch (error) {
      console.error('❌ API Test Error:', error);
      toast({ 
        title: "API Test ล้มเหลว", 
        description: error instanceof Error ? error.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
        variant: "destructive"
      });
    }
  };

  // คำนวณยอดรวมโภชนาการ
  const calculateTotalNutrition = () => {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      vitaminC: 0,
      vitaminD: 0,
      calcium: 0,
      iron: 0,
      potassium: 0,
      sodium: 0,
    };

    foodLogs.forEach(log => {
      totals.calories += log.total_calories;
      totals.protein += log.total_protein;
      totals.carbs += log.total_carbs;
      totals.fats += log.total_fats;
      totals.fiber += log.total_fiber;
      totals.vitaminC += log.total_vitaminC;
      totals.vitaminD += log.total_vitaminD;
      totals.calcium += log.total_calcium;
      totals.iron += log.total_iron;
      totals.potassium += log.total_potassium;
      totals.sodium += log.total_sodium;
    });

    return totals;
  };

  const totalNutrition = calculateTotalNutrition();

  const startEdit = (log: FoodLog) => {
    setEditingId(log.food_log_id);
    setFormData({
      log_date: log.log_date,
      meal_time: log.meal_time,
      meal_clock_time: "",
      food_items: log.food_items?.map((it) => it.name).join(", "),
      total_calories: String(log.total_calories || ""),
      total_protein: String(log.total_protein || ""),
      total_carbs: String(log.total_carbs || ""),
      total_fats: String(log.total_fats || ""),
      total_fiber: String(log.total_fiber || ""),
      total_vitaminC: String(log.total_vitaminC || ""),
      total_vitaminD: String(log.total_vitaminD || ""),
      total_calcium: String(log.total_calcium || ""),
      total_iron: String(log.total_iron || ""),
      total_potassium: String(log.total_potassium || ""),
      total_sodium: String(log.total_sodium || ""),
      notes: log.notes || "",
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    const next = foodLogs.map(l => l.food_log_id === editingId ? {
      ...l,
      log_date: formData.log_date,
      meal_time: formData.meal_time,
      food_items: formData.food_items ? [{ name: formData.food_items, amount: '', calories: Number(formData.total_calories || 0) }] : l.food_items,
      total_calories: Number(formData.total_calories || 0),
      total_protein: Number(formData.total_protein || 0),
      total_carbs: Number(formData.total_carbs || 0),
      total_fats: Number(formData.total_fats || 0),
      total_fiber: Number(formData.total_fiber || 0),
      total_vitaminC: Number(formData.total_vitaminC || 0),
      total_vitaminD: Number(formData.total_vitaminD || 0),
      total_calcium: Number(formData.total_calcium || 0),
      total_iron: Number(formData.total_iron || 0),
      total_potassium: Number(formData.total_potassium || 0),
      total_sodium: Number(formData.total_sodium || 0),
      notes: formData.notes,
    } : l);
    setFoodLogs(next);
    toast({ title: "อัปเดตบันทึกแล้ว" });
    setIsEditOpen(false);
    setEditingId(null);
  };

  const deleteLog = (log: FoodLog) => {
    setFoodLogs(prev => prev.filter(l => l.food_log_id !== log.food_log_id));
    toast({ title: "ลบรายการแล้ว" });
  };

  const nutritionTargets = useMemo(() => {
    // Override with user's fiber/sodium targets if provided (>0)
    const fiberTarget = (onboardingData as any).fiberTarget && (onboardingData as any).fiberTarget > 0 ? (onboardingData as any).fiberTarget : defaultNutritionTargets.fiber.target;
    const sodiumTarget = (onboardingData as any).sodiumTarget && (onboardingData as any).sodiumTarget > 0 ? (onboardingData as any).sodiumTarget : defaultNutritionTargets.sodium.target;
    return {
      ...defaultNutritionTargets,
      fiber: { ...defaultNutritionTargets.fiber, target: fiberTarget },
      sodium: { ...defaultNutritionTargets.sodium, target: sodiumTarget },
    };
  }, [onboardingData]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">บันทึกอาหาร</h1>
            <p className="text-muted-foreground">ติดตามการรับประทานอาหารและโภชนาการ</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={testFoodLogAPI} 
              variant="outline" 
              className="flex items-center gap-2"
              title="ทดสอบการเรียก API Food Log"
            >
              <TestTube className="h-4 w-4" />
              ทดสอบ API
            </Button>
            <Button 
              onClick={fetchFoodLogs} 
              variant="outline" 
              className="flex items-center gap-2"
              disabled={isLoading}
              title="โหลดข้อมูลใหม่จากเซิร์ฟเวอร์"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              รีเฟรช
            </Button>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              <Plus className="h-4 w-4" />
              เพิ่มบันทึกอาหาร
            </Button>
          </div>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>บันทึกอาหารใหม่</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">วันที่</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.log_date}
                      onChange={(e) => setFormData({...formData, log_date: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meal_time">มื้ออาหาร</Label>
                    <Select value={formData.meal_time} onValueChange={(value) => setFormData({...formData, meal_time: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกมื้อ" />
                      </SelectTrigger>
                      <SelectContent>
                        {mealTimes.map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meal_clock_time">เวลา</Label>
                    <Input
                      id="meal_clock_time"
                      type="time"
                      value={formData.meal_clock_time}
                      onChange={(e) => setFormData({ ...formData, meal_clock_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="food_items">รายการอาหาร</Label>
                  <Textarea
                    id="food_items"
                    placeholder="เช่น ข้าวผัด 1 จาน, น้ำส้ม 1 แก้ว"
                    value={formData.food_items}
                    onChange={(e) => setFormData({...formData, food_items: e.target.value})}
                    required
                  />
                  <div className="space-y-2">
                    <Label htmlFor="food_search">ค้นหาเมนู (แนะนำ)</Label>
                    <Input id="food_search" placeholder="พิมพ์ชื่อเมนู..." value={query} onChange={(e) => setQuery(e.target.value)} />
                    {filteredFoods.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {filteredFoods.map((f) => (
                          <Button key={f.name} type="button" variant="outline" size="sm" onClick={() => addSuggestedFood(f.name)}>
                            {f.name}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Tabs defaultValue="macros" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="macros">สารอาหารหลัก</TabsTrigger>
                    <TabsTrigger value="micros">วิตามินและแร่ธาตุ</TabsTrigger>
                    <TabsTrigger value="notes">หมายเหตุ</TabsTrigger>
                  </TabsList>

                  <TabsContent value="macros" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="calories">แคลอรี</Label>
                        <Input
                          id="calories"
                          type="number"
                          placeholder="450"
                          value={formData.total_calories}
                          onChange={(e) => setFormData({...formData, total_calories: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="protein">โปรตีน (g)</Label>
                        <Input
                          id="protein"
                          type="number"
                          placeholder="25"
                          value={formData.total_protein}
                          onChange={(e) => setFormData({...formData, total_protein: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="carbs">คาร์โบ (g)</Label>
                        <Input
                          id="carbs"
                          type="number"
                          placeholder="45"
                          value={formData.total_carbs}
                          onChange={(e) => setFormData({...formData, total_carbs: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fats">ไขมัน (g)</Label>
                        <Input
                          id="fats"
                          type="number"
                          placeholder="12"
                          value={formData.total_fats}
                          onChange={(e) => setFormData({...formData, total_fats: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fiber">ไฟเบอร์ (g)</Label>
                        <Input
                          id="fiber"
                          type="number"
                          placeholder="8"
                          value={formData.total_fiber}
                          onChange={(e) => setFormData({...formData, total_fiber: e.target.value})}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="micros" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vitaminC">วิตามิน C (mg)</Label>
                        <Input
                          id="vitaminC"
                          type="number"
                          placeholder="45"
                          value={formData.total_vitaminC}
                          onChange={(e) => setFormData({...formData, total_vitaminC: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vitaminD">วิตามิน D (mcg)</Label>
                        <Input
                          id="vitaminD"
                          type="number"
                          placeholder="3"
                          value={formData.total_vitaminD}
                          onChange={(e) => setFormData({...formData, total_vitaminD: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="calcium">แคลเซียม (mg)</Label>
                        <Input
                          id="calcium"
                          type="number"
                          placeholder="180"
                          value={formData.total_calcium}
                          onChange={(e) => setFormData({...formData, total_calcium: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="iron">เหล็ก (mg)</Label>
                        <Input
                          id="iron"
                          type="number"
                          placeholder="4"
                          value={formData.total_iron}
                          onChange={(e) => setFormData({...formData, total_iron: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="potassium">โพแทสเซียม (mg)</Label>
                        <Input
                          id="potassium"
                          type="number"
                          placeholder="600"
                          value={formData.total_potassium}
                          onChange={(e) => setFormData({...formData, total_potassium: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sodium">โซเดียม (mg)</Label>
                        <Input
                          id="sodium"
                          type="number"
                          placeholder="800"
                          value={formData.total_sodium}
                          onChange={(e) => setFormData({...formData, total_sodium: e.target.value})}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="notes" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="notes">หมายเหตุ</Label>
                      <Textarea
                        id="notes"
                        placeholder="รสชาติ, ความรู้สึกหลังกิน..."
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2">
                  <Button type="submit">บันทึก</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    ยกเลิก
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Nutrition Summary */}
        <Card className="health-stat-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              สรุปโภชนาการวันนี้
            </CardTitle>
            <CardDescription>
              ข้อมูลโภชนาการรวมจากทุกมื้ออาหาร
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="macros" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="macros">สารอาหารหลัก</TabsTrigger>
                <TabsTrigger value="micros">วิตามินและแร่ธาตุ</TabsTrigger>
              </TabsList>

              <TabsContent value="macros" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                  {/* Macronutrients */}
                  <div className="space-y-4 h-full">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <Beef className="h-5 w-5" />
                      สารอาหารหลัก (Macronutrients)
                    </h4>
                    <div className="space-y-3">
                      {[
                        { key: 'protein', label: 'โปรตีน', current: totalNutrition.protein, target: nutritionTargets.protein.target, unit: 'g' },
                        { key: 'carbs', label: 'คาร์โบไฮเดรต', current: totalNutrition.carbs, target: nutritionTargets.carbs.target, unit: 'g' },
                        { key: 'fats', label: 'ไขมัน', current: totalNutrition.fats, target: nutritionTargets.fats.target, unit: 'g' },
                        { key: 'fiber', label: 'ไฟเบอร์', current: totalNutrition.fiber, target: nutritionTargets.fiber.target, unit: 'g' },
                      ].map((item) => {
                        const status = getNutritionStatus(item.current, item.target);
                        return (
                          <div key={item.key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              {getNutritionIcon(status)}
                              <div>
                                <div className="font-medium">{item.label}</div>
                                <div className="text-sm text-muted-foreground">
                                  {item.current}/{item.target} {item.unit}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getNutritionBadge(status)}
                              <div className="text-xs text-muted-foreground">
                                {status === 'deficient' ? `ขาด ${item.target - item.current} ${item.unit}` :
                                 status === 'excessive' ? `เกิน ${item.current - item.target} ${item.unit}` :
                                 'เหมาะสม'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Calories Summary (match height with macronutrients) */}
                  <div className="space-y-4 flex flex-col h-full">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <Flame className="h-5 w-5" />
                      แคลอรี่รวม
                    </h4>
                    <div className="text-center p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg flex-1 flex flex-col justify-center">
                      <div className="text-3xl font-bold text-orange-600">{totalNutrition.calories}</div>
                      <div className="text-sm text-muted-foreground">แคลอรี่</div>
                      <div className="text-xs text-muted-foreground mt-2">
                        จากเป้าหมาย 2,000 แคลอรี่
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-3">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((totalNutrition.calories / 2000) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="micros" className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  วิตามินและแร่ธาตุ (Micronutrients)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: 'vitaminC', label: 'วิตามิน C', current: totalNutrition.vitaminC, target: nutritionTargets.vitaminC.target, unit: 'mg' },
                    { key: 'vitaminD', label: 'วิตามิน D', current: totalNutrition.vitaminD, target: nutritionTargets.vitaminD.target, unit: 'mcg' },
                    { key: 'calcium', label: 'แคลเซียม', current: totalNutrition.calcium, target: nutritionTargets.calcium.target, unit: 'mg' },
                    { key: 'iron', label: 'เหล็ก', current: totalNutrition.iron, target: nutritionTargets.iron.target, unit: 'mg' },
                    { key: 'potassium', label: 'โพแทสเซียม', current: totalNutrition.potassium, target: nutritionTargets.potassium.target, unit: 'mg' },
                    { key: 'sodium', label: 'โซเดียม', current: totalNutrition.sodium, target: nutritionTargets.sodium.target, unit: 'mg' },
                  ].map((item) => {
                    const status = getNutritionStatus(item.current, item.target);
                    return (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getNutritionIcon(status)}
                          <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.current}/{item.target} {item.unit}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getNutritionBadge(status)}
                          <div className="text-xs text-muted-foreground">
                            {status === 'deficient' ? `ขาด ${item.target - item.current} ${item.unit}` :
                             status === 'excessive' ? `เกิน ${item.current - item.target} ${item.unit}` :
                             'เหมาะสม'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <h2 className="text-xl font-semibold">ประวัติการรับประทานอาหาร</h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>กำลังโหลดข้อมูล...</span>
              </div>
            </div>
          ) : foodLogs.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <Utensils className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>ยังไม่มีบันทึกอาหาร</p>
              <p className="text-sm">เริ่มต้นบันทึกอาหารมื้อแรกของคุณ</p>
            </div>
          ) : (
            foodLogs.map((log) => (
              <Card key={log.food_log_id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${getMealIcon(log.meal_time)}`}>
                        <Utensils className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">มื้อ{log.meal_time}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(log.log_date).toLocaleDateString('th-TH')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(log)}>แก้ไข</Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">ลบ</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                            <AlertDialogDescription>ต้องการลบรายการมื้อ{log.meal_time} นี้หรือไม่?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteLog(log)}>ลบ</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">รายการอาหาร:</h4>
                    <div className="space-y-1">
                      {log.food_items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.name} ({item.amount})</span>
                          <span>{item.calories} แคล</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="font-semibold text-blue-600">{log.total_protein}g</div>
                      <div className="text-blue-500">โปรตีน</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-semibold text-green-600">{log.total_carbs}g</div>
                      <div className="text-green-500">คาร์โบ</div>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <div className="font-semibold text-orange-600">{log.total_fats}g</div>
                      <div className="text-orange-500">ไขมัน</div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="font-semibold text-purple-600">{log.total_fiber}g</div>
                      <div className="text-purple-500">ไฟเบอร์</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded">
                      <div className="font-semibold text-yellow-600">{log.total_vitaminC}mg</div>
                      <div className="text-yellow-500">วิตามิน C</div>
                    </div>
                    <div className="text-center p-2 bg-indigo-50 rounded">
                      <div className="font-semibold text-indigo-600">{log.total_calcium}mg</div>
                      <div className="text-indigo-500">แคลเซียม</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded">
                      <div className="font-semibold text-red-600">{log.total_iron}mg</div>
                      <div className="text-red-500">เหล็ก</div>
                    </div>
                  </div>
                  
                  {log.notes && (
                    <div className="mt-3 p-2 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">{log.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>แก้ไขบันทึกอาหาร</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_date">วันที่</Label>
                  <Input id="edit_date" type="date" value={formData.log_date} onChange={(e)=>setFormData({...formData, log_date: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_meal">มื้ออาหาร</Label>
                  <Select value={formData.meal_time} onValueChange={(value)=>setFormData({...formData, meal_time: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกมื้อ" />
                    </SelectTrigger>
                    <SelectContent>
                      {mealTimes.map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_time">เวลา</Label>
                  <Input id="edit_time" type="time" value={formData.meal_clock_time} onChange={(e)=>setFormData({...formData, meal_clock_time: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_items">รายการอาหาร</Label>
                <Textarea id="edit_items" value={formData.food_items} onChange={(e)=>setFormData({...formData, food_items: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_cal">แคลอรี</Label>
                  <Input id="edit_cal" type="number" value={formData.total_calories} onChange={(e)=>setFormData({...formData, total_calories: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_pro">โปรตีน (g)</Label>
                  <Input id="edit_pro" type="number" value={formData.total_protein} onChange={(e)=>setFormData({...formData, total_protein: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_carbs">คาร์โบ (g)</Label>
                  <Input id="edit_carbs" type="number" value={formData.total_carbs} onChange={(e)=>setFormData({...formData, total_carbs: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_fats">ไขมัน (g)</Label>
                  <Input id="edit_fats" type="number" value={formData.total_fats} onChange={(e)=>setFormData({...formData, total_fats: e.target.value})} />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={()=>setIsEditOpen(false)}>ยกเลิก</Button>
                <Button type="submit">บันทึก</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}