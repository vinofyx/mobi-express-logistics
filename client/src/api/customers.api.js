import axiosInstance from './axiosInstance';

export const customersAPI = {
  // Get all customers with pagination and search
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/customers', { params });
    return response.data;
  },

  // Get customer by ID
  getById: async (id) => {
    const response = await axiosInstance.get(`/customers/${id}`);
    return response.data;
  },

  // Create new customer
  create: async (customerData) => {
    const response = await axiosInstance.post('/customers', customerData);
    return response.data;
  },

  // Update customer
  update: async (id, customerData) => {
    const response = await axiosInstance.patch(`/customers/${id}`, customerData);
    return response.data;
  },

  // Delete customer
  delete: async (id) => {
    const response = await axiosInstance.delete(`/customers/${id}`);
    return response.data;
  },
};
