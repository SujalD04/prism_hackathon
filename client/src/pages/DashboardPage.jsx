import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import axios from 'axios';
import { setSessionId, getSessionId } from '../utils/session'; 

const DashboardPage = () => {
  const [simulationState, setSimulationState] = useState('idle'); // idle, running
  const [selectedDevice, setSelectedDevice] = useState('smartphone');
  const [data, setData] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingSimulation, setLoadingSimulation] = useState(false);
  const [loadingTrigger, setLoadingTrigger] = useState(false);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const ws = useRef(null);

  // inside DashboardPage.jsx
    const handleStart = async () => {
        setLoadingSimulation(true);

        try {
            // Try to reuse existing sessionId if available
            let sessionId = getSessionId();
            if (!sessionId) {
            sessionId = crypto.randomUUID();  // generate new one if not exists
            setSessionId(sessionId);
            }

            // ✅ Send both sessionId + device to backend
            const res = await axios.post("http://localhost:5001/api/reports/start", {
            sessionId,
            device: selectedDevice
            });

            const reportId = res.data.reportId || sessionId;
            setSessionId(reportId); // update stored session

            // Start WebSocket connection
            ws.current = new WebSocket('ws://localhost:5001');
            ws.current.onopen = () => {
            console.log('Connected to WebSocket. Starting simulation...');
            ws.current.send(JSON.stringify({ type: 'start', device: selectedDevice, reportId }));
            setSimulationState('running');
            setLoadingSimulation(false);
            };

            ws.current.onmessage = (event) => {
            try {
                const receivedData = JSON.parse(event.data);
                if (receivedData.error) {
                console.error('Error from backend:', receivedData.error);
                handleStop();
                } else {
                setData(prev => ({ ...prev, ...receivedData }));
                }
            } catch (err) {
                console.warn('Non-JSON message received:', event.data);
            }
            };

            ws.current.onclose = () => {
            console.log('Disconnected from WebSocket');
            setSimulationState('idle');
            setLoadingSimulation(false);
            };

        } catch (err) {
            console.error("Failed to start report:", err);
            setLoadingSimulation(false);
        }
    };



  const handleStop = () => {
    if (ws.current) {
      ws.current.send(JSON.stringify({ type: 'stop' }));
      ws.current.close();
    }
    setSimulationState('idle');
    setData(null);
    setExplanation(null);
    setLoadingSimulation(false);
    setLoadingTrigger(false);
    setLoadingExplanation(false);

    if (chartInstance.current) {
      chartInstance.current.data.labels = [];
      chartInstance.current.data.datasets[0].data = [];
      chartInstance.current.update();
    }
  };

  const handleTrigger = async (eventName) => {
    if (ws.current && simulationState === 'running') {
      setLoadingTrigger(true);
      console.log(`Triggering event: ${eventName}`);
      ws.current.send(JSON.stringify({ type: 'trigger', event: eventName }));
      // simulate short delay for UI
      setTimeout(() => setLoadingTrigger(false), 1000);
    }
  };

  const handleExplain = async () => {
    if (!data || !data.trigger) return;
    setLoadingExplanation(true);
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
      setLoadingExplanation(false);
    }
  };

  useEffect(() => {
    if (data && simulationState === 'running') {
      if (!chartInstance.current) {
        const ctx = chartRef.current.getContext('2d');
        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: { labels: [], datasets: [{ label: 'Failure Probability', data: [], borderColor: '#ef4444', tension: 0.1 }] },
          options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 1.1 } } },
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

  return (
    <div className="p-4">
      {simulationState === 'idle' ? (
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-4">Start Device Monitoring</h1>
          <p className="text-gray-600 mb-6">
            Select a device to begin the real-time health simulation.
          </p>
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="w-full p-2 border rounded-md mb-6"
          >
            <option value="smartphone">Smartphone</option>
            <option value="smartwatch">Smartwatch</option>
            <option value="smartfridge">Smartfridge</option>
          </select>
          <button
            onClick={handleStart}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded hover:bg-blue-700 transition duration-300"
          >
            {loadingSimulation ? 'Connecting...' : 'Start Simulation'}
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">
              Live Health Dashboard: <span className="capitalize">{selectedDevice}</span>
            </h1>
            <button
              onClick={handleStop}
              className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600"
            >
              Stop & Select New Device
            </button>
          </div>

          {/* Trigger buttons */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => handleTrigger('critical_cpu')}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              {loadingTrigger ? 'Processing...' : 'Trigger Critical CPU'}
            </button>
            <button
              onClick={() => handleTrigger('warning_battery')}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              {loadingTrigger ? 'Processing...' : 'Trigger Low Battery'}
            </button>
          </div>

          {data && (
            <>
              {/* Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div
                  className={`p-4 rounded-lg text-white shadow-md metric-card metric-card-${data.final_status_style}`}
                  style={{
                    height: '200px',
                    backgroundColor:
                      data.final_status_style === 'normal'
                        ? '#28a745'
                        : data.final_status_style === 'warning'
                        ? '#ffc107'
                        : '#dc3545',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <h3 className="text-lg font-semibold mb-2">System Health Verdict</h3>
                  <p className="text-2xl font-bold">{data.final_status_text || data.final_status_style || 'Normal'}</p>
                  {data.trigger && (
                    <button
                      onClick={handleExplain}
                      className="mt-4 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      {loadingExplanation ? 'Fetching...' : 'Explain / Recommend Fix'}
                    </button>
                  )}
                </div>

                <div className="p-4 rounded-lg bg-gray-100 text-black shadow-md">
                  <h3 className="text-lg font-semibold mb-2">Predictive Model</h3>
                  {data.is_anomaly_predicted ? (
                    <p>🚨 Anomaly predicted at {data.first_anomaly_time}</p>
                  ) : (
                    <p>✅ No future anomalies detected</p>
                  )}
                  {data.forecast && (
                    <div className="mt-2 overflow-auto max-h-48">
                      <table className="w-full text-left border">
                        <thead>
                          <tr>
                            <th className="border px-2 py-1">Time</th>
                            <th className="border px-2 py-1">Predicted Metric</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.forecast.map((f, idx) => (
                            <tr key={idx}>
                              <td className="border px-2 py-1">{f.Time}</td>
                              <td className="border px-2 py-1">{f['Predicted Metric']}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Chart */}
              <div className="bg-white p-4 rounded-lg shadow-md h-72">
                <h2 className="text-xl font-bold mb-2">📈 Live Failure Probability Trend</h2>
                <canvas ref={chartRef} className="w-full h-full"></canvas>
              </div>
            </>
          )}

          {/* Explanation Modal */}
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h3 className="text-lg font-bold mb-2">Explanation / Recommendation</h3>
                {loadingExplanation ? <p>Fetching explanation...</p> : <p>{explanation}</p>}
                <button
                  onClick={() => setShowModal(false)}
                  className="mt-4 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardPage;
