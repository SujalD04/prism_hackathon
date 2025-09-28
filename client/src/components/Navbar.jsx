import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinkClasses = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'text-white bg-blue-600'
        : 'text-gray-300 hover:bg-slate-700 hover:text-white'
    }`;

  const mobileNavLinkClasses = ({ isActive }) =>
     `block px-3 py-2 rounded-md text-base font-medium ${
      isActive 
        ? 'bg-blue-600 text-white' 
        : 'text-gray-300 hover:bg-slate-700 hover:text-white'
    }`;

  const menuVariants = {
    closed: { opacity: 0, y: -20, transition: { duration: 0.2 } },
    open: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  return (
    <nav className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <NavLink to="/" className="flex items-center gap-2 text-white text-xl font-bold">
              <Shield className="text-blue-400" />
              <span>AURA</span>
            </NavLink>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink to="/" className={navLinkClasses}>Dashboard</NavLink>
              <NavLink to="/visual-assist" className={navLinkClasses}>Visual Assist</NavLink>
              <NavLink to="/audio-assist" className={navLinkClasses}>Audio Assist</NavLink>
              <NavLink to="/reports" className={navLinkClasses}>Reports</NavLink>
              <NavLink to="/login" className="text-gray-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Login</NavLink>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-slate-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <NavLink to="/" className={mobileNavLinkClasses} onClick={() => setIsOpen(false)}>Dashboard</NavLink>
              <NavLink to="/visual-assist" className={mobileNavLinkClasses} onClick={() => setIsOpen(false)}>Visual Assist</NavLink>
              <NavLink to="/audio-assist" className={mobileNavLinkClasses} onClick={() => setIsOpen(false)}>Audio Assist</NavLink>
              <NavLink to="/reports" className={mobileNavLinkClasses} onClick={() => setIsOpen(false)}>Reports</NavLink>
              <NavLink to="/login" className={mobileNavLinkClasses} onClick={() => setIsOpen(false)}>Login</NavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;