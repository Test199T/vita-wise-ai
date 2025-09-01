import { useState, useEffect, useRef } from "react";
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
import { useProfile } from "@/hooks/useProfile";
import { useProfilePicture } from "@/hooks/useProfilePicture";
import { UserProfile, userService } from "@/services/api";
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
  Calendar,
  BarChart3,
  Loader2,
  RefreshCw
} from "lucide-react";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { onboardingData } = useOnboarding();
  const { toast } = useToast();
  
  // Use profile hook for real data
  const { 
    profile, 
    loading: profileLoading, 
    error: profileError, 
    refreshProfile, 
    updateProfile,
    isLoggedIn 
  } = useProfile();

  // Use profile picture hook
  const { 
    profilePicture, 
    loading: uploadingPicture, 
    uploadProfilePicture, 
    removeProfilePicture 
  } = useProfilePicture();

  // Local form data state
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  // Keep old profileData state structure for compatibility with existing UI
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    age: "",
    gender: "female",
    weight: "65",
    height: "165",
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
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      // Update form data for API calls
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        gender: profile.gender || undefined,
        height_cm: profile.height_cm || undefined,
        weight_kg: profile.weight_kg || undefined,
        activity_level: profile.activity_level || undefined,
        date_of_birth: profile.date_of_birth || undefined,
      });

      // Update legacy profileData for UI compatibility
      setProfileData(prev => ({
        ...prev,
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        email: profile.email || "",
        gender: profile.gender || "female",
        weight: profile.weight_kg?.toString() || prev.weight,
        height: profile.height_cm?.toString() || prev.height,
        age: profile.date_of_birth ? 
          Math.floor((new Date().getTime() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toString() 
          : prev.age,
      }));
    }
  }, [profile]);

  // Handle profile picture upload
  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const success = await uploadProfilePicture(file);
      if (success) {
        toast({
          title: "สำเร็จ",
          description: "อัปเดตรูปโปรไฟล์แล้ว",
        });
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: "ไม่สามารถอัปโหลดรูปภาพได้ กรุณาตรวจสอบไฟล์",
          variant: "destructive",
        });
      }
    }
  };

  // Handle profile picture removal
  const handleRemoveProfilePicture = () => {
    removeProfilePicture();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: "สำเร็จ",
      description: "ลบรูปโปรไฟล์แล้ว",
    });
  };

  // Trigger file input click
  const handleChangePictureClick = () => {
    fileInputRef.current?.click();
  };

  // Show loading if not logged in
  if (!isLoggedIn) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">กรุณาเข้าสู่ระบบ</h2>
            <p className="text-muted-foreground">คุณต้องเข้าสู่ระบบเพื่อดูข้อมูลโปรไฟล์</p>
            <Button 
              onClick={() => window.location.href = "/login"} 
              className="mt-4 health-button"
            >
              เข้าสู่ระบบ
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show loading state
  if (profileLoading && !profile) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">กำลังโหลดข้อมูล</h2>
            <p className="text-muted-foreground">กรุณารอสักครู่...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show error state
  if (profileError && !profile) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">เกิดข้อผิดพลาด</h2>
            <p className="text-muted-foreground mb-4">{profileError}</p>
            <div className="space-x-2">
              <Button 
                onClick={refreshProfile} 
                className="health-button"
                disabled={profileLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                ลองอีกครั้ง
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = "/login"}
              >
                <LogOut className="h-4 w-4 mr-2" />
                ออกจากระบบ
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Calculate BMI from real profile data
  const calculateBMI = () => {
    const height = profile?.height_cm || parseFloat(profileData.height);
    const weight = profile?.weight_kg || parseFloat(profileData.weight);
    
    if (height > 0 && weight > 0) {
      const heightInMeters = height / 100;
      return (weight / (heightInMeters * heightInMeters)).toFixed(1);
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

  const handleSave = async () => {
    setLoading(true);
    
    try {
      // Map form data to API format
      const updateData: Partial<UserProfile> = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        email: profileData.email,
        gender: profileData.gender as 'male' | 'female' | 'other',
        height_cm: parseFloat(profileData.height) || undefined,
        weight_kg: parseFloat(profileData.weight) || undefined,
        date_of_birth: profileData.age ? 
          new Date(new Date().getFullYear() - parseInt(profileData.age), 0, 1).toISOString().split('T')[0] 
          : undefined,
      };

      const success = await updateProfile(updateData);
      if (success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogout = () => {
    // Clear all user data
    userService.clearUserData();
    
    toast({
      title: "ออกจากระบบ",
      description: "คุณได้ออกจากระบบเรียบร้อยแล้ว",
    });
    
    // Redirect to login page
    window.location.href = "/login";
  };

  return (
    <MainLayout>
      {/* Main Profile Content */}
      <div className="container mx-auto px-4 sm:px-6 pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">โปรไฟล์</h1>
              {profileLoading && (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              )}
            </div>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              จัดการข้อมูลส่วนตัวและการตั้งค่า
              {profile && (
                <span className="block text-xs mt-1">
                  อัปเดตล่าสุด: {new Date(profile.updated_at).toLocaleDateString('th-TH')}
                  {profile.id === 1 && profile.email === "test@example.com" && (
                    <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                      Mock Data
                    </span>
                  )}
                </span>
              )}
            </p>
            {profileError && (
              <div className="flex items-center gap-1 mt-2 text-yellow-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs">
                  {profileError.includes('mock data') ? 
                    'ใช้ข้อมูลจำลอง - Backend ยังไม่พร้อม' : 
                    'ใช้ข้อมูลแคชชั่วคราว'
                  }
                </span>
              </div>
            )}
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
                  onClick={refreshProfile}
                  disabled={profileLoading}
                  className="w-full sm:w-auto"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${profileLoading ? 'animate-spin' : ''}`} />
                  รีเฟรช
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
                  disabled={loading || profileLoading}
                  className="health-button w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "กำลังบันทึก..." : "บันทึก"}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
          {/* Profile Info */}
          <div className="space-y-4 md:space-y-6">
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
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      {profilePicture ? (
                        <AvatarImage src={profilePicture} alt="Profile" />
                      ) : (
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl">
                          {profile ? (
                            profile.first_name?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase() || "U"
                          ) : (
                            profileData.firstName.charAt(0)
                          )}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    {uploadingPicture && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <div className="flex flex-col gap-2 mt-2 sm:mt-0">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleChangePictureClick}
                        disabled={uploadingPicture}
                      >
                        {uploadingPicture ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4 mr-2" />
                        )}
                        {uploadingPicture ? "กำลังอัปโหลด..." : "เปลี่ยนรูปภาพ"}
                      </Button>
                      {profilePicture && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleRemoveProfilePicture}
                          className="text-red-600 hover:text-red-700"
                        >
                          ลบรูปภาพ
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
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


        </div>
      </div>
    </MainLayout>
  );
}