import { useState, useEffect } from 'react';
import axios from 'axios';
import { getSessionId } from '../utils/session';

const ReportsPage = () => {
  const [report, setReport] = useState(null);
  const sessionId = getSessionId();

  useEffect(() => {
    if (!sessionId) return;
    axios.get(`http://localhost:5001/api/reports/${sessionId}`)
      .then(res => setReport(res.data))
      .catch(err => console.error("Failed to fetch report:", err));
  }, [sessionId]);

  if (!sessionId) {
    return <p className="p-4">⚠️ No active report. Start a simulation first.</p>;
  }

  if (!report) {
    return <p className="p-4">Loading report...</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Report</h1>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">{report.device}</h2>
        <h3>Predictive:</h3>
        <pre>{JSON.stringify(report.predictive || 'No data', null, 2)}</pre>
        <h3>Vision:</h3>
        <pre>{JSON.stringify(report.vision || 'No data', null, 2)}</pre>
        <h3>Audio:</h3>
        <pre>{JSON.stringify(report.audio || 'No data', null, 2)}</pre>
      </div>
    </div>
  );
};

export default ReportsPage;
