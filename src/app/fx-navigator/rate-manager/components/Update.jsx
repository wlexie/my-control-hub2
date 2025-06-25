import { useEffect, useState, useRef } from "react";
import Image from 'next/image';
import Table from './Table';
import closeIcon from '../../../../../public/fx/images/close.png';
import Update1 from './Update1'; 
import api from "../../../../utils/apiService";

const Update = ({ isOpen, onClose }) => {
  const [isEditable, setIsEditable] = useState(false);
  const [rateValue, setRateValue] = useState(null);
  const [isUpdate1Open, setIsUpdate1Open] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [baseCurrency, setBaseCurrency] = useState('GBP');
  const [targetCurrency, setTargetCurrency] = useState('KES');
  const [showBaseDropdown, setShowBaseDropdown] = useState(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  
  // New state to control the enter animation
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);

  const baseDropdownRef = useRef(null);
  const targetDropdownRef = useRef(null);
  const baseCurrencyButtonRef = useRef(null);
  const targetCurrencyButtonRef = useRef(null);

  const baseCurrencyOptions = [
    { code: 'GBP', name: 'GBP', country: 'GB' },
    { code: 'USD', name: 'USD', country: 'US' },
    { code: 'EUR', name: 'EUR', country: 'EU' },
    { code: 'ZAR', name: 'ZAR', country: 'ZA' },
  ];

  const targetCurrencyOptions = [
    { code: 'KES', name: 'KES', country: 'KE' },
  ];

  // Effect to trigger the animation
  useEffect(() => {
    if (isOpen) {
      // Set a tiny timeout to allow the component to render in its initial (hidden) state
      // before applying the class that makes it visible, triggering the animation.
      const timer = setTimeout(() => setIsAnimatingIn(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimatingIn(false); // Reset on close
    }
  }, [isOpen]);

  // Fetch exchange rate when component mounts or when currencies change
  useEffect(() => {
    if (isOpen) {
      fetchExchangeRate();
    }
  }, [isOpen, baseCurrency, targetCurrency]);
  
  // --- Other hooks and functions remain the same ---
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

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

  const fetchExchangeRate = async () => {
    setIsLoading(true);
    setError(null);
    setRateValue(null);
    try {
      const response = await api.get('/treasury/temporal-exchange-rates', { params: { baseCurrency, targetCurrency } });
      setRateValue(response.data.interBankRate.toString());
    } catch (err) {
      setError('Failed to fetch exchange rate. Please try again later.');
      console.error('Error fetching exchange rate:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRateClick = () => { if (rateValue) { setIsEditable(true); setIsUpdate1Open(true); } };
  const handleRateChange = (e) => { setRateValue(e.target.value); };
  const handleRateBlur = () => { setIsEditable(false); };
  const selectBaseCurrency = (currency) => { setBaseCurrency(currency.code); setShowBaseDropdown(false); };
  const selectTargetCurrency = (currency) => { setTargetCurrency(currency.code); setShowTargetDropdown(false); };
  const getFlagUrl = (countryCode) => typeof countryCode === 'string' ? `https://flagcdn.com/w20/${countryCode.toLowerCase()}.png` : '';
  const getCurrentBaseCurrency = () => baseCurrencyOptions.find(c => c.code === baseCurrency);
  const getCurrentTargetCurrency = () => targetCurrencyOptions.find(c => c.code === targetCurrency);


  if (!isOpen) return null;

  return (
    // Backdrop with opacity transition
    <div
      className={`fixed inset-0 flex font-poppins bg-black/30 z-50 transition-opacity duration-300
        ${isAnimatingIn ? 'opacity-100' : 'opacity-0'}
        items-end md:items-center justify-center md:justify-end`}
      onClick={onClose}
    >
      {/* Modal Panel with responsive transforms and styling */}
      <div
        className={`bg-[#F3F5F8]  transform transition-transform duration-500 ease-in-out
          w-full h-[90vh] rounded-t-2xl 
          md:w-[740px] md:h-screen md:rounded-t-none md:rounded-l-lg
          ${isAnimatingIn ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full'}`}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
      >
        <div className="p-6 h-full overflow-y-auto">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold mb-4">Tuma App Rates</h2>
              <button className="p-1 -mt-2 -mr-2" onClick={onClose}>
                <Image src={closeIcon} alt="Close Modal" width={30} height={35} />
              </button>
            </div>

            {/* Rest of your modal content remains the same */}
            {isLoading ? (
              <div className="flex justify-center items-center h-32"><p>Loading exchange rate...</p></div>
            ) : error ? (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"><p>{error}</p></div>
            ) : null}

            {rateValue ? (
              <div className="bg-white rounded-xl items-center flex flex-wrap px-4 py-3 md:px-6 md:p-5">
                <p className="text-lg md:text-xl font-[700] mr-4 w-full md:w-auto mb-2 md:mb-0">Interbank Rate</p>
                <span className="border items-center flex rounded-lg md:px-3 px-1 md:py-2 py-1 relative">
                  <h1 className="px-1 md:px-4 md:mr-2 mr-1 text-lg md:text-xl font-semibold">1</h1>
                  <span ref={baseCurrencyButtonRef} className="px-2 py-1 rounded-lg flex md:gap-3 gap-1  bg-[#F3F5F8] cursor-pointer" onClick={() => setShowBaseDropdown(!showBaseDropdown)}>
                    {getCurrentBaseCurrency() && (<>
                      <Image src={getFlagUrl(getCurrentBaseCurrency().country)} alt={getCurrentBaseCurrency().code} width={30} height={8} className="py-1 w-[18px] md:w-[22px] rounded-md" />
                      <p className="ml-1 mr- text-[13px] md:text-base font-medium">{getCurrentBaseCurrency().code}</p>
                      <Image src="/fx/svgs/arrow.svg" alt="Arrow" width={16} height={20} />
                    </>)}
                  </span>
                  {showBaseDropdown && (
                    <div ref={baseDropdownRef} className="absolute top-11 right-0 z-10 bg-white border border-gray-300 rounded-lg  w-32">
                      {baseCurrencyOptions.map((currency) => (
                        <div key={currency.code} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => selectBaseCurrency(currency)}>
                          <Image src={getFlagUrl(currency.country)} alt={currency.code} width={20} height={15} className="mr-2" />
                          <span>{currency.code}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </span>
                
                <p className="mx-2 md:mx-5 text-gray-800 text-2xl font-semibold">=</p>
                
                <span className="border items-center flex rounded-lg md:px-3 px-1 py-1 md:py-2 relative">
                  {isEditable ? (
                    <input type="text" value={rateValue} onChange={handleRateChange} onBlur={handleRateBlur} autoFocus className="px-2 mr-2 text-xl md:text-2xl font-semibold outline-none" />
                  ) : (
                    <h1 className="md:px-2 px-1 mr-1 text-lg md:text-xl font-semibold cursor-pointer" onClick={handleRateClick}>{rateValue}</h1>
                  )}
                  <span ref={targetCurrencyButtonRef} className=" p-1 rounded-lg flex md:gap-3 gap-1 
                   bg-[#F3F5F8] cursor-pointer" onClick={() => setShowTargetDropdown(!showTargetDropdown)}>
                    {getCurrentTargetCurrency() && (<>
                      <Image src={getFlagUrl(getCurrentTargetCurrency().country)} alt={getCurrentTargetCurrency().code}
                       width={30} height={8} className=" rounded-md w-[19px] md:w-[22px]" />
                      <p className="ml-1 text-[13px] md:text-base font-medium">{getCurrentTargetCurrency().code}</p>
                      <Image src="/fx/svgs/arrow.svg" alt="Arrow" width={16} height={20} />
                    </>)}
                  </span>
                  {showTargetDropdown && (
                    <div ref={targetDropdownRef} className="absolute top-12 right-0 z-10 bg-white border border-gray-300 rounded-lg shadow-lg w-32">
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
            ) : !isLoading && !error ? (
              <div className="bg-white rounded-xl items-center flex px-6 p-5 justify-center"><p className="text-xl font-semibold">No exchange rate data available</p></div>
            ) : null}

            {rateValue && (<div><Table baseCurrency={baseCurrency} targetCurrency={targetCurrency} /></div>)}
        </div>
      </div>
      
      {/* Update1 modal remains the same */}
      <Update1 isOpen={isUpdate1Open} onClose={() => setIsUpdate1Open(false)} rateValue={rateValue} onRateChange={handleRateChange} baseCurrency={getCurrentBaseCurrency()} targetCurrency={getCurrentTargetCurrency()} getFlagUrl={getFlagUrl}/>
    </div>
  );
};

export default Update;