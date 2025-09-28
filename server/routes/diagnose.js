// server/routes/diagnose.js
const express = require('express');
const router = express.Router();
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const axios = require('axios');

// --- Multer setup for file uploads ---
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- Helper function for retrying Gemini API calls ---
async function retryGemini(model, promptParts, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(promptParts);
      return result.response.text();
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`Gemini API retry ${i + 1} failed, retrying in ${delay}ms...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

/**
 * POST /api/diagnose/summarize
 * body: { device: string, root_cause: string }
 * Returns a short user-friendly explanation / fix.
 */
router.post('/summarize', async (req, res) => {
  const { device, root_cause } = req.body;
  if (!device || !root_cause)
    return res.status(400).json({ error: 'Device and root_cause are required.' });

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `My ${device} is showing a critical error related to '${root_cause}'. Provide a short, user-friendly, one-sentence troubleshooting step to fix this.`;
    const summary = await retryGemini(model, prompt);

    res.json({ summary });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({
      summary: `Detected issue with '${root_cause}'. Try restarting your ${device} or checking the component.`,
    });
  }
});

/**
 * POST /api/diagnose/visual
 * body: FormData with deviceImage file
 * Returns a brief analysis of the uploaded image using Gemini Vision.
 */
router.post('/visual', upload.single('deviceImage'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file uploaded.' });

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      Identify the main object in the image.
      Analyze it for signs of physical damage (scratches, dents, cracks, tears, discoloration).
      Classify the overall damage severity as 'None', 'Minor', 'Moderate', or 'Severe'.
      Provide a brief justification for your classification.
    `;

    const imageBuffer = req.file.buffer.toString('base64');

    const textPart = { text: prompt };
    const imagePart = {
      inlineData: {
        data: imageBuffer,
        mimeType: req.file.mimetype,
      },
    };

    const analysis = await retryGemini(model, [textPart, imagePart]);

    res.json({ analysis });
  } catch (error) {
    console.error('Gemini Vision API error:', error);
    res.status(500).json({ analysis: "Could not analyze the image at this time." });
  }
});

/**
 * POST /api/diagnose/transcribe
 * body: FormData with audio file
 * Returns a transcription using Hugging Face Whisper.
 */
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No audio file uploaded.' });

  const WHISPER_API_URL = "https://api-inference.huggingface.co/models/openai/whisper-large-v3";
  const HUGGING_FACE_TOKEN = process.env.HUGGING_FACE_TOKEN;

  try {
    const response = await axios.post(
      WHISPER_API_URL,
      req.file.buffer, // raw audio
      {
        headers: {
          'Authorization': `Bearer ${HUGGING_FACE_TOKEN}`,
          'Content-Type': req.file.mimetype,
          'Accept': 'application/json'
        },
        responseType: 'json'
      }
    );

    res.json({ transcript: response.data.text });
  } catch (error) {
    console.error('Whisper API error:', error.response?.data || error.message);
    res.status(500).json({ transcript: "Sorry, I couldn't understand that. Please try again." });
  }
});

/**
 * POST /api/diagnose/chat
 * body: { message: string, history: array }
 * Returns a chat reply using Gemini Chat.
 */
router.post('/chat', async (req, res) => {
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required.' });

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const context = history?.map(msg => `${msg.sender}: ${msg.text}`).join('\n') || '';
    const prompt = `
      You are a friendly but very professional and helpful Samsung tech support agent named AURA.You always maintain a professional tone when speaking to customers and staff.
      Here is the conversation history:
      ${context}
      The user just said: "${message}".
      Respond helpfully. If the user describes a problem, ask clarifying questions.
    `;

    const reply = await retryGemini(model, prompt);
    res.json({ reply });
  } catch (error) {
    console.error('Gemini Chat API error:', error);
    res.status(500).json({ reply: "I'm having trouble connecting to my brain right now. Please try again." });
  }
});

module.exports = router;
