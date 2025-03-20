const express = require('express');
const router = express.Router();
const axios = require('axios');

// Initialize Spotify login
router.get('/login', (req, res) => {
  const scope = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'app-remote-control',
    'playlist-read-private',
    'playlist-read-collaborative'
  ].join(' ');
  
  const state = Math.random().toString(36).substring(7);
  
  const authUrl = `https://accounts.spotify.com/authorize?` +
    `client_id=${process.env.SPOTIFY_CLIENT_ID}` +
    `&response_type=code` +
    `&redirect_uri=${process.env.SPOTIFY_REDIRECT_URI}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&state=${state}` +
    `&show_dialog=true`;
  
  res.json({ authUrl });
});

// Spotify authentication callback
router.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  
  try {
    const tokenResponse = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      params: {
        code: code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const { access_token, refresh_token } = tokenResponse.data;
    
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ 
              type: 'spotify-token',
              access_token: '${access_token}',
              refresh_token: '${refresh_token}'
            }, '*');
            window.close();
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Spotify auth error:', error);
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ 
              type: 'spotify-error',
              error: 'Authentication failed'
            }, '*');
            window.close();
          </script>
        </body>
      </html>
    `);
  }
});

// Get current playing track
router.get('/now-playing', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    handleSpotifyError(error, res);
  }
});

// Play track
router.put('/play', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    await axios.put('https://api.spotify.com/v1/me/player/play', 
      req.body,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    res.json({ success: true });
  } catch (error) {
    handleSpotifyError(error, res);
  }
});

// Pause track
router.put('/pause', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    await axios.put('https://api.spotify.com/v1/me/player/pause', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    handleSpotifyError(error, res);
  }
});

// Skip to next track
router.post('/next', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    await axios.post('https://api.spotify.com/v1/me/player/next', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    handleSpotifyError(error, res);
  }
});

// Go to previous track
router.post('/previous', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    await axios.post('https://api.spotify.com/v1/me/player/previous', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    handleSpotifyError(error, res);
  }
});

// Get user's playlists
router.get('/playlists', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    handleSpotifyError(error, res);
  }
});

// Get playlist tracks
router.get('/playlists/:playlistId/tracks', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const { playlistId } = req.params;
    const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    handleSpotifyError(error, res);
  }
});

// Refresh token endpoint
router.post('/refresh_token', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        message: 'No refresh token provided'
      });
    }

    const response = await axios({
          method: 'post',
          url: 'https://accounts.spotify.com/api/token',
          params: {
            grant_type: 'refresh_token',
        refresh_token: refresh_token
          },
          headers: {
            'Authorization': 'Basic ' + Buffer.from(
              process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
            ).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        
    res.json({
      success: true,
      access_token: response.data.access_token
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Failed to refresh token'
    });
  }
});

// Search for tracks, albums, artists, etc.
router.get('/search', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const { q: query, type = 'track', limit = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const response = await axios.get(`https://api.spotify.com/v1/search`, {
      params: {
        q: query,
        type,
        limit
      },
          headers: {
        'Authorization': `Bearer ${token}`
          }
        });
        
    res.json({
          success: true,
          data: response.data
        });
  } catch (error) {
    handleSpotifyError(error, res);
  }
});

// Helper function to handle Spotify API errors
function handleSpotifyError(error, res) {
  if (error.response) {
    if (error.response.status === 401) {
        return res.status(401).json({
          success: false,
          message: 'Spotify authentication failed'
        });
      }
    if (error.response.status === 403) {
      console.warn('Spotify API 403 error:', error.response.data);
      if (error.response.data.error?.reason === 'PREMIUM_REQUIRED') {
        return res.status(403).json({
          success: false,
          message: 'This functionality is restricted to Spotify Premium users',
          premiumRequired: true
        });
      }
      return res.status(403).json({
        success: false,
        message: error.response.data.error?.message || 'Spotify access forbidden'
      });
    }
    if (error.response.data && error.response.data.error) {
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data.error.message || 'Spotify API error',
        code: error.response.data.error.status || error.response.status
      });
    }
    return res.status(error.response.status).json({
      success: false,
      message: 'Spotify API error'
    });
    }
    
    console.error('Spotify API error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }

module.exports = router; 