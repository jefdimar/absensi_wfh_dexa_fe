import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAttendance } from "../../contexts/AttendanceContext";

const RecentAttendance = () => {
  const {
    attendanceRecords,
    fetchAttendanceRecords,
    isLoading,
    error,
    clearError,
  } = useAttendance();

  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize data only once
  useEffect(() => {
    if (!hasInitialized && !isLoading) {
      fetchAttendanceRecords();
      setHasInitialized(true);
    }
  }, [hasInitialized, isLoading, fetchAttendanceRecords]);

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    clearError();
    fetchAttendanceRecords(null, null, true);
  }, [clearError, fetchAttendanceRecords]);

  // Process records (memoized to prevent recalculation)
  const filteredRecords = useMemo(() => {
    if (!attendanceRecords || !Array.isArray(attendanceRecords)) {
      return [];
    }

    // Filter to last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentRecords = attendanceRecords.filter((record) => {
      const recordDate = new Date(record.timestamp);
      return recordDate >= sevenDaysAgo;
    });

    // Group records by date
    const groupedByDate = {};

    recentRecords.forEach((record) => {
      const dateKey = new Date(record.timestamp).toDateString();

      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {
          date: dateKey,
          checkIn: null,
          checkOut: null,
          records: [],
        };
      }

      groupedByDate[dateKey].records.push(record);

      if (record.status === "check-in") {
        groupedByDate[dateKey].checkIn = record;
      } else if (record.status === "check-out") {
        groupedByDate[dateKey].checkOut = record;
      }
    });

    // Convert to array and sort by date (newest first)
    return Object.values(groupedByDate).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [attendanceRecords]);

  // Memoize formatting functions
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Unknown";

    try {
      const date = new Date(dateString);
      return {
        full: date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        mobile: date.toLocaleDateString("en-US", {
          month: "numeric",
          day: "numeric",
        }),
      };
    } catch (error) {
      console.error("Date formatting error:", error);
      return { full: "Invalid Date", mobile: "N/A" };
    }
  }, []);

  const formatTime = useCallback((timestamp) => {
    if (!timestamp) return "--:--";

    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Time formatting error:", error);
      return "--:--";
    }
  }, []);

  const calculateWorkingHours = useCallback((checkInRecord, checkOutRecord) => {
    if (!checkInRecord || !checkOutRecord) return "--:--";

    try {
      const checkIn = new Date(checkInRecord.timestamp);
      const checkOut = new Date(checkOutRecord.timestamp);
      const diffMs = checkOut - checkIn;

      if (diffMs <= 0) return "--:--";

      const diffHours = diffMs / (1000 * 60 * 60);
      const hours = Math.floor(diffHours);
      const minutes = Math.round((diffHours - hours) * 60);

      return `${hours}:${minutes.toString().padStart(2, "0")}`;
    } catch (error) {
      console.error("Working hours calculation error:", error);
      return "--:--";
    }
  }, []);

  const getStatusBadge = useCallback((dayRecord) => {
    if (dayRecord.checkOut && dayRecord.checkIn) {
      return (
        <span className="badge bg-success">
          <i className="bi bi-check-circle me-1"></i>
          <span className="d-none d-sm-inline">Completed</span>
          <span className="d-sm-none">Done</span>
        </span>
      );
    } else if (dayRecord.checkIn && !dayRecord.checkOut) {
      return (
        <span className="badge bg-warning">
          <i className="bi bi-clock me-1"></i>
          <span className="d-none d-sm-inline">In Progress</span>
          <span className="d-sm-none">Active</span>
        </span>
      );
    } else if (dayRecord.checkOut && !dayRecord.checkIn) {
      return (
        <span className="badge bg-danger">
          <i className="bi bi-exclamation-triangle me-1"></i>
          <span className="d-none d-sm-inline">Missing Check-in</span>
          <span className="d-sm-none">Missing</span>
        </span>
      );
    } else {
      return (
        <span className="badge bg-secondary">
          <i className="bi bi-dash-circle me-1"></i>
          <span className="d-none d-sm-inline">No Record</span>
          <span className="d-sm-none">None</span>
        </span>
      );
    }
  }, []);

  // Summary stats
  const summaryStats = useMemo(() => {
    return {
      completed: filteredRecords.filter((day) => day.checkIn && day.checkOut)
        .length,
      inProgress: filteredRecords.filter((day) => day.checkIn && !day.checkOut)
        .length,
      missing: filteredRecords.filter((day) => day.checkOut && !day.checkIn)
        .length,
      total: filteredRecords.length,
    };
  }, [filteredRecords]);

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-info text-white uniform-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title mb-0">
              <i className="bi bi-clock-history me-2"></i>
              <span className="d-none d-sm-inline">Recent Attendance</span>
              <span className="d-sm-none">Recent</span>
            </h5>
            <small className="opacity-75 d-block mt-1">Last 7 days</small>
          </div>
          <button
            className="btn btn-outline-light btn-sm"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh recent attendance"
          >
            <i
              className={`bi bi-arrow-clockwise ${isLoading ? "spin" : ""}`}
            ></i>
            <span className="d-none d-lg-inline ms-1">Refresh</span>
          </button>
        </div>
      </div>

      <div className="card-body">
        {/* Error Alert */}
        {error && (
          <div
            className="alert alert-warning alert-dismissible fade show mb-3"
            role="alert"
          >
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <div className="small">{error}</div>
            <button
              type="button"
              className="btn-close"
              onClick={clearError}
              aria-label="Close"
            ></button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-4">
            <div
              className="spinner-border spinner-border-sm text-info"
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted small">
              Loading recent attendance...
            </p>
          </div>
        ) : filteredRecords.length === 0 ? (
          /* No Data State */
          <div className="text-center py-4 py-md-5">
            <i
              className="bi bi-calendar-x text-muted d-none d-md-block"
              style={{ fontSize: "3rem" }}
            ></i>
            <i
              className="bi bi-calendar-x text-muted d-md-none"
              style={{ fontSize: "2rem" }}
            ></i>
            <h6 className="text-muted mt-3">
              <span className="d-none d-sm-inline">
                No recent attendance records
              </span>
              <span className="d-sm-none">No recent records</span>
            </h6>
            <p className="text-muted small mb-3">
              <span className="d-none d-sm-inline">
                No attendance records found for the last 7 days.
              </span>
              <span className="d-sm-none">
                No records found for last 7 days.
              </span>
            </p>
            <button
              type="button"
              className="btn btn-outline-info btn-sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Refresh
            </button>
          </div>
        ) : (
          /* Data Table */
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <small className="text-muted">
                <span className="d-none d-sm-inline">
                  Showing {Math.min(filteredRecords.length, 5)} of{" "}
                  {filteredRecords.length} recent days
                </span>
                <span className="d-sm-none">
                  {Math.min(filteredRecords.length, 5)}/{filteredRecords.length}{" "}
                  days
                </span>
              </small>
              <small className="text-muted">
                <span className="d-none d-md-inline">
                  Last 7 days • {attendanceRecords?.length || 0} total records
                </span>
                <span className="d-md-none">
                  {attendanceRecords?.length || 0} records
                </span>
              </small>
            </div>

            {/* Desktop Table */}
            <div className="table-responsive d-none d-md-block">
              <table className="table table-sm table-hover recent-attendance">
                <thead className="table-light">
                  <tr>
                    <th scope="col">
                      <i className="bi bi-calendar3 me-1"></i>
                      Date
                    </th>
                    <th scope="col">
                      <i className="bi bi-box-arrow-in-right me-1"></i>
                      Check In
                    </th>
                    <th scope="col">
                      <i className="bi bi-box-arrow-right me-1"></i>
                      Check Out
                    </th>
                    <th scope="col">
                      <i className="bi bi-clock me-1"></i>
                      Hours
                    </th>
                    <th scope="col">
                      <i className="bi bi-info-circle me-1"></i>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.slice(0, 5).map((dayRecord, index) => {
                    const workingHours = calculateWorkingHours(
                      dayRecord.checkIn,
                      dayRecord.checkOut
                    );
                    const dateFormatted = formatDate(dayRecord.date);

                    return (
                      <tr key={`day-${dayRecord.date}-${index}`}>
                        <td className="fw-semibold">{dateFormatted.full}</td>
                        <td>
                          <span
                            className={
                              dayRecord.checkIn
                                ? "text-success fw-semibold"
                                : "text-muted"
                            }
                          >
                            {dayRecord.checkIn
                              ? formatTime(dayRecord.checkIn.timestamp)
                              : "--:--"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={
                              dayRecord.checkOut
                                ? "text-danger fw-semibold"
                                : "text-muted"
                            }
                          >
                            {dayRecord.checkOut
                              ? formatTime(dayRecord.checkOut.timestamp)
                              : "--:--"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={
                              workingHours !== "--:--"
                                ? "fw-semibold text-primary"
                                : "text-muted"
                            }
                          >
                            {workingHours}
                          </span>
                        </td>
                        <td>{getStatusBadge(dayRecord)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="d-md-none">
              {filteredRecords.slice(0, 5).map((dayRecord, index) => {
                const workingHours = calculateWorkingHours(
                  dayRecord.checkIn,
                  dayRecord.checkOut
                );
                const dateFormatted = formatDate(dayRecord.date);

                return (
                  <div
                    key={`mobile-day-${dayRecord.date}-${index}`}
                    className="card mb-2 border-0 bg-light"
                  >
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="fw-semibold text-primary">
                          {dateFormatted.full}
                        </div>
                        {getStatusBadge(dayRecord)}
                      </div>

                      <div className="row text-center">
                        <div className="col-4">
                          <div className="small text-muted mb-1">Check In</div>
                          <div
                            className={
                              dayRecord.checkIn
                                ? "text-success fw-semibold small"
                                : "text-muted small"
                            }
                          >
                            {dayRecord.checkIn
                              ? formatTime(dayRecord.checkIn.timestamp)
                              : "--:--"}
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="small text-muted mb-1">Check Out</div>
                          <div
                            className={
                              dayRecord.checkOut
                                ? "text-danger fw-semibold small"
                                : "text-muted small"
                            }
                          >
                            {dayRecord.checkOut
                              ? formatTime(dayRecord.checkOut.timestamp)
                              : "--:--"}
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="small text-muted mb-1">Hours</div>
                          <div
                            className={
                              workingHours !== "--:--"
                                ? "fw-semibold text-primary small"
                                : "text-muted small"
                            }
                          >
                            {workingHours}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Footer */}
            <div className="mt-3 p-2 p-md-3 bg-light rounded attendance-summary-footer">
              <div className="row text-center">
                <div className="col-3">
                  <div className="text-success fw-bold responsive-text-lg">
                    {summaryStats.completed}
                  </div>
                  <small className="text-muted">
                    <span className="d-none d-sm-inline">Completed</span>
                    <span className="d-sm-none">Done</span>
                  </small>
                </div>
                <div className="col-3">
                  <div className="text-warning fw-bold responsive-text-lg">
                    {summaryStats.inProgress}
                  </div>
                  <small className="text-muted">
                    <span className="d-none d-sm-inline">In Progress</span>
                    <span className="d-sm-none">Active</span>
                  </small>
                </div>
                <div className="col-3">
                  <div className="text-danger fw-bold responsive-text-lg">
                    {summaryStats.missing}
                  </div>
                  <small className="text-muted">
                    <span className="d-none d-sm-inline">Missing</span>
                    <span className="d-sm-none">Miss</span>
                  </small>
                </div>
                <div className="col-3">
                  <div className="text-info fw-bold responsive-text-lg">
                    {summaryStats.total}
                  </div>
                  <small className="text-muted">
                    <span className="d-none d-sm-inline">Total Days</span>
                    <span className="d-sm-none">Total</span>
                  </small>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RecentAttendance;
