const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const fetch = require('node-fetch');

// Initialize OpenAI client only if API key is available
let openai = null;
try {
  const OpenAI = require('openai');
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (error) {
  console.warn('OpenAI initialization failed:', error.message);
}

// Chat with Gemini AI
router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'Gemini API key not configured'
      });
    }

    // Format the last message only
    const lastMessage = messages[messages.length - 1];
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: lastMessage.content
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      throw new Error(`Failed to get response from Gemini: ${errorData}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from Gemini API');
    }

    res.json({
      success: true,
      data: {
        role: 'assistant',
        content: data.candidates[0].content.parts[0].text
      }
    });
  } catch (error) {
    console.error('Gemini AI error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'AI service error', 
      error: error.message 
    });
  }
});

// Generate code from drawing
router.post('/generate-code', auth, async (req, res) => {
  try {
    // Check if OpenAI is configured
    if (!openai) {
      return res.status(503).json({
        success: false,
        message: 'AI service not configured. Please add OPENAI_API_KEY to your environment variables.'
      });
    }
    
    const { drawingData, description } = req.body;
    
    // Prepare prompt for OpenAI
    const prompt = `Generate HTML and CSS code for a UI component based on this description: ${description}. The drawing represents: ${drawingData}`;
    
    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: prompt,
      max_tokens: 2000,
      temperature: 0.7,
    });
    
    res.json({
      success: true,
      data: response.choices[0].text.trim()
    });
  } catch (error) {
    console.error('AI error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'AI service error', 
      error: error.message 
    });
  }
});

// Explain code
router.post('/explain-code', auth, async (req, res) => {
  try {
    // Check if OpenAI is configured
    if (!openai) {
      return res.status(503).json({
        success: false,
        message: 'AI service not configured. Please add OPENAI_API_KEY to your environment variables.'
      });
    }
    
    const { code } = req.body;
    
    // Prepare prompt for OpenAI
    const prompt = `Explain the following code in simple terms:\n\n${code}`;
    
    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: prompt,
      max_tokens: 1000,
      temperature: 0.5,
    });
    
    res.json({
      success: true,
      data: response.choices[0].text.trim()
    });
  } catch (error) {
    console.error('AI error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'AI service error', 
      error: error.message 
    });
  }
});

module.exports = router; 