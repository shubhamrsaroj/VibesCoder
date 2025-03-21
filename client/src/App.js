import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CodeEditor from './pages/CodeEditor';
import DrawingBoard from './pages/DrawingBoard';
import ComponentLibrary from './pages/ComponentLibrary';
import Login from './pages/Login';
import Register from './pages/Register';
import { isAuthenticated, getCurrentUser } from './services/authService';
import { Box, Container, Typography, Button, Paper, Stack, alpha, Card, CardContent, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CodeIcon from '@mui/icons-material/Code';
import BrushIcon from '@mui/icons-material/Brush';
import WidgetsIcon from '@mui/icons-material/Widgets';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Create a vibrant theme for coding experience
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366F1', // Indigo
    },
    secondary: {
      main: '#EC4899', // Pink
    },
    background: {
      default: '#111827', // Dark blue-gray
      paper: '#1F2937', // Slightly lighter blue-gray
    },
    text: {
      primary: '#F9FAFB',
      secondary: '#D1D5DB',
    },
    success: {
      main: '#10B981', // Emerald
    },
    error: {
      main: '#EF4444', // Red
    },
    warning: {
      main: '#F59E0B', // Amber
    },
    info: {
      main: '#3B82F6', // Blue
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)',
        },
        containedSecondary: {
          background: 'linear-gradient(90deg, #EC4899 0%, #F472B6 100%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

// Private Route component to protect routes that require authentication
const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" replace />;
};

