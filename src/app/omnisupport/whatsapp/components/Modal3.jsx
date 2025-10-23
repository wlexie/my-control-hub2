import React, { useState, useEffect, useMemo } from 'react';
import { FaWhatsapp, FaEnvelope, FaSms } from 'react-icons/fa';
import { BsPhone, BsPerson, BsPeople, BsCheckAll } from 'react-icons/bs';
import axios from 'axios';

// --- Configuration Constants (copied from Conversation.js for demonstration) ---
// In a real application, these would ideally be in a shared constants file.
const TEMPLATE_MEDIA_URLS = {
  'welcome_dormant': 'https://tuma-whatsapp.s3.us-east-1.amazonaws.com/1000642484.jpg',
  'welcome_basics': 'https://tuma-whatsapp.s3.us-east-1.amazonaws.com/1000642483.jpg',
  'welcome_active': 'https://tuma-whatsapp.s3.us-east-1.amazonaws.com/1000642480.jpg',
  'potential_user': 'https://tuma-whatsapp.s3.us-east-1.amazonaws.com/1000642477.jpg',
  'welcome_leads': 'https://tuma-whatsapp.s3.us-east-1.amazonaws.com/1000642477.jpg',
  'welcome_decline': null,
  'country_updates': null,
  'insufficient_funds': null,
  'bank_restriction': null,
  'Paybill_Transaction': null,
  'pending_transaction': null,
  'error_help': null,
 'something_bigg': 'https://tuma-website.s3.us-east-1.amazonaws.com/18744e3c-6bff-40b7-b971-fecfb5c0aaf9.jpg',
  'hint_teaser': null,
  'pre_announcement': null,
  'flash_announcement': 'https://tuma-website.s3.us-east-1.amazonaws.com/73834357-83cd-44f5-a1be-0fdc5fcd5b33.jpg', 
  '5_days': null,             
  '3_days': null,            
  'eve_reminder': null,     
  '4_hours': null,           
  '1_hour': null,         
  'flash_hour': null,      
  'after_sale': null        
};
// --- End Configuration Constants ---


