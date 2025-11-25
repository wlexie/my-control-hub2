import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FaWhatsapp, FaEnvelope, FaSms } from 'react-icons/fa';
import { BsPhone, BsPerson, BsPeople, BsCheckAll, BsUpload } from 'react-icons/bs'; // Import BsUpload
import { RiArrowDropDownLine } from "react-icons/ri";
import axios from 'axios';
import Papa from 'papaparse'; // Import PapaParse
import readXlsxFile from 'read-excel-file'; // Import read-excel-file

// --- Configuration Constants (copied from Conversation.js for demonstration) ---
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
  'flashhour': 'https://tuma-website.s3.us-east-1.amazonaws.com/73834357-83cd-44f5-a1be-0fdc5fcd5b33.jpg', 
  'flashh_hour': 'https://tuma-website.s3.us-east-1.amazonaws.com/73834357-83cd-44f5-a1be-0fdc5fcd5b33.jpg',
  'flash_alert': 'https://tuma-website.s3.us-east-1.amazonaws.com/fecaef4d-0709-4b87-95a9-d1c0faaa56c6.jpg',
  '5_days': null,             
  '3_days': null,  
  '3_day': 'https://tuma-website.s3.us-east-1.amazonaws.com/18744e3c-6bff-40b7-b971-fecfb5c0aaf9.jpg',                      
  'eve_reminder': null,     
<<<<<<< HEAD
  '4_hours': null,           
  '1_hour': null, 
  'complete_ver': null,
  'lead_clients': 'https://tuma-website.s3.us-east-1.amazonaws.com/56d76de3-1e1c-4304-a10b-c2a4a168cef7+(1).MP4',        
  'flash_hour': null,      
  'after_sale': null,
=======
  '4_hours': null,  
  'redone': null,
  'make_up':'https://tuma-website.s3.us-east-1.amazonaws.com/921941fe-5421-45c1-b33b-b0360068a2d0.jpg',
  'tomorrow': null,  
  'flash_live1': null,
  'weekend_treat': 'https://tuma-website.s3.us-east-1.amazonaws.com/08f46c3e-d0ee-4cc0-b799-4dbda312ab54.jpg',
  'rate2': 'https://tuma-website.s3.us-east-1.amazonaws.com/Tuma_Flash_Hour.mp4',   
  'apology5': 'https://tuma-website.s3.us-east-1.amazonaws.com/WhatsApp+Image+2025-11-01+at+13.38.45.jpeg',   
  '1_hour': null, 
  'after': 'https://tuma-website.s3.us-east-1.amazonaws.com/31-Oct-2025-1761936730_3401220.MOV',
  'complete_ver': null,
  'lead_clients': 'https://tuma-website.s3.us-east-1.amazonaws.com/56d76de3-1e1c-4304-a10b-c2a4a168cef7+(1).MP4',        
  'flash_hour': null,   
    'after_hour1': 'https://tuma-website.s3.us-east-1.amazonaws.com/31-Oct-2025-1761936730_3401220.MOV4',      
   
  'after_sale': null,
  'after': 'https://tuma-website.s3.us-east-1.amazonaws.com/31-Oct-2025-1761936730_3401220.MOV',
>>>>>>> c67c311c43f4804009e7b126792936c095e5e965
  'test': 'https://tuma-website.s3.us-east-1.amazonaws.com/73834357-83cd-44f5-a1be-0fdc5fcd5b33.jpg', 
};
// --- End Configuration Constants ---

const groupCategories = [
  'All', // Option to fetch all contacts
  'Lead',
  'Basic',
  'Basic_pending',
  'Active',
  'Dormant',
];

