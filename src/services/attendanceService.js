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
  // Check in
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

  // Check out
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

  // Get daily summary - ALWAYS provide a date parameter
  getDailySummary: async (date = null) => {

    try {
      // ALWAYS provide a date parameter - never call the API without one
      let dateStr;

      if (date) {
        // Validate and format the provided date
        if (typeof date === 'string') {
          // Check if it's already in YYYY-MM-DD format
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (dateRegex.test(date)) {
            dateStr = date;
          } else {
            // Try to parse it as a date
            const parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) {
              console.error('📊 Invalid date string provided:', date);
              throw new Error('Invalid date format provided');
            }
            dateStr = parsedDate.toISOString().split('T')[0];
          }
        } else if (date instanceof Date) {
          if (isNaN(date.getTime())) {
            console.error('📊 Invalid Date object provided:', date);
            throw new Error('Invalid Date object provided');
          }
          dateStr = date.toISOString().split('T')[0];
        } else {
          console.error('📊 Invalid date type provided:', typeof date, date);
          throw new Error('Date must be a string or Date object');
        }
      } else {
        // If no date provided, use today's date
        const today = new Date();
        dateStr = today.toISOString().split('T')[0];
      }

      // Double-check the final date string format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        console.error('📊 Final date string is invalid:', dateStr);
        throw new Error('Failed to format date properly');
      }

      // ALWAYS include the date parameter
      const url = `/attendance/summary/daily?date=${dateStr}`;

      const response = await attendanceApi.get(url);

      const apiData = response.data;

      // Handle the actual API response format
      if (apiData && apiData.employeeId) {
        // Transform the API response to match our expected format
        const transformedData = {
          date: apiData.date,
          employeeId: apiData.employeeId,
          status: apiData.status,
          checkInTime: apiData.checkInTime || null,
          checkOutTime: apiData.checkOutTime || null,
          totalHours: null,
          workingMinutes: 0,
          _source: 'api-summary'
        };

        // Calculate working hours if both times are available
        if (apiData.checkInTime && apiData.checkOutTime) {
          try {
            const checkIn = new Date(apiData.checkInTime);
            const checkOut = new Date(apiData.checkOutTime);

            if (!isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime())) {
              const diffMs = checkOut - checkIn;

              if (diffMs > 0) {
                const workingMinutes = Math.floor(diffMs / (1000 * 60));
                const hours = Math.floor(workingMinutes / 60);
                const minutes = workingMinutes % 60;

                transformedData.totalHours = `${hours}:${minutes.toString().padStart(2, '0')}`;
                transformedData.workingMinutes = workingMinutes;
              }
            }
          } catch (timeError) {
            console.warn('📊 Error calculating working hours:', timeError);
          }
        }

        // Map API status to our expected status
        switch (apiData.status) {
          case 'absent':
            transformedData.status = 'not-started';
            break;
          case 'present':
            // If we have both check-in and check-out, it's completed
            if (apiData.checkInTime && apiData.checkOutTime) {
              transformedData.status = 'completed';
            } else if (apiData.checkInTime) {
              transformedData.status = 'in-progress';
            } else {
              transformedData.status = 'not-started';
            }
            break;
          case 'incomplete':
            transformedData.status = 'in-progress';
            break;
          default:
            transformedData.status = 'not-started';
        }

        return {
          success: true,
          data: transformedData,
        };
      } else {
        return {
          success: true,
          data: null,
        };
      }

    } catch (error) {
      console.error('📊 Daily summary API error:', error);

      // If it's a date validation error, don't retry with fallback
      if (error.message && error.message.includes('Invalid date')) {
        return {
          success: false,
          error: 'Invalid date provided for daily summary',
          data: null,
        };
      }

      if (error.response?.status === 404) {
        console.log('📊 No attendance record found for the requested date');
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

      // For other errors, return null data but don't fail
      return {
        success: true,
        data: null,
        warning: 'Unable to load daily summary at this time',
      };
    }
  },

  // Get attendance records
  getAttendanceRecords: async (startDate = null, endDate = null) => {
    try {
      let url = '/attendance/my-records';

      const response = await attendanceApi.get(url);

      const recordsData = response.data;

      if (Array.isArray(recordsData)) {
        // Sort records by timestamp (newest first)
        const sortedRecords = recordsData.sort((a, b) =>
          new Date(b.timestamp) - new Date(a.timestamp)
        );

        return {
          success: true,
          data: sortedRecords,
        };
      }
      return {
        success: true,
        data: [],
      };

    } catch (error) {
      console.error('Get attendance records API error:', error);

      if (error.response?.status === 404) {
        return {
          success: true,
          data: [],
        };
      } else if (error.response?.status >= 500) {
        console.error('📅 Server error getting attendance records:', error.response?.data);
        return {
          success: true,
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

      return {
        success: true,
        data: [],
        warning: 'Unable to load attendance records at this time',
      };
    }
  },

  // Get monthly stats
  getMonthlyStats: async (year = null, month = null) => {
    try {
      let url = '/attendance/stats/monthly';
      const params = new URLSearchParams();

      if (year) params.append('year', year);
      if (month) params.append('month', month);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await attendanceApi.get(url);

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

        return {
          success: true,
          data: normalizedStats,
        };
      } else {
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

      if (error.response?.status === 404) {
        return {
          success: true,
          data: defaultStats,
        };
      } else if (error.response?.status >= 500) {
        console.error('📊 Server error getting monthly stats:', error.response?.data);
        return {
          success: true,
          data: defaultStats,
          warning: 'Monthly statistics temporarily unavailable due to server maintenance',
        };
      } else if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Authentication required. Please login again.',
          data: defaultStats,
        };
      }

      return {
        success: true,
        data: defaultStats,
        warning: 'Unable to load monthly statistics at this time',
      };
    }
  },
};
