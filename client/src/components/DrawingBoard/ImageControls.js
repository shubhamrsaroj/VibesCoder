import React, { useRef } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

/**
 * ImageControls component for DrawingBoard
 * Allows uploading images and controlling image properties
 */
const ImageControls = ({ 
  onUploadImage,
  selectedImage,
  onUpdateImageProperty
}) => {
  const fileInputRef = useRef(null);

  // Handle upload button click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onUploadImage(file);
    } else {
      alert('Please select a valid image file');
    }
  };

  return (
    <Paper sx={{ p: 2, m: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" gutterBottom>
        Image Controls
      </Typography>
      
      <Divider />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          onClick={handleUploadClick}
          fullWidth
          sx={{ justifyContent: 'flex-start' }}
        >
          Upload Image
        </Button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
        />
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Supported formats: JPG, PNG, GIF, SVG
        </Typography>
      </Box>
      
      {/* Image properties (only shown when an image is selected) */}
      {selectedImage && (
        <>
          <Divider sx={{ my: 1 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Image Properties
          </Typography>
          
          {/* Object Fit */}
          <FormControl fullWidth size="small">
            <InputLabel id="object-fit-label">Object Fit</InputLabel>
            <Select
              labelId="object-fit-label"
              value={selectedImage.objectFit || 'cover'}
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
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Opacity
            </Typography>
            <Slider
              value={selectedImage.opacity || 1}
              onChange={(e, newValue) => onUpdateImageProperty('opacity', newValue)}
              aria-labelledby="image-opacity-slider"
              min={0}
              max={1}
              step={0.01}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
            />
          </Box>
        </>
      )}
      
      {/* Placeholder when no image is selected */}
      {!selectedImage && (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
            bgcolor: 'action.hover',
            borderRadius: 1
          }}
        >
          <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            No image selected
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select an image on the canvas to edit properties
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ImageControls; 