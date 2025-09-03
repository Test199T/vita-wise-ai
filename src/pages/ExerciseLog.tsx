import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Clock, Flame, Plus, Calendar } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import type { ExerciseLog } from "@/services/api";
import { tokenUtils } from "@/lib/utils";

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
    { label: "ต่ำ", value: "low", color: "bg-green-500" },
    { label: "ปานกลาง", value: "moderate", color: "bg-yellow-500" },
    { label: "สูง", value: "high", color: "bg-red-500" },
    { label: "สูงมาก", value: "very_high", color: "bg-red-700" }
  ];

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
          <div>
            <h1 className="text-3xl font-bold text-primary">บันทึกการออกกำลังกาย</h1>
            <p className="text-muted-foreground">ติดตามและบันทึกกิจกรรมการออกกำลังกายของคุณ</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={loadExerciseLogsFromBackend}
              disabled={isLoadingFromBackend}
              className="gap-2"
            >
              <svg className={`h-4 w-4 ${isLoadingFromBackend ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isLoadingFromBackend ? 'กำลังโหลด...' : 'รีเฟรช'}
            </Button>
                         
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              <Plus className="h-4 w-4" />
              เพิ่มการออกกำลังกาย
            </Button>
          </div>
        </div>

                 {showForm && (
           <Card>
             <CardHeader>
               <CardTitle>
                 {editingId ? 'แก้ไขข้อมูลการออกกำลังกาย' : 'บันทึกการออกกำลังกายใหม่'}
               </CardTitle>
             </CardHeader>
             <CardContent>
               <form onSubmit={editingId ? handleUpdate : handleSubmit} className="space-y-4">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="date">วันที่</Label>
                     <Input
                       id="date"
                       type="date"
                       value={formData.exercise_date}
                       onChange={(e) => {
                         console.log('📅 เปลี่ยนวันที่:', e.target.value);
                         setFormData({...formData, exercise_date: e.target.value});
                       }}
                       required
                     />
                   </div>

                                     <div className="space-y-2">
                     <Label htmlFor="exercise_type">ประเภทการออกกำลังกาย</Label>
                     <Select 
                       value={formData.exercise_type} 
                       onValueChange={(value) => {
                         console.log('🏃‍♂️ เปลี่ยนประเภทการออกกำลังกาย:', value);
                         setFormData({...formData, exercise_type: value});
                       }}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="เลือกประเภท" />
                       </SelectTrigger>
                       <SelectContent>
                         {exerciseTypes.map((type) => (
                           <SelectItem key={type.label} value={type.label}>{type.label}</SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>

                                     <div className="space-y-2">
                     <Label htmlFor="duration">ระยะเวลา (นาที)</Label>
                     <Input
                       id="duration"
                       type="number"
                       placeholder="30"
                       value={formData.duration_minutes}
                       onChange={(e) => {
                         console.log('⏱️ เปลี่ยนระยะเวลา:', e.target.value);
                         setFormData({...formData, duration_minutes: e.target.value});
                       }}
                       required
                     />
                   </div>

                                     <div className="space-y-2">
                     <Label htmlFor="intensity">ระดับความหนัก</Label>
                     <Select 
                       value={formData.intensity} 
                       onValueChange={(value) => {
                         console.log('💪 เปลี่ยนระดับความหนัก:', value);
                         setFormData({...formData, intensity: value});
                       }}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="เลือกระดับ" />
                       </SelectTrigger>
                       <SelectContent>
                         {intensityLevels.map((level) => (
                           <SelectItem key={level.label} value={level.label}>{level.label}</SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>

                                     <div className="space-y-2">
                     <Label htmlFor="calories">แคลอรีที่เผาผลาญ</Label>
                     <Input
                       id="calories"
                       type="number"
                       placeholder="250"
                       value={formData.calories_burned}
                       onChange={(e) => {
                         console.log('🔥 เปลี่ยนแคลอรี:', e.target.value);
                         setFormData({...formData, calories_burned: e.target.value});
                       }}
                     />
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

                {cardioTypes.includes(formData.exercise_type) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="distance_km">ระยะทาง (กม.)</Label>
                      <Input
                        id="distance_km"
                        type="number"
                        placeholder="5"
                        value={formData.distance_km}
                        onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
                      />
                    </div>
                    
                  </div>
                )}

                                 <div className="space-y-2">
                   <Label htmlFor="notes">หมายเหตุ</Label>
                   <Textarea
                     id="notes"
                     placeholder="รายละเอียดเพิ่มเติม..."
                     value={formData.notes}
                     onChange={(e) => {
                       console.log('📝 เปลี่ยนหมายเหตุ:', e.target.value);
                       setFormData({...formData, notes: e.target.value});
                     }}
                   />
                 </div>

                                                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting 
                        ? (editingId ? 'กำลังอัปเดต...' : 'กำลังบันทึก...') 
                        : (editingId ? 'อัปเดต' : 'บันทึก')
                      }
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
                    >
                      ยกเลิก
                    </Button>
                  </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          <h2 className="text-xl font-semibold">ประวัติการออกกำลังกาย</h2>
          
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <Dumbbell className="h-16 w-16 text-muted-foreground/50" />
                  <div>
                    <h3 className="text-lg font-medium text-muted-foreground">ไม่มีข้อมูลการออกกำลังกาย</h3>
                    <p className="text-sm text-muted-foreground">เริ่มต้นบันทึกการออกกำลังกายของคุณเพื่อติดตามความคืบหน้า</p>
                  </div>
                  <Button onClick={() => setShowForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    เพิ่มการออกกำลังกายแรก
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            sessions.map((session) => (
              <Card key={session.session_id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Dumbbell className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{session.exercise_type}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(session.session_date).toLocaleDateString('th-TH')}
                        </div>
                      </div>
                    </div>
                    
                                         <div className="flex items-center gap-2">
                       <Badge 
                         className={`${
                           intensityLevels.find(l => l.value === session.intensity_level)?.color || 'bg-gray-500'
                         } text-white`}
                       >
                         {session.intensity_level}
                       </Badge>
                       
                       {/* แสดงสถานะการลบได้ */}
                       {!session.backend_id && (
                         <Badge variant="secondary" className="text-xs">
                           ⚠️ รีเฟรชก่อนลบ
                         </Badge>
                       )}
                       
                       <Button variant="outline" size="sm" onClick={() => startEdit(session)}>แก้ไข</Button>
                       <AlertDialog>
                         <AlertDialogTrigger asChild>
                           <Button 
                             variant="destructive" 
                             size="sm" 
                             disabled={deletingId === session.session_id || !session.backend_id}
                             title={!session.backend_id ? 'กรุณารีเฟรชก่อนลบข้อมูล' : 'ลบข้อมูล'}
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
                  
                                     <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                     <div className="flex items-center gap-2">
                       <Clock className="h-4 w-4 text-muted-foreground" />
                       <span className="text-sm">{session.duration_minutes} นาที</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <Flame className="h-4 w-4 text-orange-500" />
                       <span className="text-sm">{session.calories_burned} แคล</span>
                     </div>
                     
                     {/* แสดงข้อมูลยกน้ำหนักถ้ามี */}
                     {session.exercise_type === "ยกน้ำหนัก" && session.sets && session.reps && session.weight_kg && (
                       <>
                         <div className="flex items-center gap-2">
                           <Dumbbell className="h-4 w-4 text-blue-500" />
                           <span className="text-sm">{session.sets} เซ็ต x {session.reps} ครั้ง</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <span className="text-sm font-medium">น้ำหนัก: {session.weight_kg} กก.</span>
                         </div>
                       </>
                     )}
                   </div>
                  
                  {session.notes && (
                    <div className="mt-3 p-2 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">{session.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}