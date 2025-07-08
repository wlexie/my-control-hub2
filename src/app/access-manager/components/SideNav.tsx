"use client"; // Add this at the very top of the file

//import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useRouter } from 'next/navigation';
// Import React Icons
import { FaChartLine, FaExchangeAlt, FaUsers, FaShieldAlt } from "react-icons/fa";
import { FaBell, FaHeadset, FaFileAlt, FaCog } from "react-icons/fa";
//import { FaUser } from "react-icons/fa";
import User from './User';
//import DashboardModal from '../../dashboard';



interface NavItem {
  href: string;
  icon: React.JSX.Element;
  label: string;
}

export default function SideNav() {
  const pathname = usePathname();
  const router = useRouter();


  const navItems: NavItem[] = [
    {
      href: "/access-manager",
      icon: <FaChartLine className="mr-3" size={22} />,
      label: "Dashboard",
    },
    {
      href: "/transactions",
      icon: <FaExchangeAlt className="mr-3" size={20} />,
      label: "Transactions",
    },
    {
      href: "/access-manager/user-access",
      icon: <FaUsers className="mr-3" size={20} />,
      label: "User roles & access",
    },
 
    {
      href: "/compliance",
      icon: <FaShieldAlt className="mr-3" size={20} />,
      label: "Compliance & Security",
    },
    {
      href: "/alerts",
      icon: <FaBell className="mr-3" size={20} />,
      label: "Alerts & Risk flags",
    },
    {
      href: "/support",
      icon: <FaHeadset className="mr-3" size={20} />,
      label: "Support",
    },
    {
      href: "/reports",
      icon: <FaFileAlt className="mr-3" size={20} />,
      label: "Reports & Analytics",
    },
    {
      href: "/settings",
      icon: <FaCog className="mr-3" size={20} />,
      label: "Settings & Permissions",
    },
  ];

  const handleLogoClick = () => {
    router.push('/dashboard'); 
  };

  return (
    <div className="fixed h-full w-[300px] bg-[#276EF1] font-poppins flex flex-col text-white">
      {/* Logo/Site Name */}
      <div 
        className="p-6 flex items-center gap-3 cursor-pointer hover:bg-blue-600 transition-colors"
        onClick={handleLogoClick}
      >
        <span className="p-1 py-2 bg-white rounded">
          <Image 
            src="/fx/images/logo.png" 
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
                className={`flex items-center p-2 rounded-lg transition-colors ${
                  pathname === item.href
                    ? "bg-white text-blue-500  "
                    : "hover:bg-white hover:text-blue-500 "
                }`}
              >
                {item.icon}
                <span className="font-[400] text-[17px]">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile/Footer */}
      <div className="mt-auto mb-4">
        <User />
      </div>
        {/* Dashboard Modal 
        <DashboardModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />  */}
    </div>
  );
}