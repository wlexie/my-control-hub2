// NewTemplateFormModal.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';

export default function NewTemplateFormModal({ onClose, onAdd, existingTitles }) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Category Title and Message are required.');
      return;
    }
    // Pass the new template data up to the parent component
    onAdd({ title: title.trim(), subtitle: subtitle.trim(), message: message.trim() });
  };

  return (
    // This modal sits on top of the other one, hence the higher z-index (z-50)
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <h2 className="text-xl font-bold mb-4 text-gray-800">Create New Template</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="category-title" className="block text-sm font-medium text-gray-700 mb-1">
              Category Title
            </label>
            <input
              type="text"
              id="category-title"
              list="existing-titles" // Connects to the datalist below
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Payments or create a new one"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {/* Datalist provides autocomplete suggestions from existing titles */}
            <datalist id="existing-titles">
              {existingTitles.map(t => <option key={t} value={t} />)}
            </datalist>
          </div>

          <div>
            <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-1">
              Subtitle (Optional)
            </label>
            <input
              type="text"
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g., Refund Processed"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter the template message here. Use [User Name] for placeholders."
              rows="6"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

NewTemplateFormModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  existingTitles: PropTypes.arrayOf(PropTypes.string).isRequired,
};