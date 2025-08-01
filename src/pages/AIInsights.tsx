import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, TrendingDown, AlertCircle, CheckCircle, ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIInsight {
  insight_id: string;
  insight_type: string;
  insight_content: string;
  generated_from: string;
  confidence_score: number;
  is_shared_with_user: boolean;
  created_at: string;
}

export default function AIInsights() {
  const { toast } = useToast();
  const [insights] = useState<AIInsight[]>([
    {
      insight_id: "1",
      insight_type: "sleep_analysis",
      insight_content: "การนอนหลับของคุณในสัปดาห์ที่ผ่านมาดีขึ้น 23% เมื่อเทียบกับสัปดาห์ก่อนหน้า คุณควรรักษาปัจจุบันการนอนหลับนี้ต่อไป",
      generated_from: "weekly_sleep_data",
      confidence_score: 89,
      is_shared_with_user: true,
      created_at: "2024-01-01T10:00:00Z"
    },
    {
      insight_id: "2",
      insight_type: "nutrition_recommendation",
      insight_content: "จากข้อมูลการกินของคุณ พบว่าขาดโปรตีนในมื้อเช้า แนะนำให้เพิ่มไข่ หรือ โยเกิร์ต เพื่อให้ได้โปรตีน 20-25g ต่อมื้อ",
      generated_from: "food_logs_analysis",
      confidence_score: 76,
      is_shared_with_user: true,
      created_at: "2024-01-02T08:30:00Z"
    },
    {
      insight_id: "3",
      insight_type: "exercise_pattern",
      insight_content: "คุณมีแนวโน้มออกกำลังกายน้อยลงในวันจันทร์และอังคาร ลองวางแผนการออกกำลังกายเบาๆ ในช่วงต้นสัปดาห์เพื่อสร้างโมเมนตัม",
      generated_from: "exercise_sessions",
      confidence_score: 82,
      is_shared_with_user: true,
      created_at: "2024-01-03T15:20:00Z"
    },
    {
      insight_id: "4",
      insight_type: "stress_correlation",
      insight_content: "ระดับความเครียดของคุณมีความสัมพันธ์กับคุณภาพการนอน เมื่อความเครียดสูง คุณจะนอนหลับไม่สนิท แนะนำให้ฝึกสมาธิก่อนนอน",
      generated_from: "stress_sleep_correlation",
      confidence_score: 91,
      is_shared_with_user: false,
      created_at: "2024-01-04T20:15:00Z"
    }
  ]);

  const getInsightIcon = (type: string) => {
    const icons = {
      "sleep_analysis": TrendingUp,
      "nutrition_recommendation": AlertCircle,
      "exercise_pattern": TrendingDown,
      "stress_correlation": Brain
    };
    const IconComponent = icons[type as keyof typeof icons] || Brain;
    return <IconComponent className="h-5 w-5" />;
  };

  const getInsightTypeLabel = (type: string) => {
    const labels = {
      "sleep_analysis": "การวิเคราะห์การนอน",
      "nutrition_recommendation": "คำแนะนำโภชนาการ", 
      "exercise_pattern": "รูปแบบการออกกำลังกาย",
      "stress_correlation": "ความสัมพันธ์ความเครียด"
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getInsightTypeColor = (type: string) => {
    const colors = {
      "sleep_analysis": "bg-purple-100 text-purple-800",
      "nutrition_recommendation": "bg-green-100 text-green-800",
      "exercise_pattern": "bg-blue-100 text-blue-800", 
      "stress_correlation": "bg-orange-100 text-orange-800"
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleFeedback = (insightId: string, isPositive: boolean) => {
    toast({
      title: "ขอบคุณสำหรับความคิดเห็น",
      description: isPositive ? "เราจะปรับปรุงการวิเคราะห์ให้ดีขึ้น" : "เราจะใช้ข้อมูลนี้ปรับปรุงการวิเคราะห์"
    });
  };

  const generateNewInsights = () => {
    toast({
      title: "กำลังวิเคราะห์ข้อมูล",
      description: "AI กำลังสร้างคำแนะนำใหม่จากข้อมูลล่าสุดของคุณ"
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-primary">AI Insights</h1>
              <p className="text-muted-foreground">คำแนะนำและการวิเคราะห์จาก AI เพื่อสุขภาพที่ดีขึ้น</p>
            </div>
          </div>
          <Button onClick={generateNewInsights} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            สร้างคำแนะนำใหม่
          </Button>
        </div>

        <div className="grid gap-6">
          {insights.map((insight) => (
            <Card key={insight.insight_id} className={!insight.is_shared_with_user ? "border-dashed opacity-75" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {getInsightIcon(insight.insight_type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{getInsightTypeLabel(insight.insight_type)}</CardTitle>
                      <CardDescription>
                        สร้างจาก: {insight.generated_from} • {new Date(insight.created_at).toLocaleDateString('th-TH')}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getInsightTypeColor(insight.insight_type)}>
                      {getInsightTypeLabel(insight.insight_type)}
                    </Badge>
                    {!insight.is_shared_with_user && (
                      <Badge variant="outline">ร่าง</Badge>
                    )}
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
                  <Progress 
                    value={insight.confidence_score} 
                    className="h-2"
                  />
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <div className={`w-2 h-2 rounded-full ${getConfidenceColor(insight.confidence_score)}`}></div>
                    <span>
                      {insight.confidence_score >= 85 ? "ความมั่นใจสูง" : 
                       insight.confidence_score >= 70 ? "ความมั่นใจปานกลาง" : "ความมั่นใจต่ำ"}
                    </span>
                  </div>
                </div>
                
                {insight.is_shared_with_user && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm text-muted-foreground">คำแนะนำนี้มีประโยชน์หรือไม่?</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFeedback(insight.insight_id, true)}
                        className="gap-1"
                      >
                        <ThumbsUp className="h-3 w-3" />
                        มีประโยชน์
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFeedback(insight.insight_id, false)}
                        className="gap-1"
                      >
                        <ThumbsDown className="h-3 w-3" />
                        ไม่มีประโยชน์
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-muted/50">
          <CardContent className="p-6 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">AI เรียนรู้จากข้อมูลของคุณ</h3>
            <p className="text-muted-foreground mb-4">
              ยิ่งคุณบันทึกข้อมูลสุขภาพมากขึ้น AI จะให้คำแนะนำที่แม่นยำและเป็นประโยชน์มากขึ้น
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>ข้อมูลปลอดภัย</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>ไม่เก็บข้อมูลส่วนตัว</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>การวิเคราะห์แบบ Real-time</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}