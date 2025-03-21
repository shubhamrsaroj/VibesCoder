import api from './api';
import { useAuth } from '../contexts/AuthContext';

// Remove unused API_URL and authFetch - we'll consistently use the api instance
// that already includes authentication headers

/**
 * Get all projects for the current user
 * @returns {Promise<Array>} Array of projects
 */
export const getUserProjects = async () => {
  try {
    // This will automatically include the auth token
    const response = await api.get('/projects');
    console.log('Fetched user projects:', response.data.data.length);
    // The backend should already filter projects by the authenticated user
    // based on the JWT token sent in the request
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user projects:', error);
    if (error.response && error.response.status === 401) {
      // Authentication error is already handled by api.js interceptor
      return []; // Return empty array rather than throwing
    }
    throw error;
  }
};

/**
 * Get a single project by ID
 * @param {string} projectId - The project ID
 * @returns {Promise<Object>} The project data
 */
export const getProject = async (projectId) => {
  if (!projectId) {
    console.error('Invalid project ID provided to getProject');
    throw new Error('Invalid project ID');
  }
  
  try {
    // First try to get the project data
    const response = await api.get(`/projects/${projectId}`);
    
    // Verify user has access to this project
    if (!response.data.data) {
      throw new Error('Project not found or you don\'t have permission to access it');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching project:', error);
    
    // If we get a 404, provide a clearer error message
    if (error.response && error.response.status === 404) {
      throw new Error(`Project not found: it may have been deleted or you don't have access to it.`);
    }
    
    // If we get a 403 Forbidden or 401 Unauthorized
    if (error.response && (error.response.status === 403 || error.response.status === 401)) {
      try {
        // Check if token is valid or expired
        const authCheck = await api.get('/auth/check');
        
        if (!authCheck.data.isAuthenticated) {
          throw new Error('Your session has expired. Please log in again.');
        }
        
        // If authenticated but no access, throw permission error
        throw new Error(`You do not have permission to access this project (ID: ${projectId})`);
      } catch (innerError) {
        // Propagate the innerError if it has a message property
        if (innerError.message) {
          throw new Error(innerError.message);
        }
        
        // Default error if no specific message is available
        throw new Error('Authentication error: Unable to access this project');
      }
    }
    
    // For other errors, just propagate the original error
    throw error;
  }
};

/**
 * Create a new project
 * @param {Object} projectData - The project data to create
 * @returns {Promise<Object>} The created project
 */
export const createProject = async (projectData) => {
  try {
    // Ensure user ID is associated with the project through the server
    const response = await api.post('/projects', projectData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

/**
 * Update a project
 * @param {string} projectId - The project ID
 * @param {Object} projectData - The updated project data
 * @returns {Promise<Object>} The updated project
 */
export const updateProject = async (projectId, projectData) => {
  try {
    // First verify user has access to the project
    await getProject(projectId);
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

/**
 * Save a code file to a project
 * @param {string} projectId - The project ID
 * @param {Object} fileData - The file data
 * @returns {Promise<Object>} The updated project
 */
export const saveCodeFile = async (projectId, fileData) => {
  try {
    // First verify user has access to the project
    await getProject(projectId);
    const response = await api.post(`/projects/${projectId}/code`, fileData);
    return response.data.data;
  } catch (error) {
    console.error('Error saving code file:', error);
    throw error;
  }
};

/**
 * Update an existing code file
 * @param {string} projectId - The project ID
 * @param {string} fileId - The file ID
 * @param {Object} fileData - The file data
 * @returns {Promise<Object>} The updated project
 */
export const updateCodeFile = async (projectId, fileId, fileData) => {
  try {
    // First verify user has access to the project
    await getProject(projectId);
    const response = await api.put(`/projects/${projectId}/files/${fileId}`, fileData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating code file:', error);
    throw error;
  }
};

/**
 * Get all code files for a project
 * @param {string} projectId - The project ID
 * @returns {Promise<Array>} Array of code files
 */
export const getProjectFiles = async (projectId) => {
  try {
    // First verify user has access to the project
    await getProject(projectId);
    const response = await api.get(`/projects/${projectId}/files`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching project files:', error);
    throw error;
  }
};

/**
 * Delete a project
 * @param {string} projectId - The project ID
 * @returns {Promise<Object>} Response data
 */
export const deleteProject = async (projectId) => {
  try {
    // First verify user has access to the project
    await getProject(projectId);
    const response = await api.delete(`/projects/${projectId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

/**
 * Save a drawing to a project
 * @param {string} projectId - The project ID
 * @param {Object} drawingData - The drawing data
 * @returns {Promise<Object>} The updated project
 */
export const saveDrawing = async (projectId, drawingData) => {
  try {
    // First verify user has access to the project
    await getProject(projectId);
    const response = await api.post(`/projects/${projectId}/drawing`, drawingData);
    return response.data.data;
  } catch (error) {
    console.error('Error saving drawing:', error);
    throw error;
  }
};

/**
 * Update an existing drawing
 * @param {string} projectId - The project ID
 * @param {string} drawingId - The drawing ID
 * @param {Object} drawingData - The drawing data
 * @returns {Promise<Object>} The updated project
 */
export const updateDrawing = async (projectId, drawingId, drawingData) => {
  try {
    // First verify user has access to the project
    await getProject(projectId);
    const response = await api.put(`/projects/${projectId}/drawing/${drawingId}`, drawingData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating drawing:', error);
    throw error;
  }
};

/**
 * Get project state (drawing or code) by ID
 * For security, user authentication is verified on the server-side
 * 
 * @param {string} projectId - The project ID
 * @param {string} type - The type of data ('drawing' or 'code')
 * @returns {Promise<Object>} The project state
 */
export const getProjectState = async (projectId, type) => {
  try {
    // First verify user has access to this project
    const hasAccess = await checkProjectAccess(projectId);
    if (!hasAccess) {
      throw new Error('You do not have permission to access this project');
    }
    
    // Now get the project state
    const response = await api.get(`/projects/${projectId}/${type}`);
    
    if (!response.data || !response.data.data) {
      throw new Error(`No ${type} data found for this project`);
    }
    
    return response.data.data;
  } catch (error) {
    console.error(`Error getting project ${type}:`, error);
    throw error;
  }
};

/**
 * Check if a user has access to a project
 * @param {string} projectId - The project ID
 * @returns {Promise<boolean>} Whether the user has access
 */
export const checkProjectAccess = async (projectId) => {
  if (!projectId) {
    console.error('Invalid project ID provided to checkProjectAccess');
    return false;
  }
  
  try {
    const response = await api.get(`/projects/${projectId}/access`);
    
    if (response.data && response.data.success) {
      // Log the access information for debugging
      console.log(`Project ${projectId} access check: `, {
        hasAccess: response.data.hasAccess,
        isOwner: response.data.isOwner
      });
      
      return response.data.hasAccess;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking project access:', error);
    
    // Handle specific error responses
    if (error.response) {
      const status = error.response.status;
      
      if (status === 401) {
        console.warn('User not authenticated when checking project access');
        // Redirect to login if not on login page
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
          if (window.confirm('Your session has expired. Please log in again.')) {
            window.location.href = '/login';
          }
        }
      } else if (status === 403) {
        console.warn(`User not authorized to access project ${projectId}`);
      } else if (status === 404) {
        console.warn(`Project ${projectId} not found`);
        // If on a project page, redirect to dashboard
        const currentPath = window.location.pathname;
        if ((currentPath.includes('/draw/') || currentPath.includes('/code/')) 
            && currentPath.includes(projectId)) {
          alert('This project does not exist or has been deleted.');
          window.location.href = '/';
        }
      }
    }
    
    return false;
  }
};

/**
 * Clears all project data from localStorage to prevent data leakage
 * Call this when switching projects or logging out
 */
export const clearLocalProjectData = () => {
  try {
    // Clear canvas data
    localStorage.removeItem('canvasData');
    localStorage.removeItem('canvasThumb');
    localStorage.removeItem('vibecoderDrawingState');
    localStorage.removeItem('vibecoderSaveStatus');
    localStorage.removeItem('vibecoderSaveStatusTimestamp');
    
    console.log('Cleared local project data from localStorage');
  } catch (error) {
    console.error('Error clearing local project data:', error);
  }
};

/**
 * Gets or saves project data with proper user access verification
 * This function should be used instead of localStorage for project data
 * 
 * @param {Object} options - Options object
 * @param {string} options.projectId - Project ID (if saving to existing project)
 * @param {string} options.dataType - Type of data ('drawing' or 'code')
 * @param {Object} options.data - Data to save (if saving)
 * @param {boolean} options.isGet - Whether this is a get operation
 * @returns {Promise<Object>} Result of the operation
 */
export const getOrSaveProjectData = async (options) => {
  const { projectId, dataType, data, isGet = false } = options;
  
  // If no projectId, the user isn't working with a saved project
  if (!projectId) {
    console.log('No project ID provided, cannot save/get project data');
    throw new Error('No project ID provided');
  }
  
  try {
    // Clear any localStorage project data to prevent confusion
    clearLocalProjectData();
    
    // First check if user has access to this project
    const hasAccess = await checkProjectAccess(projectId);
    if (!hasAccess) {
      throw new Error('You do not have access to this project');
    }
    
    if (isGet) {
      // Get project data
      return await getProjectState(projectId, dataType);
    } else {
      // Save project data
      if (dataType === 'drawing') {
        return await saveDrawing(projectId, data);
      } else if (dataType === 'code') {
        return await saveCodeFile(projectId, data);
      } else {
        throw new Error(`Invalid data type: ${dataType}`);
      }
    }
  } catch (error) {
    console.error('Error in getOrSaveProjectData:', error);
    throw error;
  }
};