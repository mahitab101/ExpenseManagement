import axios from "axios";
import { getStoredAccessToken } from "./authToken";

 const api = axios.create({
  baseURL: "http://localhost:5273/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, 
});

api.interceptors.request.use((config) => {
  const accessToken = getStoredAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isRefreshRequest = error.config.url.includes("/Accounts/refreshToken");

    if (error.response?.status === 401 && !isRefreshRequest) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api