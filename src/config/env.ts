// Environment Configuration for Vita-Wise AI
// This file centralizes all environment variables and provides type safety

export interface EnvironmentConfig {
  // API Configuration
  apiBaseUrl: string;
  apiTimeout: number;
  
  // Authentication Endpoints
  authEndpoint: string;
  registerEndpoint: string;
  forgotPasswordEndpoint: string;
  resetPasswordEndpoint: string;
  
  // User Profile Endpoints
  profileGetEndpoint: string;
  profileUpdateEndpoint: string;
  profileCreateEndpoint: string;
  
  // Health Data Endpoints
  healthDataEndpoint: string;
  
  // Exercise Log Endpoints
  exerciseLogEndpoint: string;
  exerciseLogStatsEndpoint: string;
  exerciseLogCaloriesEndpoint: string;
  exerciseLogStreakEndpoint: string;
  
  // Food Log Endpoints
  foodLogEndpoint: string;
  foodLogDashboardEndpoint: string;
  foodLogNutritionEndpoint: string;
  foodLogSummaryEndpoint: string;
  
  // Water Log Endpoints
  waterLogEndpoint: string;
  waterLogStatsEndpoint: string;
  
  // Sleep Log Endpoints
  sleepLogEndpoint: string;
  sleepLogStatsEndpoint: string;
  sleepLogOverviewEndpoint: string;
  sleepLogTrendsEndpoint: string;
  
  // Health Goals Endpoints
  healthGoalsEndpoint: string;
  
  // Application Configuration
  appName: string;
  appVersion: string;
  appDescription: string;
  
  // Feature Flags
  enableDebugMode: boolean;
  enableMockData: boolean;
  enableAnalytics: boolean;
  
  // UI Configuration
  defaultTheme: string;
  enableDarkMode: boolean;
  
  // Performance Configuration
  requestTimeout: number;
  retryAttempts: number;
  cacheDuration: number;
}

// Default configuration values
const defaultConfig: EnvironmentConfig = {
  // API Configuration
  apiBaseUrl: 'http://localhost:3000',
  apiTimeout: 10000,
  
  // Authentication Endpoints
  authEndpoint: '/api/auth/login',
  registerEndpoint: '/api/auth/register',
  forgotPasswordEndpoint: '/api/auth/forgot-password',
  resetPasswordEndpoint: '/api/auth/reset-password',
  
  // User Profile Endpoints
  profileGetEndpoint: '/api/user/profile',
  profileUpdateEndpoint: '/api/user/profile',
  profileCreateEndpoint: '/api/users/profile',
  
  // Health Data Endpoints
  healthDataEndpoint: '/api/user/health-data',
  
  // Exercise Log Endpoints
  exerciseLogEndpoint: '/api/exercise-log',
  exerciseLogStatsEndpoint: '/api/exercise-log/stats',
  exerciseLogCaloriesEndpoint: '/api/exercise-log/calories/summary',
  exerciseLogStreakEndpoint: '/api/exercise-log/streak/current',
  
  // Food Log Endpoints
  foodLogEndpoint: '/api/food-log',
  foodLogDashboardEndpoint: '/api/food-log/dashboard',
  foodLogNutritionEndpoint: '/api/food-log/nutrition-analysis',
  foodLogSummaryEndpoint: '/api/food-log/summary',
  
  // Water Log Endpoints
  waterLogEndpoint: '/api/water-logs',
  waterLogStatsEndpoint: '/api/water-logs/stats',
  
  // Sleep Log Endpoints
  sleepLogEndpoint: '/api/sleep-log',
  sleepLogStatsEndpoint: '/api/sleep-log/stats',
  sleepLogOverviewEndpoint: '/api/sleep-log/stats/overview',
  sleepLogTrendsEndpoint: '/api/sleep-log/trends/fixed',
  
  // Health Goals Endpoints
  healthGoalsEndpoint: '/api/health-goals',
  
  // Application Configuration
  appName: 'Vita-Wise AI',
  appVersion: '1.0.0',
  appDescription: 'AI-powered health tracking application',
  
  // Feature Flags
  enableDebugMode: true,
  enableMockData: false,
  enableAnalytics: false,
  
  // UI Configuration
  defaultTheme: 'light',
  enableDarkMode: true,
  
  // Performance Configuration
  requestTimeout: 10000,
  retryAttempts: 3,
  cacheDuration: 300000,
};

// Helper function to get environment variable with fallback
function getEnvVar(key: string, fallback: string): string {
  return import.meta.env[key] || fallback;
}

