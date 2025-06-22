import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  AttendanceProvider,
  useAttendance,
} from "../../contexts/AttendanceContext";
import AttendanceCard from "../../components/attendance/AttendanceCard";
import RecentAttendance from "../../components/attendance/RecentAttendance";
import AttendanceSummary from "../../components/attendance/AttendanceSummary";
import { PageLoading } from "../../components/ui/Loading";

// Dashboard content component (inside AttendanceProvider)
const DashboardContent = () => {
  const { user, logout } = useAuth();
  const {
    fetchAttendanceRecords,
    fetchDailySummary,
    fetchMonthlyStats,
    isLoading,
  } = useAttendance();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [hasInitialized, setHasInitialized] = useState(false);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Initial data fetch - only once when component mounts
  useEffect(() => {
    if (!hasInitialized) {
      console.log("🚀 Initializing dashboard data...");

      const initializeDashboard = async () => {
        try {
          // Fetch initial data
          await Promise.all([
            fetchAttendanceRecords(),
            fetchDailySummary(),
            fetchMonthlyStats(),
          ]);

          setHasInitialized(true);
          console.log("✅ Dashboard initialized successfully");
        } catch (error) {
          console.error("❌ Dashboard initialization failed:", error);
          setHasInitialized(true); // Set to true anyway to prevent infinite loop
        }
      };

      initializeDashboard();
    }
  }, [
    hasInitialized,
    fetchAttendanceRecords,
    fetchDailySummary,
    fetchMonthlyStats,
  ]);

  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    console.log("🔄 Manual refresh triggered");
    try {
      await Promise.all([
        fetchAttendanceRecords(null, null, true), // force refresh
        fetchDailySummary(null, true), // force refresh
        fetchMonthlyStats(null, null, true), // force refresh
      ]);
    } catch (error) {
      console.error("❌ Manual refresh failed:", error);
    }
  }, [fetchAttendanceRecords, fetchDailySummary, fetchMonthlyStats]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [logout]);

  // Show loading only during initial load
  if (!hasInitialized && isLoading) {
    return <PageLoading message="Loading dashboard..." />;
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold" href="#!">
            <i className="bi bi-building me-2"></i>
            WFH Attendance
          </a>

          <div className="d-flex align-items-center">
            {/* Current Time */}
            <span className="navbar-text me-3 d-none d-md-inline">
              <i className="bi bi-clock me-1"></i>
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>

            {/* Refresh Button */}
            <button
              className="btn btn-outline-light btn-sm me-3"
              onClick={handleRefresh}
              disabled={isLoading}
              title="Refresh Data"
            >
              <i
                className={`bi bi-arrow-clockwise ${isLoading ? "spin" : ""}`}
              ></i>
            </button>

            {/* User Dropdown - Simplified version */}
            <div className="dropdown">
              <button
                className="btn btn-outline-light"
                type="button"
                id="userDropdown"
              >
                <i className="bi bi-person-circle me-2"></i>
                {user?.name || "User"}
                <i className="bi bi-chevron-down ms-1"></i>
              </button>
              <ul
                className="dropdown-menu dropdown-menu-end"
                aria-labelledby="userDropdown"
              >
                <li>
                  <h6 className="dropdown-header">
                    <i className="bi bi-person me-2"></i>
                    {user?.name}
                  </h6>
                </li>
                <li>
                  <span className="dropdown-item-text small text-muted">
                    {user?.email}
                  </span>
                </li>
                <li>
                  <span className="dropdown-item-text small text-muted">
                    {user?.position}
                  </span>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button className="dropdown-item" type="button">
                    <i className="bi bi-person me-2"></i>
                    Profile
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" type="button">
                    <i className="bi bi-gear me-2"></i>
                    Settings
                  </button>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    className="dropdown-item text-danger"
                    type="button"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container-fluid py-4">
        <div className="row g-4">
          {/* Left Column - Attendance Card */}
          <div className="col-lg-4">
            <AttendanceCard />
          </div>

          {/* Right Column - Statistics */}
          <div className="col-lg-8">
            <div className="row g-4">
              {/* Monthly Summary */}
              <div className="col-12">
                <AttendanceSummary />
              </div>

              {/* Recent Attendance */}
              <div className="col-12">
                <RecentAttendance />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Page Component
const DashboardPage = () => {
  return (
    <AttendanceProvider>
      <DashboardContent />
    </AttendanceProvider>
  );
};

export default DashboardPage;
