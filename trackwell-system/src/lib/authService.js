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
  login: (data) => API.post("/auth/login", data),
  signup: (data) => API.post("/auth/signup", data)
};
