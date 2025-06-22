// src/components/UnreadMessages.jsx

import { useMemo } from "react";
import PropTypes from "prop-types";

// Helper function to format timestamps for display
const formatTimestamp = (timestampStr) => {
    if (!timestampStr) return "";
    const messageDate = new Date(timestampStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const messageDay = new Date(messageDate);
    messageDay.setHours(0, 0, 0, 0);

    if (messageDay.getTime() === today.getTime()) {
        return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    if (messageDay.getTime() === yesterday.getTime()) {
        return "Yesterday";
    }
    return messageDate.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function UnreadMessages({ conversations = [], onSelectChat, searchTerm = "" }) {
  // Filter the conversations based on the search term from the parent component
  const filteredConversations = useMemo(() => {
    return conversations
      .filter(conv => 
        (conv.contactName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conv.content || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [conversations, searchTerm]);

  return (
    <div className="max-w-lg mx-auto font-poppins bg-white flex flex-col">
      <div className="flex-1">
        {filteredConversations.length === 0 ? (
          <p className="text-center text-gray-500 mt-4 px-4">
            {searchTerm ? 'No results found.' : 'All caught up! No unread messages.'}
          </p>
        ) : (
          filteredConversations.map((conv) => (
            <div 
              key={conv.id} 
              className="cursor-pointer px-4 py-2 border-b flex justify-between items-center transition bg-white hover:bg-gray-100" 
              onClick={() => onSelectChat(conv)}
            >
              <div className="flex items-start w-full">
                <div className="p-2 px-4 mr-2 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {(conv.contactName || "?")[0].toUpperCase()}
                </div>
                <div className="flex justify-between items-start w-full">
                  <div>
                    <p className="font-medium text-gray-900 mb-1 text-sm">{conv.contactName || conv.msisdn}</p>
                    <p className="text-gray-500 text-xs truncate max-w-[270px]">{conv.content}</p>
                  </div>
                  <div className="ml-auto flex items-center shrink-0 pl-2">
                    <p className="text-sm text-gray-400">{formatTimestamp(conv.timestamp)}</p>
                    {/* The blue dot is always present for unread messages */}
                    <span className="ml-2 w-3 h-3 bg-blue-500 rounded-full"></span>
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

UnreadMessages.propTypes = {
  conversations: PropTypes.array.isRequired,
  onSelectChat: PropTypes.func.isRequired,
  searchTerm: PropTypes.string,
};