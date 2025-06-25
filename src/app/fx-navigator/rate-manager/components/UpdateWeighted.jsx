import React, { useState, useEffect } from "react";
import Image from 'next/image';
import closeIcon from '../../../../../public/fx/images/close.png';
import UpdateMarkup from './UpdateMarkup';
import api from '../../../../utils/apiService';

// Helper function to create the initial data structure
const createInitialData = (apiResponse) => {
  if (!apiResponse) return [];
  return [
    { 
      paymentRecords: "Paybill", 
      icon: "/fx/svgs/paybill.svg", 
      tumaRate: parseFloat(apiResponse.paybillRateTemp || 0).toFixed(2),
      weightedAvg: parseFloat(apiResponse.paybillWeightedAvg || 0).toFixed(2),
    },
    { 
      paymentRecords: "MPESA", 
      icon: "/fx/svgs/mpesa.svg", 
      tumaRate: parseFloat(apiResponse.mpesaRateTemp || 0).toFixed(2),
      weightedAvg: parseFloat(apiResponse.mpesaWeightedAvg || 0).toFixed(2),
    },
    { 
      paymentRecords: "Bank", 
      icon: "/fx/svgs/Bank.svg", 
      tumaRate: parseFloat(apiResponse.bankRateTemp || 0).toFixed(2),
      weightedAvg: parseFloat(apiResponse.bankWeightedAvg || 0).toFixed(2),
    }
  ];
};

