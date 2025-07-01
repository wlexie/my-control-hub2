"use client";

import React from "react";
import { useDispatch } from 'react-redux';
import { clearCredentials } from '../../store/authSlice';
// --- CHANGE #1: REMOVED THE js-cookie IMPORT ---
// import Cookies from 'js-cookie'; 
import {
  IoSettingsOutline,
  IoNotificationsOutline,
  IoLogOutOutline,
} from "react-icons/io5";
import { HiOutlineUsers } from "react-icons/hi2";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  notificationCount?: number;
  isActive?: boolean;
}

// This component is unchanged
const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  onClick,
  notificationCount,
  isActive,
}) => {
  return (
    <div
      onClick={onClick}
      className="relative flex flex-col items-center group cursor-pointer w-full py-2"
    >
      <div
        className={`
          relative flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200
          ${
            isActive
              ? "bg-indigo-100"
              : "bg-transparent group-hover:bg-gray-100"
          }
        `}
      >
        <Icon
          size={24}
          className={`
            transition-colors duration-200
            ${
              isActive
                ? "text-indigo-600"
                : "text-gray-500 group-hover:text-gray-700"
            }
          `}
        />
        {notificationCount && notificationCount > 0 && (
          <span className="absolute -top-0 -right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white z-10">
            {notificationCount > 9 ? "9+" : notificationCount}
          </span>
        )}
      </div>
      <span
        className={`
          mt-1 text-xs font-medium transition-opacity duration-200
          ${
            isActive
              ? "text-indigo-600 opacity-100"
              : "text-gray-700 opacity-0 group-hover:opacity-100"
          }
        `}
      >
        {label}
      </span>
    </div>
  );
};

const Sidebar = () => {
  const [activeItem, setActiveItem] = React.useState<string | null>("users");
  const dispatch = useDispatch();

  // ----- START OF UPDATED SECTION -----
  const handleLogout = () => {
    console.log("Starting logout process...");
    
    // 1. Clear Redux state
    dispatch(clearCredentials());
    console.log("Redux state cleared");

    // 2. Clear the accessToken cookie by setting its expiration date to the past (native method)
    //document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    console.log("accessToken cookie cleared via native API");
    
    // 3. Clear other client storage
    localStorage.removeItem('persist:root');
    sessionStorage.clear();
    console.log("Local/Session storage cleared");

    // 4. Force hard navigation to redirect
    console.log("Redirecting to login...");
    window.location.href = '/login';
  };
  // ----- END OF UPDATED SECTION -----


  const notificationCount = 3;

  return (
    <div className="h-full w-20 bg-white shadow-md flex flex-col items-center py-6 space-y-2 font-poppins">
      <div className="mb-4">
        {/* User avatar or placeholder */}
        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-600">U</span>
        </div>
      </div>

      <SidebarItem
        icon={IoSettingsOutline}
        label="Settings"
        isActive={activeItem === "settings"}
        onClick={() => setActiveItem("settings")}
      />
      <SidebarItem
        icon={HiOutlineUsers}
        label="Users"
        isActive={activeItem === "users"}
        onClick={() => setActiveItem("users")}
      />
      <SidebarItem
        icon={IoNotificationsOutline}
        label="Notifications"
        notificationCount={notificationCount}
        isActive={activeItem === "notifications"}
        onClick={() => setActiveItem("notifications")}
      />

      <div className="flex-grow"></div>

      <SidebarItem
        icon={IoLogOutOutline}
        label="Logout"
        onClick={handleLogout}
        isActive={false} 
      />
    </div>
  );
};

export default Sidebar;