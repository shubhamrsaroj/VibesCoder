const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_AUTH_BASE = 'https://accounts.spotify.com';

// Get these from your environment variables
const SPOTIFY_CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const BACKEND_URL = process.env.REACT_APP_API_URL || 'https://vibescoder.onrender.com';
const REDIRECT_URI = `${BACKEND_URL}/api/spotify/callback`;

// Debug logging
console.log('Spotify service initialized with:', { BACKEND_URL, REDIRECT_URI });

// Helper function to get headers
const getHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
});

// Helper function to refresh token
const refreshAccessToken = async () => {
  try {
    const refresh_token = localStorage.getItem('spotify_refresh_token');
    if (!refresh_token) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${BACKEND_URL}/api/spotify/refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    localStorage.setItem('spotify_token', data.access_token);
    return data.access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    localStorage.removeItem('spotify_token');
    localStorage.removeItem('spotify_refresh_token');
    throw new Error('Authentication failed');
  }
};

// Helper function to handle response
const handleResponse = async (response, retryCount = 0) => {
  if (!response.ok) {
    // Handle 401 (Unauthorized) and 403 (Forbidden) with token refresh
    if ((response.status === 401 || response.status === 403) && retryCount === 0) {
      try {
        // Try to refresh the token
        const newToken = await refreshAccessToken();
        // Retry the original request with the new token
        const retryResponse = await fetch(response.url, {
          method: response.method || 'GET',
          headers: getHeaders(newToken),
          body: response.method !== 'GET' && response.method !== 'HEAD' ? response.body : undefined
        });
        return handleResponse(retryResponse, retryCount + 1);
      } catch (error) {
        localStorage.removeItem('spotify_token');
        throw new Error('Authentication failed');
      }
    }

    // Handle specific 403 Forbidden errors
    if (response.status === 403) {
      const errorData = await response.json();
      if (errorData.premiumRequired) {
        throw new Error('Premium account required');
      }
    }
    
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  try {
    const data = await response.json();
    // Check if the response has a data property
    return data.data || data;
  } catch (error) {
    console.error('Error parsing response:', error);
    throw new Error('Failed to parse response');
  }
};

// Check if we're in a popup window
const isPopup = () => {
  return window.opener && window.opener !== window;
};

// Function to detect if we're on the Netlify site
const isNetlifySite = () => {
  return window.location.hostname.includes('netlify.app') || 
         process.env.NODE_ENV === 'production';
};

export const loginToSpotify = async () => {
  try {
    console.log('Initiating Spotify login...');
    
    // If we're on the Netlify production site, default to redirect method
    // as it's more reliable with CORS and popup issues
    if (isNetlifySite()) {
      console.log('Production site detected, using redirect method');
      return await loginToSpotifyRedirect();
    }
    
    // Check if popups are allowed
    // If we've had issues with popups before, use the redirect method
    if (localStorage.getItem('spotify_popup_blocked') === 'true') {
      console.log('Previous popup issues detected, using redirect method');
      return await loginToSpotifyRedirect();
    }
    
    // First check if we can open popups at all
    const testPopup = window.open('about:blank', '_blank', 'width=1,height=1');
    if (!testPopup || testPopup.closed || typeof testPopup.closed === 'undefined') {
      console.error('Popup blocked by browser');
      localStorage.setItem('spotify_popup_blocked', 'true');
      // If popup is blocked, fall back to redirect method
      return await loginToSpotifyRedirect();
    }
    testPopup.close();
    
    // Get auth URL from backend
    console.log('Fetching auth URL from:', `${BACKEND_URL}/api/spotify/login`);
    const response = await fetch(`${BACKEND_URL}/api/spotify/login`);
    if (!response.ok) {
      console.error('Failed to get login URL:', response.status, response.statusText);
      throw new Error(`Failed to get login URL: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.authUrl) {
      console.error('No auth URL in response:', data);
      throw new Error('Failed to get authentication URL from server');
    }
    
    console.log('Got auth URL:', data.authUrl);
    return new Promise((resolve, reject) => {
      try {
        // Calculate centered position for popup
        const width = 450;
        const height = 730;
        const left = (window.screen.width / 2) - (width / 2);
        const top = (window.screen.height / 2) - (height / 2);
        
        // Open popup
        const popup = window.open(
          data.authUrl,
          'Spotify Login',
          `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        if (!popup) {
          console.error('Popup was blocked');
          localStorage.setItem('spotify_popup_blocked', 'true');
          reject(new Error('Popup was blocked by the browser. Please disable popup blocker for this site.'));
          return;
        }
        
        // Try to focus the popup
        popup.focus();

        // Handle messages from the popup
        const handleMessage = (event) => {
          // Log the event for debugging
          console.log('Received message event:', {
            origin: event.origin,
            data: event.data,
            hasEventData: !!event.data
          });
          
          // Safely check event data
          if (!event.data) return;
          
          if (event.data.type === 'spotify-token') {
            console.log('Received spotify token from callback');
            window.localStorage.setItem('spotify_token', event.data.access_token);
            window.localStorage.setItem('spotify_refresh_token', event.data.refresh_token);
            window.removeEventListener('message', handleMessage);
            clearInterval(checkClosed);
            clearTimeout(timeoutId);
            popup.close();
            resolve(true);
          } else if (event.data.type === 'spotify-error') {
            console.error('Spotify auth error:', event.data.error);
            window.removeEventListener('message', handleMessage);
            clearInterval(checkClosed);
            clearTimeout(timeoutId);
            popup.close();
            reject(new Error(event.data.error || 'Authentication failed'));
          }
        };

        window.addEventListener('message', handleMessage);

        // Check if popup is closed periodically
        const checkClosed = setInterval(() => {
          if (!popup || popup.closed) {
            clearInterval(checkClosed);
            clearTimeout(timeoutId);
            window.removeEventListener('message', handleMessage);
            console.log('Authentication popup was closed');
            localStorage.setItem('spotify_popup_closed', 'true');
            reject(new Error('Authentication process was cancelled. Please try again.'));
          }
        }, 1000);
        
        // Set a timeout after which we consider the authentication failed
        const timeoutId = setTimeout(() => {
          if (popup && !popup.closed) {
            console.log('Authentication timed out');
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
            popup.close();
            reject(new Error('Authentication timed out. Please try again.'));
          }
        }, 300000); // 5 minutes max
      } catch (popupError) {
        console.error('Error creating popup:', popupError);
        // Fall back to redirect method
        loginToSpotifyRedirect()
          .then(resolve)
          .catch(reject);
      }
    });
  } catch (error) {
    console.error('Spotify login error:', error);
    // If there's any error in the process, try redirect login as fallback
    try {
      return await loginToSpotifyRedirect();
    } catch (redirectError) {
      console.error('Redirect login also failed:', redirectError);
      throw error; // Throw the original error
    }
  }
};

