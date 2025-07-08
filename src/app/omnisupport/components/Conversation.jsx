"use client"; // This directive is ESSENTIAL for App Router client components

import React, { useState, useEffect, useRef, useMemo, useCallback, Fragment } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

// --- Icon Imports --- (Added BotMessageSquare)
import { 
  NotebookPen, MessageSquare, MoreVertical, Paperclip, Smile, Pin, Send, 
  Loader2, CheckCheck, X, UploadCloud, ArrowLeft
} from 'lucide-react';
import { FaPlus } from "react-icons/fa6";


// --- Component Imports --- (Added the new TemplateModal)
import Modal from './Modal1';
import EscalateIssueModal from './EscalateIssueModal';
import TemplatesModal from './TemplatesModal';
import TemplateModal from './TemplateModal'; // New Modal for sending specific templates

// =================================================================================
// ---  CONFIGURATION CONSTANTS  ---
// =================================================================================
const API_BASE_URL = "https://api.tuma-app.com/api/webhook";
const POLLING_INTERVAL = 5000; 

// --- NEW: TEMPLATE IMAGE URLS ---
// ================================================================================
// ACTION REQUIRED: You must replace these placeholder URLs with the real, public
// URLs of your template header images. The image for 'welcome_decline' is null 
// because you said it does not have one.
// ================================================================================
const TEMPLATE_MEDIA_URLS = {
  'welcome_dormant': 'https://tuma-whatsapp.s3.us-east-1.amazonaws.com/1000642484.jpg',
  'welcome_basics':  'https://tuma-whatsapp.s3.us-east-1.amazonaws.com/1000642483.jpg',
  'welcome_active':  'https://tuma-whatsapp.s3.us-east-1.amazonaws.com/1000642480.jpg',
  'potential_user':  'https://tuma-whatsapp.s3.us-east-1.amazonaws.com/1000642477.jpg',
  'welcome_leads':   'https://tuma-whatsapp.s3.us-east-1.amazonaws.com/1000642477.jpg',
  'welcome_decline': null, 
};


// =================================================================================
// ---  HELPER UTILITY FUNCTIONS  ---
// =================================================================================
const avatarColorPalette = [ 'bg-red-500', 'bg-green-500', 'bg-purple-500', 'bg-blue-500', 'bg-indigo-500', 'bg-pink-500', 'bg-orange-500' ];
const getColorForId = (id) => { if (!id) return 'bg-gray-400'; let hash = 0; for (let i = 0; i < id.length; i++) { hash = id.charCodeAt(i) + ((hash << 5) - hash); } const index = Math.abs(hash % avatarColorPalette.length); return avatarColorPalette[index]; };
const getInitials = (name = '') => { if (!name || typeof name !== 'string') return '??'; const parts = name.split(' ').filter(Boolean); if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase(); if (parts.length === 1 && parts[0].length > 1) return parts[0].substring(0, 2).toUpperCase(); if (parts.length === 1) return parts[0][0].toUpperCase(); return '??'; };
const formatDateSeparator = (dateStr) => { const date = new Date(dateStr); const today = new Date(); const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); if (date.toDateString() === today.toDateString()) return 'Today'; if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'; return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); };
const formatMessageTimestamp = (timestampStr) => { if (!timestampStr) return ""; const messageDate = new Date(timestampStr); const today = new Date(); const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); if (messageDate.toDateString() === today.toDateString()) { return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }); } if (messageDate.toDateString() === yesterday.toDateString()) { return "Yesterday"; } return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' }); };

