// CHANGED: Added useCallback to the import list
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'; 
import axios from 'axios';
import PropTypes from 'prop-types';
import { MoreVertical, Paperclip, Smile, Pin, Send, Loader2, CheckCheck, X, UploadCloud } from 'lucide-react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import Modal from './Modal1';
import EscalateIssueModal from './EscalateIssueModal';
import TemplatesModal from './TemplatesModal';

const API_BASE_URL = "https://api.tuma-app.com/api/webhook";
const POLLING_INTERVAL = 5000; // Poll for new messages every 5 seconds (5000ms)

const avatarColorPalette = [ 'bg-red-500', 'bg-green-500', 'bg-purple-500', 'bg-blue-500', 'bg-indigo-500', 'bg-pink-500', 'bg-orange-500' ];

const getColorForId = (id) => {
  if (!id) return 'bg-gray-400';
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % avatarColorPalette.length);
  return avatarColorPalette[index];
};

const getInitials = (name = '') => {
  if (!name || typeof name !== 'string') return '??';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1 && parts[0].length > 1) return parts[0].substring(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return '??';
};

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

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const dragCounter = useRef(0);

  const userName = selectedChat?.messages?.[0]?.from?.name || 'Unknown Contact';
  const userInitials = getInitials(userName);
  const userAvatarColor = useMemo(() => getColorForId(selectedChat?.id), [selectedChat?.id]);
  
  // CHANGED: Wrapped fetchFullConversation in useCallback for stability and to prevent re-renders.
  // Also added a `isBackgroundPoll` parameter to avoid showing the loader on every poll.
  const fetchFullConversation = useCallback(async (isBackgroundPoll = false) => {
    if (!selectedChat || !selectedChat.id) {
      setMessages([]);
      return;
    }
    
    // Only show the main loader on the initial fetch, not on background polls
    if (!isBackgroundPoll) {
      setLoadingMessages(true);
    }
    setErrorMessages(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/messages/${selectedChat.id}?page=0&size=50`);
      const fetchedMessages = response.data.content || response.data || [];
      const processedMessages = fetchedMessages
        .map(msg => {
          try {
            const parsedContent = JSON.parse(msg.content);
            let type = 'unsupported';
            let payload = null;
            if (parsedContent.text && parsedContent.text.trim() !== '') {
              type = 'text';
              payload = parsedContent.text;
            } else if (parsedContent.image && parsedContent.image.url) {
              type = 'image';
              payload = { url: parsedContent.image.url };
            } else if (parsedContent.file && parsedContent.file.url) {
              type = 'file';
              payload = { url: parsedContent.file.url };
            }
            return { ...msg, type, payload };
          } catch (error) {
            return null;
          }
        })
        .filter(msg => msg && (msg.type === 'text' || msg.type === 'image' || msg.type === 'file'));

      const sortedMessages = [...processedMessages].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      setMessages(sortedMessages);
    } catch (error) {
      console.error("Error fetching full conversation:", error);
      if (!isBackgroundPoll) {
         setErrorMessages("Failed to load conversation history.");
      }
    } finally {
      if (!isBackgroundPoll) {
        setLoadingMessages(false);
      }
    }
    // CHANGED: The dependency array now uses selectedChat.id for stability.
  }, [selectedChat?.id]);


  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [newMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // CHANGED: This effect now just calls the stable fetchFullConversation function.
  useEffect(() => {
    // Perform an initial fetch when the selected chat changes.
    if (selectedChat?.id) {
      fetchFullConversation(false); // `false` indicates this is not a background poll.
    } else {
      setMessages([]); // Clear messages if no chat is selected.
    }
  }, [selectedChat?.id, fetchFullConversation]);


  // NEW: This useEffect handles the polling for new messages.
  useEffect(() => {
    // Don't start polling if no chat is selected.
    if (!selectedChat?.id) {
      return;
    }

    // Set up an interval to poll for new messages.
    const intervalId = setInterval(() => {
      fetchFullConversation(true); // `true` indicates this is a background poll.
    }, POLLING_INTERVAL);

    // This is a cleanup function. React runs it when the component unmounts
    // or when the dependencies (`selectedChat.id`) change.
    return () => {
      clearInterval(intervalId);
    };

  }, [selectedChat?.id, fetchFullConversation]); // Re-run this effect if the chat or fetch function changes.


  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', isModalOpen || isEscalateModalOpen || isTemplatesModalOpen);
  }, [isModalOpen, isEscalateModalOpen, isTemplatesModalOpen]);

  // ... (rest of your component code is unchanged)
  
  const sendMessage = async () => {
    if (newMessage.trim() === '' || !selectedChat) return;
    const recipientPhoneNumber = selectedChat.messages?.[0]?.from?.phoneNumber;
    if (!recipientPhoneNumber) {
      console.error('Recipient phone number could not be determined.');
      return;
    }
    const userMsg = {
      id: `temp-${Date.now()}`,
      payload: newMessage,
      createdAt: new Date().toISOString(),
      direction: 'sent',
      type: 'text',
    };
    setMessages(prevMessages => [...prevMessages, userMsg]);
    setNewMessage('');
    setShowEmojiPicker(false);
    try {
      await axios.post('/api/sendMessage', { recipientPhone: recipientPhoneNumber, message: newMessage });
      // NEW: After sending a message, fetch immediately to get the confirmed message from the server.
      setTimeout(() => fetchFullConversation(true), 1500); // Wait a moment for server to process
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error);
    }
  };
  
  const addEmoji = (emoji) => { setNewMessage(newMessage + emoji.native); };

  const handleCloseChat = async () => {
    if (!selectedChat || !selectedChat.id) return;
    try {
      await axios.post(`${API_BASE_URL}/close-conversation?conversationId=${selectedChat.id}`);
      setSelectedChat(null);
    } catch (error) {
      console.error("Error closing conversation:", error.response?.data || error.message);
      alert("Failed to close the conversation. Please try again.");
    } finally {
      setIsModalOpen(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file || !selectedChat) return;
    const recipientPhoneNumber = selectedChat.messages?.[0]?.from?.phoneNumber;
    if (!recipientPhoneNumber) {
      alert("Could not determine the recipient's phone number.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('recipientPhone', recipientPhoneNumber);

    setIsUploading(true);
    try {
      const response = await axios.post('/api/sendMessage', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        setTimeout(() => fetchFullConversation(true), 1500); 
      } else {
         throw new Error(response.data.error || "File upload failed on the server.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    handleFileUpload(file);
  };

  const handleSelectTemplate = (templateText) => {
    setNewMessage(templateText);
    setIsTemplatesModalOpen(false);
  };
  
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDraggingOver(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    dragCounter.current = 0;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div 
      className="flex flex-col h-screen bg-gray-50 p-4 relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 bg-blue-500/30 border-4 border-dashed border-blue-600 rounded-2xl flex flex-col items-center justify-center pointer-events-none">
          <UploadCloud className="w-24 h-24 text-blue-600" />
          <p className="mt-4 text-2xl font-bold text-blue-800">Drop file to upload</p>
        </div>
      )}

      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/75 rounded-full p-2"
          >
            <X size={24} />
          </button>
          <img
            src={lightboxImage}
            alt="Lightbox view"
            className="max-w-full max-h-full rounded-lg shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {isTemplatesModalOpen && (
        <TemplatesModal 
          closeModal={() => setIsTemplatesModalOpen(false)}
          onSelectTemplate={handleSelectTemplate}
          userName={userName}
        />
      )}

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
            <div className="relative">
              <button onClick={() => setIsModalOpen(true)} className="p-1 hover:bg-gray-100 rounded-full"><MoreVertical className="w-5 h-5 text-gray-600" /></button>
            </div>
          </div>
          
          {isModalOpen && ( <Modal closeModal={() => setIsModalOpen(false)} closeChat={handleCloseChat} openEscalateModal={() => { setIsModalOpen(false); setIsEscalateModalOpen(true); }} /> )}
          {isEscalateModalOpen && ( <EscalateIssueModal closeModal={() => setIsEscalateModalOpen(false)} goBackToModal1={() => { setIsEscalateModalOpen(false); setIsModalOpen(true); }} /> )}

          <div className="relative flex-1 flex flex-col min-h-0">
            <div className="overflow-y-auto bg-white border border-gray-200 rounded-2xl p-4 space-y-4 flex-1">
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
              ) : errorMessages ? (
                <div className="text-red-500 text-center">{errorMessages}</div>
              ) : (
                messages.map((msg) => {
                  if (!msg || !msg.payload) return null;
                  const isSent = msg.direction === 'sent';
                  return (
                    <div key={msg.id} className={`flex w-full ${isSent ? 'justify-end' : 'justify-start'}`}>
                      <div className="flex items-end max-w-xl space-x-2">
                        {!isSent && <div className={`flex items-center justify-center w-6 h-6 ${userAvatarColor} rounded-full text-xs font-semibold text-white`}>{userInitials}</div>}
                        <div className={`px-3 py-2 rounded-2xl ${isSent ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                          {msg.type === 'text' && <p className="break-words whitespace-pre-wrap">{msg.payload}</p>}
                          {msg.type === 'image' && <img src={msg.payload.url} alt="User attachment" className="rounded-lg max-w-[200px] cursor-pointer" onClick={() => setLightboxImage(msg.payload.url)} />}
                          {msg.type === 'file' && <a href={msg.payload.url} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline">{msg.payload.url.split('/').pop()}</a>}
                          <div className="flex items-center justify-end mt-1 space-x-1">
                            <span className={`text-xs ${isSent ? 'text-blue-200' : 'text-gray-500'}`}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isSent && <CheckCheck className="w-4 h-4 text-blue-200" />}
                          </div>
                        </div>
                        {isSent && <div className="flex items-center justify-center w-6 h-6 bg-blue-200 rounded-full text-xs font-semibold text-blue-800">TM</div>}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            {showEmojiPicker && ( <div className="absolute bottom-4 right-4 z-10"> <Picker data={data} onEmojiSelect={addEmoji} /> </div> )}
          </div>

          <div className="pt-4">
            <div className="bg-white border border-gray-200 rounded-xl p-2 flex items-center">
              <textarea 
                ref={textareaRef}
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())} 
                rows={1}
                className="flex-1 bg-transparent px-2 text-sm focus:outline-none resize-none max-h-40" 
                placeholder="Type your message here" 
              />
              <div className="flex items-center space-x-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  accept="image/*, .pdf, .doc, .docx, .txt"
                />
                <button
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                  onClick={() => fileInputRef.current.click()}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                </button>
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full" onClick={() => setShowEmojiPicker(!showEmojiPicker)}><Smile className="w-5 h-5" /></button>
                <button 
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                  onClick={() => setIsTemplatesModalOpen(true)}
                >
                  <Pin className="w-5 h-5" />
                </button>
              </div>
              <button onClick={sendMessage} className="bg-blue-600 text-white p-2 rounded-lg ml-2 hover:bg-blue-700 disabled:bg-blue-300" disabled={!newMessage.trim()}><Send className="w-5 h-5" /></button>
            </div>
          </div>
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