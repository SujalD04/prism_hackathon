// server/routes/reports.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- In-memory reports store ---
const reportsStore = {}; 
// { reportId: { device, sessionId, predictive, vision, audio, createdAt } }

// --- Helper to add predictive/vision/audio data ---
function addSimulationData(sessionId, device, section, data) {
  // Find or create report for session/device
  let reportId = Object.keys(reportsStore).find(
    id => reportsStore[id].sessionId === sessionId && reportsStore[id].device === device
  );

  if (!reportId) {
    reportId = `${device}-${Date.now()}-${uuidv4()}`;
    reportsStore[reportId] = {
      device,
      sessionId,
      predictive: null,
      vision: null,
      audio: null,
      createdAt: new Date(),
    };
  }

  console.log('Adding data to report:', reportId, section, data, reportsStore[reportId].sessionId);

  reportsStore[reportId][section] = data;
  return reportId;
}

// --- Start new report ---
router.post('/start', (req, res) => {
  const { device, sessionId } = req.body;
  if (!device || !sessionId) return res.status(400).json({ error: 'Device and sessionId required' });

  const reportId = `${device}-${Date.now()}-${uuidv4()}`;
  reportsStore[reportId] = {
    device,
    sessionId,
    predictive: null,
    vision: null,
    audio: null,
    createdAt: new Date(),
  };


  res.json({ reportId });
});

// --- Add predictive data ---
router.post('/:reportId/predictive', (req, res) => {
  const { reportId } = req.params;
  const data = req.body;

  if (!reportsStore[reportId]) return res.status(404).json({ error: 'Report not found' });

  reportsStore[reportId].predictive = data;
  res.json({ message: 'Predictive data saved', report: reportsStore[reportId] });
});

// --- Add vision analysis ---
router.post('/:reportId/vision', upload.single('image'), (req, res) => {
  const { reportId } = req.params;
  if (!reportsStore[reportId]) return res.status(404).json({ error: 'Report not found' });
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

  const imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  reportsStore[reportId].vision = {
    analysis: req.body.analysis || 'No analysis provided',
    image: imageBase64,
  };

  res.json({ message: 'Vision data saved', report: reportsStore[reportId] });
});

// --- Add audio transcription ---
router.post('/:reportId/audio', upload.single('audio'), (req, res) => {
  const { reportId } = req.params;
  if (!reportsStore[reportId]) return res.status(404).json({ error: 'Report not found' });
  if (!req.file) return res.status(400).json({ error: 'No audio uploaded' });

  reportsStore[reportId].audio = {
    transcript: req.body.transcript || 'No transcript provided',
    filename: req.file.originalname,
  };

  res.json({ message: 'Audio data saved', report: reportsStore[reportId] });
});

// --- Fetch full report ---
router.get('/:reportId', (req, res) => {
  const { reportId } = req.params;
  const report = reportsStore[reportId];
  if (!report) return res.status(404).json({ error: 'Report not found' });

  res.json(report);
  console.log('Adding data to report:', reportsStore[reportId].predictive);
});


module.exports = { router, addSimulationData, reportsStore };
