import { useState, useEffect } from 'react';
import axios from 'axios';
import { getSessionId } from '../utils/session';
import { motion } from 'framer-motion';
import { FileText, Smartphone, BarChartBig, Camera, Mic, AlertTriangle, Download, Loader2, SearchX } from 'lucide-react';

// Re-using the analysis component logic for the Vision report section
const FormattedAnalysis = ({ text }) => {
  if (!text || typeof text !== 'string') return <p className="text-gray-400">No visual analysis data available.</p>;
  
  const sections = text.split('**').filter(s => s.trim() !== '');
  const analysis = {};
  for (let i = 0; i < sections.length; i += 2) {
    if (sections[i] && sections[i+1]) {
      analysis[sections[i].replace(':', '').trim()] = sections[i+1].trim();
    }
  }

  return (
    <div className="space-y-3">
      {Object.entries(analysis).map(([key, value]) => (
        <div key={key}>
          <h4 className="text-sm font-semibold text-blue-400">{key}</h4>
          <p className="text-gray-300">{value}</p>
        </div>
      ))}
    </div>
  );
};

// --- Sub-components for a structured report ---

const ReportCard = ({ icon: Icon, title, children }) => (
  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-lg">
    <div className="flex items-center gap-3 mb-4">
      <Icon className="text-blue-400" size={20} />
      <h3 className="text-lg font-bold text-white">{title}</h3>
    </div>
    <div className="pl-8 border-l-2 border-slate-700">{children}</div>
  </div>
);

const LoadingState = () => (
    <div className="flex flex-col items-center justify-center text-center h-full text-gray-400">
        <Loader2 className="animate-spin h-12 w-12 mb-4 text-blue-500" />
        <p className="text-lg font-semibold">Generating Your Report...</p>
        <p>Please wait a moment.</p>
    </div>
);

const EmptyState = () => (
     <div className="flex flex-col items-center justify-center text-center h-full text-gray-400">
        <SearchX className="h-16 w-16 mb-4 text-slate-600" />
        <h2 className="text-2xl font-bold text-white mb-2">No Active Report Found</h2>
        <p>Please start a new device simulation from the Dashboard to generate a report.</p>
    </div>
);


// --- Main Page Component ---
const ReportsPage = () => {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const sessionId = getSessionId();

  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }
    axios.get(`http://localhost:5001/api/reports/${sessionId}`)
      .then(res => setReport(res.data))
      .catch(err => console.error("Failed to fetch report:", err))
      .finally(() => setIsLoading(false));
  }, [sessionId]);

  const renderReportContent = () => {
    if (isLoading) return <LoadingState />;
    if (!report) return <EmptyState />;

    const { finalStatus, rootCause, summary, device, evidence } = report;
    const isCritical = finalStatus === 'Critical';

    return (
      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <FileText size={32} className="text-blue-400"/>
              <h1 className="text-4xl font-bold text-white">Diagnostic Report</h1>
            </div>
            <div className="flex items-center gap-2 text-gray-400 mt-2 pl-1">
              <Smartphone size={16} />
              <p className="font-medium capitalize">{device}</p>
              <span className="text-slate-600">|</span>
              <p>ID: {report._id}</p>
            </div>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
            <Download size={16}/> Download PDF
          </button>
        </div>

        {/* Summary Card */}
        <div className={`p-6 rounded-xl border ${isCritical ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className={isCritical ? 'text-red-400' : 'text-amber-400'} size={24}/>
            <h2 className="text-2xl font-bold text-white">Overall Verdict: {finalStatus}</h2>
          </div>
          <p className="text-gray-300 mt-2">
            <span className="font-semibold">Root Cause Identified:</span> {rootCause || 'N/A'}
          </p>
          <div className="mt-4 pt-4 border-t border-white/10">
            <h3 className="font-semibold text-white">AI Recommended Action</h3>
            <p className="text-gray-300">{summary || 'No summary available.'}</p>
          </div>
        </div>

        {/* Evidence Breakdown */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Evidence Breakdown</h2>
          <div className="space-y-6">
             <ReportCard icon={BarChartBig} title="Log & Predictive Analysis">
                <p className="text-gray-300">{evidence?.logAnalysis || 'No log data available.'}</p>
             </ReportCard>
             <ReportCard icon={Camera} title="Visual Inspection">
                <FormattedAnalysis text={evidence?.visualAnalysis} />
             </ReportCard>
             <ReportCard icon={Mic} title="User Audio Report">
                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-300">
                    "{evidence?.audioTranscript || 'No user audio report was provided.'}"
                </blockquote>
             </ReportCard>
          </div>
        </div>
      </motion.div>
    );
  };
  
  return (
    <div className="bg-slate-900 text-gray-200 min-h-screen p-4 sm:p-6 lg:p-8 font-sans flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-grow">
            {renderReportContent()}
        </div>
    </div>
  );
};

export default ReportsPage;