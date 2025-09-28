// server/routes/diagnose.js
const express = require('express');
const router = express.Router();
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * POST /api/diagnose/summarize
 * body: { device: string, root_cause: string }
 * Returns a short user-friendly explanation / fix.
 */
router.post('/summarize', async (req, res) => {
  const { device, root_cause } = req.body;
  if (!device || !root_cause) {
    return res.status(400).json({ error: 'Device and root_cause are required.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `My ${device} is showing a critical error related to '${root_cause}'. Provide a short, user-friendly, one-sentence troubleshooting step to fix this.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    res.json({ summary });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({
      summary: `Detected issue with '${root_cause}'. Try restarting your ${device} or checking the component.`,
    });
  }
});

// Placeholder routes for completeness
router.post('/visual', (req, res) => res.json({ analysis: 'Visual analysis endpoint placeholder.' }));
router.post('/audio', (req, res) => res.json({ transcript: 'Audio transcript endpoint placeholder.' }));

module.exports = router;
