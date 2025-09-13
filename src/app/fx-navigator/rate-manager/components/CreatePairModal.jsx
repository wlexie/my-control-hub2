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
  SSP: { code: 'SSP', name: 'South Sudanese Pound', flag: `https://flagcdn.com/w40/${getCountryCode('SSP')}.png` },




};    

const FROM_CURRENCY_CODES = ["GBP", "USD", "EUR"];
const TO_CURRENCY_CODES = ["GBP", "USD", "EUR", "KES", "TZS", "BIF", "GHS", "SSP", "MWK", "UGX", "ETB", "RWF", "ZAR", "SSP"];

// --- Helper Component for Dropdown Items ---
const CurrencyListItem = memo(({ currency, onSelect }) => (
  <li onClick={onSelect} className="flex items-center w-full px-3 py-2 text-left cursor-pointer ">
    <Image src={currency.flag} alt={currency.name} width={22} height={24} className="mr-3 rounded" />
    <span className="font-semibold">{currency.code}</span>
    <span className="text-gray-500 ml-2">- {currency.name}</span>
  </li>
));
CurrencyListItem.displayName = 'CurrencyListItem';
CurrencyListItem.propTypes = {
  currency: PropTypes.shape({
    code: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    flag: PropTypes.string.isRequired,
  }).isRequired,
  onSelect: PropTypes.func,
};

