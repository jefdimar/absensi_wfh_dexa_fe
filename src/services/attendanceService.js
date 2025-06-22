import axios from 'axios';
import { STORAGE_KEYS } from '../constants';
import { config } from '../config/env';

// Create axios instance using the working API Gateway
const attendanceApi = axios.create({
  baseURL: config.API_BASE_URL, // http://localhost
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
attendanceApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🚀 Attendance API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('❌ Attendance API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
attendanceApi.interceptors.response.use(
  (response) => {
    console.log('✅ Attendance API Response:', response.status, response.config.url);
    console.log('📄 Response Data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ Attendance API Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export const attendanceService = {
  // Check in - IMPROVED error handling
  checkIn: async () => {
    try {
      const response = await attendanceApi.post('/attendance/check-in');

      return {
        success: true,
        data: {
          ...response.data,
          timestamp: response.data.timestamp || new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Check-in API error:', error);

      let errorMessage = 'Check-in failed. Please try again.';
      let needsRefresh = false;

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;

        // Check if this is a state mismatch that requires refresh
        if (errorMessage.includes('already checked in') ||
          errorMessage.includes('duplicate') ||
          errorMessage.includes('status mismatch')) {
          needsRefresh = true;
        }
      } else if (error.response?.status === 400 || error.response?.status === 409) {
        errorMessage = 'You have already checked in today.';
        needsRefresh = true;
      } else if (error.response?.status === 401) {
        errorMessage = 'Please login to check in.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server temporarily unavailable. Please try again in a moment.';
      }

      return {
        success: false,
        error: errorMessage,
        needsRefresh: needsRefresh,
      };
    }
  },

  // Check out - IMPROVED error handling
  checkOut: async () => {
    try {
      const response = await attendanceApi.post('/attendance/check-out');

      return {
        success: true,
        data: {
          ...response.data,
          timestamp: response.data.timestamp || new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Check-out API error:', error);

      let errorMessage = 'Check-out failed. Please try again.';
      let needsRefresh = false;

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;

        // Check if this is a state mismatch that requires refresh
        if (errorMessage.includes('already checked out') ||
          errorMessage.includes('not checked in') ||
          errorMessage.includes('status mismatch')) {
          needsRefresh = true;
        }
      } else if (error.response?.status === 400) {
        errorMessage = 'You need to check in first or have already checked out.';
        needsRefresh = true;
      } else if (error.response?.status === 409) {
        errorMessage = 'You have already checked out today.';
        needsRefresh = true;
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server temporarily unavailable. Please try again in a moment.';
      }

      return {
        success: false,
        error: errorMessage,
        needsRefresh: needsRefresh,
      };
    }
  },

  // Get daily summary - IMPROVED with better fallback strategies
  getDailySummary: async (date = null) => {
    console.log('📊 Requesting daily summary...');

    // Strategy 1: Try the summary endpoint first
    try {
      let url = '/attendance/summary/daily';
      if (date) {
        url += `?date=${date}`;
      }

      console.log('📊 Trying summary endpoint:', url);
      const response = await attendanceApi.get(url);

      const attendanceData = response.data;
      if (attendanceData && attendanceData.employeeId) {
        return {
          success: true,
          data: {
            date: attendanceData.date,
            checkInTime: attendanceData.checkInTime,
            checkOutTime: attendanceData.checkOutTime,
            totalHours: attendanceData.workingHours ? `${attendanceData.workingHours}:00` : null,
            status: attendanceData.status,
            employeeId: attendanceData.employeeId,
            _source: 'api-summary'
          },
        };
      }
    } catch (error) {
      console.log('📊 Summary endpoint failed, trying fallback strategy...');

      // Strategy 2: Try to get today's data from attendance records
      try {
        console.log('📊 Fallback: Getting daily summary from attendance records...');
        const recordsResponse = await attendanceApi.get('/attendance/my-records');

        if (recordsResponse.data && Array.isArray(recordsResponse.data)) {
          const records = recordsResponse.data;

          // Filter today's records
          const targetDate = date ? new Date(date) : new Date();
          const todayString = targetDate.toDateString();

          const todayRecords = records.filter(record => {
            const recordDate = new Date(record.timestamp);
            return recordDate.toDateString() === todayString;
          });

          if (todayRecords.length > 0) {
            // Find check-in and check-out records
            const checkInRecord = todayRecords.find(r => r.status === 'check-in');
            const checkOutRecord = todayRecords.find(r => r.status === 'check-out');

            // Calculate working hours if both records exist
            let totalHours = null;
            if (checkInRecord && checkOutRecord) {
              const checkInTime = new Date(checkInRecord.timestamp);
              const checkOutTime = new Date(checkOutRecord.timestamp);
              const diffMs = checkOutTime - checkInTime;
              const diffHours = diffMs / (1000 * 60 * 60);
              const hours = Math.floor(diffHours);
              const minutes = Math.round((diffHours - hours) * 60);
              totalHours = `${hours}:${minutes.toString().padStart(2, '0')}`;
            }

            return {
              success: true,
              data: {
                date: targetDate.toISOString().split('T')[0],
                checkInTime: checkInRecord?.timestamp || null,
                checkOutTime: checkOutRecord?.timestamp || null,
                totalHours: totalHours,
                status: checkOutRecord ? 'completed' : (checkInRecord ? 'in-progress' : 'not-started'),
                employeeId: checkInRecord?.employeeId || checkOutRecord?.employeeId,
                _source: 'fallback-records'
              },
            };
          }
        }
      } catch (fallbackError) {
        console.log('📊 Fallback strategy also failed:', fallbackError);
      }

      // Handle the original error
      if (error.response?.status === 404) {
        console.log('📊 No attendance record found for today');
        return {
          success: true,
          data: null,
        };
      } else if (error.response?.status >= 500) {
        console.error('📊 Server error getting daily summary:', error.response?.data);
        return {
          success: true, // Don't fail the app
          data: null,
          warning: 'Daily summary temporarily unavailable due to server maintenance',
        };
      } else if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Authentication required. Please login again.',
          data: null,
        };
      }
    }

    // Final fallback - return null data
    return {
      success: true,
      data: null,
      warning: 'Unable to load daily summary at this time',
    };
  },

  // Get attendance records - IMPROVED error handling
  getAttendanceRecords: async (startDate = null, endDate = null) => {
    try {
      let url = '/attendance/my-records';

      console.log('📅 Requesting attendance records from:', url);
      const response = await attendanceApi.get(url);

      console.log('📅 Attendance records API response:', response.data);

      const recordsData = response.data;

      if (Array.isArray(recordsData)) {
        // Sort records by timestamp (newest first)
        const sortedRecords = recordsData.sort((a, b) =>
          new Date(b.timestamp) - new Date(a.timestamp)
        );

        console.log('📅 Processed records:', sortedRecords.length);

        return {
          success: true,
          data: sortedRecords,
        };
      }

      console.log('📅 No records found or unexpected format');
      return {
        success: true,
        data: [],
      };

    } catch (error) {
      console.error('Get attendance records API error:', error);

      // Handle different error scenarios
      if (error.response?.status === 404) {
        return {
          success: true,
          data: [],
        };
      } else if (error.response?.status >= 500) {
        console.error('📅 Server error getting attendance records:', error.response?.data);
        return {
          success: true, // Don't fail the app
          data: [],
          warning: 'Unable to load attendance records due to server error',
        };
      } else if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Authentication required. Please login again.',
          data: [],
        };
      }

      // For other errors, return empty data but don't fail
      return {
        success: true, // Don't fail the app
        data: [],
        warning: 'Unable to load attendance records at this time',
      };
    }
  },

  // Get monthly stats - IMPROVED error handling
  getMonthlyStats: async (year = null, month = null) => {
    try {
      let url = '/attendance/stats/monthly';
      const params = new URLSearchParams();

      if (year) params.append('year', year);
      if (month) params.append('month', month);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log('📊 Requesting monthly stats from:', url);
      const response = await attendanceApi.get(url);

      console.log('📊 Monthly stats API response:', response.data);

      const apiData = response.data;

      if (apiData && typeof apiData === 'object') {
        // Calculate total working hours
        const totalWorkingHours = (apiData.averageWorkingHours || 0) * (apiData.presentDays || 0);

        // Calculate attendance rate
        const attendanceRate = apiData.totalDays > 0
          ? Math.round((apiData.presentDays / apiData.totalDays) * 100)
          : 0;

        // Format hours
        const formatHours = (hours) => {
          if (!hours || hours === 0) return '0:00';
          const wholeHours = Math.floor(hours);
          const minutes = Math.round((hours - wholeHours) * 60);
          return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
        };

        // Transform to our expected format
        const normalizedStats = {
          totalDays: apiData.presentDays || 0,
          totalHours: formatHours(totalWorkingHours),
          averageHours: formatHours(apiData.averageWorkingHours || 0),
          attendanceRate: `${attendanceRate}%`,
          presentDays: apiData.presentDays || 0,
          absentDays: apiData.absentDays || 0,
          incompleteDays: apiData.incompleteDays || 0,
          totalDaysInMonth: apiData.totalDays || 0,
          workingDaysInMonth: apiData.totalDays || 0,
          _raw: apiData,
        };

        console.log('📊 Normalized stats:', normalizedStats);

        return {
          success: true,
          data: normalizedStats,
        };
      } else {
        // Return default values for no data
        return {
          success: true,
          data: {
            totalDays: 0,
            totalHours: '0:00',
            averageHours: '0:00',
            attendanceRate: '0%',
            presentDays: 0,
            absentDays: 0,
            incompleteDays: 0,
            totalDaysInMonth: 0,
            workingDaysInMonth: 0,
          },
        };
      }
    } catch (error) {
      console.error('Get monthly stats API error:', error);

      // Default stats object
      const defaultStats = {
        totalDays: 0,
        totalHours: '0:00',
        averageHours: '0:00',
        attendanceRate: '0%',
        presentDays: 0,
        absentDays: 0,
        incompleteDays: 0,
        totalDaysInMonth: 0,
        workingDaysInMonth: 0,
      };

      // Handle different error scenarios
      if (error.response?.status === 404) {
        // No data for that month - this is normal
        return {
          success: true,
          data: defaultStats,
        };
      } else if (error.response?.status >= 500) {
        // Server error - log it but don't fail the app
        console.error('📊 Server error getting monthly stats:', error.response?.data);
        return {
          success: true, // Don't fail the app
          data: defaultStats,
          warning: 'Monthly statistics temporarily unavailable due to server maintenance',
        };
      } else if (error.response?.status === 401) {
        // Authentication error
        return {
          success: false,
          error: 'Authentication required. Please login again.',
          data: defaultStats,
        };
      }

      // For other errors, return default data but don't fail
      return {
        success: true, // Don't fail the app
        data: defaultStats,
        warning: 'Unable to load monthly statistics at this time',
      };
    }
  },
};
