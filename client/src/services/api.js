import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const baseURL = `${API_URL}/api`;

console.log('API Service initialized with baseURL:', baseURL);

const api = axios.create({
  baseURL,
  withCredentials: true, // Important for sending cookies with requests
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - adds auth token to requests if available
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
      // For debugging
      console.log(`Auth token added to ${config.url} request`);
    } else {
      console.log(`No auth token available for ${config.url} request`);
    }
    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    const { response } = error;
    
    // Handle authentication errors
    if (response && response.status === 401) {
      console.error('Authentication error (401):', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if we're not already on the login page
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        console.log('Redirecting to login page due to auth error');
        // Use a small delay to allow the current operation to complete
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
    
    // Handle server errors
    if (response && response.status >= 500) {
      console.error('Server error:', response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api; 
