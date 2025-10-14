import React, { useState } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import { FaRegFileAlt, FaLock, FaCreditCard } from 'react-icons/fa';
import { HiOutlineLightBulb } from 'react-icons/hi';

interface SmsTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SmsTemplatesModal: React.FC<SmsTemplatesModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [showCreateForm, setShowCreateForm] = useState(false); // New state for form visibility

  const templates = [
    {
      id: 1,
      type: 'Promotional',
      title: 'Black Friday Special',
      icon: <HiOutlineLightBulb className="text-yellow-500" />,
      content: 'Black Friday is here! Get up to 50% off on all transfers to {corridor}. Use code BF2024. Valid until Nov 30th. Send money now!',
      chars: 142,
    },
    {
      id: 2,
      type: 'Alert',
      title: 'Security Alert',
      icon: <FaLock className="text-blue-500" />,
      content: 'Security Alert: We detected a login attempt from a new device. If this wasn\'t you, please contact support immediately. Stay safe!',
      chars: 156,
    },
    {
      id: 3,
      type: 'Reminder',
      title: 'Payment Reminder',
      icon: <FaCreditCard className="text-green-500" />,
      content: 'Hi {first_name}, your payment is overdue. Please complete your payment to avoid service interruption. Pay now: [link]',
      chars: 128,
    },
    // Add more templates as needed
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All' || template.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getFilterButtonClass = (filterType: string) =>
    `px-3 py-1 rounded-md text-sm font-medium ${
      activeFilter === filterType
        ? 'bg-blue-600 text-white'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }`;

  const handleNewTemplateClick = () => {
    setShowCreateForm(true);
  };

  const handleCloseCreateForm = () => {
    setShowCreateForm(false);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 bg-opacity-50"
          onClick={onClose}
        ></div>
      )}

      {/* Modal */}
      <div
        className={`fixed inset-y-0 right-0 z-50 bg-white shadow-lg
          transform transition-transform duration-600 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          w-full max-w-lg md:max-w-md  h-full flex flex-col`}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">SMS Templates</h2>
          <div className="flex items-center space-x-2">
            {!showCreateForm && ( // Only show "New Template" button when form is not visible
              <button
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none text-sm"
                onClick={handleNewTemplateClick}
              >
                + New Template
              </button>
            )}
            <button
              onClick={showCreateForm ? handleCloseCreateForm : onClose} // Close form or modal
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <IoCloseOutline className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Conditional rendering of the form or template list */}
        {showCreateForm ? (
          // Create New Template Form
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">Create New Template</h3>
                <button
                  onClick={handleCloseCreateForm}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <IoCloseOutline className="text-xl" />
                </button>
              </div>

              {/* Form fields */}
              <div className="mb-4">
                <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="templateName"
                  placeholder="e.g., Welcome Message"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Select category</option>
                  <option>Promotional</option>
                  <option>Alert</option>
                  <option>Reminder</option>
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="messageBody" className="block text-sm font-medium text-gray-700 mb-1">
                  Message Body <span className="text-red-500">*</span>
                </label>
                <div className="flex justify-end text-sm text-blue-600 space-x-2 mb-1">
                  <button className="hover:underline">{'first_name'}</button>
                  <button className="hover:underline">{'corridor'}</button>
                </div>
                <textarea
                  id="messageBody"
                  rows={5}
                  placeholder="Type your template message here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                ></textarea>
                <div className="text-right text-sm text-gray-500 mt-1">0/500 characters • 1 SMS</div>
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-700 mb-1">Preview:</h4>
                <p className="p-3 bg-blue-500 text-white rounded-md text-sm">
                  Your template message will appear here...
                  <br />
                  <span className="text-xs opacity-80">TUMA Support</span>
                </p>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCloseCreateForm}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none text-sm font-medium"
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search templates..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex space-x-2">
                <button className={getFilterButtonClass('All')} onClick={() => setActiveFilter('All')}>
                  All
                </button>
                <button className={getFilterButtonClass('Promotional')} onClick={() => setActiveFilter('Promotional')}>
                  Promotional
                </button>
                <button className={getFilterButtonClass('Alert')} onClick={() => setActiveFilter('Alert')}>
                  Alerts
                </button>
                <button className={getFilterButtonClass('Reminder')} onClick={() => setActiveFilter('Reminder')}>
                  Reminders
                </button>
              </div>
            </div>

            {/* Templates List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredTemplates.length > 0 ? (
                filteredTemplates.map((template) => (
                  <div key={template.id} className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        {template.icon}
                        <h3 className="text-lg font-medium text-gray-800">{template.title}</h3>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Use
                      </button>
                    </div>
                    <p className="text-gray-600 mb-2 text-base">{template.content}</p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{template.type}</span>
                      <span>{template.chars} chars</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 mt-8">No templates found.</p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SmsTemplatesModal;