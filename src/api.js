import axios from "axios";

// Fallback agar tidak pernah undefined — cegah crash saat env tidak terbaca
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Attach token ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle error response — jangan auto-logout terlalu agresif
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized – token dihapus");
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default api;