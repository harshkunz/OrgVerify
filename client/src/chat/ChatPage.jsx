import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import io from "socket.io-client";
import { Send, Smile, Image, MessageSquare } from "lucide-react";
import PropTypes from "prop-types";

const chatapi = import.meta.env.VITE_CHAT_ROUTE;
const baseUrl = import.meta.env.VITE_BACKEND_URL;

const ChatPage = ({ currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Helpers
  const getInitials = (user) =>
    `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formatDay = (date) =>
    new Date(date).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });

  // Socket setup
  useEffect(() => {
    socketRef.current = io(`${baseUrl}`, {
      auth: { token: localStorage.getItem("adminToken") },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const handleMessage = (message) => {
      setMessages((prev) =>
        prev.some((m) => m._id === message._id) ? prev : [...prev, message]
      );
    };

    socketRef.current.on("receive-message", handleMessage);
    socketRef.current.on("typing", ({ isTyping }) => setIsTyping(isTyping));
    socketRef.current.on("connect_error", () =>
      setError("Connection error. Please refresh.")
    );

    return () => {
      socketRef.current.off("receive-message", handleMessage);
      socketRef.current.disconnect();
      clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  // Load contacts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${chatapi}/admin/all-users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
        });
        setUsers(res.data.users || []);
        setAdmins(res.data.admins || []);
      } catch {
        setError("Failed to load contacts");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Load conversation + poll every 10s
  useEffect(() => {
    const fetchConversation = async () => {
      if (!selectedUser) return;
      try {
        setIsLoading(true);
        const res = await axios.get(`${chatapi}/conversation/${selectedUser._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
        });
        setMessages(res.data || []);
      } catch {
        setError("Failed to load conversation");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversation();
    const refreshInterval = setInterval(fetchConversation, 10000);
    return () => clearInterval(refreshInterval);
  }, [selectedUser]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    const tempId = Date.now().toString();
    const tempMessage = {
      _id: tempId,
      sender: currentUser,
      recipient: selectedUser,
      content: newMessage,
      createdAt: new Date(),
      read: false,
      isTemp: true,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");
    handleTyping(false);

    try {
      socketRef.current.emit("send-message", {
        recipientId: selectedUser._id,
        content: newMessage,
      });

      const payload = {
        recipientId: selectedUser._id,
        recipientType: "User",
        content: newMessage,
      };

      const res = await axios.post(`${chatapi}/send`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });

      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? { ...res.data, isTemp: false } : m))
      );
    } catch {
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setError("Failed to send message");
    }
  };

  const handleTyping = useCallback(
    (typing) => {
      if (!selectedUser || !socketRef.current) return;

      clearTimeout(typingTimeoutRef.current);

      if (typing) {
        socketRef.current.emit("typing", {
          recipientId: selectedUser._id,
          isTyping: true,
        });

        typingTimeoutRef.current = setTimeout(() => {
          socketRef.current.emit("typing", {
            recipientId: selectedUser._id,
            isTyping: false,
          });
          setIsTyping(false);
        }, 2000);
      } else {
        socketRef.current.emit("typing", {
          recipientId: selectedUser._id,
          isTyping: false,
        });
        setIsTyping(false);
      }
    },
    [selectedUser]
  );

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    [messages]
  );

  const renderMessages = () => {
    let lastDay = null;

    return sortedMessages.map((message) => {
      const day = formatDay(message.createdAt);
      const isMine = message.sender._id === currentUser._id;
      const showDaySeparator = day !== lastDay;
      lastDay = day;

      return (
        <React.Fragment key={message._id}>
          {showDaySeparator && (
            <div className="flex justify-center my-2">
              <span className="px-3 py-1 text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 rounded-full">
                {day}
              </span>
            </div>
          )}
          <div className={`flex mb-2 ${isMine ? "justify-end" : "justify-start"}`}>
            <div
              className={[
                "relative max-w-[75%] px-3 py-2 rounded-2xl text-sm shadow-sm",
                isMine
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-white dark:bg-gray-700 dark:text-gray-100 rounded-bl-sm",
              ].join(" ")}
            >
              <p>{message.content}</p>
              <p className="text-[10px] mt-1 opacity-80 text-right">
                {formatTime(message.createdAt)}
              </p>
            </div>
          </div>
        </React.Fragment>
      );
    });
  };

  const contactSections = [
    { title: "Admins", list: admins },
    { title: "Users", list: users },
  ];

  return (
    <div className="flex h-[calc(100vh-70px)] bg-gray-50 dark:bg-gray-900 overflow-hidden dark:border-gray-700">
      {/* Sidebar */}
      <aside className="w-72 border-r dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col">
        <div className="px-4 py-2 border-b dark:border-gray-800">
          <h2 className="text-sm mt-1 font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-1">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            {currentUser.role === "admin" ? "Contacts" : "Chats"}
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            {isLoading ? "Loading contacts..." : "Select a contact to start chat"}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {contactSections.map(
            ({ title, list }) =>
              list.length > 0 && (
                <div key={title}>
                  <p className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-wide text-gray-400">
                    {title}
                  </p>
                  {list.map((user) => {
                    const isActive = selectedUser?._id === user._id;
                    return (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() => {
                          setSelectedUser(user);
                          setMessages([]);
                          setError(null);
                        }}
                        className={[
                          "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                          isActive
                            ? "bg-blue-50 dark:bg-blue-900/30"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800",
                        ].join(" ")}
                      >
                        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-semibold text-blue-700 dark:text-blue-200">
                          {getInitials(user)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )
          )}
        </div>
      </aside>

      {/* Main chat area */}
      <section className="flex-1 flex flex-col">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 text-xs px-4 py-2">
            {error}
          </div>
        )}

        {selectedUser ? (
          <>
            {/* Header */}
            <header className="px-4 py-3 border-b dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-semibold text-blue-700 dark:text-blue-200">
                  {getInitials(selectedUser)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {isTyping ? "Typing..." : "Online"}
                  </p>
                </div>
              </div>
            </header>

            {/* Messages */}
            <main className="flex-1 overflow-y-auto px-4 py-3 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
              {sortedMessages.length === 0 && !isLoading && (
                <div className="h-full flex items-center justify-center">
                  <p className="text-xs text-gray-400">
                    No messages yet. Say hi to start the conversation.
                  </p>
                </div>
              )}
              {renderMessages()}
              <div ref={messagesEndRef} />
            </main>

            {/* Composer */}
            <footer className="px-4 py-3 border-t dark:border-gray-800 bg-white dark:bg-gray-950">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-800 transition-colors"
                >
                  <Smile className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-800 transition-colors"
                >
                  <Image className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping(e.target.value.length > 0);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-800 dark:text-gray-100 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-900"
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  className="p-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={!newMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-10">
            <div className="text-center px-6">
              <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Select a contact to start chatting
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Pick someone from the left panel to view conversation.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

ChatPage.propTypes = {
  currentUser: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    role: PropTypes.string.isRequired,
  }).isRequired,
};

export default ChatPage;
