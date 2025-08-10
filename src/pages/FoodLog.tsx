import { useState } from "react";
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
  Apple, 
  Pill, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Activity,
  Droplets,
  Target,
  BarChart3
} from "lucide-react";
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
  total_fiber: number;
  total_vitaminC: number;
  total_vitaminD: number;
  total_calcium: number;
  total_iron: number;
  total_potassium: number;
  total_sodium: number;
  notes: string;
}

// ข้อมูลโภชนาการเป้าหมาย
const nutritionTargets = {
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
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const filteredFoods = foodCatalog.filter((f) => f.name.includes(query.trim())).slice(0, 8);
  const addSuggestedFood = (name: string) => {
    const prefix = formData.food_items ? formData.food_items + ", " : "";
    setFormData({ ...formData, food_items: `${prefix}${name} 1 ที่` });
    setQuery("");
  };
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
      total_fiber: 3,
      total_vitaminC: 15,
      total_vitaminD: 2,
      total_calcium: 120,
      total_iron: 2,
      total_potassium: 300,
      total_sodium: 400,
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
      total_fiber: 8,
      total_vitaminC: 45,
      total_vitaminD: 3,
      total_calcium: 180,
      total_iron: 4,
      total_potassium: 600,
      total_sodium: 800,
      notes: "อร่อย สมดุล"
    }
  ]);

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

  const mealTimes = ["เช้า", "สาย", "กลางวัน", "บ่าย", "เย็น", "ดึก", "อื่นๆ"];

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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Macronutrients */}
                  <div className="space-y-4">
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

                  {/* Calories Summary */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <Flame className="h-5 w-5" />
                      แคลอรี่รวม
                    </h4>
                    <div className="text-center p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
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

              <TabsContent value="micros" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Micronutrients */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <Pill className="h-5 w-5" />
                      วิตามินและแร่ธาตุ (Micronutrients)
                    </h4>
                    <div className="space-y-3">
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
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

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
          ))}
        </div>
      </div>
    </MainLayout>
  );
}