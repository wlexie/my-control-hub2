import { useEffect, useState } from "react";
import Image from 'next/image';
import closeIcon from '../../../../../public/fx/images/close.png';
import api from "../../../../utils/apiService"; 
import UpdateWeighted from './UpdateWeighted';

const Update1 = ({ 
  isOpen, 
  onClose, 
  rateValue, 
  onRateChange,
  baseCurrency,
  targetCurrency,
  getFlagUrl
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 flex items-center font-poppins justify-end bg-black/20 bg-opacity-0 z-50">
        <div className="bg-[#F3F5F8] p-6 w-[740px] px-10 h-screen rounded-lg shadow-lg flex flex-col">
          {/* Header */}
          <div className="flex justify-between">
            <span className="flex flex-col">
              <h2 className="text-xl font-bold mb-4">Tuma App Rates</h2>
              <p className="text-gray-500 text-[18px] mb-8 font-[500]">
                Current Rate: 1 {baseCurrency?.code} = {rateValue} {targetCurrency?.code}
              </p>
            </span>

            <button className="absolute top-3 right-3" onClick={onClose}>
              <Image src={closeIcon} alt="Close Modal" width={40} height={35} />
            </button>
          </div>

          {/* Rate Input Section */}
          <div className="bg-white rounded-xl items-center flex px-2 p-5">
            <p className="text-[18px] font-[700] mr-4">Current Bank Rate</p>
            <span className="border items-center flex rounded-lg px-3 py-2 max-w-[350px]">
              <h1 className="pr-4 mr-2 text-[20px] font-semibold">1</h1>
              <span className="px-2 rounded-lg flex gap-3 py-1 bg-[#F3F5F8]">
                <Image 
                  src={getFlagUrl(baseCurrency.country)} 
                  alt={baseCurrency.code} 
                  width={30} 
                  height={16} 
                  className="py-1 rounded-md"
                />
                <p className="ml-1 mr-2 text-[17px] font-500">{baseCurrency.code}</p>
                <Image src="/fx/svgs/arrow.svg" alt="Arrow" width={16} height={20} className="mr-1" />
              </span>
            </span>
            <p className="mx-5 text-gray-800 text-[24px] font-[600]">=</p>
            <span className="border items-center flex rounded-lg py-2 max-w-[350px]">
              <input
                type="text"
                value={rateValue}
                onChange={onRateChange}
                className="font-[600] text-[20px] w-[100px] pl-3 font-500 outline-none"
              />
              <span className="bg-[#F3F5F8] rounded-lg flex mx-2 px-2 py-1">
                <Image 
                  src={getFlagUrl(targetCurrency.country)} 
                  alt={targetCurrency.code} 
                  width={35} 
                  height={20} 
                  className="py-1 rounded-md"
                />           
                <p className="mx-5 text-[17px] font-500">{targetCurrency.code}</p>          
                <Image src="/fx/svgs/arrow.svg" alt="Arrow" width={16} height={20} className="mr-2" />
              </span>
            </span>
          </div>

          {/* Footer Buttons */}
          <div className="mt-auto flex justify-between gap-4 p-4 mb-5">
            {isLoading ? (
              <div className="flex justify-center items-center w-full">
                <div className="dots-spinner">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-28 py-3 text-[16px] font-[600] text-[#276EF1] border-[#276EF1] border rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetNewRate}
                  className="px-24 py-3 text-[16px] font-[600] text-white bg-[#276EF1] rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Set New Rate
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {apiResponse && (
        <UpdateWeighted 
          isOpen={showSuccessModal}
          onClose={handleCloseSuccessModal}
          apiResponse={apiResponse.data} // Pass the data object directly
          baseCurrency={baseCurrency}
          targetCurrency={targetCurrency}
        />
      )}

      {/* Spinner Styles */}
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
          background: #6b7280;
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