import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

const Header = ({ title = "Dashboard", onMenuToggle, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleMenuToggle = () => {
    console.log("Header: Menu toggle button clicked!");
    if (onMenuToggle) {
      onMenuToggle();
    }
  };

  return (
    <header className="bg-white shadow-sm border-bottom w-100">
      <div className="container-fluid">
        <div className="d-flex align-items-center justify-content-between p-3">
          {/* Left side - Hamburger button and title */}
          <div className="d-flex align-items-center">
            {/* Hamburger toggle button */}
            <button
              onClick={handleMenuToggle}
              className="btn btn-outline-secondary d-flex align-items-center justify-content-center hamburger-btn me-3"
              type="button"
              title={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
              style={{
                width: "40px",
                height: "40px",
                flexShrink: 0,
                border: "1px solid #dee2e6",
                borderRadius: "6px",
              }}
            >
              {/* Hamburger icon - 3 lines */}
              <div className="hamburger-icon">
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
              </div>
            </button>

            <h4 className="mb-0 fw-bold text-dark">{title}</h4>
          </div>

          {/* Right side */}
          <div className="d-flex align-items-center">
            {/* Notifications */}
            <button
              className="btn btn-outline-secondary me-2"
              type="button"
              style={{ width: "40px", height: "40px" }}
            >
              <i className="bi bi-bell"></i>
            </button>

            {/* User menu */}
            <div className="dropdown" ref={dropdownRef}>
              <button
                className="btn btn-outline-secondary d-flex align-items-center px-3"
                onClick={toggleUserMenu}
                type="button"
                style={{ height: "40px" }}
              >
                <div
                  className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                  style={{ width: "32px", height: "32px" }}
                >
                  <i className="bi bi-person" style={{ fontSize: "14px" }}></i>
                </div>
                <span className="d-none d-md-block me-1">
                  {user?.name || "User"}
                </span>
                <i className="bi bi-chevron-down"></i>
              </button>

              {/* Dropdown menu */}
              <ul
                className={`dropdown-menu dropdown-menu-end ${
                  showUserMenu ? "show" : ""
                }`}
                style={{ position: "absolute", zIndex: 1000 }}
              >
                <li>
                  <div className="dropdown-header">
                    <div className="fw-semibold">{user?.name}</div>
                    <small className="text-muted">{user?.email}</small>
                  </div>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                    type="button"
                  >
                    <i className="bi bi-gear me-2"></i>
                    Profile Settings
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={handleLogout}
                    type="button"
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Sign out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
