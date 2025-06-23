import api from './api';
import { API_ENDPOINTS } from '../constants';

export const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);

      console.log('authService: Raw login response:', response.data);

      // Handle the response structure: { employee: {...}, accessToken: "..." }
      let userData, token;

      if (response.data.employee && response.data.accessToken) {
        // Structure: { employee: {...}, accessToken: "..." }
        userData = response.data.employee;
        token = response.data.accessToken;
        console.log('authService: Using employee + accessToken structure');
      } else if (response.data.user && response.data.token) {
        // Structure: { user: {...}, token: "..." }
        userData = response.data.user;
        token = response.data.token;
        console.log('authService: Using user + token structure');
      } else if (response.data.user && response.data.accessToken) {
        // Structure: { user: {...}, accessToken: "..." }
        userData = response.data.user;
        token = response.data.accessToken;
        console.log('authService: Using user + accessToken structure');
      } else if (response.data.accessToken) {
        // Structure: { id, name, email, ..., accessToken: "..." }
        const { accessToken, ...user } = response.data;
        userData = user;
        token = accessToken;
        console.log('authService: Using flat structure with accessToken');
      } else {
        console.error('authService: Unknown response structure:', response.data);
        throw new Error('Invalid response structure from server');
      }

      console.log('authService: Processed login data:', {
        userData,
        token: token ? 'present' : 'missing',
        userKeys: userData ? Object.keys(userData) : 'no userData'
      });

      // Ensure userData has required fields
      if (!userData || !userData.id) {
        console.error('authService: Invalid user data:', userData);
        throw new Error('Invalid user data received from server');
      }

      return {
        success: true,
        data: { user: userData, token }
      };
    } catch (error) {
      console.error('authService: Login error:', error);

      let errorMessage = 'Login failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
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
        position: userData.position || 'Employee',
        phoneNumber: userData.phoneNumber || '',
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
      await api.post('/auth/logout');
      return { success: true };
    } catch (error) {
      console.error('Logout API error:', error);
      return { success: true };
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');

      console.log('authService: Profile response:', response.data);

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