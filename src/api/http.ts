import axios from 'axios';
import { tokenstore } from '../auth/tokenstore';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7128';

export const httpClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


httpClient.interceptors.request.use(
  (config) => {
    const token = tokenstore.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenstore.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default httpClient;