// --- Main Modal Component ---
const CreatePairModal = ({ isOpen, onClose }) => {
  const accessToken = useSelector((state) => state.auth.accessToken);

  const [fromCurrency, setFromCurrency] = useState(null);
  const [toCurrency, setToCurrency] = useState(null);
  const [rate, setRate] = useState(null);

  const [fromCurrenciesList, setFromCurrenciesList] = useState([]);
  const [toCurrenciesList, setToCurrenciesList] = useState([]);
  
  const [isRateLoading, setIsRateLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false); // State for creation loading
  const [apiMessage, setApiMessage] = useState(null); // State for API success/error messages

  const [isFromDropdownOpen, setIsFromDropdownOpen] = useState(false);
  const [isToDropdownOpen, setIsToDropdownOpen] = useState(false);

  const fromDropdownRef = useRef(null);
  const toDropdownRef = useRef(null);

  useClickOutside(fromDropdownRef, () => setIsFromDropdownOpen(false));
  useClickOutside(toDropdownRef, () => setIsToDropdownOpen(false));

  useEffect(() => {
    if (isOpen) {
      // Reset everything when modal opens
      setFromCurrency(null);
      setToCurrency(null);
      setRate(null);
      setApiMessage(null);
      setIsCreating(false);

      const fromList = FROM_CURRENCY_CODES.map(code => ALL_CURRENCY_DATA[code]).filter(Boolean);
      setFromCurrenciesList(fromList);

      const toList = TO_CURRENCY_CODES.map(code => ALL_CURRENCY_DATA[code]).filter(Boolean);
      
      const drcCurrency = ALL_CURRENCY_DATA['USD'];
      if (drcCurrency && !toList.some(c => c.name.includes("Congo"))) {
        toList.push({ ...drcCurrency, name: "Congolese Franc (USD)" });
      }
      setToCurrenciesList(toList);
    }
  }, [isOpen]);

  const fetchRate = useCallback(async (base, target) => {
    if (!accessToken || !base || !target) return;
    setIsRateLoading(true);
    setRate(null);
    try {
      const response = await axios.get(
        `https://api.tuma-app.com/api/treasury/get-rates?currency=${base.code}`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      const rateData = response.data.find(r => r.receivingCurrency === target.code);
      setRate(rateData ? rateData.fxRate : "N/A");
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      setRate("Error");
    } finally {
      setIsRateLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    setApiMessage(null); // Clear previous messages when selections change
    if (fromCurrency && toCurrency) {
      if (fromCurrency.code === toCurrency.code) {
        setRate(1);
        setIsRateLoading(false);
      } else {
        fetchRate(fromCurrency, toCurrency);
      }
    }
  }, [fromCurrency, toCurrency, fetchRate]);

  // --- FULLY IMPLEMENTED PAIR CREATION LOGIC ---
  const handleCreatePair = async () => {
    if (!fromCurrency || !toCurrency || !rate || rate === "N/A") {
      setApiMessage({ type: 'error', text: "Please select a valid currency pair with an available rate." });
      return;
    }

    setIsCreating(true);
    setApiMessage(null);

    try {
      const params = new URLSearchParams({
        baseCurrency: fromCurrency.code,
        targetCurrency: toCurrency.code,
        rate: rate,
      });

      const url = `https://api.tuma-app.com/api/treasury/create-exchange-rate?${params.toString()}`;

      await axios.post(url, {}, { // Empty body as params are in URL
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      setApiMessage({ type: 'success', text: 'Success! The new pair has been submitted for approval.' });

      setTimeout(() => {
        onClose(); // Close the modal after a short delay on success
      }, 2500);

    } catch (error) {
      if (error.response) {
        // Display the specific message from the API (e.g., "Exchange rate... already exists")
        const message = error.response.data?.message || "An unexpected server error occurred.";
        setApiMessage({ type: 'error', text: message });
        console.error("API Error creating pair:", error.response.data);
      } else {
        setApiMessage({ type: 'error', text: "Network error. Please try again." });
        console.error("Network Error creating pair:", error);
      }
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  // --- JSX includes new API Message display and updated button logic ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 bg-opacity-50 font-poppins">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Currency Pair</h2>

        {/* Form elements ... */}
        <div className="mb-4">
            <label className="block text-[16px] font-medium text-gray-700 mb-1">From Currency</label>
            <div ref={fromDropdownRef} className="relative">
                <button onClick={() => setIsFromDropdownOpen(!isFromDropdownOpen)} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-left">
                    {fromCurrency ? <CurrencyListItem currency={fromCurrency} /> : "Select currency"}
                    <ChevronDown className={`transition-transform ${isFromDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isFromDropdownOpen && (
                    <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {fromCurrenciesList.map(currency => <CurrencyListItem key={currency.code} currency={currency} onSelect={() => { setFromCurrency(currency); setIsFromDropdownOpen(false); }} />)}
                    </ul>
                )}
            </div>
        </div>

        <div className="mb-6">
            <label className="block text-[16px] font-medium text-gray-700 mb-1">To Currency</label>
            <div ref={toDropdownRef} className="relative">
                <button onClick={() => setIsToDropdownOpen(!isToDropdownOpen)} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-left">
                    {toCurrency ? <CurrencyListItem currency={toCurrency} /> : "Select currency"}
                    <ChevronDown className={`transition-transform ${isToDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isToDropdownOpen && (
                    <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {toCurrenciesList.map((currency, index) => <CurrencyListItem key={`${currency.code}-${index}`} currency={currency} onSelect={() => { setToCurrency(currency); setIsToDropdownOpen(false); }} />)}
                    </ul>
                )}
            </div>
        </div>

        <div className="mb-6">
            <label className="block text-[16px] font-medium text-gray-700 mb-1">Rate</label>
            <input type="text" readOnly value={isRateLoading ? "Fetching rate..." : (rate !== null ? rate : "Select currencies to see rate")} className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed" />
        </div>
        
        <div className="p-4 mb-6 bg-blue-50 border border-blue-200 rounded-lg flex items-start">
            <svg className="text-blue-500 mr-3 shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
            <p className="text-sm text-blue-700">New currency pairs need to be approved before they can be used in the system. Our team will review and activate within 24 hours.</p>
        </div>

        {/* API Message Display Area */}
        {apiMessage && (
            <div className={`p-3 mb-4 text-sm rounded-lg ${apiMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {apiMessage.text}
            </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition">Cancel</button>
          <button 
            onClick={handleCreatePair} 
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed" 
            disabled={!rate || rate === "N/A" || isRateLoading || isCreating}
          >
            {isCreating ? 'Creating...' : 'Create Pair'}
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