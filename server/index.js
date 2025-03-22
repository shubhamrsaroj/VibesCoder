const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const serverless = require('serverless-http');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: [
    'https://vibescoder.netlify.app',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const compilerRoutes = require('./routes/compiler');
const spotifyRoutes = require('./routes/spotify');
const aiRoutes = require('./routes/ai');
const componentRoutes = require('./routes/components');

// API Routes
app.use('/.netlify/functions/api', authRoutes);
app.use('/.netlify/functions/api', projectRoutes);
app.use('/.netlify/functions/api', compilerRoutes);
app.use('/.netlify/functions/api', spotifyRoutes);
app.use('/.netlify/functions/api', aiRoutes);
app.use('/.netlify/functions/api', componentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Export the serverless function
module.exports.handler = serverless(app);
