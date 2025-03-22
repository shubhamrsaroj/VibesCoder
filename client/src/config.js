/**
 * Application configuration
 */

// API URL configuration with fallback to Render deployment
export const API_URL = process.env.REACT_APP_API_URL || 'https://vibescoder.onrender.com';

// Debug mode
export const DEBUG = process.env.NODE_ENV !== 'production';

// Log configuration details in non-production environments
if (DEBUG) {
  console.log('Config loaded:', {
    apiUrl: API_URL,
    environment: process.env.NODE_ENV,
    isDebug: DEBUG
  });
}
