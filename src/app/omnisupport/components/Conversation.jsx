// src/components/Conversation.jsx

import React, { useState, useEffect, useRef, useMemo, useCallback, Fragment } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { NotebookPen, MessageSquare, MoreVertical, Paperclip, Smile, Pin, Send, Loader2, CheckCheck, X, UploadCloud } from 'lucide-react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import Modal from './Modal1';
import EscalateIssueModal from './EscalateIssueModal';
import TemplatesModal from './TemplatesModal';

// --- CONSTANTS ---
const API_BASE_URL = "https://api.tuma-app.com/api/webhook";
const POLLING_INTERVAL = 5000;

// --- HELPER FUNCTIONS --- (No changes needed here)
const avatarColorPalette = [ 'bg-red-500', 'bg-green-500', 'bg-purple-500', 'bg-blue-500', 'bg-indigo-500', 'bg-pink-500', 'bg-orange-500' ];
const getColorForId = (id) => { if (!id) return 'bg-gray-400'; let hash = 0; for (let i = 0; i < id.length; i++) { hash = id.charCodeAt(i) + ((hash << 5) - hash); } const index = Math.abs(hash % avatarColorPalette.length); return avatarColorPalette[index]; };
const getInitials = (name = '') => { if (!name || typeof name !== 'string') return '??'; const parts = name.split(' ').filter(Boolean); if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase(); if (parts.length === 1 && parts[0].length > 1) return parts[0].substring(0, 2).toUpperCase(); if (parts.length === 1) return parts[0][0].toUpperCase(); return '??'; };
const formatDateSeparator = (dateStr) => { const date = new Date(dateStr); const today = new Date(); const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); if (date.toDateString() === today.toDateString()) return 'Today'; if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'; return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); };
const formatMessageTimestamp = (timestampStr) => { if (!timestampStr) return ""; const messageDate = new Date(timestampStr); const today = new Date(); const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); if (messageDate.toDateString() === today.toDateString()) { return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }); } if (messageDate.toDateString() === yesterday.toDateString()) { return "Yesterday"; } return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' }); };


