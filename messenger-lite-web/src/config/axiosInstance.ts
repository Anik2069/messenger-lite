import { HOST } from '@/constant';
import axios from 'axios';

const getAccessToken = () => {
  return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
};

const axiosInstance = axios.create({
  baseURL: HOST,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

const redirectToLogin = () => {
  window.location.href = '/auth?type=login';
};

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const OriginalRequest = error.config;
    if (error.response && error.response.status === 401 && !OriginalRequest._retry) {
      OriginalRequest._retry = true;
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
