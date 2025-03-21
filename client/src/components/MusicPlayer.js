import { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  alpha,
  Button,
  Slider,
  Stack,
  CircularProgress,
  Tooltip,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  VolumeUp as VolumeUpIcon,
  VolumeDown as VolumeDownIcon,
  VolumeMute as VolumeMuteIcon,
  Login as LoginIcon,
  QueueMusic as QueueMusicIcon,
  MusicNote as MusicNoteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { 
  getCurrentTrack, 
  loginToSpotify, 
  playTrack, 
  pauseTrack, 
  nextTrack, 
  previousTrack,
  getUserPlaylists,
  getPlaylistTracks,
  playPlaylistTrack
} from '../services/spotifyService';

const MusicPlayer = ({ open, onClose, anchorEl }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [premiumError, setPremiumError] = useState(false);

  // Listen for SDK Ready Event
  useEffect(() => {
    const handleSDKReady = () => {
      setSdkReady(true);
    };

    if (window.Spotify) {
      setSdkReady(true);
    } else {
      window.addEventListener('spotify-sdk-ready', handleSDKReady);
    }

    return () => {
      window.removeEventListener('spotify-sdk-ready', handleSDKReady);
    };
  }, []);

  // Initialize Player when SDK is ready
  useEffect(() => {
    const token = localStorage.getItem('spotify_token');
    setIsAuthenticated(!!token);

    const initializePlayer = async () => {
      if (!token || !sdkReady || !window.Spotify) {
        setIsLoading(false);
        return;
      }

      try {
        const newPlayer = new window.Spotify.Player({
          name: 'VibeCoder Web Player',
          getOAuthToken: cb => { cb(token); }
        });

        newPlayer.addListener('initialization_error', ({ message }) => {
          console.error('Failed to initialize:', message);
          setIsLoading(false);
        });

        newPlayer.addListener('authentication_error', ({ message }) => {
          console.error('Failed to authenticate:', message);
          localStorage.removeItem('spotify_token');
          setIsAuthenticated(false);
          setIsLoading(false);
        });

        newPlayer.addListener('account_error', ({ message }) => {
          console.error('Failed to validate Spotify account:', message);
          // Set premium error state
          setPremiumError(true);
          
          // Don't set loading to false yet, we'll still try to fetch data
          // This will allow non-premium users to still browse playlists
          
          // Display a console warning about premium requirement
          console.warn('Spotify Premium is required for playback functionality, but you can still browse your playlists and view what\'s currently playing.');
        });

        newPlayer.addListener('playback_error', ({ message }) => {
          console.error('Failed to perform playback:', message);
        });

        newPlayer.addListener('player_state_changed', state => {
          if (state) {
            setCurrentTrack(state.track_window.current_track);
            setIsPlaying(!state.paused);
          }
        });

        newPlayer.addListener('ready', ({ device_id }) => {
          console.log('Ready with Device ID', device_id);
          setDeviceId(device_id);
          setIsLoading(false);
        });

        newPlayer.addListener('not_ready', ({ device_id }) => {
          console.log('Device ID is not ready for playback', device_id);
        });

        // Try to connect to the player, but continue with API calls even if this fails
        try {
          await newPlayer.connect();
          setPlayer(newPlayer);
        } catch (connectError) {
          console.error('Error connecting to Spotify player:', connectError);
          // Still continue to fetch data even if player connection fails
        }

        // Fetch initial data regardless of player connection
        fetchCurrentTrack(token);
        fetchPlaylists(token);
        
        // Set up interval to refresh current track
        const interval = setInterval(() => {
          fetchCurrentTrack(token);
        }, 5000);
        
        // Make sure loading is set to false regardless of player connection
        setIsLoading(false);
        
        return () => {
          clearInterval(interval);
        };
      } catch (error) {
        console.error('Error initializing Spotify player:', error);
        setIsLoading(false);
      }
    };

    initializePlayer();

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [sdkReady]);

  const fetchCurrentTrack = async (token) => {
    try {
      const track = await getCurrentTrack(token);
      // The currently playing response might be null if nothing is playing
      if (track) {
        setCurrentTrack(track);
        setIsPlaying(track?.is_playing || false);
      } else {
        setCurrentTrack(null);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error fetching track:', error);
      if (error.message.includes('401')) {
        localStorage.removeItem('spotify_token');
        setIsAuthenticated(false);
      }
      setCurrentTrack(null);
    }
  };

  const fetchPlaylists = async (token) => {
    try {
      setIsLoadingPlaylists(true);
      const userPlaylists = await getUserPlaylists(token);
      setPlaylists(Array.isArray(userPlaylists?.items) ? userPlaylists.items : []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      setPlaylists([]);
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  const fetchPlaylistTracks = async (playlistId) => {
    try {
      const token = localStorage.getItem('spotify_token');
      if (!token) return;

      setIsLoadingTracks(true);
      const tracks = await getPlaylistTracks(token, playlistId);
      setPlaylistTracks(Array.isArray(tracks?.items) ? tracks.items : []);
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
      setPlaylistTracks([]);
    } finally {
      setIsLoadingTracks(false);
    }
  };

  const handlePlaylistClick = async (playlist) => {
    setSelectedPlaylist(playlist);
    await fetchPlaylistTracks(playlist.id);
  };

  const handleTrackClick = async (track) => {
    try {
      const token = localStorage.getItem('spotify_token');
      if (!token) {
        console.error("No Spotify token available");
        return;
      }
      
      setIsLoading(true);
      
      // Try Web Playback SDK first if available
      if (player && deviceId) {
        try {
      await playPlaylistTrack(token, track.track.uri, deviceId);
      setIsPlaying(true);
          return;
        } catch (error) {
          // If SDK fails, we'll try the REST API approach below
          console.warn("SDK playback failed, falling back to REST API:", error);
        }
      }
      
      // Fallback to standard REST API if SDK isn't available or failed
      try {
        await playPlaylistTrack(token, track.track.uri);
        
        // After playing, fetch current track to update UI
        setTimeout(() => fetchCurrentTrack(token), 500);
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing track with REST API:', error);
        
        // Check if this is a premium account error
        if (error.message.includes('Premium')) {
          setPremiumError(true);
          alert("Spotify Premium is required for playback. You can still browse your playlists and see what's currently playing.");
        } else if (error.message.includes('404')) {
          alert("Unable to connect to the Spotify service. Please ensure the server is running at http://localhost:5000");
        }
      }
    } catch (error) {
      console.error('Error in track playback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpotifyLogin = async () => {
    try {
      const success = await loginToSpotify();
      if (success) {
        setIsAuthenticated(true);
        const token = localStorage.getItem('spotify_token');
        if (token) {
          fetchCurrentTrack(token);
          fetchPlaylists(token);
        }
      }
    } catch (error) {
      console.error('Spotify login error:', error);
    }
  };

  const handlePlayPause = async () => {
    try {
      const token = localStorage.getItem('spotify_token');
      if (!token) {
        console.error("No Spotify token available");
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Try Web Playback SDK first if available
        if (player) {
          try {
            await player.togglePlay();
            // SDK handles the state updates automatically via event listeners
            return;
          } catch (sdkError) {
            console.warn("SDK playback failed, falling back to REST API:", sdkError);
          }
        }
        
        // Fallback to REST API method if player isn't available or failed
        if (isPlaying) {
          await pauseTrack(token);
        } else {
          await playTrack(token);
        }
        
        // Update state locally first for immediate UI feedback
        setIsPlaying(!isPlaying);
        
        // Refresh the current track status to ensure UI matches actual state
        setTimeout(() => fetchCurrentTrack(token), 500);
    } catch (error) {
      console.error('Playback error:', error);
        
        // Check for specific error types
        if (error.message.includes('Premium')) {
          setPremiumError(true);
          alert('Spotify Premium is required for playback control. You can still browse your playlists and see what\'s currently playing.');
        } else if (error.message.includes('404')) {
          alert('Server connection error. Please ensure the Spotify API server is running at http://localhost:5000');
        } else if (error.message.includes('401') || error.message.includes('403')) {
          alert('Authentication error. Please try connecting to Spotify again.');
          localStorage.removeItem('spotify_token');
          setIsAuthenticated(false);
        }
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('General playback error:', error);
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    try {
      const token = localStorage.getItem('spotify_token');
      if (!token) {
        console.error("No Spotify token available");
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Try Web Playback SDK first if available
        if (player) {
          try {
            await player.nextTrack();
            // SDK handles the state updates via event listeners
            return;
          } catch (sdkError) {
            console.warn("SDK next track failed, falling back to REST API:", sdkError);
          }
        }
        
        // Fallback to API method
        await nextTrack(token);
        
        // Refresh track info after changing tracks
        setTimeout(() => fetchCurrentTrack(token), 500);
      } catch (error) {
        console.error('Next track error:', error);
        
        // Check for specific error types
        if (error.message.includes('Premium')) {
          setPremiumError(true);
          alert('Spotify Premium is required for playback control');
        } else if (error.message.includes('404')) {
          alert('Server connection error. Please ensure the Spotify API server is running');
        }
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('General next track error:', error);
      setIsLoading(false);
    }
  };

  const handlePrevious = async () => {
    try {
      const token = localStorage.getItem('spotify_token');
      if (!token) {
        console.error("No Spotify token available");
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Try Web Playback SDK first if available
        if (player) {
          try {
            await player.previousTrack();
            // SDK handles the state updates via event listeners
            return;
          } catch (sdkError) {
            console.warn("SDK previous track failed, falling back to REST API:", sdkError);
          }
        }
        
        // Fallback to API method
        await previousTrack(token);
        
        // Refresh track info after changing tracks
        setTimeout(() => fetchCurrentTrack(token), 500);
      } catch (error) {
        console.error('Previous track error:', error);
        
        // Check for specific error types
        if (error.message.includes('Premium')) {
          setPremiumError(true);
          alert('Spotify Premium is required for playback control');
        } else if (error.message.includes('404')) {
          alert('Server connection error. Please ensure the Spotify API server is running');
        }
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('General previous track error:', error);
      setIsLoading(false);
    }
  };

  const handleVolumeChange = async (event, newValue) => {
    try {
      if (!player) return;
      await player.setVolume(newValue / 100);
      setVolume(newValue);
    } catch (error) {
      console.error('Volume change error:', error);
    }
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeMuteIcon />;
    if (volume < 50) return <VolumeDownIcon />;
    return <VolumeUpIcon />;
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 1 && playlists.length === 0) {
      const token = localStorage.getItem('spotify_token');
      if (token) fetchPlaylists(token);
    }
  };

  const handleRefreshPlaylists = () => {
    const token = localStorage.getItem('spotify_token');
    if (token) fetchPlaylists(token);
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          width: 350,
          height: 500,
          background: 'linear-gradient(to bottom, #0F172A, #1E293B)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          border: `1px solid ${alpha('#fff', 0.1)}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }
      }}
    >
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : !isAuthenticated ? (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={handleSpotifyLogin}
            sx={{
              background: 'linear-gradient(90deg, #1DB954, #1aa34a)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(90deg, #1aa34a, #168d40)',
              }
            }}
          >
            Connect Spotify
          </Button>
        </Box>
      ) : (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              borderBottom: 1,
              borderColor: alpha('#fff', 0.1),
              '& .MuiTab-root': {
                color: alpha('#fff', 0.7),
                '&.Mui-selected': {
                  color: '#1DB954'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#1DB954'
              }
            }}
          >
            <Tab label="Now Playing" />
            <Tab label="Playlists" />
          </Tabs>

          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {activeTab === 0 ? (
              <>
                {premiumError && (
                  <Box sx={{ 
                    p: 2, 
                    mb: 2, 
                    backgroundColor: alpha('#ff9800', 0.1), 
                    borderLeft: '4px solid #ff9800',
                    borderRadius: '0 4px 4px 0'
                  }}>
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.9) }}>
                      Spotify Premium is required for full playback functionality.
                      You can still browse playlists and see what's playing.
                    </Typography>
                  </Box>
                )}
                {currentTrack && currentTrack.item ? (
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Box
                        component="img"
                        src={currentTrack.item.album?.images?.[0]?.url || ''}
                        alt={currentTrack.item.album?.name || 'Album Cover'}
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 1,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            color: 'white',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {currentTrack.item.name || 'Unknown Track'}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: alpha('#fff', 0.7),
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {currentTrack.item.artists ? 
                            currentTrack.item.artists.map(a => a.name).join(', ') : 
                            'Unknown Artist'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Tooltip title="Previous">
                        <IconButton 
                          onClick={handlePrevious}
                          size="small"
                          sx={{ color: alpha('#fff', 0.7) }}
                        >
                          <SkipPreviousIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title={isPlaying ? "Pause" : "Play"}>
                        <IconButton 
                          onClick={handlePlayPause}
                          sx={{
                            p: 1,
                            color: 'white',
                            background: 'linear-gradient(90deg, #1DB954, #1aa34a)',
                            '&:hover': {
                              background: 'linear-gradient(90deg, #1aa34a, #168d40)',
                            }
                          }}
                        >
                          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Next">
                        <IconButton 
                          onClick={handleNext}
                          size="small"
                          sx={{ color: alpha('#fff', 0.7) }}
                        >
                          <SkipNextIcon />
                        </IconButton>
                      </Tooltip>

                      {!premiumError && (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          flex: 1,
                          ml: 1
                        }}>
                          <IconButton size="small" sx={{ color: alpha('#fff', 0.7) }}>
                            {getVolumeIcon()}
                          </IconButton>
                          <Slider
                            size="small"
                            value={volume}
                            onChange={handleVolumeChange}
                            sx={{
                              ml: 1,
                              color: '#1DB954',
                              '& .MuiSlider-thumb': {
                                width: 8,
                                height: 8,
                                '&:hover, &.Mui-focusVisible': {
                                  boxShadow: '0 0 0 8px rgba(29, 185, 84, 0.16)'
                                }
                              },
                              '& .MuiSlider-rail': {
                                opacity: 0.3
                              }
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography sx={{ color: alpha('#fff', 0.7) }}>
                      No track playing
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              <Box>
                <Box sx={{ 
                  p: 1, 
                  display: 'flex', 
                  justifyContent: 'flex-end',
                  borderBottom: 1,
                  borderColor: alpha('#fff', 0.1)
                }}>
                  <Tooltip title="Refresh playlists">
                    <IconButton 
                      size="small" 
                      onClick={handleRefreshPlaylists}
                      sx={{ color: alpha('#fff', 0.7) }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Box>

                {isLoadingPlaylists ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : selectedPlaylist ? (
                  <>
                    <Box sx={{ p: 1 }}>
                      <Button
                        startIcon={<QueueMusicIcon />}
                        onClick={() => setSelectedPlaylist(null)}
                        sx={{ color: alpha('#fff', 0.7) }}
                      >
                        Back to Playlists
                      </Button>
                    </Box>
                    <List sx={{ p: 0 }}>
                      {isLoadingTracks ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                          <CircularProgress size={24} />
                        </Box>
                      ) : Array.isArray(playlistTracks) && playlistTracks.length > 0 ? (
                        playlistTracks.map((item, index) => (
                          <ListItem 
                            key={`track-${item.track?.id || index}-${Math.random().toString(36).substr(2, 5)}`}
                            disablePadding
                            divider
                          >
                            <ListItemButton 
                              onClick={() => item.track && handleTrackClick(item)}
                              sx={{
                                '&:hover': {
                                  backgroundColor: alpha('#fff', 0.05)
                                }
                              }}
                            >
                              <ListItemIcon sx={{ color: alpha('#fff', 0.7) }}>
                                <MusicNoteIcon />
                              </ListItemIcon>
                              <ListItemText 
                                primary={item.track?.name || 'Unknown Track'}
                                secondary={item.track?.artists ? item.track.artists.map(a => a.name).join(', ') : 'Unknown Artist'}
                                primaryTypographyProps={{
                                  sx: { 
                                    color: 'white',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }
                                }}
                                secondaryTypographyProps={{
                                  sx: { 
                                    color: alpha('#fff', 0.7),
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))
                      ) : (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                          <Typography sx={{ color: alpha('#fff', 0.7) }}>
                            No tracks found in this playlist
                          </Typography>
                        </Box>
                      )}
                    </List>
                  </>
                ) : (
                  <List sx={{ p: 0 }}>
                    {Array.isArray(playlists) && playlists.length > 0 ? (
                      playlists.map((playlist, index) => (
                        <ListItem 
                          key={`playlist-${playlist.id || index}-${Math.random().toString(36).substr(2, 5)}`}
                          disablePadding
                          divider
                        >
                          <ListItemButton 
                            onClick={() => handlePlaylistClick(playlist)}
                            sx={{
                              '&:hover': {
                                backgroundColor: alpha('#fff', 0.05)
                              }
                            }}
                          >
                            {playlist.images && playlist.images[0] && (
                              <Box
                                component="img"
                                src={playlist.images[0].url}
                                alt={playlist.name}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 1,
                                  mr: 2
                                }}
                              />
                            )}
                            <ListItemText 
                              primary={playlist.name}
                              secondary={playlist.tracks && `${playlist.tracks.total} tracks`}
                              primaryTypographyProps={{
                                sx: { 
                                  color: 'white',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }
                              }}
                              secondaryTypographyProps={{
                                sx: { 
                                  color: alpha('#fff', 0.7)
                                }
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))
                    ) : (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography sx={{ color: alpha('#fff', 0.7) }}>
                          No playlists found
                        </Typography>
                      </Box>
                    )}
                  </List>
                )}
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Popover>
  );
};

export default MusicPlayer; 