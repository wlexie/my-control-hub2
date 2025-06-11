import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function InProgressMessages({ onSelectChat, activeChat }) {
  const [inProgressConversations, setInProgressConversations] = useState([]);
  const [visibleCount, setVisibleCount] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const firstLoad = useRef(true);

  useEffect(() => {
    const fetchInProgressConversations = async () => {
      try {
        if (firstLoad.current) {
          setLoading(true);
        }
        setError(null);

        // This assumes you have resolved any CORS issues (e.g., by using a proxy or a dedicated API route)
        const response = await axios.get("https://api.tuma-app.com/api/webhook/conversations");
        
        console.log("✅ Fetched Conversations:", response.data);


        // The API gives us an array of conversations directly.
        const rawConversations = response.data || [];

        // We must transform this raw data into the structure our JSX expects.
        const transformedConversations = rawConversations.map((conv) => {
          let lastMessageContent = "No message content";
          try {
            // `lastMessage` is a stringified JSON, so we must parse it to get the text.
            const parsedMessage = JSON.parse(conv.lastMessage);
            lastMessageContent = parsedMessage.text || "Message has no text";
          } catch (e) {
            console.error(`Could not parse lastMessage for conversation ${conv.id}:`, conv.lastMessage);
          }
          
          // Check if the message is new by comparing the timestamp with one in localStorage
          const storedTimestamp = localStorage.getItem(`lastTimestamp_${conv.id}`);
          const hasNewMessage = conv.lastReceivedAt !== storedTimestamp;

          // Now, build the object that our JSX can render
          return {
            id: conv.id,
            hasNewMessage: hasNewMessage,
            // The JSX needs a `messages` array, so we create a synthetic one.
            messages: [{
              id: conv.id, // Use conversation ID as a unique key
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
        // --- END: CORRECTED DATA TRANSFORMATION ---

      } catch (error) {
        console.error("❌ Error fetching in-progress messages:", error);
        setError("Failed to fetch messages. Please try again later.");
      } finally {
        setLoading(false);
        firstLoad.current = false;
      }
    };

    fetchInProgressConversations();
    // Use an empty dependency array to run only once when the component mounts
  }, []); 

  const loadMoreConversations = () => {
    setVisibleCount((prevCount) => prevCount + 100);
  };

  const handleSelectChat = (conversation) => {
    // --- EDITED: Update logic to use the new timestamp-based "read" status ---
    if (conversation.messages.length > 0) {
      const lastMessage = conversation.messages[0];
      // Mark as "read" by storing the latest timestamp in localStorage
      localStorage.setItem(`lastTimestamp_${conversation.id}`, lastMessage.timestamp);
    }

    // Update the state immediately to remove the "new message" indicator from the UI
    setInProgressConversations(prevConvs =>
      prevConvs.map(c => 
        c.id === conversation.id ? { ...c, hasNewMessage: false } : c
      )
    );

    // Notify the parent component
    onSelectChat(conversation);
  };

  // --- NO CHANGES NEEDED IN THE JSX BELOW ---
  // The rendering logic works perfectly now that we've transformed the data to match it.

  return (
    <div className="max-w-lg mx-auto font-poppins bg-white flex flex-col">
      <div className="flex-1 overflow-hidden" style={{ maxHeight: "78vh", overflowY: "auto" }}>
        {loading ? (
          <p className="text-gray-500 text-center mt-4">Loading messages...</p>
        ) : error ? (
          <p className="text-red-500 text-center mt-4">{error}</p>
        ) : inProgressConversations.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">No messages available</p>
        ) : (
          inProgressConversations.slice(0, visibleCount).map((conv) => {
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
                      <p className="text-gray-500 text-xs  truncate max-w-[270px]">{lastMessage.content}</p>
                    </div>
                    <div className="ml-auto flex items-center">
                      <p className="text-sm text-gray-400">
                        {new Date(lastMessage.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {visibleCount < inProgressConversations.length && (
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