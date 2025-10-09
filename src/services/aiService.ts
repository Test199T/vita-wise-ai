import { apiConfig } from '@/config/env';

export interface HealthData {
  user: any;
  healthScores: {
    nutritionScore: number;
    exerciseScore: number;
    sleepScore: number;
    waterScore: number;
    overallScore: number;
  };
  aiAnalysis: string;
  recommendations: any;
}

export interface HealthAnalysisResponse {
  success: boolean;
  data: HealthData;
  message?: string;
}

export interface FoodAnalysisResponse {
  success: boolean;
  data: {
    food_name: string;
    calories_per_serving: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g?: number;
    sugar_g?: number;
    sodium_mg?: number;
    potassium_mg?: number;
    calcium_mg?: number;
    iron_mg?: number;
    vitaminC_mg?: number;
    vitaminD_mcg?: number;
    notes?: string;
  };
  message?: string;
}

export class AIService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${apiConfig.baseUrl}/api/ai-service`;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}, requireAuth: boolean = false) {
    const token = localStorage.getItem('token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (requireAuth) {
      if (!token) {
        throw new Error('Authentication required. Please login first.');
      }
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }

  private async makeFormDataRequest(endpoint: string, formData: FormData, requireAuth: boolean = true) {
    const token = localStorage.getItem('token');
    
    const headers: Record<string, string> = {};

    if (requireAuth) {
      if (!token) {
        throw new Error('Authentication required. Please login first.');
      }
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers,
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }
      const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }

  // ===== PUBLIC ENDPOINTS (No Auth Required) =====
  
  // Health Check - Public endpoint
  async healthCheck() {
    return this.makeRequest('/health', { method: 'GET' }, false);
  }
  
  // Test AI Service - Public endpoint
  async testAIService() {
    return this.makeRequest('/test', { method: 'GET' }, false);
  }

  // ===== PROTECTED ENDPOINTS (Auth Required) =====
  
  // วิเคราะห์สุขภาพ - Protected endpoint
  async analyzeHealth(userId: number, options: {
    analysisType?: 'complete' | 'nutrition' | 'exercise' | 'sleep' | 'quick';
    timeframe?: 'week' | 'month' | 'quarter';
    includeRecommendations?: boolean;
    includeInsights?: boolean;
  } = {}) {
    return this.makeRequest('/analyze', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        analysisType: options.analysisType || 'complete',
        timeframe: options.timeframe || 'month',
        includeRecommendations: options.includeRecommendations ?? true,
        includeInsights: options.includeInsights ?? true,
      }),
    }, true); // requireAuth = true
  }
  
  // แนะนำอาหาร - Protected endpoint
  async getFoodRecommendations(userId: number) {
    return this.makeRequest(`/food-recommendations/${userId}`, { method: 'GET' }, true);
  }
  
  // แนะนำการออกกำลังกาย - Protected endpoint
  async getExerciseRecommendations(userId: number) {
    return this.makeRequest(`/exercise-recommendations/${userId}`, { method: 'GET' }, true);
  }
  
  // วิเคราะห์โภชนาการ - Protected endpoint
  async analyzeNutrition(userId: number, date?: string) {
    const params = date ? `?date=${date}` : '';
    return this.makeRequest(`/nutrition/${userId}${params}`, { method: 'GET' }, true);
  }
  
  // วิเคราะห์การออกกำลังกาย - Protected endpoint
  async analyzeExercise(userId: number, date?: string) {
    const params = date ? `?date=${date}` : '';
    return this.makeRequest(`/exercise/${userId}${params}`, { method: 'GET' }, true);
  }
  
  // บันทึก AI Insight - Protected endpoint
  async saveAIInsight(userId: number, insightData: any) {
    return this.makeRequest('/insights', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        insightData,
      }),
    }, true); // requireAuth = true
  }

  // วิเคราะห์รูปภาพอาหาร - Protected endpoint
  async analyzeFoodImage(imageFile: File): Promise<FoodAnalysisResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);
    return this.makeFormDataRequest('/analyze-food-image', formData, true);
  }
}

// Export singleton instance
export const aiService = new AIService();
