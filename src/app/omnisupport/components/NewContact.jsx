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
    if (isOpen && contacts.length === 0) {
      const fetchContacts = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await axios.get("https://api.tuma-app.com/api/webhook/conversations");
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
  }, [isOpen, contacts.length]);

  const handleSelect = (contact) => {
    onSelectContact(contact);
    onClose();
  };

  // Starts a chat with the newly entered number
  const handleNewMessage = () => {
    const phoneNumber = newPhoneNumber.trim();
    if (phoneNumber) {
      // Create a contact-like object for the new number
      const newContact = {
        id: phoneNumber, // Use phone number as the temporary ID
        msisdn: phoneNumber,
        contactName: phoneNumber, // Display number as name initially
      };
      onSelectContact(newContact);
      onClose();
    }
  };

  const filteredContacts = contacts.filter(contact =>
    (contact.contactName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.msisdn.includes(searchTerm)
  );
  
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed top-24 w-full ml-5 h-[700px] z-20 flex">
      <div className="bg-gray-100 rounded-lg max-w-sm w-full shadow flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Start a Conversation</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          <div>
            <label htmlFor="new-contact" className="text-sm font-medium text-gray-700">New Conversation</label>
            <div className="flex items-center gap-2 mt-1">
              <input
                id="new-contact"
                type="text"
                placeholder="Enter phone number, e.g., 2547..."
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
                className="flex-grow w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={handleNewMessage} 
                disabled={!newPhoneNumber.trim()}
                className="p-2 text-blue-600 rounded-full hover:bg-blue-100 disabled:text-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                <LuSendHorizontal className='text-3xl' />
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="border-b my-2 text-center">
              <span className="bg-gray-100 px-2 text-sm text-gray-500">OR</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Select from Existing Contacts</h4>
            <div className="relative mb-2">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none"
              />
            </div>
            
            <div className="max-h-96 overflow-y-auto border rounded-lg bg-white">
              {loading && <p className="p-4 text-center text-gray-500">Loading contacts...</p>}
              {error && <p className="p-4 text-center text-red-500">{error}</p>}
              {!loading && filteredContacts.length === 0 && (
                <p className="p-4 text-center text-gray-500">No contacts found.</p>
              )}
              {filteredContacts.map(contact => (
                <div
                  key={contact.id}
                  onClick={() => handleSelect(contact)}
                  className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
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