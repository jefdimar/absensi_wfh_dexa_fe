import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
// import { adminServiceTest } from '../services/adminService.test'; // Uncomment for testing
import { getCurrentDate } from '../utils/formatters';
import toast from 'react-hot-toast';

export const useAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    todayPresent: 0,
    todayAbsent: 0,
    recentAttendance: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log("AdminDashboard: Fetching dashboard data for date:", selectedDate);

      // Use test service temporarily
      // const summary = await adminServiceTest.getDashboardSummary(selectedDate);
      const summary = await adminService.getDashboardSummary(selectedDate);
      console.log("AdminDashboard: Dashboard summary received:", summary);

      setStats({
        totalEmployees: summary.totalEmployees || 0,
        todayPresent: summary.presentCount || 0,
        todayAbsent: summary.absentCount || 0,
        recentAttendance: summary.recentAttendance || [],
      });

      console.log("AdminDashboard: Stats updated:", {
        totalEmployees: summary.totalEmployees || 0,
        todayPresent: summary.presentCount || 0,
        todayAbsent: summary.absentCount || 0,
        recentAttendanceCount: (summary.recentAttendance || []).length,
      });

    } catch (error) {
      console.error("AdminDashboard: Error fetching dashboard data:", error);
      console.error("AdminDashboard: Error details:", {
        message: error.message,
        stack: error.stack,
        response: error.response
      });

      toast.error(`Failed to load dashboard data: ${error.message || 'Unknown error'}`);

      setStats({
        totalEmployees: 0,
        todayPresent: 0,
        todayAbsent: 0,
        recentAttendance: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchDashboardData();
    toast.success("Dashboard data refreshed!");
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  // Fetch data when selectedDate changes
  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate]);

  // Auto-refresh for today's data
  useEffect(() => {
    const interval = setInterval(() => {
      const today = getCurrentDate();
      if (selectedDate === today && !loading) {
        console.log("AdminDashboard: Auto-refreshing data...");
        fetchDashboardData();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [selectedDate, loading]);

  return {
    stats,
    loading,
    selectedDate,
    fetchDashboardData,
    handleRefresh,
    handleDateChange
  };
};