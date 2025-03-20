const express = require('express');
const router = express.Router();
const Component = require('../models/Component');
const auth = require('../middleware/auth');

// Get all public components
router.get('/', async (req, res) => {
  try {
    const { category, framework, search } = req.query;
    
    // Build query
    const query = { isPublic: true };
    
    if (category) {
      query.category = category;
    }
    
    if (framework) {
      query.framework = framework;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    const components = await Component.find(query)
      .sort({ createdAt: -1 })
      .populate('creator', 'username avatar');
    
    res.json({
      success: true,
      count: components.length,
      data: components
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

// Get single component
router.get('/:id', async (req, res) => {
  try {
    const component = await Component.findById(req.params.id)
      .populate('creator', 'username avatar');
    
    if (!component) {
      return res.status(404).json({
        success: false,
        message: 'Component not found'
      });
    }
    
    // Check if component is private and user is not creator
    if (!component.isPublic && 
        (!req.user || component.creator._id.toString() !== req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this component'
      });
    }
    
    res.json({
      success: true,
      data: component
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

// Create new component
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, category, framework, code, preview, tags, isPublic } = req.body;
    
    const component = new Component({
      name,
      description,
      category,
      framework,
      code,
      preview,
      tags: tags || [],
      creator: req.user.id,
      isPublic: isPublic !== undefined ? isPublic : true
    });
    
    await component.save();
    
    res.status(201).json({
      success: true,
      data: component
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