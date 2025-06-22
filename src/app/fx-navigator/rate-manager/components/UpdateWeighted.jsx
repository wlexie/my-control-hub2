import React, { useState, useEffect } from "react";
import Image from 'next/image';
import closeIcon from '../../../../../public/fx/images/close.png';
import UpdateMarkup from './UpdateMarkup';
import api from '../../../../utils/apiService';

const UpdateWeighted = ({ 
  isOpen, 
  onClose, 
  apiResponse,
  baseCurrency,
  targetCurrency
}) => {
  const [editingWeightedAvg, setEditingWeightedAvg] = useState(false);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMarkupModal, setShowMarkupModal] = useState(false);
  const [markupApiResponse, setMarkupApiResponse] = useState(null);

  useEffect(() => {
    if (isOpen && apiResponse) {
      const initialData = [
        { 
          paymentRecords: "Paybill", 
          icon: "/fx/svgs/paybill.svg", 
          tumaRate: parseFloat(apiResponse.paybillRateTemp || 0).toFixed(2),
          weightedAvg: parseFloat(apiResponse.paybillWeightedAvg || 0).toFixed(2), // Changed to show as decimal
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
      setData(initialData);
    }
  }, [isOpen, apiResponse]);

  const handleWeightedAvgChange = (index, value) => {
    // Allow empty string or decimal input
    if (value === "" || value === ".") {
      const newData = [...data];
      newData[index].weightedAvg = value;
      setData(newData);
      return;
    }

    // Check if the value is a valid number format
    if (/^(\d+)?([.]?\d{0,4})?$/.test(value)) {
      const newData = [...data];
      newData[index].weightedAvg = value;
      setData(newData);
    }
  };

  const updateWeightedAverages = async () => {
    setIsLoading(true);
    try {
      // Validate all fields have valid numbers
      const hasInvalidValues = data.some(item => 
        isNaN(parseFloat(item.weightedAvg)) || item.weightedAvg === ""
      );
      
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
          mpesaWeightedAverage: mpesaWeightedAverage,
          paybillWeightedAverage: paybillWeightedAverage,
          bankWeightedAverage: bankWeightedAverage
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

  return (
    <>
      <div className="fixed inset-0 flex items-center font-poppins justify-end bg-black/30 bg-opacity-0 z-50">
        <div className="bg-[#F3F5F8] p-6 w-[740px] px-10 h-screen rounded-lg shadow-lg flex flex-col">
          <div className="flex justify-between">
            <span className="flex flex-col">
              <h2 className="text-xl font-bold mb-4">Update Weighted Averages</h2>
            </span>
            <button className="absolute top-3 right-3" onClick={onClose}>
              <Image src={closeIcon} alt="Close Modal" width={25} height={35} />
            </button>
          </div>

          <div className="overflow-x-auto rounded-t-xl bg-white mt-4 p-4">
            <table className="w-full text-left text-gray-700">
              <thead>
                <tr className="text-gray-500 font-[300] text-left text-[16px]">
                  <th className="p-3">Payment Records</th>
                  <th className="p-3">Tuma Rate at Cost</th>
                  <th className="p-3">Weighted Average</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index} className="border-t text-[17px] border-gray-200">
                    <td className="p-3 flex items-center gap-3">
                      <span className="p-3 bg-gray-200 my-2 rounded-full">
                        <img src={row.icon} alt={row.paymentRecords} className="w-6 h-6" />
                      </span>
                      <span className="text-[#101820] font-[600] text-center">
                        {row.paymentRecords}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="block font-[600] bg-[#CD11261A] text-[#CD1126] p-2 pl-2 mr-8 rounded-md">
                        {row.tumaRate}
                      </span>
                    </td>
                    <td className="p-3">
                      {editingWeightedAvg ? (
                        <input
                          type="text"
                          inputMode="decimal"
                          className="block font-[600] bg-green-100 p-2 pl-2 mr-10 rounded-md w-24"
                          value={row.weightedAvg}
                          onChange={(e) => handleWeightedAvgChange(index, e.target.value)}
                          onFocus={(e) => e.target.select()}
                          onBlur={() => {
                            const newData = [...data];
                            const numValue = parseFloat(newData[index].weightedAvg);
                            if (!isNaN(numValue)) {
                              newData[index].weightedAvg = numValue.toFixed(2);
                            } else {
                              newData[index].weightedAvg = "0.00";
                            }
                            setData(newData);
                          }}
                        />
                      ) : (
                        <span className="block font-[600] bg-green-100 p-2 pl-2 mr-10 rounded-md">
                          {row.weightedAvg} {/* Removed the % symbol */}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-auto flex gap-4 p-4 mb-5">
            {!editingWeightedAvg ? (
              <button
                onClick={() => setEditingWeightedAvg(true)}
                className="px-6 py-4 text-[18px] w-full font-[600] text-white bg-[#276EF1] rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Weighted Averages
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    if (isOpen && apiResponse) {
                      const initialData = [
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
                      setData(initialData);
                    }
                    setEditingWeightedAvg(false);
                  }}
                  className="px-6 py-4 text-[18px] w-full font-[600] text-white bg-gray-500 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={updateWeightedAverages}
                  disabled={isLoading}
                  className="px-6 py-4 text-[18px] w-full font-[600] text-white bg-[#276EF1] rounded-lg hover:bg-blue-700 transition-colors"
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