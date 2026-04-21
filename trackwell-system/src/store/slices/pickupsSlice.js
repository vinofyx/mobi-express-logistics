import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pickups: [],
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
    date: '',
  },
};

const pickupsSlice = createSlice({
  name: 'pickups',
  initialState,
  reducers: {
    fetchPickupsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPickupsSuccess: (state, action) => {
      state.loading = false;
      state.pickups = action.payload.data;
      state.pagination = action.payload.meta;
      state.error = null;
    },
    fetchPickupsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createPickupStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createPickupSuccess: (state, action) => {
      state.loading = false;
      state.pickups.unshift(action.payload);
      state.error = null;
    },
    createPickupFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updatePickupStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updatePickupSuccess: (state, action) => {
      state.loading = false;
      const index = state.pickups.findIndex(
        (pickup) => pickup._id === action.payload._id
      );
      if (index !== -1) {
        state.pickups[index] = action.payload;
      }
      state.error = null;
    },
    updatePickupFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    assignPickupStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    assignPickupSuccess: (state, action) => {
      state.loading = false;
      const index = state.pickups.findIndex(
        (pickup) => pickup._id === action.payload._id
      );
      if (index !== -1) {
        state.pickups[index] = action.payload;
      }
      state.error = null;
    },
    assignPickupFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updatePickupStatusStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updatePickupStatusSuccess: (state, action) => {
      state.loading = false;
      const index = state.pickups.findIndex(
        (pickup) => pickup._id === action.payload._id
      );
      if (index !== -1) {
        state.pickups[index] = action.payload;
      }
      state.error = null;
    },
    updatePickupStatusFailure: (state, action) => {
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
  fetchPickupsStart,
  fetchPickupsSuccess,
  fetchPickupsFailure,
  createPickupStart,
  createPickupSuccess,
  createPickupFailure,
  updatePickupStart,
  updatePickupSuccess,
  updatePickupFailure,
  assignPickupStart,
  assignPickupSuccess,
  assignPickupFailure,
  updatePickupStatusStart,
  updatePickupStatusSuccess,
  updatePickupStatusFailure,
  setFilters,
  setPagination,
  clearError,
} = pickupsSlice.actions;

export default pickupsSlice.reducer;
