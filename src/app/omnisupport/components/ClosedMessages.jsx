import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import PropTypes from "prop-types";

const API_BASE_URL = "https://api.tuma-app.com/api/webhook";

// --- HELPER FUNCTIONS ---
const parseMessageContent = (contentString) => {
  if (!contentString) return { type: 'empty', content: null };
  try {
    const parsed = JSON.parse(contentString);
    if (typeof parsed === 'object' && parsed !== null) {
      if (parsed.text) return { type: 'text', content: parsed.text };
      if (parsed.image && parsed.image.url) return { type: 'image', content: '📷 Image' };
      if (parsed.interactive) return { type: 'interactive', content: null };
      return { type: 'unsupported_json', content: null };
    }
  } catch (e) { return { type: 'text', content: contentString }; }
  return { type: 'unknown', content: null };
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

// --- COMPONENT ---
export default function ClosedMessages({ onSelectChat, activeChat, searchTerm }) {
  const [closedConversations, setClosedConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const fetchAndProcessConversations = async () => {
      if (isInitialLoad.current) setLoading(true);
      setError(null);

      try {
        const convosResponse = await axios.get(`${API_BASE_URL}/conversations`);
        // Filter for conversations that are explicitly marked as closed
        const filteredConversations = (convosResponse.data || []).filter(conv => conv.isClosed === true);

        if (filteredConversations.length === 0) {
          setClosedConversations([]);
          setLoading(false); // Ensure loading is turned off
          return;
        }

        const messageCheckPromises = filteredConversations.map(conv =>
          axios.get(`${API_BASE_URL}/messages/${conv.id}?page=0&size=50`)
            .then(response => ({
              conversation: conv,
              messages: response.data || [],
            }))
        );
        
        const results = await Promise.allSettled(messageCheckPromises);
        const trulyClosed = results
          .filter(result => result.status === 'fulfilled')
          .map(result => {
            const { conversation, messages } = result.value;
            const sortedMessages = messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const lastDisplayableMessage = sortedMessages.find(msg => {
                const parsed = parseMessageContent(msg.content);
                return parsed.type === 'text' || parsed.type === 'image';
            });

            const content = lastDisplayableMessage ? parseMessageContent(lastDisplayableMessage.content).content : "Conversation closed";
            const timestamp = lastDisplayableMessage ? lastDisplayableMessage.createdAt : conversation.lastReceivedAt;

            // This object is passed to the parent when a chat is selected
            return {
              id: conversation.id,
              contactName: conversation.contactName,
              msisdn: conversation.msisdn,
              content: content,
              timestamp: timestamp,
              isClosed: true, // This flag tells the Conversation component to hide the input area
              messages: [{ from: { name: conversation.contactName, phoneNumber: conversation.msisdn } }]
            };
          });

        setClosedConversations(trulyClosed);

      } catch (error) {
        console.error("❌ Error fetching closed messages:", error);
        setError("Failed to fetch closed conversations.");
      } finally {
        if (isInitialLoad.current) {
          setLoading(false);
          isInitialLoad.current = false;
        }
      }
    };

    fetchAndProcessConversations();
    // Poll less frequently for closed chats as they are unlikely to change
    const interval = setInterval(fetchAndProcessConversations, 30000); 
    return () => clearInterval(interval);
  }, []);

  const filteredConversations = useMemo(() => {
    return closedConversations
      .filter(conv => {
        const name = (conv.contactName || '').toLowerCase();
        const content = (conv.content || '').toLowerCase();
        return name.includes(searchTerm.toLowerCase()) || content.includes(searchTerm.toLowerCase());
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [closedConversations, searchTerm]);

  if (loading) return <p className="text-gray-500 text-center mt-4">Loading closed conversations...</p>;
  if (error) return <p className="text-red-500 text-center mt-4">{error}</p>;

  return (
    <div className="max-w-lg mx-auto font-poppins bg-whi flex flex-col">
      <div className="flex-1 overflow-hidden" style={{ maxHeight: "78vh", overflowY: "auto" }}>
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
  onSelectChat: PropTypes.func.isRequired,
  activeChat: PropTypes.object,
  searchTerm: PropTypes.string,
};

ClosedMessages.defaultProps = {
  activeChat: null,
  searchTerm: "",
};