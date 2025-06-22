import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../contexts/AuthContext";
import { ButtonLoading } from "../../components/ui/Loading";
import { ROUTES } from "../../constants";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user was trying to access before login
  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;
  // Get success message from registration
  const successMessage = location.state?.message;
  const messageType = location.state?.type;

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      clearErrors();
      clearError();

      console.log("Login form submitted:", { email: data.email });

      const result = await login({
        email: data.email,
        password: data.password,
      });

      if (result.success) {
        console.log("Login successful, redirecting to:", from);
        navigate(from, { replace: true });
      } else {
        // Handle login failure
        setError("root", {
          type: "manual",
          message: result.error || "Login failed",
        });
      }
    } catch (error) {
      console.error("Login submission error:", error);
      setError("root", {
        type: "manual",
        message: "An unexpected error occurred",
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div
                    className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "60px", height: "60px" }}
                  >
                    <i className="bi bi-clock" style={{ fontSize: "24px" }}></i>
                  </div>
                  <h2 className="fw-bold text-dark mb-2">Welcome Back</h2>
                  <p className="text-muted">
                    Sign in to your WFH Attendance account
                  </p>
                </div>

                {/* Success Alert (from registration) */}
                {successMessage && messageType === "success" && (
                  <div
                    className="alert alert-success d-flex align-items-center mb-4"
                    role="alert"
                  >
                    <i className="bi bi-check-circle-fill me-2"></i>
                    <div>{successMessage}</div>
                  </div>
                )}

                {/* Error Alert */}
                {(error || errors.root) && (
                  <div
                    className="alert alert-danger d-flex align-items-center mb-4"
                    role="alert"
                  >
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>{error || errors.root?.message}</div>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  {/* Email Field */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email Address
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-envelope text-muted"></i>
                      </span>
                      <input
                        type="email"
                        className={`form-control border-start-0 ${
                          errors.email ? "is-invalid" : ""
                        }`}
                        id="email"
                        placeholder="Enter your email"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Please enter a valid email address",
                          },
                        })}
                        disabled={isLoading || isSubmitting}
                      />
                      {errors.email && (
                        <div className="invalid-feedback">
                          {errors.email.message}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="mb-3">
                    <label
                      htmlFor="password"
                      className="form-label fw-semibold"
                    >
                      Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-lock text-muted"></i>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control border-start-0 border-end-0 ${
                          errors.password ? "is-invalid" : ""
                        }`}
                        id="password"
                        placeholder="Enter your password"
                        {...register("password", {
                          required: "Password is required",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                        })}
                        disabled={isLoading || isSubmitting}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary border-start-0"
                        onClick={togglePasswordVisibility}
                        disabled={isLoading || isSubmitting}
                      >
                        <i
                          className={`bi ${
                            showPassword ? "bi-eye-slash" : "bi-eye"
                          }`}
                        ></i>
                      </button>
                      {errors.password && (
                        <div className="invalid-feedback">
                          {errors.password.message}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="remember"
                        {...register("remember")}
                        disabled={isLoading || isSubmitting}
                      />
                      <label
                        className="form-check-label text-muted"
                        htmlFor="remember"
                      >
                        Remember me
                      </label>
                    </div>
                    <Link
                      to="/forgot-password"
                      className="text-decoration-none small"
                      tabIndex={isLoading || isSubmitting ? -1 : 0}
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 fw-semibold"
                    disabled={isLoading || isSubmitting}
                  >
                    {isLoading || isSubmitting ? (
                      <>
                        <ButtonLoading />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>

                {/* Register Link */}
                <div className="text-center mt-4">
                  <p className="text-muted mb-0">
                    Don't have an account?{" "}
                    <Link
                      to={ROUTES.REGISTER}
                      className="text-decoration-none fw-semibold"
                      tabIndex={isLoading || isSubmitting ? -1 : 0}
                    >
                      Sign up here
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
              <small className="text-muted">
                © 2024 Dexa Group. All rights reserved.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
