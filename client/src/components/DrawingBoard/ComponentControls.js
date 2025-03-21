import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  Divider,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  Slider,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import ButtonIcon from '@mui/icons-material/SmartButton';
import InputIcon from '@mui/icons-material/Input';
import CardIcon from '@mui/icons-material/CreditCard';
import WidgetsIcon from '@mui/icons-material/Widgets';
import ListIcon from '@mui/icons-material/List';
import TableChartIcon from '@mui/icons-material/TableChart';
import ImageIcon from '@mui/icons-material/Image';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import SliderIcon from '@mui/icons-material/TuneOutlined';
import TabsIcon from '@mui/icons-material/Tab';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import SubjectIcon from '@mui/icons-material/Subject';
import DateRangeIcon from '@mui/icons-material/DateRange';
import GridOnIcon from '@mui/icons-material/GridOn';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import HeightIcon from '@mui/icons-material/Height';
import CropDinIcon from '@mui/icons-material/CropDin';
import WebIcon from '@mui/icons-material/Web';
import VerticalSplitIcon from '@mui/icons-material/VerticalSplit';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';

/**
 * ComponentControls component for DrawingBoard
 * Allows adding pre-made components to the canvas
 */
const ComponentControls = ({ 
  onAddComponent 
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);

  // Basic component types with their metadata
  const basicComponents = [
    { id: 'button', name: 'Button', icon: <ButtonIcon />, description: 'Interactive button', category: 'basic' },
    { id: 'input', name: 'Input Field', icon: <InputIcon />, description: 'Text input field', category: 'basic' },
    { id: 'checkbox', name: 'Checkbox', icon: <CheckBoxIcon />, description: 'Toggle selection', category: 'basic' },
    { id: 'radio', name: 'Radio Button', icon: <RadioButtonCheckedIcon />, description: 'Single selection', category: 'basic' },
    { id: 'slider', name: 'Slider', icon: <SliderIcon />, description: 'Range selector', category: 'basic' }
  ];

  // Container component types
  const containerComponents = [
    { id: 'card', name: 'Card', icon: <CardIcon />, description: 'Container with shadow', category: 'container' },
    { id: 'list', name: 'List', icon: <ListIcon />, description: 'Vertical list', category: 'container' },
    { id: 'table', name: 'Table', icon: <TableChartIcon />, description: 'Data table', category: 'container' },
    { id: 'tabs', name: 'Tabs', icon: <TabsIcon />, description: 'Tabbed interface', category: 'container' },
    { id: 'menu', name: 'Menu', icon: <MenuIcon />, description: 'Dropdown menu', category: 'container' }
  ];

  // Form component types
  const formComponents = [
    { id: 'form', name: 'Form', icon: <WidgetsIcon />, description: 'Complete form', category: 'form' },
    { id: 'search', name: 'Search', icon: <SearchIcon />, description: 'Search input', category: 'form' },
    { id: 'select', name: 'Select', icon: <ArrowDropDownIcon />, description: 'Dropdown select', category: 'form' },
    { id: 'textarea', name: 'Text Area', icon: <SubjectIcon />, description: 'Multi-line input', category: 'form' },
    { id: 'datepicker', name: 'Date Picker', icon: <DateRangeIcon />, description: 'Date selection', category: 'form' }
  ];

  // Layout component types
  const layoutComponents = [
    { id: 'grid', name: 'Grid Layout', icon: <GridOnIcon />, description: 'Responsive grid', category: 'layout' },
    { id: 'flexbox', name: 'Flexbox', icon: <ViewColumnIcon />, description: 'Flexible layout', category: 'layout' },
    { id: 'divider', name: 'Divider', icon: <HorizontalRuleIcon />, description: 'Section separator', category: 'layout' },
    { id: 'spacer', name: 'Spacer', icon: <HeightIcon />, description: 'Empty space', category: 'layout' },
    { id: 'container', name: 'Container', icon: <CropDinIcon />, description: 'Main container', category: 'layout' }
  ];

  // Navigation component types
  const navigationComponents = [
    { id: 'navbar', name: 'Navigation Bar', icon: <WebIcon />, description: 'Top navigation', category: 'navigation' },
    { id: 'sidebar', name: 'Sidebar', icon: <VerticalSplitIcon />, description: 'Side navigation', category: 'navigation' },
    { id: 'breadcrumbs', name: 'Breadcrumbs', icon: <NavigateNextIcon />, description: 'Path indicators', category: 'navigation' },
    { id: 'pagination', name: 'Pagination', icon: <MoreHorizIcon />, description: 'Page navigation', category: 'navigation' },
    { id: 'stepper', name: 'Stepper', icon: <LinearScaleIcon />, description: 'Step process', category: 'navigation' }
  ];

  // Media component types
  const mediaComponents = [
    { id: 'image-gallery', name: 'Image Gallery', icon: <PhotoLibraryIcon />, description: 'Image collection', category: 'media' },
    { id: 'carousel', name: 'Carousel', icon: <ViewCarouselIcon />, description: 'Sliding content', category: 'media' },
    { id: 'video', name: 'Video Player', icon: <VideoLibraryIcon />, description: 'Video embed', category: 'media' },
    { id: 'avatar', name: 'Avatar', icon: <AccountCircleIcon />, description: 'User image', category: 'media' },
    { id: 'icon', name: 'Icon', icon: <EmojiEmotionsIcon />, description: 'Symbolic icon', category: 'media' }
  ];

  // All components
  const allComponents = [
    ...basicComponents, 
    ...containerComponents, 
    ...formComponents,
    ...layoutComponents,
    ...navigationComponents,
    ...mediaComponents,
    { id: 'custom', name: 'Custom Component', icon: <WidgetsIcon />, description: 'Build your own', category: 'custom' }
  ];

  // Filter components based on search query
  const filteredComponents = allComponents.filter(component => 
    component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    component.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get components based on active tab
  const getComponentsByTab = () => {
    switch (activeTab) {
      case 0: // All
        return filteredComponents;
      case 1: // Basic
        return filteredComponents.filter(c => c.category === 'basic');
      case 2: // Container
        return filteredComponents.filter(c => c.category === 'container');
      case 3: // Form
        return filteredComponents.filter(c => c.category === 'form');
      case 4: // Layout
        return filteredComponents.filter(c => c.category === 'layout');
      case 5: // Navigation
        return filteredComponents.filter(c => c.category === 'navigation');
      case 6: // Media
        return filteredComponents.filter(c => c.category === 'media');
      case 7: // Favorites
        return filteredComponents.filter(c => favorites.includes(c.id));
      default:
        return filteredComponents;
    }
  };

  // Toggle a component as favorite
  const toggleFavorite = (componentId) => {
    if (favorites.includes(componentId)) {
      setFavorites(favorites.filter(id => id !== componentId));
    } else {
      setFavorites([...favorites, componentId]);
    }
  };

  // Handle drag start for components
  const handleDragStart = (e, componentId) => {
    e.dataTransfer.setData('componentId', componentId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <Paper sx={{ p: 2, m: 1, display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        UI Components
      </Typography>
      
      <Divider />
      
      {/* Search field */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search components..."
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
        }}
      />
      
      {/* Component categories tabs */}
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="All" />
        <Tab label="Basic" />
        <Tab label="Container" />
        <Tab label="Form" />
        <Tab label="Layout" />
        <Tab label="Navigation" />
        <Tab label="Media" />
        <Tab label="Favorites" />
      </Tabs>
      
      {/* Component grid */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Typography variant="caption" color="text.secondary" paragraph>
          Drag and drop components onto the canvas or click to add
        </Typography>
        
        <Grid container spacing={1}>
          {getComponentsByTab().map((component) => (
            <Grid item xs={6} key={component.id}>
              <Card 
                sx={{ 
                  cursor: 'grab',
                  height: '100%',
                  transition: 'all 0.2s ease',
                  background: 'linear-gradient(to bottom, #ffffff, #f5f5f5)',
                  borderRadius: 2,
                  border: '1px solid #e0e0e0',
                  '&:hover': { 
                    boxShadow: 3,
                    transform: 'translateY(-4px)',
                    borderColor: 'primary.light'
                  },
                  position: 'relative',
                }}
                onClick={() => onAddComponent(component.id)}
                draggable
                onDragStart={(e) => handleDragStart(e, component.id)}
              >
                <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mb: 1.5,
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    borderRadius: 1,
                    p: 1,
                    width: '48px',
                    height: '48px',
                    margin: '0 auto',
                    alignItems: 'center'
                  }}>
                    {component.icon}
                  </Box>
                  <Typography variant="body2" component="div" fontWeight="bold">
                    {component.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {component.description}
                  </Typography>
                  
                  <DragIndicatorIcon 
                    sx={{
                      position: 'absolute',
                      top: 4,
                      left: 4,
                      fontSize: 14,
                      color: 'text.disabled'
                    }}
                  />
                  
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      fontSize: 16,
                      color: favorites.includes(component.id) ? 'warning.main' : 'text.disabled'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(component.id);
                    }}
                  >
                    {favorites.includes(component.id) ? '★' : '☆'}
                  </IconButton>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {getComponentsByTab().length === 0 && (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
              bgcolor: 'action.hover',
              borderRadius: 1,
              mt: 2
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No components found
            </Typography>
          </Box>
        )}
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      {/* Recent components section */}
      <Typography variant="subtitle2" gutterBottom>
        Recent Components
      </Typography>
      
      <Box 
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        {/* Replace this with actual recent components when implemented */}
        <Chip 
          label="Button" 
          icon={<ButtonIcon fontSize="small" />} 
          size="small" 
          onClick={() => onAddComponent('button')} 
        />
        <Chip 
          label="Input" 
          icon={<InputIcon fontSize="small" />} 
          size="small" 
          onClick={() => onAddComponent('input')} 
        />
        <Chip 
          label="Card" 
          icon={<CardIcon fontSize="small" />} 
          size="small" 
          onClick={() => onAddComponent('card')} 
        />
      </Box>
      
      {/* Custom component button */}
      <Button 
        variant="contained" 
        fullWidth
        startIcon={<AddIcon />}
        onClick={() => onAddComponent('custom')}
        sx={{ mt: 1 }}
      >
        Create Custom Component
      </Button>
    </Paper>
  );
};

export default ComponentControls; 