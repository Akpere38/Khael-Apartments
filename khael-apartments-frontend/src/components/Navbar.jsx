// src/components/Navbar.jsx
// Navigation bar component

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const token = localStorage.getItem('adminToken');

  const handleLogout = () => {
    authAPI.logout();
    navigate('/admin/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <span className="text-xl font-bold text-dark">
              Khael Apartments
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {isAdminRoute ? (
              // Admin navigation
              <>
                {token && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className="text-dark hover:text-primary transition"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      Logout
                    </button>
                  </>
                )}
              </>
            ) : (
              // Public navigation
              <>
                <Link
                  to="/"
                  className="text-dark hover:text-primary transition font-medium"
                >
                  Home
                </Link>
                <a
                  href="/#about"
                  className="text-dark hover:text-primary transition font-medium"
                >
                  About Us
                </a>
                <a
                  href="/#contact"
                  className="text-dark hover:text-primary transition font-medium"
                >
                  Contact
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;