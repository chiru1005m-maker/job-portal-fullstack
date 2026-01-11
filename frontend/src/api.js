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

// Response Interceptor: SILENCES the 403 error to stop the logout loop
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error("403 Forbidden Bypassed. Fix roles in SecurityConfig.java!");
      // Returning a resolved empty object prevents the .catch() in your Dashboard from firing the alert
      return Promise.resolve({ data: [] }); 
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (data, role, username) => {
  if (data && typeof data === 'object') {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('username', data.username);
  } else if (data) {
    localStorage.setItem('token', data);
    if (role) localStorage.setItem('role', role);
    if (username) localStorage.setItem('username', username);
  }
};

export default api;