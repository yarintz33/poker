import axios from "axios";
import { API_BASE_PATH } from "../config/apiConfig";

const api = axios.create({
  baseURL: "http://localhost:5000" + API_BASE_PATH,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

async function refreshToken() {
  const refreshResponse = await fetch("http://localhost:5000/api/1/refresh", {
    method: "POST",
    credentials: "include",
  });

  return refreshResponse;
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        console.log("unauthorized, attempting to refresh token...");

        const refreshResponse = await api.post("/refresh");
        if (refreshResponse.status == 200) {
          return api(originalRequest);
        } else {
          return Promise.reject(refreshResponse);
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    } else {
      console.log(error);
    }

    return Promise.reject(error);
  }
);

export default api;
