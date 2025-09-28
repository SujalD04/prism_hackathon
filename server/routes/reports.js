// server/routes/reports.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const ReportModel = require('../models/Report');

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

// PUT /api/reports/:reportId/update (in-memory version)
router.put('/:reportId/update', (req, res) => {
  const { reportId } = req.params;
  const updates = req.body;

  const report = reportsStore[reportId];
  if (!report) return res.status(404).json({ error: 'Report not found' });

  // Visual analysis
  if (updates.visualAnalysis) {
    report.vision = report.vision || {};
    report.vision.analysis = updates.visualAnalysis;
  }

  // Audio transcript
  if (updates.audioTranscript) {
    report.audio = report.audio || {};
    report.audio.transcript = updates.audioTranscript;
  }

  // Predictive data
  if (updates.predictive) {
    report.predictive = updates.predictive;
  }

  res.json({ success: true, report });
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

  // Map stored sections into a unified structure
  const normalizedReport = {
    _id: reportId,
    device: report.device,
    createdAt: report.createdAt,
    finalStatus: report.predictive?.final_status_text || 'Normal',
    rootCause: report.predictive?.trigger || null,
    summary: report.predictive?.ai_summary || null,
    evidence: {
      logAnalysis: report.predictive?.verdict_text || null,
      visualAnalysis: report.vision?.analysis || null,
      audioTranscript: report.audio?.transcript || null,
    },
  };

  res.json(normalizedReport);
});

// server/routes/reports.js
const Report = require('../models/Report'); // Mongoose model

async function saveReportToDB(report) {
  if (!report) return;
  const existing = await Report.findOne({ sessionId: report.sessionId });
  if (existing) {
    existing.device = report.device;
    existing.predictive = report.predictive;
    existing.vision = report.vision;
    existing.audio = report.audio;
    existing.updatedAt = new Date();
    await existing.save();
  } else {
    await Report.create({
      sessionId: report.sessionId,
      device: report.device,
      predictive: report.predictive,
      vision: report.vision,
      audio: report.audio,
      createdAt: report.createdAt || new Date(),
      updatedAt: new Date(),
    });
  }
}

module.exports = { router, addSimulationData, reportsStore, saveReportToDB };
