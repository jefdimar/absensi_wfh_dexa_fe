import api from './api';
import { API_ENDPOINTS } from '@/constants';

export const profileService = {
  // Update profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put(API_ENDPOINTS.PROFILE.UPDATE, profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Upload profile photo
  uploadPhoto: async (photoFile) => {
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);

      const response = await api.post(API_ENDPOINTS.PROFILE.UPLOAD_PHOTO, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update password
  updatePassword: async (passwordData) => {
    try {
      const response = await api.put(API_ENDPOINTS.PROFILE.UPDATE, {
        password: passwordData.newPassword,
        currentPassword: passwordData.currentPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update phone number
  updatePhoneNumber: async (phoneNumber) => {
    try {
      const response = await api.put(API_ENDPOINTS.PROFILE.UPDATE, {
        phoneNumber
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};