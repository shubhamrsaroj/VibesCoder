import React, { useState, useEffect } from 'react';
import { Button, Tooltip, Typography, Box } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ProjectSelector from './ProjectSelector/ProjectSelector';
import { useAuth } from '../contexts/AuthContext';

const SaveToProjectButton = ({ 
  onSave, 
  buttonText = "Save to Project",
  tooltipText = "Save to Project",
  dialogTitle = "Save to Project",
  saveButtonText = "Save",
  variant = "contained",
  color = "primary",
  size = "medium",
  sx = {}
}) => {
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const { currentUser } = useAuth();

  const handleSaveToProject = async (project) => {
    try {
      if (!currentUser) {
        throw new Error("You must be logged in to save projects");
      }
      
      setSaveStatus('Saving...');
      
      // Call the parent's onSave function with the selected project
      await onSave(project);
      
      setSaveStatus('Saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving:', error);
      setSaveStatus('Error: ' + error.message);
      setTimeout(() => setSaveStatus(''), 5000);
    }
  };

  return (
    <>
      <Tooltip title={currentUser ? tooltipText : "Please log in to save projects"}>
        <span>
          <Button
            variant={variant}
            color={color}
            size={size}
            startIcon={<SaveIcon />}
            onClick={() => setShowProjectSelector(true)}
            sx={sx}
            disabled={!currentUser}
          >
            {buttonText}
          </Button>
        </span>
      </Tooltip>
      
      {currentUser && (
        <ProjectSelector
          open={showProjectSelector}
          onClose={() => setShowProjectSelector(false)}
          onSelectProject={handleSaveToProject}
          onCreateProject={handleSaveToProject}
          title={dialogTitle}
          saveButtonText={saveButtonText}
        />
      )}
      
      {saveStatus && (
        <Typography
          variant="body2"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            bgcolor: 'background.paper',
            color: saveStatus.includes('Error') ? 'error.main' : 'primary.main',
            p: 1,
            borderRadius: 1,
            boxShadow: 1,
            zIndex: 9999
          }}
        >
          {saveStatus}
        </Typography>
      )}
    </>
  );
};

export default SaveToProjectButton; 