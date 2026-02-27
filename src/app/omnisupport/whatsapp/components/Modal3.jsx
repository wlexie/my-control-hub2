import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { FaWhatsapp, FaEnvelope, FaSms } from 'react-icons/fa';
import { BsPhone, BsPerson, BsPeople, BsCheckAll, BsUpload, BsPlus } from 'react-icons/bs';
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
  'something_bigg': 'https://tuma-website.s3.us-east-1.amazonaws.com/18744e3c-6bff-40b7-b971-fecfb5c0aaf9.jpg',
  'flash_announcement': 'https://tuma-website.s3.us-east-1.amazonaws.com/73834357-83cd-44f5-a1be-0fdc5fcd5b33.jpg', 
  'flashhour': 'https://tuma-website.s3.us-east-1.amazonaws.com/73834357-83cd-44f5-a1be-0fdc5fcd5b33.jpg', 
  'flashh_hour': 'https://tuma-website.s3.us-east-1.amazonaws.com/73834357-83cd-44f5-a1be-0fdc5fcd5b33.jpg',
  'flash_alert': 'https://tuma-website.s3.us-east-1.amazonaws.com/fecaef4d-0709-4b87-95a9-d1c0faaa56c6.jpg',
  '3_day': 'https://tuma-website.s3.us-east-1.amazonaws.com/18744e3c-6bff-40b7-b971-fecfb5c0aaf9.jpg',                      
  'make_up':'https://tuma-website.s3.us-east-1.amazonaws.com/921941fe-5421-45c1-b33b-b0360068a2d0.jpg',
  'weekend_treat': 'https://tuma-website.s3.us-east-1.amazonaws.com/08f46c3e-d0ee-4cc0-b799-4dbda312ab54.jpg',
  'rate2': 'https://tuma-website.s3.us-east-1.amazonaws.com/Tuma_Flash_Hour.mp4',   
  'apology5': 'https://tuma-website.s3.us-east-1.amazonaws.com/WhatsApp+Image+2025-11-01+at+13.38.45.jpeg',   
  'after': 'https://tuma-website.s3.us-east-1.amazonaws.com/31-Oct-2025-1761936730_3401220.MOV',
  'lead_clients': 'https://tuma-website.s3.us-east-1.amazonaws.com/56d76de3-1e1c-4304-a10b-c2a4a168cef7+(1).MP4',        
  'after_hour1': 'https://tuma-website.s3.us-east-1.amazonaws.com/31-Oct-2025-1761936730_3401220.MOV4',      
  'test': 'https://tuma-website.s3.us-east-1.amazonaws.com/73834357-83cd-44f5-a1be-0fdc5fcd5b33.jpg', 
};

const groupCategories = ['All', 'Lead', 'Basic', 'Basic Pending', 'Active', 'Dormant', 'Temporary_Blocked'];

