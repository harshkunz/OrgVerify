// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import io from "socket.io-client";

// const chatapi = import.meta.env.VITE_CHAT_ROUTE;
// const ChatPage = ({ currentUser }) => {
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [users, setUsers] = useState([]);
//   const [admins, setAdmins] = useState([]);
//   const [isTyping, setIsTyping] = useState(false);
//   const socketRef = useRef(null);
//   const messagesEndRef = useRef(null);

//   // Initialize socket connection
//   useEffect(() => {
//     socketRef.current = io("http://localhost:5000", {
//       auth: {
//         token: localStorage.getItem("token"),
//       },
//     });

//     // Set up event listeners
//     socketRef.current.on("receive-message", (message) => {
//       setMessages((prev) => [...prev, message]);
//     });

//     socketRef.current.on("typing", ({ isTyping }) => {
//       setIsTyping(isTyping);
//     });

//     return () => {
//       if (socketRef.current) {
//         socketRef.current.disconnect();
//       }
//     };
//   }, []);

//   // Load users list
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const res = await axios.get(`${chatapi}/admin/all-users`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
//           },
//         });
//         setUsers(res.data.users);
//         setAdmins(res.data.admins);
//       } catch (err) {
//         console.error("Error fetching users:", err);
//       }
//     };

//     fetchUsers();
//   }, []);

//   // Load conversation when user is selected
//   useEffect(() => {
//     const fetchConversation = async () => {
//       if (!selectedUser) return;

//       try {
//         const res = await axios.get(
//           `${chatapi}/conversation/${selectedUser._id}`,
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
//             },
//           }
//         );
//         setMessages(res.data);
//       } catch (err) {
//         console.error("Error fetching conversation:", err);
//       }
//     };

//     fetchConversation();
//   }, [selectedUser]);

//   // Auto-scroll to bottom
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);
//   const handleSendMessage = async () => {
//     if (!newMessage.trim() || !selectedUser) return;

//     const tempId = Date.now().toString();
//     const tempMessage = {
//       _id: tempId,
//       sender: currentUser,
//       recipient: selectedUser,
//       content: newMessage,
//       createdAt: new Date(),
//       read: false,
//       isTemp: true, // Add a flag for temporary messages
//     };

//     // Optimistically add the message
//     setMessages((prev) => [...prev, tempMessage]);
//     setNewMessage("");

//     try {
//       // Socket emit
//       socketRef.current.emit("send-message", {
//         recipientId: selectedUser._id,
//         content: newMessage,
//       });

//       // HTTP send
//       const payload = {
//         recipientId: selectedUser._id,
//         recipientModel: selectedUser.role === "admin" ? "Admin" : "User",
//         chatType: currentUser.role === "admin" ? "support" : "direct",
//         content: newMessage,
//       };

//       const res = await axios.post(`${chatapi}/send`, payload, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
//         },
//       });

//       // Replace temp message with server response
//       setMessages((prev) => prev.map((m) => (m._id === tempId ? res.data : m)));
//     } catch (err) {
//       console.error("Error sending message:", err);
//       // Remove the temp message if send fails
//       setMessages((prev) => prev.filter((m) => m._id !== tempId));
//     }
//   };

//   const handleTyping = (isTyping) => {
//     if (!selectedUser) return;
//     socketRef.current.emit("typing", {
//       recipientId: selectedUser._id,
//       isTyping,
//     });
//   };

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar */}
//       {/* Sidebar */}
//       <div className="w-1/4 bg-white border-r">
//         <div className="p-4 border-b">
//           <h2 className="text-xl font-semibold">
//             {currentUser.role === "admin" ? "All Users & Admins" : "Chats"}
//           </h2>
//         </div>
//         <div className="overflow-y-auto h-[calc(100vh-60px)]">
//           {[...admins, ...users].map((user) => (
//             <div
//               key={user._id}
//               className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
//                 selectedUser?._id === user._id ? "bg-blue-50" : ""
//               }`}
//               onClick={() => {
//                 setSelectedUser(user);
//                 setMessages([]); // clear previous messages
//               }}
//             >
//               <p className="font-medium">
//                 {user.firstName} {user.lastName}
//               </p>
//               <p className="text-sm text-gray-500">{user.email}</p>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Chat Area */}
//       <div className="flex-1 flex flex-col">
//         {selectedUser ? (
//           <>
//             <div className="p-4 border-b border-gray-200 bg-white">
//               <div className="flex items-center">
//                 <div>
//                   <p className="font-medium">
//                     {selectedUser.firstName} {selectedUser.lastName}
//                   </p>
//                   <p className="text-sm text-gray-500">
//                     {isTyping ? "typing..." : ""}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
//               {messages.map((message) => (
//                 <div
//                   key={message._id}
//                   className={`mb-4 max-w-[70%] p-3 rounded-lg ${
//                     message.sender._id === currentUser._id
//                       ? "bg-blue-500 text-white ml-auto"
//                       : "bg-white mr-auto"
//                   }`}
//                 >
//                   <p>{message.content}</p>
//                   <p className="text-xs mt-1 opacity-80">
//                     {new Date(message.createdAt).toLocaleTimeString([], {
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}
//                   </p>
//                 </div>
//               ))}
//               <div ref={messagesEndRef} />
//             </div>

