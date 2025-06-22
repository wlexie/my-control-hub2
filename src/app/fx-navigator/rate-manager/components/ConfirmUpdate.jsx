import React from "react";
import Image from 'next/image';
import closeIcon from '../../../../../public/fx/images/close.png';

const ConfirmUpdate = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  data, 
  expiryDate,
  isLoading 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center font-poppins justify-end bg-opacity-30 z-50">
      <div className="bg-white p-6 w-[760px] px-10 h-screen rounded-lg shadow-lg flex flex-col">
        <h2 className="text-3xl text-center text-gray-500 font-[700] mt-32">Confirm Changes</h2>
      
        <button className="absolute top-3 right-3" onClick={onClose}>
          <Image src={closeIcon} alt="Close Modal" width={25} height={35} />
        </button>

        <div className="overflow-x-auto mx-8 rounded-t-xl mt-4 p-4">
          <table className="w-full text-left text-gray-700">
            <thead>
              <tr className="text-gray-500 font-[300] text-left text-[16px]">
                <th className="p-3">Payment Method</th>
                <th className="p-3">Final Rate</th>
                <th className="p-3">Markup (%)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="text-[17px] border-gray-200">
                  <td className="p-3 flex items-center gap-3">
                    <span className="p-3 bg-gray-200 my-2 rounded-full">
                      <img src={row.icon} alt={row.paymentRecords} className="w-6 h-6" />
                    </span>
                    <span className="text-[#101820] font-[600] text-center">
                      {row.paymentRecords}
                    </span>
                  </td>
              
                  <td className="p-3">
                    <span className="block font-[600] bg-[#27AE601A] text-[#27AE60] p-2 pl-2 mr-8 rounded-md">
                      {row.finalRate}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="block font-[600] bg-purple-100 text-purple-800 p-2 pl-2 mr-6 rounded-md">
                      {row.markup}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

       {/**<div className="mt-4 p-4 rounded-b-xl">
          <div className="flex items-center justify-center gap-4">
            <label className="text-gray-700 text-[18px] font-medium">Expiry Date:</label>
            <span className="font-[600]">
              {expiryDate.toLocaleString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>  */} 
        
        <span className="mt-16 mx-24">
          <p className="text-center text-gray-400 text-2xl">
            Confirm you want to proceed with applying these rates to all payment methods?
          </p>
        </span>

        <div className="mt-auto mx-12 flex gap-4 p-4 mb-5">
          <button
            onClick={onClose}
            className="px-6 py-4 text-[18px] w-full font-[600] text-white bg-gray-500 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-6 py-4 text-[18px] w-full font-[600] text-white bg-[#27AE60] rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating Rates...
              </span>
            ) : 'Confirm Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmUpdate;