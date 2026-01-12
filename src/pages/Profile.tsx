import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
import { tokenUtils } from "@/lib/utils";

export default function Profile() {
  const navigate = useNavigate();
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
              onClick={() => navigate("/login")}
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
                onClick={() => tokenUtils.logout()}
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

  const activityLevelLabels = {
    "sedentary": "นั่งทำงาน/ไม่ค่อยขยับตัว",
    "light": "ออกกำลังกายเบาๆ 1-3 วัน/สัปดาห์",
    "moderate": "ออกกำลังกายปานกลาง 3-5 วัน/สัปดาห์",
    "active": "ออกกำลังกายหนัก 6-7 วัน/สัปดาห์",
    "very-active": "ออกกำลังกายหนักมาก/ใช้แรงงาน"
  };

  const screenTimeLabels = {
    "lt2": "น้อยกว่า 2 ชั่วโมง",
    "2-4": "2-4 ชั่วโมง",
    "4-6": "4-6 ชั่วโมง",
    "gt6": "มากกว่า 6 ชั่วโมง"
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
        // ถ้าผู้ใช้ไม่กรอกชื่อ ให้เป็นค่าว่าง (จะไม่อัพเดตชื่อในฐานข้อมูล)
        // ถ้าผู้ใช้กรอกชื่อใหม่ ให้อัพเดตเป็นชื่อใหม่
        first_name: profileData.firstName.trim() || undefined,
        last_name: profileData.lastName.trim() || undefined,
        email: profileData.email.trim() || undefined,
        gender: profileData.gender as 'male' | 'female' | 'other',
        height_cm: parseFloat(profileData.height) || undefined,
        weight_kg: parseFloat(profileData.weight) || undefined,
        date_of_birth: profileData.age ?
          new Date(new Date().getFullYear() - parseInt(profileData.age), 0, 1).toISOString().split('T')[0]
          : undefined,
      };

      // ลบ field ที่เป็น undefined ออก เพื่อไม่ให้อัพเดตข้อมูลที่ไม่ต้องการ
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });

      console.log('🔍 ข้อมูลที่จะอัพเดต:', updateData);
      console.log('🔍 ชื่อที่กรอก:', {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        willUpdate: {
          first_name: updateData.first_name,
          last_name: updateData.last_name
        }
      });

      const success = await updateProfile(updateData);
      if (success) {
        setIsEditing(false);
        toast({
          title: "✅ บันทึกสำเร็จ",
          description: "ข้อมูลโปรไฟล์ถูกอัพเดตเรียบร้อยแล้ว",
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "❌ บันทึกไม่สำเร็จ",
        description: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogout = () => {
    // ใช้ฟังก์ชัน logout ใหม่ที่ล้างข้อมูลทั้งหมด
    tokenUtils.logout();
  };

  return (
    <MainLayout>
      {/* Main Profile Content */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  โปรไฟล์ของคุณ
                </h2>
                {profileLoading && (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>
            <p className="text-muted-foreground text-sm sm:ml-12">
              จัดการข้อมูลส่วนตัวและการตั้งค่าสุขภาพ
              {profile && (
                <span className="block text-xs mt-1 text-muted-foreground">
                  อัปเดตล่าสุด: {new Date(profile.updated_at).toLocaleDateString('th-TH')}
                  {profile.id === 1 && profile.email === "test@example.com" && (
                    <span className="ml-2 px-2 py-1 bg-muted/30 text-muted-foreground rounded-full text-xs">
                      Mock Data
                    </span>
                  )}
                </span>
              )}
            </p>
            {profileError && (
              <div className="flex items-center gap-1 mt-2 text-muted-foreground sm:ml-12">
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
          <div className="flex flex-wrap gap-2">
            {!isEditing ? (
              <>
                <Button
                  onClick={refreshProfile}
                  disabled={profileLoading}
                  variant="outline"
                  className="gap-2 text-sm"
                  size="sm"
                >
                  <RefreshCw className={`h-4 w-4 ${profileLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden xs:inline">{profileLoading ? 'กำลังโหลด...' : 'รีเฟรช'}</span>
                </Button>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="gap-2 text-sm"
                  size="sm"
                >
                  <Edit className="h-4 w-4" />
                  แก้ไข
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/onboarding")}
                  className="gap-2 text-sm"
                  size="sm"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">อัปเดตข้อมูลสุขภาพ</span>
                  <span className="sm:hidden">สุขภาพ</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  size="sm"
                >
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading || profileLoading}
                  className="gap-2"
                  size="sm"
                >
                  <Save className="h-4 w-4" />
                  {loading ? "กำลังบันทึก..." : "บันทึก"}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Profile Info - Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info Card */}
            <Card className="border border-border hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  ข้อมูลส่วนตัว
                </CardTitle>
                <CardDescription className="text-base">
                  ข้อมูลพื้นฐานของคุณ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16 border-2 border-border">
                      {profilePicture ? (
                        <AvatarImage src={profilePicture} alt="Profile" />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
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
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {profileData.firstName} {profileData.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">{profileData.email}</p>
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleChangePictureClick}
                        disabled={uploadingPicture}
                        className="gap-2"
                      >
                        {uploadingPicture ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Camera className="h-3 w-3" />
                        )}
                        เปลี่ยนรูป
                      </Button>
                      {profilePicture && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveProfilePicture}
                          className="gap-2"
                        >
                          ลบ
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-semibold text-foreground">ชื่อ</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      disabled={!isEditing}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-semibold text-foreground">นามสกุล</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      disabled={!isEditing}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-sm font-semibold text-foreground">อายุ</Label>
                    <Input
                      id="age"
                      type="number"
                      value={profileData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      disabled={!isEditing}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-semibold text-foreground">เพศ</Label>
                    <Select
                      value={profileData.gender}
                      onValueChange={(value) => handleInputChange("gender", value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="h-9">
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
            <Card className="border border-border hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  ข้อมูลสุขภาพ
                </CardTitle>
                <CardDescription className="text-base">
                  ข้อมูลสุขภาพและร่างกายของคุณ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-sm font-semibold text-foreground">น้ำหนัก (กก.)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={profileData.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                      disabled={!isEditing}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-sm font-semibold text-foreground">ส่วนสูง (ซม.)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={profileData.height}
                      onChange={(e) => handleInputChange("height", e.target.value)}
                      disabled={!isEditing}
                      className="h-9"
                    />
                  </div>
                </div>

                {/* BMI Display */}
                {bmi > 0 && (
                  <div className="p-3 bg-muted/30 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-foreground">ดัชนีมวลกาย (BMI)</Label>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-sm font-bold">{bmi}</Badge>
                        <div className={`w-3 h-3 rounded-full ${bmiInfo.color}`}></div>
                        <span className="text-xs text-foreground">{bmiInfo.category}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">ความดันโลหิต</Label>
                    <Input
                      value={onboardingData.bloodPressure || ""}
                      disabled={!isEditing}
                      placeholder="ไม่ระบุ"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">น้ำตาลในเลือด</Label>
                    <Input
                      value={onboardingData.bloodSugar || ""}
                      disabled={!isEditing}
                      placeholder="ไม่ระบุ"
                      className="h-9"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Second Row - Goals and Nutrition */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Health Goals Card */}
            <Card className="border border-border hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  เป้าหมายสุขภาพ
                </CardTitle>
                <CardDescription className="text-base">
                  เป้าหมายและแรงจูงใจของคุณ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">เป้าหมายหลัก</Label>
                    <div className="p-3 bg-muted/30 rounded-lg border">
                      <span className="text-sm font-medium text-foreground">
                        {onboardingData.healthGoal ? healthGoals[onboardingData.healthGoal as keyof typeof healthGoals] : "ไม่ระบุ"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">ระยะเวลา</Label>
                    <div className="p-3 bg-muted/30 rounded-lg border">
                      <span className="text-sm font-medium text-foreground">{onboardingData.timeline} เดือน</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="waterGoal" className="text-sm font-semibold text-foreground">น้ำ (ลิตร)</Label>
                    <Input
                      id="waterGoal"
                      type="number"
                      step="0.1"
                      value={profileData.waterGoal}
                      onChange={(e) => handleInputChange("waterGoal", e.target.value)}
                      disabled={!isEditing}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sleepGoal" className="text-sm font-semibold text-foreground">นอน (ชม.)</Label>
                    <Input
                      id="sleepGoal"
                      type="number"
                      value={profileData.sleepGoal}
                      onChange={(e) => handleInputChange("sleepGoal", e.target.value)}
                      disabled={!isEditing}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exerciseGoal" className="text-sm font-semibold text-foreground">ออกกำลัง (นาที)</Label>
                    <Input
                      id="exerciseGoal"
                      type="number"
                      value={profileData.exerciseGoal}
                      onChange={(e) => handleInputChange("exerciseGoal", e.target.value)}
                      disabled={!isEditing}
                      className="h-9"
                    />
                  </div>
                </div>

                {onboardingData.motivation && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">แรงจูงใจ</Label>
                    <div className="p-3 bg-muted/30 rounded-lg border">
                      <span className="text-sm font-medium text-foreground">{onboardingData.motivation}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Nutrition Goals Card */}
            <Card className="border border-border hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Utensils className="h-5 w-5 text-primary" />
                  </div>
                  เป้าหมายโภชนาการ
                </CardTitle>
                <CardDescription className="text-base">
                  เป้าหมายการรับประทานอาหารและสารอาหาร
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="calorieGoal" className="text-sm font-semibold text-foreground">แคลอรี่ (kcal)</Label>
                    <Input
                      id="calorieGoal"
                      type="number"
                      value={profileData.calorieGoal || "2000"}
                      onChange={(e) => handleInputChange("calorieGoal", e.target.value)}
                      disabled={!isEditing}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proteinGoal" className="text-sm font-semibold text-foreground">โปรตีน (g)</Label>
                    <Input
                      id="proteinGoal"
                      type="number"
                      value={profileData.proteinGoal || "60"}
                      onChange={(e) => handleInputChange("proteinGoal", e.target.value)}
                      disabled={!isEditing}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carbGoal" className="text-sm font-semibold text-foreground">คาร์โบ (g)</Label>
                    <Input
                      id="carbGoal"
                      type="number"
                      value={profileData.carbGoal || "250"}
                      onChange={(e) => handleInputChange("carbGoal", e.target.value)}
                      disabled={!isEditing}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fatGoal" className="text-sm font-semibold text-foreground">ไขมัน (g)</Label>
                    <Input
                      id="fatGoal"
                      type="number"
                      value={profileData.fatGoal || "65"}
                      onChange={(e) => handleInputChange("fatGoal", e.target.value)}
                      disabled={!isEditing}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fiberGoal" className="text-sm font-semibold text-foreground">ไฟเบอร์ (g)</Label>
                    <Input
                      id="fiberGoal"
                      type="number"
                      value={profileData.fiberGoal || "25"}
                      onChange={(e) => handleInputChange("fiberGoal", e.target.value)}
                      disabled={!isEditing}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sodiumGoal" className="text-sm font-semibold text-foreground">โซเดียม (mg)</Label>
                    <Input
                      id="sodiumGoal"
                      type="number"
                      value={profileData.sodiumGoal || "2300"}
                      onChange={(e) => handleInputChange("sodiumGoal", e.target.value)}
                      disabled={!isEditing}
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground">ข้อจำกัดอาหาร</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg border">
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
                      <Label htmlFor="gluten-free" className="text-xs font-medium text-foreground">ปราศจากกลูเตน</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg border">
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
                      <Label htmlFor="lactose-free" className="text-xs font-medium text-foreground">ปราศจากแลคโตส</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg border">
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
                      <Label htmlFor="vegetarian" className="text-xs font-medium text-foreground">มังสวิรัติ</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg border">
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
                      <Label htmlFor="vegan" className="text-xs font-medium text-foreground">วีแกน</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Third Row - Lifestyle and Medical */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Lifestyle Card */}
            <Card className="border border-border hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  พฤติกรรมประจำวัน
                </CardTitle>
                <CardDescription className="text-base">
                  ข้อมูลเกี่ยวกับไลฟ์สไตล์ของคุณ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">สูบบุหรี่</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border">
                      {onboardingData.smoking ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      <span className="text-sm font-medium text-foreground">
                        {onboardingData.smoking ? "สูบบุหรี่" : "ไม่สูบบุหรี่"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">แอลกอฮอล์</Label>
                    <div className="p-3 bg-muted/30 rounded-lg border">
                      <span className="text-sm font-medium text-foreground">
                        {onboardingData.alcoholFrequency ?
                          alcoholFrequencyLabels[onboardingData.alcoholFrequency as keyof typeof alcoholFrequencyLabels] :
                          "ไม่ระบุ"
                        }
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">ออกกำลังกาย</Label>
                    <div className="p-3 bg-muted/30 rounded-lg border">
                      <span className="text-sm font-medium text-foreground">
                        {onboardingData.exerciseFrequency ?
                          exerciseFrequencyLabels[onboardingData.exerciseFrequency as keyof typeof exerciseFrequencyLabels] :
                          "ไม่ระบุ"
                        }
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">การนอน</Label>
                    <div className="p-3 bg-muted/30 rounded-lg border">
                      <span className="text-sm font-medium text-foreground">
                        {onboardingData.sleepHours ? `${onboardingData.sleepHours} ชม.` : "ไม่ระบุ"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">มื้ออาหาร</Label>
                    <div className="p-3 bg-muted/30 rounded-lg border">
                      <span className="text-sm font-medium text-foreground">
                        {onboardingData.mealsPerDay ? `${onboardingData.mealsPerDay} มื้อ` : "ไม่ระบุ"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">ดื่มน้ำ</Label>
                    <div className="p-3 bg-muted/30 rounded-lg border">
                      <span className="text-sm font-medium text-foreground">
                        {onboardingData.waterIntakeGlasses ?
                          `${onboardingData.waterIntakeGlasses} แก้ว` :
                          "ไม่ระบุ"
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical History Card */}
            <Card className="border border-border hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                  </div>
                  ประวัติสุขภาพ
                </CardTitle>
                <CardDescription className="text-base">
                  ข้อมูลทางการแพทย์ที่สำคัญ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground">โรคประจำตัว</Label>
                  {onboardingData.medicalConditions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {onboardingData.medicalConditions.map((condition) => (
                        <Badge key={condition} className="bg-muted/30 text-foreground border px-2 py-1 rounded-full text-xs font-medium">
                          {medicalConditionsLabels[condition as keyof typeof medicalConditionsLabels] || condition}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-muted/30 rounded-lg border">
                      <span className="text-sm font-medium text-foreground">ไม่ระบุ</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground">ประวัติการผ่าตัด</Label>
                  <div className="p-3 bg-muted/30 rounded-lg border">
                    <span className="text-sm font-medium text-foreground">
                      {onboardingData.surgeries || "ไม่ระบุ"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground">ประวัติการแพ้</Label>
                  <div className="p-3 bg-muted/30 rounded-lg border">
                    <span className="text-sm font-medium text-foreground">
                      {onboardingData.allergies || "ไม่ระบุ"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>


        </div>
      </div>
    </MainLayout>
  );
}