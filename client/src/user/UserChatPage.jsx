import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Send, Smile, MessageSquare } from 'lucide-react';

const UserChatPage = ({ currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [admin, setAdmin] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = React.useRef(null);
  const messagesEndRef = React.useRef(null);
  
  const chatapi = import.meta.env.VITE_CHAT_ROUTE;

  // Fetch assigned admin
  const fetchAdmin = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${chatapi}/user/get-admin`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.data.success) {
        setAdmin(res.data.admin);
        await fetchConversation(res.data.admin._id);
      } else {
        setError('No admin available');
      }
    } catch (err) {
      console.error('Failed to fetch admin:', err);
      setError('Failed to connect to support');
    } finally {
      setLoading(false);
    }
  };

  // Fetch conversation with admin
  const fetchConversation = async (adminId) => {
    try {
      const res = await axios.get(`${chatapi}/user/conversations/${adminId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessages(res.data.conversation?.messages || []);
    } catch (err) {
      console.error('Failed to fetch conversation:', err);
    }
  };

  // Initialize socket connection
  useEffect(() => {
    if (!currentUser || !admin) return;

    socketRef.current = io(chatapi, {
      auth: { token: localStorage.getItem('token') },
    });

    socketRef.current.emit('join', { userId: currentUser._id });

    socketRef.current.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketRef.current.on('admin_typing', () => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [currentUser, admin]);

  useEffect(() => {
    fetchAdmin();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !admin) return;

    const messageData = {
      senderId: currentUser._id,
      receiverId: admin._id,
      message: newMessage,
      timestamp: new Date(),
    };

    try {
      socketRef.current.emit('send_message', messageData);
      setMessages((prev) => [...prev, messageData]);
      setNewMessage('');

      await axios.post(`${chatapi}/user/send-message`, messageData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleTyping = () => {
    if (socketRef.current && admin) {
      socketRef.current.emit('user_typing', { receiverId: admin._id });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <MessageSquare className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
        <p className="text-gray-600">Connecting you to OrgVerify support...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchAdmin}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b bg-white dark:bg-gray-800">
        <div className="flex items-center">
          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <p className="font-semibold">OrgVerify Support</p>
            <p className="text-sm text-gray-500">
              {admin ? `${admin.firstName} ${admin.lastName}` : 'Connecting...'}
              {isTyping && ' (typing...)'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-gray-500">Start your conversation with OrgVerify support</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.senderId === currentUser?._id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.senderId === currentUser?._id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              handleTyping();
              if (e.key === 'Enter') sendMessage();
            }}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserChatPage;