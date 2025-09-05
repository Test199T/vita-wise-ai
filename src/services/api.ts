// API service for user management
import { tokenUtils } from '@/lib/utils';

const API_BASE_URL = 'http://localhost:3000';

// Health Data Interfaces
export interface HealthData {
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  body_temperature?: number;
  blood_sugar_mg_dl?: number;
  cholesterol_total?: number;
  cholesterol_hdl?: number;
  cholesterol_ldl?: number;
  triglycerides?: number;
  bmi?: number;
  body_fat_percentage?: number;
  muscle_mass_kg?: number;
  waist_circumference?: number;
  [key: string]: unknown;
}

export interface HealthGoals {
  goal_type?: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'endurance' | 'flexibility' | 'stress_reduction' | 'sleep_improvement' | 'nutrition' | 'other';
  title?: string;
  description?: string;
  target_value?: number;
  current_value?: number;
  unit?: string;
  start_date?: string;
  target_date?: string;
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  [key: string]: unknown;
}

export interface NutritionGoals {
  daily_calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  sodium_mg?: number;
  sugar_g?: number;
  water_liters?: number;
  [key: string]: unknown;
}

export interface DailyBehavior {
  exercise_frequency?: 'never' | '1-2' | '3-5' | 'daily';
  sleep_hours?: number;
  meals_per_day?: number;
  smoking?: boolean;
  alcohol_frequency?: 'never' | 'rarely' | 'weekly' | 'daily';
  caffeine_cups_per_day?: number;
  screen_time_hours?: 'lt2' | '2-4' | '4-6' | 'gt6';
  stress_level?: 'low' | 'medium' | 'high';
  water_intake_glasses?: number;
  [key: string]: unknown;
}

export interface MedicalHistory {
  conditions?: string[];
  surgeries?: string;
  allergies?: string;
  medications?: string[];
  family_history?: string;
  [key: string]: unknown;
}

// User Profile Interface
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  height_cm?: number;
  weight_kg?: number;
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  health_data?: HealthData;
  health_goals?: HealthGoals;
  nutrition_goals?: NutritionGoals;
  daily_behavior?: DailyBehavior;
  medical_history?: MedicalHistory;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// API Error Interface
export interface APIError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

// Exercise Log Interface
export interface ExerciseLog {
  id?: number | string; // ID จาก Backend
  exercise_name: string;
  exercise_type: string;
  duration_minutes: number;
  sets?: number | null;
  reps?: number | null;
  weight_kg?: number | null;
  distance_km?: number | null;
  calories_burned: number;
  intensity: string;
  notes?: string;
  exercise_date: string;
  exercise_time: string;
}

// Food Log Interface
export interface FoodLogItem {
  id?: string; // Database ID for deletion (optional for new entries)
  _id?: string; // Alternative ID field name (MongoDB style)
  uuid?: string; // Alternative ID field name
  food_log_id?: string; // Alternative ID field name
  user_id?: number; // User ID for filtering
  user_email?: string; // User email for fallback filtering
  food_name: string;
  meal_type: string;
  serving_size: number;
  serving_unit: string;
  calories_per_serving: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  consumed_at: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Water Log Interface
export interface WaterLogItem {
  id?: string | number; // Database ID
  user_id?: number; // User ID for filtering
  amount_ml: number; // Amount in milliliters
  drink_type: string; // Type of drink (water, tea, coffee, etc.)
  notes?: string; // Optional notes
  consumed_at: string; // ISO datetime string
  created_at?: string;
  updated_at?: string;
}

// Food Log API Response
interface FoodLogResponse {
  data?: FoodLogItem;
  message?: string;
  errors?: Record<string, string[]>;
}

// Water Log API Response
interface WaterLogResponse {
  data?: WaterLogItem;
  message?: string;
  errors?: Record<string, string[]>;
}

// Exercise Log API Response
interface ExerciseLogResponse {
  data?: ExerciseLog;
  message?: string;
  errors?: Record<string, string[]>;
}

// API Response Interface
interface APIResponse<T> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// API Response Interface
interface APIResponse<T> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

class APIService {
  private baseURL: string;
  private workingEndpoints: Map<string, string>;
  private requestQueue: Map<string, Promise<unknown>> = new Map(); // Prevent duplicate requests
  private lastRequestTime: Map<string, number> = new Map(); // Rate limiting
  private readonly MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    // Load cached endpoints from localStorage
    this.workingEndpoints = this.loadCachedEndpoints();
  }

  // Rate limiting and duplicate request prevention
  private canMakeRequest(endpoint: string): boolean {
    const now = Date.now();
    const lastTime = this.lastRequestTime.get(endpoint) || 0;
    
    // Reduce rate limiting interval for profile requests to improve UX
    const interval = endpoint === 'profile-get' ? 0 : this.MIN_REQUEST_INTERVAL;
    
    if (now - lastTime < interval) {
      console.log(`⏳ Rate limiting: Please wait ${interval}ms between requests for ${endpoint}`);
      return false;
    }
    
    return true;
  }

  private setRequestTime(endpoint: string): void {
    this.lastRequestTime.set(endpoint, Date.now());
  }

  // Load cached endpoints from localStorage
  private loadCachedEndpoints(): Map<string, string> {
    try {
      const cached = localStorage.getItem('api_cached_endpoints');
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log('🎯 Loaded cached endpoints:', parsed);
        return new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.log('Failed to load cached endpoints:', error);
    }
    return new Map();
  }

  // Save cached endpoints to localStorage
  private saveCachedEndpoints(): void {
    try {
      const obj = Object.fromEntries(this.workingEndpoints);
      localStorage.setItem('api_cached_endpoints', JSON.stringify(obj));
      console.log('💾 Saved cached endpoints:', obj);
    } catch (error) {
      console.log('Failed to save cached endpoints:', error);
    }
  }

  // Helper method to get headers with auth token
  private getHeaders(): HeadersInit {
    const token = tokenUtils.getValidToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Helper method to handle API responses
  private async handleResponse<T>(response: Response): Promise<T> {
    try {
      const data = await response.json();
      
      if (!response.ok) {
        const error: APIError = {
          message: data.message || 'An error occurred',
          errors: data.errors,
          status: response.status
        };
        throw error;
      }

      return data;
    } catch (error) {
      if (error instanceof SyntaxError) {
        // JSON parsing error
        throw new Error('Invalid response from server');
      }
      throw error;
    }
  }

  // Get current user profile with smart endpoint caching
  async getCurrentUserProfile(): Promise<UserProfile> {
    console.log('Fetching current user profile...');
    
    // Check for existing request first
    const existingRequest = this.requestQueue.get('profile-get');
    if (existingRequest) {
      console.log('⏳ Using existing profile request...');
      return existingRequest as Promise<UserProfile>;
    }
    
    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    // Skip rate limiting for profile requests to improve UX
    // No rate limiting check for profile requests

    // Create new request and add to queue
    const requestPromise = this.fetchUserProfileInternal();
    this.requestQueue.set('profile-get', requestPromise);
    this.setRequestTime('profile-get');

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Remove from queue when done
      this.requestQueue.delete('profile-get');
    }
  }

  // Internal method to fetch user profile
  private async fetchUserProfileInternal(): Promise<UserProfile> {

    // Check if we already know a working endpoint
    const cachedEndpoint = this.workingEndpoints.get('profile-get');
    if (cachedEndpoint) {
      console.log(`Using cached endpoint: ${cachedEndpoint}`);
      try {
        const response = await fetch(`${this.baseURL}${cachedEndpoint}`, {
          method: 'GET',
          headers: this.getHeaders(),
          signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
          const result = await this.handleResponse<APIResponse<UserProfile>>(response);
          if (result.data) {
            console.log('Profile data received from cached endpoint');
            return result.data;
          }
        } else {
          // Cached endpoint stopped working, remove from cache
          console.log('❌ Cached endpoint failed, will try alternatives');
          this.workingEndpoints.delete('profile-get');
          this.saveCachedEndpoints(); // Update localStorage
        }
      } catch (error) {
        console.log('❌ Cached endpoint error, will try alternatives');
        this.workingEndpoints.delete('profile-get');
        this.saveCachedEndpoints(); // Update localStorage
      }
    }

    // List of possible endpoints to try
    const endpoints = [
      '/user/profile',     // Primary endpoint
      '/users/profile',    // Alternative endpoint
      '/profile',          // Simple endpoint
      '/me',              // Common REST pattern
      '/user/me',         // Another common pattern
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        
        const response = await fetch(`${this.baseURL}${endpoint}`, {
          method: 'GET',
          headers: this.getHeaders(),
          signal: AbortSignal.timeout(5000) // 5 second timeout per endpoint
        });

        if (response.ok) {
          console.log(`✅ Success with endpoint: ${endpoint}`);
          // Cache this working endpoint for future use
          this.workingEndpoints.set('profile-get', endpoint);
          this.saveCachedEndpoints(); // Save to localStorage
          
          const result = await this.handleResponse<APIResponse<UserProfile>>(response);
          
          if (result.data) {
            console.log('Profile data received:', {
              id: result.data.id,
              email: result.data.email,
              name: `${result.data.first_name} ${result.data.last_name}`,
              hasHealthData: !!result.data.health_data,
              hasHealthGoals: !!result.data.health_goals
            });
            return result.data;
          }
        } else if (response.status === 404) {
          console.log(`❌ Endpoint ${endpoint} not found, trying next...`);
          continue;
        } else {
          // Other errors (401, 403, 500, etc.)
          const result = await this.handleResponse<APIResponse<UserProfile>>(response);
        }
      } catch (error) {
        console.log(`❌ Error with endpoint ${endpoint}:`, error);
        continue;
      }
    }

    // If all endpoints failed, check if API is available at all
    try {
      const apiAvailable = await this.checkConnection();
      
      if (!apiAvailable) {
        console.error('❌ Backend API not available at:', this.baseURL);
        throw new Error('Backend API is not running. Please start the backend server.');
      }
    } catch (error) {
      console.error('❌ API connection check failed:', error);
      throw new Error('Cannot connect to backend API. Please check if backend server is running.');
    }

    // If API is available but no profile endpoint works, throw error
    console.error('❌ No working profile endpoint found!');
    console.error('Backend needs to implement one of these endpoints:');
    console.error('- GET /user/profile (Primary)');
    console.error('- GET /users/profile');
    console.error('- GET /profile');
    console.error('- GET /me');
    console.error('- GET /user/me');
    
    throw new Error(`Profile endpoint not found. Backend needs to implement one of the profile endpoints. Current backend URL: ${this.baseURL}`);
  }

  // Update user profile with smart endpoint caching
  async updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    console.log('Updating user profile...', profileData);

    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }


    // Check if we already know a working update endpoint
    const cachedEndpoint = this.workingEndpoints.get('profile-update');
    if (cachedEndpoint) {
      const [method, path] = cachedEndpoint.split(' ');
      console.log(`Using cached update endpoint: ${method} ${path}`);
      
      try {
        const response = await fetch(`${this.baseURL}${path}`, {
          method: method,
          headers: this.getHeaders(),
          body: JSON.stringify(profileData),
          signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
          const result = await this.handleResponse<APIResponse<UserProfile>>(response);
          if (result.data) {
            console.log('Profile updated successfully with cached endpoint');
            return result.data;
          }
        } else {
          // Cached endpoint stopped working, remove from cache
          console.log('❌ Cached update endpoint failed, will try alternatives');
          this.workingEndpoints.delete('profile-update');
          this.saveCachedEndpoints(); // Update localStorage
        }
      } catch (error) {
        console.log('❌ Cached update endpoint error, will try alternatives');
        this.workingEndpoints.delete('profile-update');
        this.saveCachedEndpoints(); // Update localStorage
      }
    }

    // List of possible endpoints to try for updating
    const endpoints = [
      { method: 'PUT', path: '/user/profile' },      // Primary endpoint (matches backend)
      { method: 'PATCH', path: '/user/profile' },    // PATCH version
      { method: 'PUT', path: '/profile' },           // Simple
      { method: 'PUT', path: '/me' },                // Common REST
      { method: 'PUT', path: '/users/profile' },     // Alternative (plural)
      { method: 'PATCH', path: '/users/profile' },
      { method: 'PATCH', path: '/profile' },
      { method: 'PATCH', path: '/me' },
      { method: 'POST', path: '/user/profile/update' }, // Alternative update pattern
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying ${endpoint.method} ${endpoint.path}`);
        
        const response = await fetch(`${this.baseURL}${endpoint.path}`, {
          method: endpoint.method,
          headers: this.getHeaders(),
          body: JSON.stringify(profileData),
          signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
          console.log(`✅ Success with ${endpoint.method} ${endpoint.path}`);
          // Cache this working endpoint for future use
          this.workingEndpoints.set('profile-update', `${endpoint.method} ${endpoint.path}`);
          this.saveCachedEndpoints(); // Save to localStorage
          
          const result = await this.handleResponse<APIResponse<UserProfile>>(response);
          
          if (result.data) {
            console.log('Profile updated successfully:', {
              id: result.data.id,
              email: result.data.email,
              updated_at: result.data.updated_at
            });
            return result.data;
          }
        } else if (response.status === 404) {
          console.log(`❌ ${endpoint.method} ${endpoint.path} not found, trying next...`);
          continue;
        } else {
          // Other errors (401, 403, 400, 500, etc.)
          console.log(`❌ ${endpoint.method} ${endpoint.path} failed with status ${response.status}`);
          continue;
        }
      } catch (error) {
        console.log(`❌ Error with ${endpoint.method} ${endpoint.path}:`, error);
        continue;
      }
    }

    // If all endpoints failed, throw error instead of using mock data
    console.error('❌ No working update endpoint found!');
    console.error('Backend needs to implement one of these endpoints:');
    console.error('- PUT /users/profile (Primary)');
    console.error('- PATCH /users/profile');
    console.error('- PUT /user/profile');
    console.error('- PATCH /user/profile');
    console.error('- PUT /profile');
    console.error('- PATCH /profile');
    console.error('- PUT /me');
    console.error('- PATCH /me');
    console.error('- POST /user/profile/update');
    
    throw new Error(`Profile update endpoint not found. Backend needs to implement PUT /users/profile endpoint. Current backend URL: ${this.baseURL}`);
  }

  // Save onboarding data to backend
  async saveOnboardingData(onboardingData: Record<string, unknown>): Promise<UserProfile> {
    console.log('🎯 Saving onboarding data to backend...', onboardingData);

    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    // Convert onboarding data to user profile format
    const profileData = this.convertOnboardingToProfile(onboardingData);
    console.log('📝 Converted profile data:', profileData);
    
    // ตรวจสอบข้อมูลชื่อ - เพิ่มการตรวจสอบที่เข้มงวด
    console.log('🔍 Name data check:', {
      firstName: profileData.first_name,
      lastName: profileData.last_name,
      firstNameType: typeof profileData.first_name,
      lastNameType: typeof profileData.last_name,
      firstNameLength: profileData.first_name?.length,
      lastNameLength: profileData.last_name?.length,
      source: 'API Service'
    });
    
    // Validate that we have valid names before proceeding
    if (!profileData.first_name || !profileData.last_name || 
        typeof profileData.first_name !== 'string' || typeof profileData.last_name !== 'string' ||
        profileData.first_name.trim() === '' || profileData.last_name.trim() === '') {
      console.error('❌ Invalid name data detected:', {
        first_name: profileData.first_name,
        last_name: profileData.last_name
      });
      throw new Error('First name and last name are required and cannot be empty');
    }

    // Try to update user profile with onboarding data
    try {
      return await this.updateUserProfile(profileData);
    } catch (error) {
      console.error('Update failed, trying to create profile:', error);
      // If update fails, try to create user profile
      return await this.createUserProfile(profileData);
    }
  }

  // Convert onboarding data to user profile format
  private convertOnboardingToProfile(onboardingData: Record<string, unknown>): Partial<UserProfile> {
    // ใช้ Logic เดียวกับ Profile page ที่อัพเดตชื่อได้
    const firstName = (onboardingData.firstName as string)?.trim() || 
                     (onboardingData.registrationFirstName as string)?.trim() || '';
    const lastName = (onboardingData.lastName as string)?.trim() || 
                    (onboardingData.registrationLastName as string)?.trim() || '';

    console.log('🔍 Name data in convertOnboardingToProfile:', {
      firstName,
      lastName,
      source: 'Direct from onboarding data (using Profile logic)'
    });

    // Calculate BMI if height and weight are available
    const height = onboardingData.height as number;
    const weight = onboardingData.weight as number;
    const bmi = height && weight ? weight / Math.pow(height / 100, 2) : undefined;

    // Return only the fields that the backend DTO expects
    return {
      first_name: firstName,
      last_name: lastName,
      date_of_birth: onboardingData.birthDate as string,
      gender: onboardingData.sex as 'male' | 'female' | 'other',
      height_cm: onboardingData.height as number,
      weight_kg: onboardingData.weight as number,
      activity_level: this.mapActivityLevel(onboardingData.activityLevel as string),
      
      // เพิ่มข้อมูล 5 ตัวที่ขาดหายไป
      health_data: {
        blood_pressure_systolic: this.extractBloodPressure(onboardingData.bloodPressure as string, 'systolic'),
        blood_pressure_diastolic: this.extractBloodPressure(onboardingData.bloodPressure as string, 'diastolic'),
        blood_sugar_mg_dl: onboardingData.bloodSugar ? parseFloat(onboardingData.bloodSugar as string) : undefined,
        bmi: bmi,
        waist_circumference: onboardingData.waist as number,
      },
      
      health_goals: {
        goal_type: this.mapHealthGoal(onboardingData.healthGoal as string),
        title: this.getHealthGoalTitle(onboardingData.healthGoal as string),
        description: onboardingData.motivation as string,
        target_value: onboardingData.timeline as number,
        unit: 'months',
        start_date: new Date().toISOString().split('T')[0],
        target_date: this.calculateTargetDate(onboardingData.timeline as number),
        status: 'active',
        priority: 'medium',
      },
      
      nutrition_goals: {
        daily_calories: 2000, // ค่าเริ่มต้น
        protein_g: 60,
        carbs_g: 250,
        fat_g: 65,
        fiber_g: 25,
        sodium_mg: 2300,
        water_liters: (onboardingData as unknown as Record<string, unknown>).waterIntakeGlasses as number || 6,
      },
      
      daily_behavior: {
        exercise_frequency: onboardingData.exerciseFrequency as 'never' | '1-2' | '3-5' | 'daily',
        sleep_hours: onboardingData.sleepHours as number,
        meals_per_day: onboardingData.mealsPerDay as number,
        smoking: onboardingData.smoking as boolean,
        alcohol_frequency: onboardingData.alcoholFrequency as 'never' | 'rarely' | 'weekly' | 'daily',
        caffeine_cups_per_day: (onboardingData as unknown as Record<string, unknown>).caffeineCupsPerDay as number || 0,
        screen_time_hours: (onboardingData as unknown as Record<string, unknown>).screenTimeHours as 'lt2' | '2-4' | '4-6' | 'gt6' || '2-4',
        stress_level: (onboardingData as unknown as Record<string, unknown>).stressLevel as 'low' | 'medium' | 'high' || 'medium',
        water_intake_glasses: (onboardingData as unknown as Record<string, unknown>).waterIntakeGlasses as number || 6,
      },
      
      medical_history: {
        conditions: onboardingData.medicalConditions as string[] || [],
        surgeries: onboardingData.surgeries as string || '',
        allergies: onboardingData.allergies as string || '',
        medications: [],
        family_history: '',
      },
    };
  }

  // Helper methods for data conversion
  private mapActivityLevel(level: string): UserProfile['activity_level'] {
    const mapping: Record<string, UserProfile['activity_level']> = {
      'sedentary': 'sedentary',
      'light': 'lightly_active',
      'moderate': 'moderately_active',
      'active': 'very_active',
      'very-active': 'extremely_active',
    };
    return mapping[level] || 'moderately_active';
  }

  // Extract blood pressure values from "120/80" format
  private extractBloodPressure(bloodPressure: string, type: 'systolic' | 'diastolic'): number | undefined {
    if (!bloodPressure || !bloodPressure.includes('/')) return undefined;
    const parts = bloodPressure.split('/');
    if (parts.length !== 2) return undefined;
    
    const systolic = parseInt(parts[0]);
    const diastolic = parseInt(parts[1]);
    
    return type === 'systolic' ? systolic : diastolic;
  }

  // Map health goal from frontend to backend format
  private mapHealthGoal(healthGoal: string): HealthGoals['goal_type'] {
    const mapping: Record<string, HealthGoals['goal_type']> = {
      'weight-loss': 'weight_loss',
      'muscle-gain': 'muscle_gain',
      'healthy-diet': 'nutrition',
      'fitness': 'endurance',
      'other': 'other',
    };
    return mapping[healthGoal] || 'other';
  }

  // Get health goal title in Thai
  private getHealthGoalTitle(healthGoal: string): string {
    const titles: Record<string, string> = {
      'weight-loss': 'ลดน้ำหนัก',
      'muscle-gain': 'เพิ่มกล้ามเนื้อ',
      'healthy-diet': 'คุมอาหารเพื่อสุขภาพ',
      'fitness': 'เพิ่มพลังงาน / ความฟิต',
      'other': 'เป้าหมายอื่นๆ',
    };
    return titles[healthGoal] || 'เป้าหมายสุขภาพ';
  }

  // Calculate target date based on timeline months
  private calculateTargetDate(timelineMonths: number): string {
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + timelineMonths);
    return targetDate.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  // Calculate daily calories based on user data (simplified BMR calculation)
  private calculateDailyCalories(data: Record<string, unknown>): number {
    const weight = data.weight as number || 70;
    const height = data.height as number || 170;
    const age = this.calculateAge(data.birthDate as string) || 25;
    const sex = data.sex as string || 'male';
    const activityLevel = data.activityLevel as string || 'moderate';

    // Mifflin-St Jeor Equation
    let bmr: number;
    if (sex === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Activity multipliers
    const activityMultipliers: Record<string, number> = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'active': 1.725,
      'very-active': 1.9,
    };

    const multiplier = activityMultipliers[activityLevel] || 1.55;
    return Math.round(bmr * multiplier);
  }

  // Calculate age from birthdate
  private calculateAge(birthDate: string): number | undefined {
    if (!birthDate) return undefined;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  // Create user profile (for new users)
  async createUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    console.log('🆕 Creating user profile...', profileData);

    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    // List of possible endpoints to try for creating
    const endpoints = [
      { method: 'POST', path: '/users/profile' },      // Primary endpoint
      { method: 'POST', path: '/user/profile' },       // Alternative
      { method: 'POST', path: '/profile' },            // Simple
      { method: 'PUT', path: '/users/profile' },       // Some APIs use PUT for create
      { method: 'PUT', path: '/user/profile' },        // Alternative PUT
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying ${endpoint.method} ${endpoint.path}`);
        
        const response = await fetch(`${this.baseURL}${endpoint.path}`, {
          method: endpoint.method,
          headers: this.getHeaders(),
          body: JSON.stringify(profileData),
          signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
          console.log(`✅ Profile created with ${endpoint.method} ${endpoint.path}`);
          const result = await this.handleResponse<APIResponse<UserProfile>>(response);
          
          if (result.data) {
            console.log('Profile created successfully:', result.data);
            return result.data;
          }
        } else if (response.status === 404) {
          console.log(`❌ ${endpoint.method} ${endpoint.path} not found, trying next...`);
          continue;
        } else {
          console.log(`❌ ${endpoint.method} ${endpoint.path} failed with status ${response.status}`);
          continue;
        }
      } catch (error) {
        console.log(`❌ Error with ${endpoint.method} ${endpoint.path}:`, error);
        continue;
      }
    }

    // If all endpoints failed, throw error
    console.error('❌ No working profile creation endpoint found!');
    throw new Error(`Profile creation endpoint not found. Backend needs to implement POST /users/profile endpoint.`);
  }

  // Get user health data
  async getUserHealthData(): Promise<HealthData | null> {
    console.log('Fetching user health data...');

    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    try {
      const response = await fetch(`${this.baseURL}/user/health-data`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      console.log('Health data API response:', {
        status: response.status,
        statusText: response.statusText
      });

      const result = await this.handleResponse<APIResponse<HealthData>>(response);
      
      if (result.data) {
        console.log('Health data received successfully');
        return result.data;
      } else {
        console.log('No health data found for user');
        return null;
      }
    } catch (error) {
      console.error('Error fetching health data:', error);
      throw error;
    }
  }

  // Update user health data
  async updateUserHealthData(healthData: HealthData): Promise<HealthData> {
    console.log('Updating user health data...', healthData);

    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    try {
      const response = await fetch(`${this.baseURL}/user/health-data`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(healthData),
      });

      console.log('Health data update API response:', {
        status: response.status,
        statusText: response.statusText
      });

      const result = await this.handleResponse<APIResponse<HealthData>>(response);
      
      if (result.data) {
        console.log('Health data updated successfully');
        return result.data;
      } else {
        throw new Error('No updated health data received from server');
      }
    } catch (error) {
      console.error('Error updating health data:', error);
      throw error;
    }
  }

  // Check API connection and discover available endpoints
  async checkConnection(): Promise<boolean> {
    const endpoints = ['/health', '/api/health', '/status', '/ping'];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(3000)
        });

        if (response.ok) {
          console.log(`API available at: ${this.baseURL}${endpoint}`);
          return true;
        }
      } catch (error) {
        console.log(`Endpoint ${endpoint} not available:`, error);
        continue;
      }
    }
    
    console.error('No health check endpoints available');
    return false;
  }

  // Discover available API endpoints
  async discoverEndpoints(): Promise<string[]> {
    const commonEndpoints = [
      '/user/profile',
      '/users/profile', 
      '/profile',
      '/me',
      '/user/me',
      '/api/user/profile',
      '/api/users/profile',
      '/api/profile',
      '/api/me'
    ];

    const availableEndpoints: string[] = [];
    
    for (const endpoint of commonEndpoints) {
      try {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
          method: 'OPTIONS', // Use OPTIONS to check if endpoint exists
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(2000)
        });

        if (response.status !== 404) {
          availableEndpoints.push(endpoint);
        }
      } catch (error) {
        // Ignore errors for discovery
        continue;
      }
    }

    console.log('Available endpoints:', availableEndpoints);
    return availableEndpoints;
  }

  // Mock API for testing when backend is not ready
  async getMockProfile(): Promise<UserProfile> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: 1,
      username: "testuser",
      email: "test@example.com",
      first_name: "ทดสอบ",
      last_name: "ระบบ",
      date_of_birth: "1990-01-01",
      gender: "male",
      height_cm: 175,
      weight_kg: 70,
      activity_level: "moderately_active",
      health_data: {
        bmi: 22.9,
        blood_pressure_systolic: 120,
        blood_pressure_diastolic: 80,
      },
      health_goals: {
        goal_type: "weight_loss",
        title: "ลดน้ำหนัก 5 กิโลกรัม",
        target_value: 65,
        current_value: 70,
        unit: "kg"
      },
      nutrition_goals: {
        daily_calories: 2000,
        protein_g: 60,
        carbs_g: 250,
        fat_g: 65
      },
      daily_behavior: {
        exercise_frequency: "3-5",
        sleep_hours: 7,
        meals_per_day: 3
      },
      medical_history: {
        conditions: [],
        allergies: "ไม่มี"
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true
    };
  }

  // Forgot Password - Send reset email
  async forgotPassword(email: string): Promise<void> {
    console.log('Sending forgot password email to:', email);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock validation - check if email exists
    // รองรับอีเมลที่มีอยู่ในฐานข้อมูลจริง
    const validEmails = [
      "test@example.com",
      "methasphoynxk90@gmail.com",
      "testuser789@gmail.com",
      "zoomgamer807@gmail.com",
      "asngiun@gmail.com",
      "johndoe123@gmail.com",
      "postman_test@gmail.com",
      "ppansiun@gmail.com"
    ];
    
    if (validEmails.includes(email)) {
      console.log('✅ Forgot password email sent successfully');
      return;
    } else {
      throw new Error('User not found');
    }
  }

  // Validate Reset Token
  async validateResetToken(token: string): Promise<boolean> {
    console.log('Validating reset token:', token);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation - check if token is valid
    if (token && token.length > 10) {
      console.log('✅ Reset token is valid');
      return true;
    } else {
      throw new Error('Invalid or expired token');
    }
  }

  // Reset Password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    console.log('Resetting password with token:', token);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock validation - check if token is valid and password meets requirements
    if (!token || token.length < 10) {
      throw new Error('Invalid or expired token');
    }
    
    if (newPassword.length < 8) {
      throw new Error('Password too short');
    }
    
    console.log('✅ Password reset successfully');
    return;
  }

  // Create exercise log entry
  async createExerciseLog(exerciseData: ExerciseLog): Promise<ExerciseLog> {
    console.log('Creating exercise log entry...', exerciseData);

    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    try {
      const response = await fetch(`${this.baseURL}/exercise-log`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(exerciseData),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      console.log('Exercise log API response:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await this.handleResponse<ExerciseLogResponse>(response);
      
      if (result.data) {
        console.log('Exercise log created successfully');
        return result.data;
      } else {
        throw new Error('No exercise log data received from server');
      }
    } catch (error) {
      console.error('Error creating exercise log:', error);
      throw error;
    }
  }

  // Get exercise logs for a user
  async getExerciseLogs(): Promise<ExerciseLog[]> {
    console.log('Fetching exercise logs...');

    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    try {
      const response = await fetch(`${this.baseURL}/exercise-log`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      console.log('Get exercise logs API response:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await this.handleResponse<{ data?: ExerciseLog[] }>(response);
      
      if (result.data) {
        console.log('Exercise logs fetched successfully');
        return result.data;
      } else {
        console.log('No exercise logs found for user');
        return [];
      }
    } catch (error) {
      console.error('Error fetching exercise logs:', error);
      throw error;
    }
  }

  // Delete exercise log entry
  async deleteExerciseLog(exerciseLogId: string | number): Promise<void> {
    console.log('🗑️ Deleting exercise log entry...', exerciseLogId);
    console.log('🌐 API URL:', `${this.baseURL}/exercise-log/${exerciseLogId}`);

    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    console.log('🔑 Token found:', token.substring(0, 20) + '...');

    try {
      const response = await fetch(`${this.baseURL}/exercise-log/${exerciseLogId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      console.log('📡 Delete exercise log API response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
        }
        
        // แยกประเภท error ตาม HTTP status code
        switch (response.status) {
          case 401:
            throw new Error('Unauthorized: กรุณาเข้าสู่ระบบใหม่');
          case 403:
            throw new Error('Forbidden: ไม่มีสิทธิ์ในการลบข้อมูลนี้');
          case 404:
            throw new Error('Not Found: ไม่พบข้อมูลที่ต้องการลบ');
          case 500:
            throw new Error('Internal Server Error: เกิดข้อผิดพลาดที่เซิร์ฟเวอร์');
          default:
            throw new Error(errorMessage);
        }
      }

      // ตรวจสอบ response body ถ้ามี
      try {
        const responseText = await response.text();
        if (responseText) {
          console.log('📄 Response body:', responseText);
        }
      } catch (textError) {
        // ไม่มี response body (ปกติสำหรับ DELETE)
      }

      console.log('✅ Exercise log deleted successfully from backend');
    } catch (error) {
      console.error('❌ Error deleting exercise log:', error);
      
      // ถ้าเป็น network error หรือ timeout
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      }
      
      // ถ้าเป็น timeout error
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('การลบข้อมูลใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง');
      }
      
      throw error;
    }
  }

  // Update exercise log entry
  async updateExerciseLog(exerciseLogId: string | number, updateData: Partial<ExerciseLog>): Promise<ExerciseLog> {
    console.log('✏️ Updating exercise log entry...', exerciseLogId);
    console.log('🌐 API URL:', `${this.baseURL}/exercise-log/${exerciseLogId}`);
    console.log('📝 Update data:', updateData);

    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    console.log('🔑 Token found:', token.substring(0, 20) + '...');

    try {
      const response = await fetch(`${this.baseURL}/exercise-log/${exerciseLogId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updateData),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      console.log('📡 Update exercise log API response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
        }
        
        // แยกประเภท error ตาม HTTP status code
        switch (response.status) {
          case 400:
            throw new Error('Bad Request: ข้อมูลที่ส่งไปไม่ถูกต้อง');
          case 401:
            throw new Error('Unauthorized: กรุณาเข้าสู่ระบบใหม่');
          case 403:
            throw new Error('Forbidden: ไม่มีสิทธิ์ในการอัปเดตข้อมูลนี้');
          case 404:
            throw new Error('Not Found: ไม่พบข้อมูลที่ต้องการอัปเดต');
          case 500:
            throw new Error('Internal Server Error: เกิดข้อผิดพลาดที่เซิร์ฟเวอร์');
          default:
            throw new Error(errorMessage);
        }
      }

      // อ่าน response body
      const result = await this.handleResponse<ExerciseLogResponse>(response);
      
      if (result.data) {
        console.log('✅ Exercise log updated successfully from backend');
        console.log('📄 Updated data:', result.data);
        return result.data;
      } else {
        throw new Error('No updated exercise log data received from server');
      }
    } catch (error) {
      console.error('❌ Error updating exercise log:', error);
      
      // ถ้าเป็น network error หรือ timeout
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      }
      
      // ถ้าเป็น timeout error
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('การอัปเดตข้อมูลใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง');
      }
      
      throw error;
    }
  }

  // ฟังก์ชันสำหรับ Dashboard - Exercise Statistics
  async getExerciseStats(date?: string): Promise<any> {
    console.log('📊 Getting exercise stats...');
    
    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    try {
      const url = date 
        ? `${this.baseURL}/exercise-log/stats?date=${date}`
        : `${this.baseURL}/exercise-log/stats`;
        
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
        }
        
        switch (response.status) {
          case 401:
            throw new Error('Unauthorized: กรุณาเข้าสู่ระบบใหม่');
          case 500:
            throw new Error('Internal Server Error: เกิดข้อผิดพลาดที่เซิร์ฟเวอร์');
          default:
            throw new Error(errorMessage);
        }
      }

      const result = await this.handleResponse<any>(response);
      console.log('✅ Exercise stats loaded successfully');
      return result;
    } catch (error) {
      console.error('❌ Error getting exercise stats:', error);
      throw error;
    }
  }

  // ฟังก์ชันสำหรับ Dashboard - Calories Summary
  async getCaloriesSummary(startDate?: string, endDate?: string): Promise<any> {
    console.log('🔥 Getting calories summary...');
    
    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    try {
      let url = `${this.baseURL}/exercise-log/calories/summary`;
      const params = new URLSearchParams();
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
        
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
        }
        
        switch (response.status) {
          case 401:
            throw new Error('Unauthorized: กรุณาเข้าสู่ระบบใหม่');
          case 500:
            throw new Error('Internal Server Error: เกิดข้อผิดพลาดที่เซิร์ฟเวอร์');
          default:
            throw new Error(errorMessage);
        }
      }

      const result = await this.handleResponse<any>(response);
      console.log('✅ Calories summary loaded successfully');
      return result;
    } catch (error) {
      console.error('❌ Error getting calories summary:', error);
      throw error;
    }
  }

  // ฟังก์ชันสำหรับ Dashboard - Nutrition Analysis
  async getNutritionAnalysis(date?: string): Promise<any> {
    console.log('🥗 Getting nutrition analysis...');
    
    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    try {
      const url = date 
        ? `${this.baseURL}/food-log/nutrition-analysis?date=${date}`
        : `${this.baseURL}/food-log/nutrition-analysis`;
        
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
        }
        
        switch (response.status) {
          case 401:
            throw new Error('Unauthorized: กรุณาเข้าสู่ระบบใหม่');
          case 500:
            throw new Error('Internal Server Error: เกิดข้อผิดพลาดที่เซิร์ฟเวอร์');
          default:
            throw new Error(errorMessage);
        }
      }

      const result = await this.handleResponse<any>(response);
      console.log('✅ Nutrition analysis loaded successfully');
      return result;
    } catch (error) {
      console.error('❌ Error getting nutrition analysis:', error);
      throw error;
    }
  }

  // ฟังก์ชันสำหรับ Dashboard - Food Log Summary
  async getFoodLogSummary(period: string = 'day', startDate?: string, endDate?: string): Promise<any> {
    console.log('📋 Getting food log summary...');
    
    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    try {
      let url = `${this.baseURL}/food-log/summary?period=${period}`;
      const params = new URLSearchParams();
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      if (params.toString()) {
        url += `&${params.toString()}`;
      }
        
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
        }
        
        switch (response.status) {
          case 401:
            throw new Error('Unauthorized: กรุณาเข้าสู่ระบบใหม่');
          case 500:
            throw new Error('Internal Server Error: เกิดข้อผิดพลาดที่เซิร์ฟเวอร์');
          default:
            throw new Error(errorMessage);
        }
      }

      const result = await this.handleResponse<any>(response);
      console.log('✅ Food log summary loaded successfully');
      return result;
    } catch (error) {
      console.error('❌ Error getting food log summary:', error);
      throw error;
    }
  }

  // ฟังก์ชันสำหรับ Dashboard - Food Log Dashboard
  async getFoodLogDashboard(): Promise<any> {
    console.log('📊 Getting food log dashboard data...');
    
    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    try {
      const url = `${this.baseURL}/food-log/dashboard`;
        
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
        }
        
        switch (response.status) {
          case 401:
            throw new Error('Unauthorized: กรุณาเข้าสู่ระบบใหม่');
          case 500:
            throw new Error('Internal Server Error: เกิดข้อผิดพลาดที่เซิร์ฟเวอร์');
          default:
            throw new Error(errorMessage);
        }
      }

      const result = await this.handleResponse<any>(response);
      console.log('✅ Food log dashboard data loaded successfully');
      return result;
    } catch (error) {
      console.error('❌ Error getting food log dashboard data:', error);
      throw error;
    }
  }

  // ฟังก์ชันสำหรับ Dashboard - Exercise Streak
  async getExerciseStreak(): Promise<any> {
    console.log('🔥 Getting exercise streak...');
    
    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    try {
      const response = await fetch(`${this.baseURL}/exercise-log/streak/current`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
        }
        
        switch (response.status) {
          case 401:
            throw new Error('Unauthorized: กรุณาเข้าสู่ระบบใหม่');
          case 500:
            throw new Error('Internal Server Error: เกิดข้อผิดพลาดที่เซิร์ฟเวอร์');
          default:
            throw new Error(errorMessage);
        }
      }

      const result = await this.handleResponse<any>(response);
      console.log('✅ Exercise streak loaded successfully');
      return result;
    } catch (error) {
      console.error('❌ Error getting exercise streak:', error);
      throw error;
    }
  }

  // ฟังก์ชันสำหรับบันทึก Food Log
  async createFoodLog(foodLogData: FoodLogItem): Promise<FoodLogResponse> {
    console.log('🍽️ Creating food log...', foodLogData);
    
    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    try {
      const response = await fetch(`${this.baseURL}/food-log`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(foodLogData),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
        }
        
        switch (response.status) {
          case 400:
            throw new Error('Bad Request: ข้อมูลไม่ถูกต้อง');
          case 401:
            throw new Error('Unauthorized: กรุณาเข้าสู่ระบบใหม่');
          case 500:
            throw new Error('Internal Server Error: เกิดข้อผิดพลาดที่เซิร์ฟเวอร์');
          default:
            throw new Error(errorMessage);
        }
      }

      const result = await this.handleResponse<FoodLogResponse>(response);
      console.log('✅ Food log created successfully');
      return result;
    } catch (error) {
      console.error('❌ Error creating food log:', error);
      throw error;
    }
  }

  // ฟังก์ชันสำหรับดึงข้อมูล Food Logs ทั้งหมด
  async getFoodLogs(): Promise<FoodLogItem[]> {
    console.log('📋 Fetching food logs...');
    
    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    try {
      const response = await fetch(`${this.baseURL}/food-log`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
        }
        
        switch (response.status) {
          case 400:
            throw new Error('Bad Request: ข้อมูลไม่ถูกต้อง');
          case 401:
            throw new Error('Unauthorized: กรุณาเข้าสู่ระบบใหม่');
          case 500:
            throw new Error('Internal Server Error: เกิดข้อผิดพลาดที่เซิร์ฟเวอร์');
          default:
            throw new Error(errorMessage);
        }
      }

      const result = await this.handleResponse<{ data: FoodLogItem[] }>(response);
      console.log('✅ Food logs fetched successfully:', result.data);
      console.log('🔍 Raw API response structure:', JSON.stringify(result, null, 2));
      return result.data || [];
    } catch (error) {
      console.error('❌ Error fetching food logs:', error);
      throw error;
    }
  }

  // ฟังก์ชันสำหรับดึงข้อมูล Food Logs ของ User เฉพาะ
  async getUserFoodLogs(): Promise<FoodLogItem[]> {
    console.log('📋 Fetching current user food logs...');
    
    try {
      // ดึงข้อมูล profile ของ user ปัจจุบันเพื่อหา user ID
      const userProfile = await this.getCurrentUserProfile();
      console.log('👤 Current user profile:', { id: userProfile.id, email: userProfile.email });
      
      // ดึงข้อมูล food logs ทั้งหมดจาก API
      const allFoodLogs = await this.getFoodLogs();
      
      // กรองเฉพาะข้อมูลของ user ปัจจุบัน
      // หมายเหตุ: ข้อมูลจาก API ควรมี user_id field แต่ถ้าไม่มี เราจะใช้ email เป็น fallback
      const userFoodLogs = allFoodLogs.filter(log => {
        // ถ้า API ส่ง user_id มา ให้ใช้ user_id
        if ('user_id' in log && log.user_id === userProfile.id) {
          return true;
        }
        // ถ้าไม่มี user_id ให้ใช้ email เป็น fallback (ถ้า API ส่ง email มา)
        if ('user_email' in log && log.user_email === userProfile.email) {
          return true;
        }
        // ถ้าไม่มีข้อมูล user ให้แสดงเฉพาะข้อมูลที่ไม่มี user_id (fallback)
        return !('user_id' in log) && !('user_email' in log);
      });
      
      console.log(`✅ Filtered ${userFoodLogs.length} food logs for user ${userProfile.id} from total ${allFoodLogs.length}`);
      console.log('🔍 Sample user food log structure:', userFoodLogs.length > 0 ? JSON.stringify(userFoodLogs[0], null, 2) : 'No logs found');
      return userFoodLogs;
      
    } catch (error) {
      console.error('❌ Error fetching user food logs:', error);
      // ถ้าไม่สามารถดึง profile ได้ ให้ fallback ไปใช้ getFoodLogs() แบบเดิม
      console.log('⚠️ Falling back to getFoodLogs() due to profile fetch error');
      return await this.getFoodLogs();
    }
  }

  // ฟังก์ชันสำหรับลบ Food Log
  async deleteFoodLog(foodLogId: string): Promise<{ message: string }> {
    console.log('🗑️ Deleting food log...', foodLogId);
    console.log('🔗 DELETE URL:', `${this.baseURL}/food-log/${foodLogId}`);
    
    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    try {
      const response = await fetch(`${this.baseURL}/food-log/${foodLogId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      console.log('🔍 Delete API response status:', { status: response.status, statusText: response.statusText, ok: response.ok });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
        }
        
        switch (response.status) {
          case 400:
            throw new Error('Bad Request: ข้อมูลไม่ถูกต้อง');
          case 401:
            throw new Error('Unauthorized: กรุณาเข้าสู่ระบบใหม่');
          case 404:
            throw new Error('Not Found: ไม่พบรายการอาหารที่ต้องการลบ');
          case 500:
            throw new Error('Internal Server Error: เกิดข้อผิดพลาดที่เซิร์ฟเวอร์');
          default:
            throw new Error(errorMessage);
        }
      }

      const result = await this.handleResponse<{ message: string }>(response);
      console.log('✅ Food log deleted successfully');
      console.log('🔍 Delete API response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error deleting food log:', error);
      throw error;
    }
  }

  // ฟังก์ชันสำหรับอัปเดต Food Log
  async updateFoodLog(foodLogId: string, foodLogData: Partial<FoodLogItem>): Promise<FoodLogResponse> {
    console.log('✏️ Updating food log...', { foodLogId, foodLogData });
    console.log('🔗 PUT URL:', `${this.baseURL}/food-log/${foodLogId}`);
    
    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    try {
      const response = await fetch(`${this.baseURL}/food-log/${foodLogId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(foodLogData),
        signal: AbortSignal.timeout(10000)
      });

      console.log('🔍 Update API response status:', { status: response.status, statusText: response.statusText, ok: response.ok });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
        }
        
        switch (response.status) {
          case 400:
            throw new Error('Bad Request: ข้อมูลไม่ถูกต้อง');
          case 401:
            throw new Error('Unauthorized: กรุณาเข้าสู่ระบบใหม่');
          case 404:
            throw new Error('Not Found: ไม่พบรายการอาหารที่ต้องการอัปเดต');
          case 500:
            throw new Error('Internal Server Error: เกิดข้อผิดพลาดที่เซิร์ฟเวอร์');
          default:
            throw new Error(errorMessage);
        }
      }

      const result = await this.handleResponse<FoodLogResponse>(response);
      console.log('✅ Food log updated successfully');
      console.log('🔍 Update API response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error updating food log:', error);
      throw error;
    }
  }

  // Create health goal
  async createHealthGoal(healthGoalData: HealthGoals): Promise<HealthGoals> {
    console.log('🎯 Creating health goal...', healthGoalData);

    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    try {
      const response = await fetch(`${this.baseURL}/health-goals`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(healthGoalData),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      console.log('Health goal API response:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await this.handleResponse<{ data?: HealthGoals }>(response);
      
      if (result.data) {
        console.log('✅ Health goal created successfully');
        return result.data;
      } else {
        throw new Error('No health goal data received from server');
      }
    } catch (error) {
      console.error('❌ Error creating health goal:', error);
      throw error;
    }
  }

  // Get all health goals for current user
  async getHealthGoals(): Promise<HealthGoals[]> {
    console.log('📋 Fetching health goals...');

    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    try {
      const response = await fetch(`${this.baseURL}/health-goals`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      console.log('Get health goals API response:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // ใช้ handleResponse แบบ generic เพื่อให้ได้ raw response
      const result = await this.handleResponse<any>(response);
      
      console.log('🔍 Raw API result:', result);
      console.log('🔍 Result type:', typeof result);
      console.log('🔍 Is result array?', Array.isArray(result));
      
      // ตรวจสอบและแปลงข้อมูลให้เป็น array
      let goals: HealthGoals[] = [];
      
      if (Array.isArray(result)) {
        // ถ้า result เป็น array อยู่แล้ว
        goals = result;
      } else if (result && typeof result === 'object') {
        // ถ้า result เป็น object ให้ตรวจสอบ properties ต่างๆ
        if (result.data && result.data.goals && Array.isArray(result.data.goals)) {
          goals = result.data.goals;
          console.log('✅ Found goals in result.data.goals:', goals.length);
        } else if (result.data && Array.isArray(result.data)) {
          goals = result.data;
          console.log('✅ Found goals in result.data:', goals.length);
        } else if (result.goals && Array.isArray(result.goals)) {
          goals = result.goals;
          console.log('✅ Found goals in result.goals:', goals.length);
        } else if (result.items && Array.isArray(result.items)) {
          goals = result.items;
          console.log('✅ Found goals in result.items:', goals.length);
        } else if (result.health_goals && Array.isArray(result.health_goals)) {
          goals = result.health_goals;
          console.log('✅ Found goals in result.health_goals:', goals.length);
        } else {
          // ถ้าเป็น object เดียว ให้แปลงเป็น array
          goals = [result];
          console.log('⚠️ Single object converted to array - this might be wrong!');
        }
      }
      
      console.log('✅ Health goals processed successfully:', goals);
      console.log('📊 Goals count:', goals.length);
      
      return goals;
    } catch (error) {
      console.error('❌ Error fetching health goals:', error);
      throw error;
    }
  }

  // Update health goal
  async updateHealthGoal(goalId: string | number, updateData: Partial<HealthGoals>): Promise<HealthGoals> {
    console.log('✏️ Updating health goal...', { goalId, updateData });

    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    try {
      const response = await fetch(`${this.baseURL}/health-goals/${goalId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updateData),
        signal: AbortSignal.timeout(10000)
      });

      console.log('Update health goal API response:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await this.handleResponse<any>(response);
      
      console.log('🔍 Update API result:', result);
      console.log('🔍 Result type:', typeof result);
      
      // ตรวจสอบ response structure หลายแบบ
      let updatedGoal: HealthGoals | null = null;
      
      if (result.data) {
        updatedGoal = result.data;
        console.log('✅ Found updated goal in result.data');
      } else if (result.goal) {
        updatedGoal = result.goal;
        console.log('✅ Found updated goal in result.goal');
      } else if (result.health_goal) {
        updatedGoal = result.health_goal;
        console.log('✅ Found updated goal in result.health_goal');
      } else if (result && typeof result === 'object' && result.id) {
        // ถ้า result เป็น goal object โดยตรง
        updatedGoal = result;
        console.log('✅ Found updated goal as direct result');
      }
      
      if (updatedGoal) {
        console.log('✅ Health goal updated successfully:', updatedGoal);
        return updatedGoal;
      } else {
        console.log('⚠️ No updated goal data found, but API call was successful');
        // ถ้า API call สำเร็จแต่ไม่มีข้อมูลกลับมา ให้ return ข้อมูลที่ส่งไป
        return updateData as HealthGoals;
      }
    } catch (error) {
      console.error('❌ Error updating health goal:', error);
      throw error;
    }
  }

  // Delete health goal
  async deleteHealthGoal(goalId: string | number): Promise<void> {
    console.log('🗑️ Deleting health goal...', goalId);

    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    try {
      const response = await fetch(`${this.baseURL}/health-goals/${goalId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      console.log('Delete health goal API response:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      console.log('✅ Health goal deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting health goal:', error);
      throw error;
    }
  }

  // ===== WATER LOG API FUNCTIONS =====

  // Create water log entry
  async createWaterLog(waterLogData: WaterLogItem): Promise<WaterLogResponse> {
    console.log('💧 Creating water log...', waterLogData);
    console.log('🌐 API URL:', `${this.baseURL}/water-logs`);

    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    console.log('🔑 Token found:', token.substring(0, 20) + '...');

    try {
      const response = await fetch(`${this.baseURL}/water-logs`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(waterLogData),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      console.log('📡 Create water log API response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
        }
        
        // แยกประเภท error ตาม HTTP status code
        switch (response.status) {
          case 400:
            throw new Error('Bad Request: ข้อมูลที่ส่งไปไม่ถูกต้อง');
          case 401:
            throw new Error('Unauthorized: กรุณาเข้าสู่ระบบใหม่');
          case 403:
            throw new Error('Forbidden: ไม่มีสิทธิ์ในการสร้างข้อมูลนี้');
          case 500:
            throw new Error('Internal Server Error: เกิดข้อผิดพลาดที่เซิร์ฟเวอร์');
          default:
            throw new Error(errorMessage);
        }
      }

      const result = await this.handleResponse<WaterLogResponse>(response);
      
      if (result.data) {
        console.log('✅ Water log created successfully from backend');
        console.log('📄 Created data:', result.data);
        return result;
      } else {
        throw new Error('No water log data received from server');
      }
    } catch (error) {
      console.error('❌ Error creating water log:', error);
      
      // ถ้าเป็น network error หรือ timeout
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      }
      
      // ถ้าเป็น timeout error
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('การสร้างข้อมูลใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง');
      }
      
      throw error;
    }
  }

  // Get water logs for current user
  async getWaterLogs(): Promise<WaterLogItem[]> {
    console.log('💧 Fetching water logs...');
    console.log('🌐 API URL:', `${this.baseURL}/water-logs`);

    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    try {
      const response = await fetch(`${this.baseURL}/water-logs`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      console.log('📡 Get water logs API response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
        }
        
        switch (response.status) {
          case 401:
            throw new Error('Unauthorized: กรุณาเข้าสู่ระบบใหม่');
          case 500:
            throw new Error('Internal Server Error: เกิดข้อผิดพลาดที่เซิร์ฟเวอร์');
          default:
            throw new Error(errorMessage);
        }
      }

      const result = await this.handleResponse<{ data: WaterLogItem[] }>(response);
      console.log('✅ Water logs fetched successfully:', result.data);
      console.log('🔍 Raw API response structure:', JSON.stringify(result, null, 2));
      return result.data || [];
    } catch (error) {
      console.error('❌ Error fetching water logs:', error);
      throw error;
    }
  }

  // Update water log entry
  async updateWaterLog(waterLogId: string | number, updateData: Partial<WaterLogItem>): Promise<WaterLogResponse> {
    console.log('✏️ Updating water log...', { waterLogId, updateData });
    console.log('🌐 API URL:', `${this.baseURL}/water-logs/${waterLogId}`);

    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    try {
      const response = await fetch(`${this.baseURL}/water-logs/${waterLogId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updateData),
        signal: AbortSignal.timeout(10000)
      });

      console.log('📡 Update water log API response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
        }
        
        switch (response.status) {
          case 400:
            throw new Error('Bad Request: ข้อมูลที่ส่งไปไม่ถูกต้อง');
          case 401:
            throw new Error('Unauthorized: กรุณาเข้าสู่ระบบใหม่');
          case 403:
            throw new Error('Forbidden: ไม่มีสิทธิ์ในการอัปเดตข้อมูลนี้');
          case 404:
            throw new Error('Not Found: ไม่พบข้อมูลที่ต้องการอัปเดต');
          case 500:
            throw new Error('Internal Server Error: เกิดข้อผิดพลาดที่เซิร์ฟเวอร์');
          default:
            throw new Error(errorMessage);
        }
      }

      const result = await this.handleResponse<WaterLogResponse>(response);
      
      if (result.data) {
        console.log('✅ Water log updated successfully from backend');
        console.log('📄 Updated data:', result.data);
        return result;
      } else {
        throw new Error('No updated water log data received from server');
      }
    } catch (error) {
      console.error('❌ Error updating water log:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('การอัปเดตข้อมูลใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง');
      }
      
      throw error;
    }
  }

  // Delete water log entry
  async deleteWaterLog(waterLogId: string | number): Promise<void> {
    console.log('🗑️ Deleting water log...', waterLogId);
    console.log('🌐 API URL:', `${this.baseURL}/water-logs/${waterLogId}`);

    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    try {
      const response = await fetch(`${this.baseURL}/water-logs/${waterLogId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      console.log('📡 Delete water log API response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
        }
        
        switch (response.status) {
          case 401:
            throw new Error('Unauthorized: กรุณาเข้าสู่ระบบใหม่');
          case 403:
            throw new Error('Forbidden: ไม่มีสิทธิ์ในการลบข้อมูลนี้');
          case 404:
            throw new Error('Not Found: ไม่พบข้อมูลที่ต้องการลบ');
          case 500:
            throw new Error('Internal Server Error: เกิดข้อผิดพลาดที่เซิร์ฟเวอร์');
          default:
            throw new Error(errorMessage);
        }
      }

      console.log('✅ Water log deleted successfully from backend');
    } catch (error) {
      console.error('❌ Error deleting water log:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('การลบข้อมูลใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง');
      }
      
      throw error;
    }
  }

  // ===== SLEEP LOG API FUNCTIONS =====

  // Get sleep logs for current user
  async getSleepLogs(): Promise<any[]> {
    console.log('😴 Fetching sleep logs...');
    console.log('🌐 API URL:', `${this.baseURL}/sleep-log`);

    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    try {
      const response = await fetch(`${this.baseURL}/sleep-log`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      console.log('📡 Get sleep logs API response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
        }
        
        switch (response.status) {
          case 401:
            throw new Error('Unauthorized: กรุณาเข้าสู่ระบบใหม่');
          case 500:
            throw new Error('Internal Server Error: เกิดข้อผิดพลาดที่เซิร์ฟเวอร์');
          default:
            throw new Error(errorMessage);
        }
      }

      const result = await this.handleResponse<any>(response);
      console.log('✅ Sleep logs fetched successfully');
      console.log('🔍 Raw API response structure:', JSON.stringify(result, null, 2));
      
      // Handle different response structures
      let sleepLogs: any[] = [];
      if (Array.isArray(result)) {
        sleepLogs = result;
      } else if (result && result.data && Array.isArray(result.data)) {
        sleepLogs = result.data;
      } else if (result && result.sleep_logs && Array.isArray(result.sleep_logs)) {
        sleepLogs = result.sleep_logs;
      }
      
      return sleepLogs;
    } catch (error) {
      console.error('❌ Error fetching sleep logs:', error);
      throw error;
    }
  }

  // Get sleep statistics for dashboard
  async getSleepStats(period: string = 'week'): Promise<any> {
    console.log('📊 Getting sleep stats...');
    
    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    try {
      const url = `${this.baseURL}/sleep-log/stats?period=${period}`;
        
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
        }
        
        switch (response.status) {
          case 401:
            throw new Error('Unauthorized: กรุณาเข้าสู่ระบบใหม่');
          case 500:
            throw new Error('Internal Server Error: เกิดข้อผิดพลาดที่เซิร์ฟเวอร์');
          default:
            throw new Error(errorMessage);
        }
      }

      const result = await this.handleResponse<any>(response);
      console.log('✅ Sleep stats loaded successfully');
      return result;
    } catch (error) {
      console.error('❌ Error getting sleep stats:', error);
      throw error;
    }
  }

  // Get sleep overview stats for specific date
  async getSleepOverviewStats(date: string): Promise<any> {
    console.log('📊 Getting sleep overview stats for date:', date);
    
    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    try {
      const url = `${this.baseURL}/sleep-log/stats/overview?date=${date}`;
      console.log('🌐 API URL:', url);
        
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      console.log('📡 Get sleep overview stats API response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
        }
        
        switch (response.status) {
          case 401:
            throw new Error('Unauthorized: กรุณาเข้าสู่ระบบใหม่');
          case 500:
            throw new Error('Internal Server Error: เกิดข้อผิดพลาดที่เซิร์ฟเวอร์');
          default:
            throw new Error(errorMessage);
        }
      }

      const result = await this.handleResponse<any>(response);
      console.log('✅ Sleep overview stats loaded successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error getting sleep overview stats:', error);
      throw error;
    }
  }

  // Get sleep data for the last 7 days (using existing sleep logs)
  async getSleepWeeklyData(): Promise<any[]> {
    console.log('📊 Getting sleep weekly data...');
    
    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    try {
      // ใช้ API endpoint ที่มีอยู่จริง
      const url = `${this.baseURL}/sleep-log/trends/fixed?days=7`;
      console.log('🌐 API URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      console.log('📡 Get sleep logs API response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
        }
        
        switch (response.status) {
          case 401:
            throw new Error('Unauthorized: กรุณาเข้าสู่ระบบใหม่');
          case 500:
            throw new Error('Internal Server Error: เกิดข้อผิดพลาดที่เซิร์ฟเวอร์');
          default:
            throw new Error(errorMessage);
        }
      }

      const result = await this.handleResponse<any>(response);
      console.log('✅ Sleep trends loaded successfully:', result);
      
      // Handle API response structure: { success: true, data: { trends: [...] } }
      let trendsData: any[] = [];
      if (result && result.success && result.data && result.data.trends) {
        trendsData = result.data.trends;
        console.log('📊 Found trends data:', trendsData.length, 'days');
      } else {
        console.log('⚠️ No trends data found in response');
      }
      
      return trendsData;
    } catch (error) {
      console.error('❌ Error getting sleep weekly data:', error);
      // ส่งคืนข้อมูลตัวอย่างแทน
      return this.getMockSleepWeeklyData();
    }
  }

  // แปลงข้อมูล sleep logs เป็นรูปแบบที่กราฟต้องการ
  private convertSleepLogsToWeeklyData(sleepLogs: any[]): any[] {
    if (!sleepLogs || sleepLogs.length === 0) {
      return this.getMockSleepWeeklyData();
    }

    // สร้างข้อมูล 7 วันล่าสุด
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // หาข้อมูลการนอนของวันนี้
      const dayLog = sleepLogs.find(log => {
        const logDate = log.sleep_date || log.date;
        return logDate === dateString;
      });
      
      if (dayLog) {
        last7Days.push({
          date: dateString,
          sleep_duration_hours: dayLog.sleep_duration_hours || 0,
          sleep_score: dayLog.sleep_score || 0,
          sleep_quality: dayLog.sleep_quality || 'fair',
          sleep_efficiency_percentage: dayLog.sleep_efficiency_percentage || 80
        });
      } else {
        // ถ้าไม่มีข้อมูล ให้ใส่ข้อมูลว่าง
        last7Days.push({
          date: dateString,
          sleep_duration_hours: 0,
          sleep_score: 0,
          sleep_quality: 'fair',
          sleep_efficiency_percentage: 0
        });
      }
    }
    
    return last7Days;
  }

  // สร้างข้อมูลตัวอย่างสำหรับกราฟ
  private getMockSleepWeeklyData(): any[] {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // สร้างข้อมูลตัวอย่าง
      const mockData = {
        date: dateString,
        sleep_duration_hours: Math.random() * 3 + 6, // 6-9 ชั่วโมง
        sleep_score: Math.floor(Math.random() * 40) + 60, // 60-100
        sleep_quality: ['excellent', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)],
        sleep_efficiency_percentage: Math.floor(Math.random() * 20) + 80 // 80-100%
      };
      
      last7Days.push(mockData);
    }
    
    return last7Days;
  }

  // Get water statistics for dashboard
  async getWaterStats(period: string = 'week'): Promise<any> {
    console.log('💧 Getting water stats...');
    
    const token = tokenUtils.getValidToken();
    if (!token) {
      throw new Error('No valid authentication token found');
    }

    try {
      const url = `${this.baseURL}/water-logs/stats?period=${period}`;
        
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
        }
        
        switch (response.status) {
          case 401:
            throw new Error('Unauthorized: กรุณาเข้าสู่ระบบใหม่');
          case 500:
            throw new Error('Internal Server Error: เกิดข้อผิดพลาดที่เซิร์ฟเวอร์');
          default:
            throw new Error(errorMessage);
        }
      }

      const result = await this.handleResponse<any>(response);
      console.log('✅ Water stats loaded successfully');
      return result;
    } catch (error) {
      console.error('❌ Error getting water stats:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const apiService = new APIService();

// Export mock method for direct access
export const getMockProfile = () => apiService.getMockProfile();

// Export utilities for token and user management
export const userService = {
  // Get user from localStorage (fallback)
  getCurrentUserFromStorage: (): Partial<UserProfile> | null => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  },

  // Save user to localStorage
  saveUserToStorage: (user: UserProfile): void => {
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  },

  // Clear user data - ใช้ฟังก์ชัน logout ใหม่
  clearUserData: (): void => {
    // ใช้ฟังก์ชัน logout ใหม่ที่ล้างข้อมูลทั้งหมด
    tokenUtils.logout();
  },

  // Check if user is logged in
  isLoggedIn: (): boolean => {
    return tokenUtils.isLoggedIn();
  },

  // Get token from localStorage
  getToken: (): string | null => {
    return tokenUtils.getToken();
  },

  // Check if token is valid
  isValidToken: (token: string | null): boolean => {
    return tokenUtils.isValidToken(token);
  }
};
