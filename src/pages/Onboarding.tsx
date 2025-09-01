import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowRight, 
  ArrowLeft, 
  SkipForward, 
  Target, 
  Heart, 
  Activity, 
  Clock, 
  CheckCircle,
  User,
  Ruler,
  Scale,
  Dumbbell,
  Moon,
  Utensils,
  AlertTriangle,
  Pill
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";

interface OnboardingData {
  // Step 1: Health Goals
  healthGoal: string;
  timeline: number;
  motivation: string;
  
  // Step 2: Basic Body Info
  firstName: string;
  lastName: string;
  height: number;
  weight: number;
  waist: number;
  bloodPressure: string;
  bloodSugar: string;
  // Added for BMR/TDEE
  sex: 'male' | 'female';
  birthDate: string;
  
  // Step 3: Lifestyle
  exerciseFrequency: string;
  sleepHours: number;
  mealsPerDay: number;
  smoking: boolean;
  alcoholFrequency: string;
  // Added for BMR/TDEE
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
  
  // Step 4: Medical History
  medicalConditions: string[];
  surgeries: string;
  allergies: string;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const { onboardingData, updateOnboardingData, completeOnboarding } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(onboardingData);

  const steps = [
    { title: "ยินดีต้อนรับ", icon: Heart },
    { title: "ข้อมูลส่วนตัว", icon: User },
    { title: "เป้าหมายสุขภาพ", icon: Target },
    { title: "ข้อมูลร่างกาย", icon: Ruler },
    { title: "พฤติกรรมประจำวัน", icon: Activity },
    { title: "ประวัติสุขภาพ", icon: AlertTriangle },
    { title: "สรุป", icon: CheckCircle }
  ];

  const healthGoals = [
    { value: "weight-loss", label: "ลดน้ำหนัก", icon: Scale },
    { value: "muscle-gain", label: "เพิ่มกล้ามเนื้อ", icon: Dumbbell },
    { value: "healthy-diet", label: "คุมอาหารเพื่อสุขภาพ", icon: Utensils },
    { value: "fitness", label: "เพิ่มพลังงาน / ความฟิต", icon: Activity },
    { value: "other", label: "อื่น ๆ", icon: Target }
  ];

  const exerciseOptions = [
    { value: "never", label: "ไม่เคย" },
    { value: "1-2", label: "1-2 ครั้งต่อสัปดาห์" },
    { value: "3-5", label: "3-5 ครั้งต่อสัปดาห์" },
    { value: "daily", label: "ทุกวัน" }
  ];

