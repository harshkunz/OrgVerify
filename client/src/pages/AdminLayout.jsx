
import React, { useState, useEffect, useRef } from "react";
import AdminSidebar from "./AdminSidebar";
import ThemeToogler from "./ThemeToogler";
import Notifications from "./Notifications";
import { Menu, X, MessageSquare, ChevronDown } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import ChatPage from "../chat/ChatPage";

const authurl = import.meta.env.VITE_ADMIN_ROUTE
const userAuthUrl= import.meta.env.VITE_AUTH_ROUTE

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const sidebarRef = useRef();
  const chatRef = useRef();
  const navigate = useNavigate();



   // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
      if (chatRef.current && !chatRef.current.contains(event.target) && 
          !event.target.closest('.chat-trigger')) {
        setShowChat(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Click outside to close sidebar (mobile)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };
    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  // Logout
  const handleAdminLogout = async () => {
    try {
      await axios.get(`${authurl}/logout`, { 
        withCredentials: true 
      });
          localStorage.removeItem('adminToken');
      setCurrentUser(null); // Clear current user state
      Swal.fire("Success", "🎉 Admin Logout Successful!", "success");
      navigate("/admin/login");
    } catch (error) {
      Swal.fire("Error", "❌ Admin Logout Failed", "error");
    }
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${userAuthUrl}/me`, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('adminToken')}` 
          }
        });
        setCurrentUser(res.data);
      } catch (err) {
        console.error('Error fetching current user:', err);
        const timer = setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
        return () => clearTimeout(timer);
      }
    };
    fetchCurrentUser();
  }, []);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8">
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            You need to be logged in to view this certificate
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-40 flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            BUGCVS
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToogler />
          <Notifications />
          
          <button 
            onClick={() => setShowChat(!showChat)}
            className="chat-trigger relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <MessageSquare className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          {
            <div className="hidden md:flex items-center gap-2">
              <span className="text-gray-700 dark:text-gray-300">{currentUser.firstName}</span>
              <img
                src={currentUser.photo || "/default-avatar.png"}
                alt="Profile"
                className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700"
              />
            </div>
          }
          
          <button
            onClick={handleAdminLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-16 md:top-0 left-0 z-30 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <main 
      className={`pt-16 md:ml-64 transition-all duration-300 ${sidebarOpen ? 'blur-sm' : ''}`}>
        {children}
      </main>

      {/* Chat Window */}
      {showChat && (
        <div
          ref={chatRef}
          className="fixed bottom-4 right-4 z-50 w-full max-w-2xl h-[70vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col border dark:border-gray-700"
        >
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
            <h3 className="font-semibold text-lg">Admin Chat</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setChatMinimized(!chatMinimized)}
                className="p-1 hover:bg-black/10 rounded-md"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowChat(false)}
                className="p-1 hover:bg-black/10 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className={`flex-1 overflow-hidden transition-all duration-300 ${chatMinimized ? 'h-0' : 'h-full'}`}>
            <ChatPage currentUser={currentUser} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;