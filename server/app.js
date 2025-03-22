const express = require('express');
const cors = require('cors');
const app = express();

// Enable pre-flight requests
app.options('*', cors());

app.use(cors({
  origin: ['https://67de049ac274ec00082a92a5--peppy-snickerdoodle-ccc36f.netlify.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// ...existing code...

module.exports = app;
