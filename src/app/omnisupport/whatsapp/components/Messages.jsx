import { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Search, Plus } from 'lucide-react';
import Modal2 from './Modal2';

// Import the tab components
import UnreadMessages from './UnreadMessages';
import InProgressMessages from './InProgressMessages';
import ClosedMessages from './ClosedMessages';

export default function Messages({ onSelectChat, activeChat }) {
  const [activeTab, setActiveTab] = useState('Unread');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const { accessToken } = useSelector((state) => state.auth);

  // You can later fetch these counts from an API or a state manager
  const [conversationCounts, setConversationCounts] = useState({
    unread: 0,
    inProgress: 0,
    closed: 0,
  });

  // This function handles opening a ticket and then switching tabs
  const handleSelectAndOpenChat = async (conversation) => {
    if (!conversation || !conversation.ticketId) return;

    try {
      // Call the API to mark the conversation as "open"
      await axios.post(
        `https://com.tuma-app.com/api/conversations/${conversation.ticketId}/open`,
        {}, // No body is needed for this POST request
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // 1. Set the selected chat as the active one in the parent component
      onSelectChat(conversation);

      // 2. Switch the active tab to "In-Progress"
      setActiveTab('In-Progress');

      // 3. Optional: Re-fetch counts or update them manually
      setConversationCounts(prev => ({
          ...prev,
          unread: Math.max(0, prev.unread - 1),
          inProgress: prev.inProgress + 1
      }));


    } catch (error) {
      console.error("Error opening conversation:", error);
      // Optionally, show an error message to the user
    }
  };

  const tabs = [
    { name: 'Unread', count: conversationCounts.unread, color: 'red' },
    { name: 'In-Progress', count: conversationCounts.inProgress, color: 'yellow' },
    { name: 'Closed', count: conversationCounts.closed, color: 'gray' },
  ];

  const badgeColors = {
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-gray-200 text-gray-800',
  };

  return (
    <div className="bg-white pt-5 flex flex-col shadow-lg h-full">
      <div className="px-4 mb-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-semibold text-gray-600">
            Active tickets
          </h1>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>New</span>
          </button>
        </div>

        {/* Search by Contact Name */}
        <div className="relative w-full">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by contact name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b justify-between px-4 mt-2">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`flex items-center gap-2 pb-2 text-sm font-semibold relative transition-colors duration-200
              ${activeTab === tab.name ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
          >
            <span>{tab.name}</span>
            <span
              className={`px-2 py-0.5 text-xs font-bold rounded-md ${badgeColors[tab.color]}`}
            >
              {tab.count}
            </span>
            {activeTab === tab.name && (
              <div className="absolute bottom-[-1px] left-0 w-full h-1 bg-blue-600 rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Conditionally Rendered Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'Unread' && (
          <UnreadMessages
            onSelectChat={handleSelectAndOpenChat} // Use the new handler here
            searchTerm={searchTerm}
          />
        )}
        {activeTab === 'In-Progress' && (
          <InProgressMessages
            onSelectChat={onSelectChat} // In-progress chats are already open
            activeChat={activeChat}
            searchTerm={searchTerm}
          />
        )}
        {activeTab === 'Closed' && (
          <ClosedMessages
            onSelectChat={onSelectChat} // Closed chats don't need to be opened
            activeChat={activeChat}
            searchTerm={searchTerm}
          />
        )}
      </div>

      {/* Modal for new message */}
      <Modal2
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}