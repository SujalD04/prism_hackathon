import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import { 
  FileText, Smartphone, BarChartBig, Camera, Mic, 
  AlertTriangle, Loader2, SearchX, Download 
} from 'lucide-react';

// --- Components ---
const FormattedAnalysis = ({ text }) => {
  if (!text || typeof text !== 'string') 
    return <p className="text-gray-400">No visual analysis data available.</p>;

  const sections = text.split('**').filter(s => s.trim() !== '');
  const analysis = {};
  for (let i = 0; i < sections.length; i += 2) {
    if (sections[i] && sections[i + 1]) {
      analysis[sections[i].replace(':', '').trim()] = sections[i + 1].trim();
    }
  }

  return (
    <div className="space-y-1">
      {Object.entries(analysis).map(([key, value]) => (
        <div key={key}>
          <h4 className="text-sm font-semibold text-blue-400">{key}</h4>
          <p className="text-gray-300">{value}</p>
        </div>
      ))}
    </div>
  );
};

const ReportCard = ({ icon: Icon, title, children }) => (
  <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
    <div className="flex items-center gap-2 mb-2">
      <Icon size={18} className="text-blue-400"/>
      <h3 className="font-semibold text-white">{title}</h3>
    </div>
    <div className="pl-2 border-l-2 border-slate-700">{children}</div>
  </div>
);

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center text-center h-full text-gray-400">
    <Loader2 className="animate-spin h-12 w-12 mb-4 text-blue-400" />
    <p className="font-semibold">Loading report...</p>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center text-center h-full text-gray-400">
    <SearchX className="h-16 w-16 mb-4 text-slate-500" />
    <h2 className="text-2xl font-bold text-white mb-2">No Active Report Found</h2>
    <p>Start a new device simulation to generate a report.</p>
  </div>
);

// --- Main Page ---
const ReportsPage = () => {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const reportId = localStorage.getItem('aura_reportId');

  useEffect(() => {
    if (!reportId) {
      setIsLoading(false);
      return;
    }

    axios.get(`http://localhost:5001/api/reports/${reportId}`)
      .then(res => setReport(res.data))
      .catch(err => console.error("Failed to fetch report:", err))
      .finally(() => setIsLoading(false));
  }, [reportId]);

  // --- PDF Generation ---
    const generatePDF = () => {
    if (!report) return;
    const { finalStatus, rootCause, summary, device, evidence } = report;

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let y = margin;

    // --- Dark Background ---
    pdf.setFillColor(20, 20, 20);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // --- Header ---
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AURA Diagnostic Report', pageWidth / 2, y, { align: 'center' });
    y += 12;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Device: ${device}`, margin, y);
    pdf.text(`Report ID: ${reportId}`, pageWidth - margin, y, { align: 'right' });
    y += 10;

    // --- Overall Verdict ---
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(finalStatus === 'Critical' ? 255 : 255, finalStatus === 'Critical' ? 50 : 200, 50);
    pdf.text(`Overall Verdict: ${finalStatus}`, margin, y);
    y += 8;

    pdf.setFontSize(12);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Root Cause: ${rootCause || 'N/A'}`, margin, y);
    y += 8;

    pdf.text('AI Recommended Action:', margin, y);
    y += 6;
    const splitSummary = pdf.splitTextToSize(summary || 'No summary available.', pageWidth - 2 * margin);
    splitSummary.forEach(line => {
        if (y > pageHeight - margin) pdf.addPage(), y = margin;
        pdf.text(line, margin + 5, y);
        y += 6;
    });
    y += 4;

    // --- Utility function to draw section as "card" ---
    const drawSection = (title, contentArray) => {
        // Add page if needed
        if (y > pageHeight - 40) pdf.addPage(), y = margin;

        // Draw section box
        const boxHeight = contentArray.length * 6 + 16; // estimate height
        pdf.setFillColor(40, 40, 40); // dark card background
        pdf.roundedRect(margin, y, pageWidth - 2 * margin, boxHeight, 3, 3, 'F');

        // Section title
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(100, 200, 255);
        pdf.text(title, margin + 5, y + 7);

        // Section content
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(255, 255, 255);
        let contentY = y + 12;
        contentArray.forEach(line => {
        const split = pdf.splitTextToSize(line, pageWidth - 2 * margin - 10);
        split.forEach(txt => {
            if (contentY > pageHeight - margin) pdf.addPage(), contentY = margin + 12;
            pdf.text(txt, margin + 7, contentY);
            contentY += 6;
        });
        contentY += 2;
        });

        y = contentY + 6;
    };

    // --- Evidence Sections ---
    drawSection('Log & Predictive Analysis', [evidence?.logAnalysis || 'No log data available.']);
    drawSection('Visual Inspection', evidence?.visualAnalysis ? evidence.visualAnalysis.split('\n') : ['No visual evidence.']);
    drawSection('User Audio Report', [evidence?.audioTranscript || 'No user audio report was provided.']);

    // --- Save PDF ---
    pdf.save(`AURA_Report_${reportId}.pdf`);
    };


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
        {/* Header & Download */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <FileText size={32} className="text-blue-400"/>
              <h1 className="text-4xl font-bold text-white">Diagnostic Report</h1>
            </div>
            <div className="flex items-center gap-2 mt-2 text-gray-400">
              <Smartphone size={16} />
              <p className="font-medium capitalize">{device}</p>
              <span className="text-slate-600">|</span>
              <p>ID: {reportId}</p>
            </div>
          </div>
          <button 
            onClick={generatePDF}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <Download size={16}/> Download PDF
          </button>
        </div>

        {/* Summary Card */}
        <div className={`p-6 rounded-xl border ${isCritical ? 'border-red-500/40 bg-red-500/10' : 'border-amber-500/40 bg-amber-500/10'}`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className={isCritical ? 'text-red-500' : 'text-amber-400'} size={24}/>
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
    <div className="bg-slate-900 min-h-screen p-4 sm:p-6 lg:p-8 font-sans flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-grow">
        {renderReportContent()}
      </div>
    </div>
  );
};

export default ReportsPage;
