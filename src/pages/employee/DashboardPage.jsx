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
          // Always try to fetch records first as they're most important
          await fetchAttendanceRecords();

          // Try to fetch daily summary for today (don't pass any date parameter)
          try {
            await fetchDailySummary(); // No date parameter = use today
          } catch (summaryError) {
            console.warn(
              "📊 Daily summary failed during initialization:",
              summaryError
            );
            // Daily summary will fall back to calculated values
          }

          // Try to fetch monthly stats, but it's not critical
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
            // Monthly stats will use defaults
          }

          setHasInitialized(true);
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

  const handleRefresh = useCallback(async () => {
    try {
      await fetchAttendanceRecords(null, null, true);

      try {
        await fetchDailySummary(null, true); // No date = use today
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
    }
  }, [fetchAttendanceRecords, fetchDailySummary, fetchMonthlyStats]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      // Handle error silently
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
            <i className="bi bi-clock-history me-2"></i>
            WFH Attendance
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
                <span className="d-none d-sm-inline">
                  {userProfile?.name || "User"}
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
      <div className="container-fluid py-4">
        {/* Welcome Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-lg border-0 overflow-hidden">
              <div className="card-body bg-gradient-primary text-white position-relative">
                <div
                  className="position-absolute top-0 end-0 opacity-10"
                  style={{ fontSize: "8rem", right: "-2rem", top: "-2rem" }}
                >
                  <i className="bi bi-house-heart-fill"></i>
                </div>

                <div className="row align-items-center position-relative">
                  <div className="col-auto">
                    <div
                      className="bg-white bg-opacity-20 backdrop-blur rounded-circle d-flex align-items-center justify-content-center shadow-lg"
                      style={{ width: "80px", height: "80px" }}
                    >
                      {userProfile?.profilePicture || userProfile?.avatar ? (
                        <img
                          src={userProfile.profilePicture || userProfile.avatar}
                          alt="Profile"
                          className="rounded-circle"
                          style={{
                            width: "70px",
                            height: "70px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <i
                          className="bi bi-person-fill text-white"
                          style={{ fontSize: "2.5rem" }}
                        ></i>
                      )}
                    </div>
                  </div>

                  <div className="col">
                    <div className="mb-3">
                      <h1 className="fw-bold mb-2 display-6">
                        Welcome back,{" "}
                        {userProfile?.name?.split(" ")[0] || "User"}! 👋
                      </h1>
                      <p className="mb-0 opacity-90 fs-5">
                        Ready to track your work from home attendance?
                      </p>
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                      <span className="badge bg-white bg-opacity-20 text-white px-3 py-2 rounded-pill">
                        <i className="bi bi-briefcase-fill me-2"></i>
                        {userProfile?.position || "Employee"}
                      </span>
                      <span className="badge bg-white bg-opacity-20 text-white px-3 py-2 rounded-pill">
                        <i className="bi bi-shield-check-fill me-2"></i>
                        {userProfile?.role || "User"}
                      </span>
                      <span className="badge bg-white bg-opacity-20 text-white px-3 py-2 rounded-pill">
                        <i className="bi bi-calendar-check-fill me-2"></i>
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="col-auto">
                    <button
                      className="btn btn-outline-light"
                      onClick={handleRefresh}
                      disabled={isLoading}
                      title="Refresh all data"
                    >
                      <i
                        className={`bi bi-arrow-clockwise ${
                          isLoading ? "spin" : ""
                        }`}
                      ></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="row g-4">
          {/* Attendance Cards Row - Equal Height */}
          <div className="col-md-6 d-flex">
            <AttendanceCard />
          </div>
          <div className="col-md-6 d-flex">
            <AttendanceSummary />
          </div>

          {/* Recent Attendance - Full Width */}
          <div className="col-12">
            <RecentAttendance />
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
