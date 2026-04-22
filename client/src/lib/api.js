import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Add authentication token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear tokens and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      // You might want to use React Router to redirect
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// API endpoints mapping
export const endpoints = {
  pickups: '/pickups',
  customers: '/customers',
  parcels: '/parcels',
  shipments: '/shipments',
};

// API methods for each resource
export const pickupsAPI = {
  // Get all pickups
  getAll: (params = {}) => api.get(endpoints.pickups, { params }),
  
  // Get single pickup
  getById: (id) => api.get(`${endpoints.pickups}/${id}`),
  
  // Create pickup
  create: (data) => api.post(endpoints.pickups, data),
  
  // Update pickup
  update: (id, data) => api.put(`${endpoints.pickups}/${id}`, data),
  
  // Update pickup status
  updateStatus: (id, status) => api.put(`${endpoints.pickups}/${id}/status`, { status }),
  
  // Delete pickup
  delete: (id) => api.delete(`${endpoints.pickups}/${id}`),
  
  // Assign pickup to agent
  assign: (id, agentId) => api.put(`${endpoints.pickups}/${id}/assign`, { agentId }),
};

export const customersAPI = {
  // Get all customers
  getAll: (params = {}) => api.get(endpoints.customers, { params }),
  
  // Get single customer
  getById: (id) => api.get(`${endpoints.customers}/${id}`),
  
  // Create customer
  create: (data) => api.post(endpoints.customers, data),
  
  // Update customer
  update: (id, data) => api.put(`${endpoints.customers}/${id}`, data),
  
  // Delete customer
  delete: (id) => api.delete(`${endpoints.customers}/${id}`),
};

export const parcelsAPI = {
  // Get all parcels
  getAll: (params = {}) => api.get(endpoints.parcels, { params }),
  
  // Get single parcel
  getById: (id) => api.get(`${endpoints.parcels}/${id}`),
  
  // Get parcel by tracking ID
  getByTrackingId: (trackingId) => api.get(`${endpoints.parcels}/track/${trackingId}`),
  
  // Create parcel
  create: (data) => api.post(endpoints.parcels, data),
  
  // Create parcel from pickup
  createFromPickup: (data) => api.post(`${endpoints.parcels}/from-pickup`, data),
  
  // Update parcel
  update: (id, data) => api.put(`${endpoints.parcels}/${id}`, data),
  
  // Update parcel status
  updateStatus: (id, status, note = '') => api.put(`${endpoints.parcels}/${id}/status`, { status, note }),
  
  // Mark parcel as damaged
  markAsDamaged: (id, damageNote) => api.put(`${endpoints.parcels}/${id}/damage`, { damageNote }),
  
  // Delete parcel
  delete: (id) => api.delete(`${endpoints.parcels}/${id}`),
  
  // Get sorted view
  getSortedView: (params = {}) => api.get(`${endpoints.parcels}/sort-view`, { params }),
  
  // Get constants
  getConstants: () => api.get(`${endpoints.parcels}/constants`),
  
  // Track parcel (public)
  track: (trackingId) => api.get(`${endpoints.parcels}/track/${trackingId}`),
};

export const shipmentsAPI = {
  // Get all shipments
  getAll: (params = {}) => api.get(endpoints.shipments, { params }),
  
  // Get single shipment
  getById: (id) => api.get(`${endpoints.shipments}/${id}`),
  
  // Create shipment
  create: (data) => api.post(endpoints.shipments, data),
  
  // Add parcels to shipment
  addParcels: (id, parcelIds) => api.post(`${endpoints.shipments}/${id}/parcels`, { parcelIds }),
  
  // Update shipment status
  updateStatus: (id, status, note = '', location = '') => 
    api.patch(`${endpoints.shipments}/${id}/status`, { status, note, location }),
  
  // Delete shipment
  delete: (id) => api.delete(`${endpoints.shipments}/${id}`),
  
  // Track shipment (public)
  track: (shipmentId) => api.get(`${endpoints.shipments}/track/${shipmentId}`),
};

// Export default API instance
export default api;

// Export a health check function
export const healthCheck = () => api.get('/health');
