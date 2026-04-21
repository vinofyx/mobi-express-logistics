import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import customersSlice from './slices/customersSlice';
import pickupsSlice from './slices/pickupsSlice';
import parcelsSlice from './slices/parcelsSlice';
import shipmentsSlice from './slices/shipmentsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    customers: customersSlice,
    pickups: pickupsSlice,
    parcels: parcelsSlice,
    shipments: shipmentsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export default store;
