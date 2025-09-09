# Frontend Integration Guide

## การเชื่อมต่อ Frontend กับ AI Service

### 1. AI Service Class Structure

```typescript
// src/services/aiService.ts
export class AIService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${apiConfig.baseUrl}/api/ai-service`;
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
}
```

### 2. Authentication Handling

#### 2.1 Public Endpoints (No Auth Required)
```typescript
// Health Check - ไม่ต้อง login
const healthStatus = await aiService.healthCheck();

// Test AI Service - ไม่ต้อง login
const testResult = await aiService.testAIService();
```

#### 2.2 Protected Endpoints (Auth Required)
```typescript
// ตรวจสอบการ login ก่อนใช้ protected endpoints
if (!tokenUtils.isLoggedIn()) {
  // Redirect to login page
  window.location.href = '/login';
  return;
}

const userId = tokenUtils.getUserId();
if (!userId) {
  throw new Error('User ID not found. Please login again.');
}

// ใช้ protected endpoints
const healthAnalysis = await aiService.analyzeHealth(userId);
const foodRecs = await aiService.getFoodRecommendations(userId);
const exerciseRecs = await aiService.getExerciseRecommendations(userId);
```

### 3. Error Handling

#### 3.1 Authentication Errors
```typescript
try {
  const result = await aiService.analyzeHealth(userId);
  // Handle success
} catch (error) {
  if (error.message.includes('Authentication') || error.message.includes('login')) {
    // Handle authentication error
    toast({
      title: "Authentication Required",
      description: "Please login to access this feature",
      variant: "destructive"
    });
    // Redirect to login
    window.location.href = '/login';
  } else {
    // Handle other errors
    console.error('Error:', error);
  }
}
```

#### 3.2 Error Handler Utility
```typescript
// src/utils/errorHandler.ts
export const handleAIError = (error: any) => {
  if (error.message.includes('Authentication') || error.message.includes('login')) {
    // Redirect to login
    window.location.href = '/login';
  } else if (error.message.includes('403')) {
    // Show permission denied message
    alert('You do not have permission to access this feature');
  } else if (error.message.includes('500')) {
    // Show server error message
    alert('Server error. Please try again later.');
  } else {
    console.error('Unexpected error:', error);
    alert('An unexpected error occurred');
  }
};
```

### 4. React Component Examples

#### 4.1 Health Dashboard with Auth Check
```typescript
// src/components/HealthDashboard.tsx
import React, { useState, useEffect } from 'react';
import { AIService } from '../services/aiService';
import { tokenUtils } from '@/lib/utils';

const HealthDashboard: React.FC = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const loadHealthData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check authentication
      if (!tokenUtils.isLoggedIn()) {
        setError('Please login to access health analysis');
        return;
      }

      const userId = tokenUtils.getUserId();
      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }

      const result = await aiService.analyzeHealth(userId);
      setHealthData(result.data);
    } catch (err) {
      if (err.message.includes('Authentication') || err.message.includes('login')) {
        setError('Please login to access health analysis');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadHealthData();
  }, []);
  
  // Component JSX...
};
```

#### 4.2 Public Health Check Component
```typescript
// src/components/HealthStatus.tsx
import React, { useState, useEffect } from 'react';
import { AIService } from '../services/aiService';

const HealthStatus: React.FC = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const checkHealth = async () => {
    setLoading(true);
    try {
      // Public endpoint - no auth required
      const result = await aiService.healthCheck();
      setStatus(result);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    checkHealth();
  }, []);
  
  // Component JSX...
};
```

### 5. API Endpoints Summary

#### 5.1 Public Endpoints (No Auth)
- `GET /api/ai-service/health` - Health check
- `GET /api/ai-service/test` - Test AI service

#### 5.2 Protected Endpoints (Auth Required)
- `POST /api/ai-service/analyze` - Health analysis
- `GET /api/ai-service/food-recommendations/{userId}` - Food recommendations
- `GET /api/ai-service/exercise-recommendations/{userId}` - Exercise recommendations
- `GET /api/ai-service/nutrition/{userId}` - Nutrition analysis
- `GET /api/ai-service/exercise/{userId}` - Exercise analysis
- `POST /api/ai-service/insights` - Save AI insight

### 6. Usage Examples

#### 6.1 Complete Health Analysis
```typescript
const performHealthAnalysis = async (userId: number) => {
  try {
    // Check authentication first
    if (!tokenUtils.isLoggedIn()) {
      throw new Error('Please login first');
    }

    const response = await aiService.analyzeHealth(userId, {
      analysisType: 'complete',
      timeframe: 'month',
      includeRecommendations: true,
      includeInsights: true
    });

    if (response.success) {
      console.log('Health Analysis Results:', response.data);
      return response.data;
    } else {
      throw new Error(response.message || 'Analysis failed');
    }
  } catch (error) {
    console.error('Health analysis error:', error);
    throw error;
  }
};
```

#### 6.2 Get Food Recommendations
```typescript
const getFoodRecommendations = async (userId: number) => {
  try {
    // Check authentication first
    if (!tokenUtils.isLoggedIn()) {
      throw new Error('Please login first');
    }

    const response = await aiService.getFoodRecommendations(userId);
    console.log('Food Recommendations:', response);
    return response;
  } catch (error) {
    console.error('Food recommendations error:', error);
    throw error;
  }
};
```

#### 6.3 Public Health Check
```typescript
const checkAIServiceHealth = async () => {
  try {
    // No authentication required
    const response = await aiService.healthCheck();
    console.log('AI Service Status:', response);
    return response;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};
```

### 7. Best Practices

#### 7.1 Always Check Authentication
```typescript
// Before calling protected endpoints
if (!tokenUtils.isLoggedIn()) {
  // Handle not logged in
  return;
}
```

#### 7.2 Handle Errors Gracefully
```typescript
try {
  const result = await aiService.analyzeHealth(userId);
  // Handle success
} catch (error) {
  if (error.message.includes('Authentication')) {
    // Redirect to login
  } else {
    // Show error message
  }
}
```

#### 7.3 Use Fallback Data
```typescript
try {
  const result = await aiService.analyzeHealth(userId);
  setHealthData(result.data);
} catch (error) {
  // Use demo data as fallback
  setHealthData(demoHealthData);
}
```

### 8. Environment Configuration

#### 8.1 API Base URL
```typescript
// src/config/env.ts
export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  // ... other config
};
```

#### 8.2 Environment Variables
```bash
# .env
VITE_API_BASE_URL=http://localhost:3000
```

## หมายเหตุ

- **Public Endpoints**: ไม่ต้องใช้ JWT token
- **Protected Endpoints**: ต้องใช้ JWT token และ login ก่อน
- **Error Handling**: จัดการ authentication errors แยกจาก errors อื่นๆ
- **Fallback Data**: ใช้ demo data เมื่อ API ไม่สามารถเข้าถึงได้
- **User Experience**: แสดงข้อความที่เข้าใจง่ายเมื่อเกิด error
