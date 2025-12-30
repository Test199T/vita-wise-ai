import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { apiService } from "@/services/api";
import { tokenUtils } from "@/lib/utils";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // ตรวจสอบว่าผู้ใช้ล็อกอินแล้วหรือไม่
  useEffect(() => {
    if (tokenUtils.isLoggedIn()) {
      console.log('✅ ForgotPassword: ผู้ใช้ล็อกอินแล้ว - เปลี่ยนไปยังหน้า Dashboard');
      navigate('/dashboard');
    }
  }, [navigate]);

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

  if (isSubmitted) {
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
          <div className="flex flex-col items-center gap-4 mb-2">
            <div className="bg-green-500 p-3 rounded-2xl shadow-lg">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">ส่งอีเมลสำเร็จ</h1>
              <p className="text-muted-foreground text-base max-w-sm mx-auto">
                เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว
              </p>
            </div>
          </div>

          {/* Card Section */}
          <div className="w-full relative">
            <Card className="w-full shadow-health border-0 rounded-3xl overflow-hidden bg-white/90 backdrop-blur-sm relative z-10">
              <CardContent className="p-8 pt-8">
                <div className="space-y-6">
                  <Alert className="border-green-200 bg-green-50">
                    <Mail className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      กรุณาตรวจสอบกล่องจดหมายของ <strong>{email}</strong> และคลิกลิงก์ในอีเมลเพื่อรีเซ็ตรหัสผ่าน
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2 text-sm text-muted-foreground bg-slate-50 p-4 rounded-xl">
                    <p>• หากไม่พบอีเมล กรุณาตรวจสอบโฟลเดอร์ Spam</p>
                    <p>• ลิงก์มีอายุ 24 ชั่วโมง</p>
                    <p>• หากมีปัญหา กรุณาติดต่อฝ่ายสนับสนุน</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={() => {
                        setIsSubmitted(false);
                        setEmail("");
                      }}
                      className="health-button w-full h-12 text-base font-semibold shadow-lg shadow-health/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      ส่งอีเมลอีกครั้ง
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => navigate('/login')}
                      className="w-full h-12 text-base font-semibold rounded-xl transition-all duration-200"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      กลับไปหน้าเข้าสู่ระบบ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="flex flex-col items-center gap-4 mb-2">
          <div className="bg-gradient-primary p-3 rounded-2xl shadow-lg shadow-health/20">
            <Mail className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">ลืมรหัสผ่าน</h1>
            <p className="text-muted-foreground text-base max-w-sm mx-auto">
              กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
            </p>
          </div>
        </div>

        {/* Card Section */}
        <div className="w-full relative">
          <Card className="w-full shadow-health border-0 rounded-3xl overflow-hidden bg-white/90 backdrop-blur-sm relative z-10">
            <CardContent className="p-8 pt-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="rounded-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                    อีเมล <span className="text-primary">*</span>
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="health-input pl-11 h-12 text-base"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground bg-slate-50 p-4 rounded-xl">
                  <p>• เราจะส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณ</p>
                  <p>• ลิงก์มีอายุ 24 ชั่วโมง</p>
                  <p>• หากไม่พบอีเมล กรุณาตรวจสอบโฟลเดอร์ Spam</p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    className="health-button w-full h-12 text-base font-semibold shadow-lg shadow-health/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
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

                  <Link to="/login" className="w-full">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 text-base font-semibold rounded-xl transition-all duration-200"
                      disabled={isLoading}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      กลับไปหน้าเข้าสู่ระบบ
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
