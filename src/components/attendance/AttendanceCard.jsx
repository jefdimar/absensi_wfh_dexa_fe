import React, { useState, useCallback, useMemo } from "react";
import { useAttendance } from "../../contexts/AttendanceContext";
import { ButtonLoading } from "../ui/Loading";

const AttendanceCard = () => {
  const {
    checkIn,
    checkOut,
    todayStatus,
    dailySummary,
    isLoading,
    error,
    clearError,
  } = useAttendance();

  const [actionLoading, setActionLoading] = useState({
    checkIn: false,
    checkOut: false,
  });

  // Static current time (updated only on component mount)
  const currentTime = useMemo(() => {
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }, []); // Empty dependency array - only calculated once

  // Calculate work duration (static calculation)
  const workDuration = useMemo(() => {
    if (!todayStatus.hasCheckedIn || !todayStatus.checkInTime) {
      return null;
    }

    const checkInTime = new Date(todayStatus.checkInTime);
    const now = new Date();
    const diffMs = now - checkInTime;

    if (diffMs <= 0) return "0:00";

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  }, [todayStatus.hasCheckedIn, todayStatus.checkInTime]);

  // Handle check-in
  const handleCheckIn = useCallback(async () => {
    try {
      setActionLoading((prev) => ({ ...prev, checkIn: true }));
      clearError();

      const result = await checkIn();
      if (!result.success) {
        console.error("Check-in failed:", result.error);
      }
    } catch (error) {
      console.error("Check-in error:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, checkIn: false }));
    }
  }, [checkIn, clearError]);

  // Handle check-out
  const handleCheckOut = useCallback(async () => {
    try {
      setActionLoading((prev) => ({ ...prev, checkOut: true }));
      clearError();

      const result = await checkOut();
      if (!result.success) {
        console.error("Check-out failed:", result.error);
      }
    } catch (error) {
      console.error("Check-out error:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, checkOut: false }));
    }
  }, [checkOut, clearError]);

  // Format time display
  const formatTime = useCallback((timestamp) => {
    if (!timestamp) return "--:--";

    try {
      return new Date(timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Time formatting error:", error);
      return "--:--";
    }
  }, []);

  // Get status display info
  const statusInfo = useMemo(() => {
    if (todayStatus.isWorkComplete) {
      return {
        text: "Work Complete",
        icon: "bi-check-circle-fill",
        color: "success",
        bgColor: "bg-success",
        textColor: "text-success",
      };
    } else if (todayStatus.hasCheckedIn) {
      return {
        text: "Currently Working",
        icon: "bi-clock-fill",
        color: "warning",
        bgColor: "bg-warning",
        textColor: "text-warning",
      };
    } else {
      return {
        text: "Ready to Start",
        icon: "bi-play-circle-fill",
        color: "primary",
        bgColor: "bg-primary",
        textColor: "text-primary",
      };
    }
  }, [todayStatus]);

  return (
    <div className="card shadow-sm attendance-card">
      <div className={`card-header ${statusInfo.bgColor} text-white`}>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">
            <i className="bi bi-clock-history me-2"></i>
            Today's Attendance
          </h5>
          <div className="text-end">
            <small className="opacity-75">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </small>
          </div>
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

        {/* Current Status */}
        <div className="text-center mb-4">
          <div className={`${statusInfo.textColor} mb-2`}>
            <i className={`${statusInfo.icon} fs-1`}></i>
          </div>
          <h6 className={`${statusInfo.textColor} fw-bold`}>
            {statusInfo.text}
          </h6>
          {workDuration && (
            <p className="text-muted mb-0">
              Working for:{" "}
              <span className="fw-semibold text-primary">{workDuration}</span>
            </p>
          )}
        </div>

        {/* Time Information */}
        <div className="row g-3 mb-4">
          <div className="col-6">
            <div className="text-center p-3 bg-light rounded">
              <div className="text-muted small mb-1">Check In</div>
              <div
                className={`fw-bold ${
                  todayStatus.hasCheckedIn ? "text-success" : "text-muted"
                }`}
              >
                {formatTime(todayStatus.checkInTime)}
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="text-center p-3 bg-light rounded">
              <div className="text-muted small mb-1">Check Out</div>
              <div
                className={`fw-bold ${
                  todayStatus.hasCheckedOut ? "text-danger" : "text-muted"
                }`}
              >
                {formatTime(todayStatus.checkOutTime)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-grid gap-2">
          {!todayStatus.hasCheckedIn ? (
            <button
              type="button"
              className="btn btn-success btn-lg py-3"
              onClick={handleCheckIn}
              disabled={isLoading || actionLoading.checkIn}
            >
              {actionLoading.checkIn ? (
                <>
                  <ButtonLoading />
                  Checking in...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Check In
                </>
              )}
            </button>
          ) : !todayStatus.hasCheckedOut ? (
            <button
              type="button"
              className="btn btn-danger btn-lg py-3"
              onClick={handleCheckOut}
              disabled={isLoading || actionLoading.checkOut}
            >
              {actionLoading.checkOut ? (
                <>
                  <ButtonLoading />
                  Checking out...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Check Out
                </>
              )}
            </button>
          ) : (
            <div className="alert alert-success mb-0" role="alert">
              <div className="d-flex align-items-center">
                <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                <div>
                  <div className="fw-bold">Work day completed!</div>
                  <small className="text-muted">
                    Total hours:{" "}
                    {dailySummary?.totalHours ||
                      workDuration ||
                      "Calculating..."}
                  </small>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Daily Summary */}
        {dailySummary && (
          <div className="mt-4 pt-3 border-top">
            <h6 className="text-muted mb-3">
              <i className="bi bi-calendar-day me-2"></i>
              Today's Summary
            </h6>
            <div className="row g-2 text-center">
              <div className="col-4">
                <div className="small text-muted">Status</div>
                <div className="fw-semibold">
                  <span className={`badge bg-${statusInfo.color}`}>
                    {dailySummary.status || statusInfo.text}
                  </span>
                </div>
              </div>
              <div className="col-4">
                <div className="small text-muted">Hours</div>
                <div className="fw-semibold text-primary">
                  {dailySummary.totalHours || workDuration || "0:00"}
                </div>
              </div>
              <div className="col-4">
                <div className="small text-muted">Break Time</div>
                <div className="fw-semibold text-info">
                  {dailySummary.breakTime || "0:00"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer with Additional Info */}
      <div className="card-footer bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            <i className="bi bi-clock me-1"></i>
            Loaded at: {currentTime}
          </small>
          <small className="text-muted">
            <i className="bi bi-geo-alt me-1"></i>
            Work from Home
          </small>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCard;
