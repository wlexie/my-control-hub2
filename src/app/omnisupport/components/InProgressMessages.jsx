// src/components/InProgressMessages.jsx

import { useMemo } from "react";
import PropTypes from "prop-types";
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { FaWhatsapp } from 'react-icons/fa';

// Helper function to get country code from MSISDN
const getCountryCode = (msisdn) => {
  if (!msisdn || typeof msisdn !== 'string') {
    return null;
  }

  // Ensure the MSISDN starts with a '+' for correct parsing.
  const formattedMsisdn = msisdn.startsWith('+') ? msisdn : `+${msisdn}`;

  try {
    const phoneNumber = parsePhoneNumberFromString(formattedMsisdn);
    if (phoneNumber && phoneNumber.country) {
      return phoneNumber.country;
    }
  } catch (error) {
    console.error("Error parsing phone number:", error);
  }
  return null;
};

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

const avatarColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-indigo-500',
  'bg-pink-500',
];

export default function InProgressMessages({ conversations = [], onSelectChat, activeChat, searchTerm = "" }) {

  const filteredConversations = useMemo(() => {
    return conversations
      .filter(conv => (conv.contactName || '').toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (activeChat) {
          if (a.id === activeChat.id) return -1;
          if (b.id === activeChat.id) return 1;
        }
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
  }, [conversations, searchTerm, activeChat]);

  return (
    // CHANGE: Added h-full to ensure the component has a defined height boundary from its parent
    <div className="max-w-lg mx-auto font-poppins bg-white flex   flex-col">
      <div className="flex-1">
        {filteredConversations.length === 0 ? (
          <p className="text-center text-gray-500 mt-4 px-4">
            {searchTerm ? 'No results found.' : 'No in-progress conversations.'}
          </p>
        ) : (
          filteredConversations.map((conv, index) => {
            const avatarColor = avatarColors[index % avatarColors.length];
            const countryCode = getCountryCode(conv.msisdn);
            const avatarText = (conv.contactName || conv.msisdn || "??").slice(0, 2).toUpperCase();

            const rowBgColor = activeChat?.id === conv.id
              ? "bg-gray-100"
              : index % 2 === 0
                ? "bg-white"
                : "bg-slate-50";

            return (
              <div
                key={conv.id}
                className={`cursor-pointer px-4 py-2 border-b flex justify-between items-center transition ${rowBgColor} hover:bg-gray-100`}
                onClick={() => onSelectChat(conv)}
              >
                <div className="flex items-start w-full">
                  <div className="relative mr-3 shrink-0">
                    <div className={`w-10 h-10 ${avatarColor} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                      {avatarText}
                    </div>
                    {countryCode && (
                      <img
                        className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white object-cover"
                        src={`https://flagcdn.com/${countryCode.toLowerCase()}.svg`}
                        alt={countryCode}
                        title={countryCode} 
                      />
                    )}
                  </div>
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <p className="font-medium text-gray-900 mb-1 text-sm">{conv.contactName || conv.msisdn}</p>
                      <p className="text-gray-500 text-[11px] truncate max-w-[230px]">{conv.content}</p>
                    </div>
                    <div className="ml-auto flex items-center shrink-0 pl-2">
                      <FaWhatsapp className="text-green-500 mr-1" />
                      <p className="text-xs text-gray-400 whitespace-nowrap">{formatTimestamp(conv.timestamp)}</p>
                      {conv.hasNewMessage && activeChat?.id !== conv.id && (
                          <span className="ml-2 w-3 h-3 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
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