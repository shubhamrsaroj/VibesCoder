const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: [
    'https://peppy-snickerdoodle-ccc36f.netlify.app',
    'https://67deb2b76b506032e2402b96--peppy-snickerdoodle-ccc36f.netlify.app',
    'https://vibescoder.onrender.com',
    'http://localhost:3000',
    'http://localhost:5000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'Cookie'],
  exposedHeaders: ['x-auth-token'],
  optionsSuccessStatus: 200
}));

// Enable pre-flight requests for all routes
app.options('*', cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      'https://peppy-snickerdoodle-ccc36f.netlify.app',
      'https://67deb2b76b506032e2402b96--peppy-snickerdoodle-ccc36f.netlify.app',
      'https://vibescoder.onrender.com',
      'http://localhost:3000',
      'http://localhost:5000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'Cookie']
  }
});

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const compilerRoutes = require('./routes/compiler');
const spotifyRoutes = require('./routes/spotify');
const aiRoutes = require('./routes/ai');
const componentRoutes = require('./routes/components');

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/compiler', compilerRoutes);
app.use('/api/spotify', spotifyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/components', componentRoutes);

// Socket.io for real-time collaboration
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
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
});

// Export app for testing purposes
module.exports = app;
