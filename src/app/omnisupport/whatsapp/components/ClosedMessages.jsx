// src/components/ClosedMessages.jsx

import { useMemo } from "react";
import PropTypes from "prop-types";
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { FaWhatsapp } from 'react-icons/fa';

// --- COPIED HELPER FUNCTION ---
const getCountryCode = (msisdn) => {
  if (!msisdn || typeof msisdn !== 'string') return null;
  const formattedMsisdn = msisdn.startsWith('+') ? msisdn : `+${msisdn}`;
  try {
    const phoneNumber = parsePhoneNumberFromString(formattedMsisdn);
    if (phoneNumber && phoneNumber.country) return phoneNumber.country;
  } catch (error) {
    console.error("Error parsing phone number:", error);
  }
  return null;
};

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

export default function ClosedMessages({ conversations = [], onSelectChat, activeChat, searchTerm = "" }) {
  
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
          filteredConversations.map((conv) => {
            // --- NEW: Added logic for avatar and flag ---
            const countryCode = getCountryCode(conv.msisdn);
            const avatarText = (conv.contactName || conv.msisdn || "??").slice(0, 2).toUpperCase();

            return (
              <div key={conv.id} className={`cursor-pointer px-4 py-2 border-b flex justify-between items-center transition ${activeChat?.id === conv.id ? "bg-gray-100" : "bg-white hover:bg-gray-50"}`} onClick={() => onSelectChat(conv)}>
                <div className="flex items-start w-full opacity-70">
                  {/* --- NEW: Avatar and Flag Structure --- */}
                  <div className="relative mr-3 shrink-0">
                    <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {avatarText}
                    </div>
                    {countryCode && (
                      <img
                        className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white object-cover"
                        src={`https://flagcdn.com/${countryCode.toLowerCase()}.svg`}
                        alt={countryCode}
                        title={countryCode}
                      />
                    )}
                  </div>
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <p className="font-medium text-gray-700 mb-1 text-sm">{conv.contactName || conv.msisdn}</p>
                      <p className="text-gray-500 text-xs truncate max-w-[270px]">{conv.content}</p>
                    </div>
                    {/* --- NEW: Timestamp with WhatsApp Icon --- */}
                    <div className="ml-auto flex items-center shrink-0 pl-2">
                      <FaWhatsapp className="text-gray-400 mr-1" />
                      <p className="text-xs text-gray-400 whitespace-nowrap">{formatTimestamp(conv.timestamp)}</p>
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

ClosedMessages.propTypes = {
  conversations: PropTypes.array.isRequired,
  onSelectChat: PropTypes.func.isRequired,
  activeChat: PropTypes.object,
  searchTerm: PropTypes.string,
};