const Modal3 = ({ isOpen, onClose, templateName, selectedChannel }) => {
  if (!isOpen) return null;

  const [recipientSearchTerm, setRecipientSearchTerm] = useState('');
  const [recipientType, setRecipientType] = useState('Individual'); // 'Individual' or 'Groups'
  const [selectedGroupCategory, setSelectedGroupCategory] = useState('All'); // New state for group category
  const [channel, setChannel] = useState(selectedChannel || 'WhatsApp');
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [errorContacts, setErrorContacts] = useState(null);

  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [finalMessage, setFinalMessage] = useState(null); // New state for consolidated message

  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null); // Ref for the hidden file input

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsGroupDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchContacts = async (category = 'All') => {
      setLoadingContacts(true);
      setErrorContacts(null);
      setSelectedContacts([]);
      setFinalMessage(null);

      try {
        let url = 'https://api.tuma-app.com/api/account/contacts';
        if (category !== 'All') {
          url = `https://api.tuma-app.com/api/account/contacts?status=${category}`;
        }

        const response = await axios.get(url, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const formattedContacts = response.data.map((contact, index) => ({
          id: `api-${index}-${contact.phone}`,
          name: contact.firstName || 'Unknown',
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
          setErrorContacts('Failed to load contacts. Please try again.');
        }
      } finally {
        setLoadingContacts(false);
      }
    };

    if (isOpen) {
      if (recipientType === 'Individual') {
        fetchContacts('All');
      } else if (recipientType === 'Groups') {
        fetchContacts(selectedGroupCategory);
      }
      setSelectedContacts([]);
      setRecipientSearchTerm('');
      setSendError(null);
      setFinalMessage(null);
      setChannel(selectedChannel || 'WhatsApp');
    }
  }, [isOpen, selectedChannel, recipientType, selectedGroupCategory]);

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
        name: newContactValue,
        detail: newContactValue,
        avatar: newContactValue.substring(newContactValue.length - 2),
      };
      setSelectedContacts(prevSelected => [...prevSelected, newContact]);
    } else {
      alert("This recipient is already in your selected list.");
    }
    setRecipientSearchTerm('');
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFinalMessage(null); // Clear previous messages
      importContactsFromFile(file);
    }
    event.target.value = ''; // Clear the input so same file can be selected again
  };

  const importContactsFromFile = async (file) => {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    let parsedData = [];
    let headers = [];

    try {
      if (fileExtension === 'csv') {
        const result = await new Promise((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results),
            error: (error) => reject(error),
          });
        });
        parsedData = result.data;
        headers = result.meta.fields;
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const rows = await readXlsxFile(file);
        if (rows.length === 0) {
          throw new Error("Excel file is empty.");
        }
        headers = rows[0].map(h => String(h).trim());
        parsedData = rows.slice(1).map(row => {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] !== null ? String(row[index]).trim() : '';
          });
          return obj;
        });
      } else {
        alert("Unsupported file type. Please upload a CSV or Excel (XLSX/XLS) file.");
        return;
      }

      const nameKeys = ['Full Name', 'full name', 'name'].map(key => key.toLowerCase());
      const phoneKeys = ['phone', 'Phone number', 'Mobile', 'mobile number'].map(key => key.toLowerCase()); // Added more phone keys

      // Find actual header names in the file, case-insensitive
      let actualNameKey = headers.find(h => nameKeys.includes(h.toLowerCase()));
      let actualPhoneKey = headers.find(h => phoneKeys.includes(h.toLowerCase()));

      if (!actualNameKey && !actualPhoneKey) {
          // If no specific name/phone key found, try to infer or just use values
          // Fallback: If only two columns, assume first is name, second is phone
          if (headers.length >= 2) {
              actualNameKey = headers[0];
              actualPhoneKey = headers[1];
              console.warn("Could not find standard 'name' or 'phone' headers. Assuming first column is name and second is phone.");
          } else if (headers.length === 1) {
              actualPhoneKey = headers[0]; // If only one column, assume it's phone
              console.warn("Only one column found. Assuming it's phone number.");
          } else {
              alert("Could not find 'Full Name', 'name', or 'phone' columns in the file. Please ensure your file has these headers.");
              return;
          }
      }

      const importedContacts = [];
      const existingContactDetails = new Set(selectedContacts.map(c => c.detail));

      parsedData.forEach((row, index) => {
        const name = actualNameKey ? row[actualNameKey] : `Contact ${index + 1}`;
        const phone = actualPhoneKey ? row[actualPhoneKey] : '';

        if (phone && /^\+?\d[\d\s-]{7,}\d$/.test(phone)) { // Basic phone validation
          if (!existingContactDetails.has(phone)) {
            importedContacts.push({
              id: `imported-${Date.now()}-${index}`,
              name: name || phone,
              detail: phone,
              avatar: (name ? name.substring(0, 2) : phone.slice(-2)).toUpperCase(),
            });
            existingContactDetails.add(phone);
          }
        } else {
          console.warn(`Skipping invalid phone number in row ${index + 1}: ${phone}`);
        }
      });

      if (importedContacts.length > 0) {
        setSelectedContacts(prevSelected => [...prevSelected, ...importedContacts]);
        setFinalMessage(`Successfully imported ${importedContacts.length} new contact(s).`);
      } else {
        setFinalMessage("No valid new contacts found in the file or all contacts already selected.");
      }
    } catch (error) {
      console.error("Error importing contacts:", error);
      setFinalMessage(`Error importing file: ${error.message}`);
    }
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
    setFinalMessage(null); // Clear any previous final message

    let successfulSends = 0;
    let failedSends = 0;
    const mediaUrl = TEMPLATE_MEDIA_URLS[templateName] || null;
    const totalContacts = selectedContacts.length;

    // Use a temporary array to hold contacts that were *attempted* to be sent
    const contactsToSend = [...selectedContacts];

    for (const contact of contactsToSend) { // Iterate over the copy
      try {
        const recipientNameForTemplate = contact.name === 'Unknown' ? 'there' : contact.name;
        const params = [{ default: recipientNameForTemplate }];

        const payload = {
          recipient: contact.detail,
          templateName: templateName,
          params: params,
        };

        if (mediaUrl) {
            payload.mediaUrl = mediaUrl;
        }

        console.log(`Sending to ${contact.detail} with template ${templateName}...`);
        
        const response = await axios.post('/api/sendTemplate', payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.data.success) {
          successfulSends++;
          console.log(`Sent to ${contact.detail}:`, response.data.message);
        } else {
          failedSends++;
          console.error(`Failed to send to ${contact.detail}:`, response.data.details);
        }
      } catch (error) {
        failedSends++;
        const errorMessage = axios.isAxiosError(error)
          ? error.response?.data?.error || error.message
          : error.message;
        console.error(`Error sending to ${contact.detail}:`, errorMessage);
      }
    }

    setIsSending(false); // All messages attempted

    // Set a single consolidated message
    if (successfulSends === totalContacts) {
      setFinalMessage(`Successfully sent message to ${successfulSends} recipient(s).`);
      setSelectedContacts([]); // Clear selected after successful attempt
    } else if (failedSends === totalContacts) {
      setFinalMessage(`Failed to send message to all ${failedSends} recipient(s).`);
    } else {
      setFinalMessage(`Sent to ${successfulSends} recipient(s), failed for ${failedSends}.`);
    }
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
            <span>{templateName || "No template selected"}</span>
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
                onClick={() => {
                  setRecipientType('Individual');
                  setSelectedGroupCategory('All'); // Reset group category when switching to Individual
                  setIsGroupDropdownOpen(false); // Close dropdown when switching to Individual
                }}
              >
                <BsPerson className="w-5 h-5 mr-2" /> Individual
              </button>

                <div className="relative" ref={dropdownRef}>
                  <button
                    className={`flex items-center justify-between w-full px-6 py-2 rounded-xl border transition-colors duration-200 ${
                      recipientType === 'Groups'
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setRecipientType('Groups');
                      setIsGroupDropdownOpen(!isGroupDropdownOpen); // Toggle dropdown visibility
                    }}
                  >
                    <div className="flex items-center">
                      <BsPeople className="w-5 h-5 mr-2" />
                      Groups
                    </div>
                    <RiArrowDropDownLine
                      className={`w-6 h-6 ml-2 transition-transform ${
                        isGroupDropdownOpen ? 'rotate-180' : '' // Use isGroupDropdownOpen here
                      }`}
                    />
                  </button>

                  {recipientType === 'Groups' && isGroupDropdownOpen && ( // Conditionally render
                    <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <div className="py-1">
                        {groupCategories.map((category) => (
                          <button
                            key={category}
                            onClick={() => {
                              setSelectedGroupCategory(category);
                              setIsGroupDropdownOpen(false); // Close dropdown on selection
                            }}
                            className={`block w-full text-left px-4 py-2 text-sm ${
                              selectedGroupCategory === category
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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


            {/* Recipient Search Field and Import Button */}
            <div className="relative mb-4 flex items-center"> {/* Added flex and items-center */}
              <input
                type="text"
                placeholder="Search or enter phone number to add (e.g., +1234567890)..."
                className="w-full pl-10 pr-24 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" // Adjusted pr
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

              {/* Import Contacts Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" // Accept CSV and Excel
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700 mr-2" // Adjusted right position
                title="Import contacts from Excel/CSV"
                type="button"
              >
                <BsUpload className="h-6 w-6" />
              </button>

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
            <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden max-h-[450px] overflow-y-auto">
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

            {/* Consolidated Sending Feedback */}
            {finalMessage && (
                <div className={`mt-4 p-3 rounded-lg ${
                    finalMessage.includes('Successfully') ? 'bg-green-100 text-green-800' :
                    finalMessage.includes('Failed to send message to all') ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                }`}>
                    {finalMessage}
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