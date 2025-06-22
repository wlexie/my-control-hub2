import React from 'react';
import { FaCalendarAlt,  FaDownload } from 'react-icons/fa';
import { IoIosArrowDown } from "react-icons/io";
import { GoDotFill } from "react-icons/go";
import { FaArrowRightLong } from "react-icons/fa6";
import Image from 'next/image';

/**
 * A reusable button component specifically for currency selection.
 * This keeps the main component cleaner and makes the button's logic and style reusable.
 * @param {{currency: string}} props - The currency code to display (e.g., "GBP").
 */
const CurrencyButton = ({ currency }) => {
  return (
    <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2  transition-colors hover:bg-gray-50">
      <span className="text-sm font-[600] text-gray-900">{currency}</span>
      <IoIosArrowDown className="h-4 w-4 text-gray-800" />
    </button>
  );
};


const TopNav = () => {
  // Hardcoded values for demonstration
  const date = "08/06/2025";
  const currencyPair = { from: "GBP", to: "KES" };
  const channel = "All channels";

  // General styles for other buttons
  const buttonClasses = "flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-gray-100";
  const iconClasses = "text-gray-500";
  const textClasses = "font-medium text-gray-900";

  return (
    <header className="flex w-full items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
      
      {/* Left side: Title */}
      <div>
        <h1 className="text-[18px] font-[600] text-gray-900">Treasury dashboard</h1>
      </div>

      {/* Right side: Filters and Actions */}
      <div className="flex items-center gap-4">
        
        {/* Live Status Badge */}
        <div className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-[14px] font-medium text-[#27AE60]">
          <GoDotFill className="mr-1.5 h-4 w-4" />
          <span>Live</span>
        </div>
        
        {/* Date Range Picker */}
        <div className="">
          <button className={buttonClasses}>
            <FaCalendarAlt className={iconClasses} />
            <span className={textClasses}>{date}</span>
          </button>
        </div>

        {/* --- START: UPDATED CURRENCY PAIR SELECTOR --- */}
        <div className="flex items-center gap-2">
          <CurrencyButton currency={currencyPair.from} />
          <FaArrowRightLong className="text-gray-400" />
          <CurrencyButton currency={currencyPair.to} />
        </div>
        {/* --- END: UPDATED CURRENCY PAIR SELECTOR --- */}

        {/* Channel Selector */}
        <button className={buttonClasses}>
          <span className={textClasses}>{channel}</span>
          <IoIosArrowDown  className={iconClasses} />
        </button>

        {/* Export Button */}
        <button className={buttonClasses}>
          <FaDownload className={iconClasses} />
          <span className={textClasses}>Export</span>
          <IoIosArrowDown  className={iconClasses} />
        </button>
        
        {/* Profile/Flag Icon */}
        <div className="w-10 h-10 p-2 rounded-full border border-gray-200 overflow-hidden">
          <Image 
            src="/fx/flags/kenya.png" 
            alt="Kenyan Flag"
            width={32}
            height={32}
            className="object-cover"
          />
        </div>

      </div>
    </header>
  );
};

export default TopNav;