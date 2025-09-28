// src/components/Navbar.jsx
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-gray-800">🚀 AURA</Link>
          <div className="space-x-4">
            <Link to="/" className="text-gray-600 hover:text-blue-600">Dashboard</Link>
            <Link to="/visual-assist" className="text-gray-600 hover:text-blue-600">Visual Assist</Link>
            <Link to="/audio-assist" className="text-gray-600 hover:text-blue-600">Audio Assist</Link>
            <Link to="/reports" className="text-gray-600 hover:text-blue-600">Reports</Link>
            <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Login</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;