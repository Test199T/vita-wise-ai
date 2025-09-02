import { useState } from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { apiService } from "@/services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("กรุณากรอกอีเมล");
      return;
    }

    // ตรวจสอบรูปแบบอีเมล
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // เรียก API สำหรับส่งอีเมลรีเซ็ตรหัสผ่าน
      await apiService.forgotPassword(email);
      
      setIsSubmitted(true);
      toast({
        title: "ส่งอีเมลสำเร็จ",
        description: "กรุณาตรวจสอบอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          setError("ไม่พบอีเมลนี้ในระบบ กรุณาตรวจสอบอีกครั้ง");
        } else if (error.message.includes("rate limit")) {
          setError("ส่งคำขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่");
        } else {
          setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        }
      } else {
        setError("เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
      }
      
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    window.location.href = "/login";
  };

  if (isSubmitted) {
    return (
      <AuthLayout>
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card className="health-stat-card">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">
                ส่งอีเมลสำเร็จ
              </CardTitle>
              <CardDescription>
                เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  กรุณาตรวจสอบกล่องจดหมายของ <strong>{email}</strong> 
                  และคลิกลิงก์ในอีเมลเพื่อรีเซ็ตรหัสผ่าน
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>• หากไม่พบอีเมล กรุณาตรวจสอบโฟลเดอร์ Spam</p>
                <p>• ลิงก์มีอายุ 24 ชั่วโมง</p>
                <p>• หากมีปัญหา กรุณาติดต่อฝ่ายสนับสนุน</p>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <Button 
                  onClick={handleBackToLogin}
                  className="health-button"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  กลับไปหน้าเข้าสู่ระบบ
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                >
                  ส่งอีเมลใหม่
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card className="health-stat-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              ลืมรหัสผ่าน
            </CardTitle>
            <CardDescription>
              กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="health-input"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <p>• เราจะส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณ</p>
                <p>• ลิงก์มีอายุ 24 ชั่วโมง</p>
                <p>• หากไม่พบอีเมล กรุณาตรวจสอบโฟลเดอร์ Spam</p>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <Button 
                  type="submit" 
                  className="health-button"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      กำลังส่งอีเมล...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      ส่งอีเมลรีเซ็ตรหัสผ่าน
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleBackToLogin}
                  disabled={isLoading}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  กลับไปหน้าเข้าสู่ระบบ
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
