import axios from 'axios';

// 1. Matches the KEY name you have in Render Environment Variables
// 2. Fallback uses your LIVE BACKEND URL (not the frontend URL)
const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://job-portal-api-lghb.onrender.com';

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