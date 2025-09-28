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

// --- UPDATED WEBSOCKET LOGIC ---
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  let pythonProcess = null;

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'start' && data.device) {
      if (pythonProcess) {
        pythonProcess.kill();
      }

      console.log(`Starting simulation for device: ${data.device}`);

      // ✅ Use Python inside .venv
      const pythonPath = path.resolve(__dirname, '..', '.venv', 'Scripts', 'python.exe'); 
      // On Linux/macOS: path.resolve(__dirname, '..', '.venv', 'bin', 'python')

      const scriptPath = path.resolve(__dirname, 'ml', 'simulation_engine.py');

      pythonProcess = spawn(pythonPath, ['-u', scriptPath, data.device]);

      pythonProcess.stdout.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data.toString());
        }
      });

      pythonProcess.stderr.on('data', (data) => {
        const msg = data.toString();
        if (msg.toLowerCase().includes('error')) {
            console.error(`Python script error: ${msg}`);
            if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ error: msg }));
            }
        } else {
            console.warn(`Python script warning: ${msg}`);
        }
      });


      pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
      });
    }

    if (data.type === 'stop') {
      if (pythonProcess) {
        console.log('Stopping simulation.');
        pythonProcess.kill();
        pythonProcess = null;
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    if (pythonProcess) {
      pythonProcess.kill();
    }
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
