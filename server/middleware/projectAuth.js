const Project = require('../models/Project');

/**
 * Middleware to verify user has access to the requested project
 * Only project owners or collaborators can access a project
 */
module.exports = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId;
    
    if (!projectId) {
      return next();
    }
    
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if current user is the owner or a collaborator
    const isOwner = project.owner.toString() === req.user.id;
    const isCollaborator = project.collaborators.some(
      collaborator => collaborator.toString() === req.user.id
    );
    
    if (!isOwner && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this project'
      });
    }
    
    // Add the project to the request for potential future use
    req.project = project;
    next();
  } catch (error) {
    console.error('Project auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in project authorization',
      error: error.message
    });
  }
}; 