'use client';

import React from 'react';
import { FaArrowUp } from 'react-icons/fa';

// Reusable Stat Card component
const StatCard = ({ pair, value, color, bgColor }) => (
  <div className={`p-4 py-2 rounded-lg text-center ${bgColor}`}>
    <p className="text-[14px] text-gray-600 font-medium">{pair}</p>
    <p className={`text-[13px] font-semibold ${color}`}>{value}</p>
  </div>
);

const Total = () => {
  return (
    <div className="bg-white py-4 pb-5 px-5 rounded-lg ">
      <h2 className="text-[16px] font-semibold text-gray-800">Total Net Position</h2>

      <div className="flex items-center gap-2 mt-4">
        {/* Main figure */}
        <p className="text-[30px] font-semibold text-slate-800">+KES 13.2M</p>

        {/* Secondary stat */}
        <div className="flex items-center text-[#16A34A] font-medium -translate-y-0.3">
          <FaArrowUp size={12} className="mr-1 ml-2 text-[#16A34A]" />
          <span className="text-[14px]">+2.4% from yesterday</span>
        </div>
      </div>

      {/* Stat cards with different background colors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5 mb-6">
        <StatCard
          pair="GBP/KES"
          value="+4.8M"
          color="text-green-600"
          bgColor="bg-[#5C9DFF0D]"
        />
        <StatCard
          pair="USD/KES"
          value="+6.2M"
          color="text-green-600"
          bgColor="bg-[#FFAE4C0D]"
        />
        <StatCard
          pair="EUR/KES"
          value="+2.2M"
          color="text-green-600"
          bgColor="bg-[#45D0EE0D]"
        />
      </div>
    </div>
  );
};

export default Total;
