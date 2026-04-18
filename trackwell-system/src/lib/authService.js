import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/api"
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (data) => {
    const response = await API.post("/auth/login", data);
    return response.data;
  },
  signup: async (data) => {
    const response = await API.post("/auth/signup", data);
    return response.data;
  }
};
