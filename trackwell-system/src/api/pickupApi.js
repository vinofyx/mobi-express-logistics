import axios from 'axios';

// Create isolated axios instance for pickup API
const pickupApiClient = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
pickupApiClient.interceptors.request.use(
  (config) => {
    console.log(`Pickup API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Pickup API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
pickupApiClient.interceptors.response.use(
  (response) => {
    console.log(`Pickup API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('Pickup API Response Error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// Pickup API methods
export const pickupApi = {
  /**
   * Create a new pickup request
   * @param {Object} pickupData - Pickup request data
   * @param {string} pickupData.name - Customer name
   * @param {string} pickupData.phone - Customer phone number
   * @param {string} pickupData.address - Pickup address
   * @param {string} pickupData.pickupDate - Pickup date (YYYY-MM-DD)
   * @param {string} pickupData.pickupTime - Pickup time (HH:MM)
   * @returns {Promise} Axios response
   */
  create: async (pickupData) => {
    try {
      const response = await pickupApiClient.post('/pickups', pickupData);
      return response;
    } catch (error) {
      // Enhanced error handling
      if (error.response) {
        // Server responded with error status
        throw {
          status: error.response.status,
          message: error.response.data?.message || 'Failed to create pickup request',
          data: error.response.data
        };
      } else if (error.request) {
        // Network error
        throw {
          status: 0,
          message: 'Network error. Please check your connection.',
          data: null
        };
      } else {
        // Other error
        throw {
          status: 0,
          message: error.message || 'An unexpected error occurred',
          data: null
        };
      }
    }
  },

  /**
   * Get all pickups (for admin/management)
   * @param {Object} params - Query parameters
   * @returns {Promise} Axios response
   */
  getAll: async (params = {}) => {
    return await pickupApiClient.get('/pickups', { params });
  },

  /**
   * Get single pickup by ID
   * @param {string} id - Pickup ID
   * @returns {Promise} Axios response
   */
  getById: async (id) => {
    return await pickupApiClient.get(`/pickups/${id}`);
  },

  /**
   * Update pickup status
   * @param {string} id - Pickup ID
   * @param {string} status - New status
   * @returns {Promise} Axios response
   */
  updateStatus: async (id, status) => {
    return await pickupApiClient.put(`/pickups/${id}/status`, { status });
  },

  /**
   * Cancel pickup
   * @param {string} id - Pickup ID
   * @returns {Promise} Axios response
   */
  cancel: async (id) => {
    return await pickupApiClient.delete(`/pickups/${id}`);
  }
};

export default pickupApi;
