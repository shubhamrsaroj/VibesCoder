import { useState, useEffect, useRef } from 'react';
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
import { getCurrentTrack, loginToSpotify, loginToSpotifyRedirect, playTrack, pauseTrack, nextTrack, previousTrack } from '../services/spotifyService';
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
import { API_URL, DEBUG } from '../config';

const Dashboard = () => {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProjects, setUserProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('loading'); // 'loading', 'online', 'offline'
  const [spotifyLoginFailed, setSpotifyLoginFailed] = useState(false);
  
  // Music visualization state
  const [visualizationActive, setVisualizationActive] = useState(false);
  const visualizerRef = useRef(null);
  const animationRef = useRef(null);
  const [visualStyle, setVisualStyle] = useState('waves'); // 'waves', 'particles', 'pulse'
  
  // Use this for visualization settings based on track energy/etc
  const [visualSettings, setVisualSettings] = useState({
    primaryColor: '#3B82F6',
    secondaryColor: '#EC4899',
    speed: 1,
    intensity: 0.5,
    complexity: 0.5,
  });

  // Add useEffect to check API connection status
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/health`);
        if (response.ok) {
          setApiStatus('online');
        } else {
          setApiStatus('offline');
        }
      } catch (error) {
        console.error('API connection error:', error);
        setApiStatus('offline');
      }
    };

    checkApiStatus();
  }, []);

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
            
            // Enable visualization if we have a track playing
            setVisualizationActive(true);
            
            // Update visualization settings based on track features
            if (track.item) {
              updateVisualizationFromTrack(track.item);
            }
          } else {
            setVisualizationActive(false);
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
      
      // Clean up animation when component unmounts
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAuthenticated, currentUser]);
  
  // Function to update visualization settings based on the track
  const updateVisualizationFromTrack = (track) => {
    // Get the dominant color from album art
    if (track.album && track.album.images && track.album.images.length > 0) {
      const albumUrl = track.album.images[0].url;
      extractDominantColor(albumUrl, (color) => {
        // Use track features to influence visualization style
        const tempo = track.tempo || 120; // Default tempo if not available
        const energy = track.energy || 0.5; // Default energy level
        const danceability = track.danceability || 0.5;
        const valence = track.valence || 0.5; // Musical positiveness
        
        // Set visual style based on track features
        if (energy > 0.7) {
          setVisualStyle('particles');
        } else if (danceability > 0.7) {
          setVisualStyle('pulse');
        } else {
          setVisualStyle('waves');
        }
        
        setVisualSettings({
          primaryColor: color,
          secondaryColor: getComplementaryColor(color),
          speed: tempo / 120, // Normalize tempo to a reasonable range
          intensity: energy,
          complexity: danceability,
        });
      });
    }
  };
  
  // Extract dominant color from an image
  const extractDominantColor = (imageUrl, callback) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      const color = `rgb(${r}, ${g}, ${b})`;
      callback(color);
    };
    
    img.onerror = () => {
      // Fallback to default color on error
      callback('#3B82F6');
    };
  };
  
  // Get a complementary color
  const getComplementaryColor = (color) => {
    // Parse the RGB color
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!rgbMatch) return '#EC4899'; // Fallback
    
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    
    // Create complementary color (255 - value)
    const compR = 255 - r;
    const compG = 255 - g;
    const compB = 255 - b;
    
    return `rgb(${compR}, ${compG}, ${compB})`;
  };
  
  // Initialize and run visualization
  useEffect(() => {
    if (visualizationActive && visualizerRef.current) {
      let canvas = visualizerRef.current;
      let ctx = canvas.getContext('2d');
      
      // Set canvas to fullscreen
      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      
      // Animation variables
      let particles = [];
      let wavePoints = [];
      let lastTime = 0;
      
      // Initialize based on visual style
      if (visualStyle === 'particles') {
        initParticles();
      } else if (visualStyle === 'waves') {
        initWaves();
      }
      
      // Initialize particles
      function initParticles() {
        particles = [];
        const particleCount = Math.floor(100 * visualSettings.complexity);
        
        for (let i = 0; i < particleCount; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 5 + 1,
            speed: (Math.random() * 2 + 0.5) * visualSettings.speed,
            directionX: Math.random() * 2 - 1,
            directionY: Math.random() * 2 - 1,
            color: Math.random() > 0.5 ? visualSettings.primaryColor : visualSettings.secondaryColor
          });
        }
      }
      
      // Initialize waves
      function initWaves() {
        wavePoints = [];
        const pointCount = Math.floor(10 * visualSettings.complexity) + 5;
        
        for (let i = 0; i < pointCount; i++) {
          wavePoints.push({
            x: canvas.width * (i / (pointCount - 1)),
            y: canvas.height / 2,
            amplitude: canvas.height * 0.1 * visualSettings.intensity,
            speed: (0.01 + Math.random() * 0.02) * visualSettings.speed,
            offset: Math.random() * Math.PI * 2
          });
        }
      }
      
      // Animation function
      const animate = (time) => {
        if (!visualizationActive) return;
        
        // Calculate delta time for smooth animations
        const deltaTime = time - lastTime;
        lastTime = time;
        
        // Clear canvas with a semi-transparent background for trailing effect
        ctx.fillStyle = `rgba(15, 23, 42, ${visualStyle === 'pulse' ? 0.3 : 0.1})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Apply different visualization styles
        if (visualStyle === 'particles') {
          animateParticles(deltaTime);
        } else if (visualStyle === 'waves') {
          animateWaves(time);
        } else if (visualStyle === 'pulse') {
          animatePulse(time);
        }
        
        // Continue animation loop
        animationRef.current = requestAnimationFrame(animate);
      };
      
      // Particle animation
      function animateParticles(deltaTime) {
        particles.forEach(particle => {
          // Move particles
          particle.x += particle.directionX * particle.speed * (deltaTime / 16);
          particle.y += particle.directionY * particle.speed * (deltaTime / 16);
          
          // Bounce off edges
          if (particle.x < 0 || particle.x > canvas.width) {
            particle.directionX *= -1;
          }
          if (particle.y < 0 || particle.y > canvas.height) {
            particle.directionY *= -1;
          }
          
          // Draw particle
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.fill();
          
          // Connect nearby particles with lines
          connectParticles(particle);
        });
      }
      
      // Connect particles with lines
      function connectParticles(particle) {
        const connectionRadius = 100 * visualSettings.complexity;
        
        particles.forEach(otherParticle => {
          if (particle === otherParticle) return;
          
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < connectionRadius) {
            // Calculate line opacity based on distance
            const opacity = 1 - (distance / connectionRadius);
            
            ctx.beginPath();
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.5})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      }
      
      // Wave animation
      function animateWaves(time) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        
        // Draw primary wave
        for (let i = 0; i < wavePoints.length; i++) {
          const point = wavePoints[i];
          point.y = canvas.height / 2 + 
                    Math.sin(time * point.speed + point.offset) * 
                    point.amplitude;
          
          if (i === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            // Use quadratic curves for smooth waves
            const xc = (point.x + wavePoints[i-1].x) / 2;
            const yc = (point.y + wavePoints[i-1].y) / 2;
            ctx.quadraticCurveTo(wavePoints[i-1].x, wavePoints[i-1].y, xc, yc);
          }
        }
        
        // Complete the wave by going to bottom right, then bottom left, then back to start
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        
        // Create gradient for wave
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, visualSettings.primaryColor);
        gradient.addColorStop(1, visualSettings.secondaryColor);
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.2;
        ctx.fill();
        ctx.globalAlpha = 1;
        
        // Draw secondary wave (smaller)
        ctx.beginPath();
        for (let i = 0; i < wavePoints.length; i++) {
          const point = wavePoints[i];
          const y = canvas.height / 2 + 
                  Math.sin(time * point.speed * 1.5 + point.offset + Math.PI) * 
                  (point.amplitude * 0.6);
          
          if (i === 0) {
            ctx.moveTo(point.x, y);
          } else {
            const xc = (point.x + wavePoints[i-1].x) / 2;
            const yc = (y + wavePoints[i-1].y) / 2;
            ctx.quadraticCurveTo(wavePoints[i-1].x, wavePoints[i-1].y, xc, yc);
          }
        }
        
        ctx.strokeStyle = visualSettings.secondaryColor;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Pulse animation
      function animatePulse(time) {
        const pulseCount = 3;
        const baseRadius = Math.min(canvas.width, canvas.height) * 0.2;
        
        for (let i = 0; i < pulseCount; i++) {
          // Calculate pulse size based on time
          const speed = (0.0005 + (i * 0.0002)) * visualSettings.speed;
          const size = ((time * speed) % 1);
          const radius = baseRadius + (size * baseRadius * 2);
          const opacity = 1 - size;
          
          // Draw pulse circle
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
          
          // Create gradient for pulse
          const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, radius
          );
          gradient.addColorStop(0, `rgba(0,0,0,0)`);
          gradient.addColorStop(0.5, i % 2 === 0 ? 
            `rgba(${hexToRgb(visualSettings.primaryColor)},${opacity * 0.3})` : 
            `rgba(${hexToRgb(visualSettings.secondaryColor)},${opacity * 0.3})`);
          gradient.addColorStop(1, 'rgba(0,0,0,0)');
          
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      }
      
      // Helper to convert hex to rgb
      function hexToRgb(hexOrRgb) {
        // Handle RGB format
        if (hexOrRgb.startsWith('rgb')) {
          const rgbMatch = hexOrRgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          if (rgbMatch) {
            return `${rgbMatch[1]},${rgbMatch[2]},${rgbMatch[3]}`;
          }
          return '59,130,246'; // Default blue
        }
        
        // Handle hex format
        let hex = hexOrRgb.replace('#', '');
        if (hex.length === 3) {
          hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return `${r},${g},${b}`;
      }
      
      // Start animation
      animationRef.current = requestAnimationFrame(animate);
      
      // Clean up
      return () => {
        window.removeEventListener('resize', resizeCanvas);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [visualizationActive, visualStyle, visualSettings]);

  // Fetch user projects
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
      setSpotifyLoginFailed(false);
      await loginToSpotify();
    } catch (error) {
      console.error('Spotify login error:', error);
      
      // If it's a popup blocking error, show the alternative
      if (error.message.includes('Popup was blocked') || 
          error.message.includes('Authentication process was cancelled') ||
          error.message.includes('timed out')) {
        setSpotifyLoginFailed(true);
      }
    }
  };

  const handleSpotifyRedirectLogin = async () => {
    try {
      await loginToSpotifyRedirect();
    } catch (error) {
      console.error('Spotify redirect login error:', error);
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

  // Render a small API status indicator
  const renderApiStatus = () => {
    if (apiStatus === 'loading') {
      return (
        <Chip 
          size="small" 
          label="Checking API..." 
          sx={{ 
            bgcolor: alpha('#FFA726', 0.2),
            color: '#FFA726',
            position: 'fixed',
            bottom: 16,
            right: 16
          }} 
        />
      );
    } else if (apiStatus === 'offline') {
      return (
        <Chip 
          size="small" 
          label="API Offline" 
          sx={{ 
            bgcolor: alpha('#F44336', 0.2),
            color: '#F44336',
            position: 'fixed',
            bottom: 16,
            right: 16
          }} 
        />
      );
    } else {
      return (
        <Chip 
          size="small" 
          label="API Connected" 
          sx={{ 
            bgcolor: alpha('#4CAF50', 0.2),
            color: '#4CAF50',
            position: 'fixed',
            bottom: 16,
            right: 16,
            opacity: 0.7
          }} 
        />
      );
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: darkGradient,
        color: 'white',
        pt: 2,
        pb: 6,
        position: 'relative'
      }}
    >
      {/* Canvas for music visualization */}
      {isPlaying && (
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          pointerEvents: 'none',
          zIndex: 0
        }}>
          <canvas 
            ref={visualizerRef} 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%',
              opacity: 0.8
            }}
          />
        </Box>
      )}
      
      <Container maxWidth="xl" sx={{ py: 3, position: 'relative', zIndex: 1 }}>
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
                  
                  {spotifyLoginFailed ? (
                    <>
                      <Typography sx={{ mb: 2, color: alpha('#fff', 0.7) }}>
                        Popup was blocked. Try the redirect method instead:
                      </Typography>
                      <Button 
                        variant="contained" 
                        startIcon={<LoginIcon />}
                        onClick={handleSpotifyRedirectLogin}
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
                        Login with Spotify
                      </Button>
                      <Typography variant="caption" sx={{ display: 'block', mt: 2, color: alpha('#fff', 0.5) }}>
                        This will redirect you to Spotify for authentication
                      </Typography>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
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
      
      {/* API Status Indicator */}
      {renderApiStatus()}
    </Box>
  );
};

export default Dashboard;
