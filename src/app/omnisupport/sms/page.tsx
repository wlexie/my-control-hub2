// src/app/page.tsx
'use client'
import React from "react";
import SideNav from "./components/SideNav"; 
import { useState } from 'react';
import TopNav from "./components/TopNav";
import Details from "./components/Details";


const Page = () => {

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
      <div className="w-full">
        <TopNav/>
        <Details/>

      </div>
      
    
    </div>
  );
}

export default Page;
