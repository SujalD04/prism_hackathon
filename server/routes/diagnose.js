// server/routes/diagnose.js
const express = require('express');
const router = express.Router();
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// [TIER 2] Gemini API endpoint
router.post('/summarize', async (req, res) => {
  const { device, root_cause } = req.body;
  if (!device || !root_cause) {
    return res.status(400).json({ error: 'Device and root_cause are required.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `My Samsung ${device} is showing a critical error related to high '${root_cause}'. Generate one simple, user-friendly, one-sentence troubleshooting step to fix this.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();
    
    res.json({ summary });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ summary: `High activity detected in ${root_cause}. Consider restarting the device.` });
  }
});

// Other placeholder routes
router.post('/visual', (req, res) => res.json({ analysis: 'Visual analysis endpoint placeholder.' }));
router.post('/audio', (req, res) => res.json({ transcript: 'Audio transcript endpoint placeholder.' }));

module.exports = router;