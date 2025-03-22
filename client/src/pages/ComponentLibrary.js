import { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  Chip,
  alpha,
  useTheme,
  Paper,
  Divider,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  ContentCopy as ContentCopyIcon,
  Code as CodeIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { styled } from '@mui/material/styles';
import { Global, css } from '@emotion/react';

// Global styles for HTML/CSS components
const globalStyles = css`
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

  .modern-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .modern-btn.primary { background: #3B82F6; color: white; }
  .modern-btn.secondary { background: #6B7280; color: white; }
  .modern-btn.success { background: #10B981; color: white; }
  .modern-btn.danger { background: #EF4444; color: white; }
  .modern-btn.outline {
    background: transparent;
    border: 2px solid #3B82F6;
    color: #3B82F6;
  }
  .modern-btn.gradient {
    background: linear-gradient(45deg, #3B82F6, #8B5CF6);
    color: white;
  }
  .modern-btn.rounded {
    border-radius: 25px;
    background: #3B82F6;
    color: white;
  }
  .modern-btn.disabled {
    background: #E5E7EB;
    color: #9CA3AF;
    cursor: not-allowed;
  }
  .modern-btn:hover:not(.disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  /* Progress Bar Styles */
  .progress-bar {
    width: 100%;
    height: 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: #3B82F6;
    border-radius: 10px;
    transition: width 0.5s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
  }
  .progress-bar.striped .progress-fill {
    background-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%,
      transparent
    );
    background-size: 20px 20px;
    animation: progress-stripes 1s linear infinite;
  }
  .progress-bar.gradient .progress-fill {
    background: linear-gradient(90deg, #3B82F6, #8B5CF6);
  }

  /* Accordion Styles */
  .accordion {
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
  }
  .accordion-item {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  .accordion-header {
    width: 100%;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: none;
    text-align: left;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  .accordion-header:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  .accordion-content {
    padding: 0;
    max-height: 0;
    overflow: hidden;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.02);
  }
  .accordion-item.active .accordion-content {
    padding: 1rem;
    max-height: 200px;
  }

  /* Social Button Styles */
  .social-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .social-btn i {
    font-size: 1.2rem;
  }
  .social-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  .social-btn.facebook { background: #1877F2; }
  .social-btn.twitter { background: #1DA1F2; }
  .social-btn.linkedin { background: #0A66C2; }
  .social-btn.github { background: #24292E; }
  .social-btn.instagram {
    background: linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D);
  }

  /* Animations */
  @keyframes progress-stripes {
    0% { background-position: 0 0; }
    100% { background-position: 20px 0; }
  }

  /* Pricing Table Styles */
  .pricing-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 2rem;
    width: 300px;
    position: relative;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .pricing-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
  .pricing-card.popular {
    background: linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
    border-color: rgba(59, 130, 246, 0.3);
  }
  .popular-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: #3B82F6;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.875rem;
  }
  .pricing-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  .pricing-header h3 {
    color: white;
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  .price {
    font-size: 3rem;
    color: white;
  }
  .currency {
    font-size: 1.5rem;
    vertical-align: super;
  }
  .period {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.6);
  }
  .pricing-features {
    list-style: none;
    padding: 0;
    margin: 0 0 2rem 0;
  }
  .pricing-features li {
    color: white;
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  .pricing-features li.disabled {
    color: rgba(255, 255, 255, 0.4);
  }
  .pricing-btn {
    width: 100%;
    padding: 1rem;
    background: #3B82F6;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  .pricing-btn:hover {
    background: #2563EB;
  }

  /* Navigation Menu Styles */
  .modern-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 8px;
  }

  .nav-brand {
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
  }

  .nav-menu {
    display: flex;
    gap: 1rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nav-link {
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: all 0.3s ease;
  }

  .nav-link:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .dropdown {
    position: relative;
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 4px;
    padding: 0.5rem;
    min-width: 150px;
    display: none;
  }

  .dropdown:hover .dropdown-menu {
    display: block;
  }

  .dropdown-menu li {
    list-style: none;
  }

  .dropdown-menu a {
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    display: block;
    border-radius: 4px;
    transition: all 0.3s ease;
  }

  .dropdown-menu a:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(5px);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .modal-overlay.active {
    opacity: 1;
    visibility: visible;
  }

  .modal-content {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 2rem;
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
    transform: translateY(-20px);
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
  }

  .modal-overlay.active .modal-content {
    transform: translateY(0);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .modal-close {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    transition: transform 0.3s ease;
  }

  .modal-close:hover {
    transform: rotate(90deg);
  }

  .modal-body {
    margin-bottom: 1.5rem;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }
`;

// Add styled components for HTML/CSS components
const ModernButton = styled('button')(({ theme }) => ({
  padding: '10px 20px',
  border: 'none',
  borderRadius: '5px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&.primary': {
    background: '#3B82F6',
    color: 'white',
  },
  '&.secondary': {
    background: '#6B7280',
    color: 'white',
  },
  '&.success': {
    background: '#10B981',
    color: 'white',
  },
  '&.danger': {
    background: '#EF4444',
    color: 'white',
  },
  '&.outline': {
    background: 'transparent',
    border: '2px solid #3B82F6',
    color: '#3B82F6',
  },
  '&.gradient': {
    background: 'linear-gradient(45deg, #3B82F6, #8B5CF6)',
    color: 'white',
  },
  '&.rounded': {
    borderRadius: '25px',
    background: '#3B82F6',
    color: 'white',
  },
  '&.disabled': {
    background: '#E5E7EB',
    color: '#9CA3AF',
    cursor: 'not-allowed',
  },
  '&:hover:not(.disabled)': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
}));

const LoaderContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px',
  '& p': {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '14px',
  },
});

const Loader = styled('div')({
  width: '40px',
  height: '40px',
  '&.spinner': {
    border: '4px solid rgba(255, 255, 255, 0.1)',
    borderLeftColor: '#3B82F6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  '&.pulse': {
    background: '#3B82F6',
    borderRadius: '50%',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  '&.dots': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    '&::before, &::after': {
      content: '""',
      width: '8px',
      height: '8px',
      background: '#3B82F6',
      borderRadius: '50%',
      animation: 'dots 1s infinite ease-in-out',
    },
    '&::after': {
      animationDelay: '0.5s',
    },
  },
  '@keyframes spin': {
    to: { transform: 'rotate(360deg)' },
  },
  '@keyframes pulse': {
    '0%': { transform: 'scale(0.8)', opacity: 0.5 },
    '50%': { transform: 'scale(1)', opacity: 1 },
    '100%': { transform: 'scale(0.8)', opacity: 0.5 },
  },
  '@keyframes dots': {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-10px)' },
  },
});

// Replace style jsx with styled components
const CardStyles = styled('div')({
  '.modern-card': {
    width: '300px',
    background: 'white',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    }
  },
  '.card-image': {
    width: '100%',
    height: '200px',
    overflow: 'hidden',
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.3s ease',
    }
  },
  '.modern-card:hover .card-image img': {
    transform: 'scale(1.1)',
  },
  '.card-content': {
    padding: '20px',
    '& h3': {
      margin: '0 0 10px 0',
      color: '#1F2937',
    },
    '& p': {
      color: '#6B7280',
      marginBottom: '20px',
    }
  },
  '.card-btn': {
    padding: '8px 16px',
    background: '#3B82F6',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: '#2563EB',
    }
  },
  '.modern-card.glass': {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    '& h3': {
      color: 'white',
    },
    '& p': {
      color: 'rgba(255, 255, 255, 0.8)',
    }
  },
  '.card-btn.glass': {
    background: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.3)',
    }
  }
});

const FormStyles = styled('div')({
  '.modern-form': {
    width: '100%',
    maxWidth: '500px',
    padding: '2rem',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '15px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  '.form-group': {
    position: 'relative',
    marginBottom: '1.5rem',
  },
  '.form-input': {
    width: '100%',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: 'white',
    transition: 'all 0.3s ease',
    '&:focus': {
      outline: 'none',
      borderColor: '#3B82F6',
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
    }
  },
  '.form-label': {
    position: 'absolute',
    left: '12px',
    top: '12px',
    color: 'rgba(255, 255, 255, 0.7)',
    transition: 'all 0.3s ease',
    pointerEvents: 'none',
  },
  '.form-input:focus + .form-label, .form-input:not(:placeholder-shown) + .form-label': {
    transform: 'translateY(-24px) scale(0.8)',
    color: '#3B82F6',
  },
  '.form-button': {
    width: '100%',
    padding: '12px',
    background: '#3B82F6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: '#2563EB',
      transform: 'translateY(-2px)',
    }
  }
});

// Add new styled component for Bootstrap components
const BootstrapStyles = styled('div')({
  '.btn': {
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    textTransform: 'none',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    }
  },
  '.btn-primary': {
    background: '#0d6efd',
    border: 'none',
    '&:hover': {
      background: '#0b5ed7',
    }
  },
  '.card': {
    borderRadius: '1rem',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
    }
  },
  '.card-header': {
    background: 'rgba(255,255,255,0.1)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    padding: '1rem 1.5rem',
  },
  '.card-body': {
    padding: '1.5rem',
  },
  '.form-control': {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.5rem',
    color: 'white',
    padding: '0.75rem 1rem',
    transition: 'all 0.3s ease',
    '&:focus': {
      background: 'rgba(255,255,255,0.1)',
      borderColor: '#0d6efd',
      boxShadow: '0 0 0 0.25rem rgba(13,110,253,0.25)',
    }
  },
  '.navbar': {
    padding: '1rem',
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '0.5rem',
  },
  '.nav-link': {
    color: 'rgba(255,255,255,0.8)',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    transition: 'all 0.3s ease',
    '&:hover': {
      color: 'white',
      background: 'rgba(255,255,255,0.1)',
    }
  }
});

// Add new styled component for tooltips
const TooltipStyles = styled('div')({
  '.tooltip-btn': {
    position: 'relative',
    padding: '8px 16px',
    background: '#3B82F6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    '&::before': {
      content: 'attr(data-tooltip)',
      position: 'absolute',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '14px',
      whiteSpace: 'nowrap',
      opacity: 0,
      visibility: 'hidden',
      transition: 'all 0.3s ease'
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      border: '6px solid transparent',
      opacity: 0,
      visibility: 'hidden',
      transition: 'all 0.3s ease'
    },
    '&:not([data-position])::before, &[data-position="top"]::before': {
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%) translateY(-10px)'
    },
    '&:not([data-position])::after, &[data-position="top"]::after': {
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      borderTopColor: 'rgba(0, 0, 0, 0.8)'
    },
    '&[data-position="bottom"]::before': {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%) translateY(10px)'
    },
    '&[data-position="bottom"]::after': {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      borderBottomColor: 'rgba(0, 0, 0, 0.8)'
    },
    '&[data-position="left"]::before': {
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%) translateX(-10px)'
    },
    '&[data-position="left"]::after': {
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      borderLeftColor: 'rgba(0, 0, 0, 0.8)'
    },
    '&[data-position="right"]::before': {
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%) translateX(10px)'
    },
    '&[data-position="right"]::after': {
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      borderRightColor: 'rgba(0, 0, 0, 0.8)'
    },
    '&:hover::before, &:hover::after': {
      opacity: 1,
      visibility: 'visible'
    },
    '&:not([data-position]):hover::before, &[data-position="top"]:hover::before': {
      transform: 'translateX(-50%) translateY(0)'
    },
    '&[data-position="bottom"]:hover::before': {
      transform: 'translateX(-50%) translateY(20px)'
    },
    '&[data-position="left"]:hover::before': {
      transform: 'translateY(-50%) translateX(0)'
    },
    '&[data-position="right"]:hover::before': {
      transform: 'translateY(-50%) translateX(20px)'
    }
  }
});

