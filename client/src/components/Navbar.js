import { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Avatar, 
  Menu, 
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  alpha,
  Badge,
  Tooltip,
  Divider,
  ListItemButton
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import BrushIcon from '@mui/icons-material/Brush';
import CodeIcon from '@mui/icons-material/Code';
import WidgetsIcon from '@mui/icons-material/Widgets';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import MusicPlayer from './MusicPlayer';
import { useAuth } from '../contexts/AuthContext';

const Navbar = ({ user }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [spotifyAnchorEl, setSpotifyAnchorEl] = useState(null);
  const { logout } = useAuth();

  // Track scrolling to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    // Redirect to login
    navigate('/login');
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleSpotifyClick = (event) => {
    setSpotifyAnchorEl(event.currentTarget);
  };

  const handleSpotifyClose = () => {
    setSpotifyAnchorEl(null);
  };

  // Dark color palette to match dashboard
  const darkGradient = 'linear-gradient(to right, #0F172A, #1E293B)';
  const primaryGradient = 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)';
  const cardBg = alpha('#1E293B', 0.7);
  const navBg = scrolled ? alpha('#0F172A', 0.95) : 'transparent';
  const navShadow = scrolled ? '0 4px 20px rgba(0, 0, 0, 0.2)' : 'none';
  const navBorder = scrolled ? 'none' : `1px solid ${alpha('#fff', 0.1)}`;

  const menuItems = [
    { text: 'Dashboard', icon: <HomeIcon />, path: '/' },
    { text: 'Draw', icon: <BrushIcon />, path: '/draw' },
    { text: 'Code', icon: <CodeIcon />, path: '/code' },
    { text: 'Components', icon: <WidgetsIcon />, path: '/components' },
  ];

  const isActive = (path) => location.pathname === path;

  const drawer = (
    <Box
      sx={{ 
        width: 280,
        height: '100%',
        background: darkGradient,
        color: 'white',
        backdropFilter: 'blur(10px)',
      }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderBottom: `1px solid ${alpha('#fff', 0.1)}`,
        mb: 2
      }}>
        <Typography variant="h5" component="div" sx={{ 
          fontWeight: 800, 
          display: 'flex', 
          alignItems: 'center',
          background: 'linear-gradient(45deg, #3B82F6, #EC4899)',
          backgroundClip: 'text',
          textFillColor: 'transparent',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          <MusicNoteIcon sx={{ mr: 1 }} />
          VibeCoder
        </Typography>
      </Box>

      <Box sx={{ px: 2 }}>
        <Typography variant="overline" sx={{ 
          px: 2, 
          color: alpha('#fff', 0.5),
          fontSize: '0.75rem',
          letterSpacing: '0.1em'
        }}>
          MAIN NAVIGATION
        </Typography>
        
        <List sx={{ mt: 1 }}>
        {menuItems.map((item) => (
          <ListItem 
              disablePadding
            key={item.text} 
              sx={{ mb: 1 }}
            >
              <ListItemButton
            component={Link} 
            to={item.path}
            sx={{ 
                  py: 1.5,
                  px: 2,
                  backgroundColor: isActive(item.path) ? alpha('#3B82F6', 0.15) : 'transparent',
                  color: isActive(item.path) ? '#fff' : alpha('#fff', 0.7),
                  borderRadius: '12px',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: alpha('#3B82F6', 0.1),
                    color: '#fff',
                  },
                  '&::before': isActive(item.path) ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '4px',
                    height: '60%',
                    backgroundColor: '#3B82F6',
                    borderRadius: '0 4px 4px 0',
                  } : {}
                }}
              >
                <ListItemIcon sx={{ 
                  color: isActive(item.path) ? '#3B82F6' : alpha('#fff', 0.6),
                  minWidth: '40px'
                }}>
              {item.icon}
            </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: isActive(item.path) ? '600' : '400',
                    fontSize: '0.95rem'
                  }}
                />
                {isActive(item.path) && (
                  <Box sx={{ 
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    bgcolor: '#3B82F6',
                    ml: 1
                  }} />
                )}
              </ListItemButton>
          </ListItem>
        ))}
      </List>
      </Box>

      <Box sx={{ mt: 'auto', p: 2, borderTop: `1px solid ${alpha('#fff', 0.1)}` }}>
        <ListItem 
          button 
          sx={{ 
            borderRadius: '12px',
            py: 1.5,
            backgroundColor: alpha('#3B82F6', 0.1),
            '&:hover': {
              backgroundColor: alpha('#3B82F6', 0.15),
            }
          }}
        >
          <ListItemIcon sx={{ color: '#3B82F6', minWidth: '40px' }}>
            <DarkModeIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Dark Mode"
            primaryTypographyProps={{ fontWeight: '500' }}
          />
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0} 
        sx={{ 
          backgroundColor: navBg,
          backdropFilter: 'blur(10px)',
          borderBottom: navBorder,
          boxShadow: navShadow,
          transition: 'all 0.3s ease'
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
          {isMobile ? (
          <IconButton
              sx={{ 
                color: 'white',
                mr: 2,
                '&:hover': {
                  backgroundColor: alpha('#fff', 0.1)
                }
              }}
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          ) : (
            <Box sx={{ 
              mr: 2,
              background: alpha('#1E293B', 0.5),
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              border: `1px solid ${alpha('#fff', 0.1)}`,
              px: 2,
              py: 0.75,
              display: 'flex',
              alignItems: 'center'
            }}>
              <MusicNoteIcon 
                sx={{ 
                  color: '#3B82F6', 
                  mr: 1, 
                  fontSize: 24,
                }} 
              />
            </Box>
        )}
        
        <Typography 
          variant="h6" 
          component={Link} 
          to="/" 
          sx={{ 
              flexGrow: isMobile ? 1 : 0, 
              mr: isMobile ? 0 : 3,
            textDecoration: 'none', 
              color: 'white',
              fontWeight: 700,
            display: 'flex',
              alignItems: 'center',
              fontSize: '1.25rem',
              letterSpacing: '-0.5px',
              background: 'linear-gradient(45deg, #3B82F6, #EC4899)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
          VibeCoder
        </Typography>
        
        {!isMobile && (
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              mr: 'auto',
              ml: 4,
              '& .MuiButton-root': {
                textTransform: 'none',
                fontWeight: 500,
                px: 2
              }
            }}>
            {menuItems.map((item) => (
              <Button 
                key={item.text}
                  color="inherit"
                component={Link} 
                to={item.path}
                  startIcon={
                    <Box sx={{ 
                      color: isActive(item.path) ? '#3B82F6' : alpha('#fff', 0.7)
                    }}>
                      {item.icon}
                    </Box>
                  }
                sx={{ 
                    borderRadius: '12px',
                    color: isActive(item.path) ? 'white' : alpha('#fff', 0.7),
                    position: 'relative',
                    py: 1,
                    '&::after': isActive(item.path) ? {
                      content: '""',
                      position: 'absolute',
                      bottom: '0',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '30%',
                      height: '3px',
                      background: primaryGradient,
                      borderRadius: '3px 3px 0 0',
                    } : {},
                    '&:hover': {
                      backgroundColor: alpha('#fff', 0.05),
                      color: 'white'
                    }
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>
        )}
        
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto', gap: 1.5 }}>
            <Tooltip title="Music Player">
              <IconButton 
                onClick={handleSpotifyClick}
                sx={{ 
                  color: alpha('#1DB954', 0.9),
                  '&:hover': {
                    backgroundColor: alpha('#1DB954', 0.1),
                    color: '#1DB954'
                  }
                }}
              >
                <MusicNoteIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Notifications">
              <IconButton 
                color="inherit" 
                sx={{ 
                  color: alpha('#fff', 0.7),
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.1),
                    color: 'white'
                  }
                }}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Settings">
              <IconButton 
                color="inherit" 
                sx={{ 
                  color: alpha('#fff', 0.7),
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.1),
                    color: 'white'
                  }
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            
            <Box 
              onClick={handleProfileMenuOpen} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                ml: 0.5,
                background: alpha('#1E293B', 0.5),
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                border: `1px solid ${alpha('#fff', 0.1)}`,
                p: '4px',
                pl: 2,
                '&:hover': {
                  background: alpha('#1E293B', 0.8),
                }
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  mr: 1.5, 
                  color: 'white',
                  display: { xs: 'none', sm: 'block' } 
                }}
              >
                {user?.username || 'User'}
              </Typography>
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  background: primaryGradient,
                  border: `2px solid ${alpha('#fff', 0.2)}`
                }}
              >
                {user?.username ? user.username.substring(0, 2).toUpperCase() : 'U'}
          </Avatar>
            </Box>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  backgroundColor: alpha('#1E293B', 0.95),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha('#fff', 0.1)}`,
                  borderRadius: 2,
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
                  minWidth: 180,
                  '& .MuiMenuItem-root': {
                    px: 2,
                    py: 1.5,
                    mx: 1,
                    my: 0.5,
                    borderRadius: 1.5,
                    color: alpha('#fff', 0.9),
                    '&:hover': {
                      backgroundColor: alpha('#3B82F6', 0.1),
                    },
                  },
                  '& .MuiDivider-root': {
                    my: 1,
                    borderColor: alpha('#fff', 0.1),
                  }
                }
              }}
            >
              <MenuItem onClick={handleProfileMenuClose}>
                <ListItemIcon sx={{ color: '#3B82F6' }}>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                My Profile
              </MenuItem>
              <MenuItem onClick={handleProfileMenuClose}>
                <ListItemIcon sx={{ color: '#3B82F6' }}>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon sx={{ color: '#EF4444' }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
        </Menu>
          </Box>
      </Toolbar>
      </AppBar>

      <MusicPlayer 
        open={Boolean(spotifyAnchorEl)}
        anchorEl={spotifyAnchorEl}
        onClose={handleSpotifyClose}
      />
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: 280,
            background: 'transparent',
            borderRight: 'none'
          }
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar; 