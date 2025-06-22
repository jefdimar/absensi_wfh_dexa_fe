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

        if (token && userData) {
          try {
            // Parse stored user data
            const parsedUserData = JSON.parse(userData);

            // Verify token is still valid by fetching profile
            const result = await authService.getProfile();

            if (result.success) {
              setUser(result.data);
              setIsAuthenticated(true);
              console.log("Auth initialized successfully:", result.data);
            } else {
              // Token is invalid, clear storage
              console.log("Token validation failed, clearing storage");
              localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
              localStorage.removeItem(STORAGE_KEYS.USER_DATA);
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (profileError) {
            // If profile fetch fails, try to use stored data temporarily
            console.log(
              "Profile fetch failed, using stored data:",
              profileError
            );
            try {
              const parsedUserData = JSON.parse(userData);
              setUser(parsedUserData);
              setIsAuthenticated(true);
            } catch (parseError) {
              console.log("Failed to parse stored user data:", parseError);
              localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
              localStorage.removeItem(STORAGE_KEYS.USER_DATA);
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        } else {
          console.log("No token or user data found");
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
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

      const result = await authService.login(credentials);

      if (result.success) {
        const { token, user: userData } = result.data;

        // Store auth data
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);

        toast.success(`Welcome back, ${userData.name}!`);

        return { success: true };
      } else {
        setError(result.error);
        toast.error(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = "Login failed. Please try again.";
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

      const result = await authService.register(userData);

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
      console.error("Registration error:", error);
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

      const result = await authService.updateProfile(profileData);

      if (result.success) {
        // Update local user data
        const updatedUser = { ...user, ...result.data };
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
      console.error("Update profile error:", error);
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

      // Call logout API (optional, don't fail if it doesn't work)
      try {
        await authService.logout();
      } catch (logoutError) {
        console.log(
          "Logout API call failed, but continuing with local cleanup:",
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

      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error);
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

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    updateProfile,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
