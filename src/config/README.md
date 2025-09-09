# Environment Configuration Guide

This directory contains environment configuration for the Vita-Wise AI application.

## Environment Variables

### API Configuration
- `VITE_API_BASE_URL`: Base URL for the API server (default: http://localhost:3000)
- `VITE_API_TIMEOUT`: API request timeout in milliseconds (default: 10000)

### Authentication Endpoints
- `VITE_AUTH_ENDPOINT`: Login endpoint (default: /api/auth/login)
- `VITE_REGISTER_ENDPOINT`: Registration endpoint (default: /api/auth/register)
- `VITE_FORGOT_PASSWORD_ENDPOINT`: Forgot password endpoint (default: /api/auth/forgot-password)
- `VITE_RESET_PASSWORD_ENDPOINT`: Reset password endpoint (default: /api/auth/reset-password)

### User Profile Endpoints
- `VITE_PROFILE_GET_ENDPOINT`: Get user profile endpoint (default: /api/user/profile)
- `VITE_PROFILE_UPDATE_ENDPOINT`: Update user profile endpoint (default: /api/user/profile)
- `VITE_PROFILE_CREATE_ENDPOINT`: Create user profile endpoint (default: /api/users/profile)

### Health Data Endpoints
- `VITE_HEALTH_DATA_ENDPOINT`: Health data endpoint (default: /api/user/health-data)

### Exercise Log Endpoints
- `VITE_EXERCISE_LOG_ENDPOINT`: Exercise log endpoint (default: /api/exercise-log)
- `VITE_EXERCISE_LOG_STATS_ENDPOINT`: Exercise stats endpoint (default: /api/exercise-log/stats)
- `VITE_EXERCISE_LOG_CALORIES_ENDPOINT`: Exercise calories endpoint (default: /api/exercise-log/calories/summary)
- `VITE_EXERCISE_LOG_STREAK_ENDPOINT`: Exercise streak endpoint (default: /api/exercise-log/streak/current)

### Food Log Endpoints
- `VITE_FOOD_LOG_ENDPOINT`: Food log endpoint (default: /api/food-log)
- `VITE_FOOD_LOG_DASHBOARD_ENDPOINT`: Food dashboard endpoint (default: /api/food-log/dashboard)
- `VITE_FOOD_LOG_NUTRITION_ENDPOINT`: Nutrition analysis endpoint (default: /api/food-log/nutrition-analysis)
- `VITE_FOOD_LOG_SUMMARY_ENDPOINT`: Food summary endpoint (default: /api/food-log/summary)

### Water Log Endpoints
- `VITE_WATER_LOG_ENDPOINT`: Water log endpoint (default: /api/water-logs)
- `VITE_WATER_LOG_STATS_ENDPOINT`: Water stats endpoint (default: /api/water-logs/stats)

### Sleep Log Endpoints
- `VITE_SLEEP_LOG_ENDPOINT`: Sleep log endpoint (default: /api/sleep-log)
- `VITE_SLEEP_LOG_STATS_ENDPOINT`: Sleep stats endpoint (default: /api/sleep-log/stats)
- `VITE_SLEEP_LOG_OVERVIEW_ENDPOINT`: Sleep overview endpoint (default: /api/sleep-log/stats/overview)
- `VITE_SLEEP_LOG_TRENDS_ENDPOINT`: Sleep trends endpoint (default: /api/sleep-log/trends/fixed)

### Health Goals Endpoints
- `VITE_HEALTH_GOALS_ENDPOINT`: Health goals endpoint (default: /api/health-goals)

### Application Configuration
- `VITE_APP_NAME`: Application name (default: Vita-Wise AI)
- `VITE_APP_VERSION`: Application version (default: 1.0.0)
- `VITE_APP_DESCRIPTION`: Application description (default: AI-powered health tracking application)

### Feature Flags
- `VITE_ENABLE_DEBUG_MODE`: Enable debug mode (default: true)
- `VITE_ENABLE_MOCK_DATA`: Enable mock data (default: false)
- `VITE_ENABLE_ANALYTICS`: Enable analytics (default: false)

### UI Configuration
- `VITE_DEFAULT_THEME`: Default theme (default: light)
- `VITE_ENABLE_DARK_MODE`: Enable dark mode (default: true)

### Performance Configuration
- `VITE_REQUEST_TIMEOUT`: Request timeout in milliseconds (default: 10000)
- `VITE_RETRY_ATTEMPTS`: Number of retry attempts (default: 3)
- `VITE_CACHE_DURATION`: Cache duration in milliseconds (default: 300000)

## Usage

### Development Environment
Create a `.env.local` file in the project root with your development configuration:

```bash
# Development API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_MOCK_DATA=false
```

### Production Environment
Create a `.env.production` file in the project root with your production configuration:

```bash
# Production API Configuration
VITE_API_BASE_URL=https://api.vita-wise-ai.com
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_ANALYTICS=true
```

### Staging Environment
Create a `.env.staging` file in the project root with your staging configuration:

```bash
# Staging API Configuration
VITE_API_BASE_URL=https://staging-api.vita-wise-ai.com
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_MOCK_DATA=false
```

## Configuration Access

The configuration is accessible through the `envConfig` object:

```typescript
import { envConfig, apiConfig, authConfig } from '@/config/env';

// Access full configuration
console.log(envConfig.apiBaseUrl);

// Access specific configuration groups
console.log(apiConfig.baseUrl);
console.log(authConfig.loginEndpoint);
```

## Environment Detection

Use the utility functions to detect the current environment:

```typescript
import { isDevelopment, isProduction, isDebugMode } from '@/config/env';

if (isDevelopment()) {
  console.log('Running in development mode');
}

if (isDebugMode()) {
  console.log('Debug mode is enabled');
}
```

## Best Practices

1. **Never commit sensitive data**: Use `.env.local` for local development and keep it in `.gitignore`
2. **Use environment-specific files**: Create separate files for different environments
3. **Validate configuration**: The configuration system provides fallback values for missing environment variables
4. **Type safety**: All configuration values are typed through the `EnvironmentConfig` interface
5. **Documentation**: Keep this README updated when adding new environment variables
