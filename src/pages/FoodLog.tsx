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
  Search,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { apiService, FoodLogItem } from "@/services/api";

// ฟังก์ชันสำหรับจัดการวันที่โดยไม่ให้เลื่อนไป 1 วัน
const getLocalDateString = (date?: Date | string) => {
  const targetDate = date ? new Date(date) : new Date();
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ฟังก์ชันสำหรับแสดงผลวันที่ในรูปแบบไทย
const getThaiDateString = (date?: Date | string) => {
  const targetDate = date ? new Date(date) : new Date();
  return targetDate.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// ฟังก์ชันสำหรับแปลงวันที่ท้องถิ่นเป็น ISO string โดยไม่ให้เลื่อนไป 1 วัน
const getLocalISOString = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // สร้างวันที่ใหม่โดยใช้ local time components
  const localDate = new Date(year, month, day, 12, 0, 0, 0);
  return localDate.toISOString();
};

// ฟังก์ชันสำหรับคำนวณช่วงวันที่ตามช่วงเวลาที่เลือก
const getDateRange = (period: 'today' | 'week' | 'month') => {
  const today = new Date();
  const todayString = getLocalDateString(today);
  
  switch (period) {
    case 'today':
      return { start: todayString, end: todayString };
    
    case 'week':
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // เริ่มจากวันอาทิตย์
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // จบที่วันเสาร์
      return {
        start: getLocalDateString(startOfWeek),
        end: getLocalDateString(endOfWeek)
      };
    
    case 'month':
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return {
        start: getLocalDateString(startOfMonth),
        end: getLocalDateString(endOfMonth)
      };
    
    default:
      return { start: todayString, end: todayString };
  }
};

// ฟังก์ชันสำหรับตรวจสอบว่าวันที่อยู่ในช่วงที่กำหนดหรือไม่
const isDateInRange = (dateString: string, startDate: string, endDate: string) => {
  return dateString >= startDate && dateString <= endDate;
};

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
  total_sugar: number;
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

// ฟังก์ชันสำหรับคำนวณแคลอรี่จากสารอาหารหลัก
const calculateCaloriesFromMacros = (protein: number, carbs: number, fats: number) => {
  // สูตรคำนวณแคลอรี่: โปรตีน 4 แคล/กรัม, คาร์โบ 4 แคล/กรัม, ไขมัน 9 แคล/กรัม
  return (protein * 4) + (carbs * 4) + (fats * 9);
};

// ฟังก์ชันสำหรับอัปเดตแคลอรี่อัตโนมัติเมื่อมีการเปลี่ยนแปลงสารอาหารหลัก
const updateCaloriesFromMacros = (protein: string, carbs: string, fats: string) => {
  const proteinNum = Number(protein) || 0;
  const carbsNum = Number(carbs) || 0;
  const fatsNum = Number(fats) || 0;
  const calculatedCalories = calculateCaloriesFromMacros(proteinNum, carbsNum, fatsNum);
  return calculatedCalories;
};

export default function FoodLog() {
  const { toast } = useToast();
  const { onboardingData } = useOnboarding();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const filteredFoods = foodCatalog.filter((f) => f.name.includes(query.trim())).slice(0, 8);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]); // Removed mock data
  const [isLoading, setIsLoading] = useState(false); // Added isLoading state
  const [deletingId, setDeletingId] = useState<string | null>(null); // Added deletingId state for delete loading
  const [updatingId, setUpdatingId] = useState<string | null>(null); // Added updatingId state for update loading
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today'); // เพิ่ม state สำหรับเลือกช่วงเวลา

  const [formData, setFormData] = useState({
    log_date: getLocalDateString(),
    meal_time: "",
    meal_clock_time: "",
    food_items: "",
    total_calories: "",
    total_protein: "",
    total_carbs: "",
    total_fats: "",
    total_fiber: "",
    total_sugar: "",
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
    const foodItem = foodCatalog.find(f => f.name === name);
    const suggestedCalories = foodItem ? foodItem.calories : 0;
    
    setFormData({ 
      ...formData, 
      food_items: `${prefix}${name} 1 ที่`,
      total_calories: String(suggestedCalories)
    });
    setQuery("");
  };

  const mealTimes = ["เช้า", "กลางวัน", "เย็น", "ของว่าง"];

  const [isEditOpen, setIsEditOpen] = useState(false);

  // ฟังก์ชันสำหรับดึงข้อมูล Food Logs จาก API
  const fetchFoodLogs = async () => {
    try {
      setIsLoading(true);
      const apiFoodLogs = await apiService.getUserFoodLogs(); // เปลี่ยนเป็น getUserFoodLogs เพื่อดึงเฉพาะข้อมูลของ user ปัจจุบัน
      
             // แปลงข้อมูลจาก API เป็นรูปแบบที่ใช้ใน component
       const convertedFoodLogs: FoodLog[] = apiFoodLogs.map((apiLog, index) => {
         // Check for different possible ID field names
         const actualId = apiLog.id || apiLog._id || apiLog.uuid || apiLog.food_log_id;
         console.log('🔍 Processing API log:', { 
           apiLog, 
           hasId: !!actualId, 
           id: actualId,
           possibleIds: { id: apiLog.id, _id: apiLog._id, uuid: apiLog.uuid, food_log_id: apiLog.food_log_id }
         });
         return {
           food_log_id: actualId || String(index + 1), // Use actual database ID from API
         log_date: getLocalDateString(apiLog.consumed_at),
                             meal_time: apiLog.meal_type === "breakfast" ? "เช้า" : 
                      apiLog.meal_type === "lunch" ? "กลางวัน" : 
                      apiLog.meal_type === "dinner" ? "เย็น" : 
                      apiLog.meal_type === "snack" ? "ของว่าง" : "ของว่าง",
         food_items: [{ 
           name: apiLog.food_name || "อาหารทั่วไป", 
           amount: `${apiLog.serving_size || 1} ${apiLog.serving_unit || 'serving'}`, 
           calories: Number(apiLog.calories_per_serving || 0) || calculateCaloriesFromMacros(
             Number(apiLog.protein_g || 0),
             Number(apiLog.carbs_g || 0),
             Number(apiLog.fat_g || 0)
           )
         }],
         total_calories: Number(apiLog.calories_per_serving || 0) || calculateCaloriesFromMacros(
           Number(apiLog.protein_g || 0),
           Number(apiLog.carbs_g || 0),
           Number(apiLog.fat_g || 0)
         ),
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
       };
       });
      
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
    
    if (!formData.food_items) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกข้อมูลให้ครบถ้วน",
        variant: "destructive"
      });
      return;
    }

    // คำนวณแคลอรี่จากสารอาหารหลักหากไม่มีข้อมูลแคลอรี่
    let finalCalories = Number(formData.total_calories) || 0;
    if (finalCalories === 0) {
      finalCalories = calculateCaloriesFromMacros(
        Number(formData.total_protein) || 0,
        Number(formData.total_carbs) || 0,
        Number(formData.total_fats) || 0
      );
    }

    if (editingId) {
      // แก้ไขบันทึกที่มีอยู่ (ยังคงใช้ local state สำหรับตอนนี้)
             const next = foodLogs.map(l => l.food_log_id === editingId ? {
         ...l,
         log_date: formData.log_date,
         meal_time: formData.meal_time,
         food_items: formData.food_items ? [{ name: formData.food_items, amount: '', calories: finalCalories }] : l.food_items,
         total_calories: finalCalories,
         total_protein: Number(formData.total_protein || 0),
         total_carbs: Number(formData.total_carbs || 0),
         total_fats: Number(formData.total_fats || 0),
         total_fiber: Number(formData.total_fiber || 0),
         total_sugar: Number(formData.total_sugar || 0),
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
                       formData.meal_time === "ของว่าง" ? "snack" : "snack",
           serving_size: 1, // ใช้ 1 เป็น default
           serving_unit: "serving", // ใช้ "serving" แทน "calories"
           calories_per_serving: finalCalories,
                     protein_g: Number(formData.total_protein || 0),
           carbs_g: Number(formData.total_carbs || 0),
           fat_g: Number(formData.total_fats || 0),
           fiber_g: Number(formData.total_fiber || 0),
           sugar_g: Number(formData.total_sugar || 0),
           sodium_mg: Number(formData.total_sodium || 0),
          consumed_at: getLocalISOString(formData.log_date),
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
           food_items: formData.food_items ? [{ name: formData.food_items, amount: '', calories: finalCalories }] : [],
           total_calories: finalCalories,
           total_protein: Number(formData.total_protein || 0),
           total_carbs: Number(formData.total_carbs || 0),
           total_fats: Number(formData.total_fats || 0),
           total_fiber: Number(formData.total_fiber || 0),
           total_sugar: Number(formData.total_sugar || 0),
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
         log_date: getLocalDateString(),
         meal_time: "",
         meal_clock_time: "",
         food_items: "",
         total_calories: "",
         total_protein: "",
         total_carbs: "",
         total_fats: "",
         total_fiber: "",
         total_sugar: "",
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
       "กลางวัน": "bg-red-500",
       "เย็น": "bg-blue-500",
       "ของว่าง": "bg-purple-500"
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

     // ฟังก์ชันสำหรับทดสอบการแปลงมื้ออาหาร
   const testMealTimeConversion = () => {
     console.log('🧪 Testing meal time conversion:');
     
     const testMealTimes = ["เช้า", "กลางวัน", "เย็น", "ของว่าง"];
     
     testMealTimes.forEach(mealTime => {
       const converted = mealTime === "เช้า" ? "breakfast" : 
                        mealTime === "กลางวัน" ? "lunch" : 
                        mealTime === "เย็น" ? "dinner" : 
                        mealTime === "ของว่าง" ? "snack" : "snack";
       
       console.log(`  ${mealTime} → ${converted}`);
     });
   };

  // คำนวณยอดรวมโภชนาการตามช่วงเวลาที่เลือก
     const calculateTotalNutrition = () => {
     const dateRange = getDateRange(selectedPeriod);
     const totals = {
       calories: 0,
       protein: 0,
       carbs: 0,
       fats: 0,
       fiber: 0,
       sugar: 0,
       vitaminC: 0,
       vitaminD: 0,
       calcium: 0,
       iron: 0,
       potassium: 0,
       sodium: 0,
     };

     // คำนวณเฉพาะบันทึกอาหารในช่วงเวลาที่เลือก
     const filteredLogs = foodLogs.filter(log => {
       return isDateInRange(log.log_date, dateRange.start, dateRange.end);
     });
     
     filteredLogs.forEach(log => {
       totals.calories += log.total_calories;
       totals.protein += log.total_protein;
       totals.carbs += log.total_carbs;
       totals.fats += log.total_fats;
       totals.fiber += log.total_fiber;
       totals.sugar += log.total_sugar;
       totals.vitaminC += log.total_vitaminC;
       totals.vitaminD += log.total_vitaminD;
       totals.calcium += log.total_calcium;
       totals.iron += log.total_iron;
       totals.potassium += log.total_potassium;
       totals.sodium += log.total_sodium;
     });

     return totals;
   };

  // ฟังก์ชันคำนวณเป้าหมายโภชนาการตามช่วงเวลา
  const getNutritionTargetsForPeriod = (period: 'today' | 'week' | 'month') => {
    const multiplier = period === 'week' ? 7 : period === 'month' ? 30 : 1;
    return {
      protein: nutritionTargets.protein.target * multiplier,
      carbs: nutritionTargets.carbs.target * multiplier,
      fats: nutritionTargets.fats.target * multiplier,
      fiber: nutritionTargets.fiber.target * multiplier,
      vitaminC: nutritionTargets.vitaminC.target * multiplier,
      vitaminD: nutritionTargets.vitaminD.target * multiplier,
      calcium: nutritionTargets.calcium.target * multiplier,
      iron: nutritionTargets.iron.target * multiplier,
      potassium: nutritionTargets.potassium.target * multiplier,
      sodium: nutritionTargets.sodium.target * multiplier,
    };
  };

  const totalNutrition = calculateTotalNutrition();

  const startEdit = (log: FoodLog) => {
    setEditingId(log.food_log_id);
    // คำนวณแคลอรี่จากสารอาหารหลักหากไม่มีข้อมูลแคลอรี่
    const calculatedCalories = log.total_calories || calculateCaloriesFromMacros(
      log.total_protein || 0,
      log.total_carbs || 0,
      log.total_fats || 0
    );
    
    setFormData({
      log_date: log.log_date,
      meal_time: log.meal_time,
      meal_clock_time: "",
      food_items: log.food_items?.map((it) => it.name).join(", "),
      total_calories: String(calculatedCalories),
      total_protein: String(log.total_protein || ""),
      total_carbs: String(log.total_carbs || ""),
      total_fats: String(log.total_fats || ""),
      total_fiber: String(log.total_fiber || ""),
      total_sugar: String(log.total_sugar || ""),
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    
    try {
      // คำนวณแคลอรี่จากสารอาหารหลักหากไม่มีข้อมูลแคลอรี่
      let finalCalories = Number(formData.total_calories) || 0;
      if (finalCalories === 0) {
        finalCalories = calculateCaloriesFromMacros(
          Number(formData.total_protein) || 0,
          Number(formData.total_carbs) || 0,
          Number(formData.total_fats) || 0
        );
      }
      
             // เตรียมข้อมูลสำหรับส่งไปยัง API
               const updateData = {
          food_name: formData.food_items || "อาหารทั่วไป",
          meal_type: formData.meal_time === "เช้า" ? "breakfast" : 
                     formData.meal_time === "กลางวัน" ? "lunch" : 
                     formData.meal_time === "เย็น" ? "dinner" : 
                     formData.meal_time === "ของว่าง" ? "snack" : "snack",
         serving_size: 1,
         serving_unit: "serving",
         calories_per_serving: finalCalories,
         protein_g: Number(formData.total_protein || 0),
         carbs_g: Number(formData.total_carbs || 0),
         fat_g: Number(formData.total_fats || 0),
         fiber_g: Number(formData.total_fiber || 0),
         sugar_g: Number(formData.total_sugar || 0),
         sodium_mg: Number(formData.total_sodium || 0),
         consumed_at: getLocalISOString(formData.log_date),
         notes: formData.notes || ""
       };
      
      console.log('✏️ Updating food log with data:', { editingId, updateData });
      
      // เริ่ม loading state
      setUpdatingId(editingId);
      
      // เรียก API เพื่ออัปเดตข้อมูลในฐานข้อมูล
      await apiService.updateFoodLog(editingId, updateData);
      
             // อัปเดต local state หลังจาก API สำเร็จ
       const next = foodLogs.map(l => l.food_log_id === editingId ? {
         ...l,
         log_date: formData.log_date,
         meal_time: formData.meal_time,
         food_items: formData.food_items ? [{ name: formData.food_items, amount: '', calories: finalCalories }] : l.food_items,
         total_calories: finalCalories,
         total_protein: Number(formData.total_protein || 0),
         total_carbs: Number(formData.total_carbs || 0),
         total_fats: Number(formData.total_fats || 0),
         total_fiber: Number(formData.total_fiber || 0),
         total_sugar: Number(formData.total_sugar || 0),
         total_vitaminC: Number(formData.total_vitaminC || 0),
         total_vitaminD: Number(formData.total_vitaminD || 0),
         total_calcium: Number(formData.total_calcium || 0),
         total_iron: Number(formData.total_iron || 0),
         total_potassium: Number(formData.total_potassium || 0),
         total_sodium: Number(formData.total_sodium || 0),
         notes: formData.notes,
       } : l);
      setFoodLogs(next);
      
      toast({ 
        title: "อัปเดตบันทึกแล้ว", 
        description: "อัปเดตรายการอาหารในฐานข้อมูลเรียบร้อยแล้ว"
      });
      
      setIsEditOpen(false);
      setEditingId(null);
      
    } catch (error) {
      console.error('❌ Error updating food log:', error);
      toast({ 
        title: "อัปเดตล้มเหลว", 
        description: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการอัปเดตข้อมูล",
        variant: "destructive"
      });
    } finally {
      setUpdatingId(null); // หยุด loading state
    }
  };

  const deleteLog = async (log: FoodLog) => {
    try {
      console.log('🗑️ Attempting to delete food log:', { log, food_log_id: log.food_log_id });
      setDeletingId(log.food_log_id); // เริ่ม loading state
      
      // เรียก API เพื่อลบข้อมูลในฐานข้อมูล
      await apiService.deleteFoodLog(log.food_log_id);
      
      // ลบออกจาก local state หลังจาก API สำเร็จ
      setFoodLogs(prev => prev.filter(l => l.food_log_id !== log.food_log_id));
      
      toast({ 
        title: "ลบรายการแล้ว", 
        description: "ลบรายการอาหารเรียบร้อยแล้ว"
      });
      
    } catch (error) {
      console.error('❌ Error deleting food log:', error);
      toast({ 
        title: "ลบรายการล้มเหลว", 
        description: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการลบข้อมูล",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null); // หยุด loading state
    }
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
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Utensils className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-primary">บันทึกอาหาร</h1>
              </div>
              <p className="text-muted-foreground ml-12">ติดตามการรับประทานอาหารและโภชนาการ</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={fetchFoodLogs} 
                disabled={isLoading}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'กำลังโหลด...' : 'รีเฟรช'}
              </Button>
              <Button 
                onClick={() => setShowForm(!showForm)} 
                className="gap-2"
              >
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="calories">แคลอรี</Label>
                        <Input
                          id="calories"
                          type="number"
                          placeholder="450"
                          value={formData.total_calories}
                          onChange={(e) => setFormData({...formData, total_calories: e.target.value})}
                        />
                        <p className="text-xs text-muted-foreground">
                          แคลอรี่จะถูกคำนวณอัตโนมัติจากโปรตีน คาร์โบ และไขมัน
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="protein">โปรตีน (g)</Label>
                        <Input
                          id="protein"
                          type="number"
                          placeholder="25"
                          value={formData.total_protein}
                          onChange={(e) => {
                            const newProtein = e.target.value;
                            const calculatedCalories = updateCaloriesFromMacros(newProtein, formData.total_carbs, formData.total_fats);
                            setFormData({
                              ...formData, 
                              total_protein: newProtein,
                              total_calories: String(calculatedCalories)
                            });
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="carbs">คาร์โบ (g)</Label>
                        <Input
                          id="carbs"
                          type="number"
                          placeholder="45"
                          value={formData.total_carbs}
                          onChange={(e) => {
                            const newCarbs = e.target.value;
                            const calculatedCalories = updateCaloriesFromMacros(formData.total_protein, newCarbs, formData.total_fats);
                            setFormData({
                              ...formData, 
                              total_carbs: newCarbs,
                              total_calories: String(calculatedCalories)
                            });
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fats">ไขมัน (g)</Label>
                        <Input
                          id="fats"
                          type="number"
                          placeholder="12"
                          value={formData.total_fats}
                          onChange={(e) => {
                            const newFats = e.target.value;
                            const calculatedCalories = updateCaloriesFromMacros(formData.total_protein, formData.total_carbs, newFats);
                            setFormData({
                              ...formData, 
                              total_fats: newFats,
                              total_calories: String(calculatedCalories)
                            });
                          }}
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
                      
                      <div className="space-y-2">
                        <Label htmlFor="sugar">น้ำตาล (g)</Label>
                        <Input
                          id="sugar"
                          type="number"
                          placeholder="12"
                          value={formData.total_sugar}
                          onChange={(e) => setFormData({...formData, total_sugar: e.target.value})}
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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    สรุปโภชนาการ
                  </CardTitle>
                  <CardDescription>
                    ข้อมูลโภชนาการรวมจากทุกมื้ออาหาร
                    {selectedPeriod === 'today' && ` ในวันนี้ (${getThaiDateString()})`}
                    {selectedPeriod === 'week' && ` ในสัปดาห์นี้`}
                    {selectedPeriod === 'month' && ` ในเดือนนี้`}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="period-select" className="text-sm font-medium">ช่วงเวลา:</Label>
                  <Select value={selectedPeriod} onValueChange={(value: 'today' | 'week' | 'month') => setSelectedPeriod(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">วันนี้</SelectItem>
                      <SelectItem value="week">สัปดาห์นี้</SelectItem>
                      <SelectItem value="month">เดือนนี้</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
                       {(() => {
                         const periodTargets = getNutritionTargetsForPeriod(selectedPeriod);
                         return [
                           { key: 'protein', label: 'โปรตีน', current: totalNutrition.protein, target: periodTargets.protein, unit: 'g' },
                           { key: 'carbs', label: 'คาร์โบไฮเดรต', current: totalNutrition.carbs, target: periodTargets.carbs, unit: 'g' },
                           { key: 'fats', label: 'ไขมัน', current: totalNutrition.fats, target: periodTargets.fats, unit: 'g' },
                           { key: 'fiber', label: 'ไฟเบอร์', current: totalNutrition.fiber, target: periodTargets.fiber, unit: 'g' },
                           { key: 'sugar', label: 'น้ำตาล', current: totalNutrition.sugar, target: 50 * (selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 1), unit: 'g' },
                         ];
                       })().map((item) => {
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
                     <h4 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                       <div className="p-2 bg-primary/10 rounded-lg">
                         <Flame className="h-5 w-5 text-primary" />
                       </div>
                       แคลอรี่รวม
                     </h4>
                     <div className="text-center p-6 bg-muted/30 rounded-lg border flex-1 flex flex-col justify-center">
                       <div className="text-4xl font-bold text-primary mb-2">
                         {totalNutrition.calories}
                       </div>
                       <div className="text-lg font-semibold text-foreground mb-3">แคลอรี่</div>
                       <div className="text-sm text-muted-foreground mb-4">
                         จากเป้าหมาย 2,000 แคลอรี่
                       </div>
                       <div className="w-full bg-muted rounded-full h-2 mb-2">
                         <div
                           className="bg-primary h-2 rounded-full transition-all duration-500"
                           style={{ width: `${Math.min((totalNutrition.calories / 2000) * 100, 100)}%` }}
                         />
                       </div>
                       <div className="text-xs text-muted-foreground">
                         {Math.round((totalNutrition.calories / 2000) * 100)}% ของเป้าหมาย
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
                  {(() => {
                    const periodTargets = getNutritionTargetsForPeriod(selectedPeriod);
                    return [
                      { key: 'vitaminC', label: 'วิตามิน C', current: totalNutrition.vitaminC, target: periodTargets.vitaminC, unit: 'mg' },
                      { key: 'vitaminD', label: 'วิตามิน D', current: totalNutrition.vitaminD, target: periodTargets.vitaminD, unit: 'mcg' },
                      { key: 'calcium', label: 'แคลเซียม', current: totalNutrition.calcium, target: periodTargets.calcium, unit: 'mg' },
                      { key: 'iron', label: 'เหล็ก', current: totalNutrition.iron, target: periodTargets.iron, unit: 'mg' },
                      { key: 'potassium', label: 'โพแทสเซียม', current: totalNutrition.potassium, target: periodTargets.potassium, unit: 'mg' },
                      { key: 'sodium', label: 'โซเดียม', current: totalNutrition.sodium, target: periodTargets.sodium, unit: 'mg' },
                    ];
                  })().map((item) => {
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

                 <div className="grid gap-6">
           <div className="text-center">
             <h2 className="text-2xl font-bold text-foreground mb-2">
               ประวัติการรับประทานอาหาร
             </h2>
             <p className="text-muted-foreground">ติดตามมื้ออาหารและโภชนาการของคุณ</p>
           </div>
          
                     {isLoading ? (
             <Card>
               <CardContent className="p-12">
                 <div className="flex items-center justify-center">
                   <div className="text-center">
                     <div className="p-3 bg-primary/10 rounded-lg w-12 h-12 mx-auto mb-4">
                       <RefreshCw className="h-6 w-6 mx-auto text-primary animate-spin" />
                     </div>
                     <h3 className="text-lg font-semibold text-foreground mb-2">กำลังโหลดข้อมูล...</h3>
                     <p className="text-muted-foreground">กรุณารอสักครู่</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
                     ) : foodLogs.length === 0 ? (
             <Card className="border-dashed border-2 border-muted-foreground/20">
               <CardContent className="p-8 text-center">
                 <div className="flex flex-col items-center gap-4">
                   <div className="p-3 bg-muted/30 rounded-lg">
                     <Utensils className="h-8 w-8 text-muted-foreground" />
                   </div>
                   <div className="space-y-2">
                     <h3 className="text-lg font-medium text-foreground">เริ่มต้นบันทึกอาหารของคุณ</h3>
                     <p className="text-sm text-muted-foreground max-w-md">
                       เริ่มต้นบันทึกอาหารมื้อแรกของคุณเพื่อติดตามโภชนาการ
                     </p>
                   </div>
                   <Button 
                     onClick={() => setShowForm(true)} 
                     className="gap-2"
                   >
                     <Plus className="h-4 w-4" />
                     เพิ่มบันทึกอาหาร
                   </Button>
                 </div>
               </CardContent>
             </Card>
          ) : (
                         foodLogs.map((log) => (
               <Card key={log.food_log_id} className="border border-border hover:shadow-md transition-shadow duration-200">
                 <CardContent className="p-6">
                                     <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-primary/10 rounded-lg">
                         <Utensils className="h-5 w-5 text-primary" />
                       </div>
                       <div>
                         <h3 className="text-lg font-semibold text-foreground">มื้อ{log.meal_time}</h3>
                         <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                           <Calendar className="h-3 w-3" />
                           {getThaiDateString(log.log_date)}
                         </div>
                       </div>
                     </div>
                     
                     <div className="flex items-center gap-2">
                                               <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => startEdit(log)}
                          className="h-8 px-3 border-primary/20 hover:border-primary/40"
                          disabled={deletingId === log.food_log_id}
                        >
                          แก้ไข
                        </Button>
                       <AlertDialog>
                         <AlertDialogTrigger asChild>
                                                       <Button 
                              variant="destructive" 
                              size="sm"
                              className="h-8 px-3"
                              disabled={deletingId === log.food_log_id}
                            >
                              {deletingId === log.food_log_id ? (
                                <>
                                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                  ลบ...
                                </>
                              ) : (
                                'ลบ'
                              )}
                            </Button>
                         </AlertDialogTrigger>
                         <AlertDialogContent>
                           <AlertDialogHeader>
                             <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                             <AlertDialogDescription>ต้องการลบรายการมื้อ{log.meal_time} นี้หรือไม่?</AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter>
                             <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                                           <AlertDialogAction onClick={() => deleteLog(log)}>
                                ลบ
                              </AlertDialogAction>
                           </AlertDialogFooter>
                         </AlertDialogContent>
                       </AlertDialog>
                     </div>
                   </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2 text-foreground">รายการอาหาร:</h4>
                    <div className="space-y-2">
                      {log.food_items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border">
                          <span className="text-sm font-medium text-foreground">{item.name} ({item.amount})</span>
                          <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{item.calories} แคล</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-3 text-foreground">สารอาหารหลัก:</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-muted/30 rounded-lg border">
                        <div className="text-lg font-bold text-foreground">{log.total_protein}g</div>
                        <div className="text-xs text-muted-foreground font-medium">โปรตีน</div>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg border">
                        <div className="text-lg font-bold text-foreground">{log.total_carbs}g</div>
                        <div className="text-xs text-muted-foreground font-medium">คาร์โบ</div>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg border">
                        <div className="text-lg font-bold text-foreground">{log.total_fats}g</div>
                        <div className="text-xs text-muted-foreground font-medium">ไขมัน</div>
                      </div>
                    </div>
                  </div>

                                     <div className="mt-4">
                     <h4 className="text-sm font-medium mb-3 text-foreground">สารอาหารอื่นๆ:</h4>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                       {log.total_fiber > 0 && (
                         <div className="text-center p-2 bg-muted/30 rounded-lg border">
                           <div className="text-sm font-bold text-foreground">{log.total_fiber}g</div>
                           <div className="text-xs text-muted-foreground font-medium">ไฟเบอร์</div>
                         </div>
                       )}
                       {log.total_sugar > 0 && (
                         <div className="text-center p-2 bg-muted/30 rounded-lg border">
                           <div className="text-sm font-bold text-foreground">{log.total_sugar}g</div>
                           <div className="text-xs text-muted-foreground font-medium">น้ำตาล</div>
                         </div>
                       )}
                       {log.total_sodium > 0 && (
                         <div className="text-center p-2 bg-muted/30 rounded-lg border">
                           <div className="text-sm font-bold text-foreground">{log.total_sodium}mg</div>
                           <div className="text-xs text-muted-foreground font-medium">โซเดียม</div>
                         </div>
                       )}
                     </div>
                   </div>
                  
                  {log.notes && (
                    <div className="mt-3 p-3 bg-muted/20 rounded-lg border">
                      <p className="text-sm text-foreground">{log.notes}</p>
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
                   <p className="text-xs text-muted-foreground">
                     แคลอรี่จะถูกคำนวณอัตโนมัติจากโปรตีน คาร์โบ และไขมัน
                   </p>
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="edit_pro">โปรตีน (g)</Label>
                   <Input id="edit_pro" type="number" value={formData.total_protein} onChange={(e) => {
                     const newProtein = e.target.value;
                     const calculatedCalories = updateCaloriesFromMacros(newProtein, formData.total_carbs, formData.total_fats);
                     setFormData({
                       ...formData, 
                       total_protein: newProtein,
                       total_calories: String(calculatedCalories)
                     });
                   }} />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="edit_carbs">คาร์โบ (g)</Label>
                   <Input id="edit_carbs" type="number" value={formData.total_carbs} onChange={(e) => {
                     const newCarbs = e.target.value;
                     const calculatedCalories = updateCaloriesFromMacros(formData.total_protein, newCarbs, formData.total_fats);
                     setFormData({
                       ...formData, 
                       total_carbs: newCarbs,
                       total_calories: String(calculatedCalories)
                     });
                   }} />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="edit_fats">ไขมัน (g)</Label>
                   <Input id="edit_fats" type="number" value={formData.total_fats} onChange={(e) => {
                     const newFats = e.target.value;
                     const calculatedCalories = updateCaloriesFromMacros(formData.total_protein, formData.total_carbs, newFats);
                     setFormData({
                       ...formData, 
                       total_fats: newFats,
                       total_calories: String(calculatedCalories)
                     });
                   }} />
                 </div>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="edit_fiber">ไฟเบอร์ (g)</Label>
                   <Input id="edit_fiber" type="number" value={formData.total_fiber} onChange={(e)=>setFormData({...formData, total_fiber: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="edit_sugar">น้ำตาล (g)</Label>
                   <Input id="edit_sugar" type="number" value={formData.total_sugar || ""} onChange={(e)=>setFormData({...formData, total_sugar: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="edit_sodium">โซเดียม (mg)</Label>
                   <Input id="edit_sodium" type="number" value={formData.total_sodium} onChange={(e)=>setFormData({...formData, total_sodium: e.target.value})} />
                 </div>
               </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={()=>setIsEditOpen(false)} disabled={updatingId === editingId}>
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={updatingId === editingId}>
                  {updatingId === editingId ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังอัปเดต...
                    </>
                  ) : (
                    'บันทึก'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}