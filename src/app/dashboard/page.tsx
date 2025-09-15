"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { clearCredentials } from "../../store/authSlice";
import ModuleCard from "./ModuleCard";

// React Icons
import { IoSettingsOutline, IoNotificationsOutline } from "react-icons/io5";
import { MdOutlineLogout } from "react-icons/md";
import { HiOutlineUsers } from "react-icons/hi2";

// Data for modules (assuming it's correc
const allModulesData = [
  {
    name: "Back Office Suite",
    iconSrc: "/user-access/images/frame2.svg",
    title: "Your command center for transactions.",
    description:
      "Get complete visibility into every transaction across the Tuma ecosystem. Track, monitor, and audit with confidence in a secure and intuitive interface.",
    path: "/backoffice/dashboard/",
    roles: ["ADMIN", "OMNISUPPORT", "COMPLIANCE", "BACKOFFICE", "DASHBOARD"],
  },
  {
    name: "OmniSupport",
    iconSrc: "/user-access/images/frame1.svg",
    title: "Where customer care meets excellence.",
    description:
      "Empower your support team to resolve customer issues faster and smarter — all in one unified dashboard designed for real-time conversations and seamless service.",
    path: "/omnisupport",
    roles: ["ADMIN", "OMNISUPPORT"],
  },
  {
    name: "FX Navigator",
    iconSrc: "/user-access/images/Frame.svg",
    title: "Take control of your exchange rates.",
    description:
      "Effortlessly manage and update Tuma's FX rates with precision. FX Navigator gives you full visibility and control to react to market changes — instantly.",
    path: "/fx-navigator/dashboard",
    roles: ["ADMIN"],
  },
  {
    name: "Campaign Manager",
    iconSrc: "/user-access/images/frame3.svg",
    title: "Turn ideas into impact.",
    description:
      "Create, launch, and manage in-app campaigns that connect with your customers. From promos to referral boosts — Campaign Manager helps you market like a pro.",
    path: "/campaign-manager",
    roles: ["ADMIN"],
  },

  {
    name: "Merchant Portal",
    iconSrc: "/user-access/images/frame5.svg",
    title: "Insights that drive merchant growth.",
    description:
      "Track merchant performance, payouts, and customer activity in real time. Give your partners the data they need to thrive with Tuma.",
    path: "/promitto/dashboard",
    roles: ["ADMIN"],
  },
  {
    name: "Access Manager",
    iconSrc: "/user-access/images/frame6.svg",
    title: "Secure access. Smart control.",
    description:
      "Easily manage roles and permissions for your internal teams. From compliance to customer care, control who sees what — securely and efficiently.",
    path: "/access-manager",
    roles: ["ADMIN"],
  },
];

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href?: string;
  onClick?: () => void;
  notificationCount?: number;
  isActive?: boolean;
  hoverTextColorClass?: string;
  activeTextColorClass?: string;
  activeBgColorClass?: string;
  isMobile?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  href,
  onClick,
  notificationCount,
  isActive,
  hoverTextColorClass = "hover:text-indigo-600",
  activeTextColorClass = "text-indigo-700",
  activeBgColorClass = "bg-indigo-100",
  isMobile = false, // Default to not mobile
}) => {
  const router = useRouter();
  // prioritizes the passed onClick prop.
  const handleClick = () => {
    if (onClick) onClick();
    else if (href) router.push(href);
  };

  const baseClasses =
    "relative flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-150 group w-full";
  const colorClasses = isActive
    ? activeTextColorClass
    : `text-gray-500 ${hoverTextColorClass}`;
  const bgClass = isActive ? activeBgColorClass : "hover:bg-gray-100";

  return (
    <button
      onClick={handleClick}
      title={label}
      className={`${baseClasses} ${bgClass}`}
    >
      <div className={`relative ${colorClasses}`}>
        <Icon size={24} />
        {notificationCount && notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {notificationCount > 9 ? "9+" : notificationCount}
          </span>
        )}
      </div>
      <span
        className={`mt-1 text-xs font-medium ${colorClasses} 
                       ${
                         isMobile
                           ? "opacity-100"
                           : "opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                       }
                       transition-opacity duration-150`}
      >
        {label}
      </span>
    </button>
  );
};

