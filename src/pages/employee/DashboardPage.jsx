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
  const [userProfile, setUserProfile] = useState(null);
  const [initializationError, setInitializationError] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUserProfile(parsedUser);
      } catch (error) {
        setUserProfile(user);
      }
    } else {
      setUserProfile(user);
    }
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!hasInitialized) {
      const initializeDashboard = async () => {
        try {
          await fetchAttendanceRecords();

          try {
            await fetchDailySummary();
          } catch (summaryError) {
            console.warn(
              "📊 Daily summary failed during initialization:",
              summaryError
            );
          }

          try {
            const currentDate = new Date();
            await fetchMonthlyStats(
              currentDate.getFullYear(),
              currentDate.getMonth() + 1
            );
          } catch (statsError) {
            console.warn(
              "📊 Monthly stats failed during initialization:",
              statsError
            );
          }

          setHasInitialized(true);
        } catch (error) {
          console.error("❌ Dashboard initialization failed:", error);
          setInitializationError(
            "Some features may not be available. Please try refreshing."
          );
          setHasInitialized(true);
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

  const handleRefresh = useCallback(async () => {
    setInitializationError(null);
    try {
      await fetchAttendanceRecords(null, null, true);

      try {
        await fetchDailySummary(null, true);
      } catch (summaryError) {
        console.warn("📊 Daily summary refresh failed:", summaryError);
      }

      try {
        const currentDate = new Date();
        await fetchMonthlyStats(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          true
        );
      } catch (statsError) {
        console.warn("📊 Monthly stats refresh failed:", statsError);
      }
    } catch (error) {
      console.error("❌ Manual refresh failed:", error);
      setInitializationError("Refresh failed. Please try again.");
    }
  }, [fetchAttendanceRecords, fetchDailySummary, fetchMonthlyStats]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [logout]);

  if (!hasInitialized && isLoading) {
    return <PageLoading message="Loading dashboard..." />;
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
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

  return (
    <div className="min-vh-100 bg-light">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold" href="#!">
            <i className="bi bi-clock-history me-2 d-none d-sm-inline"></i>
            <span className="d-none d-sm-inline">WFH Attendance</span>
            <span className="d-sm-none">WFH</span>
          </a>

          <div className="navbar-nav ms-auto">
            <div className="nav-item dropdown">
              <button
                className="nav-link dropdown-toggle d-flex align-items-center btn btn-link text-white text-decoration-none border-0"
                type="button"
                id="userDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <div
                  className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                  style={{ width: "32px", height: "32px" }}
                >
                  <i className="bi bi-person-fill"></i>
                </div>
                <span className="d-none d-md-inline">
                  {userProfile?.name?.split(" ")[0] || "User"}
                </span>
              </button>

              <ul
                className="dropdown-menu dropdown-menu-end shadow"
                aria-labelledby="userDropdown"
              >
                <li>
                  <h6 className="dropdown-header">
                    <i className="bi bi-person-circle me-2"></i>
                    {userProfile?.name || "User"}
                  </h6>
                </li>
                <li>
                  <span className="dropdown-item-text small text-muted">
                    <i className="bi bi-envelope me-2"></i>
                    {userProfile?.email || "No email"}
                  </span>
                </li>
                <li>
                  <span className="dropdown-item-text small text-muted">
                    <i className="bi bi-briefcase me-2"></i>
                    {userProfile?.position || "No position"}
                  </span>
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
      <div className="container-fluid py-3 py-md-4">
        {/* Initialization Error Alert */}
        {initializationError && (
          <div className="row mb-3 mb-md-4">
            <div className="col-12">
              <div
                className="alert alert-warning alert-dismissible fade show"
                role="alert"
              >
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <strong>Warning:</strong> {initializationError}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-warning ms-2"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <i
                    className={`bi bi-arrow-clockwise me-1 ${
                      isLoading ? "spin" : ""
                    }`}
                  ></i>
                  Retry
                </button>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setInitializationError(null)}
                  aria-label="Close"
                ></button>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="row mb-3 mb-md-4">
          <div className="col-12">
            <div className="card shadow-lg border-0 welcome-section">
              <div className="card-body text-white p-responsive">
                <div className="row align-items-center">
                  <div className="col-auto d-none d-md-block">
                    <div
                      className="bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <i className="bi bi-person-fill text-white fs-4"></i>
                    </div>
                  </div>
                  <div className="col">
                    <h1 className="fw-bold mb-2 responsive-text-xl">
                      Welcome back, {userProfile?.name?.split(" ")[0] || "User"}
                      ! 👋
                    </h1>
                    <p className="mb-2 mb-md-3 opacity-90">
                      Ready to track your work from home attendance?
                    </p>
                    <div className="row">
                      <div className="col-6 col-md-auto">
                        <div className="responsive-text-lg fw-semibold">
                          {formatTime(currentTime)}
                        </div>
                        <div className="opacity-75 small">
                          {formatDate(currentTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-auto">
                    <button
                      className="btn btn-outline-light btn-sm"
                      onClick={handleRefresh}
                      disabled={isLoading}
                      title="Refresh all data"
                    >
                      <i
                        className={`bi bi-arrow-clockwise ${
                          isLoading ? "spin" : ""
                        }`}
                      ></i>
                      <span className="d-none d-lg-inline ms-1">Refresh</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="dashboard-grid">
          <div className="row g-3 g-md-4 dashboard-card-row">
            {/* Attendance Card */}
            <div className="col-12 col-lg-6 d-flex">
              <AttendanceCard />
            </div>

            {/* Attendance Summary */}
            <div className="col-12 col-lg-6 d-flex">
              <AttendanceSummary />
            </div>
          </div>

          {/* Recent Attendance - Full Width */}
          <div className="row g-3 g-md-4 mt-0">
            <div className="col-12">
              <RecentAttendance />
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
