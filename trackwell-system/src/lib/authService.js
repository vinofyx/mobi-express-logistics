import axios from 'axios';

// Create axios instance for auth requests
const authApi = axios.create({
  baseURL: 'http://localhost:5001/api/auth',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
authApi.interceptors.request.use(
  (config) => {
    console.log(`Auth API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Auth API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
authApi.interceptors.response.use(
  (response) => {
    console.log(`Auth API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('Auth API Response Error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
});

export const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await authApi.post('/login', credentials);
      return response.data;
    } catch (error) {
      throw {
        status: error.response?.status || 0,
        message: error.response?.data?.message || error.message || 'Login failed',
        data: error.response?.data || null
      };
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await authApi.post('/register', userData);
      return response.data;
    } catch (error) {
      throw {
        status: error.response?.status || 0,
        message: error.response?.data?.message || error.message || 'Registration failed',
        data: error.response?.data || null
      };
    }
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    try {
      const response = await authApi.post('/refresh-token', { refreshToken });
      return response.data;
    } catch (error) {
      throw {
        status: error.response?.status || 0,
        message: error.response?.data?.message || error.message || 'Token refresh failed',
        data: error.response?.data || null
      };
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await authApi.get('/profile');
      return response.data;
    } catch (error) {
      throw {
        status: error.response?.status || 0,
        message: error.response?.data?.message || error.message || 'Failed to get profile',
        data: error.response?.data || null
      };
    }
  },

  // Update profile
  updateProfile: async (profileData) => {
    try {
      const response = await authApi.put('/profile', profileData);
      return response.data;
    } catch (error) {
      throw {
        status: error.response?.status || 0,
        message: error.response?.data?.message || error.message || 'Failed to update profile',
        data: error.response?.data || null
      };
    }
  },

  // Change password
  changePassword: async (passwords) => {
    try {
      const response = await authApi.put('/change-password', passwords);
      return response.data;
    } catch (error) {
      throw {
        status: error.response?.status || 0,
        message: error.response?.data?.message || error.message || 'Failed to change password',
        data: error.response?.data || null
      };
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await authApi.post('/logout');
      return response.data;
    } catch (error) {
      throw {
        status: error.response?.status || 0,
        message: error.response?.data?.message || error.message || 'Logout failed',
        data: error.response?.data || null
      };
    }
  },

  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      const response = await authApi.get('/users');
      return response.data;
    } catch (error) {
      throw {
        status: error.response?.status || 0,
        message: error.response?.data?.message || error.message || 'Failed to get users',
        data: error.response?.data || null
      };
    }
  },

  // Create user (admin only)
  createUser: async (userData) => {
    try {
      const response = await authApi.post('/users', userData);
      return response.data;
    } catch (error) {
      throw {
        status: error.response?.status || 0,
        message: error.response?.data?.message || error.message || 'Failed to create user',
        data: error.response?.data || null
      };
    }
  },

  // Update user status (admin only)
  updateUserStatus: async (userId, status) => {
    try {
      const response = await authApi.put(`/users/${userId}/status`, { isActive: status });
      return response.data;
    } catch (error) {
      throw {
        status: error.response?.status || 0,
        message: error.response?.data?.message || error.message || 'Failed to update user status',
        data: error.response?.data || null
      };
    }
  }
};

export default authService;
