const Project = require('../models/Project');

/**
 * Middleware to verify user has access to a specific file within a project
 * Only project owners or collaborators can access files
 */
module.exports = async (req, res, next) => {
  try {
    const { projectId, fileId } = req.params;
    
    if (!projectId || !fileId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID and File ID are required'
      });
    }
    
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user is owner or collaborator
    const isOwner = project.owner.toString() === req.user.id;
    const isCollaborator = project.collaborators.some(
      collaborator => collaborator.toString() === req.user.id
    );
    
    if (!isOwner && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access files in this project'
      });
    }
    
    // Find the file
    let file;
    
    if (req.url.includes('/code/')) {
      file = project.codeFiles.id(fileId);
    } else if (req.url.includes('/drawing/')) {
      file = project.drawings.id(fileId);
    }
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found in project'
      });
    }
    
    // Add project and file to request for use in route handlers
    req.project = project;
    req.file = file;
    
    next();
  } catch (error) {
    console.error('File auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in file authorization',
      error: error.message
    });
  }
}; 