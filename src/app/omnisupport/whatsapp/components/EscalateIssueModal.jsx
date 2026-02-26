import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Loader2, ChevronDown } from 'lucide-react';
import axios from 'axios';
import PropTypes from 'prop-types';
// 1. Import useSelector from react-redux
import { useSelector } from 'react-redux';

export default function EscalateIssueModal({ closeModal, goBackToModal1 }) {
  // 2. Access the token from your auth slice
  // Based on your rootReducer: state.auth.accessToken
  const accessToken = useSelector((state) => state.auth.accessToken);

  const [reason, setReason] = useState('Technical Issue');
  const [priority, setPriority] = useState('Medium');
  const [escalateTo, setEscalateTo] = useState('Alex'); 
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const reasonOptions = ['Technical Issue', 'Customer Complaint', 'Billing Issue', 'System Bug', 'Other'];
  const priorityOptions = ['Low', 'Medium', 'High'];
  
  // These names match the keys in your Backend EscalationService SLACK_USER_IDS map
  const escalateToOptions = ['Alex', 'Linus', 'Ivy', 'Stacey', 'Bellamy', 'Marcus'];

  const handleSubmit = async () => {
    // Basic validation: check if token exists
    if (!accessToken) {
        setError("You are not authenticated. Please log in.");
        return;
    }

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
      // 3. Use the accessToken from Redux in the header
      const response = await axios.post('https://com.tuma-app.com/api/escalations', payload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Here is the payload", payload)
      
      if (response.status === 200 || response.status === 201) {
        setSuccess(`Ticket ${response.data.ticketNumber} created & Slack notified!`);
        setTimeout(() => {
          closeModal();
        }, 2500);
      }
    } catch (apiError) {
      console.error('Failed to submit escalation:', apiError);
      const errorMessage = apiError.response?.data?.error || 
                          apiError.response?.data?.message ||
                          'Internal Server Error. Please try again later.';
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderDropdown = (currentValue, options, setter, dropdownName) => (
    <div className="relative" ref={activeDropdown === dropdownName ? dropdownRef : null}>
      <button
        type="button"
        onClick={() => toggleDropdown(dropdownName)}
        className="w-full border rounded-lg mb-3 p-2 focus:outline-none focus:ring-1 focus:ring-gray-800 flex justify-between items-center bg-white"
      >
        <span className="text-gray-700">{currentValue}</span>
        <ChevronDown size={20} className={`transition-transform text-gray-400 ${activeDropdown === dropdownName ? 'rotate-180' : ''}`} />
      </button>
      {activeDropdown === dropdownName && (
        <div className="absolute z-50 w-full mt-[-8px] bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option}
              className={`p-3 hover:bg-gray-50 cursor-pointer text-sm border-b last:border-0 ${currentValue === option ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600'}`}
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
    <div className="fixed inset-0 flex justify-end bg-black/60 z-50 backdrop-blur-sm">
      <div className="w-96 h-full bg-white font-poppins px-6 shadow-2xl transform transition-transform duration-300 ease-in-out animate-slide-in overflow-y-auto">
        
        <div className="flex justify-between items-center mt-8 mb-10">
            <button onClick={goBackToModal1} className="text-gray-400 hover:text-gray-800 transition-colors">
                <ChevronLeft size={28} />
            </button>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-800 border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                ✕
            </button>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Escalate Issue</h2>
          <p className="text-sm text-gray-500 mb-8 font-medium">This will alert the team lead and notify Slack.</p>
          
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Reason</label>
          {renderDropdown(reason, reasonOptions, setReason, 'reason')}

          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mt-6 mb-2">Priority</label>
          {renderDropdown(priority, priorityOptions, setPriority, 'priority')}

          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mt-6 mb-2">Assign To</label>
          {renderDropdown(escalateTo, escalateToOptions, setEscalateTo, 'escalateTo')}

          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mt-6 mb-2">Notes</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded-lg p-3 h-32 focus:outline-none focus:ring-1 focus:ring-gray-800 text-gray-700 resize-none"
            placeholder="What is the current status of the issue?..."
          ></textarea>

          {error && <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 font-medium tracking-tight italic">⚠️ {error}</div>}
          {success && <div className="mt-4 p-3 bg-green-50 text-green-600 text-xs rounded-lg border border-green-100 font-bold">✅ {success}</div>}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="mt-8 bg-gray-900 text-white py-3 px-6 rounded-xl hover:bg-black w-full shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center font-bold transition-all active:scale-95"
          >
            {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</> : 'Send Escalation'}
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