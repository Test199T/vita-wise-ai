import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Eye, EyeOff, Mail, Lock, User, Timer, AlertCircle, LogIn, KeyRound } from "lucide-react";
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
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    age?: string;
    gender?: string;
  }>({});
  const [registerError, setRegisterError] = useState<{
    show: boolean;
    title: string;
    message: string;
    suggestions: string[];
    showAuthLinks: boolean;
  } | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Validation functions
  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'firstName':
      case 'lastName': {
        if (!value.trim()) return undefined; // Don't show error if empty (required will handle)
        // Check if contains only Thai, English letters and spaces
        const nameRegex = /^[\u0E00-\u0E7Fa-zA-Z\s]+$/;
        if (!nameRegex.test(value)) {
          return field === 'firstName'
            ? 'ชื่อต้องเป็นตัวอักษรภาษาไทยหรืออังกฤษเท่านั้น'
            : 'นามสกุลต้องเป็นตัวอักษรภาษาไทยหรืออังกฤษเท่านั้น';
        }
        if (value.length < 2) {
          return field === 'firstName' ? 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร' : 'นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร';
        }
        return undefined;
      }
      case 'email': {
        if (!value.trim()) return undefined;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'รูปแบบอีเมลไม่ถูกต้อง (เช่น example@email.com)';
        }
        return undefined;
      }
      case 'password': {
        if (!value) return undefined;
        if (value.length < 6) {
          return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
        }
        return undefined;
      }
      case 'confirmPassword': {
        if (!value) return undefined;
        if (value !== formData.password) {
          return 'รหัสผ่านไม่ตรงกัน';
        }
        return undefined;
      }
      case 'age': {
        if (!value) return undefined;
        const age = parseInt(value);
        if (isNaN(age) || age < 1 || age > 150) {
          return 'อายุต้องอยู่ระหว่าง 1-150 ปี';
        }
        return undefined;
      }
      default:
        return undefined;
    }
  };

  // Countdown timer for rate limiting
  useEffect(() => {
    if (rateLimitCountdown > 0) {
      countdownRef.current = setInterval(() => {
        setRateLimitCountdown(prev => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [rateLimitCountdown > 0]);

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
          } else if (data.message && data.message.toLowerCase().includes('rate limit')) {
            errorMessage = "คุณทำรายการบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง (Rate Limit Exceeded)";
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
        } else if (response.status === 429) {
          // จัดการกรณี Rate Limit Exceeded (429)
          const retryAfterSeconds = typeof data.retryAfter === 'number' ? data.retryAfter : 60;
          setRateLimitCountdown(retryAfterSeconds);
          errorMessage = `คุณทำรายการบ่อยเกินไป กรุณารอ ${retryAfterSeconds} วินาที แล้วลองใหม่อีกครั้ง`;

          console.warn('Rate limit exceeded:', {
            email: formData.email,
            status: 429,
            retryAfter: retryAfterSeconds,
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

        // Clear previous error
        setRegisterError(null);

        // Determine error type and show appropriate message
        const isEmailDuplicate =
          response.status === 409 ||
          (data.message && (
            data.message.toLowerCase().includes('email') &&
            (data.message.toLowerCase().includes('already') || data.message.toLowerCase().includes('duplicate') || data.message.toLowerCase().includes('exists'))
          ));

        if (isEmailDuplicate) {
          // Secure approach: Don't reveal if email exists
          setRegisterError({
            show: true,
            title: 'ไม่สามารถสมัครสมาชิกได้',
            message: 'ไม่สามารถใช้อีเมลนี้สมัครสมาชิกได้',
            suggestions: [
              'หากมีบัญชีอยู่แล้ว ลองเข้าสู่ระบบ',
              'ลืมรหัสผ่าน? รีเซ็ตรหัสผ่าน',
              'หรือลองใช้อีเมลอื่น'
            ],
            showAuthLinks: true
          });
        } else if (response.status === 429) {
          const retryAfterSeconds = typeof data.retryAfter === 'number' ? data.retryAfter : 60;
          setRateLimitCountdown(retryAfterSeconds);
          setRegisterError({
            show: true,
            title: 'ทำรายการบ่อยเกินไป',
            message: `กรุณารอ ${retryAfterSeconds} วินาที แล้วลองใหม่อีกครั้ง`,
            suggestions: [
              'ระบบตรวจพบการพยายามสมัครบ่อยเกินไป',
              'กรุณารอสักครู่แล้วลองใหม่'
            ],
            showAuthLinks: false
          });
        } else if (response.status === 500) {
          setRegisterError({
            show: true,
            title: 'เกิดข้อผิดพลาด',
            message: 'เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่อีกครั้ง',
            suggestions: [
              'ลองรีเฟรชหน้าแล้วลองใหม่',
              'หากยังไม่ได้ กรุณาติดต่อฝ่ายสนับสนุน'
            ],
            showAuthLinks: false
          });
        } else {
          setRegisterError({
            show: true,
            title: 'สมัครสมาชิกไม่สำเร็จ',
            message: 'กรุณาตรวจสอบข้อมูลที่กรอก',
            suggestions: [
              'ตรวจสอบรูปแบบอีเมล',
              'ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต'
            ],
            showAuthLinks: false
          });
        }
      }
    } catch (error) {
      console.error('Network/Connection error:', {
        email: formData.email,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      setRegisterError({
        show: true,
        title: 'ไม่สามารถเชื่อมต่อได้',
        message: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        suggestions: [
          'ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
          'ลองรีเฟรชหน้าแล้วลองใหม่'
        ],
        showAuthLinks: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Real-time validation
    const error = validateField(field, value);
    setFieldErrors(prev => ({ ...prev, [field]: error }));

    // Special case: revalidate confirmPassword when password changes
    if (field === 'password' && formData.confirmPassword) {
      const confirmError = value !== formData.confirmPassword ? 'รหัสผ่านไม่ตรงกัน' : undefined;
      setFieldErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  // Check if form has errors
  const hasErrors = Object.values(fieldErrors).some(error => error !== undefined);

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
              {/* Register Error Panel - Secure UX */}
              {registerError?.show && (
                <div className="mb-5 bg-red-50 border border-red-200 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 p-2 rounded-full shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-800">{registerError.title}</p>
                      <p className="text-sm text-red-700 mt-1">{registerError.message}</p>

                      {/* Suggestions */}
                      <ul className="mt-3 space-y-1.5">
                        {registerError.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-xs text-red-600 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full shrink-0" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>

                      {/* Quick Links - Only show for email duplicate case */}
                      {registerError.showAuthLinks && (
                        <div className="mt-4 pt-3 border-t border-red-200 flex items-center gap-4">
                          <Link
                            to="/login"
                            className="text-xs font-medium text-red-700 hover:text-red-900 flex items-center gap-1.5 transition-colors"
                          >
                            <LogIn className="h-3.5 w-3.5" />
                            เข้าสู่ระบบ
                          </Link>
                          <span className="text-red-300">|</span>
                          <Link
                            to="/forgot-password"
                            className="text-xs font-medium text-red-700 hover:text-red-900 flex items-center gap-1.5 transition-colors"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                            ลืมรหัสผ่าน?
                          </Link>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setRegisterError(null)}
                      className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

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
                        className={`pl-10 health-input ${fieldErrors.firstName ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                        required
                      />
                    </div>
                    {fieldErrors.firstName && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.firstName}
                      </p>
                    )}
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
                      className={`health-input ${fieldErrors.lastName ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                      required
                    />
                    {fieldErrors.lastName && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.lastName}
                      </p>
                    )}
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
                      className={`pl-10 health-input ${fieldErrors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                      required
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.email}
                    </p>
                  )}
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
                      className={`pl-10 pr-10 health-input ${fieldErrors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
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
                  {fieldErrors.password && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.password}
                    </p>
                  )}
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
                      className={`pl-10 pr-10 health-input ${fieldErrors.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
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
                  {fieldErrors.confirmPassword && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
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
                      className={`health-input ${fieldErrors.age ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                      required
                    />
                    {fieldErrors.age && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        {fieldErrors.age}
                      </p>
                    )}
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
                  disabled={loading || rateLimitCountdown > 0}
                >
                  {rateLimitCountdown > 0 ? (
                    <span className="flex items-center gap-2">
                      <Timer className="h-4 w-4 animate-pulse" />
                      รอ {rateLimitCountdown} วินาที
                    </span>
                  ) : loading ? (
                    "กำลังสมัครสมาชิก..."
                  ) : (
                    "สมัครสมาชิก"
                  )}
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