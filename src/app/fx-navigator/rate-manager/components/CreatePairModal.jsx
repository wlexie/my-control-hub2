"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import axios from "axios";
import Image from "next/image";
import { ChevronDown, X } from "lucide-react";
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

// --- Helper Hooks ---
const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
};

// --- Hardcoded Currency Information ---
const getCountryCode = (currencyCode) => {
  if (currencyCode === 'EUR') return 'eu';
  return currencyCode.substring(0, 2).toLowerCase();
};

const ALL_CURRENCY_DATA = {
  GBP: { code: 'GBP', name: 'British Pound', flag: `https://flagcdn.com/w40/${getCountryCode('GBP')}.png` },
  USD: { code: 'USD', name: 'US Dollar', flag: `https://flagcdn.com/w40/${getCountryCode('USD')}.png` },
  EUR: { code: 'EUR', name: 'Euro', flag: `https://flagcdn.com/w40/${getCountryCode('EUR')}.png` },
  KES: { code: 'KES', name: 'Kenyan Shilling', flag: `https://flagcdn.com/w40/${getCountryCode('KES')}.png` },
  TZS: { code: 'TZS', name: 'Tanzanian Shilling', flag: `https://flagcdn.com/w40/${getCountryCode('TZS')}.png` },
  BIF: { code: 'BIF', name: 'Burundian Franc', flag: `https://flagcdn.com/w40/${getCountryCode('BIF')}.png` },
  GHS: { code: 'GHS', name: 'Ghanaian Cedi', flag: `https://flagcdn.com/w40/${getCountryCode('GHS')}.png` },
  SSP: { code: 'SSP', name: 'South Sudanese Pound', flag: `https://flagcdn.com/w40/${getCountryCode('SSP')}.png` },
  MWK: { code: 'MWK', name: 'Malawian Kwacha', flag: `https://flagcdn.com/w40/${getCountryCode('MWK')}.png` },
  UGX: { code: 'UGX', name: 'Ugandan Shilling', flag: `https://flagcdn.com/w40/${getCountryCode('UGX')}.png` },
  ETB: { code: 'ETB', name: 'Ethiopian Birr', flag: `https://flagcdn.com/w40/${getCountryCode('ETB')}.png` },
  RWF: { code: 'RWF', name: 'Rwandan Franc', flag: `https://flagcdn.com/w40/${getCountryCode('RWF')}.png` },
  ZAR: { code: 'ZAR', name: 'South African Rand', flag: `https://flagcdn.com/w40/${getCountryCode('ZAR')}.png` },
};    

// Updated Base Currencies to include KES
const FROM_CURRENCY_CODES = ["GBP", "USD", "EUR", "TZS", "KES"];
const TO_CURRENCY_CODES = ["GBP", "USD", "EUR", "KES", "TZS", "BIF", "GHS", "SSP", "MWK", "UGX", "ETB", "RWF", "ZAR"];

// --- Helper Component for Dropdown Items ---
const CurrencyListItem = memo(({ currency, onSelect }) => (
  <li onClick={onSelect} className="flex items-center w-full px-3 py-2 text-left cursor-pointer hover:bg-gray-50 transition-colors">
    <Image src={currency.flag} alt={currency.name} width={22} height={24} className="mr-3 rounded" />
    <span className="font-semibold">{currency.code}</span>
    <span className="text-gray-500 ml-2">- {currency.name}</span>
  </li>
));
CurrencyListItem.displayName = 'CurrencyListItem';

