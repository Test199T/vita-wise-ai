import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  Heart,
  Brain,
  Users,
  Shield,
  Zap,
  ArrowRight,
  Star,
} from "lucide-react";
import { tokenUtils } from "@/lib/utils";

const Index = () => {
  const navigate = useNavigate();

  // ตรวจสอบว่าผู้ใช้ล็อกอินแล้วหรือไม่
  useEffect(() => {
    if (tokenUtils.isLoggedIn()) {
      console.log("✅ Index: ผู้ใช้ล็อกอินแล้ว - เปลี่ยนไปยังหน้า Dashboard");
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url(/shutterstock_639818752-696x466.jpg)" }}
    >
      <div className="absolute inset-0 bg-black/40" />
      {/* Header */}
      <header className="w-full max-w-3xl mx-auto px-2 sm:px-4 py-4 sm:py-6 relative z-10">
        <nav className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-white">
              สุขภาพดี AI
            </span>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-end">
            <Button
              asChild
              variant="outline"
              className="rounded-full px-4 sm:px-5 text-white border-white/70 hover:bg-white/10 bg-transparent text-sm sm:text-base"
            >
              <Link to="/register">สมัครสมาชิก</Link>
            </Button>
            <Button
              asChild
              className="rounded-full px-4 sm:px-5 bg-blue-500 text-white hover:bg-blue-600 text-sm sm:text-base"
            >
              <Link to="/login">เข้าสู่ระบบ</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-xl mx-auto px-2 sm:px-4 py-10 sm:py-16 text-center relative z-10">
        <div className="fade-in">
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            ดูแลสุขภาพ
            <span className="text-white"> อย่างสมาร์ท</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            ติดตามสุขภาพ บันทึกข้อมูล และรับคำแนะนำจาก AI ส่วนตัว
            เพื่อสุขภาพที่ดีกว่าทุกวัน
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-8 text-white border-white/70 hover:bg-white/10 bg-transparent"
            >
              <Link to="/register">
                สมัครสมาชิก
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-8 text-white border-white/70 hover:bg-white/10 bg-transparent"
            >
              <Link to="/login">เข้าสู่ระบบ</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">ฟีเจอร์หลัก</h2>
          <p className="text-white/80">
            เครื่องมือครบครันสำหรับการดูแลสุขภาพแบบองค์รวม
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bounce-in rounded-xl bg-white/60 backdrop-blur border border-white/20">
            <CardHeader>
              <Heart className="h-8 w-8 text-white mb-2" />
              <CardTitle>ติดตามสุขภาพ</CardTitle>
              <CardDescription>
                บันทึกข้อมูลการนอน การกิน การออกกำลังกาย และอารมณ์
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="bounce-in rounded-xl bg-white/60 backdrop-blur border border-white/20"
            style={{ animationDelay: "0.1s" }}
          >
            <CardHeader>
              <Brain className="h-8 w-8 text-white mb-2" />
              <CardTitle>AI ส่วนตัว</CardTitle>
              <CardDescription>
                ปรึกษาและรับคำแนะนำเกี่ยวกับสุขภาพจาก AI ที่เข้าใจคุณ
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="bounce-in rounded-xl bg-white/60 backdrop-blur border border-white/20"
            style={{ animationDelay: "0.2s" }}
          >
            <CardHeader>
              <Zap className="h-8 w-8 text-white mb-2" />
              <CardTitle>วิเคราะห์แนวโน้ม</CardTitle>
              <CardDescription>
                ดูแนวโน้มสุขภาพและรับรายงานที่ช่วยปรับปรุงคุณภาพชีวิต
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="bounce-in rounded-xl bg-white/60 backdrop-blur border border-white/20"
            style={{ animationDelay: "0.3s" }}
          >
            <CardHeader>
              <Users className="h-8 w-8 text-white mb-2" />
              <CardTitle>ใช้งานง่าย</CardTitle>
              <CardDescription>
                อินเทอร์เฟซที่เข้าใจง่าย เหมาะกับทุกเพศทุกวัย
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="bounce-in rounded-xl bg-white/60 backdrop-blur border border-white/20"
            style={{ animationDelay: "0.4s" }}
          >
            <CardHeader>
              <Shield className="h-8 w-8 text-white mb-2" />
              <CardTitle>ปลอดภัย</CardTitle>
              <CardDescription>
                ข้อมูลของคุณได้รับการปกป้องด้วยความปลอดภัยระดับสูง
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="bounce-in rounded-xl bg-white/60 backdrop-blur border border-white/20"
            style={{ animationDelay: "0.5s" }}
          >
            <CardHeader>
              <Star className="h-8 w-8 text-white mb-2" />
              <CardTitle>ผลลัพธ์จริง</CardTitle>
              <CardDescription>
                ผู้ใช้รายงานการปรับปรุงสุขภาพที่ดีขึ้นอย่างเห็นได้ชัด
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center relative z-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">
            พร้อมเริ่มดูแลสุขภาพแล้วหรือยัง?
          </h2>
          <p className="text-white/80 mb-8">
            เข้าร่วมกับผู้ใช้หลายพันคนที่เลือกใช้ AI ในการดูแลสุขภาพ
          </p>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full text-lg px-8 text-white border-white/70 hover:bg-white/10 bg-transparent"
          >
            <Link to="/login">
              เข้าสู่ระบบ
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur border-0 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 p-2 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">สุขภาพดี AI</span>
            </div>
            <p className="text-sm text-white/80">
              © 2024 สุขภาพดี AI. สงวนสิทธิ์ทั้งหมด
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
