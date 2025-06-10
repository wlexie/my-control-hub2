// Create a new file, e.g., components/dashboard/ModuleCard.tsx
"use client";

import React from "react";
import Image from "next/image";

interface ModuleCardProps {
  name: string;
  iconSrc: string;
  title: string;
  description: string;
  onSelect: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  name,
  iconSrc,
  title,
  description,
  onSelect,
}) => {
  return (
    <div className="bg-white rounded-xl border p-6 flex flex-col items-center  h-full transition-all duration-300 hover:shadow-lg">
      <div className="mb-4 w-12 bg-indigo-50 p-3 rounded-full h-12 relative">
        {" "}
        {/* Adjust size as needed */}
        <Image
          src={iconSrc}
          alt={`${name} icon`}
          width={64} // Match container
          height={64} // Match container
          className="object-contain" // Or object-cover if icons are square and need to fill
        />
      </div>
      <h3 className="text-[20px] font-semibold text-gray-800 mb-2">{name}</h3>
      <span className="text-[14px] text-center font-[600] text-[#2A282F]">
        {title}
      </span>
      <p className="text-[12px] text-center text-[#625F68] flex-grow mb-3 leading-relaxed">
        {description}
      </p>
      <button
        onClick={onSelect}
        className="mt-auto w-full bg-indigo-50 hover:bg-indigo-300 text-indigo-600 font-medium py-2 px-4  
        rounded-2xl transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
      >
        Select Module
      </button>
    </div>
  );
};

export default ModuleCard;
