import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { profileService } from "../services/profileService";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const ProfileContext = createContext();

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfileContext must be used within a ProfileProvider");
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load profile data
  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await profileService.getProfile();

      if (result.success) {
        setProfileData(result.user);
        console.log("✅ Profile loaded successfully:", result.user);
      } else {
        setError(result.error);
        console.error("❌ Failed to load profile:", result.error);
      }
    } catch (error) {
      console.error("❌ Profile loading error:", error);
      setError(error.message || "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(
    async (profileUpdateData) => {
      try {
        setIsUpdating(true);
        setError(null);

        const result = await profileService.updateProfile(profileUpdateData);

        if (result.success) {
          setProfileData(result.user);

          // Update auth context user data
          if (updateUser) {
            updateUser(result.user);
          }

          toast.success(result.message || "Profile updated successfully!");
          console.log("✅ Profile updated successfully:", result.user);

          return { success: true, user: result.user };
        } else {
          throw new Error(result.error || "Failed to update profile");
        }
      } catch (error) {
        console.error("❌ Profile update error:", error);
        const errorMessage = error.message || "Failed to update profile";
        setError(errorMessage);
        toast.error(errorMessage);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [updateUser]
  );

  // Upload photo
  const uploadPhoto = useCallback(
    async (photoFile) => {
      try {
        setIsUploading(true);
        setError(null);

        const result = await profileService.uploadPhoto(photoFile);

        if (result.success) {
          // Update profile data with new photo URL
          const updatedProfile = {
            ...profileData,
            profilePicture: result.photoUrl,
          };
          setProfileData(updatedProfile);

          // Update auth context user data
          if (updateUser) {
            updateUser({ profilePicture: result.photoUrl });
          }

          toast.success(
            result.message || "Profile photo updated successfully!"
          );
          console.log("✅ Photo uploaded successfully:", result.photoUrl);

          return { success: true, photoUrl: result.photoUrl };
        } else {
          throw new Error(result.error || "Failed to upload photo");
        }
      } catch (error) {
        console.error("❌ Photo upload error:", error);
        const errorMessage = error.message || "Failed to upload photo";
        setError(errorMessage);
        toast.error(errorMessage);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [profileData, updateUser]
  );

  // Delete photo
  const deletePhoto = useCallback(async () => {
    try {
      setIsDeletingPhoto(true);
      setError(null);

      await profileService.deletePhoto();

      // Update profile data to remove photo
      const updatedProfile = {
        ...profileData,
        profilePicture: null,
      };
      setProfileData(updatedProfile);

      // Update auth context user data
      if (updateUser) {
        updateUser({ profilePicture: null });
      }

      toast.success("Profile photo removed successfully!");
      console.log("✅ Photo deleted successfully");

      return { success: true };
    } catch (error) {
      console.error("❌ Photo delete error:", error);
      const errorMessage = error.message || "Failed to delete photo";
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsDeletingPhoto(false);
    }
  }, [profileData, updateUser]);

  // Update password
  const updatePassword = useCallback(async (passwordData) => {
    try {
      setIsUpdatingPassword(true);
      setError(null);

      const result = await profileService.updatePassword(passwordData);

      if (result.success) {
        toast.success(result.message || "Password updated successfully!");
        console.log("✅ Password updated successfully");

        return { success: true };
      } else {
        throw new Error(result.error || "Failed to update password");
      }
    } catch (error) {
      console.error("❌ Password update error:", error);
      const errorMessage = error.message || "Failed to update password";
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsUpdatingPassword(false);
    }
  }, []);

  // Update phone number
  const updatePhoneNumber = useCallback(
    async (phoneNumber) => {
      try {
        setIsUpdatingPhone(true);
        setError(null);

        const result = await profileService.updatePhoneNumber({ phoneNumber });

        if (result.success) {
          // Update profile data with new phone number
          const updatedProfile = {
            ...profileData,
            phoneNumber: phoneNumber,
          };
          setProfileData(updatedProfile);

          // Update auth context user data
          if (updateUser) {
            updateUser({ phoneNumber });
          }

          toast.success(result.message || "Phone number updated successfully!");
          console.log("✅ Phone number updated successfully");

          return { success: true };
        } else {
          throw new Error(result.error || "Failed to update phone number");
        }
      } catch (error) {
        console.error("❌ Phone number update error:", error);
        const errorMessage = error.message || "Failed to update phone number";
        setError(errorMessage);
        toast.error(errorMessage);
        throw error;
      } finally {
        setIsUpdatingPhone(false);
      }
    },
    [profileData, updateUser]
  );

  // Calculate profile completion percentage
  const getProfileCompletion = useCallback(() => {
    if (!profileData) return 0;

    const fields = [
      "name",
      "email",
      "position",
      "phoneNumber",
      "profilePicture",
    ];

    const completedFields = fields.filter((field) => {
      const value = profileData[field];
      return value && value.toString().trim().length > 0;
    });

    return Math.round((completedFields.length / fields.length) * 100);
  }, [profileData]);

  // Initialize profile data from auth context or localStorage
  React.useEffect(() => {
    if (user && !profileData) {
      setProfileData(user);
    } else if (!user && !profileData) {
      // Try to load from localStorage
      const userData = localStorage.getItem("user_data");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setProfileData(parsedUser);
        } catch (error) {
          console.error("Failed to parse user data from localStorage:", error);
        }
      }
    }
  }, [user, profileData]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      // State
      profileData,
      isLoading,
      error,
      isUpdating,
      isUploading,
      isUpdatingPassword,
      isUpdatingPhone,
      isDeletingPhoto,

      // Actions
      loadProfile,
      updateProfile,
      uploadPhoto,
      deletePhoto,
      updatePassword,
      updatePhoneNumber,
      clearError,

      // Utilities
      getProfileCompletion,
    }),
    [
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
      clearError,
      getProfileCompletion,
    ]
  );

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileContext;
