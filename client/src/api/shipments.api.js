import axiosInstance from './axiosInstance';

export const shipmentsAPI = {
  // Get all shipments with pagination and filters
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/shipments', { params });
    return response.data;
  },

  // Get shipment by ID
  getById: async (id) => {
    const response = await axiosInstance.get(`/shipments/${id}`);
    return response.data;
  },

  // Create new shipment
  create: async (shipmentData) => {
    const response = await axiosInstance.post('/shipments', shipmentData);
    return response.data;
  },

  // Update shipment status
  updateStatus: async (id, status, notes = '') => {
    const response = await axiosInstance.patch(`/shipments/${id}/status`, { status, notes });
    return response.data;
  },

  // Add parcels to shipment
  addParcels: async (id, parcelIds) => {
    const response = await axiosInstance.post(`/shipments/${id}/parcels`, { parcelIds });
    return response.data;
  },

  // Delete shipment
  delete: async (id) => {
    const response = await axiosInstance.delete(`/shipments/${id}`);
    return response.data;
  },
};
