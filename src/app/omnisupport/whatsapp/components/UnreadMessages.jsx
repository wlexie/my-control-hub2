import { useEffect, useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import axios from "axios";
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { FaWhatsapp } from 'react-icons/fa';
import { useInView } from 'react-intersection-observer';

/**
 * Helper function to get the country code from a phone number.
 */
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

/**
 * Helper function to format timestamps into a user-friendly format.
 */
const formatTimestamp = (timestampStr) => {
  if (!timestampStr) return "";
  const messageDate = new Date(timestampStr);

  // Add 3 hours
  messageDate.setHours(messageDate.getHours() + 3);
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
  return messageDate.toLocaleDateString([], { day: 'numeric', month: 'short' });
};

/**
 * A list of colors for user avatars.
 */
const avatarColors = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
  'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500',
];

export default function UnreadMessages({ onSelectChat, searchTerm = "" }) {
  const [conversations, setConversations] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const accessToken = useSelector(state => state.auth.accessToken);

  // State for managing pagination
  const [page, setPage] = useState(0);         // The next page number to fetch
  const [hasMore, setHasMore] = useState(true);   // Tracks if the server has more data
  const [isLoading, setIsLoading] = useState(false); // Prevents multiple requests at once

  // Setup the Intersection Observer to detect when the user scrolls to the bottom
  const { ref, inView } = useInView({
    threshold: 0.5, // Trigger when 50% of the loader element is visible
  });

  // Function to fetch pages of conversations
  const fetchUnreadMessages = useCallback(async () => {
    // Exit if we're already loading or if there are no more pages to fetch
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const res = await axios.get("https://com.tuma-app.com/api/conversations/unread", {

         //     const res = await axios.get("http://localhost:8081/api/conversations/unread", {

        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          page: page, 
          size: 50   
        }
      });

      // The backend response is a Page object, so the data is in `res.content`
      const newConversations = res.data.content;

      // Append the newly fetched conversations to the existing list
      setConversations(prev => [...prev, ...newConversations]);

      // Increment the page number for the next potential fetch
      setPage(prevPage => prevPage + 1);

      // The backend's Page object has a 'last' property. Use it to determine if there's more data.
      setHasMore(!res.data.last);

    } catch (error) {
      console.error("Error fetching unread messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, page, hasMore, isLoading]);

  // This effect triggers fetching more data when the loader element becomes visible
  useEffect(() => {
    if (inView && accessToken) {
      fetchUnreadMessages();
    }
  }, [inView, accessToken, fetchUnreadMessages]);

  // This will run whenever the conversations list is updated.
  useEffect(() => {
    if (!accessToken || conversations.length === 0) return;

    const fetchUnreadCounts = async () => {
      const counts = {};
      await Promise.all(
        conversations.map(async (conv) => {
          // Avoid re-fetching counts we already have
          if (unreadCounts[conv.ticketId] === undefined) {
            try {
              //const res = await axios.get(`http://localhost:8081/api/conversations/${conv.ticketId}/unread-count`, {

              const res = await axios.get(`https://com.tuma-app.com/api/conversations/${conv.ticketId}/unread-count`, {
                headers: { Authorization: `Bearer ${accessToken}` }
              });

              counts[conv.ticketId] = res.data;
            } catch (err) {
              console.error(`Failed to fetch unread count for ${conv.ticketId}`, err);
              counts[conv.ticketId] = 0; // Default to 0 on error
            }
          }
        })
      );
      // Merge new counts with existing ones
      if (Object.keys(counts).length > 0) {
        setUnreadCounts(prev => ({...prev, ...counts}));
      }
    };

    fetchUnreadCounts();
  }, [conversations, accessToken]);

  // Effect for handling real-time updates via Server-Sent Events (SSE)
  useEffect(() => {
    const eventSource = new EventSource("https://com.tuma-app.com/api/sse/subscribe");

    eventSource.addEventListener("conversation-update", (event) => {
      try {
        const updatedConv = JSON.parse(event.data);

        setConversations(prev => {
          const index = prev.findIndex(c => c.ticketId === updatedConv.ticketId);
          const newConversations = [...prev];

          if (updatedConv.status === 'UNREAD') {
            if (index !== -1) {
              // Update existing conversation
              newConversations[index] = updatedConv;
            } else {
              // Add new conversation to the top
              newConversations.unshift(updatedConv);
            }
          }
          else {
            // Remove conversation if its status is no longer UNREAD
            if (index !== -1) {
              newConversations.splice(index, 1);
            }
          }
          return newConversations;
        });
      } catch (e) {
        console.error("Failed to parse SSE event data for unread:", e);
      }
    });

    eventSource.onopen = () => console.log("SSE connection for Unread established.");
    eventSource.onerror = (err) => {
      console.error("EventSource for Unread failed:", err);
      eventSource.close();
    };

    return () => {
      console.log("Closing SSE connection for Unread.");
      eventSource.close();
    };
  }, []);

  // Memoized function to filter and sort conversations based on search term
  const filteredConversations = useMemo(() => {
    return conversations
      .filter(conv =>
        (conv.contactName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conv.lastMessage || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
  }, [conversations, searchTerm]);

  return (
    <div className="max-w-lg mx-auto font-poppins bg-white flex flex-col h-full overflow-y-auto">
      <div className="flex-1">
        {filteredConversations.length === 0 && !isLoading ? (
          <p className="text-center text-gray-500 mt-4 px-4">
            {searchTerm ? 'No results found.' : 'All caught up! No unread messages.'}
          </p>
        ) : (
          filteredConversations.map((conv, index) => {
            const avatarColor = avatarColors[index % avatarColors.length];
            const countryCode = getCountryCode(conv.contactPhone);
            const avatarText = (conv.contactName || conv.contactPhone || "??").slice(0, 2).toUpperCase();
            const unreadCount = unreadCounts[conv.ticketId] || 0;

            return (
              <div
                key={conv.ticketId}
                className="cursor-pointer px-4 py-2 border-b flex justify-between items-center transition bg-white hover:bg-gray-100"
                onClick={() => {
                  console.log("Opening chat with Tuma ID:", conv.tumaId); // debug
                  onSelectChat({ ...conv, tumaId: conv.tumaId });
                }}              >
                <div className="flex items-start w-full">
                  <div className="relative mr-3 shrink-0">
                    <div className={`w-10 h-10 ${avatarColor} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
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
                      <p className="font-medium text-gray-900 mb-1 text-sm">{conv.contactName || conv.contactPhone}</p>
                      <p className="text-gray-500 text-xs truncate max-w-[220px]">{conv.lastMessage}</p>
                    </div>
                    <div className="ml-auto flex items-center shrink-0 pl-2">
                      <FaWhatsapp className="text-green-500 mr-1" />
                      <p className="text-xs text-gray-400 whitespace-nowrap">{formatTimestamp(conv.lastMessageTime)}</p>
                      {unreadCount > 0 && (
                        <div className="ml-2 w-5 h-5 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* It's only rendered if there are more pages to load. */}
        {hasMore && (
          <div ref={ref} className="flex justify-center items-center p-4">
            {/* Show a loading message while fetching the next page */}
            {isLoading && <p className="text-gray-500">Loading more...</p>}
          </div>
        )}
      </div>
    </div>
  );
}

UnreadMessages.propTypes = {
  onSelectChat: PropTypes.func.isRequired,
  searchTerm: PropTypes.string,
};