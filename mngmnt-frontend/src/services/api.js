import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (cfg) => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      cfg.headers.Authorization = `Bearer ${storedToken}`;
    }
    return cfg;
  },
  (err) => Promise.reject(err)
);

// Handle responses and errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const forceLogout = err.response?.data?.forceLogout;

    if (forceLogout || status === 401) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

// Auth API calls
export const checkSignupAvailable = () => api.get("/auth/signup-available");
export const signup = (data) => api.post("/auth/signup", data);
export const login = (data) => api.post("/auth/login", data);
export const getProfile = () => api.get("/auth/profile");
export const updateProfile = (data) => api.put("/auth/profile", data);
export const changePassword = (data) => api.put("/auth/change-password", data);

export default api;