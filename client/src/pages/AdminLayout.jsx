import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  MessageSquare,
  ChevronDown,
  Home,
  Users,
  FileCheck,
  BarChart,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import ThemeToogler from "./ThemeToogler";
import Notifications from "./Notifications";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import ChatPage from "../chat/ChatPage";

const adminUrl = import.meta.env.VITE_ADMIN_ROUTE;
const authUrl = import.meta.env.VITE_AUTH_ROUTE;

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const sidebarRef = useRef();
  const chatRef = useRef();
  const navigate = useNavigate();


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
      if (
        chatRef.current &&
        !chatRef.current.contains(event.target) &&
        !event.target.closest(".chat-trigger")
      ) {
        setShowChat(false);
      }
      if (!event.target.closest(".profile-dropdown")) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


 useEffect(() => {
  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(`${authUrl}/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      setCurrentUser(res.data?.user || null);
    } catch (err) {
      console.error("Error fetching admin:", err);
      const timer = setTimeout(() => {
        navigate("/admin/login");
      }, 2000);
      return () => clearTimeout(timer);
    }
  };
  fetchCurrentUser();
}, []);

 
  const handleAdminLogout = async () => {
    try {
      await axios.get(`${adminUrl}/logout`, {
        withCredentials: true,
      });
      localStorage.removeItem("adminToken");
      setCurrentUser(null);

      Swal.fire({
        title: "Success",
        text: "Admin Logout Successful!",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
      });
      navigate("/");
      
    } catch (error) {
      Swal.fire("Error", "Admin Logout Failed", "error");
    }
  };


  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8">
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            You need to be logged in to access the admin dashboard.
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-40 flex items-center justify-between px-10 py-3 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className=" hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors md:hidden"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <span className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Panel
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToogler />
          <Notifications />

          {/* Chat Button */}
          <button
            onClick={() => setShowChat(!showChat)}
            className="chat-trigger relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <MessageSquare className="w-5.5 h-5.5 text-gray-500 dark:text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <div className="relative profile-dropdown">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors duration-200 p-1"
              aria-haspopup="true"
              aria-expanded={profileOpen}
            >
              <img
                src={"https://cdn-icons-png.flaticon.com/512/16683/16683419.png"}
                alt="Profile"
                className="w-7.5 h-7.5 rounded-full dark:border-gray-700"
                loading="lazy"
                decoding="async"
              />
            </button>

            {profileOpen && (
              <div
                className="absolute right-0 top-9 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 z-50"
                role="menu"
                aria-label="User profile options"
              >
                <p className="px-10 py-2 text-sm text-gray-800 dark:text-gray-200 truncate">
                  {`${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`.trim()}
                </p>
                <hr className="border-gray-100 dark:border-gray-700" />
                <button
                  onClick={handleAdminLogout}
                  className="w-full flex items-center gap-2 px-8 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-gray-700 rounded transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-red-100"
                  role="menuitem"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`
          group
          fixed top-16 md:top-0 left-0 z-30 h-screen
          bg-white dark:bg-gray-800 shadow-lg transition-all duration-400
          w-16 sm:w-28 ${sidebarOpen ? "w-60" : ""}
          sm:hover:w-60
          overflow-hidden

          flex flex-col justify-center
        `}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <nav className="flex flex-col justify-center flex-1 space-y-2 px-2 text-gray-700 dark:text-gray-300">
          <Link to="/admin/dashboard">
            <SidebarItem icon={<Home />} text="Dashboard" />
          </Link>
          <Link to="/admin/users">
            <SidebarItem icon={<Users />} text="Users & Organizations" />
          </Link>
          <SidebarItem icon={<BarChart />} text="Analytics" />
          <SidebarItem icon={<FileCheck />} text="Verifications" />
          <Link to="/admin/setting">
            <SidebarItem icon={<Settings />} text="Settings" />
          </Link>
          <SidebarItem icon={<HelpCircle />} text="Support" />
        </nav>
      </div>

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 px-4 sm:px-6 lg:px-8
        sm:ml-28 ${sidebarOpen ? "md:ml-62" : ""}
      `}
      >
        {children}
      </main>

      {/* Chat Window */}
      {showChat && (
        <div
          ref={chatRef}
          className="fixed bottom-5 right-5 z-50 w-full max-w-3xl
                    h-[460px] sm:h-[560px]
                    bg-white dark:bg-gray-900
                    rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700
                    flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3
                          bg-gradient-to-r from-blue-600 via-indigo-500 to-fuchsia-500
                          text-white">
            <h3 className="text-sm ">Admin Chat</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setChatMinimized(!chatMinimized)}
                className="p-1 hover:bg-white/10 rounded-md transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowChat(false)}
                className="p-1 hover:bg-white/10 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body (ChatPage) */}
          <div
            className={`flex-1 bg-gray-50 dark:bg-gray-950 transition-[max-height,opacity] duration-300
                        ${chatMinimized ? "max-h-0 opacity-0" : "max-h-full opacity-100"}`}
          >
            <ChatPage currentUser={currentUser} />
          </div>
        </div>
      )}

    </div>
  );
};

const SidebarItem = ({ icon, text }) => (
  <button
    className="
      flex items-center gap-3 w-full px-8 py-2 rounded-3xl
      hover:bg-gray-100 dark:hover:bg-gray-700 transition
      group
      items-center
      justify-start
    "
  >
    <span className="text-gray-600 dark:text-gray-300 text-xl flex-shrink-0">
      {icon}
    </span>
    <span className="text-xs text-gray-700 dark:text-gray-300
      opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out
      whitespace-nowrap
    ">
      {text}
    </span>
  </button>
);



export default AdminLayout;
