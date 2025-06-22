import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { attendanceService } from "../services/attendanceService";
import toast from "react-hot-toast";

const AttendanceContext = createContext();

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error("useAttendance must be used within an AttendanceProvider");
  }
  return context;
};

export const AttendanceProvider = ({ children }) => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState({
    records: null,
    summary: null,
    stats: null,
  });

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check if we need to refresh data (5 minutes cache)
  const shouldRefresh = useCallback((lastFetchTime) => {
    if (!lastFetchTime) return true;
    return Date.now() - lastFetchTime > 5 * 60 * 1000; // 5 minutes
  }, []);

  // Fetch attendance records - MOVED UP BEFORE IT'S USED
  const fetchAttendanceRecords = useCallback(
    async (startDate = null, endDate = null, force = false) => {
      // Prevent unnecessary fetches
      if (!force && !shouldRefresh(lastFetch.records)) {
        console.log("📅 Using cached attendance records");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log("📅 Fetching attendance records...");
        const result = await attendanceService.getAttendanceRecords(
          startDate,
          endDate
        );

        if (result.success) {
          setAttendanceRecords(result.data || []);
          setLastFetch((prev) => ({ ...prev, records: Date.now() }));
          console.log(
            "📅 Attendance records loaded:",
            result.data?.length || 0
          );
        } else {
          setError(result.error || "Failed to fetch attendance records");
          console.error("📅 Failed to fetch attendance records:", result.error);
        }
      } catch (error) {
        console.error("📅 Attendance records fetch error:", error);
        setError("Failed to load attendance records");
      } finally {
        setIsLoading(false);
      }
    },
    [shouldRefresh, lastFetch.records]
  );

  // Fetch daily summary - MOVED UP BEFORE IT'S USED
  const fetchDailySummary = useCallback(
    async (date = null, force = false) => {
      // Prevent unnecessary fetches
      if (!force && !shouldRefresh(lastFetch.summary)) {
        console.log("📊 Using cached daily summary");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log("📊 Fetching daily summary...");
        const result = await attendanceService.getDailySummary(date);

        if (result.success) {
          setDailySummary(result.data);
          setLastFetch((prev) => ({ ...prev, summary: Date.now() }));
          console.log("📊 Daily summary loaded:", result.data);
        } else {
          setError(result.error || "Failed to fetch daily summary");
          console.error("📊 Failed to fetch daily summary:", result.error);
        }
      } catch (error) {
        console.error("📊 Daily summary fetch error:", error);
        setError("Failed to load daily summary");
      } finally {
        setIsLoading(false);
      }
    },
    [shouldRefresh, lastFetch.summary]
  );

  // Fetch monthly stats - MOVED UP BEFORE IT'S USED
  const fetchMonthlyStats = useCallback(
    async (year = null, month = null, force = false) => {
      // Prevent unnecessary fetches
      if (!force && !shouldRefresh(lastFetch.stats)) {
        console.log("📈 Using cached monthly stats");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log("📈 Fetching monthly stats...");
        const result = await attendanceService.getMonthlyStats(year, month);

        if (result.success) {
          setMonthlyStats(result.data);
          setLastFetch((prev) => ({ ...prev, stats: Date.now() }));
          console.log("📈 Monthly stats loaded:", result.data);
        } else {
          setError(result.error || "Failed to fetch monthly stats");
          console.error("📈 Failed to fetch monthly stats:", result.error);
        }
      } catch (error) {
        console.error("📈 Monthly stats fetch error:", error);
        setError("Failed to load monthly statistics");
      } finally {
        setIsLoading(false);
      }
    },
    [shouldRefresh, lastFetch.stats]
  );

  // Check in - NOW CAN SAFELY USE THE FUNCTIONS ABOVE
  const checkIn = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await attendanceService.checkIn();

      if (result.success) {
        toast.success("Checked in successfully!");

        // Refresh data after successful check-in
        setTimeout(() => {
          fetchAttendanceRecords(null, null, true);
          fetchDailySummary(null, true);
        }, 1000);

        return { success: true, data: result.data };
      } else {
        setError(result.error);
        toast.error(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Check-in error:", error);
      const errorMessage = "Check-in failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [fetchAttendanceRecords, fetchDailySummary]);

  // Check out - NOW CAN SAFELY USE THE FUNCTIONS ABOVE
  const checkOut = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await attendanceService.checkOut();

      if (result.success) {
        toast.success("Checked out successfully!");

        // Refresh data after successful check-out
        setTimeout(() => {
          fetchAttendanceRecords(null, null, true);
          fetchDailySummary(null, true);
          fetchMonthlyStats(null, null, true);
        }, 1000);

        return { success: true, data: result.data };
      } else {
        setError(result.error);
        toast.error(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Check-out error:", error);
      const errorMessage = "Check-out failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [fetchAttendanceRecords, fetchDailySummary, fetchMonthlyStats]);

  // Calculate today's status from attendance records
  const todayStatus = useMemo(() => {
    const today = new Date().toDateString();
    const todayRecords = attendanceRecords.filter(
      (record) => new Date(record.timestamp).toDateString() === today
    );

    const checkInRecord = todayRecords.find(
      (record) => record.status === "check-in"
    );
    const checkOutRecord = todayRecords.find(
      (record) => record.status === "check-out"
    );

    return {
      hasCheckedIn: !!checkInRecord,
      hasCheckedOut: !!checkOutRecord,
      checkInTime: checkInRecord?.timestamp || null,
      checkOutTime: checkOutRecord?.timestamp || null,
      isWorkComplete: !!checkInRecord && !!checkOutRecord,
      records: todayRecords,
    };
  }, [attendanceRecords]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      // Data
      attendanceRecords,
      dailySummary,
      monthlyStats,
      todayStatus,

      // Loading states
      isLoading,
      error,

      // Actions
      fetchAttendanceRecords,
      fetchDailySummary,
      fetchMonthlyStats,
      checkIn,
      checkOut,
      clearError,
    }),
    [
      attendanceRecords,
      dailySummary,
      monthlyStats,
      todayStatus,
      isLoading,
      error,
      fetchAttendanceRecords,
      fetchDailySummary,
      fetchMonthlyStats,
      checkIn,
      checkOut,
      clearError,
    ]
  );

  return (
    <AttendanceContext.Provider value={contextValue}>
      {children}
    </AttendanceContext.Provider>
  );
};