//             <div className="p-4 border-t border-gray-200 bg-white">
//               <div className="flex gap-2">
//                 <input
//                   type="text"
//                   value={newMessage}
//                   onChange={(e) => {
//                     setNewMessage(e.target.value);
//                     handleTyping(e.target.value.length > 0);
//                   }}
//                   onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
//                   placeholder="Type a message..."
//                   className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 <button
//                   onClick={handleSendMessage}
//                   className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   Send
//                 </button>
//               </div>
//             </div>
//           </>
//         ) : (
//           <div className="flex items-center justify-center h-full">
//             <div className="text-center p-8">
//               <h3 className="text-xl font-medium text-gray-500 mb-2">
//                 Select a user to start chatting
//               </h3>
//               <p className="text-gray-400">Choose from the list on the left</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ChatPage;


import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import io from "socket.io-client";
import { Send, Smile, Image, X, MessageSquare } from "lucide-react";
import PropTypes from 'prop-types';
import { useMemo } from "react";

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

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(`${baseUrl}`, {
      auth: {
        token: localStorage.getItem("adminToken"),
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

          socketRef.current.on('receive-message', (message) => {
        if (message.sender._id === selectedUser?._id || message.recipient._id === currentUser._id) {
          setMessages(prev => [...prev, message]);
        }
      });

    const handleMessage = (message) => {
      setMessages(prev => {
        if (!prev.some(m => m._id === message._id)) {
          return [...prev, message];
        }
        return prev;
      });
    };

    socketRef.current.on("receive-message", handleMessage);
    socketRef.current.on("typing", ({ isTyping }) => setIsTyping(isTyping));
    socketRef.current.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      setError("Connection error. Please refresh.");
    });

    return () => {
      socketRef.current.off("receive-message", handleMessage);
      socketRef.current.disconnect();
      clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  // Load users list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${chatapi}/admin/all-users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        });
        setUsers(res.data.users);
        setAdmins(res.data.admins);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load contacts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // // Load conversation when user is selected
  // useEffect(() => {
  //   const fetchConversation = async () => {
  //     if (!selectedUser) return;

  //     try {
  //       setIsLoading(true);
  //       const res = await axios.get(
  //         `${chatapi}/conversation/${selectedUser._id}`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
  //           },
  //         }
  //       );
  //       setMessages(res.data);
  //     } catch (err) {
  //       console.error("Error fetching conversation:", err);
  //       setError("Failed to load conversation");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //     fetchConversation();
  // }, [selectedUser]);

  useEffect(() => {
  const fetchConversation = async () => {
    if (!selectedUser) return;

    try {
      setIsLoading(true);
      const res = await axios.get(
        `${chatapi}/conversation/${selectedUser._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching conversation:", err);
      setError("Failed to load conversation");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  fetchConversation();

  // Set up interval for refreshing
  const refreshInterval = setInterval(fetchConversation, 10000);

  // Clean up interval when component unmounts or selectedUser changes
  return () => clearInterval(refreshInterval);
}, [selectedUser]);

  // Auto-scroll to bottom
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
    handleTyping(false); // Clear typing indicator

    try {
      socketRef.current.emit("send-message", {
        recipientId: selectedUser._id,
        content: newMessage,
      });

      const payload = {
        recipientId: selectedUser._id,
        recipientType: "User",
        content: newMessage
      };

      const res = await axios.post(`${chatapi}/send`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      setMessages((prev) => prev.map((m) => 
        m._id === tempId ? { ...res.data, isTemp: false } : m
      ));
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setError("Failed to send message");
    }
  };

  const handleTyping = useCallback((isTyping) => {
    if (!selectedUser) return;
    
    clearTimeout(typingTimeoutRef.current);
    
    if (isTyping) {
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
  }, [selectedUser]);

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [messages]);

  return (
    <div className="flex h-full bg-white dark:bg-gray-800">
      {/* Sidebar */}
      <div className="w-2/5 border-r dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold dark:text-gray-200">
            {currentUser.role === "admin" ? "Contacts" : "Chats"}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {[...admins, ...users].map((user) => (
            <div
              key={user._id}
              className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                selectedUser?._id === user._id ? "bg-blue-50 dark:bg-gray-600" : ""
              }`}
              onClick={() => {
                setSelectedUser(user);
                setMessages([]);
              }}
            >
              <p className="font-medium dark:text-gray-200">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
                {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p>{error}</p>
          </div>
        )}
        
 
        {selectedUser ? (
          <>
            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-700">
              <div>
                
                <p className="font-medium dark:text-gray-200">
                  {selectedUser.firstName} {selectedUser.lastName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isTyping ? "typing..." : "online"}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.sender._id === currentUser._id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl ${
                      message.sender._id === currentUser._id
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-gray-700 dark:text-gray-200"
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs mt-2 opacity-80">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex gap-2">
                <button className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400">
                  <Smile className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400">
                  <Image className="w-5 h-5" />
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
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center p-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
                Select a contact to start chatting
              </h3>
              <p className="text-gray-400 dark:text-gray-500">
                Choose from the list on the left
              </p>
            </div>
          </div>
        )}
      </div>
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