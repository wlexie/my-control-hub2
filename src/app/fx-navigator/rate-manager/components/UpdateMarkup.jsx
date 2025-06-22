import React, { useState, useEffect } from "react";
import Image from 'next/image';
import closeIcon from '../../../../../public/fx/images/close.png';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ConfirmUpdate from './ConfirmUpdate';
import SuccessModal from './SuccessModal';
import api from '../../../../utils/apiService'; // Import the api instance

const UpdateMarkup = ({ isOpen, onClose,   apiResponse, baseCurrency, targetCurrency }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [manualExpiry, setManualExpiry] = useState(new Date());
  const [dateOfEffect, setDateOfEffect] = useState(new Date());
  const [editingFinalRate, setEditingFinalRate] = useState(null);
  const [editingMarkup, setEditingMarkup] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (apiResponse && isOpen) {
      const initialData = [
        { 
          paymentRecords: "Paybill", 
          icon: "/fx/svgs/paybill.svg", 
          tumaRate: parseFloat(apiResponse.paybillRateTemp || 0).toFixed(2),
          markup: (parseFloat(apiResponse.paybillMarkUp) * 100).toFixed(0),
          finalRate: parseFloat(apiResponse.paybillRateTemp || 0).toFixed(2),
          calculatedMarkup: 0
        },
        { 
          paymentRecords: "MPESA", 
          icon: "/fx/svgs/mpesa.svg", 
          tumaRate: parseFloat(apiResponse.mpesaRateTemp || 0).toFixed(2),
          markup: (parseFloat(apiResponse.mpesaMarkUp) * 100).toFixed(0),
          finalRate: parseFloat(apiResponse.mpesaRateTemp || 0).toFixed(2),
          calculatedMarkup: 0
        },
        { 
          paymentRecords: "Bank", 
          icon: "/fx/svgs/Bank.svg", 
          tumaRate: parseFloat(apiResponse.bankRateTemp || 0).toFixed(2),
          markup: (parseFloat(apiResponse.bankMarkUp) * 100).toFixed(0),
          finalRate: parseFloat(apiResponse.bankRateTemp || 0).toFixed(2),
          calculatedMarkup: 0
        }
      ];
      
      const updatedData = initialData.map(item => ({
        ...item,
        calculatedMarkup: calculateMarkupPercentage(item.tumaRate, item.finalRate)
      }));
      
      setData(updatedData);
      
      if (apiResponse.manualExpiry) {
        setManualExpiry(new Date(apiResponse.manualExpiry));
      }
      
      const now = new Date();
      setDateOfEffect(now);
    }
  }, [apiResponse, isOpen]);

  const calculateMarkupPercentage = (tumaRate, finalRate) => {
    const rateDiff = parseFloat(tumaRate) - parseFloat(finalRate);
    return ((rateDiff / parseFloat(tumaRate)) * 100).toFixed(2);
  };

  const handleMarkupChange = (index, value) => {
    const newData = [...data];
  
    if (value === "") {
      // Clear all editable values for this row
      newData[index].markup = "";
      newData[index].finalRate = "";
      newData[index].calculatedMarkup = "";
      setData(newData);
      return;
    }
  
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return;
  
    newData[index].markup = value;
    const markupDecimal = numericValue / 100;
    const baseRate = parseFloat(newData[index].tumaRate);
    newData[index].finalRate = (baseRate * (1 - markupDecimal)).toFixed(2);
    newData[index].calculatedMarkup = numericValue.toFixed(2);
  
    setData(newData);
  };
  
  

  const handleFinalRateChange = (index, value) => {
    const newData = [...data];
  
    if (value === "") {
      // Clear all editable values for this row
      newData[index].finalRate = "";
      newData[index].markup = "";
      newData[index].calculatedMarkup = "";
      setData(newData);
      return;
    }
  
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return;
  
    newData[index].finalRate = numericValue;
  
    const tumaRate = parseFloat(newData[index].tumaRate);
    const calculatedMarkup = calculateMarkupPercentage(tumaRate, numericValue);
    newData[index].calculatedMarkup = calculatedMarkup;
    newData[index].markup = calculatedMarkup;
  
    setData(newData);
  };
  
  const prepareApiData = () => {
    const paybillData = data.find(item => item.paymentRecords === "Paybill");
    const mpesaData = data.find(item => item.paymentRecords === "MPESA");
    const bankData = data.find(item => item.paymentRecords === "Bank");
  
    const formatDate = (date) => {
      const pad = (num) => num.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };
  
    return {
      baseCurrency: baseCurrency.code, 
      targetCurrency: targetCurrency.code,
      paybillRate: paybillData.finalRate,
      paybillMarkUp: parseFloat(paybillData.markup) / 100,
      mpesaRate: mpesaData.finalRate,
      mpesaMarkUp: parseFloat(mpesaData.markup) / 100,
      bankRate: bankData.finalRate,
      bankMarkUp: parseFloat(bankData.markup) / 100,
      manualExpiry: formatDate(manualExpiry),
      dateOfEffect: formatDate(dateOfEffect)
    };
  };
  
  const handleConfirmUpdate = async () => {
    setIsLoading(true);
    try {
      const apiData = prepareApiData();
      
      console.log('Data being sent to API:', apiData);
      
      // Using the api middleware with query parameters
      await api.put('/treasury/save-final-rates', null, {
        params: apiData
      });
      
      setShowSuccessModal(true); 
      setShowConfirmModal(false);
    } catch (error) {
      console.error('Failed to save rates:', error);
      alert(`Failed to save rates: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

    
  
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 flex items-center font-poppins justify-end  bg-opacity-0 z-50">
        <div className="bg-[#F3F5F8] p-6 w-[760px] px-10 h-screen rounded-lg shadow-lg flex flex-col">
          <div className="flex justify-between">
            <span className="flex flex-col">
              <h2 className="text-xl font-bold mb-4">Update Final Rates</h2>
            </span>
            <button className="absolute top-3 right-3" onClick={onClose}>
              <Image src={closeIcon} alt="Close Modal" width={25} height={35} />
            </button>
          </div>

          <div className="overflow-x-auto rounded-t-xl bg-white mt-4 p-4">
            <table className="w-full text-left text-gray-700">
              <thead>
                <tr className="text-gray-500 font-[300] text-left text-[16px]">
                  <th className="p-3">Payment Method</th>
                  <th className="p-3">Base Rate</th>
                  <th className="p-3">Markup (%)</th>
                  <th className="p-3">Final Rate</th>
                  <th className="p-3">Calculated Markup</th>
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
                      {editingMarkup === index ? (
                        <input
                          type="number"
                          step="0.01"
                          className="block font-[600] text-[16px] bg-yellow-100 p-2 pl-2 mr-6 rounded-md w-24"
                          value={row.markup}
                          onChange={(e) => handleMarkupChange(index, e.target.value)}
                          onBlur={() => setEditingMarkup(null)}
                          autoFocus
                        />
                      ) : (
                        <span 
                          className="block font-[600] bg-yellow-100 p-2 pl-2 mr-6 rounded-md cursor-pointer"
                          onClick={() => setEditingMarkup(index)}
                        >
                          {row.markup}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {editingFinalRate === index ? (
                        <input
                          type="number"
                          step="0.01"
                          className="block font-[600] bg-[#27AE601A] p-2 pl-2 mr-8 rounded-md w-24"
                          value={row.finalRate}
                          onChange={(e) => handleFinalRateChange(index, e.target.value)}
                          onBlur={() => setEditingFinalRate(null)}
                          autoFocus
                        />
                      ) : (
                        <span 
                          className="block font-[600] bg-[#27AE601A] text-[#27AE60] p-2 pl-2 mr-8 rounded-md cursor-pointer"
                          onClick={() => setEditingFinalRate(index)}
                        >
                          {row.finalRate}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="block font-[600] bg-purple-100 text-purple-800 p-2 pl-2 mr-6 rounded-md">
                        {row.calculatedMarkup}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-white rounded-b-xl">
            <div className="flex flex-col gap-4">
              <div className="flex items-center mt-8 gap-4">
                <label className="text-gray-700 text-[16px] font-medium">Date of Effect:</label>
                <input
                  type="text"
                  readOnly
                  value={dateOfEffect.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                  })}
                  className="border rounded-md p-2 text-[17px] px-6 w-[300px] bg-gray-100"
                />
              </div>
              <div className="flex items-center my-8 gap-4">
                <label className="text-gray-700 text-[16px] mr-6 font-medium">Expiry Date:</label>
                <DatePicker
                    selected={manualExpiry}
                    onChange={(date) => {
                        setManualExpiry(date);
                    }}
                    showTimeSelect
                    timeFormat="HH:mm:ss"
                    timeIntervals={1}
                    dateFormat="MMMM d, yyyy h:mm:ss aa"
                    className="border rounded-md py-2 text-[17px] w-full max-w-[400px]"
                    minDate={new Date()}
                    popperPlacement="auto"
                    />
              </div>
            </div>
          </div>

          <div className="mt-auto flex gap-4 p-4 mb-5">
            <button
              onClick={onClose}
              className="px-6 py-4 text-[18px] w-full font-[600] text-white bg-gray-500 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isLoading}
              className="px-6 py-4 text-[18px] w-full font-[600] text-white bg-[#27AE60] rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70"
            >
              Save Final Rates
            </button>
          </div>
        </div>
      </div>

      <ConfirmUpdate 
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmUpdate}
        data={data}
        expiryDate={manualExpiry}
        isLoading={isLoading}
      />
      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
      />
    </>
  );
};

export default UpdateMarkup;