"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, LucideUserRound, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { IoLogOutOutline, IoSettingsOutline } from "react-icons/io5";

interface TopNavProps {
  user: {
    firstName: string;
    lastName: string;
  } | null;
}

const navItems = [
  {
    label: "Campaign Dashboard",
    href: "/campaign-manager/usage-tracking",
  },
  {
    label: "Influencer Performance",
    href: "/campaign-manager/influencer-attribution",
  },
  { label: "Create Campaign", href: "/campaign-manager/create-campaign" },
];

const getInitials = (firstName: string, lastName: string): string => {
  const f = firstName?.charAt(0) || "";
  const l = lastName?.charAt(0) || "";
  return (f + l).toUpperCase();
};

function TopNav({ user }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div className="flex justify-between items-center px-4 md:px-12 pt-4">
        {/* Left - Logo + Mobile Menu */}
        <div className="flex items-center space-x-3">
          <button className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? (
              <X size={28} className="text-white" />
            ) : (
              <Menu size={24} className="text-white" />
            )}
          </button>
          <div
            onClick={() => router.push("/dashboard")}
            className="cursor-pointer"
          >
            <img
              src="/backoffice/tumalink.png"
              alt="Tuma Logo"
              className="h-7"
            />
          </div>
        </div>

        {/* Center - Desktop Nav */}
        <ul className="hidden md:flex items-center space-x-6 text-md text-white/80 text-md">
          {navItems.map((item, idx) => {
            // Special rule only for Create Campaign
            const isCreateCampaignActive =
              item.href === "/campaign-manager/create-campaign" &&
              (pathname === "/campaign-manager/create-campaign" ||
                pathname === "/campaign-manager/create-campaign/success");

            // Default rule for all others
            const isActive = pathname === item.href || isCreateCampaignActive;

            return (
              <li key={idx}>
                <Link href={item.href}>
                  <span
                    className={`group relative inline-block transition-colors ${
                      isActive ? "text-white" : "hover:text-white"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`absolute bottom-[-6px] left-0 h-[2px] w-full transition-opacity duration-200 ${
                        isActive
                          ? "bg-white opacity-100"
                          : "bg-white opacity-0 group-hover:opacity-100"
                      }`}
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right - Icons and Dropdown */}
        <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
          <Bell size={24} className="text-white" />
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center font-semibold text-sm focus:outline-none"
          >
            {user ? getInitials(user.firstName, user.lastName) : "?"}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-14 w-60 bg-white rounded-xl shadow-lg z-50 p-4 space-y-3">
              <div className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 cursor-pointer">
                <IoSettingsOutline className="w-5 h-5" />
                <span>Settings</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 cursor-pointer">
                <LucideUserRound className="w-5 h-5" />
                <span>Account</span>
              </div>
              <div className="flex items-center justify-between text-gray-600 hover:text-blue-600  cursor-pointer">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </div>
                <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  3
                </span>
              </div>
              <div
                className="flex items-center space-x-2 text-red-600 bg-red-100 hover:bg-red-200 rounded-md p-2 cursor-pointer"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <IoLogOutOutline className="w-5 h-5" />
                <span>Log out</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer with Animation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 w-3/4 max-w-sm h-full bg-[#1a5cd6] shadow-lg z-50 p-6 space-y-6 rounded-tr-md rounded-br-md"
          >
            <button onClick={toggleMenu} className="mb-4">
              <X size={28} className="text-white" />
            </button>
            {navItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
              >
                <p
                  className={`text-white text-lg ${
                    pathname === item.href ? "font-bold" : ""
                  }`}
                >
                  {item.label}
                </p>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TopNav;
