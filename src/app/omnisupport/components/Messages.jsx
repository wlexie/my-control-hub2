// src/components/Messages.jsx

import { useState } from 'react';
import UnreadMessages from './UnreadMessages';
import InProgressMessages from './InProgressMessages';
import ClosedMessages from './ClosedMessages';
import NewContact from './NewContact'; // <-- Import the new modal component
import { Search } from 'lucide-react';

export default function Messages({ onSelectChat }) {
  const [activeTab, setActiveTab] = useState('Unread');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setModalOpen] = useState(false); // <-- State to control the modal

  // This function will be called when a contact is selected from the modal
  const handleSelectContact = (contact) => {
    // Format the selected contact into the 'conversation' object shape
    // that the `onSelectChat` function expects.
    const newConversation = {
      id: contact.contactId || contact.msisdn, // Use a unique ID
      messages: [{
        from: {
          name: contact.contactName || contact.msisdn,
          phoneNumber: contact.msisdn
        },
        content: '', // Start with an empty message
        timestamp: new Date().toISOString()
      }]
    };
    onSelectChat(newConversation);
    setModalOpen(false); // Close the modal after selection
  };

  return (
    <div className="bg-white pt-5 flex flex-col shadow-lg">
      {/* Header with Search and New Button */}
      <div className="flex justify-between px-4 items-center gap-4">
        <h2 className="text-lg mt-5 font-semibold">Messages</h2>
        <div className="flex items-center gap-3">
          {/* Search Input Field */}
          <div className="relative mt-5 flex-grow">
            <Search
              size={20}
              strokeWidth={2}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Search by name or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* New Button -- Updated to open the modal */}
          <button
            onClick={() => setModalOpen(true)} // <-- Open modal on click
            className="border border-blue-600 text-blue-600 px-4 py-1 mt-5 rounded-xl font-medium flex items-center gap-2 hover:bg-blue-100 whitespace-nowrap"
          >
            New <span className="text-xl">+</span>
          </button>
        </div>
      </div>

      {/* Tabs Section (Unchanged) */}
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

      {/* Content based on active tab (Unchanged) */}
      <div className="mt-2">
        {activeTab === 'Unread' && (
          <UnreadMessages
            onSelectChat={onSelectChat}
            searchTerm={searchTerm}
          />
        )}
        {activeTab === 'In-Progress' && (
          <InProgressMessages
            onSelectChat={onSelectChat}
            searchTerm={searchTerm}
          />
        )}
        {activeTab === 'Closed' && (
          <ClosedMessages
            onSelectChat={onSelectChat}
            searchTerm={searchTerm}
          />
        )}
      </div>

      {/* Render the Modal */}
      <NewContact
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSelectContact={handleSelectContact}
      />
    </div>
  );
}