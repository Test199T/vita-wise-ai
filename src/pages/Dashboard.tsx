import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { HealthCard } from "@/components/health/HealthCard";
import { HealthChart } from "@/components/health/HealthChart";
import { EnhancedHealthChart } from "@/components/health/EnhancedHealthChart";
import { SleepChart } from "@/components/health/SleepChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// lucide-react kept for inlined status icons/badges; main tiles use Iconify via HealthCard
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, MessageCircle, Calendar, Pill, BarChart3, Target, Clock, LineChart, Dumbbell, Flame, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { tokenUtils } from "@/lib/utils";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

// ฟังก์ชันสำหรับจัดการวันที่โดยไม่ให้เลื่อนไป 1 วัน
const getLocalDateString = (date?: Date | string) => {
  const targetDate = date ? new Date(date) : new Date();
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

// จำลองข้อมูลสุขภาพ (ส่วนที่ไม่เกี่ยวกับอาหาร)
const mockHealthData = {
  sleep: { hours: 0, trend: "stable", target: 8 },
  water: { liters: 0, trend: "stable", target: 2.5 },
  exercise: { minutes: 35, trend: "up", target: 45 },
};

// ข้อมูลโภชนาการ (ค่าเป้าหมาย)
const nutritionTargets = {
  protein: 80,
  carbs: 250,
  fats: 65,
  fiber: 25,
  vitaminC: 90,
  vitaminD: 15,
  calcium: 1000,
  iron: 18,
  potassium: 3500,
  sodium: 2300,
};

const sleepData = [
  { name: "จันทร์", value: 0 },
  { name: "อังคาร", value: 0 },
  { name: "พุธ", value: 0 },
  { name: "พฤหัส", value: 0 },
  { name: "ศุกร์", value: 0 },
  { name: "เสาร์", value: 0 },
  { name: "อาทิตย์", value: 0 },
];

const exerciseData = [
  { name: "จันทร์", value: 0 },
  { name: "อังคาร", value: 0 },
  { name: "พุธ", value: 0 },
  { name: "พฤหัส", value: 0 },
  { name: "ศุกร์", value: 0 },
  { name: "เสาร์", value: 0 },
  { name: "อาทิตย์", value: 0 },
];

const waterData = [
  { name: "จันทร์", value: 0 },
  { name: "อังคาร", value: 0 },
  { name: "พุธ", value: 0 },
  { name: "พฤหัส", value: 0 },
  { name: "ศุกร์", value: 0 },
  { name: "เสาร์", value: 0 },
  { name: "อาทิตย์", value: 0 },
];

// สร้างข้อมูลโปรตีนรายสัปดาห์ในเดือน
const generateWeeklyProteinData = (foodLogs?: any[]) => {
  const weeks = ["สัปดาห์ 1", "สัปดาห์ 2", "สัปดาห์ 3", "สัปดาห์ 4"];


  if (!foodLogs || foodLogs.length === 0) {
    return weeks.map(week => ({ name: week, value: 0 }));
  }

  // สร้าง map สำหรับแมปสัปดาห์กับข้อมูล
  const weekToDataMap = new Map();

  // คำนวณโปรตีนรวมตามสัปดาห์
  foodLogs.forEach((log) => {
    if (log.consumed_at) {
      const date = new Date(log.consumed_at);
      const dayOfMonth = date.getDate();

      // หาสัปดาห์ที่ (1-4) โดยใช้การคำนวณที่แม่นยำ
      let weekNumber;
      if (dayOfMonth <= 7) {
        weekNumber = 1;
      } else if (dayOfMonth <= 14) {
        weekNumber = 2;
      } else if (dayOfMonth <= 21) {
        weekNumber = 3;
      } else {
        weekNumber = 4;
      }

      const weekIndex = weekNumber - 1; // 0-3 สำหรับสัปดาห์ 1-4

      // รวมโปรตีนในสัปดาห์เดียวกัน
      const existingData = weekToDataMap.get(weekIndex) || { protein: 0, meals: 0 };
      const protein = log.protein_g || (log as any).protein || (log as any).total_protein || 0;

      existingData.protein += protein;
      existingData.meals += 1;

      weekToDataMap.set(weekIndex, existingData);
    }
  });

  // สร้างข้อมูลสำหรับกราฟโดยใช้ map
  const result = weeks.map((week, index) => {
    const weekData = weekToDataMap.get(index);
    const value = weekData?.protein || 0;
    return {
      name: week,
      value: value
    };
  });

  return result;
};

// สร้างข้อมูลการนอนรายสัปดาห์ในเดือน
const generateWeeklySleepData = (sleepLogs?: any[]) => {
  const weeks = ["สัปดาห์ 1", "สัปดาห์ 2", "สัปดาห์ 3", "สัปดาห์ 4"];


  if (!sleepLogs || sleepLogs.length === 0) {
    return weeks.map(week => ({ name: week, value: 0 }));
  }

  // สร้าง map สำหรับแมปสัปดาห์กับข้อมูล
  const weekToDataMap = new Map();

  // คำนวณชั่วโมงการนอนรวมตามสัปดาห์
  sleepLogs.forEach((log) => {
    if (log.sleep_date) {
      const date = new Date(log.sleep_date);
      const dayOfMonth = date.getDate();

      // หาสัปดาห์ที่ (1-4) โดยใช้การคำนวณที่แม่นยำ
      let weekNumber;
      if (dayOfMonth <= 7) {
        weekNumber = 1;
      } else if (dayOfMonth <= 14) {
        weekNumber = 2;
      } else if (dayOfMonth <= 21) {
        weekNumber = 3;
      } else {
        weekNumber = 4;
      }

      const weekIndex = weekNumber - 1; // 0-3 สำหรับสัปดาห์ 1-4

      // รวมชั่วโมงการนอนในสัปดาห์เดียวกัน
      const existingData = weekToDataMap.get(weekIndex) || { hours: 0, nights: 0 };

      // ใช้ field ที่ถูกต้องสำหรับชั่วโมงการนอน
      let sleepHours = 0;
      if (log.sleep_duration_hours) {
        sleepHours = log.sleep_duration_hours;
      } else if (log.sleep_hours) {
        sleepHours = log.sleep_hours;
      } else if (log.bedtime && log.wake_time) {
        // คำนวณจากเวลาเข้านอนและตื่นนอน
        const [bedHour, bedMin] = log.bedtime.split(':').map(Number);
        const [wakeHour, wakeMin] = log.wake_time.split(':').map(Number);
        const bedTime = bedHour * 60 + bedMin;
        const wakeTime = wakeHour * 60 + wakeMin;
        const duration = wakeTime >= bedTime ? wakeTime - bedTime : (24 * 60 - bedTime) + wakeTime;
        sleepHours = Math.round((duration / 60) * 10) / 10;
      }

      existingData.hours += sleepHours;
      existingData.nights += 1;

      weekToDataMap.set(weekIndex, existingData);
    }
  });

  // สร้างข้อมูลสำหรับกราฟโดยใช้ map
  const result = weeks.map((week, index) => {
    const weekData = weekToDataMap.get(index);
    const value = weekData?.hours || 0;
    return {
      name: week,
      value: value
    };
  });

  return result;
};

// สร้างข้อมูลแคลอรี่รายสัปดาห์ในเดือน
const generateWeeklyCaloriesData = (foodLogs?: any[]) => {
  const weeks = ["สัปดาห์ 1", "สัปดาห์ 2", "สัปดาห์ 3", "สัปดาห์ 4"];


  if (!foodLogs || foodLogs.length === 0) {
    return weeks.map(week => ({ name: week, value: 0 }));
  }

  // สร้าง map สำหรับแมปสัปดาห์กับข้อมูล
  const weekToDataMap = new Map();

  // คำนวณแคลอรี่รวมตามสัปดาห์
  foodLogs.forEach((log) => {
    if (log.consumed_at) {
      const date = new Date(log.consumed_at);
      const dayOfMonth = date.getDate();

      // หาสัปดาห์ที่ (1-4) โดยใช้การคำนวณที่แม่นยำ
      let weekNumber;
      if (dayOfMonth <= 7) {
        weekNumber = 1;
      } else if (dayOfMonth <= 14) {
        weekNumber = 2;
      } else if (dayOfMonth <= 21) {
        weekNumber = 3;
      } else {
        weekNumber = 4;
      }

      const weekIndex = weekNumber - 1; // 0-3 สำหรับสัปดาห์ 1-4

      // รวมแคลอรี่ในสัปดาห์เดียวกัน
      const existingData = weekToDataMap.get(weekIndex) || { calories: 0, meals: 0 };
      const calories = log.calories_per_serving || (log as any).calories || (log as any).total_calories || 0;

      existingData.calories += calories;
      existingData.meals += 1;

      weekToDataMap.set(weekIndex, existingData);
    }
  });

  // สร้างข้อมูลสำหรับกราฟโดยใช้ map
  const result = weeks.map((week, index) => {
    const weekData = weekToDataMap.get(index);
    const value = weekData?.calories || 0;
    return {
      name: week,
      value: value
    };
  });

  return result;
};

// สร้างข้อมูลแคลอรี่จาก API หรือจาก foodLogs
const generateCaloriesData = (weeklyTrends?: any[], foodLogs?: any[]) => {
  const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"];


  // สร้าง map สำหรับแมปวันที่กับข้อมูล
  const dateToDataMap = new Map();

  // ใช้ข้อมูลจาก foodLogs หากมี (ข้อมูลจริงจากฐานข้อมูล)
  if (foodLogs && foodLogs.length > 0) {

    // คำนวณแคลอรี่รวมตามวันที่
    foodLogs.forEach((log) => {
      if (log.consumed_at) {
        const date = new Date(log.consumed_at);
        const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const dayOfWeek = date.getDay(); // 0 = อาทิตย์, 1 = จันทร์, ..., 6 = เสาร์
        const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        // รวมแคลอรี่ในวันเดียวกัน
        const existingData = dateToDataMap.get(dayIndex) || { calories: 0, meals: 0, date: dateString };

        // ตรวจสอบและใช้ค่าแคลอรี่จากหลายฟิลด์ที่เป็นไปได้
        const calories = log.calories_per_serving || (log as any).calories || (log as any).total_calories || 0;
        existingData.calories += calories;
        existingData.meals += 1;
        existingData.date = dateString;

        dateToDataMap.set(dayIndex, existingData);
      }
    });
  } else if (weeklyTrends && weeklyTrends.length > 0) {

    // วนลูปข้อมูลจาก API และจัดเก็บตามวันที่
    weeklyTrends.forEach((trend, index) => {

      if (trend && trend.date) {
        // แปลงวันที่เป็น Date object เพื่อหาวันในสัปดาห์
        const date = new Date(trend.date);
        const dayOfWeek = date.getDay(); // 0 = อาทิตย์, 1 = จันทร์, ..., 6 = เสาร์

        // แปลงเป็น index ของ days array (0 = จันทร์, 6 = อาทิตย์)
        const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        dateToDataMap.set(dayIndex, trend);
      } else {
      }
    });
  } else {
    return days.map(day => ({ name: day, value: 0 }));
  }

  // สร้างข้อมูลสำหรับกราฟโดยใช้ map
  const result = days.map((day, index) => {
    const trendData = dateToDataMap.get(index);
    const value = trendData?.calories || 0;
    return {
      name: day,
      value: value
    };
  });

  return result;
};

// Mock Data สำหรับโปรตีน (รอ API จริง)
const proteinData = [
  { name: "จันทร์", value: 25 },
  { name: "อังคาร", value: 32 },
  { name: "พุธ", value: 18 },
  { name: "พฤหัส", value: 28 },
  { name: "ศุกร์", value: 35 },
  { name: "เสาร์", value: 22 },
  { name: "อาทิตย์", value: 30 },
];

// ข้อมูลสถิติเพิ่มเติม
const sleepWeeklyData = [
  { name: "สัปดาห์ 1", value: 0 },
  { name: "สัปดาห์ 2", value: 0 },
  { name: "สัปดาห์ 3", value: 0 },
  { name: "สัปดาห์ 4", value: 0 },
];

const moodWeeklyData = [
  { name: "จันทร์", value: 0 },
  { name: "อังคาร", value: 0 },
  { name: "พุธ", value: 0 },
  { name: "พฤหัส", value: 0 },
  { name: "ศุกร์", value: 0 },
  { name: "เสาร์", value: 0 },
  { name: "อาทิตย์", value: 0 },
];

const achievements = [
  { title: "รอข้อมูล", description: "รอ API ข้อมูลความสำเร็จ", icon: "⏳" },
  { title: "รอข้อมูล", description: "รอ API ข้อมูลความสำเร็จ", icon: "⏳" },
  { title: "รอข้อมูล", description: "รอ API ข้อมูลความสำเร็จ", icon: "⏳" },
  { title: "รอข้อมูล", description: "รอ API ข้อมูลความสำเร็จ", icon: "⏳" },
];

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

export default function Dashboard() {
  const navigate = useNavigate();
  const { onboardingData } = useOnboarding();
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedNutritionPeriod, setSelectedNutritionPeriod] = useState<'today' | 'week' | 'month'>('today'); // เพิ่ม state สำหรับเลือกช่วงเวลาโภชนาการ

  // เพิ่ม state สำหรับข้อมูลการออกกำลังกาย
  const [exerciseStats, setExerciseStats] = useState<any>(null);
  const [caloriesSummary, setCaloriesSummary] = useState<any>(null);
  const [exerciseStreak, setExerciseStreak] = useState<any>(null);
  const [recentExercises, setRecentExercises] = useState<any[]>([]);
  const [isLoadingExerciseData, setIsLoadingExerciseData] = useState(false);

  // เพิ่ม state สำหรับข้อมูลอาหารและโภชนาการ
  const [nutritionAnalysis, setNutritionAnalysis] = useState<any>(null);
  const [foodLogSummary, setFoodLogSummary] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoadingFoodData, setIsLoadingFoodData] = useState(false);
  const [foodLogs, setFoodLogs] = useState<any[]>([]); // เพิ่ม state สำหรับเก็บ food logs

  // เพิ่ม state สำหรับข้อมูลการนอนและน้ำดื่ม
  const [sleepStats, setSleepStats] = useState<any>(null);
  const [sleepLogs, setSleepLogs] = useState<any[]>([]);
  const [sleepWeeklyData, setSleepWeeklyData] = useState<any[]>([]);
  const [waterStats, setWaterStats] = useState<any>(null);
  const [waterLogs, setWaterLogs] = useState<any[]>([]);
  const [isLoadingSleepData, setIsLoadingSleepData] = useState(false);
  const [isLoadingWaterData, setIsLoadingWaterData] = useState(false);

  const { toast } = useToast();

  // ฟังก์ชันสำหรับรีเฟรชข้อมูลการนอน, อาหาร, และน้ำดื่มของวันนี้ (Manual Refresh Only)
  const refreshTodayData = async () => {
    try {
      const today = getLocalDateString();

      // รีเฟรชข้อมูล sleep logs ของวันนี้
      const sleepLogsResponse = await apiService.getSleepLogs(today);
      if (sleepLogsResponse) {
        setSleepLogs(sleepLogsResponse);
      }

      // รีเฟรชข้อมูล food logs ของวันนี้
      const foodLogsResponse = await apiService.getFoodLogs(today);
      if (foodLogsResponse) {
        setFoodLogs(foodLogsResponse);
      }

      // รีเฟรชข้อมูล water logs ของวันนี้
      const waterLogsResponse = await apiService.getWaterLogs(today);
      if (waterLogsResponse) {
        setWaterLogs(waterLogsResponse);
      }

      toast({
        title: '🔄 รีเฟรชข้อมูลสำเร็จ',
        description: 'อัปเดตข้อมูลการนอน, อาหาร, และน้ำดื่มของวันนี้เรียบร้อยแล้ว'
      });

    } catch (error) {
      console.error('❌ Error refreshing today data:', error);
      toast({
        title: '❌ รีเฟรชข้อมูลไม่สำเร็จ',
        description: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล กรุณาลองใหม่อีกครั้ง',
        variant: "destructive"
      });
    }
  };

  // ฟังก์ชันคำนวณโภชนาการตามช่วงเวลาที่เลือก
  const calculateNutritionForPeriod = (period: 'today' | 'week' | 'month') => {
    const dateRange = getDateRange(period);
    const totals = {
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fat: 0,
      total_fiber: 0,
      total_sodium: 0,
    };

    // กรองและคำนวณเฉพาะบันทึกอาหารในช่วงเวลาที่เลือก
    foodLogs
      .filter(log => {
        const logDate = getLocalDateString(log.consumed_at);
        return isDateInRange(logDate, dateRange.start, dateRange.end);
      })
      .forEach(log => {
        totals.total_calories += Number(log.calories_per_serving || 0);
        totals.total_protein += Number(log.protein_g || 0);
        totals.total_carbs += Number(log.carbs_g || 0);
        totals.total_fat += Number(log.fat_g || 0);
        totals.total_fiber += Number(log.fiber_g || 0);
        totals.total_sodium += Number(log.sodium_mg || 0);
      });

    return totals;
  };

  // ฟังก์ชันคำนวณเป้าหมายโภชนาการตามช่วงเวลา
  const getNutritionTargetsForPeriod = (period: 'today' | 'week' | 'month') => {
    const multiplier = period === 'week' ? 7 : period === 'month' ? 30 : 1;
    return {
      protein: nutritionTargets.protein * multiplier,
      carbs: nutritionTargets.carbs * multiplier,
      fats: nutritionTargets.fats * multiplier,
      fiber: nutritionTargets.fiber * multiplier,
      vitaminC: nutritionTargets.vitaminC * multiplier,
      vitaminD: nutritionTargets.vitaminD * multiplier,
      calcium: nutritionTargets.calcium * multiplier,
      iron: nutritionTargets.iron * multiplier,
      potassium: nutritionTargets.potassium * multiplier,
      sodium: nutritionTargets.sodium * multiplier,
    };
  };

  // คำนวณโภชนาการสำหรับช่วงเวลาที่เลือก
  const currentNutritionData = useMemo(() => {
    return calculateNutritionForPeriod(selectedNutritionPeriod);
  }, [foodLogs, selectedNutritionPeriod]);

  // ตรวจสอบว่าผู้ใช้ล็อกอินแล้วหรือไม่
  useEffect(() => {
    // เพิ่มการตรวจสอบที่เหมาะสมมากขึ้น
    const checkAuth = () => {
      if (!tokenUtils.isLoggedIn()) {
        navigate('/login');
        return;
      }
    };

    // ตรวจสอบทันที
    checkAuth();

    // ตรวจสอบทุก 30 วินาที (ลดความเข้มงวด)
    const interval = setInterval(checkAuth, 30000);

    return () => clearInterval(interval);
  }, [navigate]);

  // โหลดข้อมูลครั้งแรกเมื่อ component mount
  useEffect(() => {
    loadFoodData();
  }, []);

  // ฟังก์ชันโหลดข้อมูลอาหารและโภชนาการจาก Backend (Manual Refresh Only)
  const loadFoodData = async () => {
    if (isLoadingFoodData) return;

    setIsLoadingFoodData(true);

    try {

      // 1. โหลดการวิเคราะห์โภชนาการ (ไม่บังคับ)
      try {
        const nutritionResponse = await apiService.getNutritionAnalysis();
        if (nutritionResponse?.data) {
          setNutritionAnalysis(nutritionResponse.data);
        }
      } catch (error) {
        // ไม่ throw error เพื่อไม่ให้กระทบต่อการโหลดข้อมูลอื่น
      }

      // 2. โหลดสรุปอาหารประจำวัน
      const summaryResponse = await apiService.getFoodLogSummary();
      if (summaryResponse?.data) {
        setFoodLogSummary(summaryResponse.data);
      }

      // 3. โหลด food logs ของวันปัจจุบัน
      const today = getLocalDateString();
      try {
        const foodLogsResponse = await apiService.getFoodLogs(today);
        if (foodLogsResponse) {
          setFoodLogs(foodLogsResponse);

          // แสดงตัวอย่างข้อมูลเต็มของรายการแรก
          if (foodLogsResponse.length > 0) {
          }
        }
      } catch (foodLogsError) {
        setFoodLogs([]);
      }

      // 4. โหลดข้อมูล Dashboard (รวม weekly_trends สำหรับกราฟ)
      const dashboardResponse = await apiService.getFoodLogDashboard();
      if (dashboardResponse?.data) {
        setDashboardData(dashboardResponse.data);
        if (dashboardResponse.data.weekly_trends) {
          dashboardResponse.data.weekly_trends.forEach((trend: any, index: number) => {
          });
        } else {
        }
      }

      // โหลดข้อมูลการนอนด้วย
      await loadSleepData();

      toast({
        title: '🔄 รีเฟรชข้อมูลโภชนาการสำเร็จ',
        description: 'อัปเดตข้อมูลอาหาร, การวิเคราะห์โภชนาการ, และสถิติเรียบร้อยแล้ว'
      });

    } catch (error) {
      console.error('❌ Error loading food data:', error);

      let errorMessage = 'ไม่สามารถรีเฟรชข้อมูลโภชนาการได้';
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'ไม่มีสิทธิ์ในการเข้าถึงข้อมูล กรุณาเข้าสู่ระบบใหม่';
        } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
          errorMessage = 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง';
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: '❌ รีเฟรชข้อมูลไม่สำเร็จ',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoadingFoodData(false);
    }
  };

  // ฟังก์ชันโหลดข้อมูลการออกกำลังกายจาก Backend
  const loadExerciseData = async () => {
    if (isLoadingExerciseData) return;

    setIsLoadingExerciseData(true);

    try {

      // 1. โหลดสถิติรวม
      const statsResponse = await apiService.getExerciseStats();
      if (statsResponse?.data) {
        setExerciseStats(statsResponse.data);
      }

      // 2. โหลดสรุปแคลอรี
      const caloriesResponse = await apiService.getCaloriesSummary();
      if (caloriesResponse?.data) {
        setCaloriesSummary(caloriesResponse.data);
      }

      // 3. โหลด Exercise Streak
      const streakResponse = await apiService.getExerciseStreak();
      if (streakResponse?.data) {
        setExerciseStreak(streakResponse.data);
      }

      // 4. โหลดรายการล่าสุด
      const recentResponse = await apiService.getExerciseLogs(); // 5 รายการล่าสุด
      if (recentResponse && recentResponse.length > 0) {
        setRecentExercises(recentResponse.slice(0, 5)); // เอาแค่ 5 รายการแรก
      }

      toast({
        title: 'โหลดข้อมูลสำเร็จ',
        description: 'โหลดข้อมูลการออกกำลังกายเรียบร้อยแล้ว'
      });

    } catch (error) {
      console.error('❌ Error loading exercise data:', error);

      let errorMessage = 'ไม่สามารถโหลดข้อมูลการออกกำลังกายได้';
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'ไม่มีสิทธิ์ในการเข้าถึงข้อมูล กรุณาเข้าสู่ระบบใหม่';
        } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
          errorMessage = 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง';
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: 'เกิดข้อผิดพลาด',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoadingExerciseData(false);
    }
  };

  // ฟังก์ชันโหลดข้อมูลการนอนจาก Backend
  const loadSleepData = async () => {
    if (isLoadingSleepData) return;

    setIsLoadingSleepData(true);

    try {

      // ใช้ API endpoint ใหม่: /sleep-log/stats/overview?date=YYYY-MM-DD
      const today = getLocalDateString();

      try {
        const overviewResponse = await apiService.getSleepOverviewStats(today);

        if (overviewResponse?.data) {
          setSleepStats(overviewResponse.data);
        } else {
          setSleepStats(null);
        }
      } catch (overviewError) {
        setSleepStats(null);
      }

      // โหลดข้อมูลการนอนรายสัปดาห์
      try {
        const weeklyResponse = await apiService.getSleepWeeklyData();

        if (weeklyResponse && weeklyResponse.length > 0) {
          setSleepWeeklyData(weeklyResponse);
        } else {
          setSleepWeeklyData([]);
        }
      } catch (weeklyError) {
        setSleepWeeklyData([]);
      }

      // โหลดข้อมูล sleep logs ของวันปัจจุบัน
      try {
        const today = getLocalDateString();
        const sleepLogsResponse = await apiService.getSleepLogs(today);
        if (sleepLogsResponse) {
          setSleepLogs(sleepLogsResponse);

          // แสดงตัวอย่างข้อมูลเต็มของรายการแรก
          if (sleepLogsResponse.length > 0) {
          }
        }
      } catch (sleepLogsError) {
        setSleepLogs([]);
      }

      toast({
        title: 'โหลดข้อมูลสำเร็จ',
        description: 'โหลดข้อมูลการนอนเรียบร้อยแล้ว'
      });

    } catch (error) {
      console.error('❌ Error loading sleep data:', error);

      let errorMessage = 'ไม่สามารถโหลดข้อมูลการนอนได้';
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'ไม่มีสิทธิ์ในการเข้าถึงข้อมูล กรุณาเข้าสู่ระบบใหม่';
        } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
          errorMessage = 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง';
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: 'เกิดข้อผิดพลาด',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoadingSleepData(false);
    }
  };

  // ฟังก์ชันโหลดข้อมูลน้ำดื่มจาก Backend
  const loadWaterData = async () => {
    if (isLoadingWaterData) return;

    setIsLoadingWaterData(true);

    try {

      // 1. โหลดสถิติน้ำดื่ม (week)
      const statsResponse = await apiService.getWaterStats('week');
      if (statsResponse?.data) {
        setWaterStats(statsResponse.data);
      }

      // 2. โหลดรายการน้ำดื่มเฉพาะวันปัจจุบัน
      const today = getLocalDateString();
      const logsResponse = await apiService.getWaterLogs(today);
      if (logsResponse && logsResponse.length >= 0) {
        setWaterLogs(logsResponse);
      }

      toast({
        title: 'โหลดข้อมูลสำเร็จ',
        description: 'โหลดข้อมูลน้ำดื่มเรียบร้อยแล้ว'
      });

    } catch (error) {
      console.error('❌ Error loading water data:', error);

      let errorMessage = 'ไม่สามารถโหลดข้อมูลน้ำดื่มได้';
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'ไม่มีสิทธิ์ในการเข้าถึงข้อมูล กรุณาเข้าสู่ระบบใหม่';
        } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
          errorMessage = 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง';
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: 'เกิดข้อผิดพลาด',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoadingWaterData(false);
    }
  };

  // โหลดข้อมูลการออกกำลังกายเมื่อเปิดหน้า
  useEffect(() => {
    loadExerciseData();
  }, []);

  // ลบ useEffect ที่ซ้ำซ้อน - โหลดข้อมูลครั้งแรกใน useEffect ด้านบนแล้ว

  // โหลดข้อมูลการนอนเมื่อเปิดหน้า
  useEffect(() => {
    loadSleepData();
  }, []);

  // โหลดข้อมูลน้ำดื่มเมื่อเปิดหน้า
  useEffect(() => {
    loadWaterData();
  }, []);

  // ฟังก์ชันสำหรับอัปเดตข้อมูลน้ำดื่มเมื่อมีการเปลี่ยนแปลง
  const refreshWaterData = async () => {
    await loadWaterData();
  };

  // ลบ auto-refresh สำหรับข้อมูลน้ำดื่ม - ให้ผู้ใช้กดปุ่ม refresh เอง

  const { bmr, tdee } = useMemo(() => {
    const height = onboardingData.height || 0; // cm
    const weight = onboardingData.weight || 0; // kg
    const birthDate = onboardingData.birthDate;
    const sex = onboardingData.sex;
    const activityLevel = onboardingData.activityLevel;

    const age = (() => {
      if (!birthDate) return 0;
      const birth = new Date(birthDate);
      if (Number.isNaN(birth.getTime())) return 0;
      const today = new Date();
      let years = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years--;
      return Math.max(0, years);
    })();

    // Mifflin-St Jeor Equation
    let calculatedBmr = 0;
    if (sex === 'male') {
      calculatedBmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (sex === 'female') {
      calculatedBmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const activityFactors: Record<string, number> = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'active': 1.725,
      'very-active': 1.9,
    };
    const factor = activityFactors[activityLevel] || 1.2;
    const calculatedTdee = calculatedBmr > 0 ? calculatedBmr * factor : 0;

    return { bmr: Math.round(calculatedBmr), tdee: Math.round(calculatedTdee) };
  }, [onboardingData]);

  // สร้างข้อมูลกราฟการออกกำลังกายจากข้อมูลจริง
  const generateExerciseChartData = () => {
    const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"];
    const chartData = days.map(day => ({ name: day, value: 0 }));

    // ถ้ามีข้อมูลการออกกำลังกาย ให้แจกจ่ายไปยังวันต่างๆ
    if (recentExercises && recentExercises.length > 0) {
      recentExercises.forEach(exercise => {
        if (exercise.exercise_date) {
          const exerciseDate = new Date(exercise.exercise_date);
          // แปลง JavaScript getDay() (0=อาทิตย์, 1=จันทร์, ..., 6=เสาร์) 
          // ให้เป็น index ของ array ไทย (0=จันทร์, 1=อังคาร, ..., 6=อาทิตย์)
          const dayIndex = exerciseDate.getDay() === 0 ? 6 : exerciseDate.getDay() - 1;
          chartData[dayIndex].value += exercise.duration_minutes || 0;
        }
      });
    }

    return chartData;
  };

  // สร้างข้อมูลกราฟแคลอรี่ที่เผาผลาญต่อวันใน 1 สัปดาห์
  const generateCaloriesBurnedChartData = () => {
    const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"];
    const chartData = days.map(day => ({ name: day, value: 0 }));

    // ถ้ามีข้อมูลการออกกำลังกาย ให้แจกจ่ายแคลอรี่ที่เผาผลาญไปยังวันต่างๆ
    if (recentExercises && recentExercises.length > 0) {
      recentExercises.forEach(exercise => {
        if (exercise.exercise_date && exercise.calories_burned) {
          const exerciseDate = new Date(exercise.exercise_date);
          // แปลง JavaScript getDay() (0=อาทิตย์, 1=จันทร์, ..., 6=เสาร์) 
          // ให้เป็น index ของ array ไทย (0=จันทร์, 1=อังคาร, ..., 6=อาทิตย์)
          const dayIndex = exerciseDate.getDay() === 0 ? 6 : exerciseDate.getDay() - 1;
          chartData[dayIndex].value += exercise.calories_burned || 0;
        }
      });
    }

    return chartData;
  };

  // สร้างข้อมูลกราฟแคลอรี่ที่เผาผลาญรายสัปดาห์ใน 1 เดือน
  const generateMonthlyCaloriesBurnedData = () => {
    const weeks = ["สัปดาห์ 1", "สัปดาห์ 2", "สัปดาห์ 3", "สัปดาห์ 4"];
    const chartData = weeks.map(week => ({ name: week, value: 0 }));

    // ถ้ามีข้อมูลการออกกำลังกาย ให้แจกจ่ายแคลอรี่ที่เผาผลาญไปยังสัปดาห์ต่างๆ
    if (recentExercises && recentExercises.length > 0) {
      recentExercises.forEach(exercise => {
        if (exercise.exercise_date && exercise.calories_burned) {
          const exerciseDate = new Date(exercise.exercise_date);
          const today = new Date();
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          const exerciseTime = exerciseDate.getTime();
          const startTime = startOfMonth.getTime();
          const daysDiff = Math.floor((exerciseTime - startTime) / (1000 * 60 * 60 * 24));
          const weekIndex = Math.floor(daysDiff / 7);

          // ตรวจสอบว่าเป็นสัปดาห์ที่ 1-4 ของเดือนนี้
          if (weekIndex >= 0 && weekIndex < 4) {
            chartData[weekIndex].value += exercise.calories_burned || 0;
          }
        }
      });
    }

    return chartData;
  };

  // สร้างข้อมูลกราฟการออกกำลังกายรายสัปดาห์ใน 1 เดือน (นาที)
  const generateMonthlyExerciseData = () => {
    const weeks = ["สัปดาห์ 1", "สัปดาห์ 2", "สัปดาห์ 3", "สัปดาห์ 4"];
    const chartData = weeks.map(week => ({ name: week, value: 0 }));

    // ถ้ามีข้อมูลการออกกำลังกาย ให้แจกจ่ายนาทีการออกกำลังกายไปยังสัปดาห์ต่างๆ
    if (recentExercises && recentExercises.length > 0) {
      recentExercises.forEach(exercise => {
        if (exercise.exercise_date && exercise.duration_minutes) {
          const exerciseDate = new Date(exercise.exercise_date);
          const today = new Date();
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          const exerciseTime = exerciseDate.getTime();
          const startTime = startOfMonth.getTime();
          const daysDiff = Math.floor((exerciseTime - startTime) / (1000 * 60 * 60 * 24));
          const weekIndex = Math.floor(daysDiff / 7);

          // ตรวจสอบว่าเป็นสัปดาห์ที่ 1-4 ของเดือนนี้
          if (weekIndex >= 0 && weekIndex < 4) {
            chartData[weekIndex].value += exercise.duration_minutes || 0;
          }
        }
      });
    }

    return chartData;
  };

  // คำนวณค่าเฉลี่ยต่อวัน (Daily Average) ที่ถูกต้อง
  const calculateDailyAverage = () => {
    if (!exerciseStats?.total_duration || !exerciseStats?.total_exercises) {
      return 0;
    }

    // ค่าเฉลี่ยต่อวัน = เวลารวม ÷ จำนวนวันที่มีกิจกรรม
    return Math.round(exerciseStats.total_duration / exerciseStats.total_exercises);
  };

  const dailyAverage = calculateDailyAverage();

  // สร้างข้อมูลกราฟโปรตีนจากข้อมูลจริง
  const generateProteinChartData = () => {
    const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"];
    const chartData = days.map(day => ({ name: day, value: 0 }));

    // ถ้ามีข้อมูล food logs ให้แจกจ่ายโปรตีนไปยังวันต่างๆ
    if (foodLogs && foodLogs.length > 0) {
      foodLogs.forEach(foodLog => {
        if (foodLog.consumed_at && foodLog.protein_g) {
          const foodDate = new Date(foodLog.consumed_at);
          // แปลง JavaScript getDay() (0=อาทิตย์, 1=จันทร์, ..., 6=เสาร์) 
          // ให้เป็น index ของ array ไทย (0=จันทร์, 1=อังคาร, ..., 6=อาทิตย์)
          const dayIndex = foodDate.getDay() === 0 ? 6 : foodDate.getDay() - 1;
          chartData[dayIndex].value += Number(foodLog.protein_g) || 0;
        }
      });
    }

    return chartData;
  };

  // สร้างข้อมูลกราฟโปรตีนรายสัปดาห์ใน 1 เดือน
  const generateMonthlyProteinData = () => {
    const weeks = ["สัปดาห์ 1", "สัปดาห์ 2", "สัปดาห์ 3", "สัปดาห์ 4"];
    const chartData = weeks.map(week => ({ name: week, value: 0 }));

    // ถ้ามีข้อมูล food logs ให้แจกจ่ายโปรตีนไปยังสัปดาห์ต่างๆ
    if (foodLogs && foodLogs.length > 0) {
      foodLogs.forEach(foodLog => {
        if (foodLog.consumed_at && foodLog.protein_g) {
          const foodDate = new Date(foodLog.consumed_at);
          const today = new Date();
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          const foodTime = foodDate.getTime();
          const startTime = startOfMonth.getTime();

          const daysDiff = Math.floor((foodTime - startTime) / (1000 * 60 * 60 * 24));
          const weekIndex = Math.floor(daysDiff / 7);

          // ตรวจสอบว่าเป็นสัปดาห์ที่ 1-4 ของเดือนนี้
          if (weekIndex >= 0 && weekIndex < 4) {
            chartData[weekIndex].value += Number(foodLog.protein_g) || 0;
          }
        }
      });
    }

    return chartData;
  };

  // สร้างข้อมูลกราฟการนอนจากข้อมูลจริง (แสดงข้อมูลสัปดาห์ปัจจุบัน)
  const generateSleepChartData = () => {
    const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"];
    const chartData = days.map(day => ({
      name: day,
      value: 0,
      date: "",
      sleep_duration_hours: 0,
      sleep_score: 0,
      sleep_quality: "fair" as const,
      sleep_efficiency_percentage: 0,
      // เพิ่มข้อมูลสำหรับแสดงในกราฟ
      quality: "fair" as const,
      score: 0,
      efficiency: 0,
      isRealData: false
    }));

    // ถ้ามีข้อมูลการนอน ให้แจกจ่ายชั่วโมงการนอนไปยังวันต่างๆ
    if (sleepLogs && sleepLogs.length > 0) {

      // แสดงข้อมูลการนอนทั้งหมดโดยไม่กรองตามวันที่

      sleepLogs.forEach(sleepLog => {
        if (sleepLog.sleep_date || sleepLog.date) {
          const sleepDate = new Date(sleepLog.sleep_date || sleepLog.date);


          // แปลง JavaScript getDay() (0=อาทิตย์, 1=จันทร์, ..., 6=เสาร์) 
          // ให้เป็น index ของ array ไทย (0=จันทร์, 1=อังคาร, ..., 6=อาทิตย์)
          const dayIndex = sleepDate.getDay() === 0 ? 6 : sleepDate.getDay() - 1;

          // คำนวณชั่วโมงการนอน
          let sleepHours = 0;
          if (sleepLog.sleep_duration_hours) {
            sleepHours = sleepLog.sleep_duration_hours;
          } else if (sleepLog.bedtime && sleepLog.wake_time) {
            // คำนวณจากเวลาเข้านอนและตื่นนอน
            const [bedHour, bedMin] = sleepLog.bedtime.split(':').map(Number);
            const [wakeHour, wakeMin] = sleepLog.wake_time.split(':').map(Number);
            const bedTime = bedHour * 60 + bedMin;
            const wakeTime = wakeHour * 60 + wakeMin;
            const duration = wakeTime >= bedTime ? wakeTime - bedTime : (24 * 60 - bedTime) + wakeTime;
            sleepHours = Math.round((duration / 60) * 10) / 10;
          }


          // อัปเดตข้อมูลใน chartData
          chartData[dayIndex] = {
            name: days[dayIndex],
            value: sleepHours,
            date: sleepLog.sleep_date || sleepLog.date,
            sleep_duration_hours: sleepHours,
            sleep_score: sleepLog.sleep_score || 0,
            sleep_quality: sleepLog.sleep_quality || "fair",
            sleep_efficiency_percentage: sleepLog.sleep_efficiency_percentage || 0,
            // เพิ่มข้อมูลสำหรับแสดงในกราฟ
            quality: sleepLog.sleep_quality || "fair",
            score: sleepLog.sleep_score || 0,
            efficiency: sleepLog.sleep_efficiency_percentage || 0,
            isRealData: true
          };
        }
      });
    }

    return chartData;
  };

  // สร้างข้อมูลกราฟน้ำดื่มจากข้อมูลจริง
  const generateWaterChartData = () => {
    const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"];
    const chartData = days.map(day => ({ name: day, value: 0 }));

    // ถ้ามีข้อมูลน้ำดื่ม ให้แจกจ่ายลิตรน้ำไปยังวันต่างๆ
    if (waterLogs && waterLogs.length > 0) {
      waterLogs.forEach(waterLog => {
        if (waterLog.consumed_at) {
          const waterDate = new Date(waterLog.consumed_at);
          // แปลง JavaScript getDay() (0=อาทิตย์, 1=จันทร์, ..., 6=เสาร์) 
          // ให้เป็น index ของ array ไทย (0=จันทร์, 1=อังคาร, ..., 6=อาทิตย์)
          const dayIndex = waterDate.getDay() === 0 ? 6 : waterDate.getDay() - 1;

          // แปลงจาก ml เป็นลิตร
          const liters = (waterLog.amount_ml || 0) / 1000;
          chartData[dayIndex].value += liters;
        }
      });
    }

    return chartData;
  };

  // สร้างข้อมูลสรุปกิจกรรมรายสัปดาห์จากข้อมูลจริง
  const generateWeeklyActivitySummary = () => {
    // คำนวณข้อมูลการออกกำลังกาย (นาทีรวมในสัปดาห์)
    const totalExerciseMinutes = realExerciseData.reduce((sum, day) => sum + day.value, 0);

    // คำนวณข้อมูลการนอน (ชั่วโมงรวมในสัปดาห์)
    const totalSleepHours = realSleepData.reduce((sum, day) => sum + day.value, 0);

    // คำนวณข้อมูลน้ำดื่ม (ลิตรรวมในสัปดาห์)
    const totalWaterLiters = realWaterData.reduce((sum, day) => sum + day.value, 0);

    // คำนวณข้อมูลอาหาร (จำนวนมื้อรวมในสัปดาห์)
    const totalMeals = foodLogs ? foodLogs.length : 0;

    return [
      { name: "ออกกำลังกาย", value: totalExerciseMinutes, unit: "นาที" },
      { name: "นอนหลับ", value: totalSleepHours, unit: "ชั่วโมง" },
      { name: "ดื่มน้ำ", value: totalWaterLiters, unit: "ลิตร" },
      { name: "บริโภคอาหาร", value: totalMeals, unit: "มื้อ" }
    ];
  };

  // สร้างข้อมูลกราฟเปรียบเทียบแคลอรี่ (บริโภค vs เผาผลาญ)
  const generateCaloriesBalanceData = () => {
    const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"];
    const consumedData = generateCaloriesData(dashboardData?.weekly_trends, foodLogs);
    const burnedData = caloriesBurnedData;

    return {
      consumed: consumedData.map((item, index) => ({
        name: days[index],
        value: item.value,
        type: "บริโภค"
      })),
      burned: burnedData.map((item, index) => ({
        name: days[index],
        value: item.value,
        type: "เผาผลาญ"
      }))
    };
  };

  // สร้างข้อมูลกราฟคุณภาพการนอน
  const generateSleepQualityData = () => {
    const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"];

    return realSleepData.map((sleepData, index) => ({
      name: days[index],
      hours: sleepData.value,
      score: sleepData.score || 0,
      quality: sleepData.quality || "fair",
      efficiency: sleepData.efficiency || 0,
      isRealData: sleepData.isRealData || false
    }));
  };

  // สร้างข้อมูลกราฟสารอาหารหลัก
  const generateMacronutrientsData = () => {
    const targets = getNutritionTargetsForPeriod(selectedNutritionPeriod);

    return [
      {
        name: "โปรตีน",
        current: currentNutritionData?.total_protein || 0,
        target: targets.protein,
        unit: "g",
        color: "hsl(142, 69%, 58%)"
      },
      {
        name: "คาร์โบไฮเดรต",
        current: currentNutritionData?.total_carbs || 0,
        target: targets.carbs,
        unit: "g",
        color: "hsl(200, 70%, 60%)"
      },
      {
        name: "ไขมัน",
        current: currentNutritionData?.total_fat || 0,
        target: targets.fats,
        unit: "g",
        color: "hsl(45, 100%, 50%)"
      },
      {
        name: "ไฟเบอร์",
        current: currentNutritionData?.total_fiber || 0,
        target: targets.fiber,
        unit: "g",
        color: "hsl(280, 70%, 60%)"
      }
    ];
  };

  // สร้างข้อมูลกราฟประสิทธิภาพรายสัปดาห์
  const generateWeeklyPerformanceData = () => {
    const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"];

    return days.map((day, index) => {
      const exercise = realExerciseData[index]?.value || 0;
      const sleep = realSleepData[index]?.value || 0;
      const water = realWaterData[index]?.value || 0;
      const calories = generateCaloriesData(dashboardData?.weekly_trends, foodLogs)[index]?.value || 0;

      // คำนวณคะแนนประสิทธิภาพ (0-100)
      const exerciseScore = Math.min((exercise / 45) * 100, 100); // เป้าหมาย 45 นาที
      const sleepScore = Math.min((sleep / 8) * 100, 100); // เป้าหมาย 8 ชั่วโมง
      const waterScore = Math.min((water / 2.5) * 100, 100); // เป้าหมาย 2.5 ลิตร
      const caloriesScore = Math.min((calories / 2000) * 100, 100); // เป้าหมาย 2000 แคล

      const overallScore = (exerciseScore + sleepScore + waterScore + caloriesScore) / 4;

      return {
        name: day,
        exercise: exerciseScore,
        sleep: sleepScore,
        water: waterScore,
        calories: caloriesScore,
        overall: overallScore
      };
    });
  };

  // สร้างข้อมูลกราฟแนวโน้มระยะยาว (4 สัปดาห์)
  const generateLongTermTrendsData = () => {
    const weeks = ["สัปดาห์ 1", "สัปดาห์ 2", "สัปดาห์ 3", "สัปดาห์ 4"];

    return {
      exercise: monthlyExerciseData,
      calories: monthlyCaloriesBurnedData,
      protein: monthlyProteinData,
      sleep: generateWeeklySleepData(sleepLogs)
    };
  };

  // คำนวณชั่วโมงการนอนของวันนี้จากข้อมูลจริง (ดึงจาก sleep logs ของวันปัจจุบัน)
  const getTodaySleepHours = () => {
    if (!sleepLogs || sleepLogs.length === 0) {
      return 0;
    }

    const today = getLocalDateString();
    let totalSleepHours = 0;


    // หาข้อมูลการนอนของวันปัจจุบัน
    const todaySleepLogs = sleepLogs.filter(log => {
      const logDate = log.sleep_date || log.date;
      if (!logDate) return false;

      // แปลงวันที่จาก log เป็น local date string
      const logDateObj = new Date(logDate);
      const logDateString = getLocalDateString(logDateObj);

      return logDateString === today;
    });


    // คำนวณเวลานอนรวมของวันนี้
    todaySleepLogs.forEach(log => {
      if (log.sleep_duration_hours) {
        totalSleepHours += log.sleep_duration_hours;
      } else if (log.sleep_hours) {
        totalSleepHours += log.sleep_hours;
      } else if (log.bedtime && log.wake_time) {
        // คำนวณจากเวลาเข้านอนและตื่นนอน
        const [bedHour, bedMin] = log.bedtime.split(':').map(Number);
        const [wakeHour, wakeMin] = log.wake_time.split(':').map(Number);
        const bedTime = bedHour * 60 + bedMin;
        const wakeTime = wakeHour * 60 + wakeMin;
        const duration = wakeTime >= bedTime ? wakeTime - bedTime : (24 * 60 - bedTime) + wakeTime;
        const calculatedHours = Math.round((duration / 60) * 10) / 10;
        totalSleepHours += calculatedHours;
      }
    });

    return totalSleepHours;
  };

  // คำนวณลิตรน้ำดื่มของวันนี้จากข้อมูลจริง
  const getTodayWaterLiters = () => {
    if (!waterLogs || waterLogs.length === 0) return 0;

    // waterLogs state มีเฉพาะข้อมูลของวันปัจจุบันแล้ว (จาก API)
    let totalWaterMl = 0;

    waterLogs.forEach(waterLog => {
      totalWaterMl += waterLog.amount_ml || 0;
    });

    // แปลงจาก ml เป็นลิตร
    return totalWaterMl / 1000;
  };

  // คำนวณแคลอรี่ของวันนี้จากข้อมูลจริง (ดึงจาก food logs ของวันปัจจุบัน)
  const getTodayCalories = () => {
    if (!foodLogs || foodLogs.length === 0) {
      return 0;
    }

    const today = getLocalDateString();
    let totalCalories = 0;

    // หาข้อมูลอาหารของวันปัจจุบัน
    const todayFoodLogs = foodLogs.filter(log => {
      const logDate = getLocalDateString(log.consumed_at);
      return logDate === today;
    });

    // คำนวณแคลอรี่รวมของวันนี้
    todayFoodLogs.forEach(log => {
      const calories = log.calories_per_serving || (log as any).calories || (log as any).total_calories || 0;
      totalCalories += Number(calories);
    });

    return totalCalories;
  };

  // คำนวณแคลอรี่เฉลี่ยต่อวันจากข้อมูล 7 วันล่าสุด
  const getAverageDailyCalories = () => {
    if (!foodLogs || foodLogs.length === 0) {
      return 0;
    }

    const today = new Date();
    const last7Days = [];

    // สร้างรายการ 7 วันล่าสุด
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      last7Days.push(getLocalDateString(date));
    }

    let totalCalories = 0;
    let daysWithData = 0;

    // คำนวณแคลอรี่ในแต่ละวัน
    last7Days.forEach(date => {
      const dayLogs = foodLogs.filter(log => {
        const logDate = getLocalDateString(log.consumed_at);
        return logDate === date;
      });

      if (dayLogs.length > 0) {
        const dayCalories = dayLogs.reduce((sum, log) => {
          const calories = log.calories_per_serving || (log as any).calories || (log as any).total_calories || 0;
          return sum + Number(calories);
        }, 0);

        totalCalories += dayCalories;
        daysWithData++;
      }
    });

    const average = daysWithData > 0 ? Math.round(totalCalories / daysWithData) : 0;
    return average;
  };

  const realExerciseData = generateExerciseChartData();
  const caloriesBurnedData = generateCaloriesBurnedChartData();
  const monthlyCaloriesBurnedData = generateMonthlyCaloriesBurnedData();
  const monthlyExerciseData = generateMonthlyExerciseData();
  const realProteinData = generateProteinChartData();
  const monthlyProteinData = generateMonthlyProteinData();
  const realSleepData = generateSleepChartData();
  const realWaterData = generateWaterChartData();

  // คำนวณข้อมูลของวันนี้จากฐานข้อมูลจริง
  const todaySleepHours = getTodaySleepHours();
  const todayWaterLiters = getTodayWaterLiters();
  const todayCalories = getTodayCalories();
  const averageDailyCalories = getAverageDailyCalories();

  return (
    <MainLayout>
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-7 w-7" />
              แดชบอร์ดสุขภาพ
            </h1>
            <p className="text-muted-foreground mt-2">
              ติดตามสุขภาพและสถิติของคุณประจำวัน
            </p>
          </div>


          <div className="flex gap-2 items-center">
            <Button asChild variant="outline">
              <Link to="/health-goals">
                <Target className="h-4 w-4 mr-2" />
                เป้าหมายสุขภาพ
              </Link>
            </Button>
          </div>
        </div>

        {/* AI Insight สรุปรวม (ภาพรวม) */}
        <Card className="border-primary/20">
          <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <iconify-icon icon="lucide:brain" width="20" height="20"></iconify-icon>
              </div>
              <div>
                <CardTitle className="text-lg">ภาพรวมสุขภาพจาก AI</CardTitle>
                <CardDescription>
                  ภาพรวมล่าสุดของการนอน โภชนาการ การออกกำลังกาย และน้ำดื่มของคุณ
                </CardDescription>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/ai-insights">ดูรายละเอียด</Link>
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">การนอน</div>
              <div className="font-semibold">
                {todaySleepHours.toFixed(1)} / 8 ชม.
                <span className={`ml-2 text-xs px-2 py-1 rounded ${todaySleepHours >= 7 ? 'bg-green-100 text-green-800' :
                    todaySleepHours >= 6 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                  }`}>
                  {todaySleepHours >= 7 ? 'ดี' : todaySleepHours >= 6 ? 'ปานกลาง' : 'ต้องปรับปรุง'}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">โภชนาการ</div>
              <div className="font-semibold">
                แคลอรี่{selectedNutritionPeriod === 'today' ? 'วันนี้' : selectedNutritionPeriod === 'week' ? 'สัปดาห์นี้' : 'เดือนนี้'} {selectedNutritionPeriod === 'today' ? todayCalories : currentNutritionData?.total_calories || 0} แคล
                {nutritionAnalysis?.nutrition_score && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    คะแนน: {nutritionAnalysis.nutrition_score}/100
                  </span>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">ออกกำลังกาย</div>
              <div className="font-semibold">เฉลี่ย {dailyAverage} นาที/วัน</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">น้ำดื่ม</div>
              <div className="font-semibold">
                {todayWaterLiters.toFixed(1)} ลิตร/วัน • เป้าหมาย 2.5 ลิตร
                <span className={`ml-2 text-xs px-2 py-1 rounded ${todayWaterLiters >= 2 ? 'bg-green-100 text-green-800' :
                    todayWaterLiters >= 1.5 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                  }`}>
                  {todayWaterLiters >= 2 ? 'ดี' : todayWaterLiters >= 1.5 ? 'ปานกลาง' : 'ต้องปรับปรุง'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="min-h-[140px] flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">คะแนนโภชนาการ</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {nutritionAnalysis?.nutrition_score || 0}/100
              </div>
              <p className="text-xs text-muted-foreground">
                {nutritionAnalysis?.nutrition_score ? 'คะแนนโภชนาการวันนี้' : 'รอข้อมูลโภชนาการ'}
              </p>
            </CardContent>
          </Card>

          <Card className="min-h-[140px] flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">มื้ออาหารวันนี้</CardTitle>
              <iconify-icon icon="lucide:utensils" width="16" height="16" className="text-primary"></iconify-icon>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {foodLogs.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {foodLogs.length > 0 ? 'มื้ออาหารที่บันทึกวันนี้' : 'ยังไม่มีข้อมูลมื้ออาหาร'}
              </p>
            </CardContent>
          </Card>

          <Card className="min-h-[140px] flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">แคลอรี่เฉลี่ยต่อวัน</CardTitle>
              <Target className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {averageDailyCalories}
              </div>
              <p className="text-xs text-muted-foreground">
                {averageDailyCalories > 0 ? 'แคลอรี่เฉลี่ย 7 วัน' : 'รอข้อมูลแคลอรี่'}
              </p>
            </CardContent>
          </Card>

          <Card className="min-h-[140px] flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">การออกกำลังกายเฉลี่ย</CardTitle>
              <iconify-icon icon="lucide:activity" width="16" height="16" className="text-accent"></iconify-icon>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{dailyAverage} นาที</div>
              <p className="text-xs text-muted-foreground">
                เฉลี่ยต่อวัน
              </p>
            </CardContent>
          </Card>

          <Card className="min-h-[140px] flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">แคลอรี่ที่เผาผลาญเฉลี่ย</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {exerciseStats?.total_calories_burned ? Math.round(exerciseStats.total_calories_burned / 7) : 0} แคล
              </div>
              <p className="text-xs text-muted-foreground">
                เฉลี่ยต่อวัน
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Health Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <HealthCard
            title="การนอน"
            value={`${todaySleepHours.toFixed(1)} / 8 ชม.`}
            description={`เป้าหมาย 8 ชม. ${sleepLogs.length > 0 ? '(ข้อมูลจริง)' : '(รอข้อมูล)'}`}
            icon="lucide:moon"
            trend={todaySleepHours >= 7 ? "up" : todaySleepHours >= 6 ? "stable" : "down"}
            color="primary"
          />

          <HealthCard
            title="น้ำดื่ม"
            value={`${todayWaterLiters.toFixed(1)} ลิตร`}
            description={`เป้าหมาย 2.5 ลิตร`}
            icon="lucide:droplets"
            trend={todayWaterLiters >= 2 ? "up" : todayWaterLiters >= 1.5 ? "stable" : "down"}
            color="secondary"
          />
          <HealthCard
            title="แคลอรี่"
            value={`${todayCalories} / ${tdee || 2342} kcal`}
            description={`เป้าหมาย ${tdee || 2342} kcal ${foodLogs.length > 0 ? '(ข้อมูลจริง)' : '(รอข้อมูล)'}`}
            icon="lucide:utensils"
            trend={todayCalories > 0 ? "up" : "stable" as "up" | "down" | "stable"}
            color="warning"
          />
          <HealthCard
            title="การออกกำลังกาย"
            value={`${exerciseStats?.total_duration || 0} นาที`}
            description={`เป้าหมาย ${mockHealthData.exercise.target} นาที`}
            icon="lucide:activity"
            trend={exerciseStats?.total_duration > 0 ? "up" : "stable"}
            color="accent"
          />
        </div>

        {/* BMR / TDEE Overview */}
        <Card className="mt-2">
          <CardHeader>
            <CardTitle className="text-base">สรุปพลังงานพื้นฐาน (BMR) และพลังงานที่ใช้ต่อวัน (TDEE)</CardTitle>
            <CardDescription>ปรับข้อมูลร่างกายในโปรไฟล์เพื่อคำนวณอย่างแม่นยำ</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(() => {
              const bmrDisplay = bmr > 0 ? bmr : 0;
              const tdeeDisplay = tdee > 0 ? tdee : 0;
              const isSample = !(bmr > 0 && tdee > 0);
              return (
                <>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground">ประมาณการ BMR</div>
                    <div className="text-2xl font-semibold">{bmrDisplay.toLocaleString()} kcal</div>
                    {isSample && (
                      <div className="text-xs text-muted-foreground mt-1">รอ API ข้อมูลร่างกาย (ตั้งค่าข้อมูลเพื่อคำนวณจริง)</div>
                    )}
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground">ประมาณการ TDEE</div>
                    <div className="text-2xl font-semibold">{tdeeDisplay.toLocaleString()} kcal</div>
                    {isSample && (
                      <div className="text-xs text-muted-foreground mt-1">รอ API ข้อมูลร่างกาย (ตั้งค่าข้อมูลเพื่อคำนวณจริง)</div>
                    )}
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>

        {/* Charts with Tabs */}
        <Card className="health-stat-card">
          <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              แนวโน้มและสถิติ
            </CardTitle>
            <CardDescription>
              ดูแนวโน้มสุขภาพของคุณในรูปแบบต่างๆ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="daily" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="daily" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  รายวัน
                </TabsTrigger>
                <TabsTrigger value="weekly" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  รายสัปดาห์
                </TabsTrigger>
                <TabsTrigger value="balance" className="flex items-center gap-2">
                  <Flame className="h-4 w-4" />
                  สมดุลแคลอรี่
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  ประสิทธิภาพ
                </TabsTrigger>
                <TabsTrigger value="nutrition" className="flex items-center gap-2">
                  <iconify-icon icon="lucide:apple" width="16" height="16"></iconify-icon>
                  โภชนาการ
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  ข้อมูลเชิงลึก
                </TabsTrigger>
              </TabsList>

              {/* Daily Trends Tab */}
              <TabsContent value="daily" className="space-y-6">

                <Tabs defaultValue="exercise" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="exercise" className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4" />
                      ออกกำลังกาย
                    </TabsTrigger>
                    <TabsTrigger value="nutrition" className="flex items-center gap-2">
                      <Pill className="h-4 w-4" />
                      โภชนาการ
                    </TabsTrigger>
                    <TabsTrigger value="water" className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      ดื่มน้ำ
                    </TabsTrigger>
                    <TabsTrigger value="weight" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      การนอน
                    </TabsTrigger>
                  </TabsList>

                  {/* แท็บออกกำลังกาย */}
                  <TabsContent value="exercise" className="space-y-6 mt-6">
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-1">การออกกำลังกาย</h4>
                      <p className="text-sm text-blue-700">
                        ติดตามความสม่ำเสมอและความเข้มข้นของการออกกำลังกาย เพื่อประเมินความคืบหน้าและปรับแผนการออกกำลังกายให้เหมาะสม
                      </p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <EnhancedHealthChart
                        title="แนวโน้มการออกกำลังกาย"
                        description="📊 ดูความสม่ำเสมอ: เป้าหมาย 45 นาที/วัน | ช่วยวางแผนการออกกำลังกายและติดตามความคืบหน้า"
                        data={realExerciseData}
                        type="line"
                        color="hsl(200, 70%, 60%)"
                        unit="นาที"
                        showDataStatus={true}
                      />
                      <EnhancedHealthChart
                        title="แนวโน้มแคลอรี่ที่เผาผลาญ"
                        description="🔥 ดูประสิทธิภาพ: แคลอรี่ที่เผาผลาญจากการออกกำลังกาย | ช่วยคำนวณสมดุลแคลอรี่และวางแผนลดน้ำหนัก"
                        data={caloriesBurnedData}
                        type="line"
                        color="hsl(0, 70%, 50%)"
                        unit="แคล"
                        showDataStatus={true}
                      />
                    </div>
                  </TabsContent>

                  {/* แท็บโภชนาการ */}
                  <TabsContent value="nutrition" className="space-y-6 mt-6">
                    <div className="mb-4 p-3 bg-orange-50 rounded-lg">
                      <h4 className="font-medium text-orange-900 mb-1">โภชนาการ</h4>
                      <p className="text-sm text-orange-700">
                        ติดตามการบริโภคอาหารและสารอาหาร เพื่อให้แน่ใจว่าคุณได้รับสารอาหารครบถ้วนและอยู่ในเกณฑ์ที่เหมาะสม
                      </p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <EnhancedHealthChart
                        title="แนวโน้มแคลอรี่ที่บริโภค"
                        description="🍽️ ดูปริมาณพลังงาน: แคลอรี่ที่บริโภคในแต่ละวัน | ช่วยควบคุมน้ำหนักและวางแผนมื้ออาหาร"
                        data={generateCaloriesData(dashboardData?.weekly_trends, foodLogs)}
                        type="line"
                        color="hsl(45, 100%, 50%)"
                        unit="แคล"
                        showDataStatus={true}
                      />
                      <EnhancedHealthChart
                        title="แนวโน้มโปรตีนรายวัน"
                        description="🥩 ดูสารอาหารหลัก: ปริมาณโปรตีนที่บริโภค | ช่วยเสริมสร้างกล้ามเนื้อและซ่อมแซมร่างกาย"
                        data={realProteinData}
                        type="line"
                        color="hsl(142, 69%, 58%)"
                        unit="กรัม"
                        showDataStatus={true}
                      />
                    </div>
                  </TabsContent>

                  {/* แท็บดื่มน้ำ */}
                  <TabsContent value="water" className="space-y-6 mt-6">
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-1">การดื่มน้ำ</h4>
                      <p className="text-sm text-blue-700">
                        ติดตามการดื่มน้ำเพื่อให้แน่ใจว่าร่างกายได้รับน้ำเพียงพอ ช่วยให้ระบบต่างๆ ในร่างกายทำงานได้อย่างมีประสิทธิภาพ
                      </p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <EnhancedHealthChart
                        title="แนวโน้มการดื่มน้ำ"
                        description="💧 ดูความเพียงพอ: ลิตรน้ำที่ดื่มในแต่ละวัน | เป้าหมาย 2.5 ลิตร/วัน เพื่อสุขภาพที่ดี"
                        data={realWaterData}
                        type="line"
                        color="hsl(210, 100%, 50%)"
                        unit="ลิตร"
                        showDataStatus={true}
                      />
                    </div>
                  </TabsContent>

                  {/* แท็บการนอน */}
                  <TabsContent value="weight" className="space-y-6 mt-6">
                    <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-1">การนอนหลับ</h4>
                      <p className="text-sm text-purple-700">
                        ติดตามคุณภาพการนอนเพื่อให้แน่ใจว่าร่างกายได้พักผ่อนเพียงพอ ช่วยให้ร่างกายและสมองฟื้นฟูได้อย่างเต็มที่
                      </p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <EnhancedHealthChart
                        title="แนวโน้มการนอนหลับ"
                        description="😴 ดูคุณภาพการพักผ่อน: ชั่วโมงการนอนในแต่ละวัน | เป้าหมาย 7-8 ชั่วโมง/คืน เพื่อสุขภาพที่ดี"
                        data={realSleepData}
                        type="line"
                        color="hsl(210, 100%, 50%)"
                        unit="ชม."
                        showDataStatus={true}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>

              {/* Weekly Trends Tab */}
              <TabsContent value="weekly" className="space-y-6">
                <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
                  <h4 className="font-medium text-indigo-900 mb-1">แนวโน้มรายสัปดาห์</h4>
                  <p className="text-sm text-indigo-700">
                    ดูแนวโน้มและภาพรวมในระยะสัปดาห์ เพื่อประเมินความคืบหน้าและวางแผนสำหรับสัปดาห์ถัดไป
                  </p>
                </div>
                <Tabs defaultValue="exercise" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="exercise" className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4" />
                      ออกกำลังกาย
                    </TabsTrigger>
                    <TabsTrigger value="nutrition" className="flex items-center gap-2">
                      <Pill className="h-4 w-4" />
                      โภชนาการ
                    </TabsTrigger>
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      ภาพรวม
                    </TabsTrigger>
                  </TabsList>

                  {/* แท็บออกกำลังกาย */}
                  <TabsContent value="exercise" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <EnhancedHealthChart
                        title="แนวโน้มการออกกำลังกายรายเดือน"
                        description="นาทีการออกกำลังกายเฉลี่ยในแต่ละสัปดาห์ของเดือนนี้"
                        data={monthlyExerciseData}
                        type="bar"
                        color="hsl(200, 70%, 60%)"
                        unit="นาที"
                        showDataStatus={true}
                      />
                      <EnhancedHealthChart
                        title="แนวโน้มแคลอรี่ที่เผาผลาญรายเดือน"
                        description="แคลอรี่ที่เผาผลาญจากการออกกำลังกายในแต่ละสัปดาห์ของเดือนนี้"
                        data={monthlyCaloriesBurnedData}
                        type="bar"
                        color="hsl(0, 70%, 50%)"
                        unit="แคล"
                        showDataStatus={true}
                      />
                    </div>
                  </TabsContent>

                  {/* แท็บโภชนาการ */}
                  <TabsContent value="nutrition" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <EnhancedHealthChart
                        title="แนวโน้มโปรตีนรายสัปดาห์"
                        description="ปริมาณโปรตีนที่บริโภคในแต่ละสัปดาห์ของเดือนนี้ (กรัม)"
                        data={generateWeeklyProteinData(foodLogs)}
                        type="bar"
                        color="hsl(142, 69%, 58%)"
                        unit="กรัม"
                        showDataStatus={true}
                      />
                      <EnhancedHealthChart
                        title="แนวโน้มแคลอรี่รายสัปดาห์"
                        description="แคลอรี่ที่บริโภคในแต่ละสัปดาห์ของเดือนนี้"
                        data={generateWeeklyCaloriesData(foodLogs)}
                        type="bar"
                        color="hsl(45, 100%, 50%)"
                        unit="แคล"
                        showDataStatus={true}
                      />
                    </div>
                  </TabsContent>


                  {/* แท็บภาพรวม */}
                  <TabsContent value="overview" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <EnhancedHealthChart
                        title="สรุปกิจกรรมรายสัปดาห์"
                        description="ภาพรวมกิจกรรมสุขภาพในสัปดาห์ที่ผ่านมา"
                        data={generateWeeklyActivitySummary()}
                        type="bar"
                        color="hsl(120, 70%, 50%)"
                        unit=""
                        showDataStatus={true}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>

              {/* Calories Balance Tab */}
              <TabsContent value="balance" className="space-y-6">
                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-1">สมดุลแคลอรี่</h4>
                  <p className="text-sm text-green-700">
                    วิเคราะห์สมดุลพลังงานและสารอาหาร เพื่อให้แน่ใจว่าร่างกายได้รับพลังงานและสารอาหารที่เหมาะสมสำหรับเป้าหมายสุขภาพ
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <EnhancedHealthChart
                    title="สมดุลแคลอรี่รายวัน"
                    description="⚖️ ดูสมดุลพลังงาน: เปรียบเทียบแคลอรี่ที่บริโภค vs เผาผลาญ | ช่วยควบคุมน้ำหนักและวางแผนการออกกำลังกาย"
                    data={[
                      ...generateCaloriesBalanceData().consumed,
                      ...generateCaloriesBalanceData().burned
                    ]}
                    type="line"
                    color="hsl(120, 70%, 50%)"
                    unit="แคล"
                    showDataStatus={true}
                  />
                  <EnhancedHealthChart
                    title="สารอาหารหลัก"
                    description="🥗 ดูความสมดุล: เปรียบเทียบสารอาหารหลักกับเป้าหมาย | ช่วยให้แน่ใจว่าร่างกายได้รับสารอาหารครบถ้วน"
                    data={generateMacronutrientsData().map(item => ({
                      name: item.name,
                      value: item.current,
                      target: item.target,
                      unit: item.unit
                    }))}
                    type="bar"
                    color="hsl(142, 69%, 58%)"
                    unit="g"
                    showDataStatus={true}
                  />
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <EnhancedHealthChart
                    title="แนวโน้มระยะยาว"
                    description="📈 ดูแนวโน้ม: การเปลี่ยนแปลงการออกกำลังกายและโปรตีนใน 4 สัปดาห์ล่าสุด | ช่วยประเมินความคืบหน้าและปรับแผน"
                    data={[
                      ...generateLongTermTrendsData().exercise.map(item => ({ ...item, type: "ออกกำลังกาย" })),
                      ...generateLongTermTrendsData().protein.map(item => ({ ...item, type: "โปรตีน" }))
                    ]}
                    type="bar"
                    color="hsl(200, 70%, 60%)"
                    unit=""
                    showDataStatus={true}
                  />
                </div>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-6">
                <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-1">ประสิทธิภาพ</h4>
                  <p className="text-sm text-purple-700">
                    ประเมินประสิทธิภาพโดยรวมในด้านต่างๆ เพื่อให้เห็นภาพรวมความคืบหน้าและจุดที่ต้องปรับปรุง
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <EnhancedHealthChart
                    title="ประสิทธิภาพรายวัน"
                    description="📊 ดูคะแนนรวม: ประสิทธิภาพในแต่ละวันของสัปดาห์ (0-100%) | ช่วยติดตามความสม่ำเสมอและความคืบหน้า"
                    data={generateWeeklyPerformanceData().map(item => ({
                      name: item.name,
                      value: item.overall,
                      exercise: item.exercise,
                      sleep: item.sleep,
                      water: item.water,
                      calories: item.calories
                    }))}
                    type="line"
                    color="hsl(280, 70%, 60%)"
                    unit="%"
                    showDataStatus={true}
                  />
                  <EnhancedHealthChart
                    title="สรุปประสิทธิภาพรายสัปดาห์"
                    description="🏆 ดูคะแนนเฉลี่ย: เปรียบเทียบประสิทธิภาพในแต่ละด้าน | ช่วยระบุจุดแข็งและจุดที่ต้องปรับปรุง"
                    data={[
                      { name: "ออกกำลังกาย", value: generateWeeklyPerformanceData().reduce((sum, day) => sum + day.exercise, 0) / 7 },
                      { name: "การนอน", value: generateWeeklyPerformanceData().reduce((sum, day) => sum + day.sleep, 0) / 7 },
                      { name: "น้ำดื่ม", value: generateWeeklyPerformanceData().reduce((sum, day) => sum + day.water, 0) / 7 },
                      { name: "แคลอรี่", value: generateWeeklyPerformanceData().reduce((sum, day) => sum + day.calories, 0) / 7 }
                    ]}
                    type="bar"
                    color="hsl(45, 100%, 50%)"
                    unit="%"
                    showDataStatus={true}
                  />
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <EnhancedHealthChart
                    title="แนวโน้มระยะยาว - การออกกำลังกาย"
                    description="📈 ดูแนวโน้ม: การเปลี่ยนแปลงการออกกำลังกายและแคลอรี่ที่เผาผลาญใน 4 สัปดาห์ล่าสุด | ช่วยประเมินความคืบหน้าและวางแผน"
                    data={[
                      ...generateLongTermTrendsData().exercise.map(item => ({ ...item, type: "นาที" })),
                      ...generateLongTermTrendsData().calories.map(item => ({ ...item, type: "แคลอรี่" }))
                    ]}
                    type="line"
                    color="hsl(0, 70%, 50%)"
                    unit=""
                    showDataStatus={true}
                  />
                </div>
              </TabsContent>

              {/* Nutrition Analysis Tab */}
              <TabsContent value="nutrition" className="space-y-6">
                <div className="mb-4 p-3 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-1">การวิเคราะห์โภชนาการ</h4>
                  <p className="text-sm text-orange-700">
                    วิเคราะห์รายละเอียดสารอาหารและวิตามิน เพื่อให้แน่ใจว่าร่างกายได้รับสารอาหารครบถ้วนและอยู่ในเกณฑ์ที่เหมาะสม
                  </p>
                </div>
                {/* เพิ่ม dropdown เลือกช่วงเวลา */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">สรุปโภชนาการ</h3>
                    <p className="text-sm text-muted-foreground">
                      ข้อมูลโภชนาการ
                      {selectedNutritionPeriod === 'today' && ' วันนี้'}
                      {selectedNutritionPeriod === 'week' && ' สัปดาห์นี้'}
                      {selectedNutritionPeriod === 'month' && ' เดือนนี้'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">ช่วงเวลา:</label>
                    <Select value={selectedNutritionPeriod} onValueChange={(value: 'today' | 'week' | 'month') => setSelectedNutritionPeriod(value)}>
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Macronutrients */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <iconify-icon icon="lucide:beef" width="20" height="20"></iconify-icon>
                      สารอาหารหลัก (Macronutrients)
                    </h4>
                    <div className="space-y-3">
                      {(() => {
                        const periodTargets = getNutritionTargetsForPeriod(selectedNutritionPeriod);
                        return [
                          { key: 'protein', label: 'โปรตีน', current: currentNutritionData?.total_protein || 0, target: periodTargets.protein, unit: 'g' },
                          { key: 'carbs', label: 'คาร์โบไฮเดรต', current: currentNutritionData?.total_carbs || 0, target: periodTargets.carbs, unit: 'g' },
                          { key: 'fats', label: 'ไขมัน', current: currentNutritionData?.total_fat || 0, target: periodTargets.fats, unit: 'g' },
                          { key: 'fiber', label: 'ไฟเบอร์', current: currentNutritionData?.total_fiber || 0, target: periodTargets.fiber, unit: 'g' }
                        ];
                      })().map(({ key, label, current, target, unit }) => {
                        const status = getNutritionStatus(current, target);
                        return (
                          <div key={key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              {getNutritionIcon(status)}
                              <div>
                                <div className="font-medium">{label}</div>
                                <div className="text-sm text-muted-foreground">
                                  {current}/{target} {unit}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getNutritionBadge(status)}
                              <div className="text-xs text-muted-foreground">
                                {status === 'deficient' ? `ขาด ${target - current} ${unit}` :
                                  status === 'excessive' ? `เกิน ${current - target} ${unit}` :
                                    'เหมาะสม'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Micronutrients */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <Pill className="h-5 w-5" />
                      วิตามินและแร่ธาตุ (Micronutrients)
                    </h4>
                    <div className="space-y-3">
                      {(() => {
                        const periodTargets = getNutritionTargetsForPeriod(selectedNutritionPeriod);
                        return [
                          { key: 'vitaminC', label: 'วิตามิน C', current: 0, target: periodTargets.vitaminC, unit: 'mg' },
                          { key: 'vitaminD', label: 'วิตามิน D', current: 0, target: periodTargets.vitaminD, unit: 'mcg' },
                          { key: 'calcium', label: 'แคลเซียม', current: 0, target: periodTargets.calcium, unit: 'mg' },
                          { key: 'iron', label: 'เหล็ก', current: 0, target: periodTargets.iron, unit: 'mg' },
                          { key: 'potassium', label: 'โพแทสเซียม', current: 0, target: periodTargets.potassium, unit: 'mg' },
                          { key: 'sodium', label: 'โซเดียม', current: currentNutritionData?.total_sodium || 0, target: periodTargets.sodium, unit: 'mg' }
                        ];
                      })().map(({ key, label, current, target, unit }) => {
                        const status = getNutritionStatus(current, target);
                        return (
                          <div key={key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              {getNutritionIcon(status)}
                              <div>
                                <div className="font-medium">{label}</div>
                                <div className="text-sm text-muted-foreground">
                                  {current}/{target} {unit}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getNutritionBadge(status)}
                              <div className="text-xs text-muted-foreground">
                                {status === 'deficient' ? `ขาด ${target - current} ${unit}` :
                                  status === 'excessive' ? `เกิน ${current - target} ${unit}` :
                                    'เหมาะสม'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Health Insights Tab */}
              <TabsContent value="insights" className="space-y-6">
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-1">ข้อมูลเชิงลึก</h4>
                  <p className="text-sm text-gray-700">
                    ตรวจสอบสถานะข้อมูลและระบบ เพื่อให้แน่ใจว่าข้อมูลที่แสดงเป็นข้อมูลจริงและอัปเดตล่าสุด
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className={sleepStats ? "bg-green-100 text-green-800" : "bg-accent/10 text-accent"}>
                        {sleepStats ? "ข้อมูลจริง" : "รอข้อมูล"}
                      </Badge>
                      <span className="text-sm font-medium">
                        {sleepStats ? "ข้อมูลการนอนหลับจาก API" : "รอ API ข้อมูลการนอนหลับ"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {sleepStats
                        ? `วันนี้: ${todaySleepHours.toFixed(1)} / 8 ชั่วโมง (average_sleep_duration_hours: ${sleepStats.average_sleep_duration_hours || 0})`
                        : "รอ API ข้อมูลการนอนหลับเพื่อแสดงสถิติและแนวโน้ม"
                      }
                    </p>

                    <div className="flex items-center gap-2">
                      <Badge className={waterStats ? "bg-green-100 text-green-800" : "bg-warning/10 text-warning"}>
                        {waterStats ? "ข้อมูลจริง" : "รอข้อมูล"}
                      </Badge>
                      <span className="text-sm font-medium">
                        {waterStats ? "ข้อมูลการดื่มน้ำจาก API" : "รอ API ข้อมูลการดื่มน้ำ"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {waterStats
                        ? `เฉลี่ย ${waterStats.average_liters?.toFixed(1) || 0} ลิตร/วัน จาก ${waterLogs.length} รายการ`
                        : "รอ API ข้อมูลการดื่มน้ำเพื่อแสดงสถิติและแนวโน้ม"
                      }
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-accent/10 text-accent">ข้อมูลจริง</Badge>
                      <span className="text-sm font-medium">การออกกำลังกายจาก API</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ข้อมูลการออกกำลังกายแสดงจาก API จริง ไม่ใช่ Mock Data
                    </p>

                    <div className="flex items-center gap-2">
                      <Badge className="bg-secondary/10 text-secondary">รอข้อมูล</Badge>
                      <span className="text-sm font-medium">รอ API ข้อมูลอารมณ์</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      รอ API ข้อมูลอารมณ์เพื่อแสดงสถิติและแนวโน้ม
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* ข้อมูลการออกกำลังกาย */}
        {exerciseStats && (
          <Card className="health-stat-card bg-white rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                สถิติการออกกำลังกาย
              </CardTitle>
              <CardDescription>
                สถิติการออกกำลังกายของคุณจากข้อมูลจริง
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{exerciseStats.total_exercises}</div>
                  <div className="text-sm text-muted-foreground">ครั้งที่ออกกำลังกาย</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{exerciseStats.total_duration}</div>
                  <div className="text-sm text-muted-foreground">นาทีรวม</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{exerciseStats.total_calories_burned}</div>
                  <div className="text-sm text-muted-foreground">แคลอรีรวม</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{exerciseStats.total_distance}</div>
                  <div className="text-sm text-muted-foreground">กม. รวม</div>
                </div>
              </div>

              {/* แสดงข้อมูลแยกตามประเภทและความหนัก */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-sm mb-3">แยกตามประเภท</h4>
                  <div className="space-y-2">
                    {exerciseStats.exercises_by_type && Object.entries(exerciseStats.exercises_by_type).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{type === 'cardio' ? 'คาร์ดิโอ' : type === 'strength' ? 'ยกน้ำหนัก' : type}</span>
                        <Badge variant="secondary">{String(count)} ครั้ง</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-3">แยกตามความหนัก</h4>
                  <div className="space-y-2">
                    {exerciseStats.exercises_by_intensity && Object.entries(exerciseStats.exercises_by_intensity).map(([intensity, count]) => (
                      <div key={intensity} className="flex items-center justify-between">
                        <span className="text-sm capitalize">
                          {intensity === 'low' ? 'ต่ำ' : intensity === 'moderate' ? 'ปานกลาง' : intensity === 'high' ? 'สูง' : intensity}
                        </span>
                        <Badge variant="secondary">{String(count)} ครั้ง</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        )}

        {/* ข้อมูลอาหารและโภชนาการ */}
        {(nutritionAnalysis || foodLogSummary || dashboardData) && (
          <Card className="health-stat-card bg-white rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5" />
                สถิติอาหารและโภชนาการ
              </CardTitle>
              <CardDescription>
                ข้อมูลอาหารและโภชนาการของคุณจากข้อมูลจริง
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {selectedNutritionPeriod === 'today' ? todayCalories : currentNutritionData?.total_calories || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    แคลอรี่{selectedNutritionPeriod === 'today' ? 'วันนี้' : selectedNutritionPeriod === 'week' ? 'สัปดาห์นี้' : 'เดือนนี้'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedNutritionPeriod === 'today' ?
                      foodLogs.reduce((sum, log) => sum + (log.protein_g || 0), 0) :
                      currentNutritionData?.total_protein || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">โปรตีน (g)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedNutritionPeriod === 'today' ?
                      foodLogs.reduce((sum, log) => sum + (log.carbs_g || 0), 0) :
                      currentNutritionData?.total_carbs || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">คาร์โบไฮเดรต (g)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {selectedNutritionPeriod === 'today' ?
                      foodLogs.reduce((sum, log) => sum + (log.fat_g || 0), 0) :
                      currentNutritionData?.total_fat || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">ไขมัน (g)</div>
                </div>
              </div>

              {/* แสดงข้อมูลมื้ออาหาร */}
              {foodLogs && foodLogs.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-sm mb-3">แคลอรี่แยกตามมื้ออาหาร</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
                      // กรองเฉพาะข้อมูลของวันนี้
                      const today = getLocalDateString();
                      const todayMealLogs = foodLogs.filter(log => {
                        const logDate = log.consumed_at ? getLocalDateString(new Date(log.consumed_at)) : null;
                        return log.meal_type === mealType && logDate === today;
                      });

                      const calories = todayMealLogs.reduce((sum, log) => {
                        const logCalories = log.calories_per_serving || (log as any).calories || (log as any).total_calories || 0;
                        return sum + Number(logCalories);
                      }, 0);


                      return (
                        <div key={mealType} className="text-center p-3 bg-muted/30 rounded-lg">
                          <div className="text-lg font-semibold text-primary">
                            {calories} แคล
                          </div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {mealType === 'breakfast' ? 'อาหารเช้า' :
                              mealType === 'lunch' ? 'อาหารกลางวัน' :
                                mealType === 'dinner' ? 'อาหารเย็น' : 'ของว่าง'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* แสดงคำแนะนำจาก AI */}
              {nutritionAnalysis?.recommendations && (
                <div className="mt-6">
                  <h4 className="font-semibold text-sm mb-3">คำแนะนำจาก AI</h4>
                  <div className="space-y-2">
                    {nutritionAnalysis.recommendations.map((recommendation: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-blue-800">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* แสดงข้อมูลเชิงลึก */}
              {nutritionAnalysis?.insights && (
                <div className="mt-6">
                  <h4 className="font-semibold text-sm mb-3">ข้อมูลเชิงลึก</h4>
                  <div className="space-y-2">
                    {nutritionAnalysis.insights.map((insight: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-green-800">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}



        {/* Today's Summary */}
        <Card className="health-stat-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <iconify-icon icon="lucide:activity" width="20" height="20"></iconify-icon>
              สรุปประจำวัน
            </CardTitle>
            <CardDescription>
              ข้อมูลสุขภาพของคุณในวันนี้
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">ความคืบหน้าการนอน</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((todaySleepHours / 8) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((todaySleepHours / 8) * 100, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">ความคืบหน้าการดื่มน้ำ</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((todayWaterLiters / 2.5) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((todayWaterLiters / 2.5) * 100, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">ความคืบหน้าแคลอรี่</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((todayCalories / (tdee || 2342)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((todayCalories / (tdee || 2342)) * 100, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">ความคืบหน้าการออกกำลังกาย</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((exerciseStats?.total_duration || 0) / mockHealthData.exercise.target * 100)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((exerciseStats?.total_duration || 0) / mockHealthData.exercise.target * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2">คำแนะนำสำหรับวันนี้</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• ดื่มน้ำเพิ่มอีก {Math.max(0, 2.5 - todayWaterLiters).toFixed(1)} ลิตร</li>
                    <li>• นอนให้ครบ {Math.max(0, 8 - todaySleepHours).toFixed(1)} ชั่วโมง (ปัจจุบัน {todaySleepHours.toFixed(1)}/8 ชม.)</li>
                    <li>• ออกกำลังกายเพิ่มอีก {Math.max(0, 45 - (exerciseStats?.total_duration || 0))} นาที</li>
                    {currentNutritionData?.total_protein !== undefined && (
                      <li>• เพิ่มโปรตีนอีก {Math.max(0, 80 - currentNutritionData.total_protein)} กรัม</li>
                    )}
                    {currentNutritionData?.total_carbs !== undefined && (
                      <li>• เพิ่มคาร์โบไฮเดรตอีก {Math.max(0, 250 - currentNutritionData.total_carbs)} กรัม</li>
                    )}
                    {currentNutritionData?.total_fat !== undefined && (
                      <li>• เพิ่มไขมันอีก {Math.max(0, 65 - currentNutritionData.total_fat)} กรัม</li>
                    )}
                    {currentNutritionData?.total_fiber !== undefined && (
                      <li>• เพิ่มไฟเบอร์อีก {Math.max(0, 25 - currentNutritionData.total_fiber)} กรัม</li>
                    )}
                    {!nutritionAnalysis && (
                      <li>• รอข้อมูลโภชนาการเพื่อคำแนะนำที่แม่นยำ</li>
                    )}
                  </ul>
                </div>

                <div className="text-center">
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/chat">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      ขอคำแนะนำเพิ่มเติมจาก AI
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}