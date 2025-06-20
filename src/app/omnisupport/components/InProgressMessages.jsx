import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { Loader2 } from 'lucide-react';

const API_BASE_URL = "https://api.tuma-app.com/api/webhook";
const PAGE_SIZE = 15;

// --- HELPER FUNCTIONS (Unchanged) ---
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
    const messageDate = new Date(timestampStr);
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

// --- COMPONENT ---
export default function InProgressMessages({ onSelectChat, activeChat, searchTerm }) {
  const [inProgressConversations, setInProgressConversations] = useState([]);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchAndProcessConversations = useCallback(async (pageNum) => {
    if (pageNum === 0) setLoadingInitial(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const convosResponse = await axios.get(`${API_BASE_URL}/conversations?page=${pageNum}&size=${PAGE_SIZE}`);
      const fetchedConvos = (convosResponse.data || []).filter(conv => conv.isClosed !== true);

      if (fetchedConvos.length < PAGE_SIZE) {
        setHasMore(false);
      }
      
      const messageCheckPromises = fetchedConvos.map(conv =>
        axios.get(`${API_BASE_URL}/messages/${conv.id}?page=0&size=50`)
          .then(response => {
            const messages = response.data || [];
            const hasSentMessage = messages.some(msg => msg.direction === 'sent');
            const hasReceivedMessage = messages.some(msg => msg.direction === 'received');
            return {
              conversation: conv,
              messages: messages,
              isInProgress: hasSentMessage && hasReceivedMessage,
            };
          })
      );
      
      const results = await Promise.allSettled(messageCheckPromises);
      const trulyInProgress = results
        .filter(result => result.status === 'fulfilled' && result.value.isInProgress)
        .map(result => {
          const { conversation, messages } = result.value;
          
          // Sort messages by date to find the most recent one
          const sortedMessages = messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          // --- THIS IS THE KEY LOGIC CHANGE ---
          // Get the absolute last message, regardless of type or direction.
          const lastMessage = sortedMessages[0];
          
          if (!lastMessage) return null; // Skip conversations with no messages

          const parsedContent = parseMessageContent(lastMessage.content);
          
          return {
            id: conversation.id,
            contactName: conversation.contactName,
            msisdn: conversation.msisdn,
            content: parsedContent.content,
            // Use the timestamp of the absolute last message for sorting
            timestamp: lastMessage.createdAt, 
            // The "new message" dot is still based on the direction of the last message
            hasNewMessage: lastMessage.direction === 'received',
            messages: [{ from: { name: conversation.contactName, phoneNumber: conversation.msisdn } }]
          };
        }).filter(Boolean);
      
      setInProgressConversations(prev => pageNum === 0 ? trulyInProgress : [...prev, ...trulyInProgress]);

    } catch (error) {
      console.error("❌ Error fetching in-progress messages:", error);
      setError("Failed to fetch active conversations.");
    } finally {
      if (pageNum === 0) setLoadingInitial(false);
      else setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchAndProcessConversations(0);
  }, [fetchAndProcessConversations]);
  
  useEffect(() => {
    const interval = setInterval(() => {
        // You can add a more sophisticated refresh logic here in the future
    }, 10000); 
    return () => clearInterval(interval);
  }, [fetchAndProcessConversations]);

  const filteredConversations = useMemo(() => {
    return inProgressConversations
      .filter(conv => (conv.contactName || '').toLowerCase().includes(searchTerm.toLowerCase()))
      // The sorting logic itself doesn't need to change, as it correctly uses the timestamp.
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [inProgressConversations, searchTerm]);

  const handleSelectChat = (conversation) => {
    onSelectChat(conversation);
    setInProgressConversations(prevConvos =>
        prevConvos.map(c => c.id === conversation.id ? { ...c, hasNewMessage: false } : c)
    );
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAndProcessConversations(nextPage);
  };

  if (loadingInitial) return <p className="text-gray-500 text-center mt-4">Loading messages...</p>;
  if (error) return <p className="text-red-500 text-center mt-4">{error}</p>;

  return (
    <div className="max-w-lg mx-auto font-poppins bg-white flex flex-col h-full">
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: "72vh" }}>
        {filteredConversations.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">{searchTerm ? 'No results found.' : 'No in-progress conversations.'}</p>
        ) : (
          filteredConversations.map((conv) => (
            <div key={conv.id} className={`cursor-pointer px-4 py-2 border-b flex justify-between items-center transition ${activeChat?.id === conv.id ? "bg-gray-100" : "bg-white hover:bg-gray-50"}`} onClick={() => handleSelectChat(conv)}>
              <div className="flex items-start w-full">
                <div className="p-2 px-4 mr-2 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">{(conv.contactName || "?")[0].toUpperCase()}</div>
                <div className="flex justify-between items-start w-full">
                  <div>
                    <p className="font-medium text-gray-900 mb-1 text-sm">{conv.contactName || conv.msisdn}</p>
                    <p className="text-gray-500 text-xs truncate max-w-[270px]">{conv.content}</p>
                  </div>
                  <div className="ml-auto flex items-center">
                    <p className="text-xs text-gray-400 whitespace-nowrap">{formatTimestamp(conv.timestamp)}</p>
                    {conv.hasNewMessage && (
                        <span className="ml-2 w-3 h-3 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
          
      <div className="p-4 flex justify-center">
        {hasMore && (
            <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="w-full text-center border border-blue-600 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300"
            >
                {loadingMore ? (
                    <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                    </div>
                ) : (
                    'Load More'
                )}
            </button>
        )}
      </div>
    </div>
  );
}

InProgressMessages.propTypes = {
  onSelectChat: PropTypes.func.isRequired,
  activeChat: PropTypes.object,
  searchTerm: PropTypes.string,
};