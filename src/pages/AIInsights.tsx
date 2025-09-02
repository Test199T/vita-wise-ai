import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  Users, 
  BarChart3, 
  Target, 
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  PieChart,
  LineChart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserInsight {
  user_id: string;
  username: string;
  health_score: number;
  sleep_quality: number;
  nutrition_score: number;
  exercise_frequency: number;
  stress_level: number;
  last_updated: string;
}

interface BatchAnalysis {
  analysis_id: string;
  analysis_type: string;
  total_users: number;
  completion_percentage: number;
  status: "running" | "completed" | "failed";
  started_at: string;
  completed_at?: string;
  insights_generated: number;
}

interface GlobalInsight {
  insight_id: string;
  insight_type: "trend_analysis" | "population_health" | "correlation_study" | "risk_assessment";
  insight_content: string;
  affected_users: number;
  severity_level: "low" | "medium" | "high";
  confidence_score: number;
  created_at: string;
}

export default function AIInsights() {
  const { toast } = useToast();
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");
  const [selectedAnalysisType, setSelectedAnalysisType] = useState("all");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [batchAnalyses] = useState<BatchAnalysis[]>([
    {
      analysis_id: "1",
      analysis_type: "comprehensive_health",
      total_users: 1247,
      completion_percentage: 100,
      status: "completed",
      started_at: "2024-01-01T08:00:00Z",
      completed_at: "2024-01-01T10:30:00Z",
      insights_generated: 156
    },
    {
      analysis_id: "2",
      analysis_type: "sleep_patterns",
      total_users: 1247,
      completion_percentage: 78,
      status: "running",
      started_at: "2024-01-02T09:00:00Z",
      insights_generated: 89
    }
  ]);

  const [globalInsights] = useState<GlobalInsight[]>([
    {
      insight_id: "1",
      insight_type: "trend_analysis",
      insight_content: "ผู้ใช้ 67% มีคุณภาพการนอนลดลงในช่วง 2 สัปดาห์ที่ผ่านมา โดยเฉพาะในกลุ่มอายุ 25-35 ปี",
      affected_users: 835,
      severity_level: "medium",
      confidence_score: 92,
      created_at: "2024-01-01T10:30:00Z"
    },
    {
      insight_id: "2",
      insight_type: "population_health",
      insight_content: "พบความสัมพันธ์ระหว่างการออกกำลังกายน้อยกว่า 3 ครั้งต่อสัปดาห์กับระดับความเครียดที่สูงขึ้น",
      affected_users: 623,
      severity_level: "high",
      confidence_score: 88,
      created_at: "2024-01-01T11:15:00Z"
    },
    {
      insight_id: "3",
      insight_type: "correlation_study",
      insight_content: "ผู้ที่ดื่มน้ำน้อยกว่า 2 ลิตรต่อวันมีแนวโน้มที่จะมีปัญหาการนอนและความเหนื่อยล้า",
      affected_users: 456,
      severity_level: "medium",
      confidence_score: 85,
      created_at: "2024-01-01T12:00:00Z"
    }
  ]);

  const [userInsights] = useState<UserInsight[]>([
    {
      user_id: "1",
      username: "user_001",
      health_score: 78,
      sleep_quality: 65,
      nutrition_score: 82,
      exercise_frequency: 70,
      stress_level: 45,
      last_updated: "2024-01-01T15:00:00Z"
    },
    {
      user_id: "2", 
      username: "user_002",
      health_score: 92,
      sleep_quality: 88,
      nutrition_score: 95,
      exercise_frequency: 85,
      stress_level: 25,
      last_updated: "2024-01-01T15:00:00Z"
    }
  ]);

  const getInsightIcon = (type: string) => {
    const icons = {
      "trend_analysis": TrendingUp,
      "population_health": Users,
      "correlation_study": BarChart3,
      "risk_assessment": AlertCircle
    };
    const IconComponent = icons[type as keyof typeof icons] || Brain;
    return <IconComponent className="h-5 w-5" />;
  };

  const getInsightTypeLabel = (type: string) => {
    const labels = {
      "trend_analysis": "การวิเคราะห์แนวโน้ม",
      "population_health": "สุขภาพประชากร",
      "correlation_study": "การศึกษาความสัมพันธ์",
      "risk_assessment": "การประเมินความเสี่ยง"
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getSeverityColor = (level: string) => {
    const colors = {
      "low": "bg-green-100 text-green-800",
      "medium": "bg-yellow-100 text-yellow-800",
      "high": "bg-red-100 text-red-800"
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      "running": "bg-blue-100 text-blue-800",
      "completed": "bg-green-100 text-green-800",
      "failed": "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const startBatchAnalysis = () => {
    setIsAnalyzing(true);
    toast({
      title: "เริ่มการวิเคราะห์",
      description: "กำลังวิเคราะห์ข้อมูลผู้ใช้ทั้งหมด กรุณารอสักครู่..."
    });
    
    // Simulate analysis completion
    setTimeout(() => {
      setIsAnalyzing(false);
      toast({
        title: "การวิเคราะห์เสร็จสิ้น",
        description: "สร้างคำแนะนำใหม่ 23 รายการสำหรับผู้ใช้ 1,247 คน"
      });
    }, 3000);
  };

  const downloadReport = () => {
    toast({
      title: "ดาวน์โหลดรายงาน",
      description: "กำลังสร้างรายงานการวิเคราะห์..."
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-primary">AI Insights - การวิเคราะห์ผู้ใช้ทั้งหมด</h1>
              <p className="text-muted-foreground">วิเคราะห์ข้อมูลสุขภาพของผู้ใช้ทั้งหมดและสร้างคำแนะนำแบบ batch</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadReport} className="gap-2">
              <Download className="h-4 w-4" />
              ดาวน์โหลดรายงาน
            </Button>
            <Button onClick={startBatchAnalysis} disabled={isAnalyzing} className="gap-2">
              {isAnalyzing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Brain className="h-4 w-4" />
              )}
              {isAnalyzing ? "กำลังวิเคราะห์..." : "เริ่มการวิเคราะห์ใหม่"}
            </Button>
          </div>
        </div>

        {/* Filters and Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">ช่วงเวลา:</span>
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7 วัน</SelectItem>
                    <SelectItem value="30d">30 วัน</SelectItem>
                    <SelectItem value="90d">90 วัน</SelectItem>
                    <SelectItem value="1y">1 ปี</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">ประเภทการวิเคราะห์:</span>
                <Select value={selectedAnalysisType} onValueChange={setSelectedAnalysisType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="sleep">การนอน</SelectItem>
                    <SelectItem value="nutrition">โภชนาการ</SelectItem>
                    <SelectItem value="exercise">การออกกำลังกาย</SelectItem>
                    <SelectItem value="stress">ความเครียด</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="batch-analysis">การวิเคราะห์แบบ Batch</TabsTrigger>
            <TabsTrigger value="global-insights">คำแนะนำระดับระบบ</TabsTrigger>
            <TabsTrigger value="user-comparison">เปรียบเทียบผู้ใช้</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">ผู้ใช้ทั้งหมด</span>
                  </div>
                  <div className="text-2xl font-bold mt-2">1,247</div>
                  <div className="text-xs text-muted-foreground">+12% จากเดือนที่แล้ว</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    <span className="text-sm font-medium">คำแนะนำที่สร้าง</span>
                  </div>
                  <div className="text-2xl font-bold mt-2">156</div>
                  <div className="text-xs text-muted-foreground">ในรอบ 7 วัน</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium">เป้าหมายที่บรรลุ</span>
                  </div>
                  <div className="text-2xl font-bold mt-2">89%</div>
                  <div className="text-xs text-muted-foreground">ของผู้ใช้ทั้งหมด</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-orange-500" />
                    <span className="text-sm font-medium">การวิเคราะห์ที่กำลังดำเนินการ</span>
                  </div>
                  <div className="text-2xl font-bold mt-2">2</div>
                  <div className="text-xs text-muted-foreground">งานที่กำลังดำเนินการ</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  สถิติสุขภาพโดยรวม
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">76%</div>
                    <div className="text-sm text-muted-foreground">คุณภาพการนอนเฉลี่ย</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">82%</div>
                    <div className="text-sm text-muted-foreground">คะแนนโภชนาการเฉลี่ย</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">68%</div>
                    <div className="text-sm text-muted-foreground">ความถี่การออกกำลังกาย</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">42%</div>
                    <div className="text-sm text-muted-foreground">ระดับความเครียดเฉลี่ย</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Batch Analysis Tab */}
          <TabsContent value="batch-analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  การวิเคราะห์แบบ Batch
                </CardTitle>
                <CardDescription>
                  ติดตามสถานะการวิเคราะห์ข้อมูลผู้ใช้ทั้งหมด
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {batchAnalyses.map((analysis) => (
                    <div key={analysis.analysis_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(analysis.status)}>
                            {analysis.status === "running" ? "กำลังดำเนินการ" : 
                             analysis.status === "completed" ? "เสร็จสิ้น" : "ล้มเหลว"}
                          </Badge>
                          <span className="font-medium">
                            {analysis.analysis_type === "comprehensive_health" ? "การวิเคราะห์สุขภาพแบบครบวงจร" :
                             analysis.analysis_type === "sleep_patterns" ? "รูปแบบการนอน" : analysis.analysis_type}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(analysis.started_at).toLocaleDateString('th-TH')}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>ความคืบหน้า</span>
                          <span>{analysis.completion_percentage}%</span>
                        </div>
                        <Progress value={analysis.completion_percentage} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">ผู้ใช้ทั้งหมด:</span>
                          <span className="ml-2 font-medium">{analysis.total_users.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">คำแนะนำที่สร้าง:</span>
                          <span className="ml-2 font-medium">{analysis.insights_generated}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">สถานะ:</span>
                          <span className="ml-2 font-medium">
                            {analysis.status === "running" ? "กำลังดำเนินการ" : 
                             analysis.status === "completed" ? "เสร็จสิ้น" : "ล้มเหลว"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Global Insights Tab */}
          <TabsContent value="global-insights" className="space-y-4">
            <div className="grid gap-4">
              {globalInsights.map((insight) => (
                <Card key={insight.insight_id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          {getInsightIcon(insight.insight_type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {getInsightTypeLabel(insight.insight_type)}
                          </CardTitle>
                          <CardDescription>
                            สร้างเมื่อ: {new Date(insight.created_at).toLocaleDateString('th-TH')}
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(insight.severity_level)}>
                          {insight.severity_level === "high" ? "สูง" :
                           insight.severity_level === "medium" ? "ปานกลาง" : "ต่ำ"}
                        </Badge>
                        <Badge variant="outline">
                          ผู้ได้รับผลกระทบ: {insight.affected_users.toLocaleString()}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-foreground leading-relaxed">
                      {insight.insight_content}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">ความมั่นใจของ AI</span>
                        <span className="font-semibold">{insight.confidence_score}%</span>
                      </div>
                      <Progress value={insight.confidence_score} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* User Comparison Tab */}
          <TabsContent value="user-comparison" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  เปรียบเทียบสุขภาพผู้ใช้
                </CardTitle>
                <CardDescription>
                  ดูการเปรียบเทียบสุขภาพระหว่างผู้ใช้ต่างๆ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userInsights.map((user) => (
                    <div key={user.user_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">{user.username}</span>
                        <span className="text-sm text-muted-foreground">
                          อัปเดตล่าสุด: {new Date(user.last_updated).toLocaleDateString('th-TH')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{user.health_score}%</div>
                          <div className="text-xs text-muted-foreground">คะแนนสุขภาพ</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{user.sleep_quality}%</div>
                          <div className="text-xs text-muted-foreground">คุณภาพการนอน</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{user.nutrition_score}%</div>
                          <div className="text-xs text-muted-foreground">โภชนาการ</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">{user.exercise_frequency}%</div>
                          <div className="text-xs text-muted-foreground">การออกกำลังกาย</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-600">{user.stress_level}%</div>
                          <div className="text-xs text-muted-foreground">ความเครียด</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <Card className="bg-muted/50">
          <CardContent className="p-6 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">AI วิเคราะห์ข้อมูลผู้ใช้ทั้งหมดแบบ Real-time</h3>
            <p className="text-muted-foreground mb-4">
              ระบบจะวิเคราะห์ข้อมูลสุขภาพของผู้ใช้ทั้งหมดและสร้างคำแนะนำที่เหมาะสมสำหรับแต่ละกลุ่ม
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>การวิเคราะห์แบบ Batch</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>เปรียบเทียบระหว่างผู้ใช้</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>คำแนะนำระดับระบบ</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}