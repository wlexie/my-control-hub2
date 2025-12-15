"use client"; // This directive is ESSENTIAL for App Router client components

import React, { useState, useEffect, useRef, useMemo, useCallback, Fragment } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useSelector } from 'react-redux';
import { parsePhoneNumberFromString } from 'libphonenumber-js';


// --- Icon Imports ---
import {
  NotebookPen, MessageSquare, MoreVertical, Paperclip, Smile, Send,
  Loader2, CheckCheck, X, UploadCloud, ArrowLeft
} from 'lucide-react';
import { FaPlus, FaWhatsapp, FaListAlt, FaStickyNote } from "react-icons/fa";


// --- Component Imports ---
import Modal from './Modal1';
import EscalateIssueModal from './EscalateIssueModal';
import TemplatesModal from './TemplatesModal';
import TemplateModal from './TemplateModal';
import MessageStatus from './MessageStatus';
import Confirmation from './Confirmation';
import AssignTicketModal from './AssignTicketModal'; // Import the new modal



// =================================================================================
// ---  CONFIGURATION CONSTANTS  ---
// =================================================================================
const API_BASE_URL = "https://api.tuma-app.com/api/webhook";
const POLLING_INTERVAL = 60000;

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
  'flash_announcement': null,
  '5_days': null,
  '3_days': null,
  'eve_reminder': null,
  '4_hours': null,
  '1_hour': null,
  'flash_hour': null,
  'after_sale': null

};

const TEMPLATE_BODIES = {
  'welcome_dormant': "Hi {{1}}, we noticed you haven't been active lately. Is there anything we can help you with to get you started?",
  'welcome_basics': "Hello {{1}}! Welcome to Tuma. We're excited to have you on board. Here are some basics to get you started",
  'welcome_active': "Hi {{1}}, great to see you're active! Let us know if you need any assistance or have any questions.",
  'potential_user': "Hello {{1}}, thank you for your interest in Tuma. We'd love to help you get started. What can we help you with today?",
  'welcome_leads': "Hi {{1}}, thanks for reaching out! We've received your inquiry and a member of our team will be in touch shortly.",
  'welcome_decline': "Hello {{1}}, we understand you've chosen not to proceed at this time. We appreciate your interest and hope you'll consider us in the future. If you have any feedback, we'd love to hear it.",
  'country_updates': "Hello {{1}}, we have an update regarding our services in your country. Please check our website for more details.", // Example
};


// =================================================================================
// ---  HELPER UTILITY FUNCTIONS  ---
// =================================================================================

const getCountryCode = (msisdn) => {
  if (!msisdn || typeof msisdn !== 'string') return null;
  const formattedMsisdn = msisdn.startsWith('+') ? msisdn : `+${msisdn}`;
  try {
    const phoneNumber = parsePhoneNumberFromString(formattedMsisdn);
    if (phoneNumber && phoneNumber.country) return phoneNumber.country;
  } catch (error) {
    console.error("Error parsing phone number:", error);
  }
  return null;
};

const avatarColorPalette = ['bg-red-500', 'bg-green-500', 'bg-purple-500', 'bg-blue-500', 'bg-indigo-500', 'bg-pink-500', 'bg-orange-500'];
const getColorForId = (id) => { if (!id) return 'bg-gray-400'; let hash = 0; for (let i = 0; i < id.length; i++) { hash = id.charCodeAt(i) + ((hash << 5) - hash); } const index = Math.abs(hash % avatarColorPalette.length); return avatarColorPalette[index]; };
const getInitials = (name = '') => { if (!name || typeof name !== 'string' || name.toLowerCase() === 'unknown') return 'UN'; const parts = name.split(' ').filter(Boolean); if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase(); if (parts.length === 1 && parts[0].length > 1) return parts[0].substring(0, 2).toUpperCase(); if (parts.length === 1) return parts[0][0].toUpperCase(); return '??'; };
const formatDateSeparator = (dateStr) => { const date = new Date(dateStr); const today = new Date(); const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); if (date.toDateString() === today.toDateString()) return 'Today'; if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'; return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); };

