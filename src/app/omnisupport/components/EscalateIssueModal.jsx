// src/components/EscalateIssueModal.jsx
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Loader2, ChevronDown } from 'lucide-react';
import axios from 'axios';
import PropTypes from 'prop-types';

export default function EscalateIssueModal({ closeModal, goBackToModal1 }) {
  // State to manage form inputs and submission status
  const [reason, setReason] = useState('Technical Issue');
  const [priority, setPriority] = useState('Medium');
  const [escalateTo, setEscalateTo] = useState('Support Team');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // State for custom dropdowns
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const reasonOptions = ['Technical Issue', 'Customer Complaint', 'Billing Issue', 'Other'];
  const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];
  const escalateToOptions = ['Support Team', 'Manager', 'Technical Lead'];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    const payload = {
      reason,
      priority,
      escalateTo,
      notes,
    };
    
    try {
      const response = await axios.post('/api/escalate', payload);
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setSuccess('Issue has been successfully escalated!');
      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (apiError) {
      console.error('Failed to submit escalation:', apiError);
      const errorMessage = apiError.response?.data?.error || 
                          apiError.message || 
                          'Failed to submit escalation. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const handleOptionSelect = (value, setter) => {
    setter(value);
    setActiveDropdown(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const renderDropdown = (currentValue, options, setter, dropdownName) => (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => toggleDropdown(dropdownName)}
        className="w-full border rounded-lg mb-3 p-2 focus:outline-none focus:ring focus:border-blue-300 flex justify-between items-center"
      >
        <span>{currentValue}</span>
        <ChevronDown size={20} className={`transition-transform ${activeDropdown === dropdownName ? 'rotate-180' : ''}`} />
      </button>
      {activeDropdown === dropdownName && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          {options.map((option) => (
            <div
              key={option}
              className={`p-2 hover:bg-gray-100 cursor-pointer ${currentValue === option ? 'bg-gray-100 font-medium' : ''}`}
              onClick={() => handleOptionSelect(option, setter)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 flex justify-end bg-black/50 z-50">
      <div className="w-2/7 h-full bg-white font-poppins text-lg px-4 shadow-lg transform transition-transform duration-300 ease-in-out animate-slide-in overflow-y-auto">
        <button onClick={goBackToModal1} className="text-gray-600 hover:text-gray-800 mt-7 p-1">
          <ChevronLeft size={30} />
        </button>

        <button onClick={closeModal} className="absolute top-7 right-5 text-gray-600 hover:text-gray-800 border-2 border-gray-600 rounded-full px-2 font-semibold">
          ✕
        </button>

        <div className="p-6 mt-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Escalate Issue
          </h2>
          
          <label className="block text-gray-400 mb-2">Reason for Escalation:</label>
          {renderDropdown(reason, reasonOptions, setReason, 'reason')}

          <label className="block text-gray-400 mt-4 mb-2">Priority Level:</label>
          {renderDropdown(priority, priorityOptions, setPriority, 'priority')}

          <label className="block text-gray-400 mt-4 mb-2">Escalate To:</label>
          {renderDropdown(escalateTo, escalateToOptions, setEscalateTo, 'escalateTo')}

          <label className="block text-gray-400 mt-4 mb-2">Additional Notes:</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded-lg p-2 h-28 focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter any additional details about the issue..."
          ></textarea>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {success && <p className="text-green-500 text-sm mt-2">{success}</p>}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="mt-6 bg-gray-800 text-white py-2 px-6 rounded-lg hover:bg-gray-700 w-full disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isSubmitting ? (
                <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                </>
            ) : (
                'Submit'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

EscalateIssueModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  goBackToModal1: PropTypes.func.isRequired,
};