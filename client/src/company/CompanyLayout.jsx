import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Building2, Users, Settings, BarChart3, Bell, MessageSquare, ChevronDown } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import ThemeToogler from "../pages/ThemeToogler";
import Notifications from "../pages/Notifications";
import ChatPage from "../chat/ChatPage";

const authurl = import.meta.env.VITE_AUTH_ROUTE;
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const CompanyLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [company, setCompany] = useState(null);
  const sidebarRef = useRef();
  const chatRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndCompany = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const [userRes, companiesRes] = await Promise.all([
          axios.get(`${authurl}/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${backendUrl}/api/companies`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCurrentUser(userRes.data?.user || null);
        if (companiesRes.data.success && companiesRes.data.data.length > 0) {
          setCompany(companiesRes.data.data[0]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        navigate("/login");
      }
    };

    fetchUserAndCompany();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.get(`${authurl}/logout`, { withCredentials: true });
      localStorage.removeItem("token");
      setCurrentUser(null);
      Swal.fire("Success", "Logged out successfully", "success");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
      if (chatRef.current && !chatRef.current.contains(event.target) && !event.target.closest('.chat-trigger')) {
        setShowChat(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { name: "Dashboard", icon: BarChart3, path: "/company/dashboard" },
    { name: "Employees", icon: Users, path: "/company/employees" },
    { name: "Settings", icon: Settings, path: "/company/settings" },
  ];

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8">
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">Loading...</p>
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
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors md:hidden"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {company?.name || "Company Portal"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToogler />
          <Notifications />
          <button
            onClick={() => setShowChat(!showChat)}
            className="chat-trigger relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <MessageSquare className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-gray-700 dark:text-gray-300">
              {`${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`.trim()}
            </span>
            <img
              src={currentUser.photo || "/default-avatar.png"}
              alt="Profile"
              className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700"
            />
          </div>
          <button
            onClick={handleLogout}
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
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 md:hidden">
          <span className="font-semibold text-gray-800 dark:text-white">Menu</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="mt-4 space-y-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main className="pt-16 md:ml-64 transition-all duration-300">
        {children}
      </main>

      {/* Chat Window */}
      {showChat && (
        <div
          ref={chatRef}
          className="fixed bottom-4 right-4 z-50 w-full max-w-2xl h-[70vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col border dark:border-gray-700"
        >
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
            <h3 className="font-semibold text-lg">Company Chat</h3>
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
            {currentUser && <ChatPage currentUser={currentUser} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyLayout;