// =================================================================================
// ---  MAIN CONVERSATION COMPONENT  ---
// =================================================================================
export default function Conversation({ selectedChat, setSelectedChat, onCloseMobile }) {
  
  // --- STATE MANAGEMENT ---
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [errorMessages, setErrorMessages] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Message Notes State
  const [messageNotes, setMessageNotes] = useState({});
  const [activeNoteEditorId, setActiveNoteEditorId] = useState(null);
  const [currentNoteText, setCurrentNoteText] = useState("");

  // --- REFS ---
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const noteTextareaRef = useRef(null);
  const dragCounter = useRef(0);
  
  // --- DERIVED STATE & MEMOIZED VALUES ---
  const userName = selectedChat?.contactName || selectedChat?.messages?.[0]?.from?.name || '';
  const userPhoneNumber = selectedChat?.msisdn || selectedChat?.messages?.[0]?.from?.phoneNumber || '';
  const userInitials = getInitials(userName);
  const userAvatarColor = useMemo(() => getColorForId(selectedChat?.id), [selectedChat?.id]);

  // --- DATA FETCHING ---
  const fetchFullConversation = useCallback(async (isBackgroundPoll = false) => {
    const identifier = selectedChat?.id || selectedChat?.msisdn;
    if (!identifier) { 
        setMessages([]); 
        return; 
    }
    
    if (!isBackgroundPoll) { setLoadingMessages(true); }
    setErrorMessages(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/messages/${identifier}?page=0&size=50`);
      const fetchedMessages = response.data.content || response.data || [];
      const processedMessages = fetchedMessages.map(msg => {
        try {
          const parsedContent = JSON.parse(msg.content);
          let type = 'unsupported', payload = null;
          if (parsedContent.text?.trim()) { type = 'text'; payload = parsedContent.text; }
          else if (parsedContent.image?.url) { type = 'image'; payload = { url: parsedContent.image.url }; }
          else if (parsedContent.file?.url) { type = 'file'; payload = { url: parsedContent.file.url }; }
          return { ...msg, type, payload };
        } catch { return null; }
      }).filter(Boolean);
      
      setMessages(currentMessages => {
        const serverMessagesMap = new Map(processedMessages.map(m => [m.id, m]));
        const pendingOptimisticMessages = currentMessages.filter(localMsg => {
          if (!localMsg.id.toString().startsWith('temp-')) {
            return false; 
          }
          let isConfirmed = false;
          for (const serverMsg of processedMessages) {
              if (serverMsg.direction === 'sent' && serverMsg.payload === localMsg.payload) {
                  isConfirmed = true;
                  break;
              }
          }
          return !isConfirmed;
        });
        const newMessages = [...processedMessages, ...pendingOptimisticMessages];
        return Array.from(new Map(newMessages.map(m => [m.id, m])).values())
                    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
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
  }, [selectedChat?.id, selectedChat?.msisdn]);

  // --- SIDE EFFECTS ---
  useEffect(() => { if (textareaRef.current) { textareaRef.current.style.height = 'auto'; textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; } }, [newMessage]);
  useEffect(() => { if (noteTextareaRef.current) { noteTextareaRef.current.style.height = 'auto'; noteTextareaRef.current.style.height = `${noteTextareaRef.current.scrollHeight}px`; } }, [currentNoteText]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => {
    setMessages([]); setNewMessage(''); setShowEmojiPicker(false); setActiveNoteEditorId(null);
    if (selectedChat?.id) { fetchFullConversation(false); }
  }, [selectedChat?.id, fetchFullConversation]);
  useEffect(() => {
    if (!selectedChat?.id || selectedChat.isClosed) return;
    const intervalId = setInterval(() => fetchFullConversation(true), POLLING_INTERVAL);
    return () => clearInterval(intervalId);
  }, [selectedChat?.id, selectedChat?.isClosed, fetchFullConversation]);
  useEffect(() => { document.body.classList.toggle('overflow-hidden', isModalOpen || isEscalateModalOpen || isTemplatesModalOpen || isTemplateModalOpen); }, [isModalOpen, isEscalateModalOpen, isTemplatesModalOpen, isTemplateModalOpen]);

  // --- EVENT HANDLERS ---
  const sendMessage = async () => {
    if (newMessage.trim() === '' || !selectedChat) return;
    const recipientPhoneNumber = selectedChat.msisdn || userPhoneNumber;
    if (!recipientPhoneNumber) { console.error('Recipient phone number (msisdn) could not be determined.'); return; }
    const userMsg = { id: `temp-${Date.now()}`, payload: newMessage, createdAt: new Date().toISOString(), direction: 'sent', type: 'text' };
    setMessages(prevMessages => [...prevMessages, userMsg]);
    setNewMessage('');
    setShowEmojiPicker(false);
    try {
        await axios.post('/api/sendMessage', { recipientPhone: recipientPhoneNumber, message: newMessage });
        setTimeout(() => fetchFullConversation(true), 1500);
    } catch (error) {
        console.error('Error sending message:', error.response?.data || error);
        setMessages(prev => prev.filter(m => m.id !== userMsg.id));
        alert('Failed to send message.');
    }
  };
  
  const handleFileUpload = async (file) => {
    if (!file || !selectedChat) return;
    const recipientPhoneNumber = selectedChat.msisdn || userPhoneNumber;
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
        if (fileInputRef.current) { fileInputRef.current.value = ""; }
    }
  };

  // --- UPDATED HANDLER for sending specific templates ---
  const handleSendTemplate = async (templateName) => {
    if (!userPhoneNumber || !templateName) {
      alert("Error: Cannot determine recipient's phone number or template name.");
      return;
    }

    // Prepare text variables
    const templateParams = [{ "default": userName }]; 

    // Look up the media URL for the selected template from our configuration object
    const mediaUrl = TEMPLATE_MEDIA_URLS[templateName];

    try {
        // Send all necessary data to our flexible API
        await axios.post('/api/sendTemplate', {
            recipient: userPhoneNumber,
            templateName: templateName,
            params: templateParams,
            mediaUrl: mediaUrl, // This will be undefined/null for text-only templates, which is correct
        });
        alert(`Template "${templateName.replace(/_/g, ' ')}" sent successfully!`);
        setIsTemplateModalOpen(false); // Close modal on success
        setTimeout(() => fetchFullConversation(true), 2000); // Poll for new message
    } catch (error) {
        const errorDetail = error.response?.data?.details || error.response?.data?.error || error.message;
        console.error('Error sending template:', error.response?.data || error);
        alert(`Failed to send template. Reason: ${errorDetail}`);
    }
  };

  const addEmoji = (emoji) => { setNewMessage(prev => prev + emoji.native); };
  const handleCloseChat = async () => { if (!selectedChat || !selectedChat.id) return; try { await axios.post(`${API_BASE_URL}/close-conversation?conversationId=${selectedChat.id}`); setSelectedChat(null); } catch (error) { console.error("Error closing conversation:", error.response?.data || error.message); alert("Failed to close the conversation."); } finally { setIsModalOpen(false); } };
  const handleFileChange = (e) => { const file = e.target.files[0]; if (file) { handleFileUpload(file); } };
  const handleSelectTemplate = (text) => { setNewMessage(text); setIsTemplatesModalОpen(false); };
  const handleNoteIconClick = (id) => { setActiveNoteEditorId(id); setCurrentNoteText(messageNotes[id] || ""); };
  const handleSaveNote = () => { if (!activeNoteEditorId) return; setMessageNotes(prev => ({ ...prev, [activeNoteEditorId]: currentNoteText })); setActiveNoteEditorId(null); setCurrentNoteText(""); };
  const handleCancelNote = () => { setActiveNoteEditorId(null); setCurrentNoteText(""); };
  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); dragCounter.current++; if (e.dataTransfer.items?.length > 0) setIsDraggingOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); dragCounter.current--; if (dragCounter.current === 0) setIsDraggingOver(false); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(false); dragCounter.current = 0; if (e.dataTransfer.files?.length > 0) { handleFileUpload(e.dataTransfer.files[0]); e.dataTransfer.clearData(); } };

  // --- JSX RENDER ---
  return (
    <div className="flex flex-col h-screen bg-gray-50 p-4 relative" onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}>
      {/* Overlays & Modals */}
      {isDraggingOver && ( <div className="absolute inset-0 z-50 bg-blue-500/30 border-4 border-dashed border-blue-600 rounded-2xl flex flex-col items-center justify-center pointer-events-none"><UploadCloud className="w-24 h-24 text-blue-600" /><p className="mt-4 text-2xl font-bold text-blue-800">Drop file to upload</p></div> )}
      {lightboxImage && ( <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer" onClick={() => setLightboxImage(null)}> <button onClick={() => setLightboxImage(null)} className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/75 rounded-full p-2" > <X size={24} /> </button> <img src={lightboxImage} alt="Lightbox view" className="max-w-full max-h-full rounded-lg shadow-2xl cursor-default" onClick={(e) => e.stopPropagation()} /> </div> )}
      {isTemplatesModalOpen && ( <TemplatesModal closeModal={() => setIsTemplatesModalOpen(false)} onSelectTemplate={handleSelectTemplate} userName={userName} /> )}
      {isTemplateModalOpen && ( <TemplateModal closeModal={() => setIsTemplateModalOpen(false)} onSelectTemplate={handleSendTemplate} userName={userName}/> )}

      {/* Main Content */}
      {!selectedChat ? ( <div className="text-gray-500 flex justify-center items-center h-full"> Select a chat to start a conversation </div> ) 
      : (
        <>
          <header className="pb-2 mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {onCloseMobile && ( <button onClick={onCloseMobile} className="md:hidden mr-2 p-2 hover:bg-gray-100 rounded-full" aria-label="Back to messages"><ArrowLeft className="w-5 h-5 text-gray-600" /></button> )}
              <div className={`flex items-center justify-center w-10 h-10 ${userAvatarColor} rounded-full font-semibold text-white`}>{userInitials}</div>
              <div><h2 className="text-sm font-semibold text-gray-800">{userName}</h2><p className="text-xs text-gray-500">{userPhoneNumber}</p></div>
            </div>
            {!selectedChat.isClosed && (
              <div className="relative">
                <button onClick={() => setIsModalOpen(true)} className="p-1 hover:bg-gray-100 rounded-full"><MoreVertical className="w-5 h-5 text-gray-600" /></button>
                {isModalOpen && ( <Modal closeModal={() => setIsModalOpen(false)} closeChat={handleCloseChat} openEscalateModal={() => { setIsModalOpen(false); setIsEscalateModalOpen(true); }} /> )}
                {isEscalateModalOpen && ( <EscalateIssueModal closeModal={() => setIsEscalateModalOpen(false)} goBackToModal1={() => { setIsEscalateModalOpen(false); setIsModalOpen(true); }} /> )}
              </div>
            )}
          </header>

          <main className="relative flex-1 flex flex-col min-h-0">
            <div className="overflow-y-auto bg-white border border-gray-200 rounded-2xl p-4 flex-1">
              {loadingMessages ? ( <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div> ) 
              : errorMessages ? ( <div className="text-red-500 text-center">{errorMessages}</div> ) 
              : ( messages.map((msg, index) => {
                  if (!msg || !msg.payload) return null;
                  const showDateSeparator = index === 0 || new Date(msg.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString();
                  const isSent = msg.direction === 'sent';
                  return (
                    <Fragment key={msg.id}>
                      {showDateSeparator && <div className="flex justify-center my-4"><span className="bg-gray-200 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">{formatDateSeparator(msg.createdAt)}</span></div>}
                      <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'}`}>
                        <div className={`flex w-full mt-2 items-end gap-2 ${isSent ? 'justify-end' : 'justify-start'}`}>
                          {!isSent && <div className={`flex-shrink-0 w-6 h-6 ${userAvatarColor} rounded-full text-xs font-semibold text-white flex items-center justify-center self-end`}>{userInitials}</div>}
                          <div className={`flex items-end max-w-[85%] sm:max-w-[75%] md:max-w-xl ${isSent ? 'flex-row-reverse' : ''}`}>
                            <div className={`px-3 py-2 rounded-2xl ${isSent ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                              {msg.type === 'text' && <p className="break-words whitespace-pre-wrap">{msg.payload}</p>}
                              {msg.type === 'image' && <img src={msg.payload.url} alt="User attachment" className="rounded-lg max-w-[200px] cursor-pointer" onClick={() => setLightboxImage(msg.payload.url)} />}
                              {msg.type === 'file' && <a href={msg.payload.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-300 hover:text-white underline"><Paperclip size={16} /><span>File Attachment</span></a>}
                              {!isSent && <div className="mt-1 text-right text-xs text-gray-500">{formatMessageTimestamp(msg.createdAt)}</div>}
                            </div>
                            <div className="flex items-center mx-2 text-gray-400">
                              <button className="p-1 text-blue-600 hover:text-blue-800 disabled:text-gray-300" onClick={() => handleNoteIconClick(msg.id)} disabled={selectedChat.isClosed}><MessageSquare size={16}/></button>
                              {!isSent && <button className="p-1 hover:text-gray-600"><MoreVertical size={16}/></button>}
                            </div>
                          </div>
                          {isSent && <div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full text-xs font-semibold text-blue-800 flex items-center justify-center self-end">TM</div>}
                        </div>
                        {isSent && <div className="flex items-center gap-2 mt-1 mr-10 text-xs text-gray-500"><span>You</span><span>{formatMessageTimestamp(msg.createdAt)}</span><CheckCheck className="w-4 h-4 text-blue-500" /></div>}
                        {activeNoteEditorId === msg.id && ( <div className="w-full max-w-xl mt-2 p-2 border border-blue-300 bg-blue-50/50 rounded-lg"><textarea ref={noteTextareaRef} value={currentNoteText} onChange={(e) => setCurrentNoteText(e.target.value)} rows={2} className="w-full bg-transparent text-sm text-gray-800 resize-none focus:outline-none" placeholder="Add a note..."/><div className="flex justify-end gap-2 mt-2"><button onClick={handleCancelNote} className="px-3 py-1 text-sm text-gray-600 rounded-md hover:bg-gray-200">Cancel</button><button onClick={handleSaveNote} className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">Save</button></div></div>)}
                        {messageNotes[msg.id] && activeNoteEditorId !== msg.id && ( <div className="w-full max-w-xl mt-2 p-2 border-l-4 bg-yellow-100/60 border-yellow-400 rounded-r-lg"><div className="flex items-start gap-2"><NotebookPen className="flex-shrink-0 w-4 h-4 mt-0.5 text-yellow-600" /><p className="text-sm italic text-gray-700">{messageNotes[msg.id]}</p></div></div>)}
                      </div>
                    </Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            {showEmojiPicker && <div className="absolute z-10 bottom-4 right-4"><Picker data={data} onEmojiSelect={addEmoji} /></div>}
          </main>
          
          {/* --- NEW FLOATING ACTION BUTTON --- */}
          {!selectedChat.isClosed && (
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="absolute bottom-24 right-7 z-20 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              title="Send a Template Message"
            >
              <FaPlus size={24} />
            </button>
          )}

          <footer className="pt-4">
            {selectedChat.isClosed ? ( <div className="p-3 text-center bg-gray-100 rounded-lg"><p className="text-sm text-gray-500">This conversation is closed.</p></div> ) 
            : (
              <div className="flex items-center p-2 bg-white border border-gray-200 rounded-xl">
                <textarea ref={textareaRef} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())} rows={1} className="flex-1 px-2 text-sm bg-transparent resize-none max-h-40 focus:outline-none" placeholder="Type your message here" />
                <div className="flex items-center space-x-1">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*, .pdf, .doc, .docx, .txt" />
                  <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100" onClick={() => fileInputRef.current.click()} disabled={isUploading}>{isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}</button>
                  <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100" onClick={() => setShowEmojiPicker(p => !p)}><Smile className="w-5 h-5" /></button>
                  <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100" onClick={() => setIsTemplatesModalOpen(true)}><Pin className="w-5 h-5" /></button>
                </div>
                <button onClick={sendMessage} className="p-2 ml-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300" disabled={!newMessage.trim() && !isUploading}><Send className="w-5 h-5" /></button>
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