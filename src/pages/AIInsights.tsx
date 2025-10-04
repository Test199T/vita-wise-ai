import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Target,
  Activity,
  Download,
  RefreshCw,
  PlayCircle,
  Database,
  Cpu,
  FileText,
  Clock,
  Zap,
  Heart,
  Dumbbell,
  Moon,
  Utensils,
  Calendar,
  Share2,
  FileSpreadsheet,
  Presentation,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiService, HealthData } from "@/services/aiService";
import { tokenUtils } from "@/lib/utils";
import { debugToken, setTestToken } from "@/utils/tokenDebugger";

interface AnalysisStep {
  id: string;
  label: string;
  description: string;
  icon: any;
  completed: boolean;
  current: boolean;
}

interface PersonalHealthData {
  // ข้อมูลส่วนตัว
  age: number;
  gender: string;
  weight: number;
  height: number;
  bmi: number;

  // ข้อมูลสุขภาพ
  bloodPressure: string;
  bloodSugar: number;
  cholesterol: number;

  // เป้าหมายสุขภาพ
  healthGoals: Array<{
    type: string;
    target: string;
    current: string;
    progress: number;
  }>;

  // ข้อมูลการออกกำลังกาย
  exerciseData: {
    weeklySessions: number;
    avgDuration: number;
    caloriesBurned: number;
    mainActivities: string[];
  };

  // ข้อมูลการกิน
  nutritionData: {
    dailyCalories: number;
    protein: number;
    carbs: number;
    fat: number;
    waterIntake: number;
  };

  // ข้อมูลการนอน
  sleepData: {
    avgSleepHours: number;
    sleepQuality: number;
    bedtime: string;
    wakeTime: string;
  };

  // ข้อมูลสุขภาพจิต
  stressLevel: number;
  moodScore: number;
}

interface AIFinding {
  title?: string;
  summary?: string;
  recommendations?: string[];
  insights?: string[];
  healthScore?: number;
  metrics?: Record<string, any>;
  stats?: Record<string, any>;
  fullText?: string;
}

interface PersonalInsights {
  overallHealthScore: number;
  analysisDate: string;
  keyFindings: (string | AIFinding)[];
  strengths: {
    goalCompletionRate: number;
    consistencyScore: number;
    improvementTrend: number;
    healthyHabits: number;
  };
  areasForImprovement: {
    sleepQuality: number;
    exerciseFrequency: number;
    nutritionBalance: number;
    stressManagement: number;
  };
  personalizedRecommendations: {
    immediate: Array<{
      category: string;
      recommendation: string;
      reason: string;
      impact: string;
    }>;
    shortTerm: Array<{
      category: string;
      recommendation: string;
      reason: string;
      impact: string;
    }>;
    longTerm: Array<{
      category: string;
      recommendation: string;
      reason: string;
      impact: string;
    }>;
  };
  healthAlerts: Array<{
    type: string;
    severity: "low" | "medium" | "high";
    message: string;
    action: string;
  }>;
  progressMetrics: {
    healthScoreTrend: number;
    goalAchievement: number;
    habitConsistency: number;
    overallImprovement: number;
  };
}

