import { MainLayout } from "@/components/layout/MainLayout";
import { HealthChart } from "@/components/health/HealthChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Award,
  Target,
  Activity
} from "lucide-react";
import { useState } from "react";

// จำลองข้อมูลสถิติ
const sleepWeeklyData = [
  { name: "สัปดาห์ 1", value: 7.2 },
  { name: "สัปดาห์ 2", value: 6.8 },
  { name: "สัปดาห์ 3", value: 7.5 },
  { name: "สัปดาห์ 4", value: 7.8 },
];

const stepsMonthlyData = [
  { name: "มกราคม", value: 8500 },
  { name: "กุมภาพันธ์", value: 9200 },
  { name: "มีนาคม", value: 8900 },
  { name: "เมษายน", value: 9500 },
];

const waterWeeklyData = [
  { name: "จันทร์", value: 2.1 },
  { name: "อังคาร", value: 1.8 },
  { name: "พุธ", value: 2.3 },
  { name: "พฤหัส", value: 2.0 },
  { name: "ศุกร์", value: 1.5 },
  { name: "เสาร์", value: 2.5 },
  { name: "อาทิตย์", value: 2.2 },
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

export default function Stats() {
  const [period, setPeriod] = useState("week");

  return (
    <MainLayout>
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-8 w-8" />
              สถิติสุขภาพ
            </h1>
            <p className="text-muted-foreground mt-2">
              วิเคราะห์แนวโน้มและความก้าวหน้าของสุขภาพ
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">สัปดาห์</SelectItem>
                <SelectItem value="month">เดือน</SelectItem>
                <SelectItem value="year">ปี</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="health-stat-card">
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

          <Card className="health-stat-card">
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

          <Card className="health-stat-card">
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
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HealthChart
            title="แนวโน้มการนอนหลับ"
            description="ชั่วโมงการนอนหลับเฉลี่ยในแต่ละสัปดาห์"
            data={sleepWeeklyData}
            type="line"
            color="hsl(197, 76%, 64%)"
          />
          <HealthChart
            title="จำนวนก้าวเดิน"
            description="จำนวนก้าวเดินเฉลี่ยต่อเดือน"
            data={stepsMonthlyData}
            type="bar"
            color="hsl(142, 69%, 58%)"
          />
          <HealthChart
            title="การดื่มน้ำ"
            description="ปริมาณน้ำที่ดื่มในแต่ละวัน"
            data={waterWeeklyData}
            type="bar"
            color="hsl(149, 38%, 76%)"
          />
          <HealthChart
            title="อารมณ์"
            description="ระดับอารมณ์เฉลี่ยในแต่ละวัน (1-5)"
            data={moodWeeklyData}
            type="line"
            color="hsl(43, 89%, 62%)"
          />
        </div>

        {/* Health Insights */}
        <Card className="health-stat-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              ข้อมูลเชิงลึก
            </CardTitle>
            <CardDescription>
              วิเคราะห์จากข้อมูลสุขภาพของคุณ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="health-stat-card">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{achievement.title}</h4>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}