export const config = {
  // Use port 80 for API Gateway (working correctly)
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost',

  // Direct service URLs
  AUTH_SERVICE_URL: import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:3001',
  ATTENDANCE_SERVICE_URL: import.meta.env.VITE_ATTENDANCE_SERVICE_URL || 'http://localhost:3003',
  PROFILE_LOG_SERVICE_URL: import.meta.env.VITE_PROFILE_LOG_SERVICE_URL || 'http://localhost:3002',
  NOTIFICATION_SERVICE_URL: import.meta.env.VITE_NOTIFICATION_SERVICE_URL || 'http://localhost:3004',

  APP_NAME: import.meta.env.VITE_APP_NAME || 'WFH Attendance System',
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
};