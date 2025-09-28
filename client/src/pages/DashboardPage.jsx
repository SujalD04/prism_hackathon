// client/src/pages/DashboardPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

const DashboardPage = () => {
  const [simulationState, setSimulationState] = useState('idle'); // idle, running
  const [selectedDevice, setSelectedDevice] = useState('smartphone');
  const [data, setData] = useState(null);

  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const ws = useRef(null);

  const handleStart = () => {
    ws.current = new WebSocket('ws://localhost:5001');

    ws.current.onopen = () => {
      console.log('Connected to WebSocket. Starting simulation...');
      ws.current.send(JSON.stringify({ type: 'start', device: selectedDevice }));
      setSimulationState('running');
    };

    ws.current.onmessage = (event) => {
      const receivedData = JSON.parse(event.data);
      if (receivedData.error) {
        console.error('Error from backend:', receivedData.error);
        handleStop();
      } else {
        setData(receivedData);
      }
    };

    ws.current.onclose = () => {
      console.log('Disconnected from WebSocket');
      setSimulationState('idle');
    };
  };

  const handleStop = () => {
    if (ws.current) {
      ws.current.send(JSON.stringify({ type: 'stop' }));
      ws.current.close();
    }
    setSimulationState('idle');
    setData(null);

    if (chartInstance.current) {
      chartInstance.current.data.labels = [];
      chartInstance.current.data.datasets[0].data = [];
      chartInstance.current.update();
    }
  };

  useEffect(() => {
    if (data && simulationState === 'running') {
      if (!chartInstance.current) {
        const ctx = chartRef.current.getContext('2d');
        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: [],
            datasets: [
              {
                label: 'Failure Probability',
                data: [],
                borderColor: '#ef4444',
                tension: 0.1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false, // important for canvas height
            scales: { y: { beginAtZero: true, max: 1.1 } },
          },
        });
      }

      const chart = chartInstance.current.data;
      chart.labels.push(data.timestamp);
      chart.datasets[0].data.push(data.probability);
      if (chart.labels.length > 30) {
        chart.labels.shift();
        chart.datasets[0].data.shift();
      }
      chartInstance.current.update();
    }
  }, [data, simulationState]);

  if (simulationState === 'idle') {
    return (
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
          Start Simulation
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
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

      {data ? (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div
              className={`p-4 rounded-lg text-white shadow-md metric-card metric-card-${data.final_status_style} ${data.card_class_extra}`}
              style={{
                backgroundColor:
                  data.final_status_style === 'normal'
                    ? '#28a745'
                    : data.final_status_style === 'warning'
                    ? '#ffc107'
                    : '#dc3545',
                border: data.card_class_extra ? '3px solid #00BFFF' : 'none',
              }}
            >
              <h3 className="text-lg font-semibold mb-2">System Health Verdict</h3>
              <p className="text-2xl font-bold">{data.final_status_text}</p>
            </div>

            <div className="p-4 rounded-lg bg-gray-100 text-black shadow-md">
              <h3 className="text-lg font-semibold mb-2">Predictive Model</h3>
              {data.is_anomaly_predicted ? (
                <p>🚨 Anomaly predicted at {data.first_anomaly_time}</p>
              ) : (
                <p>✅ No future anomalies detected</p>
              )}
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
            </div>
          </div>

          {/* Live Chart */}
          <div className="bg-white p-4 rounded-lg shadow-md h-72">
            <h2 className="text-xl font-bold mb-2">📈 Live Failure Probability Trend</h2>
            <canvas ref={chartRef} className="w-full h-full"></canvas>
          </div>
        </>
      ) : (
        <div className="text-center p-8">Connecting and starting simulation...</div>
      )}
    </div>
  );
};

export default DashboardPage;
