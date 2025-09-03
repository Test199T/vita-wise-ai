import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowRight, 
  ArrowLeft, 
  SkipForward, 
  Target, 
  Heart, 
  Activity, 
  Clock, 
  CheckCircle,
  User,
  Ruler,
  Scale,
  Dumbbell,
  Moon,
  Utensils,
  AlertTriangle,
  Pill
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { apiService } from "@/services/api"; // เพิ่ม import API service
import { tokenUtils } from "@/lib/utils";

interface OnboardingData {
  // Step 1: Health Goals
  healthGoal: string;
  timeline: number;
  motivation: string;
  
  // Step 2: Basic Body Info
  firstName: string;
  lastName: string;
  height: number;
  weight: number;
  waist: number;
  bloodPressure: string;
  bloodSugar: string;
  // Added for BMR/TDEE
  sex: 'male' | 'female';
  birthDate: string;
  
  // Step 3: Lifestyle
  exerciseFrequency: string;
  sleepHours: number;
  mealsPerDay: number;
  smoking: boolean;
  alcoholFrequency: string;
  // Added for BMR/TDEE
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
  
  // Step 4: Medical History
  medicalConditions: string[];
  surgeries: string;
  allergies: string;
  
  // เพิ่มข้อมูล lifestyle ที่ขาดหายไป
  waterIntakeGlasses: number;
  otherLifestyleNotes: string;
  caffeineCupsPerDay: number;
  screenTimeHours: string;
  stressLevel: string;
  relaxationFrequency: string;
  lateMealFrequency: string;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { onboardingData, updateOnboardingData, completeOnboarding } = useOnboarding();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  
  // ตรวจสอบว่าผู้ใช้ล็อกอินแล้วหรือไม่
  React.useEffect(() => {
    // เพิ่มการตรวจสอบที่เหมาะสมมากขึ้น
    const checkAuth = () => {
      if (!tokenUtils.isLoggedIn()) {
        console.log('🚫 Onboarding: ผู้ใช้ไม่ได้เข้าสู่ระบบ - เปลี่ยนไปยังหน้า login');
        navigate('/login');
        return;
      }
    };

    // ตรวจสอบทันที
    checkAuth();

    // ตรวจสอบทุก 30 วินาที (ลดความเข้มงวด)
    const interval = setInterval(checkAuth, 30000);

    return () => clearInterval(interval);
  }, [navigate]);
  
  // รับข้อมูลจาก Register และ merge กับ onboardingData
  const registrationData = location.state?.registrationData;
  const [data, setData] = useState<OnboardingData>(() => {
    if (registrationData) {
      // ถ้ามีข้อมูลจาก Register ให้ merge เข้าไป
      const mergedData = {
        ...onboardingData,
        firstName: registrationData.firstName || onboardingData.firstName || '',
        lastName: registrationData.lastName || onboardingData.lastName || '',
        sex: registrationData.gender === 'other' ? 'male' : (registrationData.gender as 'male' | 'female') || onboardingData.sex,
        // คำนวณวันเกิดจากอายุ (ประมาณ)
        birthDate: registrationData.age ? 
          new Date(new Date().getFullYear() - registrationData.age, 0, 1).toISOString().split('T')[0] : 
          onboardingData.birthDate
      };
      
      console.log('🔗 Initial merged data:', mergedData);
      console.log('📝 Registration data used:', {
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        gender: registrationData.gender,
        age: registrationData.age
      });
      
      return mergedData;
    }
    return onboardingData;
  });

  // ใช้ useEffect เพื่ออัพเดท context หลังจาก component mount
  const [hasUpdatedContext, setHasUpdatedContext] = React.useState(false);
  
  // ตรวจสอบ Token ทันทีเมื่อ component mount
  React.useEffect(() => {
    console.log('🔍 ตรวจสอบ Token เมื่อ component mount:');
    console.log('localStorage token:', localStorage.getItem('token'));
    console.log('localStorage accessToken:', localStorage.getItem('accessToken'));
    console.log('sessionStorage token:', sessionStorage.getItem('token'));
    console.log('sessionStorage accessToken:', sessionStorage.getItem('accessToken'));
    console.log('registrationData:', registrationData);
  }, [registrationData]);
  
  React.useEffect(() => {
    if (registrationData && !onboardingData.isCompleted && !hasUpdatedContext) {
      console.log('🔄 Merging registration data with onboarding data...');
      console.log('📝 Registration data:', registrationData);
      console.log('📝 Current onboarding data:', onboardingData);
      
      // อัพเดท context ด้วยข้อมูลจาก Register เพียงครั้งเดียว
      const mergedData = {
        ...onboardingData,
        firstName: registrationData.firstName || onboardingData.firstName || '',
        lastName: registrationData.lastName || onboardingData.lastName || '',
        sex: registrationData.gender === 'other' ? 'male' : (registrationData.gender as 'male' | 'female') || onboardingData.sex,
        birthDate: registrationData.age ? 
          new Date(new Date().getFullYear() - registrationData.age, 0, 1).toISOString().split('T')[0] : 
          onboardingData.birthDate
      };
      
      console.log('🔗 Merged data:', mergedData);
      
             // อัพเดท context เพียงครั้งเดียว
       Object.keys(mergedData).forEach(key => {
         const newValue = mergedData[key as keyof OnboardingData];
         const oldValue = onboardingData[key as keyof OnboardingData];
         
         if (newValue !== oldValue) {
           console.log(`🔄 Updating ${key}: ${oldValue} -> ${newValue}`);
           updateOnboardingData(key as keyof OnboardingData, newValue);
         } else {
           console.log(`⏭️ No change for ${key}: ${oldValue}`);
         }
       });
       
       // เพิ่มข้อมูลชื่อจาก registrationData เพื่อให้ API service สามารถเข้าถึงได้
       if (registrationData.firstName) {
         updateOnboardingData('registrationFirstName' as keyof OnboardingData, registrationData.firstName);
         console.log('✅ Added registrationFirstName to context:', registrationData.firstName);
       }
       if (registrationData.lastName) {
         updateOnboardingData('registrationLastName' as keyof OnboardingData, registrationData.lastName);
         console.log('✅ Added registrationLastName to context:', registrationData.lastName);
       }
       
       // อัพเดท local state ด้วยข้อมูลที่ merge แล้ว
       setData(prevData => {
         const updatedData = { ...prevData, ...mergedData };
         console.log('🔄 Updated local state with merged data:', updatedData);
         return updatedData;
       });
      
      // มาร์คว่าได้อัพเดท context แล้ว
      setHasUpdatedContext(true);
      console.log('✅ อัพเดท context และ local state ด้วยข้อมูลจาก Register เรียบร้อยแล้ว');
    }
  }, [registrationData, hasUpdatedContext, onboardingData, updateOnboardingData]); // เพิ่ม dependencies ที่จำเป็น

