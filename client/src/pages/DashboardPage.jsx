import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js/auto';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Watch, Refrigerator, BarChart2, Bell, AlertTriangle, XCircle, Zap, BatteryWarning, Cpu, BrainCircuit } from 'lucide-react';

// Register Chart.js components
Chart.register(...registerables);

// Helper to get session ID from local storage
const getSessionId = () => localStorage.getItem('aura_sessionId');
const setSessionId = (id) => localStorage.setItem('aura_sessionId', id);


// Mapping for device icons
const deviceIcons = {
  smartphone: <Smartphone size={48} className="mx-auto text-blue-400" />,
  smartwatch: <Watch size={48} className="mx-auto text-blue-400" />,
  smartfridge: <Refrigerator size={48} className="mx-auto text-blue-400" />,
};

// Main Dashboard Component
const DashboardPage = () => {
  const [simulationState, setSimulationState] = useState('idle'); // idle, running
  const [selectedDevice, setSelectedDevice] = useState('smartphone');
  const [data, setData] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingState, setLoadingState] = useState({
    simulation: false,
    trigger: false,
    explanation: false,
  });

  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const ws = useRef(null);

  // --- Core Logic (Unchanged) ---
    const handleStart = async () => {
    setLoadingState(prev => ({ ...prev, simulation: true }));
    try {
        // Get or create sessionId
        const sessionId = getSessionId() || crypto.randomUUID();
        setSessionId(sessionId);

        // Create or retrieve report from backend
        const res = await axios.post("http://localhost:5001/api/reports/start", {
        sessionId,
        device: selectedDevice
        });

        const reportId = res.data.reportId;
        localStorage.setItem('aura_reportId', reportId); // store reportId for later
        setSessionId(sessionId); // still keep sessionId if needed

        // Open WebSocket connection
        ws.current = new WebSocket('ws://localhost:5001');

        ws.current.onopen = () => {
        console.log(`[WS] Connected. Starting simulation for sessionId=${sessionId}, device=${selectedDevice}`);
        ws.current.send(JSON.stringify({
            type: 'start',
            device: selectedDevice,
            sessionId
        }));
        setSimulationState('running');
        setLoadingState(prev => ({ ...prev, simulation: false }));
        };

        ws.current.onmessage = (event) => {
            try {
                const receivedData = JSON.parse(event.data);

                if (receivedData.error) {
                console.error('Error from backend:', receivedData.error);
                handleStop();
                return;
                }

                // Ensure we have a proper predictive update
                if (receivedData.predictive) {
                const updatedData = receivedData.predictive;

                // Merge with previous state carefully
                setData((prev) => ({
                    ...prev,
                    ...updatedData,
                    // Ensure forecast is an array
                    forecast: updatedData.forecast || prev?.forecast || [],
                }));

                // Optional: log for debugging
                console.log('📈 Updated data received:', updatedData);
                } else {
                // fallback for non-predictive messages
                setData((prev) => ({ ...prev, ...receivedData }));
                }
            } catch (err) {
                console.warn('Non-JSON message received:', event.data);
            }
            };


        ws.current.onclose = () => {
        console.log('[WS] Disconnected');
        setSimulationState('idle');
        setLoadingState(prev => ({ ...prev, simulation: false }));
        };

    } catch (err) {
        console.error("Failed to start report:", err);
        setLoadingState(prev => ({ ...prev, simulation: false }));
    }
    };


    const handleStop = async () => {
        if (ws.current) {
            ws.current.send(JSON.stringify({ type: 'stop' }));
            ws.current.close();
        }

        // Save final data to backend before clearing state
        const reportId = localStorage.getItem('aura_reportId');
        if (reportId && data) {
            try {
                await axios.post(`http://localhost:5001/api/reports/${reportId}/predictive`, data);
                console.log('[REPORT] Final predictive data saved for report:', reportId);
            } catch (err) {
                console.error('Failed to save report on stop:', err);
            }
        }


        setSimulationState('idle');
        setData(null);
        setExplanation(null);
        if (chartInstance.current) {
            chartInstance.current.destroy();
            chartInstance.current = null;
        }

        // Optionally clear sessionId if you want a fresh session next time
        localStorage.removeItem('aura_sessionId');
    };


  // --- Trigger Event Helper ---
    const handleTrigger = async (eventName) => {
    if (ws.current && simulationState === 'running') {
        setLoadingState(prev => ({ ...prev, trigger: true }));
        const sessionId = getSessionId();
        if (!sessionId) {
        console.error("No sessionId found! Cannot trigger event.");
        setLoadingState(prev => ({ ...prev, trigger: false }));
        return;
        }

        console.log(`[WS] Triggering ${eventName} for sessionId=${sessionId}, device=${selectedDevice}`);
        ws.current.send(JSON.stringify({
        type: 'trigger',
        event: eventName,
        sessionId,
        device: selectedDevice
        }));

        setTimeout(() => setLoadingState(prev => ({ ...prev, trigger: false })), 1000);
    }
    };


  const handleExplain = async () => {
    if (!data || !data.trigger) return;
    setLoadingState(prev => ({ ...prev, explanation: true }));
    try {
      const res = await axios.post('http://localhost:5001/api/diagnose/summarize', {
        device: selectedDevice,
        root_cause: data.trigger,
      });
      setExplanation(res.data.summary);
      setShowModal(true);
    } catch (err) {
      console.error('Failed to fetch explanation:', err);
      setExplanation('Unable to fetch explanation at this time.');
      setShowModal(true);
    } finally {
      setLoadingState(prev => ({ ...prev, explanation: false }));
    }
  };

  // --- Chart.js Effect (Updated for Dark Theme) ---
  useEffect(() => {
    if (data && simulationState === 'running') {
      const ctx = chartRef.current?.getContext('2d');
      if (!ctx) return;

      if (!chartInstance.current) {
        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: [],
            datasets: [{
              label: 'Failure Probability',
              data: [],
              borderColor: '#3b82f6', // Samsung Blue
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#3b82f6',
              pointBorderColor: '#fff',
              pointHoverRadius: 7,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 1.1,
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#9ca3af' }, // gray-400
              },
              x: {
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#9ca3af' }, // gray-400
              }
            },
            plugins: {
              legend: { labels: { color: '#d1d5db' } }, // gray-300
              tooltip: {
                backgroundColor: '#1f2937', // gray-800
                titleColor: '#fff',
                bodyColor: '#e5e7eb', // gray-200
                padding: 10,
                cornerRadius: 8,
              }
            }
          },
        });
      }

      const chart = chartInstance.current.data;
      chart.labels.push(data.timestamp || new Date().toLocaleTimeString());
      chart.datasets[0].data.push(data.probability || 0);
      if (chart.labels.length > 30) {
        chart.labels.shift();
        chart.datasets[0].data.shift();
      }
      chartInstance.current.update();
    }
  }, [data, simulationState]);
  
  // --- Main Render Logic ---
  return (
    <div className="bg-slate-900 text-gray-200 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <AnimatePresence>
        {simulationState === 'idle' ? (
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-center min-h-[80vh]"
          >
            <div className="w-full max-w-md text-center">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl shadow-blue-500/10">
                {deviceIcons[selectedDevice]}
                <h1 className="text-4xl font-bold mt-4 mb-2 text-white">AURA Health Monitor</h1>
                <p className="text-gray-400 mb-8">
                  Select a device to begin real-time diagnostics.
                </p>
                <div className="mb-6">
                  <select
                    value={selectedDevice}
                    onChange={(e) => setSelectedDevice(e.target.value)}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="smartphone">Smartphone</option>
                    <option value="smartwatch">Smartwatch</option>
                    <option value="smartfridge">Smart fridge</option>
                  </select>
                </div>
                <button
                  onClick={handleStart}
                  disabled={loadingState.simulation}
                  className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-all duration-300 disabled:bg-blue-800 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loadingState.simulation ? 'Initializing...' : 'Start Monitoring'}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <div>
                 <h1 className="text-3xl font-bold text-white">Live Health Dashboard</h1>
                 <p className="text-gray-400 capitalize">Monitoring: {selectedDevice}</p>
              </div>
              <button
                onClick={handleStop}
                className="mt-4 sm:mt-0 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-300"
              >
                Stop Session
              </button>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                <StatusVerdictCard data={data} handleExplain={handleExplain} loading={loadingState.explanation} />
                <PredictiveForecastCard data={data} />
              </div>

              {/* Right Column */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                 <LiveChartCard chartRef={chartRef} />
                 <SimulationControlsCard handleTrigger={handleTrigger} loading={loadingState.trigger} />
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AIExplanationModal show={showModal} onClose={() => setShowModal(false)} explanation={explanation} loading={loadingState.explanation} />
    </div>
  );
};

// --- Sub-components for better organization ---

const Card = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-lg ${className}`}
  >
    {children}
  </motion.div>
);

const StatusVerdictCard = ({ data, handleExplain, loading }) => {
  const statusStyles = {
    normal: { bg: 'bg-green-500', text: 'Normal', Icon: <Bell size={32} /> },
    warning: { bg: 'bg-amber-500', text: 'Warning', Icon: <AlertTriangle size={32} /> },
    critical: { bg: 'bg-red-600', text: 'Critical', Icon: <XCircle size={32} /> },
  };
  const currentStatus = data?.final_status_style || 'normal';
  const { bg, text, Icon } = statusStyles[currentStatus] || statusStyles.normal;
  
  return (
    <Card className={`flex flex-col justify-between transition-colors duration-500 ${bg}`}>
      <div>
        <div className="flex items-center gap-4 text-white">
          {Icon}
          <h3 className="text-xl font-semibold">System Health Verdict</h3>
        </div>
        <p className="text-5xl font-bold mt-4 text-white">{data?.final_status_text || text}</p>
        <p className="text-white/80 mt-1">{data?.verdict_text || 'All systems operational.'}</p>
      </div>
      {data?.trigger && (
        <button
          onClick={handleExplain}
          disabled={loading}
          className="mt-6 w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
        >
          <BrainCircuit size={16} />
          {loading ? 'Analyzing...' : 'AI Diagnosis'}
        </button>
      )}
    </Card>
  );
};

const PredictiveForecastCard = ({ data }) => (
  <Card>
    <h3 className="text-xl font-semibold mb-4 text-white">Predictive Forecast</h3>
    {data?.is_anomaly_predicted ? (
      <p className="text-amber-400 mb-4">🚨 Anomaly predicted at {data.first_anomaly_time}</p>
    ) : (
      <p className="text-green-400 mb-4">✅ No future anomalies detected</p>
    )}
    <div className="overflow-auto max-h-48">
      {data?.forecast && data.forecast.length > 0 ? (
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-600">
              <th className="p-2 text-gray-400">Time</th>
              <th className="p-2 text-gray-400">Predicted Metric</th>
            </tr>
          </thead>
          <tbody>
            {data.forecast.map((f, idx) => (
              <tr key={idx} className="border-b border-slate-700 last:border-0">
                <td className="p-2">{f.Time}</td>
                <td className="p-2">{f['Predicted Metric']}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : <p className="text-gray-500">No forecast data available.</p>}
    </div>
  </Card>
);

const LiveChartCard = ({ chartRef }) => (
  <Card className="h-96">
    <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="text-blue-400" />
        <h2 className="text-xl font-bold text-white">Live Failure Probability</h2>
    </div>
    <div className="h-[calc(100%-2.5rem)]">
        <canvas ref={chartRef}></canvas>
    </div>
  </Card>
);

const SimulationControlsCard = ({ handleTrigger, loading }) => (
    <Card>
        <h3 className="text-xl font-semibold mb-4 text-white">Scenario Simulator</h3>
        <p className="text-gray-400 mb-4">Manually trigger events to test system response.</p>
        <div className="flex flex-col sm:flex-row gap-4">
             <button
                onClick={() => handleTrigger('critical_cpu')}
                disabled={loading}
                className="flex-1 bg-red-500/20 text-red-300 border border-red-500/50 hover:bg-red-500/40 font-semibold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
             >
                <Cpu size={16} /> {loading ? 'Processing...' : 'Trigger Critical CPU'}
             </button>
             <button
                onClick={() => handleTrigger('warning_battery')}
                disabled={loading}
                className="flex-1 bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/40 font-semibold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
             >
                <BatteryWarning size={16} /> {loading ? 'Processing...' : 'Trigger Battery Warning'}
             </button>
        </div>
    </Card>
);

const AIExplanationModal = ({ show, onClose, explanation, loading }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-2xl max-w-md w-full"
        >
          <div className="flex items-center gap-2">
            <BrainCircuit className="text-blue-400" />
            <h3 className="text-xl font-bold text-white">AI Diagnosis & Recommendation</h3>
          </div>
          <div className="my-4 text-gray-300 min-h-[60px]">
             {loading ? <p>Analyzing data streams...</p> : <p>{explanation}</p>}
          </div>
          <button
            onClick={onClose}
            className="mt-4 w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default DashboardPage;
