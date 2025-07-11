// src/components/InProgressMessages.jsx

import { useMemo } from "react";
import PropTypes from "prop-types";

// Helper function to format timestamps for display
const formatTimestamp = (timestampStr) => {

   if (!timestampStr) return "";
    const date = new Date(timestampStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const messageDay = new Date(date);
    messageDay.setHours(0, 0, 0, 0);

    if (messageDay.getTime() === today.getTime()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    if (messageDay.getTime() === yesterday.getTime()) {
        return "Yesterday";
    }
    return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
};

export default function InProgressMessages({ conversations = [], onSelectChat, activeChat, searchTerm = "" }) {
  
  const filteredConversations = useMemo(() => {
    return conversations
      .filter(conv => (conv.contactName || '').toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        // 1. If an active chat is selected, bring it to the top.
        if (activeChat) {
          if (a.id === activeChat.id) return -1; // a should come first
          if (b.id === activeChat.id) return 1;  // b should come first
        }
        // 2. For all other items, sort by the most recent message timestamp.
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
  }, [conversations, searchTerm, activeChat]);

  return (
    <div className="max-w-lg mx-auto font-poppins bg-white flex flex-col">
      <div className="flex-1">
        {filteredConversations.length === 0 ? (
          <p className="text-center text-gray-500 mt-4 px-4">
            {searchTerm ? 'No results found.' : 'No in-progress conversations.'}
          </p>
        ) : (
          filteredConversations.map((conv) => (
            <div 
              key={conv.id} 
              className={`cursor-pointer px-4 py-2 border-b flex justify-between items-center transition ${
                activeChat?.id === conv.id ? "bg-gray-100" : "bg-white hover:bg-gray-100"
              }`} 
              onClick={() => onSelectChat(conv)}
            >
              <div className="flex items-start w-full">
                <div className="p-2 px-4 mr-2 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {(conv.contactName || "?")[0].toUpperCase()}
                </div>
                <div className="flex justify-between items-start w-full">
                  <div>
                    <p className="font-medium text-gray-900 mb-1 text-sm">{conv.contactName || conv.msisdn}</p>
                    <p className="text-gray-500 text-[11px] truncate max-w-[230px]">{conv.content}</p>
                  </div>
                  <div className="ml-auto flex items-center shrink-0 pl-2">
                    <p className="text-xs text-gray-400 whitespace-nowrap">{formatTimestamp(conv.timestamp)}</p>
                    {conv.hasNewMessage && activeChat?.id !== conv.id && (
                        <span className="ml-2 w-3 h-3 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

InProgressMessages.propTypes = {
  conversations: PropTypes.array.isRequired,
  onSelectChat: PropTypes.func.isRequired,
  activeChat: PropTypes.object,
  searchTerm: PropTypes.string,
};