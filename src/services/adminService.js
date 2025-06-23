import api from './api';
import { API_ENDPOINTS } from '../constants';

export const adminService = {
  // Get dashboard summary
  getDashboardSummary: async (date) => {
    try {
      console.log('adminService: Getting dashboard summary for date:', date);

      // Initialize default response
      let summary = {
        totalEmployees: 0,
        presentCount: 0,
        absentCount: 0,
        recentAttendance: []
      };

      try {
        // Try to get recent attendance first since we know this works
        console.log('adminService: Fetching recent attendance...');
        const attendanceResponse = await adminService.getAllAttendance(1, 10, {
          date: date,
          startDate: date,
          endDate: date
        });
        console.log('adminService: Attendance response:', attendanceResponse);

        if (attendanceResponse && attendanceResponse.data) {
          summary.recentAttendance = attendanceResponse.data;

          // Calculate stats from the attendance data
          const attendanceData = attendanceResponse.data;
          const uniqueEmployees = new Set();
          let checkInCount = 0;
          let checkOutCount = 0;

          attendanceData.forEach(record => {
            uniqueEmployees.add(record.employeeId);
            if (record.status === 'check-in') {
              checkInCount++;
            } else if (record.status === 'check-out') {
              checkOutCount++;
            }
          });

          // Calculate present employees (those who have checked in)
          const employeesWithCheckIn = new Set();
          const employeesWithCheckOut = new Set();

          attendanceData.forEach(record => {
            if (record.status === 'check-in') {
              employeesWithCheckIn.add(record.employeeId);
            } else if (record.status === 'check-out') {
              employeesWithCheckOut.add(record.employeeId);
            }
          });

          summary.totalEmployees = uniqueEmployees.size;
          summary.presentCount = employeesWithCheckIn.size;
          summary.absentCount = Math.max(0, summary.totalEmployees - summary.presentCount);

          console.log('adminService: Calculated stats from attendance data:', {
            totalEmployees: summary.totalEmployees,
            presentCount: summary.presentCount,
            absentCount: summary.absentCount,
            recordsCount: attendanceData.length
          });
        }
      } catch (attendanceError) {
        console.warn('adminService: Attendance fetch failed:', attendanceError);
      }

      try {
        // Try to get attendance stats for more accurate numbers
        console.log('adminService: Fetching attendance stats...');
        const statsResponse = await adminService.getAttendanceStats(date, date);
        console.log('adminService: Stats response:', statsResponse);

        if (statsResponse) {
          // Override calculated stats with API stats if available
          if (statsResponse.totalEmployees) summary.totalEmployees = statsResponse.totalEmployees;
          if (statsResponse.presentCount) summary.presentCount = statsResponse.presentCount;
          if (statsResponse.absentCount) summary.absentCount = statsResponse.absentCount;
        }
      } catch (statsError) {
        console.warn('adminService: Stats fetch failed, using calculated stats:', statsError);
      }

      console.log('adminService: Final summary:', summary);
      return summary;

    } catch (error) {
      console.error('adminService: Dashboard summary error:', error);
      // Return default values on error
      return {
        totalEmployees: 0,
        presentCount: 0,
        absentCount: 0,
        recentAttendance: []
      };
    }
  },

  // Get all employees
  getAllEmployees: async (page = 1, limit = 10, search = '') => {
    try {
      const params = { page, limit };
      if (search) params.search = search;

      console.log('adminService: Fetching employees with params:', params);

      let response;
      try {
        response = await api.get('/auth/employees', { params });
      } catch (error) {
        console.warn('adminService: /auth/employees failed, trying alternatives...');
        try {
          response = await api.get('/admin/employees', { params });
        } catch (error2) {
          console.warn('adminService: No employee endpoint available, returning empty data');
          return {
            employees: [],
            data: [],
            totalPages: 0,
            currentPage: page,
            totalEmployees: 0,
            total: 0
          };
        }
      }

      console.log('adminService: Employees response:', response.data);

      // Handle different response structures
      if (response.data.employees) {
        return response.data;
      } else if (response.data.data) {
        return {
          employees: response.data.data,
          totalPages: response.data.totalPages || 1,
          currentPage: response.data.page || page,
          total: response.data.total || response.data.data.length
        };
      } else if (Array.isArray(response.data)) {
        return {
          employees: response.data,
          totalPages: 1,
          currentPage: page,
          total: response.data.length
        };
      }

      return response.data;
    } catch (error) {
      console.error('adminService: Get employees error:', error);
      throw error.response?.data || error.message;
    }
  },

  // Add new employee
  addEmployee: async (employeeData) => {
    try {
      console.log('adminService: Adding employee:', employeeData);
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, employeeData);
      console.log('adminService: Add employee response:', response.data);
      return response.data;
    } catch (error) {
      console.error('adminService: Add employee error:', error);
      throw error.response?.data || error.message;
    }
  },

  // Update employee
  updateEmployee: async (employeeId, employeeData) => {
    try {
      console.log('adminService: Updating employee:', employeeId, employeeData);
      const response = await api.put(`/auth/employees/${employeeId}`, employeeData);
      console.log('adminService: Update employee response:', response.data);
      return response.data;
    } catch (error) {
      console.error('adminService: Update employee error:', error);
      throw error.response?.data || error.message;
    }
  },

  // Delete employee
  deleteEmployee: async (employeeId) => {
    try {
      console.log('adminService: Deleting employee:', employeeId);
      const response = await api.delete(`/auth/employees/${employeeId}`);
      console.log('adminService: Delete employee response:', response.data);
      return response.data;
    } catch (error) {
      console.error('adminService: Delete employee error:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get all attendance records - FIXED to handle correct response structure
  getAllAttendance: async (page = 1, limit = 10, filters = {}) => {
    try {
      const params = { page, limit, ...filters };
      console.log('adminService: Fetching attendance with params:', params);

      let response;
      try {
        // Try the main attendance endpoint
        response = await api.get('/attendance/all', { params });
      } catch (error) {
        console.warn('adminService: /attendance/all failed, trying alternatives...');
        try {
          // Try alternative endpoint
          response = await api.get('/admin/attendance', { params });
        } catch (error2) {
          try {
            // Try getting individual employee records
            response = await api.get('/attendance/my-records', { params });
          } catch (error3) {
            console.warn('adminService: All attendance endpoints failed');
            return {
              data: [],
              attendance: [],
              totalPages: 0,
              currentPage: page,
              total: 0
            };
          }
        }
      }

      console.log('adminService: Raw attendance response:', response.data);

      // Handle the actual response structure: {data: Array, total: number, page: number, limit: number, totalPages: number}
      if (response.data.data && Array.isArray(response.data.data)) {
        return {
          data: response.data.data,
          attendance: response.data.data, // For backward compatibility
          totalPages: response.data.totalPages || 1,
          currentPage: response.data.page || page,
          total: response.data.total || response.data.data.length,
          limit: response.data.limit || limit
        };
      } else if (response.data.attendance && Array.isArray(response.data.attendance)) {
        return response.data;
      } else if (Array.isArray(response.data)) {
        return {
          data: response.data,
          attendance: response.data,
          totalPages: 1,
          currentPage: page,
          total: response.data.length
        };
      } else {
        return {
          data: [],
          attendance: [],
          totalPages: 0,
          currentPage: page,
          total: 0
        };
      }
    } catch (error) {
      console.error('adminService: Get attendance error:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get attendance by employee
  getEmployeeAttendance: async (employeeId, startDate, endDate) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      console.log('adminService: Fetching employee attendance:', employeeId, params);
      const response = await api.get(`/attendance/employee/${employeeId}`, { params });
      console.log('adminService: Employee attendance response:', response.data);
      return response.data;
    } catch (error) {
      console.error('adminService: Get employee attendance error:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get attendance statistics
  getAttendanceStats: async (startDate, endDate) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      console.log('adminService: Fetching attendance stats with params:', params);

      let response;
      try {
        response = await api.get('/attendance/stats', { params });
      } catch (error) {
        console.warn('adminService: /attendance/stats failed, trying alternatives...');
        try {
          response = await api.get('/admin/stats', { params });
        } catch (error2) {
          console.warn('adminService: No stats endpoint available');
          return {
            totalEmployees: 0,
            presentCount: 0,
            absentCount: 0,
            totalRecords: 0
          };
        }
      }

      console.log('adminService: Stats response:', response.data);
      return response.data;
    } catch (error) {
      console.error('adminService: Get stats error:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get profile change logs
  getProfileChangeLogs: async (employeeId = null) => {
    try {
      const endpoint = employeeId
        ? `${API_ENDPOINTS.PROFILE_LOGS.BY_EMPLOYEE}/${employeeId}`
        : API_ENDPOINTS.PROFILE_LOGS.ALL;

      console.log('adminService: Fetching profile logs from:', endpoint);
      const response = await api.get(endpoint);
      console.log('adminService: Profile logs response:', response.data);
      return response.data;
    } catch (error) {
      console.error('adminService: Get profile logs error:', error);
      throw error.response?.data || error.message;
    }
  },

  // Helper method to get employee details by ID
  getEmployeeById: async (employeeId) => {
    try {
      console.log('adminService: Fetching employee by ID:', employeeId);
      const response = await api.get(`/auth/employees/${employeeId}`);
      console.log('adminService: Employee by ID response:', response.data);
      return response.data;
    } catch (error) {
      console.warn('adminService: Get employee by ID failed:', error);
      return null;
    }
  }
};