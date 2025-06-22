import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuth } from "../../contexts/AuthContext";
import { PageLoading } from "../ui/Loading";

const Layout = ({ title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default to open on desktop
  const [isMobile, setIsMobile] = useState(false);
  const { isLoading } = useAuth();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 992; // Bootstrap lg breakpoint
      setIsMobile(mobile);

      // On mobile, default to closed. On desktop, default to open
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Check on mount
    checkMobile();

    // Check on resize
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    console.log("Layout: Toggle sidebar called, current state:", sidebarOpen);
    setSidebarOpen((prev) => {
      const newState = !prev;
      console.log("Layout: New sidebar state:", newState);
      return newState;
    });
  };

  const closeSidebar = () => {
    console.log("Layout: Close sidebar called");
    setSidebarOpen(false);
  };

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          isMobile={isMobile}
        />

        {/* Main content */}
        <div
          className={`main-content ${
            sidebarOpen && !isMobile ? "with-sidebar" : "full-width"
          }`}
        >
          {/* Header with hamburger button */}
          <Header
            title={title}
            onMenuToggle={toggleSidebar}
            sidebarOpen={sidebarOpen}
          />

          {/* Page content */}
          <main className="p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
