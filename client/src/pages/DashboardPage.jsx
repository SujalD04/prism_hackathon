import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js/auto';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Smartphone, Watch, Refrigerator, BarChart2, Bell, AlertTriangle, XCircle, 
    BatteryWarning, Cpu, BrainCircuit, ShieldCheck, ShieldAlert, Clock, HeartPulse 
} from 'lucide-react';
import axios from 'axios'; // Make sure axios is imported

// Register Chart.js components
Chart.register(...registerables);

// Helper Functions
const getSessionId = () => localStorage.getItem('aura_sessionId');
const setSessionId = (id) => localStorage.setItem('aura_sessionId', id);

const deviceIcons = {
    smartphone: <Smartphone size={48} className="mx-auto text-blue-400" />,
    smartwatch: <Watch size={48} className="mx-auto text-blue-400" />,
    smartfridge: <Refrigerator size={48} className="mx-auto text-blue-400" />,
};

// --- Main Dashboard Component ---
const DashboardPage = () => {
    const [simulationState, setSimulationState] = useState('idle');
    const [selectedDevice, setSelectedDevice] = useState('smartphone');
    const [data, setData] = useState(null);
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const ws = useRef(null);

    const handleStart = () => {
        const sessionId = getSessionId() || crypto.randomUUID();
        setSessionId(sessionId);

        // Create the report record as soon as the simulation starts
        axios.post("http://localhost:5001/api/reports/start", {
            sessionId,
            device: selectedDevice
        }).then(res => {
            localStorage.setItem('aura_reportId', res.data.reportId);
        }).catch(err => {
            console.error("Failed to create report:", err);
        });

        ws.current = new WebSocket('ws://localhost:5001');

        ws.current.onopen = () => {
            console.log(`[WS] Connected. Starting simulation for ${selectedDevice}`);
            ws.current.send(JSON.stringify({ type: 'start', device: selectedDevice, sessionId }));
            setSimulationState('running');
        };

        ws.current.onmessage = (event) => {
            try {
                const receivedData = JSON.parse(event.data);
                if (receivedData.error) {
                    console.error('Error from backend:', receivedData.error);
                    handleStop();
                    return;
                }
                setData(receivedData);
            } catch (err) {
                console.warn('Non-JSON message received:', event.data);
            }
        };

        ws.current.onclose = () => {
            console.log('[WS] Disconnected');
            setSimulationState('idle');
        };
    };

    const handleStop = async () => { // Make function async
        if (ws.current) {
            ws.current.send(JSON.stringify({ type: 'stop' }));
            ws.current.close();
        }

        // --- THIS IS THE FIX ---
        // Before clearing state, transform and save the final data to the report.
        const reportId = localStorage.getItem('aura_reportId');
        if (reportId && data) {
            try {
                console.log('Transforming and saving final report data...', data);

                // 1. Create a payload that matches the format the Reports page expects.
                const reportPayload = {
                    final_status_text: data.current_health_status,
                    trigger: data.root_cause !== 'None' ? data.root_cause : 'Not applicable',
                    verdict_text: `Current Health Status: ${data.current_health_status}. Predictive Anomaly Detected: ${data.is_anomaly_predicted}. Predicted Failure Probability: ${(data.predictive_probability * 100).toFixed(1)}%.`,
                    ai_summary: `Based on the latest data, the AI recommends monitoring the device closely. A potential '${data.root_cause || 'issue'}' was detected with an estimated time to failure of ${data.first_anomaly_time || 'N/A'}.`
                };

                // 2. Send this transformed payload to the update endpoint.
                await axios.put(`http://localhost:5001/api/reports/${reportId}/update`, {
                    predictive: reportPayload 
                });
                console.log('Final report data saved successfully!');
            } catch (err) {
                console.error('Failed to save final report data:', err);
            }
        }
        // -----------------------

        setSimulationState('idle');
        setData(null);
        if (chartInstance.current) {
            chartInstance.current.destroy();
            chartInstance.current = null;
        }
    };

    useEffect(() => {
        if (data && simulationState === 'running') {
            const ctx = chartRef.current?.getContext('2d');
            if (!ctx) return;

            if (!chartInstance.current) {
                chartInstance.current = new Chart(ctx, {
                    type: 'line',
                    data: { 
                        labels: [], 
                        datasets: [
                            { 
                                label: 'Predictive Failure Probability', 
                                data: [],
                                borderColor: '#3b82f6',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                fill: true,
                                tension: 0.4,
                                yAxisID: 'y',
                            },
                            {
                                label: 'Current Health Score',
                                data: [],
                                borderColor: '#10b981',
                                borderDash: [5, 5],
                                fill: false,
                                tension: 0.4,
                                yAxisID: 'y',
                            }
                        ] 
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: { 
                                beginAtZero: true, 
                                max: 1.0,
                                ticks: { color: '#9ca3af' },
                                grid: { color: 'rgba(255, 255, 255, 0.1)' }
                            },
                            x: {
                                ticks: { color: '#9ca3af' },
                                grid: { color: 'rgba(255, 255, 255, 0.1)' }
                            }
                        },
                        plugins: {
                            legend: { labels: { color: '#d1d5db' } }
                        }
                    }
                });
            }

            const chart = chartInstance.current.data;
            chart.labels.push(data.timestamp || new Date().toLocaleTimeString());
            
            chart.datasets[0].data.push(data.predictive_probability || 0);
            chart.datasets[1].data.push(data.current_health_probability || 0);
            
            if (chart.labels.length > 30) {
                chart.labels.shift();
                chart.datasets[0].data.shift();
                chart.datasets[1].data.shift();
            }
            chartInstance.current.update();
        }
    }, [data, simulationState]);

    return (
        <div className="bg-slate-900 text-gray-200 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
            <AnimatePresence>
                {simulationState === 'idle' ? (
                    <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center min-h-[80vh]">
                        <div className="w-full max-w-md text-center">
                          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
                              {deviceIcons[selectedDevice]}
                              <h1 className="text-4xl font-bold mt-4 mb-2 text-white">AURA Health Monitor</h1>
                              <p className="text-gray-400 mb-8">Select a device to begin real-time diagnostics and prediction.</p>
                              <select value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)} className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white mb-6">
                                  <option value="smartphone">Smartphone</option>
                                  <option value="smartwatch">Smartwatch</option>
                                  <option value="smartfridge">Smart fridge</option>
                              </select>
                              <button onClick={handleStart} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700">
                                  Start Monitoring
                              </button>
                          </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-between items-center mb-8">
                          <div>
                            <h1 className="text-3xl font-bold text-white">Live Health Dashboard</h1>
                            <p className="text-gray-400 capitalize">Monitoring: {selectedDevice}</p>
                          </div>
                          <button onClick={handleStop} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">
                            Stop Session
                          </button>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1 flex flex-col gap-6">
                                <CurrentHealthCard data={data} />
                                <h3 className="font-semibold text-lg text-gray-400 mt-2 ml-1">AI Predictive Agents</h3>
                                <RiskScreenerCard data={data} />
                                <RootCauseCard data={data} />
                                <FailureForecastCard data={data} />
                            </div>
                            <div className="lg:col-span-2">
                                <LiveChartCard chartRef={chartRef} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Card = ({ children, className = '' }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-lg ${className}`}>
        {children}
    </motion.div>
);

// --- Child Components ---

const GaugeChart = ({ value = 0 }) => {
    const size = 120;
    const strokeWidth = 10;
    const center = size / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const progress = circumference * (1 - value);

    const color = value > 0.7 ? '#ef4444' : value > 0.3 ? '#f59e0b' : '#10b981';

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                <circle cx={center} cy={center} r={radius} stroke="#374151" strokeWidth={strokeWidth} fill="transparent" />
                <motion.circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={progress}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: progress }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                />
            </svg>
            <motion.div
                className="absolute inset-0 flex items-center justify-center text-2xl font-bold"
                style={{ color }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {Math.round(value * 100)}%
            </motion.div>
        </div>
    );
};

const CurrentHealthCard = ({ data }) => {
    const statusStyles = {
        normal: { bg: 'bg-green-500/80', text: 'Normal' },
        warning: { bg: 'bg-amber-500/80', text: 'Warning' },
        critical: { bg: 'bg-red-600/80', text: 'Critical' },
    };
    const status = data?.current_health_style || 'normal';
    const { bg, text } = statusStyles[status];
    return (
        <Card className={`text-white ${bg}`}>
            <div className="flex items-center gap-4"><HeartPulse size={24}/><h3 className="text-xl font-semibold">Current Device Health</h3></div>
            <p className="text-6xl font-bold text-center my-4">{data?.current_health_status || text}</p>
            <p className="text-center text-white/80">Real-time status based on live telemetry.</p>
        </Card>
    );
};

const RiskScreenerCard = ({ data }) => {
    const isAnomaly = data?.is_anomaly_predicted;
    const probability = data?.predictive_probability || 0;
    const statusText = isAnomaly ? "Future Anomaly Detected" : "No Future Anomaly";
    return (
        <Card>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ShieldCheck size={20} className="text-gray-400" />
                    <h3 className="text-md font-semibold text-white">Risk Screener Agent</h3>
                </div>
            </div>
             <p className="text-xs text-gray-400 mt-1">Analyzes patterns to predict the chance of a future failure.</p>
            <div className="flex justify-center my-2">
                 <GaugeChart value={probability} />
            </div>
            <p className={`text-sm text-center font-medium ${isAnomaly ? 'text-amber-400' : 'text-green-400'}`}>{statusText}</p>
        </Card>
    );
};

const RootCauseCard = ({ data }) => {
    const isAnomaly = data?.is_anomaly_predicted;
    const rootCause = data?.root_cause || "None";
    const causeIcons = { "Battery Failure": <BatteryWarning/>, "CPU Overheating": <Cpu/>, "Memory Failure": <Cpu/>, "Heart Rate Sensor Failure": <HeartPulse/>, "Water Seal Failure": <AlertTriangle/>, "Compressor Failure": <Cpu/>, "Thermostat Failure": <Cpu/>, "Seal Failure": <AlertTriangle/>, "Default": <AlertTriangle /> };
    return (
        <Card>
            <div className="flex items-center gap-3"><BrainCircuit size={20} className="text-blue-400" /><h3 className="text-md font-semibold text-white">Root Cause Agent</h3></div>
            <p className="text-xs text-gray-400 mt-1">Pinpoints the most likely component that will cause the failure.</p>
            <div className="text-center my-2 min-h-[4rem] flex flex-col justify-center items-center">
                {isAnomaly && rootCause !== "None" ? (<><div className="text-blue-400">{causeIcons[rootCause] || causeIcons["Default"]}</div><p className="text-xl font-bold text-white mt-1">{rootCause}</p></>) 
                                                  : <p className="text-gray-500 text-sm">Awaiting risk detection...</p>}
            </div>
        </Card>
    );
};

const FailureForecastCard = ({ data }) => {
    const isAnomaly = data?.is_anomaly_predicted;
    const timeToFailure = data?.first_anomaly_time;
    return (
        <Card>
            <div className="flex items-center gap-3"><Clock size={20} className="text-purple-400" /><h3 className="text-md font-semibold text-white">Forecast Agent</h3></div>
             <p className="text-xs text-gray-400 mt-1">Estimates the time remaining until the predicted failure occurs.</p>
            <div className="text-center my-2 min-h-[4rem] flex flex-col justify-center">
                {isAnomaly && timeToFailure ? (<p className="text-3xl font-bold text-white">{timeToFailure}</p>) 
                                           : <p className="text-gray-500 text-sm">Awaiting risk detection...</p>}
            </div>
        </Card>
    );
};

const LiveChartCard = ({ chartRef }) => (
    <Card className="h-[43rem]">
        <div className="flex items-center gap-2 mb-4"><BarChart2 className="text-blue-400" /><h2 className="text-xl font-bold text-white">Health & Prediction Timeline</h2></div>
        <div className="h-[calc(100%-2.5rem)]"><canvas ref={chartRef}></canvas></div>
    </Card>
);

export default DashboardPage;

