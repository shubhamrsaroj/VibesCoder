const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// Get all projects for current user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id }
      ]
    }).sort({ lastModified: -1 });
    
    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user is owner or collaborator
    if (project.owner.toString() !== req.user.id && 
        !project.collaborators.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this project'
      });
    }
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Create new project
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, type } = req.body;
    
    const project = new Project({
      name,
      description,
      type,
      owner: req.user.id
    });
    
    await project.save();
    
    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user is owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }
    
    const { name, description, type, progress } = req.body;
    
    project = await Project.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        description, 
        type, 
        progress,
        lastModified: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user is owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }
    
    await project.remove();
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Add code file to project
router.post('/:id/code', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user is owner or collaborator
    if (project.owner.toString() !== req.user.id && 
        !project.collaborators.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this project'
      });
    }
    
    const { name, content, language } = req.body;
    
    project.codeFiles.push({
      name,
      content,
      language,
      lastModified: Date.now()
    });
    
    project.lastModified = Date.now();
    await project.save();
    
    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Add drawing to project
router.post('/:id/drawing', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user is owner or collaborator
    if (project.owner.toString() !== req.user.id && 
        !project.collaborators.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this project'
      });
    }
    
    const { name, content } = req.body;
    
    project.drawings.push({
      name,
      content,
      lastModified: Date.now()
    });
    
    project.lastModified = Date.now();
    await project.save();
    
    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Update code file in project
router.put('/:id/code/:fileId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user is owner or collaborator
    if (project.owner.toString() !== req.user.id && 
        !project.collaborators.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this project'
      });
    }
    
    const { name, content, language } = req.body;
    
    // Find the file by id
    const fileIndex = project.codeFiles.findIndex(file => 
      file._id.toString() === req.params.fileId
    );
    
    if (fileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Code file not found'
      });
    }
    
    // Update the file
    project.codeFiles[fileIndex] = {
      ...project.codeFiles[fileIndex],
      name: name || project.codeFiles[fileIndex].name,
      content: content || project.codeFiles[fileIndex].content,
      language: language || project.codeFiles[fileIndex].language,
      lastModified: Date.now()
    };
    
    project.lastModified = Date.now();
    await project.save();
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Update drawing in project
router.put('/:id/drawing/:drawingId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user is owner or collaborator
    if (project.owner.toString() !== req.user.id && 
        !project.collaborators.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this project'
      });
    }
    
    const { name, content } = req.body;
    
    // Find the drawing by id
    const drawingIndex = project.drawings.findIndex(drawing => 
      drawing._id.toString() === req.params.drawingId
    );
    
    if (drawingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Drawing not found'
      });
    }
    
    // Update the drawing
    project.drawings[drawingIndex] = {
      ...project.drawings[drawingIndex],
      name: name || project.drawings[drawingIndex].name,
      content: content || project.drawings[drawingIndex].content,
      lastModified: Date.now()
    };
    
    project.lastModified = Date.now();
    await project.save();
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router; 