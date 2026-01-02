import React, { createContext, useContext, useState, ReactNode } from 'react';
import { apiService } from '@/services/api';

interface OnboardingData {
  // Step 1: Health Goals
  healthGoal: string;
  timeline: number;
  motivation: string;
  
  // Step 2: Basic Body Info
  firstName: string; // ชื่อจริง
  lastName: string;  // นามสกุล
  height: number;
  weight: number;
  waist: number;
  bloodPressure: string;
  bloodSugar: string;
  // Added for BMR/TDEE
  sex: 'male' | 'female';
  birthDate: string; // ISO date string YYYY-MM-DD
  
  // Step 3: Lifestyle
  exerciseFrequency: string;
  sleepHours: number;
  mealsPerDay: number;
  smoking: boolean;
  alcoholFrequency: string;
  // Added for BMR/TDEE
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
  // Extended lifestyle fields
  caffeineCupsPerDay: number; // จำนวนแก้วกาแฟ/คาเฟอีนต่อวัน
  screenTimeHours: 'lt2' | '2-4' | '4-6' | 'gt6';
  stressLevel: 'low' | 'medium' | 'high';
  relaxationFrequency: 'never' | '1-2' | '3-5' | 'daily';
  waterIntakeGlasses: number; // แก้ว/วัน
  lateMealFrequency: 'never' | 'rarely' | 'weekly' | 'daily';
  otherLifestyleNotes: string;
  
  // Step 4: Medical History
  medicalConditions: string[];
  surgeries: string;
  allergies: string;
  
  // Onboarding status
  isCompleted: boolean;
}

interface OnboardingContextType {
  onboardingData: OnboardingData;
  updateOnboardingData: (key: keyof OnboardingData, value: unknown) => void;
  setOnboardingData: (data: OnboardingData) => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => void;
}

const defaultOnboardingData: OnboardingData = {
  healthGoal: "weight-loss",
  timeline: 6,
  motivation: "อยากมีสุขภาพที่ดีขึ้นและลดน้ำหนักเพื่อสุขภาพ",
  firstName: "",
  lastName: "",
  height: 165,
  weight: 65,
  waist: 80,
  bloodPressure: "120/80",
  bloodSugar: "95",
  sex: 'male',
  birthDate: '1990-01-01',
  exerciseFrequency: "3-5",
  sleepHours: 7,
  mealsPerDay: 3,
  smoking: false,
  alcoholFrequency: "rarely",
  activityLevel: 'moderate',
  caffeineCupsPerDay: 1,
  screenTimeHours: '2-4',
  stressLevel: 'medium',
  relaxationFrequency: '1-2',
  waterIntakeGlasses: 6,
  lateMealFrequency: 'rarely',
  otherLifestyleNotes: "",
  medicalConditions: ["hypertension"],
  surgeries: "ไม่เคยผ่าตัด",
  allergies: "แพ้ยาเพนิซิลลิน",
  isCompleted: false
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [onboardingData, setOnboardingDataState] = useState<OnboardingData>(() => {
    // ล้างข้อมูลเก่าที่มีชื่อ "Methas" หรือ "Haha" ออกจาก localStorage
    try {
      const oldOnboardingData = localStorage.getItem('onboardingData');
      const oldUserData = localStorage.getItem('user');
      
      if (oldOnboardingData) {
        const parsed = JSON.parse(oldOnboardingData);
        // ถ้ามีข้อมูลเก่าที่มีชื่อ "Methas" หรือ "Haha" ให้ล้างออก
        if (parsed.firstName === 'Methas' || parsed.lastName === 'Haha' || 
            parsed.firstName === 'methas' || parsed.lastName === 'haha') {
          localStorage.removeItem('onboardingData');
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('token');
          return defaultOnboardingData;
        }
      }
      
      if (oldUserData) {
        const parsed = JSON.parse(oldUserData);
        // ถ้ามีข้อมูล user เก่าที่มีชื่อ "Methas" หรือ "Haha" ให้ล้างออก
        if (parsed.first_name === 'Methas' || parsed.last_name === 'Haha' || 
            parsed.first_name === 'methas' || parsed.last_name === 'haha') {
          localStorage.removeItem('onboardingData');
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('token');
          return defaultOnboardingData;
        }
      }
      
      // Load from localStorage if available (หลังจากล้างข้อมูลเก่าแล้ว)
      const saved = localStorage.getItem('onboardingData');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Merge with defaults to ensure newly added fields exist
          return { ...defaultOnboardingData, ...parsed, isCompleted: parsed.isCompleted ?? false } as OnboardingData;
        } catch {
          return defaultOnboardingData;
        }
      }
    } catch (error) {
      console.error('Error clearing old data:', error);
    }
    
    return defaultOnboardingData;
  });

  const updateOnboardingData = (key: keyof OnboardingData, value: unknown) => {
    const newData = { ...onboardingData, [key]: value };
    setOnboardingDataState(newData);
    // Save to localStorage
    localStorage.setItem('onboardingData', JSON.stringify(newData));
  };

  const setOnboardingData = (data: OnboardingData) => {
    setOnboardingDataState(data);
    localStorage.setItem('onboardingData', JSON.stringify(data));
  };

  const completeOnboarding = async () => {
    try {
      
      // Save onboarding data to backend database
      try {
        await apiService.saveOnboardingData(onboardingData as unknown as Record<string, unknown>);
      } catch (error) {
        console.error('❌ Failed to save onboarding data to database:', error);
        // แสดงข้อความแจ้งเตือนให้ผู้ใช้ทราบ
        console.warn('⚠️ Data will be saved locally as backup');
      }
      
      // Mark as completed in local storage as backup
      const completedData = { ...onboardingData, isCompleted: true };
      setOnboardingDataState(completedData);
      localStorage.setItem('onboardingData', JSON.stringify(completedData));
      
    } catch (error) {
      console.error('❌ Failed to complete onboarding:', error);
      // Still mark as completed locally even if backend fails
      const completedData = { ...onboardingData, isCompleted: true };
      setOnboardingDataState(completedData);
      localStorage.setItem('onboardingData', JSON.stringify(completedData));
      
      // แสดงข้อความแจ้งเตือนให้ผู้ใช้ทราบ
      console.warn('⚠️ Onboarding marked as completed locally as backup');
    }
  };

  const resetOnboarding = () => {
    setOnboardingDataState(defaultOnboardingData);
    localStorage.removeItem('onboardingData');
  };

  return (
    <OnboardingContext.Provider
      value={{
        onboardingData,
        updateOnboardingData,
        setOnboardingData,
        completeOnboarding,
        resetOnboarding
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}; 