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
    return new Date(timestampStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

// --- COMPONENT ---
export default function UnreadMessages({ onSelectChat, searchTerm, sortOrder }) {
  const [unreadConversations, setUnreadConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const notificationSound = useRef(null);
  const isInitialLoad = useRef(true);
  const previousUnreadIds = useRef(new Set());

  useEffect(() => {
    if (typeof Audio !== "undefined") notificationSound.current = new Audio('/sound/notification.mp3');
  }, []);

  useEffect(() => {
    const fetchAndProcessConversations = async () => {
      if (isInitialLoad.current) setLoading(true);
      setError(null);

      try {
        const convosResponse = await axios.get(`${API_BASE_URL}/conversations`);
        // --- NEW FILTER: Only consider conversations that are NOT closed ---
        const openConversations = (convosResponse.data || []).filter(conv => conv.isClosed !== true);

        if (openConversations.length === 0) {
          setUnreadConversations([]);
          return;
        }

        const messageCheckPromises = openConversations.map(conv =>
          axios.get(`${API_BASE_URL}/messages/${conv.id}?page=0&size=50`)
            .then(response => {
              const messages = response.data || [];
              const hasSentMessage = messages.some(msg => msg.direction === 'sent');
              return {
                conversation: conv,
                messages: messages,
                isUnread: !hasSentMessage && messages.length > 0,
              };
            })
        );
        
        const results = await Promise.allSettled(messageCheckPromises);
        const trulyUnread = results
          .filter(result => result.status === 'fulfilled' && result.value.isUnread)
          .map(result => {
            const { conversation, messages } = result.value;
            const sortedMessages = messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const lastDisplayableMessage = sortedMessages.find(msg => {
                const parsed = parseMessageContent(msg.content);
                return parsed.type === 'text' || parsed.type === 'image';
            });
            if (!lastDisplayableMessage) return null;
            const parsedContent = parseMessageContent(lastDisplayableMessage.content);
            return {
              id: conversation.id,
              contactName: conversation.contactName,
              msisdn: conversation.msisdn,
              content: parsedContent.content,
              timestamp: lastDisplayableMessage.createdAt,
              messages: [{ from: { name: conversation.contactName, phoneNumber: conversation.msisdn } }]
            };
          })
          .filter(Boolean);

        const currentUnreadIds = new Set(trulyUnread.map(c => c.id));
        if (!isInitialLoad.current && trulyUnread.some(c => !previousUnreadIds.current.has(c.id))) {
          notificationSound.current?.play().catch(e => console.warn("Could not play sound."));
        }
        setUnreadConversations(trulyUnread);
        previousUnreadIds.current = currentUnreadIds;

      } catch (error) {
        console.error("❌ Error fetching unread messages:", error);
        setError("Failed to fetch active conversations.");
      } finally {
        if (isInitialLoad.current) {
          setLoading(false);
          isInitialLoad.current = false;
        }
      }
    };

    fetchAndProcessConversations();
    const interval = setInterval(fetchAndProcessConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  const processedConversations = useMemo(() => {
    return unreadConversations
      .filter(conv => {
        const name = (conv.contactName || '').toLowerCase();
        const content = (conv.content || '').toLowerCase();
        return name.includes(searchTerm.toLowerCase()) || content.includes(searchTerm.toLowerCase());
      })
      .sort((a, b) => {
        const timestampA = new Date(a.timestamp);
        const timestampB = new Date(b.timestamp);
        return sortOrder === "newest" ? timestampB - timestampA : timestampA - timestampB;
      });
  }, [unreadConversations, searchTerm, sortOrder]);

  const handleSelectChat = (conversation) => {
    onSelectChat(conversation);
    setUnreadConversations(prev => prev.filter(c => c.id !== conversation.id));
  };

  if (loading) return <div className="p-4 text-center text-gray-500">Loading unread messages...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-lg mx-auto font-poppins bg-white flex flex-col">
      <div className="flex-1 overflow-hidden" style={{ maxHeight: "77vh", overflowY: "auto" }}>
        {processedConversations.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">
            {searchTerm ? 'No results found.' : 'All caught up! No unread messages.'}
          </p>
        ) : (
          processedConversations.map((conv) => (
            <div key={conv.id} className="cursor-pointer px-4 py-2 border-b flex justify-between items-center transition bg-white hover:bg-gray-100" onClick={() => handleSelectChat(conv)}>
              <div className="flex items-start w-full">
                <div className="p-2 px-4 mr-2 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {(conv.contactName || "?")[0].toUpperCase()}
                </div>
                <div className="flex justify-between items-start w-full">
                  <div>
                    <p className="font-medium text-gray-900 mb-1 text-sm">{conv.contactName || conv.msisdn}</p>
                    <p className="text-gray-500 text-xs truncate max-w-[270px]">{conv.content}</p>
                  </div>
                  <div className="ml-auto flex items-center">
                    <p className="text-sm text-gray-400">{formatTimestamp(conv.timestamp)}</p>
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
  onSelectChat: PropTypes.func.isRequired,
  searchTerm: PropTypes.string,
  sortOrder: PropTypes.oneOf(["newest", "oldest"]),
};
UnreadMessages.defaultProps = {
  searchTerm: "",
  sortOrder: "newest",
};