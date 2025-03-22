const express = require('express');
const cors = require('cors');
const app = express();

// Enable pre-flight for all routes
app.options('*', cors());

app.use(cors({
  origin: [
    'https://your-netlify-app-name.netlify.app',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Express body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

module.exports = app;
