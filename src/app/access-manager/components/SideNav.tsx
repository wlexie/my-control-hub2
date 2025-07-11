"use client"; // Add this at the very top of the file

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useRouter } from 'next/navigation';
// Import React Icons
import {
  FaChartLine, FaExchangeAlt, FaUsers, FaShieldAlt,
  FaBell, FaHeadset, FaFileAlt, FaCog, FaBars, FaTimes
} from "react-icons/fa";
import User from './User';

interface NavItem {
  href: string;
  icon: React.JSX.Element;
  label: string;
}

export default function SideNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Define logo path for reuse
  const logoSrc = "/fx/images/logo.png";

  const navItems: NavItem[] = [
    { href: "/access-manager", icon: <FaChartLine className="mr-3" size={22} />, label: "Dashboard" },
    { href: "/transactions", icon: <FaExchangeAlt className="mr-3" size={20} />, label: "Transactions" },
    { href: "/access-manager/user-access", icon: <FaUsers className="mr-3" size={20} />, label: "User roles & access" },
    { href: "/compliance", icon: <FaShieldAlt className="mr-3" size={20} />, label: "Compliance & Security" },
    { href: "/alerts", icon: <FaBell className="mr-3" size={20} />, label: "Alerts & Risk flags" },
    { href: "/support", icon: <FaHeadset className="mr-3" size={20} />, label: "Support" },
    { href: "/reports", icon: <FaFileAlt className="mr-3" size={20} />, label: "Reports & Analytics" },
    { href: "/settings", icon: <FaCog className="mr-3" size={20} />, label: "Settings & Permissions" },
  ];

  const handleLogoClick = () => {
    router.push('/dashboard');
    setIsMobileMenuOpen(false); // Close nav on click
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false); // Close nav on link click
  };

  return (
    <>
      {/* Mobile Header Bar - Only visible on mobile (hidden on md screens and up) */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white text-gray-700 shadow-md sticky top-0 z-20">
        <div
          className="flex items-center cursor-pointer"
          onClick={handleLogoClick}
        >
          <Image src={logoSrc} alt="Logo" width={35} height={24} />
          <span className="font-semibold text-xl ml-3 text-blue-600">Admin</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-md text-blue-600 hover:bg-blue-50 focus:outline-none"
          aria-label="Open menu"
        >
          <FaBars size={24} />
        </button>
      </header>
      
      {/* OVERLAY / BACKDROP - for mobile */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* SIDENAV CONTAINER - Responsive */}
      <div
        className={`
          fixed top-0 right-0 h-full bg-[#276EF1] font-poppins flex flex-col text-white z-40
          transition-transform duration-300 ease-in-out
          
          // Mobile styles: Full width, slides from right
          w-full transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}

          // Desktop styles: Fixed width on left
          md:w-[300px] md:translate-x-0 md:left-0
        `}
      >
        {/* ---- SIDENAV CONTENT ---- */}
        
        {/* Mobile-only Close Button inside the nav panel */}
        <div className="md:hidden flex justify-end p-4">
           <button 
             onClick={() => setIsMobileMenuOpen(false)}
             className="p-2 text-white"
             aria-label="Close menu"
           >
              <FaTimes size={28} />
           </button>
        </div>

        {/* Logo/Site Name - For Desktop View (and also visible in mobile panel) */}
        <div
          className="p-6 pt-0 md:pt-6 flex items-center gap-3 cursor-pointer hover:bg-blue-600 transition-colors"
          onClick={handleLogoClick}
        >
          <span className="p-1 py-2 bg-white rounded">
            <Image
              src={logoSrc}
              alt="Logo"
              width={25}
              height={28}
            />
          </span>
          <h1 className="text-[22px] font-semibold">Admin</h1>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={handleLinkClick} // Close menu on navigation
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    pathname === item.href
                      ? "bg-white text-blue-500"
                      : "hover:bg-white hover:text-blue-500"
                  }`}
                >
                  {item.icon}
                  <span className="font-[400] text-[18px]">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile/Footer */}
        <div className="mt-auto mb-4 px-4">
          <User />
        </div>
      </div>
    </>
  );
}