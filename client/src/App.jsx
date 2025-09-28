import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import VisualAssistantPage from './pages/VisualAssistantPage';
import AudioAssistantPage from './pages/AudioAssistantPage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';

// NOTE: You can remove SessionContext if it's no longer used, 
// but it's kept here to avoid breaking other potential dependencies.

function App() {
  return (
    <Router>
      {/* The main div no longer has a light background, allowing pages to control their own styling. */}
      <div className="min-h-screen font-sans">
        <Navbar />
        {/* The main element no longer has container/padding styles, giving pages full width. */}
        <main>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/visual-assist" element={<VisualAssistantPage />} />
            <Route path="/audio-assist" element={<AudioAssistantPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;