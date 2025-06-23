import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Context Providers
import { AuthProvider } from "./contexts/AuthContext";
import { ProfileProvider } from "./contexts/ProfileContext";
import { useAuth } from "./contexts/AuthContext";

// Components
import ProtectedRoute from "./components/common/ProtectedRoute";
import PublicRoute from "./components/common/PublicRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";
import AdminRoute from "./components/common/AdminRoute";

// Pages - Employee
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import DashboardPage from "./pages/employee/DashboardPage";
import ProfilePage from "./pages/employee/ProfilePage";

// Pages - Admin
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminEmployeesPage from "./pages/admin/AdminEmployeesPage";
import AdminAttendancePage from "./pages/admin/AdminAttendancePage";

// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles/dashboard.css";
// Dashboard Router Component - This will redirect based on user role
const DashboardRouter = () => {
  const { user, isLoading } = useAuth();

  console.log("DashboardRouter: User role:", user?.role, "Loading:", isLoading);

  // Show loading while checking user role
  if (isLoading) {
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

  // If user is admin, redirect to admin dashboard
  if (user?.role === "admin") {
    console.log("DashboardRouter: Redirecting to admin dashboard");
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Otherwise, show employee dashboard
  console.log("DashboardRouter: Showing employee dashboard");
  return <DashboardPage />;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ProfileProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <Navigate to="/admin/dashboard" replace />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminRoute>
                      <AdminDashboardPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/employees"
                  element={
                    <AdminRoute>
                      <AdminEmployeesPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/attendance"
                  element={
                    <AdminRoute>
                      <AdminAttendancePage />
                    </AdminRoute>
                  }
                />

                {/* Protected Routes - Smart Dashboard Routing */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <DashboardRouter />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardRouter />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch all route */}
                <Route
                  path="*"
                  element={
                    <ProtectedRoute>
                      <DashboardRouter />
                    </ProtectedRoute>
                  }
                />
              </Routes>

              {/* Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#363636",
                    color: "#fff",
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: "#4aed88",
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: "#ff6b6b",
                    },
                  },
                  loading: {
                    duration: 2000,
                    iconTheme: {
                      primary: "#4f46e5",
                    },
                  },
                }}
              />
            </div>
          </Router>
        </ProfileProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
