import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  shipments: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  filters: {
    status: '',
  },
};

const shipmentsSlice = createSlice({
  name: 'shipments',
  initialState,
  reducers: {
    fetchShipmentsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchShipmentsSuccess: (state, action) => {
      state.loading = false;
      state.shipments = action.payload.data;
      state.pagination = action.payload.meta;
      state.error = null;
    },
    fetchShipmentsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createShipmentStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createShipmentSuccess: (state, action) => {
      state.loading = false;
      state.shipments.unshift(action.payload);
      state.error = null;
    },
    createShipmentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateShipmentStatusStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateShipmentStatusSuccess: (state, action) => {
      state.loading = false;
      const index = state.shipments.findIndex(
        (shipment) => shipment._id === action.payload._id
      );
      if (index !== -1) {
        state.shipments[index] = action.payload;
      }
      state.error = null;
    },
    updateShipmentStatusFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addParcelsToShipmentStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    addParcelsToShipmentSuccess: (state, action) => {
      state.loading = false;
      const index = state.shipments.findIndex(
        (shipment) => shipment._id === action.payload._id
      );
      if (index !== -1) {
        state.shipments[index] = action.payload;
      }
      state.error = null;
    },
    addParcelsToShipmentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteShipmentStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteShipmentSuccess: (state, action) => {
      state.loading = false;
      state.shipments = state.shipments.filter(
        (shipment) => shipment._id !== action.payload
      );
      state.error = null;
    },
    deleteShipmentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchShipmentsStart,
  fetchShipmentsSuccess,
  fetchShipmentsFailure,
  createShipmentStart,
  createShipmentSuccess,
  createShipmentFailure,
  updateShipmentStatusStart,
  updateShipmentStatusSuccess,
  updateShipmentStatusFailure,
  addParcelsToShipmentStart,
  addParcelsToShipmentSuccess,
  addParcelsToShipmentFailure,
  deleteShipmentStart,
  deleteShipmentSuccess,
  deleteShipmentFailure,
  setFilters,
  setPagination,
  clearError,
} = shipmentsSlice.actions;

export default shipmentsSlice.reducer;
