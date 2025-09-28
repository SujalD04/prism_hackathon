import React, {useState} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Camera, Sparkles, FileUp, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { getSessionId } from '../utils/session'; // Ensure you have this utility

// --- New: Dark-Themed Skeleton Loader ---
const SkeletonLoader = () => (
  <div className="animate-pulse space-y-5">
    <div className="h-5 bg-slate-700 rounded w-1/3"></div>
    <div className="h-3 bg-slate-700 rounded w-full"></div>
    <div className="h-3 bg-slate-700 rounded w-5/6"></div>
    <div className="h-3 bg-slate-700 rounded w-full"></div>
  </div>
);

// --- Reimagined: Formatted Analysis Component ---
const FormattedAnalysis = ({ text }) => {
  // Simple parser for Gemini's markdown-like response
  const sections = text.split('**').filter(s => s.trim() !== '');
  const analysis = {};
  for (let i = 0; i < sections.length; i += 2) {
    if (sections[i] && sections[i+1]) {
      analysis[sections[i].replace(':', '').trim()] = sections[i+1].trim();
    }
  }

  const severity = analysis['Overall Damage Severity'] || 'Unknown';
  const severityStyles = {
    'None': { color: 'text-green-400', Icon: ShieldCheck },
    'Minor': { color: 'text-green-400', Icon: ShieldCheck },
    'Moderate': { color: 'text-amber-400', Icon: ShieldAlert },
    'Severe': { color: 'text-red-400', Icon: ShieldX },
    'Unknown': { color: 'text-gray-400', Icon: ShieldAlert }
  };
  const { color, Icon } = severityStyles[severity] || severityStyles['Unknown'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-gray-300">
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-2">Damage Severity</h3>
        <div className={`flex items-center gap-2 text-xl font-bold ${color}`}>
          <Icon size={24} />
          <span>{severity}</span>
        </div>
      </div>
       <div>
        <h3 className="text-sm font-medium text-gray-400">Identified Object</h3>
        <p className="mt-1">{analysis['Identified Object'] || 'N/A'}</p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-400">Signs of Damage</h3>
        <p className="mt-1 leading-relaxed">{analysis['Signs of Physical Damage'] || 'N/A'}</p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-400">Justification</h3>
        <p className="mt-1 leading-relaxed">{analysis['Justification'] || 'N/A'}</p>
      </div>
    </motion.div>
  );
};

// --- Main Page Component ---
const VisualAssistantPage = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // --- Core Logic (Unchanged) ---
  const handleFileChange = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
      setResult('');
    }
  };

  const handleDragEvents = (e, dragging) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(dragging);
  };
  
  const handleDrop = (e) => {
    handleDragEvents(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsLoading(true);
    setResult('');
    const formData = new FormData();
    formData.append('deviceImage', file);

    try {
        // Call visual analysis API
        const response = await fetch('http://localhost:5001/api/diagnose/visual', { method: 'POST', body: formData });
        if (!response.ok) throw new Error('Server error');
        const data = await response.json();
        setResult(data.analysis);

        // --- Update report using reportId instead of sessionId ---
        const reportId = localStorage.getItem('aura_reportId');
        if (reportId && data.analysis) {
        const updateRes = await fetch(`http://localhost:5001/api/reports/${reportId}/update`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visualAnalysis: data.analysis }),
        });

        if (!updateRes.ok) console.warn('Report update failed:', await updateRes.text());
        }

    } catch (error) {
        console.error('Visual analysis error:', error);
        setResult('Failed to get analysis. Please try again.');
    } finally {
        setIsLoading(false);
    }
    };

  
  const handleReset = () => {
    setFile(null);
    setPreview('');
    setResult('');
  };

  return (
    <div className="bg-slate-900 text-gray-200 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white text-center">Visual Assistant</h1>
        <p className="text-gray-400 text-center mb-8">Upload a device image for instant AI-powered damage assessment.</p>
      </motion.div>

      <div className="max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {!preview ? (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onDragEnter={(e) => handleDragEvents(e, true)}
              onDragLeave={(e) => handleDragEvents(e, false)}
              onDragOver={(e) => handleDragEvents(e, true)}
              onDrop={handleDrop}
            >
              <label
                htmlFor="file-upload"
                className={`relative flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300
                  ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-blue-500 bg-slate-800/50'}`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                  <UploadCloud className={`w-12 h-12 mb-4 transition-colors ${isDragging ? 'text-blue-400' : 'text-slate-500'}`} />
                  <p className="mb-2 text-lg font-semibold text-gray-300">
                    <span className="text-blue-400">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-sm text-gray-400">PNG, JPG, or JPEG</p>
                </div>
                <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files[0])} />
              </label>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
            >
              {/* Left Column: Image & Controls */}
              <div className="space-y-6">
                <div className="bg-slate-800/50 p-2 rounded-2xl shadow-2xl shadow-blue-500/10 border border-slate-700">
                  <img src={preview} alt="Device preview" className="w-full h-auto rounded-xl object-contain" style={{maxHeight: '400px'}} />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={handleSubmit} disabled={isLoading} className="flex-1 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-slate-600 transition-all duration-300 flex items-center justify-center gap-2 animate-pulse disabled:animate-none">
                    <Sparkles size={20} />
                    {isLoading ? 'Analyzing...' : 'Run AI Analysis'}
                  </button>
                  <button onClick={handleReset} className="flex-1 bg-slate-700 hover:bg-slate-600 text-gray-300 font-bold py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2">
                    <FileUp size={20} />
                    Upload New Image
                  </button>
                </div>
              </div>

              {/* Right Column: Analysis */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-lg min-h-[300px]">
                <div className="flex items-center gap-3 mb-6">
                  <Camera size={24} className="text-blue-400" />
                  <h2 className="text-2xl font-bold text-white">AI Analysis Report</h2>
                </div>
                {isLoading ? (
                  <SkeletonLoader />
                ) : result ? (
                  <FormattedAnalysis text={result} />
                ) : (
                  <div className="text-center text-gray-400 pt-10">
                    <p>Your device's diagnostic report will appear here.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VisualAssistantPage;