// src/components/Cost.jsx

import React from 'react';
import { BsCheckCircle } from 'react-icons/bs';

const CostRateCard = () => {
  const rates = [
    { name: 'Mobile', value: '130.45', width: '95%' },
    { name: 'Bank', value: '130.25', width: '90%' },
    { name: 'Paybill', value: '130.60', width: '85%' },
    { name: 'Card', value: '130.90', width: '80%' },
  ];

  return (
    <div className="bg-white p-6 rounded-lg  w-full max-w-sm font-sans">
      {/* Card Header */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-[#6B7280] font-medium text-[14px]">Tuma at cost rate</h2>
        <div className="flex items-center gap-1 text-green-500">
          <BsCheckCircle />
          <span className="text-sm font-medium">Updated</span>
        </div>
      </div>

      {/* Rates with Bars */}
      <div className="space-y-4">
        {rates.map((rate) => (
          <div key={rate.name}>
            <div className="flex justify-between text-[14px] items-center mb-2">
              <span className="text-gray-600">{rate.name}</span>
              <span className="font-semibold text-gray-800">{rate.value}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-green-400 h-1.5 rounded-full"
                style={{ width: rate.width }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CostRateCard;