  const steps = [
    { title: "ยินดีต้อนรับ", icon: Heart },
    { title: "ข้อมูลส่วนตัว", icon: User },
    { title: "เป้าหมายสุขภาพ", icon: Target },
    { title: "ข้อมูลร่างกาย", icon: Ruler },
    { title: "พฤติกรรมประจำวัน", icon: Activity },
    { title: "ประวัติสุขภาพ", icon: AlertTriangle },
    { title: "สรุป", icon: CheckCircle }
  ];

  const healthGoals = [
    { value: "weight-loss", label: "ลดน้ำหนัก", icon: Scale },
    { value: "muscle-gain", label: "เพิ่มกล้ามเนื้อ", icon: Dumbbell },
    { value: "healthy-diet", label: "คุมอาหารเพื่อสุขภาพ", icon: Utensils },
    { value: "fitness", label: "เพิ่มพลังงาน / ความฟิต", icon: Activity },
    { value: "other", label: "อื่น ๆ", icon: Target }
  ];

  const exerciseOptions = [
    { value: "never", label: "ไม่เคย" },
    { value: "1-2", label: "1-2 ครั้งต่อสัปดาห์" },
    { value: "3-5", label: "3-5 ครั้งต่อสัปดาห์" },
    { value: "daily", label: "ทุกวัน" }
  ];

  const medicalConditions = [
    { value: "diabetes", label: "เบาหวาน" },
    { value: "hypertension", label: "ความดันโลหิตสูง" },
    { value: "cholesterol", label: "ไขมันในเลือดสูง" },
    { value: "asthma", label: "หอบหืด" },
    { value: "heart-disease", label: "โรคหัวใจ" },
    { value: "other", label: "อื่น ๆ" }
  ];

