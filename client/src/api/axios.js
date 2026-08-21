import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization Bearer header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('paysentinel_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for standard API error format & 401 unauth
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
        localStorage.removeItem('paysentinel_token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
