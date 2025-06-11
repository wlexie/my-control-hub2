'use client';
import { useState } from 'react';
import SideNav from './components/SideNav';
import Messages from './components/Messages';
import Conversation from './components/Conversation';

export default function Page() {
  const [selectedChat, setSelectedChat] = useState(null);

  <Conversation
    selectedChat={selectedChat}
    setSelectedChat={setSelectedChat}
  />;

  return (
    <div className="flex w-full">
      <div className="w-[310px]">
        <SideNav />
      </div>
      <div className="w-[30%] border-r border-r-[#E9EBEE] h-screen flex flex-col">
        <Messages onSelectChat={setSelectedChat} />
      </div>
      <div className="w-[50%] px-4 max-h-screen flex flex-col">
        <Conversation
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
        />
      </div>
    </div>
  );
}
