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

// Components
import ProtectedRoute from "./components/common/ProtectedRoute";
import PublicRoute from "./components/common/PublicRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";

// Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import DashboardPage from "./pages/employee/DashboardPage";

// Constants
import { ROUTES } from "./constants";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
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
                  theme: {
                    primary: "green",
                    secondary: "black",
                  },
                },
                error: {
                  duration: 5000,
                  theme: {
                    primary: "red",
                    secondary: "black",
                  },
                },
              }}
            />

            {/* Routes */}
            <Routes>
              {/* Public Routes */}
              <Route
                path={ROUTES.LOGIN}
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path={ROUTES.REGISTER}
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path={ROUTES.DASHBOARD}
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route
                path="/"
                element={<Navigate to={ROUTES.DASHBOARD} replace />}
              />

              {/* Catch all route */}
              <Route
                path="*"
                element={<Navigate to={ROUTES.DASHBOARD} replace />}
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
