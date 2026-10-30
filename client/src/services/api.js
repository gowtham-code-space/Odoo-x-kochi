import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true, // Send HTTP-only cookies on every request
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Response interceptor: dispatch auth:expired event on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Let AuthContext handle the cleanup
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    return Promise.reject(error);
  }
);

export default api;

