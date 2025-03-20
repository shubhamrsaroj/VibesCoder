const mongoose = require('mongoose');

const ComponentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Component name is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['UI', 'Layout', 'Form', 'Navigation', 'Feedback', 'Data Display', 'Other'],
    default: 'UI'
  },
  framework: {
    type: String,
    enum: ['React', 'Bootstrap', 'Material-UI', 'Tailwind', 'Other'],
    default: 'React'
  },
  code: {
    type: String,
    required: [true, 'Component code is required']
  },
  preview: {
    type: String,
    default: ''
  },
  tags: [{
    type: String
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Component', ComponentSchema); 