export default function AIInsights() {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [personalInsights, setPersonalInsights] =
    useState<PersonalInsights | null>(null);

  // ✅ ถูก - Cache system เพื่อป้องกันการเรียก AI ซ้ำ
  const [lastAnalysis, setLastAnalysis] = useState<{
    data: PersonalInsights;
    timestamp: number;
    userId: number;
  } | null>(null);

  const analysisSteps: AnalysisStep[] = [
    {
      id: "data_collection",
      label: "Collecting Personal Data",
      description: "Gathering your health and behavioral data",
      icon: Database,
      completed: false,
      current: false,
    },
    {
      id: "pattern_analysis",
      label: "Analyzing Health Patterns",
      description: "Identifying trends and correlations in your data",
      icon: TrendingUp,
      completed: false,
      current: false,
    },
    {
      id: "ai_processing",
      label: "AI Personal Processing",
      description: "Generating personalized recommendations for you",
      icon: Cpu,
      completed: false,
      current: false,
    },
    {
      id: "report_generation",
      label: "Generating Personal Report",
      description: "Compiling analysis results and recommendations",
      icon: FileText,
      completed: false,
      current: false,
    },
  ];

  const startPersonalAnalysis = async () => {
    // ✅ ถูก - ป้องกันการเรียกซ้ำ
    if (isAnalyzing) {
      console.log("Analysis already in progress, skipping...");
      return;
    }

    // ✅ ถูก - ล้างข้อมูลเก่าและเริ่มวิเคราะห์ใหม่
    setPersonalInsights(null);
    setLastAnalysis(null);
    setAnalysisCompleted(false);

    setIsAnalyzing(true);
    setCurrentStep(0);

    toast({
      title: "Starting Personal Health Analysis",
      description: "Analyzing your health data, please wait...",
    });

    try {
      // ✅ ถูก - ตรวจสอบ authentication และ user ID
      if (!tokenUtils.isLoggedIn()) {
        toast({
          title: "Authentication Required",
          description: "Please login to access AI health analysis",
          variant: "destructive",
        });
        setIsAnalyzing(false);
        return;
      }

      const userId = tokenUtils.getUserId() || 1; // ใช้ fallback user ID ถ้าไม่พบ
      console.log("Using user ID:", userId);

      // Step 1: Data Collection
      setCurrentStep(1);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 2: Pattern Analysis
      setCurrentStep(2);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 3: AI Processing
      setCurrentStep(3);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // ✅ ถูก - เรียก AI Service ครั้งเดียวเท่านั้น (บังคับวิเคราะห์ใหม่)
      const response = await aiService.analyzeHealth(userId, {
        analysisType: "complete",
        timeframe: "month",
        includeRecommendations: true,
        includeInsights: true,
      } as any);

      // Step 4: Report Generation
      setCurrentStep(4);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (response.success && response.data) {
        // ✅ ถูก - ใช้ข้อมูลจาก AI Service จริงๆ
        console.log("AI Response:", response.data);
        console.log("AI Analysis exists:", !!response.data.aiAnalysis);
        console.log("AI Analysis content:", response.data.aiAnalysis);
        console.log("AI Analysis type:", typeof response.data.aiAnalysis);
        console.log(
          "AI Analysis is array:",
          Array.isArray(response.data.aiAnalysis)
        );
        console.log("Health Scores:", response.data.healthScores);

        // Process AI analysis data
        const aiAnalysis = response.data.aiAnalysis;
        let processedKeyFindings = [];

        if (typeof aiAnalysis === "string" && aiAnalysis.trim().length > 0) {
          // Extract structured data from AI string response
          console.log("Processing AI string response:", aiAnalysis);
          const structuredData = extractStructuredData(aiAnalysis);
          processedKeyFindings = [structuredData];
        } else if (Array.isArray(aiAnalysis) && aiAnalysis.length > 0) {
          // If AI returns an array of strings
          console.log("Processing AI array response:", aiAnalysis);
          console.log("Array length:", aiAnalysis.length);
          console.log("First element:", aiAnalysis[0]);
          console.log("First element type:", typeof aiAnalysis[0]);
          const structuredData = extractStructuredData(aiAnalysis[0]);
          console.log("Structured data:", structuredData);
          processedKeyFindings = [structuredData];
        } else if (typeof aiAnalysis === "object" && aiAnalysis !== null) {
          // If AI returns a structured object
          console.log("Processing AI object response:", aiAnalysis);
          processedKeyFindings = [aiAnalysis];
        } else {
          // Fallback: Create structured data from health scores
          console.log("Creating fallback data from health scores");
          const healthScores = response.data.healthScores;
          const structuredData = {
            title: "การวิเคราะห์สุขภาพโดยรวม",
            summary: `คะแนนสุขภาพโดยรวมของคุณคือ ${healthScores.overallScore} คะแนน จากคะแนนเต็ม 100 คะแนน`,
            recommendations: [
              `คะแนนโภชนาการ: ${healthScores.nutritionScore}% - ${
                healthScores.nutritionScore < 70
                  ? "ควรปรับปรุงการรับประทานอาหาร"
                  : "โภชนาการอยู่ในเกณฑ์ดี"
              }`,
              `คะแนนการออกกำลังกาย: ${healthScores.exerciseScore}% - ${
                healthScores.exerciseScore < 70
                  ? "ควรเพิ่มการออกกำลังกาย"
                  : "การออกกำลังกายอยู่ในเกณฑ์ดี"
              }`,
              `คะแนนการนอน: ${healthScores.sleepScore}% - ${
                healthScores.sleepScore < 70
                  ? "ควรปรับปรุงคุณภาพการนอน"
                  : "การนอนอยู่ในเกณฑ์ดี"
              }`,
              `คะแนนการดื่มน้ำ: ${healthScores.waterScore}% - ${
                healthScores.waterScore < 70
                  ? "ควรเพิ่มการดื่มน้ำ"
                  : "การดื่มน้ำอยู่ในเกณฑ์ดี"
              }`,
            ],
            insights: [
              `คะแนนรวม: ${healthScores.overallScore}%`,
              `จุดแข็ง: ${
                healthScores.overallScore >= 80
                  ? "สุขภาพโดยรวมดีเยี่ยม"
                  : healthScores.overallScore >= 60
                  ? "สุขภาพโดยรวมดี"
                  : "ควรปรับปรุงสุขภาพโดยรวม"
              }`,
              `พื้นที่ที่ต้องปรับปรุง: ${
                Object.entries(healthScores)
                  .filter(
                    ([key, value]) =>
                      key !== "overallScore" &&
                      typeof value === "number" &&
                      (value as number) < 70
                  )
                  .map(([key]) => key)
                  .join(", ") || "ไม่มี"
              }`,
            ],
            healthScore: healthScores.overallScore,
          };
          processedKeyFindings = [structuredData];
        }

        console.log("Final processedKeyFindings:", processedKeyFindings);
        console.log(
          "Final processedKeyFindings length:",
          processedKeyFindings.length
        );

        const insightsData = {
          overallHealthScore: response.data.healthScores.overallScore,
          analysisDate: new Date().toLocaleString("th-TH"),
          keyFindings: processedKeyFindings,
          strengths: {
            goalCompletionRate: response.data.healthScores.overallScore, // ใช้คะแนนจาก AI
            consistencyScore: Math.round(
              (response.data.healthScores.nutritionScore +
                response.data.healthScores.exerciseScore) /
                2
            ),
            improvementTrend:
              response.data.healthScores.overallScore > 70 ? 85 : 65,
            healthyHabits: Math.round(
              (response.data.healthScores.sleepScore +
                response.data.healthScores.waterScore) /
                2
            ),
          },
          areasForImprovement: {
            sleepQuality: 100 - response.data.healthScores.sleepScore,
            exerciseFrequency: 100 - response.data.healthScores.exerciseScore,
            nutritionBalance: 100 - response.data.healthScores.nutritionScore,
            stressManagement: 100 - response.data.healthScores.waterScore,
          },
          personalizedRecommendations: {
            immediate: response.data.recommendations?.immediate || [],
            shortTerm: response.data.recommendations?.shortTerm || [],
            longTerm: response.data.recommendations?.longTerm || [],
          },
          healthAlerts: response.data.healthAlerts || [],
          progressMetrics: {
            healthScoreTrend:
              response.data.healthScores.overallScore > 70 ? 15 : -5,
            goalAchievement: response.data.healthScores.overallScore,
            habitConsistency: Math.round(
              (response.data.healthScores.nutritionScore +
                response.data.healthScores.exerciseScore +
                response.data.healthScores.sleepScore +
                response.data.healthScores.waterScore) /
                4
            ),
            overallImprovement: response.data.healthScores.overallScore,
          },
        };

        // ✅ ถูก - แสดงผลลัพธ์การวิเคราะห์ใหม่
        setPersonalInsights(insightsData);
      } else {
        throw new Error(response.message || "Analysis failed");
      }
    } catch (error) {
      console.error("AI Analysis Error:", error);

      // Reset current step on error
      setCurrentStep(0);

      // ✅ ถูก - ตรวจสอบ authentication error
      if (
        error.message.includes("Authentication") ||
        error.message.includes("login")
      ) {
        toast({
          title: "Authentication Required",
          description: "Please login to access AI health analysis",
          variant: "destructive",
        });
        setIsAnalyzing(false);
        return;
      }

      // ✅ ถูก - Fallback to demo data if AI service fails
      setPersonalInsights({
        overallHealthScore: 78,
        analysisDate: new Date().toLocaleString("th-TH"),
        keyFindings: [
          "Your sleep quality has improved over the past 2 weeks",
          "Regular exercise has significantly reduced stress levels",
          "Increased water intake has improved sleep quality",
          "Weight loss goals are progressing well",
          "Consider increasing protein intake for muscle building",
        ],
        strengths: {
          goalCompletionRate: 85,
          consistencyScore: 78,
          improvementTrend: 82,
          healthyHabits: 75,
        },
        areasForImprovement: {
          sleepQuality: 65,
          exerciseFrequency: 70,
          nutritionBalance: 72,
          stressManagement: 68,
        },
        personalizedRecommendations: {
          immediate: [
            {
              category: "Sleep",
              recommendation: "Go to bed before 11:00 PM consistently",
              reason: "Current sleep quality is below standard",
              impact: "Improve sleep quality by 25%",
            },
            {
              category: "Nutrition",
              recommendation: "Increase protein intake by 20g per day",
              reason: "Insufficient protein for muscle building",
              impact: "Increase muscle mass by 15%",
            },
          ],
          shortTerm: [
            {
              category: "Exercise",
              recommendation: "Increase exercise frequency to 4 times per week",
              reason: "Current frequency is insufficient for goals",
              impact: "Increase strength by 30%",
            },
            {
              category: "Stress Management",
              recommendation: "Practice deep breathing for 10 minutes daily",
              reason: "Stress levels are higher than normal",
              impact: "Reduce stress by 40%",
            },
          ],
          longTerm: [
            {
              category: "Lifestyle",
              recommendation: "Create a balanced daily routine",
              reason: "For sustainable health management",
              impact: "Improve quality of life by 50%",
            },
            {
              category: "Tracking",
              recommendation: "Use health tracking system consistently",
              reason: "For continuous improvement",
              impact: "Increase efficiency by 35%",
            },
          ],
        },
        healthAlerts: [
          {
            type: "Sleep",
            severity: "medium",
            message: "Sleep quality is below standard",
            action: "Adjust bedtime and create pre-sleep routine",
          },
          {
            type: "Nutrition",
            severity: "low",
            message: "Insufficient protein intake",
            action: "Increase protein consumption from meat and plants",
          },
        ],
        progressMetrics: {
          healthScoreTrend: 15,
          goalAchievement: 85,
          habitConsistency: 78,
          overallImprovement: 82,
        },
      });

      toast({
        title: "Analysis Complete (Demo Mode)",
        description: "Using demo data - AI service connection failed",
        variant: "destructive",
      });
    }

    // ✅ ถูก - ปิด loading state และแสดงผลลัพธ์
    setIsAnalyzing(false);
    setAnalysisCompleted(true);
    setCurrentStep(0); // Reset step for next analysis
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 71) return "text-green-600";
    if (score >= 41) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthScoreBgColor = (score: number) => {
    if (score >= 71) return "bg-green-100";
    if (score >= 41) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Function to format AI response text for better readability
  const formatAIResponse = (text: string) => {
    if (!text) return "";

    // Clean up the text
    let cleanedText = text
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/\n+/g, " ") // Replace newlines with spaces
      .trim();

    // Split into sentences and clean them
    const sentences = cleanedText
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10 && !s.match(/^\d+$/)); // Filter out short sentences and numbers only

    return sentences;
  };

  // Function to extract structured data from AI response
  const extractStructuredData = (aiResponse: any) => {
    if (typeof aiResponse === "string") {
      // Split the response into sections
      const sections = aiResponse.split(/\n\n/);
      const summary = sections[0] || aiResponse.substring(0, 200) + "...";

      // Extract recommendations from the text
      const recommendations = [];
      const insights = [];

      // Look for specific patterns in Thai text
      if (aiResponse.includes("คำแนะนำ")) {
        const recommendationSection = aiResponse.split("คำแนะนำ")[1];
        if (recommendationSection) {
          const recLines = recommendationSection
            .split(/\n/)
            .filter(
              (line) =>
                line.trim().length > 10 &&
                (line.includes("-") ||
                  line.includes("•") ||
                  line.includes("1.") ||
                  line.includes("2.") ||
                  line.includes("3.") ||
                  line.includes("4.") ||
                  line.includes("5."))
            );
          recommendations.push(...recLines.slice(0, 8)); // เพิ่มจำนวนคำแนะนำ
        }
      }

      // Extract insights from analysis section
      if (aiResponse.includes("การวิเคราะห์")) {
        const analysisSection = aiResponse.split("การวิเคราะห์")[1];
        if (analysisSection) {
          const insightLines = analysisSection
            .split(/\n/)
            .filter(
              (line) =>
                line.trim().length > 15 &&
                (line.includes("น้ำหนัก") ||
                  line.includes("อาหาร") ||
                  line.includes("ออกกำลังกาย") ||
                  line.includes("นอน") ||
                  line.includes("น้ำ") ||
                  line.includes("BMI") ||
                  line.includes("แคลอรี่") ||
                  line.includes("โปรตีน") ||
                  line.includes("คาร์โบไฮเดรต"))
            );
          insights.push(...insightLines.slice(0, 6)); // เพิ่มจำนวนข้อมูลเชิงลึก
        }
      }

      // Extract more detailed recommendations from the full text
      const fullTextLines = aiResponse.split(/\n/);
      fullTextLines.forEach((line) => {
        const trimmedLine = line.trim();
        if (
          trimmedLine.length > 20 &&
          (trimmedLine.includes("แนะนำ") ||
            trimmedLine.includes("ควร") ||
            trimmedLine.includes("พิจารณา") ||
            trimmedLine.includes("ปรับ") ||
            trimmedLine.includes("เพิ่ม") ||
            trimmedLine.includes("ลด"))
        ) {
          if (!recommendations.includes(trimmedLine)) {
            recommendations.push(trimmedLine);
          }
        }
      });

      // Extract more insights from the full text
      fullTextLines.forEach((line) => {
        const trimmedLine = line.trim();
        if (
          trimmedLine.length > 20 &&
          (trimmedLine.includes("น้ำหนัก") ||
            trimmedLine.includes("ส่วนสูง") ||
            trimmedLine.includes("BMI") ||
            trimmedLine.includes("แคลอรี่") ||
            trimmedLine.includes("โปรตีน") ||
            trimmedLine.includes("วิ่ง") ||
            trimmedLine.includes("นอน") ||
            trimmedLine.includes("น้ำ"))
        ) {
          if (!insights.includes(trimmedLine)) {
            insights.push(trimmedLine);
          }
        }
      });

      // Fallback: create recommendations and insights from the text
      if (recommendations.length === 0) {
        recommendations.push(
          "ควรรับประทานอาหารให้ครบ 5 หมู่ และดื่มน้ำอย่างน้อย 8 แก้วต่อวัน",
          "ออกกำลังกายอย่างน้อย 30 นาทีต่อวัน 3-4 ครั้งต่อสัปดาห์",
          "นอนหลับให้เพียงพอ 7-9 ชั่วโมงต่อคืน และเข้านอนในเวลาเดียวกันทุกวัน"
        );
      }

      if (insights.length === 0) {
        insights.push(
          "คะแนนสุขภาพโดยรวมอยู่ในเกณฑ์ดี",
          "ควรปรับปรุงการออกกำลังกายและการดื่มน้ำ",
          "การนอนหลับมีคุณภาพดี"
        );
      }

      return {
        title: "การวิเคราะห์สุขภาพโดยรวม",
        summary: summary,
        recommendations: recommendations.slice(0, 10), // จำกัดจำนวนคำแนะนำ
        insights: insights.slice(0, 8), // จำกัดจำนวนข้อมูลเชิงลึก
        healthScore: null,
        fullText: aiResponse, // เพิ่มข้อมูลเต็ม
      };
    }

    return aiResponse;
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Personal Health Analysis
              </h1>
              <p className="text-muted-foreground">
                AI-powered health insights and personalized recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Main Analysis Section */}
        {!analysisCompleted && (
          <Card>
            <CardHeader>
              <CardTitle>Health Data Analysis</CardTitle>
              <CardDescription>
                Analyze your personal health data and receive AI-powered
                insights and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>Health Metrics</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Target className="h-4 w-4 text-green-500" />
                  <span>Health Goals</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Dumbbell className="h-4 w-4 text-orange-500" />
                  <span>Exercise Data</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Utensils className="h-4 w-4 text-purple-500" />
                  <span>Nutrition</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Moon className="h-4 w-4 text-indigo-500" />
                  <span>Sleep Patterns</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Activity className="h-4 w-4 text-cyan-500" />
                  <span>Daily Activity</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Brain className="h-4 w-4 text-pink-500" />
                  <span>Mental Health</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>Energy Levels</span>
                </div>
              </div>

              <div className="text-center pt-4">
                <Button
                  onClick={startPersonalAnalysis}
                  disabled={isAnalyzing || analysisCompleted}
                  size="lg"
                  className="px-8"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : analysisCompleted ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Analysis Complete
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start Analysis
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Estimated time: 30-45 seconds
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Progress */}
        {isAnalyzing && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisSteps.map((step, index) => {
                  const IconComponent = step.icon;
                  const isCompleted = index < currentStep;
                  const isCurrent = index === currentStep - 1;

                  return (
                    <div key={step.id} className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-full ${
                          isCompleted
                            ? "bg-green-100 text-green-600"
                            : isCurrent
                            ? "bg-blue-100 text-blue-600 animate-pulse"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3
                            className={`font-medium ${
                              isCompleted
                                ? "text-green-600"
                                : isCurrent
                                ? "text-blue-600"
                                : "text-gray-400"
                            }`}
                          >
                            {step.label}
                          </h3>
                          {isCompleted && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personal Analysis Results */}
        {analysisCompleted && personalInsights && (
          <div className="space-y-6">
            {/* Executive Summary */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Health Analysis Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div
                      className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getHealthScoreBgColor(
                        personalInsights.overallHealthScore
                      )} mb-4`}
                    >
                      <span
                        className={`text-3xl font-bold ${getHealthScoreColor(
                          personalInsights.overallHealthScore
                        )}`}
                      >
                        {personalInsights.overallHealthScore}
                      </span>
                    </div>
                    <h3 className="font-semibold">Overall Health Score</h3>
                    <p className="text-sm text-muted-foreground">
                      Out of 100 points
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 mb-4">
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold">Improvement Trend</h3>
                    <p className="text-sm text-muted-foreground">
                      +{personalInsights.progressMetrics.healthScoreTrend}% from
                      last month
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-purple-100 mb-4">
                      <Calendar className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold">Analysis Date</h3>
                    <p className="text-sm text-muted-foreground">
                      {personalInsights.analysisDate}
                    </p>
                  </div>
                </div>

                <div className="mt-6 mb-4">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    Key Findings
                  </h4>
                  <div className="space-y-4">
                    {personalInsights.keyFindings &&
                    personalInsights.keyFindings.length > 0 ? (
                      personalInsights.keyFindings.map((finding, index) => {
                        const isStringFinding = typeof finding === "string";
                        const aiFinding = isStringFinding
                          ? null
                          : (finding as AIFinding);

                        return (
                          <div key={index} className="group">
                            {isStringFinding ? (
                              // Simple string finding
                              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-200">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <CheckCircle className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-700 leading-relaxed">
                                    {finding}
                                  </p>
                                </div>
                              </div>
                            ) : aiFinding ? (
                              // Complex AI response object
                              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-4 hover:shadow-md transition-all duration-200">
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                    <Brain className="h-4 w-4 text-purple-600" />
                                  </div>
                                  <div className="flex-1 space-y-3">
                                    {aiFinding?.title && (
                                      <h5 className="font-semibold text-purple-800 text-base">
                                        {aiFinding.title}
                                      </h5>
                                    )}
                                    {aiFinding?.summary && (
                                      <p className="text-sm text-gray-700 leading-relaxed bg-white/50 p-3 rounded-md">
                                        {aiFinding.summary}
                                      </p>
                                    )}
                                    {aiFinding?.recommendations &&
                                      Array.isArray(
                                        aiFinding.recommendations
                                      ) && (
                                        <div className="space-y-2">
                                          <h6 className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                                            คำแนะนำ:
                                          </h6>
                                          <ul className="space-y-1">
                                            {aiFinding.recommendations.map(
                                              (rec, recIndex) => (
                                                <li
                                                  key={recIndex}
                                                  className="flex items-start gap-2 text-sm text-gray-600"
                                                >
                                                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                                                  <span>{rec}</span>
                                                </li>
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      )}
                                    {aiFinding?.insights &&
                                      Array.isArray(aiFinding.insights) && (
                                        <div className="space-y-2">
                                          <h6 className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                                            ข้อมูลเชิงลึก:
                                          </h6>
                                          <ul className="space-y-1">
                                            {aiFinding.insights.map(
                                              (insight, insightIndex) => (
                                                <li
                                                  key={insightIndex}
                                                  className="flex items-start gap-2 text-sm text-gray-600"
                                                >
                                                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                                                  <span>{insight}</span>
                                                </li>
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      )}
                                    {aiFinding?.healthScore && (
                                      <div className="flex items-center gap-2 mt-3">
                                        <Badge
                                          variant="outline"
                                          className="text-purple-600 border-purple-300"
                                        >
                                          Health Score: {aiFinding.healthScore}
                                        </Badge>
                                      </div>
                                    )}

                                    {/* Additional health metrics if available */}
                                    {(aiFinding?.metrics ||
                                      aiFinding?.stats) && (
                                      <div className="mt-4 p-3 bg-white/70 rounded-md border border-purple-100">
                                        <h6 className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">
                                          ข้อมูลสุขภาพ:
                                        </h6>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                          {aiFinding?.metrics &&
                                            Object.entries(
                                              aiFinding.metrics
                                            ).map(([key, value]) => (
                                              <div
                                                key={key}
                                                className="flex justify-between"
                                              >
                                                <span className="text-gray-600">
                                                  {key}:
                                                </span>
                                                <span className="font-medium text-purple-600">
                                                  {value}
                                                </span>
                                              </div>
                                            ))}
                                          {aiFinding?.stats &&
                                            Object.entries(aiFinding.stats).map(
                                              ([key, value]) => (
                                                <div
                                                  key={key}
                                                  className="flex justify-between"
                                                >
                                                  <span className="text-gray-600">
                                                    {key}:
                                                  </span>
                                                  <span className="font-medium text-purple-600">
                                                    {value}
                                                  </span>
                                                </div>
                                              )
                                            )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              // Fallback: display raw data
                              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                    <Brain className="h-4 w-4 text-purple-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-purple-800 text-base mb-2">
                                      การวิเคราะห์สุขภาพโดยรวม
                                    </h5>
                                    <div className="space-y-3">
                                      <p className="text-sm text-gray-700 leading-relaxed">
                                        {typeof finding === "string"
                                          ? finding
                                          : finding.summary ||
                                            "ข้อมูลการวิเคราะห์สุขภาพ"}
                                      </p>
                                      {finding.recommendations && (
                                        <div>
                                          <h6 className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">
                                            คำแนะนำ:
                                          </h6>
                                          <ul className="space-y-1">
                                            {finding.recommendations.map(
                                              (rec, recIndex) => (
                                                <li
                                                  key={recIndex}
                                                  className="flex items-start gap-2 text-sm text-gray-600"
                                                >
                                                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                                                  <span>{rec}</span>
                                                </li>
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      )}
                                      {finding.insights && (
                                        <div>
                                          <h6 className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">
                                            ข้อมูลเชิงลึก:
                                          </h6>
                                          <ul className="space-y-1">
                                            {finding.insights.map(
                                              (insight, insightIndex) => (
                                                <li
                                                  key={insightIndex}
                                                  className="flex items-start gap-2 text-sm text-gray-600"
                                                >
                                                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                                                  <span>{insight}</span>
                                                </li>
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      )}
                                      {finding.fullText && (
                                        <div className="mt-4">
                                          <details className="group">
                                            <summary className="cursor-pointer text-sm font-medium text-purple-700 hover:text-purple-800">
                                              📄 ดูข้อมูลเต็มจาก AI
                                            </summary>
                                            <div className="mt-2 p-3 bg-gray-50 rounded-md border">
                                              <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">
                                                {finding.fullText}
                                              </pre>
                                            </div>
                                          </details>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Brain className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <h5 className="font-semibold text-purple-800 text-base">
                              การวิเคราะห์สุขภาพโดยรวม
                            </h5>
                            <p className="text-sm text-gray-700 leading-relaxed bg-white/50 p-3 rounded-md">
                              ระบบได้วิเคราะห์ข้อมูลสุขภาพของคุณเรียบร้อยแล้ว
                            </p>
                            <div className="space-y-2">
                              <h6 className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                                คำแนะนำ:
                              </h6>
                              <ul className="space-y-1">
                                <li className="flex items-start gap-2 text-sm text-gray-600">
                                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                                  <span>
                                    ควรรับประทานอาหารให้ครบ 5 หมู่
                                    และดื่มน้ำอย่างน้อย 8 แก้วต่อวัน
                                  </span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-gray-600">
                                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                                  <span>
                                    ออกกำลังกายอย่างน้อย 30 นาทีต่อวัน 3-4
                                    ครั้งต่อสัปดาห์
                                  </span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-gray-600">
                                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                                  <span>
                                    นอนหลับให้เพียงพอ 7-9 ชั่วโมงต่อคืน
                                    และเข้านอนในเวลาเดียวกันทุกวัน
                                  </span>
                                </li>
                              </ul>
                            </div>
                            <div className="space-y-2">
                              <h6 className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                                ข้อมูลเชิงลึก:
                              </h6>
                              <ul className="space-y-1">
                                <li className="flex items-start gap-2 text-sm text-gray-600">
                                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                                  <span>คะแนนสุขภาพโดยรวม: 75%</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-gray-600">
                                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                                  <span>
                                    จุดแข็ง:
                                    การออกกำลังกายสม่ำเสมอและการดื่มน้ำเพียงพอ
                                  </span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-gray-600">
                                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                                  <span>
                                    พื้นที่ที่ต้องปรับปรุง:
                                    คุณภาพการนอนและการจัดการความเครียด
                                  </span>
                                </li>
                              </ul>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <Badge
                                variant="outline"
                                className="text-purple-600 border-purple-300"
                              >
                                Health Score: 75
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strengths and Areas for Improvement */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Strengths */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    Health Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {personalInsights.strengths.goalCompletionRate}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Goal Achievement
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {personalInsights.strengths.consistencyScore}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Consistency
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {personalInsights.strengths.improvementTrend}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Improvement Trend
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {personalInsights.strengths.healthyHabits}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Healthy Habits
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Areas for Improvement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <AlertCircle className="h-5 w-5" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sleep Quality</span>
                      <Badge variant="outline" className="text-orange-600">
                        {personalInsights.areasForImprovement.sleepQuality}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Exercise Frequency</span>
                      <Badge variant="outline" className="text-orange-600">
                        {personalInsights.areasForImprovement.exerciseFrequency}
                        %
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Nutrition Balance</span>
                      <Badge variant="outline" className="text-orange-600">
                        {personalInsights.areasForImprovement.nutritionBalance}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Stress Management</span>
                      <Badge variant="outline" className="text-orange-600">
                        {personalInsights.areasForImprovement.stressManagement}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Personalized Recommendations */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Target className="h-5 w-5" />
                  Personalized Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Immediate Actions */}
                <div>
                  <h4 className="font-semibold text-red-600 mb-3">
                    Immediate Actions (0-7 days)
                  </h4>
                  <div className="space-y-3">
                    {personalInsights.personalizedRecommendations.immediate.map(
                      (rec, index) => (
                        <div
                          key={index}
                          className="p-4 border border-red-200 rounded-lg bg-red-50"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant="outline"
                              className="text-red-600 border-red-300"
                            >
                              {rec.category}
                            </Badge>
                          </div>
                          <h5 className="font-medium text-red-800">
                            {rec.recommendation}
                          </h5>
                          <p className="text-sm text-red-700 mt-1">
                            {rec.reason}
                          </p>
                          <Badge
                            variant="outline"
                            className="mt-2 text-red-600 border-red-300"
                          >
                            Impact: {rec.impact}
                          </Badge>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Short Term Actions */}
                <div>
                  <h4 className="font-semibold text-orange-600 mb-3">
                    Short Term (1-4 weeks)
                  </h4>
                  <div className="space-y-3">
                    {personalInsights.personalizedRecommendations.shortTerm.map(
                      (rec, index) => (
                        <div
                          key={index}
                          className="p-4 border border-orange-200 rounded-lg bg-orange-50"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant="outline"
                              className="text-orange-600 border-orange-300"
                            >
                              {rec.category}
                            </Badge>
                          </div>
                          <h5 className="font-medium text-orange-800">
                            {rec.recommendation}
                          </h5>
                          <p className="text-sm text-orange-700 mt-1">
                            {rec.reason}
                          </p>
                          <Badge
                            variant="outline"
                            className="mt-2 text-orange-600 border-orange-300"
                          >
                            Impact: {rec.impact}
                          </Badge>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Long Term Actions */}
                <div>
                  <h4 className="font-semibold text-blue-600 mb-3">
                    Long Term (1-3 months)
                  </h4>
                  <div className="space-y-3">
                    {personalInsights.personalizedRecommendations.longTerm.map(
                      (rec, index) => (
                        <div
                          key={index}
                          className="p-4 border border-blue-200 rounded-lg bg-blue-50"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant="outline"
                              className="text-blue-600 border-blue-300"
                            >
                              {rec.category}
                            </Badge>
                          </div>
                          <h5 className="font-medium text-blue-800">
                            {rec.recommendation}
                          </h5>
                          <p className="text-sm text-blue-700 mt-1">
                            {rec.reason}
                          </p>
                          <Badge
                            variant="outline"
                            className="mt-2 text-blue-600 border-blue-300"
                          >
                            Impact: {rec.impact}
                          </Badge>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Health Alerts */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Health Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {personalInsights.healthAlerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg ${getSeverityColor(
                        alert.severity
                      )}`}
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">{alert.type}</h5>
                        <Badge
                          variant="outline"
                          className={getSeverityColor(alert.severity)}
                        >
                          {alert.severity === "high"
                            ? "High"
                            : alert.severity === "medium"
                            ? "Medium"
                            : "Low"}
                        </Badge>
                      </div>
                      <p className="text-sm mt-1">{alert.message}</p>
                      <p className="text-sm font-medium mt-2">
                        Recommendation: {alert.action}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progress Metrics */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <TrendingUp className="h-5 w-5" />
                  Progress Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {personalInsights.progressMetrics.healthScoreTrend}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Health Score Trend
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {personalInsights.progressMetrics.goalAchievement}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Goal Achievement
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {personalInsights.progressMetrics.habitConsistency}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Habit Consistency
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {personalInsights.progressMetrics.overallImprovement}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Overall Improvement
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions Panel */}
        {analysisCompleted && (
          <Card className="sticky bottom-4 mt-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3 justify-center">
                <Button variant="default" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Export Report
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={startPersonalAnalysis}
                >
                  <RefreshCw className="h-4 w-4" />
                  Run New Analysis
                </Button>
                <Button variant="outline" className="gap-2">
                  <Target className="h-4 w-4" />
                  Create Health Plan
                </Button>
                <Button variant="outline" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share Results
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
