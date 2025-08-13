import { HOST } from "@/constant";
import axios from "axios";

const getAccessToken = () => {
  typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
};

const axiosInstance = axios.create({
  baseURL: HOST,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const redirectToLogin = () => {
  window.location.href = "/login";
};

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = getAccessToken();
    if (token !== null) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (!config.headers.Authorization) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const OriginalRequest = error.config;
    if (error.response.status === 401 && !OriginalRequest._retry) {
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
