const express = require('express');
const cors = require('cors');
const app = express();

// Enable pre-flight for all routes
app.options('*', cors());

app.use(cors({
  origin: [
    'https://peppy-snickerdoodle-ccc36f.netlify.app',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Express body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

module.exports = app;
