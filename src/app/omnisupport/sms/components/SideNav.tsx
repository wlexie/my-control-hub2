'use client';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// --- Assuming your logo and user component are correctly placed ---
import logo from '../../../../../public/fx/images/logo.png'; 
import User from '../../../access-manager/components/User';

// --- IMPORTING ICONS ---
// You may need to install react-icons: npm install react-icons
import { FiX, FiSmartphone, FiMail } from "react-icons/fi";
import { AiOutlineMessage } from "react-icons/ai";
import { FaWhatsapp } from "react-icons/fa";
import { BsChatDots } from "react-icons/bs";

// --- NAVIGATION ITEMS DATA ---
// This makes it easier to manage the links and their data
const messageSources = [
  //{ name: 'All Messages', href: '/omnisupport', icon: AiOutlineMessage, count: 24, active: true },
  { name: 'WhatsApp', href: '/omnisupport/whatsapp', icon: FaWhatsapp, count: 12 },
  { name: 'In-App', href: '/omnisupport/in-app', icon: FiSmartphone, count: 8 },
  { name: 'Email', href: '/omnisupport/email', icon: FiMail, count: 3 },
  { name: 'SMS', href: '/omnisupport/sms', icon: BsChatDots, count: 1 },
];

// Update component to accept an optional onClose prop for mobile view
export default function SideNav({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const pathname = usePathname(); // Use this to dynamically set the active link

  const handleLogoClick = () => {
    router.push('/dashboard');
  };

  return (
    <div className="w-full h-screen font-sans p-6 bg-[#2B66F6] text-white flex flex-col">
      {/* Header with Logo and optional Close Button */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogoClick}>
            <Image
                src={logo} // Your logo path
                alt="Omnisupport Logo"
                width={40}
                height={40}
                className="object-contain"
            />
            <span className="font-bold text-2xl">
                Omnisupport
            </span>
        </div>
        {/* Close button for mobile */}
        {onClose && (
            <button
                onClick={onClose}
                className="md:hidden p-1 text-white"
                aria-label="Close navigation menu"
            >
                <FiX size={28} />
            </button>
        )}
      </div>

      {/* Message Sources Section */}
      <div className="flex flex-col gap-2">
        <h2 className="text-sm text-gray-200 font-semibold mb-2 px-2">Message Sources</h2>
        {messageSources.map((item) => {
          // Check if the current path matches the item's href
          const isActive = pathname === item.href;
          
          return (
            <Link href={item.href} key={item.name}>
              <div
                className={`flex items-center justify-between w-full px-3 py-3 rounded-lg cursor-pointer transition-all duration-300
                  ${isActive ? 'bg-white text-[#2B66F6]' : 'hover:bg-white/20'}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </div>
                <span
                  className={`px-2.5 py-0.5 text-sm font-semibold rounded-full
                    ${isActive ? 'bg-[#D6E2FD] text-[#2B66F6]' : 'bg-[#4E81F7]'}`}
                >
                  {item.count}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Spacer to push content down */}
      <div className="flex-grow"></div>

      {/* Today's Stats Card */}
      <div className="bg-blue-700 p-4 rounded-xl mb-6">
        <h3 className="font-bold text-lg mb-4">Today&apos;s Stats</h3>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-200">Avg Response</span>
            <span className="font-semibold">2.3 min</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-200">Resolution Rate</span>
            <span className="font-semibold text-green-300">94%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-200">Tickets Resolved</span>
            <span className="font-semibold">18</span>
          </div>
        </div>
      </div>

      {/* End Shift Button */}
      <button className="w-full flex items-center justify-between px-3 py-2 mb-8 bg-blue-600 border border-white/50 rounded-lg hover:bg-white/20 transition-all duration-300">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-green-400 rounded-full"></span>
            <span className="font-medium">End Shift</span>
          </div>
          <span>0h 0m</span>
      </button>

      {/* Bottom User Section */}
      <div className="mt-auto">
        {/* Assuming User component is styled to match the image */}
        <User />
      </div>
    </div>
  );
}