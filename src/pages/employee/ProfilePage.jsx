import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useProfile } from "../../hooks/useProfile";
import { PageLoading } from "../../components/ui/Loading";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    updateProfile,
    uploadPhoto,
    updatePassword,
    updatePhoneNumber,
    isUpdating,
    isUploading,
    isUpdatingPassword,
    isUpdatingPhone,
    error,
  } = useProfile();

  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    position: "",
    phoneNumber: "",
    department: "",
    employeeId: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Load user profile data
  useEffect(() => {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUserProfile(parsedUser);
        setProfileForm({
          name: parsedUser.name || "",
          email: parsedUser.email || "",
          position: parsedUser.position || "",
          phoneNumber: parsedUser.phoneNumber || "",
          department: parsedUser.department || "",
          employeeId: parsedUser.employeeId || "",
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
        setUserProfile(user);
      }
    } else {
      setUserProfile(user);
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest(".dropdown")) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  // Add backdrop for mobile dropdown
  useEffect(() => {
    if (dropdownOpen) {
      const backdrop = document.createElement("div");
      backdrop.className = "dropdown-backdrop";
      backdrop.onclick = () => setDropdownOpen(false);
      document.body.appendChild(backdrop);

      // Prevent body scroll when dropdown is open on mobile
      if (window.innerWidth <= 767) {
        document.body.style.overflow = "hidden";
      }

      return () => {
        document.body.removeChild(backdrop);
        document.body.style.overflow = "";
      };
    }
  }, [dropdownOpen]);

  // Add window resize handler to close dropdown
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 767 && dropdownOpen) {
        setDropdownOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dropdownOpen]);

  const handleDropdownToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("File size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      setPhotoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateProfile(profileForm);
      setIsEditing(false);

      // Update local user data
      const updatedUser = { ...userProfile, ...profileForm };
      setUserProfile(updatedUser);
      localStorage.setItem("user_data", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Profile update error:", error);
    }
  };

  const handlePhotoSubmit = async (e) => {
    e.preventDefault();

    if (!photoFile) {
      toast.error("Please select a photo first");
      return;
    }

    try {
      const result = await uploadPhoto(photoFile);

      // Update local user data with new photo URL
      const updatedUser = {
        ...userProfile,
        profilePicture: result.photoUrl || result.url,
      };
      setUserProfile(updatedUser);
      localStorage.setItem("user_data", JSON.stringify(updatedUser));

      // Reset photo states
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (error) {
      console.error("Photo upload error:", error);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      await updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      // Reset form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Password update error:", error);
    }
  };

  if (!userProfile) {
    return <PageLoading message="Loading profile..." />;
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container-fluid">
          <button
            className="btn btn-outline-light me-3"
            onClick={handleBackToDashboard}
            title="Back to Dashboard"
          >
            <i className="bi bi-arrow-left"></i>
            <span className="d-none d-sm-inline ms-1">Dashboard</span>
          </button>

          <a
            className="navbar-brand fw-bold"
            href="#!"
            onClick={(e) => e.preventDefault()}
          >
            <i className="bi bi-person-circle me-2 d-none d-sm-inline"></i>
            <span className="d-none d-sm-inline">Profile</span>
            <span className="d-sm-none">Profile</span>
          </a>

          <div className="navbar-nav ms-auto">
            <div className="nav-item dropdown">
              <button
                className="nav-link dropdown-toggle d-flex align-items-center btn btn-link text-white text-decoration-none border-0"
                type="button"
                onClick={handleDropdownToggle}
                aria-expanded={dropdownOpen}
              >
                <div
                  className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                  style={{ width: "32px", height: "32px" }}
                >
                  {userProfile?.profilePicture || userProfile?.avatar ? (
                    <img
                      src={userProfile.profilePicture || userProfile.avatar}
                      alt="Profile"
                      className="rounded-circle"
                      style={{
                        width: "30px",
                        height: "30px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <i className="bi bi-person-fill"></i>
                  )}
                </div>
                <span className="d-none d-md-inline">
                  {userProfile?.name?.split(" ")[0] || "User"}
                </span>
              </button>

              <ul
                className={`dropdown-menu dropdown-menu-end shadow ${
                  dropdownOpen ? "show" : ""
                }`}
                style={{ minWidth: "200px" }}
              >
                <li>
                  <h6 className="dropdown-header">
                    <i className="bi bi-person-circle me-2"></i>
                    {userProfile?.name || "User"}
                  </h6>
                </li>
                <li>
                  <span className="dropdown-item-text small text-muted">
                    <i className="bi bi-envelope me-2"></i>
                    {userProfile?.email || "No email"}
                  </span>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    className="dropdown-item text-danger"
                    type="button"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            {/* Profile Header */}
            <div className="card shadow-lg border-0 mb-4">
              <div className="card-body bg-gradient-primary text-white p-4">
                <div className="row align-items-center">
                  <div className="col-auto">
                    <div
                      className="bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center position-relative"
                      style={{ width: "80px", height: "80px" }}
                    >
                      {userProfile?.profilePicture || userProfile?.avatar ? (
                        <img
                          src={userProfile.profilePicture || userProfile.avatar}
                          alt="Profile"
                          className="rounded-circle"
                          style={{
                            width: "70px",
                            height: "70px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <i
                          className="bi bi-person-fill text-white"
                          style={{ fontSize: "2.5rem" }}
                        ></i>
                      )}
                    </div>
                  </div>
                  <div className="col">
                    <h2 className="fw-bold mb-1">
                      {userProfile?.name || "User"}
                    </h2>
                    <p className="mb-1 opacity-90">
                      {userProfile?.position || "Employee"}
                    </p>
                    <p className="mb-0 opacity-75 small">
                      {userProfile?.email || "No email"}
                    </p>
                  </div>
                  <div className="col-auto">
                    <button
                      className="btn btn-outline-light"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <i
                        className={`bi ${
                          isEditing ? "bi-x" : "bi-pencil"
                        } me-1`}
                      ></i>
                      {isEditing ? "Cancel" : "Edit"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Tabs */}
            <div className="card shadow-sm">
              <div className="card-header bg-white border-bottom">
                <ul className="nav nav-tabs card-header-tabs" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${
                        activeTab === "profile" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("profile")}
                      type="button"
                    >
                      <i className="bi bi-person me-2"></i>
                      Profile Info
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${
                        activeTab === "photo" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("photo")}
                      type="button"
                    >
                      <i className="bi bi-camera me-2"></i>
                      Photo
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${
                        activeTab === "security" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("security")}
                      type="button"
                    >
                      <i className="bi bi-shield-lock me-2"></i>
                      Security
                    </button>
                  </li>
                </ul>
              </div>

              <div className="card-body">
                {/* Profile Info Tab */}
                {activeTab === "profile" && (
                  <div>
                    <h5 className="mb-4">
                      <i className="bi bi-person-lines-fill me-2"></i>
                      Personal Information
                    </h5>

                    {error && (
                      <div className="alert alert-danger" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error.message || "An error occurred"}
                      </div>
                    )}

                    <form onSubmit={handleProfileSubmit}>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label htmlFor="name" className="form-label">
                            <i className="bi bi-person me-1"></i>
                            Full Name
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                            value={profileForm.name}
                            onChange={handleProfileFormChange}
                            disabled={!isEditing}
                            required
                          />
                        </div>

                        <div className="col-md-6">
                          <label htmlFor="email" className="form-label">
                            <i className="bi bi-envelope me-1"></i>
                            Email Address
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            value={profileForm.email}
                            onChange={handleProfileFormChange}
                            disabled={!isEditing}
                            required
                          />
                        </div>

                        <div className="col-md-6">
                          <label htmlFor="position" className="form-label">
                            <i className="bi bi-briefcase me-1"></i>
                            Position
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="position"
                            name="position"
                            value={profileForm.position}
                            onChange={handleProfileFormChange}
                            disabled={!isEditing}
                          />
                        </div>

                        <div className="col-md-6">
                          <label htmlFor="phoneNumber" className="form-label">
                            <i className="bi bi-telephone me-1"></i>
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            className="form-control"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={profileForm.phoneNumber}
                            onChange={handleProfileFormChange}
                            disabled={!isEditing}
                          />
                        </div>

                        <div className="col-md-6">
                          <label htmlFor="department" className="form-label">
                            <i className="bi bi-building me-1"></i>
                            Department
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="department"
                            name="department"
                            value={profileForm.department}
                            onChange={handleProfileFormChange}
                            disabled={!isEditing}
                          />
                        </div>

                        <div className="col-md-6">
                          <label htmlFor="employeeId" className="form-label">
                            <i className="bi bi-id-card me-1"></i>
                            Employee ID
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="employeeId"
                            name="employeeId"
                            value={profileForm.employeeId}
                            onChange={handleProfileFormChange}
                            disabled={true}
                          />
                        </div>
                      </div>

                      {isEditing && (
                        <div className="d-flex justify-content-end mt-4">
                          <button
                            type="button"
                            className="btn btn-outline-secondary me-2"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!isEditing}
                          >
                            Save Changes
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                )}

                {/* Photo Tab */}
                {activeTab === "photo" && (
                  <div>
                    <h5 className="mb-4">
                      <i className="bi bi-camera-fill me-2"></i>
                      Profile Photo
                    </h5>

                    <div className="row">
                      <div className="col-md-4">
                        <div className="text-center mb-4">
                          <div
                            className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                            style={{ width: "150px", height: "150px" }}
                          >
                            {photoPreview ? (
                              <img
                                src={photoPreview}
                                alt="Preview"
                                className="rounded-circle"
                                style={{
                                  width: "140px",
                                  height: "140px",
                                  objectFit: "cover",
                                }}
                              />
                            ) : userProfile?.profilePicture ||
                              userProfile?.avatar ? (
                              <img
                                src={
                                  userProfile.profilePicture ||
                                  userProfile.avatar
                                }
                                alt="Current Profile"
                                className="rounded-circle"
                                style={{
                                  width: "140px",
                                  height: "140px",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <i
                                className="bi bi-person-fill text-muted"
                                style={{ fontSize: "4rem" }}
                              ></i>
                            )}
                          </div>
                          <p className="text-muted small">
                            Current profile photo
                          </p>
                        </div>
                      </div>

                      <div className="col-md-8">
                        <form onSubmit={handlePhotoSubmit}>
                          <div className="mb-3">
                            <label htmlFor="photoFile" className="form-label">
                              <i className="bi bi-upload me-1"></i>
                              Choose New Photo
                            </label>
                            <input
                              type="file"
                              className="form-control"
                              id="photoFile"
                              accept="image/*"
                              onChange={handlePhotoChange}
                            />
                            <div className="form-text">
                              <i className="bi bi-info-circle me-1"></i>
                              Maximum file size: 5MB. Supported formats: JPG,
                              PNG, GIF
                            </div>
                          </div>

                          {photoFile && (
                            <div className="alert alert-info">
                              <i className="bi bi-file-earmark-image me-2"></i>
                              Selected: {photoFile.name} (
                              {(photoFile.size / 1024 / 1024).toFixed(2)} MB)
                            </div>
                          )}

                          <button
                            type="submit"
                            className="btn btn-primary me-2"
                            disabled={!photoFile || isUploading}
                          >
                            {isUploading ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                ></span>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-cloud-upload me-2"></i>
                                Upload Photo
                              </>
                            )}
                          </button>

                          {photoFile && (
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => {
                                setPhotoFile(null);
                                setPhotoPreview(null);
                              }}
                            >
                              Clear Selection
                            </button>
                          )}
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <div>
                    <h5 className="mb-4">
                      <i className="bi bi-shield-lock-fill me-2"></i>
                      Security Settings
                    </h5>

                    <div className="row">
                      <div className="col-md-8">
                        <form onSubmit={handlePasswordSubmit}>
                          <div className="mb-3">
                            <label
                              htmlFor="currentPassword"
                              className="form-label"
                            >
                              <i className="bi bi-key me-1"></i>
                              Current Password
                            </label>
                            <input
                              type="password"
                              className="form-control"
                              id="currentPassword"
                              name="currentPassword"
                              value={passwordForm.currentPassword}
                              onChange={handlePasswordFormChange}
                              required
                            />
                          </div>

                          <div className="mb-3">
                            <label htmlFor="newPassword" className="form-label">
                              <i className="bi bi-lock me-1"></i>
                              New Password
                            </label>
                            <input
                              type="password"
                              className="form-control"
                              id="newPassword"
                              name="newPassword"
                              value={passwordForm.newPassword}
                              onChange={handlePasswordFormChange}
                              minLength="8"
                              required
                            />
                            <div className="form-text">
                              Password must be at least 8 characters long
                            </div>
                          </div>

                          <div className="mb-3">
                            <label
                              htmlFor="confirmPassword"
                              className="form-label"
                            >
                              <i className="bi bi-lock-fill me-1"></i>
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              className="form-control"
                              id="confirmPassword"
                              name="confirmPassword"
                              value={passwordForm.confirmPassword}
                              onChange={handlePasswordFormChange}
                              minLength="8"
                              required
                            />
                            {passwordForm.newPassword &&
                              passwordForm.confirmPassword &&
                              passwordForm.newPassword !==
                                passwordForm.confirmPassword && (
                                <div className="text-danger small mt-1">
                                  <i className="bi bi-exclamation-triangle me-1"></i>
                                  Passwords do not match
                                </div>
                              )}
                          </div>

                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={
                              isUpdatingPassword ||
                              !passwordForm.currentPassword ||
                              !passwordForm.newPassword ||
                              !passwordForm.confirmPassword ||
                              passwordForm.newPassword !==
                                passwordForm.confirmPassword
                            }
                          >
                            {isUpdatingPassword ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                ></span>
                                Updating Password...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-shield-check me-2"></i>
                                Update Password
                              </>
                            )}
                          </button>
                        </form>
                      </div>

                      <div className="col-md-4">
                        <div className="card bg-light">
                          <div className="card-body">
                            <h6 className="card-title">
                              <i className="bi bi-info-circle me-2"></i>
                              Password Requirements
                            </h6>
                            <ul className="list-unstyled small mb-0">
                              <li className="mb-1">
                                <i className="bi bi-check-circle text-success me-1"></i>
                                At least 8 characters long
                              </li>
                              <li className="mb-1">
                                <i className="bi bi-check-circle text-success me-1"></i>
                                Mix of uppercase and lowercase
                              </li>
                              <li className="mb-1">
                                <i className="bi bi-check-circle text-success me-1"></i>
                                Include numbers
                              </li>
                              <li>
                                <i className="bi bi-check-circle text-success me-1"></i>
                                Include special characters
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
