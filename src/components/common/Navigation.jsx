import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [logout]);

  const handleNavigation = useCallback(
    (path) => {
      setDropdownOpen(false);
      navigate(path);
    },
    [navigate]
  );

  const toggleDropdown = useCallback(() => {
    setDropdownOpen((prev) => !prev);
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
      case "/dashboard":
        return "Dashboard";
      case "/profile":
        return "Profile";
      default:
        return "WFH Attendance";
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container-fluid">
        <div className="d-flex align-items-center">
          <button
            className="navbar-brand btn btn-link text-white text-decoration-none border-0 p-0 fw-bold"
            onClick={() => handleNavigation("/dashboard")}
          >
            <i className="bi bi-clock-history me-2 d-none d-sm-inline"></i>
            <span className="d-none d-sm-inline">WFH Attendance</span>
            <span className="d-sm-none">WFH</span>
          </button>

          {/* Page indicator */}
          <span className="ms-3 text-white-50 d-none d-md-inline">
            <i className="bi bi-chevron-right me-2"></i>
            {getPageTitle()}
          </span>
        </div>

        {/* Navigation Links - Desktop */}
        <div className="navbar-nav d-none d-lg-flex flex-row me-3">
          <button
            className={`nav-link btn btn-link text-white text-decoration-none border-0 me-3 ${
              location.pathname === "/dashboard" ? "active" : ""
            }`}
            onClick={() => handleNavigation("/dashboard")}
          >
            <i className="bi bi-house me-1"></i>
            Dashboard
          </button>
          <button
            className={`nav-link btn btn-link text-white text-decoration-none border-0 me-3 ${
              location.pathname === "/profile" ? "active" : ""
            }`}
            onClick={() => handleNavigation("/profile")}
          >
            <i className="bi bi-person me-1"></i>
            Profile
          </button>
        </div>

        {/* User Dropdown */}
        <div className="navbar-nav ms-auto">
          <div className="nav-item dropdown">
            <button
              className="nav-link dropdown-toggle d-flex align-items-center btn btn-link text-white text-decoration-none border-0"
              type="button"
              onClick={toggleDropdown}
              aria-expanded={dropdownOpen}
            >
              <div
                className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                style={{ width: "32px", height: "32px" }}
              >
                {userProfile?.profilePicture ? (
                  <img
                    src={userProfile.profilePicture}
                    alt="Profile"
                    className="rounded-circle"
                    style={{
                      width: "28px",
                      height: "28px",
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
              {/* Removed department display */}
              <li>
                <hr className="dropdown-divider" />
              </li>

              {/* Mobile Navigation Links */}
              <li className="d-lg-none">
                <button
                  className="dropdown-item"
                  type="button"
                  onClick={() => handleNavigation("/dashboard")}
                >
                  <i className="bi bi-house me-2"></i>
                  Dashboard
                </button>
              </li>

              <li>
                <button
                  className="dropdown-item"
                  type="button"
                  onClick={() => handleNavigation("/profile")}
                >
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
  );
};

export default Navigation;
