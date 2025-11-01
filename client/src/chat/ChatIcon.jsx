// ChatIcon.jsx
import React from 'react';
import { FaCommentDots } from 'react-icons/fa';

const ChatIcon = ({ unreadCount, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="relative p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
    >
      <FaCommentDots className="text-xl text-gray-700 dark:text-gray-300" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </button>
  );
};

export default ChatIcon;