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
import AssignTicketModal from './AssignTicketModal'; 
import ProfileSidePanel from './ProfileSidePanel';
import AssignmentHistoryPanel from './AssignmentHistoryPanel'; 





// =================================================================================
// ---  CONFIGURATION CONSTANTS  ---
// =================================================================================
const API_BASE_URL = "https://com.tuma-app.com"; 
//const API_BASE_URL = "http://localhost:8081"; // Production URL

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
  'country_updates': "Hello {{1}}, we have an update regarding our services in your country. Please check our website for more details.",
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

const getFileType = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'document';
};

const avatarColorPalette = ['bg-red-500', 'bg-green-500', 'bg-purple-500', 'bg-blue-500', 'bg-indigo-500', 'bg-pink-500', 'bg-orange-500'];
const getColorForId = (id) => { if (!id) return 'bg-gray-400'; let hash = 0; for (let i = 0; i < id.length; i++) { hash = id.charCodeAt(i) + ((hash << 5) - hash); } const index = Math.abs(hash % avatarColorPalette.length); return avatarColorPalette[index]; };
const getInitials = (name = '') => { if (!name || typeof name !== 'string' || name.toLowerCase() === 'unknown') return 'UN'; const parts = name.split(' ').filter(Boolean); if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase(); if (parts.length === 1 && parts[0].length > 1) return parts[0].substring(0, 2).toUpperCase(); if (parts.length === 1) return parts[0][0].toUpperCase(); return '??'; };

