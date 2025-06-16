import { useState, useEffect, useRef } from "react";
import axios from "axios";

// --- HELPER FUNCTION (Unchanged) ---
const formatTimestamp = (timestampStr) => {
    // ... (your existing formatTimestamp function)
    if (!timestampStr) return "";

    const originalDate = new Date(timestampStr);
    const adjustedDate = new Date(originalDate);
    adjustedDate.setHours(adjustedDate.getHours() + 3);
  
    const now = new Date();
    const isToday =
      adjustedDate.getFullYear() === now.getFullYear() &&
      adjustedDate.getMonth() === now.getMonth() &&
      adjustedDate.getDate() === now.getDate();
  
    if (isToday) {
      return adjustedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    } else {
      const day = adjustedDate.getDate();
      const month = adjustedDate.toLocaleString('default', { month: 'short' });
      const year = adjustedDate.getFullYear();
      return `${day} ${month} ${year}`;
    }
};

// --- START: MODIFIED COMPONENT ---
export default function InProgressMessages({ onSelectChat, activeChat, searchTerm }) {
  const [inProgressConversations, setInProgressConversations] = useState([]);
  const [visibleCount, setVisibleCount] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const firstLoad = useRef(true);

  useEffect(() => {
    const fetchInProgressConversations = async () => {
      // ... (your existing fetch logic is fine)
      try {
        if (firstLoad.current) {
          setLoading(true);
        }
        setError(null);

        const response = await axios.get("https://api.tuma-app.com/api/webhook/conversations");
        
        console.log("✅ Fetched Conversations:", response.data);

        const rawConversations = response.data || [];

        const transformedConversations = rawConversations.map((conv) => {
          let lastMessageContent = "No message content";
          try {
            const parsedMessage = JSON.parse(conv.lastMessage);
            lastMessageContent = parsedMessage.text || "Message has no text";
          } catch (e) {
            console.error(`Could not parse lastMessage for conversation ${conv.id}:`, conv.lastMessage);
          }
          
          const storedTimestamp = localStorage.getItem(`lastTimestamp_${conv.id}`);
          const hasNewMessage = conv.lastReceivedAt !== storedTimestamp;

          return {
            id: conv.id,
            hasNewMessage: hasNewMessage,
            messages: [{
              id: conv.id,
              content: lastMessageContent,
              timestamp: conv.lastReceivedAt,
              from: {
                name: conv.contactName,
                phoneNumber: conv.msisdn,
              },
            }],
          };
        });

        setInProgressConversations(transformedConversations);

      } catch (error) {
        console.error("❌ Error fetching in-progress messages:", error);
        setError("Failed to fetch messages. Please try again later.");
      } finally {
        setLoading(false);
        firstLoad.current = false;
      }
    };

    fetchInProgressConversations();
  }, []);

  const loadMoreConversations = () => {
    setVisibleCount((prevCount) => prevCount + 100);
  };

  const handleSelectChat = (conversation) => {
    if (conversation.messages.length > 0) {
      const lastMessage = conversation.messages[0];
      localStorage.setItem(`lastTimestamp_${conversation.id}`, lastMessage.timestamp);
    }

    setInProgressConversations(prevConvs =>
      prevConvs.map(c => 
        c.id === conversation.id ? { ...c, hasNewMessage: false } : c
      )
    );

    onSelectChat(conversation);
  };

  // --- START: NEW FILTERING LOGIC ---
  const filteredConversations = inProgressConversations.filter((conv) => {
    const lastMessage = conv.messages[0];
    if (!lastMessage) return false; // Safety check

    const name = (lastMessage.from.name || '').toLowerCase();
    const content = (lastMessage.content || '').toLowerCase();
    const term = searchTerm.toLowerCase();

    // Return true if search term is found in the name OR the content
    return name.includes(term) || content.includes(term);
  });
  // --- END: NEW FILTERING LOGIC ---

  return (
    <div className="max-w-lg mx-auto font-poppins bg-white flex flex-col">
      <div className="flex-1 overflow-hidden" style={{ maxHeight: "78vh", overflowY: "auto" }}>
        {loading ? (
          <p className="text-gray-500 text-center mt-4">Loading messages...</p>
        ) : error ? (
          <p className="text-red-500 text-center mt-4">{error}</p>
        ) : filteredConversations.length === 0 ? ( // Use filtered list for the check
          <p className="text-center text-gray-500 mt-4">
            {searchTerm ? 'No results found.' : 'No messages available'}
          </p>
        ) : (
          // Use filteredConversations to render the list
          filteredConversations.slice(0, visibleCount).map((conv) => {
            const lastMessage = conv.messages[0];

            return (
              <div
                key={conv.id}
                className={`cursor-pointer px-4 py-2 border-b flex justify-between items-center transition ${
                  activeChat?.id === conv.id
                    ? "bg-gray-100"
                    : conv.hasNewMessage
                    ? "bg-gray-200"
                    : "bg-white"
                }`}
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
                      <p className="text-xs text-gray-400 whitespace-nowrap">
                        {formatTimestamp(lastMessage.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* The "Load More" button should only show if there are more items in the filtered list to display */}
      {visibleCount < filteredConversations.length && (
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
