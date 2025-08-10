import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Clock, Flame, Plus, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExerciseSession {
  session_id: string;
  session_date: string;
  exercise_type: string;
  duration_minutes: number;
  intensity_level: string;
  calories_burned: number;
  notes: string;
}

export default function ExerciseLog() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [sessions] = useState<ExerciseSession[]>([
    {
      session_id: "1",
      session_date: "2024-01-01",
      exercise_type: "วิ่ง",
      duration_minutes: 30,
      intensity_level: "ปานกลาง",
      calories_burned: 250,
      notes: "วิ่งในสวน อากาศดี"
    },
    {
      session_id: "2", 
      session_date: "2024-01-02",
      exercise_type: "ยกน้ำหนัก",
      duration_minutes: 45,
      intensity_level: "สูง",
      calories_burned: 180,
      notes: "เน้นกล้ามเนื้อแขน"
    }
  ]);

  const [formData, setFormData] = useState({
    session_date: new Date().toISOString().split('T')[0],
    exercise_type: "",
    duration_minutes: "",
    intensity_level: "",
    calories_burned: "",
    distance_km: "",
    avg_pace_min_per_km: "",
    notes: ""
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
    "วิ่ง", "เดิน", "ขี่จักรยาน", "ว่ายน้ำ", "ยกน้ำหนัก", 
    "โยคะ", "พิลาทิส", "เต้นรำ", "มวยไทย", "อื่นๆ"
  ];

  const intensityLevels = [
    { value: "ต่ำ", color: "bg-green-500" },
    { value: "ปานกลาง", color: "bg-yellow-500" },
    { value: "สูง", color: "bg-red-500" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "บันทึกสำเร็จ",
      description: "บันทึกการออกกำลังกายเรียบร้อยแล้ว"
    });
    setShowForm(false);
    setFormData({
      session_date: new Date().toISOString().split('T')[0],
      exercise_type: "",
      duration_minutes: "",
      intensity_level: "",
      calories_burned: "",
      distance_km: "",
      avg_pace_min_per_km: "",
      notes: ""
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">บันทึกการออกกำลังกาย</h1>
            <p className="text-muted-foreground">ติดตามและบันทึกกิจกรรมการออกกำลังกายของคุณ</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            เพิ่มการออกกำลังกาย
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>บันทึกการออกกำลังกายใหม่</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">วันที่</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.session_date}
                      onChange={(e) => setFormData({...formData, session_date: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exercise_type">ประเภทการออกกำลังกาย</Label>
                    <Select value={formData.exercise_type} onValueChange={(value) => setFormData({...formData, exercise_type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภท" />
                      </SelectTrigger>
                      <SelectContent>
                        {exerciseTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
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
                      onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="intensity">ระดับความหนัก</Label>
                    <Select value={formData.intensity_level} onValueChange={(value) => setFormData({...formData, intensity_level: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกระดับ" />
                      </SelectTrigger>
                      <SelectContent>
                        {intensityLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>{level.value}</SelectItem>
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
                      onChange={(e) => setFormData({...formData, calories_burned: e.target.value})}
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
                    <div className="space-y-2">
                      <Label htmlFor="avg_pace_min_per_km">เพซเฉลี่ย (นาที/กม.)</Label>
                      <Input
                        id="avg_pace_min_per_km"
                        type="text"
                        placeholder="6:30"
                        value={formData.avg_pace_min_per_km}
                        onChange={(e) => setFormData({ ...formData, avg_pace_min_per_km: e.target.value })}
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
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">บันทึก</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    ยกเลิก
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          <h2 className="text-xl font-semibold">ประวัติการออกกำลังกาย</h2>
          {sessions.map((session) => (
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
                  
                  <div className="flex items-center gap-4">
                    <Badge 
                      className={`${
                        intensityLevels.find(l => l.value === session.intensity_level)?.color || 'bg-gray-500'
                      } text-white`}
                    >
                      {session.intensity_level}
                    </Badge>
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
                </div>
                
                {session.notes && (
                  <div className="mt-3 p-2 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground">{session.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}