const formatFullTimestamp = (timestampStr) => {
    if (!timestampStr) return "";
    const date = new Date(timestampStr);
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

// --- Helper to parse URL and Caption from the DB content string ---
const parseMediaPayload = (content) => {
  if (!content) return { url: '', caption: '' };
  // split by the specific format the backend uses: "\nCaption: "
  const parts = content.split('\nCaption: ');
  return {
    url: parts[0].trim(),
    caption: parts[1] ? parts[1].trim() : ''
  };
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

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // --- FILE PREVIEW STATES ---
  const [pendingFile, setPendingFile] = useState(null);
  const [fileCaption, setFileCaption] = useState('');
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);


  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const dragCounter = useRef(0);

  const { accessToken } = useSelector((state) => state.auth);


  const userName = chatDetails.name;
  const status = chatDetails.status;
  const userPhoneNumber = chatDetails.phone;
  const ticketId = chatDetails.ticketId;

  const userInitials = getInitials(userName);
  const userAvatarColor = useMemo(() => getColorForId(selectedChat?.id), [selectedChat?.id]);
  const countryCode = useMemo(() => getCountryCode(userPhoneNumber), [userPhoneNumber]);


const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const fetchFullConversation = useCallback(async (isBackgroundPoll = false) => {
    const currentTicketId = selectedChat?.ticketId;
    if (!currentTicketId || !accessToken) {
      setMessages([]);
      return;
    }

    if (!isBackgroundPoll) { setLoadingMessages(true); }
    setErrorMessages(null);

    try {
      // --- STEP 1: FETCH CONVERSATION DETAILS (History, TumaID, Assigned Agent) ---
      const detailRes = await axios.get(
        `${API_BASE_URL}/api/conversations/${currentTicketId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const conversationData = detailRes.data;
      setHistory(conversationData.history || []);
      
      // Update Chat Details (Header Info)
      setChatDetails({
        name: conversationData.contactName || 'Unknown',
        phone: conversationData.contactPhone || '',
        ticketId: conversationData.ticketId,
        status: conversationData.status,
        assignedAgentId: conversationData.assignedAgentId,
        assignedAgentName: conversationData.assignedAgentName,
        tumaId: conversationData.tumaId
      });

      // --- STEP 2: FETCH MESSAGES ---
      const msgRes = await axios.get(
        `${API_BASE_URL}/api/conversations/${currentTicketId}/messages`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const fetchedMessages = Array.isArray(msgRes.data) ? msgRes.data : [];
      const validMessages = fetchedMessages.filter(msg => msg.direction && msg.direction.trim() !== '');

      const processedMessages = validMessages.map(msg => {
        const isMedia = ['image', 'file', 'video', 'document'].includes(msg.messageType);
        return {
          id: msg.id, 
          payload: isMedia ? parseMediaPayload(msg.content) : msg.content || "[No Content]", 
          type: isMedia ? msg.messageType : 'text',
          createdAt: msg.messageTime,
          direction: msg.direction,
          senderName: msg.senderName,
          status: msg.status,
        };
      });

      // --- STEP 3: DEDUPLICATION LOGIC ---
      const statusPriority = { 'read': 3, 'delivered': 2, 'sent': 1, 'pending': 0 };
      const uniqueMessages = processedMessages.reduce((acc, current) => {
        const msgTime = new Date(current.createdAt).getTime();
        const contentStr = typeof current.payload === 'string' ? current.payload : current.payload.url;
        const groupingKey = `${current.direction}-${contentStr}-${Math.floor(msgTime / 3000)}`;

        const existingIdx = acc.findIndex(item => {
          const itemTime = new Date(item.createdAt).getTime();
          const itemContent = typeof item.payload === 'string' ? item.payload : item.payload.url;
          return `${item.direction}-${itemContent}-${Math.floor(itemTime / 3000)}` === groupingKey;
        });

        if (existingIdx > -1) {
          const currentPrio = statusPriority[current.status?.toLowerCase()] || 0;
          const existingPrio = statusPriority[acc[existingIdx].status?.toLowerCase()] || 0;
          if (currentPrio > existingPrio) acc[existingIdx] = current;
        } else {
          acc.push(current);
        }
        return acc;
      }, []);

      uniqueMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setMessages(uniqueMessages);

    } catch (err) {
      console.error("Error fetching full conversation:", err);
      if (!isBackgroundPoll) setErrorMessages("Failed to load conversation history.");
    } finally {
      if (!isBackgroundPoll) setLoadingMessages(false);
    }
  }, [selectedChat?.ticketId, accessToken]);

  useEffect(() => { if (textareaRef.current) { textareaRef.current.style.height = 'auto'; textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; } }, [newMessage]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    setMessages([]);
    setNewMessage('');
    setShowEmojiPicker(false);
    setPendingFile(null); 
    setFilePreviewUrl(null);
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
    if (newMessage.trim() === '' || !selectedChat?.ticketId) return;
    
    const userMsg = { 
        id: `temp-${Date.now()}`, 
        payload: newMessage, 
        createdAt: new Date().toISOString(), 
        direction: 'sent', 
        type: 'text',
        senderName: 'You' 
    };
    
    setMessages(prevMessages => [...prevMessages, userMsg]);
    setNewMessage('');
    setShowEmojiPicker(false);

    try {
      await axios.post(
        `${API_BASE_URL}/api/conversations/${chatDetails.ticketId}/reply`, 
        { content: userMsg.payload }, 
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setTimeout(() => fetchFullConversation(true), 1500);
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error);
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
      alert('Failed to send message.');
    }
  };

   // 3. Add the fetch function
  const fetchUserProfile = async () => {
    const userId = selectedChat?.tumaId; // Or whatever property holds the 1564 ID
    if (!userId || !accessToken) return;

    setIsProfileOpen(true); // Open panel immediately to show loader
    setLoadingProfile(true);
    
    try {
      const response = await axios.get(
        `https://api.tuma-app.com/api/account/client-profile?userId=${userId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setProfileData(response.data);
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoadingProfile(false);
    }
  };


  const handleFileUpload = async () => {
    if (!pendingFile || !selectedChat?.ticketId) return;
    
    setIsUploading(true);

    // Optimistic Update
    const tempMediaMsg = {
      id: `temp-media-${Date.now()}`,
      payload: { url: filePreviewUrl, caption: fileCaption },
      type: getFileType(pendingFile.type),
      createdAt: new Date().toISOString(),
      direction: 'sent',
      senderName: 'You',
      status: 'pending'
    };
    setMessages(prev => [...prev, tempMediaMsg]);

    const formData = new FormData();
    formData.append('file', pendingFile);
    formData.append('type', getFileType(pendingFile.type));
    formData.append('caption', fileCaption);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/conversations/${chatDetails.ticketId}/reply-with-file`, 
        formData, 
        { 
            headers: { 
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'multipart/form-data' 
            } 
        }
      );

      if (response.status === 200) {
           setPendingFile(null);
           setFilePreviewUrl(null);
           setFileCaption('');
           setTimeout(() => fetchFullConversation(true), 1500); 
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessages(prev => prev.filter(m => m.id !== tempMediaMsg.id));
      alert("File upload failed.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

const handleSendTemplate = async (templateName) => {
    if (!userPhoneNumber || !templateName || !accessToken) { 
      alert("Error: Missing recipient phone, template name, or authentication token."); 
      return; 
    }
    
    const templateParams = [{ "default": userName === 'Unknown' ? 'there' : userName }];
    const mediaUrl = TEMPLATE_MEDIA_URLS[templateName];
    const templateBody = TEMPLATE_BODIES[templateName];
    const timestamp = new Date().toISOString();
    
    // Create optimistic UI updates
    const optimisticMessages = [];
    if (mediaUrl) {
      optimisticMessages.push({ 
        id: `temp-img-${Date.now()}`, 
        type: 'image', 
        direction: 'sent', 
        createdAt: timestamp, 
        payload: { url: mediaUrl, caption: '' } 
      });
    }
    if (templateBody) {
      const populatedBody = templateBody.replace('{{1}}', userName === 'Unknown' ? 'there' : userName);
      optimisticMessages.push({ 
        id: `temp-text-${Date.now()}`, 
        type: 'text', 
        direction: 'sent', 
        createdAt: timestamp, 
        payload: populatedBody 
      });
    }
    
    if (optimisticMessages.length > 0) setMessages(prev => [...prev, ...optimisticMessages]);

    const payload = {
      recipient: userPhoneNumber,
      templateName,
      params: templateParams,
      mediaUrl
    };
    // ✅ LOG WHAT IS BEING SENT
console.log('📤 Sending template payload:', payload);
console.log('📞 Recipient:', userPhoneNumber);
console.log('📄 Template:', templateName);
console.log('🧩 Params:', templateParams);
console.log('🖼 Media URL:', mediaUrl);

    try {
      await axios.post(
        `/api/sendTemplate`, 
        payload,
        { 
          headers: { 
            Authorization: `Bearer ${accessToken}` 
          } 
        }
      );

      console.log('✅ Template sent successfully');
      setIsTemplateModalOpen(false);
      // Refresh the conversation to sync with the backend
      setTimeout(() => fetchFullConversation(true), 2000);
      
    } catch (error) {
      const errorDetail = error.response?.data?.details || error.response?.data?.error || error.message;
      console.error('❌ Error sending template:', error.response?.data || error);
      console.log(`Failed to send template. Reason: ${errorDetail}`);
      
      // Rollback optimistic UI on failure
      setMessages(prev => prev.filter(m => !optimisticMessages.some(opt => opt.id === m.id)));
    }
  };



  const addEmoji = (emoji) => setNewMessage(prev => prev + emoji.native);

  const handleCloseChat = useCallback(async () => {
    const currentTicketId = chatDetails.ticketId;
    if (!currentTicketId) { alert("Cannot close ticket: Ticket ID is missing."); return; }
    setIsCloseConfirmOpen(false);
    try {
      await axios.post(`${API_BASE_URL}/api/conversations/${currentTicketId}/close`, {}, { headers: { Authorization: `Bearer ${accessToken}` } });
      setSelectedChat(null);
    } catch (error) { 
      console.error("Error closing conversation:", error.response?.data || error.message);
      alert("Failed to close the ticket.");
    } 
  }, [chatDetails, accessToken, setSelectedChat]);


  const handleReopenChat = async () => {
    const currentTicketId = chatDetails.ticketId;
    if (!currentTicketId) { alert("Cannot reopen ticket: Ticket ID is missing."); return; }
    try {
        await axios.post(`${API_BASE_URL}/api/conversations/${currentTicketId}/reopen`, {}, { headers: { Authorization: `Bearer ${accessToken}` } });
        await fetchFullConversation(false); 
    } catch (error) {
        console.error("Error reopening conversation:", error.response?.data || error.message);
        alert("Failed to reopen the ticket.");
    }
  };


  const handleFileChange = (e) => { 
    const file = e.target.files[0]; 
    if (file) {
        setPendingFile(file);
        setFileCaption('');
        setFilePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSelectTemplate = (text) => { setNewMessage(text); setIsTemplatesModalOpen(false); };
  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); dragCounter.current++; if (e.dataTransfer.items?.length > 0) setIsDraggingOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); dragCounter.current--; if (dragCounter.current === 0) setIsDraggingOver(false); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  
  const handleDrop = (e) => { 
    e.preventDefault(); 
    e.stopPropagation(); 
    setIsDraggingOver(false); 
    dragCounter.current = 0; 
    if (e.dataTransfer.files?.length > 0) { 
        const file = e.dataTransfer.files[0];
        setPendingFile(file);
        setFileCaption('');
        setFilePreviewUrl(URL.createObjectURL(file));
        e.dataTransfer.clearData(); 
    } 
  };

 const handleAssignTicket = async (assignmentDetails) => {
  // Destructure the fields we just prepared in the Modal
  const { agentId, agentName, reason, ticketId: ticketIdToAssign } = assignmentDetails;
  
  if (!ticketIdToAssign || !agentId || !accessToken) { 
    alert("Error: Missing assignment details."); 
    return; 
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/conversations/${ticketIdToAssign}/assign`,
      { 
        agentId,    // This is the accountKey from the modal
        agentName,  // Combined First + Last name
        reason      // The internal note
      },
      { 
        headers: { 
          Authorization: `Bearer ${accessToken}`, 
          'Content-Type': 'application/json' 
        } 
      }
    );

    if (response.status === 200 || response.status === 201) {
      alert("Ticket assigned successfully!");
      setIsAssignModalOpen(false);
      fetchFullConversation(false);
    }
  } catch (error) {
    console.error('Error assigning ticket:', error.response?.data || error);
    alert("Failed to assign ticket: " + (error.response?.data?.message || "Server Error"));
  }
};

  return (
    <div className="flex flex-col h-screen bg-white relative" onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}>
           {/* 4. Render the new component */}
      <ProfileSidePanel 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        data={profileData} 
        loading={loadingProfile} 
      />
       
       <Confirmation
        isOpen={isCloseConfirmOpen}
        onClose={() => setIsCloseConfirmOpen(false)}
        onConfirm={handleCloseChat}
        title="Close Ticket"
        confirmText="Confirm & Close"
      >
        Are you sure you want to close this ticket? This action cannot be undone.
      </Confirmation>
      {isDraggingOver && ( <div className="absolute inset-0 z-50 bg-blue-500/30 border-4 border-dashed border-blue-600 rounded-2xl flex flex-col items-center justify-center pointer-events-none"><UploadCloud className="w-24 h-24 text-blue-600" /><p className="mt-4 text-2xl font-bold text-blue-800">Drop file to prepare upload</p></div> )}
      {lightboxImage && ( <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer" onClick={() => setLightboxImage(null)}> <button onClick={() => setLightboxImage(null)} className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/75 rounded-full p-2" > <X size={24} /> </button> <img src={lightboxImage} alt="Lightbox view" className="max-w-full max-h-full rounded-lg shadow-2xl cursor-default" onClick={(e) => e.stopPropagation()} /> </div> )}
      {isTemplatesModalOpen && ( <TemplatesModal closeModal={() => setIsTemplatesModalOpen(false)} onSelectTemplate={handleSelectTemplate} userName={userName} /> )}
      {isTemplateModalOpen && ( <TemplateModal closeModal={() => setIsTemplateModalOpen(false)} onSelectTemplate={handleSendTemplate} userName={userName}/> )}
      {isAssignModalOpen && ( <AssignTicketModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} onAssign={handleAssignTicket} ticketId={ticketId} /> )}
      
      {!selectedChat ? ( <div className="text-gray-500 flex justify-center items-center h-full"> Select a chat to start a conversation </div> )
      : (
        <>
      <header 
      onClick={fetchUserProfile}
      className="bg-white p-2 border-b border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
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
              <span className='flex'>

                <h2 className="md:text-lg text-sm font-semibold text-gray-800 flex items-center gap-2">
                  {userName}
                  </h2>
                  <h2>
                  {selectedChat?.tumaId && (
                    <span className="text-lg text-purple-800 ml-6 font-medium">TumaId: <span className='font-bold'>{selectedChat.tumaId}</span> </span>
                  )}
                </h2>
               </span>

                <p className="text-[10px] md:text-[12px] text-gray-400 md:mt-0.5">{userPhoneNumber.replace('+', '')}</p>
                <div className="md:flex hidden items-center gap-2 mt-0.5  flex-wrap">
                {ticketId && ( <span className="text-xs md:text-sm font-medium text-gray-600">Ticket #{ticketId}</span> )}
                <button className="px-2 py-0.5 text-xs text-gray-500 hidden md:block border border-dashed border-gray-400 rounded-md hover:bg-gray-100">+ Add Tag</button>
                </div>
            </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
            {/* Dynamic Assign/Reassign Button */}

             {/* View History Link (Only if history exists) */}
            {history.length > 0 && (
              <button 
                onClick={() => setIsHistoryOpen(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 underline transition-colors mr-3"
              >
                View Assignment History
              </button>
            )}
            <button 
              onClick={() => setIsAssignModalOpen(true)} 
              className="px-2 py-1 md:px-4 md:py-1.5 text-xs md:text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors"
            >
              {chatDetails.assignedAgentId ? 'Reassign' : 'Assign'}
            </button>          
    <button onClick={() => setIsEscalateModalOpen(true)} className="px-2 py-1 md:px-4 md:py-1.5 text-xs md:text-sm font-semibold text-orange-600 bg-white border border-orange-400 rounded-sm hover:bg-orange-50 transition-colors">Escalate</button>
            <button onClick={() => setIsCloseConfirmOpen(true)} className="px-2 py-1 md:px-4 md:py-1.5 text-xs md:text-sm font-semibold text-white bg-green-500 border border-green-500 rounded-sm hover:bg-green-600 transition-colors">Close Ticket</button>
            {isEscalateModalOpen && ( <EscalateIssueModal closeModal={() => setIsEscalateModalOpen(false)} goBackToModal1={() => { setIsEscalateModalOpen(false); setIsModalOpen(true); }} /> )}
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
                           <span className="text-sm font-bold text-gray-600">{msg.senderName}</span>
                          <span className="text-xs text-gray-500">{formatFullTimestamp(msg.createdAt)}</span>
                        </div>
                        <div className="bg-blue-600 text-white p-3 rounded-lg max-w-lg">
                           {msg.type === 'text' && <p className="text-sm break-words whitespace-pre-wrap">{msg.payload}</p>}
                           
                           {msg.type === 'image' && (
                             <>
                               <img src={msg.payload.url} alt="Media" className="rounded-lg max-w-[200px] cursor-pointer" onClick={() => setLightboxImage(msg.payload.url)} />
                               {msg.payload.caption && <p className="mt-2 text-sm text-blue-50 italic">{msg.payload.caption}</p>}
                             </>
                           )}
                           {msg.type === 'video' && (
                             <>
                               <video src={msg.payload.url} controls className="rounded-lg max-w-[200px]" />
                               {msg.payload.caption && <p className="mt-2 text-sm text-blue-50 italic">{msg.payload.caption}</p>}
                             </>
                           )}
                           {(msg.type === 'file' || msg.type === 'document') && (
                             <>
                               <a href={msg.payload.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-300 hover:text-white underline">
                                 <Paperclip size={16} /><span>File Attachment</span>
                               </a>
                               {msg.payload.caption && <p className="mt-2 text-sm text-blue-50 italic">{msg.payload.caption}</p>}
                             </>
                           )}
                        </div>
                         <span className="text-sm text-gray-500 flex items-center gap-1"><MessageStatus status={msg.status} /></span>
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
                           {msg.type === 'text' && <p className="text-sm break-words whitespace-pre-wrap">{msg.payload}</p>}
                           
                           {msg.type === 'image' && (
                             <>
                               <img src={msg.payload.url} alt="User media" className="rounded-lg max-w-[200px] cursor-pointer" onClick={() => setLightboxImage(msg.payload.url)} />
                               {msg.payload.caption && <p className="mt-2 text-sm text-gray-600 italic">{msg.payload.caption}</p>}
                             </>
                           )}
                           {msg.type === 'video' && (
                             <>
                               <video src={msg.payload.url} controls className="rounded-lg max-w-[200px]" />
                               {msg.payload.caption && <p className="mt-2 text-sm text-gray-600 italic">{msg.payload.caption}</p>}
                             </>
                           )}
                           {(msg.type === 'file' || msg.type === 'document') && (
                             <>
                               <a href={msg.payload.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                                 <Paperclip size={16} /><span>File Attachment</span>
                               </a>
                               {msg.payload.caption && <p className="mt-2 text-sm text-gray-600 italic">{msg.payload.caption}</p>}
                             </>
                           )}
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

          <button onClick={() => setIsTemplateModalOpen(true)} className="absolute bottom-32 right-7 z-20 bg-green-500 hover:bg-green-600 text-white rounded-full p-3 shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2" title="Send a Template Message">
            <FaPlus size={20} />
          </button>

<footer className="pt-4 px-4 pb-4 border-t bg-white">
  {chatDetails.status === 'CLOSED' ? (
    <div className="flex justify-center items-center max-h-[8vh]">
        <div className="p-4 text-center bg-gray-100 rounded-lg flex flex-col sm:flex-row justify-center items-center gap-4">
            <p className="text-sm font-medium text-gray-800">This conversation is closed.</p>
            <button onClick={handleReopenChat} className="px-6 py-2 font-semibold text-white bg-yellow-600 rounded-md hover:bg-yellow-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Reopen Ticket</button>
        </div>
    </div>
  ) : (
    <div>
      {/* --- FILE PREVIEW SECTION --- */}
      {pendingFile && (
        <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-t-xl animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    {pendingFile.type.startsWith('image/') ? (
                        <img src={filePreviewUrl} className="w-12 h-12 object-cover rounded-md border" alt="Preview" />
                    ) : (
                        <div className="w-12 h-12 bg-blue-100 flex items-center justify-center rounded-md text-blue-600">
                            <Paperclip size={20} />
                        </div>
                    )}
                    <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-gray-700 truncate max-w-[150px]">{pendingFile.name}</p>
                        <p className="text-[10px] text-gray-500">{(pendingFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                </div>
                <button onClick={() => { setPendingFile(null); setFilePreviewUrl(null); }} className="p-1 hover:bg-blue-100 rounded-full text-gray-500">
                    <X size={18} />
                </button>
            </div>
            <div className="flex gap-2">
                <input 
                    type="text"
                    placeholder="Add a caption to your file..."
                    value={fileCaption}
                    onChange={(e) => setFileCaption(e.target.value)}
                    className="flex-1 text-sm border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleFileUpload()}
                />
                <button 
                    onClick={handleFileUpload}
                    disabled={isUploading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                    {isUploading ? <Loader2 className="animate-spin w-4 h-4" /> : <Send size={18} />}
                </button>
            </div>
        </div>
      )}

      <div className="p-1 bg-white border border-gray-200 rounded-xl">
        <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
            rows={1}
            disabled={!!pendingFile} 
            className={`w-full flex-1 px-2 md:py-5 text-sm bg-transparent resize-none max-h-40 focus:outline-none ${pendingFile ? 'opacity-50' : ''}`}
            placeholder={pendingFile ? "Please send or cancel file upload..." : "Please type here..."}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100" onClick={() => setShowEmojiPicker(p => !p)}>
              <Smile className="w-5 h-5" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*, video/*, .pdf, .doc, .docx, .txt" />
            <button 
                className={`p-2 rounded-full hover:bg-gray-100 ${pendingFile ? 'text-blue-600' : 'text-gray-500'}`} 
                onClick={() => fileInputRef.current.click()} 
                disabled={isUploading || !!pendingFile}
            >
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
          disabled={!newMessage.trim() || isUploading || !!pendingFile}
        >
          Send
        </button>
      </div>
    </div>
  )}
</footer>
        </>
      )}
      {/* Include the side panel at the bottom of the main div */}
      <AssignmentHistoryPanel 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history} 
      />
    </div>
  );
}

Conversation.propTypes = {
  selectedChat: PropTypes.object,
  setSelectedChat: PropTypes.func.isRequired,
  onCloseMobile: PropTypes.func,
};