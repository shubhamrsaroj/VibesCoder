import React from 'react';
import { Popover, Box, Button, Typography } from '@mui/material';
import { SketchPicker } from 'react-color';

/**
 * ColorPicker component for DrawingBoard
 * Displays a color picker in a popover
 */
const ColorPicker = ({ 
  open, 
  anchorEl, 
  color, 
  onClose, 
  onColorChange, 
  onApply 
}) => {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="subtitle1">Select Color</Typography>
        
        <SketchPicker
          color={color}
          onChange={(color) => onColorChange(color.hex)}
          disableAlpha={false}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Button 
            variant="outlined" 
            color="inherit" 
            onClick={onClose}
            size="small"
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={onApply}
            size="small"
          >
            Apply
          </Button>
        </Box>
      </Box>
    </Popover>
  );
};

export default ColorPicker; 