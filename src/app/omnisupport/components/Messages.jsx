import { useState } from 'react';
import UnreadMessages from './UnreadMessages';
import InProgressMessages from './InProgressMessages';
import ClosedMessages from './ClosedMessages';
import { Search } from "lucide-react";


export default function Messages({ onSelectChat }) {
  const [activeTab, setActiveTab] = useState('Unread');
  const [filter, setFilter] = useState(''); // State for filtering messages
  const [sortOrder, setSortOrder] = useState('newest'); // New state for sorting order

  const handleFilterClick = () => {
    const keyword = prompt('Enter filter keyword:');
    setFilter(keyword || ''); // Set filter from user input
    // Optionally add prompt for sorting
    const sortOption = prompt("Sort by: 'newest' or 'oldest'");
    setSortOrder(sortOption || 'newest'); // Set sort option
  };

  return (
    <div className="bg-white pt-5 flex flex-col shadow-lg">
      {/* Header with Filter and New Button */}
      <div className="flex justify-between px-4 items-center">
        <h2 className="text-lg mt-5 font-semibold">Messages</h2>
        <div className="flex items-center gap-3">
          {/* Filter Icon with Clickable Functionality */}
          <div
          className="flex items-center gap-1 mt-5 cursor-pointer text-gray-600"
          onClick={handleFilterClick}
        >
          <Search size={25} strokeWidth={1.6} className="text-gray-600" />
          <span className="text-lg ml-2 font-medium">Search</span>
        </div>
          {/* New Button */}
          <button className="border border-blue-600 text-blue-600 px-4 py-1 mt-5 rounded-xl font-medium ml-5 flex items-center gap-2 hover:bg-blue-100">
            New <span className="text-xl">+</span>
          </button>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="flex border-b justify-between  mt-5 px-6 ">
        {['Unread', 'In-Progress', 'Closed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm mx-3  font-medium ${
              activeTab === tab
                ? 'text-blue-600 border-b-4 font-medium  border-blue-600'
                : 'text-gray-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      <div className="mt-2">
        {activeTab === 'Unread' && (
          <UnreadMessages
            onSelectChat={onSelectChat}
            filter={filter}
            sortOrder={sortOrder}
          />
        )}
        {activeTab === 'In-Progress' && (
          <InProgressMessages onSelectChat={onSelectChat} />
        )}
        {activeTab === 'Closed' && <ClosedMessages />}
      </div>
    </div>
  );
}
