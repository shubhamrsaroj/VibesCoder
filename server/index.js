const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const serverless = require('serverless-http');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: [
      'https://vibescoder.netlify.app',
      'http://localhost:3000'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(morgan('dev')); // Logging middleware
app.use(cookieParser()); // Cookie parsing middleware

// CORS configuration
app.use(cors({
  origin: [
    'https://vibescoder.netlify.app',
    'http://localhost:3000',
    'https://accounts.spotify.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'x-auth-token'],
  exposedHeaders: ['set-cookie']
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const compilerRoutes = require('./routes/compiler');
const spotifyRoutes = require('./routes/spotify');
const aiRoutes = require('./routes/ai');
const componentRoutes = require('./routes/components');

// API Routes with proper prefixing
app.use('/.netlify/functions/api/auth', authRoutes);
app.use('/.netlify/functions/api/projects', projectRoutes);
app.use('/.netlify/functions/api/compiler', compilerRoutes);
app.use('/.netlify/functions/api/spotify', spotifyRoutes);
app.use('/.netlify/functions/api/ai', aiRoutes);
app.use('/.netlify/functions/api/components', componentRoutes);

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('join-project', (projectId) => {
    socket.join(projectId);
    console.log(`Client joined project: ${projectId}`);
  });
  
  socket.on('code-change', (data) => {
    socket.to(data.projectId).emit('code-update', data);
  });
  
  socket.on('drawing-update', (data) => {
    socket.to(data.projectId).emit('drawing-update', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Health check endpoint
app.get('/.netlify/functions/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    environment: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server error',
    error: process.env.NODE_ENV === 'production' ? {} : err,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the serverless function for Netlify
module.exports.handler = serverless(app);
