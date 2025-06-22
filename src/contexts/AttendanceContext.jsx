import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { attendanceService } from "../services/attendanceService";
import {
  calculateDailySummaryFromRecords,
  getAttendanceStatusForDate,
} from "../utils/attendanceUtils";
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
  const [warnings, setWarnings] = useState([]);
  const [lastFetch, setLastFetch] = useState({
    records: null,
    summary: null,
    stats: null,
  });

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear warnings function
  const clearWarnings = useCallback(() => {
    setWarnings([]);
  }, []);

  // Add warning function
  const addWarning = useCallback((warning) => {
    setWarnings((prev) => {
      // Avoid duplicate warnings
      if (prev.includes(warning)) {
        return prev;
      }
      return [...prev, warning];
    });
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

          // Handle warnings
          if (result.warning) {
            addWarning(result.warning);
            toast.error(result.warning, { duration: 3000 });
          }

          console.log(
            "📅 Attendance records fetched successfully:",
            result.data?.length || 0
          );
        } else {
          setError(result.error);
          toast.error(result.error);
        }
      } catch (error) {
        console.error("📅 Failed to fetch attendance records:", error);
        const errorMessage = "Failed to fetch attendance records.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [shouldRefresh, lastFetch.records, addWarning]
  );

  // Fetch daily summary - IMPROVED warning handling
  const fetchDailySummary = useCallback(
    async (date = null, force = false) => {
      if (!force && !shouldRefresh(lastFetch.summary)) {
        console.log("📊 Using cached daily summary");
        return;
      }

      try {
        setIsLoading(true);

        console.log("📊 Fetching daily summary...");
        const result = await attendanceService.getDailySummary(date);

        if (result.success) {
          if (result.data) {
            setDailySummary(result.data);
          } else {
            console.log("📊 No API data, calculating from records...");
            const calculatedSummary = calculateDailySummaryFromRecords(
              attendanceRecords,
              date
            );
            setDailySummary(calculatedSummary);
          }

          setLastFetch((prev) => ({ ...prev, summary: Date.now() }));

          // Handle warnings - but don't show toast for server maintenance warnings
          if (result.warning) {
            console.warn("📊 Daily summary warning:", result.warning);
            // Only add to warnings array, don't show toast for maintenance issues
            if (
              !result.warning.includes("server maintenance") &&
              !result.warning.includes("temporarily unavailable")
            ) {
              addWarning(result.warning);
            }
          }

          console.log("📊 Daily summary processed successfully");
        } else {
          setError(result.error);
          toast.error(result.error);
        }
      } catch (error) {
        console.error("📊 Failed to fetch daily summary:", error);

        // Try to calculate from existing records as final fallback
        try {
          const calculatedSummary = calculateDailySummaryFromRecords(
            attendanceRecords,
            date
          );
          if (calculatedSummary) {
            setDailySummary(calculatedSummary);
            console.log("📊 Using calculated summary as fallback");
          } else {
            const errorMessage = "Failed to fetch daily summary.";
            setError(errorMessage);
            toast.error(errorMessage);
          }
        } catch (calcError) {
          const errorMessage = "Failed to fetch daily summary.";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [shouldRefresh, lastFetch.summary, addWarning, attendanceRecords]
  );

  // Fetch monthly stats - MOVED UP BEFORE IT'S USED
  const fetchMonthlyStats = useCallback(
    async (year = null, month = null, force = false) => {
      // Prevent unnecessary fetches
      if (!force && !shouldRefresh(lastFetch.stats)) {
        console.log("📊 Using cached monthly stats");
        return;
      }

      try {
        setIsLoading(true);

        console.log("📊 Fetching monthly stats...");
        const result = await attendanceService.getMonthlyStats(year, month);

        if (result.success) {
          setMonthlyStats(result.data);
          setLastFetch((prev) => ({ ...prev, stats: Date.now() }));

          // Handle warnings - don't show toast for server issues
          if (result.warning) {
            console.warn("📊 Monthly stats warning:", result.warning);
            // Only add to warnings, don't show intrusive toasts
          }

          console.log("📊 Monthly stats fetched successfully:", result.data);
        } else {
          setError(result.error);
          toast.error(result.error);
        }
      } catch (error) {
        console.error("📊 Failed to fetch monthly stats:", error);
        const errorMessage = "Failed to fetch monthly statistics.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [shouldRefresh, lastFetch.stats]
  );

  // Check in - IMPROVED with auto-refresh on mismatch
  const checkIn = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🟢 Attempting check-in...");
      const result = await attendanceService.checkIn();

      if (result.success) {
        toast.success("Checked in successfully!");

        // Refresh data after successful check-in
        await Promise.all([
          fetchAttendanceRecords(null, null, true),
          fetchDailySummary(null, true),
          fetchMonthlyStats(null, null, true),
        ]);

        return { success: true, data: result.data };
      } else {
        // Check if we need to refresh due to state mismatch
        if (result.needsRefresh) {
          console.log("🔄 State mismatch detected, refreshing data...");

          // Show a brief message
          toast.loading("Refreshing your status...", { duration: 1500 });

          // Refresh data to get current state
          await Promise.all([
            fetchAttendanceRecords(null, null, true),
            fetchDailySummary(null, true),
          ]);

          // Don't show the error as a persistent error, just log it
          console.log("🔄 Status refreshed due to:", result.error);

          return { success: false, error: result.error, refreshed: true };
        } else {
          // Show actual errors
          setError(result.error);
          toast.error(result.error);
          return { success: false, error: result.error };
        }
      }
    } catch (error) {
      console.error("🟢 Check-in failed:", error);
      const errorMessage = "Check-in failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [fetchAttendanceRecords, fetchDailySummary, fetchMonthlyStats]);

  // Check out - IMPROVED with auto-refresh on mismatch
  const checkOut = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔴 Attempting check-out...");
      const result = await attendanceService.checkOut();

      if (result.success) {
        toast.success("Checked out successfully!");

        // Refresh data after successful check-out
        await Promise.all([
          fetchAttendanceRecords(null, null, true),
          fetchDailySummary(null, true),
          fetchMonthlyStats(null, null, true),
        ]);

        return { success: true, data: result.data };
      } else {
        // Check if we need to refresh due to state mismatch
        if (result.needsRefresh) {
          console.log("🔄 State mismatch detected, refreshing data...");

          // Show a brief message
          toast.loading("Refreshing your status...", { duration: 1500 });

          // Refresh data to get current state
          await Promise.all([
            fetchAttendanceRecords(null, null, true),
            fetchDailySummary(null, true),
          ]);

          // Don't show the error as a persistent error, just log it
          console.log("🔄 Status refreshed due to:", result.error);

          return { success: false, error: result.error, refreshed: true };
        } else {
          // Show actual errors
          setError(result.error);
          toast.error(result.error);
          return { success: false, error: result.error };
        }
      }
    } catch (error) {
      console.error("🔴 Check-out failed:", error);
      const errorMessage = "Check-out failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [fetchAttendanceRecords, fetchDailySummary, fetchMonthlyStats]);

  // Get current attendance status - IMPROVED with fallback
  const getCurrentStatus = useCallback(() => {
    // Try to use daily summary first
    if (dailySummary) {
      switch (dailySummary.status) {
        case "completed":
          return {
            status: "checked-out",
            canCheckIn: false,
            canCheckOut: false,
          };
        case "in-progress":
          return { status: "checked-in", canCheckIn: false, canCheckOut: true };
        default:
          return {
            status: "not-started",
            canCheckIn: true,
            canCheckOut: false,
          };
      }
    }

    // Fallback to calculating from attendance records
    return getAttendanceStatusForDate(attendanceRecords);
  }, [dailySummary, attendanceRecords]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      // State
      attendanceRecords,
      dailySummary,
      monthlyStats,
      isLoading,
      error,
      warnings,

      // Actions
      fetchAttendanceRecords,
      fetchDailySummary,
      fetchMonthlyStats,
      checkIn,
      checkOut,
      clearError,
      clearWarnings,
      getCurrentStatus,

      // Utilities
      lastFetch,
    }),
    [
      attendanceRecords,
      dailySummary,
      monthlyStats,
      isLoading,
      error,
      warnings,
      fetchAttendanceRecords,
      fetchDailySummary,
      fetchMonthlyStats,
      checkIn,
      checkOut,
      clearError,
      clearWarnings,
      getCurrentStatus,
      lastFetch,
    ]
  );

  return (
    <AttendanceContext.Provider value={contextValue}>
      {children}
    </AttendanceContext.Provider>
  );
};
