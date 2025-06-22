import { useState, useCallback } from 'react';
import { adminService } from '@/services/adminService';
import { useApi, useMutation, useApiEffect } from './useApi';
import toast from 'react-hot-toast';

// Hook for managing employees
export const useEmployees = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');

  const { data, loading, error, execute } = useApi(
    adminService.getAllEmployees,
    [page, limit, search]
  );

  const addEmployeeMutation = useMutation(adminService.addEmployee);
  const updateEmployeeMutation = useMutation(adminService.updateEmployee);
  const deleteEmployeeMutation = useMutation(adminService.deleteEmployee);

  const getEmployees = useCallback(() => {
    return execute(page, limit, search);
  }, [execute, page, limit, search]);

  const addEmployee = useCallback(async (employeeData) => {
    try {
      const result = await addEmployeeMutation.mutate(employeeData);
      toast.success('Employee added successfully!');
      getEmployees(); // Refresh list
      return result;
    } catch (error) {
      toast.error(error.message || 'Failed to add employee');
      throw error;
    }
  }, [addEmployeeMutation, getEmployees]);

  const updateEmployee = useCallback(async (employeeId, employeeData) => {
    try {
      const result = await updateEmployeeMutation.mutate(employeeId, employeeData);
      toast.success('Employee updated successfully!');
      getEmployees(); // Refresh list
      return result;
    } catch (error) {
      toast.error(error.message || 'Failed to update employee');
      throw error;
    }
  }, [updateEmployeeMutation, getEmployees]);

  const deleteEmployee = useCallback(async (employeeId) => {
    try {
      const result = await deleteEmployeeMutation.mutate(employeeId);
      toast.success('Employee deleted successfully!');
      getEmployees(); // Refresh list
      return result;
    } catch (error) {
      toast.error(error.message || 'Failed to delete employee');
      throw error;
    }
  }, [deleteEmployeeMutation, getEmployees]);

  const nextPage = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage(prev => Math.max(1, prev - 1));
  }, []);

  const searchEmployees = useCallback((searchTerm) => {
    setSearch(searchTerm);
    setPage(1); // Reset to first page when searching
  }, []);

  return {
    employees: data?.employees || [],
    totalPages: data?.totalPages || 0,
    currentPage: page,
    loading,
    error,
    getEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    nextPage,
    prevPage,
    searchEmployees,
    canGoNext: page < (data?.totalPages || 0),
    canGoPrev: page > 1,
    isAdding: addEmployeeMutation.loading,
    isUpdating: updateEmployeeMutation.loading,
    isDeleting: deleteEmployeeMutation.loading
  };
};

// Hook for admin attendance management
export const useAdminAttendance = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState({});

  const { data, loading, error, execute } = useApi(
    adminService.getAllAttendance,
    [page, limit, filters]
  );

  const { data: stats, loading: statsLoading, execute: getStats } = useApi(
    adminService.getAttendanceStats
  );

  const getAllAttendance = useCallback(() => {
    return execute(page, limit, filters);
  }, [execute, page, limit, filters]);

  const getAttendanceStats = useCallback((startDate, endDate) => {
    return getStats(startDate, endDate);
  }, [getStats]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filtering
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  const nextPage = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage(prev => Math.max(1, prev - 1));
  }, []);

  return {
    attendance: data?.attendance || [],
    totalPages: data?.totalPages || 0,
    currentPage: page,
    loading,
    error,
    stats,
    statsLoading,
    getAllAttendance,
    getAttendanceStats,
    updateFilters,
    clearFilters,
    nextPage,
    prevPage,
    canGoNext: page < (data?.totalPages || 0),
    canGoPrev: page > 1
  };
};

// Hook for getting specific employee attendance
export const useEmployeeAttendance = (employeeId) => {
  const { data, loading, error, execute } = useApi(
    adminService.getEmployeeAttendance,
    [employeeId]
  );

  const getEmployeeAttendance = useCallback((startDate, endDate) => {
    return execute(employeeId, startDate, endDate);
  }, [execute, employeeId]);

  return {
    attendance: data,
    loading,
    error,
    getEmployeeAttendance
  };
};