const UpdateWeighted = ({ 
  isOpen, 
  onClose, 
  apiResponse,
  baseCurrency,
  targetCurrency
}) => {
  const [editingWeightedAvg, setEditingWeightedAvg] = useState(false);
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMarkupModal, setShowMarkupModal] = useState(false);
  const [markupApiResponse, setMarkupApiResponse] = useState(null);

  useEffect(() => {
    if (apiResponse) {
      const initialData = createInitialData(apiResponse);
      setData(initialData);
      setOriginalData(initialData);
    }
  }, [isOpen, apiResponse]);

  const handleWeightedAvgChange = (index, value) => {
    if (value === "" || value === ".") {
      const newData = [...data];
      newData[index].weightedAvg = value;
      setData(newData);
      return;
    }
    if (/^(\d+)?([.]?\d{0,4})?$/.test(value)) {
      const newData = [...data];
      newData[index].weightedAvg = value;
      setData(newData);
    }
  };

  const updateWeightedAverages = async () => {
    setIsLoading(true);
    try {
      const hasInvalidValues = data.some(item => isNaN(parseFloat(item.weightedAvg)) || item.weightedAvg === "");
      if (hasInvalidValues) {
        throw new Error('Please enter valid numbers for all weighted averages');
      }
      const paybillWeightedAverage = parseFloat(data.find(item => item.paymentRecords === "Paybill").weightedAvg);
      const mpesaWeightedAverage = parseFloat(data.find(item => item.paymentRecords === "MPESA").weightedAvg);
      const bankWeightedAverage = parseFloat(data.find(item => item.paymentRecords === "Bank").weightedAvg);
      const response = await api.put('/treasury/apply-transaction-fees', null, {
        params: {
          baseCurrency: baseCurrency.code,
          targetCurrency: targetCurrency.code,
          mpesaWeightedAverage,
          paybillWeightedAverage,
          bankWeightedAverage
        }
      });
      if (response.data && response.data.data) {
        setMarkupApiResponse(response.data);
        setShowMarkupModal(true);
        setEditingWeightedAvg(false);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Error updating weighted averages:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseMarkupModal = () => {
    setShowMarkupModal(false);
    onClose();
  };
  
  // Conditionally render nothing if the parent says it's not open.
  // This helps with mounting/unmounting animations.
  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* 
        MODAL OVERLAY
        - items-end: Aligns modal to the bottom on mobile.
        - md:items-center / md:justify-end: Resets to center-vertical, right-horizontal on desktop.
      */}
      <div 
        className="fixed inset-0 flex items-end font-poppins justify-center bg-black/30 z-50 md:items-center md:justify-end"
        onClick={onClose} // Close when clicking the overlay
      >
        {/* 
          MODAL CONTENT
          Handles the animation, responsive sizing, and stops click propagation.
        */}
        <div 
          className={`
            bg-[#F3F5F8] flex flex-col shadow-lg
            
            // --- MOBILE STYLES (DEFAULT) ---
            w-full h-[90vh] rounded-t-2xl p-4
            
            // --- DESKTOP STYLES (OVERRIDE) ---
            md:w-[740px] md:h-screen md:rounded-lg md:rounded-r-none md:p-6 md:px-10
            
            // --- ANIMATION STYLES ---
            transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-y-0' : 'translate-y-full'}
            md:translate-y-0 // Ensure no transform is applied on desktop
          `}
          onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the modal
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Update Weighted Averages</h2>
            <button className="p-2" onClick={onClose}>
              <Image src={closeIcon} alt="Close Modal" width={20} height={20} />
            </button>
          </div>

          {/* Added flex-grow and overflow-y-auto to make the content scrollable on smaller screens */}
          <div className="flex-grow overflow-y-auto rounded-t-xl bg-white p-4">
            <table className="w-full text-left text-gray-700">
              <thead>
                <tr className="text-gray-500 font-[300] text-left text-sm md:text-[16px]">
                  <th className="p-2 md:p-3">Payment Records</th>
                  <th className="p-2 md:p-3">Tuma Rate at Cost</th>
                  <th className="p-2 md:p-3">Weighted Average</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index} className="border-t text-[15px] md:text-[17px] border-gray-200">
                    <td className="p-2 md:p-3 flex items-center gap-3">
                      <span className="p-2 md:p-3 bg-gray-200 my-2 rounded-full">
                        <img src={row.icon} alt={row.paymentRecords} className="w-5 h-5 md:w-6 md:h-6" />
                      </span>
                      <span className="text-[#101820] font-[600] text-center">
                        {row.paymentRecords}
                      </span>
                    </td>
                    <td className="p-2 md:p-3">
                      <span className="block font-[600] bg-[#CD11261A] text-[#CD1126] p-2 rounded-md text-center md:text-left">
                        {row.tumaRate}
                      </span>
                    </td>
                    <td className="p-2 md:p-3">
                      {editingWeightedAvg ? (
                        <input
                          type="text"
                          inputMode="decimal"
                          className="block font-[600] bg-green-100 p-2 rounded-md w-24"
                          value={row.weightedAvg}
                          onChange={(e) => handleWeightedAvgChange(index, e.target.value)}
                          onFocus={(e) => e.target.select()}
                          onBlur={() => {
                            const newData = [...data];
                            const numValue = parseFloat(newData[index].weightedAvg);
                            newData[index].weightedAvg = !isNaN(numValue) ? numValue.toFixed(2) : "0.00";
                            setData(newData);
                          }}
                        />
                      ) : (
                        <span className="block font-[600] bg-green-100 p-2 rounded-md text-center md:text-left">
                          {row.weightedAvg}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-auto flex gap-4 p-4 mb-5 border-t border-gray-200 bg-[#F3F5F8]">
            {!editingWeightedAvg ? (
              <button
                onClick={() => setEditingWeightedAvg(true)}
                className="px-6 py-3 text-base md:text-[18px] w-full font-[600] text-white bg-[#276EF1] rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Weighted Averages
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setData(originalData);
                    setEditingWeightedAvg(false);
                  }}
                  className="px-6 py-3 text-base md:text-[18px] mt-16 md:mt-0 w-full font-[600] text-gray-700 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={updateWeightedAverages}
                  disabled={isLoading}
                  className="md:px-6 md:py-3 p-2 text-base md:text-[18px] mt-16 md:mt-0 w-full font-[600] text-white bg-[#276EF1]
                   rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                >
                  {isLoading ? 'Updating...' : 'Update Weighted Averages'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showMarkupModal && (
        <UpdateMarkup 
          isOpen={showMarkupModal} 
          onClose={handleCloseMarkupModal} 
          apiResponse={markupApiResponse.data}
          baseCurrency={baseCurrency}
          targetCurrency={targetCurrency}
        />
      )}
    </>
  );
};

export default UpdateWeighted;