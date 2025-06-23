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
  // Update profile information
  updateProfile: async (profileData) => {
    try {
      const response = await profileApi.put('/auth/profile', profileData);
      return {
        success: true,
        user: response.data.user || response.data,
        message: response.data.message || 'Profile updated successfully'
      };
    } catch (error) {
      console.error('Update profile error:', error);

      let errorMessage = 'Failed to update profile';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid profile data provided';
      } else if (error.response?.status === 401) {
        errorMessage = 'Please login to update your profile';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to update this profile';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later';
      }

      throw new Error(errorMessage);
    }
  },

  // Upload profile photo
  uploadPhoto: async (photoFile) => {
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      formData.append('type', 'profile');

      const response = await profileApi.post('/auth/upload-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        photoUrl: response.data.photoUrl || response.data.url || response.data.profilePicture,
        message: response.data.message || 'Photo uploaded successfully'
      };
    } catch (error) {
      console.error('Upload photo error:', error);

      let errorMessage = 'Failed to upload photo';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid photo file. Please check file size and format';
      } else if (error.response?.status === 413) {
        errorMessage = 'Photo file is too large. Maximum size is 5MB';
      } else if (error.response?.status === 415) {
        errorMessage = 'Unsupported file format. Please use JPG, PNG, or GIF';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later';
      }

      throw new Error(errorMessage);
    }
  },

  // Update password
  updatePassword: async (passwordData) => {
    try {
      const response = await profileApi.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

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
        errorMessage = 'Current password is incorrect';
      } else if (error.response?.status === 422) {
        errorMessage = 'New password does not meet requirements';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later';
      }

      throw new Error(errorMessage);
    }
  },

  // Update phone number
  updatePhoneNumber: async (phoneData) => {
    try {
      const response = await profileApi.put('/auth/update-phone', phoneData);

      return {
        success: true,
        phoneNumber: response.data.phoneNumber,
        message: response.data.message || 'Phone number updated successfully'
      };
    } catch (error) {
      console.error('Update phone error:', error);

      let errorMessage = 'Failed to update phone number';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid phone number format';
      } else if (error.response?.status === 409) {
        errorMessage = 'Phone number is already in use';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later';
      }

      throw new Error(errorMessage);
    }
  },

  // Get profile information (if needed)
  getProfile: async () => {
    try {
      const response = await profileApi.get('/auth/profile');

      return {
        success: true,
        user: response.data.user || response.data
      };
    } catch (error) {
      console.error('Get profile error:', error);

      let errorMessage = 'Failed to load profile';
      if (error.response?.status === 401) {
        errorMessage = 'Please login to view your profile';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later';
      }

      throw new Error(errorMessage);
    }
  },

  // Delete profile photo
  deletePhoto: async () => {
    try {
      const response = await profileApi.delete('/auth/profile-photo');

      return {
        success: true,
        message: response.data.message || 'Profile photo deleted successfully'
      };
    } catch (error) {
      console.error('Delete photo error:', error);

      let errorMessage = 'Failed to delete photo';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later';
      }

      throw new Error(errorMessage);
    }
  }
};