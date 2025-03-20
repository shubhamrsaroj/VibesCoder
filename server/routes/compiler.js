const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');

// Compile and run code
router.post('/run', auth, async (req, res) => {
  try {
    const { code, language } = req.body;
    
    // Create temporary directory for code execution
    const tempDir = path.join(__dirname, '../temp', `${req.user.id}_${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    
    let fileName, command, output;
    
    switch (language) {
      case 'javascript':
        fileName = 'code.js';
        fs.writeFileSync(path.join(tempDir, fileName), code);
        command = `cd ${tempDir} && node ${fileName}`;
        break;
      case 'python':
        fileName = 'code.py';
        fs.writeFileSync(path.join(tempDir, fileName), code);
        command = `cd ${tempDir} && python ${fileName}`;
        break;
      case 'html':
        // For HTML, just return the code to be rendered in iframe
        return res.json({
          success: true,
          data: {
            output: code,
            error: null
          }
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported language'
        });
    }
    
    // Execute code
    exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
      // Clean up temp directory
      fs.rmSync(tempDir, { recursive: true, force: true });
      
      if (error) {
        return res.json({
          success: true,
          data: {
            output: null,
            error: stderr || error.message
          }
        });
      }
      
      res.json({
        success: true,
        data: {
          output: stdout,
          error: stderr
        }
      });
    });
  } catch (error) {
    console.error('Compiler error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router; 