const ComponentLibrary = () => {
  const theme = useTheme();
  const [selectedFramework, setSelectedFramework] = useState('mui');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCode, setShowCode] = useState({});

  const frameworks = [
    { id: 'mui', name: 'Material-UI' },
    { id: 'bootstrap', name: 'Bootstrap' },
    { id: 'tailwind', name: 'Tailwind CSS' },
    { id: 'html', name: 'HTML/CSS' }
  ];

  const categories = [
    { id: 'all', name: 'All Components' },
    { id: 'buttons', name: 'Buttons' },
    { id: 'inputs', name: 'Form Controls' },
    { id: 'layout', name: 'Layout' },
    { id: 'navigation', name: 'Navigation' },
    { id: 'feedback', name: 'Feedback' },
    { id: 'data', name: 'Data Display' }
  ];

  const components = {
    mui: [
      // Buttons
      {
        id: 'button-contained',
        category: 'buttons',
        title: 'Contained Button',
        description: 'High-emphasis button with background color',
        component: <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary">Primary</Button>
          <Button variant="contained" color="secondary">Secondary</Button>
          <Button variant="contained" color="error">Error</Button>
          <Button variant="contained" color="warning">Warning</Button>
          <Button variant="contained" color="info">Info</Button>
          <Button variant="contained" color="success">Success</Button>
        </Box>,
        code: `<Button variant="contained" color="primary">Primary</Button>
<Button variant="contained" color="secondary">Secondary</Button>
<Button variant="contained" color="error">Error</Button>
<Button variant="contained" color="warning">Warning</Button>
<Button variant="contained" color="info">Info</Button>
<Button variant="contained" color="success">Success</Button>`,
      },
      {
        id: 'button-outlined',
        category: 'buttons',
        title: 'Outlined Button',
        description: 'Medium-emphasis button with border',
        component: <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" color="primary">Primary</Button>
          <Button variant="outlined" color="secondary">Secondary</Button>
          <Button variant="outlined" color="error">Error</Button>
          <Button variant="outlined" color="warning">Warning</Button>
          <Button variant="outlined" color="info">Info</Button>
          <Button variant="outlined" color="success">Success</Button>
        </Box>,
        code: `<Button variant="outlined" color="primary">Primary</Button>
<Button variant="outlined" color="secondary">Secondary</Button>
<Button variant="outlined" color="error">Error</Button>
<Button variant="outlined" color="warning">Warning</Button>
<Button variant="outlined" color="info">Info</Button>
<Button variant="outlined" color="success">Success</Button>`,
      },
      {
        id: 'button-text',
        category: 'buttons',
        title: 'Text Button',
        description: 'Low-emphasis button with no background or border',
        component: <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="primary">Primary</Button>
          <Button color="secondary">Secondary</Button>
          <Button color="error">Error</Button>
          <Button color="warning">Warning</Button>
          <Button color="info">Info</Button>
          <Button color="success">Success</Button>
        </Box>,
        code: `<Button color="primary">Primary</Button>
<Button color="secondary">Secondary</Button>
<Button color="error">Error</Button>
<Button color="warning">Warning</Button>
<Button color="info">Info</Button>
<Button color="success">Success</Button>`,
      },
      // Form Controls
      {
        id: 'text-field-variants',
        category: 'inputs',
        title: 'Text Field Variants',
        description: 'Different styles of text input fields',
        component: <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Outlined" variant="outlined" />
          <TextField label="Filled" variant="filled" />
          <TextField label="Standard" variant="standard" />
          <TextField label="With Helper Text" helperText="Some helper text" />
          <TextField label="Error" error helperText="Error message" />
          <TextField label="Disabled" disabled />
          <TextField label="Password" type="password" />
          <TextField label="Multiline" multiline rows={4} />
        </Box>,
        code: `<TextField label="Outlined" variant="outlined" />
<TextField label="Filled" variant="filled" />
<TextField label="Standard" variant="standard" />
<TextField label="With Helper Text" helperText="Some helper text" />
<TextField label="Error" error helperText="Error message" />
<TextField label="Disabled" disabled />
<TextField label="Password" type="password" />
<TextField label="Multiline" multiline rows={4} />`,
      },
      {
        id: 'select-variants',
        category: 'inputs',
        title: 'Select Variants',
        description: 'Different styles of select dropdowns',
        component: <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Outlined</InputLabel>
            <Select label="Outlined" value="">
              <MenuItem value={10}>Option 1</MenuItem>
              <MenuItem value={20}>Option 2</MenuItem>
              <MenuItem value={30}>Option 3</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth variant="filled">
            <InputLabel>Filled</InputLabel>
            <Select label="Filled" value="">
              <MenuItem value={10}>Option 1</MenuItem>
              <MenuItem value={20}>Option 2</MenuItem>
              <MenuItem value={30}>Option 3</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth variant="standard">
            <InputLabel>Standard</InputLabel>
            <Select label="Standard" value="">
              <MenuItem value={10}>Option 1</MenuItem>
              <MenuItem value={20}>Option 2</MenuItem>
              <MenuItem value={30}>Option 3</MenuItem>
            </Select>
          </FormControl>
        </Box>,
        code: `<FormControl fullWidth>
  <InputLabel>Outlined</InputLabel>
  <Select label="Outlined" value="">
    <MenuItem value={10}>Option 1</MenuItem>
    <MenuItem value={20}>Option 2</MenuItem>
    <MenuItem value={30}>Option 3</MenuItem>
  </Select>
</FormControl>

<FormControl fullWidth variant="filled">
  <InputLabel>Filled</InputLabel>
  <Select label="Filled" value="">
    <MenuItem value={10}>Option 1</MenuItem>
    <MenuItem value={20}>Option 2</MenuItem>
    <MenuItem value={30}>Option 3</MenuItem>
  </Select>
</FormControl>

<FormControl fullWidth variant="standard">
  <InputLabel>Standard</InputLabel>
  <Select label="Standard" value="">
    <MenuItem value={10}>Option 1</MenuItem>
    <MenuItem value={20}>Option 2</MenuItem>
    <MenuItem value={30}>Option 3</MenuItem>
  </Select>
</FormControl>`,
      },
      // Layout Components
      {
        id: 'card-variants',
        category: 'layout',
        title: 'Card Variants',
        description: 'Different styles of cards for content organization',
        component: <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Card sx={{ maxWidth: 275, bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h5" component="div" gutterBottom>
                Basic Card
              </Typography>
              <Typography variant="body2">
                Simple card with just content
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ maxWidth: 275, bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h5" component="div" gutterBottom>
                Card with Actions
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Card with action buttons
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small">Action 1</Button>
                <Button size="small">Action 2</Button>
              </Box>
            </CardContent>
          </Card>
        </Box>,
        code: `<Card sx={{ maxWidth: 275 }}>
  <CardContent>
    <Typography variant="h5" component="div" gutterBottom>
      Basic Card
    </Typography>
    <Typography variant="body2">
      Simple card with just content
    </Typography>
  </CardContent>
</Card>

<Card sx={{ maxWidth: 275 }}>
  <CardContent>
    <Typography variant="h5" component="div" gutterBottom>
      Card with Actions
    </Typography>
    <Typography variant="body2" sx={{ mb: 2 }}>
      Card with action buttons
    </Typography>
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button size="small">Action 1</Button>
      <Button size="small">Action 2</Button>
    </Box>
  </CardContent>
</Card>`,
      },
      // Feedback Components
      {
        id: 'alert-variants',
        category: 'feedback',
        title: 'Alert Variants',
        description: 'Different styles of alert messages',
        component: <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="error">This is an error alert — check it out!</Alert>
          <Alert severity="warning">This is a warning alert — check it out!</Alert>
          <Alert severity="info">This is an info alert — check it out!</Alert>
          <Alert severity="success">This is a success alert — check it out!</Alert>
        </Box>,
        code: `<Alert severity="error">This is an error alert — check it out!</Alert>
<Alert severity="warning">This is a warning alert — check it out!</Alert>
<Alert severity="info">This is an info alert — check it out!</Alert>
<Alert severity="success">This is a success alert — check it out!</Alert>`,
      },
      // Navigation Components
      {
        id: 'tabs-basic',
        category: 'navigation',
        title: 'Tabs',
        description: 'Basic tabs for navigation',
        component: <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
          <Tabs value={0}>
            <Tab label="Item One" />
            <Tab label="Item Two" />
            <Tab label="Item Three" />
          </Tabs>
        </Box>,
        code: `<Tabs value={0}>
  <Tab label="Item One" />
  <Tab label="Item Two" />
  <Tab label="Item Three" />
</Tabs>`,
      },
      // Data Display
      {
        id: 'chip-variants',
        category: 'data',
        title: 'Chip Variants',
        description: 'Different styles of chips for displaying information',
        component: <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="Basic" />
          <Chip label="Disabled" disabled />
          <Chip label="Clickable" onClick={() => {}} />
          <Chip label="Deletable" onDelete={() => {}} />
          <Chip label="With Icon" icon={<CodeIcon />} />
          <Chip label="Primary" color="primary" />
          <Chip label="Success" color="success" />
          <Chip label="Error" color="error" />
        </Box>,
        code: `<Chip label="Basic" />
<Chip label="Disabled" disabled />
<Chip label="Clickable" onClick={() => {}} />
<Chip label="Deletable" onDelete={() => {}} />
<Chip label="With Icon" icon={<CodeIcon />} />
<Chip label="Primary" color="primary" />
<Chip label="Success" color="success" />
<Chip label="Error" color="error" />`,
      }
    ],
    bootstrap: [
      {
        id: 'bs-buttons',
        category: 'buttons',
        title: 'Bootstrap Buttons',
        description: 'Modern button styles with hover effects',
        component: <BootstrapStyles>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <button className="btn btn-primary">Primary Button</button>
              <button className="btn btn-secondary">Secondary Button</button>
              <button className="btn btn-success">Success Button</button>
              <button className="btn btn-danger">Danger Button</button>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <button className="btn btn-outline-primary">Outline Primary</button>
              <button className="btn btn-outline-secondary">Outline Secondary</button>
              <button className="btn btn-outline-success">Outline Success</button>
              <button className="btn btn-outline-danger">Outline Danger</button>
            </Box>
          </Box>
        </BootstrapStyles>,
        code: `<!-- Solid buttons -->
<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-secondary">Secondary Button</button>
<button class="btn btn-success">Success Button</button>
<button class="btn btn-danger">Danger Button</button>

<!-- Outline buttons -->
<button class="btn btn-outline-primary">Outline Primary</button>
<button class="btn btn-outline-secondary">Outline Secondary</button>
<button class="btn btn-outline-success">Outline Success</button>
<button class="btn btn-outline-danger">Outline Danger</button>`,
      },
      // Bootstrap Alerts
      {
        id: 'bs-alerts',
        category: 'feedback',
        title: 'Bootstrap Alerts',
        description: 'Contextual feedback messages',
        component: <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div className="alert alert-primary" role="alert">
            A simple primary alert—check it out!
          </div>
          <div className="alert alert-secondary" role="alert">
            A simple secondary alert—check it out!
          </div>
          <div className="alert alert-success" role="alert">
            A simple success alert—check it out!
          </div>
          <div className="alert alert-danger" role="alert">
            A simple danger alert—check it out!
          </div>
          <div className="alert alert-warning" role="alert">
            A simple warning alert—check it out!
          </div>
          <div className="alert alert-info" role="alert">
            A simple info alert—check it out!
          </div>
        </Box>,
        code: `<div class="alert alert-primary" role="alert">
  A simple primary alert—check it out!
</div>
<div class="alert alert-secondary" role="alert">
  A simple secondary alert—check it out!
</div>
<div class="alert alert-success" role="alert">
  A simple success alert—check it out!
</div>
<div class="alert alert-danger" role="alert">
  A simple danger alert—check it out!
</div>
<div class="alert alert-warning" role="alert">
  A simple warning alert—check it out!
</div>
<div class="alert alert-info" role="alert">
  A simple info alert—check it out!
</div>`,
      },
      // Bootstrap Cards
      {
        id: 'bs-cards',
        category: 'layout',
        title: 'Bootstrap Cards',
        description: 'Flexible content containers',
        component: <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <div className="card" style={{ width: '18rem' }}>
            <div className="card-body">
              <h5 className="card-title">Card title</h5>
              <h6 className="card-subtitle mb-2 text-muted">Card subtitle</h6>
              <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
              <a href="#" className="card-link">Card link</a>
              <a href="#" className="card-link">Another link</a>
            </div>
          </div>
          <div className="card" style={{ width: '18rem' }}>
            <div className="card-header">
              Featured
            </div>
            <div className="card-body">
              <h5 className="card-title">Special title treatment</h5>
              <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>
              <button className="btn btn-primary">Go somewhere</button>
            </div>
          </div>
        </Box>,
        code: `<div class="card" style="width: 18rem;">
  <div class="card-body">
    <h5 class="card-title">Card title</h5>
    <h6 class="card-subtitle mb-2 text-muted">Card subtitle</h6>
    <p class="card-text">Some quick example text to build on the card title...</p>
    <a href="#" class="card-link">Card link</a>
    <a href="#" class="card-link">Another link</a>
  </div>
</div>

<div class="card" style="width: 18rem;">
  <div class="card-header">
    Featured
  </div>
  <div class="card-body">
    <h5 class="card-title">Special title treatment</h5>
    <p class="card-text">With supporting text below...</p>
    <button class="btn btn-primary">Go somewhere</button>
  </div>
</div>`,
      },
      // Bootstrap Forms
      {
        id: 'bs-forms',
        category: 'inputs',
        title: 'Bootstrap Forms',
        description: 'Examples of form controls and layouts',
        component: <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <form>
            <div className="mb-3">
              <label className="form-label" htmlFor="email" >Email address</label>
              <input type="email" className="form-control" placeholder="name@example.com" />
              <div className="form-text">We'll never share your email with anyone else.</div>
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="password">Password</label>
              <input type="password" className="form-control" />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="textarea" >Example textarea</label>
              <textarea className="form-control" rows="3"></textarea>
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="example" >Example select</label>
              <select className="form-select">
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
              </select>
            </div>
            <div className="mb-3 form-check">
              <input type="checkbox" className="form-check-input" id="exampleCheck1" />
              <label className="form-check-label" htmlFor="exampleCheck1">Check me out</label>
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
        </Box>,
        code: `<form>
  <div class="mb-3">
    <label class="form-label">Email address</label>
    <input type="email" class="form-control" placeholder="name@example.com" />
    <div class="form-text">We'll never share your email with anyone else.</div>
  </div>
  <div class="mb-3">
    <label class="form-label">Password</label>
    <input type="password" class="form-control" />
  </div>
  <div class="mb-3">
    <label class="form-label">Example textarea</label>
    <textarea class="form-control" rows="3"></textarea>
  </div>
  <div class="mb-3">
    <label class="form-label">Example select</label>
    <select class="form-select">
      <option>1</option>
      <option>2</option>
      <option>3</option>
      <option>4</option>
      <option>5</option>
    </select>
  </div>
  <div class="mb-3 form-check">
    <input type="checkbox" class="form-check-input" id="exampleCheck1" />
    <label class="form-check-label" for="exampleCheck1">Check me out</label>
  </div>
  <button type="submit" class="btn btn-primary">Submit</button>
</form>`,
      },
      // Bootstrap Navigation
      {
        id: 'bs-nav',
        category: 'navigation',
        title: 'Bootstrap Navigation',
        description: 'Navigation components and patterns',
        component: <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
              <a className="navbar-brand" href="#">Navbar</a>
              <div className="collapse navbar-collapse">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  <li className="nav-item">
                    <a className="nav-link active" href="#">Home</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">Link</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link disabled" href="#">Disabled</a>
                  </li>
                </ul>
              </div>
            </div>
          </nav>

          <ul className="nav nav-tabs">
            <li className="nav-item">
              <a className="nav-link active" href="#">Active</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Link</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Link</a>
            </li>
            <li className="nav-item">
              <a className="nav-link disabled" href="#">Disabled</a>
            </li>
          </ul>
        </Box>,
        code: `<!-- Navbar -->
<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">Navbar</a>
    <div class="collapse navbar-collapse">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link active" href="#">Home</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">Link</a>
        </li>
        <li class="nav-item">
          <a class="nav-link disabled" href="#">Disabled</a>
        </li>
      </ul>
    </div>
  </div>
</nav>

<!-- Tabs -->
<ul class="nav nav-tabs">
  <li class="nav-item">
    <a class="nav-link active" href="#">Active</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" href="#">Link</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" href="#">Link</a>
  </li>
  <li class="nav-item">
    <a class="nav-link disabled" href="#">Disabled</a>
  </li>
</ul>`,
      }
    ],
    tailwind: [
      // Tailwind Buttons
      {
        id: 'tw-buttons',
        category: 'buttons',
        title: 'Tailwind Buttons',
        description: 'Various button styles using Tailwind CSS',
        component: <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Primary
            </button>
            <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              Secondary
            </button>
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Success
            </button>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              Danger
            </button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
              Outline
            </button>
            <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded-full">
              Rounded
            </button>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">
              Disabled
            </button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl">
              Large
            </button>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-sm text-xs">
              Small
            </button>
          </Box>
        </Box>,
        code: `<!-- Solid buttons -->
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Primary
</button>
<button class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
  Secondary
</button>
<button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
  Success
</button>
<button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
  Danger
</button>

<!-- Button variants -->
<button class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
  Outline
</button>
<button class="bg-blue-500 text-white font-bold py-2 px-4 rounded-full">
  Rounded
</button>
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">
  Disabled
</button>

<!-- Button sizes -->
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl">
  Large
</button>
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-sm text-xs">
  Small
</button>`,
      },
      // Tailwind Cards
      {
        id: 'tw-cards',
        category: 'layout',
        title: 'Tailwind Cards',
        description: 'Card components with Tailwind CSS',
        component: <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <div className="max-w-sm rounded overflow-hidden shadow-lg bg-white">
            <div className="px-6 py-4">
              <div className="font-bold text-xl mb-2">The Coldest Sunset</div>
              <p className="text-gray-700 text-base">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla!
              </p>
            </div>
            <div className="px-6 pt-4 pb-2">
              <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#photography</span>
              <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#travel</span>
            </div>
          </div>

          <div className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white">
            <div className="px-6 py-4">
              <div className="font-bold text-xl mb-2">Card with Actions</div>
              <p className="text-gray-700 text-base mb-4">
                A card with action buttons below the content.
              </p>
              <div className="flex gap-2">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Action
                </button>
                <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Box>,
        code: `<!-- Basic card -->
<div class="max-w-sm rounded overflow-hidden shadow-lg bg-white">
  <div class="px-6 py-4">
    <div class="font-bold text-xl mb-2">The Coldest Sunset</div>
    <p class="text-gray-700 text-base">
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla!
    </p>
  </div>
  <div class="px-6 pt-4 pb-2">
    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#photography</span>
    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#travel</span>
  </div>
</div>

<!-- Card with actions -->
<div class="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white">
  <div class="px-6 py-4">
    <div class="font-bold text-xl mb-2">Card with Actions</div>
    <p class="text-gray-700 text-base mb-4">
      A card with action buttons below the content.
    </p>
    <div class="flex gap-2">
      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Action
      </button>
      <button class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
        Cancel
      </button>
    </div>
  </div>
</div>`,
      },
      // Tailwind Forms
      {
        id: 'tw-forms',
        category: 'inputs',
        title: 'Tailwind Form Controls',
        description: 'Form controls styled with Tailwind CSS',
        component: <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username" >
                Username
              </label>
              <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" placeholder="Username" />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email" >
                Email
              </label>
              <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="email" placeholder="example@example.com" />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" type="password" placeholder="******************" />
              <p className="text-red-500 text-xs italic">Please choose a password.</p>
            </div>
            <div className="flex items-center justify-between">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                Sign In
              </button>
              <a className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="#">
                Forgot Password?
              </a>
            </div>
          </form>
        </Box>,
        code: `<form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
  <div class="mb-4">
    <label class="block text-gray-700 text-sm font-bold mb-2">
      Username
    </label>
    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" placeholder="Username" />
  </div>
  <div class="mb-4">
    <label class="block text-gray-700 text-sm font-bold mb-2">
      Email
    </label>
    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="email" placeholder="example@example.com" />
  </div>
  <div class="mb-6">
    <label class="block text-gray-700 text-sm font-bold mb-2">
      Password
    </label>
    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" type="password" placeholder="******************" />
    <p class="text-red-500 text-xs italic">Please choose a password.</p>
  </div>
  <div class="flex items-center justify-between">
    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
      Sign In
    </button>
    <a class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="#">
      Forgot Password?
    </a>
  </div>
</form>`,
      },
      // Tailwind Alerts
      {
        id: 'tw-alerts',
        category: 'feedback',
        title: 'Tailwind Alerts',
        description: 'Alert and notification components',
        component: <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4" role="alert">
            <p className="font-bold">Info</p>
            <p>Something important you should know.</p>
          </div>
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
            <p className="font-bold">Success</p>
            <p>Your action was completed successfully.</p>
          </div>
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
            <p className="font-bold">Warning</p>
            <p>Better check yourself, you're not looking too good.</p>
          </div>
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p className="font-bold">Error</p>
            <p>Something seriously bad happened.</p>
          </div>
        </Box>,
        code: `<div class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4" role="alert">
  <p class="font-bold">Info</p>
  <p>Something important you should know.</p>
</div>

<div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
  <p class="font-bold">Success</p>
  <p>Your action was completed successfully.</p>
</div>

<div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
  <p class="font-bold">Warning</p>
  <p>Better check yourself, you're not looking too good.</p>
</div>

<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
  <p class="font-bold">Error</p>
  <p>Something seriously bad happened.</p>
</div>`,
      }
    ],
    html: [
      // Modern HTML/CSS Components
      {
        id: 'html-buttons',
        category: 'buttons',
        title: 'Modern CSS Buttons',
        description: 'Beautiful button styles with pure CSS',
        component: <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <ModernButton className="primary">Primary Button</ModernButton>
            <ModernButton className="secondary">Secondary Button</ModernButton>
            <ModernButton className="success">Success Button</ModernButton>
            <ModernButton className="danger">Danger Button</ModernButton>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <ModernButton className="outline">Outline Button</ModernButton>
            <ModernButton className="gradient">Gradient Button</ModernButton>
            <ModernButton className="rounded">Rounded Button</ModernButton>
            <ModernButton className="disabled">Disabled Button</ModernButton>
          </Box>
        </Box>,
        code: `<!-- HTML -->
<button class="modern-btn primary">Primary Button</button>
<button class="modern-btn secondary">Secondary Button</button>
<button class="modern-btn success">Success Button</button>
<button class="modern-btn danger">Danger Button</button>
<button class="modern-btn outline">Outline Button</button>
<button class="modern-btn gradient">Gradient Button</button>
<button class="modern-btn rounded">Rounded Button</button>
<button class="modern-btn disabled">Disabled Button</button>

/* CSS */
.modern-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modern-btn.primary {
  background: #3B82F6;
  color: white;
}

.modern-btn.secondary {
  background: #6B7280;
  color: white;
}

.modern-btn.success {
  background: #10B981;
  color: white;
}

.modern-btn.danger {
  background: #EF4444;
  color: white;
}

.modern-btn.outline {
  background: transparent;
  border: 2px solid #3B82F6;
  color: #3B82F6;
}

.modern-btn.gradient {
  background: linear-gradient(45deg, #3B82F6, #8B5CF6);
  color: white;
}

.modern-btn.rounded {
  border-radius: 25px;
  background: #3B82F6;
  color: white;
}

.modern-btn.disabled {
  background: #E5E7EB;
  color: #9CA3AF;
  cursor: not-allowed;
}

.modern-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}`,
      },
      {
        id: 'html-cards',
        category: 'layout',
        title: 'Modern CSS Cards',
        description: 'Sleek and responsive card designs',
        component: <CardStyles>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <div className="modern-card">
              <div className="card-image">
                <img src="https://source.unsplash.com/300x200/?nature,water" alt="Card" />
              </div>
              <div className="card-content">
                <h3>Explore Nature</h3>
                <p>Discover the beauty of natural landscapes and serene environments.</p>
                <button className="card-btn">Learn More</button>
              </div>
            </div>
            <div className="modern-card glass">
              <div className="card-content">
                <h3>Premium Features</h3>
                <p>Access exclusive content and premium features with our Pro plan.</p>
                <button className="card-btn glass">Upgrade Now</button>
              </div>
            </div>
          </Box>
        </CardStyles>,
        code: `<!-- HTML -->
<div class="modern-card">
  <div class="card-image">
    <img src="https://source.unsplash.com/300x200/?nature,water" alt="Card" />
  </div>
  <div class="card-content">
    <h3>Explore Nature</h3>
    <p>Discover the beauty of natural landscapes and serene environments.</p>
    <button class="card-btn">Learn More</button>
  </div>
</div>

<div class="modern-card glass">
  <div class="card-content">
    <h3>Premium Features</h3>
    <p>Access exclusive content and premium features with our Pro plan.</p>
    <button class="card-btn glass">Upgrade Now</button>
  </div>
</div>

/* CSS */
.modern-card {
  width: 300px;
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.modern-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.card-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.modern-card:hover .card-image img {
  transform: scale(1.1);
}

.card-content {
  padding: 20px;
}

.card-content h3 {
  margin: 0 0 10px 0;
  color: #1F2937;
}

.card-content p {
  color: #6B7280;
  margin-bottom: 20px;
}

.card-btn {
  padding: 8px 16px;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.card-btn:hover {
  background: #2563EB;
}

.modern-card.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.modern-card.glass h3 {
  color: white;
}

.modern-card.glass p {
  color: rgba(255, 255, 255, 0.8);
}

.card-btn.glass {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.card-btn.glass:hover {
  background: rgba(255, 255, 255, 0.3);
}`,
      },
      {
        id: 'html-forms',
        category: 'inputs',
        title: 'Modern CSS Forms',
        description: 'Beautiful and responsive form controls',
        component: <FormStyles>
          <form className="modern-form">
            <div className="form-group">
              <input type="text" id="name" className="form-input" placeholder=" " />
              <label htmlFor="name" className="form-label">Full Name</label>
            </div>
            <div className="form-group">
              <input type="email" id="email" className="form-input" placeholder=" " />
              <label htmlFor="email" className="form-label">Email Address</label>
            </div>
            <div className="form-group">
              <textarea id="message" className="form-input" placeholder=" " rows="4"></textarea>
              <label htmlFor="message" className="form-label">Your Message</label>
            </div>
            <button type="submit" className="form-button">Send Message</button>
          </form>
        </FormStyles>,
        code: `<!-- HTML -->
<form class="modern-form">
  <div class="form-group">
    <input type="text" id="name" class="form-input" placeholder=" " />
    <label for="name" class="form-label">Full Name</label>
  </div>
  <div class="form-group">
    <input type="email" id="email" class="form-input" placeholder=" " />
    <label for="email" class="form-label">Email Address</label>
  </div>
  <div class="form-group">
    <textarea id="message" class="form-input" placeholder=" " rows="4"></textarea>
    <label for="message" class="form-label">Your Message</label>
  </div>
  <button type="submit" class="form-button">Send Message</button>
</form>

<!-- CSS -->
<style>
.modern-form {
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.form-group {
  position: relative;
  margin-bottom: 1.5rem;
}

.form-input {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.form-label {
  position: absolute;
  left: 12px;
  top: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  pointer-events: none;
  transition: all 0.3s ease;
}

.form-input:focus + .form-label,
.form-input:not(:placeholder-shown) + .form-label {
  transform: translateY(-24px) scale(0.8);
  color: #3B82F6;
}

.form-button {
  width: 100%;
  padding: 12px;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.form-button:hover {
  background: #2563EB;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Dark theme adjustments */
@media (prefers-color-scheme: dark) {
  .form-input {
    background: rgba(0, 0, 0, 0.2);
  }
  
  .form-input:focus {
    border-color: #60A5FA;
    box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
  }
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .modern-form {
    padding: 1.5rem;
  }
  
  .form-input,
  .form-button {
    font-size: 0.875rem;
  }
}
</style>`,
      },
      {
        id: 'html-loaders',
        category: 'feedback',
        title: 'CSS Loading Animations',
        description: 'Modern loading spinners and animations',
        component: <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <div className="loader-container">
            <div className="loader spinner"></div>
            <p>Spinner</p>
          </div>
          <div className="loader-container">
            <div className="loader pulse"></div>
            <p>Pulse</p>
          </div>
          <div className="loader-container">
            <div className="loader dots"></div>
            <p>Dots</p>
          </div>
        </Box>,
        code: `<div class="loader-container">
  <div class="loader spinner"></div>
  <p>Spinner</p>
</div>
<div class="loader-container">
  <div class="loader pulse"></div>
  <p>Pulse</p>
</div>
<div class="loader-container">
  <div class="loader dots"></div>
  <p>Dots</p>
</div>

<style>
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.loader-container p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}
.loader {
  width: 40px;
  height: 40px;
}
.spinner {
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: #3B82F6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.pulse {
  background: #3B82F6;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}
.dots {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.dots::before,
.dots::after {
  content: '';
  width: 8px;
  height: 8px;
  background: #3B82F6;
  border-radius: 50%;
  animation: dots 1s infinite ease-in-out;
}
.dots::after {
  animationDelay: '0.5s',
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes pulse {
  0% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.8); opacity: 0.5; }
}
@keyframes dots {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>`,
      },
      {
        id: 'html-navigation',
        category: 'navigation',
        title: 'Modern Navigation Menu',
        description: 'Responsive navigation menu with dropdown',
        component: <Box sx={{ width: '100%' }}>
          <nav className="modern-nav">
            <div className="nav-brand">Logo</div>
            <ul className="nav-menu">
              <li><a href="#" className="nav-link">Home</a></li>
              <li className="dropdown">
                <a href="#" className="nav-link">Products</a>
                <ul className="dropdown-menu">
                  <li><a href="#">Item 1</a></li>
                  <li><a href="#">Item 2</a></li>
                  <li><a href="#">Item 3</a></li>
                </ul>
              </li>
              <li><a href="#" className="nav-link">About</a></li>
              <li><a href="#" className="nav-link">Contact</a></li>
            </ul>
          </nav>
        </Box>,
        code: `<nav class="modern-nav">
  <div class="nav-brand">Logo</div>
  <ul class="nav-menu">
    <li><a href="#" class="nav-link">Home</a></li>
    <li class="dropdown">
      <a href="#" class="nav-link">Products</a>
      <ul class="dropdown-menu">
        <li><a href="#">Item 1</a></li>
        <li><a href="#">Item 2</a></li>
        <li><a href="#">Item 3</a></li>
      </ul>
    </li>
    <li><a href="#" class="nav-link">About</a></li>
    <li><a href="#" class="nav-link">Contact</a></li>
  </ul>
</nav>`,
      },
      {
        id: 'html-modal',
        category: 'feedback',
        title: 'Modal Dialog',
        description: 'Custom modal dialog with backdrop',
        component: <Box sx={{ position: 'relative', minHeight: '200px' }}>
          <button className="modern-btn primary" onClick={() => {
            const modal = document.querySelector('.modal-overlay');
            if (modal) modal.classList.add('active');
          }}>
            Open Modal
          </button>
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Modal Title</h2>
                <button className="modal-close" onClick={() => {
                  const modal = document.querySelector('.modal-overlay');
                  if (modal) modal.classList.remove('active');
                }}>×</button>
              </div>
              <div className="modal-body">
                <p>This is the modal content. You can add any content here including forms, images, or other components.</p>
              </div>
              <div className="modal-footer">
                <button className="modern-btn outline" onClick={() => {
                  const modal = document.querySelector('.modal-overlay');
                  if (modal) modal.classList.remove('active');
                }}>Cancel</button>
                <button className="modern-btn primary">Confirm</button>
              </div>
            </div>
          </div>
        </Box>,
        code: `<button class="modern-btn primary" onclick="openModal()">
  Open Modal
</button>

<div class="modal-overlay">
  <div class="modal-content">
    <div class="modal-header">
      <h2>Modal Title</h2>
      <button class="modal-close" onclick="closeModal()">×</button>
    </div>
    <div class="modal-body">
      <p>This is the modal content. You can add any content here including forms, images, or other components.</p>
    </div>
    <div class="modal-footer">
      <button class="modern-btn outline" onclick="closeModal()">Cancel</button>
      <button class="modern-btn primary">Confirm</button>
    </div>
  </div>
</div>

<script>
function openModal() {
  document.querySelector('.modal-overlay').classList.add('active');
}

function closeModal() {
  document.querySelector('.modal-overlay').classList.remove('active');
}
</script>`,
      },
      {
        id: 'html-tooltip',
        category: 'feedback',
        title: 'Custom Tooltips',
        description: 'Pure CSS tooltips with different positions',
        component: <TooltipStyles>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', padding: '2rem' }}>
            <button className="tooltip-btn" data-tooltip="Tooltip Top">
              Hover Me (Top)
            </button>
            <button className="tooltip-btn" data-tooltip="Tooltip Bottom" data-position="bottom">
              Hover Me (Bottom)
            </button>
            <button className="tooltip-btn" data-tooltip="Tooltip Left" data-position="left">
              Hover Me (Left)
            </button>
            <button className="tooltip-btn" data-tooltip="Tooltip Right" data-position="right">
              Hover Me (Right)
            </button>
          </Box>
        </TooltipStyles>,
        code: `<button class="tooltip-btn" data-tooltip="Tooltip Top">
  Hover Me (Top)
</button>
<button class="tooltip-btn" data-tooltip="Tooltip Bottom" data-position="bottom">
  Hover Me (Bottom)
</button>
<button class="tooltip-btn" data-tooltip="Tooltip Left" data-position="left">
  Hover Me (Left)
</button>
<button class="tooltip-btn" data-tooltip="Tooltip Right" data-position="right">
  Hover Me (Right)
</button>`,
      },
      // Add these new components to the HTML section
      {
        id: 'html-progress',
        category: 'feedback',
        title: 'Progress Bars',
        description: 'Animated progress indicators with different styles',
        component: <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '75%' }}>75%</div>
          </div>
          <div className="progress-bar striped">
            <div className="progress-fill" style={{ width: '60%' }}>60%</div>
          </div>
          <div className="progress-bar gradient">
            <div className="progress-fill" style={{ width: '90%' }}>90%</div>
          </div>
          <div className="progress-steps">
            <div className="step completed">1</div>
            <div className="step completed">2</div>
            <div className="step active">3</div>
            <div className="step">4</div>
          </div>
        </Box>,
        code: `<div class="progress-bar">
  <div class="progress-fill" style="width: 75%">75%</div>
</div>

<div class="progress-bar striped">
  <div class="progress-fill" style="width: 60%">60%</div>
</div>

<div class="progress-bar gradient">
  <div class="progress-fill" style="width: 90%">90%</div>
</div>

<div class="progress-steps">
  <div class="step completed">1</div>
  <div class="step completed">2</div>
  <div class="step active">3</div>
  <div class="step">4</div>
</div>

<style>
.progress-bar {
  width: 100%;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3B82F6;
  border-radius: 10px;
  transition: width 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
}

.progress-bar.striped .progress-fill {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 20px 20px;
  animation: progress-stripes 1s linear infinite;
}

.progress-bar.gradient .progress-fill {
  background: linear-gradient(90deg, #3B82F6, #8B5CF6);
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 10px;
}

.step {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
}

.step::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
}

.step:last-child::after {
  display: none;
}

.step.completed {
  background: #10B981;
}

.step.active {
  background: #3B82F6;
}

@keyframes progress-stripes {
  0% { background-position: 0 0; }
  100% { background-position: 20px 0; }
}
</style>`,
      },
      {
        id: 'html-accordion',
        category: 'layout',
        title: 'Accordion',
        description: 'Collapsible content sections',
        component: <Box sx={{ width: '100%' }}>
          <div className="accordion">
            <div className="accordion-item">
              <button className="accordion-header">
                Section 1
                <span className="accordion-icon">+</span>
              </button>
              <div className="accordion-content">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              </div>
            </div>
            <div className="accordion-item">
              <button className="accordion-header">
                Section 2
                <span className="accordion-icon">+</span>
              </button>
              <div className="accordion-content">
                <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              </div>
            </div>
            <div className="accordion-item">
              <button className="accordion-header">
                Section 3
                <span className="accordion-icon">+</span>
              </button>
              <div className="accordion-content">
                <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
              </div>
            </div>
          </div>
        </Box>,
        code: `<div class="accordion">
  <div class="accordion-item">
    <button class="accordion-header">
      Section 1
      <span class="accordion-icon">+</span>
    </button>
    <div class="accordion-content">
      <p>Lorem ipsum dolor sit amet...</p>
    </div>
  </div>
  <!-- More accordion items -->
</div>

<style>
.accordion {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.accordion-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.accordion-header {
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  text-align: left;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.accordion-header:hover {
  background: rgba(255, 255, 255, 0.1);
}

.accordion-icon {
  transition: transform 0.3s ease;
}

.accordion-item.active .accordion-icon {
  transform: rotate(45deg);
}

.accordion-content {
  padding: 0;
  max-height: 0;
  overflow: hidden;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.02);
}

.accordion-item.active .accordion-content {
  padding: 1rem;
  max-height: 200px;
}

.accordion-content p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
}
</style>

<script>
document.querySelectorAll('.accordion-header').forEach(button => {
  button.addEventListener('click', () => {
    const accordionItem = button.parentElement;
    accordionItem.classList.toggle('active');
  });
});
</script>`,
      },
      {
        id: 'html-pricing',
        category: 'layout',
        title: 'Pricing Tables',
        description: 'Modern pricing plan comparison tables',
        component: <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div className="pricing-card">
            <div className="pricing-header">
              <h3>Basic</h3>
              <div className="price">
                <span className="currency">$</span>
                <span className="amount">9</span>
                <span className="period">/month</span>
              </div>
            </div>
            <ul className="pricing-features">
              <li>✓ 10 Projects</li>
              <li>✓ 5GB Storage</li>
              <li>✓ Basic Support</li>
              <li className="disabled">✗ API Access</li>
              <li className="disabled">✗ Custom Domain</li>
            </ul>
            <button className="pricing-btn">Choose Plan</button>
          </div>
          <div className="pricing-card popular">
            <div className="popular-badge">Popular</div>
            <div className="pricing-header">
              <h3>Pro</h3>
              <div className="price">
                <span className="currency">$</span>
                <span className="amount">29</span>
                <span className="period">/month</span>
              </div>
            </div>
            <ul className="pricing-features">
              <li>✓ Unlimited Projects</li>
              <li>✓ 50GB Storage</li>
              <li>✓ Priority Support</li>
              <li>✓ API Access</li>
              <li>✓ Custom Domain</li>
            </ul>
            <button className="pricing-btn">Choose Plan</button>
          </div>
        </Box>,
        code: `<div class="pricing-card">
  <div class="pricing-header">
    <h3>Basic</h3>
    <div class="price">
      <span class="currency">$</span>
      <span class="amount">9</span>
      <span class="period">/month</span>
    </div>
  </div>
  <ul class="pricing-features">
    <li>✓ 10 Projects</li>
    <li>✓ 5GB Storage</li>
    <li>✓ Basic Support</li>
    <li class="disabled">✗ API Access</li>
    <li class="disabled">✗ Custom Domain</li>
  </ul>
  <button class="pricing-btn">Choose Plan</button>
</div>

<div class="pricing-card popular">
  <div class="popular-badge">Popular</div>
  <div class="pricing-header">
    <h3>Pro</h3>
    <div class="price">
      <span class="currency">$</span>
      <span class="amount">29</span>
      <span class="period">/month</span>
    </div>
  </div>
  <ul class="pricing-features">
    <li>✓ Unlimited Projects</li>
    <li>✓ 50GB Storage</li>
    <li>✓ Priority Support</li>
    <li>✓ API Access</li>
    <li>✓ Custom Domain</li>
  </ul>
  <button class="pricing-btn">Choose Plan</button>
</div>`,
      },
      {
        id: 'html-social',
        category: 'buttons',
        title: 'Social Media Buttons',
        description: 'Stylish social media sharing buttons',
        component: <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <button className="social-btn facebook">
            <i className="fab fa-facebook-f"></i>
            Facebook
          </button>
          <button className="social-btn twitter">
            <i className="fab fa-twitter"></i>
            Twitter
          </button>
          <button className="social-btn linkedin">
            <i className="fab fa-linkedin-in"></i>
            LinkedIn
          </button>
          <button className="social-btn github">
            <i className="fab fa-github"></i>
            GitHub
          </button>
          <button className="social-btn instagram">
            <i className="fab fa-instagram"></i>
            Instagram
          </button>
        </Box>,
        code: `<!-- Include Font Awesome for icons -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

<button class="social-btn facebook">
  <i class="fab fa-facebook-f"></i>
  Facebook
</button>
<button class="social-btn twitter">
  <i class="fab fa-twitter"></i>
  Twitter
</button>
<button class="social-btn linkedin">
  <i class="fab fa-linkedin-in"></i>
  LinkedIn
</button>
<button class="social-btn github">
  <i class="fab fa-github"></i>
  GitHub
</button>
<button class="social-btn instagram">
  <i class="fab fa-instagram"></i>
  Instagram
</button>`,
      }
    ]
  };

  const handleFrameworkChange = (framework) => {
    setSelectedFramework(framework);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const toggleCode = (componentId) => {
    setShowCode(prev => ({
      ...prev,
      [componentId]: !prev[componentId]
    }));
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  const filteredComponents = components[selectedFramework].filter(component => {
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
    const matchesSearch = 
      component.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Add Global styles
  return (
    <>
      <Global styles={globalStyles} />
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #0F172A, #1E293B)',
        color: 'white',
        px: 3,
        pt: { xs: '84px', sm: '88px' }, // Account for navbar height
        pb: 6,
        position: 'relative'
      }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 800,
            mb: 2,
            background: 'linear-gradient(45deg, #3B82F6, #EC4899)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Component Library
          </Typography>
          <Typography variant="h6" sx={{ color: alpha('#fff', 0.7) }}>
            Explore and use pre-built components from popular frameworks
          </Typography>
        </Box>

        {/* Framework Selection */}
        <Paper sx={{ 
          mb: 3,
          background: alpha('#1E293B', 0.5),
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          border: `1px solid ${alpha('#fff', 0.1)}`,
          p: 2
        }}>
          <Grid container spacing={2}>
            {frameworks.map(framework => (
              <Grid item key={framework.id}>
                <Button 
                  variant={selectedFramework === framework.id ? "contained" : "outlined"}
                  onClick={() => handleFrameworkChange(framework.id)}
                  sx={{
                    borderColor: alpha('#fff', 0.2),
                    color: selectedFramework === framework.id ? 'white' : alpha('#fff', 0.7),
                    backgroundColor: selectedFramework === framework.id ? '#3B82F6' : 'transparent',
                    '&:hover': {
                      borderColor: '#3B82F6',
                      backgroundColor: selectedFramework === framework.id ? '#2563EB' : alpha('#3B82F6', 0.1),
                    }
                  }}
                >
                  {framework.name}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Search and Categories */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 4,
          flexWrap: 'wrap'
        }}>
          <TextField
            placeholder="Search components..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: alpha('#fff', 0.5) }} />,
            }}
            sx={{
              flex: 1,
              minWidth: 300,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                backgroundColor: alpha('#1E293B', 0.5),
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                '& fieldset': {
                  borderColor: alpha('#fff', 0.1),
                },
                '&:hover fieldset': {
                  borderColor: alpha('#fff', 0.2),
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#3B82F6',
                },
              },
            }}
          />
          
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            {categories.map(category => (
              <Chip
                key={category.id}
                label={category.name}
                onClick={() => handleCategoryChange(category.id)}
                sx={{
                  backgroundColor: selectedCategory === category.id ? '#3B82F6' : alpha('#1E293B', 0.5),
                  color: 'white',
                  border: `1px solid ${selectedCategory === category.id ? '#3B82F6' : alpha('#fff', 0.1)}`,
                  '&:hover': {
                    backgroundColor: selectedCategory === category.id ? '#2563EB' : alpha('#1E293B', 0.8),
                  }
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Components Grid */}
        <Grid container spacing={3}>
          {filteredComponents.map((component) => (
            <Grid item xs={12} md={6} lg={4} key={component.id}>
              <Card sx={{ 
                height: '100%',
                background: alpha('#1E293B', 0.5),
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                border: `1px solid ${alpha('#fff', 0.1)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.2)',
                  borderColor: alpha('#3B82F6', 0.5)
                }
              }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                      {component.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.7) }}>
                      {component.description}
                    </Typography>
                  </Box>

                  <Box sx={{ 
                    p: 3, 
                    mb: 2,
                    backgroundColor: alpha('#0F172A', 0.5),
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {component.component}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      startIcon={<CodeIcon />}
                      onClick={() => toggleCode(component.id)}
                      variant="outlined"
                      size="small"
                      sx={{
                        borderColor: alpha('#fff', 0.2),
                        color: 'white',
                        '&:hover': {
                          borderColor: '#3B82F6',
                          backgroundColor: alpha('#3B82F6', 0.1),
                        }
                      }}
                    >
                      {showCode[component.id] ? 'Hide Code' : 'View Code'}
                    </Button>
                    <Tooltip title="Copy code">
                      <IconButton 
                        onClick={() => copyCode(component.code)}
                        size="small"
                        sx={{ 
                          color: alpha('#fff', 0.7),
                          '&:hover': {
                            color: '#3B82F6',
                            backgroundColor: alpha('#3B82F6', 0.1),
                          }
                        }}
                      >
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {showCode[component.id] && (
                    <Box sx={{ mt: 2 }}>
                      <SyntaxHighlighter
                        language="jsx"
                        style={atomDark}
                        customStyle={{
                          margin: 0,
                          borderRadius: 8,
                          maxHeight: 200,
                          overflow: 'auto'
                        }}
                      >
                        {component.code}
                      </SyntaxHighlighter>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
};

export default ComponentLibrary;
