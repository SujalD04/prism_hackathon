// client/src/pages/VisualAssistantPage.jsx
import React, { useState } from 'react';

// Helper component for the upload icon
const UploadIcon = () => (
    <svg className="w-12 h-12 mx-auto text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// Helper component for the loading state
const SkeletonLoader = () => (
    <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
    </div>
);

// Helper component to parse and format Gemini's response
const FormattedAnalysis = ({ text }) => {
    // This is a simple parser. It can be made more robust.
    const sections = text.split('**').filter(s => s.trim() !== '');
    const analysis = {};
    for (let i = 0; i < sections.length; i += 2) {
        if(sections[i] && sections[i+1]) {
            analysis[sections[i].replace(':', '').trim()] = sections[i+1].trim();
        }
    }

    const severity = analysis['Overall Damage Severity Classification'] || 'Unknown';
    const severityColor = severity === 'Severe' ? 'bg-red-500' : severity === 'Moderate' ? 'bg-yellow-500' : 'bg-green-500';

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-sm font-medium text-gray-500">Damage Severity</h3>
                <p className={`inline-block px-3 py-1 mt-1 text-lg font-bold text-white rounded-full ${severityColor}`}>{severity}</p>
            </div>
            <div>
                <h3 className="text-sm font-medium text-gray-500">Signs of Damage</h3>
                <p className="text-gray-700 mt-1">{analysis['Signs of Physical Damage'] || 'N/A'}</p>
            </div>
             <div>
                <h3 className="text-sm font-medium text-gray-500">Justification</h3>
                <p className="text-gray-700 mt-1">{analysis['Justification'] || 'N/A'}</p>
            </div>
        </div>
    );
};


const VisualAssistantPage = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
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
      const response = await fetch('http://localhost:5001/api/diagnose/visual', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Server error');
      const data = await response.json();
      setResult(data.analysis);
    } catch (error) {
      setResult('Failed to get analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
      setFile(null);
      setPreview('');
      setResult('');
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">📷 Visual Assistant</h1>
      <p className="text-gray-600 mb-8">Upload an image of your device to get an instant, AI-powered damage assessment.</p>
      
      {!preview ? (
        <div 
            onDragEnter={(e) => handleDragEvents(e, true)}
            onDragLeave={(e) => handleDragEvents(e, false)}
            onDragOver={(e) => handleDragEvents(e, true)}
            onDrop={handleDrop}
            className={`relative block w-full h-64 border-2 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300`}
        >
            <input
                id="file-upload"
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/png, image/jpeg, image/jpg"
                onChange={(e) => handleFileChange(e.target.files[0])}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
                <UploadIcon />
                <span className="mt-2 block text-sm font-medium text-gray-900">
                    Drag & Drop your image here
                </span>
                <span className="text-xs text-gray-500">or click to browse</span>
            </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Preview & Controls */}
            <div className="space-y-4">
                <img src={preview} alt="Device preview" className="w-full h-auto rounded-lg shadow-lg" />
                 <div className="flex space-x-4">
                     <button onClick={handleSubmit} disabled={isLoading} className="flex-1 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition duration-300">
                         {isLoading ? 'Analyzing...' : '✨ Analyze for Damage'}
                     </button>
                      <button onClick={handleReset} className="bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition duration-300">
                         Upload New
                     </button>
                 </div>
            </div>

            {/* Right Column: Analysis Result */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">🤖 AI Analysis</h2>
                <div className="bg-gray-50 p-4 rounded-md min-h-48">
                    {isLoading && <SkeletonLoader />}
                    {result && <FormattedAnalysis text={result} />}
                    {!isLoading && !result && <p className="text-gray-500">Click "Analyze for Damage" to see the AI diagnosis.</p>}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default VisualAssistantPage;