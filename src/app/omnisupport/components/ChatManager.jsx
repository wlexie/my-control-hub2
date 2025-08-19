import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import UnreadMessages from "./UnreadMessages";
import InProgressMessages from "./InProgressMessages";
import ClosedMessages from "./ClosedMessages";

const API_BASE_URL = "https://api.tuma-app.com/api/webhook";
const OPENED_IDS_STORAGE_KEY = 'tuma-openedUnreadIds';

const parseMessageContent = (contentString) => {
    // ... (this function remains unchanged)
    if (!contentString || contentString === "{}") return { type: 'empty', content: 'No message content' };
    try {
        const parsed = JSON.parse(contentString);
        if (typeof parsed !== 'object' || parsed === null) return { type: 'text', content: contentString };
        if (parsed.text) return { type: 'text', content: parsed.text };
        if (parsed.image && parsed.image.url) return { type: 'image', content: '📷 Image' };
        if (parsed.interactive) return { type: 'interactive', content: 'Interactive: ' + (parsed.interactive.reply?.text || 'Button Click') };
        if (parsed.hsm) return { type: 'template', content: '📄 Template Message' };
        return { type: 'unsupported_json', content: 'Unsupported Message Format' };
    } catch (e) {
        return { type: 'text', content: contentString };
    }
};

