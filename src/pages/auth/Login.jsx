import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      console.log("Login: Attempting login with:", { email: formData.email });

      const result = await login(formData);
      console.log("Login: Login result:", result);

      if (result.success && result.user) {
        // Get the intended destination or default based on user role
        const from = location.state?.from?.pathname;
        console.log("Login: Redirect from:", from);
        console.log("Login: User role:", result.user?.role);
        console.log("Login: User email:", result.user?.email);

        let redirectTo;
        // Check if user is admin
        const isAdmin =
          result.user.role === "admin" ||
          result.user.email === "admin@superadmin.com" ||
          result.user.email?.toLowerCase().includes("admin");

        console.log("Login: Is admin check:", isAdmin);

        if (from && from !== "/login" && from !== "/register") {
          // If there was an intended destination, go there
          redirectTo = from;
        } else if (isAdmin) {
          // If admin and no specific destination, go to admin dashboard
          redirectTo = "/admin/dashboard";
        } else {
          // Regular user goes to employee dashboard
          redirectTo = "/dashboard";
        }

        console.log("Login: Redirecting to:", redirectTo);

        // Add a small delay to ensure state is updated
        setTimeout(() => {
          navigate(redirectTo, { replace: true });
        }, 100);
      } else {
        console.error("Login: Login failed or no user data:", result);
        toast.error(result.error || "Login failed");
      }
    } catch (error) {
      console.error("Login: Error during login:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow">
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <h2 className="card-title">Sign In</h2>
                  <p className="text-muted">
                    Welcome back! Please sign in to your account.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>

                    <input
                      type="email"
                      className={`form-control ${
                        errors.email ? "is-invalid" : ""
                      }`}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>

                    <input
                      type="password"
                      className={`form-control ${
                        errors.password ? "is-invalid" : ""
                      }`}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      disabled={isLoading}
                    />
                    {errors.password && (
                      <div className="invalid-feedback">{errors.password}</div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <p className="mb-0">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-decoration-none">
                      Sign up here
                    </Link>
                  </p>
                </div>

                {/* Admin Test Credentials */}
                <div className="mt-4 p-3 bg-light rounded">
                  <small className="text-muted">
                    <strong>Test Credentials:</strong>
                    <br />
                    Admin: admin@superadmin.com / password
                    <br />
                    Employee: john.doe@example.com / SecurePassword123!
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
