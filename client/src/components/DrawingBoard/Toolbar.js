import React, { useState } from 'react';
import { 
  Paper, 
  IconButton, 
  Box, 
  Tooltip, 
  Typography,
  Divider,
  ButtonBase,
  Button
} from '@mui/material';

// Import icons
import CropSquareIcon from '@mui/icons-material/CropSquare';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import CreateIcon from '@mui/icons-material/Create';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import PanToolIcon from '@mui/icons-material/PanTool';
import ImageIcon from '@mui/icons-material/Image';
import CodeIcon from '@mui/icons-material/Code';
import WidgetsIcon from '@mui/icons-material/Widgets';
import DeleteIcon from '@mui/icons-material/Delete';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import SaveIcon from '@mui/icons-material/Save';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

/**
 * Toolbar component for the DrawingBoard
 * Contains all the tools for drawing, editing and managing the canvas
 */
const Toolbar = ({ 
  tool = 'select',
  canvasOptions = {},
  onToolChange,
  onStrokeColorChange,
  onFillColorChange,
  onStrokeWidthChange,
  onBackgroundColorChange,
  onClearCanvas,
  onZoomChange,
  onUndo,
  onRedo,
  onGenerateCode,
  onSave,
  renderSaveButton,
  sx = {}
}) => {
  // State for color picker
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [colorPickerType, setColorPickerType] = useState('stroke');
  
  // Handle color picker open
  const handleColorPickerOpen = (type) => {
    setColorPickerType(type);
    
    // Parent component will handle the actual opening
    if (type === 'background' && onBackgroundColorChange) {
      // Trigger color picker in parent component
      const event = { currentTarget: document.activeElement };
      if (onBackgroundColorChange) {
        // Just pass the event, the parent component will handle this
        onBackgroundColorChange(event, 'background');
      }
    }
  };
  
  // Handle color picker close
  const handleColorPickerClose = () => {
    // This function will be handled by the parent component
  };
  
  // Handle zoom change
  const handleZoomChange = (direction) => {
    if (onZoomChange) {
      onZoomChange(direction);
    }
  };
  
  // Check if a tool is active
  const isActive = (toolName) => tool === toolName;
  
  // Style for tool buttons
  const toolButtonStyle = (active) => ({
    bgcolor: active ? 'primary.main' : 'rgba(80,80,80,0.8)',
    color: active ? 'white' : 'text.primary',
    borderRadius: '6px',
    padding: '6px',
    transition: 'all 0.2s ease',
    '&:hover': {
      bgcolor: active ? 'primary.dark' : 'rgba(120, 120, 120, 0.9)',
      transform: 'translateY(-2px)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }
  });

  // Add background color picker to the canvas tools section
  const renderCanvasTools = () => {
    return (
      <Box sx={{ p: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Canvas</Typography>
        
        {/* Background Color */}
        <ButtonBase
          onClick={() => handleColorPickerOpen('background')}
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            mb: 1,
            cursor: 'pointer',
            width: '100%',
            justifyContent: 'space-between',
            p: 0.5
          }}
        >
          <Typography variant="body2">Background Color</Typography>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '4px',
              bgcolor: canvasOptions.canvasColor || '#FFFFFF',
              border: '1px solid rgba(0, 0, 0, 0.12)'
            }}
          />
        </ButtonBase>
        
        {/* Zoom Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
          <Typography variant="body2">Zoom:</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton size="small" onClick={() => handleZoomChange('-')}>
              <RemoveIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" sx={{ mx: 1 }}>
              {Math.round(canvasOptions.zoom * 100) || 100}%
            </Typography>
            <IconButton size="small" onClick={() => handleZoomChange('+')}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        
        {/* Clear Canvas */}
        <Button 
          variant="outlined" 
          color="error" 
          startIcon={<DeleteOutlineIcon />}
          onClick={onClearCanvas}
          fullWidth
          size="small"
          sx={{ mt: 2 }}
        >
          Clear Canvas
        </Button>
      </Box>
    );
  };

  // Add the color picker cases for background color
  const handleColorChange = (color) => {
    setSelectedColor(color.hex);
    
    // Apply the color change based on what we're editing
    switch (colorPickerType) {
      case 'stroke':
        if (onStrokeColorChange) onStrokeColorChange(color.hex);
        break;
      case 'fill':
        if (onFillColorChange) onFillColorChange(color.hex);
        break;
      case 'background':
        if (onBackgroundColorChange) onBackgroundColorChange(color.hex);
        break;
      default:
        break;
    }
    
    handleColorPickerClose();
  };

  // Add save button to the toolbar actions
  const renderToolbarActions = () => {
    return (
      <Box sx={{ display: 'flex', p: 0.5 }}>
        {renderSaveButton && renderSaveButton()}
        {/* Other toolbar actions */}
      </Box>
    );
  };

  // Add click handlers for main tools
  const handleToolClick = (newTool) => {
    if (onToolChange) {
      onToolChange(newTool);
    }
    closeAllMenus();
  };

  // Render tool buttons with proper active state
  const renderToolButton = (toolName, icon, tooltip) => {
    return (
      <Tooltip title={tooltip || toolName}>
        <IconButton
          color={tool === toolName ? 'primary' : 'default'}
          onClick={() => handleToolClick(toolName)}
          size="small"
          sx={{ 
            m: 0.5, 
            color: tool === toolName ? '#ffffff' : 'rgba(255,255,255,0.7)',
            bgcolor: tool === toolName ? 'primary.main' : 'transparent',
            '&:hover': {
              bgcolor: tool === toolName ? 'primary.dark' : 'rgba(255,255,255,0.1)'
            }
          }}
        >
          {icon}
        </IconButton>
      </Tooltip>
    );
  };

  // Update the top section of the toolbar to include the save button
  return (
    <Box 
      sx={{ 
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        width: '100%',
        height: '48px',
        px: 2,
        ...sx
      }}
    >
      {/* Drawing Tools Group */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" color="white" sx={{ mr: 1 }}>Draw:</Typography>
        {renderToolButton('select', <PanToolIcon fontSize="small" />, 'Select Tool')}
        
        {renderToolButton('rectangle', <CropSquareIcon fontSize="small" />, 'Rectangle')}
        
        {renderToolButton('circle', <RadioButtonUncheckedIcon fontSize="small" />, 'Circle')}
        
        {renderToolButton('line', <LinearScaleIcon fontSize="small" />, 'Line')}
        
        {renderToolButton('pencil', <CreateIcon fontSize="small" />, 'Pencil')}
      </Box>

      <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />

      {/* Content Tools Group */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" color="white" sx={{ mr: 1 }}>Add:</Typography>
        {renderToolButton('text', <TextFieldsIcon fontSize="small" />, 'Text')}
        
        {renderToolButton('image', <ImageIcon fontSize="small" />, 'Image')}
        
        {renderToolButton('component', <WidgetsIcon fontSize="small" />, 'Component')}
      </Box>

      <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />

      {/* Actions Group */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {renderToolButton('undo', <UndoIcon fontSize="small" />, 'Undo')}
        
        {renderToolButton('redo', <RedoIcon fontSize="small" />, 'Redo')}
        
        {renderToolButton('clearCanvas', <DeleteIcon fontSize="small" />, 'Clear Canvas')}
      </Box>

      <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />

      {/* Zoom Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {renderToolButton('zoomOut', <ZoomOutIcon fontSize="small" />, 'Zoom Out')}
        
        <Typography variant="caption" sx={{ color: 'white', minWidth: '40px', textAlign: 'center' }}>
          {Math.round(canvasOptions.zoom * 100)}%
        </Typography>
        
        {renderToolButton('zoomIn', <ZoomInIcon fontSize="small" />, 'Zoom In')}
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      {/* Right-side Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {renderToolButton('generateCode', <CodeIcon fontSize="small" />, 'Generate Code')}
        
        {renderToolButton('save', <SaveIcon fontSize="small" />, 'Save Drawing')}
      </Box>
    </Box>
  );
};

export default Toolbar;