import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useSelector } from 'react-redux'; // Import Redux to get Token
import { Loader2 } from 'lucide-react';

export default function NewTemplateFormModal({
  onClose,
  onAdd,
  existingTitles = [] // passed from parent to help with autocomplete
}) {
  // --- REDUX STATE ---
  const { accessToken } = useSelector((state) => state.auth);

  // --- LOCAL STATE ---
  const [categoryTitle, setCategoryTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [message, setMessage] = useState('');
  
  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // API URL
  const API_URL = 'http://localhost:8080/api/whatsapp/templates';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validation
    if (!categoryTitle.trim()) {
      setError('Category Title is required.');
      setIsSubmitting(false);
      return;
    }
    if (!message.trim()) {
      setError('Message content is required.');
      setIsSubmitting(false);
      return;
    }

    try {
   // Correct Frontend Payload
      const payload = {
        categoryTitle: categoryTitle.trim(),
        subtitle: subtitle.trim(), 
        message: message.trim()    
      };

      // POST Request
      const response = await axios.post(API_URL, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      // Notify Parent & Close
      onAdd(response.data); // Pass back the updated category data
      onClose();

    } catch (err) {
      console.error('Error creating template:', err);
      if (err.response && err.response.data) {
        // Try to show backend error message
        setError(`Error: ${err.response.data.message || 'Failed to save template.'}`);
      } else {
        setError('Failed to connect to the server.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Template</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 1. Category Title Input (with Autocomplete) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              list="existing-titles" // Connects to datalist below
              value={categoryTitle}
              onChange={(e) => setCategoryTitle(e.target.value)}
              placeholder="e.g. Payments (or type a new one to create)"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {/* Autocomplete List */}
            <datalist id="existing-titles">
              {existingTitles.map((title, index) => (
                <option key={index} value={title} />
              ))}
            </datalist>
            <p className="text-xs text-gray-500 mt-1">
              Type an existing name to select it, or a new name to create a new category automatically.
            </p>
          </div>

          {/* 2. Subtitle Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subtitle <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Refund Processed"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 3. Message Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter message here. Use [User Name] for dynamic name."
              rows="6"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmitting ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

NewTemplateFormModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired, // Callback to refresh parent list
  existingTitles: PropTypes.arrayOf(PropTypes.string),
};