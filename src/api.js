import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // 🔥 penting untuk CORS + cookie
});

// Attach token ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle error response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🔥 jangan terlalu agresif logout
    if (error.response?.status === 401) {
      console.warn("Unauthorized, clearing token...");
      localStorage.removeItem("token");
    }

    return Promise.reject(error);
  }
);

export default api;