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

        if (data.type === 'start' && data.device && data.sessionId) {
            safeKill();
            console.log(`Starting simulation for device: ${data.device}`);

            const pythonPath = path.resolve(
                __dirname, '..', '.venv',
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

            // --- THIS BLOCK IS THE FIX ---
            // It now intelligently checks for real errors vs. warnings.
            pythonProcess.stderr.on('data', (chunk) => {
                const errorMsg = chunk.toString();
                // Always log any stderr message to the server console for debugging
                console.error(`[Python stderr]: ${errorMsg}`);

                // ONLY send a message to the frontend if it's a REAL error.
                // Harmless warnings (like from TensorFlow) will be ignored.
                if (errorMsg.includes('Traceback') || errorMsg.toLowerCase().includes('error')) {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ error: errorMsg }));
                    }
                }
            });

            pythonProcess.on('close', (code) => {
                console.log(`Python process exited with code ${code}`);
                pythonProcess = null;
            });
        }
        
        if (data.type === 'trigger' && data.event) {
            // Your trigger logic is fine and needs no changes
            const { sessionId, device, event } = data;
            const reportData = {
                timestamp: new Date().toLocaleTimeString(),
                trigger: event,
                final_status_text: "Critical",
                final_status_style: "critical",
                probability: 0.95,
                is_anomaly_predicted: true,
                first_anomaly_time: "+1 min",
                verdict_text: `🚨 Manual Trigger Activated: ${event}`,
                root_cause: event === 'critical_cpu' ? 'CPU Overload' : 'Battery Failure',
                forecast: [{"Time": "+1 min", "Predicted Metric": event === 'critical_cpu' ? 'CPU Temp > 95°C' : 'Voltage Drop'}],
            };
            const reportId = addSimulationData(sessionId, device, 'predictive', reportData);
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ reportId, ...reportData }));
            }
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