const UserInitialsAvatar = ({ isMobile = false }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  let initials = "??";
  if (user?.firstName && user.lastName)
    initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  else if (user?.firstName) initials = user.firstName[0].toUpperCase();
  else if (user?.email) initials = user.email[0].toUpperCase();

  return (
    <div className="relative flex flex-col items-center text-center group cursor-pointer w-full p-1 md:p-2">
      <div
        className="w-8 h-8 md:w-12 md:h-12 bg-indigo-500 text-white rounded-full 
                   flex items-center justify-center text-sm font-semibold
                   group-hover:ring-2 group-hover:ring-indigo-300 transition-all"
      >
        {initials}
      </div>
      <span
        className={`mt-1 text-xs font-medium text-gray-500 group-hover:text-indigo-600
                       ${
                         isMobile
                           ? "opacity-100"
                           : "opacity-0 group-hover:opacity-100 md:mb-10 md:opacity-0 md:group-hover:opacity-100"
                       }
                       transition-opacity duration-150`}
      >
        Profile
      </span>
    </div>
  );
};

const DashboardPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [activeItem, setActiveItem] = useState<string | null>("dashboard");
  const notificationCount = 3;

  const handleLogout = () => {
    dispatch(clearCredentials());
    router.push("/");
  };

  useEffect(() => {
    // console.log("Current user from store:", user);
  }, [user]);

  const filteredModules = allModulesData.filter((module) => {
    if (!user || !user.roles) return false;
    if (user.roles.includes("ADMIN")) return true;
    return module.roles.some((role) => user.roles.includes(role));
  });

  const handleModuleClick = (path: string) => {
    if (path.startsWith("http")) window.open(path, "_blank");
    else router.push(path);
  };

  const sidebarNavItems = [
    {
      id: "settings",
      label: "Settings",
      icon: IoSettingsOutline,
      hoverColor: "hover:text-blue-500",
      activeColor: "text-blue-700",
      activeBg: "bg-blue-100",
    },
    {
      id: "users",
      label: "Users",
      icon: HiOutlineUsers,
      hoverColor: "hover:text-green-600",
      activeColor: "text-green-700",
      activeBg: "bg-green-100",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: IoNotificationsOutline,
      count: notificationCount,
      hoverColor: "hover:text-orange-600",
      activeColor: "text-orange-700",
      activeBg: "bg-orange-100",
    },
    {
      id: "logout",
      label: "Logout",
      icon: MdOutlineLogout,
      onClick: handleLogout,
      hoverColor: "hover:text-red-600",
      activeColor: "text-red-600",
      activeBg: "bg-red-100",
    },
  ];

  // ADDED: A new handler function to manage clicks
  const handleSidebarItemClick = (item: (typeof sidebarNavItems)[0]) => {
    // If the item has its own onClick function (like logout), execute it.
    if (item.onClick) {
      item.onClick();
    } else {
      // Otherwise, just set it as the active item.
      setActiveItem(item.id);
    }
  };

  const renderSidebarItems = (isMobile: boolean) => (
    <>
      <UserInitialsAvatar isMobile={isMobile} />
      {sidebarNavItems.map((item) => (
        <SidebarItem
          key={item.id + (isMobile ? "-mobile" : "-desktop")}
          icon={item.icon}
          label={item.label}
          notificationCount={item.count}
          isActive={activeItem === item.id}
          // CHANGED: Use the new handler function
          onClick={() => handleSidebarItemClick(item)}
          hoverTextColorClass={item.hoverColor}
          activeTextColorClass={item.activeColor}
          activeBgColorClass={item.activeBg}
          isMobile={isMobile}
        />
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-white font-outfit">
      <div className="max-w-[1210px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 md:pb-12">
        <div className="mb-4 text-center">
          <h1 className="text-3xl md:text-[24px] font-bold text-gray-800 mb-2">
            Tuma Navigator
          </h1>
          <p className="text-[#4D525F] text-[16px]">
            Tuma is designed with flexibility in mind. Browse the options below
            and select the module that fits you best.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-14">
          {/* Desktop Sidebar: Aligned with content, not full screen height sticky */}
          <div className="hidden md:block w-[100px] shrink-0">
            <div className="bg-white border rounded-lg p-2 py-4 flex flex-col items-center space-y-2 h-full">
              {renderSidebarItems(false)}
            </div>
          </div>

          {/* Modules Column (Main Content) */}
          <div className="flex-1">
            {filteredModules.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                {filteredModules.map((module) => (
                  <ModuleCard
                    key={module.name}
                    name={module.name}
                    iconSrc={module.iconSrc}
                    title={module.title}
                    description={module.description}
                    onSelect={() => handleModuleClick(module.path)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full bg-white rounded-lg shadow p-10">
                <p className="text-2xl text-gray-500">
                  No modules available for your current role.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 rounded-t-2xl left-4 right-4 bg-white border border-gray-200  p-1 z-20">
        <div className="flex justify-around items-stretch h-full">
          {renderSidebarItems(true)}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
