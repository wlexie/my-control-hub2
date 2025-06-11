// components/dashboard/Sidebar.tsx
"use client";

import React from "react";
import { useDispatch } from 'react-redux';
import { clearCredentials } from '../../store/authSlice'; 

import {
  IoSettingsOutline,
  IoNotificationsOutline,
  IoLogOutOutline,
} from "react-icons/io5";
import { HiOutlineUsers } from "react-icons/hi2";

// --- START: CORRECTED SidebarItem Component ---
interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  notificationCount?: number;
  isActive?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  onClick,
  notificationCount,
  isActive,
}) => {
  return (
    // The main container is now a vertical flex column and the "group"
    <div
      onClick={onClick}
      className="relative flex flex-col items-center group cursor-pointer w-full py-2"
    >
      {/* This DIV is the circular background for the icon */}
      <div
        className={`
          relative flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200
          ${
            isActive
              ? "bg-indigo-100" // Active state background
              : "bg-transparent group-hover:bg-gray-100" // Hover state background
          }
        `}
      >
        <Icon
          size={24}
          className={`
            transition-colors duration-200
            ${
              isActive
                ? "text-indigo-600" // Active state icon color
                : "text-gray-500 group-hover:text-gray-700" // Hover state icon color
            }
          `}
        />
        {notificationCount && notificationCount > 0 && (
          <span className="absolute -top-0 -right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white z-10">
            {notificationCount > 9 ? "9+" : notificationCount}
          </span>
        )}
      </div>

      {/* This SPAN is the label. It appears below the icon on hover or when active. */}
      <span
        className={`
          mt-1 text-xs font-medium transition-opacity duration-200
          ${
            isActive
              ? "text-indigo-600 opacity-100" // Active state label is always visible
              : "text-gray-700 opacity-0 group-hover:opacity-100" // Hover state label fades in
          }
        `}
      >
        {label}
      </span>
    </div>
  );
};
// --- END: CORRECTED SidebarItem Component ---

const Sidebar = () => {
  const [activeItem, setActiveItem] = React.useState<string | null>("users");
  const dispatch = useDispatch(); 

  const handleLogout = () => {
    dispatch(clearCredentials());
    localStorage.removeItem('persist:root');
    sessionStorage.clear();
    window.location.href = '/';
  };

  const notificationCount = 3;

  return (
    <div className="h-full w-20 bg-white shadow-md flex flex-col items-center py-6 space-y-2 font-poppins">
      <div className="mb-4">{/** <User /> */}</div>

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