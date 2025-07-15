import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Activity, 
  Heart, 
  Brain, 
  Users, 
  Shield, 
  Zap,
  ArrowRight,
  Star
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-secondary-light">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">สุขภาพดี AI</span>
          </div>
          <div className="flex space-x-4">
            <Button asChild variant="outline">
              <Link to="/login">เข้าสู่ระบบ</Link>
            </Button>
            <Button asChild className="health-button">
              <Link to="/register">สมัครสมาชิก</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            ดูแลสุขภาพ
            <span className="bg-gradient-primary bg-clip-text text-transparent"> อย่างสมาร์ท</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            ติดตามสุขภาพ บันทึกข้อมูล และรับคำแนะนำจาก AI ส่วนตัว
            เพื่อสุขภาพที่ดีกว่าทุกวัน
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="health-button text-lg px-8">
              <Link to="/register">
                เริ่มต้นใช้งาน
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8">
              <Link to="/login">เข้าสู่ระบบ</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">ฟีเจอร์หลัก</h2>
          <p className="text-muted-foreground">
            เครื่องมือครบครันสำหรับการดูแลสุขภาพแบบองค์รวม
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="health-stat-card bounce-in">
            <CardHeader>
              <Heart className="h-8 w-8 text-primary mb-2" />
              <CardTitle>ติดตามสุขภาพ</CardTitle>
              <CardDescription>
                บันทึกข้อมูลการนอน การกิน การออกกำลังกาย และอารมณ์
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="health-stat-card bounce-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <Brain className="h-8 w-8 text-accent mb-2" />
              <CardTitle>AI ส่วนตัว</CardTitle>
              <CardDescription>
                ปรึกษาและรับคำแนะนำเกี่ยวกับสุขภาพจาก AI ที่เข้าใจคุณ
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="health-stat-card bounce-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <Zap className="h-8 w-8 text-warning mb-2" />
              <CardTitle>วิเคราะห์แนวโน้ม</CardTitle>
              <CardDescription>
                ดูแนวโน้มสุขภาพและรับรายงานที่ช่วยปรับปรุงคุณภาพชีวิต
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="health-stat-card bounce-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <Users className="h-8 w-8 text-secondary mb-2" />
              <CardTitle>ใช้งานง่าย</CardTitle>
              <CardDescription>
                อินเทอร์เฟซที่เข้าใจง่าย เหมาะกับทุกเพศทุกวัย
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="health-stat-card bounce-in" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <Shield className="h-8 w-8 text-destructive mb-2" />
              <CardTitle>ปลอดภัย</CardTitle>
              <CardDescription>
                ข้อมูลของคุณได้รับการปกป้องด้วยความปลอดภัยระดับสูง
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="health-stat-card bounce-in" style={{ animationDelay: '0.5s' }}>
            <CardHeader>
              <Star className="h-8 w-8 text-accent mb-2" />
              <CardTitle>ผลลัพธ์จริง</CardTitle>
              <CardDescription>
                ผู้ใช้รายงานการปรับปรุงสุขภาพที่ดีขึ้นอย่างเห็นได้ชัด
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            พร้อมเริ่มดูแลสุขภาพแล้วหรือยัง?
          </h2>
          <p className="text-muted-foreground mb-8">
            เข้าร่วมกับผู้ใช้หลายพันคนที่เลือกใช้ AI ในการดูแลสุขภาพ
          </p>
          <Button asChild size="lg" className="health-button text-lg px-8">
            <Link to="/register">
              สมัครสมาชิกฟรี
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">สุขภาพดี AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 สุขภาพดี AI. สงวนสิทธิ์ทั้งหมด
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
