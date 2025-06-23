// src/components/Interbank.jsx

import React from 'react';
import { BsCurrencyPound, BsCurrencyDollar, BsCurrencyEuro } from 'react-icons/bs';

const InterbankRateCard = () => {
  return (
    <div className="bg-white p-6 rounded-lg  w-full max-w-sm font-sans">
      {/* Card Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[#6B7280] font-medium text-[14px]">Interbank rate</h2>
        <p className="text-xs text-gray-500">Last updated: 09:15 AM</p>
      </div>

      {/* Currency Rates List */}
      <div className="space-y-4">
        {/* GBP/KES */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <BsCurrencyPound className="text-blue-600" />
            </div>
            <span className="font-medium text-[14px] text-gray-700">GBP/KES</span>
          </div>
          <input
            type="text"
            defaultValue="164.75"
            className="w-28 text-right font-medium text-[14px] text-gray-800 bg-white border border-gray-200 rounded-md py-1 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* USD/KES */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <BsCurrencyDollar className="text-blue-600" />
            </div>
            <span className="font-medium text-[14px] text-gray-700">USD/KES</span>
          </div>
          <input
            type="text"
            defaultValue="129.85"
            className="w-28 text-right font-medium text-[14px] text-gray-800 bg-white border border-gray-200 rounded-md py-1 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* EUR/KES */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <BsCurrencyEuro className="text-blue-600" />
            </div>
            <span className="font-medium text-[14px] text-gray-700">EUR/KES</span>
          </div>
          <input
            type="text"
            defaultValue="142.30"
            className="w-28 text-right text-[14px] font-medium text-gray-800 bg-white border
             border-gray-200 rounded-md py-1 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Update Button */}
      <div className="mt-8">
        <button className="w-full bg-blue-50 text-blue-600 font-semibold py-3 rounded-xl hover:bg-blue-100 transition-colors">
          Update Rates
        </button>
      </div>
    </div>
  );
};

export default InterbankRateCard;