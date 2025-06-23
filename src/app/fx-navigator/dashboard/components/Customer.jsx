 // src/components/Customer.jsx

import React from 'react';
import { FiEye, FiPhone, FiCreditCard, FiFileText } from 'react-icons/fi';
import { BsBank2 } from 'react-icons/bs';

const CustomerRateCard = () => {
  const rates = [
    { name: 'Mobile', value: '133.45 KES', icon: <FiPhone className="text-blue-600" /> },
    { name: 'Bank', value: '133.25 KES', icon: <BsBank2 className="text-blue-600" /> },
    { name: 'Paybill', value: '133.60 KES', icon: <FiFileText className="text-blue-600" /> },
    { name: 'Card', value: '133.90 KES', icon: <FiCreditCard className="text-blue-600" /> },
  ];

  return (
    <div className="bg-white p-6 rounded-lg  w-full max-w-sm font-sans">
      {/* Card Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[#6B7280] font-medium text-[14px]">Customer rate</h2>
        <button className="flex items-center gap-2 text-sm text-blue-600 font-medium">
          <FiEye />
          <span>App View</span>
        </button>
      </div>

      {/* Rates List */}
      <div className="space-y-3">
        {rates.map((rate) => (
          <div
            key={rate.name}
            className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 px-4 py-3 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-4">
              {rate.icon}
              <span className="font-medium text-[14px] text-gray-700">{rate.name}</span>
            </div>
            <span className="font-bold text-[14px] text-gray-800">{rate.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerRateCard;