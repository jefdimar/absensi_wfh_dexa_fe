// Re-export the main useAttendance hook from AttendanceContext
export { useAttendance } from '../contexts/AttendanceContext';

// Additional attendance-related hooks
export const useAttendanceActions = () => {
  const { checkIn, checkOut, fetchAttendanceRecords, fetchMonthlyStats, refreshAllData } = useAttendance();

  return {
    checkIn,
    checkOut,
    fetchAttendanceRecords,
    fetchMonthlyStats,
    refreshAllData
  };
};

export const useAttendanceStatus = () => {
  const { todayStatus, canCheckIn, canCheckOut, isWorkComplete } = useAttendance();

  return {
    todayStatus,
    canCheckIn,
    canCheckOut,
    isWorkComplete
  };
};

export const useMonthlyStats = () => {
  const {
    monthlyStats,
    monthlyStatsHistory,
    fetchMonthlyStats,
    getCachedMonthlyStats,
    clearMonthlyStatsCache
  } = useAttendance();

  return {
    monthlyStats,
    monthlyStatsHistory,
    fetchMonthlyStats,
    getCachedMonthlyStats,
    clearMonthlyStatsCache
  };
};

export const useAttendanceRecords = () => {
  const { attendanceRecords, fetchAttendanceRecords, isLoading, error } = useAttendance();

  return {
    attendanceRecords,
    fetchAttendanceRecords,
    isLoading,
    error
  };
};