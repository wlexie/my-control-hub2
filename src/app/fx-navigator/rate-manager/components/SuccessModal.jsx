import React from "react";
import Image from 'next/image';
// Note: You don't need the closeIcon for this specific modal, but keeping the import is fine.
import closeIcon from '../../../../../public/fx/images/close.png'; 
import successIcon from '../../../../../public/fx/images/success.png';

const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    // MODAL OVERLAY
    // Aligns content to the bottom on mobile (items-end) and center on desktop (md:items-center)
    <div 
      className="fixed inset-0 flex items-end justify-center md:items-center md:justify-end font-poppins  bg-opacity-40 z-50"
      onClick={onClose} // Close the modal when clicking the backdrop
    >
      {/* MODAL CONTENT PANEL */}
      <div 
        onClick={(e) => e.stopPropagation()} // Stop clicks inside the modal from closing it
        className={`
          bg-white flex flex-col items-center justify-center
          transform transition-transform duration-300 ease-in-out
          
          // --- MOBILE STYLES (Bottom Sheet) ---
          w-full h-[90vh] p-6 rounded-t-2xl shadow-lg
          
          // --- DESKTOP STYLES (Side Panel) ---
          md:w-[760px] md:h-screen md:px-10 md:rounded-lg md:rounded-t-none
          
          // --- ANIMATION ---
          // Slides up from the bottom on mobile, no vertical slide on desktop
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
          md:translate-y-0
        `}
      >
        <div className="flex flex-col items-center text-center">
          <Image 
            src={successIcon} 
            alt="Success" 
            width={80} 
            height={80} 
            className="mb-6"
          />
          <h2 className="text-2xl font-bold mb-2">Success!</h2>
          
          {/* Made margins and font size responsive for better viewing on small screens */}
          <p className="text-xl md:text-3xl text-gray-500 my-8 mx-4 md:mx-16">
            Tuma markups successfully uploaded
          </p>
          
          <button
            onClick={onClose}
            className="px-8 py-3 text-lg font-semibold text-white bg-[#27AE60] rounded-lg hover:bg-green-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;