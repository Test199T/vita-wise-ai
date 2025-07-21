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
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Settings,
  Target,
  Bell,
  LogOut,
  Edit,
  Save,
  Camera
} from "lucide-react";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "สมใจ",
    lastName: "ใสใจ",
    email: "somjai@example.com",
    age: "25",
    gender: "female",
    weight: "60",
    height: "165",
    stepGoal: "10000",
    waterGoal: "2.5",
    sleepGoal: "8",
    notifications: true,
    weeklyReports: true,
  });
  const { toast } = useToast();

  const handleSave = async () => {
    setLoading(true);

    // จำลองการบันทึกข้อมูล
    setTimeout(() => {
      toast({
        title: "บันทึกข้อมูลสำเร็จ",
        description: "ข้อมูลโปรไฟล์ของคุณได้รับการอัปเดตแล้ว",
      });
      setIsEditing(false);
      setLoading(false);
    }, 1000);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogout = () => {
    toast({
      title: "ออกจากระบบ",
      description: "คุณได้ออกจากระบบเรียบร้อยแล้ว",
    });
    // Navigate to login page
    window.location.href = "/login";
  };

  return (
    <MainLayout>
      {/* Main Profile Content */}
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">โปรไฟล์</h1>
            <p className="text-muted-foreground mt-2">
              จัดการข้อมูลส่วนตัวและการตั้งค่า
            </p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="health-button">
                <Edit className="h-4 w-4 mr-2" />
                แก้ไขโปรไฟล์
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="health-button"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "กำลังบันทึก..." : "บันทึก"}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
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
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl">
                      {profileData.firstName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      เปลี่ยนรูปภาพ
                    </Button>
                  )}
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              </CardContent>
            </Card>

            {/* Health Goals */}
            <Card className="health-stat-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  เป้าหมายสุขภาพ
                </CardTitle>
                <CardDescription>
                  ตั้งเป้าหมายสุขภาพรายวันของคุณ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stepGoal">เป้าหมายก้าวเดิน</Label>
                    <Input
                      id="stepGoal"
                      type="number"
                      value={profileData.stepGoal}
                      onChange={(e) => handleInputChange("stepGoal", e.target.value)}
                      disabled={!isEditing}
                      className="health-input"
                    />
                  </div>
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
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings & Actions */}
          <div className="space-y-6">
            <Card className="health-stat-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  การตั้งค่า
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  className="w-full"
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