// --- Main Modal Component ---
const CreatePairModal = ({ isOpen, onClose }) => {
  const accessToken = useSelector((state) => state.auth.accessToken);

  const [fromCurrency, setFromCurrency] = useState(null);
  const [toCurrency, setToCurrency] = useState(null);
  const [rate, setRate] = useState(null);

  const [fromCurrenciesList, setFromCurrenciesList] = useState([]);
  const [toCurrenciesList, setToCurrenciesList] = useState([]);
  
  const [isRateLoading, setIsRateLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [apiMessage, setApiMessage] = useState(null);

  const [isFromDropdownOpen, setIsFromDropdownOpen] = useState(false);
  const [isToDropdownOpen, setIsToDropdownOpen] = useState(false);

  const fromDropdownRef = useRef(null);
  const toDropdownRef = useRef(null);

  useClickOutside(fromDropdownRef, () => setIsFromDropdownOpen(false));
  useClickOutside(toDropdownRef, () => setIsToDropdownOpen(false));

  useEffect(() => {
    if (isOpen) {
      setFromCurrency(null);
      setToCurrency(null);
      setRate(null);
      setApiMessage(null);
      setIsCreating(false);

      const fromList = FROM_CURRENCY_CODES.map(code => ALL_CURRENCY_DATA[code]).filter(Boolean);
      setFromCurrenciesList(fromList);

      const toList = TO_CURRENCY_CODES.map(code => ALL_CURRENCY_DATA[code]).filter(Boolean);
      setToCurrenciesList(toList);
    }
  }, [isOpen]);

  const fetchRate = useCallback(async (base, target) => {
    if (!accessToken || !base || !target) return;
    setIsRateLoading(true);
    setRate(null);
    try {
      const response = await axios.get(
        `http://tuma-dev-backend-alb-1553448571.us-east-1.elb.amazonaws.com/apitreasury/get-rates?currency=${base.code}`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      const rateData = response.data.find(r => r.receivingCurrency === target.code);
      
      // Fallback to 0 if rateData is missing
      setRate(rateData ? rateData.fxRate : 1);
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      // Fallback to 0 on error
      setRate(1);
    } finally {
      setIsRateLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    setApiMessage(null);
    if (fromCurrency && toCurrency) {
      if (fromCurrency.code === toCurrency.code) {
        setRate(1);
        setIsRateLoading(false);
      } else {
        fetchRate(fromCurrency, toCurrency);
      }
    }
  }, [fromCurrency, toCurrency, fetchRate]);

  const handleCreatePair = async () => {
    // 0 is now a valid value for submission
    if (!fromCurrency || !toCurrency || rate === null) {
      setApiMessage({ type: 'error', text: "Please select a valid currency pair." });
      return;
    }

    setIsCreating(true);
    setApiMessage(null);

    try {
      const params = new URLSearchParams({
        baseCurrency: fromCurrency.code,
        targetCurrency: toCurrency.code,
        rate: rate.toString(),
        // Active if rate is 0, otherwise Pending for approval
        status: Number(rate) === 0 ? "ACTIVE" : "PENDING"
      });

      const url = `http://tuma-dev-backend-alb-1553448571.us-east-1.elb.amazonaws.com/api/treasury/create-exchange-rate?${params.toString()}`;

      await axios.post(url, {}, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      setApiMessage({ 
        type: 'success', 
        text: Number(rate) === 0 
          ? 'Success! The pair has been created and activated.' 
          : 'Success! The new pair has been submitted for approval.' 
      });

      setTimeout(() => {
        onClose();
      }, 2500);

    } catch (error) {
      const message = error.response?.data?.message || "An unexpected server error occurred.";
      setApiMessage({ type: 'error', text: message });
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm font-poppins">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Currency Pair</h2>

        <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">From Currency (Base)</label>
            <div ref={fromDropdownRef} className="relative">
                <button onClick={() => setIsFromDropdownOpen(!isFromDropdownOpen)} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-blue-500 transition-all">
                    {fromCurrency ? <CurrencyListItem currency={fromCurrency} /> : <span className="text-gray-400">Select base currency</span>}
                    <ChevronDown size={20} className={`text-gray-400 transition-transform ${isFromDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isFromDropdownOpen && (
                    <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {fromCurrenciesList.map(currency => <CurrencyListItem key={currency.code} currency={currency} onSelect={() => { setFromCurrency(currency); setIsFromDropdownOpen(false); }} />)}
                    </ul>
                )}
            </div>
        </div>

        <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1">To Currency (Target)</label>
            <div ref={toDropdownRef} className="relative">
                <button onClick={() => setIsToDropdownOpen(!isToDropdownOpen)} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-blue-500 transition-all">
                    {toCurrency ? <CurrencyListItem currency={toCurrency} /> : <span className="text-gray-400">Select target currency</span>}
                    <ChevronDown size={20} className={`text-gray-400 transition-transform ${isToDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isToDropdownOpen && (
                    <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {toCurrenciesList.map((currency, index) => <CurrencyListItem key={`${currency.code}-${index}`} currency={currency} onSelect={() => { setToCurrency(currency); setIsToDropdownOpen(false); }} />)}
                    </ul>
                )}
            </div>
        </div>

        <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Exchange Rate</label>
            <div className="relative">
              <input 
                type="text" 
                readOnly 
                value={isRateLoading ? "Fetching..." : (rate !== null ? rate : "0")} 
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium cursor-default" 
              />
              {rate === 0 && !isRateLoading && (
                <span className="absolute right-3 top-3 text-[10px] bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-bold">FALLBACK</span>
              )}
            </div>
        </div>
        
        <div className="p-4 mb-6 bg-blue-50 border border-blue-200 rounded-lg flex items-start">
            <svg className="text-blue-500 mr-3 shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
            <p className="text-xs text-blue-700 leading-relaxed">
              Pairs with a rate of <span className="font-bold">0</span> will be activated automatically. All other pairs require administrative approval.
            </p>
        </div>

        {apiMessage && (
            <div className={`p-3 mb-4 text-sm rounded-lg animate-in slide-in-from-top-2 ${apiMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {apiMessage.text}
            </div>
        )}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          <button 
            onClick={handleCreatePair} 
            className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:bg-blue-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95" 
            disabled={rate === null || isRateLoading || isCreating}
          >
            {isCreating ? 'Processing...' : 'Create Pair'}
          </button>
        </div>
      </div>
    </div>
  );
};

CreatePairModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CreatePairModal;