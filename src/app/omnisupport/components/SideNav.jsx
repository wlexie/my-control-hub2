'use client';
import { useState } from 'react';

import { usePathname } from 'next/navigation';

import Image from 'next/image';
import Link from 'next/link';
import logo from '../../../../public/omnisupport/images/logo.png';
import set from '../../../../public/omnisupport/images/settings.png';
import User from '../../access-manager/components/User';
import { AiOutlineMessage } from "react-icons/ai";
import { MdDomainVerification } from "react-icons/md";
import { useRouter } from 'next/navigation';

export default function SideNav() {
  const router = useRouter();
  const pathname = usePathname(); // Get current route

  const handleLogoClick = () => {
    router.push('/dashboard'); 
  };

  return (
    <div className="w-full h-screen font-poppins  px-4 pt-8 bg-blue-600 text-white flex flex-col">
      <div className="flex justify-start mb-16">
        <Image src={logo} alt="Logo" width={40} height={24}
                 onClick={handleLogoClick}
       />
        <div className="font-semibold text-[20px] font-lufga mt-2 ml-3">
          Omnisupport
        </div>
      </div>

      <div className="relative group ">
        <Link href="/omnisupport">
          {' '}
          {/* Link to the homepage */}
          <button
            className={`group flex items-center pl-4 pr-5 py-2 rounded-lg mt-2 text-2xl transition duration-300 ease-in-out 
              ${pathname === '/' ? 'bg-gray-200 text-blue-600' : 'hover:bg-[#F3F5F8] hover:text-blue-600'}`}
          >
         <AiOutlineMessage />

            <span className="text-[18px] ml-3 font-medium">All Messages</span>
          </button>
        </Link>
        
        <Link href="/">
    
      </Link>
      
      <Link href="/omnisupport/in-app">
        <button
          className={`flex items-center pl-4 pr-5 py-2 rounded-lg mt-2 transition duration-300 ease-in-out 
            ${pathname === '/in-app' ? 'bg-gray-200 text-blue-600' : 'hover:bg-[#F3F5F8] hover:text-blue-600'}`}
        >
          <span className="text-[18px] font-medium ml-9">In-app</span>
        </button>
      </Link>
      
      <Link href="/omnisupport/email">
        <button
          className={`flex items-center pl-4 pr-5 py-2 rounded-lg mt-2 transition duration-300 ease-in-out 
            ${pathname === '/email' ? 'bg-gray-200 text-blue-600' : 'hover:bg-[#F3F5F8] hover:text-blue-600'}`}
        >
          <span className="text-[18px] ml-9 font-medium">Email</span>
        </button>
      </Link>
      
      <Link href="/omnisupport/sms">
        <button
          className={`flex items-center pl-4 pr-5 py-2 rounded-lg mt-2 transition duration-300 ease-in-out 
            ${pathname === '/sms' ? 'bg-gray-200 text-blue-600' : 'hover:bg-[#F3F5F8] hover:text-blue-600'}`}
        >
          <span className="text-[18px] ml-9 font-medium">WhatsApp</span>
        </button>
      </Link>
      <Link href="/omnisupport/sms">
        <button
          className={`flex items-center pl-4 pr-5 py-2 rounded-lg mt-2 transition duration-300 ease-in-out 
            ${pathname === '/sms' ? 'bg-gray-200 text-blue-600' : 'hover:bg-[#F3F5F8] hover:text-blue-600'}`}
        >
          <span className="text-[18px] ml-9 font-medium">App Store</span>
        </button>
      </Link>
      <Link href="/omnisupport/sms">
        <button
          className={`flex items-center pl-4 pr-5 py-2 rounded-lg mt-2 transition duration-300 ease-in-out 
            ${pathname === '/sms' ? 'bg-gray-200 text-blue-600' : 'hover:bg-[#F3F5F8] hover:text-blue-600'}`}
        >
          <span className="text-[18px]  ml-9 font-medium">Playstore</span>
        </button>
      </Link>
      <Link href="/omnisupport/transactions">
          <button className="flex ml-9 items-center pl-4 pr-12 py-2 mt-2 rounded-lg  border-white text-white transition duration-300   ease-in-out hover:bg-white hover:border-blue-600 hover:text-blue-600">
            

            {/* Settings Text */}
            <span className="text-[18px] font-medium transition duration-300 ease-in-out">
              KPLC 
            </span>
          </button>
        </Link>
           <Link href="/omnisupport/e-citizen">
          <button className="flex ml-9 items-center pl-4 pr-12 py-2 mt-2 rounded-lg  border-white text-white transition duration-300   ease-in-out hover:bg-white hover:border-blue-600 hover:text-blue-600">
            

            {/* Settings Text */}
            <span className="text-[18px] font-medium transition duration-300 ease-in-out">
              E-CITIZEN 
            </span>
          </button>
        </Link>
{/** 
      <Link href="/">
  <button className="group flex items-center text-2xl pl-4 pr-12 py-2 mt-2 rounded-lg border-white text-white transition duration-300 ease-in-out hover:bg-white hover:border-blue-600 hover:text-blue-600">
  <MdDomainVerification />


    <span className="text-[18px] font-medium transition ml-3  duration-300 ease-in-out">
      Verification
    </span>
  </button>
</Link>
*/}



        <Link href="/">
          <button className="flex items-center pl-4 pr-12 py-2 mt-2 rounded-lg  border-white text-white transition duration-300   ease-in-out hover:bg-white hover:border-blue-600 hover:text-blue-600">
            {/* SVG Settings Icon */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-4 transition duration-300 ease-in-out"
            >
              <path d="M12 2v2"></path>
              <path d="M12 20v2"></path>
              <path d="M4.93 4.93l1.41 1.41"></path>
              <path d="M17.66 17.66l1.41 1.41"></path>
              <path d="M2 12h2"></path>
              <path d="M20 12h2"></path>
              <path d="M6.34 17.66l-1.41 1.41"></path>
              <path d="M19.07 4.93l-1.41 1.41"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>

            {/* Settings Text */}
            <span className="text-[18px] font-medium transition duration-300 ease-in-out">
              Settings
            </span>
          </button>
        </Link>
      </div>
      {/* Bottom Section */}
      <div className="mt-auto mb-4">
        <User />
      </div>
    </div>
  );
}
