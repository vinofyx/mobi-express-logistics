import axios from "axios";

const API = axios.create({
  baseURL: typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? "/api"
    : "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
API.interceptors.request.use(
  (config) => {
    console.log(`Auth API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('Request data:', config.data);
    return config;
  },
  (error) => {
    console.error('Auth API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
API.interceptors.response.use(
  (response) => {
    console.log(`Auth API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('Auth API Response Error:', error);
    console.error('Error response:', error.response?.data);
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (data) => {
    try {
      const response = await API.post("/api/v1/auth/login", data);
      
      // Validate response structure
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Login failed');
      }
      
      return response.data;
    } catch (error) {
      console.error('Login service error:', error);
      throw error;
    }
  },
  
  signup: async (data) => {
    try {
      // Ensure role is lowercase
      const signupData = {
        ...data,
        role: data.role?.toLowerCase() || 'customer'
      };
      
      console.log('Signup data:', signupData);
      
      const response = await API.post("/api/v1/auth/register", signupData);
      
      // Validate response structure
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Signup failed');
      }
      
      return response.data;
    } catch (error) {
      console.error('Signup service error:', error);
      throw error;
    }
  }
};