  const handleNext = async () => {
    // ตรวจสอบข้อมูลที่จำเป็นก่อนไปขั้นตอนถัดไป
         if (currentStep === 1) {
       // Step 1: ข้อมูลส่วนตัว - บังคับกรอก
       const firstName = data.firstName?.trim() || registrationData?.firstName?.trim();
       const lastName = data.lastName?.trim() || registrationData?.lastName?.trim();
       
       if (!firstName || !lastName || !data.sex || !data.birthDate) {
         toast({
           title: "⚠️ ข้อมูลไม่ครบถ้วน",
           description: "กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วน:\n• ชื่อจริง\n• นามสกุล\n• เพศ\n• วันเกิด",
           variant: "destructive",
         });
         return;
       }
      
             // แสดงข้อความแจ้งเตือนการเสร็จสิ้น
       toast({
         title: "✅ ข้อมูลส่วนตัวครบถ้วน",
         description: `ชื่อ: ${firstName} ${lastName}\nเพศ: ${data.sex === 'male' ? 'ชาย' : 'หญิง'}\nวันเกิด: ${new Date(data.birthDate).toLocaleDateString('th-TH')}`,
         variant: "default",
       });
       
       console.log('✅ ข้อมูลส่วนตัวครบถ้วนแล้ว:', {
         firstName: firstName,
         lastName: lastName,
         sex: data.sex,
         birthDate: data.birthDate,
         source: registrationData ? 'Register + Edited' : 'Onboarding Only'
       });
    }
    
    if (currentStep === 2) {
      // Step 2: เป้าหมายสุขภาพ - บังคับกรอก
      if (!data.healthGoal || !data.timeline) {
        toast({
          title: "🎯 เลือกเป้าหมายสุขภาพ",
          description: "กรุณาเลือกเป้าหมายสุขภาพและระยะเวลาที่ต้องการ",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "🎯 เป้าหมายสุขภาพ",
        description: `เป้าหมาย: ${healthGoals.find(g => g.value === data.healthGoal)?.label}\nระยะเวลา: ${data.timeline} เดือน`,
        variant: "default",
      });
    }
    
    if (currentStep === 3) {
      // Step 3: ข้อมูลร่างกาย - บังคับกรอก
      if (!data.height || !data.weight) {
        toast({
          title: "📏 ข้อมูลร่างกายไม่ครบ",
          description: "กรุณากรอกข้อมูลร่างกายให้ครบถ้วน:\n• ส่วนสูง (cm)\n• น้ำหนัก (kg)",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "📏 ข้อมูลร่างกายครบถ้วน",
        description: `ส่วนสูง: ${data.height} cm, น้ำหนัก: ${data.weight} kg`,
        variant: "default",
      });
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      try {
        // ตรวจสอบข้อมูลที่จำเป็นทั้งหมดก่อนบันทึก
        if (!validateRequiredData()) {
          return;
        }
        
        // อัพเดทข้อมูลล่าสุดก่อนส่ง
        console.log('🎯 Final onboarding data before completion:', data);
        
        // แสดงข้อมูลที่จะบันทึก
        if (registrationData) {
          console.log('📝 ข้อมูลจาก Register ที่จะถูกบันทึก:', registrationData);
        }
        
        console.log('💾 ข้อมูลทั้งหมดที่จะบันทึก:', data);
        
        // ส่งข้อมูลไปหลังบ้านด้วย JWT
        try {
          // ตรวจสอบ JWT Token จากหลายแหล่ง
          const token = localStorage.getItem('token') || 
                       localStorage.getItem('accessToken') || 
                       sessionStorage.getItem('token') ||
                       sessionStorage.getItem('accessToken');
          
          console.log('🔍 ตรวจสอบ JWT Token:');
          console.log('localStorage token:', localStorage.getItem('token'));
          console.log('localStorage accessToken:', localStorage.getItem('accessToken'));
          console.log('sessionStorage token:', sessionStorage.getItem('token'));
          console.log('sessionStorage accessToken:', sessionStorage.getItem('accessToken'));
          console.log('registrationData:', registrationData);
          
          if (!token) {
            console.error('❌ ไม่พบ JWT Token ในที่ใดเลย');
            
            // ตรวจสอบว่ามีข้อมูลจาก Register หรือไม่
            if (registrationData && registrationData.hasJWT) {
              console.warn('⚠️ registrationData.hasJWT = true แต่ไม่มี Token ใน storage');
              
              // แสดงข้อความที่ชัดเจนเกี่ยวกับปัญหา
              toast({
                title: "⚠️ ระบบยังไม่พร้อม",
                description: "Backend ยังไม่สามารถสร้าง JWT Token ได้\nกรุณาลองสมัครสมาชิกใหม่อีกครั้ง",
                variant: "destructive",
              });
              
              // กลับไปหน้า Register เพื่อลองใหม่
              navigate("/register");
              return;
            } else {
              toast({
                title: "❌ ไม่สามารถเข้าสู่ระบบได้",
                description: "กรุณาเข้าสู่ระบบก่อน",
                variant: "destructive",
              });
              navigate("/login");
              return;
            }
          }
          
          console.log('✅ พบ JWT Token:', token.substring(0, 20) + '...');
          
          // สร้างข้อมูลสำหรับส่งไปหลังบ้าน
          const onboardingDataForBackend = {
            // ใช้ field names แบบเดิมที่ backend ต้องการ
            firstName: data.firstName || registrationData?.firstName || '',
            lastName: data.lastName || registrationData?.lastName || '',
            sex: data.sex || '',
            birthDate: data.birthDate || '',
            height: data.height || 0,
            weight: data.weight || 0,
            healthGoal: data.healthGoal || '',
            timeline: data.timeline || 0,
            motivation: data.motivation || '',
            waist: data.waist || 0,
            bloodPressure: data.bloodPressure || '',
            bloodSugar: data.bloodSugar || '',
            exerciseFrequency: data.exerciseFrequency || '',
            sleepHours: data.sleepHours || 0,
            mealsPerDay: data.mealsPerDay || 0,
            smoking: data.smoking || false,
            alcoholFrequency: data.alcoholFrequency || '',
            activityLevel: data.activityLevel || '',
            medicalConditions: data.medicalConditions || [],
            surgeries: data.surgeries || '',
            allergies: data.allergies || '',
            
            // เพิ่มข้อมูล lifestyle ที่ขาดหายไป
            waterIntakeGlasses: (data as unknown as Record<string, unknown>).waterIntakeGlasses as number || 0,
            otherLifestyleNotes: (data as unknown as Record<string, unknown>).otherLifestyleNotes as string || '',
            caffeineCupsPerDay: (data as unknown as Record<string, unknown>).caffeineCupsPerDay as number || 0,
            screenTimeHours: (data as unknown as Record<string, unknown>).screenTimeHours as string || '2-4',
            stressLevel: (data as unknown as Record<string, unknown>).stressLevel as string || 'medium',
            relaxationFrequency: (data as unknown as Record<string, unknown>).relaxationFrequency as string || '1-2',
            lateMealFrequency: (data as unknown as Record<string, unknown>).lateMealFrequency as string || 'rarely'
          };
          
          // ตรวจสอบข้อมูลที่จำเป็นก่อนส่ง
          console.log('🔍 ข้อมูลที่จะส่งไป backend:', onboardingDataForBackend);
          console.log('🔍 ข้อมูลชื่อ:', {
            firstName: onboardingDataForBackend.firstName,
            lastName: onboardingDataForBackend.lastName,
            source: 'From data state (user input)'
          });
          
          // ตรวจสอบว่าข้อมูลชื่อไม่หาย
          if (!onboardingDataForBackend.firstName || !onboardingDataForBackend.lastName) {
            console.error('❌ ข้อมูลชื่อหายไป!');
            console.error('❌ firstName from data:', data.firstName);
            console.error('❌ lastName from data:', data.lastName);
            console.error('❌ registrationData:', registrationData);
            
            toast({
              title: "❌ ข้อมูลชื่อหายไป",
              description: "กรุณากรอกชื่อและนามสกุลให้ครบถ้วน",
              variant: "destructive",
            });
            return;
          }
          
          // บันทึกข้อมูลลงฐานข้อมูลผ่าน API Service
          console.log('💾 เริ่มบันทึกข้อมูลลงฐานข้อมูล...');
          
          try {
            // ใช้ API Service เพื่อบันทึกข้อมูล onboarding
            const savedProfile = await apiService.saveOnboardingData(onboardingDataForBackend);
            
            console.log('✅ บันทึกข้อมูลลงฐานข้อมูลสำเร็จ:', savedProfile);
            
            toast({
              title: "🎉 บันทึกข้อมูลสำเร็จ!",
              description: "ข้อมูลของคุณถูกบันทึกลงฐานข้อมูลเรียบร้อยแล้ว",
              variant: "default",
            });
            
          } catch (apiError) {
            console.error('❌ Error saving data to database:', apiError);
            
            toast({
              title: "⚠️ ไม่สามารถบันทึกลงฐานข้อมูลได้",
              description: "ข้อมูลจะถูกบันทึกในเครื่องชั่วคราว และจะลองบันทึกลงฐานข้อมูลอีกครั้งในภายหลัง",
              variant: "destructive",
            });
            
            // แม้จะบันทึกลงฐานข้อมูลไม่สำเร็จ ก็ยังให้เสร็จสิ้น onboarding ได้
          }
          
        } catch (apiError) {
          console.error('❌ Error sending data to backend:', apiError);
          // ไม่แสดง error ให้ผู้ใช้เห็น เพราะ Onboarding เสร็จสิ้นแล้ว
        }
        
        // แสดง toast แจ้งเตือนการเสร็จสิ้น
        toast({
          title: "🎉 เสร็จสิ้นการตั้งค่า!",
          description: "ยินดีต้อนรับสู่แอปสุขภาพดี AI ของคุณ",
          variant: "default",
        });
        
        // อัพเดทข้อมูลล่าสุดก่อนเรียก completeOnboarding
        console.log('🔄 Syncing final data to context before completion...');
        
        // ตรวจสอบข้อมูลชื่อจากหลายแหล่ง
        const finalFirstName = data.firstName || registrationData?.firstName || '';
        const finalLastName = data.lastName || registrationData?.lastName || '';
        
        console.log('🔍 Final name data:', {
          firstName: {
            fromData: data.firstName,
            fromRegistration: registrationData?.firstName,
            final: finalFirstName
          },
          lastName: {
            fromData: data.lastName,
            fromRegistration: registrationData?.lastName,
            final: finalLastName
          }
        });
        
        // อัพเดทข้อมูลใน context
        Object.keys(data).forEach(key => {
          let value = data[key as keyof OnboardingData];
          
          // สำหรับข้อมูลชื่อ ให้ใช้ข้อมูลจากหลายแหล่ง
          if (key === 'firstName') {
            value = finalFirstName;
          } else if (key === 'lastName') {
            value = finalLastName;
          }
          
          if (value !== undefined && value !== null && value !== "") {
            updateOnboardingData(key as keyof OnboardingData, value);
            console.log(`✅ Synced ${key}:`, value);
          } else {
            console.log(`⏭️ Skipped syncing ${key} (empty value):`, value);
          }
        });
        
        // ส่งข้อมูลชื่อไปยัง API service โดยตรง
        if (finalFirstName && finalLastName) {
          console.log('📝 Sending name data to API service:', { firstName: finalFirstName, lastName: finalLastName });
          
          // อัพเดทข้อมูลใน context อีกครั้งเพื่อให้แน่ใจ
          updateOnboardingData('firstName', finalFirstName);
          updateOnboardingData('lastName', finalLastName);
          
          // เพิ่มข้อมูลชื่อจาก registrationData เพื่อให้ API service สามารถเข้าถึงได้
          updateOnboardingData('registrationFirstName' as keyof OnboardingData, finalFirstName);
          updateOnboardingData('registrationLastName' as keyof OnboardingData, finalLastName);
          
          // รอให้ข้อมูลถูกอัพเดทใน context
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('🎯 Final data synced, calling completeOnboarding...');
        await completeOnboarding();
        navigate("/dashboard");
      } catch (error) {
        console.error('Error completing onboarding:', error);
        // Still navigate even if there's an error
        navigate("/dashboard");
      }
    }
  };

  // ตรวจสอบข้อมูลที่จำเป็นทั้งหมด
  const validateRequiredData = (): boolean => {
    console.log('🔍 Validating required data...');
    console.log('📊 Current data state:', data);
    console.log('📝 Registration data available:', registrationData);
    
    // ตรวจสอบข้อมูลชื่อจากหลายแหล่ง
    const firstName = data.firstName?.trim() || registrationData?.firstName?.trim();
    const lastName = data.lastName?.trim() || registrationData?.lastName?.trim();
    
    console.log('🔍 Name validation:', {
      firstName: {
        fromData: data.firstName?.trim(),
        fromRegistration: registrationData?.firstName?.trim(),
        final: firstName
      },
      lastName: {
        fromData: data.lastName?.trim(),
        fromRegistration: registrationData?.lastName?.trim(),
        final: lastName
      }
    });
    
    const requiredFields = {
      firstName: firstName,
      lastName: lastName,
      sex: data.sex,
      birthDate: data.birthDate,
      healthGoal: data.healthGoal,
      timeline: data.timeline,
      height: data.height,
      weight: data.weight
    };

    console.log('📋 Required fields values:', requiredFields);

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      
      const fieldNames = {
        firstName: 'ชื่อจริง',
        lastName: 'นามสกุล',
        sex: 'เพศ',
        birthDate: 'วันเกิด',
        healthGoal: 'เป้าหมายสุขภาพ',
        timeline: 'ระยะเวลา',
        height: 'ส่วนสูง',
        weight: 'น้ำหนัก'
      };
      
      const missingFieldNames = missingFields.map(field => fieldNames[field as keyof typeof fieldNames] || field);
      
      // แสดงข้อความแจ้งเตือนที่ชัดเจนขึ้น
      let message = `กรุณากรอกข้อมูลให้ครบถ้วน:\n\n`;
      missingFieldNames.forEach(field => {
        message += `• ${field}\n`;
      });
      
      // แสดงข้อความพิเศษสำหรับข้อมูลที่ได้จาก Register
      if (registrationData) {
        const personalFields = ['firstName', 'lastName', 'sex'];
        const missingPersonalFields = missingFields.filter(field => personalFields.includes(field));
        
        if (missingPersonalFields.length > 0) {
          message += `\nหมายเหตุ: ข้อมูลส่วนตัว (ชื่อ, นามสกุล, เพศ) ถูกกรอกแล้วตอนสมัครสมาชิก`;
        }
      }
      
      toast({
        title: "❌ ข้อมูลไม่ครบถ้วน",
        description: message,
        variant: "destructive",
      });
      return false;
    }

    console.log('✅ All required fields are filled');
    
    // แสดงข้อมูลที่จะบันทึก
    console.log('📋 ข้อมูลที่จะบันทึก:', {
      personal: {
        firstName: firstName,
        lastName: lastName,
        sex: data.sex,
        birthDate: data.birthDate,
        source: registrationData ? 'Register' : 'Onboarding'
      },
      health: {
        healthGoal: data.healthGoal,
        timeline: data.timeline,
        height: data.height,
        weight: data.weight
      }
    });

    return true;
  };

  const handleSkip = () => {
    // ตรวจสอบข้อมูลที่จำเป็นก่อนให้ข้ามได้
    if (currentStep === 1) {
      // Step 1: ข้อมูลส่วนตัว - บังคับกรอก
      if (!data.firstName?.trim() || !data.lastName?.trim() || !data.sex || !data.birthDate) {
        toast({
          title: "❌ ไม่สามารถข้ามได้",
          description: "กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วนก่อนข้ามขั้นตอน",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (currentStep === 2) {
      // Step 2: เป้าหมายสุขภาพ - บังคับกรอก
      if (!data.healthGoal || !data.timeline) {
        toast({
          title: "❌ ไม่สามารถข้ามได้",
          description: "กรุณาเลือกเป้าหมายสุขภาพและระยะเวลาก่อนข้ามขั้นตอน",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (currentStep === 3) {
      // Step 3: ข้อมูลร่างกาย - บังคับกรอก
      if (!data.height || !data.weight) {
        toast({
          title: "❌ ไม่สามารถข้ามได้",
          description: "กรุณากรอกข้อมูลร่างกายให้ครบถ้วนก่อนข้ามขั้นตอน",
          variant: "destructive",
        });
        return;
      }
    }
    
    // ถ้าข้อมูลครบแล้ว ให้ข้ามได้
    if (currentStep < steps.length - 1) {
      toast({
        title: "⏭️ ข้ามขั้นตอน",
        description: `ข้ามจาก ${steps[currentStep].title} ไป ${steps[currentStep + 1].title}`,
        variant: "default",
      });
      setCurrentStep(currentStep + 1);
    } else {
      toast({
        title: "🎯 เสร็จสิ้นการตั้งค่า",
        description: "ข้ามไปยังหน้า Dashboard",
        variant: "default",
      });
      completeOnboarding();
      navigate("/dashboard");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      toast({
        title: "⬅️ ย้อนกลับ",
        description: `ย้อนกลับไป ${steps[currentStep - 1].title}`,
        variant: "default",
      });
      setCurrentStep(currentStep - 1);
    }
  };

  // ตรวจสอบว่าสามารถข้าม step ปัจจุบันได้หรือไม่
  const canSkipCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1: // ข้อมูลส่วนตัว
        // ตรวจสอบข้อมูลชื่อจากหลายแหล่ง
        const firstName = data.firstName?.trim() || registrationData?.firstName?.trim();
        const lastName = data.lastName?.trim() || registrationData?.lastName?.trim();
        return !!(firstName && lastName && data.sex && data.birthDate);
      case 2: // เป้าหมายสุขภาพ
        return !!(data.healthGoal && data.timeline);
      case 3: // ข้อมูลร่างกาย
        return !!(data.height && data.weight);
      case 4: // พฤติกรรมประจำวัน - ข้ามได้เสมอ (ข้อมูลไม่บังคับ)
        return true;
      case 5: // ประวัติสุขภาพ - ข้ามได้เสมอ (ข้อมูลไม่บังคับ)
        return true;
      default:
        return true;
    }
  };

    const updateData = (key: keyof OnboardingData, value: unknown) => {
    // จัดการข้อมูลที่ไม่ได้กรอกให้ถูกต้อง
    let processedValue = value;
    
    // สำหรับข้อมูลที่จำเป็น (firstName, lastName, sex, birthDate, healthGoal, timeline, height, weight)
    // ไม่ควรเป็น undefined หรือ null
    const requiredFields = ['firstName', 'lastName', 'sex', 'birthDate', 'healthGoal', 'timeline', 'height', 'weight'];
    const isRequired = requiredFields.includes(key);
    
    // Special handling for firstName and lastName to prevent empty values
    if (key === 'firstName' || key === 'lastName') {
      const registrationValue = key === 'firstName' ? registrationData?.firstName : registrationData?.lastName;
      
      // If the value is empty and we have registration data, use the registration value
      if ((value === "" || value === null || value === undefined || 
           (typeof value === "string" && value.trim() === "")) && 
          registrationValue) {
        console.log(`🔄 ${key} is empty, using registration data:`, registrationValue);
        processedValue = registrationValue;
      } else if (value === "" || value === null || value === undefined || 
                 (typeof value === "string" && value.trim() === "")) {
        // If no registration data and value is empty, keep it as empty string
        processedValue = "";
      } else {
        // Use the provided value
        processedValue = value;
      }
      
      console.log(`🔍 ${key} processing:`, {
        inputValue: value,
        registrationValue: registrationValue,
        processedValue: processedValue
      });
    } else if (isRequired) {
      // ข้อมูลที่จำเป็นต้องมีค่าเสมอ
      if (value === "" || value === null || value === undefined) {
        // ถ้าเป็นค่าว่าง ให้เป็นค่าว่าง string แทน undefined
        processedValue = "";
      } else if (typeof value === "string" && value.trim() === "") {
        processedValue = "";
      } else if (typeof value === "number" && value === 0) {
        // สำหรับตัวเลข 0 ให้เก็บไว้ (อาจเป็นค่าที่ถูกต้อง)
        processedValue = value;
      }
    } else {
      // ข้อมูลที่ไม่บังคับสามารถเป็น undefined ได้
      if (value === "" || value === null || value === undefined) {
        processedValue = undefined;
      } else if (typeof value === "string" && value.trim() === "") {
        processedValue = undefined;
      } else if (typeof value === "number" && value === 0) {
        processedValue = undefined;
      }
    }
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (isRequired && processedValue === undefined) {
      console.warn(`⚠️ Required field ${key} is empty`);
    } else if (isRequired && processedValue) {
      console.log(`✅ Required field ${key} is filled:`, processedValue);
    }
    
    // อัพเดทข้อมูลใน local state
    setData(prev => ({ ...prev, [key]: processedValue }));
    
    // อัพเดทข้อมูลใน context เฉพาะเมื่อมีค่าจริงๆ
    if (processedValue !== undefined && processedValue !== null && processedValue !== "") {
      updateOnboardingData(key, processedValue);
      console.log(`🔄 Updated ${key} in context:`, processedValue);
    } else {
      console.log(`⏭️ Skipped updating ${key} in context (empty value)`);
    }
    
    // แสดงข้อมูลที่อัพเดท
    console.log(`🔄 Updated ${key} in local state:`, processedValue);
    
    // แสดง toast notification สำหรับข้อมูลที่สำคัญ
    if (key === 'birthDate' && processedValue) {
      toast({
        title: "📅 วันเกิด",
        description: `วันเกิด: ${new Date(processedValue as string).toLocaleDateString('th-TH')}`,
        variant: "default",
      });
    } else if (key === 'height' && processedValue) {
      toast({
        title: "📏 ส่วนสูง",
        description: `ส่วนสูง: ${processedValue} cm`,
        variant: "default",
       });
    } else if (key === 'weight' && processedValue) {
      toast({
        title: "⚖️ น้ำหนัก",
        description: `น้ำหนัก: ${processedValue} kg`,
        variant: "default",
        });
    }
    
         // เพิ่มการตรวจสอบข้อมูลชื่อ
     if (key === 'firstName' || key === 'lastName') {
       console.log(`🔍 ${key} value:`, processedValue);
       console.log(`🔍 ${key} from registrationData:`, registrationData?.[key]);
       console.log(`🔍 Current data state:`, data);
       
       // ตรวจสอบว่าข้อมูลชื่อไม่หายไป
       if (key === 'firstName' && !processedValue && registrationData?.firstName) {
         console.log('⚠️ firstName is empty, using registrationData.firstName');
         processedValue = registrationData.firstName;
         setData(prev => ({ ...prev, [key]: processedValue as string }));
       } else if (key === 'lastName' && !processedValue && registrationData?.lastName) {
         console.log('⚠️ lastName is empty, using registrationData.lastName');
         processedValue = registrationData.lastName;
         setData(prev => ({ ...prev, [key]: processedValue as string }));
       }
     }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card className="max-w-2xl mx-auto shadow-health border-0">
            <CardHeader className="text-center pb-4 pt-6">
              <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-3">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl">ยินดีต้อนรับสู่แอปสุขภาพของคุณ!</CardTitle>
              <CardDescription className="text-lg">
                เราจะช่วยคุณตั้งค่าแอปให้เหมาะกับเป้าหมายสุขภาพของคุณ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0 pb-6">
              <div className="text-center space-y-3">
                <p className="text-muted-foreground">
                  การตั้งค่าจะใช้เวลาเพียง 2-3 นาที และจะช่วยให้เราแนะนำคุณได้ตรงเป้าหมายมากขึ้น
                </p>
                <div className="flex justify-center">
                  <Button onClick={() => {
                    toast({
                      title: "🚀 เริ่มต้นการตั้งค่า",
                      description: "เริ่มต้นการตั้งค่าแอปสุขภาพของคุณ",
                      variant: "default",
                    });
                    handleNext();
                  }} className="health-button">
                    เริ่มต้นเลย
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card className="max-w-2xl mx-auto shadow-health border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6" />
                ข้อมูลส่วนตัว
              </CardTitle>
              <CardDescription>
                กรุณากรอกข้อมูลส่วนตัวเพื่อให้เราจัดการแอปให้ตรงกับความต้องการของคุณ
              </CardDescription>
              {!canSkipCurrentStep() && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">ข้อมูลที่จำเป็นต้องกรอกก่อนข้าม:</span>
                  </div>
                  <ul className="mt-2 text-sm text-amber-700 space-y-1">
                    {!data.firstName?.trim() && <li>• ชื่อจริง</li>}
                    {!data.lastName?.trim() && <li>• นามสกุล</li>}
                    {!data.sex && <li>• เพศ</li>}
                    {!data.birthDate && <li>• วันเกิด</li>}
                  </ul>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* แสดงข้อมูลที่ได้จาก Register */}
              {registrationData && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">ข้อมูลที่สมัครสมาชิกแล้ว</span>
                  </div>
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-green-700">
                     <div>
                       <span className="font-medium">ชื่อ:</span> {data.firstName || registrationData?.firstName} {data.lastName || registrationData?.lastName}
                     </div>
                     <div>
                       <span className="font-medium">เพศ:</span> {data.sex === 'male' ? 'ชาย' : 'หญิง'}
                     </div>
                   </div>
                  <p className="text-xs text-green-700 mt-2">
                    💡 คุณสามารถแก้ไขข้อมูลเหล่านี้ได้หากต้องการ
                  </p>
                </div>
              )}

              {/* ฟอร์มข้อมูลส่วนตัว - แสดงเสมอเพื่อให้แก้ไขได้ */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">ชื่อจริง <span className="text-red-500">*</span></Label>
                                         <Input
                       id="firstName"
                       type="text"
                       placeholder="ชื่อจริง"
                       value={data.firstName || registrationData?.firstName || ""}
                       onChange={(e) => updateData("firstName", e.target.value)}
                       className="h-10 rounded-xl shadow-sm focus-visible:ring-2 focus-visible:ring-primary/60"
                       required
                     />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">นามสกุล <span className="text-red-500">*</span></Label>
                                         <Input
                       id="lastName"
                       type="text"
                       placeholder="นามสกุล"
                       value={data.lastName || registrationData?.lastName || ""}
                       onChange={(e) => updateData("lastName", e.target.value)}
                       className="h-10 rounded-xl shadow-sm focus-visible:ring-2 focus-visible:ring-primary/60"
                       required
                     />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sex">เพศ <span className="text-red-500">*</span></Label>
                  <Select value={data.sex} onValueChange={(value) => {
                    updateData("sex", value as 'male' | 'female');
                    const genderText = value === 'male' ? 'ชาย' : 'หญิง';
                    toast({
                      title: "👤 เพศ",
                      description: `เลือกเพศ: ${genderText}`,
                      variant: "default",
                    });
                  }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="เลือกเพศ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">ชาย</SelectItem>
                      <SelectItem value="female">หญิง</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">วันเกิด <span className="text-red-500">*</span></Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={data.birthDate || ""}
                    onChange={(e) => updateData("birthDate", e.target.value)}
                    className="h-10 rounded-xl shadow-sm focus-visible:ring-2 focus-visible:ring-primary/60"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    เราใช้ข้อมูลนี้เพื่อคำนวณความต้องการพลังงานที่เหมาะสมกับคุณ
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="max-w-2xl mx-auto shadow-health border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6" />
                เป้าหมายสุขภาพ
              </CardTitle>
              <CardDescription>
                เลือกเป้าหมายหลักที่คุณต้องการเพื่อให้เราแนะนำได้ตรงจุด
              </CardDescription>
              {!canSkipCurrentStep() && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">ข้อมูลที่จำเป็นต้องกรอกก่อนข้าม:</span>
                  </div>
                  <ul className="mt-2 text-sm text-amber-700 space-y-1">
                    {!data.healthGoal && <li>• เป้าหมายสุขภาพ</li>}
                    {!data.timeline && <li>• ระยะเวลา</li>}
                  </ul>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>คุณต้องการอะไร? <span className="text-red-500">*</span></Label>
                <RadioGroup
                  value={data.healthGoal}
                  onValueChange={(value) => {
                    updateData("healthGoal", value);
                    const selectedGoal = healthGoals.find(g => g.value === value);
                    if (selectedGoal) {
                      toast({
                        title: "🎯 เป้าหมายสุขภาพ",
                        description: `เลือกเป้าหมาย: ${selectedGoal.label}`,
                        variant: "default",
                      });
                    }
                  }}
                  required
                >
                  {healthGoals.map((goal) => (
                    <div key={goal.value} className="flex items-center space-x-3">
                      <RadioGroupItem value={goal.value} id={goal.value} />
                      <Label htmlFor={goal.value} className="flex items-center gap-2 cursor-pointer">
                        <goal.icon className="h-4 w-4" />
                        {goal.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label>อยากเห็นผลในกี่เดือน? <span className="text-red-500">*</span></Label>
                <Select value={data.timeline.toString()} onValueChange={(value) => {
                  const timeline = parseInt(value);
                  updateData("timeline", timeline);
                  toast({
                    title: "⏰ ระยะเวลา",
                    description: `เป้าหมาย: ${timeline} เดือน`,
                    variant: "default",
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกระยะเวลา" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 เดือน</SelectItem>
                    <SelectItem value="3">3 เดือน</SelectItem>
                    <SelectItem value="6">6 เดือน</SelectItem>
                    <SelectItem value="12">12 เดือน</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>อะไรคือเหตุผลที่คุณอยากเปลี่ยนสุขภาพของคุณ? (ไม่บังคับ)</Label>
                <Textarea
                  placeholder="เช่น อยากมีสุขภาพที่ดีขึ้น, อยากลดน้ำหนักเพื่อสุขภาพ..."
                  value={data.motivation}
                  onChange={(e) => updateData("motivation", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="max-w-2xl mx-auto shadow-health border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-6 w-6" />
                ข้อมูลร่างกายเบื้องต้น
              </CardTitle>
              <CardDescription>
                ข้อมูลเหล่านี้จะช่วยคำนวณ BMI และวิเคราะห์สุขภาพเบื้องต้น
              </CardDescription>
              {!canSkipCurrentStep() && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">ข้อมูลที่จำเป็นต้องกรอกก่อนข้าม:</span>
                  </div>
                  <ul className="mt-2 text-sm text-amber-700 space-y-1">
                    {!data.height && <li>• ส่วนสูง (cm)</li>}
                    {!data.weight && <li>• น้ำหนัก (kg)</li>}
                  </ul>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">ส่วนสูง (cm) <span className="text-red-500">*</span></Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="170"
                    value={data.height || ""}
                    onChange={(e) => updateData("height", parseFloat(e.target.value) || undefined)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">น้ำหนัก (kg) <span className="text-red-500">*</span></Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="65"
                    value={data.weight || ""}
                    onChange={(e) => updateData("weight", parseFloat(e.target.value) || undefined)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="waist">รอบเอว (cm) - ไม่บังคับ</Label>
                <Input
                  id="waist"
                  type="number"
                  placeholder="80"
                  value={data.waist || ""}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    updateData("waist", value || undefined);
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="blood-pressure">ความดันโลหิต - ไม่บังคับ</Label>
                  <Input
                    id="blood-pressure"
                    placeholder="120/80"
                    value={data.bloodPressure}
                    onChange={(e) => updateData("bloodPressure", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blood-sugar">น้ำตาลในเลือด - ไม่บังคับ</Label>
                  <Input
                    id="blood-sugar"
                    placeholder="100"
                    value={data.bloodSugar}
                    onChange={(e) => updateData("bloodSugar", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="max-w-2xl mx-auto shadow-health border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-6 w-6" />
                พฤติกรรมประจำวัน
              </CardTitle>
              <CardDescription>
                ช่วยให้เราเข้าใจนิสัยสุขภาพของคุณ
              </CardDescription>
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">ข้อมูลในขั้นตอนนี้ไม่บังคับ - ข้ามได้เสมอ</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>คุณออกกำลังกายบ่อยแค่ไหน?</Label>
                <RadioGroup
                  value={data.exerciseFrequency}
                  onValueChange={(value) => {
                    updateData("exerciseFrequency", value);
                    const exerciseLabels = {
                      'never': 'ไม่เคย',
                      '1-2': '1-2 ครั้งต่อสัปดาห์',
                      '3-5': '3-5 ครั้งต่อสัปดาห์',
                      'daily': 'ทุกวัน'
                    };
                    toast({
                      title: "💪 การออกกำลังกาย",
                      description: exerciseLabels[value as keyof typeof exerciseLabels] || value,
                      variant: "default",
                    });
                  }}
                >
                  {exerciseOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-3">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label>ระดับกิจกรรม (สำหรับคำนวณ TDEE)</Label>
                <Select value={data.activityLevel} onValueChange={(value) => {
                  updateData("activityLevel", value);
                  const activityLabels = {
                    'sedentary': 'นั่งทำงาน/ไม่ค่อยขยับตัว',
                    'light': 'ออกกำลังกายเบาๆ 1-3 วัน/สัปดาห์',
                    'moderate': 'ออกกำลังกายปานกลาง 3-5 วัน/สัปดาห์',
                    'active': 'ออกกำลังกายหนัก 6-7 วัน/สัปดาห์',
                    'very-active': 'ออกกำลังกายหนักมาก/ใช้แรงงาน'
                  };
                  toast({
                    title: "🏃‍♂️ ระดับกิจกรรม",
                    description: activityLabels[value as keyof typeof activityLabels] || value,
                    variant: "default",
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกระดับกิจกรรม" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">นั่งทำงาน/ไม่ค่อยขยับตัว</SelectItem>
                    <SelectItem value="light">ออกกำลังกายเบาๆ 1-3 วัน/สัปดาห์</SelectItem>
                    <SelectItem value="moderate">ออกกำลังกายปานกลาง 3-5 วัน/สัปดาห์</SelectItem>
                    <SelectItem value="active">ออกกำลังกายหนัก 6-7 วัน/สัปดาห์</SelectItem>
                    <SelectItem value="very-active">ออกกำลังกายหนักมาก/ใช้แรงงาน</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>นอนกี่ชั่วโมงต่อวันโดยเฉลี่ย?</Label>
                <Select value={data.sleepHours.toString()} onValueChange={(value) => {
                  const hours = parseInt(value);
                  updateData("sleepHours", hours);
                  toast({
                    title: "😴 การนอน",
                    description: `นอน: ${hours} ชั่วโมงต่อวัน`,
                    variant: "default",
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map((hours) => (
                      <SelectItem key={hours} value={hours.toString()}>
                        {hours} ชั่วโมง
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>กินวันละกี่มื้อ?</Label>
                <Select value={data.mealsPerDay.toString()} onValueChange={(value) => {
                  const meals = parseInt(value);
                  updateData("mealsPerDay", meals);
                  toast({
                    title: "🍽️ มื้ออาหาร",
                    description: `กิน: ${meals} มื้อต่อวัน`,
                    variant: "default",
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((meals) => (
                      <SelectItem key={meals} value={meals.toString()}>
                        {meals} มื้อ
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>พฤติกรรมอื่น ๆ</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>สูบบุหรี่</Label>
                    <Select 
                      value={data.smoking ? "yes" : "no"} 
                      onValueChange={(value) => {
                        const isSmoking = value === "yes";
                        updateData("smoking", isSmoking);
                        const smokingText = isSmoking ? "สูบ" : "ไม่สูบ";
                        toast({
                          title: "🚬 สูบบุหรี่",
                          description: `สถานะ: ${smokingText}`,
                          variant: "default",
                        });
                        console.log('🚬 Updated smoking status:', isSmoking);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกสถานะการสูบบุหรี่" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">ไม่สูบ</SelectItem>
                        <SelectItem value="yes">สูบ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>ดื่มแอลกอฮอล์</Label>
                    <Select value={data.alcoholFrequency} onValueChange={(value) => {
                      updateData("alcoholFrequency", value);
                      const alcoholLabels = {
                        'never': 'ไม่ดื่ม',
                        'rarely': 'นานๆ ครั้ง',
                        'weekly': 'สัปดาห์ละ 1-2 ครั้ง',
                        'daily': 'ทุกวัน'
                      };
                      toast({
                        title: "🍷 ดื่มแอลกอฮอล์",
                        description: `ความถี่: ${alcoholLabels[value as keyof typeof alcoholLabels] || value}`,
                        variant: "default",
                      });
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกความถี่" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">ไม่ดื่ม</SelectItem>
                        <SelectItem value="rarely">นานๆ ครั้ง</SelectItem>
                        <SelectItem value="weekly">สัปดาห์ละ 1-2 ครั้ง</SelectItem>
                        <SelectItem value="daily">ทุกวัน</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>ดื่มน้ำต่อวัน (แก้ว) - ไม่บังคับ</Label>
                  <Input
                    type="number"
                    min={0}
                    max={30}
                    value={(data as unknown as Record<string, unknown>).waterIntakeGlasses as number || ""}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      updateData("waterIntakeGlasses" as keyof OnboardingData, value || undefined);
                      if (value && value > 0) {
                        toast({
                          title: "💧 การดื่มน้ำ",
                          description: `ดื่มน้ำ: ${value} แก้วต่อวัน`,
                          variant: "default",
                        });
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>อื่น ๆ (ระบุเพิ่มเติม)</Label>
                  <Textarea
                    placeholder="เช่น ชอบดื่มเครื่องดื่มหวาน บางวันทำงานกะดึก ฯลฯ"
                    value={(data as unknown as Record<string, unknown>).otherLifestyleNotes as string || ''}
                    onChange={(e) => updateData("otherLifestyleNotes" as keyof OnboardingData, e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card className="max-w-2xl mx-auto shadow-health border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6" />
                ประวัติสุขภาพ
              </CardTitle>
              <CardDescription>
                ข้อมูลนี้จะช่วยให้เราแนะนำได้เหมาะสมและปลอดภัย
              </CardDescription>
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">ข้อมูลในขั้นตอนนี้ไม่บังคับ - ข้ามได้เสมอ</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>โรคประจำตัวที่มี (เลือกได้หลายอัน)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {medicalConditions.map((condition) => (
                    <div key={condition.value} className="flex items-center space-x-3">
                      <Checkbox
                        id={condition.value}
                        checked={data.medicalConditions.includes(condition.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateData("medicalConditions", [...data.medicalConditions, condition.value]);
                            toast({
                              title: "🏥 โรคประจำตัว",
                              description: `เพิ่ม: ${condition.label}`,
                              variant: "default",
                            });
                          } else {
                            updateData("medicalConditions", data.medicalConditions.filter(c => c !== condition.value));
                            toast({
                              title: "🏥 โรคประจำตัว",
                              description: `ลบ: ${condition.label}`,
                              variant: "default",
                            });
                          }
                        }}
                      />
                      <Label htmlFor={condition.value} className="cursor-pointer">
                        {condition.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="surgeries">เคยผ่าตัดหรือมีการรักษาพิเศษ? (ไม่บังคับ)</Label>
                <Textarea
                  id="surgeries"
                  placeholder="เช่น ผ่าตัดหัวใจ, ใส่เหล็กดามกระดูก..."
                  value={data.surgeries}
                  onChange={(e) => updateData("surgeries", e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="allergies">แพ้อาหาร / แพ้ยาอะไรบ้าง? (ไม่บังคับ)</Label>
                <Textarea
                  id="allergies"
                  placeholder="เช่น แพ้ยาเพนิซิลลิน, แพ้อาหารทะเล..."
                  value={data.allergies}
                  onChange={(e) => updateData("allergies", e.target.value)}
                />
              </div>

              <div className="text-center">
                <Button variant="outline" onClick={handleSkip}>
                  ยังไม่ทราบ / ข้าม
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card className="max-w-2xl mx-auto shadow-health border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6" />
                สรุปการตั้งค่า
              </CardTitle>
              <CardDescription>
                ตรวจสอบข้อมูลที่คุณได้กรอกไว้
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">เป้าหมาย</Label>
                    <Badge variant="secondary">
                      {healthGoals.find(g => g.value === data.healthGoal)?.label || "ไม่ระบุ"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">ระยะเวลา</Label>
                    <Badge variant="secondary">{data.timeline} เดือน</Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">ส่วนสูง</Label>
                    <p className="text-sm">{data.height} cm</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">น้ำหนัก</Label>
                    <p className="text-sm">{data.weight} kg</p>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  คุณสามารถแก้ไขข้อมูลเหล่านี้ได้ในภายหลังที่หน้าโปรไฟล์
                </p>
                <Button onClick={() => {
                  toast({
                    title: "🎯 เริ่มใช้งานแอป",
                    description: "ยินดีต้อนรับสู่แอปสุขภาพดี AI ของคุณ!",
                    variant: "default",
                  });
                  handleNext();
                }} className="health-button">
                  เริ่มใช้งานเลย!
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-secondary-light flex items-center justify-center p-4">
      <div className="w-full max-w-4xl fade-in">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-foreground">ขั้นตอนที่ {currentStep + 1} จาก {steps.length}</h2>
            <span className="text-sm text-muted-foreground">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col items-center space-y-1 ${
                  index <= currentStep ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <step.icon className={`h-4 w-4 ${index <= currentStep ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-xs hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

                 {/* Navigation Buttons */}
         {currentStep > 0 && currentStep < steps.length - 1 && (
           <div className="flex justify-between max-w-2xl mx-auto">
             <Button variant="outline" onClick={handleBack}>
               <ArrowLeft className="mr-2 h-4 w-4" />
               ย้อนกลับ
             </Button>
             <div className="flex gap-2">
               {/* แสดงปุ่มข้ามเฉพาะเมื่อข้อมูลครบถ้วน */}
               {canSkipCurrentStep() ? (
                 <Button variant="outline" onClick={handleSkip}>
                   ข้าม
                 </Button>
               ) : (
                 <div className="text-xs text-muted-foreground px-3 py-2 bg-muted rounded-md">
                   กรอกข้อมูลให้ครบก่อนข้าม
                 </div>
               )}
               <Button onClick={handleNext} className="health-button">
                 ถัดไป
                 <ArrowRight className="ml-2 h-4 w-4" />
               </Button>
             </div>
           </div>
         )}
      </div>
    </div>
  );
};

export default Onboarding; 