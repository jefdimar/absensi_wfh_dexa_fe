import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import { STORAGE_KEYS } from "../constants";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);

        console.log("AuthContext: Initializing auth...", {
          hasToken: !!token,
          hasUserData: !!userData,
        });

        if (token && userData) {
          try {
            // Parse stored user data
            const parsedUserData = JSON.parse(userData);
            console.log("AuthContext: Parsed user data:", parsedUserData);

            // Verify token is still valid by fetching profile
            const result = await authService.getProfile();
            console.log("AuthContext: Profile fetch result:", result);

            if (result.success) {
              // Use fresh profile data from server
              const freshUserData = result.data;
              console.log(
                "AuthContext: Fresh user data from server:",
                freshUserData
              );

              // Update stored user data if it has changed
              localStorage.setItem(
                STORAGE_KEYS.USER_DATA,
                JSON.stringify(freshUserData)
              );

              setUser(freshUserData);
              setIsAuthenticated(true);
            } else {
              // Token is invalid, clear storage
              console.log("AuthContext: Token invalid, clearing storage");
              localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
              localStorage.removeItem(STORAGE_KEYS.USER_DATA);
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (profileError) {
            console.error("AuthContext: Profile fetch failed:", profileError);
            // If profile fetch fails, try to use stored data temporarily
            try {
              const parsedUserData = JSON.parse(userData);

              console.log(
                "AuthContext: Using stored user data as fallback:",
                parsedUserData
              );
              setUser(parsedUserData);
              setIsAuthenticated(true);
            } catch (parseError) {
              console.error(
                "AuthContext: Failed to parse stored user data:",
                parseError
              );
              localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
              localStorage.removeItem(STORAGE_KEYS.USER_DATA);
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        } else {
          console.log("AuthContext: No token or user data found");
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("AuthContext: Auth initialization error:", error);
        // Clear invalid data
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("AuthContext: Attempting login...");
      const result = await authService.login(credentials);
      console.log("AuthContext: Login result:", result);

      if (result.success) {
        const { token, user: userData } = result.data;

        console.log("AuthContext: Login successful, user data:", userData);
        console.log("AuthContext: Token present:", !!token);

        if (!userData) {
          throw new Error("No user data received from login");
        }

        if (!token) {
          throw new Error("No token received from login");
        }

        // Store auth data
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);

        // Show different welcome message for admin
        const welcomeMessage =
          userData.role === "admin"
            ? `Welcome back, Admin ${userData.name}!`
            : `Welcome back, ${userData.name}!`;

        toast.success(welcomeMessage);

        return { success: true, user: userData };
      } else {
        console.log("AuthContext: Login failed:", result.error);
        setError(result.error);
        toast.error(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("AuthContext: Login error:", error);
      const errorMessage = error.message || "Login failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("AuthContext: Attempting registration...");
      const result = await authService.register(userData);
      console.log("AuthContext: Registration result:", result);

      if (result.success) {
        toast.success(
          "Registration successful! Please sign in with your credentials."
        );
        return { success: true };
      } else {
        setError(result.error);
        toast.error(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("AuthContext: Registration error:", error);
      const errorMessage = "Registration failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("AuthContext: Updating profile...");
      const result = await authService.updateProfile(profileData);
      console.log("AuthContext: Profile update result:", result);

      if (result.success) {
        // Update local user data
        const updatedUser = { ...user, ...result.data };
        console.log("AuthContext: Updated user data:", updatedUser);

        setUser(updatedUser);
        localStorage.setItem(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(updatedUser)
        );

        toast.success("Profile updated successfully!");
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        toast.error(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("AuthContext: Update profile error:", error);
      const errorMessage = "Failed to update profile.";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      console.log("AuthContext: Logging out...");

      // Call logout API (optional, don't fail if it doesn't work)
      try {
        await authService.logout();
      } catch (logoutError) {
        console.log(
          "AuthContext: Logout API call failed (non-critical):",
          logoutError
        );
      }

      // Clear local storage
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);

      // Clear state
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      console.log("AuthContext: Logout successful");
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("AuthContext: Logout error:", error);
      // Even if API call fails, clear local data
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Helper function to check if user is admin
  const isAdmin = () => {
    return (
      user?.role === "admin" || user?.email?.includes("admin@superadmin.com")
    );
  };

  // Helper function to get user token
  const getToken = () => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    token: getToken(),
    isAdmin: isAdmin(),
    login,
    register,
    updateProfile,
    logout,
    clearError,
  };
  // Debug log for context value changes
  console.log("AuthContext: Providing value:", {
    user: user
      ? { id: user.id, name: user.name, email: user.email, role: user.role }
      : null,
    isAuthenticated,
    isLoading,
    error,
    isAdmin: isAdmin(),
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
