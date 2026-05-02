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
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Redirect to login page
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );


api.interceptors.response.use(
  (response) => response,
  (error) => {
    // لا تحول المستخدم للـ login إذا فشل طلب الـ refresh نفسه
    // اتركه يفشل لكي يعالج useQuery الحالة ويظهر صفحة الـ login برفق
    const isRefreshRequest = error.config.url.includes("/Accounts/refreshToken");

    if (error.response?.status === 401 && !isRefreshRequest) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api