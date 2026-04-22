import { createSlice } from "@reduxjs/toolkit";

const savedToken = localStorage.getItem("token");
const savedUser  = localStorage.getItem("user");

const initialState = {
  user:            savedUser  ? JSON.parse(savedUser)  : null,
  token:           savedToken || null,
  isAuthenticated: !!savedToken,
  loading:         false,
  error:           null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, { payload }) {
      state.loading       = false;
      state.isAuthenticated = true;
      state.user          = payload.user;
      state.token         = payload.token;
      state.error         = null;
      localStorage.setItem("token", payload.token);
      localStorage.setItem("user",  JSON.stringify(payload.user));
    },
    logout(state) {
      state.user            = null;
      state.token           = null;
      state.isAuthenticated = false;
      state.error           = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    refreshTokenSuccess(state, { payload }) {
      state.token = payload.token;
      localStorage.setItem("token", payload.token);
    },
    setLoading(state, { payload }) {
      state.loading = payload;
    },
    setError(state, { payload }) {
      state.error   = payload;
      state.loading = false;
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const {
  loginSuccess,
  logout,
  refreshTokenSuccess,
  setLoading,
  setError,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
