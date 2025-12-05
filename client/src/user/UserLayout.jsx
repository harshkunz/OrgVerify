import React, { useState, useEffect, useRef } from "react";
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
import ThemeToogler from "../pages/ThemeToogler";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import ChatPage from "./UserChatPage";


const authUrl = import.meta.env.VITE_AUTH_ROUTE;

const UserLayout = ({ children }) => {
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


  const handleUserLogout = async () => {
    try {
      await axios.get(`${authUrl}/logout`, {
        withCredentials: true,
      });
      localStorage.removeItem("token");
      setCurrentUser(null);
      
      Swal.fire({
        title: "Success",
        text: "User Logout Successful!",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
      });
      navigate("/");
    } catch (error) {
      Swal.fire("Error", "User Logout Failed", "error");
    }
  };


  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${authUrl}/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setCurrentUser(res.data?.user || null);
      } catch (err) {
        console.error("Error fetching user:", err);
        const timer = setTimeout(() => {
          navigate("/");
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
            You need to be logged in to access the user dashboard.
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
            User Panel
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToogler />

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
                  onClick={handleUserLogout}
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
          <SidebarItem icon={<Home />} text="Dashboard" />
          <SidebarItem icon={<BarChart />} text="Analytics" />
          <SidebarItem icon={<FileCheck />} text="Verifications" />
          <SidebarItem icon={<Settings />} text="Settings" />
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
          className="fixed bottom-4 right-4 z-50 w-full max-w-2xl h-[70vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col border dark:border-gray-700"
        >
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
            <h3 className="font-semibold text-lg">User Chat</h3>
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

          <div
            className={`flex-1 overflow-hidden transition-all duration-300 ${
              chatMinimized ? "h-0" : "h-full"
            }`}
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



export default UserLayout;
