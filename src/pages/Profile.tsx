import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useOnboarding } from "@/contexts/OnboardingContext";
import {
  User,
  Settings,
  Target,
  Bell,
  LogOut,
  Edit,
  Save,
  Camera,
  Heart,
  Activity,
  Scale,
  Ruler,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Droplets,
  Moon,
  Utensils,
  Dumbbell,
  Smartphone,
  Calendar,
  BarChart3
} from "lucide-react";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { onboardingData } = useOnboarding();
  const { toast } = useToast();

  // Calculate BMI
  const calculateBMI = () => {
    if (onboardingData.height > 0 && onboardingData.weight > 0) {
      const heightInMeters = onboardingData.height / 100;
      return (onboardingData.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return "0";
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "น้ำหนักต่ำกว่าเกณฑ์", color: "bg-blue-500" };
    if (bmi < 25) return { category: "น้ำหนักปกติ", color: "bg-green-500" };
    if (bmi < 30) return { category: "น้ำหนักเกิน", color: "bg-yellow-500" };
    return { category: "อ้วน", color: "bg-red-500" };
  };

  const bmi = parseFloat(calculateBMI());
  const bmiInfo = getBMICategory(bmi);

  const healthGoals = {
    "weight-loss": "ลดน้ำหนัก",
    "muscle-gain": "เพิ่มกล้ามเนื้อ", 
    "healthy-diet": "คุมอาหารเพื่อสุขภาพ",
    "fitness": "เพิ่มพลังงาน / ความฟิต",
    "other": "อื่น ๆ"
  };

  const exerciseFrequencyLabels = {
    "never": "ไม่เคย",
    "1-2": "1-2 ครั้งต่อสัปดาห์",
    "3-5": "3-5 ครั้งต่อสัปดาห์",
    "daily": "ทุกวัน"
  };

  const alcoholFrequencyLabels = {
    "never": "ไม่ดื่ม",
    "rarely": "นานๆ ครั้ง",
    "weekly": "สัปดาห์ละ 1-2 ครั้ง",
    "daily": "ทุกวัน"
  };

  const medicalConditionsLabels = {
    "diabetes": "เบาหวาน",
    "hypertension": "ความดันโลหิตสูง",
    "cholesterol": "ไขมันในเลือดสูง",
    "asthma": "หอบหืด",
    "heart-disease": "โรคหัวใจ",
    "other": "อื่น ๆ"
  };

  const notificationLabels = {
    "water": "ดื่มน้ำ",
    "exercise": "ออกกำลังกาย",
    "sleep": "นอนให้ตรงเวลา",
    "weight": "บันทึกน้ำหนักประจำวัน"
  };

  const trackingLabels = {
    "weight": "น้ำหนัก",
    "blood-pressure": "ความดัน",
    "blood-sugar": "ระดับน้ำตาล",
    "body-fat": "ไขมันในร่างกาย"
  };

  const [profileData, setProfileData] = useState({
    firstName: "สมใจ",
    lastName: "ใสใจ",
    email: "somjai@example.com",
    age: "25",
    gender: "female",
    weight: onboardingData.weight.toString(),
    height: onboardingData.height.toString(),
    exerciseGoal: "30",
    waterGoal: "2.5",
    sleepGoal: "8",
    calorieGoal: "2000",
    proteinGoal: "60",
    carbGoal: "250",
    fatGoal: "65",
    fiberGoal: "25",
    sodiumGoal: "2300",
    dietaryRestrictions: [] as string[],
    notifications: true,
    weeklyReports: true,
  });

  const handleSave = async () => {
    setLoading(true);
    setTimeout(() => {
      toast({
        title: "บันทึกข้อมูลสำเร็จ",
        description: "ข้อมูลโปรไฟล์ของคุณได้รับการอัปเดตแล้ว",
      });
      setIsEditing(false);
      setLoading(false);
    }, 1000);
  };

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogout = () => {
    toast({
      title: "ออกจากระบบ",
      description: "คุณได้ออกจากระบบเรียบร้อยแล้ว",
    });
    window.location.href = "/login";
  };

  return (
    <MainLayout>
      {/* Main Profile Content */}
      <div className="w-full mx-auto px-4 sm:px-10 pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">โปรไฟล์</h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              จัดการข้อมูลส่วนตัวและการตั้งค่า
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {!isEditing ? (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button onClick={() => setIsEditing(true)} className="health-button w-full sm:w-auto">
                  <Edit className="h-4 w-4 mr-2" />
                  แก้ไขโปรไฟล์
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = "/onboarding"}
                  className="w-full sm:w-auto"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  อัปเดตข้อมูลสุขภาพ
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="health-button w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "กำลังบันทึก..." : "บันทึก"}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Basic Info Card */}
            <Card className="health-stat-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  ข้อมูลส่วนตัว
                </CardTitle>
                <CardDescription>
                  ข้อมูลพื้นฐานของคุณ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                {/* Avatar */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl">
                      {profileData.firstName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button variant="outline" size="sm" className="mt-2 sm:mt-0">
                      <Camera className="h-4 w-4 mr-2" />
                      เปลี่ยนรูปภาพ
                    </Button>
                  )}
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">ชื่อ</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      disabled={!isEditing}
                      className="health-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">นามสกุล</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      disabled={!isEditing}
                      className="health-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">อีเมล</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={!isEditing}
                      className="health-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">อายุ</Label>
                    <Input
                      id="age"
                      type="number"
                      value={profileData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      disabled={!isEditing}
                      className="health-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">เพศ</Label>
                    <Select
                      value={profileData.gender}
                      onValueChange={(value) => handleInputChange("gender", value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="health-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">ชาย</SelectItem>
                        <SelectItem value="female">หญิง</SelectItem>
                        <SelectItem value="other">อื่นๆ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Health Metrics Card */}
            <Card className="health-stat-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  ข้อมูลสุขภาพ
                </CardTitle>
                <CardDescription>
                  ข้อมูลสุขภาพและร่างกายของคุณ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">น้ำหนัก (กก.)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={profileData.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                      disabled={!isEditing}
                      className="health-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">ส่วนสูง (ซม.)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={profileData.height}
                      onChange={(e) => handleInputChange("height", e.target.value)}
                      disabled={!isEditing}
                      className="health-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>รอบเอว (ซม.)</Label>
                    <Input
                      type="number"
                      value={onboardingData.waist || ""}
                      disabled={!isEditing}
                      className="health-input"
                      placeholder="ไม่ระบุ"
                    />
                  </div>
                </div>

                {/* BMI Display */}
                {bmi > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">ดัชนีมวลกาย (BMI)</Label>
                      <Badge variant="secondary">{bmi}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${bmiInfo.color}`}></div>
                      <span className="text-sm text-muted-foreground">{bmiInfo.category}</span>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-2">
                    <Label>ความดันโลหิต</Label>
                    <Input
                      value={onboardingData.bloodPressure || ""}
                      disabled={!isEditing}
                      className="health-input"
                      placeholder="ไม่ระบุ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>น้ำตาลในเลือด (mg/dL)</Label>
                    <Input
                      value={onboardingData.bloodSugar || ""}
                      disabled={!isEditing}
                      className="health-input"
                      placeholder="ไม่ระบุ"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

                         {/* Health Goals Card */}
             <Card className="health-stat-card">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Target className="h-5 w-5" />
                   เป้าหมายสุขภาพ
                 </CardTitle>
                 <CardDescription>
                   เป้าหมายและแรงจูงใจของคุณ
                 </CardDescription>
               </CardHeader>
               <CardContent className="space-y-4 md:space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                   <div className="space-y-2">
                     <Label>เป้าหมายหลัก</Label>
                     <div className="p-3 border rounded-md bg-muted/50">
                       <span className="text-sm">
                         {onboardingData.healthGoal ? healthGoals[onboardingData.healthGoal as keyof typeof healthGoals] : "ไม่ระบุ"}
                       </span>
                     </div>
                   </div>
                   <div className="space-y-2">
                     <Label>ระยะเวลาเป้าหมาย</Label>
                     <div className="p-3 border rounded-md bg-muted/50">
                       <span className="text-sm">{onboardingData.timeline} เดือน</span>
                     </div>
                   </div>
                 </div>

                 {onboardingData.motivation && (
                   <div className="space-y-2">
                     <Label>แรงจูงใจ</Label>
                     <div className="p-3 border rounded-md bg-muted/50">
                       <span className="text-sm">{onboardingData.motivation}</span>
                     </div>
                   </div>
                 )}

                 <Separator />

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="waterGoal">เป้าหมายน้ำ (ลิตร)</Label>
                     <Input
                       id="waterGoal"
                       type="number"
                       step="0.1"
                       value={profileData.waterGoal}
                       onChange={(e) => handleInputChange("waterGoal", e.target.value)}
                       disabled={!isEditing}
                       className="health-input"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="sleepGoal">เป้าหมายการนอน (ชั่วโมง)</Label>
                     <Input
                       id="sleepGoal"
                       type="number"
                       value={profileData.sleepGoal}
                       onChange={(e) => handleInputChange("sleepGoal", e.target.value)}
                       disabled={!isEditing}
                       className="health-input"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="exerciseGoal">เป้าหมายออกกำลังกาย (นาที/วัน)</Label>
                     <Input
                       id="exerciseGoal"
                       type="number"
                       value={profileData.exerciseGoal}
                       onChange={(e) => handleInputChange("exerciseGoal", e.target.value)}
                       disabled={!isEditing}
                       className="health-input"
                     />
                   </div>
                 </div>
               </CardContent>
             </Card>

             {/* Nutrition Goals Card */}
             <Card className="health-stat-card">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Utensils className="h-5 w-5" />
                   เป้าหมายโภชนาการ
                 </CardTitle>
                 <CardDescription>
                   เป้าหมายการรับประทานอาหารและสารอาหาร
                 </CardDescription>
               </CardHeader>
               <CardContent className="space-y-4 md:space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="calorieGoal">เป้าหมายแคลอรี่ (kcal/วัน)</Label>
                     <Input
                       id="calorieGoal"
                       type="number"
                       value={profileData.calorieGoal || "2000"}
                       onChange={(e) => handleInputChange("calorieGoal", e.target.value)}
                       disabled={!isEditing}
                       className="health-input"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="proteinGoal">เป้าหมายโปรตีน (กรัม/วัน)</Label>
                     <Input
                       id="proteinGoal"
                       type="number"
                       value={profileData.proteinGoal || "60"}
                       onChange={(e) => handleInputChange("proteinGoal", e.target.value)}
                       disabled={!isEditing}
                       className="health-input"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="carbGoal">เป้าหมายคาร์โบไฮเดรต (กรัม/วัน)</Label>
                     <Input
                       id="carbGoal"
                       type="number"
                       value={profileData.carbGoal || "250"}
                       onChange={(e) => handleInputChange("carbGoal", e.target.value)}
                       disabled={!isEditing}
                       className="health-input"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="fatGoal">เป้าหมายไขมัน (กรัม/วัน)</Label>
                     <Input
                       id="fatGoal"
                       type="number"
                       value={profileData.fatGoal || "65"}
                       onChange={(e) => handleInputChange("fatGoal", e.target.value)}
                       disabled={!isEditing}
                       className="health-input"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="fiberGoal">เป้าหมายไฟเบอร์ (กรัม/วัน)</Label>
                     <Input
                       id="fiberGoal"
                       type="number"
                       value={profileData.fiberGoal || "25"}
                       onChange={(e) => handleInputChange("fiberGoal", e.target.value)}
                       disabled={!isEditing}
                       className="health-input"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="sodiumGoal">เป้าหมายโซเดียม (มก./วัน)</Label>
                     <Input
                       id="sodiumGoal"
                       type="number"
                       value={profileData.sodiumGoal || "2300"}
                       onChange={(e) => handleInputChange("sodiumGoal", e.target.value)}
                       disabled={!isEditing}
                       className="health-input"
                     />
                   </div>
                 </div>

                 <Separator />

                 <div className="space-y-4">
                   <Label className="text-sm font-medium">ข้อจำกัดอาหาร</Label>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     <div className="flex items-center space-x-3">
                       <Checkbox
                         id="gluten-free"
                         checked={profileData.dietaryRestrictions?.includes("gluten-free") || false}
                         onCheckedChange={(checked) => {
                           const restrictions = profileData.dietaryRestrictions || [];
                           if (checked) {
                             handleInputChange("dietaryRestrictions", [...restrictions, "gluten-free"]);
                           } else {
                             handleInputChange("dietaryRestrictions", restrictions.filter(r => r !== "gluten-free"));
                           }
                         }}
                         disabled={!isEditing}
                       />
                       <Label htmlFor="gluten-free" className="text-sm">ปราศจากกลูเตน</Label>
                     </div>
                     <div className="flex items-center space-x-3">
                       <Checkbox
                         id="lactose-free"
                         checked={profileData.dietaryRestrictions?.includes("lactose-free") || false}
                         onCheckedChange={(checked) => {
                           const restrictions = profileData.dietaryRestrictions || [];
                           if (checked) {
                             handleInputChange("dietaryRestrictions", [...restrictions, "lactose-free"]);
                           } else {
                             handleInputChange("dietaryRestrictions", restrictions.filter(r => r !== "lactose-free"));
                           }
                         }}
                         disabled={!isEditing}
                       />
                       <Label htmlFor="lactose-free" className="text-sm">ปราศจากแลคโตส</Label>
                     </div>
                     <div className="flex items-center space-x-3">
                       <Checkbox
                         id="vegetarian"
                         checked={profileData.dietaryRestrictions?.includes("vegetarian") || false}
                         onCheckedChange={(checked) => {
                           const restrictions = profileData.dietaryRestrictions || [];
                           if (checked) {
                             handleInputChange("dietaryRestrictions", [...restrictions, "vegetarian"]);
                           } else {
                             handleInputChange("dietaryRestrictions", restrictions.filter(r => r !== "vegetarian"));
                           }
                         }}
                         disabled={!isEditing}
                       />
                       <Label htmlFor="vegetarian" className="text-sm">มังสวิรัติ</Label>
                     </div>
                     <div className="flex items-center space-x-3">
                       <Checkbox
                         id="vegan"
                         checked={profileData.dietaryRestrictions?.includes("vegan") || false}
                         onCheckedChange={(checked) => {
                           const restrictions = profileData.dietaryRestrictions || [];
                           if (checked) {
                             handleInputChange("dietaryRestrictions", [...restrictions, "vegan"]);
                           } else {
                             handleInputChange("dietaryRestrictions", restrictions.filter(r => r !== "vegan"));
                           }
                         }}
                         disabled={!isEditing}
                       />
                       <Label htmlFor="vegan" className="text-sm">วีแกน</Label>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>

            {/* Lifestyle Card */}
            <Card className="health-stat-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  พฤติกรรมประจำวัน
                </CardTitle>
                <CardDescription>
                  ข้อมูลเกี่ยวกับไลฟ์สไตล์ของคุณ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ความถี่การออกกำลังกาย</Label>
                    <div className="p-3 border rounded-md bg-muted/50">
                      <span className="text-sm">
                        {onboardingData.exerciseFrequency ? exerciseFrequencyLabels[onboardingData.exerciseFrequency as keyof typeof exerciseFrequencyLabels] : "ไม่ระบุ"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>ชั่วโมงการนอนต่อวัน</Label>
                    <div className="p-3 border rounded-md bg-muted/50">
                      <span className="text-sm">{onboardingData.sleepHours} ชั่วโมง</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>มื้ออาหารต่อวัน</Label>
                    <div className="p-3 border rounded-md bg-muted/50">
                      <span className="text-sm">{onboardingData.mealsPerDay} มื้อ</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>การดื่มแอลกอฮอล์</Label>
                    <div className="p-3 border rounded-md bg-muted/50">
                      <span className="text-sm">
                        {onboardingData.alcoholFrequency ? alcoholFrequencyLabels[onboardingData.alcoholFrequency as keyof typeof alcoholFrequencyLabels] : "ไม่ระบุ"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {onboardingData.smoking ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <span className="text-sm">สูบบุหรี่</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical History Card */}
            <Card className="health-stat-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  ประวัติสุขภาพ
                </CardTitle>
                <CardDescription>
                  ข้อมูลทางการแพทย์ที่สำคัญ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                {onboardingData.medicalConditions.length > 0 ? (
                  <div className="space-y-2">
                    <Label>โรคประจำตัว</Label>
                    <div className="flex flex-wrap gap-2">
                      {onboardingData.medicalConditions.map((condition) => (
                        <Badge key={condition} variant="outline">
                          {medicalConditionsLabels[condition as keyof typeof medicalConditionsLabels] || condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>โรคประจำตัว</Label>
                    <div className="p-3 border rounded-md bg-muted/50">
                      <span className="text-sm text-muted-foreground">ไม่ระบุ</span>
                    </div>
                  </div>
                )}

                {onboardingData.surgeries ? (
                  <div className="space-y-2">
                    <Label>ประวัติการผ่าตัด</Label>
                    <div className="p-3 border rounded-md bg-muted/50">
                      <span className="text-sm">{onboardingData.surgeries}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>ประวัติการผ่าตัด</Label>
                    <div className="p-3 border rounded-md bg-muted/50">
                      <span className="text-sm text-muted-foreground">ไม่ระบุ</span>
                    </div>
                  </div>
                )}

                {onboardingData.allergies ? (
                  <div className="space-y-2">
                    <Label>ประวัติการแพ้</Label>
                    <div className="p-3 border rounded-md bg-muted/50">
                      <span className="text-sm">{onboardingData.allergies}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>ประวัติการแพ้</Label>
                    <div className="p-3 border rounded-md bg-muted/50">
                      <span className="text-sm text-muted-foreground">ไม่ระบุ</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Settings & Actions */}
          <div className="space-y-4 md:space-y-6">
            {/* Tracking Preferences Card */}
            <Card className="health-stat-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  การติดตาม
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">การแจ้งเตือน</Label>
                  <div className="space-y-2">
                    {onboardingData.notifications.map((notification) => (
                      <div key={notification} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-sm">
                          {notificationLabels[notification as keyof typeof notificationLabels] || notification}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-sm font-medium">การติดตามข้อมูล</Label>
                  <div className="space-y-2">
                    {onboardingData.trackingItems.map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-sm">
                          {trackingLabels[item as keyof typeof trackingLabels] || item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {onboardingData.reminderTime && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">เวลาการแจ้งเตือน</Label>
                      <div className="p-2 border rounded-md bg-muted/50">
                        <span className="text-sm">{onboardingData.reminderTime}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Settings Card */}
            <Card className="health-stat-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  การตั้งค่า
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">การแจ้งเตือน</Label>
                    <p className="text-xs text-muted-foreground">
                      รับการแจ้งเตือนเกี่ยวกับสุขภาพ
                    </p>
                  </div>
                  <Switch
                    checked={profileData.notifications}
                    onCheckedChange={(checked) => handleInputChange("notifications", checked)}
                    disabled={!isEditing}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">รายงานรายสัปดาห์</Label>
                    <p className="text-xs text-muted-foreground">
                      ส่งรายงานสุขภาพทุกสัปดาห์
                    </p>
                  </div>
                  <Switch
                    checked={profileData.weeklyReports}
                    onCheckedChange={(checked) => handleInputChange("weeklyReports", checked)}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card className="health-stat-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  การดำเนินการ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  className="w-full mt-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  ออกจากระบบ
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}