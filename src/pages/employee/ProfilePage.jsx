import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useProfile } from "../../hooks/useProfile";
import { PageLoading } from "../../components/ui/Loading";
import AppLayout from "../../components/layout/AppLayout";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { user } = useAuth();
  const {
    profileData,
    isLoading,
    error,
    isUpdating,
    isUploading,
    isUpdatingPassword,
    isUpdatingPhone,
    isDeletingPhoto,
    loadProfile,
    updateProfile,
    uploadPhoto,
    deletePhoto,
    updatePassword,
    updatePhoneNumber,
    getProfileCompletion,
    clearError,
  } = useProfile();

  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    position: "",
    phoneNumber: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Initialize profile form when profile data loads
  useEffect(() => {
    if (profileData) {
      setProfileForm({
        name: profileData.name || "",
        email: profileData.email || "",
        position: profileData.position || "",
        phoneNumber: profileData.phoneNumber || "",
      });
    }
  }, [profileData]);

  // Load profile data on component mount
  useEffect(() => {
    if (!profileData) {
      loadProfile();
    }
  }, [profileData, loadProfile]);

  // Handle profile form input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Handle password form input changes
  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Handle photo file selection
  const handlePhotoChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
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
  }, []);

  // Handle profile form submission
  const handleProfileSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        await updateProfile(profileForm);
        setIsEditing(false);
      } catch (error) {
        console.error("Profile update failed:", error);
      }
    },
    [profileForm, updateProfile]
  );

  // Handle photo upload
  const handlePhotoUpload = useCallback(async () => {
    if (!photoFile) return;

    try {
      await uploadPhoto(photoFile);
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (error) {
      console.error("Photo upload failed:", error);
    }
  }, [photoFile, uploadPhoto]);

  // Handle photo deletion
  const handleDeletePhoto = useCallback(async () => {
    if (window.confirm("Are you sure you want to delete your profile photo?")) {
      try {
        await deletePhoto();
        setPhotoPreview(null);
      } catch (error) {
        console.error("Photo deletion failed:", error);
      }
    }
  }, [deletePhoto]);

  // Handle password change
  const handlePasswordSubmit = useCallback(
    async (e) => {
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

        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (error) {
        console.error("Password update failed:", error);
      }
    },
    [passwordForm, updatePassword]
  );

  // Handle edit toggle
  const handleEditToggle = useCallback(() => {
    if (isEditing) {
      // Reset form to original values when canceling
      if (profileData) {
        setProfileForm({
          name: profileData.name || "",
          email: profileData.email || "",
          position: profileData.position || "",
          phoneNumber: profileData.phoneNumber || "",
        });
      }
    }
    setIsEditing(!isEditing);
  }, [isEditing, profileData]);

  // Calculate profile completion percentage
  const profileCompletion = useCallback(() => {
    return getProfileCompletion();
  }, [getProfileCompletion]);

  if (isLoading && !profileData) {
    return <PageLoading message="Loading profile..." />;
  }

  return (
    <AppLayout
      title="Profile"
      subtitle="Manage your account information and settings"
    >
      {/* Profile Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-lg border-0 profile-header">
            <div className="card-body text-white p-4">
              <div className="row align-items-center">
                <div className="col-auto">
                  <div className="position-relative profile-picture-container">
                    <div
                      className="bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center position-relative"
                      style={{ width: "100px", height: "100px" }}
                    >
                      {profileData?.profilePicture || photoPreview ? (
                        <img
                          src={photoPreview || profileData.profilePicture}
                          alt="Profile"
                          className="rounded-circle"
                          style={{
                            width: "90px",
                            height: "90px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <i
                          className="bi bi-person-fill text-white"
                          style={{ fontSize: "3rem" }}
                        ></i>
                      )}
                    </div>

                    {/* Enhanced Photo Upload Overlay */}
                    <div className="profile-picture-overlay">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="d-none"
                        id="photo-upload"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center rounded-circle cursor-pointer text-white"
                        style={{
                          background: "rgba(0, 0, 0, 0.7)",
                          opacity: 0,
                          transition: "opacity 0.3s ease",
                        }}
                        onMouseEnter={(e) => (e.target.style.opacity = 1)}
                        onMouseLeave={(e) => (e.target.style.opacity = 0)}
                      >
                        <i className="bi bi-camera fs-4 mb-1"></i>
                        <small
                          className="text-center"
                          style={{ fontSize: "0.7rem" }}
                        >
                          Change Photo
                        </small>
                      </label>
                    </div>

                    {/* Photo Action Buttons - Always Visible */}
                    <div className="mt-2 d-flex gap-1 justify-content-center">
                      <button
                        className="btn btn-outline-light btn-sm"
                        onClick={() =>
                          document.getElementById("photo-upload").click()
                        }
                        title="Upload new photo"
                      >
                        <i className="bi bi-camera"></i>
                      </button>
                      {profileData?.profilePicture && (
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={handleDeletePhoto}
                          disabled={isDeletingPhoto}
                          title="Delete current photo"
                        >
                          {isDeletingPhoto ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            <i className="bi bi-trash"></i>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col">
                  <h1 className="fw-bold mb-2">
                    {profileData?.name || "User Profile"}
                  </h1>
                  <p className="mb-2 opacity-90">
                    {profileData?.position || "Employee"}
                  </p>
                  <p className="mb-0 opacity-75">
                    <i className="bi bi-envelope me-2"></i>
                    {profileData?.email || "No email"}
                  </p>
                </div>
                <div className="col-auto">
                  <div className="text-center">
                    <div className="fs-2 fw-bold">{profileCompletion()}%</div>
                    <small className="opacity-75">Profile Complete</small>
                    <div className="progress mt-2" style={{ width: "100px" }}>
                      <div
                        className="progress-bar bg-success"
                        style={{ width: `${profileCompletion()}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Photo Upload Actions */}
              {photoFile && (
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="alert alert-info d-flex align-items-center">
                      <i className="bi bi-info-circle me-2"></i>
                      <div className="flex-grow-1">
                        <strong>New photo selected:</strong> {photoFile.name}
                      </div>
                      <div className="d-flex gap-2 ms-3">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={handlePhotoUpload}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check me-2"></i>
                              Save Photo
                            </>
                          )}
                        </button>
                        <button
                          className="btn btn-outline-light btn-sm"
                          onClick={() => {
                            setPhotoFile(null);
                            setPhotoPreview(null);
                          }}
                          disabled={isUploading}
                        >
                          <i className="bi bi-x me-1"></i>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add a dedicated Photo Management Section in Profile Tab */}
      {activeTab === "profile" && (
        <div className="tab-pane fade show active">
          <div className="row">
            {/* Photo Management Card */}
            <div className="col-12 mb-4">
              <div className="card shadow-sm">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-image me-2"></i>
                    Profile Photo
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-auto">
                      <div className="position-relative">
                        <div
                          className="border rounded-circle d-flex align-items-center justify-content-center bg-light"
                          style={{ width: "80px", height: "80px" }}
                        >
                          {profileData?.profilePicture || photoPreview ? (
                            <img
                              src={photoPreview || profileData.profilePicture}
                              alt="Profile"
                              className="rounded-circle"
                              style={{
                                width: "70px",
                                height: "70px",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <i className="bi bi-person-fill text-muted fs-2"></i>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col">
                      <h6 className="mb-2">
                        {profileData?.profilePicture
                          ? "Current Profile Photo"
                          : "No Profile Photo"}
                      </h6>
                      <p className="text-muted small mb-3">
                        Upload a professional photo to help colleagues recognize
                        you. Recommended size: 400x400px. Max file size: 5MB.
                      </p>
                      <div className="d-flex gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="d-none"
                          id="photo-upload-main"
                        />
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() =>
                            document.getElementById("photo-upload-main").click()
                          }
                        >
                          <i className="bi bi-upload me-2"></i>
                          {profileData?.profilePicture
                            ? "Change Photo"
                            : "Upload Photo"}
                        </button>
                        {profileData?.profilePicture && (
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={handleDeletePhoto}
                            disabled={isDeletingPhoto}
                          >
                            {isDeletingPhoto ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-trash me-2"></i>
                                Remove Photo
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Photo Preview and Actions */}
                  {photoFile && (
                    <div className="row mt-4">
                      <div className="col-12">
                        <div className="border rounded p-3 bg-light">
                          <div className="row align-items-center">
                            <div className="col-auto">
                              <div
                                className="border rounded-circle bg-white d-flex align-items-center justify-content-center"
                                style={{ width: "60px", height: "60px" }}
                              >
                                <img
                                  src={photoPreview}
                                  alt="Preview"
                                  className="rounded-circle"
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    objectFit: "cover",
                                  }}
                                />
                              </div>
                            </div>
                            <div className="col">
                              <h6 className="mb-1">New Photo Preview</h6>
                              <p className="text-muted small mb-0">
                                <strong>File:</strong> {photoFile.name} (
                                {(photoFile.size / 1024 / 1024).toFixed(2)} MB)
                              </p>
                            </div>
                            <div className="col-auto">
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={handlePhotoUpload}
                                  disabled={isUploading}
                                >
                                  {isUploading ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-2"></span>
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <i className="bi bi-check-lg me-2"></i>
                                      Save Photo
                                    </>
                                  )}
                                </button>
                                <button
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => {
                                    setPhotoFile(null);
                                    setPhotoPreview(null);
                                  }}
                                  disabled={isUploading}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rest of your existing profile form... */}
            <div className="col-lg-8">
              {/* Your existing Personal Information card */}
            </div>
            <div className="col-lg-4">
              {/* Your existing Profile Tips card */}
            </div>
          </div>
        </div>
      )}
      {/* Error Alert */}
      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div
              className="alert alert-danger alert-dismissible fade show"
              role="alert"
            >
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={clearError}
                aria-label="Close"
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-tabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${
                  activeTab === "profile" ? "active" : ""
                }`}
                onClick={() => setActiveTab("profile")}
                type="button"
                role="tab"
              >
                <i className="bi bi-person-lines-fill me-2"></i>
                <span>Profile</span>
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${
                  activeTab === "security" ? "active" : ""
                }`}
                onClick={() => setActiveTab("security")}
                type="button"
                role="tab"
              >
                <i className="bi bi-shield-lock me-2"></i>
                <span>Security</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Profile Information Tab */}
        {activeTab === "profile" && (
          <div className="tab-pane fade show active">
            <div className="row">
              <div className="col-lg-8">
                <div className="card shadow-sm">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">
                      <i className="bi bi-person-lines-fill me-2"></i>
                      Personal Information
                    </h5>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={handleEditToggle}
                      disabled={isUpdating}
                    >
                      {isEditing ? (
                        <>
                          <i className="bi bi-x me-1"></i>
                          Cancel
                        </>
                      ) : (
                        <>
                          <i className="bi bi-pencil me-1"></i>
                          Edit
                        </>
                      )}
                    </button>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleProfileSubmit}>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label htmlFor="name" className="form-label">
                            Full Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                            value={profileForm.name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="email" className="form-label">
                            Email Address <span className="text-danger">*</span>
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            value={profileForm.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="position" className="form-label">
                            Position
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="position"
                            name="position"
                            value={profileForm.position}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="phoneNumber" className="form-label">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            className="form-control"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={profileForm.phoneNumber}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      {isEditing && (
                        <div className="mt-4">
                          <button
                            type="submit"
                            className="btn btn-primary me-2"
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Updating...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check-lg me-2"></i>
                                Update Profile
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleEditToggle}
                            disabled={isUpdating}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card shadow-sm">
                  <div className="card-header">
                    <h5 className="card-title mb-0">
                      <i className="bi bi-info-circle me-2"></i>
                      Profile Tips
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex align-items-start mb-3">
                      <i className="bi bi-lightbulb text-warning me-2 mt-1"></i>
                      <div>
                        <strong>Complete your profile</strong>
                        <p className="small text-muted mb-0">
                          A complete profile helps your colleagues find and
                          contact you.
                        </p>
                      </div>
                    </div>
                    <div className="d-flex align-items-start mb-3">
                      <i className="bi bi-camera text-info me-2 mt-1"></i>
                      <div>
                        <strong>Add a profile photo</strong>
                        <p className="small text-muted mb-0">
                          Upload a professional photo to personalize your
                          profile.
                        </p>
                      </div>
                    </div>
                    <div className="d-flex align-items-start">
                      <i className="bi bi-shield-check text-success me-2 mt-1"></i>
                      <div>
                        <strong>Keep information current</strong>
                        <p className="small text-muted mb-0">
                          Update your details when they change to stay
                          connected.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="tab-pane fade show active">
            <div className="row">
              <div className="col-lg-8">
                <div className="card shadow-sm">
                  <div className="card-header">
                    <h5 className="card-title mb-0">
                      <i className="bi bi-key me-2"></i>
                      Change Password
                    </h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handlePasswordSubmit}>
                      <div className="mb-3">
                        <label htmlFor="currentPassword" className="form-label">
                          Current Password{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="currentPassword"
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="newPassword" className="form-label">
                          New Password <span className="text-danger">*</span>
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="newPassword"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          required
                          minLength={8}
                        />
                        <div className="form-text">
                          Password must be at least 8 characters long.
                        </div>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="confirmPassword" className="form-label">
                          Confirm New Password{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn btn-warning"
                        disabled={isUpdatingPassword}
                      >
                        {isUpdatingPassword ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Updating...
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
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card shadow-sm">
                  <div className="card-header">
                    <h5 className="card-title mb-0">
                      <i className="bi bi-shield-exclamation me-2"></i>
                      Security Tips
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex align-items-start mb-3">
                      <i className="bi bi-check-circle text-success me-2 mt-1"></i>
                      <div>
                        <strong>Use a strong password</strong>
                        <p className="small text-muted mb-0">
                          Include uppercase, lowercase, numbers, and symbols.
                        </p>
                      </div>
                    </div>
                    <div className="d-flex align-items-start mb-3">
                      <i className="bi bi-arrow-clockwise text-info me-2 mt-1"></i>
                      <div>
                        <strong>Change regularly</strong>
                        <p className="small text-muted mb-0">
                          Update your password every 3-6 months.
                        </p>
                      </div>
                    </div>
                    <div className="d-flex align-items-start">
                      <i className="bi bi-eye-slash text-warning me-2 mt-1"></i>
                      <div>
                        <strong>Keep it private</strong>
                        <p className="small text-muted mb-0">
                          Never share your password with others.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
