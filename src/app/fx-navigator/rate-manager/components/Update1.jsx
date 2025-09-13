"use client";

import { useEffect, useState } from "react";
import Image from 'next/image';
import api from "../../../../utils/apiService"; // Your actual API service
import UpdateWeighted from './UpdateWeighted'; // Your actual success modal

// Assuming this is the path to your close icon
const closeIcon = '/fx/images/close.png';

// --- Main Update1 Component ---

const Update1 = ({ 
  isOpen, 
  onClose, 
  rateValue, 
  onRateChange,
  baseCurrency,
  targetCurrency,
  getFlagUrl // This function is passed down as a prop
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  
  // State to control the enter animation
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);

  // Effect to trigger the animation
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsAnimatingIn(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimatingIn(false);
    }
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  //
  // --- THIS IS YOUR ORIGINAL API CALL LOGIC, FULLY RESTORED ---
  //
  const handleSetNewRate = async () => {
    setIsLoading(true);
    try {
      const response = await api.put('/treasury/new-interbank-rate', null, {
        params: {
          baseCurrency: baseCurrency.code,
          targetCurrency: targetCurrency.code,
          interbankRate: rateValue,
          markUp: 0,
          weightedAverage: 0
        }
      });

      if (response.status === 200) {
        setApiResponse(response.data);
        setShowSuccessModal(true);
        console.log('API Response Data:', response.data);
      } else {
        alert('Failed to update rate. Please try again.');
      }
    } catch (error) {
      console.error('Error updating rate:', error);
      alert('An error occurred while updating the rate.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    onClose(); // Close the main Update1 modal as well
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with opacity transition */}
      <div
        className={`fixed inset-0 flex font-poppins bg-black/40 z-50 transition-opacity duration-300
          ${isAnimatingIn ? 'opacity-100' : 'opacity-0'}
          items-end md:items-center md:justify-end`}
        onClick={onClose}
      >
        {/* Modal Panel with responsive transforms and styling */}
        <div
          className={`bg-[#F3F5F8] shadow-lg transform transition-transform duration-300 ease-out
            w-full h-[90vh] rounded-t-2xl 
            md:w-[740px] md:h-screen md:rounded-t-none md:rounded-l-lg
            ${isAnimatingIn ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full'}`}
          onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing the modal
        >
          {/* Scrollable Content Wrapper */}
          <div className="flex flex-col h-full p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">Tuma App Rates</h2>
                <p className="text-gray-500 text-base font-medium">
                  Current Rate: 1 {baseCurrency?.code} = {rateValue} {targetCurrency?.code}
                </p>
              </div>
              <button className="p-1 -mt-2 -mr-2" onClick={onClose}>
                <Image src={closeIcon} alt="Close Modal" width={30} height={35} />
              </button>
            </div>

            {/* Rate Input Section */}
            <div className="bg-white rounded-xl items-center flex flex-wrap justify-center gap-2 p-4">
                <p className="text-base font-bold mr-4 w-full md:w-auto text-center md:text-left">Current Bank Rate</p>
                {/* Base Currency */}
                <span className="border items-center flex rounded-lg p-1 md:p-2">
                    <h1 className="px-2 text-lg font-semibold">1</h1>
                    <span className="px-2 rounded-lg flex items-center md:gap-1 md:gap-2 py-1 bg-[#F3F5F8]">
                        <Image src={getFlagUrl(baseCurrency?.country)} alt={baseCurrency?.code || 'flag'} width={24} height={16} className="rounded-sm w-[18px] md:w-[24px] mr-1" />
                        <p className="text-base font-medium">{baseCurrency?.code}</p>
                    </span>
                </span>
                <p className="md:mx-2 text-gray-800 text-2xl font-semibold">=</p>
                {/* Target Currency */}
                <span className="border items-center flex rounded-lg p-1 md:p-2">
<input type="number" value={rateValue || ''} onChange={onRateChange} className="font-semibold text-lg md:w-24 w-15 pl-2 outline-none" />                    <span className="bg-[#F3F5F8] rounded-lg flex items-center mx-2 px-2 py-1  md:gap-2">
                        <Image src={getFlagUrl(targetCurrency?.country)} alt={targetCurrency?.code || 'flag'} width={24} height={16} className="rounded-sm md:w-[24px] mr-1 w-[18px]" />           
                        <p className="text-base font-medium">{targetCurrency?.code}</p>          
                    </span>
                </span>
            </div>

            {/* Footer Buttons */}
            <div className="mt-auto flex flex-col md:flex-row gap-4 pt-6">
              {isLoading ? (
                <div className="flex justify-center items-center w-full py-3"><div className="dots-spinner"></div></div>
              ) : (
                <>
                  <button onClick={onClose} className="w-full md:w-1/2 py-3 text-base font-semibold text-[#276EF1] border-[#276EF1] border rounded-lg hover:bg-blue-50 transition">
                    Cancel
                  </button>
                  <button onClick={handleSetNewRate} className="w-full md:w-1/2 py-3 text-base font-semibold text-white bg-[#276EF1] rounded-lg hover:bg-blue-700 transition">
                    Set New Rate
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Success Modal */}
      {apiResponse && (
        <UpdateWeighted 
          isOpen={showSuccessModal}
          onClose={handleCloseSuccessModal}
          apiResponse={apiResponse.data} // Passing apiResponse.data as in your original
          baseCurrency={baseCurrency}
          targetCurrency={targetCurrency}
        />
      )}

      {/* Spinner Styles from your original code */}
      <style jsx>{`
        .dots-spinner {
          display: inline-block;
          position: relative;
          width: 80px;
          height: 80px;
        }
        .dot {
          position: absolute;
          top: 33px;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: #276EF1;
          animation-timing-function: cubic-bezier(0, 1, 1, 0);
        }
        .dot:nth-child(1) {
          left: 8px;
          animation: dots-spinner1 0.6s infinite;
        }
        .dot:nth-child(2) {
          left: 8px;
          animation: dots-spinner2 0.6s infinite;
        }
        .dot:nth-child(3) {
          left: 32px;
          animation: dots-spinner2 0.6s infinite;
        }
        .dot:nth-child(4) {
          left: 56px;
          animation: dots-spinner3 0.6s infinite;
        }
        @keyframes dots-spinner1 {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }
        @keyframes dots-spinner2 {
          0% { transform: translate(0, 0); }
          100% { transform: translate(24px, 0); }
        }
        @keyframes dots-spinner3 {
          0% { transform: scale(1); }
          100% { transform: scale(0); }
        }
      `}</style>
    </>
  );
};

export default Update1;