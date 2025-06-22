import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../contexts/AuthContext";
import { ButtonLoading } from "../../components/ui/Loading";
import { ROUTES } from "../../constants";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      position: "",
      phoneNumber: "",
    },
  });

  // Watch password for confirmation validation
  const password = watch("password");

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      clearErrors();
      clearError();

      console.log("Register form submitted:", {
        name: data.name,
        email: data.email,
        position: data.position,
      });

      const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        position: data.position,
        phoneNumber: data.phoneNumber,
      });

      if (result.success) {
        console.log("Registration successful");
        // Show success message and redirect to login
        navigate(ROUTES.LOGIN, {
          state: {
            message:
              "Registration successful! Please sign in with your credentials.",
            type: "success",
          },
        });
      } else {
        // Handle registration failure
        if (result.error.toLowerCase().includes("email")) {
          setError("email", {
            type: "manual",
            message: "This email is already registered",
          });
        } else {
          setError("root", {
            type: "manual",
            message: result.error || "Registration failed",
          });
        }
      }
    } catch (error) {
      console.error("Registration submission error:", error);
      setError("root", {
        type: "manual",
        message: "An unexpected error occurred",
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div
                    className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "60px", height: "60px" }}
                  >
                    <i
                      className="bi bi-person-plus"
                      style={{ fontSize: "24px" }}
                    ></i>
                  </div>
                  <h2 className="fw-bold text-dark mb-2">Create Account</h2>
                  <p className="text-muted">Join our WFH Attendance System</p>
                </div>

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

                {/* Registration Form */}
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  {/* Name Field */}
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label fw-semibold">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-person text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className={`form-control border-start-0 ${
                          errors.name ? "is-invalid" : ""
                        }`}
                        id="name"
                        placeholder="Enter your full name"
                        {...register("name", {
                          required: "Full name is required",
                          minLength: {
                            value: 2,
                            message: "Name must be at least 2 characters",
                          },
                          maxLength: {
                            value: 100,
                            message: "Name must not exceed 100 characters",
                          },
                        })}
                        disabled={isLoading || isSubmitting}
                      />
                      {errors.name && (
                        <div className="invalid-feedback">
                          {errors.name.message}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email Address <span className="text-danger">*</span>
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

                  {/* Position Field */}
                  <div className="mb-3">
                    <label
                      htmlFor="position"
                      className="form-label fw-semibold"
                    >
                      Position <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-briefcase text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className={`form-control border-start-0 ${
                          errors.position ? "is-invalid" : ""
                        }`}
                        id="position"
                        placeholder="e.g., Software Engineer, Marketing Manager"
                        {...register("position", {
                          required: "Position is required",
                          minLength: {
                            value: 2,
                            message: "Position must be at least 2 characters",
                          },
                        })}
                        disabled={isLoading || isSubmitting}
                      />
                      {errors.position && (
                        <div className="invalid-feedback">
                          {errors.position.message}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Phone Number Field */}
                  <div className="mb-3">
                    <label
                      htmlFor="phoneNumber"
                      className="form-label fw-semibold"
                    >
                      Phone Number
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-telephone text-muted"></i>
                      </span>
                      <input
                        type="tel"
                        className={`form-control border-start-0 ${
                          errors.phoneNumber ? "is-invalid" : ""
                        }`}
                        id="phoneNumber"
                        placeholder="Enter your phone number"
                        {...register("phoneNumber", {
                          pattern: {
                            value: /^[0-9+\-\s()]+$/,
                            message: "Please enter a valid phone number",
                          },
                        })}
                        disabled={isLoading || isSubmitting}
                      />
                      {errors.phoneNumber && (
                        <div className="invalid-feedback">
                          {errors.phoneNumber.message}
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
                      Password <span className="text-danger">*</span>
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
                        placeholder="Create a strong password"
                        {...register("password", {
                          required: "Password is required",
                          minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters",
                          },
                          pattern: {
                            value:
                              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                            message:
                              "Password must contain uppercase, lowercase, number and special character",
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

                  {/* Confirm Password Field */}
                  <div className="mb-4">
                    <label
                      htmlFor="password_confirmation"
                      className="form-label fw-semibold"
                    >
                      Confirm Password <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-lock-fill text-muted"></i>
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`form-control border-start-0 border-end-0 ${
                          errors.password_confirmation ? "is-invalid" : ""
                        }`}
                        id="password_confirmation"
                        placeholder="Confirm your password"
                        {...register("password_confirmation", {
                          required: "Please confirm your password",
                          validate: (value) =>
                            value === password || "Passwords do not match",
                        })}
                        disabled={isLoading || isSubmitting}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary border-start-0"
                        onClick={toggleConfirmPasswordVisibility}
                        disabled={isLoading || isSubmitting}
                      >
                        <i
                          className={`bi ${
                            showConfirmPassword ? "bi-eye-slash" : "bi-eye"
                          }`}
                        ></i>
                      </button>
                      {errors.password_confirmation && (
                        <div className="invalid-feedback">
                          {errors.password_confirmation.message}
                        </div>
                      )}
                    </div>
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
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>

                {/* Login Link */}
                <div className="text-center mt-4">
                  <p className="text-muted mb-0">
                    Already have an account?{" "}
                    <Link
                      to={ROUTES.LOGIN}
                      className="text-decoration-none fw-semibold"
                      tabIndex={isLoading || isSubmitting ? -1 : 0}
                    >
                      Sign in here
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

export default Register;