// Landing page component for users who are not logged in
const Landing = () => {
  const darkGradient = 'linear-gradient(to right, #0F172A, #1E293B)';
  const primaryGradient = 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)';
  const secondaryGradient = 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)';
  const successGradient = 'linear-gradient(135deg, #10B981 0%, #047857 100%)';
  
  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: darkGradient,
      color: 'white',
      py: 4,
    }}>
      <Container maxWidth="xl">
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          py: 2,
          mb: 6
        }}>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              fontWeight: 800, 
              display: 'flex', 
              alignItems: 'center',
              background: 'linear-gradient(45deg, #3B82F6, #EC4899)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            <MusicNoteIcon sx={{ mr: 1 }} />
            VibeCoder
          </Typography>
          
          <Stack direction="row" spacing={2}>
            <Button 
              component={Link} 
              to="/login" 
              variant="outlined"
              sx={{ 
                borderColor: alpha('#fff', 0.3),
                color: '#fff',
                '&:hover': {
                  borderColor: '#fff',
                  backgroundColor: alpha('#fff', 0.1)
                }
              }}
            >
              Login
            </Button>
            <Button 
              component={Link} 
              to="/register" 
              variant="contained"
              sx={{ 
                background: primaryGradient,
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
                }
              }}
            >
              Register
            </Button>
          </Stack>
        </Box>
        
        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ pt: { xs: 4, md: 8 } }}>
              <Typography variant="h2" sx={{ 
                fontWeight: 800, 
                mb: 3,
                background: 'linear-gradient(45deg, #3B82F6, #EC4899)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.2
              }}>
                Your Creative Coding Companion
              </Typography>
              <Typography variant="h5" sx={{ 
                mb: 4, 
                fontWeight: 'normal', 
                color: alpha('#fff', 0.8),
                lineHeight: 1.5
              }}>
                Design, code, and build amazing projects with an all-in-one development environment
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button 
                  component={Link} 
                  to="/register" 
                  variant="contained" 
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    borderRadius: 2,
                    py: 1.5,
                    px: 3,
                    background: primaryGradient,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
                    }
                  }}
                >
                  Get Started
                </Button>
                <Button 
                  component={Link} 
                  to="/login" 
                  variant="outlined" 
                  size="large"
                  sx={{ 
                    borderRadius: 2,
                    py: 1.5,
                    px: 3,
                    borderColor: alpha('#fff', 0.3),
                    color: '#fff',
                    '&:hover': {
                      borderColor: '#fff',
                      backgroundColor: alpha('#fff', 0.1)
                    }
                  }}
                >
                  Sign In
                </Button>
              </Stack>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box 
              component="img" 
              src="https://images.unsplash.com/photo-1607705703571-c5a8695f18f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1280&q=80"
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 4,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                transform: { md: 'scale(1.05)' }
              }}
              alt="VibeCoder interface"
            />
          </Grid>
        </Grid>
        
        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          mb: 4,
          textAlign: 'center'
        }}>
          Key Features
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%',
              background: alpha('#1E293B', 0.6),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha('#fff', 0.1)}`,
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)'
              }
            }}>
              <Box sx={{ 
                height: 8, 
                width: '100%', 
                background: primaryGradient 
              }} />
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ 
                  display: 'inline-flex',
                  p: 1.5,
                  mb: 2,
                  borderRadius: '12px',
                  background: alpha('#3B82F6', 0.2)
                }}>
                  <CodeIcon sx={{ color: '#3B82F6', fontSize: 30 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  Code Editor
                </Typography>
                <Typography variant="body1" sx={{ color: alpha('#fff', 0.7) }}>
                  Write code with real-time syntax highlighting and intelligent autocomplete suggestions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%',
              background: alpha('#1E293B', 0.6),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha('#fff', 0.1)}`,
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)'
              }
            }}>
              <Box sx={{ 
                height: 8, 
                width: '100%', 
                background: secondaryGradient 
              }} />
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ 
                  display: 'inline-flex',
                  p: 1.5,
                  mb: 2,
                  borderRadius: '12px',
                  background: alpha('#EC4899', 0.2)
                }}>
                  <BrushIcon sx={{ color: '#EC4899', fontSize: 30 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  Drawing Board
                </Typography>
                <Typography variant="body1" sx={{ color: alpha('#fff', 0.7) }}>
                  Sketch UI layouts and wireframes with an intuitive drawing environment
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%',
              background: alpha('#1E293B', 0.6),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha('#fff', 0.1)}`,
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)'
              }
            }}>
              <Box sx={{ 
                height: 8, 
                width: '100%', 
                background: successGradient 
              }} />
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ 
                  display: 'inline-flex',
                  p: 1.5,
                  mb: 2,
                  borderRadius: '12px',
                  background: alpha('#10B981', 0.2)
                }}>
                  <WidgetsIcon sx={{ color: '#10B981', fontSize: 30 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  Component Library
                </Typography>
                <Typography variant="body1" sx={{ color: alpha('#fff', 0.7) }}>
                  Browse and use pre-built UI components to speed up development
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ 
          mt: 8, 
          textAlign: 'center', 
          p: 5,
          borderRadius: 4,
          background: alpha('#1E293B', 0.4),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha('#fff', 0.1)}`,
        }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Ready to Start Creating?
          </Typography>
          <Typography variant="body1" sx={{ color: alpha('#fff', 0.8), mb: 4, maxWidth: '700px', mx: 'auto' }}>
            Join VibeCoder today and transform your development workflow with our powerful tools and features
          </Typography>
          <Button 
            component={Link} 
            to="/register" 
            variant="contained" 
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{ 
              borderRadius: 2,
              py: 1.5,
              px: 4,
              background: primaryGradient,
              '&:hover': {
                background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
              }
            }}
          >
            Sign Up Now
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add a small delay to ensure authentication state is checked
    const checkAuth = async () => {
      try {
        // Short delay to allow auth check to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Skip rendering until we've checked authentication
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          background: 'linear-gradient(to right, #0F172A, #1E293B)'
        }}
      >
        <Typography variant="h5" color="white">
          Loading...
        </Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

// Separate component to access AuthContext
const AppContent = () => {
  const { currentUser } = useAuth();
  
  return (
    <div className="app">
      {/* Only show Navbar on authenticated routes */}
      {currentUser && <Navbar user={currentUser} />}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          currentUser ? <Navigate to="/" replace /> : <Login />
        } />
        <Route path="/register" element={
          currentUser ? <Navigate to="/" replace /> : <Register />
        } />
        
        {/* Landing page for non-authenticated users */}
        <Route path="/" element={
          currentUser ? <Dashboard /> : <Landing />
        } />
        
        {/* Protected Routes */}
        <Route path="/draw" element={
          <PrivateRoute>
            <DrawingBoard />
          </PrivateRoute>
        } />
        <Route path="/draw/:projectId?" element={
          <PrivateRoute>
            <DrawingBoard />
          </PrivateRoute>
        } />
        <Route path="/code/:projectId?" element={
          <PrivateRoute>
            <CodeEditor />
          </PrivateRoute>
        } />
        <Route path="/components" element={
          <PrivateRoute>
            <ComponentLibrary />
          </PrivateRoute>
        } />
        
        {/* Redirect unknown routes to dashboard if authenticated, otherwise to landing */}
        <Route path="*" element={
          <Navigate to="/" replace />
        } />
      </Routes>
    </div>
  );
};

export default App; 