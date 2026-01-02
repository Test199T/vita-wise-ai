import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { tokenUtils } from "@/lib/utils";
import { apiConfig, authConfig } from "@/config/env";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // ตรวจสอบว่าผู้ใช้ล็อกอินแล้วหรือไม่
  useEffect(() => {
    if (tokenUtils.isLoggedIn()) {
      console.log('✅ Register: ผู้ใช้ล็อกอินแล้ว - เปลี่ยนไปยังหน้า Dashboard');
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // ตัวอย่างการตรวจสอบ
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "ข้อผิดพลาด",
        description: "รหัสผ่านไม่ตรงกัน",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Log ข้อมูลที่ผู้ใช้กรอก (ไม่รวมรหัสผ่าน)
    console.log('Registration attempt:', {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      age: formData.age,
      gender: formData.gender,
      passwordLength: formData.password.length
    });

    try {
      const response = await fetch(`${apiConfig.baseUrl}${authConfig.registerEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          age: parseInt(formData.age),
          gender: formData.gender,
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
        console.log('Registration successful:', {
          user: data.user,
          message: data.message
        });

        // หลังสมัครสำเร็จ ให้ล็อกอินทันทีเพื่อเอา JWT
        try {
          console.log('🔄 กำลังล็อกอินทันทีหลังสมัครสำเร็จ...');

          // ล็อกอินทันทีด้วยข้อมูลที่พึ่งสมัคร
          const loginResponse = await fetch(`${apiConfig.baseUrl}${authConfig.loginEndpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password
            })
          });

          if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log('✅ ล็อกอินสำเร็จ:', loginData);

            // ตรวจสอบ JWT Token จาก response
            const token = loginData.token || loginData.accessToken || loginData.access_token || loginData.jwt || loginData.JWT;

            if (token) {
              // บันทึก Token ใน localStorage
              localStorage.setItem('token', token);
              localStorage.setItem('accessToken', token);
              console.log('✅ JWT Token saved to localStorage:', token.substring(0, 20) + '...');

              toast({
                title: "✅ เข้าสู่ระบบสำเร็จ",
                description: "ล็อกอินสำเร็จและได้ JWT Token แล้ว",
                variant: "default",
              });
            } else {
              console.error('❌ ไม่พบ JWT Token หลังล็อกอิน');
              toast({
                title: "⚠️ ล็อกอินสำเร็จแต่ไม่มี Token",
                description: "ล็อกอินสำเร็จแล้ว แต่ระบบยังไม่สามารถสร้าง JWT Token ได้",
                variant: "destructive",
              });
            }
          } else {
            const loginError = await loginResponse.text();
            console.error('❌ ล็อกอินไม่สำเร็จ:', loginResponse.status, loginError);
            toast({
              title: "⚠️ ล็อกอินไม่สำเร็จ",
              description: "การสมัครสมาชิกสำเร็จแล้ว แต่ล็อกอินไม่สำเร็จ กรุณาลองล็อกอินด้วยตนเอง",
              variant: "destructive",
            });
          }
        } catch (loginError) {
          console.error('❌ Error during auto-login:', loginError);
          toast({
            title: "⚠️ ล็อกอินไม่สำเร็จ",
            description: "การสมัครสมาชิกสำเร็จแล้ว แต่ล็อกอินไม่สำเร็จ กรุณาลองล็อกอินด้วยตนเอง",
            variant: "destructive",
          });
        }

        toast({
          title: "สมัครสมาชิกสำเร็จ",
          description: "ยินดีต้อนรับสู่แอปสุขภาพดี AI",
        });

        // ส่งข้อมูลที่สมัครไปยัง Onboarding พร้อม JWT
        navigate("/onboarding", {
          state: {
            registrationData: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              age: parseInt(formData.age),
              gender: formData.gender,
              // เพิ่มข้อมูล JWT
              isProfileCreated: false,
              hasJWT: true,
              message: "เข้าสู่ระบบด้วย JWT แล้ว กรุณาเสร็จสิ้นการตั้งค่า"
            }
          }
        });
      } else {
        // จัดการ error cases ต่างๆ
        let errorMessage = "เกิดข้อผิดพลาดในการสมัครสมาชิก";

        if (response.status === 400) {
          // ตรวจสอบว่าเป็นกรณีอีเมลซ้ำหรือไม่
          if (data.message && data.message.toLowerCase().includes('email') && data.message.toLowerCase().includes('already')) {
            errorMessage = "มีผู้ใช้อีเมลนี้แล้ว กรุณาใช้อีเมลอื่น";
          } else if (data.message && data.message.toLowerCase().includes('duplicate')) {
            errorMessage = "มีบัญชีนี้แล้ว กรุณาใช้อีเมลอื่น";
          } else {
            errorMessage = "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบข้อมูลที่กรอก";
          }
          console.warn('Bad request:', {
            email: formData.email,
            reason: 'Invalid data format',
            backendMessage: data.message,
            validationErrors: data.errors
          });
        } else if (response.status === 409) {
          errorMessage = "มีผู้ใช้อีเมลนี้แล้ว กรุณาใช้อีเมลอื่น";
          console.warn('Email already exists:', {
            email: formData.email,
            reason: 'Email already registered',
            backendMessage: data.message
          });
        } else if (response.status === 422) {
          // ตรวจสอบ validation errors ที่เฉพาะเจาะจง
          if (data.errors && Array.isArray(data.errors)) {
            const emailError = data.errors.find((error: any) =>
              error.field === 'email' || error.message?.toLowerCase().includes('email')
            );
            if (emailError) {
              if (emailError.message?.toLowerCase().includes('already') || emailError.message?.toLowerCase().includes('duplicate')) {
                errorMessage = "มีผู้ใช้อีเมลนี้แล้ว กรุณาใช้อีเมลอื่น";
              } else {
                errorMessage = "รูปแบบอีเมลไม่ถูกต้อง";
              }
            } else {
              errorMessage = "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบข้อมูลที่กรอก";
            }
          } else {
            errorMessage = "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบข้อมูลที่กรอก";
          }
          console.warn('Validation error:', {
            email: formData.email,
            validationErrors: data.errors,
            backendMessage: data.message
          });
        } else if (response.status === 500) {
          errorMessage = "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง";
          console.error('Server error:', {
            email: formData.email,
            status: response.status,
            backendMessage: data.message,
            error: data.error
          });
        } else {
          // ตรวจสอบข้อความจาก backend เพื่อหากรณีอีเมลซ้ำ
          if (data.message && (
            data.message.toLowerCase().includes('email') &&
            (data.message.toLowerCase().includes('already') || data.message.toLowerCase().includes('duplicate') || data.message.toLowerCase().includes('exists'))
          )) {
            errorMessage = "มีผู้ใช้อีเมลนี้แล้ว กรุณาใช้อีเมลอื่น";
          } else if (data.message && data.message.toLowerCase().includes('duplicate')) {
            errorMessage = "มีบัญชีนี้แล้ว กรุณาใช้อีเมลอื่น";
          } else {
            errorMessage = "เกิดข้อผิดพลาดในการสมัครสมาชิก";
          }
          console.error('Unexpected error response:', {
            email: formData.email,
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
        email: formData.email,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      let errorDescription = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต";

      // ตรวจสอบข้อผิดพลาดที่เฉพาะเจาะจง
      if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('network')) {
          errorDescription = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต";
        } else if (error.message.includes('timeout')) {
          errorDescription = "การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง";
        } else if (error.message.includes('cors')) {
          errorDescription = "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง";
        }
      }

      toast({
        title: "ข้อผิดพลาด",
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="h-screen bg-gradient-to-br from-primary-light to-secondary-light flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dot pattern background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="z-10 w-full max-w-[420px] flex flex-col items-center gap-3">
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-2">
          <div className="bg-gradient-primary p-2.5 rounded-2xl shadow-lg shadow-health/20">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">สมัครสมาชิก</h1>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              เริ่มต้นการดูแลสุขภาพกับเราวันนี้
            </p>
          </div>
        </div>

        {/* Card Section */}
        <div className="w-full relative">
          <Card className="w-full shadow-health border-0 rounded-3xl overflow-hidden bg-white/90 backdrop-blur-sm relative z-10">
            <CardContent className="p-6 pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      ชื่อ <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="ชื่อ"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="pl-10 health-input"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      นามสกุล <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="นามสกุล"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="health-input"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    อีเมล <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="อีเมลของคุณ"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10 health-input"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    รหัสผ่าน <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="รหัสผ่าน"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="ยืนยันรหัสผ่าน"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="pl-10 pr-10 health-input"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-sm font-medium">
                      อายุ <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="อายุ"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      className="health-input"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium">
                      เพศ <span className="text-red-500">*</span>
                    </Label>
                    <Select onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger className="health-input">
                        <SelectValue placeholder="เลือกเพศ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">ชาย</SelectItem>
                        <SelectItem value="female">หญิง</SelectItem>
                        <SelectItem value="other">อื่นๆ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="health-button w-full h-12 text-base font-semibold shadow-lg shadow-health/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
                </Button>

                <div className="text-center mt-2">
                  <p className="text-sm text-muted-foreground">
                    มีบัญชีอยู่แล้ว?{" "}
                    <Link
                      to="/login"
                      className="text-primary hover:text-primary-hover font-bold hover:underline"
                    >
                      เข้าสู่ระบบ
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}