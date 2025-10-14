import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { FiSend } from 'react-icons/fi';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store'; 

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Contact {
  phone: string;
}

interface Category {
  id: string; 
  name: string;
  count: number; 
}

const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ isOpen, onClose }) => {
  const [campaignName, setCampaignName] = useState('');
  const [purpose, setPurpose] = useState('Promotional');
  const [messageContent, setMessageContent] = useState('');
  const [targetPhoneNumbers, setTargetPhoneNumbers] = useState<string[]>([]);
  const [currentPhoneNumberInput, setCurrentPhoneNumberInput] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(''); 
  const [allContactsFromApi, setAllContactsFromApi] = useState<Contact[]>([]);
  const [allContactsCount, setAllContactsCount] = useState<number>(0);
  const [loadingContacts, setLoadingContacts] = useState<boolean>(false);
  const [sendingCampaign, setSendingCampaign] = useState<boolean>(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // New state for success messages
  const [error, setError] = useState<string | null>(null);

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const maxMessageLength = 1000;
  const smsCharacterLimit = 160;

  const fetchAllContacts = useCallback(async () => {
    if (!accessToken) {
      setError('Authentication token not found.');
      return;
    }

    setLoadingContacts(true);
    setError(null);
    try {
      const response = await axios.get<Contact[]>('https://api.tuma-app.com/api/account/contacts', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const validContacts = response.data.filter(contact => contact.phone && !contact.phone.includes('DELETED_'));
      setAllContactsFromApi(validContacts);
      setAllContactsCount(validContacts.length);

      const allContactsCategory: Category = {
        id: 'all-contacts',
        name: 'All Contacts',
        count: validContacts.length,
      };
      
      setCategories([allContactsCategory]); 

    } catch (err) {
      console.error('Failed to fetch contacts:', err);
      setError('Failed to load contacts. Please try again.');
      setAllContactsCount(0);
      setCategories([]);
      setAllContactsFromApi([]);
    } finally {
      setLoadingContacts(false);
    }
  }, [accessToken]);

  // Function to clear all form fields
  const clearFormFields = useCallback(() => {
    setCampaignName('');
    setPurpose('Promotional');
    setMessageContent('');
    setTargetPhoneNumbers([]);
    setCurrentPhoneNumberInput('');
    setSelectedCategory('');
    setSendError(null);
    setError(null);
    // Keep success message visible for a short period, then clear it
    // Or you could clear it immediately if desired, but this gives feedback
    // setSuccessMessage(null); 
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchAllContacts();
    } else {
      // Reset all state variables when modal closes
      clearFormFields(); // Use the new clear function
      setCategories([]); // Categories are refetched on open, so clear on close
      setAllContactsFromApi([]);
      setAllContactsCount(0);
      setLoadingContacts(false);
      setSendingCampaign(false);
      setSuccessMessage(null); // Clear success message on close
    }
  }, [isOpen, fetchAllContacts, clearFormFields]);

  const currentChars = messageContent.length;
  const smsCount = useMemo(() => {
    if (currentChars === 0) return 0;
    return Math.ceil(currentChars / smsCharacterLimit);
  }, [currentChars]);

  if (!isOpen) return null;

  const handleAddPhoneNumber = () => {
    const trimmedNumber = currentPhoneNumberInput.trim();
    if (trimmedNumber && !targetPhoneNumbers.includes(trimmedNumber)) {
      setTargetPhoneNumbers([...targetPhoneNumbers, trimmedNumber]);
      setCurrentPhoneNumberInput('');
      setSelectedCategory(''); 
      setSendError(null); // Clear any previous send errors
      setSuccessMessage(null); // Clear any previous success messages
    }
  };

  const handleRemovePhoneNumber = (numberToRemove: string) => {
    setTargetPhoneNumbers(targetPhoneNumbers.filter(number => number !== numberToRemove));
    setSendError(null); // Clear any previous send errors
    setSuccessMessage(null); // Clear any previous success messages
  };

 const handleLaunchCampaign = async () => {
  setSendingCampaign(true);
  setSendError(null);       // Clear previous errors
  setSuccessMessage(null);  // Clear previous success messages

  let recipientsToSend: string[] = [];

  if (selectedCategory === 'all-contacts') {
    recipientsToSend = allContactsFromApi.map(contact => contact.phone);
  } else if (targetPhoneNumbers.length > 0) {
    recipientsToSend = targetPhoneNumbers;
  }

  if (recipientsToSend.length === 0) {
    setSendError('Please add individual recipients or select a target audience category.');
    setSendingCampaign(false);
    return;
  }

  if (messageContent.trim() === '') {
    setSendError('Message content cannot be empty.');
    setSendingCampaign(false);
    return;
  }

  try {
    const response = await axios.post('/api/send-sms', {
      to: recipientsToSend,
      message: messageContent,
      campaignName: campaignName,
      purpose: purpose,
    });

    console.log('Campaign launch response:', response.data);
    if (response.status === 200) {
      setSuccessMessage('Campaign launched successfully!'); // Set success message
      // Call clearFormFields here to clear inputs immediately after success
      clearFormFields(); 
    } else if (response.status === 207) {
      setSuccessMessage('Campaign launched with some failures. Check console for details.'); // Set success message
      // Call clearFormFields here even with partial success
      clearFormFields(); 
    }
  } catch (err: unknown) {
  if (axios.isAxiosError(err)) {
    console.error('Error launching campaign:', err.response?.data || err.message);
    setSendError(err.response?.data?.message || 'Failed to launch campaign. Please try again.');
  } else {
    console.error('Unexpected error launching campaign:', err);
    setSendError('An unexpected error occurred. Please try again.');
  }
}
};

  

 
  const totalRecipients = selectedCategory === 'all-contacts' && !loadingContacts && !error
    ? allContactsCount
    : targetPhoneNumbers.length; 

  const estimatedCost = (totalRecipients * smsCount * 0.05).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-t-lg rounded-b-lg shadow-xl w-full max-w-2xl max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create SMS Campaign</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-grow">
          {/* Success Message Display */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> {successMessage}</span>
              <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                <button onClick={() => setSuccessMessage(null)} className="text-green-700 hover:text-green-900">
                  <svg className="fill-current h-6 w-6" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                </button>
              </span>
            </div>
          )}

          {/* Error Message Display (for overall fetching or other issues) */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
              <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
                  <svg className="fill-current h-6 w-6" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                </button>
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="campaignName" className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Name
              </label>
              <input
                type="text"
                id="campaignName"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., Weekly Promotions"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="purposeOfCampaign" className="block text-sm font-medium text-gray-700 mb-1">
                Purpose of campaign
              </label>
              <select
                id="purposeOfCampaign"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              >
                <option value="Promotional">Promotional</option>
                <option value="Transactional">Transactional</option>
                <option value="Informational">Informational</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="messageContent" className="block text-sm font-medium text-gray-700 mb-1">
              Message Content
            </label>
            <textarea
              id="messageContent"
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y"
              placeholder={`Type your SMS message here... (${smsCharacterLimit} characters recommended)`}
              value={messageContent}
              onChange={(e) => {
                if (e.target.value.length <= maxMessageLength) {
                  setMessageContent(e.target.value);
                }
                setSendError(null); // Clear errors when message content changes
                setSuccessMessage(null); // Clear success message
              }}
            ></textarea>
            <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
              <span>
                {currentChars}/{maxMessageLength} characters • {smsCount} SMS
              </span>
              <button className="text-blue-600 hover:text-blue-800 font-medium">Use Template</button>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-1">
              Target Audience
            </label>
            <div className="flex items-center space-x-2 mb-2">
              <select
                id="targetAudience"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  if (e.target.value !== '') {
                      setTargetPhoneNumbers([]);
                  }
                  setSendError(null); // Clear errors when category changes
                  setSuccessMessage(null); // Clear success message
                }}
                disabled={loadingContacts}
              >
                <option value="">Select an option</option> 
                {loadingContacts ? (
                  <option value="">Loading contacts...</option>
                ) : error ? (
                  <option value="">Error loading contacts</option>
                ) : categories.length === 0 ? (
                  <option value="">No categories available</option>
                ) : (
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.count})
                    </option>
                  ))
                )}
              </select>
            </div>

            {loadingContacts && <p className="text-sm text-gray-500 mt-2">Fetching contacts...</p>}

            <label htmlFor="addPhoneNumber" className="block text-sm font-medium text-gray-700 mb-1 mt-4">
              Add Individual Phone Numbers (Optional)
            </label>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                id="addPhoneNumber"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter phone number (e.g., +1 555 123 4567)"
                value={currentPhoneNumberInput}
                onChange={(e) => setCurrentPhoneNumberInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPhoneNumber();
                  }
                }}
              />
              <button
                onClick={handleAddPhoneNumber}
                className="p-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                title="Add phone number"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>

            {targetPhoneNumbers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {targetPhoneNumbers.map((number, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {number}
                    <button
                      type="button"
                      onClick={() => handleRemovePhoneNumber(number)}
                      className="ml-2 -mr-0.5 h-4 w-4 flex items-center justify-center rounded-full text-blue-500 hover:bg-blue-200"
                      title="Remove number"
                    >
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            {(totalRecipients === 0 && selectedCategory === '' && !loadingContacts && !error && !sendError && !successMessage) && (
              <p className="text-sm text-gray-500 mt-2">No recipients or category selected yet</p>
            )}
            {sendError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                  <strong className="font-bold">Error!</strong>
                  <span className="block sm:inline"> {sendError}</span>
                  <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                    <button onClick={() => setSendError(null)} className="text-red-700 hover:text-red-900">
                      <svg className="fill-current h-6 w-6" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                    </button>
                  </span>
                </div>
            )}
            <div className="flex justify-between items-center text-sm text-gray-700 mt-4">
              <span>Total Recipients: {totalRecipients}</span>
              <span>Estimated Cost: ${estimatedCost}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50 space-x-4 rounded-b-lg">
          <div>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={sendingCampaign}
            >
              Save as Draft
            </button>
          </div>
          <div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium mr-5 text-gray-700 bg-transparent hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={sendingCampaign}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLaunchCampaign}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={sendingCampaign}
            >
              {sendingCampaign ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <FiSend className="h-4 w-4 mr-2 -ml-1 transform" />
                  Launch Campaign
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaignModal;