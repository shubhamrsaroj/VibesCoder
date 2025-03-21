import React from 'react';
import { 
  Box, 
  Typography, 
  Slider, 
  TextField, 
  IconButton, 
  Paper,
  InputAdornment,
  Divider,
  Grid
} from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';

/**
 * ShapeControls component for DrawingBoard
 * Allows adjusting properties for shape drawing tools
 */
const ShapeControls = ({ 
  canvasOptions, 
  onCanvasOptionsChange,
  onColorPickerOpen
}) => {
  // Handle stroke width change
  const handleStrokeWidthChange = (event, newValue) => {
    onCanvasOptionsChange({ strokeWidth: newValue });
  };
  
  // Handle opacity change
  const handleOpacityChange = (event, newValue) => {
    onCanvasOptionsChange({ opacity: newValue });
  };

  return (
    <Paper sx={{ p: 2, m: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" gutterBottom>
        Shape Controls
      </Typography>
      
      <Divider />
      
      {/* Stroke Color */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Stroke Color
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box 
            sx={{ 
              width: 24, 
              height: 24, 
              bgcolor: canvasOptions.strokeColor,
              border: '1px solid #ddd',
              borderRadius: '4px',
              mr: 1
            }} 
          />
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            {canvasOptions.strokeColor}
          </Typography>
          <IconButton 
            size="small" 
            onClick={(e) => onColorPickerOpen(e, 'stroke')}
          >
            <PaletteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      {/* Fill Color */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Fill Color
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box 
            sx={{ 
              width: 24, 
              height: 24, 
              bgcolor: canvasOptions.fillColor,
              border: '1px solid #ddd',
              borderRadius: '4px',
              mr: 1
            }} 
          />
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            {canvasOptions.fillColor}
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
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Stroke Width
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <Slider
              value={canvasOptions.strokeWidth}
              onChange={handleStrokeWidthChange}
              aria-labelledby="stroke-width-slider"
              min={1}
              max={20}
              step={1}
            />
          </Grid>
          <Grid item>
            <TextField 
              value={canvasOptions.strokeWidth}
              onChange={(e) => {
                const value = Math.min(Math.max(parseInt(e.target.value) || 1, 1), 20);
                onCanvasOptionsChange({ strokeWidth: value });
              }}
              inputProps={{
                min: 1,
                max: 20,
                type: 'number'
              }}
              size="small"
              sx={{ width: 70 }}
            />
          </Grid>
        </Grid>
      </Box>
      
      {/* Opacity */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Opacity
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <Slider
              value={canvasOptions.opacity}
              onChange={handleOpacityChange}
              aria-labelledby="opacity-slider"
              min={0}
              max={1}
              step={0.01}
            />
          </Grid>
          <Grid item>
            <TextField 
              value={Math.round(canvasOptions.opacity * 100)}
              onChange={(e) => {
                const value = Math.min(Math.max(parseInt(e.target.value) || 0, 0), 100) / 100;
                onCanvasOptionsChange({ opacity: value });
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
    </Paper>
  );
};

export default ShapeControls; 