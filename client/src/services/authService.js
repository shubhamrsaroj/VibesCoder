const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Register new user
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Registration failed');
    }
    
    // Save token and user info in localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Login user
export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Login failed');
    }
    
    // Save token and user info in localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Also remove Spotify tokens to fully log out
  localStorage.removeItem('spotify_token');
  localStorage.removeItem('spotify_refresh_token');
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return null;
    }
    
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'x-auth-token': token
      }
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to get user data');
    }
    
    return data.user;
  } catch (error) {
    console.error('Get current user error:', error);
    // Clear token if it's invalid
    if (error.message.includes('not valid')) {
      logout();
    }
    throw error;
  }
};

// Check if user is logged in
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Get auth token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make authenticated requests
export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    ...options.headers || {},
    'x-auth-token': token
  };
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  const data = await response.json();
  
  if (!data.success && response.status === 401) {
    logout();
    throw new Error('Authentication failed, please login again');
  }
  
  return data;
}; 