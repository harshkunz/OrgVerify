import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  BellIcon,
  XMarkIcon,
  CheckIcon,
  IdentificationIcon,
  UserIcon,
  HashtagIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  const apiUrl = import.meta.env.VITE_ADMIN_ROUTE;

  const orgIdUrl = import.meta.env.VITE_ORG_ID_ROUTE || "http://localhost:6000";

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${apiUrl}/notifications`
      );
      console.log("Fetched notifications:", data);
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    const unread = notifications.filter((note) => !note.isRead).length;
    setUnreadCount(unread);
  }, [notifications]);

  useEffect(() => {
    fetchNotifications();

    // Real-time polling (every 30s)
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markNotificationAsRead = async (id) => {
    try {
      const { data } = await axios.put(`${apiUrl}/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((note) => (note._id === id ? { ...note, isRead: true } : note))
      );
      setUnreadCount((prev) => prev - 1);
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = useCallback(async () => {
    try {
      await axios.put(`${apiUrl}/notifications/mark-all-read`);
      setNotifications((prev) =>
        prev.map((note) => ({ ...note, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all as read:", err);
      setError("Failed to mark all notifications as read.");
    }
  }, [apiUrl]);

  // Fetch Organization ID when a notification is clicked
  const handleNotificationClick = useCallback(
    async (notification) => {
      try {
        const { firstName, middleName, lastName, gender } = notification;
        const response = await axios.get(`${orgIdUrl}/api/org-ids/search/name`, {
          params: { firstName, middleName, lastName, gender },
        });
        setSelectedOrgId(response.data);
      } catch (err) {
        console.error("Error fetching Organization ID:", err);
        setSelectedOrgId(null);
        setError("Failed to fetch Organization ID details.");
      }
    },
    [orgIdUrl]
  );

  // Delete a notification
  const handleDeleteNotification = useCallback(
    async (id) => {
      try {
        await axios.delete(`${apiUrl}/notifications/${id}`);
        setNotifications((prev) => prev.filter((note) => note._id !== id));
        setUnreadCount((prev) => prev - 1);
      } catch (err) {
        console.error("Error deleting notification:", err);
        setError("Failed to delete notification.");
      }
    },
    [apiUrl]
  );

  const handleNotificationItemClick = useCallback(
    (note) => {
      markNotificationAsRead(note._id);
      handleNotificationClick(note);
    },
    [markNotificationAsRead, handleNotificationClick]
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Trigger */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full relative hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Notifications"
      >
        <BellIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", damping: 20 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl ring-1 ring-black/10 dark:ring-gray-600 z-50"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Notifications {unreadCount > 0 && `(${unreadCount})`}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                  aria-label="Mark all as read"
                >
                  <CheckIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                  aria-label="Close"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {error && (
                <div className="p-4 text-center text-red-500 dark:text-red-400">
                  {error}
                  <button
                    onClick={fetchNotifications}
                    className="ml-2 text-blue-500 hover:underline"
                  >
                    Retry
                  </button>
                </div>
              )}

              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="p-4 border-b border-gray-100 dark:border-gray-700"
                  >
                    <div className="animate-pulse flex space-x-3">
                      <div className="rounded-full bg-gray-300 dark:bg-gray-600 h-3 w-3 mt-1" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No new notifications
                </div>
              ) : (
                notifications.map((note) => (
                  <motion.div
                    key={note._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${
                      !note.read
                        ? "bg-blue-50 dark:bg-gray-700"
                        : "hover:bg-gray-50 dark:hover:bg-gray-750"
                    }`}
                    onClick={() => handleNotificationItemClick(note)}
                  >
                    <div className="flex items-start">
                      <div
                        className={`flex-shrink-0 h-2 w-2 mt-2 rounded-full ${
                          note.type === "success"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                      <div className="ml-3 flex-1">
                        <p
                          className={`text-sm ${
                            note.type === "success"
                              ? "text-green-700 dark:text-green-400"
                              : "text-red-700 dark:text-red-400"
                          }`}
                        >
                          {note.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(note.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!note.read && (
                        <span className="ml-2 flex-shrink-0 inline-block h-2 w-2 rounded-full bg-blue-500" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(note._id);
                        }}
                        className="ml-2 flex-shrink-0 p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-700"
                        aria-label="Delete notification"
                      >
                        <XMarkIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {selectedOrgId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 flex items-center justify-center z-10  bg-opacity-50  bg-blur-md backdrop-blur-md"
                onClick={() => setSelectedOrgId(null)}
              >
                <motion.div
                  className="w-full max-w-md mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-gray-800 dark:text-gray-200 text-2xl font-semibold mb-4 ">Check details of  <span className="text-blue-500 ">{selectedOrgId.firstName} {selectedOrgId.middleName} {selectedOrgId.lastName}</span> </p>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border-2 border-blue-500">
                    {/* Organization ID Header */}
                    <div className="bg-blue-500 py-3 px-4 flex items-center">
                      <svg
                        className="h-8 w-8 text-white mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <h2 className="text-xl font-bold text-white">
                        ORGANIZATION ID CARD
                      </h2>
                    </div>

                    {/* ID Card Content */}
                    <div className="p-6">
                      <div className="flex items-start space-x-6 mb-6">
                        {/* Profile Image Placeholder */}
                        <div className="flex-shrink-0">
                          <div className="h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900 overflow-hidden border-2 border-blue-500 flex items-center justify-center">
                            {selectedOrgId.photo ? (
                              <img
                                src={selectedOrgId.photo}
                                alt="Profile"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <UserIcon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                            )}
                          </div>
                        </div>

                        {/* Personal Info */}
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                            {selectedOrgId.firstName}{" "}
                            {selectedOrgId.middleName}{" "}
                            {selectedOrgId.lastName}
                          </h3>

                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                ORGANIZATION ID
                              </p>
                              <p className="text-lg font-mono font-bold text-gray-800 dark:text-gray-200 truncate">
                                {selectedOrgId.orgIdNumber}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                GENDER
                              </p>
                              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 capitalize">
                                {selectedOrgId.gender}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                        <h4 className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-2">
                          CONTACT INFORMATION
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              PHONE NUMBER
                            </p>
                            <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                              {selectedOrgId.phone_no || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Address Section */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-2">
                          ADDRESS
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              STREET
                            </p>
                            <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                              {selectedOrgId.address?.street || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              CITY
                            </p>
                            <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                              {selectedOrgId.address?.city || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              STATE
                            </p>
                            <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                              {selectedOrgId.address?.state || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              COUNTRY
                            </p>
                            <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                              {selectedOrgId.address?.country || "Ethiopia"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              ZIP CODE
                            </p>
                            <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                              {selectedOrgId.address?.zipCode || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Issued by: Organization ID System
                        </div>
                        <button
                          onClick={() => setSelectedOrgId(null)}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(Notifications);
