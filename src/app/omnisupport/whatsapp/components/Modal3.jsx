import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { FaWhatsapp, FaEnvelope, FaSms } from 'react-icons/fa';
import { BsPhone, BsPerson, BsPeople, BsCheckAll, BsUpload } from 'react-icons/bs';
import { RiArrowDropDownLine } from "react-icons/ri";
import axios from 'axios';
import Papa from 'papaparse';
import readXlsxFile from 'read-excel-file';

// --- Configuration Constants ---
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
  'test': 'https://tuma-website.s3.us-east-1.amazonaws.com/73834357-83cd-44f5-a1be-0fdc5fcd5b33.jpg', 
};

// Updated categories to match the API accountStatus values
const groupCategories = [
  'All',
  'Lead',
  'Basic',
  'Basic Pending',
  'Active',
  'Dormant',
];

const Modal3 = ({ isOpen, onClose, templateName, selectedChannel }) => {
  // --- Redux State ---
  const token = useSelector((state) => state.auth.accessToken);

  // --- Local State ---
  const [recipientSearchTerm, setRecipientSearchTerm] = useState('');
  const [recipientType, setRecipientType] = useState('Individual'); // 'Individual' or 'Groups'
  const [selectedGroupCategory, setSelectedGroupCategory] = useState('All');
  const [channel, setChannel] = useState(selectedChannel || 'WhatsApp');
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [errorContacts, setErrorContacts] = useState(null);

  const [isSending, setIsSending] = useState(false);
  const [finalMessage, setFinalMessage] = useState(null);

  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsGroupDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- API Fetching Logic ---
  useEffect(() => {
    const fetchContacts = async (category = 'All') => {
      if (!isOpen) return;
      if (!token) {
        setErrorContacts("Not authenticated. Please log in.");
        setLoadingContacts(false);
        return;
      }

      setLoadingContacts(true);
      setErrorContacts(null);
      setSelectedContacts([]);
      setFinalMessage(null);

      try {
        let url = '';
        if (category === 'All') {
          // Endpoint for all marketing contacts
          url = 'https://com.tuma-app.com/api/marketing/contacts';
        } else {
          // Endpoint for filtered statuses
          url = `https://com.tuma-app.com/api/marketing/eligible?statuses=${encodeURIComponent(category)}`;
        }

        const response = await axios.get(url, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        // Format data based on the API response (accountId, firstName, lastName, phone)
        const formattedContacts = response.data.map((contact, index) => ({
          id: contact.accountId || `api-${index}-${contact.phone}`,
          name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unknown',
          detail: contact.phone,
          avatar: contact.firstName
            ? contact.firstName.substring(0, 2).toUpperCase()
            : '??',
        }));

        setAllContacts(formattedContacts);
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
        setErrorContacts('Failed to load contacts. Please verify your connection.');
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
      setRecipientSearchTerm('');
      setChannel(selectedChannel || 'WhatsApp');
    }
  }, [isOpen, selectedChannel, recipientType, selectedGroupCategory, token]);

  const filteredContacts = useMemo(() => {
    if (!recipientSearchTerm) return allContacts;
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
        const contactToAdd = allContacts.find(contact => contact.id === contactId);
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
      alert("Please enter a valid phone number.");
      return;
    }

    const newPhone = recipientSearchTerm.trim();
    if (!selectedContacts.some(contact => contact.detail === newPhone)) {
      const newContact = {
        id: `manual-${Date.now()}`,
        name: newPhone,
        detail: newPhone,
        avatar: newPhone.slice(-2),
      };
      setSelectedContacts(prevSelected => [...prevSelected, newContact]);
    }
    setRecipientSearchTerm('');
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) importContactsFromFile(file);
    event.target.value = '';
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
        if (rows.length === 0) throw new Error("Excel file is empty.");
        headers = rows[0].map(h => String(h).trim());
        parsedData = rows.slice(1).map(row => {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] !== null ? String(row[index]).trim() : '';
          });
          return obj;
        });
      }

      const phoneKeys = ['phone', 'phone number', 'mobile', 'mobile number'].map(k => k.toLowerCase());
      const nameKeys = ['full name', 'name', 'first name'].map(k => k.toLowerCase());
      
      let actualPhoneKey = headers.find(h => phoneKeys.includes(h.toLowerCase()));
      let actualNameKey = headers.find(h => nameKeys.includes(h.toLowerCase()));

      const importedContacts = [];
      parsedData.forEach((row, index) => {
        const phone = actualPhoneKey ? row[actualPhoneKey] : row[headers[0]];
        const name = actualNameKey ? row[actualNameKey] : `Contact ${index + 1}`;

        if (phone && /^\+?\d[\d\s-]{7,}\d$/.test(phone)) {
          importedContacts.push({
            id: `imported-${Date.now()}-${index}`,
            name: name || phone,
            detail: phone,
            avatar: (name ? name.substring(0, 2) : phone.slice(-2)).toUpperCase(),
          });
        }
      });

      setSelectedContacts(prev => [...prev, ...importedContacts]);
      setFinalMessage(`Imported ${importedContacts.length} contacts.`);
    } catch (error) {
      setFinalMessage(`Error: ${error.message}`);
    }
  };

  const handleContinue = async () => {
    if (selectedContacts.length === 0) return alert("Select a recipient");
    if (channel !== 'WhatsApp') return alert("Only WhatsApp supported");

    setIsSending(true);
    setFinalMessage(null);

    let successfulSends = 0;
    let failedSends = 0;
    const mediaUrl = TEMPLATE_MEDIA_URLS[templateName] || null;

    for (const contact of selectedContacts) {
      try {
        const payload = {
          recipient: contact.detail,
          templateName: templateName,
          params: [{ default: contact.name === 'Unknown' ? 'there' : contact.name }],
          ...(mediaUrl && { mediaUrl })
        };

        const response = await axios.post('/api/sendTemplate', payload, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
        });

        if (response.data.success) successfulSends++;
        else failedSends++;
      } catch (error) {
        failedSends++;
      }
    }

    setIsSending(false);
    setFinalMessage(`Sent: ${successfulSends}, Failed: ${failedSends}`);
    if (successfulSends > 0) setSelectedContacts([]);
  };

  const isContinueDisabled = isSending || selectedContacts.length === 0 || !templateName || channel !== 'WhatsApp';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-xl h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">New Message</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-grow">
          {/* Channels */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Channel</h3>
            <div className="grid grid-cols-4 gap-3">
              <button 
                onClick={() => setChannel('WhatsApp')}
                className={`flex flex-col items-center p-3 rounded-lg border transition ${channel === 'WhatsApp' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-gray-300'}`}
              >
                <FaWhatsapp className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">WhatsApp</span>
              </button>
              <button disabled className="flex flex-col items-center p-3 rounded-lg border bg-gray-50 text-gray-400">
                <FaEnvelope className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">Email</span>
              </button>
              <button disabled className="flex flex-col items-center p-3 rounded-lg border bg-gray-50 text-gray-400">
                <FaSms className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">SMS</span>
              </button>
              <button disabled className="flex flex-col items-center p-3 rounded-lg border bg-gray-50 text-gray-400">
                <BsPhone className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">In-App</span>
              </button>
            </div>
          </div>

          {/* Template Info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm font-semibold flex items-center justify-between">
            <span>Template: {templateName || "None"}</span>
            {TEMPLATE_MEDIA_URLS[templateName] && <span className="bg-blue-200 px-2 py-0.5 rounded-full text-xs">🖼️ Media</span>}
          </div>

          {/* Recipient Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Recipients ({selectedContacts.length})</h3>
              <button onClick={handleSelectAll} className="text-sm text-blue-600 hover:underline flex items-center">
                <BsCheckAll className="mr-1" /> Select All
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setRecipientType('Individual')}
                className={`flex items-center justify-center py-2 rounded-xl border ${recipientType === 'Individual' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}`}
              >
                <BsPerson className="mr-2" /> Individual
              </button>
              
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => { setRecipientType('Groups'); setIsGroupDropdownOpen(!isGroupDropdownOpen); }}
                  className={`flex items-center justify-between w-full px-4 py-2 rounded-xl border ${recipientType === 'Groups' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}`}
                >
                  <span className="flex items-center"><BsPeople className="mr-2" /> {selectedGroupCategory}</span>
                  <RiArrowDropDownLine className={`text-2xl transition-transform ${isGroupDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isGroupDropdownOpen && (
                  <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
                    {groupCategories.map(cat => (
                      <button 
                        key={cat} 
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                        onClick={() => { setSelectedGroupCategory(cat); setIsGroupDropdownOpen(false); }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Chips */}
            {selectedContacts.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 p-2 bg-gray-50 border border-gray-200 rounded-lg max-h-20 overflow-y-auto">
                {selectedContacts.map(c => (
                  <span key={c.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
                    {c.name}
                    <button onClick={() => handleContactCheckboxChange(c.id)} className="ml-1 text-blue-400 hover:text-blue-600">&times;</button>
                  </span>
                ))}
              </div>
            )}

            {/* Search & Add */}
            <div className="relative flex items-center gap-2 mb-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search or add phone..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={recipientSearchTerm}
                  onChange={(e) => setRecipientSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv,.xlsx,.xls" className="hidden" />
              <button onClick={() => fileInputRef.current.click()} className="p-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50" title="Import File">
                <BsUpload />
              </button>
            </div>

            {/* Contact List */}
            <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
              {loadingContacts ? (
                <div className="p-4 text-center text-gray-500">Loading contacts from API...</div>
              ) : errorContacts ? (
                <div className="p-4 text-center text-red-500">{errorContacts}</div>
              ) : (
                filteredContacts.map(contact => (
                  <label key={contact.id} className="flex items-center p-3 hover:bg-gray-50 border-b last:border-0 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-3 h-4 w-4 text-blue-600"
                      checked={selectedContacts.some(s => s.id === contact.id)}
                      onChange={() => handleContactCheckboxChange(contact.id)}
                    />
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold mr-3">{contact.avatar}</div>
                    <div className="flex-grow">
                      <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                      <div className="text-xs text-gray-500">{contact.detail}</div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {finalMessage && (
            <div className={`p-3 rounded-lg text-sm ${finalMessage.includes('Sent: 0') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
              {finalMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-between">
          <button onClick={onClose} className="px-6 py-2 border rounded-xl hover:bg-white transition">Cancel</button>
          <button
            onClick={handleContinue}
            disabled={isContinueDisabled}
            className={`px-8 py-2 rounded-xl text-white transition flex items-center ${isContinueDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal3;                                                