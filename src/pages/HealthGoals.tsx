import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, Calendar, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HealthGoal {
  goal_id: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  start_date: string;
  end_date: string;
  status: string;
  daily_calorie_goal?: number;
  daily_protein_goal?: number;
  daily_carb_goal?: number;
  daily_fat_goal?: number;
  daily_fiber_goal?: number;
  daily_sodium_goal?: number;
}

export default function HealthGoals() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [goals] = useState<HealthGoal[]>([
    {
      goal_id: "1",
      goal_type: "ลดน้ำหนัก",
      target_value: 65,
      current_value: 70,
      start_date: "2024-01-01",
      end_date: "2024-06-01",
      status: "active",
      daily_calorie_goal: 1800
    },
    {
      goal_id: "2",
      goal_type: "วิ่งระยะทาง",
      target_value: 5000,
      current_value: 1200,
      start_date: "2024-01-01",
      end_date: "2024-03-01",
      status: "active"
    },
    {
      goal_id: "3",
      goal_type: "ดื่มน้ำ",
      target_value: 2.5,
      current_value: 2.5,
      start_date: "2024-01-01",
      end_date: "2024-01-31",
      status: "completed"
    }
  ]);

  const [formData, setFormData] = useState({
    goal_type: "",
    target_value: "",
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
    daily_calorie_goal: "",
    daily_protein_goal: "",
    daily_carb_goal: "",
    daily_fat_goal: "",
    daily_fiber_goal: "",
    daily_sodium_goal: ""
  });

  const goalTypes = [
    "ลดน้ำหนัก", "เพิ่มน้ำหนัก", "วิ่งระยะทาง", "ดื่มน้ำ", 
    "ออกกำลังกาย", "นอนหลับ", "ลดความเครียด", "เพิ่มกล้ามเนื้อ"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "สร้างเป้าหมายสำเร็จ",
      description: "เป้าหมายใหม่ของคุณถูกสร้างแล้ว"
    });
    setShowForm(false);
    setFormData({
      goal_type: "",
      target_value: "",
      start_date: new Date().toISOString().split('T')[0],
      end_date: "",
      daily_calorie_goal: "",
      daily_protein_goal: "",
      daily_carb_goal: "",
      daily_fat_goal: "",
      daily_fiber_goal: "",
      daily_sodium_goal: ""
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-blue-500 text-white">กำลังดำเนินการ</Badge>;
      case "completed":
        return <Badge className="bg-green-500 text-white">สำเร็จแล้ว</Badge>;
      case "paused":
        return <Badge className="bg-yellow-500 text-white">หยุดชั่วคราว</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">ไม่ทราบสถานะ</Badge>;
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getGoalIcon = (goalType: string) => {
    const goalIcons = {
      "ลดน้ำหนัก": "bg-red-500",
      "เพิ่มน้ำหนัก": "bg-green-500",
      "วิ่งระยะทาง": "bg-blue-500",
      "ดื่มน้ำ": "bg-cyan-500",
      "ออกกำลังกาย": "bg-orange-500",
      "นอนหลับ": "bg-purple-500",
      "ลดความเครียด": "bg-pink-500",
      "เพิ่มกล้ามเนื้อ": "bg-yellow-600"
    };
    return goalIcons[goalType as keyof typeof goalIcons] || "bg-gray-500";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">เป้าหมายสุขภาพ</h1>
            <p className="text-muted-foreground">ตั้งและติดตามเป้าหมายสุขภาพของคุณ</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            เพิ่มเป้าหมายใหม่
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>สร้างเป้าหมายใหม่</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal_type">ประเภทเป้าหมาย</Label>
                    <Select value={formData.goal_type} onValueChange={(value) => setFormData({...formData, goal_type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภท" />
                      </SelectTrigger>
                      <SelectContent>
                        {goalTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target_value">ค่าเป้าหมาย</Label>
                    <Input
                      id="target_value"
                      type="number"
                      placeholder="เช่น 65 (กก.)"
                      value={formData.target_value}
                      onChange={(e) => setFormData({...formData, target_value: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start_date">วันที่เริ่ม</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">วันที่สิ้นสุด</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      required
                    />
                  </div>
                </div>

                {formData.goal_type === "ลดน้ำหนัก" && (
                  <div className="space-y-4 p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold">เป้าหมายโภชนาการรายวัน</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="daily_calorie_goal">แคลอรี</Label>
                        <Input
                          id="daily_calorie_goal"
                          type="number"
                          placeholder="1800"
                          value={formData.daily_calorie_goal}
                          onChange={(e) => setFormData({...formData, daily_calorie_goal: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="daily_protein_goal">โปรตีน (g)</Label>
                        <Input
                          id="daily_protein_goal"
                          type="number"
                          placeholder="120"
                          value={formData.daily_protein_goal}
                          onChange={(e) => setFormData({...formData, daily_protein_goal: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="daily_carb_goal">คาร์โบ (g)</Label>
                        <Input
                          id="daily_carb_goal"
                          type="number"
                          placeholder="200"
                          value={formData.daily_carb_goal}
                          onChange={(e) => setFormData({...formData, daily_carb_goal: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="daily_fat_goal">ไขมัน (g)</Label>
                        <Input
                          id="daily_fat_goal"
                          type="number"
                          placeholder="60"
                          value={formData.daily_fat_goal}
                          onChange={(e) => setFormData({...formData, daily_fat_goal: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="daily_fiber_goal">ไฟเบอร์ (g)</Label>
                        <Input
                          id="daily_fiber_goal"
                          type="number"
                          placeholder="25"
                          value={formData.daily_fiber_goal}
                          onChange={(e) => setFormData({...formData, daily_fiber_goal: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="daily_sodium_goal">โซเดียม (mg)</Label>
                        <Input
                          id="daily_sodium_goal"
                          type="number"
                          placeholder="2300"
                          value={formData.daily_sodium_goal}
                          onChange={(e) => setFormData({...formData, daily_sodium_goal: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit">สร้างเป้าหมาย</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    ยกเลิก
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          <h2 className="text-xl font-semibold">เป้าหมายของคุณ</h2>
          {goals.map((goal) => (
            <Card key={goal.goal_id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${getGoalIcon(goal.goal_type)}`}>
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{goal.goal_type}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(goal.start_date).toLocaleDateString('th-TH')} - {new Date(goal.end_date).toLocaleDateString('th-TH')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(goal.status)}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>ความคืบหน้า</span>
                    <span>{goal.current_value} / {goal.target_value}</span>
                  </div>
                  
                  <Progress 
                    value={getProgressPercentage(goal.current_value, goal.target_value)} 
                    className="h-2"
                  />
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>{getProgressPercentage(goal.current_value, goal.target_value).toFixed(1)}% สำเร็จ</span>
                    </div>
                    
                    {goal.status === "completed" && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>เป้าหมายสำเร็จ!</span>
                      </div>
                    )}
                    
                    {goal.status === "active" && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>กำลังดำเนินการ</span>
                      </div>
                    )}
                  </div>
                </div>

                {goal.daily_calorie_goal && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-2">เป้าหมายโภชนาการรายวัน</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
                      <div className="text-center">
                        <div className="font-semibold">{goal.daily_calorie_goal}</div>
                        <div className="text-muted-foreground">แคลอรี</div>
                      </div>
                      {goal.daily_protein_goal && (
                        <div className="text-center">
                          <div className="font-semibold">{goal.daily_protein_goal}g</div>
                          <div className="text-muted-foreground">โปรตีน</div>
                        </div>
                      )}
                      {goal.daily_carb_goal && (
                        <div className="text-center">
                          <div className="font-semibold">{goal.daily_carb_goal}g</div>
                          <div className="text-muted-foreground">คาร์โบ</div>
                        </div>
                      )}
                      {goal.daily_fat_goal && (
                        <div className="text-center">
                          <div className="font-semibold">{goal.daily_fat_goal}g</div>
                          <div className="text-muted-foreground">ไขมัน</div>
                        </div>
                      )}
                      {goal.daily_fiber_goal && (
                        <div className="text-center">
                          <div className="font-semibold">{goal.daily_fiber_goal}g</div>
                          <div className="text-muted-foreground">ไฟเบอร์</div>
                        </div>
                      )}
                      {goal.daily_sodium_goal && (
                        <div className="text-center">
                          <div className="font-semibold">{goal.daily_sodium_goal}mg</div>
                          <div className="text-muted-foreground">โซเดียม</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}