const Modal3 = ({ isOpen, onClose, templateName, selectedChannel }) => {
  if (!isOpen) return null;

  const [recipientSearchTerm, setRecipientSearchTerm] = useState('');
  const [recipientType, setRecipientType] = useState('Individual');
  const [channel, setChannel] = useState(selectedChannel || 'WhatsApp');
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [errorContacts, setErrorContacts] = useState(null);

  const [isSending, setIsSending] = useState(false);
  const [sendResults, setSendResults] = useState([]);
  const [sendError, setSendError] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      setLoadingContacts(true);
      setErrorContacts(null);
      try {
        const response = await axios.get('https://api.tuma-app.com/api/account/contacts', {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const formattedContacts = response.data.map((contact, index) => ({
          id: `api-${index}-${contact.phone}`,
          name: contact.firstName, // Assuming name is phone if not provided
          detail: contact.phone,
          avatar: contact.firstName
            ? contact.firstName.substring(0, 2).toUpperCase()
            : '??',
        }));
        setAllContacts(formattedContacts);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Failed to fetch contacts (Axios error):", error.message);
          setErrorContacts(`Failed to load contacts: ${error.response?.statusText || error.message}`);
        } else {
          console.error("Failed to fetch contacts (General error):", error);
          setErrorContacts('Failed to load contact. Please try again.');
        }
      } finally {
        setLoadingContacts(false);
      }
    };

    if (isOpen) {
      fetchContacts();
      setSelectedContacts([]);
      setRecipientSearchTerm('');
      setSendResults([]);
      setSendError(null);
      setChannel(selectedChannel || 'WhatsApp');
    }
  }, [isOpen, selectedChannel]);

  const filteredContacts = useMemo(() => {
    if (!recipientSearchTerm) {
      return allContacts;
    }
    const lowerCaseSearchTerm = recipientSearchTerm.toLowerCase();
    return allContacts.filter(contact =>
      contact.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      contact.detail.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [allContacts, recipientSearchTerm]);

 const handleContactCheckboxChange = (contactId) => {
    setSelectedContacts(prevSelected => {
      if (prevSelected.some(contact => contact.id === contactId)) {
        return prevSelected.filter(contact => contact.id !== contactId);
      } else {
        let contactToAdd = allContacts.find(contact => contact.id === contactId);
        if (!contactToAdd) {
            contactToAdd = prevSelected.find(contact => contact.id === contactId);
        }
        return contactToAdd ? [...prevSelected, contactToAdd] : prevSelected;
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === allContacts.length && allContacts.length > 0) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(allContacts);
    }
  };

  const handleAddRecipient = () => {
    if (recipientSearchTerm.trim() === '') return;

    const isPhoneNumber = /^\+?\d[\d\s-]{7,}\d$/.test(recipientSearchTerm.trim());

    if (!isPhoneNumber) {
      alert("Please enter a valid phone number (e.g., +1234567890 or 0712345678) to add.");
      return;
    }

    const newContactValue = recipientSearchTerm.trim();
    if (!selectedContacts.some(contact => contact.detail === newContactValue)) {
      const newContact = {
        id: `manual-${Date.now()}`,
        name: 'there',
        detail: newContactValue,
        avatar: newContactValue.substring(newContactValue.length - 2),
      };
      setSelectedContacts(prevSelected => [...prevSelected, newContact]);
    } else {
      alert("This recipient is already in your selected list.");
    }
    setRecipientSearchTerm('');
  };

 const handleContinue = async () => {
    if (selectedContacts.length === 0) {
      alert("Please select at least one recipient to send the message");
      return;
    }
    if (!templateName) {
      alert("Template name is missing. Please select a template first.");
      return;
    }
    if (channel !== 'WhatsApp') {
        alert("Only WhatsApp sending is implemented in this version. Please select WhatsApp.");
        return;
    }

    setIsSending(true);
    setSendError(null);
    setSendResults([]);

    const currentSendResults = [];
    // Determine mediaUrl based on the selected templateName
    const mediaUrl = TEMPLATE_MEDIA_URLS[templateName] || null;

    for (const contact of selectedContacts) {
      try {
        // Fallback for contact name if it's 'Unknown' (or similar, if your data varies)
        const recipientNameForTemplate = contact.name === 'Unknown' ? 'there' : contact.name;
        const params = [{ default: recipientNameForTemplate }];

        const payload = {
          recipient: contact.detail,
          templateName: templateName,
          params: params,
        };

        // Conditionally add mediaUrl to the payload if it exists
        if (mediaUrl) {
            payload.mediaUrl = mediaUrl;
        }

        console.log(`Sending to ${contact.detail} with template ${templateName}...`);
        console.log("Payload:", payload);

        const response = await axios.post('/api/sendTemplate', payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.data.success) {
          currentSendResults.push({ recipient: contact.detail, status: 'success', message: response.data.message });
          console.log(`Sent to ${contact.detail}:`, response.data.message);
        } else {
          currentSendResults.push({ recipient: contact.detail, status: 'failed', error: response.data.details || 'Unknown error' });
          console.error(`Failed to send to ${contact.detail}:`, response.data.details);
        }
      } catch (error) {
        const errorMessage = axios.isAxiosError(error)
          ? error.response?.data?.error || error.message
          : error.message;
        currentSendResults.push({ recipient: contact.detail, status: 'failed', error: errorMessage });
        console.error(`Error sending to ${contact.detail}:`, errorMessage);
        setSendError("Some messages failed to send. Check individual results.");
      }
    }

    setIsSending(false);
    setSendResults(currentSendResults);
    setSelectedContacts([]);
  };

  const isContinueDisabled = useMemo(() => {
    return isSending || selectedContacts.length === 0 || !templateName || channel !== 'WhatsApp';
  }, [isSending, selectedContacts.length, templateName, channel]);

  const disabledReason = useMemo(() => {
    if (isSending) return "Sending messages...";
    if (!templateName) return "Please select a template first.";
    if (channel !== 'WhatsApp') return "Only WhatsApp channel is supported for sending.";
    if (selectedContacts.length === 0) return "Select at least one recipient.";
    return "";
  }, [isSending, selectedContacts.length, templateName, channel]);


  useEffect(() => {
    console.log("Modal3 State Updates:");
    console.log("  templateName:", templateName);
    console.log("  selectedContacts.length:", selectedContacts.length);
    console.log("  channel:", channel);
    console.log("  isContinueDisabled:", isContinueDisabled);
    console.log("  disabledReason:", disabledReason);
    // Added for mediaUrl debugging
    const mediaUrlDebug = TEMPLATE_MEDIA_URLS[templateName] || 'No media';
    console.log("  Calculated mediaUrl for template:", templateName, "is", mediaUrlDebug);
  }, [templateName, selectedContacts.length, channel, isContinueDisabled, disabledReason]);


  return (
    <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-xl h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">New Message</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-grow">
          {/* Channel Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Channel</h3>
            <div className="grid grid-cols-4 gap-3">
              <button
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors duration-200 ${
                  channel === 'WhatsApp'
                    ? 'bg-green-100 border-green-500 text-green-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setChannel('WhatsApp')}
              >
                <FaWhatsapp className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">WhatsApp</span>
              </button>
              <button
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors duration-200 ${
                  channel === 'Email'
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setChannel('Email')}
                disabled // Disable other channels for now
              >
                <FaEnvelope className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">Email</span>
              </button>
              <button
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors duration-200 ${
                  channel === 'SMS'
                    ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setChannel('SMS')}
                disabled // Disable other channels for now
              >
                <FaSms className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">SMS</span>
              </button>
              <button
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors duration-200 ${
                  channel === 'In-App'
                    ? 'bg-purple-100 border-purple-500 text-purple-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setChannel('In-App')}
                disabled // Disable other channels for now
              >
                <BsPhone className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">In-App</span>
              </button>
            </div>
          </div>

          {/* Display Template Name */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm font-semibold flex items-center">
            <span className="mr-2">Template:</span>
            <span>{templateName || "No template selected"}</span> {/* Show message if no template */}
            {TEMPLATE_MEDIA_URLS[templateName] && (
              <span className="ml-2 px-2 py-0.5 bg-blue-200 text-blue-900 text-xs font-bold rounded-full">
                🖼️ Image Included
              </span>
            )}
          </div>

          {/* Recipients Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              Recipients
              {selectedContacts.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                  {selectedContacts.length}
                </span>
              )}
            </h3>
            <div className="flex items-center justify-between mb-6">
              <button
                className={`flex items-center px-6 py-2 rounded-xl border transition-colors duration-200 ${
                  recipientType === 'Individual'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setRecipientType('Individual')}
              >
                <BsPerson className="w-5 h-5 mr-2" /> Individual
              </button>
              <button
                className={`flex items-center px-6 py-2 rounded-xl border transition-colors duration-200 ${
                  recipientType === 'Groups'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setRecipientType('Groups')}
                disabled // Placeholder for future group functionality
              >
                <BsPeople className="w-5 h-5 mr-2" /> Groups
              </button>
              <button
                className={`flex items-center px-6 py-2 rounded-xl border transition-colors duration-200 ${
                  selectedContacts.length === allContacts.length && allContacts.length > 0
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={handleSelectAll}
                disabled={allContacts.length === 0}
              >
                <BsCheckAll className="w-5 h-5 mr-2" /> Select All
              </button>
            </div>

            {/* Selected Contacts Chips */}
             {selectedContacts.length > 0 && (
               <div className="flex flex-wrap gap-2 mb-4 p-2 border border-gray-200 rounded-lg bg-gray-50 max-h-24 overflow-y-auto">
                 {selectedContacts.map(contact => (
                   <span key={`selected-${contact.id}`} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                     {contact.name}
                     <button
                       type="button"
                       className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-200 focus:text-blue-500"
                       onClick={() => handleContactCheckboxChange(contact.id)}
                       title={`Remove ${contact.name}`}
                     >
                       <span className="sr-only">Remove {contact.name}</span>
                       <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                       </svg>
                     </button>
                   </span>
                 ))}
               </div>
             )}


            {/* Recipient Search Field */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search or enter phone number to add (e.g., +1234567890)..."
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={recipientSearchTerm}
                onChange={(e) => setRecipientSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddRecipient();
                  }
                }}
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
              {recipientSearchTerm && (
                <button
                  onClick={handleAddRecipient}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700"
                  title="Add entered recipient"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Recent Contacts List */}
            <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
              {loadingContacts && (
                <div className="p-4 text-center text-gray-500">Loading contacts...</div>
              )}
              {errorContacts && (
                <div className="p-4 text-center text-red-500">{errorContacts}</div>
              )}
              {!loadingContacts && !errorContacts && filteredContacts.length === 0 && (
                <div className="p-4 text-center text-gray-500">No matching contacts found.</div>
              )}
              {!loadingContacts && !errorContacts && filteredContacts.map((contact) => (
                <label key={contact.id} className="flex items-center space-x-3 py-2 px-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 border-gray-100">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600 rounded"
                    checked={selectedContacts.some(selected => selected.id === contact.id)}
                    onChange={() => handleContactCheckboxChange(contact.id)}
                  />
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
                    {contact.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                    <p className="text-xs text-gray-500">{contact.detail}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Sending Results Feedback */}
            {isSending && (
                <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending messages...
                </div>
            )}
            {sendError && (
                <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">
                    {sendError}
                </div>
            )}
            {sendResults.length > 0 && !isSending && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg max-h-40 overflow-y-auto">
                    <h4 className="font-semibold text-gray-700 mb-2">Send Summary:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                        {sendResults.map((result, index) => (
                            <li key={index} className={result.status === 'failed' ? 'text-red-600' : 'text-green-700'}>
                                {result.recipient}: {result.status === 'success' ? 'Sent' : `Failed (${result.error})`}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between p-4 border-t border-gray-200 bg-gray-50 mt-auto">
          <button
            onClick={onClose}
            className="px-7 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors duration-200"
            disabled={isSending}
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            className="px-6 py-2 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center"
            disabled={isContinueDisabled}
            title={isContinueDisabled ? disabledReason : "Continue to send messages"}
          >
            {isSending ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                </>
            ) : (
                'Send'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal3;