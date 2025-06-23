import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = () => {
      console.log("AdminRoute: Checking admin role...", {
        user: user ? { email: user.email, role: user.role } : null,
        isAuthenticated,
        isLoading,
      });

      if (isLoading) {
        console.log("AdminRoute: AuthContext still loading...");
        return;
      }

      if (!isAuthenticated || !user) {
        console.log("AdminRoute: Not authenticated, will redirect to login");
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check if user has admin role or admin email
      const hasAdminRole =
        user.role === "admin" || user.email?.includes("admin@superadmin.com");
      console.log("AdminRoute: Admin role check:", hasAdminRole, {
        role: user.role,
        email: user.email,
        emailCheck: user.email?.includes("admin@superadmin.com"),
      });

      setIsAdmin(hasAdminRole);
      setLoading(false);
    };

    checkAdminRole();
  }, [user, isAuthenticated, isLoading]);

  console.log("AdminRoute: Current state:", {
    loading,
    isAdmin,
    user: user ? { email: user.email, role: user.role } : null,
    authLoading: isLoading,
    isAuthenticated,
  });
  if (isLoading || loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log("AdminRoute: Redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    console.log("AdminRoute: Not admin, redirecting to employee dashboard");
    return <Navigate to="/dashboard" replace />;
  }
  console.log("AdminRoute: Admin access granted");
  return children;
};

export default AdminRoute;
