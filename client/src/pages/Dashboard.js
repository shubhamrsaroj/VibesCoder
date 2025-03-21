import { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Button, 
  IconButton, 
  Avatar, 
  Divider,
  LinearProgress,
  Stack,
  Paper,
  useTheme,
  alpha,
  Container,
  Chip
} from '@mui/material';
import { getCurrentTrack, loginToSpotify, playTrack, pauseTrack, nextTrack, previousTrack } from '../services/spotifyService';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import CodeIcon from '@mui/icons-material/Code';
import BrushIcon from '@mui/icons-material/Brush';
import WidgetsIcon from '@mui/icons-material/Widgets';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import LoginIcon from '@mui/icons-material/Login';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProjects } from '../services/projectService';

const Dashboard = () => {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProjects, setUserProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Make sure we're authenticated before proceeding
    if (!currentUser) {
      return;
    }
    
    // Check if user is authenticated with Spotify
    const token = localStorage.getItem('spotify_token');
    setIsAuthenticated(!!token);

    const fetchCurrentTrack = async () => {
      try {
        if (token) {
          const track = await getCurrentTrack(token);
          setCurrentTrack(track);
          if (track && track.is_playing) {
            setIsPlaying(true);
          }
        }
      } catch (error) {
        console.error('Error fetching track:', error);
        if (error.message.includes('401')) {
          // Token expired or invalid
          localStorage.removeItem('spotify_token');
          setIsAuthenticated(false);
        }
      }
    };

    // Poll for track updates every 3 seconds if authenticated
    let interval;
    if (isAuthenticated) {
    fetchCurrentTrack();
      interval = setInterval(fetchCurrentTrack, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    // Fetch user projects
    const fetchUserProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const projects = await getUserProjects();
        setUserProjects(projects);
      } catch (err) {
        console.error('Failed to load projects:', err);
        setError('Failed to load your projects. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProjects();
  }, []);

  const handleSpotifyLogin = async () => {
    try {
      await loginToSpotify();
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

      try {
        if (isPlaying) {
          await pauseTrack(token);
        } else {
          await playTrack(token);
        }
        
        // Update state locally first for immediate UI feedback
        setIsPlaying(!isPlaying);
        
        // Then fetch latest status from Spotify to ensure UI reflects actual state
        setTimeout(async () => {
          try {
            const track = await getCurrentTrack(token);
            if (track) {
              setCurrentTrack(track);
              setIsPlaying(track.is_playing || false);
            }
          } catch (refreshError) {
            console.warn('Error refreshing track info after play/pause:', refreshError);
          }
        }, 500);
      } catch (error) {
        console.error('Playback error:', error);
        
        // Check for specific error types
        if (error.message.includes('Premium')) {
          alert('Spotify Premium is required for playback control');
        } else if (error.message.includes('404')) {
          alert('Server connection error. Please ensure the Spotify API server is running.');
        } else if (error.message.includes('401') || error.message.includes('403')) {
          alert('Authentication error. Please try connecting to Spotify again.');
          // Clear token on auth errors
          localStorage.removeItem('spotify_token');
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('General playback error:', error);
    }
  };

  const handleNext = async () => {
    try {
      const token = localStorage.getItem('spotify_token');
      if (!token) {
        console.error("No Spotify token available");
        return;
      }

      try {
        await nextTrack(token);
        
        // Wait for Spotify to update and fetch the new track
        setTimeout(async () => {
          try {
            const track = await getCurrentTrack(token);
            if (track) {
              setCurrentTrack(track);
              setIsPlaying(track.is_playing || false);
            }
          } catch (refreshError) {
            console.warn('Error refreshing track info after next track:', refreshError);
          }
        }, 500);
      } catch (error) {
        console.error('Next track error:', error);
        
        // Check for specific error types
        if (error.message.includes('Premium')) {
          alert('Spotify Premium is required for playback control');
        } else if (error.message.includes('404')) {
          alert('Server connection error. Please ensure the Spotify API server is running.');
        } else if (error.message.includes('401') || error.message.includes('403')) {
          alert('Authentication error. Please try connecting to Spotify again.');
          localStorage.removeItem('spotify_token');
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('General next track error:', error);
    }
  };

  const handlePrevious = async () => {
    try {
      const token = localStorage.getItem('spotify_token');
      if (!token) {
        console.error("No Spotify token available");
        return;
      }

      try {
        await previousTrack(token);
        
        // Wait for Spotify to update and fetch the new track
        setTimeout(async () => {
          try {
            const track = await getCurrentTrack(token);
            if (track) {
              setCurrentTrack(track);
              setIsPlaying(track.is_playing || false);
            }
          } catch (refreshError) {
            console.warn('Error refreshing track info after previous track:', refreshError);
          }
        }, 500);
      } catch (error) {
        console.error('Previous track error:', error);
        
        // Check for specific error types
        if (error.message.includes('Premium')) {
          alert('Spotify Premium is required for playback control');
        } else if (error.message.includes('404')) {
          alert('Server connection error. Please ensure the Spotify API server is running.');
        } else if (error.message.includes('401') || error.message.includes('403')) {
          alert('Authentication error. Please try connecting to Spotify again.');
          localStorage.removeItem('spotify_token');
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('General previous track error:', error);
    }
  };

  // Get current date and time for greeting
  const currentHour = new Date().getHours();
  let greeting = "Good morning";
  let timeIcon = <WbSunnyIcon sx={{ color: '#FFA726' }} />;
  
  if (currentHour >= 12 && currentHour < 18) {
    greeting = "Good afternoon";
    timeIcon = <WbSunnyIcon sx={{ color: '#FFA726' }} />;
  } else if (currentHour >= 18) {
    greeting = "Good evening";
    timeIcon = <NightsStayIcon sx={{ color: '#7986CB' }} />;
  }

  // Dark color palette
  const darkGradient = 'linear-gradient(to bottom, #0F172A, #1E293B)';
  const cardBg = alpha('#1E293B', 0.7);
  const primaryGradient = 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)';
  const secondaryGradient = 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)';
  const successGradient = 'linear-gradient(135deg, #10B981 0%, #047857 100%)';
  const cardGlow = '0 0 15px rgba(59, 130, 246, 0.2)';

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: darkGradient,
        color: 'white',
        pt: 2,
        pb: 6
      }}
    >
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ 
          mb: 5, 
          pt: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: '50%', 
            background: alpha('#0F172A', 0.5),
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.15)',
            display: 'flex',
            mr: 1
          }}>
            {timeIcon}
          </Box>
          <Box>
            <Typography variant="h3" sx={{ 
              fontWeight: 800, 
              mb: 1,
              background: 'linear-gradient(45deg, #3B82F6, #EC4899)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px'
            }}>
              {greeting}
            </Typography>
            <Typography variant="h6" sx={{ 
              fontWeight: 'normal',
              color: alpha('#fff', 0.7),
              letterSpacing: '0.2px'
            }}>
              Let's build something amazing today
      </Typography>
          </Box>
        </Box>
      
        <Grid container spacing={4}>
        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
            <Card 
              elevation={0} 
              sx={{ 
                height: '100%',
                mb: { xs: 4, md: 0 }, 
                overflow: 'hidden', 
                borderRadius: 4,
                transition: 'all 0.3s ease-in-out',
                background: 'transparent',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha('#fff', 0.1)}`,
                boxShadow: cardGlow,
                '&:hover': {
                  boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
                }
              }}
            >
              <Box sx={{ 
                p: 4, 
                background: primaryGradient,
                position: 'relative',
                overflow: 'hidden',
              }}>
            <Box sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0.1,
                  background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
                  transform: 'translate(-30%, -30%)',
                }}/>
                <Typography variant="h3" sx={{ 
                  fontWeight: 800, 
                  mb: 1, 
                  position: 'relative',
                  letterSpacing: '-1px'
                }}>
                Start Creating
              </Typography>
                <Typography variant="body1" sx={{ 
                  mb: 2, 
                  opacity: 0.9, 
                  position: 'relative', 
                  maxWidth: '70%',
                  fontSize: '1.1rem',
                  lineHeight: 1.5
                }}>
                  Turn your ideas into reality with powerful tools for design and development
              </Typography>
            </Box>
              <CardContent sx={{ 
                p: 4, 
                background: cardBg,
                backdropFilter: 'blur(10px)',
                height: '100%'
              }}>
                <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Button 
                      disableElevation
                    component={Link} 
                    to="/draw"
                    fullWidth
                    sx={{ 
                      height: '100%', 
                        minHeight: 200,
                        p: 3, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                        borderRadius: 3,
                        background: primaryGradient,
                        color: 'white',
                        transition: 'all 0.3s ease',
                        border: `1px solid ${alpha('#3B82F6', 0.3)}`,
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4)',
                          background: 'linear-gradient(135deg, #2563EB 0%, #1E3A8A 100%)',
                        }
                      }}
                    >
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: '50%', 
                        bgcolor: alpha('#fff', 0.15),
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <BrushIcon fontSize="large" />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Draw</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Sketch your UI ideas visually
                    </Typography>
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button 
                      disableElevation
                    component={Link} 
                    to="/code"
                    fullWidth
                    sx={{ 
                      height: '100%', 
                        minHeight: 200,
                        p: 3, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                        borderRadius: 3,
                        background: secondaryGradient,
                        color: 'white',
                        transition: 'all 0.3s ease',
                        border: `1px solid ${alpha('#EC4899', 0.3)}`,
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 10px 25px rgba(236, 72, 153, 0.4)',
                          background: 'linear-gradient(135deg, #DB2777 0%, #9D174D 100%)',
                        }
                      }}
                    >
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: '50%', 
                        bgcolor: alpha('#fff', 0.15),
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <CodeIcon fontSize="large" />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Code</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Write and preview code
                    </Typography>
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button 
                      disableElevation
                    component={Link} 
                    to="/components"
                    fullWidth
                    sx={{ 
                      height: '100%', 
                        minHeight: 200,
                        p: 3, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                        borderRadius: 3,
                        background: successGradient,
                        color: 'white',
                        transition: 'all 0.3s ease',
                        border: `1px solid ${alpha('#10B981', 0.3)}`,
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
                          background: 'linear-gradient(135deg, #059669 0%, #065F46 100%)',
                        }
                      }}
                    >
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: '50%', 
                        bgcolor: alpha('#fff', 0.15),
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <WidgetsIcon fontSize="large" />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Components</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Browse UI components
                    </Typography>
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Music Player */}
        <Grid item xs={12} md={4}>
            <Card 
              elevation={0} 
              sx={{ 
                height: '100%', 
                borderRadius: 4,
                background: cardBg,
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease-in-out',
                border: `1px solid ${alpha('#fff', 0.1)}`,
                boxShadow: cardGlow,
                '&:hover': {
                  boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center', color: 'white' }}>
                  <Box component="span" 
                    sx={{ 
                      display: 'inline-flex', 
                      mr: 1.5, 
                      p: 1,
                      borderRadius: '50%', 
                      bgcolor: alpha('#3B82F6', 0.2)
                    }}
                  >
                    <MusicNoteIcon sx={{ color: '#3B82F6' }} />
                  </Box>
                  Spotify Player
              </Typography>
              
                {isAuthenticated ? (
                  currentTrack && currentTrack.item ? (
                <Box>
                      <Box sx={{ display: 'flex', mb: 3 }}>
                    <Box 
                      component="img" 
                      src={currentTrack.item.album.images[0].url} 
                      alt={currentTrack.item.album.name}
                          sx={{ 
                            width: 120, 
                            height: 120, 
                            borderRadius: 3, 
                            mr: 2,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.05)',
                            }
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 'bold', 
                            mb: 0.5, 
                            color: 'white',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                        {currentTrack.item.name}
                      </Typography>
                          <Typography variant="body2" sx={{ mb: 1, color: alpha('#fff', 0.7) }}>
                        {currentTrack.item.artists.map(a => a.name).join(', ')}
                      </Typography>
                          <Chip 
                            size="small" 
                            label={currentTrack.item.album.name}
                            sx={{ 
                              bgcolor: alpha('#3B82F6', 0.2),
                              color: '#3B82F6',
                              fontWeight: 'medium',
                              border: `1px solid ${alpha('#3B82F6', 0.3)}`
                            }}
                          />
                    </Box>
                  </Box>
                  
                      <Box sx={{ mb: 3 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(currentTrack.progress_ms / currentTrack.item.duration_ms) * 100} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            bgcolor: alpha('#3B82F6', 0.1),
                            '& .MuiLinearProgress-bar': {
                              background: 'linear-gradient(90deg, #3B82F6, #EC4899)',
                              borderRadius: 3,
                            }
                          }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption" sx={{ color: alpha('#fff', 0.6) }}>
                        {Math.floor(currentTrack.progress_ms / 60000)}:
                        {Math.floor((currentTrack.progress_ms % 60000) / 1000).toString().padStart(2, '0')}
                      </Typography>
                          <Typography variant="caption" sx={{ color: alpha('#fff', 0.6) }}>
                        {Math.floor(currentTrack.item.duration_ms / 60000)}:
                        {Math.floor((currentTrack.item.duration_ms % 60000) / 1000).toString().padStart(2, '0')}
                      </Typography>
                    </Box>
                  </Box>
                  
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <IconButton 
                          onClick={handlePrevious}
                          sx={{ 
                            color: alpha('#fff', 0.7),
                            '&:hover': {
                              color: '#fff',
                              backgroundColor: alpha('#fff', 0.1)
                            }
                          }}
                        >
                      <SkipPreviousIcon />
                    </IconButton>
                        <IconButton 
                          onClick={handlePlayPause}
                          sx={{ 
                            p: 2,
                            background: primaryGradient, 
                      color: 'white',
                            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
                            }
                          }}
                        >
                      {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                    </IconButton>
                        <IconButton 
                          onClick={handleNext}
                          sx={{ 
                            color: alpha('#fff', 0.7),
                            '&:hover': {
                              color: '#fff',
                              backgroundColor: alpha('#fff', 0.1)
                            }
                          }}
                        >
                      <SkipNextIcon />
                    </IconButton>
                  </Box>
                </Box>
              ) : (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 5,
                      background: alpha('#0F172A', 0.5),
                      borderRadius: 3,
                      px: 3,
                      border: `1px solid ${alpha('#fff', 0.1)}`
                    }}>
                      <Typography sx={{ mb: 2, color: alpha('#fff', 0.7) }}>
                        No track is currently playing
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', color: alpha('#fff', 0.5), mb: 3 }}>
                        Start playing something on Spotify
                      </Typography>
                      <Box 
                        component="img" 
                        src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_White.png" 
                        alt="Spotify Logo"
                        sx={{ 
                          width: 120,
                          opacity: 0.5,
                          filter: 'grayscale(100%)'
                        }}
                      />
                    </Box>
                  )
                ) : (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 5,
                    background: alpha('#0F172A', 0.5),
                    borderRadius: 3,
                    px: 3,
                    border: `1px solid ${alpha('#fff', 0.1)}`
                  }}>
                    <Typography sx={{ mb: 3, color: alpha('#fff', 0.7) }}>
                      Open Spotify to play music while you code
                  </Typography>
                  <Button 
                    variant="contained" 
                      startIcon={<LoginIcon />}
                      onClick={handleSpotifyLogin}
                      sx={{
                        background: 'linear-gradient(90deg, #1DB954, #1aa34a)',
                        px: 3,
                        py: 1.2,
                        borderRadius: 2,
                        color: 'white',
                        boxShadow: '0 4px 15px rgba(29, 185, 84, 0.4)',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #1aa34a, #168d40)',
                        }
                      }}
                    >
                      Open Spotify
                  </Button>
                    <Typography variant="caption" sx={{ display: 'block', mt: 2, color: alpha('#fff', 0.5) }}>
                      This will open Spotify in a new window
                    </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Projects */}
        <Grid item xs={12}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
              Your Projects
            </Typography>
            <Button 
              component={Link} 
              to="/projects"
              startIcon={<FolderOpenIcon />}
              sx={{ 
                color: 'white',
                '&:hover': {
                  background: alpha('#fff', 0.1)
                }
              }}
            >
              View All
            </Button>
          </Box>
          
          {isLoading ? (
            <LinearProgress sx={{ mb: 2 }} />
          ) : error ? (
            <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
          ) : userProjects.length === 0 ? (
            <Card sx={{ 
              p: 4, 
              borderRadius: 4, 
              textAlign: 'center',
              background: cardBg,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha('#fff', 0.1)}`,
            }}>
              <Typography variant="h6" sx={{ color: alpha('#fff', 0.7), mb: 2 }}>
                You don't have any projects yet
              </Typography>
              <Button 
                variant="contained" 
                component={Link} 
                to="/codeEditor"
                startIcon={<AddIcon />}
                sx={{ 
                  background: primaryGradient,
                  borderRadius: 2,
                  px: 3,
                  py: 1
                }}
              >
                Create Your First Project
              </Button>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {userProjects.map(project => (
                <Grid item xs={12} sm={6} md={4} key={project._id}>
                  <Card sx={{ 
                    borderRadius: 4, 
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease-in-out',
                    background: cardBg,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha('#fff', 0.1)}`,
                    boxShadow: '0 0 20px rgba(0,0,0,0.2)',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                    }
                  }}>
                    <Box sx={{ position: 'relative' }}>
                      <Box 
                        sx={{ 
                          height: 140, 
                          background: project.type === 'drawing' ? secondaryGradient : primaryGradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        {project.type === 'drawing' ? 
                          <BrushIcon sx={{ fontSize: 80, color: alpha('#fff', 0.2) }} /> : 
                          <CodeIcon sx={{ fontSize: 80, color: alpha('#fff', 0.2) }} />
                        }
                        <Box sx={{ 
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          p: 1
                        }}>
                          {project.starred && <StarIcon sx={{ color: '#FFC107' }} />}
                        </Box>
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700, 
                          mb: 1,
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          {project.name}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Chip 
                            size="small" 
                            label={project.type === 'drawing' ? 'Drawing' : 'Code'} 
                            icon={project.type === 'drawing' ? <BrushIcon fontSize="small" /> : <CodeIcon fontSize="small" />}
                            sx={{ 
                              background: alpha(project.type === 'drawing' ? '#EC4899' : '#3B82F6', 0.2),
                              color: project.type === 'drawing' ? '#EC4899' : '#3B82F6',
                              fontWeight: 500,
                              mr: 1
                            }} 
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', color: alpha('#fff', 0.6), fontSize: 14 }}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16 }} />
                          <Typography variant="body2">
                            {new Date(project.updatedAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ mt: 'auto' }}>
                        <Button 
                          fullWidth 
                          variant="contained" 
                          component={Link}
                          to={project.type === 'drawing' ? `/draw/${project._id}` : `/code/${project._id}`}
                          sx={{ 
                            background: project.type === 'drawing' ? secondaryGradient : primaryGradient,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                              background: project.type === 'drawing' ? secondaryGradient : primaryGradient,
                              opacity: 0.9
                            }
                          }}
                        >
                          {project.type === 'drawing' ? 'Open Drawing' : 'Open Code'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              
              {/* Create New Project Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ 
                  borderRadius: 4, 
                  overflow: 'hidden',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease-in-out',
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px dashed rgba(255,255,255,0.2)',
                  boxShadow: 'none',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.1)',
                    borderColor: 'rgba(255,255,255,0.3)',
                  }
                }}>
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                    textAlign: 'center'
                  }}>
                    <AddIcon sx={{ fontSize: 48, color: alpha('#fff', 0.5), mb: 2 }} />
                    <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
                      Create New Project
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Button 
                        variant="contained" 
                        component={Link} 
                        to="/code"
                        startIcon={<CodeIcon />}
                        sx={{ 
                          background: primaryGradient,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 2
                        }}
                      >
                        Code
                      </Button>
                      <Button 
                        variant="contained" 
                        component={Link} 
                        to="/draw"
                        startIcon={<BrushIcon />}
                        sx={{ 
                          background: secondaryGradient,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 2
                        }}
                      >
                        Drawing
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;