// Direct URL login option that doesn't use popups
export const loginToSpotifyRedirect = async () => {
  try {
    console.log('Initiating Spotify redirect login...');
    
    const response = await fetch(`${BACKEND_URL}/api/spotify/login`);
    if (!response.ok) {
      throw new Error(`Failed to get login URL: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.authUrl) {
      // Save the current URL so we can redirect back after auth
      localStorage.setItem('spotify_redirect_url', window.location.href);
      
      console.log('Redirecting to Spotify auth:', data.authUrl);
      // Redirect the whole page instead of opening a popup
      window.location.href = data.authUrl;
      return true;
    } else {
      throw new Error('Failed to get authentication URL from server');
    }
  } catch (error) {
    console.error('Spotify redirect login error:', error);
    throw error;
  }
};

export const getCurrentTrack = async (token) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/spotify/now-playing`, {
      headers: getHeaders(token)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error getting current track:', error);
    throw error;
  }
};

export const playTrack = async (token, options = {}) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/spotify/play`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(options)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error playing track:', error);
    throw error;
  }
};

export const pauseTrack = async (token) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/spotify/pause`, {
      method: 'PUT',
      headers: getHeaders(token)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error pausing track:', error);
    throw error;
  }
};

export const nextTrack = async (token) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/spotify/next`, {
      method: 'POST',
      headers: getHeaders(token)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error skipping to next track:', error);
    throw error;
  }
};

export const previousTrack = async (token) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/spotify/previous`, {
      method: 'POST',
      headers: getHeaders(token)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error going to previous track:', error);
    throw error;
  }
};

export const searchTracks = async (token, query) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/spotify/search?q=${encodeURIComponent(query)}`, {
      headers: getHeaders(token)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error searching tracks:', error);
    throw error;
  }
};

export const getUserPlaylists = async (token) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/spotify/playlists`, {
      headers: getHeaders(token)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error getting playlists:', error);
    throw error;
  }
};

export const getPlaylistTracks = async (token, playlistId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/spotify/playlists/${playlistId}/tracks`, {
      headers: getHeaders(token)
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error getting playlist tracks:', error);
    throw error;
  }
};

export const playPlaylistTrack = async (token, uri, deviceId = null) => {
  try {
    const options = {
      uris: [uri]
    };
    if (deviceId) {
      options.device_id = deviceId;
    }
    return await playTrack(token, options);
  } catch (error) {
    console.error('Error playing playlist track:', error);
    throw error;
  }
}; 
