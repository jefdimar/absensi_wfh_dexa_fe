import React, { useEffect, useState } from "react";
import { useAttendance } from "../../hooks/useAttendance";

const AttendanceCard = () => {
  const {
    checkIn,
    checkOut,
    getCurrentStatus,
    dailySummary,
    isLoading,
    error,
    warnings,
    clearError,
    clearWarnings,
    fetchAttendanceRecords,
    fetchDailySummary,
  } = useAttendance();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceStatus, setAttendanceStatus] = useState({
    status: "not-started",
    canCheckIn: true,
    canCheckOut: false,
  });

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update attendance status when data changes
  useEffect(() => {
    const newStatus = getCurrentStatus();
    setAttendanceStatus(newStatus);
  }, [getCurrentStatus]);

  const handleCheckIn = async () => {
    const result = await checkIn();

    if (result.refreshed) {
      setTimeout(() => {
        const newStatus = getCurrentStatus();
        setAttendanceStatus(newStatus);
      }, 500);
    } else if (result.success) {
      const newStatus = getCurrentStatus();
      setAttendanceStatus(newStatus);
    }
  };

  const handleCheckOut = async () => {
    const result = await checkOut();

    if (result.refreshed) {
      setTimeout(() => {
        const newStatus = getCurrentStatus();
        setAttendanceStatus(newStatus);
      }, 500);
    } else if (result.success) {
      const newStatus = getCurrentStatus();
      setAttendanceStatus(newStatus);
    }
  };

  const handleRefresh = async () => {
    try {
      await Promise.all([
        fetchAttendanceRecords(null, null, true),
        fetchDailySummary(null, true),
      ]);
      setTimeout(() => {
        const newStatus = getCurrentStatus();
        setAttendanceStatus(newStatus);
      }, 300);
    } catch (error) {
      console.error("❌ Manual refresh failed:", error);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusDisplay = () => {
    switch (attendanceStatus.status) {
      case "checked-in":
        return {
          text: "Checked In",
          color: "success",
          icon: "bi-check-circle-fill",
        };
      case "checked-out":
        return {
          text: "Checked Out",
          color: "info",
          icon: "bi-clock-fill",
        };
      default:
        return {
          text: "Not Started",
          color: "secondary",
          icon: "bi-circle",
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="card shadow-sm attendance-card h-100">
      <div className="card-header bg-success text-white uniform-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title mb-0">
              <i className="bi bi-clock me-2"></i>
              <span className="d-none d-sm-inline">Attendance Tracker</span>
              <span className="d-sm-none">Attendance</span>
            </h5>
            <small className="opacity-75 d-block mt-1">
              Track your work hours
            </small>
          </div>
        </div>
      </div>

      <div className="card-body d-flex flex-column card-content-spacing">
        {/* Error Alert - Only show real errors, not sync issues */}
        {error && !error.includes("Refreshing") && (
          <div
            className="alert alert-danger alert-dismissible fade show"
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

        {/* Current Time */}
        <div className="text-center mb-responsive">
          <div className="display-6 fw-bold text-success d-none d-md-block">
            {formatTime(currentTime)}
          </div>
          <div className="fs-3 fw-bold text-success d-md-none">
            {currentTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </div>
          <div className="text-muted small">
            {currentTime.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Current Status */}
        <div className="text-center mb-responsive">
          <span className={`badge bg-${statusDisplay.color} fs-6 px-3 py-2`}>
            <i className={`bi ${statusDisplay.icon} me-2`}></i>
            {statusDisplay.text}
          </span>
          {/* Refresh button for status sync */}
          <div className="mt-2">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={handleRefresh}
              disabled={isLoading}
              title="Refresh status"
            >
              <i
                className={`bi bi-arrow-clockwise ${isLoading ? "spin" : ""}`}
              ></i>
              <span className="ms-1 d-none d-lg-inline">Sync</span>
            </button>
          </div>
        </div>

        {/* Daily Summary */}
        {dailySummary && (
          <div className="row text-center mb-responsive stats-grid">
            <div className="col-6">
              <div className="border-end">
                <div className="fw-bold text-success responsive-text-lg">
                  {dailySummary.checkInTime
                    ? new Date(dailySummary.checkInTime).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )
                    : "--:--"}
                </div>
                <small className="text-muted">Check In</small>
              </div>
            </div>
            <div className="col-6">
              <div className="fw-bold text-danger responsive-text-lg">
                {dailySummary.checkOutTime
                  ? new Date(dailySummary.checkOutTime).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      }
                    )
                  : "--:--"}
              </div>
              <small className="text-muted">Check Out</small>
            </div>
          </div>
        )}

        {/* Working Hours */}
        {dailySummary?.totalHours && (
          <div className="text-center mb-responsive">
            <div className="fs-4 fw-bold text-info">
              {dailySummary.totalHours}
            </div>
            <small className="text-muted">Hours Worked Today</small>
            {/* Show data source indicator */}
            {dailySummary._source && (
              <div className="mt-1">
                <small className="text-muted opacity-75">
                  {dailySummary._source === "fallback-records" ? (
                    <span title="Calculated from attendance records">
                      <i className="bi bi-calculator me-1"></i>
                      <span className="d-none d-sm-inline">Calculated</span>
                    </span>
                  ) : (
                    <span title="From server">
                      <i className="bi bi-server me-1"></i>
                      <span className="d-none d-sm-inline">Live</span>
                    </span>
                  )}
                </small>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons - This will be pushed to bottom by flex-column */}
        <div className="mt-auto">
          <div className="d-grid gap-2">
            <button
              className="btn btn-success btn-lg"
              onClick={handleCheckIn}
              disabled={!attendanceStatus.canCheckIn || isLoading}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  <span className="d-none d-sm-inline">Processing...</span>
                  <span className="d-sm-none">...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Check In
                </>
              )}
            </button>
            <button
              className="btn btn-danger btn-lg"
              onClick={handleCheckOut}
              disabled={!attendanceStatus.canCheckOut || isLoading}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  <span className="d-none d-sm-inline">Processing...</span>
                  <span className="d-sm-none">...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Check Out
                </>
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-3">
            <small className="text-muted">
              {attendanceStatus.status === "not-started" &&
                "Click 'Check In' to start your work day."}
              {attendanceStatus.status === "checked-in" &&
                "You're currently checked in. Don't forget to check out when you're done."}
              {attendanceStatus.status === "checked-out" &&
                "You've completed your work day. Great job!"}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCard;
