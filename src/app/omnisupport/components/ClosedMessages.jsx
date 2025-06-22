// src/components/ClosedMessages.jsx

import { useMemo } from "react";
import PropTypes from "prop-types";

const formatTimestamp = (timestampStr) => {
    if (!timestampStr) return "";
    const date = new Date(timestampStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    }
    return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
};

// This is now a simple "presentational" component
export default function ClosedMessages({ conversations = [], onSelectChat, activeChat, searchTerm = "" }) {
  
  // Filtering and sorting logic now happens on the prop that is passed down
  const filteredConversations = useMemo(() => {
    return conversations
      .filter(conv => (conv.contactName || '').toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [conversations, searchTerm]);

  return (
    <div className="max-w-lg mx-auto font-poppins bg-white flex flex-col">
      <div className="flex-1">
        {filteredConversations.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">{searchTerm ? 'No results found.' : 'No closed conversations.'}</p>
        ) : (
          filteredConversations.map((conv) => (
            <div key={conv.id} className={`cursor-pointer px-4 py-2 border-b flex justify-between items-center transition ${activeChat?.id === conv.id ? "bg-gray-100" : "bg-white hover:bg-gray-50"}`} onClick={() => onSelectChat(conv)}>
              <div className="flex items-start w-full opacity-70">
                <div className="p-2 px-4 mr-2 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold text-lg">{(conv.contactName || "?")[0].toUpperCase()}</div>
                <div className="flex justify-between items-start w-full">
                  <div>
                    <p className="font-medium text-gray-700 mb-1 text-sm">{conv.contactName || conv.msisdn}</p>
                    <p className="text-gray-500 text-xs truncate max-w-[270px]">{conv.content}</p>
                  </div>
                  <div className="ml-auto flex items-center">
                    <p className="text-xs text-gray-400 whitespace-nowrap">{formatTimestamp(conv.timestamp)}</p>
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

ClosedMessages.propTypes = {
  conversations: PropTypes.array.isRequired,
  onSelectChat: PropTypes.func.isRequired,
  activeChat: PropTypes.object,
  searchTerm: PropTypes.string,
};