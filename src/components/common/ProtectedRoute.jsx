import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PageLoading } from "@/components/ui/Loading";
import { ROUTES } from "@/constants";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoading />;
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (adminOnly && user?.role !== "admin") {
    // Redirect to dashboard if user is not admin
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

export default ProtectedRoute;
