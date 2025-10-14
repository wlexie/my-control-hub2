'use client';

import { useState } from 'react';
import { FiMenu } from "react-icons/fi";
import SideNav from './whatsapp/components/SideNav';
import Messages from './whatsapp/components/Messages';
import Conversation from './whatsapp/components/Conversation';

export default function Page() {
  const [selectedChat, setSelectedChat] = useState(null);
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
        
     

      

      </div>
    </div>
  );
}