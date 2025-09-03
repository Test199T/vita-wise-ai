import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { apiService } from "@/services/api";
import { useSearchParams } from "react-router-dom";
import { tokenUtils } from "@/lib/utils";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  // ตรวจสอบว่าผู้ใช้ล็อกอินแล้วหรือไม่
  useEffect(() => {
    if (tokenUtils.isLoggedIn()) {
      console.log('✅ ผู้ใช้ล็อกอินแล้ว - เปลี่ยนไปยังหน้า Dashboard');
      navigate('/dashboard');
    }
  }, [navigate]);

  // ตรวจสอบ token เมื่อโหลดหน้า
  useEffect(() => {
    if (!token) {
      setError("Token ไม่ถูกต้องหรือหมดอายุ กรุณาขอลิงก์ใหม่");
      return;
    }

    // ตรวจสอบความถูกต้องของ token
    const validateToken = async () => {
      try {
        await apiService.validateResetToken(token);
      } catch (error) {
        console.error("Token validation error:", error);
        setError("Token ไม่ถูกต้องหรือหมดอายุ กรุณาขอลิงก์ใหม่");
      }
    };

    validateToken();
  }, [token]);

  const validatePassword = (password: string) => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว");
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push("รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว");
    }
    
    if (!/\d/.test(password)) {
      errors.push("รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว");
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError("Token ไม่ถูกต้อง กรุณาขอลิงก์ใหม่");
      return;
    }

    if (!password.trim()) {
      setError("กรุณากรอกรหัสผ่านใหม่");
      return;
    }

    if (!confirmPassword.trim()) {
      setError("กรุณายืนยันรหัสผ่านใหม่");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(", "));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await apiService.resetPassword(token, password);
      
      setIsSuccess(true);
      toast({
        title: "รีเซ็ตรหัสผ่านสำเร็จ",
        description: "คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้แล้ว",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      
      if (error instanceof Error) {
        if (error.message.includes("invalid token")) {
          setError("Token ไม่ถูกต้องหรือหมดอายุ กรุณาขอลิงก์ใหม่");
        } else if (error.message.includes("expired")) {
          setError("Token หมดอายุแล้ว กรุณาขอลิงก์ใหม่");
        } else {
          setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        }
      } else {
        setError("เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
      }
      
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถรีเซ็ตรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    window.location.href = "/login";
  };

  const handleBackToForgotPassword = () => {
    window.location.href = "/forgot-password";
  };

  if (isSuccess) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card className="health-stat-card">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">
                รีเซ็ตรหัสผ่านสำเร็จ
              </CardTitle>
              <CardDescription>
                รหัสผ่านของคุณได้รับการอัปเดตเรียบร้อยแล้ว
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้แล้ว
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>• รหัสผ่านใหม่ของคุณได้รับการบันทึกแล้ว</p>
                <p>• กรุณาเก็บรหัสผ่านไว้ในที่ปลอดภัย</p>
                <p>• หากมีปัญหา กรุณาติดต่อฝ่ายสนับสนุน</p>
              </div>

              <Button 
                onClick={handleBackToLogin}
                className="health-button w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                ไปหน้าเข้าสู่ระบบ
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!token) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card className="health-stat-card">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-600">
                ลิงก์ไม่ถูกต้อง
              </CardTitle>
              <CardDescription>
                Token ไม่ถูกต้องหรือหมดอายุ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว
                </AlertDescription>
              </Alert>
              
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleBackToForgotPassword}
                  className="health-button"
                >
                  ขอลิงก์ใหม่
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleBackToLogin}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  กลับไปหน้าเข้าสู่ระบบ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card className="health-stat-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              ตั้งรหัสผ่านใหม่
            </CardTitle>
            <CardDescription>
              กรอกรหัสผ่านใหม่ของคุณ
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
                <Label htmlFor="password">รหัสผ่านใหม่</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="รหัสผ่านใหม่"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="health-input pr-10"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="ยืนยันรหัสผ่านใหม่"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="health-input pr-10"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="font-medium">ข้อกำหนดรหัสผ่าน:</p>
                <ul className="space-y-1 ml-4">
                  <li>• ต้องมีอย่างน้อย 8 ตัวอักษร</li>
                  <li>• ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว</li>
                  <li>• ต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว</li>
                  <li>• ต้องมีตัวเลขอย่างน้อย 1 ตัว</li>
                </ul>
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
                      กำลังรีเซ็ตรหัสผ่าน...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      ตั้งรหัสผ่านใหม่
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
    </MainLayout>
  );
}
