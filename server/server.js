const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');
const { addSimulationData } = require('./routes/reports');

connectDB();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

app.use('/api/users', require('./routes/users'));
app.use('/api/diagnose', require('./routes/diagnose'));
app.use('/api/reports', require('./routes/reports').router);

const DEVICE_TRIGGERS = {
  smartphone: { critical_cpu: 0.95, warning_battery: 0.65 },
  smartwatch: { critical_cpu: 0.9, low_battery: 0.7 },
  smartfridge: { high_temp: 0.9, door_left_open: 0.7 },
};

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  let pythonProcess = null;

  const safeKill = () => {
    if (pythonProcess && !pythonProcess.killed) {
      console.log('🔴 Killing Python process...');
      pythonProcess.kill();
      pythonProcess = null;
    }
  };

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    const { reportId, device } = data; // ✅ use reportId consistently

    // Auto-capture predictive trigger data
    if (data.type === 'trigger' && data.event) {
      const reportData = {
        timestamp: new Date().toLocaleTimeString(),
        trigger: data.event,
        final_status_text: data.final_status_text || 'Manual Trigger',
        final_status_style: data.final_status_style || 'normal',
        probability: data.probability || 0.5,
        is_anomaly_predicted: data.is_anomaly_predicted || false,
        first_anomaly_time: data.first_anomaly_time || null,
        forecast: data.forecast || [],
      };

      addSimulationData(reportId, device, 'predictive', reportData); // ✅ now tied to reportId

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(reportData));
      }
    }

    // Start Python simulation
    if (data.type === 'start' && device) {
      safeKill();
      console.log(`Starting simulation for device: ${device}, reportId: ${reportId}`);

      const pythonPath = path.resolve(
        __dirname,
        '..',
        '.venv',
        process.platform === 'win32' ? 'Scripts' : 'bin',
        process.platform === 'win32' ? 'python.exe' : 'python'
      );

      const scriptPath = path.resolve(__dirname, 'ml', 'simulation_engine.py');
      pythonProcess = spawn(pythonPath, ['-u', scriptPath, device]);

      pythonProcess.stdout.on('data', (chunk) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(chunk.toString());
        }
      });

      pythonProcess.stderr.on('data', (chunk) => {
        const msg = chunk.toString();
        console.error('Python error:', msg);
        if (msg.toLowerCase().includes('error') && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ error: msg }));
        }
      });

      pythonProcess.on('close', (code, signal) => {
        console.log(`Python process exited. code=${code} signal=${signal}`);
        pythonProcess = null;
      });
    }

    if (data.type === 'stop') {
      safeKill();
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    safeKill();
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
