import axiosInstance from './axiosInstance';

export const parcelsAPI = {
  // Get all parcels with pagination and filters
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/parcels', { params });
    return response.data;
  },

  // Get parcel by ID
  getById: async (id) => {
    const response = await axiosInstance.get(`/parcels/${id}`);
    return response.data;
  },

  // Create new parcel
  create: async (parcelData) => {
    const response = await axiosInstance.post('/parcels', parcelData);
    return response.data;
  },

  // Update parcel status
  updateStatus: async (id, status, notes = '') => {
    const response = await axiosInstance.patch(`/parcels/${id}/status`, { status, notes });
    return response.data;
  },

  // Track parcel by tracking ID
  track: async (trackingId) => {
    const response = await axiosInstance.get(`/parcels/track/${trackingId}`);
    return response.data;
  },

  // Report damage to parcel
  reportDamage: async (id, damageReport) => {
    const response = await axiosInstance.put(`/parcels/${id}/damage`, damageReport);
    return response.data;
  },

  // Get sort view for parcels
  getSortView: async () => {
    const response = await axiosInstance.get('/parcels/sort-view');
    return response.data;
  },
};
