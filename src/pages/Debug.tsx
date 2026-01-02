import { MainLayout } from "@/components/layout/MainLayout";
import DebugConnection from "@/components/debug/DebugConnection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

export default function Debug() {
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Debug & Troubleshooting</h1>
          <p className="text-muted-foreground mt-2">
            ตรวจสอบสถานะการเชื่อมต่อและแก้ไขปัญหาการใช้งาน
          </p>
        </div>

        {/* API Status Info */}
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Info className="h-5 w-5" />
              ข้อมูลสำหรับ Backend Developer
            </CardTitle>
            <CardDescription className="text-yellow-700">
              Frontend พร้อมใช้งานแล้ว แต่ต้องการ Backend API Endpoints
            </CardDescription>
          </CardHeader>
          <CardContent className="text-yellow-700">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">ปัญหาปัจจุบัน:</p>
                  <p className="text-sm">Cannot GET /user/profile - Backend ไม่มี endpoint นี้</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">การแก้ไข:</p>
                  <p className="text-sm">สร้าง GET /user/profile endpoint ใน Backend (ดู BACKEND_API_REQUIREMENTS.md)</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-100 rounded text-sm">
                <p className="font-medium">Frontend จะลองเรียก endpoints ตามลำดับ:</p>
                <ul className="mt-1 space-y-1 list-disc list-inside">
                  <li>/user/profile (แนะนำ)</li>
                  <li>/users/profile</li>
                  <li>/profile</li>
                  <li>/me</li>
                  <li>/user/me</li>
                </ul>
                <p className="mt-2 text-xs text-yellow-600">
                  💡 สร้างอย่างน้อย 1 endpoint จากรายการข้างต้น แล้วระบบจะทำงานได้!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <DebugConnection />
      </div>
    </MainLayout>
  );
}
