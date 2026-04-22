import axios from "axios";
import store from "../store";
import { logout, refreshTokenSuccess } from "../store/slices/authSlice";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 15000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token from Redux store on every request
axiosInstance.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — try refresh, then logout
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const res = await axios.post(
          `${axiosInstance.defaults.baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        const { accessToken } = res.data?.data || {};
        if (accessToken) {
          store.dispatch(refreshTokenSuccess({ token: accessToken }));
          original.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(original);
        }
      } catch {
        store.dispatch(logout());
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