const formatFullTimestamp = (timestampStr) => {
    if (!timestampStr) return "";

    const date = new Date(timestampStr);

    // Add 3 hours
    date.setHours(date.getHours() + 3);

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const timeString = date.toLocaleTimeString('en-US', timeOptions).replace(' ', '');

    if (date.toDateString() === today.toDateString()) return `Today at ${timeString}`;
    if (date.toDateString() === yesterday.toDateString()) return `Yesterday at ${timeString}`;
    return `${date.toLocaleDateString()} at ${timeString}`;
};



// =================================================================================
// ---  MAIN CONVERSATION COMPONENT  ---
// =================================================================================
export default function Conversation({ selectedChat, setSelectedChat, onCloseMobile }) {

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [errorMessages, setErrorMessages] = useState(null);
  const [chatDetails, setChatDetails] = useState({ name: selectedChat?.contactName || '', phone: selectedChat?.msisdn || '' });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
 const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
 const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);


  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const dragCounter = useRef(0);

    const { accessToken } = useSelector((state) => state.auth);


  // Use the reliable state for dynamic data
  const userName = chatDetails.name;
  const status = chatDetails.status;
  const userPhoneNumber = chatDetails.phone;
  const ticketId = chatDetails.ticketId;

  const userInitials = getInitials(userName);
  const userAvatarColor = useMemo(() => getColorForId(selectedChat?.id), [selectedChat?.id]);
  const countryCode = useMemo(() => getCountryCode(userPhoneNumber), [userPhoneNumber]);


 const fetchFullConversation = useCallback(async (isBackgroundPoll = false) => {
    const currentTicketId = selectedChat?.ticketId;
    if (!currentTicketId || !accessToken) {
      setMessages([]);
      return;
    }

    if (!isBackgroundPoll) { setLoadingMessages(true); }
    setErrorMessages(null);

    try {
      const response = await axios.get(
        `https://com.tuma-app.com/api/conversations/${currentTicketId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const conversationData = response.data;
      const fetchedMessages = conversationData.history || [];

      // --- CHANGE 1: Filter out any messages that have a null or empty 'direction' ---
      const validMessages = fetchedMessages.filter(msg => msg.direction && msg.direction.trim() !== '');

     const processedMessages = validMessages.map(msg => ({
        id: msg.id, 
        payload: (msg.messageType === 'image' || msg.messageType === 'file') 
        ? { url: msg.content } 
        : msg.content || "[No Content]", 
        type: msg.messageType === 'image' || msg.messageType === 'file' ? msg.messageType : 'text',
        createdAt: msg.messageTime,
        direction: msg.direction,
        senderName: msg.senderName,
        status: msg.status,

      }));

      processedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setMessages(processedMessages);

      // --- CHANGE 2: Update all chat details from the fresh API response ---
      setChatDetails({
          name: conversationData.contactName,
          phone: conversationData.contactPhone, // This ensures userPhoneNumber is always up-to-date
          ticketId: conversationData.ticketId, // Store the ticketId for display
          status: conversationData.status
      });

    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Error fetching conversation:", err);
        if (!isBackgroundPoll) setErrorMessages("Failed to load conversation history.");
      } else {
        if (!isBackgroundPoll) setMessages([]);
      }
    } finally {
      if (!isBackgroundPoll) setLoadingMessages(false);
    }
  }, [selectedChat?.ticketId, accessToken]);

  useEffect(() => { if (textareaRef.current) { textareaRef.current.style.height = 'auto'; textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; } }, [newMessage]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    // Reset state when chat selection changes
    setMessages([]);
    setNewMessage('');
    setShowEmojiPicker(false);
    setChatDetails({ name: selectedChat?.contactName || '', phone: selectedChat?.contactPhone || '', ticketId: selectedChat?.ticketId || '', status: selectedChat?.status || '' });

    if (selectedChat?.ticketId) {
      fetchFullConversation(false);
    }
  }, [selectedChat, fetchFullConversation]);

  useEffect(() => {
    if (!selectedChat?.ticketId) return;
    const intervalId = setInterval(() => fetchFullConversation(true), POLLING_INTERVAL);
    return () => clearInterval(intervalId);
  }, [selectedChat?.ticketId, fetchFullConversation]);

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', isModalOpen || isEscalateModalOpen || isTemplatesModalOpen || isTemplateModalOpen);
  }, [isModalOpen, isEscalateModalOpen, isTemplatesModalOpen, isTemplateModalOpen]);

  const sendMessage = async () => {
    if (newMessage.trim() === '' || !selectedChat) return;
    const recipientPhoneNumber = userPhoneNumber;
    if (!recipientPhoneNumber) { console.error('Recipient phone number (msisdn) could not be determined.'); return; }

    const userMsg = { id: `temp-${Date.now()}`, payload: newMessage, createdAt: new Date().toISOString(), direction: 'sent', type: 'text' };
    setMessages(prevMessages => [...prevMessages, userMsg]);
    setNewMessage('');
    setShowEmojiPicker(false);

    try {
      await axios.post('/api/sendMessage', { recipientPhone: recipientPhoneNumber, message: newMessage });
      // Optionally, if the chat was closed, you might want to update its status here or let the backend handle it.
      // For now, we'll just refetch messages.
      setTimeout(() => fetchFullConversation(true), 1500);
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error);
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
      alert('Failed to send message.');
    }
  };

  const handleFileUpload = async (file) => {
    if (!file || !selectedChat) return;
    const recipientPhoneNumber = userPhoneNumber;
    if (!recipientPhoneNumber) { alert("Could not determine the recipient's phone number."); return; }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('recipientPhone', recipientPhoneNumber);
    setIsUploading(true);
    try {
      const response = await axios.post('/api/sendMessage', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (response.data.success) { setTimeout(() => fetchFullConversation(true), 1500); }
      else { throw new Error(response.data.error || "File upload failed on the server."); }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSendTemplate = async (templateName) => {
    if (!userPhoneNumber || !templateName) { alert("Error: Cannot determine recipient's phone number or template name."); return; }
    const templateParams = [{ "default": userName === 'Unknown' ? 'there' : userName }];
    const mediaUrl = TEMPLATE_MEDIA_URLS[templateName];
    const templateBody = TEMPLATE_BODIES[templateName];
    const optimisticMessages = [];
    const timestamp = new Date().toISOString();
    if (mediaUrl) optimisticMessages.push({ id: `temp-img-${Date.now()}`, type: 'image', direction: 'sent', createdAt: timestamp, payload: { url: mediaUrl } });
    if (templateBody) {
      const populatedBody = templateBody.replace('{{1}}', userName === 'Unknown' ? 'there' : userName);
      optimisticMessages.push({ id: `temp-text-${Date.now()}`, type: 'text', direction: 'sent', createdAt: timestamp, payload: populatedBody });
    }
    if (optimisticMessages.length > 0) setMessages(prev => [...prev, ...optimisticMessages]);
    try {
      await axios.post('/api/sendTemplate', { recipient: userPhoneNumber, templateName, params: templateParams, mediaUrl });
      setIsTemplateModalOpen(false);
      setTimeout(() => fetchFullConversation(true), 2000);
    } catch (error) {
      const errorDetail = error.response?.data?.details || error.response?.data?.error || error.message;
      console.error('Error sending template:', error.response?.data || error);
      alert(`Failed to send template. Reason: ${errorDetail}`);
      setMessages(prev => prev.filter(m => !optimisticMessages.some(opt => opt.id === m.id)));
    }
  };

  const addEmoji = (emoji) => setNewMessage(prev => prev + emoji.native);



// CORRECTED CODE
const handleCloseChat = useCallback(async () => {
    // For robustness, read the ticketId directly from the state object inside the handler.
    const currentTicketId = chatDetails.ticketId;

    if (!currentTicketId) {
      alert("Cannot close ticket: Ticket ID is missing.");
      console.error("DEBUG: ticketId is missing. Current chatDetails object:", chatDetails);
      return;
    }

    setIsCloseConfirmOpen(false);

    try {
      await axios.post(
        `https://com.tuma-app.com/api/conversations/${currentTicketId}/close`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      // This will trigger a re-render and clean up the view
      setSelectedChat(null);
    } catch (error) { // <-- ADDED opening brace
      console.error("Error closing conversation:", error.response?.data || error.message);
      alert("Failed to close the ticket. Please try again.");
    } // <-- ADDED closing brace
}, [chatDetails, accessToken, setSelectedChat]); // <-- ADDED dependency array


const handleReopenChat = async () => {
    const currentTicketId = chatDetails.ticketId;
    if (!currentTicketId) {
        alert("Cannot reopen ticket: Ticket ID is missing.");
        return;
    }

    try {
        await axios.post(
            `https://com.tuma-app.com/api/conversations/${currentTicketId}/reopen`,
            {}, // No request body is needed, just the headers
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        // On success, simply refetch the conversation data.
        // This will update the status from 'CLOSED' to 'IN_PROGRESS'
        // and the footer UI will update automatically.
        await fetchFullConversation(false); // Pass false to show loading indicator
    } catch (error) {
        console.error("Error reopening conversation:", error.response?.data || error.message);
        alert("Failed to reopen the ticket. Please try again.");
    }
};


  const handleFileChange = (e) => { const file = e.target.files[0]; if (file) handleFileUpload(file); };
  const handleSelectTemplate = (text) => { setNewMessage(text); setIsTemplatesModalOpen(false); };
  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); dragCounter.current++; if (e.dataTransfer.items?.length > 0) setIsDraggingOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); dragCounter.current--; if (dragCounter.current === 0) setIsDraggingOver(false); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(false); dragCounter.current = 0; if (e.dataTransfer.files?.length > 0) { handleFileUpload(e.dataTransfer.files[0]); e.dataTransfer.clearData(); } };

  const handleAssignTicket = async (assignmentDetails) => {
    console.log('Ticket assignment initiated with details:', assignmentDetails);

    const { agentId, agentName, note, ticketId: ticketIdToAssign } = assignmentDetails;

    if (!ticketIdToAssign) {
      alert("Error: Ticket ID is missing for assignment.");
      console.error("Missing ticketId in handleAssignTicket for API call.");
      return;
    }
    if (!agentId) {
      alert("Error: Agent not selected for assignment.");
      return;
    }
    if (!accessToken) { // <-- Crucial check for accessToken
      alert("Error: Access token is missing. Please log in again.");
      console.error("Access token is missing for assigning ticket.");
      return;
    }

    try {
      const response = await axios.post(
        `https://com.tuma-app.com/api/conversations/${ticketIdToAssign}/assign`,
        {
          agentId: agentId,
          agentName: agentName,
          reason: note
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // <-- Using accessToken here
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        alert("Ticket assigned successfully!");
        setIsAssignModalOpen(false);
        fetchFullConversation(false);
      } else {
        alert(`Ticket assignment returned an unexpected status: ${response.status}`);
        console.warn("Unexpected API response for assign ticket:", response);
      }

    } catch (error) {
      console.error('Error assigning ticket:', error.response?.data || error.message || error);
      const errorMessage = error.response?.data?.message ||
                           error.response?.data?.error ||
                           error.message ||
                           "Failed to assign ticket. Please try again.";
      alert(errorMessage);
    }
  };
  return (
    <div className="flex flex-col h-screen bg-white relative" onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}>
       {/* --- CHANGE 3: Render the Confirmation modal and wire it up --- */}
      <Confirmation
        isOpen={isCloseConfirmOpen}
        onClose={() => setIsCloseConfirmOpen(false)} // This handles the "Cancel" button
        onConfirm={handleCloseChat} // This handles the "Confirm" button
        title="Close Ticket"
        confirmText="Confirm & Close"
      >
        Are you sure you want to close this ticket? This action cannot be undone.
      </Confirmation>
      {isDraggingOver && ( <div className="absolute inset-0 z-50 bg-blue-500/30 border-4 border-dashed border-blue-600 rounded-2xl flex flex-col items-center justify-center pointer-events-none"><UploadCloud className="w-24 h-24 text-blue-600" /><p className="mt-4 text-2xl font-bold text-blue-800">Drop file to upload</p></div> )}
      {lightboxImage && ( <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer" onClick={() => setLightboxImage(null)}> <button onClick={() => setLightboxImage(null)} className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/75 rounded-full p-2" > <X size={24} /> </button> <img src={lightboxImage} alt="Lightbox view" className="max-w-full max-h-full rounded-lg shadow-2xl cursor-default" onClick={(e) => e.stopPropagation()} /> </div> )}
      {isTemplatesModalOpen && ( <TemplatesModal closeModal={() => setIsTemplatesModalOpen(false)} onSelectTemplate={handleSelectTemplate} userName={userName} /> )}
      {isTemplateModalOpen && ( <TemplateModal closeModal={() => setIsTemplateModalOpen(false)} onSelectTemplate={handleSendTemplate} userName={userName}/> )}
       {isAssignModalOpen && (
        <AssignTicketModal
            isOpen={isAssignModalOpen}
            onClose={() => setIsAssignModalOpen(false)}
            onAssign={handleAssignTicket}
                        ticketId={ticketId} 
        />
        )}
      {!selectedChat ? ( <div className="text-gray-500 flex justify-center items-center h-full"> Select a chat to start a conversation </div> )
      : (
        <>
      <header className="bg-white p-2 border-b border-gray-200">
  <div className="flex items-center justify-between flex-wrap gap-4">

    {/* LEFT SIDE */}
    <div className="flex items-start gap-4 flex-wrap">
      <div className="relative flex-shrink-0">
        <div className={`flex items-center justify-center w-7 h-7 md:w-10 md:h-10 ${userAvatarColor} rounded-full font-semibold text-white text-sm md:text-lg`}>
          {userInitials}
        </div>
        {countryCode && (
          <img
            className="absolute md:-bottom-1 md:-right-1 bottom-3 -right-2 md:w-6 md:h-6 h-5 w-5 rounded-full border-2 border-white"
            src={`https://flagcdn.com/${countryCode.toLowerCase()}.svg`}
            alt={`${countryCode} flag`}
            title={countryCode}
          />
        )}
      </div>

      <div className="flex flex-col">
        <h2 className="md:text-lg text-sm font-semibold text-gray-800">{userName}</h2>
        <p className="text-[10px] md:text-[12px] text-gray-400 md:mt-0.5">{userPhoneNumber.replace('+', '')}</p>
        <div className="md:flex hidden items-center gap-2 mt-0.5  flex-wrap">
          {ticketId && (
            <span className="text-xs md:text-sm font-medium text-gray-600">
              Ticket #{ticketId}
            </span>
          )}
         {/* <span className="px-2 py-0.5 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">
            In Progress
          </span>
          <span className="px-2 py-0.5 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
            Urgent
          </span>*/}
          <button className="px-2 py-0.5 text-xs text-gray-500 hidden md:block border border-dashed border-gray-400 rounded-md hover:bg-gray-100">
            + Add Tag
          </button>
        </div>
      </div>
    </div>

    {/* RIGHT SIDE BUTTONS */}
    <div className="flex items-center gap-2 ml-auto">
      <button
        onClick={() => setIsAssignModalOpen(true)}
        className="px-2 py-1 md:px-4 md:py-1.5 text-xs md:text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors">
        Assign
      </button>
      <button
        onClick={() => setIsEscalateModalOpen(true)}
        className="px-2 py-1 md:px-4 md:py-1.5 text-xs md:text-sm font-semibold text-orange-600 bg-white border border-orange-400 rounded-sm hover:bg-orange-50 transition-colors"
      >
        Escalate
      </button>
      <button
        onClick={() => setIsCloseConfirmOpen(true)} // This now opens the modal
        className="px-2 py-1 md:px-4 md:py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 border border-green-500 rounded-sm hover:bg-green-600 transition-colors"
      >
        Close Ticket
      </button>

      {isEscalateModalOpen && (
        <EscalateIssueModal
          closeModal={() => setIsEscalateModalOpen(false)}
          goBackToModal1={() => {
            setIsEscalateModalOpen(false);
            setIsModalOpen(true);
          }}
        />
      )}
    </div>
  </div>
</header>


          <main className="relative flex-1 flex flex-col min-h-0">
            <div className="overflow-y-auto p-6 space-y-6 flex-1">
              {loadingMessages ? ( <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div> )
              : errorMessages ? ( <div className="text-red-500 text-center">{errorMessages}</div> )
              : ( messages.map((msg) => {
                  if (!msg || !msg.payload) return null;
                  const isSent = msg.direction === 'sent';

                  return isSent ? (
                    <div key={msg.id} className="flex justify-end items-start gap-3">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-sm font-bold text-gray-600">{msg.senderName || 'Agent'}</span>
                          <span className="text-xs text-gray-500">{formatFullTimestamp(msg.createdAt)}</span>
                        </div>
                        <div className="bg-blue-600 text-white p-3 rounded-lg max-w-lg">
                           {/* --- FIX: CONDITIONAL RENDERING FOR SENT MESSAGES --- */}
                           {msg.type === 'text' && <p className="text-sm break-words whitespace-pre-wrap">{msg.payload}</p>}
                           {msg.type === 'image' && <img src={msg.payload.url} alt="Agent attachment" className="rounded-lg max-w-[200px] cursor-pointer" onClick={() => setLightboxImage(msg.payload.url)} />}
                           {msg.type === 'file' && <a href={msg.payload.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-300 hover:text-white underline"><Paperclip size={16} /><span>File Attachment</span></a>}
                        </div>
                         <span className="text-sm text-gray-500 flex items-center gap-1">
                                      <MessageStatus status={msg.status} />
                             </span>
                           </div>
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">AG</div>
                    </div>
                  ) : (
                    <div key={msg.id} className="flex justify-start items-start gap-3">
                      <div className={`w-10 h-10 rounded-full ${userAvatarColor} flex items-center justify-center text-white font-semibold flex-shrink-0`}>{userInitials}</div>
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-gray-800">{userName}</span>
                          <span className="text-xs text-gray-500">{formatFullTimestamp(msg.createdAt)}</span>
                          <FaWhatsapp className="text-green-500" />
                        </div>
                        <div className="bg-gray-100 text-gray-800 p-3 rounded-lg max-w-lg">
                            {/* --- FIX: CONDITIONAL RENDERING FOR RECEIVED MESSAGES --- */}
                           {msg.type === 'text' && <p className="text-sm break-words whitespace-pre-wrap">{msg.payload}</p>}
                           {msg.type === 'image' && <img src={msg.payload.url} alt="User attachment" className="rounded-lg max-w-[200px] cursor-pointer" onClick={() => setLightboxImage(msg.payload.url)} />}
                           {msg.type === 'file' && <a href={msg.payload.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline"><Paperclip size={16} /><span>File Attachment</span></a>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            {showEmojiPicker && <div className="absolute z-10 bottom-4 right-4"><Picker data={data} onEmojiSelect={addEmoji} /></div>}
          </main>

          {/* This button is now always available, regardless of chat.isClosed */}
          <button onClick={() => setIsTemplateModalOpen(true)} className="absolute bottom-32 right-7 z-20 bg-green-500 hover:bg-green-600 text-white rounded-full p-3 shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2" title="Send a Template Message">
            <FaPlus size={20} />
          </button>

{/* --- REPLACE the entire existing <footer> element in Conversation.js with this --- */}

<footer className="pt-4 px-4 pb-4 border-t bg-white">
  {/* Check if the chat status is 'CLOSED' */}
  {chatDetails.status === 'CLOSED' ? (
 <div className="flex justify-center items-center max-h-[8vh]">
  <div className="p-4 text-center bg-gray-100 rounded-lg flex flex-col sm:flex-row justify-center items-center gap-4">
    <p className="text-sm font-medium text-gray-800">
      This conversation is closed.
    </p>
    <button
      onClick={handleReopenChat}
      className="px-6 py-2 font-semibold text-white bg-yellow-600 rounded-md hover:bg-yellow-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Reopen Ticket
    </button>
  </div>
</div>

  ) : (
    // If not closed, show the regular message input
    <div>
      <div className="p-1 bg-white border border-gray-200 rounded-xl">
        <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
            rows={1}
            className="w-full flex-1 px-2 md:py-5 text-sm bg-transparent resize-none max-h-40 focus:outline-none"
            placeholder="Please type here..."
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100" onClick={() => setShowEmojiPicker(p => !p)}>
              <Smile className="w-5 h-5" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*, .pdf, .doc, .docx, .txt" />
            <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100" onClick={() => fileInputRef.current.click()} disabled={isUploading}>
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900" onClick={() => setIsTemplatesModalOpen(true)}>
            <FaListAlt className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Templates</span>
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <FaStickyNote className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">Add Note</span>
          </button>
        </div>
        <button
          onClick={sendMessage}
          className="px-3 md:px-8 md:py-2 py-1 font-semibold text-white bg-blue-600 rounded-sm hover:bg-blue-700 disabled:bg-blue-300"
          disabled={!newMessage.trim() || isUploading}
        >
          Send
        </button>
      </div>
    </div>
  )}
</footer>
        </>
      )}
    </div>
  );
}

Conversation.propTypes = {
  selectedChat: PropTypes.object,
  setSelectedChat: PropTypes.func.isRequired,
  onCloseMobile: PropTypes.func,
};