import React, { createContext, useContext, useState, ReactNode } from 'react';

interface OnboardingData {
  // Step 1: Health Goals
  healthGoal: string;
  timeline: number;
  motivation: string;
  
  // Step 2: Basic Body Info
  height: number;
  weight: number;
  waist: number;
  bloodPressure: string;
  bloodSugar: string;
  
  // Step 3: Lifestyle
  exerciseFrequency: string;
  sleepHours: number;
  mealsPerDay: number;
  smoking: boolean;
  alcoholFrequency: string;
  
  // Step 4: Medical History
  medicalConditions: string[];
  surgeries: string;
  allergies: string;
  
  // Step 5: Tracking Preferences
  notifications: string[];
  trackingItems: string[];
  reminderTime: string;
  
  // Onboarding status
  isCompleted: boolean;
}

interface OnboardingContextType {
  onboardingData: OnboardingData;
  updateOnboardingData: (key: keyof OnboardingData, value: any) => void;
  setOnboardingData: (data: OnboardingData) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const defaultOnboardingData: OnboardingData = {
  healthGoal: "weight-loss",
  timeline: 6,
  motivation: "อยากมีสุขภาพที่ดีขึ้นและลดน้ำหนักเพื่อสุขภาพ",
  height: 165,
  weight: 65,
  waist: 80,
  bloodPressure: "120/80",
  bloodSugar: "95",
  exerciseFrequency: "3-5",
  sleepHours: 7,
  mealsPerDay: 3,
  smoking: false,
  alcoholFrequency: "rarely",
  medicalConditions: ["hypertension"],
  surgeries: "ไม่เคยผ่าตัด",
  allergies: "แพ้ยาเพนิซิลลิน",
  notifications: ["water", "exercise", "sleep"],
  trackingItems: ["weight", "blood-pressure"],
  reminderTime: "08:00",
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
    // Load from localStorage if available
    const saved = localStorage.getItem('onboardingData');
    if (saved) {
      try {
        return { ...JSON.parse(saved), isCompleted: false };
      } catch {
        return defaultOnboardingData;
      }
    }
    return defaultOnboardingData;
  });

  const updateOnboardingData = (key: keyof OnboardingData, value: any) => {
    const newData = { ...onboardingData, [key]: value };
    setOnboardingDataState(newData);
    // Save to localStorage
    localStorage.setItem('onboardingData', JSON.stringify(newData));
  };

  const setOnboardingData = (data: OnboardingData) => {
    setOnboardingDataState(data);
    localStorage.setItem('onboardingData', JSON.stringify(data));
  };

  const completeOnboarding = () => {
    const completedData = { ...onboardingData, isCompleted: true };
    setOnboardingDataState(completedData);
    localStorage.setItem('onboardingData', JSON.stringify(completedData));
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