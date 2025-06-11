import { useState, useEffect, useRef, useMemo } from 'react'; // Added useMemo for performance
import axios from 'axios';
import { MoreVertical, Paperclip, Smile, Pin, Send, Loader2, CheckCheck } from 'lucide-react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import Modal from '../components/Modal1';
import EscalateIssueModal from './EscalateIssueModal';

// --- NEW: A beautiful, high-contrast color palette ---
// We use Tailwind classes directly. Add more if you like!
const avatarColorPalette = [
  'bg-red-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-pink-500',
  'bg-orange-500',
];

// --- NEW: Helper function to get a consistent color for a unique ID ---
const getColorForId = (id) => {
  if (!id) return 'bg-gray-400'; // Default color if no ID is provided

  // Simple hash function to convert a string to a number
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use the hash to pick a color from the palette
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
  const messagesEndRef = useRef(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [errorMessages, setErrorMessages] = useState(null);

  const userName = selectedChat?.messages?.[0]?.from?.name || 'Unknown Contact';
  const userInitials = getInitials(userName);

  // --- NEW: Get a consistent color for the current user's chat ID ---
  // useMemo ensures this only recalculates when the chat ID changes.
  const userAvatarColor = useMemo(() => getColorForId(selectedChat?.id), [selectedChat?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchFullConversation = async () => {
      if (!selectedChat || !selectedChat.id) {
        setMessages([]);
        return;
      }
      setLoadingMessages(true);
      setErrorMessages(null);
      setMessages([]);
      try {
        const response = await axios.get(
          `https://api.tuma-app.com/api/webhook/messages/${selectedChat.id}?page=0&size=50`
        );
        const fetchedMessages = response.data.content || response.data || [];
        const sortedMessages = [...fetchedMessages].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setMessages(sortedMessages);
      } catch (error) {
        console.error("❌ Error fetching full conversation:", error);
        setErrorMessages("Failed to load conversation history.");
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchFullConversation();
  }, [selectedChat]);

  // ... (rest of useEffects and functions are unchanged)
  useEffect(() => {
    if (isModalOpen || isEscalateModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [isModalOpen, isEscalateModalOpen]);

  const sendMessage = async () => {
    if (newMessage.trim() === '' || !selectedChat) return;

    const recipientPhoneNumber = selectedChat.messages?.[0]?.from?.phoneNumber;
    if (!recipientPhoneNumber) {
      console.error('Recipient phone number could not be determined from selectedChat prop.');
      return;
    }

    const userMsg = {
      id: `temp-${Date.now()}`,
      content: newMessage,
      createdAt: new Date().toISOString(),
      direction: 'sent',
    };

    setMessages(prevMessages => [...prevMessages, userMsg]);
    setNewMessage('');
    setShowEmojiPicker(false);

    try {
      await axios.post('/api/sendMessage', {
        recipientPhone: recipientPhoneNumber,
        message: newMessage,
      });
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error);
    }
  };

  const addEmoji = (emoji) => {
    setNewMessage(newMessage + emoji.native);
  };

  const handleCloseChat = () => {
    if (setSelectedChat) {
      setSelectedChat(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 p-4">
      {selectedChat ? (
        <>
          <div className="pb-2 mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* --- MODIFICATION: Applying dynamic color to Top Header Avatar --- */}
              <div
                className={`flex items-center justify-center w-10 h-10 ${userAvatarColor} rounded-full font-semibold text-white`}
              >
                {userInitials}
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-800">{userName}</h2>
                <p className="text-xs text-gray-500">
                  {selectedChat.messages?.[0]?.from?.phoneNumber || ''}
                </p>
              </div>
            </div>
            {/* ... */}
            <div className="relative">
              <button onClick={() => setIsModalOpen(true)} className="p-1 hover:bg-gray-100 rounded-full">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* ... (Modals are unchanged) ... */}
          {isModalOpen && (
            <Modal
              closeModal={() => setIsModalOpen(false)}
              closeChat={handleCloseChat}
              openEscalateModal={() => {
                setIsModalOpen(false);
                setIsEscalateModalOpen(true);
              }}
            />
          )}

          {isEscalateModalOpen && (
            <EscalateIssueModal
              closeModal={() => setIsEscalateModalOpen(false)}
              goBackToModal1={() => {
                setIsEscalateModalOpen(false);
                setIsModalOpen(true); 
              }}
            />
          )}

          <div className="relative flex h-4/5 flex-col flex-1">
            <div className="overflow-y-auto bg-white border border-gray-200 rounded-2xl p-4 space-y-4 flex-1">
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : errorMessages ? (
                <div className="text-red-500 text-center">{errorMessages}</div>
              ) : (
                messages.map((msg) => {
                  if (!msg || !msg.content || msg.content.trim() === '') {
                    return null;
                  }
                  const isSent = msg.direction === 'sent';
                  return (
                    <div key={msg.id} className={`flex w-full ${isSent ? 'justify-end' : 'justify-start'}`}>
                      <div className="flex items-end max-w-xl space-x-2">
                        {/* --- MODIFICATION: Applying dynamic color to Received Message Avatar --- */}
                        {!isSent && (
                          <div
                            className={`flex items-center justify-center w-6 h-6 ${userAvatarColor} rounded-full text-xs font-semibold text-white`}
                          >
                            {userInitials}
                          </div>
                        )}

                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isSent
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-gray-100 text-gray-800 rounded-bl-none'
                          }`}
                        >
                          <p className="break-words">{msg.content}</p>
                          <div className="flex items-center justify-end mt-1 space-x-1">
                            <span className={`text-xs ${isSent ? 'text-blue-200' : 'text-gray-500'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isSent && <CheckCheck className="w-4 h-4 text-blue-200" />}
                          </div>
                        </div>

                        {/* Agent avatar remains the same for brand consistency */}
                        {isSent && (
                          <div className="flex items-center justify-center w-6 h-6 bg-blue-200 rounded-full text-xs font-semibold text-blue-800">
                            TM
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* ... (Emoji picker is unchanged) ... */}
            {showEmojiPicker && (
              <div className="absolute bottom-20 right-4 z-10">
                <Picker data={data} onEmojiSelect={addEmoji} />
              </div>
            )}
          </div>

          {/* ... (Message input is unchanged) ... */}
          <div className="pt-4">
            <div className="bg-white border border-gray-200 rounded-xl p-2 flex items-center">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                rows={1}
                className="flex-1 bg-transparent px-2 text-sm focus:outline-none resize-none"
                placeholder="Type your message here"
              />
              <div className="flex items-center space-x-1">
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                  <Pin className="w-5 h-5" />
                </button>
              </div>
              <button onClick={sendMessage} className="bg-blue-600 text-white p-2 rounded-lg ml-2 hover:bg-blue-700 disabled:bg-blue-300" disabled={!newMessage.trim()}>
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-gray-500 flex justify-center items-center h-full">
          Select a chat to start a conversation
        </div>
      )}
    </div>
  );
}