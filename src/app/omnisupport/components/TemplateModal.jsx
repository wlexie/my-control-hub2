"use client"; // This directive is ESSENTIAL for App Router client components

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { X, BotMessageSquare, Loader2 } from 'lucide-react';

// Template names taken directly from your screenshot
const TEMPLATES = [
  'welcome_dormant',
  'welcome_basics',
  'welcome_active',
  'potential_user',
  'welcome_declined',
  'welcome_leads'
];

export default function TemplateModal({ closeModal, onSelectTemplate, userName }) {
  const [sendingTemplate, setSendingTemplate] = useState(null);

  const handleSelect = async (templateName) => {
    // Show loading state immediately for better UX
    setSendingTemplate(templateName);
    // The parent component handles the async logic
    await onSelectTemplate(templateName);
    // The parent can decide when to close the modal, but we can reset our loading state
    setSendingTemplate(null); 
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={closeModal}>
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative transform transition-all"
        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
      >
        <button 
          onClick={closeModal} 
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-green-100 p-2 rounded-full">
            <BotMessageSquare className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Send a Template</h2>
            <p className="text-sm text-gray-500">Choose a template to send to {userName}.</p>
          </div>
        </div>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
          {TEMPLATES.map((name) => (
            <button
              key={name}
              onClick={() => handleSelect(name)}
              disabled={!!sendingTemplate} // Disable all buttons while one is sending
              className="w-full flex items-center text-left p-3 rounded-lg transition-colors hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
              <span className="flex-grow font-medium text-gray-700 capitalize">
                {name.replace(/_/g, ' ')}
              </span>
              {sendingTemplate === name ? (
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              ) : (
                <span className="text-xs text-white bg-green-500 font-semibold px-2 py-1 rounded-full">SEND</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

TemplateModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  onSelectTemplate: PropTypes.func.isRequired,
  userName: PropTypes.string.isRequired,
};