/**
 * AI Service Usage Examples
 * 
 * This file demonstrates how to use the AIService with the actual API endpoints
 * as defined in AI-SERVICE-API.md
 */

import { aiService } from './aiService';

// Example 1: Health Check
export const checkAIServiceHealth = async () => {
  try {
    const response = await aiService.healthCheck();
    return response;
  } catch (error) {
    console.error('AI Service health check failed:', error);
    throw error;
  }
};

// Example 2: Complete Health Analysis
export const performHealthAnalysis = async (userId: number) => {
  try {
    const response = await aiService.analyzeHealth(userId, {
      analysisType: 'complete',
      timeframe: 'month',
      includeRecommendations: true,
      includeInsights: true
    });

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Analysis failed');
    }
  } catch (error) {
    console.error('Health analysis error:', error);
    throw error;
  }
};

// Example 3: Get Food Recommendations
export const getFoodRecommendationsExample = async (userId: number) => {
  try {
    const response = await aiService.getFoodRecommendations(userId);
    return response;
  } catch (error) {
    console.error('Food recommendations error:', error);
    throw error;
  }
};

// Example 4: Analyze Nutrition
export const analyzeNutrition = async (userId: number, date?: string) => {
  try {
    const response = await aiService.analyzeNutrition(userId, date);
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Nutrition analysis failed');
    }
  } catch (error) {
    console.error('Nutrition analysis error:', error);
    throw error;
  }
};

// Example 5: Analyze Exercise
export const analyzeExercise = async (userId: number, date?: string) => {
  try {
    const response = await aiService.analyzeExercise(userId, date);
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Exercise analysis failed');
    }
  } catch (error) {
    console.error('Exercise analysis error:', error);
    throw error;
  }
};

// Example 6: Get Food Recommendations (Duplicate removed)

// Example 7: Get Exercise Recommendations
export const getExerciseRecommendations = async (userId: number) => {
  try {
    const response = await aiService.getExerciseRecommendations(userId);
    return response;
  } catch (error) {
    console.error('Exercise recommendations error:', error);
    throw error;
  }
};

// Example 8: Save AI Insight
export const saveAIInsight = async (userId: number) => {
  try {
    const response = await aiService.saveAIInsight(userId, {
      type: 'health_analysis',
      title: 'การวิเคราะห์สุขภาพ',
      description: 'ข้อมูลเชิงลึกจาก AI',
      confidence: 0.85
    });

    return response;
  } catch (error) {
    console.error('Insight save error:', error);
    throw error;
  }
};

// Example 9: React Hook for Health Analysis
import { useState, useEffect } from 'react';

export const useHealthAnalysis = (userId: number) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await performHealthAnalysis(userId);
      setAnalysis(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      runAnalysis();
    }
  }, [userId]);

  return {
    analysis,
    loading,
    error,
    refetch: runAnalysis
  };
};

// Example 10: React Hook for Nutrition Analysis
export const useNutritionAnalysis = (userId: number, date?: string) => {
  const [nutrition, setNutrition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNutrition = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyzeNutrition(userId, date);
      setNutrition(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNutrition();
    }
  }, [userId, date]);

  return {
    nutrition,
    loading,
    error,
    refetch: fetchNutrition
  };
};

// Example 11: React Hook for Exercise Analysis
export const useExerciseAnalysis = (userId: number, date?: string) => {
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExercise = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyzeExercise(userId, date);
      setExercise(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchExercise();
    }
  }, [userId, date]);

  return {
    exercise,
    loading,
    error,
    refetch: fetchExercise
  };
};

// Example 12: React Hook for Recommendations
export const useRecommendations = (userId: number, category: string) => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getFoodRecommendationsExample(userId);
      setRecommendations(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && category) {
      fetchRecommendations();
    }
  }, [userId, category]);

  return {
    recommendations,
    loading,
    error,
    refetch: fetchRecommendations
  };
};

// Example 13: Complete AI Service Integration
export const useAIService = (userId: number) => {
  const [serviceStatus, setServiceStatus] = useState<'unknown' | 'healthy' | 'unhealthy'>('unknown');
  const [loading, setLoading] = useState(false);

  const checkService = async () => {
    setLoading(true);
    try {
      const health = await checkAIServiceHealth();
      setServiceStatus((health as any).status === 'healthy' ? 'healthy' : 'unhealthy');
    } catch (error) {
      setServiceStatus('unhealthy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkService();
  }, []);

  return {
    serviceStatus,
    loading,
    checkService
  };
};