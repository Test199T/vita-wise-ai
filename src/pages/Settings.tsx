import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Bell, Shield, Palette, Globe, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    // User Profile
    firstName: "สมชาย",
    lastName: "ใจดี",
    email: "somchai@email.com",
    phone: "089-123-4567",
    
    // Notification Preferences
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    dailyReminders: true,
    goalAchievements: true,
    
    // Privacy Settings
    profileVisibility: "friends",
    dataSharing: false,
    analyticsTracking: true,
    
    // App Preferences
    theme: "system",
    language: "th",
    timezone: "Asia/Bangkok",
    units: "metric"
  });

  const handleSave = () => {
    toast({
      title: "บันทึกการตั้งค่าสำเร็จ",
      description: "การตั้งค่าของคุณได้ถูกบันทึกแล้ว"
    });
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-primary">การตั้งค่า</h1>
            <p className="text-muted-foreground">จัดการการตั้งค่าบัญชีและแอปพลิเคชัน</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* User Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                ข้อมูลส่วนตัว
              </CardTitle>
              <CardDescription>
                จัดการข้อมูลพื้นฐานของคุณ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">ชื่อ</Label>
                  <Input
                    id="firstName"
                    value={settings.firstName}
                    onChange={(e) => updateSetting('firstName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">นามสกุล</Label>
                  <Input
                    id="lastName"
                    value={settings.lastName}
                    onChange={(e) => updateSetting('lastName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateSetting('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => updateSetting('phone', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                การแจ้งเตือน
              </CardTitle>
              <CardDescription>
                เลือกประเภทการแจ้งเตือนที่ต้องการรับ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>การแจ้งเตือนทางอีเมล</Label>
                  <p className="text-sm text-muted-foreground">รับการแจ้งเตือนผ่านอีเมล</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">รับการแจ้งเตือนแบบ Push</p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>รายงานสัปดาห์</Label>
                  <p className="text-sm text-muted-foreground">สรุปข้อมูลสุขภาพรายสัปดาห์</p>
                </div>
                <Switch
                  checked={settings.weeklyReports}
                  onCheckedChange={(checked) => updateSetting('weeklyReports', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>การเตือนรายวัน</Label>
                  <p className="text-sm text-muted-foreground">เตือนบันทึกข้อมูลสุขภาพ</p>
                </div>
                <Switch
                  checked={settings.dailyReminders}
                  onCheckedChange={(checked) => updateSetting('dailyReminders', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>การบรรลุเป้าหมาย</Label>
                  <p className="text-sm text-muted-foreground">แจ้งเตือนเมื่อบรรลุเป้าหมาย</p>
                </div>
                <Switch
                  checked={settings.goalAchievements}
                  onCheckedChange={(checked) => updateSetting('goalAchievements', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                ความเป็นส่วนตัว
              </CardTitle>
              <CardDescription>
                จัดการการรักษาความเป็นส่วนตัว
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profileVisibility">การมองเห็นโปรไฟล์</Label>
                <Select value={settings.profileVisibility} onValueChange={(value) => updateSetting('profileVisibility', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">สาธารณะ</SelectItem>
                    <SelectItem value="friends">เฉพาะเพื่อน</SelectItem>
                    <SelectItem value="private">ส่วนตัว</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>แชร์ข้อมูลเพื่อการวิจัย</Label>
                  <p className="text-sm text-muted-foreground">ช่วยปรับปรุงบริการด้วยข้อมูลไม่ระบุตัวตน</p>
                </div>
                <Switch
                  checked={settings.dataSharing}
                  onCheckedChange={(checked) => updateSetting('dataSharing', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>การติดตาม Analytics</Label>
                  <p className="text-sm text-muted-foreground">เก็บข้อมูลการใช้งานเพื่อปรับปรุงแอป</p>
                </div>
                <Switch
                  checked={settings.analyticsTracking}
                  onCheckedChange={(checked) => updateSetting('analyticsTracking', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* App Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                การตั้งค่าแอป
              </CardTitle>
              <CardDescription>
                ปรับแต่งการแสดงผลและการใช้งาน
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">ธีม</Label>
                  <Select value={settings.theme} onValueChange={(value) => updateSetting('theme', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">สว่าง</SelectItem>
                      <SelectItem value="dark">มืด</SelectItem>
                      <SelectItem value="system">ตามระบบ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">ภาษา</Label>
                  <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="th">ไทย</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">เขตเวลา</Label>
                  <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Bangkok">เวลาไทย (GMT+7)</SelectItem>
                      <SelectItem value="Asia/Tokyo">เวลาญี่ปุ่น (GMT+9)</SelectItem>
                      <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="units">หน่วยวัด</Label>
                  <Select value={settings.units} onValueChange={(value) => updateSetting('units', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">เมตริก (กก., ซม.)</SelectItem>
                      <SelectItem value="imperial">อิมพีเรียล (ปอนด์, ฟุต)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} size="lg">
              บันทึกการตั้งค่า
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}