// --- COMPONENT ---
export default function Conversation({ selectedChat, setSelectedChat }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [errorMessages, setErrorMessages] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [messageNotes, setMessageNotes] = useState({});
  const [activeNoteEditorId, setActiveNoteEditorId] = useState(null);
  const [currentNoteText, setCurrentNoteText] = useState("");

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const noteTextareaRef = useRef(null);
  const dragCounter = useRef(0);

  const userName = selectedChat?.messages?.[0]?.from?.name || 'Unknown Contact';
  const userInitials = getInitials(userName);
  const userAvatarColor = useMemo(() => getColorForId(selectedChat?.id), [selectedChat?.id]);
  
  // *** THIS IS THE KEY CHANGE ***
  const fetchFullConversation = useCallback(async (isBackgroundPoll = false) => {
    if (!selectedChat || !selectedChat.id) {
      setMessages([]);
      return;
    }
    if (!isBackgroundPoll) setLoadingMessages(true);
    setErrorMessages(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/messages/${selectedChat.id}?page=0&size=50`);
      const fetchedMessages = response.data.content || response.data || [];
      
      const processedMessages = fetchedMessages.map(msg => {
        try {
          const parsedContent = JSON.parse(msg.content);
          let type = 'unsupported', payload = null;
          if (parsedContent.text && parsedContent.text.trim() !== '') { type = 'text'; payload = parsedContent.text; }
          else if (parsedContent.image && parsedContent.image.url) { type = 'image'; payload = { url: parsedContent.image.url }; }
          else if (parsedContent.file && parsedContent.file.url) { type = 'file'; payload = { url: parsedContent.file.url }; }
          return { ...msg, type, payload };
        } catch (error) { return null; }
      }).filter(Boolean);

      // --- NEW LOGIC: MERGE or REPLACE ---
      if (isBackgroundPoll) {
        // This is a background poll. We merge new messages instead of replacing the whole list.
        setMessages(currentMessages => {
          const existingIds = new Set(currentMessages.map(m => m.id));
          const newUniqueMessages = processedMessages.filter(m => !existingIds.has(m.id));

          if (newUniqueMessages.length > 0) {
            // Append new messages and re-sort to be safe
            const combined = [...currentMessages, ...newUniqueMessages];
            return combined.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          }
          // If no new messages, return the existing state to prevent re-renders
          return currentMessages;
        });
      } else {
        // This is an initial load. Replace the state entirely.
        const sortedMessages = [...processedMessages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setMessages(sortedMessages);
      }

    } catch (error) {
      console.error("Error fetching conversation:", error);
      if (!isBackgroundPoll) setErrorMessages("Failed to load conversation history.");
    } finally {
      if (!isBackgroundPoll) setLoadingMessages(false);
    }
  }, [selectedChat?.id]);
  
  // --- The rest of the component remains the same ---
  
  useEffect(() => { const textarea = textareaRef.current; if (textarea) { textarea.style.height = 'auto'; textarea.style.height = `${textarea.scrollHeight}px`; } }, [newMessage]);
  useEffect(() => { const textarea = noteTextareaRef.current; if (textarea) { textarea.style.height = 'auto'; textarea.style.height = `${textarea.scrollHeight}px`; } }, [currentNoteText]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }); }, [messages]);
  
  useEffect(() => {
    if (selectedChat?.id) {
      fetchFullConversation(false); // Initial load
    } else {
      setMessages([]);
    }
    setNewMessage('');
    setShowEmojiPicker(false);
    setActiveNoteEditorId(null);
  }, [selectedChat?.id, fetchFullConversation]);
  
  useEffect(() => {
    if (!selectedChat?.id || selectedChat.isClosed) return;
    const intervalId = setInterval(() => fetchFullConversation(true), POLLING_INTERVAL); // Background poll
    return () => clearInterval(intervalId);
  }, [selectedChat?.id, selectedChat?.isClosed, fetchFullConversation]);

  useEffect(() => { document.body.classList.toggle('overflow-hidden', isModalOpen || isEscalateModalOpen || isTemplatesModalOpen); }, [isModalOpen, isEscalateModalOpen, isTemplatesModalOpen]);

  const handleNoteIconClick = (messageId) => { setActiveNoteEditorId(messageId); setCurrentNoteText(messageNotes[messageId] || ""); };
  const handleSaveNote = () => { if (!activeNoteEditorId) return; setMessageNotes(prevNotes => ({ ...prevNotes, [activeNoteEditorId]: currentNoteText, })); setActiveNoteEditorId(null); setCurrentNoteText(""); };
  const handleCancelNote = () => { setActiveNoteEditorId(null); setCurrentNoteText(""); };
  const sendMessage = async () => { if (newMessage.trim() === '' || !selectedChat) return; const recipientPhoneNumber = selectedChat.messages?.[0]?.from?.phoneNumber; if (!recipientPhoneNumber) { console.error('Recipient phone number could not be determined.'); return; } const userMsg = { id: `temp-${Date.now()}`, payload: newMessage, createdAt: new Date().toISOString(), direction: 'sent', type: 'text', }; setMessages(prevMessages => [...prevMessages, userMsg]); setNewMessage(''); setShowEmojiPicker(false); try { await axios.post('/api/sendMessage', { recipientPhone: recipientPhoneNumber, message: newMessage }); setTimeout(() => fetchFullConversation(true), 1500); } catch (error) { console.error('Error sending message:', error.response?.data || error); } };
  const addEmoji = (emoji) => { setNewMessage(newMessage + emoji.native); };
  const handleCloseChat = async () => { if (!selectedChat || !selectedChat.id) return; try { await axios.post(`${API_BASE_URL}/close-conversation?conversationId=${selectedChat.id}`); setSelectedChat(null); } catch (error) { console.error("Error closing conversation:", error.response?.data || error.message); alert("Failed to close the conversation. Please try again."); } finally { setIsModalOpen(false); } };
  const handleFileUpload = async (file) => { if (!file || !selectedChat) return; const recipientPhoneNumber = selectedChat.messages?.[0]?.from?.phoneNumber; if (!recipientPhoneNumber) { alert("Could not determine the recipient's phone number."); return; } const formData = new FormData(); formData.append('file', file); formData.append('recipientPhone', recipientPhoneNumber); setIsUploading(true); try { const response = await axios.post('/api/sendMessage', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); if (response.data.success) { setTimeout(() => fetchFullConversation(true), 1500); } else { throw new Error(response.data.error || "File upload failed on the server."); } } catch (error) { console.error("Error uploading file:", error); alert("File upload failed. Please try again."); } finally { setIsUploading(false); if(fileInputRef.current) fileInputRef.current.value = ""; } };
  const handleFileChange = (event) => { const file = event.target.files[0]; handleFileUpload(file); };
  const handleSelectTemplate = (templateText) => { setNewMessage(templateText); setIsTemplatesModalOpen(false); };
  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); dragCounter.current++; if (e.dataTransfer.items && e.dataTransfer.items.length > 0) { setIsDraggingOver(true); } };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); dragCounter.current--; if (dragCounter.current === 0) { setIsDraggingOver(false); } };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(false); dragCounter.current = 0; const files = e.dataTransfer.files; if (files && files.length > 0) { handleFileUpload(files[0]); e.dataTransfer.clearData(); } };

  // --- JSX Rendering --- (No changes needed here)
  return (
    <div className="flex flex-col h-screen bg-gray-50 p-4 relative" onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}>
       {/* All Modals and UI elements remain the same */}
      {isDraggingOver && ( <div className="absolute inset-0 z-50 bg-blue-500/30 border-4 border-dashed border-blue-600 rounded-2xl flex flex-col items-center justify-center pointer-events-none"><UploadCloud className="w-24 h-24 text-blue-600" /><p className="mt-4 text-2xl font-bold text-blue-800">Drop file to upload</p></div> )}
      {lightboxImage && ( <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer" onClick={() => setLightboxImage(null)}> <button onClick={() => setLightboxImage(null)} className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/75 rounded-full p-2" > <X size={24} /> </button> <img src={lightboxImage} alt="Lightbox view" className="max-w-full max-h-full rounded-lg shadow-2xl cursor-default" onClick={(e) => e.stopPropagation()} /> </div> )}
      {isTemplatesModalOpen && ( <TemplatesModal closeModal={() => setIsTemplatesModalOpen(false)} onSelectTemplate={handleSelectTemplate} userName={userName} /> )}

      {selectedChat ? (
        <>
          <div className="pb-2 mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`flex items-center justify-center w-10 h-10 ${userAvatarColor} rounded-full font-semibold text-white`}>{userInitials}</div>
              <div>
                <h2 className="text-sm font-semibold text-gray-800">{userName}</h2>
                <p className="text-xs text-gray-500">{selectedChat.messages?.[0]?.from?.phoneNumber || ''}</p>
              </div>
            </div>
            {!selectedChat.isClosed && (
              <div className="relative">
                <button onClick={() => setIsModalOpen(true)} className="p-1 hover:bg-gray-100 rounded-full"><MoreVertical className="w-5 h-5 text-gray-600" /></button>
              </div>
            )}
          </div>
          {isModalOpen && ( <Modal closeModal={() => setIsModalOpen(false)} closeChat={handleCloseChat} openEscalateModal={() => { setIsModalOpen(false); setIsEscalateModalOpen(true); }} /> )}
          {isEscalateModalOpen && ( <EscalateIssueModal closeModal={() => setIsEscalateModalOpen(false)} goBackToModal1={() => { setIsEscalateModalOpen(false); setIsModalOpen(true); }} /> )}

          <div className="relative flex-1 flex flex-col min-h-0">
            <div className="overflow-y-auto bg-white border border-gray-200 rounded-2xl p-4 flex-1">
              {loadingMessages ? ( <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div> ) 
              : errorMessages ? ( <div className="text-red-500 text-center">{errorMessages}</div> ) 
              : ( messages.map((msg, index) => {
                  if (!msg || !msg.payload) return null;
                  const showDateSeparator = index === 0 || new Date(msg.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString();
                  const isSent = msg.direction === 'sent';
                  
                  return (
                    <Fragment key={msg.id}>
                      {showDateSeparator && ( <div className="flex justify-center my-4"> <span className="bg-gray-200 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">{formatDateSeparator(msg.createdAt)}</span> </div> )}
                      <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'}`}>
                          <div className={`flex w-full mt-2 items-end gap-2 ${isSent ? 'justify-end' : 'justify-start'}`}>
                            {!isSent && <div className={`flex-shrink-0 flex items-center justify-center w-6 h-6 ${userAvatarColor} rounded-full text-xs font-semibold text-white self-end`}>{userInitials}</div>}
                            <div className={`flex items-end max-w-xl ${isSent ? 'flex-row-reverse' : ''}`}>
                                <div className={`px-3 py-2 rounded-2xl ${isSent ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                                    {msg.type === 'text' && <p className="break-words whitespace-pre-wrap">{msg.payload}</p>}
                                    {msg.type === 'image' && <img src={msg.payload.url} alt="User attachment" className="rounded-lg max-w-[200px] cursor-pointer" onClick={() => setLightboxImage(msg.payload.url)} />}
                                    {!isSent && ( <div className="text-right mt-1 text-xs text-gray-500"> {formatMessageTimestamp(msg.createdAt)} </div> )}
                                </div>
                                <div className="flex items-center text-gray-400 mx-2">
                                    <button className="p-1 text-blue-600 hover:text-blue-800 disabled:text-gray-300 disabled:cursor-not-allowed" onClick={() => handleNoteIconClick(msg.id)} disabled={selectedChat.isClosed}><MessageSquare size={16}/></button>
                                    {!isSent && <button className="p-1 hover:text-gray-600"><MoreVertical size={16}/></button>}
                                </div>
                            </div>
                            {isSent && <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-blue-200 rounded-full text-xs font-semibold text-blue-800 self-end">TM</div>}
                          </div>
                          {isSent && ( <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 mr-10"> <span>You</span> <span>{formatMessageTimestamp(msg.createdAt)}</span> <CheckCheck className="w-4 h-4 text-blue-500" /> </div> )}
                          {activeNoteEditorId === msg.id && ( <div className="w-full max-w-xl mt-2 p-2 border border-blue-300 bg-blue-50/50 rounded-lg"> <textarea ref={noteTextareaRef} value={currentNoteText} onChange={(e) => setCurrentNoteText(e.target.value)} rows={2} className="w-full bg-transparent text-sm text-gray-800 focus:outline-none resize-none" placeholder="Add a note..."/> <div className="flex justify-end gap-2 mt-2"> <button onClick={handleCancelNote} className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded-md">Cancel</button> <button onClick={handleSaveNote} className="px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md">Save</button> </div> </div> )}
                          {messageNotes[msg.id] && activeNoteEditorId !== msg.id && ( <div className="w-full max-w-xl mt-2 p-2 bg-yellow-100/60 border-l-4 border-yellow-400 rounded-r-lg"> <div className="flex items-start gap-2"> <NotebookPen className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" /> <p className="text-sm text-gray-700 italic">{messageNotes[msg.id]}</p> </div> </div> )}
                      </div>
                    </Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            {showEmojiPicker && ( <div className="absolute bottom-4 right-4 z-10"> <Picker data={data} onEmojiSelect={addEmoji} /> </div> )}
          </div>
          
          {selectedChat.isClosed ? (
            <div className="pt-4 text-center"> <p className="text-sm text-gray-500 bg-gray-100 p-3 rounded-lg">This conversation is closed.</p> </div>
          ) : (
            <div className="pt-4">
              <div className="bg-white border border-gray-200 rounded-xl p-2 flex items-center">
                <textarea ref={textareaRef} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())} rows={1} className="flex-1 bg-transparent px-2 text-sm focus:outline-none resize-none max-h-40" placeholder="Type your message here" />
                <div className="flex items-center space-x-1">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*, .pdf, .doc, .docx, .txt" />
                  <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full" onClick={() => fileInputRef.current.click()} disabled={isUploading} > {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />} </button>
                  <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full" onClick={() => setShowEmojiPicker(!showEmojiPicker)}><Smile className="w-5 h-5" /></button>
                  <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full" onClick={() => setIsTemplatesModalOpen(true)} > <Pin className="w-5 h-5" /> </button>
                </div>
                <button onClick={sendMessage} className="bg-blue-600 text-white p-2 rounded-lg ml-2 hover:bg-blue-700 disabled:bg-blue-300" disabled={!newMessage.trim()}><Send className="w-5 h-5" /></button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-gray-500 flex justify-center items-center h-full"> Select a chat to start a conversation </div>
      )}
    </div>
  );
}

Conversation.propTypes = {
  selectedChat: PropTypes.object,
  setSelectedChat: PropTypes.func.isRequired
};