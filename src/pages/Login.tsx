import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, Activity, Loader2, Coffee, AlertCircle, KeyRound, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { tokenUtils } from "@/lib/utils";
import { apiConfig, authConfig } from "@/config/env";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showColdStartWarning, setShowColdStartWarning] = useState(false);
  const [loadingDuration, setLoadingDuration] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<{
    show: boolean;
    title: string;
    message: string;
    suggestions: string[];
  } | null>(null);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Cold start warning timer
  useEffect(() => {
    if (loading) {
      // Start counting loading duration
      const startTime = Date.now();
      loadingTimerRef.current = setInterval(() => {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        setLoadingDuration(duration);

        // Show cold start warning after 3 seconds
        if (duration >= 3 && !showColdStartWarning) {
          setShowColdStartWarning(true);
        }
      }, 1000);
    } else {
      // Reset when not loading
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
      setShowColdStartWarning(false);
      setLoadingDuration(0);
    }

    return () => {
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
      }
    };
  }, [loading]);

  useEffect(() => {
    if (tokenUtils.isLoggedIn()) {
      console.log('✅ Login: User already logged in - Redirecting to Dashboard');
      navigate('/dashboard');
    }

    // ตรวจสอบว่ามีข้อความจาก Session Expired หรือไม่
    const authMessage = sessionStorage.getItem('auth_message');
    if (authMessage) {
      // แสดงข้อความแจ้งเตือน
      setSessionExpiredMessage(authMessage);
      // ลบข้อความออกจาก sessionStorage
      sessionStorage.removeItem('auth_message');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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

      console.log('Backend response:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });

      if (response.ok) {
        if (!data.access_token) {
          console.error('No access_token received from backend:', data);
          toast({
            title: "Error",
            description: "No access token received. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (!tokenUtils.setToken(data.access_token)) {
          toast({
            title: "Error",
            description: "Failed to save access token. Please try again.",
            variant: "destructive",
          });
          return;
        }

        localStorage.setItem('user', JSON.stringify(data.user || {}));
        if (rememberMe) {
          localStorage.setItem('rememberMe_email', email);
        } else {
          localStorage.removeItem('rememberMe_email');
        }

        console.log('Login successful');

        toast({
          title: "Login Successful",
          description: "Welcome back to Vita Wise AI!",
        });

        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        // Clear any previous error first
        setLoginError(null);

        if (response.status === 401) {
          // Secure UX - show helpful error without revealing if email exists
          setLoginError({
            show: true,
            title: 'เข้าสู่ระบบไม่สำเร็จ',
            message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
            suggestions: [
              'ตรวจสอบการพิมพ์อีเมลและรหัสผ่าน',
              'ลองรีเซ็ตรหัสผ่าน หากจำไม่ได้',
              'หากยังไม่มีบัญชี สามารถสมัครสมาชิกได้'
            ]
          });
        } else if (response.status === 429) {
          const retryAfter = data.retryAfter || 60;
          setLoginError({
            show: true,
            title: 'ทำรายการบ่อยเกินไป',
            message: `กรุณารอ ${retryAfter} วินาที แล้วลองใหม่อีกครั้ง`,
            suggestions: [
              'ระบบตรวจพบการพยายามเข้าสู่ระบบบ่อยเกินไป',
              'กรุณารอสักครู่แล้วลองใหม่'
            ]
          });
        } else if (response.status === 500) {
          setLoginError({
            show: true,
            title: 'เกิดข้อผิดพลาด',
            message: 'เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่อีกครั้ง',
            suggestions: [
              'ลองรีเฟรชหน้าแล้วลองใหม่',
              'หากยังไม่ได้ กรุณาติดต่อฝ่ายสนับสนุน'
            ]
          });
        } else {
          setLoginError({
            show: true,
            title: 'เข้าสู่ระบบไม่สำเร็จ',
            message: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
            suggestions: [
              'ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต'
            ]
          });
        }
      }
    } catch (error) {
      console.error('Network/Connection error:', error);

      setLoginError({
        show: true,
        title: 'ไม่สามารถเชื่อมต่อได้',
        message: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        suggestions: [
          'ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
          'ลองรีเฟรชหน้าแล้วลองใหม่'
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-secondary-light flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dot pattern background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="z-10 w-full max-w-[420px] flex flex-col items-center gap-6">
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-6 mb-2">
          <div className="bg-gradient-primary p-3 rounded-2xl shadow-lg shadow-health/20">
            <Activity className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">ยินดีต้อนรับกลับมา!</h1>
            <p className="text-muted-foreground text-base max-w-sm mx-auto">
              กรอกอีเมลด้านล่างเพื่อเข้าสู่ระบบ
            </p>
          </div>
        </div>

        {/* Session Expired Alert */}
        {sessionExpiredMessage && (
          <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-amber-100 p-2 rounded-full shrink-0">
              <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">แจ้งเตือน</p>
              <p className="text-sm text-amber-700 mt-0.5">{sessionExpiredMessage}</p>
            </div>
            <button
              onClick={() => setSessionExpiredMessage(null)}
              className="text-amber-400 hover:text-amber-600 transition-colors shrink-0"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Card Section */}
        <div className="w-full relative">
          <Card className="w-full shadow-health border-0 rounded-3xl overflow-hidden bg-white/90 backdrop-blur-sm relative z-10">
            <CardContent className="p-8 pt-8">
              {/* Login Error Panel - Secure UX */}
              {loginError?.show && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 p-2 rounded-full shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-800">{loginError.title}</p>
                      <p className="text-sm text-red-700 mt-1">{loginError.message}</p>

                      {/* Suggestions */}
                      <ul className="mt-3 space-y-1.5">
                        {loginError.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-xs text-red-600 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full shrink-0" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>

                      {/* Quick Links */}
                      <div className="mt-4 pt-3 border-t border-red-200 flex items-center gap-4">
                        <Link
                          to="/forgot-password"
                          className="text-xs font-medium text-red-700 hover:text-red-900 flex items-center gap-1.5 transition-colors"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                          ลืมรหัสผ่าน?
                        </Link>
                        <span className="text-red-300">|</span>
                        <Link
                          to="/register"
                          className="text-xs font-medium text-red-700 hover:text-red-900 flex items-center gap-1.5 transition-colors"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          สมัครสมาชิก
                        </Link>
                      </div>
                    </div>
                    <button
                      onClick={() => setLoginError(null)}
                      className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground flex">
                    อีเมล <span className="text-primary ml-1">*</span>
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="health-input pl-11 h-12 text-base"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-semibold text-foreground flex">
                      รหัสผ่าน <span className="text-primary ml-1">*</span>
                    </Label>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      ลืมรหัสผ่าน?
                    </Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="health-input pl-11 pr-11 h-12 text-base"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="data-[state=checked]:bg-primary border-muted-foreground/30 h-5 w-5 rounded-md"
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
                  >
                    จดจำฉันไว้
                  </label>
                </div>

                <Button
                  type="submit"
                  className="health-button w-full h-12 text-base font-semibold shadow-lg shadow-health/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                </Button>

                <div className="text-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    ยังไม่มีบัญชี?{" "}
                    <Link
                      to="/register"
                      className="text-primary hover:text-primary-hover font-bold hover:underline"
                    >
                      สมัครสมาชิก
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Footer Layer - stacked behind */}
          <div className="w-full relative -mt-6 pt-10 pb-4 px-10 bg-[#eff1f3] bg-opacity-90 backdrop-blur-md rounded-b-3xl border border-t-0 border-slate-200/60 shadow-sm z-0 text-left transition-all duration-300">
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[400px]">
              เมื่อคลิกดำเนินการต่อ คุณยอมรับ{' '}
              <a href="#" className="font-bold text-slate-700 underline decoration-slate-400 underline-offset-2 hover:text-slate-900 transition-colors">เงื่อนไขการให้บริการ</a> และ{' '}
              <a href="#" className="font-bold text-slate-700 underline decoration-slate-400 underline-offset-2 hover:text-slate-900 transition-colors">นโยบายความเป็นส่วนตัว</a> ของเรา
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}