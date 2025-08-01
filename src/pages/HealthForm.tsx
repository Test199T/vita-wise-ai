import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import {
  Moon,
  Activity,
  Utensils,
  Weight,
  Heart,
  Pill,
  Save,
  Calendar,
  ChevronDown,
  ChevronRight,
  Thermometer,
  Droplets,
  Clock,
  Target,
  Brain,
  Smile,
  User
} from "lucide-react";

export default function HealthForm() {
  const [formData, setFormData] = useState({
    // Sleep data
    sleepTime: "",
    wakeTime: "",
    sleepQuality: "",
    
    // Body measurements
    weight: "",
    bodyTemperature: "",
    restingHeartRate: "",
    oxygenSaturation: "",
    
    // Exercise data
    exerciseType: "",
    exerciseDuration: "",
    intensity: "",
    caloriesBurned: "",
    
    // Food & nutrition
    waterIntake: "",
    mealsCount: "",
    calorieIntake: "",
    proteinIntake: "",
    carbIntake: "",
    fatIntake: "",
    fastingHours: "",
    mealDetails: "",
    
    // Health & symptoms
    medications: "",
    symptoms: "",
    bowelMovementQuality: "",
    
    // Mental health
    stressLevel: "",
    mood: "",
    energyLevel: "",
    
    // Women's health
    menstrualCyclePhase: "",
    
    // Notes
    notes: "",
  });

  const [activeCategories, setActiveCategories] = useState({
    sleep: true,
    bodyMeasurements: false,
    exercise: false,
    nutrition: false,
    health: false,
    mentalHealth: false,
    womensHealth: false,
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // จำลองการบันทึกข้อมูล
    setTimeout(() => {
      toast({
        title: "บันทึกข้อมูลสำเร็จ",
        description: "ข้อมูลสุขภาพของคุณได้รับการบันทึกแล้ว",
      });
      setLoading(false);
      // Reset form
      setFormData({
        sleepTime: "",
        wakeTime: "",
        sleepQuality: "",
        weight: "",
        bodyTemperature: "",
        restingHeartRate: "",
        oxygenSaturation: "",
        exerciseType: "",
        exerciseDuration: "",
        intensity: "",
        caloriesBurned: "",
        waterIntake: "",
        mealsCount: "",
        calorieIntake: "",
        proteinIntake: "",
        carbIntake: "",
        fatIntake: "",
        fastingHours: "",
        mealDetails: "",
        medications: "",
        symptoms: "",
        bowelMovementQuality: "",
        stressLevel: "",
        mood: "",
        energyLevel: "",
        menstrualCyclePhase: "",
        notes: "",
      });
    }, 1000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (category: string) => {
    setActiveCategories(prev => ({ 
      ...prev, 
      [category]: !prev[category as keyof typeof prev] 
    }));
  };

  const CategoryCheckbox = ({ category, label, icon: Icon, isActive }: {
    category: string;
    label: string;
    icon: any;
    isActive: boolean;
  }) => (
    <div className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors">
      <Checkbox
        id={category}
        checked={isActive}
        onCheckedChange={() => toggleCategory(category)}
      />
      <Icon className="h-4 w-4 text-primary" />
      <Label htmlFor={category} className="text-sm font-medium cursor-pointer">
        {label}
      </Label>
    </div>
  );

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">บันทึกข้อมูลสุขภาพ</h1>
          <p className="text-muted-foreground mt-2">
            เลือกหมวดหมู่ที่ต้องการบันทึกและกรอกข้อมูลสุขภาพของคุณ
          </p>
        </div>

        {/* Category Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              เลือกหมวดหมู่ที่ต้องการบันทึก
            </CardTitle>
            <CardDescription>
              เลือกเฉพาะหมวดหมู่ที่คุณต้องการบันทึกข้อมูลวันนี้
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <CategoryCheckbox
                category="sleep"
                label="การนอนหลับ"
                icon={Moon}
                isActive={activeCategories.sleep}
              />
              <CategoryCheckbox
                category="bodyMeasurements"
                label="การวัดร่างกาย"
                icon={Weight}
                isActive={activeCategories.bodyMeasurements}
              />
              <CategoryCheckbox
                category="exercise"
                label="การออกกำลังกาย"
                icon={Activity}
                isActive={activeCategories.exercise}
              />
              <CategoryCheckbox
                category="nutrition"
                label="อาหารและโภชนาการ"
                icon={Utensils}
                isActive={activeCategories.nutrition}
              />
              <CategoryCheckbox
                category="health"
                label="สุขภาพและอาการ"
                icon={Pill}
                isActive={activeCategories.health}
              />
              <CategoryCheckbox
                category="mentalHealth"
                label="สุขภาพจิตใจ"
                icon={Brain}
                isActive={activeCategories.mentalHealth}
              />
              <CategoryCheckbox
                category="womensHealth"
                label="สุขภาพผู้หญิง"
                icon={User}
                isActive={activeCategories.womensHealth}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Sections */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="health-stat-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                วันที่ {new Date().toLocaleDateString('th-TH')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Sleep Section */}
              {activeCategories.sleep && (
                <Collapsible open={true}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Moon className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">การนอนหลับ</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sleepTime">เวลาที่เข้านอน</Label>
                        <Input
                          id="sleepTime"
                          type="time"
                          value={formData.sleepTime}
                          onChange={(e) => handleInputChange("sleepTime", e.target.value)}
                          className="health-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wakeTime">เวลาที่ตื่นนอน</Label>
                        <Input
                          id="wakeTime"
                          type="time"
                          value={formData.wakeTime}
                          onChange={(e) => handleInputChange("wakeTime", e.target.value)}
                          className="health-input"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sleepQuality">คุณภาพการนอนหลับ</Label>
                      <Select onValueChange={(value) => handleInputChange("sleepQuality", value)}>
                        <SelectTrigger className="health-input">
                          <SelectValue placeholder="เลือกคุณภาพการนอน" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">ดีมาก</SelectItem>
                          <SelectItem value="good">ดี</SelectItem>
                          <SelectItem value="average">ปานกลาง</SelectItem>
                          <SelectItem value="poor">แย่</SelectItem>
                          <SelectItem value="very-poor">แย่มาก</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Collapsible>
              )}

              {/* Body Measurements Section */}
              {activeCategories.bodyMeasurements && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Weight className="h-5 w-5 text-secondary" />
                    <h3 className="text-lg font-semibold">การวัดร่างกาย</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">น้ำหนัก (กิโลกรัม)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        placeholder="เช่น 65.5"
                        value={formData.weight}
                        onChange={(e) => handleInputChange("weight", e.target.value)}
                        className="health-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bodyTemperature">อุณหภูมิร่างกาย (°C)</Label>
                      <Input
                        id="bodyTemperature"
                        type="number"
                        step="0.1"
                        placeholder="เช่น 36.5"
                        value={formData.bodyTemperature}
                        onChange={(e) => handleInputChange("bodyTemperature", e.target.value)}
                        className="health-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="restingHeartRate">อัตราการเต้นของหัวใจขณะพัก (ครั้ง/นาที)</Label>
                      <Input
                        id="restingHeartRate"
                        type="number"
                        placeholder="เช่น 70"
                        value={formData.restingHeartRate}
                        onChange={(e) => handleInputChange("restingHeartRate", e.target.value)}
                        className="health-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oxygenSaturation">ระดับออกซิเจนในเลือด (%)</Label>
                      <Input
                        id="oxygenSaturation"
                        type="number"
                        placeholder="เช่น 98"
                        value={formData.oxygenSaturation}
                        onChange={(e) => handleInputChange("oxygenSaturation", e.target.value)}
                        className="health-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Exercise Section */}
              {activeCategories.exercise && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-accent" />
                    <h3 className="text-lg font-semibold">การออกกำลังกาย</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="exerciseType">ประเภทการออกกำลังกาย</Label>
                      <Select onValueChange={(value) => handleInputChange("exerciseType", value)}>
                        <SelectTrigger className="health-input">
                          <SelectValue placeholder="เลือกประเภทการออกกำลังกาย" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">ไม่ได้ออกกำลังกาย</SelectItem>
                          <SelectItem value="walking">เดิน</SelectItem>
                          <SelectItem value="running">วิ่ง</SelectItem>
                          <SelectItem value="cycling">ปั่นจักรยาน</SelectItem>
                          <SelectItem value="swimming">ว่ายน้ำ</SelectItem>
                          <SelectItem value="gym">ยิม</SelectItem>
                          <SelectItem value="yoga">โยคะ</SelectItem>
                          <SelectItem value="hiit">HIIT</SelectItem>
                          <SelectItem value="pilates">พิลาทิส</SelectItem>
                          <SelectItem value="other">อื่นๆ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exerciseDuration">ระยะเวลา (นาที)</Label>
                      <Input
                        id="exerciseDuration"
                        type="number"
                        placeholder="เช่น 30"
                        value={formData.exerciseDuration}
                        onChange={(e) => handleInputChange("exerciseDuration", e.target.value)}
                        className="health-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="intensity">ระดับความหนัก</Label>
                      <Select onValueChange={(value) => handleInputChange("intensity", value)}>
                        <SelectTrigger className="health-input">
                          <SelectValue placeholder="เลือกระดับความหนัก" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">เบา</SelectItem>
                          <SelectItem value="moderate">ปานกลาง</SelectItem>
                          <SelectItem value="vigorous">หนัก</SelectItem>
                          <SelectItem value="high">หนักมาก</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="caloriesBurned">แคลอรีที่เผาผลาญ (ประมาณ)</Label>
                      <Input
                        id="caloriesBurned"
                        type="number"
                        placeholder="เช่น 300"
                        value={formData.caloriesBurned}
                        onChange={(e) => handleInputChange("caloriesBurned", e.target.value)}
                        className="health-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Nutrition Section */}
              {activeCategories.nutrition && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-warning" />
                    <h3 className="text-lg font-semibold">อาหารและโภชนาการ</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="waterIntake">ปริมาณน้ำที่ดื่ม (มิลลิลิตร)</Label>
                      <Input
                        id="waterIntake"
                        type="number"
                        placeholder="เช่น 2000"
                        value={formData.waterIntake}
                        onChange={(e) => handleInputChange("waterIntake", e.target.value)}
                        className="health-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mealsCount">จำนวนมื้ออาหาร</Label>
                      <Select onValueChange={(value) => handleInputChange("mealsCount", value)}>
                        <SelectTrigger className="health-input">
                          <SelectValue placeholder="เลือกจำนวนมื้อ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 มื้อ</SelectItem>
                          <SelectItem value="2">2 มื้อ</SelectItem>
                          <SelectItem value="3">3 มื้อ</SelectItem>
                          <SelectItem value="4">4 มื้อ</SelectItem>
                          <SelectItem value="5">5 มื้อ หรือมากกว่า</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="calorieIntake">แคลอรีที่บริโภค (kcal)</Label>
                      <Input
                        id="calorieIntake"
                        type="number"
                        placeholder="เช่น 1800"
                        value={formData.calorieIntake}
                        onChange={(e) => handleInputChange("calorieIntake", e.target.value)}
                        className="health-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="proteinIntake">โปรตีน (กรัม)</Label>
                      <Input
                        id="proteinIntake"
                        type="number"
                        placeholder="เช่น 60"
                        value={formData.proteinIntake}
                        onChange={(e) => handleInputChange("proteinIntake", e.target.value)}
                        className="health-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="carbIntake">คาร์โบไฮเดรต (กรัม)</Label>
                      <Input
                        id="carbIntake"
                        type="number"
                        placeholder="เช่น 200"
                        value={formData.carbIntake}
                        onChange={(e) => handleInputChange("carbIntake", e.target.value)}
                        className="health-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fatIntake">ไขมัน (กรัม)</Label>
                      <Input
                        id="fatIntake"
                        type="number"
                        placeholder="เช่น 50"
                        value={formData.fatIntake}
                        onChange={(e) => handleInputChange("fatIntake", e.target.value)}
                        className="health-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fastingHours">ชั่วโมงการอดอาหาร</Label>
                      <Input
                        id="fastingHours"
                        type="number"
                        placeholder="เช่น 16"
                        value={formData.fastingHours}
                        onChange={(e) => handleInputChange("fastingHours", e.target.value)}
                        className="health-input"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mealDetails">รายละเอียดอาหารที่กิน</Label>
                    <Textarea
                      id="mealDetails"
                      placeholder="เช่น เช้า: ข้าวผัด, กลางวัน: สลัด, เย็น: ปลาย่าง..."
                      value={formData.mealDetails}
                      onChange={(e) => handleInputChange("mealDetails", e.target.value)}
                      className="health-input min-h-[80px]"
                    />
                  </div>
                </div>
              )}

              {/* Health & Symptoms Section */}
              {activeCategories.health && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">สุขภาพและอาการ</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="medications">ยาที่รับประทาน</Label>
                      <Input
                        id="medications"
                        type="text"
                        placeholder="เช่น วิตามิน C, ยาแก้ปวดหัว"
                        value={formData.medications}
                        onChange={(e) => handleInputChange("medications", e.target.value)}
                        className="health-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bowelMovementQuality">คุณภาพการขับถ่าย</Label>
                      <Select onValueChange={(value) => handleInputChange("bowelMovementQuality", value)}>
                        <SelectTrigger className="health-input">
                          <SelectValue placeholder="เลือกคุณภาพ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">ปกติ</SelectItem>
                          <SelectItem value="constipated">ท้องผูก</SelectItem>
                          <SelectItem value="loose">ท้องเสีย</SelectItem>
                          <SelectItem value="bloody">มีเลือด</SelectItem>
                          <SelectItem value="mucus">มีเมือก</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="symptoms">อาการที่พบเจอวันนี้</Label>
                    <Textarea
                      id="symptoms"
                      placeholder="เช่น ปวดหัว, เมื่อยตัว, ไอ, มีไข้, คันคอ..."
                      value={formData.symptoms}
                      onChange={(e) => handleInputChange("symptoms", e.target.value)}
                      className="health-input min-h-[80px]"
                    />
                  </div>
                </div>
              )}

              {/* Mental Health Section */}
              {activeCategories.mentalHealth && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    <h3 className="text-lg font-semibold">สุขภาพจิตใจ</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stressLevel">ระดับความเครียด</Label>
                      <Select onValueChange={(value) => handleInputChange("stressLevel", value)}>
                        <SelectTrigger className="health-input">
                          <SelectValue placeholder="เลือกระดับ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - ไม่เครียด</SelectItem>
                          <SelectItem value="2">2 - เครียดน้อย</SelectItem>
                          <SelectItem value="3">3 - เครียดปานกลาง</SelectItem>
                          <SelectItem value="4">4 - เครียดมาก</SelectItem>
                          <SelectItem value="5">5 - เครียดมากที่สุด</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mood">อารมณ์วันนี้</Label>
                      <Select onValueChange={(value) => handleInputChange("mood", value)}>
                        <SelectTrigger className="health-input">
                          <SelectValue placeholder="เลือกอารมณ์" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="very-good">😊 ดีมาก</SelectItem>
                          <SelectItem value="good">🙂 ดี</SelectItem>
                          <SelectItem value="normal">😐 ปกติ</SelectItem>
                          <SelectItem value="bad">😞 แย่</SelectItem>
                          <SelectItem value="very-bad">😢 แย่มาก</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="energyLevel">ระดับพลังงาน</Label>
                      <Select onValueChange={(value) => handleInputChange("energyLevel", value)}>
                        <SelectTrigger className="health-input">
                          <SelectValue placeholder="เลือกระดับ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - ไม่มีพลังงาน</SelectItem>
                          <SelectItem value="2">2 - มีพลังงานน้อย</SelectItem>
                          <SelectItem value="3">3 - พลังงานปานกลาง</SelectItem>
                          <SelectItem value="4">4 - มีพลังงาน</SelectItem>
                          <SelectItem value="5">5 - มีพลังงานเต็มที่</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Women's Health Section */}
              {activeCategories.womensHealth && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-pink-500" />
                    <h3 className="text-lg font-semibold">สุขภาพผู้หญิง</h3>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="menstrualCyclePhase">ระยะประจำเดือน</Label>
                    <Select onValueChange={(value) => handleInputChange("menstrualCyclePhase", value)}>
                      <SelectTrigger className="health-input">
                        <SelectValue placeholder="เลือกระยะ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="menstrual">ระยะมีประจำเดือน</SelectItem>
                        <SelectItem value="follicular">ระยะฟอลลิคูลาร์</SelectItem>
                        <SelectItem value="ovulation">ระยะไข่ตก</SelectItem>
                        <SelectItem value="luteal">ระยะลูเทียล</SelectItem>
                        <SelectItem value="pregnant">ตั้งครรภ์</SelectItem>
                        <SelectItem value="menopause">หมดประจำเดือน</SelectItem>
                        <SelectItem value="not-applicable">ไม่ใช่</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Notes Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">บันทึกเพิ่มเติม</Label>
                  <Textarea
                    id="notes"
                    placeholder="บันทึกเพิ่มเติมเกี่ยวกับสุขภาพของคุณวันนี้..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    className="health-input min-h-[100px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                  ยกเลิก
                </Button>
                <Button type="submit" className="health-button" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
}