import React from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  Paper,
  Divider,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';

// Font family options
const fontFamilies = [
  'Arial, sans-serif',
  'Times New Roman, serif',
  'Courier New, monospace',
  'Georgia, serif',
  'Verdana, sans-serif',
  'Helvetica, sans-serif',
  'Impact, sans-serif',
  'Tahoma, sans-serif',
  'Trebuchet MS, sans-serif',
  'Comic Sans MS, cursive'
];

/**
 * TextControls component for DrawingBoard
 * Allows adjusting properties for text elements
 */
const TextControls = ({ 
  canvasOptions, 
  onCanvasOptionsChange,
  onColorPickerOpen
}) => {
  // Default text style if not present
  const textStyle = canvasOptions.textStyle || {
    fontFamily: 'Arial, sans-serif',
    fontSize: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'left',
    textDecoration: 'none'
  };
  
  // Handle font size change
  const handleFontSizeChange = (e) => {
    const fontSize = Math.min(Math.max(parseInt(e.target.value) || 12, 8), 72);
    onCanvasOptionsChange({ 
      textStyle: { 
        ...textStyle, 
        fontSize 
      } 
    });
  };
  
  // Handle font family change
  const handleFontFamilyChange = (e) => {
    onCanvasOptionsChange({ 
      textStyle: { 
        ...textStyle, 
        fontFamily: e.target.value 
      } 
    });
  };

  return (
    <Paper sx={{ p: 2, m: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" gutterBottom>
        Text Controls
      </Typography>
      
      <Divider />
      
      {/* Text Color */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Text Color
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
            onClick={(e) => onColorPickerOpen(e, 'text')}
          >
            <PaletteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      {/* Font Family */}
      <FormControl fullWidth size="small">
        <InputLabel id="font-family-label">Font Family</InputLabel>
        <Select
          labelId="font-family-label"
          value={textStyle.fontFamily}
          label="Font Family"
          onChange={handleFontFamilyChange}
        >
          {fontFamilies.map((font) => (
            <MenuItem key={font} value={font} style={{ fontFamily: font }}>
              {font.split(',')[0]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {/* Font Size */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Font Size
        </Typography>
        <TextField 
          value={textStyle.fontSize}
          onChange={handleFontSizeChange}
          inputProps={{
            min: 8,
            max: 72,
            type: 'number'
          }}
          size="small"
          fullWidth
        />
      </Box>
      
      {/* Text Alignment */}
      <FormControl fullWidth size="small">
        <InputLabel id="text-align-label">Text Align</InputLabel>
        <Select
          labelId="text-align-label"
          value={textStyle.textAlign}
          label="Text Align"
          onChange={(e) => onCanvasOptionsChange({ 
            textStyle: { 
              ...textStyle, 
              textAlign: e.target.value 
            } 
          })}
        >
          <MenuItem value="left">Left</MenuItem>
          <MenuItem value="center">Center</MenuItem>
          <MenuItem value="right">Right</MenuItem>
        </Select>
      </FormControl>
      
      {/* Font Style Controls */}
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <FormControl fullWidth size="small">
            <InputLabel id="font-weight-label">Weight</InputLabel>
            <Select
              labelId="font-weight-label"
              value={textStyle.fontWeight}
              label="Weight"
              onChange={(e) => onCanvasOptionsChange({ 
                textStyle: { 
                  ...textStyle, 
                  fontWeight: e.target.value 
                } 
              })}
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="bold">Bold</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth size="small">
            <InputLabel id="font-style-label">Style</InputLabel>
            <Select
              labelId="font-style-label"
              value={textStyle.fontStyle}
              label="Style"
              onChange={(e) => onCanvasOptionsChange({ 
                textStyle: { 
                  ...textStyle, 
                  fontStyle: e.target.value 
                } 
              })}
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="italic">Italic</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TextControls; 