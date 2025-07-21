import { MainLayout } from "@/components/layout/MainLayout";
import { HealthCard } from "@/components/health/HealthCard";
import { HealthChart } from "@/components/health/HealthChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Moon,
  Footprints,
  Utensils,
  Droplets,
  Activity,
  TrendingUp,
  Plus,
  MessageCircle,
  Calendar
} from "lucide-react";
import { Link } from "react-router-dom";

// จำลองข้อมูลสุขภาพ
const mockHealthData = {
  sleep: { hours: 7.5, trend: "up", target: 8 },
  water: { liters: 1.8, trend: "stable", target: 2.5 },
  calories: { count: 1850, trend: "down", target: 2000 },
  exercise: { minutes: 35, trend: "up", target: 45 },
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

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">แดชบอร์ดสุขภาพ</h1>
            <p className="text-muted-foreground mt-2">
              ติดตามสุขภาพของคุณประจำวัน
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/health-form">
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มข้อมูล
              </Link>
            </Button>
            <Button asChild className="health-button">
              <Link to="/chat">
                <MessageCircle className="h-4 w-4 mr-2" />
                คุยกับ AI
              </Link>
            </Button>
          </div>
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

        {/* Charts */}
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
        </div>

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

              </div>

              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2">คำแนะนำสำหรับวันนี้</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• ดื่มน้ำเพิ่มอีก {mockHealthData.water.target - mockHealthData.water.liters} ลิตร</li>
                    <li>• นอนให้ครบ {mockHealthData.sleep.target} ชั่วโมง</li>
                    <li>• ออกกำลังกายเพิ่มอีก {mockHealthData.exercise.target - mockHealthData.exercise.minutes} นาที</li>
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