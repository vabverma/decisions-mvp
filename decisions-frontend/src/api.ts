import axios from 'axios';

// Get API URL from window or environment
const getApiUrl = (): string => {
  // First check if window.__API_URL__ is set by server
  if (typeof window !== 'undefined' && (window as any).__API_URL__) {
    return (window as any).__API_URL__;
  }

  // Then check Vite environment variable (for local development)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // For production on Render, derive from current URL
  // If frontend is on decisions-mvp.onrender.com, backend is on decisions-backend.onrender.com
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('onrender.com')) {
      return `https://decisions-backend.onrender.com`;
    }
  }

  // Default for local development
  return 'http://localhost:3001';
};

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
