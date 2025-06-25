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
    // MODAL OVERLAY:
    // Aligns content to the bottom on mobile (items-end) and to the right on desktop (md:justify-end).
    <div 
      className="fixed inset-0 flex items-end justify-center md:items-center md:justify-end font-poppins bg-black/10 bg-opacity-40 z-50"
      onClick={onClose} // Close modal on backdrop click
    >
      {/* MODAL CONTENT PANEL: */}
      <div
        // Stop clicks inside the modal from closing it
        onClick={(e) => e.stopPropagation()} 
        className={`
          bg-white flex flex-col transform transition-transform duration-300 ease-in-out
          
          // --- MOBILE STYLES (Bottom Sheet) ---
          w-full h-[90vh] rounded-t-2xl shadow-lg
          
          // --- DESKTOP STYLES (Side Panel) ---
          md:w-[760px] md:h-screen md:max-h-full md:rounded-l-2xl md:rounded-t-none
          
          // --- ANIMATION ---
          // Slides up from bottom on mobile, no vertical slide on desktop
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
          md:translate-y-0 
        `}
      >
        {/* HEADER: A flexible header is better for responsiveness than absolute positioning */}
        <div className="flex justify-between items-center p-4 border-b md:p-6 md:px-10 md:border-b-0">
          <h2 className="text-xl md:text-2xl text-gray-700 font-bold">Confirm Changes</h2>
          <button onClick={onClose} className="p-2">
            <Image src={closeIcon} alt="Close Modal" width={20} height={20} />
          </button>
        </div>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-grow overflow-y-auto p-4 md:px-10">
          <div className="overflow-x-auto rounded-xl bg-gray-50/50 p-2 md:p-4">
            <table className="w-full text-left text-gray-700">
              <thead>
                <tr className="text-gray-500 font-normal text-sm md:text-base">
                  <th className="p-3">Payment Method</th>
                  <th className="p-3">Final Rate</th>
                  <th className="p-3">Markup (%)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index} className="text-sm md:text-base border-t border-gray-200">
                    <td className="p-3 flex items-center gap-3">
                      <span className="p-2 bg-gray-200 my-1 rounded-full md:p-3">
                        <img src={row.icon} alt={row.paymentRecords} className="w-5 h-5 md:w-6 md:h-6" />
                      </span>
                      <span className="text-[#101820] font-semibold text-center">
                        {row.paymentRecords}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="block font-semibold bg-[#27AE601A] text-[#27AE60] p-2 rounded-md">
                        {row.finalRate}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="block font-semibold bg-purple-100 text-purple-800 p-2 rounded-md">
                        {row.markup}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center my-8 md:my-12 px-2 md:px-12">
            <p className="text-gray-500 text-base md:text-xl">
              Are you sure you want to proceed with applying these rates to all payment methods?
            </p>
          </div>
        </div>
        
        {/* FOOTER: Buttons stick to the bottom */}
        <div className="mt-auto flex gap-4 p-4 border-t md:p-6 md:px-10">
          <button
            onClick={onClose}
            className="px-6 py-3 text-base md:text-lg w-full font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-6 py-3 text-base md:text-lg w-full font-semibold text-white bg-[#27AE60] rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
            ) : 'Confirm Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmUpdate;