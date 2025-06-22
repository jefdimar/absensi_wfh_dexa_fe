import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Sidebar = ({ isOpen, onClose, isMobile }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Debug logs
  useEffect(() => {
    console.log("Sidebar render - isOpen:", isOpen, "isMobile:", isMobile);
  }, [isOpen, isMobile]);

  // Close sidebar when clicking on a link (mobile only)
  const handleLinkClick = () => {
    if (isMobile) {
      onClose();
    }
  };

  // Close sidebar on escape key (mobile only)
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && isMobile) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, isMobile]);

  const employeeMenuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: "bi-house",
    },
    {
      name: "Profile",
      href: "/profile",
      icon: "bi-person",
    },
    {
      name: "Attendance",
      href: "/attendance",
      icon: "bi-clock",
    },
    {
      name: "Attendance Summary",
      href: "/attendance-summary",
      icon: "bi-bar-chart",
    },
  ];

  const adminMenuItems = [
    {
      name: "Admin Dashboard",
      href: "/admin/dashboard",
      icon: "bi-house",
    },
    {
      name: "Employees",
      href: "/admin/employees",
      icon: "bi-people",
    },
    {
      name: "All Attendance",
      href: "/admin/attendance",
      icon: "bi-calendar",
    },
  ];

  const menuItems = isAdmin ? adminMenuItems : employeeMenuItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && isMobile && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className="sidebar bg-white border-end"
        style={{
          position: isMobile ? "fixed" : "relative",
          zIndex: isMobile ? 1050 : "auto",
          width: isOpen ? "280px" : "60px",
          minHeight: "100vh",
          transform:
            isMobile && !isOpen ? "translateX(-100%)" : "translateX(0)",
          transition: "all 0.3s ease-in-out",
          display: "block",
          visibility: "visible",
        }}
      >
        {/* Sidebar header - NO hamburger button, just logo */}
        <div
          className="d-flex align-items-center justify-content-center p-3 border-bottom"
          style={{ minHeight: "60px" }}
        >
          {/* Logo and title - Show when expanded, just icon when collapsed */}
          {isOpen ? (
            <div className="d-flex align-items-center">
              <div className="bg-primary text-white rounded p-2 me-2">
                <i className="bi bi-clock"></i>
              </div>
              <h5 className="mb-0 fw-bold text-nowrap">WFH Attendance</h5>
            </div>
          ) : (
            <div className="bg-primary text-white rounded p-2">
              <i className="bi bi-clock"></i>
            </div>
          )}

          {/* Close button for mobile only */}
          {isMobile && isOpen && (
            <button
              onClick={onClose}
              className="btn btn-outline-secondary ms-auto"
              type="button"
              style={{ width: "36px", height: "36px" }}
            >
              <i className="bi bi-x"></i>
            </button>
          )}
        </div>

        {/* User info - Only show when expanded */}
        {isOpen && (
          <div className="p-3 border-bottom">
            <div className="d-flex align-items-center">
              <div
                className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                style={{ width: "40px", height: "40px" }}
              >
                <i className="bi bi-person"></i>
              </div>
              <div className="flex-grow-1 text-nowrap overflow-hidden">
                <div className="fw-semibold">{user?.name}</div>
                <small className="text-muted text-capitalize">
                  {user?.role}
                </small>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-3">
          <ul className="nav nav-pills flex-column">
            {menuItems.map((item) => (
              <li key={item.name} className="nav-item mb-1">
                <NavLink
                  to={item.href}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center ${
                      isActive ? "active" : "text-dark"
                    } ${!isOpen ? "justify-content-center" : ""}`
                  }
                  title={!isOpen ? item.name : ""}
                  style={{ minHeight: "40px" }}
                >
                  <i className={`${item.icon} ${isOpen ? "me-2" : ""}`}></i>
                  {isOpen && <span>{item.name}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer - Only show when expanded */}
        {isOpen && (
          <div className="position-absolute bottom-0 w-100 p-3 border-top">
            <small className="text-muted text-center d-block">
              © 2024 Dexa Group
            </small>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
