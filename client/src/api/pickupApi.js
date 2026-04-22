import axios from 'axios';

const pickupApiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request log
pickupApiClient.interceptors.request.use((config) => {
  console.log('🚀 Request:', config.url, config.data);
  return config;
});

// Response log
pickupApiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ ERROR FULL:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const pickupApi = {
  create: async (pickupData) => {
    try {
      const response = await pickupApiClient.post('/pickups', pickupData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  getAll: async (params = {}) => {
    try {
      const response = await pickupApiClient.get('/pickups', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },
};

export default pickupApi;