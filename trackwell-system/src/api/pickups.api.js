import axiosInstance from './axiosInstance';

export const pickupsAPI = {
  // Get all pickups with pagination and filters
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/pickups', { params });
    return response.data;
  },

  // Get pickup by ID
  getById: async (id) => {
    const response = await axiosInstance.get(`/pickups/${id}`);
    return response.data;
  },

  // Create new pickup
  create: async (pickupData) => {
    const response = await axiosInstance.post('/pickups', pickupData);
    return response.data;
  },

  // Update pickup
  update: async (id, pickupData) => {
    const response = await axiosInstance.patch(`/pickups/${id}`, pickupData);
    return response.data;
  },

  // Assign pickup to agent
  assign: async (id, agentId) => {
    const response = await axiosInstance.patch(`/pickups/${id}/assign`, { agentId });
    return response.data;
  },

  // Update pickup status
  updateStatus: async (id, status, notes = '') => {
    const response = await axiosInstance.patch(`/pickups/${id}/status`, { status, notes });
    return response.data;
  },
};
