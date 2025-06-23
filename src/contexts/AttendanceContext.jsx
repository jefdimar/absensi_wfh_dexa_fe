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

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDateString = useCallback(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }, []);

  // Helper function to format date properly
  const formatDateForAPI = useCallback(
    (date) => {
      if (!date) {
        return getTodayDateString();
      }

      if (typeof date === "string") {
        // If it's already a string, validate it's in YYYY-MM-DD format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(date)) {
          return date;
        }
        // Try to parse the string as a date
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          console.warn(
            "Invalid date string provided:",
            date,
            "using today instead"
          );
          return getTodayDateString();
        }
        return parsedDate.toISOString().split("T")[0];
      }

      if (date instanceof Date) {
        if (isNaN(date.getTime())) {
          console.warn(
            "Invalid Date object provided:",
            date,
            "using today instead"
          );
          return getTodayDateString();
        }
        return date.toISOString().split("T")[0];
      }

      console.warn(
        "Invalid date parameter provided:",
        date,
        "using today instead"
      );
      return getTodayDateString();
    },
    [getTodayDateString]
  );

  // Fetch attendance records
  const fetchAttendanceRecords = useCallback(
    async (startDate = null, endDate = null, force = false) => {
      if (!force && !shouldRefresh(lastFetch.records)) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const result = await attendanceService.getAttendanceRecords(
          startDate,
          endDate
        );

        if (result.success) {
          setAttendanceRecords(result.data || []);
          setLastFetch((prev) => ({ ...prev, records: Date.now() }));
        } else {
          setError(result.error);
          if (
            result.error &&
            !result.error.includes("temporarily unavailable")
          ) {
            toast.error(result.error);
          }
        }
      } catch (error) {
        const errorMessage = "Failed to fetch attendance records.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [shouldRefresh, lastFetch.records]
  );

  // Fetch daily summary with proper date handling
  const fetchDailySummary = useCallback(
    async (date = null, force = false) => {
      if (!force && !shouldRefresh(lastFetch.summary)) {
        return;
      }

      try {
        setIsLoading(true);

        // TEMPORARY: Skip API call and use calculated summary instead
        // This avoids the server timestamp parsing error
        console.log(
          "📊 Using calculated daily summary instead of API due to server issue"
        );

        const targetDate = date ? formatDateForAPI(date) : getTodayDateString();
        const calculatedSummary = calculateDailySummaryFromRecords(
          attendanceRecords,
          targetDate
        );

        if (calculatedSummary) {
          setDailySummary(calculatedSummary);
          setLastFetch((prev) => ({ ...prev, summary: Date.now() }));
          console.log("📊 Using calculated daily summary:", calculatedSummary);
          return;
        }

        // If no calculated summary available, try the API with explicit date
        const formattedDate = date
          ? formatDateForAPI(date)
          : getTodayDateString();

        console.log("📊 Fetching daily summary for date:", formattedDate);

        const result = await attendanceService.getDailySummary(formattedDate);

        if (result.success) {
          if (result.data) {
            setDailySummary(result.data);
          } else {
            // Try to calculate from records if API returns no data
            const calculatedSummary = calculateDailySummaryFromRecords(
              attendanceRecords,
              formattedDate
            );
            setDailySummary(calculatedSummary);
          }

          setLastFetch((prev) => ({ ...prev, summary: Date.now() }));
        } else {
          // For daily summary errors, try to calculate from records as fallback
          const calculatedSummary = calculateDailySummaryFromRecords(
            attendanceRecords,
            formattedDate
          );

          if (calculatedSummary) {
            setDailySummary(calculatedSummary);
            // Don't show error if we have a fallback
          } else {
            setError(result.error);
            if (
              result.error &&
              !result.error.includes("temporarily unavailable")
            ) {
              toast.error(result.error);
            }
          }
        }
      } catch (error) {
        console.error("📊 Daily summary fetch error:", error);

        // Try to calculate from existing records as final fallback
        try {
          const formattedDate = date
            ? formatDateForAPI(date)
            : getTodayDateString();
          const calculatedSummary = calculateDailySummaryFromRecords(
            attendanceRecords,
            formattedDate
          );
          if (calculatedSummary) {
            setDailySummary(calculatedSummary);
          } else {
            const errorMessage = "Unable to load daily summary.";
            setError(errorMessage);
            toast.error(errorMessage);
          }
        } catch (calcError) {
          const errorMessage = "Unable to load daily summary.";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      shouldRefresh,
      lastFetch.summary,
      attendanceRecords,
      formatDateForAPI,
      getTodayDateString,
    ]
  );

  // Fetch monthly stats
  const fetchMonthlyStats = useCallback(
    async (year = null, month = null, force = false) => {
      if (!force && !shouldRefresh(lastFetch.stats)) {
        return;
      }

      try {
        setIsLoading(true);

        // Ensure year and month are valid numbers if provided
        const currentDate = new Date();
        const validYear =
          year && !isNaN(year) ? parseInt(year) : currentDate.getFullYear();
        const validMonth =
          month && !isNaN(month) ? parseInt(month) : currentDate.getMonth() + 1;

        console.log("📊 Fetching monthly stats for:", validYear, validMonth);

        const result = await attendanceService.getMonthlyStats(
          validYear,
          validMonth
        );

        if (result.success) {
          setMonthlyStats(result.data);
          setLastFetch((prev) => ({ ...prev, stats: Date.now() }));
        } else {
          // For monthly stats, don't show errors to user - just use defaults
          setMonthlyStats({
            totalDays: 0,
            totalHours: "0:00",
            averageHours: "0:00",
            attendanceRate: "0%",
            presentDays: 0,
            absentDays: 0,
            incompleteDays: 0,
            totalDaysInMonth: 0,
            workingDaysInMonth: 0,
          });
        }
      } catch (error) {
        console.error("📊 Monthly stats fetch error:", error);

        // Set default stats on error
        setMonthlyStats({
          totalDays: 0,
          totalHours: "0:00",
          averageHours: "0:00",
          attendanceRate: "0%",
          presentDays: 0,
          absentDays: 0,
          incompleteDays: 0,
          totalDaysInMonth: 0,
          workingDaysInMonth: 0,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [shouldRefresh, lastFetch.stats]
  );

  // Check in
  const checkIn = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await attendanceService.checkIn();

      if (result.success) {
        toast.success("Checked in successfully!");

        // Refresh data after successful check-in
        await Promise.all([
          fetchAttendanceRecords(null, null, true),
          fetchDailySummary(null, true), // Pass null to use today's date
        ]);

        // Try to refresh monthly stats but don't wait for it
        fetchMonthlyStats(null, null, true).catch(() => {});

        return { success: true, data: result.data };
      } else {
        if (result.needsRefresh) {
          toast.loading("Refreshing your status...", { duration: 1500 });

          await Promise.all([
            fetchAttendanceRecords(null, null, true),
            fetchDailySummary(null, true),
          ]);

          return { success: false, error: result.error, refreshed: true };
        } else {
          setError(result.error);
          toast.error(result.error);
          return { success: false, error: result.error };
        }
      }
    } catch (error) {
      const errorMessage = "Check-in failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [fetchAttendanceRecords, fetchDailySummary, fetchMonthlyStats]);

  // Check out
  const checkOut = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await attendanceService.checkOut();

      if (result.success) {
        toast.success("Checked out successfully!");

        // Refresh data after successful check-out
        await Promise.all([
          fetchAttendanceRecords(null, null, true),
          fetchDailySummary(null, true), // Pass null to use today's date
        ]);

        // Try to refresh monthly stats but don't wait for it
        fetchMonthlyStats(null, null, true).catch(() => {});

        return { success: true, data: result.data };
      } else {
        if (result.needsRefresh) {
          toast.loading("Refreshing your status...", { duration: 1500 });

          await Promise.all([
            fetchAttendanceRecords(null, null, true),
            fetchDailySummary(null, true),
          ]);

          return { success: false, error: result.error, refreshed: true };
        } else {
          setError(result.error);
          toast.error(result.error);
          return { success: false, error: result.error };
        }
      }
    } catch (error) {
      const errorMessage = "Check-out failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [fetchAttendanceRecords, fetchDailySummary, fetchMonthlyStats]);

  // Get current attendance status
  const getCurrentStatus = useCallback(() => {
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

    return getAttendanceStatusForDate(attendanceRecords);
  }, [dailySummary, attendanceRecords]);

  // Memoize the context value
  const contextValue = useMemo(
    () => ({
      // State
      attendanceRecords,
      dailySummary,
      monthlyStats,
      isLoading,
      error,

      // Actions
      fetchAttendanceRecords,
      fetchDailySummary,
      fetchMonthlyStats,
      checkIn,
      checkOut,
      clearError,
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
      fetchAttendanceRecords,
      fetchDailySummary,
      fetchMonthlyStats,
      checkIn,
      checkOut,
      clearError,
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
