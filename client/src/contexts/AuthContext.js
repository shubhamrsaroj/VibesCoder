import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';
import { isAuthenticated as checkAuthToken, getToken } from '../services/authService';
import { useNavigate } from 'react-router-dom';

// Implement clearLocalProjectData locally since it's missing from projectService
const clearLocalProjectData = () => {
  try {
    // Clear canvas data
    localStorage.removeItem('canvasData');
    localStorage.removeItem('canvasThumb');
    localStorage.removeItem('vibecoderDrawingState');
    localStorage.removeItem('vibecoderSaveStatus');
    localStorage.removeItem('vibecoderSaveStatusTimestamp');
    
    console.log('Cleared local project data from localStorage');
  } catch (error) {
    console.error('Error clearing local project data:', error);
  }
};

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastVerified, setLastVerified] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Verify token and user data
  const verifyAuth = async (force = false) => {
    // Only verify if forced or if last verification was > 5 minutes ago
    const now = Date.now();
    if (!force && lastVerified && now - lastVerified < 300000) {
      return currentUser;
    }
    
    try {
      const response = await api.get('/auth/check');
      if (response.data && response.data.isAuthenticated && response.data.user) {
        const userData = response.data.user;
        setCurrentUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setLastVerified(now);
        setError(null);
        setIsAuthenticated(true);
        return userData;
      } else {
        throw new Error('Authentication failed');
      }
    } catch (err) {
      console.error('Auth verification failed:', err);
      
      // Only clear user if we don't already have one or if forced
      if (force || !currentUser) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
        setError('Authentication failed. Please log in again.');
        setIsAuthenticated(false);
      }
      
      return null;
    }
  };

  useEffect(() => {
    // Check if user is logged in when app loads
    const checkAuthStatus = async () => {
      try {
        console.log('Checking authentication status...');
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log('No token found, user is not authenticated');
          setCurrentUser(null);
          setLoading(false);
          setIsAuthenticated(false);
          return;
        }
        
        // Check if token is expired (JWT)
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const exp = payload.exp * 1000; // Convert to milliseconds
            
            if (exp && exp < Date.now()) {
              console.warn('Token has expired, clearing authentication');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setCurrentUser(null);
              setLoading(false);
              setError('Your session has expired. Please log in again.');
              setIsAuthenticated(false);
              return;
            }
          }
        } catch (tokenError) {
          console.error('Error checking token expiration:', tokenError);
          // Continue with verification anyway
        }
        
        // Check if user data is already in localStorage to load immediately
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
          try {
            const userData = JSON.parse(cachedUser);
            console.log('Found cached user data', userData);
            setCurrentUser(userData);
            setIsAuthenticated(true);
          } catch (e) {
            console.error('Error parsing cached user:', e);
          }
        }
        
        // Still fetch fresh data from server
        console.log('Fetching fresh user data from server...');
        try {
          const response = await api.get('/auth/me');
          if (response.data && response.data.user) {
            console.log('Retrieved user data from server', response.data.user);
            setCurrentUser(response.data.user);
            // Update cached user data
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setLastVerified(Date.now());
            setError(null);
            setIsAuthenticated(true);
          } else {
            console.warn('Server returned no user data');
          }
        } catch (apiError) {
          console.error('API error fetching user data:', apiError);
          // If API call fails but we have cached user data, keep using that
          if (!currentUser && cachedUser) {
            console.log('Using cached user data despite API error');
            setIsAuthenticated(true);
          } else {
            // If no cached data or error is severe, clear authentication
            console.log('Clearing authentication due to API error');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setCurrentUser(null);
            setError('Authentication failed. Please log in again.');
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
        setError('Authentication session expired. Please log in again.');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      setLastVerified(Date.now());
      setError(null);
      setIsAuthenticated(true);
      
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    clearLocalProjectData(); // Clear any project data on logout
    setCurrentUser(null);
    setLastVerified(0);
    setIsAuthenticated(false);
    setLoading(false);
    
    // Redirect to login page
    navigate('/login');
  }, [navigate]);

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', userData);
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      setLastVerified(Date.now());
      setError(null);
      setIsAuthenticated(true);
      
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    register,
    isAuthenticated,
    verifyAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 