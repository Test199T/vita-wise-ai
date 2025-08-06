import { MainLayout } from "@/components/layout/MainLayout";
import { HealthCard } from "@/components/health/HealthCard";
import { HealthChart } from "@/components/health/HealthChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Moon,
  Footprints,
  Utensils,
  Droplets,
  Activity,
  TrendingUp,
  MessageCircle,
  Calendar,
  Beef,
  Wheat,
  Zap,
  Apple,
  Pill,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  TrendingDown,
  Award,
  Target,
  Clock,
  LineChart
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

// จำลองข้อมูลสุขภาพ
const mockHealthData = {
  sleep: { hours: 7.5, trend: "up", target: 8 },
  water: { liters: 1.8, trend: "stable", target: 2.5 },
  calories: { count: 1850, trend: "down", target: 2000 },
  exercise: { minutes: 35, trend: "up", target: 45 },
};

// ข้อมูลโภชนาการ
const nutritionData = {
  protein: { current: 65, target: 80, unit: "g", trend: "down" },
  carbs: { current: 220, target: 250, unit: "g", trend: "stable" },
  fats: { current: 75, target: 65, unit: "g", trend: "up" },
  fiber: { current: 18, target: 25, unit: "g", trend: "down" },
  vitaminC: { current: 45, target: 90, unit: "mg", trend: "down" },
  vitaminD: { current: 8, target: 15, unit: "mcg", trend: "down" },
  calcium: { current: 850, target: 1000, unit: "mg", trend: "down" },
  iron: { current: 12, target: 18, unit: "mg", trend: "down" },
  potassium: { current: 2800, target: 3500, unit: "mg", trend: "down" },
  sodium: { current: 2800, target: 2300, unit: "mg", trend: "up" },
};

const sleepData = [
  { name: "จันทร์", value: 7 },
  { name: "อังคาร", value: 6.5 },
  { name: "พุธ", value: 8 },
  { name: "พฤหัส", value: 7.5 },
  { name: "ศุกร์", value: 6 },
  { name: "เสาร์", value: 8.5 },
  { name: "อาทิตย์", value: 7.5 },
];

const exerciseData = [
  { name: "จันทร์", value: 30 },
  { name: "อังคาร", value: 40 },
  { name: "พุธ", value: 35 },
  { name: "พฤหัส", value: 38 },
  { name: "ศุกร์", value: 32 },
  { name: "เสาร์", value: 45 },
  { name: "อาทิตย์", value: 37 },
];

const waterData = [
  { name: "จันทร์", value: 2.2 },
  { name: "อังคาร", value: 1.8 },
  { name: "พุธ", value: 2.5 },
  { name: "พฤหัส", value: 2.0 },
  { name: "ศุกร์", value: 1.5 },
  { name: "เสาร์", value: 2.8 },
  { name: "อาทิตย์", value: 1.8 },
];

const caloriesData = [
  { name: "จันทร์", value: 1950 },
  { name: "อังคาร", value: 2100 },
  { name: "พุธ", value: 1850 },
  { name: "พฤหัส", value: 2200 },
  { name: "ศุกร์", value: 1750 },
  { name: "เสาร์", value: 2300 },
  { name: "อาทิตย์", value: 1850 },
];

const proteinData = [
  { name: "จันทร์", value: 75 },
  { name: "อังคาร", value: 85 },
  { name: "พุธ", value: 70 },
  { name: "พฤหัส", value: 90 },
  { name: "ศุกร์", value: 65 },
  { name: "เสาร์", value: 95 },
  { name: "อาทิตย์", value: 65 },
];

// ข้อมูลสถิติเพิ่มเติม
const sleepWeeklyData = [
  { name: "สัปดาห์ 1", value: 7.2 },
  { name: "สัปดาห์ 2", value: 6.8 },
  { name: "สัปดาห์ 3", value: 7.5 },
  { name: "สัปดาห์ 4", value: 7.8 },
];

const moodWeeklyData = [
  { name: "จันทร์", value: 4 },
  { name: "อังคาร", value: 3 },
  { name: "พุธ", value: 5 },
  { name: "พฤหัส", value: 4 },
  { name: "ศุกร์", value: 2 },
  { name: "เสาร์", value: 5 },
  { name: "อาทิตย์", value: 4 },
];

