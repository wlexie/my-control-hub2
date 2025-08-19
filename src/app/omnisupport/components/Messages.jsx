// src/components/Messages.jsx

import { useState } from 'react';
import NewContact from './NewContact';
import ChatManager from './ChatManager';
import { Search, Plus } from 'lucide-react';

export default function Messages({ onSelectChat, activeChat }) {
  // Set the default active tab to 'In-Progress' to match the image
  const [activeTab, setActiveTab] = useState('In-Progress');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);

  // State to hold the counts received from ChatManager
  const [conversationCounts, setConversationCounts] = useState({
    unread: 0,
    inProgress: 0,
    closed: 0,
  });

  const handleSelectContact = (contact) => {
    const newConversation = {
      id: contact.contactId || contact.msisdn,
      contactName: contact.contactName || contact.msisdn,
      msisdn: contact.msisdn,
      content: '',
      timestamp: new Date().toISOString(),
      hasNewMessage: false,
      hasSentMessage: false,
    };
    onSelectChat(newConversation);
    setModalOpen(false);
  };

  // Data structure for tabs to make rendering cleaner
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
        {/* Row 1: Title and New Button */}
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

        {/* Row 2: Search Bar */}
        <div className="relative w-full">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
        </div>
      </div>

      {/* --- UPDATED TABS SECTION --- */}
      <div className="flex border-b justify-between px-4  mt-2">
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
            {/* The blue underline for the active tab */}
            {activeTab === tab.name && (
              <div className="absolute bottom-[-1px] left-0 w-full h-1 bg-blue-600 rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <ChatManager
          activeTab={activeTab}
          searchTerm={searchTerm}
          onSelectChat={onSelectChat}
          activeChat={activeChat}
          setActiveTab={setActiveTab}
          // Pass the state setter function as a callback to receive counts
          onCountsChange={setConversationCounts}
        />
      </div>

      <NewContact
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSelectContact={handleSelectContact}
      />
    </div>
  );
}