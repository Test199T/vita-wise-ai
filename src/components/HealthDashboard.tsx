// src/components/HealthDashboard.tsx
import React, { useState, useEffect } from 'react';
import { AIService, HealthData } from '../services/aiService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Heart, Utensils, Dumbbell, Moon, Droplets } from 'lucide-react';

const HealthDashboard: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState(161); // หรือดึงจาก auth context
  
  const aiService = new AIService();
  
  const loadHealthData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to access health analysis');
        return;
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
  }, [userId]);
  
  if (loading) return (
    <div className="flex items-center justify-center p-8">
      <RefreshCw className="h-8 w-8 animate-spin" />
      <span className="ml-2">Loading...</span>
    </div>
  );
  
  if (error) return (
    <div className="text-center p-8">
      <div className="text-red-600 mb-4">Error: {error}</div>
      <Button onClick={loadHealthData}>Try Again</Button>
    </div>
  );
  
  if (!healthData) return (
    <div className="text-center p-8">No data available</div>
  );
  
  return (
    <div className="health-dashboard space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">AI Health Analysis</h2>
        <Button onClick={loadHealthData} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Analysis
        </Button>
      </div>
      
      <div className="health-scores">
        <h3 className="text-lg font-semibold mb-4">Health Scores</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Heart className="h-4 w-4 text-red-500" />
                Overall Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{healthData.healthScores.overallScore}</div>
              <Progress value={healthData.healthScores.overallScore} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Utensils className="h-4 w-4 text-green-500" />
                Nutrition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{healthData.healthScores.nutritionScore}</div>
              <Progress value={healthData.healthScores.nutritionScore} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Dumbbell className="h-4 w-4 text-orange-500" />
                Exercise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{healthData.healthScores.exerciseScore}</div>
              <Progress value={healthData.healthScores.exerciseScore} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Moon className="h-4 w-4 text-indigo-500" />
                Sleep
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{healthData.healthScores.sleepScore}</div>
              <Progress value={healthData.healthScores.sleepScore} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Droplets className="h-4 w-4 text-blue-500" />
                Water
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{healthData.healthScores.waterScore}</div>
              <Progress value={healthData.healthScores.waterScore} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>AI Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{healthData.aiAnalysis}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>AI-powered health recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {healthData.recommendations && typeof healthData.recommendations === 'object' ? (
              Object.entries(healthData.recommendations).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <Badge variant="outline">{key}</Badge>
                  <span className="text-sm">{String(value)}</span>
                </div>
              ))
            ) : (
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                {JSON.stringify(healthData.recommendations, null, 2)}
              </pre>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthDashboard;
