import axios from 'axios';
import { STORAGE_KEYS } from '../constants';
import { config } from '../config/env';

// Create axios instance for profile operations
const profileApi = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
profileApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🚀 Profile API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('❌ Profile API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
profileApi.interceptors.response.use(
  (response) => {
    console.log('✅ Profile API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Profile API Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export const profileService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await profileApi.get('/auth/profile');

      return {
        success: true,
        user: response.data.user || response.data,
        message: 'Profile loaded successfully'
      };
    } catch (error) {
      console.error('Get profile error:', error);

      let errorMessage = 'Failed to load profile';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Please login to view your profile';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Update profile
  updateProfile: async (profileData) => {
    try {
      const response = await profileApi.put('/auth/profile', profileData);

      // Update localStorage with new user data
      const updatedUser = response.data.user || response.data;
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));

      return {
        success: true,
        user: updatedUser,
        message: response.data.message || 'Profile updated successfully'
      };
    } catch (error) {
      console.error('Update profile error:', error);

      let errorMessage = 'Failed to update profile';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid profile data. Please check your input.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Please login to update your profile';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Upload profile photo
  uploadPhoto: async (photoFile) => {
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);

      const response = await profileApi.post('/auth/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        photoUrl: response.data.photoUrl || response.data.url,
        message: response.data.message || 'Photo uploaded successfully'
      };
    } catch (error) {
      console.error('Upload photo error:', error);

      let errorMessage = 'Failed to upload photo';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid photo file. Please select a valid image.';
      } else if (error.response?.status === 413) {
        errorMessage = 'Photo file is too large. Please select a smaller image.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Please login to upload a photo';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Delete profile photo
  deletePhoto: async () => {
    try {
      console.log('🗑️ Deleting profile photo...');

      const response = await profileApi.delete('/auth/profile/photo');

      // Update localStorage to remove photo
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (userData) {
        const user = JSON.parse(userData);
        delete user.profilePicture;
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      }

      return {
        success: true,
        message: response.data.message || 'Profile photo removed successfully',
      };
    } catch (error) {
      console.error('Delete photo API error:', error);

      let errorMessage = 'Failed to remove profile photo';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      throw new Error(errorMessage);
    }
  },

  // Update password
  updatePassword: async (passwordData) => {
    try {
      const response = await profileApi.put('/auth/password', passwordData);

      return {
        success: true,
        message: response.data.message || 'Password updated successfully'
      };
    } catch (error) {
      console.error('Update password error:', error);

      let errorMessage = 'Failed to update password';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Current password is incorrect or new password is invalid.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Please login to change your password';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Update phone number
  updatePhoneNumber: async (phoneData) => {
    try {
      const response = await profileApi.put('/auth/profile/phone', phoneData);

      // Update localStorage with new phone number
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (userData) {
        const user = JSON.parse(userData);
        user.phoneNumber = phoneData.phoneNumber;
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      }

      return {
        success: true,
        message: response.data.message || 'Phone number updated successfully'
      };
    } catch (error) {
      console.error('Update phone number error:', error);

      let errorMessage = 'Failed to update phone number';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid phone number format.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Please login to update your phone number';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Verify phone number (if verification is implemented)
  verifyPhoneNumber: async (verificationCode) => {
    try {
      console.log('📱 Verifying phone number...');

      const response = await profileApi.post('/auth/verify-phone', {
        code: verificationCode
      });

      return {
        success: true,
        user: response.data.user,
        message: response.data.message || 'Phone number verified successfully'
      };
    } catch (error) {
      console.error('Verify phone API error:', error);

      let errorMessage = 'Failed to verify phone number';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid verification code';
      } else if (error.response?.status === 410) {
        errorMessage = 'Verification code has expired';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please login again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later';
      }

      throw new Error(errorMessage);
    }
  },

  // Update notification preferences (if implemented)
  updateNotificationPreferences: async (preferences) => {
    try {
      console.log('🔔 Updating notification preferences:', preferences);

      const response = await profileApi.put('/auth/notification-preferences', preferences);

      return {
        success: true,
        preferences: response.data.preferences || preferences,
        user: response.data.user,
        message: response.data.message || 'Notification preferences updated successfully'
      };
    } catch (error) {
      console.error('Update notification preferences API error:', error);

      let errorMessage = 'Failed to update notification preferences';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please login again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later';
      }

      throw new Error(errorMessage);
    }
  },

  // Deactivate account (if implemented)
  deactivateAccount: async (reason) => {
    try {
      console.log('⚠️ Deactivating account...');

      const response = await profileApi.post('/auth/deactivate', {
        reason: reason
      });

      return {
        success: true,
        message: response.data.message || 'Account deactivated successfully'
      };
    } catch (error) {
      console.error('Deactivate account API error:', error);

      let errorMessage = 'Failed to deactivate account';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please login again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later';
      }

      throw new Error(errorMessage);
    }
  },

  // Delete account (if needed)
  deleteAccount: async (password) => {
    try {
      const response = await profileApi.delete('/auth/profile', {
        data: { password }
      });

      return {
        success: true,
        message: response.data.message || 'Account deleted successfully'
      };
    } catch (error) {
      console.error('Delete account error:', error);

      let errorMessage = 'Failed to delete account';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Incorrect password provided.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Please login to delete your account';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }
};