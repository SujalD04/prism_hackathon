// src/App.jsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import VisualAssistantPage from './pages/VisualAssistantPage';
import AudioAssistantPage from './pages/AudioAssistantPage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
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
  );
}
export default App;