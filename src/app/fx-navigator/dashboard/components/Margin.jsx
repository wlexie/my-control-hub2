// app/components/Margin.jsx

'use client';

import React from 'react';
import { IoIosArrowDown } from "react-icons/io";

const MarginRow = ({ channel, volume, cost, margin, marginColor }) => (
  <div className="grid grid-cols-4 gap-4 py-3">
    <span className="text-sm font-medium text-gray-700">{channel}</span>
    <span className="text-sm text-gray-600 text-center">{volume}</span>
    <span className="text-sm text-gray-600 text-center">{cost}</span>
    <span className={`text-sm font-bold ${marginColor} text-center`}>{margin}</span>
  </div>
);

const Margin = () => {
  return (
    // ---- ADDED flex and flex-col ----
    // This turns the entire card into a vertical flex container.
    <div className="bg-white p-6 pt-8 pb-10 rounded-lg flex flex-col">
      <div className="flex justify-between items-center mb-7">
        <h2 className="text-lg font-semibold text-gray-800">Net Margin per Channel</h2>
        <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-sm">
          <span className="text-sm font-semibold text-gray-800">GBP - KES</span>
          <IoIosArrowDown className="h-4 w-4 text-gray-800" />
        </button>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-4 gap-4 pb-">
        <span className="text-[12px] font-semibold text-[#6B7280] ">Channel</span>
        <span className="text-[12px] font-semibold text-gray-500 text-center">Volume</span>
        <span className="text-[12px] font-semibold text-gray-500  text-right">Settlement Cost</span>
        <span className="text-[12px] font-semibold text-gray-500  text-center">Net Margin</span>
      </div>

      {/* ---- ADDED flex-1 ---- */}
      {/* Table Body - This div will now grow to fill remaining space. */}
      {/* overflow-y-auto is good practice in case content ever overflows. */}
      <div className="mt-3 flex-2 overflow-y-auto">
        <MarginRow channel="Mobile Money" volume="5,245,780" cost="52,458" margin="2.3%" marginColor="text-green-600" />
        <MarginRow channel="Bank Transfer" volume="3,821,450" cost="19,107" margin="1.7%" marginColor="text-green-600" />
        <MarginRow channel="Card Payment" volume="2,156,328" cost="43,127" margin="1.8%" marginColor="text-orange-500" />
        <MarginRow channel="Paybill" volume="1,034,900" cost="10,349" margin="1.4%" marginColor="text-orange-500" />
      </div>
    </div>
  );
};

export default Margin;