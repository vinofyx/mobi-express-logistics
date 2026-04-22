import axiosInstance from "./axiosInstance";

export const authAPI = {
  register: (data) =>
    axiosInstance.post("/auth/register", data),

  login: (data) =>
    axiosInstance.post("/auth/login", data, { withCredentials: true }),

  logout: () =>
    axiosInstance.post("/auth/logout", {}, { withCredentials: true }),

  refreshToken: () =>
    axiosInstance.post("/auth/refresh-token", {}, { withCredentials: true }),

  me: () =>
    axiosInstance.get("/auth/me"),
};