const achievements = [
  { title: "นักเดินทางแห่งสุขภาพ", description: "เดินครบเป้าหมาย 7 วันติดต่อกัน", icon: "🏃‍♂️" },
  { title: "ผู้ดื่มน้ำมาสเตอร์", description: "ดื่มน้ำครบเป้าหมาย 30 วันติดต่อกัน", icon: "💧" },
  { title: "นักนอนมืออาชีพ", description: "นอนครบ 8 ชั่วโมง 5 วันติดต่อกัน", icon: "😴" },
  { title: "ผู้ดูแลตนเองขั้นเทพ", description: "บันทึกข้อมูลครบทุกวันเป็นเวลา 1 เดือน", icon: "🏆" },
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
  const [period, setPeriod] = useState("week");

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
            <Button asChild className="health-button">
              <Link to="/chat">
                <MessageCircle className="h-4 w-4 mr-2" />
                คุยกับ AI
              </Link>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="min-h-[140px] flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">การปรับปรุงโดยรวม</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">+15%</div>
              <p className="text-xs text-muted-foreground">
                เปรียบเทียบกับเดือนที่แล้ว
              </p>
            </CardContent>
          </Card>

          <Card className="min-h-[140px] flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">วันที่บันทึกข้อมูล</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24/30</div>
              <p className="text-xs text-muted-foreground">
                วันในเดือนนี้
              </p>
            </CardContent>
          </Card>

          <Card className="min-h-[140px] flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">เป้าหมายที่บรรลุ</CardTitle>
              <Target className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18/21</div>
              <p className="text-xs text-muted-foreground">
                เป้าหมายสัปดาห์นี้
              </p>
            </CardContent>
          </Card>

          <Card className="min-h-[140px] flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">การออกกำลังกายเฉลี่ย</CardTitle>
              <Activity className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">36 นาที</div>
              <p className="text-xs text-muted-foreground">
                ต่อวันในสัปดาห์นี้
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
            icon={Moon}
            trend={mockHealthData.sleep.trend as "up" | "down" | "stable"}
            color="primary"
          />

          <HealthCard
            title="น้ำดื่ม"
            value={`${mockHealthData.water.liters} ลิตร`}
            description={`เป้าหมาย ${mockHealthData.water.target} ลิตร`}
            icon={Droplets}
            trend={mockHealthData.water.trend as "up" | "down" | "stable"}
            color="secondary"
          />
          <HealthCard
            title="แคลอรี่"
            value={`${mockHealthData.calories.count} แคล`}
            description={`เป้าหมาย ${mockHealthData.calories.target} แคล`}
            icon={Utensils}
            trend={mockHealthData.calories.trend as "up" | "down" | "stable"}
            color="warning"
          />
          <HealthCard
            title="การออกกำลังกาย"
            value={`${mockHealthData.exercise.minutes} นาที`}
            description={`เป้าหมาย ${mockHealthData.exercise.target} นาที`}
            icon={Activity}
            trend={mockHealthData.exercise.trend as "up" | "down" | "stable"}
            color="accent"
          />
        </div>

        {/* Charts with Tabs */}
        <Card className="health-stat-card">
          <CardHeader>
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
                  <Apple className="h-4 w-4" />
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
                    data={exerciseData}
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
                    data={caloriesData}
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
                    data={exerciseData}
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
                      <Beef className="h-5 w-5" />
                      สารอาหารหลัก (Macronutrients)
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(nutritionData).slice(0, 4).map(([key, data]) => {
                        const status = getNutritionStatus(data.current, data.target);
                        return (
                          <div key={key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              {getNutritionIcon(status)}
                              <div>
                                <div className="font-medium capitalize">
                                  {key === 'protein' ? 'โปรตีน' : 
                                   key === 'carbs' ? 'คาร์โบไฮเดรต' : 
                                   key === 'fats' ? 'ไขมัน' : 'ไฟเบอร์'}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {data.current}/{data.target} {data.unit}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getNutritionBadge(status)}
                              <div className="text-xs text-muted-foreground">
                                {status === 'deficient' ? `ขาด ${data.target - data.current} ${data.unit}` :
                                 status === 'excessive' ? `เกิน ${data.current - data.target} ${data.unit}` :
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
                      {Object.entries(nutritionData).slice(4).map(([key, data]) => {
                        const status = getNutritionStatus(data.current, data.target);
                        return (
                          <div key={key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              {getNutritionIcon(status)}
                              <div>
                                <div className="font-medium capitalize">
                                  {key === 'vitaminC' ? 'วิตามิน C' : 
                                   key === 'vitaminD' ? 'วิตามิน D' : 
                                   key === 'calcium' ? 'แคลเซียม' : 
                                   key === 'iron' ? 'เหล็ก' : 
                                   key === 'potassium' ? 'โพแทสเซียม' : 'โซเดียม'}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {data.current}/{data.target} {data.unit}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getNutritionBadge(status)}
                              <div className="text-xs text-muted-foreground">
                                {status === 'deficient' ? `ขาด ${data.target - data.current} ${data.unit}` :
                                 status === 'excessive' ? `เกิน ${data.current - data.target} ${data.unit}` :
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
                      <Badge className="bg-accent/10 text-accent">ข้อมูลดี</Badge>
                      <span className="text-sm font-medium">การนอนหลับดีขึ้น 12%</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      คุณนอนหลับได้ดีขึ้นเมื่อเปรียบเทียบกับเดือนที่แล้ว โดยเฉลี่ยแล้วคุณนอนครบ 7.5 ชั่วโมงต่อคืน
                    </p>

                    <div className="flex items-center gap-2">
                      <Badge className="bg-warning/10 text-warning">ต้องปรับปรุง</Badge>
                      <span className="text-sm font-medium">การดื่มน้ำยังไม่ถึงเป้า</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      คุณดื่มน้ำเฉลี่ยเพียง 1.9 ลิตรต่อวัน ซึ่งน้อยกว่าเป้าหมาย 2.5 ลิตร
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-accent/10 text-accent">ยอดเยี่ยม</Badge>
                      <span className="text-sm font-medium">การออกกำลังกายสม่ำเสมอ</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      คุณเดินเฉลี่ย 9,000 ก้าวต่อวัน ซึ่งใกล้เคียงกับเป้าหมาย 10,000 ก้าว
                    </p>

                    <div className="flex items-center gap-2">
                      <Badge className="bg-secondary/10 text-secondary">ดี</Badge>
                      <span className="text-sm font-medium">อารมณ์เสถียร</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      อารมณ์โดยรวมของคุณอยู่ในระดับดี (4/5) และมีความสม่ำเสมอ
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="health-stat-card bg-white rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              ความสำเร็จ
            </CardTitle>
            <CardDescription>
              รางวัลที่คุณได้รับจากการดูแลสุขภาพ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg flex-wrap">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{achievement.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Summary */}
        <Card className="health-stat-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
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
                    {Math.round((mockHealthData.calories.count / mockHealthData.calories.target) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((mockHealthData.calories.count / mockHealthData.calories.target) * 100, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">ความคืบหน้าการออกกำลังกาย</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((mockHealthData.exercise.minutes / mockHealthData.exercise.target) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((mockHealthData.exercise.minutes / mockHealthData.exercise.target) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2">คำแนะนำสำหรับวันนี้</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• ดื่มน้ำเพิ่มอีก {mockHealthData.water.target - mockHealthData.water.liters} ลิตร</li>
                    <li>• นอนให้ครบ {mockHealthData.sleep.target} ชั่วโมง</li>
                    <li>• ออกกำลังกายเพิ่มอีก {mockHealthData.exercise.target - mockHealthData.exercise.minutes} นาที</li>
                    <li>• เพิ่มโปรตีนอีก {nutritionData.protein.target - nutritionData.protein.current} กรัม</li>
                    <li>• ลดไขมันลง {nutritionData.fats.current - nutritionData.fats.target} กรัม</li>
                    <li>• เพิ่มไฟเบอร์อีก {nutritionData.fiber.target - nutritionData.fiber.current} กรัม</li>
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