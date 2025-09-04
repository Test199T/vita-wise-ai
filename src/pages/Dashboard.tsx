import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { HealthCard } from "@/components/health/HealthCard";
import { HealthChart } from "@/components/health/HealthChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// lucide-react kept for inlined status icons/badges; main tiles use Iconify via HealthCard
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, MessageCircle, Calendar, Pill, BarChart3, Target, Clock, LineChart, Dumbbell, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { tokenUtils } from "@/lib/utils";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

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

// สร้างข้อมูลแคลอรี่จาก API
const generateCaloriesData = (weeklyTrends?: any[]) => {
  const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"];
  
  if (!weeklyTrends || weeklyTrends.length === 0) {
    return days.map(day => ({ name: day, value: 0 }));
  }
  
  return days.map((day, index) => {
    const trendData = weeklyTrends[index];
    return {
      name: day,
      value: trendData?.calories || 0
    };
  });
};

const proteinData = [
  { name: "จันทร์", value: 0 },
  { name: "อังคาร", value: 0 },
  { name: "พุธ", value: 0 },
  { name: "พฤหัส", value: 0 },
  { name: "ศุกร์", value: 0 },
  { name: "เสาร์", value: 0 },
  { name: "อาทิตย์", value: 0 },
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
  
  const { toast } = useToast();

  // ตรวจสอบว่าผู้ใช้ล็อกอินแล้วหรือไม่
  useEffect(() => {
    // เพิ่มการตรวจสอบที่เหมาะสมมากขึ้น
    const checkAuth = () => {
      if (!tokenUtils.isLoggedIn()) {
        console.log('🚫 Dashboard: ผู้ใช้ไม่ได้เข้าสู่ระบบ - เปลี่ยนไปยังหน้า login');
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

  // ฟังก์ชันโหลดข้อมูลอาหารและโภชนาการจาก Backend
  const loadFoodData = async () => {
    if (isLoadingFoodData) return;
    
    setIsLoadingFoodData(true);
    
    try {
      console.log('📥 โหลดข้อมูลอาหารและโภชนาการจาก Backend...');
      
      // 1. โหลดการวิเคราะห์โภชนาการ
      const nutritionResponse = await apiService.getNutritionAnalysis();
      if (nutritionResponse?.data) {
        setNutritionAnalysis(nutritionResponse.data);
        console.log('✅ โหลดการวิเคราะห์โภชนาการสำเร็จ:', nutritionResponse.data);
      }
      
      // 2. โหลดสรุปอาหารประจำวัน
      const summaryResponse = await apiService.getFoodLogSummary();
      if (summaryResponse?.data) {
        setFoodLogSummary(summaryResponse.data);
        console.log('✅ โหลดสรุปอาหารประจำวันสำเร็จ:', summaryResponse.data);
      }
      
      // 3. โหลดข้อมูล Dashboard
      const dashboardResponse = await apiService.getFoodLogDashboard();
      if (dashboardResponse?.data) {
        setDashboardData(dashboardResponse.data);
        console.log('✅ โหลดข้อมูล Dashboard สำเร็จ:', dashboardResponse.data);
      }
      
      toast({ 
        title: 'โหลดข้อมูลสำเร็จ', 
        description: 'โหลดข้อมูลอาหารและโภชนาการเรียบร้อยแล้ว' 
      });
      
    } catch (error) {
      console.error('❌ Error loading food data:', error);
      
      let errorMessage = 'ไม่สามารถโหลดข้อมูลอาหารและโภชนาการได้';
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
      setIsLoadingFoodData(false);
    }
  };

  // ฟังก์ชันโหลดข้อมูลการออกกำลังกายจาก Backend
  const loadExerciseData = async () => {
    if (isLoadingExerciseData) return;
    
    setIsLoadingExerciseData(true);
    
    try {
      console.log('📥 โหลดข้อมูลการออกกำลังกายจาก Backend...');
      
      // 1. โหลดสถิติรวม
      const statsResponse = await apiService.getExerciseStats();
      if (statsResponse?.data) {
        setExerciseStats(statsResponse.data);
        console.log('✅ โหลดสถิติสำเร็จ:', statsResponse.data);
      }
      
      // 2. โหลดสรุปแคลอรี
      const caloriesResponse = await apiService.getCaloriesSummary();
      if (caloriesResponse?.data) {
        setCaloriesSummary(caloriesResponse.data);
        console.log('✅ โหลดสรุปแคลอรีสำเร็จ:', caloriesResponse.data);
      }
      
      // 3. โหลด Exercise Streak
      const streakResponse = await apiService.getExerciseStreak();
      if (streakResponse?.data) {
        setExerciseStreak(streakResponse.data);
        console.log('✅ โหลด Exercise Streak สำเร็จ:', streakResponse.data);
      }
      
      // 4. โหลดรายการล่าสุด
      const recentResponse = await apiService.getExerciseLogs(); // 5 รายการล่าสุด
      if (recentResponse && recentResponse.length > 0) {
        setRecentExercises(recentResponse.slice(0, 5)); // เอาแค่ 5 รายการแรก
        console.log('✅ โหลดรายการล่าสุดสำเร็จ:', recentResponse.length, 'รายการ');
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

  // โหลดข้อมูลการออกกำลังกายเมื่อเปิดหน้า
  useEffect(() => {
    loadExerciseData();
  }, []);

  // โหลดข้อมูลอาหารและโภชนาการเมื่อเปิดหน้า
  useEffect(() => {
    loadFoodData();
  }, []);

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
          const dayIndex = exerciseDate.getDay() === 0 ? 6 : exerciseDate.getDay() - 1; // แปลง Sunday=0 ให้เป็น index 6
          chartData[dayIndex].value += exercise.duration_minutes || 0;
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

  const realExerciseData = generateExerciseChartData();

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
          
          {/* ปุ่มรีเฟรชข้อมูล */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={loadExerciseData}
              disabled={isLoadingExerciseData}
              className="gap-2"
            >
              <svg className={`h-4 w-4 ${isLoadingExerciseData ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isLoadingExerciseData ? 'กำลังโหลด...' : 'รีเฟรชข้อมูลการออกกำลังกาย'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={loadFoodData}
              disabled={isLoadingFoodData}
              className="gap-2"
            >
              <svg className={`h-4 w-4 ${isLoadingFoodData ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.001 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isLoadingFoodData ? 'กำลังโหลด...' : 'รีเฟรชข้อมูลอาหาร'}
            </Button>
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
              <div className="font-semibold">{mockHealthData.sleep.hours} ชม. • เป้าหมาย {mockHealthData.sleep.target}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">โภชนาการ</div>
              <div className="font-semibold">
                แคลอรี่วันนี้ {dashboardData?.today?.nutrition?.calories || 0} แคล
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
              <div className="font-semibold">{mockHealthData.water.liters} ลิตร/วัน</div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                {dashboardData?.today?.nutrition?.meals_logged || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData?.today?.nutrition?.meals_logged ? 'มื้ออาหารที่บันทึก' : 'รอข้อมูลมื้ออาหาร'}
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
                {dashboardData?.quick_stats?.average_daily_calories ? 
                  Math.round(dashboardData.quick_stats.average_daily_calories) : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData?.quick_stats?.average_daily_calories ? 'แคลอรี่เฉลี่ยต่อวัน' : 'รอข้อมูลแคลอรี่'}
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
        </div>

        {/* Health Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <HealthCard
            title="การนอนหลับ"
            value={`${mockHealthData.sleep.hours} ชั่วโมง`}
            description={`เป้าหมาย ${mockHealthData.sleep.target} ชั่วโมง`}
            icon="lucide:moon"
            trend={mockHealthData.sleep.trend as "up" | "down" | "stable"}
            color="primary"
          />

          <HealthCard
            title="น้ำดื่ม"
            value={`${mockHealthData.water.liters} ลิตร`}
            description={`เป้าหมาย ${mockHealthData.water.target} ลิตร`}
            icon="lucide:droplets"
            trend={mockHealthData.water.trend as "up" | "down" | "stable"}
            color="secondary"
          />
          <HealthCard
            title="แคลอรี่"
            value={`${dashboardData?.today?.nutrition?.calories || 0} แคล`}
            description={`เป้าหมาย ${tdee || 2000} แคล`}
            icon="lucide:utensils"
            trend={dashboardData?.today?.nutrition?.calories > 0 ? "up" : "stable" as "up" | "down" | "stable"}
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="daily" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  รายวัน
                </TabsTrigger>
                <TabsTrigger value="weekly" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  รายสัปดาห์
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <HealthChart
                    title="แนวโน้มการนอนหลับ"
                    description="ชั่วโมงการนอนหลับในสัปดาห์ที่ผ่านมา"
                    data={sleepData}
                    type="line"
                    color="hsl(197, 76%, 64%)"
                  />
                                     <HealthChart
                     title="แนวโน้มการออกกำลังกาย"
                     description="นาทีการออกกำลังกายในสัปดาห์ที่ผ่านมา"
                     data={realExerciseData}
                     type="line"
                     color="hsl(200, 70%, 60%)"
                   />
                  <HealthChart
                    title="แนวโน้มการดื่มน้ำ"
                    description="ลิตรน้ำที่ดื่มในสัปดาห์ที่ผ่านมา"
                    data={waterData}
                    type="line"
                    color="hsl(210, 100%, 50%)"
                  />
                  <HealthChart
                    title="แนวโน้มแคลอรี่"
                    description="แคลอรี่ที่บริโภคในสัปดาห์ที่ผ่านมา"
                    data={generateCaloriesData(dashboardData?.weekly_trends)}
                    type="line"
                    color="hsl(45, 100%, 50%)"
                  />
                </div>
              </TabsContent>

              {/* Weekly Trends Tab */}
              <TabsContent value="weekly" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <HealthChart
                    title="แนวโน้มการนอนหลับรายสัปดาห์"
                    description="ชั่วโมงการนอนหลับเฉลี่ยในแต่ละสัปดาห์"
                    data={sleepWeeklyData}
                    type="line"
                    color="hsl(197, 76%, 64%)"
                  />
                  <HealthChart
                    title="ระดับอารมณ์"
                    description="ระดับอารมณ์เฉลี่ยในแต่ละวัน (1-5)"
                    data={moodWeeklyData}
                    type="line"
                    color="hsl(43, 89%, 62%)"
                  />
                  <HealthChart
                    title="แนวโน้มโปรตีน"
                    description="ปริมาณโปรตีนที่บริโภคในแต่ละวัน"
                    data={proteinData}
                    type="bar"
                    color="hsl(142, 69%, 58%)"
                  />
                                     <HealthChart
                     title="แนวโน้มการออกกำลังกายรายสัปดาห์"
                     description="นาทีการออกกำลังกายเฉลี่ยในแต่ละสัปดาห์"
                     data={realExerciseData}
                     type="bar"
                     color="hsl(200, 70%, 60%)"
                   />
                </div>
              </TabsContent>

              {/* Nutrition Analysis Tab */}
              <TabsContent value="nutrition" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Macronutrients */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <iconify-icon icon="lucide:beef" width="20" height="20"></iconify-icon>
                      สารอาหารหลัก (Macronutrients)
                    </h4>
                    <div className="space-y-3">
                      {[
                        { key: 'protein', label: 'โปรตีน', current: nutritionAnalysis?.total_protein || 0, target: nutritionTargets.protein, unit: 'g' },
                        { key: 'carbs', label: 'คาร์โบไฮเดรต', current: nutritionAnalysis?.total_carbs || 0, target: nutritionTargets.carbs, unit: 'g' },
                        { key: 'fats', label: 'ไขมัน', current: nutritionAnalysis?.total_fat || 0, target: nutritionTargets.fats, unit: 'g' },
                        { key: 'fiber', label: 'ไฟเบอร์', current: nutritionAnalysis?.total_fiber || 0, target: nutritionTargets.fiber, unit: 'g' }
                      ].map(({ key, label, current, target, unit }) => {
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
                      {[
                        { key: 'vitaminC', label: 'วิตามิน C', current: 0, target: nutritionTargets.vitaminC, unit: 'mg' },
                        { key: 'vitaminD', label: 'วิตามิน D', current: 0, target: nutritionTargets.vitaminD, unit: 'mcg' },
                        { key: 'calcium', label: 'แคลเซียม', current: 0, target: nutritionTargets.calcium, unit: 'mg' },
                        { key: 'iron', label: 'เหล็ก', current: 0, target: nutritionTargets.iron, unit: 'mg' },
                        { key: 'potassium', label: 'โพแทสเซียม', current: 0, target: nutritionTargets.potassium, unit: 'mg' },
                        { key: 'sodium', label: 'โซเดียม', current: nutritionAnalysis?.total_sodium || 0, target: nutritionTargets.sodium, unit: 'mg' }
                      ].map(({ key, label, current, target, unit }) => {
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-4">
                                         <div className="flex items-center gap-2">
                       <Badge className="bg-accent/10 text-accent">รอข้อมูล</Badge>
                       <span className="text-sm font-medium">รอ API ข้อมูลการนอนหลับ</span>
                     </div>
                     <p className="text-sm text-muted-foreground">
                       รอ API ข้อมูลการนอนหลับเพื่อแสดงสถิติและแนวโน้ม
                     </p>

                                         <div className="flex items-center gap-2">
                       <Badge className="bg-warning/10 text-warning">รอข้อมูล</Badge>
                       <span className="text-sm font-medium">รอ API ข้อมูลการดื่มน้ำ</span>
                     </div>
                     <p className="text-sm text-muted-foreground">
                       รอ API ข้อมูลการดื่มน้ำเพื่อแสดงสถิติและแนวโน้ม
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
                    {dashboardData?.today?.nutrition?.calories || nutritionAnalysis?.total_calories || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">แคลอรี่วันนี้</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {dashboardData?.today?.nutrition?.protein || nutritionAnalysis?.total_protein || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">โปรตีน (g)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {dashboardData?.today?.nutrition?.carbs || nutritionAnalysis?.total_carbs || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">คาร์โบไฮเดรต (g)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {dashboardData?.today?.nutrition?.fat || nutritionAnalysis?.total_fat || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">ไขมัน (g)</div>
                </div>
              </div>
              
              {/* แสดงข้อมูลมื้ออาหาร */}
              {dashboardData?.today?.meal_distribution && (
                <div className="mt-6">
                  <h4 className="font-semibold text-sm mb-3">แคลอรี่แยกตามมื้ออาหาร</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(dashboardData.today.meal_distribution).map(([meal, calories]) => (
                      <div key={meal} className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-lg font-semibold text-primary">
                          {calories as number} แคล
                        </div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {meal === 'breakfast' ? 'อาหารเช้า' : 
                           meal === 'lunch' ? 'อาหารกลางวัน' : 
                           meal === 'dinner' ? 'อาหารเย็น' : 'ของว่าง'}
                        </div>
                      </div>
                    ))}
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
                    {Math.round((mockHealthData.sleep.hours / mockHealthData.sleep.target) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((mockHealthData.sleep.hours / mockHealthData.sleep.target) * 100, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">ความคืบหน้าการดื่มน้ำ</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((mockHealthData.water.liters / mockHealthData.water.target) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((mockHealthData.water.liters / mockHealthData.water.target) * 100, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">ความคืบหน้าแคลอรี่</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(((dashboardData?.today?.nutrition?.calories || 0) / (tdee || 2000)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(((dashboardData?.today?.nutrition?.calories || 0) / (tdee || 2000)) * 100, 100)}%` }}
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
                    <li>• ดื่มน้ำเพิ่มอีก {mockHealthData.water.target - mockHealthData.water.liters} ลิตร</li>
                    <li>• นอนให้ครบ {mockHealthData.sleep.target} ชั่วโมง</li>
                    <li>• ออกกำลังกายเพิ่มอีก {mockHealthData.exercise.target - (exerciseStats?.total_duration || 0)} นาที</li>
                    {nutritionAnalysis?.total_protein !== undefined && (
                      <li>• เพิ่มโปรตีนอีก {Math.max(0, 80 - nutritionAnalysis.total_protein)} กรัม</li>
                    )}
                    {nutritionAnalysis?.total_carbs !== undefined && (
                      <li>• เพิ่มคาร์โบไฮเดรตอีก {Math.max(0, 250 - nutritionAnalysis.total_carbs)} กรัม</li>
                    )}
                    {nutritionAnalysis?.total_fat !== undefined && (
                      <li>• เพิ่มไขมันอีก {Math.max(0, 65 - nutritionAnalysis.total_fat)} กรัม</li>
                    )}
                    {nutritionAnalysis?.total_fiber !== undefined && (
                      <li>• เพิ่มไฟเบอร์อีก {Math.max(0, 25 - nutritionAnalysis.total_fiber)} กรัม</li>
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