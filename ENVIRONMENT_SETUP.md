# Environment Setup Guide for Vita-Wise AI

This guide explains how to set up environment variables for the Vita-Wise AI application to support different environments (development, staging, production).

## Overview

The application now uses a centralized environment configuration system that allows you to:
- Configure API endpoints for different environments
- Set feature flags and application settings
- Manage authentication and performance settings
- Switch between development, staging, and production configurations

## Environment Configuration Structure

### 1. Configuration Files

- `src/config/env.ts` - Main environment configuration with type safety
- `src/config/README.md` - Detailed documentation of all environment variables
- `vite.config.ts` - Updated to support environment variable loading

### 2. Environment Variables

All environment variables are prefixed with `VITE_` to be accessible in the browser.

#### API Configuration
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=10000
```

#### Authentication Endpoints
```bash
VITE_AUTH_ENDPOINT=/api/auth/login
VITE_REGISTER_ENDPOINT=/api/auth/register
VITE_FORGOT_PASSWORD_ENDPOINT=/api/auth/forgot-password
VITE_RESET_PASSWORD_ENDPOINT=/api/auth/reset-password
```

#### Feature-Specific Endpoints
```bash
# User Profile
VITE_PROFILE_GET_ENDPOINT=/api/user/profile
VITE_PROFILE_UPDATE_ENDPOINT=/api/user/profile
VITE_PROFILE_CREATE_ENDPOINT=/api/users/profile

# Health Data
VITE_HEALTH_DATA_ENDPOINT=/api/user/health-data
VITE_HEALTH_GOALS_ENDPOINT=/api/health-goals

# Exercise Logs
VITE_EXERCISE_LOG_ENDPOINT=/api/exercise-log
VITE_EXERCISE_LOG_STATS_ENDPOINT=/api/exercise-log/stats
VITE_EXERCISE_LOG_CALORIES_ENDPOINT=/api/exercise-log/calories/summary
VITE_EXERCISE_LOG_STREAK_ENDPOINT=/api/exercise-log/streak/current

# Food Logs
VITE_FOOD_LOG_ENDPOINT=/api/food-log
VITE_FOOD_LOG_DASHBOARD_ENDPOINT=/api/food-log/dashboard
VITE_FOOD_LOG_NUTRITION_ENDPOINT=/api/food-log/nutrition-analysis
VITE_FOOD_LOG_SUMMARY_ENDPOINT=/api/food-log/summary

# Water Logs
VITE_WATER_LOG_ENDPOINT=/api/water-logs
VITE_WATER_LOG_STATS_ENDPOINT=/api/water-logs/stats

# Sleep Logs
VITE_SLEEP_LOG_ENDPOINT=/api/sleep-log
VITE_SLEEP_LOG_STATS_ENDPOINT=/api/sleep-log/stats
VITE_SLEEP_LOG_OVERVIEW_ENDPOINT=/api/sleep-log/stats/overview
VITE_SLEEP_LOG_TRENDS_ENDPOINT=/api/sleep-log/trends/fixed
```

#### Application Settings
```bash
VITE_APP_NAME=Vita-Wise AI
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=AI-powered health tracking application
```

#### Feature Flags
```bash
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_ANALYTICS=false
```

#### UI Configuration
```bash
VITE_DEFAULT_THEME=light
VITE_ENABLE_DARK_MODE=true
```

#### Performance Settings
```bash
VITE_REQUEST_TIMEOUT=10000
VITE_RETRY_ATTEMPTS=3
VITE_CACHE_DURATION=300000
```

## Setup Instructions

### 1. Development Environment

Create a `.env.local` file in the project root:

```bash
# Development Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_ANALYTICS=false
```

### 2. Staging Environment

Create a `.env.staging` file:

```bash
# Staging Configuration
VITE_API_BASE_URL=https://staging-api.vita-wise-ai.com
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_ANALYTICS=true
```

### 3. Production Environment

Create a `.env.production` file:

```bash
# Production Configuration
VITE_API_BASE_URL=https://api.vita-wise-ai.com
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_ANALYTICS=true
```

## Usage in Code

### 1. Import Configuration

```typescript
import { envConfig, apiConfig, authConfig } from '@/config/env';
```

### 2. Access Configuration Values

```typescript
// Full configuration
console.log(envConfig.apiBaseUrl);

