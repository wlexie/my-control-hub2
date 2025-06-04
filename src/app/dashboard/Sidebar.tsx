// Create a new file, e.g., components/dashboard/Sidebar.tsx
"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Or 'next/router' if using Pages Router
import { IoSettingsOutline, IoNotificationsOutline, IoLogOutOutline } from "react-icons/io5";
import { HiOutlineUsers } from "react-icons/hi2";

// A simple type for sidebar items for easier mapping
interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href?: string;
  onClick?: () => void;
  notificationCount?: number;
}

const SidebarItem: React.FC<SidebarItemProps & { isActive?: boolean }> = ({
  icon: Icon,
  label,
  href,
  onClick,
  notificationCount,
  isActive,
}) => {
  const router = useRouter();
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  return (
    <button
      onClick={handleClick}
      title={label}
      className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors
                  ${isActive ? "bg-indigo-100 text-indigo-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"}`}
    >
      <div className="relative">
        <Icon size={24} />
        {notificationCount && notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {notificationCount > 9 ? "9+" : notificationCount}
          </span>
        )}
      </div>
    </button>
  );
};


const Sidebar = () => {
  const router = useRouter();
  // Placeholder for active route, you might want to get this from router.pathname
  const [activeItem, setActiveItem] = React.useState<string | null>(null); 

  const handleLogout = () => {
    // Add your logout logic here (e.g., dispatch Redux action, clear localStorage, redirect)
    console.log("Logout clicked");
    // Example: router.push('/login');
  };

  // Example notification count
  const notificationCount = 3;

  return (
    <div className=" h-full w-20 bg-white shadow-md flex flex-col items-center py-6 space-y-6 font-poppins">
      {/* User Avatar - Assuming User component renders an avatar */}
      <div className="mb-4">
       {/** <User /> */}
      </div>

      <SidebarItem
        icon={IoSettingsOutline}
        label="Settings"
        // href="/settings" // Example href
        isActive={activeItem === "settings"}
        onClick={() => setActiveItem("settings")}
      />
      <SidebarItem
        icon={HiOutlineUsers}
        label="Users"
        // href="/users" // Example href
        isActive={activeItem === "users"}
        onClick={() => setActiveItem("users")}
      />
      <SidebarItem
        icon={IoNotificationsOutline}
        label="Notifications"
        notificationCount={notificationCount} // From your image
        // href="/notifications" // Example href
        isActive={activeItem === "notifications"}
        onClick={() => setActiveItem("notifications")}
      />

      {/* Spacer to push logout to the bottom */}
      <div className="flex-grow"></div>

      <SidebarItem
        icon={IoLogOutOutline}
        label="Logout"
        onClick={handleLogout}
      />
    </div>
  );
};

export default Sidebar;