import React, { useEffect } from "react";
import { useAttendance } from "../../contexts/AttendanceContext";

const AttendanceSummary = () => {
  const {
    monthlyStats,
    fetchMonthlyStats,
    isLoading,
    warnings,
    clearWarnings,
  } = useAttendance();

  useEffect(() => {
    const currentDate = new Date();
    fetchMonthlyStats(currentDate.getFullYear(), currentDate.getMonth() + 1);
  }, [fetchMonthlyStats]);

  if (isLoading && !monthlyStats) {
    return (
      <div className="card shadow-sm h-100">
        <div className="card-body text-center d-flex align-items-center justify-content-center">
          <div>
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted small">Loading monthly summary...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentMonth = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="card shadow-sm h-100">
      <div className="card-header bg-warning text-white uniform-header">
        <h5 className="card-title mb-0">
          <i className="bi bi-calendar-month me-2"></i>
          <span className="d-none d-sm-inline">Monthly Summary</span>
          <span className="d-sm-none">Monthly</span>
        </h5>
        <small className="opacity-75 d-block mt-1">
          <span className="d-none d-sm-inline">{currentMonth}</span>
          <span className="d-sm-none">
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              year: "2-digit",
            })}
          </span>
        </small>
      </div>

      <div className="card-body d-flex flex-column card-content-spacing">
        {/* Main Stats Grid */}
        <div className="row g-2 g-md-3 mb-responsive stats-grid">
          <div className="col-6">
            <div className="text-center p-2 p-md-3 bg-light rounded">
              <div className="fs-4 fw-bold text-primary">
                {monthlyStats?.totalDays || 0}
              </div>
              <small className="text-muted">
                <span className="d-none d-sm-inline">Days Worked</span>
                <span className="d-sm-none">Days</span>
              </small>
            </div>
          </div>

          <div className="col-6">
            <div className="text-center p-2 p-md-3 bg-light rounded">
              <div className="fs-4 fw-bold text-success">
                {monthlyStats?.totalHours || "0:00"}
              </div>
              <small className="text-muted">
                <span className="d-none d-sm-inline">Total Hours</span>
                <span className="d-sm-none">Hours</span>
              </small>
            </div>
          </div>

          <div className="col-6">
            <div className="text-center p-2 p-md-3 bg-light rounded">
              <div className="fs-4 fw-bold text-info">
                {monthlyStats?.averageHours || "0:00"}
              </div>
              <small className="text-muted">
                <span className="d-none d-sm-inline">Avg Hours/Day</span>
                <span className="d-sm-none">Avg/Day</span>
              </small>
            </div>
          </div>

          <div className="col-6">
            <div className="text-center p-2 p-md-3 bg-light rounded">
              <div className="fs-4 fw-bold text-warning">
                {monthlyStats?.attendanceRate || "0%"}
              </div>
              <small className="text-muted">
                <span className="d-none d-sm-inline">Attendance Rate</span>
                <span className="d-sm-none">Rate</span>
              </small>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        {monthlyStats && (
          <div className="mb-responsive">
            <h6 className="text-muted mb-3">
              <i className="bi bi-bar-chart me-2"></i>
              <span className="d-none d-sm-inline">Detailed Breakdown</span>
              <span className="d-sm-none">Breakdown</span>
            </h6>
            <div className="row g-2">
              <div className="col-4">
                <div className="text-center p-2 bg-success bg-opacity-10 rounded">
                  <div className="fw-bold text-success fs-5">
                    {monthlyStats.presentDays || 0}
                  </div>
                  <small className="text-muted">Present</small>
                </div>
              </div>
              <div className="col-4">
                <div className="text-center p-2 bg-danger bg-opacity-10 rounded">
                  <div className="fw-bold text-danger fs-5">
                    {monthlyStats.absentDays || 0}
                  </div>
                  <small className="text-muted">Absent</small>
                </div>
              </div>
              <div className="col-4">
                <div className="text-center p-2 bg-warning bg-opacity-10 rounded">
                  <div className="fw-bold text-warning fs-5">
                    {monthlyStats.incompleteDays || 0}
                  </div>
                  <small className="text-muted">
                    <span className="d-none d-sm-inline">Incomplete</span>
                    <span className="d-sm-none">Inc.</span>
                  </small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Indicators */}
        {monthlyStats && (
          <div className="mb-responsive">
            <h6 className="text-muted mb-3">
              <i className="bi bi-speedometer2 me-2"></i>
              <span className="d-none d-sm-inline">Performance Indicators</span>
              <span className="d-sm-none">Performance</span>
            </h6>
            <div className="mb-2">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted">
                  <span className="d-none d-sm-inline">Attendance Rate</span>
                  <span className="d-sm-none">Attendance</span>
                </small>
                <small className="fw-bold">
                  {monthlyStats.attendanceRate || "0%"}
                </small>
              </div>
              <div className="progress" style={{ height: "6px" }}>
                <div
                  className="progress-bar bg-success"
                  style={{
                    width: monthlyStats.attendanceRate || "0%",
                  }}
                ></div>
              </div>
            </div>
            <div className="mb-2">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted">
                  <span className="d-none d-sm-inline">Completion Rate</span>
                  <span className="d-sm-none">Completion</span>
                </small>
                <small className="fw-bold">
                  {monthlyStats.presentDays > 0
                    ? Math.round(
                        ((monthlyStats.presentDays -
                          (monthlyStats.incompleteDays || 0)) /
                          monthlyStats.presentDays) *
                          100
                      )
                    : 0}
                  %
                </small>
              </div>
              <div className="progress" style={{ height: "6px" }}>
                <div
                  className="progress-bar bg-info"
                  style={{
                    width:
                      monthlyStats.presentDays > 0
                        ? `${Math.round(
                            ((monthlyStats.presentDays -
                              (monthlyStats.incompleteDays || 0)) /
                              monthlyStats.presentDays) *
                              100
                          )}%`
                        : "0%",
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Stats */}
        <div className="mt-auto">
          {monthlyStats ? (
            <div className="bg-light rounded p-2 p-md-3">
              <div className="row text-center">
                <div className="col-6">
                  <div className="text-primary fw-bold responsive-text-lg">
                    {monthlyStats.totalDaysInMonth || new Date().getDate()}
                  </div>
                  <small className="text-muted">
                    <span className="d-none d-sm-inline">Days in Month</span>
                    <span className="d-sm-none">Days/Month</span>
                  </small>
                </div>
                <div className="col-6">
                  <div className="text-info fw-bold responsive-text-lg">
                    {monthlyStats.workingDaysInMonth ||
                      monthlyStats.totalDaysInMonth ||
                      0}
                  </div>
                  <small className="text-muted">
                    <span className="d-none d-sm-inline">Working Days</span>
                    <span className="d-sm-none">Work Days</span>
                  </small>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-3 text-muted">
              <i className="bi bi-calendar-x fs-1 mb-2 d-none d-md-block"></i>
              <i className="bi bi-calendar-x fs-3 mb-2 d-md-none"></i>
              <p className="mb-2">
                <span className="d-none d-sm-inline">
                  No monthly data available yet
                </span>
                <span className="d-sm-none">No data available</span>
              </p>
              <small>
                <span className="d-none d-sm-inline">
                  Start tracking your attendance to see monthly statistics
                </span>
                <span className="d-sm-none">
                  Start tracking to see statistics
                </span>
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceSummary;
