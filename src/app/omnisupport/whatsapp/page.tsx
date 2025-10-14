'use client';

import { useState } from 'react';
//import { FiMenu } from "react-icons/fi";
import SideNav from './components/SideNav';
//import Messages from './components/Messages';
//import Conversation from './components/Conversation';

export default function Page() {
  //const [selectedChat, setSelectedChat] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className="flex w-full h-screen overflow-hidden bg-white">
      
      {/* ===== SIDE NAVIGATION (FOR DESKTOP AND MOBILE) ===== */}
      {/* Desktop View: Always visible */}
      <div className="hidden md:block w-[310px] flex-shrink-0">
        <SideNav />
      </div>

      {/* Mobile Sliding Nav Panel */}
      <div className={`md:hidden`}>
        {isNavOpen && (
          <div
            className="fixed inset-0 bg-black/40 bg-opacity-50 z-40"
            onClick={() => setIsNavOpen(false)}
          ></div>
        )}
        <div
          className={`fixed top-0 right-0 h-full w-full  z-50 transition-transform duration-300 ease-in-out bg-blue-600 ${isNavOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Pass the function to close the nav */}
          <SideNav onClose={() => setIsNavOpen(false)} />
        </div>
      </div>
      
      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="flex-1 flex min-w-0">
        
        {/* --- DESKTOP LAYOUT (Multi-column) --- */}
        <div className="hidden md:flex flex-1 overflow-hidden">
          <div className=" w-[35%] border-r border-r-gray-200 h-full flex flex-col">
            <Messages onSelectChat={setSelectedChat} activeChat={selectedChat} />
          </div>
          <div className="w-[65%] h-full flex-col">
            <Conversation
              selectedChat={selectedChat}
              setSelectedChat={setSelectedChat}
            />
          </div>
        </div>

        {/* --- MOBILE LAYOUT (Single "Screen" at a time) --- */}
        <div className="md:hidden w-full h-full">
          {selectedChat ? (
            // If a chat is selected, show the Conversation screen
            <div className="w-full h-full animate-slide-in-right">
              <Conversation
                selectedChat={selectedChat}
                setSelectedChat={setSelectedChat}
                onCloseMobile={() => setSelectedChat(null)}
              />
            </div>
          ) : (
            // Otherwise, show the Messages list screen
            <div className="w-full h-full flex flex-col">
              <header className="flex items-center justify-between p-4 border-b border-b-gray-200">
                <h1 className="text-xl font-bold">Omnisupport</h1>
                <button onClick={() => setIsNavOpen(true)} className="p-2" aria-label="Open navigation menu">
                  <FiMenu size={24} />
                </button>
              </header>
              <Messages onSelectChat={setSelectedChat} activeChat={selectedChat} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}