  const medicalConditions = [
    { value: "diabetes", label: "เบาหวาน" },
    { value: "hypertension", label: "ความดันโลหิตสูง" },
    { value: "cholesterol", label: "ไขมันในเลือดสูง" },
    { value: "asthma", label: "หอบหืด" },
    { value: "heart-disease", label: "โรคหัวใจ" },
    { value: "other", label: "อื่น ๆ" }
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      try {
        // อัพเดทข้อมูลล่าสุดก่อนส่ง
        console.log('Final onboarding data before completion:', data);
        
        // อัพเดทข้อมูลทั้งหมดใน context ก่อน
        Object.keys(data).forEach(key => {
          updateOnboardingData(key as keyof OnboardingData, data[key as keyof OnboardingData]);
        });
        
        await completeOnboarding();
        navigate("/dashboard");
      } catch (error) {
        console.error('Error completing onboarding:', error);
        // Still navigate even if there's an error
        navigate("/dashboard");
      }
    }
  };

  const handleSkip = () => {
    // เปลี่ยนพฤติกรรม: ข้ามทีละขั้น ไม่ข้ามทั้งหมด
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
      navigate("/dashboard");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateData = (key: keyof OnboardingData, value: unknown) => {
    setData(prev => ({ ...prev, [key]: value }));
    updateOnboardingData(key, value);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card className="max-w-2xl mx-auto shadow-health border-0">
            <CardHeader className="text-center pb-4 pt-6">
              <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-3">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl">ยินดีต้อนรับสู่แอปสุขภาพของคุณ!</CardTitle>
              <CardDescription className="text-lg">
                เราจะช่วยคุณตั้งค่าแอปให้เหมาะกับเป้าหมายสุขภาพของคุณ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0 pb-6">
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-2 w-full max-w-md mx-auto text-center">
                  <Label htmlFor="birthDate" className="block text-center font-medium">วันเกิด</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={data.birthDate || ""}
                    onChange={(e) => updateData("birthDate", e.target.value)}
                    className="h-10 rounded-xl text-center shadow-sm focus-visible:ring-2 focus-visible:ring-primary/60 center-date"
                  />
                  <p className="text-sm text-muted-foreground">เลือกวันเกิดเพื่อปรับคำแนะนำให้เหมาะสมกับคุณ</p>
                </div>
              </div>
              <div className="text-center space-y-3">
                <p className="text-muted-foreground">
                  การตั้งค่าจะใช้เวลาเพียง 2-3 นาที และจะช่วยให้เราแนะนำคุณได้ตรงเป้าหมายมากขึ้น
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={handleNext} className="health-button">
                    เริ่มต้นเลย
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={handleNext}>
                    <SkipForward className="mr-2 h-4 w-4" />
                    ข้ามไปขั้นถัดไป
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card className="max-w-2xl mx-auto shadow-health border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6" />
                ข้อมูลส่วนตัว
              </CardTitle>
              <CardDescription>
                กรุณากรอกข้อมูลส่วนตัวเพื่อให้เราจัดการแอปให้ตรงกับความต้องการของคุณ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">ชื่อจริง *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="ชื่อจริง"
                    value={data.firstName || ""}
                    onChange={(e) => updateData("firstName", e.target.value)}
                    className="h-10 rounded-xl shadow-sm focus-visible:ring-2 focus-visible:ring-primary/60"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">นามสกุล *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="นามสกุล"
                    value={data.lastName || ""}
                    onChange={(e) => updateData("lastName", e.target.value)}
                    className="h-10 rounded-xl shadow-sm focus-visible:ring-2 focus-visible:ring-primary/60"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sex">เพศ *</Label>
                <Select value={data.sex} onValueChange={(value) => updateData("sex", value as 'male' | 'female')}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="เลือกเพศ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">ชาย</SelectItem>
                    <SelectItem value="female">หญิง</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">วันเกิด *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={data.birthDate || ""}
                  onChange={(e) => updateData("birthDate", e.target.value)}
                  className="h-10 rounded-xl shadow-sm focus-visible:ring-2 focus-visible:ring-primary/60"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  เราใช้ข้อมูลนี้เพื่อคำนวณความต้องการพลังงานที่เหมาะสมกับคุณ
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="max-w-2xl mx-auto shadow-health border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6" />
                เป้าหมายสุขภาพ
              </CardTitle>
              <CardDescription>
                เลือกเป้าหมายหลักที่คุณต้องการเพื่อให้เราแนะนำได้ตรงจุด
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>คุณต้องการอะไร?</Label>
                <RadioGroup
                  value={data.healthGoal}
                  onValueChange={(value) => updateData("healthGoal", value)}
                >
                  {healthGoals.map((goal) => (
                    <div key={goal.value} className="flex items-center space-x-3">
                      <RadioGroupItem value={goal.value} id={goal.value} />
                      <Label htmlFor={goal.value} className="flex items-center gap-2 cursor-pointer">
                        <goal.icon className="h-4 w-4" />
                        {goal.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label>อยากเห็นผลในกี่เดือน?</Label>
                <Select value={data.timeline.toString()} onValueChange={(value) => updateData("timeline", parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 เดือน</SelectItem>
                    <SelectItem value="3">3 เดือน</SelectItem>
                    <SelectItem value="6">6 เดือน</SelectItem>
                    <SelectItem value="12">12 เดือน</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>อะไรคือเหตุผลที่คุณอยากเปลี่ยนสุขภาพของคุณ? (ไม่บังคับ)</Label>
                <Textarea
                  placeholder="เช่น อยากมีสุขภาพที่ดีขึ้น, อยากลดน้ำหนักเพื่อสุขภาพ..."
                  value={data.motivation}
                  onChange={(e) => updateData("motivation", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="max-w-2xl mx-auto shadow-health border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-6 w-6" />
                ข้อมูลร่างกายเบื้องต้น
              </CardTitle>
              <CardDescription>
                ข้อมูลเหล่านี้จะช่วยคำนวณ BMI และวิเคราะห์สุขภาพเบื้องต้น
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">ส่วนสูง (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="170"
                    value={data.height || ""}
                    onChange={(e) => updateData("height", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">น้ำหนัก (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="65"
                    value={data.weight || ""}
                    onChange={(e) => updateData("weight", parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="waist">รอบเอว (cm) - ไม่บังคับ</Label>
                <Input
                  id="waist"
                  type="number"
                  placeholder="80"
                  value={data.waist || ""}
                  onChange={(e) => updateData("waist", parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="blood-pressure">ความดันโลหิต - ไม่บังคับ</Label>
                  <Input
                    id="blood-pressure"
                    placeholder="120/80"
                    value={data.bloodPressure}
                    onChange={(e) => updateData("bloodPressure", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blood-sugar">น้ำตาลในเลือด - ไม่บังคับ</Label>
                  <Input
                    id="blood-sugar"
                    placeholder="100"
                    value={data.bloodSugar}
                    onChange={(e) => updateData("bloodSugar", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="max-w-2xl mx-auto shadow-health border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-6 w-6" />
                พฤติกรรมประจำวัน
              </CardTitle>
              <CardDescription>
                ช่วยให้เราเข้าใจนิสัยสุขภาพของคุณ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>คุณออกกำลังกายบ่อยแค่ไหน?</Label>
                <RadioGroup
                  value={data.exerciseFrequency}
                  onValueChange={(value) => updateData("exerciseFrequency", value)}
                >
                  {exerciseOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-3">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label>ระดับกิจกรรม (สำหรับคำนวณ TDEE)</Label>
                <Select value={data.activityLevel} onValueChange={(value) => updateData("activityLevel", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกระดับกิจกรรม" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">นั่งทำงาน/ไม่ค่อยขยับตัว</SelectItem>
                    <SelectItem value="light">ออกกำลังกายเบาๆ 1-3 วัน/สัปดาห์</SelectItem>
                    <SelectItem value="moderate">ออกกำลังกายปานกลาง 3-5 วัน/สัปดาห์</SelectItem>
                    <SelectItem value="active">ออกกำลังกายหนัก 6-7 วัน/สัปดาห์</SelectItem>
                    <SelectItem value="very-active">ออกกำลังกายหนักมาก/ใช้แรงงาน</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>นอนกี่ชั่วโมงต่อวันโดยเฉลี่ย?</Label>
                <Select value={data.sleepHours.toString()} onValueChange={(value) => updateData("sleepHours", parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map((hours) => (
                      <SelectItem key={hours} value={hours.toString()}>
                        {hours} ชั่วโมง
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>กินวันละกี่มื้อ?</Label>
                <Select value={data.mealsPerDay.toString()} onValueChange={(value) => updateData("mealsPerDay", parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((meals) => (
                      <SelectItem key={meals} value={meals.toString()}>
                        {meals} มื้อ
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>พฤติกรรมอื่น ๆ</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>สูบบุหรี่</Label>
                    <Select value={data.smoking ? "yes" : "no"} onValueChange={(value) => updateData("smoking", value === "yes")}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือก" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">ไม่สูบ</SelectItem>
                        <SelectItem value="yes">สูบ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>ดื่มแอลกอฮอล์</Label>
                    <Select value={data.alcoholFrequency} onValueChange={(value) => updateData("alcoholFrequency", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกความถี่" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">ไม่ดื่ม</SelectItem>
                        <SelectItem value="rarely">นานๆ ครั้ง</SelectItem>
                        <SelectItem value="weekly">สัปดาห์ละ 1-2 ครั้ง</SelectItem>
                        <SelectItem value="daily">ทุกวัน</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>ดื่มน้ำต่อวัน (แก้ว)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={30}
                    value={(data as unknown as Record<string, unknown>).waterIntakeGlasses as number || 0}
                    onChange={(e) => updateData("waterIntakeGlasses" as keyof OnboardingData, Math.max(0, parseInt(e.target.value) || 0))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>อื่น ๆ (ระบุเพิ่มเติม)</Label>
                  <Textarea
                    placeholder="เช่น ชอบดื่มเครื่องดื่มหวาน บางวันทำงานกะดึก ฯลฯ"
                    value={(data as unknown as Record<string, unknown>).otherLifestyleNotes as string || ''}
                    onChange={(e) => updateData("otherLifestyleNotes" as keyof OnboardingData, e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card className="max-w-2xl mx-auto shadow-health border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6" />
                ประวัติสุขภาพ
              </CardTitle>
              <CardDescription>
                ข้อมูลนี้จะช่วยให้เราแนะนำได้เหมาะสมและปลอดภัย
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>โรคประจำตัวที่มี (เลือกได้หลายอัน)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {medicalConditions.map((condition) => (
                    <div key={condition.value} className="flex items-center space-x-3">
                      <Checkbox
                        id={condition.value}
                        checked={data.medicalConditions.includes(condition.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateData("medicalConditions", [...data.medicalConditions, condition.value]);
                          } else {
                            updateData("medicalConditions", data.medicalConditions.filter(c => c !== condition.value));
                          }
                        }}
                      />
                      <Label htmlFor={condition.value} className="cursor-pointer">
                        {condition.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="surgeries">เคยผ่าตัดหรือมีการรักษาพิเศษ? (ไม่บังคับ)</Label>
                <Textarea
                  id="surgeries"
                  placeholder="เช่น ผ่าตัดหัวใจ, ใส่เหล็กดามกระดูก..."
                  value={data.surgeries}
                  onChange={(e) => updateData("surgeries", e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="allergies">แพ้อาหาร / แพ้ยาอะไรบ้าง? (ไม่บังคับ)</Label>
                <Textarea
                  id="allergies"
                  placeholder="เช่น แพ้ยาเพนิซิลลิน, แพ้อาหารทะเล..."
                  value={data.allergies}
                  onChange={(e) => updateData("allergies", e.target.value)}
                />
              </div>

              <div className="text-center">
                <Button variant="outline" onClick={handleSkip}>
                  ยังไม่ทราบ / ข้าม
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card className="max-w-2xl mx-auto shadow-health border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6" />
                สรุปการตั้งค่า
              </CardTitle>
              <CardDescription>
                ตรวจสอบข้อมูลที่คุณได้กรอกไว้
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">เป้าหมาย</Label>
                    <Badge variant="secondary">
                      {healthGoals.find(g => g.value === data.healthGoal)?.label || "ไม่ระบุ"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">ระยะเวลา</Label>
                    <Badge variant="secondary">{data.timeline} เดือน</Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">ส่วนสูง</Label>
                    <p className="text-sm">{data.height} cm</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">น้ำหนัก</Label>
                    <p className="text-sm">{data.weight} kg</p>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  คุณสามารถแก้ไขข้อมูลเหล่านี้ได้ในภายหลังที่หน้าโปรไฟล์
                </p>
                <Button onClick={handleNext} className="health-button">
                  เริ่มใช้งานเลย!
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-secondary-light flex items-center justify-center p-4">
      <div className="w-full max-w-4xl fade-in">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-foreground">ขั้นตอนที่ {currentStep + 1} จาก {steps.length}</h2>
            <span className="text-sm text-muted-foreground">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col items-center space-y-1 ${
                  index <= currentStep ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <step.icon className={`h-4 w-4 ${index <= currentStep ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-xs hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        {currentStep > 0 && currentStep < steps.length - 1 && (
          <div className="flex justify-between max-w-2xl mx-auto">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              ย้อนกลับ
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSkip}>
                ข้าม
              </Button>
              <Button onClick={handleNext} className="health-button">
                ถัดไป
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding; 