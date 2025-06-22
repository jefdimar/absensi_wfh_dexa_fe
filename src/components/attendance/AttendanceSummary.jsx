import React, { useEffect, useState, useCallback } from "react";
import { useAttendance } from "../../contexts/AttendanceContext";

const AttendanceSummary = () => {
  const { monthlyStats, fetchMonthlyStats, isLoading, error, clearError } =
    useAttendance();
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize data only once
  useEffect(() => {
    if (!hasInitialized && !monthlyStats && !isLoading) {
      console.log("📊 Initializing monthly stats...");
      const currentDate = new Date();
      fetchMonthlyStats(currentDate.getFullYear(), currentDate.getMonth() + 1);
      setHasInitialized(true);
    }
  }, [hasInitialized, monthlyStats, isLoading, fetchMonthlyStats]);

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    clearError();
    console.log("🔄 Manual refresh monthly stats...");
    const currentDate = new Date();
    fetchMonthlyStats(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      true
    ); // force refresh
  }, [clearError, fetchMonthlyStats]);

  if (isLoading && !monthlyStats) {
    return (
      <div className="card shadow-sm">
        <div className="card-body text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted small">Loading monthly summary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">
            <i className="bi bi-calendar-month me-2"></i>
            Monthly Summary
          </h5>
          <button
            className="btn btn-outline-light btn-sm"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh monthly stats"
          >
            <i
              className={`bi bi-arrow-clockwise ${isLoading ? "spin" : ""}`}
            ></i>
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
            {error}
            <button
              type="button"
              className="btn-close"
              onClick={clearError}
              aria-label="Close"
            ></button>
          </div>
        )}

        <div className="row g-3">
          <div className="col-6 col-md-3">
            <div className="text-center p-3 bg-light rounded">
              <div className="fs-4 fw-bold text-primary">
                {monthlyStats?.totalDays || 0}
              </div>
              <small className="text-muted">Days Worked</small>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="text-center p-3 bg-light rounded">
              <div className="fs-4 fw-bold text-success">
                {monthlyStats?.totalHours || "0:00"}
              </div>
              <small className="text-muted">Total Hours</small>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="text-center p-3 bg-light rounded">
              <div className="fs-4 fw-bold text-info">
                {monthlyStats?.averageHours || "0:00"}
              </div>
              <small className="text-muted">Avg Hours/Day</small>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="text-center p-3 bg-light rounded">
              <div className="fs-4 fw-bold text-warning">
                {monthlyStats?.attendanceRate || "0%"}
              </div>
              <small className="text-muted">Attendance Rate</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSummary;
