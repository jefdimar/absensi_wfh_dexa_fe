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
  const [userProfile, setUserProfile] = useState(null); // Add this line

  // Add this useEffect to fetch user data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUserProfile(parsedUser);
        console.log("User profile loaded:", parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        setUserProfile(user); // Fallback to auth context user
      }
    } else {
      setUserProfile(user); // Fallback to auth context user
    }
  }, [user]);

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

              {/* Dropdown menu with responsive positioning */}
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
        {/* Enhanced Welcome Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-lg border-0 overflow-hidden">
              <div className="card-body bg-gradient-primary text-white position-relative">
                {/* Background Pattern */}
                <div
                  className="position-absolute top-0 end-0 opacity-10"
                  style={{ fontSize: "8rem", right: "-2rem", top: "-2rem" }}
                >
                  <i className="bi bi-house-heart-fill"></i>
                </div>

                <div className="row align-items-center position-relative">
                  {/* Profile Avatar */}
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

                  {/* Welcome Message */}
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

                    {/* Quick Info Pills */}
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
