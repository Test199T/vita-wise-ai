import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, Calendar, TrendingUp, CheckCircle, Clock, Pencil, Trash2, Check, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiService, HealthGoals as HealthGoalsType } from "@/services/api";

interface HealthGoal {
  goal_id: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  start_date: string;
  end_date: string;
  status: string;
  details?: {
    focus_area?: string;
    training_days?: number;
    main_exercises?: string;
    target_pace?: string;
    frequency_per_week?: number;
    notes?: string;
    // water
    container_ml?: number;
    reminders_per_day?: number;
    start_time?: string;
    end_time?: string;
    // general exercise
    main_activity?: string;
    sessions_per_week?: number;
    session_duration_min?: number;
    intensity_level?: string;
    // stress
    technique?: string;
    minutes_per_day?: number;
    reminder_time?: string;
    // new reminder system
    reminder_frequency?: 'daily' | 'weekly' | 'monthly' | 'custom';
    reminder_times?: string[]; // เวลาแจ้งเตือน เช่น ['09:00', '18:00']
    reminder_days?: number[]; // วันในสัปดาห์ 0=อาทิตย์, 1=จันทร์, ...
    reminder_type?: 'push' | 'email' | 'sms';
    reminder_enabled?: boolean;
  };
}

interface GoalHistoryItem {
  id: string;
  goal_id: string;
  goal_type: string;
  action: 'created' | 'updated' | 'completed' | 'deleted';
  timestamp: string; // ISO
  details?: string;
}