// Add onCountsChange to the list of props
export default function ChatManager({ activeTab, searchTerm, onSelectChat, activeChat, setActiveTab, onCountsChange }) {
    const [unreadConversations, setUnreadConversations] = useState([]);
    const [inProgressConversations, setInProgressConversations] = useState([]);
    const [closedConversations, setClosedConversations] = useState([]);
    const [openedUnreadIds, setOpenedUnreadIds] = useState(() => {
        try {
            const storedIds = localStorage.getItem(OPENED_IDS_STORAGE_KEY);
            return storedIds ? new Set(JSON.parse(storedIds)) : new Set();
        } catch (error) {
            console.error("Failed to parse openedUnreadIds from localStorage", error);
            return new Set();
        }
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isInitialLoad = useRef(true);

    // --- NEW: useEffect to report counts to the parent component ---
    useEffect(() => {
        if (onCountsChange) {
            onCountsChange({
                unread: unreadConversations.length,
                inProgress: inProgressConversations.length,
                closed: closedConversations.length,
            });
        }
    }, [unreadConversations, inProgressConversations, closedConversations, onCountsChange]);


    useEffect(() => {
        try {
            localStorage.setItem(OPENED_IDS_STORAGE_KEY, JSON.stringify(Array.from(openedUnreadIds)));
        } catch (error) {
            console.error("Failed to save openedUnreadIds to localStorage", error);
        }
    }, [openedUnreadIds]);

    const fetchAndProcessConversations = useCallback(async () => {
        // ... (This function remains unchanged)
        if (isInitialLoad.current) setLoading(true);
        setError(null);
        try {
            const convosResponse = await axios.get(`${API_BASE_URL}/conversations`);

            // --- MODIFICATION START: Filter out the blocked number ---
            const BLOCKED_NUMBER = "254704313261";
            const allConversations = (convosResponse.data || []).filter(c => c.msisdn !== BLOCKED_NUMBER);
            // --- MODIFICATION END ---

            const openList = allConversations.filter(c => c.isClosed !== true);
            const closedList = allConversations.filter(c => c.isClosed === true);

            const processedClosed = closedList.map(conv => {
                const parsed = parseMessageContent(conv.lastMessage);
                return {
                    id: conv.id,
                    contactName: conv.contactName,
                    msisdn: conv.msisdn,
                    content: parsed.content,
                    timestamp: conv.lastReceivedAt,
                    messageType: parsed.type,
                    isClosed: true,
                    messages: [{ from: { name: conv.contactName, phoneNumber: conv.msisdn } }]
                };
            });
            const filteredClosed = processedClosed.filter(conv => !['empty', 'interactive', 'template'].includes(conv.messageType));
            setClosedConversations(filteredClosed);

            if (openList.length > 0) {
                const messagePromises = openList.map(async (conv) => {
                    try {
                        const messagesResponse = await axios.get(`${API_BASE_URL}/messages/${conv.id}?page=0&size=50`);
                        return { conversation: conv, messages: messagesResponse.data || [], hasSentMessage: (messagesResponse.data || []).some(msg => msg.direction === 'sent') };
                    } catch (err) {
                        return { conversation: conv, messages: [], hasSentMessage: false };
                    }
                });
                const messageResults = await Promise.all(messagePromises);
                const processedOpenConvos = messageResults.map(result => {
                    const { conversation, messages, hasSentMessage } = result;
                    const lastMessage = messages.length > 0
                        ? [...messages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
                        : { content: conversation.lastMessage, createdAt: conversation.lastReceivedAt, direction: 'received' };
                    const parsed = parseMessageContent(lastMessage.content);
                    return {
                        id: conversation.id,
                        contactName: conversation.contactName,
                        msisdn: conversation.msisdn,
                        content: parsed.content,
                        timestamp: lastMessage.createdAt,
                        hasSentMessage: hasSentMessage,
                        hasNewMessage: lastMessage.direction === 'received',
                        messageType: parsed.type,
                        isClosed: false,
                        messages: [{ from: { name: conversation.contactName, phoneNumber: conversation.msisdn } }]
                    };
                });
                const filteredOpenConvos = processedOpenConvos.filter(conv => !['empty', 'interactive', 'template'].includes(conv.messageType));
                const newUnread = [];
                const newInProgress = [];
                filteredOpenConvos.forEach(conv => {
                    if (conv.hasSentMessage || openedUnreadIds.has(conv.id)) {
                        newInProgress.push(conv);
                    } else {
                        newUnread.push(conv);
                    }
                });
                setUnreadConversations(newUnread);
                setInProgressConversations(newInProgress);
            } else {
                setUnreadConversations([]);
                setInProgressConversations([]);
            }
        } catch (err) {
            console.error("Failed to fetch conversations:", err);
            setError(err.message || "Failed to load conversations");
        } finally {
            if (isInitialLoad.current) { setLoading(false); isInitialLoad.current = false; }
        }
    }, [openedUnreadIds]);

    useEffect(() => {
        fetchAndProcessConversations();
        const interval = setInterval(fetchAndProcessConversations, 15000);
        return () => clearInterval(interval);
    }, [fetchAndProcessConversations]);

    const handleLocalSelectChat = (selectedConversation) => {
        // ... (This function remains unchanged)
        onSelectChat(selectedConversation);
        const isCurrentlyUnread = unreadConversations.some(c => c.id === selectedConversation.id);
        if (isCurrentlyUnread) {
            setUnreadConversations(prev => prev.filter(c => c.id !== selectedConversation.id));
            setInProgressConversations(prev => {
                const otherConversations = prev.filter(c => c.id !== selectedConversation.id);
                return [selectedConversation, ...otherConversations];
            });
            setOpenedUnreadIds(prev => new Set(prev).add(selectedConversation.id));
            setActiveTab('In-Progress');
        }
    };

    if (loading) return <div className="p-4 text-center text-gray-500">Loading conversations...</div>;
    if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

    return (
        <div className="mt-2">
            {activeTab === 'Unread' && ( <UnreadMessages conversations={unreadConversations} onSelectChat={handleLocalSelectChat} searchTerm={searchTerm} /> )}
            {activeTab === 'In-Progress' && ( <InProgressMessages conversations={inProgressConversations} onSelectChat={handleLocalSelectChat} activeChat={activeChat} searchTerm={searchTerm} /> )}
            {activeTab === 'Closed' && ( <ClosedMessages conversations={closedConversations} onSelectChat={onSelectChat} activeChat={activeChat} searchTerm={searchTerm} /> )}
        </div>
    );
}