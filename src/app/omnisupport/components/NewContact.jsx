// src/components/NewContact.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Search } from 'lucide-react';
import { LuSendHorizontal } from "react-icons/lu";


export default function NewContact({ isOpen, onClose, onSelectContact }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');

  useEffect(() => {
    // Only fetch contacts if the modal is open and contacts haven't been loaded yet
    if (isOpen && contacts.length === 0) {
      const fetchContacts = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await axios.get("https://api.tuma-app.com/api/webhook/conversations");
          // De-duplicate contacts based on phone number (msisdn) to get a unique list
          const uniqueContacts = new Map();
          response.data.forEach(contact => {
            if (contact.msisdn && !uniqueContacts.has(contact.msisdn)) {
              uniqueContacts.set(contact.msisdn, contact);
            }
          });
          setContacts(Array.from(uniqueContacts.values()));
        } catch (err) {
          setError('Failed to fetch contacts.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchContacts();
    }
  }, [isOpen]); // Effect runs when `isOpen` changes

  // Function to handle selecting an existing contact
  const handleSelect = (contact) => {
    onSelectContact(contact);
    onClose(); // Close modal after selection
  };

  // Function to handle starting a chat with a new number
  const handleNewMessage = () => {
    if (newPhoneNumber.trim()) {
        // Create a contact-like object for the new number
        const newContact = {
            contactName: null, // No name known yet
            msisdn: newPhoneNumber.trim(),
            contactId: newPhoneNumber.trim() // Use phone number as a temporary unique ID
        };
        onSelectContact(newContact);
        onClose();
    }
  };

  // Filter contacts based on the search term
  const filteredContacts = contacts.filter(contact =>
    (contact.contactName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.msisdn.includes(searchTerm)
  );
  
  // Don't render anything if the modal is not open
  if (!isOpen) {
    return null;
  }

  return (
    // Modal Overlay
    <div className="fixed top-24 w-full  ml-5 h-[700px] z-20  flex ">
      {/* Modal Content */}
      <div className="bg-gray-100 rounded-lg max-w-sm w-full shadow flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold"></h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-4">
          {/* New Contact Input */}
          <div>
            <label htmlFor="new-contact" className="text-sm font-medium text-gray-700">New Contact Phone Number</label>
            <div className="flex gap-2 mt-1">
              <input
                id="new-contact"
                type="text"
                placeholder="e.g., 2547..."
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
                className="flex-grow w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
      
              <LuSendHorizontal onClick={handleNewMessage} className='text-4xl text-blue-600 ml-2' />

            </div>
          </div>

          <div className="relative">
            <div className="border-b my-2 text-center">
            </div>
          </div>
          
          {/* Existing Contacts Section */}
          <div>
            <h4 className="font-semibold mb-2">Select from Existing Contacts</h4>
            <div className="relative mb-2">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none"
              />
            </div>
            
            {/* Contact List */}
            <div className="max-h-96 overflow-y-auto border rounded-lg">
              {loading && <p className="p-4 text-center text-gray-500">Loading contacts...</p>}
              {error && <p className="p-4 text-center text-red-500">{error}</p>}
              {!loading && filteredContacts.length === 0 && (
                <p className="p-4 text-center text-gray-500">No contacts found.</p>
              )}
              {filteredContacts.map(contact => (
                <div
                  key={contact.id}
                  onClick={() => handleSelect(contact)}
                  className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {(contact.contactName || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{contact.contactName || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{contact.msisdn}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}