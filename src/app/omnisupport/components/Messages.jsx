// src/components/Messages.jsx

import { useState } from 'react';
import NewContact from './NewContact';
import ChatManager from './ChatManager';
import { Search } from 'lucide-react';

export default function Messages({ onSelectChat, activeChat }) {
  const [activeTab, setActiveTab] = useState('Unread');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);

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

  return (
    <div className="bg-white pt-5 flex flex-col shadow-lg h-full">
      {/* Header with Search and New Button */}
      <div className="flex justify-between px-4 items-center gap-4">
        <h2 className="text-lg mt-5 font-semibold">Messages</h2>
        <div className="flex items-center gap-3">
          <div className="relative mt-5 flex-grow">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="border border-blue-600 text-blue-600 px-4 py-1 mt-5 rounded-xl font-medium flex items-center gap-2 hover:bg-blue-100 whitespace-nowrap"
          >
            New <span className="text-xl">+</span>
          </button>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="flex border-b justify-between mt-5 px-6">
        {['Unread', 'In-Progress', 'Closed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm mx-3 font-medium ${
              activeTab === tab
                ? 'text-blue-600 border-b-4 font-medium border-blue-600'
                : 'text-gray-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <ChatManager
          activeTab={activeTab}
          searchTerm={searchTerm}
          onSelectChat={onSelectChat}
          activeChat={activeChat}
          // CHANGE: Pass the setActiveTab function down as a prop
          setActiveTab={setActiveTab}
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