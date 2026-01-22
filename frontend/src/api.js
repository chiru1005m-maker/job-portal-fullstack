import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true 
});

// Request Interceptor: Injects your token from storage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error for debugging
    console.error("API Error Status:", error.response?.status);
    
    // Optional: If token is expired (401), you could clear local storage here
    if (error.response?.status === 401) {
       // localStorage.clear(); 
    }
    
    return Promise.reject(error); 
  }
);

/**
 * Helper to save auth data
 */
export const setAuthToken = (data, role, username) => {
  if (data && typeof data === 'object') {
    if (data.token) localStorage.setItem('token', data.token);
    if (data.role) localStorage.setItem('role', data.role);
    if (data.username) localStorage.setItem('username', data.username);
  } else if (data) {
    localStorage.setItem('token', data);
    if (role) localStorage.setItem('role', role);
    if (username) localStorage.setItem('username', username);
  }
};

/**
 * NEW: Helper for searching jobs
 * Usage: fetchJobs({ title: 'Java', location: 'Remote' })
 */
export const fetchJobs = (params = {}) => {
  return api.get('/api/jobs', { params });
};

export default api;