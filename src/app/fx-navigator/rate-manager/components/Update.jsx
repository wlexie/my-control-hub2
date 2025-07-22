import { useEffect, useState, useRef } from "react";
import Image from 'next/image';
import Table from './Table';
import closeIcon from '../../../../../public/fx/images/close.png';
import Update1 from './Update1'; 
import api from "../../../../utils/apiService"; // Assuming this is your configured axios instance

const Update = ({ isOpen, onClose }) => {
  // --- State Management ---
  const [rateValue, setRateValue] = useState(null);
  const [baseCurrency, setBaseCurrency] = useState('GBP');
  const [targetCurrency, setTargetCurrency] = useState('KES');

  // State for the full list of rates from the API
  const [exchangeRateList, setExchangeRateList] = useState([]);
  
  // State for dynamic dropdown options
  const [baseCurrencyOptions, setBaseCurrencyOptions] = useState([]);
  const [targetCurrencyOptions, setTargetCurrencyOptions] = useState([]);

  // UI control states
  const [isEditable, setIsEditable] = useState(false);
  const [isUpdate1Open, setIsUpdate1Open] = useState(false);
  const [showBaseDropdown, setShowBaseDropdown] = useState(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  
  // Loading and Error states
  const [isListLoading, setIsListLoading] = useState(false); 
  const [listError, setListError] = useState(null);
  const [rateError, setRateError] = useState(null); 

  // Refs for closing dropdowns on outside click
  const baseDropdownRef = useRef(null);
  const targetDropdownRef = useRef(null);
  const baseCurrencyButtonRef = useRef(null);
  const targetCurrencyButtonRef = useRef(null);


  // --- Effects ---

  // Effect to control modal enter/exit animation
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsAnimatingIn(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimatingIn(false);
    }
  }, [isOpen]);

  // Effect to fetch the entire list of exchange rates when the modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchRateList = async () => {
        setIsListLoading(true);
        setListError(null);
        setExchangeRateList([]); // Clear previous list
        try {
          const response = await api.get('/treasury/exchange-rate-list');
          const rates = response.data;
          setExchangeRateList(rates);

          // Helper to create unique dropdown options from the fetched data
          const createOptions = (key) => {
            const uniqueCodes = [...new Set(rates.map(rate => rate[key]))];
            return uniqueCodes.map(code => ({
              code,
              name: code,
              country: code === 'EUR' ? 'EU' : code.substring(0, 2) // Infer country from code
            }));
          };

          setBaseCurrencyOptions(createOptions('baseCurrency'));
          setTargetCurrencyOptions(createOptions('targetCurrency'));

        } catch (err) {
          setListError('Failed to fetch available currency pairs.');
          console.error('Error fetching exchange rate list:', err);
        } finally {
          setIsListLoading(false);
        }
      };
      fetchRateList();
    }
  }, [isOpen]);

  // Effect to find and set the current rate from the list when currencies change
  useEffect(() => {
    // Only run if the list has been loaded
    if (baseCurrency && targetCurrency && exchangeRateList.length > 0) {
      setRateError(null);
      
      const matchingPair = exchangeRateList.find(
        rate => rate.baseCurrency === baseCurrency && rate.targetCurrency === targetCurrency
      );

      if (matchingPair) {
        // As requested, use the `currentRate` property from the API response
        setRateValue(matchingPair.currentRate.toString());
      } else {
        setRateValue(null);
        setRateError(`Rate for ${baseCurrency} to ${targetCurrency} is not available.`);
      }
    }
  }, [baseCurrency, targetCurrency, exchangeRateList]);
  
  // Effect to handle closing dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showBaseDropdown && baseDropdownRef.current && !baseDropdownRef.current.contains(event.target) && !baseCurrencyButtonRef.current.contains(event.target)) {
        setShowBaseDropdown(false);
      }
      if (showTargetDropdown && targetDropdownRef.current && !targetDropdownRef.current.contains(event.target) && !targetCurrencyButtonRef.current.contains(event.target)) {
        setShowTargetDropdown(false);
      }
    };
    if (showBaseDropdown || showTargetDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showBaseDropdown, showTargetDropdown]);

  // --- Handlers and Helper Functions ---
  
  const handleRateClick = () => { if (rateValue) { setIsEditable(true); setIsUpdate1Open(true); } };
  const handleRateChange = (e) => { setRateValue(e.target.value); };
  const handleRateBlur = () => { setIsEditable(false); };

  const selectBaseCurrency = (currency) => { setBaseCurrency(currency.code); setShowBaseDropdown(false); };
  const selectTargetCurrency = (currency) => { setTargetCurrency(currency.code); setShowTargetDropdown(false); };

  const getFlagUrl = (countryCode) => typeof countryCode === 'string' ? `https://flagcdn.com/w20/${countryCode.toLowerCase()}.png` : '';
  const getCurrentBaseCurrency = () => baseCurrencyOptions.find(c => c.code === baseCurrency);
  const getCurrentTargetCurrency = () => targetCurrencyOptions.find(c => c.code === targetCurrency);

  // --- Render Logic ---

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 flex font-poppins bg-black/30 z-50 transition-opacity duration-300 ${isAnimatingIn ? 'opacity-100' : 'opacity-0'} items-end md:items-center justify-center md:justify-end`}
      onClick={onClose}
    >
      <div
        className={`bg-[#F3F5F8] transform transition-transform duration-500 ease-in-out w-full h-[90vh] rounded-t-2xl md:w-[740px] md:h-screen md:rounded-t-none md:rounded-l-lg ${isAnimatingIn ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold mb-4">Tuma App Rates</h2>
            <button className="p-1 -mt-2 -mr-2" onClick={onClose}>
              <Image src={closeIcon} alt="Close Modal" width={30} height={35} />
            </button>
          </div>

          {/* === Main Content Area === */}
          {isListLoading ? (
            <div className="flex justify-center items-center h-32"><p>Loading available rates...</p></div>
          ) : listError ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"><p>{listError}</p></div>
          ) : (
            <>
              {rateValue !== null ? (
                <div className="bg-white rounded-xl items-center flex flex-wrap px-4 py-3 md:px-6 md:p-5">
                  <p className="text-lg md:text-xl font-[700] mr-4 w-full md:w-auto mb-2 md:mb-0">Interbank Rate</p>
                  
                  {/* Base Currency Dropdown */}
                  <span className="border items-center flex rounded-lg md:px-3 px-1 md:py-2 py-1 relative">
                    <h1 className="px-1 md:px-4 md:mr-2 mr-1 text-lg md:text-xl font-semibold">1</h1>
                    <span ref={baseCurrencyButtonRef} className="px-2 py-1 rounded-lg flex md:gap-3 gap-1 bg-[#F3F5F8] cursor-pointer" onClick={() => setShowBaseDropdown(!showBaseDropdown)}>
                      {getCurrentBaseCurrency() && (<>
                        <Image src={getFlagUrl(getCurrentBaseCurrency().country)} alt={getCurrentBaseCurrency().code} width={30} height={8} className="py-1 w-[12px] md:w-[18px] rounded-sm" />
                        <p className="ml-1 mr- text-[13px] md:text-base font-medium">{getCurrentBaseCurrency().code}</p>
                        <Image src="/fx/svgs/arrow.svg" alt="Arrow" width={16} height={20} />
                      </>)}
                    </span>
                    {showBaseDropdown && (
                      <div ref={baseDropdownRef} className="absolute top-11 right-0 z-10 bg-white border border-gray-300 rounded-lg w-32 max-h-60 overflow-y-auto">
                        {baseCurrencyOptions.map((currency) => (
                          <div key={currency.code} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => selectBaseCurrency(currency)}>
                            <Image src={getFlagUrl(currency.country)} alt={currency.code} width={20} height={15} className="mr-2 " />
                            <span>{currency.code}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </span>
                  
                  <p className="mx-2 md:mx-5 text-gray-800 text-2xl font-semibold">=</p>
                  
                  {/* Target Currency Dropdown */}
                  <span className="border items-center flex rounded-lg md:px-3 px-1 py-1 md:py-2 relative">
                    {isEditable ? (
                      <input type="text" value={rateValue} onChange={handleRateChange} onBlur={handleRateBlur} autoFocus className="px-2 mr-2 text-xl md:text-2xl font-semibold outline-none" />
                    ) : (
                      <h1 className="md:px-2 px-1 mr-1 text-lg md:text-xl font-semibold cursor-pointer" onClick={handleRateClick}>{rateValue}</h1>
                    )}
                    <span ref={targetCurrencyButtonRef} className="p-1 rounded-lg flex md:gap-3 gap-1 bg-[#F3F5F8] cursor-pointer" onClick={() => setShowTargetDropdown(!showTargetDropdown)}>
                      {getCurrentTargetCurrency() && (<>
                        <Image src={getFlagUrl(getCurrentTargetCurrency().country)} alt={getCurrentTargetCurrency().code} width={20} height={8} className="rounded-sm w-[12px] py-1 md:w-[18px] " />
                        <p className="ml-1 text-[13px] md:text-base font-medium">{getCurrentTargetCurrency().code}</p>
                        <Image src="/fx/svgs/arrow.svg" alt="Arrow" width={16} height={20} />
                      </>)}
                    </span>
                    {showTargetDropdown && (
                      <div ref={targetDropdownRef} className="absolute top-12 right-0 z-10 bg-white border border-gray-300 rounded-lg shadow-lg w-32 max-h-60 overflow-y-auto">
                        {targetCurrencyOptions.map((currency) => (
                          <div key={currency.code} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => selectTargetCurrency(currency)}>
                            <Image src={getFlagUrl(currency.country)} alt={currency.code} width={20} height={15} className="mr-2" />
                            <span>{currency.code}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </span>
                </div>
              ) : (
                 <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"><p>{rateError || "Select a currency pair to view the rate."}</p></div>
              )}

              {/* Conditionally render the table only if there is a valid rate */}
              {rateValue !== null && (
                <div><Table baseCurrency={baseCurrency} targetCurrency={targetCurrency} /></div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* The Update1 modal for editing remains unchanged */}
      <Update1 isOpen={isUpdate1Open} onClose={() => setIsUpdate1Open(false)} rateValue={rateValue} onRateChange={handleRateChange} baseCurrency={getCurrentBaseCurrency()} targetCurrency={getCurrentTargetCurrency()} getFlagUrl={getFlagUrl}/>
    </div>
  );
};

export default Update;