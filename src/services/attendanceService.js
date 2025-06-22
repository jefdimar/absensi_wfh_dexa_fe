import axios from 'axios';
import { STORAGE_KEYS } from '../constants';
import { config } from '../config/env';

// Create axios instance using the working API Gateway
const attendanceApi = axios.create({
  baseURL: config.API_BASE_URL, // http://localhost
  timeout: 15000, // Increased timeout for monthly stats
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

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400 || error.response?.status === 409) {
        errorMessage = 'You have already checked in today.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Please login to check in.';
      }

      return {
        success: false,
        error: errorMessage,
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

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'You need to check in first or have already checked out.';
      } else if (error.response?.status === 409) {
        errorMessage = 'You have already checked out today.';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  // Get daily summary - Enhanced with better error handling
  getDailySummary: async (date = null) => {
    try {
      let url = '/attendance/summary/daily';
      if (date) {
        url += `?date=${date}`;
      }

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
          },
        };
      } else {
        return {
          success: true,
          data: null,
        };
      }
    } catch (error) {
      console.error('Get daily summary API error:', error);

      if (error.response?.status === 404) {
        return {
          success: true,
          data: null,
        };
      }

      return {
        success: false,
        error: 'Failed to fetch daily summary.',
        data: null,
      };
    }
  },

  // Get attendance records - Enhanced with better filtering
  getAttendanceRecords: async (startDate = null, endDate = null) => {
    try {
      let url = '/attendance/my-records';

      console.log('📅 Requesting attendance records from:', url);
      const response = await attendanceApi.get(url);

      console.log('📅 Attendance records API response:', response.data);

      const recordsData = response.data;

      if (Array.isArray(recordsData)) {
        // Sort records by timestamp (newest first)
        let sortedRecords = recordsData.sort((a, b) =>
          new Date(b.timestamp) - new Date(a.timestamp)
        );

        // Apply date filtering if provided
        if (startDate || endDate) {
          sortedRecords = sortedRecords.filter(record => {
            const recordDate = new Date(record.timestamp);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            if (start && recordDate < start) return false;
            if (end && recordDate > end) return false;
            return true;
          });
        }

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

      if (error.response?.status === 404) {
        return {
          success: true,
          data: [],
        };
      }

      return {
        success: false,
        error: 'Failed to fetch attendance records.',
        data: [],
      };
    }
  },

  // Enhanced get monthly stats with better data processing
  getMonthlyStats: async (year = null, month = null) => {
    try {
      let url = '/attendance/stats/monthly';
      const params = new URLSearchParams();

      // Use current month/year if not provided
      const currentDate = new Date();
      const targetYear = year || currentDate.getFullYear();
      const targetMonth = month || (currentDate.getMonth() + 1);

      params.append('year', targetYear);
      params.append('month', targetMonth);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log('📊 Requesting monthly stats from:', url);
      const response = await attendanceApi.get(url);

      console.log('📊 Monthly stats API response:', response.data);

      const apiData = response.data;

      if (apiData && typeof apiData === 'object') {
        // Enhanced calculations
        const presentDays = apiData.presentDays || 0;
        const absentDays = apiData.absentDays || 0;
        const incompleteDays = apiData.incompleteDays || 0;
        const totalDaysInMonth = apiData.totalDays || 0;
        const averageWorkingHours = apiData.averageWorkingHours || 0;

        // Calculate total working hours
        const totalWorkingHours = averageWorkingHours * presentDays;

        // Calculate attendance rate
        const attendanceRate = totalDaysInMonth > 0
          ? Math.round((presentDays / totalDaysInMonth) * 100)
          : 0;

        // Enhanced hour formatting
        const formatHours = (hours) => {
          if (!hours || hours === 0) return '0:00';
          const wholeHours = Math.floor(hours);
          const minutes = Math.round((hours - wholeHours) * 60);
          return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
        };

        // Calculate efficiency metrics
        const expectedHoursPerDay = 8;
        const expectedTotalHours = presentDays * expectedHoursPerDay;
        const hoursEfficiency = expectedTotalHours > 0
          ? Math.round((totalWorkingHours / expectedTotalHours) * 100)
          : 0;

        // Determine performance level
        const getPerformanceLevel = (rate) => {
          if (rate >= 95) return { level: 'Excellent', color: 'success', icon: 'bi-trophy' };
          if (rate >= 85) return { level: 'Good', color: 'info', icon: 'bi-star' };
          if (rate >= 75) return { level: 'Average', color: 'warning', icon: 'bi-dash-circle' };
          return { level: 'Needs Improvement', color: 'danger', icon: 'bi-exclamation-triangle' };
        };

        const performance = getPerformanceLevel(attendanceRate);

        // Transform to our expected format
        const normalizedStats = {
          // Basic stats
          totalDays: presentDays,
          presentDays,
          absentDays,
          incompleteDays,
          totalDaysInMonth,
          workingDaysInMonth: totalDaysInMonth,

          // Hours
          totalHours: formatHours(totalWorkingHours),
          averageHours: formatHours(averageWorkingHours),
          expectedTotalHours: formatHours(expectedTotalHours),

          // Rates and percentages
          attendanceRate: `${attendanceRate}%`,
          hoursEfficiency: `${hoursEfficiency}%`,

          // Performance metrics
          performance,

          // Additional metrics
          workingDaysCompleted: presentDays,
          workingDaysRemaining: Math.max(0, totalDaysInMonth - presentDays - absentDays - incompleteDays),
          completionRate: totalDaysInMonth > 0 ? Math.round(((presentDays + absentDays + incompleteDays) / totalDaysInMonth) * 100) : 0,

          // Trends (if we have historical data)
          trends: {
            attendanceImproving: attendanceRate >= 80,
            hoursConsistent: hoursEfficiency >= 80 && hoursEfficiency <= 120,
            onTrack: attendanceRate >= 85 && hoursEfficiency >= 80,
          },

          // Raw data for debugging
          _raw: apiData,
          _calculated: {
            totalWorkingHours,
            expectedTotalHours,
            hoursEfficiency,
            attendanceRate,
          }
        };

        console.log('📊 Normalized stats:', normalizedStats);

        return {
          success: true,
          data: normalizedStats,
        };
      } else {
        // If no data or unexpected format, return default values
        const defaultStats = {
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          incompleteDays: 0,
          totalDaysInMonth: new Date(targetYear, targetMonth, 0).getDate(),
          workingDaysInMonth: new Date(targetYear, targetMonth, 0).getDate(),

          // Hours
          totalHours: '0:00',
          averageHours: '0:00',
          expectedTotalHours: '0:00',

          // Rates and percentages
          attendanceRate: '0%',
          hoursEfficiency: '0%',

          // Performance metrics
          performance: { level: 'No Data', color: 'secondary', icon: 'bi-question-circle' },

          // Additional metrics
          workingDaysCompleted: 0,
          workingDaysRemaining: new Date(targetYear, targetMonth, 0).getDate(),
          completionRate: 0,

          // Trends
          trends: {
            attendanceImproving: false,
            hoursConsistent: false,
            onTrack: false,
          },

          // Raw data
          _raw: {},
          _calculated: {
            totalWorkingHours: 0,
            expectedTotalHours: 0,
            hoursEfficiency: 0,
            attendanceRate: 0,
          }
        };

        return {
          success: true,
          data: defaultStats,
        };
      }
    } catch (error) {
      console.error('Get monthly stats API error:', error);

      // If 404, it means no data for that month
      if (error.response?.status === 404) {
        const targetYear = year || new Date().getFullYear();
        const targetMonth = month || (new Date().getMonth() + 1);

        return {
          success: true,
          data: {
            totalDays: 0,
            presentDays: 0,
            absentDays: 0,
            incompleteDays: 0,
            totalDaysInMonth: new Date(targetYear, targetMonth, 0).getDate(),
            workingDaysInMonth: new Date(targetYear, targetMonth, 0).getDate(),
            totalHours: '0:00',
            averageHours: '0:00',
            expectedTotalHours: '0:00',
            attendanceRate: '0%',
            hoursEfficiency: '0%',
            performance: { level: 'No Data', color: 'secondary', icon: 'bi-question-circle' },
            workingDaysCompleted: 0,
            workingDaysRemaining: new Date(targetYear, targetMonth, 0).getDate(),
            completionRate: 0,
            trends: {
              attendanceImproving: false,
              hoursConsistent: false,
              onTrack: false,
            },
            _raw: {},
            _calculated: {
              totalWorkingHours: 0,
              expectedTotalHours: 0,
              hoursEfficiency: 0,
              attendanceRate: 0,
            }
          },
        };
      }

      return {
        success: false,
        error: `Failed to fetch monthly statistics for ${month}/${year}.`,
        data: {
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          incompleteDays: 0,
          totalDaysInMonth: 0,
          workingDaysInMonth: 0,
          totalHours: '0:00',
          averageHours: '0:00',
          expectedTotalHours: '0:00',
          attendanceRate: '0%',
          hoursEfficiency: '0%',
          performance: { level: 'Error', color: 'danger', icon: 'bi-exclamation-triangle' },
          workingDaysCompleted: 0,
          workingDaysRemaining: 0,
          completionRate: 0,
          trends: {
            attendanceImproving: false,
            hoursConsistent: false,
            onTrack: false,
          },
          _raw: {},
          _calculated: {
            totalWorkingHours: 0,
            expectedTotalHours: 0,
            hoursEfficiency: 0,
            attendanceRate: 0,
          }
        },
      };
    }
  },

  // Get year-to-date statistics
  getYearToDateStats: async (year = null) => {
    try {
      const targetYear = year || new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      console.log('📊 Calculating year-to-date stats for:', targetYear);

      // Fetch stats for each month up to current month
      const monthlyPromises = [];
      for (let month = 1; month <= currentMonth; month++) {
        monthlyPromises.push(
          attendanceService.getMonthlyStats(targetYear, month)
        );
      }

      const monthlyResults = await Promise.all(monthlyPromises);

      // Aggregate the results
      let totalPresentDays = 0;
      let totalAbsentDays = 0;
      let totalIncompleteDays = 0;
      let totalWorkingHours = 0;
      let totalExpectedHours = 0;
      let monthsWithData = 0;

      monthlyResults.forEach(result => {
        if (result.success && result.data) {
          const data = result.data;
          totalPresentDays += data.presentDays || 0;
          totalAbsentDays += data.absentDays || 0;
          totalIncompleteDays += data.incompleteDays || 0;

          // Parse hours
          const totalHours = parseFloat(data.totalHours?.replace(':', '.') || '0');
          const expectedHours = parseFloat(data.expectedTotalHours?.replace(':', '.') || '0');

          totalWorkingHours += totalHours;
          totalExpectedHours += expectedHours;

          if (data.presentDays > 0) monthsWithData++;
        }
      });

      const formatHours = (hours) => {
        if (!hours || hours === 0) return '0:00';
        const wholeHours = Math.floor(hours);
        const minutes = Math.round((hours - wholeHours) * 60);
        return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
      };

      const totalDays = totalPresentDays + totalAbsentDays + totalIncompleteDays;
      const attendanceRate = totalDays > 0 ? Math.round((totalPresentDays / totalDays) * 100) : 0;
      const hoursEfficiency = totalExpectedHours > 0 ? Math.round((totalWorkingHours / totalExpectedHours) * 100) : 0;

      return {
        success: true,
        data: {
          year: targetYear,
          monthsCompleted: currentMonth,
          monthsWithData,
          totalPresentDays,
          totalAbsentDays,
          totalIncompleteDays,
          totalDays,
          totalHours: formatHours(totalWorkingHours),
          expectedTotalHours: formatHours(totalExpectedHours),
          averageHoursPerDay: totalPresentDays > 0 ? formatHours(totalWorkingHours / totalPresentDays) : '0:00',
          attendanceRate: `${attendanceRate}%`,
          hoursEfficiency: `${hoursEfficiency}%`,
          monthlyBreakdown: monthlyResults.map((result, index) => ({
            month: index + 1,
            monthName: new Date(targetYear, index).toLocaleDateString('en-US', { month: 'long' }),
            ...result.data
          }))
        }
      };

    } catch (error) {
      console.error('Get year-to-date stats error:', error);
      return {
        success: false,
        error: 'Failed to calculate year-to-date statistics.',
        data: null
      };
    }
  },

  // Get attendance comparison between months
  getMonthComparison: async (year1, month1, year2, month2) => {
    try {
      console.log('📊 Comparing months:', `${month1}/${year1}`, 'vs', `${month2}/${year2}`);

      const [result1, result2] = await Promise.all([
        attendanceService.getMonthlyStats(year1, month1),
        attendanceService.getMonthlyStats(year2, month2)
      ]);

      if (!result1.success || !result2.success) {
        return {
          success: false,
          error: 'Failed to fetch comparison data.',
          data: null
        };
      }

      const data1 = result1.data;
      const data2 = result2.data;

      // Calculate differences
      const presentDaysDiff = (data1.presentDays || 0) - (data2.presentDays || 0);
      const attendanceRateDiff = parseInt(data1.attendanceRate || '0') - parseInt(data2.attendanceRate || '0');
      const totalHoursDiff = parseFloat(data1.totalHours?.replace(':', '.') || '0') - parseFloat(data2.totalHours?.replace(':', '.') || '0');

      return {
        success: true,
        data: {
          period1: {
            year: year1,
            month: month1,
            monthName: new Date(year1, month1 - 1).toLocaleDateString('en-US', { month: 'long' }),
            ...data1
          },
          period2: {
            year: year2,
            month: month2,
            monthName: new Date(year2, month2 - 1).toLocaleDateString('en-US', { month: 'long' }),
            ...data2
          },
          comparison: {
            presentDaysDiff,
            attendanceRateDiff,
            totalHoursDiff: Math.round(totalHoursDiff * 100) / 100,
            improvement: {
              attendance: attendanceRateDiff > 0,
              hours: totalHoursDiff > 0,
              consistency: Math.abs(attendanceRateDiff) <= 5 // Within 5% is considered consistent
            }
          }
        }
      };

    } catch (error) {
      console.error('Get month comparison error:', error);
      return {
        success: false,
        error: 'Failed to compare months.',
        data: null
      };
    }
  }
};

