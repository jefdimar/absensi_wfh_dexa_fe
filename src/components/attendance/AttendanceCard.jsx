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
    console.log("🔄 Updating attendance status:", newStatus);
    setAttendanceStatus(newStatus);
  }, [getCurrentStatus]);

  const handleCheckIn = async () => {
    console.log("🟢 Check-in button clicked");
    const result = await checkIn();

    // If the result indicates we refreshed data, update the status
    if (result.refreshed) {
      // Give a moment for the data to update, then refresh status
      setTimeout(() => {
        const newStatus = getCurrentStatus();
        setAttendanceStatus(newStatus);
      }, 500);
    } else if (result.success) {
      // Normal success case
      const newStatus = getCurrentStatus();
      setAttendanceStatus(newStatus);
    }
  };

  const handleCheckOut = async () => {
    console.log("🔴 Check-out button clicked");
    const result = await checkOut();

    // If the result indicates we refreshed data, update the status
    if (result.refreshed) {
      // Give a moment for the data to update, then refresh status
      setTimeout(() => {
        const newStatus = getCurrentStatus();
        setAttendanceStatus(newStatus);
      }, 500);
    } else if (result.success) {
      // Normal success case
      const newStatus = getCurrentStatus();
      setAttendanceStatus(newStatus);
    }
  };

  // Manual refresh function
  const handleRefresh = async () => {
    console.log("🔄 Manual refresh for status sync");
    try {
      await Promise.all([
        fetchAttendanceRecords(null, null, true),
        fetchDailySummary(null, true),
      ]);
      // Update status after refresh
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
    <div className="card shadow-sm attendance-card">
      <div className="card-header bg-success text-white">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title mb-0">
              <i className="bi bi-clock me-2"></i>
              Attendance Tracker
            </h5>
            <small className="opacity-75">Track your work hours</small>
          </div>
          {/* Status indicator */}
          <div className="text-end">
            <span className={`badge bg-${statusDisplay.color} bg-opacity-75`}>
              <i className={`bi ${statusDisplay.icon} me-1`}></i>
              {statusDisplay.text}
            </span>
          </div>
        </div>
      </div>

      <div className="card-body">
        {/* Error Alert - Only show real errors, not sync issues */}

        {error && !error.includes("Refreshing") && (
          <div
            className="alert alert-danger alert-dismissible fade show mb-3"
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

        {/* Warning Alerts - Only show important warnings */}
        {warnings.length > 0 &&
          warnings.some(
            (w) =>
              !w.includes("server maintenance") &&
              !w.includes("temporarily unavailable")
          ) && (
            <div
              className="alert alert-warning alert-dismissible fade show mb-3"
              role="alert"
            >
              <i className="bi bi-exclamation-triangle me-2"></i>
              <div>
                {warnings
                  .filter(
                    (w) =>
                      !w.includes("server maintenance") &&
                      !w.includes("temporarily unavailable")
                  )
                  .map((warning, index) => (
                    <div key={index}>{warning}</div>
                  ))}
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={clearWarnings}
                aria-label="Close"
              ></button>
            </div>
          )}

        {/* Current Time */}
        <div className="text-center mb-4">
          <div className="display-6 fw-bold text-success">
            {formatTime(currentTime)}
          </div>
          <div className="text-muted">{formatDate(currentTime)}</div>
        </div>

        {/* Current Status */}
        <div className="text-center mb-4">
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
              <span className="ms-1 d-none d-sm-inline">Sync</span>
            </button>
          </div>
        </div>

        {/* Daily Summary */}
        {dailySummary && (
          <div className="row text-center mb-4">
            <div className="col-6">
              <div className="border-end">
                <div className="fw-bold text-success">
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
              <div className="fw-bold text-danger">
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
          <div className="text-center mb-4">
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
                      Calculated
                    </span>
                  ) : (
                    <span title="From server">
                      <i className="bi bi-server me-1"></i>
                      Live
                    </span>
                  )}
                </small>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
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
                Processing...
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
                Processing...
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

        {/* Server Status Indicator */}
        {warnings.some(
          (w) =>
            w.includes("server maintenance") ||
            w.includes("temporarily unavailable")
        ) && (
          <div className="mt-3 p-2 bg-warning bg-opacity-10 rounded">
            <div className="d-flex align-items-center">
              <i className="bi bi-exclamation-triangle text-warning me-2"></i>
              <small className="text-muted">
                Some features may be limited due to server maintenance
              </small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceCard;
