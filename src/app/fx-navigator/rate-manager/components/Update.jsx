import { useEffect, useState, useRef } from "react";
import Image from 'next/image';
import Table from './Table';
import closeIcon from '../../../../../public/fx/images/close.png';
import Update1 from './Update1'; 
import axios from 'axios';
import api from "../../../../utils/apiService"; // Update the path as needed


const Update = ({ isOpen, onClose }) => {
  const [isEditable, setIsEditable] = useState(false); 
  const [rateValue, setRateValue] = useState(null);
  const [weightedAverage, setWeightedAverage] = useState("0.10"); 
  const [isUpdate1Open, setIsUpdate1Open] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [baseCurrency, setBaseCurrency] = useState('GBP');
  const [targetCurrency, setTargetCurrency] = useState('KES');
  const [showBaseDropdown, setShowBaseDropdown] = useState(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);

  // Create refs for the dropdown containers
  const baseDropdownRef = useRef(null);
  const targetDropdownRef = useRef(null);
  const baseCurrencyButtonRef = useRef(null);
  const targetCurrencyButtonRef = useRef(null);

  // Base currency options (only GBP, USD, EUR, ZAR)
  const baseCurrencyOptions = [
    { code: 'GBP', name: 'GBP', country: 'GB' }, // British Pound Sterling
    { code: 'USD', name: 'USD', country: 'US' }, // United States Dollar
    { code: 'EUR', name: 'EUR', country: 'EU' }, // Euro (using EU flag)
    { code: 'ZAR', name: 'ZAR', country: 'ZA' }, // South African Rand
  ];

  // Target currency options (only KES, UGX, BIF)
  const targetCurrencyOptions = [
    { code: 'KES', name: 'KES', country: 'KE' }, // Kenyan Shilling
    // { code: 'UGX', name: 'UGX', country: 'UG' }, // Ugandan Shilling
    // { code: 'BIF', name: 'BIF', country: 'BI' }, // Burundian Franc
  ];

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Add click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // For base currency dropdown
      if (showBaseDropdown && 
          baseDropdownRef.current && 
          !baseDropdownRef.current.contains(event.target) &&
          !baseCurrencyButtonRef.current.contains(event.target)) {
        setShowBaseDropdown(false);
      }
      
      // For target currency dropdown
      if (showTargetDropdown && 
          targetDropdownRef.current && 
          !targetDropdownRef.current.contains(event.target) &&
          !targetCurrencyButtonRef.current.contains(event.target)) {
        setShowTargetDropdown(false);
      }
    };

    // Only add the event listener if dropdowns are open
    if (showBaseDropdown || showTargetDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBaseDropdown, showTargetDropdown]);

  // Fetch exchange rate when component mounts or when currencies change
  useEffect(() => {
    if (isOpen) {
      fetchExchangeRate();
    }
  }, [isOpen, baseCurrency, targetCurrency]);

  const fetchExchangeRate = async () => {
    setIsLoading(true);
    setError(null);
    setRateValue(null);
    try {
      const response = await api.get(
        '/treasury/temporal-exchange-rates',
        {
          params: {
            baseCurrency,
            targetCurrency
          }
        }
      );
      setRateValue(response.data.interBankRate.toString());
    } catch (err) {
      setError('Failed to fetch exchange rate. Please try again later.');
      console.error('Error fetching exchange rate:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRateClick = () => {
    if (rateValue) {
      setIsEditable(true); 
      setIsUpdate1Open(true); 
    }
  };

  const handleRateChange = (e) => {
    setRateValue(e.target.value); 
  };

  const handleRateBlur = () => {
    setIsEditable(false); 
  };

  const selectBaseCurrency = (currency) => {
    setBaseCurrency(currency.code);
    setShowBaseDropdown(false);
  };

  const selectTargetCurrency = (currency) => {
    setTargetCurrency(currency.code);
    setShowTargetDropdown(false);
  };

  const getFlagUrl = (countryCode) => {
    if (typeof countryCode === 'string') {
      return `https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`;
    }
    return '';
  };
  
  const getCurrentBaseCurrency = () => {
    return baseCurrencyOptions.find(c => c.code === baseCurrency);
  };

  const getCurrentTargetCurrency = () => {
    return targetCurrencyOptions.find(c => c.code === targetCurrency);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center font-poppins justify-end bg-black/30 bg-opacity-50 z-50">
      <div className="bg-[#F3F5F8] p-6 w-[740px] rounded-lg h-screen shadow-lg">
        <span className="justify-between">
          <span className="flex flex-col">
            <h2 className="text-xl font-bold mb-4">Tuma App Rates</h2>
          </span>

          <button className="absolute top-3 right-3" onClick={onClose}>
            <Image src={closeIcon} alt="Close Modal" width={30} height={35} />
          </button>
        </span>

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <p>Loading exchange rate...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        ) : null}

        {rateValue ? (
          <div className="bg-white rounded-xl items-center flex px-6 p-5">
            <p className="text-xl font-[700] mr-4">Current Bank Rate</p>
            <span className="border items-center flex rounded-lg px-3 py-2 relative">
              <h1 className="px-4 mr-2 text-[20px] font-semibold">1</h1>
              <span 
                ref={baseCurrencyButtonRef}
                className="px-2 rounded-lg flex gap-3 py-1 bg-[#F3F5F8] cursor-pointer"
                onClick={() => setShowBaseDropdown(!showBaseDropdown)}
              >
                {getCurrentBaseCurrency() && (
                  <>
                    <Image 
                      src={getFlagUrl(getCurrentBaseCurrency().country)} 
                      alt={getCurrentBaseCurrency().code} 
                      width={30} 
                      height={8} 
                      className="py-1 rounded-md"
                    />
                    <p className="ml-1 mr- text-[16px] font-500">{getCurrentBaseCurrency().code}</p>
                    <Image src="/fx/svgs/arrow.svg" alt="Arrow" width={16} height={20} />
                  </>
                )}
              </span>
              
              {showBaseDropdown && (
                <div 
                  ref={baseDropdownRef}
                  className="absolute top-11 right-0 z-10 bg-white border border-gray-300 rounded-lg shadow-lg w-32"
                >
                  {baseCurrencyOptions.map((currency) => (
                    <div 
                      key={currency.code}
                      className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => selectBaseCurrency(currency)}
                    >
                      <Image 
                        src={getFlagUrl(currency.country)} 
                        alt={currency.code} 
                        width={20} 
                        height={15} 
                        className="mr-2"
                      />
                      <span>{currency.code}</span>
                    </div>
                  ))}
                </div>
              )}
            </span>
            
            <p className="mx-5 text-gray-800 text-2xl font-[600]">=</p>
            
            <span className="border items-center flex rounded-lg px-3 py-2 relative">
              {isEditable ? (
                <input
                  type="text"
                  value={rateValue}
                  onChange={handleRateChange}
                  onBlur={handleRateBlur}
                  autoFocus
                  className="px-2 mr-2 text-2xl font-semibold outline-none"
                />
              ) : (
                <h1 className="px-2 mr-2 text-[20px] font-semibold cursor-pointer" onClick={handleRateClick}>
                  {rateValue}
                </h1>
              )}
              
              <span 
                ref={targetCurrencyButtonRef}
                className="px-2 rounded-lg flex gap-3 py-1 bg-[#F3F5F8] cursor-pointer"
                onClick={() => setShowTargetDropdown(!showTargetDropdown)}
              >
                {getCurrentTargetCurrency() && (
                  <>
                    <Image 
                      src={getFlagUrl(getCurrentTargetCurrency().country)} 
                      alt={getCurrentTargetCurrency().code} 
                      width={30} 
                      height={8}
                      className="py-2 rounded-md" 
                    />
                    <p className="ml-1 text-[20px] font-500">{getCurrentTargetCurrency().code}</p>
                    <Image src="/fx/svgs/arrow.svg" alt="Arrow" width={16} height={20} />
                  </>
                )}
              </span>
              
              {showTargetDropdown && (
                <div 
                  ref={targetDropdownRef}
                  className="absolute top-12 right-0 z-10 bg-white border border-gray-300 rounded-lg shadow-lg w-32"
                >
                  {targetCurrencyOptions.map((currency) => (
                    <div 
                      key={currency.code}
                      className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => selectTargetCurrency(currency)}
                    >
                      <Image 
                        src={getFlagUrl(currency.country)} 
                        alt={currency.code} 
                        width={20} 
                        height={15} 
                        className="mr-2"
                      />
                      <span>{currency.code}</span>
                    </div>
                  ))}
                </div>
              )}
            </span>
          </div>
        ) : !isLoading && !error ? (
          <div className="bg-white rounded-xl items-center flex px-6 p-5 justify-center">
            <p className="text-xl font-[700]">No exchange rate data available</p>
          </div>
        ) : null}

        {rateValue && (
          <>
            <div>
            <Table baseCurrency={baseCurrency} targetCurrency={targetCurrency} />
            </div>
          </>
        )}
      </div>
      <Update1
        isOpen={isUpdate1Open}
        onClose={() => setIsUpdate1Open(false)}
        rateValue={rateValue}
        onRateChange={handleRateChange}
        baseCurrency={getCurrentBaseCurrency()}
        targetCurrency={getCurrentTargetCurrency()}
        getFlagUrl={getFlagUrl}
      />
    </div>
  );
};

export default Update;