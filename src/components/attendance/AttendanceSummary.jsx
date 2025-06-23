import React, { useEffect, useState } from "react";
import { useAttendance } from "../../contexts/AttendanceContext";

const AttendanceSummary = () => {
  const { monthlyStats, fetchMonthlyStats, isLoading } = useAttendance();

  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    const loadMonthlyStats = async () => {
      setIsLoadingStats(true);

      try {
        const currentDate = new Date();
        await fetchMonthlyStats(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1
        );
      } catch (error) {
        // Handle error silently
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadMonthlyStats();
  }, [fetchMonthlyStats]);

  const currentMonth = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  if (isLoadingStats && !monthlyStats) {
    return (
      <div className="card shadow-sm h-100">
        <div className="card-header bg-warning text-white">
          <h5 className="card-title mb-0">
            <i className="bi bi-calendar-month me-2"></i>
            Monthly Summary
          </h5>
          <small className="opacity-75 d-block mt-1">{currentMonth}</small>
        </div>
        <div className="card-body text-center d-flex align-items-center justify-content-center">
          <div>
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading monthly summary...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm h-100">
      <div className="card-header bg-warning text-white">
        <h5 className="card-title mb-0">
          <i className="bi bi-calendar-month me-2"></i>
          Monthly Summary
        </h5>
        <small className="opacity-75 d-block mt-1">{currentMonth}</small>
      </div>

      <div className="card-body d-flex flex-column">
        {/* Main Stats Grid */}
        <div className="row g-3 mb-4">
          <div className="col-6">
            <div className="text-center p-3 bg-light rounded">
              <div className="fs-4 fw-bold text-primary">
                {monthlyStats?.totalDays || 0}
              </div>
              <small className="text-muted">Days Worked</small>
            </div>
          </div>

          <div className="col-6">
            <div className="text-center p-3 bg-light rounded">
              <div className="fs-4 fw-bold text-success">
                {monthlyStats?.totalHours || "0:00"}
              </div>
              <small className="text-muted">Total Hours</small>
            </div>
          </div>

          <div className="col-6">
            <div className="text-center p-3 bg-light rounded">
              <div className="fs-4 fw-bold text-info">
                {monthlyStats?.averageHours || "0:00"}
              </div>
              <small className="text-muted">Avg Hours/Day</small>
            </div>
          </div>

          <div className="col-6">
            <div className="text-center p-3 bg-light rounded">
              <div className="fs-4 fw-bold text-warning">
                {monthlyStats?.attendanceRate || "0%"}
              </div>
              <small className="text-muted">Attendance Rate</small>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        {monthlyStats && (
          <div className="mb-4">
            <h6 className="text-muted mb-3">
              <i className="bi bi-bar-chart me-2"></i>
              Detailed Breakdown
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
                  <small className="text-muted">Incomplete</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Indicators */}
        {monthlyStats && (
          <div className="mb-4">
            <h6 className="text-muted mb-3">
              <i className="bi bi-speedometer2 me-2"></i>
              Performance Indicators
            </h6>
            <div className="mb-2">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted">Attendance Rate</small>
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
                <small className="text-muted">Completion Rate</small>
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
            <div className="bg-light rounded p-3">
              <div className="row text-center">
                <div className="col-6">
                  <div className="text-primary fw-bold">
                    {monthlyStats.totalDaysInMonth || new Date().getDate()}
                  </div>
                  <small className="text-muted">Days in Month</small>
                </div>
                <div className="col-6">
                  <div className="text-info fw-bold">
                    {monthlyStats.workingDaysInMonth ||
                      monthlyStats.totalDaysInMonth ||
                      0}
                  </div>
                  <small className="text-muted">Working Days</small>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-3 text-muted">
              <i className="bi bi-calendar-x fs-1 mb-2"></i>
              <p>No monthly data available yet</p>
              <small>
                Start tracking your attendance to see monthly statistics
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceSummary;
