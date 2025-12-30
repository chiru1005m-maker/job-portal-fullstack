import axios from 'axios';

// Matches the VITE_API_URL variable name in your code and Render settings
const baseURL = import.meta.env.VITE_API_URL || 'https://job-portal-api-lghb.onrender.com';

const api = axios.create({
  baseURL: baseURL,
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;