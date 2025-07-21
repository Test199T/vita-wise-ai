import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import {
  Moon,
  Footprints,
  Utensils,
  Droplets,
  Heart,
  Smile,
  Save,
  Calendar,
  Activity,
  Brain,
  Weight,
  Thermometer,
  Pill,
  Coffee,
  Sunset,
  Sunrise
} from "lucide-react";

export default function HealthForm() {
  const [formData, setFormData] = useState({
    sleepTime: "",
    wakeTime: "",
    sleepQuality: "",
    steps: "",
    exercise: "",
    exerciseDuration: "",
    water: "",
    meals: "",
    weight: "",
    medications: "",
    symptoms: "",
    stressLevel: "",
    mood: "",
    energy: "",
    notes: "",
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
        steps: "",
        exercise: "",
        exerciseDuration: "",
        water: "",
        meals: "",
        weight: "",
        medications: "",
        symptoms: "",
        stressLevel: "",
        mood: "",
        energy: "",
        notes: "",
      });
    }, 1000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <MainLayout>
      {/* Main Health Form Content */}
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">บันทึกข้อมูลสุขภาพ</h1>
          <p className="text-muted-foreground mt-2">
            บันทึกข้อมูลสุขภาพประจำวันของคุณ
          </p>
        </div>

        <Card className="health-stat-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              วันที่ {new Date().toLocaleDateString('th-TH')}
            </CardTitle>
            <CardDescription>
              กรอกข้อมูลสุขภาพของคุณสำหรับวันนี้
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sleep Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
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

              {/* Activity Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5 text-accent" />
                  <h3 className="text-lg font-semibold">กิจกรรมร่างกาย</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exercise">ประเภทการออกกำลังกาย</Label>
                  <Select onValueChange={(value) => handleInputChange("exercise", value)}>
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
                      <SelectItem value="other">อื่นๆ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="exerciseDuration">ระยะเวลาออกกำลังกาย (นาที)</Label>
                <Input
                  id="exerciseDuration"
                  type="number"
                  placeholder="เช่น 30"
                  value={formData.exerciseDuration}
                  onChange={(e) => handleInputChange("exerciseDuration", e.target.value)}
                  className="health-input"
                />
              </div>


              {/* Food & Water Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Utensils className="h-5 w-5 text-warning" />
                  <h3 className="text-lg font-semibold">อาหารและน้ำ</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="water">ปริมาณน้ำที่ดื่ม (ลิตร)</Label>
                    <Input
                      id="water"
                      type="number"
                      step="0.1"
                      placeholder="เช่น 2.5"
                      value={formData.water}
                      onChange={(e) => handleInputChange("water", e.target.value)}
                      className="health-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meals">จำนวนมื้ออาหาร</Label>
                    <Select onValueChange={(value) => handleInputChange("meals", value)}>
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
                </div>
              </div>

              {/* Body & Health Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Weight className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">ร่างกายและสุขภาพ</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">น้ำหนักวันนี้ (กิโลกรัม)</Label>
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
                    <Label htmlFor="medications">ยาที่รับประทาน</Label>
                    <Input
                      id="medications"
                      type="text"
                      placeholder="เช่น วิตามิน, ยาแก้ปวดหัว"
                      value={formData.medications}
                      onChange={(e) => handleInputChange("medications", e.target.value)}
                      className="health-input"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="symptoms">อาการที่พบเจอวันนี้</Label>
                  <Textarea
                    id="symptoms"
                    placeholder="เช่น ปวดหัว, เมื่อยตัว, ไอ, มีไข้"
                    value={formData.symptoms}
                    onChange={(e) => handleInputChange("symptoms", e.target.value)}
                    className="health-input min-h-[80px]"
                  />
                </div>
              </div>

              {/* Mental Health Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="h-5 w-5 text-secondary" />
                  <h3 className="text-lg font-semibold">สภาพจิตใจ</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stressLevel">ระดับความเครียด (1-5)</Label>
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="energy">ระดับพลังงาน (1-5)</Label>
                  <Select onValueChange={(value) => handleInputChange("energy", value)}>
                    <SelectTrigger className="health-input">
                      <SelectValue placeholder="เลือกระดับพลังงาน" />
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

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                  ยกเลิก
                </Button>
                <Button type="submit" className="health-button" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}