import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserShield, FaUser, FaChevronDown } from 'react-icons/fa';

const Navbar = () => {
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLoginDropdown(false);
      }
    };

    if (showLoginDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLoginDropdown]);

  return (
    <div className="flex justify-between items-center h-16 w-full">
      {/* Logo - Enhanced with Gradient */}
      <div className="flex-shrink-0">
        <Link 
          to="/" 
          className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 transition-all duration-300 bg-[length:200%_100%] hover:bg-right"
        >
          OrgVerify
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center space-x-6">
        <Link 
          to="/" 
          className="relative text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 group"
        >
          Home
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
        </Link>
        <Link 
          to="/about" 
          className="relative text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 group"
        >
          About
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
        </Link>
        <Link 
          to="/contact" 
          className="relative text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 group"
        >
          Contact
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
        </Link>

        {/* Login Dropdown - FIXED */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowLoginDropdown(!showLoginDropdown)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 active:scale-95"
          >
            <span>Login</span>
            <FaChevronDown 
              className={`w-3 h-3 transition-transform duration-300 ${
                showLoginDropdown ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {/* Dropdown Menu - Enhanced */}
          {showLoginDropdown && (
            <div className="absolute right-0 mt-3 w-60 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-blue-100 dark:border-gray-700 overflow-hidden z-50 animate-fadeIn">
              {/* User Login Option */}
              <Link
                to="/login"
                onClick={() => setShowLoginDropdown(false)}
                className="flex items-center space-x-3 px-4 py-3.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 group"
              >
                <div className="flex items-center justify-center w-11 h-11 bg-blue-100 dark:bg-blue-900 rounded-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <FaUser className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Login as User
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Access your account
                  </p>
                </div>
              </Link>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Admin Login Option */}
              <Link
                to="/admin-login"
                onClick={() => setShowLoginDropdown(false)}
                className="flex items-center space-x-3 px-4 py-3.5 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 group"
              >
                <div className="flex items-center justify-center w-11 h-11 bg-purple-100 dark:bg-purple-900 rounded-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <FaUserShield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Login as Admin
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Manage your organization
                  </p>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Sign Up Button - Enhanced */}
        <Link
          to="/signup"
          className="group relative px-5 py-2.5 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-300 font-medium text-sm shadow-sm hover:shadow-md hover:scale-105 active:scale-95 overflow-hidden"
        >
          <span className="relative z-10">Sign Up</span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;