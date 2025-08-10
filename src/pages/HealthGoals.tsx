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
import { Target, Plus, Calendar, TrendingUp, CheckCircle, Clock, Pencil, Trash2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface HealthGoal {
  goal_id: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  start_date: string;
  end_date: string;
  status: string;
  daily_calorie_goal?: number;
  daily_protein_goal?: number;
  daily_carb_goal?: number;
  daily_fat_goal?: number;
  daily_fiber_goal?: number;
  daily_sodium_goal?: number;
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

const STORAGE_GOALS = 'health_goals';
const STORAGE_HISTORY = 'health_goals_history';

function loadGoals(): HealthGoal[] {
  try {
    const raw = localStorage.getItem(STORAGE_GOALS);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Seed sample goals
  const seed: HealthGoal[] = [
    {
      goal_id: "1",
      goal_type: "ลดน้ำหนัก",
      target_value: 65,
      current_value: 70,
      start_date: "2024-01-01",
      end_date: "2024-06-01",
      status: "active",
      daily_calorie_goal: 1800
    },
    {
      goal_id: "2",
      goal_type: "วิ่งระยะทาง",
      target_value: 5000,
      current_value: 1200,
      start_date: "2024-01-01",
      end_date: "2024-03-01",
      status: "active"
    },
    {
      goal_id: "3",
      goal_type: "ดื่มน้ำ",
      target_value: 2.5,
      current_value: 2.5,
      start_date: "2024-01-01",
      end_date: "2024-01-31",
      status: "completed"
    }
  ];
  localStorage.setItem(STORAGE_GOALS, JSON.stringify(seed));
  return seed;
}

function loadHistory(): GoalHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_HISTORY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveGoals(items: HealthGoal[]) {
  localStorage.setItem(STORAGE_GOALS, JSON.stringify(items));
}

function saveHistory(items: GoalHistoryItem[]) {
  localStorage.setItem(STORAGE_HISTORY, JSON.stringify(items));
}

export default function HealthGoals() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [history, setHistory] = useState<GoalHistoryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'history'>("all");
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  useEffect(() => {
    setGoals(loadGoals());
    setHistory(loadHistory());
  }, []);

  const [formData, setFormData] = useState({
    goal_type: "",
    target_value: "",
    current_value: "",
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
    daily_calorie_goal: "",
    daily_protein_goal: "",
    daily_carb_goal: "",
    daily_fat_goal: "",
    daily_fiber_goal: "",
    daily_sodium_goal: "",
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
    details_reminder_time: ""
  });

  const goalTypes = [
    "ลดน้ำหนัก", "เพิ่มน้ำหนัก", "วิ่งระยะทาง", "ดื่มน้ำ", 
    "ออกกำลังกาย", "นอนหลับ", "ลดความเครียด", "เพิ่มกล้ามเนื้อ"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGoalId) {
      // Update existing goal
      const updated: HealthGoal[] = goals.map(g => g.goal_id === editingGoalId ? {
        ...g,
        goal_type: formData.goal_type || g.goal_type,
        target_value: parseFloat(formData.target_value as string) || g.target_value,
        current_value: formData.current_value ? parseFloat(formData.current_value as string) : g.current_value,
        start_date: formData.start_date || g.start_date,
        end_date: formData.end_date || g.end_date,
        daily_calorie_goal: formData.daily_calorie_goal ? parseFloat(formData.daily_calorie_goal as string) : g.daily_calorie_goal,
        daily_protein_goal: formData.daily_protein_goal ? parseFloat(formData.daily_protein_goal as string) : g.daily_protein_goal,
        daily_carb_goal: formData.daily_carb_goal ? parseFloat(formData.daily_carb_goal as string) : g.daily_carb_goal,
        daily_fat_goal: formData.daily_fat_goal ? parseFloat(formData.daily_fat_goal as string) : g.daily_fat_goal,
        daily_fiber_goal: formData.daily_fiber_goal ? parseFloat(formData.daily_fiber_goal as string) : g.daily_fiber_goal,
        daily_sodium_goal: formData.daily_sodium_goal ? parseFloat(formData.daily_sodium_goal as string) : g.daily_sodium_goal,
        details: {
          ...(g.details || {}),
          focus_area: formData.details_focus_area || g.details?.focus_area,
          training_days: formData.details_training_days ? parseInt(formData.details_training_days) : g.details?.training_days,
          main_exercises: formData.details_main_exercises || g.details?.main_exercises,
          target_pace: formData.details_target_pace || g.details?.target_pace,
          frequency_per_week: formData.details_frequency_per_week ? parseInt(formData.details_frequency_per_week) : g.details?.frequency_per_week,
          notes: formData.details_notes || g.details?.notes,
          // water
          container_ml: formData.details_container_ml ? parseInt(formData.details_container_ml) : g.details?.container_ml,
          reminders_per_day: formData.details_reminders_per_day ? parseInt(formData.details_reminders_per_day) : g.details?.reminders_per_day,
          start_time: formData.details_start_time || g.details?.start_time,
          end_time: formData.details_end_time || g.details?.end_time,
          // general exercise
          main_activity: formData.details_main_activity || g.details?.main_activity,
          sessions_per_week: formData.details_sessions_per_week ? parseInt(formData.details_sessions_per_week) : g.details?.sessions_per_week,
          session_duration_min: formData.details_session_duration_min ? parseInt(formData.details_session_duration_min) : g.details?.session_duration_min,
          intensity_level: formData.details_intensity_level || g.details?.intensity_level,
          // stress
          technique: formData.details_technique || g.details?.technique,
          minutes_per_day: formData.details_minutes_per_day ? parseInt(formData.details_minutes_per_day) : g.details?.minutes_per_day,
          reminder_time: formData.details_reminder_time || g.details?.reminder_time,
        }
      } : g);
      setGoals(updated);
      saveGoals(updated);
      const newHist: GoalHistoryItem[] = [{ id: crypto.randomUUID(), goal_id: editingGoalId, goal_type: formData.goal_type || '', action: 'updated', timestamp: new Date().toISOString(), details: 'แก้ไขเป้าหมาย' }, ...history];
      setHistory(newHist);
      saveHistory(newHist);
      toast({ title: 'อัปเดตเป้าหมายแล้ว' });
    } else {
      // Create new goal
      const newGoal: HealthGoal = {
        goal_id: crypto.randomUUID(),
        goal_type: formData.goal_type,
        target_value: parseFloat(formData.target_value as string) || 0,
        current_value: formData.current_value ? parseFloat(formData.current_value as string) : 0,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: 'active',
        daily_calorie_goal: formData.daily_calorie_goal ? parseFloat(formData.daily_calorie_goal as string) : undefined,
        daily_protein_goal: formData.daily_protein_goal ? parseFloat(formData.daily_protein_goal as string) : undefined,
        daily_carb_goal: formData.daily_carb_goal ? parseFloat(formData.daily_carb_goal as string) : undefined,
        daily_fat_goal: formData.daily_fat_goal ? parseFloat(formData.daily_fat_goal as string) : undefined,
        daily_fiber_goal: formData.daily_fiber_goal ? parseFloat(formData.daily_fiber_goal as string) : undefined,
        daily_sodium_goal: formData.daily_sodium_goal ? parseFloat(formData.daily_sodium_goal as string) : undefined,
        details: {
          focus_area: formData.details_focus_area || undefined,
          training_days: formData.details_training_days ? parseInt(formData.details_training_days) : undefined,
          main_exercises: formData.details_main_exercises || undefined,
          target_pace: formData.details_target_pace || undefined,
          frequency_per_week: formData.details_frequency_per_week ? parseInt(formData.details_frequency_per_week) : undefined,
          notes: formData.details_notes || undefined,
          // water
          container_ml: formData.details_container_ml ? parseInt(formData.details_container_ml) : undefined,
          reminders_per_day: formData.details_reminders_per_day ? parseInt(formData.details_reminders_per_day) : undefined,
          start_time: formData.details_start_time || undefined,
          end_time: formData.details_end_time || undefined,
          // general exercise
          main_activity: formData.details_main_activity || undefined,
          sessions_per_week: formData.details_sessions_per_week ? parseInt(formData.details_sessions_per_week) : undefined,
          session_duration_min: formData.details_session_duration_min ? parseInt(formData.details_session_duration_min) : undefined,
          intensity_level: formData.details_intensity_level || undefined,
          // stress
          technique: formData.details_technique || undefined,
          minutes_per_day: formData.details_minutes_per_day ? parseInt(formData.details_minutes_per_day) : undefined,
          reminder_time: formData.details_reminder_time || undefined,
        }
      };
      const next = [newGoal, ...goals];
      setGoals(next);
      saveGoals(next);
      const newHist: GoalHistoryItem[] = [{ id: crypto.randomUUID(), goal_id: newGoal.goal_id, goal_type: newGoal.goal_type, action: 'created', timestamp: new Date().toISOString(), details: 'สร้างเป้าหมายใหม่' }, ...history];
      setHistory(newHist);
      saveHistory(newHist);
      toast({ title: 'สร้างเป้าหมายสำเร็จ' });
    }

    setShowForm(false);
    setEditingGoalId(null);
    setFormData({
      goal_type: "",
      target_value: "",
      current_value: "",
      start_date: new Date().toISOString().split('T')[0],
      end_date: "",
      daily_calorie_goal: "",
      daily_protein_goal: "",
      daily_carb_goal: "",
      daily_fat_goal: "",
      daily_fiber_goal: "",
      daily_sodium_goal: "",
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

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const startEdit = (g: HealthGoal) => {
    setEditingGoalId(g.goal_id);
    setFormData({
      goal_type: g.goal_type,
      target_value: String(g.target_value),
      current_value: String(g.current_value ?? 0),
      start_date: g.start_date,
      end_date: g.end_date,
      daily_calorie_goal: g.daily_calorie_goal ? String(g.daily_calorie_goal) : "",
      daily_protein_goal: g.daily_protein_goal ? String(g.daily_protein_goal) : "",
      daily_carb_goal: g.daily_carb_goal ? String(g.daily_carb_goal) : "",
      daily_fat_goal: g.daily_fat_goal ? String(g.daily_fat_goal) : "",
      daily_fiber_goal: g.daily_fiber_goal ? String(g.daily_fiber_goal) : "",
      daily_sodium_goal: g.daily_sodium_goal ? String(g.daily_sodium_goal) : "",
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
    });
    setShowForm(true);
  };

  const markCompleted = (goal: HealthGoal) => {
    const updated = goals.map(g => g.goal_id === goal.goal_id ? { ...g, status: 'completed', current_value: g.target_value } : g);
    setGoals(updated);
    saveGoals(updated);
    const newHist: GoalHistoryItem[] = [{ id: crypto.randomUUID(), goal_id: goal.goal_id, goal_type: goal.goal_type, action: 'completed', timestamp: new Date().toISOString(), details: 'ทำสำเร็จ' }, ...history];
    setHistory(newHist);
    saveHistory(newHist);
    toast({ title: 'ทำเครื่องหมายว่าสำเร็จแล้ว' });
  };

  const deleteGoal = (goal: HealthGoal) => {
    const next = goals.filter(g => g.goal_id !== goal.goal_id);
    setGoals(next);
    saveGoals(next);
    const newHist: GoalHistoryItem[] = [{ id: crypto.randomUUID(), goal_id: goal.goal_id, goal_type: goal.goal_type, action: 'deleted', timestamp: new Date().toISOString(), details: 'ลบเป้าหมาย' }, ...history];
    setHistory(newHist);
    saveHistory(newHist);
    toast({ title: 'ลบเป้าหมายแล้ว' });
  };

  const filteredGoals = useMemo(() => {
    if (filter === 'all') return goals;
    return goals.filter(g => g.status === filter);
  }, [goals, filter]);

  const getGoalIcon = (goalType: string) => {
    const goalIcons = {
      "ลดน้ำหนัก": "bg-red-500",
      "เพิ่มน้ำหนัก": "bg-green-500",
      "วิ่งระยะทาง": "bg-blue-500",
      "ดื่มน้ำ": "bg-cyan-500",
      "ออกกำลังกาย": "bg-orange-500",
      "นอนหลับ": "bg-purple-500",
      "ลดความเครียด": "bg-pink-500",
      "เพิ่มกล้ามเนื้อ": "bg-yellow-600"
    };
    return goalIcons[goalType as keyof typeof goalIcons] || "bg-gray-500";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">เป้าหมายสุขภาพ</h1>
            <p className="text-muted-foreground">ตั้งและติดตามเป้าหมายสุขภาพของคุณ</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2 rounded-full">
            <Plus className="h-4 w-4" />
            {editingGoalId ? 'แก้ไขเป้าหมาย' : 'เพิ่มเป้าหมายใหม่'}
          </Button>
        </div>

        {showForm && (
          <Card className="border-0 rounded-xl shadow-medium bg-gradient-to-br from-card to-muted">
            <CardHeader>
              <CardTitle>{editingGoalId ? 'แก้ไขเป้าหมาย' : 'สร้างเป้าหมายใหม่'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal_type">ประเภทเป้าหมาย</Label>
                    <Select value={formData.goal_type} onValueChange={(value) => setFormData({...formData, goal_type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภท" />
                      </SelectTrigger>
                      <SelectContent>
                        {goalTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target_value">ค่าเป้าหมาย</Label>
                    <Input
                      id="target_value"
                      type="number"
                      placeholder="เช่น 65 (กก.)"
                      value={formData.target_value}
                      onChange={(e) => setFormData({...formData, target_value: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="current_value">ค่าปัจจุบัน</Label>
                    <Input
                      id="current_value"
                      type="number"
                      placeholder="ค่าปัจจุบันของเป้าหมาย"
                      value={formData.current_value}
                      onChange={(e) => setFormData({...formData, current_value: e.target.value})}
                    />
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

                {formData.goal_type === "ลดน้ำหนัก" && (
                  <div className="space-y-4 p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold">เป้าหมายโภชนาการรายวัน</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="daily_calorie_goal">แคลอรี</Label>
                        <Input
                          id="daily_calorie_goal"
                          type="number"
                          placeholder="1800"
                          value={formData.daily_calorie_goal}
                          onChange={(e) => setFormData({...formData, daily_calorie_goal: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="daily_protein_goal">โปรตีน (g)</Label>
                        <Input
                          id="daily_protein_goal"
                          type="number"
                          placeholder="120"
                          value={formData.daily_protein_goal}
                          onChange={(e) => setFormData({...formData, daily_protein_goal: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="daily_carb_goal">คาร์โบ (g)</Label>
                        <Input
                          id="daily_carb_goal"
                          type="number"
                          placeholder="200"
                          value={formData.daily_carb_goal}
                          onChange={(e) => setFormData({...formData, daily_carb_goal: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="daily_fat_goal">ไขมัน (g)</Label>
                        <Input
                          id="daily_fat_goal"
                          type="number"
                          placeholder="60"
                          value={formData.daily_fat_goal}
                          onChange={(e) => setFormData({...formData, daily_fat_goal: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="daily_fiber_goal">ไฟเบอร์ (g)</Label>
                        <Input
                          id="daily_fiber_goal"
                          type="number"
                          placeholder="25"
                          value={formData.daily_fiber_goal}
                          onChange={(e) => setFormData({...formData, daily_fiber_goal: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="daily_sodium_goal">โซเดียม (mg)</Label>
                        <Input
                          id="daily_sodium_goal"
                          type="number"
                          placeholder="2300"
                          value={formData.daily_sodium_goal}
                          onChange={(e) => setFormData({...formData, daily_sodium_goal: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}

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

                <div className="flex gap-2">
                  <Button type="submit">สร้างเป้าหมาย</Button>
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
              <TabsList className="grid w-full md:w-auto grid-cols-4 md:inline-grid rounded-full bg-muted/50 p-1">
                <TabsTrigger value="all" className="rounded-full data-[state=active]:bg-card">ทั้งหมด</TabsTrigger>
                <TabsTrigger value="active" className="rounded-full data-[state=active]:bg-card">กำลังดำเนินการ</TabsTrigger>
                <TabsTrigger value="completed" className="rounded-full data-[state=active]:bg-card">สำเร็จแล้ว</TabsTrigger>
                <TabsTrigger value="history" className="rounded-full data-[state=active]:bg-card">ประวัติ</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {filter !== 'history' ? (
            <>
            {filteredGoals.map((goal) => (
            <Card key={goal.goal_id} className="border-0 rounded-xl bg-gradient-to-br from-card to-muted hover:shadow-health transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ring-1 ring-black/5 ${getGoalIcon(goal.goal_type)}`}>
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{goal.goal_type}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(goal.start_date).toLocaleDateString('th-TH')} - {new Date(goal.end_date).toLocaleDateString('th-TH')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(goal.status)}
                    <Button variant="outline" size="sm" className="gap-1 rounded-full" onClick={() => startEdit(goal)}>
                      <Pencil className="h-3.5 w-3.5" /> แก้ไข
                    </Button>
                    {goal.status !== 'completed' && (
                      <Button variant="secondary" size="sm" className="gap-1 rounded-full" onClick={() => markCompleted(goal)}>
                        <Check className="h-3.5 w-3.5" /> สำเร็จ
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="gap-1 rounded-full">
                          <Trash2 className="h-3.5 w-3.5" /> ลบ
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
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>ความคืบหน้า</span>
                    <span>{goal.current_value} / {goal.target_value}</span>
                  </div>
                  
                   <Progress 
                     value={getProgressPercentage(goal.current_value, goal.target_value)} 
                     className="h-2 bg-muted"
                   />
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>{getProgressPercentage(goal.current_value, goal.target_value).toFixed(1)}% สำเร็จ</span>
                    </div>
                    
                    {goal.status === "completed" && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>เป้าหมายสำเร็จ!</span>
                      </div>
                    )}
                    
                    {goal.status === "active" && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>กำลังดำเนินการ</span>
                      </div>
                    )}
                  </div>
                </div>

                {goal.daily_calorie_goal && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-2">เป้าหมายโภชนาการรายวัน</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
                      <div className="text-center">
                        <div className="font-semibold">{goal.daily_calorie_goal}</div>
                        <div className="text-muted-foreground">แคลอรี</div>
                      </div>
                      {goal.daily_protein_goal && (
                        <div className="text-center">
                          <div className="font-semibold">{goal.daily_protein_goal}g</div>
                          <div className="text-muted-foreground">โปรตีน</div>
                        </div>
                      )}
                      {goal.daily_carb_goal && (
                        <div className="text-center">
                          <div className="font-semibold">{goal.daily_carb_goal}g</div>
                          <div className="text-muted-foreground">คาร์โบ</div>
                        </div>
                      )}
                      {goal.daily_fat_goal && (
                        <div className="text-center">
                          <div className="font-semibold">{goal.daily_fat_goal}g</div>
                          <div className="text-muted-foreground">ไขมัน</div>
                        </div>
                      )}
                      {goal.daily_fiber_goal && (
                        <div className="text-center">
                          <div className="font-semibold">{goal.daily_fiber_goal}g</div>
                          <div className="text-muted-foreground">ไฟเบอร์</div>
                        </div>
                      )}
                      {goal.daily_sodium_goal && (
                        <div className="text-center">
                          <div className="font-semibold">{goal.daily_sodium_goal}mg</div>
                          <div className="text-muted-foreground">โซเดียม</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            ))}
            </>
          ) : (
            <Card className="border-0 rounded-xl bg-gradient-to-br from-card to-muted">
              <CardContent className="p-4">
                {history.length === 0 ? (
                  <div className="text-sm text-muted-foreground">ยังไม่มีประวัติ</div>
                ) : (
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
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}