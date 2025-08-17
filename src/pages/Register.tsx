import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      const response = await fetch('http://localhost:3000/auth/register', {
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
        
        toast({
          title: "สมัครสมาชิกสำเร็จ",
          description: "ยินดีต้อนรับสู่แอปสุขภาพดี AI",
        });
        navigate("/onboarding");
      } else {
        // จัดการ error cases ต่างๆ
        let errorMessage = "เกิดข้อผิดพลาดในการสมัครสมาชิก";
        
        if (response.status === 400) {
          errorMessage = "ข้อมูลไม่ถูกต้อง";
          console.warn('Bad request:', {
            email: formData.email,
            reason: 'Invalid data format',
            backendMessage: data.message,
            validationErrors: data.errors
          });
        } else if (response.status === 409) {
          errorMessage = "อีเมลนี้มีอยู่ในระบบแล้ว";
          console.warn('Email already exists:', {
            email: formData.email,
            reason: 'Email already registered',
            backendMessage: data.message
          });
        } else if (response.status === 422) {
          errorMessage = "ข้อมูลไม่ถูกต้อง";
          console.warn('Validation error:', {
            email: formData.email,
            validationErrors: data.errors,
            backendMessage: data.message
          });
        } else if (response.status === 500) {
          errorMessage = "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์";
          console.error('Server error:', {
            email: formData.email,
            status: response.status,
            backendMessage: data.message,
            error: data.error
          });
        } else {
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
      
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
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
              สมัครสมาชิก
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              เริ่มต้นการดูแลสุขภาพกับเราวันนี้
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    ชื่อ
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
                    นามสกุล
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
                  อีเมล
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
                  รหัสผ่าน
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
                  ยืนยันรหัสผ่าน
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
                    อายุ
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
                    เพศ
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
                className="w-full health-button"
                disabled={loading}
              >
                {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                มีบัญชีอยู่แล้ว?{" "}
                <Link 
                  to="/login" 
                  className="text-primary hover:text-primary-hover font-medium underline"
                >
                  เข้าสู่ระบบ
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}