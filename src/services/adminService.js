import api from './api';
import { API_ENDPOINTS } from '../constants';

export const adminService = {
  // Get all employees
  getAllEmployees: async (page = 1, limit = 10, search = '') => {
    try {
      const params = { page, limit };
      if (search) params.search = search;

      const response = await api.get(API_ENDPOINTS.ADMIN.EMPLOYEES, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get dashboard summary - CORRECTED METHOD
  getDashboardSummary: async (date) => {
    try {
      console.log('Fetching dashboard data for date:', date);

      // Based on your Postman collection, let's try these endpoints
      const [attendanceResponse] = await Promise.all([
        // Get all attendance records for the date
        api.get('/attendance/all', {
          params: {
            date,
            limit: 100,
            page: 1
          }
        })
      ]);

      console.log('Attendance response:', attendanceResponse.data);

      // Process the response based on your API structure
      const attendanceData = attendanceResponse.data;

      // If the response has a different structure, adjust accordingly
      const recentAttendance = attendanceData.attendance || attendanceData.data || attendanceData || [];

      // Calculate stats from attendance data
      const uniqueEmployees = new Set();
      let checkInCount = 0;
      let checkOutCount = 0;

      recentAttendance.forEach(record => {
        if (record.employeeId) {
          uniqueEmployees.add(record.employeeId);
        }
        if (record.status === 'check-in') {
          checkInCount++;
        } else if (record.status === 'check-out') {
          checkOutCount++;
        }
      });

      return {
        totalEmployees: uniqueEmployees.size,
        presentCount: checkInCount,
        absentCount: Math.max(0, uniqueEmployees.size - checkInCount),
        recentAttendance: recentAttendance
      };

    } catch (error) {
      console.error('Dashboard summary fetch failed:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      // Return empty data instead of throwing
      return {
        totalEmployees: 0,
        presentCount: 0,
        absentCount: 0,
        recentAttendance: []
      };
    }
  },

  // Add new employee
  addEmployee: async (employeeData) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, employeeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update employee
  updateEmployee: async (employeeId, employeeData) => {
    try {
      const response = await api.put(`/auth/employees/${employeeId}`, employeeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete employee
  deleteEmployee: async (employeeId) => {
    try {
      const response = await api.delete(`/auth/employees/${employeeId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all attendance records
  getAllAttendance: async (page = 1, limit = 10, filters = {}) => {
    try {
      const params = { page, limit, ...filters };
      const response = await api.get('/attendance/all', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get attendance by employee
  getEmployeeAttendance: async (employeeId, startDate, endDate) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get(`/attendance/employee/${employeeId}`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get attendance statistics
  getAttendanceStats: async (startDate, endDate) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get('/attendance/stats', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get profile change logs
  getProfileChangeLogs: async (employeeId = null) => {
    try {
      const endpoint = employeeId
        ? `${API_ENDPOINTS.PROFILE_LOGS.BY_EMPLOYEE}/${employeeId}`
        : API_ENDPOINTS.PROFILE_LOGS.ALL;

      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};