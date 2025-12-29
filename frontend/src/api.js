import axios from 'axios';

// This checks if there is a 'VITE_API_URL' environment variable (used in production)
// Otherwise, it falls back to your local Java server for testing
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: baseURL,
});

// Helper to attach the JWT token to every request automatically
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;