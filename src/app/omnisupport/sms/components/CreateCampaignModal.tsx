import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { FiSend } from 'react-icons/fi';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Contact {
  phone: string; // Ensure this is consistently a string for search to work
  firstName?: string;
  lastName?: string;
  name?: string; // This is generated and used for display/search
  status?: string;
  isSelected: boolean;
}

const STATUS_CATEGORIES = [
  'Select All',
  'Lead',
  'Basic',
  'Basic_Pending',
  'Dormant',
  'Active',
  'Decline',
  'Inactive',
];

const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ isOpen, onClose }) => {
  const [campaignName, setCampaignName] = useState('');
  const [purpose, setPurpose] = useState('Promotional');
  const [messageContent, setMessageContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Select All');

  const [allRawContacts, setAllRawContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loadingContacts, setLoadingContacts] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draftResponseId, setDraftResponseId] = useState<string | null>(null);

    const [manualNumber, setManualNumber] = useState<string>("");

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const maxMessageLength = 1000;
  const smsCharacterLimit = 160;

  const fetchAllRawContacts = useCallback(async () => {
    if (!accessToken) {
      setError('Authentication token not found.');
      return;
    }

    setLoadingContacts(true);
    setError(null);
    try {
      const response = await axios.get<Contact[]>('https://api.tuma-app.com/api/account/contact', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const validContacts = response.data.filter(contact => contact.phone && !contact.phone.includes('DELETED_'));

      const contactsWithProcessedNames = validContacts.map((contact) => {
        // Ensure phone is a string from the start, though API should send it as such
        const phoneAsString = String(contact.phone).trim(); 

        const randomIndex = Math.floor(Math.random() * (STATUS_CATEGORIES.length - 1)) + 1;

        let fullName = '';
        if (contact.firstName && contact.lastName) {
          fullName = `${contact.firstName.trim()} ${contact.lastName.trim()}`;
        } else if (contact.firstName) {
          fullName = contact.firstName.trim();
        } else if (contact.lastName) {
          fullName = contact.lastName.trim();
        } else {
          fullName = 'Unknown Contact';
        }

        return {
          ...contact,
          phone: phoneAsString, // Store as string
          name: fullName,
          status: (contact.status || STATUS_CATEGORIES[randomIndex]).trim(),
          isSelected: false
        };
      });

      setAllRawContacts(contactsWithProcessedNames);
    } catch (err) {
      console.error('Failed to fetch all raw contacts:', err);
      setError('Failed to load contacts. Please try again.');
      setAllRawContacts([]);
    } finally {
      setLoadingContacts(false);
    }
  }, [accessToken]);

  const clearFormFields = useCallback(() => {
    setCampaignName('');
    setPurpose('Promotional');
    setMessageContent('');
    setSearchTerm('');
    setSendError(null);
    setError(null);
    setSuccessMessage(null);
    setSelectedCategory('Select All');
    setDraftResponseId(null);
    setAllRawContacts(prevContacts => prevContacts.map(contact => ({ ...contact, isSelected: false })));
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchAllRawContacts();
    } else {
      clearFormFields();
      setAllRawContacts([]);
      setLoadingContacts(false);
      setIsProcessing(false);
    }
  }, [isOpen, fetchAllRawContacts, clearFormFields]);

  const currentChars = messageContent.length;
  const smsCount = useMemo(() => {
    if (currentChars === 0) return 0;
    return Math.ceil(currentChars / smsCharacterLimit);
  }, [currentChars]);

  const filteredAndSearchedContacts = useMemo(() => {
    let contacts = allRawContacts;

    if (selectedCategory !== 'Select All') {
      contacts = contacts.filter(contact => contact.status === selectedCategory);
    }

    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      contacts = contacts.filter(contact =>
        contact.name?.toLowerCase().includes(lowercasedSearchTerm) ||
        // FIX: Ensure contact.phone is always a string before calling .includes()
        String(contact.phone).includes(lowercasedSearchTerm) 
      );
    }
    return contacts;
  }, [allRawContacts, selectedCategory, searchTerm]);

  const selectedContactChips = useMemo(() => {
    return allRawContacts.filter(contact => contact.isSelected);
  }, [allRawContacts]);

  const handleContactToggle = (phone: string) => {
    setAllRawContacts(prevContacts =>
      prevContacts.map(contact =>
        contact.phone === phone ? { ...contact, isSelected: !contact.isSelected } : contact
      )
    );
    setDraftResponseId(null);
  };

  const handleSelectAllFiltered = () => {
    const allSelectedInFilteredView = filteredAndSearchedContacts.length > 0 && filteredAndSearchedContacts.every(contact => contact.isSelected);
    setAllRawContacts(prevContacts =>
      prevContacts.map(contact => {
        const isInFilteredView = filteredAndSearchedContacts.some(fContact => fContact.phone === contact.phone);
        if (isInFilteredView) {
          return { ...contact, isSelected: !allSelectedInFilteredView };
        }
        return contact;
      })
    );
    setDraftResponseId(null);
  };

  const handleRemoveChip = (phone: string) => {
    setAllRawContacts(prevContacts =>
      prevContacts.map(contact =>
        contact.phone === phone ? { ...contact, isSelected: false } : contact
      )
    );
    setDraftResponseId(null);
  };

  const selectedRecipientCount = allRawContacts.filter(contact => contact.isSelected).length;
  const estimatedCost = (selectedRecipientCount * smsCount * 0.05).toFixed(2);
   // 🟩 Manual add
  const handleAddManualNumber = () => {
    const num = manualNumber.trim();
    if (!num) return;
    const exists = allRawContacts.some((c) => c.phone === num);
    if (exists) {
      alert("Number already in contact list.");
      return;
    }
    setAllRawContacts((prev) => [
      ...prev,
      { phone: num, name: num, status: "Manual", isSelected: true },
    ]);
    setManualNumber("");
  };

 // ... (previous code)

    // 🟨 CSV / Excel Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "csv") {
      Papa.parse(file, {
        header: true,
        complete: (result) => {
          const imported = result.data
            .map((r: any) => ({
              // Use 'Phone' column first, then fallback to 'number' or empty string
              phone: String(r.Phone || r.number || "").trim(), 
              // Use 'Full Name' column first, then fallback to 'name', 'Phone', or a default
              name: String(r['Full Name'] || r.name || r.Phone || "Imported Contact").trim(), 
              status: "Imported",
              isSelected: true,
            }))
            .filter((r) => r.phone); // Only keep contacts that have a phone number

          setAllRawContacts((prev) => [
            ...prev,
            ...imported.filter(
              (i) => !prev.some((p) => p.phone === i.phone)
            ),
          ]);
        },
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
         // ✅ Target the specific sheet called "Customer leads"
    const sheetName =
      workbook.SheetNames.find(
        (name) => name.toLowerCase().trim() === "Customer Lead - Onfido Review"
      ) || workbook.SheetNames[0]; // fallback to first sheet if not found

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);
        const imported = rows
          .map((r: any) => ({
            // Access the 'Phone' column directly from the row object
            phone: String(r.Phone || "").trim(), 
            // Access 'Full Name' or 'FDUNU' for a name, otherwise use phone or default
            name: String(r['Full Name'] || r.FDUNU || r.Phone || "Imported Contact").trim(),
            status: "Imported",
            isSelected: true,
          }))
          .filter((r) => r.phone); // Ensure a phone number exists

        setAllRawContacts((prev) => [
          ...prev,
          ...imported.filter(
            (i) => !prev.some((p) => p.phone === i.phone)
          ),
        ]);
      };
      reader.readAsBinaryString(file);
    } else {
      alert("Unsupported file type. Upload CSV or Excel.");
    }
  };


  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSearchTerm('');
    setSendError(null);
    setSuccessMessage(null);
    setDraftResponseId(null);
  };

  const handleSaveAsDraftCampaign = async () => {
    setIsProcessing(true);
    setSendError(null);
    setSuccessMessage(null);
    setDraftResponseId(null);

    const recipientsArray = allRawContacts
      .filter(contact => contact.isSelected)
      .map(contact => contact.phone);

    if (recipientsArray.length === 0) {
      setSendError('Please select at least one recipient.');
      setIsProcessing(false);
      return;
    }

    if (messageContent.trim() === '') {
      setSendError('Message content cannot be empty.');
      setIsProcessing(false);
      return;
    }

    const recipientPhoneNumbersString = recipientsArray.join(','); 

    try {
      const response = await axios.post('http://localhost:8080/api/sms-campaigns', { 
        campaignName: campaignName,
        purposeOfCampaign: purpose, 
        messageContent: messageContent,
        recipientPhoneNumbers: recipientPhoneNumbersString, 
        estimatedCost: parseFloat(estimatedCost),
        targetAudience: selectedCategory,
      },
      { // Add headers for authorization here as well if needed for draft saving
        headers: {
          Authorization: `Bearer ${accessToken}`, 
        },
      });

      console.log('Draft save response:', response.data);

      setIsProcessing(false);

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage('Campaign saved as draft successfully! You can now launch it.');
        setDraftResponseId(response.data.id?.toString() || 'mock-draft-id-123'); 
      }
    } catch (err: unknown) {
      setIsProcessing(false);
      if (axios.isAxiosError(err)) {
        console.error('Error saving draft:', err.response?.data || err.message);
        setSendError(err.response?.data?.message || 'Failed to save campaign as draft. Please try again.');
      } else {
        console.error('An unexpected error occurred. Please try again.', err);
        setSendError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleLaunchCampaign = async () => {
    setIsProcessing(true);
    setSendError(null);
    setSuccessMessage(null);

    if (!draftResponseId) {
      setSendError('Please save the campaign as a draft first to get a response ID.');
      setIsProcessing(false);
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8080/api/sms-campaigns/${draftResponseId}/send`, 
        {
          // No body required here as per your backend API for /send endpoint
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, 
          },
        }
      );

      console.log('Campaign launch response:', response.data);

      setIsProcessing(false);

      if (response.status === 200) {
        setSuccessMessage('Campaign launched successfully!');
        clearFormFields();
      } else if (response.status === 207) { 
        setSuccessMessage('Campaign launched with some failures (check console for details).');
        clearFormFields();
      }
    } catch (err: unknown) {
      setIsProcessing(false);
      if (axios.isAxiosError(err)) {
        console.error('Error launching campaign:', err.response?.data || err.message);
        setSendError(err.response?.data?.message || 'Failed to launch campaign. Please try again.');
      } else {
        console.error('An unexpected error occurred. Please try again.', err);
        setSendError('An unexpected error occurred. Please try again.');
      }
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-t-lg rounded-b-lg shadow-xl w-full max-w-2xl max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create SMS Campaign</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
                <button type="button" onClick={() => setSuccessMessage(null)} className="text-green-700 hover:text-green-900">
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
                <button type="button" onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
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
                onChange={(e) => {
                    setCampaignName(e.target.value);
                    setDraftResponseId(null);
                }}
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
                onChange={(e) => {
                    setPurpose(e.target.value);
                    setDraftResponseId(null);
                }}
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
                setSendError(null);
                setSuccessMessage(null);
                setDraftResponseId(null);
              }}
            ></textarea>
            <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
              <span>
                {currentChars}/{maxMessageLength} characters • {smsCount} SMS
              </span>
              <button type="button" className="text-blue-600 hover:text-blue-800 font-medium">Use Template</button>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex space-x-2 overflow-x-auto pb-2 -mx-6 px-6 no-scrollbar" style={{ scrollbarWidth: 'none', '-ms-overflow-style': 'none' }}>
              <div className="flex space-x-2">
                {STATUS_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200
                      ${selectedCategory === category
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }
                      ${loadingContacts ? 'opacity-60 cursor-not-allowed' : ''}
                    `}
                    onClick={() => !loadingContacts && handleCategoryClick(category)}
                    disabled={loadingContacts}
                  >
                    {category} ({
                      category === 'Select All'
                        ? allRawContacts.length
                        : allRawContacts.filter(c => c.status === category).length
                    })
                  </button>
                ))}
              </div>
            </div>

            {loadingContacts && <p className="text-sm text-gray-500 mt-2">Fetching contacts...</p>}
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

            {selectedContactChips.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-md mb-4 bg-gray-50 max-h-40 overflow-y-auto mt-4">
                {selectedContactChips.map((contact) => (
                  <span
                    key={contact.phone}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {contact.name || contact.phone}
                    <button
                      type="button"
                      className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-500 focus:text-white"
                      onClick={() => handleRemoveChip(contact.phone)}
                    >
                      <span className="sr-only">Remove {contact.name || contact.phone}</span>
                      <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.316l3.321 3.321a.75.75 0 11-1.06 1.06l-3.321-3.321A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Search by name or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="mt-4 border border-gray-200 rounded-md overflow-hidden max-h-60 overflow-y-auto">
              <div className="flex items-center p-3 border-b border-gray-200 bg-gray-50">
                <input
                  type="checkbox"
                  id="select-all-filtered-contacts"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={filteredAndSearchedContacts.length > 0 && filteredAndSearchedContacts.every(contact => contact.isSelected)}
                  onChange={handleSelectAllFiltered}
                  disabled={filteredAndSearchedContacts.length === 0}
                />
                <label htmlFor="select-all-filtered-contacts" className="ml-3 text-sm font-medium text-gray-700 cursor-pointer">
                  Select All ({filteredAndSearchedContacts.length})
                </label>
              </div>
              <ul className="divide-y divide-gray-200">
                {filteredAndSearchedContacts.length === 0 && !loadingContacts && (
                  <li className="py-3 px-4 text-sm text-gray-500">No contacts found for the current selection and search.</li>
                )}
                {filteredAndSearchedContacts.map((contact) => (
                  <li key={contact.phone} className="flex items-center justify-between py-3 px-4 hover:bg-gray-50">
                    <div className="flex items-center">
                      <input
                        id={`contact-${contact.phone}`}
                        name={`contact-${contact.phone}`}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        checked={contact.isSelected}
                        onChange={() => handleContactToggle(contact.phone)}
                      />
                      <label htmlFor={`contact-${contact.phone}`} className="ml-3 block text-sm">
                        <p className="font-medium text-gray-900">{contact.name || 'Unknown Contact'}</p>
                        <p className="text-gray-500">{contact.phone}</p>
                      </label>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {sendError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 mt-4" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {sendError}</span>
                <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                  <button type="button" onClick={() => setSendError(null)} className="text-red-700 hover:text-red-900">
                    <svg className="fill-current h-6 w-6" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                  </button>
                </span>
              </div>
            )}
         
          </div>



           <div className="mt-6">
            <h3 className="text-sm font-semibold mb-2 text-gray-700">
              Add Numbers Manually or Import
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter phone number manually"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                value={manualNumber}
                onChange={(e) => setManualNumber(e.target.value)}
              />
              <button
                onClick={handleAddManualNumber}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add
              </button>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="text-sm"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Upload a CSV/Excel with columns: <b>phone</b> or <b>number</b>{" "}
              (optional: name)
            </p>
          </div>

          {/* Contact List stays same */}
          <div className="mt-6 border border-gray-200 rounded-md overflow-hidden max-h-60 overflow-y-auto">
            <div className="flex items-center p-3 border-b border-gray-200 bg-gray-50">
              <input
                type="checkbox"
                id="select-all"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                checked={
                  filteredAndSearchedContacts.length > 0 &&
                  filteredAndSearchedContacts.every((c) => c.isSelected)
                }
                onChange={handleSelectAllFiltered}
              />
              <label
                htmlFor="select-all"
                className="ml-2 text-sm text-gray-700"
              >
                Select All ({filteredAndSearchedContacts.length})
              </label>
            </div>

            <ul className="divide-y divide-gray-200">
              {filteredAndSearchedContacts.map((c) => (
                <li
                  key={c.phone}
                  className="flex items-center justify-between py-2 px-4 hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={c.isSelected}
                      onChange={() => handleContactToggle(c.phone)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {c.name}
                      </p>
                      <p className="text-xs text-gray-500">{c.phone}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between text-sm text-gray-600 mt-3">
            <span>Total Recipients: {selectedRecipientCount}</span>
            <span>Estimated Cost: ${estimatedCost}</span>
          </div>
        </div>
        {/* Modal Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50 space-x-4 rounded-b-lg">
          <div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium mr-5 text-gray-700 bg-transparent hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isProcessing}
            >
              Cancel
            </button>
          </div>
          <div>
            {draftResponseId ? (
              // Show Launch Campaign button if a draft ID exists
              <button
                type="button"
                onClick={handleLaunchCampaign}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Launching...
                  </>
                ) : (
                  <>
                    <FiSend className="h-4 w-4 mr-2 -ml-1 transform" />
                    Launch Campaign
                  </>
                )}
              </button>
            ) : (
              // Show Save as Draft button initially
              <button
                type="button"
                onClick={handleSaveAsDraftCampaign}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                disabled={isProcessing || !campaignName || !messageContent || selectedRecipientCount === 0}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Draft...
                  </>
                ) : (
                  <>
                    <FiSend className="h-4 w-4 mr-2 -ml-1 transform" />
                    Save as Draft
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaignModal;