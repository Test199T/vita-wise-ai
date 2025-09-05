import { useEffect, useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Clock, Flame, Plus, Calendar, Activity, Target, Zap, MapPin, Timer } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import type { ExerciseLog } from "@/services/api";
import { tokenUtils } from "@/lib/utils";

// ฟังก์ชันสำหรับจัดการวันที่โดยไม่ให้เลื่อนไป 1 วัน
const getLocalDateString = (date?: Date | string) => {
  const targetDate = date ? new Date(date) : new Date();
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ฟังก์ชันสำหรับคำนวณช่วงวันที่ตามช่วงเวลาที่เลือก
const getDateRange = (period: 'today' | 'week' | 'month') => {
  const today = new Date();
  const todayString = getLocalDateString(today);
  
  switch (period) {
    case 'today':
      return { start: todayString, end: todayString };
    
    case 'week':
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // เริ่มจากวันอาทิตย์
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // จบที่วันเสาร์
      return {
        start: getLocalDateString(startOfWeek),
        end: getLocalDateString(endOfWeek)
      };
    
    case 'month':
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return {
        start: getLocalDateString(startOfMonth),
        end: getLocalDateString(endOfMonth)
      };
    
    default:
      return { start: todayString, end: todayString };
  }
};

// ฟังก์ชันสำหรับตรวจสอบว่าวันที่อยู่ในช่วงที่กำหนดหรือไม่
const isDateInRange = (dateString: string, startDate: string, endDate: string) => {
  return dateString >= startDate && dateString <= endDate;
};

interface ExerciseSession {
  session_id: string;
  session_date: string;
  exercise_type: string;
  duration_minutes: number;
  intensity_level: string;
  calories_burned: number;
  notes: string;
  backend_id?: number | string; // ID จริงจาก Backend
  // ข้อมูลยกน้ำหนัก
  sets?: number | null;
  reps?: number | null;
  weight_kg?: number | null;
}

export default function ExerciseLog() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [sessions, setSessions] = useState<ExerciseSession[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoadingFromBackend, setIsLoadingFromBackend] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today'); // เพิ่ม state สำหรับเลือกช่วงเวลา

  // ฟังก์ชันคำนวณสถิติการออกกำลังกายตามช่วงเวลาที่เลือก
  const calculateExerciseStats = (period: 'today' | 'week' | 'month') => {
    const dateRange = getDateRange(period);
    const stats = {
      totalSessions: 0,
      totalDuration: 0,
      totalCalories: 0,
      averageDuration: 0,
      averageCalories: 0,
      exerciseTypes: {} as { [key: string]: number },
      intensityDistribution: {} as { [key: string]: number }
    };

    // กรองและคำนวณเฉพาะการออกกำลังกายในช่วงเวลาที่เลือก
    const filteredSessions = sessions.filter(session => {
      const sessionDate = getLocalDateString(session.session_date);
      return isDateInRange(sessionDate, dateRange.start, dateRange.end);
    });

    filteredSessions.forEach(session => {
      stats.totalSessions++;
      stats.totalDuration += session.duration_minutes;
      stats.totalCalories += session.calories_burned;
      
      // นับประเภทการออกกำลังกาย
      stats.exerciseTypes[session.exercise_type] = (stats.exerciseTypes[session.exercise_type] || 0) + 1;
      
      // นับระดับความหนัก
      stats.intensityDistribution[session.intensity_level] = (stats.intensityDistribution[session.intensity_level] || 0) + 1;
    });

    // คำนวณค่าเฉลี่ย
    if (stats.totalSessions > 0) {
      stats.averageDuration = Math.round(stats.totalDuration / stats.totalSessions);
      stats.averageCalories = Math.round(stats.totalCalories / stats.totalSessions);
    }

    return stats;
  };

  // คำนวณสถิติสำหรับช่วงเวลาที่เลือก
  const currentExerciseStats = useMemo(() => {
    return calculateExerciseStats(selectedPeriod);
  }, [sessions, selectedPeriod]);

  useEffect(() => {
    const raw = localStorage.getItem('exercise_logs');
    if (raw) {
      try { setSessions(JSON.parse(raw)); } catch { setSessions([]); }
    } else {
      setSessions([]);
      localStorage.setItem('exercise_logs', JSON.stringify([]));
    }
    
    // โหลดข้อมูลจาก Backend เมื่อเปิดหน้า
    loadExerciseLogsFromBackend();
  }, []);

  // ฟังก์ชันโหลดข้อมูลการออกกำลังกายจาก Backend
  const loadExerciseLogsFromBackend = async () => {
    if (isLoadingFromBackend) return; // ป้องกันการโหลดซ้ำ
    
    setIsLoadingFromBackend(true);
    
    try {
      console.log('📥 โหลดข้อมูลการออกกำลังกายจาก Backend...');
      const backendLogs = await apiService.getExerciseLogs();
      
      if (backendLogs && backendLogs.length > 0) {
        console.log('✅ โหลดข้อมูลจาก Backend สำเร็จ:', backendLogs.length, 'รายการ');
        
        // แปลงข้อมูลจาก Backend เป็นรูปแบบที่ใช้ในหน้า
        const convertedSessions: ExerciseSession[] = backendLogs.map(log => {
          // ใช้ ID จริงจาก Backend ถ้ามี ถ้าไม่มีให้สร้าง ID ชั่วคราว
          const sessionId = log.id?.toString() || `temp_${log.exercise_name}_${log.exercise_date}_${log.exercise_time}`;
          
          console.log('🆔 แปลง ID:', { 
            originalId: log.id, 
            sessionId,
            exercise_name: log.exercise_name,
            exercise_date: log.exercise_date,
            exercise_time: log.exercise_time
          });
          
                     return {
             session_id: sessionId,
             session_date: log.exercise_date,
             exercise_type: log.exercise_name || log.exercise_type,
             duration_minutes: log.duration_minutes,
             intensity_level: log.intensity,
             calories_burned: log.calories_burned,
             notes: log.notes || '',
             // ข้อมูลยกน้ำหนัก
             sets: log.sets || null,
             reps: log.reps || null,
             weight_kg: log.weight_kg || null,
             // เก็บ ID จริงจาก Backend ไว้ใช้ตอนลบ
             backend_id: log.id
           };
        });
        
        // อัพเดท state และ localStorage
        setSessions(convertedSessions);
        localStorage.setItem('exercise_logs', JSON.stringify(convertedSessions));
        
        toast({ 
          title: 'โหลดข้อมูลสำเร็จ', 
          description: `โหลดข้อมูลการออกกำลังกาย ${backendLogs.length} รายการจาก Backend` 
        });
      } else {
        console.log('ℹ️ ไม่มีข้อมูลการออกกำลังกายใน Backend');
        setSessions([]);
        localStorage.setItem('exercise_logs', JSON.stringify([]));
        
        toast({ 
          title: 'ไม่มีข้อมูล', 
          description: 'ไม่พบข้อมูลการออกกำลังกายในระบบ' 
        });
      }
    } catch (error) {
      console.error('❌ Error loading exercise logs from backend:', error);
      
      let errorMessage = 'ไม่สามารถโหลดข้อมูลจาก Backend ได้';
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'ไม่มีสิทธิ์ในการเข้าถึงข้อมูล กรุณาเข้าสู่ระบบใหม่';
        } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
          errorMessage = 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({ 
        title: 'เกิดข้อผิดพลาด', 
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoadingFromBackend(false);
    }
  };

  const saveSessions = (items: ExerciseSession[]) => {
    setSessions(items);
    localStorage.setItem('exercise_logs', JSON.stringify(items));
  };

  const [formData, setFormData] = useState({
    exercise_name: "",
    exercise_type: "",
    duration_minutes: "",
    intensity: "",
    calories_burned: "",
    distance_km: "",
    sets: "",
    reps: "",
    weight_kg: "",
    notes: "",
    exercise_date: new Date().toISOString().split('T')[0],
    exercise_time: new Date().toTimeString().split(' ')[0]
  });

  const [weightExercises, setWeightExercises] = useState<Array<{ name: string; sets: string; reps: string; weight: string; rpe?: string }>>([
    { name: "", sets: "", reps: "", weight: "", rpe: "" }
  ]);
  const addWeightExercise = () => setWeightExercises(prev => [...prev, { name: "", sets: "", reps: "", weight: "", rpe: "" }]);
  const updateWeightExercise = (index: number, field: keyof (typeof weightExercises)[number], value: string) => {
    setWeightExercises(prev => prev.map((ex, i) => i === index ? { ...ex, [field]: value } : ex));
  };
  const removeWeightExercise = (index: number) => setWeightExercises(prev => prev.filter((_, i) => i !== index));

  const cardioTypes = ["วิ่ง", "เดิน", "ขี่จักรยาน", "ว่ายน้ำ", "มวยไทย", "เต้นรำ"];
  
  // กีฬาที่ต้องใช้ระยะทางในการคำนวณ
  const distanceBasedExercises = ["วิ่ง", "เดิน", "ขี่จักรยาน", "ว่ายน้ำ"];

  const exerciseTypes = [
    { label: "วิ่ง", value: "cardio" },
    { label: "เดิน", value: "cardio" },
    { label: "ขี่จักรยาน", value: "cardio" },
    { label: "ว่ายน้ำ", value: "cardio" },
    { label: "ยกน้ำหนัก", value: "strength" },
    { label: "โยคะ", value: "flexibility" },
    { label: "พิลาทิส", value: "flexibility" },
    { label: "เต้นรำ", value: "cardio" },
    { label: "มวยไทย", value: "sports" },
    { label: "อื่นๆ", value: "other" }
  ];

  const intensityLevels = [
    { label: "ต่ำ", value: "low", color: "bg-green-500", multiplier: 1.0 },
    { label: "ปานกลาง", value: "moderate", color: "bg-yellow-500", multiplier: 1.3 },
    { label: "สูง", value: "high", color: "bg-red-500", multiplier: 1.6 },
    { label: "สูงมาก", value: "very_high", color: "bg-red-700", multiplier: 2.0 }
  ];

  // ฟังก์ชันคำนวณแคลอรี่สำหรับแต่ละประเภทกีฬา (แคลอรี่ต่อนาที)
  const getCaloriesPerMinute = (exerciseType: string, intensity: string): number => {
    const intensityData = intensityLevels.find(level => level.label === intensity);
    const intensityMultiplier = intensityData?.multiplier || 1.3;

    // ค่าแคลอรี่พื้นฐานต่อนาทีสำหรับแต่ละประเภทกีฬา (สำหรับคนน้ำหนัก 70 กก.)
    const baseCaloriesPerMinute: { [key: string]: number } = {
      "วิ่ง": 10,
      "เดิน": 4,
      "ขี่จักรยาน": 8,
      "ว่ายน้ำ": 12,
      "ยกน้ำหนัก": 6,
      "โยคะ": 3,
      "พิลาทิส": 4,
      "เต้นรำ": 6,
      "มวยไทย": 15,
      "อื่นๆ": 5
    };

    const baseCalories = baseCaloriesPerMinute[exerciseType] || 5;
    return Math.round(baseCalories * intensityMultiplier);
  };

  // ฟังก์ชันคำนวณแคลอรี่ทั้งหมด
  const calculateTotalCalories = (exerciseType: string, duration: number, intensity: string, distance?: number): number => {
    if (!exerciseType || !duration || !intensity) return 0;
    
    // สำหรับกีฬาที่ใช้ระยะทาง ให้คำนวณจากระยะทางด้วย
    if (distanceBasedExercises.includes(exerciseType) && distance && distance > 0) {
      const caloriesPerKm: { [key: string]: number } = {
        "วิ่ง": 60,      // 60 แคล/กม.
        "เดิน": 30,      // 30 แคล/กม.
        "ขี่จักรยาน": 25, // 25 แคล/กม.
        "ว่ายน้ำ": 80    // 80 แคล/กม.
      };
      
      const intensityData = intensityLevels.find(level => level.label === intensity);
      const intensityMultiplier = intensityData?.multiplier || 1.3;
      
      const baseCaloriesPerKm = caloriesPerKm[exerciseType] || 30;
      return Math.round(baseCaloriesPerKm * distance * intensityMultiplier);
    }
    
    // สำหรับกีฬาที่ไม่ใช้ระยะทาง หรือไม่มีระยะทาง
    const caloriesPerMinute = getCaloriesPerMinute(exerciseType, intensity);
    return caloriesPerMinute * duration;
  };

  // ฟังก์ชันอัปเดตแคลอรี่อัตโนมัติ
  const updateCaloriesAutomatically = (exerciseType: string, duration: string, intensity: string, distance?: string) => {
    if (exerciseType && duration && intensity) {
      const calculatedCalories = calculateTotalCalories(
        exerciseType, 
        Number(duration), 
        intensity, 
        distance ? Number(distance) : undefined
      );
      setFormData(prev => ({
        ...prev,
        calories_burned: calculatedCalories.toString()
      }));
    }
  };

  // ฟังก์ชันแปลงค่าจากภาษาไทยเป็นภาษาอังกฤษ
  const mapExerciseTypeToEnglish = (thaiType: string): string => {
    const exercise = exerciseTypes.find(ex => ex.label === thaiType);
    return exercise ? exercise.value : "other";
  };

  const mapIntensityToEnglish = (thaiIntensity: string): string => {
    const intensity = intensityLevels.find(level => level.label === thaiIntensity);
    return intensity ? intensity.value : "moderate";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
             // สร้างข้อมูลสำหรับส่งไปยัง API
       const exerciseData: ExerciseLog = {
         exercise_name: formData.exercise_name || formData.exercise_type,
         exercise_type: mapExerciseTypeToEnglish(formData.exercise_type),
         duration_minutes: Number(formData.duration_minutes || 0),
         // ใช้ข้อมูลจาก weightExercises ถ้าเป็นยกน้ำหนัก
         sets: formData.exercise_type === "ยกน้ำหนัก" && weightExercises[0]?.sets ? Number(weightExercises[0].sets) : (formData.sets ? Number(formData.sets) : null),
         reps: formData.exercise_type === "ยกน้ำหนัก" && weightExercises[0]?.reps ? Number(weightExercises[0].reps) : (formData.reps ? Number(formData.reps) : null),
         weight_kg: formData.exercise_type === "ยกน้ำหนัก" && weightExercises[0]?.weight ? Number(weightExercises[0].weight) : (formData.weight_kg ? Number(formData.weight_kg) : null),
         distance_km: formData.distance_km ? Number(formData.distance_km) : null,
         calories_burned: Number(formData.calories_burned || 0),
         intensity: mapIntensityToEnglish(formData.intensity),
         notes: formData.notes,
         exercise_date: formData.exercise_date,
         exercise_time: formData.exercise_time
       };

             console.log('📝 ข้อมูลที่จะส่งไปยัง API:', exerciseData);
       console.log('🏋️ ข้อมูลยกน้ำหนัก:', {
         exercise_type: formData.exercise_type,
         weightExercises: weightExercises,
         sets: exerciseData.sets,
         reps: exerciseData.reps,
         weight_kg: exerciseData.weight_kg
       });

      // เรียก API เพื่อบันทึกข้อมูล
      const savedExercise = await apiService.createExerciseLog(exerciseData);
      
      toast({ 
        title: 'บันทึกสำเร็จ', 
        description: 'บันทึกการออกกำลังกายเรียบร้อยแล้ว' 
      });

             // บันทึกลง localStorage สำหรับแสดงผลในหน้า
       const newSession: ExerciseSession = {
         session_id: crypto.randomUUID(),
         session_date: formData.exercise_date,
         exercise_type: formData.exercise_type,
         duration_minutes: Number(formData.duration_minutes || 0),
         intensity_level: formData.intensity,
         calories_burned: Number(formData.calories_burned || 0),
         notes: formData.notes,
         // ใช้ ID จาก Backend response ถ้ามี
         backend_id: savedExercise.id || undefined
       };
       
       console.log('🆕 สร้าง session ใหม่:', {
         session_id: newSession.session_id,
         backend_id: newSession.backend_id,
         savedExercise_id: savedExercise.id
       });
       
       saveSessions([newSession, ...sessions]);

      // รีเซ็ตฟอร์ม
      setFormData({
        exercise_name: "",
        exercise_type: "",
        duration_minutes: "",
        intensity: "",
        calories_burned: "",
        distance_km: "",
        sets: "",
        reps: "",
        weight_kg: "",
        notes: "",
        exercise_date: new Date().toISOString().split('T')[0],
        exercise_time: new Date().toTimeString().split(' ')[0]
      });
      setShowForm(false);

    } catch (error) {
      console.error('Error saving exercise log:', error);
      toast({ 
        title: 'เกิดข้อผิดพลาด', 
        description: error instanceof Error ? error.message : 'ไม่สามารถบันทึกข้อมูลได้',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const startEdit = (s: ExerciseSession) => {
    console.log('✏️ เริ่มแก้ไข session:', s);
    setEditingId(s.session_id);
    
         // โหลดข้อมูลครบถ้วนจาก session
     const editFormData = {
       exercise_name: s.exercise_type,
       exercise_type: s.exercise_type,
       duration_minutes: String(s.duration_minutes || ''),
       intensity: s.intensity_level,
       calories_burned: String(s.calories_burned || ''),
       distance_km: '',
       sets: '',
       reps: '',
       weight_kg: '',
       notes: s.notes || '',
       exercise_date: s.session_date,
       exercise_time: new Date().toTimeString().split(' ')[0]
     };
     
     // โหลดข้อมูลยกน้ำหนักถ้ามี
     if (s.exercise_type === "ยกน้ำหนัก") {
       editFormData.sets = String(s.sets || '');
       editFormData.reps = String(s.reps || '');
       editFormData.weight_kg = String(s.weight_kg || '');
       
       // อัปเดต weightExercises state
       setWeightExercises([{
         name: '',
         sets: String(s.sets || ''),
         reps: String(s.reps || ''),
         weight: String(s.weight_kg || ''),
         rpe: ''
       }]);
     }
    
    console.log('📝 ข้อมูลฟอร์มสำหรับแก้ไข:', editFormData);
    setFormData(editFormData);
    setShowForm(true);
  };

  // ฟังก์ชันอัปเดตข้อมูลการออกกำลังกาย
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || !editingId) return;
    setIsSubmitting(true);

    try {
      // หา session ที่กำลังแก้ไข
      const sessionToUpdate = sessions.find(s => s.session_id === editingId);
      if (!sessionToUpdate) {
        throw new Error('ไม่พบข้อมูลที่ต้องการแก้ไข');
      }

      // ตรวจสอบว่ามี backend_id หรือไม่
      if (!sessionToUpdate.backend_id) {
        throw new Error('ไม่สามารถแก้ไขข้อมูลได้ เนื่องจากไม่พบ ID จาก Backend');
      }

             // สร้างข้อมูลสำหรับส่งไปยัง API
       const updateData: Partial<ExerciseLog> = {
         exercise_name: formData.exercise_name || formData.exercise_type,
         exercise_type: mapExerciseTypeToEnglish(formData.exercise_type),
         duration_minutes: Number(formData.duration_minutes || 0),
         // ใช้ข้อมูลจาก weightExercises ถ้าเป็นยกน้ำหนัก
         sets: formData.exercise_type === "ยกน้ำหนัก" && weightExercises[0]?.sets ? Number(weightExercises[0].sets) : (formData.sets ? Number(formData.sets) : null),
         reps: formData.exercise_type === "ยกน้ำหนัก" && weightExercises[0]?.reps ? Number(weightExercises[0].reps) : (formData.reps ? Number(formData.reps) : null),
         weight_kg: formData.exercise_type === "ยกน้ำหนัก" && weightExercises[0]?.weight ? Number(weightExercises[0].weight) : (formData.weight_kg ? Number(formData.weight_kg) : null),
         distance_km: formData.distance_km ? Number(formData.distance_km) : null,
         calories_burned: Number(formData.calories_burned || 0),
         intensity: mapIntensityToEnglish(formData.intensity),
         notes: formData.notes,
         exercise_date: formData.exercise_date,
         exercise_time: formData.exercise_time
       };

             console.log('✏️ ข้อมูลที่จะอัปเดต:', updateData);
       console.log('🏋️ ข้อมูลยกน้ำหนักที่จะอัปเดต:', {
         exercise_type: formData.exercise_type,
         weightExercises: weightExercises,
         sets: updateData.sets,
         reps: updateData.reps,
         weight_kg: updateData.weight_kg
       });
      console.log('🆔 Backend ID ที่จะอัปเดต:', sessionToUpdate.backend_id);

      // เรียก API เพื่ออัปเดตข้อมูล
      const updatedExercise = await apiService.updateExerciseLog(sessionToUpdate.backend_id, updateData);
      
      console.log('✅ อัปเดตข้อมูลสำเร็จ:', updatedExercise);

      // อัปเดต session ใน state
      const updatedSessions = sessions.map(s => {
        if (s.session_id === editingId) {
                     const updatedSession = {
             ...s,
             exercise_type: formData.exercise_type,
             session_date: formData.exercise_date, // อัปเดตวันที่
             duration_minutes: Number(formData.duration_minutes || 0),
             intensity_level: formData.intensity,
             calories_burned: Number(formData.calories_burned || 0),
             notes: formData.notes,
             // อัปเดตข้อมูลยกน้ำหนัก
             sets: formData.exercise_type === "ยกน้ำหนัก" && weightExercises[0]?.sets ? Number(weightExercises[0].sets) : (formData.sets ? Number(formData.sets) : null),
             reps: formData.exercise_type === "ยกน้ำหนัก" && weightExercises[0]?.reps ? Number(weightExercises[0].reps) : (formData.reps ? Number(formData.reps) : null),
             weight_kg: formData.exercise_type === "ยกน้ำหนัก" && weightExercises[0]?.weight ? Number(weightExercises[0].weight) : (formData.weight_kg ? Number(formData.weight_kg) : null),
             // อัปเดต backend_id ถ้ามีใหม่
             backend_id: updatedExercise.id || s.backend_id
           };
          
          console.log('🔄 อัปเดต session:', {
            before: s,
            after: updatedSession
          });
          
          return updatedSession;
        }
        return s;
      });

      saveSessions(updatedSessions);
      
      toast({ 
        title: 'อัปเดตสำเร็จ', 
        description: 'อัปเดตข้อมูลการออกกำลังกายเรียบร้อยแล้ว' 
      });

      // รีเซ็ตฟอร์มและปิดการแก้ไข
      setFormData({
        exercise_name: "",
        exercise_type: "",
        duration_minutes: "",
        intensity: "",
        calories_burned: "",
        distance_km: "",
        sets: "",
        reps: "",
        weight_kg: "",
        notes: "",
        exercise_date: new Date().toISOString().split('T')[0],
        exercise_time: new Date().toTimeString().split(' ')[0]
      });
      setEditingId(null);
      setShowForm(false);

    } catch (error) {
      console.error('❌ Error updating exercise log:', error);
      
      let errorMessage = 'ไม่สามารถอัปเดตข้อมูลได้';
      
      if (error instanceof Error) {
        if (error.message.includes('ไม่พบข้อมูลที่ต้องการแก้ไข')) {
          errorMessage = 'ไม่พบข้อมูลที่ต้องการแก้ไข';
        } else if (error.message.includes('ไม่สามารถแก้ไขข้อมูลได้')) {
          errorMessage = 'ไม่สามารถแก้ไขข้อมูลได้ เนื่องจากไม่พบ ID จาก Backend';
        } else if (error.message.includes('400') || error.message.includes('Bad Request')) {
          errorMessage = 'ข้อมูลที่ส่งไปไม่ถูกต้อง กรุณาตรวจสอบข้อมูล';
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'ไม่มีสิทธิ์ในการแก้ไขข้อมูล กรุณาเข้าสู่ระบบใหม่';
        } else if (error.message.includes('404') || error.message.includes('Not Found')) {
          errorMessage = 'ไม่พบข้อมูลที่ต้องการแก้ไข';
        } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
          errorMessage = 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({ 
        title: 'เกิดข้อผิดพลาด', 
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteSession = async (s: ExerciseSession) => {
    if (deletingId) return; // ป้องกันการลบซ้ำ
    
    setDeletingId(s.session_id);
    
    try {
      console.log('🗑️ เริ่มลบข้อมูลการออกกำลังกาย:', s.session_id);
      console.log('📋 รายละเอียดข้อมูลที่จะลบ:', s);
      
      // ตรวจสอบว่ามี backend_id หรือไม่
      if (!s.backend_id) {
        throw new Error('ไม่พบ ID จาก Backend สำหรับการลบข้อมูล');
      }
      
      console.log('🆔 ใช้ backend_id สำหรับการลบ:', s.backend_id);
      
      // เรียก API DELETE เพื่อลบข้อมูลจาก Backend โดยใช้ backend_id
      await apiService.deleteExerciseLog(s.backend_id);
      
      console.log('✅ ลบข้อมูลจาก Backend สำเร็จ');
      
      // ลบออกจาก localStorage และ state
      const next = sessions.filter(x => x.session_id !== s.session_id);
      saveSessions(next);
      
      toast({ 
        title: 'ลบรายการแล้ว', 
        description: 'ลบข้อมูลการออกกำลังกายเรียบร้อยแล้ว' 
      });
      
    } catch (error) {
      console.error('❌ Error deleting exercise log:', error);
      
      // แสดงข้อความ error ที่ชัดเจนขึ้น
      let errorMessage = 'ไม่สามารถลบข้อมูลได้';
      
      if (error instanceof Error) {
        if (error.message.includes('ไม่พบ ID จาก Backend')) {
          errorMessage = 'ไม่สามารถลบข้อมูลได้ เนื่องจากไม่พบ ID ที่ถูกต้อง';
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'ไม่มีสิทธิ์ในการลบข้อมูล กรุณาเข้าสู่ระบบใหม่';
        } else if (error.message.includes('404') || error.message.includes('Not Found')) {
          errorMessage = 'ไม่พบข้อมูลที่ต้องการลบ';
        } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
          errorMessage = 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({ 
        title: 'เกิดข้อผิดพลาด', 
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Dumbbell className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-primary">บันทึกการออกกำลังกาย</h1>
            </div>
            <p className="text-muted-foreground ml-12">ติดตามและบันทึกกิจกรรมการออกกำลังกายของคุณเพื่อสุขภาพที่ดี</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={loadExerciseLogsFromBackend}
              disabled={isLoadingFromBackend}
              className="gap-2 h-10 border-primary/20 hover:border-primary/40"
            >
              <svg className={`h-4 w-4 ${isLoadingFromBackend ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isLoadingFromBackend ? 'กำลังโหลด...' : 'รีเฟรช'}
            </Button>
                         
            <Button 
              onClick={() => setShowForm(!showForm)} 
              className="gap-2 h-10 bg-primary hover:bg-primary/90 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              เพิ่มการออกกำลังกาย
            </Button>
          </div>
        </div>

                 {showForm && (
           <Card className="border-l-4 border-l-primary/20 shadow-sm">
             <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
               <CardTitle className="flex items-center gap-2 text-primary">
                 <Activity className="h-5 w-5" />
                 {editingId ? 'แก้ไขข้อมูลการออกกำลังกาย' : 'บันทึกการออกกำลังกายใหม่'}
               </CardTitle>
               <CardDescription className="text-muted-foreground">
                 {editingId ? 'ปรับปรุงข้อมูลการออกกำลังกายของคุณ' : 'กรอกข้อมูลการออกกำลังกายเพื่อติดตามความคืบหน้า'}
               </CardDescription>
             </CardHeader>
             <CardContent className="pt-6">
               <form onSubmit={editingId ? handleUpdate : handleSubmit} className="space-y-6">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-3">
                     <Label htmlFor="date" className="flex items-center gap-2 text-sm font-medium">
                       <Calendar className="h-4 w-4 text-primary" />
                       วันที่ออกกำลังกาย
                     </Label>
                     <Input
                       id="date"
                       type="date"
                       value={formData.exercise_date}
                       onChange={(e) => {
                         console.log('📅 เปลี่ยนวันที่:', e.target.value);
                         setFormData({...formData, exercise_date: e.target.value});
                       }}
                       className="h-11 border-primary/20 focus:border-primary/40"
                       required
                     />
                   </div>

                                     <div className="space-y-3">
                     <Label htmlFor="exercise_type" className="flex items-center gap-2 text-sm font-medium">
                       <Target className="h-4 w-4 text-primary" />
                       ประเภทการออกกำลังกาย
                     </Label>
                     <Select 
                       value={formData.exercise_type} 
                       onValueChange={(value) => {
                         console.log('🏃‍♂️ เปลี่ยนประเภทการออกกำลังกาย:', value);
                         setFormData({...formData, exercise_type: value});
                         // คำนวณแคลอรี่อัตโนมัติ
                         updateCaloriesAutomatically(value, formData.duration_minutes, formData.intensity, formData.distance_km);
                       }}
                     >
                       <SelectTrigger className="h-11 border-primary/20 focus:border-primary/40">
                         <SelectValue placeholder="เลือกประเภทการออกกำลังกาย" />
                       </SelectTrigger>
                       <SelectContent>
                         {exerciseTypes.map((type) => (
                           <SelectItem key={type.label} value={type.label} className="py-2">
                             <div className="flex items-center gap-2">
                               <Dumbbell className="h-4 w-4 text-primary/60" />
                               {type.label}
                             </div>
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>

                                     <div className="space-y-3">
                     <Label htmlFor="duration" className="flex items-center gap-2 text-sm font-medium">
                       <Timer className="h-4 w-4 text-primary" />
                       ระยะเวลา (นาที)
                     </Label>
                     <Input
                       id="duration"
                       type="number"
                       placeholder="30"
                       value={formData.duration_minutes}
                       onChange={(e) => {
                         console.log('⏱️ เปลี่ยนระยะเวลา:', e.target.value);
                         setFormData({...formData, duration_minutes: e.target.value});
                         // คำนวณแคลอรี่อัตโนมัติ
                         updateCaloriesAutomatically(formData.exercise_type, e.target.value, formData.intensity, formData.distance_km);
                       }}
                       className="h-11 border-primary/20 focus:border-primary/40"
                       required
                     />
                   </div>

                                     <div className="space-y-3">
                     <Label htmlFor="intensity" className="flex items-center gap-2 text-sm font-medium">
                       <Zap className="h-4 w-4 text-primary" />
                       ระดับความหนัก
                     </Label>
                     <Select 
                       value={formData.intensity} 
                       onValueChange={(value) => {
                         console.log('💪 เปลี่ยนระดับความหนัก:', value);
                         setFormData({...formData, intensity: value});
                         // คำนวณแคลอรี่อัตโนมัติ
                         updateCaloriesAutomatically(formData.exercise_type, formData.duration_minutes, value, formData.distance_km);
                       }}
                     >
                       <SelectTrigger className="h-11 border-primary/20 focus:border-primary/40">
                         <SelectValue placeholder="เลือกระดับความหนัก" />
                       </SelectTrigger>
                       <SelectContent>
                         {intensityLevels.map((level) => (
                           <SelectItem key={level.label} value={level.label} className="py-2">
                             <div className="flex items-center gap-2">
                               <div className={`w-3 h-3 rounded-full ${level.color}`}></div>
                               {level.label}
                             </div>
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>

                                     <div className="space-y-3">
                     <Label htmlFor="calories" className="flex items-center gap-2 text-sm font-medium">
                       <Flame className="h-4 w-4 text-primary" />
                       แคลอรีที่เผาผลาญ
                     </Label>
                     <div className="space-y-3">
                       <Input
                         id="calories"
                         type="number"
                         placeholder="250"
                         value={formData.calories_burned}
                         onChange={(e) => {
                           console.log('🔥 เปลี่ยนแคลอรี:', e.target.value);
                           setFormData({...formData, calories_burned: e.target.value});
                         }}
                         className="h-11 border-primary/20 focus:border-primary/40"
                       />
                       <div className="flex items-center gap-3">
                         <Button
                           type="button"
                           variant="outline"
                           size="sm"
                           onClick={() => {
                             if (formData.exercise_type && formData.duration_minutes && formData.intensity) {
                               const calculatedCalories = calculateTotalCalories(
                                 formData.exercise_type, 
                                 Number(formData.duration_minutes), 
                                 formData.intensity,
                                 formData.distance_km ? Number(formData.distance_km) : undefined
                               );
                               setFormData(prev => ({ ...prev, calories_burned: calculatedCalories.toString() }));
                             }
                           }}
                           disabled={!formData.exercise_type || !formData.duration_minutes || !formData.intensity}
                           className="text-xs h-8 px-3 border-primary/30 hover:border-primary/50"
                         >
                           <Flame className="h-3 w-3 mr-1" />
                           คำนวณอัตโนมัติ
                         </Button>
                         {formData.exercise_type && formData.duration_minutes && formData.intensity && (
                           <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                             💡 {distanceBasedExercises.includes(formData.exercise_type) && formData.distance_km ? (
                               <>
                                 {formData.exercise_type}: {formData.distance_km} กม. × {intensityLevels.find(l => l.label === formData.intensity)?.multiplier || 1.3} = {calculateTotalCalories(formData.exercise_type, Number(formData.duration_minutes), formData.intensity, Number(formData.distance_km))} แคล
                               </>
                             ) : (
                               <>
                                 {getCaloriesPerMinute(formData.exercise_type, formData.intensity)} แคล/นาที × {formData.duration_minutes} นาที = {calculateTotalCalories(formData.exercise_type, Number(formData.duration_minutes), formData.intensity)} แคล
                               </>
                             )}
                           </div>
                         )}
                       </div>
                     </div>
                   </div>
                </div>

                {/* รายละเอียดเฉพาะตามประเภท */}
                {formData.exercise_type === "ยกน้ำหนัก" && (
                  <div className="space-y-3">
                    <Label>รายละเอียดการยกน้ำหนัก</Label>
                    <div className="space-y-3">
                      {weightExercises.map((ex, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                          <div className="space-y-1">
                            <Label htmlFor={`ex-name-${idx}`}>ท่า</Label>
                            <Input id={`ex-name-${idx}`} value={ex.name} onChange={(e) => updateWeightExercise(idx, 'name', e.target.value)} placeholder="เช่น Bench Press" />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`ex-sets-${idx}`}>เซ็ต</Label>
                            <Input id={`ex-sets-${idx}`} type="number" value={ex.sets} onChange={(e) => updateWeightExercise(idx, 'sets', e.target.value)} placeholder="3" />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`ex-reps-${idx}`}>ครั้ง/เซ็ต</Label>
                            <Input id={`ex-reps-${idx}`} type="number" value={ex.reps} onChange={(e) => updateWeightExercise(idx, 'reps', e.target.value)} placeholder="10" />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`ex-weight-${idx}`}>น้ำหนัก (กก.)</Label>
                            <Input id={`ex-weight-${idx}`} type="number" value={ex.weight} onChange={(e) => updateWeightExercise(idx, 'weight', e.target.value)} placeholder="40" />
                          </div>
                          <div className="flex items-end gap-2">
                            <div className="w-full space-y-1">
                              <Label htmlFor={`ex-rpe-${idx}`}>RPE</Label>
                              <Input id={`ex-rpe-${idx}`} type="number" value={ex.rpe} onChange={(e) => updateWeightExercise(idx, 'rpe', e.target.value)} placeholder="7" />
                            </div>
                            <Button type="button" variant="outline" onClick={() => removeWeightExercise(idx)}>ลบ</Button>
                          </div>
                        </div>
                      ))}
                      <Button type="button" variant="secondary" onClick={addWeightExercise} className="gap-2">
                        <Plus className="h-4 w-4" />
                        เพิ่มท่า
                      </Button>
                    </div>
                  </div>
                )}

                {distanceBasedExercises.includes(formData.exercise_type) && (
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      <MapPin className="h-4 w-4" />
                      ข้อมูลระยะทาง
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="distance_km" className="text-sm font-medium">
                        ระยะทาง (กิโลเมตร)
                      </Label>
                      <Input
                        id="distance_km"
                        type="number"
                        placeholder="5"
                        value={formData.distance_km}
                        onChange={(e) => {
                          setFormData({ ...formData, distance_km: e.target.value });
                          // คำนวณแคลอรี่อัตโนมัติเมื่อเปลี่ยนระยะทาง
                          updateCaloriesAutomatically(formData.exercise_type, formData.duration_minutes, formData.intensity, e.target.value);
                        }}
                        className="h-11 border-primary/20 focus:border-primary/40"
                      />
                      <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded-md border border-blue-200">
                        💡 ระยะทางจะช่วยให้การคำนวณแคลอรี่แม่นยำขึ้น
                      </div>
                    </div>
                  </div>
                )}

                                 <div className="space-y-3">
                   <Label htmlFor="notes" className="flex items-center gap-2 text-sm font-medium">
                     <Activity className="h-4 w-4 text-primary" />
                     หมายเหตุ
                   </Label>
                   <Textarea
                     id="notes"
                     placeholder="รายละเอียดเพิ่มเติม เช่น ความรู้สึก, สภาพอากาศ, หรือเทคนิคที่ใช้..."
                     value={formData.notes}
                     onChange={(e) => {
                       console.log('📝 เปลี่ยนหมายเหตุ:', e.target.value);
                       setFormData({...formData, notes: e.target.value});
                     }}
                     className="min-h-[80px] border-primary/20 focus:border-primary/40 resize-none"
                   />
                 </div>

                                                  <div className="flex gap-3 pt-4 border-t border-border/50">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          {editingId ? 'กำลังอัปเดต...' : 'กำลังบันทึก...'}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          {editingId ? 'อัปเดตข้อมูล' : 'บันทึกการออกกำลังกาย'}
                        </div>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                        // รีเซ็ตฟอร์ม
                        setFormData({
                          exercise_name: "",
                          exercise_type: "",
                          duration_minutes: "",
                          intensity: "",
                          calories_burned: "",
                          distance_km: "",
                          sets: "",
                          reps: "",
                          weight_kg: "",
                          notes: "",
                          exercise_date: new Date().toISOString().split('T')[0],
                          exercise_time: new Date().toTimeString().split(' ')[0]
                        });
                      }}
                      className="h-11 px-6 border-primary/20 hover:border-primary/40"
                    >
                      ยกเลิก
                    </Button>
                  </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* สรุปการเผาผลาญแคลอรี่ */}
        <Card className="health-stat-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5" />
                  สรุปการเผาผลาญแคลอรี่
                </CardTitle>
                <CardDescription>
                  ข้อมูลการออกกำลังกายและแคลอรี่ที่เผาผลาญ
                  {selectedPeriod === 'today' && ' วันนี้'}
                  {selectedPeriod === 'week' && ' สัปดาห์นี้'}
                  {selectedPeriod === 'month' && ' เดือนนี้'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="period-select" className="text-sm font-medium">ช่วงเวลา:</Label>
                <Select value={selectedPeriod} onValueChange={(value: 'today' | 'week' | 'month') => setSelectedPeriod(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">วันนี้</SelectItem>
                    <SelectItem value="week">สัปดาห์นี้</SelectItem>
                    <SelectItem value="month">เดือนนี้</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* แคลอรี่รวม */}
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 rounded-2xl border border-orange-200 shadow-lg">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full w-16 h-16 mx-auto mb-4 shadow-lg">
                  <Flame className="h-8 w-8 mx-auto text-white" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                  {currentExerciseStats.totalCalories}
                </div>
                <div className="text-lg font-semibold text-gray-700 mb-1">แคลอรี่</div>
                <div className="text-sm text-gray-600">เผาผลาญรวม</div>
              </div>

              {/* จำนวนครั้ง */}
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-200 shadow-lg">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-16 h-16 mx-auto mb-4 shadow-lg">
                  <Activity className="h-8 w-8 mx-auto text-white" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {currentExerciseStats.totalSessions}
                </div>
                <div className="text-lg font-semibold text-gray-700 mb-1">ครั้ง</div>
                <div className="text-sm text-gray-600">การออกกำลังกาย</div>
              </div>

              {/* ระยะเวลารวม */}
              <div className="text-center p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl border border-green-200 shadow-lg">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-16 h-16 mx-auto mb-4 shadow-lg">
                  <Clock className="h-8 w-8 mx-auto text-white" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                  {currentExerciseStats.totalDuration}
                </div>
                <div className="text-lg font-semibold text-gray-700 mb-1">นาที</div>
                <div className="text-sm text-gray-600">ระยะเวลารวม</div>
              </div>

              {/* ค่าเฉลี่ยต่อครั้ง */}
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-2xl border border-purple-200 shadow-lg">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-16 h-16 mx-auto mb-4 shadow-lg">
                  <Target className="h-8 w-8 mx-auto text-white" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  {currentExerciseStats.averageCalories}
                </div>
                <div className="text-lg font-semibold text-gray-700 mb-1">แคลอรี่</div>
                <div className="text-sm text-gray-600">เฉลี่ยต่อครั้ง</div>
              </div>
            </div>

            {/* สถิติเพิ่มเติม */}
            {currentExerciseStats.totalSessions > 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ประเภทการออกกำลังกาย */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <Dumbbell className="h-5 w-5" />
                    ประเภทการออกกำลังกาย
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(currentExerciseStats.exerciseTypes).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="font-medium">{type}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {count} ครั้ง
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ระดับความหนัก */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    ระดับความหนัก
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(currentExerciseStats.intensityDistribution).map(([intensity, count]) => (
                      <div key={intensity} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="font-medium">{intensity}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {count} ครั้ง
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ข้อความเมื่อไม่มีข้อมูล */}
            {currentExerciseStats.totalSessions === 0 && (
              <div className="text-center p-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-300">
                <div className="p-4 bg-white rounded-full w-20 h-20 mx-auto mb-6 shadow-lg">
                  <Activity className="h-10 w-10 mx-auto text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">ยังไม่มีข้อมูลการออกกำลังกาย</h3>
                <p className="text-gray-600 mb-6">
                  {selectedPeriod === 'today' && 'เริ่มต้นออกกำลังกายวันนี้เพื่อติดตามแคลอรี่ที่เผาผลาญ'}
                  {selectedPeriod === 'week' && 'ยังไม่มีข้อมูลการออกกำลังกายในสัปดาห์นี้'}
                  {selectedPeriod === 'month' && 'ยังไม่มีข้อมูลการออกกำลังกายในเดือนนี้'}
                </p>
                <Button 
                  onClick={() => setShowForm(true)} 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่มการออกกำลังกาย
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">ประวัติการออกกำลังกาย</h2>
            {sessions.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-primary/20">
                {sessions.length} รายการ
              </Badge>
            )}
          </div>
          
          {sessions.length === 0 ? (
            <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
              <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center gap-6">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Dumbbell className="h-12 w-12 text-primary/60" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">ยังไม่มีข้อมูลการออกกำลังกาย</h3>
                    <p className="text-muted-foreground max-w-md">
                      เริ่มต้นบันทึกการออกกำลังกายของคุณเพื่อติดตามความคืบหน้าและสร้างแรงบันดาลใจในการดูแลสุขภาพ
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowForm(true)} 
                    className="gap-2 h-11 px-6 bg-primary hover:bg-primary/90 shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    เพิ่มการออกกำลังกายแรก
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sessions.map((session) => (
                <Card key={session.session_id} className="hover:shadow-md transition-shadow duration-200 border-primary/10">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <Dumbbell className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg text-foreground">{session.exercise_type}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(session.session_date).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    
                                         <div className="flex items-center gap-3">
                       <Badge 
                         className={`${
                           intensityLevels.find(l => l.value === session.intensity_level)?.color || 'bg-gray-500'
                         } text-white px-3 py-1`}
                       >
                         {session.intensity_level}
                       </Badge>
                       
                       {/* แสดงสถานะการลบได้ */}
                       {!session.backend_id && (
                         <Badge variant="secondary" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                           ⚠️ รีเฟรชก่อนลบ
                         </Badge>
                       )}
                       
                       <Button 
                         variant="outline" 
                         size="sm" 
                         onClick={() => startEdit(session)}
                         className="h-8 px-3 border-primary/20 hover:border-primary/40"
                       >
                         แก้ไข
                       </Button>
                       <AlertDialog>
                         <AlertDialogTrigger asChild>
                           <Button 
                             variant="destructive" 
                             size="sm" 
                             disabled={deletingId === session.session_id || !session.backend_id}
                             title={!session.backend_id ? 'กรุณารีเฟรชก่อนลบข้อมูล' : 'ลบข้อมูล'}
                             className="h-8 px-3"
                           >
                             {deletingId === session.session_id ? 'กำลังลบ...' : 'ลบ'}
                           </Button>
                         </AlertDialogTrigger>
                         <AlertDialogContent>
                           <AlertDialogHeader>
                             <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                             <AlertDialogDescription>
                               {!session.backend_id 
                                 ? 'ข้อมูลนี้ยังไม่พร้อมสำหรับการลบ กรุณารีเฟรชหน้าเพื่อโหลดข้อมูลจาก Backend'
                                 : 'ต้องการลบรายการนี้หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้'
                               }
                             </AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter>
                             <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                             {session.backend_id && (
                               <AlertDialogAction 
                                 onClick={() => deleteSession(session)}
                                 disabled={deletingId === session.session_id}
                               >
                                 {deletingId === session.session_id ? 'กำลังลบ...' : 'ลบ'}
                               </AlertDialogAction>
                             )}
                           </AlertDialogFooter>
                         </AlertDialogContent>
                       </AlertDialog>
                     </div>
                  </div>
                  
                                     <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-4">
                     <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                       <div className="p-1.5 bg-blue-100 rounded-md">
                         <Clock className="h-4 w-4 text-blue-600" />
                       </div>
                       <div>
                         <p className="text-sm font-medium text-foreground">{session.duration_minutes} นาที</p>
                         <p className="text-xs text-muted-foreground">ระยะเวลา</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                       <div className="p-1.5 bg-orange-100 rounded-md">
                         <Flame className="h-4 w-4 text-orange-600" />
                       </div>
                       <div>
                         <p className="text-sm font-medium text-foreground">{session.calories_burned} แคล</p>
                         <p className="text-xs text-muted-foreground">เผาผลาญ</p>
                       </div>
                     </div>
                     
                     {/* แสดงข้อมูลยกน้ำหนักถ้ามี */}
                     {session.exercise_type === "ยกน้ำหนัก" && session.sets && session.reps && session.weight_kg && (
                       <>
                         <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                           <div className="p-1.5 bg-purple-100 rounded-md">
                             <Dumbbell className="h-4 w-4 text-purple-600" />
                           </div>
                           <div>
                             <p className="text-sm font-medium text-foreground">{session.sets} เซ็ต x {session.reps} ครั้ง</p>
                             <p className="text-xs text-muted-foreground">การฝึก</p>
                           </div>
                         </div>
                         <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                           <div className="p-1.5 bg-green-100 rounded-md">
                             <Target className="h-4 w-4 text-green-600" />
                           </div>
                           <div>
                             <p className="text-sm font-medium text-foreground">{session.weight_kg} กก.</p>
                             <p className="text-xs text-muted-foreground">น้ำหนัก</p>
                           </div>
                         </div>
                       </>
                     )}
                   </div>
                  
                  {session.notes && (
                    <div className="mt-4 p-3 bg-primary/5 border border-primary/10 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Activity className="h-4 w-4 text-primary/60 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-foreground leading-relaxed">{session.notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}