import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  List, 
  ListItem, 
  ListItemText, 
  CircularProgress, 
  Typography, 
  Box, 
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { getUserProjects, createProject } from '../../services/projectService';
import { useAuth } from '../../contexts/AuthContext';

const ProjectSelector = ({ 
  open, 
  onClose, 
  onSelectProject, 
  onCreateProject, 
  title = "Save to Project",
  saveButtonText = "Save",
  includeNewProject = true
}) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [projectPrivacy, setProjectPrivacy] = useState(true); // true = private, false = public
  const [mode, setMode] = useState('select'); // 'select' or 'create'
  const { currentUser } = useAuth();

  useEffect(() => {
    if (open) {
      loadProjects();
    }
  }, [open]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');
      
      const projectsData = await getUserProjects();
      setProjects(projectsData || []);
      
      if (projectsData && projectsData.length > 0) {
        setSelectedProjectId(projectsData[0]._id);
      } else {
        // If no projects, switch to create mode
        setMode('create');
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setError('Failed to load projects: ' + error.message);
      // If error loading projects, switch to create mode
      setMode('create');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      if (!newProjectName.trim()) {
        setError('Project name is required');
        return;
      }

      setLoading(true);
      setError('');
      
      const project = await createProject({
        name: newProjectName,
        description: 'Created from VibeCoder',
        type: 'Other',
        isPrivate: projectPrivacy
      });
      
      if (onCreateProject) {
        onCreateProject(project);
      }
      
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Failed to create project: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = () => {
    if (!selectedProjectId) {
      setError('Please select a project');
      return;
    }

    const selectedProject = projects.find(p => p._id === selectedProjectId);
    if (onSelectProject) {
      onSelectProject(selectedProject);
    }
    onClose();
  };

  const handleSave = () => {
    if (mode === 'select') {
      handleSelectProject();
    } else {
      handleCreateProject();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {includeNewProject && (
              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="save-mode-label">Save to</InputLabel>
                  <Select
                    labelId="save-mode-label"
                    value={mode}
                    label="Save to"
                    onChange={(e) => setMode(e.target.value)}
                  >
                    <MenuItem value="select">Existing Project</MenuItem>
                    <MenuItem value="create">New Project</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}

            {mode === 'select' ? (
              projects.length > 0 ? (
                <Box>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="project-select-label">Project</InputLabel>
                    <Select
                      labelId="project-select-label"
                      value={selectedProjectId}
                      label="Project"
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                    >
                      {projects.map(project => (
                        <MenuItem key={project._id} value={project._id}>
                          {project.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  {selectedProjectId && (
                    <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                      <Typography variant="subtitle2">
                        Selected Project Details:
                      </Typography>
                      {projects.find(p => p._id === selectedProjectId) && (
                        <>
                          <Typography variant="body2">
                            Description: {projects.find(p => p._id === selectedProjectId).description || 'No description'}
                          </Typography>
                          <Typography variant="body2">
                            Last Modified: {new Date(projects.find(p => p._id === selectedProjectId).lastModified).toLocaleString()}
                          </Typography>
                        </>
                      )}
                    </Box>
                  )}
                </Box>
              ) : (
                <Typography>
                  No existing projects found. Create a new project.
                </Typography>
              )
            ) : (
              <TextField
                autoFocus
                margin="dense"
                label="New Project Name"
                fullWidth
                variant="outlined"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                error={error.includes('name')}
              />
            )}

            {mode === 'create' && (
              <FormControl fullWidth margin="normal">
                <InputLabel id="privacy-label">Project Privacy</InputLabel>
                <Select
                  labelId="privacy-label"
                  value={projectPrivacy}
                  label="Project Privacy"
                  onChange={(e) => setProjectPrivacy(e.target.value === 'true')}
                >
                  <MenuItem value={true}>Private (Only you can access)</MenuItem>
                  <MenuItem value={false}>Public (Anyone can access)</MenuItem>
                </Select>
              </FormControl>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          disabled={loading || (mode === 'select' && (!selectedProjectId || projects.length === 0)) || (mode === 'create' && !newProjectName.trim())}
        >
          {saveButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectSelector; 