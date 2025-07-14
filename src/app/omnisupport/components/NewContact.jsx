import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Search, ChevronDown, Loader2 } from 'lucide-react';
import { LuSendHorizontal } from "react-icons/lu";

// List of country codes you want to fetch
const countryCodesToFetch = 'KE,TZ,UG,BI,RW,ZM,ZA';
const REST_COUNTRIES_ENDPOINT = `https://restcountries.com/v3.1/alpha?codes=${countryCodesToFetch}&fields=name,cca2,idd,flags`;

export default function NewContact({ isOpen, onClose, onSelectContact }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [countries, setCountries] = useState([]);
  const [countryLoading, setCountryLoading] = useState(false);
  const [countryError, setCountryError] = useState(null);

  // useEffect to fetch country data from the endpoint
  useEffect(() => {
    if (isOpen && countries.length === 0) {
      const fetchCountries = async () => {
        setCountryLoading(true);
        setCountryError(null);
        try {
          const response = await axios.get(REST_COUNTRIES_ENDPOINT);
          
          const processedData = response.data.map(country => ({
            name: country.name.common,
            code: country.cca2,
            // --- MODIFIED: Remove the '+' from the dial code ---
            dial_code: `${country.idd.root.slice(1)}${country.idd.suffixes[0]}`,
            flag: country.flags.svg
          })).sort((a, b) => a.name.localeCompare(b.name));

          setCountries(processedData);
          const kenya = processedData.find(c => c.code === 'KE');
          setSelectedCountry(kenya || processedData[0]);

        } catch (err) {
          setCountryError('Failed to load country codes.');
          console.error(err);
        } finally {
          setCountryLoading(false);
        }
      };
      fetchCountries();
    }
  }, [isOpen, countries.length]);

  // useEffect for fetching existing contacts (unchanged)
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

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setNewPhoneNumber('');
  };

  const handleNewMessage = () => {
    const localPhoneNumber = newPhoneNumber.trim();
    if (localPhoneNumber && selectedCountry) {
      const fullPhoneNumber = `${selectedCountry.dial_code}${localPhoneNumber}`;
      const newContact = {
        id: fullPhoneNumber,
        msisdn: fullPhoneNumber,
        contactName: fullPhoneNumber,
      };
      onSelectContact(newContact);
      onClose();
    }
  };

  const filteredContacts = contacts.filter(contact =>
    (contact.contactName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.msisdn.includes(searchTerm)
  );
  
  if (!isOpen) return null;

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
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  disabled={countryLoading || countryError}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                  {countryLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : selectedCountry ? (
                    <>
                      <img src={selectedCountry.flag} alt={selectedCountry.name} className="w-6 rounded h-auto" />
                      {/* UI now displays the code without '+' */}
                      <span className="text-sm font-medium">{selectedCountry.dial_code}</span>
                      <ChevronDown size={16} className="text-gray-500" />
                    </>
                  ) : (
                    <span>Error</span>
                  )}
                </button>
                {isDropdownOpen && !countryLoading && (
                  <div className="absolute top-full mt-1 w-max bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    {countries.map((country) => (
                      <div
                        key={country.code}
                        onClick={() => handleCountrySelect(country)}
                        className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <img src={country.flag} alt={country.name} className="w-6 rounded h-auto" />
                        <span className="text-sm">{country.name}</span>
                        <span className="text-sm text-gray-500">{country.dial_code}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <input
                id="new-contact"
                type="tel"
                placeholder="712 345 678"
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value.replace(/\D/g, ''))}
                disabled={countryLoading || !selectedCountry}
                className="flex-grow w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
              />
              <button 
                onClick={handleNewMessage} 
                disabled={!newPhoneNumber.trim() || !selectedCountry}
                className="p-2 text-blue-600 rounded-full hover:bg-blue-100 disabled:text-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                <LuSendHorizontal className='text-3xl' />
              </button>
            </div>
            {countryError && <p className="text-xs text-red-600 mt-1">{countryError}</p>}
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
                  className="flex items-center gap-3 px-3 py-2 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {(contact.contactName || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{contact.contactName || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{contact.msisdn}</p>
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