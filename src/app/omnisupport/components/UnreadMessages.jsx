import { useState, useEffect, useRef } from "react";
import axios from "axios";
import PropTypes from "prop-types";

// --- START: MODIFIED COMPONENT ---
export default function UnreadMessages({ onSelectChat, searchTerm, sortOrder }) {
  const [allUnreadConversations, setAllUnreadConversations] = useState([]);
  const [visibleCount, setVisibleCount] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const notificationSound = useRef(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (typeof Audio !== "undefined") {
      notificationSound.current = new Audio('/sound/notification.mp3');
    }
  }, []);

  useEffect(() => {
    const fetchAndProcessConversations = async () => {
      if (isFirstLoad.current) {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await axios.get("https://api.tuma-app.com/api/webhook/conversations");
        const rawConversations = response.data || [];
        const previousUnreadCount = allUnreadConversations.length;

        const transformed = rawConversations.map(conv => {
          let lastMessageContent = "";
          try {
            const parsedMessage = JSON.parse(conv.lastMessage);
            lastMessageContent = parsedMessage.text || "";
          } catch (e) { /* silent catch */ }
          
          const storedTimestamp = localStorage.getItem(`lastTimestamp_${conv.id}`);
          const isUnread = conv.lastReceivedAt !== storedTimestamp;

          return {
            id: conv.id,
            isUnread: isUnread,
            messages: [{
              content: lastMessageContent,
              timestamp: conv.lastReceivedAt,
              from: { name: conv.contactName, phoneNumber: conv.msisdn }
            }]
          };
        });

        const unread = transformed.filter(conv => conv.isUnread);

        if (!isFirstLoad.current && unread.length > previousUnreadCount) {
          try {
            notificationSound.current?.play();
          } catch (e) {
            console.warn("Could not play notification sound.");
          }
        }

        setAllUnreadConversations(unread);

      } catch (error) {
        console.error("❌ Error fetching unread messages:", error);
        if (isFirstLoad.current) {
          setError("Failed to fetch unread messages. Please try again later.");
        }
      } finally {
        if (isFirstLoad.current) {
          setLoading(false);
          isFirstLoad.current = false;
        }
      }
    };

    fetchAndProcessConversations();
    const interval = setInterval(fetchAndProcessConversations, 3000);
    return () => clearInterval(interval);

  }, []); // Note: The dependency array is empty. Polling handles updates.

  const loadMoreConversations = () => {
    setVisibleCount(prev => prev + 100);
  };
  
  const handleSelectChat = (conversation) => {
    const lastMessage = conversation.messages[0];
    localStorage.setItem(`lastTimestamp_${conversation.id}`, lastMessage.timestamp);
    onSelectChat(conversation);
    setAllUnreadConversations(prev => prev.filter(c => c.id !== conversation.id));
  };

  // --- NEW: Client-side filtering and sorting ---
  const processedConversations = allUnreadConversations
    .filter(conv => {
      const lastMessage = conv.messages[0];
      if (!lastMessage) return false;

      const name = (lastMessage.from.name || '').toLowerCase();
      const content = (lastMessage.content || '').toLowerCase();
      const term = (searchTerm || '').toLowerCase();

      // Search term must be in the sender's name OR the message content
      return name.includes(term) || content.includes(term);
    })
    .sort((a, b) => {
      const timestampA = new Date(a.messages[0].timestamp);
      const timestampB = new Date(b.messages[0].timestamp);
      return sortOrder === "newest" ? timestampB - timestampA : timestampA - timestampB;
    });

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading unread messages...</div>;
  }
  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  const conversationsToDisplay = processedConversations.slice(0, visibleCount);

  return (
    <div className="max-w-lg mx-auto font-poppins bg-white flex flex-col">
      <div className="flex-1 overflow-hidden" style={{ maxHeight: "77vh", overflowY: "auto" }}>
        {conversationsToDisplay.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">
            {searchTerm ? 'No results found.' : 'No unread messages.'}
          </p>
        ) : (
          conversationsToDisplay.map((conv) => {
            const lastMessage = conv.messages[0];
            return (
              <div
                key={conv.id}
                className="cursor-pointer px-4 py-2 border-b flex justify-between items-center transition bg-white hover:bg-gray-100"
                onClick={() => handleSelectChat(conv)}
              >
                <div className="flex items-start w-full">
                  <div className="p-2 px-4 mr-2 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {(lastMessage.from.name || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <p className="font-medium text-gray-900 mb-1 text-sm">
                        {lastMessage.from.name || lastMessage.from.phoneNumber}
                      </p>
                      <p className="text-gray-500 text-xs truncate max-w-[270px]">
                        {lastMessage.content}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center">
                      <p className="text-sm text-gray-400">
                        {new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </p>
                      <span className="ml-2 w-3 h-3 bg-blue-500 rounded-full"></span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {visibleCount < processedConversations.length && (
        <button
          className="border border-blue-500 text-blue-600 py-2 px-4 mt-3 rounded mx-2 transition"
          onClick={loadMoreConversations}
        >
          Load More
        </button>
      )}
    </div>
  );
}

// Update prop-types to use searchTerm
UnreadMessages.propTypes = {
  onSelectChat: PropTypes.func.isRequired,
  searchTerm: PropTypes.string,
  sortOrder: PropTypes.oneOf(["newest", "oldest"]),
};

// Update default props
UnreadMessages.defaultProps = {
  searchTerm: "",
  sortOrder: "newest",
};
// --- END: MODIFIED COMPONENT ---