// Specific configuration groups
console.log(apiConfig.baseUrl);
console.log(authConfig.loginEndpoint);
```

### 3. Environment Detection

```typescript
import { isDevelopment, isProduction, isDebugMode } from '@/config/env';

if (isDevelopment()) {
  console.log('Running in development mode');
}

if (isDebugMode()) {
  console.log('Debug mode is enabled');
}
```

## Updated Components

The following components have been updated to use environment variables:

### 1. API Service (`src/services/api.ts`)
- All hardcoded URLs replaced with environment configuration
- Timeout values use configured settings
- Endpoint paths use environment variables

### 2. Login Page (`src/pages/Login.tsx`)
- API endpoint uses environment configuration
- Authentication URL is configurable

### 3. Chat Page (`src/pages/Chat.tsx`)
- Chat API endpoint uses environment configuration

### 4. Sleep Log Page (`src/pages/SleepLog.tsx`)
- Sleep log API endpoints use environment configuration

### 5. Other Pages
- Dashboard, HealthGoals, WaterLog, ExerciseLog pages use the centralized API service
- All API calls now go through the configured environment

## Build Commands

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Staging Build
```bash
npm run build:staging
```

## Environment File Priority

Vite loads environment files in the following order (higher priority overrides lower):

1. `.env.local` (always loaded, ignored by git)
2. `.env.[mode].local` (e.g., `.env.development.local`)
3. `.env.[mode]` (e.g., `.env.development`)
4. `.env`

## Security Considerations

1. **Never commit sensitive data**: Keep `.env.local` in `.gitignore`
2. **Use environment-specific files**: Create separate files for different environments
3. **Validate configuration**: The system provides fallback values for missing variables
4. **Type safety**: All configuration values are typed through TypeScript interfaces

## Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Ensure variables are prefixed with `VITE_`
   - Check that the environment file is in the project root
   - Restart the development server after adding new variables

2. **API endpoints not working**
   - Verify `VITE_API_BASE_URL` is set correctly
   - Check that the backend server is running on the specified URL
   - Ensure all endpoint paths are configured correctly

3. **Build issues**
   - Make sure all required environment variables are set for the target environment
   - Check that the build command uses the correct mode

### Debug Mode

Enable debug mode to see configuration values in the console:

```bash
VITE_ENABLE_DEBUG_MODE=true
```

This will log the current configuration when the application starts.

## Migration from Hardcoded Values

If you have existing hardcoded API URLs in your code:

1. Import the environment configuration:
   ```typescript
   import { apiConfig } from '@/config/env';
   ```

2. Replace hardcoded URLs:
   ```typescript
   // Before
   const response = await fetch('http://localhost:3000/api/endpoint');
   
   // After
   const response = await fetch(`${apiConfig.baseUrl}/api/endpoint`);
   ```

3. Use specific endpoint configurations:
   ```typescript
   // Before
   const response = await fetch('http://localhost:3000/auth/login');
   
   // After
   import { authConfig } from '@/config/env';
   const response = await fetch(`${apiConfig.baseUrl}${authConfig.loginEndpoint}`);
   ```

## Best Practices

1. **Centralize configuration**: Use the `envConfig` object for all environment-dependent values
2. **Type safety**: Always use the typed configuration objects
3. **Fallback values**: The system provides sensible defaults for all configuration values
4. **Documentation**: Keep this guide updated when adding new environment variables
5. **Testing**: Test your application in different environments to ensure configuration works correctly

## Support

For questions or issues with environment configuration:

1. Check the console for configuration logs (when debug mode is enabled)
2. Verify your environment file is in the correct location
3. Ensure all required variables are set
4. Check the `src/config/README.md` for detailed variable documentation
