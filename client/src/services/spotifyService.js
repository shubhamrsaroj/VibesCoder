const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_AUTH_BASE = 'https://accounts.spotify.com';

// Get these from your environment variables
const SPOTIFY_CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const BACKEND_URL = process.env.REACT_APP_API_URL || 'https://vibescoder.onrender.com';
const REDIRECT_URI = `${BACKEND_URL}/api/spotify/callback`;

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

export const loginToSpotify = async () => {
  try {
    console.log('Initiating Spotify login...');
    
    // First check if we can open popups at all
    const testPopup = window.open('about:blank', '_blank', 'width=1,height=1');
    if (!testPopup || testPopup.closed || typeof testPopup.closed === 'undefined') {
      console.error('Popup blocked by browser');
      throw new Error('Popup blocked by browser. Please disable popup blocker for this site.');
    }
    testPopup.close();
    
    const response = await fetch(`${BACKEND_URL}/api/spotify/login`);
    const data = await response.json();
    
    if (data.authUrl) {
      return new Promise((resolve, reject) => {
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
          reject(new Error('Popup was blocked by the browser. Please disable popup blocker for this site.'));
          return;
        }
        
        // Try to focus the popup
        popup.focus();

        // Handle messages from the popup
        const handleMessage = (event) => {
          // Check origin for security if needed
          // if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'spotify-token') {
            window.localStorage.setItem('spotify_token', event.data.access_token);
            window.localStorage.setItem('spotify_refresh_token', event.data.refresh_token);
            window.removeEventListener('message', handleMessage);
            clearInterval(checkClosed);
            popup.close();
            resolve(true);
          } else if (event.data.type === 'spotify-error') {
            window.removeEventListener('message', handleMessage);
            clearInterval(checkClosed);
            popup.close();
            reject(new Error(event.data.error || 'Authentication failed'));
          }
        };

        window.addEventListener('message', handleMessage);

        // Check if popup is closed periodically
        const checkClosed = setInterval(() => {
          if (!popup || popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
            reject(new Error('Authentication process was cancelled. Please try again.'));
          }
        }, 1000);
        
        // Set a timeout after which we consider the authentication failed
        setTimeout(() => {
          if (!popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
            popup.close();
            reject(new Error('Authentication timed out. Please try again.'));
          }
        }, 300000); // 5 minutes max
      });
    } else {
      throw new Error('Failed to get authentication URL from server');
    }
  } catch (error) {
    console.error('Spotify login error:', error);
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
