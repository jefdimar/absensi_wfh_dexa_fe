// API Routes
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    LOGOUT: '/auth/logout',
    EMPLOYEES: '/auth/employees', // For admin to manage employees
  },

  // Admin endpoints
  ADMIN: {
    EMPLOYEES: '/admin/employees',
    ATTENDANCE_ALL: '/admin/attendance',
    ATTENDANCE_STATS: '/admin/attendance/stats',
    DASHBOARD: '/admin/dashboard',
    STATS: '/admin/stats'
  },

  // Employee endpoints
  ATTENDANCE: {
    CHECK_IN: '/attendance/check-in',
    CHECK_OUT: '/attendance/check-out',
    MY_RECORDS: '/attendance/my-records',
    DAILY_SUMMARY: '/attendance/summary/daily',
    MONTHLY_STATS: '/attendance/stats/monthly',
    ALL: '/attendance/all', // For admin view
    EMPLOYEE: '/attendance/employee', // For specific employee
    STATS: '/attendance/stats'
  },

  // Profile change logs
  PROFILE_LOGS: {
    ALL: '/profile-change-logs',
    BY_EMPLOYEE: '/profile-change-logs/employee'
  },

  // Notifications
  NOTIFICATIONS: {
    ALL: '/api/notifications',
    UNREAD: '/api/notifications/unread',
    MARK_READ: '/api/notifications'
  }
};

// App Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  ATTENDANCE: '/attendance',
  REPORTS: '/reports',
  SETTINGS: '/settings',

  // Admin routes
  ADMIN: {
    DASHBOARD: '/admin',
    EMPLOYEES: '/admin/employees',
    ATTENDANCE: '/admin/attendance',
    REPORTS: '/admin/reports',
    SETTINGS: '/admin/settings',
  }
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'WFH Attendance System',
  VERSION: '1.0.0',
  COMPANY: 'Dexa Group',
  SUPPORT_EMAIL: 'support@dexa.com',

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // Timeouts
  API_TIMEOUT: 10000,
  TOAST_DURATION: 4000,

  // Working hours
  STANDARD_WORK_HOURS: 8,
  WORK_DAYS_PER_WEEK: 5,

  // Date formats
  DATE_FORMAT: 'YYYY-MM-DD',
  TIME_FORMAT: 'HH:mm:ss',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  DISPLAY_DATE_FORMAT: 'MMM DD, YYYY',
  DISPLAY_TIME_FORMAT: 'h:mm A',
};

// Status Constants
export const ATTENDANCE_STATUS = {
  CHECK_IN: 'check-in',
  CHECK_OUT: 'check-out',
  PRESENT: 'present',
  ABSENT: 'absent',
  INCOMPLETE: 'incomplete',
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
  HR: 'hr',
};

// Theme Constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  ADMIN_REQUIRED: 'Admin access required.',
  EMPLOYEE_NOT_FOUND: 'Employee not found.',
  ATTENDANCE_NOT_FOUND: 'Attendance record not found.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  ADMIN_LOGIN_SUCCESS: 'Welcome back, Admin!',
  LOGOUT_SUCCESS: 'Logged out successfully!',
  EMPLOYEE_ADDED: 'Employee added successfully!',
  EMPLOYEE_UPDATED: 'Employee updated successfully!',
  EMPLOYEE_DELETED: 'Employee deleted successfully!',
  DATA_EXPORTED: 'Data exported successfully!',
};

// Loading Messages
export const LOADING_MESSAGES = {
  SIGNING_IN: 'Signing in...',
  SIGNING_OUT: 'Signing out...',
  CREATING_ACCOUNT: 'Creating account...',
  UPDATING_PROFILE: 'Updating profile...',
  CHECKING_IN: 'Checking in...',
  CHECKING_OUT: 'Checking out...',
  LOADING_DATA: 'Loading data...',
  SAVING_DATA: 'Saving data...',
  PROCESSING: 'Processing...',
  PLEASE_WAIT: 'Please wait...',
};

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: {
    PATTERN: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    MAX_LENGTH: 255,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z\s'-]+$/,
  },
  PHONE: {
    PATTERN: /^[0-9+\-\s()]+$/,
    MIN_LENGTH: 10,
    MAX_LENGTH: 20,
  },
  POSITION: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
};

// Date and Time Constants
export const DATE_TIME = {
  DAYS_OF_WEEK: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  MONTHS: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  SHORT_MONTHS: [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ],
  WORK_DAYS: [1, 2, 3, 4, 5], // Monday to Friday
  WEEKEND_DAYS: [0, 6], // Sunday and Saturday
};

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#007bff',
  SUCCESS: '#28a745',
  WARNING: '#ffc107',
  DANGER: '#dc3545',
  INFO: '#17a2b8',
  SECONDARY: '#6c757d',
  LIGHT: '#f8f9fa',
  DARK: '#343a40',

  // Gradient colors
  GRADIENTS: {
    BLUE: ['#007bff', '#0056b3'],
    GREEN: ['#28a745', '#1e7e34'],
    ORANGE: ['#fd7e14', '#e55100'],
    RED: ['#dc3545', '#bd2130'],
    PURPLE: ['#6f42c1', '#59359a'],
    TEAL: ['#20c997', '#17a2b8'],
  },

  // Chart series colors
  SERIES: [
    '#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8',
    '#6f42c1', '#fd7e14', '#20c997', '#6c757d', '#343a40'
  ],
};

// Breakpoints (Bootstrap compatible)
export const BREAKPOINTS = {
  XS: 0,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1400,
};

// Animation Durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000,
};

// Local Storage Keys for Caching
export const CACHE_KEYS = {
  MONTHLY_STATS: 'monthly_stats_cache',
  ATTENDANCE_RECORDS: 'attendance_records_cache',
  USER_PREFERENCES: 'user_preferences',
  DASHBOARD_LAYOUT: 'dashboard_layout',
  RECENT_SEARCHES: 'recent_searches',
};

// Cache Expiration Times (in milliseconds)
export const CACHE_EXPIRATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 2 * 60 * 60 * 1000, // 2 hours
  DAILY: 24 * 60 * 60 * 1000, // 24 hours
};

// Feature Flags
export const FEATURES = {
  DARK_MODE: true,
  NOTIFICATIONS: true,
  EXPORT_DATA: true,
  ANALYTICS: true,
  MOBILE_APP: false,
  BIOMETRIC_AUTH: false,
  GEOLOCATION: false,
  OFFLINE_MODE: false,
};

// Performance Metrics
export const PERFORMANCE = {
  MAX_RECORDS_PER_PAGE: 50,
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 1000,
  MAX_CONCURRENT_REQUESTS: 5,
  REQUEST_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Export all constants as default
export default {
  API_ENDPOINTS,
  ROUTES,
  STORAGE_KEYS,
  APP_CONFIG,
  ATTENDANCE_STATUS,
  USER_ROLES,
  THEMES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_MESSAGES,
  VALIDATION_RULES,
  DATE_TIME,
  CHART_COLORS,
  BREAKPOINTS,
  ANIMATION,
  CACHE_KEYS,
  CACHE_EXPIRATION,
  FEATURES,
  PERFORMANCE,
};