export default function HealthGoals() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [history, setHistory] = useState<GoalHistoryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'history'>("all");
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<HealthGoal | null>(null);
  const [newProgress, setNewProgress] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [goalToComplete, setGoalToComplete] = useState<HealthGoal | null>(null);

  const [formData, setFormData] = useState({
    goal_type: "",
    target_value: "",
    current_value: "",
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
    details_focus_area: "",
    details_training_days: "",
    details_main_exercises: "",
    details_target_pace: "",
    details_frequency_per_week: "",
    details_notes: "",
    // water
    details_container_ml: "",
    details_reminders_per_day: "",
    details_start_time: "",
    details_end_time: "",
    // general exercise
    details_main_activity: "",
    details_sessions_per_week: "",
    details_session_duration_min: "",
    details_intensity_level: "",
    // stress
    details_technique: "",
    details_minutes_per_day: "",
    details_reminder_time: "",
    // new reminder system
    reminder_frequency: "daily",
    reminder_times: ["09:00", "18:00"],
    reminder_days: [1, 2, 3, 4, 5], // จันทร์-ศุกร์
    reminder_type: "push",
    reminder_enabled: true
  });

  const goalTypes = [
    "ลดน้ำหนัก", "เพิ่มน้ำหนัก", "วิ่งระยะทาง", "ดื่มน้ำ", 
    "ออกกำลังกาย", "นอนหลับ", "ลดความเครียด", "เพิ่มกล้ามเนื้อ"
  ];

  // Goal Templates สำเร็จรูป
  const goalTemplates = [
    {
      id: "weight_loss_5kg_3months",
      title: "ลดน้ำหนัก 5 กก. ใน 3 เดือน",
      goal_type: "ลดน้ำหนัก",
      target_value: 5,
      duration_days: 90,
      description: "เป้าหมายลดน้ำหนักที่สมเหตุสมผลและปลอดภัย",
      milestones: [
        { title: "ลด 1 กก.", target_value: 1, deadline_days: 18 },
        { title: "ลด 3 กก.", target_value: 3, deadline_days: 54 },
        { title: "ลด 5 กก.", target_value: 5, deadline_days: 90 }
      ]
    },
    {
      id: "run_5k_2months",
      title: "วิ่ง 5K ใน 2 เดือน",
      goal_type: "วิ่งระยะทาง",
      target_value: 5,
      duration_days: 60,
      description: "เป้าหมายวิ่งระยะทางสำหรับผู้เริ่มต้น",
      milestones: [
        { title: "วิ่ง 1K", target_value: 1, deadline_days: 15 },
        { title: "วิ่ง 3K", target_value: 3, deadline_days: 30 },
        { title: "วิ่ง 5K", target_value: 5, deadline_days: 60 }
      ]
    },
    {
      id: "drink_water_2l_daily",
      title: "ดื่มน้ำ 2 ลิตร/วัน",
      goal_type: "ดื่มน้ำ",
      target_value: 2,
      duration_days: 30,
      description: "เป้าหมายการดื่มน้ำเพื่อสุขภาพที่ดี",
      milestones: [
        { title: "ดื่มน้ำ 1.5L/วัน", target_value: 1.5, deadline_days: 7 },
        { title: "ดื่มน้ำ 2L/วัน", target_value: 2, deadline_days: 30 }
      ]
    },
    {
      id: "exercise_30min_daily",
      title: "ออกกำลังกาย 30 นาที/วัน",
      goal_type: "ออกกำลังกาย",
      target_value: 30,
      duration_days: 30,
      description: "เป้าหมายการออกกำลังกายประจำวัน",
      milestones: [
        { title: "ออกกำลังกาย 15 นาที/วัน", target_value: 15, deadline_days: 7 },
        { title: "ออกกำลังกาย 30 นาที/วัน", target_value: 30, deadline_days: 30 }
      ]
    },
    {
      id: "sleep_8hours_daily",
      title: "นอนหลับ 8 ชั่วโมง/วัน",
      goal_type: "นอนหลับ",
      target_value: 8,
      duration_days: 30,
      description: "เป้าหมายการนอนหลับที่เพียงพอ",
      milestones: [
        { title: "นอนหลับ 7 ชั่วโมง/วัน", target_value: 7, deadline_days: 7 },
        { title: "นอนหลับ 8 ชั่วโมง/วัน", target_value: 8, deadline_days: 30 }
      ]
    }
  ];

  // ดึงข้อมูล health goals จาก API
  const loadHealthGoals = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Loading health goals from API...');
      
      // ล้างข้อมูลเก่าก่อนโหลดข้อมูลใหม่
      setGoals([]);
      setHistory([]);
      
      const apiResponse = await apiService.getHealthGoals();
      
      console.log('🔍 Raw API response:', apiResponse);
      console.log('🔍 API response type:', typeof apiResponse);
      console.log('🔍 Is array?', Array.isArray(apiResponse));
      console.log('🔍 Full API response structure:', JSON.stringify(apiResponse, null, 2));
      
      // Debug response structure
      if (apiResponse && typeof apiResponse === 'object') {
        const responseObj = apiResponse as Record<string, any>;
        console.log('🔍 Response keys:', Object.keys(responseObj));
        if (responseObj.data) {
          console.log('🔍 Data keys:', Object.keys(responseObj.data));
          if (responseObj.data.goals) {
            console.log('🔍 Goals array length:', responseObj.data.goals.length);
            console.log('🔍 First goal:', responseObj.data.goals[0]);
          }
        }
      }
      
      // ตรวจสอบและแปลงข้อมูลให้เป็น array
      let apiGoals: any[] = [];
      
      if (Array.isArray(apiResponse)) {
        // ถ้าเป็น array อยู่แล้ว
        apiGoals = apiResponse;
      } else if (apiResponse && typeof apiResponse === 'object') {
        // ถ้าเป็น object ให้ตรวจสอบว่ามี property ที่เป็น array หรือไม่
        const responseObj = apiResponse as Record<string, any>;
        
        // ตรวจสอบ structure ที่ถูกต้อง: response.data.goals
        if (responseObj.data && responseObj.data.goals && Array.isArray(responseObj.data.goals)) {
          apiGoals = responseObj.data.goals;
          console.log('✅ Found goals in response.data.goals:', apiGoals.length);
          console.log('🔍 Goals structure:', apiGoals[0]);
        } else if (responseObj.data && Array.isArray(responseObj.data)) {
          apiGoals = responseObj.data;
          console.log('✅ Found goals in response.data:', apiGoals.length);
        } else if (responseObj.goals && Array.isArray(responseObj.goals)) {
          apiGoals = responseObj.goals;
          console.log('✅ Found goals in response.goals:', apiGoals.length);
        } else if (responseObj.items && Array.isArray(responseObj.items)) {
          apiGoals = responseObj.items;
          console.log('✅ Found goals in response.items:', apiGoals.length);
        } else {
          // ถ้าเป็น object เดียว ให้แปลงเป็น array
          apiGoals = [apiResponse];
          console.log('⚠️ Single object converted to array - this might be wrong!');
          console.log('🔍 Response object structure:', responseObj);
        }
      } else {
        // ถ้าไม่ใช่ array หรือ object ให้เป็น array ว่าง
        apiGoals = [];
        console.log('⚠️ Empty array - no valid data found');
      }
      
      console.log('🔍 Processed apiGoals:', apiGoals);
      console.log('🔍 apiGoals length:', apiGoals.length);
      console.log('🔍 First goal sample:', apiGoals[0]);
      
      // แปลงข้อมูลจาก API format เป็น local format
      const convertedGoals: HealthGoal[] = apiGoals.map((apiGoal, index) => {
        console.log('🔍 Processing API goal:', apiGoal);
        
        // หา goal_id จากหลาย field ที่เป็นไปได้ (ใช้ ID จริงจากฐานข้อมูล)
        const goalId = (apiGoal as any).id?.toString() || 
                      (apiGoal as any)._id?.toString() || 
                      (apiGoal as any).goal_id?.toString();
        
        // ถ้าไม่มี ID จริง ให้ข้าม goal นี้
        if (!goalId) {
          console.warn('⚠️ Skipping goal without valid ID:', apiGoal);
          return null;
        }
        
        // หา title จากหลาย field ที่เป็นไปได้
        const title = apiGoal.title || 
                     apiGoal.goal_type || 
                     (apiGoal as any).name || 
                     'เป้าหมายสุขภาพ';
        
        // แปลง goal_type ให้เป็นภาษาไทย (ใช้ title จาก API เป็นหลัก)
        const thaiGoalType = apiGoal.title || // ใช้ title จาก API ก่อน
                            (apiGoal.goal_type === 'weight_loss' ? 'ลดน้ำหนัก' :
                            apiGoal.goal_type === 'weight_gain' ? 'เพิ่มน้ำหนัก' :
                            apiGoal.goal_type === 'muscle_gain' ? 'เพิ่มกล้ามเนื้อ' :
                            apiGoal.goal_type === 'endurance' ? 'วิ่งระยะทาง' :
                            apiGoal.goal_type === 'stress_reduction' ? 'ลดความเครียด' :
                            apiGoal.goal_type === 'sleep_improvement' ? 'นอนหลับ' :
                            apiGoal.goal_type === 'nutrition' ? 'ดื่มน้ำ' :
                            apiGoal.goal_type === 'flexibility' ? 'ยืดหยุ่น' :
                            'เป้าหมายสุขภาพ');
        
        const convertedGoal = {
          goal_id: goalId,
          goal_type: thaiGoalType,
          target_value: Number(apiGoal.target_value) || 0,
          current_value: Number(apiGoal.current_value) || 0,
          start_date: apiGoal.start_date || new Date().toISOString().split('T')[0],
          end_date: apiGoal.target_date || apiGoal.end_date || new Date().toISOString().split('T')[0],
          status: apiGoal.status || 'active',
          // เพิ่ม fields อื่นๆ ที่อาจจะมี
          details: (apiGoal as any).details || {}
        };
        
        console.log('🔍 API Goal Data:', {
          id: apiGoal.id,
          title: apiGoal.title,
          goal_type: apiGoal.goal_type,
          target_value: apiGoal.target_value,
          current_value: apiGoal.current_value,
          status: apiGoal.status
        });
        
        console.log('🔍 Converted Goal Data:', {
          goal_id: convertedGoal.goal_id,
          goal_type: convertedGoal.goal_type,
          target_value: convertedGoal.target_value,
          current_value: convertedGoal.current_value,
          status: convertedGoal.status
        });
        
        console.log('🔍 Goal ID validation:', {
          original_id: apiGoal.id,
          converted_id: convertedGoal.goal_id,
          is_numeric: !isNaN(Number(convertedGoal.goal_id))
        });
        
        console.log('✅ Converted goal:', convertedGoal);
        return convertedGoal;
      }).filter(goal => goal !== null) as HealthGoal[];

      setGoals(convertedGoals);
      console.log('✅ Health goals loaded from API:', convertedGoals);
      console.log('📊 Final converted goals summary:', convertedGoals.map(g => ({
        id: g.goal_id,
        type: g.goal_type,
        target: g.target_value,
        current: g.current_value,
        status: g.status
      })));
      
      // Debug: แสดงเป้าหมายตามสถานะ
      const activeGoals = convertedGoals.filter(g => g.status === 'active');
      const completedGoals = convertedGoals.filter(g => g.status === 'completed');
      console.log('🔍 Active goals:', activeGoals.length, activeGoals.map(g => ({ id: g.goal_id, type: g.goal_type, status: g.status })));
      console.log('🔍 Completed goals:', completedGoals.length, completedGoals.map(g => ({ id: g.goal_id, type: g.goal_type, status: g.status })));
      
      // ตรวจสอบ state หลังจาก setGoals
      setTimeout(() => {
        console.log('🔍 Goals state after setGoals:', goals);
      }, 100);
      
      toast({
        title: 'โหลดข้อมูลสำเร็จ',
        description: `พบเป้าหมาย ${convertedGoals.length} รายการจากฐานข้อมูล`,
        variant: 'default'
      });
    } catch (error) {
      console.error('❌ Error loading health goals:', error);
      toast({
        title: 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
        description: error instanceof Error ? error.message : 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // โหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    loadHealthGoals();
  }, []);

  // ฟังก์ชันสำหรับใช้ Template
  const useTemplate = (template: any) => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + template.duration_days);

    setFormData({
      goal_type: template.goal_type,
      target_value: String(template.target_value),
      current_value: "0",
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      details_focus_area: "",
      details_training_days: "",
      details_main_exercises: "",
      details_target_pace: "",
      details_frequency_per_week: "",
      details_notes: template.description,
      details_container_ml: "",
      details_reminders_per_day: "",
      details_start_time: "",
      details_end_time: "",
      details_main_activity: "",
      details_sessions_per_week: "",
      details_session_duration_min: "",
      details_intensity_level: "",
      details_technique: "",
      details_minutes_per_day: "",
      details_reminder_time: "",
      reminder_frequency: "daily",
      reminder_times: ["09:00", "18:00"],
      reminder_days: [1, 2, 3, 4, 5],
      reminder_type: "push",
      reminder_enabled: true
    });

    setShowForm(true);
    toast({
      title: 'ใช้ Template สำเร็จ',
      description: `โหลด Template "${template.title}" แล้ว`,
      variant: 'default'
    });
  };

  // ฟังก์ชันสำหรับการเรียก API เพื่อสร้าง health goal
  const createHealthGoalViaAPI = async (goalData?: Partial<HealthGoalsType>) => {
    setIsApiLoading(true);
    try {
      // ใช้ข้อมูลจาก form หรือข้อมูลที่ส่งมา
      const healthGoalData: HealthGoalsType = goalData || {
        goal_type: "weight_loss",
        title: "ลดน้ำหนัก 5 กิโลกรัม",
        description: "ลดน้ำหนักเพื่อสุขภาพที่ดีขึ้น",
        target_value: 5,
        current_value: 0,
        unit: "kg",
        start_date: "2024-01-01",
        target_date: "2024-06-01",
        priority: "medium"
      };

      console.log('🎯 ส่งข้อมูลไปยัง API:', healthGoalData);
      
      const result = await apiService.createHealthGoal(healthGoalData);
      
      console.log('✅ API Response:', result);
      toast({ 
        title: 'สร้าง Health Goal สำเร็จ!', 
        description: `สร้างเป้าหมาย "${result.title}" ผ่าน API แล้ว`,
        variant: 'default'
      });

      // โหลดข้อมูลใหม่จาก API
      await loadHealthGoals();

    } catch (error) {
      console.error('❌ Error calling API:', error);
      toast({ 
        title: 'เกิดข้อผิดพลาดในการเรียก API', 
        description: error instanceof Error ? error.message : 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        variant: 'destructive'
      });
    } finally {
      setIsApiLoading(false);
    }
  };

  // ฟังก์ชันสำหรับอัปเดต health goal
  const updateHealthGoalViaAPI = async (goalId: string, updateData: Partial<HealthGoalsType>, skipReload: boolean = false) => {
    setIsApiLoading(true);
    try {
      console.log('✏️ อัปเดต health goal:', { goalId, updateData });
      
      // ถ้ามีการอัปเดต current_value หรือ target_value ให้คำนวณชื่อรายการใหม่
      if (updateData.current_value !== undefined || updateData.target_value !== undefined) {
        const currentGoal = goals.find(g => g.goal_id === goalId);
        if (currentGoal) {
          const newCurrentValue = updateData.current_value !== undefined ? updateData.current_value : currentGoal.current_value;
          const newTargetValue = updateData.target_value !== undefined ? updateData.target_value : currentGoal.target_value;
          
          // สร้างชื่อรายการใหม่
          const newTitle = getGoalDisplayTitle({
            ...currentGoal,
            current_value: newCurrentValue,
            target_value: newTargetValue
          });
          
          updateData.title = newTitle;
          console.log('🔄 Updated title:', newTitle);
        }
      }
      
      const result = await apiService.updateHealthGoal(goalId, updateData);
      
      console.log('✅ Update API Response:', result);
      
      // ตรวจสอบว่า API response มี success field หรือไม่
      if (result && typeof result === 'object' && 'success' in result) {
        if (result.success === false) {
          // API ปฏิเสธการอัปเดต
          const errorMessage = (result as any).message || 'ไม่สามารถอัปเดตเป้าหมายได้';
          console.error('❌ API rejected update:', errorMessage);
          throw new Error(String(errorMessage));
        }
      }
      
      // แสดง toast เฉพาะเมื่อไม่ใช่การทำสำเร็จ (เพราะจะแสดง toast แยก)
      if (!skipReload) {
        toast({ 
          title: 'อัปเดต Health Goal สำเร็จ!', 
          description: `อัปเดตเป้าหมาย "${result.title || 'เป้าหมาย'}" ผ่าน API แล้ว`,
          variant: 'default'
        });
      }

      // โหลดข้อมูลใหม่จาก API เฉพาะเมื่อไม่ skip
      if (!skipReload) {
        await loadHealthGoals();
      }
      
      // Return result เพื่อให้ฟังก์ชันที่เรียกใช้ได้ข้อมูลกลับไป
      return result;

    } catch (error) {
      console.error('❌ Error updating health goal:', error);
      toast({ 
        title: 'เกิดข้อผิดพลาดในการอัปเดต', 
        description: error instanceof Error ? error.message : 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        variant: 'destructive'
      });
      // Throw error เพื่อให้ฟังก์ชันที่เรียกใช้จัดการต่อได้
      throw error;
    } finally {
      setIsApiLoading(false);
    }
  };

  // ฟังก์ชันสำหรับลบ health goal
  const deleteHealthGoalViaAPI = async (goalId: string) => {
    setIsApiLoading(true);
    try {
      console.log('🗑️ ลบ health goal:', goalId);
      
      await apiService.deleteHealthGoal(goalId);
      
      console.log('✅ Delete API Response: Success');
      toast({ 
        title: 'ลบ Health Goal สำเร็จ!', 
        description: 'ลบเป้าหมายผ่าน API แล้ว',
        variant: 'default'
      });

      // โหลดข้อมูลใหม่จาก API
      await loadHealthGoals();

    } catch (error) {
      console.error('❌ Error deleting health goal:', error);
      toast({ 
        title: 'เกิดข้อผิดพลาดในการลบ', 
        description: error instanceof Error ? error.message : 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        variant: 'destructive'
      });
    } finally {
      setIsApiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const targetValue = parseFloat(formData.target_value as string) || 0;
    const currentValue = formData.current_value ? parseFloat(formData.current_value as string) : 0;
    
    // สร้างชื่อรายการที่ชัดเจน
    const getDisplayTitle = (goalType: string, current: number, target: number) => {
      switch (goalType) {
        case "ลดน้ำหนัก":
          if (current > target) {
            const weightToLose = current - target;
            return `ลดน้ำหนัก ${weightToLose} กิโล`;
          } else {
            return "ลดน้ำหนัก (ถึงเป้าหมายแล้ว)";
          }
        
        case "เพิ่มน้ำหนัก":
          if (current < target) {
            const weightToGain = target - current;
            return `เพิ่มน้ำหนัก ${weightToGain} กิโล`;
          } else {
            return "เพิ่มน้ำหนัก (ถึงเป้าหมายแล้ว)";
          }
        
        case "วิ่งระยะทาง":
          return `วิ่งระยะทาง ${target} กิโล`;
        
        case "ดื่มน้ำ":
          return `ดื่มน้ำ ${target} ลิตร`;
        
        case "ออกกำลังกาย":
          return `ออกกำลังกาย ${target} นาที`;
        
        case "นอนหลับ":
          return `นอนหลับ ${target} ชั่วโมง`;
        
        case "ลดความเครียด":
          return `ลดความเครียด ${target} นาที`;
        
        case "เพิ่มกล้ามเนื้อ":
          return `เพิ่มกล้ามเนื้อ ${target} กิโล`;
        
        default:
          return goalType;
      }
    };
    
    const displayTitle = getDisplayTitle(formData.goal_type, currentValue, targetValue);
    
    // แปลงข้อมูลจาก form เป็น API format
    const apiGoalData: Partial<HealthGoalsType> = {
      goal_type: formData.goal_type === "ลดน้ำหนัก" ? "weight_loss" : 
                 formData.goal_type === "เพิ่มน้ำหนัก" ? "weight_gain" :
                 formData.goal_type === "เพิ่มกล้ามเนื้อ" ? "muscle_gain" :
                 formData.goal_type === "วิ่งระยะทาง" ? "endurance" :
                 formData.goal_type === "ลดความเครียด" ? "stress_reduction" :
                 formData.goal_type === "นอนหลับ" ? "sleep_improvement" :
                 formData.goal_type === "ดื่มน้ำ" ? "nutrition" : "other",
      title: displayTitle, // ใช้ชื่อรายการที่ชัดเจน
      description: `เป้าหมาย${formData.goal_type}`,
      target_value: targetValue,
      current_value: currentValue,
      unit: "kg",
      start_date: formData.start_date,
      target_date: formData.end_date,
      status: 'active',
      priority: 'medium'
    };

    if (editingGoalId) {
      // Update existing goal via API
      await updateHealthGoalViaAPI(editingGoalId, apiGoalData);
    } else {
      // Create new goal via API
      await createHealthGoalViaAPI(apiGoalData);
    }

    setShowForm(false);
    setEditingGoalId(null);
    setFormData({
      goal_type: "",
      target_value: "",
      current_value: "",
      start_date: new Date().toISOString().split('T')[0],
      end_date: "",
      details_focus_area: "",
      details_training_days: "",
      details_main_exercises: "",
      details_target_pace: "",
      details_frequency_per_week: "",
      details_notes: "",
      details_container_ml: "",
      details_reminders_per_day: "",
      details_start_time: "",
      details_end_time: "",
      details_main_activity: "",
      details_sessions_per_week: "",
      details_session_duration_min: "",
      details_intensity_level: "",
      details_technique: "",
      details_minutes_per_day: "",
      details_reminder_time: "",
      reminder_frequency: "daily",
      reminder_times: ["09:00", "18:00"],
      reminder_days: [1, 2, 3, 4, 5],
      reminder_type: "push",
      reminder_enabled: true
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-blue-500 text-white">กำลังดำเนินการ</Badge>;
      case "completed":
        return <Badge className="bg-green-500 text-white">สำเร็จแล้ว</Badge>;
      case "paused":
        return <Badge className="bg-yellow-500 text-white">หยุดชั่วคราว</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">ไม่ทราบสถานะ</Badge>;
    }
  };

  const getProgressPercentage = (current: number, target: number, goalType: string) => {
    // ป้องกันการหารด้วย 0 และ NaN
    if (!target || target === 0) {
      return 0;
    }
    if (!current || current === 0) {
      return 0;
    }
    
    console.log('🔍 Calculating progress:', { current, target, goalType });
    
    let percentage: number;
    
    // คำนวณความคืบหน้าตามประเภทเป้าหมาย
    if (goalType === "ลดน้ำหนัก") {
      // สำหรับลดน้ำหนัก: เป้าหมายคือน้ำหนักที่ต้องการลด (กก.)
      // ตัวอย่าง: เป้าหมายลด 5kg, เริ่มต้น 70kg, ปัจจุบัน 65kg → ลดได้ 5kg = 100%
      // ตัวอย่าง: เป้าหมายลด 5kg, เริ่มต้น 70kg, ปัจจุบัน 67kg → ลดได้ 3kg = 60%
      
      // ตรวจสอบว่าค่าเป้าหมายและค่าปัจจุบันสมเหตุสมผลหรือไม่
      if (target > current) {
        // ถ้าเป้าหมายสูงกว่าค่าปัจจุบัน = ถึงเป้าหมายแล้ว (100%)
        // ตัวอย่าง: เป้าหมาย 100kg, ปัจจุบัน 90kg → ถึงเป้าหมายแล้ว
        percentage = 100;
        console.log('✅ Weight loss goal achieved (target > current):', { current, target, percentage });
      } else if (current <= target) {
        // ถ้าค่าปัจจุบันต่ำกว่าหรือเท่ากับเป้าหมาย = ถึงเป้าหมายแล้ว (100%)
        percentage = 100;
        console.log('✅ Weight loss goal achieved (current <= target):', { current, target, percentage });
      } else {
        // ถ้าค่าปัจจุบันสูงกว่าเป้าหมาย = ยังไม่ถึงเป้าหมาย
        // คำนวณจากน้ำหนักที่ลดได้จริง
        // สมมติว่าเป้าหมายคือน้ำหนักที่ต้องการลด (กก.)
        const startWeight = current + 10; // สมมติว่าเริ่มต้นที่ current + 10kg
        const totalWeightToLose = startWeight - target;
        const weightLost = startWeight - current;
        percentage = (weightLost / totalWeightToLose) * 100;
        
        console.log('📊 Weight loss calculation (current > target):', {
          startWeight,
          current,
          target,
          totalWeightToLose,
          weightLost,
          percentage: percentage.toFixed(1)
        });
        
        // จำกัดไม่ให้เกิน 100%
        if (percentage > 100) percentage = 100;
        if (percentage < 0) percentage = 0;
      }
    } else if (goalType === "เพิ่มน้ำหนัก") {
      // สำหรับเพิ่มน้ำหนัก: คำนวณจากน้ำหนักที่เพิ่มขึ้น
      if (current >= target) {
        // ถึงเป้าหมายแล้วหรือเกินเป้าหมาย
        percentage = 100;
      } else {
        // ยังไม่ถึงเป้าหมาย
        percentage = (current / target) * 100;
      }
    } else {
      // สำหรับเป้าหมายอื่นๆ (วิ่ง, ดื่มน้ำ, ออกกำลังกาย ฯลฯ)
      percentage = (current / target) * 100;
    }
    
    return Math.min(Math.max(percentage, 0), 100); // จำกัดระหว่าง 0-100%
  };

  // ฟังก์ชันคำนวณความคืบหน้าแบบ Advanced
  const calculateAdvancedProgress = (goal: HealthGoal) => {
    const baseProgress = getProgressPercentage(goal.current_value, goal.target_value, goal.goal_type);
    
    // คำนวณ Time Factor (ความคืบหน้าตามเวลา)
    const startDate = new Date(goal.start_date);
    const endDate = new Date(goal.end_date);
    const currentDate = new Date();
    
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const timeProgress = Math.min((elapsedDays / totalDays) * 100, 100);
    
    // คำนวณ Consistency Factor (ความสม่ำเสมอ)
    const consistencyFactor = calculateConsistencyFactor(goal);
    
    // คำนวณ Overall Progress
    const overallProgress = (baseProgress * 0.7) + (timeProgress * 0.2) + (consistencyFactor * 0.1);
    
    return {
      baseProgress,
      timeProgress,
      consistencyFactor,
      overallProgress: Math.min(Math.max(overallProgress, 0), 100)
    };
  };

  // ฟังก์ชันคำนวณ Consistency Factor
  const calculateConsistencyFactor = (goal: HealthGoal) => {
    // ตัวอย่างการคำนวณความสม่ำเสมอ
    // ในอนาคตสามารถเชื่อมต่อกับข้อมูลการอัปเดตจริงได้
    const daysSinceStart = Math.ceil((new Date().getTime() - new Date(goal.start_date).getTime()) / (1000 * 60 * 60 * 24));
    const expectedUpdates = Math.min(daysSinceStart, 30); // คาดหวังให้อัปเดตทุกวัน แต่ไม่เกิน 30 วัน
    const actualUpdates = Math.min(goal.current_value > 0 ? 1 : 0, expectedUpdates); // ตัวอย่างง่ายๆ
    
    return (actualUpdates / expectedUpdates) * 100;
  };

  const startEdit = (g: HealthGoal) => {
    setEditingGoalId(g.goal_id);
    setFormData({
      goal_type: g.goal_type,
      target_value: String(g.target_value),
      current_value: String(g.current_value ?? 0),
      start_date: g.start_date,
      end_date: g.end_date,
      details_focus_area: g.details?.focus_area || "",
      details_training_days: g.details?.training_days ? String(g.details.training_days) : "",
      details_main_exercises: g.details?.main_exercises || "",
      details_target_pace: g.details?.target_pace || "",
      details_frequency_per_week: g.details?.frequency_per_week ? String(g.details.frequency_per_week) : "",
      details_notes: g.details?.notes || "",
      details_container_ml: g.details?.container_ml ? String(g.details.container_ml) : "",
      details_reminders_per_day: g.details?.reminders_per_day ? String(g.details.reminders_per_day) : "",
      details_start_time: g.details?.start_time || "",
      details_end_time: g.details?.end_time || "",
      details_main_activity: g.details?.main_activity || "",
      details_sessions_per_week: g.details?.sessions_per_week ? String(g.details.sessions_per_week) : "",
      details_session_duration_min: g.details?.session_duration_min ? String(g.details.session_duration_min) : "",
      details_intensity_level: g.details?.intensity_level || "",
      details_technique: g.details?.technique || "",
      details_minutes_per_day: g.details?.minutes_per_day ? String(g.details.minutes_per_day) : "",
      details_reminder_time: g.details?.reminder_time || "",
      reminder_frequency: g.details?.reminder_frequency || "daily",
      reminder_times: g.details?.reminder_times || ["09:00", "18:00"],
      reminder_days: g.details?.reminder_days || [1, 2, 3, 4, 5],
      reminder_type: g.details?.reminder_type || "push",
      reminder_enabled: g.details?.reminder_enabled ?? true,
    });
    setShowForm(true);
  };

  const updateProgress = (goal: HealthGoal) => {
    setSelectedGoal(goal);
    setNewProgress(goal.current_value.toString());
    setShowProgressDialog(true);
  };

  const handleProgressUpdate = async () => {
    if (!selectedGoal || !newProgress) return;
    
    try {
      const progressValue = parseFloat(newProgress);
      if (isNaN(progressValue)) {
        toast({
          title: 'ข้อมูลไม่ถูกต้อง',
          description: 'กรุณาใส่ตัวเลขที่ถูกต้อง',
          variant: 'destructive'
        });
        return;
      }

      console.log('📈 Updating progress:', { goalId: selectedGoal.goal_id, newProgress: progressValue });
      
      // อัปเดตความคืบหน้าผ่าน API (จะคำนวณชื่อรายการใหม่อัตโนมัติ)
      await updateHealthGoalViaAPI(selectedGoal.goal_id, {
        current_value: progressValue
      });
      
      // เพิ่มประวัติการอัปเดต
      const newHist: GoalHistoryItem[] = [{ 
        id: crypto.randomUUID(), 
        goal_id: selectedGoal.goal_id, 
        goal_type: selectedGoal.goal_type, 
        action: 'updated', 
        timestamp: new Date().toISOString(), 
        details: `อัปเดตความคืบหน้า: ${progressValue}/${selectedGoal.target_value} - ${getGoalDisplayTitle(selectedGoal)}` 
      }, ...history];
      setHistory(newHist);
      
      // รีเฟรชข้อมูลจาก API
      await loadHealthGoals();
      
      setShowProgressDialog(false);
      setSelectedGoal(null);
      setNewProgress('');
      
      toast({
        title: 'อัปเดตความคืบหน้าสำเร็จ!',
        description: `ความคืบหน้า: ${progressValue}/${selectedGoal.target_value} - ${getGoalDisplayTitle(selectedGoal)}`,
        variant: 'default'
      });
      
    } catch (error) {
      console.error('❌ Error updating progress:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถอัปเดตความคืบหน้าได้',
        variant: 'destructive'
      });
    }
  };

  const markCompleted = (goal: HealthGoal) => {
    // ตรวจสอบความคืบหน้า
    const progressPercentage = getProgressPercentage(goal.current_value, goal.target_value, goal.goal_type);
    
    console.log('🔍 Checking completion:', {
      goalId: goal.goal_id,
      current: goal.current_value,
      target: goal.target_value,
      goalType: goal.goal_type,
      percentage: progressPercentage
    });
    
    // ตรวจสอบว่าความคืบหน้าครบ 100% หรือไม่
    if (progressPercentage < 100) {
      // ถ้ายังไม่ครบ 100% ให้แสดงข้อความเตือน
      console.log('⚠️ Goal not 100% complete, showing warning message');
      console.log('🔍 Progress details:', {
        current: goal.current_value,
        target: goal.target_value,
        goalType: goal.goal_type,
        percentage: progressPercentage
      });
      toast({
        title: 'ไม่สามารถทำสำเร็จได้',
        description: `กดสำเร็จไม่ได้ จำเป็นต้องอัปเดตข้อมูลให้ถึง 100% หรือค่าเป้าหมาย (${goal.target_value}) ก่อน`,
        variant: 'destructive'
      });
      return;
    }
    
    // ถ้าครบ 100% ให้แสดง dialog ยืนยัน
    console.log('✅ Goal is 100% complete, showing confirmation dialog');
    setGoalToComplete(goal);
    setShowConfirmDialog(true);
  };

  const handleCompleteGoal = async (goal: HealthGoal) => {
    try {
      console.log('🎯 Marking goal as completed:', goal.goal_id);
      console.log('🔍 Goal before update:', goal);
      
      const progressPercentage = getProgressPercentage(goal.current_value, goal.target_value, goal.goal_type);
      
      // อัปเดตเป้าหมายผ่าน API โดยส่งข้อมูลที่ถูกต้อง
      const updateData = {
        status: 'completed' as const,
        current_value: goal.target_value // ตั้งค่าให้เป็น target_value เพื่อให้ครบ 100%
      };
      
      console.log('📤 Sending update data:', updateData);
      
      const result = await updateHealthGoalViaAPI(goal.goal_id, updateData, true); // skip reload เพราะเราจะอัปเดต state โดยตรง
      
      console.log('✅ Goal updated via API successfully:', result);
      
      // อัปเดตสถานะใน state ทันทีเพื่อให้ UI อัปเดตทันที (เฉพาะเมื่อ API สำเร็จ)
      setGoals(prevGoals => {
        const updatedGoals = prevGoals.map(g => 
          g.goal_id === goal.goal_id 
            ? { ...g, status: 'completed', current_value: goal.target_value }
            : g
        );
        console.log('🔄 Updated goals state:', updatedGoals.map(g => ({ id: g.goal_id, status: g.status })));
        return updatedGoals;
      });
      
      // เพิ่มประวัติการทำสำเร็จ
      const newHist: GoalHistoryItem[] = [{ 
        id: crypto.randomUUID(), 
        goal_id: goal.goal_id, 
        goal_type: goal.goal_type, 
        action: 'completed', 
        timestamp: new Date().toISOString(), 
        details: `ทำสำเร็จ: ${getGoalDisplayTitle(goal)} (${goal.target_value}/${goal.target_value}) - 100%` 
      }, ...history];
      setHistory(newHist);
      
      console.log('🔍 History updated:', newHist.length);
      
      console.log('✅ Goal marked as completed successfully');
      
      toast({
        title: 'ทำสำเร็จแล้ว!',
        description: `เป้าหมาย "${getGoalDisplayTitle(goal)}" ถูกทำสำเร็จแล้ว (100%)`,
        variant: 'default'
      });
      
    } catch (error) {
      console.error('❌ Error marking goal as completed:', error);
      
      // แสดงข้อความ error ที่ชัดเจนขึ้น
      const errorMessage = error instanceof Error ? error.message : 'ไม่สามารถทำเครื่องหมายเป้าหมายเป็นสำเร็จได้';
      
      toast({
        title: 'ไม่สามารถทำสำเร็จได้',
        description: errorMessage,
        variant: 'destructive'
      });
      
      // ไม่ต้องอัปเดต state หรือประวัติเมื่อเกิด error
      console.log('⚠️ Goal completion failed, state not updated');
    }
  };

  const deleteGoal = async (goal: HealthGoal) => {
    try {
      await deleteHealthGoalViaAPI(goal.goal_id);
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const filteredGoals = useMemo(() => {
    console.log('🔍 Filtering goals:', { goals: goals.length, filter });
    console.log('🔍 All goals status:', goals.map(g => ({ id: g.goal_id, type: g.goal_type, status: g.status })));
    console.log('🔍 Goals status breakdown:', {
      active: goals.filter(g => g.status === 'active').length,
      completed: goals.filter(g => g.status === 'completed').length,
      paused: goals.filter(g => g.status === 'paused').length,
      cancelled: goals.filter(g => g.status === 'cancelled').length
    });
    
    if (filter === 'all') {
      // แสดงเฉพาะเป้าหมายที่ยังไม่สำเร็จ (ไม่แสดงในประวัติ)
      const activeGoals = goals.filter(g => g.status !== 'completed');
      console.log('🔍 Returning active goals for "all":', activeGoals.length, activeGoals.map(g => ({ id: g.goal_id, status: g.status })));
      return activeGoals;
    }
    
    const filtered = goals.filter(g => g.status === filter);
    console.log('🔍 Filtered goals for', filter, ':', filtered.length, filtered.map(g => ({ id: g.goal_id, type: g.goal_type, status: g.status })));
    return filtered;
  }, [goals, filter]);

  const getGoalIcon = (goalType: string) => {
    console.log('🎨 getGoalIcon called with:', goalType);
    let result;
    switch (goalType) {
      case "ลดน้ำหนัก": result = "bg-gradient-to-br from-blue-500 to-blue-600"; break;
      case "เพิ่มน้ำหนัก": result = "bg-gradient-to-br from-green-500 to-green-600"; break;
      case "เพิ่มกล้ามเนื้อ": result = "bg-gradient-to-br from-orange-500 to-orange-600"; break;
      case "วิ่งระยะทาง": result = "bg-gradient-to-br from-orange-500 to-orange-600"; break;
      case "ลดความเครียด": result = "bg-gradient-to-br from-orange-500 to-orange-600"; break;
      case "นอนหลับ": result = "bg-gradient-to-br from-purple-500 to-purple-600"; break;
      case "ดื่มน้ำ": result = "bg-gradient-to-br from-cyan-400 to-cyan-500"; break;
      default: result = "bg-gradient-to-br from-gray-500 to-slate-500"; break;
    }
    console.log('🎨 getGoalIcon result:', result);
    return result;
  };

  // ฟังก์ชันสำหรับสีการ์ดตามประเภทเป้าหมาย
  const getGoalCardStyle = (goalType: string) => {
    switch (goalType) {
      case "ลดน้ำหนัก": return "bg-gradient-to-br from-white via-blue-50/40 to-blue-50/20";
      case "เพิ่มน้ำหนัก": return "bg-gradient-to-br from-white via-green-50/40 to-green-50/20";
      case "เพิ่มกล้ามเนื้อ": return "bg-gradient-to-br from-white via-orange-50/40 to-orange-50/20";
      case "วิ่งระยะทาง": return "bg-gradient-to-br from-white via-orange-50/40 to-orange-50/20";
      case "ลดความเครียด": return "bg-gradient-to-br from-white via-orange-50/40 to-orange-50/20";
      case "นอนหลับ": return "bg-gradient-to-br from-white via-purple-50/40 to-purple-50/20";
      case "ดื่มน้ำ": return "bg-gradient-to-br from-white via-cyan-50/40 to-cyan-50/20";
      default: return "bg-gradient-to-br from-white via-gray-50/40 to-gray-50/20";
    }
  };

  // ฟังก์ชันสำหรับสี progress bar ตามประเภทเป้าหมาย
  const getGoalProgressStyle = (goalType: string) => {
    switch (goalType) {
      case "ลดน้ำหนัก": return "from-blue-500 to-blue-600";
      case "เพิ่มน้ำหนัก": return "from-green-500 to-green-600";
      case "เพิ่มกล้ามเนื้อ": return "from-orange-500 to-orange-600";
      case "วิ่งระยะทาง": return "from-orange-500 to-orange-600";
      case "ลดความเครียด": return "from-orange-500 to-orange-600";
      case "นอนหลับ": return "from-purple-500 to-purple-600";
      case "ดื่มน้ำ": return "from-cyan-400 to-cyan-500";
      default: return "from-gray-500 to-gray-600";
    }
  };


  // ฟังก์ชันสำหรับสร้างชื่อรายการที่ชัดเจน
  const getGoalDisplayTitle = (goal: HealthGoal) => {
    const { goal_type, current_value, target_value } = goal;
    
    switch (goal_type) {
      case "ลดน้ำหนัก":
        if (current_value > target_value) {
          const weightToLose = current_value - target_value;
          return `ลดน้ำหนัก ${weightToLose} กิโล`;
        } else {
          return "ลดน้ำหนัก (ถึงเป้าหมายแล้ว)";
        }
      
      case "เพิ่มน้ำหนัก":
        if (current_value < target_value) {
          const weightToGain = target_value - current_value;
          return `เพิ่มน้ำหนัก ${weightToGain} กิโล`;
        } else {
          return "เพิ่มน้ำหนัก (ถึงเป้าหมายแล้ว)";
        }
      
      case "วิ่งระยะทาง":
        return `วิ่งระยะทาง ${target_value} กิโล`;
      
      case "ดื่มน้ำ":
        return `ดื่มน้ำ ${target_value} ลิตร`;
      
      case "ออกกำลังกาย":
        return `ออกกำลังกาย ${target_value} นาที`;
      
      case "นอนหลับ":
        return `นอนหลับ ${target_value} ชั่วโมง`;
      
      case "ลดความเครียด":
        return `ลดความเครียด ${target_value} นาที`;
      
      case "เพิ่มกล้ามเนื้อ":
        return `เพิ่มกล้ามเนื้อ ${target_value} กิโล`;
      
      default:
        return goal_type;
    }
  };

  return (
    <MainLayout>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-primary to-secondary rounded-xl shadow-lg">
                <Target className="h-6 w-6 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                เป้าหมายของคุณ
              </h2>
            </div>
            <p className="text-muted-foreground ml-16">
              ติดตามความคืบหน้าและบรรลุเป้าหมายสุขภาพ
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={loadHealthGoals} 
              disabled={isLoading}
              variant="outline"
              className="gap-2 rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'กำลังโหลด...' : 'รีเฟรช'}
            </Button>
            <Button 
              onClick={() => setShowForm(!showForm)} 
              className="gap-2 rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              {editingGoalId ? 'แก้ไขเป้าหมาย' : 'เพิ่มเป้าหมายใหม่'}
            </Button>
          </div>
        </div>

        {/* Compact Goal Templates */}
        {!showForm && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-4 w-4" />
                เป้าหมายสำเร็จรูป
              </CardTitle>
              <CardDescription>
                เลือกเป้าหมายที่เหมาะสมกับคุณ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goalTemplates.map((template, index) => (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow" 
                    onClick={() => useTemplate(template)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground text-xs font-bold">{index + 1}</span>
                          </div>
                          <h3 className="font-semibold text-sm">{template.title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-primary font-medium">{template.duration_days} วัน</span>
                          <span className="text-muted-foreground">{template.milestones.length} Milestones</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {editingGoalId ? 'แก้ไขเป้าหมาย' : 'สร้างเป้าหมายใหม่'}
              </CardTitle>
              <CardDescription>
                {editingGoalId ? 'แก้ไขข้อมูลเป้าหมายของคุณ' : 'สร้างเป้าหมายสุขภาพใหม่เพื่อติดตามความคืบหน้า'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="goal_type">ประเภทเป้าหมาย</Label>
                    <Select value={formData.goal_type} onValueChange={(value) => setFormData({...formData, goal_type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภทเป้าหมาย" />
                      </SelectTrigger>
                      <SelectContent>
                        {goalTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target_value">
                      {formData.goal_type === "ลดน้ำหนัก" ? "น้ำหนักเป้าหมาย (กก.)" :
                       formData.goal_type === "เพิ่มน้ำหนัก" ? "น้ำหนักเป้าหมาย (กก.)" :
                       formData.goal_type === "วิ่งระยะทาง" ? "ระยะทางเป้าหมาย (กม.)" :
                       formData.goal_type === "ดื่มน้ำ" ? "ปริมาณน้ำเป้าหมาย (ลิตร)" :
                       formData.goal_type === "ออกกำลังกาย" ? "เวลาออกกำลังกายเป้าหมาย (นาที)" :
                       formData.goal_type === "นอนหลับ" ? "เวลานอนเป้าหมาย (ชั่วโมง)" :
                       formData.goal_type === "ลดความเครียด" ? "เวลาผ่อนคลายเป้าหมาย (นาที)" :
                       "ค่าเป้าหมาย"}
                    </Label>
                    <Input
                      id="target_value"
                      type="number"
                      step="0.1"
                      placeholder={
                        formData.goal_type === "ลดน้ำหนัก" ? "เช่น 65" :
                        formData.goal_type === "เพิ่มน้ำหนัก" ? "เช่น 70" :
                        formData.goal_type === "วิ่งระยะทาง" ? "เช่น 5" :
                        formData.goal_type === "ดื่มน้ำ" ? "เช่น 2" :
                        formData.goal_type === "ออกกำลังกาย" ? "เช่น 30" :
                        formData.goal_type === "นอนหลับ" ? "เช่น 8" :
                        formData.goal_type === "ลดความเครียด" ? "เช่น 15" :
                        "เช่น 100"
                      }
                      value={formData.target_value}
                      onChange={(e) => setFormData({...formData, target_value: e.target.value})}
                      required
                    />
                    {formData.goal_type === "ลดน้ำหนัก" && (
                      <p className="text-xs text-muted-foreground">
                        💡 ใส่น้ำหนักที่คุณต้องการให้เป็น (เช่น 65 = ต้องการน้ำหนัก 65 กิโลกรัม)
                      </p>
                    )}
                    {formData.goal_type === "เพิ่มน้ำหนัก" && (
                      <p className="text-xs text-muted-foreground">
                        💡 ใส่น้ำหนักที่คุณต้องการให้เป็น (เช่น 70 = ต้องการน้ำหนัก 70 กิโลกรัม)
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="current_value">
                      {formData.goal_type === "ลดน้ำหนัก" ? "น้ำหนักปัจจุบัน (กก.)" :
                       formData.goal_type === "เพิ่มน้ำหนัก" ? "น้ำหนักปัจจุบัน (กก.)" :
                       formData.goal_type === "วิ่งระยะทาง" ? "ระยะทางที่วิ่งได้แล้ว (กม.)" :
                       formData.goal_type === "ดื่มน้ำ" ? "ปริมาณน้ำที่ดื่มแล้ว (ลิตร)" :
                       formData.goal_type === "ออกกำลังกาย" ? "เวลาออกกำลังกายที่ทำแล้ว (นาที)" :
                       formData.goal_type === "นอนหลับ" ? "เวลานอนที่ได้แล้ว (ชั่วโมง)" :
                       formData.goal_type === "ลดความเครียด" ? "เวลาผ่อนคลายที่ทำแล้ว (นาที)" :
                       "ค่าปัจจุบัน"}
                    </Label>
                    <Input
                      id="current_value"
                      type="number"
                      placeholder={
                        formData.goal_type === "ลดน้ำหนัก" ? "เช่น 70 (น้ำหนักปัจจุบัน)" :
                        formData.goal_type === "เพิ่มน้ำหนัก" ? "เช่น 65 (น้ำหนักปัจจุบัน)" :
                        formData.goal_type === "วิ่งระยะทาง" ? "เช่น 2 (กิโลเมตรที่วิ่งได้)" :
                        formData.goal_type === "ดื่มน้ำ" ? "เช่น 1 (ลิตรที่ดื่มแล้ว)" :
                        formData.goal_type === "ออกกำลังกาย" ? "เช่น 15 (นาทีที่ออกกำลังกาย)" :
                        formData.goal_type === "นอนหลับ" ? "เช่น 6 (ชั่วโมงที่นอน)" :
                        formData.goal_type === "ลดความเครียด" ? "เช่น 5 (นาทีที่ผ่อนคลาย)" :
                        "ค่าปัจจุบันของเป้าหมาย"
                      }
                      value={formData.current_value}
                      onChange={(e) => setFormData({...formData, current_value: e.target.value})}
                    />
                    {formData.goal_type === "ลดน้ำหนัก" && (
                      <p className="text-xs text-muted-foreground">
                        💡 ใส่น้ำหนักปัจจุบันของคุณ (เช่น 70 = น้ำหนักปัจจุบัน 70 กิโลกรัม)
                      </p>
                    )}
                    {formData.goal_type === "เพิ่มน้ำหนัก" && (
                      <p className="text-xs text-muted-foreground">
                        💡 ใส่น้ำหนักปัจจุบันของคุณ (เช่น 65 = น้ำหนักปัจจุบัน 65 กิโลกรัม)
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start_date">วันที่เริ่ม</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">วันที่สิ้นสุด</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      required
                    />
                  </div>
                </div>


                {formData.goal_type === "เพิ่มกล้ามเนื้อ" && (
                  <div className="space-y-4 p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold">รายละเอียดเป้าหมายเพิ่มกล้ามเนื้อ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="details_focus_area">โฟกัสส่วนกล้ามเนื้อ</Label>
                        <Input id="details_focus_area" placeholder="เช่น อก/หลัง/ขา/ไหล่/แขน" value={formData.details_focus_area} onChange={(e) => setFormData({ ...formData, details_focus_area: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="details_training_days">จำนวนวันฝึก/สัปดาห์</Label>
                        <Input id="details_training_days" type="number" placeholder="เช่น 4" value={formData.details_training_days} onChange={(e) => setFormData({ ...formData, details_training_days: e.target.value })} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="details_main_exercises">ท่าหลักที่จะใช้</Label>
                        <Input id="details_main_exercises" placeholder="เช่น Bench Press, Squat, Deadlift" value={formData.details_main_exercises} onChange={(e) => setFormData({ ...formData, details_main_exercises: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="details_frequency_per_week">ความถี่ (ครั้ง/สัปดาห์)</Label>
                        <Input id="details_frequency_per_week" type="number" placeholder="เช่น 3" value={formData.details_frequency_per_week} onChange={(e) => setFormData({ ...formData, details_frequency_per_week: e.target.value })} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="details_notes">หมายเหตุ</Label>
                        <Textarea id="details_notes" placeholder="รายละเอียดเพิ่มเติม..." value={formData.details_notes} onChange={(e) => setFormData({ ...formData, details_notes: e.target.value })} />
                      </div>
                    </div>
                  </div>
                )}

                {formData.goal_type === "วิ่งระยะทาง" && (
                  <div className="space-y-4 p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold">รายละเอียดเป้าหมายวิ่ง</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="details_target_pace">เพซเป้าหมาย (นาที/กม.)</Label>
                        <Input id="details_target_pace" placeholder="เช่น 6:00" value={formData.details_target_pace} onChange={(e) => setFormData({ ...formData, details_target_pace: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="details_frequency_per_week_run">วิ่งกี่ครั้ง/สัปดาห์</Label>
                        <Input id="details_frequency_per_week_run" type="number" placeholder="เช่น 3" value={formData.details_frequency_per_week} onChange={(e) => setFormData({ ...formData, details_frequency_per_week: e.target.value })} />
                      </div>
                    </div>
                  </div>
                )}

                {formData.goal_type === "ออกกำลังกาย" && (
                  <div className="space-y-4 p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold">รายละเอียดเป้าหมายออกกำลังกาย</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="details_main_activity">กิจกรรมหลัก</Label>
                        <Input id="details_main_activity" placeholder="เช่น คาร์ดิโอ/เวทเทรนนิ่ง/HIIT/โยคะ" value={formData.details_main_activity} onChange={(e) => setFormData({ ...formData, details_main_activity: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="details_sessions_per_week">จำนวนครั้ง/สัปดาห์</Label>
                        <Input id="details_sessions_per_week" type="number" placeholder="เช่น 4" value={formData.details_sessions_per_week} onChange={(e) => setFormData({ ...formData, details_sessions_per_week: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="details_session_duration_min">ระยะเวลา/ครั้ง (นาที)</Label>
                        <Input id="details_session_duration_min" type="number" placeholder="เช่น 45" value={formData.details_session_duration_min} onChange={(e) => setFormData({ ...formData, details_session_duration_min: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="details_intensity_level">ความหนัก</Label>
                        <Select value={formData.details_intensity_level} onValueChange={(value) => setFormData({ ...formData, details_intensity_level: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกความหนัก" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ต่ำ">ต่ำ</SelectItem>
                            <SelectItem value="ปานกลาง">ปานกลาง</SelectItem>
                            <SelectItem value="สูง">สูง</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {formData.goal_type === "ดื่มน้ำ" && (
                  <div className="space-y-4 p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold">รายละเอียดเป้าหมายการดื่มน้ำ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="details_container_ml">ขนาดแก้ว/ขวด (มล.)</Label>
                        <Input id="details_container_ml" type="number" placeholder="เช่น 350" value={formData.details_container_ml} onChange={(e) => setFormData({ ...formData, details_container_ml: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="details_reminders_per_day">การเตือน/วัน (ครั้ง)</Label>
                        <Input id="details_reminders_per_day" type="number" placeholder="เช่น 6" value={formData.details_reminders_per_day} onChange={(e) => setFormData({ ...formData, details_reminders_per_day: e.target.value })} />
                      </div>
                    </div>
                  </div>
                )}

                {formData.goal_type === "ลดความเครียด" && (
                  <div className="space-y-4 p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold">รายละเอียดเป้าหมายลดความเครียด</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="details_technique">เทคนิคที่ใช้</Label>
                        <Input id="details_technique" placeholder="เช่น หายใจลึก/เมดิเทชัน/เดินสมาธิ" value={formData.details_technique} onChange={(e) => setFormData({ ...formData, details_technique: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="details_minutes_per_day">นาที/วัน</Label>
                        <Input id="details_minutes_per_day" type="number" placeholder="เช่น 10" value={formData.details_minutes_per_day} onChange={(e) => setFormData({ ...formData, details_minutes_per_day: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="details_reminder_time">เวลาเตือน</Label>
                        <Input id="details_reminder_time" type="time" value={formData.details_reminder_time} onChange={(e) => setFormData({ ...formData, details_reminder_time: e.target.value })} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="details_notes_stress">หมายเหตุ</Label>
                        <Textarea id="details_notes_stress" placeholder="เช่น ทำก่อนนอน หลังอาหารกลางวัน ฯลฯ" value={formData.details_notes} onChange={(e) => setFormData({ ...formData, details_notes: e.target.value })} />
                      </div>
                    </div>
                  </div>
                )}
                {formData.goal_type === "นอนหลับ" && (
                  <div className="space-y-4 p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold">รายละเอียดเป้าหมายนอนหลับ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="details_notes_sleep">หมายเหตุ/กลยุทธ์</Label>
                        <Textarea id="details_notes_sleep" placeholder="เช่น นอนก่อน 23:00, ปิดหน้าจอก่อนนอน 1 ชม." value={formData.details_notes} onChange={(e) => setFormData({ ...formData, details_notes: e.target.value })} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Compact Reminder Settings */}
                <div className="space-y-4 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold">การตั้งค่าการแจ้งเตือน</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reminder_frequency">ความถี่</Label>
                      <Select value={formData.reminder_frequency} onValueChange={(value) => setFormData({ ...formData, reminder_frequency: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">รายวัน</SelectItem>
                          <SelectItem value="weekly">รายสัปดาห์</SelectItem>
                          <SelectItem value="monthly">รายเดือน</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reminder_type">ประเภท</Label>
                      <Select value={formData.reminder_type} onValueChange={(value) => setFormData({ ...formData, reminder_type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="push">Push</SelectItem>
                          <SelectItem value="email">อีเมล</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="reminder_enabled"
                      checked={formData.reminder_enabled}
                      onChange={(e) => setFormData({ ...formData, reminder_enabled: e.target.checked })}
                    />
                    <Label htmlFor="reminder_enabled" className="text-sm">
                      เปิดใช้งานการแจ้งเตือน
                    </Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    {editingGoalId ? 'อัปเดตเป้าหมาย' : 'สร้างเป้าหมาย'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    ยกเลิก
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">เป้าหมายของคุณ</h2>
            <Tabs defaultValue={filter} onValueChange={(v) => setFilter(v as any)} className="w-full md:w-auto">
              <TabsList className="grid w-full md:w-auto grid-cols-4 md:inline-grid rounded-2xl bg-gradient-to-r from-primary-light/30 to-secondary-light/30 p-2 border-2 border-primary/20">
                <TabsTrigger value="all" className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:text-primary font-semibold transition-all duration-200">ทั้งหมด</TabsTrigger>
                <TabsTrigger value="active" className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:text-primary font-semibold transition-all duration-200">กำลังดำเนินการ</TabsTrigger>
                <TabsTrigger value="completed" className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:text-primary font-semibold transition-all duration-200">สำเร็จแล้ว</TabsTrigger>
                <TabsTrigger value="history" className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-md data-[state=active]:text-primary font-semibold transition-all duration-200">ประวัติ</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {filter !== 'history' ? (
            <>
            {isLoading ? (
              <Card className="border-0 rounded-xl bg-gradient-to-br from-card to-muted">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>กำลังโหลดข้อมูลเป้าหมาย...</span>
                  </div>
                </CardContent>
              </Card>
            ) : filteredGoals.length === 0 ? (
              <Card className="border-0 rounded-xl bg-gradient-to-br from-card to-muted">
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">ยังไม่มีเป้าหมายในฐานข้อมูล</p>
                    <p className="text-sm">คลิก "เพิ่มเป้าหมายใหม่" เพื่อสร้างเป้าหมายแรก</p>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-600">
                        💡 ข้อมูลจะถูกบันทึกลงฐานข้อมูลและแสดงผลที่นี่
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              (() => {
                console.log('🔍 Rendering goals:', filteredGoals);
                return filteredGoals.map((goal) => {
                  console.log('🔍 Rendering individual goal:', goal);
                  return (
            <Card key={goal.goal_id} className={`border-0 rounded-3xl ${getGoalCardStyle(goal.goal_type)} shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] backdrop-blur-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${getGoalIcon(goal.goal_type)}`}>
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-foreground">{getGoalDisplayTitle(goal)}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(goal.start_date).toLocaleDateString('th-TH')} - {new Date(goal.end_date).toLocaleDateString('th-TH')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {getStatusBadge(goal.status)}
                    <Button variant="outline" size="sm" className="gap-2 rounded-full border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-all duration-200 shadow-sm" onClick={() => startEdit(goal)}>
                      <Pencil className="h-4 w-4" /> แก้ไข
                    </Button>
                    {goal.status !== 'completed' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 rounded-full border-2 border-green-200 hover:border-green-300 hover:bg-green-50 text-green-600 hover:text-green-700 transition-all duration-200 shadow-sm"
                          onClick={() => updateProgress(goal)}
                        >
                          <TrendingUp className="h-4 w-4" /> อัปเดต
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="gap-2 rounded-full border-2 border-green-500 bg-green-500 hover:bg-green-600 text-white hover:text-white transition-all duration-200 shadow-md hover:shadow-lg"
                          onClick={() => markCompleted(goal)}
                        >
                          <Check className="h-4 w-4" /> 
                          {getProgressPercentage(goal.current_value, goal.target_value, goal.goal_type) >= 100 ? 'สำเร็จ' : 'สำเร็จ'}
                        </Button>
                      </>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 rounded-full border-2 border-red-300 hover:border-red-400 hover:bg-red-50 text-red-600 hover:text-red-700 transition-all duration-200 shadow-sm">
                          <Trash2 className="h-4 w-4" /> ลบ
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                          <AlertDialogDescription>
                            คุณต้องการลบเป้าหมาย "{goal.goal_type}" นี้หรือไม่? ข้อมูลจะถูกบันทึกไว้ในประวัติ
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteGoal(goal)}>ลบ</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                <div className="space-y-6 mt-8">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-gray-800">ความคืบหน้า</h4>
                    <span className="text-xl font-bold text-blue-600">{goal.current_value} / {goal.target_value}</span>
                  </div>
                  
                  {/* Basic Progress */}
                  <div className="relative">
                    <Progress 
                      value={getProgressPercentage(goal.current_value, goal.target_value, goal.goal_type)} 
                      className="h-3 rounded-full"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-r ${getGoalProgressStyle(goal.goal_type)} rounded-full opacity-20`}></div>
                  </div>
                  
                  {/* Compact Progress Analysis */}
                  {(() => {
                    const advancedProgress = calculateAdvancedProgress(goal);
                    return (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center p-2 bg-muted rounded-lg">
                            <div className="font-semibold text-foreground">ความคืบหน้า</div>
                            <div className="text-primary">{advancedProgress.baseProgress.toFixed(1)}%</div>
                          </div>
                          <div className="text-center p-2 bg-muted rounded-lg">
                            <div className="font-semibold text-foreground">เวลา</div>
                            <div className="text-orange-600">{advancedProgress.timeProgress.toFixed(1)}%</div>
                          </div>
                          <div className="text-center p-2 bg-muted rounded-lg">
                            <div className="font-semibold text-foreground">ความสม่ำเสมอ</div>
                            <div className="text-green-600">{advancedProgress.consistencyFactor.toFixed(1)}%</div>
                          </div>
                        </div>
                        
                        {/* Overall Progress */}
                        <div className="relative">
                          <div className="text-sm font-medium text-foreground mb-1">ความคืบหน้ารวม</div>
                          <Progress 
                            value={advancedProgress.overallProgress} 
                            className="h-2 rounded-full"
                          />
                          <div className="text-xs text-muted-foreground mt-1 text-center">
                            {advancedProgress.overallProgress.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-green-700 font-semibold text-sm">{getProgressPercentage(goal.current_value, goal.target_value, goal.goal_type).toFixed(1)}% สำเร็จ</span>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-700 font-medium text-sm">{goal.status === 'active' ? 'กำลังดำเนินการ' : goal.status === 'completed' ? 'สำเร็จแล้ว' : 'รอดำเนินการ'}</span>
                    </div>
                  </div>
                  
                  {goal.status === "active" && getProgressPercentage(goal.current_value, goal.target_value, goal.goal_type) < 100 && (
                    <div className="mt-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 text-orange-700">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs font-medium">ต้องอัปเดตความคืบหน้าให้ถึง {goal.target_value} ก่อนทำสำเร็จ</span>
                      </div>
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>
            );
                  });
                })()
            )}
            </>
          ) : (
            <Card className="border-0 rounded-xl bg-gradient-to-br from-card to-muted">
              <CardContent className="p-4">
                {history.length === 0 && goals.filter(g => g.status === 'completed').length === 0 ? (
                  <div className="text-sm text-muted-foreground">ยังไม่มีประวัติ</div>
                ) : (
                  <div className="space-y-4">
                    {/* แสดงเป้าหมายที่สำเร็จแล้ว */}
                    {goals.filter(g => g.status === 'completed').map((goal) => (
                      <div key={goal.goal_id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-green-500 text-white">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-green-800">{getGoalDisplayTitle(goal)}</p>
                            <p className="text-sm text-green-600">ทำสำเร็จ: {goal.current_value}/{goal.target_value}</p>
                            <p className="text-xs text-green-500">
                              {new Date(goal.start_date).toLocaleDateString('th-TH')} - {new Date(goal.end_date).toLocaleDateString('th-TH')}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-500 text-white rounded-full px-2.5 py-0.5 text-xs">
                          สำเร็จแล้ว
                        </Badge>
                      </div>
                    ))}
                    
                    {/* แสดงประวัติการกระทำ */}
                    {history.length > 0 && (
                      <div className="relative pl-4">
                        <div className="absolute left-1 top-0 bottom-0 w-px bg-muted" />
                        <div className="space-y-3">
                          {history
                            .slice()
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                            .map(h => (
                            <div key={h.id} className="relative pl-4">
                              <div className="absolute -left-1 top-3 w-2 h-2 rounded-full bg-primary" />
                              <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded bg-primary/10">
                                    <Target className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium">{h.goal_type}</div>
                                    <div className="text-xs text-muted-foreground">{new Date(h.timestamp).toLocaleString('th-TH')}</div>
                                  </div>
                                </div>
                                <Badge className="rounded-full px-2.5 py-0.5 text-xs">
                                  {h.action === 'created' ? 'สร้าง' : h.action === 'updated' ? 'แก้ไข' : h.action === 'completed' ? 'สำเร็จ' : 'ลบ'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl border-2 border-accent/20">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-3 text-2xl text-accent">
              <div className="p-2 bg-gradient-to-r from-accent to-secondary rounded-xl">
                <Target className="h-6 w-6 text-accent-foreground" />
              </div>
              ยืนยันการทำสำเร็จ
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              คุณต้องการทำเครื่องหมายเป้าหมาย "{goalToComplete && getGoalDisplayTitle(goalToComplete)}" เป็นสำเร็จหรือไม่?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">ความคืบหน้าปัจจุบัน</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {goalToComplete && getProgressPercentage(goalToComplete.current_value, goalToComplete.target_value, goalToComplete.goal_type).toFixed(1)}%
              </div>
              <div className="text-sm text-blue-600">
                {goalToComplete?.current_value} / {goalToComplete?.target_value}
              </div>
              <Progress 
                value={goalToComplete ? getProgressPercentage(goalToComplete.current_value, goalToComplete.target_value, goalToComplete.goal_type) : 0} 
                className="h-2 mt-2"
              />
            </div>
            
            {goalToComplete && getProgressPercentage(goalToComplete.current_value, goalToComplete.target_value, goalToComplete.goal_type) < 100 && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 text-red-800">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">⚠️ เป้าหมายยังไม่ครบ 100%</span>
                </div>
                <p className="text-xs text-red-700 mt-1">
                  ระบบอาจปฏิเสธการทำสำเร็จเนื่องจากเป้าหมายยังไม่ถึง 100% 
                  กรุณาอัปเดตความคืบหน้าก่อนทำสำเร็จ
                </p>
              </div>
            )}
            
            {goalToComplete && getProgressPercentage(goalToComplete.current_value, goalToComplete.target_value, goalToComplete.goal_type) >= 100 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">เป้าหมายครบ 100%</span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  ยินดีด้วย! คุณได้ทำเป้าหมายสำเร็จแล้ว
                </p>
              </div>
            )}
            
            <div className="text-sm text-muted-foreground">
              การทำสำเร็จจะบันทึกเป้าหมายนี้ในประวัติและซ่อนออกจากรายการเป้าหมายปัจจุบัน
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              ยกเลิก
            </Button>
            <Button 
              onClick={async () => {
                if (goalToComplete) {
                  console.log('🎯 Confirming completion for goal:', goalToComplete.goal_id);
                  console.log('🔍 Goal data before completion:', goalToComplete);
                  setShowConfirmDialog(false);
                  setGoalToComplete(null);
                  try {
                    await handleCompleteGoal(goalToComplete);
                    console.log('✅ Completion process finished successfully');
                  } catch (error) {
                    console.error('❌ Completion process failed:', error);
                  }
                }
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-2" />
              ยืนยันสำเร็จ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Progress Update Dialog */}
      <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl border-2 border-primary/20">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-3 text-2xl text-primary">
              <div className="p-2 bg-gradient-to-r from-primary to-secondary rounded-xl">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              อัปเดตความคืบหน้า
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              อัปเดตความคืบหน้าปัจจุบันของเป้าหมาย "{selectedGoal && getGoalDisplayTitle(selectedGoal)}"
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="current-progress" className="text-right">
                ความคืบหน้าปัจจุบัน
              </Label>
              <Input
                id="current-progress"
                type="number"
                value={newProgress}
                onChange={(e) => setNewProgress(e.target.value)}
                className="col-span-3"
                placeholder="ใส่ตัวเลข"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              เป้าหมาย: {selectedGoal?.target_value} {
                selectedGoal?.goal_type === 'ลดน้ำหนัก' || selectedGoal?.goal_type === 'เพิ่มน้ำหนัก' ? 'กก.' :
                selectedGoal?.goal_type === 'วิ่งระยะทาง' ? 'กม.' :
                selectedGoal?.goal_type === 'ดื่มน้ำ' ? 'ลิตร' :
                selectedGoal?.goal_type === 'ออกกำลังกาย' || selectedGoal?.goal_type === 'ลดความเครียด' ? 'นาที' :
                selectedGoal?.goal_type === 'นอนหลับ' ? 'ชั่วโมง' : ''
              }
            </div>
            {newProgress && !isNaN(parseFloat(newProgress)) && (
              <div className="text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span>ความคืบหน้า</span>
                  <span>{getProgressPercentage(parseFloat(newProgress) || 0, selectedGoal?.target_value || 1, selectedGoal?.goal_type || '').toFixed(1)}%</span>
                </div>
                <Progress 
                  value={getProgressPercentage(parseFloat(newProgress) || 0, selectedGoal?.target_value || 1, selectedGoal?.goal_type || '')} 
                  className="h-2"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProgressDialog(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleProgressUpdate}>
              อัปเดต
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}