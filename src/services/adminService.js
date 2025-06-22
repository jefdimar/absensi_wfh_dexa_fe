import api from './api';
import { API_ENDPOINTS } from '@/constants';

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

  // Add new employee
  addEmployee: async (employeeData) => {
    try {
      const response = await api.post(API_ENDPOINTS.ADMIN.EMPLOYEES, employeeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update employee
  updateEmployee: async (employeeId, employeeData) => {
    try {
      const response = await api.put(`${API_ENDPOINTS.ADMIN.EMPLOYEES}/${employeeId}`, employeeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete employee
  deleteEmployee: async (employeeId) => {
    try {
      const response = await api.delete(`${API_ENDPOINTS.ADMIN.EMPLOYEES}/${employeeId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all attendance records
  getAllAttendance: async (page = 1, limit = 10, filters = {}) => {
    try {
      const params = { page, limit, ...filters };
      const response = await api.get(API_ENDPOINTS.ADMIN.ATTENDANCE_ALL, { params });
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

      const response = await api.get(`${API_ENDPOINTS.ADMIN.ATTENDANCE_ALL}/${employeeId}`, { params });
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

      const response = await api.get(`${API_ENDPOINTS.ADMIN.ATTENDANCE_ALL}/stats`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};