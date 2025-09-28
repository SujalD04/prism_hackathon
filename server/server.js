// server/server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');

connectDB();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

app.use('/api/users', require('./routes/users'));
app.use('/api/diagnose', require('./routes/diagnose'));
app.use('/api/reports', require('./routes/reports'));

const DEVICE_TRIGGERS = {
  smartphone: {
    critical_cpu: { feature: 'CPU Temperature', prob: 0.95, status: 'Critical' },
    warning_battery: { feature: 'Battery Drain', prob: 0.65, status: 'Warning' },
  },
  smartwatch: {
    critical_cpu: { feature: 'CPU Temperature', prob: 0.9, status: 'Critical' },
    low_battery: { feature: 'Battery Drain', prob: 0.7, status: 'Warning' },
  },
  smartfridge: {
    high_temp: { feature: 'Fridge Temperature', prob: 0.9, status: 'Critical' },
    door_left_open: { feature: 'Door Status', prob: 0.7, status: 'Warning' },
  },
};


// --- UPDATED WEBSOCKET LOGIC ---
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

    if (data.type === 'start' && data.device) {
      safeKill(); // kill old process if exists

      console.log(`Starting simulation for device: ${data.device}`);

      // ✅ Use Python inside .venv
      const pythonPath = path.resolve(
        __dirname,
        '..',
        '.venv',
        process.platform === 'win32' ? 'Scripts' : 'bin',
        process.platform === 'win32' ? 'python.exe' : 'python'
      );

      const scriptPath = path.resolve(__dirname, 'ml', 'simulation_engine.py');

      pythonProcess = spawn(pythonPath, ['-u', scriptPath, data.device]);

      pythonProcess.stdout.on('data', (chunk) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(chunk.toString());
        }
      });

      pythonProcess.stderr.on('data', (chunk) => {
        const msg = chunk.toString();
        if (msg.toLowerCase().includes('error')) {
          console.error(`Python script error: ${msg}`);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ error: msg }));
          }
        } else {
          console.warn(`Python script warning: ${msg}`);
        }
      });

      pythonProcess.on('close', (code, signal) => {
        console.log(`Python process exited. code=${code} signal=${signal}`);
        pythonProcess = null;
      });
    }

    if (data.type === 'stop') {
      console.log('🛑 Stop command received');
      safeKill();
    }

    if (data.type === 'trigger' && data.event) {
      console.log(`⚡ Trigger event: ${data.event}`);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            timestamp: new Date().toLocaleTimeString(),
            trigger: data.event,
            final_status_text:
              data.event === 'critical_cpu'
                ? 'Critical'
                : data.event === 'warning_battery'
                ? 'Warning'
                : 'Custom Trigger',
            final_status_style:
              data.event === 'critical_cpu'
                ? 'critical'
                : data.event === 'warning_battery'
                ? 'warning'
                : 'normal',
            probability:
              data.event === 'critical_cpu'
                ? 0.95
                : data.event === 'warning_battery'
                ? 0.65
                : 0.4,
            verdict_text: `Manual trigger: ${data.event}`,
            forecast: [],
            is_anomaly_predicted: data.event === 'critical_cpu',
            first_anomaly_time:
              data.event === 'critical_cpu' ? '+10 min' : null,
          })
        );
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    safeKill();
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
