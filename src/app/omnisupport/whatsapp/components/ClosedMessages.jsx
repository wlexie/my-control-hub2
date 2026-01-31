import { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { FaWhatsapp } from "react-icons/fa";
import { useSelector } from "react-redux";
import axios from "axios";
import { useInView } from 'react-intersection-observer';

const API_ENDPOINT = "https://com.tuma-app.com/api/conversations/closed";

// --- HELPER FUNCTIONS ---
const getCountryCode = (msisdn) => {
  if (!msisdn || typeof msisdn !== "string") return null;
  const formattedMsisdn = msisdn.startsWith("+") ? msisdn : `+${msisdn}`;
  try {
    const phoneNumber = parsePhoneNumberFromString(formattedMsisdn);
    return phoneNumber?.country || null;
  } catch (err) {
    console.error("Error parsing phone number:", err);
    return null;
  }
};

const formatTimestamp = (timestampStr) => {
  if (!timestampStr) return "";
  const date = new Date(timestampStr);
  // Add 3 hours (as per your original logic)
  date.setHours(date.getHours() + 3);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const messageDay = new Date(date);
  messageDay.setHours(0, 0, 0, 0);

  if (messageDay.getTime() === today.getTime()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  }
  if (messageDay.getTime() === yesterday.getTime()) return "Yesterday";
  return date.toLocaleDateString([], { day: "numeric", month: "short" });
};

export default function ClosedMessages({ onSelectChat, activeChat, searchTerm = "" }) {
  const { accessToken } = useSelector((state) => state.auth);
  const [conversations, setConversations] = useState([]);
  
  // State for managing pagination
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Setup the Intersection Observer for infinite scroll
  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  // Function to fetch pages of closed conversations
  const fetchConversations = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_ENDPOINT, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          page: page,
          size: 50
        }
      });

      setConversations(prev => [...prev, ...res.data.content]);
      setPage(prevPage => prevPage + 1);
      setHasMore(!res.data.last);

    } catch (err) {
      console.error("Error fetching closed conversations:", err);
      setError(err.message || "Failed to fetch conversations");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, page, hasMore, isLoading]);

  // Effect to trigger fetching more data when the loader is in view
  useEffect(() => {
    if (inView && accessToken) {
      fetchConversations();
    }
  }, [inView, accessToken, fetchConversations]);

  // Memoized function to filter and sort conversations
  const filteredConversations = useMemo(() => {
    return conversations
      .filter((conv) => (conv.contactName || "").toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        // Fallback logic: Use closedAt if it exists, otherwise use lastMessageTime
        const dateA = new Date(a.closedAt || a.lastMessageTime).getTime();
        const dateB = new Date(b.closedAt || b.lastMessageTime).getTime();

        // Sort Descending: Latest (newest) at the top
        return dateB - dateA;
      });
  }, [conversations, searchTerm]);

  return (
    <div className="max-w-lg mx-auto font-poppins bg-white flex flex-col h-full overflow-y-auto">
      <div className="flex-1">
        {filteredConversations.length === 0 && !isLoading ? (
          <p className="text-center text-gray-500 mt-4 px-4">
            {searchTerm ? 'No results found.' : 'No closed conversations found.'}
          </p>
        ) : (
          filteredConversations.map((conv) => {
            const countryCode = getCountryCode(conv.contactPhone);
            const avatarText = (conv.contactName || conv.contactPhone || "??").slice(0, 2).toUpperCase();
            
            // Determine which timestamp to display in the UI
            // If it's closed, we show the closed time, otherwise the last message time
            const displayTime = conv.closedAt || conv.lastMessageTime;

            return (
              <div
                key={conv.ticketId}
                className={`cursor-pointer px-4 py-2 border-b flex justify-between items-center transition ${
                  activeChat?.ticketId === conv.ticketId ? "bg-gray-100" : "bg-white hover:bg-gray-50"
                }`}
               onClick={() => {
                  console.log("Opening chat with Tuma ID:", conv.tumaId); // debug
                  onSelectChat({ ...conv, tumaId: conv.tumaId });
                }}              >
                <div className="flex items-start w-full opacity-70">
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
                      <p className="font-medium text-gray-700 mb-1 text-sm">
                        {conv.contactName || conv.contactPhone}
                      </p>
                      <p className="text-gray-500 text-xs truncate max-w-[270px]">
                        {conv.lastMessage}
                      </p>
                    </div>
                     <div className="flex flex-col items-end">
                       <div className="ml-auto flex items-center shrink-0 mb-2 pl-2">
                         <FaWhatsapp className="text-green-500 mr-1" />
                         <p className="text-xs text-gray-400 whitespace-nowrap">
                           {formatTimestamp(displayTime)}
                         </p>
                       </div>
                       <span className="text-xs text-pink-500 font-medium">
                         <span className="text-gray-500 mr-1 font-normal">By:</span>
                         {conv.assignedAgentName || "System"}
                       </span>
                     </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Loader element to trigger fetching the next page */}
        {hasMore && (
          <div ref={ref} className="flex justify-center items-center p-4">
            {isLoading && <p className="text-gray-500">Loading more...</p>}
          </div>
        )}
        
        {/* Display error message if the fetch fails */}
        {error && <div className="p-4 text-center text-red-500">{error}</div>}
      </div>
    </div>
  );
}

ClosedMessages.propTypes = {
  onSelectChat: PropTypes.func.isRequired,
  activeChat: PropTypes.object,
  searchTerm: PropTypes.string,
};