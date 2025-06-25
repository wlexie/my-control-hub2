import React, { useState, useEffect } from "react";
import Image from 'next/image';
import closeIcon from '../../../../../public/fx/images/close.png';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ConfirmUpdate from './ConfirmUpdate';
import SuccessModal from './SuccessModal';
import api from '../../../../utils/apiService';

const UpdateMarkup = ({ isOpen, onClose, apiResponse, baseCurrency, targetCurrency }) => {
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
          markup: (parseFloat(apiResponse.paybillMarkUp || 0) * 100).toFixed(0),
          finalRate: parseFloat(apiResponse.paybillRateTemp || 0).toFixed(2),
        },
        {
          paymentRecords: "MPESA",
          icon: "/fx/svgs/mpesa.svg",
          tumaRate: parseFloat(apiResponse.mpesaRateTemp || 0).toFixed(2),
          markup: (parseFloat(apiResponse.mpesaMarkUp || 0) * 100).toFixed(0),
          finalRate: parseFloat(apiResponse.mpesaRateTemp || 0).toFixed(2),
        },
        {
          paymentRecords: "Bank",
          icon: "/fx/svgs/Bank.svg",
          tumaRate: parseFloat(apiResponse.bankRateTemp || 0).toFixed(2),
          markup: (parseFloat(apiResponse.bankMarkUp || 0) * 100).toFixed(0),
          finalRate: parseFloat(apiResponse.bankRateTemp || 0).toFixed(2),
        }
      ].map(item => ({
        ...item,
        calculatedMarkup: calculateMarkupPercentage(item.tumaRate, item.finalRate)
      }));

      setData(initialData);

      if (apiResponse.manualExpiry) {
        setManualExpiry(new Date(apiResponse.manualExpiry));
      }
      setDateOfEffect(new Date());
    }
  }, [apiResponse, isOpen]);

  const calculateMarkupPercentage = (tumaRate, finalRate) => {
    if (parseFloat(tumaRate) <= 0) return '0.00';
    const rateDiff = parseFloat(finalRate) - parseFloat(tumaRate);
    return ((rateDiff / parseFloat(tumaRate)) * 100).toFixed(2);
  };

  const handleMarkupChange = (index, value) => {
    const newData = [...data];
    const numericValue = parseFloat(value);
    
    if (value === "" || isNaN(numericValue)) {
      newData[index].markup = value === "" ? "" : newData[index].markup; // Allow temp invalid state
      newData[index].finalRate = "";
      newData[index].calculatedMarkup = "";
      setData(newData);
      return;
    }
    
    newData[index].markup = value;
    const markupDecimal = numericValue / 100;
    const baseRate = parseFloat(newData[index].tumaRate);
    newData[index].finalRate = (baseRate * (1 + markupDecimal)).toFixed(2); // Markup adds to the rate
    newData[index].calculatedMarkup = numericValue.toFixed(2);
    setData(newData);
  };

  const handleFinalRateChange = (index, value) => {
    const newData = [...data];
    const numericValue = parseFloat(value);
    
    if (value === "" || isNaN(numericValue)) {
      newData[index].finalRate = value === "" ? "" : newData[index].finalRate;
      newData[index].markup = "";
      newData[index].calculatedMarkup = "";
      setData(newData);
      return;
    }

    newData[index].finalRate = value;
    const tumaRate = parseFloat(newData[index].tumaRate);
    const calculatedMarkup = calculateMarkupPercentage(tumaRate, numericValue);
    newData[index].markup = calculatedMarkup;
    newData[index].calculatedMarkup = calculatedMarkup;
    setData(newData);
  };

  const prepareApiData = () => {
    const paybillData = data.find(item => item.paymentRecords === "Paybill");
    const mpesaData = data.find(item => item.paymentRecords === "MPESA");
    const bankData = data.find(item => item.paymentRecords === "Bank");

    const formatDate = (date) => date.toISOString().slice(0, 19);

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
      await api.put('/treasury/save-final-rates', null, { params: apiData });
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
      {/* Modal container with overlay */}
      <div
        className={`
          fixed inset-0 flex font-poppins z-50 transition-opacity duration-300
          items-end md:items-start justify-center md:justify-end
          ${isOpen ? "bg-white/5" : "bg-opacity-0 pointer-events-none"}
        `}
        // This onClick will close the modal, which is what we need to prevent from firing
        onClick={onClose}
      >
        
        <div
          onClick={(e) => e.stopPropagation()}
          className={`
            bg-[#F3F5F8] flex flex-col transform transition-transform duration-500 ease-in-out
            w-full h-[90vh] rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)]
            md:h-screen md:w-[760px] md:rounded-t-none md:rounded-l-2xl md:shadow-[-8px_0_30px_rgba(0,0,0,0.1)]
            ${isOpen
              ? 'translate-y-0 md:translate-x-0'
              : 'translate-y-full md:translate-y-0 md:translate-x-full'
            }
          `}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 px-10">
            <h2 className="text-xl font-bold">Update Final Rates</h2>
            <button onClick={onClose} className="p-2 -mr-2">
              <Image src={closeIcon} alt="Close Modal" width={25} height={35} />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-grow overflow-y-auto px-10">
            {/* ... rest of your code is correct ... */}
             <div className="overflow-x-auto rounded-t-xl bg-white mt-4 p-4">
                    <table className="w-full text-left text-gray-700">
                    <thead>
                        <tr className="text-gray-500 font-[300] text-left text-[11px] md:text-[16px]">
                        <th className="p-3">Payment Method</th>
                        <th className="p-3">Base Rate</th>
                        <th className="p-3">Markup (%)</th>
                        <th className="p-3">Final Rate</th>
                        <th className="p-3">Calculated Markup</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                        <tr key={index} className="border-t md:text-[17px] text-[13px] border-gray-200">
                            <td className="p-3 flex items-center gap-3">
                            <span className="p-3 bg-gray-200 my-2 hidden md:block rounded-full">
                                <img src={row.icon} alt={row.paymentRecords} className="w-6  h-6" />
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
                        className="border rounded-md p-2 text-[17px] px-6 w-full max-w-[300px] bg-gray-100"
                        />
                    </div>
                    <div className="flex items-center my-8 gap-4">
                        <label className="text-gray-700 text-[16px] mr-6 font-medium">Expiry Date:</label>
                        <DatePicker
                            selected={manualExpiry}
                            onChange={(date) => setManualExpiry(date)}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="MMMM d, yyyy h:mm aa"
                            className="border rounded-md py-2 px-3 text-[17px] w-full max-w-[400px]"
                            minDate={new Date()}
                            popperPlacement="auto"
                            />
                    </div>
                    </div>
                </div>
          </div>

          {/* Footer */}
          <div className="mt-auto flex gap-4 p-6 px-10">
            <button
              onClick={onClose}
              className="px-6 py-4 text-[18px] w-full font-[600] text-white bg-gray-500 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isLoading}
              className="md:px-6 md:py-4 px-2 py-2 md:text-[18px] text-[16px] w-full font-[600] text-white bg-[#27AE60] rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70"
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