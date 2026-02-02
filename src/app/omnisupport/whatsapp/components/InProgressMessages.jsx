import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { FaWhatsapp } from 'react-icons/fa';
import { useInView } from 'react-intersection-observer';

const getCountryCode = (msisdn) => {
  if (!msisdn || typeof msisdn !== 'string') return null;
  const formattedMsisdn = msisdn.startsWith('+') ? msisdn : `+${msisdn}`;
  try {
    const phoneNumber = parsePhoneNumberFromString(formattedMsisdn);
    return phoneNumber?.country || null;
  } catch (err) {
    return null;
  }
};

const formatTimestamp = (timestampStr) => {
  if (!timestampStr) return "";
  const date = new Date(timestampStr);
  date.setHours(date.getHours() + 3);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const msgDay = new Date(date);
  msgDay.setHours(0, 0, 0, 0);

  if (msgDay.getTime() === today.getTime()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }
  if (msgDay.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
};

const avatarColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500'];

export default function InProgressMessages({ onSelectChat, activeChat, searchTerm = "" }) {
  const { accessToken } = useSelector(state => state.auth);
  const [conversations, setConversations] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  
  // Updated state to store an object with assignment details
  const [assignmentDetails, setAssignmentDetails] = useState({}); 

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { ref, inView } = useInView({ threshold: 0.5 });

  const fetchConversations = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const res = await axios.get("https://com.tuma-app.com/api/conversations/in-progress", {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { page, size: 15 }
      });

      if (Array.isArray(res.data.content)) {
        setConversations(prev => [...prev, ...res.data.content]);
        setPage(prev => prev + 1);
        setHasMore(!res.data.last);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError(err.message || "Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, page, hasMore, isLoading]);

  useEffect(() => {
    if (inView && accessToken) fetchConversations();
  }, [inView, accessToken, fetchConversations]);

  useEffect(() => {
    if (!accessToken || conversations.length === 0) return;

    const enrichConversationData = async () => {
      const newCounts = {};
      const newAssignments = {};

      await Promise.all(
        conversations.map(async (conv) => {
          // 1. Fetch Unread Count
          if (unreadCounts[conv.ticketId] === undefined) {
            try {
              const res = await axios.get(`https://com.tuma-app.com/api/conversations/${conv.ticketId}/unread-count`,
                { headers: { Authorization: `Bearer ${accessToken}` } });
              newCounts[conv.ticketId] = res.data;
            } catch (err) { newCounts[conv.ticketId] = 0; }
          }

          // 2. Fetch History to find "Assigned By"
          if (assignmentDetails[conv.ticketId] === undefined) {
            try {
              const res = await axios.get(`https://com.tuma-app.com/api/conversations/${conv.ticketId}`,
                { headers: { Authorization: `Bearer ${accessToken}` } });
              
              const history = res.data.history || [];
              const latestAssignment = history.length > 0 ? history[0] : null;

              newAssignments[conv.ticketId] = {
                isAssigned: history.length > 0,
                // We take the previousAgentName from the latest history entry
                assignedBy: latestAssignment ? latestAssignment.newAgentName : null
              };
            } catch (err) { 
              newAssignments[conv.ticketId] = { isAssigned: false, assignedBy: null }; 
            }
          }
        })
      );

      if (Object.keys(newCounts).length > 0) setUnreadCounts(prev => ({ ...prev, ...newCounts }));
      if (Object.keys(newAssignments).length > 0) setAssignmentDetails(prev => ({ ...prev, ...newAssignments }));
    };

    enrichConversationData();
  }, [conversations, accessToken]);

  // SSE logic
  useEffect(() => {
    const eventSource = new EventSource("https://com.tuma-app.com/api/sse/subscribe");
    eventSource.addEventListener("conversation-update", (event) => {
      try {
        const updatedConv = JSON.parse(event.data);
        setConversations(prev => {
          const index = prev.findIndex(c => c.ticketId === updatedConv.ticketId);
          const newConversations = [...prev];
          if (updatedConv.status !== 'IN_PROGRESS') {
             if (index !== -1) newConversations.splice(index, 1);
          } else {
            if (index !== -1) newConversations[index] = updatedConv;
            else newConversations.unshift(updatedConv);
          }
          return newConversations;
        });
      } catch (e) {}
    });
    return () => eventSource.close();
  }, []);

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
        {filteredConversations.map((conv, idx) => {
            const avatarColor = avatarColors[idx % avatarColors.length];
            const countryCode = getCountryCode(conv.contactPhone);
            const avatarText = (conv.contactName || conv.contactPhone || "??").slice(0, 2).toUpperCase();
            const unreadCount = unreadCounts[conv.ticketId] || 0;
            
            // Get the enriched assignment data
            const assignInfo = assignmentDetails[conv.ticketId];

            return (
              <div
                key={conv.ticketId}
                className={`cursor-pointer px-4 py-2 border-b flex justify-between items-center transition ${activeChat?.ticketId === conv.ticketId ? "bg-gray-100" : "bg-white hover:bg-gray-50"}`}
                onClick={() => onSelectChat({ ...conv, tumaId: conv.tumaId })}
              >
                <div className="flex items-start w-full">
                  <div className="relative mr-3 shrink-0">
                    <div className={`w-10 h-10 ${avatarColor} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>{avatarText}</div>
                    {countryCode && (
                      <img className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white object-cover" src={`https://flagcdn.com/${countryCode.toLowerCase()}.svg`} alt={countryCode}/>
                    )}
                  </div>
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <p className="font-medium text-gray-900 mb-1 text-sm">{conv.contactName || conv.contactPhone}</p>
                      <p className="text-gray-500 text-xs truncate max-w-[152px]">{conv.lastMessage}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="ml-auto flex items-center shrink-0 mb-2 pl-2">
                        <FaWhatsapp className="text-green-500 mr-1 text-sm" />
                        <p className="text-xs text-gray-400 whitespace-nowrap">{formatTimestamp(conv.lastMessageTime)}</p>
                        {unreadCount > 0 && activeChat?.ticketId !== conv.ticketId && (
                          <div className="ml-2 w-4 h-4 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center">{unreadCount}</div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {assignInfo?.isAssigned && (
                          <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            Assigned
                          </span>
                        )}
                        <span className="text-xs text-yellow-600 font-medium">
                          <span className="text-gray-500 mr-1 font-normal text-[9px]">To:</span>
                          {/* Logic: Show assigner's name. If null (initial assignment), show current agent */}
                          {assignInfo?.assignedBy || conv.assignedAgentName || "Unassigned"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
        })}
        {hasMore && <div ref={ref} className="flex justify-center p-4">{isLoading && <p className="text-gray-500 text-xs">Loading...</p>}</div>}
      </div>
    </div>
  );
}

InProgressMessages.propTypes = {
  onSelectChat: PropTypes.func.isRequired,
  activeChat: PropTypes.object,
  searchTerm: PropTypes.string,
};