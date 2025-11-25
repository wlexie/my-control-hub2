"use client"; // <--- Add this line here as well


import React, { useState } from 'react';
import { FaRegFileAlt } from 'react-icons/fa';
import CreateCampaignModal from './CreateCampaignModal';
import SmsTemplatesModal from './SmsTemplatesModal';

const TopNav: React.FC = () => {
  const [isCreateCampaignModalOpen, setIsCreateCampaignModalOpen] = useState(false);
  const [isSmsTemplatesModalOpen, setIsSmsTemplatesModalOpen] = useState(false); 

  return (
    <nav className="bg-white p-4 px-8 flex justify-between items-center border-b border-gray-200">
      <h1 className="text-xl font-semibold text-gray-800">SMS Campaigns</h1>

      <div className="flex space-x-4">
        <button
          onClick={() => setIsSmsTemplatesModalOpen(true)} // Open SMS Templates modal
          className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <FaRegFileAlt className="mr-2" />
          Templates
        </button>

        <button
          onClick={() => setIsCreateCampaignModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium"
        >
          Create Campaign
        </button>
      </div>

      <CreateCampaignModal
        isOpen={isCreateCampaignModalOpen}
        onClose={() => setIsCreateCampaignModalOpen(false)}
      />

      <SmsTemplatesModal
        isOpen={isSmsTemplatesModalOpen}
        onClose={() => setIsSmsTemplatesModalOpen(false)}
      />
    </nav>
  );
};

export default TopNav;