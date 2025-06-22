import React from "react";
import Image from 'next/image';
import closeIcon from '../../../../../public/fx/images/close.png';
import successIcon from '../../../../../public/fx/images/success.png';

const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center font-poppins justify-end bg-opacity-30 z-50">
      <div className="bg-white p-6 w-[760px] px-10 h-screen rounded-lg shadow-lg flex flex-col items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <Image 
            src={successIcon} 
            alt="Success" 
            width={80} 
            height={80} 
            className="mb-6"
          />
          <h2 className="text-2xl font-bold mb-2">Success!</h2>
          <p className="text-3xl mx-36 my-8 text-gray-500">Tuma markups successfully uploaded</p>
          <button
            onClick={onClose}
            className="px-8 py-3 text-lg font-[600] text-white bg-[#27AE60] rounded-lg hover:bg-green-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;