import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest(".dropdown")) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  // Add backdrop for mobile dropdown
  useEffect(() => {
    if (dropdownOpen) {
      const backdrop = document.createElement("div");
      backdrop.className = "dropdown-backdrop";
      backdrop.onclick = () => setDropdownOpen(false);
      document.body.appendChild(backdrop);

      // Prevent body scroll when dropdown is open on mobile
      if (window.innerWidth <= 767) {
        document.body.style.overflow = "hidden";
      }

      return () => {
        if (document.body.contains(backdrop)) {
          document.body.removeChild(backdrop);
        }
        document.body.style.overflow = "";
      };
    }
  }, [dropdownOpen]);

  // Add window resize handler to close dropdown
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 767 && dropdownOpen) {
        setDropdownOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dropdownOpen]);

  useEffect(() => {
    if (!hasInitialized) {
      const initializeDashboard = async () => {
        try {
          console.log("🚀 Initializing dashboard data...");

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

          console.log("✅ Dashboard initialized successfully");
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
    console.log("🔄 Manual refresh triggered");
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

  const handleDropdownToggle = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDropdownOpen(!dropdownOpen);
    },
    [dropdownOpen]
  );

  const handleProfileClick = useCallback(() => {
    setDropdownOpen(false);
    navigate("/profile");
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    setDropdownOpen(false);
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
          <a
            className="navbar-brand fw-bold"
            href="#!"
            onClick={(e) => e.preventDefault()}
          >
            <i className="bi bi-clock-history me-2 d-none d-sm-inline"></i>
            <span className="d-none d-sm-inline">WFH Attendance</span>
            <span className="d-sm-none">WFH</span>
          </a>

          <div className="navbar-nav ms-auto">
            <div className="nav-item dropdown">
              <button
                className="nav-link dropdown-toggle d-flex align-items-center btn btn-link text-white text-decoration-none border-0"
                type="button"
                onClick={handleDropdownToggle}
                aria-expanded={dropdownOpen}
              >
                <div
                  className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                  style={{ width: "32px", height: "32px" }}
                >
                  {userProfile?.profilePicture || userProfile?.avatar ? (
                    <img
                      src={userProfile.profilePicture || userProfile.avatar}
                      alt="Profile"
                      className="rounded-circle"
                      style={{
                        width: "30px",
                        height: "30px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <i className="bi bi-person-fill"></i>
                  )}
                </div>
                <span className="d-none d-md-inline">
                  {userProfile?.name?.split(" ")[0] || "User"}
                </span>
              </button>

              <ul
                className={`dropdown-menu dropdown-menu-end shadow ${
                  dropdownOpen ? "show" : ""
                }`}
                style={{ minWidth: "200px" }}
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
                    className="dropdown-item"
                    type="button"
                    onClick={handleProfileClick}
                  >
                    <i className="bi bi-person me-2"></i>
                    Profile
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
                      {userProfile?.profilePicture || userProfile?.avatar ? (
                        <img
                          src={userProfile.profilePicture || userProfile.avatar}
                          alt="Profile"
                          className="rounded-circle"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <i className="bi bi-person-fill text-white fs-4"></i>
                      )}
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

        {/* Main Dashboard Grid - FIXED FOR MOBILE */}
        <div className="dashboard-grid">
          {/* Mobile: Stack cards vertically, Desktop: Side by side */}
          <div className="row g-3 g-md-4 mb-3 mb-md-4">
            {/* Attendance Card - Full width on mobile, half on desktop */}
            <div className="col-12 col-lg-6">
              <AttendanceCard />
            </div>

            {/* Attendance Summary - Full width on mobile, half on desktop */}
            <div className="col-12 col-lg-6">
              <AttendanceSummary />
            </div>
          </div>

          {/* Recent Attendance - Always full width */}
          <div className="row g-3 g-md-4">
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
