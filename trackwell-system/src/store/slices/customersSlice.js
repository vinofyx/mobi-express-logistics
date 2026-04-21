import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  customers: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  filters: {
    search: '',
  },
};

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    fetchCustomersStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCustomersSuccess: (state, action) => {
      state.loading = false;
      state.customers = action.payload.data;
      state.pagination = action.payload.meta;
      state.error = null;
    },
    fetchCustomersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createCustomerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createCustomerSuccess: (state, action) => {
      state.loading = false;
      state.customers.unshift(action.payload);
      state.error = null;
    },
    createCustomerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateCustomerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateCustomerSuccess: (state, action) => {
      state.loading = false;
      const index = state.customers.findIndex(
        (customer) => customer._id === action.payload._id
      );
      if (index !== -1) {
        state.customers[index] = action.payload;
      }
      state.error = null;
    },
    updateCustomerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteCustomerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteCustomerSuccess: (state, action) => {
      state.loading = false;
      state.customers = state.customers.filter(
        (customer) => customer._id !== action.payload
      );
      state.error = null;
    },
    deleteCustomerFailure: (state, action) => {
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
  fetchCustomersStart,
  fetchCustomersSuccess,
  fetchCustomersFailure,
  createCustomerStart,
  createCustomerSuccess,
  createCustomerFailure,
  updateCustomerStart,
  updateCustomerSuccess,
  updateCustomerFailure,
  deleteCustomerStart,
  deleteCustomerSuccess,
  deleteCustomerFailure,
  setFilters,
  setPagination,
  clearError,
} = customersSlice.actions;

export default customersSlice.reducer;
