import { useState, useEffect } from 'react';
import {
  Dialog,
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

const SpotifyPlayer = ({ open, onClose, anchorEl }) => {
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

  useEffect(() => {
    const token = localStorage.getItem('spotify_token');
    setIsAuthenticated(!!token);
    setIsLoading(false);

    if (token) {
      fetchCurrentTrack(token);
      fetchPlaylists(token);
      const interval = setInterval(() => fetchCurrentTrack(token), 3000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchCurrentTrack = async (token) => {
    try {
      const track = await getCurrentTrack(token);
      setCurrentTrack(track);
      setIsPlaying(track?.is_playing || false);
    } catch (error) {
      console.error('Error fetching track:', error);
      if (error.message.includes('401')) {
        localStorage.removeItem('spotify_token');
        setIsAuthenticated(false);
      }
    }
  };

  const fetchPlaylists = async (token) => {
    try {
      setIsLoadingPlaylists(true);
      const userPlaylists = await getUserPlaylists(token);
      setPlaylists(userPlaylists);
    } catch (error) {
      console.error('Error fetching playlists:', error);
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
      setPlaylistTracks(tracks);
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
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
      if (!token) return;

      await playPlaylistTrack(token, track.track.uri);
      setIsPlaying(true);
      setTimeout(() => fetchCurrentTrack(token), 300);
    } catch (error) {
      console.error('Error playing track:', error);
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
      if (!token) return;

      if (isPlaying) {
        await pauseTrack(token);
      } else {
        await playTrack(token);
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  const handleNext = async () => {
    try {
      const token = localStorage.getItem('spotify_token');
      if (!token) return;
      await nextTrack(token);
      setTimeout(() => fetchCurrentTrack(token), 300);
    } catch (error) {
      console.error('Next track error:', error);
    }
  };

  const handlePrevious = async () => {
    try {
      const token = localStorage.getItem('spotify_token');
      if (!token) return;
      await previousTrack(token);
      setTimeout(() => fetchCurrentTrack(token), 300);
    } catch (error) {
      console.error('Previous track error:', error);
    }
  };

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
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
              currentTrack && currentTrack.item ? (
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box
                      component="img"
                      src={currentTrack.item.album.images[0].url}
                      alt={currentTrack.item.album.name}
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
                        {currentTrack.item.name}
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
                        {currentTrack.item.artists.map(a => a.name).join(', ')}
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
                  </Box>
                </Box>
              ) : (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography sx={{ color: alpha('#fff', 0.7) }}>
                    No track playing
                  </Typography>
                </Box>
              )
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
                      ) : (
                        playlistTracks.map((item) => (
                          <ListItem 
                            key={item.track.id}
                            disablePadding
                            divider
                          >
                            <ListItemButton 
                              onClick={() => handleTrackClick(item)}
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
                                primary={item.track.name}
                                secondary={item.track.artists.map(a => a.name).join(', ')}
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
                      )}
                    </List>
                  </>
                ) : (
                  <List sx={{ p: 0 }}>
                    {playlists.map((playlist) => (
                      <ListItem 
                        key={playlist.id}
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
                          {playlist.images[0] && (
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
                            secondary={`${playlist.tracks.total} tracks`}
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
                    ))}
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

export default SpotifyPlayer; 