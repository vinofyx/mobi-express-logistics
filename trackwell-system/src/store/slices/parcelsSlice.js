import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  parcels: [],
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
    destination: '',
    date: '',
  },
};

const parcelsSlice = createSlice({
  name: 'parcels',
  initialState,
  reducers: {
    fetchParcelsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchParcelsSuccess: (state, action) => {
      state.loading = false;
      state.parcels = action.payload.data;
      state.pagination = action.payload.meta;
      state.error = null;
    },
    fetchParcelsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createParcelStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createParcelSuccess: (state, action) => {
      state.loading = false;
      state.parcels.unshift(action.payload);
      state.error = null;
    },
    createParcelFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateParcelStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateParcelSuccess: (state, action) => {
      state.loading = false;
      const index = state.parcels.findIndex(parcel => parcel.id === action.payload.id);
      if (index !== -1) {
        state.parcels[index] = action.payload;
      }
      state.error = null;
    },
    updateParcelFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteParcelStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteParcelSuccess: (state, action) => {
      state.loading = false;
      state.parcels = state.parcels.filter(parcel => parcel.id !== action.payload);
      state.error = null;
    },
    deleteParcelFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchParcelsStart,
  fetchParcelsSuccess,
  fetchParcelsFailure,
  createParcelStart,
  createParcelSuccess,
  createParcelFailure,
  updateParcelStart,
  updateParcelSuccess,
  updateParcelFailure,
  deleteParcelStart,
  deleteParcelSuccess,
  deleteParcelFailure,
  setFilters,
  clearError,
} = parcelsSlice.actions;

export default parcelsSlice.reducer;
