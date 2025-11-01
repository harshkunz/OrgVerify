import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Bell,
  User,
  Building2,
  Home,
  FileText,
  ShieldCheck,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import UserChatPage from "./UserChatPage";
import axios from "axios";
import {
  FaFacebook,
  FaLinkedin,
  FaMapMarkerAlt,
  FaTwitter,
} from "react-icons/fa";
import Swal from "sweetalert2";
import LoadingSpinner from "../pages/LoadingSpinner";
import { FiLogOut, FiSettings } from "react-icons/fi";

const authurl = import.meta.env.VITE_AUTH_ROUTE;
const authURL = import.meta.env.VITE_ADMIN_ROUTE;
const URL = import.meta.env.VITE_BACKEND_URL;

const UserLayout = ({ children }) => {
  const [preview, setPreview] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const sidebarRef = useRef();
  const chatRef = useRef();
  const navigate = useNavigate();

  // Theme handling
  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest('[aria-label="Toggle Sidebar"]')
      ) {
        setIsSidebarOpen(false);
      }

      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setShowChat(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const res = await axios.get(`${authurl}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCurrentUser(res.data);
        setPreview(res.data.photo || "");
      } catch (err) {
        console.error("Error fetching current user:", err);
        navigate("/login", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  // Handle logout
  const handleLogout = async () => {
    try {
      const swalInstance = Swal.fire({
        title: "Logging out...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        await axios.get(`${authURL}/logout`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      } catch (serverError) {
        console.warn(
          "Server logout failed, proceeding with client-side cleanup:",
          serverError
        );
      }

      localStorage.removeItem("token");
      sessionStorage.removeItem("tempData");
      setCurrentUser(null);

      await Swal.fire({
        title: "Logged Out",
        html:
          '<div style="text-align: center;">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #10b981; margin: 0 auto 16px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>' +
          '<p style="margin: 0; font-size: 16px; color: #374151;">You have been successfully logged out</p>' +
          "<p style=\"margin-top: 8px; font-size: 14px; color: #6b7280;\">Your session has been cleared</p>" +
          "</div>",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        showClass: {
          popup: "animate__animated animate__fadeIn animate__faster",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOut animate__faster",
        },
      });

      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
      Swal.fire({
        icon: "error",
        title: "Logout Failed",
        text: "Something went wrong during logout. Please try again.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const navItems = [
    { name: "Dashboard", icon: Home, path: "/dashboard" },
    { name: "My Profile", icon: User, path: "/user/profile" },
    { name: "Verification Status", icon: ShieldCheck, path: "/verification" },
    { name: "Documents", icon: FileText, path: "/documents" },
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
          {/* Logo & Brand */}
          <Link
            to="/dashboard"
            className="flex items-center space-x-3 group hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-400 rounded-lg group-hover:from-blue-700 group-hover:to-blue-600 dark:group-hover:from-blue-600 dark:group-hover:to-blue-500 transition-all duration-300 shadow-sm">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              OrgVerify
            </span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle Theme"
            >
              {darkMode ? (
                <svg
                  className="w-5 h-5 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {/* Chat Button */}
            <button
              onClick={() => setShowChat(!showChat)}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Support Chat"
            >
              <MessageSquare className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative group">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle Sidebar"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-500"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {currentUser?.firstName?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${
                    isSidebarOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle Sidebar"
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* User Dropdown Menu */}
        {isSidebarOpen && (
          <div
            ref={sidebarRef}
            className="absolute right-4 top-16 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50"
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {currentUser?.firstName} {currentUser?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {currentUser?.email}
              </p>
            </div>

            {/* Navigation Links */}
            <div className="py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 py-2">
              <Link
                to="/user/settings"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FiSettings className="w-4 h-4" />
                <span className="text-sm">Account Settings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <FiLogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Chat Window */}
      {showChat && (
        <div
          ref={chatRef}
          className="fixed bottom-4 right-4 w-96 h-[32rem] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col overflow-hidden"
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600">
            <h3 className="font-semibold text-lg text-white">
              OrgVerify Support Chat
            </h3>
            <button
              onClick={() => setShowChat(false)}
              className="text-white hover:bg-white/20 rounded p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-hidden">
            <UserChatPage currentUser={currentUser} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-6">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-950 text-white py-8 px-4 md:px-6 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">OrgVerify Platform</h3>
            <p className="text-gray-300 mb-4">
              Secure organization verification and employee management system.
            </p>
            <p className="text-sm text-gray-400 mb-2">
              Email: support@orgverify.com
            </p>
            <p className="text-sm text-gray-400">Phone: +251 XX XXX XXXX</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/verify"
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                >
                  Verify Credentials
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                >
                  About Platform
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                >
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com/orgverify"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-blue-400 transition-colors"
              >
                <FaFacebook size={24} />
              </a>
              <a
                href="https://twitter.com/orgverify"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-blue-400 transition-colors"
              >
                <FaTwitter size={24} />
              </a>
              <a
                href="https://linkedin.com/company/orgverify"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-blue-400 transition-colors"
              >
                <FaLinkedin size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="max-w-7xl mx-auto mt-8 pt-4 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} OrgVerify Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;