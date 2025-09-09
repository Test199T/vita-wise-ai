import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { tokenUtils } from "@/lib/utils";
import { apiConfig, authConfig } from "@/config/env";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // ตรวจสอบว่าผู้ใช้ล็อกอินแล้วหรือไม่
  useEffect(() => {
    if (tokenUtils.isLoggedIn()) {
      console.log('✅ Login: ผู้ใช้ล็อกอินแล้ว - เปลี่ยนไปยังหน้า Dashboard');
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Log ข้อมูลที่ผู้ใช้กรอก (ไม่รวมรหัสผ่าน)
    console.log('Login attempt:', { email, passwordLength: password.length });

    try {
      const response = await fetch(`${apiConfig.baseUrl}${authConfig.loginEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      
      // Log response จาก backend
      console.log('Backend response:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });

      if (response.ok) {
        // รับ access_token จาก backend
        if (!data.access_token) {
          console.error('No access_token received from backend:', data);
          toast({
            title: "ข้อผิดพลาด",
            description: "ไม่ได้รับ access_token จากเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง",
            variant: "destructive",
          });
          return;
        }

        // ใช้ utility function เพื่อบันทึก access_token จาก backend
        if (!tokenUtils.setToken(data.access_token)) {
          toast({
            title: "ข้อผิดพลาด",
            description: "ไม่สามารถบันทึก access_token ได้ กรุณาลองใหม่อีกครั้ง",
            variant: "destructive",
          });
          return;
        }

        // บันทึกข้อมูลผู้ใช้
        localStorage.setItem('user', JSON.stringify(data.user || {}));
        
        console.log('Login successful:', {
          user: data.user,
          hasToken: !!data.access_token,
          tokenLength: data.access_token.length,
          tokenPreview: `${data.access_token.substring(0, 20)}...`,
          tokenParts: data.access_token.split('.').length,
          tokenStored: tokenUtils.isValidToken(tokenUtils.getToken()),
          tokenFromBackend: true,
          tokenType: 'access_token'
        });
        
        toast({
          title: "เข้าสู่ระบบสำเร็จ",
          description: "ยินดีต้อนรับสู่แอปสุขภาพดี AI",
        });
        
        // รอสักครู่แล้วค่อยไปหน้า dashboard เพื่อให้ toast แสดงเสร็จ
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        // จัดการ error cases ต่างๆ
        let errorMessage = "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
        
        if (response.status === 401) {
          errorMessage = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
          console.warn('Authentication failed:', {
            email,
            reason: 'Invalid credentials',
            backendMessage: data.message
          });
        } else if (response.status === 404) {
          errorMessage = "ไม่พบผู้ใช้ในระบบ";
          console.warn('User not found:', {
            email,
            reason: 'User does not exist in database',
            backendMessage: data.message
          });
        } else if (response.status === 500) {
          errorMessage = "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์";
          console.error('Server error:', {
            email,
            status: response.status,
            backendMessage: data.message,
            error: data.error
          });
        } else if (response.status === 422) {
          errorMessage = "ข้อมูลไม่ถูกต้อง";
          console.warn('Validation error:', {
            email,
            validationErrors: data.errors,
            backendMessage: data.message
          });
        } else {
          console.error('Unexpected error response:', {
            email,
            status: response.status,
            statusText: response.statusText,
            data: data
          });
        }

        toast({
          title: "ข้อผิดพลาด",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Network/Connection error:', {
        email,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-secondary-light flex items-center justify-center p-4">
      <div className="w-full max-w-md fade-in">
        <Card className="shadow-health border-0">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-primary p-3 rounded-full">
                <Activity className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              เข้าสู่ระบบ
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              เข้าสู่ระบบเพื่อติดตามสุขภาพของคุณ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  อีเมล
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="อีเมลของคุณ"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 health-input"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  รหัสผ่าน
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="รหัสผ่านของคุณ"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 health-input"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:text-primary-hover underline"
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full health-button"
                disabled={loading}
              >
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                ยังไม่มีบัญชี?{" "}
                <Link 
                  to="/register" 
                  className="text-primary hover:text-primary-hover font-medium underline"
                >
                  สมัครสมาชิก
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}