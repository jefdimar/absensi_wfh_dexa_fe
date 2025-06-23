import React, { useState, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const AppLayout = ({ children, title, subtitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [logout, navigate]);

  const toggleDropdown = useCallback(() => {
    setDropdownOpen((prev) => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setDropdownOpen(false);
  }, []);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest(".dropdown")) {
        closeDropdown();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen, closeDropdown]);

  const isActivePage = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container-fluid">
          <a
            className="navbar-brand fw-bold"
            href="#!"
            onClick={() => navigate("/dashboard")}
          >
            <i className="bi bi-clock-history me-2 d-none d-sm-inline"></i>
            <span className="d-none d-sm-inline">WFH Attendance</span>
            <span className="d-sm-none">WFH</span>
          </a>

          {/* Navigation Links */}
          <div className="navbar-nav me-auto d-none d-lg-flex">
            <button
              className={`nav-link btn btn-link text-white text-decoration-none border-0 ${
                isActivePage("/dashboard") ? "active" : ""
              }`}
              onClick={() => navigate("/dashboard")}
            >
              <i className="bi bi-speedometer2 me-1"></i>
              Dashboard
            </button>
            <button
              className={`nav-link btn btn-link text-white text-decoration-none border-0 ${
                isActivePage("/profile") ? "active" : ""
              }`}
              onClick={() => navigate("/profile")}
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
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
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
                  {user?.name?.split(" ")[0] || "User"}
                </span>
              </button>

              <ul
                className={`dropdown-menu dropdown-menu-end shadow ${
                  dropdownOpen ? "show" : ""
                }`}
              >
                <li>
                  <h6 className="dropdown-header">
                    <i className="bi bi-person-circle me-2"></i>
                    {user?.name || "User"}
                  </h6>
                </li>
                <li>
                  <span className="dropdown-item-text small text-muted">
                    <i className="bi bi-envelope me-2"></i>
                    {user?.email || "No email"}
                  </span>
                </li>
                <li>
                  <span className="dropdown-item-text small text-muted">
                    <i className="bi bi-briefcase me-2"></i>
                    {user?.position || "No position"}
                  </span>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>

                {/* Mobile Navigation Links */}
                <li className="d-lg-none">
                  <button
                    className="dropdown-item"
                    type="button"
                    onClick={() => {
                      navigate("/dashboard");
                      closeDropdown();
                    }}
                  >
                    <i className="bi bi-speedometer2 me-2"></i>
                    Dashboard
                  </button>
                </li>
                <li className="d-lg-none">
                  <button
                    className="dropdown-item"
                    type="button"
                    onClick={() => {
                      navigate("/profile");
                      closeDropdown();
                    }}
                  >
                    <i className="bi bi-person me-2"></i>
                    Profile
                  </button>
                </li>
                <li className="d-lg-none">
                  <hr className="dropdown-divider" />
                </li>

                <li>
                  <button
                    className="dropdown-item"
                    type="button"
                    onClick={() => {
                      navigate("/profile");
                      closeDropdown();
                    }}
                  >
                    <i className="bi bi-gear me-2"></i>
                    Settings
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item text-danger"
                    type="button"
                    onClick={() => {
                      handleLogout();
                      closeDropdown();
                    }}
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

      {/* Page Header */}
      {(title || subtitle) && (
        <div className="bg-white border-bottom">
          <div className="container-fluid py-3">
            <div className="row align-items-center">
              <div className="col">
                {title && <h1 className="h3 mb-0 text-gray-800">{title}</h1>}
                {subtitle && <p className="text-muted mb-0 mt-1">{subtitle}</p>}
              </div>
              <div className="col-auto">
                {/* Breadcrumb or additional actions can go here */}
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                      <button
                        className="btn btn-link p-0 text-decoration-none"
                        onClick={() => navigate("/dashboard")}
                      >
                        Dashboard
                      </button>
                    </li>
                    {location.pathname !== "/dashboard" && (
                      <li
                        className="breadcrumb-item active"
                        aria-current="page"
                      >
                        {title || "Page"}
                      </li>
                    )}
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container-fluid py-3 py-md-4">{children}</main>
    </div>
  );
};

export default AppLayout;
