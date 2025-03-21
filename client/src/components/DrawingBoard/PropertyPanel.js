import React from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Divider,
  TextField,
  Grid,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  InputAdornment,
  Button,
  FormControlLabel,
  Switch,
  Checkbox
} from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import DeleteIcon from '@mui/icons-material/Delete';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';

/**
 * PropertyPanel component for DrawingBoard
 * Displays and allows editing properties of the selected element
 */
const PropertyPanel = ({ 
  selectedElement,
  onUpdateShapeProperty,
  onUpdateTextProperty,
  onUpdateImageProperty,
  onUpdateComponentProperty,
  onColorPickerOpen,
  onDelete
}) => {
  // If no element selected, show placeholder
  if (!selectedElement) {
    return (
      <Paper sx={{ p: 2, m: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          Properties
        </Typography>
        
        <Divider />
        
        <Box 
          sx={{ 
            flex: 1,
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            py: 4
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No element selected
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select an element on the canvas to edit properties
          </Typography>
        </Box>
      </Paper>
    );
  }

  // Render properties based on element type
  const renderProperties = () => {
    const { type, data } = selectedElement;
    
    switch (type) {
      case 'shape':
        return renderShapeProperties(data);
      case 'text':
        return renderTextProperties(data);
      case 'image':
        return renderImageProperties(data);
      case 'component':
        return renderComponentProperties();
      default:
        return (
          <Typography variant="body2" color="text.secondary">
            No properties available for this element type
          </Typography>
        );
    }
  };
  
  // Render properties for shape elements
  const renderShapeProperties = (shape) => (
    <>
      <Typography variant="subtitle1" gutterBottom>
        Shape Properties
      </Typography>
      
      {/* Position */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <TextField
            label="X Position"
            type="number"
            value={Math.round(shape.x)}
            onChange={(e) => onUpdateShapeProperty('x', parseInt(e.target.value) || 0)}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Y Position"
            type="number"
            value={Math.round(shape.y)}
            onChange={(e) => onUpdateShapeProperty('y', parseInt(e.target.value) || 0)}
            fullWidth
            size="small"
          />
        </Grid>
      </Grid>
      
      {/* Size */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <TextField
            label="Width"
            type="number"
            value={Math.round(shape.width)}
            onChange={(e) => onUpdateShapeProperty('width', Math.max(1, parseInt(e.target.value) || 0))}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Height"
            type="number"
            value={Math.round(shape.height)}
            onChange={(e) => onUpdateShapeProperty('height', Math.max(1, parseInt(e.target.value) || 0))}
            fullWidth
            size="small"
          />
        </Grid>
      </Grid>
      
      {/* Colors */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Stroke Color
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box 
            sx={{ 
              width: 24, 
              height: 24, 
              bgcolor: shape.strokeColor || '#000000',
              border: '1px solid #ddd',
              borderRadius: '4px',
              mr: 1
            }} 
          />
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            {shape.strokeColor || '#000000'}
          </Typography>
          <IconButton 
            size="small" 
            onClick={(e) => onColorPickerOpen(e, 'stroke')}
          >
            <PaletteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Fill Color
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box 
            sx={{ 
              width: 24, 
              height: 24, 
              bgcolor: shape.fillColor || 'transparent',
              border: '1px solid #ddd',
              borderRadius: '4px',
              mr: 1
            }} 
          />
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            {shape.fillColor || 'transparent'}
          </Typography>
          <IconButton 
            size="small" 
            onClick={(e) => onColorPickerOpen(e, 'fill')}
          >
            <FormatColorFillIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      {/* Stroke Width */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Stroke Width
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <Slider
              value={shape.strokeWidth || 1}
              onChange={(e, newValue) => onUpdateShapeProperty('strokeWidth', newValue)}
              min={0}
              max={20}
              step={1}
            />
          </Grid>
          <Grid item>
            <TextField 
              value={shape.strokeWidth || 1}
              onChange={(e) => onUpdateShapeProperty('strokeWidth', Math.max(0, parseInt(e.target.value) || 0))}
              inputProps={{
                min: 0,
                max: 20,
                type: 'number'
              }}
              size="small"
              sx={{ width: 60 }}
            />
          </Grid>
        </Grid>
      </Box>
      
      {/* Opacity */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Opacity
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <Slider
              value={shape.opacity !== undefined ? shape.opacity : 1}
              onChange={(e, newValue) => onUpdateShapeProperty('opacity', newValue)}
              min={0}
              max={1}
              step={0.01}
            />
          </Grid>
          <Grid item>
            <TextField 
              value={Math.round((shape.opacity !== undefined ? shape.opacity : 1) * 100)}
              onChange={(e) => {
                const value = Math.min(Math.max(parseInt(e.target.value) || 0, 0), 100) / 100;
                onUpdateShapeProperty('opacity', value);
              }}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              inputProps={{
                min: 0,
                max: 100,
                type: 'number'
              }}
              size="small"
              sx={{ width: 80 }}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
  
  // Render properties for text elements
  const renderTextProperties = (text) => (
    <>
      <Typography variant="subtitle1" gutterBottom>
        Text Properties
      </Typography>
      
      {/* Text Content */}
      <TextField
        label="Text Content"
        value={text.content || ''}
        onChange={(e) => onUpdateTextProperty('content', e.target.value)}
        fullWidth
        multiline
        rows={2}
        sx={{ mb: 2 }}
      />
      
      {/* Position */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <TextField
            label="X Position"
            type="number"
            value={Math.round(text.x)}
            onChange={(e) => onUpdateTextProperty('x', parseInt(e.target.value) || 0)}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Y Position"
            type="number"
            value={Math.round(text.y)}
            onChange={(e) => onUpdateTextProperty('y', parseInt(e.target.value) || 0)}
            fullWidth
            size="small"
          />
        </Grid>
      </Grid>
      
      {/* Color */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Text Color
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box 
            sx={{ 
              width: 24, 
              height: 24, 
              bgcolor: text.color || '#000000',
              border: '1px solid #ddd',
              borderRadius: '4px',
              mr: 1
            }} 
          />
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            {text.color || '#000000'}
          </Typography>
          <IconButton 
            size="small" 
            onClick={(e) => onColorPickerOpen(e, 'text')}
          >
            <PaletteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      {/* Font Properties */}
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel id="font-family-label">Font Family</InputLabel>
        <Select
          labelId="font-family-label"
          value={text.style?.fontFamily || 'Arial, sans-serif'}
          label="Font Family"
          onChange={(e) => onUpdateTextProperty('style.fontFamily', e.target.value)}
        >
          <MenuItem value="Arial, sans-serif">Arial</MenuItem>
          <MenuItem value="Times New Roman, serif">Times New Roman</MenuItem>
          <MenuItem value="Courier New, monospace">Courier New</MenuItem>
          <MenuItem value="Georgia, serif">Georgia</MenuItem>
          <MenuItem value="Verdana, sans-serif">Verdana</MenuItem>
          <MenuItem value="Helvetica, sans-serif">Helvetica</MenuItem>
        </Select>
      </FormControl>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <TextField
            label="Font Size"
            type="number"
            value={text.style?.fontSize || 16}
            onChange={(e) => onUpdateTextProperty('style.fontSize', Math.max(8, parseInt(e.target.value) || 8))}
            fullWidth
            size="small"
            inputProps={{ min: 8 }}
          />
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth size="small">
            <InputLabel id="text-align-label">Text Align</InputLabel>
            <Select
              labelId="text-align-label"
              value={text.style?.textAlign || 'left'}
              label="Text Align"
              onChange={(e) => onUpdateTextProperty('style.textAlign', e.target.value)}
            >
              <MenuItem value="left">Left</MenuItem>
              <MenuItem value="center">Center</MenuItem>
              <MenuItem value="right">Right</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </>
  );
  
  // Render properties for image elements
  const renderImageProperties = (image) => (
    <>
      <Typography variant="subtitle1" gutterBottom>
        Image Properties
      </Typography>
      
      {/* Position */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <TextField
            label="X Position"
            type="number"
            value={Math.round(image.x)}
            onChange={(e) => onUpdateImageProperty('x', parseInt(e.target.value) || 0)}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Y Position"
            type="number"
            value={Math.round(image.y)}
            onChange={(e) => onUpdateImageProperty('y', parseInt(e.target.value) || 0)}
            fullWidth
            size="small"
          />
        </Grid>
      </Grid>
      
      {/* Size */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <TextField
            label="Width"
            type="number"
            value={Math.round(image.width)}
            onChange={(e) => onUpdateImageProperty('width', Math.max(10, parseInt(e.target.value) || 10))}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Height"
            type="number"
            value={Math.round(image.height)}
            onChange={(e) => onUpdateImageProperty('height', Math.max(10, parseInt(e.target.value) || 10))}
            fullWidth
            size="small"
          />
        </Grid>
      </Grid>
      
      {/* Object Fit */}
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel id="object-fit-label">Object Fit</InputLabel>
        <Select
          labelId="object-fit-label"
          value={image.objectFit || 'cover'}
          label="Object Fit"
          onChange={(e) => onUpdateImageProperty('objectFit', e.target.value)}
        >
          <MenuItem value="cover">Cover</MenuItem>
          <MenuItem value="contain">Contain</MenuItem>
          <MenuItem value="fill">Fill</MenuItem>
          <MenuItem value="none">None</MenuItem>
        </Select>
      </FormControl>
      
      {/* Opacity */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Opacity
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <Slider
              value={image.opacity !== undefined ? image.opacity : 1}
              onChange={(e, newValue) => onUpdateImageProperty('opacity', newValue)}
              min={0}
              max={1}
              step={0.01}
            />
          </Grid>
          <Grid item>
            <TextField 
              value={Math.round((image.opacity !== undefined ? image.opacity : 1) * 100)}
              onChange={(e) => {
                const value = Math.min(Math.max(parseInt(e.target.value) || 0, 0), 100) / 100;
                onUpdateImageProperty('opacity', value);
              }}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              inputProps={{
                min: 0,
                max: 100,
                type: 'number'
              }}
              size="small"
              sx={{ width: 80 }}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
  
  // Component properties panel
  const renderComponentProperties = () => {
    if (!selectedElement || selectedElement.type !== 'component') return null;
    
    const componentType = selectedElement.data?.componentType || 'custom';
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Component Properties
        </Typography>
        
        {/* Component Type */}
        <FormControl fullWidth margin="normal" size="small">
          <InputLabel>Component Type</InputLabel>
          <Select
            value={componentType}
            label="Component Type"
            onChange={(e) => onUpdateComponentProperty('componentType', e.target.value)}
          >
            <MenuItem value="button">Button</MenuItem>
            <MenuItem value="input">Input Field</MenuItem>
            <MenuItem value="card">Card</MenuItem>
            <MenuItem value="checkbox">Checkbox</MenuItem>
            <MenuItem value="radio">Radio Button</MenuItem>
            <MenuItem value="slider">Slider</MenuItem>
            <MenuItem value="custom">Custom</MenuItem>
          </Select>
        </FormControl>
        
        {/* Component-specific properties */}
        {componentType === 'button' && (
          <>
            <TextField
              label="Button Text"
              value={selectedElement.data?.text || 'Button'}
              fullWidth
              margin="normal"
              size="small"
              onChange={(e) => onUpdateComponentProperty('text', e.target.value)}
            />
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Variant</InputLabel>
              <Select
                value={selectedElement.data?.variant || 'contained'}
                label="Variant"
                onChange={(e) => onUpdateComponentProperty('variant', e.target.value)}
              >
                <MenuItem value="contained">Contained</MenuItem>
                <MenuItem value="outlined">Outlined</MenuItem>
                <MenuItem value="text">Text</MenuItem>
              </Select>
            </FormControl>
          </>
        )}
        
        {componentType === 'input' && (
          <>
            <TextField
              label="Label"
              value={selectedElement.data?.label || 'Label'}
              fullWidth
              margin="normal"
              size="small"
              onChange={(e) => onUpdateComponentProperty('label', e.target.value)}
            />
            <TextField
              label="Placeholder"
              value={selectedElement.data?.placeholder || 'Placeholder...'}
              fullWidth
              margin="normal"
              size="small"
              onChange={(e) => onUpdateComponentProperty('placeholder', e.target.value)}
            />
          </>
        )}
        
        {componentType === 'card' && (
          <>
            <TextField
              label="Title"
              value={selectedElement.data?.title || 'Card Title'}
              fullWidth
              margin="normal"
              size="small"
              onChange={(e) => onUpdateComponentProperty('title', e.target.value)}
            />
            <TextField
              label="Content"
              value={selectedElement.data?.content || 'Card content...'}
              fullWidth
              margin="normal"
              size="small"
              multiline
              rows={2}
              onChange={(e) => onUpdateComponentProperty('content', e.target.value)}
            />
          </>
        )}
        
        {componentType === 'checkbox' && (
          <>
            <TextField
              label="Label"
              value={selectedElement.data?.label || 'Checkbox'}
              fullWidth
              margin="normal"
              size="small"
              onChange={(e) => onUpdateComponentProperty('label', e.target.value)}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedElement.data?.checked || false}
                  onChange={(e) => onUpdateComponentProperty('checked', e.target.checked)}
                />
              }
              label="Checked"
            />
          </>
        )}
        
        {componentType === 'radio' && (
          <>
            <TextField
              label="Label"
              value={selectedElement.data?.label || 'Radio Button'}
              fullWidth
              margin="normal"
              size="small"
              onChange={(e) => onUpdateComponentProperty('label', e.target.value)}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedElement.data?.selected || false}
                  onChange={(e) => onUpdateComponentProperty('selected', e.target.checked)}
                />
              }
              label="Selected"
            />
          </>
        )}
        
        {componentType === 'slider' && (
          <>
            <Slider
              value={selectedElement.data?.value ? selectedElement.data.value * 100 : 50}
              onChange={(e, newValue) => onUpdateComponentProperty('value', newValue / 100)}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <TextField
                label="Min"
                type="number"
                value={selectedElement.data?.min || 0}
                size="small"
                sx={{ width: '30%' }}
                onChange={(e) => onUpdateComponentProperty('min', Number(e.target.value))}
              />
              <TextField
                label="Max"
                type="number"
                value={selectedElement.data?.max || 100}
                size="small"
                sx={{ width: '30%' }}
                onChange={(e) => onUpdateComponentProperty('max', Number(e.target.value))}
              />
              <TextField
                label="Step"
                type="number"
                value={selectedElement.data?.step || 1}
                size="small"
                sx={{ width: '30%' }}
                onChange={(e) => onUpdateComponentProperty('step', Number(e.target.value))}
              />
            </Box>
          </>
        )}
        
        {componentType === 'custom' && (
          <TextField
            label="Text"
            value={selectedElement.data?.text || 'Custom Component'}
            fullWidth
            margin="normal"
            size="small"
            onChange={(e) => onUpdateComponentProperty('text', e.target.value)}
          />
        )}
        
        {/* Style properties for all components */}
        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
          Style
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button 
              variant="outlined" 
              onClick={(e) => onColorPickerOpen(e, 'fill')}
              fullWidth
              size="small"
              sx={{
                bgcolor: selectedElement.data?.style?.backgroundColor || '#ffffff',
                '&:hover': {
                  bgcolor: selectedElement.data?.style?.backgroundColor || '#ffffff'
                }
              }}
            >
              Background
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button 
              variant="outlined" 
              onClick={(e) => onColorPickerOpen(e, 'stroke')}
              fullWidth
              size="small"
              sx={{
                borderColor: selectedElement.data?.style?.borderColor || '#e0e0e0',
                '&:hover': {
                  borderColor: selectedElement.data?.style?.borderColor || '#e0e0e0'
                }
              }}
            >
              Border
            </Button>
          </Grid>
        </Grid>
        
        <FormControl fullWidth margin="normal" size="small">
          <InputLabel>Border Radius</InputLabel>
          <Select
            value={selectedElement.data?.style?.borderRadius || 4}
            label="Border Radius"
            onChange={(e) => onUpdateComponentProperty('style.borderRadius', Number(e.target.value))}
          >
            <MenuItem value={0}>0px (Square)</MenuItem>
            <MenuItem value={4}>4px (Subtle)</MenuItem>
            <MenuItem value={8}>8px (Rounded)</MenuItem>
            <MenuItem value={16}>16px (Large)</MenuItem>
            <MenuItem value={9999}>Circle/Pill</MenuItem>
          </Select>
        </FormControl>
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 2, m: 1, height: 'calc(100% - 16px)', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Properties
        </Typography>
        
        <IconButton color="error" onClick={() => onDelete && onDelete(selectedElement)} size="small">
          <DeleteIcon />
        </IconButton>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {renderProperties()}
    </Paper>
  );
};

export default PropertyPanel;

 