const Modal3 = ({ isOpen, onClose, templateName, selectedChannel }) => {
  const token = useSelector((state) => state.auth.accessToken);

  const [recipientSearchTerm, setRecipientSearchTerm] = useState('');
  const [recipientType, setRecipientType] = useState('Individual');
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

  // Helper to validate phone number format
  const isPhoneNumberValid = (val) => /^\+?\d[\d\s-]{7,}\d$/.test(val.trim());

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsGroupDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchContacts = async (category = 'All') => {
      if (!isOpen || !token) return;
      setLoadingContacts(true);
      setErrorContacts(null);
      try {
        let url = category === 'All' 
          ? 'https://com.tuma-app.com/api/marketing/contacts' 
          : `https://com.tuma-app.com/api/marketing/eligible?statuses=${encodeURIComponent(category)}`;

        const response = await axios.get(url, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const formattedContacts = response.data
          .filter(contact => contact.marketingSubscribed === true)
          .map((contact, index) => ({
            id: contact.accountId || `api-${index}-${contact.phone}`,
            name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unknown',
            detail: contact.phone,
            avatar: contact.firstName ? contact.firstName.substring(0, 2).toUpperCase() : '??',
          }));
        setAllContacts(formattedContacts);
      } catch (error) {
        setErrorContacts('Failed to load contacts.');
      } finally {
        setLoadingContacts(false);
      }
    };

    if (isOpen) {
      fetchContacts(recipientType === 'Groups' ? selectedGroupCategory : 'All');
      setRecipientSearchTerm('');
    }
  }, [isOpen, recipientType, selectedGroupCategory, token]);

  const filteredContacts = useMemo(() => {
    if (!recipientSearchTerm) return allContacts;
    const lower = recipientSearchTerm.toLowerCase();
    return allContacts.filter(c => 
      c.name.toLowerCase().includes(lower) || c.detail.toLowerCase().includes(lower)
    );
  }, [allContacts, recipientSearchTerm]);

  const handleContactCheckboxChange = (contactId) => {
    setSelectedContacts(prev => {
      if (prev.some(c => c.id === contactId)) {
        return prev.filter(c => c.id !== contactId);
      } else {
        const contact = allContacts.find(c => c.id === contactId);
        return contact ? [...prev, contact] : prev;
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedContacts(selectedContacts.length === allContacts.length ? [] : allContacts);
  };

  const handleAddRecipient = () => {
    const val = recipientSearchTerm.trim();
    if (!isPhoneNumberValid(val)) {
      alert("Please enter a valid phone number.");
      return;
    }
    if (!selectedContacts.some(c => c.detail === val)) {
      setSelectedContacts(prev => [...prev, {
        id: `manual-${Date.now()}`,
        name: val,
        detail: val,
        avatar: val.slice(-2),
      }]);
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
    let parsedData = [], headers = [];
    try {
      if (fileExtension === 'csv') {
        const result = await new Promise((res, rej) => {
          Papa.parse(file, { header: true, skipEmptyLines: true, complete: res, error: rej });
        });
        parsedData = result.data;
        headers = result.meta.fields;
      } else {
        const rows = await readXlsxFile(file);
        headers = rows[0].map(h => String(h).trim());
        parsedData = rows.slice(1).map(row => {
          const obj = {};
          headers.forEach((h, i) => obj[h] = row[i] !== null ? String(row[i]).trim() : '');
          return obj;
        });
      }

      const phoneKeys = ['phone', 'phone number', 'mobile'];
      const actualPhoneKey = headers.find(h => phoneKeys.includes(h.toLowerCase()));

      const imported = [];
      parsedData.forEach((row, i) => {
        const phone = row[actualPhoneKey] || row[headers[0]];
        if (phone && isPhoneNumberValid(phone)) {
          imported.push({
            id: `imp-${Date.now()}-${i}`,
            name: phone,
            detail: phone,
            avatar: phone.slice(-2),
          });
        }
      });
      setSelectedContacts(prev => [...prev, ...imported]);
    } catch (e) { alert("Import failed"); }
  };

  const handleContinue = async () => {
    // START: Logic to pick up manually typed number that wasn't added yet
    let finalRecipients = [...selectedContacts];
    const manualVal = recipientSearchTerm.trim();
    
    if (isPhoneNumberValid(manualVal) && !finalRecipients.some(c => c.detail === manualVal)) {
      finalRecipients.push({
        id: 'temp-manual',
        name: manualVal,
        detail: manualVal
      });
    }

    if (finalRecipients.length === 0) return alert("Select a recipient");
    if (channel !== 'WhatsApp') return alert("Only WhatsApp supported");

    setIsSending(true);
    setFinalMessage(null);

    let successfulSends = 0, failedSends = 0;
    const mediaUrl = TEMPLATE_MEDIA_URLS[templateName] || null;

    for (const contact of finalRecipients) {
      try {
        const payload = {
          recipient: contact.detail,
          templateName: templateName,
          params: [{ default: (contact.name === 'Unknown' || contact.name === contact.detail) ? 'there' : contact.name }],
          ...(mediaUrl && { mediaUrl })
        };
        const response = await axios.post('/api/sendTemplate', payload, {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });
        if (response.data.success) successfulSends++; else failedSends++;
      } catch (error) { failedSends++; }
    }

    setIsSending(false);
    setFinalMessage(`Sent: ${successfulSends}, Failed: ${failedSends}`);
    if (successfulSends > 0) {
      setSelectedContacts([]);
      setRecipientSearchTerm(''); // Clear input after successful send
    }
  };

  // Button is active if: not sending AND (we have selected contacts OR the current input is a valid phone)
  const isContinueDisabled = isSending || !templateName || channel !== 'WhatsApp' || (selectedContacts.length === 0 && !isPhoneNumberValid(recipientSearchTerm));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-xl h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">New Message</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-grow">
          {/* Channels */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Channel</h3>
            <div className="grid grid-cols-4 gap-3">
              <button onClick={() => setChannel('WhatsApp')} className={`flex flex-col items-center p-3 rounded-lg border transition ${channel === 'WhatsApp' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-gray-300'}`}>
                <FaWhatsapp className="w-6 h-6 mb-1" /><span className="text-xs font-medium">WhatsApp</span>
              </button>
              <button disabled className="flex flex-col items-center p-3 rounded-lg border bg-gray-50 text-gray-400 opacity-50"><FaEnvelope className="w-6 h-6 mb-1" /><span className="text-xs font-medium">Email</span></button>
              <button disabled className="flex flex-col items-center p-3 rounded-lg border bg-gray-50 text-gray-400 opacity-50"><FaSms className="w-6 h-6 mb-1" /><span className="text-xs font-medium">SMS</span></button>
              <button disabled className="flex flex-col items-center p-3 rounded-lg border bg-gray-50 text-gray-400 opacity-50"><BsPhone className="w-6 h-6 mb-1" /><span className="text-xs font-medium">In-App</span></button>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm font-semibold flex items-center justify-between">
            <span>Template: {templateName || "None"}</span>
            {TEMPLATE_MEDIA_URLS[templateName] && <span className="bg-blue-200 px-2 py-0.5 rounded-full text-xs">🖼️ Media</span>}
          </div>

          {/* Recipients */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Recipients ({selectedContacts.length})</h3>
              <button onClick={handleSelectAll} className="text-sm text-blue-600 hover:underline flex items-center"><BsCheckAll className="mr-1" /> Select All</button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button onClick={() => setRecipientType('Individual')} className={`flex items-center justify-center py-2 rounded-xl border ${recipientType === 'Individual' ? 'bg-blue-600 text-white' : 'bg-white'}`}><BsPerson className="mr-2" /> Individual</button>
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => { setRecipientType('Groups'); setIsGroupDropdownOpen(!isGroupDropdownOpen); }} className={`flex items-center justify-between w-full px-4 py-2 rounded-xl border ${recipientType === 'Groups' ? 'bg-blue-600 text-white' : 'bg-white'}`}>
                  <span className="flex items-center"><BsPeople className="mr-2" /> {selectedGroupCategory}</span>
                  <RiArrowDropDownLine className="text-2xl" />
                </button>
                {isGroupDropdownOpen && (
                  <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-xl z-20">
                    {groupCategories.map(cat => (
                      <button key={cat} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm" onClick={() => { setSelectedGroupCategory(cat); setIsGroupDropdownOpen(false); }}>{cat}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Chips */}
            {selectedContacts.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 p-2 bg-gray-50 border rounded-lg max-h-20 overflow-y-auto">
                {selectedContacts.map(c => (
                  <span key={c.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
                    {c.name} <button onClick={() => handleContactCheckboxChange(c.id)} className="ml-1 text-blue-400 hover:text-blue-600">&times;</button>
                  </span>
                ))}
              </div>
            )}

            {/* Search/Manual Input */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search or type phone number..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={recipientSearchTerm}
                  onChange={(e) => setRecipientSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
                />
                <div className="absolute left-3 top-2.5 text-gray-400">🔍</div>
              </div>

              {/* Show an Add button explicitly if the number is valid */}
              {isPhoneNumberValid(recipientSearchTerm) && (
                <button onClick={handleAddRecipient} className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                  <BsPlus className="text-xl" /> Add
                </button>
              )}

              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv,.xlsx,.xls" className="hidden" />
              <button onClick={() => fileInputRef.current.click()} className="p-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"><BsUpload /></button>
            </div>

            {/* Contact List */}
            <div className="border rounded-lg max-h-52 overflow-y-auto">
              {loadingContacts ? <div className="p-4 text-center text-gray-500">Loading...</div> :
               errorContacts ? <div className="p-4 text-center text-red-500">{errorContacts}</div> :
               filteredContacts.map(contact => (
                <label key={contact.id} className="flex items-center p-3 hover:bg-gray-50 border-b last:border-0 cursor-pointer">
                  <input type="checkbox" className="mr-3 h-4 w-4 text-blue-600" checked={selectedContacts.some(s => s.id === contact.id)} onChange={() => handleContactCheckboxChange(contact.id)} />
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold mr-3">{contact.avatar}</div>
                  <div className="flex-grow">
                    <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                    <div className="text-xs text-gray-500">{contact.detail}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {finalMessage && (
            <div className={`p-3 rounded-lg text-sm ${finalMessage.includes('Failed: 0') ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
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
            className={`px-10 py-2 rounded-xl text-white transition flex items-center font-bold ${isContinueDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal3;