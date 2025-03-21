const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const projectAuth = require('../middleware/projectAuth');
const fileAuth = require('../middleware/fileAuth');

// Get all projects for current user
router.get('/', auth, async (req, res) => {
  try {
    // Find user's own projects (both private and public)
    const userProjects = await Project.find({
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id }
      ]
    }).sort({ lastModified: -1 });
    
    res.json({
      success: true,
      count: userProjects.length,
      data: userProjects
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
router.get('/:id', auth, projectAuth, async (req, res) => {
  try {    
    res.json({
      success: true,
      data: req.project
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
    const { name, description, type, isPrivate } = req.body;
    
    const project = new Project({
      name,
      description,
      type,
      isPrivate: isPrivate !== undefined ? isPrivate : true, // Private by default
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
router.put('/:id', auth, projectAuth, async (req, res) => {
  try {
    const { name, description, type, progress, isPrivate } = req.body;
    
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        description, 
        type, 
        progress,
        isPrivate,
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
router.delete('/:id', auth, projectAuth, async (req, res) => {
  try {
    await req.project.remove();
    
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
router.post('/:id/code', auth, projectAuth, async (req, res) => {
  try {
    const { name, content, language } = req.body;
    
    req.project.codeFiles.push({
      name,
      content,
      language,
      lastModified: Date.now()
    });
    
    req.project.lastModified = Date.now();
    await req.project.save();
    
    res.status(201).json({
      success: true,
      data: req.project
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
router.post('/:id/drawing', auth, projectAuth, async (req, res) => {
  try {
    const { name, content } = req.body;
    
    req.project.drawings.push({
      name,
      content,
      lastModified: Date.now()
    });
    
    req.project.lastModified = Date.now();
    await req.project.save();
    
    res.status(201).json({
      success: true,
      data: req.project
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
router.put('/:projectId/code/:fileId', auth, fileAuth, async (req, res) => {
  try {
    const { name, content, language } = req.body;
    
    // Update the file
    req.file.name = name || req.file.name;
    req.file.content = content || req.file.content;
    req.file.language = language || req.file.language;
    req.file.lastModified = Date.now();
    
    req.project.lastModified = Date.now();
    await req.project.save();
    
    res.json({
      success: true,
      data: req.project
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
router.put('/:projectId/drawing/:fileId', auth, fileAuth, async (req, res) => {
  try {
    const { name, content } = req.body;
    
    // Update the drawing
    req.file.name = name || req.file.name;
    req.file.content = content || req.file.content;
    req.file.lastModified = Date.now();
    
    req.project.lastModified = Date.now();
    await req.project.save();
    
    res.json({
      success: true,
      data: req.project
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

// Delete code file from project
router.delete('/:projectId/code/:fileId', auth, fileAuth, async (req, res) => {
  try {
    req.project.codeFiles.id(req.params.fileId).remove();
    req.project.lastModified = Date.now();
    
    await req.project.save();
    
    res.json({
      success: true,
      data: req.project
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

// Delete drawing from project
router.delete('/:projectId/drawing/:fileId', auth, fileAuth, async (req, res) => {
  try {
    req.project.drawings.id(req.params.fileId).remove();
    req.project.lastModified = Date.now();
    
    await req.project.save();
    
    res.json({
      success: true,
      data: req.project
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

// Check if user has access to project
router.get('/:id/access', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.json({
        success: true,
        hasAccess: false,
        message: 'Project not found'
      });
    }
    
    // Check if user is owner or collaborator
    const hasAccess = 
      project.owner.toString() === req.user.id || 
      project.collaborators.includes(req.user.id) || 
      (!project.isPrivate); // Public projects are accessible to everyone
    
    res.json({
      success: true,
      hasAccess,
      isOwner: project.owner.toString() === req.user.id
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