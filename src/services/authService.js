import api from './api';
import { API_ROUTES } from '../constants';

export const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      const { accessToken, employee } = response.data;

      if (!accessToken || !employee) {
        throw new Error('Invalid response format');
      }

      return {
        success: true,
        data: {
          token: accessToken,
          user: {
            id: employee.id,
            name: employee.name,
            email: employee.email,
            position: employee.position,
            phoneNumber: employee.phoneNumber,
            role: employee.role || 'employee', // Default to employee if no role
          },
        },
      };
    } catch (error) {
      console.error('Login API error:', error);

      let errorMessage = 'Login failed. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Please provide valid email and password.';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        position: userData.position || 'Employee', // Default position
        phoneNumber: userData.phoneNumber || '', // Optional phone number
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Register API error:', error);

      let errorMessage = 'Registration failed. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 409) {
        errorMessage = 'Email already exists. Please use a different email.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid registration data. Please check your inputs.';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  // Logout user
  logout: async () => {
    try {
      // If you have a logout endpoint
      await api.post('/auth/logout');
      return { success: true };
    } catch (error) {
      // Even if logout fails on server, we'll clear local data
      console.error('Logout API error:', error);
      return { success: true };
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');

      return {
        success: true,
        data: {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          position: response.data.position,
          phoneNumber: response.data.phoneNumber,
          role: response.data.role || 'employee',
        },
      };
    } catch (error) {
      console.error('Get profile API error:', error);

      return {
        success: false,
        error: 'Failed to fetch profile data.',
      };
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', {
        name: profileData.name,
        position: profileData.position,
        phoneNumber: profileData.phoneNumber,
      });

      return {
        success: true,
        data: {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          position: response.data.position,
          phoneNumber: response.data.phoneNumber,
          role: response.data.role || 'employee',
        },
      };
    } catch (error) {
      console.error('Update profile API error:', error);

      let errorMessage = 'Failed to update profile.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get user data');
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh');
      const { token } = response.data;
      localStorage.setItem('auth_token', token);
      return token;
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    return !!(token && userData);
  },

  // Get stored user data
  getStoredUser: () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  // Get stored token
  getStoredToken: () => {
    return localStorage.getItem('auth_token');
  }
};