import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Utensils, Plus, Calendar, Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FoodLog {
  food_log_id: string;
  log_date: string;
  meal_time: string;
  food_items: any[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  notes: string;
}

export default function FoodLog() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [foodLogs] = useState<FoodLog[]>([
    {
      food_log_id: "1",
      log_date: "2024-01-01",
      meal_time: "เช้า",
      food_items: [
        { name: "ข้าวโพดต้ม", amount: "1 ข้าง", calories: 80 },
        { name: "ไข่ต้ม", amount: "2 ฟอง", calories: 140 }
      ],
      total_calories: 220,
      total_protein: 12,
      total_carbs: 20,
      total_fats: 8,
      notes: "อิ่มดี มีพลังงาน"
    },
    {
      food_log_id: "2",
      log_date: "2024-01-01", 
      meal_time: "กลางวัน",
      food_items: [
        { name: "ข้าวกล้อง", amount: "1 ถ้วย", calories: 150 },
        { name: "ผัดผักรวม", amount: "1 จาน", calories: 120 },
        { name: "ไก่ย่าง", amount: "100g", calories: 180 }
      ],
      total_calories: 450,
      total_protein: 25,
      total_carbs: 45,
      total_fats: 12,
      notes: "อร่อย สมดุล"
    }
  ]);

  const [formData, setFormData] = useState({
    log_date: new Date().toISOString().split('T')[0],
    meal_time: "",
    food_items: "",
    total_calories: "",
    total_protein: "",
    total_carbs: "",
    total_fats: "",
    notes: ""
  });

  const mealTimes = ["เช้า", "สาย", "กลางวัน", "บ่าย", "เย็น", "ดึก"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "บันทึกสำเร็จ",
      description: "บันทึกอาหารเรียบร้อยแล้ว"
    });
    setShowForm(false);
    setFormData({
      log_date: new Date().toISOString().split('T')[0],
      meal_time: "",
      food_items: "",
      total_calories: "",
      total_protein: "",
      total_carbs: "",
      total_fats: "",
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

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">บันทึกอาหาร</h1>
            <p className="text-muted-foreground">ติดตามการรับประทานอาหารและโภชนาการ</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            เพิ่มบันทึกอาหาร
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>บันทึกอาหารใหม่</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">หมายเหตุ</Label>
                  <Textarea
                    id="notes"
                    placeholder="รสชาติ, ความรู้สึกหลังกิน..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>

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

        <div className="grid gap-4">
          <h2 className="text-xl font-semibold">ประวัติการรับประทานอาหาร</h2>
          {foodLogs.map((log) => (
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
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="font-semibold">{log.total_calories} แคล</span>
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
                
                {log.notes && (
                  <div className="mt-3 p-2 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground">{log.notes}</p>
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