// Helper function to get boolean environment variable
function getBooleanEnvVar(key: string, fallback: boolean): boolean {
  const value = import.meta.env[key];
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
}

// Helper function to get number environment variable
function getNumberEnvVar(key: string, fallback: number): number {
  const value = import.meta.env[key];
  if (value === undefined) return fallback;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

// Create configuration object with environment variables
export const envConfig: EnvironmentConfig = {
  // API Configuration
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', defaultConfig.apiBaseUrl),
  apiTimeout: getNumberEnvVar('VITE_API_TIMEOUT', defaultConfig.apiTimeout),
  
  // Authentication Endpoints
  authEndpoint: getEnvVar('VITE_AUTH_ENDPOINT', defaultConfig.authEndpoint),
  registerEndpoint: getEnvVar('VITE_REGISTER_ENDPOINT', defaultConfig.registerEndpoint),
  forgotPasswordEndpoint: getEnvVar('VITE_FORGOT_PASSWORD_ENDPOINT', defaultConfig.forgotPasswordEndpoint),
  resetPasswordEndpoint: getEnvVar('VITE_RESET_PASSWORD_ENDPOINT', defaultConfig.resetPasswordEndpoint),
  
  // User Profile Endpoints
  profileGetEndpoint: getEnvVar('VITE_PROFILE_GET_ENDPOINT', defaultConfig.profileGetEndpoint),
  profileUpdateEndpoint: getEnvVar('VITE_PROFILE_UPDATE_ENDPOINT', defaultConfig.profileUpdateEndpoint),
  profileCreateEndpoint: getEnvVar('VITE_PROFILE_CREATE_ENDPOINT', defaultConfig.profileCreateEndpoint),
  
  // Health Data Endpoints
  healthDataEndpoint: getEnvVar('VITE_HEALTH_DATA_ENDPOINT', defaultConfig.healthDataEndpoint),
  
  // Exercise Log Endpoints
  exerciseLogEndpoint: getEnvVar('VITE_EXERCISE_LOG_ENDPOINT', defaultConfig.exerciseLogEndpoint),
  exerciseLogStatsEndpoint: getEnvVar('VITE_EXERCISE_LOG_STATS_ENDPOINT', defaultConfig.exerciseLogStatsEndpoint),
  exerciseLogCaloriesEndpoint: getEnvVar('VITE_EXERCISE_LOG_CALORIES_ENDPOINT', defaultConfig.exerciseLogCaloriesEndpoint),
  exerciseLogStreakEndpoint: getEnvVar('VITE_EXERCISE_LOG_STREAK_ENDPOINT', defaultConfig.exerciseLogStreakEndpoint),
  
  // Food Log Endpoints
  foodLogEndpoint: getEnvVar('VITE_FOOD_LOG_ENDPOINT', defaultConfig.foodLogEndpoint),
  foodLogDashboardEndpoint: getEnvVar('VITE_FOOD_LOG_DASHBOARD_ENDPOINT', defaultConfig.foodLogDashboardEndpoint),
  foodLogNutritionEndpoint: getEnvVar('VITE_FOOD_LOG_NUTRITION_ENDPOINT', defaultConfig.foodLogNutritionEndpoint),
  foodLogSummaryEndpoint: getEnvVar('VITE_FOOD_LOG_SUMMARY_ENDPOINT', defaultConfig.foodLogSummaryEndpoint),
  
  // Water Log Endpoints
  waterLogEndpoint: getEnvVar('VITE_WATER_LOG_ENDPOINT', defaultConfig.waterLogEndpoint),
  waterLogStatsEndpoint: getEnvVar('VITE_WATER_LOG_STATS_ENDPOINT', defaultConfig.waterLogStatsEndpoint),
  
  // Sleep Log Endpoints
  sleepLogEndpoint: getEnvVar('VITE_SLEEP_LOG_ENDPOINT', defaultConfig.sleepLogEndpoint),
  sleepLogStatsEndpoint: getEnvVar('VITE_SLEEP_LOG_STATS_ENDPOINT', defaultConfig.sleepLogStatsEndpoint),
  sleepLogOverviewEndpoint: getEnvVar('VITE_SLEEP_LOG_OVERVIEW_ENDPOINT', defaultConfig.sleepLogOverviewEndpoint),
  sleepLogTrendsEndpoint: getEnvVar('VITE_SLEEP_LOG_TRENDS_ENDPOINT', defaultConfig.sleepLogTrendsEndpoint),
  
  // Health Goals Endpoints
  healthGoalsEndpoint: getEnvVar('VITE_HEALTH_GOALS_ENDPOINT', defaultConfig.healthGoalsEndpoint),
  
  // Application Configuration
  appName: getEnvVar('VITE_APP_NAME', defaultConfig.appName),
  appVersion: getEnvVar('VITE_APP_VERSION', defaultConfig.appVersion),
  appDescription: getEnvVar('VITE_APP_DESCRIPTION', defaultConfig.appDescription),
  
  // Feature Flags
  enableDebugMode: getBooleanEnvVar('VITE_ENABLE_DEBUG_MODE', defaultConfig.enableDebugMode),
  enableMockData: getBooleanEnvVar('VITE_ENABLE_MOCK_DATA', defaultConfig.enableMockData),
  enableAnalytics: getBooleanEnvVar('VITE_ENABLE_ANALYTICS', defaultConfig.enableAnalytics),
  
  // UI Configuration
  defaultTheme: getEnvVar('VITE_DEFAULT_THEME', defaultConfig.defaultTheme),
  enableDarkMode: getBooleanEnvVar('VITE_ENABLE_DARK_MODE', defaultConfig.enableDarkMode),
  
  // Performance Configuration
  requestTimeout: getNumberEnvVar('VITE_REQUEST_TIMEOUT', defaultConfig.requestTimeout),
  retryAttempts: getNumberEnvVar('VITE_RETRY_ATTEMPTS', defaultConfig.retryAttempts),
  cacheDuration: getNumberEnvVar('VITE_CACHE_DURATION', defaultConfig.cacheDuration),
};

// Export individual configurations for easy access
export const apiConfig = {
  baseUrl: envConfig.apiBaseUrl,
  timeout: envConfig.apiTimeout,
  requestTimeout: envConfig.requestTimeout,
  retryAttempts: envConfig.retryAttempts,
  cacheDuration: envConfig.cacheDuration,
};

export const authConfig = {
  loginEndpoint: envConfig.authEndpoint,
  registerEndpoint: envConfig.registerEndpoint,
  forgotPasswordEndpoint: envConfig.forgotPasswordEndpoint,
  resetPasswordEndpoint: envConfig.resetPasswordEndpoint,
};

export const profileConfig = {
  getEndpoint: envConfig.profileGetEndpoint,
  updateEndpoint: envConfig.profileUpdateEndpoint,
  createEndpoint: envConfig.profileCreateEndpoint,
};

export const healthConfig = {
  dataEndpoint: envConfig.healthDataEndpoint,
  goalsEndpoint: envConfig.healthGoalsEndpoint,
};

export const exerciseConfig = {
  logEndpoint: envConfig.exerciseLogEndpoint,
  statsEndpoint: envConfig.exerciseLogStatsEndpoint,
  caloriesEndpoint: envConfig.exerciseLogCaloriesEndpoint,
  streakEndpoint: envConfig.exerciseLogStreakEndpoint,
};

export const foodConfig = {
  logEndpoint: envConfig.foodLogEndpoint,
  dashboardEndpoint: envConfig.foodLogDashboardEndpoint,
  nutritionEndpoint: envConfig.foodLogNutritionEndpoint,
  summaryEndpoint: envConfig.foodLogSummaryEndpoint,
};

export const waterConfig = {
  logEndpoint: envConfig.waterLogEndpoint,
  statsEndpoint: envConfig.waterLogStatsEndpoint,
};

export const sleepConfig = {
  logEndpoint: envConfig.sleepLogEndpoint,
  statsEndpoint: envConfig.sleepLogStatsEndpoint,
  overviewEndpoint: envConfig.sleepLogOverviewEndpoint,
  trendsEndpoint: envConfig.sleepLogTrendsEndpoint,
};

export const appConfig = {
  name: envConfig.appName,
  version: envConfig.appVersion,
  description: envConfig.appDescription,
  enableDebugMode: envConfig.enableDebugMode,
  enableMockData: envConfig.enableMockData,
  enableAnalytics: envConfig.enableAnalytics,
  defaultTheme: envConfig.defaultTheme,
  enableDarkMode: envConfig.enableDarkMode,
};

// Utility functions
export const isDevelopment = () => import.meta.env.DEV;
export const isProduction = () => import.meta.env.PROD;
export const isDebugMode = () => envConfig.enableDebugMode;
export const isMockDataEnabled = () => envConfig.enableMockData;

// Log configuration in development mode
if (isDevelopment() && isDebugMode()) {
  console.log('🔧 Environment Configuration:', {
    apiBaseUrl: envConfig.apiBaseUrl,
    enableDebugMode: envConfig.enableDebugMode,
    enableMockData: envConfig.enableMockData,
    appName: envConfig.appName,
    appVersion: envConfig.appVersion,
  });
}
