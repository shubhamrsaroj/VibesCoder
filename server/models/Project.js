const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['React', 'Node.js', 'Full Stack', 'HTML/CSS', 'Other'],
    default: 'Other'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  codeFiles: [{
    name: String,
    content: String,
    language: String,
    lastModified: Date
  }],
  drawings: [{
    name: String,
    content: String,
    lastModified: Date
  }],
  components: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Component'
  }],
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Project', ProjectSchema); 