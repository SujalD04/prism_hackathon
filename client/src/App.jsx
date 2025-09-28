// src/App.jsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { createContext, useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import VisualAssistantPage from './pages/VisualAssistantPage';
import AudioAssistantPage from './pages/AudioAssistantPage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';

// Create a context to hold sessionId
export const SessionContext = createContext();

function App() {
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    let storedSession = localStorage.getItem('sessionId');
    if (!storedSession) {
      storedSession = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem('sessionId', storedSession);
    }
    setSessionId(storedSession);
  }, []);

  return (
    <SessionContext.Provider value={sessionId}>
      <Router>
        <div className="bg-gray-100 min-h-screen">
          <Navbar />
          <main className="container mx-auto p-8">
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
    </SessionContext.Provider>
  );
}

export default App;
